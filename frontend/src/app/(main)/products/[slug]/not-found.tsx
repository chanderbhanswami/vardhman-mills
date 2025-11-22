/**
 * Product Not Found Page - Vardhman Mills
 * 404 page for product not found
 */

'use client';

import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card, { CardContent } from '@/components/ui/Card';
import { NotFound } from '@/components/common';
import {
  MagnifyingGlassIcon,
  HomeIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

export default function ProductNotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="py-12">
          <NotFound
            title="Product Not Found"
            message="The product you're looking for doesn't exist or has been removed."
            showHomeButton={false}
          />

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Go Back
            </Button>
            <Button
              onClick={() => router.push('/products')}
              variant="default"
              className="flex items-center gap-2"
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
              Browse Products
            </Button>
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <HomeIcon className="w-4 h-4" />
              Go Home
            </Button>
          </div>

          {/* Helpful Links */}
          <div className="mt-12 border-t pt-8">
            <h3 className="text-lg font-semibold mb-4 text-center">
              You might be interested in:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/products?category=cotton')}
                className="text-left p-4 rounded-lg border hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <h4 className="font-medium text-gray-900">Cotton Bedsheets</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Explore our cotton collection
                </p>
              </button>
              <button
                onClick={() => router.push('/products?category=silk')}
                className="text-left p-4 rounded-lg border hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <h4 className="font-medium text-gray-900">Silk Bedsheets</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Discover luxury silk products
                </p>
              </button>
              <button
                onClick={() => router.push('/sale')}
                className="text-left p-4 rounded-lg border hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <h4 className="font-medium text-gray-900">Sale Items</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Check out our special offers
                </p>
              </button>
              <button
                onClick={() => router.push('/products?new=true')}
                className="text-left p-4 rounded-lg border hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <h4 className="font-medium text-gray-900">New Arrivals</h4>
                <p className="text-sm text-gray-600 mt-1">
                  See what&apos;s new in store
                </p>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
