'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  TrashIcon,
  TagIcon,
  CheckCircleIcon,
  XCircleIcon,
  FolderIcon
} from '@heroicons/react/24/outline';

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

export default function CategoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [categoryId, setCategoryId] = useState<string>('');

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setCategoryId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    const loadCategory = async () => {
      if (!categoryId) return;
      
      try {
        const response = await fetch(`/api/categories/admin/${categoryId}`, {
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

    if (categoryId && session?.accessToken) {
      loadCategory();
    }
  }, [categoryId, session?.accessToken, router]);

  const handleDelete = async () => {
    if (!category || !categoryId) return;
    
    if (!confirm(`Are you sure you want to delete &quot;${category.name}&quot;? This action cannot be undone and will affect all products in this category.`)) {
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/categories/admin/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete category');
      }

      toast.success('Category deleted successfully!');
      router.push('/dashboard/categories');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleCategoryStatus = async () => {
    if (!category || !categoryId) return;

    try {
      const response = await fetch(`/api/categories/admin/${categoryId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !category.isActive }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update category status');
      }

      setCategory({ ...category, isActive: !category.isActive });
      toast.success(`Category ${category.isActive ? 'deactivated' : 'activated'} successfully!`);
    } catch (error) {
      console.error('Error updating category status:', error);
      toast.error('Failed to update category status');
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
          <p className="mt-2 text-gray-600">The category you&apos;re looking for doesn&apos;t exist.</p>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back
            </button>
            <div>
              <h1 className="page-title">{category.name}</h1>
              <p className="page-description">
                Category ID: {category._id}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              {category.isActive ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-1" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${category.isActive ? 'text-green-700' : 'text-red-700'}`}>
                {category.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <button
              onClick={toggleCategoryStatus}
              className={`btn ${category.isActive ? 'btn-secondary' : 'btn-primary'}`}
            >
              {category.isActive ? 'Deactivate' : 'Activate'}
            </button>
            
            <button
              onClick={() => router.push(`/dashboard/categories/${categoryId}/edit`)}
              className="btn btn-primary"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </button>
            
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="btn btn-danger"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Image */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Category Image</h3>
            
            {category.image ? (
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={category.image}
                  alt={category.name}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            ) : (
              <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                <FolderIcon className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Category Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Category Information</h3>
            
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{category.name}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Slug</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{category.slug}</dd>
              </div>
              
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {category.description || 'No description available'}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Parent Category</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {category.parentCategory || 'None (Top Level)'}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <TagIcon className="h-4 w-4 mr-1" />
                  Product Count
                </dt>
                <dd className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {category.productCount || 0} products
                  </span>
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(category.createdAt).toLocaleDateString()}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(category.updatedAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>

          {/* Category Analytics */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Category Analytics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{category.productCount || 0}</div>
                <div className="text-sm text-blue-600">Total Products</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-green-600">Active Products</div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">0</div>
                <div className="text-sm text-yellow-600">Subcategories</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => router.push(`/dashboard/products?category=${category._id}`)}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <TagIcon className="h-4 w-4 mr-2" />
                View Products
              </button>
              
              <button
                onClick={() => router.push('/dashboard/products/create')}
                className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Add Product
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
