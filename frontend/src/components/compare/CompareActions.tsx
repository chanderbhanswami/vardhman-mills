'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShareIcon,
  ArrowDownTrayIcon,
  BookmarkIcon,
  PrinterIcon,
  ArrowPathIcon,
  XMarkIcon,
  LinkIcon,
  EnvelopeIcon,
  QrCodeIcon,
  DocumentTextIcon,
  TableCellsIcon,
  DocumentChartBarIcon,
  CheckCircleIcon,
  DocumentDuplicateIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import {
  BookmarkIcon as BookmarkIconSolid,
} from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CompareActionsProps {
  /**
   * Comparison ID
   */
  comparisonId?: string;

  /**
   * Number of products being compared
   */
  productCount?: number;

  /**
   * Whether comparison is saved
   */
  isSaved?: boolean;

  /**
   * Callback when share is clicked
   */
  onShare?: (method: ShareMethod) => void | Promise<void>;

  /**
   * Callback when export is clicked
   */
  onExport?: (format: ExportFormat) => void | Promise<void>;

  /**
   * Callback when save is clicked
   */
  onSave?: (data: SaveComparisonData) => void | Promise<void>;

  /**
   * Callback when print is clicked
   */
  onPrint?: () => void;

  /**
   * Callback when reset is clicked
   */
  onReset?: () => void;

  /**
   * Callback when clear is clicked
   */
  onClear?: () => void;

  /**
   * Callback when duplicate is clicked
   */
  onDuplicate?: () => void;

  /**
   * Show compact buttons
   */
  compact?: boolean;

  /**
   * Orientation
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * Additional CSS classes
   */
  className?: string;
}

export type ShareMethod = 
  | 'facebook' 
  | 'twitter' 
  | 'linkedin' 
  | 'whatsapp' 
  | 'email' 
  | 'link' 
  | 'qr';

export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json';

export interface SaveComparisonData {
  name?: string;
  notes?: string;
  isPublic?: boolean;
}

interface ActionButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  badge?: string | number;
  className?: string;
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (method: ShareMethod) => void;
  shareUrl: string;
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat) => void;
}

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SaveComparisonData) => void;
  isSaved: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Copy text to clipboard
 */
const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Generate share URL for social media
 */
const generateShareUrl = (
  platform: 'facebook' | 'twitter' | 'linkedin' | 'whatsapp',
  url: string,
  title?: string
): string => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = title ? encodeURIComponent(title) : '';

  switch (platform) {
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    
    case 'twitter':
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
    
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    
    case 'whatsapp':
      return `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
    
    default:
      return url;
  }
};

/**
 * Generate email share link
 */
const generateEmailLink = (url: string, title: string = 'Check out this comparison'): string => {
  const subject = encodeURIComponent(title);
  const body = encodeURIComponent(`I thought you might be interested in this product comparison:\n\n${url}`);
  return `mailto:?subject=${subject}&body=${body}`;
};



// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Action button component
 */
const ActionButton: React.FC<ActionButtonProps> = ({
  icon: Icon,
  label,
  onClick,
  variant = 'outline',
  disabled = false,
  loading = false,
  badge,
  className,
}) => {
  return (
    <Button
      onClick={onClick}
      variant={variant}
      disabled={disabled || loading}
      className={cn('relative', className)}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
      ) : (
        <Icon className="h-4 w-4 mr-2" />
      )}
      <span>{label}</span>
      {badge !== undefined && (
        <Badge variant="default" className="ml-2">
          {badge}
        </Badge>
      )}
    </Button>
  );
};

/**
 * Share modal component
 */
const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  onShare,
  shareUrl,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyLink = async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy link');
    }
  };

  const handleSocialShare = (platform: 'facebook' | 'twitter' | 'linkedin' | 'whatsapp') => {
    const url = generateShareUrl(platform, shareUrl, 'Product Comparison');
    window.open(url, '_blank', 'width=600,height=400');
    onShare(platform);
  };

  const handleEmailShare = () => {
    const emailUrl = generateEmailLink(shareUrl, 'Product Comparison');
    window.location.href = emailUrl;
    onShare('email');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg"
        >
          <Card className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Share Comparison
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close share modal"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Social media buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Button
                onClick={() => handleSocialShare('facebook')}
                variant="outline"
                className="justify-start"
              >
                <ShareIcon className="h-5 w-5 mr-2 text-blue-600" />
                Facebook
              </Button>
              <Button
                onClick={() => handleSocialShare('twitter')}
                variant="outline"
                className="justify-start"
              >
                <ShareIcon className="h-5 w-5 mr-2 text-sky-500" />
                Twitter
              </Button>
              <Button
                onClick={() => handleSocialShare('linkedin')}
                variant="outline"
                className="justify-start"
              >
                <ShareIcon className="h-5 w-5 mr-2 text-blue-700" />
                LinkedIn
              </Button>
              <Button
                onClick={() => handleSocialShare('whatsapp')}
                variant="outline"
                className="justify-start"
              >
                <ShareIcon className="h-5 w-5 mr-2 text-green-600" />
                WhatsApp
              </Button>
            </div>

            {/* Email share */}
            <Button
              onClick={handleEmailShare}
              variant="outline"
              className="w-full mb-4 justify-start"
            >
              <EnvelopeIcon className="h-5 w-5 mr-2" />
              Share via Email
            </Button>

            {/* Copy link */}
            <div className="space-y-2">
              <label htmlFor="share-url-input" className="text-sm font-medium text-gray-700">
                Or copy link
              </label>
              <div className="flex gap-2">
                <input
                  id="share-url-input"
                  type="text"
                  value={shareUrl}
                  readOnly
                  title="Share URL"
                  placeholder="Share URL"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                />
                <Button
                  onClick={handleCopyLink}
                  variant={copied ? 'default' : 'outline'}
                >
                  {copied ? (
                    <>
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <LinkIcon className="h-5 w-5 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* QR Code section (placeholder) */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Button
                onClick={() => onShare('qr')}
                variant="outline"
                className="w-full justify-start"
              >
                <QrCodeIcon className="h-5 w-5 mr-2" />
                Generate QR Code
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

/**
 * Export modal component
 */
const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onExport,
}) => {
  const [isExporting, setIsExporting] = React.useState(false);
  const [selectedFormat, setSelectedFormat] = React.useState<ExportFormat | null>(null);

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    setSelectedFormat(format);
    
    try {
      await onExport(format);
      toast.success(`Exported as ${format.toUpperCase()}!`);
      setTimeout(() => {
        onClose();
        setIsExporting(false);
        setSelectedFormat(null);
      }, 1000);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed');
      setIsExporting(false);
      setSelectedFormat(null);
    }
  };

  if (!isOpen) return null;

  const formats: Array<{ format: ExportFormat; label: string; description: string; icon: React.ComponentType<{ className?: string }> }> = [
    {
      format: 'pdf',
      label: 'PDF Document',
      description: 'Printable document with formatting',
      icon: DocumentTextIcon,
    },
    {
      format: 'excel',
      label: 'Excel Spreadsheet',
      description: 'Editable spreadsheet with data',
      icon: TableCellsIcon,
    },
    {
      format: 'csv',
      label: 'CSV File',
      description: 'Raw data in comma-separated format',
      icon: DocumentChartBarIcon,
    },
    {
      format: 'json',
      label: 'JSON Data',
      description: 'Structured data for developers',
      icon: DocumentTextIcon,
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg"
        >
          <Card className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Export Comparison
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close export modal"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Export format options */}
            <div className="space-y-3">
              {formats.map(({ format, label, description, icon: Icon }) => (
                <button
                  key={format}
                  onClick={() => handleExport(format)}
                  disabled={isExporting}
                  className={cn(
                    'w-full flex items-start gap-4 p-4 rounded-lg border-2 transition-all',
                    'hover:border-primary-500 hover:bg-primary-50',
                    isExporting && selectedFormat === format && 'border-primary-500 bg-primary-50',
                    isExporting && selectedFormat !== format && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <Icon className="h-6 w-6 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-900">{label}</div>
                    <div className="text-sm text-gray-500">{description}</div>
                  </div>
                  {isExporting && selectedFormat === format && (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-600 border-t-transparent flex-shrink-0 mt-0.5" />
                  )}
                </button>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

/**
 * Save modal component
 */
const SaveModal: React.FC<SaveModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isSaved,
}) => {
  const [name, setName] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [isPublic, setIsPublic] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      await onSave({ name, notes, isPublic });
      toast.success(isSaved ? 'Comparison updated!' : 'Comparison saved!');
      setTimeout(() => {
        onClose();
        setIsSaving(false);
      }, 1000);
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Failed to save comparison');
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg"
        >
          <Card className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {isSaved ? 'Update Comparison' : 'Save Comparison'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close save modal"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Name input */}
              <div>
                <label htmlFor="comparison-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Comparison Name
                </label>
                <input
                  id="comparison-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Living Room Furniture Comparison"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Notes textarea */}
              <div>
                <label htmlFor="comparison-notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  id="comparison-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this comparison..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Privacy toggle */}
              <label htmlFor="privacy-toggle" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-gray-900">Make Public</div>
                  <div className="text-sm text-gray-500">Allow others to view this comparison</div>
                </div>
                <input
                  type="checkbox"
                  id="privacy-toggle"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="sr-only"
                  aria-label="Make comparison public"
                />
                <button
                  type="button"
                  onClick={() => setIsPublic(!isPublic)}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    isPublic ? 'bg-primary-600' : 'bg-gray-300'
                  )}
                  aria-label={isPublic ? 'Make comparison private' : 'Make comparison public'}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      isPublic ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                variant="default"
                className="flex-1"
                disabled={isSaving || !name.trim()}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <BookmarkIconSolid className="h-4 w-4 mr-2" />
                    {isSaved ? 'Update' : 'Save'}
                  </>
                )}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * CompareActions Component
 * 
 * Action buttons for comparison operations.
 * Features:
 * - Share comparison (social media, link, email, QR)
 * - Export comparison (PDF, Excel, CSV, JSON)
 * - Save comparison with name and notes
 * - Print comparison
 * - Reset/clear comparison
 * - Duplicate comparison
 * - Responsive layout (horizontal/vertical)
 * - Compact mode
 * - Loading states
 * - Success/error feedback
 * 
 * @example
 * ```tsx
 * <CompareActions
 *   comparisonId={comparison.id}
 *   productCount={products.length}
 *   isSaved={comparison.isSaved}
 *   onShare={handleShare}
 *   onExport={handleExport}
 *   onSave={handleSave}
 *   onPrint={handlePrint}
 *   onClear={handleClear}
 * />
 * ```
 */
export const CompareActions: React.FC<CompareActionsProps> = ({
  comparisonId,
  productCount = 0,
  isSaved = false,
  onShare,
  onExport,
  onSave,
  onPrint,
  onReset,
  onClear,
  onDuplicate,
  compact = false,
  orientation = 'horizontal',
  className,
}) => {
  const [showShareModal, setShowShareModal] = React.useState(false);
  const [showExportModal, setShowExportModal] = React.useState(false);
  const [showSaveModal, setShowSaveModal] = React.useState(false);
  const [showConfirmClear, setShowConfirmClear] = React.useState(false);

  // Generate share URL
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/compare/${comparisonId || 'new'}`
    : '';

  // Handle share
  const handleShare = async (method: ShareMethod) => {
    if (onShare) {
      await onShare(method);
    }
  };

  // Handle export
  const handleExport = async (format: ExportFormat) => {
    if (onExport) {
      await onExport(format);
    }
  };

  // Handle save
  const handleSave = async (data: SaveComparisonData) => {
    if (onSave) {
      await onSave(data);
    }
  };

  // Handle print
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  // Handle clear with confirmation
  const handleClear = () => {
    if (productCount > 0) {
      setShowConfirmClear(true);
    }
  };

  const confirmClear = () => {
    if (onClear) {
      onClear();
    }
    setShowConfirmClear(false);
    toast.success('Comparison cleared');
  };

  const containerClass = cn(
    'flex gap-2',
    orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
    className
  );

  return (
    <>
      <div className={containerClass}>
        {/* Share button */}
        {onShare && (
          <ActionButton
            icon={ShareIcon}
            label={compact ? 'Share' : 'Share Comparison'}
            onClick={() => setShowShareModal(true)}
            variant="outline"
          />
        )}

        {/* Export button */}
        {onExport && (
          <ActionButton
            icon={ArrowDownTrayIcon}
            label={compact ? 'Export' : 'Export'}
            onClick={() => setShowExportModal(true)}
            variant="outline"
          />
        )}

        {/* Save button */}
        {onSave && (
          <ActionButton
            icon={isSaved ? BookmarkIconSolid : BookmarkIcon}
            label={isSaved ? (compact ? 'Saved' : 'Update') : (compact ? 'Save' : 'Save Comparison')}
            onClick={() => setShowSaveModal(true)}
            variant={isSaved ? 'default' : 'outline'}
          />
        )}

        {/* Print button */}
        <ActionButton
          icon={PrinterIcon}
          label={compact ? 'Print' : 'Print'}
          onClick={handlePrint}
          variant="outline"
        />

        {/* Duplicate button */}
        {onDuplicate && comparisonId && (
          <ActionButton
            icon={DocumentDuplicateIcon}
            label={compact ? 'Duplicate' : 'Duplicate'}
            onClick={onDuplicate}
            variant="outline"
          />
        )}

        {/* Reset button */}
        {onReset && (
          <ActionButton
            icon={ArrowPathIcon}
            label={compact ? 'Reset' : 'Reset'}
            onClick={onReset}
            variant="outline"
          />
        )}

        {/* Clear button */}
        {onClear && productCount > 0 && (
          <ActionButton
            icon={TrashIcon}
            label={compact ? 'Clear' : 'Clear All'}
            onClick={handleClear}
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
            badge={productCount}
          />
        )}
      </div>

      {/* Share modal */}
      {showShareModal && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          onShare={handleShare}
          shareUrl={shareUrl}
        />
      )}

      {/* Export modal */}
      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
        />
      )}

      {/* Save modal */}
      {showSaveModal && (
        <SaveModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          onSave={handleSave}
          isSaved={isSaved}
        />
      )}

      {/* Confirm clear modal */}
      {showConfirmClear && (
        <AnimatePresence>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmClear(false)}
              className="absolute inset-0 bg-black/50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md"
            >
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Clear All Products?
                </h3>
                <p className="text-gray-600 mb-6">
                  This will remove all {productCount} products from the comparison. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowConfirmClear(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmClear}
                    variant="default"
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </AnimatePresence>
      )}
    </>
  );
};

export default CompareActions;