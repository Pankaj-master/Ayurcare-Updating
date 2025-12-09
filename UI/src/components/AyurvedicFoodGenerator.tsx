import React, { useEffect, useState } from "react";

export default function AyurvedicFoodGenerator() {
  const [numItems, setNumItems] = useState(3);
  const [searchTerm, setSearchTerm] = useState("");
  const [foods, setFoods] = useState<any[]>([]);
  const [allFoodsCache, setAllFoodsCache] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [noResults, setNoResults] = useState(false);

  // Helper for prakriti tag colors
  const getPrakritiClass = (effect: string) => {
    if (effect === "pacifying") return "bg-green-100 text-green-700";
    if (effect === "aggravating") return "bg-red-100 text-red-700";
    return "bg-muted text-muted-foreground";
  };

  const renderFoods = (data: any[]) => {
    if (!data || data.length === 0) {
      setNoResults(true);
      setFoods([]);
      return;
    }
    setNoResults(false);
    setFoods(data);
  };

  const loadFoods = async () => {
    if (numItems < 1 || numItems > 50) {
      alert("Enter between 1–50");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let data = allFoodsCache;

      if (!data) {
        const resp = await fetch("ayurvedic_recipes.json");
        if (!resp.ok) throw new Error("Failed to load data");
        data = await resp.json();
        setAllFoodsCache(data);
      }

      const shuffled = [...data].sort(() => 0.5 - Math.random());
      renderFoods(shuffled.slice(0, numItems));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const searchFoods = async () => {
    if (!searchTerm.trim()) return alert("Enter a search term");

    setLoading(true);
    setError("");

    try {
      let data = allFoodsCache;

      if (!data) {
        const resp = await fetch("ayurvedic_recipes.json");
        if (!resp.ok) throw new Error("Failed to load data");
        data = await resp.json();
        setAllFoodsCache(data);
      }

      const results = data.filter((f: any) =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      renderFoods(results);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setFoods([]);
    setNoResults(false);
    setSearchTerm("");
    setNumItems(3);
  };

  useEffect(() => {
    setTimeout(loadFoods, 300);
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">

      <h1 className="text-3xl font-semibold text-primary text-center">
        🌿 Ayurvedic Recipe Generator
      </h1>

      {/* Random Generator */}
      <div className="flex flex-col items-center gap-3 p-4 rounded-lg bg-card shadow">
        <label className="font-medium">Number of foods (1–50):</label>

        <input
          type="number"
          value={numItems}
          onChange={(e) => setNumItems(Number(e.target.value))}
          min={1}
          max={50}
          className="px-3 py-2 rounded-md border bg-input-background"
        />

        <button
          onClick={loadFoods}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md shadow hover:opacity-90"
        >
          Generate Random
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col items-center gap-3 p-4 rounded-lg bg-card shadow">
        <label className="font-medium">Search food by name:</label>

        <input
          type="text"
          placeholder="e.g., rice, ginger, kitchari"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 rounded-md border bg-input-background w-full"
        />

        <div className="flex gap-3">
          <button
            onClick={searchFoods}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md shadow hover:opacity-90"
          >
            Search
          </button>

          <button
            onClick={clearResults}
            className="px-4 py-2 bg-muted text-muted-foreground rounded-md shadow hover:opacity-90"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {loading && (
        <p className="text-primary text-center font-medium">Loading recipes...</p>
      )}

      {error && (
        <p className="text-destructive text-center font-medium">❌ {error}</p>
      )}

      {noResults && (
        <p className="text-primary text-center italic">
          No foods found. Try another name.
        </p>
      )}

      {/* RESULTS */}
      <div className="space-y-6">
        {foods.map((food, idx) => (
          <div
  key={idx}
  className="p-6 rounded-2xl bg-card shadow-md border border-border space-y-4 hover:shadow-lg transition-shadow"
>
  {/* Food Name */}
  <h2 className="text-2xl font-semibold text-accent">
    {food.name}
  </h2>

  {/* Basic Info */}
  <div className="space-y-1 text-[15px]">
    <p><strong className="text-foreground">Type:</strong> {food.type}</p>
    <p><strong className="text-foreground">Ingredients:</strong> {food.ingredients.join(", ")}</p>
    <p><strong className="text-foreground">Instructions:</strong> {food.instructions}</p>
  </div>

  {/* Time Section */}
  <div className="flex items-center gap-2 text-muted-foreground text-sm mt-2">
    <span className="text-lg">⏱️</span>
    <span>Prep: {food.preparation_time_min} min</span>
    <span className="mx-1">•</span>
    <span>Cook: {food.cooking_time_min} min</span>
    <span className="mx-1">•</span>
    <span>Serves: {food.servings}</span>
  </div>

  {/* Divider */}
  <div className="border-t border-border pt-4" />

  {/* Allergy Info */}
  <div>
    <h3 className="font-medium text-primary mb-1">Allergy Information</h3>

    {food.allergy_info?.length > 0 && food.allergy_info[0] !== "none" ? (
      <div className="flex flex-wrap gap-2">
        {food.allergy_info.map((a: string, i: number) => (
          <span
            key={i}
            className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 font-medium"
          >
            {a}
          </span>
        ))}
      </div>
    ) : (
      <span className="px-3 py-1 text-xs rounded-full bg-muted text-muted-foreground">
        none
      </span>
    )}
  </div>

  {/* Divider */}
  <div className="border-t border-border pt-4" />

  {/* Ayurveda */}
  <div>
    <h3 className="font-medium text-primary mb-2">Ayurvedic Properties</h3>

    <div className="space-y-2 text-[15px]">
      <p>
        <strong>Rasa:</strong>{" "}
        {food.ayurveda.rasa.map((r: string, i: number) => (
          <span
            key={i}
            className="px-3 py-1 text-xs rounded-full bg-secondary text-secondary-foreground mr-2"
          >
            {r}
          </span>
        ))}
      </p>

      <p>
        <strong>Guna:</strong>{" "}
        {food.ayurveda.guna.map((g: string, i: number) => (
          <span
            key={i}
            className="px-3 py-1 text-xs rounded-full bg-secondary text-secondary-foreground mr-2"
          >
            {g}
          </span>
        ))}
      </p>

      <p>
        <strong>Virya:</strong>{" "}
        <span className="px-3 py-1 text-xs rounded-full bg-secondary text-secondary-foreground">
          {food.ayurveda.virya}
        </span>
      </p>
    </div>
  </div>

  {/* Divider */}
  <div className="border-t border-border pt-4" />

  {/* Prakriti */}
  <div>
    <h3 className="font-medium text-primary mb-2">Dosha Suitability (Prakriti)</h3>

    <div className="space-y-1 text-[15px]">
      <p>
        <strong>Vata:</strong>{" "}
        <span className={`px-3 py-1 text-xs rounded-full ${getPrakritiClass(food.prakriti.vata)}`}>
          {food.prakriti.vata}
        </span>
      </p>
      <p>
        <strong>Pitta:</strong>{" "}
        <span className={`px-3 py-1 text-xs rounded-full ${getPrakritiClass(food.prakriti.pitta)}`}>
          {food.prakriti.pitta}
        </span>
      </p>
      <p>
        <strong>Kapha:</strong>{" "}
        <span className={`px-3 py-1 text-xs rounded-full ${getPrakritiClass(food.prakriti.kapha)}`}>
          {food.prakriti.kapha}
        </span>
      </p>
    </div>
  </div>
</div>

        ))}
      </div>
    </div>
  );
}
