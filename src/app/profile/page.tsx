'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { saveUserProfile, getUserProfile, updateUserProfile, listenToUserPurchases, Purchase } from '@/lib/database';
import { ref, onValue, query, orderByChild, equalTo, limitToLast } from 'firebase/database';
import { database } from '@/lib/firebase';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    displayName: '',
    email: '',
    phoneNumber: ''
  });
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [quickStats, setQuickStats] = useState({
    totalPurchases: 0,
    totalSpent: 0,
    totalReviews: 0,
    memberSince: '',
    accountStatus: 'Active'
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      // Load user profile from Firebase
      getUserProfile(user.uid).then((profile) => {
        if (profile) {
          setUserInfo({
            displayName: profile.displayName || '',
            email: profile.email || '',
            phoneNumber: profile.phoneNumber || ''
          });
        } else {
          // Create new profile if doesn't exist
          const newProfile = {
            uid: user.uid,
            displayName: user.displayName || '',
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            photoURL: user.photoURL || undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          saveUserProfile(newProfile);
          setUserInfo({
            displayName: newProfile.displayName,
            email: newProfile.email,
            phoneNumber: newProfile.phoneNumber
          });
        }
      });

      // Listen to user purchases
      const unsubscribePurchases = listenToUserPurchases(user.uid, (userPurchases) => {
        setPurchases(userPurchases);
        
        // Calculate quick stats from purchases
        const totalSpent = userPurchases.reduce((sum, purchase) => sum + purchase.price, 0);
        setQuickStats(prev => ({
          ...prev,
          totalPurchases: userPurchases.length,
          totalSpent: totalSpent
        }));
      });

      // Listen to user reviews
      const reviewsRef = query(
        ref(database, 'reviews'),
        orderByChild('userId'),
        equalTo(user.uid)
      );
      
      const unsubscribeReviews = onValue(reviewsRef, (snapshot) => {
        const reviewsData = snapshot.val();
        const reviewsList = reviewsData ? Object.values(reviewsData) : [];
        setUserReviews(reviewsList);
        
        setQuickStats(prev => ({
          ...prev,
          totalReviews: reviewsList.length
        }));
      });

      // Set member since date
      if (user.metadata?.creationTime) {
        const memberSince = new Date(user.metadata.creationTime).toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric'
        });
        setQuickStats(prev => ({
          ...prev,
          memberSince: memberSince
        }));
      }

      return () => {
        unsubscribePurchases();
        unsubscribeReviews();
      };
    }
  }, [user, loading, router]);

  // Generate recent activity from purchases and reviews
  useEffect(() => {
    const activities = [];
    
    // Add recent purchases
    const recentPurchases = purchases
      .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
      .slice(0, 3)
      .map(purchase => ({
        type: 'purchase',
        title: `Purchased "${purchase.productTitle}"`,
        date: purchase.purchaseDate,
        icon: 'purchase',
        color: 'green'
      }));
    
    // Add recent reviews
    const recentReviews = userReviews
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 2)
      .map(review => ({
        type: 'review',
        title: `Left a ${review.rating}-star review`,
        date: review.createdAt,
        icon: 'star',
        color: 'yellow'
      }));
    
    // Combine and sort all activities
    const allActivities = [...recentPurchases, ...recentReviews]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    
    setRecentActivity(allActivities);
  }, [purchases, userReviews]);

  // Helper function to format relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      await updateUserProfile(user.uid, {
        displayName: userInfo.displayName,
        phoneNumber: userInfo.phoneNumber
      });
      setIsEditing(false);
      // Show success message
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!user) return;

    // Reset to original values from Firebase
    try {
      const profile = await getUserProfile(user.uid);
      if (profile) {
        setUserInfo({
          displayName: profile.displayName || '',
          email: profile.email || '',
          phoneNumber: profile.phoneNumber || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  if (loading) {
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
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
              {/* Profile Image */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>
                  )}
                </div>
                {/* Online Status */}
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {user.displayName || 'User'}
                    </h1>
                    <p className="text-gray-600 text-lg">{user.email}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-0">
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="bg-gray-900 hover:bg-black text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200"
                    >
                      {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                    <button
                      onClick={handleLogout}
                      className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>

                {/* Account Stats */}
                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{quickStats.totalPurchases}</div>
                    <div className="text-sm text-gray-600">Purchases</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{quickStats.totalReviews}</div>
                    <div className="text-sm text-gray-600">Reviews</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">₹{quickStats.totalSpent.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Spent</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Personal Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                  {isEditing && (
                    <div className="flex space-x-3">
                      <button
                        onClick={handleCancel}
                        className="text-gray-600 hover:text-gray-800 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-lg transition-colors"
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Display Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={userInfo.displayName}
                        onChange={(e) => setUserInfo({...userInfo, displayName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 py-3">{userInfo.displayName || 'Not provided'}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <p className="text-gray-900 py-3">{userInfo.email}</p>
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={userInfo.phoneNumber}
                        onChange={(e) => setUserInfo({...userInfo, phoneNumber: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="+1 (555) 123-4567"
                      />
                    ) : (
                      <p className="text-gray-900 py-3">{userInfo.phoneNumber || 'Not provided'}</p>
                    )}
                  </div>

                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.color === 'green' ? 'bg-green-100' :
                          activity.color === 'yellow' ? 'bg-yellow-100' : 'bg-blue-100'
                        }`}>
                          {activity.icon === 'purchase' ? (
                            <svg className={`w-5 h-5 ${
                              activity.color === 'green' ? 'text-green-600' : 'text-blue-600'
                            }`} fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium">{activity.title}</p>
                          <p className="text-gray-600 text-sm">{getRelativeTime(activity.date)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-500">No recent activity</p>
                      <p className="text-gray-400 text-sm">Your purchases and reviews will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Account Settings */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
                <div className="space-y-3">
                  <Link href="/orders" className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <span>Orders</span>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Member since</span>
                    <span className="font-medium text-gray-900">{quickStats.memberSince || 'Recently'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total spent</span>
                    <span className="font-medium text-gray-900">₹{quickStats.totalSpent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total purchases</span>
                    <span className="font-medium text-gray-900">{quickStats.totalPurchases}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Reviews written</span>
                    <span className="font-medium text-gray-900">{quickStats.totalReviews}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Account status</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {quickStats.accountStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
