'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ref, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import ProductGrid from '@/components/ProductGrid';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import BottomNav from '@/components/bottomnav/BottomNav';
import ClientOnly from '@/components/ClientOnly';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const productsPerPage = 8;

  useEffect(() => {
    if (query.trim()) {
      searchProducts(query);
    } else {
      // Reset state when no query
      setProducts([]);
      setAllProducts([]);
      setDisplayedProducts([]);
      setHasSearched(false);
    }
  }, [query]);

  const searchProducts = async (searchQuery) => {
    try {
      setIsLoading(true);
      setHasSearched(true);
      const productsRef = ref(database, 'products');
      const snapshot = await get(productsRef);
      
      if (snapshot.exists()) {
        const productsData = snapshot.val();
        const productsArray = Object.entries(productsData)
          .map(([id, product]) => ({
            id,
            ...product
          }))
          // Filter products based on search query
          .filter(product => {
            const searchTerm = searchQuery.toLowerCase();
            return (
              product.name?.toLowerCase().includes(searchTerm) ||
              product.description?.toLowerCase().includes(searchTerm) ||
              product.category?.toLowerCase().includes(searchTerm) ||
              product.shortDescription?.toLowerCase().includes(searchTerm) ||
              (product.labels && Array.isArray(product.labels) && 
               product.labels.some(label => label.toLowerCase().includes(searchTerm)))
            );
          });
        
        setAllProducts(productsArray);
        setProducts(productsArray);
        
        // Show first 8 products initially
        const initialProducts = productsArray.slice(0, productsPerPage);
        setDisplayedProducts(initialProducts);
        setCurrentPage(1);
        
        console.log('Search results for "' + searchQuery + '":', productsArray);
        console.log('Initial search results displayed:', initialProducts);
      } else {
        console.log('No products found in database');
        setProducts([]);
        setAllProducts([]);
        setDisplayedProducts([]);
      }
    } catch (error) {
      console.error('Error searching products:', error);
      setProducts([]);
      setAllProducts([]);
      setDisplayedProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreProducts = () => {
    const nextPage = currentPage + 1;
    const startIndex = 0;
    const endIndex = nextPage * productsPerPage;
    
    const moreProducts = allProducts.slice(startIndex, endIndex);
    setDisplayedProducts(moreProducts);
    setCurrentPage(nextPage);
    
    console.log(`Loading page ${nextPage}, showing ${moreProducts.length} search results`);
  };

  const hasMoreProducts = displayedProducts.length < allProducts.length;

  const handleMobileSearchSubmit = (e) => {
    e.preventDefault();
    if (mobileSearchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(mobileSearchQuery.trim())}`);
      setMobileSearchQuery('');
    }
  };

  return (
    <div className="font-sans min-h-screen bg-white flex flex-col">
      <div className="hidden sm:block">
        <Header />
      </div>
      
      <div className="flex-1 pt-6 sm:pt-24 px-4">
        <div className="mx-auto max-w-7xl">
          {/* Back Button - Mobile Only */}
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

          {/* Mobile Search Input - Mobile Only */}
          <div className="mb-6 sm:hidden">
            <form onSubmit={handleMobileSearchSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={mobileSearchQuery}
                  onChange={(e) => setMobileSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                />
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <button
                  type="submit"
                  disabled={!mobileSearchQuery.trim()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>

          {/* Page Header */}
          <div className="mb-8">
            {query ? (
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Search Results
                </h1>
                <p className="text-lg text-gray-600">
                  Results for "<span className="font-medium text-gray-900">{query}</span>"
                </p>
                {!isLoading && hasSearched && (
                  <p className="text-sm text-gray-500 mt-2">
                    {allProducts.length} product{allProducts.length !== 1 ? 's' : ''} found
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Search Products</h1>
                <p className="text-lg text-gray-600">
                  Use the search bar above to find products
                </p>
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                  <div className="w-full h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results Found */}
          {!isLoading && hasSearched && allProducts.length === 0 && query && (
            <div className="text-center py-16">
              <div className="mb-4">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">
                We couldn't find any products matching "<span className="font-medium">{query}</span>"
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Try searching with different keywords or check your spelling</p>
                <p>You can also browse our categories to discover products</p>
              </div>
            </div>
          )}

          {/* Search Results Grid */}
          {!isLoading && displayedProducts.length > 0 && (
            <ClientOnly>
              <ProductGrid products={displayedProducts} />
            </ClientOnly>
          )}

          {/* Load More Button */}
          {!isLoading && hasMoreProducts && (
            <div className="text-center mt-8 mb-8">
              <button
                onClick={loadMoreProducts}
                className="bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-black transition-colors duration-200 font-medium"
              >
                Load More Results
              </button>
            </div>
          )}

          {/* All Results Loaded Message */}
          {!isLoading && !hasMoreProducts && displayedProducts.length > 0 && (
            <div className="text-center mt-8 mb-8">
              <p className="text-gray-500">
                Showing all {allProducts.length} result{allProducts.length !== 1 ? 's' : ''} for "{query}"
              </p>
            </div>
          )}

          {/* No Query State */}
          {!query && !hasSearched && (
            <div className="text-center py-16">
              <div className="mb-4">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start Searching</h3>
              <p className="text-gray-500">
                Enter a search term to find products by name, description, category, or labels
              </p>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
      <BottomNav />
    </div>
  );
}

// Loading component for Suspense fallback
function SearchPageLoading() {
  return (
    <div className="font-sans min-h-screen bg-white flex flex-col">
      <div className="hidden sm:block">
        <Header />
      </div>
      
      <div className="flex-1 pt-6 sm:pt-24 px-4">
        <div className="mx-auto max-w-7xl">
          {/* Loading skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
      <BottomNav />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageLoading />}>
      <SearchPageContent />
    </Suspense>
  );
}
