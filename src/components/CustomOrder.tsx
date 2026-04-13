import { useState, useEffect, useRef, useCallback } from 'react';
import { FiArrowLeft, FiMail, FiImage, FiBox, FiMessageCircle, FiChevronRight } from 'react-icons/fi';

const EMAIL = 'info@forgerealm.co.uk';

const GUIDE_STEPS = [
  {
    icon: FiMessageCircle,
    title: 'Describe your idea',
    description: 'What do you want printed? Be as detailed as you like: character, animal, functional item, home decor, or something entirely new.',
    example: 'e.g. "An articulated phoenix with spread wings, about 15cm tall"',
  },
  {
    icon: FiBox,
    title: 'Size & dimensions',
    description: 'Give us a rough size. Use centimetres, or compare it to something: palm-sized, desk-sized, shelf piece, etc.',
    example: 'e.g. "About the size of a coffee mug" or "20cm x 10cm"',
  },
  {
    icon: FiImage,
    title: 'Reference image (optional)',
    description: 'Attach a photo, sketch, or link to something similar. This helps us nail the design. Screenshots, Pinterest links, anything works.',
    example: 'Attach to your email or paste a link',
  },
];

const EXTRAS = [
  'Preferred colour or finish',
  'Quantity needed',
  'Any deadline or occasion',
  'Budget range (helps us suggest options)',
];

/* ── Particle Canvas ── */

function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particles: { x: number; y: number; vx: number; vy: number; r: number; o: number }[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const createParticles = () => {
      const count = Math.min(80, Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 12000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        o: Math.random() * 0.4 + 0.1,
      }));
    };

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96, 165, 250, ${p.o})`;
        ctx.fill();
      }

      const maxDist = 120;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(96, 165, 250, ${0.08 * (1 - dist / maxDist)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    resize();
    createParticles();
    draw();

    const onResize = () => { resize(); createParticles(); };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    const cleanup = init();
    return cleanup;
  }, [init]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}

/* ── Main Component ── */

export default function CustomOrder() {
  const [copied, setCopied] = useState(false);

  const subject = encodeURIComponent('Custom Order Request');
  const body = encodeURIComponent(
`Hi ForgeRealm,

I'd like to request a custom 3D print.

WHAT I'D LIKE:
[Describe your idea here]

SIZE:
[Approximate dimensions or comparison]

COLOUR / FINISH:
[Any preference]

QUANTITY:
[How many]

ADDITIONAL NOTES:
[Anything else: deadline, budget, etc.]

Thanks!`
  );

  const mailtoLink = `mailto:${EMAIL}?subject=${subject}&body=${body}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-screen">
      {/* Particle background */}
      <ParticleBackground />

      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[250px]" />
        <div className="absolute -right-40 top-1/3 h-[400px] w-[400px] rounded-full bg-indigo-600/8 blur-[200px]" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-cyan-500/6 blur-[200px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Main container */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0a0f1a]/80 backdrop-blur-2xl shadow-2xl shadow-black/30 p-6 sm:p-10 space-y-10">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-500">
            <a href="/" className="hover:text-white transition">Home</a>
            <span>/</span>
            <a href="/shop" className="hover:text-white transition">Shop</a>
            <span>/</span>
            <span className="text-slate-300">Custom Order</span>
          </nav>

          {/* Header */}
          <div className="space-y-4">
            <a
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-white"
            >
              <FiArrowLeft className="text-sm" />
              Back to shop
            </a>
            <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
              Custom Order
            </h1>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl">
              Got something specific in mind? We love a challenge. Tell us your idea and we'll quote you a price, timeline, and bring it to life in eco-friendly PLA.
            </p>
          </div>

          {/* How it works */}
          <section className="space-y-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-blue-400/80">
              What to include
            </h2>

            <div className="space-y-3">
              {GUIDE_STEPS.map((step, i) => (
                <div
                  key={step.title}
                  className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5 transition hover:border-white/[0.1] hover:bg-white/[0.04]"
                >
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-blue-400">
                      <step.icon className="text-lg" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-blue-400/60">{String(i + 1).padStart(2, '0')}</span>
                        <h3 className="text-sm font-semibold text-white">{step.title}</h3>
                      </div>
                      <p className="text-[13px] leading-relaxed text-slate-400">{step.description}</p>
                      <p className="text-[11px] text-slate-500 italic">{step.example}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Optional extras */}
          <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 mb-4">
              Helpful extras (optional)
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {EXTRAS.map((item) => (
                <div key={item} className="flex items-center gap-2.5 text-[13px] text-slate-400">
                  <FiChevronRight className="text-blue-400/50 text-xs shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </section>

          {/* CTA - mailto */}
          <section className="rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-5 sm:p-8 space-y-5">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white sm:text-2xl">Ready? Send us an email</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                No forms, no sign-ups. Just hit the button below and it'll open your email with a template ready to fill in. Attach any reference images directly to the email.
              </p>
            </div>

            <a
              href={mailtoLink}
              className="group inline-flex items-center gap-3 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 shadow-lg shadow-white/10 transition-all hover:bg-white/90 hover:-translate-y-0.5"
            >
              <FiMail className="text-lg" />
              Open email with template
            </a>

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/[0.06]">
              <p className="text-xs text-slate-500">
                Or email us directly at
              </p>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
              >
                {EMAIL}
                <span className="text-[10px] text-slate-500">
                  {copied ? 'copied!' : 'click to copy'}
                </span>
              </button>
            </div>
          </section>

          {/* What to expect */}
          <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 mb-3">
              What happens next
            </h3>
            <div className="space-y-3 text-[13px] text-slate-400 leading-relaxed">
              <div className="flex gap-3">
                <span className="shrink-0 text-blue-400/60 font-bold text-[10px] mt-0.5">01</span>
                <p>We'll review your request and get back to you within 24-48 hours with a quote and estimated timeline.</p>
              </div>
              <div className="flex gap-3">
                <span className="shrink-0 text-blue-400/60 font-bold text-[10px] mt-0.5">02</span>
                <p>Once you approve, we'll start printing. Most custom orders take 3-7 days depending on complexity.</p>
              </div>
              <div className="flex gap-3">
                <span className="shrink-0 text-blue-400/60 font-bold text-[10px] mt-0.5">03</span>
                <p>We'll send you a photo of the finished piece before shipping. Payment is handled securely via our shop.</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
