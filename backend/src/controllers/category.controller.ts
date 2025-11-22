import { Request, Response, NextFunction } from 'express';
import Category from '../models/Category.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { AuthRequest } from '../types/index.js';
import { deleteFromCloudinary } from '../config/cloudinary.js';

// Helper function to extract public ID from Cloudinary URL
const getPublicIdFromUrl = (url: string): string | null => {
  if (!url) return null;
  const matches = url.match(/\/v\d+\/(.+)\./);
  return matches ? matches[1] : null;
};

export const getAllCategories = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const categories = await Category.find({ isActive: true })
    .populate('parentCategory', 'name slug')
    .sort({ sortOrder: 1, name: 1 });

  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: {
      categories
    }
  });
});

export const getCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const category = await Category.findOne({ 
    slug: req.params.slug,
    isActive: true 
  }).populate('parentCategory', 'name slug');

  if (!category) {
    return next(new AppError('No category found with that slug', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      category
    }
  });
});

export const getCategoryById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const category = await Category.findById(req.params.id)
    .populate('parentCategory', 'name slug');

  if (!category) {
    return next(new AppError('No category found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      category
    }
  });
});

export const createCategory = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { name, description, parentCategory, sortOrder } = req.body;
  
  // Generate slug from name
  const slug = name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
  
  // Check if slug already exists
  const existingCategory = await Category.findOne({ slug });
  if (existingCategory) {
    return next(new AppError('Category with this name already exists', 400));
  }

  const newCategory = await Category.create({
    name,
    slug,
    description,
    parentCategory,
    sortOrder: sortOrder || 0,
    image: req.file?.path
  });

  res.status(201).json({
    status: 'success',
    data: {
      category: newCategory
    }
  });
});

export const updateCategory = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { name, description, parentCategory, sortOrder, isActive } = req.body;
  
  // First get the existing category to access the old image
  const existingCategory = await Category.findById(req.params.id);
  if (!existingCategory) {
    return next(new AppError('No category found with that ID', 404));
  }
  
  const updateData: any = {
    description,
    parentCategory,
    sortOrder,
    isActive
  };

  // If name is being updated, generate new slug
  if (name) {
    const slug = name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
    
    // Check if new slug already exists (excluding current category)
    const existingSlugCategory = await Category.findOne({ 
      slug, 
      _id: { $ne: req.params.id } 
    });
    
    if (existingSlugCategory) {
      return next(new AppError('Category with this name already exists', 400));
    }
    
    updateData.name = name;
    updateData.slug = slug;
  }

  // Handle image update
  if (req.file) {
    // Delete old image from Cloudinary if it exists
    if (existingCategory.image) {
      const oldPublicId = getPublicIdFromUrl(existingCategory.image);
      if (oldPublicId) {
        try {
          await deleteFromCloudinary(oldPublicId);
        } catch (error) {
          console.error('Error deleting old image from Cloudinary:', error);
          // Don't fail the request if image deletion fails
        }
      }
    }
    updateData.image = req.file.path;
  }

  const category = await Category.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      category
    }
  });
});

export const deleteCategory = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError('No category found with that ID', 404));
  }

  // Delete image from Cloudinary if it exists
  if (category.image) {
    const publicId = getPublicIdFromUrl(category.image);
    if (publicId) {
      try {
        await deleteFromCloudinary(publicId);
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        // Don't fail the request if image deletion fails
      }
    }
  }

  // Delete the category from database
  await Category.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Admin routes
export const getAllCategoriesAdmin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const query: any = {};
  
  if (req.query.search) {
    query.name = { $regex: req.query.search, $options: 'i' };
  }

  if (req.query.isActive !== undefined) {
    query.isActive = req.query.isActive === 'true';
  }

  const categories = await Category.find(query)
    .populate('parentCategory', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Category.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: categories.length,
    pagination: {
      page,
      pages: Math.ceil(total / limit),
      total
    },
    data: {
      categories
    }
  });
});

// Bulk operations
export const bulkDeleteCategories = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { categoryIds } = req.body;

  if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
    return next(new AppError('Category IDs are required', 400));
  }

  // Get categories to delete their images from Cloudinary
  const categories = await Category.find({ _id: { $in: categoryIds } });
  
  // Delete from database
  const result = await Category.deleteMany({ _id: { $in: categoryIds } });

  // TODO: Delete images from Cloudinary in background job
  // For now, just log the images that need to be deleted
  const imagesToDelete = categories
    .filter(category => category.image)
    .map(category => category.image);
  
  if (imagesToDelete.length > 0) {
    console.log('Images to delete from Cloudinary:', imagesToDelete);
  }

  res.status(200).json({
    status: 'success',
    message: `Successfully deleted ${result.deletedCount} categories`,
    data: {
      deletedCount: result.deletedCount,
      deletedImages: imagesToDelete.length
    }
  });
});

export const bulkToggleCategoryStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { categoryIds, isActive } = req.body;

  if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
    return next(new AppError('Category IDs are required', 400));
  }

  if (typeof isActive !== 'boolean') {
    return next(new AppError('isActive must be a boolean value', 400));
  }

  const result = await Category.updateMany(
    { _id: { $in: categoryIds } },
    { isActive }
  );

  res.status(200).json({
    status: 'success',
    message: `Successfully ${isActive ? 'activated' : 'deactivated'} ${result.modifiedCount} categories`,
    data: {
      modifiedCount: result.modifiedCount
    }
  });
});