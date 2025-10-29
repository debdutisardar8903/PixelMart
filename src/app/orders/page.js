'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from '@/components/contexts/AuthContext';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import BottomNav from '@/components/bottomnav/BottomNav';
import ClientOnly from '@/components/ClientOnly';

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // Removed selectedOrder and showOrderDetails states - using separate page now

  // Fetch orders from database based on database rules
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        
        // Only fetch orders if user is authenticated (as per database rules)
        if (!user) {
          setOrders([]);
          setIsLoading(false);
          return;
        }

        console.log('Fetching orders for user:', user.uid);
        
        // Fetch all orders and filter by userId (since Firebase rules allow read if auth != null)
        const ordersRef = ref(database, 'orders');
        const snapshot = await get(ordersRef);
        
        if (snapshot.exists()) {
          const ordersData = snapshot.val();
          
          // Filter orders by current user's ID
          const userOrders = Object.keys(ordersData)
            .map(orderId => ({
              id: orderId,
              ...ordersData[orderId]
            }))
            .filter(order => order.userId === user.uid)
            .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)); // Sort by newest first
          
          setOrders(userOrders);
          console.log('User orders fetched:', userOrders);
        } else {
          console.log('No orders found in database');
          setOrders([]);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Don't fetch if auth is still loading
    if (!authLoading) {
      fetchOrders();
    }
  }, [user, authLoading]);

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

  // Handle order details view - navigate to separate page
  const handleViewOrder = (order) => {
    router.push(`/orders/${order.id}`);
  };

  // Handle download (if product has downloadUrl)
  const handleDownload = (product) => {
    if (product.downloadUrl) {
      window.open(product.downloadUrl, '_blank');
    } else {
      alert('Download not available for this product');
    }
  };

  // Calculate total items in order
  const getTotalItems = (products) => {
    return products?.reduce((total, product) => total + (product.quantity || 1), 0) || 0;
  };

  return (
    <div className="font-sans min-h-screen bg-white flex flex-col">
      <div className="hidden sm:block">
        <Header />
      </div>
      
      <div className="flex-1 pt-6 sm:pt-24 px-4">
        <div className="mx-auto max-w-6xl">
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

          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">My Orders</h1>
                <p className="text-sm text-gray-600">
                  {!user 
                    ? 'Login to view your order history'
                    : orders.length > 0 
                      ? `${orders.length} order${orders.length !== 1 ? 's' : ''} found` 
                      : 'No orders found'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Orders Content */}
          <ClientOnly>
            {authLoading || isLoading ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading orders...</p>
              </div>
            ) : !user ? (
              /* Login Required State */
              <div className="text-center py-16">
                <div className="mb-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Login Required</h2>
                  <p className="text-gray-600 mb-6">
                    Please login to view your order history
                  </p>
                  <div className="flex flex-row gap-4 justify-center">
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
                  </div>
                </div>
              </div>
            ) : orders.length === 0 ? (
              /* Empty Orders State */
              <div className="text-center py-16">
                <div className="mb-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">No orders yet</h2>
                  <p className="text-gray-600 mb-6">
                    Start shopping to see your orders here
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium"
                  >
                    Start Shopping
                  </Link>
                </div>
              </div>
            ) : (
              /* Orders List */
              <div className="space-y-4 pb-8">
                {orders.map((order) => {
                  const statusInfo = getStatusInfo(order.paymentStatus);
                  const totalItems = getTotalItems(order.products);
                  
                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300"
                    >
                      {/* Order Header */}
                      <div className="p-4 sm:p-6 border-b border-gray-100">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">
                                Order #{order.orderId || order.id}
                              </h3>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                <span className="mr-1">{statusInfo.icon}</span>
                                {statusInfo.text}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>Placed on {formatDate(order.paymentDate)}</p>
                              <p>{totalItems} item{totalItems !== 1 ? 's' : ''} • ₹{order.totalAmount?.toLocaleString()}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewOrder(order)}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
                            >
                              View Details
                            </button>
                            {order.paymentStatus?.toLowerCase() === 'success' && (
                              <Link
                                href={`/orders/${order.id}/invoice`}
                                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium"
                                target="_blank"
                              >
                                Invoice
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Order Products Preview */}
                      <div className="p-4 sm:p-6">
                        <div className="flex items-center gap-4 overflow-x-auto">
                          {order.products?.slice(0, 3).map((product, index) => (
                            <div key={index} className="flex-shrink-0 flex items-center gap-3">
                              <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                                <Image
                                  src={product.image || '/placeholder-product.jpg'}
                                  alt={product.name || 'Product'}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {product.name}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Qty: {product.quantity || 1} • ₹{product.price}
                                </p>
                              </div>
                            </div>
                          ))}
                          {order.products?.length > 3 && (
                            <div className="flex-shrink-0 text-sm text-gray-600">
                              +{order.products.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
