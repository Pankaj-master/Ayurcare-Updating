import React, { useEffect, useState } from "react";
import { dietPlansAPI, patientsAPI } from "../services/api";

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
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Textarea } from "./ui/textarea";
import { Progress } from "./ui/progress";

import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  Download,
} from "lucide-react";

/* ---------------------------------------
   MOCK DATA (Instead of API)
----------------------------------------- */

const mockDietPlans = [
  {
    id: "plan1",
    name: "3-Day Sample Ayurvedic Diet",
    description: "A simple 3-day meal plan using available food items.",
    doctorId: "doc1",
    patientId: "pat1",
    doshaType: "VATA",
    duration: 3,
    isActive: true,
    createdAt: "2025-11-28T13:46:40.810Z",
    patient: {
      id: "pat1",
      name: "Adarsh Panda",
    },
    items: [], // You can add mock meal data here
  },
  {
    id: "plan2",
    name: "7-Day Kapha Detox Plan",
    description: "Warm and light meals to balance sluggish digestion.",
    doctorId: "doc1",
    patientId: "pat2",
    doshaType: "KAPHA",
    duration: 7,
    isActive: false,
    createdAt: "2025-10-10T10:00:00.000Z",
    patient: {
      id: "pat2",
      name: "Ritika Singh",
    },
    items: [],
  },
  {
    id: "plan3",
    name: "Pitta Cooling Meal Plan",
    description: "Fresh + cooling meals ideal for high heat imbalance.",
    doctorId: "doc1",
    patientId: "pat3",
    doshaType: "PITTA",
    duration: 5,
    isActive: true,
    createdAt: "2025-09-20T08:30:00.000Z",
    patient: {
      id: "pat3",
      name: "Aman Verma",
    },
    items: [],
  },
];

const mockPatients = [
  { id: "pat1", name: "Adarsh Panda" },
  { id: "pat2", name: "Ritika Singh" },
  { id: "pat3", name: "Aman Verma" },
];

/* ---------------------------------------
   MAIN COMPONENT LOGIC (NO RETURN)
----------------------------------------- */

export function DietPlans() {
  const [dietPlans, setDietPlans] = useState([]);
  const [patients, setPatients] = useState([]);

  const [loading, setLoading] = useState(false);
  const [patientsLoading, setPatientsLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);

  const [newPlan, setNewPlan] = useState({
    patientId: "",
    planName: "",
    duration: "",
    notes: "",
  });

  /* ---------------------------------------
     Helper: Compute Plan Progress Dynamically
  ----------------------------------------- */
  const getPlanProgress = (plan) => {
    const start = new Date(plan.createdAt);
    const today = new Date();
    const duration = plan.duration || 0;

    const diffDays = Math.floor((today - start) / (1000 * 60 * 60 * 24));

    const daysPassed = Math.min(diffDays, duration);
    const daysRemaining = Math.max(duration - daysPassed, 0);

    const endDate = new Date(start);
    endDate.setDate(endDate.getDate() + duration);

    const status = !plan.isActive
      ? "Paused"
      : daysPassed >= duration
      ? "Completed"
      : "Active";

    return {
      daysPassed,
      daysRemaining,
      endDate: endDate.toISOString().split("T")[0],
      progressPercent:
        duration === 0 ? 0 : Math.floor((daysPassed / duration) * 100),
      status,
    };
  };

  /* ---------------------------------------
     Fetch Data (Mock Instead of API)
  ----------------------------------------- */
  const fetchDietPlans = async () => {
    setLoading(true);
    try {
      // simulate network
      setTimeout(() => {
        setDietPlans(mockDietPlans);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    setPatientsLoading(true);
    try {
      setTimeout(() => {
        setPatients(mockPatients);
        setPatientsLoading(false);
      }, 300);
    } catch (error) {
      console.error(error);
      setPatientsLoading(false);
    }
  };

  useEffect(() => {
    fetchDietPlans();
    fetchPatients();
  }, []);

  /* ---------------------------------------
     Filter + Search
  ----------------------------------------- */
  const filteredPlans = dietPlans.filter((plan) => {
    const searchable = [
      plan.name,
      plan.patient?.name,
      plan.doshaType,
      plan.description,
    ];

    const matchesSearch = searchable.some((field) =>
      (field || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

    const progress = getPlanProgress(plan);

    const matchesStatus =
      filterStatus === "all" || progress.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  /* ---------------------------------------
     Create Plan (mock push)
  ----------------------------------------- */
  const handleCreatePlan = async () => {
    const payload = {
      id: "mock-" + Date.now(),
      name: newPlan.planName,
      description: newPlan.notes,
      patientId: newPlan.patientId,
      duration: parseInt(newPlan.duration),
      doshaType: "VATA",
      isActive: true,
      createdAt: new Date().toISOString(),
      patient: patients.find((p) => p.id === newPlan.patientId),
      items: [],
    };

    setDietPlans((prev) => [...prev, payload]);
    setIsCreatePlanOpen(false);
  };

  /* ---------------------------------------
     Delete Plan (mock)
  ----------------------------------------- */
  const handleDeletePlan = async (id) => {
    setDietPlans((prev) => prev.filter((p) => p.id !== id));
  };


  /* ----------------------------
     UI Rendering
     ---------------------------- */
return (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl">Diet Plans</h1>
        <p className="text-muted-foreground">
          Doctor dashboard — manage all diet plans
        </p>
      </div>

      <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate("/diet-plans/create")}>
        <Plus className="w-4 h-4 mr-2" />
        Create Diet Plan
      </Button>
    </div>

    {/* Search & Filter */}
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">

          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient or plan name..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>
      </CardContent>
    </Card>

    {/* Diet Plans Table */}
    <Card>
      <CardHeader>
        <CardTitle>Diet Plans ({filteredPlans.length})</CardTitle>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Plan Name</TableHead>
              <TableHead>Dosha</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredPlans.map((plan) => {
              const createdDate = new Date(plan.createdAt);
              const endDate = new Date(createdDate.getTime() + plan.duration * 24 * 60 * 60 * 1000);

              const today = new Date();
              const daysPassed = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));
              const daysRemaining = Math.max(0, plan.duration - daysPassed);

              const progressPercent = Math.min(100, (daysPassed / plan.duration) * 100);

              const status = plan.isActive
                ? progressPercent >= 100
                  ? "Completed"
                  : "Active"
                : "Paused";

              return (
                <TableRow key={plan.id}>
                  
                  {/* PATIENT */}
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span>{plan.patient?.name}</span>
                    </div>
                  </TableCell>

                  {/* PLAN NAME */}
                  <TableCell>{plan.name}</TableCell>

                  {/* DOSHA */}
                  <TableCell>
                    <Badge variant="secondary">{plan.doshaType}</Badge>
                  </TableCell>

                  {/* START DATE */}
                  <TableCell>
                    {createdDate.toISOString().split("T")[0]}
                  </TableCell>

                  {/* DURATION */}
                  <TableCell>
                    <div className="text-sm">
                      {plan.duration} days
                      <div className="text-xs text-muted-foreground">
                        {daysPassed} passed • {daysRemaining} left
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Ends: {endDate.toISOString().split("T")[0]}
                      </div>
                    </div>
                  </TableCell>

                  {/* STATUS */}
                  <TableCell>
                    <Badge
                      variant={
                        status === "Active"
                          ? "default"
                          : status === "Completed"
                          ? "outline"
                          : "secondary"
                      }
                    >
                      {status}
                    </Badge>
                  </TableCell>

                  {/* PROGRESS */}
                  <TableCell>
                    <Progress value={progressPercent} className="w-24" />
                  </TableCell>

                  {/* ACTIONS */}
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/diet-plans/${plan.id}`)}>
                        <Eye className="w-4 h-4" />
                      </Button>

                      <Button variant="ghost" size="sm" onClick={() => navigate(`/diet-plans/edit/${plan.id}`)}>
                        <Edit className="w-4 h-4" />
                      </Button>

                      <Button variant="ghost" size="sm" onClick={() => handleDeletePlan(plan.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>

                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
);

}
