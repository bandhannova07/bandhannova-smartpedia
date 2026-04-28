'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ArrowRight, Sparkles, Clock } from 'lucide-react';
interface SearchInputProps {
    compact?: boolean;
    onFocusChange?: (focused: boolean) => void;
}

export default function SearchInput({ compact = false, onFocusChange }: SearchInputProps) {
    const placeholders = [
        "Search the world...",
        "Search everything...",
        "Explore deep knowledge...",
        "Find quick answers...",
        "Search anything...",
        "Discover insights...",
        "Browse the web..."
    ];

    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();
    const suggestRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Infinite placeholder rotation animation
    useEffect(() => {
        const interval = setInterval(() => {
            setIsTransitioning(true);
            setPlaceholderIndex((prev) => prev + 1);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (placeholderIndex === placeholders.length) {
            const timer = setTimeout(() => {
                setIsTransitioning(false);
                setPlaceholderIndex(0);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [placeholderIndex, placeholders.length]);

    // Pre-fill query from URL if on search page
    useEffect(() => {
        const q = searchParams.get('q');
        if (q) setQuery(q);
    }, [searchParams]);

    // Fetch suggestions as user types
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!isFocused || query.trim().length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            try {
                const res = await fetch(`/api/suggest?q=${encodeURIComponent(query.trim())}`);
                const data = await res.json();
                if (data.suggestions && data.suggestions.length > 0) {
                    setSuggestions(data.suggestions);
                    setShowSuggestions(true);
                } else {
                    setSuggestions([]);
                    setShowSuggestions(false);
                }
            } catch {
                setSuggestions([]);
            }
        }, 250);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (suggestRef.current && !suggestRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            setShowSuggestions(false);
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    const handleSelectSuggestion = (s: string) => {
        setQuery(s);
        setShowSuggestions(false);
        router.push(`/search?q=${encodeURIComponent(s)}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions || suggestions.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % suggestions.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => prev <= 0 ? suggestions.length - 1 : prev - 1);
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            handleSelectSuggestion(suggestions[selectedIndex]);
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    return (
        <div className="w-full max-w-2xl md:max-w-3xl relative" ref={suggestRef}>
            <form onSubmit={handleSearch} className="w-full">
                <div
                    className={`search-input-wrapper flex items-center w-full relative ${compact ? 'h-12' : 'h-14 md:h-16'
                        } ${isFocused ? 'animate-pulse-glow' : ''}`}
                >
                    <div className="grid place-items-center h-full w-12 md:w-14 flex-shrink-0">
                        {isFocused ? (
                            <Sparkles className="h-5 w-5 text-indigo-500 animate-scale-in" />
                        ) : (
                            <Search className="h-5 w-5 text-[var(--muted-light)]" />
                        )}
                    </div>

                    {/* Animated Placeholder Overlay */}
                    {!query && (
                        <div className="absolute left-12 md:left-14 right-12 top-0 bottom-0 pointer-events-none overflow-hidden text-[var(--muted-light)] font-medium text-base sm:text-lg md:text-xl z-0 pl-2">
                            <div
                                className={`flex flex-col h-full w-full ${isTransitioning ? 'transition-all duration-500 ease-in-out' : ''}`}
                                style={{ transform: `translateY(-${placeholderIndex * 100}%)` }}
                            >
                                {[...placeholders, placeholders[0]].map((ph, idx) => (
                                    <div key={idx} className="h-full flex items-center flex-shrink-0">
                                        {ph}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <input
                        className={`h-full w-full outline-none bg-transparent font-medium text-[var(--foreground)] z-10 pl-2 pr-10 ${compact ? 'text-base' : 'text-lg md:text-xl'
                            }`}
                        type="text"
                        id="smartpedia-search"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(-1);
                        }}
                        onFocus={() => {
                            setIsFocused(true);
                            if (suggestions.length > 0) setShowSuggestions(true);
                            if (onFocusChange) onFocusChange(true);
                        }}
                        onBlur={() => {
                            setIsFocused(false);
                            if (onFocusChange) onFocusChange(false);
                        }}
                        onKeyDown={handleKeyDown}
                        autoComplete="off"
                    />

                    {query.trim() && (
                        <button
                            type="submit"
                            className="flex-shrink-0 mr-2 w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 
                flex items-center justify-center text-white shadow-md shadow-indigo-500/25
                hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-105
                transition-all duration-200 cursor-pointer animate-scale-in"
                        >
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </form>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-2 py-2.5 rounded-xl bg-[var(--card)]/80 backdrop-blur-xl border border-[var(--card-border)] shadow-2xl shadow-indigo-500/10 overflow-hidden animate-fade-in max-h-[60vh] overflow-y-auto flex flex-col">
                    <div className="px-2 py-1 flex flex-col gap-0.5 w-full">
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                onMouseDown={() => handleSelectSuggestion(s)}
                                className={`w-full flex items-center gap-3 px-3.5 py-3 text-sm text-left rounded-xl transition-all duration-200 cursor-pointer ${i === selectedIndex
                                    ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm'
                                    : 'text-[var(--foreground)] hover:bg-[var(--card-border)]/30 hover:translate-x-1'
                                    }`}
                            >
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0 ${i === selectedIndex ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25' : 'bg-[var(--card-border)]/40 text-[var(--muted)]'}`}>
                                    <Search className="w-3.5 h-3.5" />
                                </div>
                                <span className="truncate flex-1">{s}</span>
                            </button>
                        ))}
                    </div>

                    {/* Keyboard Shortcuts Hint */}
                    <div className="px-4 py-2 mt-1 border-t border-[var(--card-border)]/40 flex items-center justify-between text-[10px] font-bold text-[var(--muted-light)] select-none">
                        <span>Search results</span>
                        <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-[var(--card-border)]/40">↑↓</span>
                            <span>navigate</span>
                            <span className="px-1.5 py-0.5 rounded bg-[var(--card-border)]/40 ml-1">↵</span>
                            <span>select</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
