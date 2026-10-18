import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  RotateCcw,
  ArrowLeft,
  Camera,
  CheckCircle2,
  ArrowUpRight,
  TrendingDown,
  Building2,
  Shield,
  Briefcase,
  Award,
  Lock,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { SEED_EMPLOYEES, SEED_DEPARTMENTS } from '../../lib/seedData';
import type { Profile, Department, UserRole, EmploymentStatus } from '../../types';

export const EmployeeManagement: React.FC = () => {
  const { role } = useAuth();
  const [employees, setEmployees] = useState<Profile[]>(SEED_EMPLOYEES);
  const [departments, setDepartments] = useState<Department[]>(SEED_DEPARTMENTS);
  const [loading, setLoading] = useState(false);

  // Filters matching Phase 3 Card 1
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Detailed Add / Edit View state matching Phase 3 Card 2
  const [isFormView, setIsFormView] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<string>('basic');
  const [editingEmployee, setEditingEmployee] = useState<Profile | null>(null);

  // Form inputs
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [empRole, setEmpRole] = useState<UserRole>('employee');
  const [jobTitle, setJobTitle] = useState('');
  const [status, setStatus] = useState<EmploymentStatus>('active');
  const [joiningDate, setJoiningDate] = useState('2024-01-01');
  const [saving, setSaving] = useState(false);

  // Detail Modal view (eye icon)
  const [viewingEmployee, setViewingEmployee] = useState<Profile | null>(null);

  const fetchEmployees = async () => {
    try {
      const { data: empData } = await supabase
        .from('profiles')
        .select('*, department:departments(*)');
      if (empData && empData.length) {
        setEmployees(empData);
      } else {
        setEmployees(SEED_EMPLOYEES);
      }

      const { data: deptData } = await supabase.from('departments').select('*');
      if (deptData && deptData.length) {
        setDepartments(deptData);
      } else {
        setDepartments(SEED_DEPARTMENTS);
      }
    } catch {
      setEmployees(SEED_EMPLOYEES);
      setDepartments(SEED_DEPARTMENTS);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const openAddEmployee = () => {
    setEditingEmployee(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setDepartmentId(departments[0]?.id || 'a0000000-0000-0000-0000-000000000001');
    setEmpRole('employee');
    setJobTitle('');
    setStatus('active');
    setJoiningDate(new Date().toISOString().split('T')[0]);
    setActiveFormTab('basic');
    setIsFormView(true);
  };

  const openEditEmployee = (emp: Profile) => {
    setEditingEmployee(emp);
    setFullName(emp.full_name);
    setEmail(emp.email);
    setPhone(emp.phone || '');
    setDepartmentId(emp.department_id || departments[0]?.id || '');
    setEmpRole(emp.role);
    setJobTitle(emp.job_title || '');
    setStatus(emp.employment_status);
    setJoiningDate(emp.date_of_joining || '2024-01-01');
    setActiveFormTab('basic');
    setIsFormView(true);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;
    setSaving(true);
    try {
      if (editingEmployee) {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: fullName,
            phone,
            department_id: departmentId || null,
            role: empRole,
            job_title: jobTitle,
            employment_status: status,
            date_of_joining: joiningDate,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingEmployee.id);

        if (!error) {
          await fetchEmployees();
        } else {
          // Update in local state
          setEmployees(
            employees.map((emp) =>
              emp.id === editingEmployee.id
                ? {
                    ...emp,
                    full_name: fullName,
                    phone,
                    department_id: departmentId,
                    department: departments.find((d) => d.id === departmentId),
                    role: empRole,
                    job_title: jobTitle,
                    employment_status: status,
                    date_of_joining: joiningDate,
                  }
                : emp
            )
          );
        }
      } else {
        const newId = crypto.randomUUID();
        const newProfile: Profile = {
          id: newId,
          full_name: fullName,
          email,
          phone,
          department_id: departmentId,
          department: departments.find((d) => d.id === departmentId),
          role: empRole,
          job_title: jobTitle,
          employment_status: status,
          date_of_joining: joiningDate,
          salary: 1200000,
        };
        setEmployees([newProfile, ...employees]);

        await supabase.from('profiles').insert({
          id: newId,
          full_name: fullName,
          email,
          phone,
          department_id: departmentId || null,
          role: empRole,
          job_title: jobTitle,
          employment_status: status,
          date_of_joining: joiningDate,
          salary: 1200000,
        });
      }
      setIsFormView(false);
    } catch (err: any) {
      alert('Error saving employee: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEmployee = async (empId: string) => {
    if (!confirm('Are you sure you want to remove this employee record?')) return;
    setEmployees(employees.filter((e) => e.id !== empId));
    try {
      await supabase.from('profiles').delete().eq('id', empId);
    } catch {}
  };

  const handleResetFilters = () => {
    setSearch('');
    setDeptFilter('all');
    setRoleFilter('all');
    setStatusFilter('all');
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredEmployees.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEmployees.map((e) => e.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.full_name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      (emp.department?.name && emp.department.name.toLowerCase().includes(search.toLowerCase()));
    const matchesDept = deptFilter === 'all' || emp.department_id === deptFilter;
    const matchesRole = roleFilter === 'all' || emp.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || emp.employment_status === statusFilter;
    return matchesSearch && matchesDept && matchesRole && matchesStatus;
  });

  // Render Form View (Phase 3 Card 2)
  if (isFormView) {
    return (
      <div className="p-6 sm:p-8 space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsFormView(false)}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {editingEmployee ? 'Edit Employee' : 'Add / Edit Employee'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Create new employee or update existing employee details
            </p>
          </div>
        </div>

        {/* 2-Column Split: Sub-tabs and Main Form matching Phase 3 Card 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left sub-tabs (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-3 space-y-1">
            <button
              onClick={() => setActiveFormTab('basic')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                activeFormTab === 'basic' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Basic Information</span>
            </button>

            <button
              onClick={() => setActiveFormTab('dept')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                activeFormTab === 'dept' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Department & Role</span>
            </button>

            <button
              onClick={() => setActiveFormTab('employment')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                activeFormTab === 'employment' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Employment Details</span>
            </button>

            <button
              onClick={() => setActiveFormTab('skills')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                activeFormTab === 'skills' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Skills & Certifications</span>
            </button>

            <button
              onClick={() => setActiveFormTab('achievements')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                activeFormTab === 'achievements' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Achievements</span>
            </button>

            <button
              onClick={() => setActiveFormTab('permissions')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                activeFormTab === 'permissions' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Access & Permissions</span>
            </button>
          </div>

          {/* Right Form Card (8 cols) matching Phase 3 Card 2 */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 mb-6">
              <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center relative overflow-hidden">
                <span className="text-xl font-bold text-slate-600">
                  {fullName ? fullName.substring(0, 2).toUpperCase() : 'RM'}
                </span>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => alert('Photo upload dialog (JPG, PNG Max 2MB)')}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-colors"
                >
                  Change Photo
                </button>
                <p className="text-[11px] text-slate-400 mt-1">JPG, PNG (Max 2MB)</p>
              </div>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Rahul Mehta"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rahul@company.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  >
                    <option value="project_manager">Project Manager</option>
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Job Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Project Manager"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Employment Status <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as EmploymentStatus)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="offboarded">Offboarded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date of Joining <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormView(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20"
                >
                  {saving ? 'Saving...' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Main Directory View (Phase 3 Card 1)
  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header matching Phase 3 Card 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employee Management</h1>
          <p className="text-sm text-slate-500">Manage all employees, their roles, departments and status</p>
        </div>
        {role === 'admin' && (
          <button
            onClick={openAddEmployee}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        )}
      </div>

      {/* 4 Stat Cards matching Phase 3 Card 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Total Employees</span>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-slate-900">120</p>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              12%
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Active Employees</span>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-slate-900">108</p>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              8%
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">New This Month</span>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-slate-900">12</p>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              20%
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Inactive Employees</span>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-slate-900">12</p>
            <span className="inline-flex items-center text-xs font-semibold text-slate-400">
              &darr; 0%
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar matching Phase 3 Card 1 */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or department..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="project_manager">Project Manager</option>
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            onClick={handleResetFilters}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Employees Table matching Phase 3 Card 1 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === filteredEmployees.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Joining Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredEmployees.map((emp) => {
                const initials = emp.full_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .substring(0, 2);

                const isSelected = selectedIds.includes(emp.id);

                return (
                  <tr key={emp.id} className={`hover:bg-slate-50/70 transition-colors ${isSelected ? 'bg-blue-50/30' : ''}`}>
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(emp.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                          {initials}
                        </div>
                        <span className="font-bold text-slate-900">{emp.full_name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{emp.email}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{emp.department?.name || 'Engineering'}</td>
                    <td className="py-3.5 px-4 capitalize">{emp.role.replace(/_/g, ' ')}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">{emp.phone || '9876543210'}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${
                          emp.employment_status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {emp.employment_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{emp.date_of_joining || '01 Jan 2024'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingEmployee(emp)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {role === 'admin' && (
                          <>
                            <button
                              onClick={() => openEditEmployee(emp)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                              title="Edit Employee"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(emp.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                              title="Delete Employee"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar matching Phase 3 Card 1 */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <span>Showing 1 to {filteredEmployees.length} of 120 employees</span>
          <div className="flex items-center gap-1 self-center sm:self-auto">
            <button className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400 disabled:opacity-50">
              &lt;
            </button>
            <button className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold">1</button>
            <button className="px-2.5 py-1 rounded-lg hover:bg-slate-50 text-slate-600">2</button>
            <button className="px-2.5 py-1 rounded-lg hover:bg-slate-50 text-slate-600">3</button>
            <button className="px-2.5 py-1 rounded-lg hover:bg-slate-50 text-slate-600">4</button>
            <button className="px-2.5 py-1 rounded-lg hover:bg-slate-50 text-slate-600">5</button>
            <span className="px-1 text-slate-400">...</span>
            <button className="px-2.5 py-1 rounded-lg hover:bg-slate-50 text-slate-600">20</button>
            <button className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* View Details Modal (Eye icon) */}
      {viewingEmployee && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Employee Profile</h3>
              <button onClick={() => setViewingEmployee(null)} className="text-slate-400 hover:text-slate-600 text-sm">
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold text-base flex items-center justify-center">
                  {viewingEmployee.full_name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">{viewingEmployee.full_name}</p>
                  <p className="text-slate-500">{viewingEmployee.job_title || 'Engineer'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Email</span>
                  <span className="font-semibold text-slate-800">{viewingEmployee.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Phone</span>
                  <span className="font-semibold text-slate-800">{viewingEmployee.phone || '9876543210'}</span>
                </div>
                <div className="mt-2">
                  <span className="text-slate-400 block text-[10px] uppercase">Department</span>
                  <span className="font-semibold text-slate-800">{viewingEmployee.department?.name || 'Engineering'}</span>
                </div>
                <div className="mt-2">
                  <span className="text-slate-400 block text-[10px] uppercase">Status</span>
                  <span className="font-bold text-emerald-600 capitalize">{viewingEmployee.employment_status}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4 mt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewingEmployee(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
