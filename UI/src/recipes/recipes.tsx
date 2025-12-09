import React, { useEffect, useState } from "react";

interface AyurvedaProps {
  rasa: string[];
  guna: string[];
  virya: string;
}

interface PrakritiProps {
  vata: string;
  pitta: string;
  kapha: string;
}

interface Food {
  name: string;
  type: string;
  ingredients: string[];
  instructions: string;
  preparation_time_min: number;
  cooking_time_min: number;
  servings: number;
  allergy_info: string[];
  ayurveda: AyurvedaProps;
  prakriti: PrakritiProps;
}

const getPrakritiClass = (effect: string) => {
  if (effect === "pacifying") return "prakriti-pacifying";
  if (effect === "aggravating") return "prakriti-aggravating";
  return "prakriti-neutral";
};

const AyurvedicFoodGenerator: React.FC = () => {
  const [allFoods, setAllFoods] = useState<Food[] | null>(null);
  const [results, setResults] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [numItems, setNumItems] = useState(3);
  const [searchTerm, setSearchTerm] = useState("");

  // Load foods JSON
  const loadFoodData = async () => {
    if (allFoods) return allFoods;
    const response = await fetch("/ayurvedic_recipes.json");
    const json = await response.json();
    setAllFoods(json);
    return json;
  };

  // Generate random foods
  const loadFoods = async () => {
    if (numItems < 1 || numItems > 50) {
      alert("Please enter a number between 1 and 50.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await loadFoodData();
      const shuffled = [...data].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, numItems);
      setResults(selected);
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  };

  // Search foods
  const searchFoods = async () => {
    if (!searchTerm.trim()) {
      alert("Please enter a search term.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await loadFoodData();
      const filtered = data.filter((food) =>
        food.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setResults(filtered);
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  };

  const clearResults = () => {
    setResults([]);
    setSearchTerm("");
    setNumItems(3);
  };

  // Load 3 random foods on mount
  useEffect(() => {
    setTimeout(loadFoods, 300);
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h1 style={{ textAlign: "center", color: "#2d8b2b" }}>🌿 Ayurvedic Food Generator</h1>

      {/* Random Generator */}
      <div className="controls" style={{ textAlign: "center", margin: "20px 0" }}>
        <label>Number of foods (1–50): </label>
        <input
          type="number"
          value={numItems}
          min={1}
          max={50}
          onChange={(e) => setNumItems(Number(e.target.value))}
        />
        <button onClick={loadFoods}>Generate Random</button>
      </div>

      {/* Search Controls */}
      <div className="controls" style={{ textAlign: "center", margin: "20px 0" }}>
        <label>Search food by name:</label>
        <input
          type="text"
          placeholder="e.g. rice, ginger, kitchari"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={searchFoods}>Search</button>
        <button onClick={clearResults}>Clear</button>
      </div>

      {loading && <div style={{ textAlign: "center", color: "#2d8b2b" }}>Loading recipes...</div>}
      {error && <div style={{ color: "red", textAlign: "center" }}>❌ {error}</div>}

      {results.length === 0 && !loading && (
        <div style={{ textAlign: "center", color: "#2d8b2b", fontStyle: "italic" }}>
          No foods found. Try another name.
        </div>
      )}

      {/* Results */}
      <div>
        {results.map((food, i) => (
          <div
            key={i}
            className="food-card"
            style={{
              background: "white",
              padding: 20,
              borderRadius: 10,
              margin: "20px 0",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ fontSize: 22, color: "#8b5a2b" }}>{food.name}</div>
            <div><strong>Type:</strong> {food.type}</div>
            <div><strong>Ingredients:</strong> {food.ingredients.join(", ")}</div>
            <div><strong>Instructions:</strong> {food.instructions}</div>

            <div style={{ margin: "10px 0", fontStyle: "italic" }}>
              ⏱️ Prep: {food.preparation_time_min} min | Cook: {food.cooking_time_min} min | Serves: {food.servings}
            </div>

            <div>
              <strong>Allergy Info:</strong>{" "}
              {food.allergy_info.length > 0 && food.allergy_info[0] !== "none"
                ? food.allergy_info.map((a, idx) => (
                    <span key={idx} className="tag allergy-warning">{a}</span>
                  ))
                : "none"}
            </div>

            {/* Ayurveda Section */}
            <div className="ayurveda" style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed #ddd" }}>
              <h4 style={{ color: "#2e7d32" }}>Ayurvedic Properties</h4>

              <div>
                <strong>Rasa:</strong>{" "}
                {food.ayurveda.rasa.map((r, idx) => (
                  <span key={idx} className="tag">{r}</span>
                ))}
              </div>

              <div>
                <strong>Guna:</strong>{" "}
                {food.ayurveda.guna.map((g, idx) => (
                  <span key={idx} className="tag">{g}</span>
                ))}
              </div>

              <div>
                <strong>Virya:</strong> <span className="tag">{food.ayurveda.virya}</span>
              </div>
            </div>

            {/* Prakriti Section */}
            <div className="prakriti" style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed #ddd" }}>
              <h4 style={{ color: "#2e7d32" }}>Dosha Suitability</h4>

              <div>
                <strong>Vata:</strong>{" "}
                <span className={getPrakritiClass(food.prakriti.vata)}>{food.prakriti.vata}</span>
              </div>

              <div>
                <strong>Pitta:</strong>{" "}
                <span className={getPrakritiClass(food.prakriti.pitta)}>{food.prakriti.pitta}</span>
              </div>

              <div>
                <strong>Kapha:</strong>{" "}
                <span className={getPrakritiClass(food.prakriti.kapha)}>{food.prakriti.kapha}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* EXTRA CSS */}
      <style>{`
        .tag {
          display: inline-block;
          background: #e8f4f8;
          color: #007acc;
          padding: 2px 8px;
          border-radius: 12px;
          margin: 2px;
          font-size: 12px;
        }
        .allergy-warning {
          background: #ffebee;
          color: #c62828;
        }
        .prakriti-pacifying {
          background: #e8f5e9;
          color: #2e7d32;
        }
        .prakriti-aggravating {
          background: #ffebee;
          color: #c62828;
        }
        .prakriti-neutral {
          background: #f5f5f5;
          color: #616161;
        }
      `}</style>
    </div>
  );
};

export default AyurvedicFoodGenerator;
