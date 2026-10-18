import React from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderKanban,
  FileBarChart2,
  Settings,
  Layers,
  Receipt,
  UserCheck,
  Award,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const { role, profile, signOut } = useAuth();

  const getNavItems = (userRole: UserRole | null) => {
    switch (userRole) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'employees', label: 'Employees', icon: Users },
          { id: 'departments', label: 'Departments', icon: Building2 },
          { id: 'projects', label: 'Projects', icon: FolderKanban },
          { id: 'allocations', label: 'Resource Allocation', icon: Layers },
          { id: 'expenses', label: 'Expenses', icon: Receipt },
          { id: 'reports', label: 'Reports', icon: FileBarChart2 },
          { id: 'skills', label: 'Skills & Certifications', icon: Award },
          { id: 'achievements', label: 'Achievements', icon: Sparkles },
          { id: 'settings', label: 'Settings', icon: Settings },
        ];
      case 'project_manager':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'my-projects', label: 'My Projects', icon: FolderKanban },
          { id: 'allocations', label: 'Resource Allocation', icon: Layers },
          { id: 'expenses', label: 'Expenses', icon: Receipt },
          { id: 'reports', label: 'Reports', icon: FileBarChart2 },
        ];
      case 'employee':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'my-profile', label: 'My Profile', icon: UserCheck },
          { id: 'my-projects', label: 'My Projects', icon: FolderKanban },
          { id: 'skills', label: 'Skills & Certifications', icon: Award },
          { id: 'achievements', label: 'Achievements', icon: Sparkles },
          { id: 'reports', label: 'Reports', icon: FileBarChart2 },
        ];
      default:
        return [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }];
    }
  };

  const navItems = getNavItems(role);

  return (
    <aside className="w-64 bg-[#0A1128] text-slate-300 flex flex-col h-screen shrink-0 border-r border-slate-800 selection:bg-blue-600 selection:text-white">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800/80">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-white text-lg tracking-tight">Resource<span className="text-blue-400">Hub</span></span>
          <span className="block text-[10px] text-slate-400 font-medium tracking-wider uppercase">Enterprise Suite</span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Status and Sign Out */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-blue-400">
            {profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : 'AD'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{profile?.full_name || 'Administrator'}</p>
            <p className="text-[11px] text-slate-400 capitalize truncate">
              {role === 'project_manager' ? 'Project Manager' : role || 'User'}
            </p>
          </div>
        </div>

        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-slate-800"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
