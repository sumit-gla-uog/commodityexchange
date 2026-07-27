import pandas as pd
import os

# Sirf ye commodities chahiye CommodEx ke liye
RELEVANT_COMMODITIES = [
    # Energy
    "Crude oil, Brent",
    "Natural gas, Europe",
    "Coal, Australian",
    # Metals
    "Aluminum",
    "Copper",
    "Nickel",
    "Zinc",
    "Lead",
    "Iron ore, cfr spot",
    # Agriculture
    "Wheat, US HRW",
    "Maize",
    "Sugar, world",
    "Palm oil",
    "Soybeans",
]

INPUT_FILE = "data/CMO-Historical-Data-Monthly.xlsx"
OUTPUT_FILE = "data/worldbank_clean.csv"

def load_raw_data(filepath):
    df = pd.read_excel(
        filepath,
        sheet_name="Monthly Prices",
        header=4        # Row 4 pe actual headers hain
    )
    
    # First column ka naam fix karo — ye date column hai
    df = df.rename(columns={"Unnamed: 0": "date"})
    
    # Units row hataao (row index 0 — $/bbl, $/mt etc.)
    df = df.drop(index=0).reset_index(drop=True)
    
    return df

def clean_data(df):
    # Sirf relevant commodities ki columns rakhna
    cols_to_keep = ["date"] + RELEVANT_COMMODITIES
    df = df[cols_to_keep]
    
    # "…" ko NaN me convert karo
    df = df.replace("…", pd.NA)
    
    # Date format clean karo: 1960M01 → 1960-01
    df["date"] = df["date"].str.replace("M", "-", regex=False)
    
    # NaN rows drop karo (jahan date missing ho)
    df = df.dropna(subset=["date"])
    
    # Price columns ko numeric banao
    for col in RELEVANT_COMMODITIES:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    
    return df

def save_clean_data(df, filepath):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    df.to_csv(filepath, index=False)
    print(f"Saved: {filepath}")
    print(f"Shape: {df.shape}")
    print(f"Date range: {df['date'].iloc[0]} to {df['date'].iloc[-1]}")
    print(f"Columns: {df.columns.tolist()}")

if __name__ == "__main__":
    print("Loading raw data...")
    df = load_raw_data(INPUT_FILE)
    
    print("Cleaning data...")
    df = clean_data(df)
    
    print("Saving...")
    save_clean_data(df, OUTPUT_FILE)