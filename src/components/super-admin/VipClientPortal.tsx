import React, { useState, useEffect, useRef } from 'react';
import { 
  Wallet, TrendingUp, Target, MessageSquare, BarChart3, 
  ListTodo, LifeBuoy, CreditCard, Copy, CheckCircle2, ChevronDown, DollarSign,
  Upload, ImageIcon, X, Loader
} from 'lucide-react';
import { API_BASE_URL } from '../../config';

const emptyClientDefaults = {
  id: '',
  name: '',
  company: '',
  balance: 0,
  adBudgetUsed: 0,
  agencyProfit: 0,
  settings: {
    walletBalance: true,
    historyLedger: true,
    messageReport: true,
    salesReport: true,
    profitLossReport: false,
    paymentMethods: true,
    allowTopUp: true,
    dollarRate: 145
  },
  ledger: [] as any[],
  adHistory: [] as any[],
  topUpRequests: [] as any[],
  paymentMethods: [] as any[],
};

export default function VipClientPortal({ clientId }: { clientId: string }) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [reportFilter, setReportFilter] = useState('Last 30 Days');
  const [client, setClient] = useState(emptyClientDefaults);
  const [loading, setLoading] = useState(true);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load real client data from localStorage (synced from DB)
  useEffect(() => {
    const saved = localStorage.getItem('vipClientsData');
    if (saved) {
      try {
        const allClients = JSON.parse(saved);
        const found = allClients.find((c: any) => 
          String(c.id) === String(clientId)
        );
        if (found) {
          setClient({
            ...emptyClientDefaults,
            ...found,
            ledger: found.ledger || [],
            adHistory: found.adHistory || [],
            topUpRequests: found.topUpRequests || [],
            paymentMethods: found.paymentMethods || [],
            settings: { ...emptyClientDefaults.settings, ...(found.settings || {}) },
          });
        }
      } catch (e) {
        console.error('Failed to load VIP client', e);
      }
    }
    setLoading(false);
  }, [clientId]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Handle proof file selection
  const handleProofSelect = (file: File | null) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      alert('শুধুমাত্র JPG, PNG, WEBP ইমেজ আপলোড করা যাবে।');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('ফাইলের সাইজ সর্বোচ্চ ৫MB হতে পারবে।');
      return;
    }
    setProofFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setProofPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearProof = () => {
    setProofFile(null);
    setProofPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle top-up request with image upload
  const handleTopUpRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const amountInput = form.querySelector('input[type="number"]') as HTMLInputElement;
    const noteInput = form.querySelector('textarea') as HTMLTextAreaElement;
    const amount = Number(amountInput?.value);
    if (!amount || amount <= 0) return;
    if (!proofFile) {
      alert('পেমেন্ট প্রুফ ইমেজ আপলোড করুন!');
      return;
    }

    setUploading(true);
    let proofUrl = '';

    try {
      // Upload image to server
      const formData = new FormData();
      formData.append('proof', proofFile);

      const backendBase = API_BASE_URL.replace(/\/api$/, '');
      const uploadRes = await fetch(`${API_BASE_URL}/upload_topup_proof`, {
        method: 'POST',
        body: formData,
      });

      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        proofUrl = uploadData.url || '';
      } else {
        const errData = await uploadRes.json().catch(() => null);
        alert('ইমেজ আপলোড ব্যর্থ: ' + (errData?.error || 'Unknown error'));
        setUploading(false);
        return;
      }
    } catch (err) {
      alert('ইমেজ আপলোড ব্যর্থ হয়েছে। ইন্টারনেট সংযোগ চেক করুন।');
      setUploading(false);
      return;
    }

    const newRequest = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      amount,
      note: noteInput?.value || '',
      paymentProof: proofUrl,
      status: 'pending'
    };

    const updatedClient = {
      ...client,
      topUpRequests: [newRequest, ...(client.topUpRequests || [])]
    };

    setClient(updatedClient);

    // Save to localStorage (auto-syncs to DB via monkey-patch)
    const saved = localStorage.getItem('vipClientsData');
    if (saved) {
      try {
        const all = JSON.parse(saved);
        const updated = all.map((c: any) => 
          String(c.id) === String(clientId) ? updatedClient : c
        );
        localStorage.setItem('vipClientsData', JSON.stringify(updated));
      } catch {}
    }

    setUploading(false);
    clearProof();
    alert('Top-up request sent to admin!');
    form.reset();
  };

  // Build message reports from adHistory
  const messageReports = (client.adHistory || []).filter((h: any) => h.messageResults > 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 font-medium">Loading...</p>
      </div>
    );
  }

  if (!client.name) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900 mb-2">Client Not Found</p>
          <p className="text-gray-500">এই ক্লায়েন্ট পোর্টালটি পাওয়া যায়নি।</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans selection:bg-indigo-100">
      {/* Header */}
      <div className="bg-indigo-900 text-white pt-12 pb-24 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 rounded-full bg-indigo-400 blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 text-center md:text-left">
          <div>
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold tracking-wider uppercase mb-4 shadow-sm border border-white/10">
              Big Fish Portal
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">স্বাগতম, {client.name}</h1>
            <p className="text-indigo-200 text-lg md:text-xl font-medium">{client.company}</p>
          </div>
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 shadow-xl flex items-center gap-4">
             <div className="text-left">
                <p className="text-indigo-200 text-xs font-medium mb-1">Status</p>
                <p className="font-bold flex items-center text-sm"><CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-400" /> VIP Active</p>
             </div>
             <div className="w-px h-8 bg-white/20"></div>
             <button className="bg-white text-indigo-900 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors">
               Contact Admin
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20">
        
        {/* Top Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Wallet size={64} className="text-indigo-500" /></div>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-2">ওয়ালেট ব্যালান্স</span>
            {client.settings.walletBalance ? (
              <span className="text-3xl font-black text-indigo-700 tracking-tight">৳{client.balance.toLocaleString()}</span>
            ) : (
              <span className="text-xl font-bold text-gray-400 italic">Wallet Balance Hidden</span>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><TrendingUp size={64} className="text-emerald-500" /></div>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-2">মোট বিজ্ঞাপন ব্যয় (Total Spend)</span>
            <span className="text-3xl font-black text-gray-900 tracking-tight">৳{client.adBudgetUsed.toLocaleString()}</span>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><DollarSign size={64} className="text-amber-500" /></div>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-2">
              বর্তমান ডলার রেট
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-black text-gray-900 tracking-tight">$1</span>
              <span className="text-2xl font-black text-gray-600">=</span>
              <span className="text-4xl font-black text-gray-900 tracking-tight">৳{client.settings.dollarRate}</span>
            </div>
            <p className="text-xs text-gray-400 mt-3 font-medium">ডলারের দাম পরিবর্তনশীল, যেকোনো সময় পরিবর্তন হতে পারে</p>
          </div>

        </div>

        {/* Global Filter Bar */}
        <div className="flex bg-white border border-gray-200 rounded-xl p-2 mb-8 items-center shadow-sm w-fit">
          <span className="text-sm font-bold text-gray-500 px-3">Date Range:</span>
          {['Last 30 Days', 'This Month', 'Custom Range'].map(filter => (
            <button
              key={filter}
              onClick={() => setReportFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                reportFilter === filter ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {filter} {filter === 'Custom Range' && <ChevronDown size={14} className="inline ml-1" />}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Wallet Ledger */}
            {client.settings.historyLedger && (client.ledger || []).length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center">
                  <Wallet className="mr-2 text-indigo-500" /> Wallet History
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold pb-2 bg-gray-50">
                        <th className="p-4 rounded-tl-xl">Date</th>
                        <th className="p-4">Description</th>
                        <th className="p-4 text-right">Credit</th>
                        <th className="p-4 text-right">Debit</th>
                        <th className="p-4 text-right rounded-tr-xl">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(client.ledger || []).map((log: any) => (
                        <tr key={log.id} className="border-b border-gray-50 text-sm font-medium text-gray-800 hover:bg-gray-50/50">
                          <td className="p-4 text-gray-500">{log.date}</td>
                          <td className="p-4">{log.desc}</td>
                          <td className="p-4 text-right text-emerald-600 font-bold">{log.credit > 0 ? `৳${log.credit.toLocaleString()}` : '-'}</td>
                          <td className="p-4 text-right text-red-600 font-bold">{log.debit > 0 ? `৳${log.debit.toLocaleString()}` : '-'}</td>
                          <td className="p-4 text-right font-black text-gray-900">৳{log.balance.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Message Report from Ad History */}
            {client.settings.messageReport && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center">
                  <MessageSquare className="mr-2 text-indigo-500" /> Message Report
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold pb-2 bg-gray-50">
                        <th className="p-4 rounded-tl-xl">Period</th>
                        <th className="p-4 text-right">Spent ($)</th>
                        <th className="p-4 text-right">Messages</th>
                        <th className="p-4 text-right rounded-tr-xl">CPR ($)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messageReports.length > 0 ? messageReports.map((report: any) => (
                        <tr key={report.id} className="border-b border-gray-50 text-sm font-medium text-gray-800 hover:bg-gray-50/50">
                          <td className="p-4 text-gray-500">{report.from} to {report.to}</td>
                          <td className="p-4 text-right font-bold text-gray-900">${report.clientBill?.toFixed(2) || '0.00'}</td>
                          <td className="p-4 text-right">{report.messageResults}</td>
                          <td className="p-4 text-right text-emerald-600 font-bold">
                            ${report.messageResults > 0 ? (report.clientBill / report.messageResults).toFixed(2) : '0.00'}
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={4} className="p-6 text-center text-gray-500 font-medium">No messaging data</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sales Report */}
            {client.settings.salesReport && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center">
                  <BarChart3 className="mr-2 text-indigo-500" /> Sales Report
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold pb-2 bg-gray-50">
                        <th className="p-4 rounded-tl-xl">Period</th>
                        <th className="p-4 text-right">Sales</th>
                        <th className="p-4 text-right rounded-tr-xl">Ad Spent ($)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(client.adHistory || []).filter((h: any) => h.salesResults > 0).length > 0 ? (
                        (client.adHistory || []).filter((h: any) => h.salesResults > 0).map((report: any) => (
                          <tr key={report.id} className="border-b border-gray-50 text-sm font-medium text-gray-800 hover:bg-gray-50/50">
                            <td className="p-4 text-gray-500">{report.from} to {report.to}</td>
                            <td className="p-4 text-right font-bold">{report.salesResults}</td>
                            <td className="p-4 text-right text-emerald-600 font-bold">${report.clientBill?.toFixed(2) || '0.00'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={3} className="p-10 text-center text-gray-400 font-medium border border-dashed border-gray-200 bg-gray-50/50 rounded-xl mt-4">No sales data</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pending Top-Up Requests */}
            {(client.topUpRequests || []).length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center">
                  <ListTodo className="mr-2 text-indigo-500" /> My Top-Up Requests
                </h3>
                <div className="space-y-3">
                  {(client.topUpRequests || []).map((req: any) => (
                    <div key={req.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-800">৳{req.amount?.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{req.date}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            
            {/* Need Support? */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl shadow-sm p-8 text-white text-center">
               <LifeBuoy size={48} className="mx-auto mb-4 text-indigo-200" />
               <h3 className="text-2xl font-black mb-2 tracking-tight">Need Support?</h3>
               <p className="text-sm text-indigo-100 mb-6 font-medium">Our team is available 24/7 to assist with your campaigns and queries.</p>
               <button className="w-full bg-white text-indigo-700 py-3 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition-colors">
                 Open Support Ticket
               </button>
            </div>

            {/* Top Up Request */}
            {client.settings.allowTopUp && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-extrabold text-gray-900 mb-4 flex items-center">
                  <Wallet className="mr-2 text-indigo-500" /> Top-Up Request
                </h3>
                <form className="space-y-4" onSubmit={handleTopUpRequest}>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Amount (৳)</label>
                    <input 
                      type="number"
                      required
                      placeholder="e.g. 50000"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none font-bold text-gray-900 text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Transaction ID / Note</label>
                    <textarea 
                      placeholder="Transaction ID or note..."
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm text-gray-700 resize-none h-20"
                    ></textarea>
                  </div>

                  {/* Payment Proof Upload */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">পেমেন্ট প্রুফ (স্ক্রিনশট) *</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handleProofSelect(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    {!proofPreview ? (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors group"
                      >
                        <Upload size={28} className="mx-auto mb-2 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                        <p className="text-sm font-bold text-gray-500 group-hover:text-indigo-600">ছবি আপলোড করুন</p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP • সর্বোচ্চ ৫MB</p>
                      </button>
                    ) : (
                      <div className="relative rounded-xl overflow-hidden border border-gray-200">
                        <img src={proofPreview} alt="Payment proof" className="w-full h-40 object-cover" />
                        <button
                          type="button"
                          onClick={clearProof}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                        >
                          <X size={16} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                          <p className="text-white text-xs font-medium flex items-center">
                            <CheckCircle2 size={14} className="mr-1 text-emerald-400" />
                            {proofFile?.name} ({(proofFile?.size || 0 / 1024).toFixed(0)} KB)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    disabled={uploading}
                    className="w-full bg-indigo-600 text-white rounded-xl py-3 font-bold shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <><Loader size={18} className="animate-spin" /> Uploading...</>
                    ) : (
                      'Send Request'
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Payment Methods */}
            {client.settings.paymentMethods && (client.paymentMethods || []).length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-extrabold text-gray-900 mb-6 flex items-center">
                  <CreditCard className="mr-2 text-indigo-500" /> Payment Methods
                </h3>
                <div className="space-y-4">
                  {(client.paymentMethods || []).map((method: any, index: number) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{method.type}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-gray-900 text-lg tracking-widest font-mono">{method.number}</span>
                        <button 
                          onClick={() => handleCopy(method.number, index)}
                          className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
                          title="Copy account number"
                        >
                          {copiedIndex === index ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Copy size={18} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
