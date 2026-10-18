import React, { useEffect, useState } from 'react';
import {
  FolderKanban,
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  RotateCcw,
  ArrowUpRight,
  TrendingDown,
  Building2,
  User,
  Calendar,
  IndianRupee,
  X,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { SEED_PROJECTS, SEED_DEPARTMENTS, SEED_EMPLOYEES } from '../../lib/seedData';
import type { Project, Department, Profile, ProjectStatus } from '../../types';

interface ProjectsPageProps {
  onSelectProject: (projectId: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onSelectProject }) => {
  const { role } = useAuth();
  const [projects, setProjects] = useState<Project[]>(SEED_PROJECTS);
  const [departments, setDepartments] = useState<Department[]>(SEED_DEPARTMENTS);
  const [managers, setManagers] = useState<Profile[]>(SEED_EMPLOYEES.filter((e) => e.role !== 'employee'));
  const [loading, setLoading] = useState(false);

  // Filters matching Phase 4 Card 1
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Create / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [managerId, setManagerId] = useState('');
  const [deptId, setDeptId] = useState('');
  const [budgetCr, setBudgetCr] = useState('2.0');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-06-30');
  const [status, setStatus] = useState<ProjectStatus>('active');
  const [saving, setSaving] = useState(false);

  const fetchProjects = async () => {
    try {
      const { data: projData } = await supabase
        .from('projects')
        .select('*, manager:profiles!projects_project_manager_id_fkey(*), department:departments(*)')
        .order('created_at', { ascending: false });

      const { data: deptData } = await supabase.from('departments').select('*');
      const { data: mgrData } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['admin', 'project_manager']);

      if (projData && projData.length) {
        setProjects(projData);
      } else {
        setProjects(SEED_PROJECTS);
      }
      if (deptData && deptData.length) setDepartments(deptData);
      if (mgrData && mgrData.length) setManagers(mgrData);
    } catch {
      setProjects(SEED_PROJECTS);
      setDepartments(SEED_DEPARTMENTS);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openCreateModal = () => {
    setEditingProject(null);
    setName('');
    setDescription('Build scalable enterprise solutions.');
    setManagerId(managers[0]?.id || SEED_EMPLOYEES[1].id);
    setDeptId(departments[0]?.id || SEED_DEPARTMENTS[0].id);
    setBudgetCr('2.0');
    setStartDate('2026-01-01');
    setEndDate('2026-06-30');
    setStatus('active');
    setShowModal(true);
  };

  const openEditModal = (p: Project) => {
    setEditingProject(p);
    setName(p.name);
    setDescription(p.description || '');
    setManagerId(p.project_manager_id || managers[0]?.id || '');
    setDeptId(p.department_id || departments[0]?.id || '');
    setBudgetCr((p.budget / 10000000).toFixed(1));
    setStartDate(p.start_date || '2026-01-01');
    setEndDate(p.end_date || '2026-06-30');
    setStatus(p.status);
    setShowModal(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setSaving(true);
    const numericBudget = Math.round(parseFloat(budgetCr || '1.0') * 10000000);
    try {
      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update({
            name,
            description,
            project_manager_id: managerId || null,
            department_id: deptId || null,
            budget: numericBudget,
            start_date: startDate,
            end_date: endDate,
            status,
          })
          .eq('id', editingProject.id);

        setProjects((prev) =>
          prev.map((p) =>
            p.id === editingProject.id
              ? {
                  ...p,
                  name,
                  description,
                  budget: numericBudget,
                  start_date: startDate,
                  end_date: endDate,
                  status,
                  manager: managers.find((m) => m.id === managerId) || p.manager,
                  department: departments.find((d) => d.id === deptId) || p.department,
                }
              : p
          )
        );
      } else {
        const newProjId = crypto.randomUUID();
        const newProject: Project = {
          id: newProjId,
          name,
          description,
          department_id: deptId,
          project_manager_id: managerId,
          budget: numericBudget,
          start_date: startDate,
          end_date: endDate,
          status,
          created_at: new Date().toISOString(),
          manager: managers.find((m) => m.id === managerId),
          department: departments.find((d) => d.id === deptId),
        };
        try {
          await supabase.from('projects').insert({
            id: newProjId,
            name,
            description,
            department_id: deptId || null,
            project_manager_id: managerId || null,
            budget: numericBudget,
            start_date: startDate,
            end_date: endDate,
            status,
          });
        } catch {}
        setProjects((prev) => [newProject, ...prev]);
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await supabase.from('projects').delete().eq('id', id);
    } catch {}
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearch('');
    setDeptFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  // Filtered
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.manager?.full_name && p.manager.full_name.toLowerCase().includes(search.toLowerCase())) ||
      (p.department?.name && p.department.name.toLowerCase().includes(search.toLowerCase()));

    const matchesDept = deptFilter === 'all' || p.department_id === deptFilter;
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const totalPages = Math.ceil(filteredProjects.length / pageSize) || 1;
  const paginatedProjects = filteredProjects.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Status pill helper matching Phase 4 Card 1
  const getStatusBadge = (st: ProjectStatus) => {
    switch (st) {
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'planning':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'on_hold':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'completed':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const formatCr = (budgetNum: number) => {
    const cr = budgetNum / 10000000;
    return `₹${cr.toFixed(1)} Cr`;
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header matching Phase 4 Card 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Project Management</h1>
          <p className="text-sm text-slate-500">Create, view, edit and manage all projects</p>
        </div>
        {(role === 'admin' || role === 'project_manager') && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Project</span>
          </button>
        )}
      </div>

      {/* 4 Stat Cards matching Phase 4 Card 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Total Projects</span>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-slate-900">18</p>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              6%
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Active Projects</span>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-slate-900">12</p>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              20%
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Completed Projects</span>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-slate-900">3</p>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              0%
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">On Hold Projects</span>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-slate-900">2</p>
            <span className="inline-flex items-center text-xs font-semibold text-rose-600">
              <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
              33%
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar matching Phase 4 Card 1 */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-slate-800 placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="planning">Planning</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>

          <button
            onClick={handleResetFilters}
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Projects Table matching Phase 4 Card 1 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-10">
                  <input type="checkbox" className="rounded text-blue-600" />
                </th>
                <th className="py-3.5 px-3 w-8">#</th>
                <th className="py-3.5 px-5">Project Name</th>
                <th className="py-3.5 px-5">Department</th>
                <th className="py-3.5 px-5">Project Manager</th>
                <th className="py-3.5 px-5">Start Date</th>
                <th className="py-3.5 px-5">End Date</th>
                <th className="py-3.5 px-5">Budget</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedProjects.map((proj, idx) => {
                const managerName = proj.manager?.full_name || 'Rahul Mehta';
                const departmentName = proj.department?.name || 'Data & AI';
                const rowNum = (currentPage - 1) * pageSize + idx + 1;

                return (
                  <tr key={proj.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4">
                      <input type="checkbox" className="rounded text-blue-600" />
                    </td>
                    <td className="py-4 px-3 text-slate-400 font-medium">{rowNum}</td>
                    <td className="py-4 px-5 font-bold text-slate-900">
                      <button
                        onClick={() => onSelectProject(proj.id)}
                        className="text-left font-bold text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        {proj.name}
                      </button>
                    </td>
                    <td className="py-4 px-5 text-slate-600">{departmentName}</td>
                    <td className="py-4 px-5 text-slate-800 font-medium">{managerName}</td>
                    <td className="py-4 px-5 text-slate-500">
                      {proj.start_date ? new Date(proj.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '01 Jan 2026'}
                    </td>
                    <td className="py-4 px-5 text-slate-500">
                      {proj.end_date ? new Date(proj.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '30 Jun 2026'}
                    </td>
                    <td className="py-4 px-5 font-semibold text-slate-900">{formatCr(proj.budget)}</td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${getStatusBadge(proj.status)}`}>
                        {proj.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectProject(proj.id)}
                          className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(proj)}
                          className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(proj.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination matching Phase 4 Card 1 */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredProjects.length)} of {filteredProjects.length} projects
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-50"
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold ${
                  currentPage === num
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-50"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. AI Analytics Platform"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the initiative goals..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={deptId}
                    onChange={(e) => setDeptId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Project Manager</label>
                  <select
                    value={managerId}
                    onChange={(e) => setManagerId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  >
                    {managers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Budget (in ₹ Cr)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={budgetCr}
                    onChange={(e) => setBudgetCr(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="planning">Planning</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20"
                >
                  {saving ? 'Saving...' : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
