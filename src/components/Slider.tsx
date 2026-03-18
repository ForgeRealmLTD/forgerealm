export default function ProductsMarquee() {
  return (
    <div
      aria-label="What we make"
      data-observe
      className="reveal relative py-8 border-y border-white/10 bg-white/5 backdrop-blur-2xl overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-500/12 via-purple-400/10 via-emerald-400/10 to-indigo-500/12 animate-gradient-move" aria-hidden />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center gap-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex animate-[marquee_25s_linear_infinite] gap-12 whitespace-nowrap text-white/90 text-xs sm:text-sm uppercase tracking-[0.2em]">
            <span>Fidget Toys</span>
            <span>White Vases</span>
            <span>Halloween Trinkets</span>
            <span>D&D Dice Holders</span>
            <span>Phone Stands</span>
            <span>Keychains</span>
            <span>Book Stands</span>
            <span>Figurines (Dragons, Cats)</span>
            <span>Cosplay Props</span>
            <span className="italic">...and more</span>
          </div>
        </div>
      </div>
    </div>
  );
}
