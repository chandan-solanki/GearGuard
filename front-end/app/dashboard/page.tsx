"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

interface MaintenanceRequest {
  id: number
  subject: string
  type: string
  description: string
  equipment_id: number
  equipment_name: string
  serial_number: string
  department_id: number
  department_name: string
  team_id: number
  team_name: string
  technician_id: number | null
  technician_name: string | null
  scheduled_date: string
  duration_hours: string
  status: string
  created_by: number
  created_by_name: string
  created_at: string
  updated_at: string
  is_overdue: number
}

interface ApiResponse {
  success: boolean
  message?: string
  data: MaintenanceRequest[]
  pagination: {
    total: number
    limit: number
    offset: number
  }
}

interface DashboardStats {
  criticalEquipment: number
  technicianLoad: number
  totalTechnicians: number
  assignedTechnicians: number
  openRequests: number
  overdueRequests: number
}

export default function Page() {
  const router = useRouter()
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({ total: 0, limit: 20, offset: 0 })
  const [filters, setFilters] = useState({ status: "", search: "" })
  const [stats, setStats] = useState<DashboardStats>({
    criticalEquipment: 0,
    technicianLoad: 0,
    totalTechnicians: 0,
    assignedTechnicians: 0,
    openRequests: 0,
    overdueRequests: 0,
  })

  const fetchRequests = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const accessToken = localStorage.getItem("accessToken")
      
      if (!accessToken) {
        const errorMsg = "Please login to view maintenance requests"
        setError(errorMsg)
        toast.error(errorMsg)
        setIsLoading(false)
        return
      }

      const queryParams = new URLSearchParams({
        limit: "20",
        offset: "0",
      })

      if (filters.status) {
        queryParams.append("status", filters.status)
      }

      console.log("Fetching requests from:", `http://localhost:3001/api/requests?${queryParams}`)

      const response = await fetch(
        `http://localhost:3001/api/requests?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      const data: ApiResponse = await response.json()
      console.log("API Response:", data)

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch requests")
      }

      if (data.success && data.data && Array.isArray(data.data)) {
        setRequests(data.data)
        setPagination(data.pagination)
        console.log(`Loaded ${data.data.length} requests`)
      } else {
        throw new Error("Invalid response format")
      }
    } catch (error: any) {
      console.error("Error fetching requests:", error)
      const errorMsg = error.message || "Failed to load maintenance requests"
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDashboardStats = async () => {
    setIsLoadingStats(true)
    try {
      const accessToken = localStorage.getItem("accessToken")
      if (!accessToken) return

      // Fetch critical equipment (health < 30%)
      const criticalEquipmentRes = await fetch(
        "http://localhost:3001/api/equipment?health_max=30",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      const criticalData = await criticalEquipmentRes.json()

      // Fetch open requests (new + in_progress)
      const openRequestsRes = await fetch(
        "http://localhost:3001/api/requests?status=new",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      const openData = await openRequestsRes.json()

      const inProgressRes = await fetch(
        "http://localhost:3001/api/requests?status=in_progress",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      const inProgressData = await inProgressRes.json()

      // Fetch overdue requests
      const overdueRes = await fetch(
        "http://localhost:3001/api/requests?overdue=true",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      const overdueData = await overdueRes.json()

      // Fetch team stats for technician load
      const teamStatsRes = await fetch(
        "http://localhost:3001/api/requests/stats/team",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      const teamStatsData = await teamStatsRes.json()

      // Calculate technician load from team stats
      let totalTechnicians = 0
      let inProgressCount = 0
      if (teamStatsData.success && teamStatsData.data) {
        teamStatsData.data.forEach((team: any) => {
          totalTechnicians += team.technician_count || 0
          inProgressCount += team.in_progress || 0
        })
      }
      const technicianLoad = totalTechnicians > 0 
        ? Math.round((inProgressCount / totalTechnicians) * 100) 
        : 0

      const openCount = (openData.pagination?.total || 0) + (inProgressData.pagination?.total || 0)
      const overdueCount = overdueData.pagination?.total || 0

      setStats({
        criticalEquipment: criticalData.pagination?.total || (criticalData.data?.length || 0),
        technicianLoad,
        totalTechnicians,
        assignedTechnicians: inProgressCount,
        openRequests: openCount,
        overdueRequests: overdueCount,
      })
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  useEffect(() => {
    fetchRequests()
    fetchDashboardStats()
  }, [])

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; label: string }> = {
      new: { variant: "default", label: "New" },
      in_progress: { variant: "secondary", label: "In Progress" },
      repaired: { variant: "outline", label: "Repaired" },
      scrap: { variant: "destructive", label: "Scrap" },
    }

    const config = statusConfig[status] || { variant: "default", label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getTypeBadge = (type: string) => {
    return type === "preventive" ? (
      <Badge variant="secondary">Preventive</Badge>
    ) : (
      <Badge variant="outline">Corrective</Badge>
    )
  }
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-6 p-4 lg:p-6">
            {/* Navigation Tabs */}
            <Tabs defaultValue="dashboard" className="w-full">
              <div className="flex items-center justify-between gap-4 mb-4">
                <TabsList>
                  <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  <TabsTrigger value="calendar">Maintenance Calendar</TabsTrigger>
                  <TabsTrigger value="equipment">Equipment</TabsTrigger>
                  <TabsTrigger value="reporting">Reporting</TabsTrigger>
                  <TabsTrigger value="teams">Teams</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="dashboard" className="space-y-6">
                {/* Action Bar */}
                <div className="flex items-center gap-4">
                  <Button onClick={() => router.push("/dashboard/requests/new")}>New</Button>
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search..."
                      className="pl-8"
                    />
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
                    <CardHeader>
                      <CardTitle className="text-red-900 dark:text-red-100">Critical Equipment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingStats ? (
                        <Skeleton className="h-10 w-24" />
                      ) : (
                        <>
                          <div className="text-3xl font-bold text-red-900 dark:text-red-100">
                            {stats.criticalEquipment} Units
                          </div>
                          <CardDescription className="text-red-700 dark:text-red-300">
                            (Health &lt; 30%)
                          </CardDescription>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                    <CardHeader>
                      <CardTitle className="text-blue-900 dark:text-blue-100">Technician Load</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingStats ? (
                        <Skeleton className="h-10 w-32" />
                      ) : (
                        <>
                          <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                            {stats.technicianLoad}% Utilized
                          </div>
                          <CardDescription className="text-blue-700 dark:text-blue-300">
                            ({stats.assignedTechnicians}/{stats.totalTechnicians} Active)
                          </CardDescription>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
                    <CardHeader>
                      <CardTitle className="text-green-900 dark:text-green-100">Open Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingStats ? (
                        <Skeleton className="h-10 w-28" />
                      ) : (
                        <>
                          <div className="text-3xl font-bold text-green-900 dark:text-green-100">
                            {stats.openRequests} Pending
                          </div>
                          <CardDescription className="text-green-700 dark:text-green-300">
                            {stats.overdueRequests} Overdue
                          </CardDescription>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Data Table */}
                <Card>
                  <CardContent className="p-0">
                    {isLoading ? (
                      <div className="p-6 space-y-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    ) : error ? (
                      <div className="p-12 text-center">
                        <div className="text-destructive font-medium mb-2">Error Loading Data</div>
                        <div className="text-sm text-muted-foreground mb-4">{error}</div>
                        <Button onClick={fetchRequests} variant="outline">Retry</Button>
                      </div>
                    ) : requests.length === 0 ? (
                      <div className="p-12 text-center text-muted-foreground">
                        No maintenance requests found
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Equipment</TableHead>
                            <TableHead>Serial No.</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Team</TableHead>
                            <TableHead>Technician</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created By</TableHead>
                            <TableHead>Scheduled Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {requests.map((request) => (
                            <TableRow 
                              key={request.id} 
                              className={`cursor-pointer hover:bg-muted/50 ${request.is_overdue ? "bg-red-50 dark:bg-red-950/20" : ""}`}
                              onClick={() => router.push(`/dashboard/requests/${request.id}`)}
                            >
                              <TableCell className="font-medium">
                                #{request.id}
                                {request.is_overdue === 1 && (
                                  <Badge variant="destructive" className="ml-2 text-xs">Overdue</Badge>
                                )}
                              </TableCell>
                              <TableCell className="font-medium">{request.subject}</TableCell>
                              <TableCell>{getTypeBadge(request.type)}</TableCell>
                              <TableCell>{request.equipment_name}</TableCell>
                              <TableCell className="text-muted-foreground text-sm">{request.serial_number}</TableCell>
                              <TableCell>{request.department_name}</TableCell>
                              <TableCell>{request.team_name}</TableCell>
                              <TableCell>
                                {request.technician_name || (
                                  <span className="text-muted-foreground">Unassigned</span>
                                )}
                              </TableCell>
                              <TableCell>{getStatusBadge(request.status)}</TableCell>
                              <TableCell>{request.created_by_name}</TableCell>
                              <TableCell className="text-sm">
                                {new Date(request.scheduled_date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                {/* Pagination Info */}
                {!isLoading && requests.length > 0 && (
                  <div className="text-sm text-muted-foreground text-center">
                    Showing {requests.length} of {pagination.total} requests
                  </div>
                )}
              </TabsContent>

              <TabsContent value="maintenance">
                <div className="text-center py-12 text-muted-foreground">
                  Maintenance content coming soon...
                </div>
              </TabsContent>

              <TabsContent value="calendar">
                <div className="text-center py-12 text-muted-foreground">
                  Calendar content coming soon...
                </div>
              </TabsContent>

              <TabsContent value="equipment">
                <div className="text-center py-12 text-muted-foreground">
                  Equipment content coming soon...
                </div>
              </TabsContent>

              <TabsContent value="reporting">
                <div className="text-center py-12 text-muted-foreground">
                  Reporting content coming soon...
                </div>
              </TabsContent>

              <TabsContent value="teams">
                <div className="text-center py-12 text-muted-foreground">
                  Teams content coming soon...
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
