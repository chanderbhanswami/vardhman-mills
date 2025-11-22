/**
 * Payment Context - Vardhman Mills Frontend
 * Manages payment methods, transactions, and billing
 */

'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import toast from 'react-hot-toast';

// Types
interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'netbanking' | 'wallet' | 'cod' | 'emi';
  provider: string;
  displayName: string;
  isDefault: boolean;
  isActive: boolean;
  details: {
    cardNumber?: string;
    expiryDate?: string;
    cardType?: 'visa' | 'mastercard' | 'rupay' | 'amex';
    holderName?: string;
    upiId?: string;
    bankName?: string;
    walletProvider?: string;
    walletBalance?: number;
    emiProvider?: string;
    emiTenures?: number[];
  };
  createdAt: Date;
  lastUsed?: Date;
}

interface BillingAddress {
  id: string;
  name: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  isDefault: boolean;
  type: 'home' | 'office' | 'other';
}

interface Transaction {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod: PaymentMethod;
  gateway: string;
  gatewayTransactionId?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

interface PaymentSession {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  paymentMethods: string[];
  expiresAt: Date;
  clientSecret?: string;
  gatewayData?: Record<string, unknown>;
}

interface PaymentState {
  paymentMethods: PaymentMethod[];
  defaultPaymentMethod?: PaymentMethod;
  billingAddresses: BillingAddress[];
  defaultBillingAddress?: BillingAddress;
  currentSession?: PaymentSession;
  selectedPaymentMethod?: PaymentMethod;
  selectedBillingAddress?: BillingAddress;
  transactions: Transaction[];
  loading: boolean;
  processing: boolean;
  error: string | null;
  preferences: {
    saveCards: boolean;
    autoFillBilling: boolean;
    enableEMI: boolean;
    preferredMethods: string[];
  };
  cvvRequired: boolean;
  twoFactorEnabled: boolean;
  lastUpdated: Date | null;
}

type PaymentAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PAYMENT_METHODS'; payload: PaymentMethod[] }
  | { type: 'ADD_PAYMENT_METHOD'; payload: PaymentMethod }
  | { type: 'UPDATE_PAYMENT_METHOD'; payload: { id: string; updates: Partial<PaymentMethod> } }
  | { type: 'DELETE_PAYMENT_METHOD'; payload: string }
  | { type: 'SET_DEFAULT_PAYMENT_METHOD'; payload: string }
  | { type: 'SET_BILLING_ADDRESSES'; payload: BillingAddress[] }
  | { type: 'ADD_BILLING_ADDRESS'; payload: BillingAddress }
  | { type: 'UPDATE_BILLING_ADDRESS'; payload: { id: string; updates: Partial<BillingAddress> } }
  | { type: 'DELETE_BILLING_ADDRESS'; payload: string }
  | { type: 'SET_DEFAULT_BILLING_ADDRESS'; payload: string }
  | { type: 'SET_CURRENT_SESSION'; payload: PaymentSession }
  | { type: 'SET_SELECTED_PAYMENT_METHOD'; payload: PaymentMethod }
  | { type: 'SET_SELECTED_BILLING_ADDRESS'; payload: BillingAddress }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: { id: string; updates: Partial<Transaction> } }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<PaymentState['preferences']> }
  | { type: 'CLEAR_SESSION' };

interface PaymentContextType {
  state: PaymentState;
  loadPaymentMethods: () => Promise<void>;
  addPaymentMethod: (method: Omit<PaymentMethod, 'id' | 'createdAt'>) => Promise<void>;
  updatePaymentMethod: (id: string, updates: Partial<PaymentMethod>) => Promise<void>;
  deletePaymentMethod: (id: string) => Promise<void>;
  setDefaultPaymentMethod: (id: string) => Promise<void>;
  loadBillingAddresses: () => Promise<void>;
  addBillingAddress: (address: Omit<BillingAddress, 'id'>) => Promise<void>;
  updateBillingAddress: (id: string, updates: Partial<BillingAddress>) => Promise<void>;
  deleteBillingAddress: (id: string) => Promise<void>;
  setDefaultBillingAddress: (id: string) => Promise<void>;
  initializePayment: (orderId: string, amount: number) => Promise<PaymentSession>;
  processPayment: (sessionId: string, paymentMethodId: string) => Promise<Transaction>;
  verifyPayment: (transactionId: string) => Promise<boolean>;
  cancelPayment: (sessionId: string) => Promise<void>;
  initiateRefund: (transactionId: string, amount?: number) => Promise<void>;
  selectPaymentMethod: (method: PaymentMethod) => void;
  selectBillingAddress: (address: BillingAddress) => void;
  loadTransactions: () => Promise<void>;
  getTransaction: (id: string) => Transaction | undefined;
  validateCard: (cardNumber: string, expiryDate: string, cvv: string) => boolean;
  formatCardNumber: (cardNumber: string) => string;
  getCardType: (cardNumber: string) => string;
  calculateEMI: (amount: number, tenure: number, interestRate: number) => number;
  updatePreferences: (preferences: Partial<PaymentState['preferences']>) => Promise<void>;
  enableTwoFactor: () => Promise<void>;
  disableTwoFactor: () => Promise<void>;
  trackPaymentEvent: (event: string, data?: Record<string, unknown>) => void;
}

// Default preferences
const defaultPreferences = {
  saveCards: false,
  autoFillBilling: true,
  enableEMI: false,
  preferredMethods: ['upi', 'card'],
};

// Initial state
const initialState: PaymentState = {
  paymentMethods: [],
  billingAddresses: [],
  transactions: [],
  loading: false,
  processing: false,
  error: null,
  preferences: defaultPreferences,
  cvvRequired: true,
  twoFactorEnabled: false,
  lastUpdated: null,
};

// Utility functions
const getCardTypeUtil = (cardNumber: string): string => {
  const number = cardNumber.replace(/\s/g, '');
  if (/^4/.test(number)) return 'visa';
  if (/^5[1-5]/.test(number)) return 'mastercard';
  if (/^6/.test(number)) return 'rupay';
  if (/^3[47]/.test(number)) return 'amex';
  return 'unknown';
};

const validateCardUtil = (cardNumber: string, expiryDate: string, cvv: string): boolean => {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(cleanNumber)) return false;
  
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) return false;
  
  if (!/^\d{3,4}$/.test(cvv)) return false;
  
  let sum = 0;
  let alternate = false;
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let n = parseInt(cleanNumber.charAt(i));
    if (alternate) {
      n *= 2;
      if (n > 9) n = (n % 10) + 1;
    }
    sum += n;
    alternate = !alternate;
  }
  
  return sum % 10 === 0;
};

// Reducer
const paymentReducer = (state: PaymentState, action: PaymentAction): PaymentState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_PROCESSING':
      return { ...state, processing: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_PAYMENT_METHODS':
      const defaultMethod = action.payload.find(method => method.isDefault);
      return {
        ...state,
        paymentMethods: action.payload,
        defaultPaymentMethod: defaultMethod,
        lastUpdated: new Date(),
      };
    
    case 'ADD_PAYMENT_METHOD': {
      const newMethods = [...state.paymentMethods, action.payload];
      return {
        ...state,
        paymentMethods: newMethods,
        defaultPaymentMethod: action.payload.isDefault ? action.payload : state.defaultPaymentMethod,
        lastUpdated: new Date(),
      };
    }
    
    case 'UPDATE_PAYMENT_METHOD': {
      const updatedMethods = state.paymentMethods.map(method =>
        method.id === action.payload.id
          ? { ...method, ...action.payload.updates }
          : method
      );
      
      const updatedMethod = updatedMethods.find(m => m.id === action.payload.id);
      
      return {
        ...state,
        paymentMethods: updatedMethods,
        defaultPaymentMethod: updatedMethod?.isDefault ? updatedMethod : state.defaultPaymentMethod,
        lastUpdated: new Date(),
      };
    }
    
    case 'DELETE_PAYMENT_METHOD': {
      const filteredMethods = state.paymentMethods.filter(method => method.id !== action.payload);
      const wasDefault = state.defaultPaymentMethod?.id === action.payload;
      
      return {
        ...state,
        paymentMethods: filteredMethods,
        defaultPaymentMethod: wasDefault ? filteredMethods[0] : state.defaultPaymentMethod,
        lastUpdated: new Date(),
      };
    }
    
    case 'SET_DEFAULT_PAYMENT_METHOD': {
      const updatedMethods = state.paymentMethods.map(method => ({
        ...method,
        isDefault: method.id === action.payload,
      }));
      
      const newDefault = updatedMethods.find(m => m.id === action.payload);
      
      return {
        ...state,
        paymentMethods: updatedMethods,
        defaultPaymentMethod: newDefault,
        lastUpdated: new Date(),
      };
    }
    
    case 'SET_BILLING_ADDRESSES':
      const defaultAddress = action.payload.find(address => address.isDefault);
      return {
        ...state,
        billingAddresses: action.payload,
        defaultBillingAddress: defaultAddress,
        lastUpdated: new Date(),
      };
    
    case 'ADD_BILLING_ADDRESS': {
      const newAddresses = [...state.billingAddresses, action.payload];
      return {
        ...state,
        billingAddresses: newAddresses,
        defaultBillingAddress: action.payload.isDefault ? action.payload : state.defaultBillingAddress,
        lastUpdated: new Date(),
      };
    }
    
    case 'UPDATE_BILLING_ADDRESS': {
      const updatedAddresses = state.billingAddresses.map(address =>
        address.id === action.payload.id
          ? { ...address, ...action.payload.updates }
          : address
      );
      
      const updatedAddress = updatedAddresses.find(a => a.id === action.payload.id);
      
      return {
        ...state,
        billingAddresses: updatedAddresses,
        defaultBillingAddress: updatedAddress?.isDefault ? updatedAddress : state.defaultBillingAddress,
        lastUpdated: new Date(),
      };
    }
    
    case 'DELETE_BILLING_ADDRESS': {
      const filteredAddresses = state.billingAddresses.filter(address => address.id !== action.payload);
      const wasDefault = state.defaultBillingAddress?.id === action.payload;
      
      return {
        ...state,
        billingAddresses: filteredAddresses,
        defaultBillingAddress: wasDefault ? filteredAddresses[0] : state.defaultBillingAddress,
        lastUpdated: new Date(),
      };
    }
    
    case 'SET_DEFAULT_BILLING_ADDRESS': {
      const updatedAddresses = state.billingAddresses.map(address => ({
        ...address,
        isDefault: address.id === action.payload,
      }));
      
      const newDefault = updatedAddresses.find(a => a.id === action.payload);
      
      return {
        ...state,
        billingAddresses: updatedAddresses,
        defaultBillingAddress: newDefault,
        lastUpdated: new Date(),
      };
    }
    
    case 'SET_CURRENT_SESSION':
      return { ...state, currentSession: action.payload };
    
    case 'SET_SELECTED_PAYMENT_METHOD':
      return { ...state, selectedPaymentMethod: action.payload };
    
    case 'SET_SELECTED_BILLING_ADDRESS':
      return { ...state, selectedBillingAddress: action.payload };
    
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
        lastUpdated: new Date(),
      };
    
    case 'UPDATE_TRANSACTION': {
      const updatedTransactions = state.transactions.map(transaction =>
        transaction.id === action.payload.id
          ? { ...transaction, ...action.payload.updates }
          : transaction
      );
      
      return {
        ...state,
        transactions: updatedTransactions,
        lastUpdated: new Date(),
      };
    }
    
    case 'SET_TRANSACTIONS':
      return {
        ...state,
        transactions: action.payload,
        lastUpdated: new Date(),
      };
    
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload },
        lastUpdated: new Date(),
      };
    
    case 'CLEAR_SESSION':
      return {
        ...state,
        currentSession: undefined,
        selectedPaymentMethod: undefined,
        selectedBillingAddress: undefined,
        error: null,
      };
    
    default:
      return state;
  }
};

// Context
const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

// Provider
export const PaymentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(paymentReducer, initialState);
  
  // Context methods
  const loadPaymentMethods = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch('/api/payment/methods');
      if (response.ok) {
        const data = await response.json();
        const methods = data.methods.map((method: PaymentMethod) => ({
          ...method,
          createdAt: new Date(method.createdAt),
          lastUsed: method.lastUsed ? new Date(method.lastUsed) : undefined,
        }));
        dispatch({ type: 'SET_PAYMENT_METHODS', payload: methods });
      }
    } catch (error) {
      console.error('Failed to load payment methods:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load payment methods' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);
  
  const addPaymentMethod = async (method: Omit<PaymentMethod, 'id' | 'createdAt'>): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch('/api/payment/methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(method),
      });
      
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'ADD_PAYMENT_METHOD', payload: {
          ...data.method,
          createdAt: new Date(data.method.createdAt),
        }});
        toast.success('Payment method added successfully');
      } else {
        throw new Error('Failed to add payment method');
      }
    } catch (error) {
      console.error('Failed to add payment method:', error);
      toast.error('Failed to add payment method');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const updatePaymentMethod = async (id: string, updates: Partial<PaymentMethod>): Promise<void> => {
    try {
      const response = await fetch(`/api/payment/methods/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (response.ok) {
        dispatch({ type: 'UPDATE_PAYMENT_METHOD', payload: { id, updates } });
        toast.success('Payment method updated');
      } else {
        throw new Error('Failed to update payment method');
      }
    } catch (error) {
      console.error('Failed to update payment method:', error);
      toast.error('Failed to update payment method');
    }
  };
  
  const deletePaymentMethod = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/payment/methods/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        dispatch({ type: 'DELETE_PAYMENT_METHOD', payload: id });
        toast.success('Payment method deleted');
      } else {
        throw new Error('Failed to delete payment method');
      }
    } catch (error) {
      console.error('Failed to delete payment method:', error);
      toast.error('Failed to delete payment method');
    }
  };
  
  const setDefaultPaymentMethod = async (id: string): Promise<void> => {
    try {
      await updatePaymentMethod(id, { isDefault: true });
      dispatch({ type: 'SET_DEFAULT_PAYMENT_METHOD', payload: id });
    } catch (error) {
      console.error('Failed to set default payment method:', error);
    }
  };
  
  const loadBillingAddresses = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/api/payment/billing-addresses');
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SET_BILLING_ADDRESSES', payload: data.addresses });
      }
    } catch (error) {
      console.error('Failed to load billing addresses:', error);
    }
  }, []);
  
  const addBillingAddress = async (address: Omit<BillingAddress, 'id'>): Promise<void> => {
    try {
      const response = await fetch('/api/payment/billing-addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address),
      });
      
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'ADD_BILLING_ADDRESS', payload: data.address });
        toast.success('Billing address added');
      } else {
        throw new Error('Failed to add billing address');
      }
    } catch (error) {
      console.error('Failed to add billing address:', error);
      toast.error('Failed to add billing address');
    }
  };
  
  const updateBillingAddress = async (id: string, updates: Partial<BillingAddress>): Promise<void> => {
    try {
      const response = await fetch(`/api/payment/billing-addresses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (response.ok) {
        dispatch({ type: 'UPDATE_BILLING_ADDRESS', payload: { id, updates } });
        toast.success('Billing address updated');
      } else {
        throw new Error('Failed to update billing address');
      }
    } catch (error) {
      console.error('Failed to update billing address:', error);
      toast.error('Failed to update billing address');
    }
  };
  
  const deleteBillingAddress = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/payment/billing-addresses/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        dispatch({ type: 'DELETE_BILLING_ADDRESS', payload: id });
        toast.success('Billing address deleted');
      } else {
        throw new Error('Failed to delete billing address');
      }
    } catch (error) {
      console.error('Failed to delete billing address:', error);
      toast.error('Failed to delete billing address');
    }
  };
  
  const setDefaultBillingAddress = async (id: string): Promise<void> => {
    try {
      await updateBillingAddress(id, { isDefault: true });
      dispatch({ type: 'SET_DEFAULT_BILLING_ADDRESS', payload: id });
    } catch (error) {
      console.error('Failed to set default billing address:', error);
    }
  };
  
  const initializePayment = async (orderId: string, amount: number): Promise<PaymentSession> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, amount }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const session: PaymentSession = {
          ...data.session,
          expiresAt: new Date(data.session.expiresAt),
        };
        dispatch({ type: 'SET_CURRENT_SESSION', payload: session });
        return session;
      } else {
        throw new Error('Failed to initialize payment');
      }
    } catch (error) {
      console.error('Failed to initialize payment:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const processPayment = async (sessionId: string, paymentMethodId: string): Promise<Transaction> => {
    try {
      dispatch({ type: 'SET_PROCESSING', payload: true });
      
      const response = await fetch('/api/payment/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, paymentMethodId }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const transaction: Transaction = {
          ...data.transaction,
          timestamp: new Date(data.transaction.timestamp),
        };
        dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
        
        if (transaction.status === 'completed') {
          toast.success('Payment successful');
        }
        
        return transaction;
      } else {
        throw new Error('Payment processing failed');
      }
    } catch (error) {
      console.error('Payment processing failed:', error);
      toast.error('Payment failed');
      throw error;
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  };
  
  const verifyPayment = async (transactionId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/payment/verify/${transactionId}`);
      if (response.ok) {
        const data = await response.json();
        
        if (data.transaction) {
          dispatch({ 
            type: 'UPDATE_TRANSACTION', 
            payload: { 
              id: transactionId, 
              updates: { status: data.transaction.status }
            }
          });
        }
        
        return data.verified;
      }
      return false;
    } catch (error) {
      console.error('Payment verification failed:', error);
      return false;
    }
  };
  
  const cancelPayment = async (sessionId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/payment/cancel/${sessionId}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        dispatch({ type: 'CLEAR_SESSION' });
        toast.success('Payment cancelled');
      } else {
        throw new Error('Failed to cancel payment');
      }
    } catch (error) {
      console.error('Failed to cancel payment:', error);
      toast.error('Failed to cancel payment');
    }
  };
  
  const initiateRefund = async (transactionId: string, amount?: number): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch('/api/payment/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, amount }),
      });
      
      if (response.ok) {
        dispatch({
          type: 'UPDATE_TRANSACTION',
          payload: { id: transactionId, updates: { status: 'refunded' } },
        });
        toast.success('Refund initiated successfully');
      } else {
        throw new Error('Failed to initiate refund');
      }
    } catch (error) {
      console.error('Failed to initiate refund:', error);
      toast.error('Failed to initiate refund');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const selectPaymentMethod = (method: PaymentMethod): void => {
    dispatch({ type: 'SET_SELECTED_PAYMENT_METHOD', payload: method });
  };
  
  const selectBillingAddress = (address: BillingAddress): void => {
    dispatch({ type: 'SET_SELECTED_BILLING_ADDRESS', payload: address });
  };
  
  const loadTransactions = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/api/payment/transactions');
      if (response.ok) {
        const data = await response.json();
        const transactions = data.transactions.map((t: Transaction) => ({
          ...t,
          timestamp: new Date(t.timestamp),
        }));
        dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  }, []);
  
  const getTransaction = (id: string): Transaction | undefined => {
    return state.transactions.find(transaction => transaction.id === id);
  };
  
  const validateCard = (cardNumber: string, expiryDate: string, cvv: string): boolean => {
    return validateCardUtil(cardNumber, expiryDate, cvv);
  };
  
  const formatCardNumber = (cardNumber: string): string => {
    return cardNumber.replace(/\s/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
  };
  
  const getCardType = (cardNumber: string): string => {
    return getCardTypeUtil(cardNumber);
  };
  
  const calculateEMI = (amount: number, tenure: number, interestRate: number): number => {
    const monthlyRate = interestRate / 12 / 100;
    const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);
    return Math.round(emi * 100) / 100;
  };
  
  const updatePreferences = async (preferences: Partial<PaymentState['preferences']>): Promise<void> => {
    try {
      const response = await fetch('/api/payment/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
      
      if (response.ok) {
        dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
        toast.success('Preferences updated');
      } else {
        throw new Error('Failed to update preferences');
      }
    } catch (error) {
      console.error('Failed to update preferences:', error);
      toast.error('Failed to update preferences');
    }
  };
  
  const enableTwoFactor = async (): Promise<void> => {
    try {
      const response = await fetch('/api/payment/2fa/enable', {
        method: 'POST',
      });
      
      if (response.ok) {
        toast.success('Two-factor authentication enabled');
      } else {
        throw new Error('Failed to enable two-factor authentication');
      }
    } catch (error) {
      console.error('Failed to enable two-factor:', error);
      toast.error('Failed to enable two-factor authentication');
    }
  };
  
  const disableTwoFactor = async (): Promise<void> => {
    try {
      const response = await fetch('/api/payment/2fa/disable', {
        method: 'POST',
      });
      
      if (response.ok) {
        toast.success('Two-factor authentication disabled');
      } else {
        throw new Error('Failed to disable two-factor authentication');
      }
    } catch (error) {
      console.error('Failed to disable two-factor:', error);
      toast.error('Failed to disable two-factor authentication');
    }
  };
  
  const trackPaymentEvent = (event: string, data?: Record<string, unknown>): void => {
    // Analytics tracking
    try {
      if (typeof window !== 'undefined' && 'gtag' in window) {
        const gtag = (window as { gtag: (type: string, action: string, params?: Record<string, unknown>) => void }).gtag;
        gtag('event', event, {
          event_category: 'payment',
          ...data,
        });
      }
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  };
  
  // Load data on mount
  useEffect(() => {
    loadPaymentMethods();
    loadBillingAddresses();
    loadTransactions();
  }, [loadPaymentMethods, loadBillingAddresses, loadTransactions]);
  
  return (
    <PaymentContext.Provider value={{
      state,
      loadPaymentMethods,
      addPaymentMethod,
      updatePaymentMethod,
      deletePaymentMethod,
      setDefaultPaymentMethod,
      loadBillingAddresses,
      addBillingAddress,
      updateBillingAddress,
      deleteBillingAddress,
      setDefaultBillingAddress,
      initializePayment,
      processPayment,
      verifyPayment,
      cancelPayment,
      initiateRefund,
      selectPaymentMethod,
      selectBillingAddress,
      loadTransactions,
      getTransaction,
      validateCard,
      formatCardNumber,
      getCardType,
      calculateEMI,
      updatePreferences,
      enableTwoFactor,
      disableTwoFactor,
      trackPaymentEvent,
    }}>
      {children}
    </PaymentContext.Provider>
  );
};

// Hook
export const usePayment = (): PaymentContextType => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

export default PaymentContext;
export type { PaymentMethod, BillingAddress, Transaction, PaymentSession, PaymentState };