'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import { ref, get, set, push } from 'firebase/database';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function AccountDetailsPage() {
  const { user, loading } = useAuth() || { user: null, loading: true };
  const router = useRouter();
  
  const [accountDetails, setAccountDetails] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch user data from userAddresses and set initial values
  useEffect(() => {
    // Wait for authentication to load before checking user
    if (loading) {
      return;
    }
    
    if (!user) {
      router.push('/auth');
      return;
    }
    
    const fetchUserData = async () => {
      try {
        // First, set email from user auth
        setAccountDetails(prev => ({
          ...prev,
          email: user.email || ''
        }));

        // Try to fetch name and phone from userAddresses
        const addressesRef = ref(database, `userAddresses/${user.uid}`);
        const snapshot = await get(addressesRef);
        
        if (snapshot.exists()) {
          const addressesData = snapshot.val();
          // Get the most recent address (or first one found)
          const addresses = Object.values(addressesData);
          if (addresses.length > 0) {
            const latestAddress = addresses.sort((a, b) => 
              new Date(b.createdAt) - new Date(a.createdAt)
            )[0];
            
            setAccountDetails(prev => ({
              ...prev,
              name: latestAddress.name || '',
              phone: latestAddress.phone || ''
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Set default email even if address fetch fails
        setAccountDetails(prev => ({
          ...prev,
          email: user.email || ''
        }));
      }
    };

    fetchUserData();
  }, [user, router, loading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAccountDetails(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!accountDetails.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!accountDetails.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(accountDetails.phone)) {
      newErrors.phone = 'Phone number must be a valid Indian number (10 digits starting with 6-9)';
    }
    
    if (!accountDetails.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(accountDetails.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Save to userAddresses collection
      const addressesRef = ref(database, `userAddresses/${user.uid}`);
      const newAddressRef = push(addressesRef);
      
      const addressData = {
        id: newAddressRef.key,
        userId: user.uid,
        name: accountDetails.name,
        email: accountDetails.email,
        phone: accountDetails.phone,
        createdAt: new Date().toISOString(),
        isDefault: true // Mark as default address
      };
      
      await set(newAddressRef, addressData);
      
      alert('Account details updated successfully!');
      
    } catch (error) {
      console.error('Error saving account details:', error);
      alert('Failed to update account details. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Details</h1>
          <p className="text-gray-600">
            Manage your personal information and account settings.
          </p>
        </div>

        {/* Account Details Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={accountDetails.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <div className="flex">
                <div className="flex items-center px-3 py-3 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg">
                  <span className="text-gray-700 font-medium">+91</span>
                </div>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={accountDetails.phone}
                  onChange={handleInputChange}
                  maxLength="10"
                  className={`flex-1 px-4 py-3 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter 10-digit phone number"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={accountDetails.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 text-white font-medium py-3 px-8 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving Changes...
                  </div>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">Account Information</h3>
              <p className="text-sm text-blue-700">
                Your account details are used for order processing, communication, and account security. 
                Make sure to keep your information up to date.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
