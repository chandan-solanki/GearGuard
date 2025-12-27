# 🚀 GearGuard API - Quick Reference Card

## 📍 Base URL
```
http://localhost:3001/api
```

## 🔐 Authentication
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## 📑 Quick Endpoint List

### 🔑 Authentication (Public)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Get tokens |
| POST | `/auth/refresh-token` | Refresh access token |
| GET | `/auth/profile` | Get my profile |
| PUT | `/auth/profile` | Update my profile |
| POST | `/auth/logout` | Invalidate token |

### 👥 Users (Admin only)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/users` | List all users |
| GET | `/users/:id` | Get user details |
| PUT | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |
| POST | `/users/:id/assign-technician` | Make user a technician |

### 🏢 Departments (All users read, Admin/Manager write)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/departments` | List departments |
| POST | `/departments` | Create department |
| GET | `/departments/:id` | Get details |
| PUT | `/departments/:id` | Update |
| DELETE | `/departments/:id` | Delete |

### 👷 Teams (All users read, Admin/Manager write)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/teams` | List teams |
| POST | `/teams` | Create team |
| GET | `/teams/:id` | Get details |
| GET | `/teams/:id/technicians` | List team members |
| PUT | `/teams/:id` | Update |
| DELETE | `/teams/:id` | Delete |

### 🔧 Technicians (All users read, Admin/Manager write)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/technicians` | List all technicians |
| GET | `/technicians/:id` | Get details |
| PUT | `/technicians/:id` | Update assignment |
| DELETE | `/technicians/:id` | Remove technician role |

### 📦 Equipment Categories (All users read, Admin/Manager write)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/categories` | List categories |
| POST | `/categories` | Create category |
| GET | `/categories/:id` | Get details |
| GET | `/categories/stats` | Get statistics |
| PUT | `/categories/:id` | Update |
| DELETE | `/categories/:id` | Delete (Admin only) |

### 🏭 Equipment (All users read, Admin/Manager write)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/equipment` | List equipment |
| POST | `/equipment` | Add equipment |
| GET | `/equipment/:id` | Get details |
| GET | `/equipment/:id/requests` | Get maintenance history |
| PUT | `/equipment/:id` | Update |
| DELETE | `/equipment/:id` | Delete |

### 🔨 Maintenance Requests (All users create/read, assigned can update)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/requests` | List requests |
| POST | `/requests` | Create request |
| GET | `/requests/:id` | Get details |
| PUT | `/requests/:id` | Update request |
| PUT | `/requests/:id/assign-technician` | Assign tech (Manager) |
| PUT | `/requests/:id/status` | Update status |
| GET | `/requests/:id/logs` | View history |
| GET | `/requests/calendar` | Calendar view |
| GET | `/requests/stats/team` | Team stats (Manager) |
| GET | `/requests/stats/equipment` | Equipment stats (Manager) |
| DELETE | `/requests/:id` | Delete request |

### 📎 Attachments (All users)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/attachments/:requestId` | Upload file |
| GET | `/attachments/:requestId` | List files |
| DELETE | `/attachments/file/:id` | Delete file |

---

## 🎯 Common Query Parameters

### Pagination
```
?limit=50&offset=0
```

### Filtering
```
?status=active
?category_id=1
?department_id=2
?team_id=1
?type=corrective
```

### Search
```
?search=hydraulic
?name=press
```

### Date Range
```
?start_date=2024-01-01&end_date=2024-01-31
```

---

## 📊 Common Response Format

### Success (200/201)
```json
{
  "success": true,
  "message": "Operation completed",
  "data": { /* result */ }
}
```

### Error (4xx/5xx)
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 🔄 Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized (invalid token) |
| 403 | Forbidden (no permission) |
| 404 | Not Found |
| 500 | Server Error |

---

## 👮 Role-Based Access

| Role | Can Do |
|------|--------|
| **Admin** | Everything |
| **Manager** | Create equipment, departments, teams, assign technicians, view reports |
| **Technician** | Create requests, update assigned requests, upload files |
| **Employee** | Create requests, view own requests, upload files |

---

## 💡 Quick Start Examples

### 1. Login and Get Token
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gearguard.com","password":"admin123"}'
```

### 2. Get All Equipment
```bash
curl http://localhost:3001/api/equipment?status=active \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Create Maintenance Request
```bash
curl -X POST http://localhost:3001/api/requests \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject":"Motor making noise",
    "type":"corrective",
    "equipment_id":1,
    "scheduled_date":"2024-01-25T09:00:00"
  }'
```

### 4. Upload File
```bash
curl -X POST http://localhost:3001/api/attachments/5 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@photo.jpg"
```

---

## 🔐 Token Management

### Access Token
- **Lifetime:** 24 hours
- **Use:** Include in Authorization header for all requests
- **Format:** `Bearer YOUR_ACCESS_TOKEN`

### Refresh Token
- **Lifetime:** 7 days
- **Use:** Get new access token when current expires
- **Endpoint:** `POST /api/auth/refresh-token`

### Token Refresh Flow
```javascript
1. Request fails with 401
2. POST /api/auth/refresh-token with refreshToken
3. Get new accessToken and refreshToken
4. Retry original request with new token
5. If refresh fails, redirect to login
```

---

## 📝 Request/Response Examples

### Create Equipment
**Request:**
```json
POST /api/equipment
{
  "name": "CNC Machine #5",
  "serial_number": "CNC-2024-005",
  "category_id": 2,
  "department_id": 2,
  "team_id": 1,
  "location": "Building B",
  "purchase_date": "2024-01-15"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Equipment created successfully",
  "data": {
    "id": 46,
    "name": "CNC Machine #5",
    "category_name": "CNC Machine",
    "department_name": "Manufacturing",
    "status": "active"
  }
}
```

### Get Calendar View
**Request:**
```
GET /api/requests/calendar?start_date=2024-01-01&end_date=2024-01-31
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 25,
      "subject": "Quarterly maintenance",
      "scheduled_date": "2024-01-15T09:00:00Z",
      "equipment_name": "Hydraulic Press #1",
      "status": "new"
    }
  ]
}
```

---

## 🎓 Workflow Examples

### Workflow 1: New Equipment Setup
```
1. POST /api/categories (if needed)
2. POST /api/departments (if needed)
3. POST /api/teams (if needed)
4. POST /api/equipment
5. POST /api/requests (initial maintenance)
```

### Workflow 2: Handle Maintenance Request
```
1. GET /api/requests?status=new
2. PUT /api/requests/:id/assign-technician
3. PUT /api/requests/:id/status {"status":"in_progress"}
4. POST /api/attachments/:id (upload photos)
5. PUT /api/requests/:id/status {"status":"repaired","duration_hours":3}
```

### Workflow 3: Monthly Reporting
```
1. GET /api/requests/stats/team
2. GET /api/requests/stats/equipment
3. GET /api/categories/stats
4. GET /api/requests/calendar?start_date=...&end_date=...
```

---

## 🚨 Common Errors

### Invalid Token
```json
{"success": false, "message": "Invalid token"}
```
**Fix:** Login again or refresh token

### Permission Denied
```json
{"success": false, "message": "Access denied"}
```
**Fix:** Check user role, ensure proper permissions

### Validation Error
```json
{"success": false, "message": "Email already exists"}
```
**Fix:** Check request body, ensure unique values

### Not Found
```json
{"success": false, "message": "Equipment not found"}
```
**Fix:** Verify ID exists in database

---

## 📦 File Upload Details

**Max Size:** 5 MB  
**Allowed Types:** JPEG, PNG, PDF  
**Content-Type:** multipart/form-data  
**Field Name:** file  
**Storage:** ./uploads/ folder

---

## 🔗 Related Documentation

- **Complete Guide:** `COMPLETE_API_GUIDE.md` - Detailed descriptions
- **Postman Collection:** `GearGuard_Postman_Collection.json` - Import and test
- **Database Schema:** `config/schema.sql` - Database structure
- **Setup Guide:** `DATABASE_SETUP_GUIDE.md` - Installation steps

---

## 📞 Support

**Default Admin Credentials:**
- Email: `admin@gearguard.com`
- Password: `admin123`

**Server URL:** http://localhost:3001  
**API Base:** http://localhost:3001/api  
**Health Check:** http://localhost:3001/api/health

---

**Last Updated:** December 27, 2025  
**Version:** 1.1.0  
**Total Endpoints:** 35
