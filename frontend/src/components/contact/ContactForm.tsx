'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Send, 
  User, 
  Mail, 
  Phone, 
  MessageSquare, 
  Building, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Upload,
  X,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Checkbox } from '@/components/ui/Checkbox';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

// Form validation schema
const contactFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50, 'First name must not exceed 50 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50, 'Last name must not exceed 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').regex(/^[\+]?[1-9][\d]{0,2}[\s]?[(]?[\d]{1,4}[)]?[-\s\.]?[\d]{1,4}[-\s\.]?[\d]{1,9}$/, 'Please enter a valid phone number'),
  company: z.string().optional(),
  industry: z.string().optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(100, 'Subject must not exceed 100 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters').max(1000, 'Message must not exceed 1000 characters'),
  inquiryType: z.enum(['general', 'product', 'support', 'partnership', 'quote', 'complaint']),
  preferredContact: z.enum(['email', 'phone', 'whatsapp']),
  urgency: z.enum(['low', 'medium', 'high', 'urgent']),
  newsletter: z.boolean().optional(),
  terms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  attachments: z.array(z.any()).optional()
});

type ContactFormData = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  className?: string;
  variant?: 'default' | 'minimal' | 'detailed' | 'wizard';
  showAttachments?: boolean;
  showBudgetFields?: boolean;
  showCompanyFields?: boolean;
  onSubmit?: (data: ContactFormData) => Promise<void>;
  maxFileSize?: number;
  allowedFileTypes?: string[];
}

const inquiryTypes = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'product', label: 'Product Information' },
  { value: 'support', label: 'Customer Support' },
  { value: 'partnership', label: 'Partnership Opportunity' },
  { value: 'quote', label: 'Request Quote' },
  { value: 'complaint', label: 'Complaint/Feedback' }
];

const contactPreferences = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone Call' },
  { value: 'whatsapp', label: 'WhatsApp' }
];

const urgencyLevels = [
  { value: 'low', label: 'Low Priority', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High Priority', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
];

const industries = [
  'Textile Manufacturing',
  'Fashion & Apparel',
  'Home Textiles',
  'Technical Textiles',
  'Automotive',
  'Healthcare',
  'Agriculture',
  'Construction',
  'Sports & Recreation',
  'Other'
];

const budgetRanges = [
  'Under ₹1 Lakh',
  '₹1-5 Lakhs',
  '₹5-25 Lakhs',
  '₹25 Lakhs - 1 Crore',
  'Above ₹1 Crore',
  'Prefer not to disclose'
];

const timelines = [
  'Immediate (Within 1 week)',
  'Short term (1-4 weeks)',
  'Medium term (1-3 months)',
  'Long term (3+ months)',
  'Just exploring options'
];

const ContactForm: React.FC<ContactFormProps> = ({
  className,
  variant = 'default',
  showAttachments = true,
  showBudgetFields = true,
  showCompanyFields = true,
  onSubmit,
  maxFileSize = 5 * 1024 * 1024, // 5MB
  allowedFileTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png']
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = variant === 'wizard' ? 3 : 1;

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset,
    setValue
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      inquiryType: 'general',
      preferredContact: 'email',
      urgency: 'medium',
      newsletter: false,
      terms: false
    },
    mode: 'onChange'
  });

  const messageLength = watch('message')?.length || 0;

  const handleFormSubmit = useCallback(async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Add uploaded files to form data
      const formData = {
        ...data,
        attachments: uploadedFiles
      };

      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Default submission logic
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          throw new Error('Failed to submit form');
        }
      }

      setSubmitStatus('success');
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      reset();
      setUploadedFiles([]);
      setCurrentStep(1);
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, reset, uploadedFiles]);

  const handleFileUpload = useCallback((files: File[]) => {
    const validFiles = files.filter(file => {
      const isValidSize = file.size <= maxFileSize;
      const isValidType = allowedFileTypes.some(type => 
        file.name.toLowerCase().endsWith(type.toLowerCase())
      );
      
      if (!isValidSize) {
        toast.error(`File ${file.name} is too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB`);
        return false;
      }
      
      if (!isValidType) {
        toast.error(`File ${file.name} has unsupported format`);
        return false;
      }
      
      return true;
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);
    setValue('attachments', [...uploadedFiles, ...validFiles]);
  }, [maxFileSize, allowedFileTypes, setValue, uploadedFiles]);

  const removeFile = useCallback((index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    setValue('attachments', newFiles);
  }, [uploadedFiles, setValue]);

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepContent = () => {
    if (variant !== 'wizard') {
      return renderAllFields();
    }

    switch (currentStep) {
      case 1:
        return renderBasicInfo();
      case 2:
        return renderInquiryDetails();
      case 3:
        return renderAdditionalInfo();
      default:
        return renderBasicInfo();
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            <User className="w-4 h-4 inline mr-2" />
            First Name *
          </label>
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Enter your first name"
                error={errors.firstName?.message}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary-500"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Last Name *
          </label>
          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Enter your last name"
                error={errors.lastName?.message}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary-500"
              />
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            Email Address *
          </label>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="email"
                placeholder="Enter your email address"
                error={errors.email?.message}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary-500"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            Phone Number *
          </label>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="tel"
                placeholder="Enter your phone number"
                error={errors.phone?.message}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary-500"
              />
            )}
          />
        </div>
      </div>

      {showCompanyFields && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              <Building className="w-4 h-4 inline mr-2" />
              Company Name
            </label>
            <Controller
              name="company"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Enter your company name"
                  error={errors.company?.message}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary-500"
                />
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Industry
            </label>
            <Controller
              name="industry"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Select your industry"
                  options={industries.map(industry => ({
                    value: industry,
                    label: industry
                  }))}
                  error={errors.industry?.message}
                />
              )}
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderInquiryDetails = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          <MessageSquare className="w-4 h-4 inline mr-2" />
          Subject *
        </label>
        <Controller
          name="subject"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              placeholder="Enter the subject of your inquiry"
              error={errors.subject?.message}
              className="transition-all duration-200 focus:ring-2 focus:ring-primary-500"
            />
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Inquiry Type *
          </label>
          <Controller
            name="inquiryType"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={inquiryTypes}
                error={errors.inquiryType?.message}
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Preferred Contact Method *
          </label>
          <Controller
            name="preferredContact"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={contactPreferences}
                error={errors.preferredContact?.message}
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            <Clock className="w-4 h-4 inline mr-2" />
            Priority Level *
          </label>
          <Controller
            name="urgency"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={urgencyLevels.map(level => ({
                  value: level.value,
                  label: level.label
                }))}
                error={errors.urgency?.message}
              />
            )}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          <MessageSquare className="w-4 h-4 inline mr-2" />
          Message *
          <span className="text-sm text-gray-500 ml-2">
            ({messageLength}/1000 characters)
          </span>
        </label>
        <Controller
          name="message"
          control={control}
          render={({ field }) => (
            <TextArea
              {...field}
              placeholder="Please provide detailed information about your inquiry..."
              rows={6}
              className="transition-all duration-200 focus:ring-2 focus:ring-primary-500"
            />
          )}
        />
        <Progress 
          value={(messageLength / 1000) * 100} 
          className="mt-2 h-1"
          color={messageLength > 800 ? 'red' : messageLength > 500 ? 'yellow' : 'green'}
        />
      </div>
    </div>
  );

  const renderAdditionalInfo = () => (
    <div className="space-y-6">
      {showBudgetFields && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Budget Range
            </label>
            <Controller
              name="budget"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Select budget range"
                  options={budgetRanges.map(range => ({
                    value: range,
                    label: range
                  }))}
                  error={errors.budget?.message}
                />
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Timeline
            </label>
            <Controller
              name="timeline"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Select timeline"
                  options={timelines.map(timeline => ({
                    value: timeline,
                    label: timeline
                  }))}
                  error={errors.timeline?.message}
                />
              )}
            />
          </div>
        </div>
      )}

      {showAttachments && (
        <div>
          <label className="block text-sm font-medium mb-2">
            <Upload className="w-4 h-4 inline mr-2" />
            Attachments
            <span className="text-sm text-gray-500 ml-2">
              (Max {maxFileSize / (1024 * 1024)}MB per file)
            </span>
          </label>
          
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors cursor-pointer"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.multiple = true;
              input.accept = allowedFileTypes.join(',');
              input.onchange = (e) => {
                const files = Array.from((e.target as HTMLInputElement).files || []);
                handleFileUpload(files);
              };
              input.click();
            }}
          >
            <Upload className="w-8 h-8 mx-auto mb-4 text-gray-400" />
            <p className="text-sm text-gray-600 mb-2">
              Drop files here or click to browse
            </p>
            <p className="text-xs text-gray-500">
              Supported formats: {allowedFileTypes.join(', ')}
            </p>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Uploaded Files:</p>
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">{file.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {(file.size / 1024).toFixed(1)} KB
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-start gap-2">
          <Controller
            name="newsletter"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Checkbox
                checked={value}
                onChange={onChange}
                id="newsletter"
              />
            )}
          />
          <label htmlFor="newsletter" className="text-sm text-gray-700 cursor-pointer">
            Subscribe to our newsletter for updates on new products and industry insights
          </label>
        </div>

        <div className="flex items-start gap-2">
          <Controller
            name="terms"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Checkbox
                checked={value}
                onChange={onChange}
                id="terms"
              />
            )}
          />
          <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
            I agree to the{' '}
            <a href="/terms" className="text-primary-600 hover:underline" target="_blank">
              Terms of Service
            </a>
            {' '}and{' '}
            <a href="/privacy" className="text-primary-600 hover:underline" target="_blank">
              Privacy Policy
            </a>
            {' '}*
          </label>
        </div>
        {errors.terms && (
          <p className="text-red-500 text-sm">{errors.terms.message}</p>
        )}
      </div>
    </div>
  );

  const renderAllFields = () => (
    <div className="space-y-8">
      {renderBasicInfo()}
      {renderInquiryDetails()}
      {renderAdditionalInfo()}
    </div>
  );

  return (
    <Card className={cn('max-w-4xl mx-auto', className)}>
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Fill out the form below and we&apos;ll get back to you as soon as possible.
              Our team is here to help with all your textile needs.
            </p>
          </motion.div>
        </div>

        {/* Progress Bar for Wizard */}
        {variant === 'wizard' && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300',
                    step <= currentStep
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'border-gray-300 text-gray-500'
                  )}
                >
                  {step < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="font-semibold">{step}</span>
                  )}
                </div>
              ))}
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Basic Information</span>
              <span>Inquiry Details</span>
              <span>Additional Info</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {getStepContent()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            {variant === 'wizard' && currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="flex items-center gap-2"
              >
                Previous
              </Button>
            ) : (
              <div />
            )}

            {variant === 'wizard' && currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2"
                disabled={!isValid}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="flex items-center gap-2 min-w-[120px]"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            )}
          </div>
        </form>

        {/* Status Messages */}
        <AnimatePresence>
          {submitStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6"
            >
              <Alert variant="success">
                <CheckCircle className="w-4 h-4" />
                <div>
                  <p className="font-medium">Message sent successfully!</p>
                  <p className="text-sm mt-1">
                    Thank you for contacting us. We&apos;ll get back to you within 24 hours.
                  </p>
                </div>
              </Alert>
            </motion.div>
          )}

          {submitStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6"
            >
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <div>
                  <p className="font-medium">Failed to send message</p>
                  <p className="text-sm mt-1">
                    There was an error sending your message. Please try again or contact us directly.
                  </p>
                </div>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Response Time</p>
              <p>
                We typically respond to inquiries within 24 hours during business days.
                For urgent matters, please call us directly at +91 98765 43210.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ContactForm;