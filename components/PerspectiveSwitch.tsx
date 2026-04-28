'use client';

import { Zap, Beaker, ShieldAlert, Rocket } from 'lucide-react';

export type Perspective = 'fact' | 'critical' | 'future' | 'community';

interface PerspectiveSwitchProps {
    activePerspective: Perspective;
    onPerspectiveChange: (p: Perspective) => void;
}

export default function PerspectiveSwitch({ activePerspective, onPerspectiveChange }: PerspectiveSwitchProps) {
    const perspectives: { id: Perspective; label: string; icon: any; color: string }[] = [
        { id: 'fact', label: 'Fact-First', icon: Zap, color: 'text-blue-500' },
        { id: 'community', label: 'Community', icon: ShieldAlert, color: 'text-pink-500' },
        { id: 'critical', label: 'Critical View', icon: Beaker, color: 'text-amber-500' },
        { id: 'future', label: 'Future Tech', icon: Rocket, color: 'text-purple-500' },
    ];

    return (
        <div className="flex flex-wrap items-center gap-2 mb-6 p-1.5 rounded-2xl bg-[var(--card)] border border-[var(--card-border)] shadow-sm w-fit animate-fade-in-down">
            {perspectives.map((p) => {
                const Icon = p.icon;
                const isActive = activePerspective === p.id;
                return (
                    <button
                        key={p.id}
                        onClick={() => onPerspectiveChange(p.id)}
                        className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl text-[13px] font-bold transition-all
                            ${isActive
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                : 'text-[var(--muted)] hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : p.color}`} />
                        {p.label}
                    </button>
                );
            })}
        </div>
    );
}
