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
import {
  Users,
  FileText,
  Calendar,
  Plus,
  TrendingUp,
  Activity,
  Clock,
  MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  patientsAPI,
  chatAPI,
  dietPlansAPI,
} from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export function DoctorDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [stats, setStats] = useState({
    totalPatients: 0,
    dietPlansCreated: 0,
    consultationsToday: 0,
    unreadMessages: 0,
  });

  const [todayPatients, setTodayPatients] = useState([]);
  const [recentPlans, setRecentPlans] = useState([]);

  const pendingTasks = [
    {
      id: 1,
      task: "Review diet plan for Rajesh Kumar",
      priority: "high",
      dueTime: "In 2 hours",
    },
    {
      id: 2,
      task: "Follow-up call with Priya Sharma",
      priority: "medium",
      dueTime: "Tomorrow",
    },
    {
      id: 3,
      task: "Update food database with seasonal items",
      priority: "low",
      dueTime: "This week",
    },
  ];

  const { user: currentUser } = useAuth();

  useEffect(() => {
    patientsAPI
      .getAll()
      .then((res) => {
        const loggedInDoctorId = currentUser?.id;
        const patients = (res.data.data?.patients || []).filter(
          (p: any) => p.doctorId === loggedInDoctorId
        );

        setStats((prev) => ({
          ...prev,
          totalPatients: patients.length,
        }));
      })
      .catch((err) => console.error("Error loading patients", err));

    dietPlansAPI
      .getAll()
      .then((res) => {
        const plans = res.data.data?.dietPlans || [];
        setStats((prev) => ({
          ...prev,
          dietPlansCreated: plans.length,
        }));
        setRecentPlans(plans.slice(0, 3));
      })
      .catch((err) => console.error("Error loading diet plans", err));

    chatAPI
      .getAll()
      .then((res) => {
        const msgs = res.data.data || [];
        const unread = msgs.filter((m: any) => !m.isRead).length;

        setStats((prev) => ({
          ...prev,
          unreadMessages: unread,
        }));
      })
      .catch((err) => console.error("Error loading messages", err));
  }, []);

  const doshaColors = {
    Vata: "bg-blue-100 text-blue-800",
    Pitta: "bg-red-100 text-red-800",
    Kapha: "bg-green-100 text-green-800",
    "Vata-Pitta": "bg-purple-100 text-purple-800",
    "Pitta-Kapha": "bg-orange-100 text-orange-800",
    "Vata-Kapha": "bg-teal-100 text-teal-800",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl text-foreground">{t("dashboard.title")}</h1>
          <p className="text-muted-foreground">
            {t("dashboard.welcomeMessage")}
          </p>
        </div>
        <Button
          onClick={() => navigate("/patients")}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("dashboard.addPatient")}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("doctorDashboard.totalPatients")}
                </p>
                <p className="text-2xl">{stats.totalPatients}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("doctorDashboard.dietPlansCreated")}
                </p>
                <p className="text-2xl">{stats.dietPlansCreated}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("doctorDashboard.consultationsToday")}
                </p>
                <p className="text-2xl">{stats.consultationsToday}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("doctorDashboard.unreadMessages")}
                </p>
                <p className="text-2xl">{stats.unreadMessages}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary" />
              {t("doctorDashboard.todaysPatients")}
            </CardTitle>
            <CardDescription>
              {t("doctorDashboard.todaysDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayPatients.map((patient: any) => (
              <div
                key={patient.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm">{patient.name}</p>
                    <Badge className={`text-xs ${doshaColors[patient.dosha]}`}>
                      {patient.dosha}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {patient.time}
                    </span>
                    <span>{patient.type}</span>
                  </div>
                </div>
                <Badge
                  variant={
                    patient.status === "confirmed" ? "default" : "secondary"
                  }
                >
                  {patient.status}
                </Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              {t("doctorDashboard.viewAllAppointments")}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Plans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-primary" />
              {t("doctorDashboard.recentPlans")}
            </CardTitle>
            <CardDescription>
              {t("doctorDashboard.recentPlansDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentPlans.map((plan: any) => (
              <div
                key={plan.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="space-y-1">
                  <p className="text-sm">{plan.patientName}</p>
                  <p className="text-xs text-muted-foreground">{plan.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {plan.createdAt}
                  </p>
                </div>
                <Badge
                  variant={plan.status === "active" ? "default" : "secondary"}
                >
                  {plan.status}
                </Badge>
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/diet-chart")}
            >
              {t("doctorDashboard.viewAllPlans")}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Pending Tasks + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2 text-primary" />
              {t("doctorDashboard.pendingTasks")}
            </CardTitle>
            <CardDescription>
              {t("doctorDashboard.pendingTasksDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="space-y-1">
                  <p className="text-sm">{task.task}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.dueTime}
                  </p>
                </div>
                <Badge
                  variant={
                    task.priority === "high"
                      ? "destructive"
                      : task.priority === "medium"
                      ? "default"
                      : "secondary"
                  }
                >
                  {task.priority}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("doctorDashboard.quickActions")}</CardTitle>
            <CardDescription>
              {t("doctorDashboard.quickActionsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/patients")}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("doctorDashboard.addNewPatient")}
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/diet-chart")}
            >
              <FileText className="w-4 h-4 mr-2" />
              {t("doctorDashboard.createDietPlan")}
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/auto-generate")}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              {t("doctorDashboard.autoGenerateDiet")}
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/food-database")}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("doctorDashboard.addFoodItem")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
