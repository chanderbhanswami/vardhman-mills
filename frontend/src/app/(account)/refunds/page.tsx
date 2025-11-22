/**
 * Refunds Management Page - Vardhman Mills
 * 
 * Main page for managing refund requests:
 * - View all refund requests
 * - Filter by status
 * - Track refund progress
 * - Create new refund requests
 * - View refund details
 */

'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

// Services
import * as refundService from '@/services/refund.service';
import type { RefundRequest, RefundStatus } from '@/services/refund.service';

// Components
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/common';
import { SEOHead } from '@/components/common';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { RefundRequestForm } from '@/components/refund/RefundRequestForm';

// Utils
import { formatCurrency } from '@/lib/utils';

const STATUS_FILTERS = [
  { value: 'all', label: 'All Refunds', icon: ArrowPathIcon },
  { value: 'pending', label: 'Pending', icon: ClockIcon },
  { value: 'approved', label: 'Approved', icon: CheckCircleIcon },
  { value: 'processing', label: 'Processing', icon: TruckIcon },
  { value: 'completed', label: 'Completed', icon: CheckCircleIcon },
  { value: 'rejected', label: 'Rejected', icon: ExclamationCircleIcon },
  { value: 'cancelled', label: 'Cancelled', icon: XMarkIcon },
] as const;

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [filteredRefunds, setFilteredRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Load refunds
  useEffect(() => {
    loadRefunds();
  }, []);

  const loadRefunds = async () => {
    try {
      setLoading(true);
      const response = await refundService.getUserRefunds();
      setRefunds(response.refunds);
      setFilteredRefunds(response.refunds);
    } catch (error) {
      console.error('Failed to load refunds:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter refunds
  useEffect(() => {
    let filtered = [...refunds];

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((r) => r.status === selectedStatus);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.orderNumber?.toLowerCase().includes(query) ||
          r.reason.toLowerCase().includes(query) ||
          r.detailedReason?.toLowerCase().includes(query)
      );
    }

    setFilteredRefunds(filtered);
  }, [refunds, selectedStatus, searchQuery]);

  const handleViewDetails = (refund: RefundRequest) => {
    setSelectedRefund(refund);
    setShowDetailsModal(true);
  };

  const handleCancelRefund = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this refund request?')) return;

    try {
      await refundService.cancelRefund(id);
      await loadRefunds();
    } catch (error) {
      console.error('Failed to cancel refund:', error);
    }
  };

  const getStatusIcon = (status: RefundStatus) => {
    const iconMap = {
      pending: ClockIcon,
      approved: CheckCircleIcon,
      rejected: ExclamationCircleIcon,
      processing: TruckIcon,
      completed: CheckCircleIcon,
      failed: ExclamationCircleIcon,
      cancelled: XMarkIcon,
    };
    const Icon = iconMap[status] || ClockIcon;
    return <Icon className="w-5 h-5" />;
  };

  // Calculate stats
  const stats = {
    total: refunds.length,
    pending: refunds.filter((r) => r.status === 'pending').length,
    approved: refunds.filter((r) => r.status === 'approved').length,
    processing: refunds.filter((r) => r.status === 'processing').length,
    completed: refunds.filter((r) => r.status === 'completed').length,
  };

  return (
    <>
      <SEOHead
        title="My Refunds"
        description="View and manage your refund requests"
      />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Refunds
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Track and manage your refund requests
            </p>
          </div>

          <Button onClick={() => setShowCreateModal(true)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            New Refund Request
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Processing</div>
              <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
              <div className="text-2xl font-bold text-emerald-600">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by order number or reason..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full md:w-48 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                >
                  {STATUS_FILTERS.map((filter) => (
                    <option key={filter.value} value={filter.value}>
                      {filter.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Refunds List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredRefunds.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ArrowPathIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No refund requests</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchQuery || selectedStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : "You haven't submitted any refund requests yet"}
              </p>
              {!searchQuery && selectedStatus === 'all' && (
                <Button onClick={() => setShowCreateModal(true)}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create Refund Request
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRefunds.map((refund, index) => {
              const statusColor = refundService.getRefundStatusColor(refund.status);
              
              return (
                <motion.div
                  key={refund._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-full ${statusColor.bg}`}>
                              {getStatusIcon(refund.status)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">
                                Order #{refund.orderNumber || refund.order}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {refundService.getRefundReasonLabel(refund.reason)}
                              </p>
                            </div>
                          </div>

                          <div className="ml-14 space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Badge className={`${statusColor.bg} ${statusColor.text} border ${statusColor.border}`}>
                                {refundService.getRefundStatusLabel(refund.status)}
                              </Badge>
                              <span className="text-gray-600 dark:text-gray-400">•</span>
                              <span className="text-gray-600 dark:text-gray-400">
                                {refund.type === 'full' ? 'Full Refund' : refund.type === 'partial' ? 'Partial Refund' : 'Exchange'}
                              </span>
                              <span className="text-gray-600 dark:text-gray-400">•</span>
                              <span className="font-semibold">
                                {formatCurrency(refund.amount)}
                              </span>
                            </div>

                            {refund.requiresReturn && refund.returnStatus && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <TruckIcon className="w-4 h-4" />
                                <span>Return: {refundService.getReturnStatusLabel(refund.returnStatus)}</span>
                                {refund.returnTrackingNumber && (
                                  <>
                                    <span>•</span>
                                    <span>Tracking: {refund.returnTrackingNumber}</span>
                                  </>
                                )}
                              </div>
                            )}

                            <div className="text-xs text-gray-500">
                              Requested on {new Date(refund.createdAt).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-14 md:ml-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(refund)}
                          >
                            View Details
                          </Button>
                          
                          {refundService.canCancelRefund(refund.status) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancelRefund(refund._id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedRefund && (
          <Dialog open={showDetailsModal} onClose={() => setShowDetailsModal(false)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Refund Request Details</DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Status Banner */}
                <div className={`p-4 rounded-lg ${refundService.getRefundStatusColor(selectedRefund.status).bg}`}>
                  <div className="flex items-center gap-3">
                    {getStatusIcon(selectedRefund.status)}
                    <div>
                      <div className="font-semibold">
                        {refundService.getRefundStatusLabel(selectedRefund.status)}
                      </div>
                      <div className="text-sm opacity-90">
                        Current status of your refund request
                      </div>
                    </div>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Order Number</div>
                    <div className="font-semibold">#{selectedRefund.orderNumber || selectedRefund.order}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Refund Amount</div>
                    <div className="font-semibold">{formatCurrency(selectedRefund.amount)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Refund Type</div>
                    <div className="font-semibold capitalize">{selectedRefund.type}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Payment Method</div>
                    <div className="font-semibold capitalize">{selectedRefund.paymentMethod.replace('_', ' ')}</div>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Reason</div>
                  <div className="font-semibold mb-2">
                    {refundService.getRefundReasonLabel(selectedRefund.reason)}
                  </div>
                  {selectedRefund.detailedReason && (
                    <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      {selectedRefund.detailedReason}
                    </div>
                  )}
                </div>

                {/* Return Info */}
                {selectedRefund.requiresReturn && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Return Information</h4>
                    <div className="space-y-2">
                      {selectedRefund.returnStatus && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Return Status</span>
                          <Badge variant="secondary">
                            {refundService.getReturnStatusLabel(selectedRefund.returnStatus)}
                          </Badge>
                        </div>
                      )}
                      {selectedRefund.returnTrackingNumber && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Tracking Number</span>
                          <span className="font-mono text-sm">{selectedRefund.returnTrackingNumber}</span>
                        </div>
                      )}
                      {selectedRefund.returnCarrier && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Carrier</span>
                          <span className="text-sm">{selectedRefund.returnCarrier}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Bank Details */}
                {selectedRefund.paymentMethod === 'bank_transfer' && selectedRefund.bankDetails && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Bank Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Account Holder</span>
                        <span>{selectedRefund.bankDetails.accountHolderName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Account Number</span>
                        <span className="font-mono">{selectedRefund.bankDetails.accountNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">IFSC Code</span>
                        <span className="font-mono">{selectedRefund.bankDetails.ifscCode}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rejection Reason */}
                {selectedRefund.status === 'rejected' && selectedRefund.rejectionReason && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2 text-red-600">Rejection Reason</h4>
                    <div className="text-sm text-gray-700 dark:text-gray-300 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                      {selectedRefund.rejectionReason}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Timeline</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Requested</span>
                      <span>{new Date(selectedRefund.createdAt).toLocaleString('en-IN')}</span>
                    </div>
                    {selectedRefund.processedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Processed</span>
                        <span>{new Date(selectedRefund.processedAt).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {selectedRefund.completedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Completed</span>
                        <span>{new Date(selectedRefund.completedAt).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                {refundService.canCancelRefund(selectedRefund.status) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleCancelRefund(selectedRefund._id);
                      setShowDetailsModal(false);
                    }}
                    className="text-red-600"
                  >
                    Cancel Refund
                  </Button>
                )}
                <Button onClick={() => setShowDetailsModal(false)}>
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Create Refund Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <Dialog open={showCreateModal} onClose={() => setShowCreateModal(false)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Refund Request</DialogTitle>
              </DialogHeader>
              <RefundRequestForm
                onSuccess={() => {
                  setShowCreateModal(false);
                  loadRefunds(); // Reload refunds after successful creation
                }}
                onCancel={() => setShowCreateModal(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}
