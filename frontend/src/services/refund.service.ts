/**
 * Refund Service
 * 
 * API service for managing refund requests and tracking
 * 
 * Features:
 * - Create refund requests (full/partial/exchange)
 * - Track refund status
 * - Cancel refund requests
 * - View refund history
 * - Get refund details
 */

import { apiClient } from '@/lib/api-client';

const BASE_URL = '/api/refunds';

// ============================================
// TYPES
// ============================================

export type RefundReason =
  | 'defective'
  | 'wrong_item'
  | 'not_as_described'
  | 'damaged'
  | 'late_delivery'
  | 'changed_mind'
  | 'better_price'
  | 'duplicate_order'
  | 'other';

export type RefundType = 'full' | 'partial' | 'exchange';

export type RefundStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type ReturnStatus =
  | 'initiated'
  | 'pickup_scheduled'
  | 'in_transit'
  | 'received'
  | 'inspected';

export type PaymentMethod = 'original' | 'bank_transfer' | 'store_credit';

export interface RefundItem {
  product: string;
  productName?: string;
  quantity: number;
  price?: number;
  reason: string;
}

export interface BankDetails {
  accountNumber: string;
  accountHolderName: string;
  ifscCode: string;
  bankName?: string;
  branchName?: string;
}

export interface RefundRequest {
  _id: string;
  user: string;
  order: string;
  orderNumber?: string;
  type: RefundType;
  reason: RefundReason;
  detailedReason?: string;
  items?: RefundItem[];
  amount: number;
  paymentMethod: PaymentMethod;
  bankDetails?: BankDetails;
  requiresReturn: boolean;
  returnStatus?: ReturnStatus;
  returnTrackingNumber?: string;
  returnCarrier?: string;
  returnNotes?: string;
  status: RefundStatus;
  rejectionReason?: string;
  adminNote?: string;
  processedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRefundData {
  orderId: string;
  type?: RefundType;
  reason: RefundReason;
  detailedReason?: string;
  items?: RefundItem[];
  paymentMethod?: PaymentMethod;
  bankDetails?: BankDetails;
  requiresReturn?: boolean;
}

export interface RefundListResponse {
  refunds: RefundRequest[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface RefundStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  processing: number;
  completed: number;
  totalAmount: number;
  averageAmount: number;
}

// ============================================
// USER REFUND OPERATIONS
// ============================================

/**
 * Create a refund request
 */
export async function createRefundRequest(
  data: CreateRefundData
): Promise<RefundRequest> {
  try {
    const response = await apiClient.post<{ refund: RefundRequest }>(
      BASE_URL,
      data
    );
    return response.data!.refund;
  } catch (error) {
    console.error('Failed to create refund request:', error);
    throw error;
  }
}

/**
 * Get all refund requests for the current user
 */
export async function getUserRefunds(params?: {
  page?: number;
  limit?: number;
  status?: RefundStatus;
}): Promise<RefundListResponse> {
  try {
    const response = await apiClient.get<RefundListResponse>(`${BASE_URL}/user`, {
      params,
    });
    return response.data!;
  } catch (error) {
    console.error('Failed to get user refunds:', error);
    throw error;
  }
}

/**
 * Get a specific refund request by ID
 */
export async function getRefundById(id: string): Promise<RefundRequest> {
  try {
    const response = await apiClient.get<{ refund: RefundRequest }>(
      `${BASE_URL}/${id}`
    );
    return response.data!.refund;
  } catch (error) {
    console.error('Failed to get refund:', error);
    throw error;
  }
}

/**
 * Get refunds for a specific order
 */
export async function getOrderRefunds(orderId: string): Promise<RefundRequest[]> {
  try {
    const response = await apiClient.get<{ refunds: RefundRequest[] }>(
      `${BASE_URL}/order/${orderId}`
    );
    return response.data!.refunds;
  } catch (error) {
    console.error('Failed to get order refunds:', error);
    throw error;
  }
}

/**
 * Cancel a refund request
 */
export async function cancelRefund(id: string): Promise<RefundRequest> {
  try {
    const response = await apiClient.delete<{ refund: RefundRequest }>(
      `${BASE_URL}/${id}`
    );
    return response.data!.refund;
  } catch (error) {
    console.error('Failed to cancel refund:', error);
    throw error;
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get human-readable refund status
 */
export function getRefundStatusLabel(status: RefundStatus): string {
  const labels: Record<RefundStatus, string> = {
    pending: 'Pending Review',
    approved: 'Approved',
    rejected: 'Rejected',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled',
  };
  return labels[status] || status;
}

/**
 * Get human-readable refund reason
 */
export function getRefundReasonLabel(reason: RefundReason): string {
  const labels: Record<RefundReason, string> = {
    defective: 'Defective Product',
    wrong_item: 'Wrong Item Received',
    not_as_described: 'Not As Described',
    damaged: 'Damaged Product',
    late_delivery: 'Late Delivery',
    changed_mind: 'Changed Mind',
    better_price: 'Better Price Elsewhere',
    duplicate_order: 'Duplicate Order',
    other: 'Other',
  };
  return labels[reason] || reason;
}

/**
 * Get human-readable return status
 */
export function getReturnStatusLabel(status: ReturnStatus): string {
  const labels: Record<ReturnStatus, string> = {
    initiated: 'Return Initiated',
    pickup_scheduled: 'Pickup Scheduled',
    in_transit: 'In Transit',
    received: 'Received by Seller',
    inspected: 'Inspected',
  };
  return labels[status] || status;
}

/**
 * Get status color for UI
 */
export function getRefundStatusColor(status: RefundStatus): {
  bg: string;
  text: string;
  border: string;
} {
  const colors: Record<
    RefundStatus,
    { bg: string; text: string; border: string }
  > = {
    pending: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-800 dark:text-yellow-300',
      border: 'border-yellow-300 dark:border-yellow-700',
    },
    approved: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-800 dark:text-green-300',
      border: 'border-green-300 dark:border-green-700',
    },
    rejected: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-800 dark:text-red-300',
      border: 'border-red-300 dark:border-red-700',
    },
    processing: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-800 dark:text-blue-300',
      border: 'border-blue-300 dark:border-blue-700',
    },
    completed: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      text: 'text-emerald-800 dark:text-emerald-300',
      border: 'border-emerald-300 dark:border-emerald-700',
    },
    failed: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-800 dark:text-red-300',
      border: 'border-red-300 dark:border-red-700',
    },
    cancelled: {
      bg: 'bg-gray-100 dark:bg-gray-900/30',
      text: 'text-gray-800 dark:text-gray-300',
      border: 'border-gray-300 dark:border-gray-700',
    },
  };
  return (
    colors[status] || {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-300',
    }
  );
}

/**
 * Check if refund can be cancelled
 */
export function canCancelRefund(status: RefundStatus): boolean {
  return status === 'pending' || status === 'approved';
}

/**
 * Check if return is required for refund
 */
export function requiresReturn(type: RefundType): boolean {
  return type === 'full' || type === 'partial';
}
