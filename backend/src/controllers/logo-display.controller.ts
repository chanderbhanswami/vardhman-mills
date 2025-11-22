import { Request, Response, NextFunction } from 'express';
import Logo from '../models/Logo.model.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import { AuthRequest } from '../types/index.js';

// ==================== DISPLAY CONFIGURATION ====================

/**
 * Get display configuration for a logo
 * @route GET /api/v1/logos/:id/display-config
 * @access Public
 */
export const getDisplayConfig = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const logo = await Logo.findById(req.params.id).select('displayConfig');

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { displayConfig: logo.displayConfig || null }
    });
  }
);

/**
 * Update display configuration
 * @route PATCH /api/v1/logos/:id/display-config
 * @access Private/Admin
 */
export const updateDisplayConfig = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { position, alignment, maxWidth, maxHeight, aspectRatio, customAspectRatio, objectFit, margin, padding, sticky } = req.body;

    const logo = await Logo.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          'displayConfig.position': position,
          'displayConfig.alignment': alignment,
          'displayConfig.maxWidth': maxWidth,
          'displayConfig.maxHeight': maxHeight,
          'displayConfig.aspectRatio': aspectRatio,
          'displayConfig.customAspectRatio': customAspectRatio,
          'displayConfig.objectFit': objectFit,
          'displayConfig.margin': margin,
          'displayConfig.padding': padding,
          'displayConfig.sticky': sticky
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
 * Reset display configuration to defaults
 * @route DELETE /api/v1/logos/:id/display-config
 * @access Private/Admin
 */
export const resetDisplayConfig = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const logo = await Logo.findByIdAndUpdate(
      req.params.id,
      {
        $unset: { displayConfig: '' }
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

// ==================== STYLING CONFIGURATION ====================

/**
 * Get styling configuration for a logo
 * @route GET /api/v1/logos/:id/styling
 * @access Public
 */
export const getStyling = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const logo = await Logo.findById(req.params.id).select('styling');

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { styling: logo.styling || null }
    });
  }
);

/**
 * Update styling configuration
 * @route PATCH /api/v1/logos/:id/styling
 * @access Private/Admin
 */
export const updateStyling = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const {
      backgroundColor,
      borderRadius,
      shadow,
      border,
      opacity,
      brightness,
      contrast,
      saturation,
      grayscale,
      blur,
      hoverEffects,
      scrollEffects
    } = req.body;

    const updateData: any = {};
    
    if (backgroundColor !== undefined) updateData['styling.backgroundColor'] = backgroundColor;
    if (borderRadius !== undefined) updateData['styling.borderRadius'] = borderRadius;
    if (shadow !== undefined) updateData['styling.shadow'] = shadow;
    if (border !== undefined) updateData['styling.border'] = border;
    if (opacity !== undefined) updateData['styling.opacity'] = opacity;
    if (brightness !== undefined) updateData['styling.brightness'] = brightness;
    if (contrast !== undefined) updateData['styling.contrast'] = contrast;
    if (saturation !== undefined) updateData['styling.saturation'] = saturation;
    if (grayscale !== undefined) updateData['styling.grayscale'] = grayscale;
    if (blur !== undefined) updateData['styling.blur'] = blur;
    if (hoverEffects !== undefined) updateData['styling.hoverEffects'] = hoverEffects;
    if (scrollEffects !== undefined) updateData['styling.scrollEffects'] = scrollEffects;

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
 * Update hover effects
 * @route PATCH /api/v1/logos/:id/styling/hover-effects
 * @access Private/Admin
 */
export const updateHoverEffects = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const logo = await Logo.findByIdAndUpdate(
      req.params.id,
      {
        $set: { 'styling.hoverEffects': req.body }
      },
      { new: true, runValidators: true }
    );

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { hoverEffects: logo.styling?.hoverEffects }
    });
  }
);

/**
 * Update scroll effects
 * @route PATCH /api/v1/logos/:id/styling/scroll-effects
 * @access Private/Admin
 */
export const updateScrollEffects = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const logo = await Logo.findByIdAndUpdate(
      req.params.id,
      {
        $set: { 'styling.scrollEffects': req.body }
      },
      { new: true, runValidators: true }
    );

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { scrollEffects: logo.styling?.scrollEffects }
    });
  }
);

// ==================== RESPONSIVE CONFIGURATION ====================

/**
 * Get responsive configuration
 * @route GET /api/v1/logos/:id/responsive
 * @access Public
 */
export const getResponsiveConfig = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const logo = await Logo.findById(req.params.id).select('responsive');

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { responsive: logo.responsive || null }
    });
  }
);

/**
 * Update responsive configuration
 * @route PATCH /api/v1/logos/:id/responsive
 * @access Private/Admin
 */
export const updateResponsiveConfig = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { mobile, tablet, desktop } = req.body;

    const updateData: any = {};
    if (mobile) updateData['responsive.mobile'] = mobile;
    if (tablet) updateData['responsive.tablet'] = tablet;
    if (desktop) updateData['responsive.desktop'] = desktop;

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
 * Update mobile responsive settings
 * @route PATCH /api/v1/logos/:id/responsive/mobile
 * @access Private/Admin
 */
export const updateMobileConfig = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const logo = await Logo.findByIdAndUpdate(
      req.params.id,
      {
        $set: { 'responsive.mobile': req.body }
      },
      { new: true, runValidators: true }
    );

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { mobile: logo.responsive?.mobile }
    });
  }
);

/**
 * Update tablet responsive settings
 * @route PATCH /api/v1/logos/:id/responsive/tablet
 * @access Private/Admin
 */
export const updateTabletConfig = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const logo = await Logo.findByIdAndUpdate(
      req.params.id,
      {
        $set: { 'responsive.tablet': req.body }
      },
      { new: true, runValidators: true }
    );

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { tablet: logo.responsive?.tablet }
    });
  }
);

/**
 * Update desktop responsive settings
 * @route PATCH /api/v1/logos/:id/responsive/desktop
 * @access Private/Admin
 */
export const updateDesktopConfig = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const logo = await Logo.findByIdAndUpdate(
      req.params.id,
      {
        $set: { 'responsive.desktop': req.body }
      },
      { new: true, runValidators: true }
    );

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { desktop: logo.responsive?.desktop }
    });
  }
);

// ==================== LINK CONFIGURATION ====================

/**
 * Get link configuration
 * @route GET /api/v1/logos/:id/link-config
 * @access Public
 */
export const getLinkConfig = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const logo = await Logo.findById(req.params.id).select('link');

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { link: logo.link || null }
    });
  }
);

/**
 * Update link configuration
 * @route PATCH /api/v1/logos/:id/link-config
 * @access Private/Admin
 */
export const updateLinkConfig = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { enabled, url, target, rel, title, trackClicks, utmSource, utmMedium, utmCampaign } = req.body;

    const updateData: any = {};
    if (enabled !== undefined) updateData['link.enabled'] = enabled;
    if (url !== undefined) updateData['link.url'] = url;
    if (target !== undefined) updateData['link.target'] = target;
    if (rel !== undefined) updateData['link.rel'] = rel;
    if (title !== undefined) updateData['link.title'] = title;
    if (trackClicks !== undefined) updateData['link.trackClicks'] = trackClicks;
    if (utmSource !== undefined) updateData['link.utmSource'] = utmSource;
    if (utmMedium !== undefined) updateData['link.utmMedium'] = utmMedium;
    if (utmCampaign !== undefined) updateData['link.utmCampaign'] = utmCampaign;

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

// ==================== NAVIGATION INTEGRATION ====================

/**
 * Get navigation integration settings
 * @route GET /api/v1/logos/:id/navigation
 * @access Public
 */
export const getNavigationConfig = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const logo = await Logo.findById(req.params.id).select('navigation');

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { navigation: logo.navigation || null }
    });
  }
);

/**
 * Update navigation integration
 * @route PATCH /api/v1/logos/:id/navigation
 * @access Private/Admin
 */
export const updateNavigationConfig = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const logo = await Logo.findByIdAndUpdate(
      req.params.id,
      {
        $set: { navigation: req.body }
      },
      { new: true, runValidators: true }
    );

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { navigation: logo.navigation }
    });
  }
);
