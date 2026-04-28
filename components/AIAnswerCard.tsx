'use client';

import { Sparkles, Copy, Check, BookmarkPlus } from 'lucide-react';
import { useState } from 'react';
import StreamingText from './StreamingText';
import FollowUpChips from './FollowUpChips';
import type { AnswerMode } from './AnswerModeSelector';

interface AIAnswerCardProps {
    answer: string;
    isStreaming?: boolean;
    mode?: AnswerMode;
    followUpQuestions?: string[];
    onSaveCard?: () => void;
    className?: string;
}

const modeLabels: Record<AnswerMode, { label: string; emoji: string; accent: string }> = {
    quick: { label: 'Quick Answer', emoji: '⚡', accent: 'from-amber-500 to-orange-500' },
    detailed: { label: 'Detailed Analysis', emoji: '📖', accent: 'from-indigo-500 to-purple-500' },
    eli5: { label: 'Simple Explanation', emoji: '👶', accent: 'from-green-500 to-emerald-500' },
    academic: { label: 'Academic Answer', emoji: '🎓', accent: 'from-blue-500 to-cyan-500' },
};

export default function AIAnswerCard({
    answer,
    isStreaming = false,
    mode = 'detailed',
    followUpQuestions = [],
    onSaveCard,
    className = '',
}: AIAnswerCardProps) {
    const [copied, setCopied] = useState(false);

    if (!answer) return null;

    const handleCopy = async () => {
        await navigator.clipboard.writeText(answer);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const modeInfo = modeLabels[mode];

    // Estimate reading time
    const wordCount = answer.split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    return (
        <div className={`ai-master-card animate-fade-in-up ${className}`}>
            {/* Gradient Top Bar */}
            <div className={`ai-master-card-topbar bg-gradient-to-r ${modeInfo.accent}`} />

            {/* Header */}
            <div className="px-6 pt-5 pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${modeInfo.accent} flex items-center justify-center shadow-lg shadow-indigo-500/20`}>
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[var(--foreground)] text-[15px] tracking-tight">
                                AI Overview
                            </h3>
                            <p className="text-[11px] text-[var(--muted)] flex items-center gap-1.5">
                                <span className="text-sm">{modeInfo.emoji}</span>
                                {modeInfo.label}
                                <span className="w-1 h-1 rounded-full bg-[var(--muted-light)]" />
                                {readingTime} min read
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleCopy}
                            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[var(--muted)] transition-all cursor-pointer hover:scale-105"
                            title="Copy answer"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                        {onSaveCard && (
                            <button
                                onClick={onSaveCard}
                                className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[var(--muted)] transition-all cursor-pointer hover:scale-105"
                                title="Save as Knowledge Card"
                            >
                                <BookmarkPlus className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Card Content — This is where the magic happens */}
            <div className="px-6 pb-2">
                <StreamingText
                    text={answer}
                    isStreaming={isStreaming}
                    speed={4}
                />
            </div>

            {/* Follow-up Questions */}
            {followUpQuestions.length > 0 && !isStreaming && (
                <div className="px-6 pb-4">
                    <FollowUpChips questions={followUpQuestions} />
                </div>
            )}

            {/* Footer */}
            <div className="ai-master-card-footer">
                <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-[var(--muted)]">
                        Powered by AI · Answers may be imperfect · Always verify important info
                    </span>
                    <span className="text-[9px] text-[var(--muted-light)] flex items-center gap-1 font-semibold uppercase tracking-widest">
                        <div className="w-2.5 h-2.5 rounded-[3px] bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                            <img src="/favicon.ico" alt="S" className="w-1.5 h-1.5 object-contain" />
                        </div>
                        Powered by BandhanNova Platforms
                    </span>
                </div>
                {isStreaming && (
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[11px] text-indigo-500 font-medium">Generating...</span>
                    </div>
                )}
            </div>
        </div>
    );
}
