'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ref, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from '@/components/contexts/AuthContext';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import BottomNav from '@/components/bottomnav/BottomNav';
import ClientOnly from '@/components/ClientOnly';

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch specific order from database
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        // Only fetch order if user is authenticated (as per database rules)
        if (!user) {
          setError('Authentication required');
          setIsLoading(false);
          return;
        }

        if (!params.id) {
          setError('Order ID not provided');
          setIsLoading(false);
          return;
        }

        console.log('Fetching order details for:', params.id);
        
        // Fetch specific order from database
        const orderRef = ref(database, `orders/${params.id}`);
        const snapshot = await get(orderRef);
        
        if (snapshot.exists()) {
          const orderData = snapshot.val();
          
          // Verify that this order belongs to the current user
          if (orderData.userId !== user.uid) {
            setError('Unauthorized access to this order');
            setOrder(null);
          } else {
            const orderWithId = {
              id: params.id,
              ...orderData
            };
            setOrder(orderWithId);
            console.log('Order details fetched:', orderWithId);
          }
        } else {
          console.log('Order not found in database');
          setError('Order not found');
          setOrder(null);
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError('Failed to load order details');
        setOrder(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Don't fetch if auth is still loading
    if (!authLoading) {
      fetchOrder();
    }
  }, [user, authLoading, params.id]);

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get status color and text
  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'paid':
        return {
          color: 'bg-green-100 text-green-800',
          text: 'Completed',
          icon: '✓'
        };
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          text: 'Pending',
          icon: '⏳'
        };
      case 'failed':
        return {
          color: 'bg-red-100 text-red-800',
          text: 'Failed',
          icon: '✗'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          text: status || 'Unknown',
          icon: '?'
        };
    }
  };

  // Handle download using secure API
  const handleDownload = async (product) => {
    if (!product.downloadUrl) {
      alert('Download not available for this product');
      return;
    }

    try {
      console.log('Initiating download for product:', product.id);
      
      // Get user's Firebase ID token
      const idToken = await user.getIdToken();
      
      // Call the secure download API
      const response = await fetch(`/api/download?productId=${product.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Download URL generated successfully');
        // Open the signed URL for download
        window.open(data.downloadUrl, '_blank');
      } else {
        console.error('Download API error:', data.error);
        alert(`Download failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error downloading product:', error);
      alert('Failed to download product. Please try again.');
    }
  };

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="font-sans min-h-screen bg-white flex flex-col">
        <div className="hidden sm:block">
          <Header />
        </div>
        <div className="flex-1 pt-6 sm:pt-24 px-4">
          <div className="mx-auto max-w-4xl">
            <div className="text-center py-16">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading order details...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !order) {
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
                onClick={() => router.push('/orders')}
                className="flex items-center justify-center w-12 h-12 bg-gray-50 border-2 border-gray-300 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>

            <div className="text-center py-16">
              <div className="mb-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  {error === 'Authentication required' ? 'Login Required' : 'Order Not Found'}
                </h2>
                <p className="text-gray-600 mb-6">
                  {error === 'Authentication required' 
                    ? 'Please login to view order details'
                    : error || 'The order you\'re looking for doesn\'t exist or you don\'t have access to it.'
                  }
                </p>
                <div className="flex flex-row gap-4 justify-center">
                  {error === 'Authentication required' ? (
                    <>
                      <Link
                        href="/auth?redirect=/orders"
                        className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                      >
                        Login
                      </Link>
                      <Link
                        href="/auth/signup?redirect=/orders"
                        className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium"
                      >
                        Sign up
                      </Link>
                    </>
                  ) : (
                    <button
                      onClick={() => router.push('/orders')}
                      className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium"
                    >
                      Back to Orders
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.paymentStatus);

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
              onClick={() => router.push('/orders')}
              className="flex items-center justify-center w-12 h-12 bg-gray-50 border-2 border-gray-300 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Breadcrumb */}
          <nav className="mb-6 hidden sm:block">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
              <li>
                <Link href="/profile" className="hover:text-gray-900">
                  Profile
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/orders" className="hover:text-gray-900">
                  Orders
                </Link>
              </li>
              <li>/</li>
              <li>
                <span className="text-gray-900 font-medium">Order Details</span>
              </li>
            </ol>
          </nav>

          {/* Page Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Order Details</h1>
                <p className="text-sm text-gray-600">
                  Order #{order.orderId || order.id}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${statusInfo.color}`}>
                  <span className="mr-1">{statusInfo.icon}</span>
                  {statusInfo.text}
                </span>
                {order.paymentStatus?.toLowerCase() === 'success' && (
                  <Link
                    href={`/orders/${order.id}/invoice`}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium"
                    target="_blank"
                  >
                    Download Invoice
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Order Details Content */}
          <ClientOnly>
            <div className="space-y-6 pb-8">
              {/* Order Info */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Order Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <span className="block text-sm text-gray-600 mb-1">Order ID</span>
                        <span className="font-medium text-gray-900">{order.orderId || order.id}</span>
                      </div>
                      <div>
                        <span className="block text-sm text-gray-600 mb-1">Date</span>
                        <span className="font-medium text-gray-900">{formatDate(order.paymentDate)}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="block text-sm text-gray-600 mb-1">Status</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          <span className="mr-1">{statusInfo.icon}</span>
                          {statusInfo.text}
                        </span>
                      </div>
                      <div>
                        <span className="block text-sm text-gray-600 mb-1">Total Amount</span>
                        <span className="font-bold text-lg text-gray-900">₹{order.totalAmount?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              {order.customerInfo && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Customer Information</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                          <span className="block text-sm text-gray-600 mb-1">Name</span>
                          <span className="font-medium text-gray-900">{order.customerInfo.name}</span>
                        </div>
                        <div>
                          <span className="block text-sm text-gray-600 mb-1">Email</span>
                          <span className="font-medium text-gray-900">{order.customerInfo.email}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <span className="block text-sm text-gray-600 mb-1">Phone</span>
                          <span className="font-medium text-gray-900">{order.customerInfo.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Products */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Products ({order.products?.length || 0})</h3>
                <div className="space-y-4">
                  {order.products?.map((product, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={product.image || '/placeholder-product.jpg'}
                          alt={product.name || 'Product'}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                        <p className="text-sm text-gray-600">
                          Quantity: {product.quantity || 1} • ₹{product.price}
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          Subtotal: ₹{((product.price || 0) * (product.quantity || 1)).toLocaleString()}
                        </p>
                      </div>
                      {order.paymentStatus?.toLowerCase() === 'success' && product.downloadUrl && (
                        <button
                          onClick={() => handleDownload(product)}
                          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                        >
                          Download
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Coupon Info */}
              {order.couponUsed && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Coupon Applied</h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex justify-between">
                        <span className="text-green-800">Coupon Code:</span>
                        <span className="font-medium text-green-800">{order.couponUsed.code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-800">Discount:</span>
                        <span className="font-medium text-green-800">-₹{order.couponUsed.discount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </ClientOnly>
        </div>
      </div>

      {/* Footer - Always at bottom */}
      <Footer />
      
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
