/**
 * BlogComments Component - Vardhman Mills Frontend
 * 
 * Comprehensive blog comments system with nested replies,
 * moderation, reactions, and real-time updates.
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  MessageCircle,
  Heart,
  Reply,
  Flag,
  ChevronDown,
  ChevronUp,
  Send,
  Edit,
  Trash2,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { TextArea } from '@/components/ui/TextArea';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';

// Types
export interface CommentUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: 'admin' | 'moderator' | 'user';
  isVerified?: boolean;
}

export interface BlogComment {
  id: string;
  content: string;
  author: CommentUser;
  createdAt: string;
  updatedAt: string;
  likes: number;
  isLiked?: boolean;
  parentId?: string;
  replies?: BlogComment[];
  isEdited?: boolean;
  isApproved: boolean;
  isReported?: boolean;
  reportCount?: number;
  postId: string;
}

export interface BlogCommentsProps {
  postId: string;
  comments: BlogComment[];
  currentUser?: CommentUser | null;
  loading?: boolean;
  canModerate?: boolean;
  requireApproval?: boolean;
  allowAnonymous?: boolean;
  maxDepth?: number;
  className?: string;
  onCommentSubmit?: (content: string, parentId?: string) => Promise<void>;
  onCommentEdit?: (commentId: string, content: string) => Promise<void>;
  onCommentDelete?: (commentId: string) => Promise<void>;
  onCommentLike?: (commentId: string) => Promise<void>;
  onCommentReport?: (commentId: string, reason: string) => Promise<void>;
  onCommentApprove?: (commentId: string) => Promise<void>;
  onCommentReject?: (commentId: string) => Promise<void>;
}

/**
 * BlogComments Component
 * 
 * Feature-rich comments system with threaded replies,
 * moderation tools, and real-time interactions.
 */
export const BlogComments: React.FC<BlogCommentsProps> = ({
  postId: _postId, // eslint-disable-line @typescript-eslint/no-unused-vars
  comments = [],
  currentUser,
  loading = false,
  canModerate = false,
  requireApproval = true,
  allowAnonymous = false,
  maxDepth = 3,
  className = '',
  onCommentSubmit,
  onCommentEdit,
  onCommentDelete,
  onCommentLike,
  onCommentReport,
  onCommentApprove,
  onCommentReject
}) => {
  const [newComment, setNewComment] = useState('');
  const [replyToComment, setReplyToComment] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [reportModal, setReportModal] = useState<{ isOpen: boolean; commentId: string | null }>({
    isOpen: false,
    commentId: null
  });
  const [reportReason, setReportReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');

  /**
   * Get nested comments structure
   */
  const getNestedComments = React.useCallback((comments: BlogComment[], parentId: string | null = null, depth = 0): BlogComment[] => {
    if (depth >= maxDepth) return [];
    
    return comments
      .filter(comment => comment.parentId === parentId)
      .map(comment => ({
        ...comment,
        replies: getNestedComments(comments, comment.id, depth + 1)
      }));
  }, [maxDepth]);

  /**
   * Sort comments
   */
  const sortedComments = React.useMemo(() => {
    const topLevelComments = getNestedComments(comments);
    
    return topLevelComments.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'popular':
          return b.likes - a.likes;
        default: // newest
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [comments, sortBy, getNestedComments]);

  /**
   * Handle comment submission
   */
  const handleCommentSubmit = async (content: string, parentId?: string) => {
    if (!content.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    if (!currentUser && !allowAnonymous) {
      toast.error('Please sign in to comment');
      return;
    }

    setSubmitting(true);
    try {
      await onCommentSubmit?.(content, parentId);
      setNewComment('');
      setReplyToComment(null);
      toast.success(requireApproval ? 'Comment submitted for approval' : 'Comment posted successfully');
    } catch {
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle comment edit
   */
  const handleCommentEdit = async (commentId: string, content: string) => {
    if (!content.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      await onCommentEdit?.(commentId, content);
      setEditingComment(null);
      setEditContent('');
      toast.success('Comment updated successfully');
    } catch {
      toast.error('Failed to update comment');
    }
  };

  /**
   * Handle comment deletion
   */
  const handleCommentDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await onCommentDelete?.(commentId);
      toast.success('Comment deleted successfully');
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  /**
   * Handle comment like
   */
  const handleCommentLike = async (commentId: string) => {
    if (!currentUser) {
      toast.error('Please sign in to like comments');
      return;
    }

    try {
      await onCommentLike?.(commentId);
    } catch {
      toast.error('Failed to update like');
    }
  };

  /**
   * Handle comment report
   */
  const handleCommentReport = async () => {
    if (!reportReason.trim()) {
      toast.error('Please provide a reason for reporting');
      return;
    }

    if (!reportModal.commentId) return;

    try {
      await onCommentReport?.(reportModal.commentId, reportReason);
      setReportModal({ isOpen: false, commentId: null });
      setReportReason('');
      toast.success('Comment reported successfully');
    } catch {
      toast.error('Failed to report comment');
    }
  };

  /**
   * Toggle comment expansion
   */
  const toggleCommentExpansion = (commentId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  /**
   * Start editing comment
   */
  const startEditingComment = (comment: BlogComment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  /**
   * Cancel editing
   */
  const cancelEditing = () => {
    setEditingComment(null);
    setEditContent('');
  };

  /**
   * Render comment form
   */
  const renderCommentForm = (parentId?: string) => {
    const isReply = !!parentId;
    const content = isReply ? (replyToComment === parentId ? newComment : '') : newComment;
    
    return (
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Avatar
              src={currentUser?.avatar}
              alt={currentUser?.name || 'Anonymous'}
              size="sm"
              fallback={currentUser?.name?.charAt(0) || 'A'}
            />
            <div className="flex-1">
              <TextArea
                placeholder={isReply ? 'Write a reply...' : 'Write a comment...'}
                value={content}
                onChange={(e) => {
                  if (isReply) {
                    setReplyToComment(parentId);
                  }
                  setNewComment(e.target.value);
                }}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {requireApproval && 'Comments are moderated and may take time to appear.'}
            </div>
            <div className="flex space-x-2">
              {isReply && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setReplyToComment(null);
                    setNewComment('');
                  }}
                >
                  Cancel
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => handleCommentSubmit(content, parentId)}
                disabled={!content.trim() || submitting}
                loading={submitting}
              >
                <Send className="w-4 h-4 mr-2" />
                {isReply ? 'Reply' : 'Post Comment'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  /**
   * Render comment item
   */
  const renderComment = (comment: BlogComment, depth = 0) => {
    const isExpanded = expandedComments.has(comment.id);
    const canEdit = currentUser?.id === comment.author.id || canModerate;
    const canDelete = currentUser?.id === comment.author.id || canModerate;
    const isEditing = editingComment === comment.id;

    return (
      <motion.div
        key={comment.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${depth > 0 ? 'ml-8' : ''}`}
      >
        <Card className={`p-4 ${!comment.isApproved ? 'bg-yellow-50 border-yellow-200' : ''}`}>
          <div className="space-y-3">
            {/* Comment Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Avatar
                  src={comment.author.avatar}
                  alt={comment.author.name}
                  size="sm"
                  fallback={comment.author.name.charAt(0)}
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{comment.author.name}</span>
                    {comment.author.role === 'admin' && (
                      <Badge variant="default" className="text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                    {comment.author.role === 'moderator' && (
                      <Badge variant="secondary" className="text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        Moderator
                      </Badge>
                    )}
                    {comment.author.isVerified && (
                      <Badge variant="outline" className="text-xs text-blue-600">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 space-x-2">
                    <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                    {comment.isEdited && <span>• edited</span>}
                  </div>
                </div>
              </div>

              {/* Comment Actions */}
              <div className="flex items-center space-x-2">
                {!comment.isApproved && canModerate && (
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCommentApprove?.(comment.id)}
                      className="text-green-600 hover:bg-green-50"
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCommentReject?.(comment.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      Reject
                    </Button>
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setReportModal({ isOpen: true, commentId: comment.id });
                  }}
                  className="text-gray-500"
                >
                  <Flag className="w-4 h-4" />
                </Button>

                {(canEdit || canDelete) && (
                  <div className="flex space-x-1">
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditingComment(comment)}
                        className="text-gray-500"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCommentDelete(comment.id)}
                        className="text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Comment Content */}
            {isEditing ? (
              <div className="space-y-3">
                <TextArea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleCommentEdit(comment.id, editContent)}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={cancelEditing}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-gray-700 whitespace-pre-wrap">{comment.content}</div>
            )}

            {/* Comment Stats and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCommentLike(comment.id)}
                  className={`flex items-center space-x-1 ${comment.isLiked ? 'text-red-500' : 'text-gray-500'}`}
                >
                  <Heart className={`w-4 h-4 ${comment.isLiked ? 'fill-current' : ''}`} />
                  <span>{comment.likes}</span>
                </Button>

                {depth < maxDepth - 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyToComment(replyToComment === comment.id ? null : comment.id)}
                    className="flex items-center space-x-1 text-gray-500"
                  >
                    <Reply className="w-4 h-4" />
                    <span>Reply</span>
                  </Button>
                )}

                {comment.replies && comment.replies.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleCommentExpansion(comment.id)}
                    className="flex items-center space-x-1 text-gray-500"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    <span>{comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}</span>
                  </Button>
                )}
              </div>

              {comment.reportCount && comment.reportCount > 0 && canModerate && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {comment.reportCount} reports
                </Badge>
              )}
            </div>

            {/* Reply Form */}
            {replyToComment === comment.id && (
              <div className="pt-4 border-t border-gray-100">
                {renderCommentForm(comment.id)}
              </div>
            )}
          </div>
        </Card>

        {/* Nested Replies */}
        <AnimatePresence>
          {isExpanded && comment.replies && comment.replies.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-4"
            >
              {comment.replies.map(reply => renderComment(reply, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  /**
   * Render loading skeleton
   */
  const renderSkeleton = () => {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start space-x-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const approvedComments = sortedComments.filter(comment => comment.isApproved || canModerate);
  const pendingComments = canModerate ? sortedComments.filter(comment => !comment.isApproved) : [];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Comments Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          Comments ({approvedComments.length})
        </h3>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <Button
            variant={sortBy === 'newest' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSortBy('newest')}
          >
            Newest
          </Button>
          <Button
            variant={sortBy === 'oldest' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSortBy('oldest')}
          >
            Oldest
          </Button>
          <Button
            variant={sortBy === 'popular' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSortBy('popular')}
          >
            Popular
          </Button>
        </div>
      </div>

      {/* Pending Comments (Moderators Only) */}
      {canModerate && pendingComments.length > 0 && (
        <div className="space-y-4">
          <Alert variant="info">
            <AlertTriangle className="w-4 h-4" />
            <div>
              <h4 className="font-medium">Pending Approval ({pendingComments.length})</h4>
              <p className="text-sm">The following comments are awaiting moderation.</p>
            </div>
          </Alert>
          <div className="space-y-4">
            {pendingComments.map(comment => renderComment(comment))}
          </div>
        </div>
      )}

      {/* Comment Form */}
      {(currentUser || allowAnonymous) && renderCommentForm()}

      {/* Comments List */}
      {loading ? (
        renderSkeleton()
      ) : approvedComments.length === 0 ? (
        <Card className="p-8 text-center">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
          <p className="text-gray-500">Be the first to share your thoughts!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {approvedComments.map(comment => renderComment(comment))}
        </div>
      )}

      {/* Report Modal */}
      <Modal
        open={reportModal.isOpen}
        onClose={() => setReportModal({ isOpen: false, commentId: null })}
        title="Report Comment"
      >
        <div className="space-y-4">
          <p className="text-gray-600">Why are you reporting this comment?</p>
          <TextArea
            placeholder="Please provide details about why this comment should be reviewed..."
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            rows={4}
          />
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setReportModal({ isOpen: false, commentId: null })}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCommentReport}
              disabled={!reportReason.trim()}
              className="flex-1"
            >
              Submit Report
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BlogComments;
