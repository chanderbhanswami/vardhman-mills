'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheckIcon,
  UserIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  PauseIcon,
  StopIcon,
  DocumentTextIcon,
  CalendarIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  LockClosedIcon,
  GlobeAltIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { 
  type PrivacyPolicyData,
  formatDataRetention,
  getLawfulBasisDescription,
  defaultPrivacyPolicyData
} from './index';

interface PrivacyPolicyContentProps {
  onDataRequestSubmit?: (requestType: string, details: string) => void;
}

const PrivacyPolicyContent: React.FC<PrivacyPolicyContentProps> = ({ 
  onDataRequestSubmit 
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['introduction']));
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showDataRequestModal, setShowDataRequestModal] = useState(false);
  const [selectedRequestType, setSelectedRequestType] = useState<string>('');
  const [requestDetails, setRequestDetails] = useState<string>('');
  const [policyData] = useState<PrivacyPolicyData>(defaultPrivacyPolicyData);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'personal':
        return UserIcon;
      case 'transactional':
        return CreditCardIcon;
      case 'behavioral':
        return ChartBarIcon;
      case 'communication':
        return ChatBubbleLeftRightIcon;
      default:
        return DocumentTextIcon;
    }
  };

  const getRightIcon = (iconName: string) => {
    switch (iconName) {
      case 'eye':
        return EyeIcon;
      case 'pencil':
        return PencilIcon;
      case 'trash':
        return TrashIcon;
      case 'download':
        return ArrowDownTrayIcon;
      case 'pause':
        return PauseIcon;
      case 'stop':
        return StopIcon;
      default:
        return DocumentTextIcon;
    }
  };

  const handleDataRequest = (requestType: string) => {
    setSelectedRequestType(requestType);
    setShowDataRequestModal(true);
  };

  const submitDataRequest = () => {
    if (selectedRequestType && requestDetails.trim()) {
      onDataRequestSubmit?.(selectedRequestType, requestDetails);
      setShowDataRequestModal(false);
      setSelectedRequestType('');
      setRequestDetails('');
      
      // Show success notification (you might want to implement a proper notification system)
      alert('Your data request has been submitted successfully. We will respond within 30 days.');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center mb-6">
          <div className="p-4 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl shadow-lg">
            <ShieldCheckIcon className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Privacy Policy
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
          Your privacy is important to us. Learn how we collect, use, and protect your personal information 
          when you use our services.
        </p>
      </motion.div>

      {/* Policy Overview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="mb-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="p-3 bg-blue-100 rounded-lg inline-block mb-3">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Last Updated</h3>
              <p className="text-gray-600">{policyData.lastUpdated}</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-green-100 rounded-lg inline-block mb-3">
                <DocumentTextIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Version</h3>
              <p className="text-gray-600">v{policyData.version}</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-purple-100 rounded-lg inline-block mb-3">
                <CheckCircleIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Effective Date</h3>
              <p className="text-gray-600">{policyData.effectiveDate}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Data Categories */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <ClipboardDocumentListIcon className="h-7 w-7 text-blue-600 mr-3" />
          Types of Data We Collect
        </h2>
        <div className="space-y-4">
          {policyData.dataCategories.map((category) => {
            const IconComponent = getCategoryIcon(category.id);
            const isExpanded = expandedCategories.has(category.id);

            return (
              <div key={category.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 text-blue-600 rounded-lg mr-4">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                        <p className="text-gray-600 mt-1">{category.description}</p>
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
                      className="border-t border-gray-200 bg-gray-50"
                    >
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Data Types</h4>
                            <ul className="space-y-2">
                              {category.dataTypes.map((type, index) => (
                                <li key={index} className="flex items-center text-gray-600">
                                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                  {type}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Purposes</h4>
                            <ul className="space-y-2">
                              {category.purpose.map((purpose, index) => (
                                <li key={index} className="flex items-center text-gray-600">
                                  <CheckCircleIcon className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                                  {purpose}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white rounded-lg p-4">
                            <span className="text-sm font-medium text-gray-500">Retention Period</span>
                            <p className="text-gray-900">{formatDataRetention(category.retention)}</p>
                          </div>
                          {category.lawfulBasis && (
                            <div className="bg-white rounded-lg p-4">
                              <span className="text-sm font-medium text-gray-500">Lawful Basis</span>
                              <p className="text-gray-900">{getLawfulBasisDescription(category.lawfulBasis)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Your Rights */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <UserGroupIcon className="h-7 w-7 text-blue-600 mr-3" />
          Your Privacy Rights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policyData.dataRights.map((right) => {
            const IconComponent = getRightIcon(right.icon);

            return (
              <div key={right.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-start">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mr-4 flex-shrink-0">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{right.name}</h3>
                    <p className="text-gray-600 mb-3">{right.description}</p>
                    <p className="text-sm text-gray-500 mb-4">{right.howToExercise}</p>
                    <button
                      onClick={() => handleDataRequest(right.id)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Exercise This Right
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Detailed Sections */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Detailed Privacy Information
        </h2>
        <div className="space-y-4">
          {policyData.sections.map((section) => {
            const isExpanded = expandedSections.has(section.id);

            return (
              <div key={section.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
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
                      <div className="p-6">
                        <p className="text-gray-600 mb-4">{section.content}</p>
                        {section.subsections && (
                          <div className="space-y-4">
                            {section.subsections.map((subsection) => (
                              <div key={subsection.id} className="bg-white rounded-lg p-4 border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-2">{subsection.title}</h4>
                                <p className="text-gray-600">{subsection.content}</p>
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

      {/* Data Controller Information */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="mb-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <LockClosedIcon className="h-7 w-7 text-blue-600 mr-3" />
            Data Controller Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Company Details</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">{policyData.dataController.name}</p>
                    <p className="text-gray-600">{policyData.dataController.address}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <p className="text-gray-600">{policyData.dataController.email}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                  <p className="text-gray-600">{policyData.dataController.phone}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Privacy Officer</h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-gray-600 mb-2">
                  For specific privacy-related inquiries, you can contact our Data Protection Officer:
                </p>
                <div className="flex items-center space-x-2">
                  <EnvelopeIcon className="h-4 w-4 text-blue-600" />
                  <a 
                    href={`mailto:${policyData.dataController.dpoEmail}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {policyData.dataController.dpoEmail}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* International Transfers & Security */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <GlobeAltIcon className="h-6 w-6 text-blue-600 mr-2" />
              International Transfers
            </h3>
            <p className="text-gray-600 mb-4">
              Your data may be processed in countries outside your residence. We ensure appropriate 
              safeguards are in place, including:
            </p>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-600">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                Standard Contractual Clauses
              </li>
              <li className="flex items-center text-gray-600">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                Adequacy Decisions
              </li>
              <li className="flex items-center text-gray-600">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                Certification Schemes
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <ShieldCheckIcon className="h-6 w-6 text-green-600 mr-2" />
              Security Measures
            </h3>
            <p className="text-gray-600 mb-4">
              We implement robust security measures to protect your personal information:
            </p>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-600">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                End-to-end Encryption
              </li>
              <li className="flex items-center text-gray-600">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                Regular Security Audits
              </li>
              <li className="flex items-center text-gray-600">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                Access Controls
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Data Request Modal */}
      <AnimatePresence>
        {showDataRequestModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDataRequestModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Submit Data Request</h3>
                  <button
                    onClick={() => setShowDataRequestModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Close data request modal"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Request Type
                  </label>
                  <select
                    value={selectedRequestType}
                    onChange={(e) => setSelectedRequestType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Select type of data request"
                  >
                    <option value="">Select a request type</option>
                    {policyData.dataRights.map((right) => (
                      <option key={right.id} value={right.id}>
                        {right.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Details
                  </label>
                  <textarea
                    value={requestDetails}
                    onChange={(e) => setRequestDetails(e.target.value)}
                    placeholder="Please provide any additional details about your request..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={submitDataRequest}
                    disabled={!selectedRequestType || !requestDetails.trim()}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Submit Request
                  </button>
                  <button
                    onClick={() => setShowDataRequestModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PrivacyPolicyContent;
