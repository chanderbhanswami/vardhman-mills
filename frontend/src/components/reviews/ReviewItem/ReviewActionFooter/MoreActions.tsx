'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MoreHorizontal,
  Flag,
  Bookmark,
  BookmarkCheck,
  Edit,
  Trash2,
  UserX,
  Shield,
  Eye,
  EyeOff,
  Pin,
  PinOff,
  Archive,
  ArchiveRestore,
  AlertTriangle,
  Copy,
  Download,
  History,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { Separator } from '@/components/ui/Separator';
import { useToast } from '../../../../hooks/useToast';
import { cn } from '@/lib/utils';

// Types
export interface ActionItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  color?: string;
  variant?: 'default' | 'destructive' | 'warning' | 'success';
  requireConfirmation?: boolean;
  confirmationTitle?: string;
  confirmationMessage?: string;
  permission?: string;
  disabled?: boolean;
  badge?: string;
  onClick: () => void | Promise<void>;
}

export interface MoreActionsProps {
  reviewId: string;
  userId?: string;
  authorId?: string;
  
  // Review state
  isBookmarked?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  isHidden?: boolean;
  isModerator?: boolean;
  isAdmin?: boolean;
  isOwner?: boolean;
  
  // Appearance
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'outline' | 'secondary';
  className?: string;
  dropdownClassName?: string;
  
  // Behavior
  disabled?: boolean;
  showLabels?: boolean;
  showBadges?: boolean;
  enableAnimations?: boolean;
  closeOnAction?: boolean;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  
  // Actions configuration
  actions?: ActionItem[];
  enabledActions?: string[];
  disabledActions?: string[];
  customActions?: ActionItem[];
  showDefaultActions?: boolean;
  groupActions?: boolean;
  
  // Callbacks
  onBookmark?: (reviewId: string, bookmarked: boolean) => Promise<boolean>;
  onPin?: (reviewId: string, pinned: boolean) => Promise<boolean>;
  onArchive?: (reviewId: string, archived: boolean) => Promise<boolean>;
  onHide?: (reviewId: string, hidden: boolean) => Promise<boolean>;
  onReport?: (reviewId: string) => void;
  onBlock?: (reviewId: string, userId: string) => void;
  onEdit?: (reviewId: string) => void;
  onDelete?: (reviewId: string) => void;
  onModerate?: (reviewId: string) => void;
  onViewHistory?: (reviewId: string) => void;
  onCopyLink?: (reviewId: string) => void;
  onDownload?: (reviewId: string) => void;
  onSettings?: (reviewId: string) => void;
  
  // Modal settings
  modalSize?: 'sm' | 'md' | 'lg';
  
  // API
  apiEndpoint?: string;
}

const MoreActions: React.FC<MoreActionsProps> = ({
  reviewId,
  userId,
  authorId,
  isBookmarked = false,
  isPinned = false,
  isArchived = false,
  isHidden = false,
  isModerator = false,
  isAdmin = false,
  isOwner = false,
  size = 'md',
  variant = 'ghost',
  className,
  dropdownClassName,
  disabled = false,
  showLabels = true,
  showBadges = true,
  enableAnimations = true,
  closeOnAction = true,
  position = 'bottom-right',
  actions,
  enabledActions,
  disabledActions = [],
  customActions = [],
  showDefaultActions = true,
  groupActions = true,
  onBookmark,
  onPin,
  onArchive,
  onHide,
  onReport,
  onBlock,
  onEdit,
  onDelete,
  onModerate,
  onViewHistory,
  onCopyLink,
  onDownload,
  modalSize = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action?: ActionItem;
  }>({ isOpen: false });
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Handle click outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Execute action with loading state
  const executeAction = async (action: ActionItem) => {
    if (action.disabled) return;
    
    if (action.requireConfirmation) {
      setConfirmDialog({ isOpen: true, action });
      return;
    }

    await performAction(action);
  };

  // Perform the actual action
  const performAction = async (action: ActionItem) => {
    setIsLoading(action.id);
    
    try {
      await action.onClick();
      
      if (closeOnAction) {
        setIsOpen(false);
      }
      
      toast({
        title: 'Action Completed',
        description: `${action.label} completed successfully`,
        variant: 'success'
      });
      
    } catch (error) {
      console.error(`Action ${action.id} failed:`, error);
      
      toast({
        title: 'Action Failed',
        description: `Failed to ${action.label.toLowerCase()}`,
        variant: 'error'
      });
    } finally {
      setIsLoading(null);
      setConfirmDialog({ isOpen: false });
    }
  };

  // Handle confirmation dialog
  const handleConfirmAction = async () => {
    if (confirmDialog.action) {
      await performAction(confirmDialog.action);
    }
  };

  // Default actions
  const getDefaultActions = (): ActionItem[] => {
    const userActions: ActionItem[] = [];
    const moderatorActions: ActionItem[] = [];
    const generalActions: ActionItem[] = [];

    // User actions
    if (userId) {
      userActions.push({
        id: 'bookmark',
        label: isBookmarked ? 'Remove Bookmark' : 'Add Bookmark',
        icon: isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />,
        variant: isBookmarked ? 'success' : 'default',
        onClick: async () => {
          if (onBookmark) {
            const success = await onBookmark(reviewId, !isBookmarked);
            if (!success) throw new Error('Bookmark action failed');
          }
        }
      });

      if (isOwner) {
        userActions.push({
          id: 'pin',
          label: isPinned ? 'Unpin Review' : 'Pin Review',
          icon: isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />,
          variant: isPinned ? 'warning' : 'default',
          onClick: async () => {
            if (onPin) {
              const success = await onPin(reviewId, !isPinned);
              if (!success) throw new Error('Pin action failed');
            }
          }
        });

        userActions.push({
          id: 'archive',
          label: isArchived ? 'Restore Review' : 'Archive Review',
          icon: isArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />,
          variant: isArchived ? 'success' : 'warning',
          onClick: async () => {
            if (onArchive) {
              const success = await onArchive(reviewId, !isArchived);
              if (!success) throw new Error('Archive action failed');
            }
          }
        });

        userActions.push({
          id: 'edit',
          label: 'Edit Review',
          icon: <Edit className="w-4 h-4" />,
          onClick: () => onEdit?.(reviewId)
        });

        userActions.push({
          id: 'delete',
          label: 'Delete Review',
          icon: <Trash2 className="w-4 h-4" />,
          variant: 'destructive',
          requireConfirmation: true,
          confirmationTitle: 'Delete Review',
          confirmationMessage: 'Are you sure you want to delete this review? This action cannot be undone.',
          onClick: () => onDelete?.(reviewId)
        });
      }
    }

    // Moderator actions
    if (isModerator || isAdmin) {
      moderatorActions.push({
        id: 'hide',
        label: isHidden ? 'Unhide Review' : 'Hide Review',
        icon: isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />,
        variant: isHidden ? 'success' : 'warning',
        permission: 'moderate',
        onClick: async () => {
          if (onHide) {
            const success = await onHide(reviewId, !isHidden);
            if (!success) throw new Error('Hide action failed');
          }
        }
      });

      moderatorActions.push({
        id: 'moderate',
        label: 'Moderate Review',
        icon: <Shield className="w-4 h-4" />,
        variant: 'warning',
        permission: 'moderate',
        onClick: () => onModerate?.(reviewId)
      });

      if (authorId && authorId !== userId) {
        moderatorActions.push({
          id: 'block',
          label: 'Block User',
          icon: <UserX className="w-4 h-4" />,
          variant: 'destructive',
          permission: 'moderate',
          requireConfirmation: true,
          confirmationTitle: 'Block User',
          confirmationMessage: 'Are you sure you want to block this user? They will no longer be able to post reviews.',
          onClick: () => onBlock?.(reviewId, authorId)
        });
      }
    }

    // General actions
    generalActions.push({
      id: 'copy',
      label: 'Copy Link',
      icon: <Copy className="w-4 h-4" />,
      onClick: () => onCopyLink?.(reviewId)
    });

    generalActions.push({
      id: 'report',
      label: 'Report Review',
      icon: <Flag className="w-4 h-4" />,
      variant: 'warning',
      onClick: () => onReport?.(reviewId)
    });

    generalActions.push({
      id: 'download',
      label: 'Download Review',
      icon: <Download className="w-4 h-4" />,
      onClick: () => onDownload?.(reviewId)
    });

    generalActions.push({
      id: 'history',
      label: 'View History',
      icon: <History className="w-4 h-4" />,
      onClick: () => onViewHistory?.(reviewId)
    });

    return groupActions 
      ? [...userActions, ...moderatorActions, ...generalActions]
      : [...userActions, ...moderatorActions, ...generalActions];
  };

  // Get filtered actions
  const getFilteredActions = (): ActionItem[] => {
    let allActions = actions || (showDefaultActions ? getDefaultActions() : []);
    
    // Add custom actions
    allActions = [...allActions, ...customActions];
    
    // Filter by enabled/disabled actions
    if (enabledActions) {
      allActions = allActions.filter(action => enabledActions.includes(action.id));
    }
    
    if (disabledActions.length > 0) {
      allActions = allActions.filter(action => !disabledActions.includes(action.id));
    }
    
    return allActions;
  };

  // Get dropdown position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'bottom-full right-0 mb-2';
      case 'top-right':
        return 'bottom-full left-0 mb-2';
      case 'bottom-left':
        return 'top-full right-0 mt-2';
      case 'bottom-right':
      default:
        return 'top-full left-0 mt-2';
    }
  };

  // Render action groups
  const renderActions = () => {
    const filteredActions = getFilteredActions();
    
    if (groupActions) {
      const userActions = filteredActions.filter(action => 
        ['bookmark', 'pin', 'archive', 'edit', 'delete'].includes(action.id)
      );
      const moderatorActions = filteredActions.filter(action => 
        action.permission === 'moderate'
      );
      const generalActions = filteredActions.filter(action => 
        !['bookmark', 'pin', 'archive', 'edit', 'delete'].includes(action.id) && 
        action.permission !== 'moderate'
      );

      return (
        <>
          {userActions.length > 0 && (
            <>
              {renderActionGroup(userActions)}
              {(moderatorActions.length > 0 || generalActions.length > 0) && (
                <Separator className="my-1" />
              )}
            </>
          )}
          
          {moderatorActions.length > 0 && (
            <>
              {renderActionGroup(moderatorActions)}
              {generalActions.length > 0 && <Separator className="my-1" />}
            </>
          )}
          
          {generalActions.length > 0 && renderActionGroup(generalActions)}
        </>
      );
    }

    return renderActionGroup(filteredActions);
  };

  // Render action group
  const renderActionGroup = (groupActions: ActionItem[]) => {
    return groupActions.map((action) => (
      <button
        key={action.id}
        onClick={() => executeAction(action)}
        disabled={action.disabled || isLoading === action.id}
        className={cn(
          "flex items-center gap-3 w-full px-3 py-2 text-left text-sm",
          "transition-colors duration-150",
          "hover:bg-gray-100 focus:bg-gray-100",
          "focus:outline-none",
          action.variant === 'destructive' && 'text-red-600 hover:bg-red-50',
          action.variant === 'warning' && 'text-yellow-600 hover:bg-yellow-50',
          action.variant === 'success' && 'text-green-600 hover:bg-green-50',
          action.disabled && 'opacity-50 cursor-not-allowed',
          isLoading === action.id && 'opacity-50'
        )}
      >
        <span className="flex-shrink-0">
          {isLoading === action.id ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Settings className="w-4 h-4" />
            </motion.div>
          ) : (
            action.icon
          )}
        </span>
        
        {showLabels && (
          <span className="flex-1">{action.label}</span>
        )}
        
        {showBadges && action.badge && (
          <Badge variant="secondary" className="text-xs">
            {action.badge}
          </Badge>
        )}
      </button>
    ));
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <Tooltip content="More actions">
          <Button
            variant={variant}
            size={size}
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              "transition-all duration-200",
              "hover:scale-105 active:scale-95",
              "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              className
            )}
            aria-label="More actions"
            aria-expanded={isOpen}
            aria-haspopup="true"
          >
            <motion.div
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <MoreHorizontal className="w-4 h-4" />
            </motion.div>
          </Button>
        </Tooltip>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={enableAnimations ? { opacity: 0, scale: 0.95, y: -10 } : {}}
              animate={enableAnimations ? { opacity: 1, scale: 1, y: 0 } : {}}
              exit={enableAnimations ? { opacity: 0, scale: 0.95, y: -10 } : {}}
              transition={{ duration: 0.15 }}
              className={cn(
                "absolute z-50 min-w-[200px] bg-white rounded-lg border border-gray-200 shadow-lg",
                "py-1 overflow-hidden",
                getPositionClasses(),
                dropdownClassName
              )}
            >
              {renderActions()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && confirmDialog.action && (
        <Modal
          open={confirmDialog.isOpen}
          onClose={() => setConfirmDialog({ isOpen: false })}
          className={cn(
            modalSize === 'sm' && 'max-w-md',
            modalSize === 'md' && 'max-w-lg',
            modalSize === 'lg' && 'max-w-xl'
          )}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={cn(
                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                confirmDialog.action.variant === 'destructive' && 'bg-red-100 text-red-600',
                confirmDialog.action.variant === 'warning' && 'bg-yellow-100 text-yellow-600',
                (!confirmDialog.action.variant || confirmDialog.action.variant === 'default') && 'bg-gray-100 text-gray-600'
              )}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {confirmDialog.action.confirmationTitle || 'Confirm Action'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {confirmDialog.action.confirmationMessage || 'Are you sure you want to perform this action?'}
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setConfirmDialog({ isOpen: false })}
                disabled={isLoading !== null}
              >
                Cancel
              </Button>
              <Button
                variant={confirmDialog.action.variant === 'destructive' ? 'destructive' : 'default'}
                onClick={handleConfirmAction}
                disabled={isLoading !== null}
              >
                {isLoading ? 'Processing...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default MoreActions;