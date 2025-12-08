import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Bell, 
  Coffee,
  Sun,
  Moon,
  Pill,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { useTranslation } from "react-i18next";



const mockReminders = [
  {
    id: 1,
    title: 'Morning Herbal Tea',
    description: 'Ginger-cardamom tea to kindle digestive fire',
    time: '07:00',
    type: 'meal',
    frequency: 'daily',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    isActive: true,
    lastTriggered: '2024-01-22T07:00:00Z',
    nextTrigger: '2024-01-23T07:00:00Z'
  },
  {
    id: 2,
    title: 'Breakfast Time',
    description: 'Warm oats with almonds and honey',
    time: '08:00',
    type: 'meal',
    frequency: 'daily',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    isActive: true,
    lastTriggered: '2024-01-22T08:00:00Z',
    nextTrigger: '2024-01-23T08:00:00Z'
  },
  {
    id: 3,
    title: 'Triphala Supplement',
    description: 'Take 1 tablet before bed for digestive health',
    time: '22:00',
    type: 'medicine',
    frequency: 'daily',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    isActive: true,
    lastTriggered: '2024-01-21T22:00:00Z',
    nextTrigger: '2024-01-22T22:00:00Z'
  },
  {
    id: 4,
    title: 'Lunch Reminder',
    description: 'Quinoa bowl with seasonal vegetables',
    time: '12:30',
    type: 'meal',
    frequency: 'weekdays',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    isActive: true,
    lastTriggered: '2024-01-22T12:30:00Z',
    nextTrigger: '2024-01-23T12:30:00Z'
  },
  {
    id: 5,
    title: 'Evening Walk Reminder',
    description: 'Light walk to aid digestion after dinner',
    time: '19:30',
    type: 'activity',
    frequency: 'daily',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    isActive: false,
    lastTriggered: '2024-01-20T19:30:00Z',
    nextTrigger: null
  },
  {
    id: 6,
    title: 'Water Intake Check',
    description: 'Reminder to drink water throughout the day',
    time: '10:00',
    type: 'hydration',
    frequency: 'daily',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    isActive: true,
    lastTriggered: '2024-01-22T10:00:00Z',
    nextTrigger: '2024-01-23T10:00:00Z'
  }
];

const reminderTypes = [
  { value: 'meal', label: 'Meal', icon: Coffee },
  { value: 'medicine', label: 'Medicine', icon: Pill },
  { value: 'activity', label: 'Activity', icon: Sun },
  { value: 'hydration', label: 'Hydration', icon: CheckCircle }
];

const frequencyOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays Only' },
  { value: 'weekends', label: 'Weekends Only' },
  { value: 'custom', label: 'Custom Days' }
];

const typeColors = {
  'meal': 'bg-blue-100 text-blue-800',
  'medicine': 'bg-red-100 text-red-800',
  'activity': 'bg-green-100 text-green-800',
  'hydration': 'bg-cyan-100 text-cyan-800'
};

export function Reminders() {

  const { t } = useTranslation();

  const [reminders, setReminders] = useState(mockReminders);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [filterType, setFilterType] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    time: '',
    type: 'meal',
    frequency: 'daily',
    days: [],
    isActive: true
  });

  const filteredReminders = reminders.filter(reminder => {
    if (filterType === 'all') return true;
    if (filterType === 'active') return reminder.isActive;
    if (filterType === 'inactive') return !reminder.isActive;
    return reminder.type === filterType;
  });

  const toggleReminder = (id) => {
    setReminders(reminders.map(reminder => 
      reminder.id === id 
        ? { ...reminder, isActive: !reminder.isActive }
        : reminder
    ));
  };

  const deleteReminder = (id) => {
    setReminders(reminders.filter(reminder => reminder.id !== id));
  };

  const editReminder = (reminder) => {
    setEditingReminder(reminder.id);
    setFormData({
      title: reminder.title,
      description: reminder.description,
      time: reminder.time,
      type: reminder.type,
      frequency: reminder.frequency,
      days: reminder.days,
      isActive: reminder.isActive
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      time: '',
      type: 'meal',
      frequency: 'daily',
      days: [],
      isActive: true
    });
    setEditingReminder(null);
    setShowAddForm(false);
  };

  const saveReminder = () => {
    if (editingReminder) {
      setReminders(reminders.map(reminder => 
        reminder.id === editingReminder 
          ? { ...reminder, ...formData }
          : reminder
      ));
    } else {
      const newReminder = {
        id: Math.max(...reminders.map(r => r.id)) + 1,
        ...formData,
        lastTriggered: null,
        nextTrigger: new Date().toISOString()
      };
      setReminders([...reminders, newReminder]);
    }
    resetForm();
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getTypeIcon = (type) => {
    const typeConfig = reminderTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.icon : Clock;
  };

  const getNextTriggerTime = (reminder) => {
    if (!reminder.isActive || !reminder.nextTrigger) return 'Inactive';
    
    const next = new Date(reminder.nextTrigger);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const triggerDate = new Date(next.getFullYear(), next.getMonth(), next.getDate());
    
    if (triggerDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (triggerDate.getTime() === today.getTime() + (24 * 60 * 60 * 1000)) {
      return 'Tomorrow';
    } else {
      return triggerDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

return (
  <div className="space-y-6">

    {/* Header */}
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl text-foreground">Reminders</h1>
        <p className="text-muted-foreground">Create and manage reminders for meals, meds and activities</p>
      </div>
      <Button 
        onClick={() => setShowAddForm(true)}
        className="bg-primary hover:bg-primary/90"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Reminder
      </Button>
    </div>

    {/* Filters */}
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div className="flex gap-4">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter reminders" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="meal">Meal</SelectItem>
            <SelectItem value="medicine">Medicine</SelectItem>
            <SelectItem value="activity">Activity</SelectItem>
            <SelectItem value="hydration">Hydration</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="flex items-center space-x-6 text-sm">
        <div className="text-center">
          <p className="text-muted-foreground">Total</p>
          <p className="text-xl">{reminders.length}</p>
        </div>
        <div className="text-center">
          <p className="text-muted-foreground">Active</p>
          <p className="text-xl text-green-600">
            {reminders.filter(r => r.isActive).length}
          </p>
        </div>
        <div className="text-center">
          <p className="text-muted-foreground">Today</p>
          <p className="text-xl text-blue-600">
            {reminders.filter(r => r.isActive && r.frequency === 'daily').length}
          </p>
        </div>
      </div>
    </div>

    {/* Add/Edit Form */}
    {showAddForm && (
      <Card>
        <CardHeader>
          <CardTitle>
            {editingReminder ? "Edit Reminder" : "Add New Reminder"}
          </CardTitle>
          <CardDescription>
            Configure reminder time, type and frequency
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Reminder title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {reminderTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={formData.frequency} onValueChange={(value) => setFormData({...formData, frequency: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional details"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
            />
            <Label htmlFor="active">Active</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Button onClick={saveReminder} className="bg-primary hover:bg-primary/90">
              {editingReminder ? "Update" : "Save"}
            </Button>
            <Button onClick={resetForm} variant="outline">
              Cancel
            </Button>
          </div>

        </CardContent>
      </Card>
    )}

    {/* Reminders List */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {filteredReminders.map((reminder) => {
        const TypeIcon = getTypeIcon(reminder.type);

        return (
          <Card key={reminder.id} className={`hover:shadow-md transition-shadow ${!reminder.isActive ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <TypeIcon className="w-5 h-5 text-primary" />
                  </div>

                  <div>
                    <CardTitle className="text-lg">{reminder.title}</CardTitle>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(reminder.time)}</span>
                      <Badge className={`text-xs ${typeColors[reminder.type]}`}>
                        {reminder.type}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Switch
                  checked={reminder.isActive}
                  onCheckedChange={() => toggleReminder(reminder.id)}
                />
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {reminder.description && (
                  <p className="text-sm text-muted-foreground">{reminder.description}</p>
                )}

                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-muted-foreground">Frequency </span>
                    <span className="capitalize">{reminder.frequency}</span>
                  </div>

                  <div>
                    <span className="text-muted-foreground">Next </span>
                    <span>{getNextTriggerTime(reminder)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => editReminder(reminder)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deleteReminder(reminder.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>

              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>

    {filteredReminders.length === 0 && (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Bell className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg text-muted-foreground mb-2">
          No reminders
        </h3>
        <p className="text-sm text-muted-foreground">
          You have no reminders set.
        </p>
      </div>
    )}

  </div>
);
}