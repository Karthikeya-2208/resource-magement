import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Calendar,
  X,
  TrendingDown,
  ArrowUpRight,
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
import { formatIndianNumber } from '../../lib/calculations';
import { useAuth } from '../../contexts/AuthContext';

export const ExpensesPage: React.FC = () => {
  const { user } = useAuth();
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('1500000');
  const [expenseCategory, setExpenseCategory] = useState('Infrastructure');
  const [expenseDate, setExpenseDate] = useState('2026-04-05');
  const [search, setSearch] = useState('');

  const [expenses, setExpenses] = useState([
    { id: '1', date: '05 Apr 2026', desc: 'Cloud Server Costs', amount: '₹15,00,000', category: 'Infrastructure', recordedBy: 'Rahul Mehta', status: 'Approved' },
    { id: '2', date: '28 Mar 2026', desc: 'Software Licenses', amount: '₹8,50,000', category: 'Software', recordedBy: 'Jane Smith', status: 'Approved' },
    { id: '3', date: '15 Mar 2026', desc: 'Consulting Services', amount: '₹12,00,000', category: 'Consulting', recordedBy: 'Rahul Mehta', status: 'Approved' },
    { id: '4', date: '02 Mar 2026', desc: 'Hardware Equipment', amount: '₹18,00,000', category: 'Hardware', recordedBy: 'David Lee', status: 'Pending' },
    { id: '5', date: '12 Feb 2026', desc: 'Training & Workshops', amount: '₹5,00,000', category: 'Training', recordedBy: 'Emily Chen', status: 'Approved' },
  ]);

  const budgetVsExpensesChartData = [
    { month: 'Jan', Budget: 2.2, Expenses: 1.8 },
    { month: 'Feb', Budget: 2.0, Expenses: 1.4 },
    { month: 'Mar', Budget: 1.2, Expenses: 0.9 },
    { month: 'Apr', Budget: 1.4, Expenses: 1.0 },
    { month: 'May', Budget: 1.3, Expenses: 0.8 },
    { month: 'Jun', Budget: 1.8, Expenses: 1.5 },
  ];

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseDesc || !expenseAmount) return;
    const newRecord = {
      id: crypto.randomUUID(),
      date: new Date(expenseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      desc: expenseDesc,
      amount: `₹${formatIndianNumber(parseFloat(expenseAmount))}`,
      category: expenseCategory,
      recordedBy: user?.email ? user.email.split('@')[0] : 'Rahul Mehta',
      status: 'Approved',
    };
    setExpenses([newRecord, ...expenses]);
    setShowExpenseModal(false);
  };

  const filteredExpenses = expenses.filter((e) =>
    e.desc.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase()) ||
    e.recordedBy.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header matching Phase 4 Card 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Budget & Expenses</h1>
          <p className="text-sm text-slate-500">Track project budget, expenses and remaining amount</p>
        </div>
        <button
          onClick={() => setShowExpenseModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Main Grid: Chart & 6 KPIs (Left) + Recent Expenses Table (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Bar Chart + 6 KPIs (6 cols) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Budget vs Expenses</h3>
            <span className="text-xs text-slate-400">Values in ₹ Cr</span>
          </div>

          <div className="h-60 w-full">
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
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '60%' }} />
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-medium">Monthly Burn Rate</span>
              <p className="text-sm font-extrabold text-slate-900 mt-0.5">₹0.2 Cr</p>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '40%' }} />
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-medium">Projected Completion</span>
              <p className="text-xs font-bold text-emerald-600 mt-1">On Track</p>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Expenses Table (6 cols) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Recent Expenses</h3>
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter expenses..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2.5 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

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
                {filteredExpenses.map((exp) => (
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

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Expense</h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4 text-xs">
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
                  className="px-5 py-2 font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
