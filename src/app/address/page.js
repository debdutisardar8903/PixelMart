'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import { ref, get, set, push } from 'firebase/database';
import { 
  validateEmail,
  validatePhoneNumber
} from '@/lib/payment';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function AddressPage() {
  const { user, loading } = useAuth() || { user: null, loading: true };
  const router = useRouter();
  
  const [addresses, setAddresses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Redirect if not logged in
  useEffect(() => {
    // Wait for authentication to load before checking user
    if (loading) {
      return;
    }
    
    if (!user) {
      router.push('/auth');
      return;
    }
  }, [user, router, loading]);

  // Fetch and pre-fill customer details from database (same logic as checkout)
  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (user?.uid) {
        try {
          // Fetch user data from database
          const userRef = ref(database, `users/${user.uid}`);
          const snapshot = await get(userRef);
          
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setFormData(prev => ({
              ...prev,
              name: userData.fullName || userData.displayName || '',
              email: userData.email || user.email || '',
              phone: userData.phone || ''
            }));
          } else {
            // If no user data exists, just pre-fill email
            setFormData(prev => ({
              ...prev,
              email: user.email || ''
            }));
          }
        } catch (error) {
          console.error('Error fetching customer details:', error);
          // Fallback to just email
          setFormData(prev => ({
            ...prev,
            email: user.email || ''
          }));
        }
      }
    };

    fetchCustomerDetails();
  }, [user]);

  // Fetch saved addresses from database
  useEffect(() => {
    const fetchSavedAddresses = async () => {
      if (user?.uid) {
        try {
          // Fetch addresses from userAddresses collection
          const addressesRef = ref(database, `userAddresses/${user.uid}`);
          const snapshot = await get(addressesRef);
          
          if (snapshot.exists()) {
            const addressesData = snapshot.val();
            // Convert object to array and sort by creation date
            const addressesArray = Object.keys(addressesData).map(key => ({
              id: key,
              ...addressesData[key]
            })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            setAddresses(addressesArray);
          } else {
            setAddresses([]);
          }
        } catch (error) {
          console.error('Error fetching saved addresses:', error);
          setAddresses([]);
        }
      }
    };

    fetchSavedAddresses();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle phone number formatting (same as checkout)
    if (name === 'phone') {
      // Remove all non-digits
      const digits = value.replace(/\D/g, '');
      // Limit to 10 digits after +91
      const phoneDigits = digits.slice(0, 10);
      setFormData(prev => ({
        ...prev,
        [name]: phoneDigits
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

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

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhoneNumber(formData.phone)) {
      newErrors.phone = 'Phone number must be a valid Indian number (10 digits starting with 6-9)';
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
      // Save/update customer details in users database (same logic as checkout)
      if (user?.uid) {
        const userRef = ref(database, `users/${user.uid}`);
        const userSnapshot = await get(userRef);
        
        const currentTime = new Date().toISOString();
        const userData = {
          uid: user.uid,
          email: formData.email,
          displayName: formData.name,
          fullName: formData.name,
          phone: formData.phone,
          updatedAt: currentTime
        };

        if (userSnapshot.exists()) {
          // Update existing user data
          const existingData = userSnapshot.val();
          await set(userRef, {
            ...existingData,
            ...userData
          });
        } else {
          // Create new user data
          await set(userRef, {
            ...userData,
            createdAt: currentTime
          });
        }
      }
      
      // Save address to Firebase database
      const addressesRef = ref(database, `userAddresses/${user.uid}`);
      const newAddressRef = push(addressesRef);
      
      const newAddress = {
        id: newAddressRef.key,
        ...formData,
        userId: user.uid,
        isDefault: addresses.length === 0, // First address becomes default
        createdAt: new Date().toISOString()
      };
      
      await set(newAddressRef, newAddress);
      
      // Update local state
      setAddresses(prev => [...prev, newAddress]);
      
      // Reset form but keep user data for next time
      setFormData({
        name: formData.name, // Keep name
        phone: formData.phone, // Keep phone
        email: formData.email // Keep email
      });
      
      setShowAddForm(false);
      alert('Billing address added successfully!');
      
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to add address. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setFormData({
      name: '',
      phone: '',
      email: user?.email || ''
    });
    setErrors({});
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
          
          <p className="text-gray-600 mb-6">
            The following addresses will be used on the checkout page by default.
          </p>
        </div>

        {/* Billing Address Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Billing Address</h1>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              Add Billing Address
            </button>
          </div>

          {/* Address List or Empty State */}
          {addresses.length > 0 ? (
            <div className="grid gap-4 mb-8">
              {addresses.map((address) => (
                <div key={address.id} className="border border-gray-200 rounded-lg p-4 relative">
                  {address.isDefault && (
                    <span className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Default
                    </span>
                  )}
                  <h3 className="font-semibold text-gray-900 mb-2">{address.name}</h3>
                  <p className="text-gray-600 text-sm mb-1">Phone: {address.phone}</p>
                  <p className="text-gray-600 text-sm">Email: {address.email}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">You have not set up this type of address yet.</p>
            </div>
          )}

          {/* Add Address Form - Show only when no addresses exist or when showAddForm is true */}
          {(addresses.length === 0 || showAddForm) && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Add Billing Address</h2>
                {addresses.length > 0 && (
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
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
                    value={formData.phone}
                    onChange={handleInputChange}
                    maxLength="10"
                    className={`flex-1 px-4 py-3 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter 10-digit phone number"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
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

              {/* Form Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Adding Address...
                    </div>
                  ) : (
                    'Add Address'
                  )}
                </button>
              </div>
            </form>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
