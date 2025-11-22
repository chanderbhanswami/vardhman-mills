import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from '../config/cloudinary.js';
import AppError from '../utils/appError.js';

// Configure multer for Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'vardhman-mills',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1200, height: 1200, crop: 'limit', quality: 'auto' }
    ]
  } as any
});

// Memory storage for buffer uploads
const memoryStorage = multer.memoryStorage();

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

// Configure multer for Cloudinary direct upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files
  }
});

// Configure multer for memory storage (buffer uploads)
const uploadMemory = multer({
  storage: memoryStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files
  }
});

export const uploadSingle = (fieldName: string) => uploadMemory.single(fieldName);
export const uploadMultiple = (fieldName: string, maxCount: number = 10) => 
  uploadMemory.array(fieldName, maxCount);
export const uploadFields = (fields: { name: string; maxCount: number }[]) => 
  uploadMemory.fields(fields);

// Direct Cloudinary uploads
export const uploadSingleDirect = (fieldName: string) => upload.single(fieldName);
export const uploadMultipleDirect = (fieldName: string, maxCount: number = 10) => 
  upload.array(fieldName, maxCount);

export default upload;