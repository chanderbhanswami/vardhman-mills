'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  CalculatorIcon,
  ShieldCheckIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArchiveBoxIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  BellIcon,
  DevicePhoneMobileIcon,
  ChatBubbleLeftRightIcon,
  GiftIcon,
  HeartIcon,
  CubeIcon,
  ScaleIcon,
  CloudIcon,
  SunIcon
} from '@heroicons/react/24/outline';
import { 
  type ShippingPolicyData,
  calculateShippingCost,
  getDeliveryEstimate,
  formatShippingCost,
  defaultShippingPolicyData
} from './index';

interface ShippingPolicyContentProps {
  onShippingCalculate?: (orderValue: number, weight: number, destination: string) => void;
}

const ShippingPolicyContent: React.FC<ShippingPolicyContentProps> = ({ 
  onShippingCalculate 
}) => {
  const [expandedZones, setExpandedZones] = useState<Set<string>>(new Set());

  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorData, setCalculatorData] = useState({
    orderValue: '',
    weight: '',
    destination: '',
    expressDelivery: false
  });
  const [shippingEstimate, setShippingEstimate] = useState<{
    cost: number;
    timeframe: string;
    zone: string;
    deliveryDate: string;
    expressDelivery: boolean;
    orderValue: number;
    weight: number;
  } | null>(null);
  const [policyData] = useState<ShippingPolicyData>(defaultShippingPolicyData);

  const toggleZone = (zoneId: string) => {
    const newExpanded = new Set(expandedZones);
    if (newExpanded.has(zoneId)) {
      newExpanded.delete(zoneId);
    } else {
      newExpanded.add(zoneId);
    }
    setExpandedZones(newExpanded);
  };



  const calculateShipping = () => {
    if (!calculatorData.orderValue || !calculatorData.weight || !calculatorData.destination) {
      return;
    }

    const orderValue = parseFloat(calculatorData.orderValue);
    const weight = parseFloat(calculatorData.weight);
    
    const estimate = calculateShippingCost(orderValue, weight, calculatorData.destination, policyData);
    const deliveryDate = getDeliveryEstimate(calculatorData.destination, calculatorData.expressDelivery);
    
    setShippingEstimate({
      ...estimate,
      deliveryDate,
      expressDelivery: calculatorData.expressDelivery,
      orderValue,
      weight
    });

    onShippingCalculate?.(orderValue, weight, calculatorData.destination);
  };

  const getZoneIcon = (zoneId: string) => {
    switch (zoneId) {
      case 'metro':
        return CubeIcon;
      case 'tier1':
        return MapPinIcon;
      case 'tier2':
        return TruckIcon;
      case 'rural':
        return GlobeAltIcon;
      case 'south_asia':
        return GlobeAltIcon;
      case 'middle_east':
        return GlobeAltIcon;
      case 'rest_of_world':
        return GlobeAltIcon;
      default:
        return MapPinIcon;
    }
  };

  const getRestrictionIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'size & weight restrictions':
        return ScaleIcon;
      case 'hazardous materials':
        return ExclamationTriangleIcon;
      case 'perishable items':
        return ClockIcon;
      case 'high-value items':
        return ShieldCheckIcon;
      default:
        return InformationCircleIcon;
    }
  };

  const getPackagingIcon = (packagingId: string) => {
    switch (packagingId) {
      case 'standard':
        return ArchiveBoxIcon;
      case 'premium':
        return GiftIcon;
      case 'eco':
        return HeartIcon;
      case 'gift':
        return GiftIcon;
      default:
        return ArchiveBoxIcon;
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
          <div className="p-4 bg-gradient-to-br from-blue-500 to-green-600 rounded-2xl shadow-lg">
            <TruckIcon className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Shipping & Delivery Policy
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
          Fast, reliable, and secure delivery of your Vardhman Mills home textiles 
          across India and internationally with transparent pricing and tracking.
        </p>
      </motion.div>

      {/* Shipping Calculator */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="mb-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <CalculatorIcon className="h-7 w-7 text-blue-600 mr-3" />
              Shipping Cost Calculator
            </h2>
            <button
              onClick={() => setShowCalculator(!showCalculator)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showCalculator ? 'Hide Calculator' : 'Calculate Shipping'}
            </button>
          </div>

          <AnimatePresence>
            {showCalculator && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-gray-200 pt-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Value (₹)
                    </label>
                    <input
                      type="number"
                      value={calculatorData.orderValue}
                      onChange={(e) => setCalculatorData(prev => ({ ...prev, orderValue: e.target.value }))}
                      placeholder="Enter order amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={calculatorData.weight}
                      onChange={(e) => setCalculatorData(prev => ({ ...prev, weight: e.target.value }))}
                      placeholder="Enter package weight"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Destination City
                    </label>
                    <input
                      type="text"
                      value={calculatorData.destination}
                      onChange={(e) => setCalculatorData(prev => ({ ...prev, destination: e.target.value }))}
                      placeholder="Enter destination city"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center mb-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={calculatorData.expressDelivery}
                      onChange={(e) => setCalculatorData(prev => ({ ...prev, expressDelivery: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">Express Delivery (where available)</span>
                  </label>
                </div>

                <button
                  onClick={calculateShipping}
                  disabled={!calculatorData.orderValue || !calculatorData.weight || !calculatorData.destination}
                  className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mb-6"
                >
                  Calculate Shipping Cost
                </button>

                {shippingEstimate && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-6"
                  >
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Shipping Estimate</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <span className="text-sm text-blue-600 font-medium">Shipping Cost</span>
                        <p className="text-xl font-bold text-blue-900">
                          {formatShippingCost(shippingEstimate.cost)}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-blue-600 font-medium">Delivery Time</span>
                        <p className="text-lg font-semibold text-blue-900">{shippingEstimate.timeframe}</p>
                      </div>
                      <div>
                        <span className="text-sm text-blue-600 font-medium">Zone</span>
                        <p className="text-lg font-semibold text-blue-900">{shippingEstimate.zone}</p>
                      </div>
                      <div>
                        <span className="text-sm text-blue-600 font-medium">Estimated Delivery</span>
                        <p className="text-lg font-semibold text-blue-900">{shippingEstimate.deliveryDate}</p>
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
            Shipping Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="p-4 bg-blue-100 rounded-xl inline-block mb-4">
                <ClockIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {policyData.shippingTerms.orderProcessingTime}
              </h3>
              <p className="text-gray-600 text-sm">Processing Time</p>
            </div>
            <div className="text-center">
              <div className="p-4 bg-green-100 rounded-xl inline-block mb-4">
                <TruckIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Pan India
              </h3>
              <p className="text-gray-600 text-sm">Delivery Coverage</p>
            </div>
            <div className="text-center">
              <div className="p-4 bg-purple-100 rounded-xl inline-block mb-4">
                <ShieldCheckIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Insured
              </h3>
              <p className="text-gray-600 text-sm">Safe Delivery</p>
            </div>
            <div className="text-center">
              <div className="p-4 bg-orange-100 rounded-xl inline-block mb-4">
                <GlobeAltIcon className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                International
              </h3>
              <p className="text-gray-600 text-sm">Worldwide Shipping</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Domestic Shipping Zones */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <MapPinIcon className="h-7 w-7 text-blue-600 mr-3" />
          Domestic Shipping Zones
        </h2>
        <div className="space-y-4">
          {policyData.domesticZones.map((zone) => {
            const IconComponent = getZoneIcon(zone.id);
            const isExpanded = expandedZones.has(zone.id);

            return (
              <div key={zone.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleZone(zone.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 text-blue-600 rounded-lg mr-4">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{zone.name}</h3>
                        <p className="text-gray-600 mt-1">
                          Standard: {formatShippingCost(zone.standardDelivery.cost)} | 
                          {zone.expressDelivery && ` Express: ${formatShippingCost(zone.expressDelivery.cost)} |`}
                          {zone.freeShippingThreshold && ` Free shipping over ₹${zone.freeShippingThreshold.toLocaleString()}`}
                        </p>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Standard Delivery</h4>
                            <div className="bg-white rounded-lg p-4 space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Cost:</span>
                                <span className="font-medium">{formatShippingCost(zone.standardDelivery.cost)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Timeframe:</span>
                                <span className="font-medium">{zone.standardDelivery.timeframe}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Tracking:</span>
                                <span className={`font-medium ${zone.standardDelivery.trackingIncluded ? 'text-green-600' : 'text-red-600'}`}>
                                  {zone.standardDelivery.trackingIncluded ? 'Included' : 'Not Available'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Insurance:</span>
                                <span className={`font-medium ${zone.standardDelivery.insuranceIncluded ? 'text-green-600' : 'text-red-600'}`}>
                                  {zone.standardDelivery.insuranceIncluded ? 'Included' : 'Not Available'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {zone.expressDelivery && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3">Express Delivery</h4>
                              <div className="bg-white rounded-lg p-4 space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Cost:</span>
                                  <span className="font-medium">{formatShippingCost(zone.expressDelivery.cost)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Timeframe:</span>
                                  <span className="font-medium">{zone.expressDelivery.timeframe}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Tracking:</span>
                                  <span className="font-medium text-green-600">Included</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Insurance:</span>
                                  <span className="font-medium text-green-600">Included</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-900 mb-3">Coverage Areas</h4>
                          <div className="flex flex-wrap gap-2">
                            {zone.regions.map((region, index) => (
                              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                {region}
                              </span>
                            ))}
                          </div>
                        </div>

                        {zone.restrictions && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                              Special Considerations
                            </h4>
                            <ul className="space-y-1">
                              {zone.restrictions.map((restriction, index) => (
                                <li key={index} className="flex items-start text-gray-600">
                                  <InformationCircleIcon className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                                  {restriction}
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

      {/* International Shipping */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <GlobeAltIcon className="h-7 w-7 text-blue-600 mr-3" />
          International Shipping
        </h2>
        <div className="space-y-4">
          {policyData.internationalZones.map((zone) => {
            const isExpanded = expandedZones.has(zone.id);

            return (
              <div key={zone.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleZone(zone.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-3 bg-green-100 text-green-600 rounded-lg mr-4">
                        <GlobeAltIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{zone.name}</h3>
                        <p className="text-gray-600 mt-1">
                          From {formatShippingCost(zone.standardDelivery.cost)} | 
                          {zone.freeShippingThreshold && ` Free shipping over ₹${zone.freeShippingThreshold.toLocaleString()}`}
                        </p>
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
                            <h4 className="font-semibold text-gray-900 mb-3">Shipping Details</h4>
                            <div className="bg-white rounded-lg p-4 space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Base Cost:</span>
                                <span className="font-medium">{formatShippingCost(zone.standardDelivery.cost)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Delivery Time:</span>
                                <span className="font-medium">{zone.standardDelivery.timeframe}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Tracking:</span>
                                <span className="font-medium text-green-600">Included</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Insurance:</span>
                                <span className="font-medium text-green-600">Included</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Countries/Regions</h4>
                            <div className="bg-white rounded-lg p-4">
                              <div className="flex flex-wrap gap-2">
                                {zone.regions.map((region, index) => (
                                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                                    {region}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {zone.restrictions && (
                          <div className="mt-6">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                              Important Notes
                            </h4>
                            <ul className="space-y-1">
                              {zone.restrictions.map((restriction, index) => (
                                <li key={index} className="flex items-start text-gray-600">
                                  <InformationCircleIcon className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                                  {restriction}
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

      {/* Shipping Restrictions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <ExclamationTriangleIcon className="h-7 w-7 text-yellow-600 mr-3" />
          Shipping Restrictions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policyData.restrictions.map((restriction) => {
            const IconComponent = getRestrictionIcon(restriction.category);

            return (
              <div key={restriction.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-start">
                  <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg mr-4 flex-shrink-0">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{restriction.category}</h3>
                    <p className="text-gray-600 mb-3">{restriction.description}</p>
                    <p className="text-sm text-gray-500 mb-3">
                      <strong>Reason:</strong> {restriction.reason}
                    </p>
                    {restriction.alternatives && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Alternatives:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {restriction.alternatives.map((alternative, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              {alternative}
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

      {/* Packaging Options */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <ArchiveBoxIcon className="h-7 w-7 text-blue-600 mr-3" />
          Packaging Options
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policyData.packagingOptions.map((packaging) => {
            const IconComponent = getPackagingIcon(packaging.id);

            return (
              <div key={packaging.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-start">
                  <div className={`p-3 rounded-lg mr-4 flex-shrink-0 ${
                    packaging.ecoFriendly 
                      ? 'bg-green-100 text-green-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{packaging.name}</h3>
                      {packaging.ecoFriendly && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          Eco-Friendly
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{packaging.description}</p>
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-700">Suitable for:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {packaging.suitableFor.map((item, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                    {packaging.extraCost && (
                      <p className="text-sm text-gray-500">
                        <strong>Additional Cost:</strong> {formatShippingCost(packaging.extraCost)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Tracking & Notifications */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="mb-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <BellIcon className="h-7 w-7 text-blue-600 mr-3" />
            Order Tracking & Notifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Tracking Availability</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700">Domestic Orders</span>
                  <div className="flex items-center text-green-600">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    <span className="font-medium">Available</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700">International Orders</span>
                  <div className="flex items-center text-green-600">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    <span className="font-medium">Available</span>
                  </div>
                </div>
                <div className="mt-4">
                  <a 
                    href={policyData.trackingInfo.trackingPortal}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                    Track Your Order
                  </a>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Notification Methods</h3>
              <div className="grid grid-cols-2 gap-3">
                {policyData.trackingInfo.notificationMethods.map((method, index) => {
                  const getMethodIcon = (method: string) => {
                    switch (method.toLowerCase()) {
                      case 'email':
                        return EnvelopeIcon;
                      case 'sms':
                        return DevicePhoneMobileIcon;
                      case 'whatsapp':
                        return ChatBubbleLeftRightIcon;
                      case 'push notifications':
                        return BellIcon;
                      default:
                        return BellIcon;
                    }
                  };

                  const MethodIcon = getMethodIcon(method);

                  return (
                    <div key={index} className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <MethodIcon className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-gray-700 text-sm">{method}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Shipping Terms */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="mb-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <ClipboardDocumentListIcon className="h-7 w-7 text-blue-600 mr-3" />
            Important Shipping Terms
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <ClockIcon className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Order Processing</h3>
                  <p className="text-gray-600">{policyData.shippingTerms.orderProcessingTime}</p>
                  <p className="text-sm text-gray-500 mt-1">Cutoff time: {policyData.shippingTerms.cutoffTime}</p>
                </div>
              </div>
              <div className="flex items-start">
                <CalendarIcon className="h-6 w-6 text-orange-600 mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Holiday Delays</h3>
                  <p className="text-gray-600">{policyData.shippingTerms.holidayDelay}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <CloudIcon className="h-6 w-6 text-gray-600 mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Weather Considerations</h3>
                  <p className="text-gray-600">{policyData.shippingTerms.weatherDelay}</p>
                </div>
              </div>
              <div className="flex items-start">
                <SunIcon className="h-6 w-6 text-yellow-600 mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Peak Season</h3>
                  <p className="text-gray-600">Additional 1-3 days during festival seasons and sale periods</p>
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
            Shipping Support
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

export default ShippingPolicyContent;
