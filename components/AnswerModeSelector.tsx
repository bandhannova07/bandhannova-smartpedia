'use client';

import { Zap, BookOpen, Baby, GraduationCap } from 'lucide-react';

export type AnswerMode = 'quick' | 'detailed' | 'eli5' | 'academic';

interface AnswerModeSelectorProps {
    activeMode: AnswerMode;
    onModeChange: (mode: AnswerMode) => void;
    size?: 'sm' | 'md';
}

const modes: { key: AnswerMode; label: string; icon: React.ReactNode; description: string }[] = [
    { key: 'quick', label: 'Quick', icon: <Zap className="w-3.5 h-3.5" />, description: '2-3 line summary' },
    { key: 'detailed', label: 'Detailed', icon: <BookOpen className="w-3.5 h-3.5" />, description: 'Full analysis' },
    { key: 'eli5', label: 'ELI5', icon: <Baby className="w-3.5 h-3.5" />, description: 'Simple explanation' },
    { key: 'academic', label: 'Academic', icon: <GraduationCap className="w-3.5 h-3.5" />, description: 'Research-grade' },
];

export default function AnswerModeSelector({ activeMode, onModeChange, size = 'md' }: AnswerModeSelectorProps) {
    return (
        <div className="flex items-center gap-1.5 flex-wrap">
            {modes.map((mode) => {
                const isActive = activeMode === mode.key;
                return (
                    <button
                        key={mode.key}
                        onClick={() => onModeChange(mode.key)}
                        title={mode.description}
                        className={`
              inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-300
              ${size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3.5 py-1.5 text-[13px]'}
              ${isActive
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20 scale-[1.02]'
                                : 'bg-[var(--card)] text-[var(--muted)] border border-[var(--card-border)] hover:border-indigo-400 hover:text-indigo-500 hover:shadow-sm'
                            }
              cursor-pointer
            `}
                    >
                        {mode.icon}
                        <span>{mode.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
