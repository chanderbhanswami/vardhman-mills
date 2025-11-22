// Terms & Conditions components barrel exports
export { default as TermsConditionsContent } from './TermsConditionsContent';

// Terms & Conditions specific types and interfaces
export interface TermsSection {
  id: string;
  title: string;
  content: string;
  subsections?: TermsSubsection[];
  lastUpdated?: string;
  importance: 'high' | 'medium' | 'low';
}

export interface TermsSubsection {
  id: string;
  title: string;
  content: string;
  examples?: string[];
  restrictions?: string[];
}

export interface LegalDefinition {
  term: string;
  definition: string;
  context?: string;
}

export interface UserObligation {
  id: string;
  category: string;
  title: string;
  description: string;
  consequences?: string;
  examples?: string[];
}

export interface ServiceLimitation {
  id: string;
  category: string;
  title: string;
  description: string;
  scope: string;
  exceptions?: string[];
}

export interface DisputeResolution {
  id: string;
  step: number;
  title: string;
  description: string;
  timeframe?: string;
  requirements?: string[];
}

export interface TermsConditionsData {
  lastUpdated: string;
  version: string;
  effectiveDate: string;
  applicableJurisdiction: string;
  companyInfo: {
    name: string;
    registrationNumber: string;
    address: string;
    email: string;
    phone: string;
  };
  definitions: LegalDefinition[];
  termsAgreement: {
    acceptanceMethod: string;
    bindingConditions: string[];
    modifications: string;
  };
  sections: TermsSection[];
  userObligations: UserObligation[];
  serviceLimitations: ServiceLimitation[];
  disputeResolution: DisputeResolution[];
  governingLaw: {
    jurisdiction: string;
    court: string;
    language: string;
  };
  contactInfo: {
    legal: string;
    support: string;
    hours: string;
  };
}

// Utility functions
export const getSectionImportanceColor = (importance: 'high' | 'medium' | 'low'): string => {
  switch (importance) {
    case 'high':
      return 'border-red-200 bg-red-50';
    case 'medium':
      return 'border-yellow-200 bg-yellow-50';
    case 'low':
      return 'border-green-200 bg-green-50';
    default:
      return 'border-gray-200 bg-gray-50';
  }
};

export const getSectionImportanceIcon = (importance: 'high' | 'medium' | 'low'): string => {
  switch (importance) {
    case 'high':
      return 'text-red-600';
    case 'medium':
      return 'text-yellow-600';
    case 'low':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
};

export const formatLegalDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const generateTermsAcceptanceRecord = (userId: string, version: string): {
  userId: string;
  version: string;
  acceptedAt: string;
  ipAddress: string;
  userAgent: string;
} => {
  return {
    userId,
    version,
    acceptedAt: new Date().toISOString(),
    ipAddress: 'Client IP', // In real implementation, get actual IP
    userAgent: navigator.userAgent
  };
};

// Default terms & conditions data
export const defaultTermsConditionsData: TermsConditionsData = {
  lastUpdated: '2024-10-01',
  version: '2.3',
  effectiveDate: '2024-10-01',
  applicableJurisdiction: 'India',
  companyInfo: {
    name: 'Vardhman Mills Limited',
    registrationNumber: 'CIN: L17111MH1965PLC012345',
    address: 'Vardhman Mills Complex, Industrial Area, Mumbai, Maharashtra 400001, India',
    email: 'legal@vardhmanmills.com',
    phone: '+91-1234-567890'
  },
  definitions: [
    {
      term: 'Company',
      definition: 'Refers to Vardhman Mills Limited, its subsidiaries, affiliates, and authorized representatives.',
      context: 'Used throughout these terms to refer to the service provider.'
    },
    {
      term: 'User/Customer',
      definition: 'Any individual or entity that accesses, uses, or purchases from our website and services.',
      context: 'Includes both registered and guest users.'
    },
    {
      term: 'Services',
      definition: 'All products, services, website functionality, and customer support provided by the Company.',
      context: 'Encompasses the entire range of our offerings.'
    },
    {
      term: 'Products',
      definition: 'Home textiles, fabrics, and related merchandise offered for sale by the Company.',
      context: 'Physical goods available for purchase.'
    },
    {
      term: 'Website',
      definition: 'The vardhmanmills.com domain and all associated subdomains and mobile applications.',
      context: 'Digital platforms operated by the Company.'
    },
    {
      term: 'Account',
      definition: 'A registered user profile created to access personalized services and make purchases.',
      context: 'User-specific access credentials and data.'
    }
  ],
  termsAgreement: {
    acceptanceMethod: 'By using our services, making a purchase, or creating an account, you agree to these terms.',
    bindingConditions: [
      'Legal capacity to enter into binding contracts',
      'Compliance with all applicable laws and regulations',
      'Accurate and truthful information provided during registration',
      'Acknowledgment of having read and understood these terms'
    ],
    modifications: 'We reserve the right to modify these terms at any time. Continued use constitutes acceptance of modified terms.'
  },
  sections: [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      content: 'By accessing or using our website and services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our services.',
      importance: 'high',
      subsections: [
        {
          id: 'legal_capacity',
          title: 'Legal Capacity',
          content: 'You must be at least 18 years old or have legal guardian consent to use our services. By using our services, you represent that you have the legal capacity to enter into this agreement.',
          restrictions: [
            'Minors under 18 require parental/guardian consent',
            'Business accounts require proper authorization',
            'Fraudulent information voids this agreement'
          ]
        },
        {
          id: 'binding_nature',
          title: 'Binding Agreement',
          content: 'These terms constitute a legally binding agreement between you and Vardhman Mills. Your use of our services indicates acceptance of all terms and conditions outlined herein.',
          examples: [
            'Creating an account',
            'Making a purchase',
            'Downloading content',
            'Subscribing to newsletters'
          ]
        }
      ]
    },
    {
      id: 'account_registration',
      title: 'Account Registration and Security',
      content: 'To access certain features of our services, you may be required to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.',
      importance: 'high',
      subsections: [
        {
          id: 'account_information',
          title: 'Account Information',
          content: 'You must provide accurate, complete, and up-to-date information when creating your account. You are responsible for updating your information to maintain its accuracy.',
          restrictions: [
            'False information may result in account suspension',
            'Duplicate accounts are not permitted',
            'Business accounts require additional verification'
          ]
        },
        {
          id: 'password_security',
          title: 'Password Security',
          content: 'You are solely responsible for maintaining the security of your password and account. You must notify us immediately of any unauthorized access or security breach.',
          examples: [
            'Use strong, unique passwords',
            'Do not share login credentials',
            'Enable two-factor authentication when available',
            'Log out from shared devices'
          ]
        }
      ]
    },
    {
      id: 'product_orders',
      title: 'Product Orders and Pricing',
      content: 'All orders are subject to availability and acceptance by Vardhman Mills. We reserve the right to limit quantities, refuse orders, or cancel orders at our discretion.',
      importance: 'high',
      subsections: [
        {
          id: 'order_acceptance',
          title: 'Order Acceptance',
          content: 'An order is considered accepted when we send you an order confirmation email. Until acceptance, we may reject orders for various reasons including stock availability, pricing errors, or fraud prevention.',
          restrictions: [
            'Orders subject to inventory availability',
            'Bulk orders may require special approval',
            'International orders subject to export regulations'
          ]
        },
        {
          id: 'pricing_policy',
          title: 'Pricing and Payment',
          content: 'All prices are listed in Indian Rupees (INR) and include applicable taxes unless otherwise stated. We reserve the right to change prices without notice, but price changes will not affect orders already confirmed.',
          examples: [
            'GST charges as applicable',
            'Shipping charges calculated separately',
            'Promotional pricing subject to terms',
            'Currency conversion rates may apply for international orders'
          ]
        }
      ]
    },
    {
      id: 'shipping_delivery',
      title: 'Shipping and Delivery',
      content: 'We strive to deliver orders within the estimated timeframes, but delivery dates are approximate and not guaranteed. Risk of loss passes to you upon delivery to the carrier.',
      importance: 'medium',
      subsections: [
        {
          id: 'delivery_timeframes',
          title: 'Delivery Estimates',
          content: 'Delivery timeframes are estimates based on normal business conditions. Delays may occur due to weather, holidays, or other circumstances beyond our control.',
          restrictions: [
            'Remote locations may require additional time',
            'Custom orders have extended delivery periods',
            'International shipping subject to customs delays'
          ]
        },
        {
          id: 'shipping_responsibility',
          title: 'Shipping Responsibility',
          content: 'Once your order is handed over to the shipping carrier, the risk of loss or damage transfers to you. We recommend purchasing shipping insurance for valuable orders.',
          examples: [
            'Inspect packages upon delivery',
            'Report damage within 48 hours',
            'Keep tracking information for reference',
            'Coordinate with carrier for delivery issues'
          ]
        }
      ]
    },
    {
      id: 'returns_refunds',
      title: 'Returns and Refunds',
      content: 'Our return policy allows returns of eligible items within specified timeframes. Refunds will be processed according to our return policy guidelines.',
      importance: 'medium',
      subsections: [
        {
          id: 'return_eligibility',
          title: 'Return Eligibility',
          content: 'Items must be returned in original condition with tags attached. Custom or personalized items are generally not eligible for return unless defective.',
          restrictions: [
            'Items must be unused and in original packaging',
            'Custom-made products are final sale',
            'Hygiene-sensitive items cannot be returned',
            'Return window varies by product category'
          ]
        },
        {
          id: 'refund_process',
          title: 'Refund Processing',
          content: 'Refunds will be processed to the original payment method within 5-7 business days of receiving the returned item. Shipping charges are non-refundable unless the return is due to our error.',
          examples: [
            'Credit card refunds take 3-5 business days',
            'Bank transfers may take up to 7 business days',
            'Store credit is issued immediately',
            'Partial refunds for damaged items'
          ]
        }
      ]
    },
    {
      id: 'intellectual_property',
      title: 'Intellectual Property Rights',
      content: 'All content on our website, including designs, text, graphics, logos, and images, is protected by intellectual property laws and belongs to Vardhman Mills or our licensors.',
      importance: 'high',
      subsections: [
        {
          id: 'trademark_copyright',
          title: 'Trademarks and Copyrights',
          content: 'The Vardhman Mills name, logo, and all related marks are trademarks of Vardhman Mills Limited. Unauthorized use of our intellectual property is strictly prohibited.',
          restrictions: [
            'No use of company logos without permission',
            'No reproduction of product designs',
            'No unauthorized commercial use of content',
            'No reverse engineering of proprietary processes'
          ]
        },
        {
          id: 'user_content',
          title: 'User-Generated Content',
          content: 'By submitting content to our website (reviews, comments, images), you grant us a non-exclusive, royalty-free license to use, modify, and display such content.',
          examples: [
            'Product reviews and ratings',
            'Customer photos and testimonials',
            'Comments and feedback',
            'Social media mentions'
          ]
        }
      ]
    },
    {
      id: 'privacy_data',
      title: 'Privacy and Data Protection',
      content: 'Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information when you use our services.',
      importance: 'high',
      subsections: [
        {
          id: 'data_collection',
          title: 'Data Collection and Use',
          content: 'We collect personal information necessary to provide our services, process orders, and improve your experience. All data collection is governed by our Privacy Policy.',
          restrictions: [
            'Data collected only for legitimate purposes',
            'No sale of personal information to third parties',
            'Data retention limited to necessary periods',
            'User rights respected under applicable laws'
          ]
        },
        {
          id: 'data_security',
          title: 'Data Security',
          content: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.',
          examples: [
            'Encryption of sensitive data',
            'Secure payment processing',
            'Regular security audits',
            'Employee access controls'
          ]
        }
      ]
    },
    {
      id: 'prohibited_uses',
      title: 'Prohibited Uses and Conduct',
      content: 'You agree not to use our services for any unlawful purpose or in any way that could damage, disable, or impair our services or interfere with other users enjoyment of our services.',
      importance: 'high',
      subsections: [
        {
          id: 'unlawful_activities',
          title: 'Unlawful Activities',
          content: 'You may not use our services for any illegal activities, fraud, or to violate any applicable laws or regulations.',
          restrictions: [
            'No fraudulent transactions or chargebacks',
            'No money laundering or illegal financial activities',
            'No violation of export/import regulations',
            'No harassment or abusive behavior'
          ]
        },
        {
          id: 'system_abuse',
          title: 'System Abuse',
          content: 'You may not attempt to gain unauthorized access to our systems, disrupt our services, or use automated systems to access our website without permission.',
          examples: [
            'No hacking or unauthorized access attempts',
            'No use of bots or automated scraping',
            'No attempt to overwhelm our servers',
            'No reverse engineering of our systems'
          ]
        }
      ]
    },
    {
      id: 'limitation_liability',
      title: 'Limitation of Liability',
      content: 'To the maximum extent permitted by law, Vardhman Mills shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services.',
      importance: 'medium',
      subsections: [
        {
          id: 'damage_limitations',
          title: 'Types of Damages',
          content: 'Our liability is limited to direct damages and shall not exceed the amount paid by you for the specific product or service that gave rise to the claim.',
          restrictions: [
            'No liability for lost profits or business',
            'No liability for data loss or corruption',
            'No liability for third-party actions',
            'Liability cap at purchase amount'
          ]
        },
        {
          id: 'force_majeure',
          title: 'Force Majeure',
          content: 'We are not liable for any failure to perform our obligations due to circumstances beyond our reasonable control, including natural disasters, war, terrorism, or government actions.',
          examples: [
            'Natural disasters and extreme weather',
            'Government regulations and restrictions',
            'Labor strikes and transportation issues',
            'Technical failures beyond our control'
          ]
        }
      ]
    },
    {
      id: 'termination',
      title: 'Termination',
      content: 'We may terminate or suspend your access to our services immediately, without prior notice or liability, for any reason, including breach of these Terms and Conditions.',
      importance: 'medium',
      subsections: [
        {
          id: 'termination_grounds',
          title: 'Grounds for Termination',
          content: 'We may terminate accounts for violation of terms, fraudulent activity, abuse of our services, or any other reason at our sole discretion.',
          restrictions: [
            'Violation of terms and conditions',
            'Fraudulent or illegal activities',
            'Abuse of customer service',
            'Chargebacks or payment disputes'
          ]
        },
        {
          id: 'effect_termination',
          title: 'Effect of Termination',
          content: 'Upon termination, your right to use our services ceases immediately. Termination does not affect any accrued rights or obligations.',
          examples: [
            'Immediate loss of account access',
            'Pending orders may be cancelled',
            'Outstanding obligations remain valid',
            'Data may be deleted after reasonable notice'
          ]
        }
      ]
    }
  ],
  userObligations: [
    {
      id: 'accurate_information',
      category: 'Account Management',
      title: 'Provide Accurate Information',
      description: 'You must provide truthful, accurate, and complete information when registering and using our services.',
      consequences: 'Account suspension or termination for false information',
      examples: [
        'Correct name and contact details',
        'Valid shipping and billing addresses',
        'Legitimate payment information',
        'Updated account information'
      ]
    },
    {
      id: 'lawful_use',
      category: 'Service Usage',
      title: 'Lawful Use Only',
      description: 'You must use our services only for lawful purposes and in accordance with these terms.',
      consequences: 'Legal action and immediate account termination',
      examples: [
        'Comply with all applicable laws',
        'Respect intellectual property rights',
        'No fraudulent activities',
        'No harassment of other users'
      ]
    },
    {
      id: 'payment_obligations',
      category: 'Financial',
      title: 'Payment Obligations',
      description: 'You are responsible for all charges incurred under your account and must pay all amounts owed promptly.',
      consequences: 'Collection action and account restrictions',
      examples: [
        'Timely payment for orders',
        'Valid payment methods',
        'No chargebacks without cause',
        'Responsibility for applicable taxes'
      ]
    },
    {
      id: 'account_security',
      category: 'Security',
      title: 'Account Security',
      description: 'You must maintain the security of your account credentials and notify us of any unauthorized access.',
      consequences: 'Liability for unauthorized account usage',
      examples: [
        'Strong password protection',
        'Secure logout from shared devices',
        'Immediate reporting of breaches',
        'No sharing of login credentials'
      ]
    }
  ],
  serviceLimitations: [
    {
      id: 'availability',
      category: 'Service Availability',
      title: 'Service Availability',
      description: 'We do not guarantee uninterrupted or error-free service availability.',
      scope: 'All digital services and website functionality',
      exceptions: [
        'Scheduled maintenance windows',
        'Emergency security updates',
        'Third-party service dependencies'
      ]
    },
    {
      id: 'product_availability',
      category: 'Product Availability',
      title: 'Product Stock',
      description: 'Product availability is subject to stock levels and may change without notice.',
      scope: 'All physical products and inventory',
      exceptions: [
        'Custom orders may have different availability',
        'Seasonal products have limited availability',
        'Discontinued items may be unavailable'
      ]
    },
    {
      id: 'geographic_limitations',
      category: 'Geographic Scope',
      title: 'Geographic Limitations',
      description: 'Our services may not be available in all geographic locations.',
      scope: 'Shipping and service coverage areas',
      exceptions: [
        'International shipping restrictions',
        'Local regulatory limitations',
        'Carrier service area limitations'
      ]
    },
    {
      id: 'technical_limitations',
      category: 'Technical',
      title: 'Technical Limitations',
      description: 'Our services are subject to technical limitations and may not be compatible with all devices or browsers.',
      scope: 'Website functionality and mobile applications',
      exceptions: [
        'Legacy browser support',
        'Device-specific limitations',
        'Network connectivity requirements'
      ]
    }
  ],
  disputeResolution: [
    {
      id: 'direct_contact',
      step: 1,
      title: 'Direct Contact',
      description: 'Contact our customer service team to resolve the dispute informally.',
      timeframe: '30 days from issue occurrence',
      requirements: [
        'Detailed description of the issue',
        'Supporting documentation',
        'Good faith effort to resolve'
      ]
    },
    {
      id: 'formal_complaint',
      step: 2,
      title: 'Formal Complaint',
      description: 'Submit a formal written complaint if informal resolution fails.',
      timeframe: '60 days from initial contact',
      requirements: [
        'Written complaint with specific details',
        'Evidence of previous contact attempts',
        'Proposed resolution'
      ]
    },
    {
      id: 'mediation',
      step: 3,
      title: 'Mediation',
      description: 'Participate in mediation through a mutually agreed mediator.',
      timeframe: '90 days from formal complaint',
      requirements: [
        'Agreement on mediator selection',
        'Shared mediation costs',
        'Good faith participation'
      ]
    },
    {
      id: 'arbitration',
      step: 4,
      title: 'Arbitration',
      description: 'Binding arbitration as the final dispute resolution mechanism.',
      timeframe: '180 days from mediation failure',
      requirements: [
        'Arbitrator selection per rules',
        'Binding decision acceptance',
        'Cost allocation per arbitration rules'
      ]
    }
  ],
  governingLaw: {
    jurisdiction: 'Laws of India',
    court: 'Courts of Mumbai, Maharashtra',
    language: 'English'
  },
  contactInfo: {
    legal: 'legal@vardhmanmills.com',
    support: 'support@vardhmanmills.com',
    hours: 'Monday-Saturday: 9:00 AM - 7:00 PM IST'
  }
};
