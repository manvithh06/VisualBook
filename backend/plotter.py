import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import plotly.figure_factory as ff
from utils import compute_rolling_trend

DARK_TEMPLATE = "plotly_dark"
ACCENT = "#7c3aed"
COLOR_SEQ = px.colors.qualitative.Vivid


def _apply_dark_layout(fig, title: str = "") -> go.Figure:
    fig.update_layout(
        template=DARK_TEMPLATE,
        title=dict(text=title, font=dict(size=16, color="#e2e8f0")),
        paper_bgcolor="#1a1a1a",
        plot_bgcolor="#1a1a1a",
        font=dict(color="#cbd5e1", family="Inter, sans-serif"),
        margin=dict(l=40, r=40, t=60, b=40),
        legend=dict(bgcolor="rgba(0,0,0,0)", bordercolor="rgba(255,255,255,0.1)"),
    )
    return fig


# ─────────────────────────────────────────────────────────────────────────────
# 1. BAR CHART
# ─────────────────────────────────────────────────────────────────────────────
def plot_bar(df: pd.DataFrame, spec: dict) -> str:
    col = spec["x_col"]
    counts = df[col].value_counts().head(15).reset_index()
    counts.columns = [col, "count"]

    fig = px.bar(
        counts, x=col, y="count",
        color="count",
        color_continuous_scale=[[0, "#4c1d95"], [1, "#7c3aed"]],
        labels={"count": "Count"},
    )
    fig.update_traces(marker_line_width=0)
    fig.update_coloraxes(showscale=False)
    _apply_dark_layout(fig, spec["title"])
    return fig.to_json()


# ─────────────────────────────────────────────────────────────────────────────
# 2. PIE CHART
# ─────────────────────────────────────────────────────────────────────────────
def plot_pie(df: pd.DataFrame, spec: dict) -> str:
    col = spec["x_col"]
    counts = df[col].value_counts().head(8)

    fig = px.pie(
        values=counts.values,
        names=counts.index.astype(str),
        color_discrete_sequence=COLOR_SEQ,
        hole=0.35,
    )
    fig.update_traces(textposition="inside", textinfo="percent+label")
    _apply_dark_layout(fig, spec["title"])
    return fig.to_json()


# ─────────────────────────────────────────────────────────────────────────────
# 3. HISTOGRAM
# ─────────────────────────────────────────────────────────────────────────────
def plot_histogram(df: pd.DataFrame, spec: dict) -> str:
    col = spec["x_col"]
    series = df[col].dropna()

    fig = px.histogram(
        df, x=col,
        nbins=min(50, max(10, len(series) // 5)),
        color_discrete_sequence=[ACCENT],
        marginal="box",
    )
    fig.update_traces(marker_line_width=0.5, marker_line_color="#0f0f0f")
    _apply_dark_layout(fig, spec["title"])
    return fig.to_json()


# ─────────────────────────────────────────────────────────────────────────────
# 4. BOX PLOT
# ─────────────────────────────────────────────────────────────────────────────
def plot_box(df: pd.DataFrame, spec: dict) -> str:
    x_col = spec.get("x_col")
    y_col = spec.get("y_col")

    if x_col and y_col:
        # Grouped box plot: categorical x, numeric y
        fig = px.box(
            df, x=x_col, y=y_col,
            color=x_col,
            color_discrete_sequence=COLOR_SEQ,
            notched=False,
        )
    else:
        # Single column box
        col = y_col or x_col
        fig = px.box(
            df, y=col,
            color_discrete_sequence=[ACCENT],
            points="outliers",
        )

    _apply_dark_layout(fig, spec["title"])
    return fig.to_json()


# ─────────────────────────────────────────────────────────────────────────────
# 5. SCATTER PLOT
# ─────────────────────────────────────────────────────────────────────────────
def plot_scatter(df: pd.DataFrame, spec: dict) -> str:
    x_col = spec["x_col"]
    y_col = spec["y_col"]
    color_col = spec.get("color_col")

    kwargs = dict(x=x_col, y=y_col, opacity=0.75, trendline="ols")
    if color_col and color_col in df.columns:
        kwargs["color"] = color_col
        kwargs["color_discrete_sequence"] = COLOR_SEQ
    else:
        kwargs["color_discrete_sequence"] = [ACCENT]

    fig = px.scatter(df, **kwargs)
    _apply_dark_layout(fig, spec["title"])
    return fig.to_json()


# ─────────────────────────────────────────────────────────────────────────────
# 6. CORRELATION HEATMAP
# ─────────────────────────────────────────────────────────────────────────────
def plot_heatmap(df: pd.DataFrame, spec: dict) -> str:
    numeric_df = df.select_dtypes(include="number")
    corr = numeric_df.corr().round(2)

    fig = go.Figure(data=go.Heatmap(
        z=corr.values,
        x=corr.columns.tolist(),
        y=corr.index.tolist(),
        colorscale=[[0, "#1e1b4b"], [0.5, "#6d28d9"], [1, "#a78bfa"]],
        zmin=-1, zmax=1,
        text=corr.values.round(2),
        texttemplate="%{text}",
        textfont=dict(size=11),
        hoverongaps=False,
    ))
    _apply_dark_layout(fig, spec["title"])
    return fig.to_json()


# ─────────────────────────────────────────────────────────────────────────────
# 7. 3D SCATTER
# ─────────────────────────────────────────────────────────────────────────────
def plot_3d_scatter(df: pd.DataFrame, spec: dict) -> str:
    x_col = spec["x_col"]
    y_col = spec["y_col"]
    z_col = spec["z_col"]
    color_col = spec.get("color_col")

    kwargs = dict(x=x_col, y=y_col, z=z_col, opacity=0.8)
    if color_col and color_col in df.columns:
        kwargs["color"] = color_col
        kwargs["color_discrete_sequence"] = COLOR_SEQ
    else:
        kwargs["color_discrete_sequence"] = [ACCENT]

    fig = px.scatter_3d(df, **kwargs)
    fig.update_traces(marker=dict(size=4))
    _apply_dark_layout(fig, spec["title"])
    return fig.to_json()


# ─────────────────────────────────────────────────────────────────────────────
# 8. LINE CHART
# ─────────────────────────────────────────────────────────────────────────────
def plot_line(df: pd.DataFrame, spec: dict) -> str:
    x_col = spec["x_col"]
    y_col = spec["y_col"]

    plot_df = df[[x_col, y_col]].dropna().sort_values(x_col)
    rolling = compute_rolling_trend(plot_df[y_col], window=max(3, len(plot_df) // 10))

    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=plot_df[x_col], y=plot_df[y_col],
        mode="lines+markers",
        name=y_col,
        line=dict(color=ACCENT, width=2),
        marker=dict(size=4),
    ))
    fig.add_trace(go.Scatter(
        x=plot_df[x_col], y=rolling,
        mode="lines",
        name="Trend (rolling avg)",
        line=dict(color="#a78bfa", width=2, dash="dash"),
    ))
    _apply_dark_layout(fig, spec["title"])
    return fig.to_json()


# ─────────────────────────────────────────────────────────────────────────────
# 9. AREA CHART
# ─────────────────────────────────────────────────────────────────────────────
def plot_area(df: pd.DataFrame, spec: dict) -> str:
    x_col = spec["x_col"]
    y_col = spec["y_col"]

    plot_df = df[[x_col, y_col]].dropna().sort_values(x_col)

    fig = px.area(
        plot_df, x=x_col, y=y_col,
        color_discrete_sequence=[ACCENT],
    )
    fig.update_traces(
        fillcolor="rgba(124, 58, 237, 0.2)",
        line=dict(color=ACCENT, width=2),
    )
    _apply_dark_layout(fig, spec["title"])
    return fig.to_json()


# ─────────────────────────────────────────────────────────────────────────────
# 10. VIOLIN PLOT
# ─────────────────────────────────────────────────────────────────────────────
def plot_violin(df: pd.DataFrame, spec: dict) -> str:
    col = spec.get("x_col") or spec.get("y_col")

    fig = px.violin(
        df, y=col,
        box=True,
        points="outliers",
        color_discrete_sequence=[ACCENT],
    )
    _apply_dark_layout(fig, spec["title"])
    return fig.to_json()


# ─────────────────────────────────────────────────────────────────────────────
# 11. BUBBLE CHART
# ─────────────────────────────────────────────────────────────────────────────
def plot_bubble(df: pd.DataFrame, spec: dict) -> str:
    x_col = spec["x_col"]
    y_col = spec["y_col"]
    z_col = spec["z_col"]
    color_col = spec.get("color_col")

    kwargs = dict(x=x_col, y=y_col, size=z_col, opacity=0.7, size_max=40)
    if color_col and color_col in df.columns:
        kwargs["color"] = color_col
        kwargs["color_discrete_sequence"] = COLOR_SEQ
    else:
        kwargs["color"] = z_col
        kwargs["color_continuous_scale"] = [[0, "#4c1d95"], [1, "#a78bfa"]]

    plot_df = df[[x_col, y_col, z_col] + ([color_col] if color_col and color_col in df.columns else [])].dropna()
    # Ensure size column is positive
    plot_df = plot_df[plot_df[z_col] > 0]

    fig = px.scatter(plot_df, **kwargs)
    _apply_dark_layout(fig, spec["title"])
    return fig.to_json()


# ─────────────────────────────────────────────────────────────────────────────
# 12. PAIRPLOT (Scatter Matrix)
# ─────────────────────────────────────────────────────────────────────────────
def plot_pairplot(df: pd.DataFrame, spec: dict) -> str:
    numeric_cols = df.select_dtypes(include="number").columns.tolist()[:6]  # cap at 6

    # Check if there's a categorical col for color
    cat_cols = [c for c in df.columns if df[c].dtype == "object" and df[c].nunique() < 10]
    color_col = cat_cols[0] if cat_cols else None

    kwargs = dict(dimensions=numeric_cols, opacity=0.6)
    if color_col:
        kwargs["color"] = color_col
        kwargs["color_discrete_sequence"] = COLOR_SEQ
    else:
        kwargs["color_discrete_sequence"] = [ACCENT]

    fig = px.scatter_matrix(df, **kwargs)
    fig.update_traces(
        diagonal_visible=True,
        marker=dict(size=3),
        showupperhalf=False,
    )
    _apply_dark_layout(fig, spec["title"])
    fig.update_layout(height=600)
    return fig.to_json()


# ─────────────────────────────────────────────────────────────────────────────
# 13. TREEMAP
# ─────────────────────────────────────────────────────────────────────────────
def plot_treemap(df: pd.DataFrame, spec: dict) -> str:
    col = spec["x_col"]
    counts = df[col].value_counts().head(20).reset_index()
    counts.columns = [col, "count"]

    fig = px.treemap(
        counts,
        path=[col],
        values="count",
        color="count",
        color_continuous_scale=[[0, "#4c1d95"], [0.5, "#7c3aed"], [1, "#a78bfa"]],
    )
    fig.update_traces(textinfo="label+percent root")
    _apply_dark_layout(fig, spec["title"])
    return fig.to_json()


# ─────────────────────────────────────────────────────────────────────────────
# 14. MISSING VALUES HEATMAP
# ─────────────────────────────────────────────────────────────────────────────
def plot_missing_heatmap(df: pd.DataFrame, spec: dict) -> str:
    missing_matrix = df.isnull().astype(int)

    # Sample rows if too large
    if len(missing_matrix) > 200:
        missing_matrix = missing_matrix.sample(200, random_state=42)

    fig = go.Figure(data=go.Heatmap(
        z=missing_matrix.values.T,
        x=[str(i) for i in missing_matrix.index],
        y=missing_matrix.columns.tolist(),
        colorscale=[[0, "#1e1b4b"], [1, "#7c3aed"]],
        showscale=False,
        hovertemplate="Row %{x}<br>%{y}: %{z}<extra></extra>",
    ))
    fig.update_layout(
        xaxis=dict(title="Row Index", showticklabels=False),
        yaxis=dict(title="Column"),
    )
    _apply_dark_layout(fig, spec["title"])
    return fig.to_json()


# ─────────────────────────────────────────────────────────────────────────────
# DISPATCHER
# ─────────────────────────────────────────────────────────────────────────────
PLOT_FUNCTIONS = {
    "bar":           plot_bar,
    "pie":           plot_pie,
    "histogram":     plot_histogram,
    "box":           plot_box,
    "scatter":       plot_scatter,
    "heatmap":       plot_heatmap,
    "3d_scatter":    plot_3d_scatter,
    "line":          plot_line,
    "area":          plot_area,
    "violin":        plot_violin,
    "bubble":        plot_bubble,
    "pairplot":      plot_pairplot,
    "treemap":       plot_treemap,
    "missing_heatmap": plot_missing_heatmap,
}


def generate_plot(df: pd.DataFrame, spec: dict) -> str | None:
    """
    Dispatch to correct plot function based on spec['plot_type'].
    Returns Plotly JSON string or None on failure.
    """
    plot_type = spec.get("plot_type")
    fn = PLOT_FUNCTIONS.get(plot_type)
    if fn is None:
        return None
    try:
        return fn(df, spec)
    except Exception as e:
        print(f"[plotter] ERROR generating {plot_type} ({spec.get('plot_id')}): {e}")
        return None