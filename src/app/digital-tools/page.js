'use client';

import { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import ProductGrid from '@/components/ProductGrid';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import BottomNav from '@/components/bottomnav/BottomNav';
import ClientOnly from '@/components/ClientOnly';

export default function DigitalToolsPage() {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  useEffect(() => {
    const fetchDigitalTools = async () => {
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
            // Filter only digital-tools category
            .filter(product => product.category && product.category.toLowerCase() === 'digital-tools');
          
          setAllProducts(productsArray);
          setProducts(productsArray);
          
          // Show first 8 digital tools initially
          const initialProducts = productsArray.slice(0, productsPerPage);
          setDisplayedProducts(initialProducts);
          
          console.log('Digital Tools fetched from database:', productsArray);
          console.log('Initial digital tools displayed:', initialProducts);
        } else {
          console.log('No products found in database');
          setProducts([]);
          setAllProducts([]);
          setDisplayedProducts([]);
        }
      } catch (error) {
        console.error('Error fetching digital tools:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDigitalTools();
  }, []);

  const loadMoreProducts = () => {
    const nextPage = currentPage + 1;
    const startIndex = currentPage * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const newProducts = allProducts.slice(startIndex, endIndex);
    
    if (newProducts.length > 0) {
      setDisplayedProducts(prev => [...prev, ...newProducts]);
      setCurrentPage(nextPage);
      console.log(`Loaded page ${nextPage}, showing ${displayedProducts.length + newProducts.length} of ${allProducts.length} digital tools`);
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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Digital Tools</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful digital tools and software to boost your productivity and streamline your workflow
            </p>
            {!isLoading && (
              <p className="text-sm text-gray-500 mt-2">
                {allProducts.length} digital tool{allProducts.length !== 1 ? 's' : ''} available
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

          {/* No Digital Tools Found */}
          {!isLoading && allProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="mb-4">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Digital Tools Available</h3>
              <p className="text-gray-500">
                We're working on adding digital tools to our collection. Check back soon!
              </p>
            </div>
          )}

          {/* Digital Tools Grid */}
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
                Load More Digital Tools
              </button>
            </div>
          )}

          {/* All Digital Tools Loaded Message */}
          {!isLoading && !hasMoreProducts && displayedProducts.length > 0 && (
            <div className="text-center mt-8 mb-8">
              <p className="text-gray-500">
                You've viewed all {allProducts.length} digital tool{allProducts.length !== 1 ? 's' : ''} in our collection
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
