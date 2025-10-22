'use client';

import { useState, useEffect } from 'react';
import ProductGrid from '@/components/ProductGrid';
import { getAllProducts } from '@/lib/database';

export default function DigitalToolsPage() {
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
        
        // Filter only digital tools products
        const digitalToolsProducts = fetchedProducts.filter(product => 
          product.category === 'digital-tools' || 
          product.category === 'Digital Tools' ||
          product.category === 'tools' ||
          product.category === 'software'
        );
        
        // Transform database products to match ProductGrid interface
        const transformedProducts = digitalToolsProducts.map(product => ({
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
        console.error('Error fetching digital tools products:', error);
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

  // Removed loading state - digital tools will load without showing loading spinner
  // if (isLoading) {
  //   return (
  //     <div className="font-sans">
  //       <section className="pt-24 px-4">
  //         <div className="mx-auto max-w-6xl">
  //           <div className="text-center py-12">
  //             <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
  //             <p className="text-gray-600">Loading digital tools...</p>
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
              Digital Tools & Software
            </h1>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
          
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Powerful digital tools and software solutions to boost your productivity. From automation tools and plugins to complete software packages - find the right tools for your workflow.
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
                placeholder="Search digital tools..."
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
            Showing {sortedProducts.length} digital tool{sortedProducts.length !== 1 ? 's' : ''}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No digital tools found' : 'No digital tools available'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery 
                  ? `No digital tools match your search for "${searchQuery}". Try different keywords.`
                  : 'We\'re working on adding digital tools to our collection. Check back soon!'
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

      {/* Digital Tools Information */}
      {sortedProducts.length > 0 && (
        <section className="px-4 pb-16">
          <div className="mx-auto max-w-6xl">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-blue-900 mb-1">Premium Digital Tools & Software</h3>
                  <p className="text-sm text-blue-700">
                    All digital tools come with instant download, lifetime updates, and comprehensive documentation. 
                    Perfect for developers, designers, marketers, and business professionals looking to streamline their workflow and boost productivity.
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
