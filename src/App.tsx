import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import Clients from './components/Clients';
import MessageTemplates from './components/MessageTemplates';
import Models from './components/Models';
import Scheduling from './components/Scheduling';
import ProjectDetails from './components/ProjectDetails';
import InvoiceSystem from './components/InvoiceSystem';
import DailyTasks from './components/DailyTasks';
import TermsConditions from './components/TermsConditions';
import TaskManager from './components/TaskManager';
import StudioPortfolio from './components/StudioPortfolio';
import WorkLog from './components/WorkLog';
import TimeTracking from './components/TimeTracking';
import AllClients from './components/AllClients';
import EmployeeList from './components/EmployeeList';
import WebsiteInfo from './components/WebsiteInfo';
import UserManagement from './components/UserManagement';
import Login from './components/Login';
import LeadManagement from './components/LeadManagement';
import ClientPortal from './components/ClientPortal';
import VipClientPortal from './components/super-admin/VipClientPortal';
import Messages from './components/Messages';
import PublicOnboardingForm from './components/PublicOnboardingForm';
import ClientOnboarding from './components/ClientOnboarding';
import SuperAdminFeatures from './components/SuperAdminFeatures';
import PublicModelRegistration from './components/PublicModelRegistration';
import CompanyPad from './components/CompanyPad';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import PublicClientChecklist from './components/super-admin/PublicClientChecklist';

function AppContent() {
  const { currentUser } = useAuth();
  const urlParams = new URLSearchParams(window.location.search);
  const clientPortalId = urlParams.get('client-portal');
  const vipClientPortalId = urlParams.get('vip-client');
  const isOnboarding = urlParams.has('onboarding');
  const isClientChecklist = urlParams.has('client-checklist');
  const isModelRegistration = urlParams.has('model-registration');

  if (isOnboarding) {
    return <PublicOnboardingForm />;
  }

  if (isClientChecklist) {
    return <PublicClientChecklist />;
  }
  
  if (isModelRegistration) {
    return <PublicModelRegistration />;
  }

  if (clientPortalId) {
    return (
      <DataProvider>
        <ClientPortal clientId={clientPortalId} />
      </DataProvider>
    );
  }

  if (vipClientPortalId) {
    return (
      <DataProvider>
        <VipClientPortal clientId={vipClientPortalId} />
      </DataProvider>
    );
  }

  const [currentTab, setCurrentTab] = useState('dashboard');

  if (!currentUser) {
    return <Login />;
  }

  const hasAccess = (tabId: string) => {
    if (tabId === 'super-admin-features') return !!currentUser?.isSuperAdmin;
    if (currentUser?.role === 'admin') return true;
    if (tabId === 'users') return false;
    if (tabId === 'work-log' || tabId === 'time-tracking') return true;
    if (tabId === 'project-details') return currentUser?.permissions?.includes('projects') || currentUser?.permissions?.includes('clients');
    return currentUser?.permissions?.includes(tabId);
  };

  const renderContent = () => {
    // Basic redirect if not allowed to view standard tabs (dashboard shouldn't be blocked entirely, but fallback if everything restricted).
    if (!hasAccess(currentTab.split(':')[0]) && currentTab !== 'dashboard') {
      return (
        <div className="flex h-full items-center justify-center text-red-500 font-medium">
          আপনার এই পেজটি দেখার অনুমতি নেই।
        </div>
      );
    }
    
    if (currentTab.startsWith('project-details:')) {
      const [, clientId, projectId, source] = currentTab.split(':');
      return <ProjectDetails clientId={clientId} projectId={projectId} onBack={() => setCurrentTab(source || 'clients')} />;
    }

    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'projects':
        return <ProjectList onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'messages':
        return <Messages />;
      case 'clients':
        return <Clients onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'website':
        return <AllClients categoryProp="Website" onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'video':
        return <AllClients categoryProp="Video" onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'automation':
        return <AllClients categoryProp="Automation" onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'course':
        return <AllClients categoryProp="Course" onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'marketing':
        return <AllClients categoryProp="Marketing" onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'consultancy':
        return <AllClients categoryProp="Consultancy" onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'all-clients':
        return <AllClients onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'message-templates':
        return <MessageTemplates />;
      case 'models':
        return <Models />;
      case 'scheduling':
        return <Scheduling />;
      case 'invoice':
        return <InvoiceSystem />;
      case 'daily-tasks':
        return <DailyTasks />;
      case 'terms':
        return <TermsConditions />;
      case 'task-manager':
        return <TaskManager />;
      case 'portfolio':
        return <StudioPortfolio />;
      case 'work-log':
        return <WorkLog />;
      case 'time-tracking':
        return <TimeTracking />;
      case 'employees':
        return <EmployeeList />;
      case 'website-info':
        return <WebsiteInfo />;
      case 'company-pad':
        return <CompanyPad />;
      case 'lead':
        return <LeadManagement />;
      case 'client-onboarding':
        return <ClientOnboarding />;
      case 'users':
        return <UserManagement />;
      case 'super-admin-features':
        return <SuperAdminFeatures />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <DataProvider>
      <div className="flex h-screen bg-gray-50 font-sans print:bg-white print:h-auto">
        <div className="print:hidden">
          <Sidebar currentTab={currentTab.split(':')[0]} setCurrentTab={setCurrentTab} />
        </div>
        <div className="flex-1 ml-64 print:ml-0 overflow-y-auto p-8 print:p-0 print:overflow-visible">
          <main className="max-w-7xl mx-auto print:max-w-none print:w-full">
            {renderContent()}
          </main>
        </div>
      </div>
    </DataProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
