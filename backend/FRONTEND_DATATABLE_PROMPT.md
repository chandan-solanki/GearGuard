# 🖥️ GearGuard Frontend Implementation Guide
## Data Tables for Departments, Equipment & Teams

---

## 📋 Project Overview

Build a comprehensive frontend dashboard with data tables to display and manage:
- **Departments** - Organization units
- **Equipment** - Machinery and assets
- **Teams** - Maintenance teams

All tables should support:
✅ Pagination  
✅ Search/Filter  
✅ Sorting  
✅ CRUD Operations  
✅ Role-based actions  

---

## 🔗 API Base Configuration

```javascript
const API_BASE_URL = 'http://localhost:3001/api';

// Auth Header Helper
const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
  'Content-Type': 'application/json'
});
```

---

# 📊 1. DEPARTMENTS DATA TABLE

## 🎯 API Endpoints Reference

| Method | Endpoint | Purpose | Access |
|--------|----------|---------|--------|
| `GET` | `/departments` | List all departments | All users |
| `GET` | `/departments/:id` | Get department details | All users |
| `POST` | `/departments` | Create new department | Admin, Manager |
| `PUT` | `/departments/:id` | Update department | Admin, Manager |
| `DELETE` | `/departments/:id` | Delete department | Admin, Manager |

## 📥 API Response Structure

### GET /departments Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Manufacturing",
      "description": "Main production floor",
      "manager_name": "John Smith",
      "equipment_count": 15,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-20T14:00:00Z"
    },
    {
      "id": 2,
      "name": "Maintenance",
      "description": "Equipment maintenance division",
      "manager_name": "Jane Doe",
      "equipment_count": 8,
      "created_at": "2024-01-16T09:00:00Z",
      "updated_at": "2024-01-18T11:30:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

## 🏗️ Department Table Columns

| Column | Field | Type | Sortable | Filterable |
|--------|-------|------|----------|------------|
| ID | `id` | Number | ✅ | ❌ |
| Department Name | `name` | String | ✅ | ✅ (search) |
| Description | `description` | String | ❌ | ✅ (search) |
| Manager | `manager_name` | String | ✅ | ✅ |
| Equipment Count | `equipment_count` | Number | ✅ | ❌ |
| Created Date | `created_at` | DateTime | ✅ | ✅ (date range) |
| Actions | - | Buttons | ❌ | ❌ |

## 💻 Frontend Implementation

### Department Service (departmentService.js)
```javascript
const DepartmentService = {
  // Get all departments with pagination
  async getAll(params = {}) {
    const queryString = new URLSearchParams({
      limit: params.limit || 10,
      offset: params.offset || 0,
      ...(params.search && { search: params.search }),
      ...(params.sortBy && { sort_by: params.sortBy }),
      ...(params.sortOrder && { sort_order: params.sortOrder })
    }).toString();

    const response = await fetch(`${API_BASE_URL}/departments?${queryString}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Get single department
  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Create department
  async create(data) {
    const response = await fetch(`${API_BASE_URL}/departments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Update department
  async update(id, data) {
    const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Delete department
  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  }
};
```

### Department Form Fields
```javascript
const departmentFormFields = [
  {
    name: 'name',
    label: 'Department Name',
    type: 'text',
    required: true,
    placeholder: 'Enter department name',
    validation: { minLength: 2, maxLength: 100 }
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: false,
    placeholder: 'Enter department description',
    validation: { maxLength: 500 }
  },
  {
    name: 'manager_id',
    label: 'Department Manager',
    type: 'select',
    required: false,
    optionsEndpoint: '/users?role=manager',
    displayField: 'name',
    valueField: 'id'
  }
];
```

### Create Department Request Body:
```json
{
  "name": "Quality Control",
  "description": "Quality assurance and testing department"
}
```

### Update Department Request Body:
```json
{
  "name": "Quality Control Updated",
  "description": "Updated description"
}
```

---

# 📊 2. EQUIPMENT DATA TABLE

## 🎯 API Endpoints Reference

| Method | Endpoint | Purpose | Access |
|--------|----------|---------|--------|
| `GET` | `/equipment` | List all equipment | All users |
| `GET` | `/equipment/:id` | Get equipment details | All users |
| `GET` | `/equipment/:id/requests` | Get maintenance history | All users |
| `POST` | `/equipment` | Create new equipment | Admin, Manager |
| `PUT` | `/equipment/:id` | Update equipment | Admin, Manager |
| `DELETE` | `/equipment/:id` | Delete equipment | Admin, Manager |

## 📥 Query Parameters for Equipment

```
GET /equipment?limit=10&offset=0&status=active&category_id=1&department_id=2&team_id=1&search=hydraulic
```

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `limit` | Number | Items per page | `10` |
| `offset` | Number | Skip items | `0` |
| `status` | String | Filter by status | `active`, `inactive`, `maintenance` |
| `category_id` | Number | Filter by category | `1` |
| `department_id` | Number | Filter by department | `2` |
| `team_id` | Number | Filter by assigned team | `1` |
| `search` | String | Search in name/serial | `hydraulic` |

## 📥 API Response Structure

### GET /equipment Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Hydraulic Press #1",
      "serial_number": "HP-2024-001",
      "model": "HP-5000",
      "manufacturer": "Industrial Corp",
      "category_id": 1,
      "category_name": "Heavy Machinery",
      "department_id": 1,
      "department_name": "Manufacturing",
      "team_id": 1,
      "team_name": "Team Alpha",
      "location": "Building A, Floor 2",
      "status": "active",
      "purchase_date": "2023-06-15",
      "warranty_expiry": "2026-06-15",
      "notes": "Primary production press",
      "created_at": "2024-01-10T08:00:00Z",
      "updated_at": "2024-01-25T16:30:00Z"
    },
    {
      "id": 2,
      "name": "CNC Machine #3",
      "serial_number": "CNC-2024-003",
      "model": "CNC-PRO-X",
      "manufacturer": "TechMach Inc",
      "category_id": 2,
      "category_name": "CNC Machines",
      "department_id": 1,
      "department_name": "Manufacturing",
      "team_id": 2,
      "team_name": "Team Beta",
      "location": "Building A, Floor 1",
      "status": "maintenance",
      "purchase_date": "2024-01-10",
      "warranty_expiry": "2027-01-10",
      "notes": "Under scheduled maintenance",
      "created_at": "2024-01-12T10:00:00Z",
      "updated_at": "2024-01-26T09:15:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

## 🏗️ Equipment Table Columns

| Column | Field | Type | Sortable | Filterable |
|--------|-------|------|----------|------------|
| ID | `id` | Number | ✅ | ❌ |
| Equipment Name | `name` | String | ✅ | ✅ (search) |
| Serial Number | `serial_number` | String | ✅ | ✅ (search) |
| Model | `model` | String | ✅ | ✅ |
| Category | `category_name` | String | ✅ | ✅ (dropdown) |
| Department | `department_name` | String | ✅ | ✅ (dropdown) |
| Team | `team_name` | String | ✅ | ✅ (dropdown) |
| Location | `location` | String | ✅ | ✅ |
| Status | `status` | Badge | ✅ | ✅ (dropdown) |
| Purchase Date | `purchase_date` | Date | ✅ | ✅ (date range) |
| Warranty | `warranty_expiry` | Date | ✅ | ✅ |
| Actions | - | Buttons | ❌ | ❌ |

## 🎨 Status Badge Styling

```javascript
const statusConfig = {
  active: {
    label: 'Active',
    color: 'green',
    bgColor: '#dcfce7',
    textColor: '#166534'
  },
  inactive: {
    label: 'Inactive',
    color: 'gray',
    bgColor: '#f3f4f6',
    textColor: '#374151'
  },
  maintenance: {
    label: 'Under Maintenance',
    color: 'yellow',
    bgColor: '#fef9c3',
    textColor: '#854d0e'
  },
  retired: {
    label: 'Retired',
    color: 'red',
    bgColor: '#fee2e2',
    textColor: '#991b1b'
  }
};
```

## 💻 Frontend Implementation

### Equipment Service (equipmentService.js)
```javascript
const EquipmentService = {
  // Get all equipment with filters
  async getAll(params = {}) {
    const queryString = new URLSearchParams({
      limit: params.limit || 10,
      offset: params.offset || 0,
      ...(params.search && { search: params.search }),
      ...(params.status && { status: params.status }),
      ...(params.category_id && { category_id: params.category_id }),
      ...(params.department_id && { department_id: params.department_id }),
      ...(params.team_id && { team_id: params.team_id }),
      ...(params.sortBy && { sort_by: params.sortBy }),
      ...(params.sortOrder && { sort_order: params.sortOrder })
    }).toString();

    const response = await fetch(`${API_BASE_URL}/equipment?${queryString}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Get single equipment with full details
  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/equipment/${id}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Get equipment maintenance history
  async getMaintenanceHistory(id) {
    const response = await fetch(`${API_BASE_URL}/equipment/${id}/requests`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Create equipment
  async create(data) {
    const response = await fetch(`${API_BASE_URL}/equipment`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Update equipment
  async update(id, data) {
    const response = await fetch(`${API_BASE_URL}/equipment/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Delete equipment
  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/equipment/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  }
};
```

### Equipment Form Fields
```javascript
const equipmentFormFields = [
  {
    name: 'name',
    label: 'Equipment Name',
    type: 'text',
    required: true,
    placeholder: 'Enter equipment name',
    validation: { minLength: 2, maxLength: 100 }
  },
  {
    name: 'serial_number',
    label: 'Serial Number',
    type: 'text',
    required: true,
    placeholder: 'Enter serial number',
    validation: { pattern: /^[A-Z0-9-]+$/ }
  },
  {
    name: 'model',
    label: 'Model',
    type: 'text',
    required: false,
    placeholder: 'Enter model number'
  },
  {
    name: 'manufacturer',
    label: 'Manufacturer',
    type: 'text',
    required: false,
    placeholder: 'Enter manufacturer name'
  },
  {
    name: 'category_id',
    label: 'Category',
    type: 'select',
    required: true,
    optionsEndpoint: '/categories',
    displayField: 'name',
    valueField: 'id'
  },
  {
    name: 'department_id',
    label: 'Department',
    type: 'select',
    required: true,
    optionsEndpoint: '/departments',
    displayField: 'name',
    valueField: 'id'
  },
  {
    name: 'team_id',
    label: 'Assigned Team',
    type: 'select',
    required: false,
    optionsEndpoint: '/teams',
    displayField: 'name',
    valueField: 'id'
  },
  {
    name: 'location',
    label: 'Location',
    type: 'text',
    required: false,
    placeholder: 'e.g., Building A, Floor 2'
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    required: true,
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'maintenance', label: 'Under Maintenance' },
      { value: 'retired', label: 'Retired' }
    ]
  },
  {
    name: 'purchase_date',
    label: 'Purchase Date',
    type: 'date',
    required: false
  },
  {
    name: 'warranty_expiry',
    label: 'Warranty Expiry',
    type: 'date',
    required: false
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    required: false,
    placeholder: 'Additional notes...'
  }
];
```

### Create Equipment Request Body:
```json
{
  "name": "Hydraulic Press #5",
  "serial_number": "HP-2024-005",
  "model": "HP-5000-PRO",
  "manufacturer": "Industrial Corp",
  "category_id": 1,
  "department_id": 2,
  "team_id": 1,
  "location": "Building B, Floor 1",
  "status": "active",
  "purchase_date": "2024-01-15",
  "warranty_expiry": "2027-01-15",
  "notes": "New equipment for production line"
}
```

---

# 📊 3. TEAMS DATA TABLE

## 🎯 API Endpoints Reference

| Method | Endpoint | Purpose | Access |
|--------|----------|---------|--------|
| `GET` | `/teams` | List all teams | All users |
| `GET` | `/teams/:id` | Get team details | All users |
| `GET` | `/teams/:id/technicians` | Get team members | All users |
| `POST` | `/teams` | Create new team | Admin, Manager |
| `PUT` | `/teams/:id` | Update team | Admin, Manager |
| `DELETE` | `/teams/:id` | Delete team | Admin, Manager |

## 📥 API Response Structure

### GET /teams Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Team Alpha",
      "description": "Primary maintenance team",
      "department_id": 2,
      "department_name": "Maintenance",
      "lead_technician_id": 5,
      "lead_technician_name": "Mike Johnson",
      "technician_count": 6,
      "active_requests": 12,
      "created_at": "2024-01-05T09:00:00Z",
      "updated_at": "2024-01-20T14:30:00Z"
    },
    {
      "id": 2,
      "name": "Team Beta",
      "description": "Secondary maintenance team",
      "department_id": 2,
      "department_name": "Maintenance",
      "lead_technician_id": 8,
      "lead_technician_name": "Sarah Williams",
      "technician_count": 4,
      "active_requests": 8,
      "created_at": "2024-01-08T10:00:00Z",
      "updated_at": "2024-01-22T11:00:00Z"
    }
  ],
  "pagination": {
    "total": 10,
    "limit": 10,
    "offset": 0,
    "hasMore": false
  }
}
```

### GET /teams/:id/technicians Response:
```json
{
  "success": true,
  "data": {
    "team": {
      "id": 1,
      "name": "Team Alpha",
      "description": "Primary maintenance team"
    },
    "technicians": [
      {
        "id": 1,
        "user_id": 5,
        "name": "Mike Johnson",
        "email": "mike@gearguard.com",
        "specialization": "Electrical Systems",
        "is_lead": true,
        "active_tasks": 3
      },
      {
        "id": 2,
        "user_id": 6,
        "name": "Tom Brown",
        "email": "tom@gearguard.com",
        "specialization": "Mechanical",
        "is_lead": false,
        "active_tasks": 5
      }
    ]
  }
}
```

## 🏗️ Teams Table Columns

| Column | Field | Type | Sortable | Filterable |
|--------|-------|------|----------|------------|
| ID | `id` | Number | ✅ | ❌ |
| Team Name | `name` | String | ✅ | ✅ (search) |
| Description | `description` | String | ❌ | ✅ (search) |
| Department | `department_name` | String | ✅ | ✅ (dropdown) |
| Team Lead | `lead_technician_name` | String | ✅ | ✅ |
| Members | `technician_count` | Number | ✅ | ❌ |
| Active Requests | `active_requests` | Number | ✅ | ❌ |
| Created Date | `created_at` | DateTime | ✅ | ✅ |
| Actions | - | Buttons | ❌ | ❌ |

## 💻 Frontend Implementation

### Team Service (teamService.js)
```javascript
const TeamService = {
  // Get all teams
  async getAll(params = {}) {
    const queryString = new URLSearchParams({
      limit: params.limit || 10,
      offset: params.offset || 0,
      ...(params.search && { search: params.search }),
      ...(params.department_id && { department_id: params.department_id }),
      ...(params.sortBy && { sort_by: params.sortBy }),
      ...(params.sortOrder && { sort_order: params.sortOrder })
    }).toString();

    const response = await fetch(`${API_BASE_URL}/teams?${queryString}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Get single team
  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/teams/${id}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Get team members (technicians)
  async getTeamMembers(id) {
    const response = await fetch(`${API_BASE_URL}/teams/${id}/technicians`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Create team
  async create(data) {
    const response = await fetch(`${API_BASE_URL}/teams`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Update team
  async update(id, data) {
    const response = await fetch(`${API_BASE_URL}/teams/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Delete team
  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/teams/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  }
};
```

### Team Form Fields
```javascript
const teamFormFields = [
  {
    name: 'name',
    label: 'Team Name',
    type: 'text',
    required: true,
    placeholder: 'Enter team name',
    validation: { minLength: 2, maxLength: 100 }
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: false,
    placeholder: 'Enter team description'
  },
  {
    name: 'department_id',
    label: 'Department',
    type: 'select',
    required: true,
    optionsEndpoint: '/departments',
    displayField: 'name',
    valueField: 'id'
  },
  {
    name: 'lead_technician_id',
    label: 'Team Lead',
    type: 'select',
    required: false,
    optionsEndpoint: '/technicians',
    displayField: 'name',
    valueField: 'id'
  }
];
```

### Create Team Request Body:
```json
{
  "name": "Team Gamma",
  "description": "Specialized equipment maintenance",
  "department_id": 2,
  "lead_technician_id": 10
}
```

---

# 🛠️ 4. REUSABLE DATA TABLE COMPONENT

## Component Props Interface

```javascript
const DataTableProps = {
  // Data
  data: Array,              // Array of row objects
  columns: Array,           // Column configuration
  loading: Boolean,         // Loading state
  
  // Pagination
  totalItems: Number,       // Total count for pagination
  currentPage: Number,      // Current page (1-indexed)
  pageSize: Number,         // Items per page
  onPageChange: Function,   // Page change handler
  
  // Sorting
  sortBy: String,           // Current sort column
  sortOrder: String,        // 'asc' or 'desc'
  onSort: Function,         // Sort change handler
  
  // Filtering
  filters: Object,          // Current filter values
  onFilterChange: Function, // Filter change handler
  
  // Search
  searchValue: String,      // Current search term
  onSearchChange: Function, // Search handler
  searchPlaceholder: String,
  
  // Actions
  onRowClick: Function,     // Row click handler
  onEdit: Function,         // Edit action handler
  onDelete: Function,       // Delete action handler
  onView: Function,         // View details handler
  
  // Permissions
  canCreate: Boolean,
  canEdit: Boolean,
  canDelete: Boolean,
  
  // Customization
  emptyMessage: String,
  rowKey: String            // Unique row identifier field
};
```

## Column Configuration

```javascript
const columnConfig = {
  key: String,              // Data field key
  label: String,            // Display header
  type: String,             // 'text', 'number', 'date', 'badge', 'actions'
  sortable: Boolean,        // Enable sorting
  filterable: Boolean,      // Enable filtering
  filterType: String,       // 'search', 'select', 'date-range'
  filterOptions: Array,     // Options for select filter
  width: String,            // Column width
  render: Function,         // Custom render function
  align: String             // 'left', 'center', 'right'
};
```

## Example Usage

```jsx
// React Example
<DataTable
  data={departments}
  columns={[
    { key: 'id', label: 'ID', sortable: true, width: '80px' },
    { key: 'name', label: 'Name', sortable: true, filterable: true },
    { key: 'description', label: 'Description' },
    { key: 'manager_name', label: 'Manager', sortable: true },
    { key: 'equipment_count', label: 'Equipment', type: 'number', sortable: true },
    { 
      key: 'created_at', 
      label: 'Created', 
      type: 'date',
      render: (value) => new Date(value).toLocaleDateString()
    },
    { key: 'actions', type: 'actions', width: '150px' }
  ]}
  totalItems={pagination.total}
  currentPage={currentPage}
  pageSize={10}
  onPageChange={handlePageChange}
  sortBy={sortBy}
  sortOrder={sortOrder}
  onSort={handleSort}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onView={handleView}
  canCreate={userRole === 'admin' || userRole === 'manager'}
  canEdit={userRole === 'admin' || userRole === 'manager'}
  canDelete={userRole === 'admin'}
/>
```

---

# 🔄 5. STATE MANAGEMENT PATTERN

## React Context/Hook Pattern

```javascript
// useDataTable.js - Custom Hook
const useDataTable = (service, initialFilters = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0
  });
  const [filters, setFilters] = useState(initialFilters);
  const [sortConfig, setSortConfig] = useState({ field: null, order: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await service.getAll({
        limit: pagination.limit,
        offset: pagination.offset,
        search: searchTerm,
        sortBy: sortConfig.field,
        sortOrder: sortConfig.order,
        ...filters
      });
      
      if (response.success) {
        setData(response.data);
        setPagination(prev => ({ ...prev, total: response.pagination?.total || 0 }));
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [service, pagination.limit, pagination.offset, searchTerm, sortConfig, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      offset: (newPage - 1) * prev.limit
    }));
  };

  const handleSort = (field) => {
    setSortConfig(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  const refresh = () => fetchData();

  return {
    data,
    loading,
    error,
    pagination,
    filters,
    sortConfig,
    searchTerm,
    handlePageChange,
    handleSort,
    handleSearch,
    handleFilterChange,
    refresh
  };
};

// Usage
const DepartmentsPage = () => {
  const {
    data: departments,
    loading,
    pagination,
    handlePageChange,
    handleSort,
    handleSearch,
    refresh
  } = useDataTable(DepartmentService);

  // ... render DataTable
};
```

---

# 📱 6. UI/UX REQUIREMENTS

## Table Features Checklist

### ✅ Core Features
- [ ] Responsive design (mobile-friendly)
- [ ] Loading skeleton/spinner
- [ ] Empty state message
- [ ] Error state handling
- [ ] Pagination controls (prev/next, page numbers)
- [ ] Items per page selector (10, 25, 50, 100)
- [ ] Total count display

### ✅ Sorting
- [ ] Click column header to sort
- [ ] Sort direction indicator (↑↓)
- [ ] Persist sort state

### ✅ Filtering
- [ ] Search input with debounce (300ms)
- [ ] Filter dropdowns for categories
- [ ] Date range picker for dates
- [ ] Clear all filters button
- [ ] Active filter indicators

### ✅ Actions
- [ ] Row actions dropdown (View, Edit, Delete)
- [ ] Bulk selection checkboxes
- [ ] Bulk actions (delete multiple)
- [ ] Create new button (based on role)
- [ ] Export to CSV option

### ✅ Modals/Dialogs
- [ ] Create/Edit form modal
- [ ] View details side panel or modal
- [ ] Delete confirmation dialog
- [ ] Success/Error toast notifications

---

# 🔒 7. ROLE-BASED UI RENDERING

```javascript
const RoleBasedActions = ({ userRole, onView, onEdit, onDelete }) => {
  const canEdit = ['admin', 'manager'].includes(userRole);
  const canDelete = userRole === 'admin';

  return (
    <div className="action-buttons">
      <button onClick={onView} title="View Details">
        <EyeIcon />
      </button>
      
      {canEdit && (
        <button onClick={onEdit} title="Edit">
          <EditIcon />
        </button>
      )}
      
      {canDelete && (
        <button onClick={onDelete} title="Delete" className="danger">
          <TrashIcon />
        </button>
      )}
    </div>
  );
};

// Permission constants
const PERMISSIONS = {
  departments: {
    create: ['admin', 'manager'],
    read: ['admin', 'manager', 'technician', 'employee'],
    update: ['admin', 'manager'],
    delete: ['admin', 'manager']
  },
  equipment: {
    create: ['admin', 'manager'],
    read: ['admin', 'manager', 'technician', 'employee'],
    update: ['admin', 'manager'],
    delete: ['admin', 'manager']
  },
  teams: {
    create: ['admin', 'manager'],
    read: ['admin', 'manager', 'technician', 'employee'],
    update: ['admin', 'manager'],
    delete: ['admin', 'manager']
  }
};
```

---

# 📋 8. COMPLETE ENDPOINTS REFERENCE

## All Endpoints Summary Table

| Resource | Method | Endpoint | Description | Roles |
|----------|--------|----------|-------------|-------|
| **Auth** | POST | `/auth/register` | Register new user | Public |
| **Auth** | POST | `/auth/login` | Login | Public |
| **Auth** | POST | `/auth/refresh-token` | Refresh token | Authenticated |
| **Auth** | GET | `/auth/profile` | Get profile | Authenticated |
| **Auth** | PUT | `/auth/profile` | Update profile | Authenticated |
| **Auth** | POST | `/auth/logout` | Logout | Authenticated |
| **Users** | GET | `/users` | List users | Admin |
| **Users** | GET | `/users/:id` | Get user | Admin |
| **Users** | PUT | `/users/:id` | Update user | Admin |
| **Users** | DELETE | `/users/:id` | Delete user | Admin |
| **Users** | POST | `/users/:id/assign-technician` | Assign tech role | Admin |
| **Departments** | GET | `/departments` | List all | All |
| **Departments** | GET | `/departments/:id` | Get one | All |
| **Departments** | POST | `/departments` | Create | Admin, Manager |
| **Departments** | PUT | `/departments/:id` | Update | Admin, Manager |
| **Departments** | DELETE | `/departments/:id` | Delete | Admin, Manager |
| **Teams** | GET | `/teams` | List all | All |
| **Teams** | GET | `/teams/:id` | Get one | All |
| **Teams** | GET | `/teams/:id/technicians` | Get members | All |
| **Teams** | POST | `/teams` | Create | Admin, Manager |
| **Teams** | PUT | `/teams/:id` | Update | Admin, Manager |
| **Teams** | DELETE | `/teams/:id` | Delete | Admin, Manager |
| **Technicians** | GET | `/technicians` | List all | All |
| **Technicians** | GET | `/technicians/:id` | Get one | All |
| **Technicians** | PUT | `/technicians/:id` | Update | Admin, Manager |
| **Technicians** | DELETE | `/technicians/:id` | Remove role | Admin, Manager |
| **Categories** | GET | `/categories` | List all | All |
| **Categories** | GET | `/categories/:id` | Get one | All |
| **Categories** | GET | `/categories/stats` | Get stats | All |
| **Categories** | POST | `/categories` | Create | Admin, Manager |
| **Categories** | PUT | `/categories/:id` | Update | Admin, Manager |
| **Categories** | DELETE | `/categories/:id` | Delete | Admin |
| **Equipment** | GET | `/equipment` | List all | All |
| **Equipment** | GET | `/equipment/:id` | Get one | All |
| **Equipment** | GET | `/equipment/:id/requests` | Get history | All |
| **Equipment** | POST | `/equipment` | Create | Admin, Manager |
| **Equipment** | PUT | `/equipment/:id` | Update | Admin, Manager |
| **Equipment** | DELETE | `/equipment/:id` | Delete | Admin, Manager |
| **Requests** | GET | `/requests` | List all | All |
| **Requests** | GET | `/requests/:id` | Get one | All |
| **Requests** | GET | `/requests/:id/logs` | Get logs | All |
| **Requests** | GET | `/requests/calendar` | Calendar view | All |
| **Requests** | GET | `/requests/stats/team` | Team stats | Manager |
| **Requests** | GET | `/requests/stats/equipment` | Equip stats | Manager |
| **Requests** | POST | `/requests` | Create | All |
| **Requests** | PUT | `/requests/:id` | Update | Assigned, Manager |
| **Requests** | PUT | `/requests/:id/assign-technician` | Assign tech | Manager |
| **Requests** | PUT | `/requests/:id/status` | Update status | Assigned, Manager |
| **Requests** | DELETE | `/requests/:id` | Delete | Admin, Manager |
| **Attachments** | GET | `/attachments/:requestId` | List files | All |
| **Attachments** | POST | `/attachments/:requestId` | Upload | All |
| **Attachments** | DELETE | `/attachments/file/:id` | Delete file | Owner, Admin |

---

# 🚀 9. QUICK START IMPLEMENTATION STEPS

## Phase 1: Setup (Day 1)
1. ✅ Set up project structure (React/Vue/Angular)
2. ✅ Configure API client with interceptors
3. ✅ Implement authentication flow
4. ✅ Create base DataTable component

## Phase 2: Services (Day 2)
1. ✅ Create DepartmentService
2. ✅ Create EquipmentService
3. ✅ Create TeamService
4. ✅ Create useDataTable hook

## Phase 3: Pages (Day 3-4)
1. ✅ Departments list page with DataTable
2. ✅ Equipment list page with DataTable
3. ✅ Teams list page with DataTable
4. ✅ Create/Edit modals for each

## Phase 4: Polish (Day 5)
1. ✅ Add loading states
2. ✅ Add error handling
3. ✅ Add role-based permissions
4. ✅ Add responsive design
5. ✅ Add toast notifications

---

**Document Version:** 1.0.0  
**Last Updated:** December 27, 2025  
**API Version:** 1.1.0
