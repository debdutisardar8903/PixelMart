'use client';

import { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/components/contexts/AuthContext';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import BottomNav from '@/components/bottomnav/BottomNav';
import ClientOnly from '@/components/ClientOnly';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCoupon, setCopiedCoupon] = useState(null);
  const [flippedCards, setFlippedCards] = useState(new Set());
  const { user, loading: authLoading } = useAuth();

  // Fetch coupons from database only if user is authenticated
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setIsLoading(true);
        
        // Only fetch coupons if user is authenticated
        if (!user) {
          setCoupons([]);
          setIsLoading(false);
          return;
        }

        const couponsRef = ref(database, 'coupons');
        const snapshot = await get(couponsRef);
        
        if (snapshot.exists()) {
          const couponsData = snapshot.val();
          const couponsArray = Object.keys(couponsData)
            .map(key => ({
              id: key,
              code: couponsData[key].code || '',
              discount: couponsData[key].discount || 0,
              type: couponsData[key].type || 'percentage',
              description: couponsData[key].description || '',
              isActive: couponsData[key].isActive !== false,
              createdAt: couponsData[key].createdAt || null,
              ...couponsData[key]
            }))
            .filter(coupon => coupon.isActive) // Only show active coupons
            .sort((a, b) => {
              // Sort by creation date (newest first) if available
              if (a.createdAt && b.createdAt) {
                return new Date(b.createdAt) - new Date(a.createdAt);
              }
              return a.code.localeCompare(b.code);
            });
          
          setCoupons(couponsArray);
          console.log('Coupons fetched from database:', couponsArray);
        } else {
          console.log('No coupons found in database');
          setCoupons([]);
        }
      } catch (error) {
        console.error('Error fetching coupons:', error);
        setCoupons([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Don't fetch if auth is still loading
    if (!authLoading) {
      fetchCoupons();
    }
  }, [user, authLoading]);

  // Copy coupon code to clipboard
  const handleCopyCoupon = async (couponCode) => {
    try {
      await navigator.clipboard.writeText(couponCode);
      setCopiedCoupon(couponCode);
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedCoupon(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy coupon code:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = couponCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopiedCoupon(couponCode);
      setTimeout(() => {
        setCopiedCoupon(null);
      }, 2000);
    }
  };

  // Handle card flip
  const handleCardFlip = (couponId) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(couponId)) {
        newSet.delete(couponId);
      } else {
        newSet.add(couponId);
      }
      return newSet;
    });
  };

  return (
    <>
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
      
      <div className="font-sans min-h-screen bg-white flex flex-col">
        <div className="hidden sm:block">
          <Header />
        </div>
      
        <div className="flex-1 pt-6 sm:pt-24 px-4">
          <div className="mx-auto max-w-6xl">
            {/* Back Button */}
            <div className="mb-4 sm:hidden">
              <button
                onClick={() => window.history.back()}
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
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">Available Coupons</h1>
                  <p className="text-sm text-gray-600">
                    {!user 
                      ? 'Login to view exclusive discount coupons'
                      : coupons.length > 0 
                        ? `${coupons.length} coupon${coupons.length !== 1 ? 's' : ''} available` 
                        : 'No coupons available'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Coupons Content */}
            <ClientOnly>
              {authLoading || isLoading ? (
                <div className="text-center py-16">
                  <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading coupons...</p>
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
                      Please login or register to view exclusive discount coupons
                    </p>
                    <div className="flex flex-row gap-4 justify-center">
                      <Link
                        href="/auth?redirect=/coupons"
                        className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                      >
                        Login
                      </Link>
                      <Link
                        href="/auth/signup?redirect=/coupons"
                        className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium"
                      >
                        Sign up
                      </Link>
                    </div>
                  </div>
                </div>
              ) : coupons.length === 0 ? (
                /* Empty Coupons State */
                <div className="text-center py-16">
                  <div className="mb-6">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">No coupons available</h2>
                    <p className="text-gray-600 mb-6">
                      Check back later for new discount coupons and special offers
                    </p>
                  </div>
                </div>
              ) : (
                /* Coupons Grid */
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pb-8">
                  {coupons.map((coupon) => {
                    const isFlipped = flippedCards.has(coupon.id);
                    return (
                      <div
                        key={coupon.id}
                        className="relative w-full h-48 perspective-1000"
                        style={{ perspective: '1000px' }}
                      >
                        <div
                          className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${
                            isFlipped ? 'rotate-y-180' : ''
                          }`}
                          onClick={() => handleCardFlip(coupon.id)}
                          style={{ transformStyle: 'preserve-3d' }}
                        >
                          {/* Front Side */}
                          <div
                            className="absolute inset-0 w-full h-full bg-white rounded-lg shadow-sm border border-gray-200 backface-hidden flex flex-col items-center justify-center p-4"
                            style={{ backfaceVisibility: 'hidden' }}
                          >
                            {/* Wallineex Logo */}
                            <div className="mb-4">
                              <Image
                                src="/wallineex.svg"
                                alt="Wallineex"
                                width={80}
                                height={48}
                                className="object-contain"
                              />
                            </div>
                            
                            {/* Description */}
                            <p className="text-sm text-gray-600 text-center line-clamp-3">
                              {coupon.description}
                            </p>
                            
                            {/* Discount Badge */}
                            <div className="mt-3 px-3 py-1 bg-black text-white rounded-full text-xs font-medium">
                              {coupon.type === 'percentage' ? `${coupon.discount}% OFF` : `₹${coupon.discount} OFF`}
                            </div>
                          </div>

                          {/* Back Side */}
                          <div
                            className="absolute inset-0 w-full h-full bg-white rounded-lg shadow-sm border border-gray-200 backface-hidden flex flex-col items-center justify-center p-4 rotate-y-180"
                            style={{ 
                              backfaceVisibility: 'hidden',
                              transform: 'rotateY(180deg)'
                            }}
                          >
                            {/* Wallineex Logo - Top */}
                            <div className="mb-4">
                              <Image
                                src="/wallineex.svg"
                                alt="Wallineex"
                                width={60}
                                height={36}
                                className="object-contain"
                              />
                            </div>
                            
                            {/* Coupon Code */}
                            <div className="mb-4 text-center">
                              <div className="text-lg font-bold text-gray-900 tracking-wider mb-1">
                                {coupon.code}
                              </div>
                              <div className="text-xs text-gray-500">Coupon Code</div>
                            </div>
                            
                            {/* Copy Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyCoupon(coupon.code);
                              }}
                              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                                copiedCoupon === coupon.code
                                  ? 'bg-black text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-black hover:text-white'
                              }`}
                            >
                              {copiedCoupon === coupon.code ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              )}
                            </button>
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
    </>
  );
}
