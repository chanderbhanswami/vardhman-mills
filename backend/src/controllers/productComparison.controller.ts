import { Request, Response, NextFunction } from 'express';
import ProductComparison from '../models/ProductComparison.model';
import Product from '../models/Product.model.js';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import mongoose from 'mongoose';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { Parser as Json2CsvParser } from 'json2csv';

// ==================== CRUD OPERATIONS ====================

/**
 * Get user comparisons
 * GET /api/comparisons
 */
export const getUserComparisons = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)?._id;
  const sessionId = req.query.sessionId as string;
  
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const category = req.query.category as string;
  
  let comparisons: any[] = [];
  
  if (userId) {
    comparisons = await ProductComparison.getUserComparisons(userId, {
      page,
      limit,
      category
    });
  } else if (sessionId) {
    comparisons = await ProductComparison.find({ sessionId })
      .populate('products', 'name images price rating')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
  } else {
    comparisons = [];
  }
  
  res.status(200).json({
    success: true,
    data: comparisons,
    page,
    limit
  });
});

/**
 * Get single comparison
 * GET /api/comparisons/:id
 */
export const getComparison = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = (req.user as any)?._id;
  const sessionId = req.query.sessionId as string;
  
  const comparison = await ProductComparison.findById(id)
    .populate('products')
    .populate('user', 'name');
  
  if (!comparison) {
    return next(new AppError('Comparison not found', 404));
  }
  
  // Check access rights
  if (!comparison.isPublic) {
    const hasAccess = 
      (userId && comparison.user && comparison.user.toString() === userId.toString()) ||
      (sessionId && comparison.sessionId === sessionId);
    
    if (!hasAccess) {
      return next(new AppError('Access denied', 403));
    }
  }
  
  // Increment view count
  await comparison.incrementViews();
  
  res.status(200).json({
    success: true,
    data: comparison
  });
});

/**
 * Create comparison
 * POST /api/comparisons
 */
export const createComparison = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req.user as any)?._id;
  const { products, name, description, sessionId } = req.body;
  
  if (!products || !Array.isArray(products) || products.length < 2) {
    return next(new AppError('At least 2 products are required', 400));
  }
  
  if (products.length > 10) {
    return next(new AppError('Maximum 10 products can be compared', 400));
  }
  
  const comparisonData: any = {
    products,
    name,
    description
  };
  
  if (userId) {
    comparisonData.user = userId;
  } else if (sessionId) {
    comparisonData.sessionId = sessionId;
  } else {
    return next(new AppError('User authentication or session ID required', 401));
  }
  
  const comparison = await ProductComparison.create(comparisonData);
  await comparison.populate('products', 'name images price rating');
  
  res.status(201).json({
    success: true,
    data: comparison,
    message: 'Comparison created successfully'
  });
});

/**
 * Update comparison
 * PUT /api/comparisons/:id
 */
export const updateComparison = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = (req.user as any)?._id;
  const sessionId = req.query.sessionId as string;
  
  const comparison = await ProductComparison.findById(id);
  
  if (!comparison) {
    return next(new AppError('Comparison not found', 404));
  }
  
  // Check ownership
  const isOwner = 
    (userId && comparison.user && comparison.user.toString() === userId.toString()) ||
    (sessionId && comparison.sessionId === sessionId);
  
  if (!isOwner) {
    return next(new AppError('Access denied', 403));
  }
  
  const { name, description, isPublic } = req.body;
  
  if (name !== undefined) comparison.name = name;
  if (description !== undefined) comparison.description = description;
  if (isPublic !== undefined) comparison.isPublic = isPublic;
  
  await comparison.save();
  await comparison.populate('products', 'name images price rating');
  
  res.status(200).json({
    success: true,
    data: comparison,
    message: 'Comparison updated successfully'
  });
});

/**
 * Delete comparison
 * DELETE /api/comparisons/:id
 */
export const deleteComparison = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = (req.user as any)?._id;
  const sessionId = req.query.sessionId as string;
  
  const comparison = await ProductComparison.findById(id);
  
  if (!comparison) {
    return next(new AppError('Comparison not found', 404));
  }
  
  // Check ownership
  const isOwner = 
    (userId && comparison.user && comparison.user.toString() === userId.toString()) ||
    (sessionId && comparison.sessionId === sessionId);
  
  if (!isOwner) {
    return next(new AppError('Access denied', 403));
  }
  
  await ProductComparison.findByIdAndDelete(id);
  
  res.status(200).json({
    success: true,
    message: 'Comparison deleted successfully'
  });
});

// ==================== PRODUCT MANAGEMENT ====================

/**
 * Add product to comparison
 * POST /api/comparisons/:id/products
 */
export const addProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { productId } = req.body;
  const userId = (req.user as any)?._id;
  const sessionId = req.query.sessionId as string;
  
  if (!productId) {
    return next(new AppError('Product ID is required', 400));
  }
  
  const comparison = await ProductComparison.findById(id);
  
  if (!comparison) {
    return next(new AppError('Comparison not found', 404));
  }
  
  // Check ownership
  const isOwner = 
    (userId && comparison.user && comparison.user.toString() === userId.toString()) ||
    (sessionId && comparison.sessionId === sessionId);
  
  if (!isOwner) {
    return next(new AppError('Access denied', 403));
  }
  
  try {
    await comparison.addProduct(new mongoose.Types.ObjectId(productId));
    await comparison.populate('products', 'name images price rating');
    
    res.status(200).json({
      success: true,
      data: comparison,
      message: 'Product added to comparison'
    });
  } catch (error: any) {
    return next(new AppError(error.message, 400));
  }
});

/**
 * Remove product from comparison
 * DELETE /api/comparisons/:id/products/:productId
 */
export const removeProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id, productId } = req.params;
  const userId = (req.user as any)?._id;
  const sessionId = req.query.sessionId as string;
  
  const comparison = await ProductComparison.findById(id);
  
  if (!comparison) {
    return next(new AppError('Comparison not found', 404));
  }
  
  // Check ownership
  const isOwner = 
    (userId && comparison.user && comparison.user.toString() === userId.toString()) ||
    (sessionId && comparison.sessionId === sessionId);
  
  if (!isOwner) {
    return next(new AppError('Access denied', 403));
  }
  
  try {
    await comparison.removeProduct(new mongoose.Types.ObjectId(productId));
    await comparison.populate('products', 'name images price rating');
    
    res.status(200).json({
      success: true,
      data: comparison,
      message: 'Product removed from comparison'
    });
  } catch (error: any) {
    return next(new AppError(error.message, 400));
  }
});

// ==================== COMPARISON ANALYSIS ====================

/**
 * Get detailed comparison with features
 * GET /api/comparisons/:id/analyze
 */
export const analyzeComparison = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = (req.user as any)?._id;
  const sessionId = req.query.sessionId as string;
  
  const comparison = await ProductComparison.findById(id)
    .populate('products');
  
  if (!comparison) {
    return next(new AppError('Comparison not found', 404));
  }
  
  // Check access
  if (!comparison.isPublic) {
    const hasAccess = 
      (userId && comparison.user && comparison.user.toString() === userId.toString()) ||
      (sessionId && comparison.sessionId === sessionId);
    
    if (!hasAccess) {
      return next(new AppError('Access denied', 403));
    }
  }
  
  // Extract comparison features from products
  const products = comparison.products as any[];
  const features: any[] = [];
  
  // Common features to compare
  const featureNames = [
    'price',
    'rating',
    'brand',
    'inStock',
    'discount',
    'warranty',
    'weight',
    'dimensions',
    'color',
    'material'
  ];
  
  featureNames.forEach(featureName => {
    const values = products.map(product => {
      return product[featureName] !== undefined ? product[featureName] : 'N/A';
    });
    
    // Determine feature type
    let type = 'text';
    if (typeof values[0] === 'number') type = 'number';
    if (typeof values[0] === 'boolean') type = 'boolean';
    if (featureName === 'rating') type = 'rating';
    
    features.push({
      name: featureName,
      values,
      type
    });
  });
  
  // Calculate winner based on multiple factors
  let winnerIndex = 0;
  let highestScore = 0;
  const scores: number[] = [];
  const reasons: string[][] = [];
  
  products.forEach((product, index) => {
    let score = 0;
    const productReasons: string[] = [];
    
    // Rating score (0-25 points)
    if (product.rating) {
      const ratingScore = (product.rating / 5) * 25;
      score += ratingScore;
      if (product.rating >= 4.5) {
        productReasons.push('Excellent customer rating');
      }
    }
    
    // Price score (0-25 points) - lower is better
    if (product.price) {
      const prices = products.map(p => p.price).filter(p => p);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const priceScore = maxPrice > minPrice 
        ? ((maxPrice - product.price) / (maxPrice - minPrice)) * 25
        : 25;
      score += priceScore;
      if (product.price === minPrice) {
        productReasons.push('Best price');
      }
    }
    
    // Stock availability (0-15 points)
    if (product.inStock) {
      score += 15;
      productReasons.push('In stock');
    }
    
    // Discount (0-15 points)
    if (product.discount && product.discount > 0) {
      score += (product.discount / 100) * 15;
      if (product.discount >= 20) {
        productReasons.push('Great discount');
      }
    }
    
    // Reviews count (0-20 points)
    if (product.reviewCount) {
      const reviewScore = Math.min((product.reviewCount / 100) * 20, 20);
      score += reviewScore;
      if (product.reviewCount >= 50) {
        productReasons.push('Well reviewed');
      }
    }
    
    scores.push(score);
    reasons.push(productReasons);
    
    if (score > highestScore) {
      highestScore = score;
      winnerIndex = index;
    }
  });
  
  const analysisResult = {
    comparison,
    features,
    scores: products.map((product, index) => ({
      productId: product._id,
      productName: product.name,
      score: Math.round(scores[index]),
      reasons: reasons[index]
    })),
    winner: {
      productId: products[winnerIndex]._id,
      productName: products[winnerIndex].name,
      score: Math.round(highestScore),
      reasons: reasons[winnerIndex]
    }
  };
  
  // Cache the analysis
  comparison.comparisonData = {
    features,
    winner: {
      productId: products[winnerIndex]._id,
      score: Math.round(highestScore),
      reasons: reasons[winnerIndex]
    }
  };
  await comparison.save();
  
  res.status(200).json({
    success: true,
    data: analysisResult
  });
});

/**
 * Compare by category-specific features
 * GET /api/comparisons/:id/category-features
 */
export const getCategoryFeatures = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = (req.user as any)?._id;
  const sessionId = req.query.sessionId as string;
  
  const comparison = await ProductComparison.findById(id)
    .populate('products');
  
  if (!comparison) {
    return next(new AppError('Comparison not found', 404));
  }
  
  // Check access
  if (!comparison.isPublic) {
    const hasAccess = 
      (userId && comparison.user && comparison.user.toString() === userId.toString()) ||
      (sessionId && comparison.sessionId === sessionId);
    
    if (!hasAccess) {
      return next(new AppError('Access denied', 403));
    }
  }
  
  const products = comparison.products as any[];
  const category = comparison.category?.toLowerCase() || '';
  
  // Define category-specific features
  const categoryFeatures: Record<string, string[]> = {
    electronics: ['processor', 'ram', 'storage', 'battery', 'screen', 'camera'],
    clothing: ['size', 'material', 'color', 'fit', 'washCare'],
    books: ['author', 'publisher', 'pages', 'language', 'binding'],
    furniture: ['dimensions', 'material', 'weight', 'assembly', 'warranty'],
    default: ['brand', 'color', 'material', 'warranty']
  };
  
  const featureNames = categoryFeatures[category] || categoryFeatures.default;
  const features: any[] = [];
  
  featureNames.forEach(featureName => {
    const values = products.map(product => {
      // Try to get from specifications or main fields
      const value = product.specifications?.[featureName] || product[featureName];
      return value !== undefined ? value : 'N/A';
    });
    
    features.push({
      name: featureName,
      values,
      type: typeof values[0] === 'number' ? 'number' : 'text'
    });
  });
  
  res.status(200).json({
    success: true,
    data: {
      category: comparison.category,
      features
    }
  });
});

// ==================== SHARING ====================

/**
 * Generate share link
 * POST /api/comparisons/:id/share
 */
export const generateShareLink = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = (req.user as any)?._id;
  const sessionId = req.query.sessionId as string;
  
  const comparison = await ProductComparison.findById(id);
  
  if (!comparison) {
    return next(new AppError('Comparison not found', 404));
  }
  
  // Check ownership
  const isOwner = 
    (userId && comparison.user && comparison.user.toString() === userId.toString()) ||
    (sessionId && comparison.sessionId === sessionId);
  
  if (!isOwner) {
    return next(new AppError('Access denied', 403));
  }
  
  await comparison.generateShareToken();
  
  res.status(200).json({
    success: true,
    data: {
      shareToken: comparison.shareToken,
      shareUrl: comparison.shareUrl
    },
    message: 'Share link generated successfully'
  });
});

/**
 * Get comparison by share token
 * GET /api/comparisons/shared/:token
 */
export const getSharedComparison = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.params;
  
  const comparison = await ProductComparison.getByShareToken(token);
  
  if (!comparison) {
    return next(new AppError('Shared comparison not found', 404));
  }
  
  // Increment views
  await ProductComparison.findByIdAndUpdate(
    comparison._id,
    {
      $inc: { views: 1 },
      lastViewedAt: new Date()
    }
  );
  
  res.status(200).json({
    success: true,
    data: comparison
  });
});

/**
 * Get public comparisons
 * GET /api/comparisons/public
 */
export const getPublicComparisons = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const category = req.query.category as string;
  const sortBy = req.query.sortBy as string; // 'popular' or 'recent'
  
  const comparisons = await ProductComparison.getPublicComparisons({
    page,
    limit,
    category,
    sortBy
  });
  
  res.status(200).json({
    success: true,
    data: comparisons,
    page,
    limit
  });
});

// ==================== ANALYTICS ====================

/**
 * Get comparison statistics
 * GET /api/comparisons/stats/overview
 */
export const getComparisonStats = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)?._id;
  
  const stats = await ProductComparison.aggregate([
    { $match: userId ? { user: new mongoose.Types.ObjectId(userId) } : {} },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        public: { $sum: { $cond: ['$isPublic', 1, 0] } },
        private: { $sum: { $cond: ['$isPublic', 0, 1] } },
        totalViews: { $sum: '$views' },
        avgProductsPerComparison: { $avg: { $size: '$products' } }
      }
    }
  ]);
  
  res.status(200).json({
    success: true,
    data: stats[0] || {
      total: 0,
      public: 0,
      private: 0,
      totalViews: 0,
      avgProductsPerComparison: 0
    }
  });
});

/**
 * Get popular comparisons
 * GET /api/comparisons/popular
 */
export const getPopularComparisons = catchAsync(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  
  const comparisons = await ProductComparison.getPopularComparisons(limit);
  
  res.status(200).json({
    success: true,
    data: comparisons
  });
});

/**
 * Get comparison trends by category
 * GET /api/comparisons/trends
 */
export const getComparisonTrends = catchAsync(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;
  
  const filter: any = { isPublic: true };
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate as string);
    if (endDate) filter.createdAt.$lte = new Date(endDate as string);
  }
  
  const trends = await ProductComparison.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalViews: { $sum: '$views' },
        avgProducts: { $avg: { $size: '$products' } }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
  res.status(200).json({
    success: true,
    data: trends
  });
});

/**
 * Get most compared products
 * GET /api/comparisons/products/popular
 */
export const getMostComparedProducts = catchAsync(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 20;
  
  const products = await ProductComparison.aggregate([
    { $match: { isPublic: true } },
    { $unwind: '$products' },
    {
      $group: {
        _id: '$products',
        comparisonCount: { $sum: 1 }
      }
    },
    { $sort: { comparisonCount: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    { $unwind: '$productInfo' },
    {
      $project: {
        productId: '$_id',
        comparisonCount: 1,
        name: '$productInfo.name',
        images: '$productInfo.images',
        price: '$productInfo.price',
        rating: '$productInfo.rating'
      }
    }
  ]);
  
  res.status(200).json({
    success: true,
    data: products
  });
});

// ==================== SYSTEM ====================

/**
 * Cleanup expired comparisons (Admin)
 * POST /api/comparisons/cleanup
 */
export const cleanupExpired = catchAsync(async (req: Request, res: Response) => {
  await ProductComparison.cleanupExpired();
  
  res.status(200).json({
    success: true,
    message: 'Expired comparisons cleaned up successfully'
  });
});

/**
 * Bulk delete comparisons
 * POST /api/comparisons/bulk-delete
 */
export const bulkDelete = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { comparisonIds } = req.body;
  const userId = (req.user as any)?._id;
  
  if (!Array.isArray(comparisonIds) || comparisonIds.length === 0) {
    return next(new AppError('Comparison IDs array is required', 400));
  }
  
  // Delete only user's own comparisons
  const result = await ProductComparison.deleteMany({
    _id: { $in: comparisonIds },
    user: userId
  });
  
  res.status(200).json({
    success: true,
    data: {
      deletedCount: result.deletedCount
    },
    message: `${result.deletedCount} comparisons deleted successfully`
  });
});

// ==================== EXPORT FUNCTIONALITY ====================

/**
 * Export comparison as PDF
 * GET /api/comparisons/:id/export?format=pdf
 */
export const exportComparison = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const format = (req.query.format as string) || 'pdf';
  const userId = (req.user as any)?._id;
  const sessionId = req.query.sessionId as string;

  const comparison = await ProductComparison.findById(id).populate('products');

  if (!comparison) {
    return next(new AppError('Comparison not found', 404));
  }

  // Check access
  if (!comparison.isPublic) {
    const hasAccess =
      (userId && comparison.user && comparison.user.toString() === userId.toString()) ||
      (sessionId && comparison.sessionId === sessionId);

    if (!hasAccess) {
      return next(new AppError('Access denied', 403));
    }
  }

  const products = comparison.products as any[];

  if (format === 'pdf') {
    // Generate PDF
    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="comparison-${comparison._id}.pdf"`);
    
    doc.pipe(res);

    // Title
    doc.fontSize(20).text('Product Comparison', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(comparison.name || 'Untitled Comparison', { align: 'center' });
    doc.moveDown(2);

    // Products table header
    doc.fontSize(12).text('Products Being Compared:', { underline: true });
    doc.moveDown();

    products.forEach((product, index) => {
      doc.fontSize(10).text(`${index + 1}. ${product.name}`);
      doc.fontSize(9).text(`   Price: ₹${product.price || 'N/A'}`);
      doc.text(`   Rating: ${product.rating || 'N/A'}/5`);
      doc.text(`   Stock: ${product.inStock ? 'In Stock' : 'Out of Stock'}`);
      doc.moveDown(0.5);
    });

    doc.moveDown();
    doc.fontSize(12).text('Feature Comparison:', { underline: true });
    doc.moveDown();

    // Feature comparison table
    const features = ['Price', 'Rating', 'Brand', 'In Stock', 'Discount'];
    features.forEach(feature => {
      doc.fontSize(10).text(feature + ':', { continued: false });
      products.forEach((product, index) => {
        let value = 'N/A';
        switch (feature) {
          case 'Price':
            value = product.price ? `₹${product.price}` : 'N/A';
            break;
          case 'Rating':
            value = product.rating ? `${product.rating}/5` : 'N/A';
            break;
          case 'Brand':
            value = product.brand || 'N/A';
            break;
          case 'In Stock':
            value = product.inStock ? 'Yes' : 'No';
            break;
          case 'Discount':
            value = product.discount ? `${product.discount}%` : 'N/A';
            break;
        }
        doc.fontSize(9).text(`   ${product.name}: ${value}`);
      });
      doc.moveDown(0.5);
    });

    doc.end();

  } else if (format === 'excel') {
    // Generate Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Comparison');

    // Add headers
    worksheet.columns = [
      { header: 'Feature', key: 'feature', width: 20 },
      ...products.map((p, i) => ({
        header: p.name,
        key: `product${i}`,
        width: 20
      }))
    ];

    // Add rows
    const features = [
      { feature: 'Price', getValue: (p: any) => p.price || 'N/A' },
      { feature: 'Rating', getValue: (p: any) => p.rating || 'N/A' },
      { feature: 'Brand', getValue: (p: any) => p.brand || 'N/A' },
      { feature: 'In Stock', getValue: (p: any) => p.inStock ? 'Yes' : 'No' },
      { feature: 'Discount', getValue: (p: any) => p.discount ? `${p.discount}%` : 'N/A' },
      { feature: 'Category', getValue: (p: any) => p.category || 'N/A' }
    ];

    features.forEach(({ feature, getValue }) => {
      const row: any = { feature };
      products.forEach((p, i) => {
        row[`product${i}`] = getValue(p);
      });
      worksheet.addRow(row);
    });

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="comparison-${comparison._id}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();

  } else if (format === 'csv') {
    // Generate CSV
    const fields = ['Product', 'Price', 'Rating', 'Brand', 'In Stock', 'Discount'];
    const data = products.map(p => ({
      Product: p.name,
      Price: p.price || 'N/A',
      Rating: p.rating || 'N/A',
      Brand: p.brand || 'N/A',
      'In Stock': p.inStock ? 'Yes' : 'No',
      Discount: p.discount ? `${p.discount}%` : 'N/A'
    }));

    const json2csvParser = new Json2CsvParser({ fields });
    const csv = json2csvParser.parse(data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="comparison-${comparison._id}.csv"`);
    res.send(csv);

  } else {
    return next(new AppError('Invalid export format', 400));
  }
});

// ==================== AI INSIGHTS ====================

/**
 * Get AI-powered insights for comparison
 * GET /api/comparisons/:id/insights
 */
export const getComparisonInsights = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = (req.user as any)?._id;
  const sessionId = req.query.sessionId as string;

  const comparison = await ProductComparison.findById(id).populate('products');

  if (!comparison) {
    return next(new AppError('Comparison not found', 404));
  }

  // Check access
  if (!comparison.isPublic) {
    const hasAccess =
      (userId && comparison.user && comparison.user.toString() === userId.toString()) ||
      (sessionId && comparison.sessionId === sessionId);

    if (!hasAccess) {
      return next(new AppError('Access denied', 403));
    }
  }

  const products = comparison.products as any[];
  const insights: any[] = [];

  // Price analysis
  const prices = products.map(p => p.price).filter(p => p);
  if (prices.length > 0) {
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

    const bestValueProduct = products.find(p => p.price === minPrice);
    insights.push({
      type: 'recommendation',
      title: 'Best Value',
      description: `${bestValueProduct.name} offers the best price at ₹${minPrice}`,
      confidence: 0.95,
      impact: 'high',
      productIds: [bestValueProduct._id]
    });

    if (maxPrice - minPrice > avgPrice * 0.5) {
      insights.push({
        type: 'alert',
        title: 'Significant Price Difference',
        description: `Price difference of ₹${(maxPrice - minPrice).toFixed(2)} detected. Consider budget carefully.`,
        confidence: 0.9,
        impact: 'medium',
        productIds: products.map(p => p._id)
      });
    }
  }

  // Rating analysis
  const ratings = products.map(p => p.rating).filter(r => r);
  if (ratings.length > 0) {
    const maxRating = Math.max(...ratings);
    const topRatedProducts = products.filter(p => p.rating === maxRating);

    insights.push({
      type: 'strength',
      title: 'Top Rated',
      description: `${topRatedProducts.map(p => p.name).join(', ')} ${topRatedProducts.length > 1 ? 'are' : 'is'} the highest rated at ${maxRating}/5`,
      confidence: 0.9,
      impact: 'high',
      productIds: topRatedProducts.map(p => p._id)
    });

    const lowRatedProducts = products.filter(p => p.rating && p.rating < 3);
    if (lowRatedProducts.length > 0) {
      insights.push({
        type: 'weakness',
        title: 'Low Customer Satisfaction',
        description: `${lowRatedProducts.map(p => p.name).join(', ')} ${lowRatedProducts.length > 1 ? 'have' : 'has'} below-average ratings`,
        confidence: 0.85,
        impact: 'high',
        productIds: lowRatedProducts.map(p => p._id)
      });
    }
  }

  // Stock availability
  const outOfStock = products.filter(p => !p.inStock);
  if (outOfStock.length > 0) {
    insights.push({
      type: 'alert',
      title: 'Stock Availability Issue',
      description: `${outOfStock.map(p => p.name).join(', ')} ${outOfStock.length > 1 ? 'are' : 'is'} currently out of stock`,
      confidence: 1.0,
      impact: 'high',
      productIds: outOfStock.map(p => p._id)
    });
  }

  // Discount analysis
  const discountedProducts = products.filter(p => p.discount && p.discount > 0);
  if (discountedProducts.length > 0) {
    const bestDiscount = Math.max(...discountedProducts.map(p => p.discount));
    const bestDiscountProduct = discountedProducts.find(p => p.discount === bestDiscount);

    insights.push({
      type: 'recommendation',
      title: 'Best Deal',
      description: `${bestDiscountProduct.name} offers the best discount at ${bestDiscount}% off`,
      confidence: 0.9,
      impact: 'medium',
      productIds: [bestDiscountProduct._id]
    });
  }

  // Overall recommendation
  const scores = products.map((product, index) => {
    let score = 0;
    
    // Rating (40% weight)
    if (product.rating) {
      score += (product.rating / 5) * 40;
    }
    
    // Price (30% weight) - inverse relationship
    if (prices.length > 0 && product.price) {
      const priceScore = 1 - ((product.price - Math.min(...prices)) / (Math.max(...prices) - Math.min(...prices) || 1));
      score += priceScore * 30;
    }
    
    // Stock (15% weight)
    if (product.inStock) {
      score += 15;
    }
    
    // Discount (15% weight)
    if (product.discount) {
      score += (product.discount / 100) * 15;
    }

    return { product, score };
  });

  const bestOverall = scores.reduce((prev, current) => 
    current.score > prev.score ? current : prev
  );

  insights.push({
    type: 'recommendation',
    title: 'Overall Best Choice',
    description: `Based on comprehensive analysis, ${bestOverall.product.name} scores ${bestOverall.score.toFixed(1)}/100 and is recommended`,
    confidence: 0.88,
    impact: 'high',
    productIds: [bestOverall.product._id]
  });

  res.status(200).json({
    success: true,
    data: insights
  });
});

/**
 * Get product recommendations based on comparison
 * GET /api/comparisons/:id/recommendations
 */
export const getRecommendations = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = (req.user as any)?._id;
  const sessionId = req.query.sessionId as string;

  const comparison = await ProductComparison.findById(id).populate('products');

  if (!comparison) {
    return next(new AppError('Comparison not found', 404));
  }

  // Check access
  if (!comparison.isPublic) {
    const hasAccess =
      (userId && comparison.user && comparison.user.toString() === userId.toString()) ||
      (sessionId && comparison.sessionId === sessionId);

    if (!hasAccess) {
      return next(new AppError('Access denied', 403));
    }
  }

  const products = comparison.products as any[];
  
  // Get categories and brands from compared products
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];
  
  // Get average price range
  const prices = products.map(p => p.price).filter(p => p);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const priceRange = {
    min: avgPrice * 0.7,
    max: avgPrice * 1.3
  };

  // Find similar products
  const recommendations = await Product.find({
    _id: { $nin: products.map(p => p._id) },
    $or: [
      { category: { $in: categories } },
      { brand: { $in: brands } }
    ],
    price: { $gte: priceRange.min, $lte: priceRange.max },
    inStock: true
  })
    .limit(10)
    .select('name images price rating brand category discount')
    .lean();

  // Score and rank recommendations
  const scoredRecommendations = recommendations.map(rec => {
    let score = 0;
    let reasons: string[] = [];

    // Category match
    if (categories.includes((rec as any).category)) {
      score += 30;
      reasons.push('Same category');
    }

    // Brand match
    if (brands.includes((rec as any).brand)) {
      score += 20;
      reasons.push('Familiar brand');
    }

    // Price similarity
    const priceDiff = Math.abs((rec as any).price - avgPrice) / avgPrice;
    if (priceDiff < 0.2) {
      score += 25;
      reasons.push('Similar price range');
    }

    // High rating
    if ((rec as any).rating && (rec as any).rating >= 4) {
      score += 15;
      reasons.push('Highly rated');
    }

    // Discount
    if ((rec as any).discount && (rec as any).discount > 10) {
      score += 10;
      reasons.push('Great discount');
    }

    return {
      product: rec,
      score,
      reason: reasons.join(', '),
      matchScore: score
    };
  });

  // Sort by score
  scoredRecommendations.sort((a, b) => b.score - a.score);

  res.status(200).json({
    success: true,
    data: scoredRecommendations.slice(0, 5)
  });
});

// ==================== ANALYTICS TRACKING ====================

/**
 * Track comparison analytics event
 * POST /api/analytics/comparison/:event
 */
export const trackAnalyticsEvent = catchAsync(async (req: Request, res: Response) => {
  const { event } = req.params;
  const { comparisonId, productId, sessionId, timestamp } = req.body;

  // In production, send to analytics service (Google Analytics, Mixpanel, etc.)
  console.log('Analytics Event:', {
    event,
    comparisonId,
    productId,
    sessionId,
    timestamp
  });

  // Update comparison metadata
  if (comparisonId) {
    const comparison = await ProductComparison.findById(comparisonId);
    if (comparison) {
      // Track events in comparison metadata
      const compData = comparison as any;
      if (!compData.metadata) compData.metadata = {};
      if (!compData.metadata.analytics) compData.metadata.analytics = {};
      
      if (!compData.metadata.analytics[event]) {
        compData.metadata.analytics[event] = 0;
      }
      compData.metadata.analytics[event]++;
      
      await comparison.save();
    }
  }

  res.status(200).json({
    success: true,
    message: 'Event tracked successfully'
  });
});

/**
 * Get comparison analytics
 * GET /api/comparisons/:id/analytics
 */
export const getComparisonAnalytics = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = (req.user as any)?._id;

  const comparison = await ProductComparison.findById(id);

  if (!comparison) {
    return next(new AppError('Comparison not found', 404));
  }

  // Check ownership
  const isOwner = userId && comparison.user && comparison.user.toString() === userId.toString();
  
  if (!isOwner) {
    return next(new AppError('Access denied', 403));
  }

  const analytics = {
    views: comparison.views || 0,
    shares: (comparison as any).shareCount || 0,
    lastViewedAt: comparison.lastViewedAt,
    createdAt: comparison.createdAt,
    productCount: comparison.products.length,
    isPublic: comparison.isPublic,
    events: (comparison as any).metadata?.analytics || {},
    engagement: {
      viewDuration: 'N/A', // Implement with real tracking
      interactionRate: 'N/A'
    }
  };

  res.status(200).json({
    success: true,
    data: analytics
  });
});
