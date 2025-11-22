/**
 * Robots.txt Generator for Vardhman Mills Frontend
 * Dynamic robots.txt generation with advanced configurations
 */

// Robots directive types
export type RobotsDirective = 
  | 'User-agent'
  | 'Disallow'
  | 'Allow'
  | 'Crawl-delay'
  | 'Sitemap'
  | 'Host'
  | 'Request-rate'
  | 'Visit-time'
  | 'Comment';

// User agent types
export type UserAgent = 
  | '*'
  | 'Googlebot'
  | 'Bingbot'
  | 'Slurp'
  | 'DuckDuckBot'
  | 'Baiduspider'
  | 'YandexBot'
  | 'facebookexternalhit'
  | 'Twitterbot'
  | 'LinkedInBot'
  | 'WhatsApp'
  | 'Applebot'
  | 'AhrefsBot'
  | 'SemrushBot'
  | 'MJ12bot'
  | 'DotBot'
  | 'archive.org_bot'
  | 'ia_archiver'
  | string;

// Robots rule interface
export interface RobotsRule {
  userAgent: UserAgent;
  disallow?: string[];
  allow?: string[];
  crawlDelay?: number;
  requestRate?: string; // Format: "1/10s" (1 request per 10 seconds)
  visitTime?: string; // Format: "0100-0800" (1 AM to 8 AM)
  comment?: string;
}

// Robots configuration
export interface RobotsConfig {
  rules: RobotsRule[];
  sitemaps?: string[];
  host?: string;
  comments?: string[];
  environment?: 'development' | 'staging' | 'production';
  blockAI?: boolean; // Block AI crawlers
  allowGoogleAds?: boolean;
  allowSocialMedia?: boolean;
  customDirectives?: Array<{
    directive: string;
    value: string;
  }>;
}

// Predefined bot lists
export const SEARCH_ENGINE_BOTS: UserAgent[] = [
  'Googlebot',
  'Bingbot',
  'Slurp', // Yahoo
  'DuckDuckBot',
  'Baiduspider',
  'YandexBot',
  'Applebot',
];

export const SOCIAL_MEDIA_BOTS: UserAgent[] = [
  'facebookexternalhit',
  'Twitterbot',
  'LinkedInBot',
  'WhatsApp',
];

export const SEO_TOOL_BOTS: UserAgent[] = [
  'AhrefsBot',
  'SemrushBot',
  'MJ12bot',
  'DotBot',
];

export const AI_CRAWLER_BOTS: UserAgent[] = [
  'GPTBot',
  'ChatGPT-User',
  'CCBot',
  'Claude-Web',
  'anthropic-ai',
  'bard',
  'PerplexityBot',
];

export const ARCHIVE_BOTS: UserAgent[] = [
  'archive.org_bot',
  'ia_archiver',
];

// Default configurations for different environments
export const DEVELOPMENT_ROBOTS_CONFIG: RobotsConfig = {
  rules: [
    {
      userAgent: '*',
      disallow: ['/'],
      comment: 'Block all crawlers in development',
    },
  ],
  environment: 'development',
};

export const STAGING_ROBOTS_CONFIG: RobotsConfig = {
  rules: [
    {
      userAgent: '*',
      disallow: ['/'],
      comment: 'Block all crawlers in staging',
    },
    {
      userAgent: 'Googlebot',
      disallow: ['/'],
      allow: ['/public-preview'],
      comment: 'Allow Google for preview testing',
    },
  ],
  environment: 'staging',
};

export const PRODUCTION_ROBOTS_CONFIG: RobotsConfig = {
  rules: [
    {
      userAgent: '*',
      disallow: [
        '/admin/',
        '/api/',
        '/private/',
        '/_next/',
        '/auth/',
        '/checkout/',
        '/profile/',
        '/dashboard/',
        '/search?*',
        '/*?sort=*',
        '/*?filter=*',
        '/temp/',
        '/uploads/private/',
      ],
      allow: [
        '/api/og',
        '/api/sitemap',
        '/uploads/public/',
      ],
      crawlDelay: 1,
      comment: 'General rules for all crawlers',
    },
    {
      userAgent: 'Googlebot',
      disallow: [
        '/admin/',
        '/private/',
        '/auth/',
        '/checkout/',
        '/profile/',
        '/dashboard/',
      ],
      allow: [
        '/api/og',
        '/api/sitemap',
        '/uploads/',
      ],
      crawlDelay: 0.5,
      requestRate: '10/1m',
      comment: 'Optimized rules for Google',
    },
    {
      userAgent: 'Bingbot',
      disallow: [
        '/admin/',
        '/private/',
        '/auth/',
        '/checkout/',
        '/profile/',
        '/dashboard/',
      ],
      crawlDelay: 2,
      requestRate: '5/1m',
      comment: 'Conservative rules for Bing',
    },
  ],
  sitemaps: [
    'https://vardhmantextiles.com/sitemap.xml',
    'https://vardhmantextiles.com/sitemap-products.xml',
    'https://vardhmantextiles.com/sitemap-news.xml',
  ],
  host: 'https://vardhmantextiles.com',
  environment: 'production',
  blockAI: false,
  allowGoogleAds: true,
  allowSocialMedia: true,
};

/**
 * Robots Generator Service
 */
export class RobotsGenerator {
  private static instance: RobotsGenerator;
  private config: RobotsConfig;

  private constructor(config: RobotsConfig = PRODUCTION_ROBOTS_CONFIG) {
    this.config = config;
  }

  static getInstance(config?: RobotsConfig): RobotsGenerator {
    if (!RobotsGenerator.instance) {
      RobotsGenerator.instance = new RobotsGenerator(config);
    }
    return RobotsGenerator.instance;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RobotsConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Generate robots.txt content
   */
  generateRobotsTxt(): string {
    const lines: string[] = [];

    // Add header comment
    lines.push('# Robots.txt for Vardhman Mills');
    lines.push(`# Generated on: ${new Date().toISOString()}`);
    lines.push(`# Environment: ${this.config.environment || 'production'}`);
    lines.push('');

    // Add custom comments
    if (this.config.comments) {
      this.config.comments.forEach(comment => {
        lines.push(`# ${comment}`);
      });
      lines.push('');
    }

    // Process AI crawler blocking if enabled
    if (this.config.blockAI) {
      this.addAICrawlerRules(lines);
    }

    // Process each rule
    this.config.rules.forEach((rule, index) => {
      if (rule.comment) {
        lines.push(`# ${rule.comment}`);
      }

      lines.push(`User-agent: ${rule.userAgent}`);

      // Add disallow rules
      if (rule.disallow && rule.disallow.length > 0) {
        rule.disallow.forEach(path => {
          lines.push(`Disallow: ${path}`);
        });
      }

      // Add allow rules
      if (rule.allow && rule.allow.length > 0) {
        rule.allow.forEach(path => {
          lines.push(`Allow: ${path}`);
        });
      }

      // Add crawl delay
      if (rule.crawlDelay !== undefined) {
        lines.push(`Crawl-delay: ${rule.crawlDelay}`);
      }

      // Add request rate
      if (rule.requestRate) {
        lines.push(`Request-rate: ${rule.requestRate}`);
      }

      // Add visit time
      if (rule.visitTime) {
        lines.push(`Visit-time: ${rule.visitTime}`);
      }

      // Add spacing between rules
      if (index < this.config.rules.length - 1) {
        lines.push('');
      }
    });

    // Add global directives
    lines.push('');

    // Add host directive
    if (this.config.host) {
      lines.push(`Host: ${this.config.host}`);
      lines.push('');
    }

    // Add sitemaps
    if (this.config.sitemaps && this.config.sitemaps.length > 0) {
      this.config.sitemaps.forEach(sitemap => {
        lines.push(`Sitemap: ${sitemap}`);
      });
      lines.push('');
    }

    // Add custom directives
    if (this.config.customDirectives) {
      this.config.customDirectives.forEach(directive => {
        lines.push(`${directive.directive}: ${directive.value}`);
      });
      lines.push('');
    }

    // Add footer comment
    lines.push('# End of robots.txt');

    return lines.join('\n');
  }

  /**
   * Generate robots.txt for specific environment
   */
  generateForEnvironment(environment: 'development' | 'staging' | 'production'): string {
    let config: RobotsConfig;

    switch (environment) {
      case 'development':
        config = DEVELOPMENT_ROBOTS_CONFIG;
        break;
      case 'staging':
        config = STAGING_ROBOTS_CONFIG;
        break;
      case 'production':
        config = PRODUCTION_ROBOTS_CONFIG;
        break;
      default:
        config = PRODUCTION_ROBOTS_CONFIG;
    }

    const previousConfig = this.config;
    this.config = config;
    const result = this.generateRobotsTxt();
    this.config = previousConfig;

    return result;
  }

  /**
   * Add rule for specific user agent
   */
  addRule(rule: RobotsRule): void {
    this.config.rules.push(rule);
  }

  /**
   * Remove rule for specific user agent
   */
  removeRule(userAgent: UserAgent): void {
    this.config.rules = this.config.rules.filter(rule => rule.userAgent !== userAgent);
  }

  /**
   * Update rule for specific user agent
   */
  updateRule(userAgent: UserAgent, updates: Partial<RobotsRule>): void {
    const ruleIndex = this.config.rules.findIndex(rule => rule.userAgent === userAgent);
    if (ruleIndex !== -1) {
      this.config.rules[ruleIndex] = { ...this.config.rules[ruleIndex], ...updates };
    }
  }

  /**
   * Add sitemap URL
   */
  addSitemap(url: string): void {
    if (!this.config.sitemaps) {
      this.config.sitemaps = [];
    }
    if (!this.config.sitemaps.includes(url)) {
      this.config.sitemaps.push(url);
    }
  }

  /**
   * Remove sitemap URL
   */
  removeSitemap(url: string): void {
    if (this.config.sitemaps) {
      this.config.sitemaps = this.config.sitemaps.filter(sitemap => sitemap !== url);
    }
  }

  /**
   * Block specific paths for all crawlers
   */
  blockPaths(paths: string[]): void {
    const globalRule = this.config.rules.find(rule => rule.userAgent === '*');
    if (globalRule) {
      if (!globalRule.disallow) globalRule.disallow = [];
      paths.forEach(path => {
        if (!globalRule.disallow!.includes(path)) {
          globalRule.disallow!.push(path);
        }
      });
    } else {
      this.addRule({
        userAgent: '*',
        disallow: paths,
      });
    }
  }

  /**
   * Allow specific paths for all crawlers
   */
  allowPaths(paths: string[]): void {
    const globalRule = this.config.rules.find(rule => rule.userAgent === '*');
    if (globalRule) {
      if (!globalRule.allow) globalRule.allow = [];
      paths.forEach(path => {
        if (!globalRule.allow!.includes(path)) {
          globalRule.allow!.push(path);
        }
      });
    } else {
      this.addRule({
        userAgent: '*',
        allow: paths,
      });
    }
  }

  /**
   * Set crawl delay for specific user agent
   */
  setCrawlDelay(userAgent: UserAgent, delay: number): void {
    const rule = this.config.rules.find(r => r.userAgent === userAgent);
    if (rule) {
      rule.crawlDelay = delay;
    } else {
      this.addRule({
        userAgent,
        crawlDelay: delay,
      });
    }
  }

  /**
   * Validate robots.txt syntax
   */
  validateSyntax(): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for required directives
    if (this.config.rules.length === 0) {
      errors.push('At least one rule is required');
    }

    // Check each rule
    this.config.rules.forEach((rule, index) => {
      if (!rule.userAgent) {
        errors.push(`Rule ${index + 1}: User-agent is required`);
      }

      // Check disallow paths
      if (rule.disallow) {
        rule.disallow.forEach(path => {
          if (!path.startsWith('/') && path !== '') {
            warnings.push(`Rule ${index + 1}: Disallow path "${path}" should start with / or be empty`);
          }
        });
      }

      // Check allow paths
      if (rule.allow) {
        rule.allow.forEach(path => {
          if (!path.startsWith('/') && path !== '') {
            warnings.push(`Rule ${index + 1}: Allow path "${path}" should start with /`);
          }
        });
      }

      // Check crawl delay
      if (rule.crawlDelay !== undefined && (rule.crawlDelay < 0 || rule.crawlDelay > 86400)) {
        warnings.push(`Rule ${index + 1}: Crawl delay should be between 0 and 86400 seconds`);
      }

      // Check request rate format
      if (rule.requestRate && !/^\d+\/\d+[smh]$/.test(rule.requestRate)) {
        warnings.push(`Rule ${index + 1}: Request rate format should be like "1/10s", "5/1m", or "10/1h"`);
      }

      // Check visit time format
      if (rule.visitTime && !/^\d{4}-\d{4}$/.test(rule.visitTime)) {
        warnings.push(`Rule ${index + 1}: Visit time format should be like "0100-0800"`);
      }
    });

    // Check sitemaps
    if (this.config.sitemaps) {
      this.config.sitemaps.forEach(sitemap => {
        try {
          new URL(sitemap);
        } catch {
          errors.push(`Invalid sitemap URL: ${sitemap}`);
        }
      });
    }

    // Check host
    if (this.config.host) {
      try {
        new URL(this.config.host);
      } catch {
        errors.push(`Invalid host URL: ${this.config.host}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get statistics about the configuration
   */
  getStatistics(): {
    totalRules: number;
    userAgents: string[];
    blockedPaths: number;
    allowedPaths: number;
    sitemaps: number;
    hasGlobalRule: boolean;
    hasSearchEngineRules: boolean;
    blockingAI: boolean;
  } {
    const userAgents = this.config.rules.map(rule => rule.userAgent);
    const blockedPaths = this.config.rules.reduce((acc, rule) => acc + (rule.disallow?.length || 0), 0);
    const allowedPaths = this.config.rules.reduce((acc, rule) => acc + (rule.allow?.length || 0), 0);
    
    const hasGlobalRule = userAgents.includes('*');
    const hasSearchEngineRules = SEARCH_ENGINE_BOTS.some(bot => userAgents.includes(bot));
    const blockingAI = AI_CRAWLER_BOTS.some(bot => {
      const rule = this.config.rules.find(r => r.userAgent === bot);
      return rule && rule.disallow?.includes('/');
    });

    return {
      totalRules: this.config.rules.length,
      userAgents,
      blockedPaths,
      allowedPaths,
      sitemaps: this.config.sitemaps?.length || 0,
      hasGlobalRule,
      hasSearchEngineRules,
      blockingAI,
    };
  }

  /**
   * Private helper methods
   */
  private addAICrawlerRules(lines: string[]): void {
    lines.push('# Block AI crawlers');
    AI_CRAWLER_BOTS.forEach(bot => {
      lines.push(`User-agent: ${bot}`);
      lines.push('Disallow: /');
      lines.push('');
    });
  }
}

// Utility functions
export const RobotsUtils = {
  /**
   * Create robots rule for search engines
   */
  createSearchEngineRules: (
    disallow: string[] = ['/admin/', '/api/', '/private/'],
    allow: string[] = ['/api/og', '/api/sitemap'],
    crawlDelay: number = 1
  ): RobotsRule[] => {
    return SEARCH_ENGINE_BOTS.map(bot => ({
      userAgent: bot,
      disallow,
      allow,
      crawlDelay: bot === 'Googlebot' ? 0.5 : crawlDelay,
      comment: `Rules for ${bot}`,
    }));
  },

  /**
   * Create rules for social media bots
   */
  createSocialMediaRules: (
    allow: string[] = ['/api/og', '/'],
    disallow: string[] = ['/admin/', '/private/']
  ): RobotsRule[] => {
    return SOCIAL_MEDIA_BOTS.map(bot => ({
      userAgent: bot,
      allow,
      disallow,
      comment: `Rules for ${bot}`,
    }));
  },

  /**
   * Create rules to block AI crawlers
   */
  createAIBlockRules: (): RobotsRule[] => {
    return AI_CRAWLER_BOTS.map(bot => ({
      userAgent: bot,
      disallow: ['/'],
      comment: `Block AI crawler: ${bot}`,
    }));
  },

  /**
   * Create rules for SEO tools
   */
  createSEOToolRules: (
    disallow: string[] = ['/admin/', '/private/', '/auth/'],
    crawlDelay: number = 10
  ): RobotsRule[] => {
    return SEO_TOOL_BOTS.map(bot => ({
      userAgent: bot,
      disallow,
      crawlDelay,
      requestRate: '1/10s',
      comment: `Conservative rules for SEO tool: ${bot}`,
    }));
  },

  /**
   * Merge multiple robot configurations
   */
  mergeConfigs: (...configs: RobotsConfig[]): RobotsConfig => {
    const merged: RobotsConfig = {
      rules: [],
      sitemaps: [],
      comments: [],
      customDirectives: [],
    };

    configs.forEach(config => {
      merged.rules.push(...config.rules);
      if (config.sitemaps) merged.sitemaps!.push(...config.sitemaps);
      if (config.comments) merged.comments!.push(...config.comments);
      if (config.customDirectives) merged.customDirectives!.push(...config.customDirectives);
      
      // Take the last non-undefined value for other properties
      if (config.host) merged.host = config.host;
      if (config.environment) merged.environment = config.environment;
      if (config.blockAI !== undefined) merged.blockAI = config.blockAI;
      if (config.allowGoogleAds !== undefined) merged.allowGoogleAds = config.allowGoogleAds;
      if (config.allowSocialMedia !== undefined) merged.allowSocialMedia = config.allowSocialMedia;
    });

    // Remove duplicates
    merged.sitemaps = Array.from(new Set(merged.sitemaps));
    merged.comments = Array.from(new Set(merged.comments));

    return merged;
  },

  /**
   * Check if path is allowed for user agent
   */
  isPathAllowed: (config: RobotsConfig, userAgent: string, path: string): boolean => {
    const rule = config.rules.find(r => r.userAgent === userAgent || r.userAgent === '*');
    if (!rule) return true;

    // Check disallow rules first
    if (rule.disallow) {
      for (const disallowPath of rule.disallow) {
        if (disallowPath === '/' && path === '/') return false;
        if (disallowPath !== '/' && path.startsWith(disallowPath)) {
          // Check if there's a more specific allow rule
          if (rule.allow) {
            for (const allowPath of rule.allow) {
              if (path.startsWith(allowPath)) return true;
            }
          }
          return false;
        }
      }
    }

    return true;
  },

  /**
   * Parse existing robots.txt content
   */
  parseRobotsTxt: (content: string): RobotsConfig => {
    const lines = content.split('\n').map(line => line.trim());
    const config: RobotsConfig = { rules: [] };
    let currentRule: Partial<RobotsRule> | null = null;

    lines.forEach(line => {
      if (line.startsWith('#') || line === '') return;

      const [directive, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();

      switch (directive.toLowerCase()) {
        case 'user-agent':
          if (currentRule && currentRule.userAgent) {
            config.rules.push(currentRule as RobotsRule);
          }
          currentRule = { userAgent: value };
          break;
        case 'disallow':
          if (currentRule) {
            if (!currentRule.disallow) currentRule.disallow = [];
            currentRule.disallow.push(value);
          }
          break;
        case 'allow':
          if (currentRule) {
            if (!currentRule.allow) currentRule.allow = [];
            currentRule.allow.push(value);
          }
          break;
        case 'crawl-delay':
          if (currentRule) {
            currentRule.crawlDelay = parseFloat(value);
          }
          break;
        case 'request-rate':
          if (currentRule) {
            currentRule.requestRate = value;
          }
          break;
        case 'visit-time':
          if (currentRule) {
            currentRule.visitTime = value;
          }
          break;
        case 'sitemap':
          if (!config.sitemaps) config.sitemaps = [];
          config.sitemaps.push(value);
          break;
        case 'host':
          config.host = value;
          break;
      }
    });

    // Add the last rule
    if (currentRule && (currentRule as RobotsRule).userAgent) {
      config.rules.push(currentRule as RobotsRule);
    }

    return config;
  },
};

// Export singleton instance
export const robotsGenerator = RobotsGenerator.getInstance();

export default RobotsGenerator;