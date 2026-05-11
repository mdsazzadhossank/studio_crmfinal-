import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Tag, MessageSquare, Bell, Edit2, Pin, UserPlus } from 'lucide-react';
import Modal from '../Modal';

const initialGeneralClients: any[] = [
  {
    id: 'demo1',
    name: 'Rafiqul Islam',
    company: 'Trendz BD',
    phone: '+8801711223344',
    tags: ['E-commerce', 'Hot Lead'],
    pinnedComment: 'Needs full funnel setup (FB Ads + Pixel).',
    reminder: 'Call tomorrow at 4 PM for finalizing budget.',
    lastUpdate: new Date().toISOString(),
    updateNote: 'Had a 30-min discovery call. Wants to scale to 50 orders/day.',
    info: {
      bizCategory: 'Men\'s Fashion', bizProducts: 'T-shirt, Jeans, Panjabi', bizLocation: 'Dhaka, Bangladesh', bizArea: 'সারা বাংলাদেশ', bizAge: '2 Years',
      prodMain: 'Premium Panjabi', prodPromote: 'Panjabi Collection', prodPrice: '1500-3500 BDT', prodOffer: 'Free Delivery on 2 items', prodMedia: 'Yes, studio photography ready', prodUSP: '100% Cotton, Unique Design',
      tgtWho: 'Young Professionals, University Students', tgtAge: '18-35', tgtGender: 'Male', tgtLocation: 'Dhaka, Ctg, Sylhet', tgtInterest: 'Fashion, Online Shopping', tgtProblem: 'Cannot find good fitting premium panjabis at a reasonable price', tgtB2B: 'B2C',
      goalMain: 'বেশি সেল', goalFollowers: 'Yes, Branding needed', goalTraffic: 'Yes', goalLead: 'No', goalExpectedSales: '50 Sales/day', goalDuration: '2 Months Minimum',
      bgAd: '2000 BDT/day', bgService: '15000 BDT/month', bgPrevAds: 'Yes, Boosted from page', bgPrevSpend: '100 USD', bgPrevResult: 'Got messages but low conversion',
      socialFb: 'facebook.com/trendzbd', socialIg: 'instagram.com/trendzbd', socialYt: '', socialBm: 'Yes', socialAdAcc: 'Yes', socialPixel: 'No', socialContact: '+8801711223344',
      webExists: 'Yes', webLink: 'www.trendzbd.com', webLp: 'Yes', webSpeed: 'Good', webTracking: 'Need setup', webAccess: 'Can provide',
      contentMedia: 'Yes', contentOld: 'Yes', contentNeed: 'Need ad creatives', contentBrand: 'Black and Gold, Serif font', contentTone: 'Premium, Formal', contentReview: 'Yes, screenshots from FB',
      compMain: 'Illusion, Artisan', compLink: '', compOffer: '10% discount', compDiff: 'Better quality at a lower price margin',
      salesOrder: 'Website + WhatsApp', salesDelivery: 'Steadfast', salesPayment: 'COD', salesWhoReply: 'In-house support team', salesReplyTime: 'Within 5-10 mins', salesScript: 'Have a basic script',
      polRefund: '3 days return policy', polDelivery: 'Inside Dhaka 60, Outside 120', polTerms: 'Standard', polForbidden: 'No', polMeta: 'No',
      repFreq: 'Weekly', repMethod: 'WhatsApp Update', repDecisionMaker: 'Rafiqul (Owner)', repEmergency: '+8801711223344'
    }
  },
  {
    id: 'demo2',
    name: 'Sadia Rahman',
    company: 'Glow Skincare',
    phone: '+8801811998877',
    tags: ['Local Business', 'Follow up'],
    pinnedComment: '',
    reminder: '',
    lastUpdate: new Date().toISOString(),
    updateNote: 'Shared pricing packages on WhatsApp.',
    info: {
      bizCategory: 'Cosmetics', bizProducts: 'Organic Skincare', bizLocation: 'Gulshan, Dhaka', bizArea: 'Dhaka City', bizAge: '1 Year',
      prodMain: 'Whitening Cream, Face Wash', prodPromote: 'Winter Skincare Combo', prodPrice: '1200 BDT', prodOffer: '10% off for first order', prodMedia: 'Yes, phone recorded videos', prodUSP: '100% Organic, No Side Effects',
      tgtWho: 'Women', tgtAge: '18-40', tgtGender: 'Female', tgtLocation: 'Dhaka', tgtInterest: 'Skincare, Makeup, Beauty', tgtProblem: 'Skin damage from chemical products', tgtB2B: 'B2C',
      goalMain: 'বেশি মেসেজ', goalFollowers: 'Yes', goalTraffic: 'No', goalLead: 'No', goalExpectedSales: '20 Orders/day', goalDuration: 'Ongoing',
      bgAd: '500 BDT/day', bgService: '10000 BDT/month', bgPrevAds: 'No', bgPrevSpend: '', bgPrevResult: '',
      socialFb: 'facebook.com/glowskincare', socialIg: 'instagram.com/glowskincarebd', socialYt: '', socialBm: 'No', socialAdAcc: 'No', socialPixel: 'No', socialContact: '+8801811998877',
      webExists: 'No', webLink: '', webLp: '', webSpeed: '', webTracking: '', webAccess: '',
      contentMedia: 'No', contentOld: 'No', contentNeed: 'Yes, need everything', contentBrand: 'Pink and White', contentTone: 'Friendly, Caring', contentReview: 'Some customer reviews on page',
      compMain: '', compLink: '', compOffer: '', compDiff: '',
      salesOrder: 'Messenger / WhatsApp', salesDelivery: 'Pathao', salesPayment: 'COD/Bkash', salesWhoReply: 'Myself', salesReplyTime: 'Within 1 hour', salesScript: 'No',
      polRefund: 'No returns once opened', polDelivery: 'Inside Dhaka 80', polTerms: '', polForbidden: 'Do not use medical terms', polMeta: 'Yes, skincare claims can be risky',
      repFreq: 'Monthly', repMethod: 'Phone Call', repDecisionMaker: 'Sadia', repEmergency: '+8801811998877'
    }
  }
];

export default function GeneralClientsView() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const [clients, setClients] = useState(initialGeneralClients);
  const [editingClientConfig, setEditingClientConfig] = useState<any>(null);
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState('');
  
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [viewingClientInfo, setViewingClientInfo] = useState<any>(null);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [newClient, setNewClient] = useState({ 
    name: '', 
    company: '', 
    phone: '',
    info: {
      bizCategory: '', bizProducts: '', bizLocation: '', bizArea: '', bizAge: '',
      prodMain: '', prodPromote: '', prodPrice: '', prodOffer: '', prodMedia: '', prodUSP: '',
      tgtWho: '', tgtAge: '', tgtGender: '', tgtLocation: '', tgtInterest: '', tgtProblem: '', tgtB2B: '',
      goalMain: '', goalFollowers: '', goalTraffic: '', goalLead: '', goalExpectedSales: '', goalDuration: '',
      bgAd: '', bgService: '', bgPrevAds: '', bgPrevSpend: '', bgPrevResult: '',
      socialFb: '', socialIg: '', socialYt: '', socialBm: '', socialAdAcc: '', socialPixel: '', socialContact: '',
      webExists: '', webLink: '', webLp: '', webSpeed: '', webTracking: '', webAccess: '',
      contentMedia: '', contentOld: '', contentNeed: '', contentBrand: '', contentTone: '', contentReview: '',
      compMain: '', compLink: '', compOffer: '', compDiff: '',
      salesOrder: '', salesDelivery: '', salesPayment: '', salesWhoReply: '', salesReplyTime: '', salesScript: '',
      polRefund: '', polDelivery: '', polTerms: '', polForbidden: '', polMeta: '',
      repFreq: '', repMethod: '', repDecisionMaker: '', repEmergency: ''
    }
  });

  useEffect(() => {
    const saved = localStorage.getItem('generalClientsData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration: Update existing demo clients with full info data if they are missing it
        const updated = parsed.map((c: any) => {
          if (c.id === 'demo1' && (!c.info || !c.info.bizCategory)) {
            return initialGeneralClients[0];
          }
          if (c.id === 'demo2' && (!c.info || !c.info.bizCategory)) {
            return initialGeneralClients[1];
          }
          return c;
        });
        setClients(updated);
        localStorage.setItem('generalClientsData', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to load general clients');
      }
    }
  }, []);

  const saveClients = (newClients: any[]) => {
    setClients(newClients);
    localStorage.setItem('generalClientsData', JSON.stringify(newClients));
  };

  const handleUpdateName = (id: string) => {
    if (!editingNameValue.trim()) {
      setEditingNameId(null);
      return;
    }
    const newClients = clients.map(c => c.id === id ? { ...c, name: editingNameValue } : c);
    saveClients(newClients);
    setEditingNameId(null);
  };

  const handleConfigSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClientConfig) return;
    const { id, tagString, pinnedComment, reminder, updateNote } = editingClientConfig;
    const tags = tagString ? tagString.split(',').map((t: string) => t.trim()).filter(Boolean) : [];
    
    const currClient = clients.find(c => c.id === id);
    const lastU = updateNote || reminder ? new Date().toISOString() : currClient?.lastUpdate;

    const newClients = clients.map(c => 
      c.id === id 
        ? { ...c, tags, pinnedComment, reminder, lastUpdate: lastU, updateNote: updateNote || c.updateNote } 
        : c
    );
    saveClients(newClients);
    setEditingClientConfig(null);
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name) return;
    
    const client = {
      id: Date.now().toString(),
      name: newClient.name,
      company: newClient.company || 'Unknown',
      phone: newClient.phone || '',
      tags: ['New Lead'],
      pinnedComment: '',
      reminder: '',
      lastUpdate: new Date().toISOString(),
      updateNote: 'Client added to system',
      info: newClient.info
    };
    
    saveClients([client, ...clients]);
    setIsAddingClient(false);
    setNewClient({ 
      name: '', company: '', phone: '',
      info: {
        bizCategory: '', bizProducts: '', bizLocation: '', bizArea: '', bizAge: '',
        prodMain: '', prodPromote: '', prodPrice: '', prodOffer: '', prodMedia: '', prodUSP: '',
        tgtWho: '', tgtAge: '', tgtGender: '', tgtLocation: '', tgtInterest: '', tgtProblem: '', tgtB2B: '',
        goalMain: '', goalFollowers: '', goalTraffic: '', goalLead: '', goalExpectedSales: '', goalDuration: '',
        bgAd: '', bgService: '', bgPrevAds: '', bgPrevSpend: '', bgPrevResult: '',
        socialFb: '', socialIg: '', socialYt: '', socialBm: '', socialAdAcc: '', socialPixel: '', socialContact: '',
        webExists: '', webLink: '', webLp: '', webSpeed: '', webTracking: '', webAccess: '',
        contentMedia: '', contentOld: '', contentNeed: '', contentBrand: '', contentTone: '', contentReview: '',
        compMain: '', compLink: '', compOffer: '', compDiff: '',
        salesOrder: '', salesDelivery: '', salesPayment: '', salesWhoReply: '', salesReplyTime: '', salesScript: '',
        polRefund: '', polDelivery: '', polTerms: '', polForbidden: '', polMeta: '',
        repFreq: '', repMethod: '', repDecisionMaker: '', repEmergency: ''
      }
    });
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.tags || []).some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">সকল ক্লায়েন্ট ও লিড</h2>
          <p className="text-sm font-medium text-gray-500">Regular clients, leads, and prospects</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => {
              const url = `${window.location.origin}${window.location.pathname}?client-checklist=true`;
              navigator.clipboard.writeText(url);
              alert('Public Checklist Link copied to clipboard:\n' + url);
            }}
            className="flex items-center bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm"
          >
            Copy Public Link
          </button>
          
          <button 
            onClick={() => setIsAddingClient(true)}
            className="flex items-center bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <UserPlus size={18} className="mr-2" /> নতুন ক্লায়েন্ট যোগ করুন
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="Search clients by name, company, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder-gray-400 font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredClients.map(client => (
          <div key={client.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setEditingClientConfig({
                  id: client.id, 
                  tagString: client.tags?.join(', ') || '',
                  pinnedComment: client.pinnedComment || '',
                  reminder: client.reminder || '',
                  updateNote: client.updateNote || ''
                });
              }}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors z-10"
              title="Config Tags & Reminders"
            >
              <Edit2 size={16} />
            </button>

            <div className="flex items-start mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-xl font-black text-indigo-700 mr-4 shrink-0 shadow-sm">
                {client.name.charAt(0)}
              </div>
              <div className="pt-1 flex-1 pr-6">
                {editingNameId === client.id ? (
                  <input
                    autoFocus
                    value={editingNameValue}
                    onChange={e => setEditingNameValue(e.target.value)}
                    onBlur={() => handleUpdateName(client.id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleUpdateName(client.id);
                      if (e.key === 'Escape') setEditingNameId(null);
                    }}
                    className="w-full text-lg font-bold text-gray-900 border-b border-indigo-500 outline-none pb-1 bg-transparent"
                  />
                ) : (
                  <h3 
                    onDoubleClick={() => {
                      setEditingNameId(client.id);
                      setEditingNameValue(client.name);
                    }}
                    className="text-lg font-bold text-gray-900 truncate cursor-text hover:text-indigo-600 transition-colors"
                    title="Double click to edit name"
                  >
                    {client.name}
                  </h3>
                )}
                <p className="text-sm font-medium text-gray-500">{client.company} {client.phone && `• ${client.phone}`}</p>
                
                {/* Tags */}
                {client.tags && client.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {client.tags.map((tag: string, i: number) => (
                      <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600">
                        <Tag size={10} className="mr-1" /> {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Pinned & Reminders */}
            <div className="space-y-2 mb-4">
              {client.pinnedComment && (
                <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-3 text-sm flex items-start">
                  <Pin size={14} className="text-amber-500 mt-0.5 mr-2 shrink-0" />
                  <p className="text-amber-800 font-medium leading-tight">{client.pinnedComment}</p>
                </div>
              )}
              {client.reminder && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-sm flex items-start">
                  <Bell size={14} className="text-indigo-500 mt-0.5 mr-2 shrink-0" />
                  <div>
                    <p className="text-indigo-800 font-medium leading-tight mb-1">Upcoming Reminder</p>
                    <p className="text-indigo-600 text-xs">{client.reminder}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-4 mt-auto">
              <button 
                onClick={() => {
                  setViewingClientInfo(client);
                }}
                className="w-full bg-white border border-gray-200 text-gray-700 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors"
                title="View onboarding details"
              >
                View Info
              </button>
              <button 
                onClick={() => {
                  if (client.phone) {
                    window.open(`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}`, '_blank');
                  }
                }}
                className="w-full bg-emerald-50 text-emerald-700 py-2 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5"
              >
                WhatsApp
              </button>
              <button 
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this client?')) {
                    const newClients = clients.filter(c => c.id !== client.id);
                    saveClients(newClients);
                  }
                }}
                className="w-full bg-red-50 text-red-700 py-2 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors flex items-center justify-center"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {filteredClients.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 font-medium">
            কোনো ক্লায়েন্ট পাওয়া যায়নি।
          </div>
        )}
      </div>

      <Modal isOpen={!!editingClientConfig} onClose={() => setEditingClientConfig(null)} title="Client Tags & Reminders">
        {editingClientConfig && (
          <form onSubmit={handleConfigSave} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Tags (comma separated)</label>
              <input 
                type="text" 
                value={editingClientConfig.tagString}
                onChange={e => setEditingClientConfig({...editingClientConfig, tagString: e.target.value})}
                placeholder="Lead, Followup, Discussed Pricing..."
                className="w-full border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Pinned Comment</label>
              <textarea 
                rows={2}
                value={editingClientConfig.pinnedComment}
                onChange={e => setEditingClientConfig({...editingClientConfig, pinnedComment: e.target.value})}
                placeholder="Important permanent note for this client..."
                className="w-full border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Upcoming Reminder / Next Action</label>
              <textarea 
                rows={2}
                value={editingClientConfig.reminder}
                onChange={e => setEditingClientConfig({...editingClientConfig, reminder: e.target.value})}
                placeholder="Call completely on Monday..."
                className="w-full border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Last Update / Discussion</label>
              <textarea 
                rows={2}
                value={editingClientConfig.updateNote}
                onChange={e => setEditingClientConfig({...editingClientConfig, updateNote: e.target.value})}
                placeholder="Discussed packages today..."
                className="w-full border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                type="button" 
                onClick={() => setEditingClientConfig(null)} 
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-transform transform hover:-translate-y-0.5"
              >
                Save
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={isAddingClient} onClose={() => setIsAddingClient(false)} title="নতুন ক্লায়েন্ট যোগ করুন (Onboarding Checklist)">
        <form onSubmit={handleAddClient} className="space-y-8 max-h-[70vh] overflow-y-auto px-1 pb-4">
          
          {/* Section 0: Contact Info */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <h3 className="font-black text-gray-800 mb-4 border-b border-gray-200 pb-2">Basic Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">ক্লায়েন্টের নাম *</label>
                <input type="text" required value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} className="w-full border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">কোম্পানির নাম</label>
                <input type="text" value={newClient.company} onChange={e => setNewClient({...newClient, company: e.target.value})} className="w-full border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">ফোন নম্বর / হোয়াটসঅ্যাপ</label>
                <input type="text" value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} placeholder="+880..." className="w-full border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
              </div>
            </div>
          </div>

          {/* Section 1: Business Info */}
          <div className="space-y-4">
            <h3 className="font-bold text-indigo-700 border-b border-indigo-100 pb-2">১. বিজনেস ইনফরমেশন</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-gray-600 mb-1">বিজনেসের ধরন / ক্যাটাগরি</label><input type="text" value={newClient.info.bizCategory} onChange={e => setNewClient({...newClient, info: {...newClient.info, bizCategory: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">পণ্য বা সার্ভিস</label><input type="text" value={newClient.info.bizProducts} onChange={e => setNewClient({...newClient, info: {...newClient.info, bizProducts: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">বিজনেস লোকেশন</label><input type="text" value={newClient.info.bizLocation} onChange={e => setNewClient({...newClient, info: {...newClient.info, bizLocation: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">সার্ভিস এরিয়া</label><input type="text" placeholder="সারা বাংলাদেশ / নির্দিষ্ট এলাকা" value={newClient.info.bizArea} onChange={e => setNewClient({...newClient, info: {...newClient.info, bizArea: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-600 mb-1">বিজনেস কতদিন ধরে চলছে</label><input type="text" value={newClient.info.bizAge} onChange={e => setNewClient({...newClient, info: {...newClient.info, bizAge: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
            </div>
          </div>

          {/* Section 2: Product / Service Details */}
          <div className="space-y-4">
            <h3 className="font-bold text-indigo-700 border-b border-indigo-100 pb-2">২. প্রোডাক্ট / সার্ভিস ডিটেইলস</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-gray-600 mb-1">প্রধান পণ্য / সার্ভিস</label><input type="text" value={newClient.info.prodMain} onChange={e => setNewClient({...newClient, info: {...newClient.info, prodMain: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">কোন পণ্য বেশি প্রোমোট করবেন?</label><input type="text" value={newClient.info.prodPromote} onChange={e => setNewClient({...newClient, info: {...newClient.info, prodPromote: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">দাম / প্যাকেজ</label><input type="text" value={newClient.info.prodPrice} onChange={e => setNewClient({...newClient, info: {...newClient.info, prodPrice: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">অফার বা ডিসকাউন্ট</label><input type="text" value={newClient.info.prodOffer} onChange={e => setNewClient({...newClient, info: {...newClient.info, prodOffer: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">ছবি / ভিডিও রেডি আছে?</label><input type="text" value={newClient.info.prodMedia} onChange={e => setNewClient({...newClient, info: {...newClient.info, prodMedia: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">ইউনিক সুবিধা কী?</label><input type="text" value={newClient.info.prodUSP} onChange={e => setNewClient({...newClient, info: {...newClient.info, prodUSP: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
            </div>
          </div>

          {/* Section 3: Target Customer */}
          <div className="space-y-4">
            <h3 className="font-bold text-indigo-700 border-b border-indigo-100 pb-2">৩. টার্গেট কাস্টমার ইনফরমেশন</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-gray-600 mb-1">কাদের কাছে বিক্রি করতে চান?</label><input type="text" value={newClient.info.tgtWho} onChange={e => setNewClient({...newClient, info: {...newClient.info, tgtWho: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">বয়স সীমানা</label><input type="text" value={newClient.info.tgtAge} onChange={e => setNewClient({...newClient, info: {...newClient.info, tgtAge: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">জেন্ডার</label><input type="text" value={newClient.info.tgtGender} onChange={e => setNewClient({...newClient, info: {...newClient.info, tgtGender: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">লোকেশন</label><input type="text" value={newClient.info.tgtLocation} onChange={e => setNewClient({...newClient, info: {...newClient.info, tgtLocation: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">আগ্রহ / ইন্টারেস্ট</label><input type="text" value={newClient.info.tgtInterest} onChange={e => setNewClient({...newClient, info: {...newClient.info, tgtInterest: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">B2B নাকি B2C?</label><input type="text" value={newClient.info.tgtB2B} onChange={e => setNewClient({...newClient, info: {...newClient.info, tgtB2B: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-600 mb-1">কাস্টমারের সমস্যা ও সমাধান</label><textarea rows={2} value={newClient.info.tgtProblem} onChange={e => setNewClient({...newClient, info: {...newClient.info, tgtProblem: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm resize-none"></textarea></div>
            </div>
          </div>

          {/* Section 4: Marketing Goals */}
          <div className="space-y-4">
            <h3 className="font-bold text-indigo-700 border-b border-indigo-100 pb-2">৪. মার্কেটিং গোল</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-gray-600 mb-1">বেশি মেসেজ চান নাকি সেল?</label><input type="text" value={newClient.info.goalMain} onChange={e => setNewClient({...newClient, info: {...newClient.info, goalMain: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">ব্র্যান্ডিং / ফলোয়ার চান?</label><input type="text" value={newClient.info.goalFollowers} onChange={e => setNewClient({...newClient, info: {...newClient.info, goalFollowers: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">ওয়েবসাইট ট্রাফিক দরকার?</label><input type="text" value={newClient.info.goalTraffic} onChange={e => setNewClient({...newClient, info: {...newClient.info, goalTraffic: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">লিড কালেকশন দরকার?</label><input type="text" value={newClient.info.goalLead} onChange={e => setNewClient({...newClient, info: {...newClient.info, goalLead: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">প্রত্যাশিত মাসিক সেল / লিড</label><input type="text" value={newClient.info.goalExpectedSales} onChange={e => setNewClient({...newClient, info: {...newClient.info, goalExpectedSales: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">কতদিনের ক্যাম্পেইন?</label><input type="text" value={newClient.info.goalDuration} onChange={e => setNewClient({...newClient, info: {...newClient.info, goalDuration: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
            </div>
          </div>

          {/* Section 5: Budget Info */}
          <div className="space-y-4">
            <h3 className="font-bold text-indigo-700 border-b border-indigo-100 pb-2">৫. বাজেট ইনফরমেশন</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-gray-600 mb-1">অ্যাড বাজেট (দৈনিক/মাসিক)</label><input type="text" value={newClient.info.bgAd} onChange={e => setNewClient({...newClient, info: {...newClient.info, bgAd: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">সার্ভিস চার্জ বাজেট</label><input type="text" value={newClient.info.bgService} onChange={e => setNewClient({...newClient, info: {...newClient.info, bgService: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">আগে অ্যাড চালিয়েছেন?</label><input type="text" value={newClient.info.bgPrevAds} onChange={e => setNewClient({...newClient, info: {...newClient.info, bgPrevAds: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">আগে চালালে কত খরচ হয়েছে?</label><input type="text" value={newClient.info.bgPrevSpend} onChange={e => setNewClient({...newClient, info: {...newClient.info, bgPrevSpend: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-600 mb-1">আগের রেজাল্ট কেমন ছিল?</label><input type="text" value={newClient.info.bgPrevResult} onChange={e => setNewClient({...newClient, info: {...newClient.info, bgPrevResult: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
            </div>
          </div>

          {/* Section 6: Social Media Access */}
          <div className="space-y-4">
            <h3 className="font-bold text-indigo-700 border-b border-indigo-100 pb-2">৬. সোশ্যাল মিডিয়া অ্যাক্সেস</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-gray-600 mb-1">Facebook Page লিংক</label><input type="text" value={newClient.info.socialFb} onChange={e => setNewClient({...newClient, info: {...newClient.info, socialFb: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">Instagram ID</label><input type="text" value={newClient.info.socialIg} onChange={e => setNewClient({...newClient, info: {...newClient.info, socialIg: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">TikTok / YouTube লিংক</label><input type="text" value={newClient.info.socialYt} onChange={e => setNewClient({...newClient, info: {...newClient.info, socialYt: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">Business Manager আছে?</label><input type="text" value={newClient.info.socialBm} onChange={e => setNewClient({...newClient, info: {...newClient.info, socialBm: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">Ad Account আছে?</label><input type="text" value={newClient.info.socialAdAcc} onChange={e => setNewClient({...newClient, info: {...newClient.info, socialAdAcc: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">Pixel / Dataset সেটআপ আছে?</label><input type="text" value={newClient.info.socialPixel} onChange={e => setNewClient({...newClient, info: {...newClient.info, socialPixel: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
            </div>
          </div>

          {/* Section 7: Website Info */}
          <div className="space-y-4">
            <h3 className="font-bold text-indigo-700 border-b border-indigo-100 pb-2">৭. ওয়েবসাইট ইনফরমেশন</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-gray-600 mb-1">ওয়েবসাইট আছে কি না?</label><input type="text" value={newClient.info.webExists} onChange={e => setNewClient({...newClient, info: {...newClient.info, webExists: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">ওয়েবসাইট লিংক</label><input type="text" value={newClient.info.webLink} onChange={e => setNewClient({...newClient, info: {...newClient.info, webLink: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">Landing page আছে?</label><input type="text" value={newClient.info.webLp} onChange={e => setNewClient({...newClient, info: {...newClient.info, webLp: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">Speed / Checkout ঠিক আছে?</label><input type="text" value={newClient.info.webSpeed} onChange={e => setNewClient({...newClient, info: {...newClient.info, webSpeed: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">Tracking setup আছে?</label><input type="text" value={newClient.info.webTracking} onChange={e => setNewClient({...newClient, info: {...newClient.info, webTracking: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">Domain/Hosting Access লাগবে?</label><input type="text" value={newClient.info.webAccess} onChange={e => setNewClient({...newClient, info: {...newClient.info, webAccess: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
            </div>
          </div>

          {/* Section 8: Content Info */}
          <div className="space-y-4">
            <h3 className="font-bold text-indigo-700 border-b border-indigo-100 pb-2">৮. কনটেন্ট ইনফরমেশন</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-gray-600 mb-1">ছবি / ভিডিও রেডি আছে?</label><input type="text" value={newClient.info.contentMedia} onChange={e => setNewClient({...newClient, info: {...newClient.info, contentMedia: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">আগে বানানো পোস্ট/ডিজাইন আছে?</label><input type="text" value={newClient.info.contentOld} onChange={e => setNewClient({...newClient, info: {...newClient.info, contentOld: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">নতুন কনটেন্ট বানাতে হবে?</label><input type="text" value={newClient.info.contentNeed} onChange={e => setNewClient({...newClient, info: {...newClient.info, contentNeed: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">ব্র্যান্ড কালার/লোগো/ফন্ট</label><input type="text" value={newClient.info.contentBrand} onChange={e => setNewClient({...newClient, info: {...newClient.info, contentBrand: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">নির্দিষ্ট টোন বা ভাষা?</label><input type="text" value={newClient.info.contentTone} onChange={e => setNewClient({...newClient, info: {...newClient.info, contentTone: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">Review/Testimonial আছে?</label><input type="text" value={newClient.info.contentReview} onChange={e => setNewClient({...newClient, info: {...newClient.info, contentReview: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
            </div>
          </div>

          {/* Section 9: Competitor Info */}
          <div className="space-y-4">
            <h3 className="font-bold text-indigo-700 border-b border-indigo-100 pb-2">৯. কম্পিটিটর ইনফরমেশন</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-gray-600 mb-1">প্রধান কম্পিটিটর কারা?</label><input type="text" value={newClient.info.compMain} onChange={e => setNewClient({...newClient, info: {...newClient.info, compMain: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">কম্পিটিটরের লিংক</label><input type="text" value={newClient.info.compLink} onChange={e => setNewClient({...newClient, info: {...newClient.info, compLink: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">কম্পিটিটর কী অফার দেয়?</label><input type="text" value={newClient.info.compOffer} onChange={e => setNewClient({...newClient, info: {...newClient.info, compOffer: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">নিজেকে কীভাবে আলাদা মনে করেন?</label><input type="text" value={newClient.info.compDiff} onChange={e => setNewClient({...newClient, info: {...newClient.info, compDiff: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
            </div>
          </div>

          {/* Section 10: Sales Process */}
          <div className="space-y-4">
            <h3 className="font-bold text-indigo-700 border-b border-indigo-100 pb-2">১০. সেলস প্রসেস</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-gray-600 mb-1">অর্ডার কীভাবে নেন?</label><input type="text" placeholder="Messenger/WA/Web" value={newClient.info.salesOrder} onChange={e => setNewClient({...newClient, info: {...newClient.info, salesOrder: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">ডেলিভারি প্রসেস</label><input type="text" value={newClient.info.salesDelivery} onChange={e => setNewClient({...newClient, info: {...newClient.info, salesDelivery: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">পেমেন্ট মেথড</label><input type="text" value={newClient.info.salesPayment} onChange={e => setNewClient({...newClient, info: {...newClient.info, salesPayment: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">কাস্টমার রিপ্লাই কে দিবে?</label><input type="text" value={newClient.info.salesWhoReply} onChange={e => setNewClient({...newClient, info: {...newClient.info, salesWhoReply: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">রিপ্লাই টাইম কত দ্রুত?</label><input type="text" value={newClient.info.salesReplyTime} onChange={e => setNewClient({...newClient, info: {...newClient.info, salesReplyTime: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">Sales closing script আছে?</label><input type="text" value={newClient.info.salesScript} onChange={e => setNewClient({...newClient, info: {...newClient.info, salesScript: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
            </div>
          </div>

          {/* Section 11: Policies */}
          <div className="space-y-4">
            <h3 className="font-bold text-indigo-700 border-b border-indigo-100 pb-2">১১. পলিসি ও সীমাবদ্ধতা</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-gray-600 mb-1">Refund / return policy</label><input type="text" value={newClient.info.polRefund} onChange={e => setNewClient({...newClient, info: {...newClient.info, polRefund: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">Delivery charge</label><input type="text" value={newClient.info.polDelivery} onChange={e => setNewClient({...newClient, info: {...newClient.info, polDelivery: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">Service terms</label><input type="text" value={newClient.info.polTerms} onChange={e => setNewClient({...newClient, info: {...newClient.info, polTerms: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">নিষিদ্ধ শব্দ / দাবি আছে?</label><input type="text" value={newClient.info.polForbidden} onChange={e => setNewClient({...newClient, info: {...newClient.info, polForbidden: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-600 mb-1">Meta policy অনুযায়ী risky claim?</label><input type="text" value={newClient.info.polMeta} onChange={e => setNewClient({...newClient, info: {...newClient.info, polMeta: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
            </div>
          </div>

          {/* Section 12: Reporting */}
          <div className="space-y-4">
            <h3 className="font-bold text-indigo-700 border-b border-indigo-100 pb-2">১২. রিপোর্টিং ও কমিউনিকেশন</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-gray-600 mb-1">রিপোর্ট কতদিন পর পর চান?</label><input type="text" value={newClient.info.repFreq} onChange={e => setNewClient({...newClient, info: {...newClient.info, repFreq: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">কোন মাধ্যমে আপডেট চান?</label><input type="text" placeholder="WA/Messenger/Email" value={newClient.info.repMethod} onChange={e => setNewClient({...newClient, info: {...newClient.info, repMethod: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">সিদ্ধান্ত নেওয়ার মূল ব্যক্তি কে?</label><input type="text" value={newClient.info.repDecisionMaker} onChange={e => setNewClient({...newClient, info: {...newClient.info, repDecisionMaker: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">জরুরি কন্টাক্ট নম্বর</label><input type="text" value={newClient.info.repEmergency} onChange={e => setNewClient({...newClient, info: {...newClient.info, repEmergency: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2 text-sm" /></div>
            </div>
          </div>

          {/* Footer actions pinned to bottom conceptually */}
          <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-gray-200">
            <button type="button" onClick={() => setIsAddingClient(false)} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">
              বাতিল
            </button>
            <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-transform transform hover:-translate-y-0.5">
              সেভ করুন ও যোগ করুন
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!viewingClientInfo} onClose={() => { setViewingClientInfo(null); setIsEditingInfo(false); }} title={`${viewingClientInfo?.name} - Onboarding Info`}>
        {viewingClientInfo && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1 pb-4 text-sm text-gray-700">
            {!isEditingInfo ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg"><span className="block text-xs font-bold text-gray-500 mb-1">Company</span> <span className="font-medium text-gray-900">{viewingClientInfo.company || '-'}</span></div>
                  <div className="bg-gray-50 p-3 rounded-lg"><span className="block text-xs font-bold text-gray-500 mb-1">Phone</span> <span className="font-medium text-gray-900">{viewingClientInfo.phone || '-'}</span></div>
                </div>

                {viewingClientInfo.info && Object.keys(viewingClientInfo.info).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(viewingClientInfo.info).map(([key, value]: [string, any]) => {
                      // Make keys look a bit nicer
                      const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                      const importantKeys = ['bgAd', 'bgService', 'goalMain', 'goalExpectedSales', 'socialAdAcc', 'socialBm', 'webAccess', 'repEmergency', 'prodPrice', 'salesPayment'];
                      const isImportant = importantKeys.includes(key);

                      return (
                        <div key={key} className={`pb-2 ${isImportant ? 'bg-amber-50 p-3 rounded-lg border border-amber-200' : 'border-b border-gray-100'}`}>
                          <span className={`block text-xs font-bold mb-0.5 ${isImportant ? 'text-amber-800' : 'text-gray-500'}`}>
                            {formattedKey} {isImportant && '⭐'}
                          </span>
                          <span className={`font-medium break-words ${isImportant ? 'text-amber-950 font-bold' : 'text-gray-800'}`}>
                            {value || <span className="text-gray-400 italic">Not provided</span>}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 italic py-4 text-center">No additional onboarding information provided.</p>
                )}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button onClick={() => setIsEditingInfo(true)} className="px-5 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold rounded-xl transition-colors">
                    Edit Info
                  </button>
                  <button onClick={() => setViewingClientInfo(null)} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">
                    Close
                  </button>
                </div>
              </>
            ) : (
              // Edit Mode
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Company</label>
                    <input 
                      type="text" 
                      value={viewingClientInfo.company} 
                      onChange={e => setViewingClientInfo({...viewingClientInfo, company: e.target.value})} 
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Phone</label>
                    <input 
                      type="text" 
                      value={viewingClientInfo.phone} 
                      onChange={e => setViewingClientInfo({...viewingClientInfo, phone: e.target.value})} 
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {Object.entries(viewingClientInfo.info || {}).map(([key, value]: [string, any]) => {
                    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    return (
                      <div key={key}>
                        <label className="block text-xs font-bold text-gray-500 mb-1">{formattedKey}</label>
                        <input 
                          type="text" 
                          value={value || ''} 
                          onChange={e => {
                            setViewingClientInfo({
                              ...viewingClientInfo,
                              info: { ...viewingClientInfo.info, [key]: e.target.value }
                            });
                          }}
                          className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                        />
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button onClick={() => {
                    setViewingClientInfo(null);
                    setIsEditingInfo(false);
                  }} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button onClick={() => {
                    const newClients = clients.map(c => c.id === viewingClientInfo.id ? viewingClientInfo : c);
                    saveClients(newClients);
                    setIsEditingInfo(false);
                  }} className="px-5 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 font-bold rounded-xl transition-colors shadow-sm">
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
