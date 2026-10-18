import React, { useEffect, useState } from 'react';
import {
  Layers,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  Edit2,
  Calendar,
  Building2,
  User,
  FolderKanban,
  X,
  Users,
  BarChart3,
  Check,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { getWorkloadStatus } from '../../lib/calculations';
import { SEED_EMPLOYEES, SEED_PROJECTS, SEED_ALLOCATIONS } from '../../lib/seedData';
import type { Project, Profile, Allocation } from '../../types';

export const ResourceAllocationPage: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Profile[]>(SEED_EMPLOYEES);
  const [projects, setProjects] = useState<Project[]>(SEED_PROJECTS);
  const [allocations, setAllocations] = useState<Allocation[]>(SEED_ALLOCATIONS);
  const [loading, setLoading] = useState(false);

  // Tab switcher: Card 3 vs Card 4 or stacked view
  const [activeView, setActiveView] = useState<'allocations' | 'workload'>('allocations');

  // Filters for Card 3
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Allocate Resource Modal (Card 3 "+ Allocate Resource")
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(SEED_PROJECTS[0]?.id || '');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(SEED_EMPLOYEES[2]?.id || ''); // Jane Smith (80%)
  const [percentage, setPercentage] = useState<number>(50);
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-06-30');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Availability Modal (Card 4 "View Availability")
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);

  const fetchData = async () => {
    try {
      const { data: empData } = await supabase
        .from('profiles')
        .select('*, department:departments(*)');
      const { data: projData } = await supabase
        .from('projects')
        .select('*')
        .in('status', ['planning', 'active']);
      const { data: allocData } = await supabase
        .from('allocations')
        .select('*, project:projects(*), employee:profiles(*)');

      if (empData && empData.length) setEmployees(empData);
      if (projData && projData.length) setProjects(projData);
      if (allocData && allocData.length) setAllocations(allocData);
    } catch {
      setEmployees(SEED_EMPLOYEES);
      setProjects(SEED_PROJECTS);
      setAllocations(SEED_ALLOCATIONS);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute total active allocation for each employee
  const employeeWorkloadMap: Record<string, number> = {};
  allocations.forEach((alloc) => {
    employeeWorkloadMap[alloc.employee_id] =
      (employeeWorkloadMap[alloc.employee_id] || 0) + alloc.allocation_percentage;
  });

  // Calculate stats for current selected employee in modal
  const currentSelectedEmp = employees.find((e) => e.id === selectedEmployeeId);
  const currentAlloc = currentSelectedEmp ? employeeWorkloadMap[currentSelectedEmp.id] || 0 : 0;
  const isOverLimit = currentAlloc + percentage > 100;

  const handleAssignResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !selectedEmployeeId) return;

    // Critical Capacity Check (≤ 100%)
    if (currentAlloc + percentage > 100) {
      setFeedback({
        type: 'error',
        message: `Total active allocation for this employee would exceed 100% (Current: ${currentAlloc}%, Proposed: ${percentage}%, Total: ${currentAlloc + percentage}%)`,
      });
      return;
    }

    setSubmitting(true);
    try {
      const newId = crypto.randomUUID();
      const targetProj = projects.find((p) => p.id === selectedProjectId);

      try {
        const { error } = await supabase.from('allocations').insert({
          id: newId,
          employee_id: selectedEmployeeId,
          project_id: selectedProjectId,
          allocation_percentage: percentage,
          start_date: startDate,
          end_date: endDate,
          status: 'active',
        });
        if (error) {
          setFeedback({ type: 'error', message: error.message });
          return;
        }
      } catch {}

      const newAllocRecord: Allocation = {
        id: newId,
        employee_id: selectedEmployeeId,
        project_id: selectedProjectId,
        allocation_percentage: percentage,
        start_date: startDate,
        end_date: endDate,
        status: 'active',
        project: targetProj,
        employee: currentSelectedEmp,
      };

      setAllocations([newAllocRecord, ...allocations]);
      setShowAllocateModal(false);
      setFeedback({
        type: 'success',
        message: `Successfully allocated ${percentage}% to ${currentSelectedEmp?.full_name}!`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAllocation = async (id: string) => {
    if (!confirm('Are you sure you want to remove this allocation?')) return;
    try {
      await supabase.from('allocations').delete().eq('id', id);
    } catch {}
    setAllocations(allocations.filter((a) => a.id !== id));
    setFeedback({ type: 'success', message: 'Allocation removed and capacity restored!' });
  };

  // Card 3 Allocations list
  const filteredAllocations = allocations.filter((alloc) => {
    const empName = alloc.employee?.full_name || '';
    const projName = alloc.project?.name || '';
    const deptName = alloc.employee?.department?.name || '';

    const matchesSearch =
      empName.toLowerCase().includes(search.toLowerCase()) ||
      projName.toLowerCase().includes(search.toLowerCase());

    const matchesDept = deptFilter === 'all' || alloc.employee?.department_id === deptFilter;
    const matchesProj = projectFilter === 'all' || alloc.project_id === projectFilter;
    const matchesStatus = statusFilter === 'all' || alloc.status === statusFilter;

    return matchesSearch && matchesDept && matchesProj && matchesStatus;
  });

  // Card 4 Team members workload list matching Phase 4 Card 4
  const teamWorkloadList = [
    { name: 'Jane Smith', role: 'Software Engineer', projAlloc: 50, workload: 60, remaining: 40, status: 'Available', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { name: 'Emily Chen', role: 'ML Engineer', projAlloc: 60, workload: 70, remaining: 30, status: 'Busy', statusColor: 'bg-amber-50 text-amber-700 border-amber-200' },
    { name: 'Arjun Nair', role: 'Senior Developer', projAlloc: 40, workload: 50, remaining: 50, status: 'Available', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { name: 'Sneha Patel', role: 'Data Analyst', projAlloc: 30, workload: 40, remaining: 60, status: 'Available', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { name: 'Karan Singh', role: 'QA Engineer', projAlloc: 80, workload: 90, remaining: 10, status: 'Overloaded', statusColor: 'bg-rose-50 text-rose-700 border-rose-200' },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* View Switcher Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('allocations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeView === 'allocations'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Resource Allocation (Card 3)
          </button>
          <button
            onClick={() => setActiveView('workload')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeView === 'workload'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Team Allocation & Workload (Card 4)
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Atomic &le;100% capacity rule active</span>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-semibold animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SECTION 1: Resource Allocation matching Phase 4 Card 3 */}
      {activeView === 'allocations' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Resource Allocation</h1>
              <p className="text-sm text-slate-500">Assign employees to projects and manage their allocation</p>
            </div>
            <button
              onClick={() => setShowAllocateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Allocate Resource</span>
            </button>
          </div>

          {/* Filter Bar matching Phase 4 Card 3 */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employees..."
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
                {employees
                  .map((e) => e.department)
                  .filter((d, i, arr) => d && arr.findIndex((x) => x?.id === d?.id) === i)
                  .map((d) => (
                    <option key={d!.id} value={d!.id}>
                      {d!.name}
                    </option>
                  ))}
              </select>

              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              >
                <option value="all">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
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
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Allocation Table matching Phase 4 Card 3 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-6">Employee</th>
                    <th className="py-3.5 px-6">Department</th>
                    <th className="py-3.5 px-6">Project</th>
                    <th className="py-3.5 px-6">Allocation</th>
                    <th className="py-3.5 px-6">Start Date</th>
                    <th className="py-3.5 px-6">End Date</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredAllocations.map((alloc) => {
                    const emp = alloc.employee || SEED_EMPLOYEES[2];
                    const proj = alloc.project || SEED_PROJECTS[0];
                    const dept = emp.department?.name || 'Engineering';

                    return (
                      <tr key={alloc.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                              {emp.full_name.substring(0, 2).toUpperCase()}
                            </div>
                            <span>{emp.full_name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-600">{dept}</td>
                        <td className="py-4 px-6 font-semibold text-slate-900">{proj.name}</td>
                        <td className="py-4 px-6">
                          <span className="font-bold text-slate-900">{alloc.allocation_percentage}%</span>
                        </td>
                        <td className="py-4 px-6 text-slate-500">
                          {alloc.start_date ? new Date(alloc.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '01 Jan 2026'}
                        </td>
                        <td className="py-4 px-6 text-slate-500">
                          {alloc.end_date ? new Date(alloc.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '30 Jun 2026'}
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedEmployeeId(alloc.employee_id);
                                setSelectedProjectId(alloc.project_id);
                                setPercentage(alloc.allocation_percentage);
                                setShowAllocateModal(true);
                              }}
                              className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                              title="Edit Allocation"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteAllocation(alloc.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Delete Allocation"
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
          </div>
        </div>
      )}

      {/* SECTION 2: Team Allocation & Workload matching Phase 4 Card 4 */}
      {activeView === 'workload' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Team Allocation & Workload</h1>
              <p className="text-sm text-slate-500">View team members, their allocation and current workload</p>
            </div>
            <button
              onClick={() => setShowAvailabilityModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
            >
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span>View Availability</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-6">Team Member</th>
                    <th className="py-3.5 px-6">Role</th>
                    <th className="py-3.5 px-6">Project Allocation</th>
                    <th className="py-3.5 px-6">Current Workload</th>
                    <th className="py-3.5 px-6">Remaining Capacity</th>
                    <th className="py-3.5 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {teamWorkloadList.map((tm, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                            {tm.name.substring(0, 2).toUpperCase()}
                          </div>
                          <span>{tm.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-medium">{tm.role}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-slate-900 w-8">{tm.projAlloc}%</span>
                          <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${tm.projAlloc}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-slate-900 w-8">{tm.workload}%</span>
                          <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                tm.workload > 85 ? 'bg-rose-500' : tm.workload > 60 ? 'bg-amber-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${tm.workload}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-slate-900 w-8">{tm.remaining}%</span>
                          <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                tm.remaining < 20 ? 'bg-rose-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${tm.remaining}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${tm.statusColor}`}>
                          {tm.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Allocate Resource Modal */}
      {showAllocateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Allocate Resource</h3>
              <button onClick={() => setShowAllocateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignResource} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Employee</label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                >
                  {employees.map((emp) => {
                    const alloc = employeeWorkloadMap[emp.id] || 0;
                    return (
                      <option key={emp.id} value={emp.id}>
                        {emp.full_name} ({alloc}% allocated) - {emp.job_title}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Dynamic Capacity Preview Banner */}
              <div
                className={`p-3.5 rounded-xl border text-xs ${
                  isOverLimit
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-blue-50 border-blue-200 text-blue-900'
                }`}
              >
                <div className="flex items-center justify-between font-bold mb-1.5">
                  <span>Capacity Projection:</span>
                  <span className={isOverLimit ? 'text-rose-600 font-extrabold' : 'text-blue-700'}>
                    Current: {currentAlloc}% &rarr; New Total: {currentAlloc + percentage}%
                  </span>
                </div>
                <div className="w-full bg-white/80 h-2 rounded-full overflow-hidden border">
                  <div
                    className={`h-full transition-all ${
                      isOverLimit ? 'bg-rose-600' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(100, currentAlloc + percentage)}%` }}
                  />
                </div>
                {isOverLimit && (
                  <p className="mt-1.5 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    Rejected: Total active allocation cannot exceed 100%.
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700">Allocation Percentage</label>
                  <span className="font-bold text-blue-700">{percentage}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={percentage}
                  onChange={(e) => setPercentage(parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                  onClick={() => setShowAllocateModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || isOverLimit}
                  className="px-5 py-2 font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl shadow-md shadow-blue-500/20"
                >
                  {submitting ? 'Allocating...' : 'Confirm Allocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Availability Modal */}
      {showAvailabilityModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Workforce Availability Matrix</h3>
              <button onClick={() => setShowAvailabilityModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800">
                <p className="font-bold">Available Engineers (&le;70% Allocated):</p>
                <p className="text-[11px] mt-0.5">Jane Smith (40% remaining), Arjun Nair (50% remaining), Sneha Patel (60% remaining)</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800">
                <p className="font-bold">High Commitment (&gt;70% Allocated):</p>
                <p className="text-[11px] mt-0.5">Emily Chen (70% workload)</p>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800">
                <p className="font-bold">Near Maximum Capacity (&ge;90% Allocated):</p>
                <p className="text-[11px] mt-0.5">Karan Singh (90% workload)</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
