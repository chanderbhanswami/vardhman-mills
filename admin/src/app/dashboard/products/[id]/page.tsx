'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  TrashIcon,
  TagIcon,
  CubeIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface Product {
  _id: string;
  name: string;
  description: string;
  shortDescription: string;
  category: {
    _id: string;
    name: string;
  };
  brand: string;
  tags: string[];
  images: string[];
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
  createdAt: string;
  updatedAt: string;
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(0);
  
  const resolvedParams = use(params);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/admin/products/${resolvedParams.id}`, {
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
      fetchProduct();
    }
  }, [resolvedParams.id, session?.accessToken, router]);

  const handleDelete = async () => {
    if (!product) return;
    
    if (!confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/admin/products/${resolvedParams.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete product');
      }

      toast.success('Product deleted successfully!');
      router.push('/dashboard/products');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleProductStatus = async () => {
    if (!product) return;

    try {
      const response = await fetch(`/api/admin/products/${resolvedParams.id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !product.isActive }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update product status');
      }

      setProduct({ ...product, isActive: !product.isActive });
      toast.success(`Product ${product.isActive ? 'deactivated' : 'activated'} successfully!`);
    } catch (error) {
      console.error('Error updating product status:', error);
      toast.error('Failed to update product status');
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

  if (!product) {
    return (
      <div className="page-container">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Product Not Found</h1>
          <p className="mt-2 text-gray-600">The product you are looking for does not exist.</p>
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
              <h1 className="page-title">{product.name}</h1>
              <p className="page-description">
                Product ID: {product._id}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              {product.isActive ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-1" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${product.isActive ? 'text-green-700' : 'text-red-700'}`}>
                {product.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <button
              onClick={toggleProductStatus}
              className={`btn ${product.isActive ? 'btn-secondary' : 'btn-primary'}`}
            >
              {product.isActive ? 'Deactivate' : 'Activate'}
            </button>
            
            <button
              onClick={() => router.push(`/dashboard/products/${resolvedParams.id}/edit`)}
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
        {/* Product Images */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Product Images</h3>
            
            {product.images && product.images.length > 0 ? (
              <div className="space-y-4">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover"
                    style={{ objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.src = '/Images/placeholder-product.png';
                    }}
                  />
                </div>
                
                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {product.images.slice(1).map((image: string, index: number) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={image}
                          alt={`${product.name} ${index + 2}`}
                          width={100}
                          height={100}
                          className="w-full h-full object-cover cursor-pointer hover:opacity-75"
                          style={{ objectFit: 'cover' }}
                          onError={(e) => {
                            e.currentTarget.src = '/Images/placeholder-product.png';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                <CubeIcon className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Product Information</h3>
            
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Brand</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.brand}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Category</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.category.name}</dd>
              </div>
              
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Short Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.shortDescription || 'No short description'}</dd>
              </div>
              
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                  {product.description || 'No description available'}
                </dd>
              </div>
              
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <TagIcon className="h-4 w-4 mr-1" />
                  Tags
                </dt>
                <dd className="mt-1">
                  {product.tags && product.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {product.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-900">No tags</span>
                  )}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Featured</dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    product.isFeatured 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.isFeatured ? 'Yes' : 'No'}
                  </span>
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(product.createdAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>

          {/* Variants */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Product Variants</h3>
            
            {product.variants.length > 1 && (
              <div className="mb-4">
                <div className="flex space-x-2">
                  {product.variants.map((variant, index) => (
                    <button
                      key={variant._id}
                      onClick={() => setSelectedVariant(index)}
                      className={`px-3 py-2 text-sm rounded-md border ${
                        selectedVariant === index
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {variant.size && variant.color 
                        ? `${variant.size} - ${variant.color}`
                        : variant.size || variant.color || `Variant ${index + 1}`
                      }
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {product.variants.length > 0 && (
              <div className="space-y-6">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">SKU</dt>
                    <dd className="mt-1 text-sm text-gray-900">{product.variants[selectedVariant].sku || 'No SKU'}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Size</dt>
                    <dd className="mt-1 text-sm text-gray-900">{product.variants[selectedVariant].size || 'No size specified'}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Color</dt>
                    <dd className="mt-1 text-sm text-gray-900">{product.variants[selectedVariant].color || 'No color specified'}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Stock</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.variants[selectedVariant].stock > 10 
                          ? 'bg-green-100 text-green-800'
                          : product.variants[selectedVariant].stock > 0
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.variants[selectedVariant].stock} units
                      </span>
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                      Price
                    </dt>
                    <dd className="mt-1">
                      <span className="text-lg font-semibold text-gray-900">
                        ₹{product.variants[selectedVariant].price.toLocaleString()}
                      </span>
                      {product.variants[selectedVariant].comparePrice && product.variants[selectedVariant].comparePrice! > product.variants[selectedVariant].price && (
                        <span className="ml-2 text-sm text-gray-500 line-through">
                          ₹{product.variants[selectedVariant].comparePrice!.toLocaleString()}
                        </span>
                      )}
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.variants[selectedVariant].isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.variants[selectedVariant].isActive ? 'Active' : 'Inactive'}
                      </span>
                    </dd>
                  </div>
                </dl>

                {/* Variant Images */}
                {product.variants[selectedVariant].images && product.variants[selectedVariant].images.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Variant Images</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {product.variants[selectedVariant].images.map((image: string, index: number) => (
                        <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={image}
                            alt={`${product.name} variant ${index + 1}`}
                            width={150}
                            height={150}
                            className="w-full h-full object-cover"
                            style={{ objectFit: 'cover' }}
                            onError={(e) => {
                              e.currentTarget.src = '/Images/placeholder-product.png';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Specifications */}
          {product && Object.keys(product.specifications).length > 0 && (
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Specifications</h3>
              
              <dl className="space-y-3">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-200 last:border-b-0">
                    <dt className="text-sm font-medium text-gray-500">{key}</dt>
                    <dd className="text-sm text-gray-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* SEO */}
          {product && (
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Information</h3>
              
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">SEO Title</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.seoTitle || 'Not set'}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">SEO Description</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.seoDescription || 'Not set'}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
