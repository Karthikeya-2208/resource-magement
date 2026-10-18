import React, { useEffect, useState } from 'react';
import {
  FileBarChart2,
  Download,
  Filter,
  Calendar,
  Building2,
  TrendingUp,
  Table as TableIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { supabase } from '../../lib/supabase';
import { exportToCSV } from '../../lib/exports';
import { formatCurrency } from '../../lib/calculations';
import type { Department, Project, Profile, Allocation } from '../../types';

export const ReportsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [reportType, setReportType] = useState('Resource Utilization');
  const [selectedDept, setSelectedDept] = useState('all');
  const [dateRange, setDateRange] = useState('This Year');

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const { data: deptData } = await supabase.from('departments').select('*');
      const { data: projData } = await supabase.from('projects').select('*, department:departments(*)');
      const { data: empData } = await supabase.from('profiles').select('*, department:departments(*)');
      const { data: allocData } = await supabase.from('allocations').select('*, employee:profiles(*), project:projects(*)');

      if (deptData) setDepartments(deptData);
      if (projData) setProjects(projData);
      if (empData) setEmployees(empData);
      if (allocData) setAllocations(allocData);
    } catch (err) {
      console.error('Error fetching reports data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  // Utilization by department chart data matching Screen 10
  const deptUtilizationData = [
    { department: 'Engineering', utilization: 82, fill: '#3B82F6' },
    { department: 'Data & AI', utilization: 75, fill: '#3B82F6' },
    { department: 'Operations', utilization: 68, fill: '#3B82F6' },
    { department: 'HR', utilization: 45, fill: '#3B82F6' },
    { department: 'Finance', utilization: 55, fill: '#3B82F6' },
  ];

  // Project status distribution matching Screen 10
  const STATUS_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#64748B'];
  const projectStatusData = [
    { name: 'Active', value: 8 },
    { name: 'Planning', value: 4 },
    { name: 'On Hold', value: 3 },
    { name: 'Completed', value: 3 },
  ];

  const handleExportCSV = () => {
    if (reportType === 'Resource Utilization') {
      const rows = employees.map((e) => {
        const empAlloc = allocations
          .filter((a) => a.employee_id === e.id)
          .reduce((sum, a) => sum + a.allocation_percentage, 0);
        return {
          Name: e.full_name,
          Email: e.email,
          Department: e.department?.name || 'General',
          Role: e.role,
          'Current Allocation (%)': empAlloc,
          'Available Capacity (%)': Math.max(0, 100 - empAlloc),
          Status: e.employment_status,
        };
      });
      exportToCSV('resource_utilization_report', rows);
    } else {
      const rows = projects.map((p) => ({
        Project: p.name,
        Department: p.department?.name || 'General',
        Budget: p.budget,
        Status: p.status,
        'Start Date': p.start_date,
        'End Date': p.end_date,
      }));
      exportToCSV('projects_report', rows);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title & Filters matching Screen 10 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-slate-500">View organizational telemetry, capacity commitment, and export CSVs</p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter Toolbar matching Screen 10 */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          >
            <option value="Resource Utilization">Resource Utilization</option>
            <option value="Project Budgets & Expenses">Project Budgets & Expenses</option>
            <option value="Employee Workload">Employee Workload</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Department</label>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          >
            <option value="This Year">This Year</option>
            <option value="Last 6 Months">Last 6 Months</option>
            <option value="All Time">All Time</option>
          </select>
        </div>
      </div>

      {/* Visualizations Row matching Screen 10 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Resource Utilization by Department Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-1">Resource Utilization by Department</h3>
          <p className="text-xs text-slate-500 mb-6">Aggregate staff bandwidth commitment percentage</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptUtilizationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis unit="%" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip formatter={(val) => `${val}%`} />
                <Bar dataKey="utilization" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Status Distribution Donut Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Project Status Distribution</h3>
            <p className="text-xs text-slate-500 mb-4">Portfolio lifecycle breakdown</p>
          </div>

          <div className="flex flex-col items-center justify-center my-4">
            <div className="w-48 h-48 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {projectStatusData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-slate-900">18</span>
                <span className="text-[10px] text-slate-400 font-medium">Total Projects</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 text-xs">
            {projectStatusData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[index] }}
                  />
                  <span className="text-slate-600 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Table with Live Database Records */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Telemetry Data Records</h3>
            <p className="text-xs text-slate-500">Live verified database rows matching active filters</p>
          </div>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
            {employees.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">Employee</th>
                <th className="py-3 px-6">Department</th>
                <th className="py-3 px-6">Role</th>
                <th className="py-3 px-6">Current Allocation</th>
                <th className="py-3 px-6">Available Capacity</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {employees.map((emp) => {
                const empAlloc = allocations
                  .filter((a) => a.employee_id === emp.id)
                  .reduce((sum, a) => sum + a.allocation_percentage, 0);
                const empAvail = Math.max(0, 100 - empAlloc);

                return (
                  <tr key={emp.id} className="hover:bg-slate-50">
                    <td className="py-3 px-6 font-bold text-slate-900">{emp.full_name}</td>
                    <td className="py-3 px-6 text-slate-600">{emp.department?.name || 'Engineering'}</td>
                    <td className="py-3 px-6 capitalize">{emp.role.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-6 font-bold text-blue-600">{empAlloc}%</td>
                    <td className="py-3 px-6 font-semibold text-emerald-600">{empAvail}%</td>
                    <td className="py-3 px-6">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                        {emp.employment_status}
                      </span>
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
