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

export function PatientSettings({ patient }) {
  const { user } = useAuth(); // dynamic user data

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
      <h1 className="text-3xl">Settings</h1>
      <p className="text-muted-foreground">Manage your personal details</p>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid grid-cols-1 w-full">
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        {/* ------------------ PROFILE TAB ------------------ */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal and health details</CardDescription>
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
                <Label>Name</Label>
                <Input
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                />
              </div>

              {/* Email */}
              <div>
                <Label>Email</Label>
                <Input value={profileData.email} disabled />
              </div>

              {/* Phone */}
              <div>
                <Label>Phone</Label>
                <Input
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                />
              </div>

              {/* Age */}
              <div>
                <Label>Age</Label>
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
                <Label>Gender</Label>
                <Input
                  value={profileData.gender}
                  onChange={(e) =>
                    setProfileData({ ...profileData, gender: e.target.value })
                  }
                />
              </div>

              {/* Dosha */}
              <div>
                <Label>Dosha Type</Label>
                <Input value={profileData.doshaType} disabled />
              </div>

              {/* Address */}
              <div>
                <Label>Address</Label>
                <Textarea
                  value={profileData.address}
                  onChange={(e) =>
                    setProfileData({ ...profileData, address: e.target.value })
                  }
                />
              </div>

              {/* Height */}
              <div>
                <Label>Height (cm)</Label>
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
                <Label>Weight (kg)</Label>
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
                <Label>Sleep Pattern</Label>
                <Input
                  value={profileData.sleepPattern}
                  onChange={(e) =>
                    setProfileData({ ...profileData, sleepPattern: e.target.value })
                  }
                />
              </div>

              {/* Bowel Movement */}
              <div>
                <Label>Bowel Movement</Label>
                <Input
                  value={profileData.bowelMovement}
                  onChange={(e) =>
                    setProfileData({ ...profileData, bowelMovement: e.target.value })
                  }
                />
              </div>

              {/* Patient Code */}
              <div>
                <Label>Patient Code</Label>
                <Input value={profileData.patientCode} disabled />
              </div>

              {/* Created At */}
              <div>
                <Label>Profile Created On</Label>
                <Input value={profileData.createdAt} disabled />
              </div>

              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
