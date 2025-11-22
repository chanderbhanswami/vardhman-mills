import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { 
  FileUpload, 
  UploadFolder, 
  UploadConfig,
  IFileUpload,
  IUploadFolder,
  FileUploadType,
  UploadStatus
} from '../models/upload.model.js';
import catchAsync from '../utils/catchAsync.js';
import { UploadService } from '../services/upload.service.js';
import path from 'path';
import fs from 'fs/promises';

// ============================================================================
// FILE UPLOAD OPERATIONS
// ============================================================================

/**
 * Upload single file
 * @route POST /api/v1/uploads
 * @access Private
 */
export const uploadFile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    res.status(400).json({
      success: false,
      message: 'No file provided'
    });
    return;
  }

  const { 
    category, 
    tags, 
    description, 
    altText, 
    isPublic = false,
    folderId 
  } = req.body;

  // Upload to Cloudinary
  const uploadResult = await UploadService.uploadImage(
    req.file.path,
    {
      folder: category || 'general',
      public_id: `${Date.now()}-${req.file.originalname.split('.')[0]}`
    }
  );

  // Create file upload record
  const fileUpload = await FileUpload.create({
    originalName: req.file.originalname,
    fileName: req.file.filename,
    filePath: req.file.path,
    url: uploadResult.secure_url,
    publicId: uploadResult.public_id,
    mimeType: req.file.mimetype,
    size: req.file.size,
    type: req.file.mimetype.startsWith('image/') ? 'image' : 'other',
    status: 'completed',
    progress: 100,
    uploadedBy: new mongoose.Types.ObjectId(req.user?._id),
    metadata: {
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format
    },
    tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [],
    category,
    description,
    altText,
    isPublic,
    folder: folderId,
    storageProvider: 'cloudinary',
    cdnUrl: uploadResult.secure_url,
    uploadedAt: new Date()
  });

  // Update folder file count and size
  if (folderId) {
    await UploadFolder.findByIdAndUpdate(folderId, {
      $inc: { fileCount: 1, totalSize: req.file.size }
    });
  }

  res.status(201).json({
    success: true,
    message: 'File uploaded successfully',
    data: fileUpload
  });
});

/**
 * Upload multiple files
 * @route POST /api/v1/uploads/multiple
 * @access Private
 */
export const uploadMultipleFiles = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    res.status(400).json({
      success: false,
      message: 'No files provided'
    });
    return;
  }

  const { 
    category, 
    tags, 
    isPublic = false,
    folderId 
  } = req.body;

  const parsedTags = tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [];

  // Upload all files to Cloudinary
  const uploadPromises = req.files.map(async (file: Express.Multer.File) => {
    try {
      const uploadResult = await UploadService.uploadImage(
        file.path,
        {
          folder: category || 'general',
          public_id: `${Date.now()}-${file.originalname.split('.')[0]}`
        }
      );

      const fileUpload = await FileUpload.create({
        originalName: file.originalname,
        fileName: file.filename,
        filePath: file.path,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        mimeType: file.mimetype,
        size: file.size,
        type: file.mimetype.startsWith('image/') ? 'image' : 'other',
        status: 'completed',
        progress: 100,
        uploadedBy: new mongoose.Types.ObjectId(req.user?._id),
        metadata: {
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format
        },
        tags: parsedTags,
        category,
        isPublic,
        folder: folderId,
        storageProvider: 'cloudinary',
        cdnUrl: uploadResult.secure_url,
        uploadedAt: new Date()
      });

      return { success: true, file: fileUpload };
    } catch (error: any) {
      return { 
        success: false, 
        fileName: file.originalname, 
        error: error.message 
      };
    }
  });

  const results = await Promise.all(uploadPromises);

  const successful = results.filter(r => r.success).map(r => r.file);
  const failed = results.filter(r => !r.success).map(r => ({ 
    fileName: r.fileName, 
    error: r.error 
  }));

  // Update folder file count and size
  if (folderId && successful.length > 0) {
    const totalSize = successful.reduce((sum, file) => sum + (file as any).size, 0);
    await UploadFolder.findByIdAndUpdate(folderId, {
      $inc: { fileCount: successful.length, totalSize }
    });
  }

  res.status(201).json({
    success: true,
    message: `${successful.length} files uploaded successfully, ${failed.length} failed`,
    data: {
      successful,
      failed,
      totalSize: successful.reduce((sum, file) => sum + (file as any).size, 0)
    }
  });
});

/**
 * Upload from URL
 * @route POST /api/v1/uploads/from-url
 * @access Private
 */
export const uploadFromUrl = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { url, category, tags, description, altText, isPublic = false, folderId } = req.body;

  if (!url) {
    res.status(400).json({
      success: false,
      message: 'URL is required'
    });
    return;
  }

  // Upload from URL to Cloudinary
  const uploadResult = await UploadService.uploadImage(
    url,
    {
      folder: category || 'general'
    }
  );

  // Create file upload record
  const fileUpload = await FileUpload.create({
    originalName: path.basename(url),
    fileName: uploadResult.public_id,
    filePath: url,
    url: uploadResult.secure_url,
    publicId: uploadResult.public_id,
    mimeType: `image/${uploadResult.format}`,
    size: uploadResult.bytes,
    type: 'image',
    status: 'completed',
    progress: 100,
    uploadedBy: new mongoose.Types.ObjectId(req.user?._id),
    metadata: {
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format
    },
    tags: tags || [],
    category,
    description,
    altText,
    isPublic,
    folder: folderId,
    storageProvider: 'cloudinary',
    cdnUrl: uploadResult.secure_url,
    uploadedAt: new Date()
  });

  // Update folder file count and size
  if (folderId) {
    await UploadFolder.findByIdAndUpdate(folderId, {
      $inc: { fileCount: 1, totalSize: uploadResult.bytes }
    });
  }

  res.status(201).json({
    success: true,
    message: 'File uploaded from URL successfully',
    data: fileUpload
  });
});

/**
 * Get uploads with filters and pagination
 * @route GET /api/v1/uploads
 * @access Private
 */
export const getUploads = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const {
    type,
    status,
    category,
    folderId,
    isPublic,
    uploadedBy,
    tags,
    search,
    sortBy = 'uploadedAt',
    order = 'desc',
    page = 1,
    limit = 20
  } = req.query;

  // Build filter
  const filter: any = {};

  if (type) filter.type = type;
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (folderId) filter.folder = folderId;
  if (isPublic !== undefined) filter.isPublic = isPublic === 'true';
  if (uploadedBy) filter.uploadedBy = uploadedBy;
  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : [tags];
    filter.tags = { $in: tagArray };
  }

  // Text search
  if (search) {
    filter.$text = { $search: search as string };
  }

  // Pagination
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Sorting
  const sortOrder = order === 'asc' ? 1 : -1;
  const sort: any = { [sortBy as string]: sortOrder };

  // Execute query
  const [uploads, total] = await Promise.all([
    FileUpload.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('uploadedBy', 'name email')
      .populate('folder', 'name path')
      .lean(),
    FileUpload.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    data: {
      items: uploads,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1
      }
    }
  });
});

/**
 * Get upload by ID
 * @route GET /api/v1/uploads/:id
 * @access Private
 */
export const getUpload = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const upload = await FileUpload.findById(req.params.id)
    .populate('uploadedBy', 'name email')
    .populate('folder', 'name path');

  if (!upload) {
    res.status(404).json({
      success: false,
      message: 'Upload not found'
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: upload
  });
});

/**
 * Update upload
 * @route PATCH /api/v1/uploads/:id
 * @access Private
 */
export const updateUpload = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { tags, category, description, altText, isPublic, folderId } = req.body;

  const upload = await FileUpload.findById(req.params.id);

  if (!upload) {
    res.status(404).json({
      success: false,
      message: 'Upload not found'
    });
    return;
  }

  // Update fields
  if (tags !== undefined) upload.tags = tags;
  if (category !== undefined) upload.category = category;
  if (description !== undefined) upload.description = description;
  if (altText !== undefined) upload.altText = altText;
  if (isPublic !== undefined) upload.isPublic = isPublic;
  
  // Handle folder change
  if (folderId !== undefined && folderId !== upload.folder?.toString()) {
    const oldFolderId = upload.folder;
    upload.folder = folderId ? new mongoose.Types.ObjectId(folderId) : undefined;

    // Update old folder counts
    if (oldFolderId) {
      await UploadFolder.findByIdAndUpdate(oldFolderId, {
        $inc: { fileCount: -1, totalSize: -upload.size }
      });
    }

    // Update new folder counts
    if (folderId) {
      await UploadFolder.findByIdAndUpdate(folderId, {
        $inc: { fileCount: 1, totalSize: upload.size }
      });
    }
  }

  await upload.save();

  res.status(200).json({
    success: true,
    message: 'Upload updated successfully',
    data: upload
  });
});

/**
 * Delete upload
 * @route DELETE /api/v1/uploads/:id
 * @access Private
 */
export const deleteUpload = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const upload = await FileUpload.findById(req.params.id);

  if (!upload) {
    res.status(404).json({
      success: false,
      message: 'Upload not found'
    });
    return;
  }

  // Delete from Cloudinary if applicable
  if (upload.storageProvider === 'cloudinary' && upload.publicId) {
    try {
      await UploadService.deleteImage(upload.publicId);
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error);
    }
  }

  // Update folder counts
  if (upload.folder) {
    await UploadFolder.findByIdAndUpdate(upload.folder, {
      $inc: { fileCount: -1, totalSize: -upload.size }
    });
  }

  await FileUpload.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Upload deleted successfully'
  });
});

// ============================================================================
// IMAGE PROCESSING OPERATIONS
// ============================================================================

/**
 * Resize image
 * @route POST /api/v1/uploads/:id/resize
 * @access Private
 */
export const resizeImage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { width, height, maintainAspectRatio = true } = req.body;

  const upload = await FileUpload.findById(req.params.id);

  if (!upload) {
    res.status(404).json({
      success: false,
      message: 'Upload not found'
    });
    return;
  }

  if (upload.type !== 'image') {
    res.status(400).json({
      success: false,
      message: 'Only images can be resized'
    });
    return;
  }

  if (!upload.publicId) {
    res.status(400).json({
      success: false,
      message: 'Cannot resize file without public ID'
    });
    return;
  }

  // Generate resized version URL
  const resizedUrl = UploadService.getOptimizedUrl(upload.publicId, [
    { 
      width: parseInt(width), 
      height: parseInt(height), 
      crop: maintainAspectRatio ? 'limit' : 'fill' 
    }
  ]);

  // Add to versions
  upload.versions.push({
    version: `resized_${width}x${height}`,
    url: resizedUrl,
    size: 0, // Would need to fetch actual size
    format: upload.metadata.format || 'jpg',
    quality: 'auto',
    createdAt: new Date()
  });

  await upload.save();

  res.status(200).json({
    success: true,
    message: 'Image resized successfully',
    data: {
      url: resizedUrl,
      upload
    }
  });
});

/**
 * Generate thumbnail
 * @route POST /api/v1/uploads/:id/thumbnail
 * @access Private
 */
export const generateThumbnail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { size = 'medium', width = 300, height = 300 } = req.body;

  const upload = await FileUpload.findById(req.params.id);

  if (!upload) {
    res.status(404).json({
      success: false,
      message: 'Upload not found'
    });
    return;
  }

  if (upload.type !== 'image') {
    res.status(400).json({
      success: false,
      message: 'Only images can have thumbnails'
    });
    return;
  }

  if (!upload.publicId) {
    res.status(400).json({
      success: false,
      message: 'Cannot generate thumbnail without public ID'
    });
    return;
  }

  // Generate thumbnail URL
  const thumbnailUrl = UploadService.getThumbnailUrl(upload.publicId, parseInt(width), parseInt(height));

  // Add to thumbnails array if not exists
  const existingThumbnail = upload.thumbnails.find(t => t.size === size);
  if (!existingThumbnail) {
    upload.thumbnails.push({
      size,
      url: thumbnailUrl,
      width: parseInt(width),
      height: parseInt(height),
      format: upload.metadata.format
    });
    await upload.save();
  }

  res.status(200).json({
    success: true,
    message: 'Thumbnail generated successfully',
    data: {
      url: thumbnailUrl,
      upload
    }
  });
});

/**
 * Optimize image
 * @route POST /api/v1/uploads/:id/optimize
 * @access Private
 */
export const optimizeImage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { quality = 80, format = 'auto' } = req.body;

  const upload = await FileUpload.findById(req.params.id);

  if (!upload) {
    res.status(404).json({
      success: false,
      message: 'Upload not found'
    });
    return;
  }

  if (upload.type !== 'image') {
    res.status(400).json({
      success: false,
      message: 'Only images can be optimized'
    });
    return;
  }

  if (!upload.publicId) {
    res.status(400).json({
      success: false,
      message: 'Cannot optimize file without public ID'
    });
    return;
  }

  // Generate optimized version URL
  const optimizedUrl = UploadService.getOptimizedUrl(upload.publicId, [
    { quality: parseInt(quality), fetch_format: format }
  ]);

  // Add to versions
  upload.versions.push({
    version: `optimized_q${quality}`,
    url: optimizedUrl,
    size: 0, // Would need to fetch actual size
    format: format === 'auto' ? upload.metadata.format || 'jpg' : format,
    quality: quality.toString(),
    createdAt: new Date()
  });

  await upload.save();

  res.status(200).json({
    success: true,
    message: 'Image optimized successfully',
    data: {
      url: optimizedUrl,
      upload
    }
  });
});

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * Delete multiple uploads
 * @route POST /api/v1/uploads/bulk-delete
 * @access Private
 */
export const deleteMultipleUploads = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({
      success: false,
      message: 'No IDs provided'
    });
    return;
  }

  const uploads = await FileUpload.find({ _id: { $in: ids } });

  // Delete from Cloudinary
  const cloudinaryIds = uploads
    .filter(u => u.storageProvider === 'cloudinary' && u.publicId)
    .map(u => u.publicId!);

  if (cloudinaryIds.length > 0) {
    try {
      await UploadService.deleteMultipleImages(cloudinaryIds);
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error);
    }
  }

  // Update folder counts
  const folderUpdates: Map<string, { count: number; size: number }> = new Map();
  uploads.forEach(upload => {
    if (upload.folder) {
      const folderId = upload.folder.toString();
      const current = folderUpdates.get(folderId) || { count: 0, size: 0 };
      folderUpdates.set(folderId, {
        count: current.count + 1,
        size: current.size + upload.size
      });
    }
  });

  await Promise.all(
    Array.from(folderUpdates.entries()).map(([folderId, { count, size }]) =>
      UploadFolder.findByIdAndUpdate(folderId, {
        $inc: { fileCount: -count, totalSize: -size }
      })
    )
  );

  const result = await FileUpload.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    message: `${result.deletedCount} uploads deleted successfully`,
    data: {
      deletedCount: result.deletedCount
    }
  });
});

/**
 * Move multiple uploads
 * @route POST /api/v1/uploads/bulk-move
 * @access Private
 */
export const moveMultipleUploads = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { ids, targetFolderId } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({
      success: false,
      message: 'No IDs provided'
    });
    return;
  }

  const uploads = await FileUpload.find({ _id: { $in: ids } });

  // Calculate folder updates
  const oldFolderUpdates: Map<string, { count: number; size: number }> = new Map();
  let totalSize = 0;

  uploads.forEach(upload => {
    totalSize += upload.size;
    if (upload.folder) {
      const folderId = upload.folder.toString();
      const current = oldFolderUpdates.get(folderId) || { count: 0, size: 0 };
      oldFolderUpdates.set(folderId, {
        count: current.count + 1,
        size: current.size + upload.size
      });
    }
  });

  // Update old folders
  await Promise.all(
    Array.from(oldFolderUpdates.entries()).map(([folderId, { count, size }]) =>
      UploadFolder.findByIdAndUpdate(folderId, {
        $inc: { fileCount: -count, totalSize: -size }
      })
    )
  );

  // Update new folder
  if (targetFolderId) {
    await UploadFolder.findByIdAndUpdate(targetFolderId, {
      $inc: { fileCount: uploads.length, totalSize }
    });
  }

  // Update uploads
  await FileUpload.updateMany(
    { _id: { $in: ids } },
    { $set: { folder: targetFolderId ? new mongoose.Types.ObjectId(targetFolderId) : null } }
  );

  res.status(200).json({
    success: true,
    message: `${uploads.length} uploads moved successfully`,
    data: {
      movedCount: uploads.length
    }
  });
});

/**
 * Update multiple uploads
 * @route POST /api/v1/uploads/bulk-update
 * @access Private
 */
export const updateMultipleUploads = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { updates } = req.body;

  if (!updates || !Array.isArray(updates) || updates.length === 0) {
    res.status(400).json({
      success: false,
      message: 'No updates provided'
    });
    return;
  }

  const bulkOps = updates.map((update: any) => ({
    updateOne: {
      filter: { _id: update.id },
      update: { $set: update.data }
    }
  }));

  const result = await FileUpload.bulkWrite(bulkOps);

  res.status(200).json({
    success: true,
    message: `${result.modifiedCount} uploads updated successfully`,
    data: {
      modifiedCount: result.modifiedCount
    }
  });
});

// ============================================================================
// FOLDER MANAGEMENT
// ============================================================================

/**
 * Get folders
 * @route GET /api/v1/uploads/folders
 * @access Private
 */
export const getFolders = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { parentId } = req.query;

  const filter: any = {};
  if (parentId) {
    filter.parentId = parentId;
  } else {
    filter.parentId = null; // Root folders
  }

  const folders = await UploadFolder.find(filter)
    .populate('createdBy', 'name email')
    .populate('parentId', 'name path')
    .sort({ name: 1 });

  res.status(200).json({
    success: true,
    data: folders
  });
});

/**
 * Create folder
 * @route POST /api/v1/uploads/folders
 * @access Private
 */
export const createFolder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name, description, parentId, isPublic = false, color, icon } = req.body;

  if (!name) {
    res.status(400).json({
      success: false,
      message: 'Folder name is required'
    });
    return;
  }

  // Check for duplicate name in same parent
  const existingFolder = await UploadFolder.findOne({ 
    name, 
    parentId: parentId || null 
  });

  if (existingFolder) {
    res.status(400).json({
      success: false,
      message: 'A folder with this name already exists in this location'
    });
    return;
  }

  const folder = await UploadFolder.create({
    name,
    description,
    parentId: parentId ? new mongoose.Types.ObjectId(parentId) : undefined,
    isPublic,
    color,
    icon,
    createdBy: new mongoose.Types.ObjectId(req.user?._id)
  });

  await folder.populate('createdBy', 'name email');

  res.status(201).json({
    success: true,
    message: 'Folder created successfully',
    data: folder
  });
});

/**
 * Update folder
 * @route PATCH /api/v1/uploads/folders/:id
 * @access Private
 */
export const updateFolder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name, description, isPublic, color, icon } = req.body;

  const folder = await UploadFolder.findById(req.params.id);

  if (!folder) {
    res.status(404).json({
      success: false,
      message: 'Folder not found'
    });
    return;
  }

  // Update fields
  if (name !== undefined) folder.name = name;
  if (description !== undefined) folder.description = description;
  if (isPublic !== undefined) folder.isPublic = isPublic;
  if (color !== undefined) folder.color = color;
  if (icon !== undefined) folder.icon = icon;

  await folder.save();

  res.status(200).json({
    success: true,
    message: 'Folder updated successfully',
    data: folder
  });
});

/**
 * Delete folder
 * @route DELETE /api/v1/uploads/folders/:id
 * @access Private
 */
export const deleteFolder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { force = false } = req.query;

  const folder = await UploadFolder.findById(req.params.id);

  if (!folder) {
    res.status(404).json({
      success: false,
      message: 'Folder not found'
    });
    return;
  }

  // Check if folder has files
  if (!force) {
    const fileCount = await FileUpload.countDocuments({ folder: folder._id });
    if (fileCount > 0) {
      res.status(400).json({
        success: false,
        message: `Folder contains ${fileCount} files. Use force=true to delete anyway.`
      });
      return;
    }
  } else {
    // Delete all files in folder if force is true
    await FileUpload.deleteMany({ folder: folder._id });
  }

  await UploadFolder.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Folder deleted successfully'
  });
});

// ============================================================================
// SEARCH & ANALYTICS
// ============================================================================

/**
 * Search uploads
 * @route GET /api/v1/uploads/search
 * @access Private
 */
export const searchUploads = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const {
    query,
    type,
    category,
    tags,
    minSize,
    maxSize,
    dateFrom,
    dateTo,
    page = 1,
    limit = 20
  } = req.query;

  // Build filter
  const filter: any = {};

  if (query) {
    filter.$text = { $search: query as string };
  }

  if (type) filter.type = type;
  if (category) filter.category = category;
  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : [tags];
    filter.tags = { $in: tagArray };
  }
  if (minSize || maxSize) {
    filter.size = {};
    if (minSize) filter.size.$gte = parseInt(minSize as string);
    if (maxSize) filter.size.$lte = parseInt(maxSize as string);
  }
  if (dateFrom || dateTo) {
    filter.uploadedAt = {};
    if (dateFrom) filter.uploadedAt.$gte = new Date(dateFrom as string);
    if (dateTo) filter.uploadedAt.$lte = new Date(dateTo as string);
  }

  // Pagination
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [uploads, total] = await Promise.all([
    FileUpload.find(filter)
      .sort({ score: { $meta: 'textScore' }, uploadedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('uploadedBy', 'name email')
      .populate('folder', 'name path')
      .lean(),
    FileUpload.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    data: {
      items: uploads,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    }
  });
});

/**
 * Get recent uploads
 * @route GET /api/v1/uploads/recent
 * @access Private
 */
export const getRecentUploads = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { limit = 10 } = req.query;

  const uploads = await FileUpload.find({ status: 'completed' })
    .sort({ uploadedAt: -1 })
    .limit(parseInt(limit as string))
    .populate('uploadedBy', 'name email')
    .populate('folder', 'name path');

  res.status(200).json({
    success: true,
    data: uploads
  });
});

/**
 * Get upload statistics
 * @route GET /api/v1/uploads/statistics
 * @access Private
 */
export const getUploadStatistics = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const stats = await FileUpload.aggregate([
    {
      $group: {
        _id: null,
        totalFiles: { $sum: 1 },
        totalSize: { $sum: '$size' },
        totalDownloads: { $sum: '$downloadCount' },
        averageFileSize: { $avg: '$size' }
      }
    }
  ]);

  const filesByType = await FileUpload.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        size: { $sum: '$size' }
      }
    },
    {
      $project: {
        type: '$_id',
        count: 1,
        size: 1,
        _id: 0
      }
    }
  ]);

  const statistics = stats[0] || {
    totalFiles: 0,
    totalSize: 0,
    totalDownloads: 0,
    averageFileSize: 0
  };

  res.status(200).json({
    success: true,
    data: {
      ...statistics,
      filesByType
    }
  });
});

/**
 * Get storage usage
 * @route GET /api/v1/uploads/storage-usage
 * @access Private
 */
export const getStorageUsage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?._id;

  const userStats = await FileUpload.aggregate([
    {
      $match: { uploadedBy: new mongoose.Types.ObjectId(userId) }
    },
    {
      $group: {
        _id: null,
        totalFiles: { $sum: 1 },
        totalSize: { $sum: '$size' }
      }
    }
  ]);

  const stats = userStats[0] || { totalFiles: 0, totalSize: 0 };

  // Mock quota (in production, this would come from user subscription)
  const storageQuota = 10737418240; // 10GB

  res.status(200).json({
    success: true,
    data: {
      used: stats.totalSize,
      quota: storageQuota,
      remaining: storageQuota - stats.totalSize,
      percentage: (stats.totalSize / storageQuota) * 100,
      fileCount: stats.totalFiles
    }
  });
});

/**
 * Get upload analytics
 * @route GET /api/v1/uploads/analytics
 * @access Private
 */
export const getUploadAnalytics = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { period = '30d' } = req.query;

  let dateFrom = new Date();
  switch (period) {
    case '7d':
      dateFrom.setDate(dateFrom.getDate() - 7);
      break;
    case '30d':
      dateFrom.setDate(dateFrom.getDate() - 30);
      break;
    case '90d':
      dateFrom.setDate(dateFrom.getDate() - 90);
      break;
    case '1y':
      dateFrom.setFullYear(dateFrom.getFullYear() - 1);
      break;
  }

  const overview = await FileUpload.aggregate([
    {
      $match: { uploadedAt: { $gte: dateFrom } }
    },
    {
      $group: {
        _id: null,
        totalFiles: { $sum: 1 },
        totalSize: { $sum: '$size' },
        totalDownloads: { $sum: '$downloadCount' }
      }
    }
  ]);

  const byType = await FileUpload.aggregate([
    {
      $match: { uploadedAt: { $gte: dateFrom } }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        size: { $sum: '$size' }
      }
    }
  ]);

  const byMonth = await FileUpload.aggregate([
    {
      $match: { uploadedAt: { $gte: dateFrom } }
    },
    {
      $group: {
        _id: {
          year: { $year: '$uploadedAt' },
          month: { $month: '$uploadedAt' }
        },
        uploads: { $sum: 1 },
        size: { $sum: '$size' },
        downloads: { $sum: '$downloadCount' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);

  const topFiles = await FileUpload.find({ uploadedAt: { $gte: dateFrom } })
    .sort({ downloadCount: -1 })
    .limit(10)
    .select('originalName downloadCount url type size');

  res.status(200).json({
    success: true,
    data: {
      overview: overview[0] || { totalFiles: 0, totalSize: 0, totalDownloads: 0 },
      byType,
      byMonth,
      topFiles
    }
  });
});

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Get upload config
 * @route GET /api/v1/uploads/config
 * @access Private
 */
export const getUploadConfig = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  let config = await UploadConfig.findOne();

  if (!config) {
    // Create default config
    config = await UploadConfig.create({});
  }

  res.status(200).json({
    success: true,
    data: config
  });
});

/**
 * Update upload config
 * @route PATCH /api/v1/uploads/config
 * @access Private (Admin)
 */
export const updateUploadConfig = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  let config = await UploadConfig.findOne();

  if (!config) {
    config = await UploadConfig.create(req.body);
  } else {
    Object.assign(config, req.body);
    await config.save();
  }

  res.status(200).json({
    success: true,
    message: 'Upload configuration updated successfully',
    data: config
  });
});

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Validate file
 * @route POST /api/v1/uploads/validate
 * @access Private
 */
export const validateFile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { fileName, fileSize, mimeType } = req.body;

  const config = await UploadConfig.findOne() || await UploadConfig.create({});

  const errors: string[] = [];
  const warnings: string[] = [];

  // Check file size
  if (fileSize > config.maxFileSize) {
    errors.push(`File size exceeds maximum allowed size of ${config.maxFileSize} bytes`);
  }

  // Check MIME type
  if (config.allowedMimeTypes.length > 0 && !config.allowedMimeTypes.includes(mimeType)) {
    errors.push(`File type ${mimeType} is not allowed`);
  }

  // Check extension
  const ext = path.extname(fileName).toLowerCase();
  if (config.allowedExtensions.length > 0 && !config.allowedExtensions.includes(ext)) {
    errors.push(`File extension ${ext} is not allowed`);
  }

  res.status(200).json({
    success: true,
    data: {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  });
});

/**
 * Generate signed URL
 * @route POST /api/v1/uploads/:id/signed-url
 * @access Private
 */
export const generateSignedUrl = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { expiresIn = 3600 } = req.body; // Default 1 hour

  const upload = await FileUpload.findById(req.params.id);

  if (!upload) {
    res.status(404).json({
      success: false,
      message: 'Upload not found'
    });
    return;
  }

  // In production, generate actual signed URL based on storage provider
  // For now, return the direct URL with expiration timestamp
  const expiryTime = Date.now() + (expiresIn * 1000);
  const signedUrl = `${upload.url}?expires=${expiryTime}`;

  res.status(200).json({
    success: true,
    data: {
      url: signedUrl,
      expiresAt: new Date(expiryTime)
    }
  });
});
