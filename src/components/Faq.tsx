"use client";

import { useEffect, useRef, useState } from "react";

export default function Faq() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const faqs = [
    {
      q: "Where do you sell and ship?",
      a: "We're based in Leeds and you'll often find us at local stalls. We ship 3D prints anywhere in the UK. Order online or visit us in person for friendly, expert advice.",
    },
    {
      q: "Are your materials eco-friendly?",
      a: "We care about the impact of every part we sell. Our PLA is biodegradable, and we offer PETG with recyclable properties. We're always working to make 3D printing more sustainable.",
    },
    {
      q: "Can I order custom prints?",
      a: "Absolutely! Contact us with your ideas or designs. We're happy to help and love bringing your projects to life. Expect quality prints and friendly service.",
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
      { threshold: 0.12, rootMargin: "120px 0px -10% 0px" },
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="faq"
      ref={sectionRef}
      data-observe
      suppressHydrationWarning
      className={`reveal fr-paper fr-sheet relative my-3 overflow-hidden py-16 sm:my-4 sm:py-24 lg:py-28 ${isVisible ? "is-visible" : ""}`}
    >
      <div className="fr-wrap relative">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Left: heading and the quick facts, as a ruled list */}
          <div className="lg:col-span-5">
            <h2 className="fr-h2 !text-[clamp(4.5rem,11vw,9.5rem)]">FAQs</h2>
            <p className="fr-body mt-5 max-w-sm">
              Quick answers to shipping, materials, and custom prints. Tap any
              question to expand.
            </p>
            <dl className="fr-line mt-8 max-w-md border-t">
              {[
                { label: "Response time", value: "Under 24 hours" },
                { label: "Shipping", value: "UK wide delivery" },
                { label: "Materials", value: "PLA and PETG" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="fr-line flex items-baseline justify-between gap-6 border-b py-3.5"
                >
                  <dt className="fr-label fr-fg-3">{stat.label}</dt>
                  <dd className="fr-px text-right text-[1.6rem] leading-none">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Right: the questions, hairline-ruled */}
          <div className="fr-line-2 border-t lg:col-span-7">
            {faqs.map((item, idx) => (
              <details key={item.q} className="fr-acc fr-line border-b">
                <summary className="flex items-center gap-4 py-6 sm:gap-5 sm:py-7">
                  <span
                    className="fr-px grid h-9 w-9 flex-none place-items-center pb-0.5 text-[1.45rem] leading-none sm:h-10 sm:w-10 sm:text-[1.6rem]"
                    style={{
                      background: "var(--accent-text)",
                      color: "var(--bg)",
                    }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="fr-h3 flex-1 !text-[clamp(1.65rem,2.5vw,2.25rem)]">
                    {item.q}
                  </span>
                  <span
                    className="fr-acc__icon fr-line-2 grid h-10 w-10 flex-none place-items-center rounded-full border"
                    aria-hidden="true"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M7 1.5v11M1.5 7h11"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </summary>
                <div className="fr-body max-w-3xl pb-7 pl-[3.25rem] pr-4 sm:pl-[3.75rem] sm:pr-16">
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
