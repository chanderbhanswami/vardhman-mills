/**
 * Gift Cards Page - Vardhman Mills
 * Browse, purchase, and manage gift cards
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// UI Components
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Tabs, { TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

// Layout Components
import Breadcrumbs from '@/components/layout/Breadcrumbs';

// Common Components
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import SEOHead from '@/components/common/SEOHead';

// Gift Card Components
import {
  GiftCardList,
  GiftCardForm,
  GiftCardSkeleton,
} from '@/components/gift-cards';

// Hooks
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/components/providers';

// Types
import type { GiftCard } from '@/types/giftCard.types';

// Utils
import { formatCurrency } from '@/lib/utils';

// Icons
import {
  GiftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CreditCardIcon,
  SparklesIcon,
  HeartIcon,
  CakeIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';

// No need for local extension - use base type directly

interface GiftCardFilters {
  occasion: string;
  minAmount: number;
  maxAmount: number;
  category: string;
  search: string;
}

const OCCASIONS = [
  { value: 'all', label: 'All Occasions', icon: GiftIcon },
  { value: 'birthday', label: 'Birthday', icon: CakeIcon },
  { value: 'wedding', label: 'Wedding', icon: HeartIcon },
  { value: 'graduation', label: 'Graduation', icon: AcademicCapIcon },
  { value: 'corporate', label: 'Corporate', icon: BriefcaseIcon },
  { value: 'thank_you', label: 'Thank You', icon: SparklesIcon },
];

const AMOUNTS = [500, 1000, 2000, 5000, 10000];

export default function GiftCardsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('browse');
  const [showBalanceCheck, setShowBalanceCheck] = useState(false);
  const [showRedeemDialog, setShowRedeemDialog] = useState(false);
  const [balanceCheckCode, setBalanceCheckCode] = useState('');
  const [redeemCode, setRedeemCode] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const [filters, setFilters] = useState<GiftCardFilters>({
    occasion: 'all',
    minAmount: 0,
    maxAmount: 50000,
    category: 'all',
    search: '',
  });

  const loadGiftCardsCallback = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockGiftCards: GiftCard[] = OCCASIONS.slice(1).map((occasion, index) => ({
        id: `gc-${index + 1}`,
        code: `GC${1000 + index}`,
        type: 'digital' as const,
        status: 'active' as const,
        title: `${occasion.label} Gift Card`,
        description: `Perfect for ${occasion.label.toLowerCase()} celebrations`,
        design: {
          id: `design-${index}`,
          name: `${occasion.label} Special`,
          description: '',
          category: 'occasion' as const,
          template: {
            id: occasion.value,
            name: occasion.value,
            category: 'occasion',
            layout: {
              width: 600,
              height: 400,
              dpi: 300,
              format: 'landscape' as const,
              margins: { top: 20, right: 20, bottom: 20, left: 20 },
            },
            elements: [],
            responsive: true,
            customizable: true,
          },
          foregroundElements: [],
          colorScheme: {
            primary: '#8B5CF6',
            secondary: '#6D28D9',
            accent: '#A78BFA',
            background: '#FFFFFF',
            text: '#1F2937',
            border: '#E5E7EB',
          },
          typography: {
            fontFamily: 'Inter',
            fontSize: '16px',
            fontWeight: 400,
            lineHeight: 1.5,
            letterSpacing: '0',
            textAlign: 'center' as const,
          },
          customizationOptions: [],
          allowCustomText: true,
          allowCustomImages: false,
          allowRecipientPhoto: false,
          occasions: [occasion.value as 'birthday' | 'wedding' | 'graduation' | 'thank_you'],
          themes: [],
          tags: [],
          isSeasonalDesign: false,
          isLimitedEdition: false,
          accessibilityFeatures: [],
          usageCount: 0,
          popularityScore: 0,
          rating: 0,
          status: 'active' as const,
          isActive: true,
          isDefault: false,
          createdBy: 'system',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        customization: {
          hasPersonalMessage: false,
          previewGenerated: false,
          approvalRequired: false,
        },
        denomination: AMOUNTS[index % AMOUNTS.length],
        currency: 'INR' as const,
        balance: AMOUNTS[index % AMOUNTS.length],
        originalAmount: AMOUNTS[index % AMOUNTS.length],
        restrictions: {
          allowPartialRedemption: true,
          allowReloading: true,
          allowTransfer: false,
          expirationExtensible: false,
          usageLocations: [],
          excludedDays: [],
          combinableWithOffers: true,
        },
        applicableProducts: [],
        applicableCategories: [],
        excludedProducts: [],
        excludedCategories: [],
        transactions: [],
        totalUsed: 0,
        usageCount: 0,
        securityFeatures: {
          hasPIN: false,
          pinRequired: false,
          pinAttempts: 0,
          maxPinAttempts: 3,
          isLockedDueToPIN: false,
          twoFactorEnabled: false,
          phoneVerification: false,
          emailVerification: false,
          identityVerification: false,
          securityQuestions: [],
          fraudMonitoring: true,
          velocityChecks: true,
          locationChecks: true,
          deviceTracking: true,
          encryptionLevel: 'standard' as const,
          tokenization: false,
          backupCodes: [],
          recoveryMethods: [],
        },
        fraudChecks: [],
        deliveryMethod: 'email' as const,
        deliveryStatus: 'pending' as const,
        deliveryDetails: {
          method: 'email' as const,
          scheduledDelivery: false,
          recipientInfo: {
            name: '',
            preferredContactMethod: 'email' as const,
          },
          deliveryAttempts: [],
          confirmationRequired: false,
          confirmationReceived: false,
          deliveryNotifications: [],
          reminderNotifications: [],
        },
        sourceChannel: 'website' as const,
        analytics: {
          giftCardId: `gc-${index + 1}`,
          usageFrequency: {
            daily: 0,
            weekly: 0,
            monthly: 0,
            perTransaction: 0,
          },
          usagePattern: {
            peakHours: [],
            peakDays: [],
            seasonalTrends: [],
            patterns: [],
          },
          spendingBehavior: {
            averageTransaction: 0,
            medianTransaction: 0,
            largestTransaction: 0,
            smallestTransaction: 0,
            transactionDistribution: {},
          },
          averageTransactionAmount: 0,
          preferredUsageTimes: [],
          seasonalUsage: [],
          usageChannels: [],
          preferredChannels: [],
          preferredCategories: [],
          productAffinities: [],
          usageLocations: [],
          travelUsage: [],
          giftingSuccess: {
            wasRedeemed: false,
          },
          churnProbability: 0,
          lifetimeValuePrediction: 0,
          recommendedActions: [],
          lastUpdated: new Date().toISOString(),
          dataQuality: {
            completeness: 0,
            accuracy: 0,
            timeliness: 0,
            consistency: 0,
            lastValidation: new Date().toISOString(),
          },
        },
        termsAccepted: false,
        termsVersion: '1.0',
        complianceData: {
          region: 'IN',
          regulations: [],
          complianceScore: 100,
          violations: [],
          remedialActions: [],
        },
        isActive: true,
        neverExpires: false,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      setGiftCards(mockGiftCards);
    } catch (error) {
      console.error('Failed to load gift cards:', error);
      toast({
        title: 'Error',
        description: 'Failed to load gift cards',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadGiftCardsCallback();
  }, [loadGiftCardsCallback]);

  useEffect(() => {
    const occasion = searchParams?.get('occasion');
    if (occasion) {
      setFilters(prev => ({ ...prev, occasion }));
    }
  }, [searchParams]);

  const filteredGiftCards = useMemo(() => {
    return giftCards.filter(card => {
      const matchesOccasion = filters.occasion === 'all' || 
        card.design.occasions.some(occ => occ === filters.occasion);
      const matchesAmount = card.denomination >= filters.minAmount && 
        card.denomination <= filters.maxAmount;
      const matchesSearch = !filters.search || 
        card.design.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        card.code.toLowerCase().includes(filters.search.toLowerCase());
      
      return matchesOccasion && matchesAmount && matchesSearch;
    });
  }, [giftCards, filters]);

  const handlePurchaseCard = useCallback((card: GiftCard) => {
    router.push(`/gift-cards/${card.id}`);
  }, [router]);

  const handleCheckBalance = useCallback(async () => {
    if (!balanceCheckCode.trim()) {
      toast({
        title: 'Required',
        description: 'Please enter a gift card code',
        variant: 'destructive',
      });
      return;
    }

    setIsChecking(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Balance Retrieved',
        description: `Your gift card balance is ${formatCurrency(5000)}`,
        variant: 'success',
      });
      
      setShowBalanceCheck(false);
      setBalanceCheckCode('');
    } catch (error) {
      console.error('Failed to check balance:', error);
      toast({
        title: 'Error',
        description: 'Failed to check balance',
        variant: 'destructive',
      });
    } finally {
      setIsChecking(false);
    }
  }, [balanceCheckCode, toast]);

  const handleRedeemCard = useCallback(async () => {
    if (!redeemCode.trim()) {
      toast({
        title: 'Required',
        description: 'Please enter a gift card code',
        variant: 'destructive',
      });
      return;
    }

    setIsChecking(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: 'Gift card redeemed successfully',
        variant: 'success',
      });
      
      setShowRedeemDialog(false);
      setRedeemCode('');
    } catch (error) {
      console.error('Failed to redeem:', error);
      toast({
        title: 'Error',
        description: 'Failed to redeem gift card',
        variant: 'destructive',
      });
    } finally {
      setIsChecking(false);
    }
  }, [redeemCode, toast]);

  const handleFilterChange = useCallback((key: keyof GiftCardFilters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <GiftCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title="Gift Cards | Vardhman Mills"
        description="Perfect gifts for every occasion. Buy digital gift cards for your loved ones."
        keywords={['gift cards', 'digital gifts', 'occasion gifts', 'corporate gifts']}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Gift Cards', href: '/gift-cards' },
          ]}
        />
        
        <div className="flex items-center justify-between mt-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <GiftIcon className="w-8 h-8 text-purple-600" />
              Gift Cards
            </h1>
            <p className="mt-2 text-gray-600">
              Perfect gifts for every occasion. Send joy, give choice.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowBalanceCheck(true)}
              className="gap-2"
            >
              <CreditCardIcon className="w-5 h-5" />
              Check Balance
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowRedeemDialog(true)}
              className="gap-2"
            >
              <SparklesIcon className="w-5 h-5" />
              Redeem Card
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          {OCCASIONS.map(occasion => {
            const Icon = occasion.icon;
            return (
              <Button
                key={occasion.value}
                variant={filters.occasion === occasion.value ? 'default' : 'outline'}
                onClick={() => handleFilterChange('occasion', occasion.value)}
                className="gap-2"
              >
                <Icon className="w-4 h-4" />
                {occasion.label}
              </Button>
            );
          })}
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Search</label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search gift cards..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Amount Range</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minAmount}
                    onChange={(e) => handleFilterChange('minAmount', Number(e.target.value))}
                  />
                  <span>-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxAmount}
                    onChange={(e) => handleFilterChange('maxAmount', Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex items-end gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  onClick={() => setViewMode('grid')}
                  className="flex-1"
                >
                  <Squares2X2Icon className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  onClick={() => setViewMode('list')}
                  className="flex-1"
                >
                  <ListBulletIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="browse">Browse Cards</TabsTrigger>
            <TabsTrigger value="my-cards">
              My Cards {user && <Badge className="ml-2">3</Badge>}
            </TabsTrigger>
            <TabsTrigger value="corporate">Corporate Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            {filteredGiftCards.length === 0 ? (
              <EmptyState
                title="No gift cards found"
                description="Try adjusting your filters"
                action={{
                  label: 'Clear Filters',
                  onClick: () => setFilters({
                    occasion: 'all',
                    minAmount: 0,
                    maxAmount: 50000,
                    category: 'all',
                    search: '',
                  }),
                }}
              />
            ) : (
              <GiftCardList
                giftCards={filteredGiftCards.map(card => ({
                  ...card,
                  isFavorite: false,
                  redemptionCount: 0,
                  lastUsedAt: card.lastUsedAt ? new Date(card.lastUsedAt) : undefined,
                }))}
                viewMode={viewMode}
                onViewDetails={handlePurchaseCard}
              />
            )}
          </TabsContent>

          <TabsContent value="my-cards">
            {user ? (
              <div className="space-y-4">
                <div className="text-center py-12">
                  <CreditCardIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Your Gift Cards</h3>
                  <p className="text-gray-600 mb-6">Manage and track your gift cards</p>
                </div>
              </div>
            ) : (
              <EmptyState
                title="Login Required"
                description="Please login to view your gift cards"
                action={{
                  label: 'Login',
                  onClick: () => router.push('/auth/login'),
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="corporate">
            <Card>
              <CardHeader>
                <CardTitle>Corporate Bulk Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BriefcaseIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Bulk Gift Cards for Business</h3>
                  <p className="text-gray-600 mb-6">
                    Perfect for employee rewards, client appreciation, and corporate gifting
                  </p>
                  <GiftCardForm />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {showBalanceCheck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Check Gift Card Balance</CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Enter your gift card code to check the remaining balance
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Enter gift card code"
                  value={balanceCheckCode}
                  onChange={(e) => setBalanceCheckCode(e.target.value)}
                />

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowBalanceCheck(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCheckBalance}
                    disabled={isChecking}
                    className="flex-1"
                  >
                    {isChecking ? <LoadingSpinner size="sm" /> : 'Check Balance'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showRedeemDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Redeem Gift Card</CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Enter your gift card code to redeem and add to your account
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Enter gift card code"
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value)}
                />

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowRedeemDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRedeemCard}
                    disabled={isChecking}
                    className="flex-1"
                  >
                    {isChecking ? <LoadingSpinner size="sm" /> : 'Redeem'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
