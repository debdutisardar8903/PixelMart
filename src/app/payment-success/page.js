'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ref, get, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from '@/components/contexts/AuthContext';
import { useCart } from '@/components/contexts/CartContext';
import ClientOnly from '@/components/ClientOnly';
import { verifyPayment } from '@/lib/cashfree';
import { DotLottie } from '@lottiefiles/dotlottie-web';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { clearCart } = useCart();
  
  const orderId = searchParams.get('order_id');
  
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState('');
  const [verificationStarted, setVerificationStarted] = useState(false);

  // Initialize Lottie animation for verifying state
  useEffect(() => {
    let dotLottie = null;
    
    if (isVerifying) {
      const canvas = document.querySelector('#dotlottie-canvas');
      if (canvas) {
        dotLottie = new DotLottie({
          autoplay: true,
          loop: true,
          canvas: canvas,
          src: "https://lottie.host/f5bc15ac-ac71-44a1-a5dd-a8fead4638bd/rI3n3PWSzL.lottie",
        });
      }
    }

    return () => {
      if (dotLottie) {
        dotLottie.destroy();
      }
    };
  }, [isVerifying]);

  useEffect(() => {
    const verifyAndUpdateOrder = async () => {
      if (!orderId) {
        setError('No order ID provided');
        setIsVerifying(false);
        return;
      }

      // Prevent multiple verification attempts
      if (verificationStarted) {
        console.log('Verification already in progress, skipping...');
        return;
      }

      setVerificationStarted(true);

      try {
        console.log('Verifying payment for order:', orderId);
        
        // Start timer for minimum animation display time (20 seconds)
        const startTime = Date.now();
        const minDisplayTime = 20000; // 20 seconds
        
        // Verify payment with Cashfree
        const verification = await verifyPayment(orderId);
        
        if (verification.success && verification.payment_status === 'SUCCESS') {
          console.log('Payment verified successfully:', verification);
          
          // Fetch order from database
          const orderRef = ref(database, `orders/${orderId}`);
          const orderSnapshot = await get(orderRef);
          
          if (orderSnapshot.exists()) {
            const order = orderSnapshot.val();
            
            // Fetch product details with downloadUrl
            const updatedProducts = await Promise.all(
              order.products.map(async (product) => {
                try {
                  const productRef = ref(database, `products/${product.id}`);
                  const productSnapshot = await get(productRef);
                  
                  if (productSnapshot.exists()) {
                    const productData = productSnapshot.val();
                    return {
                      ...product,
                      downloadUrl: productData.downloadUrl || null
                    };
                  }
                  return product;
                } catch (error) {
                  console.error(`Error fetching product ${product.id}:`, error);
                  return product;
                }
              })
            );
            
            // Update order status to SUCCESS and add product download URLs
            const updateData = {
              paymentStatus: 'SUCCESS',
              paymentVerifiedAt: Date.now(),
              products: updatedProducts
            };
            
            await update(orderRef, updateData);
            
            setOrderData({
              ...order,
              products: updatedProducts,
              paymentStatus: 'SUCCESS'
            });
            setPaymentVerified(true);
            
            // Clear cart if payment successful
            clearCart();
            
          } else {
            setError('Order not found in database');
          }
        } else {
          setError(verification.error || 'Payment verification failed');
          
          // Update order status to FAILED
          if (orderId) {
            const orderRef = ref(database, `orders/${orderId}`);
            await update(orderRef, {
              paymentStatus: 'FAILED',
              paymentFailedAt: Date.now(),
              failureReason: verification.error || 'Payment verification failed'
            });
          }
        }
        
        // Ensure minimum animation display time
        const elapsedTime = Date.now() - startTime;
        const remainingTime = minDisplayTime - elapsedTime;
        
        if (remainingTime > 0) {
          // Wait for remaining time to complete 20 seconds
          await new Promise(resolve => setTimeout(resolve, remainingTime));
        }
        
      } catch (error) {
        console.error('Error verifying payment:', error);
        setError('Failed to verify payment. Please contact support.');
        
        // Ensure minimum animation display time even on error
        const elapsedTime = Date.now() - startTime;
        const remainingTime = minDisplayTime - elapsedTime;
        
        if (remainingTime > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingTime));
        }
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAndUpdateOrder();
  }, [orderId]); // Removed clearCart from dependencies to prevent re-runs

  if (isVerifying) {
    return (
      <div className="font-sans min-h-screen bg-white flex flex-col">
        <div className="flex-1 pt-24 sm:pt-6 px-4">
          <div className="mx-auto max-w-4xl">
            <div className="text-center py-12 sm:py-16">
              <canvas id="dotlottie-canvas" style={{width: '300px', height: '300px'}} className="mx-auto mb-6"></canvas>
              
              {/* Animated Text */}
              <div className="mb-2">
                <h1 className="text-4xl font-bold mb-2 overflow-hidden">
                  <span 
                    className="inline-block animate-slide-right-reveal"
                    style={{
                      background: 'linear-gradient(45deg, #567A88, #93AE71, #D7DC6D)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      animationDelay: '0s'
                    }}
                  >
                    Verifying
                  </span>
                  <span className="mx-2"></span>
                  <span 
                    className="inline-block animate-drop-down"
                    style={{
                      background: 'linear-gradient(45deg, #567A88, #93AE71, #D7DC6D)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      animationDelay: '1s'
                    }}
                  >
                    Pay
                  </span>
                  <span 
                    className="inline-block animate-drop-down"
                    style={{
                      background: 'linear-gradient(45deg, #567A88, #93AE71, #D7DC6D)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      animationDelay: '1.5s'
                    }}
                  >
                    ment
                  </span>
                </h1>
              </div>
              
              <div className="text-lg overflow-hidden">
                <span 
                  className="inline-block animate-slow-drop-down"
                  style={{
                    background: 'linear-gradient(45deg, #567A88, #93AE71, #DFE26D)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animationDelay: '2s'
                  }}
                >
                  Please wait while we confirm your payment...
                </span>
              </div>
              
              {/* CSS Animations */}
              <style jsx>{`
                @keyframes slideRightReveal {
                  0% {
                    opacity: 0;
                    transform: translateX(-100px);
                    clip-path: inset(0 100% 0 0);
                  }
                  50% {
                    opacity: 0.7;
                    transform: translateX(-20px);
                    clip-path: inset(0 50% 0 0);
                  }
                  100% {
                    opacity: 1;
                    transform: translateX(0);
                    clip-path: inset(0 0% 0 0);
                  }
                }
                
                @keyframes dropDown {
                  0% {
                    opacity: 0;
                    transform: translateY(-30px);
                  }
                  50% {
                    opacity: 0.5;
                    transform: translateY(10px);
                  }
                  100% {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
                
                @keyframes dropDownText {
                  0% {
                    opacity: 0;
                    transform: translateY(-25px);
                  }
                  60% {
                    opacity: 0.6;
                    transform: translateY(8px);
                  }
                  100% {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
                
                @keyframes slowDropDown {
                  0% {
                    opacity: 0;
                    transform: translateY(-40px);
                  }
                  30% {
                    opacity: 0.3;
                    transform: translateY(-20px);
                  }
                  70% {
                    opacity: 0.7;
                    transform: translateY(5px);
                  }
                  100% {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
                
                .animate-slide-right-reveal {
                  animation: slideRightReveal 1.2s ease-out forwards;
                  opacity: 0;
                  background-size: 200% 100%;
                  background-position: -100% 0;
                  animation-fill-mode: forwards;
                }
                
                .animate-drop-down {
                  animation: dropDown 1.2s ease-out forwards;
                  opacity: 0;
                  background-size: 200% 100%;
                  background-position: -100% 0;
                  animation-fill-mode: forwards;
                }
                
                /* Gradient animation for all text */
                @keyframes gradientShift {
                  0% { background-position: -100% 0; }
                  100% { background-position: 100% 0; }
                }
                
                .animate-slide-right-reveal,
                .animate-drop-down {
                  animation-name: slideRightReveal, gradientShift;
                  animation-duration: 1.2s, 3s;
                  animation-timing-function: ease-out, ease-in-out;
                  animation-iteration-count: 1, infinite;
                  animation-fill-mode: forwards, none;
                }
                
                .animate-drop-down {
                  animation-name: dropDown, gradientShift;
                }
                
                .animate-drop-down-text {
                  animation: dropDownText 1.5s ease-out forwards, gradientShift 3s ease-in-out infinite;
                  opacity: 0;
                  background-size: 200% 100%;
                  background-position: -100% 0;
                  animation-fill-mode: forwards, none;
                }
                
                .animate-slow-drop-down {
                  animation: slowDropDown 2s ease-out forwards, gradientShift 3s ease-in-out infinite;
                  opacity: 0;
                  background-size: 200% 100%;
                  background-position: -100% 0;
                  animation-fill-mode: forwards, none;
                }
              `}</style>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !paymentVerified) {
    return (
      <div className="font-sans min-h-screen bg-white flex flex-col">
        <div className="flex-1 pt-6 px-4">
          <div className="mx-auto max-w-4xl">
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Verification Failed</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              
              <div className="space-y-4">
                <Link 
                  href="/checkout"
                  className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Try Again
                </Link>
                <div>
                  <Link 
                    href="/"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Return to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans min-h-screen bg-white flex flex-col">
      
      <div className="flex-1 pt-6 px-4">
        <div className="mx-auto max-w-4xl">
          <ClientOnly>
            {/* Success Header */}
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
              <p className="text-gray-600 mb-2">Thank you for your purchase</p>
              <p className="text-sm text-gray-500">Order ID: {orderId}</p>
            </div>

            {orderData && (
              <>
                {/* Order Summary */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                  
                  <div className="space-y-4">
                    {orderData.products.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 border border-gray-100 rounded-lg">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{item.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm font-bold text-gray-900">₹{item.price}</span>
                            <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                          </div>
                        </div>
                        
                        {item.downloadUrl && (
                          <div className="flex-shrink-0">
                            <a
                              href={item.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                            >
                              Download
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total Paid</span>
                      <span className="text-lg font-bold text-gray-900">₹{orderData.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <p className="text-gray-900">{orderData.customerInfo.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <p className="text-gray-900">{orderData.customerInfo.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <p className="text-gray-900">{orderData.customerInfo.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                      <p className="text-gray-900">{new Date(orderData.paymentDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Download Instructions */}
                {orderData.products.some(item => item.downloadUrl) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-semibold text-blue-900 mb-2">Download Your Products</h2>
                    <p className="text-blue-800 text-sm mb-3">
                      Your digital products are ready for download. Click the "Download" button next to each product.
                    </p>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>• Download links are valid for 30 days</li>
                      <li>• You can re-download from your account anytime</li>
                      <li>• Contact support if you face any issues</li>
                    </ul>
                  </div>
                )}
              </>
            )}

            {/* Action Buttons */}
            <div className="text-center space-y-4 py-8">
              <div className="space-x-4">
                <Link 
                  href="/orders"
                  className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  View Orders
                </Link>
                <Link 
                  href="/"
                  className="inline-block border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
              
              <p className="text-sm text-gray-500">
                Need help? <Link href="/contact" className="text-blue-600 hover:text-blue-800">Contact Support</Link>
              </p>
            </div>
          </ClientOnly>
        </div>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function PaymentSuccessLoading() {
  return (
    <div className="font-sans min-h-screen bg-white flex flex-col">
      <div className="flex-1 pt-6 sm:pt-24 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Processing payment...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main export component with Suspense boundary
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentSuccessLoading />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
