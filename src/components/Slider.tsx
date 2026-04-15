'use client';

export default function ProductsMarquee() {
  return (
    <div
      aria-label="What we make"
      data-observe
      className="reveal relative py-6 border-y border-white/10 bg-[#0a0a0a] overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center gap-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex animate-[marquee_25s_linear_infinite] gap-10 whitespace-nowrap text-xs sm:text-sm uppercase tracking-[0.25em]" style={{ color: '#FADE6A' }}>
            {[
              "Fidget Toys",
              "White Vases",
              "Halloween Trinkets",
              "D&D Dice Holders",
              "Phone Stands",
              "Keychains",
              "Book Stands",
              "Figurines (Dragons, Cats)",
              "Cosplay Props",
              "...and more",
            ].map((item, i) => (
              <span key={i} style={{ fontFamily: "'Cinzel', serif" }}>
                {item}
                {i < 9 && (
                  <span className="ml-10 text-yellow-300/50" aria-hidden="true">
                    ·
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
