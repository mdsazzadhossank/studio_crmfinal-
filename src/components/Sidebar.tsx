import React, { useState, useRef } from 'react';
import { LayoutDashboard, Users, Camera, Image as ImageIcon, Calendar, Briefcase, FileText, Upload, X, ClipboardList, Shield, LogOut, UserPlus, MessageSquare, Clock, Globe, Laptop, Settings, BookOpen, TrendingUp, Video, Cloud } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type SidebarProps = {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
};

export default function Sidebar({ currentTab, setCurrentTab }: SidebarProps) {
  const [appLogo, setAppLogo] = useState<string>(() => localStorage.getItem('appLogo') || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentUser, logout } = useAuth();

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAppLogo(result);
        localStorage.setItem('appLogo', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAppLogo('');
    localStorage.removeItem('appLogo');
  };

  const sectionedTabsRaw = [
    {
      title: 'মেইন',
      color: 'indigo',
      items: [
        { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
      ]
    },
    {
      title: 'আমাদের সার্ভিসসমূহ',
      color: 'blue',
      items: [
        { id: 'marketing', label: 'মার্কেটিং সার্ভিস', icon: TrendingUp },
        { id: 'video', label: 'ভিডিও সার্ভিস', icon: Video },
        { id: 'website', label: 'ওয়েবসাইট সার্ভিস', icon: Laptop },
        { id: 'automation', label: 'অটোমেশন সার্ভিস', icon: Settings },
        { id: 'course', label: 'অনলাইন কোর্স', icon: BookOpen },
        { id: 'consultancy', label: 'বিজনেস কনসালটেন্সি', icon: FileText },
      ]
    },
    {
      title: 'প্রজেক্টস ও পোর্টফোলিও',
      color: 'emerald',
      items: [
        { id: 'projects', label: 'কনটেন্ট প্রজেক্ট লিস্ট', icon: Briefcase },
        { id: 'portfolio', label: 'স্টুডিও পোর্টফোলিও', icon: ImageIcon },
      ]
    },
    {
      title: 'ক্লায়েন্টস ও লিডস',
      color: 'fuchsia',
      items: [
        { id: 'clients', label: 'একটিভ স্টুডিও ক্লায়েন্ট প্রোফাইল', icon: Users },
        { id: 'lead', label: 'নতুন লিড ফলোয়াপ করতে হবে !', icon: UserPlus },
        { id: 'client-onboarding', label: 'ক্লাইন্ট অনবোর্ডিং', icon: FileText },
      ]
    },
    {
      title: 'কমিউনিকেশন',
      color: 'violet',
      items: [
        { id: 'messages', label: 'মেসেজ বক্স', icon: MessageSquare },
        { id: 'message-templates', label: 'মেসেজ টেমপ্লেটস', icon: MessageSquare },
      ]
    },
    {
      title: 'অপারেশনস ও টাস্ক',
      color: 'amber',
      items: [
        { id: 'task-manager', label: 'টাস্ক ম্যানেজার', icon: ClipboardList },
        { id: 'daily-tasks', label: 'ডেইলি টাস্ক', icon: ClipboardList },
        { id: 'work-log', label: 'ওয়ার্ক লগ', icon: FileText },
        { id: 'scheduling', label: 'শিডিউলিং', icon: Calendar },
        { id: 'time-tracking', label: 'ইন/আউট টাইম', icon: Clock },
        { id: 'employees', label: 'এমপ্লয়ি লিস্ট', icon: Users },
      ]
    },
    {
      title: 'ফাইন্যান্স ও সেলস',
      color: 'green',
      items: [
        { id: 'invoice', label: 'ইনভয়েস', icon: FileText },
      ]
    },
    {
      title: 'ব্র্যান্ড ও অন্যান্য',
      color: 'sky',
      items: [
        { id: 'website-info', label: 'ওয়েবসাইট ইনফো', icon: Globe },
        { id: 'models', label: 'মডেল বিশ্লেষণ', icon: Camera },
        { id: 'company-pad', label: 'অফিসিয়াল প্যাড', icon: FileText },
        { id: 'terms', label: 'কোম্পানি কন্ডিশন', icon: FileText },
      ]
    }
  ];

  const adminSection = {
    title: 'অ্যাডমিন প্যানেল',
    color: 'rose',
    items: [] as any[]
  };

  if (currentUser?.role === 'admin' || currentUser?.permissions?.includes('users')) {
    adminSection.items.push({ id: 'users', label: 'ইউজার ম্যানেজমেন্ট', icon: Shield });
  }

  if (currentUser?.isSuperAdmin) {
    adminSection.items.push({ id: 'super-admin-features', label: 'সুপার এডমিন ফিচার', icon: Shield });
    adminSection.items.push({ id: 'cloud-backup', label: 'ক্লাউড ব্যাকআপ', icon: Cloud });
  }

  const sections = sectionedTabsRaw.map(sec => {
    return {
      ...sec,
      items: sec.items.filter(item => {
        if (currentUser?.role === 'admin') return true;
        if (item.id === 'work-log' || item.id === 'time-tracking') return true;
        return currentUser?.permissions?.includes(item.id);
      })
    };
  }).filter(sec => sec.items.length > 0);

  if (adminSection.items.length > 0) {
    sections.push(adminSection);
  }

  const colorMap: Record<string, { bg: string, text: string, hoverText: string, hoverBg: string, icon: string, sectionBg: string, sectionBorder: string }> = {
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-700', hoverBg: 'hover:bg-indigo-100/50', hoverText: 'hover:text-indigo-800', icon: 'text-indigo-600', sectionBg: 'bg-indigo-50/40', sectionBorder: 'border-indigo-100' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-700', hoverBg: 'hover:bg-blue-100/50', hoverText: 'hover:text-blue-800', icon: 'text-blue-600', sectionBg: 'bg-blue-50/40', sectionBorder: 'border-blue-100' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', hoverBg: 'hover:bg-emerald-100/50', hoverText: 'hover:text-emerald-800', icon: 'text-emerald-600', sectionBg: 'bg-emerald-50/40', sectionBorder: 'border-emerald-100' },
    fuchsia: { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', hoverBg: 'hover:bg-fuchsia-100/50', hoverText: 'hover:text-fuchsia-800', icon: 'text-fuchsia-600', sectionBg: 'bg-fuchsia-50/40', sectionBorder: 'border-fuchsia-100' },
    violet: { bg: 'bg-violet-100', text: 'text-violet-700', hoverBg: 'hover:bg-violet-100/50', hoverText: 'hover:text-violet-800', icon: 'text-violet-600', sectionBg: 'bg-violet-50/40', sectionBorder: 'border-violet-100' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-700', hoverBg: 'hover:bg-amber-100/50', hoverText: 'hover:text-amber-800', icon: 'text-amber-600', sectionBg: 'bg-amber-50/40', sectionBorder: 'border-amber-100' },
    green: { bg: 'bg-green-100', text: 'text-green-700', hoverBg: 'hover:bg-green-100/50', hoverText: 'hover:text-green-800', icon: 'text-green-600', sectionBg: 'bg-green-50/40', sectionBorder: 'border-green-100' },
    sky: { bg: 'bg-sky-100', text: 'text-sky-700', hoverBg: 'hover:bg-sky-100/50', hoverText: 'hover:text-sky-800', icon: 'text-sky-600', sectionBg: 'bg-sky-50/40', sectionBorder: 'border-sky-100' },
    rose: { bg: 'bg-rose-100', text: 'text-rose-700', hoverBg: 'hover:bg-rose-100/50', hoverText: 'hover:text-rose-800', icon: 'text-rose-600', sectionBg: 'bg-rose-50/40', sectionBorder: 'border-rose-100' },
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div 
          className="relative group cursor-pointer flex items-center h-12 rounded-lg hover:bg-gray-50 transition-colors p-2 -mx-2"
          onClick={() => fileInputRef.current?.click()}
          title="লোগো পরিবর্তন করতে ক্লিক করুন"
        >
          {appLogo ? (
            <div className="w-full flex items-center justify-between">
              <img src={appLogo} alt="App Logo" className="max-h-10 max-w-[180px] object-contain" />
              <button 
                onClick={handleRemoveLogo}
                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                title="লোগো মুছুন"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between">
              <h1 className="text-2xl font-bold text-indigo-600 flex items-center">
                <Camera className="mr-2" />
                স্টুডিও প্রো
              </h1>
              <Upload size={16} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleLogoUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      </div>
      <nav className="flex-1 p-4 overflow-y-auto space-y-4">
        {sections.map((section, idx) => {
          const colors = colorMap[section.color];
          return (
            <div key={idx} className={`p-3 rounded-2xl border ${colors.sectionBg} ${colors.sectionBorder}`}>
              <h3 className={`text-[11px] font-black uppercase tracking-wider mb-2 px-1 ${colors.text} opacity-90`}>
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = currentTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setCurrentTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all ${
                        isActive
                          ? `${colors.bg} ${colors.text} font-bold shadow-sm`
                          : `text-gray-600 ${colors.hoverBg} ${colors.hoverText} font-medium`
                      }`}
                    >
                      <Icon size={18} className={isActive ? colors.icon : 'opacity-60'} />
                      <span className="text-sm">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="text-sm font-medium text-gray-900 truncate pr-2">
            {currentUser?.name}
          </div>
          <button onClick={logout} className="text-gray-500 hover:text-red-600 transition-colors" title="লগআউট">
            <LogOut size={18} />
          </button>
        </div>
        <div className="text-xs text-gray-500 text-center">
          &copy; 2026 Studio Pro
        </div>
      </div>
    </div>
  );
}
