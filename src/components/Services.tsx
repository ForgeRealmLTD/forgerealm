"use client";
import { useRef, useState, useEffect } from "react";
import {
  FaShoppingCart,
  FaStore,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";
import { FaLeaf } from "react-icons/fa";
import { MdBrush } from "react-icons/md";
import { FiBox, FiHeadphones, FiLayers, FiMapPin, FiShare2, FiUsers } from "react-icons/fi";
import { TbLeaf } from "react-icons/tb";

export default function Services() {
  const ref = useRef(null);
  const materialsRef = useRef(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const isLight = theme === "light";

  useEffect(() => {
    const getTheme = () => {
      const attr =
        typeof document !== "undefined"
          ? (document.documentElement.getAttribute("data-theme") as "light" | "dark" | null)
          : null;
      if (attr) return attr;
      try {
        return (localStorage.getItem("fr-theme") as "light" | "dark" | null) || "dark";
      } catch {
        return "dark";
      }
    };

    setTheme(getTheme());

    if (typeof MutationObserver !== "undefined") {
      const observer = new MutationObserver(() => setTheme(getTheme()));
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      return () => observer.disconnect();
    }
  }, []);

  return (
    <>
      <div className="theme-surface relative overflow-hidden border-b border-white/10">
        {/* Shared background accent lights */}
        <div className="absolute inset-0 -z-10">
          <div className={`absolute left-1/5 top-1/3 h-80 w-80 rounded-full blur-[160px] animate-pulse ${isLight ? "bg-gradient-to-r from-blue-200/60 to-cyan-100/50" : "bg-blue-500/20 blur-[140px]"}`} />
          <div className={`absolute right-1/6 bottom-1/4 h-96 w-96 rounded-full blur-[170px] animate-pulse ${isLight ? "bg-gradient-to-r from-emerald-200/55 to-teal-100/45" : "bg-emerald-500/15 blur-[150px]"}`} style={{ animationDelay: '1s' }} />
          <div className={`absolute top-1/2 left-1/2 h-64 w-64 rounded-full blur-[130px] animate-pulse ${isLight ? "bg-gradient-to-r from-indigo-200/50 to-purple-100/40" : "bg-gradient-to-r from-indigo-300/30 to-purple-200/20"}`} style={{ animationDelay: '2s' }} />
          <div className={`absolute inset-0 ${isLight ? "bg-[radial-gradient(circle_at_18%_12%,rgba(59,130,246,0.12),transparent_40%),radial-gradient(circle_at_78%_18%,rgba(16,185,129,0.08),transparent_32%),radial-gradient(circle_at_55%_80%,rgba(139,92,246,0.06),transparent_35%),radial-gradient(circle_at_30%_60%,rgba(245,158,11,0.04),transparent_30%)]" : "bg-[radial-gradient(circle_at_18%_12%,rgba(59,130,246,0.08),transparent_36%),radial-gradient(circle_at_78%_18%,rgba(94,234,212,0.07),transparent_28%),radial-gradient(circle_at_55%_80%,rgba(129,140,248,0.06),transparent_30%)]"}`} />

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 18 }, (_, i) => (
              <div
                key={i}
                className={`absolute w-1 h-1 rounded-full animate-bounce ${isLight ? "bg-blue-300/70 shadow-[0_0_8px_rgba(59,130,246,0.6)]" : "bg-blue-400/40"}`}
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

        <section
          id="services"
          data-observe
          className="reveal relative py-24 bg-transparent"
        >

        <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          {/* Header with icon */}
          <div className="max-w-2xl flex items-center gap-4">
            <div className="relative">
              <h2 className={`font-display text-3xl sm:text-4xl font-extrabold ${isLight ? "text-slate-900" : "bg-gradient-to-r from-white via-blue-200 via-cyan-200 to-white text-gradient-animated drop-shadow-[0_0_20px_rgba(125,200,255,0.5)]"} flex items-center`}>
                Our Services
              </h2>
              <div className={`absolute -inset-2 blur-xl rounded-lg -z-10 ${isLight ? "bg-gradient-to-r from-blue-200/40 to-cyan-100/30" : "bg-gradient-to-r from-blue-500/20 to-cyan-400/20"}`} />
            </div>
            <div className={`drop-shadow-[0_0_24px_rgba(129,140,248,0.8)] animate-pulse ${isLight ? "text-blue-500" : "text-indigo-200"}`}>
              <FiLayers className="w-8 h-8 sm:w-10 sm:h-10" aria-hidden />
            </div>
          </div>

          <p className={`mt-3 max-w-2xl ${isLight ? "text-slate-700" : "text-slate-200/80"}`}>
            ForgeRealm is a UK-based business offering unique, customisable
            3D-printed products. You can order online, contact us for bespoke
            prints, or visit us at our pop-up stalls and booths around Leeds.
          </p>

          <div className="mt-8 grid gap-4 lg:grid-cols-6 auto-rows-fr">
            {[
              { title: "Eco Friendly", detail: "Biodegradable and low-impact materials.", icon: <FaLeaf className="text-emerald-300 text-lg" /> },
              { title: "Material Options", detail: "PLA and PETG choices for each build.", icon: <FiBox className="text-blue-300 text-lg" /> },
              { title: "Local Collection", detail: "Leeds pickup options when available.", icon: <FiMapPin className="text-blue-300 text-lg" /> },
              { title: "Social Drops", detail: "New releases and stall dates posted weekly.", icon: <FiShare2 className="text-pink-300 text-lg" /> },
              { title: "Support First", detail: "Real replies from the makers.", icon: <FiHeadphones className="text-blue-300 text-lg" /> },
              { title: "Workshops Soon", detail: "Collaborations and events in the pipeline.", icon: <FiUsers className="text-sky-300 text-lg" /> },
            ].map((item, idx) => (
              <div
                key={item.title}
                className={`hover-shine rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-2xl hover:border-blue-400/70 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 ${
                  idx === 0 ? "lg:col-span-4" : idx === 1 ? "lg:col-span-2" : idx === 2 ? "lg:col-span-3" : "lg:col-span-3"
                }`}
              >
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  {item.icon}
                  <span>{item.title}</span>
                </div>
                <p className="mt-2 text-xs text-slate-200/80">{item.detail}</p>
              </div>
            ))}
          </div>

          {/* Service grid */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <FaShoppingCart className="text-blue-400 text-xl" />,
                title: "Order Online",
                text: "Browse and buy our 3D-printed products directly from our website, or find us on Etsy, eBay, and Vinted.",
              },
              {
                icon: <MdBrush className="text-blue-400 text-xl" />,
                title: "Custom & Bespoke Prints",
                text: "Contact us to discuss your ideas or request a personalised print.",
              },
              {
                icon: <FaStore className="text-blue-400 text-xl" />,
                title: "Leeds Booths & Stalls",
                text: "Find us at local markets, fairs, and events across Leeds. Follow us on social media for updates on where we will be next.",
              },
            ].map((service, i) => (
              <article
                key={i}
                className="hover-shine rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl hover:border-blue-400/70 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-2">
                  {service.icon}
                  <h3 className="text-lg font-semibold text-white">{service.title}</h3>
                </div>
                <p className="mt-2 text-sm text-slate-200/80">{service.text}</p>
              </article>
            ))}
          </div>

          {/* Follow us capsule */}
          <div className="max-w-2xl mt-16 rounded-lg border border-white/10 bg-white/5 backdrop-blur-2xl p-6 hover:border-blue-400/60 hover:shadow-blue-500/20 transition">
            <p className="text-slate-200/80 text-sm mb-4">
              Follow us on Instagram and other socials for the latest news, stall
              locations, and new product launches. More services, including
              workshops and collaborations, coming soon!
            </p>

            <div className="flex items-center gap-4 text-slate-200/80 mt-2">
              <a href="https://www.instagram.com/forgerealmltd/" aria-label="Instagram" className="hover:text-pink-400 transition">
                <FaInstagram className="text-lg" />
              </a>
              <a href="https://www.linkedin.com/company/forgerealm" aria-label="LinkedIn" className="hover:text-sky-400 transition">
                <FaLinkedin className="text-lg" />
              </a>
            </div>
          </div>
        </div>
        </section>

        <section
          id="materials"
          data-observe
          className="reveal relative py-24 bg-transparent"
        >
          <div
            ref={materialsRef}
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative"
          >
            <div className="max-w-2xl flex items-center gap-3">
              <div className="relative">
                <h2 className={`font-display text-3xl sm:text-4xl font-extrabold whitespace-nowrap ${isLight ? "text-emerald-700" : "text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-green-300 to-lime-200 drop-shadow-[0_0_20px_rgba(110,231,183,0.55)]"}`}>
                  Materials
                </h2>
                <div className={`absolute -inset-2 blur-xl rounded-lg -z-10 ${isLight ? "bg-gradient-to-r from-emerald-200/45 to-lime-100/35" : "bg-gradient-to-r from-emerald-400/25 to-green-300/20"}`} />
              </div>
              <div className="relative flex-shrink-0 flex items-center text-emerald-200 drop-shadow-[0_0_16px_rgba(110,231,183,0.55)]">
                <TbLeaf className="w-8 h-8 sm:w-10 sm:h-10" aria-hidden />
              </div>
            </div>

            <p className="mt-3 text-slate-200/80 max-w-xl">
              We offer the following filaments for 3D printing:
            </p>

            <div className="mt-12 grid gap-8 sm:grid-cols-1 lg:grid-cols-2">
              {[
                {
                  title: "PLA",
                  label: "Eco-friendly",
                  labelColor: "text-green-400 border-green-400/50 bg-green-400/10",
                  points: [
                    "Biodegradable and sustainable",
                    "Renewable and low impact",
                  ],
                  colorDot: "bg-green-400",
                  desc: "Biodegradable and made from renewable resources. Our main filament, eco-friendly, safe, and perfect for customisation.",
                },
                {
                  title: "PETG",
                  label: "Recyclable",
                  labelColor: "text-blue-400 border-blue-400/50 bg-blue-400/10",
                  points: [
                    "Durable and flexible structure",
                    "Ideal for high-stress parts",
                  ],
                  colorDot: "bg-blue-400",
                  desc: "Recyclable and durable. A strong, flexible option for prints needing extra toughness.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl transition-all hover:border-blue-400/70 hover:shadow-[0_0_35px_-8px_rgba(59,130,246,0.4)]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[color:var(--fg)]">
                      {item.title}
                    </h3>
                    <span
                      className={`text-xs rounded-full border px-2 py-0.5 ${item.labelColor}`}
                    >
                      {item.label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-200/80 leading-relaxed">
                    {item.desc}
                  </p>

                  <ul className="mt-5 space-y-2 text-sm text-slate-200/80">
                    {item.points.map((p, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <span
                          className={`h-2 w-2 rounded-full ${item.colorDot} flex-shrink-0`}
                        />
                        <span className="leading-snug">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="max-w-2xl mt-12">
              <div className="inline-block px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-900 to-emerald-800 text-white text-sm font-semibold shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]">
                We focus on sustainable materials. More filament types and resin
                printing coming soon.
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
