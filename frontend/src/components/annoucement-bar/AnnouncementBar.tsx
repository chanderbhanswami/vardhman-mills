"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronRight, 
  Phone, 
  Mail, 
  ShoppingCart, 
  Heart, 
  ExternalLink,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
  Megaphone,
  Gift
} from 'lucide-react';
import { AnnouncementBar as AnnouncementBarType, AnnouncementAction } from '@/types/announcementBar.types';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

export interface AnnouncementBarProps {
  announcements: AnnouncementBarType[];
  className?: string;
  position?: 'top' | 'bottom';
  autoRotate?: boolean;
  rotationInterval?: number;
  showControls?: boolean;
}

const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  announcements,
  className = "",
  position = 'top',
  autoRotate = true,
  rotationInterval = 8000,
  showControls = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  // Filter active announcements that haven't been dismissed
  const activeAnnouncements = announcements.filter(
    announcement => 
      announcement.status === 'active' && 
      !dismissedIds.includes(announcement.id) &&
      isAnnouncementScheduled(announcement)
  );

  // Check if announcement should be displayed based on schedule
  function isAnnouncementScheduled(announcement: AnnouncementBarType): boolean {
    const now = new Date();
    const startDate = new Date(announcement.schedule.startDate);
    const endDate = announcement.schedule.endDate ? new Date(announcement.schedule.endDate) : null;

    if (now < startDate) return false;
    if (endDate && now > endDate) return false;

    // Check time-based display if configured
    if (announcement.schedule.displayTimes) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinute;
      
      const [startHour, startMin] = announcement.schedule.displayTimes.startTime.split(':').map(Number);
      const [endHour, endMin] = announcement.schedule.displayTimes.endTime.split(':').map(Number);
      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;
      
      if (currentTime < startTime || currentTime > endTime) return false;

      const currentDay = now.getDay();
      if (!announcement.schedule.displayTimes.daysOfWeek.includes(currentDay)) return false;
    }

    return true;
  }

  // Auto-rotate announcements
  const nextAnnouncement = useCallback(() => {
    if (activeAnnouncements.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % activeAnnouncements.length);
    }
  }, [activeAnnouncements.length]);

  useEffect(() => {
    if (!autoRotate || isPaused || activeAnnouncements.length <= 1) return;

    const interval = setInterval(nextAnnouncement, rotationInterval);
    return () => clearInterval(interval);
  }, [autoRotate, isPaused, rotationInterval, nextAnnouncement, activeAnnouncements.length]);

  // Handle dismissal
  const handleDismiss = (announcementId: string, permanent: boolean = false) => {
    if (permanent) {
      setDismissedIds(prev => [...prev, announcementId]);
      // Store in localStorage for persistence
      localStorage.setItem('dismissedAnnouncements', JSON.stringify([...dismissedIds, announcementId]));
    }
    
    if (activeAnnouncements.length === 1) {
      setIsVisible(false);
      setIsDismissed(true);
    } else {
      nextAnnouncement();
    }
  };

  // Load dismissed announcements from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('dismissedAnnouncements');
    if (stored) {
      try {
        setDismissedIds(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse dismissed announcements:', e);
      }
    }
  }, []);

  // Reset currentIndex if it's out of bounds
  useEffect(() => {
    if (currentIndex >= activeAnnouncements.length && activeAnnouncements.length > 0) {
      setCurrentIndex(0);
    }
  }, [currentIndex, activeAnnouncements.length]);

  if (!isVisible || isDismissed || activeAnnouncements.length === 0) {
    return null;
  }

  const currentAnnouncement = activeAnnouncements[currentIndex];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'promotional': return Gift;
      case 'informational': return Info;
      case 'alert': return AlertCircle;
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return AlertCircle;
      default: return Megaphone;
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'promotional':
        return 'bg-gradient-to-r from-purple-600 to-pink-600 text-white';
      case 'informational':
        return 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white';
      case 'alert':
        return 'bg-gradient-to-r from-red-600 to-red-700 text-white';
      case 'success':
        return 'bg-gradient-to-r from-green-600 to-emerald-600 text-white';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
      case 'error':
        return 'bg-gradient-to-r from-red-600 to-red-700 text-white';
      case 'maintenance':
        return 'bg-gradient-to-r from-gray-600 to-gray-700 text-white';
      default:
        return 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white';
    }
  };

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <span className="inline-block w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse" />;
      case 'high':
        return <span className="inline-block w-2 h-2 bg-orange-400 rounded-full mr-2" />;
      default:
        return null;
    }
  };

  const renderAction = (action: AnnouncementAction, index: number) => {
    const getVariant = (style: string) => {
      switch (style) {
        case 'primary': return 'default';
        case 'secondary': return 'secondary';
        case 'outline': return 'outline';
        case 'ghost': return 'ghost';
        case 'link': return 'link';
        default: return 'secondary';
      }
    };

    const ActionIcon = () => {
      switch (action.type) {
        case 'phone': return <Phone className="w-4 h-4" />;
        case 'email': return <Mail className="w-4 h-4" />;
        case 'cart': return <ShoppingCart className="w-4 h-4" />;
        case 'wishlist': return <Heart className="w-4 h-4" />;
        case 'link': return action.isExternal ? <ExternalLink className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />;
        default: return action.icon ? <span className="w-4 h-4" /> : null;
      }
    };

    if (action.type === 'link' && action.url) {
      if (action.isExternal) {
        return (
          <Button
            key={index}
            variant={getVariant(action.style)}
            size="sm"
            className="text-white border-white/30 hover:bg-white/10"
            asChild
          >
            <a
              href={action.url}
              target={action.openInNewTab ? "_blank" : "_self"}
              rel={action.openInNewTab ? "noopener noreferrer" : undefined}
            >
              <ActionIcon />
              {action.label}
            </a>
          </Button>
        );
      } else {
        return (
          <Button
            key={index}
            variant={getVariant(action.style)}
            size="sm"
            className="text-white border-white/30 hover:bg-white/10"
            asChild
          >
            <Link href={action.url}>
              <ActionIcon />
              {action.label}
            </Link>
          </Button>
        );
      }
    }

    if (action.type === 'phone') {
      return (
        <Button
          key={index}
          variant={getVariant(action.style)}
          size="sm"
          className="text-white border-white/30 hover:bg-white/10"
          asChild
        >
          <a href={`tel:${action.url}`}>
            <ActionIcon />
            {action.label}
          </a>
        </Button>
      );
    }

    if (action.type === 'email') {
      return (
        <Button
          key={index}
          variant={getVariant(action.style)}
          size="sm"
          className="text-white border-white/30 hover:bg-white/10"
          asChild
        >
          <a href={`mailto:${action.url}`}>
            <ActionIcon />
            {action.label}
          </a>
        </Button>
      );
    }

    return (
      <Button
        key={index}
        variant={getVariant(action.style)}
        size="sm"
        className="text-white border-white/30 hover:bg-white/10"
        onClick={() => {
          if (action.onClick) {
            // Execute custom onClick function
            const fn = new Function(action.onClick);
            fn();
          }
        }}
      >
        <ActionIcon />
        {action.label}
      </Button>
    );
  };

  const TypeIcon = getTypeIcon(currentAnnouncement.type);

  return (
    <motion.div
      initial={{ y: position === 'top' ? -100 : 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: position === 'top' ? -100 : 100, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`
        ${position === 'top' ? 'top-0' : 'bottom-0'} 
        left-0 right-0 z-50 
        ${getTypeStyles(currentAnnouncement.type)} 
        ${className}
      `}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="banner"
      aria-live="polite"
      aria-label="Announcement"
    >
      <Container size="7xl" className="py-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[52px]">
          {/* Left section - Icon and Message */}
          <div className="flex items-center flex-1 min-w-0">
            {/* Priority indicator */}
            {getPriorityIndicator(currentAnnouncement.priority)}
            
            {/* Type icon */}
            <div className="flex-shrink-0 mr-3">
              <TypeIcon className="w-5 h-5" />
            </div>

            {/* Message content */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col sm:flex-row sm:items-center"
                >
                  {/* Title */}
                  {currentAnnouncement.title && (
                    <span className="font-semibold mr-2 truncate">
                      {currentAnnouncement.title}
                    </span>
                  )}
                  
                  {/* Message */}
                  <span className="text-sm sm:text-base truncate">
                    {currentAnnouncement.content.shortText || currentAnnouncement.message}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Center section - Actions */}
          {currentAnnouncement.actions.length > 0 && (
            <div className="hidden lg:flex items-center space-x-3 mx-6">
              {currentAnnouncement.actions
                .filter(action => action.isVisible && action.isEnabled)
                .slice(0, 2)
                .map((action, index) => renderAction(action, index))}
            </div>
          )}

          {/* Right section - Controls */}
          <div className="flex items-center space-x-2 ml-4">
            {/* Rotation indicators */}
            {activeAnnouncements.length > 1 && showControls && (
              <div className="hidden sm:flex items-center space-x-1">
                {activeAnnouncements.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? 'bg-white scale-125'
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                    aria-label={`Go to announcement ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Mobile actions */}
            {currentAnnouncement.actions.length > 0 && (
              <div className="lg:hidden">
                <button 
                  className="text-white/80 hover:text-white transition-colors"
                  aria-label="View actions"
                  title="View available actions"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Dismiss button */}
            {currentAnnouncement.isDismissible && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDismiss(currentAnnouncement.id, currentAnnouncement.isPersistent)}
                className="text-white/80 hover:text-white hover:bg-white/10 h-8 w-8"
                aria-label="Dismiss announcement"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </Container>

      {/* Progress bar for auto-rotation */}
      {autoRotate && !isPaused && activeAnnouncements.length > 1 && (
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-white/30"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{
            duration: rotationInterval / 1000,
            ease: "linear",
            repeat: Infinity
          }}
          key={currentIndex}
        />
      )}

      {/* Accessibility enhancements */}
      <div className="sr-only">
        <p>
          Announcement {currentIndex + 1} of {activeAnnouncements.length}: 
          {currentAnnouncement.title} - {currentAnnouncement.message}
        </p>
        {currentAnnouncement.isDismissible && (
          <p>Press Escape key or click dismiss button to close this announcement.</p>
        )}
      </div>
    </motion.div>
  );
};

export default AnnouncementBar;
