'use client';

// Generate order ID in the format: WX123456789105678
export const generateOrderId = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `WX${timestamp.slice(-10)}${random}`;
};

// Get backend URL from environment
const getBackendUrl = () => {
  // Use localhost for development, production URL as fallback
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
  }
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'wallineex-backend-production.up.railway.app';
};

// Get frontend URL from environment
const getFrontendUrl = () => {
  // Use localhost for development, production URL as fallback
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
  }
  return process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://www.wallineex.store';
};

// Create payment order
export const createPaymentOrder = async (orderData) => {
  try {
    console.log('Creating payment order:', orderData);
    
    // Validate and format order amount
    const orderAmount = parseFloat(orderData.orderAmount);
    
    // Check minimum amount (Cashfree minimum is ₹1.00)
    if (orderAmount < 1) {
      throw new Error('Order amount must be at least ₹1.00');
    }
    
    // Round to 2 decimal places to avoid precision issues
    const formattedAmount = Math.round(orderAmount * 100) / 100;
    
    console.log('Original amount:', orderData.orderAmount, 'Formatted amount:', formattedAmount);
    
    const backendUrl = getBackendUrl();
    console.log('Using backend URL:', backendUrl);
    
    const response = await fetch(`${backendUrl}/api/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': window.location.origin,
      },
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify({
        orderId: orderData.orderId,
        orderAmount: formattedAmount,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        wallpaperName: orderData.productName, // Using wallpaperName for compatibility
        wallpaperId: orderData.productId,
        returnUrl: `${getFrontendUrl()}/payment-success?order_id=${orderData.orderId}`,
        notifyUrl: `${backendUrl}/api/payment-webhook` 
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    const result = await response.json();
    console.log('Payment order response:', result);

    if (!response.ok) {
      // Enhanced error handling for authentication issues
      if (response.status === 401) {
        throw new Error('Authentication failed. Please check backend configuration.');
      } else if (response.status === 403) {
        throw new Error('Access forbidden. CORS or authentication issue.');
      } else if (response.status === 500) {
        throw new Error('Server error. Please check backend logs.');
      }
      throw new Error(result.error || `HTTP ${response.status}: Failed to create payment order`);
    }

    return result;
  } catch (error) {
    console.error('Error creating payment order:', error);
    
    // Enhanced error logging for debugging
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('Network error - check if backend is accessible:', getBackendUrl());
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment order'
    };
  }
};

// Verify payment status
export const verifyPayment = async (orderId) => {
  try {
    console.log('Verifying payment for order:', orderId);
    
    const backendUrl = getBackendUrl();
    console.log('Using backend URL for verification:', backendUrl);
    
    const response = await fetch(`${backendUrl}/api/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': window.location.origin,
      },
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify({ orderId }),
    });

    console.log('Verification response status:', response.status);

    const result = await response.json();
    console.log('Payment verification response:', result);

    if (!response.ok) {
      // Enhanced error handling for authentication issues
      if (response.status === 401) {
        throw new Error('Authentication failed during verification. Please check backend configuration.');
      } else if (response.status === 403) {
        throw new Error('Access forbidden during verification. CORS or authentication issue.');
      } else if (response.status === 429) {
        throw new Error('Too many verification requests. Please wait and try again.');
      } else if (response.status === 500) {
        throw new Error('Server error during verification. Please check backend logs.');
      }
      throw new Error(result.error || `HTTP ${response.status}: Failed to verify payment`);
    }

    // Enhanced status checking - check multiple possible locations for status
    const orderStatus = result.order_status || result.order_data?.order_status;
    const paymentStatus = result.payment_status || result.order_data?.payment_status;
    const isPaid = orderStatus === 'PAID' || paymentStatus === 'SUCCESS';
    
    const enhancedResult = {
      ...result,
      order_status: orderStatus,
      payment_status: isPaid ? 'SUCCESS' : (paymentStatus || 'PENDING'),
      // Ensure order_data is available
      order_data: result.order_data || {
        order_status: orderStatus,
        order_amount: result.order_amount,
        order_id: result.order_id
      }
    };

    console.log('Enhanced verification result:', enhancedResult);
    return enhancedResult;
  } catch (error) {
    console.error('Error verifying payment:', error);
    
    // Enhanced error logging for debugging
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('Network error during verification - check if backend is accessible:', getBackendUrl());
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify payment'
    };
  }
};

// Initialize Cashfree checkout
export const initiateCashfreePayment = (paymentSessionId, orderId) => {
  try {
    // Check if Cashfree SDK is loaded
    if (typeof window !== 'undefined' && window.Cashfree) {
      // Use explicit environment variable or fallback to NODE_ENV
      const cashfreeMode = process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT || 
        (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox');
      
      console.log('Initializing Cashfree with mode:', cashfreeMode);
      
      const cashfree = window.Cashfree({
        mode: cashfreeMode
      });

      const checkoutOptions = {
        paymentSessionId: paymentSessionId,
        redirectTarget: '_self'
      };

      console.log('Initiating Cashfree payment with options:', checkoutOptions);
      
      cashfree.checkout(checkoutOptions).then((result) => {
        console.log('Cashfree checkout result:', result);
        if (result.error) {
          console.error('Payment failed:', result.error);
          // Redirect to failure page
          window.location.href = `/payment-failure?order_id=${orderId}&error=${encodeURIComponent(result.error.message)}`;
        }
        if (result.redirect) {
          console.log('Payment completed, redirecting...');
          // Payment completed, will redirect automatically
        }
      }).catch((error) => {
        console.error('Cashfree checkout error:', error);
        window.location.href = `/payment-failure?order_id=${orderId}&error=${encodeURIComponent(error.message)}`;
      });
    } else {
      console.error('Cashfree SDK not loaded');
      alert('Payment system not available. Please try again later.');
    }
  } catch (error) {
    console.error('Error initiating payment:', error);
    alert('Failed to initiate payment. Please try again.');
  }
};

// Load Cashfree SDK
export const loadCashfreeSDK = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window object not available'));
      return;
    }

    // Check if already loaded
    if (window.Cashfree) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = process.env.NODE_ENV === 'production' 
      ? 'https://sdk.cashfree.com/js/v3/cashfree.js'
      : 'https://sdk.cashfree.com/js/v3/cashfree.js'; // Same URL for both environments
    
    script.onload = () => {
      console.log('Cashfree SDK loaded successfully');
      resolve();
    };
    
    script.onerror = () => {
      console.error('Failed to load Cashfree SDK');
      reject(new Error('Failed to load Cashfree SDK'));
    };

    document.head.appendChild(script);
  });
};

// Format currency for display
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Validate phone number (Indian format)
export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

// Validate email
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Debug function to test backend connectivity
export const testBackendConnection = async () => {
  try {
    const backendUrl = getBackendUrl();
    console.log('Testing backend connection to:', backendUrl);
    
    const response = await fetch(`${backendUrl}/api/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Origin': window.location.origin,
      },
      mode: 'cors',
      credentials: 'omit',
    });
    
    console.log('Health check response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('Backend health check successful:', result);
      return { success: true, data: result };
    } else {
      console.error('Backend health check failed:', response.status);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return { success: false, error: error.message };
  }
};
