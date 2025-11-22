/**
 * Gift Card Detail Page - Vardhman Mills  
 * View and purchase individual gift card
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// UI Components
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';

// Layout Components
import Breadcrumbs from '@/components/layout/Breadcrumbs';

// Common Components
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SEOHead from '@/components/common/SEOHead';

// Hooks
import { useToast } from '@/hooks/useToast';

// Types
import type { GiftCard } from '@/types/giftCard.types';

// Utils
import { formatCurrency } from '@/lib/utils';

// Icons
import {
  GiftIcon,
  HeartIcon,
  ShoppingCartIcon,
  ShareIcon,
  SparklesIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

interface GiftCardDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const AMOUNTS = [500, 1000, 2000, 5000, 10000];

export default function GiftCardDetailPage({ params }: GiftCardDetailPageProps) {
  const resolvedParams = React.use(params);
  const { id } = resolvedParams;
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [giftCard, setGiftCard] = useState<GiftCard | null>(null);
  const [selectedAmount, setSelectedAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchGiftCard = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock gift card data
        const mockGiftCard: GiftCard = {
          id: id,
          code: `GC${id.toUpperCase()}`,
          type: 'digital' as const,
          status: 'active' as const,
          title: 'Premium Birthday Gift Card',
          description: 'Perfect for birthday celebrations. Give the gift of choice with our premium gift cards.',
          design: {
            id: 'design-birthday',
            name: 'Birthday Special',
            description: 'Elegant birthday design',
            category: 'occasion' as const,
            template: {
              id: 'tmpl-birthday',
              name: 'Birthday Template',
              category: 'birthday',
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
            occasions: ['birthday'],
            themes: [],
            tags: ['birthday', 'celebration'],
            isSeasonalDesign: false,
            isLimitedEdition: false,
            accessibilityFeatures: [],
            usageCount: 150,
            popularityScore: 4.5,
            rating: 4.8,
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
          denomination: 1000,
          currency: 'INR' as const,
          balance: 1000,
          originalAmount: 1000,
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
            giftCardId: id,
            usageFrequency: { daily: 0, weekly: 0, monthly: 0, perTransaction: 0 },
            usagePattern: { peakHours: [], peakDays: [], seasonalTrends: [], patterns: [] },
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
            giftingSuccess: { wasRedeemed: false },
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
        };

        setGiftCard(mockGiftCard);
      } catch (error) {
        console.error('Failed to fetch gift card:', error);
        toast({
          title: 'Error',
          description: 'Failed to load gift card details',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchGiftCard();
  }, [id, toast]);

  const handlePurchase = () => {
    router.push(`/gift-cards/checkout?card=${id}&amount=${selectedAmount}&quantity=${quantity}`);
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? 'Removed from favorites' : 'Added to favorites',
      variant: 'success',
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: giftCard?.title || 'Gift Card',
        text: giftCard?.description || '',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied!',
        description: 'Share link copied to clipboard',
        variant: 'success',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!giftCard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-12">
            <GiftIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Gift Card Not Found</h2>
            <p className="text-gray-600 mb-6">This gift card does not exist</p>
            <Button onClick={() => router.push('/gift-cards')}>
              Browse Gift Cards
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const finalAmount = customAmount ? Number(customAmount) : selectedAmount;

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title={`${giftCard.title} | Vardhman Mills`}
        description={giftCard.description || ''}
        keywords={['gift card', 'digital gift', ...(giftCard.design.tags || [])]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Gift Cards', href: '/gift-cards' },
            { label: giftCard.title, href: `/gift-cards/${giftCard.id}` },
          ]}
        />

        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2 mt-4 mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gift Card Preview */}
          <div>
            <Card className="overflow-hidden">
              <div className="aspect-[3/2] bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 flex items-center justify-center relative">
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={handleToggleFavorite}
                    className="p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
                    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    {isFavorite ? (
                      <HeartIconSolid className="w-6 h-6 text-red-500" />
                    ) : (
                      <HeartIcon className="w-6 h-6 text-gray-600" />
                    )}
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
                    title="Share gift card"
                    aria-label="Share gift card"
                  >
                    <ShareIcon className="w-6 h-6 text-gray-600" />
                  </button>
                </div>

                <div className="text-center text-white">
                  <SparklesIcon className="w-16 h-16 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold mb-2">{formatCurrency(finalAmount)}</h2>
                  <p className="text-purple-100">Gift Card</p>
                </div>
              </div>
            </Card>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-4">
                <Badge className="bg-green-100 text-green-800">
                  {giftCard.design.occasions[0]?.toUpperCase()}
                </Badge>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span className="font-medium">{giftCard.design.rating}</span>
                  <span className="text-gray-500 text-sm">({giftCard.design.usageCount} sold)</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-white rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">365</p>
                  <p className="text-sm text-gray-600">Days Valid</p>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">Instant</p>
                  <p className="text-sm text-gray-600">Delivery</p>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">100%</p>
                  <p className="text-sm text-gray-600">Secure</p>
                </div>
              </div>
            </div>
          </div>

          {/* Purchase Options */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>{giftCard.title}</CardTitle>
                <p className="text-gray-600 mt-2">{giftCard.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-3">Select Amount</label>
                    <div className="grid grid-cols-3 gap-3">
                      {AMOUNTS.map(amount => (
                        <button
                          key={amount}
                          onClick={() => {
                            setSelectedAmount(amount);
                            setCustomAmount('');
                          }}
                          className={`p-4 rounded-lg border-2 font-semibold transition-all ${
                            selectedAmount === amount && !customAmount
                              ? 'border-purple-600 bg-purple-50 text-purple-700'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          {formatCurrency(amount)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Custom Amount (₹100 - ₹50,000)
                    </label>
                    <Input
                      type="number"
                      min="100"
                      max="50000"
                      placeholder="Enter custom amount"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Quantity</label>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        -
                      </Button>
                      <span className="text-2xl font-semibold w-16 text-center">{quantity}</span>
                      <Button
                        variant="outline"
                        onClick={() => setQuantity(Math.min(100, quantity + 1))}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-medium">Total</span>
                      <span className="text-2xl font-bold text-purple-600">
                        {formatCurrency(finalAmount * quantity)}
                      </span>
                    </div>

                    <Button onClick={handlePurchase} size="lg" className="w-full gap-2">
                      <ShoppingCartIcon className="w-5 h-5" />
                      Purchase Gift Card
                    </Button>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <p>✓ Valid for 365 days from purchase</p>
                    <p>✓ Can be used for all products</p>
                    <p>✓ Instant email delivery</p>
                    <p>✓ Free cancellation within 24 hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
