-- Demo Data Generation Script for Rent Management System
-- This script generates 50 entries for each major table using PostgreSQL functions.

BEGIN;

-- Clear existing data and reset identities to ensure IDs start from 1
TRUNCATE properties, tenants, bank_accounts, transaction_categories, invoices, payments, maintenance_requests, employees, payroll_runs, paychecks RESTART IDENTITY CASCADE;

-- 1. Properties
INSERT INTO properties (house_number, address, bedrooms, bathrooms, square_feet, monthly_rent, is_occupied)
SELECT 
    'Unit ' || i, 
    (100 + i) || ' Maple Avenue, Block ' || chr(65 + (i % 5)), 
    (random() * 3 + 1)::int, 
    (random() * 2 + 1)::int, 
    (random() * 800 + 400)::int, 
    (random() * 40000 + 15000)::decimal(10,2),
    true
FROM generate_series(1, 50) i;

-- 2. Bank Accounts
INSERT INTO bank_accounts (account_name, bank_name, account_number, branch_name)
VALUES 
('Main Operating Account', 'KCB Bank', '1102345678', 'Nairobi Main'),
('Security Deposit Fund', 'Equity Bank', '2203456789', 'Westlands'),
('Maintenance Reserve', 'Absa Bank', '3304567890', 'Upper Hill'),
('Payroll Account', 'Standard Chartered', '4405678901', 'Kenyatta Avenue'),
('Emergency Fund', 'Co-operative Bank', '5506789012', 'City Hall');

-- 3. Tenants
-- We'll link them to the 50 properties created above
INSERT INTO tenants (name, property_id, email, phone, lease_start, lease_end, rent_amount, deposit, rent_due_day, is_active)
SELECT 
    'Tenant ' || i,
    i, -- Matches property IDs 1 to 50
    'tenant' || i || '@example.com',
    '+254 7' || floor(random() * 90000000 + 10000000)::text,
    CURRENT_DATE - (random() * 365)::int,
    CURRENT_DATE + (random() * 365)::int,
    p.monthly_rent,
    p.monthly_rent * 2, -- Deposit is usually 2 months rent
    (random() * 5 + 1)::int,
    true
FROM generate_series(1, 50) i
JOIN properties p ON p.id = i;

-- 4. Transaction Categories
INSERT INTO transaction_categories (name, category_type, description, is_tax_deductible)
VALUES 
('Rent Income', 'INCOME', 'Monthly rent payments from tenants', false),
('Security Deposit', 'INCOME', 'Initial deposits from new tenants', false),
('Repair & Maintenance', 'EXPENSE', 'General property repairs', true),
('Utilities', 'EXPENSE', 'Water, electricity, and trash services', true),
('Property Taxes', 'EXPENSE', 'Annual local government taxes', true),
('Insurance', 'EXPENSE', 'Property and liability insurance', true),
('Management Fees', 'EXPENSE', 'Fees paid for property management services', true),
('Salaries', 'EXPENSE', 'Employee wages and benefits', true),
('Office Supplies', 'EXPENSE', 'Stationery and administrative costs', true),
('Marketing', 'EXPENSE', 'Advertising for vacant units', true);

-- 5. Invoices
INSERT INTO invoices (invoice_number, tenant_id, client_name, client_email, issue_date, due_date, status, subtotal, tax_rate, tax_amount, total, amount_paid)
SELECT 
    'INV-' || to_char(CURRENT_DATE, 'YYYYMM') || '-' || lpad(i::text, 4, '0'),
    i,
    t.name,
    t.email,
    CURRENT_DATE - INTERVAL '5 days',
    CURRENT_DATE + INTERVAL '5 days',
    'SENT',
    t.rent_amount,
    16.00,
    t.rent_amount * 0.16,
    t.rent_amount * 1.16,
    0
FROM generate_series(1, 50) i
JOIN tenants t ON t.id = i;

-- 6. Payments
INSERT INTO payments (tenant_id, invoice_id, amount, amount_paid, original_amount, date_due, date_paid, payment_type, payment_method, status)
SELECT 
    i,
    i, -- Matches invoice IDs 1 to 50
    t.rent_amount * 1.16,
    CASE WHEN i % 5 = 0 THEN 0 ELSE t.rent_amount * 1.16 END,
    t.rent_amount * 1.16,
    CURRENT_DATE + INTERVAL '5 days',
    CASE WHEN i % 5 = 0 THEN NULL ELSE CURRENT_DATE END,
    'RENT',
    'MPESA',
    CASE WHEN i % 5 = 0 THEN 'PENDING'::payment_status ELSE 'PAID'::payment_status END
FROM generate_series(1, 50) i
JOIN tenants t ON t.id = i;

-- 7. Maintenance Requests
INSERT INTO maintenance_requests (tenant_id, title, description, priority, category, status, cost, request_date)
SELECT 
    (random() * 49 + 1)::int,
    'Issue ' || i,
    'Description for maintenance issue ' || i || '. Requires attention soon.',
    (array['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'])[floor(random() * 4 + 1)]::maintenance_priority,
    (array['GENERAL', 'PLUMBING', 'ELECTRICAL', 'HVAC', 'APPLIANCE'])[floor(random() * 5 + 1)],
    (array['OPEN', 'IN_PROGRESS', 'COMPLETED'])[floor(random() * 3 + 1)]::maintenance_status,
    (random() * 5000 + 500)::decimal(10,2),
    CURRENT_DATE - (random() * 30)::int
FROM generate_series(1, 50) i;

-- 8. Employees
INSERT INTO employees (first_name, last_name, email, phone, job_title, department, hire_date, base_salary, is_active)
SELECT 
    'First' || i,
    'Last' || i,
    'employee' || i || '@property.com',
    '+254 7' || floor(random() * 90000000 + 10000000)::text,
    (array['Property Manager', 'Caretaker', 'Accountant', 'Security Guard', 'Cleaner'])[floor(random() * 5 + 1)],
    (array['Management', 'Maintenance', 'Finance', 'Security', 'Operations'])[floor(random() * 5 + 1)],
    CURRENT_DATE - (random() * 1000)::int,
    (random() * 100000 + 30000)::decimal(12,2),
    true
FROM generate_series(1, 50) i;

-- 9. Payroll Runs
INSERT INTO payroll_runs (name, period_start, period_end, pay_date, status, total_gross, total_deductions, total_net)
SELECT 
    'Payroll ' || to_char(CURRENT_DATE - (i || ' month')::interval, 'Month YYYY'),
    date_trunc('month', CURRENT_DATE - (i || ' month')::interval),
    (date_trunc('month', CURRENT_DATE - (i || ' month')::interval) + INTERVAL '1 month - 1 day')::date,
    (date_trunc('month', CURRENT_DATE - (i || ' month')::interval) + INTERVAL '1 month - 2 days')::date,
    'PAID',
    0, 0, 0 -- Will be updated if needed, or just dummy
FROM generate_series(0, 5) i;

-- 10. Paychecks
-- Link to the first payroll run for all 50 employees
INSERT INTO paychecks (payroll_run_id, employee_id, gross_pay, paye_tax, nhif_deduction, nssf_deduction, housing_levy, other_deductions, total_deductions, net_pay)
SELECT 
    1, -- Linking to the first payroll run
    i,
    e.base_salary,
    e.base_salary * 0.3,
    1700,
    1080,
    e.base_salary * 0.015,
    0,
    (e.base_salary * 0.3 + 1700 + 1080 + e.base_salary * 0.015),
    e.base_salary - (e.base_salary * 0.3 + 1700 + 1080 + e.base_salary * 0.015)
FROM generate_series(1, 50) i
JOIN employees e ON e.id = i;

COMMIT;
