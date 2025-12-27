# Equipment Category Database Relationship Diagram

## 📊 Entity Relationship Overview

```
┌─────────────────────────────┐
│   EQUIPMENT_CATEGORY        │
│  (NEW TABLE)                │
├─────────────────────────────┤
│ 🔑 id (PK)                  │
│ 📝 name (UNIQUE)            │
│ 👤 responsible              │
│ 🏢 company_name             │
│ 📄 description              │
│ 📅 created_at               │
│ 📅 updated_at               │
└─────────────────────────────┘
         │
         │ 1
         │
         │ *
         ▼
┌─────────────────────────────┐
│      EQUIPMENT              │
│  (MODIFIED TABLE)           │
├─────────────────────────────┤
│ 🔑 id (PK)                  │
│ 📝 name                     │
│ 🔢 serial_number            │
│ 🔗 category_id (FK) ─────────┐
│ 🔗 department_id (FK)       │
│ 🔗 team_id (FK)             │
│ 📍 location                 │
│ 📅 purchase_date            │
│ 📅 warranty_end             │
│ ⚡ status                   │
│ 📅 created_at               │
│ 📅 updated_at               │
└─────────────────────────────┘
         │
         │ 1
         │
         │ *
         ▼
┌─────────────────────────────┐
│  MAINTENANCE_REQUESTS       │
├─────────────────────────────┤
│ 🔑 id (PK)                  │
│ 📝 subject                  │
│ 🔗 equipment_id (FK)        │
│ 🔗 department_id (FK)       │
│ 🔗 team_id (FK)             │
│ 🔗 technician_id (FK)       │
│ ⚡ status                   │
│ ...                         │
└─────────────────────────────┘
```

---

## 🔗 Key Relationships

### 1. **equipment_category** ← → **equipment** (One-to-Many)
- One category can be assigned to **many equipment**
- Each equipment must have **one category**
- Foreign Key: `equipment.category_id` → `equipment_category.id`
- Delete Rule: **RESTRICT** (cannot delete category if equipment exists)

### 2. **equipment** ← → **maintenance_requests** (One-to-Many)
- One equipment can have **many maintenance requests**
- Each request belongs to **one equipment**
- Foreign Key: `maintenance_requests.equipment_id` → `equipment.id`

---

## 📋 Sample Data Flow

### Creating Equipment with Category:

```
1. Client sends:
   POST /api/equipment
   {
     "name": "Press #1",
     "category_id": 1,  ← References category
     "department_id": 1,
     "team_id": 1
   }

2. Server validates:
   ✓ category_id=1 exists in equipment_category?
   ✓ department_id=1 exists?
   ✓ team_id=1 exists?

3. Database stores:
   INSERT INTO equipment (name, category_id, ...)

4. Response includes joined data:
   {
     "id": 1,
     "name": "Press #1",
     "category_id": 1,
     "category_name": "Hydraulic Press",      ← FROM JOIN
     "category_responsible": "John Smith",    ← FROM JOIN
     "category_company": "HydroTech Inc",    ← FROM JOIN
     ...
   }
```

---

## 🔒 Foreign Key Constraints

### Category → Equipment

```sql
FOREIGN KEY (category_id) 
  REFERENCES equipment_category(id) 
  ON DELETE RESTRICT
```

**Meaning:**
- ✅ Can create equipment with valid category_id
- ❌ Cannot create equipment with non-existent category_id
- ❌ Cannot delete category if any equipment uses it
- ✅ Must reassign or delete equipment first

### Example Scenarios:

```sql
-- ✅ ALLOWED: Create equipment with valid category
INSERT INTO equipment (name, category_id, ...) 
VALUES ('Machine #1', 1, ...);

-- ❌ BLOCKED: Create equipment with invalid category
INSERT INTO equipment (name, category_id, ...) 
VALUES ('Machine #2', 999, ...);
-- ERROR: Foreign key constraint fails

-- ❌ BLOCKED: Delete category in use
DELETE FROM equipment_category WHERE id = 1;
-- ERROR: Cannot delete - 5 equipment using this category

-- ✅ ALLOWED: Delete unused category
DELETE FROM equipment_category WHERE id = 6;
-- SUCCESS: No equipment using this category
```

---

## 🎯 Query Examples

### Get Equipment with Category Details:

```sql
SELECT 
  e.*,
  ec.name as category_name,
  ec.responsible as category_responsible,
  ec.company_name as category_company,
  d.name as department_name,
  mt.name as team_name
FROM equipment e
  INNER JOIN equipment_category ec ON e.category_id = ec.id
  INNER JOIN departments d ON e.department_id = d.id
  INNER JOIN maintenance_teams mt ON e.team_id = mt.id
WHERE e.id = 1;
```

### Get Category Statistics:

```sql
SELECT 
  ec.id,
  ec.name,
  ec.responsible,
  ec.company_name,
  COUNT(e.id) as equipment_count,
  SUM(CASE WHEN e.status = 'active' THEN 1 ELSE 0 END) as active_count,
  SUM(CASE WHEN e.status = 'scrapped' THEN 1 ELSE 0 END) as scrapped_count
FROM equipment_category ec
  LEFT JOIN equipment e ON ec.id = e.category_id
GROUP BY ec.id, ec.name, ec.responsible, ec.company_name
ORDER BY equipment_count DESC;
```

---

## 🔄 Before vs After Comparison

### BEFORE (String-based Category):

```
equipment
├── id: 1
├── name: "Press #1"
├── category: "Hydraulic Press"  ← String (no validation)
└── ...

Problems:
❌ Typos possible: "Hydraulic Press" vs "hydraulic press"
❌ No metadata about category
❌ Hard to update all equipment if category name changes
❌ No referential integrity
```

### AFTER (Relational Category):

```
equipment_category
├── id: 1
├── name: "Hydraulic Press"
├── responsible: "John Smith"
├── company_name: "HydroTech Industries"
└── description: "Heavy-duty machines..."

equipment
├── id: 1
├── name: "Press #1"
├── category_id: 1  ← Foreign Key (validated)
└── ...

Benefits:
✅ Data integrity enforced
✅ Rich metadata per category
✅ Update once, reflects everywhere
✅ Consistent naming
✅ Easy to track usage
```

---

## 📊 Complete System Architecture

```
┌──────────────┐
│    users     │
└──────┬───────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌──────────────┐   ┌──────────────┐
│ departments  │   │ technicians  │
└──────┬───────┘   └──────┬───────┘
       │                  │
       ▼                  │
┌──────────────────┐      │
│ maintenance_teams│◄─────┘
└──────┬───────────┘
       │
       ▼
┌──────────────────────┐
│ equipment_category   │ ◄── NEW TABLE
└──────┬───────────────┘
       │ 1
       │
       │ *
       ▼
┌──────────────────┐
│    equipment     │ ◄── MODIFIED (added category_id)
└──────┬───────────┘
       │ 1
       │
       │ *
       ▼
┌────────────────────────┐
│ maintenance_requests   │
└──────┬─────────────────┘
       │ 1
       │
       ├─────────┬────────────┐
       │ *       │ *          │ *
       ▼         ▼            ▼
┌─────────┐ ┌─────────┐ ┌─────────────┐
│  logs   │ │  files  │ │ attachments │
└─────────┘ └─────────┘ └─────────────┘
```

---

## 🎯 Key Points

1. **One-to-Many Relationship**: One category → many equipment
2. **Foreign Key**: equipment.category_id → equipment_category.id
3. **Delete Protection**: Cannot delete category if equipment exists
4. **Auto-Join**: Equipment queries automatically include category details
5. **Rich Metadata**: Store company, responsible person per category
6. **Data Integrity**: Database enforces valid references

---

## 📚 Related Documentation

- **Migration Guide**: `EQUIPMENT_CATEGORY_MIGRATION.md`
- **API Documentation**: `CATEGORY_API_DOCS.md`
- **Implementation Summary**: `CATEGORY_IMPLEMENTATION_SUMMARY.md`
- **Database Schema**: `config/schema.sql`

---

**Created:** December 27, 2025  
**Version:** 1.1.0
