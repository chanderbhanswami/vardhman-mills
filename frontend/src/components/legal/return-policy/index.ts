// Return Policy components barrel exports
export { default as ReturnPolicyContent } from './ReturnPolicyContent';

// Return policy specific types and interfaces
export interface ReturnTimeframe {
  category: string;
  days: number;
  conditions: string[];
  exceptions?: string[];
}

export interface ReturnCondition {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'eligible' | 'ineligible';
}

export interface ReturnProcess {
  step: number;
  title: string;
  description: string;
  duration?: string;
  estimatedTime?: string;
  icon: string;
  requirements?: string[];
}

export interface RefundMethod {
  id: string;
  name: string;
  description: string;
  processingTime: string;
  icon: string;
  fees?: string;
}

export interface ReturnCategory {
  id: string;
  name: string;
  description: string;
  returnWindow: number;
  returnable: boolean;
  conditions: string[];
  specialInstructions?: string[];
  nonReturnable?: boolean;
}

export interface ReturnPolicyData {
  lastUpdated: string;
  version: string;
  generalReturnWindow: number;
  productCategories: ReturnCategory[];
  returnCategories: ReturnCategory[];
  returnConditions: ReturnCondition[];
  returnProcess: ReturnProcess[];
  refundMethods: RefundMethod[];
  returnShipping: {
    returnShippingFee: string;
    freeReturnThreshold?: number;
    returnAddress: {
      name: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      phone?: string;
    };
    cost: number;
  };
  shippingPolicy: {
    returnShippingFee: string;
    freeReturnThreshold?: number;
    returnAddress: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    hours: string;
  };
}

// Utility functions
export const getReturnEligibility = (
  category: string,
  orderDate: string, 
  categories: ReturnCategory[]
): { eligible: boolean; daysLeft: number; reason?: string } => {
  const orderTime = new Date(orderDate).getTime();
  const currentTime = new Date().getTime();
  const daysPassed = Math.floor((currentTime - orderTime) / (1000 * 60 * 60 * 24));
  
  const categoryData = categories.find(cat => cat.id === category);
  
  if (!categoryData) {
    return { eligible: false, daysLeft: 0, reason: 'Category not found' };
  }
  
  if (categoryData.nonReturnable) {
    return { eligible: false, daysLeft: 0, reason: 'This item category is non-returnable' };
  }
  
  const returnWindow = categoryData.returnWindow;
  const daysLeft = returnWindow - daysPassed;
  
  if (daysLeft > 0) {
    return { eligible: true, daysLeft };
  } else {
    return { eligible: false, daysLeft: 0, reason: 'Return window has expired' };
  }
};

export const formatReturnTimeframe = (days: number): string => {
  if (days === 0) return 'Contact customer service';
  if (days === 1) return '1 day';
  if (days < 30) return `${days} days`;
  if (days === 30) return '30 days';
  if (days === 60) return '60 days';
  if (days === 90) return '90 days';
  return `${days} days`;
};

// Default return policy data
export const defaultReturnPolicyData: ReturnPolicyData = {
  lastUpdated: '2024-10-01',
  version: '1.2',
  generalReturnWindow: 30,
  productCategories: [
    {
      id: 'bedsheets',
      name: 'Bed Sheets & Pillowcases',
      description: 'Cotton, silk, and linen bed sheets and pillowcases',
      returnWindow: 30,
      returnable: true,
      conditions: [
        'Items must be unused and in original packaging',
        'All tags and labels must be attached',
        'Items must be clean and odor-free'
      ],
      specialInstructions: [
        'Wash before first use to check for any defects',
        'Contact us within 48 hours if you notice any manufacturing defects'
      ]
    },
    {
      id: 'curtains',
      name: 'Curtains & Drapes',
      description: 'Window treatments including curtains, drapes, and valances',
      returnWindow: 45,
      returnable: true,
      conditions: [
        'Items must be unused and unaltered',
        'Original packaging and hardware included',
        'No custom alterations or hemming'
      ],
      specialInstructions: [
        'Measure your windows carefully before ordering',
        'Custom-sized curtains cannot be returned unless defective'
      ]
    },
    {
      id: 'towels',
      name: 'Towels & Bath Linens',
      description: 'Bath towels, hand towels, washcloths, and bath mats',
      returnWindow: 30,
      returnable: true,
      conditions: [
        'Items must be unused and unwashed',
        'Original tags and packaging required',
        'No signs of use or washing'
      ]
    },
    {
      id: 'upholstery',
      name: 'Upholstery Fabrics',
      description: 'Fabric sold by the yard for upholstery and decorating',
      returnWindow: 14,
      returnable: true,
      conditions: [
        'Fabric must be uncut and in original condition',
        'Minimum 1 yard for returns',
        'No custom cuts or alterations'
      ],
      specialInstructions: [
        'Order samples before purchasing large quantities',
        'Cut fabric cannot be returned unless defective'
      ]
    },
    {
      id: 'decorative',
      name: 'Decorative Pillows & Cushions',
      description: 'Throw pillows, cushions, and decorative accessories',
      returnWindow: 30,
      returnable: true,
      conditions: [
        'Items must be unused with all tags',
        'Original shape and stuffing maintained',
        'No pet hair or odors'
      ]
    },
    {
      id: 'custom',
      name: 'Custom & Made-to-Order Items',
      description: 'Items made specifically to customer specifications',
      returnWindow: 0,
      returnable: false,
      conditions: [],
      nonReturnable: true,
      specialInstructions: [
        'All sales final unless manufacturing defect',
        'Contact within 48 hours for defect claims',
        'Proof of defect required for refund consideration'
      ]
    }
  ],
  returnCategories: [
    {
      id: 'bedsheets',
      name: 'Bed Sheets & Pillowcases',
      description: 'Cotton, silk, and linen bed sheets and pillowcases',
      returnWindow: 30,
      returnable: true,
      conditions: [
        'Items must be unused and in original packaging',
        'All tags and labels must be attached',
        'Items must be clean and odor-free'
      ],
      specialInstructions: [
        'Wash before first use to check for any defects',
        'Contact us within 48 hours if you notice any manufacturing defects'
      ]
    },
    {
      id: 'curtains',
      name: 'Curtains & Drapes',
      description: 'Window treatments including curtains, drapes, and valances',
      returnWindow: 45,
      returnable: true,
      conditions: [
        'Items must be unused and unaltered',
        'Original packaging and hardware included',
        'No custom alterations or hemming'
      ],
      specialInstructions: [
        'Measure your windows carefully before ordering',
        'Custom-sized curtains cannot be returned unless defective'
      ]
    },
    {
      id: 'towels',
      name: 'Towels & Bath Linens',
      description: 'Bath towels, hand towels, washcloths, and bath mats',
      returnWindow: 30,
      returnable: true,
      conditions: [
        'Items must be unused and unwashed',
        'Original tags and packaging required',
        'No signs of use or washing'
      ]
    },
    {
      id: 'upholstery',
      name: 'Upholstery Fabrics',
      description: 'Fabric sold by the yard for upholstery and decorating',
      returnWindow: 14,
      returnable: true,
      conditions: [
        'Fabric must be uncut and in original condition',
        'Minimum 1 yard for returns',
        'No custom cuts or alterations'
      ],
      specialInstructions: [
        'Order samples before purchasing large quantities',
        'Cut fabric cannot be returned unless defective'
      ]
    },
    {
      id: 'decorative',
      name: 'Decorative Pillows & Cushions',
      description: 'Throw pillows, cushions, and decorative accessories',
      returnWindow: 30,
      returnable: true,
      conditions: [
        'Items must be unused with all tags',
        'Original shape and stuffing maintained',
        'No pet hair or odors'
      ]
    },
    {
      id: 'custom',
      name: 'Custom & Made-to-Order Items',
      description: 'Items made specifically to customer specifications',
      returnWindow: 0,
      returnable: false,
      conditions: [],
      nonReturnable: true,
      specialInstructions: [
        'All sales final unless manufacturing defect',
        'Contact within 48 hours for defect claims',
        'Proof of defect required for refund consideration'
      ]
    }
  ],
  returnConditions: [
    {
      id: 'original_condition',
      title: 'Original Condition',
      description: 'Items must be in the same condition as when received',
      icon: 'check',
      category: 'eligible'
    },
    {
      id: 'tags_attached',
      title: 'Tags Attached',
      description: 'All original tags, labels, and packaging must be included',
      icon: 'tag',
      category: 'eligible'
    },
    {
      id: 'time_limit',
      title: 'Within Time Limit',
      description: 'Returns must be initiated within the specified return window',
      icon: 'clock',
      category: 'eligible'
    },
    {
      id: 'no_damage',
      title: 'No Damage',
      description: 'Items must be free from damage, stains, or excessive wear',
      icon: 'shield',
      category: 'eligible'
    },
    {
      id: 'used_items',
      title: 'Used or Washed Items',
      description: 'Items that have been used, washed, or show signs of wear',
      icon: 'x',
      category: 'ineligible'
    },
    {
      id: 'custom_altered',
      title: 'Custom or Altered Items',
      description: 'Items that have been customized, altered, or cut to size',
      icon: 'x',
      category: 'ineligible'
    },
    {
      id: 'hygiene_items',
      title: 'Hygiene-Sensitive Items',
      description: 'Items that cannot be returned for hygiene reasons once opened',
      icon: 'x',
      category: 'ineligible'
    },
    {
      id: 'clearance_final',
      title: 'Clearance & Final Sale',
      description: 'Items marked as clearance or final sale',
      icon: 'x',
      category: 'ineligible'
    }
  ],
  returnProcess: [
    {
      step: 1,
      title: 'Initiate Return',
      description: 'Log into your account and navigate to your order history. Click "Return Items" next to your order.',
      duration: '2-5 minutes',
      estimatedTime: '2-5 minutes',
      icon: 'computer',
      requirements: ['Order number', 'Login credentials', 'Purchase date']
    },
    {
      step: 2,
      title: 'Select Items',
      description: 'Choose the items you want to return and specify the reason for return from the dropdown menu.',
      duration: '2-3 minutes',
      estimatedTime: '2-3 minutes',
      icon: 'list',
      requirements: ['Select items to return', 'Provide return reason', 'Confirm eligibility']
    },
    {
      step: 3,
      title: 'Print Return Label',
      description: 'Download and print the prepaid return shipping label provided in your confirmation email.',
      duration: '1-2 minutes',
      estimatedTime: '1-2 minutes',
      icon: 'printer',
      requirements: ['Printer access', 'Return authorization email', 'Label paper']
    },
    {
      step: 4,
      title: 'Package Items',
      description: 'Securely package items in original packaging if possible. Attach the return label to the outside.',
      duration: '5-10 minutes',
      estimatedTime: '5-10 minutes',
      icon: 'package',
      requirements: ['Original packaging (if available)', 'Return label', 'Packing tape']
    },
    {
      step: 5,
      title: 'Ship Return',
      description: 'Drop off the package at any authorized shipping location or schedule a pickup.',
      duration: '10-15 minutes',
      estimatedTime: '10-15 minutes',
      icon: 'truck',
      requirements: ['Packaged items', 'Return label attached', 'Shipping location or pickup']
    },
    {
      step: 6,
      title: 'Processing',
      description: 'We\'ll inspect your return and process your refund within 3-5 business days of receipt.',
      duration: '3-5 business days',
      estimatedTime: '3-5 business days',
      icon: 'cog',
      requirements: ['Return received', 'Quality inspection passed', 'Payment method verified']
    }
  ],
  refundMethods: [
    {
      id: 'original_payment',
      name: 'Original Payment Method',
      description: 'Refund to the original credit card or payment method used',
      processingTime: '5-7 business days',
      icon: 'credit-card',
      fees: 'No fees'
    },
    {
      id: 'store_credit',
      name: 'Store Credit',
      description: 'Receive store credit for future purchases with bonus value',
      processingTime: 'Immediate',
      icon: 'gift',
      fees: 'No fees + 10% bonus'
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      description: 'Direct deposit to your bank account',
      processingTime: '3-5 business days',
      icon: 'bank',
      fees: 'No fees'
    },
    {
      id: 'check',
      name: 'Check by Mail',
      description: 'Physical check mailed to your address',
      processingTime: '7-10 business days',
      icon: 'mail',
      fees: 'No fees'
    }
  ],
  returnShipping: {
    returnShippingFee: 'Free for orders over ₹2,500, otherwise ₹150',
    freeReturnThreshold: 2500,
    returnAddress: {
      name: 'Vardhman Mills Returns Center',
      addressLine1: 'Warehouse District, Plot No. 45',
      addressLine2: 'Industrial Area Phase II',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'India',
      phone: '+91-1234-567890'
    },
    cost: 150
  },
  shippingPolicy: {
    returnShippingFee: 'Free for orders over ₹2,500, otherwise ₹150',
    freeReturnThreshold: 2500,
    returnAddress: 'Vardhman Mills Returns Center, Warehouse District, Mumbai, MH 400001'
  },
  contactInfo: {
    email: 'returns@vardhmanmills.com',
    phone: '+91-1234-567890',
    hours: 'Monday-Saturday: 9:00 AM - 7:00 PM IST'
  }
};
