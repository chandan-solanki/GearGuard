"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { KanbanBoard } from "@/components/kanban-board"
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Hand,
  Eye,
  Wrench,
  Users,
  TrendingUp,
  Timer,
  AlertCircle,
  Building2,
  MapPin,
  Package,
  Calendar,
  User,
  LayoutGrid,
  List,
} from "lucide-react"

// ==================== INTERFACES ====================

interface TechnicianProfile {
  id: number
  user_id: number
  team_id: number
  name: string
  email: string
  role: string
  team_name: string
  team_color: string
  department_name: string
  department_id: number
}

interface TechnicianRequest {
  id: number
  subject: string
  type: string
  priority: string
  status: string
  description: string
  equipment_id: number
  equipment_name: string
  serial_number: string
  equipment_location: string
  department_id: number
  department_name: string
  category_name: string
  category_responsible: string
  category_company: string
  team_id: number
  team_name: string
  created_by_name: string
  technician_id: number | null
  technician_name: string | null
  scheduled_date: string | null
  is_overdue: number
  created_at: string
  updated_at: string
}

interface TechnicianStats {
  total_assigned: number
  new_requests: number
  in_progress: number
  completed: number
  scrapped: number
  overdue: number
  critical_pending: number
  high_pending: number
  avg_resolution_hours: string | null
  by_category: Array<{ category_name: string; request_count: number }>
  by_type: Array<{ type: string; count: number }>
}

// ==================== MAIN COMPONENT ====================

export default function TechnicianDashboard() {
  const router = useRouter()
  
  // State
  const [profile, setProfile] = useState<TechnicianProfile | null>(null)
  const [stats, setStats] = useState<TechnicianStats | null>(null)
  const [myRequests, setMyRequests] = useState<TechnicianRequest[]>([])
  const [teamRequests, setTeamRequests] = useState<TechnicianRequest[]>([])
  
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [isLoadingMyRequests, setIsLoadingMyRequests] = useState(true)
  const [isLoadingTeamRequests, setIsLoadingTeamRequests] = useState(true)
  
  const [statusFilter, setStatusFilter] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("")
  
  const [completingRequest, setCompletingRequest] = useState<TechnicianRequest | null>(null)
  const [durationHours, setDurationHours] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [myRequestsPagination, setMyRequestsPagination] = useState({ total: 0 })
  const [teamRequestsPagination, setTeamRequestsPagination] = useState({ total: 0 })

  // ==================== API CALLS ====================

  const getAuthHeaders = () => {
    const accessToken = localStorage.getItem("accessToken")
    return {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    }
  }

  const fetchProfile = async () => {
    setIsLoadingProfile(true)
    try {
      const response = await fetch("http://localhost:3001/api/technicians/me", {
        headers: getAuthHeaders(),
      })
      const data = await response.json()
      if (data.success) {
        setProfile(data.data)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast.error("Failed to load profile")
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const fetchStats = async () => {
    setIsLoadingStats(true)
    try {
      const response = await fetch("http://localhost:3001/api/technicians/me/stats", {
        headers: getAuthHeaders(),
      })
      const data = await response.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  const fetchMyRequests = async () => {
    setIsLoadingMyRequests(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append("status", statusFilter)
      if (priorityFilter) params.append("priority", priorityFilter)

      const response = await fetch(
        `http://localhost:3001/api/technicians/me/requests?${params}`,
        { headers: getAuthHeaders() }
      )
      const data = await response.json()
      if (data.success) {
        setMyRequests(data.data)
        setMyRequestsPagination(data.pagination)
      }
    } catch (error) {
      console.error("Error fetching my requests:", error)
      toast.error("Failed to load your requests")
    } finally {
      setIsLoadingMyRequests(false)
    }
  }

  const fetchTeamRequests = async () => {
    setIsLoadingTeamRequests(true)
    try {
      const params = new URLSearchParams()
      params.append("unassigned_only", "true")
      if (statusFilter) params.append("status", statusFilter)
      if (priorityFilter) params.append("priority", priorityFilter)

      const response = await fetch(
        `http://localhost:3001/api/technicians/me/team-requests?${params}`,
        { headers: getAuthHeaders() }
      )
      const data = await response.json()
      if (data.success) {
        setTeamRequests(data.data)
        setTeamRequestsPagination(data.pagination)
      }
    } catch (error) {
      console.error("Error fetching team requests:", error)
      toast.error("Failed to load team requests")
    } finally {
      setIsLoadingTeamRequests(false)
    }
  }

  const acceptRequest = async (requestId: number) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/technicians/me/accept-request/${requestId}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
        }
      )
      const data = await response.json()
      if (data.success) {
        toast.success("Request accepted successfully!")
        fetchMyRequests()
        fetchTeamRequests()
        fetchStats()
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to accept request")
    }
  }

  const startWork = async (requestId: number) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/requests/${requestId}/status`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ status: "in_progress" }),
        }
      )
      const data = await response.json()
      if (data.success) {
        toast.success("Work started!")
        fetchMyRequests()
        fetchStats()
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to start work")
    }
  }

  const completeWork = async () => {
    if (!completingRequest || !durationHours) return

    setIsSubmitting(true)
    try {
      const response = await fetch(
        `http://localhost:3001/api/requests/${completingRequest.id}/status`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            status: "repaired",
            duration_hours: parseFloat(durationHours),
          }),
        }
      )
      const data = await response.json()
      if (data.success) {
        toast.success("Request completed successfully!")
        setCompletingRequest(null)
        setDurationHours("")
        fetchMyRequests()
        fetchStats()
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to complete request")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Kanban status change handler
  const handleKanbanStatusChange = useCallback(async (requestId: number, newStatus: string, durationHours?: number): Promise<boolean> => {
    try {
      const payload: { status: string; duration_hours?: number } = { status: newStatus };
      if (durationHours) {
        payload.duration_hours = durationHours;
      }

      const response = await fetch(
        `http://localhost:3001/api/requests/${requestId}/status`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        }
      )
      const data = await response.json()
      if (data.success) {
        return true
      } else {
        toast.error(data.message || "Failed to update status")
        return false
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update status")
      return false
    }
  }, [])

  const refreshAllData = useCallback(() => {
    fetchMyRequests()
    fetchTeamRequests()
    fetchStats()
  }, [])

  // ==================== EFFECTS ====================

  useEffect(() => {
    fetchProfile()
    fetchStats()
  }, [])

  useEffect(() => {
    fetchMyRequests()
    fetchTeamRequests()
  }, [statusFilter, priorityFilter])

  // ==================== HELPERS ====================

  const getPriorityConfig = (priority: string) => {
    const configs: Record<string, { color: string; icon: string; bgColor: string; borderColor: string }> = {
      critical: { color: "text-red-700", icon: "🔴", bgColor: "bg-red-100", borderColor: "border-red-500" },
      high: { color: "text-orange-700", icon: "🟠", bgColor: "bg-orange-100", borderColor: "border-orange-500" },
      medium: { color: "text-yellow-700", icon: "🟡", bgColor: "bg-yellow-100", borderColor: "border-yellow-500" },
      low: { color: "text-green-700", icon: "🟢", bgColor: "bg-green-100", borderColor: "border-green-500" },
    }
    return configs[priority] || configs.medium
  }

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; bgColor: string; label: string }> = {
      new: { color: "text-blue-700", bgColor: "bg-blue-100", label: "New" },
      assigned: { color: "text-purple-700", bgColor: "bg-purple-100", label: "Assigned" },
      in_progress: { color: "text-yellow-700", bgColor: "bg-yellow-100", label: "In Progress" },
      repaired: { color: "text-green-700", bgColor: "bg-green-100", label: "Completed" },
      scrap: { color: "text-gray-700", bgColor: "bg-gray-100", label: "Scrapped" },
    }
    return configs[status] || configs.new
  }

  const clearFilters = () => {
    setStatusFilter("")
    setPriorityFilter("")
  }

  // ==================== RENDER ====================

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-6 p-4 lg:p-6">
            
            {/* ==================== HEADER ==================== */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                {isLoadingProfile ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-6 w-48" />
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold">
                      Welcome, {profile?.name || "Technician"}
                    </h1>
                    <div className="flex items-center gap-3 mt-2">
                      {profile?.team_color && (
                        <Badge
                          style={{ backgroundColor: profile.team_color }}
                          className="text-white"
                        >
                          <Users className="h-3 w-3 mr-1" />
                          {profile.team_name}
                        </Badge>
                      )}
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {profile?.department_name}
                      </span>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => { fetchMyRequests(); fetchTeamRequests(); fetchStats(); }}>
                  Refresh
                </Button>
              </div>
            </div>

            {/* ==================== STATS CARDS ==================== */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {isLoadingStats ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-8 w-12" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                <>
                  <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-medium">
                        <Wrench className="h-4 w-4" />
                        My Requests
                      </div>
                      <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                        {stats?.total_assigned || 0}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-sm font-medium">
                        <Play className="h-4 w-4" />
                        In Progress
                      </div>
                      <div className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                        {stats?.in_progress || 0}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
                        <CheckCircle2 className="h-4 w-4" />
                        Completed
                      </div>
                      <div className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
                        {stats?.completed || 0}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={`border-red-200 bg-red-50 dark:bg-red-950/20 ${(stats?.critical_pending || 0) > 0 ? 'ring-2 ring-red-400 animate-pulse' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium">
                        <AlertCircle className="h-4 w-4" />
                        Critical
                      </div>
                      <div className="text-2xl font-bold text-red-900 dark:text-red-100 mt-1">
                        {stats?.critical_pending || 0}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={`border-orange-200 bg-orange-50 dark:bg-orange-950/20 ${(stats?.overdue || 0) > 0 ? 'ring-2 ring-orange-400' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 text-sm font-medium">
                        <AlertTriangle className="h-4 w-4" />
                        Overdue
                      </div>
                      <div className="text-2xl font-bold text-orange-900 dark:text-orange-100 mt-1">
                        {stats?.overdue || 0}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-teal-200 bg-teal-50 dark:bg-teal-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 text-sm font-medium">
                        <Timer className="h-4 w-4" />
                        Avg Time
                      </div>
                      <div className="text-2xl font-bold text-teal-900 dark:text-teal-100 mt-1">
                        {stats?.avg_resolution_hours ? `${stats.avg_resolution_hours}h` : "-"}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* ==================== TABS ==================== */}
            <Tabs defaultValue="kanban" className="w-full">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <TabsList>
                  <TabsTrigger value="kanban" className="flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4" />
                    Kanban Board
                  </TabsTrigger>
                  <TabsTrigger value="my-requests" className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    My Requests ({myRequestsPagination.total || 0})
                  </TabsTrigger>
                  <TabsTrigger value="team-requests" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Available Team Requests ({teamRequestsPagination.total || 0})
                  </TabsTrigger>
                </TabsList>

                {/* Filters */}
                <div className="flex items-center gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="repaired">Repaired</SelectItem>
                      <SelectItem value="scrap">Scrap</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="critical">🔴 Critical</SelectItem>
                      <SelectItem value="high">🟠 High</SelectItem>
                      <SelectItem value="medium">🟡 Medium</SelectItem>
                      <SelectItem value="low">🟢 Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear
                  </Button>
                </div>
              </div>

              {/* ==================== KANBAN BOARD TAB ==================== */}
              <TabsContent value="kanban" className="space-y-4">
                <KanbanBoard
                  requests={myRequests}
                  loading={isLoadingMyRequests}
                  onStatusChange={handleKanbanStatusChange}
                  onRefresh={refreshAllData}
                />
              </TabsContent>

              {/* ==================== MY REQUESTS TAB ==================== */}
              <TabsContent value="my-requests" className="space-y-4">
                {isLoadingMyRequests ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-6">
                          <Skeleton className="h-6 w-3/4 mb-4" />
                          <Skeleton className="h-4 w-1/2 mb-2" />
                          <Skeleton className="h-4 w-1/3" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : myRequests.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Requests Assigned</h3>
                      <p className="text-muted-foreground">
                        You don't have any requests assigned to you yet. Check the "Available Team Requests" tab to accept new requests.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  myRequests.map((request) => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      type="my"
                      onStartWork={() => startWork(request.id)}
                      onComplete={() => setCompletingRequest(request)}
                      onViewDetails={() => router.push(`/dashboard/requests/${request.id}`)}
                      getPriorityConfig={getPriorityConfig}
                      getStatusConfig={getStatusConfig}
                    />
                  ))
                )}
              </TabsContent>

              {/* ==================== TEAM REQUESTS TAB ==================== */}
              <TabsContent value="team-requests" className="space-y-4">
                {isLoadingTeamRequests ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-6">
                          <Skeleton className="h-6 w-3/4 mb-4" />
                          <Skeleton className="h-4 w-1/2 mb-2" />
                          <Skeleton className="h-4 w-1/3" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : teamRequests.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Available Requests</h3>
                      <p className="text-muted-foreground">
                        There are no unassigned requests available for your team at the moment.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  teamRequests.map((request) => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      type="team"
                      onAccept={() => acceptRequest(request.id)}
                      onViewDetails={() => router.push(`/dashboard/requests/${request.id}`)}
                      getPriorityConfig={getPriorityConfig}
                      getStatusConfig={getStatusConfig}
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SidebarInset>

      {/* ==================== COMPLETE WORK DIALOG ==================== */}
      <Dialog open={!!completingRequest} onOpenChange={() => setCompletingRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Request</DialogTitle>
            <DialogDescription>
              You are completing request #{completingRequest?.id}: {completingRequest?.subject}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Time Spent (hours)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="e.g., 2.5"
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                step="0.5"
                min="0.5"
              />
              <p className="text-xs text-muted-foreground">
                Enter the total hours spent on this maintenance request
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompletingRequest(null)}>
              Cancel
            </Button>
            <Button
              onClick={completeWork}
              disabled={!durationHours || isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Completing..." : "Complete Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}

// ==================== REQUEST CARD COMPONENT ====================

interface RequestCardProps {
  request: TechnicianRequest
  type: "my" | "team"
  onStartWork?: () => void
  onComplete?: () => void
  onAccept?: () => void
  onViewDetails: () => void
  getPriorityConfig: (priority: string) => { color: string; icon: string; bgColor: string; borderColor: string }
  getStatusConfig: (status: string) => { color: string; bgColor: string; label: string }
}

function RequestCard({
  request,
  type,
  onStartWork,
  onComplete,
  onAccept,
  onViewDetails,
  getPriorityConfig,
  getStatusConfig,
}: RequestCardProps) {
  const priorityConfig = getPriorityConfig(request.priority)
  const statusConfig = getStatusConfig(request.status)

  return (
    <Card className={`border-l-4 ${priorityConfig.borderColor} hover:shadow-md transition-shadow`}>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          {/* Main Content */}
          <div className="flex-1 space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3">
              <span className="text-lg font-bold text-muted-foreground">#{request.id}</span>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{request.subject}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {request.is_overdue === 1 && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      OVERDUE
                    </Badge>
                  )}
                  <Badge className={`${priorityConfig.bgColor} ${priorityConfig.color} border-0`}>
                    {priorityConfig.icon} {request.priority}
                  </Badge>
                  <Badge className={`${statusConfig.bgColor} ${statusConfig.color} border-0`}>
                    {statusConfig.label}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {request.type}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-1">
                  <Wrench className="h-3 w-3" />
                  Equipment
                </div>
                <div className="font-medium">{request.equipment_name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {request.equipment_location}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  Category
                </div>
                <div className="font-medium">{request.category_name}</div>
                <div className="text-xs text-muted-foreground">{request.category_company}</div>
              </div>

              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {type === "my" ? "Requested By" : "Requested By"}
                </div>
                <div className="font-medium">{request.created_by_name}</div>
              </div>

              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {request.scheduled_date ? "Scheduled" : "Created"}
                </div>
                <div className="font-medium">
                  {request.scheduled_date
                    ? new Date(request.scheduled_date).toLocaleDateString()
                    : new Date(request.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Description */}
            {request.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {request.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-row lg:flex-col gap-2 lg:min-w-[140px]">
            {type === "my" && (
              <>
                {request.status === "new" && onStartWork && (
                  <Button onClick={onStartWork} className="w-full bg-blue-600 hover:bg-blue-700">
                    <Play className="h-4 w-4 mr-2" />
                    Start Work
                  </Button>
                )}
                {request.status === "in_progress" && onComplete && (
                  <Button onClick={onComplete} className="w-full bg-green-600 hover:bg-green-700">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Complete
                  </Button>
                )}
              </>
            )}

            {type === "team" && onAccept && (
              <Button onClick={onAccept} className="w-full bg-green-600 hover:bg-green-700">
                <Hand className="h-4 w-4 mr-2" />
                Accept
              </Button>
            )}

            <Button variant="outline" onClick={onViewDetails} className="w-full">
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
