import pandas as pd
import numpy as np

# ---------------- PRAKRITI NORMALIZATION ----------------
def normalize_prakriti(s: str) -> str:
    if not s:
        return "Vata"
    return s.strip().title().replace(" ", "-")


# ---------------- PRAKRITI WEIGHTS ----------------
prakriti_weights = {
    "Vata":             {"vata": 1.2,  "pitta": 0.2, "kapha": 0.6},
    "Pitta":            {"vata": 0.6,  "pitta": 1.2, "kapha": 0.3},
    "Kapha":            {"vata": 0.7,  "pitta": 0.3, "kapha": 1.2},
    "Vata-Pitta":       {"vata": 1.0,  "pitta": 1.0, "kapha": 0.3},
    "Vata-Kapha":       {"vata": 1.0,  "pitta": 0.3, "kapha": 1.0},
    "Pitta-Kapha":      {"vata": 0.3,  "pitta": 1.0, "kapha": 1.0},
    "Vata-Pitta-Kapha": {"vata": 0.9,  "pitta": 0.9, "kapha": 0.9}
}


# ---------------- FILTER FUNCTION ----------------
def filter_by_dosha_model(df: pd.DataFrame, dosha_text: str, mode: str = "soft") -> pd.DataFrame:
    t = str(dosha_text).upper().replace(" ", "")
    if not t:
        return df.copy()

    if mode == "hard":
        mask = pd.Series(True, index=df.index)
        if "VATA" in t or "V" in t:
            if "pred_pacify_vata" in df.columns:
                mask &= (df["pred_pacify_vata"] == 1)
        if "PITTA" in t or "P" in t:
            if "pred_pacify_pitta" in df.columns:
                mask &= (df["pred_pacify_pitta"] == 1)
        if "KAPHA" in t or "K" in t:
            if "pred_pacify_kapha" in df.columns:
                mask &= (df["pred_pacify_kapha"] == 1)
        return df[mask].copy()

    return df.copy()  # SOFT MODE = return full dataset


# ---------------- SCORING ENGINE ----------------
def score_food_row(row, prakriti: str, needed_doshas: list, calorie_target_remaining: float, used_counts: dict) -> float:
    # MODEL DOSHA SCORE (FIXED keyword matching)
    if needed_doshas:
        p_model = 1.0
        for d in needed_doshas:
            d_lower = str(d).lower().strip()
            if "vata" in d_lower or d_lower == "v":
                p_model *= row.get("prob_vata", 0.5)
            elif "pitta" in d_lower or d_lower == "p":
                p_model *= row.get("prob_pitta", 0.5)
            elif "kapha" in d_lower or d_lower == "k":
                p_model *= row.get("prob_kapha", 0.5)
    else:
        p_model = (row.get("prob_vata", 0.5) + row.get("prob_pitta", 0.5) + row.get("prob_kapha", 0.5)) / 3

    # PRAKRITI ALIGNMENT
    p = prakriti_weights.get(prakriti, {"vata": 0.5, "pitta": 0.5, "kapha": 0.5})

    prakriti_score = (
        p["vata"] * row.get("prob_vata", 0.5) +
        p["pitta"] * row.get("prob_pitta", 0.5) +
        p["kapha"] * row.get("prob_kapha", 0.5)
    )

    # NUTRITION TARGET PROXIMITY
    cal = row.get("calories", 200)
    target_item = max(30, calorie_target_remaining / 3.5)
    nut_score = np.exp(-abs(cal - target_item) / (target_item + 1))

    # REPEAT PENALTY
    repeat_pen = used_counts.get(row.get("food", ""), 0)

    return 2.0 * p_model + 1.0 * prakriti_score + 0.8 * nut_score - 1.5 * repeat_pen


# ---------------- MAIN DIET BUILDER ----------------
def generate_mixed_7_day_diet_model(df: pd.DataFrame, prakriti: str, needed_doshas: list, daily_calorie_target: int = 2000) -> dict:
    df = df.reset_index(drop=True).copy()
    pool_master = df.copy()

    diet = {}
    used_counts = {}

    for day in range(1, 8):
        day_meals = {}

        meal_targets = {
            "breakfast": daily_calorie_target * 0.25,
            "lunch": daily_calorie_target * 0.45,
            "dinner": daily_calorie_target * 0.30,
        }

        for meal_name in ["breakfast", "lunch", "dinner"]:
            meal_target = meal_targets[meal_name]
            local_pool = pool_master.copy()
            picks = []

            for _ in range(4):  # 4 items per meal
                if local_pool.empty:
                    break

                local_pool["score"] = local_pool.apply(
                    lambda r: score_food_row(
                        r, prakriti, needed_doshas, meal_target, used_counts
                    ),
                    axis=1,
                )

                top = local_pool.sort_values("score", ascending=False).head(1)
                if top.empty:
                    break

                row = top.iloc[0]
                picks.append(row)

                used_counts[row["food"]] = used_counts.get(row["food"], 0) + 1
                pool_master = pool_master[pool_master["food"] != row["food"]]
                local_pool = local_pool[local_pool["food"] != row["food"]]

            day_meals[meal_name] = pd.DataFrame(picks)

        totals = {
            "calories": sum(m["calories"].sum() for m in day_meals.values() if not m.empty),
            "protein": sum(m["protein"].sum() for m in day_meals.values() if not m.empty),
            "carbs": sum(m["carbs"].sum() for m in day_meals.values() if not m.empty),
            "fat": sum(m["fat"].sum() for m in day_meals.values() if not m.empty),
        }

        day_meals["totals"] = totals
        diet[day] = day_meals

        # Reset pool but avoid foods over-used more than 3 times
        pool_master = df[~df["food"].isin([f for f, c in used_counts.items() if c > 3])]

    return diet

'''import pandas as pd
import numpy as np

# ---------------- PRAKRITI NORMALIZATION ----------------
def normalize_prakriti(s):
    if not s:
        return "Vata"
    return s.strip().title().replace(" ", "-")


# ---------------- PRAKRITI WEIGHTS ----------------
prakriti_weights = {
    "Vata":         {"vata": 1.2,  "pitta": 0.2, "kapha": 0.6},
    "Pitta":        {"vata": 0.6,  "pitta": 1.2, "kapha": 0.3},
    "Kapha":        {"vata": 0.7,  "pitta": 0.3, "kapha": 1.2},
    "Vata-Pitta":   {"vata": 1.0,  "pitta": 1.0, "kapha": 0.3},
    "Vata-Kapha":   {"vata": 1.0,  "pitta": 0.3, "kapha": 1.0},
    "Pitta-Kapha":  {"vata": 0.3,  "pitta": 1.0, "kapha": 1.0},
    "Vata-Pitta-Kapha": {"vata": 0.9, "pitta": 0.9, "kapha": 0.9}
}


# ---------------- FILTER FUNCTION ----------------
def filter_by_dosha_model(df, dosha_text, mode="soft", prob_threshold=0.5):

    t = str(dosha_text).upper().replace(" ", "")
    if t == "" or t is None:
        return df.copy()

    mask = pd.Series(True, index=df.index)

    if mode == "hard":
        if "V" in t:
            mask &= (df["pred_pacify_vata"] == 1)
        if "P" in t:
            mask &= (df["pred_pacify_pitta"] == 1)
        if "K" in t:
            mask &= (df["pred_pacify_kapha"] == 1)

        return df[mask].copy()

    return df.copy()  # SOFT MODE = return full dataset


# ---------------- SCORING ENGINE ----------------
def score_food_row(row, prakriti, needed_doshas, calorie_target_remaining, used_counts):

    # MODEL DOSHA SCORE
    if needed_doshas:
        p_model = 1.0
        for d in needed_doshas:
            if d == "v":
                p_model *= row["prob_vata"]
            elif d == "p":
                p_model *= row["prob_pitta"]
            elif d == "k":
                p_model *= row["prob_kapha"]
    else:
        p_model = (row["prob_vata"] + row["prob_pitta"] + row["prob_kapha"]) / 3

    # PRAKRITI ALIGNMENT
    p = prakriti_weights.get(prakriti, {"vata": 0, "pitta": 0, "kapha": 0})

    prakriti_score = (
        p["vata"] * row["prob_vata"] +
        p["pitta"] * row["prob_pitta"] +
        p["kapha"] * row["prob_kapha"]
    )

    # NUTRITION TARGET PROXIMITY
    cal = row["calories"]
    target_item = max(30, calorie_target_remaining / 3.5)
    nut_score = np.exp(-abs(cal - target_item) / (target_item + 1))

    # REPEAT PENALTY
    repeat_pen = used_counts.get(row["food"], 0)

    return 2*p_model + 1*prakriti_score + 0.8*nut_score - 1.5*repeat_pen


# ---------------- MAIN DIET BUILDER ----------------
def generate_mixed_7_day_diet_model(df, prakriti, needed_doshas, daily_calorie_target=2000):

    df = df.reset_index(drop=True).copy()
    pool_master = df.copy()

    diet = {}
    used_counts = {}

    for day in range(1, 8):
        day_meals = {}

        meal_targets = {
            "breakfast": daily_calorie_target * 0.25,
            "lunch": daily_calorie_target * 0.45,
            "dinner": daily_calorie_target * 0.30,
        }

        for meal_name in ["breakfast", "lunch", "dinner"]:
            meal_target = meal_targets[meal_name]

            local_pool = pool_master.copy()
            picks = []

            for _ in range(4):  # 4 foods per meal
                if local_pool.empty:
                    break

                local_pool["score"] = local_pool.apply(
                    lambda r: score_food_row(
                        r, prakriti, needed_doshas, meal_target, used_counts
                    ),
                    axis=1,
                )

                top = local_pool.sort_values("score", ascending=False).head(1)
                if top.empty:
                    break

                row = top.iloc[0]
                picks.append(row)

                used_counts[row["food"]] = used_counts.get(row["food"], 0) + 1

                pool_master = pool_master[pool_master["food"] != row["food"]]
                local_pool = local_pool[local_pool["food"] != row["food"]]

            day_meals[meal_name] = pd.DataFrame(picks)

        totals = {
            "calories": sum(m["calories"].sum() for m in day_meals.values() if not m.empty),
            "protein": sum(m["protein"].sum() for m in day_meals.values() if not m.empty),
            "carbs": sum(m["carbs"].sum() for m in day_meals.values() if not m.empty),
            "fat": sum(m["fat"].sum() for m in day_meals.values() if not m.empty),
        }

        day_meals["totals"] = totals
        diet[day] = day_meals

        # Reset pool but avoid foods over-used more than 3 times
        pool_master = df[~df["food"].isin([f for f, c in used_counts.items() if c > 3])]

    return diet
'''