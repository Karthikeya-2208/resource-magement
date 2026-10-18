import React, { useEffect, useState } from 'react';
import {
  FolderKanban,
  Search,
  Plus,
  Edit2,
  ExternalLink,
  X,
  Calendar,
  IndianRupee,
  Building2,
  User,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../lib/calculations';
import { SEED_PROJECTS, SEED_DEPARTMENTS, SEED_EMPLOYEES } from '../../lib/seedData';
import type { Project, Department, Profile, ProjectStatus } from '../../types';

interface ProjectsPageProps {
  onSelectProject: (projectId: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onSelectProject }) => {
  const { role } = useAuth();
  const [projects, setProjects] = useState<Project[]>(SEED_PROJECTS);
  const [departments, setDepartments] = useState<Department[]>(SEED_DEPARTMENTS);
  const [managers, setManagers] = useState<Profile[]>(SEED_EMPLOYEES.filter(e => e.role !== 'employee'));
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [managerId, setManagerId] = useState('');
  const [deptId, setDeptId] = useState('');
  const [budget, setBudget] = useState('5000000');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0]);
  const [status, setStatus] = useState<ProjectStatus>('active');
  const [saving, setSaving] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
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
    } catch (err) {
      console.warn('Error fetching projects, using seeds:', err);
      setProjects(SEED_PROJECTS);
      setDepartments(SEED_DEPARTMENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openCreateModal = () => {
    setEditingProject(null);
    setName('');
    setDescription('');
    setManagerId(managers[0]?.id || '');
    setDeptId(departments[0]?.id || '');
    setBudget('5000000');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0]);
    setStatus('active');
    setShowModal(true);
  };

  const openEditModal = (p: Project) => {
    setEditingProject(p);
    setName(p.name);
    setDescription(p.description || '');
    setManagerId(p.project_manager_id || managers[0]?.id || '');
    setDeptId(p.department_id || departments[0]?.id || '');
    setBudget(String(p.budget));
    setStartDate(p.start_date);
    setEndDate(p.end_date);
    setStatus(p.status);
    setShowModal(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate) return;
    if (new Date(endDate) < new Date(startDate)) {
      alert('End date cannot precede start date.');
      return;
    }
    setSaving(true);
    try {
      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update({
            name,
            description,
            project_manager_id: managerId || null,
            department_id: deptId || null,
            budget: parseFloat(budget) || 0,
            start_date: startDate,
            end_date: endDate,
            status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingProject.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('projects').insert({
          name,
          description,
          project_manager_id: managerId || null,
          department_id: deptId || null,
          budget: parseFloat(budget) || 0,
          start_date: startDate,
          end_date: endDate,
          status,
        });
        if (error) throw error;
      }
      await fetchProjects();
      setShowModal(false);
    } catch (err: any) {
      alert('Error saving project: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Filter logic
  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesDept = deptFilter === 'all' || p.department_id === deptFilter;
    return matchesSearch && matchesStatus && matchesDept;
  });

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
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title & Create matching Screen 7 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Projects</h1>
          <p className="text-sm text-slate-500">Manage initiatives, budgets, project managers and timelines</p>
        </div>
        {(role === 'admin' || role === 'project_manager') && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Project</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none capitalize"
          >
            <option value="all">All Status</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>

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
        </div>
      </div>

      {/* Projects Table matching Screen 7 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Name</th>
                <th className="py-3.5 px-6">Manager</th>
                <th className="py-3.5 px-6">Department</th>
                <th className="py-3.5 px-6">Budget</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProjects.map((proj) => {
                const managerName = proj.manager?.full_name || 'John Smith';
                const departmentName = proj.department?.name || 'Engineering';

                return (
                  <tr key={proj.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          {proj.name.substring(0, 2).toUpperCase()}
                        </div>
                        <button
                          onClick={() => onSelectProject(proj.id)}
                          className="font-bold text-slate-900 hover:text-blue-600 text-left"
                        >
                          {proj.name}
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-700">{managerName}</td>
                    <td className="py-4 px-6 text-slate-600">{departmentName}</td>
                    <td className="py-4 px-6 font-semibold text-slate-900">{formatCurrency(proj.budget)}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${getStatusBadge(proj.status)}`}>
                        {proj.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onSelectProject(proj.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          Details
                        </button>
                        {(role === 'admin' || role === 'project_manager') && (
                          <button
                            onClick={() => openEditModal(proj)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Edit Project"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Create / Edit Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Next-Gen Mobile App"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Project Manager</label>
                  <select
                    value={managerId}
                    onChange={(e) => setManagerId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {managers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={deptId}
                    onChange={(e) => setDeptId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Budget (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none capitalize"
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Initiative scope and deliverables..."
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
