'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { listenToBanners, type Banner } from '@/lib/database';


export default function Banner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load banners from Firebase
  useEffect(() => {
    const unsubscribe = listenToBanners((loadedBanners) => {
      const activeBanners = loadedBanners.filter(banner => banner.isActive);
      setBanners(activeBanners);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || banners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, banners.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // Don't render anything if no banners or still loading
  if (isLoading || banners.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full">
      {/* Banner Container */}
      <div className="relative h-80 md:h-96 overflow-hidden rounded-2xl mx-4 md:mx-8">
        {/* Slides */}
        <div 
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {banners.map((slide: Banner, index: number) => (
            <div
              key={slide.id}
              className={`min-w-full h-full flex items-center justify-center relative overflow-hidden ${!slide.image ? slide.backgroundColor : ''}`}
            >
              {/* Background Image */}
              {slide.image && (
                <div className="absolute inset-0">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-black/40"></div>
                </div>
              )}

              {/* Content */}
              <div className="relative text-center text-white px-6 md:px-12 max-w-4xl z-10">
                <h2 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                  {slide.title}
                </h2>
                <p className="text-lg md:text-xl mb-6 opacity-90 drop-shadow-md">
                  {slide.description}
                </p>
                
                <a
                  href={slide.buttonLink}
                  className="inline-block bg-white text-gray-900 font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors duration-200 transform hover:scale-105 shadow-lg"
                >
                  {slide.buttonText}
                </a>
              </div>

              {/* Decorative Elements (only if no image) */}
              {!slide.image && (
                <>
                  <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                  <div className="absolute bottom-4 left-4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Banner Size Indicators */}
      <div className="flex justify-center mt-6 space-x-2">
        {banners.map((_: Banner, index: number) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentSlide
                ? 'bg-gray-900 scale-110'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>

    </section>
  );
}
