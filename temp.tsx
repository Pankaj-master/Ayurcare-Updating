import React, { useMemo, useRef } from "react";

// Shadcn / Tailwind / lucide-react imports (adjust paths according to your repo)
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Download, Printer, Calendar, ChevronDown } from "lucide-react";

// Types
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
  imageUrl?: string | null;
};

type Item = {
  id: string;
  mealType: string; // BREAKFAST / LUNCH / DINNER / SNACK
  quantity: number;
  unit: string;
  notes?: string | null;
  dayNumber: number;
  time?: string | null;
  food: Food;
};

type Doctor = { id: string; name: string };

type DietPlan = {
  id: string;
  name: string;
  description?: string | null;
  doctorId?: string | null;
  patientId?: string | null;
  doshaType?: string | null;
  duration?: number | null;
  isActive?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  doctor?: Doctor | null;
  items: Item[];
};

// Helper: group items by day -> mealType
function groupByDayAndMeal(items: Item[]) {
  const days: Record<number, Record<string, Item[]>> = {};
  for (const it of items) {
    const day = it.dayNumber ?? 1;
    days[day] = days[day] || {};
    const meal = it.mealType || "OTHER";
    days[day][meal] = days[day][meal] || [];
    days[day][meal].push(it);
  }
  return days; // { 1: { BREAKFAST: [..], LUNCH: [..] }, 2: { ... } }
}

function sumNutrition(items: Item[]) {
  return items.reduce(
    (acc, it) => {
      const f = it.food || ({} as Food);
      acc.calories += Number(f.calories ?? 0) * (Number(it.quantity) || 1) / (f.servings ?? 1);
      acc.protein += Number(f.protein ?? 0) * (Number(it.quantity) || 1) / (f.servings ?? 1);
      acc.carbs += Number(f.carbs ?? 0) * (Number(it.quantity) || 1) / (f.servings ?? 1);
      acc.fat += Number(f.fat ?? 0) * (Number(it.quantity) || 1) / (f.servings ?? 1);
      acc.fiber += Number(f.fiber ?? 0) * (Number(it.quantity) || 1) / (f.servings ?? 1);
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
}

// Utility to format numbers to 1 decimal place
const fmt = (n: number) => (Number.isFinite(n) ? Math.round(n * 10) / 10 : 0);

// Using mock data for now
export default function DietChart() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // --- MOCK DIET PLAN DATA ---
  const dietPlan: DietPlan = {
    id: "mock-plan-1",
    name: "Mock Ayurvedic Diet Plan",
    description: "This is mock data for UI testing.",
    doctorId: "mock-doctor-1",
    patientId: "mock-patient-1",
    doshaType: "VATA",
    duration: 3,
    isActive: true,
    createdAt: "2025-11-28T13:46:40.810Z",
    updatedAt: "2025-11-28T13:46:40.810Z",
    doctor: { id: "mock-doctor-1", name: "Dr. Mock" },
    items: [
  // ---------------- DAY 1 ----------------
  {
    id: "d1-b1",
    mealType: "BREAKFAST",
    quantity: 1,
    unit: "cup",
    notes: null,
    dayNumber: 1,
    time: "08:00",
    food: {
      id: "f-oats",
      name: "Oats",
      description: "Warm oats for digestion",
      category: "GRAINS",
      calories: 150,
      protein: 5,
      carbs: 27,
      fat: 3,
      fiber: 4,
      imageUrl: null,
    },
  },
  {
    id: "d1-b2",
    mealType: "BREAKFAST",
    quantity: 1,
    unit: "piece",
    notes: null,
    dayNumber: 1,
    time: "08:00",
    food: {
      id: "f-banana",
      name: "Banana",
      description: "Easy to digest",
      category: "FRUITS",
      calories: 90,
      protein: 1,
      carbs: 23,
      fat: 0.2,
      fiber: 2.6,
      imageUrl: null,
    },
  },

  // DAY 1 — LUNCH (2 items)
  {
    id: "d1-l1",
    mealType: "LUNCH",
    quantity: 120,
    unit: "grams",
    notes: null,
    dayNumber: 1,
    time: "13:00",
    food: {
      id: "f-rice",
      name: "Basmati Rice",
      description: "Light & cooling",
      category: "GRAINS",
      calories: 130,
      protein: 3,
      carbs: 28,
      fat: 0.3,
      fiber: 0.4,
      imageUrl: null,
    },
  },
  {
    id: "d1-l2",
    mealType: "LUNCH",
    quantity: 100,
    unit: "grams",
    notes: null,
    dayNumber: 1,
    time: "13:00",
    food: {
      id: "f-dal",
      name: "Moong Dal",
      description: "High protein, easy to digest",
      category: "LEGUMES",
      calories: 105,
      protein: 7,
      carbs: 17,
      fat: 0.5,
      fiber: 3,
      imageUrl: null,
    },
  },

  // DAY 1 — DINNER (2 items)
  {
    id: "d1-d1",
    mealType: "DINNER",
    quantity: 1,
    unit: "bowl",
    notes: null,
    dayNumber: 1,
    time: "19:30",
    food: {
      id: "f-khichdi",
      name: "Khichdi",
      description: "Ayurvedic comfort meal",
      category: "MEAL",
      calories: 220,
      protein: 8,
      carbs: 35,
      fat: 4,
      fiber: 3,
      imageUrl: null,
    },
  },
  {
    id: "d1-d2",
    mealType: "DINNER",
    quantity: 1,
    unit: "cup",
    notes: null,
    dayNumber: 1,
    time: "19:30",
    food: {
      id: "f-buttermilk",
      name: "Buttermilk",
      description: "Supports digestion",
      category: "DAIRY",
      calories: 50,
      protein: 2,
      carbs: 5,
      fat: 1,
      fiber: 0,
      imageUrl: null,
    },
  },

  // ---------------- DAY 2 ----------------
  // BREAKFAST
  {
    id: "d2-b1",
    mealType: "BREAKFAST",
    quantity: 1,
    unit: "cup",
    notes: null,
    dayNumber: 2,
    time: "08:00",
    food: {
      id: "f-upma",
      name: "Upma",
      description: "Light semolina breakfast",
      category: "MEAL",
      calories: 180,
      protein: 4,
      carbs: 30,
      fat: 5,
      fiber: 2,
      imageUrl: null,
    },
  },
  {
    id: "d2-b2",
    mealType: "BREAKFAST",
    quantity: 1,
    unit: "piece",
    notes: null,
    dayNumber: 2,
    time: "08:00",
    food: {
      id: "f-apple",
      name: "Apple",
      description: "Sweet & cooling",
      category: "FRUITS",
      calories: 95,
      protein: 0.5,
      carbs: 25,
      fat: 0.3,
      fiber: 4,
      imageUrl: null,
    },
  },

  // LUNCH
  {
    id: "d2-l1",
    mealType: "LUNCH",
    quantity: 1,
    unit: "bowl",
    notes: null,
    dayNumber: 2,
    time: "13:00",
    food: {
      id: "f-quinoa",
      name: "Quinoa",
      description: "High protein grain",
      category: "GRAINS",
      calories: 120,
      protein: 4,
      carbs: 21,
      fat: 2,
      fiber: 2.8,
      imageUrl: null,
    },
  },
  {
    id: "d2-l2",
    mealType: "LUNCH",
    quantity: 100,
    unit: "grams",
    notes: null,
    dayNumber: 2,
    time: "13:00",
    food: {
      id: "f-sabji",
      name: "Vegetable Sabji",
      description: "Steamed vegetables",
      category: "VEGETABLES",
      calories: 80,
      protein: 2,
      carbs: 10,
      fat: 3,
      fiber: 3,
      imageUrl: null,
    },
  },

  // DINNER
  {
    id: "d2-d1",
    mealType: "DINNER",
    quantity: 1,
    unit: "bowl",
    notes: null,
    dayNumber: 2,
    time: "19:30",
    food: {
      id: "f-soup",
      name: "Vegetable Soup",
      description: "Light night meal",
      category: "SOUP",
      calories: 90,
      protein: 3,
      carbs: 12,
      fat: 2,
      fiber: 2,
      imageUrl: null,
    },
  },

  // ---------------- DAY 3 ----------------
  // BREAKFAST
  {
    id: "d3-b1",
    mealType: "BREAKFAST",
    quantity: 1,
    unit: "cup",
    notes: null,
    dayNumber: 3,
    time: "08:00",
    food: {
      id: "f-poha",
      name: "Poha",
      description: "Light flattened rice",
      category: "MEAL",
      calories: 150,
      protein: 4,
      carbs: 27,
      fat: 3,
      fiber: 2,
      imageUrl: null,
    },
  },

  // LUNCH
  {
    id: "d3-l1",
    mealType: "LUNCH",
    quantity: 150,
    unit: "grams",
    notes: null,
    dayNumber: 3,
    time: "13:00",
    food: {
      id: "f-pulao",
      name: "Veg Pulao",
      description: "Mild spiced rice",
      category: "MEAL",
      calories: 250,
      protein: 5,
      carbs: 40,
      fat: 5,
      fiber: 3,
      imageUrl: null,
    },
  },

  // DINNER
  {
    id: "d3-d1",
    mealType: "DINNER",
    quantity: 1,
    unit: "glass",
    notes: null,
    dayNumber: 3,
    time: "19:30",
    food: {
      id: "f-turmeric-milk",
      name: "Turmeric Milk",
      description: "Soothing at night",
      category: "DAIRY",
      calories: 180,
      protein: 8,
      carbs: 22,
      fat: 5,
      fiber: 0,
      imageUrl: null,
    },
  },
],
  };

  const daysGrouped = useMemo(() => groupByDayAndMeal(dietPlan.items || []), [dietPlan.items]);

  const nutritionalByDay = useMemo(() => {
    const out: Record<number, ReturnType<typeof sumNutrition>> = {};
    for (const dayStr of Object.keys(daysGrouped)) {
      const day = Number(dayStr);
      const mealGroups = daysGrouped[day];
      const allItems: Item[] = Object.values(mealGroups).flat();
      out[day] = sumNutrition(allItems);
    }
    return out;
  }, [daysGrouped]);

  const totalNutrition = useMemo(() => {
    const allItems = dietPlan.items || [];
    return sumNutrition(allItems);
  }, [dietPlan.items]);

  // Download plan JSON
  function handleDownloadJSON() {
    const blob = new Blob([JSON.stringify(dietPlan, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${dietPlan.name?.replace(/\s+/g, "_") || "diet_plan"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Print (user can choose Save as PDF in print dialog)
  function handlePrint() {
    window.print();
  }

  // Export to PDF using html2canvas + jsPDF if available. Graceful fallback to print.
  async function handleExportPdf() {
    // If libraries missing, fallback to print
    // To enable PDF export, install: npm i jspdf html2canvas
    // and import them at top: import jsPDF from 'jspdf'; import html2canvas from 'html2canvas';
    try {
      // @ts-ignore
      const html2canvas = (await import("html2canvas")).default;
      // @ts-ignore
      const jsPDF = (await import("jspdf")).jsPDF || (await import("jspdf")).default;
      if (!containerRef.current) return handlePrint();
      const canvas = await html2canvas(containerRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      // fit image into page keeping aspect
      const imgProps = (pdf as any).getImageProperties(imgData);
      const imgWidth = pageWidth - 40; // margin
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight);
      pdf.save(`${dietPlan.name?.replace(/\s+/g, "_") || "diet_plan"}.pdf`);
    } catch (e) {
      console.warn("PDF export libs not available, falling back to print.", e);
      handlePrint();
    }
  }

return (
  <div className="p-4 md:p-8 space-y-8" ref={containerRef}>

    {/* ============================ HEADER ============================ */}
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{dietPlan.name}</h1>
        <p className="text-sm text-muted-foreground">{dietPlan.description}</p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Badge>Dosha: {dietPlan.doshaType || "N/A"}</Badge>
          <Badge>Duration: {dietPlan.duration ?? "-"} days</Badge>
          <Badge variant={dietPlan.isActive ? "default" : "secondary"}>
            {dietPlan.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleDownloadJSON} className="gap-2">
          <Download size={16} /> Download
        </Button>
        <Button variant="outline" onClick={handleExportPdf} className="gap-2">
          <Printer size={16} /> PDF
        </Button>
        <Button variant="ghost" onClick={handlePrint} className="gap-2">
          <Printer size={16} /> Print
        </Button>
      </div>
    </div>

    {/* ============================ META CARDS ============================ */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Doctor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{dietPlan.doctor?.name ?? "-"}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Created / Updated</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-sm">
            {dietPlan.createdAt ? new Date(dietPlan.createdAt).toLocaleString() : "-"}
          </p>
          <p className="text-sm text-muted-foreground">
            {dietPlan.updatedAt ? new Date(dietPlan.updatedAt).toLocaleString() : "-"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Total Nutrition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span>Calories</span><span className="font-medium">{fmt(totalNutrition.calories)} kcal</span>
            <span>Protein</span><span className="font-medium">{fmt(totalNutrition.protein)} g</span>
            <span>Carbs</span><span className="font-medium">{fmt(totalNutrition.carbs)} g</span>
            <span>Fat</span><span className="font-medium">{fmt(totalNutrition.fat)} g</span>
            <span>Fiber</span><span className="font-medium">{fmt(totalNutrition.fiber)} g</span>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* ============================ DAILY SECTIONS ============================ */}
    <div className="space-y-6">
      {Object.keys(daysGrouped)
        .sort((a, b) => Number(a) - Number(b))
        .map((dayKey) => {
          const day = Number(dayKey);
          const meals = daysGrouped[day];
          const nutrit = nutritionalByDay[day];

          return (
            <details key={day} className="border rounded-lg overflow-hidden bg-card" open>
              <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/40 transition">
                {/* Left side day label */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold">
                    {day}
                  </div>
                  <div>
                    <p className="font-semibold">Day {day}</p>
                    <p className="text-xs text-muted-foreground">
                      {fmt(nutrit.calories)} kcal • {fmt(nutrit.protein)} g protein
                    </p>
                  </div>
                </div>

                {/* right: badge & chevron */}
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{Object.keys(meals).length} meals</Badge>
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </div>
              </summary>

              <div className="p-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                  {/* ================== MEALS LIST ================== */}
                  <div className="md:col-span-2 space-y-4">
                    {Object.keys(meals)
                      .sort()
                      .map((mealType) => (
                        <Card key={mealType} className="shadow-sm">
                          <CardHeader className="pb-2">
                            <CardTitle className="flex items-center justify-between text-sm capitalize">
                              {mealType.toLowerCase()}
                              <span className="text-xs text-muted-foreground">
                                {meals[mealType].length} items
                              </span>
                            </CardTitle>
                          </CardHeader>

                          <CardContent className="space-y-3">
                            {meals[mealType].map((it) => (
                              <div
                                key={it.id}
                                className="flex items-start gap-4 p-3 rounded-lg border bg-background hover:bg-muted/40 transition"
                              >
                                <div className="w-12 h-12 rounded bg-muted flex items-center justify-center font-medium">
                                  {it.food.name?.[0]?.toUpperCase()}
                                </div>

                                <div className="flex-1 space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span className="font-medium">{it.food.name}</span>
                                    <span className="text-muted-foreground">
                                      {it.time} • {it.quantity} {it.unit}
                                    </span>
                                  </div>

                                  <p className="text-xs text-muted-foreground">
                                    {it.food.description}
                                  </p>

                                  <div className="grid grid-cols-3 gap-4 text-xs pt-1 text-muted-foreground">
                                    <span>Cal: {fmt(it.food.calories)}</span>
                                    <span>Prot: {fmt(it.food.protein)} g</span>
                                    <span>Carb: {fmt(it.food.carbs)} g</span>
                                  </div>

                                  {it.notes && (
                                    <p className="text-xs pt-1">Notes: {it.notes}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      ))}
                  </div>

                  {/* ================== DAY SUMMARY ================== */}
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Day {day} Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <span>Calories</span><span className="font-medium">{fmt(nutrit.calories)} kcal</span>
                          <span>Protein</span><span className="font-medium">{fmt(nutrit.protein)} g</span>
                          <span>Carbs</span><span className="font-medium">{fmt(nutrit.carbs)} g</span>
                          <span>Fat</span><span className="font-medium">{fmt(nutrit.fat)} g</span>
                          <span>Fiber</span><span className="font-medium">{fmt(nutrit.fiber)} g</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Doctor Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {dietPlan.description ?? "-"}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                </div>
              </div>
            </details>
          );
        })}
    </div>

    <p className="text-xs text-muted-foreground pt-4">
      * This view is generated from provided diet plan data.
    </p>
  </div>
);

}
