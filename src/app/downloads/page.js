'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { database, auth } from '@/lib/firebase';
import { ref, get } from 'firebase/database';

export default function DownloadsPage() {
  const { user, loading } = useAuth() || { user: null, loading: true };
  const router = useRouter();
  
  const [downloads, setDownloads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingItems, setDownloadingItems] = useState(new Set());

  // Fetch purchased digital products from Firebase
  useEffect(() => {
    // Wait for authentication to load before checking user
    if (loading) {
      return;
    }
    
    if (!user) {
      router.push('/auth');
      return;
    }
    
    // Fetch user purchases from Firebase
    const loadDownloads = async () => {
      setIsLoading(true);
      
      try {
        const purchasesRef = ref(database, `userPurchases/${user.uid}`);
        const snapshot = await get(purchasesRef);
        
        if (snapshot.exists()) {
          const purchasesData = snapshot.val();
          const purchases = Object.values(purchasesData);
          
          // Transform purchases to downloads format with unlimited downloads
          const downloadsData = purchases
            .filter(purchase => purchase.status === 'completed') // Only completed purchases
            .map(purchase => ({
              id: purchase.id,
              productName: purchase.productTitle,
              productId: purchase.productId,
              orderNumber: purchase.orderNumber,
              purchaseDate: purchase.purchaseDate,
              fileSize: 'Digital Product', // Default since we don't have file size in purchases
              downloadCount: 0, // Reset to 0 for unlimited downloads
              maxDownloads: 'Unlimited', // Set to unlimited
              expiryDate: 'Never', // No expiry for unlimited downloads
              downloadUrl: purchase.downloadUrl,
              status: 'available',
              price: purchase.price,
              category: purchase.productCategory || 'Digital'
            }));
          
          setDownloads(downloadsData);
        } else {
          setDownloads([]);
        }
      } catch (error) {
        console.error('Failed to load downloads:', error);
        setDownloads([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDownloads();
  }, [user, router, loading]);

  const handleDownload = async (download) => {
    if (downloadingItems.has(download.id) || !download.downloadUrl) {
      if (!download.downloadUrl) {
        alert('Download URL not available for this product.');
      }
      return;
    }

    setDownloadingItems(prev => new Set([...prev, download.id]));

    try {
      // Get the user's authentication token
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert('Please log in to download files.');
        return;
      }

      const token = await currentUser.getIdToken();
      
      // Call the API endpoint to get a signed download URL
      const response = await fetch(`/api/download?productId=${encodeURIComponent(download.productId)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
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
        throw new Error('Failed to get download URL');
      }
      
      // Update download count (for tracking purposes, but unlimited downloads allowed)
      setDownloads(prev => prev.map(item => 
        item.id === download.id 
          ? { ...item, downloadCount: item.downloadCount + 1 }
          : item
      ));
      
      // Short delay to show downloading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Download error:', error);
      alert(`Download failed: ${error.message}`);
    } finally {
      setDownloadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(download.id);
        return newSet;
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'limit_reached':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (download) => {
    if (download.maxDownloads === 'Unlimited') {
      return 'Available (Unlimited)';
    }
    if (download.downloadCount >= download.maxDownloads) {
      return 'Download Limit Reached';
    }
    if (download.status === 'expired') {
      return 'Expired';
    }
    return 'Available';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const canDownload = (download) => {
    return download.status === 'available' && 
           (download.maxDownloads === 'Unlimited' || download.downloadCount < download.maxDownloads) &&
           !downloadingItems.has(download.id);
  };

  // Show loading state while authentication is loading or user is not available
  if (loading || !user) {
    return (
      <div className="font-sans min-h-screen bg-white pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Removed loading state - downloads will load without showing loading spinner
  // if (isLoading) {
  //   return (
  //     <div className="font-sans min-h-screen bg-white pt-24">
  //       <div className="max-w-4xl mx-auto px-4 py-8">
  //         <div className="text-center py-12">
  //           <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
  //           <p className="text-gray-600">Loading your downloads...</p>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="font-sans min-h-screen bg-white pt-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Downloads</h1>
          <p className="text-gray-600">
            Access and download your purchased digital products.
          </p>
        </div>

        {/* Downloads List */}
        {downloads.length > 0 ? (
          <div className="space-y-6">
            {downloads.map((download) => (
              <div key={download.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {/* Download Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                  <div className="mb-4 sm:mb-0 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {download.productName}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Order: {download.orderNumber}</p>
                      <p>Purchased: {formatDate(download.purchaseDate)}</p>
                      <p>File Size: {download.fileSize}</p>
                      <p>Expires: {formatDate(download.expiryDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(download.status)}`}>
                      {getStatusText(download)}
                    </span>
                    <span className="text-sm text-gray-600">
                      {download.maxDownloads === 'Unlimited' 
                        ? `${download.downloadCount} downloads used (Unlimited)`
                        : `${download.downloadCount}/${download.maxDownloads} downloads used`
                      }
                    </span>
                  </div>
                </div>

                {/* Download Progress Bar - Only show for limited downloads */}
                {download.maxDownloads !== 'Unlimited' && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Download Usage</span>
                      <span>{Math.round((download.downloadCount / download.maxDownloads) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(download.downloadCount / download.maxDownloads) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {/* Unlimited Downloads Badge */}
                {download.maxDownloads === 'Unlimited' && (
                  <div className="mb-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm font-medium text-green-800">Unlimited Downloads Available</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Download Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleDownload(download)}
                    disabled={!canDownload(download)}
                    className={`flex-1 sm:flex-none px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      canDownload(download)
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {downloadingItems.has(download.id) ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Downloading...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download
                      </div>
                    )}
                  </button>
                  
                  <button 
                    onClick={() => router.push(`/product/${download.productId}`)}
                    className="flex-1 sm:flex-none px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No downloads available</h3>
              <p className="text-gray-600 mb-6">
                You haven't purchased any digital products yet. Browse our digital collection to get started.
              </p>
              <button
                onClick={() => router.push('/')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Browse Digital Products
              </button>
            </div>
          </div>
        )}

        {/* Download Information */}
        {downloads.length > 0 && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-green-900 mb-1">Unlimited Downloads Available</h3>
                <p className="text-sm text-green-700">
                  You have {downloads.length} digital product{downloads.length !== 1 ? 's' : ''} available for unlimited downloads. 
                  All your purchased digital products can be downloaded as many times as you need, with no expiry date. 
                  Downloads are secured with authentication tokens for your protection.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
