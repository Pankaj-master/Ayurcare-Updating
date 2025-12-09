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
import { Users, FileText, Calendar, Plus, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { patientsAPI, chatAPI, dietPlansAPI } from "../services/api";

import { useAuth } from "../contexts/AuthContext";

export function DoctorDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();

  const [stats, setStats] = useState({
    totalPatients: 0,
    dietPlansCreated: 0,
    consultationsToday: 0,
    unreadMessages: 0,
  });

  const [patients, setPatients] = useState([]);
  const [recentPlans, setRecentPlans] = useState([]);

  const doshaColors = {
    Vata: "bg-blue-100 text-blue-800",
    Pitta: "bg-red-100 text-red-800",
    Kapha: "bg-green-100 text-green-800",
    "Vata-Pitta": "bg-purple-100 text-purple-800",
    "Pitta-Kapha": "bg-orange-100 text-orange-800",
    "Vata-Kapha": "bg-teal-100 text-teal-800",
  };

  useEffect(() => {
    // Load Patients (By Doctor)
    patientsAPI
      .getByDoctor()
      .then((res) => {
        const all = res.data.data || [];
        setPatients(all);

        setStats((prev) => ({
          ...prev,
          totalPatients: all.length,
        }));
      })
      .catch((err) => console.error("Error loading patients", err));

    // Load Diet Plans
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

    // Load Chat Messages
    chatAPI
      .getAll()
      .then((res) => {
        const msgs = res.data.data || [];
        const unread = msgs.filter((m) => !m.isRead).length;

        setStats((prev) => ({
          ...prev,
          unreadMessages: unread,
        }));
      })
      .catch((err) => console.error("Error loading messages", err));
  }, []);

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
        {/* Total Patients */}
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

        {/* Diet Plans Created */}
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

        {/* Today Consultations Placeholder */}
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

        {/* Unread Messages */}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        {/* Patients Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Patients Overview</CardTitle>
            <CardDescription>Recently added patients</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {patients.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No patients found.
              </p>
            )}

            {patients.slice(0, 5).map((p) => {
              const dosha =
                p?.disease &&
                (p.disease.vata === 1
                  ? "Vata"
                  : p.disease.pitta === 1
                  ? "Pitta"
                  : p.disease.kapha === 1
                  ? "Kapha"
                  : null);

              return (
                <div
                  key={p.patientId}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={
                        p.avatar ||
                        "https://ui-avatars.com/api/?name=" +
                          encodeURIComponent(p.name)
                      }
                      className="w-10 h-10 rounded-full object-cover"
                    />

                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.email}</p>

                      {dosha && (
                        <Badge className={`mt-1 text-xs ${doshaColors[dosha]}`}>
                          {dosha}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/patients/${p.patientId}`)}
                  >
                    View
                  </Button>
                </div>
              );
            })}

            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/patients")}
            >
              View All Patients
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions Only */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Shortcuts to essential actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/patients")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Patient
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/diet-chart")}
            >
              <FileText className="w-4 h-4 mr-2" />
              Create Diet Plan
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/food-database")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Food Item
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
