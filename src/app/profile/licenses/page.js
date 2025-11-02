'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import BottomNav from '@/components/bottomnav/BottomNav';
import { useAuth } from '@/components/contexts/AuthContext';

export default function LicensesPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="font-sans min-h-screen bg-white flex flex-col">
      <div className="hidden sm:block">
        <Header />
      </div>
      
      <div className="flex-1 pt-6 sm:pt-24 px-4">
        <div className="mx-auto max-w-4xl">
          {/* Back Button */}
          <div className="mb-4 sm:hidden">
            <button
              onClick={() => router.push('/profile')}
              className="flex items-center justify-center w-12 h-12 bg-gray-50 border-2 border-gray-300 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Desktop Back Button */}
          <div className="hidden sm:block mb-6">
            <Link
              href="/profile"
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Profile
            </Link>
          </div>

          {/* License Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold mb-6">🪪 Licenses & Digital Product License Agreement</h2>
            
            <div className="space-y-6 text-gray-700">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800"><strong>Effective Date:</strong> November 1, 2025</p>
                <p className="text-sm text-yellow-800"><strong>Website:</strong> <a href="https://wallineex.store" className="underline hover:text-yellow-900">https://wallineex.store</a></p>
              </div>
              
              <div className="text-center py-4">
                <p className="text-lg text-gray-800 font-medium">Welcome to Wallineex — your trusted source for high-quality digital products.</p>
              </div>
              
              <p className="text-gray-700 leading-relaxed">
                This page explains the licensing terms under which our digital products are sold and how they may be used by customers.
              </p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Ownership</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>All digital products, files, templates, graphics, and related materials available on Wallineex are the intellectual property of Wallineex.</li>
                    <li>When you purchase a digital product, you are not buying ownership of the product, but rather a limited-use license to use it under the terms stated below.</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">2. License Type: Personal Use Only</h3>
                  <p className="mb-3">By purchasing or downloading any product from Wallineex, you are granted a non-exclusive, non-transferable, revocable license to use the product for personal use only.</p>
                  
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-green-700 mb-2">✅ You may:</h4>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Use the digital product for your own personal or individual projects.</li>
                      <li>Download and store it on your personal device.</li>
                      <li>Use it as intended (e.g., design, learning, or creative use for personal projects).</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-red-700 mb-2">❌ You may not:</h4>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Resell, share, distribute, or gift the digital file to anyone else.</li>
                      <li>Upload the file to other websites, marketplaces, or social platforms.</li>
                      <li>Modify and claim the product as your own creation.</li>
                      <li>Use the product for any commercial, business, or client-based project without written permission from Wallineex.</li>
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">3. No Resale or Redistribution</h3>
                  <p className="mb-3">All Wallineex products are strictly licensed for personal use.</p>
                  <p className="mb-3">You are not permitted to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Sell, rent, lease, sublicense, or distribute the digital product.</li>
                    <li>Include it in any project or product intended for resale or commercial distribution.</li>
                    <li>Share your purchased files publicly or privately (e.g., via Google Drive, Telegram, or file-sharing platforms).</li>
                  </ul>
                  <p className="mt-3 text-red-600 font-medium">Unauthorized use or distribution of our products may result in legal action under applicable copyright laws.</p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">4. License Duration</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>The license granted is permanent (lifetime) for personal use.</li>
                    <li>Wallineex reserves the right to revoke the license if terms are violated.</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">5. Modifications</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>You may make limited personal edits (such as resizing, renaming, or customizing for private use).</li>
                    <li>However, modified products remain subject to the same "personal use only" restrictions and may not be sold or shared.</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">6. Commercial Use Requests</h3>
                  <p className="mb-3">If you wish to use a product for commercial or business purposes, you must obtain a Commercial License directly from Wallineex by contacting us at:</p>
                  <p className="mb-3">📧 <a href="mailto:support@wallineex.store" className="text-blue-600 underline hover:text-blue-800 font-medium">support@wallineex.store</a></p>
                  <p>We will review your intended use and provide a custom license if approved.</p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">7. Violation of License</h3>
                  <p className="mb-3">Violation of these license terms — including unauthorized resale, sharing, or reproduction — may result in:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Termination of your access to Wallineex products, and/or</li>
                    <li>Legal action for copyright infringement.</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">8. Copyright Notice</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="font-medium text-gray-900">© Wallineex. All Rights Reserved.</p>
                    <p className="text-gray-700 mt-2">All products, logos, files, and media found on <a href="https://wallineex.store" className="text-blue-600 underline hover:text-blue-800">https://wallineex.store</a> are protected by international copyright and digital media laws.</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">📩 Contact Us</h3>
                  <p className="mb-3">If you have questions about usage rights or licensing terms, please contact:</p>
                  <div className="space-y-2">
                    <p><strong>Wallineex</strong></p>
                    <p>🌐 <strong>Website:</strong> <a href="https://wallineex.store" className="text-blue-600 underline hover:text-blue-800">https://wallineex.store</a></p>
                    <p>📧 <strong>Email:</strong> <a href="mailto:support@wallineex.store" className="text-blue-600 underline hover:text-blue-800">support@wallineex.store</a></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Always at bottom */}
      <div className="mt-16">
        <Footer />
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
