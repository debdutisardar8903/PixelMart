'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import { useCart } from '@/components/contexts/CartContext';
import { useWishlist } from '@/components/contexts/WishlistContext';
import ClientOnly from '@/components/ClientOnly';

export default function CartPage() {
  const router = useRouter();
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartCount } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const total = subtotal;

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(id, newQuantity);
  };

  const handleRemoveItem = (id) => {
    removeFromCart(id);
  };

  const handleMoveToWishlist = (item) => {
    const wishlistItem = {
      id: item.id,
      productId: item.productId || item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      originalPrice: item.originalPrice
    };
    
    if (!isInWishlist(item.id)) {
      addToWishlist(wishlistItem);
    }
    removeFromCart(item.id);
  };

  const handleCheckout = () => {
    if (cartCount === 0) {
      alert('Your cart is empty!');
      return;
    }
    router.push('/checkout');
  };

  const CartIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6.5-5v5a2 2 0 01-2 2H9a2 2 0 01-2-2v-5m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
    </svg>
  );

  const WishlistIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );

  return (
    <div className="font-sans min-h-screen bg-white flex flex-col">
      <div className="hidden sm:block">
        <Header />
      </div>
      
      <div className="flex-1 pt-6 sm:pt-24 px-4">
        <div className="mx-auto max-w-6xl">
          {/* Back Button */}
          <div className="mb-4 sm:hidden">
            <button
              onClick={() => router.push('/')}
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
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Shopping Cart</h1>
                <p className="text-sm text-gray-600">
                  {cartCount > 0 ? `${cartCount} item${cartCount !== 1 ? 's' : ''} in your cart` : 'Your cart is empty'}
                </p>
              </div>
              
              {/* Clear Cart Button */}
              {cartCount > 0 && (
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-800 font-medium transition-colors duration-200"
                >
                  Clear Cart
                </button>
              )}
            </div>
          </div>

          {/* Cart Content */}
          {cartCount === 0 ? (
            /* Empty Cart State */
            <div className="text-center py-16">
              <div className="mb-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CartIcon />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-600 mb-6">
                  Add some products to your cart to get started
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          ) : (
            /* Cart Items */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items List */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Cart Items</h2>
                    
                    <ClientOnly>
                      <div className="space-y-4">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 p-4 border border-gray-100 rounded-lg">
                            {/* Mobile: Top Row - Image and Basic Info */}
                            <div className="flex items-start space-x-4 sm:flex-1">
                              {/* Product Image */}
                              <div className="flex-shrink-0">
                                <Link href={`/product/${item.id}`}>
                                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg overflow-hidden">
                                    <Image
                                      src={item.image}
                                      alt={item.name}
                                      width={80}
                                      height={80}
                                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                                    />
                                  </div>
                                </Link>
                              </div>

                              {/* Product Details */}
                              <div className="flex-1 min-w-0">
                                <Link href={`/product/${item.id}`}>
                                  <h3 className="font-medium text-gray-900 hover:text-gray-700 transition-colors line-clamp-2 text-sm sm:text-base">
                                    {item.name}
                                  </h3>
                                </Link>
                                
                                {/* Price */}
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-base sm:text-lg font-bold text-gray-900">₹{item.price}</span>
                                  {item.originalPrice && (
                                    <span className="text-xs sm:text-sm text-gray-500 line-through">₹{item.originalPrice}</span>
                                  )}
                                </div>

                                {/* Actions - Mobile: Show below price, Desktop: Show below price */}
                                <div className="flex items-center space-x-4 mt-2 sm:mt-2">
                                  <button
                                    onClick={() => handleMoveToWishlist(item)}
                                    className="flex items-center space-x-1 text-xs sm:text-sm text-gray-600 hover:text-gray-800 transition-colors"
                                  >
                                    <WishlistIcon />
                                    <span className="hidden xs:inline">Move to Wishlist</span>
                                    <span className="xs:hidden">Wishlist</span>
                                  </button>
                                  <button
                                    onClick={() => handleRemoveItem(item.id)}
                                    className="text-xs sm:text-sm text-red-600 hover:text-red-800 transition-colors"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Mobile: Bottom Row - Quantity and Total */}
                            <div className="flex items-center justify-between sm:flex-col sm:items-end sm:space-y-2">
                              {/* Quantity Controls */}
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600 sm:hidden">Qty:</span>
                                <button
                                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                  className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors text-sm"
                                  disabled={item.quantity <= 1}
                                >
                                  -
                                </button>
                                <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                                <button
                                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                  className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors text-sm"
                                >
                                  +
                                </button>
                              </div>
                              
                              {/* Item Total */}
                              <div className="text-right">
                                <span className="text-sm font-medium text-gray-900">
                                  ₹{(item.price * item.quantity).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ClientOnly>
                  </div>
                </div>

                {/* Continue Shopping */}
                <div className="mt-6">
                  <Link
                    href="/"
                    className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Continue Shopping
                  </Link>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                  
                  <div className="space-y-3">
                    {/* Subtotal */}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal ({cartCount} items)</span>
                      <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                    </div>
                    
                    {/* Shipping */}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium text-green-600">Free</span>
                    </div>
                    
                    <hr className="my-4" />
                    
                    {/* Total */}
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>₹{total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full mt-6 bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
                  </button>

                  {/* Payment Info */}
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                      Secure checkout with SSL encryption
                    </p>
                    <div className="flex justify-center items-center space-x-2 mt-2">
                      <div className="w-6 h-4 bg-blue-600 rounded text-xs text-white flex items-center justify-center font-bold">
                        VISA
                      </div>
                      <div className="w-6 h-4 bg-red-600 rounded text-xs text-white flex items-center justify-center font-bold">
                        MC
                      </div>
                      <div className="w-6 h-4 bg-gray-800 rounded text-xs text-white flex items-center justify-center font-bold">
                        UPI
                      </div>
                    </div>
                  </div>

                  {/* Savings Display */}
                  {cartItems.some(item => item.originalPrice) && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-800">You're saving:</span>
                        <span className="text-sm font-medium text-green-800">
                          ₹{cartItems.reduce((savings, item) => {
                            if (item.originalPrice) {
                              return savings + ((item.originalPrice - item.price) * item.quantity);
                            }
                            return savings;
                          }, 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer - Always at bottom */}
      <Footer />
    </div>
  );
}
