'use client';

import { useState, useEffect } from 'react';

interface Purchase {
  id: number;
  customerName: string;
  productName: string;
  timeAgo: string;
  location: string;
}

const recentPurchases: Purchase[] = [
  {
    id: 1,
    customerName: "Rajesh Kumar",
    productName: "Modern Website Template",
    timeAgo: "2 minutes ago",
    location: "Mumbai, India"
  },
  {
    id: 2,
    customerName: "Sarah Johnson",
    productName: "UI/UX Design Course",
    timeAgo: "5 minutes ago",
    location: "New York, USA"
  },
  {
    id: 3,
    customerName: "Priya Sharma",
    productName: "Icon Pack Bundle",
    timeAgo: "8 minutes ago",
    location: "Delhi, India"
  },
  {
    id: 4,
    customerName: "Michael Chen",
    productName: "Background Music Pack",
    timeAgo: "12 minutes ago",
    location: "Toronto, Canada"
  },
  {
    id: 5,
    customerName: "Ankit Patel",
    productName: "E-commerce Template",
    timeAgo: "15 minutes ago",
    location: "Bangalore, India"
  },
  {
    id: 6,
    customerName: "Emma Wilson",
    productName: "Photography eBook",
    timeAgo: "18 minutes ago",
    location: "London, UK"
  },
  {
    id: 7,
    customerName: "Vikram Singh",
    productName: "Logo Design Kit",
    timeAgo: "22 minutes ago",
    location: "Pune, India"
  },
  {
    id: 8,
    customerName: "David Rodriguez",
    productName: "React Development Course",
    timeAgo: "25 minutes ago",
    location: "Madrid, Spain"
  },
  {
    id: 9,
    customerName: "Sneha Gupta",
    productName: "Mobile App Template",
    timeAgo: "28 minutes ago",
    location: "Chennai, India"
  },
  {
    id: 10,
    customerName: "James Anderson",
    productName: "Digital Marketing Course",
    timeAgo: "32 minutes ago",
    location: "Sydney, Australia"
  },
  {
    id: 11,
    customerName: "Ravi Mehta",
    productName: "Illustration Pack",
    timeAgo: "35 minutes ago",
    location: "Ahmedabad, India"
  },
  {
    id: 12,
    customerName: "Lisa Thompson",
    productName: "Business Plan Template",
    timeAgo: "38 minutes ago",
    location: "Chicago, USA"
  },
  {
    id: 13,
    customerName: "Arjun Reddy",
    productName: "Social Media Templates",
    timeAgo: "42 minutes ago",
    location: "Hyderabad, India"
  },
  {
    id: 14,
    customerName: "Sophie Martin",
    productName: "Podcast Intro Music",
    timeAgo: "45 minutes ago",
    location: "Paris, France"
  },
  {
    id: 15,
    customerName: "Karan Joshi",
    productName: "WordPress Theme",
    timeAgo: "48 minutes ago",
    location: "Jaipur, India"
  },
  {
    id: 16,
    customerName: "Alex Thompson",
    productName: "Video Editing Course",
    timeAgo: "52 minutes ago",
    location: "Berlin, Germany"
  },
  {
    id: 17,
    customerName: "Deepika Nair",
    productName: "Branding Kit",
    timeAgo: "55 minutes ago",
    location: "Kochi, India"
  },
  {
    id: 18,
    customerName: "Robert Kim",
    productName: "Stock Photos Bundle",
    timeAgo: "58 minutes ago",
    location: "Seoul, South Korea"
  },
  {
    id: 19,
    customerName: "Meera Agarwal",
    productName: "Email Templates",
    timeAgo: "1 hour ago",
    location: "Kolkata, India"
  },
  {
    id: 20,
    customerName: "Carlos Silva",
    productName: "Animation Pack",
    timeAgo: "1 hour ago",
    location: "São Paulo, Brazil"
  },
  {
    id: 21,
    customerName: "Rohit Saxena",
    productName: "Dashboard Template",
    timeAgo: "1 hour ago",
    location: "Lucknow, India"
  },
  {
    id: 22,
    customerName: "Maria Garcia",
    productName: "Presentation Templates",
    timeAgo: "1 hour ago",
    location: "Barcelona, Spain"
  },
  {
    id: 23,
    customerName: "Amit Verma",
    productName: "Mobile UI Kit",
    timeAgo: "1 hour ago",
    location: "Indore, India"
  },
  {
    id: 24,
    customerName: "Jennifer Lee",
    productName: "Copywriting Course",
    timeAgo: "1 hour ago",
    location: "Vancouver, Canada"
  }
];

interface PurchaseNotificationProps {
  purchase: Purchase;
  isVisible: boolean;
}

function PurchaseNotification({ purchase, isVisible }: PurchaseNotificationProps) {
  return (
    <div className={`
      transform transition-all duration-500 ease-in-out
      ${isVisible 
        ? 'translate-x-0 opacity-100' 
        : '-translate-x-full opacity-0'
      }
    `}>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 max-w-sm">
        <div className="flex items-start gap-3">
          {/* Success Icon */}
          <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Purchase Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900 text-sm truncate">
                {purchase.customerName}
              </h4>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {purchase.location}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              Successfully purchased <span className="font-medium text-gray-900">{purchase.productName}</span>
            </p>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-green-600 font-medium">
                ✓ Successful Purchase
              </span>
              <span className="text-xs text-gray-400">
                {purchase.timeAgo}
              </span>
            </div>
          </div>

          {/* Close Button */}
          <button className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RecentPurchases() {
  const [currentPurchaseIndex, setCurrentPurchaseIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // Hide current notification
      setIsVisible(false);
      
      // After hide animation, show next notification
      setTimeout(() => {
        setCurrentPurchaseIndex((prev) => (prev + 1) % recentPurchases.length);
        setIsVisible(true);
      }, 500);
    }, 4000); // Show each notification for 4 seconds

    return () => clearInterval(interval);
  }, []);

  const currentPurchase = recentPurchases[currentPurchaseIndex];

  return (
    <div className="fixed bottom-6 left-6 z-40">
      <PurchaseNotification 
        purchase={currentPurchase}
        isVisible={isVisible}
      />
    </div>
  );
}
