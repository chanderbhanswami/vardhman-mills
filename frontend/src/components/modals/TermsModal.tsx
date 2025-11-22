/**
 * Terms & Conditions Modal Component
 * Displays terms and conditions with acceptance functionality
 */

'use client';

import React, { useState, useEffect } from 'react';

/**
 * Terms & Conditions Props
 */
export interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (accepted: boolean) => void;
  required?: boolean;
  showCheckbox?: boolean;
  title?: string;
  companyName?: string;
  websiteUrl?: string;
  contactEmail?: string;
  lastUpdated?: string;
}

/**
 * Terms & Conditions Modal Component
 */
export const TermsModal: React.FC<TermsModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  required = false,
  showCheckbox = true,
  title = 'Terms & Conditions',
  companyName = 'Vardhman Mills',
  websiteUrl = 'https://vardhmanmills.com',
  contactEmail = 'legal@vardhmanmills.com',
  lastUpdated = new Date().toLocaleDateString(),
}) => {
  const [isAccepted, setIsAccepted] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsAccepted(false);
      setHasScrolledToBottom(false);
    }
  }, [isOpen]);

  // Handle scroll to detect if user has read terms
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const scrolled = scrollTop + clientHeight >= scrollHeight - 10;
    setHasScrolledToBottom(scrolled);
  };

  // Handle accept button click
  const handleAccept = () => {
    if (required && !isAccepted) {
      return;
    }
    onAccept(isAccepted);
    onClose();
  };

  // Handle decline button click
  const handleDecline = () => {
    setIsAccepted(false);
    onAccept(false);
    onClose();
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (!required) {
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {!required && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div
          className="flex-1 p-6 overflow-y-auto"
          onScroll={handleScroll}
        >
          <div className="prose max-w-none">
            <div className="mb-6 text-sm text-gray-600">
              <p><strong>Last Updated:</strong> {lastUpdated}</p>
              <p><strong>Effective Date:</strong> {lastUpdated}</p>
            </div>

            <section className="mb-8">
              <h3 className="text-lg font-semibold mb-4">1. Acceptance of Terms</h3>
              <p className="mb-4">
                By accessing and using the {companyName} website ({websiteUrl}), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold mb-4">2. Use License</h3>
              <p className="mb-4">
                Permission is granted to temporarily download one copy of the materials on {companyName}&apos;s website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display (commercial or non-commercial)</li>
                <li>attempt to decompile or reverse engineer any software contained on the website</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>
              <p>
                This license shall automatically terminate if you violate any of these restrictions and may be terminated by {companyName} at any time. Upon terminating your viewing of these materials or upon the termination of this license, you must destroy any downloaded materials in your possession whether in electronic or printed format.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold mb-4">3. Disclaimer</h3>
              <p className="mb-4">
                The materials on {companyName}&apos;s website are provided on an &apos;as is&apos; basis. {companyName} makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
              <p>
                Further, {companyName} does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold mb-4">4. Limitations</h3>
              <p className="mb-4">
                In no event shall {companyName} or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on {companyName}&apos;s website, even if {companyName} or a {companyName} authorized representative has been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold mb-4">5. Accuracy of Materials</h3>
              <p className="mb-4">
                The materials appearing on {companyName}&apos;s website could include technical, typographical, or photographic errors. {companyName} does not warrant that any of the materials on its website are accurate, complete, or current. {companyName} may make changes to the materials contained on its website at any time without notice. However, {companyName} does not make any commitment to update the materials.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold mb-4">6. Links</h3>
              <p className="mb-4">
                {companyName} has not reviewed all of the sites linked to our website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by {companyName} of the site. Use of any such linked website is at the user&apos;s own risk.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold mb-4">7. Modifications</h3>
              <p className="mb-4">
                {companyName} may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold mb-4">8. User Accounts</h3>
              <p className="mb-4">
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>You must be at least 18 years old to create an account</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You must notify us immediately of any unauthorized use of your account</li>
                <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold mb-4">9. Prohibited Uses</h3>
              <p className="mb-4">You may not use our service:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
                <li>To upload or transmit viruses or any other type of malicious code</li>
                <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
                <li>For any obscene or immoral purpose</li>
                <li>To interfere with or circumvent the security features of our service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold mb-4">10. Products and Services</h3>
              <p className="mb-4">
                All products and services are subject to availability. We reserve the right to discontinue any product or service at any time. Prices are subject to change without notice.
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Product descriptions and pricing are subject to change</li>
                <li>We reserve the right to limit quantities</li>
                <li>All orders are subject to acceptance and availability</li>
                <li>We may refuse service to anyone for any reason at any time</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold mb-4">11. Governing Law</h3>
              <p className="mb-4">
                These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold mb-4">12. Contact Information</h3>
              <p className="mb-4">
                If you have any questions about these Terms & Conditions, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Email:</strong> {contactEmail}</p>
                <p><strong>Website:</strong> {websiteUrl}</p>
                <p><strong>Company:</strong> {companyName}</p>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          {showCheckbox && (
            <label className="flex items-start space-x-3 mb-4">
              <input
                type="checkbox"
                checked={isAccepted}
                onChange={(e) => setIsAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={required && !hasScrolledToBottom}
              />
              <span className="text-sm text-gray-700">
                I have read and agree to the Terms & Conditions
                {required && !hasScrolledToBottom && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </span>
            </label>
          )}

          {required && !hasScrolledToBottom && (
            <p className="text-sm text-red-600 mb-4">
              Please scroll to the bottom to read all terms before accepting.
            </p>
          )}

          <div className="flex justify-end space-x-3">
            {!required && (
              <button
                onClick={handleDecline}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Decline
              </button>
            )}
            <button
              onClick={handleAccept}
              disabled={required && (!isAccepted || !hasScrolledToBottom)}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                required && (!isAccepted || !hasScrolledToBottom)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Terms & Conditions Hook
 */
export function useTermsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const handleAccept = (accepted: boolean) => {
    setIsAccepted(accepted);
    if (accepted) {
      // Store acceptance in localStorage
      localStorage.setItem('terms_accepted', JSON.stringify({
        accepted: true,
        timestamp: new Date().toISOString(),
        version: '1.0',
      }));
    }
  };

  // Check if terms were previously accepted
  useEffect(() => {
    const stored = localStorage.getItem('terms_accepted');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setIsAccepted(data.accepted);
      } catch (error) {
        console.error('Error parsing stored terms acceptance:', error);
      }
    }
  }, []);

  return {
    isOpen,
    isAccepted,
    openModal,
    closeModal,
    handleAccept,
  };
}

/**
 * Terms Acceptance Checkbox Component
 */
export interface TermsCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
  className?: string;
  onTermsClick?: () => void;
  companyName?: string;
}

export const TermsCheckbox: React.FC<TermsCheckboxProps> = ({
  checked,
  onChange,
  required = false,
  className = '',
  onTermsClick,
  companyName = 'Vardhman Mills',
}) => {
  const handleTermsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onTermsClick) {
      onTermsClick();
    }
  };

  return (
    <label className={`flex items-start space-x-3 ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        required={required}
      />
      <span className="text-sm text-gray-700">
        I agree to {companyName}&apos;s{' '}
        <button
          type="button"
          onClick={handleTermsClick}
          className="text-blue-600 hover:text-blue-800 underline font-medium"
        >
          Terms & Conditions
        </button>
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
    </label>
  );
};

export default TermsModal;