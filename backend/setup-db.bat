@echo off
cls
echo ========================================
echo   GearGuard Database Setup
echo ========================================
echo.

REM Check if MySQL is installed
where mysql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] MySQL is not installed or not in PATH!
    echo.
    echo Please install MySQL or add it to your PATH:
    echo Example: C:\Program Files\MySQL\MySQL Server 8.0\bin
    echo.
    pause
    exit /b 1
)

echo [INFO] MySQL found!
echo.

REM Prompt for MySQL credentials
set /p MYSQL_USER="Enter MySQL username (default: root): "
if "%MYSQL_USER%"=="" set MYSQL_USER=root

echo.
echo [INFO] Running database setup script...
echo [INFO] You will be prompted for MySQL password
echo.

REM Run the SQL script
mysql -u %MYSQL_USER% -p < setup-database.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   ✅ DATABASE SETUP COMPLETE!
    echo ========================================
    echo.
    echo Database: gearguard_db
    echo Tables: 10 tables created
    echo Sample Data: Loaded successfully
    echo.
    echo 👤 Default Admin Login:
    echo    Email: admin@gearguard.com
    echo    Password: admin123
    echo.
    echo 🚀 Next Steps:
    echo    1. Make sure .env file is configured
    echo    2. Run: npm install
    echo    3. Run: npm run dev
    echo.
    echo ========================================
) else (
    echo.
    echo [ERROR] Database setup failed!
    echo Please check:
    echo   - MySQL is running
    echo   - Username and password are correct
    echo   - You have permission to create databases
    echo.
)

pause
