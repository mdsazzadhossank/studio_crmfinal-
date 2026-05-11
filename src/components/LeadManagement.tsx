import React, { useState, useEffect } from 'react';
import { UserPlus, Facebook, Phone, Briefcase, Clock, DollarSign, Target, AlertCircle, Globe, MessageSquare, Plus, Search, User as UserIcon, Trash2, Edit2, FileText, LayoutGrid, List, Loader, Tag, CalendarDays, Filter, SortAsc, Check } from 'lucide-react';
import Modal from './Modal';
import { parseLeadData } from '../services/ai';

export interface Lead {
  id: string;
  conversationId: string;
  clientName: string;
  facebookPageLink: string;
  whatsappNumber: string;
  businessType: string;
  businessDuration: string;
  averageProductPrice: string;
  dailyMarketingBudget: string;
  currentProblems: string;
  websiteStatus: string;
  mainGoal: string;
  notes?: string;
  createdAt: string;
  tags?: string[];
  reminderDate?: string;
}

const AVAILABLE_TAGS = [
  { id: 'hot', label: '🔥 Hot Lead', color: 'bg-red-100 text-red-800 border-red-200' },
  { id: 'important', label: '⭐ Important', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'followup', label: '📅 Follow Up', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'emergency', label: '🚨 Emergency Contact', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { id: 'potential', label: '💼 Potential Client', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
];

export default function LeadManagement() {
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('studio_leads');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.length > 0) {
        return parsed;
      }
    }
    return [
      {
        id: 'mock-lead-1',
        conversationId: '#10520',
        clientName: 'Rahul Ahmed',
        facebookPageLink: 'https://facebook.com/rahulsboutique',
        whatsappNumber: '01711000001',
        businessType: 'Clothing/Retail',
        businessDuration: '2 Years',
        averageProductPrice: '1500 BDT',
        dailyMarketingBudget: '10$',
        currentProblems: 'Sales are dropping, ROAS is very low.',
        websiteStatus: 'No',
        mainGoal: 'Increase Sales and ROAS',
        notes: 'Needs urgent consultation about ad account structure.',
        createdAt: new Date().toISOString(),
        tags: ['hot', 'followup'],
        reminderDate: new Date().toISOString().split('T')[0]
      },
      {
        id: 'mock-lead-2',
        conversationId: '#10521',
        clientName: 'Sabrina Rahman',
        facebookPageLink: 'https://facebook.com/sabrinascosmetics',
        whatsappNumber: '01811000002',
        businessType: 'Cosmetics',
        businessDuration: '6 Months',
        averageProductPrice: '800 BDT',
        dailyMarketingBudget: '5$',
        currentProblems: 'Page has low messaging response rate.',
        websiteStatus: 'Yes, looking to connect pixel',
        mainGoal: 'More Website Purchases',
        notes: 'Has a Shopify website, needs help tracking conversions.',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        tags: ['potential']
      },
      {
        id: 'mock-lead-3',
        conversationId: '#10522',
        clientName: 'Tanvir Hasan',
        facebookPageLink: 'https://facebook.com/tanvirtechgadgets',
        whatsappNumber: '01911000003',
        businessType: 'Electronics/Gadgets',
        businessDuration: '3 Years',
        averageProductPrice: '3500 BDT',
        dailyMarketingBudget: '20$',
        currentProblems: 'Ads are getting rejected frequently.',
        websiteStatus: 'Yes',
        mainGoal: 'Account Unban and Scale Sales',
        notes: 'Client is frustrated with FB policy issues.',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        tags: ['important', 'emergency']
      }
    ];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'priority' | 'newest' | 'reminder'>('priority');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const defaultFormData: Omit<Lead, 'id' | 'createdAt'> = {
    conversationId: '',
    clientName: '',
    facebookPageLink: '',
    whatsappNumber: '',
    businessType: '',
    businessDuration: '',
    averageProductPrice: '',
    dailyMarketingBudget: '',
    currentProblems: '',
    websiteStatus: '',
    mainGoal: '',
    notes: '',
    tags: [],
    reminderDate: ''
  };

  const [formData, setFormData] = useState<Omit<Lead, 'id' | 'createdAt'>>(defaultFormData);
  const [rawText, setRawText] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  useEffect(() => {
    localStorage.setItem('studio_leads', JSON.stringify(leads));
  }, [leads]);

  const openAddModal = () => {
    setEditingLead(null);
    setFormData(defaultFormData);
    setRawText('');
    setIsModalOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      conversationId: lead.conversationId,
      clientName: lead.clientName,
      facebookPageLink: lead.facebookPageLink,
      whatsappNumber: lead.whatsappNumber,
      businessType: lead.businessType,
      businessDuration: lead.businessDuration,
      averageProductPrice: lead.averageProductPrice,
      dailyMarketingBudget: lead.dailyMarketingBudget,
      currentProblems: lead.currentProblems,
      websiteStatus: lead.websiteStatus,
      mainGoal: lead.mainGoal,
      notes: lead.notes || '',
      tags: lead.tags || [],
      reminderDate: lead.reminderDate || ''
    });
    setRawText('');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে আপনি এই লিড মুছে ফেলতে চান?')) {
      setLeads(leads.filter(l => l.id !== id));
    }
  };

  const parseRawText = async () => {
    if (!rawText) return;
    
    setIsParsing(true);
    try {
      const extractedData = await parseLeadData(rawText);
      if (extractedData) {
        const newFormData = { ...formData, ...extractedData };
        setFormData(newFormData);
      } else {
        alert('অটো-ফিল ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।');
      }
    } catch (e) {
      console.error(e);
      alert('অটো-ফিল ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLead) {
      setLeads(leads.map(l => l.id === editingLead.id ? { ...formData, id: l.id, createdAt: l.createdAt } : l));
    } else {
      const newLead: Lead = {
        ...formData,
        id: `lead_${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      setLeads([newLead, ...leads]);
    }
    setIsModalOpen(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const processedLeads = leads
    .filter(l => {
      const matchesSearch = l.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        l.whatsappNumber.includes(searchTerm) ||
        l.conversationId.includes(searchTerm);
      const matchesTag = filterTag === 'All' ? true : (l.tags || []).includes(filterTag);
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const aHasReminderToday = a.reminderDate && a.reminderDate <= todayStr;
        const bHasReminderToday = b.reminderDate && b.reminderDate <= todayStr;
        
        if (aHasReminderToday && !bHasReminderToday) return -1;
        if (!aHasReminderToday && bHasReminderToday) return 1;

        const aIsHot = (a.tags || []).includes('emergency') || (a.tags || []).includes('hot');
        const bIsHot = (b.tags || []).includes('emergency') || (b.tags || []).includes('hot');
        
        if (aIsHot && !bIsHot) return -1;
        if (!aIsHot && bIsHot) return 1;

        const aIsImp = (a.tags || []).includes('followup') || (a.tags || []).includes('important') || (a.tags || []).includes('potential');
        const bIsImp = (b.tags || []).includes('followup') || (b.tags || []).includes('important') || (b.tags || []).includes('potential');

        if (aIsImp && !bIsImp) return -1;
        if (!aIsImp && bIsImp) return 1;

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'reminder') {
        if (!a.reminderDate && !b.reminderDate) return 0;
        if (a.reminderDate && !b.reminderDate) return -1;
        if (!a.reminderDate && b.reminderDate) return 1;
        return new Date(a.reminderDate!).getTime() - new Date(b.reminderDate!).getTime();
      }
      return 0;
    });

  const toggleTagSelection = (tagId: string) => {
    const currentTags = formData.tags || [];
    if (currentTags.includes(tagId)) {
      setFormData({ ...formData, tags: currentTags.filter(t => t !== tagId) });
    } else {
      setFormData({ ...formData, tags: [...currentTags, tagId] });
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center w-full sm:w-auto tracking-tight">
            <Target className="w-8 h-8 mr-3 text-indigo-600" />
            লিড ম্যানেজমেন্ট
          </h1>
          <p className="text-gray-500 mt-1 text-sm ml-11">গুরুত্বপূর্ণ লিডসমূহ ও রিমাইন্ডার ট্র্যাক করুন</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md flex items-center transition-colors ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              title="লিস্ট ভিউ"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md flex items-center transition-colors ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              title="গ্রিড ভিউ"
            >
              <LayoutGrid size={18} />
            </button>
          </div>
          <button
            onClick={openAddModal}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg flex items-center justify-center hover:bg-indigo-700 transition shadow-sm font-medium flex-1 sm:flex-none"
          >
            <Plus size={20} className="mr-1.5" />
            নতুন লিড
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-gray-100 bg-gray-50/50 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm transition-shadow"
                placeholder="ক্লায়েন্টের নাম, হোয়াটসঅ্যাপ বা কনভারসেশন আইডি..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <div className="relative min-w-[160px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Filter className="w-4 h-4 text-gray-400" /></div>
                <select value={filterTag} onChange={e => setFilterTag(e.target.value)} className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none font-medium text-gray-700 shadow-sm cursor-pointer outline-none transition-shadow">
                  <option value="All">সব ট্যাগ (All)</option>
                  {AVAILABLE_TAGS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
              <div className="relative min-w-[180px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SortAsc className="w-4 h-4 text-gray-400" /></div>
                <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none font-medium text-gray-700 shadow-sm cursor-pointer outline-none transition-shadow">
                  <option value="priority">Priority (বেস্ট)</option>
                  <option value="newest">Newest First</option>
                  <option value="reminder">Reminder Date</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center mr-2">Quick Tags:</span>
            {AVAILABLE_TAGS.map(t => (
              <button 
                key={t.id} 
                onClick={() => setFilterTag(filterTag === t.id ? 'All' : t.id)}
                className={`px-3 py-1 text-xs font-medium rounded-full cursor-pointer transition-all border ${filterTag === t.id ? t.color.replace('border-', 'border-2 border-') : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {processedLeads.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <Target className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-xl font-semibold text-gray-800 mb-1">কোনো লিড পাওয়া যায়নি</p>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">ফিল্টার পরিবর্তন করুন অথবা নতুন লিড যোগ করে কাজ শুরু করুন।</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {processedLeads.map((lead) => {
                const hasReminderTodayOrPast = lead.reminderDate && lead.reminderDate <= todayStr;

                return (
                <div key={lead.id} className={`bg-white border ${hasReminderTodayOrPast ? 'border-orange-300 ring-1 ring-orange-300 ring-offset-1' : 'border-gray-200'} rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group`}>
                  <div className={`p-5 border-b ${hasReminderTodayOrPast ? 'bg-orange-50/30 border-orange-100' : 'bg-gray-50 border-gray-100'} flex justify-between items-start`}>
                    <div>
                      <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 mb-1.5">
                        <MessageSquare size={12} />
                        <span>কনভারসেশন: {lead.conversationId || 'N/A'}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 flex items-center tracking-tight">
                        <UserIcon className="w-5 h-5 mr-1.5 text-gray-400" />
                        {lead.clientName || 'নামহীন লিড'}
                      </h3>
                    </div>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(lead)} className="p-1.5 text-gray-400 hover:text-indigo-600 bg-white rounded-lg border border-gray-200 shadow-sm transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(lead.id)} className="p-1.5 text-gray-400 hover:text-red-600 bg-white rounded-lg border border-gray-200 shadow-sm transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="px-5 pt-3 pb-2 border-b border-gray-50 bg-white space-y-2">
                    {/* Tags */}
                    {lead.tags && lead.tags.length > 0 && (
                       <div className="flex flex-wrap gap-1.5">
                         {lead.tags.map(tagId => {
                           const tagDef = AVAILABLE_TAGS.find(t => t.id === tagId);
                           if (!tagDef) return null;
                           return (
                             <span key={tagId} className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${tagDef.color}`}>
                               {tagDef.label}
                             </span>
                           );
                         })}
                       </div>
                    )}
                    {/* Reminder */}
                    {lead.reminderDate && (
                      <div className={`flex items-center text-xs font-semibold ${hasReminderTodayOrPast ? 'text-red-600' : 'text-blue-600'}`}>
                        <CalendarDays className="w-3.5 h-3.5 mr-1.5" />
                        রিমাইন্ডার: {lead.reminderDate} {hasReminderTodayOrPast && '(URGENT)'}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5 space-y-4 flex-grow text-sm bg-white">
                    <div className="flex items-start">
                      <Phone className="w-4 h-4 mr-3 text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">WhatsApp Number</div>
                        <div className="text-gray-900 font-medium">{lead.whatsappNumber || '-'}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Facebook className="w-4 h-4 mr-3 text-blue-500 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Facebook Page</div>
                        {lead.facebookPageLink ? (
                          <a href={lead.facebookPageLink.startsWith('http') ? lead.facebookPageLink : `https://${lead.facebookPageLink}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-medium break-all">
                            {lead.facebookPageLink}
                          </a>
                        ) : (
                          <span className="text-gray-900">-</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-50">
                      <div>
                        <div className="flex items-center text-xs text-gray-500 font-medium mb-1">
                          <Briefcase className="w-3.5 h-3.5 mr-1" /> Business
                        </div>
                        <div className="text-gray-900 line-clamp-1 font-medium" title={lead.businessType}>{lead.businessType || '-'}</div>
                      </div>
                      <div>
                        <div className="flex items-center text-xs text-gray-500 font-medium mb-1">
                          <Clock className="w-3.5 h-3.5 mr-1" /> Duration
                        </div>
                        <div className="text-gray-900 font-medium">{lead.businessDuration || '-'}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center text-xs text-gray-500 font-medium mb-1">
                          <DollarSign className="w-3.5 h-3.5 mr-1" /> Avg Price
                        </div>
                        <div className="text-gray-900 font-medium">{lead.averageProductPrice || '-'}</div>
                      </div>
                      <div>
                        <div className="flex items-center text-xs text-gray-500 font-medium mb-1">
                          <Target className="w-3.5 h-3.5 mr-1" /> Budget
                        </div>
                        <div className="text-gray-900 font-medium">{lead.dailyMarketingBudget || '-'}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5 bg-indigo-50/40 border-t border-indigo-50/60 space-y-3">
                    <div>
                      <div className="flex items-center text-xs text-indigo-800 font-bold mb-1 uppercase tracking-wider">
                        <AlertCircle className="w-3.5 h-3.5 mr-1" /> বর্তমান সমস্যা
                      </div>
                      <div className="text-sm text-indigo-900 font-medium leading-relaxed">{lead.currentProblems || '-'}</div>
                    </div>
                    <div>
                      <div className="flex items-center text-xs text-emerald-800 font-bold mb-1 uppercase tracking-wider">
                        <Target className="w-3.5 h-3.5 mr-1" /> Main Goal
                      </div>
                      <div className="text-sm text-emerald-900 font-medium leading-relaxed">{lead.mainGoal || '-'}</div>
                    </div>
                    <div className="flex items-center text-xs pt-1">
                      <Globe className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
                      <span className="text-gray-600 mr-2 font-medium">Website:</span>
                      <span className={`font-bold ${lead.websiteStatus.toLowerCase().includes('yes') || lead.websiteStatus.toLowerCase().includes('হ্যাঁ') ? 'text-green-600' : 'text-amber-600'}`}>
                        {lead.websiteStatus || 'জানা নেই'}
                      </span>
                    </div>
                  </div>
                  
                  {lead.notes && (
                    <div className="p-5 bg-yellow-50/50 border-t border-yellow-100/50 space-y-2 flex-grow-0">
                      <div className="flex items-center text-xs text-yellow-800 font-bold mb-1 uppercase tracking-wider">
                        <FileText className="w-3.5 h-3.5 mr-1" /> নোটস
                      </div>
                      <div className="text-sm text-yellow-900 whitespace-pre-wrap font-medium">{lead.notes}</div>
                    </div>
                  )}
                </div>
              )})}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ক্লায়েন্ট / কন্টাক্ট</th>
                    <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">স্ট্যাটাস / ট্যাগ</th>
                    <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">সমস্যা ও লক্ষ্য</th>
                    <th className="px-5 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {processedLeads.map(lead => {
                    const hasReminderTodayOrPast = lead.reminderDate && lead.reminderDate <= todayStr;
                    return (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                         <div className="font-bold text-gray-900 text-base flex items-center">
                           {lead.clientName || 'নামহীন লিড'}
                         </div>
                         <div className="text-xs font-medium text-indigo-600 mt-1 flex items-center">
                           <MessageSquare className="w-3.5 h-3.5 mr-1" />
                           #{lead.conversationId || 'N/A'}
                         </div>
                         <div className="mt-3 space-y-1.5">
                           <div className="flex items-center text-gray-700 text-xs font-medium">
                             <Phone className="w-3.5 h-3.5 mr-1.5 text-gray-400"/> {lead.whatsappNumber || '-'}
                           </div>
                           {lead.facebookPageLink && (
                             <div className="flex items-center text-indigo-600 text-xs font-medium">
                               <Facebook className="w-3.5 h-3.5 mr-1.5"/>
                               <a href={lead.facebookPageLink.startsWith('http') ? lead.facebookPageLink : `https://${lead.facebookPageLink}`} target="_blank" rel="noopener noreferrer" className="hover:underline max-w-[150px] truncate" title={lead.facebookPageLink}>Page Link</a>
                             </div>
                           )}
                         </div>
                      </td>
                      <td className="px-5 py-4">
                        {lead.reminderDate && (
                          <div className={`mb-3 inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${hasReminderTodayOrPast ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                            <CalendarDays className="w-3.5 h-3.5 mr-1.5" />
                            {lead.reminderDate} {hasReminderTodayOrPast && '⚠️'}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                           {(lead.tags || []).map(tagId => {
                             const tagDef = AVAILABLE_TAGS.find(t => t.id === tagId);
                             return tagDef ? (
                               <span key={tagId} className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${tagDef.color}`}>
                                 {tagDef.label}
                               </span>
                             ) : null;
                           })}
                        </div>
                        <div className="text-gray-900 font-medium truncate max-w-[200px]" title={lead.businessType}>{lead.businessType || '-'}</div>
                      </td>
                      <td className="px-5 py-4 font-medium">
                         <div className="text-indigo-800 text-xs space-y-1 max-w-[250px]">
                           <div className="flex items-start" title={lead.currentProblems}>
                             <AlertCircle className="w-3.5 h-3.5 mr-1 flex-shrink-0 mt-0.5 opacity-70" />
                             <span className="line-clamp-2">{lead.currentProblems || '-'}</span>
                           </div>
                         </div>
                         <div className="text-emerald-800 text-xs mt-2.5 space-y-1 max-w-[250px]">
                           <div className="flex items-start" title={lead.mainGoal}>
                             <Target className="w-3.5 h-3.5 mr-1 flex-shrink-0 mt-0.5 opacity-70" />
                             <span className="line-clamp-2">{lead.mainGoal || '-'}</span>
                           </div>
                         </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-medium align-middle">
                         <div className="flex justify-end space-x-2">
                           <button onClick={() => openEditModal(lead)} className="p-2 text-gray-500 hover:text-indigo-600 bg-white rounded-lg border border-gray-200 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50">
                             <Edit2 size={16} />
                           </button>
                           <button onClick={() => handleDelete(lead.id)} className="p-2 text-gray-500 hover:text-red-600 bg-white rounded-lg border border-gray-200 shadow-sm transition-colors hover:border-red-200 hover:bg-red-50">
                             <Trash2 size={16} />
                           </button>
                         </div>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* modal - we inject tailwind's max-w-4xl manually to make it wider */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingLead ? 'লিড এডিট করুন' : 'নতুন লিড যোগ করুন'} size="4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {!editingLead && (
            <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100 shadow-sm">
              <label className="block text-sm font-bold text-indigo-900 mb-2">
                ইমেইল/মেসেজ থেকে প্রাপ্ত টেক্সট পেস্ট করুন (Auto-fill)
              </label>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="এখানে লিডের সম্পূর্ণ ডিটেইলস পেস্ট করুন..."
                  className="w-full text-sm p-3.5 border border-indigo-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 bg-white resize-none shadow-sm"
                  rows={3}
                />
                <button
                  type="button"
                  onClick={parseRawText}
                  disabled={isParsing || !rawText.trim()}
                  className="bg-indigo-600 text-white px-5 rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm py-3 sm:py-0 whitespace-nowrap"
                >
                  {isParsing ? <Loader className="w-5 h-5 animate-spin" /> : null}
                  AI Parse
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            
            {/* TAGS & REMINDERS SECTION */}
            <div className="col-span-full border border-orange-100 bg-orange-50/30 p-5 rounded-2xl mb-2">
               <h3 className="text-base font-bold mb-4 text-orange-900 border-b border-orange-100 pb-2">প্রায়োরিটি, ফলো-আপ ও রিমাইন্ডার</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">ক্যাটেগরি ট্যাগ (একাধিক বাছতে পারেন)</label>
                    <div className="flex flex-wrap gap-2">
                       {AVAILABLE_TAGS.map(t => {
                         const isSelected = formData.tags?.includes(t.id);
                         return (
                           <button
                             type="button"
                             key={t.id}
                             onClick={() => toggleTagSelection(t.id)}
                             className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all border ${isSelected ? t.color.replace('border-', 'border-2 border-') + ' ring-2 ring-offset-1 ring-' + t.color.split(' ')[0].split('-')[1] + '-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                           >
                             <div className="flex items-center">
                               {isSelected && <Check className="w-3 h-3 mr-1" />}
                               {t.label}
                             </div>
                           </button>
                         )
                       })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">রিমাইন্ডার / ফলো-আপ ডেট</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><CalendarDays size={16} /></div>
                      <input type="date" value={formData.reminderDate} onChange={e => setFormData({...formData, reminderDate: e.target.value})} className="w-full pl-9 p-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 shadow-sm font-medium" />
                    </div>
                  </div>
               </div>
            </div>

            <div className="col-span-full">
              <h3 className="text-base font-bold border-b border-gray-100 pb-2 mb-2 text-gray-800">প্রাথমিক তথ্য</h3>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">ক্লায়েন্টের নাম *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><UserIcon size={16} /></div>
                <input required type="text" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" placeholder="ক্লায়েন্টের নাম" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">WhatsApp Number *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Phone size={16} /></div>
                <input required type="text" value={formData.whatsappNumber} onChange={e => setFormData({...formData, whatsappNumber: e.target.value})} className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" placeholder="01XXXXXXXXX" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Conversation ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><MessageSquare size={16} /></div>
                <input type="text" value={formData.conversationId} onChange={e => setFormData({...formData, conversationId: e.target.value})} className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" placeholder="e.g. #48100" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Facebook Page Link</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Facebook size={16} /></div>
                <input type="text" value={formData.facebookPageLink} onChange={e => setFormData({...formData, facebookPageLink: e.target.value})} className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" placeholder="https://facebook.com/..." />
              </div>
            </div>

            <div className="col-span-full mt-2">
              <h3 className="text-base font-bold border-b border-gray-100 pb-2 mb-2 text-gray-800">ব্যবসার বিস্তারিত</h3>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Business Name/Type</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Briefcase size={16} /></div>
                <input type="text" value={formData.businessType} onChange={e => setFormData({...formData, businessType: e.target.value})} className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" placeholder="e.g. Clothing/Retail" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Business Duration</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Clock size={16} /></div>
                <input type="text" value={formData.businessDuration} onChange={e => setFormData({...formData, businessDuration: e.target.value})} className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" placeholder="e.g. 1 year" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Avg. Product Price</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><DollarSign size={16} /></div>
                <input type="text" value={formData.averageProductPrice} onChange={e => setFormData({...formData, averageProductPrice: e.target.value})} className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" placeholder="e.g. 500-1000 TK" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Daily Ad Budget</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><DollarSign size={16} /></div>
                <input type="text" value={formData.dailyMarketingBudget} onChange={e => setFormData({...formData, dailyMarketingBudget: e.target.value})} className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" placeholder="e.g. $10" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">বর্তমান সমস্যা (Current Problem)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><AlertCircle size={16} /></div>
                <input type="text" value={formData.currentProblems} onChange={e => setFormData({...formData, currentProblems: e.target.value})} className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" placeholder="e.g. Low response rate" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Website Status</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Globe size={16} /></div>
                <input type="text" value={formData.websiteStatus} onChange={e => setFormData({...formData, websiteStatus: e.target.value})} className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" placeholder="Yes / No" />
              </div>
            </div>

            <div className="col-span-full">
              <label className="block text-sm font-bold text-gray-700 mb-1">Main Goal</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Target size={16} /></div>
                <input type="text" value={formData.mainGoal} onChange={e => setFormData({...formData, mainGoal: e.target.value})} className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" placeholder="e.g. Brand building & Sales" />
              </div>
            </div>

            <div className="col-span-full mt-2">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-1.5 text-gray-400" />
                অন্যান্য তথ্য (Notes)
              </label>
              <textarea 
                value={formData.notes || ''} 
                onChange={e => setFormData({...formData, notes: e.target.value})} 
                className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors min-h-[120px] resize-y leading-relaxed" 
                placeholder="অতিরিক্ত তথ্য বা পয়েন্ট এখানে লিখবেন..." 
              />
            </div>

          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition font-bold flex items-center shadow-md hover:shadow-lg w-full sm:w-auto justify-center">
              <Check size={20} className="mr-2" />
              {editingLead ? 'আপডেট করুন' : 'লিড সেভ করুন'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
