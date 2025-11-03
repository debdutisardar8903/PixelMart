'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ref, get, push, set } from 'firebase/database';
import { database } from '@/lib/firebase';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import { useCart } from '@/components/contexts/CartContext';
import { useWishlist } from '@/components/contexts/WishlistContext';
import { useAuth } from '@/components/contexts/AuthContext';

export default function ProductDetails() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });
  const [reviews, setReviews] = useState([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Keyboard navigation for image gallery and fullscreen modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Close fullscreen on Escape
      if (e.key === 'Escape' && isFullscreenOpen) {
        setIsFullscreenOpen(false);
        return;
      }
      
      if (!product?.images || product.images.length <= 1) return;
      
      if (e.key === 'ArrowLeft') {
        setSelectedImageIndex(selectedImageIndex === 0 ? product.images.length - 1 : selectedImageIndex - 1);
      } else if (e.key === 'ArrowRight') {
        setSelectedImageIndex(selectedImageIndex === product.images.length - 1 ? 0 : selectedImageIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, product, isFullscreenOpen]);

  // Calculate rating distribution
  const calculateRatingDistribution = (reviewsArray) => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const totalReviews = reviewsArray.length;
    
    reviewsArray.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating]++;
      }
    });
    
    // Convert to percentages
    const percentages = {};
    Object.keys(distribution).forEach(rating => {
      percentages[rating] = totalReviews > 0 ? (distribution[rating] / totalReviews) * 100 : 0;
    });
    
    return { distribution, percentages, totalReviews };
  };

  // Calculate average rating
  const calculateAverageRating = (reviewsArray) => {
    if (reviewsArray.length === 0) return 0;
    
    const totalRating = reviewsArray.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / reviewsArray.length).toFixed(1);
  };

  // Fetch reviews from database
  const fetchReviews = async (productId) => {
    try {
      const reviewsRef = ref(database, `reviews/${productId}`);
      const snapshot = await get(reviewsRef);
      
      if (snapshot.exists()) {
        const reviewsData = snapshot.val();
        const reviewsArray = Object.entries(reviewsData).map(([id, review]) => ({
          id,
          ...review,
          createdAt: new Date(review.createdAt).toLocaleDateString()
        }));
        
        // Sort reviews by creation date (newest first)
        reviewsArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setReviews(reviewsArray);
        console.log('Reviews fetched:', reviewsArray);
      } else {
        setReviews([]);
        console.log('No reviews found for this product');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const productRef = ref(database, `products/${params.id}`);
        const snapshot = await get(productRef);
        
        if (snapshot.exists()) {
          const productData = snapshot.val();
          const product = {
            id: params.id,
            name: productData.name || '',
            image: productData.image || '',
            images: productData.images || [productData.image || ''],
            price: productData.price || 0,
            originalPrice: productData.originalPrice || null,
            discount: productData.discount || null,
            rating: productData.rating || 0,
            reviews: productData.reviews || 0,
            description: productData.description || '',
            shortDescription: productData.shortDescription || '',
            category: productData.category || '',
            tags: productData.tags || [],
            features: productData.features || [],
            ...productData // Include any additional fields
          };
          
          setProduct(product);
          setSelectedImageIndex(0); // Reset image selection when product changes
          
          // Fetch reviews for this product
          await fetchReviews(params.id);
          
          console.log('Product fetched from database:', product);
        } else {
          console.log('Product not found in database');
          setProduct(null);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const handleAddToCart = () => {
    if (product) {
      const cartItem = {
        id: product.id.toString(),
        productId: product.id.toString(),
        name: product.name,
        title: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity,
        originalPrice: product.originalPrice,
        category: product.category || 'digital',
        downloadSize: 'Unknown'
      };
      
      addToCart(cartItem);
      alert(`Added ${quantity} ${product.name} to cart!`);
    }
  };

  const handleWishlistToggle = () => {
    if (product) {
      if (isInWishlist(product.id)) {
        removeFromWishlist(product.id);
      } else {
        addToWishlist(product);
      }
    }
  };

  const handleBuyNow = () => {
    if (product) {
      console.log('Buy Now clicked - Product ID:', product.id, 'Quantity:', quantity);
      const checkoutUrl = `/checkout?productId=${product.id}&quantity=${quantity}`;
      console.log('Navigating to:', checkoutUrl);
      router.push(checkoutUrl);
    } else {
      console.log('No product found for Buy Now');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please login to submit a review');
      return;
    }
    
    if (!reviewForm.comment.trim()) {
      alert('Please write a review comment');
      return;
    }
    
    setIsSubmittingReview(true);
    
    try {
      // Get user profile data
      const userRef = ref(database, `users/${user.uid}`);
      const userSnapshot = await get(userRef);
      
      let userName = user.displayName || 'Anonymous User';
      let userPhotoUrl = null;
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        userName = userData.displayName || userName;
        userPhotoUrl = userData.profileImageUrl || null;
      }
      
      // Create review data
      const reviewData = {
        userId: user.uid,
        userName: userName,
        userPhotoUrl: userPhotoUrl,
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
        createdAt: Date.now()
      };
      
      // Save review to database
      const reviewsRef = ref(database, `reviews/${params.id}`);
      const newReviewRef = push(reviewsRef);
      await set(newReviewRef, reviewData);
      
      // Refresh reviews
      await fetchReviews(params.id);
      
      // Reset form
      setReviewForm({ rating: 5, comment: '' });
      setShowReviewForm(false);
      
      alert('Thank you for your review!');
      console.log('Review submitted successfully');
      
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="font-sans min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 pt-24 px-4">
          <div className="mx-auto max-w-6xl">
            <div className="animate-pulse">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="aspect-square bg-gray-200 rounded-lg"></div>
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="font-sans min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 pt-24 px-4">
          <div className="mx-auto max-w-6xl text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="font-sans min-h-screen bg-white flex flex-col">
      <Header />
      
      {/* Product Details */}
      <div className="flex-1 pt-24 px-4">
        <div className="mx-auto max-w-6xl">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
              <li>
                <button onClick={() => router.push('/')} className="hover:text-gray-900">
                  Home
                </button>
              </li>
              <li>/</li>
              <li>
                <button 
                  onClick={() => {
                    const category = product.category?.toLowerCase();
                    // Map categories to their respective pages
                    const categoryRoutes = {
                      'ebooks': '/ebooks',
                      'courses': '/courses',
                      'templates': '/templates',
                      'digital-tools': '/digital-tools',
                      'music-audio': '/music-audio',
                      'graphics-design': '/graphics-design'
                    };
                    
                    // Navigate to specific category page or general categories page
                    const route = categoryRoutes[category] || '/categories';
                    router.push(route);
                  }}
                  className="text-gray-400 hover:text-gray-900 transition-colors duration-200"
                >
                  {product.category}
                </button>
              </li>
              <li>/</li>
              <li>
                <span className="text-gray-900 font-medium">{product.name}</span>
              </li>
            </ol>
          </nav>

          {/* Product Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-pointer group">
                <Image
                  src={product.images ? product.images[selectedImageIndex] : product.image}
                  alt={product.name}
                  width={800}
                  height={800}
                  className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                  onClick={() => setIsFullscreenOpen(true)}
                />
                
                {/* Zoom indicator */}
                <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                {/* Navigation Arrows */}
                {product.images && product.images.length > 1 && (
                  <>
                    {/* Previous Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex(selectedImageIndex === 0 ? product.images.length - 1 : selectedImageIndex - 1);
                      }}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-all duration-200 z-10"
                    >
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    {/* Next Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex(selectedImageIndex === product.images.length - 1 ? 0 : selectedImageIndex + 1);
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-all duration-200 z-10"
                    >
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-6 gap-1.5">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square overflow-hidden rounded-md bg-gray-100 border-2 transition-all duration-200 ${
                        selectedImageIndex === index 
                          ? 'border-black shadow-sm' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} - Image ${index + 1}`}
                        width={120}
                        height={120}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
              
              {/* Image Counter */}
              {product.images && product.images.length > 1 && (
                <div className="text-center text-sm text-gray-600">
                  {selectedImageIndex + 1} of {product.images.length}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Title and Rating */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <p className="text-gray-600 text-lg mb-4">{product.shortDescription}</p>
                
                {/* Rating */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(reviews.length > 0 ? calculateAverageRating(reviews) : product.rating || 0) 
                            ? 'text-yellow-400' 
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-gray-600">
                    {reviews.length > 0 ? calculateAverageRating(reviews) : product.rating || 0} ({reviews.length > 0 ? reviews.length : product.reviews || 0} review{(reviews.length > 0 ? reviews.length : product.reviews || 0) !== 1 ? 's' : ''})
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
                  {product.originalPrice && (
                    <>
                      <span className="text-xl text-gray-500 line-through">₹{product.originalPrice}</span>
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-sm font-medium rounded">
                        {product.discount}% OFF
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                  >
                    Buy Now
                  </button>
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 border border-black text-black py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
                
                {/* Wishlist Button */}
                <button
                  onClick={handleWishlistToggle}
                  className={`w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-lg border transition-colors ${
                    isInWishlist(product.id)
                      ? 'border-red-500 text-red-500 bg-red-50'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg
                    className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : 'stroke-current fill-none'}`}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span>{isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
                </button>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">What's Included:</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Product Description */}
          <div className="mt-12 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Reviews Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
              
              {/* Review Summary */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {reviews.length > 0 ? calculateAverageRating(reviews) : product.rating || 0}
                    </div>
                    <div className="flex items-center justify-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(reviews.length > 0 ? calculateAverageRating(reviews) : product.rating || 0) 
                              ? 'text-yellow-400' 
                              : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {reviews.length > 0 ? `${reviews.length} review${reviews.length !== 1 ? 's' : ''}` : 'No reviews yet'}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const { percentages, distribution } = calculateRatingDistribution(reviews);
                        return (
                          <div key={stars} className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600 w-8">{stars}★</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${percentages[stars] || 0}%`
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 w-8">
                              {distribution[stars] || 0}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Write Review Button */}
              <div className="mb-6 text-center">
                {user ? (
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200"
                  >
                    {showReviewForm ? 'Cancel Review' : 'Write a Review'}
                  </button>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">Please login to write a review</p>
                    <button
                      onClick={() => router.push('/auth')}
                      className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200"
                    >
                      Login to Review
                    </button>
                  </div>
                )}
              </div>

              {/* Review Form */}
              {showReviewForm && (
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Write Your Review</h3>
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    {/* User Info Display */}
                    <div className="bg-white p-4 rounded-lg border">
                      <p className="text-sm text-gray-600">
                        Reviewing as: <span className="font-medium text-gray-900">{user?.displayName || 'Anonymous User'}</span>
                      </p>
                    </div>

                    {/* Rating Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating
                      </label>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm({...reviewForm, rating: star})}
                            className={`w-8 h-8 ${
                              star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'
                            } hover:text-yellow-400 transition-colors`}
                          >
                            <svg fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                        ))}
                        <span className="ml-2 text-sm text-gray-600">
                          {reviewForm.rating} star{reviewForm.rating !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Comment Input */}
                    <div>
                      <label htmlFor="reviewComment" className="block text-sm font-medium text-gray-700 mb-2">
                        Your Review
                      </label>
                      <textarea
                        id="reviewComment"
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                        placeholder="Share your experience with this product..."
                        required
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center space-x-4">
                      <button
                        type="submit"
                        disabled={isSubmittingReview}
                        className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        disabled={isSubmittingReview}
                        className="text-gray-600 hover:text-gray-800 transition-colors duration-200 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Customer Reviews */}
              {reviews.length > 0 && (
                <div className="space-y-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Customer Reviews ({reviews.length})</h3>
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
                          {review.userPhotoUrl ? (
                            <Image
                              src={review.userPhotoUrl}
                              alt={review.userName}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {review.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{review.userName}</div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">{review.createdAt}</span>
                            {user && review.userId === user.uid && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Your Review</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {isFullscreenOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          {/* Close button */}
          <button
            onClick={() => setIsFullscreenOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 z-60"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image container */}
          <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
            <Image
              src={product.images ? product.images[selectedImageIndex] : product.image}
              alt={product.name}
              width={1200}
              height={1200}
              className="max-w-full max-h-full object-contain"
            />

            {/* Navigation arrows for fullscreen */}
            {product.images && product.images.length > 1 && (
              <>
                {/* Previous Button */}
                <button
                  onClick={() => setSelectedImageIndex(selectedImageIndex === 0 ? product.images.length - 1 : selectedImageIndex - 1)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                {/* Next Button */}
                <button
                  onClick={() => setSelectedImageIndex(selectedImageIndex === product.images.length - 1 ? 0 : selectedImageIndex + 1)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Image counter */}
            {product.images && product.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                {selectedImageIndex + 1} of {product.images.length}
              </div>
            )}
          </div>

          {/* Click outside to close */}
          <div 
            className="absolute inset-0 -z-10" 
            onClick={() => setIsFullscreenOpen(false)}
          ></div>
        </div>
      )}

      {/* Footer - Always at bottom */}
      <Footer />
    </div>
  );
}
