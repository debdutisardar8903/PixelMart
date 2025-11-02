'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import BottomNav from '@/components/bottomnav/BottomNav';
import { useAuth } from '@/components/contexts/AuthContext';

export default function FAQPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  // FAQ data
  const faqData = [
    {
      id: 'faq-1',
      question: '🛍️ 1. What type of products does Wallineex sell?',
      answer: 'Wallineex offers digital products that are delivered online — such as downloadable files, templates, digital assets, or software. No physical items are shipped.'
    },
    {
      id: 'faq-2',
      question: '⚡ 2. How will I receive my purchased product?',
      answer: (
        <div>
          <p className="mb-2">Once your payment is successfully processed, your digital product will be delivered instantly through:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>A download link displayed on your screen, and/or</li>
            <li>A confirmation email containing your access details.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'faq-3',
      question: '⏱️ 3. How long does delivery take?',
      answer: (
        <ul className="list-disc pl-6 space-y-1">
          <li>Most orders are processed instantly after payment.</li>
          <li>In rare cases (due to network or payment gateway delays), delivery may take up to 1–2 hours.</li>
        </ul>
      )
    },
    {
      id: 'faq-4',
      question: '📧 4. I didn\'t receive my download link or product access. What should I do?',
      answer: (
        <ul className="list-disc pl-6 space-y-1">
          <li>Please check your spam/junk folder first.</li>
          <li>If you still haven't received it within 1–2 hours, contact our support team at <a href="mailto:support@wallineex.store" className="text-blue-600 underline hover:text-blue-800">support@wallineex.store</a> with your order number — we'll resend your product immediately.</li>
        </ul>
      )
    },
    {
      id: 'faq-5',
      question: '💰 5. Can I get a refund after purchase?',
      answer: (
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>No.</strong> Since all Wallineex products are digital downloads, once delivered, they cannot be refunded, replaced, or canceled.</li>
          <li>All sales are final as stated in our Refund Policy.</li>
        </ul>
      )
    },
    {
      id: 'faq-6',
      question: '🧾 6. Can I cancel my order after paying?',
      answer: (
        <ul className="list-disc pl-6 space-y-1">
          <li>Unfortunately, no cancellations are allowed once the payment is completed because delivery happens automatically.</li>
          <li>Please verify your product details before making any purchase.</li>
        </ul>
      )
    },
    {
      id: 'faq-7',
      question: '🔁 7. What if I was charged twice for the same order?',
      answer: (
        <ul className="list-disc pl-6 space-y-1">
          <li>If you notice a duplicate payment, contact <a href="mailto:support@wallineex.store" className="text-blue-600 underline hover:text-blue-800">support@wallineex.store</a> within 24 hours of purchase.</li>
          <li>After verification, we'll issue a refund for the duplicate charge only.</li>
        </ul>
      )
    },
    {
      id: 'faq-8',
      question: '🔒 8. Is my personal and payment information safe?',
      answer: (
        <ul className="list-disc pl-6 space-y-1">
          <li>Absolutely. We use secure, encrypted payment gateways and never store your full payment details.</li>
          <li>Your privacy and data protection are our top priorities — see our Privacy Policy for more info.</li>
        </ul>
      )
    },
    {
      id: 'faq-9',
      question: '🧠 9. Can I share or resell Wallineex products?',
      answer: (
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>No.</strong> All digital items are licensed for personal use only.</li>
          <li>Reselling, redistributing, or sharing our products without written permission is strictly prohibited.</li>
        </ul>
      )
    },
    {
      id: 'faq-10',
      question: '📩 10. How can I contact Wallineex support?',
      answer: (
        <div>
          <p className="mb-2">You can reach our team anytime via email:</p>
          <p className="mb-2">📧 <a href="mailto:support@wallineex.store" className="text-blue-600 underline hover:text-blue-800 font-medium">support@wallineex.store</a></p>
          <p>We aim to respond to all inquiries within 24 hours.</p>
        </div>
      )
    }
  ];

  const handleFAQToggle = (faqId) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

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

          {/* FAQ Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold mb-6">💬 Frequently Asked Questions (FAQ)</h2>
            
            <div className="space-y-6 text-gray-700">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="text-sm text-indigo-800"><strong>Effective Date:</strong> November 1, 2025</p>
                <p className="text-sm text-indigo-800"><strong>Website:</strong> <a href="https://wallineex.store" className="underline hover:text-indigo-900">https://wallineex.store</a></p>
              </div>
              
              <div className="text-center py-4">
                <p className="text-lg text-gray-800 font-medium">Welcome to the Wallineex FAQ section.</p>
              </div>
              
              <p className="text-gray-700 leading-relaxed">
                Below you'll find answers to the most common questions about our digital products, orders, delivery, and policies.
              </p>
              
              <div className="space-y-4">
                {faqData.map((faq) => (
                  <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button 
                      onClick={() => handleFAQToggle(faq.id)}
                      className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between"
                    >
                      <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                      <svg 
                        className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${
                          expandedFAQ === faq.id ? 'rotate-180' : ''
                        }`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                    {expandedFAQ === faq.id && (
                      <div className="px-6 py-4 bg-indigo-50/30 border-t border-gray-200">
                        <div className="text-gray-700">
                          {typeof faq.answer === 'string' ? faq.answer : faq.answer}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
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
