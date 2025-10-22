'use client';

import { useState, useEffect } from 'react';
import ProductGrid from '@/components/ProductGrid';
import { getAllProducts } from '@/lib/database';

export default function CoursesPage() {
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
        
        // Filter only course products
        const courseProducts = fetchedProducts.filter(product => 
          product.category === 'courses' || product.category === 'Courses'
        );
        
        // Transform database products to match ProductGrid interface
        const transformedProducts = courseProducts.map(product => ({
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
        console.error('Error fetching course products:', error);
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

  // Removed loading state - courses will load without showing loading spinner
  // if (isLoading) {
  //   return (
  //     <div className="font-sans">
  //       <section className="pt-24 px-4">
  //         <div className="mx-auto max-w-6xl">
  //           <div className="text-center py-12">
  //             <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
  //             <p className="text-gray-600">Loading courses...</p>
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
              Online Courses
            </h1>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
          
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Expand your skills with our comprehensive online courses. Learn from industry experts and advance your career with practical, hands-on training.
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
                placeholder="Search courses..."
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
            Showing {sortedProducts.length} course{sortedProducts.length !== 1 ? 's' : ''}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No courses found' : 'No courses available'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery 
                  ? `No courses match your search for "${searchQuery}". Try different keywords.`
                  : 'We\'re working on adding courses to our collection. Check back soon!'
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

      {/* Courses Information */}
      {sortedProducts.length > 0 && (
        <section className="px-4 pb-16">
          <div className="mx-auto max-w-6xl">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-blue-900 mb-1">Online Learning Platform</h3>
                  <p className="text-sm text-blue-700">
                    Our courses include lifetime access, downloadable resources, and certificates of completion. 
                    Learn at your own pace with expert-led content and practical exercises designed for real-world application.
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
