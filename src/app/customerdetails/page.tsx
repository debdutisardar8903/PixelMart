'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { savePaymentOrder, getProduct } from '@/lib/database';
import { 
  generateOrderId, 
  createPaymentOrder, 
  loadCashfreeSDK, 
  initiateCashfreePayment,
  validatePhoneNumber,
  validateEmail
} from '@/lib/payment';

function CustomerDetailsContent() {
  const { user, loading } = useAuth();
  const { cartItems } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get order summary from URL params
  const subtotalParam = searchParams.get('subtotal');
  const gstParam = searchParams.get('gst');
  const totalParam = searchParams.get('total');
  const isBuyNow = searchParams.get('buyNow') === 'true';
  
  // Buy Now product details
  const buyNowProduct = isBuyNow ? {
    id: searchParams.get('productId') || '',
    title: searchParams.get('productTitle') || '',
    price: parseFloat(searchParams.get('productPrice') || '0'),
    quantity: parseInt(searchParams.get('quantity') || '1')
  } : null;
  
  const subtotal = subtotalParam ? parseFloat(subtotalParam) : 0;
  const gst = gstParam ? parseFloat(gstParam) : 0;
  const total = totalParam ? parseFloat(totalParam) : 0;

  // Payment states
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: ''
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [imageError, setImageError] = useState(false);
  const [productImage, setProductImage] = useState<string>('');

  // Update customer details when user changes
  useEffect(() => {
    if (user) {
      setCustomerDetails(prev => ({
        ...prev,
        name: user.displayName || prev.name,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  // Load Cashfree SDK on component mount
  useEffect(() => {
    loadCashfreeSDK();
  }, []);

  // Fetch product image for Buy Now purchases
  useEffect(() => {
    if (isBuyNow && buyNowProduct?.id) {
      const fetchProductImage = async () => {
        try {
          const product = await getProduct(buyNowProduct.id);
          if (product?.image) {
            setProductImage(product.image);
          }
        } catch (error) {
          console.error('Error fetching product image:', error);
        }
      };
      fetchProductImage();
    }
  }, [isBuyNow, buyNowProduct?.id]);

  // Redirect if no cart items or user not authenticated (unless it's a buy now purchase)
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
      return;
    }
    
    if (!loading && !isBuyNow && cartItems.length === 0) {
      router.push('/cart');
    }
  }, [user, loading, cartItems, router, isBuyNow]);

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!customerDetails.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!customerDetails.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(customerDetails.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!customerDetails.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!validatePhoneNumber(customerDetails.phone)) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePayment = async () => {
    if (!user || !validateForm()) {
      return;
    }

    setIsProcessingPayment(true);
    
    try {
      // Generate order ID
      const orderId = generateOrderId();
      
      // Prepare products for payment order
      const products = isBuyNow && buyNowProduct ? 
        [{
          productId: buyNowProduct.id,
          title: buyNowProduct.title,
          price: buyNowProduct.price,
          quantity: buyNowProduct.quantity
        }] : 
        cartItems.map(item => ({
          productId: item.productId,
          title: item.title,
          price: item.price,
          quantity: item.quantity
        }));

      // Save payment order to database
      const paymentOrderData = {
        orderId,
        userId: user.uid,
        customerName: customerDetails.name,
        customerEmail: customerDetails.email,
        customerPhone: customerDetails.phone,
        orderAmount: Math.round(total),
        orderStatus: 'CREATED' as const,
        paymentStatus: 'PENDING' as const,
        products
      };

      await savePaymentOrder(paymentOrderData);

      // Create payment order with backend
      const productDetails = isBuyNow && buyNowProduct ? 
        buyNowProduct.title : 
        cartItems.map(item => item.title).join(', ');
      
      const productName = isBuyNow && buyNowProduct ? 
        buyNowProduct.title : 
        (cartItems.length === 1 ? cartItems[0].title : `${cartItems.length} items: ${productDetails}`);
      
      const productIds = isBuyNow && buyNowProduct ? 
        buyNowProduct.id : 
        cartItems.map(item => item.productId).join(',');

      const paymentResponse = await createPaymentOrder({
        orderId,
        orderAmount: Math.round(total),
        customerName: customerDetails.name,
        customerEmail: customerDetails.email,
        customerPhone: customerDetails.phone,
        productName,
        productId: productIds
      });

      if (paymentResponse.success && paymentResponse.payment_session_id) {
        // Initiate Cashfree payment
        initiateCashfreePayment(paymentResponse.payment_session_id, orderId);
      } else {
        throw new Error(paymentResponse.error || 'Failed to create payment order');
      }

    } catch (error) {
      console.error('Payment error:', error);
      alert(error instanceof Error ? error.message : 'Payment failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleBackToCart = () => {
    if (isBuyNow && buyNowProduct) {
      // Go back to the product page
      router.push(`/product/${buyNowProduct.id}`);
    } else {
      // Go back to cart
      router.push('/cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh] pt-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 pt-32 pb-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Customer Details</h1>
          <p className="text-gray-600">Please provide your details to complete the purchase</p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Customer Details Form */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Customer Information</h3>
              
              <form onSubmit={(e) => { e.preventDefault(); handlePayment(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={customerDetails.name}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={customerDetails.email}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email address"
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={customerDetails.phone}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, phone: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      formErrors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter 10-digit phone number"
                    maxLength={10}
                  />
                  {formErrors.phone && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                  )}
                </div>


                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={handleBackToCart}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    {isBuyNow ? 'Back to Product' : 'Back to Cart'}
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessingPayment}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
                  >
                    {isProcessingPayment ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      `Pay ₹${Math.round(total).toLocaleString()}`
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items ({isBuyNow ? 1 : cartItems.length})</span>
                  <span className="font-medium">₹{Math.round(subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST (18%)</span>
                  <span className="font-medium">₹{Math.round(gst).toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Amount</span>
                    <span className="text-blue-600">₹{Math.round(total).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Cart Items Preview */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">{isBuyNow ? 'Product Details' : 'Items in Cart'}</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {isBuyNow && buyNowProduct ? (
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {productImage && !imageError ? (
                          <Image
                            src={productImage}
                            alt={buyNowProduct.title}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                            onError={() => setImageError(true)}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 truncate font-medium">{buyNowProduct.title}</p>
                        <p className="text-gray-500">Qty: {buyNowProduct.quantity}</p>
                      </div>
                      <p className="text-gray-900 font-medium">₹{(buyNowProduct.price * buyNowProduct.quantity).toLocaleString()}</p>
                    </div>
                  ) : (
                    cartItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 text-sm">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.title}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Hide image on error and show fallback
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                      <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                                      </svg>
                                    </div>
                                  `;
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 truncate font-medium">{item.title}</p>
                          <p className="text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-gray-900 font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Accepted Payment Methods */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Accepted Payment Methods</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-center p-2 border border-gray-200 rounded-lg bg-white">
                    <Image
                      src="/Visa.svg"
                      alt="Visa"
                      width={40}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center p-2 border border-gray-200 rounded-lg bg-white">
                    <Image
                      src="/Mastercard.svg"
                      alt="Mastercard"
                      width={40}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center p-2 border border-gray-200 rounded-lg bg-white">
                    <Image
                      src="/RuPay.svg"
                      alt="RuPay"
                      width={40}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center p-2 border border-gray-200 rounded-lg bg-white">
                    <Image
                      src="/UPI.svg"
                      alt="UPI"
                      width={40}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center p-2 border border-gray-200 rounded-lg bg-white">
                    <Image
                      src="/Netbanking-big.svg"
                      alt="Net Banking"
                      width={40}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center p-2 border border-gray-200 rounded-lg bg-white">
                    <Image
                      src="/Wallet.svg"
                      alt="Digital Wallet"
                      width={40}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Secure & encrypted payment</span>
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

// Loading component for Suspense fallback
function CustomerDetailsLoading() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="flex items-center justify-center min-h-[60vh] pt-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
      <Footer />
    </div>
  );
}

// Main component with Suspense boundary
export default function CustomerDetailsPage() {
  return (
    <Suspense fallback={<CustomerDetailsLoading />}>
      <CustomerDetailsContent />
    </Suspense>
  );
}
