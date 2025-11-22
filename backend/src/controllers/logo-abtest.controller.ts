import { Request, Response, NextFunction } from 'express';
import Logo from '../models/Logo.model.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import { AuthRequest } from '../types/index.js';

// ==================== A/B TESTING ====================

/**
 * Get A/B test configuration
 * @route GET /api/v1/logos/:id/ab-test
 * @access Private/Admin
 */
export const getABTest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const logo = await Logo.findById(req.params.id).select('abTest');

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { abTest: logo.abTest || null }
    });
  }
);

/**
 * Create A/B test
 * @route POST /api/v1/logos/:id/ab-test
 * @access Private/Admin
 */
export const createABTest = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { variants, testDuration, confidenceLevel } = req.body;

    if (!variants || !Array.isArray(variants) || variants.length < 2) {
      return next(new AppError('At least 2 variants are required for A/B testing', 400));
    }

    // Validate variant weights sum to 100
    const totalWeight = variants.reduce((sum: number, v: any) => sum + v.weight, 0);
    if (totalWeight !== 100) {
      return next(new AppError('Variant weights must sum to 100', 400));
    }

    const testEndDate = testDuration ? new Date(Date.now() + testDuration * 24 * 60 * 60 * 1000) : undefined;

    const logo = await Logo.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          abTest: {
            enabled: true,
            variants: variants.map((v: any) => ({
              id: v.id,
              name: v.name,
              weight: v.weight,
              config: v.config,
              impressions: 0,
              clicks: 0,
              conversions: 0
            })),
            testDuration,
            testEndDate,
            confidenceLevel: confidenceLevel || 95
          }
        }
      },
      { new: true, runValidators: true }
    );

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(201).json({
      status: 'success',
      data: { abTest: logo.abTest }
    });
  }
);

/**
 * Update A/B test variant
 * @route PATCH /api/v1/logos/:id/ab-test/variants/:variantId
 * @access Private/Admin
 */
export const updateABTestVariant = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { variantId } = req.params;
    const { name, weight, config } = req.body;

    const logo = await Logo.findById(req.params.id);

    if (!logo || !logo.abTest || !logo.abTest.enabled) {
      return next(new AppError('A/B test not found or not enabled', 404));
    }

    const variantIndex = logo.abTest.variants.findIndex((v: any) => v.id === variantId);
    if (variantIndex === -1) {
      return next(new AppError('Variant not found', 404));
    }

    // Update variant
    if (name) logo.abTest.variants[variantIndex].name = name;
    if (weight !== undefined) logo.abTest.variants[variantIndex].weight = weight;
    if (config) logo.abTest.variants[variantIndex].config = config;

    await logo.save();

    res.status(200).json({
      status: 'success',
      data: { variant: logo.abTest.variants[variantIndex] }
    });
  }
);

/**
 * Add variant to A/B test
 * @route POST /api/v1/logos/:id/ab-test/variants
 * @access Private/Admin
 */
export const addABTestVariant = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id, name, weight, config } = req.body;

    if (!id || !name || weight === undefined) {
      return next(new AppError('Variant id, name, and weight are required', 400));
    }

    const logo = await Logo.findById(req.params.id);

    if (!logo || !logo.abTest || !logo.abTest.enabled) {
      return next(new AppError('A/B test not found or not enabled', 404));
    }

    // Check if variant ID already exists
    if (logo.abTest.variants.some((v: any) => v.id === id)) {
      return next(new AppError('Variant with this ID already exists', 400));
    }

    // Add new variant
    logo.abTest.variants.push({
      id,
      name,
      weight,
      config: config || {},
      impressions: 0,
      clicks: 0,
      conversions: 0
    });

    await logo.save();

    res.status(201).json({
      status: 'success',
      data: { variants: logo.abTest.variants }
    });
  }
);

/**
 * Remove variant from A/B test
 * @route DELETE /api/v1/logos/:id/ab-test/variants/:variantId
 * @access Private/Admin
 */
export const removeABTestVariant = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { variantId } = req.params;

    const logo = await Logo.findById(req.params.id);

    if (!logo || !logo.abTest || !logo.abTest.enabled) {
      return next(new AppError('A/B test not found or not enabled', 404));
    }

    if (logo.abTest.variants.length <= 2) {
      return next(new AppError('Cannot remove variant. At least 2 variants required for A/B testing', 400));
    }

    // Remove variant
    logo.abTest.variants = logo.abTest.variants.filter((v: any) => v.id !== variantId);

    await logo.save();

    res.status(200).json({
      status: 'success',
      data: { variants: logo.abTest.variants }
    });
  }
);

/**
 * Track A/B test impression
 * @route POST /api/v1/logos/:id/ab-test/track/impression
 * @access Public
 */
export const trackImpression = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { variantId } = req.body;

    if (!variantId) {
      return next(new AppError('Variant ID is required', 400));
    }

    const logo = await Logo.findOneAndUpdate(
      {
        _id: req.params.id,
        'abTest.enabled': true,
        'abTest.variants.id': variantId
      },
      {
        $inc: {
          'abTest.variants.$.impressions': 1,
          'analytics.impressions': 1
        }
      },
      { new: true }
    );

    if (!logo) {
      return next(new AppError('Logo or variant not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { tracked: true }
    });
  }
);

/**
 * Track A/B test click
 * @route POST /api/v1/logos/:id/ab-test/track/click
 * @access Public
 */
export const trackClick = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { variantId } = req.body;

    if (!variantId) {
      return next(new AppError('Variant ID is required', 400));
    }

    const logo = await Logo.findOneAndUpdate(
      {
        _id: req.params.id,
        'abTest.enabled': true,
        'abTest.variants.id': variantId
      },
      {
        $inc: {
          'abTest.variants.$.clicks': 1,
          'analytics.clicks': 1
        }
      },
      { new: true }
    );

    if (!logo) {
      return next(new AppError('Logo or variant not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { tracked: true }
    });
  }
);

/**
 * Track A/B test conversion
 * @route POST /api/v1/logos/:id/ab-test/track/conversion
 * @access Public
 */
export const trackConversion = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { variantId } = req.body;

    if (!variantId) {
      return next(new AppError('Variant ID is required', 400));
    }

    const logo = await Logo.findOneAndUpdate(
      {
        _id: req.params.id,
        'abTest.enabled': true,
        'abTest.variants.id': variantId
      },
      {
        $inc: { 'abTest.variants.$.conversions': 1 }
      },
      { new: true }
    );

    if (!logo) {
      return next(new AppError('Logo or variant not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { tracked: true }
    });
  }
);

/**
 * Get A/B test results
 * @route GET /api/v1/logos/:id/ab-test/results
 * @access Private/Admin
 */
export const getABTestResults = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const logo = await Logo.findById(req.params.id).select('abTest');

    if (!logo || !logo.abTest) {
      return next(new AppError('A/B test not found', 404));
    }

    const results = logo.abTest.variants.map((variant: any) => {
      const ctr = variant.impressions > 0 ? (variant.clicks / variant.impressions) * 100 : 0;
      const conversionRate = variant.clicks > 0 ? (variant.conversions / variant.clicks) * 100 : 0;

      return {
        id: variant.id,
        name: variant.name,
        weight: variant.weight,
        impressions: variant.impressions,
        clicks: variant.clicks,
        conversions: variant.conversions,
        ctr: parseFloat(ctr.toFixed(2)),
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        score: parseFloat((ctr * 0.5 + conversionRate * 0.5).toFixed(2))
      };
    });

    // Sort by score (best performing first)
    results.sort((a, b) => b.score - a.score);

    const winner = results[0];

    res.status(200).json({
      status: 'success',
      data: {
        test: {
          enabled: logo.abTest.enabled,
          testDuration: logo.abTest.testDuration,
          testEndDate: logo.abTest.testEndDate,
          confidenceLevel: logo.abTest.confidenceLevel,
          currentWinner: logo.abTest.winnerVariant
        },
        results,
        recommendation: {
          suggestedWinner: winner.id,
          winnerName: winner.name,
          improvementOverBaseline: winner.score > 0 ? `${winner.score}% performance` : 'N/A'
        }
      }
    });
  }
);

/**
 * Set A/B test winner
 * @route POST /api/v1/logos/:id/ab-test/winner
 * @access Private/Admin
 */
export const setABTestWinner = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { variantId, applyConfig } = req.body;

    if (!variantId) {
      return next(new AppError('Variant ID is required', 400));
    }

    const logo = await Logo.findById(req.params.id);

    if (!logo || !logo.abTest || !logo.abTest.enabled) {
      return next(new AppError('A/B test not found or not enabled', 404));
    }

    const winnerVariant = logo.abTest.variants.find((v: any) => v.id === variantId);
    if (!winnerVariant) {
      return next(new AppError('Variant not found', 404));
    }

    // Set winner
    logo.abTest.winnerVariant = variantId;

    // Apply winner config to main logo if requested
    if (applyConfig && winnerVariant.config) {
      Object.assign(logo, winnerVariant.config);
    }

    await logo.save();

    res.status(200).json({
      status: 'success',
      data: {
        winner: winnerVariant,
        applied: !!applyConfig,
        logo: applyConfig ? logo : undefined
      }
    });
  }
);

/**
 * Stop A/B test
 * @route POST /api/v1/logos/:id/ab-test/stop
 * @access Private/Admin
 */
export const stopABTest = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const logo = await Logo.findByIdAndUpdate(
      req.params.id,
      {
        $set: { 'abTest.enabled': false }
      },
      { new: true }
    );

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { abTest: logo.abTest }
    });
  }
);

/**
 * Delete A/B test
 * @route DELETE /api/v1/logos/:id/ab-test
 * @access Private/Admin
 */
export const deleteABTest = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const logo = await Logo.findByIdAndUpdate(
      req.params.id,
      {
        $unset: { abTest: '' }
      },
      { new: true }
    );

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  }
);
