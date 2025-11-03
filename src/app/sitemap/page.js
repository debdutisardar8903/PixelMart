'use client';

import Link from 'next/link';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import BottomNav from '@/components/bottomnav/BottomNav';

export default function SitemapPage() {

  const sitemapSections = [
    {
      id: 'main',
      title: 'Main Pages',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-600',
      links: [
        { name: 'Home', url: '/', description: 'Main homepage with featured products and categories' },
        { name: 'Search', url: '/search', description: 'Search for products across all categories' },
        { name: 'Categories', url: '/categories', description: 'Browse all product categories' }
      ]
    },
    {
      id: 'products',
      title: 'Product Categories',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: 'from-green-500 to-green-600',
      links: [
        { name: 'eBooks', url: '/ebooks', description: 'Digital eBooks collection across various genres' },
        { name: 'Courses', url: '/courses', description: 'Online courses and educational content' },
        { name: 'Templates', url: '/templates', description: 'Design templates for websites and presentations' },
        { name: 'Digital Tools', url: '/digital-tools', description: 'Software and digital productivity tools' },
        { name: 'Music & Audio', url: '/music-audio', description: 'Music tracks, sound effects, and audio samples' },
        { name: 'Graphics & Design', url: '/graphics-design', description: 'Graphics, illustrations, and design assets' }
      ]
    },
    {
      id: 'shopping',
      title: 'Shopping & Orders',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6.5-5v5a2 2 0 01-2 2H9a2 2 0 01-2-2v-5m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
        </svg>
      ),
      color: 'from-purple-500 to-purple-600',
      links: [
        { name: 'Shopping Cart', url: '/cart', description: 'View and manage items in your cart' },
        { name: 'Wishlist', url: '/wishlist', description: 'Save products for later purchase' },
        { name: 'Checkout', url: '/checkout', description: 'Complete your purchase securely' },
        { name: 'Orders', url: '/orders', description: 'View order history and track purchases' },
        { name: 'Coupons', url: '/coupons', description: 'Available discount coupons and offers' }
      ]
    },
    {
      id: 'account',
      title: 'Account & Profile',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: 'from-indigo-500 to-indigo-600',
      links: [
        { name: 'Profile', url: '/profile', description: 'View and manage your account profile' },
        { name: 'Edit Profile', url: '/profile/edit', description: 'Update your personal information' },
        { name: 'Addresses', url: '/profile/addresses', description: 'Manage saved addresses' },
        { name: 'Authentication', url: '/auth', description: 'Login or create new account' },
        { name: 'Sign Up', url: '/auth/signup', description: 'Create a new account' },
        { name: 'Forgot Password', url: '/auth/forgot-password', description: 'Reset your password' }
      ]
    },
    {
      id: 'content',
      title: 'Content & Blog',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      color: 'from-orange-500 to-orange-600',
      links: [
        { name: 'Blog', url: '/blogs', description: 'Latest articles and updates' }
      ]
    },
    {
      id: 'support',
      title: 'Support & Help',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-red-500 to-red-600',
      links: [
        { name: 'Help Center', url: '/help', description: 'Support tickets and FAQ' },
        { name: 'FAQ', url: '/faq', description: 'Frequently asked questions' }
      ]
    },
    {
      id: 'legal',
      title: 'Legal & Policies',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'from-gray-500 to-gray-600',
      links: [
        { name: 'Privacy Center', url: '/profile/privacy', description: 'Privacy policy and legal information' },
        { name: 'Privacy Policy', url: '/profile/privacy?section=privacy-policy', description: 'How we handle your data' },
        { name: 'Terms & Conditions', url: '/profile/privacy?section=terms-conditions', description: 'Terms of service' },
        { name: 'Refund Policy', url: '/profile/privacy?section=refund-policy', description: 'Refund and cancellation terms' },
        { name: 'Cancellation Policy', url: '/profile/privacy?section=cancellation-policy', description: 'Order cancellation policy' }
      ]
    },
  ];

  return (
    <div className="font-sans min-h-screen bg-white flex flex-col">
      <div className="hidden sm:block">
        <Header />
      </div>
      
      <div className="flex-1 pt-6 sm:pt-24 px-4">
        <div className="mx-auto max-w-6xl">
          {/* Back Button - Mobile Only */}
          <div className="mb-4 sm:hidden">
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center w-12 h-12 bg-gray-50 border-2 border-gray-300 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Page Header */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Site Map</h1>
            <p className="text-gray-600">
              Navigate through all pages and sections of Wallineex
            </p>
          </div>

          {/* Sitemap Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sitemapSections.map((section) => (
              <div key={section.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                <div className={`p-4 bg-gradient-to-r ${section.color} text-white`}>
                  <div className="flex items-center space-x-3">
                    {section.icon}
                    <h2 className="text-lg font-semibold">{section.title}</h2>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="space-y-3">
                    {section.links.map((link, index) => (
                      <Link
                        key={index}
                        href={link.url}
                        className="block p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-gray-400 rounded-full group-hover:bg-blue-500 transition-colors duration-200"></div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                              {link.name}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">{link.description}</p>
                          </div>
                          <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
      
      <div className="mt-12">
        <Footer />
      </div>
      <BottomNav />
    </div>
  );
}
