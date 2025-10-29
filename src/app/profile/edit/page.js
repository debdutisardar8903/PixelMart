'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ref, get, set, serverTimestamp } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from '@/components/contexts/AuthContext';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import BottomNav from '@/components/bottomnav/BottomNav';
import ClientOnly from '@/components/ClientOnly';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, getUserFromDatabase, getRandomProfileImage } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userProfile, setUserProfile] = useState({
    uid: '',
    email: '',
    displayName: '',
    profileImageUrl: '',
    photoURL: null,
    emailVerified: false
  });
  const [selectedProfileImage, setSelectedProfileImage] = useState('');

  // Available profile images (from AuthContext)
  const profileImages = [
    '13fc6350-b883-4615-b8d0-4c203c125535.jpg',
    '4cd502d1-9e99-43dc-b2a3-45d5a52f3704.jpg',
    '519eabc9-cd78-41a1-99fb-5d47d89015e8.jpg',
    '5eff03a1-04c0-4903-a58f-6dfb7427ba5d.jpg',
    '7c7f9738-d7a5-4009-b68d-42d63a4f77e2.jpg',
    '8ae4b851-4163-42f0-8737-26e7d88ce539.jpg',
    '8d52b32e-631e-4259-87a6-e14d2e7fd6a1.jpg',
    'aIgirl_AI.jpg',
    'anime-stylecelebrating-valentines-day.jpg',
    'bc120664-d273-4e40-9986-6c8353379b07.jpg',
    'beautiful-cartoon-woman-portrait.jpg',
    'cute-cartoon-kid-posing-portrait.jpg',
    'dc1e893b-25a1-466f-a6f2-6f9366cba271.jpg',
    'eecf8cde-a38e-459b-aeed-71436f0bc99a.jpg',
    'ff591ca7-b11c-4bd7-8c8c-239aeb932a43.jpg'
  ];

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        router.push('/auth?redirect=/profile/edit');
        return;
      }

      try {
        setIsLoading(true);
        const result = await getUserFromDatabase(user.uid);
        
        if (result.success) {
          const userData = result.userData;
          setUserProfile({
            uid: userData.uid || user.uid,
            email: userData.email || user.email,
            displayName: userData.displayName || user.displayName || '',
            profileImageUrl: userData.profileImageUrl || getRandomProfileImage(user.uid),
            photoURL: userData.photoURL || user.photoURL || null,
            emailVerified: userData.emailVerified || user.emailVerified || false
          });
          setSelectedProfileImage(userData.profileImageUrl || getRandomProfileImage(user.uid));
        } else {
          // If user doesn't exist in database, use Firebase auth data
          const defaultProfileImage = getRandomProfileImage(user.uid);
          setUserProfile({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || '',
            profileImageUrl: defaultProfileImage,
            photoURL: user.photoURL || null,
            emailVerified: user.emailVerified || false
          });
          setSelectedProfileImage(defaultProfileImage);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, getUserFromDatabase, getRandomProfileImage, router]);

  const handleInputChange = (field, value) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfileImageSelect = (imagePath) => {
    setSelectedProfileImage(imagePath);
    setUserProfile(prev => ({
      ...prev,
      profileImageUrl: imagePath
    }));
  };

  const handleSaveProfile = async () => {
    if (!user) {
      alert('Please login to update your profile');
      return;
    }

    // Validate required fields according to database rules
    if (!userProfile.displayName || !userProfile.displayName.trim()) {
      alert('Display name is required and cannot be empty');
      return;
    }

    if (!userProfile.email || !userProfile.email.trim()) {
      alert('Email is required and cannot be empty');
      return;
    }

    if (!userProfile.profileImageUrl || !userProfile.profileImageUrl.trim()) {
      alert('Profile image is required');
      return;
    }

    // Additional validation
    if (userProfile.displayName.trim().length === 0) {
      alert('Display name must contain at least one character');
      return;
    }

    if (userProfile.email.trim().length === 0) {
      alert('Email must contain at least one character');
      return;
    }

    setIsSaving(true);

    try {
      const userRef = ref(database, `users/${user.uid}`);
      
      // Prepare user data according to database rules
      const userData = {
        uid: user.uid, // Must match auth.uid
        email: userProfile.email.trim(),
        displayName: userProfile.displayName.trim(),
        profileImageUrl: userProfile.profileImageUrl,
        photoURL: userProfile.photoURL,
        emailVerified: userProfile.emailVerified,
        lastLoginAt: serverTimestamp() // Use Firebase server timestamp
      };

      // Get existing data to preserve createdAt
      const existingDataSnapshot = await get(userRef);
      if (existingDataSnapshot.exists()) {
        const existingData = existingDataSnapshot.val();
        if (existingData.createdAt) {
          userData.createdAt = existingData.createdAt; // Preserve existing createdAt
        }
      } else {
        // New user, set creation time with server timestamp
        userData.createdAt = serverTimestamp();
      }

      console.log('Attempting to save user data:', userData);
      await set(userRef, userData);
      
      console.log('Profile updated successfully');
      alert('Profile updated successfully!');
      router.push('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      console.error('Error details:', error.message);
      console.error('User data that failed:', userData);
      
      // More specific error message
      if (error.message.includes('PERMISSION_DENIED')) {
        alert('Permission denied. Please check your authentication and try again.');
      } else if (error.message.includes('validation')) {
        alert('Validation error. Please check all required fields are filled correctly.');
      } else {
        alert(`Failed to update profile: ${error.message}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="font-sans min-h-screen bg-white flex flex-col">
        <div className="hidden sm:block">
          <Header />
        </div>
        <div className="flex-1 pt-6 sm:pt-24 px-4">
          <div className="mx-auto max-w-4xl">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Edit Profile</h1>
            <p className="text-sm text-gray-600">Update your personal information and profile settings</p>
          </div>

          <ClientOnly>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* Current Profile Image */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Current Profile Image
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
                    <img 
                      src={selectedProfileImage} 
                      alt="Current Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = getRandomProfileImage(user?.uid || 'default');
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      This is your current profile image. Select a new one below to change it.
                    </p>
                  </div>
                </div>
              </div>

              {/* Profile Image Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose Profile Image *
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-3">
                  {profileImages.map((image) => {
                    const imagePath = `/profile_image/${image}`;
                    const isSelected = selectedProfileImage === imagePath;
                    
                    return (
                      <button
                        key={image}
                        onClick={() => handleProfileImageSelect(imagePath)}
                        className={`
                          relative w-16 h-16 rounded-full overflow-hidden border-2 transition-all duration-200
                          ${isSelected 
                            ? 'border-black shadow-lg scale-105' 
                            : 'border-gray-200 hover:border-gray-400 hover:scale-105'
                          }
                        `}
                      >
                        <img 
                          src={imagePath} 
                          alt={`Profile option ${image}`}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                {/* Display Name */}
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name *
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    value={userProfile.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Enter your display name"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">This name will be displayed on your reviews and profile</p>
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={userProfile.email}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed from this page</p>
                </div>

                {/* Email Verification Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Verification Status
                  </label>
                  <div className={`
                    inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                    ${userProfile.emailVerified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                    }
                  `}>
                    {userProfile.emailVerified ? (
                      <>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Verified
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Not Verified
                      </>
                    )}
                  </div>
                </div>

                {/* User ID (Read-only) */}
                <div>
                  <label htmlFor="uid" className="block text-sm font-medium text-gray-700 mb-2">
                    User ID
                  </label>
                  <input
                    id="uid"
                    type="text"
                    value={userProfile.uid}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed font-mono text-sm"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Your unique user identifier</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex-1 bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
                <button
                  onClick={() => router.push('/profile')}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
              </div>

              {/* Required Fields Note */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Profile Requirements</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Fields marked with * are required. Your profile must have a display name and profile image to be saved successfully.
                    </p>
                  </div>
                </div>
              </div>
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
