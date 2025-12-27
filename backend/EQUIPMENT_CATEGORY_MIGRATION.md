# Equipment Category Feature - Migration Guide

## 📋 Overview
This document outlines the changes made to implement the **Equipment Category** feature with proper relational database structure.

## 🔄 Database Schema Changes

### New Table: `equipment_category`
```sql
CREATE TABLE IF NOT EXISTS equipment_category (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  responsible VARCHAR(255),
  company_name VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Modified Table: `equipment`
**BEFORE:**
```sql
category VARCHAR(100)  -- Simple text field
```

**AFTER:**
```sql
category_id INT NOT NULL,
FOREIGN KEY (category_id) REFERENCES equipment_category(id) ON DELETE RESTRICT
```

## 🎯 Key Changes

### 1. **Database Schema** (`config/schema.sql`)
- ✅ Added `equipment_category` table with fields: id, name, responsible, company_name, description
- ✅ Changed `equipment.category` from VARCHAR to `category_id` INT with foreign key
- ✅ Added seed data for 5 sample categories
- ✅ Updated table numbering (Equipment is now table #7)

### 2. **New Model** (`models/EquipmentCategory.model.js`)
- ✅ CRUD operations for categories
- ✅ Pagination and filtering by name, company, responsible
- ✅ `getEquipmentCount()` - Count equipment using this category
- ✅ `getCategoryStats()` - Statistics with equipment counts per category
- ✅ Delete protection (prevents deletion if category is in use)

### 3. **New Service** (`services/equipmentCategory.service.js`)
- ✅ Business logic for category management
- ✅ Duplicate name validation
- ✅ Referential integrity checks before deletion
- ✅ Error handling with AppError

### 4. **New Controller** (`controllers/equipmentCategory.controller.js`)
- ✅ 6 endpoints: create, getAll, getById, update, delete, getStats
- ✅ Request validation
- ✅ Success response formatting

### 5. **New Routes** (`routes/category.routes.js`)
- ✅ Role-based access control:
  - `GET /categories` - All authenticated users
  - `GET /categories/:id` - All authenticated users
  - `GET /categories/stats` - Admin & Manager only
  - `POST /categories` - Admin & Manager only
  - `PUT /categories/:id` - Admin & Manager only
  - `DELETE /categories/:id` - Admin only

### 6. **Updated Equipment Model** (`models/Equipment.model.js`)
- ✅ Changed `category` → `category_id` in create/update methods
- ✅ Added JOIN with `equipment_category` table in queries
- ✅ Returns: `category_name`, `category_responsible`, `category_company`, `category_description`
- ✅ Updated filter from `category` to `category_id`

### 7. **Updated Equipment Service** (`services/equipment.service.js`)
- ✅ Added category validation in `createEquipment()`
- ✅ Added category validation in `updateEquipment()`
- ✅ Verifies category exists before creating/updating equipment

### 8. **Updated Routes** (`routes/index.js`)
- ✅ Added: `router.use('/categories', categoryRoutes);`

### 9. **Updated Postman Collection**
- ✅ Added "Equipment Categories" folder with 3 requests
- ✅ Updated "Create Equipment" to use `category_id` instead of `category`

## 📊 API Endpoints

### Equipment Category Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/categories` | All users | Get all categories with filters |
| GET | `/api/categories/:id` | All users | Get category by ID |
| GET | `/api/categories/stats` | Admin, Manager | Get category statistics |
| POST | `/api/categories` | Admin, Manager | Create new category |
| PUT | `/api/categories/:id` | Admin, Manager | Update category |
| DELETE | `/api/categories/:id` | Admin only | Delete category |

### Sample API Calls

**Create Category:**
```bash
POST /api/categories
{
  "name": "Hydraulic Press",
  "responsible": "John Smith",
  "company_name": "HydroTech Industries",
  "description": "Heavy-duty hydraulic press machines"
}
```

**Create Equipment (Updated):**
```bash
POST /api/equipment
{
  "name": "Hydraulic Press #1",
  "serial_number": "HP-2024-001",
  "category_id": 1,  // ← Changed from "category": "Press Machine"
  "purchase_date": "2023-05-15",
  "department_id": 1,
  "team_id": 1
}
```

**Get Equipment Response (Updated):**
```json
{
  "id": 1,
  "name": "Hydraulic Press #1",
  "serial_number": "HP-2024-001",
  "category_id": 1,
  "category_name": "Hydraulic Press",           // ← New
  "category_responsible": "John Smith",         // ← New
  "category_company": "HydroTech Industries",  // ← New
  "category_description": "Heavy-duty...",     // ← New
  "department_id": 1,
  "department_name": "Manufacturing",
  // ... other fields
}
```

## 🚀 Migration Steps

### Step 1: Drop Old Schema (Development Only)
```bash
mysql -u root -p
DROP DATABASE IF EXISTS gearguard_db;
exit;
```

### Step 2: Run New Schema
```bash
mysql -u root -p < config/schema.sql
```

### Step 3: Verify Tables
```sql
USE gearguard_db;
SHOW TABLES;
-- Should see: equipment_category
DESC equipment_category;
DESC equipment;
-- equipment should have category_id field
```

### Step 4: Restart Server
```bash
npm run dev
```

### Step 5: Test Category API
```bash
# Get all categories (should return 5 seed categories)
curl http://localhost:3001/api/categories \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create equipment with category_id
curl -X POST http://localhost:3001/api/equipment \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Machine",
    "category_id": 1,
    "department_id": 1,
    "team_id": 1
  }'
```

## 🔍 Data Relationships

```
equipment_category (1) ──< (Many) equipment
    │
    ├── id (PK)
    ├── name (UNIQUE)
    ├── responsible
    ├── company_name
    └── description

equipment
    ├── id (PK)
    ├── category_id (FK → equipment_category.id)
    ├── department_id (FK → departments.id)
    └── team_id (FK → maintenance_teams.id)
```

## ⚠️ Breaking Changes

### For Frontend/API Consumers:

1. **Equipment Creation/Update:**
   - ❌ OLD: `"category": "Press Machine"` (string)
   - ✅ NEW: `"category_id": 1` (integer)

2. **Equipment Response:**
   - Added fields: `category_name`, `category_responsible`, `category_company`, `category_description`
   - Removed field: `category` (raw string)

3. **Equipment Filtering:**
   - ❌ OLD: `GET /api/equipment?category=Press Machine`
   - ✅ NEW: `GET /api/equipment?category_id=1`

## 📝 Seed Data

The schema includes 5 pre-populated categories:

| ID | Name | Responsible | Company |
|----|------|-------------|---------|
| 1 | Hydraulic Press | John Smith | HydroTech Industries |
| 2 | CNC Machine | Sarah Johnson | PrecisionCorp |
| 3 | HVAC System | Mike Davis | ClimateControl Ltd |
| 4 | Generator | Emily Brown | PowerGen Solutions |
| 5 | Conveyor Belt | David Wilson | TransportTech |

## ✅ Testing Checklist

- [ ] Database schema applied successfully
- [ ] Seed data loaded (5 categories)
- [ ] GET `/api/categories` returns list
- [ ] POST `/api/categories` creates new category
- [ ] GET `/api/categories/stats` shows equipment counts
- [ ] POST `/api/equipment` accepts `category_id`
- [ ] GET `/api/equipment/:id` returns category details
- [ ] Cannot delete category that's in use
- [ ] Can delete unused category
- [ ] Postman collection works with new structure

## 🎓 Benefits of This Approach

1. **Data Integrity**: Foreign keys prevent invalid category references
2. **Consistency**: Category names are standardized across equipment
3. **Rich Metadata**: Store responsible person, company, description per category
4. **Easy Updates**: Change category name once, reflects everywhere
5. **Analytics**: Track equipment counts per category
6. **Scalability**: Easy to add more category attributes later
7. **Security**: Role-based access to category management

## 📞 Support

If you encounter issues:
1. Check database connection in `.env`
2. Verify schema was applied: `mysql -u root -p gearguard_db -e "SHOW TABLES;"`
3. Check server logs for errors
4. Ensure all new files are imported correctly

---

**Migration Date:** December 27, 2025  
**Version:** 1.1.0  
**Breaking Change:** Yes (category field structure changed)
