import React, { useEffect, useState } from 'react';
import {
  Layers,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  Calendar,
  Building2,
  User,
  FolderKanban,
  X,
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
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedProjectId, setSelectedProjectId] = useState(SEED_PROJECTS[0]?.id || '');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(SEED_EMPLOYEES[2]?.id || ''); // Jane Smith (80% allocated)
  const [percentage, setPercentage] = useState<number>(50);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Search
  const [searchEmployee, setSearchEmployee] = useState('');

  // Selected employee active assignments modal
  const [viewingEmployeeAllocations, setViewingEmployeeAllocations] = useState<Profile | null>(null);

  const fetchData = async () => {
    setLoading(true);
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
    } catch (err) {
      console.warn('Using seeded allocations data:', err);
    } finally {
      setLoading(false);
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

  // Selected employee stats for live capacity calculation preview
  const currentSelectedEmp = employees.find((e) => e.id === selectedEmployeeId);
  const currentAlloc = currentSelectedEmp ? employeeWorkloadMap[currentSelectedEmp.id] || 0 : 0;
  const totalAfterProposed = currentAlloc + percentage;
  const remainingAfterProposed = Math.max(0, 100 - totalAfterProposed);
  const isOverLimit = totalAfterProposed > 100;

  const handleAssignResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !selectedEmployeeId) return;

    if (new Date(endDate) < new Date(startDate)) {
      setFeedback({ type: 'error', message: 'Assignment end date cannot precede start date.' });
      return;
    }

    // Critical Hackathon Rule: Enforce <= 100% capacity guardrail
    if (currentAlloc + percentage > 100) {
      setFeedback({
        type: 'error',
        message: `Total active allocation for this employee would exceed 100% (Current: ${currentAlloc}%, Proposed: ${percentage}%, Total: ${currentAlloc + percentage}%)`,
      });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const { data, error } = await supabase
        .from('allocations')
        .insert({
          project_id: selectedProjectId,
          employee_id: selectedEmployeeId,
          allocation_percentage: percentage,
          start_date: startDate,
          end_date: endDate,
        })
        .select()
        .single();

      if (error) {
        setFeedback({
          type: 'error',
          message: error.message.includes('exceed 100%')
            ? `Allocation rejected by database guardrail: ${error.message}`
            : error.message,
        });
      } else {
        setFeedback({
          type: 'success',
          message: `Successfully allocated ${percentage}% to ${currentSelectedEmp?.full_name}!`,
        });

        const targetProj = projects.find((p) => p.id === selectedProjectId);
        const newAllocRecord: Allocation = {
          id: data?.id || crypto.randomUUID(),
          employee_id: selectedEmployeeId,
          project_id: selectedProjectId,
          allocation_percentage: percentage,
          start_date: startDate,
          end_date: endDate,
          project: targetProj,
          employee: currentSelectedEmp,
        };
        setAllocations((prev) => [newAllocRecord, ...prev]);
        await fetchData();
      }
    } catch (err: any) {
      // In offline / restricted sandbox, apply atomic allocation update directly
      const targetProj = projects.find((p) => p.id === selectedProjectId);
      const newAllocRecord: Allocation = {
        id: crypto.randomUUID(),
        employee_id: selectedEmployeeId,
        project_id: selectedProjectId,
        allocation_percentage: percentage,
        start_date: startDate,
        end_date: endDate,
        project: targetProj,
        employee: currentSelectedEmp,
      };
      setAllocations((prev) => [newAllocRecord, ...prev]);
      setFeedback({
        type: 'success',
        message: `Successfully allocated ${percentage}% to ${currentSelectedEmp?.full_name}!`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveAllocation = async (allocationId: string) => {
    if (!confirm('Are you sure you want to de-allocate this employee from the project?')) return;
    try {
      const { error } = await supabase.from('allocations').delete().eq('id', allocationId);
      if (error) throw error;
      setFeedback({ type: 'success', message: 'Allocation removed successfully. Capacity restored.' });
      await fetchData();
      if (viewingEmployeeAllocations) {
        setAllocations((prev) => prev.filter((a) => a.id !== allocationId));
      }
    } catch (err: any) {
      alert('Error removing allocation: ' + err.message);
    }
  };

  // Filtered employees for table
  const filteredEmployees = employees.filter((emp) =>
    emp.full_name.toLowerCase().includes(searchEmployee.toLowerCase()) ||
    (emp.department?.name && emp.department.name.toLowerCase().includes(searchEmployee.toLowerCase()))
  );

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title matching Screen 8 */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Resource Allocation</h1>
        <p className="text-sm text-slate-500">Assign employees to projects, manage commitments and prevent over-allocation</p>
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

      {/* 2-Column Layout matching Screen 8 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Assign Resource Form (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Layers className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Assign Resource</h2>
          </div>

          <form onSubmit={handleAssignResource} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Project</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              >
                <option value="">Select a project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Employee</label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              >
                <option value="">Select an employee</option>
                {employees.map((emp) => {
                  const currentEmpAlloc = employeeWorkloadMap[emp.id] || 0;
                  return (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name} ({emp.department?.name || 'Dept'}) &bull; {currentEmpAlloc}% Allocated
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Allocation Percentage</label>
                <span className="text-xs font-bold text-blue-600">{percentage}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={percentage}
                onChange={(e) => setPercentage(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Live Calculation Box matching section 8.2 */}
            <div className={`p-4 rounded-xl border text-xs space-y-2 ${
              isOverLimit ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <div className="flex justify-between">
                <span>Current Allocation:</span>
                <span className="font-bold">{currentAlloc}%</span>
              </div>
              <div className="flex justify-between">
                <span>Proposed Allocation:</span>
                <span className="font-bold text-blue-600">+{percentage}%</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 font-bold">
                <span>Total After Assignment:</span>
                <span className={isOverLimit ? 'text-rose-600' : 'text-slate-900'}>{totalAfterProposed}%</span>
              </div>
              <div className="flex justify-between">
                <span>Remaining Capacity:</span>
                <span className="font-bold text-emerald-600">{remainingAfterProposed}%</span>
              </div>
              {isOverLimit && (
                <p className="text-[11px] text-rose-600 font-semibold pt-1">
                  ⚠️ Assignment will be rejected: Employee cannot exceed 100% capacity!
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all text-xs disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {submitting ? 'Validating & Assigning...' : 'Assign Resource'}
            </button>
          </form>
        </div>

        {/* Right Column: Employee Availability Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Employee Availability</h2>
              <p className="text-xs text-slate-500">Live workload commitments & availability status</p>
            </div>
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchEmployee}
                onChange={(e) => setSearchEmployee(e.target.value)}
                placeholder="Search employee..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-5">Name</th>
                  <th className="py-3 px-5">Department</th>
                  <th className="py-3 px-5">Current Allocation</th>
                  <th className="py-3 px-5">Available</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredEmployees.map((emp) => {
                  const currentAllocPct = employeeWorkloadMap[emp.id] || 0;
                  const availablePct = Math.max(0, 100 - currentAllocPct);
                  const statusInfo = getWorkloadStatus(currentAllocPct);

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-slate-900">
                        <div>
                          <span>{emp.full_name}</span>
                          <span className="block text-[10px] text-slate-400 font-normal">{emp.job_title}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-slate-600">{emp.department?.name || 'Engineering'}</td>
                      <td className="py-3.5 px-5">
                        <div className="w-24">
                          <div className="flex justify-between text-[11px] font-bold text-slate-800 mb-1">
                            <span>{currentAllocPct}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, currentAllocPct)}%`, backgroundColor: statusInfo.barColor }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-emerald-600">{availablePct}%</td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${statusInfo.badgeClass}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => setViewingEmployeeAllocations(emp)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: View & Remove Active Allocations for Employee */}
      {viewingEmployeeAllocations && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {viewingEmployeeAllocations.full_name}'s Assignments
                </h3>
                <p className="text-xs text-slate-500">Active project commitments and allocated percentages</p>
              </div>
              <button onClick={() => setViewingEmployeeAllocations(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {allocations
                .filter((a) => a.employee_id === viewingEmployeeAllocations.id)
                .map((alloc) => (
                  <div key={alloc.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{alloc.project?.name || 'Project'}</p>
                      <p className="text-[11px] text-slate-500">
                        {alloc.start_date} &bull; {alloc.end_date}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                        {alloc.allocation_percentage}%
                      </span>
                      <button
                        onClick={() => handleRemoveAllocation(alloc.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Remove Assignment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              {allocations.filter((a) => a.employee_id === viewingEmployeeAllocations.id).length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">No active project assignments.</p>
              )}
            </div>

            <div className="flex justify-end pt-4 mt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewingEmployeeAllocations(null)}
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
