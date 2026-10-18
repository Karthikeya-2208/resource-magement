import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
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
  Edit2,
  MoreVertical,
  Layers,
  FileText,
  Activity,
  AlertCircle,
  FolderKanban,
  Check,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatIndianNumber } from '../../lib/calculations';
import { SEED_PROJECTS, SEED_EMPLOYEES, SEED_ALLOCATIONS } from '../../lib/seedData';
import type { Project, Allocation, Expense, Profile } from '../../types';

interface ProjectDetailsPageProps {
  projectId: string;
  onBack: () => void;
  defaultTab?: 'overview' | 'team' | 'expenses' | 'milestones' | 'documents' | 'activity';
}

export const ProjectDetailsPage: React.FC<ProjectDetailsPageProps> = ({
  projectId,
  onBack,
  defaultTab = 'overview',
}) => {
  const { role, user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'expenses' | 'milestones' | 'documents' | 'activity'>(defaultTab);

  // Add Expense Modal (Card 5)
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState('1500000');
  const [expenseCategory, setExpenseCategory] = useState('Infrastructure');
  const [expenseDesc, setExpenseDesc] = useState('Cloud Server Costs');
  const [expenseDate, setExpenseDate] = useState('2026-04-05');
  const [submittingExpense, setSubmittingExpense] = useState(false);

  // Add Milestone Modal (Card 6)
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDate, setMilestoneDate] = useState('2026-05-15');
  const [milestonesList, setMilestonesList] = useState([
    { id: '1', title: 'Project Kickoff', date: '01 Jan 2026', status: 'Completed', progress: 100 },
    { id: '2', title: 'Requirements Analysis', date: '15 Jan 2026', status: 'Completed', progress: 100 },
    { id: '3', title: 'Design & Architecture', date: '28 Feb 2026', status: 'Completed', progress: 100 },
    { id: '4', title: 'Development Phase', date: '30 Apr 2026', status: 'In Progress', progress: 60 },
    { id: '5', title: 'UAT Testing', date: '15 May 2026', status: 'Pending', progress: 0 },
    { id: '6', title: 'Production Deployment', date: '30 Jun 2026', status: 'Pending', progress: 0 },
  ]);

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const { data: projData } = await supabase
        .from('projects')
        .select('*, manager:profiles!projects_project_manager_id_fkey(*), department:departments(*)')
        .eq('id', projectId)
        .single();

      if (projData) {
        setProject(projData);
      } else {
        const found = SEED_PROJECTS.find((p) => p.id === projectId) || SEED_PROJECTS[0];
        setProject(found);
      }

      const { data: allocData } = await supabase
        .from('allocations')
        .select('*, employee:profiles(*)')
        .eq('project_id', projectId);

      if (allocData && allocData.length) {
        setAllocations(allocData);
      } else {
        setAllocations(SEED_ALLOCATIONS.filter((a) => a.project_id === projectId || a.project_id === SEED_PROJECTS[0].id));
      }

      const { data: expData } = await supabase
        .from('expenses')
        .select('*, recorder:profiles(*)')
        .eq('project_id', projectId)
        .order('expense_date', { ascending: false });

      if (expData && expData.length) {
        setExpenses(expData);
      }
    } catch {
      const found = SEED_PROJECTS.find((p) => p.id === projectId) || SEED_PROJECTS[0];
      setProject(found);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  // Card 5 Recent Expenses sample dataset
  const [recentExpenses, setRecentExpenses] = useState([
    { id: '1', date: '05 Apr 2026', desc: 'Cloud Server Costs', amount: '₹15,00,000', category: 'Infrastructure', recordedBy: 'Rahul Mehta', status: 'Approved' },
    { id: '2', date: '28 Mar 2026', desc: 'Software Licenses', amount: '₹8,50,000', category: 'Software', recordedBy: 'Jane Smith', status: 'Approved' },
    { id: '3', date: '15 Mar 2026', desc: 'Consulting Services', amount: '₹12,00,000', category: 'Consulting', recordedBy: 'Rahul Mehta', status: 'Approved' },
    { id: '4', date: '02 Mar 2026', desc: 'Hardware Equipment', amount: '₹18,00,000', category: 'Hardware', recordedBy: 'David Lee', status: 'Pending' },
    { id: '5', date: '12 Feb 2026', desc: 'Training & Workshops', amount: '₹5,00,000', category: 'Training', recordedBy: 'Emily Chen', status: 'Approved' },
  ]);

  // Budget vs Expenses 6 months data matching Card 5
  const budgetVsExpensesChartData = [
    { month: 'Jan', Budget: 2.2, Expenses: 1.8 },
    { month: 'Feb', Budget: 2.0, Expenses: 1.4 },
    { month: 'Mar', Budget: 1.2, Expenses: 0.9 },
    { month: 'Apr', Budget: 1.4, Expenses: 1.0 },
    { month: 'May', Budget: 1.3, Expenses: 0.8 },
    { month: 'Jun', Budget: 1.8, Expenses: 1.5 },
  ];

  const handleRecordExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount) return;
    setSubmittingExpense(true);
    try {
      const newExp = {
        id: crypto.randomUUID(),
        date: new Date(expenseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        desc: expenseDesc,
        amount: `₹${formatIndianNumber(parseFloat(expenseAmount))}`,
        category: expenseCategory,
        recordedBy: user?.email ? user.email.split('@')[0] : 'Rahul Mehta',
        status: 'Approved',
      };
      setRecentExpenses([newExp, ...recentExpenses]);
      setShowExpenseModal(false);
    } finally {
      setSubmittingExpense(false);
    }
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle) return;
    const newM = {
      id: crypto.randomUUID(),
      title: milestoneTitle,
      date: new Date(milestoneDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Pending',
      progress: 0,
    };
    setMilestonesList([...milestonesList, newM]);
    setShowMilestoneModal(false);
    setMilestoneTitle('');
  };

  const projectName = project?.name || 'AI Analytics Platform';
  const projectDesc = project?.description || 'Build AI-powered analytics platform for enterprise data';
  const departmentName = project?.department?.name || 'Data & AI';
  const managerName = project?.manager?.full_name || 'Rahul Mehta';

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header matching Phase 4 Card 2 */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-all"
              title="Back to Projects"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-500/20">
              P
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{projectName}</h1>
                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{projectDesc}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveTab('expenses')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Edit Project</span>
            </button>
            <button className="p-2 rounded-xl text-slate-400 hover:text-slate-600 border border-slate-200 hover:bg-slate-50">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Details Bar matching Phase 4 Card 2 */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5 text-[11px]">Department</span>
            <span className="font-semibold text-slate-800">{departmentName}</span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5 text-[11px]">Project Manager</span>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold text-[9px] flex items-center justify-center">
                {managerName.substring(0, 2).toUpperCase()}
              </div>
              <span className="font-semibold text-slate-800">{managerName}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5 text-[11px]">Start Date</span>
            <span className="font-semibold text-slate-800">01 Jan 2026</span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5 text-[11px]">End Date</span>
            <span className="font-semibold text-slate-800">30 Jun 2026</span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5 text-[11px]">Budget</span>
            <span className="font-extrabold text-slate-900">₹2.0 Cr</span>
          </div>
        </div>

        {/* Navigation Subtabs matching Phase 4 Card 2 */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 text-xs font-semibold">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'team', label: 'Team & Allocation' },
            { id: 'expenses', label: 'Budget & Expenses' },
            { id: 'milestones', label: 'Milestones' },
            { id: 'documents', label: 'Documents' },
            { id: 'activity', label: 'Activity' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subtab 1: Overview matching Phase 4 Card 2 */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Project Progress & Checklist (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-semibold text-slate-500">Project Progress</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">60%</p>
              <div className="w-full bg-slate-100 h-2.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: '60%' }} />
              </div>
            </div>

            <div className="space-y-3 pt-3">
              {[
                { title: 'Requirements Analysis', status: 'Completed', color: 'text-emerald-600', isCheck: true },
                { title: 'Design & Architecture', status: 'Completed', color: 'text-emerald-600', isCheck: true },
                { title: 'Development', status: 'In Progress', color: 'text-blue-600', isDot: true },
                { title: 'Testing', status: 'Pending', color: 'text-slate-400', isCircle: true },
                { title: 'Deployment', status: 'Pending', color: 'text-slate-400', isCircle: true },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs">
                  <div className="flex items-center gap-3">
                    {item.isCheck && (
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                    {item.isDot && (
                      <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                      </div>
                    )}
                    {item.isCircle && <div className="w-4 h-4 rounded-full border border-slate-300" />}
                    <span className="font-semibold text-slate-800">{item.title}</span>
                  </div>
                  <span className={`font-semibold ${item.color}`}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Key Metrics (5 cols) matching Phase 4 Card 2 */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Key Metrics</h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50">
                <span className="text-slate-400 block mb-1">Total Allocation</span>
                <p className="text-xl font-extrabold text-slate-900">80%</p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '80%' }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 flex flex-col justify-between">
                <span className="text-slate-400 block mb-1">Team Members</span>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-500" />
                  <p className="text-xl font-extrabold text-slate-900">5</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50">
                <span className="text-slate-400 block mb-1">Total Expenses</span>
                <p className="text-xl font-extrabold text-slate-900">₹1.2 Cr</p>
                <span className="text-[10px] text-slate-400 font-semibold">60%</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50">
                <span className="text-slate-400 block mb-1">Remaining Budget</span>
                <p className="text-xl font-extrabold text-emerald-600">₹0.8 Cr</p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '40%' }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50">
                <span className="text-slate-400 block mb-1">Days Remaining</span>
                <p className="text-xl font-extrabold text-slate-900">75</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50">
                <span className="text-slate-400 block mb-1">Next Milestone</span>
                <p className="text-xs font-bold text-slate-900">UAT Testing</p>
                <span className="text-[10px] text-slate-400 block mt-0.5">15 May 2026</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Team & Allocation */}
      {activeTab === 'team' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Project Team & Allocation</h3>
            <span className="text-xs text-slate-500 font-medium">5 Active Engineers</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Allocation</th>
                  <th className="py-3 px-4">Start Date</th>
                  <th className="py-3 px-4">End Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {[
                  { name: 'Jane Smith', role: 'Software Engineer', alloc: 50, start: '01 Jan 2026', end: '30 Jun 2026', status: 'Active' },
                  { name: 'Emily Chen', role: 'ML Engineer', alloc: 60, start: '01 Jan 2026', end: '30 Jun 2026', status: 'Active' },
                  { name: 'Arjun Nair', role: 'Senior Developer', alloc: 40, start: '15 Jan 2026', end: '30 Jun 2026', status: 'Active' },
                  { name: 'Sneha Patel', role: 'Data Analyst', alloc: 30, start: '01 Feb 2026', end: '30 Jun 2026', status: 'Active' },
                  { name: 'Karan Singh', role: 'QA Engineer', alloc: 80, start: '01 Mar 2026', end: '30 Jun 2026', status: 'Active' },
                ].map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                          {m.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span>{m.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{m.role}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${m.alloc}%` }} />
                        </div>
                        <span className="font-semibold text-slate-800">{m.alloc}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{m.start}</td>
                    <td className="py-3.5 px-4 text-slate-500">{m.end}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 3: Budget & Expenses matching Phase 4 Card 5 */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Budget & Expenses</h2>
              <p className="text-xs text-slate-500">Track project budget, expenses and remaining amount</p>
            </div>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Chart & 6 KPI metrics (6 cols) */}
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Budget vs Expenses</h3>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgetVsExpensesChartData}>
                    <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}Cr`} />
                    <Tooltip formatter={(value) => [`₹${value} Cr`, '']} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="Budget" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Expenses" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* 6 Metric Cards matching Phase 4 Card 5 */}
              <div className="grid grid-cols-3 gap-3 text-xs pt-4 border-t border-slate-100">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-medium">Total Budget</span>
                  <p className="text-sm font-extrabold text-slate-900 mt-0.5">₹2.0 Cr</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-medium">Total Expenses</span>
                  <p className="text-sm font-extrabold text-slate-900 mt-0.5">₹1.2 Cr</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-medium">Remaining Budget</span>
                  <p className="text-sm font-extrabold text-emerald-600 mt-0.5">₹0.8 Cr</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-medium">Budget Utilization</span>
                  <p className="text-sm font-extrabold text-slate-900 mt-0.5">60%</p>
                  <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-medium">Monthly Burn Rate</span>
                  <p className="text-sm font-extrabold text-slate-900 mt-0.5">₹0.2 Cr</p>
                  <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '40%' }} />
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-medium">Projected Completion</span>
                  <p className="text-xs font-bold text-emerald-600 mt-1">On Track</p>
                </div>
              </div>
            </div>

            {/* Right: Recent Expenses Table (6 cols) matching Phase 4 Card 5 */}
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Recent Expenses</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Recorded By</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {recentExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{exp.date}</td>
                        <td className="py-3 px-3 font-semibold text-slate-900">{exp.desc}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">{exp.amount}</td>
                        <td className="py-3 px-3 text-slate-600">{exp.category}</td>
                        <td className="py-3 px-3 text-slate-600">{exp.recordedBy}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              exp.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {exp.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 4: Project Timeline & Milestones matching Phase 4 Card 6 */}
      {activeTab === 'milestones' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Project Timeline & Milestones</h2>
              <p className="text-xs text-slate-500">Track key milestones and deadlines</p>
            </div>
            <button
              onClick={() => setShowMilestoneModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Milestone</span>
            </button>
          </div>

          <div className="space-y-4">
            {milestonesList.map((m) => (
              <div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 text-xs border border-slate-200/60">
                <div className="flex items-center gap-3">
                  {m.status === 'Completed' && (
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                  {m.status === 'In Progress' && (
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
                    </div>
                  )}
                  {m.status === 'Pending' && <div className="w-6 h-6 rounded-full border-2 border-slate-300" />}

                  <div>
                    <span className="font-bold text-slate-900 text-sm block">{m.title}</span>
                    <span className="text-slate-400 text-[11px]">{m.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      m.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : m.status === 'In Progress'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {m.status}
                  </span>
                  <span className="font-bold text-slate-700 w-12 text-right">{m.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 5 & 6: Documents & Activity */}
      {(activeTab === 'documents' || activeTab === 'activity') && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm text-center py-12">
          <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800 capitalize">{activeTab} Section</h3>
          <p className="text-xs text-slate-400 mt-1">Artifacts and auditable events securely logged in Supabase.</p>
        </div>
      )}

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Project Expense</h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordExpense} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description *</label>
                <input
                  type="text"
                  required
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  placeholder="e.g. Cloud Server Costs"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  >
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Software">Software</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Training">Training</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingExpense}
                  className="px-5 py-2 font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20"
                >
                  {submittingExpense ? 'Saving...' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Milestone Modal */}
      {showMilestoneModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Project Milestone</h3>
              <button onClick={() => setShowMilestoneModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMilestone} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Milestone Name *</label>
                <input
                  type="text"
                  required
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
                  placeholder="e.g. Security Audit Signoff"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deadline Date *</label>
                <input
                  type="date"
                  required
                  value={milestoneDate}
                  onChange={(e) => setMilestoneDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMilestoneModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
