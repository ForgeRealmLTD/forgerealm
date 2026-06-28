import { useEffect, useState } from 'react';

/**
 * Inline pill that jumps the reader to the latest stall on the timeline.
 * Sits next to the "Where to find us next" eyebrow at the top of the
 * blog page; smooth-scrolls to whichever entry in StallsTimeline is
 * tagged with `data-latest-stall`.
 */
export default function JumpToLatest() {
  const [mounted, setMounted] = useState(false);
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    const target = document.querySelector<HTMLElement>('[data-latest-stall]');
    if (target) {
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
      aria-label={date ? `Jump to latest post, ${date}` : 'Jump to latest post'}
      className="group inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-cyan-200 backdrop-blur transition hover:border-cyan-300/50 hover:bg-white/[0.06] hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f1a]"
      style={{ fontFamily: "'Jost', sans-serif" }}
    >
      <span>Jump to latest post</span>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3 w-3 transition-transform duration-200 group-hover:translate-y-0.5"
      >
        <path d="M12 5v14M19 12l-7 7-7-7" />
      </svg>
    </button>
  );
}
