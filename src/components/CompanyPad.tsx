import React, { useState } from 'react';
import { Printer, Building, Megaphone, MonitorPlay, Bot, Download } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export default function CompanyPad() {
  const [selectedCompany, setSelectedCompany] = useState<'social_ads_expert' | 'social_ads_studio' | 'bikri_ai_expert'>('social_ads_expert');
  const [content, setContent] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'error' | 'success'} | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    setIsDownloading(true);
    setMessage({ text: 'পিডিএফ তৈরি হচ্ছে... দয়া করে অপেক্ষা করুন।', type: 'success' });
    
    setTimeout(() => {
      const element = document.getElementById('company-pad-preview');
      if (!element) {
        setIsDownloading(false);
        setMessage({ text: 'পিডিএফ তৈরি করতে সমস্যা হয়েছে।', type: 'error' });
        setTimeout(() => setMessage(null), 3000);
        return;
      }

      // Convert textareas to divs temporarily so they render correctly
      const textareas = element.querySelectorAll('textarea');
      const replacements: {textarea: HTMLTextAreaElement, div: HTMLDivElement}[] = [];
      
      textareas.forEach(ta => {
        const div = document.createElement('div');
        div.className = ta.className;
        div.style.cssText = ta.style.cssText;
        div.style.whiteSpace = 'pre-wrap';
        div.style.wordBreak = 'break-word';
        div.textContent = ta.value;
        ta.parentNode?.insertBefore(div, ta);
        ta.style.display = 'none';
        replacements.push({ textarea: ta, div });
      });
      
      toPng(element, { quality: 0.95, pixelRatio: 2 })
        .then((dataUrl) => {
          // Restore textareas
          replacements.forEach(({ textarea, div }) => {
            div.remove();
            textarea.style.display = '';
          });

          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
          });
          
          const imgProps = pdf.getImageProperties(dataUrl);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          
          pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save(`${companies[selectedCompany].name.replace(/\s+/g, '_')}_Pad.pdf`);
          
          setIsDownloading(false);
          setMessage({ text: 'পিডিএফ ডাউনলোড সফল হয়েছে!', type: 'success' });
          setTimeout(() => setMessage(null), 4000);
        })
        .catch((err) => {
          // Restore textareas
          replacements.forEach(({ textarea, div }) => {
            div.remove();
            textarea.style.display = '';
          });

          console.error('oops, something went wrong!', err);
          setIsDownloading(false);
          setMessage({ text: 'পিডিএফ ডাউনলোড ব্যর্থ হয়েছে।', type: 'error' });
          setTimeout(() => setMessage(null), 4000);
        });
    }, 500);
  };

  const companies = {
    social_ads_expert: {
      name: 'Social ads expert',
      icon: Megaphone,
      color: 'text-blue-600',
      watermarkColor: 'rgba(37, 99, 235, 0.05)',
      subtitle: 'Your Trusted Partner in Digital Marketing & ROI',
      address: 'Dhaka, Bangladesh | info@socialadsexpert.com | +880 1798 205143'
    },
    social_ads_studio: {
      name: 'social ads studio',
      icon: MonitorPlay,
      color: 'text-purple-600',
      watermarkColor: 'rgba(147, 51, 234, 0.05)',
      subtitle: 'Creative Media & Ad Production',
      address: 'Dhaka, Bangladesh | studio@socialadsstudio.com | +880 1928 061999'
    },
    bikri_ai_expert: {
      name: 'bikri Ai. expert',
      icon: Bot,
      color: 'text-emerald-600',
      watermarkColor: 'rgba(5, 150, 105, 0.05)',
      subtitle: 'AI-Powered Sales & Automation Solutions',
      address: 'Dhaka, Bangladesh | ai@bikriaiexpert.com | +880 1960 285161'
    }
  };

  const currentCompany = companies[selectedCompany];
  const Icon = currentCompany.icon;

  return (
    <div className="space-y-6 flex flex-col h-full relative">
      {message && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 text-white ${message.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
          {message.text}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 print:hidden">
        <div className="flex items-center gap-4">
          <div className="bg-sky-50 p-2.5 rounded-lg border border-sky-100">
            <Building className="text-sky-600" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">অফিসিয়াল প্যাড</h1>
            <p className="text-sm text-gray-500">কোম্পানির নাম সিলেক্ট করে প্যাডে লিখুন এবং প্রিন্ট বা ডাউনলোড করুন</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value as any)}
            className="flex-1 md:w-64 border border-gray-300 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-medium bg-gray-50"
          >
            <option value="social_ads_expert">Social ads expert</option>
            <option value="social_ads_studio">social ads studio</option>
            <option value="bikri_ai_expert">bikri Ai. expert</option>
          </select>
          
          <button 
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-sm whitespace-nowrap disabled:opacity-50"
          >
            <Download size={18} /> পিডিএফ ডাউনলোড
          </button>
          
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-sm whitespace-nowrap"
          >
            <Printer size={18} /> প্রিন্ট
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto print:overflow-visible pb-10">
        <div id="company-pad-preview" className="max-w-[210mm] mx-auto min-h-[297mm] bg-white pt-[30mm] pb-[30mm] px-[20mm] shadow-lg print:shadow-none print:p-0 print:m-0 rounded-sm relative overflow-hidden">
          
          {/* Watermark */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30 select-none" style={{ zIndex: 0 }}>
            <div className="transform -rotate-45 flex flex-col items-center justify-center">
              <Icon size={180} color={currentCompany.watermarkColor.replace('0.05', '0.2')} className="mb-8" />
              <h1 className="text-6xl font-extrabold tracking-widest uppercase whitespace-nowrap" style={{ color: currentCompany.watermarkColor.replace('0.05', '0.2') }}>
                {currentCompany.name}
              </h1>
            </div>
          </div>
          
          {/* Pad Header */}
          <div className="border-b-2 border-gray-200 pb-6 mb-8 flex flex-col items-center text-center relative z-10">
            <div className={`mb-3 ${currentCompany.color}`}>
              <Icon size={48} strokeWidth={1.5} />
            </div>
            <h1 className={`text-4xl font-extrabold tracking-tight uppercase mb-2 ${currentCompany.color}`}>
              {currentCompany.name}
            </h1>
            <p className="text-gray-500 font-medium tracking-wide text-sm">{currentCompany.subtitle}</p>
          </div>

          {/* Pad Body */}
          <div className="relative flex-1 min-h-[150mm]">
            <textarea
              className="w-full h-full min-h-[150mm] resize-none outline-none text-gray-800 leading-relaxed font-serif text-justify bg-transparent"
              placeholder="এখানে আপনার কন্টেন্ট লিখুন..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{
                lineHeight: '2',
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #f3f4f6 31px, #f3f4f6 32px)',
                backgroundAttachment: 'local'
              }}
            />
          </div>

          {/* Pad Footer */}
          <div className="absolute bottom-[10mm] left-[20mm] right-[20mm] text-center border-t border-gray-200 pt-4 print:bottom-0 print:left-0 print:right-0">
            <p className="text-xs text-gray-500 font-medium">{currentCompany.address}</p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
