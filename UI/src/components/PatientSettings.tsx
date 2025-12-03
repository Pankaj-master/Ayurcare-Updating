import React, { useState } from "react";

// Layout components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

// Inputs
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";

// User avatar
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

// Tabs & UI utilities
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";

// Icons
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
  Stethoscope,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";

import { authAPI , usersAPI} from "../services/api";

export function PatientSettings({ patient }) {
  const { user } = useAuth(); // dynamic user data
  const { t } = useTranslation();

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    age: user?.age || "",
    gender: user?.gender || "",
    address: user?.address || "",
    patientCode: patient?.patientCode || "",
    createdAt: patient?.createdAt ? patient.createdAt.split("T")[0] : "",
  });

  const [medicalData, setMedicalData] = useState({
    doshaType: user?.doshaType || "",
    medicalHistory: user?.medicalHistory || "",
    allergies: user?.allergies || "",
    medications: user?.medications || "",
    height: patient?.height || "",
    weight: patient?.weight || "",
    sleepPattern: patient?.sleepPattern || "",
    bowelMovement: patient?.bowelMovement || "",
    bloodGroup: patient?.bloodGroup || "",
    mealFrequency: patient?.mealFrequency || "",
    waterIntake: patient?.waterIntake || "",
    notes: patient?.notes || "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorAuth: false,
    sessionTimeout: "30",
  });

  const handleSaveProfile = async () => {
    try {
      const userId = user?.id; // logged-in user ID
      if (!userId) return alert("User ID missing");

      // Prepare data to send to API
      const updatedData = {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        age: Number(profileData.age),
        gender: profileData.gender,
        address: profileData.address,
      };

      // Call API
      const res = await usersAPI.update(userId, updatedData);

      // Optional UI update
      if (res?.data?.success) {
        alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating profile");
    }
  };

  const handleSaveMedical = async () => {
    try {
      const userId = user?.id;
      if (!userId) return alert("User ID missing");

      // Prepare medical data to send to API
      const updatedData = {
        doshaType: medicalData.doshaType,
        medicalHistory: medicalData.medicalHistory,
        allergies: medicalData.allergies,
        medications: medicalData.medications,
        height: Number(medicalData.height),
        weight: Number(medicalData.weight),
        sleepPattern: medicalData.sleepPattern,
        bowelMovement: medicalData.bowelMovement,
        bloodGroup: medicalData.bloodGroup,
        mealFrequency: medicalData.mealFrequency ? Number(medicalData.mealFrequency) : null,
        waterIntake: medicalData.waterIntake ? Number(medicalData.waterIntake) : null,
        notes: medicalData.notes,
      };

      // Call API
      const res = await usersAPI.update(userId, updatedData);

      if (res?.data?.success) {
        alert("Medical information updated successfully!");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating medical information");
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold">{t("patientSettings.title")}</h1>
        <p className="text-muted-foreground">{t("patientSettings.subtitle")}</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        {/* Tabs */}
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="profile">
            {t("patientSettings.tabs.profile")}
          </TabsTrigger>
          <TabsTrigger value="medical">
            <Stethoscope className="w-4 h-4 mr-2" />
            Medical
          </TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* ------------------ PROFILE TAB ------------------ */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t("patientSettings.profile.heading")}</CardTitle>
              <CardDescription>
                {t("patientSettings.profile.description")}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center space-x-4">
                <Avatar className="w-24 h-24 ring-2 ring-primary">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-xl font-bold">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* 2-column Grid for cleaner layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label>{t("patientSettings.fields.name")}</Label>
                  <Input
                    className="border border-gray-300"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label>{t("patientSettings.fields.email")}</Label>
                  <Input
                    className="border border-gray-300"
                    value={profileData.email}
                    disabled
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label>{t("patientSettings.fields.phone")}</Label>
                  <Input
                    className="border border-gray-300"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                  />
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <Label>{t("patientSettings.fields.age")}</Label>
                  <Input
                    className="border border-gray-300"
                    type="number"
                    value={profileData.age}
                    onChange={(e) =>
                      setProfileData({ ...profileData, age: e.target.value })
                    }
                  />
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <Label>{t("patientSettings.fields.gender")}</Label>
                  <Input
                    className="border border-gray-300"
                    value={profileData.gender}
                    onChange={(e) =>
                      setProfileData({ ...profileData, gender: e.target.value })
                    }
                  />
                </div>

                {/* Patient Code */}
                <div className="space-y-2">
                  <Label>{t("patientSettings.fields.patientCode")}</Label>
                  <Input
                    className="border border-gray-300"
                    value={profileData.patientCode}
                    disabled
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label>{t("patientSettings.fields.address")}</Label>
                <Textarea
                  value={profileData.address}
                  className="border border-gray-300"
                  onChange={(e) =>
                    setProfileData({ ...profileData, address: e.target.value })
                  }
                />
              </div>

              {/* Created At */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>{t("patientSettings.fields.createdAt")}</Label>
                  <Input
                    className="border border-gray-300"
                    value={profileData.createdAt}
                    disabled
                  />
                </div>
              </div>

              <Button className="mt-4" onClick={handleSaveProfile}>
                {t("patientSettings.actions.saveChanges")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ------------------ MEDICAL TAB ------------------ */}
        <TabsContent value="medical">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Stethoscope className="w-5 h-5 mr-2 text-primary" />
                Medical Information
              </CardTitle>
              <CardDescription>
                Manage your medical records and health information
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* 2-column Grid for medical data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dosha Type */}
                <div className="space-y-2">
                  <Label>Dosha Type</Label>
                  <Input
                    className="border border-gray-300"
                    value={medicalData.doshaType}
                    onChange={(e) =>
                      setMedicalData({ ...medicalData, doshaType: e.target.value })
                    }
                  />
                </div>

                {/* Blood Group */}
                <div className="space-y-2">
                  <Label>Blood Group</Label>
                  <Input
                    className="border border-gray-300"
                    value={medicalData.bloodGroup}
                    onChange={(e) =>
                      setMedicalData({ ...medicalData, bloodGroup: e.target.value })
                    }
                  />
                </div>

                {/* Height */}
                <div className="space-y-2">
                  <Label>Height (cm)</Label>
                  <Input
                    className="border border-gray-300"
                    type="number"
                    value={medicalData.height}
                    onChange={(e) =>
                      setMedicalData({ ...medicalData, height: e.target.value })
                    }
                  />
                </div>

                {/* Weight */}
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input
                    className="border border-gray-300"
                    type="number"
                    value={medicalData.weight}
                    onChange={(e) =>
                      setMedicalData({ ...medicalData, weight: e.target.value })
                    }
                  />
                </div>

                {/* Meal Frequency */}
                <div className="space-y-2">
                  <Label>Meal Frequency (per day)</Label>
                  <Input
                    className="border border-gray-300"
                    type="number"
                    value={medicalData.mealFrequency}
                    onChange={(e) =>
                      setMedicalData({ ...medicalData, mealFrequency: e.target.value })
                    }
                  />
                </div>

                {/* Water Intake */}
                <div className="space-y-2">
                  <Label>Water Intake (liters per day)</Label>
                  <Input
                    className="border border-gray-300"
                    type="number"
                    step="0.1"
                    value={medicalData.waterIntake}
                    onChange={(e) =>
                      setMedicalData({ ...medicalData, waterIntake: e.target.value })
                    }
                  />
                </div>

                {/* Sleep Pattern */}
                <div className="space-y-2">
                  <Label>Sleep Pattern</Label>
                  <Input
                    className="border border-gray-300"
                    value={medicalData.sleepPattern}
                    onChange={(e) =>
                      setMedicalData({ ...medicalData, sleepPattern: e.target.value })
                    }
                  />
                </div>

                {/* Bowel Movement */}
                <div className="space-y-2">
                  <Label>Bowel Movement</Label>
                  <Input
                    className="border border-gray-300"
                    value={medicalData.bowelMovement}
                    onChange={(e) =>
                      setMedicalData({ ...medicalData, bowelMovement: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Text areas for longer medical information */}
              <div className="space-y-4">
                {/* Medical History */}
                <div className="space-y-2">
                  <Label>Medical History</Label>
                  <Textarea
                    value={medicalData.medicalHistory}
                    className="border border-gray-300"
                    placeholder="Any past medical conditions, surgeries, or chronic illnesses"
                    onChange={(e) =>
                      setMedicalData({ ...medicalData, medicalHistory: e.target.value })
                    }
                  />
                </div>

                {/* Allergies */}
                <div className="space-y-2">
                  <Label>Allergies</Label>
                  <Textarea
                    value={medicalData.allergies}
                    className="border border-gray-300"
                    placeholder="Any known allergies to medications, food, or environmental factors"
                    onChange={(e) =>
                      setMedicalData({ ...medicalData, allergies: e.target.value })
                    }
                  />
                </div>

                {/* Medications */}
                <div className="space-y-2">
                  <Label>Current Medications</Label>
                  <Textarea
                    value={medicalData.medications}
                    className="border border-gray-300"
                    placeholder="List of current medications, supplements, or treatments"
                    onChange={(e) =>
                      setMedicalData({ ...medicalData, medications: e.target.value })
                    }
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Additional Notes</Label>
                  <Textarea
                    value={medicalData.notes}
                    className="border border-gray-300"
                    placeholder="Any other relevant health information or concerns"
                    onChange={(e) =>
                      setMedicalData({ ...medicalData, notes: e.target.value })
                    }
                  />
                </div>
              </div>

              <Button className="mt-4" onClick={handleSaveMedical}>
                Save Medical Information
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ------------------ SECURITY TAB ------------------ */}
        <TabsContent value="security" className="space-y-8">
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

            <CardContent className="space-y-8">
              {/* Change Password */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Change Password</h3>

                {/* Current Password */}
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <div className="relative">
                    <Input
                      className="border border-gray-300"
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

                {/* New + Confirm Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input
                      className="border border-gray-300"
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
                    <Label>Confirm New Password</Label>
                    <Input
                      className="border border-gray-300"
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

                <Button variant="outline" onClick={handleChangePassword}>
                  Change Password
                </Button>
              </div>

              <Separator />

              {/* Additional Security */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Additional Security</h3>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch
                    checked={security.twoFactorAuth}
                    onCheckedChange={(checked) =>
                      setSecurity({ ...security, twoFactorAuth: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Session Timeout (minutes)</Label>
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
      </Tabs>
    </div>
  );
}