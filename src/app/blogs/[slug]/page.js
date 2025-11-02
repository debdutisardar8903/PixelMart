'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ref, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import BottomNav from '@/components/bottomnav/BottomNav';

export default function BlogPost() {
  const params = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        console.log('Fetching blog with slug:', params.slug);
        // Reset states when fetching new blog
        setBlog(null);
        setRecentPosts([]);
        setError(null);
        setIsLoading(true);
        
        const blogsRef = ref(database, 'blogs');
        const snapshot = await get(blogsRef);
        
        if (snapshot.exists()) {
          const blogsData = snapshot.val();
          
          // Find blog by permalink or ID
          console.log('Searching for blog with slug:', params.slug);
          console.log('Available blogs:', Object.keys(blogsData));
          
          const blogEntry = Object.entries(blogsData).find(([id, blog]) => {
            const matchesPermalink = blog.permalink === params.slug;
            const matchesId = id === params.slug;
            console.log(`Checking blog ${id}: permalink="${blog.permalink}", matches=${matchesPermalink || matchesId}`);
            return matchesPermalink || matchesId;
          });
          
          if (blogEntry) {
            const [id, blogData] = blogEntry;
            console.log('Found blog:', id, blogData.title);
            
            // Check if blog is published
            if (blogData.status !== 'published') {
              console.log('Blog not published:', blogData.status);
              setError('Blog post not found or not published.');
              setIsLoading(false);
              return;
            }
            
            setBlog({
              id,
              ...blogData
            });
            console.log('Blog fetched:', blogData);
            
            // Fetch recent posts (exclude current blog)
            const otherBlogs = Object.entries(blogsData)
              .filter(([otherId, otherBlog]) => 
                otherId !== id && 
                otherBlog.status === 'published'
              )
              .map(([otherId, otherBlog]) => ({
                id: otherId,
                ...otherBlog
              }))
              .sort((a, b) => {
                // Prioritize blogs marked as recent posts
                if (a.isRecentPost && !b.isRecentPost) return -1;
                if (!a.isRecentPost && b.isRecentPost) return 1;
                
                // If both are recent posts or both are not, sort by recentPostDate first
                if (a.isRecentPost && b.isRecentPost) {
                  const recentDateA = a.recentPostDate || a.publishedOn || a.createdAt || 0;
                  const recentDateB = b.recentPostDate || b.publishedOn || b.createdAt || 0;
                  if (recentDateA !== recentDateB) {
                    return recentDateB - recentDateA;
                  }
                }
                
                // Default sorting by publishedOn or createdAt
                const dateA = a.publishedOn || a.createdAt || 0;
                const dateB = b.publishedOn || b.createdAt || 0;
                return dateB - dateA;
              })
              .slice(0, 3); // Get 3 recent posts
            
            setRecentPosts(otherBlogs);
            console.log('Recent posts fetched:', otherBlogs);
          } else {
            setError('Blog post not found.');
          }
        } else {
          setError('No blogs found in database.');
        }
      } catch (error) {
        console.error('Error fetching blog:', error);
        setError('Failed to load blog post. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.slug) {
      fetchBlog();
    }
  }, [params.slug]);

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
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    const wordCount = textContent.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    
    return `${readingTime} min read`;
  };

  // Function to sanitize and render HTML content
  const renderRichContent = (htmlContent) => {
    if (!htmlContent) return null;
    
    // Basic sanitization - in production, consider using a library like DOMPurify
    const sanitizedContent = htmlContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, ''); // Remove iframes
    
    return (
      <div 
        className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="font-sans min-h-screen bg-white flex flex-col">
        <div className="hidden sm:block">
          <Header />
        </div>
        
        <div className="flex-1 pt-6 sm:pt-24 px-4">
          <div className="mx-auto max-w-4xl">
            <div className="animate-pulse">
              {/* Header skeleton */}
              <div className="mb-8">
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
              
              {/* Image skeleton */}
              <div className="w-full h-64 bg-gray-200 rounded-lg mb-8"></div>
              
              {/* Content skeleton */}
              <div className="space-y-4">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
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
          <div className="mx-auto max-w-4xl">
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Blog Post Not Found</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="space-x-4">
                <button 
                  onClick={() => router.back()}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  Go Back
                </button>
                <button 
                  onClick={() => router.push('/blogs')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  View All Blogs
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <Footer />
        <BottomNav />
      </div>
    );
  }

  if (!blog) {
    return null;
  }

  return (
    <div className="font-sans min-h-screen bg-white flex flex-col">
      <div className="hidden sm:block">
        <Header />
      </div>
      
      <div className="flex-1 pt-6 sm:pt-24 px-4">
        <div className="mx-auto max-w-4xl px-2 sm:px-0">
          {/* Back Button - Desktop Only */}
          <div className="mb-6 hidden sm:block">
            <button
              onClick={() => router.push('/blogs')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Blogs
            </button>
          </div>

          {/* Article Header */}
          <header className="mb-6 sm:mb-8">
            {/* Labels */}
            {blog.labels && Array.isArray(blog.labels) && blog.labels.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                {blog.labels.map((label, index) => (
                  <span 
                    key={index}
                    className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
              {blog.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-gray-600 text-xs sm:text-sm">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(blog.publishedOn || blog.createdAt)}
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {getReadingTime(blog.content)}
              </span>
            </div>
          </header>

          {/* Featured Image */}
          {blog.featuredImage && (
            <div className="relative w-full h-48 sm:h-64 md:h-96 mb-6 sm:mb-8 rounded-lg overflow-hidden">
              <Image
                src={blog.featuredImage}
                alt={blog.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 1024px"
                priority
              />
            </div>
          )}

          {/* Article Content */}
          <article className="mb-8 sm:mb-12">
            <div className="prose prose-sm sm:prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100">
              <div dangerouslySetInnerHTML={{ __html: blog.content }} />
            </div>
          </article>

          {/* Article Footer */}
          <footer className="border-t border-gray-200 pt-6 sm:pt-8 mb-6 sm:mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              {/* Share Buttons */}
              <div className="mb-4 md:mb-0">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Share this article:</h3>
                <div className="flex flex-wrap gap-2 sm:space-x-3 sm:gap-0">
                  <button
                    onClick={() => {
                      const url = window.location.href;
                      const text = `Check out this article: ${blog.title}`;
                      if (navigator.share) {
                        navigator.share({ title: blog.title, text, url });
                      } else {
                        navigator.clipboard.writeText(`${text} ${url}`);
                        alert('Link copied to clipboard!');
                      }
                    }}
                    className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    Share
                  </button>
                  <button
                    onClick={() => {
                      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(window.location.href)}`;
                      window.open(twitterUrl, '_blank');
                    }}
                    className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    Twitter
                  </button>
                </div>
              </div>

            </div>
          </footer>

          {/* Recent Posts Section */}
          {recentPosts.length > 0 && (
            <section className="border-t border-gray-200 pt-8 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Posts</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recentPosts.map((post) => (
                  <article 
                    key={post.id} 
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group cursor-pointer"
                    onClick={() => {
                      console.log('Clicking recent post:', post.title, post.permalink || post.id);
                      window.open(`/blogs/${post.permalink || post.id}`, '_blank');
                    }}
                  >
                    {/* Featured Image */}
                    <div className="relative w-full h-32 bg-gray-200 overflow-hidden">
                      {post.featuredImage ? (
                        <Image
                          src={post.featuredImage}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* Labels */}
                      {post.labels && Array.isArray(post.labels) && post.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {post.labels.slice(0, 1).map((label, index) => (
                            <span 
                              key={index}
                              className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Title */}
                      <h4 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                        {post.title}
                      </h4>

                      {/* Date */}
                      <div className="text-xs text-gray-500">
                        {formatDate(post.publishedOn || post.createdAt)}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
      
      <Footer />
      <BottomNav />
    </div>
  );
}
