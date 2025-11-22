/**
 * About Page Types - Vardhman Mills Frontend
 * 
 * Comprehensive type definitions for the About Us page, company information,
 * team members, history, values, and related content.
 * 
 * @version 1.0.0
 * @created 2024-01-12
 */

import { ID, Timestamp, BaseEntity, ImageAsset, SEOData } from './common.types';

// ============================================================================
// COMPANY INFORMATION TYPES
// ============================================================================

/**
 * Main company information structure
 */
export interface CompanyInfo extends BaseEntity {
  // Basic Information
  companyName: string;
  tagline: string;
  description: string;
  foundedYear: number;
  founder: string;
  
  // Contact Details
  headquarters: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  
  // Business Information
  registrationNumber: string;
  taxId: string;
  businessType: 'Private Limited' | 'Public Limited' | 'Partnership' | 'Sole Proprietorship';
  industry: string;
  
  // Media Assets
  logo: ImageAsset;
  coverImage: ImageAsset;
  galleryImages: ImageAsset[];
  
  // Company Statistics
  stats: CompanyStatistics;
  
  // SEO
  seo: SEOData;
  
  // Timestamps
  lastUpdated: Timestamp;
}

/**
 * Company statistics and metrics
 */
export interface CompanyStatistics {
  totalEmployees: number;
  yearsInBusiness: number;
  totalCustomers: number;
  productsOffered: number;
  citiesServed: number;
  manufacturingUnits: number;
  revenueGrowth?: number; // Year over year growth percentage
  customerSatisfactionRate?: number; // Percentage
  sustainabilityScore?: number; // Environmental score
}

// ============================================================================
// COMPANY VALUES AND MISSION TYPES
// ============================================================================

/**
 * Company mission, vision, and values
 */
export interface CompanyValues extends BaseEntity {
  mission: {
    title: string;
    description: string;
    keyPoints: string[];
    icon?: ImageAsset;
  };
  
  vision: {
    title: string;
    description: string;
    keyPoints: string[];
    icon?: ImageAsset;
  };
  
  values: CoreValue[];
  
  // Quality commitments
  qualityCommitments: QualityCommitment[];
  
  // Sustainability initiatives
  sustainabilityInitiatives: SustainabilityInitiative[];
}

/**
 * Individual core value
 */
export interface CoreValue {
  id: ID;
  title: string;
  description: string;
  icon: ImageAsset;
  examples: string[];
  order: number;
}

/**
 * Quality commitment structure
 */
export interface QualityCommitment {
  id: ID;
  title: string;
  description: string;
  certification?: string;
  icon?: ImageAsset;
  verificationUrl?: string;
}

/**
 * Sustainability initiative
 */
export interface SustainabilityInitiative {
  id: ID;
  title: string;
  description: string;
  impact: string;
  startDate: Timestamp;
  status: 'Active' | 'Completed' | 'Planned';
  metrics?: {
    metric: string;
    value: number;
    unit: string;
  }[];
  image?: ImageAsset;
}

// ============================================================================
// TEAM MEMBER TYPES
// ============================================================================

/**
 * Team member information
 */
export interface TeamMember extends BaseEntity {
  // Personal Information
  firstName: string;
  lastName: string;
  fullName: string;
  
  // Professional Information
  position: string;
  department: 'Leadership' | 'Operations' | 'Design' | 'Manufacturing' | 'Sales' | 'Customer Service' | 'Finance' | 'HR';
  level: 'Executive' | 'Senior' | 'Mid' | 'Junior';
  
  // Contact Information
  email?: string;
  phone?: string;
  linkedin?: string;
  
  // Profile Details
  bio: string;
  expertise: string[];
  yearsOfExperience: number;
  education: Education[];
  achievements: Achievement[];
  
  // Media
  profileImage: ImageAsset;
  coverImage?: ImageAsset;
  
  // Work Information
  joinedDate: Timestamp;
  location: string;
  
  // Display Settings
  isPublic: boolean;
  displayOrder: number;
  isFeatured: boolean;
  
  // Social Links
  socialLinks: SocialLink[];
}

/**
 * Education information for team members
 */
export interface Education {
  id: ID;
  institution: string;
  degree: string;
  field: string;
  graduationYear: number;
  grade?: string;
}

/**
 * Achievement or award information
 */
export interface Achievement {
  id: ID;
  title: string;
  description: string;
  awardedBy: string;
  date: Timestamp;
  category: 'Professional' | 'Academic' | 'Industry' | 'Community';
  verificationUrl?: string;
}

/**
 * Social media links
 */
export interface SocialLink {
  platform: 'LinkedIn' | 'Twitter' | 'Facebook' | 'Instagram' | 'Website' | 'Other';
  url: string;
  username?: string;
}

// ============================================================================
// COMPANY HISTORY TYPES
// ============================================================================

/**
 * Company history and timeline
 */
export interface CompanyHistory extends BaseEntity {
  timeline: HistoryMilestone[];
  eras: CompanyEra[];
  achievements: CompanyAchievement[];
}

/**
 * Individual milestone in company history
 */
export interface HistoryMilestone {
  id: ID;
  year: number;
  month?: number;
  title: string;
  description: string;
  category: 'Founding' | 'Product Launch' | 'Expansion' | 'Partnership' | 'Award' | 'Innovation' | 'Milestone';
  impact: string;
  image?: ImageAsset;
  
  // Additional details
  keyFigures?: string[];
  location?: string;
  significance: 'High' | 'Medium' | 'Low';
}

/**
 * Company era or phase
 */
export interface CompanyEra {
  id: ID;
  name: string;
  startYear: number;
  endYear?: number; // undefined for current era
  description: string;
  keyCharacteristics: string[];
  majorAchievements: string[];
  challenges: string[];
  image?: ImageAsset;
}

/**
 * Company-wide achievement
 */
export interface CompanyAchievement {
  id: ID;
  title: string;
  description: string;
  category: 'Award' | 'Certification' | 'Recognition' | 'Record' | 'Innovation';
  awardedBy: string;
  date: Timestamp;
  significance: 'International' | 'National' | 'Regional' | 'Industry';
  verificationUrl?: string;
  media?: ImageAsset[];
}

// ============================================================================
// MANUFACTURING AND FACILITIES TYPES
// ============================================================================

/**
 * Manufacturing facility information
 */
export interface ManufacturingFacility extends BaseEntity {
  // Basic Information
  name: string;
  type: 'Manufacturing' | 'Warehouse' | 'Office' | 'Showroom' | 'R&D Center';
  
  // Location
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  
  // Facility Details
  establishedYear: number;
  totalArea: number; // in square feet/meters
  productionCapacity: ProductionCapacity[];
  
  // Staff
  totalEmployees: number;
  departments: FacilityDepartment[];
  
  // Certifications
  certifications: FacilityCertification[];
  
  // Equipment and Technology
  equipmentList: Equipment[];
  technologyStack: string[];
  
  // Environmental
  sustainabilityFeatures: string[];
  environmentalRating?: string;
  
  // Media
  images: ImageAsset[];
  virtualTourUrl?: string;
  
  // Contact
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
}

/**
 * Production capacity for different product types
 */
export interface ProductionCapacity {
  productType: string;
  dailyCapacity: number;
  monthlyCapacity: number;
  unit: string;
  utilizationRate: number; // Percentage
}

/**
 * Facility department information
 */
export interface FacilityDepartment {
  name: string;
  headOfDepartment: string;
  employeeCount: number;
  functions: string[];
}

/**
 * Facility certification
 */
export interface FacilityCertification {
  name: string;
  issuedBy: string;
  issueDate: Timestamp;
  expiryDate?: Timestamp;
  certificateNumber: string;
  verificationUrl?: string;
  scope: string;
}

/**
 * Equipment information
 */
export interface Equipment {
  id: ID;
  name: string;
  type: string;
  manufacturer: string;
  model: string;
  purchaseDate: Timestamp;
  capacity?: string;
  status: 'Active' | 'Maintenance' | 'Retired';
  department: string;
}

// ============================================================================
// CUSTOMER TESTIMONIALS AND STORIES TYPES
// ============================================================================

/**
 * Customer testimonial for about page
 */
export interface CustomerTestimonial extends BaseEntity {
  // Customer Information
  customerName: string;
  customerTitle?: string;
  companyName?: string;
  location: string;
  
  // Testimonial Content
  title: string;
  content: string;
  rating: number; // 1-5
  
  // Media
  customerImage?: ImageAsset;
  projectImages?: ImageAsset[];
  videoTestimonial?: {
    url: string;
    thumbnail: ImageAsset;
    duration: number;
  };
  
  // Project Details
  projectType?: string;
  projectValue?: number;
  completionDate?: Timestamp;
  
  // Display Settings
  isFeatured: boolean;
  isVerified: boolean;
  displayOrder: number;
  showOnHomepage: boolean;
  
  // Categories
  category: 'Residential' | 'Commercial' | 'Industrial' | 'Hospitality' | 'Healthcare' | 'Education';
  productCategories: string[];
}

/**
 * Success story or case study
 */
export interface SuccessStory extends BaseEntity {
  // Basic Information
  title: string;
  subtitle?: string;
  summary: string;
  
  // Story Content
  challenge: string;
  solution: string;
  results: string;
  
  // Customer Information
  customer: {
    name: string;
    industry: string;
    location: string;
    size: string;
    website?: string;
  };
  
  // Project Details
  project: {
    scope: string;
    timeline: string;
    budget?: string;
    team: string[];
  };
  
  // Metrics and Results
  metrics: ProjectMetric[];
  
  // Media
  heroImage: ImageAsset;
  beforeAfterImages?: {
    before: ImageAsset;
    after: ImageAsset;
    caption: string;
  }[];
  galleryImages: ImageAsset[];
  
  // SEO and Display
  slug: string;
  seo: SEOData;
  isFeatured: boolean;
  publishedDate: Timestamp;
  
  // Related Information
  relatedProducts: ID[];
  tags: string[];
}

/**
 * Project metric for measuring success
 */
export interface ProjectMetric {
  name: string;
  value: string | number;
  unit?: string;
  improvement?: string;
  description?: string;
}

// ============================================================================
// AWARDS AND RECOGNITION TYPES
// ============================================================================

/**
 * Award or recognition received by the company
 */
export interface Award extends BaseEntity {
  // Award Information
  title: string;
  description: string;
  category: 'Product Excellence' | 'Innovation' | 'Customer Service' | 'Sustainability' | 'Growth' | 'Industry Leadership';
  
  // Awarding Organization
  awardedBy: {
    name: string;
    website?: string;
    logo?: ImageAsset;
    credibility: 'International' | 'National' | 'Regional' | 'Industry';
  };
  
  // Date and Ceremony
  awardDate: Timestamp;
  ceremonyLocation?: string;
  ceremonyDate?: Timestamp;
  
  // Award Details
  criteria: string[];
  significance: string;
  competitorCount?: number;
  
  // Media
  awardImage: ImageAsset;
  certificateImage?: ImageAsset;
  ceremonyImages?: ImageAsset[];
  pressRelease?: string;
  
  // Verification
  verificationUrl?: string;
  certificateNumber?: string;
  
  // Display
  isFeatured: boolean;
  displayOrder: number;
  showOnHomepage: boolean;
}

// ============================================================================
// COMPANY POLICIES AND COMMITMENTS TYPES
// ============================================================================

/**
 * Company policy document
 */
export interface CompanyPolicy extends BaseEntity {
  // Policy Information
  title: string;
  description: string;
  category: 'Quality' | 'Environmental' | 'Social' | 'Ethics' | 'Safety' | 'Privacy' | 'Sustainability';
  
  // Content
  content: string;
  keyPoints: string[];
  
  // Implementation
  implementationDate: Timestamp;
  lastReviewDate: Timestamp;
  nextReviewDate: Timestamp;
  
  // Compliance
  complianceStandards: string[];
  certifications: string[];
  
  // Documents
  policyDocument?: {
    url: string;
    filename: string;
    size: number;
    version: string;
  };
  
  // Approval
  approvedBy: string;
  approvalDate: Timestamp;
  
  // Display
  isPublic: boolean;
  displayOrder: number;
}

// ============================================================================
// CONTACT AND OFFICE INFORMATION TYPES
// ============================================================================

/**
 * Office or branch location
 */
export interface OfficeLocation extends BaseEntity {
  // Basic Information
  name: string;
  type: 'Head Office' | 'Branch Office' | 'Manufacturing Unit' | 'Warehouse' | 'Showroom' | 'Service Center';
  
  // Address
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    landmark?: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  
  // Contact Information
  phone: string[];
  email: string[];
  fax?: string;
  website?: string;
  
  // Operating Hours
  operatingHours: {
    [key in 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday']: {
      isOpen: boolean;
      openTime?: string;
      closeTime?: string;
      breakTime?: {
        start: string;
        end: string;
      };
    };
  };
  
  // Services
  servicesOffered: string[];
  facilities: string[];
  
  // Staff
  totalEmployees: number;
  keyPersonnel: {
    name: string;
    designation: string;
    phone?: string;
    email?: string;
  }[];
  
  // Media
  images: ImageAsset[];
  mapEmbedUrl?: string;
  
  // Additional Information
  parkingAvailable: boolean;
  publicTransportAccess: string[];
  nearbyLandmarks: string[];
  
  // Display
  isActive: boolean;
  displayOrder: number;
  showOnContactPage: boolean;
}

// ============================================================================
// PARTNERSHIP AND COLLABORATION TYPES
// ============================================================================

/**
 * Business partnership information
 */
export interface Partnership extends BaseEntity {
  // Partner Information
  partnerName: string;
  partnerType: 'Supplier' | 'Distributor' | 'Technology Partner' | 'Strategic Alliance' | 'Joint Venture' | 'Certification Body';
  
  // Partnership Details
  description: string;
  startDate: Timestamp;
  endDate?: Timestamp;
  status: 'Active' | 'Inactive' | 'Renewed' | 'Terminated';
  
  // Business Impact
  benefits: string[];
  keyAchievements: string[];
  
  // Partner Details
  partnerInfo: {
    website?: string;
    logo?: ImageAsset;
    headquarters: string;
    industry: string;
    size: string;
  };
  
  // Display
  isPublic: boolean;
  isFeatured: boolean;
  displayOrder: number;
}

// ============================================================================
// FAQ AND HELP TYPES FOR ABOUT SECTION
// ============================================================================

/**
 * FAQ specific to company information
 */
export interface AboutFAQ extends BaseEntity {
  question: string;
  answer: string;
  category: 'Company History' | 'Manufacturing' | 'Quality' | 'Careers' | 'Partnerships' | 'Sustainability' | 'General';
  
  // SEO and Display
  isPopular: boolean;
  viewCount: number;
  lastUpdated: Timestamp;
  displayOrder: number;
  
  // Related Information
  relatedFAQs: ID[];
  relatedPages: string[];
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * API response for about page data
 */
export interface AboutPageResponse {
  companyInfo: CompanyInfo;
  companyValues: CompanyValues;
  teamMembers: TeamMember[];
  companyHistory: CompanyHistory;
  facilities: ManufacturingFacility[];
  testimonials: CustomerTestimonial[];
  successStories: SuccessStory[];
  awards: Award[];
  policies: CompanyPolicy[];
  offices: OfficeLocation[];
  partnerships: Partnership[];
  faqs: AboutFAQ[];
  
  // Meta information
  lastUpdated: Timestamp;
  version: string;
}

/**
 * Filtered team members response
 */
export interface TeamMembersResponse {
  members: TeamMember[];
  departments: string[];
  totalCount: number;
  featuredMembers: TeamMember[];
}

/**
 * Company statistics response
 */
export interface CompanyStatsResponse {
  stats: CompanyStatistics;
  historicalData: {
    year: number;
    stats: Partial<CompanyStatistics>;
  }[];
  industryBenchmarks?: Partial<CompanyStatistics>;
}

// ============================================================================
// FORM TYPES FOR ADMIN MANAGEMENT
// ============================================================================

/**
 * Form data for creating/updating team member
 */
export interface TeamMemberFormData {
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  level: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  bio: string;
  expertise: string[];
  yearsOfExperience: number;
  location: string;
  isPublic: boolean;
  isFeatured: boolean;
  profileImage: File | string;
  education: Omit<Education, 'id'>[];
  achievements: Omit<Achievement, 'id'>[];
  socialLinks: SocialLink[];
}

/**
 * Form data for company information update
 */
export interface CompanyInfoFormData {
  companyName: string;
  tagline: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  logo: File | string;
  coverImage: File | string;
  galleryImages: (File | string)[];
}

// ============================================================================
// ANALYTICS TYPES FOR ABOUT PAGE
// ============================================================================

/**
 * Analytics data for about page
 */
export interface AboutPageAnalytics {
  // Page Views
  totalViews: number;
  uniqueViews: number;
  viewsBySection: {
    section: string;
    views: number;
    timeSpent: number;
  }[];
  
  // User Engagement
  averageTimeOnPage: number;
  bounceRate: number;
  scrollDepth: number;
  
  // Team Member Interactions
  teamMemberViews: {
    memberId: ID;
    memberName: string;
    views: number;
    profileClicks: number;
  }[];
  
  // Download and Contact Actions
  brochureDownloads: number;
  contactFormSubmissions: number;
  phoneCallClicks: number;
  emailClicks: number;
  
  // Geographic Data
  viewsByCountry: {
    country: string;
    views: number;
  }[];
  
  // Time-based Data
  viewsByTimeOfDay: number[];
  viewsByDayOfWeek: number[];
  viewsByMonth: number[];
}

// ============================================================================
// EXPORT STATEMENTS
// ============================================================================

// All types are already exported inline above, no need for re-export

// Default export for convenience
export default CompanyInfo;
