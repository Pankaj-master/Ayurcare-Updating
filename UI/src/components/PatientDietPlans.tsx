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

export default function DietPlanView({ dietPlan }: { dietPlan: DietPlan }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
  const checkAuth = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      dispatch({ type: "LOGOUT" });
      return;
    }

    try {
      dispatch({ type: "AUTH_START" });

      const response = await authAPI.getMe();

      if (!response.data?.data) {
        throw new Error("Invalid user");
      }

      dispatch({ type: "AUTH_SUCCESS", payload: response.data.data });
    } catch (error) {
      console.error("Auth check failed", error);

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      dispatch({ type: "LOGOUT" });
    }
  };

  checkAuth();
}, []);


  return (
    <div className="p-4 md:p-8" ref={containerRef}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">{dietPlan.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{dietPlan.description}</p>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="secondary">Dosha: {dietPlan.doshaType || "N/A"}</Badge>
            <Badge variant="secondary">Duration: {dietPlan.duration ?? "-"} days</Badge>
            <Badge variant="secondary">Active: {dietPlan.isActive ? "Yes" : "No"}</Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleDownloadJSON} className="flex items-center gap-2">
            <Download size={16} /> Download Plan
          </Button>
          <Button variant="outline" onClick={handleExportPdf} className="flex items-center gap-2">
            <Printer size={16} /> Export as PDF
          </Button>
          <Button variant="ghost" onClick={handlePrint} className="flex items-center gap-2">
            <Printer size={16} /> Print
          </Button>
        </div>
      </div>

      {/* meta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Doctor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">{dietPlan.doctor?.name ?? "-"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Created / Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">{dietPlan.createdAt ? new Date(dietPlan.createdAt).toLocaleString() : "-"}</div>
            <div className="text-sm text-muted-foreground">{dietPlan.updatedAt ? new Date(dietPlan.updatedAt).toLocaleString() : "-"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Nutrition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Calories</div>
              <div className="font-medium">{fmt(totalNutrition.calories)} kcal</div>
              <div>Protein</div>
              <div className="font-medium">{fmt(totalNutrition.protein)} g</div>
              <div>Carbs</div>
              <div className="font-medium">{fmt(totalNutrition.carbs)} g</div>
              <div>Fat</div>
              <div className="font-medium">{fmt(totalNutrition.fat)} g</div>
              <div>Fiber</div>
              <div className="font-medium">{fmt(totalNutrition.fiber)} g</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Days */}
      <div className="space-y-4">
        {Object.keys(daysGrouped)
          .sort((a, b) => Number(a) - Number(b))
          .map((dayKey) => {
            const day = Number(dayKey);
            const meals = daysGrouped[day];
            const nutrit = nutritionalByDay[day] || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
            return (
              <details key={day} className="border rounded-lg" open>
                <summary className="flex items-center justify-between p-4 cursor-pointer select-none">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold">D{day}</div>
                    <div>
                      <div className="font-semibold">Day {day}</div>
                      <div className="text-xs text-muted-foreground">Nutrition — {fmt(nutrit.calories)} kcal • {fmt(nutrit.protein)} g protein</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{Object.keys(meals).length} meals</Badge>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </summary>

                <div className="p-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* left: meals */}
                    <div className="md:col-span-2 space-y-4">
                      {Object.keys(meals)
                        .sort()
                        .map((mealType) => (
                          <Card key={mealType} className="overflow-visible">
                            <CardHeader>
                              <CardTitle className="flex items-center justify-between">
                                <span className="capitalize">{mealType.toLowerCase()}</span>
                                <span className="text-sm text-muted-foreground">{meals[mealType].length} items</span>
                              </CardTitle>
                            </CardHeader>

                            <CardContent>
                              <div className="space-y-3">
                                {meals[mealType].map((it) => (
                                  <div key={it.id} className="flex items-start gap-3 p-2 rounded hover:bg-muted">
                                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-sm font-medium">{it.food.name?.[0]?.toUpperCase()}</div>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <div className="font-medium">{it.food.name}</div>
                                        <div className="text-sm text-muted-foreground">{it.time ?? "-"} • {it.quantity} {it.unit}</div>
                                      </div>
                                      <div className="text-sm text-muted-foreground">{it.food.description}</div>
                                      <div className="mt-2 grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                                        <div>Cal: {fmt(it.food.calories ?? 0)}</div>
                                        <div>Prot: {fmt(it.food.protein ?? 0)} g</div>
                                        <div>Carb: {fmt(it.food.carbs ?? 0)} g</div>
                                      </div>
                                      {it.notes && <div className="text-xs mt-2">Notes: {it.notes}</div>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>

                    {/* right: day nutrition summary */}
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Day {day} — Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>Calories</div>
                            <div className="font-medium">{fmt(nutrit.calories)} kcal</div>
                            <div>Protein</div>
                            <div className="font-medium">{fmt(nutrit.protein)} g</div>
                            <div>Carbs</div>
                            <div className="font-medium">{fmt(nutrit.carbs)} g</div>
                            <div>Fat</div>
                            <div className="font-medium">{fmt(nutrit.fat)} g</div>
                            <div>Fiber</div>
                            <div className="font-medium">{fmt(nutrit.fiber)} g</div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Doctor Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-muted-foreground">{dietPlan.description ?? "-"}</div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </details>
            );
          })}
      </div>

      <div className="mt-6 text-xs text-muted-foreground">* This view is generated from the diet plan data returned by the API.</div>
    </div>
  );
}
