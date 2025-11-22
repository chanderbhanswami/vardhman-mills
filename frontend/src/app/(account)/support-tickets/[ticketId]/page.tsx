/**
 * Support Ticket Detail Page - Vardhman Mills
 * 
 * Individual ticket view with:
 * - Ticket details and status
 * - Conversation thread
 * - Add responses
 * - Upload attachments
 * - Update ticket status
 * - Close/reopen tickets
 * 
 * @page
 * @version 1.0.0
 */

'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  PaperClipIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserCircleIcon,
  CalendarIcon,
  TagIcon,
  EllipsisVerticalIcon,
  ArrowPathIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

// Help Components
import HelpCard from '@/components/help/HelpCard';
import HelpFeedback from '@/components/help/HelpFeedback';
import HelpSidebar from '@/components/help/HelpSidebar';
import type { FeedbackFormData } from '@/components/help/HelpFeedback';
import type { SidebarItem } from '@/components/help/HelpSidebar';

// Common Components
import {
  Button,
  LoadingSpinner,
  SEOHead,
  BackToTop,
  ConfirmDialog,
} from '@/components/common';

// UI Components
import { Container } from '@/components/ui/Container';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';

// Hooks
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks';

// Types
interface TicketResponse {
  id: string;
  ticketId: string;
  content: string;
  createdAt: Date;
  userId: string;
  userName: string;
  userRole: 'user' | 'support' | 'admin';
  attachments: TicketAttachment[];
  isInternal: boolean;
}

interface TicketAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

interface TicketDetail {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'pending' | 'in_progress' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  userName: string;
  userEmail: string;
  assignedTo?: string;
  assignedToName?: string;
  responses: TicketResponse[];
  attachments: TicketAttachment[];
  tags: string[];
}

interface PageState {
  ticket: TicketDetail | null;
  isLoading: boolean;
  isSending: boolean;
  newResponse: string;
  attachments: File[];
  showDeleteDialog: boolean;
  showCloseDialog: boolean;
}

export default function TicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const responseEndRef = useRef<HTMLDivElement>(null);

  const ticketId = params?.ticketId as string || '1';

  const [state, setState] = useState<PageState>({
    ticket: null,
    isLoading: true,
    isSending: false,
    newResponse: '',
    attachments: [],
    showDeleteDialog: false,
    showCloseDialog: false,
  });

  // Load ticket
  const loadTicket = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data
      const mockTicket: TicketDetail = {
        id: ticketId,
        ticketNumber: 'TKT-001234',
        subject: 'Order Delivery Issue',
        description: 'My order has not been delivered yet. The tracking shows it was out for delivery 3 days ago.',
        category: 'shipping',
        priority: 'high',
        status: 'in_progress',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-22'),
        userId: 'user-1',
        userName: 'John Doe',
        userEmail: 'john@example.com',
        assignedTo: 'support-1',
        assignedToName: 'Support Agent',
        responses: [
          {
            id: '1',
            ticketId: ticketId,
            content: 'Thank you for contacting us. We are looking into your delivery issue.',
            createdAt: new Date('2024-01-20T10:30:00'),
            userId: 'support-1',
            userName: 'Support Agent',
            userRole: 'support',
            attachments: [],
            isInternal: false,
          },
          {
            id: '2',
            ticketId: ticketId,
            content: 'I have checked with the courier service. They will re-attempt delivery today.',
            createdAt: new Date('2024-01-21T14:15:00'),
            userId: 'support-1',
            userName: 'Support Agent',
            userRole: 'support',
            attachments: [],
            isInternal: false,
          },
          {
            id: '3',
            ticketId: ticketId,
            content: 'Still haven\'t received the delivery. Can you please check again?',
            createdAt: new Date('2024-01-22T09:00:00'),
            userId: 'user-1',
            userName: 'John Doe',
            userRole: 'user',
            attachments: [],
            isInternal: false,
          },
        ],
        attachments: [],
        tags: ['delivery', 'urgent'],
      };

      setState(prev => ({
        ...prev,
        ticket: mockTicket,
        isLoading: false,
      }));

      // Scroll to bottom of responses
      setTimeout(() => {
        responseEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Failed to load ticket:', error);
      toast({
        title: 'Error',
        description: 'Failed to load ticket details',
        variant: 'destructive',
      });
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [ticketId, toast]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  // Handlers
  const handleSendResponse = useCallback(async () => {
    if (!state.newResponse.trim()) return;

    setState(prev => ({ ...prev, isSending: true }));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newResponseObj: TicketResponse = {
        id: Date.now().toString(),
        ticketId: state.ticket!.id,
        content: state.newResponse,
        createdAt: new Date(),
        userId: user?.id || '',
        userName: user?.firstName + ' ' + user?.lastName || 'You',
        userRole: 'user',
        attachments: [],
        isInternal: false,
      };

      setState(prev => ({
        ...prev,
        ticket: prev.ticket
          ? {
              ...prev.ticket,
              responses: [...prev.ticket.responses, newResponseObj],
            }
          : null,
        newResponse: '',
        attachments: [],
        isSending: false,
      }));

      toast({
        title: 'Response Sent',
        description: 'Your response has been sent successfully',
        variant: 'success',
      });

      // Scroll to bottom
      setTimeout(() => {
        responseEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Failed to send response:', error);
      toast({
        title: 'Error',
        description: 'Failed to send response',
        variant: 'destructive',
      });
      setState(prev => ({ ...prev, isSending: false }));
    }
  }, [state.newResponse, state.ticket, user, toast]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setState(prev => ({ ...prev, attachments: [...prev.attachments, ...files] }));
  }, []);

  const handleRemoveAttachment = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  }, []);

  const handleCloseTicket = useCallback(async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setState(prev => ({
        ...prev,
        ticket: prev.ticket ? { ...prev.ticket, status: 'closed' } : null,
        showCloseDialog: false,
      }));

      toast({
        title: 'Ticket Closed',
        description: 'Your ticket has been closed successfully',
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to close ticket:', error);
      toast({
        title: 'Error',
        description: 'Failed to close ticket',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const handleDeleteTicket = useCallback(async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: 'Ticket Deleted',
        description: 'Your ticket has been deleted successfully',
        variant: 'success',
      });

      router.push('/account/support-tickets');
    } catch (error) {
      console.error('Failed to delete ticket:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete ticket',
        variant: 'destructive',
      });
    }
  }, [router, toast]);

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return { variant: 'info' as const, label: 'Open' };
      case 'pending':
        return { variant: 'warning' as const, label: 'Pending' };
      case 'in_progress':
        return { variant: 'default' as const, label: 'In Progress' };
      case 'resolved':
        return { variant: 'success' as const, label: 'Resolved' };
      case 'closed':
        return { variant: 'default' as const, label: 'Closed' };
      default:
        return { variant: 'default' as const, label: status };
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { variant: 'destructive' as const, label: 'Urgent' };
      case 'high':
        return { variant: 'warning' as const, label: 'High' };
      case 'medium':
        return { variant: 'default' as const, label: 'Medium' };
      case 'low':
        return { variant: 'info' as const, label: 'Low' };
      default:
        return { variant: 'default' as const, label: priority };
    }
  };

  // Format date
  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (state.isLoading) {
    return (
      <Container>
        <div className="flex justify-center items-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </Container>
    );
  }

  if (!state.ticket) {
    return (
      <Container>
        <Alert variant="destructive">
          <XCircleIcon className="w-5 h-5" />
          <div>
            <h4 className="font-semibold mb-1">Ticket Not Found</h4>
            <p className="text-sm">The requested ticket could not be found.</p>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <SEOHead
        title={`${state.ticket.subject} - Support Ticket - Vardhman Mills`}
        description={state.ticket.description}
        canonical={`/account/support-tickets/${state.ticket.id}`}
      />

      <Container className="py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Tickets
          </Button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {state.ticket.subject}
                </h1>
                <Badge {...getStatusBadge(state.ticket.status)} />
                <Badge {...getPriorityBadge(state.ticket.priority)} />
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Ticket #{state.ticket.ticketNumber} • Created {formatDateTime(state.ticket.createdAt)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {state.ticket.status !== 'closed' && (
              <Button
                variant="outline"
                onClick={() => setState(prev => ({ ...prev, showCloseDialog: true }))}
              >
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Close Ticket
              </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setState(prev => ({ ...prev, showDeleteDialog: true }))}
                aria-label="Delete ticket"
                title="Delete ticket"
              >
                <TrashIcon className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                onClick={loadTicket}
                aria-label="Refresh ticket"
                title="Refresh ticket"
              >
                <ArrowPathIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Details */}
            <Card>
              <CardHeader>
                <CardTitle>Ticket Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {state.ticket.description}
                </p>

                {state.ticket.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {state.ticket.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      >
                        <TagIcon className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Responses */}
            <Card>
              <CardHeader>
                <CardTitle>Conversation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <AnimatePresence>
                    {state.ticket.responses.map((response) => (
                      <motion.div
                        key={response.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`flex gap-4 ${
                          response.userRole === 'user' ? 'flex-row-reverse' : ''
                        }`}
                      >
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <UserCircleIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                          </div>
                        </div>

                        {/* Message */}
                        <div className={`flex-1 ${response.userRole === 'user' ? 'text-right' : ''}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {response.userName}
                            </span>
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <ClockIcon className="w-3 h-3" />
                              {formatDateTime(response.createdAt)}
                            </span>
                          </div>
                          <div
                            className={`inline-block px-4 py-2 rounded-lg ${
                              response.userRole === 'user'
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{response.content}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={responseEndRef} />
                </div>

                {/* Reply Form */}
                {state.ticket.status !== 'closed' && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="space-y-4">
                      <textarea
                        value={state.newResponse}
                        onChange={(e) =>
                          setState(prev => ({ ...prev, newResponse: e.target.value }))
                        }
                        placeholder="Type your response..."
                        rows={4}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500"
                      />

                      {/* Attachments */}
                      {state.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {state.attachments.map((file, index) => (
                            <Badge key={index} variant="default" className="pr-1">
                              {file.name}
                              <button
                                onClick={() => handleRemoveAttachment(index)}
                                className="ml-2 hover:text-red-500"
                                title="Remove attachment"
                                aria-label={`Remove ${file.name}`}
                              >
                                <XCircleIcon className="w-4 h-4" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                          aria-label="Upload attachments"
                        />
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <PaperClipIcon className="w-5 h-5 mr-2" />
                          Attach Files
                        </Button>

                        <Button
                          onClick={handleSendResponse}
                          disabled={!state.newResponse.trim() || state.isSending}
                        >
                          {state.isSending ? (
                            <LoadingSpinner size="sm" className="mr-2" />
                          ) : (
                            <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                          )}
                          Send Response
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Feedback */}
            {state.ticket.status === 'resolved' && (
              <Card>
                <CardHeader>
                  <CardTitle>How was your experience?</CardTitle>
                </CardHeader>
                <CardContent>
                  <HelpFeedback
                    onSubmit={async (feedback: FeedbackFormData) => {
                      console.log('Feedback submitted:', feedback);
                      toast({
                        title: 'Thank You!',
                        description: 'Your feedback has been submitted',
                        variant: 'success',
                      });
                    }}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Info */}
            <Card>
              <CardHeader>
                <CardTitle>Ticket Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Category
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white capitalize">
                    {state.ticket.category.replace('_', ' ')}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Priority
                  </div>
                  <Badge {...getPriorityBadge(state.ticket.priority)} />
                </div>

                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Status
                  </div>
                  <Badge {...getStatusBadge(state.ticket.status)} />
                </div>

                {state.ticket.assignedToName && (
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Assigned To
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {state.ticket.assignedToName}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    Last Updated
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatDateTime(state.ticket.updatedAt)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Help */}
            <HelpCard
              article={{
                id: 'help-1',
                title: 'Need More Help?',
                excerpt: 'Check out our help center for more information',
                content: '',
                category: 'support',
                tags: ['help'],
                author: { name: 'Support Team' },
                publishedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                views: 0,
                rating: { average: 5, count: 0 },
                estimatedReadTime: 2,
                difficulty: 'beginner' as const,
                type: 'article' as const,
                status: 'published' as const,
                helpfulness: { helpful: 0, notHelpful: 0 },
              }}
              variant="compact"
              showActions={false}
            />

            {/* Sidebar with Image demo */}
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <EllipsisVerticalIcon className="w-4 h-4" />
                  Quick Actions
                </div>
                {state.ticket.attachments.length > 0 && (
                  <div className="mt-2">
                    <Image
                      src="/images/support-help.jpg"
                      alt="Help illustration"
                      width={200}
                      height={100}
                      className="rounded-lg"
                      style={{ display: 'none' }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sidebar Help */}
            <HelpSidebar
              items={[
                {
                  id: 'faq',
                  title: 'FAQs',
                  type: 'category' as const,
                  url: '/help/faq',
                },
                {
                  id: 'guides',
                  title: 'User Guides',
                  type: 'category' as const,
                  url: '/help/guides',
                },
                {
                  id: 'contact',
                  title: 'Contact Support',
                  type: 'link' as const,
                  url: '/contact',
                },
              ] as SidebarItem[]}
              showSearch={false}
              collapsible={false}
            />
          </div>
        </div>

        {/* Close Dialog */}
        <ConfirmDialog
          open={state.showCloseDialog}
          onOpenChange={(open) =>
            setState(prev => ({ ...prev, showCloseDialog: open }))
          }
          title="Close Ticket"
          description="Are you sure you want to close this ticket? You can reopen it later if needed."
          confirmLabel="Close Ticket"
          cancelLabel="Cancel"
          variant="default"
          onConfirm={handleCloseTicket}
        />

        {/* Delete Dialog */}
        <ConfirmDialog
          open={state.showDeleteDialog}
          onOpenChange={(open) =>
            setState(prev => ({ ...prev, showDeleteDialog: open }))
          }
          title="Delete Ticket"
          description="Are you sure you want to delete this ticket? This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="destructive"
          onConfirm={handleDeleteTicket}
        />

        <BackToTop />
      </Container>
    </>
  );
}
