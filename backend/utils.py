import pandas as pd
import numpy as np


def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    df = df.dropna(axis=1, how="all")
    df = df.dropna(axis=0, how="all")

    str_cols = df.select_dtypes(include="object").columns
    for col in str_cols:
        df[col] = df[col].astype(str).str.strip()
        df[col] = df[col].replace("nan", np.nan)

    date_keywords = ["date", "time", "dt", "day", "month", "year", "timestamp"]
    for col in df.columns:
        col_lower = col.lower()
        if any(kw in col_lower for kw in date_keywords):
            try:
                parsed = pd.to_datetime(df[col], infer_datetime_format=True, errors="coerce")
                if parsed.notna().sum() > len(df) * 0.5:
                    df[col] = parsed
            except Exception:
                pass

    return df


def detect_outliers(series: pd.Series) -> int:
    if series.dropna().empty:
        return 0
    q1 = series.quantile(0.25)
    q3 = series.quantile(0.75)
    iqr = q3 - q1
    lower = q1 - 1.5 * iqr
    upper = q3 + 1.5 * iqr
    return int(((series < lower) | (series > upper)).sum())


def compute_rolling_trend(series: pd.Series, window: int = 7) -> pd.Series:
    return series.rolling(window=window, min_periods=1).mean()


def safe_json_value(val):
    if isinstance(val, (np.integer,)):
        return int(val)
    if isinstance(val, (np.floating,)):
        return None if np.isnan(val) else float(val)
    if isinstance(val, (np.bool_,)):
        return bool(val)
    if isinstance(val, pd.Timestamp):
        return val.isoformat()
    if isinstance(val, float) and np.isnan(val):
        return None
    return val