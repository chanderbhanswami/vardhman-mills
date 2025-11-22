'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShareIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ShareButtons, { ShareButtonsProps } from './ShareButtons';
import SocialLinks, { SocialLinksProps } from './SocialLinks';

export interface SocialShareProps {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  className?: string;
  variant?: 'modal' | 'dropdown' | 'sidebar' | 'inline';
  trigger?: React.ReactNode;
  triggerText?: string;
  shareButtonsProps?: Partial<ShareButtonsProps>;
  socialLinksProps?: Partial<SocialLinksProps>;
  showSocialLinks?: boolean;
  showShareButtons?: boolean;
  modalTitle?: string;
  onOpen?: () => void;
  onClose?: () => void;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const SocialShare: React.FC<SocialShareProps> = ({
  url,
  title = '',
  description = '',
  image = '',
  className = '',
  variant = 'dropdown',
  trigger,
  triggerText = 'Share',
  shareButtonsProps = {},
  socialLinksProps = {},
  showSocialLinks = false,
  showShareButtons = true,
  modalTitle = 'Share this content',
  onOpen,
  onClose,
  position = 'bottom',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = useCallback(() => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (newState) {
      onOpen?.();
    } else {
      onClose?.();
    }
  }, [isOpen, onOpen, onClose]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const defaultTrigger = (
    <motion.button
      onClick={handleToggle}
      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      aria-label="Open share menu"
    >
      <ShareIcon className="w-5 h-5" />
      <span>{triggerText}</span>
    </motion.button>
  );

  const shareContent = (
    <div className="space-y-6">
      {showShareButtons && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Share via
          </h3>
          <ShareButtons
            url={url}
            title={title}
            description={description}
            image={image}
            {...shareButtonsProps}
          />
        </div>
      )}
      
      {showSocialLinks && socialLinksProps.links && socialLinksProps.links.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Follow us
          </h3>
          <SocialLinks
            links={socialLinksProps.links}
            {...socialLinksProps}
          />
        </div>
      )}
      
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Link
        </h3>
        <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <input
            type="text"
            value={url}
            readOnly
            aria-label="Shareable link"
            className="flex-1 bg-transparent text-sm text-gray-600 dark:text-gray-400 outline-none"
          />
          <button
            onClick={() => navigator.clipboard.writeText(url)}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );

  // Modal variant
  if (variant === 'modal') {
    return (
      <>
        <div onClick={handleToggle}>
          {trigger || defaultTrigger}
        </div>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            >
              <motion.div
                className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md shadow-xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {modalTitle}
                  </h2>
                  <button
                    onClick={handleClose}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    aria-label="Close modal"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
                {shareContent}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Sidebar variant
  if (variant === 'sidebar') {
    return (
      <>
        <div onClick={handleToggle}>
          {trigger || defaultTrigger}
        </div>
        
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-black bg-opacity-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClose}
              />
              <motion.div
                className={`
                  fixed z-50 bg-white dark:bg-gray-900 shadow-xl
                  ${position === 'right' ? 'right-0 top-0 h-full w-80' : ''}
                  ${position === 'left' ? 'left-0 top-0 h-full w-80' : ''}
                  ${position === 'top' ? 'top-0 left-0 w-full h-64' : ''}
                  ${position === 'bottom' ? 'bottom-0 left-0 w-full h-64' : ''}
                `}
                initial={{
                  x: position === 'right' ? '100%' : position === 'left' ? '-100%' : 0,
                  y: position === 'top' ? '-100%' : position === 'bottom' ? '100%' : 0,
                }}
                animate={{ x: 0, y: 0 }}
                exit={{
                  x: position === 'right' ? '100%' : position === 'left' ? '-100%' : 0,
                  y: position === 'top' ? '-100%' : position === 'bottom' ? '100%' : 0,
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              >
                <div className="p-6 h-full overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {modalTitle}
                    </h2>
                    <button
                      onClick={handleClose}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      aria-label="Close sidebar"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                  {shareContent}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Dropdown variant
  if (variant === 'dropdown') {
    return (
      <div className={`relative inline-block ${className}`}>
        <div onClick={handleToggle}>
          {trigger || defaultTrigger}
        </div>
        
        <AnimatePresence>
          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={handleClose}
              />
              <motion.div
                className={`
                  absolute z-20 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700
                  ${position === 'top' ? 'bottom-full mb-2' : ''}
                  ${position === 'right' ? 'right-0' : 'left-0'}
                `}
                initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? 10 : -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: position === 'top' ? 10 : -10 }}
                transition={{ duration: 0.15 }}
              >
                <div className="p-4">
                  {shareContent}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Inline variant
  return (
    <div className={`${className}`}>
      {shareContent}
    </div>
  );
};

export default SocialShare;