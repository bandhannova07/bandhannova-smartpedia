'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import SearchInput from '@/components/SearchInput';
import AIAnswerCard from '@/components/AIAnswerCard';
import SearchResultCard from '@/components/SearchResultCard';
import WikipediaSection from '@/components/WikipediaSection';
import KnowledgeCard from '@/components/KnowledgeCard';
import ThemeToggle from '@/components/ThemeToggle';
import type { AnswerMode } from '@/components/AnswerModeSelector';
import Footer from '@/components/Footer';
import PerspectiveSwitch, { Perspective } from '@/components/PerspectiveSwitch';
import { BookmarkPlus, X, RefreshCw, Image as ImageIcon, Search, ExternalLink, Download, MapPin } from 'lucide-react';

interface SearchResultData {
    id: string | null;
    title: string;
    url: string;
    snippet: string;
    img_src?: string;
    thumbnail_src?: string;
    publishedDate?: string;
}

interface InfoboxData {
    infobox: string;
    content?: string;
    img_src?: string;
    urls?: { title: string; url: string }[];
}

interface SearchResponse {
    query: string;
    mode: AnswerMode;
    knowledgeResults: SearchResultData[];
    webResults: SearchResultData[];
    metaResults: SearchResultData[];
    aiAnswer: string;
    followUpQuestions: string[];
    suggestions: string[];
    infoboxes: InfoboxData[];
    sources: { title: string; url: string }[];
    timestamp: string;
}

function getDomain(url: string): string {
    try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
}
function getFavicon(url: string): string {
    try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`; } catch { return ''; }
}

function formatNewsDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;

        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
        return dateStr;
    }
}

function getYoutubeId(url: string) {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const mode = (searchParams.get('mode') as AnswerMode) || 'detailed';

    const [data, setData] = useState<SearchResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPerspectiveLoading, setIsPerspectiveLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [showKnowledgeCard, setShowKnowledgeCard] = useState(false);
    const [perspective, setPerspective] = useState<Perspective>('fact');
    const [activeCategory, setActiveCategory] = useState<string>('general');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [selectedImage, setSelectedImage] = useState<SearchResultData | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<SearchResultData | null>(null);
    const [activeMusicTrack, setActiveMusicTrack] = useState<any | null>(null);
    const [zoomScale, setZoomScale] = useState<number>(1);

    useEffect(() => {
        setZoomScale(1);
    }, [selectedImage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategory]);

    const fetchResults = useCallback(async () => {
        if (!query.trim()) return;

        setIsLoading(true);
        setError(null);
        setData(null);
        setIsStreaming(true);

        try {
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query.trim(), mode, perspective, category: activeCategory, page: currentPage }),
            });

            if (!response.ok) {
                throw new Error('Search failed');
            }

            const result: SearchResponse = await response.json();
            setData(result);

            setTimeout(() => setIsStreaming(false), 2000);
        } catch (err) {
            console.error('Search error:', err);
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [query, mode, perspective, activeCategory, currentPage]);

    const handlePerspectiveChange = async (newPerspective: Perspective) => {
        if (newPerspective === perspective || !data) return;

        setPerspective(newPerspective);
        setIsPerspectiveLoading(true);
        setIsStreaming(true);

        try {
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: query.trim(),
                    mode,
                    perspective: newPerspective
                }),
            });

            if (!response.ok) throw new Error('Perspective update failed');

            const result: SearchResponse = await response.json();
            setData(prev => prev ? { ...prev, aiAnswer: result.aiAnswer, followUpQuestions: result.followUpQuestions } : result);

            setTimeout(() => setIsStreaming(false), 2000);
        } catch (err) {
            console.error('Perspective error:', err);
        } finally {
            setIsPerspectiveLoading(false);
        }
    };

    useEffect(() => {
        fetchResults();
    }, [fetchResults]);

    useEffect(() => {
        if (query) {
            document.title = `${query} — Smartpedia`;
        }
        return () => { document.title = 'BandhanNova Smartpedia — Your Personal Knowledge Engine'; };
    }, [query]);

    const handleSaveKnowledgeCard = () => {
        setShowKnowledgeCard(true);
    };

    const totalResults = (data?.knowledgeResults?.length || 0) + (data?.webResults?.length || 0) + (data?.metaResults?.length || 0);

    const allResults = Array.from(
        new Map(
            [
                ...(data?.webResults || []),
                ...(data?.metaResults || [])
            ].map(item => [item.url, item])
        ).values()
    );

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b border-[var(--card-border)]">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
                    <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/15 group-hover:shadow-lg group-hover:shadow-indigo-500/25 transition-shadow">
                            <img src="/favicon.ico" alt="Smartpedia" className="w-5 h-5 object-contain" />
                        </div>
                        <span className="hidden sm:block text-lg font-bold text-gradient">
                            Smartpedia
                        </span>
                    </Link>

                    <div className="w-full max-w-xl">
                        <Suspense fallback={<div className="h-12 rounded-full bg-[var(--card)] animate-pulse" />}>
                            <SearchInput compact />
                        </Suspense>
                    </div>

                    <div className="hidden sm:flex ml-auto items-center gap-2">
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            {/* Google-style Tab Bar */}
            <div className="bg-[var(--background)] border-b border-[var(--card-border)]">
                <div className="max-w-7xl mx-auto px-4 sm:pl-[60px] lg:pl-[120px] flex items-center gap-6 overflow-x-auto text-sm font-medium">
                    {[
                        { id: 'general', label: 'All' },
                        { id: 'images', label: 'Images' },
                        { id: 'videos', label: 'Videos' },
                        { id: 'music', label: 'Music' },
                        { id: 'news', label: 'News' },
                        { id: 'map', label: 'Maps' },
                        { id: 'it', label: 'Tech' },
                        { id: 'science', label: 'Science' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveCategory(tab.id)}
                            className={`py-3 px-1 border-b-2 transition-colors cursor-pointer ${
                                activeCategory === tab.id
                                    ? 'border-indigo-500 text-indigo-500 font-semibold'
                                    : 'border-transparent text-[var(--muted)] hover:text-[var(--foreground)]'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-6 min-h-[75vh]">
                {/* Results count */}
                {query && (
                    <div className="mb-4 sm:pl-[60px] lg:pl-[120px]">
                        {data && !isLoading ? (
                            <p className="text-sm text-[var(--muted)] font-medium">
                                Results for <span className="text-[var(--foreground)] font-bold">&quot;{query}&quot;</span>
                            </p>
                        ) : (
                            <div className="h-5 w-64 bg-[var(--card-border)] rounded animate-pulse" />
                        )}
                    </div>
                )}

                {/* Two Column Layout */}
                <div className="flex flex-col lg:flex-row gap-6 sm:pl-[60px] lg:pl-[120px]">
                    {/* Left Column: AI Answer + Knowledge + Web Results */}
                    <div className="flex-1 max-w-3xl">
                        {/* Category-aware Loading State */}
                        {isLoading && (
                            <div className="space-y-6 animate-pulse w-full min-h-[80vh]">
                                {activeCategory === 'images' && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                                            <div key={i} className="aspect-square rounded-xl bg-[var(--card)] border border-[var(--card-border)] relative overflow-hidden">
                                                <div className="w-full h-3/4 bg-[var(--card-border)]/40" />
                                                <div className="p-3 space-y-2">
                                                    <div className="h-3 w-3/4 bg-[var(--card-border)] rounded-full" />
                                                    <div className="h-2 w-1/2 bg-[var(--card-border)]/60 rounded-full" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeCategory === 'videos' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                                        {[1, 2, 3, 4, 5, 6].map((i) => (
                                            <div key={i} className="aspect-video rounded-xl bg-[var(--card)] border border-[var(--card-border)] relative overflow-hidden">
                                                <div className="w-full h-full bg-[var(--card-border)]/40" />
                                                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/40 to-transparent space-y-2">
                                                    <div className="h-3 w-3/4 bg-white/60 rounded-full" />
                                                    <div className="h-2 w-1/2 bg-white/40 rounded-full" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeCategory === 'music' && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                            <div key={i} className="rounded-2xl bg-[var(--card)] border border-[var(--card-border)] p-3 space-y-3">
                                                <div className="aspect-square rounded-xl bg-[var(--card-border)]/40 relative overflow-hidden flex items-center justify-center">
                                                    <div className="w-8 h-8 rounded-full bg-[var(--card-border)]/60" />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="h-3 w-3/4 bg-[var(--card-border)] rounded-full" />
                                                    <div className="h-2 w-1/2 bg-[var(--card-border)]/60 rounded-full" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {(activeCategory === 'general' || activeCategory === 'news' || activeCategory === 'it' || activeCategory === 'science' || activeCategory === 'map') && (
                                    <div className="space-y-6">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div key={i} className="py-4 space-y-3 border-b border-[var(--card-border)]/30 last:border-0">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 rounded bg-[var(--card-border)]/60" />
                                                    <div className="h-3 w-32 bg-[var(--card-border)]/60 rounded-full" />
                                                </div>
                                                <div className="h-5 w-3/4 bg-[var(--card-border)] rounded-full" />
                                                <div className="space-y-1.5">
                                                    <div className="h-3 w-full bg-[var(--card-border)]/50 rounded-full" />
                                                    <div className="h-3 w-[85%] bg-[var(--card-border)]/50 rounded-full" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="p-6 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 animate-fade-in">
                                <p className="font-medium">Something went wrong</p>
                                <p className="text-sm mt-1 opacity-80">{error}</p>
                                <button
                                    onClick={fetchResults}
                                    className="mt-3 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors cursor-pointer"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {/* AI Overview removed per user request */}

                        {/* Knowledge Card (shown when user clicks save) */}
                        {showKnowledgeCard && data && (
                            <div className="mb-6 relative animate-scale-in">
                                <button
                                    onClick={() => setShowKnowledgeCard(false)}
                                    className="absolute top-3 right-3 z-10 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[var(--muted)] cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <KnowledgeCard
                                    title={data.query}
                                    summary={data.aiAnswer}
                                    sources={data.sources}
                                    query={data.query}
                                    relatedTopics={data.followUpQuestions?.slice(0, 3)}
                                />
                            </div>
                        )}

                        {/* SearXNG Infobox (Wikipedia-style panel) */}
                        {activeCategory === 'general' && data?.infoboxes && data.infoboxes.length > 0 && !isLoading && (
                            <div className="mb-6 animate-fade-in">
                                {data.infoboxes.map((ib, idx) => (
                                    <div key={idx} className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--card-border)] shadow-sm">
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            {ib.img_src && (
                                                <img src={ib.img_src} alt={ib.infobox} className="w-full sm:w-24 h-48 sm:h-24 rounded-xl object-cover flex-shrink-0 mb-2 sm:mb-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-lg text-[var(--foreground)]">{ib.infobox}</h3>
                                                {ib.content && <p className="text-sm text-[var(--muted)] mt-2 leading-relaxed">{ib.content}</p>}
                                            </div>
                                        </div>
                                        {ib.urls && ib.urls.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[var(--card-border)]">
                                                {ib.urls.map((u, i) => (
                                                    <a key={i} href={u.url} target="_blank" rel="noreferrer" className="text-xs px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors font-medium">
                                                        {u.title}
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Knowledge Base Section */}
                        {data?.knowledgeResults && data.knowledgeResults.length > 0 && (
                            <WikipediaSection results={data.knowledgeResults} />
                        )}

                        {/* Search Engine Results */}
                        {/* Images View */}
                        {activeCategory === 'images' && allResults.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2 mb-6 animate-fade-in">
                                {allResults.map((result: any, index) => (
                                    <div
                                        key={index}
                                        onClick={() => setSelectedImage(result)}
                                        className="group block overflow-hidden rounded-xl bg-[var(--card)] border border-[var(--card-border)] hover:shadow-lg hover:shadow-indigo-500/5 transition-all cursor-pointer"
                                    >
                                        <div className="aspect-square relative overflow-hidden bg-gray-100 dark:bg-gray-900">
                                            {result.img_src ? (
                                                <img
                                                    src={result.img_src}
                                                    alt={result.title}
                                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                                    onError={(e) => {
                                                        (e.currentTarget as HTMLImageElement).src = result.thumbnail_src || '/favicon.ico';
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-full text-[var(--muted)]">
                                                    <ImageIcon className="w-8 h-8 opacity-50" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3 text-xs">
                                            <p className="font-semibold truncate text-[var(--foreground)] group-hover:text-indigo-500 transition-colors">
                                                {result.title}
                                            </p>
                                            <p className="text-[var(--muted)] truncate mt-0.5">
                                                {result.url}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Videos View */}
                        {activeCategory === 'videos' && allResults.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2 mb-6 animate-fade-in">
                                {[...allResults]
                                    .sort((a: any, b: any) => {
                                        const aHasThumb = a.thumbnail_src || a.img_src || getYoutubeId(a.url);
                                        const bHasThumb = b.thumbnail_src || b.img_src || getYoutubeId(b.url);
                                        if (aHasThumb && !bHasThumb) return -1;
                                        if (!aHasThumb && bHasThumb) return 1;
                                        return 0;
                                    })
                                    .map((result: any, index) => {
                                        const ytId = getYoutubeId(result.url);
                                        const thumb = result.thumbnail_src || result.img_src || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '');
                                        return (
                                        <div
                                            key={index}
                                            onClick={() => setSelectedVideo(result)}
                                            className="group block overflow-hidden rounded-xl bg-[var(--card)] border border-[var(--card-border)] hover:shadow-lg hover:shadow-indigo-500/5 transition-all cursor-pointer"
                                        >
                                        <div className="aspect-video relative overflow-hidden bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                                            {thumb ? (
                                                <img src={thumb} alt={result.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-100" />
                                            ) : (
                                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
                                                    <span className="text-4xl">🎬</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                                                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                                                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                </div>
                                            </div>
                                            {ytId && <span className="absolute bottom-2 right-2 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">YouTube</span>}
                                        </div>
                                        <div className="p-3">
                                            <p className="font-semibold text-sm text-[var(--foreground)] group-hover:text-indigo-500 transition-colors line-clamp-2">{result.title}</p>
                                            <p className="text-[var(--muted)] truncate mt-1 text-xs">{getDomain(result.url)}</p>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Music View */}
                        {activeCategory === 'music' && allResults.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2 mb-6 animate-fade-in">
                                {allResults.map((result: any, index) => {
                                    const ytId = getYoutubeId(result.url);
                                    const thumb = result.thumbnail_src || result.img_src || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '');
                                    return (
                                        <div
                                            key={index}
                                            onClick={(e) => {
                                                const trackYtId = getYoutubeId(result.url);
                                                if (trackYtId) {
                                                    e.preventDefault();
                                                    setActiveMusicTrack(result);
                                                } else {
                                                    window.open(result.url, '_blank', 'noreferrer');
                                                }
                                            }}
                                            className="group block overflow-hidden rounded-2xl bg-[var(--card)] border border-[var(--card-border)] hover:shadow-xl hover:shadow-indigo-500/10 transition-all p-3 cursor-pointer"
                                        >
                                            <div className="aspect-square relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                                                {thumb ? (
                                                    <img src={thumb} alt={result.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                                                ) : (
                                                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-violet-500/20 flex items-center justify-center">
                                                        <span className="text-4xl">🎵</span>
                                                    </div>
                                                )}
                                                <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg group-hover:bg-indigo-700 group-hover:scale-110 transition-all">
                                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                </div>
                                            </div>
                                            <div className="mt-3">
                                                <p className="font-bold text-sm text-[var(--foreground)] group-hover:text-indigo-500 transition-colors line-clamp-1">{result.title}</p>
                                                <p className="text-[var(--muted)] truncate mt-0.5 text-[11px] font-semibold">{getDomain(result.url)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* News View */}
                        {activeCategory === 'news' && allResults.length > 0 && (
                            <div className="space-y-4 mt-2 mb-6 animate-fade-in">
                                {allResults.map((result: any, index) => (
                                    <a key={index} href={result.url} target="_blank" rel="noreferrer"
                                        className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-[var(--card)] border border-[var(--card-border)] hover:shadow-md hover:shadow-indigo-500/5 transition-all group">
                                        <div className="w-full sm:w-52 h-36 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 flex-shrink-0">
                                            {(result.img_src || result.thumbnail_src) ? (
                                                <img src={result.img_src || result.thumbnail_src} alt={result.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950">
                                                    <span className="text-3xl">📰</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <img src={getFavicon(result.url)} alt="" className="w-4 h-4 rounded-sm" />
                                                <span className="text-[11px] text-[var(--muted)] truncate">{getDomain(result.url)}</span>
                                                {result.publishedDate && <span className="text-[10px] font-bold text-indigo-500 ml-auto whitespace-nowrap">{formatNewsDate(result.publishedDate)}</span>}
                                            </div>
                                            <h3 className="font-bold text-base text-[var(--foreground)] group-hover:text-indigo-500 transition-colors line-clamp-2">{result.title}</h3>
                                            <p className="text-sm text-[var(--muted)] mt-2 line-clamp-3">{result.snippet}</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}

                        {/* Maps View */}
                        {activeCategory === 'map' && allResults.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2 mb-6 animate-fade-in">
                                {allResults.map((result: any, index) => {
                                    const thumb = result.img_src || result.thumbnail_src;
                                    return (
                                    <a key={index} href={result.url} target="_blank" rel="noreferrer"
                                        className="block rounded-2xl bg-[var(--card)] border border-[var(--card-border)] hover:border-indigo-500/30 shadow-sm hover:shadow-xl transition-all group overflow-hidden">
                                        <div className="h-40 relative overflow-hidden bg-gray-100 dark:bg-gray-900">
                                            {thumb ? (
                                                <img src={thumb} alt={result.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                            ) : (
                                                <img src="/maps-thumb.jpeg" alt="Map view" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-3">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-indigo-400" />
                                                    <span className="text-white text-xs font-bold truncate">{getDomain(result.url)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-base text-[var(--foreground)] group-hover:text-indigo-500 transition-colors line-clamp-2">{result.title}</h3>
                                            <p className="text-sm text-[var(--muted)] mt-2 line-clamp-2">{result.snippet}</p>
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-500 mt-3 group-hover:underline">View on Map →</span>
                                        </div>
                                    </a>
                                    );
                                })}
                            </div>
                        )}

                        {/* Tech View */}
                        {activeCategory === 'it' && allResults.length > 0 && (
                            <div className="space-y-4 mt-2 mb-6 animate-fade-in">
                                {allResults.map((result: any, index) => (
                                    <a key={index} href={result.url} target="_blank" rel="noreferrer"
                                        className="block p-5 rounded-xl bg-[var(--card)]/40 border border-[var(--card-border)] hover:border-indigo-500/40 transition-all group">
                                        <div className="flex items-center gap-3 mb-3">
                                            <img src={getFavicon(result.url)} alt="" className="w-5 h-5 rounded" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                                            <span className="text-xs font-mono text-gray-500">{getDomain(result.url)}</span>
                                            <div className="ml-auto flex items-center gap-2 text-[10px] font-mono text-indigo-400 bg-indigo-950/40 px-2.5 py-1 rounded-full">
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                                                TECH #{index + 1}
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-100 group-hover:text-indigo-400 transition-colors">{result.title}</h3>
                                        <p className="text-sm text-gray-400 mt-3 font-mono leading-relaxed line-clamp-6">{result.snippet}</p>
                                        <div className="flex items-center gap-2 mt-4 text-xs text-indigo-400 font-mono">
                                            <ExternalLink className="w-3 h-3" /> Read full article →
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}

                        {/* Science View */}
                        {activeCategory === 'science' && allResults.length > 0 && (
                            <div className="space-y-4 mt-2 mb-6 animate-fade-in">
                                {allResults.map((result: any, index) => {
                                    const domain = getDomain(result.url);
                                    const favicon = getFavicon(result.url);
                                    return (
                                    <a key={index} href={result.url} target="_blank" rel="noreferrer"
                                        className="block p-5 rounded-2xl bg-gradient-to-br from-[var(--card)] to-[var(--background)] border border-[var(--card-border)] hover:border-purple-500/30 transition-all shadow-sm hover:shadow-lg group">
                                        <div className="flex items-center gap-3 mb-3">
                                            <img src={favicon} alt="" className="w-6 h-6 rounded" onError={(e) => { (e.target as HTMLImageElement).replaceWith(Object.assign(document.createElement('span'), { className: 'text-lg', textContent: '🔬' })); }} />
                                            <div className="min-w-0 flex-1">
                                                <span className="text-xs text-purple-500 font-bold">{domain}</span>
                                            </div>
                                            {result.publishedDate && <span className="text-[10px] text-[var(--muted)] whitespace-nowrap">{result.publishedDate}</span>}
                                        </div>
                                        <h3 className="font-bold text-base text-[var(--foreground)] group-hover:text-purple-500 transition-colors">{result.title}</h3>
                                        <p className="text-sm text-[var(--muted)] mt-3 leading-relaxed line-clamp-6">{result.snippet}</p>
                                    </a>
                                    );
                                })}
                            </div>
                        )}



                        {/* All Results / Default View */}
                        {activeCategory === 'general' && allResults.length > 0 && (
                            <div className="border-t border-[var(--card-border)] pt-2 mb-6">
                                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] mb-4 px-1">
                                    Web Results
                                </h4>
                                {allResults.map((result, index) => (
                                    <SearchResultCard
                                        key={result.id || index}
                                        title={result.title}
                                        url={result.url}
                                        snippet={result.snippet}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Pagination Controls */}
                        {!isLoading && allResults.length > 0 && (
                            <div className="flex justify-center items-center gap-3 mt-8 mb-6 animate-fade-in">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    className="px-4 py-2 text-sm font-semibold bg-[var(--card)] border border-[var(--card-border)] rounded-xl text-[var(--muted)] disabled:opacity-40 cursor-pointer"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-[var(--muted)] font-bold">
                                    Page {currentPage}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="px-4 py-2 text-sm font-semibold bg-[var(--card)] border border-[var(--card-border)] rounded-xl text-[var(--foreground)] cursor-pointer"
                                >
                                    Next
                                </button>
                            </div>
                        )}

                        {/* Related Search Suggestions */}
                        {data?.suggestions && data.suggestions.length > 0 && !isLoading && (
                            <div className="mt-4 mb-12 animate-fade-in">
                                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] mb-3 px-1">Related Searches</h4>
                                <div className="flex flex-wrap gap-2">
                                    {data.suggestions
                                        .flatMap((s: string) => s.includes(',') ? s.split(',').map(x => x.trim()) : [s])
                                        .filter(Boolean)
                                        .map((s: string, i: number) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                const url = `/search?q=${encodeURIComponent(s)}&mode=${mode}`;
                                                window.location.href = url;
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--card)] border border-[var(--card-border)] text-sm text-[var(--foreground)] hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer"
                                        >
                                            <Search className="w-3 h-3 text-[var(--muted)]" />
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No Results */}
                        {data && totalResults === 0 && !isLoading && (
                            <div className="py-16 text-center animate-fade-in">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--card)] border border-[var(--card-border)] flex items-center justify-center">
                                    <span className="text-3xl">🤔</span>
                                </div>
                                <p className="text-[var(--foreground)] font-medium">No results found</p>
                                <p className="text-sm text-[var(--muted)] mt-1">Try different keywords or check your spelling</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Sources Sidebar (desktop only) */}
                    {data?.sources && data.sources.length > 0 && (
                        <div className="hidden lg:block w-72 flex-shrink-0">
                            <div className="card-premium p-4 sticky top-20">
                                <h4 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">
                                    Sources Used
                                </h4>
                                <div className="space-y-2.5">
                                    {data.sources.map((source, i) => {
                                        let domain = '';
                                        let favicon = '';
                                        try {
                                            domain = new URL(source.url).hostname.replace('www.', '');
                                            favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
                                        } catch {
                                            domain = source.url;
                                        }
                                        return (
                                            <a
                                                key={i}
                                                href={source.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-black/3 dark:hover:bg-white/3 transition-colors group"
                                            >
                                                {favicon && (
                                                    <img src={favicon} alt="" className="w-4 h-4 rounded-sm mt-0.5 flex-shrink-0" />
                                                )}
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-[var(--foreground)] truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                        {source.title}
                                                    </p>
                                                    <p className="text-[11px] text-[var(--muted)] truncate">{domain}</p>
                                                </div>
                                            </a>
                                        );
                                    })}
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />

            {/* Image Viewer Modal */}
            {selectedImage && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <div className="max-w-4xl w-full bg-[var(--card)] border border-[var(--card-border)] rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-scale-in">
                        <div className="flex-1 bg-black/50 flex items-center justify-center p-4 max-h-[70vh] md:max-h-[80vh] relative overflow-hidden">
                            <div className="absolute top-4 left-4 z-10 flex gap-2">
                                <button
                                    onClick={() => setZoomScale(prev => Math.min(3, prev + 0.25))}
                                    className="w-8 h-8 rounded-lg bg-black/60 text-white font-bold hover:bg-black/80 flex items-center justify-center border border-white/10 cursor-pointer"
                                    title="Zoom In"
                                >
                                    +
                                </button>
                                <button
                                    onClick={() => setZoomScale(prev => Math.max(1, prev - 0.25))}
                                    className="w-8 h-8 rounded-lg bg-black/60 text-white font-bold hover:bg-black/80 flex items-center justify-center border border-white/10 cursor-pointer"
                                    title="Zoom Out"
                                >
                                    -
                                </button>
                                {zoomScale > 1 && (
                                    <button
                                        onClick={() => setZoomScale(1)}
                                        className="px-2 h-8 text-xs rounded-lg bg-black/60 text-white hover:bg-black/80 flex items-center justify-center border border-white/10 cursor-pointer"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                            <img
                                src={selectedImage.img_src || selectedImage.thumbnail_src}
                                alt={selectedImage.title}
                                style={{ transform: `scale(${zoomScale})` }}
                                className="max-w-full max-h-full object-contain rounded-lg transition-transform duration-200 ease-out"
                            />
                        </div>
                        <div className="w-full md:w-80 p-6 flex flex-col justify-between bg-[var(--card)] border-t md:border-t-0 md:border-l border-[var(--card-border)]">
                            <div>
                                <h3 className="font-bold text-lg text-[var(--foreground)]">
                                    {selectedImage.title}
                                </h3>
                                <p className="text-xs text-[var(--muted)] mt-2 break-all">
                                    {selectedImage.url}
                                </p>
                                <p className="text-sm text-[var(--muted)] mt-4 line-clamp-4">
                                    {selectedImage.snippet}
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 mt-6">
                                <a
                                    href={selectedImage.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full py-3 rounded-xl bg-indigo-600 text-white text-center text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 transition-colors"
                                >
                                    Visit Website
                                </a>
                                <button
                                    onClick={async () => {
                                        try {
                                            const res = await fetch(selectedImage.img_src || selectedImage.thumbnail_src!);
                                            const blob = await res.blob();
                                            const url = window.URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `smartpedia-img-${Date.now()}.jpg`;
                                            document.body.appendChild(a);
                                            a.click();
                                            a.remove();
                                        } catch (e) {
                                            window.open(selectedImage.img_src || selectedImage.thumbnail_src, '_blank');
                                        }
                                    }}
                                    className="w-full py-3 rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-[var(--foreground)] text-center text-sm font-semibold hover:bg-[var(--card-border)]/30 transition-colors cursor-pointer"
                                >
                                    Download Image
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Video Player Modal */}
            {selectedVideo && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                    <button
                        onClick={() => setSelectedVideo(null)}
                        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <div className="max-w-3xl w-full bg-[var(--card)] border border-[var(--card-border)] rounded-2xl overflow-hidden shadow-2xl animate-scale-in">
                        <div className="aspect-video w-full bg-black flex items-center justify-center">
                            {(() => {
                                const ytId = getYoutubeId(selectedVideo.url);
                                if (ytId) {
                                    return (
                                        <iframe
                                            src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                                            className="w-full h-full border-0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    );
                                }
                                return (
                                    <div className="p-8 text-center text-white">
                                        <span className="text-4xl">🎬</span>
                                        <p className="font-semibold mt-3">External Video Player Required</p>
                                        <p className="text-sm text-gray-400 mt-1">Smartpedia safely routes playback directly.</p>
                                        <a
                                            href={selectedVideo.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-block mt-6 px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 transition-colors"
                                        >
                                            Play Now on Original Site
                                        </a>
                                    </div>
                                );
                            })()}
                        </div>
                        <div className="p-6 bg-[var(--card)] border-t border-[var(--card-border)]">
                            <h3 className="font-bold text-lg text-[var(--foreground)]">
                                {selectedVideo.title}
                            </h3>
                            <p className="text-xs text-[var(--muted)] mt-1 break-all">
                                {selectedVideo.url}
                            </p>
                            <p className="text-sm text-[var(--muted)] mt-3 line-clamp-2">
                                {selectedVideo.snippet}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Persistent Music Player Bar */}
            {activeMusicTrack && (
                <div className="fixed bottom-20 sm:bottom-6 right-4 z-50 bg-[var(--card)]/95 backdrop-blur-xl border border-[var(--card-border)] rounded-2xl p-4 shadow-2xl animate-slide-in flex flex-col gap-3 w-[300px] sm:w-[360px]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-lg animate-pulse">🎵</span>
                            <div className="min-w-0">
                                <p className="font-bold text-xs text-[var(--foreground)] truncate select-none">Playing Track</p>
                                <p className="text-[11px] text-[var(--muted)] truncate select-none">{activeMusicTrack.title}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setActiveMusicTrack(null)}
                            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[var(--muted)] cursor-pointer transition-colors flex-shrink-0"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    
                    <div className="w-full aspect-video rounded-xl overflow-hidden relative bg-black border border-[var(--card-border)]/60">
                        <iframe 
                            src={`https://www.youtube.com/embed/${getYoutubeId(activeMusicTrack.url)}?autoplay=1&modestbranding=1&showinfo=0&rel=0`} 
                            className="absolute inset-0 w-full h-full"
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<SearchPageSkeleton />}>
            <SearchContent />
        </Suspense>
    );
}

function SearchPageSkeleton() {
    return (
        <div className="min-h-screen bg-[var(--background)]">
            <header className="sticky top-0 z-50 glass border-b border-[var(--card-border)]">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-[var(--card-border)] animate-pulse" />
                    <div className="w-full max-w-xl h-12 rounded-full bg-[var(--card-border)] animate-pulse" />
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 py-6 sm:pl-[180px]">
                <div className="space-y-6 max-w-3xl">
                    <div className="space-y-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="py-4 space-y-3">
                                <div className="h-5 w-3/4 bg-[var(--card-border)] rounded-full animate-pulse" />
                                <div className="space-y-1.5">
                                    <div className="h-3 w-full bg-[var(--card-border)]/60 rounded-full animate-pulse" />
                                    <div className="h-3 w-[85%] bg-[var(--card-border)]/60 rounded-full animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
