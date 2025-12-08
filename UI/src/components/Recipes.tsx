import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  ChefHat,
  Search,
  Plus,
  Clock,
  Users,
  Flame,
  Heart,
  Filter,
  Star,
  Bookmark,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useTranslation } from "react-i18next";
import { t } from "i18next";

const mockRecipes = [
  {
    id: 1,
    name: t("recipes.recipe1.name", "Kitchari - Cleansing One-Pot Meal"),
    description:
      "Classic Ayurvedic one-pot meal perfect for cleansing and digestion",
    cookTime: "30 mins",
    servings: 4,
    difficulty: "Easy",
    calories: 285,
    dosha: [
      t("recipes.dosha.vata", "Vata"),
      t("recipes.dosha.kapha", "Kapha"),
      t("recipes.dosha.pitta", "Pitta"),
    ],
    category: t("recipes.category.mainCourse", "Main Course"),
    ingredients: [
      t("recipes.ingredients.mungDal", "Mung dal"),
      t("recipes.ingredients.basmatiRice", "Basmati rice"),
      t("recipes.ingredients.turmeric", "Turmeric"),
      t("recipes.ingredients.cumin", "Cumin"),
      t("recipes.ingredients.ginger", "Ginger"),
      t("recipes.ingredients.ghee", "Ghee"),
    ],
    benefits: [
      t("recipes.benefits.digestiveHealing", "Digestive healing"),
      t("recipes.benefits.detoxification", "Detoxification"),
      t("recipes.benefits.easyToDigest", "Easy to digest"),
    ],
    image: null,
    rating: 4.8,
    saved: true,
    tags: [
      t("recipes.tags.detox", "detox"),
      t("recipes.tags.digestive", "digestive"),
      t("recipes.tags.cleansing", "cleansing"),
    ],
  },
  {
    id: 2,
    name: t("recipes.recipe2.name", "Golden Milk Turmeric Latte"),
    description: t(
      "recipes.recipe2.description",
      "Warming anti-inflammatory drink perfect for evening"
    ),
    cookTime: "10 mins",
    servings: 1,
    difficulty: t("recipes.difficulty.easy", "Easy"),
    calories: 120,
    dosha: [t("recipes.dosha.vata", "Vata"), t("recipes.dosha.kapha", "Kapha")],
    category: t("recipes.category.beverages", "Beverages"),
    ingredients: [
      t("recipes.ingredients.turmeric", "Turmeric"),
      t("recipes.ingredients.coconutMilk", "Coconut milk"),
      t("recipes.ingredients.ginger", "Ginger"),
      t("recipes.ingredients.cinnamon", "Cinnamon"),
      t("recipes.ingredients.blackPepper", "Black pepper"),
      t("recipes.ingredients.honey", "Honey"),
    ],
    benefits: [
      t("recipes.benefits.antiInflammatory", "Anti-inflammatory"),
      t("recipes.benefits.immunityBoost", "Immunity boost"),
      t("recipes.benefits.betterSleep", "Better sleep"),
    ],
    image: null,
    rating: 4.9,
    saved: false,
    tags: [
      t("recipes.tags.immunity", "immunity"),
      t("recipes.tags.antiInflammatory", "anti-inflammatory"),
      t("recipes.tags.evening", "evening"),
    ],
  },
  {
    id: 3,
    name: t("recipes.recipe3.name", "Cooling Cucumber Raita"),
    description: t(
      "recipes.recipe3.description",
      "Refreshing yogurt-based side dish to balance Pitta"
    ),
    cookTime: "15 mins",
    servings: 6,
    difficulty: t("recipes.difficulty.easy", "Easy"),
    calories: 45,
    dosha: [t("recipes.dosha.pitta", "Pitta")],
    category: t("recipes.category.sideDish", "Side Dish"),
    ingredients: [
      t("recipes.ingredients.cucumber", "Cucumber"),
      t("recipes.ingredients.greekYogurt", "Greek yogurt"),
      t("recipes.ingredients.mint", "Mint"),
      t("recipes.ingredients.cumin", "Cumin"),
      t("recipes.ingredients.blackSalt", "Black salt"),
      t("recipes.ingredients.coriander", "Coriander"),
    ],
    benefits: [
      t("recipes.benefits.coolingEffect", "Cooling effect"),
      t("recipes.benefits.digestiveAid", "Digestive aid"),
      t("recipes.benefits.hydrating", "Hydrating"),
    ],
    image: null,
    rating: 4.6,
    saved: true,
    tags: [
      t("recipes.tags.cooling", "cooling"),
      t("recipes.tags.hydrating", "hydrating"),
      t("recipes.tags.pitta", "pitta"),
    ],
  },
  {
    id: 4,
    name: t("recipes.recipe4.name", "Spiced Quinoa Bowl"),
    description: t(
      "recipes.recipe4.description",
      "Nutritious grain bowl with warming spices"
    ),
    cookTime: "25 mins",
    servings: 3,
    difficulty: t("recipes.difficulty.medium", "Medium"),
    calories: 380,
    dosha: [t("recipes.dosha.vata", "Vata"), t("recipes.dosha.kapha", "Kapha")],
    category: t("recipes.category.mainCourse", "Main Course"),
    ingredients: [
      t("recipes.ingredients.quinoa", "Quinoa"),
      t("recipes.ingredients.sweetPotato", "Sweet potato"),
      t("recipes.ingredients.spinach", "Spinach"),
      t("recipes.ingredients.chickpeas", "Chickpeas"),
      t("recipes.ingredients.cumin", "Cumin"),
      t("recipes.ingredients.turmeric", "Turmeric"),
    ],
    benefits: [
      t("recipes.benefits.highProtein", "High protein"),
      t("recipes.benefits.grounding", "Grounding"),
      t("recipes.benefits.nutrientDense", "Nutrient dense"),
    ],
    image: null,
    rating: 4.7,
    saved: false,
    tags: [
      t("recipes.tags.protein", "protein"),
      t("recipes.tags.grounding", "grounding"),
      t("recipes.tags.nutritious", "nutritious"),
    ],
  },
  {
    id: 5,
    name: t("recipes.recipe5.name", "Digestive Tea Blend"),
    description: t(
      "recipes.recipe5.description",
      "Herbal tea to kindle digestive fire"
    ),
    cookTime: "5 mins",
    servings: 1,
    difficulty: t("recipes.difficulty.easy", "Easy"),
    calories: 3,
    dosha: [
      t("recipes.dosha.vata", "Vata"),
      t("recipes.dosha.pitta", "Pitta"),
      t("recipes.dosha.kapha", "Kapha"),
    ],
    category: t("recipes.category.beverages", "Beverages"),
    ingredients: [
      t("recipes.ingredients.ginger", "Ginger"),
      t("recipes.ingredients.fennel", "Fennel"),
      t("recipes.ingredients.corianderSeeds", "Coriander seeds"),
      t("recipes.ingredients.cardamom", "Cardamom"),
      t("recipes.ingredients.ajwain", "Ajwain"),
    ],
    benefits: [
      t("recipes.benefits.digestiveFire", "Digestive fire"),
      t("recipes.benefits.reducesBloating", "Reduces bloating"),
      t("recipes.benefits.afterMealAid", "After-meal aid"),
    ],
    image: null,
    rating: 4.5,
    saved: true,
    tags: [
      t("recipes.tags.digestive", "digestive"),
      t("recipes.tags.herbal", "herbal"),
      t("recipes.tags.agni", "agni"),
    ],
  },
  {
    id: 6,
    name: t("recipes.recipe6.name", "Nourishing Bone Broth"),
    description: t(
      "recipes.recipe6.description",
      "Deeply nourishing broth for building strength"
    ),
    cookTime: "4 hours",
    servings: 8,
    difficulty: t("recipes.difficulty.medium", "Medium"),
    calories: 85,
    dosha: [t("recipes.dosha.vata", "Vata")],
    category: t("recipes.category.soups", "Soups"),
    ingredients: [
      t("recipes.ingredients.organicBones", "Organic bones"),
      t("recipes.ingredients.vegetables", "Vegetables"),
      t("recipes.ingredients.herbs", "Herbs"),
      t("recipes.ingredients.ginger", "Ginger"),
      t("recipes.ingredients.turmeric", "Turmeric"),
      t("recipes.ingredients.bayLeaves", "Bay leaves"),
    ],
    benefits: [
      t("recipes.benefits.deepNourishment", "Deep nourishment"),
      t("recipes.benefits.jointHealth", "Joint health"),
      t("recipes.benefits.buildingTissues", "Building tissues"),
    ],
    image: null,
    rating: 4.8,
    saved: false,
    tags: [
      t("recipes.tags.nourishing", "nourishing"),
      t("recipes.tags.building", "building"),
      t("recipes.tags.strength", "strength"),
    ],
  },
];

const categories = [
  { value: "all", label: "All Categories" },
  { value: "Main Course", label: "Main Course" },
  { value: "Side Dish", label: "Side Dish" },
  { value: "Beverages", label: "Beverages" },
  { value: "Soups", label: "Soups" },
  { value: "Desserts", label: "Desserts" },
];

const doshaOptions = [
  { value: "all", label: "All Doshas" },
  { value: "Vata", label: "Vata" },
  { value: "Pitta", label: "Pitta" },
  { value: "Kapha", label: "Kapha" },
];

const doshaColors = {
  Vata: "bg-blue-100 text-blue-800",
  Pitta: "bg-red-100 text-red-800",
  Kapha: "bg-green-100 text-green-800",
};

export function Recipes() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDosha, setSelectedDosha] = useState("all");
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const filteredRecipes = mockRecipes.filter((recipe) => {
    const lowerSearch = searchTerm.toLowerCase();

    const matchesSearch =
      (recipe.name?.toLowerCase().includes(lowerSearch) ?? false) ||
      (recipe.description?.toLowerCase().includes(lowerSearch) ?? false) ||
      (Array.isArray(recipe.tags) &&
        recipe.tags.some(
          (tag) =>
            typeof tag === "string" && tag.toLowerCase().includes(lowerSearch)
        ));

    const matchesCategory =
      selectedCategory === "all" || recipe.category === selectedCategory;

    const matchesDosha =
      selectedDosha === "all" ||
      recipe.dosha?.some(
        (d) =>
          typeof d === "string" &&
          d.toLowerCase() === selectedDosha.toLowerCase()
      );

    const matchesSaved = !showSavedOnly || recipe.saved;

    return matchesSearch && matchesCategory && matchesDosha && matchesSaved;
  });

  const toggleSaved = (recipeId) => {
    // Mock function to toggle saved status
    console.log(`Toggling saved status for recipe ${recipeId}`);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl text-foreground">{t("recipes.title")}</h1>
          <p className="text-muted-foreground">{t("recipes.welcomeMessage")}</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          {t("recipes.addRecipe")}
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-4 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedDosha} onValueChange={setSelectedDosha}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Dosha" />
            </SelectTrigger>
            <SelectContent>
              {doshaOptions.map((dosha) => (
                <SelectItem key={dosha.value} value={dosha.value}>
                  {dosha.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant={showSavedOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setShowSavedOnly(!showSavedOnly)}
        >
          <Bookmark className="w-4 h-4 mr-2" />
          Saved Only
        </Button>
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe) => (
          <Card key={recipe.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-primary" />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSaved(recipe.id)}
                  className={recipe.saved ? "text-primary" : ""}
                >
                  <Bookmark
                    className={`w-4 h-4 ${recipe.saved ? "fill-current" : ""}`}
                  />
                </Button>
              </div>
              <CardTitle className="text-lg">{recipe.name}</CardTitle>
              <CardDescription>{recipe.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Recipe Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      {recipe.cookTime}
                    </span>
                    <span className="flex items-center text-muted-foreground">
                      <Users className="w-3 h-3 mr-1" />
                      {recipe.servings}
                    </span>
                    <span className="flex items-center text-muted-foreground">
                      <Flame className="w-3 h-3 mr-1" />
                      {recipe.calories} cal
                    </span>
                  </div>
                </div>

                {/* Doshas */}
                <div className="flex flex-wrap gap-1">
                  {recipe.dosha.map((dosha) => (
                    <Badge
                      key={dosha}
                      className={`text-xs ${doshaColors[dosha]}`}
                    >
                      {dosha}
                    </Badge>
                  ))}
                  <Badge
                    className={`text-xs ${getDifficultyColor(
                      recipe.difficulty
                    )}`}
                  >
                    {recipe.difficulty}
                  </Badge>
                </div>

                {/* Benefits */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Benefits:</p>
                  <div className="flex flex-wrap gap-1">
                    {recipe.benefits.slice(0, 2).map((benefit) => (
                      <Badge
                        key={benefit}
                        variant="secondary"
                        className="text-xs"
                      >
                        {benefit}
                      </Badge>
                    ))}
                    {recipe.benefits.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{recipe.benefits.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Rating and Action */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-current text-yellow-400" />
                    <span className="text-sm">{recipe.rating}</span>
                  </div>
                  <Button variant="outline" size="sm">
                    View Recipe
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <ChefHat className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg text-muted-foreground mb-2">
            No recipes found
          </h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}
    </div>
  );
}
