import React, { useState, useEffect } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "./ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "./ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "./ui/table";
import { Textarea } from "./ui/textarea";
import {
  Plus, Search, Filter, Eye, Edit, Trash2, User, Calendar, MapPin
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { patientsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const mockPatients = [
  {
    id: 1,
    name: "Rajesh Kumar",
    age: 45,
    gender: "Male",
    dosha: "Vata",
    lastVisit: "2024-01-15",
    phone: "+91 98765 43210",
    email: "rajesh.kumar@email.com",
    weight: 72,
    height: 175,
    bmi: 23.5,
    address: "Mumbai, Maharashtra",
  },
];

const doshaColors = {
  Vata: "bg-blue-100 text-blue-800",
  Pitta: "bg-red-100 text-red-800",
  Kapha: "bg-green-100 text-green-800",
  "Vata-Pitta": "bg-purple-100 text-purple-800",
  "Pitta-Kapha": "bg-orange-100 text-orange-800",
  "Vata-Kapha": "bg-teal-100 text-teal-800",
};

export function PatientManagement() {
  type Patient = {
    id: string;
    name: string;
    age: number | string;
    gender: string;
    dosha: string;
    bmi?: number | null;
    lastVisit?: string;
    phone?: string;
    email?: string;
    weight?: number | null;
    height?: number | null;
    address?: string;
  };

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDosha, setFilterDosha] = useState("all");
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);

  // 🔥 NEW: Edit modal state moved inside component
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [editForm, setEditForm] = useState({
    height: "",
    weight: "",
    doshaType: "",
    sleepPattern: "",
    bowelMovement: "",
  });

  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
    weight: "",
    height: "",
    dosha: "",
    address: "",
    lifestyle: {
      sleep: "",
      bowel: "",
    },
  });

  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const mapDoshaDisplay = (doshaType: string) => {
    if (!doshaType) return "N/A";
    const map: any = {
      VATA: "Vata",
      PITTA: "Pitta",
      KAPHA: "Kapha",
      TRIDOSHA: "Vata-Pitta",
    };
    return map[doshaType] || doshaType;
  };

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await patientsAPI.getAll();
        const patientList = res.data.data.patients || [];

        const transformed = patientList
          .filter((p: any) => p.doctorId === currentUser?.id)
          .map((p: any) => {
            const u = p.user;
            const bmi =
              p.weight && p.height
                ? parseFloat((p.weight / (p.height / 100) ** 2).toFixed(1))
                : null;

            return {
              id: p.id,
              name: u?.name || "Unknown",
              age: u?.age || "N/A",
              gender: u?.gender || "N/A",
              dosha: mapDoshaDisplay(u?.doshaType),
              lastVisit: p.updatedAt?.split("T")[0] || "N/A",
              phone: u?.phone,
              email: u?.email,
              weight: p.weight,
              height: p.height,
              bmi,
              address: u?.address || "N/A",
            };
          });

        setPatients(transformed);
      } catch (err) {
        console.error("❌ Fetch patients failed:", err);
        setPatients(mockPatients);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.id) fetchPatients();
  }, [currentUser]);

  const filteredPatients = patients.filter((p) => {
    return (
      (p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterDosha === "all" || p.dosha === filterDosha)
    );
  });



  // ⚠👇 Add Patient Section (UNCHANGED - DO NOT EDIT)
  const handleAddPatient = async () => {
    // Basic client-side validation
    if (!newPatient.name || !newPatient.email) {
      alert("Name and email are required to create a patient");
      return;
    }

    if (!currentUser?.id) {
      alert("You must be logged in as a doctor to create patients");
      return;
    }

    try {
      const mapDosha = (d) => {
        if (!d) return undefined;
        const key = d.toLowerCase();
        if (key.includes("vata") && key.includes("pitta")) return "TRIDOSHA";
        if (key.includes("vata")) return "VATA";
        if (key.includes("pitta")) return "PITTA";
        if (key.includes("kapha")) return "KAPHA";
        return "TRIDOSHA";
      };

      const payload = {
        email: newPatient.email,
        name: newPatient.name,
        phone: newPatient.phone || undefined,
        address: newPatient.address || undefined,
        age: newPatient.age ? Number(newPatient.age) : undefined,
        gender: newPatient.gender || undefined,
        doshaType: mapDosha(newPatient.dosha),
        doctorId: currentUser.id,
        patientCode: `P-${Date.now()}`,
        height: newPatient.height ? Number(newPatient.height) : undefined,
        weight: newPatient.weight ? Number(newPatient.weight) : undefined,
        sleepPattern: newPatient.lifestyle?.sleep || undefined,
        bowelMovement: newPatient.lifestyle?.bowel || undefined,
      };

      const body = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== undefined)
      );

      const response = await patientsAPI.create(body);
      const createdPatient = response.data.data;
      const u = createdPatient.user;

      const weight = createdPatient.weight;
      const height = createdPatient.height;
      const bmi =
        weight && height
          ? parseFloat((weight / (height / 100) ** 2).toFixed(1))
          : null;

      const patientWithUser = {
        id: createdPatient.id,
        name: u?.name,
        age: u?.age,
        gender: u?.gender,
        dosha: mapDoshaDisplay(u?.doshaType),
        lastVisit: new Date().toISOString().split("T")[0],
        phone: u?.phone,
        email: u?.email,
        weight,
        height,
        bmi,
        address: u?.address || "N/A",
      };

      setPatients((prev) => [...prev, patientWithUser]);
      setIsAddPatientOpen(false);

      setNewPatient({
        name: "",
        age: "",
        gender: "",
        phone: "",
        email: "",
        weight: "",
        height: "",
        dosha: "",
        address: "",
        lifestyle: { sleep: "", bowel: "" },
      });
    } catch (err) {
      console.error("❌ Add Patient Error:", err);
      alert("Add patient failed!");
    }
  };

  // ⚠ End of Add Patient section

const handleEditSave = async () => {
  try {
    if (!editingPatient) return;

    const updateData: any = {};

    if (editForm.height) updateData.height = Number(editForm.height);
    if (editForm.weight) updateData.weight = Number(editForm.weight);
    if (editForm.dosha) updateData.doshaType = editForm.dosha;
    if (editForm.sleepPattern) updateData.sleepPattern = editForm.sleepPattern;
    if (editForm.bowelMovement) updateData.bowelMovement = editForm.bowelMovement;

    // Remove empty values
    const body = Object.fromEntries(
      Object.entries(updateData).filter(([_, v]) => v !== undefined && v !== "")
    );

    await patientsAPI.update(editingPatient.id, body);

    // Update UI instantly
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== editingPatient.id) return p;

        const updated = {
          ...p,
          ...editForm,
        };

        // Recalculate BMI if height & weight updated
        if (editForm.height && editForm.weight) {
          const h = Number(editForm.height);
          const w = Number(editForm.weight);
          updated.bmi = Number((w / (h / 100) ** 2).toFixed(1));
        }

        return updated;
      })
    );

    setEditingPatient(null);
    console.log("Updated Successfully");
  } catch (error) {
    console.error("❌ Update failed!", error);
    alert("Failed to update patient.");
  }
};



  const handleDeletePatient = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient?"))
      return;

    try {
      // Optimistic UI update
      const updatedPatients = patients.filter((p) => p.id !== id);
      setPatients(updatedPatients);

      await patientsAPI.delete(id); // DELETE /patients/:id

      console.log("Patient deleted successfully:", id);
    } catch (err) {
      console.error("❌ Delete Patient Error:", err);
      alert("Failed to delete patient. Refreshing list...");

      // Restore list from backend
      try {
        const res = await patientsAPI.getAll();
        const refreshed = res.data.data.patients.filter(
          (p) => p.doctorId === currentUser?.id
        );
        setPatients(refreshed);
      } catch {
        console.error("❌ Failed refetch after delete error");
      }
    }
  };

  if (loading) {
    return (
      <p className="text-center p-6 text-lg">
        Loading patients, please wait...
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl text-foreground">Patient Management</h1>
          <p className="text-muted-foreground">
            Manage your patient database and records
          </p>
        </div>

        <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
              <DialogDescription>
                Enter patient information and lifestyle details
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={newPatient.name}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, name: e.target.value })
                  }
                  placeholder="Enter full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  value={newPatient.age}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, age: e.target.value })
                  }
                  placeholder="Enter age"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  value={newPatient.gender}
                  onValueChange={(value) =>
                    setNewPatient({ ...newPatient, gender: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newPatient.phone}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, phone: e.target.value })
                  }
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newPatient.email}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, email: e.target.value })
                  }
                  placeholder="patient@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={newPatient.weight}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, weight: e.target.value })
                  }
                  placeholder="Enter weight"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={newPatient.height}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, height: e.target.value })
                  }
                  placeholder="Enter height"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dosha">Dosha Type</Label>
                <Select
                  value={newPatient.dosha}
                  onValueChange={(value) =>
                    setNewPatient({ ...newPatient, dosha: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select dosha" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vata">Vata</SelectItem>
                    <SelectItem value="Pitta">Pitta</SelectItem>
                    <SelectItem value="Kapha">Kapha</SelectItem>
                    <SelectItem value="Vata-Pitta">Vata-Pitta</SelectItem>
                    <SelectItem value="Pitta-Kapha">Pitta-Kapha</SelectItem>
                    <SelectItem value="Vata-Kapha">Vata-Kapha</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={newPatient.address}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, address: e.target.value })
                  }
                  placeholder="Enter address"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sleep">Sleep Pattern</Label>
                <Input
                  id="sleep"
                  value={newPatient.lifestyle.sleep}
                  onChange={(e) =>
                    setNewPatient({
                      ...newPatient,
                      lifestyle: {
                        ...newPatient.lifestyle,
                        sleep: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g., 7-8 hours, difficulty falling asleep"
                />
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="water">Water Intake</Label>
                <Input
                  id="water"
                  value={newPatient.lifestyle.water}
                  onChange={(e) => setNewPatient({
                    ...newPatient, 
                    lifestyle: {...newPatient.lifestyle, water: e.target.value}
                  })}
                  placeholder="e.g., 2-3 liters per day"
                />
              </div> */}
              <div className="space-y-2">
                <Label htmlFor="bowel">Bowel Movement</Label>
                <Input
                  id="bowel"
                  value={newPatient.lifestyle.bowel}
                  onChange={(e) =>
                    setNewPatient({
                      ...newPatient,
                      lifestyle: {
                        ...newPatient.lifestyle,
                        bowel: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g., Regular, once daily"
                />
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="exercise">Exercise Routine</Label>
                <Input
                  id="exercise"
                  value={newPatient.lifestyle.exercise}
                  onChange={(e) => setNewPatient({
                    ...newPatient, 
                    lifestyle: {...newPatient.lifestyle, exercise: e.target.value}
                  })}
                  placeholder="e.g., 30 min walking daily"
                />
              </div> */}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsAddPatientOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddPatient}
                className="bg-primary hover:bg-primary/90"
              >
                Save Patient
              </Button>
            </div>
          </DialogContent>
        </Dialog>


        {editingPatient && (
  <Dialog open={!!editingPatient} onOpenChange={() => setEditingPatient(null)}>
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Edit Patient Details</DialogTitle>
        <DialogDescription>
          Update patient’s medical information below.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div>
          <Label>Height (cm)</Label>
          <Input
            type="number"
            value={editForm.height ?? ""}
            onChange={(e) =>
              setEditForm({ ...editForm, height: e.target.value })
            }
          />
        </div>

        <div>
          <Label>Weight (kg)</Label>
          <Input
            type="number"
            value={editForm.weight ?? ""}
            onChange={(e) =>
              setEditForm({ ...editForm, weight: e.target.value })
            }
          />
        </div>

        <div>
          <Label>Dosha Type</Label>
          <Select
            value={editForm.dosha ?? ""}
            onValueChange={(value) =>
              setEditForm({ ...editForm, dosha: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Dosha" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VATA">Vata</SelectItem>
              <SelectItem value="PITTA">Pitta</SelectItem>
              <SelectItem value="KAPHA">Kapha</SelectItem>
              <SelectItem value="TRIDOSHA">Tridosha</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Sleep Pattern</Label>
          <Input
            value={editForm.sleepPattern ?? ""}
            onChange={(e) =>
              setEditForm({ ...editForm, sleepPattern: e.target.value })
            }
          />
        </div>

        <div>
          <Label>Bowel Movement</Label>
          <Input
            value={editForm.bowelMovement ?? ""}
            onChange={(e) =>
              setEditForm({ ...editForm, bowelMovement: e.target.value })
            }
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={() => setEditingPatient(null)}>
          Cancel
        </Button>
        <Button onClick={handleEditSave}>Save</Button>
      </div>
    </DialogContent>
  </Dialog>
)}


      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search patients by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={filterDosha} onValueChange={setFilterDosha}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by Dosha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doshas</SelectItem>
                  <SelectItem value="Vata">Vata</SelectItem>
                  <SelectItem value="Pitta">Pitta</SelectItem>
                  <SelectItem value="Kapha">Kapha</SelectItem>
                  <SelectItem value="Vata-Pitta">Vata-Pitta</SelectItem>
                  <SelectItem value="Pitta-Kapha">Pitta-Kapha</SelectItem>
                  <SelectItem value="Vata-Kapha">Vata-Kapha</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient List */}
      <Card>
        <CardHeader>
          <CardTitle>Patient List ({filteredPatients.length})</CardTitle>
          <CardDescription>
            Manage your patient database and access their profiles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Dosha</TableHead>
                <TableHead>BMI</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm">{patient.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {patient.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.gender}</TableCell>
                  <TableCell>
                    <Badge className={`${doshaColors[patient.dosha]} border-0`}>
                      {patient.dosha}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-sm ${
                        patient.bmi < 18.5
                          ? "text-blue-600"
                          : patient.bmi > 25
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {patient.bmi}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3 mr-1" />
                      {patient.lastVisit}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{patient.phone}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3 mr-1" />
                        {patient.address?.split(",")[0]}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/patients/${patient.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
  variant="ghost"
  size="sm"
  onClick={() => {
    setEditingPatient(patient);
    setEditForm({
      height: patient.height || "",
      weight: patient.weight || "",
      doshaType: patient.dosha || "",
      sleepPattern: patient.sleepPattern || "",
      bowelMovement: patient.bowelMovement || "",
    });
  }}
>
  <Edit className="w-4 h-4" />
</Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePatient(patient.id)}
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
    </div>
  );
}
