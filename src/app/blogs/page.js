'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ref, get, onValue, off } from 'firebase/database';
import { database } from '@/lib/firebase';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import BottomNav from '@/components/bottomnav/BottomNav';
import ClientOnly from '@/components/ClientOnly';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = () => {
      try {
        console.log('Setting up real-time listener for blogs...');
        const blogsRef = ref(database, 'blogs');
        
        const unsubscribe = onValue(blogsRef, (snapshot) => {
          if (snapshot.exists()) {
            const blogsData = snapshot.val();
            const blogsArray = Object.entries(blogsData)
              .map(([id, blog]) => ({
                id,
                ...blog
              }))
              .filter(blog => blog.status === 'published') // Only show published blogs
              .sort((a, b) => {
                // Sort by publishedOn date, newest first
                const dateA = a.publishedOn || a.createdAt || 0;
                const dateB = b.publishedOn || b.createdAt || 0;
                return dateB - dateA;
              });
            
            console.log('Blogs fetched from database:', blogsArray);
            setBlogs(blogsArray);
            setError(null);
          } else {
            console.log('No blogs found in database');
            setBlogs([]);
          }
          setIsLoading(false);
        }, (error) => {
          console.error('Error fetching blogs:', error);
          setError('Failed to load blogs. Please try again later.');
          setIsLoading(false);
        });

        // Cleanup function
        return () => {
          console.log('Cleaning up blogs listener');
          off(blogsRef, 'value', unsubscribe);
        };
      } catch (error) {
        console.error('Error setting up blogs listener:', error);
        setError('Failed to load blogs. Please try again later.');
        setIsLoading(false);
      }
    };

    const cleanup = fetchBlogs();
    return cleanup;
  }, []);

  // Function to extract plain text from rich HTML content
  const extractPlainText = (htmlContent, maxLength = 150) => {
    if (!htmlContent) return '';
    
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Get plain text and limit length
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...' 
      : plainText;
  };

  // Function to format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Unknown date';
    }
  };

  // Function to get reading time estimate
  const getReadingTime = (content) => {
    if (!content) return '1 min read';
    
    const wordsPerMinute = 200;
    const textContent = extractPlainText(content);
    const wordCount = textContent.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    
    return `${readingTime} min read`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="font-sans min-h-screen bg-white flex flex-col">
        <div className="hidden sm:block">
          <Header />
        </div>
        
        <div className="flex-1 pt-6 sm:pt-24 px-4">
          <div className="mx-auto max-w-5xl">
            {/* Page Header */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Blog</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover insights, tutorials, and updates from our team
              </p>
            </div>

            {/* Loading Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                  <div className="w-full h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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

  // Error state
  if (error) {
    return (
      <div className="font-sans min-h-screen bg-white flex flex-col">
        <div className="hidden sm:block">
          <Header />
        </div>
        
        <div className="flex-1 pt-6 sm:pt-24 px-4">
          <div className="mx-auto max-w-5xl">
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Blogs</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
        
        <Footer />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="font-sans min-h-screen bg-white flex flex-col">
      <div className="hidden sm:block">
        <Header />
      </div>
      
      <div className="flex-1 pt-6 sm:pt-24 px-4">
        <div className="mx-auto max-w-5xl">
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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Blog</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover insights, tutorials, and updates from our team
            </p>
            {blogs.length > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                {blogs.length} article{blogs.length !== 1 ? 's' : ''} published
              </p>
            )}
          </div>

          {/* Blogs Grid */}
          {blogs.length > 0 ? (
            <ClientOnly>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {blogs.map((blog) => (
                  <article 
                    key={blog.id} 
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group cursor-pointer"
                    onClick={() => window.open(`/blogs/${blog.permalink || blog.id}`, '_blank')}
                  >
                    {/* Featured Image */}
                    <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
                      {blog.featuredImage ? (
                        <Image
                          src={blog.featuredImage}
                          alt={blog.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Reading Time Badge */}
                      <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                        {getReadingTime(blog.content)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Labels */}
                      {blog.labels && Array.isArray(blog.labels) && blog.labels.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {blog.labels.slice(0, 2).map((label, index) => (
                            <span 
                              key={index}
                              className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                            >
                              {label}
                            </span>
                          ))}
                          {blog.labels.length > 2 && (
                            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                              +{blog.labels.length - 2} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Title */}
                      <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                        {blog.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {extractPlainText(blog.content)}
                      </p>

                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{formatDate(blog.publishedOn || blog.createdAt)}</span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Read more
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </ClientOnly>
          ) : (
            /* Empty State */
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs published yet</h3>
              <p className="text-gray-600">
                Check back later for new articles and insights.
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
