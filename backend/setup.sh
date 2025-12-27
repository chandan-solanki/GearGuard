#!/bin/bash
# GearGuard Quick Setup Script
# Run this script to set up the database and start the server

echo "🛠️  GearGuard: Maintenance Tracker - Quick Setup"
echo "================================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your MySQL credentials."
    echo ""
    echo "Edit the following in .env:"
    echo "  - DB_PASSWORD=your_mysql_password"
    echo "  - JWT_SECRET=your_secret_key"
    echo "  - JWT_REFRESH_SECRET=your_refresh_secret"
    echo ""
    read -p "Press Enter after editing .env file..."
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Database setup prompt
echo "🗄️  Database Setup"
echo "=================="
echo "Please run these commands in MySQL:"
echo ""
echo "  mysql -u root -p"
echo "  CREATE DATABASE IF NOT EXISTS gearguard_db;"
echo "  USE gearguard_db;"
echo "  SOURCE $(pwd)/config/schema.sql;"
echo "  exit;"
echo ""
read -p "Have you created the database? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "🚀 Starting server..."
    echo ""
    npm run dev
else
    echo ""
    echo "⚠️  Please create the database first, then run:"
    echo "  npm run dev"
    echo ""
fi
