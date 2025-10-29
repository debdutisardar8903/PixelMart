'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ref, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import BottomNav from '@/components/bottomnav/BottomNav';
import ClientOnly from '@/components/ClientOnly';

function PaymentFailureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const orderId = searchParams.get('order_id');
  const error = searchParams.get('error');
  
  const [isUpdating, setIsUpdating] = useState(true);

  useEffect(() => {
    const updateOrderStatus = async () => {
      if (orderId) {
        try {
          console.log('Updating order status to FAILED for:', orderId);
          
          const orderRef = ref(database, `orders/${orderId}`);
          await update(orderRef, {
            paymentStatus: 'FAILED',
            paymentFailedAt: Date.now(),
            failureReason: error || 'Payment cancelled or failed'
          });
          
          console.log('Order status updated to FAILED');
        } catch (updateError) {
          console.error('Error updating order status:', updateError);
        }
      }
      setIsUpdating(false);
    };

    updateOrderStatus();
  }, [orderId, error]);

  const getErrorMessage = () => {
    if (error) {
      try {
        const decodedError = decodeURIComponent(error);
        return decodedError;
      } catch (e) {
        return error;
      }
    }
    return 'Payment was cancelled or failed. Please try again.';
  };

  const handleRetryPayment = () => {
    if (orderId) {
      // Redirect back to checkout with the same order
      router.push('/checkout');
    } else {
      router.push('/cart');
    }
  };

  if (isUpdating) {
    return (
      <div className="font-sans min-h-screen bg-white flex flex-col">
        <div className="hidden sm:block">
          <Header />
        </div>
        
        <div className="flex-1 pt-6 sm:pt-24 px-4">
          <div className="mx-auto max-w-4xl">
            <div className="text-center py-16">
              <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing...</h1>
              <p className="text-gray-600">Please wait a moment...</p>
            </div>
          </div>
        </div>
        
        <Footer />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="font-sans min-h-screen bg-white flex flex-col">
      <div className="hidden sm:block">
        <Header />
      </div>
      
      <div className="flex-1 pt-6 sm:pt-24 px-4">
        <div className="mx-auto max-w-4xl">
          <ClientOnly>
            {/* Failure Header */}
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
              <p className="text-gray-600 mb-2">Unfortunately, your payment could not be processed</p>
              {orderId && (
                <p className="text-sm text-gray-500">Order ID: {orderId}</p>
              )}
            </div>

            {/* Error Details */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-red-900 mb-2">What happened?</h2>
              <p className="text-red-800 mb-4">{getErrorMessage()}</p>
              
              <div className="text-red-800 text-sm">
                <p className="font-medium mb-2">Common reasons for payment failure:</p>
                <ul className="space-y-1 ml-4">
                  <li>• Insufficient funds in your account</li>
                  <li>• Incorrect card details or expired card</li>
                  <li>• Network connectivity issues</li>
                  <li>• Bank declined the transaction</li>
                  <li>• Payment was cancelled by user</li>
                </ul>
              </div>
            </div>

            {/* What to do next */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">What can you do?</h2>
              <div className="text-blue-800 text-sm space-y-2">
                <p>• <strong>Check your payment details:</strong> Ensure your card details are correct and up to date</p>
                <p>• <strong>Try a different payment method:</strong> Use another card or payment option</p>
                <p>• <strong>Contact your bank:</strong> Your bank might have blocked the transaction for security</p>
                <p>• <strong>Try again later:</strong> There might be a temporary issue with the payment gateway</p>
              </div>
            </div>

            {/* Order Information */}
            {orderId && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Order Information</h2>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Order ID:</strong> {orderId}</p>
                  <p><strong>Status:</strong> <span className="text-red-600 font-medium">Payment Failed</span></p>
                  <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
                </div>
                
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    <strong>Note:</strong> Your order has been saved. You can retry the payment or contact support for assistance.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="text-center space-y-4 py-8">
              <div className="space-y-3">
                <button
                  onClick={handleRetryPayment}
                  className="w-full sm:w-auto bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  Retry Payment
                </button>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link 
                    href="/cart"
                    className="inline-block border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    View Cart
                  </Link>
                  <Link 
                    href="/"
                    className="inline-block border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-2">
                  Need help with your payment?
                </p>
                <div className="space-x-4">
                  <Link 
                    href="/contact" 
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Contact Support
                  </Link>
                  <Link 
                    href="/faq" 
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Payment FAQ
                  </Link>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-sm text-gray-600 font-medium">Your data is secure</span>
              </div>
              <p className="text-xs text-gray-500">
                No payment was charged to your account. All transactions are secured with SSL encryption.
              </p>
            </div>
          </ClientOnly>
        </div>
      </div>

      <Footer />
      <BottomNav />
    </div>
  );
}

// Loading component for Suspense fallback
function PaymentFailureLoading() {
  return (
    <div className="font-sans min-h-screen bg-white flex flex-col">
      <div className="hidden sm:block">
        <Header />
      </div>
      <div className="flex-1 pt-6 sm:pt-24 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payment status...</p>
          </div>
        </div>
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
}

// Main export component with Suspense boundary
export default function PaymentFailurePage() {
  return (
    <Suspense fallback={<PaymentFailureLoading />}>
      <PaymentFailureContent />
    </Suspense>
  );
}
