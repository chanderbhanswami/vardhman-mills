'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  StarIcon,
  GiftIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  ShareIcon,
  ChevronRightIcon,
  XMarkIcon,
  BellIcon,
  TagIcon,
  UserIcon,
  SparklesIcon,
  TrophyIcon,
  CameraIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
  GiftIcon as GiftIconSolid,
  ShoppingCartIcon as ShoppingCartIconSolid
} from '@heroicons/react/24/solid';

// UI Components
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Progress } from '@/components/ui/Progress';
import { Tooltip } from '@/components/ui/Tooltip';
import { Modal } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';
import { Rating } from '@/components/ui/Rating';
import { TextArea } from '@/components/ui/TextArea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Switch } from '@/components/ui/Switch';
import { Slider } from '@/components/ui/Slider';
import { Separator } from '@/components/ui/Separator';

// Utils
import { cn } from '@/lib/utils';

// Types
interface ReviewData {
  rating: number;
  text?: string;
  media?: Array<{
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  }>;
  pros?: string[];
  cons?: string[];
  wouldRecommend?: boolean;
}

interface AnalyticsData {
  [key: string]: string | number | boolean | undefined;
}

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productBrand: string;
  productCategory: string;
  quantity: number;
  price: number;
  variant?: {
    size?: string;
    color?: string;
    style?: string;
  };
  purchaseDate?: Date;
  reviewEligible: boolean;
  hasReviewed: boolean;
  reviewId?: string;
  reviewRating?: number;
  reviewIncentive?: {
    type: 'discount' | 'points' | 'cashback' | 'gift';
    value: number;
    description: string;
    minRating?: number;
    requiresMedia?: boolean;
    expiryDate?: Date;
  };
}

interface ReviewReward {
  id: string;
  type: 'points' | 'discount' | 'cashback' | 'gift' | 'badge' | 'tier_upgrade';
  value: number;
  description: string;
  requirements: {
    minRating?: number;
    requiresText?: boolean;
    requiresMedia?: boolean;
    minTextLength?: number;
    minMediaCount?: number;
  };
  earned: boolean;
  earnedDate?: Date;
  expiryDate?: Date;
  claimCode?: string;
}

interface ReviewProgress {
  totalItems: number;
  reviewedItems: number;
  pendingItems: number;
  eligibleItems: number;
  completionPercentage: number;
  totalRewards: ReviewReward[];
  earnedRewards: ReviewReward[];
  potentialRewards: ReviewReward[];
  reviewStreak: number;
  lastReviewDate?: Date;
  tierProgress?: {
    currentTier: string;
    nextTier: string;
    pointsNeeded: number;
    totalPoints: number;
  };
}

export interface InCartPostPurchaseReviewReminderProps {
  // Data
  cartItems?: CartItem[];
  recentPurchases?: CartItem[];
  reviewProgress?: ReviewProgress;
  
  // Configuration
  variant?: 'cart' | 'post_purchase' | 'dashboard' | 'compact' | 'floating';
  showInCart?: boolean;
  showPostPurchase?: boolean;
  showRewards?: boolean;
  showProgress?: boolean;
  showIncentives?: boolean;
  showSocialProof?: boolean;
  showQuickReview?: boolean;
  autoShow?: boolean;
  persistentReminder?: boolean;
  
  // Timing
  showDelay?: number;
  hideAfter?: number;
  reminderFrequency?: 'once' | 'daily' | 'weekly' | 'purchase';
  
  // Customization
  title?: string;
  description?: string;
  ctaText?: string;
  incentiveText?: string;
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  
  // Positioning (for floating variant)
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  
  // Styling
  className?: string;
  containerClassName?: string;
  overlayClassName?: string;
  
  // Callbacks
  onReviewStart?: (itemId: string) => void;
  onReviewComplete?: (itemId: string, reviewData: ReviewData) => void;
  onRewardClaim?: (rewardId: string) => void;
  onDismiss?: (reason: 'close' | 'later' | 'completed') => void;
  onShow?: () => void;
  onHide?: () => void;
  onIncentiveClick?: (incentiveId: string) => void;
  
  // Analytics
  onAnalyticsEvent?: (event: string, data: AnalyticsData) => void;
}

// Quick review component
const QuickReviewCard: React.FC<{
  item: CartItem;
  onReviewSubmit?: (itemId: string, rating: number, text?: string) => void;
  onSkip?: (itemId: string) => void;
  showRewards?: boolean;
  className?: string;
}> = ({ item, onReviewSubmit, onSkip, showRewards = true, className }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFullForm, setShowFullForm] = useState(false);

  const handleQuickReview = async (quickRating: number) => {
    setIsSubmitting(true);
    try {
      await onReviewSubmit?.(item.id, quickRating);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDetailedReview = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    try {
      await onReviewSubmit?.(item.id, rating, reviewText);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={cn('p-4 space-y-4', className)}>
      <div className="flex items-center gap-3">
        <Avatar
          src={item.productImage}
          alt={item.productName}
          fallback={item.productName.charAt(0)}
          size="md"
        />
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{item.productName}</h4>
          <p className="text-sm text-gray-600">{item.productBrand}</p>
          {item.variant && (
            <p className="text-xs text-gray-500">
              {[item.variant.size, item.variant.color, item.variant.style]
                .filter(Boolean)
                .join(' • ')}
            </p>
          )}
        </div>
      </div>

      {!showFullForm ? (
        <div className="space-y-3">
          <div className="text-center">
            <p className="text-sm text-gray-700 mb-3">How would you rate this product?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleQuickReview(star)}
                  disabled={isSubmitting}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                >
                  <StarIcon className="w-8 h-8 text-yellow-400 hover:text-yellow-500" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullForm(true)}
            >
              Write detailed review
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSkip?.(item.id)}
            >
              Skip for now
            </Button>
          </div>

          {showRewards && item.reviewIncentive && (
            <div className="p-3 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg border border-primary-200">
              <div className="flex items-center gap-2 text-sm">
                <GiftIconSolid className="w-4 h-4 text-primary-600" />
                <span className="font-medium text-primary-900">
                  {item.reviewIncentive.description}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your rating
            </label>
            <Rating
              value={rating}
              onChange={setRating}
              size="lg"
              className="justify-center"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tell us more (optional)
            </label>
            <TextArea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this product..."
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleDetailedReview}
              disabled={rating === 0 || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFullForm(false)}
              disabled={isSubmitting}
            >
              Back
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

// Progress tracking component
const ReviewProgressTracker: React.FC<{
  progress: ReviewProgress;
  onRewardClaim?: (rewardId: string) => void;
  className?: string;
}> = ({ progress, onRewardClaim, className }) => {
  const [claimingReward, setClaimingReward] = useState<string | null>(null);

  const handleClaimReward = async (rewardId: string) => {
    setClaimingReward(rewardId);
    try {
      await onRewardClaim?.(rewardId);
    } finally {
      setClaimingReward(null);
    }
  };

  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-6">
        {/* Overall Progress */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Review Progress</h3>
            <Badge variant="secondary">
              {progress.reviewedItems}/{progress.totalItems} reviewed
            </Badge>
          </div>
          
          <Progress 
            value={progress.completionPercentage} 
            className="h-3"
          />
          
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>{progress.reviewedItems} completed</span>
            <span>{progress.pendingItems} remaining</span>
          </div>
        </div>

        {/* Tier Progress */}
        {progress.tierProgress && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Tier Progress</h4>
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                {progress.tierProgress.currentTier}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Next: {progress.tierProgress.nextTier}
                </span>
                <span className="font-medium">
                  {progress.tierProgress.pointsNeeded} points needed
                </span>
              </div>
              
              <Progress 
                value={(progress.tierProgress.totalPoints / 
                       (progress.tierProgress.totalPoints + progress.tierProgress.pointsNeeded)) * 100}
                className="h-2"
              />
            </div>
          </div>
        )}

        {/* Available Rewards */}
        {progress.earnedRewards.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Available Rewards</h4>
            <div className="space-y-2">
              {progress.earnedRewards.map((reward) => (
                <div
                  key={reward.id}
                  className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <TrophyIcon className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">{reward.description}</p>
                      <p className="text-sm text-green-700">
                        Value: {reward.type === 'points' ? `${reward.value} points` : 
                                reward.type === 'discount' ? `${reward.value}% off` :
                                `$${reward.value}`}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => handleClaimReward(reward.id)}
                    disabled={claimingReward === reward.id}
                  >
                    {claimingReward === reward.id ? 'Claiming...' : 'Claim'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Review Streak */}
        {progress.reviewStreak > 0 && (
          <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FireIcon className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="font-medium text-orange-900">
                {progress.reviewStreak} day review streak!
              </p>
              <p className="text-sm text-orange-700">Keep it up to unlock bonus rewards</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// Advanced Features Component
const AdvancedFeatures: React.FC<{
  showInCart: boolean;
  showPostPurchase: boolean;
  reminderFrequency: string;
  colors: Record<string, string>;
  onIncentiveClick?: (incentiveId: string) => void;
  className?: string;
}> = ({ 
  showInCart, 
  showPostPurchase, 
  reminderFrequency, 
  colors, 
  onIncentiveClick,
  className 
}) => {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: false,
    sms: false
  });
  const [incentivePreference, setIncentivePreference] = useState(50);

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className={cn('border-t pt-6 mt-6', className)}
      >
        <div className="space-y-6">
          {/* Display Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <GiftIcon className="w-5 h-5 text-primary-600" />
              Display Settings
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <ShoppingCartIconSolid className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Show in Cart</span>
                </div>
                <Switch
                  checked={showInCart}
                  onCheckedChange={() => {}}
                  disabled
                />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Post Purchase</span>
                </div>
                <Switch
                  checked={showPostPurchase}
                  onCheckedChange={() => {}}
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Reminder Frequency */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-orange-600" />
              Reminder Frequency
            </h4>
            
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <BellIcon className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Current setting:</span>
                <Badge variant="outline" className="capitalize">
                  {reminderFrequency}
                </Badge>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <BellIcon className="w-5 h-5 text-primary-600" />
              Notification Preferences
            </h4>
            
            <div className="space-y-3">
              {Object.entries(notificationSettings).map(([type, enabled]) => (
                <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {type === 'email' && <UserIcon className="w-4 h-4 text-gray-600" />}
                    {type === 'push' && <BellIcon className="w-4 h-4 text-gray-600" />}
                    {type === 'sms' && <ChatBubbleLeftRightIcon className="w-4 h-4 text-gray-600" />}
                    <span className="text-sm font-medium capitalize">{type} notifications</span>
                  </div>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, [type]: checked }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Color Customization */}
          {Object.keys(colors).length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-pink-600" />
                Theme Colors
              </h4>
              
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(colors).map(([name]) => (
                  <div key={name} className="text-center">
                    <div 
                      className={cn(
                        "w-8 h-8 rounded-full mx-auto mb-1 border-2 border-gray-200",
                        name === 'primary' && 'bg-blue-500',
                        name === 'secondary' && 'bg-gray-500',
                        name === 'accent' && 'bg-primary-500'
                      )}
                    />
                    <span className="text-xs text-gray-600 capitalize">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Incentive Preferences */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <TagIcon className="w-5 h-5 text-green-600" />
              Incentive Preferences
            </h4>
            
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Incentive Value Preference</span>
                  <Badge>{incentivePreference}%</Badge>
                </div>
                <Slider
                  value={[incentivePreference]}
                  onValueChange={(value) => setIncentivePreference(value[0])}
                  max={100}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Points</span>
                  <span>Discounts</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {['photos', 'videos', 'detailed_reviews', 'quick_ratings'].map((feature) => (
                  <div key={feature} className="p-3 border rounded-lg">
                    <Checkbox
                      checked={selectedFeatures.includes(feature)}
                      onChange={() => handleFeatureToggle(feature)}
                      className="mb-2"
                    />
                    <div className="flex items-center gap-2">
                      {feature === 'photos' && <CameraIcon className="w-4 h-4 text-blue-600" />}
                      {feature === 'videos' && <VideoCameraIcon className="w-4 h-4 text-red-600" />}
                      {feature === 'detailed_reviews' && <ChatBubbleLeftRightIcon className="w-4 h-4 text-green-600" />}
                      {feature === 'quick_ratings' && <StarIcon className="w-4 h-4 text-yellow-600" />}
                      <span className="text-sm font-medium capitalize">
                        {feature.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() => onIncentiveClick?.('preferences')}
                className="w-full"
              >
                <HeartIcon className="w-4 h-4 mr-2" />
                Save Preferences
              </Button>
            </div>
          </div>

          <Separator />

          {/* Additional Features */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
              Additional Features
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <Tooltip content="Share your review on social media">
                <Button variant="outline" size="sm" className="w-full">
                  <ShareIcon className="w-4 h-4 mr-2" />
                  Social Sharing
                </Button>
              </Tooltip>
              
              <Tooltip content="Navigate to detailed review page">
                <Button variant="outline" size="sm" className="w-full">
                  <ChevronRightIcon className="w-4 h-4 mr-2" />
                  Advanced Options
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Enhanced Social Proof with more features
const EnhancedSocialProof: React.FC<{
  className?: string;
}> = ({ className }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const socialStats = {
    totalReviews: 12547,
    avgRating: 4.6,
    recentReviewers: 1203,
    incentivesClaimed: 8934,
    topReviewers: [
      { name: 'Sarah M.', reviews: 45, badges: ['Top Reviewer', 'Photo Expert'] },
      { name: 'Mike K.', reviews: 38, badges: ['Verified Buyer', 'Detail Master'] },
      { name: 'Lisa P.', reviews: 32, badges: ['Video Pro', 'Honest Reviewer'] }
    ]
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">
            {socialStats.totalReviews.toLocaleString()}
          </p>
          <p className="text-sm text-blue-700">Reviews shared</p>
        </div>
        
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <StarIconSolid className="w-5 h-5 text-yellow-400" />
            <p className="text-2xl font-bold text-green-600">{socialStats.avgRating}</p>
          </div>
          <p className="text-sm text-green-700">Average rating</p>
        </div>
      </div>

      <div className="p-4 bg-primary-50 rounded-lg text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <HeartIconSolid className="w-5 h-5 text-primary-600" />
          <p className="font-medium text-primary-900">
            {socialStats.recentReviewers.toLocaleString()} customers reviewed products today
          </p>
        </div>
        <p className="text-sm text-primary-700">
          Join them and earn rewards for your honest feedback!
        </p>
      </div>

      <Button
        variant="ghost"
        onClick={() => setShowDetails(!showDetails)}
        className="w-full"
      >
        {showDetails ? 'Hide' : 'Show'} Top Reviewers
        <ChevronRightIcon className={cn('w-4 h-4 ml-2 transition-transform', showDetails && 'rotate-90')} />
      </Button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            {socialStats.topReviewers.map((reviewer, index) => (
              <div key={reviewer.name} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    #{index + 1}
                  </div>
                  <UserIcon className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{reviewer.name}</p>
                  <p className="text-sm text-gray-600">{reviewer.reviews} reviews</p>
                  <div className="flex gap-1 mt-1">
                    {reviewer.badges.map((badge) => (
                      <Badge key={badge} variant="secondary" className="text-xs">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
                <SparklesIcon className="w-5 h-5 text-yellow-500" />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main component
const InCartPostPurchaseReviewReminder: React.FC<InCartPostPurchaseReviewReminderProps> = ({
  cartItems = [],
  recentPurchases = [],
  reviewProgress,
  variant = 'cart',
  showInCart = true,
  showPostPurchase = true,
  showRewards = true,
  showProgress = true,
  showIncentives = true,
  showSocialProof = true,
  showQuickReview = true,
  autoShow = false,
  persistentReminder = false,
  showDelay = 2000,
  hideAfter = 0,
  reminderFrequency = 'purchase',
  title,
  description,
  ctaText = 'Leave a Review',
  incentiveText = 'Earn rewards for your review!',
  colors = {},
  position = 'bottom-right',
  className,
  containerClassName,
  overlayClassName,
  onReviewStart,
  onReviewComplete,
  onRewardClaim,
  onDismiss,
  onShow,
  onHide,
  onIncentiveClick,
  onAnalyticsEvent
}) => {
  // State
  const [isVisible, setIsVisible] = useState(!autoShow);
  const [currentTab, setCurrentTab] = useState<'review' | 'progress' | 'rewards'>('review');
  const [dismissedItems, setDismissedItems] = useState<string[]>([]);
  const [completedReviews, setCompletedReviews] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Get items to review based on variant
  const itemsToReview = useMemo(() => {
    const items = variant === 'cart' ? cartItems : recentPurchases;
    return items.filter(item => 
      item.reviewEligible && 
      !item.hasReviewed && 
      !dismissedItems.includes(item.id) &&
      !completedReviews.includes(item.id)
    );
  }, [variant, cartItems, recentPurchases, dismissedItems, completedReviews]);

  // Auto show logic
  useEffect(() => {
    if (autoShow && itemsToReview.length > 0) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        onShow?.();
        onAnalyticsEvent?.('reminder_auto_shown', {
          variant,
          itemCount: itemsToReview.length
        });
      }, showDelay);

      return () => clearTimeout(timer);
    }
  }, [autoShow, itemsToReview.length, showDelay, onShow, onAnalyticsEvent, variant]);

  // Handlers
  const handleDismiss = useCallback((reason: 'close' | 'later' | 'completed' | 'auto_hide' = 'close') => {
    setIsVisible(false);
    onHide?.();
    if (reason !== 'auto_hide') {
      onDismiss?.(reason as 'close' | 'later' | 'completed');
    }
    onAnalyticsEvent?.('reminder_dismissed', { reason, variant });
  }, [onHide, onDismiss, onAnalyticsEvent, variant]);

  // Auto hide logic
  useEffect(() => {
    if (isVisible && hideAfter > 0) {
      const timer = setTimeout(() => {
        handleDismiss('auto_hide');
      }, hideAfter);

      return () => clearTimeout(timer);
    }
  }, [isVisible, hideAfter, handleDismiss]);

  const handleReviewStart = useCallback((itemId: string) => {
    const item = itemsToReview.find(i => i.id === itemId);
    if (item) {
      setSelectedItem(item);
      setShowModal(true);
      onReviewStart?.(itemId);
      onAnalyticsEvent?.('review_started', { itemId, variant });
    }
  }, [itemsToReview, onReviewStart, onAnalyticsEvent, variant]);

  const handleReviewComplete = useCallback(async (itemId: string, reviewData: ReviewData) => {
    try {
      await onReviewComplete?.(itemId, reviewData);
      setCompletedReviews(prev => [...prev, itemId]);
      setShowModal(false);
      setSelectedItem(null);
      
      onAnalyticsEvent?.('review_completed', { 
        itemId, 
        rating: reviewData.rating,
        hasText: !!reviewData.text,
        variant 
      });

      // Check if all items are reviewed
      if (completedReviews.length + 1 >= itemsToReview.length) {
        handleDismiss('completed');
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  }, [onReviewComplete, completedReviews.length, itemsToReview.length, onAnalyticsEvent, variant, handleDismiss]);

  const handleQuickReviewSubmit = useCallback(async (itemId: string, rating: number, text?: string) => {
    const reviewData: ReviewData = {
      rating,
      text,
      wouldRecommend: rating >= 4
    };
    await handleReviewComplete(itemId, reviewData);
  }, [handleReviewComplete]);

  const handleItemDismiss = useCallback((itemId: string) => {
    setDismissedItems(prev => [...prev, itemId]);
    onAnalyticsEvent?.('item_dismissed', { itemId, variant });
  }, [onAnalyticsEvent, variant]);

  // Don't render if no items to review or not visible
  if (!isVisible || itemsToReview.length === 0) {
    return null;
  }

  // Floating variant
  if (variant === 'floating') {
    const positionClasses = {
      'top-left': 'top-4 left-4',
      'top-right': 'top-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
    };

    return (
      <>
        {/* Overlay */}
        <div 
          className={cn(
            'fixed inset-0 bg-black/20 z-40',
            overlayClassName
          )}
          onClick={() => handleDismiss('close')}
        />

        {/* Floating reminder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={cn(
            'fixed z-50 max-w-sm',
            positionClasses[position],
            containerClassName
          )}
        >
          <Card className={cn('p-6 shadow-xl', className)}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <StarIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {title || 'Share Your Experience'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {description || `${itemsToReview.length} item(s) ready for review`}
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDismiss('close')}
              >
                <XMarkIcon className="w-4 h-4" />
              </Button>
            </div>

            {showSocialProof && (
              <EnhancedSocialProof className="mb-4" />
            )}

            <div className="space-y-3">
              {itemsToReview.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Avatar
                    src={item.productImage}
                    alt={item.productName}
                    fallback={item.productName.charAt(0)}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {item.productName}
                    </p>
                    {item.reviewIncentive && showIncentives && (
                      <p className="text-xs text-green-600">
                        {item.reviewIncentive.description}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleReviewStart(item.id)}
                  >
                    Review
                  </Button>
                </div>
              ))}

              {itemsToReview.length > 3 && (
                <p className="text-sm text-gray-600 text-center">
                  +{itemsToReview.length - 3} more items
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 mt-4">
              <Button 
                className="flex-1"
                onClick={() => setShowModal(true)}
              >
                {ctaText}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDismiss('later')}
              >
                Later
              </Button>
            </div>
          </Card>
        </motion.div>
      </>
    );
  }

  // Regular variants (cart, post_purchase, dashboard, compact)
  return (
    <div className={cn('space-y-6', containerClassName)}>
      <Card className={cn('overflow-hidden', className)}>
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-3 rounded-lg',
                variant === 'cart' ? 'bg-blue-100' : 'bg-green-100'
              )}>
                {variant === 'cart' ? (
                  <ShoppingCartIconSolid className="w-6 h-6 text-blue-600" />
                ) : (
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {title || (variant === 'cart' ? 'Review Cart Items' : 'Review Your Recent Purchases')}
                </h2>
                <p className="text-gray-600">
                  {description || `${itemsToReview.length} item(s) ready for your review`}
                </p>
              </div>
            </div>

            {!persistentReminder && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDismiss('close')}
              >
                <XMarkIcon className="w-5 h-5" />
              </Button>
            )}
          </div>

          {showIncentives && incentiveText && (
            <div className="mt-4 p-3 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg border border-primary-200">
              <div className="flex items-center gap-2">
                <GiftIconSolid className="w-5 h-5 text-primary-600" />
                <span className="font-medium text-primary-900">{incentiveText}</span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {variant === 'compact' ? (
            <div className="space-y-4">
              {itemsToReview.slice(0, 2).map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-4 border rounded-lg">
                  <Avatar
                    src={item.productImage}
                    alt={item.productName}
                    fallback={item.productName.charAt(0)}
                    size="md"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{item.productName}</h4>
                    <p className="text-sm text-gray-600">{item.productBrand}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleReviewStart(item.id)}
                  >
                    Review
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Tab Navigation */}
              <Tabs defaultValue="review" value={currentTab} onValueChange={(value) => setCurrentTab(value as 'review' | 'progress' | 'rewards')}>
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setCurrentTab('review')}
                    className={cn(
                      'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
                      currentTab === 'review'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    )}
                  >
                    Reviews
                  </button>
                  {showProgress && reviewProgress && (
                    <button
                      onClick={() => setCurrentTab('progress')}
                      className={cn(
                        'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
                        currentTab === 'progress'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      )}
                    >
                      Progress
                    </button>
                  )}
                  {showRewards && (
                    <button
                      onClick={() => setCurrentTab('rewards')}
                      className={cn(
                        'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
                        currentTab === 'rewards'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      )}
                    >
                      Rewards
                    </button>
                  )}
                </div>
              </Tabs>

              {/* Tab Content */}
              {currentTab === 'review' && (
                <div className="space-y-4">
                  {showQuickReview ? (
                    <div className="grid gap-4">
                      {itemsToReview.map((item) => (
                        <QuickReviewCard
                          key={item.id}
                          item={item}
                          onReviewSubmit={handleQuickReviewSubmit}
                          onSkip={handleItemDismiss}
                          showRewards={showRewards}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {itemsToReview.map((item) => (
                        <Card key={item.id} className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={item.productImage}
                              alt={item.productName}
                              fallback={item.productName.charAt(0)}
                              size="md"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{item.productName}</h4>
                              <p className="text-sm text-gray-600">{item.productBrand}</p>
                              {item.reviewIncentive && showIncentives && (
                                <p className="text-sm text-green-600 mt-1">
                                  {item.reviewIncentive.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleReviewStart(item.id)}
                              >
                                {ctaText}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleItemDismiss(item.id)}
                              >
                                Skip
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {showSocialProof && (
                    <div className="mt-6">
                      <EnhancedSocialProof />
                    </div>
                  )}
                </div>
              )}

              {showProgress && reviewProgress && currentTab === 'progress' && (
                <ReviewProgressTracker
                  progress={reviewProgress}
                  onRewardClaim={onRewardClaim}
                />
              )}

              {showRewards && currentTab === 'rewards' && (
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <TrophyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Earn Rewards for Reviews
                    </h3>
                    <p className="text-gray-600">
                      Complete reviews to unlock exclusive rewards and benefits
                    </p>
                  </div>
                  
                  {/* Advanced Features Integration */}
                  <AdvancedFeatures
                    showInCart={showInCart}
                    showPostPurchase={showPostPurchase}
                    reminderFrequency={reminderFrequency}
                    colors={colors}
                    onIncentiveClick={onIncentiveClick}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Review Modal */}
      <Modal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedItem(null);
        }}
        title={selectedItem ? `Review ${selectedItem.productName}` : 'Write Review'}
        size="lg"
      >
        {selectedItem && (
          <QuickReviewCard
            item={selectedItem}
            onReviewSubmit={handleQuickReviewSubmit}
            showRewards={showRewards}
            className="border-0 shadow-none"
          />
        )}
      </Modal>
    </div>
  );
};

export default InCartPostPurchaseReviewReminder;