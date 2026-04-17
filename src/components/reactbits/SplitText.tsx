import { useEffect, useRef, useState } from 'react';

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitBy?: 'char' | 'word';
  staggerFrom?: 'first' | 'last' | 'center';
}

export default function SplitText({
  text,
  className = '',
  delay = 50,
  duration = 600,
  ease = 'cubic-bezier(0.16, 1, 0.3, 1)',
  splitBy = 'char',
  staggerFrom = 'first',
}: SplitTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const units = splitBy === 'word' ? text.split(' ') : text.split('');
  const count = units.length;

  const getDelay = (i: number) => {
    if (staggerFrom === 'last') return (count - 1 - i) * delay;
    if (staggerFrom === 'center') return Math.abs(i - Math.floor(count / 2)) * delay;
    return i * delay;
  };

  return (
    <span ref={ref} className={className} aria-label={text}>
      {units.map((unit, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            display: 'inline-block',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(40px)',
            transition: `opacity ${duration}ms ${ease} ${getDelay(i)}ms, transform ${duration}ms ${ease} ${getDelay(i)}ms`,
            whiteSpace: unit === ' ' ? 'pre' : undefined,
          }}
        >
          {unit === ' ' ? '\u00A0' : unit}
          {splitBy === 'word' && i < count - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </span>
  );
}
