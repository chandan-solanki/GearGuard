# 🛠️ GearGuard: Maintenance Tracker API

A comprehensive **REST API** backend system for managing equipment maintenance, built with **Node.js**, **Express.js**, and **MySQL**. Features **JWT authentication**, **role-based access control (RBAC)**, and a clean **MVC architecture**.

---

## 🎯 Features

- ✅ **JWT Authentication** with Access & Refresh Tokens
- ✅ **Role-Based Access Control** (Admin, Manager, Technician, Employee)
- ✅ **RESTful API Design** with proper HTTP methods
- ✅ **MySQL Database** with connection pooling
- ✅ **File Upload** support for attachments (images, PDFs)
- ✅ **Maintenance Request Lifecycle** (new → in_progress → repaired → scrap)
- ✅ **Automated Logging** of status changes
- ✅ **Calendar View** for preventive maintenance
- ✅ **Statistics & Reporting** endpoints
- ✅ **Pagination & Filtering** on all list endpoints
- ✅ **Clean MVC Architecture** (Models, Controllers, Services, Routes)

---

## 📊 Database Entities & Relationships

### Core Tables:
1. **users** - System users with roles
2. **departments** - Organization departments  
3. **maintenance_teams** - Teams responsible for equipment
4. **technicians** - Users assigned as technicians
5. **equipment** - Assets to be maintained
6. **maintenance_requests** - Maintenance work orders
7. **maintenance_logs** - History of status changes
8. **attachments** - Files linked to requests

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MySQL (v8+)
- npm or yarn

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Setup environment**
```bash
cp .env.example .env
# Edit .env with your MySQL credentials
```

3. **Initialize database**
```bash
mysql -u root -p < config/schema.sql
```

4. **Start server**
```bash
npm run dev
```

Server runs at: `http://localhost:3001`

---

## 📡 API Documentation

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh-token` - Refresh token
- `GET /api/auth/profile` - Get profile

### Maintenance Requests
- `GET /api/requests` - List requests
- `POST /api/requests` - Create request
- `PUT /api/requests/:id/status` - Update status
- `GET /api/requests/calendar` - Calendar view

### Equipment
- `GET /api/equipment` - List equipment
- `POST /api/equipment` - Create equipment
- `GET /api/equipment/:id/requests` - Get requests

See full documentation at: `http://localhost:3001/`

---

## 🔐 Roles & Permissions

- **Admin** - Full system access
- **Manager** - Manage teams, equipment, requests
- **Technician** - Update assigned requests
- **Employee** - Create & view requests

---

## 📝 License

ISC
