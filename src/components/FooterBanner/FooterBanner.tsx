'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FooterBanner() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          // Reset timer when it reaches 0
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleShopNow = () => {
    router.push('/products');
  };

  return (
    <section className="relative overflow-hidden bg-white py-12 px-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-red-100 rounded-full animate-pulse"></div>
        <div className="absolute top-8 right-8 w-16 h-16 bg-orange-100 rounded-full animate-bounce"></div>
        <div className="absolute bottom-4 left-1/4 w-20 h-20 bg-red-100 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-8 right-1/3 w-12 h-12 bg-orange-100 rounded-full animate-bounce delay-500"></div>
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Main Offer Text */}
        <div className="mb-6">
          <h2 className="text-4xl md:text-6xl font-black text-red-600 mb-2 tracking-tight">
            Flat 50% Off!
          </h2>
          <p className="text-lg md:text-xl text-gray-700 mb-2">
            This offer will end soon.
          </p>
          <p className="text-2xl md:text-3xl font-bold text-orange-600 animate-pulse">
            Hurry!!
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="mb-8">
          <div className="flex justify-center items-center gap-4 mb-4">
            <div className="bg-red-100 border border-red-200 rounded-xl px-4 py-3 min-w-[80px]">
              <div className="text-2xl md:text-3xl font-bold text-red-600">
                {timeLeft.hours.toString().padStart(2, '0')}
              </div>
              <div className="text-xs text-red-500 uppercase tracking-wide">
                Hours
              </div>
            </div>
            <div className="text-red-600 text-2xl font-bold">:</div>
            <div className="bg-red-100 border border-red-200 rounded-xl px-4 py-3 min-w-[80px]">
              <div className="text-2xl md:text-3xl font-bold text-red-600">
                {timeLeft.minutes.toString().padStart(2, '0')}
              </div>
              <div className="text-xs text-red-500 uppercase tracking-wide">
                Minutes
              </div>
            </div>
            <div className="text-red-600 text-2xl font-bold">:</div>
            <div className="bg-red-100 border border-red-200 rounded-xl px-4 py-3 min-w-[80px]">
              <div className="text-2xl md:text-3xl font-bold text-red-600">
                {timeLeft.seconds.toString().padStart(2, '0')}
              </div>
              <div className="text-xs text-red-500 uppercase tracking-wide">
                Seconds
              </div>
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            ⏰ Limited time offer - Don't miss out!
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={handleShopNow}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg text-base border-2 border-red-600 hover:border-red-700 transition-all duration-200"
          >
            Shop Now & Save 50%
          </button>
          <button 
            onClick={handleShopNow}
            className="bg-transparent hover:bg-red-50 text-red-600 font-semibold px-6 py-3 rounded-lg text-base border-2 border-red-600 hover:border-red-700 transition-all duration-200"
          >
            Claim Your Discount
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm mb-2">
            ✨ Valid on all digital products • No minimum purchase required
          </p>
          <p className="text-gray-500 text-xs">
            *Offer cannot be combined with other promotions
          </p>
        </div>
      </div>
    </section>
  );
}
