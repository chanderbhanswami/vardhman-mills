'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  ChevronRightIcon,
  Square3Stack3DIcon,
  PrinterIcon,
  ShareIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';

// Dynamic imports
const SizeGuide = dynamic(() => import('@/components/help/SizeGuide'), {
  loading: () => <div className="h-screen bg-gray-100 animate-pulse rounded-lg" />
});

// UI Components
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// Main Component
function SizeGuidePageContent() {
  const router = useRouter();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Logic to download PDF version
    console.log('Downloading size guide PDF...');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Vardhman Mills Size Guide',
        text: 'Check out this comprehensive size guide for home furnishings',
        url: window.location.href
      });
    }
  };

  const breadcrumbs = [
    { label: 'Home', href: '/', icon: HomeIcon },
    { label: 'Help Center', href: '/help-&-guide' },
    { label: 'Size Guide', href: '#', current: true }
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
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <Square3Stack3DIcon className="h-8 w-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Complete Size Guide
            </h1>
            <p className="text-xl text-white/90 mb-6">
              Find the perfect size for all your home furnishing needs
            </p>

            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="bg-white/10 text-white border-white/30 hover:bg-white/20"
              >
                <PrinterIcon className="h-4 w-4 mr-2" />
                Print Guide
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="bg-white/10 text-white border-white/30 hover:bg-white/20"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="bg-white/10 text-white border-white/30 hover:bg-white/20"
              >
                <ShareIcon className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <Suspense fallback={<div className="h-screen bg-white animate-pulse rounded-lg" />}>
            <SizeGuide
              showSizeCalculator={true}
              showMeasurementTips={true}
              showFitGuide={true}
              enableAnimations={true}
              showPrintButton={true}
              showShareButton={true}
              className="bg-white rounded-lg shadow-sm"
            />
          </Suspense>

          {/* Additional Help Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                📏 How to Measure
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Use a flexible measuring tape for accuracy</li>
                <li>• Measure in inches or centimeters consistently</li>
                <li>• Round up to the nearest whole number</li>
                <li>• For windows, measure width × length</li>
                <li>• For beds, measure mattress dimensions</li>
                <li>• For tables, measure from edge to edge</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                💡 Sizing Tips
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Add 6-8 inches to curtain length for proper draping</li>
                <li>• Choose sheets with pocket depth matching your mattress</li>
                <li>• Rugs should extend 18-24 inches beyond furniture</li>
                <li>• Tablecloths should drop 8-12 inches on each side</li>
                <li>• When in doubt, size up for better fit</li>
                <li>• Contact us for custom sizing options</li>
              </ul>
            </Card>
          </div>

          {/* CTA Section */}
          <Card className="mt-12 p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Still Unsure About Sizing?
            </h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Our expert team is here to help you find the perfect size. Get personalized recommendations 
              based on your specific measurements and requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="default"
                size="lg"
                onClick={() => router.push('/help-&-guide/form')}
              >
                Request Custom Sizing
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/contact')}
              >
                Contact Sizing Expert
              </Button>
            </div>
          </Card>

          {/* FAQ Section */}
          <Card className="mt-12 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  What if my size is between two standard sizes?
                </h4>
                <p className="text-gray-600 text-sm">
                  We recommend sizing up for the best fit. You can also contact us for custom sizing options 
                  tailored to your exact measurements.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Do you offer custom sizes?
                </h4>
                <p className="text-gray-600 text-sm">
                  Yes! We offer custom sizing for most products. Simply provide your measurements when placing 
                  your order or contact our customer service team.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  How accurate are the size charts?
                </h4>
                <p className="text-gray-600 text-sm">
                  Our size charts are based on standard industry measurements and are highly accurate. However, 
                  slight variations may occur due to manufacturing processes.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Can I return if the size doesn&apos;t fit?
                </h4>
                <p className="text-gray-600 text-sm">
                  Yes, we have a flexible return policy. If the size doesn&apos;t fit as expected, you can return 
                  or exchange within 30 days of purchase. See our return policy for details.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </motion.div>
  );
}

// Wrapper with Suspense
export default function SizeGuidePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <SizeGuidePageContent />
    </Suspense>
  );
}
