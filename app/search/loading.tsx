export default function Loading() {
    return (
        <div className="min-h-screen bg-[var(--background)]">
            {/* Header Skeleton */}
            <header className="sticky top-0 z-50 glass border-b border-[var(--card-border)]">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-[var(--card-border)] animate-pulse" />
                    <div className="w-full max-w-xl h-12 rounded-full bg-[var(--card-border)] animate-pulse" />
                    <div className="hidden sm:block ml-auto w-8 h-8 rounded-full bg-[var(--card-border)] animate-pulse" />
                </div>
            </header>

            {/* Content Skeleton */}
            <main className="max-w-7xl mx-auto px-4 py-6 sm:pl-[60px] lg:pl-[120px]">
                {/* Results count skeleton */}
                <div className="mb-4">
                    <div className="h-5 w-64 bg-[var(--card-border)] rounded animate-pulse" />
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Column */}
                    <div className="flex-1 max-w-3xl space-y-6">
                        {/* AI Answer Skeleton */}
                        <div className="ai-answer-card p-6">
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 animate-pulse" />
                                <div className="space-y-1.5">
                                    <div className="h-4 w-28 bg-[var(--card-border)] rounded animate-pulse" />
                                    <div className="h-3 w-36 bg-[var(--card-border)] rounded animate-pulse" />
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                <div className="h-4 w-full bg-[var(--card-border)] rounded animate-pulse" />
                                <div className="h-4 w-[92%] bg-[var(--card-border)] rounded animate-pulse" />
                                <div className="h-4 w-[85%] bg-[var(--card-border)] rounded animate-pulse" />
                                <div className="h-4 w-[90%] bg-[var(--card-border)] rounded animate-pulse" />
                                <div className="h-4 w-[75%] bg-[var(--card-border)] rounded animate-pulse" />
                                <div className="h-4 w-[88%] bg-[var(--card-border)] rounded animate-pulse" />
                            </div>
                            {/* Follow-up skeleton */}
                            <div className="mt-5 pt-3 border-t border-[var(--card-border)]">
                                <div className="flex gap-2 flex-wrap">
                                    <div className="h-8 w-40 bg-[var(--card-border)] rounded-xl animate-pulse" />
                                    <div className="h-8 w-52 bg-[var(--card-border)] rounded-xl animate-pulse" />
                                    <div className="h-8 w-36 bg-[var(--card-border)] rounded-xl animate-pulse" />
                                </div>
                            </div>
                        </div>

                        {/* Result Skeletons */}
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="py-4 space-y-2 border-b border-[var(--card-border)] last:border-0">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-[var(--card-border)] animate-pulse" />
                                    <div className="h-3 w-32 bg-[var(--card-border)] rounded animate-pulse" />
                                </div>
                                <div className="h-5 w-3/4 bg-[var(--card-border)] rounded animate-pulse" />
                                <div className="h-3 w-full bg-[var(--card-border)] rounded animate-pulse" />
                                <div className="h-3 w-2/3 bg-[var(--card-border)] rounded animate-pulse" />
                            </div>
                        ))}
                    </div>

                    {/* Right Column: Sources Skeleton */}
                    <div className="hidden lg:block w-72 flex-shrink-0">
                        <div className="card-premium p-4">
                            <div className="h-3 w-24 bg-[var(--card-border)] rounded animate-pulse mb-3" />
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center gap-2.5 p-2">
                                    <div className="w-4 h-4 rounded bg-[var(--card-border)] animate-pulse flex-shrink-0" />
                                    <div className="space-y-1 flex-1">
                                        <div className="h-3.5 w-full bg-[var(--card-border)] rounded animate-pulse" />
                                        <div className="h-2.5 w-20 bg-[var(--card-border)] rounded animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
