// FULLY DYNAMIC UPDATED VERSION
// Integrated with your actual backend APIs

import React, { useEffect, useState } from "react";
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
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Progress } from "./ui/progress";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  ChevronLeft,
  Save,
  Utensils,
  Clock,
} from "lucide-react";

import { authAPI, dietPlansAPI, foodsAPI, patientsAPI } from "../services/api";

/* --------------------------------------------
   Helper: Nutrition Calculation
---------------------------------------------*/
const calculateNutrition = (foodItem, qtyGrams) => {
  if (!foodItem) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const ratio = qtyGrams / 100;
  return {
    calories: Math.round((foodItem?.calories || 0) * ratio),
    protein: Math.round((foodItem?.protein || 0) * ratio),
    carbs: Math.round((foodItem?.carbs || 0) * ratio),
    fat: Math.round((foodItem?.fat || 0) * ratio),
  };
};

const mealTypeToEnum = (mealType) => {
  const map = {
    breakfast: "BREAKFAST",
    lunch: "LUNCH",
    dinner: "DINNER",
    snack: "SNACK",
  };
  return map[mealType];
};

const enumToMealType = (mealType) => {
  const map = {
    BREAKFAST: "breakfast",
    LUNCH: "lunch",
    DINNER: "dinner",
    SNACK: "snack",
  };
  return map[mealType] || "breakfast";
};

const getDoshaColor = (dosha) => {
  if (!dosha) return "bg-slate-100 text-slate-700 border-slate-200";
  if (dosha.includes("Vata"))
    return "bg-blue-100 text-blue-700 border-blue-200";
  if (dosha.includes("Pitta")) return "bg-red-100 text-red-700 border-red-200";
  if (dosha.includes("Kapha"))
    return "bg-green-100 text-green-700 border-green-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
};

// Helper to parse dosha effects from your API response
const parseDoshaEffects = (doshaEffects) => {
  if (!doshaEffects) return "";
  try {
    const effects = JSON.parse(doshaEffects);
    if (Array.isArray(effects)) return effects.join(", ");
    return String(effects);
  } catch {
    return doshaEffects;
  }
};

/* --------------------------------------------
   MAIN COMPONENT
---------------------------------------------*/
export function CreateDietPlans() {
  const [dietPlans, setDietPlans] = useState([]);
  const [patients, setPatients] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState(null);

  // UI states
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Plan meta
  const [newPlanMeta, setNewPlanMeta] = useState({
    patientId: "",
    planName: "",
    description: "",
    doshaType: "VATA", // Default
    duration: 1,
  });

  // Days editor
  const [days, setDays] = useState([
    { id: 1, meals: { breakfast: [], lunch: [], snack: [], dinner: [] } },
  ]);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [activeMealType, setActiveMealType] = useState("breakfast");

  const [pantrySearch, setPantrySearch] = useState("");

  /* --------------------------------------------
     Load dynamic data from backend
  ---------------------------------------------*/
  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      try {
        // Load doctor info (to get doctorId)
        const doctorRes = await authAPI.getMe();
        const doctorData = doctorRes?.data?.data;
        setDoctorInfo(doctorData);

        // Load patients associated with this doctor
        const patientsRes = await patientsAPI.getByDoctor();
        setPatients(patientsRes?.data?.data || doctorData?.patient || []);

        // Load all foods
        const foodsRes = await foodsAPI.getAll();
        setFoods(foodsRes?.data?.data?.data || foodsRes?.data?.data || []);

        // Load existing diet plans
        const plansRes = await dietPlansAPI.getAll();
        setDietPlans(plansRes?.data?.data || plansRes?.data || []);
      } catch (err) {
        console.error("Failed loading initial data", err);
      }
      setLoading(false);
    };

    loadInitial();
  }, []);

  /* --------------------------------------------
     Convert days → API format
  ---------------------------------------------*/
  const convertDaysForAPI = () => {
    const items = [];
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    days.forEach((day) => {
      const dayNumber = day.id;
      Object.keys(day.meals).forEach((mealKey) => {
        day.meals[mealKey].forEach((it) => {
          const nutrition = calculateNutrition(it.food, it.quantity);
          totalCalories += nutrition.calories;
          totalProtein += nutrition.protein;
          totalCarbs += nutrition.carbs;
          totalFat += nutrition.fat;

          items.push({
            dayNumber,
            mealType: mealTypeToEnum(mealKey),
            foodId: it.food.id,
            quantity: it.quantity,
            unit: "gram", // Your API expects "gram"
            time: it.time || getDefaultTime(mealKey),
            notes: it.notes || "",
          });
        });
      });
    });

    return {
      items,
      totals: {
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
      },
    };
  };

  const getDefaultTime = (mealType) => {
    const times = {
      breakfast: "08:00",
      lunch: "13:00",
      snack: "16:00",
      dinner: "20:00",
    };
    return times[mealType] || "08:00";
  };

  /* --------------------------------------------
     Save diet plan to backend
  ---------------------------------------------*/
  const handleSavePlan = async () => {
    if (!newPlanMeta.planName || !newPlanMeta.patientId) {
      alert("Enter plan name & select patient");
      return;
    }

    if (!doctorInfo?.id) {
      alert("Doctor information not available");
      return;
    }

    // Convert days → items WITH totals inside each item
    const items = [];
    days.forEach((day) => {
      const dayNumber = day.id;

      Object.keys(day.meals).forEach((mealKey) => {
        day.meals[mealKey].forEach((it) => {
          const nutrition = calculateNutrition(it.food, it.quantity);

          items.push({
            dayNumber,
            mealType: mealTypeToEnum(mealKey),
            foodId: it.food.id,
            quantity: it.quantity,
            unit: "gram",
            time: it.time || getDefaultTime(mealKey),
            notes: it.notes || "",

            // ✔ ONLY per-item totals allowed by backend
            totals: {
              totalCalories: nutrition.calories,
              totalProtein: nutrition.protein,
              totalCarbs: nutrition.carbs,
              totalFat: nutrition.fat,
            },
          });
        });
      });
    });

    const payload = {
      name: newPlanMeta.planName,
      description:
        newPlanMeta.description || `Diet plan for ${newPlanMeta.duration} days`,
      doctorId: doctorInfo.id,
      patientId: newPlanMeta.patientId,
      doshaType: newPlanMeta.doshaType,
      duration: newPlanMeta.duration || days.length,
      items: items, // ✔ Only items
      // ❌ DO NOT SEND totals here
    };

    try {
      const res = await dietPlansAPI.create(payload);
      const created = res?.data?.data || res?.data;

      if (created) {
        setDietPlans((prev) => [created, ...prev]);
        setIsCreatePlanOpen(false);
        setNewPlanMeta({
          patientId: "",
          planName: "",
          description: "",
          doshaType: "VATA",
          duration: 1,
        });

        setDays([
          { id: 1, meals: { breakfast: [], lunch: [], snack: [], dinner: [] } },
        ]);

        alert("Plan created successfully!");
      }
    } catch (err) {
      console.error("Error saving plan", err);
      alert(
        "Failed to save plan: " + (err.response?.data?.message || err.message)
      );
    }
  };

  /* --------------------------------------------
     Load existing plan for editing
  ---------------------------------------------*/
  const handleEditPlan = async (planId) => {
    try {
      setLoading(true);
      const res = await dietPlansAPI.getById(planId);
      const plan = res?.data?.data || res?.data;

      if (plan) {
        // Set plan meta
        setNewPlanMeta({
          patientId: plan.patientId,
          planName: plan.name,
          description: plan.description || "",
          doshaType: plan.doshaType || "VATA",
          duration: plan.duration || 1,
        });

        // Convert plan items to days format
        const daysMap = {};

        if (plan.items && Array.isArray(plan.items)) {
          plan.items.forEach((item) => {
            const dayNum = item.dayNumber || 1;
            const mealType = enumToMealType(item.mealType);

            if (!daysMap[dayNum]) {
              daysMap[dayNum] = {
                id: dayNum,
                meals: { breakfast: [], lunch: [], snack: [], dinner: [] },
              };
            }

            // Find food details
            const food = foods.find((f) => f.id === item.foodId);
            if (food) {
              daysMap[dayNum].meals[mealType].push({
                instanceId: Date.now() + Math.random(),
                food: food,
                quantity: item.quantity || 100,
                notes: item.notes || "",
                time: item.time || getDefaultTime(mealType),
              });
            }
          });
        }

        const daysArray = Object.values(daysMap).sort((a, b) => a.id - b.id);
        if (daysArray.length === 0) {
          daysArray.push({
            id: 1,
            meals: { breakfast: [], lunch: [], snack: [], dinner: [] },
          });
        }

        setDays(daysArray);
        setActiveDayIndex(0);
        setIsCreatePlanOpen(true);
      }
    } catch (err) {
      console.error("Error loading plan for edit", err);
      alert("Failed to load plan");
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------------------------
     Delete diet plan
  ---------------------------------------------*/
  const handleDeletePlan = async (planId) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;

    try {
      await dietPlansAPI.delete(planId);
      setDietPlans((prev) => prev.filter((p) => p.id !== planId));
      alert("Plan deleted successfully");
    } catch (err) {
      console.error("Error deleting plan", err);
      alert("Failed to delete plan");
    }
  };

  /* --------------------------------------------
     Add/remove foods in editor
  ---------------------------------------------*/
  const handleAddDay = () => {
    const newDay = days.length + 1;
    setDays([
      ...days,
      {
        id: newDay,
        meals: { breakfast: [], lunch: [], snack: [], dinner: [] },
      },
    ]);
    setActiveDayIndex(days.length);
  };

  const handleRemoveDay = (dayIndex) => {
    if (days.length <= 1) {
      alert("Cannot remove the only day");
      return;
    }
    const newDays = days.filter((_, idx) => idx !== dayIndex);
    setDays(newDays);
    if (activeDayIndex >= dayIndex) {
      setActiveDayIndex(Math.max(0, activeDayIndex - 1));
    }
  };

  const handleAddFoodToMeal = (food) => {
    const newDays = JSON.parse(JSON.stringify(days));
    newDays[activeDayIndex].meals[activeMealType].push({
      instanceId: Date.now() + Math.random(),
      food,
      quantity: 100,
      notes: "",
      time: getDefaultTime(activeMealType),
    });
    setDays(newDays);
  };

  const handleRemoveFood = (meal, id) => {
    const newDays = JSON.parse(JSON.stringify(days));
    newDays[activeDayIndex].meals[meal] = newDays[activeDayIndex].meals[
      meal
    ].filter((i) => i.instanceId !== id);
    setDays(newDays);
  };

  const handleUpdateQty = (meal, id, qty) => {
    const newDays = JSON.parse(JSON.stringify(days));
    const it = newDays[activeDayIndex].meals[meal].find(
      (i) => i.instanceId === id
    );
    if (it) it.quantity = Number(qty);
    setDays(newDays);
  };

  const handleUpdateNote = (meal, id, note) => {
    const newDays = JSON.parse(JSON.stringify(days));
    const it = newDays[activeDayIndex].meals[meal].find(
      (i) => i.instanceId === id
    );
    if (it) it.notes = note;
    setDays(newDays);
  };

  const handleUpdateTime = (meal, id, time) => {
    const newDays = JSON.parse(JSON.stringify(days));
    const it = newDays[activeDayIndex].meals[meal].find(
      (i) => i.instanceId === id
    );
    if (it) it.time = time;
    setDays(newDays);
  };

  /* --------------------------------------------
     Calculate totals
  ---------------------------------------------*/
  const calculateDayTotals = (index) => {
    const day = days[index];
    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

    if (!day) return totals;

    Object.keys(day.meals).forEach((meal) => {
      day.meals[meal].forEach((item) => {
        const stats = calculateNutrition(item.food, item.quantity);
        totals.calories += stats.calories;
        totals.protein += stats.protein;
        totals.carbs += stats.carbs;
        totals.fat += stats.fat;
      });
    });

    return totals;
  };

  const currentTotals = calculateDayTotals(activeDayIndex);

  /* =====================================================================================
     RENDER: CREATE/EDIT PLAN MODE
  =====================================================================================*/
  /* ==========================================================
   CREATE / EDIT PLAN MODE — CLEAN WHITE UI (Option B)
   ==========================================================*/
  if (isCreatePlanOpen) {
    return (
      <div className="min-h-screen p-6 bg-background">
        {/* Outer Wrapper */}
        <div className="flex flex-col h-[calc(100vh-48px)] gap-4">
          {/* =========================================================
          TOP HEADER BAR
        ========================================================== */}
          <div className="bg-card border border-border rounded-xl shadow-sm px-6 py-4 flex items-center justify-between">
            {/* LEFT SIDE */}
            <div className="flex items-center gap-6">
              {/* Back Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCreatePlanOpen(false)}
                className="hover:bg-muted"
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </Button>

              {/* Plan Name + Description */}
              <div className="flex flex-col">
                <Input
                  placeholder="Plan Name"
                  className="text-lg font-semibold border-none shadow-none bg-transparent px-0 focus-visible:ring-0"
                  value={newPlanMeta.planName}
                  onChange={(e) =>
                    setNewPlanMeta({ ...newPlanMeta, planName: e.target.value })
                  }
                />

                <Input
                  placeholder="Description (optional)"
                  className="text-sm border-none shadow-none bg-transparent px-0 text-muted-foreground focus-visible:ring-0"
                  value={newPlanMeta.description}
                  onChange={(e) =>
                    setNewPlanMeta({
                      ...newPlanMeta,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              {/* Select Inputs */}
              <div className="flex items-center gap-3">
                {/* Select Patient */}
                <Select
                  value={newPlanMeta.patientId}
                  onValueChange={(v) =>
                    setNewPlanMeta({ ...newPlanMeta, patientId: v })
                  }
                >
                  <SelectTrigger className="w-44 h-10 bg-card border border-border">
                    <SelectValue placeholder="Select Patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.userId}>
                        {p.user?.name || p.name || `Patient ${p.patientCode}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Dosha Select */}
                <Select
                  value={newPlanMeta.doshaType}
                  onValueChange={(v) =>
                    setNewPlanMeta({ ...newPlanMeta, doshaType: v })
                  }
                >
                  <SelectTrigger className="w-32 h-10 bg-card border border-border">
                    <SelectValue placeholder="Dosha" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VATA">Vata</SelectItem>
                    <SelectItem value="PITTA">Pitta</SelectItem>
                    <SelectItem value="KAPHA">Kapha</SelectItem>
                    <SelectItem value="VATA_PITTA">Vata-Pitta</SelectItem>
                    <SelectItem value="VATA_KAPHA">Vata-Kapha</SelectItem>
                    <SelectItem value="PITTA_KAPHA">Pitta-Kapha</SelectItem>
                  </SelectContent>
                </Select>

                {/* Duration Input */}
                <Input
                  type="number"
                  placeholder="Days"
                  className="w-24 h-10 bg-card border border-border"
                  value={newPlanMeta.duration}
                  onChange={(e) =>
                    setNewPlanMeta({
                      ...newPlanMeta,
                      duration: parseInt(e.target.value) || 1,
                    })
                  }
                  min="1"
                  max="30"
                />
              </div>
            </div>

            {/* RIGHT SIDE BUTTONS */}
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleAddDay} className="h-10">
                <Plus className="w-4 h-4 mr-2" /> Add Day
              </Button>

              <Button
                onClick={handleSavePlan}
                className="bg-primary text-primary-foreground h-10"
              >
                <Save className="w-4 h-4 mr-2" /> Save Plan
              </Button>
            </div>
          </div>

          {/* =========================================================
          MAIN CONTENT: LEFT (Meals) + RIGHT (Pantry)
        ========================================================== */}
          <div className="flex flex-1 gap-4 overflow-hidden">
            {/* LEFT: MEAL BUILDER */}
            <div className="flex-1 bg-card border border-border rounded-xl shadow-sm p-6 overflow-y-auto">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">
                    Day {days[activeDayIndex]?.id}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configure meals for this day
                  </p>
                </div>

                <div className="text-sm text-muted-foreground flex items-center gap-4">
                  <div>
                    <span className="font-medium">Total:</span>{" "}
                    {currentTotals.calories} kcal — P: {currentTotals.protein}g
                    — C: {currentTotals.carbs}g — F: {currentTotals.fat}g
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveDay(activeDayIndex)}
                    disabled={days.length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* MEALS */}
              <div className="space-y-4">
                {Object.keys(days[activeDayIndex].meals).map((m) => (
                  <MealSection
                    key={m}
                    title={m}
                    time={getDefaultTime(m)}
                    mealType={m}
                    items={days[activeDayIndex].meals[m]}
                    isActive={activeMealType === m}
                    onActivate={() => setActiveMealType(m)}
                    onRemove={handleRemoveFood}
                    onUpdateQty={handleUpdateQty}
                    onUpdateNote={handleUpdateNote}
                    onUpdateTime={handleUpdateTime}
                  />
                ))}
              </div>
            </div>

            {/* RIGHT: PANTRY */}
            <div className="w-1/3 bg-card border border-border rounded-xl shadow-sm p-6 flex flex-col h-full min-h-0">
              {/* Pantry Header */}
              <div className="flex items-center justify-between mb-3 shrink-0">
                <h3 className="text-lg font-semibold">Food Pantry</h3>
                <Badge className="text-sm">
                  Adding to: {activeMealType.toUpperCase()}
                </Badge>
              </div>

              {/* Search */}
              <div className="relative mb-4 shrink-0">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search food..."
                  className="pl-10 h-10 bg-card border border-border"
                  value={pantrySearch}
                  onChange={(e) => setPantrySearch(e.target.value)}
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2 mb-4 shrink-0">
                <Badge variant="outline" className="cursor-pointer bg-muted">
                  All
                </Badge>
                <Badge variant="outline" className="cursor-pointer bg-muted">
                  Grains
                </Badge>
                <Badge variant="outline" className="cursor-pointer bg-muted">
                  Dairy
                </Badge>
                <Badge variant="outline" className="cursor-pointer bg-muted">
                  Vegetables
                </Badge>
              </div>

              {/* TRUE SCROLL AREA */}
              <ScrollArea className="flex-1 min-h-0">
                <div className="grid grid-cols-2 gap-3 p-2 rounded-lg">
                  {foods
                    .filter(
                      (f) =>
                        f.name
                          .toLowerCase()
                          .includes(pantrySearch.toLowerCase()) ||
                        f.category
                          .toLowerCase()
                          .includes(pantrySearch.toLowerCase())
                    )
                    .map((food) => (
                      <FoodCard
                        key={food.id}
                        food={food}
                        onAdd={() => handleAddFoodToMeal(food)}
                      />
                    ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* =========================================================
          BOTTOM DAY SWITCHER
        ========================================================== */}
          <div className="bg-muted border border-border rounded-xl shadow-sm p-3 flex items-center gap-3 overflow-x-auto">
            {days.map((d, idx) => (
              <button
                key={d.id}
                onClick={() => setActiveDayIndex(idx)}
                className={`
                px-4 py-2 rounded-full text-sm flex items-center gap-2 
                ${
                  idx === activeDayIndex
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card text-foreground border border-border"
                }
              `}
              >
                Day {d.id}
                {idx !== activeDayIndex && days.length > 1 && (
                  <Trash2
                    className="w-3 h-3 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveDay(idx);
                    }}
                  />
                )}
              </button>
            ))}

            <Button variant="outline" size="icon" onClick={handleAddDay}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ----------------------------------------------------
     RENDER: DASHBOARD MODE
  ----------------------------------------------------- */
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Diet Plans</h1>
          <p className="text-sm text-muted-foreground">
            Welcome, Dr. {doctorInfo?.name || "Doctor"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search plans..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            onClick={() => setIsCreatePlanOpen(true)}
            className="bg-primary text-white"
          >
            <Plus className="w-4 h-4 mr-2" /> Create Plan
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Diet Plans</CardTitle>
          <CardDescription>Manage patient diet plans</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading diet plans...</div>
          ) : dietPlans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No diet plans yet. Create your first plan!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Dosha</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dietPlans
                  .filter(
                    (plan) =>
                      plan.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      (plan.patient?.user?.name || "")
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                  )
                  .map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">{plan.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {plan.patient?.user?.name ||
                                plan.patient?.name ||
                                "Patient"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {plan.patient?.patientCode || ""}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{plan.duration} days</TableCell>
                      <TableCell>
                        <Badge className={getDoshaColor(plan.doshaType)}>
                          {plan.doshaType || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(plan.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="ghost" title="View">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Edit"
                            onClick={() => handleEditPlan(plan.id)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Delete"
                            onClick={() => handleDeletePlan(plan.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------------------------------
   SUB-COMPONENTS
----------------------------------------- */

function MealSection({
  title,
  time,
  mealType,
  items,
  isActive,
  onActivate,
  onRemove,
  onUpdateQty,
  onUpdateNote,
  onUpdateTime,
}) {
  const total = items.reduce(
    (acc, cur) => acc + calculateNutrition(cur.food, cur.quantity).calories,
    0
  );

  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer ${
        isActive ? "border-primary border-2" : "border-muted"
      }`}
      onClick={onActivate}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              isActive ? "bg-primary/10" : "bg-muted"
            }`}
          >
            <Utensils
              className={`w-4 h-4 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            />
          </div>
          <div>
            <div className="font-bold">{title.toUpperCase()}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="inline-block w-3 h-3" /> {time}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm font-bold">{total} kcal</div>
          <Badge variant="outline">{items.length} items</Badge>
        </div>
      </div>

      <div className="space-y-2">
        {items.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-2">
            Click on a food from the pantry to add to this meal
          </div>
        )}
        {items.map((it) => (
          <AddedFoodRow
            key={it.instanceId}
            item={it}
            mealType={mealType}
            onRemove={onRemove}
            onUpdateQty={onUpdateQty}
            onUpdateNote={onUpdateNote}
            onUpdateTime={onUpdateTime}
          />
        ))}
      </div>
    </div>
  );
}

function AddedFoodRow({
  item,
  mealType,
  onRemove,
  onUpdateQty,
  onUpdateNote,
  onUpdateTime,
}) {
  const n = calculateNutrition(item.food, item.quantity);
  const doshaEffects = parseDoshaEffects(item.food.doshaEffects);

  return (
    <div className="flex items-center justify-between p-3 rounded border hover:bg-gray-50">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <div className="font-semibold">{item.food.name}</div>
          <div
            className={`text-[10px] px-1 rounded ${getDoshaColor(
              doshaEffects
            )}`}
          >
            {doshaEffects || "No dosha info"}
          </div>
          <Badge variant="outline" className="text-[10px]">
            {item.food.category}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground mb-2">
          {n.calories} kcal • P {n.protein}g • C {n.carbs}g • F {n.fat}g
        </div>
        <div className="flex gap-2">
          <Input
            className="h-8 text-xs"
            placeholder="Notes (e.g., Add spices)"
            value={item.notes}
            onChange={(e) =>
              onUpdateNote(mealType, item.instanceId, e.target.value)
            }
          />
          <Input
            className="h-8 text-xs w-24"
            placeholder="HH:MM"
            value={item.time}
            onChange={(e) =>
              onUpdateTime(mealType, item.instanceId, e.target.value)
            }
          />
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            className="w-16 h-8 text-center"
            value={item.quantity}
            onChange={(e) =>
              onUpdateQty(mealType, item.instanceId, e.target.value)
            }
            min="1"
          />
          <span className="text-xs">g</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            onClick={() => onRemove(mealType, item.instanceId)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function FoodCard({ food, onAdd }) {
  // 1. Dosha Color Mapping
  const doshaColors = {
    Vata: "bg-blue-50 text-blue-700 border-blue-200",
    Pitta: "bg-red-50 text-red-700 border-red-200",
    Kapha: "bg-green-50 text-green-700 border-green-200",
    "Vata-Pitta": "bg-purple-50 text-purple-700 border-purple-200",
    "Pitta-Kapha": "bg-orange-50 text-orange-700 border-orange-200",
    "Vata-Kapha": "bg-teal-50 text-teal-700 border-teal-200",
  };

  // Helper to get color (defaults to gray if not found)
  const doshaEffect = parseDoshaEffects(food.doshaEffects); // Assuming you have this helper from before
  const badgeColor =
    doshaColors[doshaEffect] || "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <div className="group relative bg-white border rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full">
      {/* TOP SECTION: Image + Info + Action */}
      <div className="p-3 flex gap-3">
        {/* 2. Small Image (1:1 Ratio) */}
        <div className="shrink-0">
          <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center border">
            {food.image ? (
              <img
                src={food.image}
                alt={food.name}
                className="w-full h-full object-cover"
              />
            ) : (
              // Fallback Icon if no image
              <div className="text-gray-300">
                <Utensils className="w-6 h-6" />
              </div>
            )}
          </div>
        </div>

        {/* Middle Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex justify-between items-start">
            <h4
              className="font-bold text-gray-900 truncate pr-2"
              title={food.name}
            >
              {food.name}
            </h4>

            {/* Add Button (Absolute positioned top right of flex or just inline) */}
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white -mt-1 -mr-1"
              onClick={onAdd}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mb-1.5">
            {food.category}
          </p>

          {/* 3. Dosha Badge */}
          <div className="flex flex-wrap gap-1">
            {doshaEffect && (
              <Badge
                variant="outline"
                className={`text-[10px] px-1.5 py-0 h-5 font-medium border ${badgeColor}`}
              >
                {doshaEffect}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Macro Grid */}
      <div className="mt-auto bg-gray-50/50 border-t p-2">
        <div className="grid grid-cols-4 gap-1 text-center divide-x divide-gray-200/50">
          {/* Calories */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Kcal
            </span>
            <span className="text-sm font-bold text-gray-800">
              {food.calories}
            </span>
          </div>

          {/* Protein (Green Highlight) */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Prot
            </span>
            <span className="text-sm font-bold text-green-600">
              {food.protein}g
            </span>
          </div>

          {/* Carbs (Blue Highlight) */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Carb
            </span>
            <span className="text-sm font-bold text-blue-600">
              {food.carbs}g
            </span>
          </div>

          {/* Fat (Orange Highlight) */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Fat
            </span>
            <span className="text-sm font-bold text-orange-600">
              {food.fat}g
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
