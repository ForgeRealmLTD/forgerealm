import { useEffect, useState } from 'react';

/**
 * Big CTA button that jumps the reader to the latest stall on the
 * timeline. Lives in its own section above 'Where to find us next' on
 * the blog page; styled prominently so it reads as a primary action.
 */
export default function JumpToLatest() {
  const [mounted, setMounted] = useState(false);
  const [label, setLabel] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    const target = document.querySelector<HTMLElement>('[data-latest-stall]');
    if (target) {
      setLabel(target.dataset.stallLabel ?? 'latest post');
      setDate(target.dataset.stallDate ?? '');
    }
  }, []);

  const jump = () => {
    const target = document.querySelector<HTMLElement>('[data-latest-stall]');
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={jump}
      aria-label={date ? `Jump to latest post, ${label}, ${date}` : 'Jump to latest post'}
      className="group relative w-full overflow-hidden rounded-2xl border border-cyan-300/30 bg-gradient-to-r from-blue-500/20 via-cyan-500/15 to-blue-500/20 px-6 py-5 sm:px-8 sm:py-6 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(34,211,238,0.45)] transition-all hover:-translate-y-0.5 hover:border-cyan-300/60 hover:shadow-[0_14px_50px_-10px_rgba(34,211,238,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f1a]"
    >
      {/* Decorative breathing glows */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-cyan-400/30 blur-3xl animate-pulse motion-reduce:animate-none"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-blue-500/25 blur-3xl animate-pulse motion-reduce:animate-none"
        style={{ animationDelay: '1.5s' }}
      />

      <span className="relative flex flex-wrap items-center justify-between gap-4">
        <span className="flex items-center gap-4 text-left">
          <span className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300/10">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-200 transition-transform duration-300 group-hover:translate-y-0.5"
            >
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </span>
          <span>
            <span className="block text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.28em] text-cyan-300/80" style={{ fontFamily: "'Jost', sans-serif" }}>
              Jump to latest post
            </span>
            <span className="mt-1 block text-lg sm:text-xl lg:text-2xl text-white" style={{ fontFamily: "'Cinzel', serif" }}>
              {label || 'Latest stall'}
              {date && (
                <em className="ml-2 text-cyan-300/90" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 300 }}>
                  {date}
                </em>
              )}
            </span>
          </span>
        </span>
        <span
          aria-hidden="true"
          className="hidden sm:inline-flex items-center gap-1 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-cyan-100 transition-all group-hover:bg-cyan-300/20 group-hover:border-cyan-300/60"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          Scroll to entry
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5"
          >
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </span>
      </span>
    </button>
  );
}
