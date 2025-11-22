'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import ProductForm from '@/components/forms/ProductForm';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Product {
  _id: string;
  name: string;
  description: string;
  shortDescription: string;
  category: string;
  brand: string;
  tags: string[];
  variants: Array<{
    _id: string;
    size: string;
    color: string;
    sku: string;
    price: number;
    comparePrice?: number;
    stock: number;
    images: string[];
    isActive: boolean;
  }>;
  specifications: Record<string, string>;
  isFeatured: boolean;
  isActive: boolean;
  seoTitle: string;
  seoDescription: string;
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Unwrap params using React.use()
  const resolvedParams = use(params);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await fetch(`/api/products/admin/${resolvedParams.id}`, {
          headers: {
            'Authorization': `Bearer ${session?.accessToken}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch product');
        }

        setProduct(data.data.product);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product details');
        router.push('/dashboard/products');
      } finally {
        setLoading(false);
      }
    };

    if (resolvedParams.id && session?.accessToken) {
      loadProduct();
    }
  }, [resolvedParams.id, session?.accessToken, router]);

  const handleSubmit = async (formData: FormData) => {
    try {
      const response = await fetch(`/api/products/admin/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update product');
      }

      toast.success('Product updated successfully!');
      router.push(`/dashboard/products/${resolvedParams.id}`);
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update product');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-container">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Product Not Found</h1>
          <p className="mt-2 text-gray-600">The product you&apos;re trying to edit doesn&apos;t exist.</p>
          <button
            onClick={() => router.push('/dashboard/products')}
            className="mt-4 btn btn-primary"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back
          </button>
          <div>
            <h1 className="page-title">Edit Product</h1>
            <p className="page-description">
              Update product information, variants, and specifications for &quot;{product.name}&quot;.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <ProductForm 
          initialData={{
            ...product,
            tags: Array.isArray(product.tags) ? product.tags.join(', ') : product.tags || ''
          }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
