import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product.model.js';
import Category from '../models/Category.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { AuthRequest, ProductQuery } from '../types/index.js';
import { deleteFromCloudinary } from '../config/cloudinary.js';

// Helper function to extract public ID from Cloudinary URL
const getPublicIdFromUrl = (url: string): string | null => {
  if (!url) return null;
  const matches = url.match(/\/v\d+\/(.+)\./);
  return matches ? matches[1] : null;
};

export const getAllProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const {
    page = '1',
    limit = '12',
    sort = '-createdAt',
    category,
    minPrice,
    maxPrice,
    rating,
    search,
    isFeatured
  } = req.query as ProductQuery;

  const query: any = { isActive: true };
  
  // Category filter
  if (category) {
    const categoryDoc = await Category.findOne({ slug: category });
    if (categoryDoc) {
      query.category = categoryDoc._id;
    }
  }

  // Price filter
  if (minPrice || maxPrice) {
    query['variants.price'] = {};
    if (minPrice) query['variants.price'].$gte = Number(minPrice);
    if (maxPrice) query['variants.price'].$lte = Number(maxPrice);
  }

  // Rating filter
  if (rating) {
    query.averageRating = { $gte: Number(rating) };
  }

  // Featured filter
  if (isFeatured === 'true') {
    query.isFeatured = true;
  }

  // Search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search as string, 'i')] } }
    ];
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const products = await Product.find(query)
    .populate('category', 'name slug')
    .sort(sort)
    .skip(skip)
    .limit(limitNum)
    .select('-reviews'); // Exclude reviews for performance

  const total = await Product.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: products.length,
    pagination: {
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total
    },
    data: {
      products
    }
  });
});

export const getProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const product = await Product.findOne({
    slug: req.params.slug,
    isActive: true
  })
    .populate('category', 'name slug')
    .populate('reviews.user', 'firstName lastName avatar');

  if (!product) {
    return next(new AppError('No product found with that slug', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product
    }
  });
});

export const getProductById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name slug')
    .populate('reviews.user', 'firstName lastName avatar');

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product
    }
  });
});

export const getFeaturedProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const limit = parseInt(req.query.limit as string) || 8;

  const products = await Product.find({
    isActive: true,
    isFeatured: true
  })
    .populate('category', 'name slug')
    .sort('-createdAt')
    .limit(limit)
    .select('-reviews');

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products
    }
  });
});

export const getRelatedProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const product = await Product.findById(req.params.id).select('category');
  
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  const limit = parseInt(req.query.limit as string) || 4;

  const relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true
  })
    .populate('category', 'name slug')
    .sort('-averageRating')
    .limit(limit)
    .select('-reviews');

  res.status(200).json({
    status: 'success',
    results: relatedProducts.length,
    data: {
      products: relatedProducts
    }
  });
});

export const createProduct = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const {
    name,
    description,
    shortDescription,
    category,
    subcategory,
    brand,
    tags,
    variants,
    specifications,
    isFeatured,
    seoTitle,
    seoDescription
  } = req.body;

  // Generate slug from name
  const slug = name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
  
  // Check if slug already exists
  const existingProduct = await Product.findOne({ slug });
  if (existingProduct) {
    return next(new AppError('Product with this name already exists', 400));
  }

  // Handle uploaded images and variants
  let processedVariants = JSON.parse(variants || '[]');
  let mainImages: string[] = [];
  
  if (req.files) {
    console.log('Create product - Files received:', req.files);
    
    // Handle fields-based upload (from uploadProductFields)
    if (typeof req.files === 'object' && !Array.isArray(req.files)) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      console.log('Create product - Processing field-based files:', Object.keys(files));
      
      // Handle main images
      if (files.images && files.images.length > 0) {
        mainImages = files.images.map(file => file.path);
      }
      
      // Handle variant images
      processedVariants.forEach((variant: any, index: number) => {
        const variantFieldName = `variantImages_${index}`;
        if (files[variantFieldName] && files[variantFieldName].length > 0) {
          console.log(`Create product - Setting ${files[variantFieldName].length} images for variant ${index}`);
          variant.images = files[variantFieldName].map(file => file.path);
        }
      });
      
    } else {
      // Handle array-based upload (fallback)
      const fileArray = req.files as Express.Multer.File[];
      console.log('Create product - Processing array-based files:', fileArray.length);
      
      // Separate main images from variant images
      const mainImageFiles: Express.Multer.File[] = [];
      const variantImageFiles: { [key: number]: Express.Multer.File[] } = {};
      
      fileArray.forEach(file => {
        if (file.fieldname === 'images') {
          mainImageFiles.push(file);
        } else if (file.fieldname.startsWith('variantImages_')) {
          const variantIndex = parseInt(file.fieldname.split('_')[1]);
          if (!variantImageFiles[variantIndex]) {
            variantImageFiles[variantIndex] = [];
          }
          variantImageFiles[variantIndex].push(file);
        }
      });
      
      // Set main images
      mainImages = mainImageFiles.map(file => file.path);
      
      // Update variants with their images
      processedVariants.forEach((variant: any, index: number) => {
        if (variantImageFiles[index]) {
          variant.images = variantImageFiles[index].map(file => file.path);
        }
      });
    }
  }

  const newProduct = await Product.create({
    name,
    slug,
    description,
    shortDescription,
    category,
    subcategory,
    brand,
    tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
    variants: processedVariants,
    images: mainImages,
    specifications: specifications ? JSON.parse(specifications) : new Map(),
    isFeatured: isFeatured === 'true',
    seoTitle,
    seoDescription
  });

  const populatedProduct = await Product.findById(newProduct._id)
    .populate('category', 'name slug');

  res.status(201).json({
    status: 'success',
    data: {
      product: populatedProduct
    }
  });
});

export const updateProduct = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  console.log('=== UPDATE PRODUCT DEBUG ===');
  console.log('Request body keys:', Object.keys(req.body));
  console.log('Request files:', req.files);
  console.log('Files type:', typeof req.files);
  
  // Check what's in the raw request
  if (req.file) console.log('Single file:', req.file);
  if (req.files) {
    if (Array.isArray(req.files)) {
      console.log('Files array length:', req.files.length);
      req.files.forEach((file, index) => {
        console.log(`File ${index} fieldname:`, file.fieldname);
      });
    } else {
      console.log('Files object keys:', Object.keys(req.files));
      Object.entries(req.files).forEach(([key, files]) => {
        console.log(`Field ${key}:`, Array.isArray(files) ? files.length + ' files' : '1 file');
      });
    }
  }
  console.log('=== END DEBUG ===');

  const {
    name,
    description,
    shortDescription,
    category,
    subcategory,
    brand,
    tags,
    variants,
    specifications,
    isFeatured,
    isActive,
    seoTitle,
    seoDescription
  } = req.body;

  // First get the existing product to access old images
  const existingProduct = await Product.findById(req.params.id);
  if (!existingProduct) {
    return next(new AppError('No product found with that ID', 404));
  }

  const updateData: any = {
    description,
    shortDescription,
    category,
    subcategory,
    brand,
    isFeatured: isFeatured === 'true',
    isActive: isActive !== 'false',
    seoTitle,
    seoDescription
  };

  // If name is being updated, generate new slug
  if (name) {
    const slug = name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
    
    // Check if new slug already exists (excluding current product)
    const existingSlugProduct = await Product.findOne({ 
      slug, 
      _id: { $ne: req.params.id } 
    });
    
    if (existingSlugProduct) {
      return next(new AppError('Product with this name already exists', 400));
    }
    
    updateData.name = name;
    updateData.slug = slug;
  }

  if (tags) {
    updateData.tags = tags.split(',').map((tag: string) => tag.trim());
  }

  if (variants) {
    console.log('Processing variants with images...');
    const parsedVariants = JSON.parse(variants);
    console.log('Parsed variants:', parsedVariants.length);
    
    // Handle variant images from multer files
    if (req.files) {
      console.log('Files received:', req.files);
      
      // Handle fields-based upload (from uploadProductFields)
      if (typeof req.files === 'object' && !Array.isArray(req.files)) {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        console.log('Processing field-based files:', Object.keys(files));
        
        // Handle main images
        if (files.images && files.images.length > 0) {
          console.log('Processing main images...');
          // Delete old main images from Cloudinary if they exist
          if (existingProduct.images && existingProduct.images.length > 0) {
            for (const imageUrl of existingProduct.images) {
              const publicId = getPublicIdFromUrl(imageUrl);
              if (publicId) {
                try {
                  await deleteFromCloudinary(publicId);
                } catch (error) {
                  console.error('Error deleting old image from Cloudinary:', error);
                }
              }
            }
          }
          updateData.images = files.images.map(file => file.path);
        }
        
        // Handle variant images
        parsedVariants.forEach((variant: any, index: number) => {
          const variantFieldName = `variantImages_${index}`;
          if (files[variantFieldName] && files[variantFieldName].length > 0) {
            console.log(`Replacing variant ${index} images with ${files[variantFieldName].length} new images`);
            // Replace existing images with new ones (don't append)
            variant.images = files[variantFieldName].map(file => file.path);
          }
          // If no new images for this variant, keep existing images as they are
        });
        
      } else {
        // Handle array-based upload (fallback for upload.any())
        const fileArray = req.files as Express.Multer.File[];
        console.log('Processing array-based files:', fileArray.length);
        
        const mainImages: Express.Multer.File[] = [];
        const variantImageFiles: { [key: number]: Express.Multer.File[] } = {};
        
        fileArray.forEach(file => {
          console.log('Processing file:', file.fieldname, file.originalname);
          if (file.fieldname === 'images') {
            mainImages.push(file);
          } else if (file.fieldname.startsWith('variantImages_')) {
            const variantIndex = parseInt(file.fieldname.split('_')[1]);
            console.log('Variant image for index:', variantIndex);
            if (!variantImageFiles[variantIndex]) {
              variantImageFiles[variantIndex] = [];
            }
            variantImageFiles[variantIndex].push(file);
          }
        });
        
        console.log('Main images:', mainImages.length);
        console.log('Variant image files:', Object.keys(variantImageFiles));
        
        // Update variant images with Cloudinary URLs
        parsedVariants.forEach((variant: any, index: number) => {
          if (variantImageFiles[index]) {
            console.log(`Replacing variant ${index} images with ${variantImageFiles[index].length} new images`);
            // Replace existing images with new ones (don't append)
            variant.images = variantImageFiles[index].map(file => file.path);
          }
          // If no new images for this variant, keep existing images as they are
        });
        
        // Handle main images
        if (mainImages.length > 0) {
          console.log('Processing main images...');
          // Delete old main images from Cloudinary if they exist
          if (existingProduct.images && existingProduct.images.length > 0) {
            for (const imageUrl of existingProduct.images) {
              const publicId = getPublicIdFromUrl(imageUrl);
              if (publicId) {
                try {
                  await deleteFromCloudinary(publicId);
                } catch (error) {
                  console.error('Error deleting old image from Cloudinary:', error);
                }
              }
            }
          }
          updateData.images = mainImages.map(file => file.path);
        }
      }
    }
    
    updateData.variants = parsedVariants;
    console.log('Variants updated successfully');
  }

  if (specifications) {
    updateData.specifications = JSON.parse(specifications);
  }

  console.log('About to update product with data:', {
    ...updateData,
    variants: updateData.variants ? `${updateData.variants.length} variants` : 'no variants'
  });

  try {
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate('category', 'name slug');

    console.log('Product updated successfully:', product?.name);

    res.status(200).json({
      status: 'success',
      data: {
        product
      }
    });
  } catch (updateError) {
    console.error('Error updating product in database:', updateError);
    return next(new AppError(`Failed to update product: ${updateError}`, 500));
  }
});

export const deleteProduct = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  // Delete all product images from Cloudinary
  if (product.images && product.images.length > 0) {
    for (const imageUrl of product.images) {
      const publicId = getPublicIdFromUrl(imageUrl);
      if (publicId) {
        try {
          await deleteFromCloudinary(publicId);
        } catch (error) {
          console.error('Error deleting product image from Cloudinary:', error);
          // Don't fail the request if image deletion fails
        }
      }
    }
  }

  // Delete variant images from Cloudinary
  if (product.variants && product.variants.length > 0) {
    for (const variant of product.variants) {
      if (variant.images && variant.images.length > 0) {
        for (const imageUrl of variant.images) {
          const publicId = getPublicIdFromUrl(imageUrl);
          if (publicId) {
            try {
              await deleteFromCloudinary(publicId);
            } catch (error) {
              console.error('Error deleting variant image from Cloudinary:', error);
              // Don't fail the request if image deletion fails
            }
          }
        }
      }
    }
  }

  // Delete the product from database
  await Product.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

export const addProductReview = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { rating, comment } = req.body;
  const productId = req.params.id;
  const userId = req.user!._id;

  const product = await Product.findById(productId);
  
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Check if user already reviewed this product
  const existingReview = product.reviews.find(
    review => review.user.toString() === userId.toString()
  );

  if (existingReview) {
    return next(new AppError('You have already reviewed this product', 400));
  }

  // Add new review
  product.reviews.push({
    user: userId,
    rating,
    comment,
    createdAt: new Date(),
    updatedAt: new Date()
  } as any);

  await product.save();

  // Populate the new review
  await product.populate('reviews.user', 'firstName lastName avatar');

  res.status(201).json({
    status: 'success',
    data: {
      review: product.reviews[product.reviews.length - 1]
    }
  });
});

export const updateProductReview = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { rating, comment } = req.body;
  const productId = req.params.id;
  const reviewId = req.params.reviewId;
  const userId = req.user!._id;

  const product = await Product.findById(productId);
  
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  const review = product.reviews.find(
    review => review._id!.toString() === reviewId && review.user.toString() === userId.toString()
  );

  if (!review) {
    return next(new AppError('Review not found or you are not authorized to update this review', 404));
  }

  review.rating = rating;
  review.comment = comment;
  review.updatedAt = new Date();

  await product.save();

  res.status(200).json({
    status: 'success',
    data: {
      review
    }
  });
});

export const deleteProductReview = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const productId = req.params.id;
  const reviewId = req.params.reviewId;
  const userId = req.user!._id;

  const product = await Product.findById(productId);
  
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  const reviewIndex = product.reviews.findIndex(
    review => review._id!.toString() === reviewId && 
    (review.user.toString() === userId.toString() || req.user!.role === 'admin')
  );

  if (reviewIndex === -1) {
    return next(new AppError('Review not found or you are not authorized to delete this review', 404));
  }

  product.reviews.splice(reviewIndex, 1);
  await product.save();

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Admin routes
export const getAllProductsAdmin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const query: any = {};
  
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  if (req.query.category) {
    query.category = req.query.category;
  }

  if (req.query.isActive !== undefined) {
    query.isActive = req.query.isActive === 'true';
  }

  if (req.query.isFeatured !== undefined) {
    query.isFeatured = req.query.isFeatured === 'true';
  }

  const products = await Product.find(query)
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('-reviews');

  const total = await Product.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: products.length,
    pagination: {
      page,
      pages: Math.ceil(total / limit),
      total
    },
    data: {
      products
    }
  });
});

export const getProductStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const stats = await Product.aggregate([
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        activeProducts: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        featuredProducts: {
          $sum: { $cond: [{ $eq: ['$isFeatured', true] }, 1, 0] }
        },
        averageRating: { $avg: '$averageRating' },
        totalReviews: { $sum: '$totalReviews' }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats: stats[0] || {
        totalProducts: 0,
        activeProducts: 0,
        featuredProducts: 0,
        averageRating: 0,
        totalReviews: 0
      }
    }
  });
});

// Bulk operations
export const bulkDeleteProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { productIds } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return next(new AppError('Product IDs are required', 400));
  }

  // Get products to delete their images from Cloudinary
  const products = await Product.find({ _id: { $in: productIds } });
  
  // Delete from database
  const result = await Product.deleteMany({ _id: { $in: productIds } });

  // TODO: Delete images from Cloudinary in background job
  // For now, just log the images that need to be deleted
  const imagesToDelete = products.flatMap(product => product.images || []);
  if (imagesToDelete.length > 0) {
    console.log('Images to delete from Cloudinary:', imagesToDelete);
  }

  res.status(200).json({
    status: 'success',
    message: `Successfully deleted ${result.deletedCount} products`,
    data: {
      deletedCount: result.deletedCount,
      deletedImages: imagesToDelete.length
    }
  });
});

export const bulkToggleProductStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { productIds, isActive } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return next(new AppError('Product IDs are required', 400));
  }

  if (typeof isActive !== 'boolean') {
    return next(new AppError('isActive must be a boolean value', 400));
  }

  const result = await Product.updateMany(
    { _id: { $in: productIds } },
    { isActive }
  );

  res.status(200).json({
    status: 'success',
    message: `Successfully ${isActive ? 'activated' : 'deactivated'} ${result.modifiedCount} products`,
    data: {
      modifiedCount: result.modifiedCount
    }
  });
});

export const bulkToggleProductFeatured = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { productIds, isFeatured } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return next(new AppError('Product IDs are required', 400));
  }

  if (typeof isFeatured !== 'boolean') {
    return next(new AppError('isFeatured must be a boolean value', 400));
  }

  const result = await Product.updateMany(
    { _id: { $in: productIds } },
    { isFeatured }
  );

  res.status(200).json({
    status: 'success',
    message: `Successfully ${isFeatured ? 'featured' : 'unfeatured'} ${result.modifiedCount} products`,
    data: {
      modifiedCount: result.modifiedCount
    }
  });
});

/**
 * @desc    Get product stock information
 * @route   GET /api/v1/products/:id/stock
 * @access  Public
 */
export const getProductStock = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Calculate total stock and variant availability
  const stockInfo = {
    productId: product._id,
    productName: product.name,
    totalStock: 0,
    isAvailable: false,
    lowStockThreshold: 10,
    isLowStock: false,
    variants: [] as Array<{
      variantId: string;
      size?: string;
      color?: string;
      stock: number;
      isAvailable: boolean;
      isLowStock: boolean;
    }>
  };

  // Calculate stock for each variant
  for (const variant of product.variants) {
    const variantStock = variant.stock || 0;
    stockInfo.totalStock += variantStock;

    stockInfo.variants.push({
      variantId: variant._id?.toString() || '',
      size: variant.size,
      color: variant.color,
      stock: variantStock,
      isAvailable: variantStock > 0,
      isLowStock: variantStock > 0 && variantStock <= stockInfo.lowStockThreshold
    });
  }

  stockInfo.isAvailable = stockInfo.totalStock > 0;
  stockInfo.isLowStock = stockInfo.totalStock > 0 && stockInfo.totalStock <= stockInfo.lowStockThreshold;

  res.status(200).json({
    status: 'success',
    data: stockInfo
  });
});

/**
 * @desc    Check multiple products stock (bulk check)
 * @route   POST /api/v1/products/stock/bulk-check
 * @access  Public
 */
export const bulkCheckStock = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { productIds } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return next(new AppError('Product IDs are required', 400));
  }

  const products = await Product.find({ _id: { $in: productIds } });

  const stockInfo = products.map(product => {
    const totalStock = product.variants.reduce((sum, variant) => sum + (variant.stock || 0), 0);
    
    return {
      productId: product._id,
      productName: product.name,
      totalStock,
      isAvailable: totalStock > 0,
      isLowStock: totalStock > 0 && totalStock <= 10
    };
  });

  res.status(200).json({
    status: 'success',
    count: stockInfo.length,
    data: stockInfo
  });
});