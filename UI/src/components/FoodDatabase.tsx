import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { foodsAPI } from "../services/api";
import { 
  Plus,
  Search,
  Filter,
  Apple,
  Info
} from 'lucide-react';

import { useTranslation } from "react-i18next"; 

export function FoodDatabase() {
  const { t } = useTranslation();
  const [foods, setFoods] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);

  const [newFood, setNewFood] = useState({
    name: "",
    category: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    fiber: "",
    description: "",
  });

  const categories = ["Grains", "Legumes", "Vegetables", "Fruits", "Spices", "Fats", "Dairy"];

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await foodsAPI.getAll();
        const raw = response.data?.data?.data || [];

        const formatted = raw.map((food) => ({
          id: food.id,
          name: food.name,
          category: formatCategory(food.category),
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          fiber: food.fiber,
          description: food.description,
        }));

        setFoods(formatted);
      } catch (err) {
        console.error("Failed to fetch foods", err);
      }
    };

    fetchFoods();
  }, []);

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
      filterCategory === "all" || food.category?.toLowerCase() === filterCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const handleAddFood = async () => {
    try {
      const payload = {
        name: newFood.name,
        category: newFood.category.toUpperCase(),
        calories: parseFloat(newFood.calories),
        protein: parseFloat(newFood.protein) || 0,
        carbs: parseFloat(newFood.carbs) || 0,
        fat: parseFloat(newFood.fat) || 0,
        fiber: parseFloat(newFood.fiber) || 0,
        description: newFood.description,
        vitamins: "{}", // placeholder until backend supports it
        minerals: "{}",
        benefits: "[]",
        precautions: "[]",
        doshaEffects: "{}",
      };

      await foodsAPI.create(payload);
      alert("Food added successfully!");
      setIsAddFoodOpen(false);

      const refresh = await foodsAPI.getAll();
      setFoods(refresh.data.data.data.map((food) => ({
        id: food.id,
        name: food.name,
        category: formatCategory(food.category),
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber,
        description: food.description,
      })));
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

            <div className="grid grid-cols-3 gap-2">
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

              <div className="space-y-2">
                <Label>{t("food.fiber")}</Label>
                <Input
                  type="number"
                  value={newFood.fiber}
                  onChange={(e) =>
                    setNewFood({ ...newFood, fiber: e.target.value })
                  }
                />
              </div>
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
              <Button variant="outline" onClick={() => setIsAddFoodOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button className="bg-primary hover:bg-primary/90" onClick={handleAddFood}>
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
        <Card key={food.id}>
          <CardHeader className="pb-3 flex justify-between">
            <div>
              <CardTitle className="text-lg">{food.name}</CardTitle>
              <p className="text-xs text-muted-foreground">{food.category}</p>
            </div>

            <div className="text-right">
              <p className="text-xl font-bold text-primary">{food.calories}</p>
              <p className="text-xs text-muted-foreground">{t("food.kcal")}</p>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="grid grid-cols-4 text-center gap-1">
              <div><p className="text-xs">{t("food.protein")}</p><p className="text-sm">{food.protein}g</p></div>
              <div><p className="text-xs">{t("food.carbs")}</p><p className="text-sm">{food.carbs}g</p></div>
              <div><p className="text-xs">{t("food.fat")}</p><p className="text-sm">{food.fat}g</p></div>
              <div><p className="text-xs">{t("food.fiber")}</p><p className="text-sm">{food.fiber}g</p></div>
            </div>

            {food.description && (
              <p className="text-xs text-muted-foreground">{food.description}</p>
            )}
          </CardContent>
        </Card>
      ))}
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