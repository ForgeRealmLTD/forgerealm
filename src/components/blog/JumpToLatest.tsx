import { useEffect, useState } from 'react';

/**
 * Floating widget that jumps the reader to the latest stall on the
 * timeline. Renders nothing yet; behaviour and styling layered in later
 * commits.
 */
export default function JumpToLatest() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return null;
}
