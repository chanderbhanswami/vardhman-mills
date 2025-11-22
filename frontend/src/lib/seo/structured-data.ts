/**
 * Structured Data Generator for Vardhman Mills Frontend
 * Comprehensive JSON-LD structured data for enhanced SEO
 */

// Base structured data types
export interface StructuredDataBase {
  '@context': string | string[];
  '@type': string;
  '@id'?: string;
}

// Organization structured data
export interface Organization extends StructuredDataBase {
  '@type': 'Organization' | 'Corporation' | 'LocalBusiness';
  name: string;
  alternateName?: string;
  description?: string;
  url: string;
  logo?: ImageObject | string;
  image?: ImageObject | ImageObject[] | string | string[];
  sameAs?: string[];
  address?: PostalAddress;
  contactPoint?: ContactPoint | ContactPoint[];
  telephone?: string;
  email?: string;
  vatID?: string;
  taxID?: string;
  legalName?: string;
  foundingDate?: string;
  founders?: Person | Person[];
  numberOfEmployees?: QuantitativeValue;
  areaServed?: Place | Place[] | string | string[];
  brand?: Brand | Brand[];
  awards?: string[];
  memberOf?: Organization | Organization[];
  parentOrganization?: Organization;
  subOrganization?: Organization | Organization[];
  department?: Organization | Organization[];
}

// Person structured data
export interface Person extends StructuredDataBase {
  '@type': 'Person';
  name: string;
  givenName?: string;
  familyName?: string;
  additionalName?: string;
  honorificPrefix?: string;
  honorificSuffix?: string;
  image?: ImageObject | string;
  url?: string;
  sameAs?: string[];
  email?: string;
  telephone?: string;
  address?: PostalAddress;
  birthDate?: string;
  jobTitle?: string;
  worksFor?: Organization;
  alumniOf?: Organization | Organization[];
  knowsAbout?: string | string[];
  description?: string;
}

// Product structured data
export interface Product extends StructuredDataBase {
  '@type': 'Product';
  name: string;
  description?: string;
  image?: ImageObject | ImageObject[] | string | string[];
  brand?: Brand | Organization | string;
  manufacturer?: Organization;
  model?: string;
  productID?: string;
  mpn?: string;
  gtin?: string;
  gtin8?: string;
  gtin12?: string;
  gtin13?: string;
  gtin14?: string;
  sku?: string;
  color?: string | string[];
  material?: string | string[];
  pattern?: string;
  size?: string | QuantitativeValue;
  weight?: QuantitativeValue;
  width?: QuantitativeValue;
  height?: QuantitativeValue;
  depth?: QuantitativeValue;
  category?: string | string[];
  additionalProperty?: PropertyValue | PropertyValue[];
  offers?: Offer | Offer[];
  aggregateRating?: AggregateRating;
  review?: Review | Review[];
  audience?: Audience;
  award?: string | string[];
  url?: string;
  isRelatedTo?: Product | Product[];
  isSimilarTo?: Product | Product[];
  isAccessoryOrSparePartFor?: Product | Product[];
  hasVariant?: Product | Product[];
  variesBy?: string | string[];
  itemCondition?: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition' | 'DamagedCondition';
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder' | 'Discontinued' | 'SoldOut';
}

// Offer structured data
export interface Offer extends StructuredDataBase {
  '@type': 'Offer' | 'AggregateOffer';
  price?: string | number;
  priceCurrency?: string;
  priceValidUntil?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder' | 'Discontinued' | 'SoldOut';
  itemCondition?: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition' | 'DamagedCondition';
  seller?: Organization | Person;
  url?: string;
  priceSpecification?: PriceSpecification;
  eligibleQuantity?: QuantitativeValue;
  businessFunction?: 'Sell' | 'LeaseOut' | 'Repair' | 'Dispose' | 'Buy' | 'Rent';
  warranty?: WarrantyPromise;
  deliveryLeadTime?: QuantitativeValue;
  availableDeliveryMethod?: 'OnSitePickup' | 'ParcelService' | 'FreeShipping' | 'DirectDownload';
  acceptedPaymentMethod?: string | string[];
  addOn?: Offer | Offer[];
  areaServed?: Place | string;
  validFrom?: string;
  validThrough?: string;
  shippingDetails?: OfferShippingDetails;
}

// Article structured data
export interface Article extends StructuredDataBase {
  '@type': 'Article' | 'NewsArticle' | 'BlogPosting' | 'TechArticle';
  headline: string;
  description?: string;
  image?: ImageObject | ImageObject[] | string | string[];
  author?: Person | Organization | string;
  publisher?: Organization;
  datePublished?: string;
  dateModified?: string;
  mainEntityOfPage?: string;
  url?: string;
  wordCount?: number;
  articleSection?: string | string[];
  articleBody?: string;
  abstract?: string;
  keywords?: string | string[];
  about?: Thing | Thing[] | string | string[];
  mentions?: Thing | Thing[] | string | string[];
  inLanguage?: string;
  isAccessibleForFree?: boolean;
  hasPart?: Article | Article[];
  isPartOf?: Article | CreativeWork;
  speakable?: SpeakableSpecification;
  video?: VideoObject | VideoObject[];
  audio?: AudioObject | AudioObject[];
  commentCount?: number;
  comment?: Comment | Comment[];
}

// Website structured data
export interface WebSite extends StructuredDataBase {
  '@type': 'WebSite';
  name: string;
  alternateName?: string;
  description?: string;
  url: string;
  potentialAction?: SearchAction | SearchAction[];
  publisher?: Organization;
  copyrightHolder?: Organization | Person;
  copyrightYear?: number;
  inLanguage?: string | string[];
  audience?: Audience;
  about?: Thing | Thing[] | string | string[];
  keywords?: string | string[];
  mainEntity?: Thing;
  sameAs?: string[];
  isAccessibleForFree?: boolean;
  hasPart?: WebPage | WebPage[];
}

// WebPage structured data
export interface WebPage extends StructuredDataBase {
  '@type': 'WebPage' | 'AboutPage' | 'ContactPage' | 'FAQPage' | 'ProfilePage' | 'CollectionPage' | 'ItemPage';
  name: string;
  description?: string;
  url: string;
  mainEntity?: Thing;
  breadcrumb?: BreadcrumbList;
  isPartOf?: WebSite;
  lastReviewed?: string;
  reviewedBy?: Organization | Person;
  primaryImageOfPage?: ImageObject;
  significantLinks?: string[];
  speakable?: SpeakableSpecification;
  relatedLink?: string[];
  mainContentOfPage?: WebPageElement;
  accessibilityFeature?: string | string[];
  accessibilityHazard?: string | string[];
  accessibilityAPI?: string | string[];
  accessibilityControl?: string | string[];
}

// BreadcrumbList structured data
export interface BreadcrumbList extends StructuredDataBase {
  '@type': 'BreadcrumbList';
  itemListElement: ListItem[];
  numberOfItems?: number;
}

// ListItem for breadcrumbs
export interface ListItem extends StructuredDataBase {
  '@type': 'ListItem';
  position: number;
  name: string;
  item?: string;
  nextItem?: ListItem;
  previousItem?: ListItem;
}

// FAQ structured data
export interface FAQPage extends StructuredDataBase {
  '@type': 'FAQPage';
  mainEntity: Question[];
}

export interface Question extends StructuredDataBase {
  '@type': 'Question';
  name: string;
  acceptedAnswer: Answer;
}

export interface Answer extends StructuredDataBase {
  '@type': 'Answer';
  text: string;
  author?: Person | Organization;
  upvoteCount?: number;
  dateCreated?: string;
}

// Review structured data
export interface Review extends StructuredDataBase {
  '@type': 'Review';
  reviewBody?: string;
  reviewRating?: Rating;
  author?: Person | Organization | string;
  datePublished?: string;
  publisher?: Organization;
  itemReviewed?: Thing;
  positiveNotes?: string;
  negativeNotes?: string;
}

export interface AggregateRating extends StructuredDataBase {
  '@type': 'AggregateRating';
  ratingValue?: number | string;
  bestRating?: number | string;
  worstRating?: number | string;
  ratingCount?: number;
  reviewCount?: number;
}

export interface Rating extends StructuredDataBase {
  '@type': 'Rating';
  ratingValue?: number | string;
  bestRating?: number | string;
  worstRating?: number | string;
  author?: Person | Organization;
}

// Event structured data
export interface Event extends StructuredDataBase {
  '@type': 'Event';
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: Place;
  organizer?: Organization | Person;
  url?: string;
  image?: ImageObject | string;
  offers?: Offer;
  performer?: Person | Organization;
  eventStatus?: 'EventCancelled' | 'EventMovedOnline' | 'EventPostponed' | 'EventRescheduled' | 'EventScheduled';
  eventAttendanceMode?: 'MixedEventAttendanceMode' | 'OfflineEventAttendanceMode' | 'OnlineEventAttendanceMode';
  previousStartDate?: string;
  duration?: string;
  doorTime?: string;
  isAccessibleForFree?: boolean;
  maximumAttendeeCapacity?: number;
  remainingAttendeeCapacity?: number;
  typicalAgeRange?: string;
  audience?: Audience;
  inLanguage?: string;
  review?: Review | Review[];
  aggregateRating?: AggregateRating;
}

// Supporting interfaces
export interface ImageObject extends StructuredDataBase {
  '@type': 'ImageObject';
  url: string;
  width?: number | string;
  height?: number | string;
  caption?: string;
  description?: string;
  thumbnailUrl?: string;
  contentUrl?: string;
  encodingFormat?: string;
  contentSize?: string;
  uploadDate?: string;
  representativeOfPage?: boolean;
}

export interface VideoObject extends StructuredDataBase {
  '@type': 'VideoObject';
  name: string;
  description?: string;
  thumbnailUrl?: string | string[];
  uploadDate?: string;
  duration?: string;
  contentUrl?: string;
  embedUrl?: string;
  encodingFormat?: string;
  width?: number | string;
  height?: number | string;
  playerType?: string;
  regionsAllowed?: string | string[];
  requiresSubscription?: boolean;
  transcript?: string;
  videoFrameSize?: string;
  videoQuality?: string;
}

export interface AudioObject extends StructuredDataBase {
  '@type': 'AudioObject';
  name: string;
  description?: string;
  duration?: string;
  contentUrl?: string;
  encodingFormat?: string;
  transcript?: string;
}

export interface PostalAddress extends StructuredDataBase {
  '@type': 'PostalAddress';
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry?: string;
  postOfficeBoxNumber?: string;
}

export interface ContactPoint extends StructuredDataBase {
  '@type': 'ContactPoint';
  telephone?: string;
  email?: string;
  contactType?: string;
  availableLanguage?: string | string[];
  hoursAvailable?: OpeningHoursSpecification | OpeningHoursSpecification[];
  areaServed?: Place | string;
  serviceArea?: Place;
}

export interface OpeningHoursSpecification extends StructuredDataBase {
  '@type': 'OpeningHoursSpecification';
  dayOfWeek?: string | string[];
  opens?: string;
  closes?: string;
  validFrom?: string;
  validThrough?: string;
}

export interface Place extends StructuredDataBase {
  '@type': 'Place';
  name?: string;
  address?: PostalAddress;
  geo?: GeoCoordinates;
  url?: string;
  telephone?: string;
  openingHoursSpecification?: OpeningHoursSpecification | OpeningHoursSpecification[];
}

export interface GeoCoordinates extends StructuredDataBase {
  '@type': 'GeoCoordinates';
  latitude: number | string;
  longitude: number | string;
  elevation?: number | string;
}

export interface Brand extends StructuredDataBase {
  '@type': 'Brand';
  name: string;
  logo?: ImageObject | string;
  url?: string;
  description?: string;
  sameAs?: string[];
}

export interface QuantitativeValue extends StructuredDataBase {
  '@type': 'QuantitativeValue';
  value?: number | string;
  unitCode?: string;
  unitText?: string;
  minValue?: number;
  maxValue?: number;
}

export interface PropertyValue extends StructuredDataBase {
  '@type': 'PropertyValue';
  name: string;
  value?: string | number | boolean;
  valueReference?: string;
  unitCode?: string;
  unitText?: string;
}

export interface PriceSpecification extends StructuredDataBase {
  '@type': 'PriceSpecification';
  price?: number | string;
  priceCurrency?: string;
  valueAddedTaxIncluded?: boolean;
  validFrom?: string;
  validThrough?: string;
}

export interface WarrantyPromise extends StructuredDataBase {
  '@type': 'WarrantyPromise';
  durationOfWarranty?: QuantitativeValue;
  warrantyScope?: string;
}

export interface OfferShippingDetails extends StructuredDataBase {
  '@type': 'OfferShippingDetails';
  shippingRate?: MonetaryAmount;
  shippingDestination?: DefinedRegion;
  deliveryTime?: ShippingDeliveryTime;
}

export interface MonetaryAmount extends StructuredDataBase {
  '@type': 'MonetaryAmount';
  currency?: string;
  value?: number | string;
}

export interface DefinedRegion extends StructuredDataBase {
  '@type': 'DefinedRegion';
  addressCountry?: string;
  addressRegion?: string;
  postalCode?: string;
}

export interface ShippingDeliveryTime extends StructuredDataBase {
  '@type': 'ShippingDeliveryTime';
  handlingTime?: QuantitativeValue;
  transitTime?: QuantitativeValue;
  cutoffTime?: string;
  businessDays?: OpeningHoursSpecification[];
}

export interface SearchAction extends StructuredDataBase {
  '@type': 'SearchAction';
  target: string;
  'query-input'?: string;
}

export interface Audience extends StructuredDataBase {
  '@type': 'Audience';
  audienceType?: string;
  geographicArea?: Place;
}

export interface Thing extends StructuredDataBase {
  '@type': string;
  name?: string;
  description?: string;
  url?: string;
  image?: ImageObject | string;
  sameAs?: string[];
}

export interface CreativeWork extends StructuredDataBase {
  '@type': string;
  name?: string;
  description?: string;
  author?: Person | Organization;
  datePublished?: string;
  dateModified?: string;
}

export interface SpeakableSpecification extends StructuredDataBase {
  '@type': 'SpeakableSpecification';
  cssSelector?: string[];
  xpath?: string[];
}

export interface WebPageElement extends StructuredDataBase {
  '@type': 'WebPageElement';
  cssSelector?: string;
  xpath?: string;
}

export interface Comment extends StructuredDataBase {
  '@type': 'Comment';
  text: string;
  author?: Person | Organization;
  dateCreated?: string;
  parentItem?: Comment;
}

// Configuration interface
export interface StructuredDataConfig {
  baseUrl: string;
  siteName: string;
  organization: Organization;
  defaultImageUrl?: string;
  defaultLogoUrl?: string;
  socialProfiles?: string[];
  enableBreadcrumbs?: boolean;
  enableSearchAction?: boolean;
  searchActionTarget?: string;
  defaultLanguage?: string;
  defaultCurrency?: string;
  enableAutoGeneration?: boolean;
}

// Default configuration
export const DEFAULT_STRUCTURED_DATA_CONFIG: StructuredDataConfig = {
  baseUrl: 'https://vardhmantextiles.com',
  siteName: 'Vardhman Mills',
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Vardhman Mills',
    url: 'https://vardhmantextiles.com',
    logo: 'https://vardhmantextiles.com/logo.png',
    description: 'Leading textile manufacturer and exporter',
    sameAs: [
      'https://www.facebook.com/vardhmantextiles',
      'https://www.linkedin.com/company/vardhman-textiles',
      'https://twitter.com/vardhmantextile',
    ],
    address: {
      '@context': 'https://schema.org',
      '@type': 'PostalAddress',
      addressCountry: 'IN',
      addressRegion: 'Punjab',
      addressLocality: 'Ludhiana',
    },
    contactPoint: [{
      '@context': 'https://schema.org',
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      telephone: '+91-XXX-XXX-XXXX',
      email: 'info@vardhmantextiles.com',
    }],
  },
  defaultImageUrl: 'https://vardhmantextiles.com/default-image.jpg',
  defaultLogoUrl: 'https://vardhmantextiles.com/logo.png',
  enableBreadcrumbs: true,
  enableSearchAction: true,
  searchActionTarget: 'https://vardhmantextiles.com/search?q={search_term_string}',
  defaultLanguage: 'en',
  defaultCurrency: 'INR',
  enableAutoGeneration: true,
};

/**
 * Structured Data Generator Service
 */
export class StructuredDataGenerator {
  private static instance: StructuredDataGenerator;
  private config: StructuredDataConfig;

  private constructor(config: StructuredDataConfig = DEFAULT_STRUCTURED_DATA_CONFIG) {
    this.config = { ...DEFAULT_STRUCTURED_DATA_CONFIG, ...config };
  }

  static getInstance(config?: Partial<StructuredDataConfig>): StructuredDataGenerator {
    if (!StructuredDataGenerator.instance) {
      StructuredDataGenerator.instance = new StructuredDataGenerator(config as StructuredDataConfig);
    }
    return StructuredDataGenerator.instance;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<StructuredDataConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Generate organization structured data
   */
  generateOrganization(overrides?: Partial<Organization>): Organization {
    return {
      ...this.config.organization,
      ...overrides,
    };
  }

  /**
   * Generate website structured data
   */
  generateWebsite(overrides?: Partial<WebSite>): WebSite {
    const website: WebSite = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: this.config.siteName,
      url: this.config.baseUrl,
      publisher: this.config.organization,
      inLanguage: this.config.defaultLanguage,
      ...overrides,
    };

    if (this.config.enableSearchAction && this.config.searchActionTarget) {
      website.potentialAction = [{
        '@context': 'https://schema.org',
        '@type': 'SearchAction',
        target: this.config.searchActionTarget,
        'query-input': 'required name=search_term_string',
      }];
    }

    return website;
  }

  /**
   * Generate webpage structured data
   */
  generateWebpage(data: {
    name: string;
    description?: string;
    url: string;
    type?: WebPage['@type'];
    breadcrumbs?: Array<{ name: string; url?: string }>;
    lastReviewed?: string;
    image?: string;
  }): WebPage {
    const webpage: WebPage = {
      '@context': 'https://schema.org',
      '@type': data.type || 'WebPage',
      name: data.name,
      description: data.description,
      url: data.url,
      isPartOf: this.generateWebsite(),
    };

    if (data.image) {
      webpage.primaryImageOfPage = {
        '@type': 'ImageObject',
        url: data.image,
        '@context': 'https://schema.org',
      };
    }

    if (data.breadcrumbs && this.config.enableBreadcrumbs) {
      webpage.breadcrumb = this.generateBreadcrumbs(data.breadcrumbs);
    }

    if (data.lastReviewed) {
      webpage.lastReviewed = data.lastReviewed;
      webpage.reviewedBy = this.config.organization;
    }

    return webpage;
  }

  /**
   * Generate product structured data
   */
  generateProduct(data: {
    name: string;
    description?: string;
    image?: string | string[];
    brand?: string;
    category?: string | string[];
    sku?: string;
    price?: number;
    currency?: string;
    availability?: Product['availability'];
    condition?: Product['itemCondition'];
    url?: string;
    rating?: {
      value: number;
      count: number;
      bestRating?: number;
      worstRating?: number;
    };
    reviews?: Array<{
      author: string;
      rating: number;
      text: string;
      datePublished?: string;
    }>;
    specifications?: Array<{ name: string; value: string | number }>;
  }): Product {
    const product: Product = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: data.name,
      description: data.description,
      category: data.category,
      sku: data.sku,
      url: data.url,
      availability: data.availability || 'InStock',
      itemCondition: data.condition || 'NewCondition',
    };

    // Add brand
    if (data.brand) {
      product.brand = {
        '@type': 'Brand',
        name: data.brand,
        '@context': 'https://schema.org',
      };
    }

    // Add images
    if (data.image) {
      const images = Array.isArray(data.image) ? data.image : [data.image];
      product.image = images.map(url => ({
        '@type': 'ImageObject',
        url,
        '@context': 'https://schema.org',
      })) as ImageObject[];
    }

    // Add offers
    if (data.price) {
      product.offers = {
        '@type': 'Offer',
        price: data.price.toString(),
        priceCurrency: data.currency || this.config.defaultCurrency,
        availability: data.availability || 'InStock',
        itemCondition: data.condition || 'NewCondition',
        seller: this.config.organization,
        '@context': 'https://schema.org',
      };
    }

    // Add ratings
    if (data.rating) {
      product.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: data.rating.value,
        ratingCount: data.rating.count,
        bestRating: data.rating.bestRating || 5,
        worstRating: data.rating.worstRating || 1,
        '@context': 'https://schema.org',
      };
    }

    // Add reviews
    if (data.reviews && data.reviews.length > 0) {
      product.review = data.reviews.map(review => ({
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: review.author,
          '@context': 'https://schema.org',
        },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.rating,
          bestRating: 5,
          worstRating: 1,
          '@context': 'https://schema.org',
        },
        reviewBody: review.text,
        datePublished: review.datePublished || new Date().toISOString(),
        '@context': 'https://schema.org',
      }));
    }

    // Add specifications as additional properties
    if (data.specifications && data.specifications.length > 0) {
      product.additionalProperty = data.specifications.map(spec => ({
        '@type': 'PropertyValue',
        name: spec.name,
        value: spec.value,
        '@context': 'https://schema.org',
      }));
    }

    return product;
  }

  /**
   * Generate article structured data
   */
  generateArticle(data: {
    type?: Article['@type'];
    headline: string;
    description?: string;
    image?: string | string[];
    author?: string | { name: string; url?: string };
    datePublished: string;
    dateModified?: string;
    url: string;
    wordCount?: number;
    articleSection?: string;
    keywords?: string[];
    about?: string[];
  }): Article {
    const article: Article = {
      '@context': 'https://schema.org',
      '@type': data.type || 'Article',
      headline: data.headline,
      description: data.description,
      datePublished: data.datePublished,
      dateModified: data.dateModified || data.datePublished,
      url: data.url,
      mainEntityOfPage: data.url,
      publisher: this.config.organization,
      wordCount: data.wordCount,
      articleSection: data.articleSection,
      inLanguage: this.config.defaultLanguage,
    };

    // Add author
    if (data.author) {
      if (typeof data.author === 'string') {
        article.author = {
          '@type': 'Person',
          name: data.author,
          '@context': 'https://schema.org',
        };
      } else {
        article.author = {
          '@type': 'Person',
          name: data.author.name,
          url: data.author.url,
          '@context': 'https://schema.org',
        };
      }
    }

    // Add images
    if (data.image) {
      const images = Array.isArray(data.image) ? data.image : [data.image];
      article.image = images.map(url => ({
        '@type': 'ImageObject',
        url,
        '@context': 'https://schema.org',
      })) as ImageObject[];
    }

    // Add keywords
    if (data.keywords && data.keywords.length > 0) {
      article.keywords = data.keywords.join(', ');
    }

    // Add about
    if (data.about && data.about.length > 0) {
      article.about = data.about;
    }

    return article;
  }

  /**
   * Generate breadcrumb structured data
   */
  generateBreadcrumbs(breadcrumbs: Array<{ name: string; url?: string }>): BreadcrumbList {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      numberOfItems: breadcrumbs.length,
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url,
        '@context': 'https://schema.org',
      })),
    };
  }

  /**
   * Generate FAQ structured data
   */
  generateFAQ(faqs: Array<{ question: string; answer: string }>): FAQPage {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
          '@context': 'https://schema.org',
        },
        '@context': 'https://schema.org',
      })),
    };
  }

  /**
   * Generate local business structured data
   */
  generateLocalBusiness(data: {
    name: string;
    description?: string;
    address: {
      streetAddress: string;
      addressLocality: string;
      addressRegion: string;
      postalCode: string;
      addressCountry: string;
    };
    telephone?: string;
    email?: string;
    url?: string;
    image?: string;
    openingHours?: Array<{
      dayOfWeek: string | string[];
      opens: string;
      closes: string;
    }>;
    priceRange?: string;
    rating?: {
      value: number;
      count: number;
    };
    geo?: {
      latitude: number;
      longitude: number;
    };
  }): Organization {
    const business: Organization = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: data.name,
      description: data.description,
      url: data.url || this.config.baseUrl,
      telephone: data.telephone,
      email: data.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: data.address.streetAddress,
        addressLocality: data.address.addressLocality,
        addressRegion: data.address.addressRegion,
        postalCode: data.address.postalCode,
        addressCountry: data.address.addressCountry,
        '@context': 'https://schema.org',
      },
    };

    if (data.image) {
      business.image = data.image;
    }

    if (data.openingHours && data.openingHours.length > 0) {
      business.contactPoint = data.openingHours.map(hours => ({
        '@type': 'ContactPoint',
        hoursAvailable: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: hours.dayOfWeek,
          opens: hours.opens,
          closes: hours.closes,
          '@context': 'https://schema.org',
        },
        '@context': 'https://schema.org',
      }));
    }

    return business;
  }

  /**
   * Generate review structured data
   */
  generateReview(data: {
    itemName: string;
    reviewBody: string;
    rating: number;
    author: string;
    datePublished?: string;
    bestRating?: number;
    worstRating?: number;
  }): Review {
    return {
      '@context': 'https://schema.org',
      '@type': 'Review',
      itemReviewed: {
        '@type': 'Thing',
        name: data.itemName,
        '@context': 'https://schema.org',
      },
      reviewBody: data.reviewBody,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: data.rating,
        bestRating: data.bestRating || 5,
        worstRating: data.worstRating || 1,
        '@context': 'https://schema.org',
      },
      author: {
        '@type': 'Person',
        name: data.author,
        '@context': 'https://schema.org',
      },
      datePublished: data.datePublished || new Date().toISOString(),
    };
  }

  /**
   * Generate event structured data
   */
  generateEvent(data: {
    name: string;
    description?: string;
    startDate: string;
    endDate?: string;
    location?: {
      name: string;
      address?: string;
    };
    organizer?: string;
    url?: string;
    image?: string;
    offers?: {
      price: number;
      currency?: string;
      availability?: string;
    };
  }): Event {
    const event: Event = {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: data.name,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      url: data.url,
    };

    if (data.location) {
      event.location = {
        '@type': 'Place',
        name: data.location.name,
        address: data.location.address ? {
          '@type': 'PostalAddress',
          streetAddress: data.location.address,
          '@context': 'https://schema.org',
        } : undefined,
        '@context': 'https://schema.org',
      };
    }

    if (data.organizer) {
      event.organizer = {
        '@type': 'Organization',
        name: data.organizer,
        url: this.config.baseUrl,
        '@context': 'https://schema.org',
      };
    }

    if (data.image) {
      event.image = {
        '@type': 'ImageObject',
        url: data.image,
        '@context': 'https://schema.org',
      };
    }

    if (data.offers) {
      event.offers = {
        '@type': 'Offer',
        price: data.offers.price.toString(),
        priceCurrency: data.offers.currency || this.config.defaultCurrency,
        availability: (data.offers.availability as Offer['availability']) || 'InStock',
        '@context': 'https://schema.org',
      };
    }

    return event;
  }

  /**
   * Combine multiple structured data objects
   */
  combineStructuredData(...objects: StructuredDataBase[]): StructuredDataBase[] {
    return objects.filter(obj => obj && typeof obj === 'object');
  }

  /**
   * Generate JSON-LD script tag
   */
  generateScriptTag(structuredData: StructuredDataBase | StructuredDataBase[]): string {
    const data = Array.isArray(structuredData) ? structuredData : [structuredData];
    const jsonLd = data.length === 1 ? data[0] : data;
    
    return `<script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
</script>`;
  }

  /**
   * Validate structured data
   */
  validateStructuredData(structuredData: StructuredDataBase): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (!structuredData['@context']) {
      errors.push('Missing @context property');
    }

    if (!structuredData['@type']) {
      errors.push('Missing @type property');
    }

    // Check context format
    if (structuredData['@context'] && 
        typeof structuredData['@context'] !== 'string' && 
        !Array.isArray(structuredData['@context'])) {
      errors.push('@context must be a string or array');
    }

    // Type-specific validation
    switch (structuredData['@type']) {
      case 'Product':
        this.validateProduct(structuredData as Product, errors, warnings);
        break;
      case 'Article':
      case 'NewsArticle':
      case 'BlogPosting':
        this.validateArticle(structuredData as Article, errors, warnings);
        break;
      case 'Organization':
      case 'LocalBusiness':
        this.validateOrganization(structuredData as Organization, errors, warnings);
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get structured data statistics
   */
  getStatistics(structuredData: StructuredDataBase[]): {
    totalItems: number;
    typeBreakdown: Record<string, number>;
    contextBreakdown: Record<string, number>;
    hasImages: number;
    hasRatings: number;
    hasReviews: number;
  } {
    const typeBreakdown: Record<string, number> = {};
    const contextBreakdown: Record<string, number> = {};
    let hasImages = 0;
    let hasRatings = 0;
    let hasReviews = 0;

    structuredData.forEach(item => {
      // Count types
      const type = item['@type'] || 'Unknown';
      typeBreakdown[type] = (typeBreakdown[type] || 0) + 1;

      // Count contexts
      const context = Array.isArray(item['@context']) 
        ? item['@context'][0] 
        : item['@context'] || 'Unknown';
      contextBreakdown[context] = (contextBreakdown[context] || 0) + 1;

      // Count features
      if ('image' in item && item.image) hasImages++;
      if ('aggregateRating' in item && item.aggregateRating) hasRatings++;
      if ('review' in item && item.review) hasReviews++;
    });

    return {
      totalItems: structuredData.length,
      typeBreakdown,
      contextBreakdown,
      hasImages,
      hasRatings,
      hasReviews,
    };
  }

  /**
   * Private validation methods
   */
  private validateProduct(product: Product, errors: string[], warnings: string[]): void {
    if (!product.name) {
      errors.push('Product: name is required');
    }

    if (!product.offers) {
      warnings.push('Product: offers recommended for better visibility');
    }

    if (!product.image) {
      warnings.push('Product: image recommended for better visibility');
    }

    if (!product.description) {
      warnings.push('Product: description recommended');
    }
  }

  private validateArticle(article: Article, errors: string[], warnings: string[]): void {
    if (!article.headline) {
      errors.push('Article: headline is required');
    }

    if (!article.datePublished) {
      errors.push('Article: datePublished is required');
    }

    if (!article.author) {
      warnings.push('Article: author recommended');
    }

    if (!article.image) {
      warnings.push('Article: image recommended for better visibility');
    }

    if (!article.publisher) {
      warnings.push('Article: publisher recommended');
    }
  }

  private validateOrganization(org: Organization, errors: string[], warnings: string[]): void {
    if (!org.name) {
      errors.push('Organization: name is required');
    }

    if (!org.url) {
      errors.push('Organization: url is required');
    }

    if (!org.logo) {
      warnings.push('Organization: logo recommended');
    }

    if (!org.contactPoint && !org.telephone && !org.email) {
      warnings.push('Organization: contact information recommended');
    }
  }
}

// Utility functions
export const StructuredDataUtils = {
  /**
   * Extract structured data from HTML
   */
  extractFromHTML: (html: string): StructuredDataBase[] => {
    const jsonLdRegex = /<script\s+type="application\/ld\+json"[^>]*>(.*?)<\/script>/gi;
    const results: StructuredDataBase[] = [];
    let match;

    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const data = JSON.parse(match[1]);
        if (Array.isArray(data)) {
          results.push(...data);
        } else {
          results.push(data);
        }
      } catch {
        // Ignore invalid JSON
      }
    }

    return results;
  },

  /**
   * Convert breadcrumb path to structured data
   */
  pathToBreadcrumbs: (path: string, baseUrl: string): Array<{ name: string; url?: string }> => {
    const segments = path.split('/').filter(segment => segment.length > 0);
    const breadcrumbs: Array<{ name: string; url?: string }> = [
      { name: 'Home', url: baseUrl },
    ];

    let currentPath = '';
    segments.forEach(segment => {
      currentPath += `/${segment}`;
      breadcrumbs.push({
        name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
        url: `${baseUrl}${currentPath}`,
      });
    });

    return breadcrumbs;
  },

  /**
   * Generate schema.org testing URL
   */
  getTestingURL: (url: string): string => {
    return `https://search.google.com/test/rich-results?url=${encodeURIComponent(url)}`;
  },

  /**
   * Check if structured data is valid JSON-LD
   */
  isValidJSONLD: (data: unknown): boolean => {
    try {
      if (!data || typeof data !== 'object') return false;
      const obj = data as Record<string, unknown>;
      if (!obj['@context'] || !obj['@type']) return false;
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Merge structured data objects
   */
  mergeStructuredData: (base: StructuredDataBase, override: Partial<StructuredDataBase>): StructuredDataBase => {
    return { ...base, ...override };
  },

  /**
   * Clean structured data (remove empty values)
   */
  cleanStructuredData: (data: unknown): unknown => {
    if (Array.isArray(data)) {
      return data.map(item => StructuredDataUtils.cleanStructuredData(item)).filter(Boolean);
    }

    if (data && typeof data === 'object') {
      const cleaned: Record<string, unknown> = {};
      Object.entries(data as Record<string, unknown>).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          cleaned[key] = StructuredDataUtils.cleanStructuredData(value);
        }
      });
      return Object.keys(cleaned).length > 0 ? cleaned : null;
    }

    return data;
  },
};

// Export singleton instance
export const structuredDataGenerator = StructuredDataGenerator.getInstance();

export default StructuredDataGenerator;