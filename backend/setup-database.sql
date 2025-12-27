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
-- 📊 SEED DATA (Sample Data for Testing)
-- ===========================================

-- ==================== USERS ====================
-- Password for all users: admin123
-- Hash: $2b$10$rX5EWQjQjQZJZqQZJZqQZuK8X5EWQjQjQZJZqQZuK8X5EWQj
INSERT INTO users (name, email, password_hash, role) VALUES 
('Admin User', 'admin@gearguard.com', '$2b$10$rX5EWQjQjQZJZqQZJZqQZuK8X5EWQjQjQZJZqQZuK8X5EWQj', 'admin'),
('John Manager', 'john.manager@gearguard.com', '$2b$10$rX5EWQjQjQZJZqQZJZqQZuK8X5EWQjQjQZJZqQZuK8X5EWQj', 'manager'),
('Sarah Manager', 'sarah.manager@gearguard.com', '$2b$10$rX5EWQjQjQZJZqQZJZqQZuK8X5EWQjQjQZJZqQZuK8X5EWQj', 'manager'),
('Mike Technician', 'mike.tech@gearguard.com', '$2b$10$rX5EWQjQjQZJZqQZJZqQZuK8X5EWQjQjQZJZqQZuK8X5EWQj', 'technician'),
('Lisa Technician', 'lisa.tech@gearguard.com', '$2b$10$rX5EWQjQjQZJZqQZJZqQZuK8X5EWQjQjQZJZqQZuK8X5EWQj', 'technician'),
('James Technician', 'james.tech@gearguard.com', '$2b$10$rX5EWQjQjQZJZqQZJZqQZuK8X5EWQjQjQZJZqQZuK8X5EWQj', 'technician'),
('Emily Employee', 'emily.emp@gearguard.com', '$2b$10$rX5EWQjQjQZJZqQZJZqQZuK8X5EWQjQjQZJZqQZuK8X5EWQj', 'employee'),
('David Employee', 'david.emp@gearguard.com', '$2b$10$rX5EWQjQjQZJZqQZJZqQZuK8X5EWQjQjQZJZqQZuK8X5EWQj', 'employee'),
('Rachel Employee', 'rachel.emp@gearguard.com', '$2b$10$rX5EWQjQjQZJZqQZuK8X5EWQjQjQZJZqQZuK8X5EWQj', 'employee'),
('Tom Employee', 'tom.emp@gearguard.com', '$2b$10$rX5EWQjQjQZJZqQZJZqQZuK8X5EWQjQjQZJZqQZuK8X5EWQj', 'employee');

-- ==================== DEPARTMENTS ====================
INSERT INTO departments (name, description) VALUES 
('IT Department', 'Information Technology and Systems Management'),
('Manufacturing', 'Production and Manufacturing Equipment Operations'),
('Facilities', 'Building Maintenance and Facilities Management'),
('Quality Control', 'Quality Assurance and Testing'),
('Warehouse', 'Storage and Logistics Operations');

-- ==================== EQUIPMENT CATEGORIES ====================
INSERT INTO equipment_category (name, responsible, company_name, description) VALUES 
('Hydraulic Press', 'John Smith', 'HydroTech Industries', 'Heavy-duty hydraulic press machines for metal forming'),
('CNC Machine', 'Sarah Johnson', 'PrecisionCorp', 'Computer Numerical Control machines for precision manufacturing'),
('HVAC System', 'Mike Davis', 'ClimateControl Ltd', 'Heating, Ventilation, and Air Conditioning systems'),
('Generator', 'Emily Brown', 'PowerGen Solutions', 'Backup power generation equipment'),
('Conveyor Belt', 'David Wilson', 'TransportTech', 'Material handling conveyor systems'),
('Forklift', 'Robert Garcia', 'LiftMaster Inc', 'Industrial forklifts and material handling'),
('Compressor', 'Linda Martinez', 'AirTech Systems', 'Industrial air compressors'),
('Welding Machine', 'Chris Anderson', 'WeldPro Equipment', 'Industrial welding equipment');

-- ==================== MAINTENANCE TEAMS ====================
INSERT INTO maintenance_teams (name, department_id) VALUES 
('Mechanical Team', 2),
('Electrical Team', 2),
('HVAC Team', 3),
('IT Support Team', 1),
('Facilities Team', 3);

-- ==================== TECHNICIANS ====================
INSERT INTO technicians (user_id, team_id) VALUES 
(4, 1),  -- Mike Technician -> Mechanical Team
(5, 1),  -- Lisa Technician -> Mechanical Team
(6, 3);  -- James Technician -> HVAC Team

-- ==================== EQUIPMENT ====================
INSERT INTO equipment (name, serial_number, category_id, purchase_date, warranty_end, location, department_id, team_id, status) VALUES 
-- Manufacturing Equipment
('Hydraulic Press #1', 'HP-2023-001', 1, '2023-01-15', '2026-01-15', 'Factory Floor A - Section 1', 2, 1, 'active'),
('Hydraulic Press #2', 'HP-2023-002', 1, '2023-02-20', '2026-02-20', 'Factory Floor A - Section 2', 2, 1, 'active'),
('CNC Machine #1', 'CNC-2023-003', 2, '2023-03-10', '2026-03-10', 'Workshop B - Line 1', 2, 1, 'active'),
('CNC Machine #2', 'CNC-2023-004', 2, '2023-06-20', '2026-06-20', 'Workshop B - Line 2', 2, 1, 'active'),
('Conveyor Belt System A', 'CVB-2023-005', 5, '2023-04-15', '2025-04-15', 'Factory Floor A', 2, 1, 'active'),
('Welding Machine #1', 'WLD-2023-006', 8, '2023-05-10', '2026-05-10', 'Workshop C', 2, 1, 'active'),

-- Facilities Equipment
('HVAC Unit #1', 'HVAC-2022-007', 3, '2022-11-10', '2025-11-10', 'Building A - Floor 1', 3, 3, 'active'),
('HVAC Unit #2', 'HVAC-2022-008', 3, '2022-11-15', '2025-11-15', 'Building A - Floor 2', 3, 3, 'active'),
('HVAC Unit #3', 'HVAC-2023-009', 3, '2023-01-20', '2026-01-20', 'Building B', 3, 3, 'active'),
('Generator #1', 'GEN-2022-010', 4, '2022-08-05', '2025-08-05', 'Utility Room - Building A', 3, 3, 'active'),
('Air Compressor #1', 'CMP-2023-011', 7, '2023-07-12', '2026-07-12', 'Utility Room - Building B', 3, 3, 'active'),

-- Warehouse Equipment
('Forklift #1', 'FLT-2023-012', 6, '2023-02-28', '2026-02-28', 'Warehouse - Zone A', 5, 5, 'active'),
('Forklift #2', 'FLT-2023-013', 6, '2023-03-15', '2026-03-15', 'Warehouse - Zone B', 5, 5, 'active'),
('Conveyor Belt System B', 'CVB-2023-014', 5, '2023-08-20', '2025-08-20', 'Warehouse Loading Dock', 5, 5, 'active'),

-- Scrapped Equipment
('Old Hydraulic Press', 'HP-2018-999', 1, '2018-05-10', '2021-05-10', 'Storage - Decommissioned', 2, 1, 'scrapped');

-- ==================== MAINTENANCE REQUESTS ====================
INSERT INTO maintenance_requests (subject, type, priority, description, equipment_id, department_id, team_id, technician_id, scheduled_date, duration_hours, status, created_by) VALUES 
-- Critical Requests
('Emergency: Hydraulic Press #1 complete failure', 'corrective', 'critical', 'Hydraulic press stopped working completely. Production line halted. Requires immediate attention.', 1, 2, 1, NULL, '2024-12-28 08:00:00', 0, 'new', 1),
('HVAC Unit #1 complete shutdown', 'corrective', 'critical', 'Air conditioning system failed in Building A. Temperature rising rapidly. Staff comfort affected.', 7, 3, 3, 3, '2024-12-28 09:00:00', 0, 'new', 2),
('Generator #1 not starting', 'corrective', 'critical', 'Backup generator failed to start during test. Critical for emergency power.', 10, 3, 3, NULL, '2024-12-27 14:00:00', 0, 'new', 1),

-- High Priority Requests
('CNC Machine #2 spindle overheating', 'corrective', 'high', 'Spindle motor overheating after 2 hours of operation. Affecting production quality and speed.', 4, 2, 1, 1, '2024-12-28 10:00:00', 2.5, 'in_progress', 2),
('Hydraulic Press #1 oil leak detected', 'corrective', 'high', 'Large hydraulic oil leak under press. Risk of environmental damage and fire hazard.', 1, 2, 1, 2, '2024-12-29 08:30:00', 0, 'new', 7),
('Forklift #1 brake system issue', 'corrective', 'high', 'Brake pedal feels soft and stopping distance increased. Safety hazard.', 12, 5, 5, NULL, '2024-12-29 11:00:00', 0, 'new', 8),
('Conveyor Belt A motor failure', 'corrective', 'high', 'Main motor for conveyor belt stopped working. Production flow disrupted.', 5, 2, 1, 1, '2024-12-27 13:00:00', 4.0, 'in_progress', 7),

-- Medium Priority Requests
('Quarterly CNC Machine #1 maintenance', 'preventive', 'medium', 'Scheduled quarterly maintenance including lubrication, calibration, and parts inspection.', 3, 2, 1, 1, '2024-12-30 10:00:00', 0, 'new', 2),
('Monthly HVAC Unit #2 filter replacement', 'preventive', 'medium', 'Routine monthly HVAC filter replacement and system check for optimal performance.', 8, 3, 3, 3, '2024-12-20 08:00:00', 1.5, 'repaired', 3),
('CNC Machine #1 control panel malfunction', 'corrective', 'medium', 'Some control panel buttons not responding properly. Operators having difficulty starting cycles.', 3, 2, 1, 1, '2024-12-27 14:00:00', 3.0, 'in_progress', 7),
('HVAC Unit #3 strange noise from compressor', 'corrective', 'medium', 'Unusual rattling noise coming from HVAC compressor unit. Investigated and fixed loose fan belt.', 9, 3, 3, 3, '2024-12-22 11:00:00', 2.0, 'repaired', 3),
('Welding Machine #1 electrode holder loose', 'corrective', 'medium', 'Electrode holder connection loose causing poor weld quality. Needs tightening and inspection.', 6, 2, 1, 2, '2024-12-26 09:00:00', 1.0, 'repaired', 8),
('Air Compressor #1 pressure fluctuation', 'corrective', 'medium', 'Air pressure fluctuating between 80-100 PSI. Should maintain steady 90 PSI.', 11, 3, 3, NULL, '2024-12-30 14:00:00', 0, 'new', 9),

-- Low Priority Requests
('Annual Hydraulic Press #2 inspection', 'preventive', 'low', 'Annual safety inspection and documentation update for hydraulic press as per regulations.', 2, 2, 1, NULL, '2025-01-15 09:00:00', 0, 'new', 2),
('Hydraulic Press #1 cosmetic painting', 'preventive', 'low', 'Cosmetic maintenance - repaint rusted areas on press frame for better appearance.', 1, 2, 1, NULL, '2025-01-20 10:00:00', 0, 'new', 2),
('Forklift #2 seat cushion replacement', 'preventive', 'low', 'Driver seat cushion worn out. Needs replacement for operator comfort.', 13, 5, 5, NULL, '2025-01-10 08:00:00', 0, 'new', 8),
('HVAC Unit #1 external cleaning', 'preventive', 'low', 'Clean external unit housing and surrounding area. Remove debris and leaves.', 7, 3, 3, NULL, '2025-01-25 10:00:00', 0, 'new', 3),

-- Completed Historical Requests
('CNC Machine #2 annual calibration', 'preventive', 'medium', 'Annual precision calibration completed successfully. All axes within tolerance.', 4, 2, 1, 1, '2024-12-15 09:00:00', 4.5, 'repaired', 2),
('Generator #1 quarterly test run', 'preventive', 'medium', 'Quarterly test run completed. Generator performed well under load test.', 10, 3, 3, 3, '2024-12-10 10:00:00', 2.0, 'repaired', 1),
('Conveyor Belt B belt replacement', 'preventive', 'medium', 'Replaced worn conveyor belt. System tested and running smoothly.', 14, 5, 5, NULL, '2024-12-18 11:00:00', 3.5, 'repaired', 8);

-- ==================== MAINTENANCE LOGS ====================
INSERT INTO maintenance_logs (request_id, old_status, new_status, changed_by, changed_at, notes) VALUES 
-- Logs for request #4 (CNC spindle overheating - in progress)
(4, NULL, 'new', 2, '2024-12-27 15:00:00', 'Request created by manager'),
(4, 'new', 'in_progress', 1, '2024-12-28 10:15:00', 'Technician Mike started inspection. Checking cooling system.'),

-- Logs for request #7 (Conveyor motor failure - in progress)
(7, NULL, 'new', 7, '2024-12-27 13:00:00', 'Request created - production affected'),
(7, 'new', 'in_progress', 1, '2024-12-27 13:30:00', 'Started diagnostics. Motor windings suspected.'),

-- Logs for request #9 (HVAC filter replacement - completed)
(9, NULL, 'new', 3, '2024-12-19 08:00:00', 'Scheduled preventive maintenance'),
(9, 'new', 'in_progress', 3, '2024-12-20 08:00:00', 'Started filter replacement'),
(9, 'in_progress', 'repaired', 3, '2024-12-20 09:30:00', 'Filter replaced. System tested. Air flow optimal.'),

-- Logs for request #10 (CNC control panel - in progress)
(10, NULL, 'new', 7, '2024-12-27 14:00:00', 'Operators reporting button issues'),
(10, 'new', 'in_progress', 1, '2024-12-27 15:00:00', 'Investigating control panel wiring and connections'),

-- Logs for request #11 (HVAC noise - completed)
(11, NULL, 'new', 3, '2024-12-22 09:00:00', 'Reported by facility manager'),
(11, 'new', 'in_progress', 3, '2024-12-22 11:00:00', 'Found loose fan belt'),
(11, 'in_progress', 'repaired', 3, '2024-12-22 13:00:00', 'Tightened fan belt. Noise eliminated. System running quietly.'),

-- Logs for request #12 (Welding machine - completed)
(12, NULL, 'new', 8, '2024-12-26 08:00:00', 'Quality issue detected in welds'),
(12, 'new', 'in_progress', 2, '2024-12-26 09:00:00', 'Checking electrode holder and connections'),
(12, 'in_progress', 'repaired', 2, '2024-12-26 10:00:00', 'Tightened holder. Replaced worn contact. Tested successfully.'),

-- Logs for request #18 (CNC calibration - completed)
(18, NULL, 'new', 2, '2024-12-14 08:00:00', 'Annual calibration scheduled'),
(18, 'new', 'in_progress', 1, '2024-12-15 09:00:00', 'Started calibration procedure'),
(18, 'in_progress', 'repaired', 1, '2024-12-15 13:30:00', 'Calibration completed. All axes precise. Test cuts verified.'),

-- Logs for request #19 (Generator test - completed)
(19, NULL, 'new', 1, '2024-12-09 08:00:00', 'Quarterly test scheduled'),
(19, 'new', 'in_progress', 3, '2024-12-10 10:00:00', 'Starting load test'),
(19, 'in_progress', 'repaired', 3, '2024-12-10 12:00:00', 'Load test passed. All systems nominal.'),

-- Logs for request #20 (Conveyor belt replacement - completed)
(20, NULL, 'new', 8, '2024-12-17 09:00:00', 'Belt showing wear. Replacement needed.'),
(20, 'new', 'in_progress', 5, '2024-12-18 11:00:00', 'Removing old belt'),
(20, 'in_progress', 'repaired', 5, '2024-12-18 14:30:00', 'New belt installed. Tensioned and aligned properly. Running smoothly.');

-- ==================== ATTACHMENTS ====================
INSERT INTO attachments (request_id, file_name, file_path, file_size, mime_type, uploaded_by, uploaded_at) VALUES 
-- Attachments for CNC spindle overheating (#4)
(4, 'spindle_overheating_photo.jpg', 'uploads/1703756400000-spindle_overheating_photo.jpg', 2456789, 'image/jpeg', 1, '2024-12-28 10:30:00'),
(4, 'temperature_readings.pdf', 'uploads/1703756500000-temperature_readings.pdf', 145678, 'application/pdf', 1, '2024-12-28 10:45:00'),

-- Attachments for Conveyor motor failure (#7)
(7, 'motor_burnout_damage.jpg', 'uploads/1703685600000-motor_burnout_damage.jpg', 3234567, 'image/jpeg', 1, '2024-12-27 13:15:00'),
(7, 'electrical_diagram.pdf', 'uploads/1703686000000-electrical_diagram.pdf', 567890, 'application/pdf', 1, '2024-12-27 14:00:00'),

-- Attachments for HVAC filter replacement (#9)
(9, 'old_filter_condition.jpg', 'uploads/1703070000000-old_filter_condition.jpg', 1876543, 'image/jpeg', 3, '2024-12-20 08:15:00'),
(9, 'new_filter_installed.jpg', 'uploads/1703075400000-new_filter_installed.jpg', 1654321, 'image/jpeg', 3, '2024-12-20 09:25:00'),

-- Attachments for Welding machine (#12)
(12, 'welding_quality_issue.jpg', 'uploads/1703574000000-welding_quality_issue.jpg', 2123456, 'image/jpeg', 8, '2024-12-26 08:30:00'),
(12, 'repair_completed.jpg', 'uploads/1703577600000-repair_completed.jpg', 1987654, 'image/jpeg', 2, '2024-12-26 10:15:00'),

-- Attachments for CNC calibration (#18)
(18, 'calibration_report.pdf', 'uploads/1702638000000-calibration_report.pdf', 456789, 'application/pdf', 1, '2024-12-15 13:45:00'),
(18, 'test_cut_measurements.pdf', 'uploads/1702638300000-test_cut_measurements.pdf', 234567, 'application/pdf', 1, '2024-12-15 13:50:00'),

-- Attachments for Generator test (#19)
(19, 'load_test_results.pdf', 'uploads/1702206000000-load_test_results.pdf', 345678, 'application/pdf', 3, '2024-12-10 12:15:00');

-- ===========================================
-- ✅ DATABASE SETUP COMPLETE
-- ===========================================

SELECT '✅ Database created successfully!' as status;
SELECT '📊 Total tables created: 10' as info;
SELECT '👤 Sample users created: 10 (all password: admin123)' as users;
SELECT '🏢 Departments: 5 | Teams: 5 | Technicians: 3' as organization;
SELECT '🏭 Equipment: 15 items | Categories: 8' as equipment;
SELECT '🔨 Maintenance Requests: 20 | Logs: 18 | Attachments: 9' as maintenance;
SELECT '🎯 Ready to use! Start your server with: npm run dev' as next_step;
