import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Users, 
  FileText, 
  Calendar, 
  Plus, 
  TrendingUp, 
  Activity,
  Clock,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function DoctorDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // State
  const [stats, setStats] = useState({
    totalPatients: 0,
    dietPlansCreated: 0,
    consultationsToday: 0,
    successRate: 'N/A'
  });
  const [todayPatients, setTodayPatients] = useState([]);
  const [recentPlans, setRecentPlans] = useState([]);
  // Pending tasks remain static for now
  const pendingTasks = [
    {
      id: 1,
      task: "Review diet plan for Rajesh Kumar",
      priority: "high",
      dueTime: "In 2 hours"
    },
    {
      id: 2,
      task: "Follow-up call with Priya Sharma",
      priority: "medium",
      dueTime: "Tomorrow"
    },
    {
      id: 3,
      task: "Update food database with seasonal items",
      priority: "low",
      dueTime: "This week"
    }
  ];

  useEffect(() => {
    // Fetch patients
    fetch('/api/patients', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setStats(prev => ({ ...prev, totalPatients: data.length }));
      });

    // Fetch diet plans
    fetch('/api/diet-plans', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setStats(prev => ({ ...prev, dietPlansCreated: data.length }));
        // Calculate success rate (average compliance of active plans)
        const activePlans = data.filter((plan: any) => plan.status === 'active');
        if (activePlans.length > 0) {
          const avgCompliance = Math.round(
            activePlans.reduce((sum: number, plan: any) => sum + (plan.compliance || 0), 0) / activePlans.length
          );
          setStats(prev => ({ ...prev, successRate: `${avgCompliance}%` }));
        }
        // Recent plans
        setRecentPlans(data.slice(0, 3));
      });

    // Fetch appointments
    fetch('/api/appointments', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        // Filter for today
        const today = new Date().toISOString().slice(0, 10);
        const todaysAppointments = data.filter((appt: any) => appt.date?.slice(0, 10) === today);
        setStats(prev => ({ ...prev, consultationsToday: todaysAppointments.length }));
        setTodayPatients(todaysAppointments.map((appt: any) => ({
          id: appt.id,
          name: appt.patientName,
          time: appt.time,
          dosha: appt.dosha,
          status: appt.status,
          type: appt.type
        })));
      });
  }, []);

  const doshaColors = {
    "Vata": "bg-blue-100 text-blue-800",
    "Pitta": "bg-red-100 text-red-800",
    "Kapha": "bg-green-100 text-green-800",
    "Vata-Pitta": "bg-purple-100 text-purple-800",
    "Pitta-Kapha": "bg-orange-100 text-orange-800",
    "Vata-Kapha": "bg-teal-100 text-teal-800"
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl text-foreground">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground">{t('dashboard.welcomeMessage')}</p>
        </div>
        <Button onClick={() => navigate('/patients')} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          {t('dashboard.addPatient')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Patients</p>
                <p className="text-2xl">{stats.totalPatients}</p>
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
                <p className="text-sm text-muted-foreground">Diet Plans Created</p>
                <p className="text-2xl">{stats.dietPlansCreated}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Consultations Today</p>
                <p className="text-2xl">{stats.consultationsToday}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl">{stats.successRate}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Patients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary" />
              Today's Patients
            </CardTitle>
            <CardDescription>Scheduled consultations for today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayPatients.map((patient: any) => (
              <div key={patient.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm">{patient.name}</p>
                    <Badge className={`text-xs ${doshaColors[patient.dosha]}`}>
                      {patient.dosha}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {patient.time}
                    </span>
                    <span>{patient.type}</span>
                  </div>
                </div>
                <Badge variant={patient.status === 'confirmed' ? 'default' : 'secondary'}>
                  {patient.status}
                </Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View All Appointments
            </Button>
          </CardContent>
        </Card>

        {/* Recent Diet Plans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-primary" />
              Recent Diet Plans
            </CardTitle>
            <CardDescription>Latest diet plans created</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentPlans.map((plan: any) => (
              <div key={plan.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="space-y-1">
                  <p className="text-sm">{plan.patientName}</p>
                  <p className="text-xs text-muted-foreground">{plan.title}</p>
                  <p className="text-xs text-muted-foreground">{plan.createdAt}</p>
                </div>
                <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                  {plan.status}
                </Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full" onClick={() => navigate('/diet-chart')}>
              View All Plans
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2 text-primary" />
              Pending Tasks
            </CardTitle>
            <CardDescription>Tasks requiring your attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="space-y-1">
                  <p className="text-sm">{task.task}</p>
                  <p className="text-xs text-muted-foreground">{task.dueTime}</p>
                </div>
                <Badge variant={
                  task.priority === 'high' ? 'destructive' : 
                  task.priority === 'medium' ? 'default' : 'secondary'
                }>
                  {task.priority}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/patients')}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Patient
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/diet-chart')}>
              <FileText className="w-4 h-4 mr-2" />
              Create Diet Plan
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/auto-generate')}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Auto Generate Diet
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/food-database')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Food Item
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}