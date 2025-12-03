import React, { useEffect, useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Download,
  Sun,
  Utensils,
  Coffee,
  Moon,
  Flame,
  Activity,
  Wheat,
  Droplets,
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * IMPORTANT:
 * Replace these imports with your actual API helpers / service objects.
 *
 * Example mapping (based on your earlier messages):
 * - authApi.getMe -> GET /auth/me
 * - dietPlanApi.getForPatient(patientId) -> GET /diet-plans/patient/:patientId
 * - foodApi.getById(id) -> GET /foods/:id
 *
 * If your project exposes these methods differently, just update imports below.
 */
import { authAPI, dietPlansAPI, foodsAPI } from "../services/api"; // { getMe: () => api.get("/auth/me") }

// -------------------- types --------------------
type Food = {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  fiber?: number | null;
  rasa?: string | null;
  virya?: string | null;
  guna?: string | null;
  vipaka?: string | null;
  doshaEffects?: string | null;
  benefits?: string | null;
  precautions?: string | null;
  imageUrl?: string | null;
};

type DietItem = {
  dayNumber: number;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
  foodId: string;
  quantity: number;
  unit: string;
  time: string;
  notes?: string | null;
  totals?: {
    totalCalories?: number;
    totalProtein?: number;
    totalCarbs?: number;
    totalFat?: number;
  };
  food?: Food; // merged after fetching
};

type DietPlanFromApi = {
  name: string;
  description?: string;
  doctorId?: string;
  patientId: string;
  doshaType?: string;
  duration?: number;
  items: DietItem[];
};

export default function PremiumDietChartDynamic() {
  const [user, setUser] = useState<any | null>(null);
  const [plan, setPlan] = useState<DietPlanFromApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<number>(1);

  // fetch logged-in user, then diet plan for that patient, then foods
  useEffect(() => {
    let mounted = true;

    async function loadAll() {
      setLoading(true);
      setError(null);

      try {
        // 1) get logged in user
        const meRes = await authAPI.getMe();
        // assume response body shape { success, message, data }
        const me = meRes?.data?.data ?? meRes?.data ?? meRes;
        if (!mounted) return;
        setUser(me);

        // patientId is the user id (as you said)
        const patientId = me?.id;
        if (!patientId) {
          setError("Could not find logged-in user id.");
          setLoading(false);
          return;
        }

        // 2) get diet plan for patient
        const planRes = await dietPlansAPI.getForPatient(patientId);
        // many APIs return an object with data field; standardize:
        const plansArray =
          planRes?.data?.data?.data || // deepest match
          planRes?.data?.data || // common match
          planRes?.data || // fallback
          [];

        if (!Array.isArray(plansArray) || plansArray.length === 0) {
          setError("No diet plans found for this patient.");
          setLoading(false);
          return;
        }

        // ✔ pick the active plan, else fallback to first plan
        const remotePlan =
          plansArray.find((p: any) => p.isActive) || plansArray[0];

        if (!remotePlan) {
          setError("No diet plan found for this patient.");
          setLoading(false);
          return;
        }

        // 3) collect unique foodIds and fetch details
        const foodIds = Array.from(
          new Set(
            remotePlan.items.map((it: DietItem) => it.foodId).filter(Boolean)
          )
        );

        // fetch foods in parallel
        const foodFetches = await Promise.all(
          foodIds.map((id) =>
            foodsAPI
              .getById(id)
              .then((r: any) => {
                // standardize shape - sometimes nested in data.data or data
                return r?.data?.data ?? r?.data ?? r;
              })
              .catch((e) => {
                console.warn("Failed to fetch food", id, e);
                return null;
              })
          )
        );

        const foodMap: Record<string, Food> = {};
        foodFetches.forEach((f) => {
          if (!f) return;
          // If API returned wrapper like { id, name, ... } directly, use it.
          // if returned { data: {...} } above we tried to normalize.
          const id = f?.id;
          if (id) {
            // Only keep fields you explicitly allowed earlier
            foodMap[id] = {
              id: f.id,
              name: f.name,
              description: f.description,
              category: f.category,
              calories: f.calories,
              protein: f.protein,
              carbs: f.carbs,
              fat: f.fat,
              fiber: f.fiber,
              rasa: f.rasa,
              virya: f.virya,
              guna: f.guna,
              vipaka: f.vipaka,
              doshaEffects: f.doshaEffects,
              benefits: f.benefits,
              precautions: f.precautions,
              imageUrl: f.imageUrl,
            };
          }
        });

        // 4) merge foods into plan items
        const mergedItems = (remotePlan.items || []).map((it: DietItem) => {
          const food = foodMap[it.foodId] ?? null;
          return { ...it, food };
        });

        const mergedPlan = { ...remotePlan, items: mergedItems };

        if (!mounted) return;
        setPlan(mergedPlan);

        // set default active day to first available day
        const days = Array.from(
          new Set(mergedItems.map((i) => i.dayNumber))
        ).sort((a, b) => a - b);
        if (days.length) setActiveDay(days[0]);
      } catch (e: any) {
        console.error(e);
        setError(e?.message ?? "Failed to load diet plan");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadAll();
    return () => {
      mounted = false;
    };
  }, []);

  // group items by day
  const itemsByDay = useMemo(() => {
    if (!plan) return {};
    const grouped: Record<number, DietItem[]> = {};
    plan.items.forEach((item) => {
      if (!grouped[item.dayNumber]) grouped[item.dayNumber] = [];
      grouped[item.dayNumber].push(item);
    });
    return grouped;
  }, [plan]);

  const daysArray = Object.keys(itemsByDay)
    .map(Number)
    .sort((a, b) => a - b);

  const activeItems = (itemsByDay[activeDay] || []).sort((a, b) =>
    a.time.localeCompare(b.time)
  );

  // group by mealType
  const mealsByType = useMemo(() => {
    const map: Record<string, DietItem[]> = {};
    activeItems.forEach((it) => {
      if (!map[it.mealType]) map[it.mealType] = [];
      map[it.mealType].push(it);
    });
    return map;
  }, [activeItems]);

  // stats for the active day - prefer per-item totals if present
  const stats = useMemo(() => {
    const totals = activeItems.reduce(
      (acc, curr) => {
        // prefer totals object if provided for item
        const t = curr.totals;
        if (
          t &&
          (t.totalCalories || t.totalProtein || t.totalCarbs || t.totalFat)
        ) {
          return {
            calories: acc.calories + (t.totalCalories || 0),
            protein: acc.protein + (t.totalProtein || 0),
            carbs: acc.carbs + (t.totalCarbs || 0),
            fat: acc.fat + (t.totalFat || 0),
            fiber: acc.fiber + (curr.food?.fiber || 0),
          };
        }
        // fallback: approximate using food calories * quantity/100 (assuming calories per 100g)
        const qty = curr.quantity || 0;
        const food = curr.food;
        const calsApprox =
          (food?.calories ? (food.calories * qty) / 100 : 0) || 0;
        const protApprox =
          (food?.protein ? (food.protein * qty) / 100 : 0) || 0;
        const carbsApprox = (food?.carbs ? (food.carbs * qty) / 100 : 0) || 0;
        const fatApprox = (food?.fat ? (food.fat * qty) / 100 : 0) || 0;
        return {
          calories: acc.calories + calsApprox,
          protein: acc.protein + protApprox,
          carbs: acc.carbs + carbsApprox,
          fat: acc.fat + fatApprox,
          fiber: acc.fiber + (food?.fiber ? (food.fiber * qty) / 100 : 0),
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    const kcalFromProtein = totals.protein * 4;
    const kcalFromCarbs = totals.carbs * 4;
    const kcalFromFat = totals.fat * 9;
    const macroTotalKcal = kcalFromProtein + kcalFromCarbs + kcalFromFat || 1;

    return {
      ...totals,
      pctProtein: Math.round((kcalFromProtein / macroTotalKcal) * 100),
      pctCarbs: Math.round((kcalFromCarbs / macroTotalKcal) * 100),
      pctFat: Math.round((kcalFromFat / macroTotalKcal) * 100),
    };
  }, [activeItems]);

  // ---------------- PDF ----------------
  const handleDownloadPDF = () => {
    if (!plan) return;
    const doc = new jsPDF();

    // small util to truncate
    const truncateText = (text?: string | null, max = 50) => {
      if (!text) return "-";
      const t = typeof text === "string" ? text : JSON.stringify(text);
      return t.length > max ? t.slice(0, max - 1) + "…" : t;
    };

    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(plan.name || "Diet Plan", 14, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const patientName = user?.name ?? "Patient";
    doc.text(`Patient: ${patientName}`, 14, 28);
    doc.text(`Dosha: ${plan.doshaType ?? "-"}`, 14, 34);
    doc.text(`Duration: ${plan.duration ?? "-"} days`, 14, 40);

    let startY = 48;

    const days = Object.keys(itemsByDay)
      .map(Number)
      .sort((a, b) => a - b);
    days.forEach((day) => {
      if (startY > 240) {
        doc.addPage();
        startY = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`Day ${day}`, 14, startY);
      startY += 6;

      const items: DietItem[] = (itemsByDay[day] || []).sort((a, b) =>
        a.time.localeCompare(b.time)
      );

      const tableData = items.map((it) => {
        const food = it.food;
        const cals =
          it.totals?.totalCalories ??
          (food?.calories
            ? Math.round((food.calories * (it.quantity || 0)) / 100)
            : "-");
        const ayur = `${food?.rasa ?? "-"} / ${food?.virya ?? "-"} / ${
          food?.vipaka ?? "-"
        }`;
        return [
          it.time,
          it.mealType,
          food?.name ?? it.foodId,
          `${it.quantity} ${it.unit}`,
          `${cals}`,
          ayur,
          truncateText(food?.doshaEffects ?? food?.benefits, 35),
          truncateText(food?.precautions, 30),
        ];
      });

      autoTable(doc, {
        startY,
        head: [
          [
            "TIME",
            "MEAL",
            "FOOD",
            "QTY",
            "KCAL",
            "RASA/VIRYA/VIPAKA",
            "BENEFITS",
            "PRECAUTIONS",
          ],
        ],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [40, 80, 60],
          textColor: [255, 255, 255],
          fontSize: 8,
        },
        bodyStyles: { fontSize: 8 },
        margin: { left: 14, right: 14 },
      });

      // @ts-ignore
      const finalY = doc.lastAutoTable?.finalY ?? startY + 10;

      // daily totals (prefers item.totals if present)
      const dayTotals = items.reduce(
        (acc, it) => {
          const t = it.totals;
          if (
            t &&
            (t.totalCalories || t.totalProtein || t.totalCarbs || t.totalFat)
          ) {
            return {
              calories: acc.calories + (t.totalCalories || 0),
              protein: acc.protein + (t.totalProtein || 0),
              carbs: acc.carbs + (t.totalCarbs || 0),
              fat: acc.fat + (t.totalFat || 0),
            };
          }
          const food = it.food;
          const qty = it.quantity || 0;
          return {
            calories:
              acc.calories + (food?.calories ? (food.calories * qty) / 100 : 0),
            protein:
              acc.protein + (food?.protein ? (food.protein * qty) / 100 : 0),
            carbs: acc.carbs + (food?.carbs ? (food.carbs * qty) / 100 : 0),
            fat: acc.fat + (food?.fat ? (food.fat * qty) / 100 : 0),
          };
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Daily totals — kcal: ${Math.round(
          dayTotals.calories
        )} | P: ${Math.round(dayTotals.protein)}g | C: ${Math.round(
          dayTotals.carbs
        )}g | F: ${Math.round(dayTotals.fat)}g`,
        14,
        finalY + 8
      );

      startY = finalY + 20;
    });

    doc.save(`${(plan.name || "diet_plan").replace(/\s+/g, "_")}.pdf`);
  };

  // ---------------- small UI helpers ----------------
  const MealIcon = ({ type }: { type: string }) => {
    switch (type) {
      case "BREAKFAST":
        return (
          <div className="p-2 bg-amber-100 text-amber-700 rounded-full">
            <Sun className="w-5 h-5" />
          </div>
        );
      case "LUNCH":
        return (
          <div className="p-2 bg-orange-100 text-orange-700 rounded-full">
            <Utensils className="w-5 h-5" />
          </div>
        );
      case "SNACK":
        return (
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-full">
            <Coffee className="w-5 h-5" />
          </div>
        );
      case "DINNER":
        return (
          <div className="p-2 bg-indigo-100 text-indigo-700 rounded-full">
            <Moon className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="p-2 bg-stone-100 text-stone-700 rounded-full">
            <Utensils className="w-5 h-5" />
          </div>
        );
    }
  };

  const MacroChip = ({ icon: Icon, label, value, unit, color }: any) => (
    <div
      className={`flex flex-col items-center justify-center p-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50 shadow-sm ${color}`}
    >
      <div className="flex items-center gap-1.5 mb-1 opacity-70">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[10px] font-bold tracking-wider uppercase">
          {label}
        </span>
      </div>
      <span className="text-lg font-bold text-stone-800">
        {Math.round(value || 0)}
        <span className="text-xs font-medium text-stone-500 ml-0.5">
          {unit}
        </span>
      </span>
    </div>
  );

  // ---------------- render ----------------
  if (loading) {
    return (
      <div className="p-6">
        <p>Loading diet plan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="p-6">
        <p>No diet plan assigned.</p>
      </div>
    );
  }

  const mealOrder = ["BREAKFAST", "LUNCH", "SNACK", "DINNER"];

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-stone-800 font-sans selection:bg-orange-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-semibold">{plan.name}</h1>
          <p className="text-sm text-muted-foreground">{plan.description}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Patient: {user?.name ?? "Patient"} • Dosha: {plan.doshaType ?? "-"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Day tabs */}
      <div className="flex gap-2 overflow-x-auto p-1 no-scrollbar mb-4">
        {daysArray.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg border text-sm transition-all ${
              activeDay === day
                ? "bg-primary text-white"
                : "bg-white text-muted-foreground hover:bg-muted"
            }`}
          >
            Day {day}
          </button>
        ))}
      </div>

      {/* Nutrition overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <MacroChip
          icon={Flame}
          label="Calories"
          value={stats.calories}
          unit="kcal"
          color="text-orange-600"
        />
        <MacroChip
          icon={Activity}
          label="Protein"
          value={stats.protein}
          unit="g"
          color="text-blue-600"
        />
        <MacroChip
          icon={Wheat}
          label="Carbs"
          value={stats.carbs}
          unit="g"
          color="text-amber-600"
        />
        <MacroChip
          icon={Droplets}
          label="Fats"
          value={stats.fat}
          unit="g"
          color="text-rose-600"
        />
        <MacroChip
          icon={Flame}
          label="Fiber"
          value={stats.fiber}
          unit="g"
          color="text-green-600"
        />
      </div>

      {/* Meals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mealOrder.map((mealType) => {
          const items = mealsByType[mealType] || [];
          if (!items.length) return null;
          return (
            <Card key={mealType} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <MealIcon type={mealType} />
                    <CardTitle className="text-lg capitalize">
                      {mealType?.toLowerCase()}
                    </CardTitle>
                  </div>
                  <Badge>{items.length} items</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {items.map((item, idx) => (
                  <div
                    key={`${item.foodId}-${idx}`}
                    className="p-4 border rounded-xl bg-card"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-lg">
                        {item.food?.name ?? item.foodId}
                      </h3>
                      <Badge variant="secondary">
                        {item.quantity} {item.unit}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {item.food?.description ?? item.notes}
                    </p>

                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span>
                        <strong>
                          {Math.round(
                            item.totals?.totalCalories ??
                              (item.food?.calories
                                ? (item.food.calories * item.quantity) / 100
                                : 0)
                          )}{" "}
                          kcal
                        </strong>
                      </span>
                      <span>
                        P:{" "}
                        {Math.round(
                          item.totals?.totalProtein ??
                            (item.food?.protein
                              ? (item.food.protein * item.quantity) / 100
                              : 0)
                        )}
                        g
                      </span>
                      <span>
                        C:{" "}
                        {Math.round(
                          item.totals?.totalCarbs ??
                            (item.food?.carbs
                              ? (item.food.carbs * item.quantity) / 100
                              : 0)
                        )}
                        g
                      </span>
                      <span>
                        F:{" "}
                        {Math.round(
                          item.totals?.totalFat ??
                            (item.food?.fat
                              ? (item.food.fat * item.quantity) / 100
                              : 0)
                        )}
                        g
                      </span>
                      <span>
                        Fib:{" "}
                        {Math.round(
                          item.food?.fiber
                            ? (item.food.fiber * item.quantity) / 100
                            : 0
                        )}
                        g
                      </span>
                    </div>

                    <div className="mt-3 text-xs text-muted-foreground space-y-1">
                      <p>Rasa: {item.food?.rasa ?? "-"}</p>
                      <p>
                        Virya: {item.food?.virya ?? "-"} • Vipaka:{" "}
                        {item.food?.vipaka ?? "-"}
                      </p>
                      <p>Benefits: {truncateReadable(item.food?.benefits)}</p>
                      {item.food?.precautions && (
                        <p className="text-red-500">
                          Precautions: {item.food.precautions}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  // small helper to read food.benefits which might be JSON array or string
  function truncateReadable(src?: string | null) {
    if (!src) return "-";
    try {
      const parsed = JSON.parse(src);
      if (Array.isArray(parsed))
        return parsed.slice(0, 3).join(", ") + (parsed.length > 3 ? "…" : "");
      if (typeof parsed === "object")
        return Object.values(parsed).slice(0, 3).join(", ");
    } catch (e) {}
    return src.length > 80 ? src.slice(0, 77) + "…" : src;
  }
}
