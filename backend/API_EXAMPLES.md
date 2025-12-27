# 📡 GearGuard API - Sample Requests & Responses

This document provides complete examples for all API endpoints with sample requests and responses.

---

## 🔐 Authentication Endpoints

### 1. Register New User api endpoint

**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Smith",
  "email": "john.smith@company.com",
  "password": "SecurePass123!",
  "role": "employee"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 15,
      "name": "John Smith",
      "email": "john.smith@company.com",
      "role": "employee"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@gearguard.com",
  "password": "admin123"
}
```

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
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Refresh Access Token

**Request:**
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

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

### 4. Get User Profile

**Request:**
```http
GET /api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@gearguard.com",
    "role": "admin",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 🏢 Department Endpoints

### 1. Create Department

**Request:**
```http
POST /api/departments
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Manufacturing",
  "description": "Production and Manufacturing Equipment"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Department created successfully",
  "data": {
    "id": 3,
    "name": "Manufacturing",
    "description": "Production and Manufacturing Equipment",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Get All Departments

**Request:**
```http
GET /api/departments?limit=10&offset=0
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "IT Department",
      "description": "Information Technology and Systems",
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Facilities",
      "description": "Building Maintenance",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 3,
    "limit": 10,
    "offset": 0
  }
}
```

---

## 👷 Team Endpoints

### 1. Create Maintenance Team

**Request:**
```http
POST /api/teams
Authorization: Bearer <manager_token>
Content-Type: application/json

{
  "name": "Production Line A Team",
  "department_id": 3
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Maintenance team created successfully",
  "data": {
    "id": 5,
    "name": "Production Line A Team",
    "department_id": 3,
    "department_name": "Manufacturing",
    "created_at": "2024-01-15T11:00:00.000Z"
  }
}
```

### 2. Get Team Technicians

**Request:**
```http
GET /api/teams/5/technicians
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "user_id": 25,
      "team_id": 5,
      "name": "Mike Johnson",
      "email": "mike.j@company.com"
    },
    {
      "id": 11,
      "user_id": 26,
      "team_id": 5,
      "name": "Sarah Williams",
      "email": "sarah.w@company.com"
    }
  ]
}
```

---

## 🔧 Equipment Endpoints

### 1. Create Equipment

**Request:**
```http
POST /api/equipment
Authorization: Bearer <manager_token>
Content-Type: application/json

{
  "name": "Hydraulic Press #3",
  "serial_number": "HP-2024-003",
  "category": "Press Machine",
  "purchase_date": "2023-05-15",
  "warranty_end": "2026-05-15",
  "location": "Building A, Floor 2",
  "department_id": 3,
  "team_id": 5,
  "status": "active"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Equipment created successfully",
  "data": {
    "id": 42,
    "name": "Hydraulic Press #3",
    "serial_number": "HP-2024-003",
    "category": "Press Machine",
    "purchase_date": "2023-05-15",
    "warranty_end": "2026-05-15",
    "location": "Building A, Floor 2",
    "department_id": 3,
    "team_id": 5,
    "status": "active",
    "department_name": "Manufacturing",
    "team_name": "Production Line A Team",
    "created_at": "2024-01-15T12:00:00.000Z"
  }
}
```

### 2. Get Equipment with Filters

**Request:**
```http
GET /api/equipment?department_id=3&status=active&category=Press%20Machine&limit=20
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 40,
      "name": "Hydraulic Press #1",
      "serial_number": "HP-2024-001",
      "category": "Press Machine",
      "status": "active",
      "department_name": "Manufacturing",
      "team_name": "Production Line A Team"
    },
    {
      "id": 42,
      "name": "Hydraulic Press #3",
      "serial_number": "HP-2024-003",
      "category": "Press Machine",
      "status": "active",
      "department_name": "Manufacturing",
      "team_name": "Production Line A Team"
    }
  ],
  "pagination": {
    "total": 2,
    "limit": 20,
    "offset": 0
  }
}
```

### 3. Get Equipment Requests (Smart Button)

**Request:**
```http
GET /api/equipment/42/requests
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 125,
      "subject": "Unusual noise during operation",
      "type": "corrective",
      "status": "in_progress",
      "equipment_name": "Hydraulic Press #3",
      "technician_name": "Mike Johnson",
      "created_at": "2024-01-10T08:30:00.000Z"
    },
    {
      "id": 100,
      "subject": "Regular preventive maintenance",
      "type": "preventive",
      "status": "repaired",
      "scheduled_date": "2024-01-05T10:00:00.000Z",
      "duration_hours": 2.5
    }
  ]
}
```

---

## 🛠️ Maintenance Request Endpoints

### 1. Create Maintenance Request

**Request:**
```http
POST /api/requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "subject": "Motor overheating issue",
  "type": "corrective",
  "description": "Motor temperature reaching 90°C during operation. Needs immediate inspection.",
  "equipment_id": 42,
  "scheduled_date": "2024-01-16T09:00:00",
  "technician_id": 10
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Maintenance request created successfully",
  "data": {
    "id": 150,
    "subject": "Motor overheating issue",
    "type": "corrective",
    "description": "Motor temperature reaching 90°C during operation...",
    "equipment_id": 42,
    "department_id": 3,
    "team_id": 5,
    "technician_id": 10,
    "status": "new",
    "scheduled_date": "2024-01-16T09:00:00.000Z",
    "created_by": 15,
    "equipment_name": "Hydraulic Press #3",
    "department_name": "Manufacturing",
    "team_name": "Production Line A Team",
    "technician_name": "Mike Johnson",
    "created_at": "2024-01-15T14:30:00.000Z"
  }
}
```

### 2. Assign Technician to Request

**Request:**
```http
PUT /api/requests/150/assign-technician
Authorization: Bearer <manager_token>
Content-Type: application/json

{
  "technician_id": 11
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Technician assigned successfully",
  "data": {
    "id": 150,
    "subject": "Motor overheating issue",
    "technician_id": 11,
    "technician_name": "Sarah Williams",
    "status": "new"
  }
}
```

### 3. Update Request Status

**Request:**
```http
PUT /api/requests/150/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in_progress"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Status updated successfully",
  "data": {
    "id": 150,
    "status": "in_progress",
    "updated_at": "2024-01-16T08:00:00.000Z"
  }
}
```

### 4. Complete Request with Duration

**Request:**
```http
PUT /api/requests/150/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "repaired",
  "duration_hours": 3.5
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Status updated successfully",
  "data": {
    "id": 150,
    "status": "repaired",
    "duration_hours": 3.5,
    "updated_at": "2024-01-16T11:30:00.000Z"
  }
}
```

### 5. Get Calendar View (Preventive Maintenance)

**Request:**
```http
GET /api/requests/calendar?start_date=2024-01-15&end_date=2024-01-31
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 145,
      "subject": "Quarterly maintenance check",
      "type": "preventive",
      "scheduled_date": "2024-01-20T10:00:00.000Z",
      "equipment_name": "Conveyor Belt #5",
      "team_name": "Production Line B Team",
      "technician_name": "Tom Anderson",
      "status": "new"
    },
    {
      "id": 148,
      "subject": "Annual safety inspection",
      "type": "preventive",
      "scheduled_date": "2024-01-25T14:00:00.000Z",
      "equipment_name": "Safety Valve System",
      "team_name": "Facilities Team",
      "status": "new"
    }
  ]
}
```

### 6. Get Request History Logs

**Request:**
```http
GET /api/requests/150/logs
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 450,
      "request_id": 150,
      "old_status": "in_progress",
      "new_status": "repaired",
      "changed_by_name": "Sarah Williams",
      "changed_at": "2024-01-16T11:30:00.000Z",
      "notes": "Completed in 3.5 hours"
    },
    {
      "id": 449,
      "request_id": 150,
      "old_status": "new",
      "new_status": "in_progress",
      "changed_by_name": "Sarah Williams",
      "changed_at": "2024-01-16T08:00:00.000Z",
      "notes": null
    },
    {
      "id": 448,
      "request_id": 150,
      "old_status": null,
      "new_status": "new",
      "changed_by_name": "John Smith",
      "changed_at": "2024-01-15T14:30:00.000Z",
      "notes": "Request created"
    }
  ]
}
```

### 7. Get Overdue Requests

**Request:**
```http
GET /api/requests?overdue=true&status=new
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 140,
      "subject": "Scheduled maintenance overdue",
      "type": "preventive",
      "scheduled_date": "2024-01-10T10:00:00.000Z",
      "status": "new",
      "is_overdue": 1,
      "equipment_name": "Air Compressor #2"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 50,
    "offset": 0
  }
}
```

---

## 📊 Reporting Endpoints

### 1. Get Statistics by Team

**Request:**
```http
GET /api/requests/stats/team
Authorization: Bearer <manager_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "team_name": "Production Line A Team",
      "total_requests": 45,
      "new_requests": 8,
      "in_progress_requests": 12,
      "repaired_requests": 23,
      "scrap_requests": 2
    },
    {
      "id": 6,
      "team_name": "Facilities Team",
      "total_requests": 32,
      "new_requests": 5,
      "in_progress_requests": 7,
      "repaired_requests": 20,
      "scrap_requests": 0
    }
  ]
}
```

### 2. Get Statistics by Equipment

**Request:**
```http
GET /api/requests/stats/equipment
Authorization: Bearer <manager_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 42,
      "equipment_name": "Hydraulic Press #3",
      "serial_number": "HP-2024-003",
      "total_requests": 15,
      "repaired_count": 12,
      "in_progress_count": 3
    },
    {
      "id": 38,
      "equipment_name": "CNC Machine #1",
      "serial_number": "CNC-2023-001",
      "total_requests": 22,
      "repaired_count": 20,
      "in_progress_count": 2
    }
  ]
}
```

---

## 📎 Attachment Endpoints

### 1. Upload Attachment

**Request:**
```http
POST /api/attachments/150
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: [binary image or PDF file]
```

**Response (201):**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "id": 75,
    "request_id": 150,
    "file_name": "1705325400000-motor-inspection-photo.jpg",
    "file_path": "uploads/1705325400000-motor-inspection-photo.jpg",
    "file_size": 245678,
    "mime_type": "image/jpeg",
    "uploaded_by": 15,
    "uploaded_at": "2024-01-15T15:30:00.000Z"
  }
}
```

### 2. Get Request Attachments

**Request:**
```http
GET /api/attachments/150
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 75,
      "request_id": 150,
      "file_name": "1705325400000-motor-inspection-photo.jpg",
      "file_path": "uploads/1705325400000-motor-inspection-photo.jpg",
      "file_size": 245678,
      "mime_type": "image/jpeg",
      "uploaded_by_name": "John Smith",
      "uploaded_at": "2024-01-15T15:30:00.000Z"
    },
    {
      "id": 76,
      "request_id": 150,
      "file_name": "1705326000000-repair-report.pdf",
      "file_path": "uploads/1705326000000-repair-report.pdf",
      "file_size": 156789,
      "mime_type": "application/pdf",
      "uploaded_by_name": "Sarah Williams",
      "uploaded_at": "2024-01-15T16:00:00.000Z"
    }
  ]
}
```

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Equipment name, department ID, and team ID are required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided. Authorization denied."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Required role: admin or manager. Your role: employee"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Equipment not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Database connection error",
  "error": "Detailed error message (development mode only)"
}
```

---

## 🔑 Authentication Header Format

All protected endpoints require:
```
Authorization: Bearer <your_access_token>
```

Example:
```http
GET /api/equipment
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBnZWFyZ3VhcmQuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzA1MzI1NDAwLCJleHAiOjE3MDU0MTE4MDB9.signature
```

---

This document provides complete API examples for testing with Postman, Thunder Client, or any API testing tool.
