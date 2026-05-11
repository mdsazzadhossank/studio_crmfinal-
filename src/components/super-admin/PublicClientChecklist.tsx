import React, { useState } from 'react';
import { CheckCircle2, User, Building2, Phone, Briefcase } from 'lucide-react';

export default function PublicClientChecklist() {
  const [submitted, setSubmitted] = useState(false);
  const [clientData, setClientData] = useState({
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const saved = localStorage.getItem('generalClientsData');
    let clients = [];
    if (saved) {
      try {
         clients = JSON.parse(saved);
      } catch(err) {}
    }

    const newClientObj = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      name: clientData.name,
      company: clientData.company,
      phone: clientData.phone,
      tags: ['New Lead', 'Website Form'],
      pinnedComment: '',
      reminder: '',
      lastUpdate: new Date().toISOString(),
      updateNote: 'Client filled out the public onboarding checklist.',
      info: clientData.info
    };

    clients.unshift(newClientObj);
    localStorage.setItem('generalClientsData', JSON.stringify(clients));

    setSubmitted(true);
  };

  const updateInfo = (key: string, value: string) => {
    setClientData(prev => ({
      ...prev,
      info: { ...prev.info, [key]: value }
    }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">ধন্যবাদ!</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            আপনার তথ্যগুলো সফলভাবে জমা দেওয়া হয়েছে! আমাদের টিম খুব দ্রুত আপনার সাথে যোগাযোগ করবে।
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-4">
            <Briefcase size={32} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">ক্লায়েন্ট অনবোর্ডিং চেকলিস্ট</h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
            দয়া করে নিচের তথ্যগুলো পূরণ করুন। এটি আমাদের আপনাকে আরও ভালো সার্ভিস প্রদান করতে সহায়তা করবে।
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 0: Contact Info */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center border-b border-gray-100 pb-4">
              প্রাথমিক তথ্য
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">আপনার নাম *</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input type="text" required value={clientData.name} onChange={e => setClientData({...clientData, name: e.target.value})} className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="আপনার পুরো নাম" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">কোম্পানির নাম (Optional)</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input type="text" value={clientData.company} onChange={e => setClientData({...clientData, company: e.target.value})} className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="ব্যবসার নাম" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">ফোন নম্বর / হোয়াটসঅ্যাপ *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input type="text" required value={clientData.phone} onChange={e => setClientData({...clientData, phone: e.target.value})} placeholder="+880..." className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Business Info */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">১. বিজনেস ইনফরমেশন</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block text-sm font-bold text-gray-700 mb-2">বিজনেসের ধরন / ক্যাটাগরি</label><input type="text" value={clientData.info.bizCategory} onChange={e => updateInfo('bizCategory', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">পণ্য বা সার্ভিস</label><input type="text" value={clientData.info.bizProducts} onChange={e => updateInfo('bizProducts', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">বিজনেস লোকেশন</label><input type="text" value={clientData.info.bizLocation} onChange={e => updateInfo('bizLocation', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">সার্ভিস এরিয়া</label><input type="text" placeholder="সারা বাংলাদেশ / নির্দিষ্ট এলাকা" value={clientData.info.bizArea} onChange={e => updateInfo('bizArea', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div className="md:col-span-2"><label className="block text-sm font-bold text-gray-700 mb-2">বিজনেস কতদিন ধরে চলছে</label><input type="text" value={clientData.info.bizAge} onChange={e => updateInfo('bizAge', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            </div>
          </div>

          {/* Section 2: Product / Service Details */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">২. প্রোডাক্ট / সার্ভিস ডিটেইলস</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block text-sm font-bold text-gray-700 mb-2">প্রধান পণ্য / সার্ভিস</label><input type="text" value={clientData.info.prodMain} onChange={e => updateInfo('prodMain', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">কোন পণ্য বেশি প্রোমোট করবেন?</label><input type="text" value={clientData.info.prodPromote} onChange={e => updateInfo('prodPromote', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">দাম / প্যাকেজ</label><input type="text" value={clientData.info.prodPrice} onChange={e => updateInfo('prodPrice', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">অফার বা ডিসকাউন্ট</label><input type="text" value={clientData.info.prodOffer} onChange={e => updateInfo('prodOffer', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">ছবি / ভিডিও রেডি আছে?</label><input type="text" value={clientData.info.prodMedia} onChange={e => updateInfo('prodMedia', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">ইউনিক সুবিধা কী?</label><input type="text" value={clientData.info.prodUSP} onChange={e => updateInfo('prodUSP', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            </div>
          </div>

          {/* Section 3: Target Customer */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">৩. টার্গেট কাস্টমার ইনফরমেশন</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block text-sm font-bold text-gray-700 mb-2">কাদের কাছে বিক্রি করতে চান?</label><input type="text" value={clientData.info.tgtWho} onChange={e => updateInfo('tgtWho', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">বয়স সীমানা</label><input type="text" value={clientData.info.tgtAge} onChange={e => updateInfo('tgtAge', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">জেন্ডার</label><input type="text" value={clientData.info.tgtGender} onChange={e => updateInfo('tgtGender', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">লোকেশন</label><input type="text" value={clientData.info.tgtLocation} onChange={e => updateInfo('tgtLocation', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">আগ্রহ / ইন্টারেস্ট</label><input type="text" value={clientData.info.tgtInterest} onChange={e => updateInfo('tgtInterest', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">B2B নাকি B2C?</label><input type="text" value={clientData.info.tgtB2B} onChange={e => updateInfo('tgtB2B', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div className="md:col-span-2"><label className="block text-sm font-bold text-gray-700 mb-2">কাস্টমারের সমস্যা ও সমাধান</label><textarea rows={3} value={clientData.info.tgtProblem} onChange={e => updateInfo('tgtProblem', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none"></textarea></div>
            </div>
          </div>

          {/* Section 4: Marketing Goals */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">৪. মার্কেটিং গোল</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block text-sm font-bold text-gray-700 mb-2">বেশি মেসেজ চান নাকি সেল?</label><input type="text" value={clientData.info.goalMain} onChange={e => updateInfo('goalMain', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">ব্র্যান্ডিং / ফলোয়ার চান?</label><input type="text" value={clientData.info.goalFollowers} onChange={e => updateInfo('goalFollowers', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">ওয়েবসাইট ট্রাফিক দরকার?</label><input type="text" value={clientData.info.goalTraffic} onChange={e => updateInfo('goalTraffic', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">লিড কালেকশন দরকার?</label><input type="text" value={clientData.info.goalLead} onChange={e => updateInfo('goalLead', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">প্রত্যাশিত মাসিক সেল / লিড</label><input type="text" value={clientData.info.goalExpectedSales} onChange={e => updateInfo('goalExpectedSales', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">কতদিনের ক্যাম্পেইন?</label><input type="text" value={clientData.info.goalDuration} onChange={e => updateInfo('goalDuration', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            </div>
          </div>

          {/* Section 5: Budget Info */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">৫. বাজেট ইনফরমেশন</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block text-sm font-bold text-gray-700 mb-2">অ্যাড বাজেট (দৈনিক/মাসিক)</label><input type="text" value={clientData.info.bgAd} onChange={e => updateInfo('bgAd', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">সার্ভিস চার্জ বাজেট</label><input type="text" value={clientData.info.bgService} onChange={e => updateInfo('bgService', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">আগে অ্যাড চালিয়েছেন?</label><input type="text" value={clientData.info.bgPrevAds} onChange={e => updateInfo('bgPrevAds', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">আগে চালালে কত খরচ হয়েছে?</label><input type="text" value={clientData.info.bgPrevSpend} onChange={e => updateInfo('bgPrevSpend', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div className="md:col-span-2"><label className="block text-sm font-bold text-gray-700 mb-2">আগের রেজাল্ট কেমন ছিল?</label><input type="text" value={clientData.info.bgPrevResult} onChange={e => updateInfo('bgPrevResult', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            </div>
          </div>

          {/* Section 6: Social Media Access */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">৬. সোশ্যাল মিডিয়া অ্যাক্সেস</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Facebook Page লিংক</label><input type="text" value={clientData.info.socialFb} onChange={e => updateInfo('socialFb', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Instagram ID</label><input type="text" value={clientData.info.socialIg} onChange={e => updateInfo('socialIg', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">TikTok / YouTube লিংক</label><input type="text" value={clientData.info.socialYt} onChange={e => updateInfo('socialYt', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Business Manager আছে?</label><input type="text" value={clientData.info.socialBm} onChange={e => updateInfo('socialBm', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Ad Account আছে?</label><input type="text" value={clientData.info.socialAdAcc} onChange={e => updateInfo('socialAdAcc', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Pixel / Dataset সেটআপ আছে?</label><input type="text" value={clientData.info.socialPixel} onChange={e => updateInfo('socialPixel', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            </div>
          </div>

          {/* Section 7: Website Info */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">৭. ওয়েবসাইট ইনফরমেশন</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block text-sm font-bold text-gray-700 mb-2">ওয়েবসাইট আছে কি না?</label><input type="text" value={clientData.info.webExists} onChange={e => updateInfo('webExists', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">ওয়েবসাইট লিংক</label><input type="text" value={clientData.info.webLink} onChange={e => updateInfo('webLink', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Landing page আছে?</label><input type="text" value={clientData.info.webLp} onChange={e => updateInfo('webLp', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Speed / Checkout ঠিক আছে?</label><input type="text" value={clientData.info.webSpeed} onChange={e => updateInfo('webSpeed', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Tracking setup আছে?</label><input type="text" value={clientData.info.webTracking} onChange={e => updateInfo('webTracking', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Domain/Hosting Access লাগবে?</label><input type="text" value={clientData.info.webAccess} onChange={e => updateInfo('webAccess', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            </div>
          </div>

          {/* Section 8: Content Info */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">৮. কনটেন্ট ইনফরমেশন</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block text-sm font-bold text-gray-700 mb-2">ছবি / ভিডিও রেডি আছে?</label><input type="text" value={clientData.info.contentMedia} onChange={e => updateInfo('contentMedia', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">আগে বানানো পোস্ট/ডিজাইন আছে?</label><input type="text" value={clientData.info.contentOld} onChange={e => updateInfo('contentOld', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">নতুন কনটেন্ট বানাতে হবে?</label><input type="text" value={clientData.info.contentNeed} onChange={e => updateInfo('contentNeed', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">ব্র্যান্ড কালার/লোগো/ফন্ট</label><input type="text" value={clientData.info.contentBrand} onChange={e => updateInfo('contentBrand', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">নির্দিষ্ট টোন বা ভাষা?</label><input type="text" value={clientData.info.contentTone} onChange={e => updateInfo('contentTone', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Review/Testimonial আছে?</label><input type="text" value={clientData.info.contentReview} onChange={e => updateInfo('contentReview', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            </div>
          </div>

          {/* Section 9: Competitor Info */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">৯. কম্পিটিটর ইনফরমেশন</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block text-sm font-bold text-gray-700 mb-2">প্রধান কম্পিটিটর কারা?</label><input type="text" value={clientData.info.compMain} onChange={e => updateInfo('compMain', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">কম্পিটিটরের লিংক</label><input type="text" value={clientData.info.compLink} onChange={e => updateInfo('compLink', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">কম্পিটিটর কী অফার দেয়?</label><input type="text" value={clientData.info.compOffer} onChange={e => updateInfo('compOffer', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">নিজেকে কীভাবে আলাদা মনে করেন?</label><input type="text" value={clientData.info.compDiff} onChange={e => updateInfo('compDiff', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            </div>
          </div>

          {/* Section 10: Sales Process */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">১০. সেলস প্রসেস</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block text-sm font-bold text-gray-700 mb-2">অর্ডার কীভাবে নেন?</label><input type="text" placeholder="Messenger/WA/Web" value={clientData.info.salesOrder} onChange={e => updateInfo('salesOrder', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">ডেলিভারি প্রসেস</label><input type="text" value={clientData.info.salesDelivery} onChange={e => updateInfo('salesDelivery', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">পেমেন্ট মেথড</label><input type="text" value={clientData.info.salesPayment} onChange={e => updateInfo('salesPayment', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">কাস্টমার রিপ্লাই কে দিবে?</label><input type="text" value={clientData.info.salesWhoReply} onChange={e => updateInfo('salesWhoReply', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">রিপ্লাই টাইম কত দ্রুত?</label><input type="text" value={clientData.info.salesReplyTime} onChange={e => updateInfo('salesReplyTime', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Sales closing script আছে?</label><input type="text" value={clientData.info.salesScript} onChange={e => updateInfo('salesScript', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            </div>
          </div>

          {/* Section 11: Policies */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">১১. পলিসি ও সীমাবদ্ধতা</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Refund / return policy</label><input type="text" value={clientData.info.polRefund} onChange={e => updateInfo('polRefund', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Delivery charge</label><input type="text" value={clientData.info.polDelivery} onChange={e => updateInfo('polDelivery', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Service terms</label><input type="text" value={clientData.info.polTerms} onChange={e => updateInfo('polTerms', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">নিষিদ্ধ শব্দ / দাবি আছে?</label><input type="text" value={clientData.info.polForbidden} onChange={e => updateInfo('polForbidden', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div className="md:col-span-2"><label className="block text-sm font-bold text-gray-700 mb-2">Meta policy অনুযায়ী risky claim?</label><input type="text" value={clientData.info.polMeta} onChange={e => updateInfo('polMeta', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            </div>
          </div>

          {/* Section 12: Reporting */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">১২. রিপোর্টিং ও কমিউনিকেশন</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block text-sm font-bold text-gray-700 mb-2">রিপোর্ট কতদিন পর পর চান?</label><input type="text" value={clientData.info.repFreq} onChange={e => updateInfo('repFreq', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">কোন মাধ্যমে আপডেট চান?</label><input type="text" placeholder="WA/Messenger/Email" value={clientData.info.repMethod} onChange={e => updateInfo('repMethod', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">সিদ্ধান্ত নেওয়ার মূল ব্যক্তি কে?</label><input type="text" value={clientData.info.repDecisionMaker} onChange={e => updateInfo('repDecisionMaker', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">জরুরি কন্টাক্ট নম্বর</label><input type="text" value={clientData.info.repEmergency} onChange={e => updateInfo('repEmergency', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            </div>
          </div>
          
          <div className="text-center pt-8">
            <button type="submit" className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-2xl shadow-xl transition-all transform hover:-translate-y-1">
              ফর্মটি জমা দিন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
