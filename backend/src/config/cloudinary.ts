import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage
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

export const upload = multer({ storage });

// Upload single image
export const uploadSingle = (fieldName: string) => upload.single(fieldName);

// Upload multiple images
export const uploadMultiple = (fieldName: string, maxCount: number = 10) => 
  upload.array(fieldName, maxCount);

// Upload any/multiple fields with images
export const uploadFields = () => upload.any();

// Debug upload middleware
export const uploadDebug = () => {
  return multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      console.log('MULTER FILEFILTER - Field name:', file.fieldname);
      console.log('MULTER FILEFILTER - Original name:', file.originalname);
      console.log('MULTER FILEFILTER - Mime type:', file.mimetype);
      cb(null, true); // Accept all files for debugging
    }
  }).any();
};

// Upload fields for products (main images + variant images)
export const uploadProductFields = () => upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'variantImages_0', maxCount: 5 },
  { name: 'variantImages_1', maxCount: 5 },
  { name: 'variantImages_2', maxCount: 5 },
  { name: 'variantImages_3', maxCount: 5 },
  { name: 'variantImages_4', maxCount: 5 },
  { name: 'variantImages_5', maxCount: 5 },
  { name: 'variantImages_6', maxCount: 5 },
  { name: 'variantImages_7', maxCount: 5 },
  { name: 'variantImages_8', maxCount: 5 },
  { name: 'variantImages_9', maxCount: 5 }
]);

// Upload image buffer to Cloudinary
export const uploadToCloudinary = async (buffer: Buffer, folder: string = 'vardhman-mills'): Promise<any> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
          { width: 1200, height: 1200, crop: 'limit', quality: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    ).end(buffer);
  });
};

// Delete image from Cloudinary
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
};

// Legacy function name for backward compatibility
export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
};

export { cloudinary };