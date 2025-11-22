'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDownIcon, 
  ChevronUpIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  FireIcon,
  TagIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/Separator';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils';
import FAQItem from './FAQItem';

// Types and Interfaces
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  status: 'answered' | 'pending' | 'draft';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  votes: {
    upvotes: number;
    downvotes: number;
  };
  views: number;
  lastUpdated: string;
  createdAt: string;
  isBookmarked?: boolean;
  relatedFAQs?: string[];
  author?: {
    name: string;
    role: string;
    avatar?: string;
  };
}

export interface FAQCategoryData {
  id: string;
  name: string;
  description: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  stats: {
    total: number;
    answered: number;
    pending: number;
    popular: number;
  };
  faqs: FAQ[];
}

export interface FAQCategoryProps {
  category: FAQCategoryData;
  isExpanded?: boolean;
  onToggle?: (categoryId: string) => void;
  onFAQVote?: (faqId: string, voteType: 'up' | 'down') => void;
  onFAQBookmark?: (faqId: string) => void;
  onFAQShare?: (faqId: string) => void;
  searchTerm?: string;
  selectedTags?: string[];
  sortBy?: 'relevance' | 'date' | 'votes' | 'views';
  className?: string;
  showStats?: boolean;
  showProgress?: boolean;
  maxDisplayedFAQs?: number;
  enableAnimations?: boolean;
}

// Animation variants
const categoryVariants = {
  collapsed: { 
    height: 'auto',
    transition: { duration: 0.3 }
  },
  expanded: { 
    height: 'auto',
    transition: { duration: 0.3 }
  }
};

const contentVariants = {
  collapsed: { 
    opacity: 0,
    height: 0,
    transition: { duration: 0.2 }
  },
  expanded: { 
    opacity: 1,
    height: 'auto',
    transition: { duration: 0.3, delay: 0.1 }
  }
};

const statsVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.2, staggerChildren: 0.1 }
  }
};

const statItemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 }
};

// Utility functions for styling (exported for use in other components)
export const getStatusColor = (status: FAQ['status']) => {
  switch (status) {
    case 'answered': return 'text-green-600 bg-green-50';
    case 'pending': return 'text-yellow-600 bg-yellow-50';
    case 'draft': return 'text-gray-600 bg-gray-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

export const getDifficultyColor = (difficulty: FAQ['difficulty']) => {
  switch (difficulty) {
    case 'beginner': return 'text-green-600 bg-green-50';
    case 'intermediate': return 'text-blue-600 bg-blue-50';
    case 'advanced': return 'text-red-600 bg-red-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

const filterFAQs = (
  faqs: FAQ[], 
  searchTerm?: string, 
  selectedTags?: string[], 
  sortBy?: string
) => {
  let filtered = [...faqs];

  // Filter by search term
  if (searchTerm && searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(faq => 
      faq.question.toLowerCase().includes(term) ||
      faq.answer.toLowerCase().includes(term) ||
      faq.tags.some(tag => tag.toLowerCase().includes(term))
    );
  }

  // Filter by tags
  if (selectedTags && selectedTags.length > 0) {
    filtered = filtered.filter(faq =>
      selectedTags.some(tag => faq.tags.includes(tag))
    );
  }

  // Sort FAQs
  switch (sortBy) {
    case 'date':
      filtered.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
      break;
    case 'votes':
      filtered.sort((a, b) => 
        (b.votes.upvotes - b.votes.downvotes) - (a.votes.upvotes - a.votes.downvotes)
      );
      break;
    case 'views':
      filtered.sort((a, b) => b.views - a.views);
      break;
    case 'relevance':
    default:
      // Keep original order for relevance
      break;
  }

  return filtered;
};

// Main Component
const FAQCategory: React.FC<FAQCategoryProps> = ({
  category,
  isExpanded = false,
  onToggle,
  onFAQVote,
  onFAQBookmark,
  onFAQShare,
  searchTerm,
  selectedTags,
  sortBy = 'relevance',
  className,
  showStats = true,
  showProgress = true,
  maxDisplayedFAQs,
  enableAnimations = true
}) => {
  const [localExpanded, setLocalExpanded] = useState(isExpanded);

  // Filter and sort FAQs
  const filteredFAQs = useMemo(() => {
    const filtered = filterFAQs(category.faqs, searchTerm, selectedTags, sortBy);
    return maxDisplayedFAQs ? filtered.slice(0, maxDisplayedFAQs) : filtered;
  }, [category.faqs, searchTerm, selectedTags, sortBy, maxDisplayedFAQs]);

  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    if (category.stats.total === 0) return 0;
    return Math.round((category.stats.answered / category.stats.total) * 100);
  }, [category.stats]);

  // Handle toggle
  const handleToggle = () => {
    const newExpanded = !localExpanded;
    setLocalExpanded(newExpanded);
    onToggle?.(category.id);
  };

  // Get category icon
  const CategoryIcon = category.icon || QuestionMarkCircleIcon;

  return (
    <motion.div
      className={cn('w-full', className)}
      variants={enableAnimations ? categoryVariants : undefined}
      animate={localExpanded ? 'expanded' : 'collapsed'}
      initial={false}
    >
      <Card className="overflow-hidden border-l-4 hover:shadow-lg transition-shadow duration-200"
            style={{ borderLeftColor: category.color }}>
        
        {/* Category Header */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            {/* Left Section - Category Info */}
            <div className="flex items-center gap-4 flex-1">
              <div 
                className="p-3 rounded-lg flex-shrink-0 bg-blue-50"
              >
                <CategoryIcon 
                  className="h-6 w-6" 
                  style={{ color: category.color }}
                />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {category.name}
                  </h3>
                  <Badge variant="outline" className="text-sm">
                    {category.stats.total} FAQs
                  </Badge>
                </div>
                
                <p className="text-gray-600 text-sm leading-relaxed">
                  {category.description}
                </p>
                
                {/* Progress Bar */}
                {showProgress && (
                  <div className="mt-3 flex items-center gap-3">
                    <Progress 
                      value={progressPercentage} 
                      className="flex-1 h-2"
                      style={{ backgroundColor: `${category.color}20` }}
                    />
                    <span className="text-xs text-gray-500 font-medium">
                      {progressPercentage}% Complete
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Section - Stats and Toggle */}
            <div className="flex items-center gap-6">
              {/* Category Stats */}
              {showStats && (
                <motion.div 
                  className="flex items-center gap-6"
                  variants={enableAnimations ? statsVariants : undefined}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div 
                    className="text-center"
                    variants={enableAnimations ? statItemVariants : undefined}
                  >
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircleIcon className="h-4 w-4" />
                      <span className="text-lg font-bold">{category.stats.answered}</span>
                    </div>
                    <p className="text-xs text-gray-500">Answered</p>
                  </motion.div>
                  
                  <motion.div 
                    className="text-center"
                    variants={enableAnimations ? statItemVariants : undefined}
                  >
                    <div className="flex items-center gap-1 text-yellow-600">
                      <ClockIcon className="h-4 w-4" />
                      <span className="text-lg font-bold">{category.stats.pending}</span>
                    </div>
                    <p className="text-xs text-gray-500">Pending</p>
                  </motion.div>
                  
                  <motion.div 
                    className="text-center"
                    variants={enableAnimations ? statItemVariants : undefined}
                  >
                    <div className="flex items-center gap-1 text-red-600">
                      <FireIcon className="h-4 w-4" />
                      <span className="text-lg font-bold">{category.stats.popular}</span>
                    </div>
                    <p className="text-xs text-gray-500">Popular</p>
                  </motion.div>
                </motion.div>
              )}
              
              {/* Toggle Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggle}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <span className="text-sm font-medium">
                  {localExpanded ? 'Collapse' : 'Expand'}
                </span>
                {localExpanded ? (
                  <ChevronUpIcon className="h-4 w-4" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Category Content - FAQ List */}
        <AnimatePresence initial={false}>
          {localExpanded && (
            <motion.div
              variants={enableAnimations ? contentVariants : undefined}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              style={{ overflow: 'hidden' }}
            >
              <Separator />
              
              <div className="p-6 pt-4">
                {/* Filter Summary */}
                {(searchTerm || (selectedTags && selectedTags.length > 0)) && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-blue-800">
                      <TagIcon className="h-4 w-4" />
                      <span>
                        Showing {filteredFAQs.length} of {category.faqs.length} FAQs
                        {searchTerm && ` matching "${searchTerm}"`}
                        {selectedTags && selectedTags.length > 0 && 
                          ` with tags: ${selectedTags.join(', ')}`
                        }
                      </span>
                    </div>
                  </div>
                )}

                {/* FAQ Items */}
                {filteredFAQs.length > 0 ? (
                  <div className="space-y-4">
                    {filteredFAQs.map((faq, index) => (
                      <motion.div
                        key={faq.id}
                        initial={enableAnimations ? { opacity: 0, y: 20 } : false}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          duration: 0.3, 
                          delay: enableAnimations ? index * 0.1 : 0 
                        }}
                      >
                        <FAQItem
                          faq={faq}
                          onVote={onFAQVote}
                          onBookmark={onFAQBookmark}
                          onShare={onFAQShare}
                          searchTerm={searchTerm}
                          compact={false}
                          showMetadata={true}
                          className="border-l-2 border-transparent hover:border-blue-200 transition-colors duration-200"
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <QuestionMarkCircleIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      No FAQs Found
                    </h4>
                    <p className="text-gray-500">
                      {searchTerm || (selectedTags && selectedTags.length > 0)
                        ? "Try adjusting your search or filter criteria"
                        : "No FAQs available in this category yet"
                      }
                    </p>
                  </div>
                )}

                {/* Load More Button */}
                {maxDisplayedFAQs && 
                 filteredFAQs.length === maxDisplayedFAQs && 
                 category.faqs.length > maxDisplayedFAQs && (
                  <div className="mt-6 text-center">
                    <Button 
                      variant="outline"
                      className="gap-2"
                      onClick={() => {
                        // This would be handled by parent component to show more FAQs
                      }}
                    >
                      <UsersIcon className="h-4 w-4" />
                      Load More FAQs ({category.faqs.length - maxDisplayedFAQs} remaining)
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default FAQCategory;
