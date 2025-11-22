'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Truck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ChevronDown,
  Package,
  CreditCard,
  Home,
  Building2,
  Edit2,
  Plus
} from 'lucide-react';
import { Product } from '@/types/product.types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/auth/useAuth';
import { toast } from 'react-hot-toast';

export interface Address {
  id: string;
  type: 'home' | 'office' | 'other';
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface DeliveryInfo {
  isServiceable: boolean;
  deliveryDays: number;
  estimatedDeliveryDate: string;
  codAvailable: boolean;
  expressDelivery: boolean;
  shippingCharge: number;
  freeShippingThreshold?: number;
  message: string;
}

export interface DeliveryPincodeAndAddressSelectionProps {
  product: Product;
  className?: string;
  onPincodeVerified?: (pincode: string, deliveryInfo: DeliveryInfo) => void;
  onAddressSelected?: (address: Address) => void;
  showAddressSelection?: boolean;
  compact?: boolean;
}

const DeliveryPincodeAndAddressSelection: React.FC<DeliveryPincodeAndAddressSelectionProps> = ({
  product,
  className,
  onPincodeVerified,
  onAddressSelected,
  showAddressSelection = true,
  compact = false,
}) => {
  const { isAuthenticated } = useAuth();
  const [pincode, setPincode] = useState<string>('');
  const [isChecking, setIsChecking] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null);
  const [showAddresses, setShowAddresses] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  const checkPincode = useCallback(async (pincodeValue: string) => {
    if (pincodeValue.length !== 6 || !/^\d{6}$/.test(pincodeValue)) {
      return;
    }

    try {
      setIsChecking(true);
      
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/delivery/check?pincode=${pincodeValue}&productId=${product.id}`);
      // const data = await response.json();
      
      // Mock delivery info - using product info for API call context
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockDeliveryInfo: DeliveryInfo = {
        isServiceable: true,
        deliveryDays: 3,
        estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }),
        codAvailable: true,
        expressDelivery: false,
        shippingCharge: 0,
        freeShippingThreshold: 999,
        message: 'Free delivery available',
      };

      setDeliveryInfo(mockDeliveryInfo);
      onPincodeVerified?.(pincodeValue, mockDeliveryInfo);
      toast.success('Delivery available in your area');
    } catch (error) {
      console.error('Error checking pincode:', error);
      toast.error('Failed to check delivery availability');
      setDeliveryInfo({
        isServiceable: false,
        deliveryDays: 0,
        estimatedDeliveryDate: '',
        codAvailable: false,
        expressDelivery: false,
        shippingCharge: 0,
        message: 'Service not available in this area',
      });
    } finally {
      setIsChecking(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id, onPincodeVerified]);

  const loadUserAddresses = useCallback(async () => {
    try {
      setIsLoadingAddresses(true);
      // TODO: Replace with actual API call
      // const response = await fetch('/api/user/addresses');
      // const data = await response.json();
      
      // Mock data for now
      const mockAddresses: Address[] = [
        {
          id: '1',
          type: 'home',
          fullName: 'John Doe',
          phone: '+91 9876543210',
          addressLine1: '123 Main Street',
          addressLine2: 'Apartment 4B',
          landmark: 'Near Central Park',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India',
          isDefault: true,
        },
      ];
      
      setAddresses(mockAddresses);
      const defaultAddress = mockAddresses.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
        setPincode(defaultAddress.pincode);
        checkPincode(defaultAddress.pincode);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      toast.error('Failed to load saved addresses');
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [checkPincode]);

  // Load user addresses
  useEffect(() => {
    if (isAuthenticated && showAddressSelection) {
      loadUserAddresses();
    }
  }, [isAuthenticated, showAddressSelection, loadUserAddresses]);

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(value);
    
    if (deliveryInfo) {
      setDeliveryInfo(null);
    }
  };

  const handleCheckPincode = () => {
    checkPincode(pincode);
  };

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
    setPincode(address.pincode);
    setShowAddresses(false);
    checkPincode(address.pincode);
    onAddressSelected?.(address);
  };

  const getAddressIcon = (type: Address['type']) => {
    switch (type) {
      case 'home':
        return <Home className="h-4 w-4" />;
      case 'office':
        return <Building2 className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Pincode Checker */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="h-5 w-5 text-primary-600" />
          <h3 className="font-semibold text-gray-900">
            Check Delivery & Services
          </h3>
        </div>

        <div className="space-y-3">
          {/* Pincode Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={pincode}
                onChange={handlePincodeChange}
                placeholder="Enter Pincode"
                maxLength={6}
                className={cn(
                  "w-full px-4 py-2 border rounded-lg",
                  "focus:outline-none focus:ring-2 focus:ring-primary-500",
                  deliveryInfo?.isServiceable === false && "border-red-300",
                  deliveryInfo?.isServiceable === true && "border-green-300"
                )}
              />
            </div>
            <Button
              onClick={handleCheckPincode}
              disabled={pincode.length !== 6 || isChecking}
              className="px-6"
            >
              {isChecking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Check'
              )}
            </Button>
          </div>

          {/* Delivery Info */}
          <AnimatePresence mode="wait">
            {deliveryInfo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                {deliveryInfo.isServiceable ? (
                  <>
                    {/* Delivery Date */}
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-900">
                          Delivery by {deliveryInfo.estimatedDeliveryDate}
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          {deliveryInfo.message}
                        </p>
                      </div>
                    </div>

                    {/* Features Grid */}
                    {!compact && (
                      <div className="grid grid-cols-2 gap-2">
                        {/* COD Available */}
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <CreditCard className="h-4 w-4 text-gray-600" />
                          <span className="text-xs text-gray-700">
                            {deliveryInfo.codAvailable ? 'COD Available' : 'Prepaid Only'}
                          </span>
                        </div>

                        {/* Shipping */}
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <Truck className="h-4 w-4 text-gray-600" />
                          <span className="text-xs text-gray-700">
                            {deliveryInfo.shippingCharge === 0 ? 'Free Shipping' : `₹${deliveryInfo.shippingCharge}`}
                          </span>
                        </div>

                        {/* Express Delivery */}
                        {deliveryInfo.expressDelivery && (
                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                            <Clock className="h-4 w-4 text-gray-600" />
                            <span className="text-xs text-gray-700">
                              Express Available
                            </span>
                          </div>
                        )}

                        {/* Delivery Days */}
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <Package className="h-4 w-4 text-gray-600" />
                          <span className="text-xs text-gray-700">
                            {deliveryInfo.deliveryDays} Days
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-900">
                        Delivery not available
                      </p>
                      <p className="text-xs text-red-700 mt-1">
                        {deliveryInfo.message}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Saved Addresses */}
      {isAuthenticated && showAddressSelection && addresses.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Deliver to</h3>
            <button
              onClick={() => setShowAddresses(!showAddresses)}
              className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
            >
              <span>{showAddresses ? 'Hide' : 'Change'}</span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  showAddresses && 'rotate-180'
                )}
              />
            </button>
          </div>

          {/* Selected Address */}
          {selectedAddress && !showAddresses && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-3">
                {getAddressIcon(selectedAddress.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {selectedAddress.fullName}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full capitalize">
                      {selectedAddress.type}
                    </span>
                    {selectedAddress.isDefault && (
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedAddress.addressLine1}, {selectedAddress.addressLine2 && `${selectedAddress.addressLine2}, `}
                    {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedAddress.phone}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Address List */}
          <AnimatePresence>
            {showAddresses && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                {isLoadingAddresses ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <>
                    {addresses.map((address) => (
                      <button
                        key={address.id}
                        onClick={() => handleAddressSelect(address)}
                        className={cn(
                          "w-full p-3 rounded-lg border-2 text-left transition-colors",
                          selectedAddress?.id === address.id
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {getAddressIcon(address.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">
                                {address.fullName}
                              </span>
                              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full capitalize">
                                {address.type}
                              </span>
                              {address.isDefault && (
                                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {address.addressLine1}, {address.addressLine2 && `${address.addressLine2}, `}
                              {address.city}, {address.state} - {address.pincode}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Open edit address modal
                              toast.success('Edit address feature coming soon');
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            aria-label="Edit address"
                            title="Edit address"
                          >
                            <Edit2 className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>
                      </button>
                    ))}

                    {/* Add New Address */}
                    <button
                      onClick={() => {
                        // TODO: Open add address modal
                        toast.success('Add address feature coming soon');
                      }}
                      className="w-full p-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-500 hover:bg-primary-50 transition-colors"
                    >
                      <div className="flex items-center justify-center gap-2 text-primary-600">
                        <Plus className="h-4 w-4" />
                        <span className="font-medium">Add New Address</span>
                      </div>
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default DeliveryPincodeAndAddressSelection;