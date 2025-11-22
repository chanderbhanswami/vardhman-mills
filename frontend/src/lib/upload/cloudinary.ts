/**
 * Cloudinary Integration for Vardhman Mills Frontend
 * Comprehensive cloud media management solution
 */

// Cloudinary configuration interface
export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret?: string; // Only for server-side operations
  secure: boolean;
  folder?: string;
  uploadPreset?: string;
  transformation?: CloudinaryTransformation;
  autoOptimization?: boolean;
  enableAnalytics?: boolean;
  maxFileSize?: number; // in bytes
  allowedFormats?: string[];
  quality?: 'auto' | number;
  fetchFormat?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  deliveryType?: 'upload' | 'fetch' | 'private' | 'authenticated';
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
}

// Cloudinary transformation options
export interface CloudinaryTransformation {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'limit' | 'scale' | 'crop' | 'thumb' | 'auto';
  gravity?: 'auto' | 'center' | 'north' | 'south' | 'east' | 'west' | 'face' | 'faces';
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png' | 'gif';
  dpr?: 'auto' | number;
  flags?: string[];
  effects?: string[];
  overlay?: string;
  underlay?: string;
  border?: string;
  radius?: number | string;
  angle?: number;
  opacity?: number;
  background?: string;
  color?: string;
  fetchFormat?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  progressive?: boolean;
  customFunction?: string;
  rawTransformation?: string;
}

// Upload response interface
export interface CloudinaryUploadResponse {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder?: string;
  original_filename: string;
  api_key: string;
  eager?: CloudinaryEagerResponse[];
  context?: Record<string, string>;
  metadata?: Record<string, unknown>;
  colors?: Array<[string, number]>;
  faces?: Array<[number, number, number, number]>;
  quality_analysis?: {
    focus: number;
    noise: number;
    contrast: number;
    brightness: number;
    saturation: number;
    colorfulness: number;
    resolution: number;
  };
  accessibility_analysis?: {
    colorblind_accessibility_analysis: {
      distinct_edges: number;
      distinct_colors: number;
      most_indistinct_pair: [string, string];
      most_indistinct_pair_diff: number;
    };
  };
}

// Eager transformation response
export interface CloudinaryEagerResponse {
  transformation: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
  url: string;
  secure_url: string;
}

// Upload options interface
export interface CloudinaryUploadOptions {
  public_id?: string;
  folder?: string;
  tags?: string[];
  context?: Record<string, string>;
  metadata?: Record<string, unknown>;
  transformation?: CloudinaryTransformation;
  eager?: CloudinaryTransformation[];
  eager_async?: boolean;
  notification_url?: string;
  proxy?: string;
  return_delete_token?: boolean;
  overwrite?: boolean;
  invalidate?: boolean;
  use_filename?: boolean;
  unique_filename?: boolean;
  filename_override?: string;
  auto_tagging?: number;
  categorization?: string;
  detection?: string;
  background_removal?: 'remove_background' | 'background_removal';
  ocr?: string;
  raw_convert?: string;
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
  type?: 'upload' | 'private' | 'authenticated';
  access_mode?: 'public' | 'authenticated';
  allowed_formats?: string[];
  async?: boolean;
  backup?: boolean;
  eval?: string;
  headers?: Record<string, string>;
  moderation?: 'manual' | 'webpurify' | 'aws_rek' | 'metascan';
  phash?: boolean;
  responsive_breakpoints?: ResponsiveBreakpoint[];
  quality_analysis?: boolean;
  accessibility_analysis?: boolean;
  cinemagraph_analysis?: boolean;
  colors?: boolean;
  faces?: boolean;
  image_metadata?: boolean;
  media_metadata?: boolean;
  pages?: boolean;
  exif?: boolean;
  coordinates?: boolean;
  max_results?: number;
  duration?: number;
  offset?: number;
  end_offset?: number;
  keyframe_interval?: number;
  streaming_profile?: string;
  bit_rate?: string;
  fps?: number;
}

// Responsive breakpoints configuration
export interface ResponsiveBreakpoint {
  create_derived: boolean;
  bytes_step?: number;
  min_width?: number;
  max_width?: number;
  max_images?: number;
  transformation?: CloudinaryTransformation;
}

// Search options interface
export interface CloudinarySearchOptions {
  expression: string;
  sort_by?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  aggregate?: string[];
  with_field?: string[];
  max_results?: number;
  next_cursor?: string;
}

// Search response interface
export interface CloudinarySearchResponse {
  total_count: number;
  time: number;
  next_cursor?: string;
  resources: CloudinaryResource[];
  aggregations?: Record<string, Array<{ value: string; count: number }>>;
}

// Resource interface
export interface CloudinaryResource {
  public_id: string;
  format: string;
  version: number;
  resource_type: string;
  type: string;
  created_at: string;
  uploaded_at: string;
  bytes: number;
  width?: number;
  height?: number;
  url: string;
  secure_url: string;
  status?: string;
  access_mode?: string;
  access_control?: Array<{
    access_type: string;
    start?: string;
    end?: string;
  }>;
  filename?: string;
  folder?: string;
  tags?: string[];
  context?: Record<string, string>;
  metadata?: Record<string, unknown>;
  image_analysis?: {
    face_count?: number;
    faces?: Array<[number, number, number, number]>;
    grayscale?: boolean;
    illustration_score?: number;
    transparent?: boolean;
  };
  colors?: Array<[string, number]>;
  predominant?: {
    google?: Array<[string, number]>;
    cloudinary?: Array<[string, number]>;
  };
  phash?: string;
  etag?: string;
  placeholder?: boolean;
  pages?: number;
  duration?: number;
  bit_rate?: number;
  audio?: {
    codec?: string;
    bit_rate?: string;
    frequency?: number;
  };
  video?: {
    pix_format?: string;
    codec?: string;
    level?: number;
    profile?: string;
    bit_rate?: string;
    dar?: string;
    time_base?: string;
  };
  is_audio?: boolean;
  frame_rate?: number;
  rotation?: number;
  original_filename?: string;
}

// Cloudinary URL options
export interface CloudinaryUrlOptions extends Omit<CloudinaryTransformation, 'format'> {
  version?: number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png' | 'gif' | string;
  type?: string;
  resource_type?: string;
  sign_url?: boolean;
  auth_token?: {
    key: string;
    duration?: number;
    start_time?: number;
  };
  cname?: string;
  secure_cname?: string;
  cdn_subdomain?: boolean;
  secure_cdn_subdomain?: boolean;
  shorten?: boolean;
}

// Archive options
export interface CloudinaryArchiveOptions {
  public_ids?: string[];
  prefixes?: string[];
  tags?: string[];
  target_format?: 'zip' | 'tgz';
  flatten_folders?: boolean;
  keep_derived?: boolean;
  skip_transformation_name?: boolean;
  allow_missing?: boolean;
  notification_url?: string;
  target_public_id?: string;
  flatten_transformations?: boolean;
  expires_at?: number;
  type?: string;
  mode?: 'create' | 'download';
}

// Default configuration
export const DEFAULT_CLOUDINARY_CONFIG: Partial<CloudinaryConfig> = {
  secure: true,
  folder: 'vardhman-mills',
  uploadPreset: 'vardhman_default',
  autoOptimization: true,
  enableAnalytics: true,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'svg'],
  quality: 'auto',
  fetchFormat: 'auto',
  deliveryType: 'upload',
  resourceType: 'auto',
  transformation: {
    quality: 'auto',
    format: 'auto',
    fetchFormat: 'auto',
    dpr: 'auto',
    progressive: true,
  },
};

/**
 * Cloudinary Service for media management
 */
export class CloudinaryService {
  private static instance: CloudinaryService;
  private config: CloudinaryConfig;
  private baseUrl: string;
  private apiBaseUrl: string;

  private constructor(config: CloudinaryConfig) {
    this.config = { ...DEFAULT_CLOUDINARY_CONFIG, ...config } as CloudinaryConfig;
    this.baseUrl = `https://res.cloudinary.com/${this.config.cloudName}`;
    this.apiBaseUrl = `https://api.cloudinary.com/v1_1/${this.config.cloudName}`;
  }

  static getInstance(config?: CloudinaryConfig): CloudinaryService {
    if (!CloudinaryService.instance && config) {
      CloudinaryService.instance = new CloudinaryService(config);
    }
    if (!CloudinaryService.instance) {
      throw new Error('CloudinaryService must be initialized with config first');
    }
    return CloudinaryService.instance;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<CloudinaryConfig>): void {
    this.config = { ...this.config, ...config } as CloudinaryConfig;
  }

  /**
   * Upload file to Cloudinary
   */
  async uploadFile(file: File, options: CloudinaryUploadOptions = {}): Promise<CloudinaryUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add upload preset if available
    if (this.config.uploadPreset) {
      formData.append('upload_preset', this.config.uploadPreset);
    }

    // Add API key for signed uploads
    if (this.config.apiKey) {
      formData.append('api_key', this.config.apiKey);
    }

    // Add upload options
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Add default folder
    if (!options.folder && this.config.folder) {
      formData.append('folder', this.config.folder);
    }

    // Add timestamp for signed uploads
    const timestamp = Math.round(Date.now() / 1000);
    formData.append('timestamp', timestamp.toString());

    try {
      const response = await fetch(`${this.apiBaseUrl}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Upload failed: ${error.error?.message || response.statusText}`);
      }

      return await response.json() as CloudinaryUploadResponse;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: File[], 
    options: CloudinaryUploadOptions = {}
  ): Promise<CloudinaryUploadResponse[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, options));
    return Promise.all(uploadPromises);
  }

  /**
   * Upload from URL
   */
  async uploadFromUrl(url: string, options: CloudinaryUploadOptions = {}): Promise<CloudinaryUploadResponse> {
    const formData = new FormData();
    formData.append('file', url);
    
    if (this.config.uploadPreset) {
      formData.append('upload_preset', this.config.uploadPreset);
    }

    if (this.config.apiKey) {
      formData.append('api_key', this.config.apiKey);
    }

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    if (!options.folder && this.config.folder) {
      formData.append('folder', this.config.folder);
    }

    const timestamp = Math.round(Date.now() / 1000);
    formData.append('timestamp', timestamp.toString());

    try {
      const response = await fetch(`${this.apiBaseUrl}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Upload failed: ${error.error?.message || response.statusText}`);
      }

      return await response.json() as CloudinaryUploadResponse;
    } catch (error) {
      console.error('Cloudinary URL upload error:', error);
      throw error;
    }
  }

  /**
   * Generate optimized image URL
   */
  generateUrl(publicId: string, options: CloudinaryUrlOptions = {}): string {
    const transformationOptions: CloudinaryTransformation = {
      ...this.config.transformation,
      width: options.width,
      height: options.height,
      crop: options.crop,
      gravity: options.gravity,
      quality: options.quality,
      format: options.format as CloudinaryTransformation['format'],
      dpr: options.dpr,
      flags: options.flags,
      effects: options.effects,
      overlay: options.overlay,
      underlay: options.underlay,
      border: options.border,
      radius: options.radius,
      angle: options.angle,
      opacity: options.opacity,
      background: options.background,
      color: options.color,
      fetchFormat: options.fetchFormat,
      progressive: options.progressive,
      customFunction: options.customFunction,
      rawTransformation: options.rawTransformation,
    };

    const transformation = this.buildTransformation(transformationOptions);

    const segments = [
      this.baseUrl,
      options.resource_type || 'image',
      options.type || 'upload',
      transformation,
      options.version ? `v${options.version}` : '',
      publicId,
    ].filter(Boolean);

    return segments.join('/');
  }

  /**
   * Generate responsive image URLs
   */
  generateResponsiveUrls(
    publicId: string, 
    breakpoints: number[] = [480, 768, 1024, 1280, 1920],
    options: CloudinaryUrlOptions = {}
  ): Array<{ width: number; url: string }> {
    return breakpoints.map(width => ({
      width,
      url: this.generateUrl(publicId, {
        ...options,
        width,
        crop: options.crop || 'fill',
        quality: options.quality || 'auto',
        format: options.format || 'auto',
      }),
    }));
  }

  /**
   * Generate image with multiple formats
   */
  generateMultiFormatUrls(
    publicId: string, 
    formats: string[] = ['webp', 'avif', 'jpg'],
    options: CloudinaryUrlOptions = {}
  ): Array<{ format: string; url: string }> {
    return formats.map(format => ({
      format,
      url: this.generateUrl(publicId, {
        ...options,
        format: format as CloudinaryUrlOptions['format'],
      }),
    }));
  }

  /**
   * Generate thumbnail URL
   */
  generateThumbnailUrl(
    publicId: string, 
    size: number = 150, 
    options: CloudinaryUrlOptions = {}
  ): string {
    return this.generateUrl(publicId, {
      ...options,
      width: size,
      height: size,
      crop: 'thumb',
      gravity: 'auto',
      quality: 'auto',
      format: 'auto',
    });
  }

  /**
   * Generate video poster URL
   */
  generateVideoPosterUrl(publicId: string, options: CloudinaryUrlOptions = {}): string {
    return this.generateUrl(publicId, {
      ...options,
      resource_type: 'video',
      format: 'jpg',
      flags: ['attachment'],
    });
  }

  /**
   * Search resources
   */
  async searchResources(options: CloudinarySearchOptions): Promise<CloudinarySearchResponse> {
    if (!this.config.apiKey) {
      throw new Error('API key required for search operations');
    }

    const searchParams = new URLSearchParams({
      expression: options.expression,
      max_results: (options.max_results || 50).toString(),
    });

    if (options.sort_by) {
      searchParams.append('sort_by', JSON.stringify(options.sort_by));
    }

    if (options.aggregate) {
      searchParams.append('aggregate', JSON.stringify(options.aggregate));
    }

    if (options.with_field) {
      searchParams.append('with_field', JSON.stringify(options.with_field));
    }

    if (options.next_cursor) {
      searchParams.append('next_cursor', options.next_cursor);
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/resources/search?${searchParams}`, {
        headers: {
          'Authorization': `Basic ${btoa(`${this.config.apiKey}:${this.config.apiSecret || ''}`)}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      return await response.json() as CloudinarySearchResponse;
    } catch (error) {
      console.error('Cloudinary search error:', error);
      throw error;
    }
  }

  /**
   * Delete resource
   */
  async deleteResource(publicId: string, resourceType: string = 'image'): Promise<{ result: string }> {
    if (!this.config.apiKey || !this.config.apiSecret) {
      throw new Error('API key and secret required for delete operations');
    }

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('api_key', this.config.apiKey);

    const timestamp = Math.round(Date.now() / 1000);
    formData.append('timestamp', timestamp.toString());

    try {
      const response = await fetch(`${this.apiBaseUrl}/${resourceType}/destroy`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw error;
    }
  }

  /**
   * Delete multiple resources
   */
  async deleteMultipleResources(
    publicIds: string[], 
    resourceType: string = 'image'
  ): Promise<{ deleted: Record<string, string>; deleted_counts: Record<string, number> }> {
    if (!this.config.apiKey || !this.config.apiSecret) {
      throw new Error('API key and secret required for delete operations');
    }

    const formData = new FormData();
    formData.append('public_ids', JSON.stringify(publicIds));
    formData.append('api_key', this.config.apiKey);

    const timestamp = Math.round(Date.now() / 1000);
    formData.append('timestamp', timestamp.toString());

    try {
      const response = await fetch(`${this.apiBaseUrl}/${resourceType}/delete_resources`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Bulk delete failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Cloudinary bulk delete error:', error);
      throw error;
    }
  }

  /**
   * Update resource metadata
   */
  async updateResource(
    publicId: string, 
    updates: { tags?: string[]; context?: Record<string, string>; metadata?: Record<string, unknown> },
    resourceType: string = 'image'
  ): Promise<CloudinaryResource> {
    if (!this.config.apiKey || !this.config.apiSecret) {
      throw new Error('API key and secret required for update operations');
    }

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('api_key', this.config.apiKey);

    if (updates.tags) {
      formData.append('tags', updates.tags.join(','));
    }

    if (updates.context) {
      formData.append('context', Object.entries(updates.context).map(([k, v]) => `${k}=${v}`).join('|'));
    }

    if (updates.metadata) {
      formData.append('metadata', JSON.stringify(updates.metadata));
    }

    const timestamp = Math.round(Date.now() / 1000);
    formData.append('timestamp', timestamp.toString());

    try {
      const response = await fetch(`${this.apiBaseUrl}/${resourceType}/update`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Update failed: ${response.statusText}`);
      }

      return await response.json() as CloudinaryResource;
    } catch (error) {
      console.error('Cloudinary update error:', error);
      throw error;
    }
  }

  /**
   * Create archive (ZIP)
   */
  async createArchive(options: CloudinaryArchiveOptions): Promise<{ public_id: string; url: string; secure_url: string }> {
    if (!this.config.apiKey || !this.config.apiSecret) {
      throw new Error('API key and secret required for archive operations');
    }

    const formData = new FormData();
    formData.append('api_key', this.config.apiKey);

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          formData.append(key, value.join(','));
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    const timestamp = Math.round(Date.now() / 1000);
    formData.append('timestamp', timestamp.toString());

    try {
      const response = await fetch(`${this.apiBaseUrl}/image/generate_archive`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Archive creation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Cloudinary archive error:', error);
      throw error;
    }
  }

  /**
   * Get upload widget signature
   */
  generateUploadWidgetConfig(options: Partial<CloudinaryUploadOptions> = {}): {
    cloudName: string;
    uploadPreset?: string;
    sources: string[];
    multiple: boolean;
    maxFiles: number;
    maxFileSize: number;
    folder?: string;
    tags?: string[];
    context?: Record<string, string>;
    clientAllowedFormats?: string[];
    cropping?: boolean;
    croppingAspectRatio?: number;
    croppingDefaultSelectionRatio?: number;
    croppingShowDimensions?: boolean;
    theme?: 'default' | 'white' | 'minimal' | 'purple';
    styles?: Record<string, Record<string, string>>;
    text?: Record<string, string>;
  } {
    return {
      cloudName: this.config.cloudName,
      uploadPreset: this.config.uploadPreset,
      sources: ['local', 'url', 'camera'],
      multiple: true,
      maxFiles: 10,
      maxFileSize: this.config.maxFileSize || 10000000,
      folder: options.folder || this.config.folder,
      tags: options.tags,
      context: options.context,
      clientAllowedFormats: this.config.allowedFormats,
      cropping: true,
      croppingAspectRatio: 1,
      croppingDefaultSelectionRatio: 0.8,
      croppingShowDimensions: true,
      theme: 'default',
      styles: {
        palette: {
          window: '#FFFFFF',
          sourceBg: '#F4F4F5',
          windowBorder: '#90A0B3',
          tabIcon: '#0078FF',
          inactiveTabIcon: '#69778A',
          menuIcons: '#0078FF',
          link: '#0078FF',
          action: '#0078FF',
          inProgress: '#0078FF',
          complete: '#20B832',
          error: '#EA2727',
          textDark: '#000000',
          textLight: '#FFFFFF',
        },
      },
      text: {
        'queue.title': 'Upload Files',
        'queue.title_uploading_with_counter': 'Uploading {{num}} Files',
        'queue.title_processing_with_counter': 'Processing {{num}} Files',
        'queue.title_completed': 'Upload Complete',
      },
    };
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(): Promise<{
    plan: string;
    last_updated: string;
    objects: { usage: number; limit: number };
    bandwidth: { usage: number; limit: number };
    storage: { usage: number; limit: number };
    requests: { usage: number; limit: number };
    resources: { usage: number; limit: number };
    derived_resources: { usage: number; limit: number };
  }> {
    if (!this.config.apiKey || !this.config.apiSecret) {
      throw new Error('API key and secret required for usage stats');
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/usage`, {
        headers: {
          'Authorization': `Basic ${btoa(`${this.config.apiKey}:${this.config.apiSecret}`)}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Usage stats failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Cloudinary usage stats error:', error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private buildTransformation(options: CloudinaryTransformation): string {
    const transformations: string[] = [];

    // Basic dimensions
    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.crop) transformations.push(`c_${options.crop}`);
    if (options.gravity) transformations.push(`g_${options.gravity}`);

    // Quality and format
    if (options.quality) transformations.push(`q_${options.quality}`);
    if (options.format) transformations.push(`f_${options.format}`);
    if (options.fetchFormat) transformations.push(`f_${options.fetchFormat}`);
    if (options.dpr) transformations.push(`dpr_${options.dpr}`);

    // Effects and adjustments
    if (options.radius) transformations.push(`r_${options.radius}`);
    if (options.angle) transformations.push(`a_${options.angle}`);
    if (options.opacity) transformations.push(`o_${options.opacity}`);
    if (options.background) transformations.push(`b_${options.background}`);
    if (options.color) transformations.push(`co_${options.color}`);
    if (options.border) transformations.push(`bo_${options.border}`);

    // Overlays and underlays
    if (options.overlay) transformations.push(`l_${options.overlay}`);
    if (options.underlay) transformations.push(`u_${options.underlay}`);

    // Flags
    if (options.flags && options.flags.length > 0) {
      transformations.push(`fl_${options.flags.join('.')}`);
    }
    if (options.progressive) transformations.push('fl_progressive');

    // Effects
    if (options.effects && options.effects.length > 0) {
      options.effects.forEach(effect => {
        transformations.push(`e_${effect}`);
      });
    }

    // Custom function
    if (options.customFunction) transformations.push(`fn_${options.customFunction}`);

    // Raw transformation
    if (options.rawTransformation) transformations.push(options.rawTransformation);

    return transformations.length > 0 ? transformations.join(',') : '';
  }
}

// Utility functions
export const CloudinaryUtils = {
  /**
   * Extract public ID from Cloudinary URL
   */
  extractPublicId: (url: string): string | null => {
    const regex = /\/(?:v\d+\/)?([^/.]+)(?:\.[^.]+)?$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  },

  /**
   * Get file extension from format
   */
  getFileExtension: (format: string): string => {
    const extensions: Record<string, string> = {
      jpeg: 'jpg',
      jpg: 'jpg',
      png: 'png',
      gif: 'gif',
      webp: 'webp',
      avif: 'avif',
      svg: 'svg',
      bmp: 'bmp',
      tiff: 'tiff',
      ico: 'ico',
    };
    return extensions[format.toLowerCase()] || format;
  },

  /**
   * Calculate responsive breakpoints
   */
  calculateBreakpoints: (minWidth: number, maxWidth: number, steps: number): number[] => {
    const breakpoints: number[] = [];
    const step = (maxWidth - minWidth) / (steps - 1);
    
    for (let i = 0; i < steps; i++) {
      breakpoints.push(Math.round(minWidth + (step * i)));
    }
    
    return breakpoints;
  },

  /**
   * Generate srcset string
   */
  generateSrcSet: (urls: Array<{ width: number; url: string }>): string => {
    return urls.map(({ url, width }) => `${url} ${width}w`).join(', ');
  },

  /**
   * Generate sizes attribute
   */
  generateSizes: (breakpoints: Array<{ breakpoint: number; width: string }>): string => {
    const sizes = breakpoints.map(({ breakpoint, width }) => 
      `(max-width: ${breakpoint}px) ${width}`
    );
    sizes.push('100vw'); // Default size
    return sizes.join(', ');
  },

  /**
   * Validate file type
   */
  isValidFileType: (file: File, allowedTypes: string[]): boolean => {
    const fileType = file.type.split('/')[1];
    return allowedTypes.some(type => 
      type === fileType || type === '*' || file.type.startsWith(type + '/')
    );
  },

  /**
   * Format file size
   */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Generate transformation string from object
   */
  transformationToString: (transformation: CloudinaryTransformation): string => {
    // Build transformation string manually since buildTransformation is private
    const transformations: string[] = [];

    if (transformation.width) transformations.push(`w_${transformation.width}`);
    if (transformation.height) transformations.push(`h_${transformation.height}`);
    if (transformation.crop) transformations.push(`c_${transformation.crop}`);
    if (transformation.gravity) transformations.push(`g_${transformation.gravity}`);
    if (transformation.quality) transformations.push(`q_${transformation.quality}`);
    if (transformation.format) transformations.push(`f_${transformation.format}`);
    if (transformation.fetchFormat) transformations.push(`f_${transformation.fetchFormat}`);
    if (transformation.dpr) transformations.push(`dpr_${transformation.dpr}`);
    if (transformation.radius) transformations.push(`r_${transformation.radius}`);
    if (transformation.angle) transformations.push(`a_${transformation.angle}`);
    if (transformation.opacity) transformations.push(`o_${transformation.opacity}`);
    if (transformation.background) transformations.push(`b_${transformation.background}`);
    if (transformation.color) transformations.push(`co_${transformation.color}`);
    if (transformation.border) transformations.push(`bo_${transformation.border}`);
    if (transformation.overlay) transformations.push(`l_${transformation.overlay}`);
    if (transformation.underlay) transformations.push(`u_${transformation.underlay}`);
    if (transformation.flags && transformation.flags.length > 0) {
      transformations.push(`fl_${transformation.flags.join('.')}`);
    }
    if (transformation.progressive) transformations.push('fl_progressive');
    if (transformation.effects && transformation.effects.length > 0) {
      transformation.effects.forEach(effect => {
        transformations.push(`e_${effect}`);
      });
    }
    if (transformation.customFunction) transformations.push(`fn_${transformation.customFunction}`);
    if (transformation.rawTransformation) transformations.push(transformation.rawTransformation);

    return transformations.length > 0 ? transformations.join(',') : '';
  },

  /**
   * Parse transformation string to object
   */
  parseTransformation: (transformationString: string): Partial<CloudinaryTransformation> => {
    const transformation: Partial<CloudinaryTransformation> = {};
    const parts = transformationString.split(',');

    parts.forEach(part => {
      const [key, value] = part.split('_');
      switch (key) {
        case 'w': transformation.width = parseInt(value); break;
        case 'h': transformation.height = parseInt(value); break;
        case 'c': transformation.crop = value as CloudinaryTransformation['crop']; break;
        case 'g': transformation.gravity = value as CloudinaryTransformation['gravity']; break;
        case 'q': transformation.quality = value === 'auto' ? 'auto' : parseInt(value); break;
        case 'f': transformation.format = value as CloudinaryTransformation['format']; break;
        case 'r': transformation.radius = isNaN(parseInt(value)) ? value : parseInt(value); break;
        case 'a': transformation.angle = parseInt(value); break;
        case 'o': transformation.opacity = parseInt(value); break;
        default: break;
      }
    });

    return transformation;
  },
};

// Export default instance getter
export const getCloudinaryService = (config?: CloudinaryConfig): CloudinaryService => {
  return CloudinaryService.getInstance(config);
};

export default CloudinaryService;