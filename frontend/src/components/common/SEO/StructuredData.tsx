'use client';

import React from 'react';
import Head from 'next/head';

export interface Person {
  '@type': 'Person';
  name: string;
  url?: string;
  image?: string;
  jobTitle?: string;
  worksFor?: Organization;
  email?: string;
  telephone?: string;
  address?: PostalAddress;
  sameAs?: string[];
}

export interface Organization {
  '@type': 'Organization';
  name: string;
  url?: string;
  logo?: string;
  description?: string;
  email?: string;
  telephone?: string;
  address?: PostalAddress;
  sameAs?: string[];
}

export interface PostalAddress {
  '@type': 'PostalAddress';
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry?: string;
}

export interface WebSite {
  '@type': 'WebSite';
  name: string;
  url: string;
  description?: string;
  potentialAction?: SearchAction;
  publisher?: Organization;
}

export interface SearchAction {
  '@type': 'SearchAction';
  target: string;
  'query-input': string;
}

export interface Article {
  '@type': 'Article' | 'BlogPosting' | 'NewsArticle';
  headline: string;
  description?: string;
  image?: string[];
  author: Person | Person[];
  publisher: Organization;
  datePublished: string;
  dateModified?: string;
  mainEntityOfPage?: string;
  url?: string;
  articleSection?: string;
  keywords?: string[];
}

export interface Product {
  '@type': 'Product';
  name: string;
  description?: string;
  image?: string[];
  brand?: Organization;
  manufacturer?: Organization;
  model?: string;
  sku?: string;
  gtin?: string;
  offers?: Offer | Offer[];
  aggregateRating?: AggregateRating;
  review?: Review[];
}

export interface Offer {
  '@type': 'Offer';
  price: string;
  priceCurrency: string;
  availability: string;
  seller?: Organization;
  validFrom?: string;
  validThrough?: string;
  url?: string;
}

export interface AggregateRating {
  '@type': 'AggregateRating';
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
}

export interface Review {
  '@type': 'Review';
  author: Person;
  reviewRating: Rating;
  reviewBody?: string;
  datePublished?: string;
}

export interface Rating {
  '@type': 'Rating';
  ratingValue: number;
  bestRating?: number;
  worstRating?: number;
}

export interface LocalBusiness {
  '@type': 'LocalBusiness';
  name: string;
  description?: string;
  image?: string[];
  url?: string;
  telephone?: string;
  email?: string;
  address: PostalAddress;
  geo?: GeoCoordinates;
  openingHours?: string[];
  priceRange?: string;
  aggregateRating?: AggregateRating;
  review?: Review[];
}

export interface GeoCoordinates {
  '@type': 'GeoCoordinates';
  latitude: number;
  longitude: number;
}

export interface Event {
  '@type': 'Event';
  name: string;
  description?: string;
  image?: string[];
  startDate: string;
  endDate?: string;
  location: Place | string;
  organizer?: Organization | Person;
  performer?: Person | Organization;
  offers?: Offer | Offer[];
  url?: string;
}

export interface Place {
  '@type': 'Place';
  name: string;
  address: PostalAddress;
  geo?: GeoCoordinates;
  url?: string;
}

export interface FAQ {
  '@type': 'FAQPage';
  mainEntity: Question[];
}

export interface Question {
  '@type': 'Question';
  name: string;
  acceptedAnswer: Answer;
}

export interface Answer {
  '@type': 'Answer';
  text: string;
}

export interface BreadcrumbList {
  '@type': 'BreadcrumbList';
  itemListElement: ListItem[];
}

export interface ListItem {
  '@type': 'ListItem';
  position: number;
  name: string;
  item?: string;
}

export type StructuredDataType = 
  | WebSite
  | Article
  | Product
  | LocalBusiness
  | Event
  | FAQ
  | BreadcrumbList
  | Person
  | Organization;

export interface StructuredDataProps {
  data: StructuredDataType | StructuredDataType[];
}

const StructuredData: React.FC<StructuredDataProps> = ({ data }) => {
  const generateJsonLd = (data: StructuredDataType | StructuredDataType[]) => {
    const jsonLd = {
      '@context': 'https://schema.org',
      ...(Array.isArray(data) ? { '@graph': data } : data),
    };

    return JSON.stringify(jsonLd, null, 2);
  };

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: generateJsonLd(data),
        }}
      />
    </Head>
  );
};

// Helper functions for common structured data
export const createWebSite = ({
  name,
  url,
  description,
  searchUrl,
  publisher,
}: {
  name: string;
  url: string;
  description?: string;
  searchUrl?: string;
  publisher?: Organization;
}): WebSite => ({
  '@type': 'WebSite',
  name,
  url,
  description,
  publisher,
  ...(searchUrl && {
    potentialAction: {
      '@type': 'SearchAction',
      target: `${searchUrl}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }),
});

export const createArticle = ({
  type = 'Article',
  headline,
  description,
  image,
  author,
  publisher,
  datePublished,
  dateModified,
  url,
  articleSection,
  keywords,
}: {
  type?: 'Article' | 'BlogPosting' | 'NewsArticle';
  headline: string;
  description?: string;
  image?: string | string[];
  author: Person | Person[];
  publisher: Organization;
  datePublished: string;
  dateModified?: string;
  url?: string;
  articleSection?: string;
  keywords?: string[];
}): Article => ({
  '@type': type,
  headline,
  description,
  image: Array.isArray(image) ? image : image ? [image] : undefined,
  author,
  publisher,
  datePublished,
  dateModified,
  mainEntityOfPage: url,
  url,
  articleSection,
  keywords,
});

export const createBreadcrumbs = (
  items: Array<{ name: string; url?: string }>
): BreadcrumbList => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

export const createFAQ = (faqs: Array<{ question: string; answer: string }>): FAQ => ({
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

export default StructuredData;