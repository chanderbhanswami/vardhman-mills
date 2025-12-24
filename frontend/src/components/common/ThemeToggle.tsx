'use client';

import * as React from 'react';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

export function ThemeToggle() {
    const { theme, setTheme, toggleTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className="w-9 h-9 opacity-0">
                <span className="sr-only">Toggle theme</span>
            </Button>
        );
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="w-9 h-9 relative text-gray-800 hover:bg-gray-100 hover:text-black cursor-pointer pointer-events-auto"
            aria-label="Toggle theme"
        >
            <motion.div
                initial={false}
                animate={{
                    scale: resolvedTheme === 'dark' ? 0 : 1,
                    rotate: resolvedTheme === 'dark' ? 90 : 0,
                }}
                transition={{ duration: 0.2 }}
                className="absolute"
            >
                <SunIcon className="h-5 w-5 text-gray-800" />
            </motion.div>
            <motion.div
                initial={false}
                animate={{
                    scale: resolvedTheme === 'dark' ? 1 : 0,
                    rotate: resolvedTheme === 'dark' ? 0 : -90,
                }}
                transition={{ duration: 0.2 }}
                className="absolute"
            >
                <MoonIcon className="h-5 w-5 text-gray-800" />
            </motion.div>
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
