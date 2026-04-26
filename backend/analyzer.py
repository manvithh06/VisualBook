import pandas as pd
import numpy as np
from typing import Any
from utils import clean_dataframe, detect_outliers, safe_json_value
class DatasetAnalyzer:
    """
    Analyzes a CSV dataframe and produces:
    1. A full dataset summary (types, stats, correlations, etc.)
    2. A prioritized list of plot specifications
    """

    CATEGORICAL_UNIQUE_THRESHOLD = 20
    PIE_UNIQUE_THRESHOLD = 8

    def __init__(self, df: pd.DataFrame, filename: str = "dataset.csv"):
        self.raw_df = df
        self.df = clean_dataframe(df.copy())
        self.filename = filename
        self.col_types: dict[str, str] = {}
        self._infer_column_types()

    # ------------------------------------------------------------------ #
    # 1. COLUMN TYPE INFERENCE
    # ------------------------------------------------------------------ #

    def _infer_column_types(self):
        for col in self.df.columns:
            series = self.df[col]
            n_unique = series.nunique(dropna=True)

            if pd.api.types.is_datetime64_any_dtype(series):
                self.col_types[col] = "datetime"
            elif n_unique == 2:
                self.col_types[col] = "boolean"
            elif pd.api.types.is_numeric_dtype(series):
                self.col_types[col] = "numeric"
            elif pd.api.types.is_object_dtype(series):
                # Try casting to numeric
                converted = pd.to_numeric(series, errors="coerce")
                if converted.notna().sum() > len(series) * 0.8:
                    self.df[col] = converted
                    self.col_types[col] = "numeric"
                elif n_unique < self.CATEGORICAL_UNIQUE_THRESHOLD:
                    self.col_types[col] = "categorical"
                else:
                    self.col_types[col] = "high_cardinality"
            else:
                self.col_types[col] = "categorical"

    # ------------------------------------------------------------------ #
    # 2. SUMMARY BUILDERS
    # ------------------------------------------------------------------ #

    def _cols_of_type(self, *types) -> list[str]:
        return [c for c, t in self.col_types.items() if t in types]

    def _missing_summary(self) -> dict:
        missing = {}
        for col in self.df.columns:
            count = int(self.df[col].isna().sum())
            pct = round(count / len(self.df) * 100, 2) if len(self.df) > 0 else 0.0
            missing[col] = {"count": count, "percentage": pct}
        return missing

    def _descriptive_stats(self) -> dict:
        numeric_cols = self._cols_of_type("numeric")
        stats = {}
        for col in numeric_cols:
            s = self.df[col].dropna()
            stats[col] = {
                "mean":   safe_json_value(s.mean()),
                "median": safe_json_value(s.median()),
                "std":    safe_json_value(s.std()),
                "min":    safe_json_value(s.min()),
                "max":    safe_json_value(s.max()),
                "q1":     safe_json_value(s.quantile(0.25)),
                "q3":     safe_json_value(s.quantile(0.75)),
                "skewness": safe_json_value(s.skew()),
                "kurtosis": safe_json_value(s.kurt()),
                "outliers": detect_outliers(s),
            }
        return stats

    def _value_counts(self) -> dict:
        cat_cols = self._cols_of_type("categorical", "boolean")
        result = {}
        for col in cat_cols:
            vc = self.df[col].value_counts().head(10)
            result[col] = {str(k): int(v) for k, v in vc.items()}
        return result

    def _correlation_matrix(self) -> dict:
        numeric_cols = self._cols_of_type("numeric")
        if len(numeric_cols) < 2:
            return {}
        corr = self.df[numeric_cols].corr().round(3)
        return {
            col: {r: safe_json_value(corr.loc[r, col]) for r in corr.index}
            for col in corr.columns
        }

    def _column_info(self) -> list[dict]:
        info = []
        for col in self.df.columns:
            s = self.df[col]
            entry: dict[str, Any] = {
                "name": col,
                "type": self.col_types[col],
                "unique_count": int(s.nunique(dropna=True)),
                "missing_count": int(s.isna().sum()),
                "missing_pct": round(s.isna().sum() / len(self.df) * 100, 2),
            }
            # Add representative value
            if self.col_types[col] == "numeric":
                entry["mean"] = safe_json_value(s.mean())
            elif self.col_types[col] in ("categorical", "boolean"):
                top = s.value_counts().idxmax() if s.notna().any() else None
                entry["top_value"] = str(top) if top is not None else None
            info.append(entry)
        return info

    # ------------------------------------------------------------------ #
    # 3. PLOT DECISION ENGINE
    # ------------------------------------------------------------------ #

    def _make_plot(self, plot_id, plot_type, title, description, priority,
                   x_col=None, y_col=None, z_col=None, color_col=None) -> dict:
        return {
            "plot_id":     plot_id,
            "plot_type":   plot_type,
            "title":       title,
            "x_col":       x_col,
            "y_col":       y_col,
            "z_col":       z_col,
            "color_col":   color_col,
            "description": description,
            "priority":    priority,
        }

    def _generate_plot_specs(self) -> list[dict]:
        plots = []
        num_cols  = self._cols_of_type("numeric")
        cat_cols  = self._cols_of_type("categorical", "boolean")
        date_cols = self._cols_of_type("datetime")
        all_cols  = self.df.columns.tolist()
        has_missing = any(self.df[c].isna().any() for c in all_cols)

        priority = 1  # We'll assign manually per insight value

        # ── Categorical plots ──────────────────────────────────────────
        for cat in cat_cols[:3]:  # limit to first 3 cat cols
            n_unique = self.df[cat].nunique()

            plots.append(self._make_plot(
                f"bar_{cat}", "bar",
                f"Top Categories in {cat}",
                f"'{cat}' is categorical — bar chart shows the most frequent values.",
                priority=2, x_col=cat
            ))

            if n_unique <= self.PIE_UNIQUE_THRESHOLD:
                plots.append(self._make_plot(
                    f"pie_{cat}", "pie",
                    f"Proportion of {cat}",
                    f"'{cat}' has {n_unique} unique values — pie chart shows share of each.",
                    priority=3, x_col=cat
                ))

            # Categorical + numeric grouped plots
            if num_cols:
                num = num_cols[0]
                plots.append(self._make_plot(
                    f"box_{cat}_{num}", "box",
                    f"{num} Distribution by {cat}",
                    f"Box plot reveals how '{num}' varies across '{cat}' groups.",
                    priority=4, x_col=cat, y_col=num
                ))

        # ── Numeric plots ──────────────────────────────────────────────
        for num in num_cols[:6]:  # limit
            plots.append(self._make_plot(
                f"hist_{num}", "histogram",
                f"Distribution of {num}",
                f"Histogram reveals the frequency distribution and skewness of '{num}'.",
                priority=1, x_col=num
            ))
            plots.append(self._make_plot(
                f"box_{num}", "box",
                f"Box Plot of {num}",
                f"Box plot shows median, IQR, and outliers for '{num}'.",
                priority=3, y_col=num
            ))
            plots.append(self._make_plot(
                f"violin_{num}", "violin",
                f"Violin Plot of {num}",
                f"Violin plot combines density and box plot for '{num}'.",
                priority=5, x_col=num
            ))

        # ── Bivariate numeric ─────────────────────────────────────────
        if len(num_cols) >= 2:
            plots.append(self._make_plot(
                "scatter_0_1", "scatter",
                f"{num_cols[0]} vs {num_cols[1]}",
                "Scatter plot reveals the relationship between the two primary numeric columns.",
                priority=2, x_col=num_cols[0], y_col=num_cols[1],
                color_col=cat_cols[0] if cat_cols else None
            ))
            plots.append(self._make_plot(
                "heatmap_corr", "heatmap",
                "Correlation Matrix",
                "Heatmap shows Pearson correlations between all numeric columns.",
                priority=1
            ))

        # ── Trivariate / 3D ──────────────────────────────────────────
        if len(num_cols) >= 3:
            plots.append(self._make_plot(
                "scatter_3d", "3d_scatter",
                f"3D Scatter: {num_cols[0]}, {num_cols[1]}, {num_cols[2]}",
                "3D scatter reveals clusters and patterns across three numeric dimensions.",
                priority=4,
                x_col=num_cols[0], y_col=num_cols[1], z_col=num_cols[2],
                color_col=cat_cols[0] if cat_cols else None
            ))
            plots.append(self._make_plot(
                "bubble_0_1_2", "bubble",
                f"Bubble Chart: {num_cols[0]} vs {num_cols[1]}",
                f"Bubble size encodes '{num_cols[2]}', adding a third dimension to the scatter.",
                priority=5,
                x_col=num_cols[0], y_col=num_cols[1], z_col=num_cols[2],
                color_col=cat_cols[0] if cat_cols else None
            ))

        # ── Pairplot (4+ numeric) ─────────────────────────────────────
        if len(num_cols) >= 4:
            plots.append(self._make_plot(
                "pairplot", "pairplot",
                "Pairplot — All Numeric Columns",
                "Scatterplot matrix shows pairwise relationships across all numeric columns.",
                priority=3
            ))

        # ── Time-series ───────────────────────────────────────────────
        if date_cols and num_cols:
            dt = date_cols[0]
            num = num_cols[0]
            plots.append(self._make_plot(
                f"line_{dt}_{num}", "line",
                f"{num} Over Time",
                f"Line chart tracks '{num}' across time dimension '{dt}'.",
                priority=2, x_col=dt, y_col=num
            ))
            plots.append(self._make_plot(
                f"area_{dt}_{num}", "area",
                f"{num} Area Chart Over Time",
                "Area chart emphasizes magnitude of change over time.",
                priority=3, x_col=dt, y_col=num
            ))

        # ── Missing values heatmap ────────────────────────────────────
        if has_missing:
            plots.append(self._make_plot(
                "missing_heatmap", "missing_heatmap",
                "Missing Values Map",
                "Visualizes the pattern of missing data across all columns.",
                priority=2
            ))

        # ── Treemap for categorical ───────────────────────────────────
        if cat_cols:
            plots.append(self._make_plot(
                f"treemap_{cat_cols[0]}", "treemap",
                f"Treemap of {cat_cols[0]}",
                "Treemap shows proportional area for each category.",
                priority=6, x_col=cat_cols[0]
            ))

        # Sort by priority ascending
        plots.sort(key=lambda p: p["priority"])
        return plots

    # ------------------------------------------------------------------ #
    # 4. PUBLIC INTERFACE
    # ------------------------------------------------------------------ #

    def analyze(self) -> dict:
        num_cols  = self._cols_of_type("numeric")
        cat_cols  = self._cols_of_type("categorical", "boolean")
        date_cols = self._cols_of_type("datetime")
        missing   = self._missing_summary()
        total_missing_pct = round(
            sum(v["count"] for v in missing.values()) / (len(self.df) * len(self.df.columns)) * 100, 2
        ) if len(self.df) * len(self.df.columns) > 0 else 0.0

        summary = {
            "filename": self.filename,
            "rows": len(self.df),
            "columns": len(self.df.columns),
            "numeric_count": len(num_cols),
            "categorical_count": len(cat_cols),
            "datetime_count": len(date_cols),
            "total_missing_pct": total_missing_pct,
            "column_info": self._column_info(),
            "missing_summary": missing,
            "descriptive_stats": self._descriptive_stats(),
            "value_counts": self._value_counts(),
            "correlation_matrix": self._correlation_matrix(),
        }

        plot_specs = self._generate_plot_specs()

        return {
            "summary": summary,
            "plot_specs": plot_specs,
            "dataframe": self.df,   # passed internally to plotter, stripped before JSON response
        }