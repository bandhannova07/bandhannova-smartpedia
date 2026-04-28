'use client';

import { useState } from 'react';
import { Bookmark, Share2, ExternalLink, Check, BookOpen, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface KnowledgeCardProps {
    title: string;
    summary: string;
    sources: { title: string; url: string }[];
    query: string;
    relatedTopics?: string[];
    className?: string;
}

export default function KnowledgeCard({ title, summary, sources, query, relatedTopics = [], className = '' }: KnowledgeCardProps) {
    const [isSaved, setIsSaved] = useState(false);
    const [showShareToast, setShowShareToast] = useState(false);

    const handleSave = () => {
        // Save to localStorage
        const cards = JSON.parse(localStorage.getItem('smartpedia_cards') || '[]');
        const newCard = {
            id: Date.now().toString(),
            title,
            summary,
            sources,
            query,
            relatedTopics,
            savedAt: new Date().toISOString(),
        };
        cards.push(newCard);
        localStorage.setItem('smartpedia_cards', JSON.stringify(cards));
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    const handleShare = async () => {
        const shareText = `${title}\n\n${summary.slice(0, 200)}...\n\nSearched on BandhanNova Smartpedia`;

        if (navigator.share) {
            try {
                await navigator.share({ title, text: shareText });
            } catch {
                // User cancelled or error
            }
        } else {
            // Fallback: copy to clipboard
            await navigator.clipboard.writeText(shareText);
            setShowShareToast(true);
            setTimeout(() => setShowShareToast(false), 2000);
        }
    };

    return (
        <div className={`card-premium p-5 relative ${className}`}>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
                        <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-[var(--foreground)] text-base leading-tight">{title}</h3>
                        <p className="text-[11px] text-[var(--muted)] mt-0.5">Knowledge Card</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleSave}
                        className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${isSaved
                                ? 'bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400'
                                : 'hover:bg-[var(--card-border)] text-[var(--muted)]'
                            }`}
                        title={isSaved ? 'Saved!' : 'Save Knowledge Card'}
                    >
                        {isSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={handleShare}
                        className="p-2 rounded-lg hover:bg-[var(--card-border)] text-[var(--muted)] transition-all duration-200 cursor-pointer relative"
                        title="Share"
                    >
                        <Share2 className="w-4 h-4" />
                        {showShareToast && (
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-medium bg-[var(--foreground)] text-[var(--background)] px-2 py-1 rounded-md whitespace-nowrap animate-fade-in-up">
                                Copied!
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Summary */}
            <div className="text-sm text-[var(--foreground)] leading-relaxed mb-4 ai-prose">
                <ReactMarkdown>{summary.length > 500 ? summary.slice(0, 500) + '...' : summary}</ReactMarkdown>
            </div>

            {/* Sources */}
            {sources.length > 0 && (
                <div className="mb-4">
                    <p className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">Sources</p>
                    <div className="flex flex-wrap gap-1.5">
                        {sources.slice(0, 4).map((source, i) => (
                            <a
                                key={i}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md
                  bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300
                  hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                            >
                                <ExternalLink className="w-3 h-3" />
                                <span className="truncate max-w-[120px]">{source.title}</span>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Related Topics */}
            {relatedTopics.length > 0 && (
                <div>
                    <p className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Tag className="w-3 h-3" /> Related Topics
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {relatedTopics.map((topic, i) => (
                            <span
                                key={i}
                                className="text-[11px] px-2 py-0.5 rounded-full
                  bg-[var(--card-border)] text-[var(--muted)]"
                            >
                                {topic}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
