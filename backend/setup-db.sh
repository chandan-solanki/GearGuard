#!/bin/bash

clear
echo "========================================"
echo "   GearGuard Database Setup"
echo "========================================"
echo ""

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "[ERROR] MySQL is not installed or not in PATH!"
    echo ""
    echo "Please install MySQL first:"
    echo "  - Ubuntu/Debian: sudo apt install mysql-server"
    echo "  - macOS: brew install mysql"
    echo ""
    exit 1
fi

echo "[INFO] MySQL found!"
echo ""

# Prompt for MySQL credentials
read -p "Enter MySQL username (default: root): " MYSQL_USER
MYSQL_USER=${MYSQL_USER:-root}

echo ""
echo "[INFO] Running database setup script..."
echo "[INFO] You will be prompted for MySQL password"
echo ""

# Run the SQL script
mysql -u "$MYSQL_USER" -p < setup-database.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "   ✅ DATABASE SETUP COMPLETE!"
    echo "========================================"
    echo ""
    echo "Database: gearguard_db"
    echo "Tables: 10 tables created"
    echo "Sample Data: Loaded successfully"
    echo ""
    echo "👤 Default Admin Login:"
    echo "   Email: admin@gearguard.com"
    echo "   Password: admin123"
    echo ""
    echo "🚀 Next Steps:"
    echo "   1. Make sure .env file is configured"
    echo "   2. Run: npm install"
    echo "   3. Run: npm run dev"
    echo ""
    echo "========================================"
else
    echo ""
    echo "[ERROR] Database setup failed!"
    echo "Please check:"
    echo "  - MySQL is running"
    echo "  - Username and password are correct"
    echo "  - You have permission to create databases"
    echo ""
fi

echo ""
read -p "Press Enter to exit..."
