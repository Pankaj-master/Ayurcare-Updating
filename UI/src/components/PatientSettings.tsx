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
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { authAPI } from "../services/api";

export function PatientSettings({ patient }) {
  const { user } = useAuth();

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
    createdAt: patient?.createdAt ? patient.createdAt.split("T")[0] : "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorAuth: false,
    sessionTimeout: "30",
  });

  const handleSaveProfile = () => {
    console.log("Saving:", profileData);
    alert("Profile updated!");
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
      <h1 className="text-3xl">Patient Settings</h1>
      <p className="text-muted-foreground">Manage patient information</p>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* PROFILE TAB */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Edit patient details</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div>
                <Label>Name</Label>
                <Input
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input value={profileData.email} disabled />
              </div>

              <div>
                <Label>Phone</Label>
                <Input
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                />
              </div>

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

              <div>
                <Label>Gender</Label>
                <Input
                  value={profileData.gender}
                  onChange={(e) =>
                    setProfileData({ ...profileData, gender: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Dosha Type</Label>
                <Input value={profileData.doshaType} disabled />
              </div>

              <div>
                <Label>Address</Label>
                <Textarea
                  value={profileData.address}
                  onChange={(e) =>
                    setProfileData({ ...profileData, address: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Height</Label>
                <Input
                  type="number"
                  value={profileData.height}
                  onChange={(e) =>
                    setProfileData({ ...profileData, height: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Weight</Label>
                <Input
                  type="number"
                  value={profileData.weight}
                  onChange={(e) =>
                    setProfileData({ ...profileData, weight: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Sleep Pattern</Label>
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

              <div>
                <Label>Bowel Movement</Label>
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

              <div>
                <Label>Patient Code</Label>
                <Input value={profileData.patientCode} disabled />
              </div>

              <div>
                <Label>Created At</Label>
                <Input value={profileData.createdAt} disabled />
              </div>

              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECURITY TAB */}
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
                  <Label>Current Password</Label>
                  <div className="relative">
                    <Input
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
                    <Label>New Password</Label>
                    <Input
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