import { cloudinary } from '../config/cloudinary';
import { UploadApiResponse } from 'cloudinary';

export interface UploadOptions {
  folder?: string;
  public_id?: string;
  transformation?: any[];
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
}

export class UploadService {
  static async uploadImage(
    filePath: string, 
    options: UploadOptions = {}
  ): Promise<UploadApiResponse> {
    const defaultOptions: UploadOptions = {
      folder: 'vardhman-mills',
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit', quality: 'auto' }
      ]
    };

    const uploadOptions = { ...defaultOptions, ...options };
    
    return await cloudinary.uploader.upload(filePath, uploadOptions);
  }

  static async uploadMultipleImages(
    filePaths: string[], 
    options: UploadOptions = {}
  ): Promise<UploadApiResponse[]> {
    const uploadPromises = filePaths.map(filePath => 
      this.uploadImage(filePath, options)
    );
    
    return await Promise.all(uploadPromises);
  }

  static async deleteImage(publicId: string): Promise<any> {
    return await cloudinary.uploader.destroy(publicId);
  }

  static async deleteMultipleImages(publicIds: string[]): Promise<any> {
    return await cloudinary.api.delete_resources(publicIds);
  }

  static getOptimizedUrl(
    publicId: string, 
    transformations: any[] = []
  ): string {
    return cloudinary.url(publicId, {
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
        ...transformations
      ]
    });
  }

  static getThumbnailUrl(publicId: string, width: number = 300, height: number = 300): string {
    return this.getOptimizedUrl(publicId, [
      { width, height, crop: 'fill', gravity: 'center' }
    ]);
  }
}