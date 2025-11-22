/**
 * Quick Order Page - Vardhman Mills
 * Bulk ordering system for B2B customers
 */

'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// UI Components
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Alert, { AlertDescription } from '@/components/ui/Alert';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import Select from '@/components/ui/Select';
import Checkbox from '@/components/ui/Checkbox';
import Tooltip from '@/components/ui/Tooltip';

// Layout Components
import Breadcrumbs from '@/components/layout/Breadcrumbs';

// Common Components
import {
  LoadingSpinner,
  ErrorBoundary,
  SEOHead,
  BackToTop,
} from '@/components/common';

// Order Components (can be used for quick orders)
import {
  OrderCard,
  OrderInfo,
  OrderItems,
  OrderEmpty,
  OrderStats,
} from '@/components/orders';

// Hooks
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/components/providers';
import { useCart } from '@/hooks/useCart';

// Types
import type { Product } from '@/types/product.types';
import type { Order } from '@/types/cart.types';

// Utils
import { cn, formatCurrency } from '@/lib/utils';

// Icons
import {
  PlusIcon,
  XMarkIcon,
  DocumentArrowUpIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowDownTrayIcon,
  ClipboardDocumentIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface QuickOrderItem {
  id: string;
  sku: string;
  productName: string;
  quantity: number;
  price?: number;
  error?: string;
  isValid?: boolean;
}

export default function QuickOrderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const { addToCart, items: cartItems } = useCart();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Category filter state - used for filtering available SKUs
  const [selectedCategory, setSelectedCategory] = useState('all');
  // Include out of stock items state - used for checkbox
  const [includeOutOfStock, setIncludeOutOfStock] = useState(false);

  // State
  const [orderItems, setOrderItems] = useState<QuickOrderItem[]>([
    { id: '1', sku: '', productName: '', quantity: 1 },
  ]);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');

  // Mock product database for SKU validation
  const mockProducts = useMemo<Record<string, { name: string; price: number; inStock: boolean; category: string }>>(() => ({
    'SKU001': { name: 'Cotton Bedsheet - White King', price: 2500, inStock: true, category: 'cotton' },
    'SKU002': { name: 'Silk Bedsheet - Blue Queen', price: 3500, inStock: true, category: 'silk' },
    'SKU003': { name: 'Linen Bedsheet - Green Double', price: 2800, inStock: true, category: 'linen' },
    'SKU004': { name: 'Cotton Bedsheet - Red Single', price: 1800, inStock: true, category: 'cotton' },
    'SKU005': { name: 'Silk Bedsheet - Gold King', price: 4500, inStock: false, category: 'silk' },
    'SKU006': { name: 'Linen Bedsheet - White Queen', price: 3200, inStock: true, category: 'linen' },
    'SKU007': { name: 'Cotton Bedsheet - Pink Double', price: 2200, inStock: true, category: 'cotton' },
    'SKU008': { name: 'Silk Bedsheet - Silver Single', price: 3800, inStock: true, category: 'silk' },
    'SKU009': { name: 'Linen Bedsheet - Beige King', price: 3500, inStock: true, category: 'linen' },
    'SKU010': { name: 'Cotton Bedsheet - Yellow Queen', price: 2600, inStock: true, category: 'cotton' },
  }), []);

  // Use user info for personalized messages
  const userDisplayName = user ? `${user.firstName} ${user.lastName}` : 'Guest';

  // Mock recent orders for displaying OrderCard, OrderInfo, OrderItems components
  const mockRecentOrders = useMemo<Order[]>(() => [
    {
      id: 'ORD-001',
      orderNumber: 'ORD-001',
      userId: user?.id || 'guest',
      user: user || { id: 'guest', firstName: 'Guest', lastName: 'User', email: 'guest@example.com', role: 'user' as const, isEmailVerified: false, isPhoneVerified: false, preferences: { newsletter: false, sms: false, pushNotifications: false }, createdAt: new Date() },
      items: [
        {
          id: 'item-1',
          orderId: 'ORD-001',
          productId: 'prod-1',
          product: {
            name: 'Cotton Bedsheet - White King',
            slug: 'cotton-bedsheet-white-king',
            description: 'Premium cotton bedsheet',
            images: [{ id: '1', url: '/images/product1.jpg', alt: 'Product', isPrimary: true, order: 0 }],
            pricing: { basePrice: 2500, salePrice: 2500 },
            inventory: { inStock: true, quantity: 10 },
          } as unknown as Product,
          variantId: undefined,
          variant: undefined,
          quantity: 2,
          unitPrice: { amount: 2500, currency: 'INR' },
          totalPrice: { amount: 5000, currency: 'INR' },
          productSnapshot: {
            name: 'Cotton Bedsheet - White King',
            description: 'Premium cotton bedsheet',
            sku: 'SKU001',
          },
        },
      ],
      subtotal: { amount: 5000, currency: 'INR' },
      taxAmount: { amount: 600, currency: 'INR' },
      shippingAmount: { amount: 0, currency: 'INR' },
      discountAmount: { amount: 0, currency: 'INR' },
      total: { amount: 5600, currency: 'INR' },
      currency: 'INR' as const,
      status: 'delivered',
      paymentStatus: 'paid',
      fulfillmentStatus: 'delivered',
      shippingAddress: {
        _id: 'addr-1',
        type: 'home' as const,
        firstName: user?.firstName || 'Guest',
        lastName: user?.lastName || 'User',
        addressLine1: '123 Main St',
        addressLine2: '',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India',
        mobile: '+91 1234567890',
        isDefault: true,
      },
      billingAddress: {
        _id: 'addr-2',
        type: 'home' as const,
        firstName: user?.firstName || 'Guest',
        lastName: user?.lastName || 'User',
        addressLine1: '123 Main St',
        addressLine2: '',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India',
        mobile: '+91 1234567890',
        isDefault: true,
      },
      shippingMethod: {
        id: 'standard',
        name: 'Standard Shipping',
        description: 'Delivered in 5-7 business days',
        estimatedDays: { min: 5, max: 7 },
        cost: { amount: 0, currency: 'INR' },
        provider: 'Standard',
        serviceLevel: 'standard' as const,
        isAvailable: true,
      },
      paymentMethodId: 'pm-1',
      paymentMethod: {
        id: 'pm-1',
        type: 'credit_card',
        provider: 'Visa',
        displayName: 'Visa ending in 4242',
        last4: '4242',
        isDefault: true,
      },
      appliedCoupons: [],
      appliedDiscounts: [],
      source: 'web' as const,
      channel: 'online' as const,
      placedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      emailSent: true,
      smsSent: false,
      notifications: [],
      isReturnable: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    } as unknown as Order,
  ], [user]);

  // Check cart items count for display
  const cartItemsCount = cartItems.length;

  // Add new row
  const handleAddRow = useCallback(() => {
    setOrderItems(prev => [
      ...prev,
      { id: Date.now().toString(), sku: '', productName: '', quantity: 1 },
    ]);
  }, []);

  // Remove row
  const handleRemoveRow = useCallback((id: string) => {
    setOrderItems(prev => prev.filter(item => item.id !== id));
  }, []);

  // Update item
  const handleUpdateItem = useCallback((id: string, field: keyof QuickOrderItem, value: string | number) => {
    setOrderItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };

          // Validate SKU when it changes
          if (field === 'sku' && typeof value === 'string' && value) {
            const product = mockProducts[value.toUpperCase()];
            if (product) {
              updated.productName = product.name;
              updated.price = product.price;
              updated.isValid = product.inStock;
              updated.error = product.inStock ? undefined : 'Out of stock';
            } else {
              updated.productName = '';
              updated.price = undefined;
              updated.isValid = false;
              updated.error = 'Invalid SKU';
            }
          }

          return updated;
        }
        return item;
      })
    );
  }, [mockProducts]);

  // Validate all items
  const validateItems = useCallback(async () => {
    setIsValidating(true);

    try {
      // Simulate API validation
      await new Promise(resolve => setTimeout(resolve, 1000));

      const validItems = orderItems.filter(
        item => item.sku && item.quantity > 0 && item.isValid
      );

      if (validItems.length === 0) {
        toast({
          title: 'No valid items',
          description: 'Please add at least one valid product with quantity',
          variant: 'destructive',
        });
        return false;
      }

      const invalidItems = orderItems.filter(item => item.sku && !item.isValid);
      if (invalidItems.length > 0) {
        toast({
          title: 'Invalid items found',
          description: `${invalidItems.length} item(s) have errors. Please fix them before proceeding.`,
          variant: 'destructive',
        });
        return false;
      }

      return true;
    } finally {
      setIsValidating(false);
    }
  }, [orderItems, toast]);

  // Add to cart
  const handleAddToCart = useCallback(async () => {
    const isValid = await validateItems();
    if (!isValid) return;

    setIsSubmitting(true);

    try {
      const validItems = orderItems.filter(item => item.sku && item.isValid);

      for (const item of validItems) {
        // Create mock product for cart
        const mockProduct = {
          id: item.sku,
          name: item.productName,
          slug: item.sku.toLowerCase(),
          description: `Quick order item: ${item.productName}`,
          pricing: {
            basePrice: { amount: item.price || 0, currency: 'INR', displayAmount: formatCurrency(item.price || 0) },
            salePrice: { amount: item.price || 0, currency: 'INR', displayAmount: formatCurrency(item.price || 0) },
            compareAtPrice: { amount: item.price || 0, currency: 'INR', displayAmount: formatCurrency(item.price || 0) },
            isDynamicPricing: false,
            taxable: true,
          },
          media: { images: [], videos: [] },
          inventory: {
            inStock: true,
            quantity: 100,
            isLowStock: false,
            lowStockThreshold: 10,
            allowBackorder: false,
            trackInventory: true,
            sku: item.sku,
          },
          category: { id: '1', name: 'Quick Order', slug: 'quick-order' },
          rating: 0,
          reviewCount: 0,
          tags: [],
          isFeatured: false,
          isNew: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as unknown as Product;

        await addToCart(mockProduct, item.quantity);
      }

      toast({
        title: 'Added to cart',
        description: `${validItems.length} item(s) added successfully`,
        variant: 'success',
      });

      // Clear form
      setOrderItems([{ id: '1', sku: '', productName: '', quantity: 1 }]);
      setOrderNotes('');

    } catch {
      // Error adding to cart
      toast({
        title: 'Error',
        description: 'Failed to add items to cart',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [orderItems, validateItems, addToCart, toast]);

  // Process bulk text input
  const processBulkText = useCallback(() => {
    const lines = bulkText.split('\n').filter(line => line.trim());
    const newItems: QuickOrderItem[] = [];

    lines.forEach((line, index) => {
      const parts = line.split(/[,\t]/).map(p => p.trim());
      if (parts.length >= 2) {
        const sku = parts[0].toUpperCase();
        const quantity = parseInt(parts[1]) || 1;
        const product = mockProducts[sku];

        newItems.push({
          id: `bulk-${index}`,
          sku,
          productName: product?.name || '',
          quantity,
          price: product?.price,
          isValid: product?.inStock || false,
          error: product ? (product.inStock ? undefined : 'Out of stock') : 'Invalid SKU',
        });
      }
    });

    if (newItems.length > 0) {
      setOrderItems(newItems);
      setShowBulkInput(false);
      setBulkText('');
      toast({
        title: 'Bulk import successful',
        description: `${newItems.length} item(s) imported`,
        variant: 'success',
      });
    } else {
      toast({
        title: 'Import failed',
        description: 'No valid items found. Format: SKU, Quantity (one per line)',
        variant: 'destructive',
      });
    }
  }, [bulkText, toast, mockProducts]);

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setBulkText(text);
      setShowBulkInput(true);
      toast({
        title: 'File loaded',
        description: 'Review and confirm the items before importing',
        variant: 'success',
      });
    };
    reader.readAsText(file);
  }, [toast]);

  // Download template
  const handleDownloadTemplate = useCallback(() => {
    const template = 'SKU,Quantity\nSKU001,10\nSKU002,5\nSKU003,8';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quick-order-template.csv';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Template downloaded',
      description: 'Fill in your SKUs and quantities',
      variant: 'success',
    });
  }, [toast]);

  // Calculate totals
  const totals = orderItems.reduce(
    (acc, item) => {
      if (item.price && item.quantity && item.isValid) {
        acc.items += 1;
        acc.quantity += item.quantity;
        acc.amount += item.price * item.quantity;
      }
      return acc;
    },
    { items: 0, quantity: 0, amount: 0 }
  );

  const validItemsCount = orderItems.filter(item => item.isValid).length;
  const errorItemsCount = orderItems.filter(item => item.error).length;

  return (
    <ErrorBoundary>
      <SEOHead
        title="Quick Order - Bulk Order | Vardhman Mills"
        description="Place bulk orders quickly using SKU codes. Perfect for B2B customers."
        keywords="bulk order, quick order, SKU, wholesale, B2B"
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Quick Order', href: '/quick-order' },
              ]}
            />
            <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Quick Order</h1>
                <p className="text-gray-600 mt-2">
                  Welcome, {userDisplayName}! Place bulk orders using SKU codes - Fast and efficient
                </p>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => setSelectedCategory(value as string)}
                  options={[
                    { value: 'all', label: 'All Categories' },
                    { value: 'cotton', label: 'Cotton' },
                    { value: 'silk', label: 'Silk' },
                    { value: 'linen', label: 'Linen' },
                  ]}
                  className="w-40"
                />
                
                <Tooltip content="Download CSV template">
                  <Button variant="outline" onClick={handleDownloadTemplate}>
                    <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                    Template
                  </Button>
                </Tooltip>
                <Tooltip content="Upload CSV file">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <DocumentArrowUpIcon className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </Tooltip>
                <label htmlFor="csv-file-input" className="sr-only">Upload CSV File</label>
                <input
                  id="csv-file-input"
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                  aria-label="Upload CSV file with SKU and quantity data"
                />
                <Button
                  variant="outline"
                  onClick={() => setShowBulkInput(!showBulkInput)}
                >
                  <ClipboardDocumentIcon className="w-4 h-4 mr-2" />
                  Bulk Input
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Order Form */}
            <div className="lg:col-span-2">
              {/* Bulk Input Modal */}
              <AnimatePresence>
                {showBulkInput && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6"
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Bulk Input</CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowBulkInput(false)}
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-2">
                            Enter SKU and quantity separated by comma or tab, one item per line:
                          </p>
                          <p className="text-xs text-gray-500 mb-3">
                            Example: SKU001, 10
                          </p>
                          <TextArea
                            value={bulkText}
                            onChange={(e) => setBulkText(e.target.value)}
                            placeholder="SKU001, 10&#10;SKU002, 5&#10;SKU003, 8"
                            rows={8}
                            className="font-mono text-sm"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={processBulkText} className="flex-1">
                            Import Items
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setBulkText('');
                              setShowBulkInput(false);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Order Items Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Order Items</CardTitle>
                    <div className="flex items-center gap-2">
                      {validItemsCount > 0 && (
                        <Badge variant="success">
                          {validItemsCount} valid
                        </Badge>
                      )}
                      {errorItemsCount > 0 && (
                        <Badge variant="destructive">
                          {errorItemsCount} errors
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {orderItems.length === 0 ? (
                    <OrderEmpty
                      variant="no-orders"
                      title="No items added"
                      message="Start adding items using SKU codes to create your quick order"
                      showActions={true}
                    />
                  ) : (
                    <div className="space-y-3">
                      {/* Table Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="hidden md:grid grid-cols-12 gap-4 pb-3 border-b text-sm font-medium text-gray-700 flex-1">
                          <div className="col-span-2">SKU</div>
                          <div className="col-span-4">Product Name</div>
                          <div className="col-span-2">Price</div>
                          <div className="col-span-2">Quantity</div>
                          <div className="col-span-2">Total</div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Checkbox
                            checked={includeOutOfStock}
                            onChange={(e) => setIncludeOutOfStock(e.target.checked)}
                            id="include-out-of-stock"
                          />
                          <label htmlFor="include-out-of-stock" className="text-sm text-gray-700 cursor-pointer">
                            Include out of stock items
                          </label>
                        </div>
                      </div>

                      {/* Table Rows */}
                      <AnimatePresence>
                        {orderItems.map((item) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={cn(
                              'grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-lg border',
                              item.error && 'border-red-300 bg-red-50',
                              item.isValid && 'border-green-300 bg-green-50'
                            )}
                          >
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1 md:hidden">
                                SKU
                              </label>
                              <Input
                                value={item.sku}
                                onChange={(e) =>
                                  handleUpdateItem(item.id, 'sku', e.target.value.toUpperCase())
                                }
                                placeholder="SKU001"
                                className={cn(item.error && 'border-red-500')}
                              />
                            </div>

                            <div className="md:col-span-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1 md:hidden">
                                Product Name
                              </label>
                              <div className="flex items-center gap-2">
                                {item.isValid && (
                                  <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                                )}
                                {item.error && (
                                  <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
                                )}
                                <div className="flex-1">
                                  <p className={cn('text-sm', !item.productName && 'text-gray-400')}>
                                    {item.productName || 'Enter SKU to load product'}
                                  </p>
                                  {item.error && (
                                    <p className="text-xs text-red-600 mt-1">{item.error}</p>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1 md:hidden">
                                Price
                              </label>
                              <p className="text-sm font-medium">
                                {item.price ? formatCurrency(item.price) : '-'}
                              </p>
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1 md:hidden">
                                Quantity
                              </label>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateItem(item.id, 'quantity', parseInt(e.target.value) || 1)
                                }
                                className="w-full"
                              />
                            </div>

                            <div className="md:col-span-1">
                              <label className="block text-sm font-medium text-gray-700 mb-1 md:hidden">
                                Total
                              </label>
                              <p className="text-sm font-semibold">
                                {item.price && item.quantity
                                  ? formatCurrency(item.price * item.quantity)
                                  : '-'}
                              </p>
                            </div>

                            <div className="md:col-span-1 flex items-center justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveRow(item.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {/* Add Row Button */}
                      <Button
                        variant="outline"
                        onClick={handleAddRow}
                        className="w-full"
                      >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Add Another Item
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Notes */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Order Notes (Optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <TextArea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Add any special instructions or notes for this order..."
                    rows={4}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                {/* Summary Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Recent Orders Section - uses OrderCard, OrderInfo, OrderItems components */}
                    {mockRecentOrders.length > 0 && (
                      <div className="mb-4 pb-4 border-b">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Quick Order</h4>
                        <OrderCard order={mockRecentOrders[0]} />
                      </div>
                    )}

                    {/* Order Statistics */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Valid Items</span>
                        <span className="font-medium">{validItemsCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Units</span>
                        <span className="font-medium">{totals.quantity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Cart Items</span>
                        <span className="font-medium">{cartItemsCount}</span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">{formatCurrency(totals.amount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax (12%)</span>
                        <span className="font-medium">
                          {formatCurrency(totals.amount * 0.12)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Shipping</span>
                        <span className="font-medium text-green-600">FREE</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-3 border-t">
                        <span>Total</span>
                        <span>{formatCurrency(totals.amount * 1.12)}</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-4">
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleAddToCart}
                        disabled={validItemsCount === 0 || isSubmitting || isValidating}
                      >
                        {isSubmitting ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <ShoppingCartIcon className="w-5 h-5 mr-2" />
                            Add to Cart ({validItemsCount})
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push('/products')}
                      >
                        Continue Shopping
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Help Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Need Help?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <h4 className="font-medium mb-1">Available SKUs:</h4>
                      <div className="space-y-1 text-gray-600">
                        {Object.entries(mockProducts).slice(0, 5).map(([sku, product]) => (
                          <div key={sku} className="flex justify-between">
                            <span className="font-mono text-xs">{sku}</span>
                            <span className="text-xs">{formatCurrency(product.price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Alert>
                      <AlertDescription className="text-xs">
                        <strong>Tip:</strong> You can paste multiple items from Excel or CSV
                        using the Bulk Input feature.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Order Analytics Section - uses OrderStats component */}
        {mockRecentOrders.length > 0 && (
          <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Analytics</h2>
            <OrderStats orders={mockRecentOrders} showComparison={true} />
            
            {/* Order Details Section - uses OrderInfo and OrderItems */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h3>
                <OrderInfo order={mockRecentOrders[0]} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                <OrderItems order={mockRecentOrders[0]} />
              </div>
            </div>
          </div>
        )}

        <BackToTop />
      </div>
    </ErrorBoundary>
  );
}
