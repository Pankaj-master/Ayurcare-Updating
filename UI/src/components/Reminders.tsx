import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

import {
  Clock,
  Plus,
  Edit,
  Trash2,
  Coffee,
  Sun,
  Pill,
  CheckCircle,
  Bell,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

import { Textarea } from "./ui/textarea";
import { remindersAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";

// Reminder types for icons
const reminderTypes = [
  { value: "meal", label: "Meal", icon: Coffee },
  { value: "medicine", label: "Medicine", icon: Pill },
  { value: "activity", label: "Activity", icon: Sun },
  { value: "hydration", label: "Hydration", icon: CheckCircle },
];

const frequencyOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekdays", label: "Weekdays Only" },
  { value: "weekends", label: "Weekends Only" },
  { value: "custom", label: "Custom Days" },
];

const typeColors = {
  meal: "bg-blue-100 text-blue-800",
  medicine: "bg-red-100 text-red-800",
  activity: "bg-green-100 text-green-800",
  hydration: "bg-cyan-100 text-cyan-800",
};

export function Reminders() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();

  const [reminders, setReminders] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [filterType, setFilterType] = useState("all");

  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    message: "",
    time: "",
    type: "meal",
    frequency: "daily",
    days: [],
    isActive: true,
  });

  // -------------------------------
  // Fetch reminders for logged in user
  // -------------------------------
  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchReminders = async () => {
      try {
        const res = await remindersAPI.getByUser(currentUser.id);
        setReminders(res.data.data || []);
      } catch (err) {
        console.error("Failed to load reminders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, [currentUser]);

  // -------------------------------
  // Helper functions
  // -------------------------------
  const getTypeIcon = (type) => {
    const cfg = reminderTypes.find((r) => r.value === type);
    return cfg ? cfg.icon : Clock;
  };

  const formatTime = (time) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    const d = new Date();
    d.setHours(parseInt(h), parseInt(m));
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getNextTriggerTime = (reminder) => {
    if (!reminder.isActive || !reminder.nextTrigger) return "Inactive";

    const next = new Date(reminder.nextTrigger);
    const today = new Date();
    const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const nextDay = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    if (next.toDateString() === today.toDateString()) return "Today";
    if (next.toDateString() === nextDay.toDateString()) return "Tomorrow";

    return next.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // -------------------------------
  // CRUD Operations
  // -------------------------------
  const saveReminder = async () => {
    try {
      if (editingReminder) {
        const res = await remindersAPI.update(editingReminder, formData);
        setReminders((prev) =>
          prev.map((r) => (r.id === editingReminder ? res.data.data : r))
        );
      } else {
        const payload = { ...formData, userId: currentUser.id };
        const res = await remindersAPI.create(payload);
        setReminders((prev) => [...prev, res.data.data]);
      }
      resetForm();
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const deleteReminder = async (id) => {
    try {
      await remindersAPI.delete(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const toggleReminderStatus = async (reminder) => {
    try {
      const res = await remindersAPI.update(reminder.id, {
        ...reminder,
        isActive: !reminder.isActive,
      });

      setReminders((prev) =>
        prev.map((r) => (r.id === reminder.id ? res.data.data : r))
      );
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  const editReminder = (reminder) => {
    setEditingReminder(reminder.id);
    setFormData({
      title: reminder.title,
      description: reminder.description || "",
      message: reminder.message || "",
      time: reminder.time,
      type: reminder.type,
      frequency: reminder.frequency,
      days: reminder.days || [],
      isActive: reminder.isActive,
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingReminder(null);
    setFormData({
      title: "",
      description: "",
      message: "",
      time: "",
      type: "meal",
      frequency: "daily",
      days: [],
      isActive: true,
    });
  };

  // -------------------------------
  // Filters
  // -------------------------------
  const filteredReminders = reminders.filter((r) => {
    if (filterType === "all") return true;
    if (filterType === "active") return r.isActive;
    if (filterType === "inactive") return !r.isActive;
    return r.type === filterType;
  });

  if (loading) return <p className="text-center py-10">Loading reminders...</p>;

  // -------------------------------
  // UI Rendering
  // -------------------------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl text-foreground">{t("reminders.title")}</h1>
          <p className="text-muted-foreground">{t("reminders.subtitle")}</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("reminders.addReminder")}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t("reminders.filterPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("reminders.filters.all")}</SelectItem>
            <SelectItem value="active">{t("reminders.filters.active")}</SelectItem>
            <SelectItem value="inactive">
              {t("reminders.filters.inactive")}
            </SelectItem>
            <SelectItem value="meal">{t("reminders.filters.meal")}</SelectItem>
            <SelectItem value="medicine">
              {t("reminders.filters.medicine")}
            </SelectItem>
            <SelectItem value="activity">
              {t("reminders.filters.activity")}
            </SelectItem>
            <SelectItem value="hydration">
              {t("reminders.filters.hydration")}
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Summary Stats */}
        <div className="flex items-center space-x-6 text-sm">
          <div className="text-center">
            <p className="text-muted-foreground">{t("reminders.total")}</p>
            <p className="text-xl">{reminders.length}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">{t("reminders.active")}</p>
            <p className="text-xl text-green-600">
              {reminders.filter((r) => r.isActive).length}
            </p>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground">{t("reminders.today")}</p>
            <p className="text-xl text-blue-600">
              {reminders.filter((r) => r.isActive && r.frequency === "daily")
                .length}
            </p>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingReminder ? t("reminders.editReminder") : t("reminders.addNewReminder")}
            </CardTitle>
            <CardDescription>{t("reminders.formDescription")}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">{t("reminders.form.title")}</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              {/* Time */}
              <div className="space-y-2">
                <Label htmlFor="time">{t("reminders.form.time")}</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                />
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="type">{t("reminders.form.type")}</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reminderTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {t(`reminders.types.${type.value}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <Label htmlFor="freq">{t("reminders.form.frequency")}</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(val) =>
                    setFormData({ ...formData, frequency: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencyOptions.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {t(`reminders.frequency.${freq.value}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>{t("reminders.form.description")}</Label>
              <Textarea
                value={formData.description}
                rows={2}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            {/* Active */}
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label>{t("reminders.form.active")}</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Button onClick={saveReminder} className="bg-primary">
                {editingReminder ? t("reminders.update") : t("reminders.save")}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                {t("common.cancel")}
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
            <Card
              key={reminder.id}
              className={`hover:shadow-md transition ${
                !reminder.isActive ? "opacity-60" : ""
              }`}
            >
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <TypeIcon className="w-5 h-5 text-primary" />
                    </div>

                    <div>
                      <CardTitle>{reminder.title}</CardTitle>
                      <div className="flex text-sm text-muted-foreground space-x-2">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(reminder.time)}</span>

                        <Badge className={`text-xs ${typeColors[reminder.type]}`}>
                          {t(`reminders.types.${reminder.type}`)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Switch
                    checked={reminder.isActive}
                    onCheckedChange={() => toggleReminderStatus(reminder)}
                  />
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-2">
                  {reminder.description && (
                    <p className="text-sm text-muted-foreground">
                      {reminder.description}
                    </p>
                  )}

                  <div className="flex justify-between text-sm">
                    <p>
                      <span className="text-muted-foreground">
                        {t("reminders.frequencyLabel")}{" "}
                      </span>
                      {t(`reminders.frequency.${reminder.frequency}`)}
                    </p>

                    <p>
                      <span className="text-muted-foreground">
                        {t("reminders.next")}{" "}
                      </span>
                      {getNextTriggerTime(reminder)}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => editReminder(reminder)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      {t("common.edit")}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive"
                      onClick={() => deleteReminder(reminder.id)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      {t("common.delete")}
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
            {t("reminders.noReminders")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("reminders.noRemindersSub")}
          </p>
        </div>
      )}
    </div>
  );
}
