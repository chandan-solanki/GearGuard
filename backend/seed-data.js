/**
 * Seed Dummy Data Script
 * Run with: node seed-data.js
 */

import mysql from 'mysql2/promise';
import { config } from './config/env.config.js';
import bcrypt from 'bcrypt';

async function seedDatabase() {
  let connection;
  try {
    console.log('🔄 Connecting to database...');
    
    connection = await mysql.createConnection({
      host: config.db.host,
      user: config.db.user,
      password: config.db.password,
      port: config.db.port,
      database: config.db.database,
      multipleStatements: true
    });

    console.log('✅ Connected to database');

    // Generate password hash for 'admin123'
    const passwordHash = await bcrypt.hash('admin123', 10);
    console.log('✅ Password hash generated');

    // ===========================================
    // 1️⃣ DEPARTMENTS
    // ===========================================
    console.log('📁 Inserting departments...');
    await connection.query(`
      INSERT INTO departments (name, description) VALUES 
      ('Production', 'Production and Manufacturing Operations'),
      ('Facilities', 'Building Maintenance and Facilities Management'),
      ('IT Department', 'Information Technology and Systems'),
      ('Quality Control', 'Quality Assurance and Testing'),
      ('Warehouse', 'Storage and Logistics Operations')
      ON DUPLICATE KEY UPDATE description = VALUES(description)
    `);

    // ===========================================
    // 2️⃣ MAINTENANCE TEAMS
    // ===========================================
    console.log('👥 Inserting maintenance teams...');
    
    // Get department IDs
    const [depts] = await connection.query('SELECT id, name FROM departments');
    const deptMap = {};
    depts.forEach(d => deptMap[d.name] = d.id);

    await connection.query(`
      INSERT INTO maintenance_teams (name, department_id) VALUES 
      ('Mechanical Team', ?),
      ('Electrical Team', ?),
      ('HVAC Team', ?),
      ('IT Support Team', ?),
      ('Facilities Team', ?)
      ON DUPLICATE KEY UPDATE name = VALUES(name)
    `, [
      deptMap['Production'] || 1,
      deptMap['Production'] || 1,
      deptMap['Facilities'] || 2,
      deptMap['IT Department'] || 3,
      deptMap['Facilities'] || 2
    ]);

    // ===========================================
    // 3️⃣ USERS
    // ===========================================
    console.log('👤 Inserting users...');
    
    const users = [
      ['Admin User', 'admin@gearguard.com', 'admin'],
      ['John Manager', 'john.manager@gearguard.com', 'manager'],
      ['Sarah Manager', 'sarah.manager@gearguard.com', 'manager'],
      ['Mike Technician', 'mike.tech@gearguard.com', 'technician'],
      ['Lisa Technician', 'lisa.tech@gearguard.com', 'technician'],
      ['James Technician', 'james.tech@gearguard.com', 'technician'],
      ['Emily Employee', 'emily.emp@gearguard.com', 'employee'],
      ['David Employee', 'david.emp@gearguard.com', 'employee'],
      ['John Technician', 'john@gearguard.com', 'technician'],
      ['Mike Electrical', 'mike@gearguard.com', 'technician']
    ];

    for (const [name, email, role] of users) {
      await connection.query(`
        INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role)
      `, [name, email, passwordHash, role]);
    }

    // ===========================================
    // 4️⃣ EQUIPMENT CATEGORIES
    // ===========================================
    console.log('📦 Inserting equipment categories...');
    await connection.query(`
      INSERT INTO equipment_category (name, responsible, company_name, description) VALUES 
      ('CNC Machines', 'Sarah Johnson', 'PrecisionCorp', 'Computer Numerical Control machines'),
      ('Hydraulic Systems', 'John Smith', 'HydroTech Industries', 'Hydraulic press machines'),
      ('HVAC Systems', 'Mike Davis', 'ClimateControl Ltd', 'Heating and cooling systems'),
      ('Electrical Systems', 'Emily Brown', 'PowerGen Solutions', 'Electrical equipment'),
      ('Conveyor Systems', 'David Wilson', 'TransportTech', 'Conveyor belts'),
      ('Compressors', 'Linda Martinez', 'AirTech Systems', 'Industrial compressors'),
      ('Welding Equipment', 'Chris Anderson', 'WeldPro Equipment', 'Welding machines'),
      ('Forklifts', 'Robert Garcia', 'LiftMaster Inc', 'Material handling')
      ON DUPLICATE KEY UPDATE description = VALUES(description)
    `);

    // ===========================================
    // 5️⃣ TECHNICIANS
    // ===========================================
    console.log('🔧 Inserting technicians...');
    
    // Get team IDs
    const [teams] = await connection.query('SELECT id, name FROM maintenance_teams');
    const teamMap = {};
    teams.forEach(t => teamMap[t.name] = t.id);

    // Get user IDs for technicians
    const [userRows] = await connection.query(`
      SELECT id, email FROM users WHERE role = 'technician'
    `);
    const userMap = {};
    userRows.forEach(u => userMap[u.email] = u.id);

    // Clear existing technicians
    await connection.query('DELETE FROM technicians');

    // Insert technicians
    const techAssignments = [
      ['mike.tech@gearguard.com', 'Mechanical Team'],
      ['lisa.tech@gearguard.com', 'Mechanical Team'],
      ['james.tech@gearguard.com', 'HVAC Team'],
      ['john@gearguard.com', 'Mechanical Team'],
      ['mike@gearguard.com', 'Electrical Team']
    ];

    for (const [email, teamName] of techAssignments) {
      const userId = userMap[email];
      const teamId = teamMap[teamName];
      if (userId && teamId) {
        await connection.query(`
          INSERT INTO technicians (user_id, team_id) VALUES (?, ?)
          ON DUPLICATE KEY UPDATE team_id = VALUES(team_id)
        `, [userId, teamId]);
      }
    }

    // ===========================================
    // 6️⃣ EQUIPMENT
    // ===========================================
    console.log('🏭 Inserting equipment...');
    
    // Get category IDs
    const [cats] = await connection.query('SELECT id, name FROM equipment_category');
    const catMap = {};
    cats.forEach(c => catMap[c.name] = c.id);

    const equipment = [
      ['CNC Machine #1', 'CNC-2023-001', 'CNC Machines', 'Workshop A', 'Production', 'Mechanical Team'],
      ['CNC Machine #2', 'CNC-2023-002', 'CNC Machines', 'Workshop A', 'Production', 'Mechanical Team'],
      ['CNC Machine #3', 'CNC-2023-003', 'CNC Machines', 'Workshop B', 'Production', 'Mechanical Team'],
      ['Hydraulic Press #1', 'HYD-2023-001', 'Hydraulic Systems', 'Production Floor A', 'Production', 'Mechanical Team'],
      ['Hydraulic Press #2', 'HYD-2023-002', 'Hydraulic Systems', 'Production Floor B', 'Production', 'Mechanical Team'],
      ['HVAC Unit Main', 'HVAC-2022-001', 'HVAC Systems', 'Building A Rooftop', 'Facilities', 'HVAC Team'],
      ['HVAC Unit Warehouse', 'HVAC-2023-001', 'HVAC Systems', 'Warehouse Zone A', 'Warehouse', 'HVAC Team'],
      ['Main Generator', 'GEN-2022-001', 'Electrical Systems', 'Utility Room A', 'Facilities', 'Electrical Team'],
      ['Backup Generator', 'GEN-2023-001', 'Electrical Systems', 'Utility Room B', 'Facilities', 'Electrical Team'],
      ['Electrical Panel A', 'EPL-2023-001', 'Electrical Systems', 'Building Basement', 'Facilities', 'Electrical Team'],
      ['Conveyor Line 1', 'CVB-2023-001', 'Conveyor Systems', 'Factory Floor A', 'Production', 'Mechanical Team'],
      ['Conveyor Line 2', 'CVB-2023-002', 'Conveyor Systems', 'Warehouse Dock', 'Warehouse', 'Mechanical Team'],
      ['Industrial Compressor', 'CMP-2023-001', 'Compressors', 'Utility Workshop', 'Production', 'Mechanical Team'],
      ['Welding Station #1', 'WLD-2023-001', 'Welding Equipment', 'Workshop C', 'Production', 'Mechanical Team'],
      ['Welding Station #2', 'WLD-2023-002', 'Welding Equipment', 'Workshop C', 'Production', 'Mechanical Team'],
      ['Forklift #1', 'FLT-2023-001', 'Forklifts', 'Warehouse Zone A', 'Warehouse', 'Facilities Team'],
      ['Forklift #2', 'FLT-2023-002', 'Forklifts', 'Warehouse Zone B', 'Warehouse', 'Facilities Team']
    ];

    for (const [name, serial, category, location, dept, team] of equipment) {
      await connection.query(`
        INSERT INTO equipment (name, serial_number, category_id, purchase_date, warranty_end, location, department_id, team_id, status)
        VALUES (?, ?, ?, '2023-01-15', '2026-01-15', ?, ?, ?, 'active')
        ON DUPLICATE KEY UPDATE name = VALUES(name)
      `, [name, serial, catMap[category], location, deptMap[dept], teamMap[team]]);
    }

    // ===========================================
    // 7️⃣ MAINTENANCE REQUESTS
    // ===========================================
    console.log('📋 Inserting maintenance requests...');
    
    // Clear existing requests
    await connection.query('DELETE FROM maintenance_logs');
    await connection.query('DELETE FROM maintenance_requests');

    // Get technician IDs
    const [techRows] = await connection.query(`
      SELECT t.id, u.email FROM technicians t 
      JOIN users u ON t.user_id = u.id
    `);
    const techMap = {};
    techRows.forEach(t => techMap[t.email] = t.id);

    // Get equipment IDs
    const [equipRows] = await connection.query('SELECT id, name FROM equipment');
    const equipMap = {};
    equipRows.forEach(e => equipMap[e.name] = e.id);

    // Get admin user ID
    const [[adminUser]] = await connection.query(`SELECT id FROM users WHERE email = 'admin@gearguard.com'`);
    const adminId = adminUser?.id || 1;

    // Critical Requests (Unassigned)
    const criticalRequests = [
      ['URGENT: CNC Machine #1 spindle failure', 'corrective', 'critical', 'Complete spindle failure. Production stopped.', 'CNC Machine #1', 'Production', 'Mechanical Team', null],
      ['Emergency: Main Generator not starting', 'corrective', 'critical', 'Backup power unavailable.', 'Main Generator', 'Facilities', 'Electrical Team', null],
      ['HVAC Complete Failure', 'corrective', 'critical', 'No cooling in main building.', 'HVAC Unit Main', 'Facilities', 'HVAC Team', null]
    ];

    for (const [subject, type, priority, desc, equip, dept, team, tech] of criticalRequests) {
      await connection.query(`
        INSERT INTO maintenance_requests (subject, type, priority, description, equipment_id, department_id, team_id, technician_id, scheduled_date, status, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 1 DAY), 'new', ?)
      `, [subject, type, priority, desc, equipMap[equip], deptMap[dept], teamMap[team], tech ? techMap[tech] : null, adminId]);
    }

    // High Priority (Mix)
    const highRequests = [
      ['Hydraulic Press #1 oil leak', 'corrective', 'high', 'Oil leak detected. Fire risk.', 'Hydraulic Press #1', 'Production', 'Mechanical Team', 'john@gearguard.com'],
      ['CNC Machine #2 overheating', 'corrective', 'high', 'Motor overheating after 2 hours.', 'CNC Machine #2', 'Production', 'Mechanical Team', 'mike.tech@gearguard.com'],
      ['Conveyor belt slipping', 'corrective', 'high', 'Belt slipping and grinding noise.', 'Conveyor Line 1', 'Production', 'Mechanical Team', null],
      ['Circuit breaker tripping', 'corrective', 'high', 'Main breaker keeps tripping.', 'Electrical Panel A', 'Facilities', 'Electrical Team', 'mike@gearguard.com']
    ];

    for (const [subject, type, priority, desc, equip, dept, team, tech] of highRequests) {
      await connection.query(`
        INSERT INTO maintenance_requests (subject, type, priority, description, equipment_id, department_id, team_id, technician_id, scheduled_date, status, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 2 DAY), 'new', ?)
      `, [subject, type, priority, desc, equipMap[equip], deptMap[dept], teamMap[team], tech ? techMap[tech] : null, adminId]);
    }

    // Medium Priority
    const mediumRequests = [
      ['Scheduled CNC #3 maintenance', 'preventive', 'medium', 'Monthly calibration.', 'CNC Machine #3', 'Production', 'Mechanical Team', 'lisa.tech@gearguard.com'],
      ['Compressor pressure check', 'preventive', 'medium', 'Quarterly inspection.', 'Industrial Compressor', 'Production', 'Mechanical Team', null],
      ['HVAC filter replacement', 'preventive', 'medium', 'Filter change needed.', 'HVAC Unit Warehouse', 'Warehouse', 'HVAC Team', 'james.tech@gearguard.com'],
      ['Welding electrode replacement', 'corrective', 'medium', 'Electrodes worn.', 'Welding Station #1', 'Production', 'Mechanical Team', null]
    ];

    for (const [subject, type, priority, desc, equip, dept, team, tech] of mediumRequests) {
      await connection.query(`
        INSERT INTO maintenance_requests (subject, type, priority, description, equipment_id, department_id, team_id, technician_id, scheduled_date, status, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 5 DAY), 'new', ?)
      `, [subject, type, priority, desc, equipMap[equip], deptMap[dept], teamMap[team], tech ? techMap[tech] : null, adminId]);
    }

    // Low Priority
    const lowRequests = [
      ['Hydraulic Press #2 inspection', 'preventive', 'low', 'Annual inspection.', 'Hydraulic Press #2', 'Production', 'Mechanical Team', null],
      ['Forklift tire check', 'preventive', 'low', 'Tire wear inspection.', 'Forklift #1', 'Warehouse', 'Facilities Team', null],
      ['Welding cable check', 'preventive', 'low', 'Inspect cables.', 'Welding Station #2', 'Production', 'Mechanical Team', 'john@gearguard.com']
    ];

    for (const [subject, type, priority, desc, equip, dept, team, tech] of lowRequests) {
      await connection.query(`
        INSERT INTO maintenance_requests (subject, type, priority, description, equipment_id, department_id, team_id, technician_id, scheduled_date, status, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 14 DAY), 'new', ?)
      `, [subject, type, priority, desc, equipMap[equip], deptMap[dept], teamMap[team], tech ? techMap[tech] : null, adminId]);
    }

    // Completed/In Progress Requests
    const completedRequests = [
      ['CNC Machine #1 lubrication', 'preventive', 'medium', 'Completed lubrication.', 'CNC Machine #1', 'Production', 'Mechanical Team', 'john@gearguard.com', 'repaired', 1.5],
      ['Conveyor alignment fix', 'corrective', 'high', 'Belt realigned.', 'Conveyor Line 2', 'Warehouse', 'Mechanical Team', 'john@gearguard.com', 'repaired', 2.0],
      ['Generator oil change', 'preventive', 'medium', 'Oil changed.', 'Main Generator', 'Facilities', 'Electrical Team', 'mike@gearguard.com', 'repaired', 1.5],
      ['Hydraulic seal work', 'corrective', 'high', 'Replacing seals.', 'Hydraulic Press #1', 'Production', 'Mechanical Team', 'mike.tech@gearguard.com', 'in_progress', 0]
    ];

    for (const [subject, type, priority, desc, equip, dept, team, tech, status, hours] of completedRequests) {
      await connection.query(`
        INSERT INTO maintenance_requests (subject, type, priority, description, equipment_id, department_id, team_id, technician_id, scheduled_date, duration_hours, status, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL 2 DAY), ?, ?, ?)
      `, [subject, type, priority, desc, equipMap[equip], deptMap[dept], teamMap[team], techMap[tech], hours, status, adminId]);
    }

    console.log('');
    console.log('✅ ============================================');
    console.log('✅ DUMMY DATA INSERTED SUCCESSFULLY!');
    console.log('✅ ============================================');
    console.log('');
    console.log('📧 TEST ACCOUNTS (password: admin123):');
    console.log('   - admin@gearguard.com (Admin)');
    console.log('   - john.manager@gearguard.com (Manager)');
    console.log('   - john@gearguard.com (Technician - Mechanical Team)');
    console.log('   - mike@gearguard.com (Technician - Electrical Team)');
    console.log('   - mike.tech@gearguard.com (Technician - Mechanical Team)');
    console.log('   - lisa.tech@gearguard.com (Technician - Mechanical Team)');
    console.log('   - james.tech@gearguard.com (Technician - HVAC Team)');
    console.log('   - emily.emp@gearguard.com (Employee)');
    console.log('');

    // Print summary
    const [[techCount]] = await connection.query('SELECT COUNT(*) as count FROM technicians');
    const [[reqCount]] = await connection.query('SELECT COUNT(*) as count FROM maintenance_requests');
    const [[equipCount]] = await connection.query('SELECT COUNT(*) as count FROM equipment');

    console.log('📊 DATA SUMMARY:');
    console.log(`   - Technicians: ${techCount.count}`);
    console.log(`   - Equipment: ${equipCount.count}`);
    console.log(`   - Maintenance Requests: ${reqCount.count}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedDatabase().catch(console.error);
