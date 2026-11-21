"use client";

import { useState } from "react";
import { FaInstagram, FaLinkedin, FaTiktok } from "react-icons/fa6";
import { ArrowKnob } from "./landing/ui";

export default function Footer() {
  const [modal, setModal] = useState<"privacy" | "terms" | "sla" | null>(null);
  const [subscribeStatus, setSubscribeStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [submitting, setSubmitting] = useState(false);
  const apiBase =
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.PUBLIC_API_URL_LOCAL
      ? import.meta.env.PUBLIC_API_URL_LOCAL
      : (typeof import.meta !== "undefined" &&
          import.meta.env &&
          import.meta.env.PUBLIC_API_URL) ||
        "";

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

  const social =
    "fr-line-2 grid h-10 w-10 place-items-center rounded-full border transition-colors duration-300 hover:border-[color:var(--fg)] hover:bg-[var(--fg)] hover:text-[color:var(--bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffb224]";

  return (
    <footer className="fr-ink fr-line relative overflow-hidden border-t pt-16 sm:pt-20">
      <div className="fr-wrap relative">
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-4">
            <div className="inline-flex items-center gap-3">
              <img
                src="/headfrlogorv-128.webp"
                alt="ForgeRealm Logo"
                width={36}
                height={36}
                className="rounded-full"
                loading="lazy"
              />
              <span className="fr-px text-[2.3rem] leading-none">
                ForgeRealm
              </span>
            </div>
            <p className="fr-body mt-4 max-w-xs !text-[0.975rem]">
              UK-based creators of custom, sustainable 3D prints from concept to
              craft.
            </p>

            {/* Social icons */}
            <div className="mt-6 flex gap-3 text-base">
              <a
                href="https://instagram.com/forgerealmltd"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ForgeRealm on Instagram"
                className={social}
              >
                <FaInstagram />
              </a>
              <a
                href="https://www.linkedin.com/company/forgerealm"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ForgeRealm on LinkedIn"
                className={social}
              >
                <FaLinkedin />
              </a>
              <a
                href="https://www.tiktok.com/@forgerealmltd"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ForgeRealm on TikTok"
                className={social}
              >
                <FaTiktok />
              </a>
            </div>
          </div>

          {/* Services links */}
          <div className="md:col-span-2">
            <div className="fr-label fr-fg-3">Services</div>
            <ul className="mt-5 space-y-3 text-[1.05rem] font-medium">
              <li>
                <a href="/custom-order" className="fr-link">
                  Custom Prints
                </a>
              </li>
              <li>
                <a href="/shop" className="fr-link">
                  Online Orders
                </a>
              </li>
              <li>
                <a href="/blog" className="fr-link">
                  Leeds Booths
                </a>
              </li>
              <li>
                <a href="/#materials" className="fr-link">
                  Materials
                </a>
              </li>
            </ul>
          </div>

          {/* Company links */}
          <div className="md:col-span-2">
            <div className="fr-label fr-fg-3">Company</div>
            <ul className="mt-5 space-y-3 text-[1.05rem] font-medium">
              <li>
                <a href="/#work" className="fr-link">
                  Recent Work
                </a>
              </li>
              <li>
                <a href="/blog" className="fr-link">
                  About
                </a>
              </li>
              <li>
                <a href="mailto:info@forgerealm.co.uk" className="fr-link">
                  Contact
                </a>
              </li>
              <li>
                <a href="/#faq" className="fr-link">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Subscribe */}
          <div className="md:col-span-4">
            <div className="fr-label fr-fg-3">Stay Updated</div>
            <p className="fr-fg-2 mt-5 text-sm leading-relaxed">
              Get notified about new products, booth locations, and market dates
              across Leeds.
            </p>

            <form
              className="mt-3 grid grid-cols-2 gap-x-5"
              onSubmit={handleSubscribe}
            >
              <input
                required
                type="text"
                name="firstName"
                id="subscribe-first-name"
                placeholder="First name"
                aria-label="First name"
                className="fr-input"
              />

              <input
                type="text"
                name="lastName"
                id="subscribe-last-name"
                placeholder="Last name"
                aria-label="Last name"
                className="fr-input"
              />

              <input
                required
                type="email"
                name="email"
                id="subscribe-email"
                placeholder="you@example.com"
                aria-label="Email address"
                className="fr-input col-span-2"
              />

              <input
                type="text"
                name="company"
                id="subscribe-company"
                placeholder="Company (optional)"
                aria-label="Company"
                className="fr-input col-span-2"
              />

              <button
                type="submit"
                disabled={submitting}
                className="fr-btn fr-btn--solid col-span-2 mt-6 w-full"
              >
                {submitting ? "Submitting..." : "Subscribe"}
                <ArrowKnob />
              </button>
            </form>
            {subscribeStatus === "success" && (
              <div className="mt-4 rounded-md border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                Thank you for your interest. You'll receive an email from
                ForgeRealm shortly.
              </div>
            )}
            {subscribeStatus === "error" && (
              <div className="mt-4 rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                Something went wrong. Please try again.
              </div>
            )}
          </div>
        </div>

        {/* Bottom row */}
        <div className="fr-line fr-label fr-fg-3 mt-14 flex flex-col items-center justify-between gap-4 border-t py-6 !text-[15px] md:flex-row">
          <div>
            (c) {new Date().getFullYear()} ForgeRealm Ltd. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setModal("privacy")}
              className="fr-link"
            >
              Privacy
            </button>
            <button
              type="button"
              onClick={() => setModal("terms")}
              className="fr-link"
            >
              Terms
            </button>
            <button
              type="button"
              onClick={() => setModal("sla")}
              className="fr-link"
            >
              SLA
            </button>
          </div>
        </div>
      </div>

      {/* Oversized outlined pixel wordmark, cropped by the bottom of the page.
          Stroke first, then an ink fill over it, so only the outer outline
          of each glyph shows. */}
      <div
        aria-hidden="true"
        className="fr-px pointer-events-none select-none whitespace-nowrap text-center text-[23vw] leading-[0.7]"
        style={{
          color: "var(--bg)",
          WebkitTextStroke: "2px rgba(240, 232, 216, 0.3)",
          paintOrder: "stroke fill",
          marginBottom: "-0.1em",
        }}
      >
        ForgeRealm
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6">
          <div className="fr-line-2 relative w-full max-w-2xl rounded-[22px] border bg-[#141210] p-7 shadow-2xl sm:p-9">
            <button
              type="button"
              aria-label="Close"
              className="fr-btn fr-btn--ghost fr-btn--sm fr-btn--plain absolute right-5 top-5"
              onClick={() => setModal(null)}
            >
              Close
            </button>
            {modal === "privacy" ? (
              <>
                <h3 className="fr-h3 pr-24">Privacy Policy</h3>
                <p className="fr-body mt-4 !text-[0.95rem]">
                  We only collect the details needed to process orders, respond
                  to inquiries, and send updates you opt in to receive. We never
                  sell your data.
                </p>
                <ul className="fr-fg-3 mt-4 space-y-2 text-sm">
                  <li>
                    We store email and order details for fulfillment and
                    support.
                  </li>
                  <li>You can opt out of marketing emails at any time.</li>
                  <li>
                    Contact us to request access or deletion of your data.
                  </li>
                </ul>
              </>
            ) : modal === "terms" ? (
              <>
                <h3 className="fr-h3 pr-24">Terms of Service</h3>
                <p className="fr-body mt-4 !text-[0.95rem]">
                  Orders are made to order. Production times vary by item and
                  load. We will confirm timelines and keep you updated on
                  progress.
                </p>
                <ul className="fr-fg-3 mt-4 space-y-2 text-sm">
                  <li>Custom orders are final once production begins.</li>
                  <li>Damaged deliveries must be reported within 48 hours.</li>
                  <li>
                    By ordering, you agree to our print and fulfillment
                    timelines.
                  </li>
                </ul>
              </>
            ) : (
              <>
                <h3 className="fr-h3 pr-24">Service Level Agreement</h3>
                <p className="fr-body mt-4 !text-[0.95rem]">
                  Our standard service levels outline communication and
                  fulfillment expectations for ForgeRealm orders.
                </p>
                <ul className="fr-fg-3 mt-4 space-y-2 text-sm">
                  <li>Responses within 24 hours on business days.</li>
                  <li>
                    Production timelines shared before your order is confirmed.
                  </li>
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
