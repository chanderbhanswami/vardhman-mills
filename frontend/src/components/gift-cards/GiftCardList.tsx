'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  Squares2X2Icon,
  ListBulletIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  GiftIcon,
  StarIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';
import { format } from 'date-fns';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import GiftCardCard from './GiftCardCard';
import GiftCardSkeleton from './GiftCardSkeleton';
import { 
  GiftCard, 
  GiftCardStatus, 
  GiftCardType
} from '../../types/giftCard.types';

// Additional local interface for list-specific fields
interface LocalGiftCardFields {
  isFavorite: boolean;
  redemptionCount: number;
  totalRedemptions?: number;
  lastUsedAt?: Date;
  metadata?: Record<string, unknown>;
}

type ExtendedGiftCard = GiftCard & LocalGiftCardFields;

interface GiftCardListProps {
  giftCards?: ExtendedGiftCard[];
  loading?: boolean;
  error?: string | null;
  viewMode?: 'grid' | 'list';
  enableSearch?: boolean;
  enableFilters?: boolean;
  enableSorting?: boolean;
  enableBulkActions?: boolean;
  enableFavorites?: boolean;
  enableQuickActions?: boolean;
  itemsPerPage?: number;
  defaultSortBy?: string;
  defaultSortOrder?: 'asc' | 'desc';
  onView?: (giftCard: ExtendedGiftCard) => void;
  onEdit?: (giftCard: GiftCard) => void;
  onDelete?: (giftCard: ExtendedGiftCard) => void;
  onViewDetails?: (giftCard: GiftCard) => void;
  onResend?: (giftCard: GiftCard) => void;
  onReactivate?: (giftCard: GiftCard) => void;
  onToggleFavorite?: (giftCard: ExtendedGiftCard) => void;
  onBulkAction?: (action: string, giftCardIds: string[]) => void;
  onCreate?: () => void;
  className?: string;
}

// Mock data for development
const mockGiftCards: ExtendedGiftCard[] = [
  {
    id: 'gc-001',
    code: 'GIFT-2024-001',
    type: 'digital' as GiftCardType,
    title: 'Birthday Gift Card',
    description: 'A special birthday gift card for someone special',
    denomination: 5000,
    currency: 'INR',
    balance: 4500,
    originalAmount: 5000,
    design: {
      id: 'birthday-1',
      name: 'Birthday Design',
      category: 'occasion' as const,
      template: {
        id: 'tmpl-1',
        name: 'Birthday Template',
        category: 'birthday',
        layout: {
          width: 300,
          height: 200,
          dpi: 300,
          format: 'landscape' as const,
          margins: { top: 10, right: 10, bottom: 10, left: 10 }
        },
        elements: [],
        responsive: true,
        customizable: true
      },
      backgroundImage: {
        id: 'img-1',
        url: '/api/placeholder/300/200',
        alt: 'Birthday background',
        width: 300,
        height: 200
      },
      foregroundElements: [],
      colorScheme: {
        primary: '#ff6b6b',
        secondary: '#4ecdc4',
        accent: '#45b7d1',
        background: '#f7f7f7',
        text: '#333333',
        border: '#e0e0e0'
      },
      typography: {
        fontFamily: 'Inter',
        fontSize: '16px',
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: '0px',
        textAlign: 'center' as const
      },
      customizationOptions: [],
      allowCustomText: true,
      allowCustomImages: false,
      allowRecipientPhoto: false,
      occasions: ['birthday'],
      themes: ['festive'],
      tags: ['celebration', 'birthday'],
      isSeasonalDesign: false,
      isLimitedEdition: false,
      accessibilityFeatures: [],
      usageCount: 15,
      popularityScore: 85,
      rating: 4.5,
      status: 'active',
      isActive: true,
      isDefault: false,
      createdBy: 'user-admin',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-15')
    },
    customization: {
      hasPersonalMessage: true,
      personalMessage: 'Happy Birthday!',
      previewGenerated: false,
      approvalRequired: false
    },
    status: 'active' as GiftCardStatus,
    isActive: true,
    expiresAt: new Date('2024-12-31'),
    neverExpires: false,
    restrictions: {
      allowPartialRedemption: true,
      allowReloading: false,
      allowTransfer: true,
      expirationExtensible: false,
      usageLocations: [],
      excludedDays: [],
      combinableWithOffers: true
    },
    applicableProducts: [],
    applicableCategories: [],
    excludedProducts: [],
    excludedCategories: [],
    transactions: [],
    totalUsed: 500,
    usageCount: 1,
    securityFeatures: {
      hasPIN: false,
      pinRequired: false,
      pinAttempts: 0,
      maxPinAttempts: 3,
      isLockedDueToPIN: false,
      twoFactorEnabled: false,
      phoneVerification: false,
      emailVerification: true,
      identityVerification: false,
      securityQuestions: [],
      fraudMonitoring: true,
      velocityChecks: true,
      locationChecks: false,
      deviceTracking: false,
      encryptionLevel: 'standard',
      tokenization: true,
      backupCodes: [],
      recoveryMethods: []
    },
    fraudChecks: [],
    deliveryMethod: 'email',
    deliveryStatus: 'delivered',
    deliveryDetails: {
      method: 'email',
      scheduledDelivery: false,
      recipientInfo: {
        name: 'John Doe',
        email: 'john@example.com',
        preferredContactMethod: 'email'
      },
      deliveryAttempts: [],
      confirmationRequired: false,
      confirmationReceived: true,
      deliveryNotifications: [],
      reminderNotifications: []
    },
    sourceChannel: 'website',
    recipientEmail: 'john@example.com',
    giftMessage: 'Happy Birthday, John!',
    senderName: 'Jane Smith',
    analytics: {
      giftCardId: 'gc-001',
      usageFrequency: {
        daily: 0,
        weekly: 1,
        monthly: 1,
        perTransaction: 1
      },
      usagePattern: {
        peakHours: [14, 15, 16],
        peakDays: ['Saturday', 'Sunday'],
        seasonalTrends: ['Summer'],
        patterns: ['weekend_shopping']
      },
      spendingBehavior: {
        averageTransaction: 500,
        medianTransaction: 500,
        largestTransaction: 500,
        smallestTransaction: 500,
        transactionDistribution: { '500': 1 }
      },
      timeToFirstUse: 7,
      averageTransactionAmount: 500,
      preferredUsageTimes: [],
      seasonalUsage: [],
      usageChannels: [],
      preferredChannels: ['website'],
      preferredCategories: [],
      productAffinities: [],
      usageLocations: [],
      travelUsage: [],
      giftingSuccess: {
        wasRedeemed: true,
        timeToRedemption: 7,
        recipientSatisfaction: 5,
        giftingOccasion: 'birthday'
      },
      churnProbability: 0.1,
      lifetimeValuePrediction: 5000,
      recommendedActions: [],
      lastUpdated: new Date(),
      dataQuality: {
        completeness: 0.95,
        accuracy: 0.98,
        timeliness: 0.99,
        consistency: 0.97,
        lastValidation: new Date()
      }
    },
    termsAccepted: true,
    termsVersion: '1.0',
    complianceData: {
      region: 'IN',
      regulations: ['GDPR', 'PCI-DSS'],
      complianceScore: 95,
      violations: [],
      remedialActions: []
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    // Local fields
    isFavorite: false,
    redemptionCount: 1
  }
];

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'expired', label: 'Expired' },
  { value: 'used', label: 'Used' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'fraudulent', label: 'Fraudulent' },
  { value: 'locked', label: 'Locked' }
];

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'digital', label: 'Digital' },
  { value: 'physical', label: 'Physical' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'promotional', label: 'Promotional' },
  { value: 'reward', label: 'Reward' },
  { value: 'loyalty', label: 'Loyalty' }
];

const sortOptions = [
  { value: 'createdAt', label: 'Created Date' },
  { value: 'updatedAt', label: 'Last Updated' },
  { value: 'denomination', label: 'Amount' },
  { value: 'balance', label: 'Balance' },
  { value: 'expiresAt', label: 'Expiry Date' },
  { value: 'status', label: 'Status' },
  { value: 'recipientEmail', label: 'Recipient' }
];

const GiftCardList: React.FC<GiftCardListProps> = ({
  giftCards = mockGiftCards,
  loading = false,
  error = null,
  viewMode: initialViewMode = 'grid',
  enableSearch = true,
  enableFilters = true,
  enableSorting = true,
  enableBulkActions = false,
  enableFavorites = false,
  enableQuickActions = true,
  itemsPerPage = 12,
  defaultSortBy = 'createdAt',
  defaultSortOrder = 'desc',
  onView,
  onEdit,
  onDelete,
  onToggleFavorite,
  onBulkAction,
  onCreate,
  className
}) => {
  // State management
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [sortBy, setSortBy] = useState(defaultSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultSortOrder);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGiftCards, setSelectedGiftCards] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Filter and search logic
  const filteredGiftCards = useMemo(() => {
    return giftCards.filter(card => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = !query || 
        card.code.toLowerCase().includes(query) ||
        card.title?.toLowerCase().includes(query) ||
        card.description?.toLowerCase().includes(query) ||
        card.recipientEmail?.toLowerCase().includes(query) ||
        card.senderName?.toLowerCase().includes(query);

      const matchesStatus = !selectedStatus || card.status === selectedStatus;
      const matchesType = !selectedType || card.type === selectedType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [giftCards, searchQuery, selectedStatus, selectedType]);

  // Sorting logic
  const sortedGiftCards = useMemo(() => {
    const sorted = [...filteredGiftCards].sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortBy) {
        case 'denomination':
        case 'balance':
          aValue = a[sortBy] || 0;
          bValue = b[sortBy] || 0;
          break;
        case 'expiresAt':
          aValue = a.expiresAt || new Date('2099-12-31');
          bValue = b.expiresAt || new Date('2099-12-31');
          break;
        case 'createdAt':
        case 'updatedAt':
          aValue = a[sortBy];
          bValue = b[sortBy];
          break;
        default:
          aValue = String(a[sortBy as keyof ExtendedGiftCard] || '');
          bValue = String(b[sortBy as keyof ExtendedGiftCard] || '');
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredGiftCards, sortBy, sortOrder]);

  // Pagination logic
  const totalPages = Math.ceil(sortedGiftCards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedGiftCards = sortedGiftCards.slice(startIndex, endIndex);

  // Event handlers
  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const handleStatusFilter = useCallback((status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  }, []);

  const handleTypeFilter = useCallback((type: string) => {
    setSelectedType(type);
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback((field: string) => {
    if (field === sortBy) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  }, [sortBy]);

  const handleBulkSelect = useCallback((giftCardId: string, selected: boolean) => {
    setSelectedGiftCards(prev => 
      selected 
        ? [...prev, giftCardId]
        : prev.filter(id => id !== giftCardId)
    );
  }, []);

  const handleBulkAction = useCallback((action: string) => {
    if (onBulkAction && selectedGiftCards.length > 0) {
      onBulkAction(action, selectedGiftCards);
      setSelectedGiftCards([]);
    }
  }, [onBulkAction, selectedGiftCards]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    setSelectedGiftCards([]);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedStatus('');
    setSelectedType('');
    setSortBy(defaultSortBy);
    setSortOrder(defaultSortOrder);
    setCurrentPage(1);
    setSelectedGiftCards([]);
  }, [defaultSortBy, defaultSortOrder]);

  // Status badge variant mapping
  const getStatusVariant = (status: GiftCardStatus) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'expired': return 'warning';
      case 'used': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'fraudulent': return 'destructive';
      case 'locked': return 'destructive';
      default: return 'default';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={clsx('space-y-6', className)}>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
        </div>
        <GiftCardSkeleton />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={clsx('text-center py-12', className)}>
        <div className="text-red-500 mb-4">
          <XCircleIcon className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Error Loading Gift Cards
        </h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Gift Cards
          </h2>
          <p className="text-gray-500 mt-1">
            {sortedGiftCards.length} of {giftCards.length} gift cards
          </p>
        </div>

        {onCreate && (
          <Button onClick={onCreate} className="gap-2">
            <PlusIcon className="w-4 h-4" />
            Create Gift Card
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      {(enableSearch || enableFilters || enableSorting) && (
        <Card className="p-4">
          <div className="space-y-4">
            {/* Search and View Toggle */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* Search */}
              {enableSearch && (
                <div className="relative flex-1 max-w-md">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search gift cards..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              )}

              <div className="flex gap-2">
                {/* Filter Toggle */}
                {enableFilters && (
                  <Button
                    variant={showFilters ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2"
                  >
                    <FunnelIcon className="w-4 h-4" />
                    Filters
                  </Button>
                )}

                {/* View Mode Toggle */}
                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Squares2X2Icon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <ListBulletIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Filters */}
            <AnimatePresence>
              {showFilters && enableFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                    {/* Status Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => handleStatusFilter(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        aria-label="Filter by status"
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Type Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Type</label>
                      <select
                        value={selectedType}
                        onChange={(e) => handleTypeFilter(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        aria-label="Filter by type"
                      >
                        {typeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sort */}
                    {enableSorting && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Sort By</label>
                        <div className="flex gap-2">
                          <select
                            value={sortBy}
                            onChange={(e) => handleSort(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            aria-label="Sort by field"
                          >
                            {sortOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                          >
                            <ArrowsUpDownIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Clear Filters */}
                    <div className="flex items-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <XMarkIcon className="w-4 h-4 mr-1" />
                        Clear
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      )}

      {/* Bulk Actions */}
      {enableBulkActions && selectedGiftCards.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">
              {selectedGiftCards.length} gift card{selectedGiftCards.length === 1 ? '' : 's'} selected
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('activate')}
              >
                Activate
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('deactivate')}
              >
                Deactivate
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleBulkAction('delete')}
              >
                Delete
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Gift Cards Grid/List */}
      {paginatedGiftCards.length === 0 ? (
        <Card className="p-12 text-center">
          <GiftIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Gift Cards Found
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || selectedStatus || selectedType
              ? 'No gift cards match your current filters.'
              : 'Get started by creating your first gift card.'}
          </p>
          {onCreate && (
            <Button onClick={onCreate}>
              Create Gift Card
            </Button>
          )}
        </Card>
      ) : (
        <div className={clsx(
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        )}>
          {viewMode === 'grid' ? (
            paginatedGiftCards.map((card) => (
              <GiftCardCard
                key={card.id}
                giftCard={card}
                onView={onView ? (card: GiftCard) => onView(card as ExtendedGiftCard) : undefined}
                onEdit={onEdit}
                onDelete={onDelete ? (card: GiftCard) => onDelete(card as ExtendedGiftCard) : undefined}
              />
            ))
          ) : (
            paginatedGiftCards.map((giftCard) => (
              <Card key={giftCard.id} className="p-4">
                <div className="flex items-center gap-4">
                  {/* Bulk Select */}
                  {enableBulkActions && (
                    <input
                      type="checkbox"
                      checked={selectedGiftCards.includes(giftCard.id)}
                      onChange={(e) => handleBulkSelect(giftCard.id, e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      aria-label={`Select gift card ${giftCard.code}`}
                    />
                  )}

                  {/* Gift Card Preview */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      {giftCard.design?.backgroundImage && (
                        <Image
                          src={giftCard.design.backgroundImage.url}
                          alt={giftCard.design.name}
                          width={64}
                          height={40}
                          className="w-16 h-10 object-cover rounded-lg"
                        />
                      )}
                      {!giftCard.design?.backgroundImage && (
                        <GiftIcon className="w-6 h-6 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Gift Card Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {giftCard.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={getStatusVariant(giftCard.status)}
                          className="capitalize"
                        >
                          {giftCard.status}
                        </Badge>
                        {enableFavorites && (
                          <button
                            onClick={() => onToggleFavorite?.(giftCard)}
                            className="text-gray-400 hover:text-yellow-500 transition-colors"
                          >
                            {giftCard.isFavorite ? (
                              <StarIconSolid className="w-5 h-5 text-yellow-500" />
                            ) : (
                              <StarIcon className="w-5 h-5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Code:</span>
                        <div className="text-gray-900">{giftCard.code}</div>
                      </div>
                      <div>
                        <span className="font-medium">Amount:</span>
                        <div className="text-gray-900">₹{giftCard.denomination.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="font-medium">Balance:</span>
                        <div className="text-gray-900">₹{giftCard.balance.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="font-medium">Expires:</span>
                        <div className="text-gray-900">
                          {giftCard.neverExpires 
                            ? 'Never' 
                            : giftCard.expiresAt 
                              ? format(giftCard.expiresAt, 'MMM dd, yyyy')
                              : 'Not set'
                          }
                        </div>
                      </div>
                    </div>

                    {giftCard.recipientEmail && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Recipient:</span>
                        <span className="ml-1">{giftCard.recipientEmail}</span>
                      </div>
                    )}
                  </div>

                  {/* Status Indicator */}
                  <div className="flex-shrink-0">
                    {giftCard.status === 'used' ? (
                      <CheckCircleIcon className="w-6 h-6 text-green-500" />
                    ) : giftCard.balance === 0 ? (
                      <XCircleIcon className="w-6 h-6 text-red-500" />
                    ) : giftCard.expiresAt && giftCard.expiresAt < new Date() ? (
                      <ClockIcon className="w-6 h-6 text-amber-500" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {enableQuickActions && (
                    <div className="flex gap-2">
                      {onView && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onView(giftCard)}
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                      )}
                      {onEdit && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEdit(giftCard)}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDelete(giftCard)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, sortedGiftCards.length)} of {sortedGiftCards.length} results
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                const isActive = page === currentPage;
                return (
                  <Button
                    key={page}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default GiftCardList;