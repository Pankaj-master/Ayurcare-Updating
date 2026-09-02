import pandas as pd
import numpy as np

# ---------------- PRAKRITI NORMALIZATION ----------------
def normalize_prakriti(s: str) -> str:
    if not s:
        return "Vata"
    return s.strip().title().replace(" ", "-")


# ---------------- PRAKRITI WEIGHTS ----------------
prakriti_weights = {
    "Vata":             {"vata": 2.5, "pitta": 0.5, "kapha": 0.8},
    "Pitta":            {"vata": 0.5, "pitta": 2.5, "kapha": 0.5},
    "Kapha":            {"vata": 0.8, "pitta": 0.5, "kapha": 2.5},
    "Vata-Pitta":       {"vata": 1.8, "pitta": 1.8, "kapha": 0.4},
    "Vata-Kapha":       {"vata": 1.8, "pitta": 0.4, "kapha": 1.8},
    "Pitta-Kapha":      {"vata": 0.4, "pitta": 1.8, "kapha": 1.8},
    "Vata-Pitta-Kapha": {"vata": 1.2, "pitta": 1.2, "kapha": 1.2}
}


# ---------------- PARSE FRONTEND DOSHA CODE ----------------
def parse_dosha_codes(dosha_input: str) -> list:
    if not dosha_input or dosha_input.lower() == "none":
        return []
    
    t = str(dosha_input).upper().strip()
    needed = []
    if "V" in t or "VATA" in t:
        needed.append("vata")
    if "P" in t or "PITTA" in t:
        needed.append("pitta")
    if "K" in t or "KAPHA" in t:
        needed.append("kapha")
    return needed


# ---------------- DAILY INDIAN HOUSEHOLD STAPLES ----------------
COMMON_INDIAN_STAPLES = [
    # Grains & Breakfast
    "roti", "chapati", "rice", "wheat", "poha", "dalia", "khichdi", "upma", "oats", "chilla", "paratha", "idli",
    # Dals & Legumes
    "moong", "mung", "toor", "arhar", "masoor", "chana", "urad", "rajma", "chole", "dal", "lentil", "lobia",
    # Vegetables (Sabzis)
    "palak", "spinach", "methi", "bhindi", "okra", "lauki", "bottle gourd", "tori", "turai", "ridge gourd",
    "karela", "bitter gourd", "baingan", "brinjal", "aloo", "potato", "gobi", "cauliflower", "matar", "pea",
    "capsicum", "shimla mirch", "kaddu", "pumpkin", "gajar", "carrot", "mooli", "radish", "tamatar", "tomato", "kheera", "cucumber",
    # Dairy & Accompaniments
    "paneer", "curd", "dahi", "buttermilk", "chaas", "milk", "ghee",
    # Fruits
    "banana", "kela", "apple", "seb", "papaya", "papita", "pomegranate", "anar", "orange", "santra", "guava", "amrood"
]

# Exotic Western canned items to exclude
EXOTIC_EXCLUDE = [
    "cannellini", "romano beans", "flame beans", "navy beans", "bamboo", "brussels", "artichoke", "alfalfa"
]


# ---------------- STRUCTURED INDIAN MEAL SLOTS ----------------
meal_structures = {
    "breakfast": [
        ["GRAINS", "OTHER"],                       # Poha, Dalia, Oats, Chilla, Upma
        ["FRUITS", "DAIRY", "NUTS", "OTHER"],     # Banana, Papaya, Milk, Almonds
        ["FRUITS", "GRAINS", "OTHER"]              # Apple, Toast, Light side
    ],
    "lunch": [
        ["GRAINS", "OTHER"],                       # Roti / Phulka, Rice, Khichdi
        ["LEGUMES", "OTHER"],                      # Moong Dal, Toor Dal, Chana, Rajma
        ["VEGETABLES", "OTHER"],                   # Palak, Lauki, Bhindi, Gobi Sabzi
        ["VEGETABLES", "DAIRY", "OTHER"]           # Dahi, Cucumber Salad, Curd
    ],
    "dinner": [
        ["GRAINS", "OTHER"],                       # Khichdi, Dalia, Light Roti
        ["VEGETABLES", "LEGUMES", "OTHER"],        # Lauki, Turai, Moong Dal Soup
        ["VEGETABLES", "OTHER"]                    # Cooked Sabzi / Salad
    ]
}


# ---------------- SCORING ENGINE ----------------
def score_food_row(row, prakriti: str, needed_doshas: list, target_cal: float, used_counts: dict) -> float:
    food_name_lower = str(row.get("food", "")).lower()

    # 0. Exclude exotic Western canned beans
    for exotic in EXOTIC_EXCLUDE:
        if exotic in food_name_lower:
            return -999.0

    # 1. Boost for Common Indian Household Staples
    indian_boost = 0.0
    for staple in COMMON_INDIAN_STAPLES:
        if staple in food_name_lower:
            indian_boost = 4.0
            break

    # 2. DOSHA SCORE
    if needed_doshas:
        p_model = 1.0
        for d in needed_doshas:
            if d == "vata":
                p_model *= row.get("prob_vata", 0.5) * 2.0
            elif d == "pitta":
                p_model *= row.get("prob_pitta", 0.5) * 2.0
            elif d == "kapha":
                p_model *= row.get("prob_kapha", 0.5) * 2.0
    else:
        p_model = (row.get("prob_vata", 0.5) + row.get("prob_pitta", 0.5) + row.get("prob_kapha", 0.5)) / 3

    # 3. PRAKRITI SCORE
    p = prakriti_weights.get(prakriti, {"vata": 1.0, "pitta": 1.0, "kapha": 1.0})
    prakriti_score = (
        p["vata"] * row.get("prob_vata", 0.5) +
        p["pitta"] * row.get("prob_pitta", 0.5) +
        p["kapha"] * row.get("prob_kapha", 0.5)
    )

    # 4. CALORIE PROXIMITY & OIL PENALTY
    cal = row.get("calories", 100)
    oil_penalty = 6.0 if cal > 650 else 0.0
    nut_score = np.exp(-abs(cal - target_cal) / (target_cal + 20))

    # 5. REPEAT PENALTY
    repeat_pen = used_counts.get(row.get("food", ""), 0) * 3.0

    # 6. RANDOM FACTOR
    random_factor = np.random.uniform(0.9, 1.1)

    return (indian_boost + 3.0 * p_model + 2.0 * prakriti_score + 1.5 * nut_score - repeat_pen - oil_penalty) * random_factor


# ---------------- MAIN 7-DAY DIET BUILDER ----------------
def generate_mixed_7_day_diet_model(df: pd.DataFrame, prakriti: str, needed_doshas: list, daily_calorie_target: int = 2000) -> dict:
    df = df.reset_index(drop=True).copy()
    diet = {}
    used_counts = {}

    meal_targets = {
        "breakfast": daily_calorie_target * 0.25, # 25%
        "lunch": daily_calorie_target * 0.45,     # 45%
        "dinner": daily_calorie_target * 0.30,    # 30%
    }

    for day in range(1, 8):
        day_meals = {}

        for meal_name, slot_categories in meal_structures.items():
            meal_total_target = meal_targets[meal_name]
            num_slots = len(slot_categories)
            item_target_cal = meal_total_target / num_slots

            picks = []
            used_in_this_meal = set()

            for allowed_cats in slot_categories:
                if "category" in df.columns:
                    pool = df[df["category"].str.upper().isin(allowed_cats)].copy()
                    if pool.empty:
                        pool = df.copy()
                else:
                    pool = df.copy()

                pool = pool[~pool["food"].isin(used_in_this_meal)]
                pool = pool[~pool["food"].isin([f for f, c in used_counts.items() if c >= 4])]
                if pool.empty:
                    pool = df.copy()

                pool["score"] = pool.apply(
                    lambda r: score_food_row(r, prakriti, needed_doshas, item_target_cal, used_counts),
                    axis=1
                )

                top_choices = pool.sort_values("score", ascending=False).head(3)
                chosen_row = top_choices.sample(1).iloc[0]

                picks.append(chosen_row)
                food_name = chosen_row["food"]
                used_in_this_meal.add(food_name)
                used_counts[food_name] = used_counts.get(food_name, 0) + 1

            day_meals[meal_name] = pd.DataFrame(picks)

        # ---------------- PORTION SCALING TO MATCH CALORIE TARGET ----------------
        raw_total_cals = sum(m["calories"].sum() for m in day_meals.values() if not m.empty)
        if raw_total_cals > 0:
            scale_factor = daily_calorie_target / raw_total_cals
            for m_name in day_meals:
                if not day_meals[m_name].empty:
                    day_meals[m_name] = day_meals[m_name].copy()
                    day_meals[m_name]["calories"] = (day_meals[m_name]["calories"] * scale_factor).round()
                    day_meals[m_name]["protein"] = (day_meals[m_name]["protein"] * scale_factor).round(1)
                    day_meals[m_name]["carbs"] = (day_meals[m_name]["carbs"] * scale_factor).round(1)
                    day_meals[m_name]["fat"] = (day_meals[m_name]["fat"] * scale_factor).round(1)

        # Matched daily totals
        total_cals = round(sum(m["calories"].sum() for m in day_meals.values() if not m.empty))
        total_prot = round(sum(m["protein"].sum() for m in day_meals.values() if not m.empty), 1)
        total_carbs = round(sum(m["carbs"].sum() for m in day_meals.values() if not m.empty), 1)
        total_fat = round(sum(m["fat"].sum() for m in day_meals.values() if not m.empty), 1)

        day_meals["totals"] = {
            "calories": total_cals,
            "protein": total_prot,
            "carbs": total_carbs,
            "fat": total_fat
        }
        diet[day] = day_meals

    return diet