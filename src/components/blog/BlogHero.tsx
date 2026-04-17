import SplitText from '../reactbits/SplitText';
import BlurText from '../reactbits/BlurText';
import GradientText from '../reactbits/GradientText';
import Aurora from '../reactbits/Aurora';

export default function BlogHero() {
  return (
    <section className="relative overflow-hidden bg-[#0a0f1a]">
      {/* Subtle ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[250px]" style={{ animation: 'glow-pulse 4s ease-in-out infinite' }} />
        <div className="absolute -right-40 top-10 h-[500px] w-[500px] rounded-full bg-indigo-600/8 blur-[220px]" style={{ animation: 'glow-pulse 4s ease-in-out infinite 1s' }} />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 py-16 sm:py-24 lg:grid-cols-2 lg:py-32">
          {/* Left — text */}
          <div>
            <div className="mb-4 sm:mb-5 inline-flex items-center gap-3">
              <div className="w-8 h-px bg-blue-400/50" />
              <span className="text-[13px] sm:text-[15px] font-medium uppercase tracking-[0.28em] text-blue-300/70" style={{ fontFamily: "'Jost', sans-serif" }}>
                ForgeRealm Journal
              </span>
            </div>

            <h1 className="text-3xl font-bold leading-[0.95] tracking-tight sm:text-5xl lg:text-[4rem]" style={{ fontFamily: "'Cinzel', serif" }}>
              <SplitText
                text="Lore &"
                splitBy="char"
                delay={30}
                duration={500}
                className="inline"
              />
              <br />
              <GradientText
                colors={['#3b82f6', '#06b6d4', '#10b981', '#3b82f6']}
                animationSpeed={6}
                className="text-3xl sm:text-5xl lg:text-[4rem]"
              >
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 300, fontSize: '1.1em' }}>
                  Legends
                </span>
              </GradientText>
            </h1>

            <div className="mt-5 sm:mt-6 max-w-md">
              <BlurText
                text="Product drops, booth tales, and behind-the-scenes myths from our Leeds workshop."
                className="text-base sm:text-lg leading-relaxed text-slate-400/90"
                splitBy="word"
                delay={30}
                duration={500}
              />
            </div>

            <div className="mt-8 flex flex-wrap gap-2.5 sm:gap-3">
              <a
                href="/subscribe"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 px-6 py-2.5 sm:px-7 sm:py-3 text-[12px] sm:text-[15px] font-semibold uppercase tracking-[0.14em] text-white shadow-xl shadow-blue-500/25 transition-all hover:-translate-y-0.5 hover:shadow-blue-500/40"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                <span className="relative z-10">Subscribe</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
              <a
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.03] px-6 py-2.5 sm:px-7 sm:py-3 text-[12px] sm:text-[15px] font-semibold uppercase tracking-[0.14em] text-white/70 backdrop-blur-xl transition-all hover:border-blue-400/30 hover:text-white"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Main Site
              </a>
            </div>

            <div className="mt-6 sm:mt-8 flex flex-wrap gap-x-4 sm:gap-x-5 gap-y-1.5 text-[13px] sm:text-[15px] text-slate-500">
              {['Booth tales', 'Drop announcements', 'Workshop myths'].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-500/60" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right — Aurora portal */}
          <div className="relative hidden lg:flex items-center justify-center">
            <div className="relative mx-auto w-[380px] h-[380px]">
              {/* Outer glow rings */}
              <div className="absolute -inset-8 rounded-full border border-white/[0.04]" />
              <div className="absolute -inset-16 rounded-full border border-white/[0.02]" />
              <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10 blur-2xl" style={{ animation: 'glow-pulse 4s ease-in-out infinite' }} />

              {/* Aurora orb */}
              <div className="relative w-full h-full rounded-full overflow-hidden border border-white/[0.08] shadow-2xl shadow-blue-500/20">
                <Aurora
                  colorStops={['#3b82f6', '#06b6d4', '#10b981']}
                  amplitude={1.4}
                  blend={0.7}
                  speed={0.6}
                />
                {/* Inner overlay for depth */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#0a0f1a_80%)]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a]/60 via-transparent to-transparent" />

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <div className="relative">
                    <div className="absolute -inset-6 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-400/20 blur-2xl" style={{ animation: 'glow-pulse 4s ease-in-out infinite' }} />
                    <img src="/frlogorv.png" alt="ForgeRealm" width={100} height={100} className="relative rounded-2xl" style={{ animation: 'float 6s ease-in-out infinite' }} loading="eager" />
                  </div>
                  <p className="mt-4 text-xs tracking-[0.3em] uppercase text-slate-400" style={{ fontFamily: "'Jost', sans-serif" }}>
                    The Journal
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0f1a] to-transparent" />
    </section>
  );
}
