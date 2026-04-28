'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem('smartpedia-theme');
        if (stored === 'dark') {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        } else if (stored === 'light') {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        } else {
            // Follow system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDark(prefersDark);
            if (prefersDark) document.documentElement.classList.add('dark');
        }
    }, []);

    const toggle = () => {
        const newDark = !isDark;
        setIsDark(newDark);
        if (newDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('smartpedia-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('smartpedia-theme', 'light');
        }
    };

    if (!mounted) {
        return <div className="w-9 h-9 rounded-xl bg-[var(--card)] border border-[var(--card-border)] animate-pulse" />;
    }

    return (
        <button
            onClick={toggle}
            className="relative w-9 h-9 rounded-xl bg-[var(--card)] border border-[var(--card-border)]
                flex items-center justify-center
                hover:border-indigo-400 hover:shadow-md hover:shadow-indigo-500/10
                transition-all duration-300 cursor-pointer group"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
        >
            <Sun className={`w-4 h-4 absolute transition-all duration-300 ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100 text-amber-500'
                }`} />
            <Moon className={`w-4 h-4 absolute transition-all duration-300 ${isDark ? 'opacity-100 rotate-0 scale-100 text-indigo-400' : 'opacity-0 -rotate-90 scale-0'
                }`} />
        </button>
    );
}
