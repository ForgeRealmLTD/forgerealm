'use client';

import { HiChevronDown } from "react-icons/hi";
import { FaQuestionCircle } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";

export default function Faq() {
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
      className={`reveal relative py-16 sm:py-24 overflow-hidden bg-transparent ${isVisible ? "is-visible" : ""}`}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-1/3 w-[350px] h-[350px] rounded-full bg-blue-500/[0.04] blur-[180px]" />
      </div>
      {/* Top divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr] xl:grid-cols-[400px_1fr]">
          {/* Left spotlight */}
          <div className="relative order-1 lg:order-1">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors duration-300 hover:border-blue-400/40">
              <div className="flex items-center gap-3">
                <div className="rounded-full border border-blue-400/30 bg-blue-400/10 p-2">
                  <FaQuestionCircle className="h-6 w-6 text-blue-400" aria-hidden />
                </div>
                <div>
                  <p
                    className="text-xs uppercase tracking-[0.35em] text-blue-400/70"
                    style={{ fontFamily: "'Jost', sans-serif" }}
                  >
                    Help Center
                  </p>
                  <h2
                    className="text-3xl font-bold text-white"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    FAQs
                  </h2>
                </div>
              </div>
              <p
                className="mt-4 text-sm text-stone-400"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Quick answers to shipping, materials, and custom prints. Tap any question to expand.
              </p>
              <div className="mt-6 grid gap-3 text-xs text-stone-400">
                {[
                  { label: "Response time", value: "Under 24 hours" },
                  { label: "Shipping", value: "UK wide delivery" },
                  { label: "Materials", value: "PLA and PETG" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 transition-colors duration-300 hover:border-blue-400/30"
                  >
                    <p
                      className="uppercase tracking-[0.3em] text-[10px] text-blue-400/70"
                      style={{ fontFamily: "'Jost', sans-serif" }}
                    >
                      {stat.label}
                    </p>
                    <p
                      className="mt-1 font-semibold text-white"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ items */}
          <div className="space-y-4 order-2 lg:order-2">
            {faqs.map((item, idx) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] transition-colors duration-300 hover:border-blue-400/40"
              >
                <summary className="flex cursor-pointer list-none items-center gap-4 px-6 py-5 text-white">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-400/30 bg-blue-400/10 text-xs font-semibold tracking-[0.25em] text-blue-300">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="text-base font-semibold text-white/90 group-hover:text-white transition-colors duration-300"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    {item.q}
                  </span>
                  <span className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/70 transition-transform duration-300 group-open:rotate-180">
                    <HiChevronDown />
                  </span>
                </summary>
                <div
                  className="px-6 pb-6 text-sm text-stone-400"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {item.a}
                </div>
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
