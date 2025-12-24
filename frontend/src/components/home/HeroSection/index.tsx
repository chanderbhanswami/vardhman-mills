'use client';

/**
 * HeroSection Component
 * 
 * Client-side wrapper that fetches hero slides from the backend API
 * and passes them to the HeroSlider component.
 */

import React, { useState, useEffect } from 'react';
import HeroSlider, { SlideData } from './HeroSlider';

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Fallback slides when API fails or no data
const FALLBACK_SLIDES: SlideData[] = [
    {
        id: '1',
        title: 'Premium Quality Textiles',
        subtitle: 'Crafted with Excellence',
        description: 'Discover our exclusive collection of premium bedsheets, towels, and home textiles. Made with the finest materials for ultimate comfort.',
        imageUrl: '/images/hero/hero-1.jpg',
        ctaPrimary: {
            label: 'Shop Now',
            href: '/products',
        },
        ctaSecondary: {
            label: 'View Collections',
            href: '/collections',
        },
        contentAlign: 'left',
    },
    {
        id: '2',
        title: 'New Arrivals',
        subtitle: 'Fresh Designs for Your Home',
        description: 'Explore our latest collection of modern designs and patterns that will transform your living space.',
        imageUrl: '/images/hero/hero-2.jpg',
        ctaPrimary: {
            label: 'Explore New Arrivals',
            href: '/new-arrivals',
        },
        contentAlign: 'center',
    },
    {
        id: '3',
        title: 'Special Offers',
        subtitle: 'Limited Time Deals',
        description: 'Get up to 50% off on selected products. Don\'t miss out on these amazing deals!',
        imageUrl: '/images/hero/hero-3.jpg',
        ctaPrimary: {
            label: 'View Offers',
            href: '/sale',
        },
        contentAlign: 'right',
    },
];

interface BackendHeroSection {
    _id: string;
    title: string;
    subtitle?: string;
    description?: string;
    backgroundType: 'image' | 'video' | 'gradient' | 'color';
    backgroundImage?: string;
    backgroundVideo?: string;
    overlayColor?: string;
    overlayOpacity?: number;
    cta?: {
        primaryButton?: {
            text: string;
            link: string;
        };
        secondaryButton?: {
            text: string;
            link: string;
        };
    };
    layout?: {
        contentAlignment?: 'left' | 'center' | 'right';
    };
}

interface HeroSectionProps {
    className?: string;
    autoPlay?: boolean;
    interval?: number;
    height?: 'small' | 'medium' | 'large' | 'full' | 'auto';
}

export const HeroSection: React.FC<HeroSectionProps> = ({
    className,
    autoPlay = true,
    interval = 5000,
    height = 'large',
}) => {
    const [slides, setSlides] = useState<SlideData[]>(FALLBACK_SLIDES);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHeroSections = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`${API_BASE_URL}/hero-banner/hero-sections/page/homepage`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch hero sections: ${response.status}`);
                }

                const data = await response.json();

                if (data.status === 'success' && data.data?.heroSections?.length > 0) {
                    // Transform backend data to SlideData format
                    const transformedSlides: SlideData[] = data.data.heroSections.map((section: BackendHeroSection) => ({
                        id: section._id,
                        title: section.title,
                        subtitle: section.subtitle,
                        description: section.description,
                        imageUrl: section.backgroundImage,
                        videoUrl: section.backgroundVideo,
                        overlayColor: section.overlayColor,
                        overlayOpacity: section.overlayOpacity,
                        ctaPrimary: section.cta?.primaryButton ? {
                            label: section.cta.primaryButton.text,
                            href: section.cta.primaryButton.link,
                        } : undefined,
                        ctaSecondary: section.cta?.secondaryButton ? {
                            label: section.cta.secondaryButton.text,
                            href: section.cta.secondaryButton.link,
                        } : undefined,
                        contentAlign: section.layout?.contentAlignment || 'center',
                    }));

                    setSlides(transformedSlides);
                    console.log('Loaded hero sections from API:', transformedSlides.length);
                } else {
                    console.log('No hero sections from API, using fallback slides');
                }
            } catch (err) {
                console.error('Error fetching hero sections:', err);
                setError(err instanceof Error ? err.message : 'Failed to load hero sections');
                // Keep using fallback slides
            } finally {
                setIsLoading(false);
            }
        };

        fetchHeroSections();
    }, []);

    return (
        <HeroSlider
            slides={slides}
            autoPlay={autoPlay}
            interval={interval}
            height={height}
            className={className}
            showControls={true}
            showProgress={true}
            infinite={true}
            swipeEnabled={true}
        />
    );
};

export default HeroSection;
