import React, { useEffect, useState } from 'react';
import {
  FolderKanban,
  Percent,
  BatteryCharging,
  Building2,
  Award,
  Sparkles,
  Plus,
  ExternalLink,
  Calendar,
  X,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { SEED_ALLOCATIONS, SEED_SKILLS, SEED_CERTS } from '../../lib/seedData';
import type { Allocation, Skill, Certification } from '../../types';

export const EmployeeDashboard: React.FC = () => {
  const { profile, user } = useAuth();
  const [allocations, setAllocations] = useState<Allocation[]>(
    SEED_ALLOCATIONS.filter((a) => a.employee_id === '33333333-3333-3333-3333-333333333333')
  );
  const [skills, setSkills] = useState<Skill[]>(SEED_SKILLS);
  const [certifications, setCertifications] = useState<Certification[]>(SEED_CERTS);
  const [loading, setLoading] = useState(true);

  // Add certification modal state
  const [showAddCertModal, setShowAddCertModal] = useState(false);
  const [newCertName, setNewCertName] = useState('');
  const [newCertOrg, setNewCertOrg] = useState('');
  const [newCertDate, setNewCertDate] = useState(new Date().toISOString().split('T')[0]);
  const [certSubmitting, setCertSubmitting] = useState(false);

  // Add skill modal state
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate');
  const [skillSubmitting, setSkillSubmitting] = useState(false);

  const fetchEmployeeData = async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      // 1. Fetch allocations with project details
      const { data: allocData } = await supabase
        .from('allocations')
        .select('*, project:projects(*)')
        .eq('employee_id', profile.id);
      if (allocData && allocData.length) {
        setAllocations(allocData);
      } else {
        setAllocations(SEED_ALLOCATIONS.filter((a) => a.employee_id === profile.id || a.employee_id === '33333333-3333-3333-3333-333333333333'));
      }

      // 2. Fetch skills
      const { data: skillData } = await supabase
        .from('skills')
        .select('*')
        .eq('employee_id', profile.id);
      if (skillData && skillData.length) setSkills(skillData);

      // 3. Fetch certifications
      const { data: certData } = await supabase
        .from('certifications')
        .select('*')
        .eq('employee_id', profile.id);
      if (certData && certData.length) setCertifications(certData);
    } catch (err) {
      console.warn('Using seeded employee data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, [profile?.id]);

  // Compute workload
  const totalAllocation = allocations.reduce((sum, a) => sum + a.allocation_percentage, 0) || 80;
  const availableCapacity = Math.max(0, 100 - totalAllocation);
  const departmentName = profile?.department?.name || 'Engineering';
  const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : 'Jane';

  const handleCreateCertification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id || !newCertName || !newCertOrg) return;
    setCertSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('certifications')
        .insert({
          employee_id: profile.id,
          certification_name: newCertName,
          issuing_organization: newCertOrg,
          issue_date: newCertDate,
        })
        .select()
        .single();

      if (error) {
        alert('Error adding certification: ' + error.message);
      } else if (data) {
        setCertifications([...certifications, data]);
        setShowAddCertModal(false);
        setNewCertName('');
        setNewCertOrg('');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setCertSubmitting(false);
    }
  };

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id || !newSkillName) return;
    setSkillSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('skills')
        .insert({
          employee_id: profile.id,
          skill_name: newSkillName,
          proficiency_level: newSkillLevel,
        })
        .select()
        .single();

      if (error) {
        alert('Error adding skill: ' + error.message);
      } else if (data) {
        setSkills([...skills, data]);
        setShowAddSkillModal(false);
        setNewSkillName('');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSkillSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner matching Screen 4 */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {firstName}! 👋
            </h1>
            <p className="text-blue-100 text-sm mt-1">Here's your work overview, project commitments, and verified skills.</p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs font-semibold border border-white/20">
            <Building2 className="w-4 h-4 text-blue-200" />
            <span>{departmentName} &bull; {profile?.job_title || 'Staff ML Engineer'}</span>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">My Projects</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-3">{allocations.length || 3}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Allocation</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-blue-600 mt-3">{totalAllocation}%</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Available Capacity</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BatteryCharging className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 mt-3">{availableCapacity}%</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Department</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-slate-900 mt-3 truncate">{departmentName}</p>
        </div>
      </div>

      {/* Main Grid: Left assignments and skills; Right utilization gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Project Assignments & Skills */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Assignments */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-slate-900">My Project Assignments</h3>
              <span className="text-xs font-semibold text-slate-400">Read-Only</span>
            </div>

            <div className="space-y-4">
              {allocations.map((alloc) => {
                const projectName = alloc.project?.name || 'Project';
                const status = alloc.project?.status || 'active';
                return (
                  <div key={alloc.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {projectName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{projectName}</p>
                          <p className="text-[11px] text-slate-500">
                            {alloc.start_date} &bull; {alloc.end_date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-blue-600">{alloc.allocation_percentage}%</span>
                        <p className="text-[10px] text-slate-400 capitalize">{status}</p>
                      </div>
                    </div>
                    {/* Allocation progress bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mt-3">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${alloc.allocation_percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skills and Certifications side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* My Skills */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">My Skills</h3>
                <button
                  onClick={() => setShowAddSkillModal(true)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Skill</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    <span>{s.skill_name}</span>
                    <span className="text-[10px] text-blue-400">({s.proficiency_level || 'Adv'})</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">Certifications</h3>
                <button
                  onClick={() => setShowAddCertModal(true)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Certification</span>
                </button>
              </div>
              <div className="space-y-3">
                {certifications.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{c.certification_name}</p>
                      <p className="text-[11px] text-slate-500">{c.issuing_organization}</p>
                      <p className="text-[10px] text-slate-400 mt-1">Issued: {c.issue_date || '2025'}</p>
                    </div>
                    <Award className="w-4 h-4 text-amber-500 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Circular My Utilization Gauge matching Screen 4 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">My Utilization</h3>
            <p className="text-xs text-slate-500">Active assigned capacity meter</p>
          </div>

          <div className="flex flex-col items-center justify-center my-6">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r="72"
                  stroke="#F1F5F9"
                  strokeWidth="14"
                  fill="transparent"
                />
                <circle
                  cx="88"
                  cy="88"
                  r="72"
                  stroke="#3B82F6"
                  strokeWidth="14"
                  fill="transparent"
                  strokeDasharray="452.4"
                  strokeDashoffset={452.4 - (452.4 * totalAllocation) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-slate-900">{totalAllocation}%</span>
                <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">Allocated</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span className="text-slate-600 font-medium">Allocated</span>
              </div>
              <span className="font-bold text-slate-800">{totalAllocation}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600 font-medium">Available</span>
              </div>
              <span className="font-bold text-slate-800">{availableCapacity}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Certification Modal */}
      {showAddCertModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add New Certification</h3>
              <button onClick={() => setShowAddCertModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCertification} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Certification Name</label>
                <input
                  type="text"
                  required
                  value={newCertName}
                  onChange={(e) => setNewCertName(e.target.value)}
                  placeholder="e.g. AWS Solutions Architect"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Issuing Organization</label>
                <input
                  type="text"
                  required
                  value={newCertOrg}
                  onChange={(e) => setNewCertOrg(e.target.value)}
                  placeholder="e.g. Amazon Web Services"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Date</label>
                <input
                  type="date"
                  value={newCertDate}
                  onChange={(e) => setNewCertDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddCertModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={certSubmitting}
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20"
                >
                  {certSubmitting ? 'Saving...' : 'Save Certification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Skill Modal */}
      {showAddSkillModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add New Skill</h3>
              <button onClick={() => setShowAddSkillModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSkill} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g. PyTorch, React, Docker"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Proficiency Level</label>
                <select
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddSkillModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={skillSubmitting}
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20"
                >
                  {skillSubmitting ? 'Saving...' : 'Save Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
