-- Migration to add category column to maintenance_requests table
ALTER TABLE maintenance_requests ADD COLUMN category TEXT DEFAULT 'GENERAL';
