"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { ArrowLeft, Building2, MapPin, Package, Users, Wrench, AlertCircle, CheckCircle2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Equipment {
  id: number
  name: string
  serial_number: string
  category_id: number
  category_name: string
  category_responsible: string
  category_company: string
  department_id: number
  department_name: string
  team_id: number
  team_name: string
  location?: string
  status: string
}

interface Technician {
  id: number
  name: string
  email: string
  team_id: number
  team_name: string
}

interface FormData {
  equipment_id: number | null
  subject: string
  type: "corrective" | "preventive"
  priority: "critical" | "high" | "medium" | "low"
  description: string
  scheduled_date: string
  technician_id: number | null
}

export default function CreateRequestPage() {
  const router = useRouter()
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([])
  const [technicianList, setTechnicianList] = useState<Technician[]>([])
  const [filteredTechnicians, setFilteredTechnicians] = useState<Technician[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [isLoadingEquipment, setIsLoadingEquipment] = useState(true)
  const [isLoadingTechnicians, setIsLoadingTechnicians] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showEquipmentDetails, setShowEquipmentDetails] = useState(true)

  const [formData, setFormData] = useState<FormData>({
    equipment_id: null,
    subject: "",
    type: "corrective",
    priority: "medium",
    description: "",
    scheduled_date: getDefaultScheduledDate(),
    technician_id: null,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  function getDefaultScheduledDate() {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0)
    return tomorrow.toISOString().slice(0, 16)
  }

  useEffect(() => {
    fetchEquipment()
    fetchTechnicians()
  }, [])

  useEffect(() => {
    if (selectedEquipment && technicianList.length > 0) {
      const filtered = technicianList.filter(
        (tech) => tech.team_id === selectedEquipment.team_id
      )
      setFilteredTechnicians(filtered)
    } else {
      setFilteredTechnicians([])
    }
  }, [selectedEquipment, technicianList])

  const fetchEquipment = async () => {
    setIsLoadingEquipment(true)
    try {
      const accessToken = localStorage.getItem("accessToken")
      const response = await fetch("http://localhost:3001/api/equipment?status=active", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const data = await response.json()
      if (data.success) {
        setEquipmentList(data.data)
      }
    } catch (error) {
      toast.error("Failed to load equipment")
    } finally {
      setIsLoadingEquipment(false)
    }
  }

  const fetchTechnicians = async () => {
    setIsLoadingTechnicians(true)
    try {
      const accessToken = localStorage.getItem("accessToken")
      const response = await fetch("http://localhost:3001/api/technicians", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const data = await response.json()
      if (data.success) {
        setTechnicianList(data.data)
      }
    } catch (error) {
      toast.error("Failed to load technicians")
    } finally {
      setIsLoadingTechnicians(false)
    }
  }

  const handleEquipmentChange = (equipmentId: string) => {
    const equipment = equipmentList.find((e) => e.id === parseInt(equipmentId))
    setSelectedEquipment(equipment || null)
    setFormData((prev) => ({
      ...prev,
      equipment_id: parseInt(equipmentId),
      technician_id: null,
    }))
    setErrors((prev) => ({ ...prev, equipment_id: "" }))
  }

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.equipment_id) {
      newErrors.equipment_id = "Please select equipment"
    }
    if (!formData.subject || formData.subject.length < 10) {
      newErrors.subject = "Subject must be at least 10 characters"
    }
    if (formData.subject.length > 255) {
      newErrors.subject = "Subject must not exceed 255 characters"
    }
    if (formData.description.length > 1000) {
      newErrors.description = "Description must not exceed 1000 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Please fix the form errors")
      return
    }

    setIsSubmitting(true)
    try {
      const accessToken = localStorage.getItem("accessToken")
      const response = await fetch("http://localhost:3001/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          equipment_id: formData.equipment_id,
          subject: formData.subject,
          type: formData.type,
          priority: formData.priority,
          description: formData.description || null,
          scheduled_date: formData.scheduled_date || null,
          technician_id: formData.technician_id || null,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create request")
      }

      toast.success("Maintenance request created successfully!")
      router.push("/dashboard")
    } catch (error: any) {
      toast.error(error.message || "Failed to create request")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPriorityBadge = (priority: string) => {
    const configs = {
      critical: { color: "bg-red-100 text-red-700 border-red-300", icon: "🔴", label: "Critical" },
      high: { color: "bg-orange-100 text-orange-700 border-orange-300", icon: "🟠", label: "High" },
      medium: { color: "bg-yellow-100 text-yellow-700 border-yellow-300", icon: "🟡", label: "Medium" },
      low: { color: "bg-green-100 text-green-700 border-green-300", icon: "🟢", label: "Low" },
    }
    const config = configs[priority as keyof typeof configs]
    return (
      <div className={`px-3 py-1.5 rounded-md border ${config.color} text-sm font-medium`}>
        {config.icon} {config.label}
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-6 p-4 lg:p-6 max-w-5xl mx-auto w-full">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Create Maintenance Request</h1>
                <p className="text-muted-foreground mt-1">
                  Submit a new maintenance request for equipment repair or preventive maintenance
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Equipment Selector */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Equipment Selection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="equipment" className="text-sm font-medium">
                      Select Equipment <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.equipment_id?.toString()}
                      onValueChange={handleEquipmentChange}
                      disabled={isLoadingEquipment}
                    >
                      <SelectTrigger className={`mt-2 ${errors.equipment_id ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Search and select equipment..." />
                      </SelectTrigger>
                      <SelectContent>
                        {equipmentList.map((equipment) => (
                          <SelectItem key={equipment.id} value={equipment.id.toString()}>
                            {equipment.name} - {equipment.serial_number}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.equipment_id && (
                      <p className="text-sm text-red-500 mt-1">{errors.equipment_id}</p>
                    )}
                  </div>

                  {/* Equipment Details Card */}
                  {selectedEquipment && (
                    <Card className="border-2 border-primary/20 bg-primary/5">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            Selected Equipment Information
                          </CardTitle>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowEquipmentDetails(!showEquipmentDetails)}
                          >
                            {showEquipmentDetails ? "Hide" : "Show"}
                          </Button>
                        </div>
                      </CardHeader>
                      {showEquipmentDetails && (
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs text-muted-foreground font-medium uppercase">Equipment</div>
                              <div className="font-semibold mt-1">{selectedEquipment.name}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground font-medium uppercase">Serial Number</div>
                              <div className="font-mono mt-1">{selectedEquipment.serial_number}</div>
                            </div>
                          </div>

                          {selectedEquipment.location && (
                            <div className="flex items-start gap-2 p-2 rounded bg-background/50">
                              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div>
                                <div className="text-xs text-muted-foreground">Location</div>
                                <div className="text-sm">{selectedEquipment.location}</div>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
                            <div className="flex items-start gap-2">
                              <Package className="h-4 w-4 text-primary mt-0.5" />
                              <div>
                                <div className="text-xs text-muted-foreground">Category</div>
                                <div className="font-medium text-sm">{selectedEquipment.category_name}</div>
                                <div className="text-xs text-muted-foreground">{selectedEquipment.category_responsible}</div>
                              </div>
                            </div>

                            <div className="flex items-start gap-2">
                              <Building2 className="h-4 w-4 text-blue-600 mt-0.5" />
                              <div>
                                <div className="text-xs text-muted-foreground">Department</div>
                                <div className="font-medium text-sm">{selectedEquipment.department_name}</div>
                              </div>
                            </div>

                            <div className="flex items-start gap-2">
                              <Users className="h-4 w-4 text-green-600 mt-0.5" />
                              <div>
                                <div className="text-xs text-muted-foreground">Team</div>
                                <div className="font-medium text-sm">{selectedEquipment.team_name}</div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t">
                            <div>
                              <div className="text-xs text-muted-foreground">Company</div>
                              <div className="font-medium text-sm">{selectedEquipment.category_company}</div>
                            </div>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                              🟢 Active
                            </Badge>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  )}
                </CardContent>
              </Card>

              {/* Request Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Request Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Subject */}
                  <div>
                    <Label htmlFor="subject" className="text-sm font-medium">
                      Subject <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      placeholder="Brief description (e.g., 'Hydraulic Press oil leak')"
                      maxLength={255}
                      className={`mt-2 ${errors.subject ? "border-red-500" : ""}`}
                    />
                    <div className="flex justify-between mt-1">
                      {errors.subject ? (
                        <p className="text-sm text-red-500">{errors.subject}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground">Minimum 10 characters required</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formData.subject.length}/255
                      </p>
                    </div>
                  </div>

                  {/* Type */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">
                      Maintenance Type <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => handleInputChange("type", "corrective")}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          formData.type === "corrective"
                            ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                            : "border-muted hover:border-orange-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-2xl">🔧</div>
                          <div className="font-semibold">Corrective</div>
                          {formData.type === "corrective" && (
                            <Badge className="ml-auto bg-orange-500">Selected</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Reactive repair for breakdowns or failures
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleInputChange("type", "preventive")}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          formData.type === "preventive"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                            : "border-muted hover:border-blue-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-2xl">🛡️</div>
                          <div className="font-semibold">Preventive</div>
                          {formData.type === "preventive" && (
                            <Badge className="ml-auto bg-blue-500">Selected</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Scheduled maintenance to prevent issues
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Priority */}
                  <div>
                    <Label htmlFor="priority" className="text-sm font-medium">
                      Priority <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => handleInputChange("priority", value)}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">
                          🔴 Critical - Immediate attention required (production stopped)
                        </SelectItem>
                        <SelectItem value="high">
                          🟠 High - Urgent repair needed (major impact)
                        </SelectItem>
                        <SelectItem value="medium">
                          🟡 Medium - Normal priority (default)
                        </SelectItem>
                        <SelectItem value="low">
                          🟢 Low - Can be scheduled flexibly
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="mt-2">{getPriorityBadge(formData.priority)}</div>
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="description" className="text-sm font-medium">
                      Description (Optional)
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Detailed description of the issue, symptoms observed, and any relevant information..."
                      rows={5}
                      maxLength={1000}
                      className={`mt-2 ${errors.description ? "border-red-500" : ""}`}
                    />
                    <div className="flex justify-between mt-1">
                      {errors.description ? (
                        <p className="text-sm text-red-500">{errors.description}</p>
                      ) : (
                        <span />
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formData.description.length}/1000
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Scheduling & Assignment */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Scheduling & Assignment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Scheduled Date */}
                  <div>
                    <Label htmlFor="scheduled_date" className="text-sm font-medium">
                      Scheduled Date & Time (Optional)
                    </Label>
                    <Input
                      id="scheduled_date"
                      type="datetime-local"
                      value={formData.scheduled_date}
                      onChange={(e) => handleInputChange("scheduled_date", e.target.value)}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Default: Tomorrow at 9:00 AM
                    </p>
                  </div>

                  {/* Technician Assignment */}
                  <div>
                    <Label htmlFor="technician" className="text-sm font-medium">
                      Assign Technician (Optional)
                    </Label>
                    <Select
                      value={formData.technician_id?.toString()}
                      onValueChange={(value) => handleInputChange("technician_id", parseInt(value))}
                      disabled={!selectedEquipment || filteredTechnicians.length === 0}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder={
                          !selectedEquipment 
                            ? "Select equipment first" 
                            : filteredTechnicians.length === 0
                            ? "No technicians available for this team"
                            : "Select a technician or leave blank"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredTechnicians.map((tech) => (
                          <SelectItem key={tech.id} value={tech.id.toString()}>
                            {tech.name} - {tech.team_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedEquipment
                        ? `Showing technicians from ${selectedEquipment.team_name}`
                        : "Technicians will be filtered based on equipment's team"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Form Actions */}
              <Card className="border-2">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Creating...
                        </>
                      ) : (
                        "Create Maintenance Request"
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    <AlertCircle className="h-3 w-3 inline mr-1" />
                    Make sure all required fields are filled before submitting
                  </p>
                </CardContent>
              </Card>
            </form>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
