@echo off
REM GearGuard Quick Setup Script for Windows
REM Run this script to set up the database and start the server

echo ============================================================
echo  GearGuard: Maintenance Tracker - Quick Setup
echo ============================================================
echo.

REM Check if .env exists
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
    echo.
    echo .env file created. Please edit it with your MySQL credentials:
    echo   - DB_PASSWORD=your_mysql_password
    echo   - JWT_SECRET=your_secret_key
    echo   - JWT_REFRESH_SECRET=your_refresh_secret
    echo.
    pause
)

REM Check if node_modules exists
if not exist node_modules (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Database setup instructions
echo ============================================================
echo  Database Setup Required
echo ============================================================
echo.
echo Please run these commands in MySQL:
echo.
echo   mysql -u root -p
echo   CREATE DATABASE IF NOT EXISTS gearguard_db;
echo   USE gearguard_db;
echo   SOURCE %cd%\config\schema.sql;
echo   exit;
echo.
set /p dbdone="Have you created the database? (y/n): "

if /i "%dbdone%"=="y" (
    echo.
    echo Setup complete!
    echo.
    echo Starting server...
    echo.
    call npm run dev
) else (
    echo.
    echo Please create the database first, then run:
    echo   npm run dev
    echo.
    pause
)
