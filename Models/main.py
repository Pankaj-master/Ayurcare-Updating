import os
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import joblib

from model_functions import (
    normalize_prakriti,
    parse_dosha_codes,
    generate_mixed_7_day_diet_model
)

app = FastAPI(title="Ayurcare Diet AI Service")

# Allow frontend calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model + dataset with absolute paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FOODS_PATH = os.path.join(BASE_DIR, "merged_master_cleaned.xlsx")
MODEL_PATH = os.path.join(BASE_DIR, "diet_model.joblib")

foods = pd.read_excel(FOODS_PATH)
model = joblib.load(MODEL_PATH)


class DietInput(BaseModel):
    prakriti: str = "Vata"
    dosha: str = ""
    daily_calorie_target: int = 2000


@app.get("/")
def home():
    return {"message": "Diet AI service running", "status": "OK"}


# -------------- CLEAN OUTPUT FORMAT --------------
def clean_food_output(df):
    """Return essential fields including Hindi names to frontend."""
    if df.empty:
        return []

    keep = [
        "food", "food_hindi", "hindi_name", "name_hindi", "hindi",
        "calories", "protein", "carbs", "fat",
        "rasa", "guna", "virya",
        "prob_vata", "prob_pitta", "prob_kapha"
    ]

    available = [c for c in keep if c in df.columns]
    return df[available].to_dict(orient="records")


# -------------- DIET ROUTE --------------
@app.post("/generate-diet")
def generate_diet(data: DietInput):
    prakriti = normalize_prakriti(data.prakriti)
    needed_doshas = parse_dosha_codes(data.dosha)

    df_working = foods.copy()

    # MODEL PREDICTION — pass all feature columns (including category)
    feature_cols = [c for c in df_working.columns if c != "food"]
    probs = model.predict_proba(df_working[feature_cols])

    # Assign predicted probabilities
    df_working["prob_vata"] = probs[0][:, 1]
    df_working["prob_pitta"] = probs[1][:, 1]
    df_working["prob_kapha"] = probs[2][:, 1]

    # GENERATE DYNAMIC 7-DAY DIET WITH EXACT TARGET MATCHING
    diet = generate_mixed_7_day_diet_model(
        df_working,
        prakriti,
        needed_doshas,
        data.daily_calorie_target
    )

    # CLEAN OUTPUT FOR FRONTEND
    output = {}
    for day, meals in diet.items():
        output[day] = {
            "breakfast": clean_food_output(meals["breakfast"]),
            "lunch": clean_food_output(meals["lunch"]),
            "dinner": clean_food_output(meals["dinner"]),
            "totals": meals["totals"],
        }

    return {"diet_plan": output}