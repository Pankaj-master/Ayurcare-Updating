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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../components/ui/avatar";

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
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";


export function PatientSettings({ patient }) {
  const { user } = useAuth(); // dynamic user data
  const { t } = useTranslation();

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    age: user?.age || "",
    gender: user?.gender || "",
    doshaType: user?.doshaType || "",
    address: user?.address || "",
    height: patient?.height || "",
    weight: patient?.weight || "",
    sleepPattern: patient?.sleepPattern || "",
    bowelMovement: patient?.bowelMovement || "",
    patientCode: patient?.patientCode || "",
    createdAt: patient?.createdAt ? patient.createdAt.split("T")[0] : ""
  });

  const handleSaveProfile = () => {
    // TODO: update patient profile API
    console.log("Saving:", profileData);
    alert("Profile updated!");
  };

return (
  <div className="space-y-6">
    {/* Header */}
    <h1 className="text-3xl">{t("patientSettings.title")}</h1>
    <p className="text-muted-foreground">
      {t("patientSettings.subtitle")}
    </p>

    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid grid-cols-1 w-full">
        <TabsTrigger value="profile">
          {t("patientSettings.tabs.profile")}
        </TabsTrigger>
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

          <CardContent className="space-y-4">
            {/* Avatar */}
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>
                  {user?.name?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Name */}
            <div>
              <Label>{t("patientSettings.fields.name")}</Label>
              <Input
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({ ...profileData, name: e.target.value })
                }
              />
            </div>

            {/* Email */}
            <div>
              <Label>{t("patientSettings.fields.email")}</Label>
              <Input value={profileData.email} disabled />
            </div>

            {/* Phone */}
            <div>
              <Label>{t("patientSettings.fields.phone")}</Label>
              <Input
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
              />
            </div>

            {/* Age */}
            <div>
              <Label>{t("patientSettings.fields.age")}</Label>
              <Input
                type="number"
                value={profileData.age}
                onChange={(e) =>
                  setProfileData({ ...profileData, age: e.target.value })
                }
              />
            </div>

            {/* Gender */}
            <div>
              <Label>{t("patientSettings.fields.gender")}</Label>
              <Input
                value={profileData.gender}
                onChange={(e) =>
                  setProfileData({ ...profileData, gender: e.target.value })
                }
              />
            </div>

            {/* Dosha */}
            <div>
              <Label>{t("patientSettings.fields.doshaType")}</Label>
              <Input value={profileData.doshaType} disabled />
            </div>

            {/* Address */}
            <div>
              <Label>{t("patientSettings.fields.address")}</Label>
              <Textarea
                value={profileData.address}
                onChange={(e) =>
                  setProfileData({ ...profileData, address: e.target.value })
                }
              />
            </div>

            {/* Height */}
            <div>
              <Label>{t("patientSettings.fields.height")}</Label>
              <Input
                type="number"
                value={profileData.height}
                onChange={(e) =>
                  setProfileData({ ...profileData, height: e.target.value })
                }
              />
            </div>

            {/* Weight */}
            <div>
              <Label>{t("patientSettings.fields.weight")}</Label>
              <Input
                type="number"
                value={profileData.weight}
                onChange={(e) =>
                  setProfileData({ ...profileData, weight: e.target.value })
                }
              />
            </div>

            {/* Sleep Pattern */}
            <div>
              <Label>{t("patientSettings.fields.sleepPattern")}</Label>
              <Input
                value={profileData.sleepPattern}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    sleepPattern: e.target.value,
                  })
                }
              />
            </div>

            {/* Bowel Movement */}
            <div>
              <Label>{t("patientSettings.fields.bowelMovement")}</Label>
              <Input
                value={profileData.bowelMovement}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    bowelMovement: e.target.value,
                  })
                }
              />
            </div>

            {/* Patient Code */}
            <div>
              <Label>{t("patientSettings.fields.patientCode")}</Label>
              <Input value={profileData.patientCode} disabled />
            </div>

            {/* Created At */}
            <div>
              <Label>{t("patientSettings.fields.createdAt")}</Label>
              <Input value={profileData.createdAt} disabled />
            </div>

            <Button onClick={handleSaveProfile}>
              {t("patientSettings.actions.saveChanges")}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
);

}
