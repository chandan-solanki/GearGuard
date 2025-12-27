-- ===========================================
-- GearGuard: Maintenance Tracker Database Schema
-- ===========================================

-- Create Database
CREATE DATABASE IF NOT EXISTS gearguard_db;
USE gearguard_db;

-- ===========================================
-- 1️⃣ USERS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'technician', 'employee') DEFAULT 'employee',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_email (email),
  INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================================
-- 2️⃣ REFRESH TOKENS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================================
-- 3️⃣ DEPARTMENTS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_department_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================================
-- 4️⃣ MAINTENANCE_TEAMS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS maintenance_teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  department_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  INDEX idx_team_department (department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================================
-- 5️⃣ TECHNICIANS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS technicians (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  team_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES maintenance_teams(id) ON DELETE CASCADE,
  INDEX idx_technician_user (user_id),
  INDEX idx_technician_team (team_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================================
-- 6️⃣ EQUIPMENT_CATEGORY TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS equipment_category (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  responsible VARCHAR(255),
  company_name VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================================
-- 7️⃣ EQUIPMENT TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS equipment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  serial_number VARCHAR(255) UNIQUE,
  category_id INT NOT NULL,
  purchase_date DATE,
  warranty_end DATE,
  location VARCHAR(255),
  department_id INT NOT NULL,
  team_id INT NOT NULL,
  status ENUM('active', 'scrapped') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES equipment_category(id) ON DELETE RESTRICT,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES maintenance_teams(id) ON DELETE CASCADE,
  INDEX idx_equipment_category (category_id),
  INDEX idx_equipment_department (department_id),
  INDEX idx_equipment_team (team_id),
  INDEX idx_equipment_status (status),
  INDEX idx_equipment_serial (serial_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================================
-- 8️⃣ MAINTENANCE_REQUESTS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject VARCHAR(255) NOT NULL,
  type ENUM('corrective', 'preventive') NOT NULL,
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  description TEXT,
  equipment_id INT NOT NULL,
  department_id INT NOT NULL,
  team_id INT NOT NULL,
  technician_id INT,
  scheduled_date DATETIME,
  duration_hours DECIMAL(5,2) DEFAULT 0,
  status ENUM('new', 'in_progress', 'repaired', 'scrap') DEFAULT 'new',
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES maintenance_teams(id) ON DELETE CASCADE,
  FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_request_equipment (equipment_id),
  INDEX idx_request_department (department_id),
  INDEX idx_request_team (team_id),
  INDEX idx_request_technician (technician_id),
  INDEX idx_request_status (status),
  INDEX idx_request_type (type),
  INDEX idx_request_priority (priority),
  INDEX idx_request_scheduled_date (scheduled_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================================
-- 9️⃣ MAINTENANCE_LOGS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS maintenance_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by INT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (request_id) REFERENCES maintenance_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_log_request (request_id),
  INDEX idx_log_changed_at (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================================
-- 🔟 ATTACHMENTS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT,
  mime_type VARCHAR(100),
  uploaded_by INT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES maintenance_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_attachment_request (request_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================================
-- SEED DATA (Optional - for development)
-- ===========================================

-- Insert default admin user (password: admin123)
INSERT INTO users (name, email, password_hash, role) VALUES 
('Admin User', 'admin@gearguard.com', '$2b$10$rX5EWQjQjQZJZqQZJZqQZuK8X5EWQjQjQZJZqQZuK8X5EWQj', 'admin')
ON DUPLICATE KEY UPDATE name=name;

-- Insert sample departments
INSERT INTO departments (name, description) VALUES 
('IT Department', 'Information Technology and Systems'),
('Manufacturing', 'Production and Manufacturing Equipment'),
('Facilities', 'Building Maintenance and Facilities')
ON DUPLICATE KEY UPDATE name=name;

-- Insert sample equipment categories
INSERT INTO equipment_category (name, responsible, company_name, description) VALUES 
('Hydraulic Press', 'John Smith', 'HydroTech Industries', 'Heavy-duty hydraulic press machines'),
('CNC Machine', 'Sarah Johnson', 'PrecisionCorp', 'Computer Numerical Control machines'),
('HVAC System', 'Mike Davis', 'ClimateControl Ltd', 'Heating, Ventilation, and Air Conditioning systems'),
('Generator', 'Emily Brown', 'PowerGen Solutions', 'Backup power generation equipment'),
('Conveyor Belt', 'David Wilson', 'TransportTech', 'Material handling conveyor systems')
ON DUPLICATE KEY UPDATE name=name;
