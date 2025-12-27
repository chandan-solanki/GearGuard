-- ===========================================
-- GearGuard: Seed Dummy Data for Testing
-- Run this after schema.sql to add test data
-- ===========================================

USE gearguard_db;

-- ===========================================
-- 1️⃣ DEPARTMENTS
-- ===========================================
INSERT INTO departments (name, description) VALUES 
('Production', 'Production and Manufacturing Operations'),
('Facilities', 'Building Maintenance and Facilities Management'),
('IT Department', 'Information Technology and Systems'),
('Quality Control', 'Quality Assurance and Testing'),
('Warehouse', 'Storage and Logistics Operations')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- ===========================================
-- 2️⃣ MAINTENANCE TEAMS
-- ===========================================
INSERT INTO maintenance_teams (name, department_id) VALUES 
('Mechanical Team', 1),
('Electrical Team', 1),
('HVAC Team', 2),
('IT Support Team', 3),
('Facilities Team', 2)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ===========================================
-- 3️⃣ USERS (Password: admin123 for all)
-- ===========================================
-- Password hash for 'admin123': $2b$10$rOzxlx5xVOUHPJBxqQz1oeJF5lWvqQdJlKfSVgSxzC5xOqPjC5xOq
INSERT INTO users (name, email, password_hash, role) VALUES 
('Admin User', 'admin@gearguard.com', '$2b$10$rOzxlx5xVOUHPJBxqQz1oeJF5lWvqQdJlKfSVgSxzC5xOqPjC5xOq', 'admin'),
('John Manager', 'john.manager@gearguard.com', '$2b$10$rOzxlx5xVOUHPJBxqQz1oeJF5lWvqQdJlKfSVgSxzC5xOqPjC5xOq', 'manager'),
('Sarah Manager', 'sarah.manager@gearguard.com', '$2b$10$rOzxlx5xVOUHPJBxqQz1oeJF5lWvqQdJlKfSVgSxzC5xOqPjC5xOq', 'manager'),
('Mike Technician', 'mike.tech@gearguard.com', '$2b$10$rOzxlx5xVOUHPJBxqQz1oeJF5lWvqQdJlKfSVgSxzC5xOqPjC5xOq', 'technician'),
('Lisa Technician', 'lisa.tech@gearguard.com', '$2b$10$rOzxlx5xVOUHPJBxqQz1oeJF5lWvqQdJlKfSVgSxzC5xOqPjC5xOq', 'technician'),
('James Technician', 'james.tech@gearguard.com', '$2b$10$rOzxlx5xVOUHPJBxqQz1oeJF5lWvqQdJlKfSVgSxzC5xOqPjC5xOq', 'technician'),
('Emily Employee', 'emily.emp@gearguard.com', '$2b$10$rOzxlx5xVOUHPJBxqQz1oeJF5lWvqQdJlKfSVgSxzC5xOqPjC5xOq', 'employee'),
('David Employee', 'david.emp@gearguard.com', '$2b$10$rOzxlx5xVOUHPJBxqQz1oeJF5lWvqQdJlKfSVgSxzC5xOqPjC5xOq', 'employee'),
('John Technician', 'john@gearguard.com', '$2b$10$rOzxlx5xVOUHPJBxqQz1oeJF5lWvqQdJlKfSVgSxzC5xOqPjC5xOq', 'technician'),
('Mike Electrical', 'mike@gearguard.com', '$2b$10$rOzxlx5xVOUHPJBxqQz1oeJF5lWvqQdJlKfSVgSxzC5xOqPjC5xOq', 'technician')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ===========================================
-- 4️⃣ EQUIPMENT CATEGORIES
-- ===========================================
INSERT INTO equipment_category (name, responsible, company_name, description) VALUES 
('CNC Machines', 'Sarah Johnson', 'PrecisionCorp', 'Computer Numerical Control machines for precision manufacturing'),
('Hydraulic Systems', 'John Smith', 'HydroTech Industries', 'Heavy-duty hydraulic press machines for metal forming'),
('HVAC Systems', 'Mike Davis', 'ClimateControl Ltd', 'Heating, Ventilation, and Air Conditioning systems'),
('Electrical Systems', 'Emily Brown', 'PowerGen Solutions', 'Electrical panels, generators, and power systems'),
('Conveyor Systems', 'David Wilson', 'TransportTech', 'Material handling conveyor systems'),
('Compressors', 'Linda Martinez', 'AirTech Systems', 'Industrial air compressors'),
('Welding Equipment', 'Chris Anderson', 'WeldPro Equipment', 'Industrial welding machines and equipment'),
('Forklifts', 'Robert Garcia', 'LiftMaster Inc', 'Industrial forklifts and material handling')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- ===========================================
-- 5️⃣ TECHNICIANS (Link users to teams)
-- ===========================================
-- Get user IDs for technicians and insert into technicians table
-- First, let's delete existing technicians and re-insert

DELETE FROM technicians;

-- Insert technicians (based on user IDs - adjust if your IDs differ)
-- Mike Technician (mike.tech@gearguard.com) -> Mechanical Team
-- Lisa Technician (lisa.tech@gearguard.com) -> Mechanical Team  
-- James Technician (james.tech@gearguard.com) -> HVAC Team
-- John Technician (john@gearguard.com) -> Mechanical Team
-- Mike Electrical (mike@gearguard.com) -> Electrical Team

INSERT INTO technicians (user_id, team_id)
SELECT u.id, mt.id FROM users u, maintenance_teams mt 
WHERE u.email = 'mike.tech@gearguard.com' AND mt.name = 'Mechanical Team'
ON DUPLICATE KEY UPDATE team_id = VALUES(team_id);

INSERT INTO technicians (user_id, team_id)
SELECT u.id, mt.id FROM users u, maintenance_teams mt 
WHERE u.email = 'lisa.tech@gearguard.com' AND mt.name = 'Mechanical Team'
ON DUPLICATE KEY UPDATE team_id = VALUES(team_id);

INSERT INTO technicians (user_id, team_id)
SELECT u.id, mt.id FROM users u, maintenance_teams mt 
WHERE u.email = 'james.tech@gearguard.com' AND mt.name = 'HVAC Team'
ON DUPLICATE KEY UPDATE team_id = VALUES(team_id);

INSERT INTO technicians (user_id, team_id)
SELECT u.id, mt.id FROM users u, maintenance_teams mt 
WHERE u.email = 'john@gearguard.com' AND mt.name = 'Mechanical Team'
ON DUPLICATE KEY UPDATE team_id = VALUES(team_id);

INSERT INTO technicians (user_id, team_id)
SELECT u.id, mt.id FROM users u, maintenance_teams mt 
WHERE u.email = 'mike@gearguard.com' AND mt.name = 'Electrical Team'
ON DUPLICATE KEY UPDATE team_id = VALUES(team_id);

-- ===========================================
-- 6️⃣ EQUIPMENT
-- ===========================================
INSERT INTO equipment (name, serial_number, category_id, purchase_date, warranty_end, location, department_id, team_id, status) VALUES 
-- CNC Machines (Category 1, Team 1 - Mechanical)
('CNC Machine #1', 'CNC-2023-001', 1, '2023-01-15', '2026-01-15', 'Workshop A - Line 1', 1, 1, 'active'),
('CNC Machine #2', 'CNC-2023-002', 1, '2023-02-20', '2026-02-20', 'Workshop A - Line 2', 1, 1, 'active'),
('CNC Machine #3', 'CNC-2023-003', 1, '2023-03-10', '2026-03-10', 'Workshop B - Line 1', 1, 1, 'active'),

-- Hydraulic Systems (Category 2, Team 1 - Mechanical)
('Hydraulic Press #1', 'HYD-2023-001', 2, '2023-04-15', '2026-04-15', 'Production Floor A', 1, 1, 'active'),
('Hydraulic Press #2', 'HYD-2023-002', 2, '2023-05-20', '2026-05-20', 'Production Floor B', 1, 1, 'active'),

-- HVAC Systems (Category 3, Team 3 - HVAC)
('HVAC Unit Main Building', 'HVAC-2022-001', 3, '2022-11-10', '2025-11-10', 'Building A - Rooftop', 2, 3, 'active'),
('HVAC Unit Warehouse', 'HVAC-2023-001', 3, '2023-01-20', '2026-01-20', 'Warehouse - Zone A', 5, 3, 'active'),

-- Electrical Systems (Category 4, Team 2 - Electrical)
('Main Generator', 'GEN-2022-001', 4, '2022-08-05', '2025-08-05', 'Utility Room A', 2, 2, 'active'),
('Backup Generator', 'GEN-2023-001', 4, '2023-07-12', '2026-07-12', 'Utility Room B', 2, 2, 'active'),
('Electrical Panel A', 'EPL-2023-001', 4, '2023-02-28', '2026-02-28', 'Building A - Basement', 2, 2, 'active'),

-- Conveyor Systems (Category 5, Team 1 - Mechanical)
('Conveyor Belt Line 1', 'CVB-2023-001', 5, '2023-03-15', '2025-03-15', 'Factory Floor A', 1, 1, 'active'),
('Conveyor Belt Line 2', 'CVB-2023-002', 5, '2023-08-20', '2025-08-20', 'Warehouse Loading Dock', 5, 1, 'active'),

-- Compressors (Category 6, Team 1 - Mechanical)
('Industrial Compressor #1', 'CMP-2023-001', 6, '2023-06-01', '2026-06-01', 'Utility Room - Workshop', 1, 1, 'active'),

-- Welding Equipment (Category 7, Team 1 - Mechanical)
('Welding Station #1', 'WLD-2023-001', 7, '2023-05-10', '2026-05-10', 'Workshop C', 1, 1, 'active'),
('Welding Station #2', 'WLD-2023-002', 7, '2023-06-15', '2026-06-15', 'Workshop C', 1, 1, 'active'),

-- Forklifts (Category 8, Team 5 - Facilities)
('Forklift #1', 'FLT-2023-001', 8, '2023-02-28', '2026-02-28', 'Warehouse - Zone A', 5, 5, 'active'),
('Forklift #2', 'FLT-2023-002', 8, '2023-03-15', '2026-03-15', 'Warehouse - Zone B', 5, 5, 'active')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ===========================================
-- 7️⃣ MAINTENANCE REQUESTS
-- ===========================================
-- Delete existing requests first to avoid conflicts
DELETE FROM maintenance_logs;
DELETE FROM maintenance_requests;

-- Get technician IDs dynamically
SET @tech_john = (SELECT t.id FROM technicians t INNER JOIN users u ON t.user_id = u.id WHERE u.email = 'john@gearguard.com');
SET @tech_mike_mech = (SELECT t.id FROM technicians t INNER JOIN users u ON t.user_id = u.id WHERE u.email = 'mike.tech@gearguard.com');
SET @tech_lisa = (SELECT t.id FROM technicians t INNER JOIN users u ON t.user_id = u.id WHERE u.email = 'lisa.tech@gearguard.com');
SET @tech_james = (SELECT t.id FROM technicians t INNER JOIN users u ON t.user_id = u.id WHERE u.email = 'james.tech@gearguard.com');
SET @tech_mike_elec = (SELECT t.id FROM technicians t INNER JOIN users u ON t.user_id = u.id WHERE u.email = 'mike@gearguard.com');

-- Get user IDs for created_by
SET @admin_id = (SELECT id FROM users WHERE email = 'admin@gearguard.com');
SET @manager_john = (SELECT id FROM users WHERE email = 'john.manager@gearguard.com');
SET @employee_emily = (SELECT id FROM users WHERE email = 'emily.emp@gearguard.com');

-- Critical Requests (Unassigned - for Team Requests tab)
INSERT INTO maintenance_requests (subject, type, priority, description, equipment_id, department_id, team_id, technician_id, scheduled_date, duration_hours, status, created_by) VALUES 
('URGENT: CNC Machine #1 spindle failure', 'corrective', 'critical', 'Complete spindle failure. Machine producing defective parts. Production line stopped.', 1, 1, 1, NULL, DATE_ADD(NOW(), INTERVAL 1 DAY), 0, 'new', IFNULL(@admin_id, 1)),
('Emergency: Main Generator not starting', 'corrective', 'critical', 'Backup generator failed during power test. No emergency power available.', 8, 2, 2, NULL, NOW(), 0, 'new', IFNULL(@manager_john, 1)),
('HVAC Complete Failure - Main Building', 'corrective', 'critical', 'Air conditioning stopped. Temperature rising. Staff complaining.', 6, 2, 3, NULL, NOW(), 0, 'new', IFNULL(@admin_id, 1));

-- High Priority Requests (Mix of assigned and unassigned)
INSERT INTO maintenance_requests (subject, type, priority, description, equipment_id, department_id, team_id, technician_id, scheduled_date, duration_hours, status, created_by) VALUES 
('Hydraulic Press #1 oil leak', 'corrective', 'high', 'Significant hydraulic oil leak detected under press. Risk of fire.', 4, 1, 1, @tech_john, DATE_ADD(NOW(), INTERVAL 2 DAY), 0, 'new', IFNULL(@employee_emily, 1)),
('CNC Machine #2 overheating', 'corrective', 'high', 'Motor overheating after 2 hours of operation. Auto-shutoff triggered.', 2, 1, 1, @tech_mike_mech, NOW(), 2.5, 'in_progress', IFNULL(@admin_id, 1)),
('Conveyor Belt Line 1 motor issue', 'corrective', 'high', 'Belt slipping and motor making grinding noise.', 11, 1, 1, NULL, DATE_ADD(NOW(), INTERVAL 1 DAY), 0, 'new', IFNULL(@manager_john, 1)),
('Electrical Panel A circuit breaker tripping', 'corrective', 'high', 'Main breaker keeps tripping under load.', 10, 2, 2, @tech_mike_elec, DATE_ADD(NOW(), INTERVAL 1 DAY), 0, 'new', IFNULL(@admin_id, 1));

-- Medium Priority Requests
INSERT INTO maintenance_requests (subject, type, priority, description, equipment_id, department_id, team_id, technician_id, scheduled_date, duration_hours, status, created_by) VALUES 
('Scheduled maintenance - CNC Machine #3', 'preventive', 'medium', 'Monthly preventive maintenance check and calibration.', 3, 1, 1, @tech_lisa, DATE_ADD(NOW(), INTERVAL 5 DAY), 0, 'new', IFNULL(@admin_id, 1)),
('Compressor pressure check', 'preventive', 'medium', 'Quarterly pressure and filter inspection.', 13, 1, 1, NULL, DATE_ADD(NOW(), INTERVAL 3 DAY), 0, 'new', IFNULL(@manager_john, 1)),
('HVAC filter replacement', 'preventive', 'medium', 'Scheduled filter replacement for warehouse unit.', 7, 5, 3, @tech_james, DATE_ADD(NOW(), INTERVAL 4 DAY), 0, 'new', IFNULL(@admin_id, 1)),
('Welding Station #1 electrode replacement', 'corrective', 'medium', 'Electrodes worn. Weld quality degrading.', 14, 1, 1, NULL, DATE_ADD(NOW(), INTERVAL 2 DAY), 0, 'new', IFNULL(@employee_emily, 1)),
('Backup Generator fuel check', 'preventive', 'medium', 'Monthly fuel level and quality check.', 9, 2, 2, NULL, DATE_ADD(NOW(), INTERVAL 7 DAY), 0, 'new', IFNULL(@admin_id, 1));

-- Low Priority Requests
INSERT INTO maintenance_requests (subject, type, priority, description, equipment_id, department_id, team_id, technician_id, scheduled_date, duration_hours, status, created_by) VALUES 
('Hydraulic Press #2 routine inspection', 'preventive', 'low', 'Annual inspection and documentation update.', 5, 1, 1, NULL, DATE_ADD(NOW(), INTERVAL 14 DAY), 0, 'new', IFNULL(@admin_id, 1)),
('Forklift #1 tire inspection', 'preventive', 'low', 'Routine tire wear check.', 16, 5, 5, NULL, DATE_ADD(NOW(), INTERVAL 10 DAY), 0, 'new', IFNULL(@manager_john, 1)),
('Welding Station #2 cable check', 'preventive', 'low', 'Inspect cables for wear and damage.', 15, 1, 1, @tech_john, DATE_ADD(NOW(), INTERVAL 7 DAY), 0, 'new', IFNULL(@employee_emily, 1));

-- Completed/In Progress Requests (for stats)
INSERT INTO maintenance_requests (subject, type, priority, description, equipment_id, department_id, team_id, technician_id, scheduled_date, duration_hours, status, created_by) VALUES 
('CNC Machine #1 lubrication', 'preventive', 'medium', 'Monthly lubrication service completed.', 1, 1, 1, @tech_john, DATE_SUB(NOW(), INTERVAL 2 DAY), 1.5, 'repaired', IFNULL(@admin_id, 1)),
('Conveyor Belt Line 2 alignment', 'corrective', 'high', 'Belt misalignment fixed.', 12, 5, 1, @tech_john, DATE_SUB(NOW(), INTERVAL 3 DAY), 2.0, 'repaired', IFNULL(@manager_john, 1)),
('HVAC Main Building filter change', 'preventive', 'low', 'Filters replaced successfully.', 6, 2, 3, @tech_james, DATE_SUB(NOW(), INTERVAL 5 DAY), 1.0, 'repaired', IFNULL(@admin_id, 1)),
('Main Generator oil change', 'preventive', 'medium', 'Oil changed and filters replaced.', 8, 2, 2, @tech_mike_elec, DATE_SUB(NOW(), INTERVAL 1 DAY), 1.5, 'repaired', IFNULL(@admin_id, 1)),
('Hydraulic Press #1 seal replacement', 'corrective', 'high', 'Currently replacing worn seals.', 4, 1, 1, @tech_mike_mech, NOW(), 0, 'in_progress', IFNULL(@employee_emily, 1));

-- ===========================================
-- 8️⃣ MAINTENANCE LOGS (Activity history)
-- ===========================================
INSERT INTO maintenance_logs (request_id, old_status, new_status, changed_by, notes) 
SELECT 
  (SELECT id FROM maintenance_requests WHERE subject = 'CNC Machine #1 lubrication' LIMIT 1),
  'new', 'in_progress', @tech_john, 'Started maintenance work'
WHERE EXISTS (SELECT 1 FROM maintenance_requests WHERE subject = 'CNC Machine #1 lubrication');

INSERT INTO maintenance_logs (request_id, old_status, new_status, changed_by, notes) 
SELECT 
  (SELECT id FROM maintenance_requests WHERE subject = 'CNC Machine #1 lubrication' LIMIT 1),
  'in_progress', 'repaired', @tech_john, 'Completed lubrication. Machine running smoothly.'
WHERE EXISTS (SELECT 1 FROM maintenance_requests WHERE subject = 'CNC Machine #1 lubrication');

INSERT INTO maintenance_logs (request_id, old_status, new_status, changed_by, notes) 
SELECT 
  (SELECT id FROM maintenance_requests WHERE subject = 'CNC Machine #2 overheating' LIMIT 1),
  'new', 'in_progress', @tech_mike_mech, 'Investigating motor cooling system'
WHERE EXISTS (SELECT 1 FROM maintenance_requests WHERE subject = 'CNC Machine #2 overheating');

-- ===========================================
-- ✅ VERIFICATION QUERIES
-- ===========================================
-- Run these to verify data was inserted correctly:

SELECT '=== TECHNICIANS ===' as '';
SELECT t.id, u.name, u.email, mt.name as team_name, d.name as department 
FROM technicians t 
JOIN users u ON t.user_id = u.id 
JOIN maintenance_teams mt ON t.team_id = mt.id 
JOIN departments d ON mt.department_id = d.id;

SELECT '=== EQUIPMENT COUNT BY TEAM ===' as '';
SELECT mt.name as team, COUNT(*) as equipment_count 
FROM equipment e 
JOIN maintenance_teams mt ON e.team_id = mt.id 
GROUP BY mt.name;

SELECT '=== REQUESTS BY STATUS ===' as '';
SELECT status, COUNT(*) as count FROM maintenance_requests GROUP BY status;

SELECT '=== REQUESTS BY PRIORITY ===' as '';
SELECT priority, COUNT(*) as count FROM maintenance_requests GROUP BY priority;

SELECT 'Dummy data inserted successfully!' as 'STATUS';
