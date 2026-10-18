import React, { useEffect, useState } from 'react';
import {
  FolderKanban,
  Users,
  Clock,
  ArrowUpRight,
  TrendingDown,
  Shield,
  Calendar,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { SEED_EMPLOYEES } from '../../lib/seedData';

interface ManagerDashboardProps {
  onNavigateTab: (tab: string, projectId?: string) => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ onNavigateTab }) => {
  const { user } = useAuth();

  // Donut: Project Status (My Projects)
  const myProjStatusData = [
    { name: 'Active', count: 5, color: '#10B981' },
    { name: 'Planning', count: 2, color: '#3B82F6' },
    { name: 'On Hold', count: 1, color: '#F59E0B' },
    { name: 'Completed', count: 0, color: '#64748B' },
  ];

  // Bar Chart: Budget vs Expenses (My Projects)
  const myBudgetVsExpensesData = [
    { month: 'Jan', Budget: 3.0, Expenses: 2.2 },
    { month: 'Feb', Budget: 2.8, Expenses: 2.0 },
    { month: 'Mar', Budget: 3.2, Expenses: 2.5 },
    { month: 'Apr', Budget: 3.0, Expenses: 2.4 },
    { month: 'May', Budget: 3.4, Expenses: 2.7 },
    { month: 'Jun', Budget: 3.8, Expenses: 3.0 },
  ];

  // Table: My Team Resource Allocation
  const teamAllocations = [
    { name: 'Jane Smith', dept: 'Data & AI', alloc: '100%', status: 'Fully Allocated', statusColor: 'bg-rose-50 text-rose-700 border-rose-200' },
    { name: 'David Lee', dept: 'Operations', alloc: '80%', status: 'High Workload', statusColor: 'bg-amber-50 text-amber-700 border-amber-200' },
    { name: 'Emily Chen', dept: 'Data & AI', alloc: '60%', status: 'Available', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { name: 'Priya Kumar', dept: 'Engineering', alloc: '50%', status: 'Available', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ];

  // List: Upcoming Deadlines
  const upcomingDeadlines = [
    { name: 'AI Analytics Platform', date: '15 Mar 2026' },
    { name: 'Mobile App Revamp', date: '31 Mar 2026' },
    { name: 'ERP Modernization', date: '20 Apr 2026' },
    { name: 'HR Automation', date: '05 May 2026' },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header matching Phase 5 Card 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Project Manager Dashboard</h1>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Shield className="w-3 h-3" />
            Project Manager
          </span>
        </div>
      </div>

      {/* Row 1: 4 Stat Cards matching Phase 5 Card 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">My Projects</span>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-slate-900">8</p>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              2 this month
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Active Projects</span>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-slate-900">5</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Total Budget</span>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-slate-900">₹8.2 Cr</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Total Expenses</span>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-slate-900">₹5.1 Cr</p>
          </div>
        </div>
      </div>

      {/* Row 2: 4 More Stat Cards matching Phase 5 Card 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Remaining Budget</span>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-emerald-600">₹3.1 Cr</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Budget Utilization</span>
          <div className="mt-2">
            <p className="text-2xl font-extrabold text-slate-900">62%</p>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: '62%' }} />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Team Members</span>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-slate-900">24</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Upcoming Deadlines</span>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-rose-600">3</p>
            <span className="text-xs font-semibold text-slate-400">in next 30 days</span>
          </div>
        </div>
      </div>

      {/* Row 3: Donut & Bar Chart matching Phase 5 Card 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Donut: Project Status (My Projects) (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Project Status (My Projects)</h3>
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
            <div className="w-44 h-44 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={myProjStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {myProjStatusData.map((entry, index) => (
                      <Cell key={`cell-pm-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-slate-900">8</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Projects</span>
              </div>
            </div>

            <div className="space-y-2 text-xs w-32">
              {myProjStatusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar Chart: Budget vs Expenses (My Projects) (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Budget vs Expenses (My Projects)</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={myBudgetVsExpensesData}>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}Cr`} />
                <Tooltip formatter={(value) => [`₹${value} Cr`, '']} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Bar dataKey="Budget" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: Team Allocation Table (Left) + Upcoming Deadlines (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: My Team Resource Allocation (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">My Team Resource Allocation</h3>
            <button
              onClick={() => onNavigateTab('allocations')}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Manage Allocations &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Employee</th>
                  <th className="py-2.5 px-4">Department</th>
                  <th className="py-2.5 px-4">Allocation</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {teamAllocations.map((tm, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                          {tm.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span>{tm.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{tm.dept}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{tm.alloc}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${tm.statusColor}`}>
                        {tm.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Upcoming Deadlines (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Upcoming Deadlines</h3>
          <div className="space-y-3">
            {upcomingDeadlines.map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">{item.name}</span>
                  <span className="text-[11px] text-slate-400">{item.date}</span>
                </div>
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
