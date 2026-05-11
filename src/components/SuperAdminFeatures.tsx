import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, LayoutDashboard, Anchor, DollarSign, CheckSquare, Users } from 'lucide-react';
import SuperAdminDashboardView from './super-admin/SuperAdminDashboardView';
import BigFishClientsView from './super-admin/BigFishClientsView';
import AgencyProfitView from './super-admin/AgencyProfitView';
import EmployeeSalaryView from './super-admin/EmployeeSalaryView';
import DailyTasksView from './super-admin/DailyTasksView';

import GeneralClientsView from './super-admin/GeneralClientsView';

export default function SuperAdminFeatures() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!currentUser?.isSuperAdmin) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500 font-medium">
        আপনার এই পেজটি দেখার অনুমতি নেই। (Access Denied)
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center">
          <Shield className="w-10 h-10 mr-4 text-red-600" />
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">সুপার এডমিন হেডকোয়ার্টার</h1>
            <p className="text-sm font-medium text-gray-500 mt-1">Advanced CRM & Analytics Panel</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-100/80 p-1.5 rounded-2xl w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 lg:flex-none flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-black transition-all ${
              activeTab === 'dashboard' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <LayoutDashboard size={18} className="mr-1.5" /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('big_fish')}
            className={`flex-1 lg:flex-none flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-black transition-all ${
              activeTab === 'big_fish' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Anchor size={18} className="mr-1.5" /> Big Fish
          </button>
          <button 
            onClick={() => setActiveTab('general_clients')}
            className={`flex-1 lg:flex-none flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-black transition-all ${
              activeTab === 'general_clients' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users size={18} className="mr-1.5" /> সকল ক্লায়েন্ট
          </button>
          <button 
            onClick={() => setActiveTab('agency_profit')}
            className={`flex-1 lg:flex-none flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-black transition-all ${
              activeTab === 'agency_profit' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <DollarSign size={18} className="mr-1.5" /> Agency Profit
          </button>
          <button 
            onClick={() => setActiveTab('employee_salary')}
            className={`flex-1 lg:flex-none flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-black transition-all ${
              activeTab === 'employee_salary' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <DollarSign size={18} className="mr-1.5" /> Employee Salary
          </button>
          <button 
            onClick={() => setActiveTab('daily_tasks')}
            className={`flex-1 lg:flex-none flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-black transition-all ${
              activeTab === 'daily_tasks' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <CheckSquare size={18} className="mr-1.5" /> ডেইলি টাস্ক
          </button>
        </div>
      </div>

      <div className="mt-8">
        {activeTab === 'dashboard' && <SuperAdminDashboardView />}
        {activeTab === 'big_fish' && <BigFishClientsView />}
        {activeTab === 'general_clients' && <GeneralClientsView />}
        {activeTab === 'agency_profit' && <AgencyProfitView />}
        {activeTab === 'employee_salary' && <EmployeeSalaryView />}
        {activeTab === 'daily_tasks' && <DailyTasksView />}
      </div>
    </div>
  );
}

