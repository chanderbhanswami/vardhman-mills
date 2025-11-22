import { Request, Response, NextFunction } from 'express';
import Logo from '../models/Logo.model.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import { AuthRequest } from '../types/index.js';

// ==================== ANIMATION CONFIGURATION ====================

/**
 * Get all animation settings for a logo
 * @route GET /api/v1/logos/:id/animation
 * @access Public
 */
export const getAnimationConfig = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const logo = await Logo.findById(req.params.id).select('animation');

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { animation: logo.animation || null }
    });
  }
);

/**
 * Update animation configuration
 * @route PATCH /api/v1/logos/:id/animation
 * @access Private/Admin
 */
export const updateAnimationConfig = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { entrance, loading, interactions, scroll } = req.body;

    const updateData: any = {};
    if (entrance) updateData['animation.entrance'] = entrance;
    if (loading) updateData['animation.loading'] = loading;
    if (interactions) updateData['animation.interactions'] = interactions;
    if (scroll) updateData['animation.scroll'] = scroll;

    const logo = await Logo.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { logo }
    });
  }
);

/**
 * Update entrance animation
 * @route PATCH /api/v1/logos/:id/animation/entrance
 * @access Private/Admin
 */
export const updateEntranceAnimation = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const logo = await Logo.findByIdAndUpdate(
      req.params.id,
      {
        $set: { 'animation.entrance': req.body }
      },
      { new: true, runValidators: true }
    );

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { entrance: logo.animation?.entrance }
    });
  }
);

/**
 * Update loading animation
 * @route PATCH /api/v1/logos/:id/animation/loading
 * @access Private/Admin
 */
export const updateLoadingAnimation = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const logo = await Logo.findByIdAndUpdate(
      req.params.id,
      {
        $set: { 'animation.loading': req.body }
      },
      { new: true, runValidators: true }
    );

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { loading: logo.animation?.loading }
    });
  }
);

/**
 * Update interaction animations (hover & click)
 * @route PATCH /api/v1/logos/:id/animation/interactions
 * @access Private/Admin
 */
export const updateInteractionAnimations = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const logo = await Logo.findByIdAndUpdate(
      req.params.id,
      {
        $set: { 'animation.interactions': req.body }
      },
      { new: true, runValidators: true }
    );

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { interactions: logo.animation?.interactions }
    });
  }
);

/**
 * Update scroll animations
 * @route PATCH /api/v1/logos/:id/animation/scroll
 * @access Private/Admin
 */
export const updateScrollAnimation = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const logo = await Logo.findByIdAndUpdate(
      req.params.id,
      {
        $set: { 'animation.scroll': req.body }
      },
      { new: true, runValidators: true }
    );

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { scroll: logo.animation?.scroll }
    });
  }
);

/**
 * Disable all animations for a logo
 * @route POST /api/v1/logos/:id/animation/disable-all
 * @access Private/Admin
 */
export const disableAllAnimations = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const logo = await Logo.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          'animation.entrance.enabled': false,
          'animation.interactions.hover.type': 'none',
          'animation.interactions.click.type': 'none',
          'animation.scroll.parallax.enabled': false,
          'animation.scroll.reveal.enabled': false
        }
      },
      { new: true, runValidators: true }
    );

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { logo }
    });
  }
);

/**
 * Reset animations to defaults
 * @route DELETE /api/v1/logos/:id/animation
 * @access Private/Admin
 */
export const resetAnimations = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const logo = await Logo.findByIdAndUpdate(
      req.params.id,
      {
        $unset: { animation: '' }
      },
      { new: true }
    );

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { logo }
    });
  }
);
