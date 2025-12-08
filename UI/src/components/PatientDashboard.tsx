import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Utensils, 
  Clock, 
  Target, 
  TrendingUp, 
  Calendar,
  Coffee,
  Sun,
  Moon,
  Cookie
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";


const mockData = {
  todayMeals: {
    breakfast: [
      {
        id: 1,
        name: "Oats with Almonds & Honey",
        time: "08:00 AM",
        calories: 320,
        status: "completed",
        doshaEffect: "Vata balancing"
      },
      {
        id: 2,
        name: "Herbal Tea (Ginger)",
        time: "08:30 AM",
        calories: 5,
        status: "completed",
        doshaEffect: "Digestive fire"
      }
    ],
    lunch: [
      {
        id: 3,
        name: "Quinoa with Vegetables",
        time: "12:30 PM",
        calories: 450,
        status: "pending",
        doshaEffect: "Pitta cooling"
      },
      {
        id: 4,
        name: "Cucumber Raita",
        time: "12:30 PM",
        calories: 80,
        status: "pending",
        doshaEffect: "Cooling"
      }
    ],
    dinner: [
      {
        id: 5,
        name: "Moong Dal Soup",
        time: "07:00 PM",
        calories: 280,
        status: "pending",
        doshaEffect: "Easy to digest"
      },
      {
        id: 6,
        name: "Steamed Rice",
        time: "07:00 PM",
        calories: 220,
        status: "pending",
        doshaEffect: "Grounding"
      }
    ],
    snacks: [
      {
        id: 7,
        name: "Mixed Nuts",
        time: "04:00 PM",
        calories: 180,
        status: "pending",
        doshaEffect: "Protein rich"
      }
    ]
  },
  stats: [
    {
      title: "Today's Calories",
      value: "325",
      target: "1800",
      percentage: 18,
      icon: Utensils
    },
    {
      title: "Water Intake",
      value: "4",
      target: "8",
      percentage: 50,
      icon: Target,
      unit: "glasses"
    },
    {
      title: "Diet Plan Progress",
      value: "12",
      target: "30",
      percentage: 40,
      icon: Calendar,
      unit: "days"
    }
  ],
  upcomingReminders: [
    {
      id: 1,
      title: "Lunch Reminder",
      time: "12:30 PM",
      type: "meal",
      priority: "high"
    },
    {
      id: 2,
      title: "Evening Medicine",
      time: "06:00 PM",
      type: "medicine",
      priority: "medium"
    },
    {
      id: 3,
      title: "Bedtime Herbal Tea",
      time: "09:00 PM",
      type: "meal",
      priority: "low"
    }
  ]
};

const mealIcons = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
  snacks: Cookie
};

export function PatientDashboard() {

  const { t } = useTranslation();

  const navigate = useNavigate();

  const getMealIcon = (mealType) => {
    const Icon = mealIcons[mealType];
    return Icon;
  };

  const markMealComplete = (mealId) => {
    // Mock function to mark meal as completed
    console.log(`Marking meal ${mealId} as completed`);
  };

return (
  <div className="space-y-6">

    {/* Header */}
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl text-foreground">{t("dietPage.title")}</h1>
        <p className="text-muted-foreground">{t("dietPage.subtitle")}</p>
      </div>

      <Button onClick={() => navigate('/diet-history')} variant="outline">
        {t("dietPage.viewHistory")}
      </Button>
    </div>

    {/* Progress Stats */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {mockData.stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t(stat.title)}</p>
                  <p className="text-2xl">
                    {stat.value}
                    {stat.unit && <span className="text-sm text-muted-foreground ml-1">{stat.unit}</span>}
                    <span className="text-sm text-muted-foreground"> / {stat.target}</span>
                  </p>
                </div>

                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
              </div>

              <Progress value={stat.percentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {stat.percentage}% {t("dietPage.ofDailyGoal")}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>

    {/* Today Meals */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Object.entries(mockData.todayMeals).map(([mealType, meals]) => {
        const Icon = getMealIcon(mealType);
        const completedMeals = meals.filter(m => m.status === "completed").length;

        return (
          <Card key={mealType}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Icon className="w-5 h-5 mr-2 text-primary" />
                  {t(`dietPage.meals.${mealType}`)}
                </div>

                <Badge variant={completedMeals === meals.length ? "default" : "secondary"}>
                  {completedMeals}/{meals.length}
                </Badge>
              </CardTitle>

              <CardDescription>
                {completedMeals === meals.length
                  ? t("dietPage.completed")
                  : `${meals.length - completedMeals} ${t("dietPage.itemsRemaining")}`}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {meals.map((meal) => (
                <div key={meal.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className={`text-sm ${meal.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                        {meal.name}
                      </p>

                      <Badge variant="outline" className="text-xs">
                        {meal.calories} {t("dietPage.cal")}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> {meal.time}
                      </span>
                      <span>{meal.doshaEffect}</span>
                    </div>
                  </div>

                  {meal.status === "pending" && (
                    <Button size="sm" variant="outline" onClick={() => markMealComplete(meal.id)}>
                      {t("dietPage.markDone")}
                    </Button>
                  )}

                  {meal.status === "completed" && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      ✓ {t("dietPage.done")}
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>

    {/* Reminders + Quick Actions */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-primary" />
            {t("dietPage.upcomingReminders")}
          </CardTitle>
          <CardDescription>{t("dietPage.reminderSubtitle")}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {mockData.upcomingReminders.map((reminder) => (
            <div key={reminder.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="space-y-1">
                <p className="text-sm">{reminder.title}</p>

                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" /> {reminder.time}
                  </span>
                  <span className="capitalize">{reminder.type}</span>
                </div>
              </div>

              <Badge
                variant={
                  reminder.priority === "high"
                    ? "destructive"
                    : reminder.priority === "medium"
                    ? "default"
                    : "secondary"
                }
              >
                {t(`dietPage.priority.${reminder.priority}`)}
              </Badge>
            </div>
          ))}

          <Button variant="outline" className="w-full" onClick={() => navigate('/reminders')}>
            {t("dietPage.viewAllReminders")}
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dietPage.quickActions")}</CardTitle>
          <CardDescription>{t("dietPage.quickActionsSubtitle")}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/chat')}>
            <TrendingUp className="w-4 h-4 mr-2" />
            {t("dietPage.chatDoctor")}
          </Button>

          <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/diet-history')}>
            <Calendar className="w-4 h-4 mr-2" />
            {t("dietPage.viewHistory")}
          </Button>

          <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/reports')}>
            <TrendingUp className="w-4 h-4 mr-2" />
            {t("dietPage.progressReports")}
          </Button>

          <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/reminders')}>
            <Clock className="w-4 h-4 mr-2" />
            {t("dietPage.manageReminders")}
          </Button>
        </CardContent>
      </Card>

    </div>
  </div>
);

}