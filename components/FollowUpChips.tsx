'use client';

import { useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';

interface FollowUpChipsProps {
    questions: string[];
    className?: string;
}

export default function FollowUpChips({ questions, className = '' }: FollowUpChipsProps) {
    const router = useRouter();

    if (!questions || questions.length === 0) return null;

    const handleClick = (question: string) => {
        router.push(`/search?q=${encodeURIComponent(question)}`);
    };

    return (
        <div className={`mt-5 ${className}`}>
            <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                    Keep Exploring
                </span>
            </div>
            <div className="flex flex-wrap gap-2">
                {questions.map((question, index) => (
                    <button
                        key={index}
                        onClick={() => handleClick(question)}
                        className="text-left px-3.5 py-2 rounded-xl text-sm font-medium
              bg-[var(--card)] text-[var(--foreground)] border border-[var(--card-border)]
              hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700
              dark:hover:bg-indigo-950/30 dark:hover:text-indigo-300
              transition-all duration-200 cursor-pointer
              animate-fade-in-up opacity-0"
                        style={{
                            animationDelay: `${index * 100}ms`,
                            animationFillMode: 'forwards'
                        }}
                    >
                        <span className="opacity-60 mr-1">→</span> {question}
                    </button>
                ))}
            </div>
        </div>
    );
}
