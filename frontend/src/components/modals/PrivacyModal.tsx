/**
 * Privacy Policy Modal Component
 * Displays privacy policy with acceptance functionality
 */

'use client';

import React, { useState, useEffect } from 'react';

/**
 * Privacy Policy Props
 */
export interface PrivacyModalProps {
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
 * Privacy Policy Modal Component
 */
export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  required = false,
  showCheckbox = true,
  title = 'Privacy Policy',
  companyName = 'Vardhman Mills',
  websiteUrl = 'https://vardhmanmills.com',
  contactEmail = 'privacy@vardhmanmills.com',
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

  // Handle scroll to detect if user has read policy
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
              <h3 className="text-lg font-semibold mb-4">1. Introduction</h3>
              <p className="mb-4">
                {companyName} (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website {websiteUrl} and use our services.
              </p>
              <p className="mb-4">
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access or use our services.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold mb-4">2. Information We Collect</h3>
              
              <h4 className="text-md font-semibold mb-2">2.1 Personal Information</h4>
              <p className="mb-4">
                We may collect personal information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Register for an account</li>
                <li>Make a purchase</li>
                <li>Subscribe to our newsletter</li>
                <li>Contact us for support</li>
                <li>Participate in surveys or promotions</li>
                <li>Use our website features</li>
              </ul>
              <p className="mb-4">
                This information may include:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Name and contact information (email, phone, address)</li>
                <li>Account credentials (username, password)</li>
                <li>Payment information (processed securely by third-party providers)</li>
                <li>Communication preferences</li>
                <li>Any other information you choose to provide</li>
              </ul>

              <h4 className="text-md font-semibold mb-2">2.2 Automatically Collected Information</h4>
              <p className="mb-4">
                When you visit our website, we may automatically collect certain information about your device and usage patterns:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>IP address and location data</li>
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>Pages visited and time spent</li>
                <li>Referring website</li>
                <li>Device information</li>
                <li>Cookies and similar technologies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold mb-4">3. How We Use Your Information</h3>
              <p className="mb-4">
                We use the information we collect for various purposes:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send administrative information and updates</li>
                <li>Respond to customer service requests</li>
                <li>Send marketing communications (with consent)</li>
                <li>Personalize your experience</li>
                <li>Monitor and analyze usage patterns</li>
                <li>Detect and prevent fraud or abuse</li>
                <li>Comply with legal obligations</li>
                <li>Protect our rights and interests</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold mb-4">4. How We Share Your Information</h3>
              <p className="mb-4">
                We may share your information in the following circumstances:
              </p>
              
              <h4 className="text-md font-semibold mb-2">4.1 Service Providers</h4>
              <p className="mb-4">
                We may share your information with third-party service providers who perform services on our behalf, such as:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Payment processing</li>
                <li>Email delivery</li>
                <li>Analytics and advertising</li>
                <li>Customer support</li>
                <li>Website hosting</li>
                <li>Security services</li>
              </ul>

              <h4 className="text-md font-semibold mb-2">4.2 Legal Requirements</h4>
              <p className="mb-4">
                We may disclose your information if required by law or in response to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Legal process or government requests</li>
                <li>Court orders or subpoenas</li>
                <li>Investigation of potential violations</li>
                <li>Protection of rights, property, or safety</li>
              </ul>

              <h4 className="text-md font-semibold mb-2">4.3 Business Transfers</h4>
              <p className="mb-4">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold mb-4">5. Data Security</h3>
              <p className="mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments</li>
                <li>Access controls and authentication</li>
                <li>Secure payment processing</li>
                <li>Employee training on data protection</li>
                <li>Incident response procedures</li>
              </ul>
              <p className="mb-4">
                However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold mb-4">6. Your Privacy Rights</h3>
              <p className="mb-4">
                Depending on your location, you may have the following rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Restriction:</strong> Request restriction of processing</li>
                <li><strong>Objection:</strong> Object to certain types of processing</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing</li>
              </ul>
              <p className="mb-4">
                To exercise these rights, please contact us at {contactEmail}.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold mb-4">7. Cookies and Tracking Technologies</h3>
              <p className="mb-4">
                We use cookies and similar tracking technologies to enhance your experience:
              </p>
              
              <h4 className="text-md font-semibold mb-2">7.1 Types of Cookies</h4>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for website functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand website usage</li>
                <li><strong>Marketing Cookies:</strong> Used for advertising and personalization</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>

              <h4 className="text-md font-semibold mb-2">7.2 Cookie Management</h4>
              <p className="mb-4">
                You can manage your cookie preferences through your browser settings or our cookie consent tool. Note that disabling certain cookies may affect website functionality.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold mb-4">8. Third-Party Links</h3>
              <p className="mb-4">
                Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing any personal information.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold mb-4">9. Data Retention</h3>
              <p className="mb-4">
                We retain your personal information for as long as necessary to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Provide our services to you</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes</li>
                <li>Enforce our agreements</li>
              </ul>
              <p className="mb-4">
                When personal information is no longer needed, we will securely delete or anonymize it.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold mb-4">10. International Data Transfers</h3>
              <p className="mb-4">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information during such transfers.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold mb-4">11. Children&apos;s Privacy</h3>
              <p className="mb-4">
                Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold mb-4">12. Changes to This Privacy Policy</h3>
              <p className="mb-4">
                We may update this privacy policy from time to time. We will notify you of any changes by:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Posting the new policy on this page</li>
                <li>Updating the &quot;Last Updated&quot; date</li>
                <li>Sending you an email notification (for material changes)</li>
              </ul>
              <p className="mb-4">
                We encourage you to review this privacy policy periodically to stay informed about how we protect your information.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold mb-4">13. Contact Information</h3>
              <p className="mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
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
                I have read and agree to the Privacy Policy
                {required && !hasScrolledToBottom && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </span>
            </label>
          )}

          {required && !hasScrolledToBottom && (
            <p className="text-sm text-red-600 mb-4">
              Please scroll to the bottom to read the complete privacy policy before accepting.
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
 * Privacy Policy Hook
 */
export function usePrivacyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const handleAccept = (accepted: boolean) => {
    setIsAccepted(accepted);
    if (accepted) {
      // Store acceptance in localStorage
      localStorage.setItem('privacy_accepted', JSON.stringify({
        accepted: true,
        timestamp: new Date().toISOString(),
        version: '1.0',
      }));
    }
  };

  // Check if privacy policy was previously accepted
  useEffect(() => {
    const stored = localStorage.getItem('privacy_accepted');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setIsAccepted(data.accepted);
      } catch (error) {
        console.error('Error parsing stored privacy acceptance:', error);
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
 * Privacy Policy Checkbox Component
 */
export interface PrivacyCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
  className?: string;
  onPrivacyClick?: () => void;
  companyName?: string;
}

export const PrivacyCheckbox: React.FC<PrivacyCheckboxProps> = ({
  checked,
  onChange,
  required = false,
  className = '',
  onPrivacyClick,
  companyName = 'Vardhman Mills',
}) => {
  const handlePrivacyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onPrivacyClick) {
      onPrivacyClick();
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
          onClick={handlePrivacyClick}
          className="text-blue-600 hover:text-blue-800 underline font-medium"
        >
          Privacy Policy
        </button>
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
    </label>
  );
};

export default PrivacyModal;