'use client';

import { useState, useEffect } from 'react';
import ProductGrid from '@/components/ProductGrid';
import { getAllProducts } from '@/lib/database';

export default function TemplatesPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Start with a shorter loading state
        setIsLoading(true);
        
        // Fetch products with timeout for faster perceived loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Loading timeout')), 8000) // 8 second timeout
        );
        
        const fetchPromise = getAllProducts();
        
        const fetchedProducts = await Promise.race([fetchPromise, timeoutPromise]);
        
        // Filter only template products
        const templateProducts = fetchedProducts.filter(product => 
          product.category === 'templates' || product.category === 'Templates'
        );
        
        // Transform database products to match ProductGrid interface
        const transformedProducts = templateProducts.map(product => ({
          id: product.id, // Keep original Firebase ID
          name: product.title, // Map title to name
          image: product.image,
          price: product.price,
          originalPrice: product.originalPrice,
          discount: product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : undefined,
          rating: product.rating,
          reviews: product.reviews
        }));
        
        setProducts(transformedProducts);
      } catch (error) {
        console.error('Error fetching template products:', error);
        setProducts([]); // Set empty array on error
      } finally {
        // Add minimum loading time to prevent flashing
        setTimeout(() => {
          setIsLoading(false);
        }, 500); // Minimum 500ms loading for smooth UX
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search query
  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'newest':
        return b.isNew - a.isNew;
      case 'popular':
        return b.reviews - a.reviews;
      default:
        return a.name?.localeCompare(b.name) || 0;
    }
  });

  // Removed loading state - templates will load without showing loading spinner
  // if (isLoading) {
  //   return (
  //     <div className="font-sans">
  //       <section className="pt-24 px-4">
  //         <div className="mx-auto max-w-6xl">
  //           <div className="text-center py-12">
  //             <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
  //             <p className="text-gray-600">Loading templates...</p>
  //           </div>
  //         </div>
  //       </section>
  //     </div>
  //   );
  // }

  return (
    <div className="font-sans">
      {/* Header Section */}
      <section className="pt-32 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex-1 h-px bg-gray-300"></div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-[-.01em] px-4">
              Design Templates
            </h1>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
          
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Professional design templates to jumpstart your projects. From presentations and websites to social media and print materials - find the perfect template for your needs.
          </p>
        </div>
      </section>

      {/* Search and Sort Controls */}
      <section className="px-4 mb-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 whitespace-nowrap">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {sortedProducts.length} template{sortedProducts.length !== 1 ? 's' : ''}
            {searchQuery && ` for "${searchQuery}"`}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-6xl">
          {sortedProducts.length > 0 ? (
            <ProductGrid products={sortedProducts} />
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No templates found' : 'No templates available'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery 
                  ? `No templates match your search for "${searchQuery}". Try different keywords.`
                  : 'We\'re working on adding templates to our collection. Check back soon!'
                }
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Templates Information */}
      {sortedProducts.length > 0 && (
        <section className="px-4 pb-16">
          <div className="mx-auto max-w-6xl">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-blue-900 mb-1">Professional Design Templates</h3>
                  <p className="text-sm text-blue-700">
                    All templates are fully customizable and come with source files in multiple formats. 
                    Perfect for businesses, freelancers, and creative professionals looking to save time and create stunning designs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
