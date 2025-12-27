"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import {
  IconUsers,
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
  IconUserCheck,
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

interface Team {
  id: number;
  name: string;
  description: string;
  department_id: number;
  department_name: string;
  lead_technician_id: number;
  lead_technician_name: string;
  technician_count: number;
  active_requests: number;
  created_at: string;
  updated_at: string;
}

interface Technician {
  id: number;
  user_id: number;
  name: string;
  email: string;
  specialization: string;
  is_lead: boolean;
  active_tasks: number;
}

interface Department {
  id: number;
  name: string;
}

interface TechnicianOption {
  id: number;
  name: string;
}

interface Pagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

interface FormData {
  name: string;
  description: string;
  department_id: string;
  lead_technician_id: string;
}

const API_BASE_URL = "http://localhost:3001/api";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  "Content-Type": "application/json",
});

const initialFormData: FormData = {
  name: "",
  description: "",
  department_id: "",
  lead_technician_id: "",
};

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [userRole, setUserRole] = useState<string>("");

  // Filter states
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Dropdown options
  const [departments, setDepartments] = useState<Department[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianOption[]>([]);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<Technician[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedTechnicianToAdd, setSelectedTechnicianToAdd] = useState<string>("");
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  const [availableTechnicians, setAvailableTechnicians] = useState<TechnicianOption[]>([]);

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

  const canCreate = ["admin", "manager"].includes(userRole);
  const canEdit = ["admin", "manager"].includes(userRole);
  const canDelete = ["admin", "manager"].includes(userRole);

  // Fetch dropdown options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [deptRes, techRes] = await Promise.all([
          fetch(`${API_BASE_URL}/departments`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE_URL}/technicians`, { headers: getAuthHeaders() }),
        ]);

        const [deptData, techData] = await Promise.all([
          deptRes.json(),
          techRes.json(),
        ]);

        if (deptData.success) setDepartments(deptData.data || []);
        if (techData.success) setTechnicians(techData.data || []);
      } catch {
        console.error("Failed to fetch dropdown options");
      }
    };

    fetchOptions();
  }, []);

  // Fetch teams
  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(sortBy && { sort_by: sortBy }),
        ...(sortOrder && { sort_order: sortOrder }),
        ...(departmentFilter && { department_id: departmentFilter }),
      });

      const response = await fetch(`${API_BASE_URL}/teams?${params}`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        setTeams(data.data || []);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination?.total || 0,
          hasMore: data.pagination?.hasMore || false,
        }));
      } else {
        toast.error(data.message || "Failed to fetch teams");
      }
    } catch {
      toast.error("Failed to fetch teams");
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, pagination.offset, searchTerm, sortBy, sortOrder, departmentFilter]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // Fetch team members
  const fetchTeamMembers = async (teamId: number) => {
    setMembersLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/teams/${teamId}/technicians`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        setTeamMembers(data.data?.technicians || []);
        // Update available technicians (exclude current team members)
        const memberIds = (data.data?.technicians || []).map((m: Technician) => m.id);
        setAvailableTechnicians(technicians.filter(t => !memberIds.includes(t.id)));
      } else {
        toast.error(data.message || "Failed to fetch team members");
      }
    } catch {
      toast.error("Failed to fetch team members");
    } finally {
      setMembersLoading(false);
    }
  };

  // Add technician to team
  const handleAddTechnicianToTeam = async () => {
    if (!selectedTeam || !selectedTechnicianToAdd) {
      toast.error("Please select a technician");
      return;
    }

    setAddMemberLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/teams/${selectedTeam.id}/technicians`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ technician_id: parseInt(selectedTechnicianToAdd) }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Technician added to team successfully");
        setIsAddMemberDialogOpen(false);
        setSelectedTechnicianToAdd("");
        fetchTeamMembers(selectedTeam.id);
        fetchTeams();
      } else {
        toast.error(data.message || "Failed to add technician to team");
      }
    } catch {
      toast.error("Failed to add technician to team");
    } finally {
      setAddMemberLoading(false);
    }
  };

  // Remove technician from team
  const handleRemoveTechnicianFromTeam = async (technicianId: number) => {
    if (!selectedTeam) return;

    try {
      const response = await fetch(`${API_BASE_URL}/teams/${selectedTeam.id}/technicians/${technicianId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Technician removed from team");
        fetchTeamMembers(selectedTeam.id);
        fetchTeams();
      } else {
        toast.error(data.message || "Failed to remove technician from team");
      }
    } catch {
      toast.error("Failed to remove technician from team");
    }
  };

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
    setDepartmentFilter("");
    setSearchTerm("");
  };

  // CRUD Operations
  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error("Team name is required");
      return;
    }

    if (!formData.department_id) {
      toast.error("Department is required");
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        department_id: parseInt(formData.department_id),
        lead_technician_id: formData.lead_technician_id
          ? parseInt(formData.lead_technician_id)
          : null,
      };

      const response = await fetch(`${API_BASE_URL}/teams`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Team created successfully");
        setIsCreateDialogOpen(false);
        setFormData(initialFormData);
        fetchTeams();
      } else {
        toast.error(data.message || "Failed to create team");
      }
    } catch {
      toast.error("Failed to create team");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedTeam || !formData.name.trim()) {
      toast.error("Team name is required");
      return;
    }

    if (!formData.department_id) {
      toast.error("Department is required");
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        department_id: parseInt(formData.department_id),
        lead_technician_id: formData.lead_technician_id
          ? parseInt(formData.lead_technician_id)
          : null,
      };

      const response = await fetch(`${API_BASE_URL}/teams/${selectedTeam.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Team updated successfully");
        setIsEditDialogOpen(false);
        setSelectedTeam(null);
        setFormData(initialFormData);
        fetchTeams();
      } else {
        toast.error(data.message || "Failed to update team");
      }
    } catch {
      toast.error("Failed to update team");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTeam) return;

    setFormLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/teams/${selectedTeam.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Team deleted successfully");
        setIsDeleteDialogOpen(false);
        setSelectedTeam(null);
        fetchTeams();
      } else {
        toast.error(data.message || "Failed to delete team");
      }
    } catch {
      toast.error("Failed to delete team");
    } finally {
      setFormLoading(false);
    }
  };

  const openEditDialog = (team: Team) => {
    setSelectedTeam(team);
    setFormData({
      name: team.name,
      description: team.description || "",
      department_id: team.department_id?.toString() || "",
      lead_technician_id: team.lead_technician_id?.toString() || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (team: Team) => {
    setSelectedTeam(team);
    setIsDeleteDialogOpen(true);
  };

  const openViewDialog = (team: Team) => {
    setSelectedTeam(team);
    setIsViewDialogOpen(true);
  };

  const openMembersDialog = (team: Team) => {
    setSelectedTeam(team);
    setIsMembersDialogOpen(true);
    fetchTeamMembers(team.id);
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? (
      <IconArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <IconArrowDown className="h-4 w-4 ml-1" />
    );
  };

  const hasActiveFilters = departmentFilter || searchTerm;

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
                <IconUsers className="h-6 w-6" />
                Teams
              </h1>
              <p className="text-muted-foreground">
                Manage maintenance teams and their members
              </p>
            </div>
            {canCreate && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <IconPlus className="h-4 w-4 mr-2" />
                Add Team
              </Button>
            )}
          </div>

          {/* Filters Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="relative flex-1 max-w-sm">
                    <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search teams..."
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
                    <Button variant="outline" size="sm" onClick={fetchTeams}>
                      <IconRefresh className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>

                {showFilters && (
                  <div className="flex flex-col gap-4 md:flex-row md:items-end border-t pt-4">
                    <div className="grid gap-2 min-w-[200px]">
                      <Label>Department</Label>
                      <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All departments" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id.toString()}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <IconX className="h-4 w-4 mr-2" />
                        Clear Filters
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
              <CardTitle>All Teams</CardTitle>
              <CardDescription>
                {pagination.total} team{pagination.total !== 1 ? "s" : ""} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
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
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center">
                          Team Name
                          <SortIcon field="name" />
                        </div>
                      </TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("department_name")}
                      >
                        <div className="flex items-center">
                          Department
                          <SortIcon field="department_name" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("lead_technician_name")}
                      >
                        <div className="flex items-center">
                          Team Lead
                          <SortIcon field="lead_technician_name" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50 text-center"
                        onClick={() => handleSort("technician_count")}
                      >
                        <div className="flex items-center justify-center">
                          Members
                          <SortIcon field="technician_count" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50 text-center"
                        onClick={() => handleSort("active_requests")}
                      >
                        <div className="flex items-center justify-center">
                          Active Requests
                          <SortIcon field="active_requests" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("created_at")}
                      >
                        <div className="flex items-center">
                          Created
                          <SortIcon field="created_at" />
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
                    ) : teams.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <IconUsers className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">No teams found</p>
                            {canCreate && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsCreateDialogOpen(true)}
                              >
                                <IconPlus className="h-4 w-4 mr-2" />
                                Create Team
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      teams.map((team) => (
                        <TableRow key={team.id}>
                          <TableCell className="font-medium">{team.id}</TableCell>
                          <TableCell className="font-medium">{team.name}</TableCell>
                          <TableCell className="max-w-[200px] truncate text-muted-foreground">
                            {team.description || "-"}
                          </TableCell>
                          <TableCell>{team.department_name || "-"}</TableCell>
                          <TableCell>
                            {team.lead_technician_name ? (
                              <div className="flex items-center gap-1">
                                <IconUserCheck className="h-4 w-4 text-green-600" />
                                {team.lead_technician_name}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-1"
                              onClick={() => openMembersDialog(team)}
                            >
                              <Badge variant="secondary">{team.technician_count}</Badge>
                            </Button>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={team.active_requests > 0 ? "default" : "secondary"}
                            >
                              {team.active_requests}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(team.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openViewDialog(team)}
                              >
                                <IconEye className="h-4 w-4" />
                              </Button>
                              {canEdit && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(team)}
                                >
                                  <IconEdit className="h-4 w-4" />
                                </Button>
                              )}
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => openDeleteDialog(team)}
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

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Team</DialogTitle>
              <DialogDescription>
                Add a new maintenance team
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Team Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter team name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Enter description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Department *</Label>
                <Select
                  value={formData.department_id}
                  onValueChange={(v) => setFormData({ ...formData, department_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Team Lead</Label>
                <Select
                  value={formData.lead_technician_id}
                  onValueChange={(v) => setFormData({ ...formData, lead_technician_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team lead (optional)" />
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
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={formLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={formLoading}>
                {formLoading ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Team</DialogTitle>
              <DialogDescription>
                Update team information
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Team Name *</Label>
                <Input
                  id="edit-name"
                  placeholder="Enter team name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  placeholder="Enter description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Department *</Label>
                <Select
                  value={formData.department_id}
                  onValueChange={(v) => setFormData({ ...formData, department_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Team Lead</Label>
                <Select
                  value={formData.lead_technician_id}
                  onValueChange={(v) => setFormData({ ...formData, lead_technician_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team lead (optional)" />
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
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={formLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleEdit} disabled={formLoading}>
                {formLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Team</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{selectedTeam?.name}&quot;? This action
                cannot be undone.
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

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Team Details</DialogTitle>
            </DialogHeader>
            {selectedTeam && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">ID</Label>
                    <p className="font-medium">{selectedTeam.id}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Name</Label>
                    <p className="font-medium">{selectedTeam.name}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="font-medium">{selectedTeam.description || "-"}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Department</Label>
                    <p className="font-medium">{selectedTeam.department_name || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Team Lead</Label>
                    <p className="font-medium">{selectedTeam.lead_technician_name || "-"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Members</Label>
                    <p className="font-medium">{selectedTeam.technician_count}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Active Requests</Label>
                    <p className="font-medium">{selectedTeam.active_requests}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Created</Label>
                    <p className="font-medium">
                      {new Date(selectedTeam.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Updated</Label>
                    <p className="font-medium">
                      {new Date(selectedTeam.updated_at).toLocaleString()}
                    </p>
                  </div>
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

        {/* Team Members Dialog */}
        <Dialog open={isMembersDialogOpen} onOpenChange={setIsMembersDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Team Members - {selectedTeam?.name}</span>
                {canEdit && (
                  <Button size="sm" onClick={() => setIsAddMemberDialogOpen(true)}>
                    <IconPlus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                )}
              </DialogTitle>
              <DialogDescription>
                {teamMembers.length} technician{teamMembers.length !== 1 ? "s" : ""} in this team
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {membersLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : teamMembers.length === 0 ? (
                <div className="text-center py-8">
                  <IconUsers className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No team members found</p>
                  {canEdit && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setIsAddMemberDialogOpen(true)}
                    >
                      <IconPlus className="h-4 w-4 mr-2" />
                      Add First Member
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <IconUserCheck className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{member.name}</p>
                            {member.is_lead && (
                              <Badge variant="default" className="text-xs">Lead</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-medium">{member.specialization || "-"}</p>
                          <p className="text-xs text-muted-foreground">
                            {member.active_tasks} active task{member.active_tasks !== 1 ? "s" : ""}
                          </p>
                        </div>
                        {canEdit && !member.is_lead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleRemoveTechnicianFromTeam(member.id)}
                          >
                            <IconX className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsMembersDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Member Dialog */}
        <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>
                Add a technician to {selectedTeam?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="grid gap-2">
                <Label>Select Technician</Label>
                <Select
                  value={selectedTechnicianToAdd}
                  onValueChange={setSelectedTechnicianToAdd}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a technician to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTechnicians.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No available technicians
                      </SelectItem>
                    ) : (
                      availableTechnicians.map((tech) => (
                        <SelectItem key={tech.id} value={tech.id.toString()}>
                          {tech.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddMemberDialogOpen(false);
                  setSelectedTechnicianToAdd("");
                }}
                disabled={addMemberLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddTechnicianToTeam}
                disabled={addMemberLoading || !selectedTechnicianToAdd}
              >
                {addMemberLoading ? "Adding..." : "Add to Team"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
