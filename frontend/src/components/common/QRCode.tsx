'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDownTrayIcon,
  ShareIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import CopyToClipboard from './CopyToClipboard';

export interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
  variant?: 'default' | 'minimal' | 'bordered' | 'rounded';
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
  bgColor?: string;
  fgColor?: string;
  level?: 'L' | 'M' | 'Q' | 'H';
  showActionsButtons?: boolean;
  showValue?: boolean;
  downloadFileName?: string;
  title?: string;
  description?: string;
  onGenerated?: (dataUrl: string) => void;
  onError?: (error: Error) => void;
}

const QRCode: React.FC<QRCodeProps> = ({
  value,
  size = 200,
  className = '',
  variant = 'default',
  errorCorrectionLevel = 'M',
  includeMargin = true,
  bgColor = '#FFFFFF',
  fgColor = '#000000',
  showActionsButtons = true,
  showValue = true,
  downloadFileName = 'qrcode',
  title,
  description,
  onGenerated,
  onError,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showActionsState, setShowActionsState] = useState(false);

  const generateQRCode = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!canvasRef.current || !value) {
        throw new Error('Canvas or value not available');
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Set canvas dimensions
      canvas.width = size;
      canvas.height = size;

      // For now, we'll create a simple placeholder pattern
      // In a real implementation, you'd use a QR code library like 'qrcode'
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, size);
      
      ctx.fillStyle = fgColor;
      
      // Create a simple grid pattern as placeholder
      const cellSize = Math.floor(size / 25);
      const margin = includeMargin ? cellSize * 2 : 0;
      const qrSize = size - (margin * 2);
      const cellCount = Math.floor(qrSize / cellSize);
      
      // Draw finder patterns (corners)
      const drawFinderPattern = (x: number, y: number) => {
        ctx.fillRect(x, y, cellSize * 7, cellSize * 7);
        ctx.fillStyle = bgColor;
        ctx.fillRect(x + cellSize, y + cellSize, cellSize * 5, cellSize * 5);
        ctx.fillStyle = fgColor;
        ctx.fillRect(x + cellSize * 2, y + cellSize * 2, cellSize * 3, cellSize * 3);
      };
      
      drawFinderPattern(margin, margin);
      drawFinderPattern(margin + qrSize - cellSize * 7, margin);
      drawFinderPattern(margin, margin + qrSize - cellSize * 7);
      
      // Draw data pattern (simplified) - using error correction level for pattern density
      const patternDensity = errorCorrectionLevel === 'L' ? 2 : errorCorrectionLevel === 'M' ? 3 : errorCorrectionLevel === 'Q' ? 4 : 5;
      
      for (let i = 0; i < cellCount; i++) {
        for (let j = 0; j < cellCount; j++) {
          // Skip finder patterns
          if (
            (i < 9 && j < 9) ||
            (i < 9 && j > cellCount - 9) ||
            (i > cellCount - 9 && j < 9)
          ) {
            continue;
          }
          
          // Create pattern based on value hash and error correction level
          const hash = value.charCodeAt((i + j) % value.length) + i * j;
          if (hash % patternDensity === 0) {
            ctx.fillRect(
              margin + i * cellSize,
              margin + j * cellSize,
              cellSize,
              cellSize
            );
          }
        }
      }
      
      const dataUrl = canvas.toDataURL('image/png');
      setQrDataUrl(dataUrl);
      onGenerated?.(dataUrl);
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate QR code';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      setIsLoading(false);
    }
  }, [value, size, bgColor, fgColor, includeMargin, errorCorrectionLevel, onGenerated, onError]);

  useEffect(() => {
    if (value) {
      generateQRCode();
    }
  }, [generateQRCode, value]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    
    const link = document.createElement('a');
    link.download = `${downloadFileName}.png`;
    link.href = qrDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!qrDataUrl) return;
    
    try {
      // Convert data URL to blob
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      
      if (navigator.share) {
        const file = new File([blob], `${downloadFileName}.png`, { type: 'image/png' });
        await navigator.share({
          title: title || 'QR Code',
          text: description || `QR Code for: ${value}`,
          files: [file],
        });
      } else {
        // Fallback to copying the value
        await navigator.clipboard.writeText(value);
      }
    } catch (err) {
      console.error('Error sharing QR code:', err);
    }
  };

  const variantClasses = {
    default: '',
    minimal: 'border-0',
    bordered: 'border-2 border-gray-300 dark:border-gray-600',
    rounded: 'rounded-lg border border-gray-200 dark:border-gray-700',
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut' as const,
      },
    },
  };

  const actionsVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
        staggerChildren: 0.05,
      },
    },
  };

  const actionItemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.2 },
    },
  };

  if (error) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`inline-flex flex-col items-center p-4 ${className}`}
      >
        <div className="flex items-center justify-center w-48 h-48 bg-red-50 dark:bg-red-900/20 border-2 border-dashed border-red-300 dark:border-red-700 rounded-lg">
          <div className="text-center">
            <ExclamationCircleIcon className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">QR Code Error</p>
            <p className="text-xs text-red-500 dark:text-red-300 mt-1">{error}</p>
          </div>
        </div>
        
        <motion.button
          onClick={generateQRCode}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Retry
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`inline-flex flex-col items-center ${className}`}
      onMouseEnter={() => setShowActionsState(true)}
      onMouseLeave={() => setShowActionsState(false)}
    >
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
      )}
      
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center max-w-xs">
          {description}
        </p>
      )}
      
      <div className={`relative ${variantClasses[variant]} bg-white p-2`}>
        {isLoading ? (
          <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded`}>
            <motion.div
              className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className={`block ${variant === 'rounded' ? 'rounded' : ''}`}
            width={size}
            height={size}
          />
        )}
        
        {/* Action buttons overlay */}
        <AnimatePresence>
          {showActionsButtons && showActionsState && !isLoading && (
            <motion.div
              variants={actionsVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center gap-2 rounded-lg"
            >
              <motion.button
                variants={actionItemVariants}
                onClick={handleDownload}
                className="p-2 bg-white/90 hover:bg-white text-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Download QR Code"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
              </motion.button>
              
              <motion.div variants={actionItemVariants}>
                <CopyToClipboard
                  text={value}
                  variant="icon"
                  className="p-2 bg-white/90 hover:bg-white text-gray-700 rounded-lg"
                  successMessage="Copied!"
                />
              </motion.div>
              
              <motion.button
                variants={actionItemVariants}
                onClick={handleShare}
                className="p-2 bg-white/90 hover:bg-white text-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Share QR Code"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ShareIcon className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {showValue && value && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 max-w-xs"
        >
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center break-all">
            {value.length > 50 ? `${value.substring(0, 47)}...` : value}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default QRCode;