import SpotlightCard from '../reactbits/SpotlightCard';

interface BlogPostCardProps {
  title: string;
  excerpt: string;
  href: string;
  category?: string;
  date?: string;
  author?: string;
  featured?: boolean;
  index?: number;
}

const GRADIENTS = [
  'rgba(34, 211, 238, 0.12)',
  'rgba(59, 130, 246, 0.12)',
  'rgba(16, 185, 129, 0.12)',
  'rgba(139, 92, 246, 0.12)',
];

export default function BlogPostCard({ title, excerpt, href, category, date, author, featured, index = 0 }: BlogPostCardProps) {
  const spotlightColor = GRADIENTS[index % GRADIENTS.length];

  if (featured) {
    return (
      <a href={href} className="group block">
        <SpotlightCard
          className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl transition-all duration-500 hover:border-cyan-400/20 hover:shadow-2xl hover:shadow-blue-500/10"
          spotlightColor="rgba(6, 182, 212, 0.12)"
        >
          <div className="grid lg:grid-cols-[1.4fr_0.6fr]">
            {/* Left — main content */}
            <div className="relative p-6 sm:p-8 lg:p-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_50%)] pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
              <div className="relative flex flex-col justify-between min-h-[16rem] sm:min-h-[20rem]">
                <div>
                  <div className="inline-flex items-center gap-3">
                    <div className="w-5 h-px bg-cyan-400/50" />
                    <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.28em] text-cyan-300/70" style={{ fontFamily: "'Jost', sans-serif" }}>
                      Featured Entry
                    </span>
                  </div>
                  <h2 className="mt-5 max-w-2xl text-2xl sm:text-3xl lg:text-4xl leading-tight text-white group-hover:text-cyan-100 transition-colors" style={{ fontFamily: "'Cinzel', serif" }}>
                    {title}
                  </h2>
                  <p className="mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-slate-400" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', lineHeight: 1.7 }}>
                    {excerpt}
                  </p>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-cyan-200" style={{ fontFamily: "'Jost', sans-serif" }}>
                    {category || 'Update'}
                  </span>
                  {date && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-slate-600" />
                      <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500" style={{ fontFamily: "'Jost', sans-serif" }}>{date}</span>
                    </>
                  )}
                  {author && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-slate-600" />
                      <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500" style={{ fontFamily: "'Jost', sans-serif" }}>{author}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right — read CTA */}
            <div className="hidden lg:flex flex-col justify-end border-l border-white/[0.06] p-8">
              <div className="flex items-center gap-3 text-sm font-medium text-cyan-300/80 transition group-hover:text-cyan-200" style={{ fontFamily: "'Jost', sans-serif" }}>
                Read full post
                <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
              </div>
            </div>
          </div>
        </SpotlightCard>
      </a>
    );
  }

  return (
    <a href={href} className="group block">
      <SpotlightCard
        className="h-full rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl transition-all duration-500 hover:border-cyan-400/20 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10"
        spotlightColor={spotlightColor}
      >
        <div className="relative p-5 sm:p-6 flex flex-col h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-2xl pointer-events-none" />
          <div className="relative flex flex-col h-full">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-cyan-300/60" style={{ fontFamily: "'Jost', sans-serif" }}>
                {category || 'Update'}
              </span>
              {date && (
                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-600" style={{ fontFamily: "'Jost', sans-serif" }}>{date}</span>
              )}
            </div>

            <h2 className="mt-4 text-lg sm:text-xl leading-tight text-white group-hover:text-cyan-100 transition-colors" style={{ fontFamily: "'Cinzel', serif" }}>
              {title}
            </h2>

            <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', lineHeight: 1.7 }}>
              {excerpt}
            </p>

            <div className="mt-5 flex items-center justify-between gap-4 pt-4 border-t border-white/[0.05]">
              <span className="text-[11px] text-slate-500" style={{ fontFamily: "'Jost', sans-serif" }}>{author || 'ForgeRealm'}</span>
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-cyan-300/60 transition group-hover:text-cyan-300" style={{ fontFamily: "'Jost', sans-serif" }}>
                Read
                <svg className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </span>
            </div>
          </div>
        </div>
      </SpotlightCard>
    </a>
  );
}
