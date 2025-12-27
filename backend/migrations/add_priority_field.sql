-- Migration: Add priority field to maintenance_requests table
-- Date: December 27, 2025
-- Description: Adds priority enum field with values (low, medium, high, critical)

USE gearguard_db;

-- Add priority column with default value 'medium'
ALTER TABLE maintenance_requests 
ADD COLUMN priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium' 
AFTER type;

-- Add index for priority field for better query performance
ALTER TABLE maintenance_requests 
ADD INDEX idx_request_priority (priority);

-- Verify the changes
DESCRIBE maintenance_requests;

-- Optional: Update existing records based on business logic
-- Example: Set corrective requests as 'high' priority by default
-- UPDATE maintenance_requests SET priority = 'high' WHERE type = 'corrective' AND priority = 'medium';

-- Example: Set overdue requests as 'critical'
-- UPDATE maintenance_requests 
-- SET priority = 'critical' 
-- WHERE scheduled_date < NOW() AND status NOT IN ('repaired', 'scrap') AND priority != 'critical';

SELECT 'Migration completed successfully!' as message;
