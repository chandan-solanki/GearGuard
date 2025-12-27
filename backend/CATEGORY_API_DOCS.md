# Equipment Category API Documentation

## Base URL
```
http://localhost:3001/api/categories
```

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## Endpoints

### 1. Get All Categories
**GET** `/api/categories`

Get a paginated list of all equipment categories with optional filters.

**Access:** All authenticated users

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | No | Filter by category name (partial match) |
| company_name | string | No | Filter by company name (partial match) |
| responsible | string | No | Filter by responsible person (partial match) |
| limit | integer | No | Results per page (default: 50) |
| offset | integer | No | Pagination offset (default: 0) |

**Request Example:**
```bash
GET /api/categories?limit=20&offset=0
GET /api/categories?company_name=HydroTech
GET /api/categories?responsible=John
```

**Response (200 OK):**
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
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": 2,
      "name": "CNC Machine",
      "responsible": "Sarah Johnson",
      "company_name": "PrecisionCorp",
      "description": "Computer Numerical Control machines",
      "created_at": "2024-01-15T10:31:00.000Z",
      "updated_at": "2024-01-15T10:31:00.000Z"
    }
  ]
}
```

---

### 2. Get Category by ID
**GET** `/api/categories/:id`

Get detailed information about a specific category including equipment count.

**Access:** All authenticated users

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Category ID |

**Request Example:**
```bash
GET /api/categories/1
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Category retrieved successfully",
  "data": {
    "id": 1,
    "name": "Hydraulic Press",
    "responsible": "John Smith",
    "company_name": "HydroTech Industries",
    "description": "Heavy-duty hydraulic press machines",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z",
    "equipment_count": 5
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Category not found"
}
```

---

### 3. Create Category
**POST** `/api/categories`

Create a new equipment category.

**Access:** Admin, Manager only

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Unique category name |
| responsible | string | No | Person responsible for this category |
| company_name | string | No | Company/vendor name |
| description | string | No | Category description |

**Request Example:**
```bash
POST /api/categories
Content-Type: application/json

{
  "name": "Industrial Robot",
  "responsible": "Alex Turner",
  "company_name": "RoboTech Solutions",
  "description": "Automated robotic systems for assembly lines"
}
```

**Response (201 Created):**
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
    "created_at": "2024-01-20T14:25:00.000Z",
    "updated_at": "2024-01-20T14:25:00.000Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Category with this name already exists"
}
```

---

### 4. Update Category
**PUT** `/api/categories/:id`

Update an existing category's details.

**Access:** Admin, Manager only

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Category ID |

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Category name |
| responsible | string | No | Person responsible |
| company_name | string | No | Company/vendor name |
| description | string | No | Category description |

**Request Example:**
```bash
PUT /api/categories/1
Content-Type: application/json

{
  "name": "Hydraulic Press",
  "responsible": "John Smith Jr.",
  "company_name": "HydroTech Industries Inc.",
  "description": "Heavy-duty hydraulic press machines - Updated specs"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "id": 1,
    "name": "Hydraulic Press",
    "responsible": "John Smith Jr.",
    "company_name": "HydroTech Industries Inc.",
    "description": "Heavy-duty hydraulic press machines - Updated specs",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-20T15:10:00.000Z"
  }
}
```

**Error Responses:**
- **404 Not Found:** Category doesn't exist
- **400 Bad Request:** New name conflicts with existing category

---

### 5. Delete Category
**DELETE** `/api/categories/:id`

Delete a category. Only allowed if no equipment is using this category.

**Access:** Admin only

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Category ID |

**Request Example:**
```bash
DELETE /api/categories/6
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Category deleted successfully",
  "data": {
    "message": "Category deleted successfully"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Cannot delete category. It is currently being used by 5 equipment(s)."
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Category not found"
}
```

---

### 6. Get Category Statistics
**GET** `/api/categories/stats`

Get statistics for all categories including equipment counts by status.

**Access:** Admin, Manager only

**Request Example:**
```bash
GET /api/categories/stats
```

**Response (200 OK):**
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
    },
    {
      "id": 3,
      "name": "HVAC System",
      "responsible": "Mike Davis",
      "company_name": "ClimateControl Ltd",
      "equipment_count": 5,
      "active_count": 5,
      "scrapped_count": 0
    }
  ]
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error, constraint violation) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Standard Error Response Format

```json
{
  "success": false,
  "message": "Error description here"
}
```

---

## Role-Based Access Summary

| Endpoint | Admin | Manager | Technician | Employee |
|----------|-------|---------|------------|----------|
| GET /categories | ✅ | ✅ | ✅ | ✅ |
| GET /categories/:id | ✅ | ✅ | ✅ | ✅ |
| GET /categories/stats | ✅ | ✅ | ❌ | ❌ |
| POST /categories | ✅ | ✅ | ❌ | ❌ |
| PUT /categories/:id | ✅ | ✅ | ❌ | ❌ |
| DELETE /categories/:id | ✅ | ❌ | ❌ | ❌ |

---

## Integration with Equipment

When creating or updating equipment, use `category_id` to link to a category:

**Create Equipment Example:**
```bash
POST /api/equipment
Content-Type: application/json

{
  "name": "Press Machine #1",
  "serial_number": "PM-2024-001",
  "category_id": 1,  // Links to "Hydraulic Press" category
  "department_id": 1,
  "team_id": 1,
  "purchase_date": "2024-01-15",
  "location": "Building A, Floor 2"
}
```

**Equipment Response (includes category details):**
```json
{
  "id": 1,
  "name": "Press Machine #1",
  "serial_number": "PM-2024-001",
  "category_id": 1,
  "category_name": "Hydraulic Press",
  "category_responsible": "John Smith",
  "category_company": "HydroTech Industries",
  "category_description": "Heavy-duty hydraulic press machines",
  "department_id": 1,
  "department_name": "Manufacturing",
  "team_id": 1,
  "team_name": "Production Team A",
  "status": "active",
  // ... other fields
}
```

---

## Testing with cURL

**Get all categories:**
```bash
curl -X GET "http://localhost:3001/api/categories" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Create category:**
```bash
curl -X POST "http://localhost:3001/api/categories" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Category",
    "responsible": "Jane Doe",
    "company_name": "Example Corp"
  }'
```

**Get category stats:**
```bash
curl -X GET "http://localhost:3001/api/categories/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Delete category:**
```bash
curl -X DELETE "http://localhost:3001/api/categories/6" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Notes

1. **Category names must be unique** - Duplicate names are not allowed
2. **Categories cannot be deleted if in use** - Must reassign or delete equipment first
3. **All fields except `name` are optional** when creating/updating
4. **Pagination defaults:** limit=50, offset=0
5. **Search is case-insensitive** and uses partial matching (LIKE)

---

**Last Updated:** December 27, 2025  
**API Version:** 1.1.0
