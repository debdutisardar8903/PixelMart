'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ref, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from '@/components/contexts/AuthContext';
import { useWishlist } from '@/components/contexts/WishlistContext';
import { useCart } from '@/components/contexts/CartContext';
import { useOrderCount } from '@/components/contexts/OrderCountContext';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import BottomNav from '@/components/bottomnav/BottomNav';
import ClientOnly from '@/components/ClientOnly';

export default function ProfilePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, getUserProfileImage, getUserFromDatabase } = useAuth();
  const { wishlistCount } = useWishlist();
  const { cartCount } = useCart();
  const { orderCount } = useOrderCount();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userProfileImage, setUserProfileImage] = useState(null);
  const [couponCount, setCouponCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock user data for display
  const [userProfile, setUserProfile] = useState({
    name: 'Please sign in',
    email: 'wallineex@gmail.com',
    avatar: null,
    joinDate: 'Member since Jan 2024'
  });

  // Manual refresh function
  const refreshUserProfile = async () => {
    if (!user || !getUserFromDatabase) return;
    
    setIsRefreshing(true);
    try {
      console.log('Refreshing user profile data...');
      const result = await getUserFromDatabase(user.uid);
      
      if (result.success) {
        const userData = result.userData;
        console.log('Fetched updated user data:', userData);
        
        setUserProfile(prev => ({
          ...prev,
          name: userData.displayName || user.displayName || user.email?.split('@')[0] || 'User',
          email: userData.email || user.email || 'user@example.com',
          joinDate: userData.createdAt 
            ? `Member since ${new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
            : 'Member since Jan 2024'
        }));
        
        // Also refresh profile image
        if (getUserProfileImage) {
          const profileImageUrl = await getUserProfileImage(user.uid);
          setUserProfileImage(profileImageUrl);
          console.log('Updated profile image:', profileImageUrl);
        }
      } else {
        console.log('Failed to fetch user data, using fallback');
        setUserProfile(prev => ({
          ...prev,
          name: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email || 'user@example.com'
        }));
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fetch updated user profile data from database
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user && getUserFromDatabase) {
        try {
          const result = await getUserFromDatabase(user.uid);
          
          if (result.success) {
            const userData = result.userData;
            setUserProfile(prev => ({
              ...prev,
              name: userData.displayName || user.displayName || user.email?.split('@')[0] || 'User',
              email: userData.email || user.email || 'user@example.com',
              joinDate: userData.createdAt 
                ? `Member since ${new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
                : 'Member since Jan 2024'
            }));
          } else {
            // Fallback to auth user data if database fetch fails
            setUserProfile(prev => ({
              ...prev,
              name: user.displayName || user.email?.split('@')[0] || 'User',
              email: user.email || 'user@example.com'
            }));
          }
        } catch (error) {
          console.error('Error fetching user profile from database:', error);
          // Fallback to auth user data on error
          setUserProfile(prev => ({
            ...prev,
            name: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email || 'user@example.com'
          }));
        }
      } else if (!user) {
        // Reset to default when user logs out
        setUserProfile({
          name: 'Please sign in',
          email: 'wallineex@gmail.com',
          avatar: null,
          joinDate: 'Member since Jan 2024'
        });
      }
    };

    fetchUserProfile();
  }, [user, getUserFromDatabase]);

  // Refresh profile data when user returns to this page (e.g., from edit page)
  useEffect(() => {
    const handleFocus = () => {
      // Refresh profile data when window gains focus
      refreshUserProfile();
    };

    // Listen for window focus events
    window.addEventListener('focus', handleFocus);
    
    // Listen for page visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        handleFocus();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, getUserFromDatabase, getUserProfileImage]);

  // Refresh profile data when navigating back to profile page
  useEffect(() => {
    if (pathname === '/profile' && user && getUserFromDatabase) {
      console.log('User returned to profile page, refreshing data...');
      refreshUserProfile();
    }
  }, [pathname, user, getUserFromDatabase, getUserProfileImage]);

  // Load user profile image when user changes
  useEffect(() => {
    const loadUserProfileImage = async () => {
      if (user && getUserProfileImage) {
        try {
          const profileImageUrl = await getUserProfileImage(user.uid);
          setUserProfileImage(profileImageUrl);
        } catch (error) {
          console.error('Error loading user profile image:', error);
          setUserProfileImage(null);
        }
      } else {
        setUserProfileImage(null);
      }
    };

    loadUserProfileImage();
  }, [user, getUserProfileImage]);

  // Fetch coupon count from database when user is authenticated
  useEffect(() => {
    const fetchCouponCount = async () => {
      try {
        // Only fetch coupons if user is authenticated
        if (!user) {
          setCouponCount(0);
          return;
        }

        const couponsRef = ref(database, 'coupons');
        const snapshot = await get(couponsRef);
        
        if (snapshot.exists()) {
          const couponsData = snapshot.val();
          const activeCoupons = Object.keys(couponsData)
            .filter(key => couponsData[key].isActive !== false)
            .length;
          
          setCouponCount(activeCoupons);
          console.log('Active coupons count:', activeCoupons);
        } else {
          console.log('No coupons found in database');
          setCouponCount(0);
        }
      } catch (error) {
        console.error('Error fetching coupon count:', error);
        setCouponCount(0);
      }
    };

    fetchCouponCount();
  }, [user]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogin = () => {
    router.push('/auth?redirect=/profile');
  };

  // Quick action items with icons
  const quickActions = [
    {
      name: 'Orders',
      href: '/orders',
      count: orderCount, // Real count from Firebase
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      name: 'Wishlist',
      href: '/wishlist',
      count: wishlistCount,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    {
      name: 'Coupons',
      href: '/coupons',
      count: couponCount, // Dynamic count from database
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      )
    },
    {
      name: 'Help Center',
      href: '/help',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )
    }
  ];

  // Account center options
  const accountOptions = [
    {
      name: 'Edit Profile',
      href: '/profile/edit',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
    {
      name: 'Saved Address',
      href: '/profile/addresses',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      name: 'Privacy Center',
      href: '/profile/privacy',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    }
  ];

  // Feedback & Information options
  const feedbackOptions = [
    {
      name: 'Help Center',
      href: '/help',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      name: 'Terms, Policies and Licenses',
      href: '/profile/licenses',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      name: 'Browse FAQs',
      href: '/faq',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="font-sans min-h-screen bg-white flex flex-col">
      <div className="hidden sm:block">
        <Header />
      </div>
      
      <div className="flex-1 pt-6 sm:pt-24 px-4">
        <div className="mx-auto max-w-4xl">

          <ClientOnly>
            {/* User Profile Card */}
            <div className="relative bg-gradient-to-tl from-pink-200 via-purple-200 via-blue-200 to-gray-200 rounded-xl shadow-sm border border-gray-200 p-6 mb-6 overflow-hidden">
              {/* Geometric Texture Overlay */}
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: '30px 30px'
                }}
              ></div>
              
              {/* Hexagon Pattern Overlay */}
              <div 
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='28' height='49' viewBox='0 0 28 49' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.3' fill-rule='evenodd'%3E%3Cpolygon points='13.99 9.25 13.99 1.75 1.74 8.75 1.74 16.25'/%3E%3Cpolygon points='13.99 33.25 13.99 25.75 1.74 32.75 1.74 40.25'/%3E%3Cpolygon points='26.24 16.25 26.24 8.75 13.99 1.75 13.99 9.25'/%3E%3Cpolygon points='26.24 40.25 26.24 32.75 13.99 25.75 13.99 33.25'/%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: '20px 35px'
                }}
              ></div>
              
              {/* Triangle Pattern Overlay */}
              <div 
                className="absolute inset-0 opacity-8"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.15' fill-rule='evenodd'%3E%3Cpath d='M20 20.5L9.5 9h21L20 20.5zM20 19.5L30.5 31h-21L20 19.5z'/%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: '25px 25px'
                }}
              ></div>
              
              <div className="relative z-10 flex items-center space-x-4">
                {/* Avatar */}
                {userProfileImage ? (
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/20">
                    <img 
                      src={userProfileImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        const target = e.target;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-semibold">${userProfile.name.charAt(0).toUpperCase()}</div>`;
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-3xl font-semibold">
                      {userProfile.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-semibold text-gray-900">{userProfile.name}</h2>
                    {isRefreshing && (
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </div>
                  <p className="text-gray-600">{userProfile.email}</p>
                  <p className="text-sm text-gray-500 mt-1">{userProfile.joinDate}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions - 4 Columns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {quickActions.map((action) => (
                <button
                  key={action.name}
                  onClick={() => router.push(action.href)}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 group-hover:bg-black group-hover:text-white transition-colors">
                      {action.icon}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{action.name}</div>
                      {action.count !== undefined && (
                        <div className="text-xs text-gray-500">{action.count} items</div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Account Center */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Center</h3>
              <div className="space-y-1">
                {accountOptions.map((option) => (
                  <button
                    key={option.name}
                    onClick={() => router.push(option.href)}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="text-gray-500">
                      {option.icon}
                    </div>
                    <span className="font-medium text-gray-900">{option.name}</span>
                    <div className="flex-1"></div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback & Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback & Information</h3>
              <div className="space-y-1">
                {feedbackOptions.map((option) => (
                  <button
                    key={option.name}
                    onClick={() => router.push(option.href)}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="text-gray-500">
                      {option.icon}
                    </div>
                    <span className="font-medium text-gray-900">{option.name}</span>
                    <div className="flex-1"></div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Auth Button */}
            <div className="text-center mb-6">
              {user ? (
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="px-6 py-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 border border-red-200"
                >
                  {isLoggingOut ? 'Signing out...' : 'Sign Out'}
                </button>
              ) : (
                <button
                  onClick={handleLogin}
                  className="px-6 py-3 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* App Version Info */}
            <div className="text-center text-sm text-gray-500 mb-6">
              <p>Wallineex Store v1.0.0</p>
              <p>© 2024 Wallineex. All rights reserved.</p>
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
