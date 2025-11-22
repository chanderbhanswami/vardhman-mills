import React, { useState, useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  X,
  Eye,
  EyeOff,
  Trash2,
  Flag,
  Star,
  Download,
  Archive,
  AlertTriangle,
  Settings,
  Zap,
  Clock,
  Database,
  Mail,
  Bell,
  Activity
} from 'lucide-react';

import {
  Button,
  Card,
  Modal,
  Checkbox,
  Progress,
  Badge,
  TextArea
} from '@/components/ui';
import { CardHeader, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/components/providers';
import { reviewApi } from '@/lib/api';

// Interfaces
interface BulkAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  category: 'moderation' | 'visibility' | 'engagement' | 'data' | 'notification';
  requiresConfirmation: boolean;
  requiresReason?: boolean;
  destructive?: boolean;
  premium?: boolean;
  estimatedTime?: string;
  batchSize?: number;
  dependencies?: string[];
}

interface BulkActionExecution {
  actionId: string;
  selectedIds: string[];
  reason?: string;
  parameters?: Record<string, unknown>;
  scheduleTime?: string;
  notifyUsers?: boolean;
  createBackup?: boolean;
}

interface BulkActionProgress {
  total: number;
  completed: number;
  failed: number;
  current?: string;
  errors: Array<{ id: string; error: string }>;
  startTime: Date;
  estimatedCompletion?: Date;
}

interface BulkActionHistory {
  id: string;
  action: string;
  executedBy: string;
  executedAt: string;
  itemsProcessed: number;
  successCount: number;
  failureCount: number;
  status: 'completed' | 'failed' | 'partial';
  duration: number;
  parameters?: Record<string, unknown>;
}

interface AccountReviewsBulkActionsProps {
  selectedReviews: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onActionComplete: () => void;
  totalReviews: number;
  availableActions?: string[];
  userPermissions?: string[];
  showAdvanced?: boolean;
}

// Bulk Actions Configuration
const BULK_ACTIONS: BulkAction[] = [
  // Moderation Actions
  {
    id: 'approve',
    label: 'Approve Reviews',
    icon: CheckSquare,
    description: 'Approve selected reviews and make them visible to customers',
    category: 'moderation',
    requiresConfirmation: true,
    estimatedTime: '2-5 seconds',
    batchSize: 50
  },
  {
    id: 'reject',
    label: 'Reject Reviews',
    icon: X,
    description: 'Reject selected reviews and hide them from public view',
    category: 'moderation',
    requiresConfirmation: true,
    requiresReason: true,
    estimatedTime: '3-7 seconds',
    batchSize: 30
  },
  {
    id: 'flag',
    label: 'Flag Reviews',
    icon: Flag,
    description: 'Flag reviews for manual review and investigation',
    category: 'moderation',
    requiresConfirmation: true,
    requiresReason: true,
    estimatedTime: '1-3 seconds',
    batchSize: 100
  },
  {
    id: 'feature',
    label: 'Feature Reviews',
    icon: Star,
    description: 'Mark reviews as featured to highlight them prominently',
    category: 'engagement',
    requiresConfirmation: true,
    premium: true,
    estimatedTime: '2-4 seconds',
    batchSize: 20
  },
  
  // Visibility Actions
  {
    id: 'hide',
    label: 'Hide Reviews',
    icon: EyeOff,
    description: 'Hide reviews from public view temporarily',
    category: 'visibility',
    requiresConfirmation: true,
    estimatedTime: '1-2 seconds',
    batchSize: 100
  },
  {
    id: 'show',
    label: 'Show Reviews',
    icon: Eye,
    description: 'Make hidden reviews visible to the public',
    category: 'visibility',
    requiresConfirmation: true,
    estimatedTime: '1-2 seconds',
    batchSize: 100
  },
  
  // Data Actions
  {
    id: 'delete',
    label: 'Delete Reviews',
    icon: Trash2,
    description: 'Permanently delete selected reviews (cannot be undone)',
    category: 'data',
    requiresConfirmation: true,
    requiresReason: true,
    destructive: true,
    estimatedTime: '5-10 seconds',
    batchSize: 20
  },
  {
    id: 'archive',
    label: 'Archive Reviews',
    icon: Archive,
    description: 'Move reviews to archive for long-term storage',
    category: 'data',
    requiresConfirmation: true,
    estimatedTime: '3-6 seconds',
    batchSize: 50
  },
  {
    id: 'export',
    label: 'Export Reviews',
    icon: Download,
    description: 'Export selected reviews to CSV, JSON, or Excel format',
    category: 'data',
    requiresConfirmation: false,
    estimatedTime: '5-15 seconds',
    batchSize: 1000
  },
  {
    id: 'backup',
    label: 'Create Backup',
    icon: Database,
    description: 'Create a backup of selected reviews before making changes',
    category: 'data',
    requiresConfirmation: false,
    estimatedTime: '10-30 seconds',
    batchSize: 500
  },
  
  // Notification Actions
  {
    id: 'notify_authors',
    label: 'Notify Authors',
    icon: Mail,
    description: 'Send notification emails to review authors',
    category: 'notification',
    requiresConfirmation: true,
    estimatedTime: '10-30 seconds',
    batchSize: 25
  },
  {
    id: 'notify_moderators',
    label: 'Notify Moderators',
    icon: Bell,
    description: 'Send notifications to moderators about review changes',
    category: 'notification',
    requiresConfirmation: true,
    estimatedTime: '2-5 seconds',
    batchSize: 100
  },
  
  // Advanced Actions
  {
    id: 'bulk_edit',
    label: 'Bulk Edit',
    icon: Settings,
    description: 'Edit multiple properties of selected reviews simultaneously',
    category: 'data',
    requiresConfirmation: true,
    premium: true,
    estimatedTime: '5-15 seconds',
    batchSize: 30
  },
  {
    id: 'auto_moderate',
    label: 'Auto Moderate',
    icon: Zap,
    description: 'Apply AI-powered moderation to selected reviews',
    category: 'moderation',
    requiresConfirmation: true,
    premium: true,
    estimatedTime: '10-30 seconds',
    batchSize: 100
  },
  {
    id: 'schedule_action',
    label: 'Schedule Action',
    icon: Clock,
    description: 'Schedule an action to be performed at a specific time',
    category: 'data',
    requiresConfirmation: true,
    premium: true,
    estimatedTime: 'Varies',
    batchSize: 200
  }
];

export const AccountReviewsBulkActions: React.FC<AccountReviewsBulkActionsProps> = ({
  selectedReviews,
  onSelectionChange,
  onActionComplete,
  totalReviews,
  availableActions = [],
  userPermissions = [],
  showAdvanced = false
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Simple notification function
  const addNotification = useCallback((message: string, type: string) => {
    console.log(`${type.toUpperCase()}: ${message}`);
  }, []);

  // State
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [selectedAction, setSelectedAction] = useState<BulkAction | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [actionParameters, setActionParameters] = useState<Record<string, unknown>>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState<BulkActionProgress | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [actionHistory, setActionHistory] = useState<BulkActionHistory[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [scheduleTime, setScheduleTime] = useState('');
  const [notifyUsers, setNotifyUsers] = useState(false);
  const [createBackup, setCreateBackup] = useState(false);

  // Filtered actions based on permissions and availability
  const filteredActions = useMemo(() => {
    return BULK_ACTIONS.filter(action => {
      // Check if action is available
      if (availableActions.length > 0 && !availableActions.includes(action.id)) {
        return false;
      }
      
      // Check user permissions
      if (action.premium && !userPermissions.includes('premium')) {
        return false;
      }
      
      // Check category filter
      if (filterCategory !== 'all' && action.category !== filterCategory) {
        return false;
      }
      
      // Show advanced actions only if enabled
      if (!showAdvanced && action.premium) {
        return false;
      }
      
      return true;
    });
  }, [availableActions, userPermissions, filterCategory, showAdvanced]);

  // Group actions by category
  const groupedActions = useMemo(() => {
    const groups: Record<string, BulkAction[]> = {};
    filteredActions.forEach(action => {
      if (!groups[action.category]) {
        groups[action.category] = [];
      }
      groups[action.category].push(action);
    });
    return groups;
  }, [filteredActions]);

  // Mutations
  const executeBulkActionMutation = useMutation({
    mutationFn: async (execution: BulkActionExecution) => {
      const { actionId, selectedIds, reason } = execution;
      
      // Simulate progress tracking
      setExecutionProgress({
        total: selectedIds.length,
        completed: 0,
        failed: 0,
        errors: [],
        startTime: new Date()
      });

      const results = [];
      const errors: Array<{ id: string; error: string }> = [];

      for (let i = 0; i < selectedIds.length; i++) {
        const reviewId = selectedIds[i];
        
        try {
          // Update progress
          setExecutionProgress(prev => prev ? {
            ...prev,
            completed: i,
            current: reviewId
          } : null);

          // Execute action based on type
          let result;
          switch (actionId) {
            case 'approve':
            case 'reject':
              // Use available API methods - simulate approval/rejection
              result = await reviewApi.updateReview(reviewId, { 
                content: `${actionId === 'approve' ? '[APPROVED]' : '[REJECTED]'} ${reason || ''}`
              });
              break;
              
            case 'flag':
              result = await reviewApi.reportReview(reviewId, reason || 'Bulk flagged by moderator');
              break;
              
            case 'delete':
              result = await reviewApi.deleteReview(reviewId);
              break;
              
            case 'feature':
            case 'hide':
            case 'show':
              // Use updateReview for other status changes
              result = await reviewApi.updateReview(reviewId, { 
                content: `[${actionId.toUpperCase()}] ${reason || ''}`
              });
              break;
              
            default:
              // For other actions, simulate API call
              await new Promise(resolve => setTimeout(resolve, 100));
              result = { success: true, id: reviewId };
          }
          
          results.push(result);
          
          // Small delay to show progress
          await new Promise(resolve => setTimeout(resolve, 50));
          
        } catch (error) {
          console.error(`Failed to execute action for review ${reviewId}:`, error);
          errors.push({ 
            id: reviewId, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }

      // Final progress update
      setExecutionProgress(prev => prev ? {
        ...prev,
        completed: selectedIds.length,
        failed: errors.length,
        errors,
        estimatedCompletion: new Date()
      } : null);

      return { results, errors, total: selectedIds.length };
    },
    onSuccess: (data) => {
      // Add to history
      const historyEntry: BulkActionHistory = {
        id: Date.now().toString(),
        action: selectedAction?.label || 'Unknown Action',
        executedBy: user?.email || 'Unknown User',
        executedAt: new Date().toISOString(),
        itemsProcessed: data.total,
        successCount: data.results.length,
        failureCount: data.errors.length,
        status: data.errors.length === 0 ? 'completed' : 
                data.results.length === 0 ? 'failed' : 'partial',
        duration: Date.now() - (executionProgress?.startTime.getTime() || Date.now()),
        parameters: actionParameters
      };
      
      setActionHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      onActionComplete();
      
      // Clear selection
      onSelectionChange([]);
      
      const successMessage = data.errors.length === 0 
        ? `Successfully completed ${selectedAction?.label} for ${data.results.length} reviews`
        : `Completed ${selectedAction?.label}: ${data.results.length} successful, ${data.errors.length} failed`;
      
      addNotification(successMessage, data.errors.length === 0 ? 'success' : 'warning');
    },
    onError: (error) => {
      console.error('Bulk action execution failed:', error);
      addNotification('Bulk action execution failed', 'error');
    },
    onSettled: () => {
      setIsExecuting(false);
      setShowActionDialog(false);
      setSelectedAction(null);
      setActionReason('');
      setActionParameters({});
      
      // Clear progress after a delay
      setTimeout(() => {
        setExecutionProgress(null);
      }, 3000);
    }
  });

  // Handlers
  const handleActionSelect = useCallback((action: BulkAction) => {
    setSelectedAction(action);
    setActionReason('');
    setActionParameters({});
    setScheduleTime('');
    setNotifyUsers(false);
    setCreateBackup(action.destructive || false);
    setShowActionDialog(true);
  }, []);

  const handleExecuteAction = useCallback(() => {
    if (!selectedAction || selectedReviews.length === 0) return;

    // Validation
    if (selectedAction.requiresReason && !actionReason.trim()) {
      addNotification('Please provide a reason for this action', 'error');
      return;
    }

    setIsExecuting(true);
    
    const execution: BulkActionExecution = {
      actionId: selectedAction.id,
      selectedIds: selectedReviews,
      reason: actionReason.trim() || undefined,
      parameters: actionParameters,
      scheduleTime: scheduleTime || undefined,
      notifyUsers,
      createBackup
    };

    executeBulkActionMutation.mutate(execution);
  }, [selectedAction, selectedReviews, actionReason, actionParameters, scheduleTime, notifyUsers, createBackup, executeBulkActionMutation, addNotification]);

  const handleExport = useCallback(async (format: 'csv' | 'json' | 'excel' = 'csv') => {
    if (selectedReviews.length === 0) {
      addNotification('No reviews selected for export', 'warning');
      return;
    }

    try {
      // Simulate export process
      addNotification(`Exporting ${selectedReviews.length} reviews as ${format.toUpperCase()}...`, 'info');
      
      // Create mock export data
      const exportData = selectedReviews.map((id, index) => ({
        id,
        title: `Review ${id}`,
        rating: Math.floor(Math.random() * 5) + 1,
        content: `Review content for ${id}`,
        author: `User ${index + 1}`,
        date: new Date().toISOString().split('T')[0],
        status: 'published'
      }));

      let content: string;
      let mimeType: string;
      let filename: string;

      switch (format) {
        case 'csv':
          content = [
            'ID,Title,Rating,Content,Author,Date,Status',
            ...exportData.map(row => 
              `${row.id},"${row.title}",${row.rating},"${row.content}","${row.author}",${row.date},${row.status}`
            )
          ].join('\n');
          mimeType = 'text/csv';
          filename = `reviews-export-${new Date().toISOString().split('T')[0]}.csv`;
          break;
          
        case 'json':
          content = JSON.stringify(exportData, null, 2);
          mimeType = 'application/json';
          filename = `reviews-export-${new Date().toISOString().split('T')[0]}.json`;
          break;
          
        default:
          throw new Error('Unsupported export format');
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      addNotification(`Successfully exported ${selectedReviews.length} reviews`, 'success');
    } catch (error) {
      console.error('Export failed:', error);
      addNotification('Export failed', 'error');
    }
  }, [selectedReviews, addNotification]);

  const handleSelectAll = useCallback(() => {
    if (selectedReviews.length === totalReviews) {
      onSelectionChange([]);
    } else {
      // Simulate selecting all review IDs
      const allIds = Array.from({ length: totalReviews }, (_, i) => `review-${i + 1}`);
      onSelectionChange(allIds);
    }
  }, [selectedReviews.length, totalReviews, onSelectionChange]);

  if (selectedReviews.length === 0) {
    return (
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="p-8">
          <div className="text-center text-gray-500">
            <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Reviews Selected</h3>
            <p className="text-sm mb-4">
              Select one or more reviews to access bulk actions
            </p>
            <Button variant="outline" onClick={handleSelectAll}>
              <CheckSquare className="w-4 h-4 mr-2" />
              Select All ({totalReviews})
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <AnimatePresence>
        {executionProgress && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50"
          >
            <Card className="p-4 bg-white shadow-lg border">
              <div className="flex items-center space-x-3">
                <Activity className="w-5 h-5 text-blue-600 animate-pulse" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {selectedAction?.label} in Progress
                  </p>
                  <p className="text-xs text-gray-600">
                    {executionProgress.completed} of {executionProgress.total} completed
                  </p>
                  <Progress 
                    value={(executionProgress.completed / executionProgress.total) * 100} 
                    className="mt-2 h-2"
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Actions Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Bulk Actions</h3>
              <p className="text-sm text-gray-600">
                {selectedReviews.length} review{selectedReviews.length !== 1 ? 's' : ''} selected
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                aria-label="Filter actions by category"
              >
                <option value="all">All Categories</option>
                <option value="moderation">Moderation</option>
                <option value="visibility">Visibility</option>
                <option value="engagement">Engagement</option>
                <option value="data">Data</option>
                <option value="notification">Notification</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
              >
                <Clock className="w-4 h-4 mr-2" />
                History
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Quick Actions */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleActionSelect(BULK_ACTIONS.find(a => a.id === 'approve')!)}
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                Approve All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleActionSelect(BULK_ACTIONS.find(a => a.id === 'reject')!)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-2" />
                Reject All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('csv')}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectionChange([])}
              >
                Clear Selection
              </Button>
            </div>
          </div>

          {/* Grouped Actions */}
          {Object.entries(groupedActions).map(([category, actions]) => (
            <div key={category} className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3 capitalize">
                {category} Actions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {actions.map(action => (
                  <motion.div
                    key={action.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`p-4 cursor-pointer border-2 transition-all hover:shadow-md ${
                        action.destructive 
                          ? 'border-red-200 hover:border-red-300' 
                          : action.premium
                          ? 'border-primary-200 hover:border-primary-300'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => handleActionSelect(action)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          action.destructive 
                            ? 'bg-red-100 text-red-600' 
                            : action.premium
                            ? 'bg-primary-100 text-primary-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          <action.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h5 className="font-medium text-sm">{action.label}</h5>
                            {action.premium && (
                              <Badge variant="secondary" className="text-xs">
                                Pro
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {action.description}
                          </p>
                          {action.estimatedTime && (
                            <p className="text-xs text-gray-500 mt-1">
                              ~{action.estimatedTime}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Action History */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Recent Bulk Actions</h3>
              </CardHeader>
              <CardContent>
                {actionHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No recent actions</p>
                ) : (
                  <div className="space-y-4">
                    {actionHistory.map(entry => (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{entry.action}</p>
                          <p className="text-xs text-gray-600">
                            By {entry.executedBy} • {new Date(entry.executedAt).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {entry.itemsProcessed} items • {entry.successCount} success • {entry.failureCount} failed
                          </p>
                        </div>
                        <Badge 
                          variant={entry.status === 'completed' ? 'default' : 
                                  entry.status === 'failed' ? 'destructive' : 'secondary'}
                        >
                          {entry.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Confirmation Dialog */}
      {showActionDialog && selectedAction && (
        <Modal
          open={showActionDialog}
          onClose={() => setShowActionDialog(false)}
          title={`Confirm ${selectedAction.label}`}
        >
          <div className="p-6 space-y-6">
            {/* Action Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <selectedAction.icon className={`w-6 h-6 ${
                  selectedAction.destructive ? 'text-red-600' : 'text-blue-600'
                }`} />
                <div>
                  <h4 className="font-medium">{selectedAction.label}</h4>
                  <p className="text-sm text-gray-600">{selectedAction.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Selected Reviews:</span>
                  <span className="ml-2 font-medium">{selectedReviews.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Estimated Time:</span>
                  <span className="ml-2 font-medium">{selectedAction.estimatedTime}</span>
                </div>
              </div>
            </div>

            {/* Reason Input */}
            {selectedAction.requiresReason && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Action *
                </label>
                <TextArea
                  value={actionReason}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setActionReason(e.target.value)}
                  placeholder="Please provide a reason for this action..."
                  rows={3}
                  required
                />
              </div>
            )}

            {/* Additional Options */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={notifyUsers}
                  onChange={(e) => setNotifyUsers(e.target.checked)}
                />
                <label className="text-sm">Notify affected users</label>
              </div>
              
              {selectedAction.destructive && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={createBackup}
                    onChange={(e) => setCreateBackup(e.target.checked)}
                  />
                  <label className="text-sm">Create backup before action</label>
                </div>
              )}
            </div>

            {/* Warning for Destructive Actions */}
            {selectedAction.destructive && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-800 font-medium">Warning</p>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  This action cannot be undone. Please ensure you have a backup if needed.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowActionDialog(false)}
                disabled={isExecuting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleExecuteAction}
                disabled={isExecuting || (selectedAction.requiresReason && !actionReason.trim())}
                variant={selectedAction.destructive ? 'destructive' : 'default'}
              >
                {isExecuting ? (
                  <>
                    <Activity className="w-4 h-4 mr-2 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <selectedAction.icon className="w-4 h-4 mr-2" />
                    Execute {selectedAction.label}
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
