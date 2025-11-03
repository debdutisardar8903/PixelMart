'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ref, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import ProductGrid from '@/components/ProductGrid';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import BottomNav from '@/components/bottomnav/BottomNav';
import ClientOnly from '@/components/ClientOnly';

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bannerUrl, setBannerUrl] = useState(null);
  const [mobileBannerUrl, setMobileBannerUrl] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const productsRef = ref(database, 'products');
        const snapshot = await get(productsRef);
        
        if (snapshot.exists()) {
          const productsData = snapshot.val();
          const productsArray = Object.entries(productsData).map(([id, product]) => ({
            id,
            ...product
          }));
          
          setAllProducts(productsArray);
          setProducts(productsArray); // Keep for existing logic
          
          // Show first 8 products initially
          const initialProducts = productsArray.slice(0, productsPerPage);
          setDisplayedProducts(initialProducts);
          
          console.log('Products fetched from database:', productsArray);
          console.log('Initial products displayed:', initialProducts);
        } else {
          console.log('No products found in database');
          setProducts([]);
          setAllProducts([]);
          setDisplayedProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch banners from Firebase
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const bannersRef = ref(database, 'banners');
        const snapshot = await get(bannersRef);
        
        if (snapshot.exists()) {
          const bannersData = snapshot.val();
          console.log('Banners data from database:', bannersData);
          
          // Check for desktop video banner in banners/video structure
          if (bannersData.video && bannersData.video.url) {
            setBannerUrl(bannersData.video.url);
            console.log('Desktop video banner URL loaded from banners/video:', bannersData.video.url);
          }
          
          // Check for mobile video banner in banners/mobile structure
          if (bannersData.mobile && bannersData.mobile.url) {
            setMobileBannerUrl(bannersData.mobile.url);
            console.log('Mobile video banner URL loaded from banners/mobile:', bannersData.mobile.url);
          }
          
          // If both desktop and mobile banners are found, return early
          if (bannersData.video && bannersData.video.url && bannersData.mobile && bannersData.mobile.url) {
            return;
          }
          
          // Check for multiple banners structure - find video banners for fallback
          const bannerEntries = Object.entries(bannersData);
          for (const [key, banner] of bannerEntries) {
            if (banner && typeof banner === 'object' && banner.url) {
              // Check if it's a video file by fileName or type
              const isVideo = banner.fileName?.toLowerCase().includes('.mp4') || 
                             banner.fileName?.toLowerCase().includes('.mov') || 
                             banner.fileName?.toLowerCase().includes('.avi') ||
                             banner.type === 'video' ||
                             banner.url.toLowerCase().includes('.mp4');
              
              if (isVideo) {
                // Use as desktop banner if not already set
                if (!bannersData.video?.url) {
                  setBannerUrl(banner.url);
                  console.log('Desktop video banner URL loaded from banners/' + key + ':', banner.url);
                }
                // Use as mobile banner if not already set and no desktop banner found yet
                if (!bannersData.mobile?.url && !mobileBannerUrl) {
                  setMobileBannerUrl(banner.url);
                  console.log('Mobile video banner URL loaded from banners/' + key + ':', banner.url);
                }
                return;
              }
            }
          }
          
          console.log('No video banners found in database');
        } else {
          console.log('No banners collection found in database');
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
        console.log('Failed to load banner from database');
      }
    };

    fetchBanners();
  }, []);

  // Load more products function
  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    const startIndex = 0;
    const endIndex = nextPage * productsPerPage;
    
    const moreProducts = allProducts.slice(startIndex, endIndex);
    setDisplayedProducts(moreProducts);
    setCurrentPage(nextPage);
    
    console.log(`Loading page ${nextPage}, showing ${moreProducts.length} products`);
  };

  // Check if there are more products to load
  const hasMoreProducts = displayedProducts.length < allProducts.length;

  // Removed loading state - home page will load without showing loading content
  // if (isLoading) {
  //   return (
  //     <div className="font-sans">
  //       {/* Video Banner */}
  //       <section className="pt-24 px-4">
  //         <div className="mx-auto max-w-6xl">
  //           {/* Desktop Video Banner - Hidden on mobile */}
  //           <video
  //             className="hidden sm:block w-full h-48 sm:h-56 md:h-64 object-cover rounded-lg"
  //             autoPlay
  //             muted
  //             loop
  //             playsInline
  //           >
  //             <source
  //               src="https://pixelmart-storage.s3.ap-south-1.amazonaws.com/pixelmart/products/video+banner.mp4"
  //               type="video/mp4"
  //             />
  //             Your browser does not support the video tag.
  //           </video>
  //
  //           {/* Mobile Video Banner - Visible only on mobile */}
  //           <video
  //             className="block sm:hidden w-full h-48 object-cover rounded-lg"
  //             autoPlay
  //             muted
  //             loop
  //             playsInline
  //           >
  //             <source
  //               src="https://pixelmart-storage.s3.ap-south-1.amazonaws.com/pixelmart/products/video+banner.mp4"
  //               type="video/mp4"
  //             />
  //             Your browser does not support the video tag.
  //           </video>
  //         </div>
  //       </section>
  //
  //       {/* Telegram Channel Note */}
  //       <section className="px-4 mt-8">
  //         <div className="mx-auto max-w-6xl">
  //           <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
  //             <div className="flex items-center gap-2 text-left">
  //               <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
  //                 i
  //               </div>
  //               <p className="text-sm/6 tracking-[-.01em]">
  //                 <span className="text-red-600">Join our telegram Channel,</span>
  //                 <span className="text-blue-800"> for Latest and Important Tool Updates and News only….  </span>
  //                 <span 
  //                   className="text-blue-600 hover:text-blue-800 cursor-pointer hover:underline transition-colors duration-200"
  //                   onClick={() => window.open('https://t.me/wallineex', '_blank')}
  //                 >
  //                   Click here to Join
  //                 </span>
  //               </p>
  //             </div>
  //           </div>
  //         </section>
  //     </div>
  //   );
  // }

  return (
    <div className="font-sans min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="flex-1">
        {/* Video Banner */}
        <section className="pt-24 px-4">
        <div className="mx-auto max-w-6xl">
          {/* Desktop Video Banner - Hidden on mobile */}
          {bannerUrl && (
            <video
              className="hidden sm:block w-full h-48 sm:h-56 md:h-64 object-cover rounded-lg"
              autoPlay
              muted
              loop
              playsInline
            >
              <source
                src={bannerUrl}
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          )}

          {/* Mobile Video Banner - Visible only on mobile */}
          {(mobileBannerUrl || bannerUrl) && (
            <video
              className="block sm:hidden w-full h-48 object-cover rounded-lg"
              autoPlay
              muted
              loop
              playsInline
            >
              <source
                src={mobileBannerUrl || bannerUrl}
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </section>

      {/* Telegram Channel Note */}
      <section className="px-4 mt-8">
        <div className="mx-auto max-w-6xl">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
            <div className="flex items-center gap-2 text-left">
              <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                i
              </div>
              <p className="text-sm/6 tracking-[-.01em]">
                <span className="text-red-600">Join our telegram Channel,</span>
                <span className="text-blue-800"> for Latest and Important Tool Updates and News only….  </span>
                <span 
                  className="text-blue-600 hover:text-blue-800 cursor-pointer hover:underline transition-colors duration-200"
                  onClick={() => window.open('https://t.me/wallineex', '_blank')}
                >
                  Click here to Join
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="px-4 mt-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {/* Reels Bundle */}
            <div className="group cursor-pointer" onClick={() => router.push('/categories')}>
              <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 mb-3">
                <Image
                  src="/category/reels-bundle.png"
                  alt="Reels Bundle"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    <p className="text-sm font-medium">Reels</p>
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors duration-200">
                Reels Bundle
              </h3>
              <p className="text-sm text-gray-600">Social media content</p>
            </div>

            {/* E-books */}
            <div className="group cursor-pointer" onClick={() => router.push('/ebooks')}>
              <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-blue-400 to-indigo-400 mb-3">
                <Image
                  src="/category/eBooks.png"
                  alt="E-books"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                    </svg>
                    <p className="text-sm font-medium">Books</p>
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                E-books
              </h3>
              <p className="text-sm text-gray-600">Digital publications</p>
            </div>

            {/* WP Themes */}
            <div className="group cursor-pointer" onClick={() => router.push('/templates')}>
              <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-green-400 to-emerald-400 mb-3">
                <Image
                  src="/category/WP-Themes.png"
                  alt="WP Themes"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <p className="text-sm font-medium">Themes</p>
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-200">
                WP Themes
              </h3>
              <p className="text-sm text-gray-600">WordPress templates</p>
            </div>

            {/* Digital Tools */}
            <div className="group cursor-pointer" onClick={() => router.push('/digital-tools')}>
              <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-orange-400 to-red-400 mb-3">
                <Image
                  src="/category/Digital-tools.png"
                  alt="Digital Tools"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
                    </svg>
                    <p className="text-sm font-medium">Tools</p>
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors duration-200">
                Digital Tools
              </h3>
              <p className="text-sm text-gray-600">Software & utilities</p>
            </div>
          </div>
        </div>
      </section>

      {/* Best Selling Section */}
      <section className="px-4 mt-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-center gap-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-[-.01em] px-4">
              Best Selling
            </h1>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="px-4 mt-6">
        <div className="mx-auto max-w-6xl">
          {displayedProducts.length > 0 ? (
            <ProductGrid products={displayedProducts} />
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products available</h3>
              <p className="text-gray-600">
                Products will appear here once they are added to the database.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Load More Button */}
      {hasMoreProducts && (
        <section className="px-4 mt-6 mb-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex justify-center">
              <ClientOnly>
                <button 
                  onClick={handleLoadMore}
                  className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
                >
                  Load More Products
                </button>
              </ClientOnly>
            </div>
          </div>
        </section>
      )}

      {/* Product Count Display - Show when all products are loaded */}
      {!hasMoreProducts && allProducts.length > 0 && (
        <section className="px-4 mt-6 mb-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex justify-center">
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
                <p className="text-sm text-gray-600 text-center">
                  Showing all <span className="font-medium text-gray-900">{allProducts.length}</span> available products
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
      </div>
      
      {/* Footer - Always at bottom */}
      <Footer />
      
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
