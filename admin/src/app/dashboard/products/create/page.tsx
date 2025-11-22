'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import ProductForm from '@/components/forms/ProductForm';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function CreateProductPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleSubmit = async (formData: FormData) => {
    try {
      const response = await fetch('/api/products/admin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create product');
      }

      toast.success('Product created successfully!');
      router.push('/dashboard/products');
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create product');
    }
  };

  const handleCancel = () => {
    router.back();
  };

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
            <h1 className="page-title">Create Product</h1>
            <p className="page-description">
              Add a new product to your catalog with detailed information, variants, and specifications.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <ProductForm 
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
