'use client';

import { Suspense, useState } from 'react';
import SearchInput from "@/components/SearchInput";
import TrendingTopics from "@/components/TrendingTopics";
import ThemeToggle from "@/components/ThemeToggle";
import Footer from "@/components/Footer";
import { Shuffle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Random knowledge topics for the "Random Knowledge" button
const randomTopics = [
  'How do black holes form',
  'History of the Internet',
  'What is CRISPR gene editing',
  'How does photosynthesis work',
  'Origins of the universe',
  'How do vaccines work',
  'What is blockchain technology',
  'How does the human immune system work',
  'What are gravitational waves',
  'How does machine learning work',
  'The history of mathematics',
  'What is dark matter',
  'How do neural networks learn',
  'What causes aurora borealis',
  'How does quantum entanglement work',
  'The evolution of human language',
  'How do tectonic plates move',
  'What is the Fermi paradox',
  'How does memory work in the brain',
  'The science of sleep',
];

function RandomKnowledgeButton() {
  const randomTopic = randomTopics[Math.floor(Math.random() * randomTopics.length)];
  return (
    <Link
      href={`/search?q=${encodeURIComponent(randomTopic)}`}
      className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium
        bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-700 dark:text-amber-300
        border border-amber-200 dark:border-amber-800/50
        hover:from-amber-500 hover:to-orange-500 hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-amber-500/20
        transition-all duration-300"
    >
      <Shuffle className="w-4 h-4" />
      Random Knowledge
      <ArrowRight className="w-3.5 h-3.5 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
    </Link>
  );
}

export default function Home() {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="flex min-h-screen flex-col justify-between overflow-hidden relative bg-[var(--background)]">
      {/* Background Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Dot Grid */}
      <div className="absolute inset-0 bg-grid opacity-30 -z-10" />

      {/* Smartpedia Logo - Top Left (during focus) */}
      {isFocused && (
        <div className="fixed top-4 left-4 z-50 animate-fade-in flex items-center gap-2 select-none pointer-events-none">
          <div className="w-9 h-9 rounded-xl bg-[var(--card)] border border-[var(--card-border)] flex items-center justify-center shadow-sm shadow-indigo-500/10">
            <img src="/favicon.ico" alt="Smartpedia" className="w-5 h-5 object-contain" />
          </div>
          <span className="text-sm md:text-base font-dynapuff font-extrabold tracking-[0.15em] text-indigo-500 uppercase">
            Smartpedia
          </span>
        </div>
      )}

      {/* Theme Toggle - Top Right */}
      <div className="fixed top-4 right-4 z-50 animate-fade-in opacity-0" style={{ animationDelay: '1200ms', animationFillMode: 'forwards' }}>
        <ThemeToggle />
      </div>

      <main className={`flex-1 flex flex-col items-center px-4 py-12 sm:p-8 z-10 w-full max-w-4xl mx-auto gap-8 transition-all duration-500 ease-in-out ${isFocused ? 'justify-start pt-6 md:pt-12' : 'justify-start pt-[18vh] md:pt-[15vh]'}`}>
        {/* Logo Area */}
        <div className={`flex flex-col items-center gap-4 md:gap-6 animate-fade-in-up transition-all duration-500 ease-in-out ${isFocused ? 'opacity-0 h-0 overflow-hidden pointer-events-none -translate-y-full' : ''}`}>
          {/* Brand Icon at the very top */}
          <div className="w-16 h-16 md:w-24 md:h-24 rounded-xl bg-[var(--card)] border border-[var(--card-border)] flex items-center justify-center shadow-lg shadow-indigo-500/10 animate-float">
            <img src="/favicon.ico" alt="Smartpedia" className="w-10 h-10 md:w-14 md:h-14 object-contain" />
          </div>

          {/* BandhanNova Logo with aligned Smartpedia text */}
          <div className="relative mt-2 flex flex-col items-end">
            <img src="/bandhannova-logo-final.svg" alt="BandhanNova" className="h-10 md:h-20 w-auto" />
            <span className="text-xs md:text-lg font-dynapuff font-extrabold tracking-[0.25em] text-indigo-500 uppercase mt-1 md:mt-2 select-none">
              Smartpedia
            </span>
          </div>

          <p className="text-[var(--muted)] text-sm md:text-lg text-center max-w-md leading-relaxed mt-2 animate-fade-in opacity-0 font-medium" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
            Discover the universe of answers effortlessly.
          </p>
        </div>

        {/* Search Input */}
        <div className={`w-full flex justify-center animate-fade-in-up opacity-0 transition-all duration-500 ${isFocused ? 'mt-2' : ''}`} style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
          <Suspense fallback={<div className="w-full max-w-2xl md:max-w-3xl h-14 rounded-full bg-[var(--card)] border border-[var(--card-border)] animate-pulse" />}>
            <SearchInput onFocusChange={setIsFocused} />
          </Suspense>
        </div>
      </main>

      <div className="w-full z-10 mt-auto">
        <Footer />
      </div>
    </div>
  );
}
