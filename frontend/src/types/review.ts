export interface ReviewAuthor {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  isVerified?: boolean;
  isPurchaseVerified?: boolean;
  reviewCount?: number;
  followerCount?: number;
  level?: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface ReviewMedia {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  alt?: string;
  metadata?: {
    width?: number;
    height?: number;
    size?: number;
    duration?: number;
    format?: string;
  };
}

export interface ReviewReply {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  isOfficial?: boolean;
  isModerator?: boolean;
  likes?: number;
  isLiked?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  author: ReviewAuthor;
  
  // Content
  title?: string;
  content: string;
  rating: number;
  pros?: string[];
  cons?: string[];
  
  // Media
  media?: ReviewMedia[];
  
  // Timestamps
  createdAt: Date;
  updatedAt?: Date;
  timestamp?: Date;  // Add missing property
  
  // Interactions
  likes?: number;
  dislikes?: number;
  helpfulVotes?: number;
  unhelpfulVotes?: number;
  notHelpfulVotes?: number;  // Add missing property
  loves?: number;  // Add missing property  
  shares?: number;
  views?: number;
  isLiked?: boolean;
  isDisliked?: boolean;
  isHelpful?: boolean;
  
  // Status and metadata
  status: 'draft' | 'published' | 'pending' | 'rejected';
  moderationStatus?: 'pending' | 'approved' | 'rejected';
  isVerified?: boolean;
  isFeatured?: boolean;
  isEdited?: boolean;
  editedAt?: Date;
  
  // Additional info
  wouldRecommend?: boolean;
  purchaseDate?: Date;
  usageTime?: string;
  variant?: string;
  tags?: string[];
  
  // Replies and interaction
  replies?: ReviewReply[];
  replyCount?: number;
  
  // Reporting
  reportCount?: number;
  reportReasons?: string[];
  
  // Analytics
  engagement?: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
  
  // Additional metadata
  metadata?: Record<string, unknown>;
}

export interface ReviewFormData {
  productId: string;
  title?: string;
  content: string;
  rating: number;
  pros?: string[];
  cons?: string[];
  media?: File[];
  wouldRecommend?: boolean;
  variant?: string;
  tags?: string[];
}

export interface ReviewFilters {
  ratings?: number[];
  dateRange?: string;
  hasMedia?: boolean;
  hasImages?: boolean;
  hasVideos?: boolean;
  hasAudio?: boolean;
  wouldRecommend?: boolean;
  verified?: boolean;
  purchaseVerified?: boolean;
  minLikes?: number;
  minContentLength?: number;
  showOnlyRecent?: boolean;
  highlightPopular?: boolean;
  searchTerm?: string;
  tags?: string[];
}

export interface ReviewSorting {
  field: 'date' | 'rating' | 'likes' | 'helpful' | 'relevance';
  direction: 'asc' | 'desc';
}