import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
    title: 'Privacy Policy — BandhanNova Smartpedia',
    description: 'Privacy policy for BandhanNova Smartpedia. Learn how we handle your data and protect your privacy.',
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b border-[var(--card-border)]">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
                    <Link href="/" className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-[var(--muted)]" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                            <img src="/favicon.ico" alt="Smartpedia" className="w-5 h-5 object-contain" />
                        </div>
                        <span className="font-bold text-gradient">Smartpedia</span>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
                <div className="animate-fade-in-up">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold">Privacy Policy</h1>
                            <p className="text-sm text-[var(--muted)]">Last updated: March 1, 2026</p>
                        </div>
                    </div>

                    <div className="prose-content space-y-6 text-[var(--muted)] text-sm leading-relaxed">
                        <section>
                            <h2 className="text-lg font-bold text-[var(--foreground)] mb-2">1. Information We Collect</h2>
                            <p>When you use BandhanNova Smartpedia, we collect:</p>
                            <ul className="list-disc pl-5 space-y-1 mt-2">
                                <li><strong className="text-[var(--foreground)]">Search Queries:</strong> To provide AI-powered answers. Queries may be cached to improve results for future users.</li>
                                <li><strong className="text-[var(--foreground)]">Usage Data:</strong> Anonymous analytics like pages visited and features used.</li>
                                <li><strong className="text-[var(--foreground)]">Local Storage:</strong> Theme preferences and saved Knowledge Cards are stored in your browser.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--foreground)] mb-2">2. How We Use Your Data</h2>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>To generate AI-powered answers to your search queries</li>
                                <li>To improve search result quality over time</li>
                                <li>To analyze usage patterns and improve the platform</li>
                                <li>We do <strong className="text-[var(--foreground)]">not</strong> sell your data to third parties</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--foreground)] mb-2">3. Third-Party Services</h2>
                            <p>Smartpedia uses the following third-party services:</p>
                            <ul className="list-disc pl-5 space-y-1 mt-2">
                                <li><strong className="text-[var(--foreground)]">Knowledge Base API</strong> — For encyclopedic data</li>
                                <li><strong className="text-[var(--foreground)]">Web Search API</strong> — For web search results</li>
                                <li><strong className="text-[var(--foreground)]">Meta-Search Engine</strong> — For aggregated search results</li>
                                <li><strong className="text-[var(--foreground)]">OpenRouter AI</strong> — For generating AI answers</li>
                            </ul>
                            <p className="mt-2">Each service has its own privacy policy. Your queries are sent to these services to provide results.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--foreground)] mb-2">4. Cookies & Local Storage</h2>
                            <p>We use browser local storage for:</p>
                            <ul className="list-disc pl-5 space-y-1 mt-2">
                                <li>Theme preference (dark/light mode)</li>
                                <li>Saved Knowledge Cards</li>
                            </ul>
                            <p className="mt-2">No tracking cookies are used. Analytics are anonymized.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--foreground)] mb-2">5. Data Security</h2>
                            <p>All connections are encrypted via HTTPS. API keys are stored server-side and never exposed to the browser. We follow industry best practices to protect your information.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--foreground)] mb-2">6. Your Rights</h2>
                            <p>You have the right to:</p>
                            <ul className="list-disc pl-5 space-y-1 mt-2">
                                <li>Clear your local data at any time (browser settings)</li>
                                <li>Request deletion of cached search data</li>
                                <li>Opt out of analytics</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--foreground)] mb-2">7. Contact</h2>
                            <p>For privacy-related concerns, contact us at{' '}
                                <a href="mailto:contact@bandhannova.in" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                    contact@bandhannova.in
                                </a>
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
