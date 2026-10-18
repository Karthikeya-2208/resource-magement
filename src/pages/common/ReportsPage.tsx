import React, { useState } from 'react';
import {
  FileBarChart2,
  Download,
  Calendar,
  Building2,
  TrendingUp,
  LineChart as LineChartIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { exportToCSV } from '../../lib/exports';

export const ReportsPage: React.FC = () => {
  const [activeReportTab, setActiveReportTab] = useState<
    'project' | 'employee' | 'utilization' | 'budget' | 'workload' | 'advanced'
  >('project');

  // Filters for Project Report (Card 4)
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [dateRange, setDateRange] = useState('Jan 2026 - Jun 2026');
  const [currentPage, setCurrentPage] = useState(1);

  // Filters for Advanced Analytics (Card 5)
  const [metricFilter, setMetricFilter] = useState('Resource Utilization');
  const [groupByFilter, setGroupByFilter] = useState('Department');

  // Dataset for Project Report Table matching Phase 5 Card 4
  const projectReportData = [
    { project: 'AI Analytics Platform', dept: 'Data & AI', manager: 'Rahul Mehta', status: 'Active', budget: '₹2.0 Cr', expenses: '₹1.2 Cr', util: 60, statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { project: 'Mobile App Revamp', dept: 'Engineering', manager: 'Jane Smith', status: 'Active', budget: '₹1.5 Cr', expenses: '₹0.7 Cr', util: 47, statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { project: 'ERP Modernization', dept: 'Operations', manager: 'David Lee', status: 'Planning', budget: '₹2.5 Cr', expenses: '₹2.1 Cr', util: 84, statusColor: 'bg-blue-50 text-blue-700 border-blue-200' },
    { project: 'Cloud Migration', dept: 'Infrastructure', manager: 'Emily Chen', status: 'On Hold', budget: '₹1.0 Cr', expenses: '₹0.5 Cr', util: 50, statusColor: 'bg-amber-50 text-amber-700 border-amber-200' },
    { project: 'HR Automation', dept: 'HR', manager: 'Priya Kumar', status: 'Active', budget: '₹0.8 Cr', expenses: '₹0.3 Cr', util: 38, statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { project: 'Customer Portal', dept: 'Product', manager: 'Arjun Nair', status: 'Completed', budget: '₹1.2 Cr', expenses: '₹0.9 Cr', util: 75, statusColor: 'bg-slate-100 text-slate-700 border-slate-200' },
  ];

  // Advanced Analytics Line Chart Data matching Phase 5 Card 5
  const resourceTrendData = [
    { month: 'Jan', Engineering: 62, DataAI: 50, Operations: 58, HR: 40, Finance: 52 },
    { month: 'Feb', Engineering: 68, DataAI: 55, Operations: 60, HR: 42, Finance: 54 },
    { month: 'Mar', Engineering: 74, DataAI: 62, Operations: 64, HR: 44, Finance: 58 },
    { month: 'Apr', Engineering: 70, DataAI: 65, Operations: 62, HR: 45, Finance: 60 },
    { month: 'May', Engineering: 76, DataAI: 70, Operations: 68, HR: 46, Finance: 62 },
    { month: 'Jun', Engineering: 82, DataAI: 75, Operations: 70, HR: 48, Finance: 65 },
  ];

  // Donut data for Department-wise Allocation matching Phase 5 Card 5
  const deptAllocationDonut = [
    { name: 'Engineering', count: 35, color: '#3B82F6' },
    { name: 'Data & AI', count: 28, color: '#06B6D4' },
    { name: 'Operations', count: 18, color: '#10B981' },
    { name: 'HR', count: 12, color: '#F59E0B' },
    { name: 'Finance', count: 15, color: '#8B5CF6' },
    { name: 'Others', count: 12, color: '#EC4899' },
  ];

  const handleExportCSV = () => {
    exportToCSV('project_performance_report', projectReportData);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {activeReportTab === 'advanced' ? 'Advanced Analytics' : 'Reports & Analytics'}
        </h1>
        <p className="text-sm text-slate-500">Cross-departmental telemetry, project performance, and workforce forecasting</p>
      </div>

      {/* Navigation Subtabs matching Phase 5 Card 4 & Card 5 */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2 text-xs font-semibold">
        {[
          { id: 'employee', label: 'Employee Report' },
          { id: 'project', label: 'Project Report' },
          { id: 'utilization', label: 'Resource Utilization' },
          { id: 'budget', label: 'Budget Report' },
          { id: 'workload', label: 'Workload Report' },
          { id: 'advanced', label: 'Advanced Analytics (Card 5)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReportTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeReportTab === tab.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SECTION 1: Project Report matching Phase 5 Card 4 */}
      {activeReportTab !== 'advanced' && (
        <div className="space-y-6">
          {/* Filter Bar with Export CSV button */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              >
                <option value="All Departments">All Departments</option>
                <option value="Data & AI">Data & AI</option>
                <option value="Engineering">Engineering</option>
                <option value="Operations">Operations</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="HR">HR</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              >
                <option value="All Status">All Status</option>
                <option value="Active">Active</option>
                <option value="Planning">Planning</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
              </select>

              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{dateRange}</span>
              </div>
            </div>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all ml-auto"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Table matching Phase 5 Card 4 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-6">Project</th>
                    <th className="py-3.5 px-6">Department</th>
                    <th className="py-3.5 px-6">Project Manager</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Budget</th>
                    <th className="py-3.5 px-6">Expenses</th>
                    <th className="py-3.5 px-6">Utilization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {projectReportData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">{row.project}</td>
                      <td className="py-4 px-6 text-slate-600">{row.dept}</td>
                      <td className="py-4 px-6 font-medium text-slate-800">{row.manager}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${row.statusColor}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-900">{row.budget}</td>
                      <td className="py-4 px-6 text-slate-700">{row.expenses}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 w-8">{row.util}%</span>
                          <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${row.util}%` }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination matching Phase 5 Card 4 */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Showing 1 to 6 of 18 projects</span>
              <div className="flex items-center gap-1.5">
                <button className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40">
                  &lt;
                </button>
                <button className="w-7 h-7 rounded-lg bg-blue-600 text-white font-semibold shadow-sm">1</button>
                <button className="w-7 h-7 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold">2</button>
                <button className="w-7 h-7 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold">3</button>
                <button className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100">
                  &gt;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Advanced Analytics matching Phase 5 Card 5 */}
      {activeReportTab === 'advanced' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-wrap items-center gap-3">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 block mb-0.5">Metric</label>
              <select
                value={metricFilter}
                onChange={(e) => setMetricFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              >
                <option value="Resource Utilization">Resource Utilization</option>
                <option value="Budget Spend">Budget Spend</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-400 block mb-0.5">Group By</label>
              <select
                value={groupByFilter}
                onChange={(e) => setGroupByFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              >
                <option value="Department">Department</option>
                <option value="Project">Project</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-400 block mb-0.5">Date Range</label>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Jan 2026 - Jun 2026</span>
              </div>
            </div>
          </div>

          {/* Line Chart: Resource Utilization Trend matching Phase 5 Card 5 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Resource Utilization Trend</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={resourceTrendData}>
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, '']} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="Engineering" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="DataAI" name="Data & AI" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="Operations" stroke="#F59E0B" strokeWidth={2} />
                  <Line type="monotone" dataKey="HR" stroke="#8B5CF6" strokeWidth={2} />
                  <Line type="monotone" dataKey="Finance" stroke="#EC4899" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Grid: Project Budget Utilization (Left) + Department-wise Allocation Donut (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Project Budget Utilization (6 cols) */}
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Project Budget Utilization</h3>
              <div className="space-y-4 pt-2">
                {[
                  { name: 'AI Analytics', util: 60, color: 'bg-blue-600' },
                  { name: 'Mobile App', util: 47, color: 'bg-emerald-500' },
                  { name: 'ERP Modernization', util: 84, color: 'bg-amber-500' },
                  { name: 'Cloud Migration', util: 50, color: 'bg-cyan-500' },
                  { name: 'HR Automation', util: 38, color: 'bg-rose-500' },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-800">{item.name}</span>
                      <span className="font-bold text-slate-900">{item.util}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.util}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Department-wise Allocation Donut (6 cols) */}
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Department-wise Allocation</h3>
              <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
                <div className="w-48 h-48 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deptAllocationDonut}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="count"
                      >
                        {deptAllocationDonut.map((entry, index) => (
                          <Cell key={`cell-adv-${index}`} fill={entry.color} />
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
                  {deptAllocationDonut.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600 font-medium">{item.name}</span>
                      <span className="font-bold text-slate-900 ml-auto">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
