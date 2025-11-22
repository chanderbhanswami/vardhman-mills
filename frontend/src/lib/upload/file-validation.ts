/**
 * File Validation for Vardhman Mills Frontend
 * Comprehensive file validation and security checks
 */

// File validation result interface
export interface FileValidationResult {
  isValid: boolean;
  file?: File;
  errors: string[];
  warnings: string[];
  metadata: FileMetadata;
}

// File metadata interface
export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  extension: string;
  lastModified: Date;
  isImage: boolean;
  isVideo: boolean;
  isAudio: boolean;
  isDocument: boolean;
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number;
  aspectRatio?: number;
  colorDepth?: number;
  hasAlpha?: boolean;
  hash?: string;
  preview?: string;
}

// Validation configuration interface
export interface FileValidationConfig {
  maxFileSize: number; // in bytes
  minFileSize: number; // in bytes
  allowedTypes: string[];
  allowedExtensions: string[];
  blockedExtensions: string[];
  maxImageWidth?: number;
  maxImageHeight?: number;
  minImageWidth?: number;
  minImageHeight?: number;
  maxVideoDuration?: number; // in seconds
  minVideoDuration?: number; // in seconds
  allowedAspectRatios?: number[];
  aspectRatioTolerance?: number;
  enableVirusScan?: boolean;
  enableContentValidation?: boolean;
  enableImageAnalysis?: boolean;
  enableMetadataExtraction?: boolean;
  customValidators?: CustomFileValidator[];
  securityLevel: 'low' | 'medium' | 'high' | 'strict';
}

// Custom validator interface
export interface CustomFileValidator {
  name: string;
  validate: (file: File, metadata: FileMetadata) => Promise<ValidationResult>;
  priority: number;
}

// Validation result for custom validators
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Virus scan result interface
export interface VirusScanResult {
  clean: boolean;
  threats: string[];
  scanTime: number;
  engine: string;
  engineVersion: string;
  fileSize?: number;
  scanMode?: 'quick' | 'deep';
}

// Image analysis result interface
export interface ImageAnalysisResult {
  isValid: boolean;
  format: string;
  colorSpace: string;
  hasTransparency: boolean;
  isAnimated: boolean;
  frameCount?: number;
  compression?: string;
  quality?: number;
  dpi?: { x: number; y: number };
  colorProfile?: string;
  exifData?: Record<string, unknown>;
}

// Content validation result interface
export interface ContentValidationResult {
  isAppropriate: boolean;
  confidence: number;
  categories: Array<{
    name: string;
    confidence: number;
  }>;
  flags: string[];
  suggestedActions: string[];
}

// Default validation configuration
export const DEFAULT_VALIDATION_CONFIG: FileValidationConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  minFileSize: 1024, // 1KB
  allowedTypes: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/gif',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/json',
    'application/xml',
  ],
  allowedExtensions: [
    'jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'svg',
    'mp4', 'webm', 'mov',
    'mp3', 'wav', 'ogg',
    'pdf', 'txt', 'csv', 'json', 'xml',
  ],
  blockedExtensions: [
    'exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js',
    'jar', 'app', 'deb', 'pkg', 'rpm',
    'php', 'asp', 'aspx', 'jsp', 'py', 'rb', 'pl',
  ],
  maxImageWidth: 8000,
  maxImageHeight: 8000,
  minImageWidth: 50,
  minImageHeight: 50,
  maxVideoDuration: 300, // 5 minutes
  minVideoDuration: 1, // 1 second
  allowedAspectRatios: [1, 4/3, 3/2, 16/9, 21/9],
  aspectRatioTolerance: 0.1,
  enableVirusScan: false,
  enableContentValidation: false,
  enableImageAnalysis: true,
  enableMetadataExtraction: true,
  customValidators: [],
  securityLevel: 'medium',
};

// MIME type mappings
export const MIME_TYPE_MAPPINGS: Record<string, string[]> = {
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/gif': ['gif'],
  'image/webp': ['webp'],
  'image/avif': ['avif'],
  'image/svg+xml': ['svg'],
  'image/bmp': ['bmp'],
  'image/tiff': ['tiff', 'tif'],
  'video/mp4': ['mp4'],
  'video/webm': ['webm'],
  'video/quicktime': ['mov'],
  'video/avi': ['avi'],
  'audio/mpeg': ['mp3'],
  'audio/wav': ['wav'],
  'audio/ogg': ['ogg'],
  'application/pdf': ['pdf'],
  'text/plain': ['txt'],
  'text/csv': ['csv'],
  'application/json': ['json'],
  'application/xml': ['xml'],
  'application/zip': ['zip'],
  'application/x-rar-compressed': ['rar'],
  'application/x-7z-compressed': ['7z'],
};

// File type categories
export const FILE_TYPE_CATEGORIES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/svg+xml'],
  VIDEO: ['video/mp4', 'video/webm', 'video/quicktime', 'video/avi'],
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac'],
  DOCUMENT: ['application/pdf', 'text/plain', 'text/csv', 'application/json', 'application/xml'],
  ARCHIVE: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
};

/**
 * File Validation Service
 */
export class FileValidator {
  private static instance: FileValidator;
  private config: FileValidationConfig;

  private constructor(config: FileValidationConfig = DEFAULT_VALIDATION_CONFIG) {
    this.config = { ...DEFAULT_VALIDATION_CONFIG, ...config };
  }

  static getInstance(config?: Partial<FileValidationConfig>): FileValidator {
    if (!FileValidator.instance) {
      FileValidator.instance = new FileValidator(config as FileValidationConfig);
    }
    return FileValidator.instance;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<FileValidationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Validate single file
   */
  async validateFile(file: File): Promise<FileValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let isValid = true;

    // Extract metadata
    const metadata = await this.extractMetadata(file);

    // Basic validation
    const basicValidation = this.validateBasics(file, metadata);
    if (!basicValidation.valid) {
      errors.push(...basicValidation.errors);
      warnings.push(...basicValidation.warnings);
      isValid = false;
    }

    // Type validation
    const typeValidation = this.validateType(file, metadata);
    if (!typeValidation.valid) {
      errors.push(...typeValidation.errors);
      warnings.push(...typeValidation.warnings);
      isValid = false;
    }

    // Size validation
    const sizeValidation = this.validateSize(file, metadata);
    if (!sizeValidation.valid) {
      errors.push(...sizeValidation.errors);
      warnings.push(...sizeValidation.warnings);
      isValid = false;
    }

    // Dimension validation (for images/videos)
    if (metadata.isImage || metadata.isVideo) {
      const dimensionValidation = await this.validateDimensions(file, metadata);
      if (!dimensionValidation.valid) {
        errors.push(...dimensionValidation.errors);
        warnings.push(...dimensionValidation.warnings);
        if (this.config.securityLevel === 'strict') {
          isValid = false;
        }
      }
    }

    // Content validation
    if (this.config.enableContentValidation) {
      const contentValidation = await this.validateContent(file, metadata);
      if (!contentValidation.valid) {
        errors.push(...contentValidation.errors);
        warnings.push(...contentValidation.warnings);
        if (this.config.securityLevel === 'high' || this.config.securityLevel === 'strict') {
          isValid = false;
        }
      }
    }

    // Security validation
    const securityValidation = await this.validateSecurity(file, metadata);
    if (!securityValidation.valid) {
      errors.push(...securityValidation.errors);
      warnings.push(...securityValidation.warnings);
      if (this.config.securityLevel !== 'low') {
        isValid = false;
      }
    }

    // Custom validators
    if (this.config.customValidators && this.config.customValidators.length > 0) {
      const customValidation = await this.runCustomValidators(file, metadata);
      if (!customValidation.valid) {
        errors.push(...customValidation.errors);
        warnings.push(...customValidation.warnings);
        isValid = false;
      }
    }

    return {
      isValid,
      file: isValid ? file : undefined,
      errors,
      warnings,
      metadata,
    };
  }

  /**
   * Validate multiple files
   */
  async validateFiles(files: File[]): Promise<FileValidationResult[]> {
    const validationPromises = files.map(file => this.validateFile(file));
    return Promise.all(validationPromises);
  }

  /**
   * Extract file metadata
   */
  async extractMetadata(file: File): Promise<FileMetadata> {
    const extension = this.getFileExtension(file.name);
    const isImage = this.isImageFile(file);
    const isVideo = this.isVideoFile(file);
    const isAudio = this.isAudioFile(file);
    const isDocument = this.isDocumentFile(file);

    const metadata: FileMetadata = {
      name: file.name,
      size: file.size,
      type: file.type,
      extension,
      lastModified: new Date(file.lastModified),
      isImage,
      isVideo,
      isAudio,
      isDocument,
    };

    // Extract dimensions for images
    if (isImage && this.config.enableMetadataExtraction) {
      try {
        const dimensions = await this.getImageDimensions(file);
        metadata.dimensions = dimensions;
        metadata.aspectRatio = dimensions.width / dimensions.height;
      } catch (error) {
        console.warn('Failed to extract image dimensions:', error);
      }
    }

    // Extract duration for videos/audio
    if ((isVideo || isAudio) && this.config.enableMetadataExtraction) {
      try {
        const duration = await this.getMediaDuration(file);
        metadata.duration = duration;
      } catch (error) {
        console.warn('Failed to extract media duration:', error);
      }
    }

    // Generate file hash for integrity
    if (this.config.securityLevel === 'high' || this.config.securityLevel === 'strict') {
      try {
        metadata.hash = await this.generateFileHash(file);
      } catch (error) {
        console.warn('Failed to generate file hash:', error);
      }
    }

    // Generate preview for images
    if (isImage) {
      try {
        metadata.preview = await this.generatePreview(file);
      } catch (error) {
        console.warn('Failed to generate preview:', error);
      }
    }

    return metadata;
  }

  /**
   * Basic validation (name, size, etc.)
   */
  private validateBasics(file: File, metadata: FileMetadata): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check file name
    if (!file.name || file.name.trim().length === 0) {
      errors.push('File name is required');
    }

    if (file.name.length > 255) {
      errors.push('File name is too long (max 255 characters)');
    }

    // Check metadata consistency
    if (metadata.name !== file.name) {
      warnings.push('Metadata name differs from file name');
    }

    // Check for suspicious file names
    const suspiciousPatterns = [
      /\.(exe|bat|cmd|com|pif|scr|vbs)$/i,
      /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i,
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
      errors.push('File name contains suspicious patterns');
    }

    // Check for special characters
    if (/[<>:"|?*\\\/]/.test(file.name)) {
      warnings.push('File name contains special characters that may cause issues');
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Type validation
   */
  private validateType(file: File, metadata: FileMetadata): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check MIME type
    if (!this.config.allowedTypes.includes(file.type)) {
      errors.push(`File type '${file.type}' is not allowed`);
    }

    // Check extension
    if (!this.config.allowedExtensions.includes(metadata.extension.toLowerCase())) {
      errors.push(`File extension '${metadata.extension}' is not allowed`);
    }

    // Check blocked extensions
    if (this.config.blockedExtensions.includes(metadata.extension.toLowerCase())) {
      errors.push(`File extension '${metadata.extension}' is blocked for security reasons`);
    }

    // Check MIME type and extension consistency
    const expectedExtensions = MIME_TYPE_MAPPINGS[file.type];
    if (expectedExtensions && !expectedExtensions.includes(metadata.extension.toLowerCase())) {
      warnings.push(`File extension '${metadata.extension}' doesn't match MIME type '${file.type}'`);
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Size validation
   */
  private validateSize(file: File, metadata: FileMetadata): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (file.size > this.config.maxFileSize) {
      errors.push(`File size ${this.formatFileSize(file.size)} exceeds maximum allowed size ${this.formatFileSize(this.config.maxFileSize)}`);
    }

    if (file.size < this.config.minFileSize) {
      errors.push(`File size ${this.formatFileSize(file.size)} is below minimum required size ${this.formatFileSize(this.config.minFileSize)}`);
    }

    // Warnings for large files
    if (file.size > this.config.maxFileSize * 0.8) {
      warnings.push('File size is approaching the maximum limit');
    }

    // Check metadata size consistency
    if (metadata.size !== file.size) {
      warnings.push('Metadata size differs from actual file size');
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Dimension validation
   */
  private async validateDimensions(file: File, metadata: FileMetadata): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (metadata.dimensions) {
      const { width, height } = metadata.dimensions;

      // Check maximum dimensions
      if (this.config.maxImageWidth && width > this.config.maxImageWidth) {
        errors.push(`Image width ${width}px exceeds maximum allowed width ${this.config.maxImageWidth}px`);
      }

      if (this.config.maxImageHeight && height > this.config.maxImageHeight) {
        errors.push(`Image height ${height}px exceeds maximum allowed height ${this.config.maxImageHeight}px`);
      }

      // Check minimum dimensions
      if (this.config.minImageWidth && width < this.config.minImageWidth) {
        errors.push(`Image width ${width}px is below minimum required width ${this.config.minImageWidth}px`);
      }

      if (this.config.minImageHeight && height < this.config.minImageHeight) {
        errors.push(`Image height ${height}px is below minimum required height ${this.config.minImageHeight}px`);
      }

      // Check aspect ratio
      if (this.config.allowedAspectRatios && metadata.aspectRatio) {
        const tolerance = this.config.aspectRatioTolerance || 0.1;
        const aspectRatioValid = this.config.allowedAspectRatios.some(ratio => 
          Math.abs(metadata.aspectRatio! - ratio) <= tolerance
        );

        if (!aspectRatioValid) {
          warnings.push(`Image aspect ratio ${metadata.aspectRatio.toFixed(2)} is not in the preferred list`);
        }
      }
    }

    // Duration validation for videos
    if (metadata.duration !== undefined) {
      if (this.config.maxVideoDuration && metadata.duration > this.config.maxVideoDuration) {
        errors.push(`Video duration ${metadata.duration}s exceeds maximum allowed duration ${this.config.maxVideoDuration}s`);
      }

      if (this.config.minVideoDuration && metadata.duration < this.config.minVideoDuration) {
        errors.push(`Video duration ${metadata.duration}s is below minimum required duration ${this.config.minVideoDuration}s`);
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Content validation (placeholder for AI-based content analysis)
   */
  private async validateContent(file: File, metadata: FileMetadata): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // This would typically integrate with content moderation services
    // For now, we'll implement basic checks

    if (metadata.isImage) {
      // Basic image content validation
      try {
        const imageData = await this.analyzeImageContent(file);
        if (imageData && !imageData.isAppropriate) {
          errors.push('Image content may be inappropriate');
        }
      } catch (err) {
        warnings.push(`Could not analyze image content: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Security validation
   */
  private async validateSecurity(file: File, metadata: FileMetadata): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check file signature (magic bytes)
    try {
      const isValidSignature = await this.validateFileSignature(file);
      if (!isValidSignature) {
        errors.push('File signature does not match the declared file type');
      }
    } catch (err) {
      warnings.push(`Could not validate file signature: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    // Virus scan (if enabled)
    if (this.config.enableVirusScan) {
      try {
        const scanResult = await this.scanForViruses(file);
        if (!scanResult.clean) {
          errors.push(`Virus detected: ${scanResult.threats.join(', ')}`);
        }
      } catch (err) {
        warnings.push(`Could not perform virus scan: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    // Check for embedded scripts in images
    if (metadata.isImage && (this.config.securityLevel === 'high' || this.config.securityLevel === 'strict')) {
      try {
        const hasEmbeddedScript = await this.checkForEmbeddedScripts(file);
        if (hasEmbeddedScript) {
          errors.push('Image contains embedded scripts or suspicious content');
        }
      } catch (err) {
        warnings.push(`Could not check for embedded scripts: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Run custom validators
   */
  private async runCustomValidators(file: File, metadata: FileMetadata): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Sort validators by priority
    const sortedValidators = [...this.config.customValidators!].sort((a, b) => b.priority - a.priority);

    for (const validator of sortedValidators) {
      try {
        const result = await validator.validate(file, metadata);
        if (!result.valid) {
          errors.push(...result.errors);
          warnings.push(...result.warnings);
        }
      } catch (err) {
        warnings.push(`Custom validator '${validator.name}' failed: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Helper methods
   */
  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot !== -1 ? filename.slice(lastDot + 1) : '';
  }

  private isImageFile(file: File): boolean {
    return FILE_TYPE_CATEGORIES.IMAGE.includes(file.type);
  }

  private isVideoFile(file: File): boolean {
    return FILE_TYPE_CATEGORIES.VIDEO.includes(file.type);
  }

  private isAudioFile(file: File): boolean {
    return FILE_TYPE_CATEGORIES.AUDIO.includes(file.type);
  }

  private isDocumentFile(file: File): boolean {
    return FILE_TYPE_CATEGORIES.DOCUMENT.includes(file.type);
  }

  private async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      img.src = URL.createObjectURL(file);
    });
  }

  private async getMediaDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const media = document.createElement(file.type.startsWith('video') ? 'video' : 'audio');
      media.onloadedmetadata = () => {
        resolve(media.duration);
      };
      media.onerror = () => {
        reject(new Error('Failed to load media'));
      };
      media.src = URL.createObjectURL(file);
    });
  }

  private async generateFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async generatePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = 200;
        canvas.height = 200;
        
        const scale = Math.min(200 / img.width, 200 / img.height);
        const width = img.width * scale;
        const height = img.height * scale;
        const x = (200 - width) / 2;
        const y = (200 - height) / 2;

        ctx?.drawImage(img, x, y, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };

      img.onerror = () => {
        reject(new Error('Failed to generate preview'));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  private async validateFileSignature(file: File): Promise<boolean> {
    const buffer = await file.slice(0, 8).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    // Common file signatures
    const signatures: Record<string, number[][]> = {
      'image/jpeg': [[0xFF, 0xD8, 0xFF]],
      'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
      'image/gif': [[0x47, 0x49, 0x46, 0x38], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]],
      'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF (partial)
      'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
    };

    const expectedSignatures = signatures[file.type];
    if (!expectedSignatures) {
      return true; // Unknown type, skip validation
    }

    return expectedSignatures.some(signature =>
      signature.every((byte, index) => bytes[index] === byte)
    );
  }

  private async scanForViruses(file: File): Promise<VirusScanResult> {
    // Placeholder for virus scanning integration
    // This would typically integrate with services like VirusTotal, ClamAV, etc.
    
    // Use file parameter to determine scan complexity
    const scanStartTime = Date.now();
    const isLargeFile = file.size > 50 * 1024 * 1024; // 50MB threshold
    
    // Simulate basic file inspection
    if (file.name.toLowerCase().includes('suspicious') || file.name.includes('malware')) {
      return {
        clean: false,
        threats: ['Suspicious filename detected'],
        scanTime: Date.now() - scanStartTime,
        engine: 'placeholder',
        engineVersion: '1.0.0',
      };
    }
    
    return {
      clean: true,
      threats: [],
      scanTime: Date.now() - scanStartTime,
      engine: 'placeholder',
      engineVersion: '1.0.0',
      fileSize: file.size,
      scanMode: isLargeFile ? 'deep' : 'quick',
    };
  }

  private async checkForEmbeddedScripts(file: File): Promise<boolean> {
    if (!file.type.startsWith('image/')) {
      return false;
    }

    try {
      const text = await file.text();
      const scriptPatterns = [
        /<script/i,
        /javascript:/i,
        /onclick=/i,
        /onerror=/i,
        /onload=/i,
        /eval\s*\(/i,
      ];

      return scriptPatterns.some(pattern => pattern.test(text));
    } catch {
      // If we can't read as text, it's probably a valid binary image
      return false;
    }
  }

  private async analyzeImageContent(file: File): Promise<ContentValidationResult | null> {
    // Placeholder for content analysis integration
    // This would typically integrate with services like Google Cloud Vision, AWS Rekognition, etc.
    
    // Use file information for basic analysis
    const fileName = file.name.toLowerCase();
    const fileSize = file.size;
    
    // Basic content analysis based on file characteristics
    const flags: string[] = [];
    const categories: Array<{ name: string; confidence: number }> = [];
    
    // Check file name for inappropriate content indicators
    if (fileName.includes('explicit') || fileName.includes('adult') || fileName.includes('nsfw')) {
      flags.push('potentially_inappropriate_filename');
    }
    
    // Size-based analysis
    if (fileSize > 10 * 1024 * 1024) { // 10MB
      categories.push({ name: 'large_image', confidence: 0.9 });
    }
    
    // File extension analysis
    if (fileName.endsWith('.gif')) {
      categories.push({ name: 'animated_content', confidence: 0.95 });
    }
    
    return {
      isAppropriate: flags.length === 0,
      confidence: flags.length === 0 ? 0.95 : 0.7,
      categories,
      flags,
      suggestedActions: flags.length > 0 ? ['manual_review'] : [],
    };
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Utility functions
export const FileValidationUtils = {
  /**
   * Get file type category
   */
  getFileCategory: (file: File): string => {
    for (const [category, types] of Object.entries(FILE_TYPE_CATEGORIES)) {
      if (types.includes(file.type)) {
        return category.toLowerCase();
      }
    }
    return 'unknown';
  },

  /**
   * Check if file is supported
   */
  isFileSupported: (file: File, config: FileValidationConfig): boolean => {
    return config.allowedTypes.includes(file.type);
  },

  /**
   * Get maximum files for category
   */
  getMaxFilesForCategory: (category: string): number => {
    const limits: Record<string, number> = {
      image: 20,
      video: 5,
      audio: 10,
      document: 50,
      archive: 3,
    };
    return limits[category] || 10;
  },

  /**
   * Generate file validation summary
   */
  generateValidationSummary: (results: FileValidationResult[]): {
    totalFiles: number;
    validFiles: number;
    invalidFiles: number;
    totalErrors: number;
    totalWarnings: number;
    categorySummary: Record<string, { count: number; valid: number }>;
  } => {
    const summary = {
      totalFiles: results.length,
      validFiles: results.filter(r => r.isValid).length,
      invalidFiles: results.filter(r => !r.isValid).length,
      totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
      totalWarnings: results.reduce((sum, r) => sum + r.warnings.length, 0),
      categorySummary: {} as Record<string, { count: number; valid: number }>,
    };

    // Generate category summary
    results.forEach(result => {
      const category = FileValidationUtils.getFileCategory(result.file || new File([], ''));
      if (!summary.categorySummary[category]) {
        summary.categorySummary[category] = { count: 0, valid: 0 };
      }
      summary.categorySummary[category].count++;
      if (result.isValid) {
        summary.categorySummary[category].valid++;
      }
    });

    return summary;
  },

  /**
   * Create custom validator
   */
  createCustomValidator: (
    name: string,
    validateFn: (file: File, metadata: FileMetadata) => Promise<ValidationResult>,
    priority: number = 0
  ): CustomFileValidator => ({
    name,
    validate: validateFn,
    priority,
  }),

  /**
   * Create file size validator
   */
  createFileSizeValidator: (maxSize: number, minSize: number = 0): CustomFileValidator => ({
    name: 'File Size Validator',
    priority: 1,
    validate: async (file: File) => {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (file.size > maxSize) {
        errors.push(`File size exceeds ${FileValidationUtils.formatBytes(maxSize)}`);
      }

      if (file.size < minSize) {
        errors.push(`File size below ${FileValidationUtils.formatBytes(minSize)}`);
      }

      return { valid: errors.length === 0, errors, warnings };
    },
  }),

  /**
   * Create image dimension validator
   */
  createImageDimensionValidator: (
    maxWidth: number,
    maxHeight: number,
    minWidth: number = 0,
    minHeight: number = 0
  ): CustomFileValidator => ({
    name: 'Image Dimension Validator',
    priority: 2,
    validate: async (file: File, metadata: FileMetadata) => {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!metadata.isImage || !metadata.dimensions) {
        return { valid: true, errors, warnings };
      }

      const { width, height } = metadata.dimensions;

      if (width > maxWidth) {
        errors.push(`Image width ${width}px exceeds maximum ${maxWidth}px`);
      }

      if (height > maxHeight) {
        errors.push(`Image height ${height}px exceeds maximum ${maxHeight}px`);
      }

      if (width < minWidth) {
        errors.push(`Image width ${width}px below minimum ${minWidth}px`);
      }

      if (height < minHeight) {
        errors.push(`Image height ${height}px below minimum ${minHeight}px`);
      }

      return { valid: errors.length === 0, errors, warnings };
    },
  }),

  /**
   * Format bytes
   */
  formatBytes: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Get MIME type from extension
   */
  getMimeTypeFromExtension: (extension: string): string => {
    for (const [mimeType, extensions] of Object.entries(MIME_TYPE_MAPPINGS)) {
      if (extensions.includes(extension.toLowerCase())) {
        return mimeType;
      }
    }
    return 'application/octet-stream';
  },

  /**
   * Validate file batch
   */
  validateFileBatch: async (
    files: File[],
    config?: Partial<FileValidationConfig>
  ): Promise<FileValidationResult[]> => {
    const validator = FileValidator.getInstance(config);
    return validator.validateFiles(files);
  },
};

// Export singleton instance
export const fileValidator = FileValidator.getInstance();

export default FileValidator;