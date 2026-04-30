'use client';

import { useState, useRef } from 'react';
import { ChevronDown, ExternalLink, BookOpen } from 'lucide-react';

function decodeHtmlEntities(text: string) {
    if (!text) return '';
    return text
        .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
        .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
}

interface WikipediaResult {
    id: string | null;
    title: string;
    url: string;
    snippet: string;
}

interface WikipediaSectionProps {
    results: WikipediaResult[];
}

export default function WikipediaSection({ results }: WikipediaSectionProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSnippetExpanded, setIsSnippetExpanded] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);

    if (!results || results.length === 0) return null;

    const mainResult = results[0];
    const moreResults = results.slice(1);

    const snippetText = decodeHtmlEntities(mainResult.snippet);
    const shouldTruncate = snippetText.length > 300;

    const handleToggleSnippet = () => {
        if (isSnippetExpanded) {
            // Smooth scroll to the absolute top of the page
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        setIsSnippetExpanded(!isSnippetExpanded);
    };

    return (
        <div ref={sectionRef} className="wiki-section animate-fade-in-up mb-6">
            {/* Main Wikipedia Result */}
            <div className="wiki-main-card">
                <div className="flex items-start gap-3">
                    {/* Wikipedia Icon */}
                    <div className="wiki-icon-container">
                        <BookOpen className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </div>

                    <div className="flex-1 min-w-0">
                        {/* Label */}
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">
                                Wikipedia
                            </span>
                            <span className="wiki-badge">
                                <span className="w-1 h-1 rounded-full bg-green-500" />
                                Verified Source
                            </span>
                        </div>

                        {/* Title */}
                        <a
                            href={mainResult.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/wiki inline-flex items-start gap-1.5"
                        >
                            <h3 className="text-[17px] font-bold text-slate-900 dark:text-white group-hover/wiki:text-indigo-600 dark:group-hover/wiki:text-indigo-400 transition-colors leading-snug">
                                {decodeHtmlEntities(mainResult.title)}
                            </h3>
                            <ExternalLink className="w-3.5 h-3.5 mt-1 text-gray-400 opacity-0 group-hover/wiki:opacity-100 transition-opacity flex-shrink-0" />
                        </a>

                        {/* Snippet */}
                        <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed mt-1.5">
                            {(!isSnippetExpanded && shouldTruncate) 
                                ? snippetText.slice(0, 300).trim() 
                                : snippetText}
                            {shouldTruncate && (
                                <button 
                                    onClick={handleToggleSnippet}
                                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer ml-0.5 inline select-none"
                                >
                                    {isSnippetExpanded ? ' Show Less' : '... Read More'}
                                </button>
                            )}
                        </p>

                        {/* URL */}
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5 truncate">
                            {mainResult.url}
                        </p>
                    </div>
                </div>
            </div>

            {/* View More Button */}
            {moreResults.length > 0 && (
                <div className="mt-2">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="wiki-expand-btn"
                    >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>
                            {isExpanded
                                ? 'Hide Wikipedia results'
                                : `View ${moreResults.length} more result${moreResults.length > 1 ? 's' : ''} from Wikipedia`
                            }
                        </span>
                        <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {/* Dropdown */}
                    <div className={`wiki-dropdown ${isExpanded ? 'wiki-dropdown-open' : 'wiki-dropdown-closed'}`}>
                        <div className="wiki-dropdown-inner">
                            {moreResults.map((result, i) => (
                                <a
                                    key={result.id || i}
                                    href={result.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="wiki-dropdown-item group/item"
                                    style={{ animationDelay: isExpanded ? `${i * 60}ms` : '0ms' }}
                                >
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <BookOpen className="w-3 h-3 text-gray-400 group-hover/item:text-indigo-500 transition-colors flex-shrink-0" />
                                        <h4 className="text-[14px] font-semibold text-slate-800 dark:text-white group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400 transition-colors truncate">
                                            {decodeHtmlEntities(result.title)}
                                        </h4>
                                    </div>
                                    <p className="text-[12px] text-gray-500 dark:text-gray-400 pl-5">
                                        {decodeHtmlEntities(result.snippet)}
                                    </p>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
