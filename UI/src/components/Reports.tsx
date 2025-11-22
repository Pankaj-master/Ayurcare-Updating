import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  Activity,
  Download,
  Calendar,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react';

// Mock data for charts
const weightProgressData = [
  { month: 'Jan', avgWeightLoss: 2.3, patients: 25 },
  { month: 'Feb', avgWeightLoss: 3.1, patients: 30 },
  { month: 'Mar', avgWeightLoss: 2.8, patients: 28 },
  { month: 'Apr', avgWeightLoss: 3.5, patients: 35 },
  { month: 'May', avgWeightLoss: 4.2, patients: 40 },
  { month: 'Jun', avgWeightLoss: 3.9, patients: 38 }
];

const complianceData = [
  { week: 'Week 1', compliance: 85 },
  { week: 'Week 2', compliance: 78 },
  { week: 'Week 3', compliance: 82 },
  { week: 'Week 4', compliance: 89 },
  { week: 'Week 5', compliance: 76 },
  { week: 'Week 6', compliance: 91 }
];

const doshaDistribution = [
  { name: 'Vata', value: 35, color: '#3B82F6' },
  { name: 'Pitta', value: 30, color: '#EF4444' },
  { name: 'Kapha', value: 20, color: '#10B981' },
  { name: 'Mixed', value: 15, color: '#8B5CF6' }
];

const bmiCategoryData = [
  { category: 'Underweight', count: 12, percentage: 15 },
  { category: 'Normal', count: 45, percentage: 56 },
  { category: 'Overweight', count: 18, percentage: 22 },
  { category: 'Obese', count: 6, percentage: 7 }
];

const monthlyStats = {
  totalPatients: 127,
  activePatients: 89,
  completedPlans: 34,
  avgCompliance: 83,
  avgWeightLoss: 3.2,
  newPatients: 12
};

const topPerformingPlans = [
  { name: "Weight Loss - Vata Balancing", patients: 25, avgCompliance: 87, avgWeightLoss: 4.2 },
  { name: "Digestive Health - Pitta Cooling", patients: 18, avgCompliance: 82, avgWeightLoss: 2.8 },
  { name: "Energy Boost - Kapha Stimulating", patients: 15, avgCompliance: 79, avgWeightLoss: 3.5 },
  { name: "Immunity Boost - Tri-Dosha", patients: 12, avgCompliance: 85, avgWeightLoss: 2.9 }
];

export function Reports() {
  const [timeRange, setTimeRange] = useState('6months');
  const [reportType, setReportType] = useState('overview');

  const handleExportReport = (type) => {
    // Mock export functionality
    console.log(`Exporting ${type} report...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">Track patient progress and practice performance</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Patients</p>
                <p className="text-2xl">{monthlyStats.totalPatients}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                  <span className="text-sm text-green-600">+{monthlyStats.newPatients} this month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Patients</p>
                <p className="text-2xl">{monthlyStats.activePatients}</p>
                <div className="flex items-center mt-1">
                  <Activity className="w-3 h-3 mr-1 text-blue-600" />
                  <span className="text-sm text-blue-600">
                    {Math.round((monthlyStats.activePatients / monthlyStats.totalPatients) * 100)}% of total
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Compliance</p>
                <p className="text-2xl">{monthlyStats.avgCompliance}%</p>
                <div className="flex items-center mt-1">
                  <Target className="w-3 h-3 mr-1 text-accent" />
                  <span className="text-sm text-accent">Good adherence</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Weight Loss</p>
                <p className="text-2xl">{monthlyStats.avgWeightLoss} kg</p>
                <div className="flex items-center mt-1">
                  <TrendingDown className="w-3 h-3 mr-1 text-green-600" />
                  <span className="text-sm text-green-600">Per month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-primary" />
              Weight Loss Progress
            </CardTitle>
            <CardDescription>Average weight loss per month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weightProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgWeightLoss" fill="#4CAF50" name="Avg Weight Loss (kg)" />
                <Bar dataKey="patients" fill="#FF9800" name="Number of Patients" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Compliance Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LineChartIcon className="w-5 h-5 mr-2 text-primary" />
              Compliance Trends
            </CardTitle>
            <CardDescription>Patient adherence over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={complianceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="compliance" 
                  stroke="#4CAF50" 
                  strokeWidth={3}
                  name="Compliance (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dosha Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChartIcon className="w-5 h-5 mr-2 text-primary" />
              Dosha Distribution
            </CardTitle>
            <CardDescription>Patient constitution breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={doshaDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {doshaDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="space-y-2">
                {doshaDistribution.map((dosha, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: dosha.color }}
                      />
                      <span className="text-sm">{dosha.name}</span>
                    </div>
                    <div className="text-sm">
                      <span>{dosha.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BMI Categories */}
        <Card>
          <CardHeader>
            <CardTitle>BMI Category Distribution</CardTitle>
            <CardDescription>Patient weight status breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {bmiCategoryData.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">{category.category}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{category.count} patients</span>
                    <span className="text-sm">{category.percentage}%</span>
                  </div>
                </div>
                <Progress value={category.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Diet Plans</CardTitle>
          <CardDescription>Diet plans with highest success rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformingPlans.map((plan, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg">{plan.name}</h3>
                  <Badge variant="default">#{index + 1}</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Patients</p>
                    <p className="text-2xl text-primary">{plan.patients}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Avg Compliance</p>
                    <div className="flex items-center justify-center space-x-2">
                      <Progress value={plan.avgCompliance} className="w-16" />
                      <span className="text-sm">{plan.avgCompliance}%</span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Avg Weight Loss</p>
                    <p className="text-2xl text-green-600">{plan.avgWeightLoss} kg</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Export Reports</CardTitle>
          <CardDescription>Download detailed reports for your records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="flex flex-col items-center p-6 h-auto"
              onClick={() => handleExportReport('patient-progress')}
            >
              <TrendingUp className="w-8 h-8 mb-2 text-primary" />
              <span>Patient Progress Report</span>
              <span className="text-xs text-muted-foreground">Weight loss and compliance data</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex flex-col items-center p-6 h-auto"
              onClick={() => handleExportReport('diet-plan-analysis')}
            >
              <BarChart3 className="w-8 h-8 mb-2 text-primary" />
              <span>Diet Plan Analysis</span>
              <span className="text-xs text-muted-foreground">Plan effectiveness and outcomes</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex flex-col items-center p-6 h-auto"
              onClick={() => handleExportReport('practice-summary')}
            >
              <Users className="w-8 h-8 mb-2 text-primary" />
              <span>Practice Summary</span>
              <span className="text-xs text-muted-foreground">Overall practice statistics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}