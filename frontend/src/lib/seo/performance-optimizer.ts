/**
 * Performance Optimizer for Vardhman Mills Frontend
 * SEO performance monitoring and optimization recommendations
 */

// Performance monitoring interfaces
export interface PerformanceMetrics {
  // Core Web Vitals
  largestContentfulPaint: number; // LCP
  firstInputDelay: number; // FID
  cumulativeLayoutShift: number; // CLS
  firstContentfulPaint: number; // FCP
  timeToInteractive: number; // TTI
  totalBlockingTime: number; // TBT
  
  // Loading metrics
  domContentLoaded: number;
  loadComplete: number;
  serverResponseTime: number;
  
  // Resource metrics
  resourceCount: number;
  totalResourceSize: number;
  compressedResourceSize: number;
  imageCount: number;
  scriptCount: number;
  stylesheetCount: number;
  
  // SEO impact score
  seoImpactScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface PerformanceOptimization {
  category: 'images' | 'scripts' | 'styles' | 'fonts' | 'server' | 'caching' | 'compression';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'easy' | 'moderate' | 'complex';
  recommendation: string;
  expectedImprovement: {
    lcp?: number;
    fid?: number;
    fcp?: number;
    tbt?: number;
    cls?: number;
    seoScore?: number;
  };
  implementation: string[];
  resources: string[];
}

export interface ResourceAnalysis {
  url: string;
  type: 'image' | 'script' | 'stylesheet' | 'font' | 'other';
  size: number;
  compressed: boolean;
  cached: boolean;
  critical: boolean;
  loadTime: number;
  issues: ResourceIssue[];
  optimization: ResourceOptimization[];
}

export interface ResourceIssue {
  type: 'oversized' | 'uncompressed' | 'render-blocking' | 'unused' | 'uncached';
  severity: 'high' | 'medium' | 'low';
  description: string;
  impact: string;
}

export interface ResourceOptimization {
  action: string;
  description: string;
  expectedSavings: number;
  implementation: string;
}

export interface SEOPerformanceReport {
  url: string;
  timestamp: Date;
  metrics: PerformanceMetrics;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  score: number;
  coreWebVitals: {
    lcp: 'good' | 'needs-improvement' | 'poor';
    fid: 'good' | 'needs-improvement' | 'poor';
    cls: 'good' | 'needs-improvement' | 'poor';
  };
  optimizations: PerformanceOptimization[];
  resources: ResourceAnalysis[];
  summary: PerformanceSummary;
}

export interface PerformanceSummary {
  totalOptimizations: number;
  highImpactOptimizations: number;
  potentialSpeedGain: number;
  potentialSEOGain: number;
  criticalIssues: string[];
  quickWins: string[];
}

// Performance thresholds (based on Google recommendations)
export const PERFORMANCE_THRESHOLDS = {
  lcp: { good: 2500, poor: 4000 },
  fid: { good: 100, poor: 300 },
  cls: { good: 0.1, poor: 0.25 },
  fcp: { good: 1800, poor: 3000 },
  tti: { good: 3800, poor: 7300 },
  tbt: { good: 200, poor: 600 },
};

/**
 * Performance Optimizer Service
 */
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private performanceObserver: PerformanceObserver | null = null;
  private metrics: PerformanceMetrics | null = null;

  private constructor() {
    this.initializePerformanceObserver();
  }

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  /**
   * Analyze page performance
   */
  async analyzePerformance(url?: string): Promise<SEOPerformanceReport> {
    const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const metrics = await this.collectMetrics();
    const grade = this.calculateGrade(metrics);
    const score = this.calculateScore(metrics);
    const coreWebVitals = this.assessCoreWebVitals(metrics);
    const resources = await this.analyzeResources();
    const optimizations = this.generateOptimizations(metrics, resources);
    const summary = this.generateSummary(optimizations, metrics);

    return {
      url: currentUrl,
      timestamp: new Date(),
      metrics,
      grade,
      score,
      coreWebVitals,
      optimizations,
      resources,
      summary,
    };
  }

  /**
   * Monitor performance continuously
   */
  startMonitoring(callback: (metrics: PerformanceMetrics) => void): void {
    if (typeof window === 'undefined') return;

    // Monitor every 5 seconds
    setInterval(async () => {
      const metrics = await this.collectMetrics();
      callback(metrics);
    }, 5000);
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }
  }

  /**
   * Get current performance snapshot
   */
  async getPerformanceSnapshot(): Promise<PerformanceMetrics> {
    return this.collectMetrics();
  }

  /**
   * Generate performance optimization plan
   */
  generateOptimizationPlan(report: SEOPerformanceReport): string {
    let plan = '# Performance Optimization Plan\n\n';

    // Executive Summary
    plan += `## Executive Summary\n`;
    plan += `- **Current Grade**: ${report.grade} (${report.score}/100)\n`;
    plan += `- **Core Web Vitals**: LCP ${this.getVitalStatus(report.coreWebVitals.lcp)}, FID ${this.getVitalStatus(report.coreWebVitals.fid)}, CLS ${this.getVitalStatus(report.coreWebVitals.cls)}\n`;
    plan += `- **Optimization Opportunities**: ${report.optimizations.length}\n`;
    plan += `- **Potential Speed Gain**: ${report.summary.potentialSpeedGain.toFixed(1)}s\n`;
    plan += `- **Potential SEO Gain**: +${report.summary.potentialSEOGain} points\n\n`;

    // Critical Issues
    if (report.summary.criticalIssues.length > 0) {
      plan += `## 🚨 Critical Issues (Fix Immediately)\n\n`;
      report.summary.criticalIssues.forEach((issue, index) => {
        plan += `${index + 1}. ${issue}\n`;
      });
      plan += '\n';
    }

    // Quick Wins
    if (report.summary.quickWins.length > 0) {
      plan += `## ⚡ Quick Wins (Easy Implementation)\n\n`;
      report.summary.quickWins.forEach((win, index) => {
        plan += `${index + 1}. ${win}\n`;
      });
      plan += '\n';
    }

    // High Impact Optimizations
    const highImpactOptimizations = report.optimizations.filter(opt => opt.impact === 'high');
    if (highImpactOptimizations.length > 0) {
      plan += `## 🎯 High Impact Optimizations\n\n`;
      highImpactOptimizations.forEach((opt, index) => {
        plan += `### ${index + 1}. ${opt.title}\n`;
        plan += `**Impact**: ${opt.impact.toUpperCase()} | **Effort**: ${opt.effort}\n\n`;
        plan += `**Description**: ${opt.description}\n\n`;
        plan += `**Recommendation**: ${opt.recommendation}\n\n`;
        
        if (opt.implementation.length > 0) {
          plan += `**Implementation Steps**:\n`;
          opt.implementation.forEach((step, stepIndex) => {
            plan += `${stepIndex + 1}. ${step}\n`;
          });
          plan += '\n';
        }

        if (opt.expectedImprovement) {
          plan += `**Expected Improvements**:\n`;
          if (opt.expectedImprovement.lcp) plan += `- LCP: -${opt.expectedImprovement.lcp}ms\n`;
          if (opt.expectedImprovement.fid) plan += `- FID: -${opt.expectedImprovement.fid}ms\n`;
          if (opt.expectedImprovement.cls) plan += `- CLS: -${opt.expectedImprovement.cls.toFixed(3)}\n`;
          if (opt.expectedImprovement.seoScore) plan += `- SEO Score: +${opt.expectedImprovement.seoScore} points\n`;
          plan += '\n';
        }
      });
    }

    // Resource Optimization
    const problematicResources = report.resources.filter(r => r.issues.length > 0);
    if (problematicResources.length > 0) {
      plan += `## 📦 Resource Optimization\n\n`;
      
      const categories = ['image', 'script', 'stylesheet', 'font'] as const;
      categories.forEach(category => {
        const categoryResources = problematicResources.filter(r => r.type === category);
        if (categoryResources.length > 0) {
          plan += `### ${category.charAt(0).toUpperCase() + category.slice(1)}s\n\n`;
          categoryResources.forEach(resource => {
            plan += `**${resource.url}** (${(resource.size / 1024).toFixed(1)}KB)\n`;
            resource.issues.forEach(issue => {
              plan += `- ${issue.description}\n`;
            });
            plan += '\n';
          });
        }
      });
    }

    // Timeline and Priorities
    plan += `## 📅 Implementation Timeline\n\n`;
    plan += `### Week 1: Critical Issues\n`;
    report.summary.criticalIssues.slice(0, 3).forEach((issue) => {
      plan += `- ${issue}\n`;
    });
    plan += '\n';

    plan += `### Week 2: Quick Wins\n`;
    report.summary.quickWins.slice(0, 5).forEach((win) => {
      plan += `- ${win}\n`;
    });
    plan += '\n';

    plan += `### Week 3-4: High Impact Optimizations\n`;
    highImpactOptimizations.slice(0, 3).forEach((opt) => {
      plan += `- ${opt.title}\n`;
    });
    plan += '\n';

    return plan;
  }

  /**
   * Private methods
   */
  private initializePerformanceObserver(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        // Process performance entries
        const entries = list.getEntries();
        entries.forEach(entry => {
          // Handle different entry types
          if (entry.entryType === 'largest-contentful-paint') {
            // Update LCP metric
          } else if (entry.entryType === 'first-input') {
            // Update FID metric
          } else if (entry.entryType === 'layout-shift') {
            // Update CLS metric
          }
        });
      });

      this.performanceObserver.observe({ 
        entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift', 'navigation', 'resource'] 
      });
    } catch {
      console.warn('Performance Observer not supported or failed to initialize');
    }
  }

  private async collectMetrics(): Promise<PerformanceMetrics> {
    const metrics: PerformanceMetrics = {
      largestContentfulPaint: 0,
      firstInputDelay: 0,
      cumulativeLayoutShift: 0,
      firstContentfulPaint: 0,
      timeToInteractive: 0,
      totalBlockingTime: 0,
      domContentLoaded: 0,
      loadComplete: 0,
      serverResponseTime: 0,
      resourceCount: 0,
      totalResourceSize: 0,
      compressedResourceSize: 0,
      imageCount: 0,
      scriptCount: 0,
      stylesheetCount: 0,
      seoImpactScore: 0,
      grade: 'F',
    };

    if (typeof window === 'undefined') {
      return metrics;
    }

    // Get navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
      metrics.loadComplete = navigation.loadEventEnd - navigation.loadEventStart;
      metrics.serverResponseTime = navigation.responseEnd - navigation.requestStart;
    }

    // Get paint timing
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    if (fcp) {
      metrics.firstContentfulPaint = fcp.startTime;
    }

    // Get LCP
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    if (lcpEntries.length > 0) {
      const lcp = lcpEntries[lcpEntries.length - 1];
      metrics.largestContentfulPaint = lcp.startTime;
    }

    // Get resource information
    const resources = performance.getEntriesByType('resource');
    metrics.resourceCount = resources.length;
    
    let totalSize = 0;
    let compressedSize = 0;
    let imageCount = 0;
    let scriptCount = 0;
    let stylesheetCount = 0;

    resources.forEach(resource => {
      const resourceEntry = resource as PerformanceResourceTiming;
      if (resourceEntry.transferSize) {
        totalSize += resourceEntry.transferSize;
        compressedSize += resourceEntry.encodedBodySize || resourceEntry.transferSize;
      }

      if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        imageCount++;
      } else if (resource.name.match(/\.js$/i)) {
        scriptCount++;
      } else if (resource.name.match(/\.css$/i)) {
        stylesheetCount++;
      }
    });

    metrics.totalResourceSize = totalSize;
    metrics.compressedResourceSize = compressedSize;
    metrics.imageCount = imageCount;
    metrics.scriptCount = scriptCount;
    metrics.stylesheetCount = stylesheetCount;

    // Calculate SEO impact score
    metrics.seoImpactScore = this.calculateSEOImpactScore(metrics);
    metrics.grade = this.calculateGrade(metrics);

    this.metrics = metrics;
    return metrics;
  }

  private calculateSEOImpactScore(metrics: PerformanceMetrics): number {
    let score = 100;

    // LCP impact (30% of score)
    if (metrics.largestContentfulPaint > PERFORMANCE_THRESHOLDS.lcp.poor) {
      score -= 30;
    } else if (metrics.largestContentfulPaint > PERFORMANCE_THRESHOLDS.lcp.good) {
      score -= 15;
    }

    // FID impact (25% of score)
    if (metrics.firstInputDelay > PERFORMANCE_THRESHOLDS.fid.poor) {
      score -= 25;
    } else if (metrics.firstInputDelay > PERFORMANCE_THRESHOLDS.fid.good) {
      score -= 12;
    }

    // CLS impact (25% of score)
    if (metrics.cumulativeLayoutShift > PERFORMANCE_THRESHOLDS.cls.poor) {
      score -= 25;
    } else if (metrics.cumulativeLayoutShift > PERFORMANCE_THRESHOLDS.cls.good) {
      score -= 12;
    }

    // FCP impact (20% of score)
    if (metrics.firstContentfulPaint > PERFORMANCE_THRESHOLDS.fcp.poor) {
      score -= 20;
    } else if (metrics.firstContentfulPaint > PERFORMANCE_THRESHOLDS.fcp.good) {
      score -= 10;
    }

    return Math.max(0, score);
  }

  private calculateGrade(metrics: PerformanceMetrics): 'A' | 'B' | 'C' | 'D' | 'F' {
    const score = metrics.seoImpactScore || this.calculateSEOImpactScore(metrics);
    
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  private calculateScore(metrics: PerformanceMetrics): number {
    return metrics.seoImpactScore || this.calculateSEOImpactScore(metrics);
  }

  private assessCoreWebVitals(metrics: PerformanceMetrics): SEOPerformanceReport['coreWebVitals'] {
    return {
      lcp: metrics.largestContentfulPaint <= PERFORMANCE_THRESHOLDS.lcp.good ? 'good' :
           metrics.largestContentfulPaint <= PERFORMANCE_THRESHOLDS.lcp.poor ? 'needs-improvement' : 'poor',
      fid: metrics.firstInputDelay <= PERFORMANCE_THRESHOLDS.fid.good ? 'good' :
           metrics.firstInputDelay <= PERFORMANCE_THRESHOLDS.fid.poor ? 'needs-improvement' : 'poor',
      cls: metrics.cumulativeLayoutShift <= PERFORMANCE_THRESHOLDS.cls.good ? 'good' :
           metrics.cumulativeLayoutShift <= PERFORMANCE_THRESHOLDS.cls.poor ? 'needs-improvement' : 'poor',
    };
  }

  private async analyzeResources(): Promise<ResourceAnalysis[]> {
    const analyses: ResourceAnalysis[] = [];

    if (typeof window === 'undefined') {
      return analyses;
    }

    const resources = performance.getEntriesByType('resource');
    
    resources.forEach(resource => {
      const resourceEntry = resource as PerformanceResourceTiming;
      const analysis: ResourceAnalysis = {
        url: resource.name,
        type: this.getResourceType(resource.name),
        size: resourceEntry.transferSize || 0,
        compressed: (resourceEntry.encodedBodySize || 0) < (resourceEntry.decodedBodySize || 0),
        cached: resourceEntry.transferSize === 0,
        critical: this.isCriticalResource(resource.name),
        loadTime: resourceEntry.responseEnd - resourceEntry.requestStart,
        issues: [],
        optimization: [],
      };

      // Identify issues
      this.identifyResourceIssues(analysis);
      
      // Generate optimizations
      this.generateResourceOptimizations(analysis);

      analyses.push(analysis);
    });

    return analyses;
  }

  private generateOptimizations(metrics: PerformanceMetrics, resources: ResourceAnalysis[]): PerformanceOptimization[] {
    const optimizations: PerformanceOptimization[] = [];

    // Image optimizations
    const images = resources.filter(r => r.type === 'image');
    const largeImages = images.filter(img => img.size > 100000); // > 100KB
    
    if (largeImages.length > 0) {
      optimizations.push({
        category: 'images',
        title: 'Optimize Large Images',
        description: `${largeImages.length} images are larger than 100KB`,
        impact: 'high',
        effort: 'easy',
        recommendation: 'Compress images and use modern formats (WebP, AVIF)',
        expectedImprovement: {
          lcp: 1500,
          seoScore: 15,
        },
        implementation: [
          'Compress images using tools like ImageOptim or TinyPNG',
          'Convert images to WebP format',
          'Implement responsive images with srcset',
          'Use lazy loading for below-the-fold images',
        ],
        resources: ['https://web.dev/optimize-lcp/', 'https://web.dev/serve-images-webp/'],
      });
    }

    // Script optimizations
    const scripts = resources.filter(r => r.type === 'script');
    const largeScripts = scripts.filter(script => script.size > 50000); // > 50KB
    
    if (largeScripts.length > 0) {
      optimizations.push({
        category: 'scripts',
        title: 'Optimize JavaScript Bundles',
        description: `${largeScripts.length} JavaScript files are larger than 50KB`,
        impact: 'high',
        effort: 'moderate',
        recommendation: 'Split code and implement tree shaking',
        expectedImprovement: {
          fid: 200,
          tbt: 300,
          seoScore: 12,
        },
        implementation: [
          'Implement code splitting with dynamic imports',
          'Enable tree shaking in bundler',
          'Remove unused dependencies',
          'Use async/defer for non-critical scripts',
        ],
        resources: ['https://web.dev/reduce-javascript-payloads-with-code-splitting/'],
      });
    }

    // CSS optimizations
    const stylesheets = resources.filter(r => r.type === 'stylesheet');
    if (stylesheets.length > 3) {
      optimizations.push({
        category: 'styles',
        title: 'Optimize CSS Delivery',
        description: `${stylesheets.length} CSS files may block rendering`,
        impact: 'medium',
        effort: 'moderate',
        recommendation: 'Inline critical CSS and defer non-critical styles',
        expectedImprovement: {
          fcp: 800,
          lcp: 1000,
          seoScore: 10,
        },
        implementation: [
          'Extract and inline critical CSS',
          'Load non-critical CSS asynchronously',
          'Concatenate CSS files',
          'Remove unused CSS',
        ],
        resources: ['https://web.dev/extract-critical-css/'],
      });
    }

    // Server response optimization
    if (metrics.serverResponseTime > 600) {
      optimizations.push({
        category: 'server',
        title: 'Improve Server Response Time',
        description: `Server response time is ${metrics.serverResponseTime}ms (should be < 600ms)`,
        impact: 'high',
        effort: 'complex',
        recommendation: 'Optimize server performance and implement caching',
        expectedImprovement: {
          fcp: 500,
          lcp: 800,
          seoScore: 18,
        },
        implementation: [
          'Implement server-side caching',
          'Optimize database queries',
          'Use CDN for static assets',
          'Enable gzip compression',
        ],
        resources: ['https://web.dev/ttfb/'],
      });
    }

    // Caching optimization
    const uncachedResources = resources.filter(r => !r.cached && r.type !== 'other');
    if (uncachedResources.length > 0) {
      optimizations.push({
        category: 'caching',
        title: 'Implement Resource Caching',
        description: `${uncachedResources.length} resources are not cached`,
        impact: 'medium',
        effort: 'easy',
        recommendation: 'Add appropriate cache headers for static resources',
        expectedImprovement: {
          fcp: 300,
          lcp: 500,
          seoScore: 8,
        },
        implementation: [
          'Set Cache-Control headers for static assets',
          'Implement service worker for offline caching',
          'Use browser caching for repeat visits',
        ],
        resources: ['https://web.dev/http-cache/'],
      });
    }

    return optimizations.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 };
      return impactOrder[b.impact] - impactOrder[a.impact];
    });
  }

  private generateSummary(optimizations: PerformanceOptimization[], metrics: PerformanceMetrics): PerformanceSummary {
    const highImpactOptimizations = optimizations.filter(opt => opt.impact === 'high');
    const quickWins = optimizations.filter(opt => opt.effort === 'easy');
    
    const potentialSpeedGain = optimizations.reduce((sum, opt) => {
      return sum + (opt.expectedImprovement.lcp || 0) + (opt.expectedImprovement.fcp || 0);
    }, 0) / 1000; // Convert to seconds

    const potentialSEOGain = optimizations.reduce((sum, opt) => {
      return sum + (opt.expectedImprovement.seoScore || 0);
    }, 0);

    const criticalIssues: string[] = [];
    if (metrics.largestContentfulPaint > PERFORMANCE_THRESHOLDS.lcp.poor) {
      criticalIssues.push('Largest Contentful Paint is too slow (>4s)');
    }
    if (metrics.firstInputDelay > PERFORMANCE_THRESHOLDS.fid.poor) {
      criticalIssues.push('First Input Delay is too high (>300ms)');
    }
    if (metrics.cumulativeLayoutShift > PERFORMANCE_THRESHOLDS.cls.poor) {
      criticalIssues.push('Cumulative Layout Shift causes poor UX (>0.25)');
    }

    const quickWinTitles = quickWins.map(qw => qw.title);

    return {
      totalOptimizations: optimizations.length,
      highImpactOptimizations: highImpactOptimizations.length,
      potentialSpeedGain,
      potentialSEOGain,
      criticalIssues,
      quickWins: quickWinTitles,
    };
  }

  private getResourceType(url: string): ResourceAnalysis['type'] {
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image';
    if (url.match(/\.js$/i)) return 'script';
    if (url.match(/\.css$/i)) return 'stylesheet';
    if (url.match(/\.(woff|woff2|ttf|eot)$/i)) return 'font';
    return 'other';
  }

  private isCriticalResource(url: string): boolean {
    // Consider resources critical if they're likely above-the-fold
    return url.includes('critical') || url.includes('above-fold') || url.match(/\.(css)$/i) !== null;
  }

  private identifyResourceIssues(analysis: ResourceAnalysis): void {
    // Check if oversized
    const sizeThresholds = {
      image: 100000, // 100KB
      script: 50000,  // 50KB
      stylesheet: 25000, // 25KB
      font: 100000,   // 100KB
      other: 25000,   // 25KB
    };

    if (analysis.size > sizeThresholds[analysis.type]) {
      analysis.issues.push({
        type: 'oversized',
        severity: 'high',
        description: `Resource is ${(analysis.size / 1024).toFixed(1)}KB (recommended < ${(sizeThresholds[analysis.type] / 1024).toFixed(1)}KB)`,
        impact: 'Slows down page loading and affects Core Web Vitals',
      });
    }

    // Check compression
    if (!analysis.compressed && analysis.size > 10000) {
      analysis.issues.push({
        type: 'uncompressed',
        severity: 'medium',
        description: 'Resource is not compressed',
        impact: 'Increases bandwidth usage and loading time',
      });
    }

    // Check caching
    if (!analysis.cached && analysis.type !== 'other') {
      analysis.issues.push({
        type: 'uncached',
        severity: 'medium',
        description: 'Resource is not cached',
        impact: 'Increases loading time for repeat visits',
      });
    }

    // Check for render-blocking
    if ((analysis.type === 'stylesheet' || analysis.type === 'script') && analysis.critical) {
      analysis.issues.push({
        type: 'render-blocking',
        severity: 'high',
        description: 'Resource blocks page rendering',
        impact: 'Delays First Contentful Paint and Largest Contentful Paint',
      });
    }
  }

  private generateResourceOptimizations(analysis: ResourceAnalysis): void {
    analysis.issues.forEach(issue => {
      switch (issue.type) {
        case 'oversized':
          if (analysis.type === 'image') {
            analysis.optimization.push({
              action: 'Compress and optimize image',
              description: 'Reduce image size through compression and format optimization',
              expectedSavings: analysis.size * 0.6, // 60% reduction
              implementation: 'Use image optimization tools and modern formats (WebP, AVIF)',
            });
          } else if (analysis.type === 'script') {
            analysis.optimization.push({
              action: 'Minify and split JavaScript',
              description: 'Reduce script size and implement code splitting',
              expectedSavings: analysis.size * 0.3, // 30% reduction
              implementation: 'Enable minification and tree shaking in build process',
            });
          }
          break;

        case 'uncompressed':
          analysis.optimization.push({
            action: 'Enable compression',
            description: 'Compress resource using gzip or brotli',
            expectedSavings: analysis.size * 0.7, // 70% reduction
            implementation: 'Configure server to compress resources',
          });
          break;

        case 'uncached':
          analysis.optimization.push({
            action: 'Add caching headers',
            description: 'Implement browser caching for resource',
            expectedSavings: analysis.size, // Full savings on repeat visits
            implementation: 'Set appropriate Cache-Control headers',
          });
          break;

        case 'render-blocking':
          analysis.optimization.push({
            action: 'Load asynchronously',
            description: 'Load resource without blocking page rendering',
            expectedSavings: 0, // No size savings but timing improvement
            implementation: 'Use async/defer attributes or load programmatically',
          });
          break;
      }
    });
  }

  private getVitalStatus(status: 'good' | 'needs-improvement' | 'poor'): string {
    const statusEmojis = {
      good: '✅ Good',
      'needs-improvement': '⚠️ Needs Improvement',
      poor: '❌ Poor',
    };
    return statusEmojis[status];
  }
}

// Export singleton instance
export const performanceOptimizer = PerformanceOptimizer.getInstance();

export default PerformanceOptimizer;