# 📊 GearGuard Database Schema - ER Diagram

## Entity Relationship Overview

```
┌─────────────┐
│   USERS     │
│─────────────│
│ id PK       │◄─────┐
│ name        │      │
│ email       │      │
│ password    │      │
│ role        │      │
└─────────────┘      │
       ▲             │
       │             │
       │             │
┌──────┴────────┐    │
│  TECHNICIANS  │    │
│───────────────│    │
│ id PK         │    │
│ user_id FK    │────┘
│ team_id FK    │────┐
└───────────────┘    │
                     │
┌────────────────────┴─────┐
│   MAINTENANCE_TEAMS      │
│──────────────────────────│
│ id PK                    │◄────┐
│ name                     │     │
│ department_id FK         │─────┤
└──────────────────────────┘     │
                                 │
┌────────────────────────────────┴┐
│        DEPARTMENTS               │
│──────────────────────────────────│
│ id PK                            │◄─────┐
│ name                             │      │
│ description                      │      │
└──────────────────────────────────┘      │
                                          │
                                          │
┌─────────────────────────────────────────┴──┐
│            EQUIPMENT                        │
│────────────────────────────────────────────│
│ id PK                                      │◄───┐
│ name                                       │    │
│ serial_number                              │    │
│ category                                   │    │
│ status (active/scrapped)                   │    │
│ department_id FK                           │────┤
│ team_id FK                                 │────┘
└────────────────────────────────────────────┘
                    ▲
                    │
                    │
┌───────────────────┴─────────────────────────┐
│       MAINTENANCE_REQUESTS                   │
│──────────────────────────────────────────────│
│ id PK                                        │◄────┐
│ subject                                      │     │
│ type (corrective/preventive)                 │     │
│ description                                  │     │
│ status (new/in_progress/repaired/scrap)      │     │
│ equipment_id FK                              │─────┤
│ department_id FK                             │     │
│ team_id FK                                   │     │
│ technician_id FK                             │     │
│ created_by FK                                │     │
│ scheduled_date                               │     │
│ duration_hours                               │     │
└──────────────────────────────────────────────┘     │
            │                   │                     │
            │                   │                     │
    ┌───────┴────────┐  ┌──────┴──────────┐          │
    │                │  │                  │          │
┌───▼───────────┐  ┌─▼──────────────┐     │          │
│ ATTACHMENTS   │  │ MAINTENANCE     │     │          │
│───────────────│  │ LOGS            │     │          │
│ id PK         │  │─────────────────│     │          │
│ request_id FK │  │ id PK           │     │          │
│ file_name     │  │ request_id FK   │─────┘          │
│ file_path     │  │ old_status      │                │
│ uploaded_by   │  │ new_status      │                │
└───────────────┘  │ changed_by FK   │                │
                   │ changed_at      │                │
                   │ notes           │                │
                   └─────────────────┘                │
                                                      │
┌─────────────────────────────────────────────────────┘
│  REFRESH_TOKENS
│──────────────────
│ id PK
│ user_id FK
│ token
│ expires_at
└──────────────────
```

---

## Key Relationships

### 1. User → Technician (1:1)
- A user can be assigned as a technician
- Links users table to technicians table via `user_id`

### 2. Department → Teams (1:N)
- One department has many maintenance teams
- `maintenance_teams.department_id` → `departments.id`

### 3. Team → Technicians (1:N)
- One team has many technicians
- `technicians.team_id` → `maintenance_teams.id`

### 4. Department → Equipment (1:N)
- One department has many equipment items
- `equipment.department_id` → `departments.id`

### 5. Team → Equipment (1:N)
- One team is responsible for many equipment items
- `equipment.team_id` → `maintenance_teams.id`

### 6. Equipment → Maintenance Requests (1:N)
- One equipment item can have many maintenance requests
- `maintenance_requests.equipment_id` → `equipment.id`

### 7. Technician → Maintenance Requests (1:N)
- One technician can be assigned to many requests
- `maintenance_requests.technician_id` → `technicians.id`

### 8. User → Maintenance Requests (1:N)
- One user can create many requests
- `maintenance_requests.created_by` → `users.id`

### 9. Maintenance Request → Logs (1:N)
- Each request has a history of status changes
- `maintenance_logs.request_id` → `maintenance_requests.id`

### 10. Maintenance Request → Attachments (1:N)
- Each request can have multiple file attachments
- `attachments.request_id` → `maintenance_requests.id`

### 11. User → Refresh Tokens (1:N)
- Each user can have multiple refresh tokens (for multiple devices)
- `refresh_tokens.user_id` → `users.id`

---

## Business Rules

### 1. Equipment Assignment
- Equipment MUST belong to exactly ONE department
- Equipment MUST be assigned to exactly ONE maintenance team
- Team's department MUST match equipment's department

### 2. Request Creation
- When creating a request, `department_id` and `team_id` are **auto-filled** from the selected equipment
- User creating the request is stored in `created_by` field

### 3. Status Change Logging
- Every status change creates an entry in `maintenance_logs`
- Logs track: old_status → new_status, timestamp, and who made the change

### 4. Equipment Scrapping
- When request status changes to `"scrap"`, the equipment status automatically updates to `"scrapped"`
- Scrapped equipment cannot be used for new requests

### 5. Technician Assignment
- Only users with role `"technician"` can be assigned to requests
- Technician must belong to the same team as the equipment

### 6. Preventive Maintenance
- Requests with `type="preventive"` and a `scheduled_date` appear in calendar view
- Overdue flag is set when `scheduled_date < NOW()` and status is not `"repaired"` or `"scrap"`

---

## Database Indexes

### Primary Keys
- All tables have `id` as primary key (AUTO_INCREMENT)

### Foreign Key Indexes
- `users.email` (UNIQUE)
- `equipment.serial_number` (UNIQUE)
- `refresh_tokens.token` (UNIQUE)
- `technicians.user_id` (UNIQUE)

### Performance Indexes
- `maintenance_requests.equipment_id`
- `maintenance_requests.team_id`
- `maintenance_requests.status`
- `maintenance_requests.scheduled_date`
- `maintenance_logs.request_id`
- `attachments.request_id`

---

## Cascade Rules

### ON DELETE CASCADE
- Deleting a department → deletes all teams in that department
- Deleting a team → deletes all technicians in that team
- Deleting equipment → deletes all requests for that equipment
- Deleting a request → deletes all logs and attachments for that request
- Deleting a user → deletes all their refresh tokens

### ON DELETE SET NULL
- Deleting a technician → sets `technician_id = NULL` in requests
- Deleting a user → sets `uploaded_by = NULL` in attachments

---

## Data Types Summary

### Enums
- `users.role`: `'admin', 'manager', 'technician', 'employee'`
- `equipment.status`: `'active', 'scrapped'`
- `maintenance_requests.type`: `'corrective', 'preventive'`
- `maintenance_requests.status`: `'new', 'in_progress', 'repaired', 'scrap'`

### Timestamps
- All tables have `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- Most tables have `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

---

## Sample Query Patterns

### Get all requests for an equipment with details
```sql
SELECT mr.*, e.name as equipment_name, t.name as technician_name
FROM maintenance_requests mr
JOIN equipment e ON mr.equipment_id = e.id
LEFT JOIN technicians t ON mr.technician_id = t.id
WHERE mr.equipment_id = ?
ORDER BY mr.created_at DESC;
```

### Get overdue preventive maintenance
```sql
SELECT * FROM maintenance_requests
WHERE type = 'preventive'
  AND scheduled_date < NOW()
  AND status NOT IN ('repaired', 'scrap');
```

### Get request history
```sql
SELECT * FROM maintenance_logs
WHERE request_id = ?
ORDER BY changed_at DESC;
```

---

This diagram and documentation should help understand the complete data model and relationships in the GearGuard system.
