"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  IconClipboardList,
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconEye,
  IconChevronLeft,
  IconChevronRight,
  IconArrowUp,
  IconArrowDown,
  IconRefresh,
  IconX,
  IconFilter,
  IconClock,
  IconAlertTriangle,
  IconCircleCheck,
  IconPlayerPlay,
  IconUser,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface MaintenanceRequest {
  id: number;
  title: string;
  description: string;
  equipment_id: number;
  equipment_name: string;
  type: "preventive" | "corrective";
  priority: "low" | "medium" | "high" | "critical";
  status: "new" | "assigned" | "in_progress" | "completed" | "cancelled";
  requested_by: number;
  requester_name: string;
  assigned_technician_id: number;
  technician_name: string;
  scheduled_date: string;
  completed_date: string;
  estimated_duration: number;
  actual_duration: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface Equipment {
  id: number;
  name: string;
}

interface Technician {
  id: number;
  name: string;
}

interface Pagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

const API_BASE_URL = "http://localhost:3001/api";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  "Content-Type": "application/json",
});

const statusConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  new: {
    label: "New",
    icon: <IconClock className="h-3 w-3" />,
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
  assigned: {
    label: "Assigned",
    icon: <IconUser className="h-3 w-3" />,
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  },
  in_progress: {
    label: "In Progress",
    icon: <IconPlayerPlay className="h-3 w-3" />,
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  },
  completed: {
    label: "Completed",
    icon: <IconCircleCheck className="h-3 w-3" />,
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
  cancelled: {
    label: "Cancelled",
    icon: <IconX className="h-3 w-3" />,
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  },
};

const priorityConfig: Record<string, { label: string; className: string }> = {
  low: {
    label: "Low",
    className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
  medium: {
    label: "Medium",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  high: {
    label: "High",
    className: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  },
  critical: {
    label: "Critical",
    className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  },
};

const typeConfig: Record<string, { label: string; className: string }> = {
  preventive: {
    label: "Preventive",
    className: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
  },
  corrective: {
    label: "Corrective",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  },
};

export default function MaintenancePage() {
  const router = useRouter();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [userRole, setUserRole] = useState<string>("");

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Dropdown options
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);

  // Dialog states
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState<string>("");
  const [formLoading, setFormLoading] = useState(false);

  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  // Fetch user role
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserRole(user.role || "");
      }
    } catch {
      setUserRole("");
    }
  }, []);

  const canCreate = ["admin", "manager", "employee"].includes(userRole);
  const canAssign = ["admin", "manager"].includes(userRole);
  const canDelete = ["admin", "manager"].includes(userRole);

  // Fetch dropdown options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [equipRes, techRes] = await Promise.all([
          fetch(`${API_BASE_URL}/equipment`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE_URL}/technicians`, { headers: getAuthHeaders() }),
        ]);

        const [equipData, techData] = await Promise.all([
          equipRes.json(),
          techRes.json(),
        ]);

        if (equipData.success) setEquipment(equipData.data || []);
        if (techData.success) setTechnicians(techData.data || []);
      } catch {
        console.error("Failed to fetch dropdown options");
      }
    };

    fetchOptions();
  }, []);

  // Fetch requests
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(sortBy && { sort_by: sortBy }),
        ...(sortOrder && { sort_order: sortOrder }),
        ...(statusFilter && statusFilter !== "all" && { status: statusFilter }),
        ...(priorityFilter && priorityFilter !== "all" && { priority: priorityFilter }),
        ...(typeFilter && typeFilter !== "all" && { type: typeFilter }),
      });

      const response = await fetch(`${API_BASE_URL}/requests?${params}`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        setRequests(data.data || []);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination?.total || 0,
          hasMore: data.pagination?.hasMore || false,
        }));
      } else {
        toast.error(data.message || "Failed to fetch maintenance requests");
      }
    } catch {
      toast.error("Failed to fetch maintenance requests");
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, pagination.offset, searchTerm, sortBy, sortOrder, statusFilter, priorityFilter, typeFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination((prev) => ({ ...prev, offset: 0 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handlers
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({
      ...prev,
      offset: (newPage - 1) * prev.limit,
    }));
  };

  const handlePageSizeChange = (size: string) => {
    setPagination((prev) => ({
      ...prev,
      limit: parseInt(size),
      offset: 0,
    }));
  };

  const clearFilters = () => {
    setStatusFilter("");
    setPriorityFilter("");
    setTypeFilter("");
    setSearchTerm("");
  };

  // Actions
  const handleDelete = async () => {
    if (!selectedRequest) return;

    setFormLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/requests/${selectedRequest.id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Request deleted successfully");
        setIsDeleteDialogOpen(false);
        setSelectedRequest(null);
        fetchRequests();
      } else {
        toast.error(data.message || "Failed to delete request");
      }
    } catch {
      toast.error("Failed to delete request");
    } finally {
      setFormLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedRequest || !selectedTechnician) {
      toast.error("Please select a technician");
      return;
    }

    setFormLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/requests/${selectedRequest.id}/assign-technician`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ technician_id: parseInt(selectedTechnician) }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Technician assigned successfully");
        setIsAssignDialogOpen(false);
        setSelectedRequest(null);
        setSelectedTechnician("");
        fetchRequests();
      } else {
        toast.error(data.message || "Failed to assign technician");
      }
    } catch {
      toast.error("Failed to assign technician");
    } finally {
      setFormLoading(false);
    }
  };

  const openViewDialog = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setIsDeleteDialogOpen(true);
  };

  const openAssignDialog = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setSelectedTechnician(request.assigned_technician_id?.toString() || "");
    setIsAssignDialogOpen(true);
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? (
      <IconArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <IconArrowDown className="h-4 w-4 ml-1" />
    );
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const config = statusConfig[status] || statusConfig.new;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const PriorityBadge = ({ priority }: { priority: string }) => {
    const config = priorityConfig[priority] || priorityConfig.medium;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const TypeBadge = ({ type }: { type: string }) => {
    const config = typeConfig[type] || typeConfig.corrective;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const hasActiveFilters = statusFilter || priorityFilter || typeFilter || searchTerm;

  // Stats calculation
  const stats = {
    total: pagination.total,
    new: requests.filter((r) => r.status === "new").length,
    inProgress: requests.filter((r) => r.status === "in_progress").length,
    critical: requests.filter((r) => r.priority === "critical").length,
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
                <IconClipboardList className="h-6 w-6" />
                Maintenance Requests
              </h1>
              <p className="text-muted-foreground">
                Manage and track all maintenance requests
              </p>
            </div>
            {canCreate && (
              <Button onClick={() => router.push("/dashboard/requests/new")}>
                <IconPlus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <IconClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New</CardTitle>
                <IconClock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <IconPlayerPlay className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical</CardTitle>
                <IconAlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="relative flex-1 max-w-sm">
                    <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search requests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                    {searchTerm && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                        onClick={() => setSearchTerm("")}
                      >
                        <IconX className="h-4 w-4" />
                      </Button>
                    )}
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
                    <Button variant="outline" size="sm" onClick={fetchRequests}>
                      <IconRefresh className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>

                {showFilters && (
                  <div className="flex flex-col gap-4 md:flex-row md:items-end border-t pt-4">
                    <div className="grid gap-2 min-w-[140px]">
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
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2 min-w-[140px]">
                      <Label>Priority</Label>
                      <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priorities</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2 min-w-[140px]">
                      <Label>Type</Label>
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="preventive">Preventive</SelectItem>
                          <SelectItem value="corrective">Corrective</SelectItem>
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
              </div>
            </CardContent>
          </Card>

          {/* Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Requests</CardTitle>
              <CardDescription>
                {pagination.total} request{pagination.total !== 1 ? "s" : ""} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("id")}
                      >
                        <div className="flex items-center">
                          ID
                          <SortIcon field="id" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("title")}
                      >
                        <div className="flex items-center">
                          Title
                          <SortIcon field="title" />
                        </div>
                      </TableHead>
                      <TableHead>Equipment</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("priority")}
                      >
                        <div className="flex items-center">
                          Priority
                          <SortIcon field="priority" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center">
                          Status
                          <SortIcon field="status" />
                        </div>
                      </TableHead>
                      <TableHead>Technician</TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("scheduled_date")}
                      >
                        <div className="flex items-center">
                          Scheduled
                          <SortIcon field="scheduled_date" />
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 9 }).map((_, j) => (
                            <TableCell key={j}>
                              <Skeleton className="h-4 w-full" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : requests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <IconClipboardList className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">No requests found</p>
                            {canCreate && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push("/dashboard/requests/new")}
                              >
                                <IconPlus className="h-4 w-4 mr-2" />
                                Create Request
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      requests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">#{request.id}</TableCell>
                          <TableCell>
                            <div className="max-w-[200px]">
                              <p className="font-medium truncate">{request.title}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                by {request.requester_name}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{request.equipment_name || "-"}</TableCell>
                          <TableCell>
                            <TypeBadge type={request.type} />
                          </TableCell>
                          <TableCell>
                            <PriorityBadge priority={request.priority} />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={request.status} />
                          </TableCell>
                          <TableCell>
                            {request.technician_name || (
                              <span className="text-muted-foreground italic">Unassigned</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {request.scheduled_date
                              ? new Date(request.scheduled_date).toLocaleDateString()
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openViewDialog(request)}
                              >
                                <IconEye className="h-4 w-4" />
                              </Button>
                              {canAssign && request.status === "new" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openAssignDialog(request)}
                                >
                                  <IconUser className="h-4 w-4" />
                                </Button>
                              )}
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => openDeleteDialog(request)}
                                >
                                  <IconTrash className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Rows per page:</span>
                  <Select
                    value={pagination.limit.toString()}
                    onValueChange={handlePageSizeChange}
                  >
                    <SelectTrigger className="w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages || 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <IconChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                    >
                      <IconChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Request Details - #{selectedRequest?.id}</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="grid gap-4 py-4">
                <div>
                  <Label className="text-muted-foreground">Title</Label>
                  <p className="font-medium text-lg">{selectedRequest.title}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="font-medium">{selectedRequest.description || "-"}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Type</Label>
                    <div className="mt-1">
                      <TypeBadge type={selectedRequest.type} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Priority</Label>
                    <div className="mt-1">
                      <PriorityBadge priority={selectedRequest.priority} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <div className="mt-1">
                      <StatusBadge status={selectedRequest.status} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Equipment</Label>
                    <p className="font-medium">{selectedRequest.equipment_name || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Assigned Technician</Label>
                    <p className="font-medium">{selectedRequest.technician_name || "Unassigned"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Requested By</Label>
                    <p className="font-medium">{selectedRequest.requester_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Scheduled Date</Label>
                    <p className="font-medium">
                      {selectedRequest.scheduled_date
                        ? new Date(selectedRequest.scheduled_date).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Estimated Duration</Label>
                    <p className="font-medium">
                      {selectedRequest.estimated_duration
                        ? `${selectedRequest.estimated_duration} mins`
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Actual Duration</Label>
                    <p className="font-medium">
                      {selectedRequest.actual_duration
                        ? `${selectedRequest.actual_duration} mins`
                        : "-"}
                    </p>
                  </div>
                </div>
                {selectedRequest.notes && (
                  <div>
                    <Label className="text-muted-foreground">Notes</Label>
                    <p className="font-medium">{selectedRequest.notes}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Created</Label>
                    <p className="font-medium">
                      {new Date(selectedRequest.created_at).toLocaleString()}
                    </p>
                  </div>
                  {selectedRequest.completed_date && (
                    <div>
                      <Label className="text-muted-foreground">Completed</Label>
                      <p className="font-medium">
                        {new Date(selectedRequest.completed_date).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Request</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete request #{selectedRequest?.id} &quot;{selectedRequest?.title}&quot;? 
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={formLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={formLoading}
              >
                {formLoading ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign Technician Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Technician</DialogTitle>
              <DialogDescription>
                Select a technician to assign to request #{selectedRequest?.id}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label>Technician</Label>
              <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a technician" />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id.toString()}>
                      {tech.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAssignDialogOpen(false)}
                disabled={formLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleAssign} disabled={formLoading}>
                {formLoading ? "Assigning..." : "Assign"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
