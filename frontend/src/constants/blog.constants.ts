/**
 * Blog Constants - Vardhman Mills Frontend
 * Constants for blog and content management
 */

// Blog Post Status
export const BLOG_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  SCHEDULED: 'scheduled',
  ARCHIVED: 'archived',
  PRIVATE: 'private',
} as const;

// Blog Categories
export const BLOG_CATEGORIES = {
  TEXTILE_INDUSTRY: 'textile-industry',
  FABRIC_CARE: 'fabric-care',
  SUSTAINABILITY: 'sustainability',
  FASHION_TRENDS: 'fashion-trends',
  MANUFACTURING: 'manufacturing',
  TECHNOLOGY: 'technology',
  COMPANY_NEWS: 'company-news',
  TUTORIALS: 'tutorials',
} as const;

// Content Types
export const CONTENT_TYPES = {
  ARTICLE: 'article',
  VIDEO: 'video',
  INFOGRAPHIC: 'infographic',
  CASE_STUDY: 'case_study',
  NEWS: 'news',
  ANNOUNCEMENT: 'announcement',
  TUTORIAL: 'tutorial',
  INTERVIEW: 'interview',
} as const;

// Blog Settings
export const BLOG_SETTINGS = {
  POSTS_PER_PAGE: 10,
  RELATED_POSTS_COUNT: 3,
  POPULAR_POSTS_COUNT: 5,
  RECENT_POSTS_COUNT: 5,
  FEATURED_POSTS_COUNT: 3,
  COMMENTS_PER_PAGE: 20,
} as const;

// Comment Status
export const COMMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SPAM: 'spam',
} as const;

// Content Formats
export const CONTENT_FORMATS = {
  STANDARD: 'standard',
  GALLERY: 'gallery',
  VIDEO: 'video',
  AUDIO: 'audio',
  QUOTE: 'quote',
  LINK: 'link',
} as const;

// SEO Settings
export const BLOG_SEO = {
  META_DESCRIPTION_LENGTH: 160,
  TITLE_LENGTH: 60,
  EXCERPT_LENGTH: 150,
  READING_TIME_WPM: 200, // Words per minute
} as const;

export type BlogStatus = typeof BLOG_STATUS;
export type BlogCategories = typeof BLOG_CATEGORIES;
export type ContentTypes = typeof CONTENT_TYPES;
export type CommentStatus = typeof COMMENT_STATUS;
export type ContentFormats = typeof CONTENT_FORMATS;