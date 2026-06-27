import { useEffect, useState } from 'react';

interface LatestMeta {
  label: string;
  date: string;
}

/**
 * Floating widget that jumps the reader to the latest stall on the
 * timeline. Reads the latest stall's label + date from the DOM so it can
 * surface a preview next to the jump action.
 */
export default function JumpToLatest() {
  const [mounted, setMounted] = useState(false);
  const [meta, setMeta] = useState<LatestMeta | null>(null);

  useEffect(() => {
    setMounted(true);
    const target = document.querySelector<HTMLElement>('[data-latest-stall]');
    if (!target) return;
    setMeta({
      label: target.dataset.stallLabel ?? 'Latest stall',
      date: target.dataset.stallDate ?? '',
    });
  }, []);

  const jump = () => {
    const target = document.querySelector<HTMLElement>('[data-latest-stall]');
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!mounted || !meta) return null;

  return (
    <button
      type="button"
      onClick={jump}
      className="fixed bottom-6 right-6 z-40 rounded-full bg-slate-800 text-white px-4 py-2 text-sm"
    >
      Jump to {meta.label}
    </button>
  );
}
