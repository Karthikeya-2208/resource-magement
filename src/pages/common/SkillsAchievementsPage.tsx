import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Calendar,
  X,
  Shield,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const SkillsAchievementsPage: React.FC = () => {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<'skills' | 'certs' | 'achievements'>('skills');

  // Skills state matching Phase 5 Card 6
  const [skills, setSkills] = useState([
    { id: '1', name: 'Python', level: 'Expert', levelColor: 'bg-blue-600 text-white' },
    { id: '2', name: 'Machine Learning', level: 'Advanced', levelColor: 'bg-blue-500 text-white' },
    { id: '3', name: 'Data Analysis', level: 'Advanced', levelColor: 'bg-blue-500 text-white' },
    { id: '4', name: 'SQL', level: 'Intermediate', levelColor: 'bg-blue-400 text-white' },
    { id: '5', name: 'Docker', level: 'Intermediate', levelColor: 'bg-blue-400 text-white' },
  ]);

  // Achievements state matching Phase 5 Card 6
  const [achievements, setAchievements] = useState([
    { id: '1', title: 'Best Performer 2024', desc: 'Recognized for outstanding contribution', date: '15 Dec 2024' },
    { id: '2', title: 'Hackathon Winner', desc: 'Won 1st place in internal hackathon', date: '20 Aug 2024' },
    { id: '3', title: 'Open Source Contributor', desc: 'Contributed to AI tools', date: '10 Jul 2024' },
  ]);

  // Certifications state
  const [certifications, setCertifications] = useState([
    { id: '1', name: 'AWS Cloud Practitioner', org: 'Amazon Web Services', issueDate: '15 Jan 2023', expiryDate: '15 Jan 2026', status: 'Valid' },
    { id: '2', name: 'Google Professional Data Engineer', org: 'Google Cloud', issueDate: '10 Mar 2022', expiryDate: '10 Mar 2025', status: 'Valid' },
  ]);

  // Modals
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Advanced');

  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [newAchTitle, setNewAchTitle] = useState('');
  const [newAchDesc, setNewAchDesc] = useState('');
  const [newAchDate, setNewAchDate] = useState('2024-12-15');

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName) return;
    const color =
      newSkillLevel === 'Expert'
        ? 'bg-blue-600 text-white'
        : newSkillLevel === 'Advanced'
        ? 'bg-blue-500 text-white'
        : 'bg-blue-400 text-white';

    setSkills([
      ...skills,
      { id: crypto.randomUUID(), name: newSkillName, level: newSkillLevel, levelColor: color },
    ]);
    setNewSkillName('');
    setShowSkillModal(false);
  };

  const handleAddAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAchTitle) return;
    setAchievements([
      ...achievements,
      {
        id: crypto.randomUUID(),
        title: newAchTitle,
        desc: newAchDesc,
        date: new Date(newAchDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      },
    ]);
    setNewAchTitle('');
    setNewAchDesc('');
    setShowAchievementModal(false);
  };

  const handleDeleteSkill = (id: string) => {
    setSkills(skills.filter((s) => s.id !== id));
  };

  const handleDeleteAchievement = (id: string) => {
    setAchievements(achievements.filter((a) => a.id !== id));
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Skills, Certifications & Achievements</h1>
        <p className="text-sm text-slate-500">Track professional credentials, competencies, and verified team milestones</p>
      </div>

      {/* Navigation Subtabs matching Phase 5 Card 6 */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        {[
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

      {/* Section 1: Skills Management matching Phase 5 Card 6 */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Skills Management</h2>
          <button
            onClick={() => setShowSkillModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Skill</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Skill</th>
                <th className="py-2.5 px-4">Proficiency</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {skills.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{s.name}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-3 py-1 rounded-md text-[11px] font-semibold ${s.levelColor}`}>
                      {s.level}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1 text-slate-400 hover:text-blue-600">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteSkill(s.id)} className="p-1 text-slate-400 hover:text-rose-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Achievements matching Phase 5 Card 6 */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Achievements</h2>
          <button
            onClick={() => setShowAchievementModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Achievement</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Title</th>
                <th className="py-2.5 px-4">Description</th>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {achievements.map((ach) => (
                <tr key={ach.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{ach.title}</td>
                  <td className="py-3 px-4 text-slate-600">{ach.desc}</td>
                  <td className="py-3 px-4 text-slate-500">{ach.date}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDeleteAchievement(ach.id)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Skill Modal */}
      {showSkillModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Skill</h3>
              <button onClick={() => setShowSkillModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSkill} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Skill Name *</label>
                <input
                  type="text"
                  required
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g. Kubernetes, React, Golang"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Proficiency Level</label>
                <select
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                >
                  <option value="Expert">Expert</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Beginner">Beginner</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSkillModal(false)}
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

      {/* Add Achievement Modal */}
      {showAchievementModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Achievement</h3>
              <button onClick={() => setShowAchievementModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddAchievement} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={newAchTitle}
                  onChange={(e) => setNewAchTitle(e.target.value)}
                  placeholder="e.g. Employee of the Quarter"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newAchDesc}
                  onChange={(e) => setNewAchDesc(e.target.value)}
                  placeholder="Recognized for outstanding delivery..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={newAchDate}
                  onChange={(e) => setNewAchDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAchievementModal(false)}
                  className="px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                >
                  Save Achievement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
