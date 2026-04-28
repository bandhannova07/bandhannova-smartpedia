import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
    title: 'Terms of Service — BandhanNova Smartpedia',
    description: 'Terms of service for BandhanNova Smartpedia.',
};

export default function TermsPage() {
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
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold">Terms of Service</h1>
                            <p className="text-sm text-[var(--muted)]">Last updated: March 1, 2026</p>
                        </div>
                    </div>

                    <div className="prose-content space-y-6 text-[var(--muted)] text-sm leading-relaxed">
                        <section>
                            <h2 className="text-lg font-bold text-[var(--foreground)] mb-2">1. Acceptance of Terms</h2>
                            <p>By using BandhanNova Smartpedia (&quot;the Service&quot;), you agree to these Terms of Service. If you do not agree, please do not use the Service.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--foreground)] mb-2">2. Description of Service</h2>
                            <p>Smartpedia is an AI-powered knowledge engine that provides search results and AI-generated answers based on publicly available information. The Service is provided &quot;as is&quot; and is intended for informational purposes only.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--foreground)] mb-2">3. AI-Generated Content</h2>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>AI answers are generated based on available search results and may not always be accurate.</li>
                                <li>Always verify critical information from authoritative sources.</li>
                                <li>Smartpedia is not a substitute for professional advice (medical, legal, financial, etc.).</li>
                                <li>We do not guarantee the completeness or accuracy of AI-generated content.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--foreground)] mb-2">4. Acceptable Use</h2>
                            <p>You agree not to:</p>
                            <ul className="list-disc pl-5 space-y-1 mt-2">
                                <li>Use the Service for illegal or harmful purposes</li>
                                <li>Attempt to overload or abuse the API endpoints</li>
                                <li>Scrape or redistribute content without permission</li>
                                <li>Misrepresent AI-generated answers as your own original work</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--foreground)] mb-2">5. Intellectual Property</h2>
                            <p>The Smartpedia brand, design, and codebase are owned by BandhanNova Platforms. Search results and scraped content belong to their respective owners and are used under fair use for informational purposes.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--foreground)] mb-2">6. Limitation of Liability</h2>
                            <p>BandhanNova Platforms shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of the Service. This includes reliance on AI-generated answers.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--foreground)] mb-2">7. Changes to Terms</h2>
                            <p>We may update these terms at any time. Continued use of the Service constitutes acceptance of the updated terms.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--foreground)] mb-2">8. Contact</h2>
                            <p>For questions about these terms, contact us at{' '}
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
