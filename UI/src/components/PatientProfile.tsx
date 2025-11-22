import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { 
  ArrowLeft, 
  Edit, 
  FileText, 
  User, 
  Calendar, 
  Weight, 
  Ruler, 
  Droplets,
  Moon,
  Activity,
  Target,
  TrendingUp,
  Heart,
  Brain
} from 'lucide-react';

// Mock patient data - in a real app, this would come from an API
const mockPatientData = {
  1: {
    id: 1,
    name: "Rajesh Kumar",
    age: 45,
    gender: "Male",
    dosha: "Vata",
    phone: "+91 98765 43210",
    email: "rajesh.kumar@email.com",
    weight: 72,
    height: 175,
    bmi: 23.5,
    address: "303, Sunshine Apartments, Andheri West, Mumbai, Maharashtra 400058",
    joinDate: "2023-06-15",
    lastVisit: "2024-01-15",
    lifestyle: {
      sleep: "6-7 hours, difficulty falling asleep",
      water: "2-3 liters per day",
      bowel: "Regular, once daily",
      exercise: "30 min walking, 3 times a week"
    },
    vitals: {
      bloodPressure: "128/82",
      heartRate: "76 bpm",
      temperature: "98.6°F",
      oxygenSaturation: "98%"
    },
    history: [
      {
        date: "2024-01-15",
        type: "Follow-up",
        notes: "Weight loss progress good. Continue current diet plan.",
        weight: 72,
        complaints: "Mild acidity in the morning"
      },
      {
        date: "2024-01-01",
        type: "Consultation",
        notes: "Started new weight management plan focused on Vata balancing.",
        weight: 74,
        complaints: "Digestive issues, irregular appetite"
      },
      {
        date: "2023-12-15",
        type: "Initial Consultation",
        notes: "Vata constitution identified. Recommended dietary changes.",
        weight: 75,
        complaints: "Joint pain, anxiety, poor sleep"
      }
    ],
    dietPlans: [
      {
        id: 1,
        name: "Weight Loss - Vata Balancing",
        startDate: "2024-01-01",
        status: "Active",
        compliance: 85,
        targetWeight: 68,
        duration: "3 months"
      },
      {
        id: 2,
        name: "Digestive Health Enhancement",
        startDate: "2023-12-15",
        status: "Completed",
        compliance: 78,
        targetWeight: 72,
        duration: "2 months"
      }
    ]
  }
};

const doshaColors = {
  "Vata": "bg-blue-100 text-blue-800",
  "Pitta": "bg-red-100 text-red-800",
  "Kapha": "bg-green-100 text-green-800",
  "Vata-Pitta": "bg-purple-100 text-purple-800"
};

const doshaCharacteristics = {
  "Vata": {
    traits: ["Creative", "Energetic", "Flexible", "Quick thinking"],
    imbalances: ["Anxiety", "Dry skin", "Irregular digestion", "Sleep issues"],
    recommendations: ["Warm foods", "Regular routines", "Oil massage", "Meditation"]
  }
};

export function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  
  const patient = mockPatientData[id];

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Patient not found</p>
      </div>
    );
  }

  const bmiCategory = patient.bmi < 18.5 ? "Underweight" : 
                     patient.bmi > 25 ? "Overweight" : "Normal";
  const bmiColor = patient.bmi < 18.5 ? "text-blue-600" : 
                   patient.bmi > 25 ? "text-red-600" : "text-green-600";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/patients')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Patients
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <FileText className="w-4 h-4 mr-2" />
            Assign Diet Plan
          </Button>
        </div>
      </div>

      {/* Patient Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl">{patient.name}</h1>
                <div className="flex items-center space-x-4 mt-1 text-muted-foreground">
                  <span>{patient.age} years old</span>
                  <span>•</span>
                  <span>{patient.gender}</span>
                  <span>•</span>
                  <span>{patient.phone}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{patient.email}</p>
              </div>
            </div>
            <div className="text-right">
              <Badge className={`${doshaColors[patient.dosha]} border-0 text-sm`}>
                {patient.dosha} Constitution
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">
                Patient since {new Date(patient.joinDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-muted-foreground">
                Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient Details Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="diet-plans">Diet Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Demographics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2 text-primary" />
                  Demographics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Age</p>
                    <p className="text-lg">{patient.age} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="text-lg">{patient.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Weight</p>
                    <div className="flex items-center space-x-2">
                      <Weight className="w-4 h-4 text-muted-foreground" />
                      <span className="text-lg">{patient.weight} kg</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Height</p>
                    <div className="flex items-center space-x-2">
                      <Ruler className="w-4 h-4 text-muted-foreground" />
                      <span className="text-lg">{patient.height} cm</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">BMI</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-lg ${bmiColor}`}>{patient.bmi}</span>
                    <Badge variant="outline" className={bmiColor}>
                      {bmiCategory}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Address</p>
                  <p className="text-sm">{patient.address}</p>
                </div>
              </CardContent>
            </Card>

            {/* Dosha Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-primary" />
                  Dosha Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Badge className={`${doshaColors[patient.dosha]} border-0 text-lg px-4 py-2`}>
                    {patient.dosha} Constitution
                  </Badge>
                </div>
                
                {doshaCharacteristics[patient.dosha] && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Characteristics</p>
                      <div className="flex flex-wrap gap-1">
                        {doshaCharacteristics[patient.dosha].traits.map((trait, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Common Imbalances</p>
                      <div className="flex flex-wrap gap-1">
                        {doshaCharacteristics[patient.dosha].imbalances.map((imbalance, index) => (
                          <Badge key={index} variant="outline" className="text-xs text-red-600">
                            {imbalance}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Current Vitals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="w-5 h-5 mr-2 text-primary" />
                Current Vitals
              </CardTitle>
              <CardDescription>Latest recorded vital signs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Blood Pressure</p>
                  <p className="text-lg">{patient.vitals.bloodPressure}</p>
                  <p className="text-xs text-green-600">Normal</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Heart Rate</p>
                  <p className="text-lg">{patient.vitals.heartRate}</p>
                  <p className="text-xs text-green-600">Normal</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Temperature</p>
                  <p className="text-lg">{patient.vitals.temperature}</p>
                  <p className="text-xs text-green-600">Normal</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Oxygen Saturation</p>
                  <p className="text-lg">{patient.vitals.oxygenSaturation}</p>
                  <p className="text-xs text-green-600">Normal</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lifestyle" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(patient.lifestyle).map(([key, value]) => {
              const icons = {
                sleep: Moon,
                water: Droplets,
                bowel: Target,
                exercise: Activity
              };
              const Icon = icons[key];
              
              return (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle className="flex items-center capitalize">
                      <Icon className="w-5 h-5 mr-2 text-primary" />
                      {key === 'bowel' ? 'Bowel Movement' : key}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{value}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary" />
                Consultation History
              </CardTitle>
              <CardDescription>
                Track patient progress and visit records
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {patient.history.map((visit, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant={visit.type === 'Initial Consultation' ? 'default' : 'secondary'}>
                        {visit.type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(visit.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Weight className="w-4 h-4" />
                      <span>{visit.weight} kg</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Chief Complaints</p>
                    <p className="text-sm">{visit.complaints}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm">{visit.notes}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diet-plans" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary" />
                Diet Plans
              </CardTitle>
              <CardDescription>
                Current and previous diet plans for this patient
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {patient.dietPlans.map((plan) => (
                <div key={plan.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Started: {new Date(plan.startDate).toLocaleDateString()} • Duration: {plan.duration}
                      </p>
                    </div>
                    <Badge variant={plan.status === 'Active' ? 'default' : 'secondary'}>
                      {plan.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Compliance Rate</p>
                      <div className="flex items-center space-x-2">
                        <Progress value={plan.compliance} className="flex-1" />
                        <span className="text-sm">{plan.compliance}%</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Target Weight</p>
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{plan.targetWeight} kg</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      View Plan
                    </Button>
                    {plan.status === 'Active' && (
                      <Button variant="outline" size="sm">
                        Edit Plan
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}