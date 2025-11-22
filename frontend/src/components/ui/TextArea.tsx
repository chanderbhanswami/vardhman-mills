'use client';

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// TextArea variants
const textAreaVariants = cva(
  'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-input',
        outline: 'border-2 border-input',
        filled: 'border-transparent bg-muted',
        ghost: 'border-transparent bg-transparent hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        sm: 'min-h-[60px] px-2 py-1 text-xs',
        default: 'min-h-[80px] px-3 py-2 text-sm',
        lg: 'min-h-[120px] px-4 py-3 text-base',
        xl: 'min-h-[160px] px-4 py-3 text-base',
      },
      resize: {
        none: 'resize-none',
        vertical: 'resize-y',
        horizontal: 'resize-x',
        both: 'resize',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      resize: 'vertical',
    },
  }
);

export interface TextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textAreaVariants> {
  error?: boolean;
  success?: boolean;
  helperText?: string;
  errorText?: string;
  successText?: string;
  label?: string;
  required?: boolean;
  maxLength?: number;
  showCharacterCount?: boolean;
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({
    className,
    variant = 'default',
    size = 'default',
    resize = 'vertical',
    error = false,
    success = false,
    helperText,
    errorText,
    successText,
    label,
    required = false,
    maxLength,
    showCharacterCount = false,
    autoResize = false,
    minRows = 3,
    maxRows = 10,
    value,
    defaultValue,
    onChange,
    id,
    ...props
  }, ref) => {
    const textAreaId = React.useId();
    const [internalValue, setInternalValue] = React.useState(defaultValue || '');
    const [rows, setRows] = React.useState(minRows);
    const textAreaRef = React.useRef<HTMLTextAreaElement>(null);

    // Use provided ref or internal ref
    const finalRef = ref || textAreaRef;

    const currentValue = value !== undefined ? value : internalValue;
    const characterCount = String(currentValue).length;

    // Auto-resize functionality
    const adjustHeight = React.useCallback(() => {
      const element = finalRef && 'current' in finalRef ? finalRef.current : null;
      if (element && autoResize) {
        element.style.height = 'auto';
        const scrollHeight = element.scrollHeight;
        const lineHeight = parseInt(getComputedStyle(element).lineHeight);
        const newRows = Math.max(minRows, Math.min(maxRows, Math.ceil(scrollHeight / lineHeight)));
        setRows(newRows);
        element.style.height = `${scrollHeight}px`;
      }
    }, [autoResize, minRows, maxRows, finalRef]);

    React.useEffect(() => {
      if (autoResize) {
        adjustHeight();
      }
    }, [currentValue, autoResize, adjustHeight]);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = event.target.value;
      
      if (maxLength && newValue.length > maxLength) {
        return;
      }

      if (value === undefined) {
        setInternalValue(newValue);
      }

      onChange?.(event);
      
      if (autoResize) {
        adjustHeight();
      }
    };

    // Use id or generated textAreaId for form association
    const helperTextId = `${textAreaId}-helper`;
    const errorTextId = `${textAreaId}-error`;
    const successTextId = `${textAreaId}-success`;

    const displayHelperText = errorText || successText || helperText;
    const helperTextColor = error 
      ? 'text-destructive' 
      : success 
      ? 'text-green-600' 
      : 'text-muted-foreground';

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={textAreaId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          <textarea
            id={id || textAreaId}
            ref={finalRef}
            className={cn(
              textAreaVariants({ variant, size, resize }),
              error && 'border-destructive focus-visible:ring-destructive',
              success && 'border-green-500 focus-visible:ring-green-500',
              autoResize && 'resize-none overflow-hidden',
              className
            )}
            value={currentValue}
            onChange={handleChange}
            rows={autoResize ? rows : props.rows}
            maxLength={maxLength}
            required={required}
            aria-describedby={cn(
              displayHelperText && helperTextId,
              error && errorTextId,
              success && successTextId
            )}
            {...(error !== undefined && { 'aria-invalid': error ? 'true' : 'false' })}
            {...props}
          />
          
          {showCharacterCount && maxLength && (
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              {characterCount}/{maxLength}
            </div>
          )}
        </div>

        {displayHelperText && (
          <p
            id={error ? errorTextId : success ? successTextId : helperTextId}
            className={cn('text-xs', helperTextColor)}
          >
            {errorText || successText || helperText}
          </p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

// Auto-resizing TextArea
export interface AutoResizeTextAreaProps extends Omit<TextAreaProps, 'autoResize' | 'resize'> {
  minRows?: number;
  maxRows?: number;
}

export const AutoResizeTextArea = forwardRef<HTMLTextAreaElement, AutoResizeTextAreaProps>(
  ({ minRows = 3, maxRows = 10, ...props }, ref) => {
    return (
      <TextArea
        {...props}
        ref={ref}
        autoResize
        resize="none"
        minRows={minRows}
        maxRows={maxRows}
      />
    );
  }
);

AutoResizeTextArea.displayName = 'AutoResizeTextArea';

// Controlled TextArea with validation
export interface ControlledTextAreaProps extends Omit<TextAreaProps, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  validator?: (value: string) => string | null;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export const ControlledTextArea = forwardRef<HTMLTextAreaElement, ControlledTextAreaProps>(
  ({
    value,
    onChange,
    validator,
    validateOnChange = false,
    validateOnBlur = true,
    error: externalError,
    errorText: externalErrorText,
    ...props
  }, ref) => {
    const [validationError, setValidationError] = React.useState<string | null>(null);
    const [touched, setTouched] = React.useState(false);

    const validateValue = React.useCallback((val: string) => {
      if (validator) {
        const error = validator(val);
        setValidationError(error);
        return error;
      }
      return null;
    }, [validator]);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = event.target.value;
      onChange(newValue);

      if (validateOnChange || touched) {
        validateValue(newValue);
      }
    };

    const handleBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
      setTouched(true);
      if (validateOnBlur) {
        validateValue(value);
      }
      props.onBlur?.(event);
    };

    const hasError = externalError || (touched && validationError !== null);
    const errorMessage = externalErrorText || validationError;

    return (
      <TextArea
        {...props}
        ref={ref}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        error={hasError}
        errorText={errorMessage || undefined}
      />
    );
  }
);

ControlledTextArea.displayName = 'ControlledTextArea';

// TextArea with mention support
export interface MentionTextAreaProps extends TextAreaProps {
  mentions?: Array<{
    id: string;
    display: string;
    avatar?: string;
  }>;
  onMentionSearch?: (search: string) => void;
  mentionTrigger?: string;
  renderMention?: (mention: { id: string; display: string; avatar?: string }) => React.ReactNode;
}

export const MentionTextArea = forwardRef<HTMLTextAreaElement, MentionTextAreaProps>(
  ({
    mentions = [],
    onMentionSearch,
    mentionTrigger = '@',
    // renderMention prop reserved for custom mention rendering
    value,
    onChange,
    ...props
  }, ref) => {
    const [showMentions, setShowMentions] = React.useState(false);
    const [mentionQuery, setMentionQuery] = React.useState('');
    const [cursorPosition, setCursorPosition] = React.useState(0);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = event.target.value;
      const position = event.target.selectionStart;
      
      // Check for mention trigger
      const textBeforeCursor = newValue.slice(0, position);
      const lastTriggerIndex = textBeforeCursor.lastIndexOf(mentionTrigger);
      
      if (lastTriggerIndex !== -1) {
        const query = textBeforeCursor.slice(lastTriggerIndex + 1);
        if (!query.includes(' ') && !query.includes('\n')) {
          setMentionQuery(query);
          setShowMentions(true);
          onMentionSearch?.(query);
        } else {
          setShowMentions(false);
        }
      } else {
        setShowMentions(false);
      }

      setCursorPosition(position);
      onChange?.(event);
    };

    const insertMention = (mention: { id: string; display: string }) => {
      if (!value) return;
      
      const textBeforeCursor = String(value).slice(0, cursorPosition);
      const textAfterCursor = String(value).slice(cursorPosition);
      const lastTriggerIndex = textBeforeCursor.lastIndexOf(mentionTrigger);
      
      if (lastTriggerIndex !== -1) {
        const beforeMention = textBeforeCursor.slice(0, lastTriggerIndex);
        const newValue = `${beforeMention}${mentionTrigger}${mention.display} ${textAfterCursor}`;
        
        // Create synthetic event
        const syntheticEvent = {
          target: { value: newValue }
        } as React.ChangeEvent<HTMLTextAreaElement>;
        
        onChange?.(syntheticEvent);
        setShowMentions(false);
      }
    };

    const filteredMentions = mentions.filter(mention =>
      mention.display.toLowerCase().includes(mentionQuery.toLowerCase())
    );

    return (
      <div className="relative">
        <TextArea
          {...props}
          ref={ref}
          value={value}
          onChange={handleChange}
        />
        
        {showMentions && filteredMentions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto bg-popover border border-border rounded-md shadow-md">
            {filteredMentions.map((mention) => (
              <div
                key={mention.id}
                className="flex items-center px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground"
                onClick={() => insertMention(mention)}
              >
                {mention.avatar && (
                  <div 
                    className="w-6 h-6 rounded-full mr-2 bg-muted flex items-center justify-center text-xs font-semibold"
                    title={mention.display}
                    aria-label={mention.display}
                  >
                    {mention.display.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm">{mention.display}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

MentionTextArea.displayName = 'MentionTextArea';

export default TextArea;

