'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import { useWishlist } from '@/components/contexts/WishlistContext';
import { useCart } from '@/components/contexts/CartContext';
import ClientOnly from '@/components/ClientOnly';

export default function WishlistPage() {
  const router = useRouter();
  const { wishlistItems, removeFromWishlist, clearWishlist, wishlistCount } = useWishlist();
  const { addToCart } = useCart();
  const [hoveredProduct, setHoveredProduct] = useState(null);

  const handleRemoveFromWishlist = (productId) => {
    removeFromWishlist(productId);
  };

  const handleAddToCart = (product) => {
    const cartItem = {
      id: product.id,
      productId: product.productId || product.id,
      name: product.name,
      title: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      originalPrice: product.originalPrice,
      category: 'digital',
      downloadSize: 'Unknown'
    };
    
    addToCart(cartItem, 1);
    alert(`Added ${product.name} to cart!`);
  };

  const handleMoveToCart = (product) => {
    handleAddToCart(product);
    handleRemoveFromWishlist(product.id);
  };

  const WishlistIcon = ({ filled = true }) => (
    <svg className="w-5 h-5" fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
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
                <h1 className="text-2xl font-bold text-gray-900 mb-1">My Wishlist</h1>
                <p className="text-sm text-gray-600">
                  {wishlistCount > 0 ? `${wishlistCount} item${wishlistCount !== 1 ? 's' : ''} saved for later` : 'No items in your wishlist'}
                </p>
              </div>
              
              {/* Clear Wishlist Button */}
              {wishlistCount > 0 && (
                <button
                  onClick={clearWishlist}
                  className="text-red-600 hover:text-red-800 font-medium transition-colors duration-200"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Wishlist Content */}
          {wishlistCount === 0 ? (
            /* Empty Wishlist State */
            <div className="text-center py-16">
              <div className="mb-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <WishlistIcon filled={false} />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
                <p className="text-gray-600 mb-6">
                  Save items you love by clicking the heart icon on any product
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
            /* Wishlist Items Grid */
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              <ClientOnly>
                {wishlistItems.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300"
                    onMouseEnter={() => setHoveredProduct(product.id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      <Link href={`/product/${product.id}`}>
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </Link>
                      
                      {/* Discount Badge */}
                      {product.originalPrice && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                          -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </div>
                      )}

                      {/* Remove from Wishlist Button */}
                      <button
                        onClick={() => handleRemoveFromWishlist(product.id)}
                        className="absolute top-2 right-2 bg-white/90 hover:bg-white p-2 rounded-full shadow-sm transition-all duration-200 text-red-500 hover:text-red-600"
                      >
                        <WishlistIcon filled={true} />
                      </button>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <Link href={`/product/${product.id}`}>
                        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-gray-700 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      
                      {/* Price */}
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <button
                          onClick={() => handleMoveToCart(product)}
                          className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium"
                        >
                          Move to Cart
                        </button>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </ClientOnly>
            </div>
          )}

          {/* Wishlist Actions */}
          {wishlistCount > 0 && (
            <div className="mt-12 text-center">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to purchase?</h3>
                <p className="text-gray-600 mb-4">
                  Add all items to your cart and complete your purchase
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => {
                      wishlistItems.forEach(product => handleAddToCart(product));
                    }}
                    className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium"
                  >
                    Add All to Cart
                  </button>
                  <Link
                    href="/cart"
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium text-center"
                  >
                    View Cart
                  </Link>
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
