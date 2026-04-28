'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, FileText, ExternalLink } from 'lucide-react';

interface SearchResultCardProps {
    title: string;
    url: string;
    snippet: string;
    index?: number;
}

export default function SearchResultCard({ title, url, snippet, index = 0 }: SearchResultCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Extract category from title if present (added in searchLogic.ts)
    const categoryMatch = title.match(/^\[(.*?)\] (.*)/);
    const category = categoryMatch ? categoryMatch[1].toLowerCase() : 'web';
    const displayTitle = categoryMatch ? categoryMatch[2] : title;

    // Check if we have full content injected
    const hasFullContent = snippet.startsWith('[FULL CONTENT]');

    // Clean up snippet for display
    const displaySnippet = hasFullContent
        ? snippet.replace('[FULL CONTENT]', '').trim().slice(0, 250) + '...'
        : snippet.slice(0, 250);

    // Extract domain
    let domain = url;
    let favicon = '';
    try {
        const urlObj = new URL(url);
        domain = urlObj.hostname.replace('www.', '');
        favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
        // fallback
    }

    // Reliability calculation (heuristic)
    const reliability = {
        score: 'High',
        color: 'text-green-500 bg-green-500/10'
    };

    if (category === 'academia' || domain.includes('en.wikipedia.org') || domain.includes('.gov') || domain.includes('.edu')) {
        reliability.score = 'High';
        reliability.color = 'text-green-500 bg-green-500/10';
    } else if (category === 'community' || domain.includes('medium.com')) {
        reliability.score = 'Community';
        reliability.color = 'text-amber-500 bg-amber-500/10';
    } else {
        reliability.score = 'Standard';
        reliability.color = 'text-blue-500 bg-blue-500/10';
    }

    return (
        <div
            className="group py-5 border-b border-[var(--card-border)] last:border-0 animate-fade-in-up opacity-0"
            style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}
        >
            <div className="flex flex-wrap items-center gap-3 mb-2">
                {/* Favicon & Domain */}
                <div className="flex items-center gap-2 text-[13px] text-[var(--muted)]">
                    {favicon && (
                        <img
                            src={favicon}
                            alt=""
                            className="w-4 h-4 rounded-sm"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                    )}
                    <span className="truncate font-medium">{domain}</span>
                </div>

                {/* Category Badge */}
                {category !== 'web' && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter
                        ${category === 'academia' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' :
                            category === 'community' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300' :
                                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                        {category}
                    </span>
                )}
            </div>

            {/* Title */}
            <Link href={url} target="_blank" className="group/link inline-flex items-start gap-1">
                <h3 className="text-[19px] font-semibold text-indigo-600 dark:text-indigo-400 group-hover/link:text-indigo-500 dark:group-hover/link:text-indigo-300 decoration-indigo-400/50 leading-tight transition-colors">
                    {displayTitle}
                </h3>
                <ExternalLink className="w-4 h-4 mt-1 text-indigo-400 opacity-0 group-hover/link:opacity-100 transition-opacity flex-shrink-0" />
            </Link>

            {/* Snippet */}
            <p className="text-[var(--muted)] text-[15px] leading-relaxed mt-2 line-clamp-2">
                {displaySnippet}
            </p>

            {/* Full Content Toggle */}
            {hasFullContent && (
                <div className="mt-3.5">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold
              bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300
              hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all cursor-pointer border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
                    >
                        {isExpanded ? (
                            <>
                                <ChevronUp className="w-4 h-4" />
                                Hide Deep Analysis
                            </>
                        ) : (
                            <>
                                <FileText className="w-4 h-4" />
                                View Deep Scraped Data
                                <span className="ml-1 text-[9px] font-bold bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-tighter">
                                    <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                                    Live Content
                                </span>
                            </>
                        )}
                    </button>

                    {isExpanded && (
                        <div className="mt-3 p-5 rounded-2xl bg-[var(--card)] border border-[var(--card-border)] text-[14px] text-[var(--foreground)] leading-relaxed whitespace-pre-wrap animate-scale-in max-h-[500px] overflow-y-auto shadow-xl shadow-black/5 dark:shadow-none">
                            <div className="flex items-center gap-2 mb-3 text-[10px] font-bold text-[var(--muted-light)] uppercase tracking-widest pl-1">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                Raw Scraped Data from {domain}
                            </div>
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                {snippet.replace('[FULL CONTENT]', '')}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
