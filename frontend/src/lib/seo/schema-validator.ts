/**
 * SEO Schema Validator for Vardhman Mills Frontend
 * Validates and tests structured data schemas
 */

import { StructuredDataBase } from './structured-data';

// Extended interface for validation
interface ValidatableSchema extends StructuredDataBase {
  [key: string]: unknown;
  url?: string;
  brand?: string;
  sku?: string;
  keywords?: string | string[];
  wordCount?: number;
  logo?: string | { url: string; '@type': string };
  sameAs?: string[];
}

// Validation interfaces
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

export interface SchemaTestResult {
  schemaType: string;
  valid: boolean;
  richSnippetEligible: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  googleTestUrl?: string;
  structuredDataTestUrl?: string;
}

// Schema validation rules
export interface ValidationRules {
  required: string[];
  recommended: string[];
  deprecated: string[];
  typeValidation: Record<string, 'string' | 'number' | 'boolean' | 'object' | 'array'>;
  formatValidation: Record<string, RegExp>;
  enumValidation: Record<string, string[]>;
}

// Predefined validation rules for common schema types
export const SCHEMA_VALIDATION_RULES: Record<string, ValidationRules> = {
  Organization: {
    required: ['@type', 'name', 'url'],
    recommended: ['logo', 'address', 'contactPoint', 'sameAs'],
    deprecated: [],
    typeValidation: {
      name: 'string',
      url: 'string',
      telephone: 'string',
      email: 'string',
    },
    formatValidation: {
      url: /^https?:\/\/.+/,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      telephone: /^\+?[\d\s\-\(\)]+$/,
    },
    enumValidation: {
      '@type': ['Organization', 'Corporation', 'LocalBusiness'],
    },
  },
  Product: {
    required: ['@type', 'name', 'image', 'description'],
    recommended: ['brand', 'offers', 'aggregateRating', 'review'],
    deprecated: [],
    typeValidation: {
      name: 'string',
      description: 'string',
      image: 'array',
      offers: 'object',
    },
    formatValidation: {
      image: /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i,
    },
    enumValidation: {
      availability: ['InStock', 'OutOfStock', 'PreOrder', 'Discontinued'],
      itemCondition: ['NewCondition', 'UsedCondition', 'RefurbishedCondition'],
    },
  },
  Article: {
    required: ['@type', 'headline', 'author', 'datePublished', 'image'],
    recommended: ['publisher', 'dateModified', 'mainEntityOfPage'],
    deprecated: [],
    typeValidation: {
      headline: 'string',
      datePublished: 'string',
      dateModified: 'string',
      wordCount: 'number',
    },
    formatValidation: {
      datePublished: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
      dateModified: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
    },
    enumValidation: {
      '@type': ['Article', 'NewsArticle', 'BlogPosting', 'TechArticle'],
    },
  },
  WebSite: {
    required: ['@type', 'name', 'url'],
    recommended: ['potentialAction', 'publisher'],
    deprecated: [],
    typeValidation: {
      name: 'string',
      url: 'string',
    },
    formatValidation: {
      url: /^https?:\/\/.+/,
    },
    enumValidation: {
      '@type': ['WebSite'],
    },
  },
  BreadcrumbList: {
    required: ['@type', 'itemListElement'],
    recommended: [],
    deprecated: [],
    typeValidation: {
      itemListElement: 'array',
    },
    formatValidation: {},
    enumValidation: {
      '@type': ['BreadcrumbList'],
    },
  },
  FAQPage: {
    required: ['@type', 'mainEntity'],
    recommended: [],
    deprecated: [],
    typeValidation: {
      mainEntity: 'array',
    },
    formatValidation: {},
    enumValidation: {
      '@type': ['FAQPage'],
    },
  },
};

/**
 * Schema Validator Service
 */
export class SchemaValidator {
  private static instance: SchemaValidator;

  private constructor() {}

  static getInstance(): SchemaValidator {
    if (!SchemaValidator.instance) {
      SchemaValidator.instance = new SchemaValidator();
    }
    return SchemaValidator.instance;
  }

  /**
   * Validate a structured data object
   */
  validateSchema(schema: ValidatableSchema): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: string[] = [];

    if (!schema['@type']) {
      errors.push({
        field: '@type',
        message: '@type is required for all schema objects',
        severity: 'error',
        code: 'MISSING_TYPE',
      });
      return { valid: false, errors, warnings, suggestions };
    }

    const schemaType = schema['@type'] as string;
    const rules = SCHEMA_VALIDATION_RULES[schemaType];

    if (!rules) {
      warnings.push({
        field: '@type',
        message: `No validation rules found for schema type: ${schemaType}`,
        suggestion: 'Ensure the schema type is supported',
      });
      return { valid: true, errors, warnings, suggestions };
    }

    // Validate required fields
    this.validateRequiredFields(schema, rules.required, errors);

    // Validate recommended fields
    this.validateRecommendedFields(schema, rules.recommended, warnings, suggestions);

    // Validate field types
    this.validateFieldTypes(schema, rules.typeValidation, errors);

    // Validate field formats
    this.validateFieldFormats(schema, rules.formatValidation, errors);

    // Validate enum values
    this.validateEnumValues(schema, rules.enumValidation, errors);

    // Check for deprecated fields
    this.checkDeprecatedFields(schema, rules.deprecated, warnings);

    // Schema-specific validations
    this.performSchemaSpecificValidations(schema, schemaType, errors, warnings, suggestions);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * Validate multiple schemas
   */
  validateMultipleSchemas(schemas: ValidatableSchema[]): ValidationResult[] {
    return schemas.map(schema => this.validateSchema(schema));
  }

  /**
   * Test schema for rich snippets eligibility
   */
  testRichSnippets(schema: ValidatableSchema): SchemaTestResult {
    const validation = this.validateSchema(schema);
    const schemaType = schema['@type'] as string;

    // Determine rich snippet eligibility based on schema type and validation
    const richSnippetEligible = this.isRichSnippetEligible(schemaType, validation);

    return {
      schemaType,
      valid: validation.valid,
      richSnippetEligible,
      errors: validation.errors,
      warnings: validation.warnings,
      googleTestUrl: this.generateGoogleTestUrl(schema),
      structuredDataTestUrl: this.generateStructuredDataTestUrl(schema),
    };
  }

  /**
   * Generate Google's Rich Results Test URL
   */
  generateGoogleTestUrl(schema: ValidatableSchema): string {
    const encodedSchema = encodeURIComponent(JSON.stringify(schema));
    return `https://search.google.com/test/rich-results?code=${encodedSchema}`;
  }

  /**
   * Generate Structured Data Testing Tool URL
   */
  generateStructuredDataTestUrl(schema: ValidatableSchema): string {
    const encodedSchema = encodeURIComponent(JSON.stringify(schema));
    return `https://validator.schema.org/#/validate?input=${encodedSchema}`;
  }

  /**
   * Extract and validate schemas from HTML
   */
  validateHTMLSchemas(html: string): ValidationResult[] {
    const schemas = this.extractSchemasFromHTML(html);
    return this.validateMultipleSchemas(schemas as ValidatableSchema[]);
  }

  /**
   * Private validation methods
   */
  private validateRequiredFields(
    schema: ValidatableSchema,
    required: string[],
    errors: ValidationError[]
  ): void {
    required.forEach(field => {
      if (!(field in schema) || schema[field] === null || schema[field] === undefined) {
        errors.push({
          field,
          message: `Required field '${field}' is missing`,
          severity: 'error',
          code: 'MISSING_REQUIRED_FIELD',
        });
      }
    });
  }

  private validateRecommendedFields(
    schema: ValidatableSchema,
    recommended: string[],
    warnings: ValidationWarning[],
    suggestions: string[]
  ): void {
    recommended.forEach(field => {
      if (!(field in schema)) {
        warnings.push({
          field,
          message: `Recommended field '${field}' is missing`,
          suggestion: `Adding '${field}' can improve rich snippet appearance`,
        });
        suggestions.push(`Consider adding '${field}' field for better SEO`);
      }
    });
  }

  private validateFieldTypes(
    schema: ValidatableSchema,
    typeValidation: Record<string, string>,
    errors: ValidationError[]
  ): void {
    Object.entries(typeValidation).forEach(([field, expectedType]) => {
      if (field in schema) {
        const actualType = Array.isArray(schema[field]) ? 'array' : typeof schema[field];
        if (actualType !== expectedType) {
          errors.push({
            field,
            message: `Field '${field}' should be of type '${expectedType}' but got '${actualType}'`,
            severity: 'error',
            code: 'INVALID_TYPE',
          });
        }
      }
    });
  }

  private validateFieldFormats(
    schema: ValidatableSchema,
    formatValidation: Record<string, RegExp>,
    errors: ValidationError[]
  ): void {
    Object.entries(formatValidation).forEach(([field, pattern]) => {
      if (field in schema && typeof schema[field] === 'string') {
        const value = schema[field] as string;
        if (!pattern.test(value)) {
          errors.push({
            field,
            message: `Field '${field}' format is invalid: ${value}`,
            severity: 'error',
            code: 'INVALID_FORMAT',
          });
        }
      }
    });
  }

  private validateEnumValues(
    schema: ValidatableSchema,
    enumValidation: Record<string, string[]>,
    errors: ValidationError[]
  ): void {
    Object.entries(enumValidation).forEach(([field, allowedValues]) => {
      if (field in schema) {
        const value = schema[field] as string;
        if (!allowedValues.includes(value)) {
          errors.push({
            field,
            message: `Field '${field}' has invalid value '${value}'. Allowed values: ${allowedValues.join(', ')}`,
            severity: 'error',
            code: 'INVALID_ENUM_VALUE',
          });
        }
      }
    });
  }

  private checkDeprecatedFields(
    schema: ValidatableSchema,
    deprecated: string[],
    warnings: ValidationWarning[]
  ): void {
    deprecated.forEach(field => {
      if (field in schema) {
        warnings.push({
          field,
          message: `Field '${field}' is deprecated and should be avoided`,
          suggestion: 'Remove deprecated field or replace with current alternative',
        });
      }
    });
  }

  private performSchemaSpecificValidations(
    schema: ValidatableSchema,
    schemaType: string,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    suggestions: string[]
  ): void {
    switch (schemaType) {
      case 'Product':
        this.validateProductSchema(schema, errors, warnings, suggestions);
        break;
      case 'Article':
        this.validateArticleSchema(schema, errors, warnings, suggestions);
        break;
      case 'Organization':
        this.validateOrganizationSchema(schema, errors, warnings, suggestions);
        break;
      case 'WebSite':
        this.validateWebSiteSchema(schema, errors, warnings, suggestions);
        break;
      default:
        // Generic validation already done
        break;
    }
  }

  private validateProductSchema(
    schema: ValidatableSchema,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    suggestions: string[]
  ): void {
    // Validate offers
    if ('offers' in schema) {
      const offers = schema.offers as Record<string, unknown>;
      if (!offers.price) {
        errors.push({
          field: 'offers.price',
          message: 'Product offers must include a price',
          severity: 'error',
          code: 'MISSING_PRICE',
        });
      }
      if (!offers.priceCurrency) {
        warnings.push({
          field: 'offers.priceCurrency',
          message: 'Price currency is recommended for offers',
          suggestion: 'Add priceCurrency to offers (e.g., "INR")',
        });
      }
    }

    // Validate images
    if ('image' in schema) {
      const images = Array.isArray(schema.image) ? schema.image : [schema.image];
      if (images.length === 0) {
        errors.push({
          field: 'image',
          message: 'Product must have at least one image',
          severity: 'error',
          code: 'MISSING_IMAGE',
        });
      }
    }

    suggestions.push('Consider adding aggregateRating for better visibility');
    suggestions.push('Add brand information to improve product rich snippets');
  }

  private validateArticleSchema(
    schema: ValidatableSchema,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    suggestions: string[]
  ): void {
    // Validate author
    if ('author' in schema && typeof schema.author === 'object') {
      const author = schema.author as Record<string, unknown>;
      if (!author.name) {
        errors.push({
          field: 'author.name',
          message: 'Author must have a name',
          severity: 'error',
          code: 'MISSING_AUTHOR_NAME',
        });
      }
    }

    // Validate publisher
    if ('publisher' in schema && typeof schema.publisher === 'object') {
      const publisher = schema.publisher as Record<string, unknown>;
      if (!publisher.name || !publisher.logo) {
        warnings.push({
          field: 'publisher',
          message: 'Publisher should have name and logo',
          suggestion: 'Add complete publisher information for better rich snippets',
        });
      }
    }

    suggestions.push('Add mainEntityOfPage for better article identification');
    suggestions.push('Include wordCount for content analysis');
  }

  private validateOrganizationSchema(
    schema: ValidatableSchema,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    suggestions: string[]
  ): void {
    // Validate address structure
    if ('address' in schema && typeof schema.address === 'object') {
      const address = schema.address as Record<string, unknown>;
      const requiredAddressFields = ['addressCountry', 'addressLocality'];
      requiredAddressFields.forEach(field => {
        if (!address[field]) {
          warnings.push({
            field: `address.${field}`,
            message: `Address field '${field}' is recommended`,
            suggestion: 'Complete address information improves local SEO',
          });
        }
      });
    }

    suggestions.push('Add opening hours for local business optimization');
    suggestions.push('Include social media URLs in sameAs array');
  }

  private validateWebSiteSchema(
    schema: ValidatableSchema,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    suggestions: string[]
  ): void {
    // Validate search action
    if ('potentialAction' in schema) {
      const action = schema.potentialAction as Record<string, unknown>;
      if (action['@type'] === 'SearchAction' && !action.target) {
        errors.push({
          field: 'potentialAction.target',
          message: 'SearchAction must have a target URL template',
          severity: 'error',
          code: 'MISSING_SEARCH_TARGET',
        });
      }
    }

    suggestions.push('Add SearchAction for site search box in SERPs');
    suggestions.push('Include publisher information for website credibility');
  }

  private isRichSnippetEligible(schemaType: string, validation: ValidationResult): boolean {
    if (!validation.valid) return false;

    const eligibleTypes = ['Product', 'Article', 'Recipe', 'Event', 'Organization', 'FAQPage'];
    return eligibleTypes.includes(schemaType);
  }

  private extractSchemasFromHTML(html: string): ValidatableSchema[] {
    const schemas: ValidatableSchema[] = [];
    const jsonLdRegex = /<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gi;
    let match;

    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const jsonContent = match[1].trim();
        const parsed = JSON.parse(jsonContent);
        
        if (Array.isArray(parsed)) {
          schemas.push(...parsed);
        } else {
          schemas.push(parsed);
        }
      } catch (error) {
        console.warn('Failed to parse JSON-LD:', error);
      }
    }

    return schemas;
  }
}

// Utility functions
export const SchemaValidatorUtils = {
  /**
   * Generate validation report
   */
  generateValidationReport: (results: ValidationResult[]): string => {
    let report = '# Schema Validation Report\n\n';
    
    results.forEach((result, index) => {
      report += `## Schema ${index + 1}\n`;
      report += `**Status:** ${result.valid ? '✅ Valid' : '❌ Invalid'}\n\n`;
      
      if (result.errors.length > 0) {
        report += '### Errors\n';
        result.errors.forEach(error => {
          report += `- **${error.field}**: ${error.message} (${error.code})\n`;
        });
        report += '\n';
      }
      
      if (result.warnings.length > 0) {
        report += '### Warnings\n';
        result.warnings.forEach(warning => {
          report += `- **${warning.field}**: ${warning.message}\n`;
          if (warning.suggestion) {
            report += `  *Suggestion: ${warning.suggestion}*\n`;
          }
        });
        report += '\n';
      }
      
      if (result.suggestions.length > 0) {
        report += '### Suggestions\n';
        result.suggestions.forEach(suggestion => {
          report += `- ${suggestion}\n`;
        });
        report += '\n';
      }
    });
    
    return report;
  },

  /**
   * Check schema completeness score
   */
  calculateCompletenessScore: (schema: ValidatableSchema): number => {
    const schemaType = schema['@type'] as string;
    const rules = SCHEMA_VALIDATION_RULES[schemaType];
    
    if (!rules) return 0;
    
    const totalFields = rules.required.length + rules.recommended.length;
    if (totalFields === 0) return 100;
    
    const presentFields = [...rules.required, ...rules.recommended].filter(
      field => field in schema && schema[field] !== null && schema[field] !== undefined
    ).length;
    
    return Math.round((presentFields / totalFields) * 100);
  },

  /**
   * Get schema optimization suggestions
   */
  getOptimizationSuggestions: (schema: ValidatableSchema): string[] => {
    const suggestions: string[] = [];
    const schemaType = schema['@type'] as string;
    
    // Generic suggestions
    if (!schema['@id']) {
      suggestions.push('Add @id for unique identification of the entity');
    }
    
    if (!schema.url) {
      suggestions.push('Add URL for better entity linking');
    }
    
    // Type-specific suggestions
    switch (schemaType) {
      case 'Product':
        if (!schema.brand) suggestions.push('Add brand for better product identification');
        if (!schema.sku) suggestions.push('Add SKU for unique product identification');
        break;
      case 'Article':
        if (!schema.keywords) suggestions.push('Add keywords for better content categorization');
        if (!schema.wordCount) suggestions.push('Add word count for content analysis');
        break;
      case 'Organization':
        if (!schema.logo) suggestions.push('Add logo for brand recognition');
        if (!schema.sameAs) suggestions.push('Add social media URLs for entity verification');
        break;
    }
    
    return suggestions;
  },
};

// Export singleton instance
export const schemaValidator = SchemaValidator.getInstance();

export default SchemaValidator;