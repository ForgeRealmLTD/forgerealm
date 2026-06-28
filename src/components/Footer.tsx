'use client';

import { useState } from "react";
import { FaInstagram, FaLinkedin, FaTiktok } from "react-icons/fa6";

export default function Footer() {
  const [modal, setModal] = useState<"privacy" | "terms" | "sla" | null>(null);
  const [subscribeStatus, setSubscribeStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitting, setSubmitting] = useState(false);
  const apiBase =
    typeof import.meta !== "undefined" && import.meta.env && import.meta.env.PUBLIC_API_URL_LOCAL
      ? import.meta.env.PUBLIC_API_URL_LOCAL
      : (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.PUBLIC_API_URL) || "";

  const handleSubscribe = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setSubscribeStatus("idle");
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      firstName: data.get("firstName"),
      lastName: data.get("lastName"),
      email: data.get("email"),
      company: data.get("company"),
    };

    try {
      const res = await fetch(`${apiBase}/api/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Subscribe failed");
      form.reset();
      setSubscribeStatus("success");
    } catch {
      setSubscribeStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="relative overflow-hidden py-16 bg-[#0a0a0a] border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="grid md:grid-cols-4 gap-10 text-sm">
          {/* Brand */}
          <div>
            <div className="inline-flex items-center gap-3">
              <img src="/headfrlogorv.png" alt="ForgeRealm Logo" width={32} height={32} className="rounded-full" loading="lazy" />
              <span
                className="font-bold text-white text-lg tracking-wide"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                ForgeRealm
              </span>
            </div>
            <p
              className="mt-3 text-stone-400 max-w-xs"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              UK-based creators of custom, sustainable 3D prints from concept to craft.
            </p>

            {/* Social icons */}
            <div className="flex gap-4 mt-5 text-lg text-stone-400">
              <a href="https://instagram.com/forgerealmltd" target="_blank" rel="noopener noreferrer" aria-label="ForgeRealm on Instagram" className="hover:text-blue-300 transition-colors duration-300 focus-visible:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-blue-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]">
                <FaInstagram />
              </a>
              <a href="https://www.linkedin.com/company/forgerealm" target="_blank" rel="noopener noreferrer" aria-label="ForgeRealm on LinkedIn" className="hover:text-blue-300 transition-colors duration-300 focus-visible:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-blue-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]">
                <FaLinkedin />
              </a>
              <a href="https://www.tiktok.com/@forgerealmltd" target="_blank" rel="noopener noreferrer" aria-label="ForgeRealm on TikTok" className="hover:text-blue-300 transition-colors duration-300 focus-visible:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-blue-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]">
                <FaTiktok />
              </a>
            </div>
          </div>

          {/* Services links */}
          <div>
            <div
              className="font-semibold text-white"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Services
            </div>
            <ul className="mt-3 space-y-2" style={{ fontFamily: "'Inter', sans-serif" }}>
              <li>
                <a href="/custom-order" className="text-stone-400 hover:text-blue-300 transition-colors duration-300">
                  Custom Prints
                </a>
              </li>
              <li>
                <a href="/shop" className="text-stone-400 hover:text-blue-300 transition-colors duration-300">
                  Online Orders
                </a>
              </li>
              <li>
                <a href="/blog" className="text-stone-400 hover:text-blue-300 transition-colors duration-300">
                  Leeds Booths
                </a>
              </li>
              <li>
                <a href="/#materials" className="text-stone-400 hover:text-blue-300 transition-colors duration-300">
                  Materials
                </a>
              </li>
            </ul>
          </div>

          {/* Company links */}
          <div>
            <div
              className="font-semibold text-white"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Company
            </div>
            <ul className="mt-3 space-y-2" style={{ fontFamily: "'Inter', sans-serif" }}>
              <li>
                <a href="/#work" className="text-stone-400 hover:text-blue-300 transition-colors duration-300">
                  Recent Work
                </a>
              </li>
              <li>
                <a href="/blog" className="text-stone-400 hover:text-blue-300 transition-colors duration-300">
                  About
                </a>
              </li>
              <li>
                <a href="mailto:info@forgerealm.co.uk" className="text-stone-400 hover:text-blue-300 transition-colors duration-300">
                  Contact
                </a>
              </li>
              <li>
                <a href="/#faq" className="text-stone-400 hover:text-blue-300 transition-colors duration-300">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Subscribe */}
          <div>
            <div
              className="font-semibold text-white"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Stay Updated
            </div>
            <p className="mt-1 text-[12px] text-stone-500" style={{ fontFamily: "'Inter', sans-serif" }}>
              Get notified about new products, booth locations, and market dates across Leeds.
            </p>

            <form
              className="mt-3 flex flex-col gap-3"
              onSubmit={handleSubscribe}
            >
              <input
                required
                type="text"
                name="firstName"
                id="subscribe-first-name"
                placeholder="First name"
                aria-label="First name"
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-white text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400/50 placeholder:text-stone-500 transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />

              <input
                type="text"
                name="lastName"
                id="subscribe-last-name"
                placeholder="Last name"
                aria-label="Last name"
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-white text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400/50 placeholder:text-stone-500 transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />

              <input
                required
                type="email"
                name="email"
                id="subscribe-email"
                placeholder="you@example.com"
                aria-label="Email address"
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-white text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400/50 placeholder:text-stone-500 transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />

              <input
                type="text"
                name="company"
                id="subscribe-company"
                placeholder="Company (optional)"
                aria-label="Company"
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-white text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400/50 placeholder:text-stone-500 transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />

              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 font-semibold transition-opacity duration-300 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {submitting ? "Submitting..." : "Subscribe"}
              </button>
            </form>
            {subscribeStatus === "success" && (
              <div className="mt-3 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                Thank you for your interest. You'll receive an email from ForgeRealm shortly.
              </div>
            )}
            {subscribeStatus === "error" && (
              <div className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                Something went wrong. Please try again.
              </div>
            )}
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div style={{ fontFamily: "'Inter', sans-serif" }}>
            (c) {new Date().getFullYear()} ForgeRealm Ltd. All rights reserved.
          </div>
          <div className="flex items-center gap-4" style={{ fontFamily: "'Inter', sans-serif" }}>
            <button type="button" onClick={() => setModal("privacy")} className="hover:text-blue-300 transition-colors duration-300 focus-visible:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-blue-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]">
              Privacy
            </button>
            <button type="button" onClick={() => setModal("terms")} className="hover:text-blue-300 transition-colors duration-300 focus-visible:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-blue-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]">
              Terms
            </button>
            <button type="button" onClick={() => setModal("sla")} className="hover:text-blue-300 transition-colors duration-300 focus-visible:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-blue-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]">
              SLA
            </button>
          </div>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 text-white shadow-2xl">
            <button
              type="button"
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/80 hover:bg-white/20 transition-colors duration-300"
              style={{ fontFamily: "'Jost', sans-serif" }}
              onClick={() => setModal(null)}
            >
              Close
            </button>
            {modal === "privacy" ? (
              <>
                <h3 className="text-xl font-semibold" style={{ fontFamily: "'Cinzel', serif" }}>Privacy Policy</h3>
                <p className="mt-3 text-sm text-stone-400" style={{ fontFamily: "'Inter', sans-serif" }}>
                  We only collect the details needed to process orders, respond to inquiries, and send updates you opt
                  in to receive. We never sell your data.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-stone-500" style={{ fontFamily: "'Inter', sans-serif" }}>
                  <li>We store email and order details for fulfillment and support.</li>
                  <li>You can opt out of marketing emails at any time.</li>
                  <li>Contact us to request access or deletion of your data.</li>
                </ul>
              </>
            ) : modal === "terms" ? (
              <>
                <h3 className="text-xl font-semibold" style={{ fontFamily: "'Cinzel', serif" }}>Terms of Service</h3>
                <p className="mt-3 text-sm text-stone-400" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Orders are made to order. Production times vary by item and load. We will confirm timelines and keep
                  you updated on progress.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-stone-500" style={{ fontFamily: "'Inter', sans-serif" }}>
                  <li>Custom orders are final once production begins.</li>
                  <li>Damaged deliveries must be reported within 48 hours.</li>
                  <li>By ordering, you agree to our print and fulfillment timelines.</li>
                </ul>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold" style={{ fontFamily: "'Cinzel', serif" }}>Service Level Agreement</h3>
                <p className="mt-3 text-sm text-stone-400" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Our standard service levels outline communication and fulfillment expectations for ForgeRealm orders.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-stone-500" style={{ fontFamily: "'Inter', sans-serif" }}>
                  <li>Responses within 24 hours on business days.</li>
                  <li>Production timelines shared before your order is confirmed.</li>
                  <li>Priority support for time-sensitive or event orders.</li>
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </footer>
  );
}
