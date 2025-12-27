# 🚀 GearGuard Database Setup Guide

## Quick Start (3 Easy Methods)

### Method 1: Automated Setup (Recommended) ⚡

**For Windows:**
```bash
# Simply double-click this file or run in terminal:
setup-db.bat
```

**For Linux/Mac:**
```bash
# Make executable and run:
chmod +x setup-db.sh
./setup-db.sh
```

**What it does:**
- ✅ Checks if MySQL is installed
- ✅ Prompts for MySQL username/password
- ✅ Creates database and all 10 tables
- ✅ Loads sample data (admin user + categories)
- ✅ Shows success message with next steps

---

### Method 2: MySQL Command Line

```bash
# 1. Login to MySQL
mysql -u root -p

# 2. Run the setup script
source setup-database.sql

# Or in one command:
mysql -u root -p < setup-database.sql
```

---

### Method 3: MySQL Workbench (GUI)

1. Open MySQL Workbench
2. Connect to your MySQL server
3. Click **File → Open SQL Script**
4. Select `setup-database.sql`
5. Click the lightning bolt icon ⚡ to execute

---

## 📋 What Gets Created

### Database: `gearguard_db`

### Tables (10):
1. **users** - User accounts (admin, manager, technician, employee)
2. **refresh_tokens** - JWT refresh tokens
3. **departments** - Organizational departments
4. **maintenance_teams** - Maintenance teams
5. **technicians** - Technician profiles
6. **equipment_category** - Equipment categories ⭐ NEW
7. **equipment** - Equipment inventory
8. **maintenance_requests** - Maintenance requests
9. **maintenance_logs** - Status change history
10. **attachments** - File attachments

### Sample Data Included:
- ✅ **1 Admin User**
  - Email: `admin@gearguard.com`
  - Password: `admin123`
  
- ✅ **3 Departments**
  - IT Department
  - Manufacturing
  - Facilities

- ✅ **5 Equipment Categories**
  - Hydraulic Press (John Smith, HydroTech Industries)
  - CNC Machine (Sarah Johnson, PrecisionCorp)
  - HVAC System (Mike Davis, ClimateControl Ltd)
  - Generator (Emily Brown, PowerGen Solutions)
  - Conveyor Belt (David Wilson, TransportTech)

- ✅ **3 Maintenance Teams**
  - Production Team A
  - IT Support Team
  - Facilities Team

---

## ⚙️ Prerequisites

### 1. Install MySQL

**Windows:**
- Download from [MySQL Downloads](https://dev.mysql.com/downloads/installer/)
- Run installer and follow setup wizard
- Remember your root password!

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

**macOS:**
```bash
brew install mysql
brew services start mysql
```

### 2. Verify MySQL is Running

**Windows:**
```bash
# Check if MySQL service is running
sc query MySQL80
```

**Linux/Mac:**
```bash
# Check MySQL status
sudo systemctl status mysql  # Linux
brew services list           # Mac
```

### 3. Add MySQL to PATH (Windows Only)

If `mysql` command is not found:

1. Find MySQL bin folder (e.g., `C:\Program Files\MySQL\MySQL Server 8.0\bin`)
2. Add to System PATH:
   - Right-click **This PC** → **Properties**
   - Click **Advanced system settings**
   - Click **Environment Variables**
   - Edit **Path** variable
   - Add MySQL bin folder path
   - Click **OK** and restart terminal

---

## 🔧 Configuration

After database setup, configure your application:

### 1. Create/Update `.env` file:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=gearguard_db
DB_PORT=3306

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=7d

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

### 2. Install Dependencies:

```bash
npm install
```

### 3. Start Server:

```bash
npm run dev
```

---

## ✅ Verify Setup

### Check Database:

```bash
mysql -u root -p
```

```sql
USE gearguard_db;

-- Show all tables
SHOW TABLES;

-- Check users
SELECT id, name, email, role FROM users;

-- Check categories
SELECT * FROM equipment_category;

-- Check departments
SELECT * FROM departments;

-- Check teams
SELECT * FROM maintenance_teams;
```

Expected output:
- 10 tables listed
- 1 admin user
- 5 categories
- 3 departments
- 3 teams

### Test API:

```bash
# Start server
npm run dev

# Test in browser or curl:
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "GearGuard API is running",
  "version": "1.0.0"
}
```

---

## 🆘 Troubleshooting

### Error: "MySQL command not found"
**Solution:** Install MySQL or add to PATH (see Prerequisites)

### Error: "Access denied for user 'root'"
**Solution:** 
```bash
# Reset MySQL root password
mysql -u root

# Or use correct password:
mysql -u root -p
```

### Error: "Database 'gearguard_db' already exists"
**Solution:** The script automatically drops and recreates the database. Your data will be reset!

### Error: "Cannot connect to MySQL server"
**Solution:**
```bash
# Windows - Start MySQL service
net start MySQL80

# Linux
sudo systemctl start mysql

# Mac
brew services start mysql
```

### Error: "Foreign key constraint fails"
**Solution:** Run the complete `setup-database.sql` script from the beginning. Tables must be created in order.

---

## 🔄 Reset Database

To start fresh:

**Method 1: Re-run setup script**
```bash
# Windows
setup-db.bat

# Linux/Mac
./setup-db.sh
```

**Method 2: Manual reset**
```sql
DROP DATABASE gearguard_db;
source setup-database.sql;
```

---

## 🎯 Next Steps After Setup

1. ✅ **Test Login**
   ```bash
   POST /api/auth/login
   {
     "email": "admin@gearguard.com",
     "password": "admin123"
   }
   ```

2. ✅ **Create More Users**
   ```bash
   POST /api/auth/register
   {
     "name": "John Doe",
     "email": "john@example.com",
     "password": "password123",
     "role": "manager"
   }
   ```

3. ✅ **Add Equipment**
   ```bash
   POST /api/equipment
   {
     "name": "Hydraulic Press #1",
     "category_id": 1,
     "department_id": 2,
     "team_id": 1
   }
   ```

4. ✅ **Explore API**
   - Import `GearGuard_Postman_Collection.json` into Postman
   - Test all 60+ endpoints
   - Check documentation at `http://localhost:3001`

---

## 📞 Support

If you encounter issues:

1. Check MySQL is running: `mysql -u root -p`
2. Verify `.env` configuration
3. Check server logs for errors
4. Review `DATABASE_SETUP_GUIDE.md` (this file)
5. Check `EQUIPMENT_CATEGORY_MIGRATION.md` for schema details

---

## 🎓 Important Notes

⚠️ **Security Warning:**
- Default admin password is `admin123`
- **CHANGE THIS** in production!
- Never commit `.env` file to Git

💡 **Tips:**
- Run `setup-db.bat` anytime to reset database
- All sample data is optional for production
- Backup your database regularly

📚 **Related Documentation:**
- API Reference: `CATEGORY_API_DOCS.md`
- Migration Guide: `EQUIPMENT_CATEGORY_MIGRATION.md`
- Postman Collection: `GearGuard_Postman_Collection.json`

---

**Last Updated:** December 27, 2025  
**Version:** 1.1.0  
**Status:** Production Ready ✅
