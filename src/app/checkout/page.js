'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ref, get, set } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from '@/components/contexts/AuthContext';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import { useCart } from '@/components/contexts/CartContext';
import ClientOnly from '@/components/ClientOnly';
import { 
  generateOrderId, 
  createPaymentOrder, 
  initiateCashfreePayment, 
  loadCashfreeSDK,
  validateEmail,
  validatePhoneNumber,
  testBackendConnection 
} from '@/lib/cashfree';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { cartItems, clearCart } = useCart();
  
  // Get product data from URL params (for Buy Now)
  const productId = searchParams.get('productId');
  const quantity = parseInt(searchParams.get('quantity') || '1');
  
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Address form state
  const [address, setAddress] = useState({
    name: '',
    email: '',
    phone: '+91'
  });
  
  // Saved addresses state
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  
  // Coupon state
  const [showCoupons, setShowCoupons] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [couponValidating, setCouponValidating] = useState(false);
  const [couponError, setCouponError] = useState('');
  
  // Payment state
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    console.log('Checkout useEffect - productId:', productId, 'quantity:', quantity);
    
    const fetchProductData = async () => {
      try {
        setIsLoading(true);
        
        if (productId) {
          // Buy Now - single product checkout
          console.log('Fetching product with ID:', productId);
          const productRef = ref(database, `products/${productId}`);
          const snapshot = await get(productRef);
          
          if (snapshot.exists()) {
            const productData = snapshot.val();
            const product = {
              id: productId,
              name: productData.name || '',
              image: productData.image || '',
              images: productData.images || [productData.image || ''],
              price: productData.price || 0,
              originalPrice: productData.originalPrice || null,
              discount: productData.discount || null,
              rating: productData.rating || 0,
              reviews: productData.reviews || 0,
              description: productData.description || '',
              shortDescription: productData.shortDescription || '',
              category: productData.category || '',
              ...productData // Include any additional fields
            };
            
            const checkoutItem = { ...product, quantity };
            console.log('Setting checkout item from database:', checkoutItem);
            setCheckoutItems([checkoutItem]);
          } else {
            console.log('Product not found in database!');
            setCheckoutItems([]);
          }
        } else {
          // Cart checkout - multiple items
          console.log('Using cart items:', cartItems);
          setCheckoutItems(cartItems);
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
        setCheckoutItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, [productId, quantity, cartItems]);

  // Fetch coupons from database
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setCouponsLoading(true);
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
              isActive: couponsData[key].isActive !== false, // Default to true if not specified
              ...couponsData[key] // Include any additional fields
            }))
            .filter(coupon => coupon.isActive); // Only show active coupons
          
          setAvailableCoupons(couponsArray);
          console.log('Coupons fetched from database:', couponsArray);
        } else {
          console.log('No coupons found in database');
          setAvailableCoupons([]);
        }
      } catch (error) {
        console.error('Error fetching coupons:', error);
        setAvailableCoupons([]);
      } finally {
        setCouponsLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  // Load Cashfree SDK on component mount
  useEffect(() => {
    const initializeCashfree = async () => {
      try {
        await loadCashfreeSDK();
        console.log('Cashfree SDK loaded successfully');
      } catch (error) {
        console.error('Failed to load Cashfree SDK:', error);
      }
    };

    initializeCashfree();
  }, []);

  // Fetch saved addresses when user is available
  useEffect(() => {
    const fetchSavedAddresses = async () => {
      if (!user) {
        setSavedAddresses([]);
        return;
      }

      try {
        setLoadingAddresses(true);
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
          
          setSavedAddresses(addressesArray);
          console.log('Saved addresses loaded:', addressesArray);
        } else {
          setSavedAddresses([]);
        }
      } catch (error) {
        console.error('Error fetching saved addresses:', error);
        setSavedAddresses([]);
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchSavedAddresses();
  }, [user]);

  // Validate manual coupon entry
  const validateManualCoupon = async (code) => {
    try {
      setCouponValidating(true);
      setCouponError('');
      
      const couponsRef = ref(database, 'coupons');
      const snapshot = await get(couponsRef);
      
      if (snapshot.exists()) {
        const couponsData = snapshot.val();
        const couponEntry = Object.entries(couponsData).find(([key, coupon]) => 
          coupon.code && coupon.code.toUpperCase() === code.toUpperCase()
        );
        
        if (couponEntry) {
          const [couponId, couponData] = couponEntry;
          
          // Check if coupon is active
          if (couponData.isActive === false) {
            setCouponError('This coupon is no longer active');
            return null;
          }
          
          const validCoupon = {
            id: couponId,
            code: couponData.code,
            discount: couponData.discount || 0,
            type: couponData.type || 'percentage',
            description: couponData.description || '',
            isActive: couponData.isActive !== false,
            ...couponData
          };
          
          console.log('Manual coupon validated:', validCoupon);
          return validCoupon;
        } else {
          setCouponError('Invalid coupon code');
          return null;
        }
      } else {
        setCouponError('No coupons available');
        return null;
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      setCouponError('Error validating coupon. Please try again.');
      return null;
    } finally {
      setCouponValidating(false);
    }
  };

  // Handle manual coupon application
  const handleApplyManualCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    
    const validCoupon = await validateManualCoupon(couponCode.trim());
    if (validCoupon) {
      setSelectedCoupon(validCoupon);
      setCouponCode('');
      setShowCoupons(false);
      setCouponError('');
    }
  };

  // Calculate totals
  const subtotal = checkoutItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const savings = checkoutItems.reduce((total, item) => {
    if (item.originalPrice) {
      return total + ((item.originalPrice - item.price) * item.quantity);
    }
    return total;
  }, 0);
  
  let discount = 0;
  if (selectedCoupon) {
    if (selectedCoupon.type === 'percentage') {
      discount = (subtotal * selectedCoupon.discount) / 100;
    } else {
      discount = selectedCoupon.discount;
    }
  }
  
  const total = subtotal - discount;

  const handleApplyCoupon = (coupon) => {
    setSelectedCoupon(coupon);
    setCouponCode(coupon.code);
    setShowCoupons(false);
  };

  const handleRemoveCoupon = () => {
    setSelectedCoupon(null);
    setCouponCode('');
  };

  // Handle selecting a saved address
  const handleSelectSavedAddress = (savedAddress) => {
    setAddress({
      name: savedAddress.fullName,
      email: savedAddress.email,
      phone: savedAddress.phone
    });
    setShowSavedAddresses(false);
    console.log('Selected saved address:', savedAddress);
  };

  // Save order to Firebase
  const saveOrderToDatabase = async (orderData) => {
    try {
      const orderRef = ref(database, `orders/${orderData.orderId}`);
      await set(orderRef, orderData);
      console.log('Order saved to database:', orderData);
    } catch (error) {
      console.error('Error saving order to database:', error);
      throw error;
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      alert('Please login to place an order');
      router.push('/auth?redirect=/checkout');
      return;
    }

    // Validate form data
    if (!address.name || !address.email || address.phone === '+91') {
      alert('Please fill in all address details');
      return;
    }

    if (!validateEmail(address.email)) {
      alert('Please enter a valid email address');
      return;
    }

    const cleanPhone = address.phone.replace('+91', '').replace(/\s+/g, '');
    if (!validatePhoneNumber(cleanPhone)) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    if (checkoutItems.length === 0) {
      alert('No items in your order');
      return;
    }

    // Validate order amount - Cashfree minimum is ₹1.00
    if (total < 1) {
      alert('Minimum order amount is ₹1.00');
      return;
    }

    // Round amount to 2 decimal places to avoid precision issues
    const roundedTotal = Math.round(total * 100) / 100;

    setIsProcessingPayment(true);
    setPaymentError('');

    try {
      // Test backend connection first
      console.log('Testing backend connection before payment...');
      const connectionTest = await testBackendConnection();
      if (!connectionTest.success) {
        throw new Error(`Backend connection failed: ${connectionTest.error}`);
      }
      console.log('Backend connection successful:', connectionTest.data);

      // Generate order ID
      const orderId = generateOrderId();
      console.log('Generated order ID:', orderId);
      
      // Prepare order data for database
      const orderData = {
        orderId: orderId,
        userId: user.uid,
        products: checkoutItems.map(item => ({
          id: item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          downloadUrl: item.downloadUrl || null
        })),
        totalAmount: roundedTotal,
        paymentStatus: 'PENDING',
        paymentDate: Date.now(),
        customerInfo: {
          name: address.name,
          email: address.email,
          phone: address.phone
        },
        couponUsed: selectedCoupon ? {
          code: selectedCoupon.code,
          discount: discount
        } : null
      };

      // Save order to database first
      console.log('Saving order to database...');
      await saveOrderToDatabase(orderData);
      console.log('Order saved successfully');

      // Prepare payment order data
      const paymentOrderData = {
        orderId: orderId,
        orderAmount: roundedTotal,
        customerName: address.name,
        customerEmail: address.email,
        customerPhone: address.phone.replace('+91', '').replace(/\s+/g, ''),
        productName: checkoutItems.length === 1 
          ? checkoutItems[0].name 
          : `${checkoutItems.length} items from Wallineex Store`,
        productId: checkoutItems.length === 1 
          ? checkoutItems[0].id 
          : 'multiple'
      };

      console.log('Creating payment order with data:', paymentOrderData);
      console.log('Current origin:', window.location.origin);

      // Create payment order with Cashfree
      const paymentResponse = await createPaymentOrder(paymentOrderData);
      console.log('Payment order response received:', paymentResponse);

      if (paymentResponse.success && paymentResponse.payment_session_id) {
        console.log('Payment order created successfully, initiating Cashfree payment...');
        
        // Initiate Cashfree payment
        initiateCashfreePayment(paymentResponse.payment_session_id, orderId);
      } else {
        console.error('Payment order creation failed:', paymentResponse);
        throw new Error(paymentResponse.error || 'Failed to create payment order');
      }

    } catch (error) {
      console.error('Error processing payment:', error);
      
      // Enhanced error message based on error type
      let errorMessage = error.message || 'Failed to process payment. Please try again.';
      
      if (error.message.includes('Authentication failed')) {
        errorMessage = 'Authentication failed. Please check your internet connection and try again.';
      } else if (error.message.includes('CORS')) {
        errorMessage = 'Connection issue. Please refresh the page and try again.';
      } else if (error.message.includes('Backend connection failed')) {
        errorMessage = 'Payment service temporarily unavailable. Please try again in a few moments.';
      }
      
      setPaymentError(errorMessage);
      
      // Update order status to failed if it was created
      // This is optional - you might want to keep it as PENDING for retry
    } finally {
      setIsProcessingPayment(false);
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
              onClick={() => router.back()}
              className="flex items-center justify-center w-12 h-12 bg-gray-50 border-2 border-gray-300 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Order Summary</h1>
            <p className="text-sm text-gray-600">Review your order and complete your purchase</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Address & Items */}
            <div className="space-y-6">
              {/* Address Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Delivery Information</h2>
                  {user && savedAddresses.length > 0 && (
                    <button
                      onClick={() => setShowSavedAddresses(!showSavedAddresses)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {showSavedAddresses ? 'Hide' : 'Use Saved Address'}
                    </button>
                  )}
                </div>

                {/* Saved Addresses Dropdown */}
                {showSavedAddresses && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Select a saved address:</h3>
                    {loadingAddresses ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin mr-2"></div>
                        <span className="text-sm text-gray-600">Loading addresses...</span>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {savedAddresses.map((savedAddress) => (
                          <button
                            key={savedAddress.id}
                            onClick={() => handleSelectSavedAddress(savedAddress)}
                            className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-white hover:border-gray-300 transition-colors"
                          >
                            <div className="font-medium text-gray-900">{savedAddress.fullName}</div>
                            <div className="text-sm text-gray-600">{savedAddress.email}</div>
                            <div className="text-sm text-gray-600">{savedAddress.phone}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={address.name}
                      onChange={(e) => setAddress({...address, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={address.email}
                      onChange={(e) => setAddress({...address, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Enter your email address"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={address.phone}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.startsWith('+91')) {
                          setAddress({...address, phone: value});
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="+91 Enter phone number"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
                
                <ClientOnly>
                  <div className="space-y-4">
                    {checkoutItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-3 border border-gray-100 rounded-lg">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{item.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm font-bold text-gray-900">₹{item.price}</span>
                            {item.originalPrice && (
                              <span className="text-xs text-gray-500 line-through">₹{item.originalPrice}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                          <div className="text-sm font-medium text-gray-900">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ClientOnly>
              </div>
            </div>

            {/* Right Column - Price Details & Payment */}
            <div className="space-y-6">
              {/* Coupon Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Apply Coupon</h2>
                
                {!selectedCoupon ? (
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          setCouponError(''); // Clear error when user types
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && couponCode.trim() && !couponValidating) {
                            handleApplyManualCoupon();
                          }
                        }}
                        className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                          couponError ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter coupon code"
                        disabled={couponValidating}
                      />
                      {couponCode.trim() ? (
                        <button
                          onClick={handleApplyManualCoupon}
                          disabled={couponValidating}
                          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          {couponValidating ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Applying...</span>
                            </>
                          ) : (
                            <span>Apply</span>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowCoupons(!showCoupons)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Browse
                        </button>
                      )}
                    </div>
                    
                    {/* Error Message */}
                    {couponError && (
                      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                        {couponError}
                      </div>
                    )}
                    
                    {showCoupons && (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {couponsLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                            <span className="ml-2 text-sm text-gray-600">Loading coupons...</span>
                          </div>
                        ) : availableCoupons.length > 0 ? (
                          availableCoupons.map((coupon) => (
                            <div
                              key={coupon.id || coupon.code}
                              onClick={() => handleApplyCoupon(coupon)}
                              className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium text-gray-900">{coupon.code}</div>
                                  <div className="text-sm text-gray-600">{coupon.description}</div>
                                </div>
                                <div className="text-sm font-medium text-green-600">
                                  {coupon.type === 'percentage' ? `${coupon.discount}% OFF` : `₹${coupon.discount} OFF`}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4">
                            <div className="text-sm text-gray-500">No active coupons available</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <div className="font-medium text-green-800">{selectedCoupon.code} Applied</div>
                      <div className="text-sm text-green-600">{selectedCoupon.description}</div>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Price Details */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Price Details</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({checkoutItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                  </div>
                  
                  {savings > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Product Savings</span>
                      <span>-₹{savings.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {selectedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon Discount ({selectedCoupon.code})</span>
                      <span>-₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  
                  <hr className="my-3" />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                  
                  {(savings > 0 || selectedCoupon) && (
                    <div className="text-sm text-green-600">
                      You will save ₹{(savings + discount).toLocaleString()} on this order
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Error */}
              {paymentError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-red-800 text-sm">{paymentError}</span>
                  </div>
                </div>
              )}

              {/* Payment Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isProcessingPayment}
                className="w-full bg-black text-white py-4 px-6 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isProcessingPayment ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Payment...</span>
                  </div>
                ) : (
                  `Pay ₹${total.toLocaleString()}`
                )}
              </button>

              {/* Security Info */}
              <div className="text-center text-sm text-gray-600">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Secure SSL encrypted payment</span>
                </div>
                <div className="flex justify-center items-center space-x-2">
                  <div className="w-8 h-5 bg-blue-600 rounded text-xs text-white flex items-center justify-center font-bold">VISA</div>
                  <div className="w-8 h-5 bg-red-600 rounded text-xs text-white flex items-center justify-center font-bold">MC</div>
                  <div className="w-8 h-5 bg-gray-800 rounded text-xs text-white flex items-center justify-center font-bold">UPI</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Always at bottom */}
      <Footer />
    </div>
  );
}

// Loading component for Suspense fallback
function CheckoutLoading() {
  return (
    <div className="font-sans min-h-screen bg-white flex flex-col">
      <div className="hidden sm:block">
        <Header />
      </div>
      <div className="flex-1 pt-6 sm:pt-24 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading checkout...</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Main export component with Suspense boundary
export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutContent />
    </Suspense>
  );
}
