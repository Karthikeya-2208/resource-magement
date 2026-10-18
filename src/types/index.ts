export type UserRole = 'admin' | 'project_manager' | 'employee';

export type EmploymentStatus = 'active' | 'inactive' | 'offboarded';

export type ProjectStatus = 'planning' | 'active' | 'completed' | 'on_hold';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  department_id?: string | null;
  manager_id?: string | null;
  role: UserRole;
  job_title?: string | null;
  employment_status: EmploymentStatus;
  date_of_joining?: string | null;
  salary?: number | null;
  created_at?: string;
  updated_at?: string;
  department?: Department | null;
  manager?: Profile | null;
  active_allocation?: number;
}

export interface Department {
  id: string;
  name: string;
  description?: string | null;
  department_head_id?: string | null;
  created_at?: string;
  department_head?: Profile | null;
  employee_count?: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  project_manager_id?: string | null;
  department_id?: string | null;
  budget: number;
  start_date: string;
  end_date: string;
  status: ProjectStatus;
  created_at?: string;
  updated_at?: string;
  manager?: Profile | null;
  department?: Department | null;
  spent?: number;
  allocations_count?: number;
}

export interface Allocation {
  id: string;
  employee_id: string;
  project_id: string;
  allocation_percentage: number;
  start_date: string;
  end_date: string;
  status?: string;
  created_at?: string;
  employee?: Profile | null;
  project?: Project | null;
}

export interface Expense {
  id: string;
  project_id: string;
  amount: number;
  category: string;
  description?: string | null;
  expense_date: string;
  recorded_by?: string | null;
  created_at?: string;
  recorder?: Profile | null;
  project?: Project | null;
}

export interface Skill {
  id: string;
  employee_id: string;
  skill_name: string;
  proficiency_level?: string | null;
  created_at?: string;
}

export interface Certification {
  id: string;
  employee_id: string;
  certification_name: string;
  issuing_organization?: string | null;
  issue_date?: string | null;
  expiry_date?: string | null;
  credential_url?: string | null;
  created_at?: string;
}

export interface Achievement {
  id: string;
  employee_id: string;
  title: string;
  description?: string | null;
  achievement_date?: string | null;
  created_at?: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  details?: Record<string, any> | null;
  created_at?: string;
  actor?: Profile | null;
}
