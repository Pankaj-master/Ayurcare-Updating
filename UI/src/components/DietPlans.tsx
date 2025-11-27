import React, { useEffect, useState } from "react";
import axios from "axios";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { dietPlansAPI, patientsAPI } from "../services/api";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  FileText,
  Calendar,
  User,
  Target,
  Coffee,
  Sandwich,
  UtensilsCrossed,
  Cookie,
  Download,
  CheckCircle,
} from "lucide-react";

/*
  NOTES:
  - This component assumes axios is configured elsewhere with baseURL and auth token.
    If you have an `api` axios instance, replace `axios` with your `api` import.
  - Backend endpoints used:
    GET  /diet-plans
    POST /diet-plans
    DELETE /diet-plans/:id
    GET  /patients/stats/doctor
  - DietPlan creation payload uses `name` (backend) — frontend uses `planName` for UI, mapped before POST.
*/

const mealIcons = {
  breakfast: Coffee,
  lunch: Sandwich,
  dinner: UtensilsCrossed,
  snacks: Cookie,
};

export function DietPlans() {
  const [dietPlans, setDietPlans] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  const [newPlan, setNewPlan] = useState({
    patientId: "",
    planName: "",
    duration: "",
    targetWeight: "",
    totalCalories: "",
    notes: "",
    meals: {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
    },
  });

  // Fetch diet plans
  const fetchDietPlans = async () => {
    setLoading(true);
    try {
      const res = await dietPlansAPI.getAll();
      setDietPlans(res.data.data); // backend returns { success, data }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  // Fetch patients for logged-in doctor
  const fetchPatients = async () => {
    setPatientsLoading(true);
    try {
      const res = await patientsAPI.getDoctor();
      setPatients(res.data.data);
    } catch (e) {
      console.error(e);
    }
    setPatientsLoading(false);
  };

  useEffect(() => {
    fetchDietPlans();
    fetchPatients();
  }, []);

  const filteredPlans = dietPlans.filter((plan) => {
    const patientName = (
      plan.patient?.name ||
      plan.patientName ||
      ""
    ).toLowerCase();
    const planName = (plan.name || plan.planName || "").toLowerCase();
    const matchesSearch =
      patientName.includes(searchTerm.toLowerCase()) ||
      planName.includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || plan.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const selectedPlan = selectedPlanId
    ? dietPlans.find((p) => p.id === selectedPlanId)
    : null;

  // Create diet plan (calls backend)
  const handleCreatePlan = async () => {
    const payload = {
      name: newPlan.planName,
      description: newPlan.notes,
      patientId: newPlan.patientId,
      duration: parseInt(newPlan.duration),
      items: [], // add when needed
    };

    try {
      const res = await dietPlansAPI.create(payload);
      fetchDietPlans();
      setIsCreatePlanOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePlan = async (id) => {
    try {
      await dietPlansAPI.delete(id);
      setDietPlans(dietPlans.filter((p) => p.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const calculateMealCalories = (meals) => {
    if (!Array.isArray(meals)) return 0;
    return meals.reduce((total, meal) => total + (meal.calories || 0), 0);
  };

  const getComplianceColor = (compliance) => {
    if (compliance >= 80) return "text-green-600";
    if (compliance >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl text-foreground">Diet Plans</h1>
          <p className="text-muted-foreground">
            Create and manage personalized diet plans for patients
          </p>
        </div>

        <Dialog open={isCreatePlanOpen} onOpenChange={setIsCreatePlanOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Diet Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Diet Plan</DialogTitle>
              <DialogDescription>
                Design a personalized diet plan for your patient
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient">Patient *</Label>
                  <Select
                    value={newPlan.patientId}
                    onValueChange={(value) =>
                      setNewPlan({ ...newPlan, patientId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem
                          key={patient.id}
                          value={patient.id.toString()}
                        >
                          {patient.name} ({patient.dosha})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plan-name">Plan Name *</Label>
                  <Input
                    id="plan-name"
                    value={newPlan.planName}
                    onChange={(e) =>
                      setNewPlan({ ...newPlan, planName: e.target.value })
                    }
                    placeholder="e.g., Weight Loss - Vata Balancing"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration *</Label>
                  <Select
                    value={newPlan.duration}
                    onValueChange={(value) =>
                      setNewPlan({ ...newPlan, duration: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 month">1 month</SelectItem>
                      <SelectItem value="2 months">2 months</SelectItem>
                      <SelectItem value="3 months">3 months</SelectItem>
                      <SelectItem value="6 months">6 months</SelectItem>
                      <SelectItem value="1 year">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target-weight">Target Weight (kg)</Label>
                  <Input
                    id="target-weight"
                    type="number"
                    value={newPlan.targetWeight}
                    onChange={(e) =>
                      setNewPlan({ ...newPlan, targetWeight: e.target.value })
                    }
                    placeholder="68"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="total-calories">Daily Calories</Label>
                  <Input
                    id="total-calories"
                    type="number"
                    value={newPlan.totalCalories}
                    onChange={(e) =>
                      setNewPlan({ ...newPlan, totalCalories: e.target.value })
                    }
                    placeholder="1800"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Special Notes & Guidelines</Label>
                <Textarea
                  id="notes"
                  value={newPlan.notes}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, notes: e.target.value })
                  }
                  placeholder="Include specific dietary guidelines, restrictions, and Ayurvedic recommendations..."
                  rows={4}
                />
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  Note: After creating the plan, you can add specific meals and
                  foods using the meal planner.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsCreatePlanOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreatePlan}
                className="bg-primary hover:bg-primary/90"
              >
                Create Plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search diet plans by patient name or plan name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
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
          <CardDescription>
            Manage diet plans and track patient progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Plan Name</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Compliance</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span>{plan.patientName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{plan.planName}</p>
                      <p className="text-xs text-muted-foreground">
                        {plan.totalCalories} cal/day
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3 mr-1" />
                      {plan.dateCreated}
                    </div>
                  </TableCell>
                  <TableCell>{plan.duration}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        plan.status === "Active"
                          ? "default"
                          : plan.status === "Draft"
                          ? "secondary"
                          : plan.status === "Completed"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {plan.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {plan.status === "Active" ? (
                      <div className="flex items-center space-x-2">
                        <Progress value={plan.compliance} className="w-16" />
                        <span
                          className={`text-sm ${getComplianceColor(
                            plan.compliance
                          )}`}
                        >
                          {plan.compliance}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {plan.targetWeight ? (
                      <div className="flex items-center space-x-1 text-sm">
                        <Target className="w-3 h-3 text-muted-foreground" />
                        <span>
                          {plan.currentWeight}kg → {plan.targetWeight}kg
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No target set
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPlanId(plan.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePlan(plan.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Diet Plan Detail Modal */}
      {selectedPlan && (
        <Dialog
          open={!!selectedPlanId}
          onOpenChange={() => setSelectedPlanId(null)}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{selectedPlan.planName}</span>
                <Badge
                  variant={
                    selectedPlan.status === "Active" ? "default" : "secondary"
                  }
                >
                  {selectedPlan.status}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Diet plan for {selectedPlan.patientName} • Created on{" "}
                {selectedPlan.dateCreated}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="meals" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="meals">Meal Plan</TabsTrigger>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
              </TabsList>

              <TabsContent value="meals" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {Object.entries(selectedPlan.meals).map(
                    ([mealType, meals]) => {
                      const Icon = mealIcons[mealType];
                      const mealCalories = calculateMealCalories(meals);

                      return (
                        <Card key={mealType}>
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center justify-between text-lg capitalize">
                              <div className="flex items-center">
                                <Icon className="w-5 h-5 mr-2 text-primary" />
                                {mealType}
                              </div>
                              <span className="text-sm text-primary">
                                {mealCalories} cal
                              </span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {meals.length > 0 ? (
                              meals.map((meal, index) => (
                                <div
                                  key={index}
                                  className="flex justify-between items-center p-2 rounded bg-muted/50"
                                >
                                  <div>
                                    <p className="text-sm">{meal.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {meal.quantity}
                                    </p>
                                  </div>
                                  <span className="text-sm text-primary">
                                    {meal.calories} cal
                                  </span>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                No meals added yet
                              </p>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mt-2"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Food
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    }
                  )}
                </div>

                {selectedPlan.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Special Guidelines
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {selectedPlan.notes}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        Daily Calories
                      </p>
                      <p className="text-2xl text-primary">
                        {selectedPlan.totalCalories}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="text-2xl">{selectedPlan.duration}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        Target Weight
                      </p>
                      <p className="text-2xl">
                        {selectedPlan.targetWeight || "Not set"}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="compliance" className="space-y-4">
                {selectedPlan.status === "Active" ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-primary" />
                        Patient Compliance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Overall Compliance</span>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={selectedPlan.compliance}
                            className="w-32"
                          />
                          <span
                            className={`text-sm ${getComplianceColor(
                              selectedPlan.compliance
                            )}`}
                          >
                            {selectedPlan.compliance}%
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Patient has been following the diet plan with{" "}
                        {selectedPlan.compliance}% compliance rate. This
                        includes meal adherence, timing, and portion control.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <p className="text-muted-foreground">
                        Compliance tracking is available only for active diet
                        plans.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setSelectedPlanId(null)}>
                Close
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button className="bg-primary hover:bg-primary/90">
                <Edit className="w-4 h-4 mr-2" />
                Edit Plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
