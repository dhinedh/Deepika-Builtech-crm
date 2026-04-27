-- SQL to set up the Deepika Builtech CRM database schema in Supabase
-- Run this in the Supabase SQL Editor

-- 1. Enable any necessary extensions
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create 'leads' table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contactName TEXT,
    companyName TEXT,
    phone TEXT,
    projectType TEXT,
    location TEXT,
    landArea TEXT,
    estimatedBudget NUMERIC,
    timeline TEXT,
    source TEXT,
    assignedTo UUID, -- Link to auth.users if needed
    status TEXT DEFAULT 'New',
    leadScore INTEGER DEFAULT 0,
    notes TEXT,
    last_contacted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create 'followups' table
CREATE TABLE IF NOT EXISTS public.followups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL,
    type TEXT, -- 'Phone Call', 'WhatsApp Message', 'Meeting', etc.
    scheduled_date TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'Pending', -- 'Pending', 'Done', 'Overdue'
    reminder_sent BOOLEAN DEFAULT FALSE,
    notes TEXT,
    assignedTo UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint named 'leads' to allow .select('*, leads(*)')
    CONSTRAINT leads FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE
);

-- 4. Create other tables mentioned in the routes (minimal versions)
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fullName TEXT,
    phone TEXT,
    email TEXT,
    companyId UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    industry TEXT,
    officeAddress TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Set up RLS (Row Level Security) - Optional but recommended
-- For now, we assume the backend uses the Service Role Key which bypasses RLS
-- ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.followups ENABLE ROW LEVEL SECURITY;
-- ... add policies ...

-- 6. Add some sample data for testing the cron jobs
/*
INSERT INTO public.leads (contactName, phone, status, created_at)
VALUES ('Test Lead', '919025840345', 'New', NOW() - INTERVAL '8 days');

INSERT INTO public.followups (lead_id, type, scheduled_date, status)
SELECT id, 'Phone Call', NOW() + INTERVAL '30 minutes', 'Pending'
FROM public.leads LIMIT 1;
*/
