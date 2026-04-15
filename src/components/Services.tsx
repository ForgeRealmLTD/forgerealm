'use client';

import {
  FaShoppingCart,
  FaStore,
  FaInstagram,
  FaLinkedin,
  FaLeaf,
} from "react-icons/fa";
import { MdBrush } from "react-icons/md";
import { FiBox, FiHeadphones, FiLayers, FiMapPin, FiShare2, FiUsers } from "react-icons/fi";
import { TbLeaf } from "react-icons/tb";

export default function Services() {
  return (
    <div className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0a0e18 0%, #0c1020 50%, #0a0e18 100%)' }}>
      {/* Vibrant ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-5%] top-[20%] w-[400px] h-[400px] rounded-full bg-blue-500/[0.1] blur-[180px]" />
        <div className="absolute left-[-5%] top-[40%] w-[350px] h-[350px] rounded-full bg-purple-500/[0.07] blur-[160px]" />
        <div className="absolute left-[20%] bottom-[10%] w-[300px] h-[300px] rounded-full bg-emerald-500/[0.08] blur-[150px]" />
        <div className="absolute right-[30%] bottom-[20%] w-[250px] h-[250px] rounded-full bg-cyan-500/[0.06] blur-[140px]" />
      </div>
      <section
        id="services"
        data-observe
        className="reveal relative py-16 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          {/* Header */}
          <div className="mb-2">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="w-8 h-px bg-gradient-to-r from-blue-400 to-cyan-400" />
              <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.3em] text-blue-300/60" style={{ fontFamily: "'Jost', sans-serif" }}>What we offer</span>
            </div>
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-normal text-white"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Our <em className="text-cyan-300" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 300 }}>Services</em>
            </h2>
          </div>

          <p
            className="mt-3 max-w-2xl text-stone-400"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            ForgeRealm is a UK-based business offering unique, customisable
            3D-printed products. You can order online, contact us for bespoke
            prints, or visit us at our pop-up stalls and booths around Leeds.
          </p>

          {/* Feature grid */}
          <div className="mt-8 grid gap-4 lg:grid-cols-6 auto-rows-fr">
            {[
              { title: "Eco Friendly", detail: "Biodegradable and low-impact materials.", icon: <FaLeaf className="text-emerald-400 text-xl" /> },
              { title: "Material Options", detail: "PLA and PETG choices for each build.", icon: <FiBox className="text-blue-400 text-xl" /> },
              { title: "Local Collection", detail: "Leeds pickup options when available.", icon: <FiMapPin className="text-blue-400 text-xl" /> },
              { title: "Social Drops", detail: "New releases and stall dates posted weekly.", icon: <FiShare2 className="text-cyan-300 text-xl" /> },
              { title: "Support First", detail: "Real replies from the makers.", icon: <FiHeadphones className="text-blue-400 text-xl" /> },
              { title: "Workshops Soon", detail: "Collaborations and events in the pipeline.", icon: <FiUsers className="text-cyan-300 text-xl" /> },
            ].map((item, idx) => (
              <div
                key={item.title}
                className={`rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 backdrop-blur-sm hover:border-blue-400/30 hover:bg-white/[0.04] hover:shadow-xl hover:shadow-blue-500/[0.12] transition-all duration-500 hover:-translate-y-0.5 ${
                  idx === 0 ? "lg:col-span-4" : idx === 1 ? "lg:col-span-2" : "lg:col-span-3"
                }`}
              >
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  {item.icon}
                  <span style={{ fontFamily: "'Cinzel', serif" }}>{item.title}</span>
                </div>
                <p
                  className="mt-2 text-xs text-stone-400"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {item.detail}
                </p>
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
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-sm hover:border-blue-400/30 hover:bg-white/[0.04] hover:shadow-xl hover:shadow-blue-500/[0.12] transition-all duration-500 hover:-translate-y-1 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-2">
                  {service.icon}
                  <h3
                    className="text-lg font-semibold text-white"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    {service.title}
                  </h3>
                </div>
                <p
                  className="mt-2 text-sm text-stone-400"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {service.text}
                </p>
              </article>
            ))}
          </div>

          {/* Follow us capsule */}
          <div className="max-w-2xl mt-16 rounded-lg border border-white/10 bg-white/[0.03] p-6 hover:border-blue-400/40 transition-colors duration-300">
            <p
              className="text-stone-400 text-sm mb-4"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Follow us on Instagram and other socials for the latest news, stall
              locations, and new product launches. More services, including
              workshops and collaborations, coming soon!
            </p>

            <div className="flex items-center gap-4 text-stone-400 mt-2">
              <a href="https://www.instagram.com/forgerealmltd/" aria-label="Instagram" className="hover:text-pink-400 transition-colors duration-300">
                <FaInstagram className="text-lg" />
              </a>
              <a href="https://www.linkedin.com/company/forgerealm" aria-label="LinkedIn" className="hover:text-blue-400 transition-colors duration-300">
                <FaLinkedin className="text-lg" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Diamond divider */}
      <div className="flex items-center gap-4 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="w-[6px] h-[6px] rotate-45 bg-emerald-400/30" />
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Materials section */}
      <section
        id="materials"
        data-observe
        className="reveal relative py-16 sm:py-24"
      >
        {/* Emerald ambient glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/3 top-1/2 w-[400px] h-[300px] rounded-full bg-emerald-500/[0.04] blur-[180px]" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="mb-2">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="w-8 h-px bg-gradient-to-r from-emerald-400 to-teal-400" />
              <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.3em] text-emerald-300/60" style={{ fontFamily: "'Jost', sans-serif" }}>Eco printing</span>
            </div>
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-normal text-white"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Our <em className="text-emerald-300" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 300 }}>Materials</em>
            </h2>
          </div>

          <p
            className="mt-3 text-stone-400 max-w-xl"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            We offer the following filaments for 3D printing:
          </p>

          <div className="mt-12 grid gap-8 sm:grid-cols-1 lg:grid-cols-2">
            {[
              {
                title: "PLA",
                label: "Eco-friendly",
                labelColor: "text-green-400 border-green-400/40 bg-green-400/10",
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
                labelColor: "text-blue-400 border-blue-400/40 bg-blue-400/10",
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
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 backdrop-blur-sm hover:border-emerald-400/30 hover:bg-white/[0.04] hover:shadow-xl hover:shadow-emerald-500/[0.12] transition-all duration-500"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="text-lg font-semibold text-white"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    {item.title}
                  </h3>
                  <span
                    className={`text-xs rounded-full border px-2 py-0.5 ${item.labelColor}`}
                    style={{ fontFamily: "'Jost', sans-serif" }}
                  >
                    {item.label}
                  </span>
                </div>
                <p
                  className="text-sm text-stone-400 leading-relaxed"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {item.desc}
                </p>

                <ul className="mt-5 space-y-2 text-sm text-stone-400">
                  {item.points.map((p, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <span
                        className={`h-2 w-2 rounded-full ${item.colorDot} flex-shrink-0`}
                      />
                      <span
                        className="leading-snug"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {p}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="max-w-2xl mt-12">
            <div
              className="inline-block px-5 py-2 rounded-lg bg-emerald-900/60 border border-emerald-400/20 text-emerald-200 text-sm font-semibold"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              We focus on sustainable materials. More filament types and resin
              printing coming soon.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
