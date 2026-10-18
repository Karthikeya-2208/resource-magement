import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Plus,
  MoreVertical,
  Mail,
  Shield,
  Building2,
  X,
  Edit2,
  UserX,
  UserCheck,
  IndianRupee,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../lib/calculations';
import { SEED_EMPLOYEES, SEED_DEPARTMENTS } from '../../lib/seedData';
import type { Profile, Department, UserRole, EmploymentStatus } from '../../types';

export const EmployeeManagement: React.FC = () => {
  const { role, user } = useAuth();
  const [employees, setEmployees] = useState<Profile[]>(SEED_EMPLOYEES);
  const [departments, setDepartments] = useState<Department[]>(SEED_DEPARTMENTS);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  // Add/Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [empRole, setEmpRole] = useState<UserRole>('employee');
  const [jobTitle, setJobTitle] = useState('');
  const [salary, setSalary] = useState('');
  const [status, setStatus] = useState<EmploymentStatus>('active');
  const [saving, setSaving] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
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
    } catch (err) {
      console.warn('Error fetching employees, using seeds:', err);
      setEmployees(SEED_EMPLOYEES);
      setDepartments(SEED_DEPARTMENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const openAddModal = () => {
    setEditingEmployee(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setDepartmentId(departments[0]?.id || '');
    setEmpRole('employee');
    setJobTitle('');
    setSalary('1200000');
    setStatus('active');
    setShowModal(true);
  };

  const openEditModal = (emp: Profile) => {
    setEditingEmployee(emp);
    setFullName(emp.full_name);
    setEmail(emp.email);
    setPhone(emp.phone || '');
    setDepartmentId(emp.department_id || departments[0]?.id || '');
    setEmpRole(emp.role);
    setJobTitle(emp.job_title || '');
    setSalary(emp.salary ? String(emp.salary) : '');
    setStatus(emp.employment_status);
    setShowModal(true);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;
    setSaving(true);
    try {
      if (editingEmployee) {
        // Update profile
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: fullName,
            phone,
            department_id: departmentId || null,
            role: empRole,
            job_title: jobTitle,
            salary: salary ? parseFloat(salary) : null,
            employment_status: status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingEmployee.id);

        if (error) throw error;
      } else {
        // When onboarding a new employee in hackathon demo without backend admin API key:
        // We generate a deterministic UUID and insert into profiles (or use RPC).
        // Let's create an auth user via client or deterministic ID:
        const newId = crypto.randomUUID();
        const { error: profileErr } = await supabase.from('profiles').insert({
          id: newId,
          full_name: fullName,
          email,
          phone,
          department_id: departmentId || null,
          role: empRole,
          job_title: jobTitle,
          salary: salary ? parseFloat(salary) : null,
          employment_status: status,
        });

        if (profileErr) {
          // If foreign key constraint to auth.users fails, we insert into auth.users via RPC or notify
          alert('Note: In Supabase, new logins require auth.users record. Profile created for organization directory: ' + profileErr.message);
        }
      }

      await fetchEmployees();
      setShowModal(false);
    } catch (err: any) {
      alert('Error saving employee: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleEmploymentStatus = async (emp: Profile) => {
    const nextStatus: EmploymentStatus = emp.employment_status === 'active' ? 'inactive' : 'active';
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ employment_status: nextStatus })
        .eq('id', emp.id);
      if (error) throw error;
      setEmployees(employees.map((e) => (e.id === emp.id ? { ...e, employment_status: nextStatus } : e)));
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    }
  };

  // Filtered list
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.full_name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'all' || emp.department_id === deptFilter;
    const matchesRole = roleFilter === 'all' || emp.role === roleFilter;
    return matchesSearch && matchesDept && matchesRole;
  });

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title & Add Button matching Screen 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employees</h1>
          <p className="text-sm text-slate-500">Manage all employees, roles, departments, and verified access profiles</p>
        </div>
        {role === 'admin' && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
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
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="project_manager">Project Manager</option>
            <option value="employee">Employee</option>
          </select>
        </div>
      </div>

      {/* Table matching Screen 5 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Name</th>
                <th className="py-3.5 px-6">Email</th>
                <th className="py-3.5 px-6">Department</th>
                <th className="py-3.5 px-6">Role</th>
                {role === 'admin' && <th className="py-3.5 px-6">Compensation</th>}
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
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

                const getRoleBadge = (r: UserRole) => {
                  switch (r) {
                    case 'admin':
                      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
                    case 'project_manager':
                      return 'bg-blue-50 text-blue-700 border-blue-200';
                    default:
                      return 'bg-slate-100 text-slate-700 border-slate-200';
                  }
                };

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                          {initials}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{emp.full_name}</p>
                          <p className="text-[10px] text-slate-400">{emp.job_title || 'Engineer'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-slate-500 font-medium">{emp.email}</td>
                    <td className="py-3.5 px-6 text-slate-700">{emp.department?.name || 'Engineering'}</td>
                    <td className="py-3.5 px-6">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${getRoleBadge(emp.role)}`}>
                        {emp.role.replace(/_/g, ' ')}
                      </span>
                    </td>
                    {role === 'admin' && (
                      <td className="py-3.5 px-6 font-semibold text-slate-800">
                        {emp.salary ? formatCurrency(emp.salary) : 'Confidential'}
                      </td>
                    )}
                    <td className="py-3.5 px-6">
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
                    <td className="py-3.5 px-6 text-right">
                      {role === 'admin' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(emp)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Edit Employee"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleEmploymentStatus(emp)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                            title={emp.employment_status === 'active' ? 'Mark Inactive' : 'Activate Employee'}
                          >
                            {emp.employment_status === 'active' ? (
                              <UserX className="w-3.5 h-3.5 text-rose-500" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingEmployee ? 'Edit Employee Profile' : 'Onboard New Employee'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    disabled={!!editingEmployee}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@company.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                  <select
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="employee">Employee</option>
                    <option value="project_manager">Project Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Salary (₹)</label>
                  <input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="1200000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20"
                >
                  {saving ? 'Saving...' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
