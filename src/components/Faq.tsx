"use client";
import { HiChevronDown } from "react-icons/hi";
import { FaQuestionCircle } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";

const useTheme = () => {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const getTheme = () =>
      (typeof document !== "undefined" && (document.documentElement.getAttribute("data-theme") as "light" | "dark" | null)) ||
      "dark";

    setTheme(getTheme());

    if (typeof MutationObserver !== "undefined") {
      const observer = new MutationObserver(() => setTheme(getTheme()));
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      return () => observer.disconnect();
    }
  }, []);

  return theme;
};

export default function Faq() {
  const theme = useTheme();
  const isLight = theme === "light";
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const faqs = [
    {
      q: "Where do you sell and ship?",
      a:
        "We're based in Leeds and you'll often find us at local stalls. We ship 3D prints anywhere in the UK. Order online or visit us in person for friendly, expert advice.",
    },
    {
      q: "Are your materials eco-friendly?",
      a:
        "We care about the impact of every part we sell. Our PLA is biodegradable, and we offer PETG with recyclable properties. We're always working to make 3D printing more sustainable.",
    },
    {
      q: "Can I order custom prints?",
      a:
        "Absolutely! Contact us with your ideas or designs. We're happy to help and love bringing your projects to life. Expect quality prints and friendly service.",
    },
  ];

  useEffect(() => {
    if (!sectionRef.current) return;
    if (typeof window === "undefined") return;
    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "120px 0px -10% 0px" }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="faq"
      ref={sectionRef}
      data-observe
      className={`reveal theme-surface relative py-24 overflow-hidden border-y ${isVisible ? "is-visible" : ""} ${isLight ? "bg-gradient-to-bl from-slate-50 via-blue-50 to-indigo-50 border-slate-200/50" : "bg-gradient-to-bl from-[#0b0b0e] via-[#101018] to-[#1a1408] border-white/10"}`}
    >
      {/* Enhanced ambient lighting with more depth */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/3 h-96 w-96 rounded-full bg-gradient-to-r from-amber-400/30 to-yellow-300/20 blur-[160px] animate-pulse" />
        <div className="absolute right-1/6 bottom-1/4 h-80 w-80 rounded-full bg-gradient-to-r from-orange-400/25 to-amber-300/20 blur-[140px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 rounded-full bg-gradient-to-r from-yellow-400/20 to-amber-300/15 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/3 right-1/4 h-48 w-48 rounded-full bg-gradient-to-r from-orange-500/15 to-yellow-400/10 blur-[100px] animate-pulse" style={{ animationDelay: '0.5s' }} />

        {/* Floating particles for FAQ */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-amber-400/50 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${3 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Original ambient yellow glow lights */}
      <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-yellow-200/30 blur-[120px] -z-10" />
      <div className="absolute right-1/3 bottom-0 h-72 w-72 rounded-full bg-amber-400/20 blur-[120px] -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr] xl:grid-cols-[400px_1fr]">
          {/* Enhanced Left spotlight */}
          <div className="relative order-1 lg:order-1">
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-amber-400/20 via-yellow-500/10 to-transparent blur-[120px]" />
            <div className={`relative rounded-[2rem] border backdrop-blur-2xl shadow-[0_30px_90px_rgba(0,0,0,0.45)] transition-all duration-300 hover:scale-[1.02] p-6 ${isLight ? "border-slate-200/50 bg-white/80 hover:border-amber-300/60 hover:bg-white/90 hover:shadow-[0_30px_90px_rgba(251,191,36,0.2)]" : "border-white/10 bg-white/5 hover:border-amber-300/60 hover:bg-white/10 hover:shadow-[0_0_40px_rgba(251,191,36,0.3)]"}`}>
              <div className="flex items-center gap-3">
                <div className={`rounded-full border bg-amber-300/10 p-2 shadow-[0_0_20px_rgba(255,230,150,0.35)] transition-all duration-300 hover:scale-110 ${isLight ? "border-amber-300/60 bg-amber-200/20 text-amber-700 hover:border-amber-400/80 hover:bg-amber-300/30 hover:shadow-[0_0_30px_rgba(255,230,150,0.6)]" : "border-amber-200/40 text-amber-100 hover:border-amber-300/60 hover:bg-amber-400/20 hover:shadow-[0_0_30px_rgba(255,230,150,0.5)]"}`}>
                  <FaQuestionCircle className="h-6 w-6" aria-hidden />
                </div>
                <div>
                  <p className={`text-xs uppercase tracking-[0.35em] ${isLight ? "text-amber-700" : "text-amber-200/70"}`}>Help Center</p>
                  <div className="relative">
                    <h2 className={`font-display text-3xl font-extrabold drop-shadow-[0_0_20px_rgba(245,158,11,0.5)] ${isLight ? "text-slate-900" : "text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-yellow-200"}`}>FAQs</h2>
                    <div className={`absolute -inset-1 blur-xl rounded-lg -z-10 ${isLight ? "bg-gradient-to-r from-amber-400/30 to-yellow-300/20" : "bg-gradient-to-r from-amber-500/20 to-yellow-400/20"}`} />
                  </div>
                </div>
              </div>
              <p className={`mt-4 text-sm transition-colors duration-300 ${isLight ? "text-slate-600 hover:text-slate-800" : "text-slate-300 hover:text-slate-200"}`}>
                Quick answers to shipping, materials, and custom prints. Tap any question to expand.
              </p>
              <div className={`mt-6 grid gap-3 text-xs ${isLight ? "text-slate-600" : "text-slate-300"}`}>
                <div className={`rounded-xl border px-4 py-3 transition-all duration-300 hover:scale-105 ${isLight ? "border-slate-200/50 bg-white/60 hover:border-amber-300/60 hover:bg-amber-100/80 hover:shadow-[0_0_20px_rgba(251,191,36,0.2)]" : "border-white/10 bg-white/5 hover:border-amber-300/60 hover:bg-amber-400/10 hover:shadow-[0_0_20px_rgba(251,191,36,0.2)]"}`}>
                  <p className={`uppercase tracking-[0.3em] text-[10px] ${isLight ? "text-amber-700" : "text-amber-200"}`}>Response time</p>
                  <p className={`mt-1 font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>Under 24 hours</p>
                </div>
                <div className={`rounded-xl border px-4 py-3 transition-all duration-300 hover:scale-105 ${isLight ? "border-slate-200/50 bg-white/60 hover:border-amber-300/60 hover:bg-amber-100/80 hover:shadow-[0_0_20px_rgba(251,191,36,0.2)]" : "border-white/10 bg-white/5 hover:border-amber-300/60 hover:bg-amber-400/10 hover:shadow-[0_0_20px_rgba(251,191,36,0.2)]"}`}>
                  <p className={`uppercase tracking-[0.3em] text-[10px] ${isLight ? "text-amber-700" : "text-amber-200"}`}>Shipping</p>
                  <p className={`mt-1 font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>UK wide delivery</p>
                </div>
                <div className={`rounded-xl border px-4 py-3 transition-all duration-300 hover:scale-105 ${isLight ? "border-slate-200/50 bg-white/60 hover:border-amber-300/60 hover:bg-amber-100/80 hover:shadow-[0_0_20px_rgba(251,191,36,0.2)]" : "border-white/10 bg-white/5 hover:border-amber-300/60 hover:bg-amber-400/10 hover:shadow-[0_0_20px_rgba(251,191,36,0.2)]"}`}>
                  <p className={`uppercase tracking-[0.3em] text-[10px] ${isLight ? "text-amber-700" : "text-amber-200"}`}>Materials</p>
                  <p className={`mt-1 font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>PLA and PETG</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced FAQ items */}
          <div className="space-y-4 order-2 lg:order-2">
            {faqs.map((item, idx) => (
              <details
                key={item.q}
                className={`group rounded-[1.5rem] border backdrop-blur-md transition-all duration-300 hover:scale-[1.02] ${isLight ? "border-slate-200/50 bg-white/80 hover:border-amber-300/60 hover:bg-white/90 hover:shadow-[0_0_40px_rgba(251,191,36,0.3)]" : "border-white/10 bg-white/5 hover:border-amber-300/60 hover:bg-white/10 hover:shadow-[0_0_40px_rgba(251,191,36,0.3)]"}`}
              >
                <summary className={`flex cursor-pointer list-none items-center gap-4 px-6 py-5 ${isLight ? "text-slate-900" : "text-white"}`}>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full border bg-amber-400/10 text-xs font-semibold tracking-[0.25em] shadow-[0_0_15px_rgba(251,191,36,0.4)] transition-all duration-300 ${isLight ? "border-amber-300/60 text-amber-700 group-hover:border-amber-400/80 group-hover:bg-amber-200/30" : "border-amber-200/40 text-amber-100 group-hover:border-amber-300/60 group-hover:bg-amber-400/20"}`}>
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className={`text-base font-semibold transition-colors duration-300 ${isLight ? "text-slate-800 group-hover:text-slate-900" : "text-white/90 group-hover:text-white"}`}>{item.q}</span>
                  <span className={`ml-auto flex h-9 w-9 items-center justify-center rounded-full border bg-white/5 transition-all duration-300 group-open:rotate-180 ${isLight ? "border-slate-200/50 text-slate-600 group-hover:border-amber-300/60 group-hover:bg-amber-100/80 group-hover:text-amber-700" : "border-white/10 text-white/70 group-hover:border-amber-300/60 group-hover:bg-amber-400/10 group-hover:text-amber-200"}`}>
                    <HiChevronDown />
                  </span>
                </summary>
                <div className={`px-6 pb-6 text-sm transition-colors duration-300 ${isLight ? "text-slate-600 group-hover:text-slate-800" : "text-slate-300 group-hover:text-slate-200"}`}>{item.a}</div>
              </details>
            ))}
          </div>
        </div>

        {/* FAQPage JSON-LD */}
        <script
          id="ld-faq"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            }),
          }}
        />
      </div>
    </section>
  );
}
