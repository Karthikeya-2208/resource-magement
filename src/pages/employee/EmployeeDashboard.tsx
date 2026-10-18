import React, { useState } from 'react';
import {
  FolderKanban,
  Award,
  Sparkles,
  Plus,
  Calendar,
  X,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';

export const EmployeeDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'projects' | 'skills' | 'certs' | 'achievements'>('projects');

  // Add Skill Modal
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [skillList, setSkillList] = useState([
    'Python',
    'Machine Learning',
    'AWS',
    'Data Analysis',
    'SQL',
    'Docker',
  ]);

  // Add Cert Modal
  const [showAddCert, setShowAddCert] = useState(false);
  const [newCertTitle, setNewCertTitle] = useState('');
  const [newCertOrg, setNewCertOrg] = useState('');
  const [certList, setCertList] = useState([
    { name: 'AWS Cloud Practitioner', expires: 'Jan 2025', status: 'Valid', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { name: 'Google Data Analytics', expires: 'Oct 2024', status: 'Expired', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  ]);

  // Utilization Line Chart (Next 6 Months)
  const utilizationLineData = [
    { month: 'Jan', utilization: 50 },
    { month: 'Feb', utilization: 60 },
    { month: 'Mar', utilization: 75 },
    { month: 'Apr', utilization: 80 },
    { month: 'May', utilization: 80 },
    { month: 'Jun', utilization: 80 },
  ];

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill) return;
    setSkillList([...skillList, newSkill]);
    setNewSkill('');
    setShowAddSkill(false);
  };

  const handleAddCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCertTitle) return;
    setCertList([
      ...certList,
      { name: newCertTitle, expires: 'Dec 2026', status: 'Valid', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    ]);
    setNewCertTitle('');
    setShowAddCert(false);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Profile Card matching Phase 5 Card 3 */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            JS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Jane Smith</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                <Shield className="w-3 h-3" />
                Employee
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Software Engineer &bull; Data & AI Department</p>
          </div>
        </div>

        {/* Capacity Stat Pill */}
        <div className="flex items-center gap-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block">Total Allocation</span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xl font-extrabold text-slate-900">80%</span>
              <div className="w-28 bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '80%' }} />
              </div>
            </div>
          </div>
          <div className="border-l border-slate-200 pl-6">
            <span className="text-[11px] text-slate-400 font-semibold block">Remaining Capacity</span>
            <span className="text-xl font-extrabold text-emerald-600 mt-1 block">20%</span>
          </div>
        </div>
      </div>

      {/* Navigation Subtabs matching Phase 5 Card 3 */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        {[
          { id: 'projects', label: 'My Projects' },
          { id: 'skills', label: 'Skills' },
          { id: 'certs', label: 'Certifications' },
          { id: 'achievements', label: 'Achievements' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Projects Table & Line Chart (Left) + Skills & Certs (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: My Projects + Utilization Chart (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Projects Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Assigned Initiatives</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Project</th>
                    <th className="py-2.5 px-4">Allocation</th>
                    <th className="py-2.5 px-4">Start Date</th>
                    <th className="py-2.5 px-4">End Date</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">AI Analytics Platform</td>
                    <td className="py-3 px-4 font-bold text-slate-900">60%</td>
                    <td className="py-3 px-4 text-slate-500">01 Jan 2026</td>
                    <td className="py-3 px-4 text-slate-500">30 Jun 2026</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">Mobile App Revamp</td>
                    <td className="py-3 px-4 font-bold text-slate-900">20%</td>
                    <td className="py-3 px-4 text-slate-500">01 Jul 2026</td>
                    <td className="py-3 px-4 text-slate-500">31 Dec 2026</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Utilization Line Chart matching Phase 5 Card 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">My Utilization (Next 6 Months)</h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={utilizationLineData}>
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Utilization']} />
                  <Line
                    type="monotone"
                    dataKey="utilization"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#3B82F6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Skills & Certifications (4 cols) matching Phase 5 Card 3 */}
        <div className="lg:col-span-4 space-y-6">
          {/* My Skills Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">My Skills</h3>
              <button
                onClick={() => setShowAddSkill(true)}
                className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Skill</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skillList.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200/60"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* My Certifications Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">My Certifications</h3>
              <button
                onClick={() => setShowAddCert(true)}
                className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Certification</span>
              </button>
            </div>
            <div className="space-y-3">
              {certList.map((cert, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{cert.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cert.color}`}>
                      {cert.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block">Expires: {cert.expires}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Skill Modal */}
      {showAddSkill && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Skill</h3>
              <button onClick={() => setShowAddSkill(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSkill} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Skill Name *</label>
                <input
                  type="text"
                  required
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="e.g. Kubernetes, React, GraphQL"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSkill(false)}
                  className="px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                >
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Cert Modal */}
      {showAddCert && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Certification</h3>
              <button onClick={() => setShowAddCert(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddCert} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Certification Name *</label>
                <input
                  type="text"
                  required
                  value={newCertTitle}
                  onChange={(e) => setNewCertTitle(e.target.value)}
                  placeholder="e.g. Certified Kubernetes Administrator"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCert(false)}
                  className="px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                >
                  Save Certification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
