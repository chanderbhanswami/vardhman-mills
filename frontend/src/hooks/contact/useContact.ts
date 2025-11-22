import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

export interface ContactForm {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  source: 'website' | 'mobile' | 'phone' | 'email' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  category: 'general' | 'sales' | 'support' | 'partnership' | 'complaint';
  assignedTo?: string;
  tags: string[];
  attachments?: ContactAttachment[];
  responses?: ContactResponse[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface ContactAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface ContactResponse {
  id: string;
  contactFormId: string;
  responderId: string;
  responderName: string;
  message: string;
  type: 'internal_note' | 'customer_reply' | 'system_message';
  createdAt: string;
}

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  category?: ContactForm['category'];
  source?: ContactForm['source'];
  attachments?: File[];
}

export interface ContactFilters {
  status?: ContactForm['status'];
  category?: ContactForm['category'];
  priority?: ContactForm['priority'];
  assignedTo?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
}

export interface ContactStats {
  total: number;
  new: number;
  inProgress: number;
  resolved: number;
  closed: number;
  averageResponseTime: number;
  averageResolutionTime: number;
  totalByCategory: Record<string, number>;
  totalByPriority: Record<string, number>;
  recentContacts: ContactForm[];
  topCategories: Array<{ category: string; count: number }>;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: keyof ContactForm;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const CONTACT_QUERY_KEYS = {
  all: ['contacts'],
  lists: () => [...CONTACT_QUERY_KEYS.all, 'list'],
  list: (filters: ContactFilters, pagination: PaginationParams) => [...CONTACT_QUERY_KEYS.lists(), filters, pagination],
  details: () => [...CONTACT_QUERY_KEYS.all, 'detail'],
  detail: (id: string) => [...CONTACT_QUERY_KEYS.details(), id],
  stats: () => [...CONTACT_QUERY_KEYS.all, 'stats'],
  search: (query: string) => [...CONTACT_QUERY_KEYS.all, 'search', query],
} as const;

export const useContact = (initialFilters: ContactFilters = {}) => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ContactFilters>(initialFilters);
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Generate mock contact data
  const generateMockContacts = (): ContactForm[] => {
    const mockContacts: ContactForm[] = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        company: 'ABC Textiles',
        subject: 'Bulk Order Inquiry',
        message: 'I would like to inquire about bulk orders for cotton fabrics. We need approximately 10,000 meters for our upcoming collection.',
        source: 'website',
        priority: 'high',
        status: 'new',
        category: 'sales',
        tags: ['bulk-order', 'cotton', 'urgent'],
        assignedTo: 'sales-rep-1',
        createdAt: '2024-01-15T14:30:00Z',
        updatedAt: '2024-01-15T14:30:00Z',
      },
      {
        id: '2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@fashion.com',
        phone: '+1987654321',
        company: 'Fashion Forward Ltd',
        subject: 'Partnership Opportunity',
        message: 'We are interested in establishing a partnership for sustainable textile production.',
        source: 'email',
        priority: 'medium',
        status: 'in_progress',
        category: 'partnership',
        tags: ['partnership', 'sustainability'],
        assignedTo: 'business-dev-1',
        responses: [
          {
            id: 'resp-1',
            contactFormId: '2',
            responderId: 'emp-1',
            responderName: 'Alice Smith',
            message: 'Thank you for your interest. Our business development team will reach out within 24 hours.',
            type: 'customer_reply',
            createdAt: '2024-01-14T16:45:00Z',
          },
        ],
        createdAt: '2024-01-14T10:15:00Z',
        updatedAt: '2024-01-14T16:45:00Z',
      },
      {
        id: '3',
        firstName: 'Mike',
        lastName: 'Chen',
        email: 'mike.chen@techfabric.co',
        subject: 'Technical Support Request',
        message: 'We are experiencing quality issues with recent fabric delivery. Need technical assistance.',
        source: 'phone',
        priority: 'urgent',
        status: 'resolved',
        category: 'support',
        tags: ['quality-issue', 'technical-support'],
        assignedTo: 'tech-support-1',
        createdAt: '2024-01-13T09:20:00Z',
        updatedAt: '2024-01-13T18:30:00Z',
        resolvedAt: '2024-01-13T18:30:00Z',
      },
      {
        id: '4',
        firstName: 'Emma',
        lastName: 'Wilson',
        email: 'emma.wilson@retailer.com',
        company: 'Premium Retailers Inc',
        subject: 'General Inquiry',
        message: 'Looking for information about your product catalog and pricing.',
        source: 'website',
        priority: 'low',
        status: 'closed',
        category: 'general',
        tags: ['catalog', 'pricing'],
        createdAt: '2024-01-12T11:00:00Z',
        updatedAt: '2024-01-12T15:30:00Z',
        resolvedAt: '2024-01-12T15:30:00Z',
      },
    ];

    return mockContacts;
  };

  // Fetch contacts with filters and pagination
  const {
    data: contactsResponse,
    isLoading: contactsLoading,
    error: contactsError,
    refetch: refetchContacts,
  } = useQuery<PaginatedResponse<ContactForm>>({
    queryKey: CONTACT_QUERY_KEYS.list(filters, pagination),
    queryFn: async (): Promise<PaginatedResponse<ContactForm>> => {
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 600));

      let mockContacts = generateMockContacts();

      // Apply filters
      if (filters.status) {
        mockContacts = mockContacts.filter(contact => contact.status === filters.status);
      }

      if (filters.category) {
        mockContacts = mockContacts.filter(contact => contact.category === filters.category);
      }

      if (filters.priority) {
        mockContacts = mockContacts.filter(contact => contact.priority === filters.priority);
      }

      if (filters.assignedTo) {
        mockContacts = mockContacts.filter(contact => contact.assignedTo === filters.assignedTo);
      }

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        mockContacts = mockContacts.filter(contact =>
          contact.firstName.toLowerCase().includes(searchTerm) ||
          contact.lastName.toLowerCase().includes(searchTerm) ||
          contact.email.toLowerCase().includes(searchTerm) ||
          contact.subject.toLowerCase().includes(searchTerm) ||
          contact.message.toLowerCase().includes(searchTerm) ||
          contact.company?.toLowerCase().includes(searchTerm)
        );
      }

      if (filters.tags && filters.tags.length > 0) {
        mockContacts = mockContacts.filter(contact =>
          filters.tags!.some(tag => contact.tags.includes(tag))
        );
      }

      // Apply sorting
      mockContacts.sort((a, b) => {
        const aVal = a[pagination.sortBy || 'createdAt'] as string;
        const bVal = b[pagination.sortBy || 'createdAt'] as string;
        
        if (pagination.sortOrder === 'asc') {
          return aVal.localeCompare(bVal);
        }
        return bVal.localeCompare(aVal);
      });

      // Apply pagination
      const startIndex = (pagination.page - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      const paginatedContacts = mockContacts.slice(startIndex, endIndex);

      return {
        data: paginatedContacts,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: mockContacts.length,
          pages: Math.ceil(mockContacts.length / pagination.limit),
          hasNext: endIndex < mockContacts.length,
          hasPrev: pagination.page > 1,
        },
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });

  // Fetch single contact
  const useContactDetail = (id: string) => {
    return useQuery<ContactForm>({
      queryKey: CONTACT_QUERY_KEYS.detail(id),
      queryFn: async (): Promise<ContactForm> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const contact = generateMockContacts().find(c => c.id === id);
        if (!contact) {
          throw new Error('Contact not found');
        }
        
        return contact;
      },
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    });
  };

  // Fetch contact statistics
  const {
    data: stats,
    isLoading: statsLoading,
  } = useQuery<ContactStats>({
    queryKey: CONTACT_QUERY_KEYS.stats(),
    queryFn: async (): Promise<ContactStats> => {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const contacts = generateMockContacts();
      
      const totalByStatus = contacts.reduce((acc, contact) => {
        acc[contact.status] = (acc[contact.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const totalByCategory = contacts.reduce((acc, contact) => {
        acc[contact.category] = (acc[contact.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const totalByPriority = contacts.reduce((acc, contact) => {
        acc[contact.priority] = (acc[contact.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topCategories = Object.entries(totalByCategory)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);

      const recentContacts = [...contacts]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      return {
        total: contacts.length,
        new: totalByStatus.new || 0,
        inProgress: totalByStatus.in_progress || 0,
        resolved: totalByStatus.resolved || 0,
        closed: totalByStatus.closed || 0,
        averageResponseTime: 2.5, // hours
        averageResolutionTime: 24, // hours
        totalByCategory,
        totalByPriority,
        recentContacts,
        topCategories,
      };
    },
    staleTime: 10 * 60 * 1000,
  });

  // Submit contact form mutation
  const submitContactMutation = useMutation({
    mutationFn: async (contactData: ContactFormData): Promise<ContactForm> => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newContact: ContactForm = {
        id: Date.now().toString(),
        firstName: contactData.firstName,
        lastName: contactData.lastName,
        email: contactData.email,
        phone: contactData.phone,
        company: contactData.company,
        subject: contactData.subject,
        message: contactData.message,
        source: contactData.source || 'website',
        priority: 'medium',
        status: 'new',
        category: contactData.category || 'general',
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return newContact;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACT_QUERY_KEYS.all });
      toast.success('Your message has been sent successfully! We will get back to you soon.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send message. Please try again.');
    },
  });

  // Update contact status mutation
  const updateContactStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ContactForm['status'] }): Promise<void> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log(`Updating contact ${id} status to ${status}`);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: CONTACT_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CONTACT_QUERY_KEYS.detail(id) });
      toast.success('Contact status updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update contact status');
    },
  });

  // Assign contact mutation
  const assignContactMutation = useMutation({
    mutationFn: async ({ id, assigneeId }: { id: string; assigneeId: string }): Promise<void> => {
      await new Promise(resolve => setTimeout(resolve, 400));
      console.log(`Assigning contact ${id} to ${assigneeId}`);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: CONTACT_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CONTACT_QUERY_KEYS.detail(id) });
      toast.success('Contact assigned successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to assign contact');
    },
  });

  // Add response mutation
  const addResponseMutation = useMutation({
    mutationFn: async ({ 
      contactId, 
      message, 
      type = 'customer_reply' 
    }: { 
      contactId: string; 
      message: string; 
      type?: ContactResponse['type'];
    }): Promise<ContactResponse> => {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const newResponse: ContactResponse = {
        id: Date.now().toString(),
        contactFormId: contactId,
        responderId: 'current-user-id',
        responderName: 'Current User',
        message,
        type,
        createdAt: new Date().toISOString(),
      };

      return newResponse;
    },
    onSuccess: (_, { contactId }) => {
      queryClient.invalidateQueries({ queryKey: CONTACT_QUERY_KEYS.detail(contactId) });
      queryClient.invalidateQueries({ queryKey: CONTACT_QUERY_KEYS.all });
      toast.success('Response added successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add response');
    },
  });

  // Search contacts
  const searchContacts = useCallback(async (searchTerm: string): Promise<ContactForm[]> => {
    if (!searchTerm.trim()) return [];

    try {
      const results = await queryClient.fetchQuery({
        queryKey: CONTACT_QUERY_KEYS.search(searchTerm),
        queryFn: async (): Promise<ContactForm[]> => {
          await new Promise(resolve => setTimeout(resolve, 400));
          
          const allContacts = generateMockContacts();
          const search = searchTerm.toLowerCase();
          
          return allContacts.filter(contact =>
            contact.firstName.toLowerCase().includes(search) ||
            contact.lastName.toLowerCase().includes(search) ||
            contact.email.toLowerCase().includes(search) ||
            contact.subject.toLowerCase().includes(search) ||
            contact.message.toLowerCase().includes(search) ||
            contact.company?.toLowerCase().includes(search)
          );
        },
        staleTime: 2 * 60 * 1000,
      });

      return results;
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
      return [];
    }
  }, [queryClient]);

  // Filter and pagination functions
  const updateFilters = useCallback((newFilters: Partial<ContactFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  const updatePagination = useCallback((newPagination: Partial<PaginationParams>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
    setPagination({
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  }, []);

  // Computed values
  const contacts = useMemo(() => contactsResponse?.data || [], [contactsResponse?.data]);
  const paginationInfo = useMemo(() => contactsResponse?.pagination || null, [contactsResponse?.pagination]);

  const isLoading = contactsLoading || statsLoading;
  const hasError = contactsError;

  const totalContacts = paginationInfo?.total || 0;
  const hasNextPage = paginationInfo?.hasNext || false;
  const hasPrevPage = paginationInfo?.hasPrev || false;

  // Navigation functions
  const goToPage = useCallback((page: number) => {
    updatePagination({ page });
  }, [updatePagination]);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      updatePagination({ page: pagination.page + 1 });
    }
  }, [hasNextPage, pagination.page, updatePagination]);

  const prevPage = useCallback(() => {
    if (hasPrevPage) {
      updatePagination({ page: pagination.page - 1 });
    }
  }, [hasPrevPage, pagination.page, updatePagination]);

  // Utility functions
  const getContactsByStatus = useCallback((status: ContactForm['status']) => {
    return contacts.filter(contact => contact.status === status);
  }, [contacts]);

  const getContactsByCategory = useCallback((category: ContactForm['category']) => {
    return contacts.filter(contact => contact.category === category);
  }, [contacts]);

  const getUrgentContacts = useCallback(() => {
    return contacts.filter(contact => contact.priority === 'urgent');
  }, [contacts]);

  return {
    // Data
    contacts,
    stats,
    
    // Loading states
    isLoading,
    contactsLoading,
    statsLoading,
    
    // Error states
    error: hasError,
    contactsError,
    
    // Pagination
    pagination: paginationInfo,
    currentPage: pagination.page,
    totalContacts,
    hasNextPage,
    hasPrevPage,
    
    // Filters
    filters,
    
    // Actions
    searchContacts,
    updateFilters,
    updatePagination,
    resetFilters,
    goToPage,
    nextPage,
    prevPage,
    refetchContacts,
    
    // Contact operations
    submitContact: submitContactMutation.mutateAsync,
    updateContactStatus: updateContactStatusMutation.mutateAsync,
    assignContact: assignContactMutation.mutateAsync,
    addResponse: addResponseMutation.mutateAsync,
    
    // Mutation states
    isSubmitting: submitContactMutation.isPending,
    isUpdatingStatus: updateContactStatusMutation.isPending,
    isAssigning: assignContactMutation.isPending,
    isAddingResponse: addResponseMutation.isPending,
    
    // Utility functions
    getContactsByStatus,
    getContactsByCategory,
    getUrgentContacts,
    useContactDetail,
  };
};

export default useContact;