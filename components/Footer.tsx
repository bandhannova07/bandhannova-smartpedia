import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="w-full mt-auto py-4 md:py-8 border-t border-[var(--card-border)] bg-[var(--card)]/20 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
                <div className="flex items-center gap-3.5">
                    <a
                        href="https://www.bandhannova.in"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <img src="/bandhannova-logo-final.svg" alt="BandhanNova Logo" className="h-6 w-auto flex-shrink-0" />
                    </a>
                </div>
                <div className="flex items-center gap-6 text-xs font-bold text-[var(--muted)]">
                    <Link href="https://policies.bandhannova.in" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">Privacy Policy</Link>
                    <Link href="https://terms.bandhannova.in" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">Terms of Service</Link>
                    <Link href="https://about.bandhannova.in" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">About</Link>
                </div>
            </div>
        </footer>
    );
}
