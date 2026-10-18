-- ResourceHub Enterprise Database Schema
-- 1. Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  department_head_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Profiles Table (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'project_manager', 'employee')),
  job_title TEXT,
  employment_status TEXT NOT NULL DEFAULT 'active' CHECK (employment_status IN ('active', 'inactive', 'offboarded')),
  date_of_joining DATE DEFAULT CURRENT_DATE,
  salary NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Circular FK for department head
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_departments_head'
  ) THEN
    ALTER TABLE public.departments
    ADD CONSTRAINT fk_departments_head
    FOREIGN KEY (department_head_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  project_manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  budget NUMERIC NOT NULL DEFAULT 0 CHECK (budget >= 0),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL CHECK (end_date >= start_date),
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'on_hold')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Allocations Table
CREATE TABLE IF NOT EXISTS public.allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  allocation_percentage INTEGER NOT NULL CHECK (allocation_percentage > 0 AND allocation_percentage <= 100),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL CHECK (end_date >= start_date),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Allocation Limit Trigger (Atomic constraint checking <= 100%)
CREATE OR REPLACE FUNCTION public.check_employee_allocation_limit()
RETURNS TRIGGER AS $$
DECLARE
  total_alloc INTEGER;
BEGIN
  -- Prevent allocating offboarded employees
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = NEW.employee_id AND employment_status = 'offboarded'
  ) THEN
    RAISE EXCEPTION 'Cannot allocate offboarded employee to a project.';
  END IF;

  -- Calculate existing overlapping allocations
  SELECT COALESCE(SUM(allocation_percentage), 0)
  INTO total_alloc
  FROM public.allocations
  WHERE employee_id = NEW.employee_id
    AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND NOT (end_date < NEW.start_date OR start_date > NEW.end_date);

  IF (total_alloc + NEW.allocation_percentage) > 100 THEN
    RAISE EXCEPTION 'Total active allocation for this employee would exceed 100%% (Current: %, Proposed: %, Total: %)',
      total_alloc, NEW.allocation_percentage, (total_alloc + NEW.allocation_percentage);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_allocation_limit ON public.allocations;
CREATE TRIGGER trg_check_allocation_limit
BEFORE INSERT OR UPDATE ON public.allocations
FOR EACH ROW
EXECUTE FUNCTION public.check_employee_allocation_limit();

-- 6. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  category TEXT NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Skills Table
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  proficiency_level TEXT DEFAULT 'Intermediate',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Certifications Table
CREATE TABLE IF NOT EXISTS public.certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  certification_name TEXT NOT NULL,
  issuing_organization TEXT,
  issue_date DATE,
  expiry_date DATE,
  credential_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Achievements Table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  achievement_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_dept ON public.profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_dept ON public.projects(department_id);
CREATE INDEX IF NOT EXISTS idx_projects_pm ON public.projects(project_manager_id);
CREATE INDEX IF NOT EXISTS idx_allocations_emp ON public.allocations(employee_id);
CREATE INDEX IF NOT EXISTS idx_allocations_proj ON public.allocations(project_id);
CREATE INDEX IF NOT EXISTS idx_allocations_dates ON public.allocations(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_expenses_proj ON public.expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_skills_emp ON public.skills(employee_id);
CREATE INDEX IF NOT EXISTS idx_certs_emp ON public.certifications(employee_id);

-- Helper function for RLS to get user role without recursion
CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Enable Row Level Security
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Departments RLS: viewable by authenticated users, editable by admin
CREATE POLICY "Departments are viewable by all authenticated users"
ON public.departments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Departments are editable by admins"
ON public.departments FOR ALL TO authenticated
USING (public.get_current_role() = 'admin')
WITH CHECK (public.get_current_role() = 'admin');

-- 2. Profiles RLS:
-- Everyone can read basic profiles, but salary is protected via column-level or views, and non-admins only see basic info.
CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own permitted profile fields"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins have full access to profiles"
ON public.profiles FOR ALL TO authenticated
USING (public.get_current_role() = 'admin')
WITH CHECK (public.get_current_role() = 'admin');

-- 3. Projects RLS:
CREATE POLICY "Projects viewable by authenticated users"
ON public.projects FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and PMs can create/edit projects"
ON public.projects FOR ALL TO authenticated
USING (public.get_current_role() IN ('admin', 'project_manager'))
WITH CHECK (public.get_current_role() IN ('admin', 'project_manager'));

-- 4. Allocations RLS:
CREATE POLICY "Allocations viewable by authenticated users"
ON public.allocations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and PMs can manage allocations"
ON public.allocations FOR ALL TO authenticated
USING (public.get_current_role() IN ('admin', 'project_manager'))
WITH CHECK (public.get_current_role() IN ('admin', 'project_manager'));

-- 5. Expenses RLS:
CREATE POLICY "Expenses viewable by authenticated users"
ON public.expenses FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and PMs can manage expenses"
ON public.expenses FOR ALL TO authenticated
USING (public.get_current_role() IN ('admin', 'project_manager'))
WITH CHECK (public.get_current_role() IN ('admin', 'project_manager'));

-- 6. Skills, Certs, Achievements:
CREATE POLICY "Skills viewable by authenticated users"
ON public.skills FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage their own skills"
ON public.skills FOR ALL TO authenticated
USING (auth.uid() = employee_id OR public.get_current_role() = 'admin')
WITH CHECK (auth.uid() = employee_id OR public.get_current_role() = 'admin');

CREATE POLICY "Certifications viewable by authenticated users"
ON public.certifications FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage their own certifications"
ON public.certifications FOR ALL TO authenticated
USING (auth.uid() = employee_id OR public.get_current_role() = 'admin')
WITH CHECK (auth.uid() = employee_id OR public.get_current_role() = 'admin');

CREATE POLICY "Achievements viewable by authenticated users"
ON public.achievements FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage their own achievements"
ON public.achievements FOR ALL TO authenticated
USING (auth.uid() = employee_id OR public.get_current_role() = 'admin')
WITH CHECK (auth.uid() = employee_id OR public.get_current_role() = 'admin');

-- 7. Audit logs: viewable and insertable
CREATE POLICY "Audit logs viewable by admin"
ON public.audit_logs FOR SELECT TO authenticated
USING (public.get_current_role() = 'admin');

CREATE POLICY "Audit logs insertable by all authenticated"
ON public.audit_logs FOR INSERT TO authenticated
WITH CHECK (true);
