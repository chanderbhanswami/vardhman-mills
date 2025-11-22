'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import CategoryForm from '@/components/forms/CategoryForm';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Category {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  image?: string;
  parentCategory?: string;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  // Unwrap params using React.use()
  const resolvedParams = use(params);

  useEffect(() => {
    const loadCategory = async () => {
      try {
        const response = await fetch(`/api/categories/admin/${resolvedParams.id}`, {
          headers: {
            'Authorization': `Bearer ${session?.accessToken}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch category');
        }

        setCategory(data.data.category);
      } catch (error) {
        console.error('Error fetching category:', error);
        toast.error('Failed to load category details');
        router.push('/dashboard/categories');
      } finally {
        setLoading(false);
      }
    };

    if (resolvedParams.id && session?.accessToken) {
      loadCategory();
    }
  }, [resolvedParams.id, session?.accessToken, router]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="page-container">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Category Not Found</h1>
          <p className="mt-2 text-gray-600">The category you&apos;re trying to edit doesn&apos;t exist.</p>
          <button
            onClick={() => router.push('/dashboard/categories')}
            className="mt-4 btn btn-primary"
          >
            Back to Categories
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
            <h1 className="page-title">Edit Category</h1>
            <p className="page-description">
              Update category information for &quot;{category.name}&quot;.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <CategoryForm 
          category={category}
          isEditing={true}
        />
      </div>
    </div>
  );
}
