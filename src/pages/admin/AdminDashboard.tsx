import React, { useEffect, useState } from 'react';
import {
  Users,
  FolderKanban,
  Building2,
  Activity,
  ArrowUpRight,
  TrendingDown,
  RefreshCw,
  Shield,
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
import { supabase } from '../../lib/supabase';
import { SEED_EMPLOYEES, SEED_DEPARTMENTS, SEED_PROJECTS } from '../../lib/seedData';
import type { Department, Project, Profile } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Profile[]>(SEED_EMPLOYEES);
  const [departments, setDepartments] = useState<Department[]>(SEED_DEPARTMENTS);
  const [projects, setProjects] = useState<Project[]>(SEED_PROJECTS);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data: empData } = await supabase.from('profiles').select('*');
      const { data: deptData } = await supabase.from('departments').select('*');
      const { data: projData } = await supabase.from('projects').select('*');

      if (empData && empData.length) setEmployees(empData);
      if (deptData && deptData.length) setDepartments(deptData);
      if (projData && projData.length) setProjects(projData);
    } catch {
      setEmployees(SEED_EMPLOYEES);
      setDepartments(SEED_DEPARTMENTS);
      setProjects(SEED_PROJECTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Card 1 Donut 1: Employees by Department (Engineering 35, Data & AI 28, Operations 18, HR 12, Finance 15, Others 12)
  const deptDonutData = [
    { name: 'Engineering', count: 35, color: '#3B82F6' },
    { name: 'Data & AI', count: 28, color: '#06B6D4' },
    { name: 'Operations', count: 18, color: '#10B981' },
    { name: 'HR', count: 12, color: '#F59E0B' },
    { name: 'Finance', count: 15, color: '#8B5CF6' },
    { name: 'Others', count: 12, color: '#EC4899' },
  ];

  // Card 1 Donut 2: Project Status Distribution (Active 12, Planning 3, On Hold 2, Completed 1)
  const projStatusDonutData = [
    { name: 'Active', count: 12, color: '#10B981' },
    { name: 'Planning', count: 3, color: '#3B82F6' },
    { name: 'On Hold', count: 2, color: '#F59E0B' },
    { name: 'Completed', count: 1, color: '#64748B' },
  ];

  // Card 1 Bottom Left: Resource Utilization by Department (Eng 72%, Data & AI 58%, Ops 64%, HR 42%, Finance 55%)
  const deptUtilizationBarData = [
    { department: 'Eng', utilization: 72, fill: '#3B82F6' },
    { department: 'Data & AI', utilization: 58, fill: '#06B6D4' },
    { department: 'Ops', utilization: 64, fill: '#10B981' },
    { department: 'HR', utilization: 42, fill: '#8B5CF6' },
    { department: 'Finance', utilization: 55, fill: '#38BDF8' },
  ];

  // Card 1 Bottom Right: Budget vs Actual Expenses (Jan - Jun)
  const budgetVsExpensesData = [
    { month: 'Jan', Budget: 3.5, Expenses: 2.8 },
    { month: 'Feb', Budget: 3.2, Expenses: 2.5 },
    { month: 'Mar', Budget: 3.8, Expenses: 3.0 },
    { month: 'Apr', Budget: 3.4, Expenses: 2.7 },
    { month: 'May', Budget: 3.6, Expenses: 2.9 },
    { month: 'Jun', Budget: 4.0, Expenses: 3.2 },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header matching Phase 5 Card 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Dashboard (Organization Overview)</h1>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Shield className="w-3 h-3" />
            Admin
          </span>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 4 Overview Stat Cards matching Phase 5 Card 1 */}
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
          <span className="text-xs font-semibold text-slate-500">Departments</span>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-slate-900">8</p>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              0%
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Projects</span>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-slate-900">18</p>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              6%
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: 2 Donut Charts matching Phase 5 Card 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut 1: Employees by Department */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Employees by Department</h3>
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
            <div className="w-48 h-48 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {deptDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-slate-900">120</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Employees</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
              {deptDonutData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 font-medium">{item.name}</span>
                  <span className="font-bold text-slate-900 ml-auto">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Donut 2: Project Status Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Project Status Distribution</h3>
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
            <div className="w-48 h-48 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projStatusDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {projStatusDonutData.map((entry, index) => (
                      <Cell key={`cell-status-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-slate-900">18</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Projects</span>
              </div>
            </div>

            <div className="space-y-2 text-xs w-36">
              {projStatusDonutData.map((item) => (
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
      </div>

      {/* Row 3: 2 Bar Charts matching Phase 5 Card 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bottom Left: Resource Utilization by Department */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Resource Utilization by Department</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptUtilizationBarData}>
                <XAxis dataKey="department" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Utilization']} />
                <Bar dataKey="utilization" radius={[6, 6, 0, 0]}>
                  {deptUtilizationBarData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Right: Budget vs Actual Expenses */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Budget vs Actual Expenses</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetVsExpensesData}>
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
    </div>
  );
};
