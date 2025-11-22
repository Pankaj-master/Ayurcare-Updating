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
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  User,
  Calendar,
  MapPin,
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
  {
    id: 2,
    name: "Priya Sharma",
    age: 32,
    gender: "Female",
    dosha: "Pitta",
    lastVisit: "2024-01-14",
    phone: "+91 87654 32109",
    email: "priya.sharma@email.com",
    weight: 58,
    height: 162,
    bmi: 22.1,
    address: "Delhi, NCR",
  },
  {
    id: 3,
    name: "Amit Patel",
    age: 38,
    gender: "Male",
    dosha: "Kapha",
    lastVisit: "2024-01-12",
    phone: "+91 76543 21098",
    email: "amit.patel@email.com",
    weight: 85,
    height: 180,
    bmi: 26.2,
    address: "Ahmedabad, Gujarat",
  },
  {
    id: 4,
    name: "Sunita Devi",
    age: 28,
    gender: "Female",
    dosha: "Vata-Pitta",
    lastVisit: "2024-01-10",
    phone: "+91 65432 10987",
    email: "sunita.devi@email.com",
    weight: 52,
    height: 158,
    bmi: 20.8,
    address: "Jaipur, Rajasthan",
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
  const [patients, setPatients] = useState(mockPatients);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDosha, setFilterDosha] = useState("all");
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
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

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDosha = filterDosha === "all" || patient.dosha === filterDosha;
    return matchesSearch && matchesDosha;
  });

  const { user: currentUser } = useAuth();

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
      // Map dosha values to backend enum
      const mapDosha = (d: string) => {
        if (!d) return undefined;
        const key = d.toLowerCase();
        if (key.includes("vata") && key.includes("pitta")) return "TRIDOSHA";
        if (key.includes("vata")) return "VATA";
        if (key.includes("pitta")) return "PITTA";
        if (key.includes("kapha")) return "KAPHA";
        return "TRIDOSHA";
      };

      const payload: any = {
        // User fields (controller creates the User when these are present)
        email: newPatient.email,
        name: newPatient.name,
        phone: newPatient.phone || undefined,
        address: newPatient.address || undefined,
        age: newPatient.age ? Number(newPatient.age) : undefined,
        gender: newPatient.gender || undefined,
        doshaType: mapDosha(newPatient.dosha),
        // patient-specific fields
        doctorId: currentUser.id,
        patientCode: `P-${Date.now()}`,
        height: newPatient.height ? Number(newPatient.height) : undefined,
        weight: newPatient.weight ? Number(newPatient.weight) : undefined,
        sleepPattern: newPatient.lifestyle?.sleep || undefined,
        bowelMovement: newPatient.lifestyle?.bowel || undefined,
      };

      // Strip undefined keys
      const body = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== undefined)
      );

      console.log("Creating patient with payload:", body);

      const response = await patientsAPI.create(body);

      console.log("Patient created successfully:", response.data);

      // Transform backend response to match frontend patient structure
      const createdPatient = response.data.data;
      const user = createdPatient.user;
      const weight = createdPatient.weight;
      const height = createdPatient.height;

      // Calculate BMI if weight and height are available
      const bmi =
        weight && height
          ? parseFloat((weight / (height / 100) ** 2).toFixed(1))
          : null;

      // Map doshaType back to display format
      const mapDoshaDisplay = (doshaType: string | null | undefined) => {
        if (!doshaType) return "N/A";
        const doshaMap: { [key: string]: string } = {
          VATA: "Vata",
          PITTA: "Pitta",
          KAPHA: "Kapha",
          TRIDOSHA: "Vata-Pitta",
        };
        return doshaMap[doshaType] || doshaType;
      };

      const patientWithUser = {
        id: createdPatient.id,
        name: user?.name || newPatient.name,
        age: user?.age || newPatient.age || null,
        gender: user?.gender || newPatient.gender || "N/A",
        dosha: mapDoshaDisplay(user?.doshaType),
        lastVisit: new Date().toISOString().split("T")[0],
        phone: user?.phone || newPatient.phone || "N/A",
        email: user?.email || newPatient.email,
        weight: weight || null,
        height: height || null,
        bmi: bmi || null,
        address: user?.address || newPatient.address || "N/A",
      };

      // Add the newly created patient from backend
      setPatients([...patients, patientWithUser]);

      // Reset form
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

      setIsAddPatientOpen(false);
    } catch (err: any) {
      console.error("❌ Add Patient Error:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error?.details?.[0]?.message ||
        err?.message ||
        "Could not create patient. Please check the console for details.";
      alert(errorMessage);
    }
  };

  const handleDeletePatient = (id) => {
    setPatients(patients.filter((p) => p.id !== id));
  };

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
                      <Button variant="ghost" size="sm">
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
