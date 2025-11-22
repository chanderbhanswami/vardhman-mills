'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  MoreHorizontal, 
  ThumbsUp, 
  ThumbsDown, 
  Reply, 
  Edit, 
  Trash2, 
  Flag, 
  Share2, 
  Copy, 
  Check, 
  Filter, 
  Search, 
  SortAsc, 
  SortDesc, 
  Calendar, 
  Clock, 
  User, 
  Pin, 
  PinOff, 
  Crown, 
  Shield, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Bookmark, 
  BookmarkCheck, 
  Loader2,
  RefreshCw,
  Download,
  Hash
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';
import ReplyForm, { ReplyData } from './ReplyForm';
import MediaUploader from './MediaUploader';
import ReviewReplyItem from '../ReviewReplyItem';

// Types
export interface Reply extends ReplyData {
  id: string;
  likes: number;
  dislikes: number;
  replies: Reply[];
  userVote?: 'like' | 'dislike' | null;
  isPinned: boolean;
  isEdited: boolean;
  isFlagged: boolean;
  isBookmarked: boolean;
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role?: 'user' | 'moderator' | 'admin' | 'verified';
    isOnline?: boolean;
    lastSeen?: Date;
    reputation?: number;
    badge?: string;
  };
  level: number;
  editHistory?: Array<{
    version: number;
    content: string;
    editedAt: Date;
    editedBy: string;
    reason?: string;
  }>;
  reports?: Array<{
    id: string;
    reportedBy: string;
    reason: string;
    reportedAt: Date;
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  }>;
  reactions?: Array<{
    type: string;
    emoji: string;
    count: number;
    users: string[];
  }>;
  highlights?: Array<{
    text: string;
    color: string;
    note?: string;
  }>;
}

export interface ReplyListProps {
  replies: Reply[];
  onReplyUpdate: (reply: Reply) => void;
  onReplyDelete: (replyId: string) => void;
  onReplyAdd: (parentId: string | null, replyData: ReplyData) => void;
  onVote: (replyId: string, voteType: 'like' | 'dislike') => void;
  onPin: (replyId: string, isPinned: boolean) => void;
  onFlag: (replyId: string, reason: string) => void;
  onBookmark: (replyId: string, isBookmarked: boolean) => void;
  onShare: (reply: Reply) => void;
  onReaction: (replyId: string, reaction: string) => void;
  currentUserId?: string;
  canModerate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canPin?: boolean;
  canFlag?: boolean;
  showVoting?: boolean;
  showReplies?: boolean;
  showBookmarks?: boolean;
  showSharing?: boolean;
  showReactions?: boolean;
  showTimestamps?: boolean;
  showAuthorInfo?: boolean;
  showEditHistory?: boolean;
  showReports?: boolean;
  maxDepth?: number;
  pageSize?: number;
  enableSearch?: boolean;
  enableFiltering?: boolean;
  enableSorting?: boolean;
  enableBulkActions?: boolean;
  replyFormProps?: Partial<React.ComponentProps<typeof ReplyForm>>;
  className?: string;
  emptyStateMessage?: string;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  isLoading?: boolean;
  hasError?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  virtualizationEnabled?: boolean;
  customActions?: Array<{
    label: string;
    icon: React.ReactNode;
    action: (reply: Reply) => void;
    condition?: (reply: Reply) => boolean;
    variant?: 'default' | 'destructive' | 'outline';
  }>;
  filters?: {
    status?: Array<'pending' | 'published' | 'flagged' | 'pinned'>;
    author?: string[];
    dateRange?: { start: Date; end: Date };
    hasAttachments?: boolean;
    hasReplies?: boolean;
    minLikes?: number;
    tags?: string[];
  };
  sorting?: {
    field: 'date' | 'likes' | 'replies' | 'author' | 'status';
    direction: 'asc' | 'desc';
  };
  onFilterChange?: (filters: {
    status?: Array<'pending' | 'published' | 'flagged' | 'pinned'>;
    author?: string[];
    dateRange?: { start: Date; end: Date };
    hasAttachments?: boolean;
    hasReplies?: boolean;
    minLikes?: number;
    tags?: string[];
  }) => void;
  onSortChange?: (sorting: {
    field: 'date' | 'likes' | 'replies' | 'author' | 'status';
    direction: 'asc' | 'desc';
  }) => void;
}

const ReplyList: React.FC<ReplyListProps> = ({
  replies,
  onReplyUpdate,
  onReplyDelete,
  onReplyAdd,
  onVote,
  onPin,
  onFlag,
  onBookmark,
  onShare,
  onReaction,
  currentUserId,
  canModerate = false,
  canEdit = true,
  canDelete = true,
  canPin = false,
  canFlag = true,
  showVoting = true,
  showReplies = true,
  showBookmarks = true,
  showSharing = true,
  showReactions = true,
  showTimestamps = true,
  showAuthorInfo = true,
  showEditHistory = false,
  maxDepth = 5,
  pageSize = 20,
  enableSearch = true,
  enableFiltering = true,
  enableSorting = true,
  enableBulkActions = false,
  replyFormProps,
  className,
  emptyStateMessage = 'No replies yet. Be the first to start the conversation!',
  loadingComponent,
  errorComponent,
  isLoading = false,
  hasError = false,
  onLoadMore,
  hasMore = false,
  customActions,
  filters,
  sorting,
  onFilterChange,
  onSortChange
}) => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters || {});
  const [localSorting, setLocalSorting] = useState<{
    field: 'date' | 'likes' | 'replies' | 'author' | 'status';
    direction: 'asc' | 'desc';
  }>(sorting || { field: 'date', direction: 'desc' });
  const [selectedReplies, setSelectedReplies] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [copiedReplyId, setCopiedReplyId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Array<{ id: string; type: 'success' | 'error' | 'info'; message: string }>>([]);
  const [currentPage] = useState(1);

  // Show notification
  const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  // Format time
  const formatTime = useCallback((date: Date | undefined) => {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }, []);

  // Toggle reply expansion
  const toggleReplyExpansion = useCallback((replyId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(replyId)) {
        newSet.delete(replyId);
      } else {
        newSet.add(replyId);
      }
      return newSet;
    });
  }, []);

  // Handle voting
  const handleVote = useCallback((replyId: string, voteType: 'like' | 'dislike') => {
    onVote(replyId, voteType);
    showNotification('success', `${voteType === 'like' ? 'Liked' : 'Disliked'} reply`);
  }, [onVote, showNotification]);

  // Handle copy to clipboard
  const handleCopy = useCallback(async (reply: Reply) => {
    try {
      await navigator.clipboard.writeText(reply.content);
      setCopiedReplyId(reply.id);
      showNotification('success', 'Reply copied to clipboard');
      setTimeout(() => setCopiedReplyId(null), 2000);
    } catch {
      showNotification('error', 'Failed to copy reply');
    }
  }, [showNotification]);

  // Handle share
  const handleShare = useCallback((reply: Reply) => {
    if (navigator.share) {
      navigator.share({
        title: `Reply by ${reply.author.name}`,
        text: reply.content,
        url: window.location.href
      });
    } else {
      handleCopy(reply);
    }
    onShare(reply);
  }, [onShare, handleCopy]);

  // Handle bookmark
  const handleBookmark = useCallback((reply: Reply) => {
    onBookmark(reply.id, !reply.isBookmarked);
    showNotification('success', reply.isBookmarked ? 'Bookmark removed' : 'Reply bookmarked');
  }, [onBookmark, showNotification]);

  // Handle pin
  const handlePin = useCallback((reply: Reply) => {
    if (!canPin) return;
    onPin(reply.id, !reply.isPinned);
    showNotification('success', reply.isPinned ? 'Reply unpinned' : 'Reply pinned');
  }, [onPin, canPin, showNotification]);

  // Handle flag
  const handleFlag = useCallback((reply: Reply) => {
    if (!canFlag) return;
    const reason = prompt('Please provide a reason for flagging this reply:');
    if (reason) {
      onFlag(reply.id, reason);
      showNotification('success', 'Reply flagged for review');
    }
  }, [onFlag, canFlag, showNotification]);

  // Handle delete
  const handleDelete = useCallback((reply: Reply) => {
    if (!canDelete) return;
    if (window.confirm('Are you sure you want to delete this reply? This action cannot be undone.')) {
      onReplyDelete(reply.id);
      showNotification('success', 'Reply deleted');
    }
  }, [onReplyDelete, canDelete, showNotification]);

  // Handle bulk actions
  const handleBulkAction = useCallback((action: string) => {
    const selectedIds = Array.from(selectedReplies);
    
    switch (action) {
      case 'delete':
        if (window.confirm(`Delete ${selectedIds.length} replies? This action cannot be undone.`)) {
          selectedIds.forEach(id => onReplyDelete(id));
          setSelectedReplies(new Set());
          showNotification('success', `${selectedIds.length} replies deleted`);
        }
        break;
      case 'flag':
        const reason = prompt('Reason for flagging selected replies:');
        if (reason) {
          selectedIds.forEach(id => onFlag(id, reason));
          setSelectedReplies(new Set());
          showNotification('success', `${selectedIds.length} replies flagged`);
        }
        break;
      case 'export':
        const selectedRepliesData = replies.filter(r => selectedIds.includes(r.id));
        const exportData = JSON.stringify(selectedRepliesData, null, 2);
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `replies-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showNotification('success', 'Replies exported');
        break;
    }
  }, [selectedReplies, replies, onReplyDelete, onFlag, showNotification]);

  // Filter and sort replies
  const filteredAndSortedReplies = useMemo(() => {
    let filtered = [...replies];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(reply => 
        reply.content.toLowerCase().includes(query) ||
        reply.author.name.toLowerCase().includes(query) ||
        reply.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply filters
    if (localFilters.status?.length) {
      filtered = filtered.filter(reply => {
        // Map reply status to filter status
        const statusMap: Record<string, string> = {
          'pending': 'pending',
          'published': 'published', 
          'draft': 'pending',
          'rejected': 'flagged'
        };
        const mappedStatus = statusMap[reply.status] || reply.status;
        return localFilters.status?.includes(mappedStatus as 'pending' | 'published' | 'flagged' | 'pinned');
      });
    }

    if (localFilters.author?.length) {
      filtered = filtered.filter(reply => localFilters.author?.includes(reply.author.id));
    }

    if (localFilters.hasAttachments) {
      filtered = filtered.filter(reply => reply.attachments.length > 0);
    }

    if (localFilters.hasReplies) {
      filtered = filtered.filter(reply => reply.replies.length > 0);
    }

    if (localFilters.minLikes) {
      filtered = filtered.filter(reply => reply.likes >= localFilters.minLikes!);
    }

    if (localFilters.tags?.length) {
      filtered = filtered.filter(reply => 
        reply.tags?.some(tag => localFilters.tags?.includes(tag))
      );
    }

    if (localFilters.dateRange) {
      filtered = filtered.filter(reply => {
        const createdAt = reply.createdAt;
        if (!createdAt) return false;
        return createdAt >= localFilters.dateRange!.start && 
               createdAt <= localFilters.dateRange!.end;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (localSorting.field) {
        case 'date':
          comparison = (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0);
          break;
        case 'likes':
          comparison = a.likes - b.likes;
          break;
        case 'replies':
          comparison = a.replies.length - b.replies.length;
          break;
        case 'author':
          comparison = a.author.name.localeCompare(b.author.name);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return localSorting.direction === 'desc' ? -comparison : comparison;
    });

    // Separate pinned replies
    const pinned = filtered.filter(reply => reply.isPinned);
    const regular = filtered.filter(reply => !reply.isPinned);

    return [...pinned, ...regular];
  }, [replies, searchQuery, localFilters, localSorting]);

  // Paginated replies
  const paginatedReplies = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedReplies.slice(0, startIndex + pageSize);
  }, [filteredAndSortedReplies, currentPage, pageSize]);

  // Effect to notify parent of filter/sort changes
  useEffect(() => {
    onFilterChange?.(localFilters);
  }, [localFilters, onFilterChange]);

  useEffect(() => {
    onSortChange?.(localSorting);
  }, [localSorting, onSortChange]);

  // Auto-expand replies initially
  useEffect(() => {
    if (replies.length > 0) {
      const topLevelReplies = replies.filter(r => r.level === 0).slice(0, 3);
      setExpandedReplies(new Set(topLevelReplies.map(r => r.id)));
    }
  }, [replies]);

  // Render reply component
  const renderReply = useCallback((reply: Reply, depth: number = 0) => {
    const isExpanded = expandedReplies.has(reply.id);
    const hasReplies = reply.replies.length > 0;
    const canShowReplies = showReplies && depth < maxDepth;
    const isEditing = editingReply === reply.id;
    const isReplying = replyingTo === reply.id;
    const isSelected = selectedReplies.has(reply.id);
    const isOwner = reply.author.id === currentUserId;

    return (
      <motion.div
        key={reply.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn(
          "relative",
          depth > 0 && "ml-8 border-l-2 border-gray-200 pl-4"
        )}
      >
        <Card className={cn(
          "p-4 mb-4 transition-all",
          reply.isPinned && "border-blue-500 bg-blue-50",
          reply.isFlagged && "border-red-500 bg-red-50",
          isSelected && "ring-2 ring-blue-500"
        )}>
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {enableBulkActions && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    const newSelected = new Set(selectedReplies);
                    if (e.target.checked) {
                      newSelected.add(reply.id);
                    } else {
                      newSelected.delete(reply.id);
                    }
                    setSelectedReplies(newSelected);
                  }}
                  className="rounded"
                  aria-label={`Select reply by ${reply.author.name}`}
                />
              )}

              {showAuthorInfo && (
                <div className="flex items-center gap-2">
                  {reply.author.avatar ? (
                    <Image
                      src={reply.author.avatar}
                      alt={reply.author.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{reply.author.name}</span>
                      
                      {reply.author.role === 'admin' && (
                        <Tooltip content="Admin">
                          <Crown className="w-4 h-4 text-yellow-500" />
                        </Tooltip>
                      )}
                      {reply.author.role === 'moderator' && (
                        <Tooltip content="Moderator">
                          <Shield className="w-4 h-4 text-blue-500" />
                        </Tooltip>
                      )}
                      {reply.author.role === 'verified' && (
                        <Tooltip content="Verified">
                          <Check className="w-4 h-4 text-green-500" />
                        </Tooltip>
                      )}
                      
                      {reply.author.isOnline && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" title="Online" />
                      )}
                    </div>
                    
                    {showTimestamps && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {formatTime(reply.createdAt)}
                        {reply.isEdited && (
                          <span className="text-gray-400">(edited)</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {reply.isPinned && (
                <Tooltip content="Pinned">
                  <Pin className="w-4 h-4 text-blue-500" />
                </Tooltip>
              )}
              {reply.isFlagged && (
                <Tooltip content="Flagged">
                  <Flag className="w-4 h-4 text-red-500" />
                </Tooltip>
              )}
              {reply.isBookmarked && (
                <Tooltip content="Bookmarked">
                  <BookmarkCheck className="w-4 h-4 text-yellow-500" />
                </Tooltip>
              )}

              {/* Actions dropdown */}
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
                
                <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg z-10 min-w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="py-1">
                    {canEdit && isOwner && (
                      <button
                        onClick={() => setEditingReply(reply.id)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                    )}
                    
                    <button
                      onClick={() => setReplyingTo(reply.id)}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      <Reply className="w-4 h-4" />
                      Reply
                    </button>
                    
                    <button
                      onClick={() => handleCopy(reply)}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      {copiedReplyId === reply.id ? (
                        <>
                          <Check className="w-4 h-4 text-green-500" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                    
                    {showSharing && (
                      <button
                        onClick={() => handleShare(reply)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                    )}
                    
                    {showBookmarks && (
                      <button
                        onClick={() => handleBookmark(reply)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        {reply.isBookmarked ? (
                          <>
                            <Bookmark className="w-4 h-4" />
                            Remove Bookmark
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-4 h-4" />
                            Bookmark
                          </>
                        )}
                      </button>
                    )}
                    
                    {canPin && (
                      <button
                        onClick={() => handlePin(reply)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        {reply.isPinned ? (
                          <>
                            <PinOff className="w-4 h-4" />
                            Unpin
                          </>
                        ) : (
                          <>
                            <Pin className="w-4 h-4" />
                            Pin
                          </>
                        )}
                      </button>
                    )}
                    
                    {canFlag && !isOwner && (
                      <button
                        onClick={() => handleFlag(reply)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                      >
                        <Flag className="w-4 h-4" />
                        Flag
                      </button>
                    )}
                    
                    {customActions?.map((action, index) => (
                      action.condition?.(reply) !== false && (
                        <button
                          key={index}
                          onClick={() => action.action(reply)}
                          className={cn(
                            "flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100",
                            action.variant === 'destructive' && 'text-red-600'
                          )}
                        >
                          {action.icon}
                          {action.label}
                        </button>
                      )
                    ))}
                    
                    {canDelete && (isOwner || canModerate) && (
                      <>
                        <div className="border-t my-1" />
                        <button
                          onClick={() => handleDelete(reply)}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          {isEditing ? (
            <div className="mb-4">
              <ReplyForm
                {...replyFormProps}
                initialData={reply}
                reviewId={reply.reviewId || ''}
                isEditing={true}
                onSubmit={async (updatedReply) => {
                  onReplyUpdate({ ...reply, ...updatedReply });
                  setEditingReply(null);
                  showNotification('success', 'Reply updated');
                }}
                onCancel={() => setEditingReply(null)}
                submitButtonText="Update Reply"
              />
            </div>
          ) : (
            <div className="mb-4">
              <div className="prose prose-sm max-w-none">
                {/* Render content with basic markdown support */}
                <div dangerouslySetInnerHTML={{
                  __html: reply.content
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
                    .replace(/^>\s(.*)$/gm, '<blockquote>$1</blockquote>')
                    .replace(/\n/g, '<br>')
                }} />
              </div>

              {/* Tags */}
              {reply.tags && reply.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {reply.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      <Hash className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Attachments */}
              {reply.attachments && reply.attachments.length > 0 && (
                <div className="mt-3">
                  <MediaUploader
                    onFilesChange={() => {}}
                    maxFiles={0}
                    disabled={true}
                    className="pointer-events-none"
                  />
                </div>
              )}

              {/* Reactions */}
              {showReactions && reply.reactions && reply.reactions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {reply.reactions.map((reaction, index) => (
                    <button
                      key={index}
                      onClick={() => onReaction(reply.id, reaction.type)}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm"
                    >
                      <span>{reaction.emoji}</span>
                      <span>{reaction.count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-4">
              {showVoting && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(reply.id, 'like')}
                    className={cn(
                      "flex items-center gap-1",
                      reply.userVote === 'like' && "text-green-600 bg-green-50"
                    )}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    {reply.likes > 0 && <span>{reply.likes}</span>}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(reply.id, 'dislike')}
                    className={cn(
                      "flex items-center gap-1",
                      reply.userVote === 'dislike' && "text-red-600 bg-red-50"
                    )}
                  >
                    <ThumbsDown className="w-4 h-4" />
                    {reply.dislikes > 0 && <span>{reply.dislikes}</span>}
                  </Button>
                </div>
              )}

              {hasReplies && canShowReplies && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleReplyExpansion(reply.id)}
                  className="flex items-center gap-1"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  {reply.replies.length} {reply.replies.length === 1 ? 'reply' : 'replies'}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {showEditHistory && reply.editHistory && reply.editHistory.length > 0 && (
                <Tooltip content={`Edited ${reply.editHistory.length} times`}>
                  <Button variant="ghost" size="sm">
                    <Clock className="w-4 h-4" />
                  </Button>
                </Tooltip>
              )}

              {reply.status === 'pending' && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  Pending
                </Badge>
              )}
            </div>
          </div>
        </Card>

        {/* Reply form */}
        {isReplying && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-4 mb-4"
          >
            <ReplyForm
              {...replyFormProps}
              parentReply={reply}
              reviewId={reply.reviewId}
              onSubmit={async (newReply) => {
                onReplyAdd(reply.id, newReply);
                setReplyingTo(null);
                showNotification('success', 'Reply added');
              }}
              onCancel={() => setReplyingTo(null)}
              placeholder={`Reply to ${reply.author.name}...`}
            />
          </motion.div>
        )}

        {/* Nested replies */}
        {isExpanded && hasReplies && canShowReplies && (
          <div className="space-y-2">
            {reply.replies.map(nestedReply => 
              renderReply(nestedReply, depth + 1)
            )}
          </div>
        )}
      </motion.div>
    );
  }, [
    expandedReplies, editingReply, replyingTo, selectedReplies, currentUserId,
    showAuthorInfo, showTimestamps, showVoting, showReplies, showReactions,
    showBookmarks, showSharing, showEditHistory, maxDepth, enableBulkActions,
    canEdit, canDelete, canPin, canFlag, canModerate, customActions,
    copiedReplyId, replyFormProps, onReplyUpdate, onReplyAdd, onReaction,
    toggleReplyExpansion, handleVote, handleCopy, handleShare, handleBookmark,
    handlePin, handleFlag, handleDelete, showNotification, formatTime
  ]);

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {loadingComponent || (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-500">Loading replies...</span>
          </div>
        )}
      </div>
    );
  }

  // Error state
  if (hasError) {
    return (
      <div className={cn("space-y-4", className)}>
        {errorComponent || (
          <div className="flex items-center justify-center py-12 text-red-500">
            <AlertTriangle className="w-8 h-8 mr-2" />
            <span>Failed to load replies</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map(notification => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={cn(
                "p-4 rounded-lg shadow-lg",
                notification.type === 'success' && 'bg-green-100 text-green-800',
                notification.type === 'error' && 'bg-red-100 text-red-800',
                notification.type === 'info' && 'bg-blue-100 text-blue-800'
              )}
            >
              {notification.message}
            </motion.div>
          ))}
        </div>
      )}

      {/* Header with controls */}
      {(enableSearch || enableFiltering || enableSorting || enableBulkActions) && (
        <Card className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {enableSearch && (
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSearch(!showSearch)}
                    className="flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Search
                  </Button>
                  
                  {showSearch && (
                    <div className="absolute top-10 left-0 z-10 bg-white border rounded-lg shadow-lg p-4 min-w-80">
                      <Input
                        placeholder="Search replies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="mb-2"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearchQuery('');
                            setShowSearch(false);
                          }}
                        >
                          Clear
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setShowSearch(false)}
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {enableFiltering && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>
              )}

              {enableSorting && (
                <div className="flex items-center gap-2">
                  <select
                    value={localSorting.field}
                    onChange={(e) => setLocalSorting(prev => ({ 
                      ...prev, 
                      field: e.target.value as 'date' | 'likes' | 'replies' | 'author' | 'status'
                    }))}
                    className="border rounded px-3 py-1 text-sm"
                    title="Sort replies by"
                  >
                    <option value="date">Date</option>
                    <option value="likes">Likes</option>
                    <option value="replies">Replies</option>
                    <option value="author">Author</option>
                    <option value="status">Status</option>
                  </select>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLocalSorting(prev => ({
                      ...prev,
                      direction: prev.direction === 'asc' ? 'desc' : 'asc'
                    }))}
                  >
                    {localSorting.direction === 'asc' ? (
                      <SortAsc className="w-4 h-4" />
                    ) : (
                      <SortDesc className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {enableBulkActions && selectedReplies.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {selectedReplies.size} selected
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBulkActions(!showBulkActions)}
                  >
                    Actions
                  </Button>
                  
                  {showBulkActions && (
                    <div className="absolute top-10 right-0 z-10 bg-white border rounded-lg shadow-lg">
                      <div className="py-1">
                        <button
                          onClick={() => handleBulkAction('export')}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          <Download className="w-4 h-4" />
                          Export
                        </button>
                        {canFlag && (
                          <button
                            onClick={() => handleBulkAction('flag')}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            <Flag className="w-4 h-4" />
                            Flag
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleBulkAction('delete')}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="text-sm text-gray-600">
                {filteredAndSortedReplies.length} of {replies.length} replies
              </div>
            </div>
          </div>

          {/* Advanced filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    multiple
                    value={localFilters.status || []}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => option.value) as Array<'pending' | 'published' | 'flagged'>;
                      setLocalFilters(prev => ({ ...prev, status: values }));
                    }}
                    className="w-full border rounded px-3 py-2 text-sm"
                    title="Filter by status"
                  >
                    <option value="pending">Pending</option>
                    <option value="published">Published</option>
                    <option value="flagged">Flagged</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Likes
                  </label>
                  <Input
                    type="number"
                    value={localFilters.minLikes || ''}
                    onChange={(e) => setLocalFilters(prev => ({ 
                      ...prev, 
                      minLikes: parseInt(e.target.value) || undefined 
                    }))}
                    placeholder="0"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={localFilters.hasAttachments || false}
                      onChange={(e) => setLocalFilters(prev => ({
                        ...prev,
                        hasAttachments: e.target.checked
                      }))}
                      className="rounded"
                    />
                    <span className="text-sm">Has attachments</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={localFilters.hasReplies || false}
                      onChange={(e) => setLocalFilters(prev => ({
                        ...prev,
                        hasReplies: e.target.checked
                      }))}
                      className="rounded"
                    />
                    <span className="text-sm">Has replies</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLocalFilters({});
                    setSearchQuery('');
                  }}
                >
                  Clear All
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  Apply
                </Button>
              </div>
            </motion.div>
          )}
        </Card>
      )}

      {/* Reply list */}
      <AnimatePresence>
        {paginatedReplies.length > 0 ? (
          <div className="space-y-4">
            {paginatedReplies.map(reply => (
              <ReviewReplyItem
                key={reply.id}
                id={reply.id}
                user={{
                  id: reply.author.id,
                  displayName: reply.author.name,
                  avatar: reply.author.avatar ? {
                    id: `avatar-${reply.author.id}`,
                    url: reply.author.avatar,
                    alt: reply.author.name,
                    width: 40,
                    height: 40,
                    format: 'webp' as const
                  } : undefined,
                  badges: reply.author.role === 'verified' ? [{
                    id: 'verified',
                    name: 'verified',
                    icon: '✓',
                    color: 'blue',
                    description: 'Verified user',
                    earnedAt: new Date().toISOString(),
                    category: 'verified' as const,
                    requirements: []
                  }] : [],
                  reputationScore: reply.author.reputation || 0,
                  trustScore: 0,
                  isVerified: reply.author.role === 'verified',
                  memberSince: new Date().toISOString(),
                  lastActiveAt: reply.author.lastSeen?.toISOString() || new Date().toISOString(),
                  location: undefined,
                  showRealName: true,
                  showLocation: true,
                  showPurchaseHistory: false,
                  reviewCount: 0,
                  averageRating: 0,
                  helpfulVoteCount: 0,
                  expertiseAreas: []
                }}
                content={reply.content}
                createdAt={reply.createdAt?.toISOString() || new Date().toISOString()}
                updatedAt={reply.updatedAt?.toISOString()}
                isEdited={reply.isEdited || false}
                isAuthor={reply.author.id === currentUserId}
                isPinned={reply.isPinned || false}
                isHighlighted={false}
                likes={reply.likes || 0}
                dislikes={reply.dislikes || 0}
                userReaction={reply.userVote || null}
                replies={[]} // Handle nested replies separately to avoid type conflicts
                replyCount={reply.replies?.length || 0}
                attachments={reply.attachments?.map(att => ({
                  id: att.id,
                  type: att.type === 'audio' ? 'document' : att.type as 'image' | 'video' | 'document' | 'link',
                  url: att.url,
                  name: att.name,
                  size: att.size
                }))}
                mentions={reply.mentions?.map((mention, index) => ({
                  id: `mention-${index}`,
                  displayName: mention,
                  position: [0, mention.length] as [number, number]
                }))}
                hashtags={reply.tags}
                showHeader={showAuthorInfo}
                showTimestamp={showTimestamps}
                showActions={true}
                showReplies={showReplies && (reply.replies?.length || 0) > 0}
                variant={maxDepth && 0 > maxDepth ? 'compact' : 'default'}
                size="md"
                depth={0}
                maxDepth={maxDepth || 3}
                interactive={true}
                onLike={() => handleVote(reply.id, 'like')}
                onDislike={() => handleVote(reply.id, 'dislike')}
                onReply={(replyId, content) => {
                  setReplyingTo(replyId);
                  onReplyAdd(replyId, {
                    content,
                    authorName: 'Current User',
                    authorEmail: '',
                    reviewId: reply.reviewId || '',
                    parentId: replyId,
                    isPrivate: false,
                    attachments: [],
                    mentions: [],
                    tags: [],
                    metadata: {
                      wordCount: content.split(/\s+/).filter(Boolean).length,
                      characterCount: content.length,
                      readTime: Math.ceil(content.split(/\s+/).filter(Boolean).length / 200),
                      version: 1
                    },
                    formatting: {
                      isBold: false,
                      isItalic: false,
                      hasLinks: false,
                      hasQuotes: false,
                      hasList: false
                    },
                    status: 'published' as const,
                    createdAt: new Date(),
                    updatedAt: new Date()
                  });
                }}
                onEdit={(replyId, newContent) => {
                  onReplyUpdate({ ...reply, content: newContent });
                  setEditingReply(null);
                }}
                onDelete={() => {
                  if (canDelete) {
                    handleDelete(reply);
                  }
                }}
                onShare={() => showSharing && handleShare(reply)}
                onReport={() => {
                  if (canFlag) {
                    handleFlag(reply);
                  }
                }}
                onUserClick={(user) => {
                  // Handle user profile navigation
                  console.log('User clicked:', user);
                }}
                onAnalyticsEvent={(event, data) => {
                  console.log('Analytics event:', event, data);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>{emptyStateMessage}</p>
          </div>
        )}
      </AnimatePresence>

      {/* Load more */}
      {hasMore && onLoadMore && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Load More Replies
          </Button>
        </div>
      )}

      {/* Pagination info */}
      {filteredAndSortedReplies.length > pageSize && (
        <div className="text-center text-sm text-gray-600">
          Showing {Math.min(currentPage * pageSize, filteredAndSortedReplies.length)} of {filteredAndSortedReplies.length} replies
        </div>
      )}
    </div>
  );
};

export default ReplyList;
