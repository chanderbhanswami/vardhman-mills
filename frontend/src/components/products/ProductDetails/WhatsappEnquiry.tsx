'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Product } from '@/types/product.types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export interface WhatsappEnquiryProps {
  product: Product;
  phoneNumber?: string;
  className?: string;
  variant?: 'default' | 'floating';
  customMessage?: string;
}

const WhatsappEnquiry: React.FC<WhatsappEnquiryProps> = ({
  product,
  phoneNumber = '+911234567890', // Default phone number - should be configured
  className,
  variant = 'default',
  customMessage,
}) => {
  const handleWhatsAppClick = () => {
    if (typeof window === 'undefined') return;

    const productUrl = `${window.location.origin}/products/${product.slug}`;
    
    const message = customMessage || 
      `Hi, I'm interested in the following product:\n\n` +
      `*${product.name}*\n` +
      `SKU: ${product.sku}\n` +
      `Price: ₹${product.pricing.basePrice.amount}\n\n` +
      `Product Link: ${productUrl}\n\n` +
      `Could you please provide more information?`;

    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    toast.success('Opening WhatsApp...');
  };

  if (variant === 'floating') {
    return (
      <button
        onClick={handleWhatsAppClick}
        className={cn(
          'fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110',
          className
        )}
        aria-label="WhatsApp enquiry"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={handleWhatsAppClick}
      className={cn(
        'flex items-center gap-2 border-green-500 text-green-600 hover:bg-green-50',
        className
      )}
    >
      <MessageCircle className="h-4 w-4" />
      <span>WhatsApp Enquiry</span>
    </Button>
  );
};

export default WhatsappEnquiry;
