'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { updateCartItemQuantity, removeFromCart, clearCart as clearUserCart } from '@/lib/database';

export default function CartPage() {
  const { user, loading } = useAuth();
  const { cartItems } = useCart();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  
  // Payment states
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  const handleImageError = (itemId: string) => {
    setImageErrors(prev => new Set([...prev, itemId]));
  };

  const updateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1 || !user) return;
    
    setIsUpdating(true);
    try {
      await updateCartItemQuantity(user.uid, id, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const removeItem = async (id: string) => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      await removeFromCart(user.uid, id);
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const clearCart = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      await clearUserCart(user.uid);
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Failed to clear cart. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const originalTotal = cartItems.reduce((sum, item) => sum + ((item.originalPrice || item.price) * item.quantity), 0);
  const savings = originalTotal - subtotal;
  const gst = subtotal * 0.18; // 18% GST (Indian tax)
  const total = subtotal + gst;

  const handleCheckout = () => {
    if (!user) {
      router.push('/auth');
      return;
    }
    
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }
    
    // Navigate to customer details page with order summary
    const params = new URLSearchParams({
      subtotal: subtotal.toString(),
      gst: gst.toString(),
      total: total.toString()
    });
    router.push(`/customerdetails?${params.toString()}`);
  };

  const handleContinueShopping = () => {
    router.push('/');
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

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
            <p className="text-gray-600">
              {cartItems.length === 0 
                ? 'Your cart is empty' 
                : `${cartItems.length} item${cartItems.length > 1 ? 's' : ''} in your cart`
              }
            </p>
          </div>

          {cartItems.length === 0 ? (
            /* Empty Cart State */
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.00014 14H18.1359C19.1487 14 19.6551 14 20.0582 13.8112C20.4134 13.6448 20.7118 13.3777 20.9163 13.0432C21.1485 12.6633 21.2044 12.16 21.3163 11.1534L21.9013 5.88835C21.9355 5.58088 21.9525 5.42715 21.9031 5.30816C21.8597 5.20366 21.7821 5.11697 21.683 5.06228C21.5702 5 21.4155 5 21.1062 5H4.50014M2 2H3.24844C3.51306 2 3.64537 2 3.74889 2.05032C3.84002 2.09463 3.91554 2.16557 3.96544 2.25376C4.02212 2.35394 4.03037 2.48599 4.04688 2.7501L4.95312 17.2499C4.96963 17.514 4.97788 17.6461 5.03456 17.7462C5.08446 17.8344 5.15998 17.9054 5.25111 17.9497C5.35463 18 5.48694 18 5.75156 18H19M7.5 21.5H7.51M16.5 21.5H16.51M8 21.5C8 21.7761 7.77614 22 7.5 22C7.22386 22 7 21.7761 7 21.5C7 21.2239 7.22386 21 7.5 21C7.77614 21 8 21.2239 8 21.5ZM17 21.5C17 21.7761 16.7761 22 16.5 22C16.2239 22 16 21.7761 16 21.5C16 21.2239 16.2239 21 16.5 21C16.7761 21 17 21.2239 17 21.5Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Your cart is empty</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
              </p>
              <button
                onClick={handleContinueShopping}
                className="bg-gray-900 hover:bg-black text-white font-medium px-8 py-3 rounded-lg transition-colors duration-200"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Cart Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900">Cart Items</h2>
                      <button
                        onClick={clearCart}
                        className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                      >
                        Clear Cart
                      </button>
                    </div>
                  </div>

                  {/* Cart Items List */}
                  <div className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <div key={item.id} className="p-6">
                        <div className="flex items-start space-x-4">
                          {/* Product Image */}
                          <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative">
                            {imageErrors.has(item.id) ? (
                              // Fallback placeholder
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            ) : (
                              <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                  console.error('Cart image failed to load:', item.image);
                                  handleImageError(item.id);
                                }}
                                onLoad={() => {
                                  console.log('Cart image loaded successfully:', item.image);
                                }}
                              />
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                                <p className="text-sm text-gray-600 mb-2">{item.category}</p>
                                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.description}</p>
                                
                                <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
                                  <span>{item.downloadSize}</span>
                                  <span>{item.fileFormat}</span>
                                </div>

                                {/* Quantity Controls */}
                                <div className="flex items-center space-x-3">
                                  <span className="text-sm text-gray-600">Quantity:</span>
                                  <div className="flex items-center border border-gray-300 rounded-lg">
                                    <button
                                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                      disabled={item.quantity <= 1 || isUpdating}
                                      className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                      </svg>
                                    </button>
                                    <span className="px-4 py-2 text-sm font-medium min-w-[3rem] text-center">
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                      disabled={isUpdating}
                                      className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Price and Remove */}
                              <div className="text-right ml-4">
                                <div className="mb-2">
                                  <span className="text-lg font-semibold text-gray-900">
                                    ₹{Math.round(item.price * item.quantity).toLocaleString()}
                                  </span>
                                  {item.originalPrice && (
                                    <div className="text-sm text-gray-500 line-through">
                                      ₹{Math.round(item.originalPrice * item.quantity).toLocaleString()}
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={() => removeItem(item.id)}
                                  className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Continue Shopping */}
                <div className="mt-6">
                  <button
                    onClick={handleContinueShopping}
                    className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Continue Shopping</span>
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                      <span className="font-medium">₹{Math.round(subtotal).toLocaleString()}</span>
                    </div>
                    
                    {savings > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">You save</span>
                        <span className="font-medium text-green-600">-₹{Math.round(savings).toLocaleString()}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">GST (18%)</span>
                      <span className="font-medium">₹{Math.round(gst).toLocaleString()}</span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold text-gray-900">Total</span>
                        <span className="text-lg font-semibold text-gray-900">₹{Math.round(total).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-4 rounded-lg transition-colors duration-200 mb-4"
                  >
                    {user ? 'Proceed to Checkout' : 'Sign In to Checkout'}
                  </button>

                  {/* Security Badge */}
                  <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Secure checkout with SSL encryption</span>
                  </div>

                  {/* Payment Methods */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center mb-3">We accept</p>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="bg-white border rounded px-2 py-1">
                        <span className="text-blue-600 font-bold text-xs">VISA</span>
                      </div>
                      <div className="bg-white border rounded px-2 py-1">
                        <span className="text-red-600 font-bold text-xs">MC</span>
                      </div>
                      <div className="bg-blue-600 rounded px-2 py-1">
                        <span className="text-white font-bold text-xs">PayPal</span>
                      </div>
                      <div className="bg-orange-500 rounded px-2 py-1">
                        <span className="text-white font-bold text-xs">UPI</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Form Modal */}
      {showCheckoutForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Checkout Details</h2>
                <button
                  onClick={() => setShowCheckoutForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items ({cartItems.length})</span>
                    <span className="font-medium">₹{Math.round(subtotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">GST (18%)</span>
                    <span className="font-medium">₹{Math.round(gst).toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total Amount</span>
                      <span>₹{Math.round(total).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>


              {/* Security Note */}
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center text-sm text-green-800">
                  <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Your payment is secured by Cashfree with 256-bit SSL encryption</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
