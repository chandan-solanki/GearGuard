# 🔧 Technician Dashboard - Complete Frontend Implementation Guide

## 📋 Overview

When a user with **role: "technician"** logs in, they should see a specialized dashboard that shows:
1. **My Requests  ** - Requests assigned to them
2. **Team Requests** - Unassigned requests from their team (they can accept)
3. **Personal Statistics** - Their performance metrics
4. **Quick Actions** - Accept requests, update status, etc.

---

## 🔌 API Endpoints for Technician Role

### Base URL: `http://localhost:3000/api`

### 1. GET /api/technicians/me
**Purpose:** Get current technician's profile (team, department info)  
**Access:** Private (Technician role only)  
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 5,
    "team_id": 1,
    "name": "John Technician",
    "email": "john@gearguard.com",
    "role": "technician",
    "team_name": "Mechanical Team",
    "team_color": "#FF5733",
    "department_name": "Production",
    "department_id": 1
  }
}
```

---

### 2. GET /api/technicians/me/requests
**Purpose:** Get all requests ASSIGNED TO the current technician  
**Access:** Private (Technician role only)

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by: new, in_progress, repaired, scrap |
| type | string | Filter by: preventive, corrective, breakdown |
| priority | string | Filter by: low, medium, high, critical |
| limit | number | Results per page (default: 50) |
| offset | number | Pagination offset |

**Example:** `GET /api/technicians/me/requests?status=new&priority=critical`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "subject": "Hydraulic pump failure",
      "type": "breakdown",
      "priority": "critical",
      "status": "new",
      "description": "Hydraulic system not building pressure",
      "equipment_id": 3,
      "equipment_name": "Hydraulic Press A",
      "serial_number": "HYD-2024-003",
      "equipment_location": "Production Floor B",
      "department_id": 1,
      "department_name": "Production",
      "category_name": "Hydraulic Systems",
      "category_responsible": "Mike Hydraulics",
      "category_company": "HydroTech Industries",
      "team_id": 1,
      "team_name": "Mechanical Team",
      "created_by_name": "Sarah Employee",
      "technician_id": 1,
      "technician_name": "John Technician",
      "scheduled_date": "2024-12-28T09:00:00.000Z",
      "is_overdue": 0,
      "created_at": "2024-12-27T08:00:00.000Z",
      "updated_at": "2024-12-27T08:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 8,
    "limit": 50,
    "offset": 0
  }
}
```

---

### 3. GET /api/technicians/me/team-requests
**Purpose:** Get ALL requests for technician's TEAM (for self-assignment)  
**Access:** Private (Technician role only)

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status |
| type | string | Filter by type |
| priority | string | Filter by priority |
| unassigned_only | boolean | Show only unassigned requests (true/false) |
| limit | number | Results per page |
| offset | number | Pagination offset |

**Example:** `GET /api/technicians/me/team-requests?unassigned_only=true&status=new`

**Response:** Same structure as above, but includes requests from the team where technician can self-assign

---

### 4. GET /api/technicians/me/stats
**Purpose:** Get personal statistics for the technician  
**Access:** Private (Technician role only)

**Response:**
```json
{
  "success": true,
  "data": {
    "total_assigned": 25,
    "new_requests": 3,
    "in_progress": 5,
    "completed": 15,
    "scrapped": 2,
    "overdue": 1,
    "critical_pending": 2,
    "high_pending": 3,
    "avg_resolution_hours": "4.5",
    "by_category": [
      { "category_name": "CNC Machines", "request_count": 10 },
      { "category_name": "Hydraulic Systems", "request_count": 8 },
      { "category_name": "Electrical Systems", "request_count": 7 }
    ],
    "by_type": [
      { "type": "preventive", "count": 12 },
      { "type": "corrective", "count": 8 },
      { "type": "breakdown", "count": 5 }
    ]
  }
}
```

---

### 5. PUT /api/technicians/me/accept-request/:requestId
**Purpose:** Technician self-assigns/accepts a request from their team  
**Access:** Private (Technician role only)

**URL:** `PUT /api/technicians/me/accept-request/15`

**Response:**
```json
{
  "success": true,
  "message": "Request accepted successfully",
  "data": {
    "id": 15,
    "subject": "Motor overheating",
    "technician_id": 1,
    "technician_name": "John Technician",
    "status": "new",
    ...
  }
}
```

**Error Cases:**
- 403: "This request belongs to a different team"
- 400: "This request is already assigned to another technician"

---

### 6. PUT /api/requests/:id/status
**Purpose:** Update request status (used when technician starts/completes work)  
**Access:** Private

**Request Body:**
```json
{
  "status": "in_progress"
}
```
or
```json
{
  "status": "repaired",
  "duration_hours": 3.5
}
```

**Valid Status Values:** `new`, `in_progress`, `repaired`, `scrap`

---

## 🎨 Frontend Component Structure

```
src/
├── pages/
│   └── technician/
│       ├── TechnicianDashboard.tsx      # Main dashboard
│       ├── MyRequests.tsx                # Assigned requests list
│       ├── TeamRequests.tsx              # Team requests (for self-assign)
│       └── RequestDetail.tsx             # Single request view
├── components/
│   └── technician/
│       ├── TechnicianStats.tsx           # Stats cards
│       ├── RequestCard.tsx               # Request card component
│       ├── PriorityBadge.tsx             # Priority indicator
│       ├── StatusBadge.tsx               # Status indicator
│       ├── AcceptRequestButton.tsx       # Accept/self-assign button
│       └── StatusUpdateModal.tsx         # Modal for status changes
├── hooks/
│   └── useTechnician.ts                  # Custom hooks for technician APIs
└── types/
    └── technician.ts                     # TypeScript interfaces
```

---

## 📦 TypeScript Interfaces

```typescript
// src/types/technician.ts

export interface TechnicianProfile {
  id: number;
  user_id: number;
  team_id: number;
  name: string;
  email: string;
  role: 'technician';
  team_name: string;
  team_color: string;
  department_name: string;
  department_id: number;
}

export interface TechnicianRequest {
  id: number;
  subject: string;
  type: 'preventive' | 'corrective' | 'breakdown';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'in_progress' | 'repaired' | 'scrap';
  description: string;
  equipment_id: number;
  equipment_name: string;
  serial_number: string;
  equipment_location: string;
  department_id: number;
  department_name: string;
  category_name: string;
  category_responsible: string;
  category_company: string;
  team_id: number;
  team_name: string;
  created_by_name: string;
  technician_id: number | null;
  technician_name: string | null;
  scheduled_date: string | null;
  is_overdue: number;
  created_at: string;
  updated_at: string;
}

export interface TechnicianStats {
  total_assigned: number;
  new_requests: number;
  in_progress: number;
  completed: number;
  scrapped: number;
  overdue: number;
  critical_pending: number;
  high_pending: number;
  avg_resolution_hours: string | null;
  by_category: Array<{
    category_name: string;
    request_count: number;
  }>;
  by_type: Array<{
    type: string;
    count: number;
  }>;
}

export interface RequestFilters {
  status?: string;
  type?: string;
  priority?: string;
  unassigned_only?: boolean;
  limit?: number;
  offset?: number;
}
```

---

## 🪝 Custom React Hooks

```typescript
// src/hooks/useTechnician.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { TechnicianProfile, TechnicianRequest, TechnicianStats, RequestFilters } from '../types/technician';

// Get technician profile
export const useTechnicianProfile = () => {
  return useQuery<TechnicianProfile>({
    queryKey: ['technician', 'profile'],
    queryFn: async () => {
      const response = await api.get('/technicians/me');
      return response.data.data;
    },
  });
};

// Get my assigned requests
export const useMyRequests = (filters: RequestFilters = {}) => {
  return useQuery({
    queryKey: ['technician', 'myRequests', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
      const response = await api.get(`/technicians/me/requests?${params.toString()}`);
      return response.data;
    },
  });
};

// Get team requests (for self-assignment)
export const useTeamRequests = (filters: RequestFilters = {}) => {
  return useQuery({
    queryKey: ['technician', 'teamRequests', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
      const response = await api.get(`/technicians/me/team-requests?${params.toString()}`);
      return response.data;
    },
  });
};

// Get my statistics
export const useMyStats = () => {
  return useQuery<TechnicianStats>({
    queryKey: ['technician', 'stats'],
    queryFn: async () => {
      const response = await api.get('/technicians/me/stats');
      return response.data.data;
    },
  });
};

// Accept/self-assign a request
export const useAcceptRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: number) => {
      const response = await api.put(`/technicians/me/accept-request/${requestId}`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate both my requests and team requests
      queryClient.invalidateQueries({ queryKey: ['technician', 'myRequests'] });
      queryClient.invalidateQueries({ queryKey: ['technician', 'teamRequests'] });
      queryClient.invalidateQueries({ queryKey: ['technician', 'stats'] });
    },
  });
};

// Update request status
export const useUpdateRequestStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, status, duration_hours }: { 
      requestId: number; 
      status: string; 
      duration_hours?: number 
    }) => {
      const response = await api.put(`/requests/${requestId}/status`, { 
        status, 
        duration_hours 
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technician'] });
    },
  });
};
```

---

## 🖥️ Main Technician Dashboard Component

```typescript
// src/pages/technician/TechnicianDashboard.tsx
import React, { useState } from 'react';
import { 
  useTechnicianProfile, 
  useMyRequests, 
  useTeamRequests, 
  useMyStats,
  useAcceptRequest,
  useUpdateRequestStatus 
} from '../../hooks/useTechnician';

export const TechnicianDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'my' | 'team'>('my');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Fetch data
  const { data: profile, isLoading: profileLoading } = useTechnicianProfile();
  const { data: stats, isLoading: statsLoading } = useMyStats();
  const { data: myRequestsData, isLoading: myRequestsLoading } = useMyRequests({
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
  });
  const { data: teamRequestsData, isLoading: teamRequestsLoading } = useTeamRequests({
    unassigned_only: true,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
  });

  // Mutations
  const acceptRequestMutation = useAcceptRequest();
  const updateStatusMutation = useUpdateRequestStatus();

  const handleAcceptRequest = async (requestId: number) => {
    try {
      await acceptRequestMutation.mutateAsync(requestId);
      alert('Request accepted successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleStartWork = async (requestId: number) => {
    try {
      await updateStatusMutation.mutateAsync({ requestId, status: 'in_progress' });
      alert('Work started!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleCompleteWork = async (requestId: number, durationHours: number) => {
    try {
      await updateStatusMutation.mutateAsync({ 
        requestId, 
        status: 'repaired', 
        duration_hours: durationHours 
      });
      alert('Request completed!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to complete request');
    }
  };

  if (profileLoading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header with Technician Info */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {profile?.name}
        </h1>
        <div className="mt-2 flex items-center gap-4">
          <span 
            className="px-3 py-1 rounded-full text-white text-sm font-medium"
            style={{ backgroundColor: profile?.team_color }}
          >
            {profile?.team_name}
          </span>
          <span className="text-gray-600">{profile?.department_name}</span>
        </div>
      </div>

      {/* Statistics Cards */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {/* Assigned Requests */}
          <StatCard 
            title="My Requests" 
            value={stats.total_assigned} 
            color="blue" 
          />
          
          {/* In Progress */}
          <StatCard 
            title="In Progress" 
            value={stats.in_progress} 
            color="purple" 
          />
          
          {/* Completed */}
          <StatCard 
            title="Completed" 
            value={stats.completed} 
            color="green" 
          />
          
          {/* Critical Pending */}
          <StatCard 
            title="Critical" 
            value={stats.critical_pending} 
            color="red"
            warning={stats.critical_pending > 0}
          />
          
          {/* Overdue */}
          <StatCard 
            title="Overdue" 
            value={stats.overdue} 
            color="orange"
            warning={stats.overdue > 0}
          />
          
          {/* Avg Resolution Time */}
          <StatCard 
            title="Avg Time" 
            value={stats.avg_resolution_hours ? `${stats.avg_resolution_hours}h` : '-'} 
            color="teal" 
          />
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('my')}
            className={`py-3 px-4 font-medium border-b-2 transition-colors ${
              activeTab === 'my'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Requests ({myRequestsData?.pagination?.total || 0})
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`py-3 px-4 font-medium border-b-2 transition-colors ${
              activeTab === 'team'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Available Team Requests ({teamRequestsData?.pagination?.total || 0})
          </button>
        </nav>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4 flex-wrap">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="in_progress">In Progress</option>
          <option value="repaired">Repaired</option>
          <option value="scrap">Scrap</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">All Priorities</option>
          <option value="critical">🔴 Critical</option>
          <option value="high">🟠 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">🟢 Low</option>
        </select>

        <button
          onClick={() => { setStatusFilter(''); setPriorityFilter(''); }}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Clear Filters
        </button>
      </div>

      {/* Request Lists */}
      {activeTab === 'my' ? (
        <MyRequestsList 
          requests={myRequestsData?.data || []}
          loading={myRequestsLoading}
          onStartWork={handleStartWork}
          onCompleteWork={handleCompleteWork}
        />
      ) : (
        <TeamRequestsList 
          requests={teamRequestsData?.data || []}
          loading={teamRequestsLoading}
          onAcceptRequest={handleAcceptRequest}
        />
      )}
    </div>
  );
};

// ========== Sub-Components ==========

interface StatCardProps {
  title: string;
  value: number | string;
  color: string;
  warning?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color, warning }) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
    teal: 'bg-teal-50 text-teal-600',
  };

  return (
    <div className={`p-4 rounded-lg ${colorClasses[color]} ${warning ? 'ring-2 ring-red-400 animate-pulse' : ''}`}>
      <div className="text-sm font-medium opacity-80">{title}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
};

// My Requests List Component
interface MyRequestsListProps {
  requests: any[];
  loading: boolean;
  onStartWork: (id: number) => void;
  onCompleteWork: (id: number, hours: number) => void;
}

const MyRequestsList: React.FC<MyRequestsListProps> = ({ 
  requests, 
  loading, 
  onStartWork, 
  onCompleteWork 
}) => {
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [hours, setHours] = useState('');

  if (loading) return <div className="text-center py-8">Loading requests...</div>;
  if (requests.length === 0) return <div className="text-center py-8 text-gray-500">No requests assigned to you</div>;

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div 
          key={request.id} 
          className={`bg-white rounded-lg shadow p-6 border-l-4 ${
            request.priority === 'critical' ? 'border-red-500' :
            request.priority === 'high' ? 'border-orange-500' :
            request.priority === 'medium' ? 'border-yellow-500' :
            'border-green-500'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg font-semibold">#{request.id}</span>
                <h3 className="text-lg font-medium">{request.subject}</h3>
                {request.is_overdue === 1 && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                    OVERDUE
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-500">Equipment:</span>
                  <div className="font-medium">{request.equipment_name}</div>
                  <div className="text-xs text-gray-400">{request.equipment_location}</div>
                </div>
                <div>
                  <span className="text-gray-500">Category:</span>
                  <div className="font-medium">{request.category_name}</div>
                  <div className="text-xs text-gray-400">{request.category_company}</div>
                </div>
                <div>
                  <span className="text-gray-500">Type:</span>
                  <div className="font-medium capitalize">{request.type}</div>
                </div>
                <div>
                  <span className="text-gray-500">Scheduled:</span>
                  <div className="font-medium">
                    {request.scheduled_date 
                      ? new Date(request.scheduled_date).toLocaleDateString()
                      : 'Not scheduled'}
                  </div>
                </div>
              </div>

              {request.description && (
                <p className="text-gray-600 text-sm mb-4">{request.description}</p>
              )}

              {/* Badges */}
              <div className="flex gap-2">
                <PriorityBadge priority={request.priority} />
                <StatusBadge status={request.status} />
              </div>
            </div>

            {/* Actions */}
            <div className="ml-4 flex flex-col gap-2">
              {request.status === 'new' && (
                <button
                  onClick={() => onStartWork(request.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
                >
                  ▶️ Start Work
                </button>
              )}

              {request.status === 'in_progress' && completingId !== request.id && (
                <button
                  onClick={() => setCompletingId(request.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 whitespace-nowrap"
                >
                  ✅ Complete
                </button>
              )}

              {completingId === request.id && (
                <div className="flex flex-col gap-2">
                  <input
                    type="number"
                    placeholder="Hours spent"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="px-3 py-2 border rounded-lg w-32"
                    step="0.5"
                    min="0.5"
                  />
                  <button
                    onClick={() => {
                      onCompleteWork(request.id, parseFloat(hours));
                      setCompletingId(null);
                      setHours('');
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setCompletingId(null)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <a
                href={`/requests/${request.id}`}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-center"
              >
                View Details
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Team Requests List Component (for self-assignment)
interface TeamRequestsListProps {
  requests: any[];
  loading: boolean;
  onAcceptRequest: (id: number) => void;
}

const TeamRequestsList: React.FC<TeamRequestsListProps> = ({ 
  requests, 
  loading, 
  onAcceptRequest 
}) => {
  if (loading) return <div className="text-center py-8">Loading team requests...</div>;
  if (requests.length === 0) return (
    <div className="text-center py-8 text-gray-500">
      No unassigned requests available for your team
    </div>
  );

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div 
          key={request.id} 
          className={`bg-white rounded-lg shadow p-6 border-l-4 ${
            request.priority === 'critical' ? 'border-red-500' :
            request.priority === 'high' ? 'border-orange-500' :
            request.priority === 'medium' ? 'border-yellow-500' :
            'border-green-500'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg font-semibold">#{request.id}</span>
                <h3 className="text-lg font-medium">{request.subject}</h3>
                {request.is_overdue === 1 && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                    OVERDUE
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-500">Equipment:</span>
                  <div className="font-medium">{request.equipment_name}</div>
                  <div className="text-xs text-gray-400">{request.equipment_location}</div>
                </div>
                <div>
                  <span className="text-gray-500">Category:</span>
                  <div className="font-medium">{request.category_name}</div>
                  <div className="text-xs text-gray-400">{request.category_company}</div>
                </div>
                <div>
                  <span className="text-gray-500">Requested By:</span>
                  <div className="font-medium">{request.created_by_name}</div>
                </div>
                <div>
                  <span className="text-gray-500">Created:</span>
                  <div className="font-medium">
                    {new Date(request.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {request.description && (
                <p className="text-gray-600 text-sm mb-4">{request.description}</p>
              )}

              {/* Badges */}
              <div className="flex gap-2">
                <PriorityBadge priority={request.priority} />
                <StatusBadge status={request.status} />
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  {request.type}
                </span>
              </div>
            </div>

            {/* Accept Button */}
            <div className="ml-4">
              <button
                onClick={() => onAcceptRequest(request.id)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
              >
                <span>✋</span>
                Accept Request
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Priority Badge Component
const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const colors: Record<string, string> = {
    critical: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
  };

  const icons: Record<string, string> = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🟢',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority]}`}>
      {icons[priority]} {priority}
    </span>
  );
};

// Status Badge Component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    repaired: 'bg-green-100 text-green-800',
    scrap: 'bg-gray-100 text-gray-800',
  };

  const labels: Record<string, string> = {
    new: 'New',
    in_progress: 'In Progress',
    repaired: 'Completed',
    scrap: 'Scrapped',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
      {labels[status]}
    </span>
  );
};

export default TechnicianDashboard;
```

---

## 🔒 Role-Based Routing

```typescript
// src/App.tsx or src/routes/index.tsx
import { useAuth } from './context/AuthContext';
import { Navigate, Route, Routes } from 'react-router-dom';

// Components
import TechnicianDashboard from './pages/technician/TechnicianDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';

const AppRoutes = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Role-based default redirect
  const getDefaultRoute = () => {
    switch (user?.role) {
      case 'technician':
        return '/technician';
      case 'admin':
      case 'manager':
        return '/admin';
      default:
        return '/dashboard';
    }
  };

  return (
    <Routes>
      {/* Technician Routes */}
      {user?.role === 'technician' && (
        <>
          <Route path="/technician" element={<TechnicianDashboard />} />
          <Route path="/technician/requests" element={<TechnicianDashboard />} />
          <Route path="/requests/:id" element={<RequestDetail />} />
        </>
      )}

      {/* Admin/Manager Routes */}
      {(user?.role === 'admin' || user?.role === 'manager') && (
        <>
          <Route path="/admin/*" element={<AdminDashboard />} />
        </>
      )}

      {/* Employee Routes */}
      {user?.role === 'employee' && (
        <>
          <Route path="/dashboard" element={<EmployeeDashboard />} />
          <Route path="/requests/create" element={<CreateRequest />} />
        </>
      )}

      {/* Default redirect based on role */}
      <Route path="*" element={<Navigate to={getDefaultRoute()} />} />
    </Routes>
  );
};
```

---

## 🎯 Key Features Summary

### For Technician Dashboard:

1. **Profile Section**
   - Shows technician name, team (with color), department
   - Team identification for filtering

2. **Statistics Cards**
   - Total assigned requests
   - In-progress count
   - Completed count
   - Critical pending (with warning animation)
   - Overdue count (with warning)
   - Average resolution time

3. **My Requests Tab**
   - All requests assigned to the technician
   - Filter by status, priority, type
   - Actions: Start Work, Complete, View Details
   - Color-coded priority borders
   - Overdue warning badges

4. **Team Requests Tab**
   - Unassigned requests from the same team
   - Self-assignment with "Accept Request" button
   - Shows category and equipment details
   - Priority sorting (critical first)

5. **Quick Actions**
   - Start Work → Changes status to "in_progress"
   - Complete → Changes status to "repaired" with duration
   - Accept Request → Self-assigns the technician

---

## 📊 Test Data for Technicians

Login with:
- **Email:** `john@gearguard.com`
- **Password:** `admin123`
- **Role:** technician
- **Team:** Mechanical Team

Or:
- **Email:** `mike@gearguard.com`
- **Password:** `admin123`
- **Role:** technician
- **Team:** Electrical Team

---

## ✅ Implementation Checklist

- [ ] Create TechnicianDashboard page
- [ ] Implement useTechnician hooks
- [ ] Create TypeScript interfaces
- [ ] Build StatCard components
- [ ] Build RequestCard with priority border
- [ ] Implement PriorityBadge and StatusBadge
- [ ] Create "My Requests" list with actions
- [ ] Create "Team Requests" list with Accept button
- [ ] Add filter dropdowns (status, priority)
- [ ] Implement role-based routing
- [ ] Add status update functionality
- [ ] Add duration input for completion
- [ ] Create mobile-responsive layout
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add empty state messages

---

## 🚀 API Summary for Technician Role

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/technicians/me` | GET | Get technician profile |
| `/api/technicians/me/requests` | GET | Get assigned requests |
| `/api/technicians/me/team-requests` | GET | Get team requests |
| `/api/technicians/me/stats` | GET | Get personal statistics |
| `/api/technicians/me/accept-request/:id` | PUT | Self-assign a request |
| `/api/requests/:id/status` | PUT | Update request status |
| `/api/requests/:id` | GET | Get request details |
| `/api/requests/:id/logs` | GET | Get request activity logs |

---

**🎉 All APIs are implemented and ready! Build the frontend components using this guide.**
