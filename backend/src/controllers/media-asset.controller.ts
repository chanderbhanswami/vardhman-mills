import { Request, Response, NextFunction } from 'express';
import MediaAsset from '../models/media-asset.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// ==================== MEDIA ASSETS ====================

export const getMediaAssets = catchAsync(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 20,
    sort = '-createdAt',
    status,
    fileType,
    folder,
    category,
    uploadedBy,
    search
  } = req.query;

  const filter: any = {};

  if (status) filter.status = status;
  if (fileType) filter.fileType = fileType;
  if (folder) filter.folder = folder;
  if (category) filter.categories = category;
  if (uploadedBy) filter.uploadedBy = uploadedBy;
  
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { originalName: { $regex: search, $options: 'i' } },
      { altText: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await MediaAsset.countDocuments(filter);

  const mediaAssets = await MediaAsset.find(filter)
    .sort(sort as string)
    .skip(skip)
    .limit(Number(limit))
    .populate('uploadedBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  res.status(200).json({
    status: 'success',
    results: mediaAssets.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: { mediaAssets }
  });
});

export const getMediaAssetById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const mediaAsset = await MediaAsset.findById(req.params.id)
    .populate('uploadedBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  if (!mediaAsset) {
    return next(new AppError('Media asset not found', 404));
  }

  // Increment views
  mediaAsset.analytics.views += 1;
  mediaAsset.analytics.lastAccessed = new Date();
  await mediaAsset.save();

  res.status(200).json({
    status: 'success',
    data: { mediaAsset }
  });
});

export const getMediaAssetBySlug = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { slug } = req.params;

  const mediaAsset = await MediaAsset.findOne({ slug, status: 'active' })
    .populate('uploadedBy', 'firstName lastName email');

  if (!mediaAsset) {
    return next(new AppError('Media asset not found', 404));
  }

  // Increment views
  mediaAsset.analytics.views += 1;
  mediaAsset.analytics.lastAccessed = new Date();
  await mediaAsset.save();

  res.status(200).json({
    status: 'success',
    data: { mediaAsset }
  });
});

export const createMediaAsset = catchAsync(async (req: Request, res: Response) => {
  const mediaAssetData = {
    ...req.body,
    uploadedBy: req.user?._id
  };

  // Auto-detect file type from mime type
  if (!mediaAssetData.fileType && mediaAssetData.mimeType) {
    if (mediaAssetData.mimeType.startsWith('image/')) {
      mediaAssetData.fileType = 'image';
    } else if (mediaAssetData.mimeType.startsWith('video/')) {
      mediaAssetData.fileType = 'video';
    } else if (mediaAssetData.mimeType.startsWith('audio/')) {
      mediaAssetData.fileType = 'audio';
    } else if (mediaAssetData.mimeType.includes('pdf') || mediaAssetData.mimeType.includes('document')) {
      mediaAssetData.fileType = 'document';
    } else {
      mediaAssetData.fileType = 'other';
    }
  }

  const mediaAsset = await MediaAsset.create(mediaAssetData);

  res.status(201).json({
    status: 'success',
    data: { mediaAsset }
  });
});

export const updateMediaAsset = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const mediaAsset = await MediaAsset.findById(req.params.id);

  if (!mediaAsset) {
    return next(new AppError('Media asset not found', 404));
  }

  mediaAsset.updatedBy = req.user?._id as any;
  Object.assign(mediaAsset, req.body);

  await mediaAsset.save();

  res.status(200).json({
    status: 'success',
    data: { mediaAsset }
  });
});

export const deleteMediaAsset = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const mediaAsset = await MediaAsset.findById(req.params.id);

  if (!mediaAsset) {
    return next(new AppError('Media asset not found', 404));
  }

  // Check if asset is being used
  if (mediaAsset.usageCount > 0) {
    return next(new AppError('Cannot delete media asset that is currently in use. Please remove all references first.', 400));
  }

  await mediaAsset.deleteOne();

  res.status(204).json({
    status: 'success',
    data: null
  });
});

export const archiveMediaAsset = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const mediaAsset = await MediaAsset.findById(req.params.id);

  if (!mediaAsset) {
    return next(new AppError('Media asset not found', 404));
  }

  mediaAsset.status = 'archived';
  await mediaAsset.save();

  res.status(200).json({
    status: 'success',
    data: { mediaAsset }
  });
});

export const restoreMediaAsset = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const mediaAsset = await MediaAsset.findById(req.params.id);

  if (!mediaAsset) {
    return next(new AppError('Media asset not found', 404));
  }

  mediaAsset.status = 'active';
  await mediaAsset.save();

  res.status(200).json({
    status: 'success',
    data: { mediaAsset }
  });
});

// ==================== FOLDERS & ORGANIZATION ====================

export const getFolders = catchAsync(async (req: Request, res: Response) => {
  const folders = await MediaAsset.distinct('folder', { folder: { $ne: null } });

  const folderStats = await Promise.all(
    folders.map(async (folder) => {
      const count = await MediaAsset.countDocuments({ folder, status: 'active' });
      const totalSize = await MediaAsset.aggregate([
        { $match: { folder, status: 'active' } },
        { $group: { _id: null, total: { $sum: '$fileSize' } } }
      ]);

      return {
        name: folder,
        count,
        totalSize: totalSize[0]?.total || 0
      };
    })
  );

  res.status(200).json({
    status: 'success',
    results: folderStats.length,
    data: { folders: folderStats }
  });
});

export const moveToFolder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { folder } = req.body;

  const mediaAsset = await MediaAsset.findById(id);

  if (!mediaAsset) {
    return next(new AppError('Media asset not found', 404));
  }

  mediaAsset.folder = folder || undefined;
  await mediaAsset.save();

  res.status(200).json({
    status: 'success',
    data: { mediaAsset }
  });
});

// ==================== USAGE TRACKING ====================

export const trackUsage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { type, referenceId, referenceName } = req.body;

  const mediaAsset = await MediaAsset.findById(id);

  if (!mediaAsset) {
    return next(new AppError('Media asset not found', 404));
  }

  // Check if already tracked
  const existingUsage = mediaAsset.usedIn.find(
    u => u.type === type && u.referenceId.toString() === referenceId
  );

  if (!existingUsage) {
    mediaAsset.usedIn.push({ type, referenceId, referenceName });
    mediaAsset.usageCount = mediaAsset.usedIn.length;
    await mediaAsset.save();
  }

  res.status(200).json({
    status: 'success',
    data: { mediaAsset }
  });
});

export const removeUsage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { type, referenceId } = req.body;

  const mediaAsset = await MediaAsset.findById(id);

  if (!mediaAsset) {
    return next(new AppError('Media asset not found', 404));
  }

  mediaAsset.usedIn = mediaAsset.usedIn.filter(
    u => !(u.type === type && u.referenceId.toString() === referenceId)
  );
  mediaAsset.usageCount = mediaAsset.usedIn.length;
  await mediaAsset.save();

  res.status(200).json({
    status: 'success',
    data: { mediaAsset }
  });
});

export const getUnusedAssets = catchAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 20 } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const total = await MediaAsset.countDocuments({ usageCount: 0, status: 'active' });

  const unusedAssets = await MediaAsset.find({ usageCount: 0, status: 'active' })
    .sort('-createdAt')
    .skip(skip)
    .limit(Number(limit))
    .populate('uploadedBy', 'firstName lastName email');

  res.status(200).json({
    status: 'success',
    results: unusedAssets.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: { mediaAssets: unusedAssets }
  });
});

// ==================== OPTIMIZATION ====================

export const optimizeAsset = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const mediaAsset = await MediaAsset.findById(req.params.id);

  if (!mediaAsset) {
    return next(new AppError('Media asset not found', 404));
  }

  // Mark as processing
  mediaAsset.optimizationStatus = 'processing';
  await mediaAsset.save();

  // TODO: Implement actual optimization logic (image compression, etc.)
  // For now, just mark as completed
  mediaAsset.optimizationStatus = 'completed';
  mediaAsset.isOptimized = true;
  await mediaAsset.save();

  res.status(200).json({
    status: 'success',
    message: 'Asset optimization started',
    data: { mediaAsset }
  });
});

// ==================== ANALYTICS ====================

export const getMediaAnalytics = catchAsync(async (req: Request, res: Response) => {
  const [
    totalAssets,
    activeAssets,
    archivedAssets,
    byType,
    totalSize,
    mostViewed,
    mostDownloaded,
    recentUploads
  ] = await Promise.all([
    MediaAsset.countDocuments(),
    MediaAsset.countDocuments({ status: 'active' }),
    MediaAsset.countDocuments({ status: 'archived' }),
    MediaAsset.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$fileType', count: { $sum: 1 } } }
    ]),
    MediaAsset.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$fileSize' } } }
    ]),
    MediaAsset.find({ status: 'active' })
      .sort('-analytics.views')
      .limit(10)
      .select('name slug fileType url analytics')
      .populate('uploadedBy', 'firstName lastName'),
    MediaAsset.find({ status: 'active' })
      .sort('-analytics.downloads')
      .limit(10)
      .select('name slug fileType url analytics')
      .populate('uploadedBy', 'firstName lastName'),
    MediaAsset.find({ status: 'active' })
      .sort('-createdAt')
      .limit(10)
      .select('name slug fileType url createdAt')
      .populate('uploadedBy', 'firstName lastName')
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      assets: {
        total: totalAssets,
        active: activeAssets,
        archived: archivedAssets,
        byType: byType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as any)
      },
      storage: {
        totalSize: totalSize[0]?.total || 0,
        totalSizeFormatted: formatBytes(totalSize[0]?.total || 0)
      },
      mostViewed,
      mostDownloaded,
      recentUploads
    }
  });
});

export const trackDownload = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const mediaAsset = await MediaAsset.findById(req.params.id);

  if (!mediaAsset) {
    return next(new AppError('Media asset not found', 404));
  }

  mediaAsset.analytics.downloads += 1;
  mediaAsset.analytics.lastAccessed = new Date();
  await mediaAsset.save();

  res.status(200).json({
    status: 'success',
    data: { mediaAsset }
  });
});

// ==================== BULK OPERATIONS ====================

export const bulkUpdateAssets = catchAsync(async (req: Request, res: Response) => {
  const { ids, updates } = req.body;

  const result = await MediaAsset.updateMany(
    { _id: { $in: ids } },
    { $set: updates }
  );

  res.status(200).json({
    status: 'success',
    data: {
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    }
  });
});

export const bulkDeleteAssets = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { ids } = req.body;

  // Check if any assets are in use
  const assetsInUse = await MediaAsset.find({
    _id: { $in: ids },
    usageCount: { $gt: 0 }
  }).select('name usageCount');

  if (assetsInUse.length > 0) {
    res.status(400).json({
      status: 'error',
      message: 'Some assets are currently in use and cannot be deleted',
      data: { assetsInUse }
    });
    return;
  }

  const result = await MediaAsset.deleteMany({ _id: { $in: ids }, usageCount: 0 });

  res.status(200).json({
    status: 'success',
    data: { deletedCount: result.deletedCount }
  });
});

// ==================== HELPER FUNCTIONS ====================

function formatBytes(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}
