'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { verifyPayment } from '@/lib/payment';
import { completePayment } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';

function PaymentFailureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const orderId = searchParams.get('order_id');
  const error = searchParams.get('error');
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [actuallySuccessful, setActuallySuccessful] = useState(false);

  // Check if payment was actually successful
  useEffect(() => {
    if (orderId && !error) {
      checkPaymentStatus();
    }
  }, [orderId]);

  const checkPaymentStatus = async () => {
    if (!orderId) return;
    
    setIsVerifying(true);
    try {
      const verification = await verifyPayment(orderId);
      console.log('Payment verification on failure page:', verification);
      
      // Check multiple possible success indicators
      const isPaymentSuccessful = verification.success && (
        verification.order_status === 'PAID' ||
        verification.payment_status === 'SUCCESS' ||
        (verification.order_data && verification.order_data.order_status === 'PAID')
      );
      
      console.log('Failure page payment check:', {
        verificationSuccess: verification.success,
        orderStatus: verification.order_status,
        paymentStatus: verification.payment_status,
        orderDataStatus: verification.order_data?.order_status,
        isPaymentSuccessful
      });

      if (isPaymentSuccessful) {
        console.log('Payment was actually successful, completing and redirecting...');
        // Payment was actually successful, complete it and redirect
        await completePayment(orderId, verification.order_data || verification, user?.uid);
        setActuallySuccessful(true);
        
        // Redirect to success page after 2 seconds
        setTimeout(() => {
          router.push(`/payment-success?order_id=${orderId}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  // Show verification loading state
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="pt-32 pb-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Verifying Payment Status...</h1>
            <p className="text-gray-600">Please wait while we check your payment status.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show success message if payment was actually successful
  if (actuallySuccessful) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="pt-32 pb-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
            <p className="text-gray-600 text-lg mb-6">
              Your payment was processed successfully. Redirecting you to the success page...
            </p>
            <div className="animate-pulse text-blue-600">Redirecting in 2 seconds...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-32 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Failure Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Failed</h1>
            <p className="text-gray-600 text-lg">
              Unfortunately, your payment could not be processed.
            </p>
          </div>

          {/* Error Details */}
          {(orderId || error) && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
              <h2 className="text-lg font-semibold text-red-900 mb-4">Error Details</h2>
              <div className="space-y-3">
                {orderId && (
                  <div className="flex justify-between">
                    <span className="text-red-700">Order ID:</span>
                    <span className="font-medium text-red-900">{orderId}</span>
                  </div>
                )}
                {error && (
                  <div>
                    <span className="text-red-700 block mb-1">Error Message:</span>
                    <span className="font-medium text-red-900 text-sm">
                      {decodeURIComponent(error)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-red-700">Time:</span>
                  <span className="font-medium text-red-900">
                    {new Date().toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Common Reasons */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-yellow-900 mb-3">Common Reasons for Payment Failure</h3>
            <ul className="space-y-2 text-yellow-800">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Insufficient balance in your account
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Incorrect card details or expired card
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Transaction declined by your bank
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Network connectivity issues
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Daily transaction limit exceeded
              </li>
            </ul>
          </div>

          {/* What to do next */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">What to do next?</h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Check your account balance and card details
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Try using a different payment method
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Contact your bank if the issue persists
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Your cart items are still saved for later
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/cart"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors text-center"
            >
              Try Payment Again
            </Link>
            <Link
              href="/"
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium px-6 py-3 rounded-lg transition-colors text-center"
            >
              Continue Shopping
            </Link>
          </div>

          {/* Support Contact */}
          <div className="text-center mt-8 pt-8 border-t border-gray-200">
            <p className="text-gray-600 mb-4">
              Still having issues? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@pixelmart.com"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                📧 support@pixelmart.com
              </a>
              <a
                href="tel:+911234567890"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                📞 +91 12345 67890
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Loading component for Suspense fallback
function PaymentFailureLoading() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-32 pb-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
          <p className="text-gray-600">Please wait while we load the page.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Main component with Suspense boundary
export default function PaymentFailure() {
  return (
    <Suspense fallback={<PaymentFailureLoading />}>
      <PaymentFailureContent />
    </Suspense>
  );
}
