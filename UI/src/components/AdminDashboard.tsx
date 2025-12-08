import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Users, UserCheck, UserX } from "lucide-react";
import { superAdminAPI } from "../services/api";

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    pendingDoctors: 0,
    totalPatients: 0,
  });

  useEffect(() => {
    superAdminAPI
      .getStats()
      .then((res) => {
        setStats(res.data.data);
      })
      .catch((err) => console.error("Error loading admin stats", err));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-3xl text-foreground font-semibold">Admin Dashboard</h1>
      <p className="text-muted-foreground">Overview of system-wide activity</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Total Doctors */}
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Doctors</p>
              <p className="text-2xl font-semibold">{stats.totalDoctors}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        {/* Pending Doctors */}
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Verifications</p>
              <p className="text-2xl font-semibold">{stats.pendingDoctors}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <UserX className="w-6 h-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        {/* Total Patients */}
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Patients</p>
              <p className="text-2xl font-semibold">{stats.totalPatients}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
