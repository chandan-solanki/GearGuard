"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { ArrowLeft, Calendar, Clock, User, Wrench } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface RequestDetail {
  id: number
  subject: string
  type: string
  priority: string
  description: string
  equipment_id: number
  equipment_name: string
  serial_number: string
  category_name: string
  category_responsible: string
  category_company: string
  department_id: number
  department_name: string
  team_id: number
  team_name: string
  technician_id: number | null
  technician_name: string | null
  technician_email: string | null
  scheduled_date: string
  duration_hours: string
  status: string
  created_by: number
  created_by_name: string
  created_by_email: string
  created_at: string
  updated_at: string
  is_overdue: number
}

interface ApiResponse {
  success: boolean
  message?: string
  data: RequestDetail
}

export default function RequestDetailPage() {
  const router = useRouter()
  const params = useParams()
  const requestId = params.id as string

  const [request, setRequest] = useState<RequestDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRequestDetail()
  }, [requestId])

  const fetchRequestDetail = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const accessToken = localStorage.getItem("accessToken")
      
      if (!accessToken) {
        toast.error("Please login to view request details")
        router.push("/signin")
        return
      }

      const response = await fetch(
        `http://localhost:3001/api/requests/${requestId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      const data: ApiResponse = await response.json()
      console.log("Request Detail Response:", data)

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch request details")
      }

      setRequest(data.data)
    } catch (error: any) {
      setError(error.message || "Failed to load request details")
      toast.error(error.message || "Failed to load request details")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; label: string }> = {
      new: { variant: "default", label: "New Request" },
      in_progress: { variant: "secondary", label: "In Progress" },
      repaired: { variant: "outline", label: "Repaired" },
      scrap: { variant: "destructive", label: "Scrap" },
    }

    const config = statusConfig[status] || { variant: "default", label: status }
    return <Badge variant={config.variant} className="text-sm">{config.label}</Badge>
  }

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col p-4 lg:p-6">
            <Skeleton className="h-8 w-64 mb-6" />
            <Skeleton className="h-96 w-full" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (error || !request) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col items-center justify-center p-4">
            <div className="text-destructive font-medium mb-2">Error Loading Request</div>
            <div className="text-sm text-muted-foreground mb-4">{error}</div>
            <Button onClick={() => router.back()} variant="outline">Go Back</Button>
          </div>
        </SidebarInset>
      </SidebarProvider>
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
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold">Maintenance Requests</h1>
                    {getStatusBadge(request.status)}
                    {request.is_overdue === 1 && (
                      <Badge variant="destructive">Overdue</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{request.subject}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Worksheet</Button>
                <Button variant="outline">Edit</Button>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left Column */}
              <Card className="shadow-sm">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-base font-semibold">Request Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="pb-4 border-b">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Subject</Label>
                    <div className="text-xl font-semibold mt-2">{request.subject}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-muted/30 border">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Created By</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{request.created_by_name}</div>
                          <div className="text-xs text-muted-foreground">{request.created_by_email}</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 border">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Request Date</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="font-medium">
                          {new Date(request.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Maintenance For</Label>
                    <div className="mt-3">
                      <div className="flex items-center gap-2 p-3 border-2 border-primary/20 rounded-lg bg-primary/5 hover:border-primary/40 transition-colors">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Wrench className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-base">{request.equipment_name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="font-mono">{request.serial_number}</span>
                            <span className="text-xs">•</span>
                            <span>{request.category_name}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Category</Label>
                    <Input value={request.category_name} readOnly className="mt-2 font-medium" />
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Department</Label>
                    <Input value={request.department_name} readOnly className="mt-2 font-medium" />
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 block">Maintenance Type</Label>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                          request.type === 'corrective' 
                            ? 'border-primary bg-primary' 
                            : 'border-muted-foreground/30'
                        }`}>
                          {request.type === 'corrective' && (
                            <div className="h-2.5 w-2.5 rounded-full bg-white" />
                          )}
                        </div>
                        <span className={request.type === 'corrective' ? 'font-semibold' : 'text-muted-foreground'}>
                          Corrective
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                          request.type === 'preventive' 
                            ? 'border-primary bg-primary' 
                            : 'border-muted-foreground/30'
                        }`}>
                          {request.type === 'preventive' && (
                            <div className="h-2.5 w-2.5 rounded-full bg-white" />
                          )}
                        </div>
                        <span className={request.type === 'preventive' ? 'font-semibold' : 'text-muted-foreground'}>
                          Preventive
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Right Column */}
              <Card className="shadow-sm">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-base font-semibold">Assignment & Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Team</Label>
                    <Input value={request.team_name} readOnly className="mt-2 font-medium" />
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Technician</Label>
                    {request.technician_name ? (
                      <div className="mt-2 p-3 rounded-lg bg-muted/30 border">
                        <div className="font-medium">{request.technician_name}</div>
                        <div className="text-xs text-muted-foreground mt-1">{request.technician_email}</div>
                      </div>
                    ) : (
                      <div className="mt-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                        <span className="text-amber-700 dark:text-amber-400 font-medium">Unassigned</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Scheduled Date</Label>
                    <div className="mt-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium text-blue-900 dark:text-blue-100">
                          {new Date(request.scheduled_date).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Duration</Label>
                    <div className="mt-2 p-3 rounded-lg bg-muted/30 border">
                      <span className="font-semibold text-lg">{request.duration_hours}</span>
                      <span className="text-muted-foreground ml-1">hours</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Priority</Label>
                    <div className="flex gap-2 mt-2">
                      <div 
                        className={`h-10 w-10 rounded-md border-2 flex items-center justify-center transition-all ${
                          request.priority === 'low' 
                            ? 'bg-green-100 border-green-500 dark:bg-green-950 dark:border-green-600' 
                            : 'border-muted-foreground/30 hover:border-muted-foreground/50'
                        }`}
                        title="Low Priority"
                      >
                        {request.priority === 'low' && (
                          <div className="h-5 w-5 rounded-sm bg-green-500" />
                        )}
                      </div>
                      <div 
                        className={`h-10 w-10 rounded-md border-2 flex items-center justify-center transition-all ${
                          request.priority === 'medium' 
                            ? 'bg-amber-100 border-amber-500 dark:bg-amber-950 dark:border-amber-600' 
                            : 'border-muted-foreground/30 hover:border-muted-foreground/50'
                        }`}
                        title="Medium Priority"
                      >
                        {request.priority === 'medium' && (
                          <div className="h-5 w-5 rounded-sm bg-amber-500" />
                        )}
                      </div>
                      <div 
                        className={`h-10 w-10 rounded-md border-2 flex items-center justify-center transition-all ${
                          request.priority === 'high' 
                            ? 'bg-red-100 border-red-500 dark:bg-red-950 dark:border-red-600' 
                            : 'border-muted-foreground/30 hover:border-muted-foreground/50'
                        }`}
                        title="High Priority"
                      >
                        {request.priority === 'high' && (
                          <div className="h-5 w-5 rounded-sm bg-red-500" />
                        )}
                      </div>
                    </div>
                    <div className={`text-sm font-medium mt-2 capitalize ${
                      request.priority === 'high' ? 'text-red-600 dark:text-red-400' :
                      request.priority === 'medium' ? 'text-amber-600 dark:text-amber-400' :
                      'text-green-600 dark:text-green-400'
                    }`}>
                      {request.priority} Priority
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Company</Label>
                    <Input 
                      value={request.category_company} 
                      readOnly 
                      className="mt-2 font-medium"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notes & Instructions */}
            <Card>
              <CardHeader>
                <Tabs defaultValue="notes" className="w-full">
                  <TabsList>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                    <TabsTrigger value="instructions">Instructions</TabsTrigger>
                  </TabsList>
                  <TabsContent value="notes" className="mt-4">
                    <Textarea 
                      placeholder="Add notes..." 
                      className="min-h-32"
                      value={request.description}
                      readOnly
                    />
                  </TabsContent>
                  <TabsContent value="instructions" className="mt-4">
                    <Textarea 
                      placeholder="Add instructions..." 
                      className="min-h-32"
                      readOnly
                    />
                  </TabsContent>
                </Tabs>
              </CardHeader>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
