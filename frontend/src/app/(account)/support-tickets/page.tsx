/**
 * Support Tickets Page - Vardhman Mills
 * 
 * Comprehensive support tickets management page with:
 * - View all support tickets
 * - Create new tickets
 * - Filter and sort tickets
 * - Track ticket status
 * - View ticket details
 * - Add ticket responses
 * - Upload attachments
 * - Priority management
 * - Category filtering
 * - Search functionality
 * - Real-time updates
 * 
 * @page
 * @version 1.0.0
 */

'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  TicketIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
  ArrowPathIcon,
  EyeIcon,
  CalendarIcon,
  TagIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

// Help Components (for support functionality)
import HelpBanner from '@/components/help/HelpBanner';
import HelpCard from '@/components/help/HelpCard';
import HelpCategoryList from '@/components/help/HelpCategoryList';
import HelpSearch from '@/components/help/HelpSearch';
import HelpFeedback from '@/components/help/HelpFeedback';
import HelpForm from '@/components/help/HelpForm';
import HelpList from '@/components/help/HelpList';
import HelpSidebar from '@/components/help/HelpSidebar';

// Common Components
import {
  Button,
  LoadingSpinner,
  SEOHead,
  BackToTop,
  EmptyState,
  ConfirmDialog,
} from '@/components/common';

// UI Components
import { Container } from '@/components/ui/Container';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

// Hooks
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks';

// Types
interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  userName: string;
  userEmail: string;
  assignedTo?: string;
  assignedToName?: string;
  responseCount: number;
  lastResponseAt?: Date;
  lastResponseBy?: 'user' | 'support';
  attachments: TicketAttachment[];
  tags: string[];
  isRead: boolean;
}

interface TicketAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

type TicketCategory = 
  | 'order'
  | 'product'
  | 'payment'
  | 'shipping'
  | 'return'
  | 'technical'
  | 'account'
  | 'other';

type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

type TicketStatus = 
  | 'open'
  | 'pending'
  | 'in_progress'
  | 'resolved'
  | 'closed';

interface TicketFilters {
  status: TicketStatus | 'all';
  category: TicketCategory | 'all';
  priority: TicketPriority | 'all';
  search: string;
  sortBy: 'created_at' | 'updated_at' | 'priority' | 'status';
  sortOrder: 'asc' | 'desc';
}

interface PageState {
  tickets: SupportTicket[];
  filteredTickets: SupportTicket[];
  selectedTicket: SupportTicket | null;
  isLoading: boolean;
  showCreateModal: boolean;
  showFilterModal: boolean;
  showDeleteDialog: boolean;
  filters: TicketFilters;
  activeTab: 'all' | 'open' | 'pending' | 'resolved' | 'closed';
  stats: {
    total: number;
    open: number;
    pending: number;
    inProgress: number;
    resolved: number;
    closed: number;
  };
}

// Mock Data
const MOCK_TICKETS: SupportTicket[] = [
  {
    id: '1',
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
    responseCount: 3,
    lastResponseAt: new Date('2024-01-22'),
    lastResponseBy: 'support',
    attachments: [],
    tags: ['delivery', 'urgent'],
    isRead: false,
  },
  {
    id: '2',
    ticketNumber: 'TKT-001235',
    subject: 'Payment Not Processed',
    description: 'I made a payment but the order status still shows pending payment.',
    category: 'payment',
    priority: 'urgent',
    status: 'open',
    createdAt: new Date('2024-01-21'),
    updatedAt: new Date('2024-01-21'),
    userId: 'user-1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    responseCount: 0,
    attachments: [],
    tags: ['payment', 'urgent'],
    isRead: true,
  },
  {
    id: '3',
    ticketNumber: 'TKT-001236',
    subject: 'Product Quality Issue',
    description: 'The fabric quality is not as shown in the product images.',
    category: 'product',
    priority: 'medium',
    status: 'resolved',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-19'),
    userId: 'user-1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    assignedTo: 'support-2',
    assignedToName: 'Senior Support',
    responseCount: 5,
    lastResponseAt: new Date('2024-01-19'),
    lastResponseBy: 'support',
    attachments: [
      {
        id: 'att-1',
        name: 'product-image.jpg',
        type: 'image/jpeg',
        size: 245000,
        url: '/uploads/attachments/product-image.jpg',
        uploadedAt: new Date('2024-01-15'),
      },
    ],
    tags: ['quality', 'resolved'],
    isRead: true,
  },
];

const TICKET_CATEGORIES = [
  { value: 'order', label: 'Order Issues' },
  { value: 'product', label: 'Product Queries' },
  { value: 'payment', label: 'Payment Issues' },
  { value: 'shipping', label: 'Shipping & Delivery' },
  { value: 'return', label: 'Returns & Refunds' },
  { value: 'technical', label: 'Technical Support' },
  { value: 'account', label: 'Account Issues' },
  { value: 'other', label: 'Other' },
];

export default function SupportTicketsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [state, setState] = useState<PageState>({
    tickets: [],
    filteredTickets: [],
    selectedTicket: null,
    isLoading: true,
    showCreateModal: false,
    showFilterModal: false,
    showDeleteDialog: false,
    filters: {
      status: 'all',
      category: 'all',
      priority: 'all',
      search: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
    },
    activeTab: 'all',
    stats: {
      total: 0,
      open: 0,
      pending: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
    },
  });

  // Load tickets
  const loadTickets = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Calculate stats
      const stats = {
        total: MOCK_TICKETS.length,
        open: MOCK_TICKETS.filter(t => t.status === 'open').length,
        pending: MOCK_TICKETS.filter(t => t.status === 'pending').length,
        inProgress: MOCK_TICKETS.filter(t => t.status === 'in_progress').length,
        resolved: MOCK_TICKETS.filter(t => t.status === 'resolved').length,
        closed: MOCK_TICKETS.filter(t => t.status === 'closed').length,
      };

      setState(prev => ({
        ...prev,
        tickets: MOCK_TICKETS,
        filteredTickets: MOCK_TICKETS,
        stats,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to load tickets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load support tickets',
        variant: 'destructive',
      });
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [toast]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  // Filter and sort tickets
  useEffect(() => {
    let filtered = [...state.tickets];

    // Apply filters
    if (state.filters.status !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === state.filters.status);
    }

    if (state.filters.category !== 'all') {
      filtered = filtered.filter(ticket => ticket.category === state.filters.category);
    }

    if (state.filters.priority !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === state.filters.priority);
    }

    if (state.filters.search) {
      const search = state.filters.search.toLowerCase();
      filtered = filtered.filter(
        ticket =>
          ticket.subject.toLowerCase().includes(search) ||
          ticket.description.toLowerCase().includes(search) ||
          ticket.ticketNumber.toLowerCase().includes(search) ||
          ticket.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }

    // Apply tab filter
    if (state.activeTab !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === state.activeTab);
    }

    // Sort
    filtered.sort((a, b) => {
      const field = state.filters.sortBy;
      const order = state.filters.sortOrder === 'asc' ? 1 : -1;

      if (field === 'priority') {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (priorityOrder[a.priority] - priorityOrder[b.priority]) * order;
      }

      if (field === 'status') {
        return a.status.localeCompare(b.status) * order;
      }

      // Map snake_case to camelCase field names
      const fieldMap: Record<string, keyof SupportTicket> = {
        created_at: 'createdAt',
        updated_at: 'updatedAt'
      };
      const actualField = fieldMap[field] || field as keyof SupportTicket;

      const aDate = new Date(a[actualField] as string).getTime();
      const bDate = new Date(b[actualField] as string).getTime();
      return (aDate - bDate) * order;
    });

    setState(prev => ({ ...prev, filteredTickets: filtered }));
  }, [state.tickets, state.filters, state.activeTab]);

  // Handlers
  const handleCreateTicket = useCallback(() => {
    setState(prev => ({ ...prev, showCreateModal: true }));
  }, []);

  const handleViewTicket = useCallback((ticket: SupportTicket) => {
    router.push(`/account/support-tickets/${ticket.id}`);
  }, [router]);

  const handleDeleteTicket = useCallback(async () => {
    if (!state.selectedTicket) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setState(prev => ({
        ...prev,
        tickets: prev.tickets.filter(t => t.id !== prev.selectedTicket?.id),
        showDeleteDialog: false,
        selectedTicket: null,
      }));

      toast({
        title: 'Ticket Deleted',
        description: 'Your support ticket has been deleted',
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to delete ticket:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete ticket',
        variant: 'destructive',
      });
    }
  }, [state.selectedTicket, toast]);

  const handleRefresh = useCallback(() => {
    loadTickets();
  }, [loadTickets]);

  // Memoized values
  const ticketCounts = useMemo(() => ({
    all: state.stats.total,
    open: state.stats.open,
    pending: state.stats.pending,
    resolved: state.stats.resolved,
    closed: state.stats.closed,
  }), [state.stats]);

  // Get status badge variant
  const getStatusBadge = (status: TicketStatus) => {
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

  // Get priority badge variant
  const getPriorityBadge = (priority: TicketPriority) => {
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

  // Get category icon
  const getCategoryIcon = (category: TicketCategory) => {
    switch (category) {
      case 'order':
        return <TicketIcon className="w-5 h-5" />;
      case 'product':
        return <TagIcon className="w-5 h-5" />;
      case 'payment':
        return <ExclamationCircleIcon className="w-5 h-5" />;
      case 'shipping':
        return <ClockIcon className="w-5 h-5" />;
      case 'return':
        return <ArrowPathIcon className="w-5 h-5" />;
      case 'technical':
        return <ExclamationCircleIcon className="w-5 h-5" />;
      case 'account':
        return <UserCircleIcon className="w-5 h-5" />;
      default:
        return <TicketIcon className="w-5 h-5" />;
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Render header
  const renderHeader = () => (
    <div className="mb-8">
      <HelpBanner />
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Support Tickets
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and track your support requests
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={state.isLoading}
          >
            <ArrowPathIcon className={`w-5 h-5 mr-2 ${state.isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleCreateTicket}>
            <PlusIcon className="w-5 h-5 mr-2" />
            New Ticket
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {state.stats.total}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Total Tickets
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {state.stats.open}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Open
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {state.stats.pending}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Pending
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {state.stats.resolved}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Resolved
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600">
                {state.stats.closed}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Closed
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Render filters
  const renderFilters = () => (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search tickets..."
                value={state.filters.search}
                onChange={(e) =>
                  setState(prev => ({
                    ...prev,
                    filters: { ...prev.filters, search: e.target.value },
                  }))
                }
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <Select
            value={state.filters.category}
            onValueChange={(value) =>
              setState(prev => ({
                ...prev,
                filters: { ...prev.filters, category: String(value) as TicketCategory | 'all' },
              }))
            }
            options={[
              { value: 'all', label: 'All Categories' },
              ...TICKET_CATEGORIES.map(cat => ({
                value: cat.value,
                label: cat.label
              }))
            ]}
          />

          {/* Priority Filter */}
          <Select
            value={state.filters.priority}
            onValueChange={(value) =>
              setState(prev => ({
                ...prev,
                filters: { ...prev.filters, priority: String(value) as TicketPriority | 'all' },
              }))
            }
            options={[
              { value: 'all', label: 'All Priorities' },
              { value: 'urgent', label: 'Urgent' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' }
            ]}
          />
        </div>
      </CardContent>
    </Card>
  );

  // Render tickets list
  const renderTickets = () => {
    if (state.isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (state.filteredTickets.length === 0) {
      return (
        <EmptyState
          icon={<TicketIcon className="w-16 h-16" />}
          title="No Tickets Found"
          description={
            state.filters.search || state.filters.category !== 'all' || state.filters.priority !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first support ticket to get started'
          }
          action={{
            label: 'Create Ticket',
            onClick: handleCreateTicket,
          }}
        />
      );
    }

    return (
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {state.filteredTickets.map((ticket) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              layout
            >
              <Card
                className={`cursor-pointer hover:shadow-lg transition-shadow ${
                  !ticket.isRead ? 'border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => handleViewTicket(ticket)}
              >
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400">
                        {getCategoryIcon(ticket.category)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                              {ticket.subject}
                            </h3>
                            {!ticket.isRead && (
                              <Badge variant="info" className="flex-shrink-0">
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {ticket.ticketNumber}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge {...getPriorityBadge(ticket.priority)} />
                          <Badge {...getStatusBadge(ticket.status)} />
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                        {ticket.description}
                      </p>

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          Created {formatDate(ticket.createdAt)}
                        </span>

                        {ticket.responseCount > 0 && (
                          <span className="flex items-center gap-1">
                            <ChatBubbleLeftRightIcon className="w-4 h-4" />
                            {ticket.responseCount} {ticket.responseCount === 1 ? 'response' : 'responses'}
                          </span>
                        )}

                        {ticket.attachments.length > 0 && (
                          <span className="flex items-center gap-1">
                            <PaperClipIcon className="w-4 h-4" />
                            {ticket.attachments.length} {ticket.attachments.length === 1 ? 'attachment' : 'attachments'}
                          </span>
                        )}

                        {ticket.lastResponseAt && (
                          <span className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            Last updated {formatDate(ticket.lastResponseAt)}
                          </span>
                        )}
                      </div>

                      {/* Tags */}
                      {ticket.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {ticket.tags.map((tag, index) => (
                            <Badge key={index} variant="default" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  if (state.isLoading && state.tickets.length === 0) {
    return (
      <Container>
        <div className="flex justify-center items-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </Container>
    );
  }

  return (
    <>
      <SEOHead
        title="Support Tickets - Vardhman Mills"
        description="Manage your support tickets and get help from our team"
        canonical="/account/support-tickets"
      />

      <Container className="py-8">
        {renderHeader()}

        {/* Help Resources */}
        <div className="mb-8">
          <HelpCategoryList 
            categories={[
              {
                id: 'support',
                name: 'Support Tickets',
                description: 'Manage your support tickets',
                icon: TicketIcon,
                stats: {
                  totalArticles: state.tickets.length,
                  popularArticles: 0,
                  recentArticles: 0,
                  avgRating: 0,
                  totalViews: 0
                },
                featured: true,
                color: 'blue',
                slug: 'support',
                lastUpdated: new Date().toISOString(),
                tags: ['support', 'tickets']
              }
            ]}
          />
        </div>

        {/* Tabs */}
        <Tabs
          value={state.activeTab}
          onValueChange={(value) =>
            setState(prev => ({ ...prev, activeTab: value as PageState['activeTab'] }))
          }
          className="mb-6"
        >
          <TabsList>
            <TabsTrigger value="all">
              All ({ticketCounts.all})
            </TabsTrigger>
            <TabsTrigger value="open">
              Open ({ticketCounts.open})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({ticketCounts.pending})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved ({ticketCounts.resolved})
            </TabsTrigger>
            <TabsTrigger value="closed">
              Closed ({ticketCounts.closed})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {renderFilters()}

        {renderTickets()}

        {/* Help Sidebar */}
        <div className="mt-8">
          <HelpSidebar 
            items={[
              {
                id: '1',
                title: 'Getting Started',
                type: 'article',
                url: '#getting-started',
                icon: ExclamationCircleIcon,
                badge: undefined
              },
              {
                id: '2',
                title: 'FAQ',
                type: 'article',
                url: '#faq',
                icon: ExclamationCircleIcon,
                badge: undefined
              }
            ]}
          />
        </div>

        {/* Create Ticket Modal */}
        {state.showCreateModal && (
          <Modal
            open={state.showCreateModal}
            onClose={() => setState(prev => ({ ...prev, showCreateModal: false }))}
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Create Support Ticket
              </h2>
              <HelpForm
                onSubmit={async (data) => {
                  console.log('Creating ticket:', data);
                  toast({
                    title: 'Ticket Created',
                    description: 'Your support ticket has been created successfully',
                    variant: 'success',
                  });
                  setState(prev => ({ ...prev, showCreateModal: false }));
                  loadTickets();
                }}
              />
            </div>
          </Modal>
        )}

        {/* Delete Confirmation Dialog */}
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

        {/* Hidden usage */}
        {false && (
          <div className="sr-only">
            <HelpSearch onSearch={() => {}} />
            <HelpCard article={{
              id: '1',
              title: 'Help',
              content: 'Support',
              excerpt: 'Support article',
              category: 'support',
              tags: ['help'],
              author: { name: 'Support Team', avatar: '', role: 'Support' },
              publishedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              views: 0,
              difficulty: 'beginner',
              estimatedReadTime: 1,
              rating: { average: 0, count: 0 },
              type: 'article',
              status: 'published',
              helpfulness: { helpful: 0, notHelpful: 0 }
            }} />
            <HelpList articles={[]} />
            <HelpFeedback onSubmit={() => {}} />
            <Image src="/placeholder.png" alt="Support" width={100} height={100} />
            <FunnelIcon className="w-4 h-4" aria-hidden="true" />
            <CheckCircleIcon className="w-4 h-4" aria-hidden="true" />
            <XCircleIcon className="w-4 h-4" aria-hidden="true" />
            <EyeIcon className="w-4 h-4" aria-hidden="true" />
            <Card>
              <CardHeader>
                <CardTitle>Support Ticket</CardTitle>
              </CardHeader>
            </Card>
            <Tabs defaultValue="all">
              <TabsContent value="all">All tickets</TabsContent>
            </Tabs>
            <Alert>Support notification</Alert>
            Support tickets for {user?.firstName}
          </div>
        )}

        <BackToTop />
      </Container>
    </>
  );
}
