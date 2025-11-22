/**
 * Keywords Analyzer for Vardhman Mills Frontend
 * SEO keyword analysis and optimization recommendations
 */

// Keyword analysis interfaces
export interface KeywordAnalysis {
  keyword: string;
  density: number;
  frequency: number;
  positions: number[];
  prominence: number;
  context: KeywordContext[];
  difficulty: 'low' | 'medium' | 'high';
  opportunity: number;
  recommendations: string[];
}

export interface KeywordContext {
  location: 'title' | 'heading' | 'meta-description' | 'content' | 'alt-text' | 'url';
  text: string;
  position: number;
  importance: number;
}

export interface KeywordGroup {
  primaryKeyword: string;
  relatedKeywords: string[];
  semanticKeywords: string[];
  longtailKeywords: string[];
  totalVolume: number;
  competitiveness: number;
}

export interface ContentAnalysis {
  wordCount: number;
  readabilityScore: number;
  keywordDensities: Record<string, number>;
  topKeywords: KeywordAnalysis[];
  keywordGroups: KeywordGroup[];
  suggestions: KeywordSuggestion[];
  overOptimization: OverOptimizationWarning[];
}

export interface KeywordSuggestion {
  keyword: string;
  reason: string;
  expectedBenefit: string;
  implementation: string;
  priority: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'moderate' | 'hard';
}

export interface OverOptimizationWarning {
  keyword: string;
  currentDensity: number;
  recommendedDensity: number;
  impact: string;
  solution: string;
}

export interface CompetitorAnalysis {
  competitor: string;
  keywords: string[];
  gaps: string[];
  opportunities: string[];
  strengths: string[];
  weaknesses: string[];
}

export interface KeywordStrategy {
  primaryKeywords: string[];
  secondaryKeywords: string[];
  longtailKeywords: string[];
  contentGaps: string[];
  recommendations: StrategyRecommendation[];
}

export interface StrategyRecommendation {
  type: 'content' | 'technical' | 'link-building' | 'on-page';
  title: string;
  description: string;
  keywords: string[];
  priority: number;
  estimatedROI: number;
}

// Keyword constants
export const STOP_WORDS = [
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'will', 'with', 'would', 'have', 'had', 'been', 'do',
  'does', 'did', 'can', 'could', 'should', 'may', 'might', 'must',
  'shall', 'this', 'these', 'those', 'they', 'them', 'their', 'there',
  'where', 'when', 'what', 'which', 'who', 'how', 'why', 'if', 'or',
  'but', 'not', 'no', 'yes', 'so', 'too', 'very', 'just', 'now',
  'then', 'than', 'only', 'also', 'up', 'out', 'down', 'over', 'under',
];

export const KEYWORD_DENSITY_LIMITS = {
  primary: { min: 1.0, max: 3.0 },
  secondary: { min: 0.5, max: 2.0 },
  longtail: { min: 0.1, max: 1.0 },
};

export const TEXTILE_KEYWORDS = [
  'textile', 'fabric', 'yarn', 'cotton', 'polyester', 'silk', 'wool',
  'fiber', 'thread', 'weaving', 'knitting', 'dyeing', 'printing',
  'manufacturing', 'industrial', 'quality', 'sustainable', 'organic',
  'mills', 'production', 'export', 'garment', 'apparel', 'fashion',
];

/**
 * Keywords Analyzer Service
 */
export class KeywordsAnalyzer {
  private static instance: KeywordsAnalyzer;

  private constructor() {}

  static getInstance(): KeywordsAnalyzer {
    if (!KeywordsAnalyzer.instance) {
      KeywordsAnalyzer.instance = new KeywordsAnalyzer();
    }
    return KeywordsAnalyzer.instance;
  }

  /**
   * Analyze content for keywords
   */
  analyzeContent(content: string, targetKeywords?: string[]): ContentAnalysis {
    const text = this.cleanText(content);
    const words = this.extractWords(text);
    const wordCount = words.length;

    // Calculate keyword densities
    const keywordDensities = this.calculateKeywordDensities(words);
    
    // Analyze top keywords
    const topKeywords = this.analyzeTopKeywords(content, keywordDensities, targetKeywords);
    
    // Group related keywords
    const keywordGroups = this.groupKeywords(topKeywords);
    
    // Generate suggestions
    const suggestions = this.generateKeywordSuggestions(content, topKeywords, targetKeywords);
    
    // Check for over-optimization
    const overOptimization = this.checkOverOptimization(keywordDensities, targetKeywords);
    
    // Calculate readability
    const readabilityScore = this.calculateReadabilityScore(content);

    return {
      wordCount,
      readabilityScore,
      keywordDensities,
      topKeywords,
      keywordGroups,
      suggestions,
      overOptimization,
    };
  }

  /**
   * Analyze specific keyword
   */
  analyzeKeyword(content: string, keyword: string): KeywordAnalysis {
    const text = this.cleanText(content);
    const words = this.extractWords(text);
    const keywordWords = keyword.toLowerCase().split(' ');
    
    let frequency = 0;
    const positions: number[] = [];
    const context: KeywordContext[] = [];

    // Find exact matches
    if (keywordWords.length === 1) {
      words.forEach((word, index) => {
        if (word.toLowerCase() === keyword.toLowerCase()) {
          frequency++;
          positions.push(index);
        }
      });
    } else {
      // Multi-word keyword matching
      for (let i = 0; i <= words.length - keywordWords.length; i++) {
        const slice = words.slice(i, i + keywordWords.length);
        if (slice.map(w => w.toLowerCase()).join(' ') === keyword.toLowerCase()) {
          frequency++;
          positions.push(i);
        }
      }
    }

    // Calculate density
    const density = (frequency / words.length) * 100;

    // Analyze context
    this.analyzeKeywordContext(content, keyword, context);

    // Calculate prominence
    const prominence = this.calculateKeywordProminence(keyword, context);

    // Determine difficulty and opportunity
    const difficulty = this.assessKeywordDifficulty(keyword);
    const opportunity = this.calculateKeywordOpportunity(keyword, density, prominence);

    // Generate recommendations
    const recommendations = this.generateKeywordRecommendations(keyword, density, prominence, context);

    return {
      keyword,
      density,
      frequency,
      positions,
      prominence,
      context,
      difficulty,
      opportunity,
      recommendations,
    };
  }

  /**
   * Generate keyword strategy
   */
  generateKeywordStrategy(content: string, businessType: string = 'textile'): KeywordStrategy {
    const analysis = this.analyzeContent(content);
    const industryKeywords = this.getIndustryKeywords(businessType);
    
    // Categorize keywords
    const primaryKeywords = analysis.topKeywords
      .filter(k => k.density >= KEYWORD_DENSITY_LIMITS.primary.min)
      .slice(0, 3)
      .map(k => k.keyword);

    const secondaryKeywords = analysis.topKeywords
      .filter(k => k.density >= KEYWORD_DENSITY_LIMITS.secondary.min && k.density < KEYWORD_DENSITY_LIMITS.primary.min)
      .slice(0, 5)
      .map(k => k.keyword);

    const longtailKeywords = this.generateLongtailKeywords(primaryKeywords, industryKeywords);
    
    // Identify content gaps
    const contentGaps = this.identifyContentGaps(analysis, industryKeywords);
    
    // Generate strategy recommendations
    const recommendations = this.generateStrategyRecommendations(
      primaryKeywords,
      secondaryKeywords,
      longtailKeywords,
      contentGaps
    );

    return {
      primaryKeywords,
      secondaryKeywords,
      longtailKeywords,
      contentGaps,
      recommendations,
    };
  }

  /**
   * Compare with competitors
   */
  analyzeCompetitors(content: string, competitorContents: Array<{ name: string; content: string }>): CompetitorAnalysis[] {
    const ourAnalysis = this.analyzeContent(content);
    const ourKeywords = ourAnalysis.topKeywords.map(k => k.keyword);

    return competitorContents.map(competitor => {
      const competitorAnalysis = this.analyzeContent(competitor.content);
      const competitorKeywords = competitorAnalysis.topKeywords.map(k => k.keyword);

      // Find gaps (keywords they have but we don't)
      const gaps = competitorKeywords.filter(keyword => !ourKeywords.includes(keyword));

      // Find opportunities (keywords we could target better)
      const opportunities = competitorKeywords.filter(keyword => {
        const ourKeyword = ourAnalysis.topKeywords.find(k => k.keyword === keyword);
        const theirKeyword = competitorAnalysis.topKeywords.find(k => k.keyword === keyword);
        return ourKeyword && theirKeyword && ourKeyword.density < theirKeyword.density;
      });

      // Find our strengths
      const strengths = ourKeywords.filter(keyword => {
        const ourKeyword = ourAnalysis.topKeywords.find(k => k.keyword === keyword);
        const theirKeyword = competitorAnalysis.topKeywords.find(k => k.keyword === keyword);
        return ourKeyword && (!theirKeyword || ourKeyword.density > theirKeyword.density);
      });

      // Find weaknesses
      const weaknesses = gaps.slice(0, 5); // Top 5 gaps as weaknesses

      return {
        competitor: competitor.name,
        keywords: competitorKeywords,
        gaps,
        opportunities,
        strengths,
        weaknesses,
      };
    });
  }

  /**
   * Generate keyword report
   */
  generateKeywordReport(analysis: ContentAnalysis): string {
    let report = '# Keyword Analysis Report\n\n';

    // Summary
    report += `## Summary\n`;
    report += `- **Word Count**: ${analysis.wordCount}\n`;
    report += `- **Readability Score**: ${analysis.readabilityScore}/100\n`;
    report += `- **Top Keywords**: ${analysis.topKeywords.length}\n`;
    report += `- **Keyword Groups**: ${analysis.keywordGroups.length}\n\n`;

    // Top Keywords
    if (analysis.topKeywords.length > 0) {
      report += `## Top Keywords\n\n`;
      report += `| Keyword | Density | Frequency | Prominence | Difficulty |\n`;
      report += `|---------|---------|-----------|------------|------------|\n`;
      
      analysis.topKeywords.slice(0, 10).forEach(keyword => {
        report += `| ${keyword.keyword} | ${keyword.density.toFixed(2)}% | ${keyword.frequency} | ${keyword.prominence.toFixed(2)} | ${keyword.difficulty} |\n`;
      });
      report += '\n';
    }

    // Keyword Groups
    if (analysis.keywordGroups.length > 0) {
      report += `## Keyword Groups\n\n`;
      analysis.keywordGroups.forEach((group, index) => {
        report += `### Group ${index + 1}: ${group.primaryKeyword}\n`;
        report += `- **Related**: ${group.relatedKeywords.join(', ')}\n`;
        report += `- **Semantic**: ${group.semanticKeywords.join(', ')}\n`;
        report += `- **Long-tail**: ${group.longtailKeywords.join(', ')}\n\n`;
      });
    }

    // Over-optimization Warnings
    if (analysis.overOptimization.length > 0) {
      report += `## ⚠️ Over-optimization Warnings\n\n`;
      analysis.overOptimization.forEach(warning => {
        report += `### ${warning.keyword}\n`;
        report += `- **Current Density**: ${warning.currentDensity.toFixed(2)}%\n`;
        report += `- **Recommended**: ${warning.recommendedDensity.toFixed(2)}%\n`;
        report += `- **Impact**: ${warning.impact}\n`;
        report += `- **Solution**: ${warning.solution}\n\n`;
      });
    }

    // Suggestions
    if (analysis.suggestions.length > 0) {
      report += `## 💡 Recommendations\n\n`;
      analysis.suggestions
        .sort((a, b) => (a.priority === 'high' ? -1 : b.priority === 'high' ? 1 : 0))
        .forEach(suggestion => {
          report += `### ${suggestion.keyword} (${suggestion.priority.toUpperCase()} Priority)\n`;
          report += `- **Reason**: ${suggestion.reason}\n`;
          report += `- **Expected Benefit**: ${suggestion.expectedBenefit}\n`;
          report += `- **Implementation**: ${suggestion.implementation}\n`;
          report += `- **Difficulty**: ${suggestion.difficulty}\n\n`;
        });
    }

    return report;
  }

  /**
   * Private helper methods
   */
  private cleanText(text: string): string {
    // Remove HTML tags
    let cleaned = text.replace(/<[^>]*>/g, ' ');
    
    // Remove extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
  }

  private extractWords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !STOP_WORDS.includes(word));
  }

  private calculateKeywordDensities(words: string[]): Record<string, number> {
    const frequencies: Record<string, number> = {};
    const totalWords = words.length;

    words.forEach(word => {
      frequencies[word] = (frequencies[word] || 0) + 1;
    });

    const densities: Record<string, number> = {};
    Object.entries(frequencies).forEach(([word, freq]) => {
      densities[word] = (freq / totalWords) * 100;
    });

    return densities;
  }

  private analyzeTopKeywords(
    content: string,
    densities: Record<string, number>,
    targetKeywords?: string[]
  ): KeywordAnalysis[] {
    const keywords: KeywordAnalysis[] = [];

    // Sort by density
    const sortedKeywords = Object.entries(densities)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20);

    sortedKeywords.forEach(([keyword, density]) => {
      if (density >= 0.5) { // Only include keywords with reasonable density
        const analysis = this.analyzeKeyword(content, keyword);
        keywords.push(analysis);
      }
    });

    // Include target keywords even if low density
    if (targetKeywords) {
      targetKeywords.forEach(keyword => {
        if (!keywords.find(k => k.keyword.toLowerCase() === keyword.toLowerCase())) {
          const analysis = this.analyzeKeyword(content, keyword);
          keywords.push(analysis);
        }
      });
    }

    return keywords.sort((a, b) => b.density - a.density);
  }

  private groupKeywords(keywords: KeywordAnalysis[]): KeywordGroup[] {
    const groups: KeywordGroup[] = [];
    const used = new Set<string>();

    keywords.forEach(keyword => {
      if (used.has(keyword.keyword)) return;

      const relatedKeywords = keywords
        .filter(k => 
          k.keyword !== keyword.keyword && 
          !used.has(k.keyword) &&
          this.areKeywordsRelated(keyword.keyword, k.keyword)
        )
        .map(k => k.keyword);

      if (relatedKeywords.length > 0) {
        const semanticKeywords = this.findSemanticKeywords(keyword.keyword);
        const longtailKeywords = this.generateLongtailKeywords([keyword.keyword], TEXTILE_KEYWORDS)
          .slice(0, 3);

        groups.push({
          primaryKeyword: keyword.keyword,
          relatedKeywords,
          semanticKeywords,
          longtailKeywords,
          totalVolume: keyword.frequency + relatedKeywords.length,
          competitiveness: keyword.difficulty === 'high' ? 0.8 : keyword.difficulty === 'medium' ? 0.5 : 0.2,
        });

        used.add(keyword.keyword);
        relatedKeywords.forEach(k => used.add(k));
      }
    });

    return groups;
  }

  private generateKeywordSuggestions(
    content: string,
    keywords: KeywordAnalysis[],
    targetKeywords?: string[]
  ): KeywordSuggestion[] {
    const suggestions: KeywordSuggestion[] = [];
    const contentLower = content.toLowerCase();

    // Suggest missing industry keywords
    const industryKeywords = TEXTILE_KEYWORDS;
    const existingKeywords = keywords.map(k => k.keyword.toLowerCase());

    industryKeywords.forEach(keyword => {
      if (!existingKeywords.includes(keyword.toLowerCase()) && !contentLower.includes(keyword.toLowerCase())) {
        suggestions.push({
          keyword,
          reason: 'Important industry keyword missing from content',
          expectedBenefit: 'Improved relevance for textile industry searches',
          implementation: `Add "${keyword}" naturally in content, headings, or meta description`,
          priority: 'medium',
          difficulty: 'easy',
        });
      }
    });

    // Check target keywords usage
    if (targetKeywords) {
      targetKeywords.forEach(targetKeyword => {
        const existingAnalysis = keywords.find(k => k.keyword.toLowerCase() === targetKeyword.toLowerCase());
        if (!existingAnalysis || existingAnalysis.density < 1.0) {
          suggestions.push({
            keyword: targetKeyword,
            reason: 'Target keyword needs better optimization',
            expectedBenefit: 'Improved rankings for target keyword',
            implementation: `Increase usage of "${targetKeyword}" to 1-2% density`,
            priority: 'high',
            difficulty: 'easy',
          });
        }
      });
    }

    // Suggest long-tail opportunities
    keywords.slice(0, 3).forEach(keyword => {
      const longtail = `${keyword.keyword} ${industryKeywords[0]}`;
      suggestions.push({
        keyword: longtail,
        reason: 'Long-tail keyword opportunity for better targeting',
        expectedBenefit: 'Higher conversion rate with specific search intent',
        implementation: `Create content targeting "${longtail}"`,
        priority: 'high',
        difficulty: 'moderate',
      });
    });

    return suggestions.slice(0, 10);
  }

  private checkOverOptimization(
    densities: Record<string, number>,
    targetKeywords?: string[]
  ): OverOptimizationWarning[] {
    const warnings: OverOptimizationWarning[] = [];

    Object.entries(densities).forEach(([keyword, density]) => {
      let maxDensity = KEYWORD_DENSITY_LIMITS.secondary.max;
      
      if (targetKeywords?.includes(keyword)) {
        maxDensity = KEYWORD_DENSITY_LIMITS.primary.max;
      }

      if (density > maxDensity) {
        warnings.push({
          keyword,
          currentDensity: density,
          recommendedDensity: maxDensity,
          impact: 'May be flagged as keyword stuffing by search engines',
          solution: `Reduce usage of "${keyword}" and use synonyms or related terms`,
        });
      }
    });

    return warnings;
  }

  private calculateReadabilityScore(content: string): number {
    const text = this.cleanText(content);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = this.extractWords(text);
    const syllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0);

    if (sentences.length === 0 || words.length === 0) return 0;

    // Flesch Reading Ease formula
    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    
    const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    
    return Math.max(0, Math.min(100, score));
  }

  private countSyllables(word: string): number {
    if (word.length <= 3) return 1;
    
    let count = 0;
    const vowels = 'aeiouy';
    let previousWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const char = word[i].toLowerCase();
      const isVowel = vowels.includes(char);
      
      if (isVowel && !previousWasVowel) {
        count++;
      }
      
      previousWasVowel = isVowel;
    }
    
    // Handle silent 'e'
    if (word.endsWith('e')) {
      count--;
    }
    
    return Math.max(1, count);
  }

  private analyzeKeywordContext(content: string, keyword: string, context: KeywordContext[]): void {
    // const lowerContent = content.toLowerCase(); // Reserved for future use
    const lowerKeyword = keyword.toLowerCase();
    
    // Check title
    const titleMatch = content.match(/<title[^>]*>(.*?)<\/title>/i);
    if (titleMatch && titleMatch[1].toLowerCase().includes(lowerKeyword)) {
      context.push({
        location: 'title',
        text: titleMatch[1],
        position: titleMatch[1].toLowerCase().indexOf(lowerKeyword),
        importance: 10,
      });
    }

    // Check meta description
    const metaMatch = content.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
    if (metaMatch && metaMatch[1].toLowerCase().includes(lowerKeyword)) {
      context.push({
        location: 'meta-description',
        text: metaMatch[1],
        position: metaMatch[1].toLowerCase().indexOf(lowerKeyword),
        importance: 8,
      });
    }

    // Check headings
    const headingMatches = content.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi);
    if (headingMatches) {
      headingMatches.forEach(heading => {
        if (heading.toLowerCase().includes(lowerKeyword)) {
          const text = heading.replace(/<[^>]*>/g, '');
          context.push({
            location: 'heading',
            text,
            position: text.toLowerCase().indexOf(lowerKeyword),
            importance: 7,
          });
        }
      });
    }

    // Check alt text
    const altMatches = content.match(/alt="([^"]*)"/gi);
    if (altMatches) {
      altMatches.forEach(alt => {
        if (alt.toLowerCase().includes(lowerKeyword)) {
          const text = alt.replace(/alt="/gi, '').replace('"', '');
          context.push({
            location: 'alt-text',
            text,
            position: text.toLowerCase().indexOf(lowerKeyword),
            importance: 5,
          });
        }
      });
    }
  }

  private calculateKeywordProminence(keyword: string, context: KeywordContext[]): number {
    if (context.length === 0) return 0;

    const totalImportance = context.reduce((sum, ctx) => sum + ctx.importance, 0);
    const maxPossibleImportance = 10; // Title has highest importance

    return (totalImportance / (context.length * maxPossibleImportance)) * 100;
  }

  private assessKeywordDifficulty(keyword: string): 'low' | 'medium' | 'high' {
    // Simple heuristic based on keyword characteristics
    if (keyword.length > 15 || keyword.split(' ').length > 3) {
      return 'low'; // Long-tail keywords are easier
    }
    
    if (TEXTILE_KEYWORDS.includes(keyword.toLowerCase())) {
      return 'high'; // Industry keywords are competitive
    }
    
    return 'medium';
  }

  private calculateKeywordOpportunity(keyword: string, density: number, prominence: number): number {
    // Simple opportunity score based on current optimization
    const densityScore = Math.min(density / 2, 50); // Max 50 points for density
    const prominenceScore = prominence / 2; // Max 50 points for prominence
    
    return Math.round(densityScore + prominenceScore);
  }

  private generateKeywordRecommendations(
    keyword: string,
    density: number,
    prominence: number,
    context: KeywordContext[]
  ): string[] {
    const recommendations: string[] = [];

    if (density < KEYWORD_DENSITY_LIMITS.secondary.min) {
      recommendations.push(`Increase usage of "${keyword}" in content (current: ${density.toFixed(2)}%)`);
    }

    if (prominence < 30) {
      recommendations.push(`Add "${keyword}" to headings or meta description for better prominence`);
    }

    if (!context.find(c => c.location === 'title')) {
      recommendations.push(`Consider adding "${keyword}" to the page title`);
    }

    if (!context.find(c => c.location === 'meta-description')) {
      recommendations.push(`Include "${keyword}" in the meta description`);
    }

    if (density > KEYWORD_DENSITY_LIMITS.primary.max) {
      recommendations.push(`Reduce usage of "${keyword}" to avoid over-optimization (current: ${density.toFixed(2)}%)`);
    }

    return recommendations;
  }

  private getIndustryKeywords(businessType: string): string[] {
    switch (businessType.toLowerCase()) {
      case 'textile':
      case 'textiles':
        return TEXTILE_KEYWORDS;
      default:
        return TEXTILE_KEYWORDS;
    }
  }

  private generateLongtailKeywords(primaryKeywords: string[], industryKeywords: string[]): string[] {
    const longtail: string[] = [];
    
    primaryKeywords.forEach(primary => {
      industryKeywords.slice(0, 5).forEach(industry => {
        if (primary !== industry) {
          longtail.push(`${primary} ${industry}`);
          longtail.push(`${industry} ${primary}`);
        }
      });
    });

    return longtail.slice(0, 10);
  }

  private identifyContentGaps(analysis: ContentAnalysis, industryKeywords: string[]): string[] {
    const existingKeywords = analysis.topKeywords.map(k => k.keyword.toLowerCase());
    
    return industryKeywords.filter(keyword => 
      !existingKeywords.includes(keyword.toLowerCase())
    ).slice(0, 5);
  }

  private generateStrategyRecommendations(
    primaryKeywords: string[],
    secondaryKeywords: string[],
    longtailKeywords: string[],
    contentGaps: string[]
  ): StrategyRecommendation[] {
    const recommendations: StrategyRecommendation[] = [];

    // Content recommendations
    if (contentGaps.length > 0) {
      recommendations.push({
        type: 'content',
        title: 'Create Content for Missing Keywords',
        description: `Develop content targeting: ${contentGaps.join(', ')}`,
        keywords: contentGaps,
        priority: 8,
        estimatedROI: 70,
      });
    }

    // Long-tail content
    if (longtailKeywords.length > 0) {
      recommendations.push({
        type: 'content',
        title: 'Target Long-tail Keywords',
        description: `Create specific content for long-tail opportunities`,
        keywords: longtailKeywords.slice(0, 5),
        priority: 7,
        estimatedROI: 60,
      });
    }

    // On-page optimization
    if (primaryKeywords.length > 0) {
      recommendations.push({
        type: 'on-page',
        title: 'Optimize Primary Keywords',
        description: `Improve on-page optimization for main keywords`,
        keywords: primaryKeywords,
        priority: 9,
        estimatedROI: 80,
      });
    }

    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  private areKeywordsRelated(keyword1: string, keyword2: string): boolean {
    // Simple relatedness check based on common words
    const words1 = keyword1.toLowerCase().split(' ');
    const words2 = keyword2.toLowerCase().split(' ');
    
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length > 0;
  }

  private findSemanticKeywords(keyword: string): string[] {
    // Simple semantic keyword generation
    const semantic: string[] = [];
    
    if (keyword.includes('textile')) {
      semantic.push('fabric', 'cloth', 'material', 'fiber');
    }
    
    if (keyword.includes('cotton')) {
      semantic.push('organic cotton', 'cotton fabric', 'cotton yarn');
    }
    
    return semantic.slice(0, 3);
  }
}

// Export singleton instance
export const keywordsAnalyzer = KeywordsAnalyzer.getInstance();

export default KeywordsAnalyzer;