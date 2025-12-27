# 🛠️ GearGuard - Maintenance Management System

<div align="center">

![GearGuard Banner](https://img.shields.io/badge/GearGuard-Maintenance%20Tracker-blue?style=for-the-badge)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**A comprehensive, enterprise-grade maintenance management system for tracking and managing equipment maintenance workflows.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [API Documentation](#-api-documentation) • [Team](#-team)

</div>

---

## 📋 Overview

GearGuard is a full-stack maintenance tracking application designed to streamline equipment maintenance workflows in organizations. Built with modern technologies and best practices, it provides a robust platform for managing maintenance requests, equipment inventory, work orders, and technician assignments with role-based access control.

### Key Highlights
- 🔐 **Secure Authentication** - JWT-based auth with access & refresh tokens
- 👥 **Role-Based Access Control** - Admin, Manager, Technician, and Employee roles
- 📊 **Real-time Dashboard** - Interactive charts and statistics
- 📅 **Calendar Integration** - Preventive maintenance scheduling
- 📎 **File Attachments** - Support for images and documents
- 🔄 **Request Lifecycle** - Complete workflow from creation to completion
- 📱 **Responsive Design** - Works seamlessly across all devices
- 🎯 **RESTful API** - Well-documented and scalable backend

---

## ✨ Features

### 🔧 Maintenance Management
- Create, track, and manage maintenance requests
- Automated status tracking (New → In Progress → Repaired → Scrapped)
- Priority-based request handling (Low, Medium, High, Urgent)
- Detailed maintenance history and logs
- Attachment support for documentation

### 📦 Equipment Management
- Comprehensive equipment inventory
- Equipment categorization and classification
- Tracking of equipment condition and location
- Maintenance history per equipment
- Equipment lifecycle management

### 👷 Technician & Team Management
- Technician assignment and workload tracking
- Maintenance team organization
- Department-based access control
- Performance tracking and reporting

### 📊 Dashboard & Analytics
- Real-time statistics and metrics
- Request status distribution
- Equipment condition overview
- Preventive maintenance calendar
- Custom reports and filtering

### 🔐 Security & Authentication
- JWT-based authentication system
- Role-based authorization (RBAC)
- Secure password hashing with bcrypt
- Protected API endpoints
- Session management with refresh tokens

---

## 🚀 Tech Stack

### Backend
- **Runtime**: Node.js (v16+)
- **Framework**: Express.js
- **Database**: MySQL (v8+)
- **Authentication**: JWT (jsonwebtoken), bcrypt
- **File Upload**: Multer
- **Architecture**: MVC with Service Layer
- **ORM**: mysql2 with Promise support

### Frontend
- **Framework**: Next.js 16.1.1 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **State Management**: React Hooks
- **Data Tables**: TanStack Table
- **Charts**: Recharts
- **Drag & Drop**: dnd-kit
- **Icons**: Lucide React, Tabler Icons

### DevOps & Tools
- **Version Control**: Git
- **Package Manager**: npm
- **Development**: nodemon (hot reload)
- **Environment**: dotenv

---

## 🏗️ Project Structure

```
GearGuard/
├── backend/                      # Node.js + Express backend
│   ├── config/                   # Configuration files
│   │   ├── database.js           # Database connection
│   │   ├── dbInit.js             # DB initialization
│   │   ├── env.config.js         # Environment config
│   │   └── schema.sql            # Database schema
│   ├── controllers/              # Request handlers
│   ├── middleware/               # Express middleware
│   │   ├── auth.middleware.js    # JWT authentication
│   │   ├── roleCheck.middleware.js # RBAC authorization
│   │   └── errorHandler.js       # Global error handler
│   ├── models/                   # Data access layer
│   ├── routes/                   # API route definitions
│   ├── services/                 # Business logic layer
│   ├── utils/                    # Helper functions
│   ├── uploads/                  # File storage
│   └── server.js                 # Entry point
│
├── front-end/                    # Next.js + TypeScript frontend
│   ├── app/                      # Next.js app directory
│   ├── components/               # React components
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utility libraries
│   └── public/                   # Static assets
│
└── README.md                     # This file
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **MySQL** (v8 or higher)
- **npm** or **yarn**
- **Git**

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/chandan-solanki/GearGuard.git
cd GearGuard
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your MySQL credentials

# Initialize database
mysql -u root -p < config/schema.sql

# Start development server
npm run dev
```

Backend will run on: `http://localhost:3001`

#### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd front-end

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Add your backend API URL

# Start development server
npm run dev
```

Frontend will run on: `http://localhost:3000`

### Environment Variables

#### Backend (.env)
```env
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=gearguard_db
DB_PORT=3306

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=30d
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 📡 API Documentation

### Authentication Endpoints
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - User login
POST   /api/auth/refresh-token     - Refresh access token
GET    /api/auth/profile           - Get user profile
PUT    /api/auth/profile           - Update profile
```

### Maintenance Request Endpoints
```
GET    /api/requests               - List all requests (with filters)
POST   /api/requests               - Create new request
GET    /api/requests/:id           - Get request details
PUT    /api/requests/:id           - Update request
DELETE /api/requests/:id           - Delete request
PUT    /api/requests/:id/status    - Update request status
GET    /api/requests/calendar      - Calendar view
GET    /api/requests/statistics    - Get statistics
```

### Equipment Endpoints
```
GET    /api/equipment              - List all equipment
POST   /api/equipment              - Create equipment
GET    /api/equipment/:id          - Get equipment details
PUT    /api/equipment/:id          - Update equipment
DELETE /api/equipment/:id          - Delete equipment
GET    /api/equipment/:id/requests - Get equipment requests
```

### Additional Endpoints
- **Departments**: `/api/departments`
- **Teams**: `/api/teams`
- **Technicians**: `/api/technicians`
- **Users**: `/api/users`
- **Attachments**: `/api/attachments`
- **Categories**: `/api/categories`

For complete API documentation with examples, see:
- [API_COMPLETE_GUIDE.md](backend/COMPLETE_API_GUIDE.md)
- [API_EXAMPLES.md](backend/API_EXAMPLES.md)
- [API_RESPONSE_EXAMPLES.md](backend/API_RESPONSE_EXAMPLES.md)

---

## 🗄️ Database Schema

The system uses a relational MySQL database with the following core entities:

- **users** - System users with authentication
- **departments** - Organization departments
- **maintenance_teams** - Maintenance teams
- **technicians** - Technician profiles
- **equipment** - Equipment inventory
- **equipment_categories** - Equipment classifications
- **maintenance_requests** - Maintenance work orders
- **maintenance_logs** - Status change history
- **tasks** - Task management
- **attachments** - File attachments
- **refresh_tokens** - JWT refresh tokens

For detailed schema and ER diagram, see:
- [Database Schema](backend/config/schema.sql)
- [ER Diagram](backend/ER_DIAGRAM.md)
- [Database Setup Guide](backend/DATABASE_SETUP_GUIDE.md)

---

## 👥 Team

This project was developed by a talented team of engineers:

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/chandan-solanki">
        <img src="https://github.com/chandan-solanki.png" width="100px;" alt="Chandan Solanki"/>
        <br />
        <sub><b>Chandan Solanki</b></sub>
      </a>
      <br />
      <sub>Backend & Frontend Engineer</sub>
      <br />
      <a href="https://github.com/chandan-solanki">@chandan-solanki</a>
    </td>
    <td align="center">
      <a href="https://github.com/AdhyaChauhan">
        <img src="https://github.com/AdhyaChauhan.png" width="100px;" alt="Adhya Chauhan"/>
        <br />
        <sub><b>Adhya Chauhan</b></sub>
      </a>
      <br />
      <sub>Backend Engineer</sub>
      <br />
      <a href="https://github.com/AdhyaChauhan">@AdhyaChauhan</a>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://github.com/BAVALIYACHARDIK">
        <img src="https://github.com/BAVALIYACHARDIK.png" width="100px;" alt="Hardik Bavaliya"/>
        <br />
        <sub><b>Hardik Bavaliya</b></sub>
      </a>
      <br />
      <sub>Backend Engineer</sub>
      <br />
      <a href="https://github.com/BAVALIYACHARDIK">@BAVALIYACHARDIK</a>
    </td>
    <td align="center">
      <a href="https://github.com/chundadiya-harsh">
        <img src="https://github.com/chundadiya-harsh.png" width="100px;" alt="Chundadiya Harsh Devendra"/>
        <br />
        <sub><b>Chundadiya Harsh Devendra</b></sub>
      </a>
      <br />
      <sub>Database Design & Engineer</sub>
      <br />
      <a href="https://github.com/chundadiya-harsh">@chundadiya-harsh</a>
    </td>
  </tr>
</table>

---

## 🔐 User Roles & Permissions

### Admin
- Full system access
- User management
- System configuration
- All CRUD operations

### Manager
- Manage teams and equipment
- Approve/reject requests
- Assign technicians
- View reports

### Technician
- View assigned requests
- Update request status
- Add maintenance logs
- Upload attachments

### Employee
- Create maintenance requests
- View own requests
- Track request status
- Add comments

---

## 📝 Development Guidelines

### Code Style
- Follow ES6+ JavaScript standards
- Use async/await for asynchronous operations
- Implement error handling with try-catch
- Write clean, documented code
- Follow MVC architecture pattern

### API Design
- RESTful endpoints
- Proper HTTP status codes
- Consistent response format
- Pagination for list endpoints
- Input validation and sanitization

### Security Best Practices
- Password hashing with bcrypt
- JWT token-based authentication
- Protected routes with middleware
- SQL injection prevention
- XSS protection
- CORS configuration

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd front-end
npm test
```

---

## 📦 Deployment

### Backend Deployment
```bash
cd backend
npm install --production
npm start
```

### Frontend Deployment
```bash
cd front-end
npm run build
npm start
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Contact the team members via their GitHub profiles

---

## 🙏 Acknowledgments

- Built as part of the Odoo Hackathon
- Thanks to all team members for their dedication and hard work
- Special thanks to the open-source community for the amazing tools and libraries

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by the GearGuard Team

</div>
