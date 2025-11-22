/**
 * Image Processing and Optimization Utilities
 * Client-side image manipulation, optimization, and utility functions
 */

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ResizeOptions {
  width?: number;
  height?: number;
  quality?: number;
  maintainAspectRatio?: boolean;
  format?: 'jpeg' | 'png' | 'webp';
}

export interface CompressOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

/**
 * Get image dimensions from file
 */
export function getImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

/**
 * Get image dimensions from URL
 */
export function getImageDimensionsFromUrl(url: string): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image from URL'));
    };
    
    img.crossOrigin = 'anonymous';
    img.src = url;
  });
}

/**
 * Resize image file
 */
export function resizeImage(file: File, options: ResizeOptions = {}): Promise<File> {
  return new Promise((resolve, reject) => {
    const {
      width,
      height,
      quality = 0.8,
      maintainAspectRatio = true,
      format = 'jpeg'
    } = options;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    if (!ctx) {
      reject(new Error('Canvas context not supported'));
      return;
    }
    
    img.onload = () => {
      let newWidth = width || img.naturalWidth;
      let newHeight = height || img.naturalHeight;
      
      if (maintainAspectRatio && width && height) {
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        if (newWidth / newHeight > aspectRatio) {
          newWidth = newHeight * aspectRatio;
        } else {
          newHeight = newWidth / aspectRatio;
        }
      } else if (maintainAspectRatio) {
        if (width && !height) {
          newHeight = (img.naturalHeight * width) / img.naturalWidth;
        } else if (height && !width) {
          newWidth = (img.naturalWidth * height) / img.naturalHeight;
        }
      }
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: `image/${format}`,
              lastModified: Date.now()
            });
            resolve(resizedFile);
          } else {
            reject(new Error('Failed to resize image'));
          }
        },
        `image/${format}`,
        quality
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for resizing'));
    };
    
    img.src = url;
  });
}

/**
 * Compress image file
 */
export function compressImage(file: File, options: CompressOptions = {}): Promise<File> {
  const {
    quality = 0.8,
    maxWidth = 1920,
    maxHeight = 1080,
    format = 'jpeg'
  } = options;
  
  return resizeImage(file, {
    width: maxWidth,
    height: maxHeight,
    quality,
    format,
    maintainAspectRatio: true
  });
}

/**
 * Convert image to base64
 */
export function imageToBase64(file: File, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    if (!ctx) {
      reject(new Error('Canvas context not supported'));
      return;
    }
    
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      ctx.drawImage(img, 0, 0);
      
      const base64 = canvas.toDataURL('image/jpeg', quality);
      URL.revokeObjectURL(url);
      resolve(base64);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for base64 conversion'));
    };
    
    img.src = url;
  });
}

/**
 * Convert base64 to File
 */
export function base64ToFile(base64: string, filename: string): File {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
}

/**
 * Create image thumbnail
 */
export function createThumbnail(file: File, size = 150): Promise<File> {
  return resizeImage(file, {
    width: size,
    height: size,
    quality: 0.7,
    maintainAspectRatio: false,
    format: 'jpeg'
  });
}

/**
 * Crop image to specific area
 */
export function cropImage(
  file: File,
  cropArea: { x: number; y: number; width: number; height: number }
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    if (!ctx) {
      reject(new Error('Canvas context not supported'));
      return;
    }
    
    img.onload = () => {
      canvas.width = cropArea.width;
      canvas.height = cropArea.height;
      
      ctx.drawImage(
        img,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        cropArea.width,
        cropArea.height
      );
      
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) {
            const croppedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(croppedFile);
          } else {
            reject(new Error('Failed to crop image'));
          }
        },
        file.type,
        0.8
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for cropping'));
    };
    
    img.src = url;
  });
}

/**
 * Add watermark to image
 */
export function addWatermark(
  file: File,
  watermarkText: string,
  options: {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    fontSize?: number;
    color?: string;
    opacity?: number;
  } = {}
): Promise<File> {
  return new Promise((resolve, reject) => {
    const {
      position = 'bottom-right',
      fontSize = 24,
      color = 'white',
      opacity = 0.7
    } = options;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    if (!ctx) {
      reject(new Error('Canvas context not supported'));
      return;
    }
    
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Set watermark style
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity;
      
      // Calculate position
      const textMetrics = ctx.measureText(watermarkText);
      let x = 0;
      let y = 0;
      
      switch (position) {
        case 'top-left':
          x = 10;
          y = fontSize + 10;
          break;
        case 'top-right':
          x = canvas.width - textMetrics.width - 10;
          y = fontSize + 10;
          break;
        case 'bottom-left':
          x = 10;
          y = canvas.height - 10;
          break;
        case 'bottom-right':
          x = canvas.width - textMetrics.width - 10;
          y = canvas.height - 10;
          break;
        case 'center':
          x = (canvas.width - textMetrics.width) / 2;
          y = canvas.height / 2;
          break;
      }
      
      // Draw watermark
      ctx.fillText(watermarkText, x, y);
      
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) {
            const watermarkedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(watermarkedFile);
          } else {
            reject(new Error('Failed to add watermark'));
          }
        },
        file.type,
        0.8
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for watermarking'));
    };
    
    img.src = url;
  });
}

/**
 * Validate image file
 */
export function validateImage(file: File, options: {
  maxSize?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  allowedTypes?: string[];
} = {}): Promise<{ valid: boolean; errors: string[] }> {
  return new Promise(async (resolve) => {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB
      minWidth = 0,
      minHeight = 0,
      maxWidth = 10000,
      maxHeight = 10000,
      allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    } = options;
    
    const errors: string[] = [];
    
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
    }
    
    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size too large. Maximum size: ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
    }
    
    try {
      // Check dimensions
      const dimensions = await getImageDimensions(file);
      
      if (dimensions.width < minWidth) {
        errors.push(`Image width too small. Minimum width: ${minWidth}px`);
      }
      
      if (dimensions.height < minHeight) {
        errors.push(`Image height too small. Minimum height: ${minHeight}px`);
      }
      
      if (dimensions.width > maxWidth) {
        errors.push(`Image width too large. Maximum width: ${maxWidth}px`);
      }
      
      if (dimensions.height > maxHeight) {
        errors.push(`Image height too large. Maximum height: ${maxHeight}px`);
      }
    } catch {
      errors.push('Failed to read image dimensions');
    }
    
    resolve({
      valid: errors.length === 0,
      errors
    });
  });
}

/**
 * Generate image placeholder URL
 */
export function generatePlaceholder(
  width: number,
  height: number,
  options: {
    backgroundColor?: string;
    textColor?: string;
    text?: string;
    format?: 'svg' | 'data-url';
  } = {}
): string {
  const {
    backgroundColor = '#f0f0f0',
    textColor = '#999999',
    text = `${width} × ${height}`,
    format = 'svg'
  } = options;
  
  if (format === 'data-url') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return '';
    
    canvas.width = width;
    canvas.height = height;
    
    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    
    // Add text
    ctx.fillStyle = textColor;
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);
    
    return canvas.toDataURL();
  }
  
  // SVG format
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${backgroundColor}"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="${textColor}" font-family="Arial, sans-serif" font-size="16">
        ${text}
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Check if image is loaded
 */
export function isImageLoaded(imgElement: HTMLImageElement): boolean {
  return imgElement.complete && imgElement.naturalHeight !== 0;
}

/**
 * Preload images
 */
export function preloadImages(urls: string[]): Promise<HTMLImageElement[]> {
  return Promise.all(
    urls.map(url => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
      });
    })
  );
}

/**
 * Get dominant color from image
 */
export function getDominantColor(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    if (!ctx) {
      reject(new Error('Canvas context not supported'));
      return;
    }
    
    img.onload = () => {
      const size = 50; // Small size for performance
      canvas.width = size;
      canvas.height = size;
      
      ctx.drawImage(img, 0, 0, size, size);
      
      const imageData = ctx.getImageData(0, 0, size, size);
      const data = imageData.data;
      
      let r = 0, g = 0, b = 0, count = 0;
      
      // Sample every 4th pixel for performance
      for (let i = 0; i < data.length; i += 16) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }
      
      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);
      
      URL.revokeObjectURL(url);
      resolve(`rgb(${r}, ${g}, ${b})`);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for color analysis'));
    };
    
    img.src = url;
  });
}

/**
 * Image utilities object
 */
export const image = {
  dimensions: getImageDimensions,
  dimensionsFromUrl: getImageDimensionsFromUrl,
  resize: resizeImage,
  compress: compressImage,
  toBase64: imageToBase64,
  fromBase64: base64ToFile,
  thumbnail: createThumbnail,
  crop: cropImage,
  watermark: addWatermark,
  validate: validateImage,
  placeholder: generatePlaceholder,
  isLoaded: isImageLoaded,
  preload: preloadImages,
  dominantColor: getDominantColor
};

/**
 * Get image URL from various input types
 */
export function getImageUrl(image: string | { url: string } | { src: string } | undefined): string {
  if (!image) return '/images/placeholder.jpg';
  if (typeof image === 'string') return image;
  if ('url' in image) return image.url;
  if ('src' in image) return image.src;
  return '/images/placeholder.jpg';
}

/**
 * Get optimized image URL with transformations
 */
export function getOptimizedImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  } = {}
): string {
  if (!url) return '/images/placeholder.jpg';
  
  // If using a CDN that supports query parameters for optimization
  const params = new URLSearchParams();
  
  if (options.width) params.append('w', options.width.toString());
  if (options.height) params.append('h', options.height.toString());
  if (options.quality) params.append('q', options.quality.toString());
  if (options.format) params.append('f', options.format);
  
  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
}

// Export default
const imageUtils = {
  getImageDimensions,
  getImageDimensionsFromUrl,
  getImageUrl,
  getOptimizedImageUrl,
  resizeImage,
  compressImage,
  imageToBase64,
  base64ToFile,
  createThumbnail,
  cropImage,
  addWatermark,
  validateImage,
  generatePlaceholder,
  isImageLoaded,
  preloadImages,
  getDominantColor,
  image
};

export default imageUtils;
