'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TagIcon,
  ShieldCheckIcon,
  ComputerDesktopIcon,
  ListBulletIcon,
  PrinterIcon,
  ArchiveBoxIcon,
  TruckIcon,
  CogIcon,
  CreditCardIcon,
  GiftIcon,
  BuildingLibraryIcon,
  EnvelopeIcon,
  PhoneIcon,
  CurrencyRupeeIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { 
  type ReturnPolicyData,
  getReturnEligibility,
  formatReturnTimeframe,
  defaultReturnPolicyData
} from './index';

interface ReturnEligibility {
  eligible: boolean;
  reason: string;
  daysLeft?: number;
  timeframe?: string;
  orderDate?: string;
  orderNumber?: string;
}

interface ReturnPolicyContentProps {
  onReturnRequest?: (orderId: string, items: string[], reason: string) => void;
}

const ReturnPolicyContent: React.FC<ReturnPolicyContentProps> = ({ 
  onReturnRequest 
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showReturnChecker, setShowReturnChecker] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [returnEligibility, setReturnEligibility] = useState<ReturnEligibility | null>(null);
  const [policyData] = useState<ReturnPolicyData>(defaultReturnPolicyData);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getConditionIcon = (iconName: string) => {
    switch (iconName) {
      case 'check':
        return CheckCircleIcon;
      case 'tag':
        return TagIcon;
      case 'clock':
        return ClockIcon;
      case 'shield':
        return ShieldCheckIcon;
      case 'x':
        return XCircleIcon;
      default:
        return InformationCircleIcon;
    }
  };

  const getProcessIcon = (iconName: string) => {
    switch (iconName) {
      case 'computer':
        return ComputerDesktopIcon;
      case 'list':
        return ListBulletIcon;
      case 'printer':
        return PrinterIcon;
      case 'package':
        return ArchiveBoxIcon;
      case 'truck':
        return TruckIcon;
      case 'cog':
        return CogIcon;
      default:
        return DocumentTextIcon;
    }
  };

  const getRefundIcon = (iconName: string) => {
    switch (iconName) {
      case 'credit-card':
        return CreditCardIcon;
      case 'gift':
        return GiftIcon;
      case 'bank':
        return BuildingLibraryIcon;
      case 'mail':
        return EnvelopeIcon;
      default:
        return CurrencyRupeeIcon;
    }
  };

  const checkReturnEligibility = () => {
    if (!orderNumber || !selectedCategory) return;
    
    // Simulated order date (in real app, you'd fetch this from API)
    const mockOrderDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const eligibility = getReturnEligibility(
      mockOrderDate.toISOString(), 
      selectedCategory, 
      policyData
    );
    
    setReturnEligibility({
      ...eligibility,
      reason: eligibility.reason || 'Standard return policy applies',
      orderDate: mockOrderDate.toISOString(),
      orderNumber
    });
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
          <div className="p-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
            <ArrowPathIcon className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Return & Exchange Policy
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
          We want you to love your Vardhman Mills home textiles. If you&apos;re not completely satisfied,
          we&apos;re here to help with our hassle-free return process.
        </p>
      </motion.div>

      {/* Return Eligibility Checker */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="mb-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <MagnifyingGlassIcon className="h-7 w-7 text-blue-600 mr-3" />
              Check Return Eligibility
            </h2>
            <button
              onClick={() => setShowReturnChecker(!showReturnChecker)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showReturnChecker ? 'Hide Checker' : 'Check Eligibility'}
            </button>
          </div>

          <AnimatePresence>
            {showReturnChecker && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-gray-200 pt-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Number
                    </label>
                    <input
                      type="text"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      placeholder="Enter your order number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-label="Select product category for return eligibility"
                    >
                      <option value="">Select category</option>
                      {policyData.returnCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={checkReturnEligibility}
                  disabled={!orderNumber || !selectedCategory}
                  className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mb-6"
                >
                  Check Eligibility
                </button>

                {returnEligibility && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border ${
                      returnEligibility.eligible 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start">
                      {returnEligibility.eligible ? (
                        <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3 mt-1" />
                      ) : (
                        <XCircleIcon className="h-6 w-6 text-red-600 mr-3 mt-1" />
                      )}
                      <div>
                        <h3 className={`font-semibold ${
                          returnEligibility.eligible ? 'text-green-900' : 'text-red-900'
                        }`}>
                          {returnEligibility.eligible ? 'Eligible for Return' : 'Not Eligible for Return'}
                        </h3>
                        <p className={`mt-1 ${
                          returnEligibility.eligible ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {returnEligibility.eligible 
                            ? `You have ${returnEligibility.daysLeft} days left to return this item.`
                            : returnEligibility.reason
                          }
                        </p>
                        {returnEligibility.eligible && (
                          <button
                            onClick={() => onReturnRequest?.(orderNumber, [selectedCategory], 'Quality issue')}
                            className="mt-3 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Start Return Process
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Policy Overview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="mb-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Return Policy Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="p-4 bg-blue-100 rounded-xl inline-block mb-4">
                <ClockIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {formatReturnTimeframe(policyData.generalReturnWindow)}
              </h3>
              <p className="text-gray-600">
                Standard return window for most items
              </p>
            </div>
            <div className="text-center">
              <div className="p-4 bg-green-100 rounded-xl inline-block mb-4">
                <TruckIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Free Returns
              </h3>
              <p className="text-gray-600">
                On orders over ₹2,500, otherwise ₹150 shipping fee
              </p>
            </div>
            <div className="text-center">
              <div className="p-4 bg-purple-100 rounded-xl inline-block mb-4">
                <CurrencyRupeeIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Full Refund
              </h3>
              <p className="text-gray-600">
                Full refund on eligible returns within timeframe
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Return Categories */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <ClipboardDocumentListIcon className="h-7 w-7 text-blue-600 mr-3" />
          Return Windows by Category
        </h2>
        <div className="space-y-4">
          {policyData.returnCategories.map((category) => {
            const isExpanded = expandedCategories.has(category.id);

            return (
              <div key={category.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-lg mr-4 ${
                        category.nonReturnable 
                          ? 'bg-red-100 text-red-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {category.nonReturnable ? (
                          <XCircleIcon className="h-6 w-6" />
                        ) : (
                          <ArrowPathIcon className="h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          {category.name}
                          <span className={`ml-3 px-3 py-1 text-sm font-medium rounded-full ${
                            category.nonReturnable
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {category.nonReturnable 
                              ? 'Non-Returnable' 
                              : formatReturnTimeframe(category.returnWindow)
                            }
                          </span>
                        </h3>
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
                        {!category.nonReturnable && (
                          <div className="mb-6">
                            <h4 className="font-semibold text-gray-900 mb-3">Return Conditions</h4>
                            <ul className="space-y-2">
                              {category.conditions.map((condition, index) => (
                                <li key={index} className="flex items-center text-gray-600">
                                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                  {condition}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {category.specialInstructions && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                              Special Instructions
                            </h4>
                            <ul className="space-y-2">
                              {category.specialInstructions.map((instruction, index) => (
                                <li key={index} className="flex items-start text-gray-600">
                                  <InformationCircleIcon className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                                  {instruction}
                                </li>
                              ))}
                            </ul>
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

      {/* Return Conditions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Return Eligibility Conditions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
              <CheckCircleIcon className="h-6 w-6 text-green-600 mr-2" />
              Eligible for Return
            </h3>
            <div className="space-y-3">
              {policyData.returnConditions
                .filter(condition => condition.category === 'eligible')
                .map((condition) => {
                  const IconComponent = getConditionIcon(condition.icon);
                  return (
                    <div key={condition.id} className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-start">
                        <IconComponent className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-green-900">{condition.title}</h4>
                          <p className="text-green-700 text-sm mt-1">{condition.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
              <XCircleIcon className="h-6 w-6 text-red-600 mr-2" />
              Not Eligible for Return
            </h3>
            <div className="space-y-3">
              {policyData.returnConditions
                .filter(condition => condition.category === 'ineligible')
                .map((condition) => {
                  const IconComponent = getConditionIcon(condition.icon);
                  return (
                    <div key={condition.id} className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <div className="flex items-start">
                        <IconComponent className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-red-900">{condition.title}</h4>
                          <p className="text-red-700 text-sm mt-1">{condition.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Return Process */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          How to Return Items
        </h2>
        <div className="space-y-4">
          {policyData.returnProcess.map((step, index) => {
            const IconComponent = getProcessIcon(step.icon);
            const isLast = index === policyData.returnProcess.length - 1;

            return (
              <div key={step.step} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-6">
                    <div className="flex flex-col items-center">
                      <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      {!isLast && (
                        <div className="w-0.5 h-8 bg-gray-200 mt-4"></div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Step {step.step}: {step.title}
                      </h3>
                      {step.duration && (
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {step.duration}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Refund Methods */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Refund Options
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policyData.refundMethods.map((method) => {
            const IconComponent = getRefundIcon(method.icon);

            return (
              <div key={method.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-start">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mr-4 flex-shrink-0">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{method.name}</h3>
                    <p className="text-gray-600 mb-3">{method.description}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Processing Time:</span>
                      <span className="font-medium text-gray-900">{method.processingTime}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-1">
                      <span className="text-gray-500">Fees:</span>
                      <span className={`font-medium ${
                        method.fees?.includes('bonus') ? 'text-green-600' : 'text-gray-900'
                      }`}>
                        {method.fees}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Shipping Information */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="mb-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <TruckIcon className="h-7 w-7 text-blue-600 mr-3" />
            Return Shipping Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Shipping Costs</h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-blue-900 font-medium mb-2">
                  {policyData.shippingPolicy.returnShippingFee}
                </p>
                <p className="text-blue-700 text-sm">
                  Free return shipping for orders over ₹{policyData.shippingPolicy.freeReturnThreshold?.toLocaleString()}
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Return Address</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <p className="text-gray-600 text-sm">
                    {policyData.shippingPolicy.returnAddress}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contact Information */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Need Help with Returns?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="p-3 bg-blue-100 rounded-lg inline-block mb-3">
                <EnvelopeIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Email Support</h3>
              <p className="text-gray-600">{policyData.contactInfo.email}</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-green-100 rounded-lg inline-block mb-3">
                <PhoneIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Phone Support</h3>
              <p className="text-gray-600">{policyData.contactInfo.phone}</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-purple-100 rounded-lg inline-block mb-3">
                <ClockIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Support Hours</h3>
              <p className="text-gray-600">{policyData.contactInfo.hours}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ReturnPolicyContent;
