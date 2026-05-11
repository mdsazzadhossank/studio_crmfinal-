import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, MessageSquare, Clock, Plus, Settings, ChevronRight, CheckCircle, ExternalLink, Calendar as CalendarIcon, Phone, Loader, Download, Pin, Globe, TrendingUp, Video, BookOpen } from 'lucide-react';
import { parseClientData } from '../services/ai';

export type ServiceCategory = 'Website' | 'Automation' | 'Course' | 'Marketing' | 'Consultancy' | 'Video';
export type ClientStatus = 'Active' | 'Inactive';

export interface ClientProfile {
  id: string;
  businessName: string;
  websiteUrl: string;
  whatsappNumber: string;
  email: string;
  serviceType: ServiceCategory;
  status: ClientStatus;
  facebookPageLink: string;
  adAccountId: string;
  createdAt: string;
  isPinned?: boolean;
  
  // Facebook Ads Specific
  fbAdStartDate?: string;
  fbAdEndDate?: string;
  fbAdCampaignType?: string;
  fbAdCampaignName?: string;
  fbAdCampaignBudget?: string;
  
  // Website Specific
  websiteUsername?: string;
  websitePassword?: string;
  websiteProvider?: string;
  websiteType?: string;
  ecomFeatures?: string;
  productDesignDetails?: string;

  // General Added Fields
  businessLocation?: string;
  budget?: string;
  startDate?: string;
  deadline?: string;
  extraDetails?: string;

  // Marketing Specific
  marketingBusinessType?: string;
  campaignGoal?: string;
  businessAge?: string;
  assets?: string;
  contentDetails?: string;

  // Video Specific
  videoPurpose?: string;
  videoFormat?: string;
  videoDuration?: string;
  videoCount?: string;
  videoProductDetails?: string;
  videoProductPrice?: string;
  videoProductMaterial?: string;
  videoSellingPoint?: string;
  videoOfferDiscount?: string;
  referenceVideo?: string;
  videoScript?: string;
  videoLanguage?: string;

  // Automation Specific
  automationPurpose?: string;
  platformDetails?: string;
  offersDeliveryInfo?: string;
  pageCount?: string;
  targetPageLink?: string;
  hasWebsite?: string;
  automationWebsiteLink?: string;
  productCount?: string;
  averageProductPrice?: string;
  mainProducts?: string;
  productLinks?: string;
  hasOffer?: string;
  offerDetails?: string;
  deliveryCharge?: string;
  hasFreeDelivery?: string;
  paymentMethods?: string;
  customerInfoCollection?: string;
  commonCustomerQuestions?: string;
  commentReply?: string;
  inboxAutoMessage?: string;
  negativeCommentHandling?: string;
  automationTargetDestination?: string;

  // Course Specific
  courseInterest?: string;
  learningObjectives?: string;
  skillLevel?: string;
  toolFamiliarity?: string;
  classPreference?: string;
  classTime?: string;
  studentGoals?: string;

  // Consultancy Specific
  consultancyBusinessType?: string;
  challenge?: string;
}

export interface ClientComment {
  id: string;
  clientId: string;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface ClientReminder {
  id: string;
  clientId: string;
  text: string;
  assignedToId: string;
  dueDate: string;
  isFbAdEndReminder?: boolean;
}

export default function AllClients({ onNavigate, categoryProp = 'All' }: { onNavigate?: (tab: string) => void, categoryProp?: ServiceCategory | 'All' }) {
  const { currentUser, users } = useAuth();
  
  const [clients, setClients] = useState<ClientProfile[]>(() => {
    const saved = localStorage.getItem('allClientsData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return [];
  });
  const [comments, setComments] = useState<ClientComment[]>(() => {
    const saved = localStorage.getItem('allClientsComments');
    return saved ? JSON.parse(saved) : [];
  });
  const [reminders, setReminders] = useState<ClientReminder[]>(() => {
    const saved = localStorage.getItem('allClientsReminders');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeCategory, setActiveCategory] = useState<ServiceCategory | 'All'>(categoryProp);

  useEffect(() => {
    setActiveCategory(categoryProp);
    setSelectedClientId(null);
  }, [categoryProp]);

  const [activeStatusFilter, setActiveStatusFilter] = useState<ClientStatus | 'All'>('All');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<ClientProfile>>({
    serviceType: 'Marketing',
    status: 'Active'
  });
  const [rawText, setRawText] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const parseRawText = async () => {
    if (!rawText) return;
    
    setIsParsing(true);
    try {
      const extractedData = await parseClientData(rawText);
      if (extractedData) {
        const newFormData = { ...formData, ...extractedData };
        
        // Attempt to map extracted service type to our enums if possible
        if (newFormData.serviceType && typeof newFormData.serviceType === 'string') {
           const st = newFormData.serviceType.toLowerCase();
           if (st.includes('web')) newFormData.serviceType = 'Website';
           else if (st.includes('auto')) newFormData.serviceType = 'Automation';
           else if (st.includes('course')) newFormData.serviceType = 'Course';
           else newFormData.serviceType = 'Marketing';
        }
    
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

  // Save changes
  useEffect(() => {
    localStorage.setItem('allClientsData', JSON.stringify(clients));
  }, [clients]);
  useEffect(() => {
    localStorage.setItem('allClientsComments', JSON.stringify(comments));
  }, [comments]);
  useEffect(() => {
    localStorage.setItem('allClientsReminders', JSON.stringify(reminders));
  }, [reminders]);

  // 

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName) return;

    let clientId = formData.id;
    if (formData.id) {
      setClients(clients.map(c => c.id === formData.id ? { ...c, ...formData } as ClientProfile : c));
    } else {
      clientId = Date.now().toString();
      setClients([...clients, { ...formData, id: clientId, createdAt: new Date().toISOString() } as ClientProfile]);
    }
    
    // Auto-create notification for Facebook Ads End Date
    if ((formData.serviceType === 'Course' || formData.serviceType === 'Marketing') && formData.fbAdEndDate) {
      const exists = reminders.find(r => r.clientId === clientId && r.isFbAdEndReminder);
      if (!exists && currentUser) {
        const text = `Facebook Ad Campaign (Type: ${formData.fbAdCampaignType || 'N/A'}) Ending today for ${formData.businessName}. Please contact the client immediately!\n\nMessage template: \n"Hello, your Facebook Ads campaign ends today. Please let us know if you want to renew the campaign!"`;
        setReminders([...reminders, {
          id: Date.now().toString() + Math.random().toString(36).substring(7),
          clientId: clientId!,
          text,
          assignedToId: currentUser.id,
          dueDate: formData.fbAdEndDate,
          isFbAdEndReminder: true
        }]);
      }
    }

    setIsModalOpen(false);
    setFormData({ serviceType: 'Marketing', status: 'Active' });
  };

  const filteredClients = clients.filter(c => {
    if (activeCategory !== 'All' && c.serviceType !== activeCategory) return false;
    if (activeStatusFilter !== 'All' && c.status !== activeStatusFilter) return false;
    return true;
  }).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const selectedClient = clients.find(c => c.id === selectedClientId);

  const downloadNumbers = () => {
    const clientsToDownload = filteredClients.filter(c => c.whatsappNumber && c.whatsappNumber.trim() !== '');
    if (clientsToDownload.length === 0) {
      alert("বর্তমান ফিল্টারে কোনো ফোন নাম্বার পাওয়া যায়নি!");
      return;
    }
    const numbers = clientsToDownload.map(c => c.whatsappNumber).join('\n');
    const blob = new Blob([numbers], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `client_numbers_${activeCategory}_${activeStatusFilter}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full gap-6">
      {/* Left Sidebar for Client List */}
      <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">{activeCategory === 'All' ? 'অল লিড / ক্লায়েন্ট' : `${activeCategory} ক্লায়েন্ট`}</h2>
            <div className="flex gap-2">
              <button 
                onClick={downloadNumbers}
                title="ফিল্টার করা নাম্বারগুলো টেক্সট ফাইল হিসেবে ডাউনলোড করুন"
                className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 p-2 rounded-lg transition-colors"
                aria-label="Download Numbers"
              >
                <Download size={18} />
              </button>
              <button 
                onClick={() => { setFormData({ serviceType: activeCategory !== 'All' ? activeCategory as ServiceCategory : 'Marketing', status: 'Active' }); setRawText(''); setIsModalOpen(true); }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
          
          {categoryProp === 'All' && (
            <div className="flex flex-wrap gap-2">
              {['All', 'Website', 'Automation', 'Course', 'Marketing', 'Consultancy', 'Video'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat as any)}
                  className={`px-3 py-1 text-sm rounded-full ${activeCategory === cat ? 'bg-indigo-100 text-indigo-700 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
          
          <div className="flex gap-2 border-b border-gray-200 pb-2">
            <button 
              onClick={() => setActiveStatusFilter('All')}
              className={`pb-2 border-b-2 font-medium text-sm transition-colors ${activeStatusFilter === 'All' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              All
            </button>
            <button 
              onClick={() => setActiveStatusFilter('Active')}
              className={`pb-2 border-b-2 font-medium text-sm transition-colors ${activeStatusFilter === 'Active' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Active
            </button>
            <button 
              onClick={() => setActiveStatusFilter('Inactive')}
              className={`pb-2 border-b-2 font-medium text-sm transition-colors ${activeStatusFilter === 'Inactive' ? 'border-gray-500 text-gray-500' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              Inactive
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredClients.length === 0 ? (
            <div className="p-8 text-center text-gray-400">কোনো ক্লায়েন্ট পাওয়া যায়নি</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredClients.map(client => {
                const colors = {
                  'Website': 'bg-blue-500',
                  'Marketing': 'bg-indigo-500',
                  'Automation': 'bg-emerald-500',
                  'Course': 'bg-violet-500',
                  'Consultancy': 'bg-amber-500',
                  'Video': 'bg-pink-500'
                };
                const bgColors = {
                  'Website': 'bg-blue-50',
                  'Marketing': 'bg-indigo-50',
                  'Automation': 'bg-emerald-50',
                  'Course': 'bg-violet-50',
                  'Consultancy': 'bg-amber-50',
                  'Video': 'bg-pink-50'
                };
                const hoverColors = {
                   'Website': 'hover:bg-blue-50/50',
                   'Marketing': 'hover:bg-indigo-50/50',
                   'Automation': 'hover:bg-emerald-50/50',
                   'Course': 'hover:bg-violet-50/50',
                   'Consultancy': 'hover:bg-amber-50/50',
                   'Video': 'hover:bg-pink-50/50'
                };
                
                const typeColorStr = colors[client.serviceType as keyof typeof colors] || 'bg-gray-500';
                const bgTypeColorStr = bgColors[client.serviceType as keyof typeof bgColors] || 'bg-gray-50';
                const hoverTypeColorStr = hoverColors[client.serviceType as keyof typeof hoverColors] || 'hover:bg-gray-50/50';

                return (
                  <div
                    key={client.id}
                    className={`w-full flex items-stretch group transition-colors cursor-pointer ${hoverTypeColorStr} border-b border-gray-50 ${selectedClientId === client.id ? bgTypeColorStr : ''}`}
                  >
                    <div 
                      className={`w-1 flex-shrink-0 ${selectedClientId === client.id ? typeColorStr : 'bg-transparent group-hover:bg-gray-200'} transition-colors`}
                    />
                    <div
                      className="flex-1 p-4 min-w-0 flex flex-col justify-center"
                      onClick={() => setSelectedClientId(client.id)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 truncate flex items-center">
                          {client.isPinned && <Pin size={14} className="text-indigo-600 fill-indigo-100 mr-1.5 flex-shrink-0" />}
                          {client.businessName}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${client.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {client.status}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">{client.serviceType}</span>
                        <span className="text-xs text-gray-400 flex items-center ml-auto">
                          <CalendarIcon size={12} className="mr-1" />
                          {new Date(client.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center px-3 py-2 border-l border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setClients(clients.map(c => c.id === client.id ? { ...c, isPinned: !c.isPinned } : c)); }}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-md hover:bg-white border border-transparent hover:border-gray-200 shadow-sm transition-all focus:outline-none"
                        title={client.isPinned ? "Unpin Client" : "Pin Client"}
                      >
                        <Pin size={16} className={client.isPinned ? "text-indigo-600 fill-indigo-100" : ""} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Content Area */}
      <div className="w-2/3 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col relative overflow-hidden">
        {selectedClient ? (
          <ClientDetail 
            client={selectedClient} 
            users={users}
            currentUser={currentUser}
            comments={comments.filter(c => c.clientId === selectedClient.id)}
            reminders={reminders.filter(r => r.clientId === selectedClient.id)}
            onTogglePin={(id) => {
              setClients(clients.map(c => c.id === id ? { ...c, isPinned: !c.isPinned } : c));
            }}
            onAddComment={(text) => {
              if(!currentUser) return;
              setComments([{ id: Date.now().toString(), clientId: selectedClient.id, text, authorId: currentUser.id, authorName: currentUser.name, createdAt: new Date().toISOString() }, ...comments]);
            }}
            onAddReminder={(text, assignedToId, dueDate, isFbAdEndReminder) => {
              setReminders([{ id: Date.now().toString(), clientId: selectedClient.id, text, assignedToId, dueDate, isFbAdEndReminder }, ...reminders]);
            }}
            onDeleteReminder={(id) => setReminders(reminders.filter(r => r.id !== id))}
            onEditClient={(data) => {
               setFormData(data);
               setRawText('');
               setIsModalOpen(true);
            }}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Briefcase size={48} className="mx-auto mb-4 text-gray-200" />
              <p>বিস্তারিত দেখতে বাম পাশ থেকে একটি ক্লায়েন্ট নির্বাচন করুন</p>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold">{formData.id ? 'ক্লায়েন্ট প্রোফাইল সম্পাদনা করুন' : 'নতুন লিড/ক্লায়েন্ট যোগ করুন'}</h2>
            </div>
            
            <form onSubmit={handleSaveClient} className="p-6 space-y-4">
              <div className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <label className="block text-sm font-semibold text-indigo-900 mb-2">স্মার্ট পেস্ট (Smart Paste) ✨</label>
                <div className="flex gap-2">
                  <textarea 
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="পুরো টেক্সট এখানে পেস্ট করুন, তারপর অটো-ফিল বাটনে ক্লিক করুন..."
                    className="w-full h-20 text-sm border-indigo-200 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={parseRawText}
                    disabled={isParsing || !rawText.trim()}
                    className="shrink-0 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors font-medium text-sm flex flex-col items-center justify-center gap-1"
                  >
                    {isParsing ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>অটো</span>
                        <span>ফিল</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 mt-4"><hr/><p className="mt-2 text-sm font-bold text-indigo-700">জেনারেল তথ্য</p></div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">বিজনেস নাম *</label>
                  <input type="text" required value={formData.businessName || ''} onChange={e => setFormData({...formData, businessName: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ওয়েবসাইট URL</label>
                  <input type="url" value={formData.websiteUrl || ''} onChange={e => setFormData({...formData, websiteUrl: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp নাম্বার</label>
                  <input type="text" value={formData.whatsappNumber || ''} onChange={e => setFormData({...formData, whatsappNumber: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" placeholder="+880..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">সার্ভিস টাইপ</label>
                  <select value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value as any})} className="w-full border-gray-300 rounded-lg p-2.5 border bg-white outline-none focus:border-indigo-500 text-sm">
                    <option value="Website">Website</option>
                    <option value="Automation">Automation</option>
                    <option value="Course">Course</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Video">Video</option>
                    <option value="Consultancy">Consultancy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">স্ট্যাটাস</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full border-gray-300 rounded-lg p-2.5 border bg-white outline-none focus:border-indigo-500 text-sm">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ব্যবসার লোকেশন (ঠিকানা)</label>
                  <input type="text" value={formData.businessLocation || ''} onChange={e => setFormData({...formData, businessLocation: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ফেসবুক পেজ লিংক</label>
                  <input type="url" value={formData.facebookPageLink || ''} onChange={e => setFormData({...formData, facebookPageLink: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">অ্যাড অ্যাকাউন্ট আইডি</label>
                  <input type="text" value={formData.adAccountId || ''} onChange={e => setFormData({...formData, adAccountId: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" />
                </div>

                <div className="md:col-span-2 mt-4"><hr/><p className="mt-2 text-sm font-bold text-indigo-700">বাজেট ও টাইমলাইন</p></div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">আনুমানিক বাজেট *</label>
                  <input type="text" value={formData.budget || ''} onChange={e => setFormData({...formData, budget: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">কবে থেকে শুরু করতে চান? *</label>
                  <input type="date" value={formData.startDate || ''} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">কোনো ডেডলাইন আছে?</label>
                  <input type="date" value={formData.deadline || ''} onChange={e => setFormData({...formData, deadline: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">অতিরিক্ত তথ্য</label>
                  <textarea rows={1} value={formData.extraDetails || ''} onChange={e => setFormData({...formData, extraDetails: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm resize-none"></textarea>
                </div>

                {formData.serviceType === 'Marketing' && (
                  <>
                    <div className="md:col-span-2 mt-4"><hr/><p className="mt-2 text-sm font-bold text-indigo-700">মার্কেটিং সার্ভিস বিস্তারিত</p></div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ব্যবসার ধরন *</label>
                      <input type="text" value={formData.marketingBusinessType || ''} onChange={e => setFormData({...formData, marketingBusinessType: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাম্পেইনের মূল লক্ষ্য কী? *</label>
                      <select value={formData.campaignGoal || ''} onChange={e => setFormData({...formData, campaignGoal: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border bg-white outline-none focus:border-indigo-500 text-sm">
                        <option value="">নির্বাচন করুন</option>
                        <option value="sales">প্রোডাক্ট সেলস / বিক্রি বাড়ানো</option>
                        <option value="leads">লিড জেনারেশন (Customer Info)</option>
                        <option value="messages">মেসেজ পাওয়া</option>
                        <option value="awareness">ব্র্যান্ডিং ও রিচ (Awareness/Video Views)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ব্যবসার বয়স/বর্তমান অবস্থা</label>
                      <input type="text" value={formData.businessAge || ''} onChange={e => setFormData({...formData, businessAge: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">আপনার কি অ্যাড অ্যাকাউন্ট এবং পিক্সেল সেটআপ আছে?</label>
                      <textarea rows={2} value={formData.assets || ''} onChange={e => setFormData({...formData, assets: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm"></textarea>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">বিজ্ঞাপনের জন্য ছবি/ভিডিও (Content) কি তৈরি আছে?</label>
                      <textarea rows={2} value={formData.contentDetails || ''} onChange={e => setFormData({...formData, contentDetails: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm"></textarea>
                    </div>
                    
                    <div className="md:col-span-2 mt-4"><p className="text-sm font-bold text-gray-700">Facebook Ads Setup</p></div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাম্পেইন শুরুর তারিখ</label>
                      <input type="date" value={formData.fbAdStartDate || ''} onChange={e => setFormData({...formData, fbAdStartDate: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাম্পেইন শেষের তারিখ</label>
                      <input type="date" value={formData.fbAdEndDate || ''} onChange={e => setFormData({...formData, fbAdEndDate: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাম্পেইনের ধরন</label>
                      <select value={formData.fbAdCampaignType || ''} onChange={e => setFormData({...formData, fbAdCampaignType: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border bg-white outline-none focus:border-indigo-500 text-sm">
                        <option value="">নির্বাচন করুন</option>
                        <option value="Message">Message</option>
                        <option value="Sales">Sales</option>
                        <option value="Engagement">Engagement</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাম্পেইনের নাম</label>
                      <input type="text" value={formData.fbAdCampaignName || ''} onChange={e => setFormData({...formData, fbAdCampaignName: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">বাজেট (Dollar $)</label>
                      <input type="number" value={formData.fbAdCampaignBudget || ''} onChange={e => setFormData({...formData, fbAdCampaignBudget: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" />
                    </div>
                  </>
                )}
                
                {formData.serviceType === 'Website' && (
                  <>
                    <div className="md:col-span-2 mt-4"><hr/><p className="mt-2 text-sm font-bold text-indigo-700">ওয়েবসাইট সার্ভিস বিস্তারিত</p></div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ওয়েবসাইটের ধরন *</label>
                      <input type="text" value={formData.websiteType || ''} onChange={e => setFormData({...formData, websiteType: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">ই-কমার্স বা পেমেন্ট ফিচার প্রয়োজন কিনা?</label>
                      <textarea rows={2} value={formData.ecomFeatures || ''} onChange={e => setFormData({...formData, ecomFeatures: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm"></textarea>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">পছন্দের কোনো ডিজাইন বা প্রোডাক্টের বিস্তারিত</label>
                      <textarea rows={2} value={formData.productDesignDetails || ''} onChange={e => setFormData({...formData, productDesignDetails: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm"></textarea>
                    </div>
                    <div className="md:col-span-2 mt-2"><p className="text-sm font-bold text-gray-700">Website Credentials & Setup</p></div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">প্রোভাইডার</label>
                      <input type="text" value={formData.websiteProvider || ''} onChange={e => setFormData({...formData, websiteProvider: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">লাইভ লিংক</label>
                      <input type="url" value={formData.websiteUrl || ''} onChange={e => setFormData({...formData, websiteUrl: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ইউজারনেম / ইমেইল</label>
                      <input type="text" value={formData.websiteUsername || ''} onChange={e => setFormData({...formData, websiteUsername: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">পাসওয়ার্ড</label>
                      <input type="text" value={formData.websitePassword || ''} onChange={e => setFormData({...formData, websitePassword: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" />
                    </div>
                  </>
                )}

                {formData.serviceType === 'Video' && (
                  <>
                    <div className="md:col-span-2 mt-4"><hr/><p className="mt-2 text-sm font-bold text-indigo-700">ভিডিও কনটেন্ট সার্ভিস বিস্তারিত</p></div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">ভিডিওর উদ্দেশ্য কী? *</label>
                      <textarea rows={2} value={formData.videoPurpose || ''} onChange={e => setFormData({...formData, videoPurpose: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" placeholder="যেমন: Facebook Ads, TikTok Video..."></textarea>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">ভিডিও ফরম্যাট *</label>
                      <textarea rows={2} value={formData.videoFormat || ''} onChange={e => setFormData({...formData, videoFormat: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" placeholder="যেমন: Short Reels, Product Showcase..."></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">আনুমানিক ব্যাপ্তি (Duration)</label>
                      <select value={formData.videoDuration || ''} onChange={e => setFormData({...formData, videoDuration: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border bg-white outline-none focus:border-indigo-500 text-sm">
                        <option value="">নির্বাচন করুন</option>
                        <option value="6-10">৬–১০ সেকেন্ড</option>
                        <option value="11-15">১১–১৫ সেকেন্ড</option>
                        <option value="16-30">১৬–৩০ সেকেন্ড</option>
                        <option value="31-60">৩১–৬০ সেকেন্ড</option>
                        <option value="61-120">১–২ মিনিট</option>
                        <option value="120+">২ মিনিটের বেশি</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">কয়টি ভিডিও লাগবে? *</label>
                      <input type="number" value={formData.videoCount || ''} onChange={e => setFormData({...formData, videoCount: e.target.value})} placeholder="যেমন: ৫" className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" />
                    </div>
                    
                    <div className="md:col-span-2 mt-2"><p className="text-sm font-bold text-gray-700">প্রোডাক্ট তথ্য</p></div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">কোন প্রোডাক্ট/সার্ভিসের জন্য ভিডিও চান? *</label>
                      <textarea rows={2} value={formData.videoProductDetails || ''} onChange={e => setFormData({...formData, videoProductDetails: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">প্রোডাক্টের দাম</label>
                      <input type="text" value={formData.videoProductPrice || ''} onChange={e => setFormData({...formData, videoProductPrice: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" placeholder="যেমন: ৯৯০ টাকা" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">অফার/ডিসকাউন্ট</label>
                      <input type="text" value={formData.videoOfferDiscount || ''} onChange={e => setFormData({...formData, videoOfferDiscount: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" placeholder="যেমন: ১০% ছাড়" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">ফ্যাব্রিক/ম্যাটেরিয়াল/ডিটেইলস</label>
                      <textarea rows={2} value={formData.videoProductMaterial || ''} onChange={e => setFormData({...formData, videoProductMaterial: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" placeholder="যেমন: কটন, সিল্ক, লেদার ইত্যাদি"></textarea>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">গুরুত্বপূর্ণ সেলিং পয়েন্ট *</label>
                      <textarea rows={2} value={formData.videoSellingPoint || ''} onChange={e => setFormData({...formData, videoSellingPoint: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" placeholder="কেন কাস্টমার এই প্রোডাক্ট কিনবে?"></textarea>
                    </div>

                    <div className="md:col-span-2 mt-2"><p className="text-sm font-bold text-gray-700">ভিডিও রেফারেন্স ও ফাইল</p></div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">পছন্দের ভিডিও রেফারেন্স (লিংক)</label>
                      <input type="text" value={formData.referenceVideo || ''} onChange={e => setFormData({...formData, referenceVideo: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" placeholder="Facebook/TikTok/YouTube/Instagram ভিডিওর লিংক দিন" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">ভিডিওতে কোনো নির্দিষ্ট লেখা/স্ক্রিপ্ট দিতে চান?</label>
                      <textarea rows={2} value={formData.videoScript || ''} onChange={e => setFormData({...formData, videoScript: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm"></textarea>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">ভিডিওর ভাষা কী হবে?</label>
                      <input type="text" value={formData.videoLanguage || ''} onChange={e => setFormData({...formData, videoLanguage: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" placeholder="যেমন: বাংলা, ইংরেজি, বাংলা + ইংরেজি, ভয়েসওভার ছাড়া" />
                    </div>
                  </>
                )}

                {formData.serviceType === 'Automation' && (
                  <>
                    <div className="md:col-span-2 mt-4"><hr/><p className="mt-2 text-sm font-bold text-indigo-700">অটোমেশন ও চ্যাটবট সার্ভিস বিস্তারিত</p></div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">অটোমেশনের উদ্দেশ্য *</label>
                      <textarea rows={2} value={formData.automationPurpose || ''} onChange={e => setFormData({...formData, automationPurpose: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" placeholder="যেমন: Messenger Chatbot, WhatsApp Automation..."></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">কয়টি পেজ আছে? *</label>
                      <input type="text" value={formData.pageCount || ''} onChange={e => setFormData({...formData, pageCount: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">টার্গেট পেজ লিংক *</label>
                      <input type="text" value={formData.targetPageLink || ''} onChange={e => setFormData({...formData, targetPageLink: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ওয়েবসাইট আছে কি?</label>
                      <input type="text" value={formData.hasWebsite || ''} onChange={e => setFormData({...formData, hasWebsite: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ওয়েবসাইট লিংক</label>
                      <input type="text" value={formData.automationWebsiteLink || ''} onChange={e => setFormData({...formData, automationWebsiteLink: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">প্রোডাক্ট সংখ্যা</label>
                      <input type="text" value={formData.productCount || ''} onChange={e => setFormData({...formData, productCount: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">গড় দাম</label>
                      <input type="text" value={formData.averageProductPrice || ''} onChange={e => setFormData({...formData, averageProductPrice: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" />
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-sm font-medium text-gray-700 mb-1">প্রধান প্রোডাক্টসমূহ *</label>
                       <textarea rows={2} value={formData.mainProducts || ''} onChange={e => setFormData({...formData, mainProducts: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm"></textarea>
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-sm font-medium text-gray-700 mb-1">কাস্টমার ডেটা কালেকশন *</label>
                       <textarea rows={2} value={formData.customerInfoCollection || ''} onChange={e => setFormData({...formData, customerInfoCollection: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm"></textarea>
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-sm font-medium text-gray-700 mb-1">সাধারণ প্রশ্ন *</label>
                       <textarea rows={2} value={formData.commonCustomerQuestions || ''} onChange={e => setFormData({...formData, commonCustomerQuestions: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm"></textarea>
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-sm font-medium text-gray-700 mb-1">অটোমেশন ডেস্টিনেশন *</label>
                       <textarea rows={2} value={formData.automationTargetDestination || ''} onChange={e => setFormData({...formData, automationTargetDestination: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm"></textarea>
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-sm font-medium text-gray-700 mb-1">অন্যান্য তথ্য (অফার, লিংক, পেমেন্ট, রিপ্লাই)</label>
                       <textarea rows={3} value={formData.platformDetails || ''} onChange={e => setFormData({...formData, platformDetails: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm"></textarea>
                    </div>
                  </>
                )}

                {formData.serviceType === 'Course' && (
                  <>
                    <div className="md:col-span-2 mt-4"><hr/><p className="mt-2 text-sm font-bold text-indigo-700">কোর্স ও ট্রেনিং সার্ভিস বিস্তারিত</p></div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">কোন কোর্সে আগ্রহী? *</label>
                      <select value={formData.courseInterest || ''} onChange={e => setFormData({...formData, courseInterest: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border bg-white outline-none focus:border-indigo-500 text-sm">
                        <option value="">নির্বাচন করুন</option>
                        <option value="digital_marketing">Digital Marketing</option>
                        <option value="wordpress">WordPress Website</option>
                        <option value="landing_page">Landing Page Design</option>
                        <option value="other">অন্যান্য</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">শেখার মূল উদ্দেশ্য কী? *</label>
                      <input type="text" value={formData.learningObjectives || ''} onChange={e => setFormData({...formData, learningObjectives: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">বর্তমান স্কিল লেভেল এবং পূর্ব অভিজ্ঞতা</label>
                      <textarea rows={2} value={formData.skillLevel || ''} onChange={e => setFormData({...formData, skillLevel: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">টুলস বা প্ল্যাটফর্ম সম্পর্কে ধারণা</label>
                      <input type="text" value={formData.toolFamiliarity || ''} onChange={e => setFormData({...formData, toolFamiliarity: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ক্লাসের ধরনে পছন্দ *</label>
                      <select value={formData.classPreference || ''} onChange={e => setFormData({...formData, classPreference: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border bg-white outline-none focus:border-indigo-500 text-sm">
                        <option value="">নির্বাচন করুন</option>
                        <option value="online_live">Online LIVE Class</option>
                        <option value="pre_recorded">Pre-recorded Video</option>
                        <option value="offline">Offline/Physical Class</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ক্লাসের সুবিধাজনক সময় *</label>
                      <input type="text" value={formData.classTime || ''} onChange={e => setFormData({...formData, classTime: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">এই কোর্স শেষে আপনার প্রধান লক্ষ্য কী?</label>
                      <textarea rows={2} value={formData.studentGoals || ''} onChange={e => setFormData({...formData, studentGoals: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm"></textarea>
                    </div>
                  </>
                )}

                {formData.serviceType === 'Consultancy' && (
                  <>
                    <div className="md:col-span-2 mt-4"><hr/><p className="mt-2 text-sm font-bold text-indigo-700">বিজনেস কনসালটেন্সি বিস্তারিত</p></div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">আপনার ব্যবসার ধরন কী? *</label>
                      <input type="text" value={formData.consultancyBusinessType || ''} onChange={e => setFormData({...formData, consultancyBusinessType: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">বর্তমানে ব্যবসায়ের মূল চ্যালেঞ্জটি কী? *</label>
                      <textarea rows={3} value={formData.challenge || ''} onChange={e => setFormData({...formData, challenge: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:border-indigo-500 text-sm"></textarea>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">বাতিল</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">সেভ করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ClientDetail({ client, users, currentUser, comments, reminders, onAddComment, onAddReminder, onDeleteReminder, onEditClient, onTogglePin }: any) {
  const [newComment, setNewComment] = useState('');
  const [newReminder, setNewReminder] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderAssignee, setReminderAssignee] = useState('');
  const [editableCampaignMessage, setEditableCampaignMessage] = useState<string>('');

  useEffect(() => {
    if (client) {
      const defaultMsg = `Hello Boss,\nYour Facebook Ads campaign details are as follows:\n\n${client.fbAdCampaignName ? `🏷️ Campaign Name: ${client.fbAdCampaignName}\n` : ''}${client.fbAdCampaignType ? `🎯 Type: ${client.fbAdCampaignType}\n` : ''}${client.fbAdCampaignBudget ? `💰 Budget: $${client.fbAdCampaignBudget}\n` : ''}${client.fbAdStartDate ? `📅 Start Date: ${client.fbAdStartDate}\n` : ''}${client.fbAdEndDate ? `⏳ End Date: ${client.fbAdEndDate}\n` : ''}\nPlease review this information.\nThank you!`;
      setEditableCampaignMessage(defaultMsg);
    }
  }, [client]);

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if(newReminder && reminderDate && reminderAssignee) {
      onAddReminder(newReminder, reminderAssignee, reminderDate, false);
      setNewReminder('');
      setReminderDate('');
      setReminderAssignee('');
    }
  };

  const handleSetFbAdReminder = () => {
    if(client.fbAdEndDate) {
      alert('সফলভাবে ক্যাম্পেইন শেষের রিমাইন্ডার সেট করা হয়েছে!');
      onAddReminder(
        `Facebook Ad Campaign Ending today for ${client.businessName}. Please contact the client immediately!\n\nMessage template: \n"Hello, your Facebook Ads campaign ends today. Please let us know if you want to renew the campaign!"`,
        currentUser.id, // Or assign to specific
        client.fbAdEndDate,
        true
      );
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-white shadow-sm z-10 flex-shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.businessName}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${client.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {client.status}
              </span>
              <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full text-xs font-medium border border-indigo-100">
                {client.serviceType}
              </span>
              {client.whatsappNumber && (
                <a href={`https://wa.me/${client.whatsappNumber}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:underline bg-green-50 px-2 py-0.5 rounded-md">
                  <Phone size={14} /> WhatsApp
                </a>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => onTogglePin?.(client.id)} className={`p-2 rounded-full transition-colors ${client.isPinned ? 'text-indigo-600 bg-indigo-50 border border-indigo-200' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`} title={client.isPinned ? "পিন সরানো" : "পিন করুন"}>
              <Pin size={20} className={client.isPinned ? "fill-indigo-100" : ""} />
            </button>
            <button onClick={() => onEditClient(client)} className="text-gray-400 hover:text-indigo-600 p-2 rounded-full hover:bg-indigo-50 transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/50">
        
        {/* General Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Email</p>
            <p className="text-sm font-medium text-gray-900">{client.email || 'N/A'}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Website</p>
            <p className="text-sm font-medium text-gray-900 truncate">
              {client.websiteUrl ? <a href={client.websiteUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1">{client.websiteUrl} <ExternalLink size={14} /></a> : 'N/A'}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Facebook Page</p>
            <p className="text-sm font-medium text-gray-900 truncate">
              {client.facebookPageLink ? <a href={client.facebookPageLink} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1">{client.facebookPageLink} <ExternalLink size={14} /></a> : 'N/A'}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Ad Account ID</p>
            <p className="text-sm font-medium text-gray-900">{client.adAccountId || 'N/A'}</p>
          </div>
          {(client.businessLocation || client.budget || client.startDate || client.deadline) && (
            <div className="col-span-2 grid grid-cols-2 gap-4">
              {client.businessLocation && (
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Location</p>
                  <p className="text-sm font-medium text-gray-900 whitespace-pre-wrap">{client.businessLocation}</p>
                </div>
              )}
              {client.budget && (
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Budget</p>
                  <p className="text-sm font-medium text-gray-900">{client.budget}</p>
                </div>
              )}
              {client.startDate && (
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Start Date</p>
                  <p className="text-sm font-medium text-gray-900">{client.startDate}</p>
                </div>
              )}
              {client.deadline && (
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Deadline</p>
                  <p className="text-sm font-medium text-gray-900">{client.deadline}</p>
                </div>
              )}
            </div>
          )}
          {client.extraDetails && (
             <div className="col-span-2 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
               <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Extra Details</p>
               <p className="text-sm font-medium text-gray-900 whitespace-pre-wrap">{client.extraDetails}</p>
             </div>
          )}
        </div>

        {client.serviceType === 'Website' && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-blue-800 font-semibold">
              <Globe size={18} />
              <span>ওয়েবসাইট সার্ভিস বিস্তারিত</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               {client.websiteType && (
                 <div className="bg-white p-3 rounded-lg border border-blue-50 shadow-sm text-sm col-span-2">
                    <p className="text-gray-500 text-xs mb-1">ওয়েবসাইটের ধরন</p>
                    <p className="font-medium text-gray-900">{client.websiteType}</p>
                 </div>
               )}
               {client.ecomFeatures && (
                 <div className="bg-white p-3 rounded-lg border border-blue-50 shadow-sm text-sm col-span-2">
                    <p className="text-gray-500 text-xs mb-1">ই-কমার্স বা পেমেন্ট ফিচার প্রয়োজন কিনা?</p>
                    <p className="font-medium text-gray-900">{client.ecomFeatures}</p>
                 </div>
               )}
               {client.productDesignDetails && (
                 <div className="bg-white p-3 rounded-lg border border-blue-50 shadow-sm text-sm col-span-2">
                    <p className="text-gray-500 text-xs mb-1">পছন্দের ডিজাইন বা প্রোডাক্টের বিস্তারিত</p>
                    <p className="font-medium text-gray-900 whitespace-pre-wrap">{client.productDesignDetails}</p>
                 </div>
               )}
            </div>

            {(client.websiteProvider || client.websiteUsername) && (
              <>
                <p className="text-sm font-semibold text-blue-800 border-t border-blue-100 pt-3">Website Credentials Setup</p>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white p-3 rounded-lg border border-blue-50 shadow-sm text-sm">
                      <p className="text-gray-500 text-xs mb-1">Provider</p>
                      <p className="font-medium text-gray-900">{client.websiteProvider || 'N/A'}</p>
                   </div>
                   <div className="bg-white p-3 rounded-lg border border-blue-50 shadow-sm text-sm">
                      <p className="text-gray-500 text-xs mb-1">Username / Email</p>
                      <p className="font-medium text-gray-900">{client.websiteUsername || 'N/A'}</p>
                   </div>
                   <div className="bg-white p-3 rounded-lg border border-blue-50 shadow-sm text-sm text-ellipsis overflow-hidden">
                      <p className="text-gray-500 text-xs mb-1">Password</p>
                      <p className="font-medium text-gray-900 select-all">{client.websitePassword ? '••••••••' : 'N/A'}</p>
                      {client.websitePassword && (
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(client.websitePassword!);
                            alert('Password copied!');
                          }}
                          className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                        >
                           Copy Password
                        </button>
                      )}
                   </div>
                </div>
              </>
            )}
          </div>
        )}

        {client.serviceType === 'Marketing' && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-indigo-800 font-semibold">
              <TrendingUp size={18} />
              <span>মার্কেটিং সার্ভিস বিস্তারিত</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               {client.marketingBusinessType && (
                 <div className="bg-white p-3 rounded-lg border border-indigo-50 shadow-sm text-sm">
                    <p className="text-gray-500 text-xs mb-1">ব্যবসার ধরন</p>
                    <p className="font-medium text-gray-900">{client.marketingBusinessType}</p>
                 </div>
               )}
               {client.campaignGoal && (
                 <div className="bg-white p-3 rounded-lg border border-indigo-50 shadow-sm text-sm">
                    <p className="text-gray-500 text-xs mb-1">ক্যাম্পেইনের মূল লক্ষ্য</p>
                    <p className="font-medium text-gray-900 capitalize">{client.campaignGoal}</p>
                 </div>
               )}
               {client.businessAge && (
                 <div className="bg-white p-3 rounded-lg border border-indigo-50 shadow-sm text-sm">
                    <p className="text-gray-500 text-xs mb-1">ব্যবসার বয়স/বর্তমান অবস্থা</p>
                    <p className="font-medium text-gray-900">{client.businessAge}</p>
                 </div>
               )}
               {client.assets && (
                 <div className="bg-white p-3 rounded-lg border border-indigo-50 shadow-sm text-sm col-span-2">
                    <p className="text-gray-500 text-xs mb-1">অ্যাড অ্যাকাউন্ট এবং পিক্সেল সেটআপ</p>
                    <p className="font-medium text-gray-900">{client.assets}</p>
                 </div>
               )}
               {client.contentDetails && (
                 <div className="bg-white p-3 rounded-lg border border-indigo-50 shadow-sm text-sm col-span-2">
                    <p className="text-gray-500 text-xs mb-1">বিজ্ঞাপনের জন্য ছবি/ভিডিও</p>
                    <p className="font-medium text-gray-900">{client.contentDetails}</p>
                 </div>
               )}
            </div>
          </div>
        )}

        {client.serviceType === 'Video' && (
          <div className="bg-pink-50 border border-pink-100 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-pink-800 font-semibold">
              <Video size={18} />
              <span>ভিডিও কনটেন্ট সার্ভিস বিস্তারিত</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               {client.videoPurpose && (
                 <div className="bg-white p-3 rounded-lg border border-pink-50 shadow-sm text-sm col-span-2">
                    <p className="text-gray-500 text-xs mb-1">ভিডিওর উদ্দেশ্য কী?</p>
                    <p className="font-medium text-gray-900">{client.videoPurpose}</p>
                 </div>
               )}
               {client.videoFormat && (
                 <div className="bg-white p-3 rounded-lg border border-pink-50 shadow-sm text-sm">
                    <p className="text-gray-500 text-xs mb-1">ভিডিও ফরম্যাট</p>
                    <p className="font-medium text-gray-900">{client.videoFormat}</p>
                 </div>
               )}
               {client.videoDuration && (
                 <div className="bg-white p-3 rounded-lg border border-pink-50 shadow-sm text-sm">
                    <p className="text-gray-500 text-xs mb-1">আনুমানিক ব্যাপ্তি (Duration)</p>
                    <p className="font-medium text-gray-900">{client.videoDuration}</p>
                 </div>
               )}
               {client.videoCount && (
                 <div className="bg-white p-3 rounded-lg border border-pink-50 shadow-sm text-sm">
                    <p className="text-gray-500 text-xs mb-1">কয়টি ভিডিও লাগবে?</p>
                    <p className="font-medium text-gray-900">{client.videoCount}</p>
                 </div>
               )}
               {client.videoProductDetails && (
                 <div className="bg-white p-3 rounded-lg border border-pink-50 shadow-sm text-sm col-span-2">
                    <p className="text-gray-500 text-xs mb-1">প্রোডাক্ট/সার্ভিস বিস্তারিত</p>
                    <p className="font-medium text-gray-900 whitespace-pre-wrap">{client.videoProductDetails}</p>
                 </div>
               )}
               {client.videoProductPrice && (
                 <div className="bg-white p-3 rounded-lg border border-pink-50 shadow-sm text-sm">
                    <p className="text-gray-500 text-xs mb-1">প্রোডাক্টের দাম</p>
                    <p className="font-medium text-gray-900">{client.videoProductPrice}</p>
                 </div>
               )}
               {client.videoOfferDiscount && (
                 <div className="bg-white p-3 rounded-lg border border-pink-50 shadow-sm text-sm">
                    <p className="text-gray-500 text-xs mb-1">অফার/ডিসকাউন্ট</p>
                    <p className="font-medium text-gray-900">{client.videoOfferDiscount}</p>
                 </div>
               )}
               {client.videoProductMaterial && (
                 <div className="bg-white p-3 rounded-lg border border-pink-50 shadow-sm text-sm col-span-2">
                    <p className="text-gray-500 text-xs mb-1">ফ্যাব্রিক/ম্যাটেরিয়াল/ডিটেইলস</p>
                    <p className="font-medium text-gray-900 whitespace-pre-wrap">{client.videoProductMaterial}</p>
                 </div>
               )}
               {client.videoSellingPoint && (
                 <div className="bg-white p-3 rounded-lg border border-pink-50 shadow-sm text-sm col-span-2">
                    <p className="text-gray-500 text-xs mb-1">গুরুত্বপূর্ণ সেলিং পয়েন্ট</p>
                    <p className="font-medium text-gray-900 whitespace-pre-wrap">{client.videoSellingPoint}</p>
                 </div>
               )}
               {client.referenceVideo && (
                 <div className="bg-white p-3 rounded-lg border border-pink-50 shadow-sm text-sm col-span-2">
                    <p className="text-gray-500 text-xs mb-1">রেফারেন্স ভিডিও লিংক</p>
                    <p className="font-medium text-pink-600 truncate"><a href={client.referenceVideo} target="_blank" rel="noreferrer">{client.referenceVideo}</a></p>
                 </div>
               )}
               {client.videoScript && (
                 <div className="bg-white p-3 rounded-lg border border-pink-50 shadow-sm text-sm col-span-2">
                    <p className="text-gray-500 text-xs mb-1">নির্দিষ্ট লেখা/স্ক্রিপ্ট</p>
                    <p className="font-medium text-gray-900 whitespace-pre-wrap">{client.videoScript}</p>
                 </div>
               )}
               {client.videoLanguage && (
                 <div className="bg-white p-3 rounded-lg border border-pink-50 shadow-sm text-sm col-span-2">
                    <p className="text-gray-500 text-xs mb-1">ভিডিওর ভাষা</p>
                    <p className="font-medium text-gray-900">{client.videoLanguage}</p>
                 </div>
               )}
            </div>
          </div>
        )}

        {client.serviceType === 'Automation' && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold">
              <MessageSquare size={18} />
              <span>অটোমেশন ও চ্যাটবট সার্ভিস বিস্তারিত</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               {client.automationPurpose && (
                 <div className="bg-white p-3 rounded-lg border border-emerald-50 shadow-sm text-sm col-span-2">
                    <p className="text-gray-500 text-xs mb-1">অটোমেশনের মূল উদ্দেশ্য কী?</p>
                    <p className="font-medium text-gray-900">{client.automationPurpose}</p>
                 </div>
               )}
               {client.platformDetails && (
                 <div className="bg-white p-3 rounded-lg border border-emerald-50 shadow-sm text-sm col-span-2">
                    <p className="text-gray-500 text-xs mb-1">পেজ বা ওয়েবসাইটের বিস্তারিত</p>
                    <p className="font-medium text-gray-900 whitespace-pre-wrap">{client.platformDetails}</p>
                 </div>
               )}
               {client.offersDeliveryInfo && (
                 <div className="bg-white p-3 rounded-lg border border-emerald-50 shadow-sm text-sm col-span-2">
                    <p className="text-gray-500 text-xs mb-1">অফার, ডেলিভারি এবং সেলস এর সাধারণ তথ্য</p>
                    <p className="font-medium text-gray-900 whitespace-pre-wrap">{client.offersDeliveryInfo}</p>
                 </div>
               )}
            </div>
          </div>
        )}

        {client.serviceType === 'Course' && (
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-purple-800 font-semibold">
              <BookOpen size={18} />
              <span>কোর্স ও ট্রেনিং সার্ভিস বিস্তারিত</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               {client.courseInterest && (
                 <div className="bg-white p-3 rounded-lg border border-purple-50 shadow-sm text-sm">
                    <p className="text-gray-500 text-xs mb-1">কোন কোর্সে আগ্রহী?</p>
                    <p className="font-medium text-gray-900 capitalize">{client.courseInterest}</p>
                 </div>
               )}
               {client.learningObjectives && (
                 <div className="bg-white p-3 rounded-lg border border-purple-50 shadow-sm text-sm">
                    <p className="text-gray-500 text-xs mb-1">শেখার মূল উদ্দেশ্য কী?</p>
                    <p className="font-medium text-gray-900">{client.learningObjectives}</p>
                 </div>
               )}
               {client.classPreference && (
                 <div className="bg-white p-3 rounded-lg border border-purple-50 shadow-sm text-sm">
                    <p className="text-gray-500 text-xs mb-1">ক্লাসের ধরনে পছন্দ</p>
                    <p className="font-medium text-gray-900 capitalize">{client.classPreference}</p>
                 </div>
               )}
               {client.classTime && (
                 <div className="bg-white p-3 rounded-lg border border-purple-50 shadow-sm text-sm">
                    <p className="text-gray-500 text-xs mb-1">ক্লাসের সুবিধাজনক সময়</p>
                    <p className="font-medium text-gray-900">{client.classTime}</p>
                 </div>
               )}
               {client.toolFamiliarity && (
                 <div className="bg-white p-3 rounded-lg border border-purple-50 shadow-sm text-sm col-span-2">
                    <p className="text-gray-500 text-xs mb-1">টুলস বা প্ল্যাটফর্ম সম্পর্কে ধারণা</p>
                    <p className="font-medium text-gray-900">{client.toolFamiliarity}</p>
                 </div>
               )}
               {client.skillLevel && (
                 <div className="bg-white p-3 rounded-lg border border-purple-50 shadow-sm text-sm col-span-2">
                    <p className="text-gray-500 text-xs mb-1">বর্তমান স্কিল লেভেল এবং পূর্ব অভিজ্ঞতা</p>
                    <p className="font-medium text-gray-900 whitespace-pre-wrap">{client.skillLevel}</p>
                 </div>
               )}
               {client.studentGoals && (
                 <div className="bg-white p-3 rounded-lg border border-purple-50 shadow-sm text-sm col-span-2">
                    <p className="text-gray-500 text-xs mb-1">এই কোর্স শেষে আপনার প্রধান লক্ষ্য কী?</p>
                    <p className="font-medium text-gray-900 whitespace-pre-wrap">{client.studentGoals}</p>
                 </div>
               )}
            </div>
          </div>
        )}

        {client.serviceType === 'Consultancy' && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-amber-800 font-semibold">
              <Briefcase size={18} />
              <span>বিজনেস কনসালটেন্সি বিস্তারিত</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               {client.consultancyBusinessType && (
                 <div className="bg-white p-3 rounded-lg border border-amber-50 shadow-sm text-sm col-span-2">
                    <p className="text-gray-500 text-xs mb-1">আপনার ব্যবসার ধরন কী?</p>
                    <p className="font-medium text-gray-900">{client.consultancyBusinessType}</p>
                 </div>
               )}
               {client.challenge && (
                 <div className="bg-white p-3 rounded-lg border border-amber-50 shadow-sm text-sm col-span-2">
                    <p className="text-gray-500 text-xs mb-1">বর্তমানে ব্যবসায়ের মূল চ্যালেঞ্জটি কী?</p>
                    <p className="font-medium text-gray-900 whitespace-pre-wrap">{client.challenge}</p>
                 </div>
               )}
            </div>
          </div>
        )}

        {(client.serviceType === 'Course' || client.serviceType === 'Marketing') && (client.fbAdStartDate || client.fbAdEndDate) && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-indigo-800 font-semibold">
                <CalendarIcon size={18} />
                <span>Facebook Ads Campaign</span>
              </div>
              {client.fbAdEndDate && (
                <button onClick={handleSetFbAdReminder} className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-indigo-700 shadow-sm transition-colors">
                  অটো রিমাইন্ডার সেট করুন
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
               <div className="bg-white p-3 rounded-lg border border-indigo-50 shadow-sm text-sm">
                  <p className="text-gray-500 text-xs mb-1">Campaign Name</p>
                  <p className="font-medium text-gray-900">{client.fbAdCampaignName || 'N/A'}</p>
               </div>
               <div className="bg-white p-3 rounded-lg border border-indigo-50 shadow-sm text-sm">
                  <p className="text-gray-500 text-xs mb-1">Campaign Type</p>
                  <p className="font-medium text-gray-900">{client.fbAdCampaignType || 'N/A'}</p>
               </div>
               <div className="bg-white p-3 rounded-lg border border-indigo-50 shadow-sm text-sm">
                  <p className="text-gray-500 text-xs mb-1">Budget</p>
                  <p className="font-medium text-gray-900">{client.fbAdCampaignBudget ? `$${client.fbAdCampaignBudget}` : 'N/A'}</p>
               </div>
               <div className="bg-white p-3 rounded-lg border border-indigo-50 shadow-sm text-sm">
                  <p className="text-gray-500 text-xs mb-1">Duration</p>
                  <p className="font-medium text-gray-900">{client.fbAdStartDate || '?'} to {client.fbAdEndDate || '?'}</p>
               </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-inner">
               <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Campaign Message Preview</p>
               <textarea 
                 value={editableCampaignMessage}
                 onChange={(e) => setEditableCampaignMessage(e.target.value)}
                 className="w-full text-sm text-gray-700 font-sans bg-gray-50 p-4 rounded-lg border border-gray-100 leading-relaxed outline-none focus:ring-2 focus:ring-indigo-100 resize-y"
                 rows={10}
               />
               <div className="flex gap-3 mt-3">
                 <button 
                   onClick={() => {
                     navigator.clipboard.writeText(editableCampaignMessage);
                     alert('মেসেজ কপি করা হয়েছে!');
                   }}
                   className="text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
                 >
                   কপি করুন
                 </button>
                 {client.whatsappNumber && (
                    <a 
                      href={`https://wa.me/${client.whatsappNumber}?text=${encodeURIComponent(editableCampaignMessage)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Phone size={16} />
                      WhatsApp-এ পাঠান
                    </a>
                 )}
               </div>
            </div>
          </div>
        )}

        {/* Reminders section */}
        <div>
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Clock size={18} className="text-orange-500" /> રিমাইন্ডার
          </h3>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <form onSubmit={handleAddReminder} className="p-3 bg-gray-50 border-b border-gray-200 flex gap-2">
              <input type="text" placeholder="রিমাইন্ডার টাইটেল..." value={newReminder} onChange={e => setNewReminder(e.target.value)} className="flex-1 p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none" required />
              <input type="date" value={reminderDate} onChange={e => setReminderDate(e.target.value)} className="p-2 text-sm border border-gray-300 rounded w-32 focus:ring-1 focus:ring-indigo-500 outline-none" required />
              <select value={reminderAssignee} onChange={e => setReminderAssignee(e.target.value)} className="p-2 text-sm border border-gray-300 rounded w-32 focus:ring-1 focus:ring-indigo-500 outline-none bg-white" required>
                <option value="">কর্মচারী</option>
                {users?.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              <button type="submit" className="bg-gray-800 text-white px-4 rounded font-medium text-sm hover:bg-gray-900">+</button>
            </form>
            <div className="p-0">
               {reminders.length === 0 ? (
                 <p className="text-center text-gray-400 text-sm py-4">কোনো রিমাইন্ডার নেই</p>
               ) : (
                 <div className="divide-y divide-gray-100">
                    {reminders.map((r: any) => {
                       const assignedUser = users?.find((u: any) => u.id === r.assignedToId);
                       return (
                       <div key={r.id} className={`p-3 flex justify-between items-start gap-4 ${r.isFbAdEndReminder ? 'bg-orange-50/50' : ''}`}>
                         <div>
                            <p className="text-sm font-medium text-gray-800 whitespace-pre-wrap">{r.text}</p>
                            <div className="flex gap-3 text-xs text-gray-500 mt-1">
                               <span><strong className="text-gray-600">তারিখ:</strong> {r.dueDate}</span>
                               <span><strong className="text-gray-600">এসাইন:</strong> {assignedUser?.name || 'Unknown'}</span>
                            </div>
                         </div>
                         <button onClick={() => onDeleteReminder(r.id)} className="text-gray-400 hover:text-red-500">
                           <CheckCircle size={18} />
                         </button>
                       </div>
                    )})}
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div>
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <MessageSquare size={18} className="text-indigo-500" /> কমেন্টস ও হিস্টোরি
          </h3>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col max-h-[400px]">
             <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {comments.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-8">কোনো কমেন্ট বা হিস্টোরি নেই</p>
                ) : (
                  comments.map((c: any) => (
                    <div key={c.id} className="bg-gray-50 p-3 rounded-lg rounded-tl-none relative w-[85%] border border-gray-100">
                       <p className="text-sm text-gray-800 whitespace-pre-wrap">{c.text}</p>
                       <p className="text-[10px] text-gray-500 mt-2 flex justify-between">
                         <span className="font-medium text-gray-700">{c.authorName}</span>
                         <span>{new Date(c.createdAt).toLocaleString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric' })}</span>
                       </p>
                    </div>
                  ))
                )}
             </div>
             <div className="border-t border-gray-100 p-3 bg-gray-50 flex gap-2">
                <textarea 
                  value={newComment} 
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="নতুন কমেন্ট লিখুন..." 
                  className="flex-1 resize-none h-10 min-h-10 border border-gray-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                />
                <button 
                  onClick={() => { if(newComment) { onAddComment(newComment); setNewComment(''); } }}
                  disabled={!newComment.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                >
                  Send
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
