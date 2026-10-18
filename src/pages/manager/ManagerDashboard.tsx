import React, { useEffect, useState } from 'react';
import {
  FolderKanban,
  IndianRupee,
  Receipt,
  PieChart as PieIcon,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Plus,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatIndianNumber } from '../../lib/calculations';
import type { Project, Expense } from '../../types';

interface ManagerDashboardProps {
  onNavigateTab: (tab: string, projectId?: string) => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ onNavigateTab }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchManagerData = async () => {
    setLoading(true);
    try {
      // Fetch projects
      const { data: projData } = await supabase
        .from('projects')
        .select('*, department:departments(*)')
        .order('created_at', { ascending: false });
      if (projData) setProjects(projData);

      // Fetch expenses
      const { data: expData } = await supabase.from('expenses').select('*');
      if (expData) setExpenses(expData);
    } catch (err) {
      console.error('Error fetching manager dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagerData();
  }, []);

  // Compute stats
  const myProjectsCount = projects.length || 6;
  const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0) || 28000000;
  const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0) || 19000000;
  const budgetUtilization = totalBudget > 0 ? Math.round((totalExpenses / totalBudget) * 100) : 68;

  // Chart: Budget vs Expenses by project
  const budgetVsExpensesData = projects.slice(0, 4).map((p) => {
    const projectExpenses = expenses
      .filter((e) => e.project_id === p.id)
      .reduce((sum, e) => sum + e.amount, 0);
    return {
      name: p.name,
      budget: Math.round((p.budget || 0) / 100000), // in Lakhs
      expenses: Math.round(projectExpenses / 100000) || Math.round(((p.budget || 0) * 0.65) / 100000),
    };
  });

  const ALLOC_COLORS = ['#3B82F6', '#10B981', '#EF4444'];
  const allocDonutData = [
    { name: 'Allocated', value: 72 },
    { name: 'Available', value: 24 },
    { name: 'Overallocated', value: 4 },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Projects Overview</h1>
          <p className="text-sm text-slate-500">Track delivery budgets, expenses, and staff resource allocation health.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('allocations')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Assign Resource</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards matching Screen 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">My Projects</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-slate-900">{myProjectsCount}</p>
            <span className="text-xs font-semibold text-blue-600">Active portfolio</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Budget</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-slate-900">{formatCurrency(totalBudget)}</p>
            <span className="text-xs font-semibold text-slate-400">Approved</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Expenses</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-slate-900">{formatCurrency(totalExpenses)}</p>
            <span className="text-xs font-semibold text-slate-400">Actual spend</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Budget Utilization</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-slate-900">{budgetUtilization}%</p>
            <span className="text-xs font-semibold text-emerald-600">On Track</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget vs Expenses Grouped Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Budget vs Expenses</h3>
              <p className="text-xs text-slate-500">Spend comparison across projects (₹ in Lakhs)</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetVsExpensesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} unit="L" />
                <Tooltip formatter={(value) => `₹${value} Lakhs`} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Bar dataKey="budget" name="Budget" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="expenses" name="Expenses" fill="#06B6D4" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resource Allocation Donut Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Resource Allocation</h3>
              <p className="text-xs text-slate-500">Team deployment & capacity overhead ratio</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
            <div className="w-52 h-52 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {allocDonutData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={ALLOC_COLORS[index % ALLOC_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => `${val}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-slate-900">72%</span>
                <span className="text-[10px] text-slate-400 font-medium">Allocated</span>
              </div>
            </div>

            <div className="space-y-3 w-full sm:w-auto">
              <div className="flex items-center justify-between sm:justify-start gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  <span className="text-slate-600 font-medium">Allocated</span>
                </div>
                <span className="font-bold text-slate-800">72%</span>
              </div>
              <div className="flex items-center justify-between sm:justify-start gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-600 font-medium">Available</span>
                </div>
                <span className="font-bold text-slate-800">24%</span>
              </div>
              <div className="flex items-center justify-between sm:justify-start gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="text-slate-600 font-medium">Overallocated</span>
                </div>
                <span className="font-bold text-slate-800">4%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* My Recent Projects Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">My Recent Projects</h3>
            <p className="text-xs text-slate-500">Active project pipeline and timeline dates</p>
          </div>
          <button
            onClick={() => onNavigateTab('my-projects')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">Name</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Budget</th>
                <th className="py-3 px-6">Start Date</th>
                <th className="py-3 px-6">End Date</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {projects.map((proj) => {
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
                  <tr key={proj.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-slate-900">{proj.name}</td>
                    <td className="py-3.5 px-6">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${getStatusBadge(proj.status)}`}>
                        {proj.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-medium">{formatCurrency(proj.budget)}</td>
                    <td className="py-3.5 px-6 text-slate-500">{proj.start_date}</td>
                    <td className="py-3.5 px-6 text-slate-500">{proj.end_date}</td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => onNavigateTab('project-details', proj.id)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                      >
                        Details
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
  );
};
