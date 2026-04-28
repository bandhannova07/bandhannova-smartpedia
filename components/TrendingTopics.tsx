'use client';

import { useRouter } from 'next/navigation';
import { TrendingUp, Atom, Globe, Cpu, BookOpen, Palette, Lightbulb, Heart } from 'lucide-react';

interface TopicItem {
    label: string;
    query: string;
    icon: React.ReactNode;
    color: string;
}

const trendingTopics: TopicItem[] = [
    { label: 'Quantum Computing', query: 'quantum computing explained', icon: <Atom className="w-3.5 h-3.5" />, color: 'from-blue-500 to-cyan-500' },
    { label: 'Climate Change', query: 'climate change latest research 2026', icon: <Globe className="w-3.5 h-3.5" />, color: 'from-green-500 to-emerald-500' },
    { label: 'Artificial Intelligence', query: 'artificial intelligence breakthroughs', icon: <Cpu className="w-3.5 h-3.5" />, color: 'from-purple-500 to-violet-500' },
    { label: 'Space Exploration', query: 'space exploration latest missions', icon: <Lightbulb className="w-3.5 h-3.5" />, color: 'from-orange-500 to-amber-500' },
    { label: 'Philosophy', query: 'major philosophical theories', icon: <BookOpen className="w-3.5 h-3.5" />, color: 'from-rose-500 to-pink-500' },
    { label: 'Modern Art', query: 'modern art movements 21st century', icon: <Palette className="w-3.5 h-3.5" />, color: 'from-fuchsia-500 to-purple-500' },
    { label: 'Human Biology', query: 'how the human brain works', icon: <Heart className="w-3.5 h-3.5" />, color: 'from-red-500 to-rose-500' },
];

export default function TrendingTopics() {
    const router = useRouter();

    const handleTopicClick = (query: string) => {
        router.push(`/search?q=${encodeURIComponent(query)}&mode=detailed`);
    };

    return (
        <div className="w-full max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-[var(--muted)]" />
                <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                    Trending Topics
                </span>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
                {trendingTopics.map((topic, index) => (
                    <button
                        key={topic.label}
                        onClick={() => handleTopicClick(topic.query)}
                        className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium
              bg-[var(--card)] text-[var(--muted)] border border-[var(--card-border)]
              hover:border-transparent hover:text-white hover:shadow-lg
              transition-all duration-300 cursor-pointer animate-fade-in-up opacity-0"
                        style={{
                            animationDelay: `${300 + index * 80}ms`,
                            animationFillMode: 'forwards'
                        }}
                        onMouseEnter={(e) => {
                            const el = e.currentTarget;
                            el.style.background = `linear-gradient(135deg, var(--tw-gradient-stops))`;
                            el.classList.add(`bg-gradient-to-r`, topic.color.split(' ')[0], topic.color.split(' ')[1]);
                        }}
                        onMouseLeave={(e) => {
                            const el = e.currentTarget;
                            el.style.background = '';
                            el.classList.remove(`bg-gradient-to-r`, topic.color.split(' ')[0], topic.color.split(' ')[1]);
                        }}
                    >
                        {topic.icon}
                        <span>{topic.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
