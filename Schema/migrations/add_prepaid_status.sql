-- Run this migration in the Supabase SQL Editor to add the PREPAID status
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'PREPAID' AFTER 'LATE';
