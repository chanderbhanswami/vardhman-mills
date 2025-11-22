// Legal common components barrel exports
export { default as LegalCard } from './LegalCard';
export { default as LegalLayout } from './LegalLayout';
export { default as LegalSidebar } from './LegalSidebar';

// Types and interfaces
export interface LegalSection {
  id: string;
  title: string;
  content: string;
  subsections?: LegalSubsection[];
  lastUpdated?: string;
  isRequired?: boolean;
}

export interface LegalSubsection {
  id: string;
  title: string;
  content: string;
  items?: string[];
}

export interface LegalDocument {
  id: string;
  title: string;
  description: string;
  version: string;
  effectiveDate: string;
  lastUpdated: string;
  sections: LegalSection[];
  slug: string;
  category: 'policy' | 'terms' | 'agreement';
  status: 'active' | 'draft' | 'archived';
}

export interface LegalNavItem {
  id: string;
  title: string;
  href: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  isActive?: boolean;
  subsections?: {
    id: string;
    title: string;
    href: string;
  }[];
}

export interface LegalCardProps {
  title: string;
  description: string;
  lastUpdated: string;
  version: string;
  href: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  category: 'policy' | 'terms' | 'agreement';
  className?: string;
}

export interface LegalLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  lastUpdated?: string;
  version?: string;
  className?: string;
}

export interface LegalSidebarProps {
  navItems: LegalNavItem[];
  activeSection?: string;
  onSectionChange?: (sectionId: string) => void;
  className?: string;
}

// Utility functions
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const generateTableOfContents = (sections: LegalSection[]) => {
  return sections.map(section => ({
    id: section.id,
    title: section.title,
    subsections: section.subsections?.map(sub => ({
      id: sub.id,
      title: sub.title
    })) || []
  }));
};

export const scrollToSection = (sectionId: string, offset: number = 80) => {
  const element = document.getElementById(sectionId);
  if (element) {
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth'
    });
  }
};

// Constants
export const LEGAL_CATEGORIES = {
  POLICY: 'policy' as const,
  TERMS: 'terms' as const,
  AGREEMENT: 'agreement' as const
};

export const LEGAL_STATUS = {
  ACTIVE: 'active' as const,
  DRAFT: 'draft' as const,
  ARCHIVED: 'archived' as const
};
