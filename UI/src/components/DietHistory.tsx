import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  History, 
  Calendar, 
  TrendingUp, 
  Target, 
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Download
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const mockDietHistory = [
  {
    id: 1,
    name: "Weight Loss - Vata Balancing",
    startDate: "2024-01-15",
    endDate: "2024-02-14",
    duration: 30,
    status: "completed",
    progress: 100,
    goal: "Lose 8kg while balancing Vata dosha",
    results: {
      weightLoss: "6.2kg",
      energyLevel: "Improved",
      digestiveHealth: "Much Better",
      overallSatisfaction: 4.5
    },
    adherence: 85,
    totalCalories: 54000,
    avgDailyCalories: 1800,
    doctorNotes: "Excellent progress, patient showed great discipline"
  },
  {
    id: 2,
    name: "Digestive Health Focus",
    startDate: "2023-11-20",
    endDate: "2023-12-20",
    duration: 30,
    status: "completed",
    progress: 100,
    goal: "Improve digestive health and reduce acidity",
    results: {
      weightLoss: "2.1kg",
      energyLevel: "Stable",
      digestiveHealth: "Significantly Improved",
      overallSatisfaction: 4.8
    },
    adherence: 92,
    totalCalories: 48000,
    avgDailyCalories: 1600,
    doctorNotes: "Amazing improvement in digestive symptoms"
  },
  {
    id: 3,
    name: "Energy Boost Protocol",
    startDate: "2023-09-01",
    endDate: "2023-09-21",
    duration: 21,
    status: "completed",
    progress: 100,
    goal: "Increase energy levels and mental clarity",
    results: {
      weightLoss: "1.5kg",
      energyLevel: "Greatly Improved",
      digestiveHealth: "Good",
      overallSatisfaction: 4.3
    },
    adherence: 78,
    totalCalories: 37800,
    avgDailyCalories: 1800,
    doctorNotes: "Good results, recommend continuing similar approach"
  },
  {
    id: 4,
    name: "Current: Maintenance Plan",
    startDate: "2024-02-15",
    endDate: "2024-03-16",
    duration: 30,
    status: "active",
    progress: 40,
    goal: "Maintain current weight and energy levels",
    results: null,
    adherence: 88,
    totalCalories: 21600,
    avgDailyCalories: 1800,
    doctorNotes: "On track, maintaining good habits"
  }
];

const statusColors = {
  "completed": "bg-green-100 text-green-800",
  "active": "bg-blue-100 text-blue-800",
  "paused": "bg-yellow-100 text-yellow-800",
  "discontinued": "bg-red-100 text-red-800"
};

const statusIcons = {
  "completed": CheckCircle,
  "active": Clock,
  "paused": AlertCircle,
  "discontinued": AlertCircle
};

export function DietHistory() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const filteredHistory = mockDietHistory.filter(plan => {
    if (filterStatus === 'all') return true;
    return plan.status === filterStatus;
  }).sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.startDate) - new Date(a.startDate);
    } else if (sortBy === 'duration') {
      return b.duration - a.duration;
    } else if (sortBy === 'adherence') {
      return b.adherence - a.adherence;
    }
    return 0;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getAdherenceColor = (adherence) => {
    if (adherence >= 90) return 'text-green-600';
    if (adherence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSatisfactionStars = (rating) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  const downloadReport = (planId) => {
    console.log(`Downloading report for plan ${planId}`);
  };

  const viewDetails = (planId) => {
    console.log(`Viewing details for plan ${planId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl text-foreground">Diet History</h1>
          <p className="text-muted-foreground">Track your diet plan journey and progress over time</p>
        </div>
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
          <History className="w-6 h-6 text-primary" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="discontinued">Discontinued</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="duration">Duration</SelectItem>
              <SelectItem value="adherence">Adherence</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Stats */}
        <div className="flex items-center space-x-6 text-sm">
          <div className="text-center">
            <p className="text-muted-foreground">Total Plans</p>
            <p className="text-xl">{mockDietHistory.length}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Completed</p>
            <p className="text-xl text-green-600">
              {mockDietHistory.filter(p => p.status === 'completed').length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Avg Adherence</p>
            <p className="text-xl">
              {Math.round(mockDietHistory.reduce((sum, p) => sum + p.adherence, 0) / mockDietHistory.length)}%
            </p>
          </div>
        </div>
      </div>

      {/* Diet Plans History */}
      <div className="space-y-4">
        {filteredHistory.map((plan) => {
          const StatusIcon = statusIcons[plan.status];
          
          return (
            <Card key={plan.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <StatusIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <CardDescription className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                        </span>
                        <span>({plan.duration} days)</span>
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={`${statusColors[plan.status]}`}>
                    {plan.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Plan Info */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-2">Goal</h4>
                      <p className="text-sm">{plan.goal}</p>
                    </div>
                    
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{plan.progress}%</span>
                      </div>
                      <Progress value={plan.progress} className="h-2" />
                    </div>

                    {/* Adherence */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Adherence</span>
                        <span className={getAdherenceColor(plan.adherence)}>
                          {plan.adherence}%
                        </span>
                      </div>
                      <Progress value={plan.adherence} className="h-2" />
                    </div>
                  </div>

                  {/* Nutrition Stats */}
                  <div className="space-y-4">
                    <h4 className="text-sm text-muted-foreground">Nutrition Summary</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Total Calories</span>
                        <span>{plan.totalCalories.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Avg Daily Calories</span>
                        <span>{plan.avgDailyCalories}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Days Completed</span>
                        <span>{Math.round(plan.duration * (plan.progress / 100))}</span>
                      </div>
                    </div>
                  </div>

                  {/* Results */}
                  <div className="space-y-4">
                    {plan.results ? (
                      <>
                        <h4 className="text-sm text-muted-foreground">Results Achieved</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Weight Change</span>
                            <span className="text-green-600">-{plan.results.weightLoss}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Energy Level</span>
                            <span>{plan.results.energyLevel}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Digestive Health</span>
                            <span>{plan.results.digestiveHealth}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Satisfaction</span>
                            <span className="text-yellow-500">
                              {getSatisfactionStars(plan.results.overallSatisfaction)}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Plan in progress</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Doctor Notes */}
                {plan.doctorNotes && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <h5 className="text-sm text-muted-foreground mb-1">Doctor's Notes</h5>
                    <p className="text-sm">{plan.doctorNotes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => viewDetails(plan.id)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View Details
                    </Button>
                    {plan.status === 'completed' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => downloadReport(plan.id)}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download Report
                      </Button>
                    )}
                  </div>
                  
                  {plan.status === 'completed' && (
                    <Button variant="default" size="sm">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Start Similar Plan
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredHistory.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <History className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg text-muted-foreground mb-2">No diet plans found</h3>
          <p className="text-sm text-muted-foreground">
            Adjust your filters or start your first diet plan
          </p>
        </div>
      )}
    </div>
  );
}