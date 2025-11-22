import { Request, Response, NextFunction } from 'express';
import Settings, { ISettings } from '../models/Settings.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// Get all settings for a category
export const getCategorySettings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log('🔍 getCategorySettings called with category:', req.params.category);
    const { category } = req.params;
    const userId = req.user?.role !== 'admin' ? req.user?.id : undefined;

    console.log('🔍 Getting settings for category:', category, 'userId:', userId);
    const settings = await Settings.getCategorySettings(category, userId);
    console.log('🔍 Found settings:', settings.length);

    // Convert to key-value object for easier frontend consumption
    const settingsObj = settings.reduce((acc: any, setting: ISettings) => {
      acc[setting.key] = {
        value: setting.formattedValue,
        type: setting.type,
        description: setting.description,
        isGlobal: setting.isGlobal,
        updatedAt: setting.updatedAt
      };
      return acc;
    }, {});

    console.log('🔍 Sending settings response for category:', category);
    res.status(200).json({
      status: 'success',
      data: {
        category,
        settings: settingsObj
      }
    });
  }
);

// Get all settings (admin only)
export const getAllSettings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { page = 1, limit = 100, category, isGlobal } = req.query;

    const filter: any = {};
    if (category) filter.category = category;
    if (isGlobal !== undefined) filter.isGlobal = isGlobal === 'true';

    const settings = await Settings.find(filter)
      .populate('userId', 'name email')
      .sort({ category: 1, key: 1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Settings.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      results: settings.length,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: {
        settings
      }
    });
  }
);

// Update multiple settings for a category
export const updateCategorySettings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { category } = req.params;
    const { settings } = req.body;
    const userId = req.user?.role !== 'admin' ? req.user?.id : undefined;

    if (!settings || typeof settings !== 'object') {
      return next(new AppError('Settings object is required', 400));
    }

    const updatedSettings = [];

    // Update each setting
    for (const [key, settingData] of Object.entries(settings)) {
      const { value, type, description, isGlobal } = settingData as any;

      try {
        const setting = await Settings.setValue(
          category,
          key,
          value,
          {
            userId: isGlobal ? undefined : userId,
            type: type || 'string',
            description,
            isGlobal: isGlobal !== false // default to true unless explicitly false
          }
        );
        updatedSettings.push(setting);
      } catch (error: any) {
        return next(new AppError(`Error updating setting ${key}: ${error.message}`, 400));
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        category,
        updated: updatedSettings.length,
        settings: updatedSettings
      }
    });
  }
);

// Get a specific setting value
export const getSettingValue = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { category, key } = req.params;
    const userId = req.user?.role !== 'admin' ? req.user?.id : undefined;

    const value = await Settings.getValue(category, key, userId);

    if (value === null) {
      return next(new AppError('Setting not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        category,
        key,
        value
      }
    });
  }
);

// Update a specific setting
export const updateSetting = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { category, key } = req.params;
    const { value, type, description, isGlobal } = req.body;
    const userId = req.user?.role !== 'admin' ? req.user?.id : undefined;

    const setting = await Settings.setValue(
      category,
      key,
      value,
      {
        userId: isGlobal ? undefined : userId,
        type: type || 'string',
        description,
        isGlobal: isGlobal !== false
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        setting
      }
    });
  }
);

// Delete a setting
export const deleteSetting = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { category, key } = req.params;
    const { isGlobal = true } = req.query;
    const userId = req.user?.role !== 'admin' ? req.user?.id : undefined;

    const filter: any = { category, key };
    
    if (isGlobal === 'true') {
      filter.isGlobal = true;
    } else {
      filter.isGlobal = false;
      filter.userId = userId;
    }

    const setting = await Settings.findOneAndDelete(filter);

    if (!setting) {
      return next(new AppError('Setting not found', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  }
);

// Initialize default settings (admin only)
export const initializeDefaultSettings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const defaultSettings = [
      // General Settings
      { category: 'general', key: 'site_name', value: 'Vardhman Mills', type: 'string' },
      { category: 'general', key: 'site_tagline', value: 'Premium Textile Manufacturing', type: 'string' },
      { category: 'general', key: 'contact_email', value: 'contact@vardhmanmills.com', type: 'string' },
      { category: 'general', key: 'phone_number', value: '+91-11-12345678', type: 'string' },
      { category: 'general', key: 'default_currency', value: 'INR', type: 'string' },
      { category: 'general', key: 'timezone', value: 'Asia/Kolkata', type: 'string' },
      
      // Shipping Settings
      { category: 'shipping', key: 'standard_rate', value: 99, type: 'number' },
      { category: 'shipping', key: 'express_rate', value: 199, type: 'number' },
      { category: 'shipping', key: 'overnight_rate', value: 399, type: 'number' },
      { category: 'shipping', key: 'free_shipping_threshold', value: 2000, type: 'number' },
      { category: 'shipping', key: 'enable_free_shipping', value: true, type: 'boolean' },
      { category: 'shipping', key: 'processing_time', value: '2-3', type: 'string' },
      { category: 'shipping', key: 'cutoff_time', value: '15:00', type: 'string' },
      
      // Payment Settings
      { category: 'payment', key: 'razorpay_enabled', value: true, type: 'boolean' },
      { category: 'payment', key: 'cod_enabled', value: true, type: 'boolean' },
      
      // Inventory Settings
      { category: 'inventory', key: 'low_stock_threshold', value: 10, type: 'number' },
      { category: 'inventory', key: 'out_of_stock_action', value: 'show', type: 'string' },
      { category: 'inventory', key: 'multi_warehouse_enabled', value: false, type: 'boolean' },
      
      // Email Settings
      { category: 'email', key: 'smtp_host', value: '', type: 'string' },
      { category: 'email', key: 'smtp_port', value: 587, type: 'number' },
      { category: 'email', key: 'smtp_secure', value: false, type: 'boolean' }
    ];

    let created = 0;
    let skipped = 0;

    for (const setting of defaultSettings) {
      try {
        const existing = await Settings.findOne({
          category: setting.category,
          key: setting.key,
          isGlobal: true
        });

        if (!existing) {
          await Settings.create({
            ...setting,
            isGlobal: true,
            description: `Default ${setting.key.replace('_', ' ')} setting`
          });
          created++;
        } else {
          skipped++;
        }
      } catch (error) {
        console.error(`Error creating setting ${setting.key}:`, error);
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Default settings initialization completed',
      data: {
        created,
        skipped,
        total: defaultSettings.length
      }
    });
  }
);

// Export settings (admin only)
export const exportSettings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { category } = req.query;
    
    const filter: any = { isGlobal: true };
    if (category) filter.category = category;

    const settings = await Settings.find(filter).select('-_id -__v -createdAt -updatedAt');

    res.status(200).json({
      status: 'success',
      data: {
        settings,
        exportedAt: new Date(),
        count: settings.length
      }
    });
  }
);

// Import settings (admin only)
export const importSettings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { settings, overwrite = false } = req.body;

    if (!Array.isArray(settings)) {
      return next(new AppError('Settings must be an array', 400));
    }

    let imported = 0;
    let skipped = 0;
    let errors = [];

    for (const setting of settings) {
      try {
        const { category, key, value, type, description } = setting;

        if (!category || !key || value === undefined) {
          errors.push(`Invalid setting: ${JSON.stringify(setting)}`);
          continue;
        }

        const existing = await Settings.findOne({ category, key, isGlobal: true });

        if (existing && !overwrite) {
          skipped++;
          continue;
        }

        await Settings.setValue(category, key, value, {
          type: type || 'string',
          description,
          isGlobal: true
        });
        
        imported++;
      } catch (error: any) {
        errors.push(`Error importing setting ${setting?.key}: ${error.message}`);
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Settings import completed',
      data: {
        imported,
        skipped,
        errors,
        total: settings.length
      }
    });
  }
);
