'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { 
  MapPinIcon,
  ExclamationTriangleIcon,
  EyeSlashIcon,
  EyeIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { 
  MapPinIcon as MapPinSolidIcon,
  GlobeAltIcon as GlobeAltSolidIcon
} from '@heroicons/react/24/solid';

import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Separator } from '@/components/ui/Separator';

import { cn } from '@/lib/utils';
import { ProductReview as Review, ReviewUser as User } from '@/types/review.types';

export interface ReviewLocationProps {
  review: Review;
  user?: User | null;
  variant?: 'default' | 'compact' | 'detailed' | 'card';
  showCountry?: boolean;
  showState?: boolean;
  showCity?: boolean;
  showDistance?: boolean;
  showPrivacyStatus?: boolean;
  showMapLink?: boolean;
  interactive?: boolean;
  allowPrivacyToggle?: boolean;
  currentUserLocation?: {
    city?: string;
    state?: string;
    country?: string;
  };
  className?: string;
  
  // Event handlers
  onLocationClick?: (location: User['location']) => void;
  onMapOpen?: (location: User['location']) => void;
  onPrivacyToggle?: (showLocation: boolean) => void;
  onDistanceClick?: (distance: number) => void;
}

const LOCATION_VARIANTS = {
  default: 'text-sm text-muted-foreground',
  compact: 'text-xs text-muted-foreground',
  detailed: 'text-sm text-foreground',
  card: 'text-base text-foreground'
} as const;

const CONTAINER_VARIANTS = {
  default: 'flex items-center gap-1',
  compact: 'flex items-center gap-0.5',
  detailed: 'flex flex-col items-start gap-2',
  card: 'text-center space-y-2'
} as const;

// Country code to name mapping (subset)
const COUNTRY_NAMES: Record<string, string> = {
  'US': 'United States',
  'CA': 'Canada',
  'GB': 'United Kingdom',
  'AU': 'Australia',
  'DE': 'Germany',
  'FR': 'France',
  'IT': 'Italy',
  'ES': 'Spain',
  'JP': 'Japan',
  'CN': 'China',
  'IN': 'India',
  'BR': 'Brazil',
  'MX': 'Mexico',
  'RU': 'Russia',
  'KR': 'South Korea',
  'NL': 'Netherlands',
  'SE': 'Sweden',
  'NO': 'Norway',
  'DK': 'Denmark',
  'FI': 'Finland'
};

const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m away`;
  } else if (distanceKm < 100) {
    return `${distanceKm.toFixed(1)}km away`;
  } else {
    return `${Math.round(distanceKm)}km away`;
  }
};

export const ReviewLocation: React.FC<ReviewLocationProps> = ({
  review,
  user,
  variant = 'default',
  showCountry = true,
  showState = true,
  showCity = true,
  showDistance = false,
  showPrivacyStatus = false,
  showMapLink = false,
  interactive = true,
  allowPrivacyToggle = false,
  currentUserLocation,
  className,
  onLocationClick,
  onMapOpen,
  onPrivacyToggle,
  onDistanceClick
}) => {
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Determine the user information to display
  const displayUser = useMemo(() => {
    if (user) return user;
    
    // Fallback to review location information if available
    return {
      id: review.userId,
      location: undefined,
      showLocation: false,
      timezone: undefined
    } as Partial<User>;
  }, [user, review]);

  // Location information processing
  const locationInfo = useMemo(() => {
    if (!displayUser.location || !displayUser.showLocation) {
      return null;
    }
    
    const { city, state, country } = displayUser.location;
    
    // Build location string based on preferences
    const parts = [];
    if (showCity && city) parts.push(city);
    if (showState && state) parts.push(state);
    if (showCountry && country) {
      const countryName = COUNTRY_NAMES[country] || country;
      parts.push(countryName);
    }
    
    const locationString = parts.join(', ') || 'Location available';
    
    // Calculate distance based on text similarity if both locations are available
    let distance: number | null = null;
    let isSameRegion = false;
    if (showDistance && currentUserLocation) {
      // Simple region matching
      if (currentUserLocation.country === country) {
        isSameRegion = true;
        if (currentUserLocation.state === state) {
          distance = 50; // Same state, estimated distance
        } else {
          distance = 200; // Same country, different state
        }
      } else {
        distance = 1000; // Different country
      }
    }
    
    return {
      displayText: locationString,
      city,
      state,
      country,
      countryName: country ? (COUNTRY_NAMES[country] || country) : undefined,
      distance,
      isSameRegion,
      hasCoordinates: false // Not available in current type
    };
  }, [
    displayUser.location,
    displayUser.showLocation,
    showCity,
    showState,
    showCountry,
    showDistance,
    currentUserLocation
  ]);

  // Privacy status information
  const privacyInfo = useMemo(() => {
    const isLocationVisible = !!(displayUser.location && displayUser.showLocation);
    const hasLocationData = !!displayUser.location;
    
    return {
      isVisible: isLocationVisible,
      hasData: hasLocationData,
      isHidden: hasLocationData && !isLocationVisible,
      canToggle: allowPrivacyToggle && hasLocationData
    };
  }, [displayUser.location, displayUser.showLocation, allowPrivacyToggle]);

  // Event handlers
  const handleLocationClick = useCallback(() => {
    if (!interactive || !locationInfo) return;
    
    if (onLocationClick) {
      onLocationClick(displayUser.location!);
    } else if (interactive) {
      setShowDetailsDialog(true);
    }
  }, [interactive, locationInfo, onLocationClick, displayUser.location]);

  const handleMapOpen = useCallback(() => {
    if (!locationInfo) return;
    
    if (onMapOpen) {
      onMapOpen(displayUser.location!);
    } else {
      // Open general map search since we don't have coordinates
      const searchQuery = locationInfo.displayText.replace(/ /g, '+');
      const mapUrl = `https://www.google.com/maps/search/${searchQuery}`;
      window.open(mapUrl, '_blank');
    }
  }, [locationInfo, onMapOpen, displayUser.location]);

  const handlePrivacyToggle = useCallback(() => {
    if (!privacyInfo.canToggle || !onPrivacyToggle) return;
    
    onPrivacyToggle(!privacyInfo.isVisible);
  }, [privacyInfo.canToggle, privacyInfo.isVisible, onPrivacyToggle]);

  const handleDistanceClick = useCallback(() => {
    if (!locationInfo?.distance || !onDistanceClick) return;
    
    onDistanceClick(locationInfo.distance);
  }, [locationInfo?.distance, onDistanceClick]);

  // Render privacy indicator
  const renderPrivacyIndicator = useCallback(() => {
    if (!showPrivacyStatus) return null;
    
    if (privacyInfo.isHidden) {
      return (
        <Tooltip content="Location is hidden for privacy">
          <EyeSlashIcon className="h-4 w-4 text-muted-foreground" />
        </Tooltip>
      );
    }
    
    if (privacyInfo.isVisible) {
      return (
        <Tooltip content="Location is visible">
          <EyeIcon className="h-4 w-4 text-green-600" />
        </Tooltip>
      );
    }
    
    return (
      <Tooltip content="No location data available">
        <ExclamationTriangleIcon className="h-4 w-4 text-amber-500" />
      </Tooltip>
    );
  }, [showPrivacyStatus, privacyInfo]);

  // Render distance badge
  const renderDistanceBadge = useCallback(() => {
    if (!locationInfo?.distance) return null;
    
    return (
      <Badge 
        variant="secondary" 
        className="text-xs cursor-pointer hover:bg-secondary/80"
        onClick={handleDistanceClick}
      >
        {formatDistance(locationInfo.distance)}
      </Badge>
    );
  }, [locationInfo?.distance, handleDistanceClick]);

  // Render timezone info (not available in current type)
  const renderTimezoneInfo = useCallback(() => {
    return null; // Timezone not available in ReviewUser type
  }, []);

  // Render location details dialog
  const renderDetailsDialog = useCallback(() => {
    if (!showDetailsDialog || !locationInfo) return null;
    
    return (
      <Dialog 
        open={showDetailsDialog} 
        onClose={() => setShowDetailsDialog(false)}
        size="sm"
      >
        <DialogHeader>
          <DialogTitle>Location Details</DialogTitle>
          <DialogDescription>
            Geographic information for this reviewer
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPinSolidIcon className="h-4 w-4 text-primary" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {locationInfo.city && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">City:</span>
                  <span className="text-sm font-medium">{locationInfo.city}</span>
                </div>
              )}
              {locationInfo.state && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">State:</span>
                  <span className="text-sm font-medium">{locationInfo.state}</span>
                </div>
              )}
              {locationInfo.countryName && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Country:</span>
                  <span className="text-sm font-medium">{locationInfo.countryName}</span>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Timezone section removed - not available in ReviewUser type */}
          
          {locationInfo.distance && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <GlobeAltSolidIcon className="h-4 w-4 text-primary" />
                  Distance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">From you:</span>
                  <span className="text-sm font-medium">{formatDistance(locationInfo.distance)}</span>
                </div>
              </CardContent>
            </Card>
          )}
          
          {showMapLink && locationInfo.hasCoordinates && (
            <>
              <Separator />
              <Button
                variant="outline"
                className="w-full"
                onClick={handleMapOpen}
              >
                <MapPinIcon className="h-4 w-4 mr-2" />
                View on Map
              </Button>
            </>
          )}
          
          {privacyInfo.canToggle && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <InformationCircleIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Share location</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrivacyToggle}
                >
                  {privacyInfo.isVisible ? 'Hide' : 'Show'}
                </Button>
              </div>
            </>
          )}
        </div>
      </Dialog>
    );
  }, [
    showDetailsDialog,
    locationInfo,
    showMapLink,
    privacyInfo,
    handleMapOpen,
    handlePrivacyToggle
  ]);

  // Main render logic
  if (!locationInfo && !privacyInfo.isHidden) {
    return null;
  }

  // Render hidden location placeholder
  if (privacyInfo.isHidden) {
    return (
      <div className={cn(CONTAINER_VARIANTS[variant], className)}>
        <div className="flex items-center gap-1">
          <EyeSlashIcon className="h-4 w-4 text-muted-foreground" />
          <span className={cn(LOCATION_VARIANTS[variant])}>
            Location hidden
          </span>
        </div>
        {renderPrivacyIndicator()}
        {privacyInfo.canToggle && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1 text-xs"
            onClick={handlePrivacyToggle}
          >
            Show
          </Button>
        )}
        {renderDetailsDialog()}
      </div>
    );
  }

  // Render visible location
  if (variant === 'detailed' || variant === 'card') {
    return (
      <div className={cn(CONTAINER_VARIANTS[variant], className)}>
        <div className="flex items-center gap-2">
          <MapPinIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <button
            onClick={handleLocationClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
              LOCATION_VARIANTS[variant],
              interactive && "hover:text-primary transition-colors cursor-pointer",
              !interactive && "cursor-default",
              isHovered && "underline"
            )}
            disabled={!interactive}
          >
            {locationInfo!.displayText}
          </button>
          {renderPrivacyIndicator()}
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {renderDistanceBadge()}
          {showMapLink && locationInfo!.hasCoordinates && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-xs"
              onClick={handleMapOpen}
            >
              <MapPinIcon className="h-3 w-3 mr-1" />
              Map
            </Button>
          )}
        </div>
        
        {renderTimezoneInfo()}
        {renderDetailsDialog()}
      </div>
    );
  }

  return (
    <div className={cn(CONTAINER_VARIANTS[variant], className)}>
      <MapPinIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <button
        onClick={handleLocationClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          LOCATION_VARIANTS[variant],
          interactive && "hover:text-primary transition-colors cursor-pointer",
          !interactive && "cursor-default",
          isHovered && "underline"
        )}
        disabled={!interactive}
      >
        {locationInfo!.displayText}
      </button>
      {renderDistanceBadge()}
      {renderPrivacyIndicator()}
      {renderDetailsDialog()}
    </div>
  );
};

export default ReviewLocation;
