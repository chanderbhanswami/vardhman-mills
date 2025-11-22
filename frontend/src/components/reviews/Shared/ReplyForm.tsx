'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Bold, 
  Italic, 
  Link, 
  Quote, 
  List, 
  ListOrdered, 
  Type, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Loader2, 
  X, 
  Image as ImageIcon, 
  Hash, 
  Save, 
  Maximize2,
  Minimize2,
  MessageSquare,
  User,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';
import MediaUploader, { MediaFile } from './MediaUploader';

// Types
export interface ReplyData {
  id?: string;
  content: string;
  authorName: string;
  authorEmail: string;
  parentId?: string;
  reviewId: string;
  isPrivate: boolean;
  attachments: MediaFile[];
  mentions: string[];
  tags: string[];
  metadata: {
    wordCount: number;
    characterCount: number;
    readTime: number;
    lastSaved?: Date;
    version: number;
  };
  formatting: {
    isBold: boolean;
    isItalic: boolean;
    hasLinks: boolean;
    hasQuotes: boolean;
    hasList: boolean;
  };
  status: 'draft' | 'pending' | 'published' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReplyFormProps {
  onSubmit: (data: ReplyData) => Promise<void>;
  onSave?: (data: ReplyData) => Promise<void>;
  onCancel?: () => void;
  parentReply?: ReplyData;
  reviewId: string;
  initialData?: Partial<ReplyData>;
  isEditing?: boolean;
  showAuthorFields?: boolean;
  showPrivateToggle?: boolean;
  showAttachments?: boolean;
  showFormatting?: boolean;
  showPreview?: boolean;
  showWordCount?: boolean;
  showMentions?: boolean;
  showTags?: boolean;
  autoSave?: boolean;
  autoSaveInterval?: number;
  maxLength?: number;
  minLength?: number;
  placeholder?: string;
  submitButtonText?: string;
  saveButtonText?: string;
  cancelButtonText?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  validation?: {
    content?: (content: string) => string | null;
    authorName?: (name: string) => string | null;
    authorEmail?: (email: string) => string | null;
  };
  mentions?: {
    enabled: boolean;
    users: Array<{ id: string; name: string; avatar?: string; email?: string }>;
    onSearch?: (query: string) => Promise<Array<{ id: string; name: string; avatar?: string }>>;
  };
  tags?: {
    enabled: boolean;
    suggestions: string[];
    allowCustom: boolean;
    maxTags?: number;
  };
  templates?: Array<{
    id: string;
    name: string;
    content: string;
    description?: string;
  }>;
  onTemplateSelect?: (template: { id: string; name: string; content: string; description?: string }) => void;
  customButtons?: Array<{
    label: string;
    icon?: React.ReactNode;
    action: (data: ReplyData) => void;
    variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'ghost';
    disabled?: boolean;
  }>;
}

const ReplyForm: React.FC<ReplyFormProps> = ({
  onSubmit,
  onSave,
  onCancel,
  parentReply,
  reviewId,
  initialData,
  isEditing = false,
  showAuthorFields = true,
  showPrivateToggle = true,
  showAttachments = true,
  showFormatting = true,
  showPreview = true,
  showWordCount = true,
  showMentions = true,
  showTags = true,
  autoSave = true,
  autoSaveInterval = 30000, // 30 seconds
  maxLength = 5000,
  minLength = 10,
  placeholder = 'Write your reply...',
  submitButtonText = 'Submit Reply',
  saveButtonText = 'Save Draft',
  cancelButtonText = 'Cancel',
  className,
  disabled = false,
  required = true,
  validation,
  mentions,
  tags,
  templates,
  customButtons
}) => {
  // Form state
  const [content, setContent] = useState(initialData?.content || '');
  const [authorName, setAuthorName] = useState(initialData?.authorName || '');
  const [authorEmail, setAuthorEmail] = useState(initialData?.authorEmail || '');
  const [isPrivate, setIsPrivate] = useState(initialData?.isPrivate || false);
  const [attachments, setAttachments] = useState<MediaFile[]>(initialData?.attachments || []);
  const [selectedMentions, setSelectedMentions] = useState<string[]>(initialData?.mentions || []);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);

  // UI state
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notifications, setNotifications] = useState<Array<{ id: string; type: 'success' | 'error' | 'info'; message: string }>>([]);

  // Search state
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionResults, setMentionResults] = useState<Array<{ id: string; name: string; avatar?: string }>>([]);

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Calculate metadata
  const metadata = React.useMemo(() => {
    const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    const characterCount = content.length;
    const readTime = Math.ceil(wordCount / 200); // 200 words per minute average
    
    return {
      wordCount,
      characterCount,
      readTime,
      lastSaved: lastSaved || undefined,
      version: 1
    };
  }, [content, lastSaved]);

  // Calculate formatting
  const formatting = React.useMemo(() => ({
    isBold: /\*\*(.*?)\*\*/.test(content),
    isItalic: /\*(.*?)\*/.test(content),
    hasLinks: /\[([^\]]+)\]\(([^)]+)\)/.test(content),
    hasQuotes: /^>\s/.test(content),
    hasList: /^[\*\-\+]\s/.test(content) || /^\d+\.\s/.test(content)
  }), [content]);

  // Show notification
  const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  // Auto-save functionality
  const autoSaveData = useCallback(async () => {
    if (!onSave || disabled || !content.trim()) return;

    setIsSaving(true);
    try {
      const replyData: ReplyData = {
        id: initialData?.id,
        content,
        authorName,
        authorEmail,
        parentId: parentReply?.id,
        reviewId,
        isPrivate,
        attachments,
        mentions: selectedMentions,
        tags: selectedTags,
        metadata,
        formatting,
        status: 'draft',
        createdAt: initialData?.createdAt,
        updatedAt: new Date()
      };

      await onSave(replyData);
      setLastSaved(new Date());
      showNotification('info', 'Draft saved automatically');
    } catch (error) {
      console.error('Auto-save failed:', error);
      showNotification('error', 'Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  }, [onSave, disabled, content, authorName, authorEmail, parentReply?.id, reviewId, isPrivate, attachments, selectedMentions, selectedTags, metadata, formatting, initialData, showNotification]);

  // Set up auto-save timer
  useEffect(() => {
    if (autoSave && content.trim()) {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
      
      autoSaveTimer.current = setTimeout(() => {
        autoSaveData();
      }, autoSaveInterval);
    }

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [autoSave, content, autoSaveInterval, autoSaveData]);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    // Content validation
    if (required && !content.trim()) {
      newErrors.content = 'Reply content is required';
    } else if (content.length < minLength) {
      newErrors.content = `Reply must be at least ${minLength} characters`;
    } else if (content.length > maxLength) {
      newErrors.content = `Reply must be no more than ${maxLength} characters`;
    } else if (validation?.content) {
      const contentError = validation.content(content);
      if (contentError) newErrors.content = contentError;
    }

    // Author fields validation
    if (showAuthorFields) {
      if (!authorName.trim()) {
        newErrors.authorName = 'Name is required';
      } else if (validation?.authorName) {
        const nameError = validation.authorName(authorName);
        if (nameError) newErrors.authorName = nameError;
      }

      if (!authorEmail.trim()) {
        newErrors.authorEmail = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorEmail)) {
        newErrors.authorEmail = 'Please enter a valid email address';
      } else if (validation?.authorEmail) {
        const emailError = validation.authorEmail(authorEmail);
        if (emailError) newErrors.authorEmail = emailError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [required, content, minLength, maxLength, validation, showAuthorFields, authorName, authorEmail]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const replyData: ReplyData = {
        id: initialData?.id,
        content,
        authorName,
        authorEmail,
        parentId: parentReply?.id,
        reviewId,
        isPrivate,
        attachments,
        mentions: selectedMentions,
        tags: selectedTags,
        metadata,
        formatting,
        status: 'pending',
        createdAt: initialData?.createdAt || new Date(),
        updatedAt: new Date()
      };

      await onSubmit(replyData);
      showNotification('success', isEditing ? 'Reply updated successfully' : 'Reply submitted successfully');
      
      // Reset form if not editing
      if (!isEditing) {
        setContent('');
        setAttachments([]);
        setSelectedMentions([]);
        setSelectedTags([]);
      }
    } catch (error) {
      console.error('Submit failed:', error);
      showNotification('error', isEditing ? 'Failed to update reply' : 'Failed to submit reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle manual save
  const handleSave = async () => {
    if (!onSave || !validateForm() || isSaving) return;

    setIsSaving(true);
    try {
      const replyData: ReplyData = {
        id: initialData?.id,
        content,
        authorName,
        authorEmail,
        parentId: parentReply?.id,
        reviewId,
        isPrivate,
        attachments,
        mentions: selectedMentions,
        tags: selectedTags,
        metadata,
        formatting,
        status: 'draft',
        createdAt: initialData?.createdAt,
        updatedAt: new Date()
      };

      await onSave(replyData);
      setLastSaved(new Date());
      showNotification('success', 'Draft saved successfully');
    } catch (error) {
      console.error('Save failed:', error);
      showNotification('error', 'Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  // Format text functions
  const insertFormatting = useCallback((format: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let replacement = '';
    switch (format) {
      case 'bold':
        replacement = `**${selectedText}**`;
        break;
      case 'italic':
        replacement = `*${selectedText}*`;
        break;
      case 'link':
        replacement = `[${selectedText || 'link text'}](url)`;
        break;
      case 'quote':
        replacement = `> ${selectedText}`;
        break;
      case 'list':
        replacement = `- ${selectedText}`;
        break;
      case 'orderedList':
        replacement = `1. ${selectedText}`;
        break;
    }

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + replacement.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [content]);

  // Handle mention search
  const handleMentionSearch = useCallback(async (query: string) => {
    if (!mentions?.enabled || !mentions.onSearch) return;

    try {
      const results = await mentions.onSearch(query);
      setMentionResults(results);
    } catch (error) {
      console.error('Mention search failed:', error);
    }
  }, [mentions]);

  // Insert mention
  const insertMention = useCallback((user: { id: string; name: string }) => {
    const cursorPos = textareaRef.current?.selectionStart || 0;
    const beforeCursor = content.substring(0, cursorPos);
    const afterCursor = content.substring(cursorPos);
    
    // Find the start of the current mention
    const mentionStart = beforeCursor.lastIndexOf('@');
    const beforeMention = content.substring(0, mentionStart);
    
    const newContent = `${beforeMention}@${user.name} ${afterCursor}`;
    setContent(newContent);
    setSelectedMentions(prev => [...prev, user.id]);
    setShowMentionDropdown(false);
    setMentionQuery('');
    
    // Focus back to textarea
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  }, [content]);

  // Handle content change
  const handleContentChange = (value: string) => {
    setContent(value);

    // Handle mentions
    if (showMentions && mentions?.enabled) {
      const cursorPos = textareaRef.current?.selectionStart || 0;
      const beforeCursor = value.substring(0, cursorPos);
      const mentionMatch = beforeCursor.match(/@(\w*)$/);
      
      if (mentionMatch) {
        const query = mentionMatch[1];
        setMentionQuery(query);
        setShowMentionDropdown(true);
        handleMentionSearch(query);
      } else {
        setShowMentionDropdown(false);
      }
    }

    // Handle tags
    if (showTags && tags?.enabled) {
      const tagMatches = value.match(/#\w+/g) || [];
      const extractedTags = tagMatches.map(tag => tag.substring(1));
      setSelectedTags(extractedTags);
    }
  };

  // Render preview
  const renderPreview = () => {
    let previewContent = content;
    
    // Convert markdown-like formatting to HTML-like display
    previewContent = previewContent
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/^>\s(.*)$/gm, '<blockquote>$1</blockquote>')
      .replace(/^[\*\-\+]\s(.*)$/gm, '<li>$1</li>')
      .replace(/^\d+\.\s(.*)$/gm, '<li>$1</li>');

    return (
      <div 
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: previewContent }}
      />
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map(notification => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={cn(
                "p-4 rounded-lg shadow-lg",
                notification.type === 'success' && 'bg-green-100 text-green-800',
                notification.type === 'error' && 'bg-red-100 text-red-800',
                notification.type === 'info' && 'bg-blue-100 text-blue-800'
              )}
            >
              {notification.message}
            </motion.div>
          ))}
        </div>
      )}

      <Card className={cn("p-6", isExpanded && "min-h-[600px]")}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold">
                {isEditing ? 'Edit Reply' : parentReply ? 'Reply to Comment' : 'Add Reply'}
              </h3>
              {parentReply && (
                <Badge variant="outline" className="text-xs">
                  Replying to {parentReply.authorName}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {showWordCount && (
                <div className="text-sm text-gray-500 flex items-center gap-4">
                  <span>{metadata.wordCount} words</span>
                  <span>{metadata.characterCount}/{maxLength} characters</span>
                  {lastSaved && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Saved {lastSaved.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              )}
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Minimize' : 'Expand'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Author fields */}
          {showAuthorFields && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="author-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <Input
                  id="author-name"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Your name"
                  disabled={disabled}
                  className={errors.authorName ? 'border-red-500' : ''}
                />
                {errors.authorName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.authorName}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="author-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <Input
                  id="author-email"
                  type="email"
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  disabled={disabled}
                  className={errors.authorEmail ? 'border-red-500' : ''}
                />
                {errors.authorEmail && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.authorEmail}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Formatting toolbar */}
          {showFormatting && (
            <div className="flex items-center gap-1 p-2 border rounded-lg bg-gray-50">
              <Tooltip content="Bold">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting('bold')}
                  disabled={disabled}
                  className="p-2"
                >
                  <Bold className="w-4 h-4" />
                </Button>
              </Tooltip>
              
              <Tooltip content="Italic">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting('italic')}
                  disabled={disabled}
                  className="p-2"
                >
                  <Italic className="w-4 h-4" />
                </Button>
              </Tooltip>
              
              <Tooltip content="Link">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting('link')}
                  disabled={disabled}
                  className="p-2"
                >
                  <Link className="w-4 h-4" />
                </Button>
              </Tooltip>
              
              <Tooltip content="Quote">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting('quote')}
                  disabled={disabled}
                  className="p-2"
                >
                  <Quote className="w-4 h-4" />
                </Button>
              </Tooltip>
              
              <Tooltip content="Bullet List">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting('list')}
                  disabled={disabled}
                  className="p-2"
                >
                  <List className="w-4 h-4" />
                </Button>
              </Tooltip>
              
              <Tooltip content="Numbered List">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting('orderedList')}
                  disabled={disabled}
                  className="p-2"
                >
                  <ListOrdered className="w-4 h-4" />
                </Button>
              </Tooltip>
              
              <div className="w-px h-6 bg-gray-300 mx-2" />
              
              {showAttachments && (
                <Tooltip content="Attach Files">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {/* Open attachment modal */}}
                    disabled={disabled}
                    className="p-2"
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                </Tooltip>
              )}
              
              <Tooltip content="Emoji">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  disabled={disabled}
                  className="p-2"
                >
                  <Smile className="w-4 h-4" />
                </Button>
              </Tooltip>
              
              {templates && templates.length > 0 && (
                <Tooltip content="Templates">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                    disabled={disabled}
                    className="p-2"
                  >
                    <Type className="w-4 h-4" />
                  </Button>
                </Tooltip>
              )}
              
              <div className="flex-1" />
              
              {showPreview && (
                <Tooltip content={isPreviewMode ? 'Edit' : 'Preview'}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    disabled={disabled}
                    className="p-2"
                  >
                    {isPreviewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </Tooltip>
              )}
            </div>
          )}

          {/* Content area */}
          <div className="relative">
            {isPreviewMode ? (
              <div className={cn(
                "min-h-[120px] p-4 border rounded-lg bg-white",
                isExpanded && "min-h-[300px]"
              )}>
                {content ? renderPreview() : (
                  <p className="text-gray-500 italic">Nothing to preview yet...</p>
                )}
              </div>
            ) : (
              <>
                <TextArea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder={placeholder}
                  disabled={disabled}
                  rows={isExpanded ? 12 : 6}
                  className={cn(
                    "resize-none",
                    errors.content && 'border-red-500'
                  )}
                  maxLength={maxLength}
                />
                
                {/* Mention dropdown */}
                {showMentionDropdown && mentionResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {mentionQuery && (
                      <div className="px-4 py-2 text-xs text-gray-500 border-b">
                        Searching for &ldquo;@{mentionQuery}&rdquo;
                      </div>
                    )}
                    {mentionResults.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => insertMention(user)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                      >
                        {user.avatar ? (
                          <Image 
                            src={user.avatar} 
                            alt={user.name} 
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                        ) : (
                          <User className="w-6 h-6 text-gray-400" />
                        )}
                        <span>{user.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
            
            {errors.content && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.content}
              </p>
            )}
          </div>

          {/* Attachments */}
          {showAttachments && attachments.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Attachments</label>
              <div className="flex flex-wrap gap-2">
                {attachments.map((file) => (
                  <div key={file.id} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                    <ImageIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setAttachments(prev => prev.filter(f => f.id !== file.id))}
                      disabled={disabled}
                      className="p-1 h-auto"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {showTags && selectedTags.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Tags</label>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTags(prev => prev.filter((_, i) => i !== index))}
                      disabled={disabled}
                      className="p-0 h-auto ml-1"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Options */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4">
              {showPrivateToggle && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    disabled={disabled}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Private reply</span>
                </label>
              )}
              
              {isSaving && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={disabled || isSubmitting}
                >
                  {cancelButtonText}
                </Button>
              )}
              
              {onSave && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSave}
                  disabled={disabled || isSaving || !content.trim()}
                  className="flex items-center gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saveButtonText}
                </Button>
              )}
              
              {customButtons?.map((button, index) => (
                <Button
                  key={index}
                  type="button"
                  variant={button.variant || 'outline'}
                  onClick={() => button.action({
                    id: initialData?.id,
                    content,
                    authorName,
                    authorEmail,
                    parentId: parentReply?.id,
                    reviewId,
                    isPrivate,
                    attachments,
                    mentions: selectedMentions,
                    tags: selectedTags,
                    metadata,
                    formatting,
                    status: 'draft',
                    createdAt: initialData?.createdAt,
                    updatedAt: new Date()
                  })}
                  disabled={disabled || button.disabled}
                  className="flex items-center gap-2"
                >
                  {button.icon}
                  {button.label}
                </Button>
              ))}
              
              <Button
                type="submit"
                disabled={disabled || isSubmitting || !content.trim()}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {submitButtonText}
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Media Uploader Modal */}
      {showAttachments && (
        <MediaUploader
          onFilesChange={setAttachments}
          maxFiles={5}
          maxSize={10}
          acceptedTypes={['image/*', 'video/*', 'audio/*', 'application/pdf']}
          className="hidden" // Hidden by default, shown in modal
        />
      )}
    </div>
  );
};

export default ReplyForm;
