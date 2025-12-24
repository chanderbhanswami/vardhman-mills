'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, BellIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';

interface NotifyMeDialogProps {
    isOpen: boolean;
    onClose: () => void;
    productName: string;
    onSubmit: (email: string) => void;
}

export const NotifyMeDialog: React.FC<NotifyMeDialogProps> = ({
    isOpen,
    onClose,
    productName,
    onSubmit,
}) => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            onSubmit(email);
            setIsSuccess(true);
            setIsSubmitting(false);

            // Auto close after success
            setTimeout(() => {
                onClose();
                setIsSuccess(false);
                setEmail('');
            }, 2000);
        }, 1000);
    };

    if (!isOpen || typeof document === 'undefined') return null;

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            />

            {/* Dialog */}
            <AnimatePresence>
                <motion.div
                    className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-gray-100 dark:border-gray-700"
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors bg-transparent rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 z-10"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>

                    {/* Content */}
                    <div className="p-6 pt-8">
                        {isSuccess ? (
                            <div className="flex flex-col items-center justify-center text-center py-8">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    You're on the list!
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    We'll email you at <strong>{email}</strong> as soon as this item is back in stock.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col items-center text-center mb-6">
                                    <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-4">
                                        <BellIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                        Waitlist Request
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Get notified when <strong>{productName}</strong> is back in stock.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full py-2.5 font-semibold"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Notify Me'}
                                    </Button>

                                    <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                                        We'll only use your email to send this one-time notification.
                                    </p>
                                </form>
                            </>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>,
        document.body
    );
};
