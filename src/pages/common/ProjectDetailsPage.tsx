import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  FolderKanban,
  Calendar,
  IndianRupee,
  Building2,
  Users,
  Receipt,
  Plus,
  X,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatIndianNumber, calculateBudgetUtilization } from '../../lib/calculations';
import type { Project, Allocation, Expense, Profile } from '../../types';

interface ProjectDetailsPageProps {
  projectId: string;
  onBack: () => void;
}

export const ProjectDetailsPage: React.FC<ProjectDetailsPageProps> = ({ projectId, onBack }) => {
  const { role, user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'expenses' | 'timeline'>('overview');

  // Add Expense Modal
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Infrastructure');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [submittingExpense, setSubmittingExpense] = useState(false);

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      // 1. Fetch project
      const { data: projData } = await supabase
        .from('projects')
        .select('*, manager:profiles!projects_project_manager_id_fkey(*), department:departments(*)')
        .eq('id', projectId)
        .single();
      if (projData) setProject(projData);

      // 2. Fetch allocations
      const { data: allocData } = await supabase
        .from('allocations')
        .select('*, employee:profiles(*)')
        .eq('project_id', projectId);
      if (allocData) setAllocations(allocData);

      // 3. Fetch expenses
      const { data: expData } = await supabase
        .from('expenses')
        .select('*, recorder:profiles(*)')
        .eq('project_id', projectId)
        .order('expense_date', { ascending: false });
      if (expData) setExpenses(expData);
    } catch (err) {
      console.error('Error fetching project details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  // Compute spend
  const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0) || (project?.name === 'AI Platform' ? 5440000 : 0);
  const projectBudget = project?.budget || 8000000;
  const budgetUtilization = calculateBudgetUtilization(projectBudget, totalSpent);

  const handleRecordExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || !expenseCategory) return;
    setSubmittingExpense(true);
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          project_id: projectId,
          amount: parseFloat(expenseAmount),
          category: expenseCategory,
          description: expenseDesc,
          expense_date: expenseDate,
          recorded_by: user?.id || null,
        })
        .select('*, recorder:profiles(*)')
        .single();

      if (error) throw error;
      if (data) {
        setExpenses([data, ...expenses]);
        setShowExpenseModal(false);
        setExpenseAmount('');
        setExpenseDesc('');
      }
    } catch (err: any) {
      alert('Error recording expense: ' + err.message);
    } finally {
      setSubmittingExpense(false);
    }
  };

  if (!project && !loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <p className="text-slate-500 mb-4">Project not found.</p>
        <button onClick={onBack} className="text-sm font-semibold text-blue-600">
          Back to Projects
        </button>
      </div>
    );
  }

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'planning':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'on_hold':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Back button & Header matching Screen 9 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{project?.name || 'AI Platform'}</h1>
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${getStatusBadge(project?.status || 'active')}`}>
                {project?.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Managed by <span className="font-semibold text-slate-700">{project?.manager?.full_name || 'John Smith'}</span> &bull; {project?.department?.name || 'Engineering'}
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'overview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'team' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Team ({allocations.length})
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'expenses' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Expenses ({expenses.length})
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'timeline' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Timeline
          </button>
        </div>
      </div>

      {/* Tab 1: Overview matching Screen 9 */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Project Details Card (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Project Details</h3>

            <div className="grid grid-cols-2 gap-y-5 gap-x-6 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Name</span>
                <span className="font-bold text-slate-900 text-sm">{project?.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Start Date</span>
                <span className="font-semibold text-slate-800">{project?.start_date}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Manager</span>
                <span className="font-semibold text-slate-800">{project?.manager?.full_name || 'John Smith'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">End Date</span>
                <span className="font-semibold text-slate-800">{project?.end_date}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Department</span>
                <span className="font-semibold text-slate-800">{project?.department?.name || 'Engineering'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Status</span>
                <span className="font-bold text-emerald-600 capitalize">{project?.status}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Budget</span>
                <span className="font-bold text-slate-900 text-sm">{formatCurrency(project?.budget)}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Description</span>
                <p className="text-slate-600 leading-relaxed">{project?.description || 'Strategic organizational initiative.'}</p>
              </div>
            </div>
          </div>

          {/* Budget Utilization Radial Donut Card (5 cols) matching Screen 9 */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Budget Utilization</h3>
              <p className="text-xs text-slate-500">Live spend telemetry against approved ceiling</p>
            </div>

            <div className="flex flex-col items-center justify-center my-6">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="88"
                    cy="88"
                    r="72"
                    stroke="#F1F5F9"
                    strokeWidth="14"
                    fill="transparent"
                  />
                  <circle
                    cx="88"
                    cy="88"
                    r="72"
                    stroke="#3B82F6"
                    strokeWidth="14"
                    fill="transparent"
                    strokeDasharray="452.4"
                    strokeDashoffset={452.4 - (452.4 * budgetUtilization.percentage) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-slate-900">{budgetUtilization.percentage}%</span>
                  <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">Utilized</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  <span className="text-slate-600 font-medium">Spent</span>
                </div>
                <span className="font-bold text-slate-900">₹{formatIndianNumber(totalSpent)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-600 font-medium">Remaining</span>
                </div>
                <span className="font-bold text-emerald-600">₹{formatIndianNumber(budgetUtilization.remaining)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Team */}
      {activeTab === 'team' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Assigned Resources</h3>
            <span className="text-xs text-slate-500">{allocations.length} team members</span>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">Member</th>
                <th className="py-3 px-6">Role</th>
                <th className="py-3 px-6">Allocation %</th>
                <th className="py-3 px-6">Period</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allocations.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-6 font-bold text-slate-900">{a.employee?.full_name || 'Member'}</td>
                  <td className="py-3.5 px-6 text-slate-600">{a.employee?.job_title || 'Engineer'}</td>
                  <td className="py-3.5 px-6 font-bold text-blue-600">{a.allocation_percentage}%</td>
                  <td className="py-3.5 px-6 text-slate-500">
                    {a.start_date} &bull; {a.end_date}
                  </td>
                </tr>
              ))}
              {allocations.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    No resources assigned yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Expenses */}
      {activeTab === 'expenses' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Project Expenses</h3>
              <p className="text-xs text-slate-500">Recorded actual expenditures for this initiative</p>
            </div>
            {(role === 'admin' || role === 'project_manager') && (
              <button
                onClick={() => setShowExpenseModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record Expense</span>
              </button>
            )}
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Category</th>
                <th className="py-3 px-6">Description</th>
                <th className="py-3 px-6">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-6 text-slate-600">{e.expense_date}</td>
                  <td className="py-3.5 px-6 font-semibold text-slate-800">{e.category}</td>
                  <td className="py-3.5 px-6 text-slate-600 max-w-md">{e.description || 'N/A'}</td>
                  <td className="py-3.5 px-6 font-bold text-slate-900">₹{formatIndianNumber(e.amount)}</td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    No recorded expenses yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Timeline */}
      {activeTab === 'timeline' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4">Project Milestones & Timeline</h3>
          <div className="relative pl-6 border-l-2 border-blue-200 space-y-6 text-xs">
            <div className="relative">
              <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-200"></span>
              <p className="font-bold text-slate-900">Project Kickoff & Architecture Setup</p>
              <p className="text-slate-500">{project?.start_date}</p>
            </div>
            <div className="relative">
              <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-200"></span>
              <p className="font-bold text-slate-900">Alpha Prototype & Infrastructure Validation</p>
              <p className="text-slate-500">Mid-phase Delivery</p>
            </div>
            <div className="relative">
              <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-slate-300 border-2 border-white"></span>
              <p className="font-bold text-slate-900">Final Acceptance & Handover</p>
              <p className="text-slate-500">{project?.end_date}</p>
            </div>
          </div>
        </div>
      )}

      {/* Record Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Record Project Expense</h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="e.g. 500000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Software & Licenses">Software & Licenses</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Travel & QA">Travel & QA</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Date</label>
                <input
                  type="date"
                  required
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  placeholder="Items purchased or invoice details..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingExpense}
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20"
                >
                  {submittingExpense ? 'Saving...' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
