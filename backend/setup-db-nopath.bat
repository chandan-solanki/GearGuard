@echo off
cls
echo ========================================
echo   GearGuard Database Setup (No PATH)
echo ========================================
echo.

REM Common MySQL installation paths
set MYSQL_PATH1=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe
set MYSQL_PATH2=C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe
set MYSQL_PATH3=C:\Program Files\MySQL\MySQL Server 9.0\bin\mysql.exe
set MYSQL_PATH4=C:\xampp\mysql\bin\mysql.exe
set MYSQL_PATH5=C:\wamp64\bin\mysql\mysql8.0.27\bin\mysql.exe

REM Find MySQL
set MYSQL_FOUND=0
set MYSQL_EXE=

if exist "%MYSQL_PATH1%" (
    set MYSQL_EXE=%MYSQL_PATH1%
    set MYSQL_FOUND=1
    echo [INFO] Found MySQL at: %MYSQL_PATH1%
) else if exist "%MYSQL_PATH2%" (
    set MYSQL_EXE=%MYSQL_PATH2%
    set MYSQL_FOUND=1
    echo [INFO] Found MySQL at: %MYSQL_PATH2%
) else if exist "%MYSQL_PATH3%" (
    set MYSQL_EXE=%MYSQL_PATH3%
    set MYSQL_FOUND=1
    echo [INFO] Found MySQL at: %MYSQL_PATH3%
) else if exist "%MYSQL_PATH4%" (
    set MYSQL_EXE=%MYSQL_PATH4%
    set MYSQL_FOUND=1
    echo [INFO] Found MySQL at: %MYSQL_PATH4%
) else if exist "%MYSQL_PATH5%" (
    set MYSQL_EXE=%MYSQL_PATH5%
    set MYSQL_FOUND=1
    echo [INFO] Found MySQL at: %MYSQL_PATH5%
)

if %MYSQL_FOUND%==0 (
    echo [ERROR] MySQL not found in common locations!
    echo.
    echo Please enter the full path to mysql.exe:
    echo Example: C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe
    echo.
    set /p MYSQL_EXE="MySQL Path: "
    
    if not exist "%MYSQL_EXE%" (
        echo [ERROR] File not found: %MYSQL_EXE%
        echo.
        echo Please check MySQL installation or use MySQL Workbench instead.
        echo See FIX_MYSQL_PATH.md for detailed instructions.
        pause
        exit /b 1
    )
)

echo.

REM Prompt for MySQL credentials
set /p MYSQL_USER="Enter MySQL username (default: root): "
if "%MYSQL_USER%"=="" set MYSQL_USER=root

echo.
echo [INFO] Running database setup script...
echo [INFO] You will be prompted for MySQL password
echo.

REM Run the SQL script with full path
"%MYSQL_EXE%" -u %MYSQL_USER% -p < setup-database.sql

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
    echo    1. Configure .env file
    echo    2. Run: npm install
    echo    3. Run: npm run dev
    echo.
    echo ========================================
) else (
    echo.
    echo [ERROR] Database setup failed!
    echo.
    echo Common issues:
    echo   - Wrong MySQL password
    echo   - MySQL server not running
    echo   - Insufficient permissions
    echo.
    echo To start MySQL service:
    echo   net start MySQL80
    echo.
    echo Or check services.msc and start MySQL80 service
    echo.
)

pause
