# Express.js + MySQL Backend with RBAC

A scalable RESTful API built with Express.js, MySQL, JWT authentication, and Role-Based Access Control (RBAC).

## 🚀 Features

- ✅ **Clean Architecture**: MVC + Service Layer pattern
- ✅ **Authentication**: JWT-based authentication with bcrypt password hashing
- ✅ **Authorization**: Role-Based Access Control (User, Admin)
- ✅ **Database**: MySQL with connection pooling (mysql2/promise)
- ✅ **Error Handling**: Global error handler middleware
- ✅ **ES Modules**: Modern JavaScript import/export syntax
- ✅ **Security**: Environment variables, password hashing, JWT tokens
- ✅ **CRUD Operations**: Complete task management system

## 📁 Project Structure

```
backend/
├── config/
│   ├── env.config.js       # Environment configuration
│   ├── database.js         # Database connection pool
│   └── schema.sql          # Database schema
├── models/
│   ├── User.model.js       # User data access layer
│   └── Task.model.js       # Task data access layer
├── services/
│   ├── auth.service.js     # Authentication business logic
│   └── task.service.js     # Task business logic
├── controllers/
│   ├── auth.controller.js  # Auth request handlers
│   └── task.controller.js  # Task request handlers
├── routes/
│   ├── index.js            # Main router
│   ├── auth.routes.js      # Authentication routes
│   └── task.routes.js      # Task routes
├── middleware/
│   ├── errorHandler.js     # Global error handler
│   ├── auth.middleware.js  # JWT authentication
│   ├── roleCheck.middleware.js  # Role authorization
│   └── validator.middleware.js  # Request validation
├── utils/
│   ├── asyncHandler.js     # Async error wrapper
│   └── responseHandler.js  # Response utilities
├── .env.example            # Environment variables template
├── .gitignore
├── package.json
└── server.js               # Application entry point
```

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=express_mysql_db
DB_PORT=3306

JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRES_IN=7d
```

### 3. Set Up Database

Login to MySQL and run the schema:

```bash
mysql -u root -p
```

Then execute:

```sql
source config/schema.sql
```

Or manually:

```bash
mysql -u root -p < config/schema.sql
```

### 4. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start at `http://localhost:3000`

## 📚 API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"  // optional, defaults to "user"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <your_token>
```

### Tasks

#### Get All Tasks
```http
GET /api/tasks
Authorization: Bearer <your_token>
```

- **Users**: See only their own tasks
- **Admins**: See all tasks

#### Create Task
```http
POST /api/tasks
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "status": "pending"  // optional: pending, in_progress, completed
}
```

#### Get Task by ID
```http
GET /api/tasks/:id
Authorization: Bearer <your_token>
```

#### Update Task
```http
PUT /api/tasks/:id
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "title": "Updated title",
  "description": "Updated description",
  "status": "completed"
}
```

#### Delete Task (Admin Only)
```http
DELETE /api/tasks/:id
Authorization: Bearer <your_token>
```

#### Get Task Statistics
```http
GET /api/tasks/stats
Authorization: Bearer <your_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 10,
    "pending": 3,
    "in_progress": 5,
    "completed": 2
  }
}
```

## 🔐 Authentication & Authorization

### JWT Token Format

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Role-Based Access Control (RBAC)

| Role  | Permissions |
|-------|------------|
| **user** | - Create tasks<br>- View own tasks<br>- Update own tasks |
| **admin** | - All user permissions<br>- View all tasks<br>- Delete any task |

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🧪 Testing the API

### Using cURL

#### Register a user
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### Create a task
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "My first task",
    "description": "Task description"
  }'
```

### Using Postman

1. Import the endpoints
2. Set up an environment variable for the JWT token
3. Use `{{token}}` in Authorization headers

## ⚙️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment (development/production) | development |
| `DB_HOST` | MySQL host | localhost |
| `DB_USER` | MySQL username | root |
| `DB_PASSWORD` | MySQL password | - |
| `DB_NAME` | Database name | express_mysql_db |
| `DB_PORT` | MySQL port | 3306 |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | Token expiration | 7d |

## 🔒 Security Best Practices

- ✅ Passwords are hashed using bcrypt (10 salt rounds)
- ✅ JWT tokens for stateless authentication
- ✅ Environment variables for sensitive data
- ✅ SQL injection protection via parameterized queries
- ✅ Role-based access control
- ✅ CORS enabled
- ✅ Input validation

## 📝 Error Handling

All errors return a consistent format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 🚀 Deployment

### Production Checklist

1. ✅ Change `JWT_SECRET` to a strong random string
2. ✅ Set `NODE_ENV=production`
3. ✅ Use strong database passwords
4. ✅ Enable HTTPS
5. ✅ Set up proper CORS origins
6. ✅ Configure firewall rules
7. ✅ Set up database backups
8. ✅ Use a process manager (PM2)

### Using PM2

```bash
npm install -g pm2
pm2 start server.js --name express-api
pm2 save
pm2 startup
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

ISC

## 👨‍💻 Author

Your Name

---

**Built with ❤️ using Express.js, MySQL, and JWT**
