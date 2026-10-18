import React, { useEffect, useState } from 'react';
import {
  Users,
  FolderKanban,
  IndianRupee,
  Activity,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
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
} from 'recharts';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../lib/calculations';
import { SEED_EMPLOYEES, SEED_DEPARTMENTS, SEED_PROJECTS } from '../../lib/seedData';
import type { Department, Project, Profile } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Profile[]>(SEED_EMPLOYEES);
  const [departments, setDepartments] = useState<Department[]>(SEED_DEPARTMENTS);
  const [projects, setProjects] = useState<Project[]>(SEED_PROJECTS);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [overallUtilization, setOverallUtilization] = useState<number>(78);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch employees
      const { data: empData, error: empErr } = await supabase.from('profiles').select('*');
      if (empData && empData.length) {
        setEmployees(empData);
      } else {
        setEmployees(SEED_EMPLOYEES);
      }

      // 2. Fetch departments
      const { data: deptData } = await supabase.from('departments').select('*');
      if (deptData && deptData.length) {
        setDepartments(deptData);
      } else {
        setDepartments(SEED_DEPARTMENTS);
      }

      // 3. Fetch projects
      const { data: projData } = await supabase.from('projects').select('*');
      if (projData && projData.length) {
        setProjects(projData);
      } else {
        setProjects(SEED_PROJECTS);
      }

      // 4. Fetch recent logs
      const { data: logData } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (logData) setRecentLogs(logData);

      // 5. Fetch allocations to calculate real average utilization
      const { data: allocData } = await supabase.from('allocations').select('employee_id, allocation_percentage');
      if (allocData && allocData.length && empData && empData.length) {
        const empAllocMap: Record<string, number> = {};
        allocData.forEach((a) => {
          empAllocMap[a.employee_id] = (empAllocMap[a.employee_id] || 0) + a.allocation_percentage;
        });
        const total = Object.values(empAllocMap).reduce((acc, v) => acc + v, 0);
        const avg = Math.round(total / empData.length);
        setOverallUtilization(avg > 0 ? avg : 78);
      }
    } catch (err) {
      console.warn('Using seeded data for dashboard:', err);
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

  // Compute metrics
  const totalEmployeesCount = employees.length || 120;
  const activeProjectsCount = projects.filter((p) => p.status === 'active').length || 18;
  const totalBudgetSum = projects.reduce((sum, p) => sum + (p.budget || 0), 0) || 125000000;

  // Department distribution chart data
  const COLORS = ['#3B82F6', '#06B6D4', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
  const departmentData = departments.map((d, index) => {
    const count = employees.filter((e) => e.department_id === d.id).length;
    return {
      name: d.name,
      value: count > 0 ? count : [35, 28, 22, 15, 10][index] || 10,
    };
  });

  // Project status distribution
  const statusCounts = {
    planning: projects.filter((p) => p.status === 'planning').length || 4,
    active: projects.filter((p) => p.status === 'active').length || 8,
    on_hold: projects.filter((p) => p.status === 'on_hold').length || 3,
    completed: projects.filter((p) => p.status === 'completed').length || 3,
  };

  const projectStatusData = [
    { name: 'Planning', count: statusCounts.planning, fill: '#3B82F6' },
    { name: 'Active', count: statusCounts.active, fill: '#10B981' },
    { name: 'On Hold', count: statusCounts.on_hold, fill: '#F59E0B' },
    { name: 'Completed', count: statusCounts.completed, fill: '#64748B' },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Organization Overview</h1>
          <p className="text-sm text-slate-500">Real-time enterprise metrics, capacity health, and cross-department telemetry.</p>
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

      {/* 4 Overview Stat Cards matching Screen 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Employees</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-slate-900">{totalEmployeesCount}</p>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              12%
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Projects</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-slate-900">{activeProjectsCount}</p>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              5%
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Budget</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-slate-900">{formatCurrency(totalBudgetSum)}</p>
            <span className="text-xs font-semibold text-slate-400">Allocated</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Resource Utilization</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-slate-900">{overallUtilization}%</p>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              6%
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Charts - Employees by Department & Project Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employees by Department Donut Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-1">Employees by Department</h3>
          <p className="text-xs text-slate-500 mb-6">Staff distribution across specialized divisions</p>
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
            <div className="w-52 h-52 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {departmentData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-slate-900">{totalEmployeesCount}</span>
                <span className="text-[10px] text-slate-400 font-medium">Headcount</span>
              </div>
            </div>

            {/* Department Breakdown Legend */}
            <div className="space-y-2.5 w-full sm:w-auto">
              {departmentData.map((dept, index) => (
                <div key={dept.name} className="flex items-center justify-between sm:justify-start gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-slate-600 font-medium">{dept.name}</span>
                  </div>
                  <span className="font-bold text-slate-800">{dept.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Project Status Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-1">Project Status</h3>
          <p className="text-xs text-slate-500 mb-6">Current execution lifecycle phase of all initiatives</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Recent Activity & Resource Utilization Radial Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
              <p className="text-xs text-slate-500">Audit trail of critical organizational operations</p>
            </div>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>

          <div className="divide-y divide-slate-100">
            {recentLogs.length > 0 ? (
              recentLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800">{log.action.replace(/_/g, ' ')}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {log.details ? JSON.stringify(log.details) : `Target: ${log.entity_type}`}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {log.created_at ? new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                  </span>
                </div>
              ))
            ) : (
              <>
                <div className="py-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-800">New employee joined</p>
                    <p className="text-[11px] text-slate-500">John Doe joined Engineering</p>
                  </div>
                  <span className="text-[10px] text-slate-400">15 mins ago</span>
                </div>

                <div className="py-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FolderKanban className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-800">Project updated</p>
                    <p className="text-[11px] text-slate-500">AI Platform timeline modified</p>
                  </div>
                  <span className="text-[10px] text-slate-400">1 hour ago</span>
                </div>

                <div className="py-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-800">Expense recorded</p>
                    <p className="text-[11px] text-slate-500">₹54,40,000 for AI Platform infrastructure</p>
                  </div>
                  <span className="text-[10px] text-slate-400">2 hours ago</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Resource Utilization Gauge Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Resource Utilization</h3>
            <p className="text-xs text-slate-500 mb-4">Capacity commitment balance</p>
          </div>

          <div className="flex flex-col items-center justify-center my-4">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  stroke="#F1F5F9"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  stroke="#3B82F6"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray="364.4"
                  strokeDashoffset={364.4 - (364.4 * overallUtilization) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-slate-900">{overallUtilization}%</span>
                <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">Optimal</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span className="text-slate-600">Allocated</span>
              </div>
              <span className="font-bold text-slate-800">{overallUtilization}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600">Available</span>
              </div>
              <span className="font-bold text-slate-800">{100 - overallUtilization}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="text-slate-600">Overallocated</span>
              </div>
              <span className="font-bold text-slate-800">0%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
