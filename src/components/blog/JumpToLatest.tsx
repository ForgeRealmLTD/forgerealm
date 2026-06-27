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

  return (
    <button
      type="button"
      onClick={jump}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-6 right-6 z-40 rounded-full bg-slate-800 text-white px-4 py-2 text-sm transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-2'
      }`}
    >
      Jump to {meta.label}
    </button>
  );
}
