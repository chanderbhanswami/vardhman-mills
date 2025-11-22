'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  StarIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleLeftRightIcon,
  BugAntIcon,
  LightBulbIcon,
  QuestionMarkCircleIcon,
  XCircleIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  DocumentIcon,
  XMarkIcon,
  HeartIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarIconSolid,
  CheckCircleIcon as CheckCircleIconSolid
} from '@heroicons/react/24/solid';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/utils';

// Types and Interfaces
export type FeedbackType = 'helpful' | 'rating' | 'suggestion' | 'bug' | 'complaint' | 'general';
export type FeedbackRating = 1 | 2 | 3 | 4 | 5;
export type FeedbackCategory = 'content' | 'navigation' | 'design' | 'performance' | 'functionality' | 'other';

export interface FeedbackAttachment {
  id: string;
  name: string;
  type: 'image' | 'document';
  file: File;
  preview?: string;
}

export interface FeedbackFormData {
  type: FeedbackType;
  category: FeedbackCategory;
  rating?: FeedbackRating;
  title: string;
  description: string;
  email?: string;
  attachments: FeedbackAttachment[];
  anonymous: boolean;
  followUp: boolean;
}

export interface QuickFeedbackOption {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  type: FeedbackType;
  description?: string;
}

export interface HelpFeedbackProps {
  articleId?: string;
  pageType?: 'article' | 'category' | 'search' | 'general';
  onSubmit?: (feedback: FeedbackFormData) => void;
  onQuickFeedback?: (type: FeedbackType, rating?: number) => void;
  showQuickFeedback?: boolean;
  showDetailedForm?: boolean;
  autoExpand?: boolean;
  maxAttachments?: number;
  allowAttachments?: boolean;
  requireEmail?: boolean;
  className?: string;
  variant?: 'compact' | 'full' | 'modal';
  enableAnimations?: boolean;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.2 }
  }
};

const formVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { 
    opacity: 1, 
    height: 'auto',
    transition: { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] as const }
  }
} as const;

// Default quick feedback options
const quickFeedbackOptions: QuickFeedbackOption[] = [
  {
    id: 'helpful-yes',
    label: 'Helpful',
    icon: HandThumbUpIcon,
    type: 'helpful',
    description: 'This content was useful'
  },
  {
    id: 'helpful-no',
    label: 'Not Helpful',
    icon: HandThumbDownIcon,
    type: 'helpful',
    description: 'This content needs improvement'
  },
  {
    id: 'love-it',
    label: 'Love it',
    icon: HeartIcon,
    type: 'rating',
    description: 'Excellent content'
  },
  {
    id: 'suggestion',
    label: 'Suggest',
    icon: LightBulbIcon,
    type: 'suggestion',
    description: 'I have an idea'
  },
  {
    id: 'bug',
    label: 'Report Bug',
    icon: BugAntIcon,
    type: 'bug',
    description: 'Something is not working'
  },
  {
    id: 'question',
    label: 'Ask Question',
    icon: QuestionMarkCircleIcon,
    type: 'general',
    description: 'I need more help'
  }
];

// Utility functions
const getFeedbackTypeConfig = (type: FeedbackType) => {
  const configs = {
    helpful: { 
      color: 'text-green-600', 
      bgColor: 'bg-green-50', 
      borderColor: 'border-green-200',
      title: 'Was this helpful?'
    },
    rating: { 
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-50', 
      borderColor: 'border-yellow-200',
      title: 'Rate this content'
    },
    suggestion: { 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-50', 
      borderColor: 'border-blue-200',
      title: 'Share your suggestion'
    },
    bug: { 
      color: 'text-red-600', 
      bgColor: 'bg-red-50', 
      borderColor: 'border-red-200',
      title: 'Report a bug'
    },
    complaint: { 
      color: 'text-orange-600', 
      bgColor: 'bg-orange-50', 
      borderColor: 'border-orange-200',
      title: 'Share your concern'
    },
    general: { 
      color: 'text-gray-600', 
      bgColor: 'bg-gray-50', 
      borderColor: 'border-gray-200',
      title: 'General feedback'
    }
  };
  return configs[type];
};

const validateForm = (data: Partial<FeedbackFormData>, requireEmail: boolean) => {
  const errors: string[] = [];
  
  if (!data.type) errors.push('Please select a feedback type');
  if (!data.category) errors.push('Please select a category');
  if (!data.title?.trim()) errors.push('Please provide a title');
  if (!data.description?.trim()) errors.push('Please provide a description');
  if (requireEmail && !data.email?.trim()) errors.push('Email is required');
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Please enter a valid email address');
  }
  
  return errors;
};

// Main Component
const HelpFeedback: React.FC<HelpFeedbackProps> = ({
  articleId,
  pageType = 'general',
  onSubmit,
  onQuickFeedback,
  showQuickFeedback = true,
  showDetailedForm = true,
  autoExpand = false,
  maxAttachments = 3,
  allowAttachments = true,
  requireEmail = false,
  className,
  variant = 'full',
  enableAnimations = true
}) => {
  // Track feedback metrics
  const trackingData = {
    articleId: articleId || 'unknown',
    pageType: pageType,
    timestamp: new Date().toISOString()
  };

  const [showForm, setShowForm] = useState(autoExpand);
  const [selectedType, setSelectedType] = useState<FeedbackType | null>(null);
  const [rating, setRating] = useState<FeedbackRating | null>(null);
  const [quickRating, setQuickRating] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [formData, setFormData] = useState<Partial<FeedbackFormData>>({
    type: 'general',
    category: 'other',
    title: '',
    description: '',
    email: '',
    attachments: [],
    anonymous: false,
    followUp: true
  });

  // Handle quick feedback
  const handleQuickFeedback = (option: QuickFeedbackOption) => {
    if (option.type === 'helpful') {
      const isHelpful = option.id === 'helpful-yes';
      onQuickFeedback?.(option.type, isHelpful ? 1 : 0);
      setQuickRating(isHelpful ? 1 : 0);
    } else if (option.type === 'rating') {
      setRating(5);
      onQuickFeedback?.(option.type, 5);
    } else {
      setSelectedType(option.type);
      setFormData(prev => ({ ...prev, type: option.type }));
      setShowForm(true);
    }
  };

  // Handle star rating
  const handleStarRating = (star: FeedbackRating) => {
    setRating(star);
    setFormData(prev => ({ ...prev, rating: star }));
    onQuickFeedback?.('rating', star);
  };

  // Handle form input changes
  const handleInputChange = (field: keyof FeedbackFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const currentAttachments = formData.attachments || [];
    
    if (currentAttachments.length + files.length > maxAttachments) {
      setErrors([`Maximum ${maxAttachments} attachments allowed`]);
      return;
    }

    const newAttachments: FeedbackAttachment[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 'document',
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));

    handleInputChange('attachments', [...currentAttachments, ...newAttachments]);
  };

  // Remove attachment
  const removeAttachment = (id: string) => {
    const updatedAttachments = (formData.attachments || []).filter(att => att.id !== id);
    handleInputChange('attachments', updatedAttachments);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm(formData, requireEmail);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      // Include tracking data with feedback
      const feedbackWithTracking = {
        ...formData as FeedbackFormData,
        trackingData
      };
      await onSubmit?.(feedbackWithTracking);
      setSubmitted(true);
      
      // Reset form after delay
      setTimeout(() => {
        setShowForm(false);
        setSubmitted(false);
        setFormData({
          type: 'general',
          category: 'other',
          title: '',
          description: '',
          email: '',
          attachments: [],
          anonymous: false,
          followUp: true
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      setErrors(['Failed to submit feedback. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get variant-specific classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'compact':
        return 'max-w-md';
      case 'modal':
        return 'max-w-lg mx-auto';
      case 'full':
      default:
        return 'max-w-2xl';
    }
  };

  if (submitted) {
    return (
      <motion.div
        variants={enableAnimations ? containerVariants : undefined}
        initial="hidden"
        animate="visible"
        className={cn('w-full', getVariantClasses(), className)}
      >
        <Card className="p-6 text-center bg-green-50 border-green-200">
          <CheckCircleIconSolid className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Thank you for your feedback!
          </h3>
          <p className="text-green-700">
            Your feedback helps us improve our help content and user experience.
          </p>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={enableAnimations ? containerVariants : undefined}
      initial="hidden"
      animate="visible"
      className={cn('w-full', getVariantClasses(), className)}
    >
      {/* Quick Feedback */}
      {showQuickFeedback && !showForm && (
        <motion.div
          variants={enableAnimations ? itemVariants : undefined}
          className="mb-6"
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              How was your experience?
            </h3>
            
            {/* Star Rating */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3">Rate this content:</p>
              <div className="flex items-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleStarRating(star as FeedbackRating)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    {star <= (rating || 0) ? (
                      <StarIconSolid className="h-8 w-8 text-yellow-400" />
                    ) : (
                      <StarIcon className="h-8 w-8 text-gray-300" />
                    )}
                  </button>
                ))}
              </div>
              {rating && (
                <p className="text-sm text-green-600">
                  Thank you for rating this {rating} star{rating !== 1 ? 's' : ''}!
                </p>
              )}
            </div>

            {/* Quick Feedback Options */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {quickFeedbackOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleQuickFeedback(option)}
                  className={cn(
                    'p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 text-left',
                    'hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                    quickRating !== null && option.type === 'helpful' && 
                    ((option.id === 'helpful-yes' && quickRating === 1) || 
                     (option.id === 'helpful-no' && quickRating === 0)) &&
                    'border-green-300 bg-green-50'
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <option.icon className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-900">{option.label}</span>
                  </div>
                  {option.description && (
                    <p className="text-xs text-gray-600">{option.description}</p>
                  )}
                </button>
              ))}
            </div>

            {showDetailedForm && (
              <div className="text-center pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setShowForm(true)}
                  size="sm"
                >
                  <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                  Leave detailed feedback
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Detailed Feedback Form */}
      <AnimatePresence>
        {showForm && showDetailedForm && (
          <motion.div
            variants={enableAnimations ? formVariants : undefined}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedType ? getFeedbackTypeConfig(selectedType).title : 'Share your feedback'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowForm(false)}
                >
                  <XMarkIcon className="h-4 w-4" />
                </Button>
              </div>

              {errors.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircleIcon className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium text-red-800">
                      Please fix the following errors:
                    </span>
                  </div>
                  <ul className="text-sm text-red-700 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Feedback Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback Type *
                  </label>
                  <Select
                    options={[
                      { value: 'general', label: 'General Feedback' },
                      { value: 'suggestion', label: 'Suggestion' },
                      { value: 'bug', label: 'Bug Report' },
                      { value: 'complaint', label: 'Complaint' },
                      { value: 'helpful', label: 'Content Feedback' }
                    ]}
                    value={formData.type || 'general'}
                    onValueChange={(value) => handleInputChange('type', value as FeedbackType)}
                    placeholder="Select feedback type..."
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <Select
                    options={[
                      { value: 'content', label: 'Content Quality' },
                      { value: 'navigation', label: 'Navigation' },
                      { value: 'design', label: 'Design & Layout' },
                      { value: 'performance', label: 'Performance' },
                      { value: 'functionality', label: 'Functionality' },
                      { value: 'other', label: 'Other' }
                    ]}
                    value={formData.category || 'other'}
                    onValueChange={(value) => handleInputChange('category', value as FeedbackCategory)}
                    placeholder="Select category..."
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <Input
                    type="text"
                    placeholder="Brief description of your feedback"
                    value={formData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={errors.some(e => e.includes('title')) ? 'border-red-300' : ''}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <TextArea
                    placeholder="Please provide detailed feedback..."
                    rows={4}
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className={errors.some(e => e.includes('description')) ? 'border-red-300' : ''}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email {requireEmail ? '*' : '(optional)'}
                  </label>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={errors.some(e => e.includes('email')) ? 'border-red-300' : ''}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    We&apos;ll use this to follow up on your feedback if needed
                  </p>
                </div>

                {/* Attachments */}
                {allowAttachments && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Attachments (max {maxAttachments})
                    </label>
                    <div className="space-y-3">
                      {/* File Input */}
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          id="file-upload"
                          multiple
                          accept="image/*,.pdf,.doc,.docx"
                          onChange={handleFileUpload}
                          className="hidden"
                          aria-label="Upload feedback attachments"
                          title="Upload files to support your feedback"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('file-upload')?.click()}
                          disabled={(formData.attachments?.length || 0) >= maxAttachments}
                        >
                          <PhotoIcon className="h-4 w-4 mr-2" />
                          Add File
                        </Button>
                        <span className="text-xs text-gray-500">
                          Images, PDF, DOC files only
                        </span>
                      </div>

                      {/* Attachment List */}
                      {formData.attachments && formData.attachments.length > 0 && (
                        <div className="space-y-2">
                          {formData.attachments.map((attachment) => (
                            <div
                              key={attachment.id}
                              className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                            >
                              {attachment.type === 'image' ? (
                                <PhotoIcon className="h-4 w-4 text-blue-500" />
                              ) : (
                                <DocumentIcon className="h-4 w-4 text-red-500" />
                              )}
                              <span className="text-sm text-gray-700 flex-1 truncate">
                                {attachment.name}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAttachment(attachment.id)}
                              >
                                <XMarkIcon className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Options */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.anonymous || false}
                      onChange={(e) => handleInputChange('anonymous', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Submit anonymously</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.followUp || false}
                      onChange={(e) => handleInputChange('followUp', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      I&apos;m open to follow-up questions
                    </span>
                  </label>
                </div>

                {/* Submit */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <ClockIcon className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                        Submit Feedback
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HelpFeedback;
