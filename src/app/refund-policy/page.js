'use client';

import { useRouter } from 'next/navigation';

export default function RefundPolicyPage() {
  const router = useRouter();

  return (
    <div className="font-sans min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Refund Policy
          </h1>
          <p className="text-lg text-gray-600">
            At Wallineex, customer satisfaction is important to us. We strive to provide high-quality digital products and design tools. Please read our refund policy carefully before making a purchase.
          </p>
        </div>

        {/* Refund Policy Content */}
        <div className="prose prose-lg max-w-none">
          
          {/* Eligibility for Refunds */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Eligibility for Refunds</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">Important Notice</h3>
                  <p className="text-yellow-800">
                    Only non-working or non-functional digital goods are eligible for a refund.
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 mb-4">
              Once a digital product has been delivered and activated, refunds are not available unless:
            </p>
            
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>The product does not function as described, and</li>
              <li>Our customer support team is unable to resolve the issue after verification.</li>
            </ul>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-green-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-green-900 mb-2">Refund Guarantee</h3>
                  <p className="text-green-800">
                    In such rare cases, a full refund will be processed.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Refund Processing Time */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Refund Processing Time</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Processing Timeline</h3>
                  <p className="text-blue-800">
                    Once your refund is approved, please allow <strong>3–5 business days</strong> for the refund to reflect in your original payment method.
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-gray-700">
              If more than 5 business days have passed and you still haven't received your refund, please contact us at{' '}
              <a href="mailto:admin@wallineex.store" className="text-blue-600 hover:text-blue-800 font-medium">
                admin@wallineex.store
              </a>{' '}
              for assistance.
            </p>
          </section>

          {/* Need Help */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Need Help?</h2>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-gray-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Support</h3>
                  <p className="text-gray-700 mb-3">
                    If you have any questions or concerns regarding refunds, please reach out to us at:
                  </p>
                  <p className="text-gray-700">
                    📧 <a href="mailto:admin@wallineex.store" className="text-blue-600 hover:text-blue-800 font-medium">
                      admin@wallineex.store
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Footer Info */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Policy Information</h3>
            <div className="space-y-2 text-gray-700">
              <p><strong>Last Updated:</strong> October 2025</p>
              <p><strong>Website:</strong> <a href="https://wallineex.store" className="text-blue-600 hover:text-blue-800">https://wallineex.store</a></p>
              <p><strong>Company Name:</strong> Wallineex</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
