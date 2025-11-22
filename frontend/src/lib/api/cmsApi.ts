import { HttpClient } from './client';
import { endpoints } from './endpoints';
import { 
  ApiResponse, 
  PaginationParams,
  SearchParams 
} from './types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { buildPaginationParams, buildSearchParams } from './utils';

/**
 * CMS API Service
 * Handles content management, pages, blocks, and site content
 */

interface CMSPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  type: 'page' | 'landing' | 'article' | 'template';
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'private' | 'password_protected';
  
  // Content structure
  blocks: CMSBlock[];
  
  // SEO settings
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    canonicalUrl?: string;
    robots: {
      index: boolean;
      follow: boolean;
      archive: boolean;
      snippet: boolean;
      maxSnippet?: number;
      maxImagePreview?: 'none' | 'standard' | 'large';
      maxVideoPreview?: number;
    };
    socialMeta: {
      ogTitle?: string;
      ogDescription?: string;
      ogImage?: string;
      ogType?: string;
      twitterTitle?: string;
      twitterDescription?: string;
      twitterImage?: string;
      twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
    };
    structuredData?: Record<string, unknown>;
  };
  
  // Layout & Design
  layout: {
    template: string;
    theme?: string;
    customCSS?: string;
    customJS?: string;
    sidebar: boolean;
    header: boolean;
    footer: boolean;
    breadcrumbs: boolean;
  };
  
  // Access control
  accessControl: {
    roles?: string[];
    users?: string[];
    password?: string;
    requireLogin: boolean;
  };
  
  // Publishing
  publishedAt?: string;
  scheduledAt?: string;
  expiresAt?: string;
  
  // Versioning
  version: number;
  parentVersion?: string;
  
  // Analytics
  analytics: {
    views: number;
    uniqueViews: number;
    avgTimeOnPage: number;
    bounceRate: number;
    lastViewed?: string;
  };
  
  // Metadata
  author: {
    id: string;
    name: string;
    email: string;
  };
  editor?: {
    id: string;
    name: string;
    lastEditedAt: string;
  };
  
  featuredImage?: string;
  excerpt?: string;
  tags: string[];
  categories: string[];
  language: string;
  translationKey?: string;
  
  createdAt: string;
  updatedAt: string;
}

interface CMSBlock {
  id: string;
  type: 'text' | 'image' | 'video' | 'hero' | 'gallery' | 'form' | 'testimonial' | 'faq' | 'cta' | 'product_grid' | 'banner' | 'custom';
  title?: string;
  position: number;
  visible: boolean;
  
  // Content based on type
  content: {
    // Text block
    text?: {
      html: string;
      markdown?: string;
      fontSize?: string;
      textAlign?: 'left' | 'center' | 'right' | 'justify';
      textColor?: string;
      backgroundColor?: string;
    };
    
    // Image block
    image?: {
      src: string;
      alt: string;
      caption?: string;
      width?: number;
      height?: number;
      aspectRatio?: string;
      objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
      lazy: boolean;
    };
    
    // Video block
    video?: {
      src: string;
      poster?: string;
      autoplay: boolean;
      loop: boolean;
      muted: boolean;
      controls: boolean;
      width?: number;
      height?: number;
    };
    
    // Hero block
    hero?: {
      title: string;
      subtitle?: string;
      description?: string;
      backgroundImage?: string;
      backgroundColor?: string;
      overlay?: {
        color: string;
        opacity: number;
      };
      cta?: {
        text: string;
        url: string;
        style: 'primary' | 'secondary' | 'outline';
      }[];
      alignment: 'left' | 'center' | 'right';
      height: 'auto' | 'small' | 'medium' | 'large' | 'fullscreen';
    };
    
    // Gallery block
    gallery?: {
      images: Array<{
        src: string;
        alt: string;
        caption?: string;
      }>;
      layout: 'grid' | 'masonry' | 'carousel' | 'slideshow';
      columns?: number;
      aspectRatio?: string;
      spacing?: number;
      showCaptions: boolean;
      lightbox: boolean;
    };
    
    // Form block
    form?: {
      title?: string;
      description?: string;
      fields: Array<{
        id: string;
        type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'file';
        label: string;
        placeholder?: string;
        required: boolean;
        options?: string[];
        validation?: {
          minLength?: number;
          maxLength?: number;
          pattern?: string;
          message?: string;
        };
      }>;
      submitText: string;
      successMessage: string;
      redirectUrl?: string;
      emailNotification?: {
        to: string[];
        template: string;
      };
    };
    
    // Product grid block
    productGrid?: {
      title?: string;
      source: 'featured' | 'category' | 'collection' | 'manual' | 'filter';
      categoryId?: string;
      collectionId?: string;
      productIds?: string[];
      filters?: Record<string, unknown>;
      limit: number;
      columns: number;
      showFilters: boolean;
      sortBy?: string;
      layout: 'grid' | 'list';
    };
    
    // Custom block
    custom?: {
      html: string;
      css?: string;
      js?: string;
    };
  };
  
  // Styling
  styling: {
    margin?: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    padding?: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    backgroundColor?: string;
    borderRadius?: number;
    boxShadow?: string;
    customCSS?: string;
  };
  
  // Responsive settings
  responsive: {
    desktop: {
      visible: boolean;
      order?: number;
    };
    tablet: {
      visible: boolean;
      order?: number;
    };
    mobile: {
      visible: boolean;
      order?: number;
    };
  };
  
  // Animation
  animation?: {
    type: 'fade' | 'slide' | 'zoom' | 'bounce' | 'none';
    duration: number;
    delay: number;
    trigger: 'viewport' | 'scroll' | 'hover' | 'click';
  };
  
  createdAt: string;
  updatedAt: string;
}

interface CMSTemplate {
  id: string;
  name: string;
  description: string;
  type: 'page' | 'email' | 'popup' | 'landing';
  category: string;
  preview?: string;
  
  // Template structure
  blocks: CMSBlock[];
  layout: CMSPage['layout'];
  
  // Configuration
  variables: Array<{
    key: string;
    label: string;
    type: 'string' | 'number' | 'boolean' | 'color' | 'image' | 'url';
    defaultValue?: string | number | boolean;
    required: boolean;
    description?: string;
  }>;
  
  // Usage tracking
  usage: {
    timesUsed: number;
    lastUsed?: string;
  };
  
  // Permissions
  public: boolean;
  author: {
    id: string;
    name: string;
  };
  
  tags: string[];
  
  createdAt: string;
  updatedAt: string;
}

interface CMSMenu {
  id: string;
  name: string;
  location: 'header' | 'footer' | 'sidebar' | 'mobile' | 'custom';
  status: 'active' | 'inactive';
  
  items: CMSMenuItem[];
  
  // Styling
  styling: {
    theme?: string;
    layout: 'horizontal' | 'vertical';
    alignment: 'left' | 'center' | 'right';
    showIcons: boolean;
    showArrows: boolean;
    maxDepth: number;
    customCSS?: string;
  };
  
  // Responsive
  responsive: {
    mobile: {
      collapsible: boolean;
      hamburger: boolean;
    };
  };
  
  createdAt: string;
  updatedAt: string;
}

interface CMSMenuItem {
  id: string;
  title: string;
  url?: string;
  pageId?: string;
  type: 'page' | 'category' | 'external' | 'custom';
  target: '_self' | '_blank';
  icon?: string;
  description?: string;
  
  // Hierarchy
  parentId?: string;
  position: number;
  depth: number;
  
  // Visibility
  visible: boolean;
  roles?: string[];
  
  // Styling
  cssClass?: string;
  
  children?: CMSMenuItem[];
  
  createdAt: string;
  updatedAt: string;
}

interface CMSWidget {
  id: string;
  name: string;
  type: 'html' | 'text' | 'image' | 'social_media' | 'newsletter' | 'recent_posts' | 'popular_products' | 'custom';
  area: 'sidebar' | 'footer' | 'header' | 'content';
  position: number;
  status: 'active' | 'inactive';
  
  // Configuration based on type
  config: {
    // HTML widget
    html?: {
      content: string;
    };
    
    // Text widget
    text?: {
      title?: string;
      content: string;
      showTitle: boolean;
    };
    
    // Image widget
    image?: {
      src: string;
      alt: string;
      link?: string;
      caption?: string;
    };
    
    // Social media widget
    socialMedia?: {
      platforms: Array<{
        name: string;
        url: string;
        icon: string;
      }>;
      style: 'icons' | 'buttons' | 'links';
    };
    
    // Newsletter widget
    newsletter?: {
      title: string;
      description?: string;
      placeholder: string;
      buttonText: string;
      successMessage: string;
    };
    
    // Recent posts widget
    recentPosts?: {
      title: string;
      count: number;
      showDate: boolean;
      showExcerpt: boolean;
      showImage: boolean;
    };
    
    // Popular products widget
    popularProducts?: {
      title: string;
      count: number;
      showPrice: boolean;
      showImage: boolean;
      showRating: boolean;
    };
    
    // Custom widget
    custom?: {
      html: string;
      css?: string;
      js?: string;
    };
  };
  
  // Display settings
  displayRules: {
    pages?: string[];
    excludePages?: string[];
    userRoles?: string[];
    deviceTypes?: ('desktop' | 'tablet' | 'mobile')[];
    startDate?: string;
    endDate?: string;
  };
  
  // Styling
  styling: {
    title?: {
      show: boolean;
      tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      cssClass?: string;
    };
    container?: {
      cssClass?: string;
      customCSS?: string;
    };
  };
  
  createdAt: string;
  updatedAt: string;
}

interface CMSSettings {
  general: {
    siteName: string;
    siteDescription: string;
    siteUrl: string;
    adminEmail: string;
    timezone: string;
    language: string;
    dateFormat: string;
    timeFormat: string;
  };
  
  seo: {
    globalMetaTitle?: string;
    globalMetaDescription?: string;
    globalMetaKeywords?: string[];
    enableSitemap: boolean;
    enableRobotsTxt: boolean;
    googleAnalyticsId?: string;
    googleTagManagerId?: string;
    facebookPixelId?: string;
  };
  
  media: {
    maxFileSize: number;
    allowedFileTypes: string[];
    imageSizes: Array<{
      name: string;
      width: number;
      height: number;
      crop: boolean;
    }>;
    cdnEnabled: boolean;
    cdnUrl?: string;
  };
  
  security: {
    enableCaptcha: boolean;
    captchaProvider: 'recaptcha' | 'hcaptcha' | 'turnstile';
    captchaSiteKey?: string;
    enableCsrf: boolean;
    allowedDomains: string[];
  };
  
  cache: {
    enabled: boolean;
    ttl: number;
    excludePaths: string[];
  };
  
  email: {
    fromName: string;
    fromEmail: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUsername?: string;
    smtpPassword?: string;
    smtpSecure: boolean;
  };
  
  theme: {
    activeTheme: string;
    customCss?: string;
    customJs?: string;
    enableDarkMode: boolean;
  };
  
  maintenance: {
    enabled: boolean;
    message?: string;
    allowedIps?: string[];
  };
}

class CMSApiService {
  private client: HttpClient;

  constructor() {
    this.client = new HttpClient();
  }

  // Pages

  // Get pages
  async getPages(params?: SearchParams & PaginationParams & {
    type?: 'page' | 'landing' | 'article' | 'template';
    status?: 'draft' | 'published' | 'archived';
    author?: string;
    category?: string;
    tag?: string;
    sortBy?: 'title' | 'created' | 'updated' | 'published' | 'views';
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<CMSPage[]>> {
    const queryParams = {
      ...buildSearchParams(params || {}),
      ...buildPaginationParams(params || {}),
      ...(params?.type && { type: params.type }),
      ...(params?.status && { status: params.status }),
      ...(params?.author && { author: params.author }),
      ...(params?.category && { category: params.category }),
      ...(params?.tag && { tag: params.tag }),
      ...(params?.sortBy && { sortBy: params.sortBy }),
      ...(params?.sortOrder && { sortOrder: params.sortOrder }),
    };
    
    return this.client.get<CMSPage[]>(endpoints.cms.pages.list, { params: queryParams });
  }

  // Get page by ID
  async getPageById(pageId: string): Promise<ApiResponse<CMSPage>> {
    return this.client.get<CMSPage>(endpoints.cms.pages.byId(pageId));
  }

  // Get page by slug
  async getPageBySlug(slug: string): Promise<ApiResponse<CMSPage>> {
    return this.client.get<CMSPage>(endpoints.cms.pages.bySlug(slug));
  }

  // Create page
  async createPage(pageData: {
    title: string;
    slug?: string;
    content?: string;
    type?: 'page' | 'landing' | 'article' | 'template';
    status?: 'draft' | 'published';
    visibility?: 'public' | 'private' | 'password_protected';
    blocks?: CMSBlock[];
    seo?: Partial<CMSPage['seo']>;
    layout?: Partial<CMSPage['layout']>;
    accessControl?: Partial<CMSPage['accessControl']>;
    featuredImage?: string;
    excerpt?: string;
    tags?: string[];
    categories?: string[];
    language?: string;
    scheduledAt?: string;
    expiresAt?: string;
  }): Promise<ApiResponse<CMSPage>> {
    return this.client.post<CMSPage>(endpoints.cms.pages.create, pageData);
  }

  // Update page
  async updatePage(pageId: string, updates: {
    title?: string;
    slug?: string;
    content?: string;
    status?: 'draft' | 'published' | 'archived';
    visibility?: 'public' | 'private' | 'password_protected';
    blocks?: CMSBlock[];
    seo?: Partial<CMSPage['seo']>;
    layout?: Partial<CMSPage['layout']>;
    accessControl?: Partial<CMSPage['accessControl']>;
    featuredImage?: string;
    excerpt?: string;
    tags?: string[];
    categories?: string[];
    scheduledAt?: string;
    expiresAt?: string;
  }): Promise<ApiResponse<CMSPage>> {
    return this.client.put<CMSPage>(endpoints.cms.pages.update(pageId), updates);
  }

  // Delete page
  async deletePage(pageId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(endpoints.cms.pages.delete(pageId));
  }

  // Publish page
  async publishPage(pageId: string): Promise<ApiResponse<CMSPage>> {
    return this.client.post<CMSPage>(endpoints.cms.pages.publish(pageId), {});
  }

  // Unpublish page
  async unpublishPage(pageId: string): Promise<ApiResponse<CMSPage>> {
    return this.client.post<CMSPage>(endpoints.cms.pages.unpublish(pageId), {});
  }

  // Duplicate page
  async duplicatePage(pageId: string, title?: string): Promise<ApiResponse<CMSPage>> {
    return this.client.post<CMSPage>(endpoints.cms.pages.duplicate(pageId), { title });
  }

  // Get page versions
  async getPageVersions(pageId: string): Promise<ApiResponse<Array<{
    version: number;
    createdAt: string;
    author: {
      id: string;
      name: string;
    };
    changes: string[];
  }>>> {
    return this.client.get<Array<{
      version: number;
      createdAt: string;
      author: {
        id: string;
        name: string;
      };
      changes: string[];
    }>>(endpoints.cms.pages.versions(pageId));
  }

  // Restore page version
  async restorePageVersion(pageId: string, version: number): Promise<ApiResponse<CMSPage>> {
    return this.client.post<CMSPage>(endpoints.cms.pages.restore(pageId), { version });
  }

  // Preview page
  async previewPage(pageId: string): Promise<ApiResponse<{
    url: string;
    token: string;
    expiresAt: string;
  }>> {
    return this.client.post<{
      url: string;
      token: string;
      expiresAt: string;
    }>(endpoints.cms.pages.preview(pageId), {});
  }

  // Blocks

  // Get blocks
  async getBlocks(pageId: string): Promise<ApiResponse<CMSBlock[]>> {
    return this.client.get<CMSBlock[]>(endpoints.cms.blocks.list(pageId));
  }

  // Create block
  async createBlock(pageId: string, blockData: {
    type: CMSBlock['type'];
    title?: string;
    position?: number;
    content: CMSBlock['content'];
    styling?: CMSBlock['styling'];
    responsive?: CMSBlock['responsive'];
    animation?: CMSBlock['animation'];
  }): Promise<ApiResponse<CMSBlock>> {
    return this.client.post<CMSBlock>(endpoints.cms.blocks.create(pageId), blockData);
  }

  // Update block
  async updateBlock(blockId: string, updates: {
    title?: string;
    position?: number;
    visible?: boolean;
    content?: Partial<CMSBlock['content']>;
    styling?: Partial<CMSBlock['styling']>;
    responsive?: Partial<CMSBlock['responsive']>;
    animation?: CMSBlock['animation'];
  }): Promise<ApiResponse<CMSBlock>> {
    return this.client.put<CMSBlock>(endpoints.cms.blocks.update(blockId), updates);
  }

  // Delete block
  async deleteBlock(blockId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(endpoints.cms.blocks.delete(blockId));
  }

  // Reorder blocks
  async reorderBlocks(pageId: string, blockOrder: Array<{
    blockId: string;
    position: number;
  }>): Promise<ApiResponse<CMSBlock[]>> {
    return this.client.put<CMSBlock[]>(endpoints.cms.blocks.reorder(pageId), { blocks: blockOrder });
  }

  // Duplicate block
  async duplicateBlock(blockId: string): Promise<ApiResponse<CMSBlock>> {
    return this.client.post<CMSBlock>(endpoints.cms.blocks.duplicate(blockId), {});
  }

  // Templates

  // Get templates
  async getTemplates(params?: SearchParams & PaginationParams & {
    type?: 'page' | 'email' | 'popup' | 'landing';
    category?: string;
    author?: string;
    public?: boolean;
    sortBy?: 'name' | 'created' | 'used' | 'popular';
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<CMSTemplate[]>> {
    const queryParams = {
      ...buildSearchParams(params || {}),
      ...buildPaginationParams(params || {}),
      ...(params?.type && { type: params.type }),
      ...(params?.category && { category: params.category }),
      ...(params?.author && { author: params.author }),
      ...(params?.public !== undefined && { public: params.public }),
      ...(params?.sortBy && { sortBy: params.sortBy }),
      ...(params?.sortOrder && { sortOrder: params.sortOrder }),
    };
    
    return this.client.get<CMSTemplate[]>(endpoints.cms.templates.list, { params: queryParams });
  }

  // Get template by ID
  async getTemplateById(templateId: string): Promise<ApiResponse<CMSTemplate>> {
    return this.client.get<CMSTemplate>(endpoints.cms.templates.byId(templateId));
  }

  // Create template
  async createTemplate(templateData: {
    name: string;
    description: string;
    type: 'page' | 'email' | 'popup' | 'landing';
    category: string;
    blocks: CMSBlock[];
    layout: CMSPage['layout'];
    variables?: CMSTemplate['variables'];
    public?: boolean;
    tags?: string[];
  }): Promise<ApiResponse<CMSTemplate>> {
    return this.client.post<CMSTemplate>(endpoints.cms.templates.create, templateData);
  }

  // Update template
  async updateTemplate(templateId: string, updates: {
    name?: string;
    description?: string;
    category?: string;
    blocks?: CMSBlock[];
    layout?: CMSPage['layout'];
    variables?: CMSTemplate['variables'];
    public?: boolean;
    tags?: string[];
  }): Promise<ApiResponse<CMSTemplate>> {
    return this.client.put<CMSTemplate>(endpoints.cms.templates.update(templateId), updates);
  }

  // Delete template
  async deleteTemplate(templateId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(endpoints.cms.templates.delete(templateId));
  }

  // Create page from template
  async createPageFromTemplate(templateId: string, pageData: {
    title: string;
    slug?: string;
    variables?: Record<string, string | number | boolean>;
  }): Promise<ApiResponse<CMSPage>> {
    return this.client.post<CMSPage>(endpoints.cms.templates.createPage(templateId), pageData);
  }

  // Menus

  // Get menus
  async getMenus(params?: SearchParams & PaginationParams & {
    location?: 'header' | 'footer' | 'sidebar' | 'mobile' | 'custom';
    status?: 'active' | 'inactive';
    sortBy?: 'name' | 'location' | 'created';
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<CMSMenu[]>> {
    const queryParams = {
      ...buildSearchParams(params || {}),
      ...buildPaginationParams(params || {}),
      ...(params?.location && { location: params.location }),
      ...(params?.status && { status: params.status }),
      ...(params?.sortBy && { sortBy: params.sortBy }),
      ...(params?.sortOrder && { sortOrder: params.sortOrder }),
    };
    
    return this.client.get<CMSMenu[]>(endpoints.cms.menus.list, { params: queryParams });
  }

  // Get menu by ID
  async getMenuById(menuId: string): Promise<ApiResponse<CMSMenu>> {
    return this.client.get<CMSMenu>(endpoints.cms.menus.byId(menuId));
  }

  // Get menu by location
  async getMenuByLocation(location: string): Promise<ApiResponse<CMSMenu>> {
    return this.client.get<CMSMenu>(endpoints.cms.menus.byLocation(location));
  }

  // Create menu
  async createMenu(menuData: {
    name: string;
    location: 'header' | 'footer' | 'sidebar' | 'mobile' | 'custom';
    styling?: Partial<CMSMenu['styling']>;
    responsive?: Partial<CMSMenu['responsive']>;
  }): Promise<ApiResponse<CMSMenu>> {
    return this.client.post<CMSMenu>(endpoints.cms.menus.create, menuData);
  }

  // Update menu
  async updateMenu(menuId: string, updates: {
    name?: string;
    location?: 'header' | 'footer' | 'sidebar' | 'mobile' | 'custom';
    status?: 'active' | 'inactive';
    styling?: Partial<CMSMenu['styling']>;
    responsive?: Partial<CMSMenu['responsive']>;
  }): Promise<ApiResponse<CMSMenu>> {
    return this.client.put<CMSMenu>(endpoints.cms.menus.update(menuId), updates);
  }

  // Delete menu
  async deleteMenu(menuId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(endpoints.cms.menus.delete(menuId));
  }

  // Menu Items

  // Create menu item
  async createMenuItem(menuId: string, itemData: {
    title: string;
    url?: string;
    pageId?: string;
    type: 'page' | 'category' | 'external' | 'custom';
    target?: '_self' | '_blank';
    icon?: string;
    description?: string;
    parentId?: string;
    position?: number;
    visible?: boolean;
    roles?: string[];
    cssClass?: string;
  }): Promise<ApiResponse<CMSMenuItem>> {
    return this.client.post<CMSMenuItem>(endpoints.cms.menus.items.create(menuId), itemData);
  }

  // Update menu item
  async updateMenuItem(itemId: string, updates: {
    title?: string;
    url?: string;
    pageId?: string;
    target?: '_self' | '_blank';
    icon?: string;
    description?: string;
    position?: number;
    visible?: boolean;
    roles?: string[];
    cssClass?: string;
  }): Promise<ApiResponse<CMSMenuItem>> {
    return this.client.put<CMSMenuItem>(endpoints.cms.menus.items.update(itemId), updates);
  }

  // Delete menu item
  async deleteMenuItem(itemId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(endpoints.cms.menus.items.delete(itemId));
  }

  // Reorder menu items
  async reorderMenuItems(menuId: string, itemOrder: Array<{
    itemId: string;
    parentId?: string;
    position: number;
  }>): Promise<ApiResponse<CMSMenuItem[]>> {
    return this.client.put<CMSMenuItem[]>(endpoints.cms.menus.items.reorder(menuId), { items: itemOrder });
  }

  // Widgets

  // Get widgets
  async getWidgets(params?: SearchParams & PaginationParams & {
    area?: 'sidebar' | 'footer' | 'header' | 'content';
    type?: string;
    status?: 'active' | 'inactive';
    sortBy?: 'name' | 'area' | 'position' | 'created';
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<CMSWidget[]>> {
    const queryParams = {
      ...buildSearchParams(params || {}),
      ...buildPaginationParams(params || {}),
      ...(params?.area && { area: params.area }),
      ...(params?.type && { type: params.type }),
      ...(params?.status && { status: params.status }),
      ...(params?.sortBy && { sortBy: params.sortBy }),
      ...(params?.sortOrder && { sortOrder: params.sortOrder }),
    };
    
    return this.client.get<CMSWidget[]>(endpoints.cms.widgets.list, { params: queryParams });
  }

  // Get widget by ID
  async getWidgetById(widgetId: string): Promise<ApiResponse<CMSWidget>> {
    return this.client.get<CMSWidget>(endpoints.cms.widgets.byId(widgetId));
  }

  // Create widget
  async createWidget(widgetData: {
    name: string;
    type: CMSWidget['type'];
    area: 'sidebar' | 'footer' | 'header' | 'content';
    position?: number;
    config: CMSWidget['config'];
    displayRules?: Partial<CMSWidget['displayRules']>;
    styling?: Partial<CMSWidget['styling']>;
  }): Promise<ApiResponse<CMSWidget>> {
    return this.client.post<CMSWidget>(endpoints.cms.widgets.create, widgetData);
  }

  // Update widget
  async updateWidget(widgetId: string, updates: {
    name?: string;
    area?: 'sidebar' | 'footer' | 'header' | 'content';
    position?: number;
    status?: 'active' | 'inactive';
    config?: Partial<CMSWidget['config']>;
    displayRules?: Partial<CMSWidget['displayRules']>;
    styling?: Partial<CMSWidget['styling']>;
  }): Promise<ApiResponse<CMSWidget>> {
    return this.client.put<CMSWidget>(endpoints.cms.widgets.update(widgetId), updates);
  }

  // Delete widget
  async deleteWidget(widgetId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(endpoints.cms.widgets.delete(widgetId));
  }

  // Reorder widgets
  async reorderWidgets(area: string, widgetOrder: Array<{
    widgetId: string;
    position: number;
  }>): Promise<ApiResponse<CMSWidget[]>> {
    return this.client.put<CMSWidget[]>(endpoints.cms.widgets.reorder(area), { widgets: widgetOrder });
  }

  // Settings

  // Get settings
  async getSettings(): Promise<ApiResponse<CMSSettings>> {
    return this.client.get<CMSSettings>(endpoints.cms.settings.get);
  }

  // Update settings
  async updateSettings(updates: {
    general?: Partial<CMSSettings['general']>;
    seo?: Partial<CMSSettings['seo']>;
    media?: Partial<CMSSettings['media']>;
    security?: Partial<CMSSettings['security']>;
    cache?: Partial<CMSSettings['cache']>;
    email?: Partial<CMSSettings['email']>;
    theme?: Partial<CMSSettings['theme']>;
    maintenance?: Partial<CMSSettings['maintenance']>;
  }): Promise<ApiResponse<CMSSettings>> {
    return this.client.put<CMSSettings>(endpoints.cms.settings.update, updates);
  }

  // Media Management

  // Upload media
  async uploadMedia(file: File, folder?: string): Promise<ApiResponse<{
    id: string;
    url: string;
    filename: string;
    mimeType: string;
    size: number;
    folder?: string;
  }>> {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }
    
    return this.client.post<{
      id: string;
      url: string;
      filename: string;
      mimeType: string;
      size: number;
      folder?: string;
    }>(endpoints.cms.media.upload, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Get media files
  async getMediaFiles(params?: SearchParams & PaginationParams & {
    folder?: string;
    type?: 'image' | 'video' | 'document' | 'audio';
    sortBy?: 'name' | 'size' | 'created' | 'type';
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<Array<{
    id: string;
    url: string;
    filename: string;
    mimeType: string;
    size: number;
    folder?: string;
    createdAt: string;
  }>>> {
    const queryParams = {
      ...buildSearchParams(params || {}),
      ...buildPaginationParams(params || {}),
      ...(params?.folder && { folder: params.folder }),
      ...(params?.type && { type: params.type }),
      ...(params?.sortBy && { sortBy: params.sortBy }),
      ...(params?.sortOrder && { sortOrder: params.sortOrder }),
    };
    
    return this.client.get<Array<{
      id: string;
      url: string;
      filename: string;
      mimeType: string;
      size: number;
      folder?: string;
      createdAt: string;
    }>>(endpoints.cms.media.list, { params: queryParams });
  }

  // Delete media
  async deleteMedia(mediaId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(endpoints.cms.media.delete(mediaId));
  }

  // Analytics & Reports

  // Get content analytics
  async getContentAnalytics(params?: {
    dateRange?: {
      start: string;
      end: string;
    };
    pageIds?: string[];
    granularity?: 'day' | 'week' | 'month';
  }): Promise<ApiResponse<{
    overview: {
      totalPages: number;
      publishedPages: number;
      draftPages: number;
      totalViews: number;
      uniqueViews: number;
      avgTimeOnPage: number;
      bounceRate: number;
    };
    topPages: Array<{
      pageId: string;
      title: string;
      views: number;
      uniqueViews: number;
      avgTimeOnPage: number;
      bounceRate: number;
    }>;
    trends: Array<{
      date: string;
      views: number;
      uniqueViews: number;
      avgTimeOnPage: number;
    }>;
  }>> {
    const queryParams = {
      ...(params?.dateRange && {
        startDate: params.dateRange.start,
        endDate: params.dateRange.end,
      }),
      ...(params?.pageIds && { pageIds: params.pageIds.join(',') }),
      ...(params?.granularity && { granularity: params.granularity }),
    };
    
    return this.client.get<{
      overview: {
        totalPages: number;
        publishedPages: number;
        draftPages: number;
        totalViews: number;
        uniqueViews: number;
        avgTimeOnPage: number;
        bounceRate: number;
      };
      topPages: Array<{
        pageId: string;
        title: string;
        views: number;
        uniqueViews: number;
        avgTimeOnPage: number;
        bounceRate: number;
      }>;
      trends: Array<{
        date: string;
        views: number;
        uniqueViews: number;
        avgTimeOnPage: number;
      }>;
    }>(endpoints.cms.analytics.content, { params: queryParams });
  }

  // Bulk Operations

  // Bulk update pages
  async bulkUpdatePages(updates: Array<{
    pageId: string;
    updates: {
      status?: 'draft' | 'published' | 'archived';
      visibility?: 'public' | 'private' | 'password_protected';
      tags?: string[];
      categories?: string[];
    };
  }>): Promise<ApiResponse<{
    updatedCount: number;
    errors: Array<{
      pageId: string;
      error: string;
    }>;
  }>> {
    return this.client.put<{
      updatedCount: number;
      errors: Array<{
        pageId: string;
        error: string;
      }>;
    }>(endpoints.cms.pages.bulkUpdate, { updates });
  }

  // Bulk delete pages
  async bulkDeletePages(pageIds: string[]): Promise<ApiResponse<{
    deletedCount: number;
    errors: Array<{
      pageId: string;
      error: string;
    }>;
  }>> {
    return this.client.delete<{
      deletedCount: number;
      errors: Array<{
        pageId: string;
        error: string;
      }>;
    }>(endpoints.cms.pages.bulkDelete, {
      data: { pageIds }
    });
  }

  // Search & SEO

  // Generate sitemap
  async generateSitemap(): Promise<ApiResponse<{
    url: string;
    pages: number;
    lastGenerated: string;
  }>> {
    return this.client.post<{
      url: string;
      pages: number;
      lastGenerated: string;
    }>(endpoints.cms.seo.generateSitemap, {});
  }

  // Update robots.txt
  async updateRobotsTxt(content: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.put<{ message: string }>(endpoints.cms.seo.updateRobots, { content });
  }

  // SEO audit
  async runSeoAudit(pageId?: string): Promise<ApiResponse<{
    score: number;
    issues: Array<{
      type: 'error' | 'warning' | 'info';
      message: string;
      page?: string;
      fix?: string;
    }>;
    recommendations: string[];
  }>> {
    const params = pageId ? { pageId } : {};
    return this.client.post<{
      score: number;
      issues: Array<{
        type: 'error' | 'warning' | 'info';
        message: string;
        page?: string;
        fix?: string;
      }>;
      recommendations: string[];
    }>(endpoints.cms.seo.audit, params);
  }
}

// Create service instance
const cmsApiService = new CMSApiService();

// React Query Hooks

// Pages
export const usePages = (params?: SearchParams & PaginationParams & {
  type?: 'page' | 'landing' | 'article' | 'template';
  status?: 'draft' | 'published' | 'archived';
  author?: string;
  category?: string;
  tag?: string;
  sortBy?: 'title' | 'created' | 'updated' | 'published' | 'views';
  sortOrder?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: ['cms', 'pages', params],
    queryFn: () => cmsApiService.getPages(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePage = (pageId: string) => {
  return useQuery({
    queryKey: ['cms', 'pages', 'detail', pageId],
    queryFn: () => cmsApiService.getPageById(pageId),
    enabled: !!pageId,
    staleTime: 5 * 60 * 1000,
  });
};

export const usePageBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['cms', 'pages', 'slug', slug],
    queryFn: () => cmsApiService.getPageBySlug(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes for public pages
  });
};

// Templates
export const useTemplates = (params?: SearchParams & PaginationParams & {
  type?: 'page' | 'email' | 'popup' | 'landing';
  category?: string;
  author?: string;
  public?: boolean;
  sortBy?: 'name' | 'created' | 'used' | 'popular';
  sortOrder?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: ['cms', 'templates', params],
    queryFn: () => cmsApiService.getTemplates(params),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useTemplate = (templateId: string) => {
  return useQuery({
    queryKey: ['cms', 'templates', 'detail', templateId],
    queryFn: () => cmsApiService.getTemplateById(templateId),
    enabled: !!templateId,
    staleTime: 15 * 60 * 1000,
  });
};

// Menus
export const useMenus = (params?: SearchParams & PaginationParams & {
  location?: 'header' | 'footer' | 'sidebar' | 'mobile' | 'custom';
  status?: 'active' | 'inactive';
  sortBy?: 'name' | 'location' | 'created';
  sortOrder?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: ['cms', 'menus', params],
    queryFn: () => cmsApiService.getMenus(params),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useMenu = (menuId: string) => {
  return useQuery({
    queryKey: ['cms', 'menus', 'detail', menuId],
    queryFn: () => cmsApiService.getMenuById(menuId),
    enabled: !!menuId,
    staleTime: 30 * 60 * 1000,
  });
};

export const useMenuByLocation = (location: string) => {
  return useQuery({
    queryKey: ['cms', 'menus', 'location', location],
    queryFn: () => cmsApiService.getMenuByLocation(location),
    enabled: !!location,
    staleTime: 30 * 60 * 1000,
  });
};

// Widgets
export const useWidgets = (params?: SearchParams & PaginationParams & {
  area?: 'sidebar' | 'footer' | 'header' | 'content';
  type?: string;
  status?: 'active' | 'inactive';
  sortBy?: 'name' | 'area' | 'position' | 'created';
  sortOrder?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: ['cms', 'widgets', params],
    queryFn: () => cmsApiService.getWidgets(params),
    staleTime: 15 * 60 * 1000,
  });
};

export const useWidget = (widgetId: string) => {
  return useQuery({
    queryKey: ['cms', 'widgets', 'detail', widgetId],
    queryFn: () => cmsApiService.getWidgetById(widgetId),
    enabled: !!widgetId,
    staleTime: 15 * 60 * 1000,
  });
};

// Settings
export const useCMSSettings = () => {
  return useQuery({
    queryKey: ['cms', 'settings'],
    queryFn: () => cmsApiService.getSettings(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

// Media
export const useMediaFiles = (params?: SearchParams & PaginationParams & {
  folder?: string;
  type?: 'image' | 'video' | 'document' | 'audio';
  sortBy?: 'name' | 'size' | 'created' | 'type';
  sortOrder?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: ['cms', 'media', params],
    queryFn: () => cmsApiService.getMediaFiles(params),
    staleTime: 10 * 60 * 1000,
  });
};

// Analytics
export const useContentAnalytics = (params?: {
  dateRange?: {
    start: string;
    end: string;
  };
  pageIds?: string[];
  granularity?: 'day' | 'week' | 'month';
}) => {
  return useQuery({
    queryKey: ['cms', 'analytics', 'content', params],
    queryFn: () => cmsApiService.getContentAnalytics(params),
    staleTime: 15 * 60 * 1000,
  });
};

// Mutation Hooks

// Pages
export const useCreatePage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (pageData: Parameters<typeof cmsApiService.createPage>[0]) => 
      cmsApiService.createPage(pageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'pages'] });
    },
  });
};

export const useUpdatePage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ pageId, updates }: {
      pageId: string;
      updates: Parameters<typeof cmsApiService.updatePage>[1];
    }) => cmsApiService.updatePage(pageId, updates),
    onSuccess: (_, { pageId }) => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'pages', 'detail', pageId] });
      queryClient.invalidateQueries({ queryKey: ['cms', 'pages'] });
    },
  });
};

export const useDeletePage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (pageId: string) => cmsApiService.deletePage(pageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'pages'] });
    },
  });
};

export const usePublishPage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (pageId: string) => cmsApiService.publishPage(pageId),
    onSuccess: (_, pageId) => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'pages', 'detail', pageId] });
      queryClient.invalidateQueries({ queryKey: ['cms', 'pages'] });
    },
  });
};

export const useUnpublishPage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (pageId: string) => cmsApiService.unpublishPage(pageId),
    onSuccess: (_, pageId) => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'pages', 'detail', pageId] });
      queryClient.invalidateQueries({ queryKey: ['cms', 'pages'] });
    },
  });
};

export const useDuplicatePage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ pageId, title }: { pageId: string; title?: string }) => 
      cmsApiService.duplicatePage(pageId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'pages'] });
    },
  });
};

// Blocks
export const useCreateBlock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ pageId, blockData }: {
      pageId: string;
      blockData: Parameters<typeof cmsApiService.createBlock>[1];
    }) => cmsApiService.createBlock(pageId, blockData),
    onSuccess: (_, { pageId }) => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'blocks', pageId] });
      queryClient.invalidateQueries({ queryKey: ['cms', 'pages', 'detail', pageId] });
    },
  });
};

export const useUpdateBlock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ blockId, updates }: {
      blockId: string;
      updates: Parameters<typeof cmsApiService.updateBlock>[1];
    }) => cmsApiService.updateBlock(blockId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'blocks'] });
    },
  });
};

export const useDeleteBlock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (blockId: string) => cmsApiService.deleteBlock(blockId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'blocks'] });
    },
  });
};

// Templates
export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (templateData: Parameters<typeof cmsApiService.createTemplate>[0]) => 
      cmsApiService.createTemplate(templateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'templates'] });
    },
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ templateId, updates }: {
      templateId: string;
      updates: Parameters<typeof cmsApiService.updateTemplate>[1];
    }) => cmsApiService.updateTemplate(templateId, updates),
    onSuccess: (_, { templateId }) => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'templates', 'detail', templateId] });
      queryClient.invalidateQueries({ queryKey: ['cms', 'templates'] });
    },
  });
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (templateId: string) => cmsApiService.deleteTemplate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'templates'] });
    },
  });
};

export const useCreatePageFromTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ templateId, pageData }: {
      templateId: string;
      pageData: Parameters<typeof cmsApiService.createPageFromTemplate>[1];
    }) => cmsApiService.createPageFromTemplate(templateId, pageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'pages'] });
    },
  });
};

// Media
export const useUploadMedia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ file, folder }: { file: File; folder?: string }) => 
      cmsApiService.uploadMedia(file, folder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'media'] });
    },
  });
};

export const useDeleteMedia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (mediaId: string) => cmsApiService.deleteMedia(mediaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'media'] });
    },
  });
};

// Settings
export const useUpdateCMSSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates: Parameters<typeof cmsApiService.updateSettings>[0]) => 
      cmsApiService.updateSettings(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'settings'] });
    },
  });
};

// Bulk Operations
export const useBulkUpdatePages = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates: Parameters<typeof cmsApiService.bulkUpdatePages>[0]) => 
      cmsApiService.bulkUpdatePages(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'pages'] });
    },
  });
};

export const useBulkDeletePages = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (pageIds: string[]) => cmsApiService.bulkDeletePages(pageIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'pages'] });
    },
  });
};

// SEO
export const useGenerateSitemap = () => {
  return useMutation({
    mutationFn: () => cmsApiService.generateSitemap(),
  });
};

export const useUpdateRobotsTxt = () => {
  return useMutation({
    mutationFn: (content: string) => cmsApiService.updateRobotsTxt(content),
  });
};

export const useRunSeoAudit = () => {
  return useMutation({
    mutationFn: (pageId?: string) => cmsApiService.runSeoAudit(pageId),
  });
};

export default cmsApiService;