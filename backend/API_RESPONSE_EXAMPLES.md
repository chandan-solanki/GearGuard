# 📦 API Response Examples for Frontend

Complete response examples from all GearGuard API endpoints.

---

## 🔐 Authentication Responses

### POST /api/auth/register
**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 12,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "employee"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /api/auth/login
**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@gearguard.com",
      "role": "admin"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTYwOTQ1OTIwMCwiZXhwIjoxNjA5NTQ1NjAwfQ.abc123...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTYwOTQ1OTIwMCwiZXhwIjoxNjEwMDY0MDAwfQ.xyz789..."
  }
}
```

### GET /api/auth/profile
**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@gearguard.com",
    "role": "admin",
    "created_at": "2024-01-01T10:00:00.000Z",
    "updated_at": "2024-01-15T14:30:00.000Z"
  }
}
```

### POST /api/auth/refresh-token
**Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 👥 Users Responses

### GET /api/users
**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Admin User",
      "email": "admin@gearguard.com",
      "role": "admin",
      "created_at": "2024-01-01T10:00:00.000Z"
    },
    {
      "id": 2,
      "name": "John Smith",
      "email": "john@gearguard.com",
      "role": "manager",
      "created_at": "2024-01-05T09:30:00.000Z"
    },
    {
      "id": 3,
      "name": "Sarah Connor",
      "email": "sarah@gearguard.com",
      "role": "technician",
      "created_at": "2024-01-10T11:00:00.000Z"
    }
  ]
}
```

### GET /api/users/2
**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "John Smith",
    "email": "john@gearguard.com",
    "role": "manager",
    "created_at": "2024-01-05T09:30:00.000Z",
    "updated_at": "2024-01-05T09:30:00.000Z"
  }
}
```

### POST /api/users/3/assign-technician
**Response (200):**
```json
{
  "success": true,
  "message": "User assigned as technician successfully",
  "data": {
    "technician_id": 5,
    "user_id": 3,
    "team_id": 2,
    "name": "Sarah Connor",
    "email": "sarah@gearguard.com",
    "team_name": "Electrical Team"
  }
}
```

---

## 🏢 Departments Responses

### GET /api/departments
**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "IT Department",
      "description": "Information Technology and Systems",
      "created_at": "2024-01-01T08:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Manufacturing",
      "description": "Production and Manufacturing Equipment",
      "created_at": "2024-01-01T08:00:00.000Z"
    },
    {
      "id": 3,
      "name": "Facilities",
      "description": "Building Maintenance and Facilities",
      "created_at": "2024-01-01T08:00:00.000Z"
    }
  ]
}
```

### POST /api/departments
**Response (201):**
```json
{
  "success": true,
  "message": "Department created successfully",
  "data": {
    "id": 4,
    "name": "Quality Control",
    "description": "Quality assurance and testing"
  }
}
```

### GET /api/departments/2
**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Manufacturing",
    "description": "Production and Manufacturing Equipment",
    "created_at": "2024-01-01T08:00:00.000Z",
    "updated_at": "2024-01-01T08:00:00.000Z"
  }
}
```

---

## 👷 Teams Responses

### GET /api/teams
**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Mechanical Team",
      "department_id": 2,
      "department_name": "Manufacturing",
      "created_at": "2024-01-02T09:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Electrical Team",
      "department_id": 2,
      "department_name": "Manufacturing",
      "created_at": "2024-01-02T09:00:00.000Z"
    },
    {
      "id": 3,
      "name": "HVAC Team",
      "department_id": 3,
      "department_name": "Facilities",
      "created_at": "2024-01-02T09:00:00.000Z"
    }
  ]
}
```

### GET /api/teams/1/technicians
**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 5,
      "name": "Mike Johnson",
      "email": "mike@gearguard.com",
      "role": "technician",
      "team_id": 1,
      "team_name": "Mechanical Team"
    },
    {
      "id": 2,
      "user_id": 6,
      "name": "Lisa Anderson",
      "email": "lisa@gearguard.com",
      "role": "technician",
      "team_id": 1,
      "team_name": "Mechanical Team"
    }
  ]
}
```

---

## 🔧 Technicians Responses

### GET /api/technicians
**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 5,
      "name": "Mike Johnson",
      "email": "mike@gearguard.com",
      "role": "technician",
      "team_id": 1,
      "team_name": "Mechanical Team",
      "department_id": 2,
      "department_name": "Manufacturing"
    },
    {
      "id": 2,
      "user_id": 6,
      "name": "Lisa Anderson",
      "email": "lisa@gearguard.com",
      "role": "technician",
      "team_id": 1,
      "team_name": "Mechanical Team",
      "department_id": 2,
      "department_name": "Manufacturing"
    }
  ]
}
```

---

## 📦 Equipment Categories Responses

### GET /api/categories
**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Hydraulic Press",
      "responsible": "John Smith",
      "company_name": "HydroTech Industries",
      "description": "Heavy-duty hydraulic press machines",
      "created_at": "2024-01-01T08:00:00.000Z"
    },
    {
      "id": 2,
      "name": "CNC Machine",
      "responsible": "Sarah Johnson",
      "company_name": "PrecisionCorp",
      "description": "Computer Numerical Control machines",
      "created_at": "2024-01-01T08:00:00.000Z"
    },
    {
      "id": 3,
      "name": "HVAC System",
      "responsible": "Mike Davis",
      "company_name": "ClimateControl Ltd",
      "description": "Heating, Ventilation, and Air Conditioning systems",
      "created_at": "2024-01-01T08:00:00.000Z"
    }
  ]
}
```

### POST /api/categories
**Response (201):**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": 6,
    "name": "Robotics",
    "responsible": "Dr. Smith",
    "company_name": "RoboTech Inc",
    "description": "Industrial robots and automation"
  }
}
```

### GET /api/categories/1
**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Hydraulic Press",
    "responsible": "John Smith",
    "company_name": "HydroTech Industries",
    "description": "Heavy-duty hydraulic press machines",
    "equipment_count": 5,
    "created_at": "2024-01-01T08:00:00.000Z",
    "updated_at": "2024-01-01T08:00:00.000Z"
  }
}
```

### GET /api/categories/stats
**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Hydraulic Press",
      "responsible": "John Smith",
      "company_name": "HydroTech Industries",
      "equipment_count": 5
    },
    {
      "id": 2,
      "name": "CNC Machine",
      "responsible": "Sarah Johnson",
      "company_name": "PrecisionCorp",
      "equipment_count": 8
    },
    {
      "id": 3,
      "name": "HVAC System",
      "responsible": "Mike Davis",
      "company_name": "ClimateControl Ltd",
      "equipment_count": 12
    }
  ]
}
```

---

## 🏭 Equipment Responses

### GET /api/equipment
**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Hydraulic Press #1",
      "serial_number": "HP-2024-001",
      "category_id": 1,
      "category_name": "Hydraulic Press",
      "category_responsible": "John Smith",
      "category_company": "HydroTech Industries",
      "purchase_date": "2023-01-15T00:00:00.000Z",
      "warranty_end": "2026-01-15T00:00:00.000Z",
      "location": "Factory Floor A",
      "department_id": 2,
      "department_name": "Manufacturing",
      "team_id": 1,
      "team_name": "Mechanical Team",
      "status": "active",
      "created_at": "2024-01-01T10:00:00.000Z"
    },
    {
      "id": 2,
      "name": "CNC Machine #2",
      "serial_number": "CNC-2024-002",
      "category_id": 2,
      "category_name": "CNC Machine",
      "category_responsible": "Sarah Johnson",
      "category_company": "PrecisionCorp",
      "purchase_date": "2023-06-20T00:00:00.000Z",
      "warranty_end": "2026-06-20T00:00:00.000Z",
      "location": "Workshop B",
      "department_id": 2,
      "department_name": "Manufacturing",
      "team_id": 1,
      "team_name": "Mechanical Team",
      "status": "active",
      "created_at": "2024-01-01T10:00:00.000Z"
    }
  ]
}
```

### POST /api/equipment
**Response (201):**
```json
{
  "success": true,
  "message": "Equipment created successfully",
  "data": {
    "id": 15,
    "name": "Generator #3",
    "serial_number": "GEN-2024-003",
    "category_id": 4,
    "category_name": "Generator",
    "purchase_date": "2024-01-20T00:00:00.000Z",
    "location": "Building C",
    "department_id": 3,
    "department_name": "Facilities",
    "team_id": 3,
    "team_name": "HVAC Team",
    "status": "active"
  }
}
```

### GET /api/equipment/1
**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Hydraulic Press #1",
    "serial_number": "HP-2024-001",
    "category_id": 1,
    "category_name": "Hydraulic Press",
    "category_responsible": "John Smith",
    "category_company": "HydroTech Industries",
    "purchase_date": "2023-01-15T00:00:00.000Z",
    "warranty_end": "2026-01-15T00:00:00.000Z",
    "location": "Factory Floor A",
    "department_id": 2,
    "department_name": "Manufacturing",
    "team_id": 1,
    "team_name": "Mechanical Team",
    "status": "active",
    "created_at": "2024-01-01T10:00:00.000Z",
    "updated_at": "2024-01-01T10:00:00.000Z"
  }
}
```

### GET /api/equipment/1/requests
**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "subject": "Hydraulic Press making unusual noise",
      "type": "corrective",
      "status": "in_progress",
      "scheduled_date": "2024-01-20T09:00:00.000Z",
      "technician_name": "Mike Johnson",
      "created_at": "2024-01-18T14:30:00.000Z"
    },
    {
      "id": 3,
      "subject": "Quarterly maintenance",
      "type": "preventive",
      "status": "repaired",
      "scheduled_date": "2024-01-10T10:00:00.000Z",
      "technician_name": "Lisa Anderson",
      "duration_hours": "3.50",
      "created_at": "2024-01-08T09:00:00.000Z"
    }
  ]
}
```

---

## 🔨 Maintenance Requests Responses

### GET /api/requests
**Response (200):**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": 15,
        "subject": "CNC Machine spindle overheating",
        "type": "corrective",
        "description": "Spindle motor is overheating after 2 hours of operation",
        "equipment_id": 2,
        "equipment_name": "CNC Machine #2",
        "serial_number": "CNC-2024-002",
        "department_id": 2,
        "department_name": "Manufacturing",
        "team_id": 1,
        "team_name": "Mechanical Team",
        "technician_id": 1,
        "technician_name": "Mike Johnson",
        "scheduled_date": "2024-01-25T09:00:00.000Z",
        "duration_hours": "0.00",
        "status": "new",
        "created_by": 3,
        "created_by_name": "Sarah Connor",
        "is_overdue": 0,
        "created_at": "2024-01-23T11:30:00.000Z",
        "updated_at": "2024-01-23T11:30:00.000Z"
      },
      {
        "id": 14,
        "subject": "Hydraulic Press oil leak",
        "type": "corrective",
        "description": "Small oil leak detected under the press",
        "equipment_id": 1,
        "equipment_name": "Hydraulic Press #1",
        "serial_number": "HP-2024-001",
        "department_id": 2,
        "department_name": "Manufacturing",
        "team_id": 1,
        "team_name": "Mechanical Team",
        "technician_id": 2,
        "technician_name": "Lisa Anderson",
        "scheduled_date": "2024-01-24T14:00:00.000Z",
        "duration_hours": "2.50",
        "status": "in_progress",
        "created_by": 1,
        "created_by_name": "Admin User",
        "is_overdue": 0,
        "created_at": "2024-01-22T10:00:00.000Z",
        "updated_at": "2024-01-23T09:15:00.000Z"
      }
    ],
    "pagination": {
      "total": 25,
      "limit": 20,
      "offset": 0
    }
  }
}
```

### POST /api/requests
**Response (201):**
```json
{
  "success": true,
  "message": "Maintenance request created successfully",
  "data": {
    "id": 16,
    "subject": "HVAC filter replacement",
    "type": "preventive",
    "description": "Monthly HVAC filter replacement",
    "equipment_id": 3,
    "equipment_name": "HVAC Unit #1",
    "serial_number": "HVAC-2024-001",
    "category_name": "HVAC System",
    "category_responsible": "Mike Davis",
    "category_company": "ClimateControl Ltd",
    "department_id": 3,
    "department_name": "Facilities",
    "team_id": 3,
    "team_name": "HVAC Team",
    "technician_id": null,
    "technician_name": null,
    "scheduled_date": "2024-02-01T08:00:00.000Z",
    "duration_hours": "0.00",
    "status": "new",
    "created_by": 1,
    "created_by_name": "Admin User",
    "created_by_email": "admin@gearguard.com",
    "is_overdue": 0,
    "created_at": "2024-01-23T15:20:00.000Z",
    "updated_at": "2024-01-23T15:20:00.000Z"
  }
}
```

### GET /api/requests/15
**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "subject": "CNC Machine spindle overheating",
    "type": "corrective",
    "description": "Spindle motor is overheating after 2 hours of operation. Possibly faulty cooling system.",
    "equipment_id": 2,
    "equipment_name": "CNC Machine #2",
    "serial_number": "CNC-2024-002",
    "category_name": "CNC Machine",
    "category_responsible": "Sarah Johnson",
    "category_company": "PrecisionCorp",
    "department_id": 2,
    "department_name": "Manufacturing",
    "team_id": 1,
    "team_name": "Mechanical Team",
    "technician_id": 1,
    "technician_name": "Mike Johnson",
    "technician_email": "mike@gearguard.com",
    "scheduled_date": "2024-01-25T09:00:00.000Z",
    "duration_hours": "1.50",
    "status": "in_progress",
    "created_by": 3,
    "created_by_name": "Sarah Connor",
    "created_by_email": "sarah@gearguard.com",
    "is_overdue": 0,
    "created_at": "2024-01-23T11:30:00.000Z",
    "updated_at": "2024-01-24T10:45:00.000Z"
  }
}
```

### PUT /api/requests/15/assign-technician
**Response (200):**
```json
{
  "success": true,
  "message": "Technician assigned successfully",
  "data": {
    "id": 15,
    "subject": "CNC Machine spindle overheating",
    "technician_id": 1,
    "technician_name": "Mike Johnson",
    "status": "new"
  }
}
```

### PUT /api/requests/15/status
**Response (200):**
```json
{
  "success": true,
  "message": "Request status updated successfully",
  "data": {
    "id": 15,
    "subject": "CNC Machine spindle overheating",
    "old_status": "in_progress",
    "new_status": "repaired",
    "duration_hours": "3.50"
  }
}
```

### GET /api/requests/15/logs
**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 45,
      "request_id": 15,
      "old_status": "in_progress",
      "new_status": "repaired",
      "changed_by": 1,
      "changed_by_name": "Mike Johnson",
      "changed_at": "2024-01-25T14:30:00.000Z",
      "notes": "Replaced cooling fan and cleaned spindle motor"
    },
    {
      "id": 44,
      "request_id": 15,
      "old_status": "new",
      "new_status": "in_progress",
      "changed_by": 1,
      "changed_by_name": "Mike Johnson",
      "changed_at": "2024-01-25T09:15:00.000Z",
      "notes": "Started inspection"
    },
    {
      "id": 43,
      "request_id": 15,
      "old_status": null,
      "new_status": "new",
      "changed_by": 3,
      "changed_by_name": "Sarah Connor",
      "changed_at": "2024-01-23T11:30:00.000Z",
      "notes": "Request created"
    }
  ]
}
```

### GET /api/requests/calendar
**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 16,
      "subject": "HVAC filter replacement",
      "type": "preventive",
      "equipment_id": 3,
      "equipment_name": "HVAC Unit #1",
      "department_name": "Facilities",
      "technician_name": "James Wilson",
      "scheduled_date": "2024-02-01T08:00:00.000Z",
      "status": "new"
    },
    {
      "id": 17,
      "subject": "Quarterly press maintenance",
      "type": "preventive",
      "equipment_id": 1,
      "equipment_name": "Hydraulic Press #1",
      "department_name": "Manufacturing",
      "technician_name": "Mike Johnson",
      "scheduled_date": "2024-02-05T10:00:00.000Z",
      "status": "new"
    },
    {
      "id": 18,
      "subject": "CNC calibration",
      "type": "preventive",
      "equipment_id": 2,
      "equipment_name": "CNC Machine #2",
      "department_name": "Manufacturing",
      "technician_name": "Lisa Anderson",
      "scheduled_date": "2024-02-10T09:00:00.000Z",
      "status": "new"
    }
  ]
}
```

### GET /api/requests/stats/team
**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "team_id": 1,
      "team_name": "Mechanical Team",
      "total_requests": 45,
      "new_requests": 5,
      "in_progress_requests": 8,
      "repaired_requests": 30,
      "scrap_requests": 2,
      "avg_duration_hours": "3.25",
      "overdue_requests": 2
    },
    {
      "team_id": 2,
      "team_name": "Electrical Team",
      "total_requests": 28,
      "new_requests": 3,
      "in_progress_requests": 5,
      "repaired_requests": 19,
      "scrap_requests": 1,
      "avg_duration_hours": "2.80",
      "overdue_requests": 1
    },
    {
      "team_id": 3,
      "team_name": "HVAC Team",
      "total_requests": 36,
      "new_requests": 4,
      "in_progress_requests": 6,
      "repaired_requests": 25,
      "scrap_requests": 1,
      "avg_duration_hours": "2.50",
      "overdue_requests": 0
    }
  ]
}
```

### GET /api/requests/stats/equipment
**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "equipment_id": 2,
      "equipment_name": "CNC Machine #2",
      "serial_number": "CNC-2024-002",
      "category_name": "CNC Machine",
      "total_requests": 15,
      "corrective_requests": 8,
      "preventive_requests": 7,
      "avg_duration_hours": "3.75",
      "total_downtime_hours": "56.25",
      "last_maintenance": "2024-01-20T10:00:00.000Z"
    },
    {
      "equipment_id": 1,
      "equipment_name": "Hydraulic Press #1",
      "serial_number": "HP-2024-001",
      "category_name": "Hydraulic Press",
      "total_requests": 12,
      "corrective_requests": 5,
      "preventive_requests": 7,
      "avg_duration_hours": "4.20",
      "total_downtime_hours": "50.40",
      "last_maintenance": "2024-01-18T14:30:00.000Z"
    },
    {
      "equipment_id": 3,
      "equipment_name": "HVAC Unit #1",
      "serial_number": "HVAC-2024-001",
      "category_name": "HVAC System",
      "total_requests": 8,
      "corrective_requests": 3,
      "preventive_requests": 5,
      "avg_duration_hours": "2.10",
      "total_downtime_hours": "16.80",
      "last_maintenance": "2024-01-15T08:00:00.000Z"
    }
  ]
}
```

---

## 📎 Attachments Responses

### POST /api/attachments/15
**Response (201):**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "id": 23,
    "request_id": 15,
    "file_name": "spindle_photo.jpg",
    "file_path": "uploads/1706015423789-spindle_photo.jpg",
    "file_size": 245678,
    "mime_type": "image/jpeg",
    "uploaded_by": 1,
    "uploaded_at": "2024-01-23T16:30:23.000Z"
  }
}
```

### GET /api/attachments/15
**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 23,
      "request_id": 15,
      "file_name": "spindle_photo.jpg",
      "file_path": "uploads/1706015423789-spindle_photo.jpg",
      "file_size": 245678,
      "mime_type": "image/jpeg",
      "uploaded_by": 1,
      "uploaded_by_name": "Mike Johnson",
      "uploaded_at": "2024-01-23T16:30:23.000Z"
    },
    {
      "id": 24,
      "request_id": 15,
      "file_name": "cooling_system_diagram.pdf",
      "file_path": "uploads/1706018956234-cooling_system_diagram.pdf",
      "file_size": 1024567,
      "mime_type": "application/pdf",
      "uploaded_by": 1,
      "uploaded_by_name": "Mike Johnson",
      "uploaded_at": "2024-01-23T17:29:16.000Z"
    }
  ]
}
```

### DELETE /api/attachments/file/23
**Response (200):**
```json
{
  "success": true,
  "message": "Attachment deleted successfully"
}
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error: Subject is required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Admin or Manager role required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Equipment not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Email already exists"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Database connection error"
}
```

---

## 🎨 Frontend Development Tips

### TypeScript Interfaces

```typescript
// User
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'technician' | 'employee';
  created_at: string;
  updated_at?: string;
}

// Equipment
interface Equipment {
  id: number;
  name: string;
  serial_number: string;
  category_id: number;
  category_name: string;
  category_responsible: string;
  category_company: string;
  purchase_date: string;
  warranty_end?: string;
  location: string;
  department_id: number;
  department_name: string;
  team_id: number;
  team_name: string;
  status: 'active' | 'scrapped';
  created_at: string;
  updated_at: string;
}

// Maintenance Request
interface MaintenanceRequest {
  id: number;
  subject: string;
  type: 'corrective' | 'preventive';
  description?: string;
  equipment_id: number;
  equipment_name: string;
  serial_number: string;
  department_id: number;
  department_name: string;
  team_id: number;
  team_name: string;
  technician_id?: number;
  technician_name?: string;
  scheduled_date?: string;
  duration_hours: string;
  status: 'new' | 'in_progress' | 'repaired' | 'scrap';
  created_by: number;
  created_by_name: string;
  is_overdue: 0 | 1;
  created_at: string;
  updated_at: string;
}

// API Response Wrapper
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// Paginated Response
interface PaginatedResponse<T> {
  success: boolean;
  data: {
    requests: T[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
    };
  };
}
```

### React Query Examples

```typescript
// Fetch requests
const { data, isLoading, error } = useQuery({
  queryKey: ['requests', { status, limit, offset }],
  queryFn: () => api.get('/requests', { params: { status, limit, offset } })
});

// Create request
const createRequest = useMutation({
  mutationFn: (newRequest) => api.post('/requests', newRequest),
  onSuccess: () => {
    queryClient.invalidateQueries(['requests']);
    toast.success('Request created successfully');
  }
});

// Update status
const updateStatus = useMutation({
  mutationFn: ({ id, status, duration_hours }) => 
    api.put(`/requests/${id}/status`, { status, duration_hours }),
  onSuccess: () => {
    queryClient.invalidateQueries(['requests', id]);
  }
});
```

### Axios Setup

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post('/api/auth/refresh-token', { refreshToken });
        
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

---

**Note:** All timestamps are in ISO 8601 format (UTC). Convert to local timezone in your frontend as needed.
