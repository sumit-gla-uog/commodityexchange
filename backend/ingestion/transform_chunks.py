
#  Part 1: Imports aur Config
import pandas as pd
import json
import os

INPUT_FILE = "data/worldbank_clean.csv"
OUTPUT_FILE = "data/chunks.json"

# each unit of the commodity - will be used in chunks
COMMODITY_UNITS = {
    "Crude oil, Brent":      "USD per barrel",
    "Natural gas, Europe":   "USD per mmbtu",
    "Coal, Australian":      "USD per metric ton",
    "Aluminum":              "USD per metric ton",
    "Copper":                "USD per metric ton",
    "Nickel":                "USD per metric ton",
    "Zinc":                  "USD per metric ton",
    "Lead":                  "USD per metric ton",
    "Iron ore, cfr spot":    "USD per dry metric ton",
    "Wheat, US HRW":         "USD per metric ton",
    "Maize":                 "USD per metric ton",
    "Sugar, world":          "USD per kg",
    "Palm oil":              "USD per metric ton",
    "Soybeans":              "USD per metric ton",
}

# Part 2: making Single Chunk 
def make_chunk(commodity, date, price, unit, prev_price=None):
    # Base sentence
    text = (
        f"In {date}, {commodity} was priced at "
        f"{price:.2f} {unit} according to "
        f"World Bank Pink Sheet data."
    )

    # Month-on-month adding change
    if prev_price is not None and prev_price > 0:
        change = ((price - prev_price) / prev_price) * 100
        direction = "increase" if change > 0 else "decrease"
        text += (
            f" This represents a {abs(change):.1f}% "
            f"{direction} from the previous month."
        )

    return {
        "text": text,
        "metadata": {
            "commodity": commodity,
            "date": date,
            "price": price,
            "unit": unit,
            "source": "World Bank Pink Sheet"
        }
    }
# Part 3: Generating all Chunks
def generate_chunks(df):
    all_chunks = []

    for commodity, unit in COMMODITY_UNITS.items():
        # only taking commodity rows
        comm_df = df[["date", commodity]].dropna()

        for i, row in comm_df.iterrows():
            date = row["date"]
            price = row[commodity]

            # Previous month price
            prev_price = None
            if i > 0 and commodity in df.columns:
                prev_val = df.loc[i - 1, commodity]
                if pd.notna(prev_val):
                    prev_price = float(prev_val)

            chunk = make_chunk(
                commodity=commodity,
                date=date,
                price=float(price),
                unit=unit,
                prev_price=prev_price
            )
            all_chunks.append(chunk)

    return all_chunks


# Part 4: Save + Main
def save_chunks(chunks, filepath):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w") as f:
        json.dump(chunks, f, indent=2)
    print(f"Saved: {filepath}")
    print(f"Total chunks: {len(chunks)}")
    print(f"\nExample chunk:")
    print(json.dumps(chunks[500], indent=2))

if __name__ == "__main__":
    print("Loading clean data...")
    df = pd.read_csv(INPUT_FILE)

    print("Generating chunks...")
    chunks = generate_chunks(df)

    print("Saving chunks...")
    save_chunks(chunks, OUTPUT_FILE)