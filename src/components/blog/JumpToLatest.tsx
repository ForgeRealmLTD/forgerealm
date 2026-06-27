import { useEffect, useState } from 'react';

interface LatestMeta {
  label: string;
  date: string;
}

/**
 * Floating widget that jumps the reader to the latest stall on the
 * timeline. Hidden until the reader has scrolled past the hero, and
 * hidden again once the latest stall is in the viewport.
 */
export default function JumpToLatest() {
  const [mounted, setMounted] = useState(false);
  const [meta, setMeta] = useState<LatestMeta | null>(null);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [latestInView, setLatestInView] = useState(false);

  useEffect(() => {
    setMounted(true);
    const target = document.querySelector<HTMLElement>('[data-latest-stall]');
    if (target) {
      setMeta({
        label: target.dataset.stallLabel ?? 'Latest stall',
        date: target.dataset.stallDate ?? '',
      });
    }

    const onScroll = () => {
      setScrolledPastHero(window.scrollY > 400);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    let io: IntersectionObserver | null = null;
    if (target) {
      io = new IntersectionObserver(
        ([entry]) => setLatestInView(entry.isIntersecting),
        { rootMargin: '-15% 0px -25% 0px' }
      );
      io.observe(target);
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      io?.disconnect();
    };
  }, []);

  const jump = () => {
    const target = document.querySelector<HTMLElement>('[data-latest-stall]');
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!mounted || !meta) return null;

  const visible = scrolledPastHero && !latestInView;
  const ariaLabel = meta.date
    ? `Jump to ${meta.label}, ${meta.date}`
    : `Jump to ${meta.label}`;

  return (
    <div
      className={`group fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-2'
      }`}
    >
      <div className="relative">
        {/* Breathing cyan halo behind the pill (disabled when reduced motion is preferred) */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-2 rounded-full bg-cyan-400/40 blur-2xl animate-pulse motion-reduce:animate-none"
        />
        {/* Date preview chip, revealed on hover */}
        {meta.date && (
          <div
            className="pointer-events-none absolute bottom-full right-0 mb-2 rounded-full border border-cyan-300/30 bg-slate-900/85 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-200 backdrop-blur-md opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 whitespace-nowrap"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            {meta.date}
          </div>
        )}
        <button
          type="button"
          onClick={jump}
          aria-label={ariaLabel}
          aria-hidden={!visible}
          tabIndex={visible ? 0 : -1}
          className="relative inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-gradient-to-r from-blue-500/80 via-cyan-500/80 to-blue-500/80 px-4 py-2.5 sm:px-5 sm:py-3 text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.22em] text-white backdrop-blur-xl shadow-[0_10px_30px_-10px_rgba(34,211,238,0.55)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f1a]"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          <span className="hidden sm:inline">Jump to {meta.label}</span>
          <span className="sm:hidden">{meta.label}</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-y-0.5"
          >
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
