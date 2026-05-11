// src/config.ts

// PHP API এর মূল URL দিন।
// ডেভেলপমেন্ট: 'http://localhost:8000/api' (PHP built-in server)
// প্রোডাকশন: 'https://yourdomain.com/backend/api' (cPanel/Shared Hosting)
// লোকাল XAMPP: 'http://localhost/studio-pro-crm/backend/api'
export const API_BASE_URL = 'https://new.socialads.expert/backend/api';

// যদি true থাকে, তাহলে API কল ফেইল করলে লোকাল স্টোরেজ/মক ডাটা ব্যবহার করবে।
// প্রোডাকশনে যাওয়ার সময় এবং PHP ব্যাকএন্ড রেডি হলে এটি false করে দিতে পারেন।
export const USE_MOCK_FALLBACK = false;
