# 🎯 Complete Frontend Development Guide - GearGuard API

## 📋 Table of Contents
1. [API Overview](#api-overview)
2. [Authentication Setup](#authentication-setup)
3. [All API Endpoints](#all-api-endpoints)
4. [Request/Response Examples](#requestresponse-examples)
5. [Frontend Integration Guide](#frontend-integration-guide)
6. [React Components Examples](#react-components-examples)
7. [State Management](#state-management)
8. [Error Handling](#error-handling)
9. [TypeScript Interfaces](#typescript-interfaces)

---

## 🌐 API Overview

**Base URL:** `http://localhost:3000/api`

**Authentication:** JWT Bearer Token
- Access Token: 24 hours validity
- Refresh Token: 7 days validity

**Response Format:**
```json
{
  "success": true,
  "message": "Optional message",
  "data": {},
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0
  }
}
```

---

## 🔐 Authentication Setup

### 1. Axios Configuration

```typescript
// src/api/axios.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
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

### 2. Auth Context Provider

```typescript
// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'technician' | 'employee';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await api.get('/auth/profile');
          setUser(response.data.data);
        } catch (error) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { user, accessToken, refreshToken } = response.data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## 📡 All API Endpoints

### 🔐 Authentication Module (6 endpoints)

#### 1. POST /api/auth/register
**Purpose:** Register new user  
**Access:** Public  
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```
**Response:**
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
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

#### 2. POST /api/auth/login
**Purpose:** User login  
**Access:** Public  
**Request Body:**
```json
{
  "email": "admin@gearguard.com",
  "password": "admin123"
}
```
**Response:** Same as register

#### 3. POST /api/auth/refresh-token
**Purpose:** Refresh access token  
**Access:** Public  
**Request Body:**
```json
{
  "refreshToken": "eyJhbGci..."
}
```

#### 4. POST /api/auth/logout
**Purpose:** Logout user  
**Access:** Private

#### 5. GET /api/auth/profile
**Purpose:** Get current user profile  
**Access:** Private

#### 6. PUT /api/auth/profile
**Purpose:** Update current user profile  
**Access:** Private

---

### 👥 Users Module (6 endpoints)

#### 1. GET /api/users
**Purpose:** Get all users with filters  
**Access:** Admin, Manager  
**Query Params:**
- `role`: Filter by role (admin, manager, technician, employee)
- `search`: Search by name/email
- `limit`: Results per page (default: 50)
- `offset`: Pagination offset

**Response:**
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
    }
  ],
  "pagination": {
    "total": 10,
    "limit": 50,
    "offset": 0
  }
}
```

#### 2. GET /api/users/:id
**Purpose:** Get user by ID  
**Access:** Admin, Manager

#### 3. PUT /api/users/:id
**Purpose:** Update user  
**Access:** Admin

#### 4. DELETE /api/users/:id
**Purpose:** Delete user  
**Access:** Admin

#### 5. POST /api/users/:id/assign-technician
**Purpose:** Assign technician role to user  
**Access:** Admin

#### 6. DELETE /api/users/:id/remove-technician
**Purpose:** Remove technician role  
**Access:** Admin

---

### 🏢 Departments Module (5 endpoints)

#### 1. GET /api/departments
**Purpose:** Get all departments  
**Access:** Private

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Production",
      "description": "Main production floor",
      "manager_id": 2,
      "manager_name": "John Smith",
      "equipment_count": 15,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### 2. POST /api/departments
**Purpose:** Create department  
**Access:** Admin, Manager

**Request Body:**
```json
{
  "name": "Quality Control",
  "description": "Quality assurance department",
  "manager_id": 3
}
```

#### 3. GET /api/departments/:id
**Purpose:** Get department by ID  
**Access:** Private

#### 4. PUT /api/departments/:id
**Purpose:** Update department  
**Access:** Admin, Manager

#### 5. DELETE /api/departments/:id
**Purpose:** Delete department  
**Access:** Admin

---

### 👨‍🔧 Teams Module (6 endpoints)

#### 1. GET /api/teams
**Purpose:** Get all maintenance teams  
**Access:** Private

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Mechanical Team",
      "description": "Handles mechanical equipment",
      "color_code": "#FF5733",
      "technician_count": 5,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### 2. POST /api/teams
**Purpose:** Create team  
**Access:** Admin, Manager

**Request Body:**
```json
{
  "name": "Electrical Team",
  "description": "Handles electrical systems",
  "color_code": "#3498DB"
}
```

#### 3. GET /api/teams/:id
**Purpose:** Get team by ID  
**Access:** Private

#### 4. PUT /api/teams/:id
**Purpose:** Update team  
**Access:** Admin, Manager

#### 5. DELETE /api/teams/:id
**Purpose:** Delete team  
**Access:** Admin

#### 6. GET /api/teams/:id/technicians
**Purpose:** Get technicians in team  
**Access:** Private

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 5,
      "name": "Mike Johnson",
      "email": "mike@gearguard.com",
      "team_id": 1,
      "team_name": "Mechanical Team",
      "specialization": "Hydraulics",
      "certification_level": "Senior",
      "active_requests": 3
    }
  ]
}
```

---

### 🏷️ Categories Module (6 endpoints)

#### 1. GET /api/categories
**Purpose:** Get all equipment categories  
**Access:** Private

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "CNC Machines",
      "responsible_person": "John Tech",
      "company": "TechCorp Industries",
      "equipment_count": 8,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### 2. POST /api/categories
**Purpose:** Create category  
**Access:** Admin, Manager

**Request Body:**
```json
{
  "name": "Robotics",
  "responsible_person": "Jane Doe",
  "company": "RoboTech Ltd"
}
```

#### 3. GET /api/categories/:id
**Purpose:** Get category by ID with equipment  
**Access:** Private

#### 4. PUT /api/categories/:id
**Purpose:** Update category  
**Access:** Admin, Manager

#### 5. DELETE /api/categories/:id
**Purpose:** Delete category  
**Access:** Admin

#### 6. GET /api/categories/stats
**Purpose:** Get category statistics  
**Access:** Admin, Manager

---

### ⚙️ Equipment Module (6 endpoints)

#### 1. GET /api/equipment
**Purpose:** Get all equipment with filters  
**Access:** Private

**Query Params:**
- `department_id`: Filter by department
- `category_id`: Filter by category
- `team_id`: Filter by assigned team
- `status`: Filter by status (available, in_maintenance, out_of_service)
- `health_min`: Minimum health percentage
- `search`: Search by name/serial
- `limit`, `offset`: Pagination

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "CNC Machine A1",
      "serial_number": "CNC-2024-001",
      "description": "High-precision CNC milling machine",
      "status": "available",
      "health_status": 85,
      "location": "Production Floor A",
      "department_id": 1,
      "department_name": "Production",
      "category_id": 1,
      "category_name": "CNC Machines",
      "category_responsible": "John Tech",
      "category_company": "TechCorp",
      "team_id": 1,
      "team_name": "Mechanical Team",
      "installation_date": "2023-06-15",
      "last_maintenance": "2024-12-01T10:00:00.000Z",
      "next_maintenance": "2025-01-01T00:00:00.000Z",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 15,
    "limit": 50,
    "offset": 0
  }
}
```

#### 2. POST /api/equipment
**Purpose:** Create equipment  
**Access:** Admin, Manager

**Request Body:**
```json
{
  "name": "CNC Machine B2",
  "serial_number": "CNC-2024-002",
  "description": "5-axis CNC router",
  "status": "available",
  "health_status": 100,
  "location": "Production Floor B",
  "department_id": 1,
  "category_id": 1,
  "team_id": 1,
  "installation_date": "2024-01-15",
  "next_maintenance": "2024-04-15"
}
```

#### 3. GET /api/equipment/:id
**Purpose:** Get equipment by ID with full details  
**Access:** Private

**Response:** Same as list response but single object with additional details

#### 4. PUT /api/equipment/:id
**Purpose:** Update equipment  
**Access:** Admin, Manager

#### 5. DELETE /api/equipment/:id
**Purpose:** Delete equipment  
**Access:** Admin

#### 6. GET /api/equipment/:id/requests
**Purpose:** Get all maintenance requests for equipment  
**Access:** Private

---

### 🔧 Maintenance Requests Module (11 endpoints) ⭐ **MAIN MODULE**

#### 1. GET /api/requests
**Purpose:** Get all maintenance requests with filters  
**Access:** Private

**Query Params:**
- `equipment_id`: Filter by equipment
- `department_id`: Filter by department
- `team_id`: Filter by team
- `technician_id`: Filter by technician
- `status`: Filter by status (new, in_progress, repaired, scrap)
- `type`: Filter by type (preventive, corrective, breakdown)
- `priority`: Filter by priority (low, medium, high, critical) ⭐
- `overdue`: Filter overdue requests (true/false)
- `search`: Search by subject
- `limit`, `offset`: Pagination

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "subject": "Regular maintenance check",
      "type": "preventive",
      "priority": "medium",
      "status": "new",
      "description": "Monthly preventive maintenance",
      "equipment_id": 1,
      "equipment_name": "CNC Machine A1",
      "equipment_serial": "CNC-2024-001",
      "equipment_location": "Production Floor A",
      "department_id": 1,
      "department_name": "Production",
      "category_id": 1,
      "category_name": "CNC Machines",
      "category_responsible": "John Tech",
      "category_company": "TechCorp",
      "team_id": 1,
      "team_name": "Mechanical Team",
      "requester_id": 8,
      "requester_name": "Sarah Employee",
      "technician_id": 5,
      "technician_name": "Mike Johnson",
      "scheduled_date": "2024-12-30T09:00:00.000Z",
      "start_date": null,
      "end_date": null,
      "duration_hours": null,
      "created_at": "2024-12-15T10:00:00.000Z",
      "updated_at": "2024-12-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 20,
    "limit": 50,
    "offset": 0
  }
}
```

#### 2. POST /api/requests ⭐ **CREATE REQUEST**
**Purpose:** Create new maintenance request  
**Access:** Private (All roles)

**Request Body:**
```json
{
  "subject": "Hydraulic system leak",
  "type": "breakdown",
  "priority": "critical",
  "description": "Urgent - Hydraulic fluid leaking from pump",
  "equipment_id": 5,
  "technician_id": 3,
  "scheduled_date": "2024-12-28T14:00:00.000Z"
}
```

**Fields:**
- `subject` (required): Brief title of the request
- `type` (required): One of: preventive, corrective, breakdown
- `priority` (optional): One of: low, medium, high, critical (default: medium)
- `description` (optional): Detailed description
- `equipment_id` (required): ID of equipment
- `technician_id` (optional): Assign to specific technician
- `scheduled_date` (optional): When to perform maintenance

**Response:**
```json
{
  "success": true,
  "message": "Maintenance request created successfully",
  "data": {
    "id": 21,
    "subject": "Hydraulic system leak",
    "type": "breakdown",
    "priority": "critical",
    "status": "new",
    "equipment_id": 5,
    "requester_id": 8,
    "created_at": "2024-12-27T15:30:00.000Z"
  }
}
```

#### 3. GET /api/requests/:id
**Purpose:** Get single request with full details  
**Access:** Private

**Response:** Full request object with all related data

#### 4. PUT /api/requests/:id
**Purpose:** Update maintenance request  
**Access:** Private

**Request Body:** (All fields optional)
```json
{
  "subject": "Updated subject",
  "type": "corrective",
  "priority": "high",
  "description": "Updated description",
  "scheduled_date": "2024-12-29T10:00:00.000Z"
}
```

#### 5. PUT /api/requests/:id/assign-technician
**Purpose:** Assign technician to request  
**Access:** Admin, Manager

**Request Body:**
```json
{
  "technician_id": 7
}
```

#### 6. PUT /api/requests/:id/status
**Purpose:** Update request status (creates log entry)  
**Access:** Private

**Request Body:**
```json
{
  "status": "in_progress",
  "duration_hours": 2.5
}
```

**Valid Status Transitions:**
- new → in_progress
- in_progress → repaired
- in_progress → scrap
- Any status → new (reopen)

#### 7. GET /api/requests/:id/logs
**Purpose:** Get activity logs for request  
**Access:** Private

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "request_id": 1,
      "status": "in_progress",
      "notes": "Started working on the issue",
      "duration_hours": null,
      "changed_by_id": 5,
      "changed_by_name": "Mike Johnson",
      "created_at": "2024-12-27T09:00:00.000Z"
    }
  ]
}
```

#### 8. DELETE /api/requests/:id
**Purpose:** Delete maintenance request  
**Access:** Admin, Manager

#### 9. GET /api/requests/calendar
**Purpose:** Get preventive maintenance calendar view  
**Access:** Private

**Query Params:**
- `start_date`: ISO date string
- `end_date`: ISO date string

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "subject": "Monthly check",
      "type": "preventive",
      "priority": "medium",
      "equipment_name": "CNC Machine A1",
      "scheduled_date": "2024-12-30T09:00:00.000Z",
      "technician_name": "Mike Johnson",
      "status": "new"
    }
  ]
}
```

#### 10. GET /api/requests/stats/team
**Purpose:** Get statistics by team  
**Access:** Admin, Manager

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "team_id": 1,
      "team_name": "Mechanical Team",
      "total_requests": 45,
      "new_requests": 5,
      "in_progress": 8,
      "completed": 32,
      "avg_resolution_hours": 4.5
    }
  ]
}
```

#### 11. GET /api/requests/stats/equipment
**Purpose:** Get statistics by equipment  
**Access:** Admin, Manager

---

### 📎 Attachments Module (3 endpoints)

#### 1. POST /api/attachments/:requestId
**Purpose:** Upload file to maintenance request  
**Access:** Private

**Request:** multipart/form-data
```javascript
const formData = new FormData();
formData.append('file', fileBlob);
formData.append('description', 'Photo of damage');

await api.post(`/attachments/${requestId}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

#### 2. GET /api/attachments/:requestId
**Purpose:** Get all attachments for request  
**Access:** Private

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "request_id": 1,
      "file_name": "damage_photo.jpg",
      "file_path": "/uploads/maintenance/damage_photo.jpg",
      "file_size": 245760,
      "file_type": "image/jpeg",
      "description": "Photo of damage",
      "uploaded_by_id": 5,
      "uploaded_by_name": "Mike Johnson",
      "created_at": "2024-12-27T10:00:00.000Z"
    }
  ]
}
```

#### 3. DELETE /api/attachments/file/:id
**Purpose:** Delete attachment  
**Access:** Private

---

## 🎨 React Components Examples

### 1. Create Maintenance Request Form ⭐

```typescript
// src/components/CreateRequestForm.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../api/axios';

interface FormData {
  subject: string;
  type: 'preventive' | 'corrective' | 'breakdown';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  equipment_id: number;
  technician_id?: number;
  scheduled_date: string;
}

interface Equipment {
  id: number;
  name: string;
  serial_number: string;
  location: string;
  category_name: string;
  category_responsible: string;
  category_company: string;
  department_name: string;
  team_id: number;
  team_name: string;
}

interface Technician {
  id: number;
  user_id: number;
  name: string;
  team_name: string;
}

export const CreateRequestForm: React.FC = () => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      priority: 'medium',
      type: 'corrective'
    }
  });

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(false);

  const watchEquipment = watch('equipment_id');

  // Load equipment list
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await api.get('/equipment');
        setEquipment(response.data.data);
      } catch (error) {
        console.error('Failed to load equipment', error);
      }
    };
    fetchEquipment();
  }, []);

  // Auto-populate when equipment is selected
  useEffect(() => {
    if (watchEquipment) {
      const selected = equipment.find(e => e.id === parseInt(watchEquipment.toString()));
      if (selected) {
        setSelectedEquipment(selected);
        
        // Load technicians from selected equipment's team
        fetchTechniciansByTeam(selected.team_id);
      }
    } else {
      setSelectedEquipment(null);
      setTechnicians([]);
    }
  }, [watchEquipment, equipment]);

  const fetchTechniciansByTeam = async (teamId: number) => {
    try {
      const response = await api.get(`/teams/${teamId}/technicians`);
      setTechnicians(response.data.data);
    } catch (error) {
      console.error('Failed to load technicians', error);
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const response = await api.post('/requests', data);
      
      alert('Maintenance request created successfully!');
      // Redirect or reset form
      window.location.href = `/requests/${response.data.data.id}`;
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold">Create Maintenance Request</h2>

      {/* Subject */}
      <div>
        <label className="block font-medium mb-2">Subject *</label>
        <input
          {...register('subject', { required: 'Subject is required' })}
          className="w-full px-4 py-2 border rounded-lg"
          placeholder="Brief description of the issue"
        />
        {errors.subject && (
          <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
        )}
      </div>

      {/* Type */}
      <div>
        <label className="block font-medium mb-2">Request Type *</label>
        <select
          {...register('type', { required: 'Type is required' })}
          className="w-full px-4 py-2 border rounded-lg"
        >
          <option value="preventive">Preventive Maintenance</option>
          <option value="corrective">Corrective Maintenance</option>
          <option value="breakdown">Breakdown Repair</option>
        </select>
      </div>

      {/* Priority */}
      <div>
        <label className="block font-medium mb-2">Priority</label>
        <select
          {...register('priority')}
          className="w-full px-4 py-2 border rounded-lg"
        >
          <option value="low">🟢 Low</option>
          <option value="medium">🟡 Medium</option>
          <option value="high">🟠 High</option>
          <option value="critical">🔴 Critical</option>
        </select>
      </div>

      {/* Equipment Selection */}
      <div>
        <label className="block font-medium mb-2">Equipment *</label>
        <select
          {...register('equipment_id', { required: 'Equipment is required' })}
          className="w-full px-4 py-2 border rounded-lg"
        >
          <option value="">Select Equipment</option>
          {equipment.map(e => (
            <option key={e.id} value={e.id}>
              {e.name} - {e.serial_number} ({e.location})
            </option>
          ))}
        </select>
        {errors.equipment_id && (
          <p className="text-red-500 text-sm mt-1">{errors.equipment_id.message}</p>
        )}
      </div>

      {/* Auto-populated Equipment Details */}
      {selectedEquipment && (
        <div className="bg-blue-50 p-4 rounded-lg space-y-2">
          <h3 className="font-semibold text-blue-900">Equipment Details</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Category:</span>
              <span className="ml-2 font-medium">{selectedEquipment.category_name}</span>
            </div>
            <div>
              <span className="text-gray-600">Responsible:</span>
              <span className="ml-2 font-medium">{selectedEquipment.category_responsible}</span>
            </div>
            <div>
              <span className="text-gray-600">Company:</span>
              <span className="ml-2 font-medium">{selectedEquipment.category_company}</span>
            </div>
            <div>
              <span className="text-gray-600">Department:</span>
              <span className="ml-2 font-medium">{selectedEquipment.department_name}</span>
            </div>
            <div>
              <span className="text-gray-600">Team:</span>
              <span className="ml-2 font-medium">{selectedEquipment.team_name}</span>
            </div>
            <div>
              <span className="text-gray-600">Location:</span>
              <span className="ml-2 font-medium">{selectedEquipment.location}</span>
            </div>
          </div>
        </div>
      )}

      {/* Technician Selection */}
      {technicians.length > 0 && (
        <div>
          <label className="block font-medium mb-2">Assign Technician (Optional)</label>
          <select
            {...register('technician_id')}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">Auto-assign later</option>
            {technicians.map(t => (
              <option key={t.id} value={t.user_id}>
                {t.name} - {t.team_name}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Showing technicians from {selectedEquipment?.team_name}
          </p>
        </div>
      )}

      {/* Description */}
      <div>
        <label className="block font-medium mb-2">Description</label>
        <textarea
          {...register('description')}
          className="w-full px-4 py-2 border rounded-lg"
          rows={4}
          placeholder="Detailed description of the issue..."
        />
      </div>

      {/* Scheduled Date */}
      <div>
        <label className="block font-medium mb-2">Scheduled Date</label>
        <input
          type="datetime-local"
          {...register('scheduled_date')}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Request'}
      </button>
    </form>
  );
};
```

### 2. Request List Component with Filters

```typescript
// src/components/RequestList.tsx
import React, { useState, useEffect } from 'react';
import api from '../api/axios';

interface RequestFilters {
  status?: string;
  type?: string;
  priority?: string;
  equipment_id?: number;
  department_id?: number;
  team_id?: number;
  overdue?: boolean;
  search?: string;
  limit: number;
  offset: number;
}

export const RequestList: React.FC = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<RequestFilters>({
    limit: 20,
    offset: 0
  });
  const [pagination, setPagination] = useState({ total: 0, limit: 20, offset: 0 });

  useEffect(() => {
    fetchRequests();
  }, [filters]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/requests?${params.toString()}`);
      setRequests(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to load requests', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      repaired: 'bg-green-100 text-green-800',
      scrap: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || colors.new;
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Maintenance Requests</h1>
        <button
          onClick={() => window.location.href = '/requests/create'}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          + Create Request
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 grid grid-cols-5 gap-4">
        <select
          value={filters.status || ''}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-3 py-2 border rounded"
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="in_progress">In Progress</option>
          <option value="repaired">Repaired</option>
          <option value="scrap">Scrap</option>
        </select>

        <select
          value={filters.priority || ''}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className="px-3 py-2 border rounded"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>

        <select
          value={filters.type || ''}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="px-3 py-2 border rounded"
        >
          <option value="">All Types</option>
          <option value="preventive">Preventive</option>
          <option value="corrective">Corrective</option>
          <option value="breakdown">Breakdown</option>
        </select>

        <input
          type="text"
          placeholder="Search..."
          value={filters.search || ''}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="px-3 py-2 border rounded"
        />

        <button
          onClick={() => setFilters({ limit: 20, offset: 0 })}
          className="px-3 py-2 border rounded hover:bg-gray-50"
        >
          Clear Filters
        </button>
      </div>

      {/* Request Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Technician</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {requests.map((request: any) => (
              <tr
                key={request.id}
                onClick={() => window.location.href = `/requests/${request.id}`}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm">#{request.id}</td>
                <td className="px-6 py-4 text-sm font-medium">{request.subject}</td>
                <td className="px-6 py-4 text-sm">
                  {request.equipment_name}
                  <br />
                  <span className="text-xs text-gray-500">{request.equipment_location}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                    {request.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                    {request.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">{request.type}</td>
                <td className="px-6 py-4 text-sm">{request.technician_name || 'Unassigned'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(request.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} requests
          </div>
          <div className="flex gap-2">
            <button
              disabled={pagination.offset === 0}
              onClick={() => setFilters({ ...filters, offset: Math.max(0, filters.offset - filters.limit) })}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={pagination.offset + pagination.limit >= pagination.total}
              onClick={() => setFilters({ ...filters, offset: filters.offset + filters.limit })}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 3. Dashboard Component

```typescript
// src/components/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import api from '../api/axios';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    criticalEquipment: 0,
    technicianLoad: 0,
    openRequests: 0,
    overdueRequests: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch critical equipment
      const criticalResp = await api.get('/equipment?health_max=30');
      
      // Fetch open requests
      const openResp = await api.get('/requests?status=new&status=in_progress');
      
      // Fetch overdue
      const overdueResp = await api.get('/requests?overdue=true');
      
      // Fetch recent requests
      const recentResp = await api.get('/requests?limit=5&offset=0');

      setStats({
        criticalEquipment: criticalResp.data.pagination.total,
        technicianLoad: 85, // Calculate from team stats
        openRequests: openResp.data.pagination.total,
        overdueRequests: overdueResp.data.pagination.total
      });

      setRecentRequests(recentResp.data.data);
    } catch (error) {
      console.error('Failed to load dashboard', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-red-50 p-6 rounded-lg">
          <div className="text-red-600 text-sm font-medium">Critical Equipment</div>
          <div className="text-3xl font-bold mt-2">{stats.criticalEquipment} Units</div>
          <div className="text-xs text-red-500 mt-1">(Health &lt; 30%)</div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="text-blue-600 text-sm font-medium">Technician Load</div>
          <div className="text-3xl font-bold mt-2">{stats.technicianLoad}% Utilized</div>
          <div className="text-xs text-blue-500 mt-1">(Assign Carefully)</div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <div className="text-green-600 text-sm font-medium">Open Requests</div>
          <div className="text-3xl font-bold mt-2">{stats.openRequests} Pending</div>
          <div className="text-xs text-green-500 mt-1">{stats.overdueRequests} Overdue</div>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg">
          <div className="text-yellow-600 text-sm font-medium">This Month</div>
          <div className="text-3xl font-bold mt-2">45 Completed</div>
          <div className="text-xs text-yellow-500 mt-1">+12% from last month</div>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Recent Requests</h2>
        <div className="space-y-3">
          {recentRequests.map((request: any) => (
            <div key={request.id} className="flex justify-between items-center p-3 border rounded">
              <div>
                <div className="font-medium">{request.subject}</div>
                <div className="text-sm text-gray-500">
                  {request.equipment_name} - {request.technician_name || 'Unassigned'}
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  request.priority === 'critical' ? 'bg-red-100 text-red-800' :
                  request.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {request.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

---

## 📘 TypeScript Interfaces

```typescript
// src/types/index.ts

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'technician' | 'employee';
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: number;
  name: string;
  description: string;
  manager_id: number;
  manager_name: string;
  equipment_count: number;
  created_at: string;
}

export interface Team {
  id: number;
  name: string;
  description: string;
  color_code: string;
  technician_count: number;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  responsible_person: string;
  company: string;
  equipment_count: number;
  created_at: string;
}

export interface Equipment {
  id: number;
  name: string;
  serial_number: string;
  description: string;
  status: 'available' | 'in_maintenance' | 'out_of_service';
  health_status: number;
  location: string;
  department_id: number;
  department_name: string;
  category_id: number;
  category_name: string;
  category_responsible: string;
  category_company: string;
  team_id: number;
  team_name: string;
  installation_date: string;
  last_maintenance: string | null;
  next_maintenance: string | null;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceRequest {
  id: number;
  subject: string;
  type: 'preventive' | 'corrective' | 'breakdown';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'in_progress' | 'repaired' | 'scrap';
  description: string;
  equipment_id: number;
  equipment_name: string;
  equipment_serial: string;
  equipment_location: string;
  department_id: number;
  department_name: string;
  category_id: number;
  category_name: string;
  category_responsible: string;
  category_company: string;
  team_id: number;
  team_name: string;
  requester_id: number;
  requester_name: string;
  technician_id: number | null;
  technician_name: string | null;
  scheduled_date: string | null;
  start_date: string | null;
  end_date: string | null;
  duration_hours: number | null;
  created_at: string;
  updated_at: string;
}

export interface RequestLog {
  id: number;
  request_id: number;
  status: string;
  notes: string;
  duration_hours: number | null;
  changed_by_id: number;
  changed_by_name: string;
  created_at: string;
}

export interface Attachment {
  id: number;
  request_id: number;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  description: string;
  uploaded_by_id: number;
  uploaded_by_name: string;
  created_at: string;
}

export interface Technician {
  id: number;
  user_id: number;
  name: string;
  email: string;
  team_id: number;
  team_name: string;
  specialization: string;
  certification_level: string;
  active_requests: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
  };
}
```

---

## 🚀 Quick Start Integration

### Install Dependencies

```bash
npm install axios react-query @tanstack/react-query
```

### Setup React Query

```typescript
// src/main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

root.render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </QueryClientProvider>
);
```

### Custom Hooks

```typescript
// src/hooks/useRequests.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export const useRequests = (filters = {}) => {
  return useQuery({
    queryKey: ['requests', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters as any);
      const response = await api.get(`/requests?${params.toString()}`);
      return response.data;
    },
  });
};

export const useCreateRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/requests', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
};

export const useUpdateRequestStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, duration_hours }: any) => {
      const response = await api.put(`/requests/${id}/status`, { status, duration_hours });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
};
```

---

## ⚠️ Error Handling

```typescript
// src/utils/errorHandler.ts

export const handleApiError = (error: any) => {
  if (error.response) {
    // Server responded with error
    const message = error.response.data?.message || 'An error occurred';
    const status = error.response.status;

    switch (status) {
      case 400:
        return `Validation Error: ${message}`;
      case 401:
        return 'Unauthorized. Please login again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return message;
    }
  } else if (error.request) {
    // Request made but no response
    return 'Network error. Please check your connection.';
  } else {
    return 'An unexpected error occurred.';
  }
};

// Usage in component
try {
  await api.post('/requests', data);
} catch (error) {
  const errorMessage = handleApiError(error);
  toast.error(errorMessage); // or alert(errorMessage)
}
```

---

## 🎯 Testing Data

**Default Admin:**
- Email: `admin@gearguard.com`
- Password: `admin123`

**Test Users (all password: admin123):**
- manager@gearguard.com (Manager)
- john@gearguard.com (Technician)
- mike@gearguard.com (Technician)
- sarah@gearguard.com (Employee)

**Database includes:**
- 10 users
- 5 departments
- 8 equipment categories
- 5 maintenance teams
- 15 equipment items
- 20 maintenance requests (varying priorities)
- 18 activity logs
- 9 file attachments

---

## 📌 Key Frontend Implementation Notes

### 1. Equipment Selection Auto-Population
When user selects equipment, automatically populate:
- Category Name
- Category Responsible Person
- Category Company
- Department Name
- Team Name
- Location

Then filter available technicians by the equipment's team_id.

### 2. Priority Field
- Default: `medium`
- Options: `low`, `medium`, `high`, `critical`
- Display with color coding:
  - 🟢 Low (Green)
  - 🟡 Medium (Yellow)
  - 🟠 High (Orange)
  - 🔴 Critical (Red)

### 3. Status Workflow
```
new → in_progress → repaired
                 ↘ scrap
```

### 4. Real-time Updates
Consider using WebSockets or polling for:
- New request notifications
- Status change updates
- Technician assignments

### 5. File Uploads
Use FormData for file attachments:
```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('description', 'Photo of damage');

await api.post(`/attachments/${requestId}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

---

## 🔒 Role-Based Access Control

Implement route guards based on user roles:

```typescript
// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<Props> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user!.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
};

// Usage
<Route
  path="/admin/users"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <UserManagement />
    </ProtectedRoute>
  }
/>
```

---

## 📊 Sample API Calls Summary

```typescript
// Authentication
await api.post('/auth/login', { email, password });
await api.get('/auth/profile');

// Requests
await api.get('/requests?priority=critical&status=new');
await api.post('/requests', { subject, type, equipment_id, priority });
await api.get('/requests/123');
await api.put('/requests/123/status', { status: 'in_progress' });

// Equipment
await api.get('/equipment?department_id=1');
await api.get('/equipment/5');
await api.get('/equipment/5/requests');

// Teams & Technicians
await api.get('/teams');
await api.get('/teams/1/technicians');

// Statistics
await api.get('/requests/stats/team');
await api.get('/requests/stats/equipment');
await api.get('/requests/calendar?start_date=2024-12-01&end_date=2024-12-31');
```

---

## ✅ Complete Implementation Checklist

- [ ] Setup Axios with interceptors
- [ ] Create AuthContext and AuthProvider
- [ ] Implement login/logout functionality
- [ ] Create protected routes
- [ ] Build Dashboard with stats cards
- [ ] Build Request List with filters
- [ ] Build Create Request Form with auto-population
- [ ] Implement Request Detail View
- [ ] Add Status Update functionality
- [ ] Implement Technician Assignment
- [ ] Add File Upload for Attachments
- [ ] Create Equipment List & Detail views
- [ ] Build Calendar View for preventive maintenance
- [ ] Add notifications for new requests
- [ ] Implement role-based UI visibility
- [ ] Add error handling and loading states
- [ ] Create TypeScript interfaces
- [ ] Setup React Query for caching
- [ ] Add form validation
- [ ] Implement pagination
- [ ] Create mobile-responsive design

---

**🎉 You're all set to build the frontend! All APIs are tested and working with priority field support. Happy coding!**
