import React, { useState } from 'react';
import { Search, Bell, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { CreateAccountModal } from '../admin/CreateAccountModal';
import type { UserRole } from '../../types';

interface NavbarProps {
  title?: string;
  onSearch?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ title, onSearch }) => {
  const { profile, role } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  const getRoleBadge = (userRole: UserRole | null) => {
    switch (userRole) {
      case 'admin':
        return { label: 'Administrator', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'project_manager':
        return { label: 'Project Manager', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'employee':
        return { label: 'Employee', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      default:
        return { label: 'User', color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  const roleBadge = getRoleBadge(role);
  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'AD';

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between shrink-0 shadow-sm relative z-20">
      {/* Left: Page Title / Search */}
      <div className="flex items-center gap-6 flex-1 max-w-xl">
        {title && <h1 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h1>}
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Search projects, employees, departments..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 placeholder:text-slate-400 transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {role === 'admin' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold transition-all"
            title="Create New User (Admin Only)"
          >
            <span>+ New User Account</span>
          </button>
        )}

        {/* Fixed, Non-Switchable Role Indicator Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 shadow-sm select-none">
          <Shield className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline text-slate-500">Role:</span>
          <span className="font-semibold text-blue-700 capitalize">{roleBadge.label}</span>
        </div>

        {/* Notifications Icon */}
        <div className="relative cursor-pointer p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
        </div>

        {/* Profile Pill */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
            {initials}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">{profile?.full_name || 'Admin Administrator'}</p>
            <p className="text-[11px] text-slate-500 capitalize">{roleBadge.label}</p>
          </div>
        </div>
      </div>

      <CreateAccountModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </header>
  );
};
