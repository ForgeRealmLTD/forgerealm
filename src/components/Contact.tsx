"use client";
import { useState, useEffect, useRef } from "react";
import { FaEnvelope, FaMapMarkerAlt, FaClock, FaEnvelopeOpenText, FaPhoneAlt } from "react-icons/fa";

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

export default function Contact() {
  const theme = useTheme();
  const isLight = theme === "light";
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
      { threshold: 0.12, rootMargin: "120px 0px -10% 0px" }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="contact"
      ref={sectionRef}
      data-observe
      className={`reveal theme-surface relative py-32 overflow-hidden border-y ${isVisible ? "is-visible" : ""} ${isLight ? "bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 border-slate-200/50" : "bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0c0e13] border-white/5"}`}
    >
      {/* Enhanced Ambient lights with more depth */}
      <div className="absolute inset-0 -z-10">
        <div className={`absolute left-1/4 top-1/6 h-96 w-96 rounded-full blur-[160px] animate-pulse ${isLight ? "bg-gradient-to-r from-blue-200/60 to-cyan-100/50" : "bg-gradient-to-r from-blue-500/30 to-cyan-400/20"}`} />
        <div className={`absolute right-1/3 bottom-1/6 h-80 w-80 rounded-full blur-[140px] animate-pulse ${isLight ? "bg-gradient-to-r from-fuchsia-200/55 to-purple-100/45" : "bg-gradient-to-r from-fuchsia-500/25 to-purple-400/20"}`} style={{ animationDelay: '1s' }} />
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full blur-[120px] animate-pulse ${isLight ? "bg-gradient-to-r from-indigo-200/50 to-blue-100/40" : "bg-gradient-to-r from-indigo-500/20 to-blue-400/15"}`} style={{ animationDelay: '2s' }} />
        <div className={`absolute top-0 left-0 right-0 h-32 ${isLight ? "bg-gradient-to-b from-slate-100/30 to-transparent" : "bg-gradient-to-b from-white/10 to-transparent"}`} />
        <div className={`absolute bottom-0 left-0 right-0 h-32 ${isLight ? "bg-gradient-to-t from-slate-100/20 to-transparent" : "bg-gradient-to-t from-white/5 to-transparent"}`} />
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 -z-5 overflow-hidden">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1.5 h-1.5 rounded-full animate-bounce ${isLight ? "bg-gradient-to-r from-blue-300/70 to-cyan-300/60 shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "bg-blue-400/30"}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-20 items-start justify-center">
          {/* Contact Info with enhanced styling */}
          <div className="space-y-10 flex-1 max-w-2xl">
            {/* Header with enhanced glow */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <h2 className={`font-display text-4xl sm:text-5xl font-extrabold ${isLight ? "text-slate-900" : "bg-gradient-to-r from-white via-blue-200 via-cyan-200 to-white text-gradient-animated drop-shadow-[0_0_20px_rgba(125,200,255,0.5)]"}`}>
                  Contact
                </h2>
                <div className={`absolute -inset-2 blur-xl rounded-lg -z-10 ${isLight ? "bg-gradient-to-r from-blue-200/50 to-cyan-100/40" : "bg-gradient-to-r from-blue-500/20 to-cyan-400/20"}`} />
              </div>
              <div className={`relative flex-shrink-0 mt-2 drop-shadow-[0_0_24px_rgba(125,200,255,0.8)] animate-pulse ${isLight ? "text-blue-500" : "text-blue-300"}`}>
                <FaEnvelopeOpenText className="w-8 h-8 sm:w-10 sm:h-10" aria-hidden />
              </div>
            </div>

            <p className="text-lg text-[color:var(--fg)]/80 leading-relaxed">
              Have a design, concept, or a project idea? Let's create something extraordinary together.
            </p>

            {/* Contact details with hover effects */}
            <div className="space-y-6">
              {[
                { title: "Location", detail: "Leeds, United Kingdom", icon: <FaMapMarkerAlt className="text-blue-400" />, hoverColor: "hover:text-blue-300" },
                { title: "Email", detail: "info@forgerealm.co.uk", icon: <FaEnvelope className="text-blue-400" />, hoverColor: "hover:text-blue-300" },
                { title: "Phone", detail: "+44 (0) 7344 237800", icon: <FaPhoneAlt className="text-blue-400" />, hoverColor: "hover:text-blue-300" },
                { title: "Hours", detail: "Mon-Fri 08:00-18:00", icon: <FaClock className="text-blue-400" />, hoverColor: "hover:text-blue-300" },
              ].map((item, idx) => (
                <div
                  key={item.title}
                  className={`hover-shine group flex items-center gap-6 p-6 rounded-3xl border backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-lg ${isLight ? "border-slate-200/60 bg-white/90 hover:border-blue-400/70 hover:bg-white hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]" : "border-white/10 bg-gradient-to-r from-white/5 to-white/2 hover:border-blue-400/40 hover:bg-white/10 hover:shadow-[0_0_35px_rgba(59,130,246,0.3)]"}`}
                  style={{ transform: "none" }}
                >
                  <div className={`flex-shrink-0 p-3 rounded-2xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors ${item.hoverColor}`}>
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-[color:var(--fg)] group-hover:text-blue-200 transition-colors text-lg">
                      {item.title}
                    </div>
                    <div className="text-sm text-[color:var(--fg)]/70 group-hover:text-[color:var(--fg)]/90 transition-colors">
                      {item.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Business hours with enhanced design */}
            <div className={`rounded-3xl border backdrop-blur-xl p-8 transition-all duration-300 hover:shadow-lg group ${isLight ? "border-slate-200/60 bg-white/90 hover:bg-white hover:border-blue-400/70 hover:shadow-[0_0_40px_rgba(59,130,246,0.2)]" : "border-white/10 bg-gradient-to-br from-white/5 to-white/2 hover:bg-white/10 hover:border-blue-400/30 hover:shadow-[0_0_40px_rgba(59,130,246,0.2)]"}`} style={{ transform: "none" }}>
              <div className="flex items-center gap-4 text-[color:var(--fg)] font-semibold mb-6">
                <div className="p-3 rounded-2xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                  <FaClock className="text-blue-400" />
                </div>
                <span className="group-hover:text-blue-200 transition-colors text-xl">Business Hours</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { day: "Mon–Fri", hours: "08:00–18:00" },
                  { day: "Saturday", hours: "10:00–16:00" },
                  { day: "Sunday", hours: "Closed" }
                ].map(({ day, hours }) => (
                  <div key={day} className="flex justify-between items-center p-3 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors">
                    <span className="text-[color:var(--fg)]/70">{day}</span>
                    <span className="font-medium text-[color:var(--fg)] group-hover:text-blue-200 transition-colors">{hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced CTA section */}
          <div className="flex flex-col items-center justify-center text-center space-y-10 flex-1 max-w-lg" style={{ transform: "none" }}>
            <div className="space-y-8">
              <h2 className="text-4xl sm:text-5xl font-display font-extrabold max-w-[32rem] leading-tight">
                <span className={`${isLight ? "text-blue-600" : "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]"}`}>
                  Get in touch
                </span>
                <br />
                <span className={`${isLight ? "text-slate-900" : "text-[color:var(--fg)]"}`}>with ForgeRealm</span>
              </h2>
              <p className={`text-lg max-w-lg leading-relaxed ${isLight ? "text-slate-700" : "text-[color:var(--fg)]/80"}`}>
                Reach out directly for collaborations, custom prints, or wholesale orders. We're here to bring your vision to life.
              </p>
            </div>

            {/* Ultra-sexy email button */}
            <a href="mailto:forgerealmltd@gmail.com,info@forgerealm.co.uk" className="group relative">
              <div className="relative inline-flex h-14 w-72 overflow-hidden rounded-2xl p-[2px] focus:outline-none">
                {/* Multi-layered animated border */}
                <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#ffffff_0%,#3b82f6_20%,#06b6d4_40%,#3b82f6_60%,#ffffff_80%,#3b82f6_100%)]" />
                <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite_reverse] bg-[conic-gradient(from_90deg_at_50%_50%,#ffffff_0%,#06b6d4_25%,#3b82f6_50%,#06b6d4_75%,#ffffff_100%)] opacity-60" />

                {/* Inner glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-cyan-400/20 to-blue-500/20 blur-sm group-hover:blur-md transition-all duration-300" />

                {/* Inner button */}
                <span className="relative inline-flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f] px-8 text-sm font-bold text-white backdrop-blur-3xl transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-[#0f0f1a] group-hover:via-[#101018] group-hover:to-[#0f0f1a] gap-3 border border-white/20 group-hover:border-blue-400/50 group-hover:shadow-[0_0_40px_rgba(59,130,246,0.4)]">
                  <span className="relative z-10">Send an Email</span>
                  <FaEnvelope className="text-blue-400 group-hover:text-cyan-300 transition-colors relative z-10" />
                </span>
              </div>

              {/* Hover effect particles */}
              <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-blue-400 rounded-full animate-ping"
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${20 + Math.random() * 60}%`,
                      animationDelay: `${Math.random() * 1}s`,
                      animationDuration: '1s'
                    }}
                  />
                ))}
              </div>
            </a>

            <p className={`text-sm max-w-sm ${isLight ? "text-slate-600" : "text-[color:var(--fg)]/60"}`}>
              We usually respond within 24 hours on working days. Let's create something amazing together!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
