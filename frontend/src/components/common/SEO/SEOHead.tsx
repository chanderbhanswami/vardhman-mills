'use client';

import React from 'react';
import Head from 'next/head';
import MetaTags, { MetaTagsProps } from './MetaTags';
import OpenGraph, { OpenGraphProps } from './OpenGraph';
import StructuredData, { StructuredDataProps } from './StructuredData';

export interface TwitterCardProps {
  card?: 'summary' | 'summary_large_image' | 'app' | 'player';
  site?: string;
  creator?: string;
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
}

export interface SEOHeadProps extends MetaTagsProps, OpenGraphProps {
  twitter?: TwitterCardProps;
  structuredData?: StructuredDataProps['data'];
  jsonLd?: object[];
  preconnect?: string[];
  dnsPrefetch?: string[];
  prefetch?: string[];
  preload?: Array<{
    href: string;
    as: string;
    type?: string;
    crossorigin?: '' | 'anonymous' | 'use-credentials';
  }>;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  // Extract Twitter and structured data props
  twitter,
  structuredData,
  jsonLd = [],
  preconnect = [],
  dnsPrefetch = [],
  prefetch = [],
  preload = [],
  
  // Rest of props for MetaTags and OpenGraph
  ...props
}) => {
  return (
    <>
      <MetaTags {...props} />
      <OpenGraph {...props} />
      
      {/* Twitter Card Meta Tags */}
      {twitter && (
        <Head>
          {twitter.card && <meta name="twitter:card" content={twitter.card} />}
          {twitter.site && <meta name="twitter:site" content={twitter.site} />}
          {twitter.creator && <meta name="twitter:creator" content={twitter.creator} />}
          {twitter.title && <meta name="twitter:title" content={twitter.title} />}
          {twitter.description && <meta name="twitter:description" content={twitter.description} />}
          {twitter.image && <meta name="twitter:image" content={twitter.image} />}
          {twitter.imageAlt && <meta name="twitter:image:alt" content={twitter.imageAlt} />}
        </Head>
      )}
      
      {/* Resource Hints */}
      {(preconnect.length > 0 || dnsPrefetch.length > 0 || prefetch.length > 0 || preload.length > 0) && (
        <Head>
          {preconnect.map((href, index) => (
            <link key={`preconnect-${index}`} rel="preconnect" href={href} />
          ))}
          {dnsPrefetch.map((href, index) => (
            <link key={`dns-prefetch-${index}`} rel="dns-prefetch" href={href} />
          ))}
          {prefetch.map((href, index) => (
            <link key={`prefetch-${index}`} rel="prefetch" href={href} />
          ))}
          {preload.map((resource, index) => (
            <link
              key={`preload-${index}`}
              rel="preload"
              href={resource.href}
              as={resource.as}
              type={resource.type}
              crossOrigin={resource.crossorigin === '' ? undefined : resource.crossorigin}
            />
          ))}
        </Head>
      )}
      
      {/* Structured Data */}
      {structuredData && <StructuredData data={structuredData} />}
      
      {/* Additional JSON-LD */}
      {jsonLd.length > 0 && (
        <Head>
          {jsonLd.map((data, index) => (
            <script
              key={`jsonld-${index}`}
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(data, null, 2),
              }}
            />
          ))}
        </Head>
      )}
    </>
  );
};

export default SEOHead;