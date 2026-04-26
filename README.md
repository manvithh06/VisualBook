# VisualBook 📊

> Drop any CSV. Get instant visual intelligence.

VisualBook is an intelligent CSV analytics platform that automatically analyzes your dataset, infers column types, detects relationships, and generates the most appropriate interactive visualizations — all in seconds.

---

## ✨ Features

- **Smart Column Inference** — auto-detects numeric, categorical, datetime, boolean, and high-cardinality columns
- **14 Chart Types** — histograms, scatter plots, 3D charts, heatmaps, violin plots, treemaps and more
- **Zero Config** — upload any CSV and get a full dashboard instantly
- **Interactive Charts** — powered by Plotly.js with dark theme, fullscreen mode, and PNG download
- **Correlation Analysis** — Pearson correlation matrix, skewness, kurtosis, outlier detection
- **Missing Data Visualization** — see exactly where your data has gaps

---

## 🗂️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + Tailwind CSS v3 |
| Charts | Plotly.js + react-plotly.js |
| Backend | FastAPI (Python) |
| Analysis | Pandas, NumPy, SciPy, scikit-learn |
| HTTP | Axios |

---

## 🚀 Quick Start

### 1. Clone / unzip the project

```bash
cd visualbook
```

### 2. Backend Setup

```powershell
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\Activate.ps1

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload
```

Backend runs at → `http://localhost:8000`

### 3. Frontend Setup

```powershell
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at → `http://localhost:5173`

---

## 📁 Project Structure

```
visualbook/
├── backend/
│   ├── main.py          # FastAPI app + POST /api/analyze endpoint
│   ├── analyzer.py      # DatasetAnalyzer — type inference + plot decision engine
│   ├── plotter.py       # 14 Plotly chart generator functions
│   ├── utils.py         # Data cleaning, outlier detection, rolling trend
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Top navigation bar
│   │   │   ├── UploadZone.jsx      # Drag-and-drop CSV uploader
│   │   │   ├── DatasetSummary.jsx  # Metric cards + column details table
│   │   │   ├── PlotGrid.jsx        # Responsive 2-col chart grid
│   │   │   ├── PlotCard.jsx        # Individual chart with actions
│   │   │   └── Sidebar.jsx         # Left nav with plot list
│   │   ├── pages/
│   │   │   ├── Home.jsx            # Landing + upload page
│   │   │   └── Dashboard.jsx       # Main analytics dashboard
│   │   ├── context/
│   │   │   └── DataContext.jsx     # Global state management
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── .env.example
└── README.md
```

---

## 🔌 API

### `POST /api/analyze`

Upload a CSV file and receive full analysis + plot data.

**Request:**
```
Content-Type: multipart/form-data
Body: file=<your_file.csv>
```

**Response:**
```json
{
  "summary": {
    "filename": "sales.csv",
    "rows": 1500,
    "columns": 12,
    "numeric_count": 7,
    "categorical_count": 4,
    "total_missing_pct": 2.3,
    "column_info": [...],
    "descriptive_stats": {...},
    "correlation_matrix": {...}
  },
  "plots": [
    {
      "plot_id": "hist_age",
      "plot_type": "histogram",
      "title": "Distribution of Age",
      "description": "...",
      "priority": 1,
      "plotly_json": "{...}"
    }
  ]
}
```

**Limits:**
- Max file size: 50MB
- Accepted format: `.csv` only

---

## 🧪 Test with Sample CSV

```powershell
curl -X POST http://localhost:8000/api/analyze -F "file=@your_data.csv"
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` in the frontend folder:

```
VITE_API_URL=http://localhost:8000
```

---

## 🏗️ Build for Production

```powershell
# Frontend
cd frontend
npm run build        # outputs to frontend/dist/

# Backend — run with production server
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```