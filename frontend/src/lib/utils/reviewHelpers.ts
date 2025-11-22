/**
 * Review and Rating Helper Utilities
 * Comprehensive utilities for handling reviews, ratings, and feedback systems
 */

// Types
export interface Review {
  id: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt: Date;
  updatedAt?: Date;
  isVerified?: boolean;
  helpfulCount?: number;
  reportCount?: number;
  images?: string[];
  pros?: string[];
  cons?: string[];
  wouldRecommend?: boolean;
  productId?: string;
  serviceId?: string;
}

export interface RatingStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  verifiedCount: number;
  recommendationRate: number;
}

export interface ReviewFilter {
  rating?: number[];
  verified?: boolean;
  withImages?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
}

/**
 * Calculate average rating from reviews
 */
export function calculateAverageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

/**
 * Calculate rating distribution
 */
export function calculateRatingDistribution(reviews: Review[]): RatingStats['ratingDistribution'] {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  
  reviews.forEach(review => {
    const rating = Math.round(review.rating) as keyof typeof distribution;
    if (rating >= 1 && rating <= 5) {
      distribution[rating]++;
    }
  });
  
  return distribution;
}

/**
 * Get comprehensive rating statistics
 */
export function getRatingStats(reviews: Review[]): RatingStats {
  const totalReviews = reviews.length;
  const averageRating = calculateAverageRating(reviews);
  const ratingDistribution = calculateRatingDistribution(reviews);
  const verifiedCount = reviews.filter(r => r.isVerified).length;
  const recommendCount = reviews.filter(r => r.wouldRecommend).length;
  const recommendationRate = totalReviews > 0 ? (recommendCount / totalReviews) * 100 : 0;
  
  return {
    totalReviews,
    averageRating,
    ratingDistribution,
    verifiedCount,
    recommendationRate: Math.round(recommendationRate * 10) / 10
  };
}

/**
 * Filter reviews based on criteria
 */
export function filterReviews(reviews: Review[], filter: ReviewFilter): Review[] {
  return reviews.filter(review => {
    // Rating filter
    if (filter.rating && filter.rating.length > 0) {
      if (!filter.rating.includes(Math.round(review.rating))) {
        return false;
      }
    }
    
    // Verified filter
    if (filter.verified !== undefined) {
      if (review.isVerified !== filter.verified) {
        return false;
      }
    }
    
    // Images filter
    if (filter.withImages) {
      if (!review.images || review.images.length === 0) {
        return false;
      }
    }
    
    // Date range filter
    if (filter.dateRange) {
      const reviewDate = new Date(review.createdAt);
      if (reviewDate < filter.dateRange.start || reviewDate > filter.dateRange.end) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Sort reviews based on criteria
 */
export function sortReviews(reviews: Review[], sortBy: ReviewFilter['sortBy'] = 'newest'): Review[] {
  const sorted = [...reviews];
  
  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    case 'highest':
      return sorted.sort((a, b) => b.rating - a.rating);
    
    case 'lowest':
      return sorted.sort((a, b) => a.rating - b.rating);
    
    case 'helpful':
      return sorted.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
    
    default:
      return sorted;
  }
}

/**
 * Get top reviews (highest rated with most helpful votes)
 */
export function getTopReviews(reviews: Review[], limit = 5): Review[] {
  return reviews
    .filter(review => review.rating >= 4)
    .sort((a, b) => {
      // Sort by rating first, then by helpful count
      const ratingDiff = b.rating - a.rating;
      if (ratingDiff !== 0) return ratingDiff;
      return (b.helpfulCount || 0) - (a.helpfulCount || 0);
    })
    .slice(0, limit);
}

/**
 * Get recent reviews
 */
export function getRecentReviews(reviews: Review[], days = 30, limit = 10): Review[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return reviews
    .filter(review => new Date(review.createdAt) >= cutoffDate)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

/**
 * Validate review data
 */
export function validateReview(review: Partial<Review>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!review.rating || review.rating < 1 || review.rating > 5) {
    errors.push('Rating must be between 1 and 5');
  }
  
  if (!review.comment || review.comment.trim().length < 10) {
    errors.push('Comment must be at least 10 characters long');
  }
  
  if (review.comment && review.comment.length > 2000) {
    errors.push('Comment must be less than 2000 characters');
  }
  
  if (!review.userId) {
    errors.push('User ID is required');
  }
  
  if (review.title && review.title.length > 100) {
    errors.push('Title must be less than 100 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generate review summary text
 */
export function generateReviewSummary(stats: RatingStats): string {
  if (stats.totalReviews === 0) {
    return 'No reviews yet';
  }
  
  const { totalReviews, averageRating, recommendationRate } = stats;
  const stars = '★'.repeat(Math.round(averageRating)) + '☆'.repeat(5 - Math.round(averageRating));
  
  let summary = `${stars} ${averageRating}/5 (${totalReviews} review${totalReviews !== 1 ? 's' : ''})`;
  
  if (recommendationRate > 0) {
    summary += ` • ${Math.round(recommendationRate)}% recommend`;
  }
  
  return summary;
}

/**
 * Format rating for display
 */
export function formatRating(rating: number, showDecimals = true): string {
  if (showDecimals) {
    return rating.toFixed(1);
  }
  return Math.round(rating).toString();
}

/**
 * Get rating color class based on rating value
 */
export function getRatingColor(rating: number): string {
  if (rating >= 4.5) return 'text-green-600';
  if (rating >= 3.5) return 'text-yellow-600';
  if (rating >= 2.5) return 'text-orange-600';
  return 'text-red-600';
}

/**
 * Get rating badge text
 */
export function getRatingBadge(rating: number): string {
  if (rating >= 4.5) return 'Excellent';
  if (rating >= 3.5) return 'Good';
  if (rating >= 2.5) return 'Average';
  if (rating >= 1.5) return 'Poor';
  return 'Very Poor';
}

/**
 * Calculate review sentiment based on rating and keywords
 */
export function calculateSentiment(review: Review): 'positive' | 'neutral' | 'negative' {
  const { rating, comment } = review;
  
  // Primary sentiment based on rating
  let sentiment: 'positive' | 'neutral' | 'negative';
  if (rating >= 4) sentiment = 'positive';
  else if (rating >= 3) sentiment = 'neutral';
  else sentiment = 'negative';
  
  // Adjust based on comment keywords
  const positiveWords = ['excellent', 'amazing', 'great', 'love', 'perfect', 'outstanding', 'wonderful', 'fantastic'];
  const negativeWords = ['terrible', 'awful', 'hate', 'worst', 'horrible', 'disappointing', 'useless', 'broken'];
  
  const commentLower = comment.toLowerCase();
  const positiveCount = positiveWords.filter(word => commentLower.includes(word)).length;
  const negativeCount = negativeWords.filter(word => commentLower.includes(word)).length;
  
  // Adjust sentiment based on keyword analysis
  if (positiveCount > negativeCount && positiveCount >= 2) {
    sentiment = 'positive';
  } else if (negativeCount > positiveCount && negativeCount >= 2) {
    sentiment = 'negative';
  }
  
  return sentiment;
}

/**
 * Get reviews by sentiment
 */
export function getReviewsBySentiment(reviews: Review[], sentiment: 'positive' | 'neutral' | 'negative'): Review[] {
  return reviews.filter(review => calculateSentiment(review) === sentiment);
}

/**
 * Calculate review engagement score
 */
export function calculateEngagementScore(review: Review): number {
  let score = 0;
  
  // Base score from rating
  score += review.rating * 2;
  
  // Comment length bonus
  if (review.comment) {
    const commentLength = review.comment.length;
    if (commentLength > 100) score += 2;
    if (commentLength > 300) score += 3;
  }
  
  // Additional content bonuses
  if (review.title) score += 1;
  if (review.images && review.images.length > 0) score += 3;
  if (review.pros && review.pros.length > 0) score += 2;
  if (review.cons && review.cons.length > 0) score += 2;
  if (review.isVerified) score += 5;
  if (review.helpfulCount && review.helpfulCount > 0) score += review.helpfulCount;
  
  return score;
}

/**
 * Get featured reviews (high engagement, verified, etc.)
 */
export function getFeaturedReviews(reviews: Review[], limit = 3): Review[] {
  return reviews
    .filter(review => review.isVerified || (review.helpfulCount && review.helpfulCount > 2))
    .sort((a, b) => calculateEngagementScore(b) - calculateEngagementScore(a))
    .slice(0, limit);
}

/**
 * Format time ago for review dates
 */
export function formatReviewDate(date: Date): string {
  const now = new Date();
  const diffInMilliseconds = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}

/**
 * Generate star rating HTML
 */
export function generateStarRating(rating: number, maxStars = 5): string {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);
  
  let html = '';
  
  // Full stars
  for (let i = 0; i < fullStars; i++) {
    html += '<span class="text-yellow-400">★</span>';
  }
  
  // Half star
  if (hasHalfStar) {
    html += '<span class="text-yellow-400">☆</span>';
  }
  
  // Empty stars
  for (let i = 0; i < emptyStars; i++) {
    html += '<span class="text-gray-300">☆</span>';
  }
  
  return html;
}

/**
 * Export review data to CSV format
 */
export function exportReviewsToCSV(reviews: Review[]): string {
  const headers = [
    'ID',
    'User Name',
    'Rating',
    'Title',
    'Comment',
    'Created At',
    'Verified',
    'Helpful Count',
    'Would Recommend'
  ];
  
  const csvData = reviews.map(review => [
    review.id,
    review.userName || 'Anonymous',
    review.rating,
    review.title || '',
    review.comment.replace(/"/g, '""'), // Escape quotes
    review.createdAt.toISOString(),
    review.isVerified ? 'Yes' : 'No',
    review.helpfulCount || 0,
    review.wouldRecommend ? 'Yes' : 'No'
  ]);
  
  const csvContent = [headers, ...csvData]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');
  
  return csvContent;
}

/**
 * Review utilities collection
 */
export const reviewHelpers = {
  calculateAverageRating,
  calculateRatingDistribution,
  getRatingStats,
  filterReviews,
  sortReviews,
  getTopReviews,
  getRecentReviews,
  validateReview,
  generateReviewSummary,
  formatRating,
  getRatingColor,
  getRatingBadge,
  calculateSentiment,
  getReviewsBySentiment,
  calculateEngagementScore,
  getFeaturedReviews,
  formatReviewDate,
  generateStarRating,
  exportReviewsToCSV
};

// Export default
const reviewUtilities = {
  calculateAverageRating,
  calculateRatingDistribution,
  getRatingStats,
  filterReviews,
  sortReviews,
  getTopReviews,
  getRecentReviews,
  validateReview,
  generateReviewSummary,
  formatRating,
  getRatingColor,
  getRatingBadge,
  calculateSentiment,
  getReviewsBySentiment,
  calculateEngagementScore,
  getFeaturedReviews,
  formatReviewDate,
  generateStarRating,
  exportReviewsToCSV,
  reviewHelpers
};

export default reviewUtilities;
