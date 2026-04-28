'use client';

import { useEffect, useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

interface StreamingTextProps {
    text: string;
    isStreaming?: boolean;
    speed?: number;
    className?: string;
}

export default function StreamingText({ text, isStreaming = false, speed = 3, className = '' }: StreamingTextProps) {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!isStreaming) {
            setDisplayedText(text);
            setCurrentIndex(text.length);
            return;
        }

        if (currentIndex < text.length) {
            const timer = setTimeout(() => {
                const nextIndex = Math.min(currentIndex + speed, text.length);
                setDisplayedText(text.slice(0, nextIndex));
                setCurrentIndex(nextIndex);
            }, 20);
            return () => clearTimeout(timer);
        }
    }, [text, currentIndex, isStreaming, speed]);

    useEffect(() => {
        if (isStreaming) {
            setCurrentIndex(0);
            setDisplayedText('');
        }
    }, [text, isStreaming]);

    const isTyping = isStreaming && currentIndex < text.length;

    // Custom renderers for card-based markdown sections
    const components: Components = useMemo(() => ({
        h2: ({ children }) => (
            <div className="ai-card-section animate-fade-in-up">
                <h2 className="ai-card-section-title">{children}</h2>
            </div>
        ),
        h3: ({ children }) => (
            <h3 className="ai-card-subsection-title">{children}</h3>
        ),
        blockquote: ({ children }) => (
            <div className="ai-highlight-card">
                <div className="ai-highlight-bar" />
                <div className="ai-highlight-content">{children}</div>
            </div>
        ),
        table: ({ children }) => (
            <div className="ai-data-card">
                <table className="ai-data-table">{children}</table>
            </div>
        ),
        ul: ({ children }) => (
            <ul className="ai-list">{children}</ul>
        ),
        ol: ({ children }) => (
            <ol className="ai-list ai-list-ordered">{children}</ol>
        ),
        li: ({ children }) => (
            <li className="ai-list-item">{children}</li>
        ),
        strong: ({ children }) => (
            <strong className="ai-bold">{children}</strong>
        ),
        code: ({ children, className: codeClassName }) => {
            const isInline = !codeClassName;
            if (isInline) {
                return <code className="ai-inline-code">{children}</code>;
            }
            return (
                <div className="ai-code-card">
                    <code className={codeClassName}>{children}</code>
                </div>
            );
        },
        p: ({ children }) => (
            <p className="ai-paragraph">{children}</p>
        ),
        a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="ai-link">
                {children}
            </a>
        ),
    }), []);

    return (
        <div className={`ai-prose-cards ${className}`}>
            <ReactMarkdown components={components}>{displayedText}</ReactMarkdown>
            {isTyping && (
                <span className="typing-cursor inline-block" />
            )}
        </div>
    );
}
