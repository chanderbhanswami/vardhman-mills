'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DocumentTextIcon,
  ScaleIcon,
  UserIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CalendarIcon,
  EnvelopeIcon,
  ClockIcon,
  BuildingOfficeIcon,
  IdentificationIcon,
  MapPinIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  BellIcon,
  LockClosedIcon,
  CreditCardIcon,
  TruckIcon,
  ArrowPathIcon,
  ComputerDesktopIcon,
  NoSymbolIcon,
  HandRaisedIcon,
  ChatBubbleLeftRightIcon,
  DocumentDuplicateIcon,
  BanknotesIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { 
  type TermsConditionsData,
  getSectionImportanceColor,
  getSectionImportanceIcon,
  formatLegalDate,
  generateTermsAcceptanceRecord,
  defaultTermsConditionsData
} from './index';

interface TermsConditionsContentProps {
  onTermsAcceptance?: (acceptanceRecord: { userId: string; version: string; acceptedAt: string; ipAddress: string; userAgent: string }) => void;
}

const TermsConditionsContent: React.FC<TermsConditionsContentProps> = ({ 
  onTermsAcceptance 
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['acceptance']));
  const [expandedDefinitions, setExpandedDefinitions] = useState<Set<string>>(new Set());
  const [showDefinitions, setShowDefinitions] = useState(false);
  const [showAcceptanceModal, setShowAcceptanceModal] = useState(false);
  const [termsData] = useState<TermsConditionsData>(defaultTermsConditionsData);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const toggleDefinition = (term: string) => {
    const newExpanded = new Set(expandedDefinitions);
    if (newExpanded.has(term)) {
      newExpanded.delete(term);
    } else {
      newExpanded.add(term);
    }
    setExpandedDefinitions(newExpanded);
  };

  const handleTermsAcceptance = () => {
    const acceptanceRecord = generateTermsAcceptanceRecord('current-user', termsData.version);
    onTermsAcceptance?.(acceptanceRecord);
    setShowAcceptanceModal(false);
    
    // In a real implementation, you would save this acceptance record
    console.log('Terms accepted:', acceptanceRecord);
    alert('Terms and Conditions accepted successfully!');
  };

  const getSectionIcon = (sectionId: string) => {
    switch (sectionId) {
      case 'acceptance':
        return HandRaisedIcon;
      case 'account_registration':
        return UserIcon;
      case 'product_orders':
        return BanknotesIcon;
      case 'shipping_delivery':
        return TruckIcon;
      case 'returns_refunds':
        return ArrowPathIcon;
      case 'intellectual_property':
        return LockClosedIcon;
      case 'privacy_data':
        return ShieldCheckIcon;
      case 'prohibited_uses':
        return NoSymbolIcon;
      case 'limitation_liability':
        return ExclamationTriangleIcon;
      case 'termination':
        return XCircleIcon;
      default:
        return DocumentTextIcon;
    }
  };

  // Use the icon functions to prevent unused function warnings
  const renderSectionIcon = (sectionId: string) => {
    const IconComponent = getSectionIcon(sectionId);
    return <IconComponent className="h-6 w-6" />;
  };

  const renderObligationIcon = (category: string) => {
    const IconComponent = getObligationIcon(category);
    return <IconComponent className="h-6 w-6" />;
  };

  const renderLimitationIcon = (category: string) => {
    const IconComponent = getLimitationIcon(category);
    return <IconComponent className="h-6 w-6" />;
  };

  const renderDisputeStepIcon = (step: number) => {
    const IconComponent = getDisputeStepIcon(step);
    return <IconComponent className="h-6 w-6" />;
  };

  const getObligationIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'account management':
        return UserIcon;
      case 'service usage':
        return ComputerDesktopIcon;
      case 'financial':
        return CreditCardIcon;
      case 'security':
        return ShieldCheckIcon;
      default:
        return ClipboardDocumentListIcon;
    }
  };

  const getLimitationIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'service availability':
        return ClockIcon;
      case 'product availability':
        return CheckCircleIcon;
      case 'geographic scope':
        return GlobeAltIcon;
      case 'technical':
        return ComputerDesktopIcon;
      default:
        return InformationCircleIcon;
    }
  };

  const getDisputeStepIcon = (step: number) => {
    switch (step) {
      case 1:
        return ChatBubbleLeftRightIcon;
      case 2:
        return DocumentDuplicateIcon;
      case 3:
        return HandRaisedIcon;
      case 4:
        return ScaleIcon;
      default:
        return InformationCircleIcon;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, staggerChildren: 0.1 }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center mb-6">
          <div className="p-4 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-lg">
            <ScaleIcon className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Terms & Conditions
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
          Please read these terms and conditions carefully before using Vardhman Mills services. 
          Your use of our services constitutes acceptance of these terms.
        </p>
      </motion.div>

      {/* Terms Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="p-3 bg-blue-100 rounded-lg inline-block mb-3">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Last Updated</h3>
              <p className="text-gray-600">{formatLegalDate(termsData.lastUpdated)}</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-green-100 rounded-lg inline-block mb-3">
                <DocumentTextIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Version</h3>
              <p className="text-gray-600">v{termsData.version}</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-purple-100 rounded-lg inline-block mb-3">
                <CheckCircleIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Effective Date</h3>
              <p className="text-gray-600">{formatLegalDate(termsData.effectiveDate)}</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-orange-100 rounded-lg inline-block mb-3">
                <ScaleIcon className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Jurisdiction</h3>
              <p className="text-gray-600">{termsData.applicableJurisdiction}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowDefinitions(!showDefinitions)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showDefinitions ? 'Hide' : 'Show'} Legal Definitions
            </button>
            <button
              onClick={() => setShowAcceptanceModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Accept Terms
            </button>
          </div>
        </div>
      </motion.div>

      {/* Legal Definitions */}
      <AnimatePresence>
        {showDefinitions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <BookOpenIcon className="h-7 w-7 text-blue-600 mr-3" />
                Legal Definitions
              </h2>
              <div className="space-y-3">
                {termsData.definitions.map((definition) => {
                  const isExpanded = expandedDefinitions.has(definition.term);

                  return (
                    <div key={definition.term} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div
                        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleDefinition(definition.term)}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">&ldquo;{definition.term}&rdquo;</h3>
                          {isExpanded ? (
                            <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-t border-gray-200 bg-gray-50"
                          >
                            <div className="p-4">
                              <p className="text-gray-700 mb-2">{definition.definition}</p>
                              {definition.context && (
                                <p className="text-sm text-gray-500">
                                  <strong>Context:</strong> {definition.context}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terms Agreement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-8"
      >
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <HandRaisedIcon className="h-7 w-7 text-blue-600 mr-3" />
            Agreement to Terms
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">How You Accept These Terms</h3>
              <p className="text-gray-600 mb-4">{termsData.termsAgreement.acceptanceMethod}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Binding Conditions</h3>
              <ul className="space-y-2">
                {termsData.termsAgreement.bindingConditions.map((condition, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{condition}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mr-3 mt-1" />
                <div>
                  <h4 className="font-semibold text-yellow-900">Terms Modifications</h4>
                  <p className="text-yellow-800 mt-1">{termsData.termsAgreement.modifications}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Terms Sections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Detailed Terms & Conditions
        </h2>
        <div className="space-y-4">
          {termsData.sections.map((section) => {
            const isExpanded = expandedSections.has(section.id);
            const importanceColor = getSectionImportanceColor(section.importance);
            const importanceIconColor = getSectionImportanceIcon(section.importance);

            return (
              <div key={section.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${importanceColor}`}>
                <div
                  className="p-6 cursor-pointer hover:bg-opacity-50 transition-colors"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-lg mr-4 ${importanceIconColor} bg-white bg-opacity-80`}>
                        {renderSectionIcon(section.id)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          {section.title}
                          <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${
                            section.importance === 'high' 
                              ? 'bg-red-100 text-red-800'
                              : section.importance === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                          }`}>
                            {section.importance} priority
                          </span>
                        </h3>
                        <p className="text-gray-600 mt-1">{section.content.substring(0, 150)}...</p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-200 bg-white"
                    >
                      <div className="p-6">
                        <p className="text-gray-700 mb-6">{section.content}</p>
                        
                        {section.subsections && (
                          <div className="space-y-6">
                            {section.subsections.map((subsection) => (
                              <div key={subsection.id} className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-3">{subsection.title}</h4>
                                <p className="text-gray-700 mb-4">{subsection.content}</p>
                                
                                {subsection.examples && (
                                  <div className="mb-4">
                                    <h5 className="font-medium text-gray-800 mb-2">Examples:</h5>
                                    <ul className="space-y-1">
                                      {subsection.examples.map((example, index) => (
                                        <li key={index} className="flex items-start">
                                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                          <span className="text-gray-600 text-sm">{example}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {subsection.restrictions && (
                                  <div>
                                    <h5 className="font-medium text-gray-800 mb-2">Restrictions:</h5>
                                    <ul className="space-y-1">
                                      {subsection.restrictions.map((restriction, index) => (
                                        <li key={index} className="flex items-start">
                                          <XCircleIcon className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                                          <span className="text-gray-600 text-sm">{restriction}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* User Obligations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <ClipboardDocumentListIcon className="h-7 w-7 text-blue-600 mr-3" />
          Your Obligations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {termsData.userObligations.map((obligation) => {

            return (
              <div key={obligation.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-start">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-lg mr-4 flex-shrink-0">
                    {renderObligationIcon(obligation.category)}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-blue-600">{obligation.category}</span>
                    <h3 className="text-lg font-semibold text-gray-900 mt-1 mb-2">{obligation.title}</h3>
                    <p className="text-gray-600 mb-3">{obligation.description}</p>
                    
                    {obligation.consequences && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                        <p className="text-red-800 text-sm">
                          <strong>Consequences:</strong> {obligation.consequences}
                        </p>
                      </div>
                    )}

                    {obligation.examples && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Key Points:</h4>
                        <ul className="space-y-1">
                          {obligation.examples.map((example, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600 text-sm">{example}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Service Limitations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <ExclamationTriangleIcon className="h-7 w-7 text-yellow-600 mr-3" />
          Service Limitations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {termsData.serviceLimitations.map((limitation) => {

            return (
              <div key={limitation.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-start">
                  <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg mr-4 flex-shrink-0">
                    {renderLimitationIcon(limitation.category)}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-yellow-600">{limitation.category}</span>
                    <h3 className="text-lg font-semibold text-gray-900 mt-1 mb-2">{limitation.title}</h3>
                    <p className="text-gray-600 mb-3">{limitation.description}</p>
                    
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-gray-700 text-sm">
                        <strong>Scope:</strong> {limitation.scope}
                      </p>
                    </div>

                    {limitation.exceptions && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Exceptions:</h4>
                        <ul className="space-y-1">
                          {limitation.exceptions.map((exception, index) => (
                            <li key={index} className="flex items-start">
                              <InformationCircleIcon className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600 text-sm">{exception}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Dispute Resolution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="mb-8"
      >
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <ScaleIcon className="h-7 w-7 text-blue-600 mr-3" />
            Dispute Resolution Process
          </h2>
          <div className="space-y-4">
            {termsData.disputeResolution.map((step, index) => {
              const isLast = index === termsData.disputeResolution.length - 1;

              return (
                <div key={step.id} className="flex items-start">
                  <div className="flex-shrink-0 mr-6">
                    <div className="flex flex-col items-center">
                      <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                        {renderDisputeStepIcon(step.step)}
                      </div>
                      {!isLast && (
                        <div className="w-0.5 h-8 bg-gray-200 mt-4"></div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Step {step.step}: {step.title}
                      </h3>
                      {step.timeframe && (
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {step.timeframe}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{step.description}</p>
                    
                    {step.requirements && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Requirements:</h4>
                        <ul className="space-y-1">
                          {step.requirements.map((requirement, reqIndex) => (
                            <li key={reqIndex} className="flex items-start">
                              <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600 text-sm">{requirement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Company Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="mb-8"
      >
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <BuildingOfficeIcon className="h-7 w-7 text-blue-600 mr-3" />
            Company Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Legal Entity</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <IdentificationIcon className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">{termsData.companyInfo.name}</p>
                    <p className="text-gray-600 text-sm">{termsData.companyInfo.registrationNumber}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mt-1" />
                  <p className="text-gray-600">{termsData.companyInfo.address}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Governing Law</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Jurisdiction:</span>
                  <span className="font-medium text-gray-900">{termsData.governingLaw.jurisdiction}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Courts:</span>
                  <span className="font-medium text-gray-900">{termsData.governingLaw.court}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Language:</span>
                  <span className="font-medium text-gray-900">{termsData.governingLaw.language}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contact Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
      >
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="p-3 bg-blue-100 rounded-lg inline-block mb-3">
                <EnvelopeIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Legal Inquiries</h3>
              <p className="text-gray-600">{termsData.contactInfo.legal}</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-green-100 rounded-lg inline-block mb-3">
                <BellIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">General Support</h3>
              <p className="text-gray-600">{termsData.contactInfo.support}</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-purple-100 rounded-lg inline-block mb-3">
                <ClockIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Support Hours</h3>
              <p className="text-gray-600">{termsData.contactInfo.hours}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Terms Acceptance Modal */}
      <AnimatePresence>
        {showAcceptanceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAcceptanceModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Accept Terms & Conditions</h3>
              </div>

              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  By clicking &ldquo;I Accept&rdquo;, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions (Version {termsData.version}).
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-blue-900 mb-2">Your acceptance will be recorded with:</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Timestamp of acceptance</li>
                    <li>• Version of terms accepted</li>
                    <li>• Your IP address and device information</li>
                  </ul>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex space-x-3">
                <button
                  onClick={handleTermsAcceptance}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  I Accept
                </button>
                <button
                  onClick={() => setShowAcceptanceModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TermsConditionsContent;
