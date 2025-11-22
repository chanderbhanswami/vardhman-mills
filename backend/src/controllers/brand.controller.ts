import { Request, Response, NextFunction } from 'express';
import Brand from '../models/brand.model';
import Product from '../models/Product.model';
import Category from '../models/Category.model';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary';

// Get all brands with filtering, sorting, and pagination
export const getBrands = catchAsync(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 20,
    sort = '-createdAt',
    isActive,
    isFeatured,
    search,
    country,
    tags
  } = req.query;

  const query: any = {};

  // Filters
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }
  if (isFeatured !== undefined) {
    query.isFeatured = isFeatured === 'true';
  }
  if (country) {
    query.country = country;
  }
  if (tags) {
    query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
  }
  if (search) {
    query.$text = { $search: search as string };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [brands, total] = await Promise.all([
    Brand.find(query)
      .sort(sort as string)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Brand.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: brands.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: brands
  });
});

// Get brand by ID
export const getBrandById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const brand = await Brand.findById(req.params.id).lean();

  if (!brand) {
    return next(new AppError('Brand not found', 404));
  }

  res.status(200).json({
    success: true,
    data: brand
  });
});

// Get brand by slug
export const getBrandBySlug = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const brand = await Brand.findOne({ slug: req.params.slug }).lean();

  if (!brand) {
    return next(new AppError('Brand not found', 404));
  }

  res.status(200).json({
    success: true,
    data: brand
  });
});

// Get featured brands
export const getFeaturedBrands = catchAsync(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 10;

  const brands = await Brand.find({ isActive: true, isFeatured: true })
    .sort({ sortOrder: 1, name: 1 })
    .limit(limit)
    .lean();

  res.status(200).json({
    success: true,
    count: brands.length,
    data: brands
  });
});

// Get brand products
export const getBrandProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const {
    page = 1,
    limit = 20,
    sort = '-createdAt',
    minPrice,
    maxPrice,
    inStock,
    isFeatured,
    category
  } = req.query;

  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    return next(new AppError('Brand not found', 404));
  }

  const query: any = { brand: req.params.id, isActive: true };

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (inStock === 'true') {
    query.stock = { $gt: 0 };
  }
  if (isFeatured !== undefined) {
    query.isFeatured = isFeatured === 'true';
  }
  if (category) {
    query.category = category;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sort as string)
      .skip(skip)
      .limit(Number(limit))
      .populate('category', 'name slug')
      .lean(),
    Product.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    brand: { id: brand._id, name: brand.name, slug: brand.slug },
    count: products.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: products
  });
});

// Get brand categories
export const getBrandCategories = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    return next(new AppError('Brand not found', 404));
  }

  // Get distinct category IDs from products of this brand
  const categoryIds = await Product.distinct('category', { brand: req.params.id, isActive: true });

  const categories = await Category.find({ _id: { $in: categoryIds }, isActive: true })
    .select('name slug image description')
    .lean();

  res.status(200).json({
    success: true,
    brand: { id: brand._id, name: brand.name, slug: brand.slug },
    count: categories.length,
    data: categories
  });
});

// Get brand statistics
export const getBrandStatistics = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { startDate, endDate } = req.query;

  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    return next(new AppError('Brand not found', 404));
  }

  const dateQuery: any = { brand: req.params.id };
  if (startDate || endDate) {
    dateQuery.createdAt = {};
    if (startDate) dateQuery.createdAt.$gte = new Date(startDate as string);
    if (endDate) dateQuery.createdAt.$lte = new Date(endDate as string);
  }

  const [
    totalProducts,
    activeProducts,
    totalSales,
    averagePrice,
    topProducts
  ] = await Promise.all([
    Product.countDocuments({ brand: req.params.id }),
    Product.countDocuments({ brand: req.params.id, isActive: true }),
    Product.aggregate([
      { $match: { brand: brand._id } },
      { $group: { _id: null, total: { $sum: '$soldCount' } } }
    ]),
    Product.aggregate([
      { $match: { brand: brand._id, isActive: true } },
      { $group: { _id: null, avgPrice: { $avg: '$price' } } }
    ]),
    Product.find({ brand: req.params.id, isActive: true })
      .sort({ soldCount: -1 })
      .limit(5)
      .select('name slug price image soldCount averageRating')
      .lean()
  ]);

  const statistics = {
    brand: {
      id: brand._id,
      name: brand.name,
      slug: brand.slug,
      productCount: brand.productCount,
      averageRating: brand.averageRating,
      totalReviews: brand.totalReviews
    },
    products: {
      total: totalProducts,
      active: activeProducts,
      inactive: totalProducts - activeProducts
    },
    sales: {
      totalSold: totalSales[0]?.total || 0,
      averagePrice: averagePrice[0]?.avgPrice || 0
    },
    topProducts
  };

  res.status(200).json({
    success: true,
    data: statistics
  });
});

// Create brand
export const createBrand = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const brand = await Brand.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Brand created successfully',
    data: brand
  });
});

// Update brand
export const updateBrand = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const brand = await Brand.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!brand) {
    return next(new AppError('Brand not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Brand updated successfully',
    data: brand
  });
});

// Delete brand
export const deleteBrand = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { force = 'false', reassignTo } = req.query;

  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    return next(new AppError('Brand not found', 404));
  }

  // Check if brand has products
  const productCount = await Product.countDocuments({ brand: req.params.id });

  if (productCount > 0) {
    if (force === 'true') {
      if (reassignTo) {
        // Reassign products to another brand
        await Product.updateMany(
          { brand: req.params.id },
          { brand: reassignTo }
        );
      } else {
        // Delete all products
        await Product.deleteMany({ brand: req.params.id });
      }
    } else {
      return next(new AppError(
        `Cannot delete brand with ${productCount} products. Use force=true to delete or provide reassignTo parameter.`,
        400
      ));
    }
  }

  // Delete brand images from Cloudinary
  if (brand.logo) {
    await deleteFromCloudinary(brand.logo);
  }
  if (brand.banner) {
    await deleteFromCloudinary(brand.banner);
  }

  await brand.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Brand deleted successfully'
  });
});

// Upload brand logo
export const uploadBrandLogo = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    return next(new AppError('Brand not found', 404));
  }

  if (!req.file) {
    return next(new AppError('Please upload a logo image', 400));
  }

  // Delete old logo if exists
  if (brand.logo) {
    await deleteFromCloudinary(brand.logo);
  }

  // Upload new logo
  const result = await uploadToCloudinary(req.file.buffer, 'brands/logos');
  brand.logo = result.secure_url;
  await brand.save();

  res.status(200).json({
    success: true,
    message: 'Logo uploaded successfully',
    data: { logo: brand.logo }
  });
});

// Upload brand banner
export const uploadBrandBanner = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    return next(new AppError('Brand not found', 404));
  }

  if (!req.file) {
    return next(new AppError('Please upload a banner image', 400));
  }

  // Delete old banner if exists
  if (brand.banner) {
    await deleteFromCloudinary(brand.banner);
  }

  // Upload new banner
  const result = await uploadToCloudinary(req.file.buffer, 'brands/banners');
  brand.banner = result.secure_url;
  await brand.save();

  res.status(200).json({
    success: true,
    message: 'Banner uploaded successfully',
    data: { banner: brand.banner }
  });
});

// Delete brand logo
export const deleteBrandLogo = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    return next(new AppError('Brand not found', 404));
  }

  if (brand.logo) {
    await deleteFromCloudinary(brand.logo);
    brand.logo = undefined;
    await brand.save();
  }

  res.status(200).json({
    success: true,
    message: 'Logo deleted successfully'
  });
});

// Delete brand banner
export const deleteBrandBanner = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    return next(new AppError('Brand not found', 404));
  }

  if (brand.banner) {
    await deleteFromCloudinary(brand.banner);
    brand.banner = undefined;
    await brand.save();
  }

  res.status(200).json({
    success: true,
    message: 'Banner deleted successfully'
  });
});

// Get brand performance comparison
export const getBrandPerformanceComparison = catchAsync(async (req: Request, res: Response) => {
  const { startDate, endDate, limit = 10 } = req.query;

  const dateMatch: any = {};
  if (startDate || endDate) {
    dateMatch.createdAt = {};
    if (startDate) dateMatch.createdAt.$gte = new Date(startDate as string);
    if (endDate) dateMatch.createdAt.$lte = new Date(endDate as string);
  }

  const performance = await Product.aggregate([
    { $match: { isActive: true, ...dateMatch } },
    {
      $group: {
        _id: '$brand',
        totalProducts: { $sum: 1 },
        totalSales: { $sum: '$soldCount' },
        averagePrice: { $avg: '$price' },
        averageRating: { $avg: '$averageRating' },
        totalRevenue: { $sum: { $multiply: ['$price', '$soldCount'] } }
      }
    },
    {
      $lookup: {
        from: 'brands',
        localField: '_id',
        foreignField: '_id',
        as: 'brand'
      }
    },
    { $unwind: '$brand' },
    {
      $project: {
        brandId: '$brand._id',
        brandName: '$brand.name',
        brandSlug: '$brand.slug',
        brandLogo: '$brand.logo',
        totalProducts: 1,
        totalSales: 1,
        averagePrice: 1,
        averageRating: 1,
        totalRevenue: 1
      }
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: Number(limit) }
  ]);

  res.status(200).json({
    success: true,
    count: performance.length,
    data: performance
  });
});

// Get market share analysis
export const getMarketShareAnalysis = catchAsync(async (req: Request, res: Response) => {
  const { period = '30d' } = req.query;

  const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const marketShare = await Product.aggregate([
    { $match: { isActive: true, createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$brand',
        productCount: { $sum: 1 },
        totalSales: { $sum: '$soldCount' },
        totalRevenue: { $sum: { $multiply: ['$price', '$soldCount'] } }
      }
    },
    {
      $lookup: {
        from: 'brands',
        localField: '_id',
        foreignField: '_id',
        as: 'brand'
      }
    },
    { $unwind: '$brand' },
    {
      $group: {
        _id: null,
        brands: {
          $push: {
            brandId: '$brand._id',
            brandName: '$brand.name',
            brandSlug: '$brand.slug',
            productCount: '$productCount',
            totalSales: '$totalSales',
            totalRevenue: '$totalRevenue'
          }
        },
        totalProducts: { $sum: '$productCount' },
        totalSales: { $sum: '$totalSales' },
        totalRevenue: { $sum: '$totalRevenue' }
      }
    },
    {
      $project: {
        _id: 0,
        brands: {
          $map: {
            input: '$brands',
            as: 'brand',
            in: {
              brandId: '$$brand.brandId',
              brandName: '$$brand.brandName',
              brandSlug: '$$brand.brandSlug',
              productCount: '$$brand.productCount',
              totalSales: '$$brand.totalSales',
              totalRevenue: '$$brand.totalRevenue',
              productShare: {
                $multiply: [
                  { $divide: ['$$brand.productCount', '$totalProducts'] },
                  100
                ]
              },
              salesShare: {
                $multiply: [
                  { $divide: ['$$brand.totalSales', '$totalSales'] },
                  100
                ]
              },
              revenueShare: {
                $multiply: [
                  { $divide: ['$$brand.totalRevenue', '$totalRevenue'] },
                  100
                ]
              }
            }
          }
        },
        totals: {
          products: '$totalProducts',
          sales: '$totalSales',
          revenue: '$totalRevenue'
        }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    period: { days, startDate },
    data: marketShare[0] || { brands: [], totals: { products: 0, sales: 0, revenue: 0 } }
  });
});

// Update brand SEO
export const updateBrandSEO = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { seoTitle, seoDescription, seoKeywords } = req.body;

  const brand = await Brand.findByIdAndUpdate(
    req.params.id,
    { seoTitle, seoDescription, seoKeywords },
    { new: true, runValidators: true }
  );

  if (!brand) {
    return next(new AppError('Brand not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'SEO updated successfully',
    data: {
      seoTitle: brand.seoTitle,
      seoDescription: brand.seoDescription,
      seoKeywords: brand.seoKeywords
    }
  });
});

// Generate brand sitemap
export const generateBrandSitemap = catchAsync(async (req: Request, res: Response) => {
  const brands = await Brand.find({ isActive: true })
    .select('slug updatedAt')
    .sort({ updatedAt: -1 })
    .lean();

  const sitemap = brands.map(brand => ({
    url: `/brands/${brand.slug}`,
    lastModified: brand.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8
  }));

  res.status(200).json({
    success: true,
    count: sitemap.length,
    data: sitemap
  });
});

// Search brands
export const searchBrands = catchAsync(async (req: Request, res: Response) => {
  const { q, limit = 10 } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required'
    });
  }

  const brands = await Brand.find(
    { $text: { $search: q as string }, isActive: true },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(Number(limit))
    .select('name slug logo description country')
    .lean();

  return res.status(200).json({
    success: true,
    count: brands.length,
    data: brands
  });
});

// Get brand suggestions
export const getBrandSuggestions = catchAsync(async (req: Request, res: Response) => {
  const { q, limit = 5 } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      message: 'Query is required'
    });
  }

  const brands = await Brand.find({
    name: { $regex: q as string, $options: 'i' },
    isActive: true
  })
    .select('name slug logo')
    .limit(Number(limit))
    .lean();

  return res.status(200).json({
    success: true,
    count: brands.length,
    data: brands
  });
});

// Get similar brands
export const getSimilarBrands = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { limit = 5 } = req.query;

  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    return next(new AppError('Brand not found', 404));
  }

  // Find brands from same country or with similar tags
  const query: any = {
    _id: { $ne: req.params.id },
    isActive: true
  };

  if (brand.country) {
    query.$or = [
      { country: brand.country },
      { tags: { $in: brand.tags || [] } }
    ];
  } else if (brand.tags && brand.tags.length > 0) {
    query.tags = { $in: brand.tags };
  }

  const similarBrands = await Brand.find(query)
    .select('name slug logo description country')
    .limit(Number(limit))
    .lean();

  res.status(200).json({
    success: true,
    count: similarBrands.length,
    data: similarBrands
  });
});

// Admin: Get all brands statistics
export const getAllBrandsStatistics = catchAsync(async (req: Request, res: Response) => {
  const [
    totalBrands,
    activeBrands,
    featuredBrands,
    brandsWithProducts,
    topBrands
  ] = await Promise.all([
    Brand.countDocuments(),
    Brand.countDocuments({ isActive: true }),
    Brand.countDocuments({ isFeatured: true }),
    Brand.countDocuments({ productCount: { $gt: 0 } }),
    Brand.find({ isActive: true })
      .sort({ productCount: -1, totalSales: -1 })
      .limit(10)
      .select('name slug logo productCount totalSales averageRating')
      .lean()
  ]);

  const statistics = {
    overview: {
      total: totalBrands,
      active: activeBrands,
      inactive: totalBrands - activeBrands,
      featured: featuredBrands,
      withProducts: brandsWithProducts,
      withoutProducts: totalBrands - brandsWithProducts
    },
    topBrands
  };

  res.status(200).json({
    success: true,
    data: statistics
  });
});

// Admin: Bulk update brands
export const bulkUpdateBrands = catchAsync(async (req: Request, res: Response) => {
  const { brandIds, updates } = req.body;

  if (!brandIds || !Array.isArray(brandIds) || brandIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Brand IDs array is required'
    });
  }

  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Updates object is required'
    });
  }

  const result = await Brand.updateMany(
    { _id: { $in: brandIds } },
    { $set: updates }
  );

  return res.status(200).json({
    success: true,
    message: `${result.modifiedCount} brands updated successfully`,
    data: {
      matched: result.matchedCount,
      modified: result.modifiedCount
    }
  });
});

// Admin: Bulk delete brands
export const bulkDeleteBrands = catchAsync(async (req: Request, res: Response) => {
  const { brandIds, force = false, reassignTo } = req.body;

  if (!brandIds || !Array.isArray(brandIds) || brandIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Brand IDs array is required'
    });
  }

  if (force) {
    if (reassignTo) {
      // Reassign all products to another brand
      await Product.updateMany(
        { brand: { $in: brandIds } },
        { brand: reassignTo }
      );
    } else {
      // Delete all products
      await Product.deleteMany({ brand: { $in: brandIds } });
    }
  } else {
    // Check if any brand has products
    const brandsWithProducts = await Product.distinct('brand', { brand: { $in: brandIds } });
    if (brandsWithProducts.length > 0) {
      return res.status(400).json({
        success: false,
        message: `${brandsWithProducts.length} brands have products. Use force=true to delete.`
      });
    }
  }

  const result = await Brand.deleteMany({ _id: { $in: brandIds } });

  return res.status(200).json({
    success: true,
    message: `${result.deletedCount} brands deleted successfully`,
    data: { deletedCount: result.deletedCount }
  });
});

// Admin: Validate brand data
export const validateBrandData = catchAsync(async (req: Request, res: Response) => {
  const issues = [];

  // Find brands without products
  const brandsWithoutProducts = await Brand.find({ productCount: 0 }).select('_id name').lean();
  if (brandsWithoutProducts.length > 0) {
    issues.push({
      type: 'no_products',
      severity: 'warning',
      count: brandsWithoutProducts.length,
      message: `${brandsWithoutProducts.length} brands have no products`,
      brands: brandsWithoutProducts
    });
  }

  // Find brands without logo
  const brandsWithoutLogo = await Brand.find({ logo: { $exists: false } }).select('_id name').lean();
  if (brandsWithoutLogo.length > 0) {
    issues.push({
      type: 'no_logo',
      severity: 'info',
      count: brandsWithoutLogo.length,
      message: `${brandsWithoutLogo.length} brands have no logo`,
      brands: brandsWithoutLogo
    });
  }

  // Find brands with outdated product counts
  const brands = await Brand.find().select('_id productCount').lean();
  for (const brand of brands) {
    const actualCount = await Product.countDocuments({ brand: brand._id });
    if (actualCount !== brand.productCount) {
      issues.push({
        type: 'incorrect_product_count',
        severity: 'error',
        brandId: brand._id,
        expected: actualCount,
        actual: brand.productCount
      });
    }
  }

  res.status(200).json({
    success: true,
    issuesFound: issues.length,
    data: issues
  });
});
