import { useEffect, useRef, useState } from 'react';

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  splitBy?: 'char' | 'word';
}

export default function BlurText({
  text,
  className = '',
  delay = 40,
  duration = 700,
  splitBy = 'word',
}: BlurTextProps) {
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

  return (
    <span ref={ref} className={className} aria-label={text}>
      {units.map((unit, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            display: 'inline-block',
            opacity: visible ? 1 : 0,
            filter: visible ? 'blur(0px)' : 'blur(12px)',
            transform: visible ? 'translateY(0)' : 'translateY(8px)',
            transition: `opacity ${duration}ms ease ${i * delay}ms, filter ${duration}ms ease ${i * delay}ms, transform ${duration}ms ease ${i * delay}ms`,
            whiteSpace: unit === ' ' ? 'pre' : undefined,
          }}
        >
          {unit === ' ' ? '\u00A0' : unit}
          {splitBy === 'word' && i < units.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </span>
  );
}
