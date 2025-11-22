import { useState, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';

export interface CopyToClipboardState {
  value: string | null;
  isSupported: boolean;
  isCopied: boolean;
  error: Error | null;
}

export interface CopyToClipboardOptions {
  successMessage?: string;
  errorMessage?: string;
  resetDelay?: number;
  enableToasts?: boolean;
  format?: 'text/plain' | 'text/html';
}

export interface CopyToClipboardReturn extends CopyToClipboardState {
  copy: (text: string) => Promise<boolean>;
  reset: () => void;
}

// Fallback method for older browsers
const fallbackCopyToClipboard = (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Create a temporary textarea element
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    
    document.body.appendChild(textArea);
    
    try {
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        resolve();
      } else {
        reject(new Error('Copy command failed'));
      }
    } catch (error) {
      document.body.removeChild(textArea);
      reject(error instanceof Error ? error : new Error('Copy failed'));
    }
  });
};

export const useCopyToClipboard = (
  options: CopyToClipboardOptions = {}
): CopyToClipboardReturn => {
  const {
    successMessage = 'Copied to clipboard!',
    errorMessage = 'Failed to copy to clipboard',
    resetDelay = 2000,
    enableToasts = true,
    format = 'text/plain',
  } = options;

  const [state, setState] = useState<CopyToClipboardState>({
    value: null,
    isSupported: Boolean(navigator?.clipboard?.writeText || document?.execCommand),
    isCopied: false,
    error: null,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      isCopied: false,
      error: null,
    }));
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      if (!state.isSupported) {
        const error = new Error('Clipboard API not supported');
        setState(prev => ({ ...prev, error, isCopied: false }));
        
        if (enableToasts) {
          toast.error('Clipboard not supported in this browser');
        }
        
        return false;
      }

      // Reset previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      try {
        // Try modern clipboard API first
        if (navigator?.clipboard?.writeText) {
          if (format === 'text/html' && navigator?.clipboard?.write) {
            const clipboardItem = new ClipboardItem({
              'text/html': new Blob([text], { type: 'text/html' }),
              'text/plain': new Blob([text], { type: 'text/plain' }),
            });
            await navigator.clipboard.write([clipboardItem]);
          } else {
            await navigator.clipboard.writeText(text);
          }
        } else {
          // Fallback to execCommand
          await fallbackCopyToClipboard(text);
        }

        setState(prev => ({
          ...prev,
          value: text,
          isCopied: true,
          error: null,
        }));

        if (enableToasts) {
          toast.success(successMessage);
        }

        // Auto-reset after delay
        timeoutRef.current = setTimeout(() => {
          reset();
        }, resetDelay);

        return true;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Copy failed');
        
        setState(prev => ({
          ...prev,
          error: errorObj,
          isCopied: false,
        }));

        if (enableToasts) {
          toast.error(errorMessage);
        }

        return false;
      }
    },
    [state.isSupported, format, enableToasts, successMessage, errorMessage, resetDelay, reset]
  );

  // Cleanup timeout on unmount
  useState(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  });

  return {
    ...state,
    copy,
    reset,
  };
};

// Simple version for basic use cases
export const useCopyText = (resetDelay: number = 2000) => {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          setIsCopied(false);
        }, resetDelay);
        
        return true;
      } catch {
        return false;
      }
    },
    [resetDelay]
  );

  return { isCopied, copy };
};

export default useCopyToClipboard;