from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import io
import json

from analyzer import DatasetAnalyzer
from plotter import generate_plot
from database import save_user, get_all_users

app = FastAPI(title="VisualBook API", version="1.0.0")

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE_MB = 50


# ── User model ────────────────────────────────────────────────────────────────
class UserPayload(BaseModel):
    uid:          str
    email:        str  = ""
    display_name: str  = ""
    photo_url:    str  = ""
    provider:     str  = "email"


# ── HEALTH CHECK ──────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "VisualBook API is running"}


# ── USER ROUTES ───────────────────────────────────────────────────────────────
@app.post("/api/users/login")
def user_login(user: UserPayload):
    saved = save_user(user.dict())
    return {"status": "ok", "saved": saved}

@app.get("/api/users")
def list_users():
    return {"users": get_all_users()}


# ── MAIN ENDPOINT ─────────────────────────────────────────────────────────────
@app.post("/api/analyze")
async def analyze_csv(file: UploadFile = File(...)):
    # 1. Validate file type
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are accepted.")

    # 2. Read raw bytes
    raw = await file.read()

    # 3. Check file size
    size_mb = len(raw) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({size_mb:.1f} MB). Max allowed: {MAX_FILE_SIZE_MB} MB."
        )

    # 4. Parse CSV
    try:
        df = pd.read_csv(io.BytesIO(raw))
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse CSV: {str(e)}")

    if df.empty or len(df.columns) == 0:
        raise HTTPException(status_code=422, detail="CSV file is empty or has no columns.")

    # 5. Analyze dataset
    try:
        analyzer = DatasetAnalyzer(df, filename=file.filename)
        result = analyzer.analyze()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    clean_df   = result["dataframe"]
    plot_specs = result["plot_specs"]
    summary    = result["summary"]

    # 6. Generate all plots
    plots_output = []
    for spec in plot_specs:
        plotly_json = generate_plot(clean_df, spec)
        if plotly_json is None:
            continue  # skip failed plots silently

        plots_output.append({
            "plot_id":     spec["plot_id"],
            "plot_type":   spec["plot_type"],
            "title":       spec["title"],
            "description": spec["description"],
            "priority":    spec["priority"],
            "x_col":       spec.get("x_col"),
            "y_col":       spec.get("y_col"),
            "z_col":       spec.get("z_col"),
            "color_col":   spec.get("color_col"),
            "plotly_json": plotly_json,   # raw Plotly JSON string
        })

    # 7. Return final response
    return {
        "summary": summary,
        "plots":   plots_output,
    }