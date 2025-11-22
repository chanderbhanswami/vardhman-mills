/**
 * CartValidation Component - Vardhman Mills Frontend
 * 
 * Real-time cart validation with:
 * - Stock availability checks
 * - Price verification
 * - Coupon validation
 * - Shipping validation
 * - Item availability
 * - Warning and error display
 * 
 * @component
 */

'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ValidationSeverity = 'error' | 'warning' | 'info' | 'success';

export interface ValidationIssue {
  id: string;
  type: 'stock' | 'price' | 'shipping' | 'coupon' | 'availability' | 'other';
  severity: ValidationSeverity;
  title: string;
  message: string;
  itemId?: string;
  itemName?: string;
  canProceed?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface CartValidationProps {
  /**
   * Validation issues
   */
  issues: ValidationIssue[];

  /**
   * Cart items for context
   */
  cartItems?: Array<{
    id: string;
    name: string;
    price: number;
    inStock: number;
    quantity: number;
  }>;

  /**
   * Show summary
   * @default true
   */
  showSummary?: boolean;

  /**
   * Show item-specific issues
   * @default true
   */
  showItemIssues?: boolean;

  /**
   * Group by severity
   * @default true
   */
  groupBySeverity?: boolean;

  /**
   * Auto-hide success messages
   * @default false
   */
  autoHideSuccess?: boolean;

  /**
   * On fix issue
   */
  onFixIssue?: (issueId: string) => void;

  /**
   * On dismiss issue
   */
  onDismissIssue?: (issueId: string) => void;

  /**
   * Compact view
   * @default false
   */
  compact?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SEVERITY_CONFIG = {
  error: {
    icon: XCircleIcon,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-900',
    iconColor: 'text-red-600',
    badgeVariant: 'destructive' as const,
  },
  warning: {
    icon: ExclamationTriangleIcon,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-900',
    iconColor: 'text-yellow-600',
    badgeVariant: 'warning' as const,
  },
  info: {
    icon: InformationCircleIcon,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-900',
    iconColor: 'text-blue-600',
    badgeVariant: 'default' as const,
  },
  success: {
    icon: CheckCircleIcon,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-900',
    iconColor: 'text-green-600',
    badgeVariant: 'success' as const,
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CartValidation: React.FC<CartValidationProps> = ({
  issues,
  cartItems = [],
  showSummary = true,
  showItemIssues = true,
  groupBySeverity = true,
  autoHideSuccess = false,
  onFixIssue,
  onDismissIssue,
  compact = false,
  className,
}) => {
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Use onFixIssue for future enhancement - could be called from action buttons
  const handleFixIssue = (issueId: string) => {
    if (onFixIssue) {
      onFixIssue(issueId);
    }
  };

  const filteredIssues = useMemo(() => {
    if (autoHideSuccess) {
      return issues.filter((issue) => issue.severity !== 'success');
    }
    return issues;
  }, [issues, autoHideSuccess]);

  const issuesBySeverity = useMemo(() => {
    const grouped = {
      error: filteredIssues.filter((i) => i.severity === 'error'),
      warning: filteredIssues.filter((i) => i.severity === 'warning'),
      info: filteredIssues.filter((i) => i.severity === 'info'),
      success: filteredIssues.filter((i) => i.severity === 'success'),
    };
    return grouped;
  }, [filteredIssues]);

  const issueCounts = useMemo(() => {
    return {
      error: issuesBySeverity.error.length,
      warning: issuesBySeverity.warning.length,
      info: issuesBySeverity.info.length,
      success: issuesBySeverity.success.length,
      total: filteredIssues.length,
    };
  }, [issuesBySeverity, filteredIssues]);

  const canProceedToCheckout = useMemo(() => {
    return !issues.some((issue) => issue.severity === 'error' && issue.canProceed === false);
  }, [issues]);

  const itemIssues = useMemo(() => {
    return filteredIssues.filter((issue) => issue.itemId);
  }, [filteredIssues]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderSummary = () => {
    if (issueCounts.total === 0) {
      return (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-green-900">Cart is ready</h4>
            <p className="text-sm text-green-700">All items are available and ready for checkout</p>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {issueCounts.error > 0 && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <XCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-900">{issueCounts.error}</p>
              <p className="text-xs text-red-700">Errors</p>
            </div>
          </div>
        )}
        {issueCounts.warning > 0 && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-yellow-900">{issueCounts.warning}</p>
              <p className="text-xs text-yellow-700">Warnings</p>
            </div>
          </div>
        )}
        {issueCounts.info > 0 && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <InformationCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-900">{issueCounts.info}</p>
              <p className="text-xs text-blue-700">Info</p>
            </div>
          </div>
        )}
        {!canProceedToCheckout && (
          <div className="col-span-2 sm:col-span-4 flex items-center gap-2 p-3 bg-red-100 border-2 border-red-300 rounded-lg">
            <ExclamationCircleIcon className="h-5 w-5 text-red-700 flex-shrink-0" />
            <p className="text-sm font-semibold text-red-900">
              Please resolve errors before proceeding to checkout
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderIssue = (issue: ValidationIssue) => {
    const config = SEVERITY_CONFIG[issue.severity];
    const Icon = config.icon;

    return (
      <motion.div
        key={issue.id}
        layout
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        className={cn(
          'flex items-start gap-3 p-4 border-2 rounded-lg',
          config.bgColor,
          config.borderColor,
          compact && 'p-3'
        )}
      >
        <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', config.iconColor)} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={cn('font-semibold', compact ? 'text-sm' : 'text-base', config.textColor)}>
                  {issue.title}
                </h4>
                {issue.itemName && (
                  <Badge variant={config.badgeVariant} size="sm">
                    {issue.itemName}
                  </Badge>
                )}
              </div>
              <p className={cn('text-sm', config.textColor, 'opacity-90')}>
                {issue.message}
              </p>
            </div>

            {onDismissIssue && issue.severity !== 'error' && (
              <button
                onClick={() => onDismissIssue(issue.id)}
                className={cn('text-current opacity-50 hover:opacity-100 transition-opacity')}
                aria-label="Dismiss"
              >
                <XCircleIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {issue.action && (
            <Button
              variant={issue.severity === 'error' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                issue.action?.onClick();
                handleFixIssue(issue.id);
              }}
              className="mt-2"
            >
              {issue.action.label}
            </Button>
          )}
        </div>
      </motion.div>
    );
  };

  const renderGroupedIssues = () => {
    return (
      <div className="space-y-4">
        {(Object.keys(issuesBySeverity) as ValidationSeverity[]).map((severity) => {
          const severityIssues = issuesBySeverity[severity];
          if (severityIssues.length === 0) return null;

          const config = SEVERITY_CONFIG[severity];

          return (
            <div key={severity} className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={config.badgeVariant} size="sm">
                  {severityIssues.length}
                </Badge>
                <h4 className={cn('text-sm font-semibold uppercase tracking-wide', config.textColor)}>
                  {severity}
                </h4>
              </div>
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {severityIssues.map((issue) => renderIssue(issue))}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderItemSpecificIssues = () => {
    if (itemIssues.length === 0) return null;

    const issuesByItem = cartItems.reduce((acc, item) => {
      const itemIssuesList = itemIssues.filter((issue) => issue.itemId === item.id);
      if (itemIssuesList.length > 0) {
        acc.push({
          item,
          issues: itemIssuesList,
        });
      }
      return acc;
    }, [] as Array<{ item: typeof cartItems[0]; issues: ValidationIssue[] }>);

    if (issuesByItem.length === 0) return null;

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900">Item-Specific Issues</h4>
        {issuesByItem.map(({ item, issues: itemIssuesList }) => (
          <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h5 className="font-medium text-gray-900">{item.name}</h5>
                <p className="text-sm text-gray-600">
                  {formatCurrency(item.price, 'INR')} × {item.quantity}
                </p>
              </div>
              <Badge variant="warning" size="sm">
                {itemIssuesList.length} {itemIssuesList.length === 1 ? 'issue' : 'issues'}
              </Badge>
            </div>
            <div className="space-y-2">
              {itemIssuesList.map((issue) => renderIssue(issue))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (filteredIssues.length === 0 && !showSummary) {
    return null;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {showSummary && renderSummary()}

      {filteredIssues.length > 0 && (
        <>
          {groupBySeverity ? (
            renderGroupedIssues()
          ) : (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {filteredIssues.map((issue) => renderIssue(issue))}
              </AnimatePresence>
            </div>
          )}

          {showItemIssues && renderItemSpecificIssues()}
        </>
      )}
    </div>
  );
};

export default CartValidation;
