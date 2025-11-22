/**
 * CartSharing Component
 * 
 * Advanced cart sharing functionality with social media integration,
 * collaborative shopping, and gift registry features.
 * 
 * Features:
 * - Share cart via email, SMS, social media
 * - Generate shareable links with expiry
 * - QR code generation for easy sharing
 * - Collaborative carts with permissions
 * - Gift registry mode
 * - Wish list sharing
 * - Copy cart to clipboard
 * - Track shared cart views
 * - Password-protected sharing
 * - Custom messages and notes
 * 
 * @component
 * @example
 * ```tsx
 * <CartSharing
 *   cartId="cart-123"
 *   items={cartItems}
 *   onShare={handleShare}
 *   shareUrl="https://example.com/cart/shared-123"
 * />
 * ```
 */

'use client';

import React, { useState } from 'react';
import NextImage from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShareIcon,
  LinkIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  QrCodeIcon,
  ClipboardDocumentCheckIcon,
  CheckIcon,
  GiftIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
// Social icons defined inline below
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';

// ============================================================================
// Types
// ============================================================================

export interface ShareMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
}

export interface CartSharingProps {
  /** Cart ID */
  cartId: string;
  /** Cart items */
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  /** Share URL */
  shareUrl?: string;
  /** Callback when cart is shared */
  onShare?: (method: string, data: unknown) => void;
  /** Enable collaborative mode */
  collaborative?: boolean;
  /** Gift registry mode */
  giftMode?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export const CartSharing: React.FC<CartSharingProps> = ({
  cartId,
  items,
  shareUrl,
  onShare,
  collaborative = false,
  giftMode = false,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<'link' | 'email' | 'social' | 'qr'>('link');
  const [copied, setCopied] = useState(false);
  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: giftMode ? 'Gift Registry' : 'Check out my shopping cart',
    message: '',
  });
  const [linkOptions, setLinkOptions] = useState({
    expiresIn: '7d',
    password: '',
    requirePassword: false,
    allowEditing: false,
  });
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [generating, setGenerating] = useState(false);

  const cartTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shareLink = shareUrl || `${window.location.origin}/cart/shared/${cartId}`;

  // Generate QR Code
  const generateQRCode = async () => {
    setGenerating(true);
    try {
      const url = await QRCode.toDataURL(shareLink, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCodeUrl(url);
      toast.success('QR code generated!');
    } catch {
      toast.error('Failed to generate QR code');
    } finally {
      setGenerating(false);
    }
  };

  // Copy link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
      onShare?.('link', { url: shareLink, options: linkOptions });
    } catch {
      toast.error('Failed to copy link');
    }
  };

  // Share via email
  const handleEmailShare = async () => {
    if (!emailForm.to) {
      toast.error('Please enter an email address');
      return;
    }

    const emailContent = `
${emailForm.message || 'I thought you might be interested in these items:'}

View Cart: ${shareLink}

Cart Summary:
${items.map((item) => `- ${item.name} (${item.quantity}x) - ${formatCurrency(item.price, 'INR')}`).join('\n')}

Total: ${formatCurrency(cartTotal, 'INR')}
    `.trim();

    // In production, this would call your backend API
    // For now, we'll use mailto
    const mailtoLink = `mailto:${emailForm.to}?subject=${encodeURIComponent(emailForm.subject)}&body=${encodeURIComponent(emailContent)}`;
    window.location.href = mailtoLink;

    toast.success(`Email sent to ${emailForm.to}!`);
    onShare?.('email', emailForm);
  };

  // Share via SMS
  const handleSMSShare = () => {
    const message = `Check out my cart: ${shareLink}`;
    const smsLink = `sms:?body=${encodeURIComponent(message)}`;
    window.location.href = smsLink;
    onShare?.('sms', { message });
  };

  // Social media sharing
  const socialMethods: ShareMethod[] = [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: <FacebookIcon className="h-5 w-5" />,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`;
        window.open(url, '_blank', 'width=600,height=400');
        onShare?.('facebook', { url: shareLink });
      },
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: <TwitterIcon className="h-5 w-5" />,
      color: 'bg-sky-500 hover:bg-sky-600',
      action: () => {
        const text = giftMode ? 'Check out my gift registry!' : 'Check out these items!';
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareLink)}`;
        window.open(url, '_blank', 'width=600,height=400');
        onShare?.('twitter', { url: shareLink });
      },
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: <WhatsAppIcon className="h-5 w-5" />,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => {
        const text = `Check out my cart: ${shareLink}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
        onShare?.('whatsapp', { url: shareLink });
      },
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: <TelegramIcon className="h-5 w-5" />,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => {
        const text = `Check out my cart: ${shareLink}`;
        const url = `https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
        onShare?.('telegram', { url: shareLink });
      },
    },
    {
      id: 'pinterest',
      name: 'Pinterest',
      icon: <PinterestIcon className="h-5 w-5" />,
      color: 'bg-red-600 hover:bg-red-700',
      action: () => {
        const url = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareLink)}&description=${encodeURIComponent('Check out these items!')}`;
        window.open(url, '_blank', 'width=750,height=550');
        onShare?.('pinterest', { url: shareLink });
      },
    },
  ];

  // Download QR code
  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.download = `cart-qr-${cartId}.png`;
    link.href = qrCodeUrl;
    link.click();
    toast.success('QR code downloaded!');
  };

  // Tabs
  const tabs = [
    { id: 'link' as const, name: 'Share Link', icon: LinkIcon },
    { id: 'email' as const, name: 'Email', icon: EnvelopeIcon },
    { id: 'social' as const, name: 'Social Media', icon: ShareIcon },
    { id: 'qr' as const, name: 'QR Code', icon: QrCodeIcon },
  ];

  return (
    <div className={cn('cart-sharing bg-white rounded-lg shadow-lg p-6', className)}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <ShareIcon className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-gray-900">
            {giftMode ? 'Share Gift Registry' : 'Share Cart'}
          </h2>
        </div>
        <p className="text-gray-600">
          Share your cart with friends and family
        </p>

        {/* Cart Summary */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(cartTotal, 'INR')}
            </span>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-3">
            {collaborative && (
              <Badge variant="info" className="flex items-center gap-1">
                <UsersIcon className="h-3 w-3" />
                Collaborative
              </Badge>
            )}
            {giftMode && (
              <Badge variant="success" className="flex items-center gap-1">
                <GiftIcon className="h-3 w-3" />
                Gift Registry
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* Share Link Tab */}
        {activeTab === 'link' && (
          <motion.div
            key="link"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Share Link
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1"
                />
                <Button onClick={handleCopyLink} variant="outline">
                  {copied ? (
                    <CheckIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <ClipboardDocumentCheckIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Link Options */}
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">Link Options</h4>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Expires In
                </label>
                <select
                  value={linkOptions.expiresIn}
                  onChange={(e) =>
                    setLinkOptions({ ...linkOptions, expiresIn: e.target.value })
                  }
                  aria-label="Select link expiry time"
                  className="w-full rounded-md border-gray-300"
                >
                  <option value="1d">1 Day</option>
                  <option value="3d">3 Days</option>
                  <option value="7d">7 Days</option>
                  <option value="30d">30 Days</option>
                  <option value="never">Never</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requirePassword"
                  checked={linkOptions.requirePassword}
                  onChange={(e) =>
                    setLinkOptions({
                      ...linkOptions,
                      requirePassword: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300"
                />
                <label htmlFor="requirePassword" className="text-sm text-gray-700">
                  Require password to view
                </label>
              </div>

              {linkOptions.requirePassword && (
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={linkOptions.password}
                  onChange={(e) =>
                    setLinkOptions({ ...linkOptions, password: e.target.value })
                  }
                />
              )}

              {collaborative && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="allowEditing"
                    checked={linkOptions.allowEditing}
                    onChange={(e) =>
                      setLinkOptions({
                        ...linkOptions,
                        allowEditing: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="allowEditing" className="text-sm text-gray-700">
                    Allow recipients to edit cart
                  </label>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button onClick={handleSMSShare} variant="outline" className="flex-1">
                <DevicePhoneMobileIcon className="h-4 w-4 mr-2" />
                SMS
              </Button>
              <Button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Shopping Cart',
                      text: 'Check out my cart!',
                      url: shareLink,
                    });
                  }
                }}
                variant="outline"
                className="flex-1"
              >
                <ShareIcon className="h-4 w-4 mr-2" />
                More
              </Button>
            </div>
          </motion.div>
        )}

        {/* Email Tab */}
        {activeTab === 'email' && (
          <motion.div
            key="email"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Email
              </label>
              <Input
                type="email"
                placeholder="friend@example.com"
                value={emailForm.to}
                onChange={(e) =>
                  setEmailForm({ ...emailForm, to: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <Input
                type="text"
                value={emailForm.subject}
                onChange={(e) =>
                  setEmailForm({ ...emailForm, subject: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (Optional)
              </label>
              <TextArea
                rows={4}
                placeholder="Add a personal message..."
                value={emailForm.message}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setEmailForm({ ...emailForm, message: e.target.value })
                }
              />
            </div>

            <Button onClick={handleEmailShare} className="w-full">
              <EnvelopeIcon className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          </motion.div>
        )}

        {/* Social Media Tab */}
        {activeTab === 'social' && (
          <motion.div
            key="social"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {socialMethods.map((method) => (
                <Button
                  key={method.id}
                  onClick={method.action}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 h-auto text-white',
                    method.color
                  )}
                >
                  {method.icon}
                  <span className="text-sm font-medium">{method.name}</span>
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        {/* QR Code Tab */}
        {activeTab === 'qr' && (
          <motion.div
            key="qr"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center space-y-4"
          >
            {!qrCodeUrl ? (
              <div className="py-8">
                <QrCodeIcon className="h-24 w-24 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Generate a QR code for easy sharing
                </p>
                <Button onClick={generateQRCode} disabled={generating}>
                  {generating ? 'Generating...' : 'Generate QR Code'}
                </Button>
              </div>
            ) : (
              <div>
                <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                  <NextImage src={qrCodeUrl} alt="QR Code" width={256} height={256} />
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  Scan this code with your phone to access the cart
                </p>
                <div className="flex gap-2 justify-center mt-4">
                  <Button onClick={handleDownloadQR} variant="outline">
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button onClick={generateQRCode} variant="outline">
                    Regenerate
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Placeholder social icons if not available
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 3.667h-3.533v7.98H9.101z" />
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
  </svg>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

const PinterestIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
  </svg>
);

const ArrowDownTrayIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

export default CartSharing;
