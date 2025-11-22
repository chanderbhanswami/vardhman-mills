'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { format, formatDistance } from 'date-fns';
import {
  CreditCardIcon,
  EyeIcon,
  EyeSlashIcon,
  ClipboardIcon,
  ClipboardDocumentCheckIcon,
  ShareIcon,
  HeartIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  QrCodeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  BanknotesIcon,
  GiftIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MapPinIcon,
  PlusIcon,
  MinusIcon,
  PencilIcon,
  TrashIcon,
  LockClosedIcon,
  LockOpenIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon
} from '@heroicons/react/24/solid';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Progress } from '../ui/Progress';
import { toast } from 'react-hot-toast';

// Types
import {
  GiftCard
} from '../../types/giftCard.types';

// Animation variants
const containerVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  },
  exit: { opacity: 0 }
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3
    }
  },
  exit: { opacity: 0, y: -20 }
};

const slideVariants = {
  initial: { x: 20, opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: {
      duration: 0.4
    }
  },
  exit: { 
    x: -20, 
    opacity: 0,
    transition: {
      duration: 0.3
    }
  }
};

const scaleVariants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: {
      duration: 0.3,
      type: "spring" as const,
      stiffness: 300
    }
  },
  exit: { 
    scale: 0.9, 
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

// Interfaces
interface Transaction {
  id: string;
  type: 'purchase' | 'redemption' | 'transfer' | 'reload' | 'refund' | 'fee';
  amount: number;
  description: string;
  date: Date;
  location?: string;
  merchant?: string;
  status: 'completed' | 'pending' | 'failed';
  reference?: string;
}

interface Activity {
  id: string;
  type: 'created' | 'sent' | 'received' | 'activated' | 'redeemed' | 'expired' | 'locked' | 'unlocked' | 'transferred' | 'viewed';
  description: string;
  date: Date;
  location?: string;
  ipAddress?: string;
  userAgent?: string;
}

interface Recipient {
  name: string;
  email: string;
  phone?: string;
  message?: string;
}

interface GiftCardDetailProps {
  giftCard: GiftCard;
  showFullDetails?: boolean;
  showTransactions?: boolean;
  showActivity?: boolean;
  showQRCode?: boolean;
  showBarcode?: boolean;
  allowCodeToggle?: boolean;
  allowFavorite?: boolean;
  allowShare?: boolean;
  allowPrint?: boolean;
  allowDownload?: boolean;
  allowReload?: boolean;
  allowTransfer?: boolean;
  allowBlock?: boolean;
  editable?: boolean;
  className?: string;
  onEdit?: (giftCard: GiftCard) => void;
  onDelete?: (id: string) => void;
  onFavorite?: (id: string, favorite: boolean) => void;
  onShare?: (giftCard: GiftCard) => void;
  onPrint?: (giftCard: GiftCard) => void;
  onDownload?: (giftCard: GiftCard) => void;
  onReload?: (id: string, amount: number) => void;
  onTransfer?: (id: string, recipient: Recipient) => void;
  onBlock?: (id: string) => void;
  onUnblock?: (id: string) => void;
  onRedeem?: (id: string, amount: number, location: string) => void;
  onCopyCode?: (code: string) => void;
  onViewDetails?: (id: string) => void;
  children?: React.ReactNode;
}

// Sample data
const sampleTransactions: Transaction[] = [
  {
    id: 'txn-1',
    type: 'purchase',
    amount: 500,
    description: 'Gift card purchase',
    date: new Date('2024-01-15'),
    status: 'completed',
    reference: 'REF123456'
  },
  {
    id: 'txn-2',
    type: 'redemption',
    amount: -150,
    description: 'Amazon.in purchase',
    date: new Date('2024-01-20'),
    location: 'Online',
    merchant: 'Amazon India',
    status: 'completed',
    reference: 'AMZ789012'
  },
  {
    id: 'txn-3',
    type: 'redemption',
    amount: -75,
    description: 'Book purchase',
    date: new Date('2024-01-25'),
    location: 'Online',
    merchant: 'Amazon India',
    status: 'completed',
    reference: 'AMZ345678'
  }
];

const sampleActivity: Activity[] = [
  {
    id: 'act-1',
    type: 'created',
    description: 'Gift card created and sent to recipient',
    date: new Date('2024-01-15'),
    location: 'Mumbai, India'
  },
  {
    id: 'act-2',
    type: 'activated',
    description: 'Gift card activated by recipient',
    date: new Date('2024-01-16'),
    location: 'Delhi, India'
  },
  {
    id: 'act-3',
    type: 'redeemed',
    description: 'Partial redemption at Amazon.in',
    date: new Date('2024-01-20'),
    location: 'Online'
  },
  {
    id: 'act-4',
    type: 'viewed',
    description: 'Balance checked via mobile app',
    date: new Date('2024-01-28'),
    location: 'Bangalore, India'
  }
];

// Helper functions
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

const formatDate = (date: Date | string): string => {
  return format(new Date(date), 'MMM dd, yyyy');
};

const formatDateTime = (date: Date | string): string => {
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
};

const formatRelativeTime = (date: Date | string): string => {
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
};

const getStatusConfig = (status: string) => {
  const configs = {
    pending: {
      color: 'yellow',
      icon: <ClockIcon className="w-4 h-4" />,
      label: 'Pending Activation'
    },
    active: {
      color: 'green',
      icon: <CheckCircleIcon className="w-4 h-4" />,
      label: 'Active'
    },
    expired: {
      color: 'red',
      icon: <XCircleIcon className="w-4 h-4" />,
      label: 'Expired'
    },
    locked: {
      color: 'gray',
      icon: <LockClosedIcon className="w-4 h-4" />,
      label: 'Locked'
    },
    transferred: {
      color: 'blue',
      icon: <ArrowPathIcon className="w-4 h-4" />,
      label: 'Transferred'
    },
    redeemed: {
      color: 'purple',
      icon: <CheckCircleIcon className="w-4 h-4" />,
      label: 'Fully Redeemed'
    }
  };
  return configs[status as keyof typeof configs] || configs.pending;
};

const getBalancePercentage = (balance: number, original: number): number => {
  if (original === 0) return 0;
  return Math.round((balance / original) * 100);
};

const generateQRCode = (code: string): string => {
  // In a real app, you would use a proper QR code library
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(code)}`;
};

const generateBarcode = (code: string): string => {
  // In a real app, you would use a proper barcode library
  return `https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(code)}&code=Code128&translate-esc=on`;
};

// Main component
const GiftCardDetail: React.FC<GiftCardDetailProps> = ({
  giftCard,
  showFullDetails = true,
  showTransactions = true,
  showActivity = true,
  showQRCode = true,
  showBarcode = true,
  allowCodeToggle = true,
  allowFavorite = true,
  allowShare = true,
  allowPrint = true,
  allowDownload = true,
  allowReload = true,
  allowTransfer = true,
  allowBlock = true,
  editable = false,
  className,
  onEdit,
  onDelete,
  onFavorite,
  onShare,
  onPrint,
  onDownload,
  onReload,
  onTransfer,
  onBlock,
  onUnblock,
  onRedeem,
  onCopyCode,
  onViewDetails,
  children
}) => {
  // State
  const [isCodeVisible, setIsCodeVisible] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showTransactionsPanel, setShowTransactionsPanel] = useState(false);
  const [showActivityPanel, setShowActivityPanel] = useState(false);
  const [showQRPanel, setShowQRPanel] = useState(false);
  const [showBarcodePanel, setShowBarcodePanel] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reloadAmount, setReloadAmount] = useState('');
  const [showReloadForm, setShowReloadForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [transferRecipient, setTransferRecipient] = useState<Recipient>({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const cardRef = useRef<HTMLDivElement>(null);

  // Effects
  useEffect(() => {
    if (copiedCode) {
      const timer = setTimeout(() => setCopiedCode(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedCode]);

  // Handlers
  const handleCodeToggle = useCallback(() => {
    setIsCodeVisible(prev => !prev);
  }, []);

  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(giftCard.code);
      setCopiedCode(true);
      toast.success('Gift card code copied!');
      if (onCopyCode) {
        onCopyCode(giftCard.code);
      }
    } catch {
      toast.error('Failed to copy code');
    }
  }, [giftCard.code, onCopyCode]);

  const handleFavoriteToggle = useCallback(() => {
    const newFavorited = !isFavorited;
    setIsFavorited(newFavorited);
    if (onFavorite) {
      onFavorite(giftCard.id, newFavorited);
    }
    toast.success(newFavorited ? 'Added to favorites' : 'Removed from favorites');
  }, [isFavorited, giftCard.id, onFavorite]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${giftCard.design?.name || giftCard.title} Gift Card`,
          text: `Check out this ${formatCurrency(giftCard.balance)} gift card!`,
          url: window.location.href
        });
      } catch {
        // User cancelled sharing
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      } catch {
        toast.error('Failed to share');
      }
    }
    
    if (onShare) {
      onShare(giftCard);
    }
  }, [giftCard, onShare]);

  const handlePrint = useCallback(() => {
    window.print();
    if (onPrint) {
      onPrint(giftCard);
    }
  }, [giftCard, onPrint]);

  const handleDownload = useCallback(() => {
    // In a real app, you would generate and download a PDF
    toast.success('Download started!');
    if (onDownload) {
      onDownload(giftCard);
    }
  }, [giftCard, onDownload]);

  const handleReload = useCallback(() => {
    const amount = parseFloat(reloadAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowReloadForm(false);
      setReloadAmount('');
      toast.success(`Gift card reloaded with ${formatCurrency(amount)}`);
      if (onReload) {
        onReload(giftCard.id, amount);
      }
    }, 1500);
  }, [reloadAmount, giftCard.id, onReload]);

  const handleTransfer = useCallback(() => {
    if (!transferRecipient.name || !transferRecipient.email) {
      toast.error('Please fill in recipient details');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowTransferForm(false);
      setTransferRecipient({ name: '', email: '', phone: '', message: '' });
      toast.success('Gift card transferred successfully!');
      if (onTransfer) {
        onTransfer(giftCard.id, transferRecipient);
      }
    }, 1500);
  }, [transferRecipient, giftCard.id, onTransfer]);

  const handleBlock = useCallback(() => {
    if (giftCard.status === 'locked') {
      if (onUnblock) {
        onUnblock(giftCard.id);
      }
      toast.success('Gift card unblocked');
    } else {
      if (onBlock) {
        onBlock(giftCard.id);
      }
      toast.success('Gift card blocked');
    }
  }, [giftCard.status, giftCard.id, onBlock, onUnblock]);

  // Get status configuration
  const statusConfig = getStatusConfig(giftCard.status);
  const balancePercentage = getBalancePercentage(giftCard.balance, giftCard.originalAmount);

  return (
    <div className={clsx('max-w-4xl mx-auto space-y-6', className)}>
      <motion.div
        ref={cardRef}
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="space-y-6"
      >
        {/* Main Gift Card Display */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            {/* Card Header */}
            <div className="relative h-64 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-[url('/images/patterns/gift-card-pattern.svg')] bg-repeat bg-center"></div>
              </div>
              
              {/* Card Content */}
              <div className="relative h-full flex flex-col justify-between p-6 text-white">
                {/* Top Row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <GiftIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{giftCard.design?.name || giftCard.title}</h2>
                      <p className="text-white/80 text-sm">Gift Card</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {allowFavorite && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleFavoriteToggle}
                        className="text-white hover:bg-white/20"
                      >
                        {isFavorited ? (
                          <HeartSolidIcon className="w-5 h-5" />
                        ) : (
                          <HeartIcon className="w-5 h-5" />
                        )}
                      </Button>
                    )}
                    
                    <Badge
                      variant={statusConfig.color === 'green' ? 'success' : statusConfig.color === 'red' ? 'destructive' : statusConfig.color === 'yellow' ? 'warning' : 'secondary'}
                      className="text-xs"
                    >
                      {statusConfig.label}
                    </Badge>
                  </div>
                </div>

                {/* Balance Section */}
                <div className="space-y-3">
                  <div>
                    <p className="text-white/80 text-sm">Current Balance</p>
                    <p className="text-3xl font-bold">{formatCurrency(giftCard.balance)}</p>
                    <p className="text-white/60 text-sm">
                      of {formatCurrency(giftCard.originalAmount)} original value
                    </p>
                  </div>
                  
                  {/* Balance Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-white/80">
                      <span>Used: {formatCurrency(giftCard.originalAmount - giftCard.balance)}</span>
                      <span>{balancePercentage}% remaining</span>
                    </div>
                    <Progress 
                      value={balancePercentage}
                      className="h-2 bg-white/20"
                    />
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-white/80 text-xs">Card Number</p>
                    <div className="flex items-center space-x-2">
                      <p className="font-mono text-sm">
                        {isCodeVisible ? giftCard.code : '••••••••••••••••'}
                      </p>
                      
                      {allowCodeToggle && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCodeToggle}
                          className="text-white hover:bg-white/20 p-1"
                        >
                          {isCodeVisible ? (
                            <EyeSlashIcon className="w-4 h-4" />
                          ) : (
                            <EyeIcon className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyCode}
                        className="text-white hover:bg-white/20 p-1"
                      >
                        {copiedCode ? (
                          <ClipboardDocumentCheckIcon className="w-4 h-4" />
                        ) : (
                          <ClipboardIcon className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-white/80 text-xs">Expires</p>
                    <p className="text-sm font-medium">
                      {giftCard.expiresAt ? formatDate(giftCard.expiresAt) : 'Never'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {allowShare && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="flex items-center justify-center"
                  >
                    <ShareIcon className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                )}
                
                {allowPrint && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrint}
                    className="flex items-center justify-center"
                  >
                    <PrinterIcon className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                )}
                
                {allowDownload && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    className="flex items-center justify-center"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
                
                {allowReload && giftCard.status === 'active' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReloadForm(true)}
                    className="flex items-center justify-center"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Reload
                  </Button>
                )}
                
                {allowTransfer && giftCard.status === 'active' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTransferForm(true)}
                    className="flex items-center justify-center"
                  >
                    <ArrowPathIcon className="w-4 h-4 mr-2" />
                    Transfer
                  </Button>
                )}
                
                {giftCard.balance > 0 && giftCard.status === 'active' && onRedeem && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onRedeem(giftCard.id, Math.min(100, giftCard.balance), 'Online')}
                    className="flex items-center justify-center"
                  >
                    <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                    Redeem
                  </Button>
                )}
                
                {onViewDetails && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(giftCard.id)}
                    className="flex items-center justify-center"
                  >
                    <EyeIcon className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                )}
                
                {allowBlock && (
                  <Button
                    variant={giftCard.status === 'locked' ? 'default' : 'destructive'}
                    size="sm"
                    onClick={handleBlock}
                    className="flex items-center justify-center"
                  >
                    {giftCard.status === 'locked' ? (
                      <>
                        <LockOpenIcon className="w-4 h-4 mr-2" />
                        Unblock
                      </>
                    ) : (
                      <>
                        <LockClosedIcon className="w-4 h-4 mr-2" />
                        Block
                      </>
                    )}
                  </Button>
                )}
                
                {editable && onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(giftCard)}
                    className="flex items-center justify-center"
                  >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
                
                {editable && onDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(giftCard.id)}
                    className="flex items-center justify-center"
                  >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Gift Card Details */}
        {showFullDetails && (
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Gift Card Details
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? (
                    <ChevronUpIcon className="w-5 h-5" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5" />
                  )}
                </Button>
              </div>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    variants={slideVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                          <InformationCircleIcon className="w-5 h-5 mr-2" />
                          Basic Information
                        </h4>
                        
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Card ID:</span>
                            <span className="font-mono text-gray-900 dark:text-white">{giftCard.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Type:</span>
                            <span className="text-gray-900 dark:text-white capitalize">{giftCard.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Status:</span>
                            <Badge
                              variant={statusConfig.color === 'green' ? 'success' : statusConfig.color === 'red' ? 'destructive' : statusConfig.color === 'yellow' ? 'warning' : 'secondary'}
                              size="sm"
                            >
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Currency:</span>
                            <span className="text-gray-900 dark:text-white">{giftCard.currency}</span>
                          </div>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                          <CalendarIcon className="w-5 h-5 mr-2" />
                          Important Dates
                        </h4>
                        
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Purchased:</span>
                            <span className="text-gray-900 dark:text-white">{formatDate(giftCard.createdAt)}</span>
                          </div>
                          {giftCard.activatedAt && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Activated:</span>
                              <span className="text-gray-900 dark:text-white">{formatDate(giftCard.activatedAt)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Expires:</span>
                            <span className="text-gray-900 dark:text-white">
                              {giftCard.expiresAt ? formatDate(giftCard.expiresAt) : 'Never'}
                            </span>
                          </div>
                          {giftCard.lastUsedAt && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Last Used:</span>
                              <span className="text-gray-900 dark:text-white">{formatDate(giftCard.lastUsedAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Financial Details */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                          <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                          Financial Details
                        </h4>
                        
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Original Value:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(giftCard.originalAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Current Balance:</span>
                            <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(giftCard.balance)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Amount Used:</span>
                            <span className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(giftCard.originalAmount - giftCard.balance)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Usage:</span>
                            <span className="text-gray-900 dark:text-white">{100 - balancePercentage}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Recipient Information */}
                      {giftCard.recipientEmail && (
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                            <UserIcon className="w-5 h-5 mr-2" />
                            Recipient
                          </h4>
                          
                          <div className="space-y-3 text-sm">
                            {giftCard.recipient && (giftCard.recipient.firstName || giftCard.recipient.lastName) && (
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Name:</span>
                                <span className="text-gray-900 dark:text-white">
                                  {`${giftCard.recipient.firstName || ''} ${giftCard.recipient.lastName || ''}`.trim()}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Email:</span>
                              <span className="text-gray-900 dark:text-white">{giftCard.recipientEmail}</span>
                            </div>
                            {giftCard.recipientPhone && (
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                                <span className="text-gray-900 dark:text-white">{giftCard.recipientPhone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Brand Information */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                          <BuildingStorefrontIcon className="w-5 h-5 mr-2" />
                          Brand Details
                        </h4>
                        
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Brand:</span>
                            <span className="text-gray-900 dark:text-white">{giftCard.design?.name || 'Gift Card'}</span>
                          </div>
                          {giftCard.design?.category && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Category:</span>
                              <span className="text-gray-900 dark:text-white">{giftCard.design.category}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Type:</span>
                            <span className="text-gray-900 dark:text-white capitalize">{giftCard.type}</span>
                          </div>
                        </div>
                      </div>

                      {/* Security Information */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                          <ShieldCheckIcon className="w-5 h-5 mr-2" />
                          Security
                        </h4>
                        
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">PIN Required:</span>
                            <span className="text-gray-900 dark:text-white">{giftCard.securityFeatures?.pinRequired ? 'Yes' : 'No'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Transferable:</span>
                            <span className="text-gray-900 dark:text-white">{giftCard.restrictions?.allowTransfer ? 'Yes' : 'No'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Reloadable:</span>
                            <span className="text-gray-900 dark:text-white">{giftCard.restrictions?.allowReloading ? 'Yes' : 'No'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Personal Message */}
                    {giftCard.giftMessage && (
                      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                          <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
                          Personal Message
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 italic">
                          &quot;{giftCard.giftMessage}&quot;
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}

        {/* QR Code and Barcode */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {showQRCode && (
            <motion.div variants={itemVariants}>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <QrCodeIcon className="w-5 h-5 mr-2" />
                    QR Code
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowQRPanel(!showQRPanel)}
                  >
                    {showQRPanel ? (
                      <ChevronUpIcon className="w-5 h-5" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                
                <AnimatePresence>
                  {showQRPanel && (
                    <motion.div
                      variants={scaleVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="text-center"
                    >
                      <div className="w-48 h-48 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={generateQRCode(giftCard.code)}
                          alt="QR Code"
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Scan to view gift card details
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          )}

          {showBarcode && (
            <motion.div variants={itemVariants}>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <CreditCardIcon className="w-5 h-5 mr-2" />
                    Barcode
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBarcodePanel(!showBarcodePanel)}
                  >
                    {showBarcodePanel ? (
                      <ChevronUpIcon className="w-5 h-5" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                
                <AnimatePresence>
                  {showBarcodePanel && (
                    <motion.div
                      variants={scaleVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="text-center"
                    >
                      <div className="w-full h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={generateBarcode(giftCard.code)}
                          alt="Barcode"
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {giftCard.code}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Transactions History */}
        {showTransactions && (
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <BanknotesIcon className="w-5 h-5 mr-2" />
                  Transaction History
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTransactionsPanel(!showTransactionsPanel)}
                >
                  {showTransactionsPanel ? (
                    <ChevronUpIcon className="w-5 h-5" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5" />
                  )}
                </Button>
              </div>
              
              <AnimatePresence>
                {showTransactionsPanel && (
                  <motion.div
                    variants={slideVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <div className="space-y-4">
                      {sampleTransactions.map((transaction, index) => (
                        <motion.div
                          key={transaction.id}
                          variants={itemVariants}
                          custom={index}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <div className={clsx(
                              'w-10 h-10 rounded-full flex items-center justify-center',
                              transaction.type === 'purchase' && 'bg-green-100 dark:bg-green-900',
                              transaction.type === 'redemption' && 'bg-blue-100 dark:bg-blue-900',
                              transaction.type === 'transfer' && 'bg-purple-100 dark:bg-purple-900',
                              transaction.type === 'reload' && 'bg-yellow-100 dark:bg-yellow-900',
                              transaction.type === 'refund' && 'bg-red-100 dark:bg-red-900'
                            )}>
                              {transaction.type === 'purchase' && <PlusIcon className="w-5 h-5 text-green-600 dark:text-green-400" />}
                              {transaction.type === 'redemption' && <MinusIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                              {transaction.type === 'transfer' && <ArrowPathIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
                              {transaction.type === 'reload' && <PlusIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />}
                              {transaction.type === 'refund' && <ArrowPathIcon className="w-5 h-5 text-red-600 dark:text-red-400" />}
                            </div>
                            
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {transaction.description}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                <span>{formatDateTime(transaction.date)}</span>
                                {transaction.location && (
                                  <span className="flex items-center">
                                    <MapPinIcon className="w-3 h-3 mr-1" />
                                    {transaction.location}
                                  </span>
                                )}
                                {transaction.reference && (
                                  <span className="font-mono text-xs">
                                    {transaction.reference}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className={clsx(
                              'font-semibold',
                              transaction.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            )}>
                              {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                            </p>
                            <Badge
                              variant={transaction.status === 'completed' ? 'success' : transaction.status === 'pending' ? 'warning' : 'destructive'}
                              size="sm"
                            >
                              {transaction.status}
                            </Badge>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {sampleTransactions.length === 0 && (
                      <div className="text-center py-8">
                        <BanknotesIcon className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                          No transactions yet
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}

        {/* Activity Log */}
        {showActivity && (
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <ClockIcon className="w-5 h-5 mr-2" />
                  Activity Log
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowActivityPanel(!showActivityPanel)}
                >
                  {showActivityPanel ? (
                    <ChevronUpIcon className="w-5 h-5" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5" />
                  )}
                </Button>
              </div>
              
              <AnimatePresence>
                {showActivityPanel && (
                  <motion.div
                    variants={slideVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <div className="space-y-4">
                      {sampleActivity.map((activity, index) => (
                        <motion.div
                          key={activity.id}
                          variants={itemVariants}
                          custom={index}
                          className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className={clsx(
                            'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1',
                            activity.type === 'created' && 'bg-green-100 dark:bg-green-900',
                            activity.type === 'activated' && 'bg-blue-100 dark:bg-blue-900',
                            activity.type === 'redeemed' && 'bg-purple-100 dark:bg-purple-900',
                            activity.type === 'viewed' && 'bg-gray-100 dark:bg-gray-700'
                          )}>
                            {activity.type === 'created' && <GiftIcon className="w-4 h-4 text-green-600 dark:text-green-400" />}
                            {activity.type === 'activated' && <CheckCircleIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                            {activity.type === 'redeemed' && <CurrencyDollarIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                            {activity.type === 'viewed' && <EyeIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
                          </div>
                          
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {activity.description}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                              <span>{formatRelativeTime(activity.date)}</span>
                              {activity.location && (
                                <span className="flex items-center">
                                  <MapPinIcon className="w-3 h-3 mr-1" />
                                  {activity.location}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDateTime(activity.date)}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {sampleActivity.length === 0 && (
                      <div className="text-center py-8">
                        <ClockIcon className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                          No activity recorded
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}

        {children}
      </motion.div>

      {/* Reload Form Modal */}
      <AnimatePresence>
        {showReloadForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowReloadForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Reload Gift Card
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reload Amount
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={reloadAmount}
                    onChange={(e) => setReloadAmount(e.target.value)}
                    min="1"
                    step="1"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowReloadForm(false)}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleReload}
                    disabled={isLoading || !reloadAmount}
                    className="flex-1"
                  >
                    {isLoading ? 'Reloading...' : 'Reload'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transfer Form Modal */}
      <AnimatePresence>
        {showTransferForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowTransferForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Transfer Gift Card
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Recipient Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter recipient name"
                    value={transferRecipient.name}
                    onChange={(e) => setTransferRecipient(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Recipient Email
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter recipient email"
                    value={transferRecipient.email}
                    onChange={(e) => setTransferRecipient(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowTransferForm(false)}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleTransfer}
                    disabled={isLoading || !transferRecipient.name || !transferRecipient.email}
                    className="flex-1"
                  >
                    {isLoading ? 'Transferring...' : 'Transfer'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GiftCardDetail;