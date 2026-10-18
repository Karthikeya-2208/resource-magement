import React, { useEffect, useState } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Users,
  Search,
  ArrowLeft,
  Eye,
  ArrowUpRight,
  UserPlus,
  Mail,
  Calendar,
  X,
  MoreVertical,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { SEED_DEPARTMENTS, SEED_EMPLOYEES } from '../../lib/seedData';
import type { Department, Profile } from '../../types';

export const DepartmentManagement: React.FC = () => {
  const { role } = useAuth();
  const [departments, setDepartments] = useState<Department[]>(SEED_DEPARTMENTS);
  const [employees, setEmployees] = useState<Profile[]>(SEED_EMPLOYEES);
  const [search, setSearch] = useState('');

  // Selected department for Card 4: "Department Details & Team Members"
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [memberSearch, setMemberSearch] = useState('');

  // Add / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [headName, setHeadName] = useState('');
  const [headEmail, setHeadEmail] = useState('');
  const [saving, setSaving] = useState(false);

  // Add member modal
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Senior Developer');

  const fetchDepartments = async () => {
    try {
      const { data: deptData } = await supabase
        .from('departments')
        .select('*, department_head:profiles(*)');
      const { data: empData } = await supabase.from('profiles').select('*');

      if (empData && empData.length) setEmployees(empData);
      if (deptData && deptData.length) setDepartments(deptData);
    } catch {
      setDepartments(SEED_DEPARTMENTS);
      setEmployees(SEED_EMPLOYEES);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const openAddDept = () => {
    setEditingDept(null);
    setName('');
    setDescription('');
    setHeadName('Suresh Reddy');
    setHeadEmail('suresh@company.com');
    setShowModal(true);
  };

  const openEditDept = (dept: Department) => {
    setEditingDept(dept);
    setName(dept.name);
    setDescription(dept.description || '');
    setHeadName(dept.department_head?.full_name || 'Suresh Reddy');
    setHeadEmail(dept.department_head?.email || 'suresh@company.com');
    setShowModal(true);
  };

  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setSaving(true);
    try {
      if (editingDept) {
        setDepartments(
          departments.map((d) =>
            d.id === editingDept.id ? { ...d, name, description } : d
          )
        );
        if (selectedDept && selectedDept.id === editingDept.id) {
          setSelectedDept({ ...selectedDept, name, description });
        }
      } else {
        const newDept: Department = {
          id: crypto.randomUUID(),
          name,
          description,
          employee_count: 5,
        };
        setDepartments([...departments, newDept]);
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDepartment = (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    setDepartments(departments.filter((d) => d.id !== id));
    if (selectedDept?.id === id) setSelectedDept(null);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberEmail) return;
    const newEmp: Profile = {
      id: crypto.randomUUID(),
      full_name: newMemberName,
      email: newMemberEmail,
      job_title: newMemberRole,
      department_id: selectedDept?.id,
      department: selectedDept,
      role: 'employee',
      employment_status: 'active',
      date_of_joining: new Date().toISOString().split('T')[0],
      phone: '9876543220',
    };
    setEmployees([...employees, newEmp]);
    setShowAddMemberModal(false);
    setNewMemberName('');
    setNewMemberEmail('');
  };

  const filteredDepts = departments.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.description && d.description.toLowerCase().includes(search.toLowerCase()))
  );

  // Department heads mapping matching Phase 3 Card 3
  const getDeptHead = (deptName: string) => {
    switch (deptName) {
      case 'Engineering':
        return { name: 'Suresh Reddy', email: 'suresh@company.com', initials: 'SR' };
      case 'Data & AI':
        return { name: 'Jane Smith', email: 'jane@company.com', initials: 'JS' };
      case 'Operations':
        return { name: 'David Lee', email: 'david@company.com', initials: 'DL' };
      case 'HR':
        return { name: 'Priya Kumar', email: 'priya@company.com', initials: 'PK' };
      case 'Finance':
        return { name: 'Anita Desai', email: 'anita@company.com', initials: 'AD' };
      case 'Product':
        return { name: 'Vikram Singh', email: 'vikram@company.com', initials: 'VR' };
      case 'Marketing':
        return { name: 'Neha Gupta', email: 'neha@company.com', initials: 'NG' };
      case 'Infrastructure':
        return { name: 'Rohit Varma', email: 'rohit@company.com', initials: 'RV' };
      default:
        return { name: 'Alex Johnson', email: 'alex@company.com', initials: 'AJ' };
    }
  };

  // If in Department Details view (Phase 3 Card 4)
  if (selectedDept) {
    const head = getDeptHead(selectedDept.name);
    const deptMembers = employees.filter(
      (e) =>
        e.department_id === selectedDept.id ||
        (selectedDept.name === 'Engineering' &&
          ['Rahul Mehta', 'Arjun Nair', 'Sneha Patel', 'Karan Singh', 'Meera Iyer'].includes(e.full_name))
    );

    const filteredMembers = deptMembers.filter(
      (m) =>
        m.full_name.toLowerCase().includes(memberSearch.toLowerCase()) ||
        (m.job_title && m.job_title.toLowerCase().includes(memberSearch.toLowerCase()))
    );

    return (
      <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header matching Phase 3 Card 4 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedDept(null)}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {selectedDept.name} Department
                </h1>
                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{selectedDept.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openEditDept(selectedDept)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Department</span>
            </button>
            <button className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2-Column Split: Info Card & Team Members matching Phase 3 Card 4 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Department Information (4 cols) */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-900">Department Information</h3>

            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-2">
                Department Head
              </span>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                  {head.initials}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{head.name}</p>
                  <p className="text-[11px] text-slate-500">{head.email}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                  Total Employees
                </span>
                <p className="text-xl font-bold text-slate-900">{selectedDept.employee_count || 32}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                  Created Date
                </span>
                <p className="text-xs font-bold text-slate-900 pt-1">01 Jan 2024</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                Description
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedDept.name} department responsible for building and maintaining core products and platforms.
              </p>
            </div>
          </div>

          {/* Team Members Card (8 cols) matching Phase 3 Card 4 */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-900">Team Members</h3>
              <div className="flex items-center gap-3">
                <div className="relative w-48">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Search team members..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Member</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-5">Name</th>
                    <th className="py-3 px-5">Role</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50">
                      <td className="py-3 px-5 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                            {member.full_name.substring(0, 2).toUpperCase()}
                          </div>
                          <span>{member.full_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-5 text-slate-600">{member.job_title || 'Software Engineer'}</td>
                      <td className="py-3 px-5">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button className="p-1 text-slate-400 hover:text-blue-600">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1 text-slate-400 hover:text-blue-600">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              setEmployees(employees.filter((e) => e.id !== member.id))
                            }
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add Member Modal */}
        {showAddMemberModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Add Team Member to {selectedDept.name}</h3>
                <button onClick={() => setShowAddMemberModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="e.g. Arjun Nair"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="arjun@company.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role / Job Title</label>
                  <input
                    type="text"
                    required
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    placeholder="Senior Developer"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddMemberModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm"
                  >
                    Add Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main Department Directory View (Phase 3 Card 3)
  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header matching Phase 3 Card 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Department Management</h1>
          <p className="text-sm text-slate-500">Manage departments, department heads and team members</p>
        </div>
        {role === 'admin' && (
          <button
            onClick={openAddDept}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Department</span>
          </button>
        )}
      </div>

      {/* 4 Stat Cards matching Phase 3 Card 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Total Departments</span>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-slate-900">8</p>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              0%
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Active Departments</span>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-slate-900">8</p>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              0%
            </span>
          </div>
        </div>

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
          <span className="text-xs font-semibold text-slate-500">Average Team Size</span>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-slate-900">15</p>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              8%
            </span>
          </div>
        </div>
      </div>

      {/* Search Input matching Phase 3 Card 3 */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search departments..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          />
        </div>
      </div>

      {/* Departments Table matching Phase 3 Card 3 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Department</th>
                <th className="py-3.5 px-6">Head</th>
                <th className="py-3.5 px-6">Description</th>
                <th className="py-3.5 px-6">Employees</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredDepts.map((dept) => {
                const head = getDeptHead(dept.name);
                return (
                  <tr key={dept.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      <button
                        onClick={() => setSelectedDept(dept)}
                        className="text-left font-bold text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        {dept.name}
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                          {head.initials}
                        </div>
                        <span className="font-semibold text-slate-800">{head.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-500 max-w-sm">{dept.description}</td>
                    <td className="py-4 px-6 font-bold text-slate-900">{dept.employee_count || 12}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedDept(dept)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                          title="View Department Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {role === 'admin' && (
                          <>
                            <button
                              onClick={() => openEditDept(dept)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                              title="Edit Department"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteDepartment(dept.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                              title="Delete Department"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
      </div>

      {/* Add / Edit Department Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingDept ? 'Edit Department' : 'Create Department'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDepartment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Design & UX"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide department purpose..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
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
                  {saving ? 'Saving...' : 'Save Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
