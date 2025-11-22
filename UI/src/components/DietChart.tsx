import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  PieChart, 
  Plus, 
  Edit, 
  Copy, 
  Trash2, 
  Calendar,
  User,
  Target,
  Clock,
  Filter,
  Search
} from 'lucide-react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const mockDietCharts = [
  {
    id: 1,
    name: "Weight Loss - Vata Balancing",
    patient: "Rajesh Kumar",
    duration: "30 days",
    startDate: "2024-01-15",
    status: "active",
    progress: 65,
    goal: "Lose 8kg while balancing Vata dosha",
    meals: {
      breakfast: ["Oats with almonds", "Herbal tea"],
      lunch: ["Quinoa with vegetables", "Cucumber raita"],
      dinner: ["Moong dal soup", "Steamed rice"],
      snacks: ["Mixed nuts"]
    },
    calories: 1800,
    dosha: "Vata",
    created: "2024-01-15",
    lastModified: "2024-01-20"
  },
  {
    id: 2,
    name: "Digestive Health - Pitta Cooling",
    patient: "Priya Sharma",
    duration: "21 days",
    startDate: "2024-01-18",
    status: "draft",
    progress: 0,
    goal: "Reduce acidity and improve digestion",
    meals: {
      breakfast: ["Coconut water", "Cooling smoothie"],
      lunch: ["Bitter greens salad", "Coconut rice"],
      dinner: ["Light vegetable soup", "Khichdi"],
      snacks: ["Cucumber slices"]
    },
    calories: 1600,
    dosha: "Pitta",
    created: "2024-01-18",
    lastModified: "2024-01-18"
  },
  {
    id: 3,
    name: "Energy Boost - Kapha Stimulating",
    patient: "Amit Patel",
    duration: "45 days",
    startDate: "2024-01-10",
    status: "active",
    progress: 80,
    goal: "Increase metabolism and energy levels",
    meals: {
      breakfast: ["Spiced tea", "Light breakfast"],
      lunch: ["Spicy lentils", "Brown rice"],
      dinner: ["Vegetable curry", "Millet roti"],
      snacks: ["Herbal tea", "Roasted seeds"]
    },
    calories: 2000,
    dosha: "Kapha",
    created: "2024-01-10",
    lastModified: "2024-01-22"
  },
  {
    id: 4,
    name: "Pregnancy Nutrition - Vata-Pitta",
    patient: "Sunita Devi",
    duration: "90 days",
    startDate: "2024-01-05",
    status: "active",
    progress: 45,
    goal: "Nourish mother and baby safely",
    meals: {
      breakfast: ["Warm milk with dates", "Whole grain porridge"],
      lunch: ["Dal with vegetables", "Ghee rice"],
      dinner: ["Nutritious soup", "Soft roti"],
      snacks: ["Dry fruits", "Herbal drinks"]
    },
    calories: 2200,
    dosha: "Vata-Pitta",
    created: "2024-01-05",
    lastModified: "2024-01-21"
  },
  {
    id: 5,
    name: "Detox Protocol - Tri-Dosha",
    patient: "Meera Singh",
    duration: "14 days",
    startDate: "2024-01-20",
    status: "completed",
    progress: 100,
    goal: "Gentle cleansing and detoxification",
    meals: {
      breakfast: ["Warm water with lemon", "Light fruits"],
      lunch: ["Khichdi", "Steamed vegetables"],
      dinner: ["Vegetable broth", "Herbal tea"],
      snacks: ["Fresh juices"]
    },
    calories: 1200,
    dosha: "Tri-Dosha",
    created: "2024-01-20",
    lastModified: "2024-02-03"
  }
];

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "completed", label: "Completed" },
  { value: "paused", label: "Paused" }
];

const doshaColors = {
  "Vata": "bg-blue-100 text-blue-800",
  "Pitta": "bg-red-100 text-red-800",
  "Kapha": "bg-green-100 text-green-800",
  "Vata-Pitta": "bg-purple-100 text-purple-800",
  "Pitta-Kapha": "bg-orange-100 text-orange-800",
  "Vata-Kapha": "bg-teal-100 text-teal-800",
  "Tri-Dosha": "bg-gray-100 text-gray-800"
};

const statusColors = {
  "active": "bg-green-100 text-green-800",
  "draft": "bg-yellow-100 text-yellow-800",
  "completed": "bg-blue-100 text-blue-800",
  "paused": "bg-gray-100 text-gray-800"
};

export function DietChart() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredCharts = mockDietCharts.filter(chart => {
    const matchesSearch = chart.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chart.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chart.goal.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || chart.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const duplicateChart = (chartId) => {
    console.log(`Duplicating chart ${chartId}`);
  };

  const deleteChart = (chartId) => {
    console.log(`Deleting chart ${chartId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl text-foreground">Diet Chart</h1>
          <p className="text-muted-foreground">Create and manage comprehensive diet plans for your patients</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Create Diet Chart
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-4 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search diet charts..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Diet Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCharts.map((chart) => (
          <Card key={chart.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <PieChart className="w-6 h-6 text-primary" />
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={`text-xs ${statusColors[chart.status]}`}>
                    {chart.status}
                  </Badge>
                  <Badge className={`text-xs ${doshaColors[chart.dosha]}`}>
                    {chart.dosha}
                  </Badge>
                </div>
              </div>
              <CardTitle className="text-lg">{chart.name}</CardTitle>
              <CardDescription>{chart.goal}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Patient and Duration Info */}
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-muted-foreground">
                    <User className="w-3 h-3 mr-1" />
                    {chart.patient}
                  </span>
                  <span className="flex items-center text-muted-foreground">
                    <Calendar className="w-3 h-3 mr-1" />
                    {chart.duration}
                  </span>
                  <span className="flex items-center text-muted-foreground">
                    <Target className="w-3 h-3 mr-1" />
                    {chart.calories} cal
                  </span>
                </div>

                {/* Progress Bar (only for active charts) */}
                {chart.status === 'active' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{chart.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${chart.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Meal Overview */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Meal Plan Overview:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Breakfast:</span>
                      <p className="truncate">{chart.meals.breakfast[0]}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Lunch:</span>
                      <p className="truncate">{chart.meals.lunch[0]}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Dinner:</span>
                      <p className="truncate">{chart.meals.dinner[0]}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Snacks:</span>
                      <p className="truncate">{chart.meals.snacks[0]}</p>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Created: {formatDate(chart.created)}</span>
                  <span>Modified: {formatDate(chart.lastModified)}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => duplicateChart(chart.id)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deleteChart(chart.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCharts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <PieChart className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg text-muted-foreground mb-2">No diet charts found</h3>
          <p className="text-sm text-muted-foreground">
            Create your first diet chart or adjust your search filters
          </p>
        </div>
      )}
    </div>
  );
}