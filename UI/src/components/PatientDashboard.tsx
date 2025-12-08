// PatientDashboardDynamic.jsx
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  Utensils,
  Clock,
  Calendar,
  Coffee,
  Sun,
  Moon,
  Cookie,
  TrendingUp,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { authAPI, dietPlansAPI, remindersAPI, chatAPI, patientsAPI } from "../services/api"; // adjust path

const mealIcons = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
  snacks: Cookie,
};

function getMealIcon(mealType) {
  return mealIcons[mealType] || Utensils;
}

/**
 * Utility: pick newest active diet-plan (if many)
 */
function pickNewestActivePlan(plans = []) {
  const active = plans.filter((p) => p.isActive);
  if (!active.length) return plans[0] || null;
  active.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return active[0];
}

export function PatientDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // auth/me
  const [patient, setPatient] = useState(null); // patients/:id (optional)
  const [plan, setPlan] = useState(null); // selected active plan
  const [planList, setPlanList] = useState([]); // all plans
  const [reminders, setReminders] = useState([]);
  const [messages, setMessages] = useState([]); // conversation / preview
  const [unreadCount, setUnreadCount] = useState(0);

  // local UI state to allow marking a meal done visually (no backend)
  const [localCompletedMeals, setLocalCompletedMeals] = useState(new Set());

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        // 1) Auth/me
        const meResp = await authAPI.getMe();
        const meData = meResp?.data?.data || meResp?.data || null;
        setUser(meData);

        // if patient nested object exists, fetch /patients/:id for more details
        const patientId = meData?.patient?.id;
        if (patientId) {
          try {
            const pResp = await patientsAPI.getById(patientId);
            const pData = pResp?.data?.data || pResp?.data || null;
            setPatient(pData);
          } catch (e) {
            // fallback: use nested patient from auth/me
            setPatient(meData?.patient || null);
          }
        }

        // 2) Diet Plans for patient (user id is meData.id in your API)
        const userId = meData?.id;
        if (userId) {
          try {
            const plansResp = await dietPlansAPI.getForPatient(userId);
            const plans = plansResp?.data?.data ?? plansResp?.data ?? [];
            setPlanList(plans);

            const newestPlan = pickNewestActivePlan(plans);
            setPlan(newestPlan);
          } catch (err) {
            setPlanList([]);
            setPlan(null);
          }
        }

        // 3) Reminders for user
        const userIdForRem = meData?.id;
        if (userIdForRem) {
          try {
            const remResp = await remindersAPI.getByUser(userIdForRem);
            const rems = remResp?.data?.data ?? remResp?.data ?? [];
            setReminders(rems);
          } catch (err) {
            setReminders([]);
          }
        }

        // 4) Messages - attempt to fetch conversation with assigned doctor if available
        const doctorId = patient?.doctorId ?? meData?.patient?.doctorId ?? meData?.doctorId;
        try {
          if (doctorId) {
            // chatAPI.getConversation expects userId param in your client
            const convResp = await chatAPI.getConversation(doctorId);
            const convData = convResp?.data?.data ?? convResp?.data ?? [];
            // If it's a full conversation array, compute unread from messages with isRead false
            // If it's a preview list, use that directly
            if (Array.isArray(convData)) {
              setMessages(convData.slice(0, 5));
              const unread = convData.filter((m) => m.isRead === false).length;
              setUnreadCount(unread);
            } else if (convData?.preview) {
              setMessages(convData.preview);
              setUnreadCount(convData.count ?? convData.preview.filter(m => !m.isRead).length);
            } else {
              setMessages([]);
            }
          } else {
            // fallback: list all chat conversations
            const allResp = await chatAPI.getAll();
            const allData = allResp?.data?.data ?? allResp?.data ?? [];
            setMessages(Array.isArray(allData) ? allData.slice(0, 5) : []);
            setUnreadCount(
              Array.isArray(allData) ? allData.filter((m) => m.isRead === false).length : 0
            );
          }
        } catch (err) {
          // silent fallback
          setMessages([]);
          setUnreadCount(0);
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // compute derived stats
  const computeTodayMeals = () => {
    if (!plan || !plan.items) return {};
    // group items by mealType (BREAKFAST, LUNCH, DINNER, SNACK)
    const grouped = {};
    plan.items.forEach((item) => {
      const type = (item.mealType || "SNACK").toLowerCase();
      if (!grouped[type]) grouped[type] = [];
      // compute calories fallback (totals.totalCalories || food.calories)
      const calories =
        item.totals?.totalCalories ?? item.food?.calories ?? null;
      grouped[type].push({
        id: item.id,
        name: item.food?.name ?? "Item",
        time: item.time ?? "",
        calories,
        status: localCompletedMeals.has(item.id) ? "completed" : "pending",
        notes: item.notes,
        description: item.food?.description,
        imageUrl: item.food?.imageUrl,
        totals: item.totals,
      });
    });
    return grouped;
  };

  const todayMeals = computeTodayMeals();

  const handleMarkDone = (mealId) => {
    // No endpoint present to mark meal as done in your api client.
    // We'll update local UI state so user sees immediate feedback.
    setLocalCompletedMeals((prev) => new Set(prev).add(mealId));
    console.log(`[UI] mark meal done (local only): ${mealId}`);
    // If you later add an endpoint like dietPlansAPI.markItem or patientsAPI.markMeal,
    // replace this with a proper API call and refresh plan state.
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold">
            {t("dietPage.title", "My Diet Dashboard")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {user?.name ?? "Patient"} • Dosha: {user?.doshaType ?? "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Last update: {user?.updatedAt ?? user?.createdAt ?? "—"}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => navigate("/diet-history")}>
            {t("dietPage.viewHistory", "View History")}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Calories (computed from plan items totals) */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("dietPage.todaysCalories", "Today's Calories")}
                </p>
                <p className="text-xl font-medium">
                  {
                    // compute sum of calories from today's plan items
                    plan?.items
                      ? plan.items.reduce((sum, it) => {
                          const c = it.totals?.totalCalories ?? it.food?.calories ?? 0;
                          return sum + Number(c || 0);
                        }, 0)
                      : 0
                  }{" "}
                  kcal
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Utensils className="w-6 h-6 text-primary" />
              </div>
            </div>
            <Progress
              value={
                plan?.items
                  ? Math.min(
                      100,
                      Math.round(
                        (plan.items.reduce((sum, it) => {
                          const c = it.totals?.totalCalories ?? it.food?.calories ?? 0;
                          return sum + Number(c || 0);
                        }, 0) /
                          (1800 /* default goal fallback */)) *
                          100
                      )
                    )
                  : 0
              }
              className="h-2 mt-3"
            />
          </CardContent>
        </Card>

        {/* Water / Sleep / Weight summary */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("dietPage.weight", "Weight")}</p>
                <p className="text-xl font-medium">{patient?.weight ?? user?.patient?.weight ?? "—"} kg</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-muted-foreground">
              <div>Sleep: {patient?.sleepPattern ?? user?.patient?.sleepPattern ?? "—"}</div>
              <div>Bowel: {patient?.bowelMovement ?? user?.patient?.bowelMovement ?? "—"}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("dietPage.planProgress", "Plan Progress")}</p>
                <p className="text-xl font-medium">
                  {plan?.duration ?? "—"} {t("dietPage.days", "days")}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
            </div>

            <Progress value={plan?.duration ? Math.min(100, Math.round((1 / plan.duration) * 100)) : 0} className="h-2 mt-3" />
          </CardContent>
        </Card>
      </div>

      {/* Meals grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {["breakfast", "lunch", "dinner", "snacks"].map((mealType) => {
          const meals = todayMeals[mealType] ?? [];
          const Icon = getMealIcon(mealType);
          const completed = meals.filter((m) => m.status === "completed").length;

          return (
            <Card key={mealType}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Icon className="w-5 h-5 mr-2 text-primary" />
                    {t(`dietPage.meals.${mealType}`, mealType.charAt(0).toUpperCase() + mealType.slice(1))}
                  </div>

                  <Badge variant={completed === meals.length ? "default" : "secondary"}>
                    {completed}/{meals.length}
                  </Badge>
                </CardTitle>

                <CardDescription>
                  {completed === meals.length ? t("dietPage.completed", "All done") : `${meals.length - completed} ${t("dietPage.itemsRemaining", "remaining")}`}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                {meals.length === 0 && <p className="text-sm text-muted-foreground">No items</p>}

                {meals.map((meal) => (
                  <div key={meal.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className={`text-sm ${meal.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                          {meal.name}
                        </p>

                        {meal.calories != null && (
                          <Badge variant="outline" className="text-xs">
                            {meal.calories} {t("dietPage.cal", "kcal")}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" /> {meal.time}
                        </span>
                        {meal.notes && <span>{meal.notes}</span>}
                      </div>
                    </div>

                    {meal.status === "pending" ? (
                      <Button size="sm" variant="outline" onClick={() => handleMarkDone(meal.id)}>
                        {t("dietPage.markDone", "Mark done")}
                      </Button>
                    ) : (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        ✓ {t("dietPage.done", "Done")}
                      </Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Reminders & Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-primary" />
              {t("dietPage.upcomingReminders", "Upcoming Reminders")}
            </CardTitle>
            <CardDescription>{t("dietPage.reminderSubtitle", "Stay on track with timely reminders")}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {reminders.length === 0 && <p className="text-sm text-muted-foreground">No reminders</p>}
            {reminders.slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="text-sm">{r.title}</p>
                  <div className="text-xs text-muted-foreground">{r.time ? `${r.time}` : r.date ?? "—"}</div>
                </div>

                <Badge variant={r.isActive ? "default" : "secondary"}>{r.frequency ?? (r.isActive ? "active" : "inactive")}</Badge>
              </div>
            ))}

            <Button variant="outline" className="w-full" onClick={() => navigate("/reminders")}>
              {t("dietPage.viewAllReminders", "View all reminders")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("dietPage.quickActions", "Quick Actions")}</CardTitle>
            <CardDescription>{t("dietPage.quickActionsSubtitle", "Common tasks")}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/chat")}>
              <TrendingUp className="w-4 h-4 mr-2" />
              {t("dietPage.chatDoctor", "Chat with Doctor")}
              {unreadCount > 0 && <Badge className="ml-2">{unreadCount}</Badge>}
            </Button>

            <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/diet-history")}>
              <Calendar className="w-4 h-4 mr-2" />
              {t("dietPage.viewHistory", "View History")}
            </Button>

            <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/reports")}>
              <TrendingUp className="w-4 h-4 mr-2" />
              {t("dietPage.progressReports", "Progress Reports")}
            </Button>

            <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/reminders")}>
              <Clock className="w-4 h-4 mr-2" />
              {t("dietPage.manageReminders", "Manage Reminders")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
