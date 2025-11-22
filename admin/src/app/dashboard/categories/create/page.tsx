'use client';

import React from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import CategoryForm from '@/components/forms/CategoryForm';

export default function CreateCategoryPage() {
  const router = useRouter();

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
            <h1 className="page-title">Create Category</h1>
            <p className="page-description">
              Add a new product category to organize your inventory.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <CategoryForm />
      </div>
    </div>
  );
}
