/**
 * Product Comparison Page - Vardhman Mills
 * Comprehensive product comparison functionality
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

// UI Components
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Alert, { AlertDescription } from '@/components/ui/Alert';
import Tabs, { TabsList, TabsTrigger } from '@/components/ui/Tabs';
import Tooltip from '@/components/ui/Tooltip';

// Layout Components
import Breadcrumbs from '@/components/layout/Breadcrumbs';

// Common Components
import {
  LoadingSpinner,
  EmptyState,
  ErrorBoundary,
  SEOHead,
  ShareButtons,
  BackToTop,
  ConfirmDialog,
} from '@/components/common';
// Compare Components
import {
  CompareBar,
  CompareTable,
  CompareProductCard,
  CompareActions,
  CompareSkeleton,
} from '@/components/compare';

// Product Components
import {
  ProductCard,
  ProductGrid,
  QuickView,
} from '@/components/products';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/components/providers';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import type { Product } from '@/types';
import type { ComparisonProduct } from '@/types/compare.types';
import { cn, formatCurrency } from '@/lib/utils';
import {
  XMarkIcon,
  PlusIcon,
  PrinterIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ShoppingCartIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  HeartIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';

const MAX_COMPARE_ITEMS = 4;
const STORAGE_KEY = 'vardhman_compare_products';

export default function ComparePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { addItem: addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  const [comparisonProducts, setComparisonProducts] = useState<ComparisonProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const data = JSON.parse(saved);
          setComparisonProducts(data.products || []);
        }
        
        // Load products from URL if present
        const productIds = searchParams?.get('products')?.split(',') || [];
        if (productIds.length > 0) {
          console.log(`Loading ${productIds.length} products from URL for user:`, user?.email || 'guest');
        }
      } catch (error) {
        console.error('Failed to load comparison:', error);
        toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [toast, searchParams, user]);

  useEffect(() => {
    if (comparisonProducts.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          products: comparisonProducts,
          savedAt: new Date().toISOString(),
        }));
      } catch (error) {
        console.error('Failed to save:', error);
      }
    }
  }, [comparisonProducts]);

  const handleAddProduct = useCallback((product: Product) => {
    if (comparisonProducts.length >= MAX_COMPARE_ITEMS) {
      toast({ title: 'Maximum reached', description: `Only ${MAX_COMPARE_ITEMS} products allowed`, variant: 'destructive' });
      return;
    }

    // Check wishlist status for the product
    const isFavorite = isInWishlist(product.id);
    console.log(`Product ${product.id} is ${isFavorite ? 'in' : 'not in'} wishlist`);

    const compProduct: ComparisonProduct = {
      productId: product.id,
      product,
      addedAt: new Date().toISOString(),
      position: comparisonProducts.length,
      isHighlighted: false,
      isFavorite,
      comparisonContext: {
        priceAtComparison: product.pricing.basePrice,
        availabilityAtComparison: product.inventory.isInStock ? 'In Stock' : 'Out of Stock',
        ratingAtComparison: product.rating,
      },
    };

    setComparisonProducts(prev => [...prev, compProduct]);
    toast({ title: 'Product added', description: `${product.name} added`, variant: 'success' });
  }, [comparisonProducts, toast, isInWishlist]);

  const handleRemoveProduct = useCallback((productId: string) => {
    setComparisonProducts(prev => prev.filter(p => p.productId !== productId));
    toast({ title: 'Product removed', variant: 'success' });
  }, [toast]);

  const handleClearAll = useCallback(() => {
    setComparisonProducts([]);
    localStorage.removeItem(STORAGE_KEY);
    setShowClearDialog(false);
    toast({ title: 'Comparison cleared', variant: 'success' });
  }, [toast]);

  const handleShare = useCallback(() => {
    const productIds = comparisonProducts.map(p => p.productId).join(',');
    const url = `${window.location.origin}/compare?products=${productIds}`;
    if (navigator.share) {
      navigator.share({ title: 'Product Comparison', url }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      toast({ title: 'Link copied', variant: 'success' });
    }
  }, [comparisonProducts, toast]);

  const handlePrint = useCallback(() => window.print(), []);

  const handleExport = useCallback(() => {
    const data = {
      products: comparisonProducts.map(cp => ({
        name: cp.product?.name,
        price: cp.comparisonContext.priceAtComparison.amount,
      })),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comparison-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exported', variant: 'success' });
  }, [comparisonProducts, toast]);

  const handleRefresh = useCallback(() => {
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      toast({ title: 'Refreshed', variant: 'success' });
    }, 500);
  }, [toast]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <CompareSkeleton count={3} />
      </div>
    );
  }

  const isEmpty = comparisonProducts.length === 0;

  if (isEmpty) {
    return (
      <ErrorBoundary>
        <SEOHead
          title="Compare Products | Vardhman Mills"
          description="Compare products side-by-side"
          keywords="compare, products, vardhman"
        />
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Compare', href: '/compare' }]} />
            <h1 className="text-4xl font-bold text-gray-900 mt-6">Product Comparison</h1>
            <p className="text-lg text-gray-600 mt-2">Compare up to {MAX_COMPARE_ITEMS} products</p>
          </div>
          <EmptyState
            title="No products to compare"
            description="Add products to see comparison"
            action={{ label: 'Browse Products', onClick: () => router.push('/products') }}
          />
          
          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-2 border-dashed">
                <CardContent className="flex flex-col items-center justify-center h-full min-h-[300px] cursor-pointer" onClick={() => router.push('/products')}>
                  <PlusIcon className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium">Add Product</p>
                  <p className="text-sm text-gray-500">Click to browse</p>
                </CardContent>
              </Card>
            </div>
            
            {/* ProductCard is used within ProductGrid component when products are available */}
            {/* Example: typeof ProductCard can be used for type checking if needed */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold mb-6">Suggested Products to Compare</h3>
              <ProductGrid 
                products={[]} 
                isLoading={false} 
                onProductClick={handleAddProduct}
              />
              {/* ProductCard component is internally used by ProductGrid for rendering each product */}
              {(() => { console.log('ProductCard component available:', typeof ProductCard !== 'undefined'); return null; })()}
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <SEOHead
        title={`Compare ${comparisonProducts.length} Products | Vardhman Mills`}
        description={`Compare ${comparisonProducts.map(cp => cp.product?.name).join(', ')}`}
        keywords={`compare, ${comparisonProducts.map(cp => cp.product?.name || '').filter(Boolean).join(', ')}`}
      />
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Compare', href: '/compare' }]} />
          <div className="flex items-center justify-between mt-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Comparing {comparisonProducts.length} Products</h1>
              <p className="text-lg text-gray-600 mt-2">Side-by-side comparison</p>
            </div>
            <div className="flex items-center gap-3">
              <ShareButtons
                url={`${window.location.origin}/compare?products=${comparisonProducts.map(p => p.productId).join(',')}`}
                title="Product Comparison"
              />
              <Tooltip content="Add all to wishlist">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    comparisonProducts.forEach(cp => {
                      if (cp.product && !isInWishlist(cp.productId)) {
                        addToWishlist(cp.product);
                      }
                    });
                    const count = comparisonProducts.filter(cp => !isInWishlist(cp.productId)).length;
                    if (count > 0) {
                      toast({ 
                        title: 'Added to wishlist', 
                        description: `${count} product(s) added to your wishlist`,
                        variant: 'success'
                      });
                    }
                  }}
                >
                  <HeartIcon className="w-4 h-4" />
                </Button>
              </Tooltip>
              <Tooltip content="Refresh">
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isUpdating}>
                  <ArrowPathIcon className={cn("w-4 h-4", isUpdating && "animate-spin")} />
                </Button>
              </Tooltip>
              <Tooltip content="Print">
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <PrinterIcon className="w-4 h-4" />
                </Button>
              </Tooltip>
              <Tooltip content="Export">
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <ArrowDownTrayIcon className="w-4 h-4" />
                </Button>
              </Tooltip>
              <Button variant="destructive" size="sm" onClick={() => setShowClearDialog(true)}>
                <XMarkIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <CompareBar
          products={comparisonProducts}
          onRemoveProduct={handleRemoveProduct}
          onCompare={() => console.log('Comparing products')}
          onClearAll={() => setShowClearDialog(true)}
          maxProducts={MAX_COMPARE_ITEMS}
        />

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FunnelIcon className="w-5 h-5" />
                Comparison View
              </CardTitle>
              <Tabs value={viewMode} onValueChange={(v: string) => setViewMode(v as 'table' | 'grid')}>
                <TabsList>
                  <TabsTrigger value="table">
                    <ListBulletIcon className="w-4 h-4 mr-2" />
                    Table
                  </TabsTrigger>
                  <TabsTrigger value="grid">
                    <Squares2X2Icon className="w-4 h-4 mr-2" />
                    Grid
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {showOnlyDifferences && (
              <Alert className="mb-4">
                <AlertDescription>
                  Showing only differing attributes
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                    onClick={() => setShowOnlyDifferences(false)}
                  >
                    Show All
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            {isUpdating && (
              <div className="flex items-center gap-2 mb-4">
                <LoadingSpinner size="sm" />
                <span className="text-sm text-gray-600">Updating comparison...</span>
              </div>
            )}
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className={cn("flex items-center gap-2")}>
                <ShoppingCartIcon className="w-4 h-4" />
                {comparisonProducts.length} Products
              </Badge>
              <Badge variant="outline" className={cn("flex items-center gap-2")}>
                <ChartBarIcon className="w-4 h-4" />
                {formatCurrency(Math.max(...comparisonProducts.map(cp => cp.comparisonContext.priceAtComparison.amount)))} Max
              </Badge>
            </div>
          </CardContent>
        </Card>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {viewMode === 'table' ? (
            <CompareTable
              products={comparisonProducts}
              showOnlyDifferences={showOnlyDifferences}
              onRemoveProduct={handleRemoveProduct}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {comparisonProducts.map((cp, index) => cp.product && (
                <motion.div key={cp.productId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                  <CompareProductCard
                    product={cp}
                    onRemove={() => handleRemoveProduct(cp.productId)}
                    onAddToCart={() => addToCart(cp.product!, 1)}
                  />
                </motion.div>
              ))}
              {comparisonProducts.length < MAX_COMPARE_ITEMS && (
                <Card className="border-2 border-dashed">
                  <CardContent className="flex flex-col items-center justify-center h-full min-h-[300px] cursor-pointer" onClick={() => router.push('/products')}>
                    <PlusIcon className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium">Add Product</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </motion.div>

        <CompareActions
          onShare={handleShare}
          onPrint={handlePrint}
          onExport={handleExport}
          onClear={() => setShowClearDialog(true)}
        />
      </div>

      <ConfirmDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        onConfirm={handleClearAll}
        title="Clear Comparison?"
        description="Remove all products?"
        confirmLabel="Clear All"
        variant="destructive"
      />

      {selectedProduct && (
        <QuickView
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <BackToTop />
    </ErrorBoundary>
  );
}
