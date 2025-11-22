// Privacy Policy components barrel exports
export { default as PrivacyPolicyContent } from './PrivacyPolicyContent';

// Privacy-specific types and interfaces
export interface DataCategory {
  id: string;
  name: string;
  description: string;
  dataTypes: string[];
  purpose: string[];
  retention: string;
  lawfulBasis?: string;
}

export interface DataRight {
  id: string;
  name: string;
  description: string;
  howToExercise: string;
  icon: string;
}

export interface PrivacySection {
  id: string;
  title: string;
  content: string;
  subsections?: PrivacySubsection[];
}

export interface PrivacySubsection {
  id: string;
  title: string;
  content: string;
}

export interface PrivacyPolicyData {
  lastUpdated: string;
  version: string;
  effectiveDate: string;
  dataController: {
    name: string;
    address: string;
    email: string;
    phone: string;
    dpoEmail?: string;
  };
  dataCategories: DataCategory[];
  dataRights: DataRight[];
  sections: PrivacySection[];
}

// Privacy utility functions
export const formatDataRetention = (retention: string): string => {
  const retentionMap: Record<string, string> = {
    'session': 'Until you close your browser',
    '30days': '30 days',
    '1year': '1 year',
    '3years': '3 years',
    '7years': '7 years (legal requirement)',
    'indefinite': 'Until you request deletion',
  };
  
  return retentionMap[retention] || retention;
};

export const getLawfulBasisDescription = (basis: string): string => {
  const basisMap: Record<string, string> = {
    'consent': 'Your explicit consent',
    'contract': 'Performance of a contract',
    'legal_obligation': 'Compliance with legal obligations',
    'vital_interests': 'Protection of vital interests',
    'public_task': 'Performance of a public task',
    'legitimate_interests': 'Legitimate interests',
  };
  
  return basisMap[basis] || basis;
};

// Default privacy policy data
export const defaultPrivacyPolicyData: PrivacyPolicyData = {
  lastUpdated: '2024-10-01',
  version: '2.1',
  effectiveDate: '2024-10-01',
  dataController: {
    name: 'Vardhman Mills Ltd.',
    address: 'Industrial Area, Mumbai, Maharashtra, India - 400001',
    email: 'privacy@vardhmanmills.com',
    phone: '+91-1234-567890',
    dpoEmail: 'dpo@vardhmanmills.com'
  },
  dataCategories: [
    {
      id: 'personal',
      name: 'Personal Information',
      description: 'Basic information that identifies you as an individual',
      dataTypes: ['Name', 'Email address', 'Phone number', 'Postal address', 'Date of birth'],
      purpose: ['Account creation', 'Order processing', 'Customer support', 'Communication'],
      retention: '3years',
      lawfulBasis: 'contract'
    },
    {
      id: 'transactional',
      name: 'Transaction Data',
      description: 'Information related to your purchases and payments',
      dataTypes: ['Order history', 'Payment information', 'Billing address', 'Purchase preferences'],
      purpose: ['Order fulfillment', 'Payment processing', 'Refunds', 'Customer service'],
      retention: '7years',
      lawfulBasis: 'legal_obligation'
    },
    {
      id: 'behavioral',
      name: 'Behavioral Data',
      description: 'Information about how you interact with our website and services',
      dataTypes: ['Browsing history', 'Search queries', 'Click patterns', 'Device information'],
      purpose: ['Website improvement', 'Personalization', 'Analytics', 'Marketing'],
      retention: '1year',
      lawfulBasis: 'legitimate_interests'
    },
    {
      id: 'communication',
      name: 'Communication Data',
      description: 'Records of your communications with us',
      dataTypes: ['Email correspondence', 'Chat logs', 'Support tickets', 'Phone call records'],
      purpose: ['Customer support', 'Quality assurance', 'Training', 'Legal compliance'],
      retention: '3years',
      lawfulBasis: 'legitimate_interests'
    }
  ],
  dataRights: [
    {
      id: 'access',
      name: 'Right to Access',
      description: 'You have the right to request a copy of the personal data we hold about you.',
      howToExercise: 'Submit a data access request through our privacy portal or contact our privacy team.',
      icon: 'eye'
    },
    {
      id: 'rectification',
      name: 'Right to Rectification',
      description: 'You have the right to request correction of inaccurate or incomplete personal data.',
      howToExercise: 'Update your information in your account settings or contact customer support.',
      icon: 'pencil'
    },
    {
      id: 'erasure',
      name: 'Right to Erasure',
      description: 'You have the right to request deletion of your personal data in certain circumstances.',
      howToExercise: 'Submit a deletion request through our privacy portal with valid justification.',
      icon: 'trash'
    },
    {
      id: 'portability',
      name: 'Right to Data Portability',
      description: 'You have the right to receive your personal data in a structured, machine-readable format.',
      howToExercise: 'Request data export through your account settings or contact our privacy team.',
      icon: 'download'
    },
    {
      id: 'restriction',
      name: 'Right to Restriction',
      description: 'You have the right to restrict processing of your personal data in certain circumstances.',
      howToExercise: 'Contact our privacy team with details of why you want to restrict processing.',
      icon: 'pause'
    },
    {
      id: 'objection',
      name: 'Right to Object',
      description: 'You have the right to object to processing based on legitimate interests or for direct marketing.',
      howToExercise: 'Opt out through account settings or contact us to object to specific processing.',
      icon: 'stop'
    }
  ],
  sections: [
    {
      id: 'introduction',
      title: 'Introduction',
      content: 'At Vardhman Mills, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, store, and protect your data when you visit our website, use our services, or interact with us in any way.',
    },
    {
      id: 'data_collection',
      title: 'Information We Collect',
      content: 'We collect information that you provide directly to us, information we collect automatically when you use our services, and information from third-party sources.',
      subsections: [
        {
          id: 'direct_collection',
          title: 'Information You Provide',
          content: 'This includes information you provide when creating an account, making a purchase, contacting customer support, or participating in surveys or promotions.'
        },
        {
          id: 'automatic_collection',
          title: 'Information We Collect Automatically',
          content: 'We automatically collect certain information when you visit our website, including your IP address, browser type, device information, and usage patterns.'
        },
        {
          id: 'third_party_sources',
          title: 'Information from Third Parties',
          content: 'We may receive information about you from business partners, social media platforms, and other third-party sources to enhance our services.'
        }
      ]
    },
    {
      id: 'data_use',
      title: 'How We Use Your Information',
      content: 'We use your personal information for various purposes, always in accordance with applicable privacy laws and our legitimate business interests.',
      subsections: [
        {
          id: 'service_provision',
          title: 'Service Provision',
          content: 'To provide, maintain, and improve our products and services, process transactions, and manage your account.'
        },
        {
          id: 'communication',
          title: 'Communication',
          content: 'To communicate with you about your orders, provide customer support, and send important updates about our services.'
        },
        {
          id: 'personalization',
          title: 'Personalization',
          content: 'To personalize your experience, recommend products, and show you relevant content and advertisements.'
        },
        {
          id: 'analytics',
          title: 'Analytics and Improvement',
          content: 'To analyze usage patterns, improve our website and services, and develop new features and offerings.'
        }
      ]
    },
    {
      id: 'data_sharing',
      title: 'Information Sharing and Disclosure',
      content: 'We do not sell your personal information. We may share your information in limited circumstances as described below.',
      subsections: [
        {
          id: 'service_providers',
          title: 'Service Providers',
          content: 'We share information with trusted third-party service providers who help us operate our business, such as payment processors, shipping companies, and technology providers.'
        },
        {
          id: 'legal_requirements',
          title: 'Legal Requirements',
          content: 'We may disclose information when required by law, court order, or other legal process, or to protect our rights and safety.'
        },
        {
          id: 'business_transfers',
          title: 'Business Transfers',
          content: 'In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction.'
        }
      ]
    },
    {
      id: 'data_security',
      title: 'Data Security',
      content: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.',
      subsections: [
        {
          id: 'technical_measures',
          title: 'Technical Safeguards',
          content: 'We use encryption, secure servers, firewalls, and other security technologies to protect your data both in transit and at rest.'
        },
        {
          id: 'organizational_measures',
          title: 'Organizational Safeguards',
          content: 'We limit access to personal information to employees who need it for legitimate business purposes and provide regular security training.'
        },
        {
          id: 'incident_response',
          title: 'Incident Response',
          content: 'We have procedures in place to detect, investigate, and respond to security incidents, including notification of affected individuals when required.'
        }
      ]
    },
    {
      id: 'international_transfers',
      title: 'International Data Transfers',
      content: 'Your personal information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for such transfers.',
    },
    {
      id: 'children_privacy',
      title: 'Children\'s Privacy',
      content: 'Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.',
    },
    {
      id: 'policy_updates',
      title: 'Changes to This Policy',
      content: 'We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our website and updating the "Last Updated" date.',
    }
  ]
};
