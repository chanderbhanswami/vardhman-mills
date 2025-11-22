'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, ChevronDown, Tag, Calendar, Info } from 'lucide-react';
import { Product } from '@/types/product.types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';

export interface ProductOffersProps {
  product: Product;
  className?: string;
}

interface Offer {
  id: string;
  title: string;
  description: string;
  code?: string;
  discount: string;
  validUntil?: Date;
  terms?: string[];
  minPurchase?: number;
  maxDiscount?: number;
  type: 'coupon' | 'deal' | 'bundle' | 'bank';
}

const ProductOffers: React.FC<ProductOffersProps> = ({
  className,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedOffer, setExpandedOffer] = useState<string | null>(null);

  // Mock offers data - in a real app this would come from props or API
  const offers: Offer[] = [
    {
      id: '1',
      title: 'Extra 10% off',
      description: 'Get extra 10% discount on this product',
      code: 'SAVE10',
      discount: '10%',
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      terms: [
        'Valid on minimum purchase of ₹999',
        'Maximum discount ₹500',
        'Valid once per user',
        'Cannot be combined with other offers',
      ],
      minPurchase: 999,
      maxDiscount: 500,
      type: 'coupon',
    },
    {
      id: '2',
      title: 'Bank Offer',
      description: '5% instant discount on HDFC Bank cards',
      discount: '5%',
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      terms: [
        'Valid on HDFC Bank Credit and Debit Cards',
        'Minimum transaction value ₹1499',
        'Maximum discount ₹1000',
      ],
      minPurchase: 1499,
      maxDiscount: 1000,
      type: 'bank',
    },
    {
      id: '3',
      title: 'Bundle Deal',
      description: 'Buy 2 or more items and save 15%',
      discount: '15%',
      terms: [
        'Valid on purchase of 2 or more items',
        'Discount applied automatically at checkout',
      ],
      type: 'bundle',
    },
  ];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Coupon code copied!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleExpand = (offerId: string) => {
    setExpandedOffer(expandedOffer === offerId ? null : offerId);
  };

  const getOfferBadgeColor = (type: Offer['type']) => {
    switch (type) {
      case 'coupon':
        return 'default';
      case 'bank':
        return 'secondary';
      case 'bundle':
        return 'outline';
      case 'deal':
        return 'destructive';
      default:
        return 'default';
    }
  };

  if (offers.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2">
        <Tag className="h-5 w-5 text-primary-600" />
        <h3 className="text-lg font-semibold">Available Offers</h3>
      </div>

      <div className="space-y-3">
        {offers.map((offer, index) => (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border rounded-lg p-4 space-y-3"
          >
            {/* Offer Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={getOfferBadgeColor(offer.type)}>
                    {offer.discount}
                  </Badge>
                  <h4 className="font-semibold text-gray-900">{offer.title}</h4>
                </div>
                <p className="text-sm text-gray-600">{offer.description}</p>
              </div>

              {offer.code && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyCode(offer.code!)}
                  className="flex items-center gap-2 min-w-[100px]"
                >
                  {copiedCode === offer.code ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>{offer.code}</span>
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Valid Until */}
            {offer.validUntil && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>
                  Valid until {offer.validUntil.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
            )}

            {/* Terms and Conditions */}
            {offer.terms && offer.terms.length > 0 && (
              <div>
                <button
                  onClick={() => toggleExpand(offer.id)}
                  className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <Info className="h-4 w-4" />
                  <span>Terms & Conditions</span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      expandedOffer === offer.id && 'rotate-180'
                    )}
                  />
                </button>

                <AnimatePresence>
                  {expandedOffer === offer.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <ul className="mt-2 space-y-1 text-sm text-gray-600">
                        {offer.terms.map((term, termIndex) => (
                          <li key={termIndex} className="flex items-start gap-2">
                            <span className="text-primary-600 mt-1.5">•</span>
                            <span>{term}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="flex items-start gap-2 p-4 bg-primary-50 border border-primary-200 rounded-lg">
        <Info className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-primary-900">
          Offers are automatically applied at checkout. You can use only one offer per order.
        </p>
      </div>
    </div>
  );
};

export default ProductOffers;
