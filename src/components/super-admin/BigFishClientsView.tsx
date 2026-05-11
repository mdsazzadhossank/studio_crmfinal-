import React, { useState, useEffect } from 'react';
import { Search, Plus, Anchor, Filter, Star, Wallet, TrendingUp, Tag, MessageSquare, Bell, Edit2, Pin, Trophy } from 'lucide-react';
import SuperAdminClientDetails from './SuperAdminClientDetails';
import Modal from '../Modal';

const initialMockVipClients: any[] = [];

export default function BigFishClientsView() {
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  const [clients, setClients] = useState<any[]>([]);
  const [editingClientConfig, setEditingClientConfig] = useState<any>(null);
  const [editingNameId, setEditingNameId] = useState<number | null>(null);
  const [editingNameValue, setEditingNameValue] = useState('');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    company: '',
    status: 'active',
    balance: 0,
    totalSpent: 0,
    tags: '',
    pinnedComment: ''
  });

  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [isCatchFishModalOpen, setIsCatchFishModalOpen] = useState(false);
  const [allGeneralClients, setAllGeneralClients] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('vipClientsData');
    if (saved) {
      try {
        setClients(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load vip clients');
      }
    }

    const savedAll = localStorage.getItem('allClientsData');
    if (savedAll) {
      try {
        setAllGeneralClients(JSON.parse(savedAll));
      } catch (e) {
        console.error('Failed to load all clients');
      }
    }
  }, []);

  const saveClients = (newClients: any[]) => {
    setClients(newClients);
    localStorage.setItem('vipClientsData', JSON.stringify(newClients));
  };

  const handleUpdateName = (id: number) => {
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

  const handleAddNewClient = (e: React.FormEvent) => {
    e.preventDefault();
    const client = {
      id: Date.now(),
      name: newClient.name,
      company: newClient.company,
      status: newClient.status,
      balance: Number(newClient.balance),
      totalSpent: Number(newClient.totalSpent),
      joinDate: new Date().toISOString().split('T')[0],
      tags: newClient.tags ? newClient.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      pinnedComment: newClient.pinnedComment,
      reminder: '',
      lastUpdate: ''
    };
    saveClients([...clients, client]);
    setIsAddModalOpen(false);
    setNewClient({
      name: '',
      company: '',
      status: 'active',
      balance: 0,
      totalSpent: 0,
      tags: '',
      pinnedComment: ''
    });
  };

  const handleCatchFish = (generalClient: any) => {
    // Check if already exists in VIP
    if (clients.some(c => c.name.toLowerCase() === generalClient.name.toLowerCase() || c.id === generalClient.id)) {
      alert("This client is already a VIP!");
      return;
    }

    const client = {
      id: generalClient.id || Date.now(),
      name: generalClient.name,
      company: generalClient.company || 'Unknown',
      status: 'active',
      balance: 0,
      totalSpent: generalClient.totalBudget || 0,
      joinDate: generalClient.startDate || new Date().toISOString().split('T')[0],
      tags: ['Promoted'],
      pinnedComment: '',
      reminder: '',
      lastUpdate: ''
    };
    saveClients([...clients, client]);
    setIsCatchFishModalOpen(false);
  };

  const handleMoveToHallOfFame = (id: number) => {
    if (!confirm('Are you sure you want to move this VIP client to Hall of Fame?')) return;
    const updated = clients.map(client => {
      if (client.id === id) {
        return { ...client, status: 'hall_of_fame' };
      }
      return client;
    });
    saveClients(updated);
  };

  if (selectedClientId) {
    return <SuperAdminClientDetails clientId={selectedClientId} onBack={() => setSelectedClientId(null)} />;
  }

  const filteredClients = clients.filter(c => 
    (activeTab === 'all' || c.status === activeTab) &&
    (c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
     (c.tags || []).some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-6">
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'active' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Active Pool
          </button>
          <button 
            onClick={() => setActiveTab('hall_of_fame')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'hall_of_fame' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Hall of Fame
          </button>
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            All Big Fish
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={() => setIsAddModalOpen(true)} className="flex items-center bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
            <Plus size={16} className="mr-2" /> Add VIP
          </button>
          <button onClick={() => setIsCatchFishModalOpen(true)} className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm">
            <Anchor size={16} className="mr-2" /> Catch New Fish
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="Search VIP clients by name, company, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder-gray-400 font-medium"
          />
        </div>
        <button className="flex items-center justify-center bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
          <Filter size={20} className="sm:mr-2" /> <span className="hidden sm:inline">Filter</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredClients.map(client => (
          <div key={client.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
            {client.status === 'hall_of_fame' && (
              <div className="absolute top-0 right-0 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl border-b border-l border-amber-200 z-10">
                Hall of Fame <Star size={10} className="inline ml-1" />
              </div>
            )}
            
            {client.status === 'active' && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoveToHallOfFame(client.id);
                }}
                className="absolute top-4 right-12 p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors z-10"
                title="Move to Hall of Fame"
              >
                <Trophy size={16} />
              </button>
            )}

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
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-blue-100 border border-indigo-200 rounded-2xl flex items-center justify-center text-xl font-black text-indigo-700 mr-4 shrink-0 shadow-sm">
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
                <p className="text-sm font-medium text-gray-500">{client.company}</p>
                
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

            <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center">
                  <Wallet size={12} className="mr-1" /> Wallet Balance
                </p>
                <p className="text-lg font-black text-gray-900">৳{(client.balance).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center">
                  <TrendingUp size={12} className="mr-1" /> Total Spent
                </p>
                <p className="text-lg font-black text-indigo-600">৳{(client.totalSpent).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button onClick={() => setSelectedClientId(client.id)} className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
                View Profile
              </button>
              <button className="flex-1 bg-emerald-50 text-emerald-700 py-2 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2">
                <MessageSquare size={16} /> WhatsApp
              </button>
            </div>
          </div>
        ))}
        {filteredClients.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 font-medium">
            No VIP clients found matching your search.
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
                placeholder="High Priority, E-com, Next Week Followup..."
                className="w-full border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Pinned Comment</label>
              <textarea 
                rows={2}
                value={editingClientConfig.pinnedComment}
                onChange={e => setEditingClientConfig({...editingClientConfig, pinnedComment: e.target.value})}
                placeholder="Permanent critical note for this client..."
                className="w-full border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Upcoming Reminder / Next Action</label>
              <textarea 
                rows={2}
                value={editingClientConfig.reminder}
                onChange={e => setEditingClientConfig({...editingClientConfig, reminder: e.target.value})}
                placeholder="Call on Monday for Q4 planning..."
                className="w-full border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Last Update / Discussion</label>
              <textarea 
                rows={2}
                value={editingClientConfig.updateNote}
                onChange={e => setEditingClientConfig({...editingClientConfig, updateNote: e.target.value})}
                placeholder="Spoke today about budget bump to 1M..."
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

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New VIP Client">
        <form onSubmit={handleAddNewClient} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Client Name</label>
            <input 
              type="text" 
              required
              value={newClient.name}
              onChange={e => setNewClient({...newClient, name: e.target.value})}
              placeholder="e.g. John Doe"
              className="w-full border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Company</label>
            <input 
              type="text" 
              required
              value={newClient.company}
              onChange={e => setNewClient({...newClient, company: e.target.value})}
              placeholder="e.g. Tech Corp"
              className="w-full border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
              <select 
                value={newClient.status}
                onChange={e => setNewClient({...newClient, status: e.target.value})}
                className="w-full border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="active">Active</option>
                <option value="hall_of_fame">Hall of Fame</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Tags (comma separated)</label>
              <input 
                type="text" 
                value={newClient.tags}
                onChange={e => setNewClient({...newClient, tags: e.target.value})}
                placeholder="High Priority, VIP..."
                className="w-full border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Wallet Balance (৳)</label>
              <input 
                type="number" 
                value={newClient.balance}
                onChange={e => setNewClient({...newClient, balance: Number(e.target.value)})}
                className="w-full border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Total Spent (৳)</label>
              <input 
                type="number" 
                value={newClient.totalSpent}
                onChange={e => setNewClient({...newClient, totalSpent: Number(e.target.value)})}
                className="w-full border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Pinned Comment</label>
            <textarea 
              rows={2}
              value={newClient.pinnedComment}
              onChange={e => setNewClient({...newClient, pinnedComment: e.target.value})}
              placeholder="Important note for this client..."
              className="w-full border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button 
              type="button" 
              onClick={() => setIsAddModalOpen(false)} 
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-transform transform hover:-translate-y-0.5"
            >
              Add VIP
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isCatchFishModalOpen} onClose={() => setIsCatchFishModalOpen(false)} title="Catch New Fish (Promote to VIP)">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">Select a client from your general pool to promote them to the Big Fish (VIP) program.</p>
          <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
            {allGeneralClients.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No general clients found.</p>
            ) : (
              allGeneralClients.map(client => (
                <div key={client.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all">
                  <div>
                    <h4 className="font-bold text-gray-900">{client.name}</h4>
                    <p className="text-xs text-gray-500">{client.company || 'No Company'}</p>
                  </div>
                  <button 
                    onClick={() => handleCatchFish(client)}
                    className="px-4 py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center"
                  >
                    <Anchor size={14} className="mr-2" /> Hook
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button 
              type="button" 
              onClick={() => setIsCatchFishModalOpen(false)} 
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
