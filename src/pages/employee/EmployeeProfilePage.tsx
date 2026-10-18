import React, { useEffect, useState } from 'react';
import {
  UserCheck,
  Building2,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  GitBranch,
  Shield,
  Award,
  CheckCircle2,
  Save,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Profile } from '../../types';

export const EmployeeProfilePage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [manager, setManager] = useState<Profile | null>(null);

  useEffect(() => {
    if (profile?.phone) setPhone(profile.phone);
    if (profile?.manager_id) {
      supabase
        .from('profiles')
        .select('*')
        .eq('id', profile.manager_id)
        .single()
        .then(({ data }) => {
          if (data) setManager(data);
        });
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    setSaving(true);
    setSuccess(false);
    try {
      // Employees are permitted to update their phone and personal info, but role/salary/dept are protected
      const { error } = await supabase
        .from('profiles')
        .update({
          phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert('Error updating profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Profile</h1>
        <p className="text-sm text-slate-500">View personal record, manage permitted contact info and inspect reporting lines</p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile contact details updated successfully.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-2xl font-bold flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20 mb-4">
            {profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : 'JS'}
          </div>
          <h2 className="text-lg font-bold text-slate-900">{profile?.full_name || 'Jane Smith'}</h2>
          <p className="text-xs text-slate-500">{profile?.job_title || 'Staff ML Engineer'}</p>
          <div className="mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
            {profile?.employment_status || 'Active'}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 text-left text-xs space-y-3">
            <div className="flex items-center gap-2.5 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="truncate">{profile?.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>{profile?.department?.name || 'Engineering'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Joined {profile?.date_of_joining || '2023-06-12'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Contact & Organizational Hierarchy (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          {/* Permitted Profile Edit */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1">Contact Information</h3>
            <p className="text-xs text-slate-500 mb-4">You may update your contact phone number</p>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email (Read-only)</label>
                  <input
                    type="email"
                    disabled
                    value={profile?.email || ''}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Contact'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Organizational Hierarchy matching Section 9.5 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <GitBranch className="w-4 h-4 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">Organizational Reporting Hierarchy</h3>
            </div>

            <div className="relative pl-6 border-l-2 border-blue-200 space-y-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Division Leadership</span>
                <p className="font-bold text-slate-900">Admin Administrator &bull; VP of Engineering & Operations</p>
                <p className="text-[11px] text-slate-500">Executive Department Head</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Direct Reporting Manager</span>
                <p className="font-bold text-slate-900">
                  {manager?.full_name || 'John Smith'} &bull; Senior Engineering Manager
                </p>
                <p className="text-[11px] text-slate-500">Project Manager & Technical Supervisor</p>
              </div>

              <div>
                <span className="text-[10px] text-blue-600 uppercase tracking-wider block font-bold">Current Persona</span>
                <p className="font-bold text-blue-700">
                  {profile?.full_name || 'Jane Smith'} &bull; {profile?.job_title || 'Staff ML Engineer'}
                </p>
                <p className="text-[11px] text-slate-500">{profile?.department?.name || 'Engineering'} Division</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
