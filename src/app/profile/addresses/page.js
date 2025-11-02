'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ref, get, set, push, remove } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from '@/components/contexts/AuthContext';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import BottomNav from '@/components/bottomnav/BottomNav';
import ClientOnly from '@/components/ClientOnly';

export default function AddressesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Address form state
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    email: '',
    phone: '+91'
  });

  // Fetch addresses from Firebase
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const addressesRef = ref(database, `addresses/${user.uid}`);
        const snapshot = await get(addressesRef);
        
        if (snapshot.exists()) {
          const addressesData = snapshot.val();
          const addressesArray = Object.keys(addressesData).map(key => ({
            id: key,
            ...addressesData[key]
          }));
          
          // Sort by creation date (newest first)
          addressesArray.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          
          setAddresses(addressesArray);
          console.log('Addresses fetched:', addressesArray);
        } else {
          console.log('No addresses found');
          setAddresses([]);
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
        setAddresses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddresses();
  }, [user]);

  // Validate form data
  const validateForm = () => {
    if (!addressForm.fullName.trim()) {
      alert('Please enter your full name');
      return false;
    }

    if (!addressForm.email.trim()) {
      alert('Please enter your email address');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(addressForm.email)) {
      alert('Please enter a valid email address');
      return false;
    }

    if (addressForm.phone === '+91' || addressForm.phone.length < 13) {
      alert('Please enter a valid phone number');
      return false;
    }

    // Phone validation (Indian format)
    const cleanPhone = addressForm.phone.replace('+91', '').replace(/\s+/g, '');
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      alert('Please enter a valid 10-digit Indian phone number');
      return false;
    }

    return true;
  };

  // Save address to Firebase
  const handleSaveAddress = async () => {
    if (!user) {
      alert('Please login to save address');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      const addressData = {
        fullName: addressForm.fullName.trim(),
        email: addressForm.email.trim(),
        phone: addressForm.phone.trim(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const addressesRef = ref(database, `addresses/${user.uid}`);
      
      if (editingAddress) {
        // Update existing address
        const addressRef = ref(database, `addresses/${user.uid}/${editingAddress.id}`);
        await set(addressRef, {
          ...addressData,
          createdAt: editingAddress.createdAt // Keep original creation date
        });
        console.log('Address updated successfully');
      } else {
        // Add new address
        const newAddressRef = push(addressesRef);
        await set(newAddressRef, addressData);
        console.log('Address saved successfully');
      }

      // Reset form and refresh addresses
      setAddressForm({
        fullName: '',
        email: '',
        phone: '+91'
      });
      setShowAddForm(false);
      setEditingAddress(null);

      // Refresh addresses list
      const snapshot = await get(addressesRef);
      if (snapshot.exists()) {
        const addressesData = snapshot.val();
        const addressesArray = Object.keys(addressesData).map(key => ({
          id: key,
          ...addressesData[key]
        }));
        addressesArray.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setAddresses(addressesArray);
      }

      alert(editingAddress ? 'Address updated successfully!' : 'Address saved successfully!');
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete address
  const handleDeleteAddress = async (addressId) => {
    if (!user) return;

    const confirmDelete = window.confirm('Are you sure you want to delete this address?');
    if (!confirmDelete) return;

    try {
      const addressRef = ref(database, `addresses/${user.uid}/${addressId}`);
      await remove(addressRef);
      
      // Update local state
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      
      console.log('Address deleted successfully');
      alert('Address deleted successfully!');
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address. Please try again.');
    }
  };

  // Edit address
  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm({
      fullName: address.fullName || '',
      email: address.email || '',
      phone: address.phone || '+91'
    });
    setShowAddForm(true);
  };

  // Cancel form
  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingAddress(null);
    setAddressForm({
      fullName: '',
      email: '',
      phone: '+91'
    });
  };

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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Saved Addresses</h1>
                <p className="text-sm text-gray-600">
                  {!user 
                    ? 'Login to manage your addresses'
                    : addresses.length > 0 
                      ? `${addresses.length} address${addresses.length !== 1 ? 'es' : ''} saved` 
                      : 'No addresses saved yet'
                  }
                </p>
              </div>
              
              {/* Add Address Button */}
              {user && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium"
                >
                  Add Address
                </button>
              )}
            </div>
          </div>

          <ClientOnly>
            {/* Add/Edit Address Form */}
            {showAddForm && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h2>
                
                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={addressForm.fullName}
                      onChange={(e) => setAddressForm({...addressForm, fullName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  {/* Email Address */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={addressForm.email}
                      onChange={(e) => setAddressForm({...addressForm, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Enter your email address"
                      required
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={addressForm.phone}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.startsWith('+91')) {
                          setAddressForm({...addressForm, phone: value});
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="+91 Enter phone number"
                      required
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center space-x-4 pt-4">
                    <button
                      onClick={handleSaveAddress}
                      disabled={isSaving}
                      className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? 'Saving...' : (editingAddress ? 'Update Address' : 'Save Address')}
                    </button>
                    <button
                      onClick={handleCancelForm}
                      disabled={isSaving}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Addresses Content */}
            {isLoading ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading addresses...</p>
              </div>
            ) : !user ? (
              /* Login Required State */
              <div className="text-center py-16">
                <div className="mb-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Login Required</h2>
                  <p className="text-gray-600 mb-6">
                    Please login to manage your saved addresses
                  </p>
                  <button
                    onClick={() => router.push('/auth?redirect=/profile/addresses')}
                    className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium"
                  >
                    Login
                  </button>
                </div>
              </div>
            ) : addresses.length === 0 && !showAddForm ? (
              /* Empty Addresses State */
              <div className="text-center py-16">
                <div className="mb-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">No addresses saved</h2>
                  <p className="text-gray-600 mb-6">
                    Add your first address for faster checkout
                  </p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium"
                  >
                    Add Address
                  </button>
                </div>
              </div>
            ) : (
              /* Addresses List */
              <div className="space-y-4 pb-8">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{address.fullName}</h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {address.email}
                          </p>
                          <p className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {address.phone}
                          </p>
                          {address.createdAt && (
                            <p className="text-xs text-gray-500 mt-2">
                              Added on {formatDate(address.createdAt)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEditAddress(address)}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                          title="Edit address"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(address.id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Delete address"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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
