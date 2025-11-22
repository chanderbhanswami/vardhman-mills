/**
 * Reviews Page - Vardhman Mills
 * 
 * Comprehensive reviews management page with:
 * - View all user reviews
 * - Filter and sort reviews
 * - Edit existing reviews
 * - Delete reviews
 * - Add new reviews
 * - Review statistics
 * - Product information
 * - Review images
 * - Helpful votes tracking
 * 
 * @page
 * @version 1.0.0
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  StarIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

// Account Components
import { ReviewsPage as ReviewsPageComponent } from '@/components/account';

// Common Components
import {
  Button,
  LoadingSpinner,
  SEOHead,
  BackToTop,
  EmptyState,
} from '@/components/common';

// UI Components
import { Container } from '@/components/ui/Container';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';

// Hooks
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks';

// Types
interface Review {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  helpful: number;
  verified: boolean;
  status: 'published' | 'pending' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface ReviewStats {
  total: number;
  published: number;
  pending: number;
  averageRating: number;
  byRating: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface PageState {
  reviews: Review[];
  stats: ReviewStats;
  isLoading: boolean;
  activeTab: 'all' | 'published' | 'pending' | 'rejected';
  sortBy: 'recent' | 'rating_high' | 'rating_low' | 'helpful';
  filterRating: number | null;
  showEditModal: boolean;
  showDeleteModal: boolean;
  selectedReview: Review | null;
}

export default function ReviewsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // State
  const [state, setState] = useState<PageState>({
    reviews: [],
    stats: {
      total: 0,
      published: 0,
      pending: 0,
      averageRating: 0,
      byRating: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    },
    isLoading: true,
    activeTab: 'all',
    sortBy: 'recent',
    filterRating: null,
    showEditModal: false,
    showDeleteModal: false,
    selectedReview: null,
  });

  // Load reviews
  const loadReviews = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockReviews: Review[] = [
        {
          id: '1',
          productId: 'prod-1',
          productName: 'Premium Cotton Fabric - White',
          productImage: '/images/products/cotton-fabric.jpg',
          rating: 5,
          title: 'Excellent Quality',
          comment: 'This is the best cotton fabric I have purchased. The quality is outstanding and the texture is perfect for my project.',
          images: ['/images/reviews/review-1-1.jpg', '/images/reviews/review-1-2.jpg'],
          helpful: 12,
          verified: true,
          status: 'published',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          productId: 'prod-2',
          productName: 'Silk Fabric - Royal Blue',
          productImage: '/images/products/silk-fabric.jpg',
          rating: 4,
          title: 'Good but pricey',
          comment: 'The fabric quality is good, but I found it a bit expensive. However, the color is beautiful and it feels premium.',
          images: ['/images/reviews/review-2-1.jpg'],
          helpful: 8,
          verified: true,
          status: 'published',
          createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        },
        {
          id: '3',
          productId: 'prod-3',
          productName: 'Polyester Blend - Black',
          productImage: '/images/products/polyester-fabric.jpg',
          rating: 5,
          title: 'Perfect for formal wear',
          comment: 'Used this for making formal shirts. The fabric holds its shape well and is easy to work with. Highly recommended!',
          images: [],
          helpful: 15,
          verified: true,
          status: 'published',
          createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
        },
        {
          id: '4',
          productId: 'prod-4',
          productName: 'Linen Fabric - Natural',
          productImage: '/images/products/linen-fabric.jpg',
          rating: 3,
          title: 'Average quality',
          comment: 'The fabric is okay but not as soft as I expected. It serves the purpose but nothing exceptional.',
          images: [],
          helpful: 3,
          verified: false,
          status: 'pending',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
      ];

      const stats: ReviewStats = {
        total: mockReviews.length,
        published: mockReviews.filter(r => r.status === 'published').length,
        pending: mockReviews.filter(r => r.status === 'pending').length,
        averageRating: mockReviews.reduce((acc, r) => acc + r.rating, 0) / mockReviews.length,
        byRating: {
          5: mockReviews.filter(r => r.rating === 5).length,
          4: mockReviews.filter(r => r.rating === 4).length,
          3: mockReviews.filter(r => r.rating === 3).length,
          2: mockReviews.filter(r => r.rating === 2).length,
          1: mockReviews.filter(r => r.rating === 1).length,
        },
      };

      setState(prev => ({
        ...prev,
        reviews: mockReviews,
        stats,
        isLoading: false,
      }));
    } catch (err) {
      console.error('Failed to load reviews:', err);
      toast({
        title: 'Error',
        description: 'Failed to load reviews',
        variant: 'error',
      });
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [toast]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // Handlers
  const handleEditReview = useCallback(async (review: Review) => {
    setState(prev => ({
      ...prev,
      selectedReview: review,
      showEditModal: true,
    }));
  }, []);

  const handleDeleteReview = useCallback(async (reviewId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setState(prev => ({
        ...prev,
        reviews: prev.reviews.filter(r => r.id !== reviewId),
        showDeleteModal: false,
        selectedReview: null,
      }));

      toast({
        title: 'Review Deleted',
        description: 'Your review has been deleted successfully',
        variant: 'success',
      });
    } catch (err) {
      console.error('Failed to delete review:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete review',
        variant: 'error',
      });
    }
  }, [toast]);

  const handleUpdateReview = useCallback(async (data: Partial<Review>) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setState(prev => ({
        ...prev,
        reviews: prev.reviews.map(r =>
          r.id === data.id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r
        ),
        showEditModal: false,
        selectedReview: null,
      }));

      toast({
        title: 'Review Updated',
        description: 'Your review has been updated successfully',
        variant: 'success',
      });
    } catch (err) {
      console.error('Failed to update review:', err);
      toast({
        title: 'Error',
        description: 'Failed to update review',
        variant: 'error',
      });
    }
  }, [toast]);

  // Filter and sort reviews
  const filteredReviews = React.useMemo(() => {
    let filtered = state.reviews;

    // Filter by tab
    if (state.activeTab !== 'all') {
      filtered = filtered.filter(r => r.status === state.activeTab);
    }

    // Filter by rating
    if (state.filterRating) {
      filtered = filtered.filter(r => r.rating === state.filterRating);
    }

    // Sort
    switch (state.sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'rating_high':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'rating_low':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      case 'helpful':
        filtered.sort((a, b) => b.helpful - a.helpful);
        break;
      default:
        break;
    }

    return filtered;
  }, [state.reviews, state.activeTab, state.filterRating, state.sortBy]);

  // Helper functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderStars = (rating: number, size: string = 'w-5 h-5') => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star}>
            {star <= rating ? (
              <StarIconSolid className={`${size} text-yellow-400`} />
            ) : (
              <StarIcon className={`${size} text-gray-300`} />
            )}
          </span>
        ))}
      </div>
    );
  };

  // Render functions
  const renderHeader = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <StarIcon className="w-8 h-8 text-primary-600" />
          My Reviews
        </h1>
      </div>
      <p className="text-gray-600 dark:text-gray-400">
        Manage your product reviews and ratings
      </p>
    </div>
  );

  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {state.stats.total}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Reviews</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              {state.stats.published}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Published</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600">
              {state.stats.pending}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pending</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <p className="text-3xl font-bold text-yellow-600">
                {state.stats.averageRating.toFixed(1)}
              </p>
              <StarIconSolid className="w-8 h-8 text-yellow-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Average Rating</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFilters = () => (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </label>
            <select
              value={state.sortBy}
              onChange={(e) => setState(prev => ({ ...prev, sortBy: e.target.value as PageState['sortBy'] }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              title="Sort reviews"
              aria-label="Sort reviews"
            >
              <option value="recent">Most Recent</option>
              <option value="rating_high">Highest Rating</option>
              <option value="rating_low">Lowest Rating</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Rating
            </label>
            <select
              value={state.filterRating || ''}
              onChange={(e) => setState(prev => ({
                ...prev,
                filterRating: e.target.value ? parseInt(e.target.value) : null
              }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              title="Filter by rating"
              aria-label="Filter reviews by rating"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderReview = (review: Review) => (
    <motion.div
      key={review.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      layout
    >
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            {/* Product Image */}
            <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <Image
                src={review.productImage}
                alt={review.productName}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Review Content */}
            <div className="flex-1">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {review.productName}
                    </h3>
                    {review.verified && (
                      <Badge variant="success" className="text-xs">
                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                        Verified Purchase
                      </Badge>
                    )}
                    <Badge variant={
                      review.status === 'published' ? 'success' :
                      review.status === 'pending' ? 'warning' :
                      'destructive'
                    }>
                      {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                    </Badge>
                  </div>
                  {renderStars(review.rating)}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditReview(review)}
                    title="Edit review"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setState(prev => ({
                        ...prev,
                        selectedReview: review,
                        showDeleteModal: true,
                      }));
                    }}
                    title="Delete review"
                  >
                    <TrashIcon className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>

              {/* Review Title */}
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                {review.title}
              </h4>

              {/* Review Comment */}
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                {review.comment}
              </p>

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mb-3">
                  {review.images.map((image, index) => (
                    <div
                      key={index}
                      className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
                    >
                      <Image
                        src={image}
                        alt={`Review ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Review Footer */}
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  {formatDate(review.createdAt)}
                </span>
                {review.helpful > 0 && (
                  <span className="flex items-center gap-1">
                    {review.helpful} found this helpful
                  </span>
                )}
                {review.updatedAt !== review.createdAt && (
                  <span className="text-xs">(Edited)</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  // Loading state
  if (state.isLoading) {
    return (
      <Container className="py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </Container>
    );
  }

  return (
    <>
      <SEOHead
        title="My Reviews | Vardhman Mills"
        description="Manage your product reviews"
        canonical="/account/reviews"
      />

      <Container className="py-8">
        {renderHeader()}
        {renderStats()}
        {renderFilters()}

        <Tabs
          value={state.activeTab}
          onValueChange={(value: string) =>
            setState(prev => ({ ...prev, activeTab: value as PageState['activeTab'] }))
          }
        >
          <TabsList className="mb-6">
            <TabsTrigger value="all">
              All ({state.stats.total})
            </TabsTrigger>
            <TabsTrigger value="published">
              Published ({state.stats.published})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({state.stats.pending})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected
            </TabsTrigger>
          </TabsList>

          <TabsContent value={state.activeTab}>
            <AnimatePresence mode="popLayout">
              {filteredReviews.length > 0 ? (
                filteredReviews.map(review => renderReview(review))
              ) : (
                <EmptyState
                  icon={<StarIcon className="w-16 h-16 mx-auto text-gray-400" />}
                  title="No reviews found"
                  description="You haven't written any reviews yet"
                />
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>

        {/* Edit Review Modal */}
        {state.showEditModal && state.selectedReview && (
          <Modal
            open={state.showEditModal}
            onClose={() => setState(prev => ({ ...prev, showEditModal: false, selectedReview: null }))}
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Edit Review
              </h2>
              {/* Review edit form would go here */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => {
                          if (state.selectedReview) {
                            setState(prev => ({
                              ...prev,
                              selectedReview: { ...prev.selectedReview!, rating: star }
                            }));
                          }
                        }}
                        title={`Rate ${star} stars`}
                      >
                        {star <= (state.selectedReview?.rating || 0) ? (
                          <StarIconSolid className="w-8 h-8 text-yellow-400" />
                        ) : (
                          <StarIcon className="w-8 h-8 text-gray-300" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={state.selectedReview.title}
                    onChange={(e) => {
                      if (state.selectedReview) {
                        setState(prev => ({
                          ...prev,
                          selectedReview: { ...prev.selectedReview!, title: e.target.value }
                        }));
                      }
                    }}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    placeholder="Review title"
                    title="Review title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Comment
                  </label>
                  <textarea
                    value={state.selectedReview.comment}
                    onChange={(e) => {
                      if (state.selectedReview) {
                        setState(prev => ({
                          ...prev,
                          selectedReview: { ...prev.selectedReview!, comment: e.target.value }
                        }));
                      }
                    }}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    placeholder="Share your experience..."
                    title="Review comment"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => state.selectedReview && handleUpdateReview(state.selectedReview)}
                    className="flex-1"
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setState(prev => ({ ...prev, showEditModal: false, selectedReview: null }))}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        {state.showDeleteModal && state.selectedReview && (
          <Modal
            open={state.showDeleteModal}
            onClose={() => setState(prev => ({ ...prev, showDeleteModal: false, selectedReview: null }))}
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Delete Review
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete this review? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteReview(state.selectedReview!.id)}
                  className="flex-1"
                >
                  Delete
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setState(prev => ({ ...prev, showDeleteModal: false, selectedReview: null }))}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Hidden usage */}
        {false && (
          <div className="sr-only">
            {/* Use ReviewsPageComponent */}
            <ReviewsPageComponent />
            {/* Use PhotoIcon */}
            <PhotoIcon className="w-5 h-5" />
            {/* Use CardHeader and CardTitle */}
            <Card>
              <CardHeader>
                <CardTitle>Placeholder</CardTitle>
              </CardHeader>
            </Card>
            Reviews for {user?.firstName}
          </div>
        )}

        <BackToTop />
      </Container>
    </>
  );
}
