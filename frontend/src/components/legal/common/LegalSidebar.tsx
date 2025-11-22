'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRightIcon,
  BookmarkIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { LegalSidebarProps, scrollToSection } from './index';

const LegalSidebar: React.FC<LegalSidebarProps> = ({
  navItems,
  activeSection,
  onSectionChange,
  className = ''
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isSticky, setIsSticky] = useState(false);
  const [readingSections, setReadingSections] = useState<Set<string>>(new Set());

  // Handle scroll to track active sections and reading progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsSticky(scrollTop > 200);

      // Track which sections are in view
      const sections = document.querySelectorAll('[data-legal-section]');
      const inViewSections = new Set<string>();

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const sectionId = section.getAttribute('data-legal-section');
        
        if (rect.top <= 100 && rect.bottom >= 100 && sectionId) {
          inViewSections.add(sectionId);
          
          // Mark as read if user has scrolled past 80% of the section
          if (rect.top <= -rect.height * 0.8) {
            setReadingSections(prev => new Set([...Array.from(prev), sectionId]));
          }
        }
      });

      // Update active section based on what's in view
      if (inViewSections.size > 0) {
        const firstInView = Array.from(inViewSections)[0];
        if (firstInView !== activeSection) {
          onSectionChange?.(firstInView);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection, onSectionChange]);

  // Toggle expanded state
  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(Array.from(prev));
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Handle navigation click
  const handleNavClick = (href: string, sectionId: string) => {
    if (href.startsWith('#')) {
      scrollToSection(sectionId);
      onSectionChange?.(sectionId);
    } else {
      window.location.href = href;
    }
  };

  // Auto-expand active items
  useEffect(() => {
    navItems.forEach(item => {
      if (item.subsections?.some(sub => sub.id === activeSection) || item.id === activeSection) {
        setExpandedItems(prev => new Set([...Array.from(prev), item.id]));
      }
    });
  }, [activeSection, navItems]);

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        ${className}
        ${isSticky ? 'sticky top-6' : ''}
        transition-all duration-300
      `}
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BookmarkIcon className="h-5 w-5 mr-2 text-blue-600" />
            Table of Contents
          </h3>
        </div>

        {/* Navigation */}
        <nav className="p-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            {navItems.map((item, index) => (
              <div key={item.id}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                >
                  {/* Main Item */}
                  <div
                    className={`
                      group flex items-center justify-between p-3 rounded-lg cursor-pointer
                      transition-all duration-200 hover:bg-gray-50
                      ${item.isActive || activeSection === item.id 
                        ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-700' 
                        : 'text-gray-700 hover:text-gray-900'
                      }
                    `}
                    onClick={() => {
                      if (item.subsections && item.subsections.length > 0) {
                        toggleExpanded(item.id);
                      } else {
                        handleNavClick(item.href, item.id);
                      }
                    }}
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      {/* Icon */}
                      {item.icon && (
                        <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                      )}
                      
                      {/* Title */}
                      <span className="font-medium truncate">{item.title}</span>
                      
                      {/* Reading Progress */}
                      {readingSections.has(item.id) && (
                        <CheckCircleIcon className="h-4 w-4 ml-2 text-green-500 flex-shrink-0" />
                      )}
                    </div>

                    {/* Expand/Collapse Button */}
                    {item.subsections && item.subsections.length > 0 && (
                      <motion.div
                        animate={{ 
                          rotate: expandedItems.has(item.id) ? 90 : 0 
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Subsections */}
                <AnimatePresence>
                  {item.subsections && expandedItems.has(item.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="ml-4 mt-2 overflow-hidden"
                    >
                      <div className="space-y-1 border-l-2 border-gray-100 pl-4">
                        {item.subsections.map((subsection) => (
                          <div
                            key={subsection.id}
                            className={`
                              flex items-center p-2 rounded cursor-pointer text-sm
                              transition-all duration-200 hover:bg-gray-50
                              ${activeSection === subsection.id 
                                ? 'bg-blue-50 text-blue-700 font-medium' 
                                : 'text-gray-600 hover:text-gray-900'
                              }
                            `}
                            onClick={() => handleNavClick(subsection.href, subsection.id)}
                          >
                            <div className="flex items-center flex-1 min-w-0">
                              <span className="truncate">{subsection.title}</span>
                              
                              {/* Reading Progress */}
                              {readingSections.has(subsection.id) && (
                                <CheckCircleIcon className="h-3 w-3 ml-2 text-green-500 flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center text-xs text-gray-500">
            <ClockIcon className="h-4 w-4 mr-1" />
            <span>Auto-saves reading progress</span>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </motion.aside>
  );
};

export default LegalSidebar;