'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { getUserPurchases, Purchase, getProduct } from '@/lib/database';

// Group purchases by order number to create order structure
interface GroupedOrder {
  orderNumber: string;
  date: string;
  status: 'completed' | 'processing' | 'failed';
  total: number;
  purchases: Purchase[];
}

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<GroupedOrder[]>([]);
  const [filter, setFilter] = useState<'all' | 'completed' | 'processing' | 'failed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [productImages, setProductImages] = useState<Map<string, string>>(new Map());

  // Fetch real orders from database
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      fetchUserOrders();
    }
  }, [user, loading, router]);

  const handleImageError = (productId: string) => {
    setImageErrors(prev => new Set([...prev, productId]));
  };

  // Helper function to properly parse dates
  const parseDate = (dateString: string): Date => {
    try {
      // First try direct parsing
      let date = new Date(dateString);
      
      // If invalid, try parsing as timestamp
      if (isNaN(date.getTime())) {
        const timestamp = parseInt(dateString);
        if (!isNaN(timestamp)) {
          date = new Date(timestamp);
        }
      }
      
      // If still invalid, try parsing ISO format variations
      if (isNaN(date.getTime())) {
        // Handle common ISO format issues
        const isoDate = dateString.includes('T') ? dateString : dateString + 'T00:00:00.000Z';
        date = new Date(isoDate);
      }
      
      return date;
    } catch (error) {
      console.error('Date parsing error:', error, 'for date:', dateString);
      return new Date(); // Return current date as fallback
    }
  };

  // Helper function to format date consistently
  const formatDate = (dateString: string): string => {
    try {
      const date = parseDate(dateString);
      
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error, 'for date:', dateString);
      return 'Invalid Date';
    }
  };

  const fetchUserOrders = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const purchases = await getUserPurchases(user.uid);
      
      // Group purchases by order number
      const groupedOrders = groupPurchasesByOrder(purchases);
      setOrders(groupedOrders);

      // Fetch product images for all unique products
      const uniqueProductIds = [...new Set(purchases.map(p => p.productId))];
      const imageMap = new Map<string, string>();
      
      await Promise.all(
        uniqueProductIds.map(async (productId) => {
          try {
            const product = await getProduct(productId);
            if (product && product.image) {
              imageMap.set(productId, product.image);
            }
          } catch (error) {
            console.error(`Error fetching product ${productId}:`, error);
          }
        })
      );
      
      setProductImages(imageMap);
    } catch (error) {
      console.error('Error fetching user orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const groupPurchasesByOrder = (purchases: Purchase[]): GroupedOrder[] => {
    const orderMap = new Map<string, GroupedOrder>();

    purchases.forEach(purchase => {
      const orderNumber = purchase.orderNumber;
      
      if (!orderMap.has(orderNumber)) {
        // Debug: Log the purchase date format
        console.log('Purchase date format:', purchase.purchaseDate, typeof purchase.purchaseDate);
        
        orderMap.set(orderNumber, {
          orderNumber,
          date: purchase.purchaseDate,
          status: purchase.status,
          total: 0,
          purchases: []
        });
      }

      const order = orderMap.get(orderNumber)!;
      order.purchases.push(purchase);
      order.total += purchase.price;
      
      // Update status to most recent (or keep failed/processing if any)
      if (purchase.status === 'failed' || purchase.status === 'processing') {
        order.status = purchase.status;
      }
    });

    // Convert map to array and sort by date (newest first)
    return Array.from(orderMap.values()).sort((a, b) => 
      parseDate(b.date).getTime() - parseDate(a.date).getTime()
    );
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = searchTerm === '' || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.purchases.some(purchase => purchase.productTitle.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        );
      case 'processing':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        );
      case 'failed':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const handleDownload = async (purchase: Purchase) => {
    if (!user) return;

    try {
      // Get user's ID token for authentication
      const idToken = await user.getIdToken();
      
      // Call secure download API
      const response = await fetch(`/api/download?productId=${purchase.productId}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Download failed');
      }

      const data = await response.json();
      
      if (data.success && data.downloadUrl) {
        // Open the signed URL for download
        window.open(data.downloadUrl, '_blank');
      } else {
        throw new Error('Invalid download response');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert(error instanceof Error ? error.message : 'Failed to download file. Please try again.');
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
            <p className="text-gray-600">View and manage your purchase history</p>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search orders or products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Status Filter */}
              <div className="flex space-x-2">
                {(['all', 'completed', 'processing', 'failed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filter === status
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-6">
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || filter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : "You haven't made any purchases yet."}
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="bg-gray-900 hover:bg-black text-white font-medium px-6 py-3 rounded-lg transition-colors"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div key={order.orderNumber} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Order Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{order.orderNumber}</h3>
                          <p className="text-sm text-gray-600">
                            Placed on {formatDate(order.date)}
                          </p>
                        </div>
                        <div className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          ₹{Math.round(order.total).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.purchases.length} item{order.purchases.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {order.purchases.map((purchase) => (
                        <div key={purchase.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                          {/* Product Image */}
                          <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative">
                            {imageErrors.has(purchase.productId) || !productImages.get(purchase.productId) ? (
                              // Fallback placeholder
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            ) : (
                              <Image
                                src={productImages.get(purchase.productId)!}
                                alt={purchase.productTitle}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                  console.error('Order image failed to load:', productImages.get(purchase.productId));
                                  handleImageError(purchase.productId);
                                }}
                                onLoad={() => {
                                  console.log('Order image loaded successfully:', productImages.get(purchase.productId));
                                }}
                              />
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 mb-1">{purchase.productTitle}</h4>
                            <p className="text-sm text-gray-600 mb-2">{purchase.productCategory}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>Digital Product</span>
                              <span>Instant Download</span>
                            </div>
                          </div>

                          {/* Price and Actions */}
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 mb-2">₹{purchase.price.toLocaleString()}</p>
                            {order.status === 'completed' && purchase.downloadUrl && (
                              <button
                                onClick={() => handleDownload(purchase)}
                                className="inline-flex items-center space-x-1 bg-gray-900 hover:bg-black text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>Download</span>
                              </button>
                            )}
                            {order.status === 'processing' && (
                              <span className="inline-flex items-center text-xs text-yellow-600">
                                <svg className="w-3 h-3 mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Order Summary Stats */}
          {filteredOrders.length > 0 && (
            <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {filteredOrders.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {filteredOrders.filter(o => o.status === 'completed').length}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {filteredOrders.filter(o => o.status === 'processing').length}
                  </div>
                  <div className="text-sm text-gray-600">Processing</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    ₹{Math.round(filteredOrders.reduce((sum, order) => sum + order.total, 0)).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Spent</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
