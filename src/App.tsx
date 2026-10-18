import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/auth/LoginPage';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';

// Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManagerDashboard } from './pages/manager/ManagerDashboard';
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { EmployeeManagement } from './pages/admin/EmployeeManagement';
import { DepartmentManagement } from './pages/admin/DepartmentManagement';
import { ProjectsPage } from './pages/common/ProjectsPage';
import { ProjectDetailsPage } from './pages/common/ProjectDetailsPage';
import { ResourceAllocationPage } from './pages/manager/ResourceAllocationPage';
import { ReportsPage } from './pages/common/ReportsPage';
import { EmployeeProfilePage } from './pages/employee/EmployeeProfilePage';
import { SettingsPage } from './pages/admin/SettingsPage';

const MainApp: React.FC = () => {
  const { user, role, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-white font-sans">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center animate-pulse mb-4 shadow-xl shadow-blue-500/20">
          <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm font-semibold tracking-wide text-slate-300">Loading ResourceHub Enterprise...</p>
        <p className="text-xs text-slate-500 mt-1">Connecting to Supabase PostgreSQL</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentTab('project-details');
  };

  const handleBackToProjects = () => {
    setSelectedProjectId(null);
    setCurrentTab(role === 'project_manager' ? 'my-projects' : 'projects');
  };

  const handleTabChange = (tab: string, projectId?: string) => {
    if (projectId) setSelectedProjectId(projectId);
    setCurrentTab(tab);
  };

  const renderContent = () => {
    // If on project-details tab
    if (currentTab === 'project-details') {
      return (
        <ProjectDetailsPage
          projectId={selectedProjectId || 'b0000000-0000-0000-0000-000000000001'}
          onBack={handleBackToProjects}
        />
      );
    }

    switch (currentTab) {
      case 'dashboard':
        if (role === 'admin') return <AdminDashboard />;
        if (role === 'project_manager') return <ManagerDashboard onNavigateTab={handleTabChange} />;
        return <EmployeeDashboard />;

      case 'employees':
        return <EmployeeManagement />;

      case 'departments':
        return <DepartmentManagement />;

      case 'projects':
      case 'my-projects':
        return <ProjectsPage onSelectProject={handleSelectProject} />;

      case 'allocations':
        return <ResourceAllocationPage />;

      case 'expenses':
        // For manager expenses tab, jump into project details or dedicated expense project
        return (
          <ProjectDetailsPage
            projectId={selectedProjectId || 'b0000000-0000-0000-0000-000000000001'}
            onBack={() => setCurrentTab('dashboard')}
          />
        );

      case 'my-profile':
        return <EmployeeProfilePage />;

      case 'skills':
        return <EmployeeDashboard />;

      case 'reports':
        return <ReportsPage />;

      case 'settings':
        return <SettingsPage />;

      default:
        if (role === 'admin') return <AdminDashboard />;
        if (role === 'project_manager') return <ManagerDashboard onNavigateTab={handleTabChange} />;
        return <EmployeeDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Dark Navy Sidebar */}
      <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
