/**
 * SEO Audit System for Vardhman Mills Frontend
 * Comprehensive SEO analysis and recommendations
 */

// Import only what's needed - interfaces will be defined locally

// Audit interfaces
export interface SEOAuditResult {
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  issues: SEOIssue[];
  recommendations: SEORecommendation[];
  passedChecks: SEOCheck[];
  failedChecks: SEOCheck[];
  warnings: SEOWarning[];
  summary: AuditSummary;
}

export interface SEOIssue {
  type: 'critical' | 'high' | 'medium' | 'low';
  category: SEOCategory;
  title: string;
  description: string;
  impact: string;
  solution: string;
  affectedElements?: string[];
  priority: number;
}

export interface SEORecommendation {
  category: SEOCategory;
  title: string;
  description: string;
  benefit: string;
  implementation: string;
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: number;
}

export interface SEOCheck {
  id: string;
  category: SEOCategory;
  name: string;
  description: string;
  status: 'pass' | 'fail' | 'warning';
  score: number;
  details?: string;
}

export interface SEOWarning {
  category: SEOCategory;
  title: string;
  description: string;
  suggestion: string;
}

export interface AuditSummary {
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  warnings: number;
  criticalIssues: number;
  overallHealth: 'excellent' | 'good' | 'fair' | 'poor';
  improvementAreas: string[];
}

export type SEOCategory = 
  | 'meta-tags'
  | 'content'
  | 'technical'
  | 'performance'
  | 'mobile'
  | 'social'
  | 'structured-data'
  | 'accessibility'
  | 'security'
  | 'local-seo';

// Page analysis interface
export interface PageAnalysis {
  url: string;
  title?: string;
  metaDescription?: string;
  headings: HeadingAnalysis;
  images: ImageAnalysis;
  links: LinkAnalysis;
  content: ContentAnalysis;
  technical: TechnicalAnalysis;
  performance: PerformanceAnalysis;
  structured: StructuredDataAnalysis;
}

export interface HeadingAnalysis {
  h1Count: number;
  h1Text: string[];
  h2Count: number;
  h3Count: number;
  missingHeadings: string[];
  duplicateHeadings: string[];
  hierarchy: boolean;
}

export interface ImageAnalysis {
  totalImages: number;
  missingAlt: number;
  oversized: number;
  unoptimized: number;
  issues: string[];
}

export interface LinkAnalysis {
  internal: number;
  external: number;
  broken: number;
  noFollow: number;
  issues: string[];
}

export interface ContentAnalysis {
  wordCount: number;
  readabilityScore: number;
  keywordDensity: Record<string, number>;
  duplicateContent: boolean;
  thinContent: boolean;
}

export interface TechnicalAnalysis {
  httpsCertificate: boolean;
  canonicalTag: boolean;
  metaRobots: string;
  xmlSitemap: boolean;
  robotsTxt: boolean;
  pagespeed: number;
  mobileResponsive: boolean;
}

export interface PerformanceAnalysis {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  corewWebVitals: {
    lcp: 'good' | 'needs-improvement' | 'poor';
    fid: 'good' | 'needs-improvement' | 'poor';
    cls: 'good' | 'needs-improvement' | 'poor';
  };
}

export interface StructuredDataAnalysis {
  hasStructuredData: boolean;
  types: string[];
  errors: number;
  warnings: number;
  richSnippetEligible: boolean;
}

// Predefined SEO checks
export const SEO_CHECKS: Record<string, Omit<SEOCheck, 'status' | 'score' | 'details'>> = {
  // Meta Tags
  'title-exists': {
    id: 'title-exists',
    category: 'meta-tags',
    name: 'Page Title',
    description: 'Page has a title tag',
  },
  'title-length': {
    id: 'title-length',
    category: 'meta-tags',
    name: 'Title Length',
    description: 'Title length is between 30-60 characters',
  },
  'meta-description': {
    id: 'meta-description',
    category: 'meta-tags',
    name: 'Meta Description',
    description: 'Page has a meta description',
  },
  'meta-description-length': {
    id: 'meta-description-length',
    category: 'meta-tags',
    name: 'Meta Description Length',
    description: 'Meta description is between 120-160 characters',
  },
  'canonical-tag': {
    id: 'canonical-tag',
    category: 'technical',
    name: 'Canonical URL',
    description: 'Page has canonical URL specified',
  },
  
  // Content
  'h1-exists': {
    id: 'h1-exists',
    category: 'content',
    name: 'H1 Tag',
    description: 'Page has exactly one H1 tag',
  },
  'heading-hierarchy': {
    id: 'heading-hierarchy',
    category: 'content',
    name: 'Heading Hierarchy',
    description: 'Headings follow proper hierarchy (H1 → H2 → H3)',
  },
  'content-length': {
    id: 'content-length',
    category: 'content',
    name: 'Content Length',
    description: 'Page has sufficient content (300+ words)',
  },
  
  // Images
  'images-alt-text': {
    id: 'images-alt-text',
    category: 'accessibility',
    name: 'Image Alt Text',
    description: 'All images have alt text',
  },
  'images-optimization': {
    id: 'images-optimization',
    category: 'performance',
    name: 'Image Optimization',
    description: 'Images are optimized for web',
  },
  
  // Technical
  'https-certificate': {
    id: 'https-certificate',
    category: 'security',
    name: 'HTTPS Certificate',
    description: 'Site uses HTTPS encryption',
  },
  'mobile-responsive': {
    id: 'mobile-responsive',
    category: 'mobile',
    name: 'Mobile Responsive',
    description: 'Page is mobile responsive',
  },
  'page-speed': {
    id: 'page-speed',
    category: 'performance',
    name: 'Page Speed',
    description: 'Page loads in under 3 seconds',
  },
  
  // Structured Data
  'structured-data': {
    id: 'structured-data',
    category: 'structured-data',
    name: 'Structured Data',
    description: 'Page includes structured data markup',
  },
  'schema-validation': {
    id: 'schema-validation',
    category: 'structured-data',
    name: 'Schema Validation',
    description: 'Structured data is valid',
  },
  
  // Social
  'open-graph': {
    id: 'open-graph',
    category: 'social',
    name: 'Open Graph Tags',
    description: 'Page has Open Graph meta tags',
  },
  'twitter-cards': {
    id: 'twitter-cards',
    category: 'social',
    name: 'Twitter Cards',
    description: 'Page has Twitter Card meta tags',
  },
};

/**
 * SEO Audit Service
 */
export class SEOAuditor {
  private static instance: SEOAuditor;

  private constructor() {}

  static getInstance(): SEOAuditor {
    if (!SEOAuditor.instance) {
      SEOAuditor.instance = new SEOAuditor();
    }
    return SEOAuditor.instance;
  }

  /**
   * Perform comprehensive SEO audit
   */
  async auditPage(url: string, html: string): Promise<SEOAuditResult> {
    const analysis = this.analyzePage(url, html);
    const checks = this.performChecks(analysis);
    const issues = this.identifyIssues(analysis, checks);
    const recommendations = this.generateRecommendations(analysis, issues);
    const warnings = this.generateWarnings(analysis);
    
    const passedChecks = checks.filter(check => check.status === 'pass');
    const failedChecks = checks.filter(check => check.status === 'fail');
    
    const score = this.calculateScore(checks);
    const grade = this.calculateGrade(score);
    
    const summary: AuditSummary = {
      totalChecks: checks.length,
      passedChecks: passedChecks.length,
      failedChecks: failedChecks.length,
      warnings: warnings.length,
      criticalIssues: issues.filter(issue => issue.type === 'critical').length,
      overallHealth: this.determineHealth(score),
      improvementAreas: this.getImprovementAreas(issues),
    };

    return {
      score,
      grade,
      issues,
      recommendations,
      passedChecks,
      failedChecks,
      warnings,
      summary,
    };
  }

  /**
   * Audit multiple pages
   */
  async auditMultiplePages(pages: Array<{ url: string; html: string }>): Promise<SEOAuditResult[]> {
    const results = await Promise.all(
      pages.map(page => this.auditPage(page.url, page.html))
    );
    return results;
  }

  /**
   * Generate audit report
   */
  generateReport(auditResult: SEOAuditResult): string {
    let report = '# SEO Audit Report\n\n';
    
    // Summary
    report += `## Overall Score: ${auditResult.score}/100 (Grade: ${auditResult.grade})\n\n`;
    report += `**Health Status:** ${auditResult.summary.overallHealth.toUpperCase()}\n`;
    report += `**Checks Passed:** ${auditResult.summary.passedChecks}/${auditResult.summary.totalChecks}\n`;
    report += `**Critical Issues:** ${auditResult.summary.criticalIssues}\n`;
    report += `**Warnings:** ${auditResult.summary.warnings}\n\n`;
    
    // Critical Issues
    if (auditResult.issues.filter(issue => issue.type === 'critical').length > 0) {
      report += '## 🚨 Critical Issues\n\n';
      auditResult.issues
        .filter(issue => issue.type === 'critical')
        .forEach(issue => {
          report += `### ${issue.title}\n`;
          report += `**Impact:** ${issue.impact}\n`;
          report += `**Solution:** ${issue.solution}\n\n`;
        });
    }
    
    // High Priority Issues
    if (auditResult.issues.filter(issue => issue.type === 'high').length > 0) {
      report += '## ⚠️ High Priority Issues\n\n';
      auditResult.issues
        .filter(issue => issue.type === 'high')
        .forEach(issue => {
          report += `### ${issue.title}\n`;
          report += `**Description:** ${issue.description}\n`;
          report += `**Solution:** ${issue.solution}\n\n`;
        });
    }
    
    // Recommendations
    if (auditResult.recommendations.length > 0) {
      report += '## 💡 Recommendations\n\n';
      auditResult.recommendations
        .sort((a, b) => (a.priority === 'high' ? -1 : b.priority === 'high' ? 1 : 0))
        .forEach(rec => {
          report += `### ${rec.title} (${rec.priority.toUpperCase()} Priority)\n`;
          report += `**Benefit:** ${rec.benefit}\n`;
          report += `**Implementation:** ${rec.implementation}\n\n`;
        });
    }
    
    // Detailed Results
    report += '## 📊 Detailed Check Results\n\n';
    
    const categories = Array.from(new Set(auditResult.passedChecks.concat(auditResult.failedChecks).map(c => c.category)));
    categories.forEach(category => {
      report += `### ${category.replace('-', ' ').toUpperCase()}\n\n`;
      
      const categoryChecks = auditResult.passedChecks.concat(auditResult.failedChecks)
        .filter(check => check.category === category);
      
      categoryChecks.forEach(check => {
        const status = check.status === 'pass' ? '✅' : check.status === 'fail' ? '❌' : '⚠️';
        report += `${status} **${check.name}** - ${check.description}\n`;
        if (check.details) {
          report += `   *${check.details}*\n`;
        }
      });
      report += '\n';
    });
    
    return report;
  }

  /**
   * Private analysis methods
   */
  private analyzePage(url: string, html: string): PageAnalysis {
    const doc = this.createDOMFromHTML(html);
    
    return {
      url,
      title: doc.querySelector('title')?.textContent || undefined,
      metaDescription: doc.querySelector('meta[name="description"]')?.getAttribute('content') || undefined,
      headings: this.analyzeHeadings(doc),
      images: this.analyzeImages(doc),
      links: this.analyzeLinks(doc),
      content: this.analyzeContent(doc),
      technical: this.analyzeTechnical(doc, url),
      performance: this.analyzePerformance(doc),
      structured: this.analyzeStructuredData(html),
    };
  }

  private performChecks(analysis: PageAnalysis): SEOCheck[] {
    const checks: SEOCheck[] = [];
    
    // Title checks
    checks.push({
      ...SEO_CHECKS['title-exists'],
      status: analysis.title ? 'pass' : 'fail',
      score: analysis.title ? 10 : 0,
      details: analysis.title ? `Title: "${analysis.title}"` : 'No title tag found',
    });
    
    checks.push({
      ...SEO_CHECKS['title-length'],
      status: analysis.title && analysis.title.length >= 30 && analysis.title.length <= 60 ? 'pass' : 'fail',
      score: analysis.title && analysis.title.length >= 30 && analysis.title.length <= 60 ? 10 : 0,
      details: analysis.title ? `Length: ${analysis.title.length} characters` : 'No title to check',
    });
    
    // Meta description checks
    checks.push({
      ...SEO_CHECKS['meta-description'],
      status: analysis.metaDescription ? 'pass' : 'fail',
      score: analysis.metaDescription ? 10 : 0,
      details: analysis.metaDescription ? `Description: "${analysis.metaDescription}"` : 'No meta description found',
    });
    
    checks.push({
      ...SEO_CHECKS['meta-description-length'],
      status: analysis.metaDescription && analysis.metaDescription.length >= 120 && analysis.metaDescription.length <= 160 ? 'pass' : 'fail',
      score: analysis.metaDescription && analysis.metaDescription.length >= 120 && analysis.metaDescription.length <= 160 ? 10 : 0,
      details: analysis.metaDescription ? `Length: ${analysis.metaDescription.length} characters` : 'No meta description to check',
    });
    
    // Content checks
    checks.push({
      ...SEO_CHECKS['h1-exists'],
      status: analysis.headings.h1Count === 1 ? 'pass' : 'fail',
      score: analysis.headings.h1Count === 1 ? 10 : 0,
      details: `Found ${analysis.headings.h1Count} H1 tags`,
    });
    
    checks.push({
      ...SEO_CHECKS['heading-hierarchy'],
      status: analysis.headings.hierarchy ? 'pass' : 'fail',
      score: analysis.headings.hierarchy ? 10 : 0,
      details: analysis.headings.hierarchy ? 'Proper heading hierarchy' : 'Heading hierarchy issues found',
    });
    
    checks.push({
      ...SEO_CHECKS['content-length'],
      status: analysis.content.wordCount >= 300 ? 'pass' : 'fail',
      score: analysis.content.wordCount >= 300 ? 10 : 0,
      details: `Word count: ${analysis.content.wordCount}`,
    });
    
    // Image checks
    const imageAltStatus = analysis.images.missingAlt === 0 ? 'pass' : 'fail';
    checks.push({
      ...SEO_CHECKS['images-alt-text'],
      status: imageAltStatus,
      score: imageAltStatus === 'pass' ? 10 : 0,
      details: `${analysis.images.missingAlt} images missing alt text out of ${analysis.images.totalImages}`,
    });
    
    // Technical checks
    checks.push({
      ...SEO_CHECKS['https-certificate'],
      status: analysis.technical.httpsCertificate ? 'pass' : 'fail',
      score: analysis.technical.httpsCertificate ? 10 : 0,
      details: analysis.technical.httpsCertificate ? 'HTTPS enabled' : 'HTTPS not detected',
    });
    
    checks.push({
      ...SEO_CHECKS['canonical-tag'],
      status: analysis.technical.canonicalTag ? 'pass' : 'fail',
      score: analysis.technical.canonicalTag ? 10 : 0,
      details: analysis.technical.canonicalTag ? 'Canonical tag found' : 'No canonical tag',
    });
    
    // Structured data checks
    checks.push({
      ...SEO_CHECKS['structured-data'],
      status: analysis.structured.hasStructuredData ? 'pass' : 'fail',
      score: analysis.structured.hasStructuredData ? 10 : 0,
      details: analysis.structured.hasStructuredData ? `Found ${analysis.structured.types.join(', ')}` : 'No structured data found',
    });
    
    return checks;
  }

  private identifyIssues(analysis: PageAnalysis, checks: SEOCheck[]): SEOIssue[] {
    const issues: SEOIssue[] = [];
    const failedChecks = checks.filter(check => check.status === 'fail');
    
    failedChecks.forEach(check => {
      let type: SEOIssue['type'] = 'medium';
      let priority = 5;
      
      // Determine issue severity
      if (['title-exists', 'https-certificate', 'h1-exists'].includes(check.id)) {
        type = 'critical';
        priority = 10;
      } else if (['meta-description', 'canonical-tag', 'structured-data'].includes(check.id)) {
        type = 'high';
        priority = 8;
      }
      
      issues.push({
        type,
        category: check.category,
        title: `${check.name} Issue`,
        description: check.description,
        impact: this.getImpactDescription(check.id),
        solution: this.getSolutionDescription(check.id),
        priority,
      });
    });
    
    // Additional analysis-based issues
    if (analysis.content.thinContent) {
      issues.push({
        type: 'high',
        category: 'content',
        title: 'Thin Content',
        description: 'Page has insufficient content',
        impact: 'Low content quality affects search rankings',
        solution: 'Add more valuable, relevant content (aim for 300+ words)',
        priority: 8,
      });
    }
    
    if (analysis.images.oversized > 0) {
      issues.push({
        type: 'medium',
        category: 'performance',
        title: 'Oversized Images',
        description: `${analysis.images.oversized} images are oversized`,
        impact: 'Large images slow down page loading',
        solution: 'Optimize images and use appropriate formats (WebP, AVIF)',
        priority: 6,
      });
    }
    
    return issues.sort((a, b) => b.priority - a.priority);
  }

  private generateRecommendations(analysis: PageAnalysis, issues: SEOIssue[]): SEORecommendation[] {
    const recommendations: SEORecommendation[] = [];
    
    // Generate recommendations based on critical issues
    const criticalIssues = issues.filter(issue => issue.type === 'critical');
    criticalIssues.forEach(issue => {
      recommendations.push({
        category: issue.category,
        title: `Fix: ${issue.title}`,
        description: issue.description,
        benefit: `Resolving this issue will improve SEO score significantly`,
        implementation: issue.solution,
        priority: 'high',
        estimatedImpact: 20,
      });
    });
    
    // Performance recommendations
    if (analysis.performance.loadTime > 3) {
      recommendations.push({
        category: 'performance',
        title: 'Improve Page Load Speed',
        description: 'Page takes longer than 3 seconds to load',
        benefit: 'Faster loading pages rank higher and have better user engagement',
        implementation: 'Optimize images, minify CSS/JS, use CDN, enable compression',
        priority: 'high',
        estimatedImpact: 15,
      });
    }
    
    // Content recommendations
    if (analysis.content.wordCount < 500) {
      recommendations.push({
        category: 'content',
        title: 'Expand Content',
        description: 'Page has minimal content',
        benefit: 'More comprehensive content typically ranks better',
        implementation: 'Add detailed information, FAQs, examples, and related topics',
        priority: 'medium',
        estimatedImpact: 10,
      });
    }
    
    // Technical recommendations
    if (!analysis.structured.hasStructuredData) {
      recommendations.push({
        category: 'structured-data',
        title: 'Add Structured Data',
        description: 'Page lacks structured data markup',
        benefit: 'Enables rich snippets and better search visibility',
        implementation: 'Add appropriate schema.org markup (Organization, Product, Article)',
        priority: 'high',
        estimatedImpact: 12,
      });
    }
    
    // Social recommendations
    recommendations.push({
      category: 'social',
      title: 'Implement Social Meta Tags',
      description: 'Enhance social media sharing',
      benefit: 'Better appearance when shared on social platforms',
      implementation: 'Add Open Graph and Twitter Card meta tags',
      priority: 'medium',
      estimatedImpact: 8,
    });
    
    return recommendations.sort((a, b) => b.estimatedImpact - a.estimatedImpact);
  }

  private generateWarnings(analysis: PageAnalysis): SEOWarning[] {
    const warnings: SEOWarning[] = [];
    
    if (analysis.headings.duplicateHeadings.length > 0) {
      warnings.push({
        category: 'content',
        title: 'Duplicate Headings',
        description: `Found duplicate headings: ${analysis.headings.duplicateHeadings.join(', ')}`,
        suggestion: 'Make headings unique and descriptive',
      });
    }
    
    if (analysis.links.broken > 0) {
      warnings.push({
        category: 'technical',
        title: 'Broken Links',
        description: `Found ${analysis.links.broken} broken links`,
        suggestion: 'Fix or remove broken links to improve user experience',
      });
    }
    
    return warnings;
  }

  private calculateScore(checks: SEOCheck[]): number {
    const totalPossible = checks.length * 10;
    const actualScore = checks.reduce((sum, check) => sum + check.score, 0);
    return Math.round((actualScore / totalPossible) * 100);
  }

  private calculateGrade(score: number): SEOAuditResult['grade'] {
    if (score >= 95) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 75) return 'B';
    if (score >= 65) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }

  private determineHealth(score: number): AuditSummary['overallHealth'] {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    return 'poor';
  }

  private getImprovementAreas(issues: SEOIssue[]): string[] {
    const areas = Array.from(new Set(issues.map(issue => issue.category)));
    return areas.map(area => area.replace('-', ' ').toUpperCase());
  }

  // Helper methods for detailed analysis
  private analyzeHeadings(doc: Document): HeadingAnalysis {
    const h1Elements = doc.querySelectorAll('h1');
    const h2Elements = doc.querySelectorAll('h2');
    const h3Elements = doc.querySelectorAll('h3');
    
    const h1Text = Array.from(h1Elements).map(el => el.textContent || '');
    const allHeadings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    
    // Check hierarchy
    let hierarchy = true;
    let lastLevel = 0;
    for (const heading of allHeadings) {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > lastLevel + 1) {
        hierarchy = false;
        break;
      }
      lastLevel = level;
    }
    
    return {
      h1Count: h1Elements.length,
      h1Text,
      h2Count: h2Elements.length,
      h3Count: h3Elements.length,
      missingHeadings: [],
      duplicateHeadings: this.findDuplicateHeadings(allHeadings),
      hierarchy,
    };
  }

  private analyzeImages(doc: Document): ImageAnalysis {
    const images = doc.querySelectorAll('img');
    let missingAlt = 0;
    const issues: string[] = [];
    
    images.forEach((img, index) => {
      if (!img.getAttribute('alt')) {
        missingAlt++;
        issues.push(`Image ${index + 1} missing alt text`);
      }
    });
    
    return {
      totalImages: images.length,
      missingAlt,
      oversized: 0, // Would need actual size analysis
      unoptimized: 0, // Would need format analysis
      issues,
    };
  }

  private analyzeLinks(doc: Document): LinkAnalysis {
    const links = doc.querySelectorAll('a[href]');
    let internal = 0;
    let external = 0;
    let noFollow = 0;
    
    links.forEach(link => {
      const href = link.getAttribute('href') || '';
      const rel = link.getAttribute('rel') || '';
      
      if (href.startsWith('http') && !href.includes(window.location.hostname)) {
        external++;
      } else {
        internal++;
      }
      
      if (rel.includes('nofollow')) {
        noFollow++;
      }
    });
    
    return {
      internal,
      external,
      broken: 0, // Would need actual link checking
      noFollow,
      issues: [],
    };
  }

  private analyzeContent(doc: Document): ContentAnalysis {
    const textContent = doc.body?.textContent || '';
    const words = textContent.split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    
    return {
      wordCount,
      readabilityScore: 0, // Would need readability calculation
      keywordDensity: {},
      duplicateContent: false,
      thinContent: wordCount < 300,
    };
  }

  private analyzeTechnical(doc: Document, url: string): TechnicalAnalysis {
    const canonicalLink = doc.querySelector('link[rel="canonical"]');
    const metaRobots = doc.querySelector('meta[name="robots"]');
    
    return {
      httpsCertificate: url.startsWith('https://'),
      canonicalTag: !!canonicalLink,
      metaRobots: metaRobots?.getAttribute('content') || 'index, follow',
      xmlSitemap: false, // Would need sitemap checking
      robotsTxt: false, // Would need robots.txt checking
      pagespeed: 0, // Would need performance measurement
      mobileResponsive: !!doc.querySelector('meta[name="viewport"]'),
    };
  }

  private analyzePerformance(doc: Document): PerformanceAnalysis {
    // Basic performance analysis - analyze DOM for potential performance issues
    const scripts = doc.querySelectorAll('script').length;
    const stylesheets = doc.querySelectorAll('link[rel="stylesheet"]').length;
    const images = doc.querySelectorAll('img').length;
    
    // Estimate load time based on resource count
    const estimatedLoadTime = Math.max(1, (scripts * 0.1) + (stylesheets * 0.05) + (images * 0.02));
    
    return {
      loadTime: estimatedLoadTime,
      firstContentfulPaint: estimatedLoadTime * 0.3,
      largestContentfulPaint: estimatedLoadTime * 0.8,
      cumulativeLayoutShift: scripts > 10 ? 0.15 : 0.05,
      firstInputDelay: scripts > 5 ? 150 : 50,
      corewWebVitals: {
        lcp: estimatedLoadTime < 2.5 ? 'good' : estimatedLoadTime < 4 ? 'needs-improvement' : 'poor',
        fid: scripts < 5 ? 'good' : scripts < 10 ? 'needs-improvement' : 'poor',
        cls: scripts < 10 ? 'good' : 'needs-improvement',
      },
    };
  }

  private analyzeStructuredData(html: string): StructuredDataAnalysis {
    const jsonLdRegex = /<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gi;
    const matches = html.match(jsonLdRegex);
    
    if (!matches) {
      return {
        hasStructuredData: false,
        types: [],
        errors: 0,
        warnings: 0,
        richSnippetEligible: false,
      };
    }
    
    const types: string[] = [];
    matches.forEach(match => {
      try {
        const jsonContent = match.replace(/<script[^>]*>|<\/script>/gi, '').trim();
        const parsed = JSON.parse(jsonContent);
        if (parsed['@type']) {
          types.push(parsed['@type']);
        }
      } catch {
        // JSON parsing error
      }
    });
    
    return {
      hasStructuredData: matches.length > 0,
      types: Array.from(new Set(types)),
      errors: 0,
      warnings: 0,
      richSnippetEligible: types.some(type => ['Product', 'Article', 'Organization'].includes(type)),
    };
  }

  private createDOMFromHTML(html: string): Document {
    // In a real implementation, you'd use DOMParser or similar
    // This is a simplified version
    const parser = new DOMParser();
    return parser.parseFromString(html, 'text/html');
  }

  private findDuplicateHeadings(headings: NodeListOf<Element> | Element[]): string[] {
    const textCounts: Record<string, number> = {};
    const duplicates: string[] = [];
    
    Array.from(headings).forEach(heading => {
      const text = heading.textContent?.trim() || '';
      if (text) {
        textCounts[text] = (textCounts[text] || 0) + 1;
        if (textCounts[text] === 2) {
          duplicates.push(text);
        }
      }
    });
    
    return duplicates;
  }

  private getImpactDescription(checkId: string): string {
    const impacts: Record<string, string> = {
      'title-exists': 'Missing title severely impacts search rankings and click-through rates',
      'title-length': 'Improper title length affects search result display and CTR',
      'meta-description': 'Missing meta description reduces search result appeal',
      'h1-exists': 'Missing or multiple H1 tags confuse search engines about page topic',
      'https-certificate': 'HTTP sites are penalized by search engines and browsers',
      'canonical-tag': 'Missing canonical tags can cause duplicate content issues',
      'structured-data': 'Missing structured data reduces rich snippet opportunities',
    };
    return impacts[checkId] || 'Negatively affects SEO performance';
  }

  private getSolutionDescription(checkId: string): string {
    const solutions: Record<string, string> = {
      'title-exists': 'Add a descriptive title tag to the page head section',
      'title-length': 'Adjust title length to 30-60 characters for optimal display',
      'meta-description': 'Add a compelling meta description (120-160 characters)',
      'h1-exists': 'Ensure exactly one H1 tag exists with the main page topic',
      'https-certificate': 'Install SSL certificate and redirect HTTP to HTTPS',
      'canonical-tag': 'Add canonical link tag to specify preferred URL version',
      'structured-data': 'Implement relevant schema.org markup for the content type',
    };
    return solutions[checkId] || 'Follow SEO best practices to resolve this issue';
  }
}

// Export singleton instance
export const seoAuditor = SEOAuditor.getInstance();

export default SEOAuditor;