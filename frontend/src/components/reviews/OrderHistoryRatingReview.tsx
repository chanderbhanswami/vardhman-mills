'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  StarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  ShoppingBagIcon,
  TagIcon,
  CreditCardIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CameraIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  ShareIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ArrowPathIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
  ShoppingBagIcon as ShoppingBagIconSolid
} from '@heroicons/react/24/solid';

// UI Components
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Progress } from '@/components/ui/Progress';
import { Tooltip } from '@/components/ui/Tooltip';
import { Modal } from '@/components/ui/Modal';
import { Rating } from '@/components/ui/Rating';
import { TextArea } from '@/components/ui/TextArea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Switch } from '@/components/ui/Switch';
import { format } from 'date-fns';
import Image from 'next/image';

// Utility function
const formatDate = (date: Date) => format(date, 'MMM dd, yyyy');
import { Skeleton } from '@/components/ui/Skeleton';
import { Separator } from '@/components/ui/Separator';
import { DatePicker } from '@/components/ui/DatePicker';

interface AnalyticsEventData {
  [key: string]: string | number | boolean | undefined;
}

// Utils
import { cn } from '@/lib/utils';

// Types
interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productBrand: string;
  productCategory: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variant?: {
    size?: string;
    color?: string;
    style?: string;
    material?: string;
  };
  reviewable: boolean;
  hasReviewed: boolean;
  review?: {
    id: string;
    rating: number;
    text?: string;
    media?: string[];
    photos?: { url: string; caption?: string }[];
    videos?: { url: string; caption?: string; thumbnail?: string }[];
    createdAt: Date;
    updatedAt?: Date;
    status: 'pending' | 'approved' | 'rejected';
    helpful: number;
    notHelpful: number;
    verified: boolean;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  placedAt: Date;
  deliveredAt?: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  paymentMethod: 'card' | 'paypal' | 'bank_transfer' | 'cod' | 'wallet';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingMethod: 'standard' | 'express' | 'overnight' | 'pickup';
  totalAmount: number;
  discountAmount?: number;
  shippingCost?: number;
  taxAmount?: number;
  items: OrderItem[];
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  trackingNumber?: string;
  notes?: string;
  reviewStats?: {
    totalReviewable: number;
    totalReviewed: number;
    averageRating: number;
    lastReviewDate?: Date;
  };
}

interface ReviewFormData {
  rating: number;
  text: string;
  media: File[];
  anonymous: boolean;
  allowContact: boolean;
  tags: string[];
}

interface FilterOptions {
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: string[];
  paymentMethod?: string[];
  hasReviews?: boolean;
  needsReview?: boolean;
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
  hasMedia?: boolean;
  hasVideo?: boolean;
  hasIssues?: boolean;
  minRating?: number;
  maxRating?: number;
  tags?: string[];
}

interface SortOptions {
  field: 'placedAt' | 'deliveredAt' | 'totalAmount' | 'orderNumber';
  direction: 'asc' | 'desc';
}

export interface OrderHistoryRatingReviewProps {
  // Data
  orders?: Order[];
  isLoading?: boolean;
  hasNextPage?: boolean;
  
  // Configuration
  variant?: 'full' | 'compact' | 'card' | 'list';
  showFilters?: boolean;
  showSearch?: boolean;
  showSorting?: boolean;
  showOrderDetails?: boolean;
  showItemDetails?: boolean;
  showReviewForm?: boolean;
  showReviewStats?: boolean;
  showBulkActions?: boolean;
  enableQuickReview?: boolean;
  enableInlineEdit?: boolean;
  itemsPerPage?: number;
  
  // Review Configuration
  maxReviewLength?: number;
  allowMedia?: boolean;
  allowAnonymous?: boolean;
  requireVerification?: boolean;
  moderationEnabled?: boolean;
  
  // Styling
  className?: string;
  cardClassName?: string;
  filterClassName?: string;
  
  // Callbacks
  onOrderSelect?: (orderId: string) => void;
  onItemSelect?: (orderId: string, itemId: string) => void;
  onReviewSubmit?: (orderId: string, itemId: string, reviewData: ReviewFormData) => void;
  onReviewEdit?: (reviewId: string, reviewData: ReviewFormData) => void;
  onReviewDelete?: (reviewId: string) => void;
  onReviewHelpful?: (reviewId: string, helpful: boolean) => void;
  onOrderReorder?: (orderId: string) => void;
  onOrderCancel?: (orderId: string) => void;
  onOrderReturn?: (orderId: string, itemIds: string[]) => void;
  onLoadMore?: () => void;
  onFilterChange?: (filters: FilterOptions) => void;
  onSortChange?: (sort: SortOptions) => void;
  
  // Analytics
  onAnalyticsEvent?: (event: string, data: AnalyticsEventData) => void;
}

// Individual order item review component
const OrderItemReview: React.FC<{
  order: Order;
  item: OrderItem;
  enableQuickReview?: boolean;
  enableInlineEdit?: boolean;
  onReviewSubmit?: (reviewData: ReviewFormData) => void;
  onReviewEdit?: (reviewData: ReviewFormData) => void;
  onReviewDelete?: () => void;
  onReviewHelpful?: (reviewId: string, helpful: boolean) => void;
  className?: string;
}> = ({
  order,
  item,
  enableQuickReview = true,
  enableInlineEdit = true,
  onReviewSubmit,
  onReviewEdit,
  onReviewDelete,
  onReviewHelpful,
  className
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showFullReview, setShowFullReview] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviewData, setReviewData] = useState<ReviewFormData>({
    rating: item.review?.rating || 0,
    text: item.review?.text || '',
    media: [],
    anonymous: false,
    allowContact: true,
    tags: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuickRating = async (rating: number) => {
    if (!enableQuickReview || item.hasReviewed) return;
    
    setIsSubmitting(true);
    try {
      await onReviewSubmit?.({
        ...reviewData,
        rating,
        text: ''
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (reviewData.rating === 0) return;
    
    setIsSubmitting(true);
    try {
      if (item.hasReviewed && item.review) {
        await onReviewEdit?.(reviewData);
      } else {
        await onReviewSubmit?.(reviewData);
      }
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canReview = item.reviewable && order.status === 'delivered';
  const daysAgo = order.deliveredAt ? 
    Math.floor((Date.now() - order.deliveredAt.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <Card className={cn('p-4', className)}>
      <div className="space-y-4">
        {/* Item Header */}
          {/* Product information header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <ShoppingBagIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{item.productName}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{item.productBrand}</span>
                {item.productCategory && (
                  <>
                    <span>•</span>
                    <span>{item.productCategory}</span>
                  </>
                )}
                {item.productSku && (
                  <>
                    <span>•</span>
                    <span>SKU: {item.productSku}</span>
                  </>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-gray-900">₹{item.totalPrice.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
          <Avatar
            src={item.productImage}
            alt={item.productName}
            fallback={item.productName.charAt(0)}
            size="lg"
            className="rounded-lg"
          />
          
          <div className="flex-1 space-y-2">
            <div>
              <h4 className="font-semibold text-gray-900">{item.productName}</h4>
              <p className="text-sm text-gray-600">{item.productBrand}</p>
              <p className="text-xs text-gray-500">SKU: {item.productSku}</p>
            </div>
            
            {item.variant && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(item.variant).map(([key, value]) => (
                  value && (
                    <Badge key={key} variant="secondary" size="sm">
                      {key}: {value}
                    </Badge>
                  )
                ))}
              </div>
            )}
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Qty: {item.quantity}</span>
              <span>${item.unitPrice.toFixed(2)} each</span>
              <span className="font-medium">${item.totalPrice.toFixed(2)} total</span>
            </div>
          </div>
          
          <div className="text-right">
            {canReview ? (
              <Badge variant="outline" className="text-green-600 border-green-600">
                Reviewable
              </Badge>
            ) : (
              <Badge variant="secondary">
                {!item.reviewable ? 'Not Reviewable' : 
                 order.status !== 'delivered' ? 'Order Pending' : 'Reviewed'}
              </Badge>
            )}
          </div>
        </div>

        {/* Review Section */}
        {canReview && !item.hasReviewed && !isEditing && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">Rate this product</p>
              <p className="text-xs text-gray-500">Delivered {daysAgo} days ago</p>
            </div>
            
            {enableQuickReview && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Quick rating:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleQuickRating(star)}
                      disabled={isSubmitting}
                      className="p-1 hover:scale-110 transition-transform disabled:opacity-50"
                      title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                      aria-label={`Give ${star} star rating`}
                    >
                      <StarIcon className="w-6 h-6 text-yellow-400 hover:text-yellow-500" />
                    </button>
                  ))}
                </div>
                <span className="text-sm text-gray-500">or</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  disabled={isSubmitting}
                >
                  Write Review
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Existing Review Display */}
        {item.hasReviewed && item.review && !isEditing && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Rating value={item.review.rating} readOnly size="sm" />
                <span className="text-sm font-medium">Your Review</span>
                <Badge 
                  variant={item.review.status === 'approved' ? 'default' : 
                          item.review.status === 'pending' ? 'secondary' : 'destructive'}
                  size="sm"
                >
                  {item.review.status}
                </Badge>
                {item.review.verified && (
                  <Badge variant="outline" size="sm" className="text-green-600 border-green-600">
                    Verified
                  </Badge>
                )}
              </div>
              
              {enableInlineEdit && (
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(true)}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onReviewDelete}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
            
            {item.review.text && (
              <div className="space-y-2">
                <p className={cn(
                  'text-sm text-gray-700',
                  !showFullReview && item.review.text.length > 200 && 'line-clamp-3'
                )}>
                  {item.review.text}
                </p>
                {item.review.text.length > 200 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowFullReview(!showFullReview)}
                  >
                    {showFullReview ? 'Show Less' : 'Show More'}
                  </Button>
                )}
              </div>
            )}

            {/* Review Media Gallery */}
            {(item.review.photos?.length || item.review.videos?.length) && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  {item.review.photos?.length && (
                    <span className="flex items-center gap-1">
                      <CameraIcon className="w-4 h-4" />
                      {item.review.photos.length} photo{item.review.photos.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  {item.review.videos?.length && (
                    <span className="flex items-center gap-1">
                      <VideoCameraIcon className="w-4 h-4" />
                      {item.review.videos.length} video{item.review.videos.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  {/* Review Photos */}
                  {item.review.photos?.map((photo, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={photo.url}
                        alt={`Review photo ${index + 1}`}
                        width={64}
                        height={64}
                        className="w-full h-16 object-cover rounded-lg cursor-pointer hover:opacity-80"
                        onClick={() => {
                          setSelectedPhoto(photo.url);
                          setShowMediaModal(true);
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-opacity" />
                    </div>
                  ))}
                  
                  {/* Review Videos */}
                  {item.review.videos?.map((video, index) => (
                    <div key={index} className="relative group">
                      <div className="w-full h-16 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200">
                        <VideoCameraIcon className="w-6 h-6 text-gray-500" />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Reviewed {new Date(item.review.createdAt).toLocaleDateString()}</span>
                {item.review.helpful > 0 && (
                  <span className="flex items-center gap-1">
                    <HandThumbUpIcon className="w-4 h-4" />
                    {item.review.helpful}
                  </span>
                )}
                {item.review.updatedAt && (
                  <span>Updated {new Date(item.review.updatedAt).toLocaleDateString()}</span>
                )}
              </div>

              {/* Review Actions */}
              <div className="flex items-center gap-2">
                {/* Helpful/Unhelpful voting */}
                <div className="flex items-center gap-1 border rounded-md p-1">
                  <Tooltip content="Mark as helpful">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => item.review && onReviewHelpful?.(item.review.id, true)}
                      className="h-7 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      <HandThumbUpIcon className="w-3 h-3" />
                      <span className="text-xs ml-1">{item.review?.helpful || 0}</span>
                    </Button>
                  </Tooltip>
                  
                  <Tooltip content="Mark as not helpful">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => item.review && onReviewHelpful?.(item.review.id, false)}
                      className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <HandThumbDownIcon className="w-3 h-3" />
                      <span className="text-xs ml-1">{item.review?.notHelpful || 0}</span>
                    </Button>
                  </Tooltip>
                </div>

                {/* Share review */}
                <Tooltip content="Share review">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Share functionality would be implemented here
                      navigator.clipboard.writeText(`Check out this review: ${item.review?.text || 'Great product!'}`);
                    }}
                    className="h-7 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <ShareIcon className="w-3 h-3" />
                  </Button>
                </Tooltip>

                {/* Add to favorites */}
                <Tooltip content={isFavorite ? "Remove from favorites" : "Add to favorites"}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={cn(
                      "h-7 px-2",
                      isFavorite 
                        ? "text-pink-600 hover:text-pink-700 hover:bg-pink-50" 
                        : "text-gray-400 hover:text-pink-600 hover:bg-pink-50"
                    )}
                  >
                    {isFavorite ? (
                      <HeartIconSolid className="w-3 h-3" />
                    ) : (
                      <HeartIcon className="w-3 h-3" />
                    )}
                  </Button>
                </Tooltip>

                {/* Review discussion */}
                <Tooltip content="Join discussion">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                  >
                    <ChatBubbleLeftRightIcon className="w-3 h-3" />
                  </Button>
                </Tooltip>
              </div>
            </div>
          </div>
        )}

        {/* Review Form */}
        {isEditing && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating *
              </label>
              <Rating
                value={reviewData.rating}
                onChange={(rating) => setReviewData(prev => ({ ...prev, rating }))}
                size="lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review (optional)
              </label>
              <TextArea
                value={reviewData.text}
                onChange={(e) => setReviewData(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Share your experience with this product..."
                rows={4}
                className="resize-none"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <Checkbox
                checked={reviewData.anonymous}
                onChange={(e) => setReviewData(prev => ({ ...prev, anonymous: e.target.checked }))}
                label="Post anonymously"
              />
              <Checkbox
                checked={reviewData.allowContact}
                onChange={(e) => setReviewData(prev => ({ ...prev, allowContact: e.target.checked }))}
                label="Allow seller to contact me"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={handleReviewSubmit}
                disabled={reviewData.rating === 0 || isSubmitting}
              >
                {isSubmitting ? 'Saving...' : item.hasReviewed ? 'Update Review' : 'Submit Review'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Media Modal */}
      <Modal
        open={showMediaModal}
        onClose={() => {
          setShowMediaModal(false);
          setSelectedPhoto(null);
        }}
        title="Review Media"
        size="lg"
      >
        <div className="space-y-4">
          {selectedPhoto && (
            <div className="text-center">
              <Image
                src={selectedPhoto}
                alt="Review photo"
                width={800}
                height={600}
                className="max-w-full max-h-96 mx-auto rounded-lg object-contain"
              />
            </div>
          )}
          
          {/* Additional media navigation could go here */}
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowMediaModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

// Order card component
const OrderCard: React.FC<{
  order: Order;
  variant?: 'full' | 'compact' | 'card';
  showItemDetails?: boolean;
  enableQuickReview?: boolean;
  enableInlineEdit?: boolean;
  onItemReviewSubmit?: (itemId: string, reviewData: ReviewFormData) => void;
  onItemReviewEdit?: (reviewId: string, reviewData: ReviewFormData) => void;
  onItemReviewDelete?: (reviewId: string) => void;
  onOrderReorder?: () => void;
  onOrderCancel?: () => void;
  onOrderReturn?: (itemIds: string[]) => void;
  onReviewHelpful?: (reviewId: string, helpful: boolean) => void;
  className?: string;
}> = ({
  order,
  variant = 'full',
  showItemDetails = true,
  enableQuickReview = true,
  enableInlineEdit = true,
  onItemReviewSubmit,
  onItemReviewEdit,
  onItemReviewDelete,
  onOrderReorder,
  onOrderCancel,
  onOrderReturn,
  onReviewHelpful,
  className
}) => {
  const [expanded, setExpanded] = useState(variant === 'full');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-50 border-green-200';
      case 'shipped': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'processing': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      case 'returned': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      case 'refunded': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const reviewedItems = order.items.filter(item => item.hasReviewed);
  const reviewableItems = order.items.filter(item => item.reviewable && !item.hasReviewed);
  
  // Calculate average rating for reviewed items
  const averageRating = reviewedItems.length > 0 
    ? reviewedItems.reduce((sum, item) => sum + (item.review?.rating || 0), 0) / reviewedItems.length
    : 0;

  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Order Header */}
      <div className="p-6 border-b">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Order #{order.orderNumber}
              </h3>
              <Badge className={cn('border', getStatusColor(order.status))}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                <span>Placed {order.placedAt.toLocaleDateString()}</span>
              </div>
              {order.deliveredAt && (
                <div className="flex items-center gap-1">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Delivered {order.deliveredAt.toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <CreditCardIcon className="w-4 h-4" />
                <span className={getPaymentStatusColor(order.paymentStatus)}>
                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <span className="text-gray-600">
                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
              </span>
              <span className="font-semibold text-gray-900">
                ${order.totalAmount.toFixed(2)}
              </span>
              {order.reviewStats && (
                <span className="text-gray-600">
                  {order.reviewStats.totalReviewed}/{order.reviewStats.totalReviewable} reviewed
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {order.trackingNumber && (
              <Button size="sm" variant="outline">
                <TruckIcon className="w-4 h-4 mr-2" />
                Track
              </Button>
            )}
            
            {variant !== 'full' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <ChevronUpIcon className="w-4 h-4" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4" />
                )}
              </Button>
            )}
            
            <div className="relative">
              <div className="flex items-center gap-2">
                {/* Selection checkbox for bulk actions */}
                <button
                  onClick={() => {
                    const newSelection = selectedItems.includes(order.id) 
                      ? selectedItems.filter(id => id !== order.id)
                      : [...selectedItems, order.id];
                    setSelectedItems(newSelection);
                  }}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                >
                  {selectedItems.includes(order.id) ? (
                    <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                  ) : (
                    <div className="w-4 h-4 border border-gray-300 rounded" />
                  )}
                  <span className="sr-only">Select Order</span>
                </button>

                {/* Order Action Buttons */}
                {onOrderReorder && (
                  <Tooltip content="Reorder all items">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onOrderReorder}
                      className="flex items-center gap-1"
                    >
                      <ArrowPathIcon className="w-4 h-4" />
                      Reorder
                    </Button>
                  </Tooltip>
                )}
                
                {onOrderCancel && order.status === 'processing' && (
                  <Tooltip content="Cancel this order">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onOrderCancel}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      <XCircleIcon className="w-4 h-4" />
                      Cancel
                    </Button>
                  </Tooltip>
                )}
                
                {onOrderReturn && order.status === 'delivered' && (
                  <Tooltip content="Return eligible items">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const returnableItems = order.items.map(item => item.id);
                        onOrderReturn(returnableItems);
                      }}
                      className="flex items-center gap-1 text-orange-600 hover:text-orange-700"
                    >
                      <TruckIcon className="w-4 h-4" />
                      Return
                    </Button>
                  </Tooltip>
                )}

                <Button size="sm" variant="outline">
                  <EyeIcon className="w-4 h-4 mr-2" />
                  Actions
                </Button>
                
                {selectedItems.includes(order.id) && (
                  <Badge variant="secondary" className="ml-2">Selected</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Review Progress */}
        {order.reviewStats && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Review Progress</span>
              <span className="text-sm text-gray-600">
                {Math.round((order.reviewStats.totalReviewed / order.reviewStats.totalReviewable) * 100)}%
              </span>
            </div>
            <Progress 
              value={(order.reviewStats.totalReviewed / order.reviewStats.totalReviewable) * 100}
              className="h-2"
            />
          </div>
        )}

        {/* Reviewed Items Summary */}
        {reviewedItems.length > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  {reviewedItems.length} of {order.items.length} items reviewed
                </span>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon 
                    key={i} 
                    className={cn(
                      'w-4 h-4',
                      i < averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    )} 
                  />
                ))}
                <span className="text-sm text-gray-600 ml-2">
                  {averageRating.toFixed(1)} avg
                </span>
              </div>
            </div>
            
            {/* Review time indicator */}
            <div className="flex items-center gap-1 mt-2 text-xs text-green-700">
              <ClockIcon className="w-3 h-3" />
              <span>Last reviewed {formatDate(reviewedItems[reviewedItems.length - 1]?.review?.createdAt || new Date())}</span>
            </div>
          </div>
        )}
      </div>

      {/* Order Items */}
      <AnimatePresence>
        {expanded && showItemDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-6 space-y-4">
              {/* Quick Actions for Reviewable Items */}
              {reviewableItems.length > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-blue-900">
                      {reviewableItems.length} item{reviewableItems.length !== 1 ? 's' : ''} ready for review
                    </h4>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Review All
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {reviewableItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 p-2 bg-white rounded border">
                        <Avatar
                          src={item.productImage}
                          alt={item.productName}
                          fallback={item.productName.charAt(0)}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.productName}
                          </p>
                        </div>
                        <Button size="xs">Review</Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Item Reviews */}
              <div className="space-y-4">
                {order.items.map((item) => (
                  <OrderItemReview
                    key={item.id}
                    order={order}
                    item={item}
                    enableQuickReview={enableQuickReview}
                    enableInlineEdit={enableInlineEdit}
                    onReviewSubmit={(reviewData) => onItemReviewSubmit?.(item.id, reviewData)}
                    onReviewEdit={(reviewData) => onItemReviewEdit?.(item.review?.id || '', reviewData)}
                    onReviewDelete={() => onItemReviewDelete?.(item.review?.id || '')}
                    onReviewHelpful={onReviewHelpful}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

// Filters component
const OrderFilters: React.FC<{
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  className?: string;
}> = ({ filters, onFiltersChange, className }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: keyof FilterOptions, value: string | string[] | boolean | number | { start: Date; end: Date } | Date | undefined) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <Card className={cn('p-4', className)}>
      <div className="space-y-4">
        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Orders
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Order number, product name..."
                value={localFilters.searchQuery || ''}
                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Status
            </label>
            <Select
              value={localFilters.status?.[0] || ''}
              onValueChange={(value: string | number) => handleFilterChange('status', value ? [String(value)] : undefined)}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'delivered', label: 'Delivered' },
                { value: 'shipped', label: 'Shipped' },
                { value: 'processing', label: 'Processing' },
                { value: 'cancelled', label: 'Cancelled' }
              ]}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Status
            </label>
            <Select
              value={localFilters.hasReviews === undefined ? '' : 
                     localFilters.hasReviews ? 'reviewed' :
                     localFilters.needsReview ? 'needs_review' : 'not_reviewed'}
              onValueChange={(value: string | number) => {
                const stringValue = String(value);
                if (stringValue === 'reviewed') {
                  handleFilterChange('hasReviews', true);
                  handleFilterChange('needsReview', undefined);
                } else if (stringValue === 'needs_review') {
                  handleFilterChange('needsReview', true);
                  handleFilterChange('hasReviews', undefined);
                } else if (stringValue === 'not_reviewed') {
                  handleFilterChange('hasReviews', false);
                  handleFilterChange('needsReview', undefined);
                } else {
                  handleFilterChange('hasReviews', undefined);
                  handleFilterChange('needsReview', undefined);
                }
              }}
              options={[
                { value: '', label: 'All Orders' },
                { value: 'needs_review', label: 'Needs Review' },
                { value: 'reviewed', label: 'Has Reviews' },
                { value: 'not_reviewed', label: 'No Reviews' }
              ]}
            />
          </div>
          
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full"
            >
              <FunnelIcon className="w-4 h-4 mr-2" />
              {showAdvanced ? 'Hide' : 'More'} Filters
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <Separator className="my-4" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <DatePicker
                    value={localFilters.dateRange?.start}
                    onChange={(date: Date | undefined) => {
                      if (date) {
                        handleFilterChange('dateRange', {
                          start: date,
                          end: localFilters.dateRange?.end || date
                        });
                      } else {
                        handleFilterChange('dateRange', undefined);
                      }
                    }}
                    placeholder="Start date"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <Select
                    value={localFilters.paymentMethod?.[0] || ''}
                    onValueChange={(value: string | number) => handleFilterChange('paymentMethod', value ? [String(value)] : undefined)}
                    options={[
                      { value: '', label: 'All Methods' },
                      { value: 'card', label: 'Credit Card' },
                      { value: 'paypal', label: 'PayPal' },
                      { value: 'bank_transfer', label: 'Bank Transfer' },
                      { value: 'cod', label: 'Cash on Delivery' }
                    ]}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Amount
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={localFilters.minAmount || ''}
                      onChange={(e) => handleFilterChange('minAmount', e.target.value ? Number(e.target.value) : undefined)}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={localFilters.maxAmount || ''}
                      onChange={(e) => handleFilterChange('maxAmount', e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                </div>
              </div>
              
              {/* Additional Advanced Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <TagIcon className="inline w-4 h-4 mr-1" />
                    Order Tags
                  </label>
                  <Select
                    value=""
                    onValueChange={(value: string | number) => {
                      handleFilterChange('tags', value ? [String(value)] : undefined);
                    }}
                    options={[
                      { value: '', label: 'All Tags' },
                      { value: 'urgent', label: 'Urgent' },
                      { value: 'bulk_order', label: 'Bulk Order' },
                      { value: 'repeat_customer', label: 'Repeat Customer' },
                      { value: 'gift', label: 'Gift Order' }
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CameraIcon className="inline w-4 h-4 mr-1" />
                    Reviews with Media
                  </label>
                  <Switch
                    checked={localFilters.hasMedia || false}
                    onCheckedChange={(checked) => handleFilterChange('hasMedia', checked)}
                  />
                  <span className="text-sm text-gray-600 ml-2">Photos/Videos</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <VideoCameraIcon className="inline w-4 h-4 mr-1" />
                    Video Reviews Only
                  </label>
                  <Switch
                    checked={localFilters.hasVideo || false}
                    onCheckedChange={(checked) => handleFilterChange('hasVideo', checked)}
                  />
                  <span className="text-sm text-gray-600 ml-2">Video content</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <ExclamationTriangleIcon className="inline w-4 h-4 mr-1" />
                    Problem Orders
                  </label>
                  <Switch
                    checked={localFilters.hasIssues || false}
                    onCheckedChange={(checked) => handleFilterChange('hasIssues', checked)}
                  />
                  <span className="text-sm text-gray-600 ml-2">Issues reported</span>
                </div>
              </div>

              {/* Time-based filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <ClockIcon className="inline w-4 h-4 mr-1" />
                    Quick Time Filters
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const today = new Date();
                        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                        handleFilterChange('dateRange', { start: lastWeek, end: today });
                      }}
                    >
                      Last 7 days
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const today = new Date();
                        const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                        handleFilterChange('dateRange', { start: lastMonth, end: today });
                      }}
                    >
                      Last 30 days
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating Quality Filters
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFilterChange('minRating', 4)}
                    >
                      <StarIconSolid className="w-3 h-3 mr-1 text-yellow-400" />
                      High Rated (4+)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFilterChange('maxRating', 2)}
                    >
                      Low Rated (≤2)
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clear All Filters
                  </label>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const clearFilters: FilterOptions = {};
                      setLocalFilters(clearFilters);
                      onFiltersChange(clearFilters);
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};

// Main component
const OrderHistoryRatingReview: React.FC<OrderHistoryRatingReviewProps> = ({
  orders = [],
  isLoading = false,
  hasNextPage = false,
  variant = 'full',
  showFilters = true,
  showSearch = true,
  showSorting = true,
  showOrderDetails = true,
  showItemDetails = true,
  showReviewForm = true,
  showReviewStats = true,
  showBulkActions = false,
  enableQuickReview = true,
  enableInlineEdit = true,
  itemsPerPage = 10,
  maxReviewLength = 1000,
  allowMedia = true,
  allowAnonymous = true,
  requireVerification = false,
  moderationEnabled = true,
  className,
  cardClassName,
  filterClassName,
  onOrderSelect,
  onItemSelect,
  onReviewSubmit,
  onReviewEdit,
  onReviewDelete,
  onReviewHelpful,
  onOrderReorder,
  onOrderCancel,
  onOrderReturn,
  onLoadMore,
  onFilterChange,
  onSortChange,
  onAnalyticsEvent
}) => {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'placedAt',
    direction: 'desc'
  });
  const [currentPage, setCurrentPage] = useState(1);

  const handleReviewHelpful = useCallback((reviewId: string, helpful: boolean) => {
    onReviewHelpful?.(reviewId, helpful);
    onAnalyticsEvent?.('review_helpful_voted', {
      reviewId,
      helpful,
      timestamp: Date.now()
    });
  }, [onReviewHelpful, onAnalyticsEvent]);

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    // Apply filters
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(query) ||
        order.items.some(item => 
          item.productName.toLowerCase().includes(query) ||
          item.productBrand.toLowerCase().includes(query)
        )
      );
    }

    if (filters.status?.length) {
      filtered = filtered.filter(order => filters.status!.includes(order.status));
    }

    if (filters.hasReviews !== undefined) {
      filtered = filtered.filter(order => {
        const hasReviews = order.items.some(item => item.hasReviewed);
        return hasReviews === filters.hasReviews;
      });
    }

    if (filters.needsReview) {
      filtered = filtered.filter(order => 
        order.items.some(item => item.reviewable && !item.hasReviewed)
      );
    }

    if (filters.dateRange?.start) {
      filtered = filtered.filter(order => order.placedAt >= filters.dateRange!.start);
    }

    if (filters.dateRange?.end) {
      filtered = filtered.filter(order => order.placedAt <= filters.dateRange!.end);
    }

    if (filters.minAmount !== undefined) {
      filtered = filtered.filter(order => order.totalAmount >= filters.minAmount!);
    }

    if (filters.maxAmount !== undefined) {
      filtered = filtered.filter(order => order.totalAmount <= filters.maxAmount!);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortOptions.field];
      const bValue = b[sortOptions.field];
      
      // Handle undefined values
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;
      
      if (sortOptions.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [orders, filters, sortOptions]);

  // Auto-refresh data periodically
  useEffect(() => {
    let refreshTimer: NodeJS.Timeout;
    
    if (onLoadMore && hasNextPage) {
      refreshTimer = setInterval(() => {
        // Auto-refresh logic for real-time updates
        onAnalyticsEvent?.('auto_refresh_triggered', { 
          currentPage, 
          totalOrders: orders.length,
          filteredCount: filteredOrders.length
        });
      }, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    };
  }, [onLoadMore, hasNextPage, currentPage, orders.length, filteredOrders.length, onAnalyticsEvent]);

  // Pagination
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  // Handlers
  const handleFiltersChange = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1);
    onFilterChange?.(newFilters);
    onAnalyticsEvent?.('filters_applied', {
      hasStatus: !!newFilters.status?.length,
      hasDateRange: !!(newFilters.dateRange?.start || newFilters.dateRange?.end),
      hasAmountRange: !!(newFilters.minAmount || newFilters.maxAmount),
      hasSearch: !!newFilters.searchQuery,
      filterCount: Object.keys(newFilters).length
    });
  }, [onFilterChange, onAnalyticsEvent]);

  const handleSortChange = useCallback((field: SortOptions['field']) => {
    const newSort: SortOptions = {
      field,
      direction: sortOptions.field === field && sortOptions.direction === 'desc' ? 'asc' : 'desc'
    };
    setSortOptions(newSort);
    onSortChange?.(newSort);
    onAnalyticsEvent?.('sort_changed', {
      field: newSort.field,
      direction: newSort.direction
    });
  }, [sortOptions, onSortChange, onAnalyticsEvent]);

  const handleItemReviewSubmit = useCallback((orderId: string, itemId: string, reviewData: ReviewFormData) => {
    // Validate review data based on configuration
    if (reviewData.text.length > maxReviewLength) {
      console.warn(`Review text exceeds maximum length of ${maxReviewLength} characters`);
      return;
    }
    
    if (!allowMedia && reviewData.media.length > 0) {
      console.warn('Media uploads are not allowed');
      return;
    }
    
    if (!allowAnonymous && reviewData.anonymous) {
      console.warn('Anonymous reviews are not allowed');
      return;
    }
    
    if (requireVerification) {
      // Add verification logic here
      console.log('Review requires verification before submission');
    }
    
    if (moderationEnabled) {
      console.log('Review will be sent for moderation');
    }
    
    onReviewSubmit?.(orderId, itemId, reviewData);
    onAnalyticsEvent?.('review_submitted', {
      orderId,
      itemId,
      rating: reviewData.rating,
      hasText: !!reviewData.text,
      hasMedia: reviewData.media.length > 0,
      isAnonymous: reviewData.anonymous
    });
  }, [onReviewSubmit, onAnalyticsEvent, maxReviewLength, allowMedia, allowAnonymous, requireVerification, moderationEnabled]);

  // Loading state
  if (isLoading && orders.length === 0) {
    return (
      <div className={cn('space-y-6', className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, j) => (
                  <div key={j} className="flex gap-4">
                    <Skeleton className="h-16 w-16 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Search and Filters */}
      {(showFilters || showSearch) && (
        <div className="space-y-4">
          {/* Search Bar */}
          {showSearch && (
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search orders by number, product name, or brand..."
                value={filters.searchQuery || ''}
                onChange={(e) => handleFiltersChange({ ...filters, searchQuery: e.target.value })}
                className="pl-10"
              />
            </div>
          )}
          
          {/* Filters */}
          {showFilters && (
            <OrderFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              className={filterClassName}
            />
          )}
        </div>
      )}

      {/* Bulk Actions */}
      {showBulkActions && paginatedOrders.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {paginatedOrders.filter(order => order.items.some(item => item.reviewable && !item.hasReviewed)).length} orders need reviews
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const needReviewOrders = paginatedOrders.filter(order => 
                    order.items.some(item => item.reviewable && !item.hasReviewed)
                  );
                  needReviewOrders.forEach(order => onOrderSelect?.(order.id));
                  onAnalyticsEvent?.('bulk_select_review_needed', { count: needReviewOrders.length });
                }}
              >
                Select All Needing Reviews
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  paginatedOrders.forEach(order => onOrderSelect?.(order.id));
                  onAnalyticsEvent?.('bulk_select_all', { count: paginatedOrders.length });
                }}
              >
                Select All
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Review Stats Summary */}
      {showReviewStats && paginatedOrders.length > 0 && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {paginatedOrders.reduce((sum, order) => sum + order.items.filter(item => item.reviewable).length, 0)}
              </div>
              <div className="text-sm text-gray-600">Reviewable Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {paginatedOrders.reduce((sum, order) => sum + order.items.filter(item => item.hasReviewed).length, 0)}
              </div>
              <div className="text-sm text-gray-600">Reviews Submitted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {paginatedOrders.reduce((sum, order) => sum + order.items.filter(item => item.reviewable && !item.hasReviewed).length, 0)}
              </div>
              <div className="text-sm text-gray-600">Pending Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {(paginatedOrders.reduce((sum, order) => {
                  const reviews = order.items.filter(item => item.hasReviewed && item.review);
                  return sum + reviews.reduce((rSum, item) => rSum + (item.review?.rating || 0), 0);
                }, 0) / Math.max(1, paginatedOrders.reduce((sum, order) => sum + order.items.filter(item => item.hasReviewed).length, 0))).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
          </div>
        </Card>
      )}

      {/* Sorting Header */}
      {showSorting && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
              </span>
              {filters.needsReview && (
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  Needs Review
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSortChange('placedAt')}
                className={cn(
                  sortOptions.field === 'placedAt' && 'bg-gray-100'
                )}
              >
                Date {sortOptions.field === 'placedAt' && (
                  sortOptions.direction === 'desc' ? '↓' : '↑'
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSortChange('totalAmount')}
                className={cn(
                  sortOptions.field === 'totalAmount' && 'bg-gray-100'
                )}
              >
                Amount {sortOptions.field === 'totalAmount' && (
                  sortOptions.direction === 'desc' ? '↓' : '↑'
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {paginatedOrders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            variant={variant === 'list' ? 'full' : variant}
            showItemDetails={showItemDetails && showOrderDetails}
            enableQuickReview={enableQuickReview && showReviewForm}
            enableInlineEdit={enableInlineEdit && showReviewForm}
            onItemReviewSubmit={(itemId, reviewData) => {
              handleItemReviewSubmit(order.id, itemId, reviewData);
              onItemSelect?.(order.id, itemId);
            }}
            onItemReviewEdit={onReviewEdit}
            onItemReviewDelete={onReviewDelete}
            onOrderReorder={() => {
              onOrderReorder?.(order.id);
              onAnalyticsEvent?.('order_reordered', { orderId: order.id });
            }}
            onOrderCancel={() => {
              onOrderCancel?.(order.id);
              onAnalyticsEvent?.('order_cancel_requested', { orderId: order.id });
            }}
            onOrderReturn={(itemIds: string[]) => {
              onOrderReturn?.(order.id, itemIds);
              onAnalyticsEvent?.('order_return_requested', { 
                orderId: order.id, 
                itemCount: itemIds.length 
              });
            }}
            onReviewHelpful={handleReviewHelpful}
            className={cardClassName}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = currentPage <= 3 ? i + 1 : 
                              currentPage >= totalPages - 2 ? totalPages - 4 + i :
                              currentPage - 2 + i;
                  
                  return (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8"
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Load More */}
      {hasNextPage && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load More Orders'}
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredOrders.length === 0 && (
        <Card className="p-12 text-center">
          <ShoppingBagIconSolid className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No orders found
          </h3>
          <p className="text-gray-600 mb-6">
            {orders.length === 0 
              ? "You haven't placed any orders yet."
              : "Try adjusting your filters to find what you're looking for."
            }
          </p>
          {orders.length === 0 && (
            <Button>
              Start Shopping
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};

export default OrderHistoryRatingReview;