"use client";

import { useEffect, useRef, useState } from "react";
import {
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaPhoneAlt,
} from "react-icons/fa";
import { ArrowKnob } from "./landing/ui";

export default function Contact() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

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
      id="contact"
      ref={sectionRef}
      data-observe
      suppressHydrationWarning
      className={`reveal fr-ink fr-plate relative overflow-hidden py-20 sm:py-28 lg:py-32 ${isVisible ? "is-visible" : ""}`}
    >
      <div className="fr-wrap relative">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Contact Info */}
          <div className="lg:col-span-6">
            <h2 className="fr-h2">Contact</h2>

            <p className="fr-body mt-5 max-w-lg">
              Have a design, concept, or a project idea? Let's create something
              extraordinary together.
            </p>

            {/* Contact details, as a ruled table */}
            <dl className="fr-line-2 mt-10 border-t">
              {[
                {
                  title: "Location",
                  detail: "Leeds, United Kingdom",
                  icon: <FaMapMarkerAlt />,
                },
                {
                  title: "Email",
                  detail: "info@forgerealm.co.uk",
                  href: "mailto:info@forgerealm.co.uk",
                  icon: <FaEnvelope />,
                },
                {
                  title: "Phone",
                  detail: "+44 (0) 7344 237800",
                  href: "tel:+447344237800",
                  icon: <FaPhoneAlt />,
                },
                {
                  title: "Hours",
                  detail: "Mon-Fri 08:00-18:00",
                  icon: <FaClock />,
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="fr-line grid grid-cols-[6.5rem_1fr] items-baseline gap-4 border-b py-4 sm:grid-cols-[9rem_1fr]"
                >
                  <dt className="fr-label fr-fg-3 flex items-center gap-2.5">
                    <span className="fr-accent-text text-xs" aria-hidden="true">
                      {item.icon}
                    </span>
                    {item.title}
                  </dt>
                  <dd className="fr-px text-[1.6rem] leading-none sm:text-[1.9rem]">
                    {item.href ? (
                      <a href={item.href} className="fr-link">
                        {item.detail}
                      </a>
                    ) : (
                      item.detail
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Business hours */}
            <div className="mt-10">
              <h3 className="fr-label fr-fg-3 flex items-center gap-2.5">
                <FaClock className="fr-accent-text text-xs" aria-hidden />
                Business Hours
              </h3>
              <dl className="fr-line mt-4 border-t">
                {[
                  { day: "Mon\u2013Fri", hours: "08:00\u201318:00" },
                  { day: "Saturday", hours: "10:00\u201316:00" },
                  { day: "Sunday", hours: "Closed" },
                ].map(({ day, hours }) => (
                  <div
                    key={day}
                    className="fr-line flex items-baseline justify-between border-b py-3"
                  >
                    <dt className="fr-fg-2">{day}</dt>
                    <dd className="fr-px text-[1.45rem] leading-none tabular-nums">
                      {hours}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* CTA: an amber panel, echoing the printer panel in the hero */}
          <div className="lg:sticky lg:top-24 lg:col-span-6 lg:self-start lg:pl-6">
            <div className="fr-amber fr-layers flex min-h-[26rem] flex-col justify-between rounded-[22px] p-7 sm:rounded-[28px] sm:p-10 lg:min-h-[32rem]">
              <div>
                <h2 className="fr-h2 !text-[clamp(3rem,6vw,5.75rem)]">
                  Get in touch
                  <br />
                  with ForgeRealm
                </h2>
                <p className="fr-body mt-6 max-w-md">
                  Reach out directly for collaborations, custom prints, or
                  wholesale orders. We're here to bring your vision to life.
                </p>
              </div>

              <div className="mt-10">
                <a
                  href="mailto:forgerealmltd@gmail.com,info@forgerealm.co.uk"
                  className="fr-btn fr-btn--solid"
                >
                  Send an Email
                  <ArrowKnob />
                </a>

                <p className="fr-fg-3 mt-5 max-w-sm text-sm leading-relaxed">
                  We usually respond within 24 hours on working days. Let's
                  create something amazing together!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
