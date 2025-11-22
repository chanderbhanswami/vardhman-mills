'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LanguageIcon,
  ChevronDownIcon,
  CheckIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

export interface LanguageSelectorProps {
  className?: string;
  variant?: 'dropdown' | 'modal' | 'inline';
  showFlag?: boolean;
  showLabel?: boolean;
  compact?: boolean;
  onChange?: (language: Language) => void;
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
  currency: string;
  popular?: boolean;
  region: string;
}

interface LanguageGroup {
  region: string;
  languages: Language[];
}

const languages: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr',
    currency: 'USD',
    popular: true,
    region: 'Americas',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    direction: 'ltr',
    currency: 'INR',
    popular: true,
    region: 'Asia',
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    direction: 'ltr',
    currency: 'EUR',
    popular: true,
    region: 'Europe',
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    direction: 'ltr',
    currency: 'EUR',
    popular: true,
    region: 'Europe',
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    direction: 'ltr',
    currency: 'EUR',
    region: 'Europe',
  },
  {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    direction: 'ltr',
    currency: 'EUR',
    region: 'Europe',
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹',
    direction: 'ltr',
    currency: 'EUR',
    region: 'Europe',
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    direction: 'ltr',
    currency: 'JPY',
    region: 'Asia',
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    direction: 'ltr',
    currency: 'KRW',
    region: 'Asia',
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    direction: 'ltr',
    currency: 'CNY',
    region: 'Asia',
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    direction: 'rtl',
    currency: 'SAR',
    region: 'Middle East',
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    direction: 'ltr',
    currency: 'RUB',
    region: 'Europe',
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    flag: '🇧🇩',
    direction: 'ltr',
    currency: 'BDT',
    region: 'Asia',
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    flag: '🇵🇰',
    direction: 'rtl',
    currency: 'PKR',
    region: 'Asia',
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
    direction: 'ltr',
    currency: 'INR',
    region: 'Asia',
  },
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = '',
  variant = 'dropdown',
  showFlag = true,
  showLabel = true,
  compact = false,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(languages[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredLanguage, setHoveredLanguage] = useState<string | null>(null); // eslint-disable-line @typescript-eslint/no-unused-vars

  // Group languages by region
  const languageGroups: LanguageGroup[] = languages.reduce((groups, language) => {
    const existingGroup = groups.find(group => group.region === language.region);
    if (existingGroup) {
      existingGroup.languages.push(language);
    } else {
      groups.push({ region: language.region, languages: [language] });
    }
    return groups;
  }, [] as LanguageGroup[]);

  // Filter languages based on search term
  const filteredLanguages = languages.filter(language =>
    language.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    language.nativeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    language.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Popular languages for quick access
  const popularLanguages = languages.filter(lang => lang.popular);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-language-selector]')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle language selection
  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
    setIsOpen(false);
    onChange?.(language);
    
    // Update document direction for RTL languages
    document.documentElement.dir = language.direction;
    document.documentElement.lang = language.code;
    
    // Store in localStorage
    localStorage.setItem('selectedLanguage', JSON.stringify(language));
  };

  // Load saved language on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
      try {
        const language = JSON.parse(savedLanguage);
        setSelectedLanguage(language);
        document.documentElement.dir = language.direction;
        document.documentElement.lang = language.code;
      } catch (error) {
        console.warn('Failed to parse saved language:', error);
      }
    }
  }, []);

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: { duration: 0.15 }
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
    hover: { backgroundColor: 'rgba(59, 130, 246, 0.1)', transition: { duration: 0.2 } }
  };

  if (variant === 'inline') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {popularLanguages.map((language) => (
          <motion.button
            key={language.code}
            onClick={() => handleLanguageSelect(language)}
            className={`
              flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors
              ${selectedLanguage.code === language.code
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showFlag && <span className="text-sm">{language.flag}</span>}
            {showLabel && <span>{compact ? language.code.toUpperCase() : language.name}</span>}
          </motion.button>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} data-language-selector>
      {/* Language Selector Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white
          transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${compact ? 'px-2 py-1' : ''}
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label="Select Language"
        aria-expanded={isOpen}
      >
        {showFlag && (
          <span className={`${compact ? 'text-sm' : 'text-base'}`}>
            {selectedLanguage.flag}
          </span>
        )}
        
        {showLabel && !compact && (
          <span className="text-sm font-medium">
            {selectedLanguage.name}
          </span>
        )}
        
        {!compact && (
          <ChevronDownIcon 
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          />
        )}
        
        {compact && (
          <GlobeAltIcon className="w-4 h-4" />
        )}
      </motion.button>

      {/* Language Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <LanguageIcon className="w-5 h-5 mr-2" />
                  Select Language
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {languages.length} languages
                </span>
              </div>
              
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search languages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <GlobeAltIcon className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Popular Languages */}
            {!searchTerm && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Popular Languages
                </h4>
                <div className="grid grid-cols-2 gap-1">
                  {popularLanguages.map((language) => (
                    <motion.button
                      key={`popular-${language.code}`}
                      onClick={() => handleLanguageSelect(language)}
                      className={`
                        flex items-center space-x-2 p-2 rounded-lg text-left transition-colors
                        ${selectedLanguage.code === language.code
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }
                      `}
                      variants={itemVariants}
                      whileHover="hover"
                    >
                      <span className="text-base">{language.flag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{language.name}</div>
                        <div className="text-xs text-gray-500 truncate">{language.nativeName}</div>
                      </div>
                      {selectedLanguage.code === language.code && (
                        <CheckIcon className="w-4 h-4 text-primary-600" />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* All Languages */}
            <div className="overflow-y-auto max-h-64">
              {searchTerm ? (
                <div className="p-2">
                  {filteredLanguages.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No languages found
                    </div>
                  ) : (
                    filteredLanguages.map((language) => (
                      <motion.button
                        key={language.code}
                        onClick={() => handleLanguageSelect(language)}
                        onMouseEnter={() => setHoveredLanguage(language.code)}
                        onMouseLeave={() => setHoveredLanguage(null)}
                        className={`
                          w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-200
                            ${selectedLanguage.code === language.code
                            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }
                        `}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                      >
                        <span className="text-lg">{language.flag}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{language.name}</span>
                            <span className="text-xs text-gray-400 uppercase">{language.code}</span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {language.nativeName} • {language.region}
                          </div>
                        </div>
                        {selectedLanguage.code === language.code && (
                          <CheckIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        )}
                      </motion.button>
                    ))
                  )}
                </div>
              ) : (
                languageGroups.map((group) => (
                  <div key={group.region} className="p-2">
                    <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">
                      {group.region}
                    </h5>
                    {group.languages.map((language) => (
                      <motion.button
                        key={language.code}
                        onClick={() => handleLanguageSelect(language)}
                        onMouseEnter={() => setHoveredLanguage(language.code)}
                        onMouseLeave={() => setHoveredLanguage(null)}
                        className={`
                          w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-200
                          ${selectedLanguage.code === language.code
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }
                        `}
                        variants={itemVariants}
                        whileHover="hover"
                      >
                        <span className="text-lg">{language.flag}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{language.name}</span>
                            <div className="flex items-center space-x-2">
                              {language.popular && (
                                <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                                  Popular
                                </span>
                              )}
                              <span className="text-xs text-gray-400 uppercase">{language.code}</span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {language.nativeName} • {language.currency}
                          </div>
                        </div>
                        {selectedLanguage.code === language.code && (
                          <CheckIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        )}
                      </motion.button>
                    ))}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Language preferences are saved automatically
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSelector;