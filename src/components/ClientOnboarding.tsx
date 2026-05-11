import React, { useState } from 'react';
import { Copy, CheckCircle2, Link, ExternalLink } from 'lucide-react';

export default function ClientOnboarding() {
  const [copied, setCopied] = useState(false);
  const onboardingUrl = `${window.location.origin}/?onboarding=true`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(onboardingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">ক্লাইন্ট অনবোর্ডিং</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center max-w-2xl mx-auto mt-10">
        <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Link size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">আপনার ক্লায়েন্ট অনবোর্ডিং লিংক</h2>
        <p className="text-gray-500 mb-8">
          এই লিংকটি আপনার ক্লায়েন্টদের পাঠালে তারা একটি ফর্ম পাবে, যেখানে তারা তাদের ব্যবসার তথ্য এবং কোন সার্ভিসটি নিতে আগ্রহী (মার্কেটিং, ওয়েবসাইট, ভিডিও কনটেন্ট, অটোমেশন, কোর্স অথবা বিজনেস কনসালটেন্সি) সেটি নির্বাচন করে বিস্তারিত সব তথ্য দিতে পারবে।
        </p>

        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 p-3 rounded-xl">
          <span className="text-gray-700 font-medium truncate px-4">{onboardingUrl}</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors shrink-0"
            >
              {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
              <span>{copied ? 'কপি হয়েছে' : 'কপি করুন'}</span>
            </button>
            <a
              href={onboardingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-gray-200 text-gray-700 w-10 h-10 rounded-lg hover:bg-gray-300 transition-colors shrink-0"
              title="নতুন ট্যাবে খুলুন"
            >
              <ExternalLink size={18} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
