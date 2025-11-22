'use client';

import React from 'react';
import Head from 'next/head';

export interface MetaTag {
  name?: string;
  property?: string;
  content: string;
  httpEquiv?: string;
}

export interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  viewport?: string;
  robots?: string;
  charset?: string;
  language?: string;
  canonical?: string;
  icon?: string;
  appleTouchIcon?: string;
  themeColor?: string;
  customTags?: MetaTag[];
  noIndex?: boolean;
  noFollow?: boolean;
}

const MetaTags: React.FC<MetaTagsProps> = ({
  title,
  description,
  keywords,
  author,
  viewport = 'width=device-width, initial-scale=1',
  robots,
  charset = 'utf-8',
  language = 'en',
  canonical,
  icon,
  appleTouchIcon,
  themeColor,
  customTags = [],
  noIndex = false,
  noFollow = false,
}) => {
  // Generate robots content
  const getRobotsContent = () => {
    if (robots) return robots;
    
    const robotsArray = [];
    if (noIndex) robotsArray.push('noindex');
    if (noFollow) robotsArray.push('nofollow');
    
    if (robotsArray.length === 0) {
      return 'index, follow';
    }
    
    return robotsArray.join(', ');
  };

  return (
    <Head>
      {/* Basic Meta Tags */}
      {charset && <meta charSet={charset} />}
      {viewport && <meta name="viewport" content={viewport} />}
      {language && <meta httpEquiv="content-language" content={language} />}
      
      {/* Title */}
      {title && <title>{title}</title>}
      
      {/* Description */}
      {description && <meta name="description" content={description} />}
      
      {/* Keywords */}
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Author */}
      {author && <meta name="author" content={author} />}
      
      {/* Robots */}
      <meta name="robots" content={getRobotsContent()} />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Favicon and Icons */}
      {icon && <link rel="icon" href={icon} />}
      {/* Apple touch icon as meta tag for compatibility */}
      {appleTouchIcon && <meta name="apple-touch-icon" content={appleTouchIcon} />}
      {/* Web manifest handled by Next.js public folder */}
      {themeColor && (
        <>
          {/* Microsoft tile color for Windows */}
          <meta name="msapplication-TileColor" content={themeColor} />
          {/* CSS custom property for theme color */}
          <style dangerouslySetInnerHTML={{
            __html: `:root { --theme-color: ${themeColor}; }`
          }} />
        </>
      )}
      
      {/* PWA Meta Tags */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      
      {/* Security Headers */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      
      {/* Custom Meta Tags */}
      {customTags.map((tag, index) => {
        const key = `custom-meta-${index}`;
        
        if (tag.name) {
          return <meta key={key} name={tag.name} content={tag.content} />;
        }
        
        if (tag.property) {
          return <meta key={key} property={tag.property} content={tag.content} />;
        }
        
        if (tag.httpEquiv) {
          return <meta key={key} httpEquiv={tag.httpEquiv} content={tag.content} />;
        }
        
        return null;
      })}
    </Head>
  );
};

export default MetaTags;