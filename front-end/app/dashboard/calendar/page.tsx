"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconAlertTriangle,
  IconCircleCheck,
  IconPlayerPlay,
  IconUser,
  IconRefresh,
  IconFilter,
  IconX,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface CalendarEvent {
  id: number;
  title: string;
  description: string;
  equipment_name: string;
  type: "preventive" | "corrective";
  priority: "low" | "medium" | "high" | "critical";
  status: "new" | "assigned" | "in_progress" | "completed" | "cancelled";
  technician_name: string;
  scheduled_date: string;
  estimated_duration: number;
}

interface Team {
  id: number;
  name: string;
}

const API_BASE_URL = "http://localhost:3001/api";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  "Content-Type": "application/json",
});

const statusColors: Record<string, string> = {
  new: "bg-blue-500",
  assigned: "bg-purple-500",
  in_progress: "bg-yellow-500",
  completed: "bg-green-500",
  cancelled: "bg-gray-400",
};

const priorityColors: Record<string, string> = {
  low: "border-l-slate-400",
  medium: "border-l-blue-400",
  high: "border-l-orange-400",
  critical: "border-l-red-500",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [teamFilter, setTeamFilter] = useState<string>("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Dialog states
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Get calendar data
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Fetch teams for filter
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/teams`, {
          headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (data.success) {
          setTeams(data.data || []);
        }
      } catch {
        console.error("Failed to fetch teams");
      }
    };
    fetchTeams();
  }, []);

  // Fetch calendar events
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const startDate = new Date(year, month, 1).toISOString().split("T")[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0];

      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        ...(statusFilter && statusFilter !== "all" && { status: statusFilter }),
        ...(teamFilter && teamFilter !== "all" && { team_id: teamFilter }),
      });

      const response = await fetch(`${API_BASE_URL}/requests/calendar?${params}`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        setEvents(data.data || []);
      } else {
        toast.error(data.message || "Failed to fetch calendar events");
      }
    } catch {
      toast.error("Failed to fetch calendar events");
    } finally {
      setLoading(false);
    }
  }, [year, month, statusFilter, teamFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Navigation handlers
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get events for a specific day
  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((event) => {
      const eventDate = event.scheduled_date?.split("T")[0];
      return eventDate === dateStr;
    });
  };

  // Open event dialog
  const openEventDialog = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  };

  const clearFilters = () => {
    setStatusFilter("");
    setTeamFilter("");
  };

  const hasActiveFilters = statusFilter || teamFilter;

  // Generate calendar days
  const calendarDays = [];
  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day;

  // Add empty cells for days before the first day of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(
      <div key={`empty-${i}`} className="h-28 bg-muted/30 border-b border-r" />
    );
  }

  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = getEventsForDay(day);
    const displayEvents = dayEvents.slice(0, 3);
    const remainingCount = dayEvents.length - 3;

    calendarDays.push(
      <div
        key={day}
        className={`h-28 border-b border-r p-1 overflow-hidden ${
          isToday(day) ? "bg-primary/5" : "bg-background"
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span
            className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${
              isToday(day)
                ? "bg-primary text-primary-foreground"
                : "text-foreground"
            }`}
          >
            {day}
          </span>
          {dayEvents.length > 0 && (
            <Badge variant="secondary" className="text-xs h-5">
              {dayEvents.length}
            </Badge>
          )}
        </div>
        <div className="space-y-0.5">
          {displayEvents.map((event) => (
            <button
              key={event.id}
              onClick={() => openEventDialog(event)}
              className={`w-full text-left text-xs p-1 rounded truncate border-l-2 ${
                priorityColors[event.priority]
              } bg-muted/50 hover:bg-muted transition-colors`}
            >
              <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${statusColors[event.status]}`} />
              {event.title}
            </button>
          ))}
          {remainingCount > 0 && (
            <button
              className="w-full text-xs text-muted-foreground hover:text-foreground text-left px-1"
              onClick={() => {
                // Could open a modal showing all events for this day
              }}
            >
              +{remainingCount} more
            </button>
          )}
        </div>
      </div>
    );
  }

  // Stats
  const stats = {
    total: events.length,
    preventive: events.filter((e) => e.type === "preventive").length,
    corrective: events.filter((e) => e.type === "corrective").length,
    critical: events.filter((e) => e.priority === "critical").length,
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Header Section */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <IconCalendar className="h-6 w-6" />
                Maintenance Calendar
              </h1>
              <p className="text-muted-foreground">
                Schedule and track maintenance activities
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Select value={viewMode} onValueChange={(v: "month" | "week") => setViewMode(v)}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <IconCalendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">scheduled tasks</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Preventive</CardTitle>
                <IconClock className="h-4 w-4 text-teal-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-600">{stats.preventive}</div>
                <p className="text-xs text-muted-foreground">maintenance tasks</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Corrective</CardTitle>
                <IconPlayerPlay className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">{stats.corrective}</div>
                <p className="text-xs text-muted-foreground">repair tasks</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical</CardTitle>
                <IconAlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
                <p className="text-xs text-muted-foreground">high priority</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToPreviousMonth}
                  >
                    <IconChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-lg font-semibold min-w-[180px] text-center">
                    {MONTHS[month]} {year}
                  </h2>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToNextMonth}
                  >
                    <IconChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={showFilters ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <IconFilter className="h-4 w-4 mr-2" />
                    Filters
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="ml-2">
                        Active
                      </Badge>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={fetchEvents}>
                    <IconRefresh className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>

              {showFilters && (
                <div className="flex flex-col gap-4 md:flex-row md:items-end border-t pt-4 mt-4">
                  <div className="grid gap-2 min-w-[150px]">
                    <Label>Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2 min-w-[150px]">
                    <Label>Team</Label>
                    <Select value={teamFilter} onValueChange={setTeamFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Teams</SelectItem>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id.toString()}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <IconX className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
              <CardDescription>
                Click on an event to view details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid grid-cols-7 gap-0 border-t border-l">
                  {DAYS.map((day) => (
                    <div
                      key={day}
                      className="h-10 flex items-center justify-center font-medium text-sm bg-muted border-b border-r"
                    >
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="h-28 border-b border-r p-2">
                      <Skeleton className="h-4 w-4 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-0 border-t border-l rounded-lg overflow-hidden">
                  {/* Day headers */}
                  {DAYS.map((day) => (
                    <div
                      key={day}
                      className="h-10 flex items-center justify-center font-medium text-sm bg-muted border-b border-r"
                    >
                      {day}
                    </div>
                  ))}
                  {/* Calendar days */}
                  {calendarDays}
                </div>
              )}

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Status:</span>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>New</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span>Assigned</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span>In Progress</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Completed</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Priority:</span>
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-2 border-l-2 border-slate-400" />
                    <span>Low</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-2 border-l-2 border-blue-400" />
                    <span>Medium</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-2 border-l-2 border-orange-400" />
                    <span>High</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-2 border-l-2 border-red-500" />
                    <span>Critical</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Details Dialog */}
        <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Maintenance Event - #{selectedEvent?.id}</DialogTitle>
            </DialogHeader>
            {selectedEvent && (
              <div className="grid gap-4 py-4">
                <div>
                  <Label className="text-muted-foreground">Title</Label>
                  <p className="font-medium text-lg">{selectedEvent.title}</p>
                </div>
                {selectedEvent.description && (
                  <div>
                    <Label className="text-muted-foreground">Description</Label>
                    <p className="font-medium">{selectedEvent.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Equipment</Label>
                    <p className="font-medium">{selectedEvent.equipment_name || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Technician</Label>
                    <p className="font-medium">{selectedEvent.technician_name || "Unassigned"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Type</Label>
                    <p className="font-medium capitalize">{selectedEvent.type}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Priority</Label>
                    <p className="font-medium capitalize">{selectedEvent.priority}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <p className="font-medium capitalize">{selectedEvent.status.replace("_", " ")}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Scheduled Date</Label>
                    <p className="font-medium">
                      {selectedEvent.scheduled_date
                        ? new Date(selectedEvent.scheduled_date).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Est. Duration</Label>
                    <p className="font-medium">
                      {selectedEvent.estimated_duration
                        ? `${selectedEvent.estimated_duration} mins`
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEventDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
