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
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import {
  User,
  Building,
  Shield,
  Bell,
  Palette,
  Database,
  Download,
  Upload,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";

import { useEffect } from "react";
import { authAPI } from "../services/api";
import { useTranslation } from "react-i18next";

export function Settings({ user }) {
  const { t } = useTranslation();

  const [showPassword, setShowPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    specialization: "",
    experience: "",
    bio: "",
    avatar: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await authAPI.getMe();
        const user = res.data.data;

        setProfileData({
          id: user.id || "",
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          specialization: user.specialization || "",
          experience: user.experience || "",
          bio: user.bio || "",
          avatar: user.avatar || "",
        });
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchUser();
  }, []);

  const [clinicData, setClinicData] = useState({
    name: "Ayurveda Wellness Center",
    address: "123 Health Street, Wellness District, Mumbai, Maharashtra 400001",
    phone: "+91 22 1234 5678",
    email: "info@ayurvedawellness.com",
    website: "www.ayurvedawellness.com",
    license: "AYU-MH-2024-001234",
  });

  const [notifications, setNotifications] = useState({
    dietPlanUpdates: true,
    patientMessages: true,
    systemUpdates: false,
    emailNotifications: true,
    smsNotifications: false,
  });

  const [preferences, setPreferences] = useState({
    theme: "light",
    language: "en",
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    defaultCalorieGoal: "1800",
    autoSaveInterval: "5",
  });

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorAuth: false,
    sessionTimeout: "30",
  });

  const handleSaveProfile = () => {
    console.log("Saving profile data:", profileData);
    // Mock save functionality
    alert("Profile updated successfully!");
  };

  const handleSaveClinic = () => {
    console.log("Saving clinic data:", clinicData);
    alert("Clinic information updated successfully!");
  };

  const handleSaveNotifications = () => {
    console.log("Saving notification settings:", notifications);
    alert("Notification settings updated successfully!");
  };

  const handleSavePreferences = () => {
    console.log("Saving preferences:", preferences);
    alert("Preferences updated successfully!");
  };

  const handleChangePassword = async () => {
    if (security.newPassword !== security.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    try {
      const res = await authAPI.changePassword({
        currentPassword: security.currentPassword,
        newPassword: security.newPassword,
      });

      alert(res.data.message || "Password changed successfully!");

      setSecurity({
        ...security,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to change password");
    }
  };

  const handleExportData = () => {
    console.log("Exporting data...");
    alert("Data export started. You will receive an email when ready.");
  };

  const handleImportData = () => {
    console.log("Importing data...");
    alert("Data import functionality would be implemented here.");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl text-foreground">{t("settings.title")}</h1>
        <p className="text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile">
            {t("settings.tabs.profile")}
          </TabsTrigger>
          <TabsTrigger value="clinic">{t("settings.tabs.clinic")}</TabsTrigger>
          <TabsTrigger value="notifications">
            {t("settings.tabs.notifications")}
          </TabsTrigger>
          <TabsTrigger value="preferences">
            {t("settings.tabs.preferences")}
          </TabsTrigger>
          <TabsTrigger value="security">
            {t("settings.tabs.security")}
          </TabsTrigger>
          <TabsTrigger value="data">{t("settings.tabs.data")}</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2 text-primary" />
                {t("settings.profile.title")}
              </CardTitle>
              <CardDescription>
                {t("settings.profile.subtitle")}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profileData.avatar} />
                  <AvatarFallback>
                    {profileData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    {t("settings.profile.uploadPhoto")}
                  </Button>

                  <p className="text-xs text-muted-foreground">
                    {t("settings.profile.photoNote")}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Profile Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("settings.profile.fullName")}</Label>
                  <Input
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("settings.profile.email")}</Label>
                  <Input
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("settings.profile.phone")}</Label>
                  <Input
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("settings.profile.specialization")}</Label>
                  <Input
                    value={profileData.specialization}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        specialization: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("settings.profile.experience")}</Label>
                  <Input
                    value={profileData.experience}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        experience: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("settings.profile.bio")}</Label>
                <Textarea
                  value={profileData.bio}
                  onChange={(e) =>
                    setProfileData({ ...profileData, bio: e.target.value })
                  }
                  placeholder={t("settings.profile.bioPlaceholder")}
                />
              </div>

              <Button className="bg-primary" onClick={handleSaveProfile}>
                <Save className="w-4 h-4 mr-2" />
                {t("settings.common.saveProfile")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clinic */}
        <TabsContent value="clinic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="w-5 h-5 mr-2 text-primary" />
                {t("settings.clinic.title")}
              </CardTitle>
              <CardDescription>{t("settings.clinic.subtitle")}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("settings.clinic.clinicName")}</Label>
                  <Input
                    value={clinicData.name}
                    onChange={(e) =>
                      setClinicData({ ...clinicData, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("settings.clinic.license")}</Label>
                  <Input
                    value={clinicData.license}
                    onChange={(e) =>
                      setClinicData({ ...clinicData, license: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("settings.clinic.phone")}</Label>
                  <Input
                    value={clinicData.phone}
                    onChange={(e) =>
                      setClinicData({ ...clinicData, phone: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("settings.clinic.email")}</Label>
                  <Input
                    value={clinicData.email}
                    type="email"
                    onChange={(e) =>
                      setClinicData({ ...clinicData, email: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("settings.clinic.website")}</Label>
                  <Input
                    value={clinicData.website}
                    onChange={(e) =>
                      setClinicData({ ...clinicData, website: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("settings.clinic.address")}</Label>
                <Textarea
                  value={clinicData.address}
                  onChange={(e) =>
                    setClinicData({ ...clinicData, address: e.target.value })
                  }
                />
              </div>

              <Button className="bg-primary" onClick={handleSaveClinic}>
                <Save className="w-4 h-4 mr-2" />
                {t("settings.clinic.save")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2 text-primary" />
                {t("settings.notifications.title")}
              </CardTitle>
              <CardDescription>
                {t("settings.notifications.subtitle")}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Loop 1 - App Notifications */}
              <div className="space-y-4">
                <h3 className="text-lg">
                  {t("settings.notifications.appTitle")}
                </h3>

                {Object.entries({
                  dietPlanUpdates: t("settings.notifications.dietPlanUpdates"),
                  patientMessages: t("settings.notifications.patientMessages"),
                  systemUpdates: t("settings.notifications.systemUpdates"),
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <Label>{label}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t("settings.notifications.receive")}{" "}
                        {label.toLowerCase()}
                      </p>
                    </div>

                    <Switch
                      checked={notifications[key]}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, [key]: checked })
                      }
                    />
                  </div>
                ))}
              </div>

              <Separator />

              {/* Loop 2 - Channels */}
              <div className="space-y-4">
                <h3 className="text-lg">
                  {t("settings.notifications.channelsTitle")}
                </h3>

                {Object.entries({
                  emailNotifications: t("settings.notifications.email"),
                  smsNotifications: t("settings.notifications.sms"),
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <Label>{label}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t("settings.notifications.receiveVia")}{" "}
                        {label.toLowerCase()}
                      </p>
                    </div>

                    <Switch
                      checked={notifications[key]}
                      onCheckedChange={(c) =>
                        setNotifications({ ...notifications, [key]: c })
                      }
                    />
                  </div>
                ))}
              </div>

              <Button className="bg-primary" onClick={handleSaveNotifications}>
                <Save className="w-4 h-4 mr-2" />
                {t("settings.notifications.save")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="w-5 h-5 mr-2 text-primary" />
                Application Preferences
              </CardTitle>
              <CardDescription>
                Customize your application experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={preferences.theme}
                    onValueChange={(value) =>
                      setPreferences({ ...preferences, theme: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={preferences.language}
                    onValueChange={(value) =>
                      setPreferences({ ...preferences, language: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="mr">Marathi</SelectItem>
                      <SelectItem value="gu">Gujarati</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={preferences.timezone}
                    onValueChange={(value) =>
                      setPreferences({ ...preferences, timezone: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">
                        India Standard Time
                      </SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">
                        Eastern Time
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select
                    value={preferences.dateFormat}
                    onValueChange={(value) =>
                      setPreferences({ ...preferences, dateFormat: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calorie-goal">Default Calorie Goal</Label>
                  <Input
                    id="calorie-goal"
                    value={preferences.defaultCalorieGoal}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        defaultCalorieGoal: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="autosave">Auto-save Interval (minutes)</Label>
                  <Input
                    id="autosave"
                    value={preferences.autoSaveInterval}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        autoSaveInterval: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <Button
                onClick={handleSavePreferences}
                className="bg-primary hover:bg-primary/90"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-primary" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your account security and privacy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg">Change Password</h3>

                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPassword ? "text" : "password"}
                      value={security.currentPassword}
                      onChange={(e) =>
                        setSecurity({
                          ...security,
                          currentPassword: e.target.value,
                        })
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={security.newPassword}
                      onChange={(e) =>
                        setSecurity({
                          ...security,
                          newPassword: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={security.confirmPassword}
                      onChange={(e) =>
                        setSecurity({
                          ...security,
                          confirmPassword: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <Button onClick={handleChangePassword} variant="outline">
                  Change Password
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg">Additional Security</h3>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="two-factor">
                      Two-Factor Authentication
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch
                    id="two-factor"
                    checked={security.twoFactorAuth}
                    onCheckedChange={(checked) =>
                      setSecurity({ ...security, twoFactorAuth: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session-timeout">
                    Session Timeout (minutes)
                  </Label>
                  <Select
                    value={security.sessionTimeout}
                    onValueChange={(value) =>
                      setSecurity({ ...security, sessionTimeout: value })
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Tab */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2 text-primary" />
                Data Management
              </CardTitle>
              <CardDescription>
                Export and import your data, or reset your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg">Data Export</h3>
                <p className="text-sm text-muted-foreground">
                  Download all your data including patient records, diet plans,
                  and settings
                </p>
                <Button onClick={handleExportData} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export All Data
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg">Data Import</h3>
                <p className="text-sm text-muted-foreground">
                  Import data from a previous backup or another system
                </p>
                <Button onClick={handleImportData} variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg text-destructive">Danger Zone</h3>
                <p className="text-sm text-muted-foreground">
                  These actions cannot be undone. Please be careful.
                </p>
                <Button
                  variant="destructive"
                  onClick={() =>
                    alert("Account deletion would be implemented here")
                  }
                >
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
