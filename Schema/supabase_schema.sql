-- Supabase Schema for Rent Management System

-- 1. ENUMS
CREATE TYPE app_role AS ENUM ('ADMIN', 'MANAGER', 'TENANT');
CREATE TYPE payment_type AS ENUM ('RENT', 'DEPOSIT', 'FEE', 'OTHER');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'LATE', 'PREPAID', 'FAILED', 'SEVERE', 'DEFAULTED');
CREATE TYPE payment_method AS ENUM ('MPESA', 'CASH', 'BANK', 'CHEQUE', 'OTHER');
CREATE TYPE maintenance_status AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE maintenance_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY');
CREATE TYPE invoice_status AS ENUM ('DRAFT', 'SENT', 'VIEWED', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED');
CREATE TYPE transaction_type AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER');
CREATE TYPE transaction_status AS ENUM ('PENDING', 'CLEARED', 'RECONCILED', 'VOID');
CREATE TYPE audience_type AS ENUM ('ALL_TENANTS', 'BUILDING_TENANTS', 'ALL_EMPLOYEES');
CREATE TYPE message_priority AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
CREATE TYPE whatsapp_status AS ENUM ('PENDING', 'SENT', 'FAILED');

-- 2. TABLES

-- Profiles (links to auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role app_role NOT NULL DEFAULT 'TENANT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Properties
CREATE TABLE properties (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    house_number TEXT NOT NULL,
    address TEXT NOT NULL,
    bedrooms INTEGER NOT NULL DEFAULT 1,
    bathrooms INTEGER NOT NULL DEFAULT 1,
    square_feet INTEGER,
    monthly_rent DECIMAL(10,2) NOT NULL,
    is_occupied BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tenants
CREATE TABLE tenants (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    property_id BIGINT REFERENCES properties(id),
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    lease_start DATE NOT NULL,
    lease_end DATE NOT NULL,
    rent_amount DECIMAL(10,2) NOT NULL,
    deposit DECIMAL(10,2) NOT NULL DEFAULT 0,
    rent_due_day INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    profile_id UUID REFERENCES profiles(id), -- Link to Auth profile
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bank Accounts
CREATE TABLE bank_accounts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    account_name TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    branch_name TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices
CREATE TABLE invoices (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    invoice_number TEXT UNIQUE NOT NULL,
    tenant_id BIGINT REFERENCES tenants(id),
    client_name TEXT,
    client_email TEXT,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status invoice_status NOT NULL DEFAULT 'DRAFT',
    subtotal DECIMAL(14,2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
    total DECIMAL(14,2) NOT NULL DEFAULT 0,
    amount_paid DECIMAL(14,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id),
    invoice_id BIGINT REFERENCES invoices(id),
    amount DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0,
    original_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    date_due DATE NOT NULL,
    date_paid DATE,
    payment_type payment_type NOT NULL DEFAULT 'RENT',
    payment_method payment_method NOT NULL DEFAULT 'CASH',
    status payment_status NOT NULL DEFAULT 'PENDING',
    transaction_id TEXT,
    notes TEXT,
    utilization_data JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance Requests
CREATE TABLE maintenance_requests (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority maintenance_priority NOT NULL DEFAULT 'MEDIUM',
    category TEXT NOT NULL DEFAULT 'GENERAL',
    status maintenance_status NOT NULL DEFAULT 'OPEN',
    cost DECIMAL(10,2),
    request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_date TIMESTAMP WITH TIME ZONE
);

-- Transaction Categories
CREATE TABLE transaction_categories (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    category_type transaction_type NOT NULL, -- INCOME or EXPENSE
    description TEXT,
    is_tax_deductible BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial Transactions
CREATE TABLE fin_transactions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    bank_account_id BIGINT REFERENCES bank_accounts(id),
    category_id BIGINT REFERENCES transaction_categories(id),
    transaction_type transaction_type NOT NULL,
    amount DECIMAL(14,2) NOT NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    reference TEXT,
    payee TEXT,
    status transaction_status NOT NULL DEFAULT 'CLEARED',
    is_auto_categorized BOOLEAN NOT NULL DEFAULT FALSE,
    linked_payment_id BIGINT REFERENCES payments(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employees
CREATE TABLE employees (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    id_number TEXT,
    kra_pin TEXT,
    job_title TEXT NOT NULL,
    department TEXT,
    hire_date DATE NOT NULL,
    termination_date DATE,
    base_salary DECIMAL(12,2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    profile_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payroll Runs
CREATE TABLE payroll_runs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    pay_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT', -- DRAFT, PROCESSING, APPROVED, PAID, CANCELLED
    total_gross DECIMAL(14,2) NOT NULL DEFAULT 0,
    total_deductions DECIMAL(14,2) NOT NULL DEFAULT 0,
    total_net DECIMAL(14,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Paychecks
CREATE TABLE paychecks (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    payroll_run_id BIGINT NOT NULL REFERENCES payroll_runs(id),
    employee_id BIGINT NOT NULL REFERENCES employees(id),
    gross_pay DECIMAL(12,2) NOT NULL,
    paye_tax DECIMAL(12,2) NOT NULL DEFAULT 0,
    nhif_deduction DECIMAL(12,2) NOT NULL DEFAULT 0,
    nssf_deduction DECIMAL(12,2) NOT NULL DEFAULT 0,
    housing_levy DECIMAL(12,2) NOT NULL DEFAULT 0,
    other_deductions DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_deductions DECIMAL(12,2) NOT NULL DEFAULT 0,
    net_pay DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(payroll_run_id, employee_id)
);

-- Broadcast Messages
CREATE TABLE broadcast_messages (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    audience audience_type NOT NULL,
    building_address TEXT,
    priority message_priority NOT NULL DEFAULT 'NORMAL',
    is_sent BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message Recipients
CREATE TABLE message_recipients (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    message_id BIGINT NOT NULL REFERENCES broadcast_messages(id),
    recipient_type TEXT NOT NULL, -- TENANT, EMPLOYEE
    tenant_id BIGINT REFERENCES tenants(id),
    employee_id BIGINT REFERENCES employees(id),
    whatsapp_status whatsapp_status NOT NULL DEFAULT 'PENDING',
    whatsapp_sent_at TIMESTAMP WITH TIME ZONE,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice Items
CREATE TABLE invoice_items (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    invoice_id BIGINT NOT NULL REFERENCES invoices(id),
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(14,2) NOT NULL,
    total DECIMAL(14,2) NOT NULL
);

-- 3. RLS POLICIES

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE fin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE paychecks ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is Admin/Manager
CREATE OR REPLACE FUNCTION is_staff() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role IN ('ADMIN', 'MANAGER') 
    FROM profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Staff Policies (Full access to everything)
CREATE POLICY "Staff can do everything" ON properties FOR ALL USING (is_staff());
CREATE POLICY "Staff can do everything" ON tenants FOR ALL USING (is_staff());
CREATE POLICY "Staff can do everything" ON bank_accounts FOR ALL USING (is_staff());
CREATE POLICY "Staff can do everything" ON invoices FOR ALL USING (is_staff());
CREATE POLICY "Staff can do everything" ON payments FOR ALL USING (is_staff());
CREATE POLICY "Staff can do everything" ON maintenance_requests FOR ALL USING (is_staff());
CREATE POLICY "Staff can do everything" ON transaction_categories FOR ALL USING (is_staff());
CREATE POLICY "Staff can do everything" ON fin_transactions FOR ALL USING (is_staff());
CREATE POLICY "Staff can do everything" ON employees FOR ALL USING (is_staff());
CREATE POLICY "Staff can do everything" ON payroll_runs FOR ALL USING (is_staff());
CREATE POLICY "Staff can do everything" ON paychecks FOR ALL USING (is_staff());
CREATE POLICY "Staff can do everything" ON broadcast_messages FOR ALL USING (is_staff());
CREATE POLICY "Staff can do everything" ON message_recipients FOR ALL USING (is_staff());
CREATE POLICY "Staff can do everything" ON invoice_items FOR ALL USING (is_staff());

-- Tenant Policies
CREATE POLICY "Tenants can view own data" ON tenants FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Tenants can view own property" ON properties FOR SELECT 
USING (id IN (SELECT property_id FROM tenants WHERE profile_id = auth.uid()));
CREATE POLICY "Tenants can view own invoices" ON invoices FOR SELECT 
USING (tenant_id IN (SELECT id FROM tenants WHERE profile_id = auth.uid()));
CREATE POLICY "Tenants can view own payments" ON payments FOR SELECT 
USING (tenant_id IN (SELECT id FROM tenants WHERE profile_id = auth.uid()));
CREATE POLICY "Tenants can view own maintenance" ON maintenance_requests FOR SELECT 
USING (tenant_id IN (SELECT id FROM tenants WHERE profile_id = auth.uid()));
CREATE POLICY "Tenants can create maintenance" ON maintenance_requests FOR INSERT 
WITH CHECK (tenant_id IN (SELECT id FROM tenants WHERE profile_id = auth.uid()));

-- 4. TRIGGERS FOR updated_at

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_maintenance_requests_updated_at BEFORE UPDATE ON maintenance_requests FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_fin_transactions_updated_at BEFORE UPDATE ON fin_transactions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_payroll_runs_updated_at BEFORE UPDATE ON payroll_runs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
