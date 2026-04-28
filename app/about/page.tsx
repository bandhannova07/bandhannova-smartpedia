import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Search, Zap, BookOpen, Baby, GraduationCap, Globe, Cpu, Shield } from 'lucide-react';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
    title: 'About — BandhanNova Smartpedia',
    description: 'Learn about BandhanNova Smartpedia, your personal AI-powered knowledge engine with 4 intelligent answer modes.',
};

export default function AboutPage() {
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
                    {/* Hero */}
                    <div className="text-center mb-12">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl shadow-indigo-500/20 mx-auto mb-4">
                            <Sparkles className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
                            About <span className="text-gradient">Smartpedia</span>
                        </h1>
                        <p className="text-[var(--muted)] text-lg max-w-xl mx-auto leading-relaxed">
                            Your Personal Knowledge Engine — powered by AI, built for curious minds.
                        </p>
                    </div>

                    {/* What is Smartpedia */}
                    <section className="mb-10">
                        <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                            <Search className="w-5 h-5 text-indigo-500" />
                            What is Smartpedia?
                        </h2>
                        <p className="text-[var(--muted)] leading-relaxed">
                            BandhanNova Smartpedia is not just another search engine — it&apos;s a <strong className="text-[var(--foreground)]">Knowledge Engine</strong>.
                            When you search, Smartpedia gathers information from multiple trusted sources across the web,
                            then uses advanced AI to synthesize a comprehensive, well-structured answer tailored to your needs.
                            Whether you&apos;re a student, researcher, or just curious, Smartpedia delivers knowledge — not just links.
                        </p>
                    </section>

                    {/* AI Modes */}
                    <section className="mb-10">
                        <h2 className="text-xl font-bold mb-4">4 Intelligent Answer Modes</h2>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {[
                                { icon: <Zap className="w-5 h-5" />, label: 'Quick', desc: 'Get a 2-3 line summary instantly. Perfect for quick facts.', color: 'from-amber-500 to-orange-500' },
                                { icon: <BookOpen className="w-5 h-5" />, label: 'Detailed', desc: 'Full analysis with citations, headers, and rich formatting.', color: 'from-indigo-500 to-purple-500' },
                                { icon: <Baby className="w-5 h-5" />, label: 'ELI5', desc: 'Explained like you\'re 5 — simple words, fun analogies, emojis!', color: 'from-green-500 to-emerald-500' },
                                { icon: <GraduationCap className="w-5 h-5" />, label: 'Academic', desc: 'Research-grade answers with formal language and citations.', color: 'from-rose-500 to-pink-500' },
                            ].map((m) => (
                                <div key={m.label} className="card-premium p-4 flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center text-white flex-shrink-0 shadow-md`}>
                                        {m.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm">{m.label}</h3>
                                        <p className="text-[var(--muted)] text-sm mt-0.5">{m.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Technology */}
                    <section className="mb-10">
                        <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                            <Cpu className="w-5 h-5 text-purple-500" />
                            How It Works
                        </h2>
                        <div className="card-premium p-5">
                            <ol className="space-y-3 text-sm text-[var(--muted)]">
                                <li className="flex items-start gap-3">
                                    <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center flex-shrink-0">1</span>
                                    <span><strong className="text-[var(--foreground)]">Search</strong> — Your query is sent to multiple knowledge sources simultaneously.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center flex-shrink-0">2</span>
                                    <span><strong className="text-[var(--foreground)]">Scrape</strong> — The top result is scraped in real-time for full content using our high-speed engine.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center flex-shrink-0">3</span>
                                    <span><strong className="text-[var(--foreground)]">AI Synthesize</strong> — All gathered context is fed to our AI which generates a structured, cited answer in your chosen mode.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center flex-shrink-0">4</span>
                                    <span><strong className="text-[var(--foreground)]">Knowledge Cards</strong> — Save, share, and revisit your discoveries anytime.</span>
                                </li>
                            </ol>
                        </div>
                    </section>

                    {/* Built by */}
                    <section className="mb-10">
                        <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-cyan-500" />
                            Built by BandhanNova
                        </h2>
                        <p className="text-[var(--muted)] leading-relaxed">
                            Smartpedia is proudly built by{' '}
                            <a href="https://www.bandhannova.in" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                                BandhanNova Platforms
                            </a>{' '}
                            — an Indian technology company building the future of digital India with AI-powered products.
                            From AI assistants to learning platforms, BandhanNova is creating an ecosystem where technology
                            serves everyone.
                        </p>
                    </section>

                    {/* Mission */}
                    <section className="ai-answer-card p-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Shield className="w-5 h-5 text-indigo-500" />
                            <h2 className="text-lg font-bold">Our Mission</h2>
                        </div>
                        <p className="text-[var(--muted)] leading-relaxed text-sm">
                            To democratize knowledge by making AI-powered understanding accessible to everyone — in any language,
                            at any complexity level. We believe that <strong className="text-[var(--foreground)]">knowledge should not be locked behind paywalls or
                                jargon</strong>. Smartpedia makes it possible for a 5-year-old and a PhD researcher to understand the
                            same topic — each in their own way.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
