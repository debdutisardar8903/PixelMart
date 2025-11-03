'use client';

import { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import ProductGrid from '@/components/ProductGrid';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import BottomNav from '@/components/bottomnav/BottomNav';
import ClientOnly from '@/components/ClientOnly';

export default function EBooksPage() {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  useEffect(() => {
    const fetchEBooks = async () => {
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
            // Filter only eBooks category
            .filter(product => product.category && product.category.toLowerCase() === 'ebooks');
          
          setAllProducts(productsArray);
          setProducts(productsArray);
          
          // Show first 8 eBooks initially
          const initialProducts = productsArray.slice(0, productsPerPage);
          setDisplayedProducts(initialProducts);
          
          console.log('eBooks fetched from database:', productsArray);
          console.log('Initial eBooks displayed:', initialProducts);
        } else {
          console.log('No products found in database');
          setProducts([]);
          setAllProducts([]);
          setDisplayedProducts([]);
        }
      } catch (error) {
        console.error('Error fetching eBooks:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEBooks();
  }, []);

  const loadMoreProducts = () => {
    const nextPage = currentPage + 1;
    const startIndex = currentPage * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const newProducts = allProducts.slice(startIndex, endIndex);
    
    if (newProducts.length > 0) {
      setDisplayedProducts(prev => [...prev, ...newProducts]);
      setCurrentPage(nextPage);
      console.log(`Loaded page ${nextPage}, showing ${displayedProducts.length + newProducts.length} of ${allProducts.length} eBooks`);
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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">eBooks Collection</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our extensive collection of digital eBooks across various genres and topics
            </p>
            {!isLoading && (
              <p className="text-sm text-gray-500 mt-2">
                {allProducts.length} eBook{allProducts.length !== 1 ? 's' : ''} available
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

          {/* No eBooks Found */}
          {!isLoading && allProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="mb-4">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No eBooks Available</h3>
              <p className="text-gray-500">
                We're working on adding eBooks to our collection. Check back soon!
              </p>
            </div>
          )}

          {/* eBooks Grid */}
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
                Load More eBooks
              </button>
            </div>
          )}

          {/* All eBooks Loaded Message */}
          {!isLoading && !hasMoreProducts && displayedProducts.length > 0 && (
            <div className="text-center mt-8 mb-8">
              <p className="text-gray-500">
                You've viewed all {allProducts.length} eBook{allProducts.length !== 1 ? 's' : ''} in our collection
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
