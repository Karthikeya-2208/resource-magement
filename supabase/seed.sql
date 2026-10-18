-- ResourceHub Enterprise Database Seed Script

-- 1. Demo Auth Users
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous
) VALUES
(
  '11111111-1111-1111-1111-111111111111'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated', 'authenticated', 'admin@demo.com',
  extensions.crypt('Password123!', extensions.gen_salt('bf')),
  now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Admin Administrator"}'::jsonb, now(), now(), false, false
),
(
  '22222222-2222-2222-2222-222222222222'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated', 'authenticated', 'manager@demo.com',
  extensions.crypt('Password123!', extensions.gen_salt('bf')),
  now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"John Smith"}'::jsonb, now(), now(), false, false
),
(
  '33333333-3333-3333-3333-333333333333'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated', 'authenticated', 'employee@demo.com',
  extensions.crypt('Password123!', extensions.gen_salt('bf')),
  now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Jane Smith"}'::jsonb, now(), now(), false, false
),
(
  '44444444-4444-4444-4444-444444444444'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated', 'authenticated', 'michael@company.com',
  extensions.crypt('Password123!', extensions.gen_salt('bf')),
  now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Michael Brown"}'::jsonb, now(), now(), false, false
),
(
  '55555555-5555-5555-5555-555555555555'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated', 'authenticated', 'sarah@company.com',
  extensions.crypt('Password123!', extensions.gen_salt('bf')),
  now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Sarah Wilson"}'::jsonb, now(), now(), false, false
),
(
  '66666666-6666-6666-6666-666666666666'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated', 'authenticated', 'david@company.com',
  extensions.crypt('Password123!', extensions.gen_salt('bf')),
  now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"David Lee"}'::jsonb, now(), now(), false, false
),
(
  '77777777-7777-7777-7777-777777777777'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated', 'authenticated', 'priya@company.com',
  extensions.crypt('Password123!', extensions.gen_salt('bf')),
  now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Priya Kumar"}'::jsonb, now(), now(), false, false
),
(
  '88888888-8888-8888-8888-888888888888'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated', 'authenticated', 'alex@company.com',
  extensions.crypt('Password123!', extensions.gen_salt('bf')),
  now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Alex Johnson"}'::jsonb, now(), now(), false, false
)
ON CONFLICT (id) DO NOTHING;

-- 2. Departments
INSERT INTO public.departments (id, name, description) VALUES
('a0000000-0000-0000-0000-000000000001'::uuid, 'Engineering', 'Product development and R&D'),
('a0000000-0000-0000-0000-000000000002'::uuid, 'Data & AI', 'Data science and AI initiatives'),
('a0000000-0000-0000-0000-000000000003'::uuid, 'Operations', 'Business operations and logistics'),
('a0000000-0000-0000-0000-000000000004'::uuid, 'HR', 'Human resources and talent acquisition'),
('a0000000-0000-0000-0000-000000000005'::uuid, 'Finance', 'Financial management and accounting')
ON CONFLICT (id) DO NOTHING;

-- 3. Profiles
INSERT INTO public.profiles (
  id, full_name, email, phone, department_id, manager_id, role, job_title, employment_status, date_of_joining, salary
) VALUES
(
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Admin Administrator', 'admin@demo.com', '+1 (555) 019-2834',
  'a0000000-0000-0000-0000-000000000001'::uuid, NULL,
  'admin', 'VP of Engineering & Operations', 'active', '2023-01-15', 220000
),
(
  '22222222-2222-2222-2222-222222222222'::uuid,
  'John Smith', 'manager@demo.com', '+1 (555) 012-3456',
  'a0000000-0000-0000-0000-000000000001'::uuid, '11111111-1111-1111-1111-111111111111'::uuid,
  'project_manager', 'Senior Engineering Manager', 'active', '2023-03-01', 165000
),
(
  '33333333-3333-3333-3333-333333333333'::uuid,
  'Jane Smith', 'employee@demo.com', '+1 (555) 018-7654',
  'a0000000-0000-0000-0000-000000000001'::uuid, '22222222-2222-2222-2222-222222222222'::uuid,
  'employee', 'Staff ML Engineer', 'active', '2023-06-12', 140000
),
(
  '44444444-4444-4444-4444-444444444444'::uuid,
  'Michael Brown', 'michael@company.com', '+1 (555) 014-9988',
  'a0000000-0000-0000-0000-000000000003'::uuid, '11111111-1111-1111-1111-111111111111'::uuid,
  'employee', 'Operations Lead', 'active', '2023-08-20', 115000
),
(
  '55555555-5555-5555-5555-555555555555'::uuid,
  'Sarah Wilson', 'sarah@company.com', '+1 (555) 016-3322',
  'a0000000-0000-0000-0000-000000000001'::uuid, '22222222-2222-2222-2222-222222222222'::uuid,
  'employee', 'Frontend Engineer', 'inactive', '2024-01-10', 105000
),
(
  '66666666-6666-6666-6666-666666666666'::uuid,
  'David Lee', 'david@company.com', '+1 (555) 017-8899',
  'a0000000-0000-0000-0000-000000000005'::uuid, '11111111-1111-1111-1111-111111111111'::uuid,
  'employee', 'Senior Financial Analyst', 'active', '2023-11-01', 120000
),
(
  '77777777-7777-7777-7777-777777777777'::uuid,
  'Priya Kumar', 'priya@company.com', '+1 (555) 015-6677',
  'a0000000-0000-0000-0000-000000000001'::uuid, '11111111-1111-1111-1111-111111111111'::uuid,
  'project_manager', 'Product Delivery Manager', 'active', '2023-04-15', 155000
),
(
  '88888888-8888-8888-8888-888888888888'::uuid,
  'Alex Johnson', 'alex@company.com', '+1 (555) 013-1122',
  'a0000000-0000-0000-0000-000000000002'::uuid, '22222222-2222-2222-2222-222222222222'::uuid,
  'employee', 'Data Engineer', 'active', '2024-02-01', 110000
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  department_id = EXCLUDED.department_id,
  employment_status = EXCLUDED.employment_status;

-- Update department heads
UPDATE public.departments SET department_head_id = '11111111-1111-1111-1111-111111111111'::uuid WHERE id = 'a0000000-0000-0000-0000-000000000001'::uuid;
UPDATE public.departments SET department_head_id = '22222222-2222-2222-2222-222222222222'::uuid WHERE id = 'a0000000-0000-0000-0000-000000000002'::uuid;
UPDATE public.departments SET department_head_id = '44444444-4444-4444-4444-444444444444'::uuid WHERE id = 'a0000000-0000-0000-0000-000000000003'::uuid;
UPDATE public.departments SET department_head_id = '55555555-5555-5555-5555-555555555555'::uuid WHERE id = 'a0000000-0000-0000-0000-000000000004'::uuid;
UPDATE public.departments SET department_head_id = '66666666-6666-6666-6666-666666666666'::uuid WHERE id = 'a0000000-0000-0000-0000-000000000005'::uuid;

-- 4. Projects
INSERT INTO public.projects (
  id, name, description, project_manager_id, department_id, budget, start_date, end_date, status
) VALUES
(
  'b0000000-0000-0000-0000-000000000001'::uuid,
  'AI Platform',
  'Development of AI platform for enterprise internal use and automated agent workflows.',
  '22222222-2222-2222-2222-222222222222'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  8000000, '2026-01-01', '2026-06-30', 'active'
),
(
  'b0000000-0000-0000-0000-000000000002'::uuid,
  'Data Pipeline',
  'Enterprise real-time ETL and telemetry pipelines with automated data quality checks.',
  '22222222-2222-2222-2222-222222222222'::uuid,
  'a0000000-0000-0000-0000-000000000002'::uuid,
  5000000, '2026-02-15', '2026-08-15', 'active'
),
(
  'b0000000-0000-0000-0000-000000000003'::uuid,
  'Mobile App',
  'Next-generation cross-platform mobile application for Android and iOS.',
  '77777777-7777-7777-7777-777777777777'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  4000000, '2026-03-01', '2026-10-31', 'planning'
),
(
  'b0000000-0000-0000-0000-000000000004'::uuid,
  'Analytics Dashboard',
  'Executive business intelligence dashboards and operational performance metrics.',
  '22222222-2222-2222-2222-222222222222'::uuid,
  'a0000000-0000-0000-0000-000000000002'::uuid,
  3000000, '2026-04-01', '2026-09-30', 'on_hold'
),
(
  'b0000000-0000-0000-0000-000000000005'::uuid,
  'Cloud Migration',
  'Lift-and-shift of legacy on-prem infrastructure to multi-region cloud.',
  '77777777-7777-7777-7777-777777777777'::uuid,
  'a0000000-0000-0000-0000-000000000003'::uuid,
  2500000, '2025-10-01', '2026-03-31', 'completed'
)
ON CONFLICT (id) DO NOTHING;

-- 5. Allocations
INSERT INTO public.allocations (
  id, employee_id, project_id, allocation_percentage, start_date, end_date
) VALUES
(
  'c0000000-0000-0000-0000-000000000001'::uuid,
  '33333333-3333-3333-3333-333333333333'::uuid,
  'b0000000-0000-0000-0000-000000000001'::uuid,
  40, '2026-01-01', '2026-06-30'
),
(
  'c0000000-0000-0000-0000-000000000002'::uuid,
  '33333333-3333-3333-3333-333333333333'::uuid,
  'b0000000-0000-0000-0000-000000000002'::uuid,
  30, '2026-02-15', '2026-08-15'
),
(
  'c0000000-0000-0000-0000-000000000003'::uuid,
  '33333333-3333-3333-3333-333333333333'::uuid,
  'b0000000-0000-0000-0000-000000000003'::uuid,
  10, '2026-03-01', '2026-10-31'
),
(
  'c0000000-0000-0000-0000-000000000004'::uuid,
  '44444444-4444-4444-4444-444444444444'::uuid,
  'b0000000-0000-0000-0000-000000000005'::uuid,
  70, '2025-10-01', '2026-03-31'
),
(
  'c0000000-0000-0000-0000-000000000005'::uuid,
  '66666666-6666-6666-6666-666666666666'::uuid,
  'b0000000-0000-0000-0000-000000000001'::uuid,
  100, '2026-01-01', '2026-06-30'
),
(
  'c0000000-0000-0000-0000-000000000006'::uuid,
  '88888888-8888-8888-8888-888888888888'::uuid,
  'b0000000-0000-0000-0000-000000000002'::uuid,
  60, '2026-02-15', '2026-08-15'
)
ON CONFLICT (id) DO NOTHING;

-- 6. Expenses
INSERT INTO public.expenses (
  project_id, amount, category, description, expense_date, recorded_by
) VALUES
(
  'b0000000-0000-0000-0000-000000000001'::uuid,
  2400000, 'Infrastructure', 'GPU Cluster & Cloud Compute (AWS & Lambda)', '2026-01-20',
  '22222222-2222-2222-2222-222222222222'::uuid
),
(
  'b0000000-0000-0000-0000-000000000001'::uuid,
  1540000, 'Software & Licenses', 'Enterprise vector database & tooling subscriptions', '2026-02-10',
  '22222222-2222-2222-2222-222222222222'::uuid
),
(
  'b0000000-0000-0000-0000-000000000001'::uuid,
  1500000, 'Consulting', 'Security penetration testing & LLM guardrail audit', '2026-03-05',
  '22222222-2222-2222-2222-222222222222'::uuid
),
(
  'b0000000-0000-0000-0000-000000000002'::uuid,
  1900000, 'Infrastructure', 'Snowflake data warehouse credits and Kafka cluster', '2026-02-28',
  '22222222-2222-2222-2222-222222222222'::uuid
);

-- 7. Skills
INSERT INTO public.skills (employee_id, skill_name, proficiency_level) VALUES
('33333333-3333-3333-3333-333333333333'::uuid, 'Python', 'Advanced'),
('33333333-3333-3333-3333-333333333333'::uuid, 'Machine Learning', 'Advanced'),
('33333333-3333-3333-3333-333333333333'::uuid, 'Data Analysis', 'Intermediate'),
('33333333-3333-3333-3333-333333333333'::uuid, 'SQL', 'Advanced');

-- 8. Certifications
INSERT INTO public.certifications (
  employee_id, certification_name, issuing_organization, issue_date, expiry_date, credential_url
) VALUES
(
  '33333333-3333-3333-3333-333333333333'::uuid,
  'AWS Cloud Practitioner',
  'Amazon Web Services',
  '2025-01-15',
  '2028-01-15',
  'https://aws.amazon.com/verification'
),
(
  '33333333-3333-3333-3333-333333333333'::uuid,
  'Google Data Analytics',
  'Google',
  '2024-10-01',
  '2027-10-01',
  'https://coursera.org/verify/professional-cert/google'
);
