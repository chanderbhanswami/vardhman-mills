'use client';

import React, { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';

// Dynamic imports
const HelpForm = dynamic(() => import('@/components/help/HelpForm'), {
  loading: () => <div className="h-screen bg-gray-100 animate-pulse rounded-lg" />
});

const HelpConfirmation = dynamic(() => import('@/components/help/HelpConfirmation'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
});

// UI Components
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// Main Component
function FormPageContent() {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');

  const handleSubmit = (data: Parameters<Required<React.ComponentProps<typeof HelpForm>>['onSubmit']>[0]) => {
    console.log('Form submitted:', data);
    const ticket = `#VRM${Math.floor(Math.random() * 1000000)}`;
    setTicketNumber(ticket);
    setIsSubmitted(true);
  };

  const breadcrumbs = [
    { label: 'Home', href: '/', icon: HomeIcon },
    { label: 'Help Center', href: '/help-&-guide' },
    { label: 'Submit Request', href: '#', current: true }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              {breadcrumbs.map((item, index) => (
                <li key={index} className="flex items-center">
                  {index > 0 && <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-2" />}
                  {item.current ? (
                    <span className="text-sm font-medium text-gray-900">{item.label}</span>
                  ) : (
                    <a href={item.href} className="text-sm font-medium text-gray-600 hover:text-gray-900">
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 py-12">
        <div className="container mx-auto px-4 text-center text-white">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
            <DocumentTextIcon className="h-8 w-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Submit a Support Request
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Need help? Fill out the form below and our support team will get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {!isSubmitted ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form */}
              <div className="lg:col-span-2">
                <Suspense fallback={<div className="h-screen bg-white animate-pulse rounded-lg" />}>
                  <HelpForm
                    onSubmit={handleSubmit}
                    showProgressBar={true}
                    maxAttachments={5}
                    maxFileSize={10}
                    allowedFileTypes={['image/*', 'application/pdf', '.doc', '.docx']}
                    enableAutoSave={true}
                    enableAnimations={true}
                    variant="wizard"
                    className="bg-white rounded-lg shadow-sm"
                  />
                </Suspense>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Need Immediate Help */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Need Immediate Help?
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <PhoneIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900">Phone Support</div>
                        <div className="text-sm text-gray-600">+91 123-456-7890</div>
                        <div className="text-xs text-gray-500 mt-1">Mon-Sat: 9 AM - 6 PM</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900">Live Chat</div>
                        <Button variant="outline" size="sm" className="mt-2 w-full">
                          Start Chat
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Response Times */}
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ClockIcon className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Expected Response Times
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Critical Issues</span>
                      <span className="font-medium text-gray-900">1-2 hours</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">High Priority</span>
                      <span className="font-medium text-gray-900">4-6 hours</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Normal</span>
                      <span className="font-medium text-gray-900">24 hours</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Low Priority</span>
                      <span className="font-medium text-gray-900">2-3 days</span>
                    </div>
                  </div>
                </Card>

                {/* Tips */}
                <Card className="p-6 bg-blue-50 border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">
                    💡 Helpful Tips
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-900">
                    <li>• Be specific about your issue</li>
                    <li>• Include order numbers if applicable</li>
                    <li>• Attach screenshots for visual issues</li>
                    <li>• Provide error messages verbatim</li>
                  </ul>
                </Card>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <Suspense fallback={<div className="h-64 bg-white animate-pulse rounded-lg" />}>
                <HelpConfirmation
                  type="success"
                  title="Request Submitted Successfully!"
                  message={`Your support request has been received. Ticket: ${ticketNumber}. Estimated response: 24 hours.`}
                  confirmationId={ticketNumber}
                  timestamp={new Date().toISOString()}
                  showActions={true}
                  showDetails={true}
                  showSteps={true}
                  showTimestamp={true}
                  showConfirmationId={true}
                  steps={[
                    { id: '1', title: 'Our team will review your request', status: 'pending' as const },
                    { id: '2', title: 'You will receive an email confirmation', status: 'pending' as const },
                    { id: '3', title: 'We\'ll respond within the estimated time', status: 'pending' as const },
                    { id: '4', title: 'Track your request in your account', status: 'pending' as const }
                  ]}
                  actions={[
                    { 
                      id: 'view-requests',
                      label: 'View My Requests', 
                      type: 'primary' as const, 
                      onClick: () => router.push('/account/support') 
                    },
                    { 
                      id: 'back',
                      label: 'Back to Help Center', 
                      type: 'secondary' as const, 
                      onClick: () => router.push('/help-&-guide') 
                    }
                  ]}
                  enableAnimations={true}
                  variant="detailed"
                  size="lg"
                />
              </Suspense>
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
}

// Wrapper with Suspense
export default function FormPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <FormPageContent />
    </Suspense>
  );
}
