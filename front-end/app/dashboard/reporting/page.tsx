"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import {
  IconReport,
  IconChartBar,
  IconChartPie,
  IconTrendingUp,
  IconTrendingDown,
  IconUsers,
  IconDeviceDesktop,
  IconClock,
  IconCircleCheck,
  IconAlertTriangle,
  IconRefresh,
  IconDownload,
  IconCalendar,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TeamStats {
  team_id: number;
  team_name: string;
  total_requests: number;
  completed_requests: number;
  pending_requests: number;
  avg_completion_time: number;
  technician_count: number;
}

interface EquipmentStats {
  equipment_id: number;
  equipment_name: string;
  total_requests: number;
  completed_requests: number;
  avg_downtime: number;
  last_maintenance: string;
  health_score: number;
}

interface OverviewStats {
  total_requests: number;
  completed_requests: number;
  pending_requests: number;
  overdue_requests: number;
  avg_completion_time: number;
  completion_rate: number;
  monthly_trend: { month: string; count: number }[];
  by_priority: { priority: string; count: number }[];
  by_type: { type: string; count: number }[];
  by_status: { status: string; count: number }[];
}

const API_BASE_URL = "http://localhost:3001/api";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  "Content-Type": "application/json",
});

export default function ReportingPage() {
  const [loading, setLoading] = useState(true);
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [teamStats, setTeamStats] = useState<TeamStats[]>([]);
  const [equipmentStats, setEquipmentStats] = useState<EquipmentStats[]>([]);
  const [dateRange, setDateRange] = useState<string>("30");
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch all stats
  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        days: dateRange,
      });

      const [overviewRes, teamRes, equipmentRes] = await Promise.all([
        fetch(`${API_BASE_URL}/requests/stats/overview?${params}`, {
          headers: getAuthHeaders(),
        }),
        fetch(`${API_BASE_URL}/requests/stats/team?${params}`, {
          headers: getAuthHeaders(),
        }),
        fetch(`${API_BASE_URL}/requests/stats/equipment?${params}`, {
          headers: getAuthHeaders(),
        }),
      ]);

      const [overviewData, teamData, equipmentData] = await Promise.all([
        overviewRes.json(),
        teamRes.json(),
        equipmentRes.json(),
      ]);

      if (overviewData.success) setOverviewStats(overviewData.data);
      if (teamData.success) setTeamStats(teamData.data || []);
      if (equipmentData.success) setEquipmentStats(equipmentData.data || []);
    } catch {
      toast.error("Failed to fetch statistics");
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const formatDuration = (minutes: number) => {
    if (!minutes) return "-";
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getHealthBadge = (score: number) => {
    if (score >= 80) return { label: "Good", className: "bg-green-100 text-green-800" };
    if (score >= 60) return { label: "Fair", className: "bg-yellow-100 text-yellow-800" };
    if (score >= 40) return { label: "Poor", className: "bg-orange-100 text-orange-800" };
    return { label: "Critical", className: "bg-red-100 text-red-800" };
  };

  const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
    trend,
    trendValue,
  }: {
    title: string;
    value: string | number;
    description?: string;
    icon: React.ElementType;
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && trendValue && (
          <div className="flex items-center mt-1">
            {trend === "up" ? (
              <IconTrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : trend === "down" ? (
              <IconTrendingDown className="h-4 w-4 text-red-500 mr-1" />
            ) : null}
            <span
              className={`text-xs ${
                trend === "up"
                  ? "text-green-600"
                  : trend === "down"
                  ? "text-red-600"
                  : "text-muted-foreground"
              }`}
            >
              {trendValue}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

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
                <IconReport className="h-6 w-6" />
                Reporting & Analytics
              </h1>
              <p className="text-muted-foreground">
                Track performance metrics and maintenance insights
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm">Period:</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="sm" onClick={fetchStats}>
                <IconRefresh className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <IconDownload className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">
                <IconChartBar className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="teams">
                <IconUsers className="h-4 w-4 mr-2" />
                Team Performance
              </TabsTrigger>
              <TabsTrigger value="equipment">
                <IconDeviceDesktop className="h-4 w-4 mr-2" />
                Equipment Analysis
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              {loading ? (
                <div className="grid gap-4 md:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i}>
                      <CardHeader className="pb-2">
                        <Skeleton className="h-4 w-24" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-3 w-20 mt-2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <>
                  {/* Main Stats */}
                  <div className="grid gap-4 md:grid-cols-4">
                    <StatCard
                      title="Total Requests"
                      value={overviewStats?.total_requests || 0}
                      description="All maintenance requests"
                      icon={IconChartBar}
                    />
                    <StatCard
                      title="Completed"
                      value={overviewStats?.completed_requests || 0}
                      description={`${overviewStats?.completion_rate?.toFixed(1) || 0}% completion rate`}
                      icon={IconCircleCheck}
                      trend="up"
                      trendValue={`${overviewStats?.completion_rate?.toFixed(1) || 0}%`}
                    />
                    <StatCard
                      title="Pending"
                      value={overviewStats?.pending_requests || 0}
                      description="Awaiting action"
                      icon={IconClock}
                    />
                    <StatCard
                      title="Overdue"
                      value={overviewStats?.overdue_requests || 0}
                      description="Past scheduled date"
                      icon={IconAlertTriangle}
                      trend={overviewStats?.overdue_requests ? "down" : "neutral"}
                      trendValue={overviewStats?.overdue_requests ? "Needs attention" : "On track"}
                    />
                  </div>

                  {/* Charts Row */}
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* By Status */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Requests by Status</CardTitle>
                        <CardDescription>Distribution of request statuses</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {(overviewStats?.by_status || []).map((item) => (
                            <div key={item.status} className="flex items-center">
                              <div className="w-24 text-sm capitalize">
                                {item.status.replace("_", " ")}
                              </div>
                              <div className="flex-1 mx-4">
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      item.status === "completed"
                                        ? "bg-green-500"
                                        : item.status === "in_progress"
                                        ? "bg-yellow-500"
                                        : item.status === "new"
                                        ? "bg-blue-500"
                                        : "bg-gray-400"
                                    }`}
                                    style={{
                                      width: `${
                                        ((item.count || 0) /
                                          (overviewStats?.total_requests || 1)) *
                                        100
                                      }%`,
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="w-12 text-sm text-right font-medium">
                                {item.count}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* By Priority */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Requests by Priority</CardTitle>
                        <CardDescription>Priority level breakdown</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {(overviewStats?.by_priority || []).map((item) => (
                            <div key={item.priority} className="flex items-center">
                              <div className="w-24 text-sm capitalize">{item.priority}</div>
                              <div className="flex-1 mx-4">
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      item.priority === "critical"
                                        ? "bg-red-500"
                                        : item.priority === "high"
                                        ? "bg-orange-500"
                                        : item.priority === "medium"
                                        ? "bg-blue-500"
                                        : "bg-slate-400"
                                    }`}
                                    style={{
                                      width: `${
                                        ((item.count || 0) /
                                          (overviewStats?.total_requests || 1)) *
                                        100
                                      }%`,
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="w-12 text-sm text-right font-medium">
                                {item.count}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Average Completion Time */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Performance Metrics</CardTitle>
                      <CardDescription>Key performance indicators</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <IconClock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-2xl font-bold">
                            {formatDuration(overviewStats?.avg_completion_time || 0)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Avg. Completion Time
                          </p>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <IconTrendingUp className="h-8 w-8 mx-auto text-green-500 mb-2" />
                          <p className="text-2xl font-bold">
                            {overviewStats?.completion_rate?.toFixed(1) || 0}%
                          </p>
                          <p className="text-sm text-muted-foreground">Completion Rate</p>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <IconChartPie className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                          <p className="text-2xl font-bold">
                            {(
                              ((overviewStats?.by_type?.find((t) => t.type === "preventive")
                                ?.count || 0) /
                                (overviewStats?.total_requests || 1)) *
                              100
                            ).toFixed(0)}
                            %
                          </p>
                          <p className="text-sm text-muted-foreground">Preventive Ratio</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* Teams Tab */}
            <TabsContent value="teams" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Team Performance</CardTitle>
                  <CardDescription>
                    Maintenance team performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : teamStats.length === 0 ? (
                    <div className="text-center py-8">
                      <IconUsers className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No team data available</p>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Team</TableHead>
                            <TableHead className="text-center">Technicians</TableHead>
                            <TableHead className="text-center">Total Requests</TableHead>
                            <TableHead className="text-center">Completed</TableHead>
                            <TableHead className="text-center">Pending</TableHead>
                            <TableHead className="text-center">Avg. Time</TableHead>
                            <TableHead className="text-center">Efficiency</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {teamStats.map((team) => {
                            const efficiency =
                              team.total_requests > 0
                                ? (team.completed_requests / team.total_requests) * 100
                                : 0;
                            return (
                              <TableRow key={team.team_id}>
                                <TableCell className="font-medium">
                                  {team.team_name}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="secondary">{team.technician_count}</Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  {team.total_requests}
                                </TableCell>
                                <TableCell className="text-center text-green-600">
                                  {team.completed_requests}
                                </TableCell>
                                <TableCell className="text-center text-yellow-600">
                                  {team.pending_requests}
                                </TableCell>
                                <TableCell className="text-center">
                                  {formatDuration(team.avg_completion_time)}
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${
                                          efficiency >= 80
                                            ? "bg-green-500"
                                            : efficiency >= 60
                                            ? "bg-yellow-500"
                                            : "bg-red-500"
                                        }`}
                                        style={{ width: `${efficiency}%` }}
                                      />
                                    </div>
                                    <span className="text-sm">{efficiency.toFixed(0)}%</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Equipment Tab */}
            <TabsContent value="equipment" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Equipment Analysis</CardTitle>
                  <CardDescription>
                    Equipment maintenance history and health metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : equipmentStats.length === 0 ? (
                    <div className="text-center py-8">
                      <IconDeviceDesktop className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No equipment data available</p>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Equipment</TableHead>
                            <TableHead className="text-center">Total Requests</TableHead>
                            <TableHead className="text-center">Completed</TableHead>
                            <TableHead className="text-center">Avg. Downtime</TableHead>
                            <TableHead className="text-center">Last Maintenance</TableHead>
                            <TableHead className="text-center">Health Score</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {equipmentStats.map((equip) => {
                            const health = getHealthBadge(equip.health_score);
                            return (
                              <TableRow key={equip.equipment_id}>
                                <TableCell className="font-medium">
                                  {equip.equipment_name}
                                </TableCell>
                                <TableCell className="text-center">
                                  {equip.total_requests}
                                </TableCell>
                                <TableCell className="text-center text-green-600">
                                  {equip.completed_requests}
                                </TableCell>
                                <TableCell className="text-center">
                                  {formatDuration(equip.avg_downtime)}
                                </TableCell>
                                <TableCell className="text-center">
                                  {equip.last_maintenance
                                    ? new Date(equip.last_maintenance).toLocaleDateString()
                                    : "-"}
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <span
                                      className={`text-lg font-bold ${getHealthColor(
                                        equip.health_score
                                      )}`}
                                    >
                                      {equip.health_score}%
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-xs ${health.className}`}
                                    >
                                      {health.label}
                                    </span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Equipment Health Summary */}
              {!loading && equipmentStats.length > 0 && (
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Good Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {equipmentStats.filter((e) => e.health_score >= 80).length}
                      </div>
                      <p className="text-xs text-muted-foreground">≥80% health score</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Fair Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600">
                        {
                          equipmentStats.filter(
                            (e) => e.health_score >= 60 && e.health_score < 80
                          ).length
                        }
                      </div>
                      <p className="text-xs text-muted-foreground">60-79% health score</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Poor Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">
                        {
                          equipmentStats.filter(
                            (e) => e.health_score >= 40 && e.health_score < 60
                          ).length
                        }
                      </div>
                      <p className="text-xs text-muted-foreground">40-59% health score</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Critical</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {equipmentStats.filter((e) => e.health_score < 40).length}
                      </div>
                      <p className="text-xs text-muted-foreground">&lt;40% health score</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
