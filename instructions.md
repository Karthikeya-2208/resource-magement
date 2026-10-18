# MASTER PROMPT: ENTERPRISE RESOURCE MANAGEMENT PLATFORM

## 1. Your Role and Objective

Act as a senior full-stack developer, software architect, database engineer, and UI/UX designer.

Build a working, full-stack **Enterprise Resource Management Platform** for an organization. This is a time-critical hackathon project. Prioritize working end-to-end functionality, clean architecture, a professional user interface, and a successful live demonstration.

**Time constraint:** The application must be developed and tested within approximately 3 hours.

Do not merely create a static UI or a visual prototype. Implement actual database integration, authentication, CRUD operations, role-based permissions, resource allocation calculations, dashboards, and reports.

Work directly in the current project directory. First inspect the existing files and preserve any useful code. Do not replace a working application unnecessarily.

If this is a fresh project, scaffold it using the stack below.

## 2. Mandatory Technology Stack

- Frontend: React + TypeScript + Vite
- Styling: Tailwind CSS
- UI components: shadcn/ui, where practical
- Icons: lucide-react
- Backend/database: Supabase PostgreSQL
- Authentication: Supabase Auth
- Authorization: Role-based access control and Supabase Row Level Security
- Charts: Recharts
- Date handling: date-fns
- Version control: Git

Use the Supabase JavaScript client directly from the frontend. Do not introduce a separate Express, Django, or Flask backend unless absolutely necessary.

Do not require paid APIs, Gemini API keys, OpenAI API keys, or any other external AI service.

Use environment variables for Supabase configuration. Never expose a Supabase service-role key in frontend code.

## 3. Application Identity and UI/UX

Application name: ResourceHub Enterprise

Build a modern enterprise SaaS dashboard with the following design:

- Professional light theme with white and light-gray surfaces.
- Deep navy sidebar and blue primary actions.
- Green indicators for healthy or successful states.
- Amber indicators for warnings and over-allocation risks.
- Red indicators for errors, exhausted budgets, and critical conditions.
- Consistent spacing, typography, rounded cards, subtle shadows, and clean tables.
- Responsive desktop, tablet, and mobile layouts.
- Persistent left sidebar on desktop and collapsible navigation on smaller screens.
- Top navigation containing the current page, search where practical, notification indicator, and user profile menu.
- Breadcrumbs or clear page titles.
- Loading skeletons, empty states, success messages, and readable error messages.
- Confirmation dialogs before destructive actions.
- Forms with validation and helpful field-level error messages.

Create a polished sign-in page, a dashboard for each role, reusable table and form components, and consistent navigation.

Do not use dead buttons, fake links, placeholder pages, or interactions that only change the appearance without performing the intended action.

## 4. User Roles and Permissions

Implement three roles.

### A. Admin

The administrator manages the organization and has access to:

- Organization-wide dashboard and analytics.
- Employee and manager onboarding and offboarding.
- Employee profiles and compensation details.
- Department and organizational master data.
- All projects, project managers, and resource allocations.
- Project and employee reports.
- Budget and expense information.
- User role assignments and access management.

### B. Project Manager

The project manager can:

- Create and manage projects.
- Define project budgets, start dates, end dates, and statuses.
- Assign employees to projects.
- Specify allocation percentages and assignment dates.
- View employee availability and current workload before assigning them.
- Reallocate or remove employees from projects.
- Record and manage project-related expenses.
- View project budget utilization, resource utilization, and employee burnout risk.
- Generate reports for projects they manage.
- View project-specific KPIs.

Project managers must not be able to modify administrator roles, access organization-wide compensation data, or manage projects belonging to other managers unless explicitly authorized.

### C. Employee

An employee can:

- View and update permitted personal profile fields.
- View their department, manager, skills, certifications, and achievements.
- Add, edit, and remove their own skills and certifications.
- View their current and previous project assignments.
- View allocation percentages and assignment dates.
- View the organizational reporting hierarchy.
- View their own utilization and performance reports in read-only mode.

Employees must not be able to create projects, assign resources, change budgets, edit other employees' profiles, or access confidential compensation details.

### Authorization requirements

- Implement permissions in the database, not just by hiding frontend buttons.
- Use protected routes and role-aware navigation.
- Verify the authenticated user's role before displaying privileged actions.
- Enforce permissions through Supabase RLS policies.
- Prevent users from changing their own role or accessing another user's protected data.
- Prevent employees from granting themselves administrative access.
- Use a secure administrator-controlled role assignment mechanism.

## 5. Database Schema

Create the required SQL schema and migrations in the project, and provide instructions to execute them in the Supabase SQL Editor.

Use UUID primary keys, appropriate foreign keys, timestamps, constraints, and indexes.

### Table 1: profiles

Fields:

- id: UUID referencing auth.users.id
- full_name
- email
- phone
- department_id
- manager_id
- role: admin, project_manager, or employee
- job_title
- employment_status: active, inactive, or offboarded
- date_of_joining
- salary
- created_at
- updated_at

Salary and other compensation fields must be accessible only to authorized administrators.

### Table 2: departments

Fields:

- id
- name
- description
- department_head_id
- created_at

Department names should be unique.

### Table 3: projects

Fields:

- id
- name
- description
- project_manager_id
- department_id
- budget
- start_date
- end_date
- status: planning, active, completed, or on_hold
- created_at
- updated_at

Project budgets must be non-negative, and the end date must not precede the start date.

### Table 4: allocations

Fields:

- id
- employee_id
- project_id
- allocation_percentage
- start_date
- end_date
- created_at

Rules:

- Allocation percentage must be greater than 0 and at most 100.
- An employee may work on multiple projects.
- Total active allocation for an employee must not exceed 100%.
- A manager must be able to see existing allocations before assigning an employee.
- Prevent conflicting or excessive assignments using database-side validation, not just frontend checks.
- Calculate allocations using assignment dates and current active assignments.
- When removing an assignment, retain historical assignment records where practical.

### Table 5: expenses

Fields:

- id
- project_id
- amount
- category
- description
- expense_date
- recorded_by
- created_at

Expenses must be non-negative and linked to valid projects.

### Table 6: skills

Fields:

- id
- employee_id
- skill_name
- proficiency_level
- created_at

### Table 7: certifications

Fields:

- id
- employee_id
- certification_name
- issuing_organization
- issue_date
- expiry_date
- credential_url
- created_at

### Table 8: achievements

Fields:

- id
- employee_id
- title
- description
- achievement_date
- created_at

### Table 9: audit_logs

Fields:

- id
- actor_id
- action
- entity_type
- entity_id
- details as JSONB
- created_at

Use audit logs to record important administrative operations and project allocation changes where practical.

### Database requirements

- Add indexes for frequently queried employee, department, project, and allocation fields.
- Add useful foreign-key constraints.
- Use transactions or database functions for critical allocation operations.
- Avoid duplicate records and invalid relationships.
- Use updated_at triggers where appropriate.
- Design RLS policies carefully to avoid unauthorized access and recursive policy problems.
- Ensure that ordinary users cannot directly insert or update their own role, salary, or other privileged fields.
- Provide a secure onboarding workflow for creating users and assigning roles. Use a trusted server-side or administrator-only process for privileged account creation.

## 6. Authentication and Demo Access

Implement a functional sign-in page using Supabase Auth.

Required features:

- Email and password sign-in.
- Sign-out.
- Session persistence.
- Protected application routes.
- Role-based redirection after login.
- Helpful messages for invalid credentials, expired sessions, and authorization errors.

Create a simple demo-account information panel on the login page.

Provide a documented setup process for creating one admin, one project manager, and one employee account through Supabase Auth and assigning their profiles securely.

If actual accounts have not yet been configured, show clear setup instructions. Never pretend that authentication succeeded when it did not.

Do not hardcode privileged credentials or bypass Supabase authentication to make the demo work.

## 7. Admin Module

### 7.1 Organization Dashboard

Build an organization-level dashboard containing:

- Total employees.
- Active employees.
- Active projects.
- Total project budget.
- Total recorded expenses.
- Overall resource utilization.
- Employees who are fully allocated.
- Employees who are underutilized.
- Employees at risk of over-allocation.
- Department-wise employee distribution.
- Project status distribution.
- Resource utilization charts.
- Recent important activities.

All dashboard values must be derived from actual database records. Refresh the relevant dashboard queries after successful mutations.

### 7.2 Employee Management

Create a searchable and filterable employee table.

Features:

- Add employees.
- View complete employee profiles.
- Edit permitted profile details.
- Assign departments and managers.
- Assign user roles through authorized administrative operations.
- View employee project assignments and skills.
- Change employment status to inactive or offboarded.
- View compensation details for authorized administrators.
- Search by employee name or email.
- Filter by department, role, and employment status.

For offboarding, prevent new assignments, preserve historical records, and warn about active project allocations. Do not delete financial or project history.

### 7.3 Department Management

- Create and edit departments.
- View employee counts per department.
- Assign department heads.
- Display department-wise project and resource summaries.

### 7.4 Master Data and Access Management

Provide an administrator page for viewing and managing organizational reference data, departments, employment statuses, and user-role assignments.

Do not allow a user to grant permissions beyond their authorized level.

### 7.5 Reports

Provide organization-level and department-level reports.

Include:

- Employee distribution by department.
- Employee allocation and utilization.
- Project budgets and expenses.
- Project status summaries.
- Employee workload.
- Department resource utilization.

Provide CSV export for useful tables and reports.

## 8. Project Manager Module

### 8.1 Project Management

Build a project management page with:

- Project listing and search.
- Create project form.
- Edit project details.
- Project manager selection, subject to permissions.
- Department selection.
- Budget and timeline configuration.
- Status updates.
- Project details page.

Validate all inputs and prevent invalid dates or negative budgets.

### 8.2 Resource Allocation

This is one of the most important features of the hackathon.

Create an allocation interface that lets a project manager select a project, choose an employee, and specify an allocation percentage.

For every employee, display:

- Department.
- Current active projects.
- Allocation on each project.
- Total current allocation.
- Remaining capacity.
- Availability status.

Example:

An employee has 40% allocation on Project A. The manager wants to assign the employee 60% to Project B.

Display:

Current allocation: 40%.

Proposed allocation: 60%.

Total after assignment: 100%.

Remaining capacity: 0%.

The assignment should succeed if all other validation checks pass.

If the manager tries to allocate an additional 30% instead, making the total 130%, reject the assignment and display a clear explanation.

Additional requirements:

- Show the proposed allocation before saving.
- Prevent total active allocation from exceeding 100%.
- Reallocate employees between projects.
- Remove active assignments while retaining useful history.
- Check assignment date overlaps.
- Refresh the employee workload and project dashboard after changes.
- Prevent race conditions where two simultaneous assignments exceed the employee's capacity.
- Display a clear success or failure notification.

### 8.3 Project Expenses and Budget Utilization

Allow authorized managers to record project expenses.

Display:

- Approved project budget as configured in the project record.
- Total recorded expenses.
- Remaining budget.
- Budget utilization percentage.
- Expenses by category.
- Expense history.

Use this formula:

Budget utilization = Total recorded expenses / Project budget × 100.

Handle a zero budget without division errors.

For this prototype, treat recorded expenses as actual spending; do not invent a separate approval process that is not required by the specification.

### 8.4 Project Dashboard

For each project, show:

- Project name and status.
- Project manager.
- Timeline and deadlines.
- Budget and recorded expenses.
- Budget utilization chart.
- Number of assigned employees.
- Total allocated effort.
- Individual employee allocation.
- Available capacity.
- Resource utilization.
- Potential burnout and over-allocation warnings.
- Recent allocation and expense activity.

### 8.5 Burnout and Workload Indicators

Implement transparent rule-based indicators; do not claim to predict actual mental health or burnout.

For example:

- Over 100% allocation: critical warning; reject the new allocation.
- Exactly 100%: fully allocated.
- 81–99%: high workload.
- 1–80%: allocated with remaining capacity.
- 0%: unallocated.

Make these thresholds visible and easy to explain during the presentation.

### 8.6 Resource Reports

Allow project managers to view and export:

- Project resource allocation.
- Employee workload.
- Project budget utilization.
- Expense breakdown.
- Available employee capacity.
- Project timelines and status.

## 9. Employee Module

### 9.1 Employee Dashboard

Display:

- Welcome message and profile summary.
- Department and job title.
- Current projects.
- Individual allocation percentages.
- Total workload.
- Remaining capacity.
- Upcoming assignment end dates.
- Skills and certifications.
- Personal utilization report.

### 9.2 Profile Management

Allow employees to update permitted fields, such as phone number and profile information.

Do not allow changes to their own role, salary, employment status, department assignment, or privileged fields unless specifically authorized.

### 9.3 Skills, Certifications, and Achievements

Provide forms to add, edit, view, and delete their own records.

Validate required fields and display saved information immediately.

### 9.4 Project Assignments

Display assigned projects with:

- Project name.
- Project status.
- Allocation percentage.
- Start and end dates.
- Project manager, where permitted.
- Personal workload summary.

Employees must have read-only access to allocation and performance reports.

### 9.5 Organizational Hierarchy

Display the employee's manager, department head, and relevant organizational reporting relationships.

Use a simple hierarchy or nested list. Avoid spending time building a complex organizational graph.

## 10. Reports, Analytics, and CSV Export

Implement functional reports based on database data.

Required visualizations:

- Resource utilization by department.
- Employee workload distribution.
- Project budget versus recorded expenses.
- Project status distribution.
- Allocation by project.
- Employee allocation breakdown.

Add useful filters, such as department, project, employee, and status, where practical.

Charts must use live database data rather than hardcoded example values.

CSV exports must contain the appropriate filtered dataset and must not expose compensation or other confidential fields to unauthorized users.

## 11. Application Architecture

Use a modular structure similar to:

src/
  components/
    layout/
    ui/
    charts/
    tables/
  pages/
    auth/
    admin/
    manager/
    employee/
  hooks/
  lib/
    supabase.ts
    permissions.ts
    calculations.ts
    exports.ts
  types/
  App.tsx
  main.tsx

supabase/
  migrations/
  seed.sql

Adapt this structure to the existing repository when appropriate.

Requirements:

- Create a reusable Supabase client.
- Use typed data models.
- Centralize allocation and utilization calculations.
- Reuse common tables, cards, forms, and dialogs.
- Separate data access from presentation where practical.
- Implement consistent error handling.
- Use loading states for database requests.
- Avoid unnecessary duplicate queries.
- Use environment variables for configuration.
- Keep code readable enough to explain during a hackathon presentation.

## 12. Security and Data Integrity

- Enforce access rules in PostgreSQL through RLS.
- Keep privileged credentials on trusted server-side infrastructure only.
- Validate user input on both client and database sides.
- Prevent unauthorized employee, project, expense, and allocation modifications.
- Ensure that employees cannot read other employees' confidential compensation data.
- Prevent users from modifying their own roles.
- Ensure project managers can only manage authorized projects.
- Do not rely on client-side role checks as the only security mechanism.
- Use database constraints and atomic operations for critical allocation rules.
- Preserve important historical records.
- Avoid SQL injection and unsafe dynamic SQL.
- Do not silently swallow errors.

Create the smallest secure implementation that supports the demonstration rather than introducing unnecessary infrastructure.

## 13. Seed Data and Demo Preparation

Create realistic, clearly identified demo data to demonstrate the application.

Suggested data:

- 3 departments: Engineering, Data & AI, and Operations.
- 1 administrator.
- 2 project managers.
- 6–8 employees.
- 3 projects with different budgets, dates, and statuses.
- Multiple employee allocations with different percentages.
- Several expense records.
- Employee skills, certifications, and achievements.

Important:

- Use valid foreign-key relationships.
- Keep authentication users and profile records synchronized.
- Use synthetic employee details and salaries.
- Never fabricate authentication success.
- Do not create a public signup path that allows users to select an administrator role.
- Ensure that seed data does not conflict with database constraints.

If seed data requires authenticated users, provide an idempotent setup script or clear steps to create the accounts first.

## 14. Testing and Acceptance Criteria

Before declaring the project complete, verify the following.

### Authentication

- Valid users can sign in.
- Invalid credentials display an error.
- Sessions persist on refresh.
- Sign-out works.
- Protected pages require authentication.
- Each role sees the correct dashboard.

### Admin

- Employee records can be created and updated.
- Departments can be managed.
- Compensation fields are protected.
- Organization-level charts and reports load from Supabase.
- Offboarding preserves historical data.

### Project Manager

- Projects can be created and edited.
- Expenses can be recorded.
- Allocation percentages are saved.
- A valid allocation succeeds.
- An allocation that exceeds 100% is rejected.
- Budget utilization updates after expenses are recorded.
- Reports reflect saved changes.

### Employee

- Employees can update permitted profile fields.
- Skills and certifications persist.
- Project assignments display correctly.
- Other employees' confidential information cannot be accessed.
- Reports remain read-only.

### Application Quality

- No broken navigation links.
- No dead buttons.
- No major console errors.
- No missing required pages.
- No hardcoded dashboard metrics after database integration.
- Loading and empty states work.
- The app runs successfully using the development server.

If any feature cannot be completed within the deadline, prioritize the required end-to-end workflow and report the limitation honestly.

## 15. Strict Three-Hour Implementation Strategy

Follow this sequence without waiting for unnecessary confirmation.

### Phase 1 — Foundation and UI (0–30 minutes)

- Inspect the project.
- Establish the React application and dependencies.
- Create the application layout and role-based navigation.
- Build the sign-in page and dashboards.
- Create reusable cards, tables, forms, and chart components.
- Ensure the application starts locally.

### Phase 2 — Database and Authentication (30–60 minutes)

- Create the SQL migrations.
- Configure the Supabase client and environment variables.
- Implement profiles, departments, projects, allocations, expenses, skills, certifications, achievements, and audit logs.
- Add essential RLS policies and constraints.
- Implement real sign-in, session handling, and protected routes.
- Create demo setup instructions.

### Phase 3 — Core Workflows (60–120 minutes)

Implement in this priority order:

1. Employee management.
2. Project creation and editing.
3. Employee-to-project allocation.
4. Database-side allocation validation.
5. Expense recording and budget calculations.
6. Employee profile and skills management.
7. Role-specific permissions.

### Phase 4 — Analytics and Reports (120–150 minutes)

- Connect dashboards to actual database queries.
- Implement utilization and budget charts.
- Add employee workload indicators.
- Implement useful report filters and CSV export.

### Phase 5 — Testing and Presentation (150–180 minutes)

- Run the application.
- Fix critical runtime and database errors.
- Test the three user roles.
- Test one successful and one rejected resource allocation.
- Verify dashboard updates.
- Prepare the live demonstration.
- Provide the architecture explanation and known limitations.

These timings are priorities, not excuses to stop a critical workflow halfway through. If the clock is running short, reduce decorative work and optional features before sacrificing authentication, database integration, or allocation validation.

## 16. How You Must Work

1. Inspect the current repository before editing.
2. Give a short summary of the current project state and the immediate implementation plan.
3. Start implementing immediately; do not stop after presenting a plan.
4. Install only necessary dependencies.
5. Create or update the required source files.
6. Run the development server and check the terminal output.
7. Resolve build errors and missing dependencies.
8. Connect the real Supabase backend.
9. Verify important CRUD operations and permissions.
10. Clearly identify every manual setup step that requires my action, such as entering Supabase credentials or executing SQL.
11. Never claim a feature is complete unless it has actually been implemented and checked.
12. Do not replace database functionality with localStorage or mock data to simulate a working backend.
13. Do not create unnecessary files, duplicate configurations, or multiple competing implementations.
14. If blocked by missing Supabase credentials, continue with the source code and SQL, then clearly explain what is required to connect it.
15. Keep the application runnable throughout development.

## 17. Final Deliverables

At completion, provide:

- A working React web application.
- Supabase schema and migration SQL.
- Authentication and role-based access control.
- Admin, project manager, and employee modules.
- Resource allocation and validation.
- Project expense and budget tracking.
- Live dashboards and charts.
- Reports and CSV export.
- Seed data or demo-account setup instructions.
- A list of environment variables required.
- Exact steps to run the application locally.
- A five-minute presentation script covering architecture, features, a live workflow, and future scalability.
- A list of completed features and any remaining limitations.

**FINAL PRIORITY:** Build a real, integrated, demonstrable Resource Management Platform. Functional correctness, data integrity, role-based security, and successful execution take precedence over unnecessary visual effects or extra features.

Begin by inspecting the repository and then implement the project in the specified order.