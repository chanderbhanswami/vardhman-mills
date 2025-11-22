'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { 
  Search, 
  SortAsc, 
  SortDesc, 
  RefreshCw,
  Download,
  Eye,
  EyeOff,
  Trash2,
  CheckSquare,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock
} from 'lucide-react';

import { 
  Button,
  Card,
  Input,
  Checkbox,
  Modal,
  Pagination,
  Skeleton
} from '@/components/ui';
import { CardHeader, CardContent } from '@/components/ui/Card';

import { useAuth } from '@/components/providers';
import { format } from 'date-fns';
import { reviewsRepliesApi } from '@/lib/api';
import { AccountReplyItem } from './AccountReplyItem';

// Types
interface FilterOptions {
  status: string;
  dateFrom: string;
  dateTo: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  search: string;
  showNested: boolean;
}

interface ApiReply {
  id: string;
  comment?: string;
  content?: string;
  userId: string;
  user?: {
    name?: string;
    avatar?: string;
    location?: string;
    role?: string;
  };
  verification?: {
    isVerifiedPurchase?: boolean;
  };
  moderation?: {
    status?: string;
  };
  createdAt: string;
  updatedAt?: string;
  review?: {
    id?: string;
  };
  reviewId?: string;
  engagement?: {
    likes?: number;
    dislikes?: number;
  };
  likes?: number;
  dislikes?: number;
  metadata?: {
    isEdited?: boolean;
    ipAddress?: string;
    userAgent?: string;
    source?: string;
    deviceType?: string;
  };
  parentId?: string;
}

interface BulkActionType {
  action: 'approve' | 'reject' | 'flag' | 'delete';
  selectedIds: string[];
}

interface AccountReplyListProps {
  userId?: string;
  reviewId?: string;
  onSelectionChange?: (selectedIds: string[]) => void;
}

// Custom hook for debouncing
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const AccountReplyList: React.FC<AccountReplyListProps> = ({
  userId,
  reviewId,
  onSelectionChange
}) => {
  const { user } = useAuth();

  // State
  const [selectedReplies, setSelectedReplies] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    search: '',
    showNested: false
  });
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [bulkActionDialog, setBulkActionDialog] = useState<BulkActionType | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search
  const debouncedSearch = useDebounce(filters.search, 300);

  // Build query parameters
  const queryParams = useMemo(() => ({
    page: currentPage,
    limit: itemsPerPage,
    userId: userId || user?.id,
    reviewId,
    status: filters.status !== 'all' ? filters.status as 'pending' | 'approved' | 'rejected' | 'flagged' | 'spam' : undefined,
    search: debouncedSearch || undefined,
    sortBy: filters.sortBy as 'createdAt' | 'likes' | 'helpful',
    sortOrder: filters.sortOrder,
    includeNested: filters.showNested
  }), [currentPage, itemsPerPage, userId, user?.id, reviewId, filters.status, debouncedSearch, filters.sortBy, filters.sortOrder, filters.showNested]);

  // Fetch replies
  const { 
    data: repliesResponse, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['replies', queryParams],
    queryFn: () => reviewsRepliesApi.getAll(queryParams),
    enabled: !!(userId || user?.id)
  });

  // Transform function for replies
  const transformReply = useCallback((reply: ApiReply) => ({
    id: reply.id,
    content: reply.comment || reply.content || '',
    authorId: reply.userId,
    authorName: reply.user?.name || 'Unknown User',
    authorAvatar: reply.user?.avatar,
    authorLocation: reply.user?.location || '',
    isVerified: reply.verification?.isVerifiedPurchase || false,
    isStoreOwner: reply.user?.role === 'admin' || reply.user?.role === 'store_owner',
    createdAt: reply.createdAt,
    updatedAt: reply.updatedAt || reply.createdAt,
    status: (reply.moderation?.status === 'approved' ? 'published' : 
            reply.moderation?.status === 'rejected' ? 'hidden' :
            reply.moderation?.status === 'flagged' ? 'flagged' :
            'pending') as 'published' | 'hidden' | 'flagged' | 'pending',
    reviewId: reply.review?.id || reply.reviewId || '',
    likes: reply.engagement?.likes || reply.likes || 0,
    dislikes: reply.engagement?.dislikes || reply.dislikes || 0,
    isEdited: reply.metadata?.isEdited || false,
    parentReplyId: reply.parentId || undefined,
    replies: [],
    metadata: {
      ipAddress: reply.metadata?.ipAddress,
      userAgent: reply.metadata?.userAgent,
      deviceType: reply.metadata?.source || reply.metadata?.deviceType
    }
  }), []);

  const transformedReplies = useMemo(() => {
    const replies = repliesResponse?.data || [];
    return replies.map(transformReply);
  }, [repliesResponse?.data, transformReply]);

  // Export functionality
  const handleExport = useCallback(() => {
    if (!transformedReplies.length) return;

    const csvContent = [
      'ID,Content,Author,Status,Created At,Likes,Dislikes',
      ...transformedReplies.map(reply => [
        reply.id,
        `"${reply.content.replace(/"/g, '""')}"`,
        reply.authorName,
        reply.status,
        reply.createdAt,
        reply.likes || 0,
        reply.dislikes || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `replies-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [transformedReplies]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!transformedReplies.length) {
      return {
        total: 0,
        published: 0,
        hidden: 0,
        flagged: 0,
        pending: 0,
        totalLikes: 0,
        totalDislikes: 0
      };
    }

    return {
      total: transformedReplies.length,
      published: transformedReplies.filter(r => r.status === 'published').length,
      hidden: transformedReplies.filter(r => r.status === 'hidden').length,
      flagged: transformedReplies.filter(r => r.status === 'flagged').length,
      pending: transformedReplies.filter(r => r.status === 'pending').length,
      totalLikes: transformedReplies.reduce((sum, r) => sum + (r.likes || 0), 0),
      totalDislikes: transformedReplies.reduce((sum, r) => sum + (r.dislikes || 0), 0),
    };
  }, [transformedReplies]);

  // Pagination
  const totalPages = Math.ceil(statistics.total / itemsPerPage);

  // Handlers
  const handleFilterChange = useCallback((key: keyof FilterOptions, value: string | number | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const handleSearch = useCallback((searchTerm: string) => {
    handleFilterChange('search', searchTerm);
  }, [handleFilterChange]);

  const handleSort = useCallback((sortBy: string) => {
    const newOrder = filters.sortBy === sortBy && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    setFilters(prev => ({ ...prev, sortBy, sortOrder: newOrder }));
  }, [filters.sortBy, filters.sortOrder]);

  const handleSelectReply = useCallback((replyId: string) => {
    setSelectedReplies(prev => {
      const newSelection = prev.includes(replyId)
        ? prev.filter(id => id !== replyId)
        : [...prev, replyId];
      
      onSelectionChange?.(newSelection);
      return newSelection;
    });
  }, [onSelectionChange]);

  const handleSelectAll = useCallback(() => {
    const allIds = transformedReplies.map(r => r.id);
    const newSelection = selectedReplies.length === allIds.length ? [] : allIds;
    setSelectedReplies(newSelection);
    onSelectionChange?.(newSelection);
  }, [transformedReplies, selectedReplies.length, onSelectionChange]);

  const handleBulkAction = useCallback((action: BulkActionType['action']) => {
    if (selectedReplies.length === 0) return;
    
    setBulkActionDialog({ action, selectedIds: selectedReplies });
  }, [selectedReplies]);

  const executeBulkAction = useCallback(async () => {
    if (!bulkActionDialog) return;

    try {
      const { action, selectedIds } = bulkActionDialog;
      
      // Execute bulk action based on type
      await Promise.all(selectedIds.map(async (id) => {
        switch (action) {
          case 'approve':
            return reviewsRepliesApi.approve(id);
          case 'reject':
            return reviewsRepliesApi.reject(id, 'Bulk action');
          case 'flag':
            return reviewsRepliesApi.flag(id, { 
              type: 'inappropriate', 
              reason: 'Bulk action', 
              severity: 'medium' 
            });
          case 'delete':
            return reviewsRepliesApi.delete(id);
        }
      }));

      // Refresh data and clear selection
      await refetch();
      setSelectedReplies([]);
      setBulkActionDialog(null);
      
      // Show success message
      console.log(`Bulk ${action} completed successfully`);
    } catch (error) {
      console.error(`Bulk ${bulkActionDialog.action} failed:`, error);
    }
  }, [bulkActionDialog, refetch]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Replies</h3>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{statistics.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-green-600">{statistics.published}</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hidden</p>
                <p className="text-2xl font-bold text-gray-600">{statistics.hidden}</p>
              </div>
              <EyeOff className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Flagged</p>
                <p className="text-2xl font-bold text-red-600">{statistics.flagged}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{statistics.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Likes</p>
                <p className="text-2xl font-bold text-green-600">{statistics.totalLikes}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dislikes</p>
                <p className="text-2xl font-bold text-red-600">{statistics.totalDislikes}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4">
            {/* Header with actions */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Account Replies</h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Search className="h-4 w-4 mr-2" />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search replies..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <AnimatePresence>
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select 
                      value={filters.status} 
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      aria-label="Filter by status"
                    >
                      <option value="all">All Status</option>
                      <option value="approved">Published</option>
                      <option value="pending">Pending</option>
                      <option value="flagged">Flagged</option>
                      <option value="rejected">Hidden</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Sort By</label>
                    <select 
                      value={filters.sortBy} 
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      aria-label="Sort by"
                    >
                      <option value="createdAt">Date Created</option>
                      <option value="likes">Likes</option>
                      <option value="helpful">Helpful</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">From Date</label>
                    <Input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    />
                  </div>

                  <div className="flex items-end">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="showNested"
                        checked={filters.showNested}
                        onChange={(e) => handleFilterChange('showNested', e.target.checked)}
                      />
                      <label htmlFor="showNested" className="text-sm font-medium">
                        Include nested replies
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </AnimatePresence>

            {/* Bulk Actions */}
            {selectedReplies.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-sm font-medium text-blue-800">
                  {selectedReplies.length} replies selected
                </span>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('approve')}>
                    <CheckSquare className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('reject')}>
                    <EyeOff className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('flag')}>
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Flag
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* Table Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedReplies.length === transformedReplies.length && transformedReplies.length > 0}
                indeterminate={selectedReplies.length > 0 && selectedReplies.length < transformedReplies.length}
                onChange={(e) => e.target.checked ? handleSelectAll() : setSelectedReplies([])}
              />
              <span className="text-sm font-medium">
                Select All ({transformedReplies.length} replies)
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('createdAt')}
                className="text-xs"
              >
                Date
                {filters.sortBy === 'createdAt' && (
                  filters.sortOrder === 'asc' ? <SortAsc className="h-3 w-3 ml-1" /> : <SortDesc className="h-3 w-3 ml-1" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('likes')}
                className="text-xs"
              >
                Likes
                {filters.sortBy === 'likes' && (
                  filters.sortOrder === 'asc' ? <SortAsc className="h-3 w-3 ml-1" /> : <SortDesc className="h-3 w-3 ml-1" />
                )}
              </Button>
            </div>
          </div>

          {/* Replies List */}
          <div className="space-y-4">
            {transformedReplies.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No replies found</h3>
                <p className="text-gray-600">
                  {filters.search || filters.status !== 'all' 
                    ? 'Try adjusting your filters or search terms.'
                    : 'No replies have been posted yet.'}
                </p>
              </div>
            ) : (
              transformedReplies.map((reply) => (
                <AccountReplyItem
                  key={reply.id}
                  reply={reply}
                  isSelected={selectedReplies.includes(reply.id)}
                  onSelect={handleSelectReply}
                  showReviewContext={true}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Rows per page:</span>
                <select 
                  value={itemsPerPage.toString()} 
                  onChange={(e) => {
                    setItemsPerPage(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-md px-3 py-2 w-20"
                  aria-label="Items per page"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </div>
              
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Action Confirmation Dialog */}
      {bulkActionDialog && (
        <Modal
          open={!!bulkActionDialog}
          onClose={() => setBulkActionDialog(null)}
          title={`Confirm Bulk ${bulkActionDialog?.action}`}
        >
          <div className="p-6">
            <p className="mb-4">
              Are you sure you want to {bulkActionDialog?.action} {bulkActionDialog?.selectedIds.length} selected replies? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setBulkActionDialog(null)}>
                Cancel
              </Button>
              <Button onClick={executeBulkAction}>
                Confirm {bulkActionDialog?.action}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};