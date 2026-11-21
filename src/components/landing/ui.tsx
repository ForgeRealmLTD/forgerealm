/**
 * Small shared parts of the landing design system (see
 * src/assets/styles/landing.css for the classes they rely on).
 */

/** The round arrow "knob" that sits at the end of an .fr-btn. */
export function ArrowKnob() {
  return (
    <span className="fr-btn__knob" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M1.5 7h11M8 2.5 12.5 7 8 11.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/** Four-point pixel star used as a separator in the marquee. */
export function Spark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="1em"
      height="1em"
      viewBox="0 0 8 8"
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <path d="M3 0h2v3h3v2H5v3H3V5H0V3h3z" />
    </svg>
  );
}
