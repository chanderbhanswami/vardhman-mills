'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Category } from '@/types';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  parentCategory: z.string().optional(),
  isActive: z.boolean(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: Category;
  isEditing?: boolean;
}

export default function CategoryForm({ category, isEditing = false }: CategoryFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(category?.image || null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: category ? {
      name: category.name,
      description: category.description || '',
      parentCategory: category.parentCategory || '',
      isActive: category.isActive ?? true,
    } : {
      name: '',
      description: '',
      parentCategory: '',
      isActive: true,
    },
  });

  const deleteExistingCategoryImage = async () => {
    if (!existingImage || !category?._id) return;

    try {
      const response = await fetch(`/api/admin/categories/${category._id}/image`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        setExistingImage(null);
        toast.success('Image deleted successfully');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  const onSubmit: SubmitHandler<CategoryFormData> = async (data) => {
    setLoading(true);
    
    try {
      const formData = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      if (image) {
        formData.append('image', image);
      }

      if (isEditing && category) {
        // Update category via Next.js API route
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description || '');
        formData.append('isActive', data.isActive.toString());
        if (image) {
          formData.append('image', image);
        }

        const response = await fetch(`/api/categories/admin/${category._id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${session?.accessToken}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to update category');
        }
        
        toast.success('Category updated successfully!');
      } else {
        // Create category via Next.js API route
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description || '');
        formData.append('isActive', data.isActive.toString());
        if (image) {
          formData.append('image', image);
        }

        const response = await fetch('/api/categories/admin', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.accessToken}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to create category');
        }
        
        toast.success('Category created successfully!');
      }

      router.push('/dashboard/categories');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast.error(errorMessage || `Failed to ${isEditing ? 'update' : 'create'} category`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {isEditing ? 'Edit Category' : 'Create Category'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name *
            </label>
            <input
              {...register('name')}
              className={`input ${errors.name ? 'border-red-300' : ''}`}
              placeholder="Enter category name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="input resize-none"
              placeholder="Category description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parent Category
            </label>
            <input
              {...register('parentCategory')}
              type="text"
              className="input"
              placeholder="Parent category (optional)"
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-center space-x-2">
              <input
                {...register('isActive')}
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Image
            </label>
            
            {/* Existing Image Section */}
            {existingImage && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Current Image</h4>
                <div className="flex items-start space-x-2">
                  <div className="relative">
                    <Image
                      src={existingImage}
                      alt="Current category image"
                      width={100}
                      height={100}
                      className="object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={deleteExistingCategoryImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                      title="Delete image"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* New Image Upload */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {existingImage ? 'Replace Image' : 'Upload Image'}
              </h4>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                aria-label="Category image upload"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Category' : 'Create Category')}
          </button>
          
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}