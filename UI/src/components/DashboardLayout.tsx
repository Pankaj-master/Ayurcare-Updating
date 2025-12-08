import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Database,
  Settings,
  Search,
  Bell,
  LogOut,
  Leaf,
  ChefHat,
  PieChart,
  Wand2,
  BarChart3,
  History,
  MessageCircle,
  Clock,
} from "lucide-react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import { Badge } from "./ui/badge";
import { useAuth } from "../contexts/AuthContext";
import LanguageSwitcher from "../components/ui/languageSwitcher";
import { useTranslation } from "react-i18next";


// ------------------------------------
// SUPER ADMIN NAVIGATION
// ------------------------------------
const adminNavigationItems = (t: any) => [
  { id: "dashboard", label: "Admin Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { id: "doctors", label: "Verify Doctors", icon: Users, path: "/admin/doctors" },
  // { id: "patients", label: "Patients", icon: Users, path: "/admin/patients" },
  // { id: "staff", label: "Staff Management", icon: Users, path: "/admin/staff" },
  // { id: "settings", label: "Settings", icon: Settings, path: "/admin/settings" },
];


// ------------------------------------
// DOCTOR NAVIGATION
// ------------------------------------
const doctorNavigationItems = (t: any) => [
  { id: "dashboard", label: t("sidebar.dashboard"), icon: LayoutDashboard, path: "/dashboard" },
  { id: "patients", label: t("sidebar.patients"), icon: Users, path: "/patients" },

  { id: "create-diet-plans", label: t("sidebar.dietPlans"), icon: ChefHat, path: "/create-diet-plans" },
  { id: "auto-generate", label: t("sidebar.autoGenerate"), icon: Wand2, path: "/auto-generate" },
  { id: "food-database", label: t("sidebar.foodDatabase"), icon: Database, path: "/food-database" },

  { id: "chat", label: t("sidebar.chat"), icon: MessageCircle, path: "/chat-doctor" },
  { id: "settings", label: t("sidebar.settings"), icon: Settings, path: "/settings" },
];


// ------------------------------------
// PATIENT NAVIGATION
// ------------------------------------
const patientNavigationItems = (t: any) => [
  { id: "dashboard", label: t("sidebar.dashboard"), icon: LayoutDashboard, path: "/dashboard" },
  { id: "diet-history", label: t("sidebar.dietHistory"), icon: History, path: "/diet-history" },
  { id: "diet-chart", label: t("sidebar.dietChart"), icon: PieChart, path: "/diet-chart" },
  { id: "chat", label: t("sidebar.chatWithDoctor"), icon: MessageCircle, path: "/chat" },
  { id: "reports", label: t("sidebar.reports"), icon: BarChart3, path: "/reports" },
  { id: "reminders", label: t("sidebar.reminders"), icon: Clock, path: "/reminders" },
  { id: "patient-settings", label: t("sidebar.patientSettings"), icon: Settings, path: "/patient-settings" },
];


// ------------------------------------
// STAFF NAVIGATION
// ------------------------------------
const staffNavigationItems = (t: any) => [
  { id: "dashboard", label: "Staff Dashboard", icon: LayoutDashboard, path: "/staff/dashboard" },
  { id: "patients", label: "Assigned Patients", icon: Users, path: "/staff/patients" },
  { id: "chat", label: "Chat", icon: MessageCircle, path: "/staff/chat" },
];


// ------------------------------------
// MAIN LAYOUT COMPONENT
// ------------------------------------
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const handleNavigation = (path: string) => navigate(path);

  // --------------------------
  // ROLE-BASED NAVIGATION LOGIC
  // --------------------------
  let navigationItems: any[] = [];

  if (user?.role === "SUPER_ADMIN") {
    navigationItems = adminNavigationItems(t);

  } else if (user?.role === "DOCTOR") {
    if (user?.is_verified !== "VERIFIED") {
      navigationItems = [
        { id: "pending", label: "Verification Pending", icon: Clock, path: "/doctor/pending" }
      ];
    } else {
      navigationItems = doctorNavigationItems(t);
    }

  } else if (user?.role === "STAFF") {
    navigationItems = staffNavigationItems(t);

  } else {
    navigationItems = patientNavigationItems(t);
  }


  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg text-primary">Ayurcare</h1>
              <p className="text-xs text-muted-foreground">Ayurvedic Diet Management System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start space-x-3 ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent text-foreground"
                }`}
                onClick={() => handleNavigation(item.path)}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{user?.name}</p>
              <Badge variant="secondary" className="text-xs">
                {user?.role}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
          <div className="flex items-center flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("topbar.searchPlaceholder")}
                className="pl-10 w-full"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* 🌐 Language Switcher */}
            <LanguageSwitcher />

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-accent text-accent-foreground">
                3
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="w-4 h-4 mr-2" />
                  {t("userMenu.settings")}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("userMenu.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
