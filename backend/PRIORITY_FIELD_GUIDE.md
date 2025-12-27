# 🚨 Priority Field - API Documentation

## Overview
The maintenance request system now supports a **priority** field to help teams manage urgent repairs and schedule preventive maintenance effectively.

---

## Priority Levels

| Priority | Value | Description | Use Case |
|----------|-------|-------------|----------|
| 🔴 **Critical** | `critical` | Immediate attention required | Equipment failure causing safety hazards or production stoppage |
| 🟠 **High** | `high` | Urgent, needs quick resolution | Equipment malfunction affecting operations |
| 🟡 **Medium** | `medium` | Normal priority (default) | Routine maintenance, non-urgent issues |
| 🟢 **Low** | `low` | Can be scheduled flexibly | Cosmetic issues, minor improvements |

---

## API Changes

### 1. Create Maintenance Request (POST /api/requests)

**Request Body:**
```json
{
  "subject": "Hydraulic Press emergency repair",
  "type": "corrective",
  "priority": "critical",
  "description": "Press stopped working, production line halted",
  "equipment_id": 1,
  "scheduled_date": "2024-01-25T09:00:00"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Maintenance request created successfully",
  "data": {
    "id": 25,
    "subject": "Hydraulic Press emergency repair",
    "type": "corrective",
    "priority": "critical",
    "status": "new",
    "equipment_name": "Hydraulic Press #1"
  }
}
```

---

### 2. Get All Requests with Priority Filter (GET /api/requests)

**Query Parameters:**
- `priority` - Filter by priority level: `low`, `medium`, `high`, `critical`

**Examples:**

**Get all critical requests:**
```
GET http://localhost:3001/api/requests?priority=critical
```

**Get high priority corrective requests:**
```
GET http://localhost:3001/api/requests?priority=high&type=corrective
```

**Get critical + high priority requests (make 2 requests and merge):**
```
GET http://localhost:3001/api/requests?priority=critical
GET http://localhost:3001/api/requests?priority=high
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": 25,
        "subject": "Hydraulic Press emergency repair",
        "type": "corrective",
        "priority": "critical",
        "status": "new",
        "equipment_name": "Hydraulic Press #1",
        "department_name": "Manufacturing",
        "technician_name": null,
        "scheduled_date": "2024-01-25T09:00:00.000Z",
        "is_overdue": 0,
        "created_at": "2024-01-24T15:30:00.000Z"
      },
      {
        "id": 24,
        "subject": "CNC Machine coolant leak",
        "type": "corrective",
        "priority": "high",
        "status": "in_progress",
        "equipment_name": "CNC Machine #2",
        "department_name": "Manufacturing",
        "technician_name": "Mike Johnson",
        "scheduled_date": "2024-01-25T10:00:00.000Z",
        "is_overdue": 0,
        "created_at": "2024-01-24T14:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 2,
      "limit": 50,
      "offset": 0
    }
  }
}
```

---

### 3. Get Request Details (GET /api/requests/:id)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 25,
    "subject": "Hydraulic Press emergency repair",
    "type": "corrective",
    "priority": "critical",
    "description": "Press stopped working, production line halted",
    "equipment_id": 1,
    "equipment_name": "Hydraulic Press #1",
    "serial_number": "HP-2024-001",
    "category_name": "Hydraulic Press",
    "department_name": "Manufacturing",
    "team_name": "Mechanical Team",
    "technician_id": 1,
    "technician_name": "Mike Johnson",
    "scheduled_date": "2024-01-25T09:00:00.000Z",
    "duration_hours": "0.00",
    "status": "new",
    "created_by": 3,
    "created_by_name": "Sarah Connor",
    "is_overdue": 0,
    "created_at": "2024-01-24T15:30:00.000Z",
    "updated_at": "2024-01-24T15:30:00.000Z"
  }
}
```

---

### 4. Update Request (PUT /api/requests/:id)

**Request Body:**
```json
{
  "priority": "critical",
  "scheduled_date": "2024-01-25T08:00:00"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Request updated successfully",
  "data": {
    "id": 25,
    "priority": "critical",
    "scheduled_date": "2024-01-25T08:00:00.000Z"
  }
}
```

---

## Default Sorting Behavior

Requests are now automatically sorted by:
1. **Priority** (critical → high → medium → low)
2. **Creation date** (newest first)

This ensures critical requests always appear at the top of the list.

**Example Query:**
```
GET /api/requests
```

**Result Order:**
1. Critical priority requests (newest first)
2. High priority requests (newest first)
3. Medium priority requests (newest first)
4. Low priority requests (newest first)

---

## Frontend Implementation Tips

### TypeScript Interface
```typescript
interface MaintenanceRequest {
  id: number;
  subject: string;
  type: 'corrective' | 'preventive';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  equipment_id: number;
  equipment_name: string;
  department_name: string;
  team_name: string;
  technician_name?: string;
  scheduled_date?: string;
  status: 'new' | 'in_progress' | 'repaired' | 'scrap';
  is_overdue: 0 | 1;
  created_at: string;
  updated_at: string;
}
```

### Priority Badge Component (React)
```jsx
const PriorityBadge = ({ priority }) => {
  const config = {
    critical: { color: 'red', icon: '🔴', label: 'Critical' },
    high: { color: 'orange', icon: '🟠', label: 'High' },
    medium: { color: 'yellow', icon: '🟡', label: 'Medium' },
    low: { color: 'green', icon: '🟢', label: 'Low' }
  };
  
  const { color, icon, label } = config[priority];
  
  return (
    <span className={`badge badge-${color}`}>
      {icon} {label}
    </span>
  );
};
```

### Priority Filter Component (React)
```jsx
const PriorityFilter = ({ value, onChange }) => {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}>
      <option value="">All Priorities</option>
      <option value="critical">🔴 Critical</option>
      <option value="high">🟠 High</option>
      <option value="medium">🟡 Medium</option>
      <option value="low">🟢 Low</option>
    </select>
  );
};
```

### Priority Selector (Form)
```jsx
<div className="form-group">
  <label htmlFor="priority">Priority Level</label>
  <select 
    id="priority" 
    name="priority" 
    defaultValue="medium"
    required
  >
    <option value="low">🟢 Low - Can be scheduled flexibly</option>
    <option value="medium">🟡 Medium - Normal priority</option>
    <option value="high">🟠 High - Urgent, needs quick resolution</option>
    <option value="critical">🔴 Critical - Immediate attention required</option>
  </select>
</div>
```

---

## Migration for Existing Database

If you already have a database with maintenance requests, run this migration:

```bash
mysql -u root -p gearguard_db < migrations/add_priority_field.sql
```

Or manually in MySQL:
```sql
USE gearguard_db;
ALTER TABLE maintenance_requests 
ADD COLUMN priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium' 
AFTER type;
ALTER TABLE maintenance_requests ADD INDEX idx_request_priority (priority);
```

---

## Business Logic Recommendations

### Auto-assign Priority Rules
Consider implementing these rules in your application:

1. **Auto-escalate to Critical:**
   - Equipment with "scrapped" status in repair
   - Safety-related issues
   - Production line stoppage

2. **Auto-set to High:**
   - Overdue requests (past scheduled date)
   - Corrective maintenance on critical equipment
   - Warranty expiring soon

3. **Default to Medium:**
   - Preventive maintenance
   - Routine inspections
   - New requests without specified priority

4. **Set to Low:**
   - Cosmetic issues
   - Documentation updates
   - Training requests

---

## Testing Examples

### cURL Commands

**Create critical priority request:**
```bash
curl -X POST http://localhost:3001/api/requests \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Emergency: Generator failure",
    "type": "corrective",
    "priority": "critical",
    "equipment_id": 4,
    "scheduled_date": "2024-01-25T08:00:00"
  }'
```

**Filter by priority:**
```bash
curl "http://localhost:3001/api/requests?priority=critical&status=new" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Update priority:**
```bash
curl -X PUT http://localhost:3001/api/requests/25 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"priority": "high"}'
```

---

## Common Query Combinations

| Query | URL |
|-------|-----|
| Critical + New | `/requests?priority=critical&status=new` |
| High Priority Corrective | `/requests?priority=high&type=corrective` |
| All High/Critical in Manufacturing | `/requests?department_id=2&priority=high` |
| Overdue Critical Requests | `/requests?priority=critical&overdue=true` |
| Medium Priority for Team 1 | `/requests?team_id=1&priority=medium` |

---

**Last Updated:** December 27, 2025  
**Version:** 1.2.0
