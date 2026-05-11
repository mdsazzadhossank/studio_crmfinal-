import React, { useState } from 'react';
import { User, Phone, Mail, Facebook, DollarSign, Briefcase, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function PublicModelRegistration() {
  const [submitted, setSubmitted] = useState(false);
  const [newModel, setNewModel] = useState({ 
    name: '', 
    category: '', 
    hourlyRate: 0, 
    imageUrl: '', 
    phone: '', 
    email: '', 
    facebook: '', 
    portfolioLinks: [] as string[], 
    portfolioImages: [] as string[], 
    projects: [] as string[] 
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const base64String = canvas.toDataURL('image/jpeg', 0.7);
          setNewModel({ ...newModel, imageUrl: base64String });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePortfolioImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 600;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            
            const base64String = canvas.toDataURL('image/jpeg', 0.7);
            setNewModel(prev => ({ 
              ...prev, 
              portfolioImages: [...prev.portfolioImages, base64String] 
            }));
          };
          img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const savedModelsStr = localStorage.getItem('studio_models');
    let models = [];
    if (savedModelsStr) {
      try {
        models = JSON.parse(savedModelsStr);
      } catch (err) {}
    }

    const finalModel = {
      ...newModel,
      id: `m${Date.now()}`,
      imageUrl: newModel.imageUrl || `https://picsum.photos/seed/${newModel.name}/200/300`
    };

    models.push(finalModel);
    localStorage.setItem('studio_models', JSON.stringify(models));

    setTimeout(() => {
      setSubmitted(true);
    }, 1000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">ধন্যবাদ!</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            আপনার রেজিস্ট্রেশন সফলভাবে সম্পন্ন হয়েছে। আমাদের টিম খুব দ্রুত আপনার সাথে যোগাযোগ করবে।
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">মডেল রেজিস্ট্রেশন</h1>
          <h2 className="text-xl font-semibold text-purple-600 mb-4">আমাদের স্টুডিওর জন্য নতুন মডেল</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-lg leading-relaxed">
            দয়া করে আপনার তথ্য দিয়ে নিচের ফর্মটি পূরণ করুন এবং আমাদের মডেল টিমের অংশ হোন।
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">আপনার পুরো নাম *</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                <input required type="text" value={newModel.name} onChange={e => setNewModel({...newModel, name: e.target.value})} className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all" placeholder="আপনার পুরো নাম" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">ক্যাটাগরি *</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 text-gray-400" size={18} />
                <input required type="text" value={newModel.category} onChange={e => setNewModel({...newModel, category: e.target.value})} className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all" placeholder="যেমন: Fashion, Commercial, Lifestyle" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">ঘণ্টাপ্রতি রেট (৳) *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 text-gray-400" size={18} />
                <input required type="number" value={newModel.hourlyRate || ''} onChange={e => setNewModel({...newModel, hourlyRate: Number(e.target.value)})} className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all" placeholder="যেমন: 2000" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">ফোন নাম্বার (ঐচ্ছিক)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                <input type="tel" value={newModel.phone} onChange={e => setNewModel({...newModel, phone: e.target.value})} className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all" placeholder="01XXX-XXXXXX" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">ইমেইল ঠিকানা (ঐচ্ছিক)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input type="email" value={newModel.email} onChange={e => setNewModel({...newModel, email: e.target.value})} className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all" placeholder="example@email.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">ফেসবুক প্রোফাইল বা পেজ লিংক (ঐচ্ছিক)</label>
              <div className="relative">
                <Facebook className="absolute left-3 top-3 text-gray-400" size={18} />
                <input type="url" value={newModel.facebook} onChange={e => setNewModel({...newModel, facebook: e.target.value})} className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all" placeholder="https://facebook.com/..." />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-bold text-gray-700">পোর্টফোলিও লিংক (ঐচ্ছিক)</label>
                <button 
                  type="button" 
                  onClick={() => setNewModel({...newModel, portfolioLinks: [...newModel.portfolioLinks, '']})} 
                  className="text-xs bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg hover:bg-purple-100 flex items-center font-bold"
                >
                  <Plus size={14} className="mr-1" /> মাধ্যম যোগ করুন
                </button>
              </div>
              <div className="space-y-3">
                {newModel.portfolioLinks.map((link, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input 
                      type="url" 
                      value={link} 
                      onChange={e => {
                        const newLinks = [...newModel.portfolioLinks];
                        newLinks[index] = e.target.value;
                        setNewModel({...newModel, portfolioLinks: newLinks});
                      }} 
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm transition-all" 
                      placeholder="https://..." 
                    />
                    <button 
                      type="button" 
                      onClick={() => {
                        const newLinks = [...newModel.portfolioLinks];
                        newLinks.splice(index, 1);
                        setNewModel({...newModel, portfolioLinks: newLinks});
                      }} 
                      className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <label className="block text-sm font-bold text-gray-700 mb-2">পোর্টফোলিও ছবি (একাধিক)</label>
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={handlePortfolioImagesUpload} 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all" 
              />
              {newModel.portfolioImages.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-4">
                  {newModel.portfolioImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <img src={img} alt={`Portfolio ${index}`} className="h-20 w-20 object-cover rounded-xl border border-gray-200" />
                      <button 
                        type="button"
                        onClick={() => {
                          const newImages = [...newModel.portfolioImages];
                          newImages.splice(index, 1);
                          setNewModel({...newModel, portfolioImages: newImages});
                        }}
                        className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100">
              <label className="block text-sm font-bold text-gray-700 mb-2">আপনার প্রোফাইলের ছবি *</label>
              <input required type="file" accept="image/*" onChange={handleImageUpload} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
              {newModel.imageUrl && (
                <div className="mt-4">
                  <img src={newModel.imageUrl} alt="Preview" className="h-32 w-32 object-cover rounded-2xl border-4 border-white shadow-xl" />
                </div>
              )}
            </div>

          </div>

          <button type="submit" className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-200 transition-all">রেজিস্টার করুন</button>
        </form>
      </div>
    </div>
  );
}
