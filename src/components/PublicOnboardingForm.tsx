import React, { useState } from 'react';
import { Building2, User, Phone, Mail, Link as LinkIcon, CheckCircle2, ChevronRight, Video, Globe, TrendingUp, MessageSquare, BookOpen, Briefcase, MapPin, CalendarClock, DollarSign, Clock, Target } from 'lucide-react';

type ServiceType = 'marketing' | 'website' | 'video' | 'automation' | 'course' | 'consultancy';

export default function PublicOnboardingForm() {
  const [submitted, setSubmitted] = useState(false);
  const [selectedServices, setSelectedServices] = useState<ServiceType[]>([]);
  
  // Basic Info Form State
  const [basicInfo, setBasicInfo] = useState({
    name: '', phone: '', email: '', businessName: '', facebookPage: '', websiteLink: '', businessLocation: '', extraDetails: ''
  });

  // Specific Form States
  const [marketingInfo, setMarketingInfo] = useState({ businessType: '', campaignGoal: '', businessAge: '', assets: '', content: '' });
  const [websiteInfo, setWebsiteInfo] = useState({ websiteType: '', ecomFeatures: '', productDesignDetails: '' });
  const [videoInfo, setVideoInfo] = useState({ 
    purpose: [] as string[], 
    format: [] as string[], 
    duration: '', 
    count: '',
    productDetails: '', 
    productPrice: '',
    productMaterial: '',
    sellingPoint: '',
    offerDiscount: '',
    referenceVideo: '',
    script: '',
    language: [] as string[]
  });
  const [automationInfo, setAutomationInfo] = useState({ 
    purpose: [] as string[], 
    pageCount: '',
    targetPageLink: '',
    hasWebsite: '',
    automationWebsiteLink: '',
    productCount: '',
    averageProductPrice: '',
    mainProducts: '',
    productLinks: '',
    hasOffer: '',
    offerDetails: '',
    deliveryCharge: '',
    hasFreeDelivery: '',
    paymentMethods: [] as string[],
    customerInfoCollection: [] as string[],
    commonCustomerQuestions: '',
    commentReply: '',
    inboxAutoMessage: '',
    negativeCommentHandling: '',
    automationTargetDestination: [] as string[],
    platformDetails: '', 
    offersDeliveryInfo: '' 
  });
  const [courseInfo, setCourseInfo] = useState({ 
    courseInterest: '', 
    learningObjectives: '', 
    skillLevel: '', 
    toolFamiliarity: '', 
    classPreference: '', 
    classTime: '', 
    studentGoals: '' 
  });
  const [consultancyInfo, setConsultancyInfo] = useState({ businessType: '', challenge: '' });
  
  const [timelineInfo, setTimelineInfo] = useState({ budget: '', startDate: '', deadline: '' });

  const handleServiceToggle = (service: ServiceType) => {
    setSelectedServices(prev => 
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const categoryMap: Record<ServiceType, string> = {
      marketing: 'Marketing',
      website: 'Website',
      video: 'Video',
      automation: 'Automation',
      course: 'Course',
      consultancy: 'Consultancy'
    };

    const savedClients = localStorage.getItem('allClientsData');
    let clientsData = [];
    if (savedClients) {
      try {
        clientsData = JSON.parse(savedClients);
      } catch (err) {}
    }

    const savedComments = localStorage.getItem('allClientsComments');
    let commentsData: any[] = [];
    if (savedComments) {
      try {
        commentsData = JSON.parse(savedComments);
      } catch (err) {}
    }

    selectedServices.forEach(service => {
      let specifics = '';
      if (service === 'marketing') specifics = `Type: ${marketingInfo.businessType}\nGoal: ${marketingInfo.campaignGoal}\nAge: ${marketingInfo.businessAge}\nAssets: ${marketingInfo.assets}\nContent: ${marketingInfo.content}`;
      if (service === 'website') specifics = `Type: ${websiteInfo.websiteType}\nEcom: ${websiteInfo.ecomFeatures}\nDesign: ${websiteInfo.productDesignDetails}`;
      if (service === 'video') specifics = `Purpose: ${videoInfo.purpose.join(', ')}\nFormat: ${videoInfo.format.join(', ')}\nDuration: ${videoInfo.duration}\nCount: ${videoInfo.count}\nDetails: ${videoInfo.productDetails}\nPrice: ${videoInfo.productPrice}\nMaterial: ${videoInfo.productMaterial}\nSelling Point: ${videoInfo.sellingPoint}\nOffer: ${videoInfo.offerDiscount}\nRef: ${videoInfo.referenceVideo}\nScript: ${videoInfo.script}\nLanguage: ${videoInfo.language.join(', ')}`;
      if (service === 'automation') specifics = `Purpose: ${automationInfo.purpose.join(', ')}\nPages: ${automationInfo.pageCount}\nLink: ${automationInfo.targetPageLink}\nWebsite: ${automationInfo.hasWebsite} ${automationInfo.automationWebsiteLink}\nProducts: ${automationInfo.productCount} (${automationInfo.averageProductPrice})\nMain: ${automationInfo.mainProducts}\nOffer: ${automationInfo.hasOffer} ${automationInfo.offerDetails}\nDelivery: ${automationInfo.deliveryCharge} (Free? ${automationInfo.hasFreeDelivery})\nPayment: ${automationInfo.paymentMethods.join(', ')}\nCollect: ${automationInfo.customerInfoCollection.join(', ')}\nQuestions: ${automationInfo.commonCustomerQuestions}\nDest: ${automationInfo.automationTargetDestination.join(', ')}`;
      if (service === 'course') specifics = `Interest: ${courseInfo.courseInterest}\nGoal: ${courseInfo.learningObjectives}\nLevel: ${courseInfo.skillLevel}\nTools: ${courseInfo.toolFamiliarity}\nClass: ${courseInfo.classPreference}\nTime: ${courseInfo.classTime}\nStudent Goal: ${courseInfo.studentGoals}`;
      if (service === 'consultancy') specifics = `Business: ${consultancyInfo.businessType}\nChallenge: ${consultancyInfo.challenge}`;

      const clientId = Date.now().toString() + Math.random().toString(36).substring(2, 9);
      
      const newLead: any = {
        id: clientId,
        businessName: basicInfo.businessName || basicInfo.name,
        websiteUrl: basicInfo.websiteLink || '',
        whatsappNumber: basicInfo.phone || '',
        email: basicInfo.email || '',
        serviceType: categoryMap[service],
        status: 'Inactive',
        facebookPageLink: basicInfo.facebookPage || '',
        adAccountId: '',
        createdAt: new Date().toISOString(),
        businessLocation: basicInfo.businessLocation || '',
        budget: timelineInfo.budget || '',
        startDate: timelineInfo.startDate || '',
        deadline: timelineInfo.deadline || '',
        extraDetails: basicInfo.extraDetails || ''
      };

      if (service === 'marketing') {
        newLead.marketingBusinessType = marketingInfo.businessType || '';
        newLead.campaignGoal = marketingInfo.campaignGoal || '';
        newLead.businessAge = marketingInfo.businessAge || '';
        newLead.assets = marketingInfo.assets || '';
        newLead.contentDetails = marketingInfo.content || '';
      }
      if (service === 'website') {
        newLead.websiteType = websiteInfo.websiteType || '';
        newLead.ecomFeatures = websiteInfo.ecomFeatures || '';
        newLead.productDesignDetails = websiteInfo.productDesignDetails || '';
      }
      if (service === 'video') {
         newLead.videoPurpose = videoInfo.purpose.join(', ') || '';
         newLead.videoFormat = videoInfo.format.join(', ') || '';
         newLead.videoDuration = videoInfo.duration || '';
         newLead.videoCount = videoInfo.count || '';
         newLead.videoProductDetails = videoInfo.productDetails || '';
         newLead.videoProductPrice = videoInfo.productPrice || '';
         newLead.videoProductMaterial = videoInfo.productMaterial || '';
         newLead.videoSellingPoint = videoInfo.sellingPoint || '';
         newLead.videoOfferDiscount = videoInfo.offerDiscount || '';
         newLead.referenceVideo = videoInfo.referenceVideo || '';
         newLead.videoScript = videoInfo.script || '';
         newLead.videoLanguage = videoInfo.language.join(', ') || '';
      }
      if (service === 'automation') {
         newLead.automationPurpose = automationInfo.purpose.join(', ') || '';
         newLead.pageCount = automationInfo.pageCount || '';
         newLead.targetPageLink = automationInfo.targetPageLink || '';
         newLead.hasWebsite = automationInfo.hasWebsite || '';
         newLead.automationWebsiteLink = automationInfo.automationWebsiteLink || '';
         newLead.productCount = automationInfo.productCount || '';
         newLead.averageProductPrice = automationInfo.averageProductPrice || '';
         newLead.mainProducts = automationInfo.mainProducts || '';
         newLead.productLinks = automationInfo.productLinks || '';
         newLead.hasOffer = automationInfo.hasOffer || '';
         newLead.offerDetails = automationInfo.offerDetails || '';
         newLead.deliveryCharge = automationInfo.deliveryCharge || '';
         newLead.hasFreeDelivery = automationInfo.hasFreeDelivery || '';
         newLead.paymentMethods = automationInfo.paymentMethods.join(', ') || '';
         newLead.customerInfoCollection = automationInfo.customerInfoCollection.join(', ') || '';
         newLead.commonCustomerQuestions = automationInfo.commonCustomerQuestions || '';
         newLead.commentReply = automationInfo.commentReply || '';
         newLead.inboxAutoMessage = automationInfo.inboxAutoMessage || '';
         newLead.negativeCommentHandling = automationInfo.negativeCommentHandling || '';
         newLead.automationTargetDestination = automationInfo.automationTargetDestination.join(', ') || '';
      }
      if (service === 'course') {
         newLead.courseInterest = courseInfo.courseInterest || '';
         newLead.learningObjectives = courseInfo.learningObjectives || '';
         newLead.skillLevel = courseInfo.skillLevel || '';
         newLead.toolFamiliarity = courseInfo.toolFamiliarity || '';
         newLead.classPreference = courseInfo.classPreference || '';
         newLead.classTime = courseInfo.classTime || '';
         newLead.studentGoals = courseInfo.studentGoals || '';
      }
      if (service === 'consultancy') {
         newLead.consultancyBusinessType = consultancyInfo.businessType || '';
         newLead.challenge = consultancyInfo.challenge || '';
      }
      
      clientsData.push(newLead);

      const systemComment = `Form submitted for ${categoryMap[service]} service. structured data saved.`;

      commentsData.push({
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        clientId: clientId,
        text: systemComment,
        authorId: 'system',
        authorName: 'System Form',
        createdAt: new Date().toISOString()
      });
    });

    localStorage.setItem('allClientsData', JSON.stringify(clientsData));
    localStorage.setItem('allClientsComments', JSON.stringify(commentsData));

    setTimeout(() => {
      setSubmitted(true);
    }, 1000);
  };

  if (submitted) {
    const isCourseInquiry = selectedServices.includes('course');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">ধন্যবাদ!</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            {isCourseInquiry 
              ? 'আপনার কোর্সের আবেদনটি সফলভাবে জমা দেওয়া হয়েছে! আমাদের টিম খুব দ্রুত আপনার সাথে যোগাযোগ করবে।'
              : 'আপনার সার্ভিস রিকোয়েস্টটি সফলভাবে জমা দেওয়া হয়েছে! আমাদের টিম খুব দ্রুত আপনার সাথে যোগাযোগ করবে।'}
          </p>
        </div>
      </div>
    );
  }

  // Calculate dynamic section numbers
  let sectionIndex = 2; // Basic info is 1, Service selection is 2

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">সার্ভিস রিকোয়েস্ট ফর্ম</h1>
          <h2 className="text-xl font-semibold text-indigo-600 mb-4">Social Ad Expert</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-lg leading-relaxed">
            দয়া করে আপনার ব্যবসার তথ্য এবং আপনি যে সার্ভিসটি নিতে চান সেটি সিলেক্ট করে বিস্তারিত জানান।
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Basic Info Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mr-3 text-sm">1</span>
              প্রাথমিক এবং ব্যবসার তথ্য
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">আপনার নাম *</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input type="text" required value={basicInfo.name} onChange={e => setBasicInfo({...basicInfo, name: e.target.value})} className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="আপনার পুরো নাম" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ফোন নাম্বার *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input type="tel" required value={basicInfo.phone} onChange={e => setBasicInfo({...basicInfo, phone: e.target.value})} className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="01XXX-XXXXXX" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ইমেইল ঠিকানা</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input type="email" value={basicInfo.email} onChange={e => setBasicInfo({...basicInfo, email: e.target.value})} className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="example@email.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ব্যবসার/কোম্পানির নাম *</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input type="text" required={!selectedServices.includes('course')} value={basicInfo.businessName} onChange={e => setBasicInfo({...basicInfo, businessName: e.target.value})} className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="আপনার ব্যবসার নাম" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ফেসবুক পেজ লিংক *</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input type="url" required={!selectedServices.includes('course')} value={basicInfo.facebookPage} onChange={e => setBasicInfo({...basicInfo, facebookPage: e.target.value})} className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="https://facebook.com/yourpage" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ওয়েবসাইট লিংক (ঐচ্ছিক)</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input type="url" value={basicInfo.websiteLink} onChange={e => setBasicInfo({...basicInfo, websiteLink: e.target.value})} className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="https://yourwebsite.com" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">ব্যবসার লোকেশন (ঠিকানা)</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input type="text" value={basicInfo.businessLocation} onChange={e => setBasicInfo({...basicInfo, businessLocation: e.target.value})} className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="আপনার ব্যবসার ঠিকানা" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Service Selection */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mr-3 text-sm">2</span>
              সার্ভিস নির্বাচন করুন * (একাধিক বাছতে পারেন)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <label className={`cursor-pointer flex items-center p-4 rounded-xl border-2 transition-all ${selectedServices.includes('marketing') ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="checkbox" className="sr-only" onChange={() => handleServiceToggle('marketing')} checked={selectedServices.includes('marketing')} />
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 shrink-0 ${selectedServices.includes('marketing') ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  <TrendingUp size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">মার্কেটিং সার্ভিস</h3>
                </div>
              </label>

              <label className={`cursor-pointer flex items-center p-4 rounded-xl border-2 transition-all ${selectedServices.includes('website') ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="checkbox" className="sr-only" onChange={() => handleServiceToggle('website')} checked={selectedServices.includes('website')} />
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 shrink-0 ${selectedServices.includes('website') ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  <Globe size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">ওয়েবসাইট সার্ভিস</h3>
                </div>
              </label>

              <label className={`cursor-pointer flex items-center p-4 rounded-xl border-2 transition-all ${selectedServices.includes('video') ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="checkbox" className="sr-only" onChange={() => handleServiceToggle('video')} checked={selectedServices.includes('video')} />
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 shrink-0 ${selectedServices.includes('video') ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  <Video size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">ভিডিও কনটেন্ট সার্ভিস</h3>
                </div>
              </label>

              <label className={`cursor-pointer flex items-center p-4 rounded-xl border-2 transition-all ${selectedServices.includes('automation') ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="checkbox" className="sr-only" onChange={() => handleServiceToggle('automation')} checked={selectedServices.includes('automation')} />
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 shrink-0 ${selectedServices.includes('automation') ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  <MessageSquare size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">অটোমেশন ও চ্যাটবট</h3>
                </div>
              </label>

              <label className={`cursor-pointer flex items-center p-4 rounded-xl border-2 transition-all ${selectedServices.includes('course') ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="checkbox" className="sr-only" onChange={() => handleServiceToggle('course')} checked={selectedServices.includes('course')} />
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 shrink-0 ${selectedServices.includes('course') ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  <BookOpen size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">কোর্স ও ট্রেনিং সার্ভিস</h3>
                </div>
              </label>

              <label className={`cursor-pointer flex items-center p-4 rounded-xl border-2 transition-all ${selectedServices.includes('consultancy') ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="checkbox" className="sr-only" onChange={() => handleServiceToggle('consultancy')} checked={selectedServices.includes('consultancy')} />
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 shrink-0 ${selectedServices.includes('consultancy') ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  <Briefcase size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">বিজনেস কনসালটেন্সি</h3>
                </div>
              </label>

            </div>
            
            {selectedServices.length === 0 && (
               <p className="text-red-500 text-sm mt-4 font-medium">দয়া করে অন্তত একটি সার্ভিস নির্বাচন করুন।</p>
            )}
          </div>

          {/* Dynamic Service Info Sections */}
          {selectedServices.includes('marketing') && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mr-3 text-sm">{++sectionIndex}</span>
                মার্কেটিং সার্ভিস সম্পর্কিত তথ্য
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">ব্যবসার ধরন *</label>
                  <input type="text" required value={marketingInfo.businessType} onChange={e => setMarketingInfo({...marketingInfo, businessType: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="যেমন: ই-কমার্স, লোকাল শপ, সার্ভিস এজেন্সি" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">ক্যাম্পেইনের মূল লক্ষ্য কী? *</label>
                  <select required value={marketingInfo.campaignGoal} onChange={e => setMarketingInfo({...marketingInfo, campaignGoal: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="">নির্বাচন করুন</option>
                    <option value="sales">প্রোডাক্ট সেলস / বিক্রি বাড়ানো</option>
                    <option value="leads">লিড জেনারেশন (Customer Info)</option>
                    <option value="messages">মেসেজ পাওয়া</option>
                    <option value="awareness">ব্র্যান্ডিং ও রিচ (Awareness/Video Views)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">ব্যবসার বয়স/বর্তমান অবস্থা</label>
                  <input type="text" value={marketingInfo.businessAge} onChange={e => setMarketingInfo({...marketingInfo, businessAge: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="যেমন: নতুন শুরু করেছি / ৫ বছরের পুরনো ব্যবসা" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">আপনার কি অ্যাড অ্যাকাউন্ট এবং পিক্সেল সেটআপ আছে?</label>
                  <textarea rows={2} value={marketingInfo.assets} onChange={e => setMarketingInfo({...marketingInfo, assets: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="বিস্তারিত জানান..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">বিজ্ঞাপনের জন্য ছবি/ভিডিও (Content) কি তৈরি আছে?</label>
                  <textarea rows={2} value={marketingInfo.content} onChange={e => setMarketingInfo({...marketingInfo, content: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="যেমন: হ্যাঁ, আমাদের ডিজাইনার আছে / না, আপনাদের করতে হবে"></textarea>
                </div>
              </div>
            </div>
          )}

          {selectedServices.includes('website') && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mr-3 text-sm">{++sectionIndex}</span>
                ওয়েবসাইট সার্ভিস সম্পর্কিত তথ্য
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">ওয়েবসাইটের ধরন *</label>
                  <input type="text" required value={websiteInfo.websiteType} onChange={e => setWebsiteInfo({...websiteInfo, websiteType: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="যেমন: ই-কমার্স, কর্পোরেট, পার্সোনাল পোর্টফোলিও, ল্যান্ডিং পেজ" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">ই-কমার্স বা পেমেন্ট ফিচার প্রয়োজন কিনা?</label>
                  <textarea rows={2} value={websiteInfo.ecomFeatures} onChange={e => setWebsiteInfo({...websiteInfo, ecomFeatures: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="যেমন: বিকাশ/নগদ পেমেন্ট, কার্ট সিস্টেম ইত্যাদি..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">পছন্দের কোনো ডিজাইন বা প্রোডাক্টের বিস্তারিত</label>
                  <textarea rows={3} value={websiteInfo.productDesignDetails} onChange={e => setWebsiteInfo({...websiteInfo, productDesignDetails: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="রেফারেন্স লিংক বা আপনার আইডিয়া এখানে লিখুন..."></textarea>
                </div>
              </div>
            </div>
          )}

          {selectedServices.includes('video') && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mr-3 text-sm">{++sectionIndex}</span>
                ভিডিও কনটেন্ট সার্ভিস সম্পর্কিত তথ্য
              </h2>
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-md font-bold text-indigo-700 mb-4 border-b pb-2">5.1 ভিডিওর উদ্দেশ্য</h3>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">আপনি কোন উদ্দেশ্যে ভিডিও কনটেন্ট চান? *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        'Facebook Ads', 'Facebook Reels', 'Instagram Reels', 'TikTok Video', 
                        'YouTube Shorts', 'YouTube Long Video', 'Product Promo', 'Sales Video', 
                        'Brand Awareness Video', 'Offer/Discount Video', 'UGC Style Video', 
                        'Testimonial Video', 'Product Demonstration', 'Explainer Video', 
                        'Website Banner Video', 'Landing Page Video'
                      ].map(option => (
                        <label key={option} className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-indigo-50 transition-colors">
                          <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" 
                            checked={videoInfo.purpose.includes(option)}
                            onChange={(e) => {
                              const newPurposes = e.target.checked 
                                ? [...videoInfo.purpose, option] 
                                : videoInfo.purpose.filter(p => p !== option);
                              setVideoInfo({...videoInfo, purpose: newPurposes});
                            }}
                          />
                          <span className="text-sm text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-md font-bold text-indigo-700 mb-4 border-b pb-2">5.2 ভিডিও ফরম্যাট ও ডিউরেশন</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">আপনি কী ধরনের ভিডিও চান? *</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          'Short Reels', 'Product Showcase', 'Voiceover Video', 'Model Shoot Video',
                          'Studio Product Video', 'Lifestyle Video', 'Animation/Motion Graphics',
                          'Text-based Promo Video', 'Before/After Video', 'Trend-based TikTok/Reels'
                        ].map(option => (
                          <label key={option} className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-indigo-50 transition-colors">
                            <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                              checked={videoInfo.format.includes(option)}
                              onChange={(e) => {
                                const newFormats = e.target.checked
                                  ? [...videoInfo.format, option]
                                  : videoInfo.format.filter(f => f !== option);
                                setVideoInfo({...videoInfo, format: newFormats});
                              }}
                            />
                            <span className="text-sm text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">আনুমানিক ভিডিও ডিউরেশন কত হবে? *</label>
                      <select required value={videoInfo.duration} onChange={e => setVideoInfo({...videoInfo, duration: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
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
                      <label className="block text-sm font-bold text-gray-700 mb-2">কয়টি ভিডিও লাগবে? *</label>
                      <input type="number" required value={videoInfo.count} onChange={e => setVideoInfo({...videoInfo, count: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="যেমন: ৫" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-md font-bold text-indigo-700 mb-4 border-b pb-2">5.3 প্রোডাক্ট তথ্য</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">কোন প্রোডাক্ট/সার্ভিসের জন্য ভিডিও চান? *</label>
                      <textarea rows={2} required value={videoInfo.productDetails} onChange={e => setVideoInfo({...videoInfo, productDetails: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="বিস্তারিত লিখুন..."></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">প্রোডাক্টের দাম কত?</label>
                      <input type="text" value={videoInfo.productPrice} onChange={e => setVideoInfo({...videoInfo, productPrice: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="যেমন: ৯৯০ টাকা" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">প্রোডাক্টের ফ্যাব্রিক/ম্যাটেরিয়াল/ডিটেইলস লিখুন</label>
                      <textarea rows={2} value={videoInfo.productMaterial} onChange={e => setVideoInfo({...videoInfo, productMaterial: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="যেমন: কটন, সিল্ক, লেদার, প্রিমিয়াম কোয়ালিটি ইত্যাদি"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">প্রোডাক্টের গুরুত্বপূর্ণ সেলিং পয়েন্ট লিখুন *</label>
                      <textarea rows={2} required value={videoInfo.sellingPoint} onChange={e => setVideoInfo({...videoInfo, sellingPoint: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="কেন কাস্টমার এই প্রোডাক্ট কিনবে?"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">কোনো অফার/ডিসকাউন্ট আছে কি?</label>
                      <input type="text" value={videoInfo.offerDiscount} onChange={e => setVideoInfo({...videoInfo, offerDiscount: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="যেমন: ১০% ছাড়, Buy 1 Get 1, Free Delivery" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-md font-bold text-indigo-700 mb-4 border-b pb-2">5.4 ভিডিও রেফারেন্স ও ফাইল</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">আপনার পছন্দের ভিডিও রেফারেন্স থাকলে দিন</label>
                      <input type="text" value={videoInfo.referenceVideo} onChange={e => setVideoInfo({...videoInfo, referenceVideo: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Facebook/TikTok/YouTube/Instagram ভিডিওর লিংক দিন" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">ভিডিওতে কোনো নির্দিষ্ট লেখা/স্ক্রিপ্ট দিতে চান?</label>
                      <textarea rows={3} value={videoInfo.script} onChange={e => setVideoInfo({...videoInfo, script: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="ভিডিওর স্ক্রিপ্ট বা টেক্সট লিখুন..."></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">ভিডিওর ভাষা কী হবে?</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {['বাংলা', 'ইংরেজি', 'বাংলা + ইংরেজি', 'ভয়েসওভার ছাড়া'].map(option => (
                           <label key={option} className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-indigo-50 transition-colors">
                             <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                               checked={videoInfo.language.includes(option)}
                               onChange={(e) => {
                                 const newLangs = e.target.checked
                                   ? [...videoInfo.language, option]
                                   : videoInfo.language.filter(l => l !== option);
                                 setVideoInfo({...videoInfo, language: newLangs});
                               }}
                             />
                             <span className="text-sm text-gray-700">{option}</span>
                           </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {selectedServices.includes('automation') && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mr-3 text-sm">{++sectionIndex}</span>
                অটোমেশন ও চ্যাটবট সার্ভিস সম্পর্কিত তথ্য
              </h2>
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-md font-bold text-indigo-700 mb-4 border-b pb-2">6.1 অটোমেশনের উদ্দেশ্য</h3>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">আপনি কোন ধরনের অটোমেশন চান? *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        'Messenger Chatbot', 'WhatsApp Automation', 'Comment Auto Reply', 
                        'Comment থেকে Inbox এ নিয়ে আসা', 'Customer Information Collection', 
                        'Sales Conversion Automation', 'Lead Generation Automation', 'FAQ Auto Reply', 
                        'Order Taking Automation', 'Product Recommendation Automation', 
                        'Payment Information Automation', 'Delivery Information Automation', 
                        'Review Collection Automation', 'Abandoned Cart Follow-up', 
                        'Broadcast Message Setup', 'Customer Tagging/Segmentation'
                      ].map(option => (
                        <label key={option} className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-indigo-50 transition-colors">
                          <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" 
                            checked={automationInfo.purpose.includes(option)}
                            onChange={(e) => {
                              const newPurposes = e.target.checked 
                                ? [...automationInfo.purpose, option] 
                                : automationInfo.purpose.filter(p => !p.includes(option));
                              setAutomationInfo({...automationInfo, purpose: newPurposes});
                            }}
                          />
                          <span className="text-sm text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-md font-bold text-indigo-700 mb-4 border-b pb-2">6.2 পেজ, ওয়েবসাইট ও প্রোডাক্ট তথ্য</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">আপনার কয়টি Facebook Page আছে? *</label>
                      <input type="number" required value={automationInfo.pageCount} onChange={e => setAutomationInfo({...automationInfo, pageCount: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">কোন পেজে অটোমেশন সেটআপ করতে চান? *</label>
                      <input type="url" required value={automationInfo.targetPageLink} onChange={e => setAutomationInfo({...automationInfo, targetPageLink: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Facebook Page Link" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">আপনার ওয়েবসাইট আছে কি? *</label>
                      <div className="flex flex-col sm:flex-row gap-4">
                        {['আছে', 'নেই', 'বানাতে চাই'].map(option => (
                           <label key={option} className="flex items-center space-x-2 cursor-pointer">
                             <input type="radio" name="hasWebsite" value={option} checked={automationInfo.hasWebsite === option} onChange={e => setAutomationInfo({...automationInfo, hasWebsite: e.target.value})} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                             <span>{option}</span>
                           </label>
                        ))}
                      </div>
                    </div>
                    {automationInfo.hasWebsite === 'আছে' && (
                      <div className="mt-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">ওয়েবসাইট লিংক দিন</label>
                        <input type="url" value={automationInfo.automationWebsiteLink} onChange={e => setAutomationInfo({...automationInfo, automationWebsiteLink: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Website Link" />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">আপনার মোট কতটি প্রোডাক্ট আছে?</label>
                      <select value={automationInfo.productCount} onChange={e => setAutomationInfo({...automationInfo, productCount: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                        <option value="">নির্বাচন করুন</option>
                        <option value="1-10">১–১০টি</option>
                        <option value="11-50">১১–৫০টি</option>
                        <option value="51-100">৫১–১০০টি</option>
                        <option value="100+">১০০টির বেশি</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">আপনার প্রোডাক্টের গড় দাম কত?</label>
                      <input type="text" value={automationInfo.averageProductPrice} onChange={e => setAutomationInfo({...automationInfo, averageProductPrice: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="যেমন: ৫০০–১৫০০ টাকা" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">আপনার প্রধান প্রোডাক্টগুলোর নাম লিখুন *</label>
                      <textarea rows={2} required value={automationInfo.mainProducts} onChange={e => setAutomationInfo({...automationInfo, mainProducts: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">প্রোডাক্ট লিংক থাকলে দিন</label>
                      <textarea rows={2} value={automationInfo.productLinks} onChange={e => setAutomationInfo({...automationInfo, productLinks: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"></textarea>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-md font-bold text-indigo-700 mb-4 border-b pb-2">6.3 অফার, ডেলিভারি ও সেলস তথ্য</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">বর্তমানে কোনো অফার চলছে কি?</label>
                      <div className="flex flex-col sm:flex-row gap-4">
                        {['হ্যাঁ', 'না', 'অফার তৈরি করতে চাই'].map(option => (
                           <label key={option} className="flex items-center space-x-2 cursor-pointer">
                             <input type="radio" name="hasOffer" value={option} checked={automationInfo.hasOffer === option} onChange={e => setAutomationInfo({...automationInfo, hasOffer: e.target.value})} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                             <span>{option}</span>
                           </label>
                        ))}
                      </div>
                    </div>
                    {automationInfo.hasOffer === 'হ্যাঁ' && (
                      <div className="mt-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">অফারের বিস্তারিত লিখুন</label>
                        <textarea rows={2} value={automationInfo.offerDetails} onChange={e => setAutomationInfo({...automationInfo, offerDetails: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"></textarea>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">ডেলিভারি চার্জ কত?</label>
                      <input type="text" value={automationInfo.deliveryCharge} onChange={e => setAutomationInfo({...automationInfo, deliveryCharge: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="যেমন: ঢাকার ভিতরে ৬০, বাইরে ১২০" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Free Delivery আছে কি?</label>
                      <div className="flex flex-col sm:flex-row gap-4">
                        {['হ্যাঁ', 'না', 'নির্দিষ্ট অর্ডারের উপর Free Delivery'].map(option => (
                           <label key={option} className="flex items-center space-x-2 cursor-pointer">
                             <input type="radio" name="hasFreeDelivery" value={option} checked={automationInfo.hasFreeDelivery === option} onChange={e => setAutomationInfo({...automationInfo, hasFreeDelivery: e.target.value})} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                             <span>{option}</span>
                           </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">পেমেন্ট মেথড কী কী আছে?</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {['Cash on Delivery', 'bKash', 'Nagad', 'Rocket', 'Bank Transfer', 'Online Payment Gateway', 'অন্য কোনো পেমেন্ট মেথড'].map(option => (
                           <label key={option} className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-indigo-50 transition-colors">
                             <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                               checked={automationInfo.paymentMethods.includes(option)}
                               onChange={(e) => {
                                 const newMethods = e.target.checked
                                   ? [...automationInfo.paymentMethods, option]
                                   : automationInfo.paymentMethods.filter(l => !l.includes(option));
                                 setAutomationInfo({...automationInfo, paymentMethods: newMethods});
                               }}
                             />
                             <span className="text-sm text-gray-700">{option}</span>
                           </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">কাস্টমার থেকে কোন কোন তথ্য সংগ্রহ করতে চান? *</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {['নাম', 'ফোন নাম্বার', 'ঠিকানা', 'পছন্দের প্রোডাক্ট', 'সাইজ/কালার', 'বাজেট', 'অর্ডার কনফার্মেশন', 'পেমেন্ট স্ট্যাটাস', 'ডেলিভারি লোকেশন', 'বিশেষ নোট'].map(option => (
                           <label key={option} className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-indigo-50 transition-colors">
                             <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                               checked={automationInfo.customerInfoCollection.includes(option)}
                               onChange={(e) => {
                                 const newColl = e.target.checked
                                   ? [...automationInfo.customerInfoCollection, option]
                                   : automationInfo.customerInfoCollection.filter(l => !l.includes(option));
                                 setAutomationInfo({...automationInfo, customerInfoCollection: newColl});
                               }}
                             />
                             <span className="text-sm text-gray-700">{option}</span>
                           </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-md font-bold text-indigo-700 mb-4 border-b pb-2">6.4 Auto Reply ও Conversation Flow</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">আপনার কাস্টমার সাধারণত কী কী প্রশ্ন করে? *</label>
                      <textarea rows={2} required value={automationInfo.commonCustomerQuestions} onChange={e => setAutomationInfo({...automationInfo, commonCustomerQuestions: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="যেমন: দাম কত, ডেলিভারি চার্জ কত, কবে পাবো, সাইজ আছে কি না"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">কমেন্টে কী ধরনের রিপ্লাই দিতে চান?</label>
                      <textarea rows={2} value={automationInfo.commentReply} onChange={e => setAutomationInfo({...automationInfo, commentReply: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="যেমন: ধন্যবাদ Boss, বিস্তারিত জানতে ইনবক্স চেক করুন"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Inbox-এ অটো মেসেজ কেমন হবে?</label>
                      <textarea rows={2} value={automationInfo.inboxAutoMessage} onChange={e => setAutomationInfo({...automationInfo, inboxAutoMessage: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="আপনি চাইলে মেসেজ লিখে দিতে পারেন, না হলে আমরা সাজিয়ে দেব"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">আজেবাজে/নেগেটিভ কমেন্ট কীভাবে হ্যান্ডেল করতে চান?</label>
                      <div className="flex flex-col gap-2">
                        {['Hide করে দিতে চাই', 'Ignore করতে চাই', 'নির্দিষ্ট রিপ্লাই দিতে চাই', 'ম্যানুয়ালি রিভিউ করতে চাই'].map(option => (
                           <label key={option} className="flex items-center space-x-2 cursor-pointer">
                             <input type="radio" name="negativeCommentHandling" value={option} checked={automationInfo.negativeCommentHandling === option} onChange={e => setAutomationInfo({...automationInfo, negativeCommentHandling: e.target.value})} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                             <span>{option}</span>
                           </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">অটোমেশনের মাধ্যমে কাস্টমারকে কোথায় নিয়ে যেতে চান? *</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {['Inbox Conversation', 'WhatsApp', 'Website Product Page', 'Order Form', 'Checkout Page', 'Phone Call', 'Google Sheet Lead List', 'CRM'].map(option => (
                           <label key={option} className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-indigo-50 transition-colors">
                             <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                               checked={automationInfo.automationTargetDestination.includes(option)}
                               onChange={(e) => {
                                 const newTargets = e.target.checked
                                   ? [...automationInfo.automationTargetDestination, option]
                                   : automationInfo.automationTargetDestination.filter(l => !l.includes(option));
                                 setAutomationInfo({...automationInfo, automationTargetDestination: newTargets});
                               }}
                             />
                             <span className="text-sm text-gray-700">{option}</span>
                           </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedServices.includes('course') && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mr-3 text-sm">{++sectionIndex}</span>
                কোর্স ও ট্রেনিং সার্ভিস সম্পর্কিত তথ্য
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">কোন কোর্সে আগ্রহী? *</label>
                  <select required value={courseInfo.courseInterest} onChange={e => setCourseInfo({...courseInfo, courseInterest: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="">নির্বাচন করুন</option>
                    <option value="digital_marketing">Digital Marketing</option>
                    <option value="wordpress">WordPress Website</option>
                    <option value="landing_page">Landing Page Design</option>
                    <option value="other">অন্যান্য</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">শেখার মূল উদ্দেশ্য কী? *</label>
                  <input type="text" required value={courseInfo.learningObjectives} onChange={e => setCourseInfo({...courseInfo, learningObjectives: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="যেমন: নিজের ব্যবসার জন্য, ফ্রিল্যান্সিং করার জন্য..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">বর্তমান স্কিল লেভেল এবং পূর্ব অভিজ্ঞতা</label>
                  <textarea rows={2} value={courseInfo.skillLevel} onChange={e => setCourseInfo({...courseInfo, skillLevel: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="আগে কিছু শিখেছেন কিনা বা আপনার বর্তমান অবস্থা..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">টুলস বা প্ল্যাটফর্ম সম্পর্কে ধারণা</label>
                  <input type="text" value={courseInfo.toolFamiliarity} onChange={e => setCourseInfo({...courseInfo, toolFamiliarity: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="যেমন: Facebook Ads, WordPress, Elementor ইত্যাদি জানেন কিনা..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">ক্লাসের ধরনে পছন্দ *</label>
                  <select required value={courseInfo.classPreference} onChange={e => setCourseInfo({...courseInfo, classPreference: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="">নির্বাচন করুন</option>
                    <option value="online_live">Online LIVE Class</option>
                    <option value="pre_recorded">Pre-recorded Video</option>
                    <option value="offline">Offline/Physical Class</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">ক্লাসের সুবিধাজনক সময় *</label>
                  <input type="text" required value={courseInfo.classTime} onChange={e => setCourseInfo({...courseInfo, classTime: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="যেমন: রাত ৯টা, শনিবার-সোমবার..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">এই কোর্স শেষে আপনার প্রধান লক্ষ্য কী?</label>
                  <textarea rows={2} value={courseInfo.studentGoals} onChange={e => setCourseInfo({...courseInfo, studentGoals: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="আপনার প্রধান লক্ষ্য বা চ্যালেঞ্জগুলো লিখুন..."></textarea>
                </div>
              </div>
            </div>
          )}

          {selectedServices.includes('consultancy') && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mr-3 text-sm">{++sectionIndex}</span>
                বিজনেস কনসালটেন্সি সম্পর্কিত তথ্য
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">আপনার ব্যবসার ধরন কী? *</label>
                  <input type="text" required value={consultancyInfo.businessType} onChange={e => setConsultancyInfo({...consultancyInfo, businessType: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="যেমন: ই-কমার্স, রেস্টুরেন্ট, সার্ভিস এজেন্সি..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">বর্তমানে ব্যবসায়ের মূল চ্যালেঞ্জটি কী? *</label>
                  <textarea required rows={4} value={consultancyInfo.challenge} onChange={e => setConsultancyInfo({...consultancyInfo, challenge: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="যেমন: সেলস কম, ব্র্যান্ড পরিচিতি নেই, টিম ম্যানেজমেন্ট এর সমস্যা..."></textarea>
                </div>
              </div>
            </div>
          )}

          {/* Budget & Timeline - Only show if any service is selected */}
          {selectedServices.length > 0 && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mr-3 text-sm">{++sectionIndex}</span>
                বাজেট ও টাইমলাইন
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">আনুমানিক বাজেট *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input type="text" required value={timelineInfo.budget} onChange={e => setTimelineInfo({...timelineInfo, budget: e.target.value})} className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="আপনার বাজেট" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">কবে থেকে শুরু করতে চান? *</label>
                  <div className="relative">
                    <CalendarClock className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input type="date" required value={timelineInfo.startDate} onChange={e => setTimelineInfo({...timelineInfo, startDate: e.target.value})} className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">কোনো ডেডলাইন আছে?</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input type="date" value={timelineInfo.deadline} onChange={e => setTimelineInfo({...timelineInfo, deadline: e.target.value})} className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Any other details */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mr-3 text-sm">{selectedServices.length > 0 ? ++sectionIndex : sectionIndex + 1}</span>
              অতিরিক্ত তথ্য
            </h2>
            <textarea rows={4} value={basicInfo.extraDetails} onChange={e => setBasicInfo({...basicInfo, extraDetails: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none" placeholder="আপনি চাইলে আমাদের জন্য অন্য যেকোনো তথ্য বা নির্দেশনা এখানে লিখতে পারেন (Optional)"></textarea>
          </div>

          <button 
            type="submit" 
            disabled={selectedServices.length === 0}
            className={`w-full text-white rounded-2xl py-4 text-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 ${selectedServices.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            <span>ফর্মটি জমা দিন</span>
            <ChevronRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
