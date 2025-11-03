'use client';

import { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import ProductGrid from '@/components/ProductGrid';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import BottomNav from '@/components/bottomnav/BottomNav';
import ClientOnly from '@/components/ClientOnly';

export default function CategoriesPage() {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  // Define the existing category pages to exclude
  const existingCategories = [
    'ebooks',
    'courses', 
    'templates',
    'digital-tools',
    'music-audio',
    'graphics-design'
  ];

  useEffect(() => {
    const fetchOtherCategories = async () => {
      try {
        setIsLoading(true);
        const productsRef = ref(database, 'products');
        const snapshot = await get(productsRef);
        
        if (snapshot.exists()) {
          const productsData = snapshot.val();
          const productsArray = Object.entries(productsData)
            .map(([id, product]) => ({
              id,
              ...product
            }))
            // Filter out products that belong to existing category pages
            .filter(product => {
              if (!product.category) return true; // Include products without category
              const categoryLower = product.category.toLowerCase();
              return !existingCategories.includes(categoryLower);
            });
          
          setAllProducts(productsArray);
          setProducts(productsArray);
          
          // Show first 8 products initially
          const initialProducts = productsArray.slice(0, productsPerPage);
          setDisplayedProducts(initialProducts);
          
          console.log('Other category products fetched from database:', productsArray);
          console.log('Initial other category products displayed:', initialProducts);
        } else {
          console.log('No products found in database');
          setProducts([]);
          setAllProducts([]);
          setDisplayedProducts([]);
        }
      } catch (error) {
        console.error('Error fetching other category products:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOtherCategories();
  }, []);

  const loadMoreProducts = () => {
    const nextPage = currentPage + 1;
    const startIndex = currentPage * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const newProducts = allProducts.slice(startIndex, endIndex);
    
    if (newProducts.length > 0) {
      setDisplayedProducts(prev => [...prev, ...newProducts]);
      setCurrentPage(nextPage);
      console.log(`Loaded page ${nextPage}, showing ${displayedProducts.length + newProducts.length} of ${allProducts.length} products`);
    }
  };

  const hasMoreProducts = displayedProducts.length < allProducts.length;

  return (
    <div className="font-sans min-h-screen bg-white flex flex-col">
      <div className="hidden sm:block">
        <Header />
      </div>
      
      <div className="flex-1 pt-6 sm:pt-24 px-4">
        <div className="mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">All Categories</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our diverse collection of digital products across various categories
            </p>
            {!isLoading && (
              <p className="text-sm text-gray-500 mt-2">
                {allProducts.length} product{allProducts.length !== 1 ? 's' : ''} available
              </p>
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

          {/* No Products Found */}
          {!isLoading && allProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="mb-4">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Additional Products Available</h3>
              <p className="text-gray-500">
                All products are organized in their specific category pages. Check out our specialized collections!
              </p>
            </div>
          )}

          {/* Products Grid */}
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
                Load More Products
              </button>
            </div>
          )}

          {/* All Products Loaded Message */}
          {!isLoading && !hasMoreProducts && displayedProducts.length > 0 && (
            <div className="text-center mt-8 mb-8">
              <p className="text-gray-500">
                You've viewed all {allProducts.length} product{allProducts.length !== 1 ? 's' : ''} in this collection
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
