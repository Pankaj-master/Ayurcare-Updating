import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { foodsAPI } from "../services/api";
import { Plus, Search, Filter, Apple, Info } from "lucide-react";

import { useTranslation } from "react-i18next";

export function FoodDatabase() {
  const { t } = useTranslation();
  const [foods, setFoods] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12); // You can change this
  const [totalPages, setTotalPages] = useState(1);

  const [newFood, setNewFood] = useState({
    name: "",
    category: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    description: "",

    // NEW — Ayurveda fields
    rasa: "",
    virya: "",
    guna: "",
    vipaka: "",

    doshaEffects: "",
    benefits: "",
    precautions: "",

    imageUrl: "",
  });

  const categories = [
    "Grains",
    "Legumes",
    "Vegetables",
    "Fruits",
    "Spices",
    "Fats",
    "Dairy",
  ];

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await foodsAPI.getAll({
          page,
          limit,
          search: searchTerm || undefined,
          category: filterCategory !== "all" ? filterCategory : undefined,
        });

        const raw = response.data?.data?.data || [];
        const pagination = response.data?.data?.pagination;

        setTotalPages(pagination?.totalPages || 1);
        setPage(pagination?.page || 1);

        const formatted = raw.map((food) => ({
          id: food.id,
          name: food.name,
          category: formatCategory(food.category),
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          description: food.description,

          rasa: food.rasa,
          virya: food.virya,
          guna: food.guna,
          vipaka: food.vipaka,
          doshaEffects: food.doshaEffects,
          benefits: food.benefits,
          precautions: food.precautions,
          imageUrl: food.imageUrl,
        }));

        setFoods(formatted);
      } catch (err) {
        console.error("Failed to fetch foods", err);
      }
    };

    fetchFoods();
  }, [page, limit, searchTerm, filterCategory]);

  const formatCategory = (category) => {
    const map = {
      VEGETABLES: "Vegetables",
      GRAINS: "Grains",
      LEGUMES: "Legumes",
      DAIRY: "Dairy",
      FATS: "Fats",
      FRUITS: "Fruits",
      SPICES: "Spices",
    };
    return map[category] || category;
  };

  const filteredFoods = foods.filter((food) => {
    const matchesSearch =
      food.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      filterCategory === "all" ||
      food.category?.toLowerCase() === filterCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const handleAddFood = async () => {
    try {
      const payload = {
        name: newFood.name,
        category: newFood.category.toUpperCase(),
        calories: parseFloat(newFood.calories) || 0,
        protein: parseFloat(newFood.protein) || 0,
        carbs: parseFloat(newFood.carbs) || 0,
        fat: parseFloat(newFood.fat) || 0,
        description: newFood.description,

        // NEW — ayurvedic fields
        rasa: newFood.rasa,
        virya: newFood.virya,
        guna: newFood.guna,
        vipaka: newFood.vipaka,

        // JSON strings
        doshaEffects: newFood.doshaEffects || "{}",
        benefits: newFood.benefits || "[]",
        precautions: newFood.precautions || "[]",

        imageUrl: newFood.imageUrl || "",
      };

      await foodsAPI.create(payload);
      alert("Food added successfully!");
      setIsAddFoodOpen(false);

      // refresh list
      const refresh = await foodsAPI.getAll();
      setFoods(
        refresh.data.data.data.map((food) => ({
          id: food.id,
          name: food.name,
          category: formatCategory(food.category),
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          description: food.description,

          rasa: food.rasa,
          virya: food.virya,
          guna: food.guna,
          vipaka: food.vipaka,
          doshaEffects: food.doshaEffects,
          benefits: food.benefits,
          precautions: food.precautions,

          imageUrl: food.imageUrl,
        }))
      );
    } catch (err) {
      console.error("Failed to add food:", err);
      alert("Error adding food!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl text-foreground">{t("food.title")}</h1>
          <p className="text-muted-foreground">{t("food.subtitle")}</p>
        </div>

        <Dialog open={isAddFoodOpen} onOpenChange={setIsAddFoodOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              {t("food.addFoodButton")}
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("food.addNewFood")}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Food Name */}
              <div className="space-y-2">
                <Label>{t("food.foodName")}</Label>
                <Input
                  value={newFood.name}
                  onChange={(e) =>
                    setNewFood({ ...newFood, name: e.target.value })
                  }
                  placeholder={t("food.foodNamePlaceholder")}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>{t("food.category")}</Label>
                <Select
                  value={newFood.category}
                  onValueChange={(value) =>
                    setNewFood({ ...newFood, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("food.selectCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Nutrients */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>{t("food.calories")}</Label>
                  <Input
                    type="number"
                    value={newFood.calories}
                    onChange={(e) =>
                      setNewFood({ ...newFood, calories: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("food.protein")}</Label>
                  <Input
                    type="number"
                    value={newFood.protein}
                    onChange={(e) =>
                      setNewFood({ ...newFood, protein: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>{t("food.carbs")}</Label>
                  <Input
                    type="number"
                    value={newFood.carbs}
                    onChange={(e) =>
                      setNewFood({ ...newFood, carbs: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("food.fat")}</Label>
                  <Input
                    type="number"
                    value={newFood.fat}
                    onChange={(e) =>
                      setNewFood({ ...newFood, fat: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Ayurvedic Fields */}
              <div className="space-y-2">
                <Label className="font-semibold">Ayurvedic Properties</Label>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Rasa</Label>
                    <Input
                      value={newFood.rasa}
                      onChange={(e) =>
                        setNewFood({ ...newFood, rasa: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Virya</Label>
                    <Input
                      value={newFood.virya}
                      onChange={(e) =>
                        setNewFood({ ...newFood, virya: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Guna</Label>
                    <Input
                      value={newFood.guna}
                      onChange={(e) =>
                        setNewFood({ ...newFood, guna: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Vipaka</Label>
                    <Input
                      value={newFood.vipaka}
                      onChange={(e) =>
                        setNewFood({ ...newFood, vipaka: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* JSON Fields */}
              <div className="space-y-2">
                <Label>Dosha Effects (JSON)</Label>
                <Textarea
                  rows={2}
                  value={newFood.doshaEffects}
                  onChange={(e) =>
                    setNewFood({ ...newFood, doshaEffects: e.target.value })
                  }
                  placeholder={`{"vata": "increase", "pitta": "reduce"}`}
                />
              </div>

              <div className="space-y-2">
                <Label>Benefits (JSON Array)</Label>
                <Textarea
                  rows={2}
                  value={newFood.benefits}
                  onChange={(e) =>
                    setNewFood({ ...newFood, benefits: e.target.value })
                  }
                  placeholder={`["good for digestion", "improves immunity"]`}
                />
              </div>

              <div className="space-y-2">
                <Label>Precautions (JSON Array)</Label>
                <Textarea
                  rows={2}
                  value={newFood.precautions}
                  onChange={(e) =>
                    setNewFood({ ...newFood, precautions: e.target.value })
                  }
                  placeholder={`["avoid at night", "not for diabetes"]`}
                />
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input
                  value={newFood.imageUrl}
                  onChange={(e) =>
                    setNewFood({ ...newFood, imageUrl: e.target.value })
                  }
                  placeholder="https://example.com/food.jpg"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>{t("food.description")}</Label>
                <Textarea
                  rows={3}
                  value={newFood.description}
                  onChange={(e) =>
                    setNewFood({ ...newFood, description: e.target.value })
                  }
                  placeholder={t("food.descriptionPlaceholder")}
                />
              </div>

              {/* Footer */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAddFoodOpen(false)}
                >
                  {t("common.cancel")}
                </Button>

                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleAddFood}
                >
                  {t("food.addFoodButton")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search + Category Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder={t("food.search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t("food.filterCategory")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("food.all")}</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Food List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFoods.map((food) => (
          <Card key={food.id} className="overflow-hidden p-3">
            {/* SMALL IMAGE + TITLE */}
            <div className="flex items-center gap-3 px-3 pt-2">
              <img
                src={food.imageUrl || "/placeholder-food.png"}
                alt={food.name}
                className="w-20 h-20 rounded-md object-cover border"
              />

              <div>
                <CardTitle className="text-lg">{food.name}</CardTitle>
                <p className="text-xs text-muted-foreground">{food.category}</p>
              </div>
            </div>

            <CardContent className="space-y-4 mt-4">
              {/* NUTRIENTS GRID */}
              <div>
                <p className="text-sm font-medium mb-1">Nutrients</p>
                <div className="grid grid-cols-2 gap-2 text-sm bg-secondary border border-border/50 p-2 rounded-md">
                  <p>Calories: {food.calories ?? "-"} kcal</p>
                  <p>Protein: {food.protein ?? "-"} g</p>
                  <p>Carbs: {food.carbs ?? "-"} g</p>
                  <p>Fat: {food.fat ?? "-"} g</p>
                </div>
              </div>

              {/* AYURVEDIC PROPERTIES */}
              <div>
                <p className="text-sm font-medium mb-1">Ayurvedic Properties</p>
                <div className="grid grid-cols-2 gap-2 text-xs bg-muted border border-border/50 p-2 rounded-md">
                  <p>
                    <span className="font-semibold">Rasa:</span>{" "}
                    {food.rasa || "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Virya:</span>{" "}
                    {food.virya || "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Guna:</span>{" "}
                    {food.guna || "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Vipaka:</span>{" "}
                    {food.vipaka || "-"}
                  </p>
                </div>
              </div>

              {/* DOSHA EFFECTS */}
              {food.doshaEffects && (
                <div>
                  <p className="text-sm font-medium mb-1">Dosha Effects</p>
                  <div className="text-xs bg-primary/10 border border-primary/30 p-2 rounded-md break-words">
                    {food.doshaEffects}
                  </div>
                </div>
              )}

              {/* DESCRIPTION */}
              {food.description && (
                <div>
                  <p className="text-sm font-medium mb-1">Description</p>
                  <p className="text-xs text-muted-foreground">
                    {food.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-2 mt-6">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Prev
        </Button>

        <span className="text-sm">
          Page {page} of {totalPages}
        </span>

        <Button
          variant="outline"
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>

      <div className="flex justify-center mt-3">
        <Select
          value={String(limit)}
          onValueChange={(v) => setLimit(Number(v))}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6">6 per page</SelectItem>
            <SelectItem value="12">12 per page</SelectItem>
            <SelectItem value="24">24 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredFoods.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">{t("food.noFoods")}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
