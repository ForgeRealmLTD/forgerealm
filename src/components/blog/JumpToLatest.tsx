import { useEffect, useState } from 'react';

/**
 * Floating widget that jumps the reader to the latest stall on the
 * timeline. Behaviour and styling layered in over multiple commits.
 */
export default function JumpToLatest() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
      className="fixed bottom-6 right-6 z-40 rounded-full bg-slate-800 text-white px-4 py-2 text-sm"
    >
      Jump to latest
    </button>
  );
}
