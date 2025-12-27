# 📚 GearGuard API - Complete Guide

## 📋 Table of Contents
1. [Authentication APIs](#authentication-apis)
2. [User Management APIs](#user-management-apis)
3. [Department APIs](#department-apis)
4. [Maintenance Team APIs](#maintenance-team-apis)
5. [Technician APIs](#technician-apis)
6. [Equipment Category APIs](#equipment-category-apis)
7. [Equipment APIs](#equipment-apis)
8. [Maintenance Request APIs](#maintenance-request-apis)
9. [Attachment APIs](#attachment-apis)

---

## Base URL
```
http://localhost:3001/api
```

## Authentication
Most endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

# Authentication APIs

## 1. Register New User
**Purpose:** Create a new user account

**Endpoint:** `POST /api/auth/register`

**Access:** Public (no authentication required)

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "john.smith@company.com",
  "password": "SecurePass123!",
  "role": "employee"
}
```

**Field Details:**
- `name` (required): User's full name
- `email` (required): Unique email address
- `password` (required): Minimum 6 characters
- `role` (optional): admin | manager | technician | employee (default: employee)

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 15,
      "name": "John Smith",
      "email": "john.smith@company.com",
      "role": "employee",
      "created_at": "2024-01-15T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1LCJyb2xlIjoiZW1wbG95ZWUiLCJpYXQiOjE3MDUzMTU4MDAsImV4cCI6MTcwNTQwMjIwMH0.abc123",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1LCJpYXQiOjE3MDUzMTU4MDAsImV4cCI6MTcwNTkyMDYwMH0.def456"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Email already exists"
}
```

**Use Case:** When a new employee joins the company and needs system access.

---

## 2. Login
**Purpose:** Authenticate user and get access tokens

**Endpoint:** `POST /api/auth/login`

**Access:** Public

**Request Body:**
```json
{
  "email": "admin@gearguard.com",
  "password": "admin123"
}
```

**Success Response (200):**
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

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Use Case:** Daily login to access the system. Save the tokens for subsequent requests.

---

## 3. Refresh Access Token
**Purpose:** Get a new access token when the current one expires

**Endpoint:** `POST /api/auth/refresh-token`

**Access:** Public (requires valid refresh token)

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
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

**Token Lifetimes:**
- Access Token: 24 hours
- Refresh Token: 7 days

**Use Case:** When access token expires (401 error), use refresh token to get new tokens without requiring login.

---

## 4. Get Current User Profile
**Purpose:** Retrieve logged-in user's profile information

**Endpoint:** `GET /api/auth/profile`

**Access:** All authenticated users

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": 5,
    "name": "Sarah Manager",
    "email": "sarah@company.com",
    "role": "manager",
    "created_at": "2024-01-10T08:00:00.000Z",
    "updated_at": "2024-01-15T14:30:00.000Z"
  }
}
```

**Use Case:** Display user information in the UI, check user permissions.

---

## 5. Update Profile
**Purpose:** Update logged-in user's profile information

**Endpoint:** `PUT /api/auth/profile`

**Access:** All authenticated users

**Request Body:**
```json
{
  "name": "Sarah Manager Updated",
  "email": "sarah.new@company.com",
  "password": "NewPassword123!"
}
```

**Note:** All fields are optional. Only send fields you want to update.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 5,
    "name": "Sarah Manager Updated",
    "email": "sarah.new@company.com",
    "role": "manager"
  }
}
```

**Use Case:** User wants to change their name, email, or password.

---

## 6. Logout
**Purpose:** Invalidate refresh token

**Endpoint:** `POST /api/auth/logout`

**Access:** All authenticated users

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

**Use Case:** User logs out. Refresh token is removed from database.

---

# User Management APIs

## 7. Get All Users
**Purpose:** List all users with pagination and filtering

**Endpoint:** `GET /api/users`

**Access:** Admin only

**Query Parameters:**
- `limit` (optional): Number of results per page (default: 50)
- `offset` (optional): Skip this many results (default: 0)
- `role` (optional): Filter by role (admin|manager|technician|employee)
- `search` (optional): Search by name or email

**Example Request:**
```
GET /api/users?limit=20&offset=0&role=technician
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": 3,
        "name": "Mike Technician",
        "email": "mike@company.com",
        "role": "technician",
        "created_at": "2024-01-05T10:00:00.000Z"
      },
      {
        "id": 4,
        "name": "Lisa Tech",
        "email": "lisa@company.com",
        "role": "technician",
        "created_at": "2024-01-06T11:00:00.000Z"
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

**Use Case:** Admin viewing all system users, filtering technicians for assignment.

---

## 8. Get User by ID
**Purpose:** Get detailed information about a specific user

**Endpoint:** `GET /api/users/:id`

**Access:** Admin only

**Example Request:**
```
GET /api/users/5
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": 5,
    "name": "Sarah Manager",
    "email": "sarah@company.com",
    "role": "manager",
    "created_at": "2024-01-10T08:00:00.000Z",
    "updated_at": "2024-01-15T14:30:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

## 9. Update User
**Purpose:** Admin updates any user's information

**Endpoint:** `PUT /api/users/:id`

**Access:** Admin only

**Request Body:**
```json
{
  "name": "Michael Technician Senior",
  "email": "mike.senior@company.com",
  "role": "manager",
  "password": "NewPassword123"
}
```

**Note:** All fields optional. Password will be hashed automatically.

**Success Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 3,
    "name": "Michael Technician Senior",
    "email": "mike.senior@company.com",
    "role": "manager"
  }
}
```

**Use Case:** Admin promoting a technician to manager or updating user details.

---

## 10. Delete User
**Purpose:** Remove a user from the system

**Endpoint:** `DELETE /api/users/:id`

**Access:** Admin only

**Example Request:**
```
DELETE /api/users/15
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": null
}
```

**Use Case:** Employee leaves the company, remove their access.

---

## 11. Assign User as Technician
**Purpose:** Convert a regular user into a technician and assign to a team

**Endpoint:** `POST /api/users/:id/assign-technician`

**Access:** Admin, Manager only

**Request Body:**
```json
{
  "team_id": 2
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User assigned as technician successfully",
  "data": {
    "technician_id": 5,
    "user_id": 12,
    "team_id": 2,
    "created_at": "2024-01-15T16:00:00.000Z"
  }
}
```

**Use Case:** Training completed, assign employee to maintenance team as technician.

---

# Department APIs

## 12. Get All Departments
**Purpose:** List all departments

**Endpoint:** `GET /api/departments`

**Access:** All authenticated users

**Query Parameters:**
- `limit` (optional): Results per page
- `offset` (optional): Pagination offset

**Example Request:**
```
GET /api/departments?limit=50
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Departments retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "IT Department",
      "description": "Information Technology and Systems",
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Manufacturing",
      "description": "Production and Manufacturing Equipment",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Use Case:** Dropdown list when creating equipment or teams.

---

## 13. Create Department
**Purpose:** Add a new department

**Endpoint:** `POST /api/departments`

**Access:** Admin, Manager only

**Request Body:**
```json
{
  "name": "Quality Assurance",
  "description": "Product quality testing and assurance"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Department created successfully",
  "data": {
    "id": 4,
    "name": "Quality Assurance",
    "description": "Product quality testing and assurance",
    "created_at": "2024-01-20T10:00:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Department with this name already exists"
}
```

---

## 14. Update Department
**Purpose:** Modify department details

**Endpoint:** `PUT /api/departments/:id`

**Access:** Admin, Manager only

**Request Body:**
```json
{
  "name": "IT & Systems",
  "description": "Information Technology, Systems and Network Infrastructure"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Department updated successfully",
  "data": {
    "id": 1,
    "name": "IT & Systems",
    "description": "Information Technology, Systems and Network Infrastructure"
  }
}
```

---

## 15. Delete Department
**Purpose:** Remove a department

**Endpoint:** `DELETE /api/departments/:id`

**Access:** Admin only

**Warning:** This will cascade delete all associated teams and equipment!

**Success Response (200):**
```json
{
  "success": true,
  "message": "Department deleted successfully",
  "data": null
}
```

---

# Maintenance Team APIs

## 16. Get All Teams
**Purpose:** List all maintenance teams

**Endpoint:** `GET /api/teams`

**Access:** All authenticated users

**Query Parameters:**
- `department_id` (optional): Filter teams by department

**Example Request:**
```
GET /api/teams?department_id=2
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Teams retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Production Team A",
      "department_id": 2,
      "department_name": "Manufacturing",
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Production Team B",
      "department_id": 2,
      "department_name": "Manufacturing",
      "created_at": "2024-01-02T00:00:00.000Z"
    }
  ]
}
```

**Use Case:** Show teams when assigning equipment or creating maintenance requests.

---

## 17. Create Team
**Purpose:** Create a new maintenance team

**Endpoint:** `POST /api/teams`

**Access:** Admin, Manager only

**Request Body:**
```json
{
  "name": "Night Shift Team",
  "department_id": 2
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Team created successfully",
  "data": {
    "id": 4,
    "name": "Night Shift Team",
    "department_id": 2,
    "department_name": "Manufacturing",
    "created_at": "2024-01-20T15:00:00.000Z"
  }
}
```

---

## 18. Get Team Technicians
**Purpose:** Get all technicians assigned to a specific team

**Endpoint:** `GET /api/teams/:id/technicians`

**Access:** All authenticated users

**Example Request:**
```
GET /api/teams/1/technicians
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Technicians retrieved successfully",
  "data": [
    {
      "technician_id": 1,
      "user_id": 3,
      "name": "Mike Technician",
      "email": "mike@company.com",
      "team_id": 1,
      "team_name": "Production Team A"
    },
    {
      "technician_id": 2,
      "user_id": 4,
      "name": "Lisa Tech",
      "email": "lisa@company.com",
      "team_id": 1,
      "team_name": "Production Team A"
    }
  ]
}
```

**Use Case:** Manager viewing team members for workload distribution.

---

# Equipment Category APIs

## 19. Get All Categories
**Purpose:** List all equipment categories

**Endpoint:** `GET /api/categories`

**Access:** All authenticated users

**Query Parameters:**
- `name` (optional): Search by category name
- `company_name` (optional): Filter by company
- `responsible` (optional): Filter by responsible person
- `limit`, `offset`: Pagination

**Example Request:**
```
GET /api/categories?limit=20
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Hydraulic Press",
      "responsible": "John Smith",
      "company_name": "HydroTech Industries",
      "description": "Heavy-duty hydraulic press machines",
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "name": "CNC Machine",
      "responsible": "Sarah Johnson",
      "company_name": "PrecisionCorp",
      "description": "Computer Numerical Control machines",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Use Case:** Dropdown when creating new equipment, categorizing equipment types.

---

## 20. Create Category
**Purpose:** Add a new equipment category

**Endpoint:** `POST /api/categories`

**Access:** Admin, Manager only

**Request Body:**
```json
{
  "name": "Industrial Robot",
  "responsible": "Alex Turner",
  "company_name": "RoboTech Solutions",
  "description": "Automated robotic systems for assembly lines"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": 6,
    "name": "Industrial Robot",
    "responsible": "Alex Turner",
    "company_name": "RoboTech Solutions",
    "description": "Automated robotic systems for assembly lines",
    "created_at": "2024-01-20T16:00:00.000Z"
  }
}
```

---

## 21. Get Category Statistics
**Purpose:** View equipment distribution across categories

**Endpoint:** `GET /api/categories/stats`

**Access:** Admin, Manager only

**Example Request:**
```
GET /api/categories/stats
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Category statistics retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Hydraulic Press",
      "responsible": "John Smith",
      "company_name": "HydroTech Industries",
      "equipment_count": 8,
      "active_count": 7,
      "scrapped_count": 1
    },
    {
      "id": 2,
      "name": "CNC Machine",
      "responsible": "Sarah Johnson",
      "company_name": "PrecisionCorp",
      "equipment_count": 12,
      "active_count": 10,
      "scrapped_count": 2
    }
  ]
}
```

**Use Case:** Manager reviewing equipment inventory, planning purchases.

---

# Equipment APIs

## 22. Get All Equipment
**Purpose:** List all equipment with filters

**Endpoint:** `GET /api/equipment`

**Access:** All authenticated users

**Query Parameters:**
- `status`: active | scrapped
- `category_id`: Filter by category
- `department_id`: Filter by department
- `team_id`: Filter by team
- `search`: Search by name or serial number
- `limit`, `offset`: Pagination

**Example Request:**
```
GET /api/equipment?status=active&category_id=1&limit=50
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Equipment retrieved successfully",
  "data": {
    "equipment": [
      {
        "id": 1,
        "name": "Hydraulic Press #1",
        "serial_number": "HP-2024-001",
        "category_id": 1,
        "category_name": "Hydraulic Press",
        "category_responsible": "John Smith",
        "category_company": "HydroTech Industries",
        "purchase_date": "2023-05-15",
        "warranty_end": "2026-05-15",
        "location": "Building A, Floor 2",
        "department_id": 2,
        "department_name": "Manufacturing",
        "team_id": 1,
        "team_name": "Production Team A",
        "status": "active",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 45,
      "limit": 50,
      "offset": 0
    }
  }
}
```

**Use Case:** Inventory management, finding equipment for maintenance.

---

## 23. Create Equipment
**Purpose:** Add new equipment to inventory

**Endpoint:** `POST /api/equipment`

**Access:** Admin, Manager only

**Request Body:**
```json
{
  "name": "CNC Machine #5",
  "serial_number": "CNC-2024-005",
  "category_id": 2,
  "purchase_date": "2024-01-15",
  "warranty_end": "2027-01-15",
  "location": "Building B, Floor 1",
  "department_id": 2,
  "team_id": 1,
  "status": "active"
}
```

**Field Details:**
- `name` (required): Equipment name
- `serial_number` (optional): Unique serial number
- `category_id` (required): Must exist in equipment_category table
- `purchase_date` (optional): Format: YYYY-MM-DD
- `warranty_end` (optional): Format: YYYY-MM-DD
- `location` (optional): Physical location
- `department_id` (required): Must exist
- `team_id` (required): Must exist
- `status` (optional): active | scrapped (default: active)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Equipment created successfully",
  "data": {
    "id": 46,
    "name": "CNC Machine #5",
    "serial_number": "CNC-2024-005",
    "category_id": 2,
    "category_name": "CNC Machine",
    "category_responsible": "Sarah Johnson",
    "category_company": "PrecisionCorp",
    "purchase_date": "2024-01-15",
    "warranty_end": "2027-01-15",
    "location": "Building B, Floor 1",
    "department_id": 2,
    "department_name": "Manufacturing",
    "team_id": 1,
    "team_name": "Production Team A",
    "status": "active"
  }
}
```

**Use Case:** New equipment purchased, add to inventory for tracking.

---

## 24. Get Equipment Maintenance History
**Purpose:** View all maintenance requests for specific equipment

**Endpoint:** `GET /api/equipment/:id/requests`

**Access:** All authenticated users

**Example Request:**
```
GET /api/equipment/1/requests
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Equipment maintenance requests retrieved successfully",
  "data": [
    {
      "id": 15,
      "subject": "Motor making unusual noise",
      "type": "corrective",
      "description": "Grinding sound during operation",
      "status": "repaired",
      "scheduled_date": "2024-01-18T10:00:00.000Z",
      "duration_hours": 3.5,
      "technician_name": "Mike Technician",
      "created_at": "2024-01-17T08:00:00.000Z"
    },
    {
      "id": 8,
      "subject": "Quarterly preventive maintenance",
      "type": "preventive",
      "status": "repaired",
      "scheduled_date": "2024-01-10T09:00:00.000Z",
      "duration_hours": 2.0,
      "technician_name": "Lisa Tech",
      "created_at": "2024-01-05T10:00:00.000Z"
    }
  ]
}
```

**Use Case:** View equipment maintenance history before scheduling new maintenance.

---

# Maintenance Request APIs

## 25. Get All Maintenance Requests
**Purpose:** List all maintenance requests with filters

**Endpoint:** `GET /api/requests`

**Access:** All authenticated users

**Query Parameters:**
- `status`: new | in_progress | repaired | scrap
- `type`: corrective | preventive
- `equipment_id`: Filter by equipment
- `department_id`: Filter by department
- `team_id`: Filter by team
- `technician_id`: Filter by assigned technician
- `limit`, `offset`: Pagination

**Example Request:**
```
GET /api/requests?status=new&limit=20
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Requests retrieved successfully",
  "data": {
    "requests": [
      {
        "id": 25,
        "subject": "Hydraulic leak detected",
        "type": "corrective",
        "description": "Oil leaking from hydraulic pump",
        "equipment_id": 1,
        "equipment_name": "Hydraulic Press #1",
        "department_id": 2,
        "department_name": "Manufacturing",
        "team_id": 1,
        "team_name": "Production Team A",
        "technician_id": null,
        "technician_name": null,
        "scheduled_date": "2024-01-22T14:00:00.000Z",
        "duration_hours": 0,
        "status": "new",
        "created_by": 5,
        "creator_name": "Sarah Manager",
        "created_at": "2024-01-20T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 5,
      "limit": 20,
      "offset": 0
    }
  }
}
```

**Use Case:** Dashboard showing pending maintenance tasks.

---

## 26. Create Maintenance Request
**Purpose:** Report equipment issue or schedule maintenance

**Endpoint:** `POST /api/requests`

**Access:** All authenticated users

**Request Body:**
```json
{
  "subject": "Conveyor belt speed issue",
  "type": "corrective",
  "description": "Belt running slower than normal, causing production delays",
  "equipment_id": 8,
  "scheduled_date": "2024-01-23T08:00:00"
}
```

**Field Details:**
- `subject` (required): Brief description
- `type` (required): corrective | preventive
- `description` (optional): Detailed description
- `equipment_id` (required): Equipment that needs maintenance
- `scheduled_date` (optional): When to perform maintenance (ISO 8601 format)

**Auto-filled fields:**
- `department_id`: Copied from equipment
- `team_id`: Copied from equipment
- `created_by`: Current logged-in user
- `status`: Set to 'new'

**Success Response (201):**
```json
{
  "success": true,
  "message": "Maintenance request created successfully",
  "data": {
    "id": 26,
    "subject": "Conveyor belt speed issue",
    "type": "corrective",
    "description": "Belt running slower than normal, causing production delays",
    "equipment_id": 8,
    "equipment_name": "Conveyor Belt #2",
    "department_id": 2,
    "team_id": 1,
    "technician_id": null,
    "scheduled_date": "2024-01-23T08:00:00.000Z",
    "duration_hours": 0,
    "status": "new",
    "created_by": 7,
    "created_at": "2024-01-20T16:30:00.000Z"
  }
}
```

**Use Case:** Operator notices equipment problem, creates maintenance request.

---

## 27. Assign Technician to Request
**Purpose:** Assign a technician to handle maintenance request

**Endpoint:** `PUT /api/requests/:id/assign-technician`

**Access:** Admin, Manager only

**Request Body:**
```json
{
  "technician_id": 3
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Technician assigned successfully",
  "data": {
    "id": 26,
    "subject": "Conveyor belt speed issue",
    "technician_id": 3,
    "technician_name": "Mike Technician",
    "status": "new"
  }
}
```

**Use Case:** Manager reviews new requests and assigns them to available technicians.

---

## 28. Update Request Status
**Purpose:** Change maintenance request status (new → in_progress → repaired)

**Endpoint:** `PUT /api/requests/:id/status`

**Access:** Admin, Manager, assigned Technician

**Request Body:**
```json
{
  "status": "in_progress"
}
```

**Status Flow:**
- `new` → `in_progress` → `repaired` OR `scrap`

**For completion (status=repaired or scrap):**
```json
{
  "status": "repaired",
  "duration_hours": 4.5
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Request status updated successfully",
  "data": {
    "id": 26,
    "subject": "Conveyor belt speed issue",
    "status": "in_progress",
    "duration_hours": 0,
    "updated_at": "2024-01-23T08:15:00.000Z"
  }
}
```

**Automatic Actions:**
- Creates log entry in `maintenance_logs` table
- If status = 'scrap', equipment status automatically changed to 'scrapped'

**Use Case:** 
- Technician starts work: Set to "in_progress"
- Work completed: Set to "repaired" with duration
- Equipment beyond repair: Set to "scrap"

---

## 29. Get Request Status Logs
**Purpose:** View complete history of status changes for a request

**Endpoint:** `GET /api/requests/:id/logs`

**Access:** All authenticated users

**Example Request:**
```
GET /api/requests/26/logs
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Request logs retrieved successfully",
  "data": [
    {
      "id": 45,
      "request_id": 26,
      "old_status": null,
      "new_status": "new",
      "changed_by": 7,
      "changer_name": "Sarah Manager",
      "changed_at": "2024-01-20T16:30:00.000Z",
      "notes": "Request created"
    },
    {
      "id": 46,
      "request_id": 26,
      "old_status": "new",
      "new_status": "in_progress",
      "changed_by": 3,
      "changer_name": "Mike Technician",
      "changed_at": "2024-01-23T08:15:00.000Z",
      "notes": "Started working on issue"
    },
    {
      "id": 47,
      "request_id": 26,
      "old_status": "in_progress",
      "new_status": "repaired",
      "changed_by": 3,
      "changer_name": "Mike Technician",
      "changed_at": "2024-01-23T12:45:00.000Z",
      "notes": "Replaced conveyor motor, tested OK"
    }
  ]
}
```

**Use Case:** Audit trail, tracking who did what and when.

---

## 30. Get Calendar View
**Purpose:** View scheduled maintenance in calendar format

**Endpoint:** `GET /api/requests/calendar`

**Access:** All authenticated users

**Query Parameters:**
- `start_date` (required): Start date (YYYY-MM-DD)
- `end_date` (required): End date (YYYY-MM-DD)
- `team_id` (optional): Filter by team
- `type` (optional): Filter by type

**Example Request:**
```
GET /api/requests/calendar?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Calendar view retrieved successfully",
  "data": [
    {
      "id": 26,
      "subject": "Conveyor belt speed issue",
      "type": "corrective",
      "equipment_name": "Conveyor Belt #2",
      "scheduled_date": "2024-01-23T08:00:00.000Z",
      "status": "repaired",
      "technician_name": "Mike Technician",
      "duration_hours": 4.5
    },
    {
      "id": 27,
      "subject": "Monthly HVAC maintenance",
      "type": "preventive",
      "equipment_name": "HVAC Unit #1",
      "scheduled_date": "2024-01-25T09:00:00.000Z",
      "status": "new",
      "technician_name": null,
      "duration_hours": 0
    }
  ]
}
```

**Use Case:** Planning maintenance schedule, avoiding conflicts, preventive maintenance calendar.

---

## 31. Get Statistics by Team
**Purpose:** View maintenance workload distribution across teams

**Endpoint:** `GET /api/requests/stats/team`

**Access:** Admin, Manager only

**Query Parameters:**
- `start_date` (optional): Filter from date
- `end_date` (optional): Filter to date

**Example Request:**
```
GET /api/requests/stats/team
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Team statistics retrieved successfully",
  "data": [
    {
      "team_id": 1,
      "team_name": "Production Team A",
      "total_requests": 45,
      "new_count": 5,
      "in_progress_count": 8,
      "repaired_count": 30,
      "scrap_count": 2,
      "avg_duration_hours": 3.2,
      "corrective_count": 28,
      "preventive_count": 17
    },
    {
      "team_id": 2,
      "team_name": "IT Support Team",
      "total_requests": 22,
      "new_count": 2,
      "in_progress_count": 3,
      "repaired_count": 17,
      "scrap_count": 0,
      "avg_duration_hours": 2.1,
      "corrective_count": 15,
      "preventive_count": 7
    }
  ]
}
```

**Use Case:** Manager reviewing team performance, workload balancing, resource planning.

---

## 32. Get Statistics by Equipment
**Purpose:** Identify equipment with most maintenance issues

**Endpoint:** `GET /api/requests/stats/equipment`

**Access:** Admin, Manager only

**Query Parameters:**
- `limit` (optional): Top N equipment (default: 10)

**Example Request:**
```
GET /api/requests/stats/equipment?limit=5
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Equipment statistics retrieved successfully",
  "data": [
    {
      "equipment_id": 12,
      "equipment_name": "CNC Machine #3",
      "category_name": "CNC Machine",
      "request_count": 18,
      "corrective_count": 14,
      "preventive_count": 4,
      "avg_duration_hours": 4.2,
      "total_downtime_hours": 75.6,
      "last_maintenance": "2024-01-18T10:00:00.000Z"
    },
    {
      "equipment_id": 5,
      "equipment_name": "Hydraulic Press #2",
      "category_name": "Hydraulic Press",
      "request_count": 15,
      "corrective_count": 10,
      "preventive_count": 5,
      "avg_duration_hours": 3.8,
      "total_downtime_hours": 57.0,
      "last_maintenance": "2024-01-20T14:00:00.000Z"
    }
  ]
}
```

**Use Case:** Identify problematic equipment, plan replacements, calculate maintenance costs.

---

# Attachment APIs

## 33. Upload Attachment
**Purpose:** Attach files (images, PDFs) to maintenance request

**Endpoint:** `POST /api/attachments/:requestId`

**Access:** All authenticated users

**Content-Type:** `multipart/form-data`

**Request Body:**
```
Form Data:
- file: [binary file data]
```

**Restrictions:**
- Max file size: 5 MB
- Allowed types: JPEG, PNG, PDF
- Field name must be: `file`

**Example using cURL:**
```bash
curl -X POST http://localhost:3001/api/attachments/26 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "id": 15,
    "request_id": 26,
    "file_name": "conveyor_issue_photo.jpg",
    "file_path": "uploads/1705765200000-conveyor_issue_photo.jpg",
    "file_size": 245678,
    "mime_type": "image/jpeg",
    "uploaded_by": 3,
    "uploader_name": "Mike Technician",
    "uploaded_at": "2024-01-23T09:00:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "File too large. Maximum size is 5MB"
}
```

**Use Case:** 
- Technician uploads photos of equipment problem
- Attach repair invoice PDF
- Document before/after photos

---

## 34. Get Request Attachments
**Purpose:** List all files attached to a maintenance request

**Endpoint:** `GET /api/attachments/:requestId`

**Access:** All authenticated users

**Example Request:**
```
GET /api/attachments/26
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Attachments retrieved successfully",
  "data": [
    {
      "id": 15,
      "request_id": 26,
      "file_name": "conveyor_issue_photo.jpg",
      "file_path": "uploads/1705765200000-conveyor_issue_photo.jpg",
      "file_size": 245678,
      "mime_type": "image/jpeg",
      "uploaded_by": 3,
      "uploader_name": "Mike Technician",
      "uploaded_at": "2024-01-23T09:00:00.000Z"
    },
    {
      "id": 16,
      "request_id": 26,
      "file_name": "repair_invoice.pdf",
      "file_path": "uploads/1705768800000-repair_invoice.pdf",
      "file_size": 85234,
      "mime_type": "application/pdf",
      "uploaded_by": 5,
      "uploader_name": "Sarah Manager",
      "uploaded_at": "2024-01-23T10:00:00.000Z"
    }
  ]
}
```

**Use Case:** View all documentation for a maintenance request.

---

## 35. Delete Attachment
**Purpose:** Remove a file attachment

**Endpoint:** `DELETE /api/attachments/file/:id`

**Access:** Admin, Manager, file uploader

**Example Request:**
```
DELETE /api/attachments/file/15
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Attachment deleted successfully",
  "data": null
}
```

**Note:** Physical file is deleted from server's uploads folder.

---

# Common Response Patterns

## Success Response Format
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* result data */ }
}
```

## Error Response Format
```json
{
  "success": false,
  "message": "Error description"
}
```

## HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

# Authentication Flow Example

```javascript
// 1. Login
POST /api/auth/login
{ "email": "admin@gearguard.com", "password": "admin123" }

// Save tokens from response
accessToken = response.data.accessToken
refreshToken = response.data.refreshToken

// 2. Use access token for requests
GET /api/equipment
Headers: { Authorization: "Bearer " + accessToken }

// 3. When access token expires (401 error)
POST /api/auth/refresh-token
{ "refreshToken": refreshToken }

// Update tokens
accessToken = response.data.accessToken
refreshToken = response.data.refreshToken

// 4. Logout when done
POST /api/auth/logout
{ "refreshToken": refreshToken }
```

---

# Workflow Examples

## Workflow 1: Creating Equipment and Maintenance Request

```javascript
// Step 1: Login
POST /api/auth/login
{ "email": "manager@company.com", "password": "pass123" }

// Step 2: Get categories for dropdown
GET /api/categories

// Step 3: Get departments
GET /api/departments

// Step 4: Get teams for selected department
GET /api/teams?department_id=2

// Step 5: Create equipment
POST /api/equipment
{
  "name": "New Press Machine",
  "serial_number": "PM-2024-010",
  "category_id": 1,
  "department_id": 2,
  "team_id": 1,
  "purchase_date": "2024-01-20",
  "location": "Building A"
}

// Step 6: Create maintenance request
POST /api/requests
{
  "subject": "Initial setup and calibration",
  "type": "preventive",
  "equipment_id": 47,  // ID from step 5
  "scheduled_date": "2024-01-25T09:00:00"
}
```

## Workflow 2: Processing Maintenance Request

```javascript
// Step 1: Manager views new requests
GET /api/requests?status=new

// Step 2: Get available technicians
GET /api/teams/1/technicians

// Step 3: Assign technician
PUT /api/requests/28/assign-technician
{ "technician_id": 3 }

// Step 4: Technician starts work
PUT /api/requests/28/status
{ "status": "in_progress" }

// Step 5: Technician uploads photo
POST /api/attachments/28
FormData: { file: image.jpg }

// Step 6: Complete maintenance
PUT /api/requests/28/status
{ "status": "repaired", "duration_hours": 2.5 }

// Step 7: View history
GET /api/requests/28/logs
```

---

# Tips for Frontend Integration

1. **Store tokens securely**: Use localStorage or sessionStorage
2. **Implement token refresh**: Automatically refresh when receiving 401
3. **Show loading states**: API calls may take time
4. **Handle errors gracefully**: Show user-friendly error messages
5. **Use query parameters**: For filtering, pagination, search
6. **Validate before sending**: Check required fields client-side
7. **Show confirmation dialogs**: Before delete operations
8. **Update UI optimistically**: Show changes immediately, rollback on error

---

**Last Updated:** December 27, 2025  
**API Version:** 1.1.0  
**Total Endpoints:** 35  
**Base URL:** http://localhost:3001/api
