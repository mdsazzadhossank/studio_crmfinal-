import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const deployDir = path.join(__dirname, 'deploy_to_hosting');

console.log('🚀 Starting deployment build for cPanel...\n');

try {
  // ১. Vite Build করা
  console.log('📦 Building React Frontend...');
  execSync('npx vite build', { stdio: 'inherit' });

  // ২. পুরনো deploy ফোল্ডার ডিলিট করে নতুন তৈরি করা
  console.log('\n🧹 Preparing deploy folder...');
  if (fs.existsSync(deployDir)) {
    fs.rmSync(deployDir, { recursive: true, force: true });
  }
  fs.mkdirSync(deployDir);

  // ৩. Frontend (dist) ফাইল কপি করা
  console.log('📂 Copying Frontend files...');
  fs.cpSync(path.join(__dirname, 'dist'), deployDir, { recursive: true });

  // ৪. Backend ফাইল কপি করা
  console.log('⚙️ Copying Backend PHP files...');
  fs.cpSync(path.join(__dirname, 'backend'), path.join(deployDir, 'backend'), { recursive: true });

  console.log('\n✅ ===========================================');
  console.log('🎉 BUILD SUCCESSFUL! 🎉');
  console.log('=============================================');
  console.log('আপনার cPanel এ আপলোড করার জন্য ফোল্ডার রেডি!');
  console.log(`ফোল্ডার লোকেশন: ${deployDir}`);
  console.log('\nএই "deploy_to_hosting" ফোল্ডারের *ভেতরের* সব ফাইল এবং ফোল্ডার জিপ (zip) করে আপনার cPanel এর public_html এ আপলোড করুন।');
  console.log('=============================================\n');

} catch (error) {
  console.error('❌ Error during build:', error);
  process.exit(1);
}
