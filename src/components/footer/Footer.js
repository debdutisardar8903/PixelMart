'use client';

import { useState } from 'react';
import Link from 'next/link';
import ClientOnly from '../ClientOnly';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleEmailSignup = (e) => {
    e.preventDefault();
    if (email) {
      // Handle email signup logic here
      console.log('Email signup:', email);
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <footer className="hidden sm:block px-4 pb-4">
      {/* Main Footer Content */}
      <div className="max-w-6xl mx-auto bg-gray-900 text-white rounded-2xl px-8 py-6">

        {/* Bottom Footer - Copyright */}
        <div>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © 2025 Wallineex Digital Store. All Rights Reserved.
            </p>
            
            {/* Additional Links */}
            <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-sm">
              <Link href="/help" className="text-gray-400 hover:text-white transition-colors duration-200">
                Contact Us
              </Link>
              <Link href="/profile/privacy?section=refund-policy" className="text-gray-400 hover:text-white transition-colors duration-200">
                Refunds & Cancellations
              </Link>
              <Link href="/profile/privacy?section=privacy-policy" className="text-gray-400 hover:text-white transition-colors duration-200">
                Privacy
              </Link>
              <Link href="/profile/privacy?section=terms-conditions" className="text-gray-400 hover:text-white transition-colors duration-200">
                Terms
              </Link>
              <Link href="/sitemap" className="text-gray-400 hover:text-white transition-colors duration-200">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
