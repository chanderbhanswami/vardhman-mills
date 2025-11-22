'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ProductVariant {
  _id?: string;
  size: string;
  color: string;
  sku: string;
  price: number;
  comparePrice?: number;
  stock: number;
  images: string[];
  isActive: boolean;
}

interface ProductFormData {
  _id?: string; // Product ID for editing
  name: string;
  description: string;
  shortDescription: string;
  category: string;
  subcategory?: string;
  brand: string;
  tags: string;
  images?: string[]; // Main product images
  variants: ProductVariant[];
  specifications: Record<string, string>;
  isFeatured: boolean;
  isActive: boolean;
  seoTitle: string;
  seoDescription: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function ProductForm({ initialData, onSubmit, onCancel, loading = false }: ProductFormProps) {
  const { data: session } = useSession();
  
  // Helper function to extract category ID
  const getCategoryId = (category: string | { _id: string; name: string } | undefined): string => {
    if (typeof category === 'object' && category !== null && category._id) {
      return category._id;
    }
    return (category as string) || '';
  };

  // Prepare initial data with fixed category
  const processedInitialData = initialData ? {
    ...initialData,
    category: getCategoryId(initialData.category)
  } : {};

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    shortDescription: '',
    category: '',
    subcategory: '',
    brand: 'Vardhman Mills',
    tags: '',
    variants: [{
      size: '',
      color: '',
      sku: '',
      price: 0,
      comparePrice: 0,
      stock: 0,
      images: [],
      isActive: true
    }],
    specifications: {},
    isFeatured: false,
    isActive: true,
    seoTitle: '',
    seoDescription: '',
    ...processedInitialData
  });

  const [categories, setCategories] = useState<Category[]>([]);
  
  // New images (File objects)
  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [variantImages, setVariantImages] = useState<File[][]>(
    formData.variants.map(() => [])
  );
  const [variantImagePreviews, setVariantImagePreviews] = useState<string[][]>(
    formData.variants.map(() => [])
  );
  
  // Existing images (URLs from database)
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [existingVariantImages, setExistingVariantImages] = useState<string[][]>(
    formData.variants.map(variant => variant.images || [])
  );
  
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');

  const fetchCategories = useCallback(async () => {
    try {
      if (!session?.accessToken) {
        console.error('No session token available');
        return;
      }
      
      const response = await fetch('/api/categories/admin', {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    if (session?.accessToken) {
      fetchCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]); // fetchCategories is stable due to useCallback

  // Initialize existing images when initialData changes
  useEffect(() => {
    if (initialData) {
      // Set existing main images
      if (initialData.images) {
        setExistingImages(initialData.images as string[]);
      }
      
      // Set existing variant images
      if (initialData.variants) {
        const variantImgs = initialData.variants.map(variant => variant.images || []);
        setExistingVariantImages(variantImgs);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData?.images, initialData?.variants]); // Specific deps to prevent infinite loop

  useEffect(() => {
    if (initialData?.tags) {
      setFormData(prev => ({
        ...prev,
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : (initialData.tags || '')
      }));
    }
  }, [initialData?.tags]); // More specific dependency to prevent infinite loop

  const handleInputChange = (field: keyof ProductFormData, value: string | boolean | ProductVariant[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVariantChange = (index: number, field: keyof ProductVariant, value: ProductVariant[keyof ProductVariant]) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index] = {
      ...updatedVariants[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      variants: updatedVariants
    }));
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, {
        size: '',
        color: '',
        sku: '',
        price: 0,
        comparePrice: 0,
        stock: 0,
        images: [],
        isActive: true
      }]
    }));
    
    // Add empty arrays for the new variant's images
    setVariantImages(prev => [...prev, []]);
    setVariantImagePreviews(prev => [...prev, []]);
    setExistingVariantImages(prev => [...prev, []]);
  };

  const removeVariant = (index: number) => {
    if (formData.variants.length > 1) {
      const updatedVariants = formData.variants.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        variants: updatedVariants
      }));
      
      // Remove the corresponding variant images
      setVariantImages(prev => prev.filter((_, i) => i !== index));
      setVariantImagePreviews(prev => prev.filter((_, i) => i !== index));
      setExistingVariantImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files]);

    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleVariantImageChange = (variantIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Add files to variant images
    setVariantImages(prev => {
      const updated = [...prev];
      updated[variantIndex] = [...updated[variantIndex], ...files];
      return updated;
    });

    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setVariantImagePreviews(prev => {
          const updated = [...prev];
          updated[variantIndex] = [...updated[variantIndex], e.target?.result as string];
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeVariantImage = (variantIndex: number, imageIndex: number) => {
    setVariantImages(prev => {
      const updated = [...prev];
      updated[variantIndex] = updated[variantIndex].filter((_, i) => i !== imageIndex);
      return updated;
    });
    
    setVariantImagePreviews(prev => {
      const updated = [...prev];
      updated[variantIndex] = updated[variantIndex].filter((_, i) => i !== imageIndex);
      return updated;
    });
  };

  // Functions for deleting existing images (calls API)
  const deleteExistingImage = async (imageIndex: number) => {
    if (!session?.accessToken || !initialData?._id) return;

    try {
      const response = await fetch(`/api/admin/products/${initialData._id}/images/${imageIndex}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        // Remove from local state
        setExistingImages(prev => prev.filter((_, i) => i !== imageIndex));
      } else {
        console.error('Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const deleteExistingVariantImage = async (variantIndex: number, imageIndex: number) => {
    if (!session?.accessToken || !initialData?._id) return;

    try {
      const response = await fetch(`/api/admin/products/${initialData._id}/variants/${variantIndex}/images/${imageIndex}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        // Remove from local state
        setExistingVariantImages(prev => {
          const updated = [...prev];
          updated[variantIndex] = updated[variantIndex].filter((_, i) => i !== imageIndex);
          return updated;
        });
      } else {
        console.error('Failed to delete variant image');
      }
    } catch (error) {
      console.error('Error deleting variant image:', error);
    }
  };

  const addSpecification = () => {
    if (specKey && specValue) {
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specKey]: specValue
        }
      }));
      setSpecKey('');
      setSpecValue('');
    }
  };

  const removeSpecification = (key: string) => {
    const updatedSpecs = { ...formData.specifications };
    delete updatedSpecs[key];
    setFormData(prev => ({
      ...prev,
      specifications: updatedSpecs
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = new FormData();
    
    // Add basic fields
    submitData.append('name', formData.name);
    submitData.append('description', formData.description);
    submitData.append('shortDescription', formData.shortDescription);
    submitData.append('category', formData.category);
    submitData.append('brand', formData.brand);
    submitData.append('tags', formData.tags);
    submitData.append('isFeatured', formData.isFeatured.toString());
    submitData.append('isActive', formData.isActive.toString());
    submitData.append('seoTitle', formData.seoTitle);
    submitData.append('seoDescription', formData.seoDescription);

    // Add variants and specifications as JSON
    submitData.append('variants', JSON.stringify(formData.variants));
    submitData.append('specifications', JSON.stringify(formData.specifications));

    // Add main product images
    images.forEach(image => {
      submitData.append('images', image);
    });

    // Add variant images with proper naming
    variantImages.forEach((variantImageArray, variantIndex) => {
      variantImageArray.forEach(image => {
        submitData.append(`variantImages_${variantIndex}`, image);
      });
    });

    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter product name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand
            </label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => handleInputChange('brand', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter brand name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Product category"
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              placeholder="cotton, premium, comfortable"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Short Description
          </label>
          <input
            type="text"
            value={formData.shortDescription}
            onChange={(e) => handleInputChange('shortDescription', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief product description"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Detailed product description"
          />
        </div>
      </div>

      {/* Product Images */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Product Images</h3>
        
        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Images
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {existingImages.map((imageUrl, index) => (
                <div key={`existing-${index}`} className="relative">
                  <Image
                    src={imageUrl}
                    alt={`Current ${index + 1}`}
                    width={300}
                    height={128}
                    className="w-full h-32 object-cover rounded-md"
                    style={{ objectFit: 'cover', borderRadius: '0.375rem' }}
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => deleteExistingImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    aria-label="Delete existing image"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload New Images
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Upload product images"
          />
        </div>

        {imagePreview.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {imagePreview.map((preview, index) => (
              <div key={index} className="relative">
                <Image
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  width={300}
                  height={128}
                  className="w-full h-32 object-cover rounded-md"
                  style={{ objectFit: 'cover', borderRadius: '0.375rem' }}
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  aria-label="Remove image"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Variants */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Product Variants</h3>
          <button
            type="button"
            onClick={addVariant}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
            Add Variant
          </button>
        </div>

        {formData.variants.map((variant, index) => (
          <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-900">Variant {index + 1}</h4>
              {formData.variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="text-red-600 hover:text-red-800"
                  aria-label={`Remove variant ${index + 1}`}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size
                </label>
                <input
                  type="text"
                  value={variant.size}
                  onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., S, M, L, XL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <input
                  type="text"
                  value={variant.color}
                  onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Red, Blue, Green"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU
                </label>
                <input
                  type="text"
                  value={variant.sku}
                  onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Product SKU"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price
                </label>
                <input
                  type="number"
                  min="0"
                  value={variant.price}
                  onChange={(e) => handleVariantChange(index, 'price', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compare Price
                </label>
                <input
                  type="number"
                  min="0"
                  value={variant.comparePrice || ''}
                  onChange={(e) => handleVariantChange(index, 'comparePrice', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={variant.stock}
                  onChange={(e) => handleVariantChange(index, 'stock', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variant Images
              </label>
              
              {/* Existing Variant Images */}
              {existingVariantImages[index] && existingVariantImages[index].length > 0 && (
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Current Images
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {existingVariantImages[index].map((imageUrl: string, imageIndex: number) => (
                      <div key={`existing-variant-${index}-${imageIndex}`} className="relative">
                        <Image
                          src={imageUrl}
                          alt={`Current Variant ${index + 1} Image ${imageIndex + 1}`}
                          width={100}
                          height={100}
                          className="w-full h-24 object-cover rounded-md"
                          style={{ objectFit: 'cover' }}
                          unoptimized
                        />
                        <button
                          type="button"
                          onClick={() => deleteExistingVariantImage(index, imageIndex)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          aria-label="Delete existing variant image"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Upload New Images
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleVariantImageChange(index, e)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label={`Upload images for variant ${index + 1}`}
                />
                
                {variantImagePreviews[index] && variantImagePreviews[index].length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {variantImagePreviews[index].map((preview: string, imageIndex: number) => (
                      <div key={imageIndex} className="relative">
                        <Image
                          src={preview}
                          alt={`Variant ${index + 1} Image ${imageIndex + 1}`}
                          width={100}
                          height={100}
                          className="w-full h-24 object-cover rounded-md"
                          style={{ objectFit: 'cover' }}
                          unoptimized
                        />
                        <button
                          type="button"
                          onClick={() => removeVariantImage(index, imageIndex)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          aria-label="Remove variant image"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center">
              <input
                type="checkbox"
                id={`active-${index}`}
                checked={variant.isActive}
                onChange={(e) => handleVariantChange(index, 'isActive', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={`active-${index}`} className="ml-2 block text-sm text-gray-900">
                Active
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Specifications */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Specifications</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specification Key
            </label>
            <input
              type="text"
              value={specKey}
              onChange={(e) => setSpecKey(e.target.value)}
              placeholder="e.g., Fabric Type"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specification Value
            </label>
            <input
              type="text"
              value={specValue}
              onChange={(e) => setSpecValue(e.target.value)}
              placeholder="e.g., Cotton"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={addSpecification}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mb-4"
        >
          <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
          Add Specification
        </button>

        {Object.entries(formData.specifications).length > 0 && (
          <div className="space-y-2">
            {Object.entries(formData.specifications).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                <span className="font-medium">{key}</span>
                <span className="text-gray-700">{value}</span>
                <button
                  type="button"
                  onClick={() => removeSpecification(key)}
                  className="text-red-600 hover:text-red-800"
                  aria-label={`Remove specification ${key}`}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SEO */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SEO Title
            </label>
            <input
              type="text"
              value={formData.seoTitle}
              onChange={(e) => handleInputChange('seoTitle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="SEO optimized title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SEO Description
            </label>
            <input
              type="text"
              value={formData.seoDescription}
              onChange={(e) => handleInputChange('seoDescription', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="SEO meta description"
            />
          </div>
        </div>
      </div>

      {/* Featured & Active Status */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Product Status</h3>
            <p className="text-sm text-gray-500">Set product visibility and featured status</p>
          </div>
          
          <div className="flex space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                checked={formData.isFeatured}
                onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                Featured
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                Active
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </form>
  );
}