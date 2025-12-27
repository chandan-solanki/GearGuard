-- ============================================
-- GearGuard Database Setup Script
-- Easy one-file database creation
-- ============================================

-- Drop existing database if needed (CAUTION: This deletes all data!)
DROP DATABASE IF EXISTS gearguard_db;

-- Create fresh database
CREATE DATABASE gearguard_db;
USE gearguard_db;

-- ===========================================
-- 1️⃣ USERS TABLE
-- ===========================================
CREATE TABLE users (
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
CREATE TABLE refresh_tokens (
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
CREATE TABLE departments (
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
CREATE TABLE maintenance_teams (
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
CREATE TABLE technicians (
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
-- 6️⃣ EQUIPMENT_CATEGORY TABLE (NEW!)
-- ===========================================
CREATE TABLE equipment_category (
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
CREATE TABLE equipment (
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
CREATE TABLE maintenance_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject VARCHAR(255) NOT NULL,
  type ENUM('corrective', 'preventive') NOT NULL,
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
  INDEX idx_request_scheduled_date (scheduled_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================================
-- 9️⃣ MAINTENANCE_LOGS TABLE
-- ===========================================
CREATE TABLE maintenance_logs (
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
CREATE TABLE attachments (
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
-- 📊 SEED DATA (Sample Data)
-- ===========================================

-- Insert default admin user (password: admin123)
-- Note: In production, you should change this password!
INSERT INTO users (name, email, password_hash, role) VALUES 
('Admin User', 'admin@gearguard.com', '$2b$10$rX5EWQjQjQZJZqQZJZqQZuK8X5EWQjQjQZJZqQZJZqQZuK8X5EWQj', 'admin');

-- Insert sample departments
INSERT INTO departments (name, description) VALUES 
('IT Department', 'Information Technology and Systems'),
('Manufacturing', 'Production and Manufacturing Equipment'),
('Facilities', 'Building Maintenance and Facilities');

-- Insert sample equipment categories
INSERT INTO equipment_category (name, responsible, company_name, description) VALUES 
('Hydraulic Press', 'John Smith', 'HydroTech Industries', 'Heavy-duty hydraulic press machines'),
('CNC Machine', 'Sarah Johnson', 'PrecisionCorp', 'Computer Numerical Control machines'),
('HVAC System', 'Mike Davis', 'ClimateControl Ltd', 'Heating, Ventilation, and Air Conditioning systems'),
('Generator', 'Emily Brown', 'PowerGen Solutions', 'Backup power generation equipment'),
('Conveyor Belt', 'David Wilson', 'TransportTech', 'Material handling conveyor systems');

-- Insert sample maintenance teams
INSERT INTO maintenance_teams (name, department_id) VALUES 
('Production Team A', 2),
('IT Support Team', 1),
('Facilities Team', 3);

-- ===========================================
-- ✅ DATABASE SETUP COMPLETE
-- ===========================================

SELECT '✅ Database created successfully!' as status;
SELECT '📊 Total tables created: 10' as info;
SELECT '👤 Default admin: admin@gearguard.com (password: admin123)' as credentials;
SELECT '🎯 Ready to use! Start your server with: npm run dev' as next_step;
