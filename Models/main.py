import os
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import joblib

from model_functions import (
    normalize_prakriti,
    filter_by_dosha_model,
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
    """Return only essential fields to frontend."""
    if df.empty:
        return []

    keep = [
        "food", "calories", "protein", "carbs", "fat",
        "rasa", "guna", "virya",
        "prob_vata", "prob_pitta", "prob_kapha"
    ]

    available = [c for c in keep if c in df.columns]
    return df[available].to_dict(orient="records")


# -------------- DIET ROUTE --------------
@app.post("/generate-diet")
def generate_diet(data: DietInput):
    prakriti = normalize_prakriti(data.prakriti)
    
    # Parse dosha as words (e.g., "vata, pitta" or "kapha" -> ['kapha'])
    if data.dosha:
        raw_doshas = data.dosha.replace("-", ",").replace("/", ",").split(",")
        needed_doshas = [d.strip().lower() for d in raw_doshas if d.strip()]
    else:
        needed_doshas = []

    dosha_text = data.dosha.upper().replace(" ", "")

    # FILTER
    df_filtered = filter_by_dosha_model(foods, dosha_text, mode="soft")

      # MODEL PREDICTION — pass all feature columns
    feature_cols = [c for c in df_filtered.columns if c != "food"]
    probs = model.predict_proba(df_filtered[feature_cols])

    # MODEL OUTPUT FORMAT:
    # probs = [probs_vata, probs_pitta, probs_kapha] (each shape N x 2)
    df_filtered = df_filtered.copy()
    df_filtered["prob_vata"] = probs[0][:, 1]
    df_filtered["prob_pitta"] = probs[1][:, 1]
    df_filtered["prob_kapha"] = probs[2][:, 1]

    # GENERATE DIET
    diet = generate_mixed_7_day_diet_model(
        df_filtered,
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

'''from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import joblib

from model_functions import (
    normalize_prakriti,
    filter_by_dosha_model,
    generate_mixed_7_day_diet_model
)

app = FastAPI()

# Allow frontend calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model + dataset
foods = pd.read_excel("merged_master_cleaned.xlsx")
model = joblib.load("diet_model.joblib")


class DietInput(BaseModel):
    prakriti: str
    dosha: str = ""
    daily_calorie_target: int = 2000


@app.get("/")
def home():
    return {"message": "Diet AI running"}


# -------------- CLEAN OUTPUT FORMAT --------------
def clean_food_output(df):
    """Return only essential fields to frontend."""

    keep = [
        "food", "calories", "protein", "carbs", "fat",
        "rasa", "guna", "virya",
        "prob_vata", "prob_pitta", "prob_kapha"
    ]

    available = [c for c in keep if c in df.columns]
    return df[available].to_dict(orient="records")


# -------------- DIET ROUTE --------------
@app.post("/generate-diet")
def generate_diet(data: DietInput):

    prakriti = normalize_prakriti(data.prakriti)
    dosha_text = data.dosha.upper().replace(" ", "")
    needed_doshas = list(data.dosha.lower()) if data.dosha else []

    # FILTER
    df_filtered = filter_by_dosha_model(foods, dosha_text, mode="soft")

    # MODEL PREDICTION — extract only numeric columns
    num_cols = [c for c in df_filtered.columns if c != "food"]
    probs = model.predict_proba(df_filtered[num_cols])

    # MODEL OUTPUT FORMAT:
    # probs = [probs_vata, probs_pitta, probs_kapha] (each shape N x 2)

    df_filtered["prob_vata"] = probs[0][:, 1]
    df_filtered["prob_pitta"] = probs[1][:, 1]
    df_filtered["prob_kapha"] = probs[2][:, 1]

    # GENERATE DIET
    diet = generate_mixed_7_day_diet_model(
        df_filtered,
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
'''