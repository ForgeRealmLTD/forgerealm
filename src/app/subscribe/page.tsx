"use client";

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export const metadata: Metadata = {
  title: "Subscribe | ForgeRealm Booth & Product Updates",
  description:
    "Subscribe to get notified about ForgeRealm booth locations, dates, new products and special offers.",
};

export default function SubscribePage() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setStatus("idle");

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      firstName: data.get("firstName"),
      lastName: data.get("lastName"),
      email: data.get("email"),
      company: data.get("company"),
    };

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Subscribe failed");
      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-screen flex-wrap bg-gradient-to-br from-[#0b0b0e] via-[#101018] to-[#0d0f15] text-white">
      {/* LEFT SIDE */}
      <div className="relative hidden w-full select-none flex-col justify-center text-center md:flex md:w-1/2 bg-gradient-to-b from-blue-900/40 via-indigo-900/30 to-transparent border-r border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.25),transparent_70%)] blur-3xl" />
        <div className="relative z-10 flex flex-col items-center px-8 py-20">
          <Image
            src="/frlogorv.png"
            alt="ForgeRealm Display"
            width={260}
            height={260}
            className="mx-auto rounded-2xl object-cover opacity-90 drop-shadow-[0_0_40px_rgba(59,130,246,0.6)]"
          />
          <h2 className="mt-10 text-4xl font-bold leading-tight tracking-tight text-white">
            Stay ahead with {" "}
            <span className="border-b-8 border-blue-500 text-blue-400">ForgeRealm</span>
          </h2>
          <p className="mt-6 text-lg text-white/70 max-w-md">
            Join our community to get early access to new services, exclusive offers, and updates on our next booth
            appearances and creative showcases.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full flex-col justify-center px-8 py-16 md:w-1/2 lg:px-16">
        <div className="max-w-md mx-auto w-full space-y-8">
          <h1 className="text-center md:text-left text-3xl font-extrabold tracking-tight">Get ForgeRealm Updates</h1>
          <p className="text-center md:text-left text-white/70 text-base">
            Be the first to know about upcoming booths, new products, and special offers.
          </p>

          {/* Subscribe Form */}
          <form
            className="mt-6 flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-xl"
            onSubmit={handleSubmit}
          >
            <label className="block text-sm text-white/80 font-semibold" htmlFor="mce-FNAME">
              First Name
              <input
                required
                type="text"
                name="firstName"
                id="subscribe-first-name"
                placeholder="Enter your name"
                className="mt-2 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-white/40"
              />
            </label>

            <label className="block text-sm text-white/80 font-semibold" htmlFor="mce-LNAME">
              Last Name
              <input
                type="text"
                name="lastName"
                id="subscribe-last-name"
                placeholder="Last name (optional)"
                className="mt-2 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-white/40"
              />
            </label>

            <label className="block text-sm text-white/80 font-semibold" htmlFor="mce-EMAIL">
              Email Address
              <input
                required
                type="email"
                name="email"
                id="subscribe-email"
                placeholder="you@example.com"
                className="mt-2 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-white/40"
              />
            </label>

            <label className="block text-sm text-white/80 font-semibold" htmlFor="mce-COMPANY">
              Company
              <input
                type="text"
                name="company"
                id="subscribe-company"
                placeholder="Company (optional)"
                className="mt-2 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-white/40"
              />
            </label>

            <div className="pt-2 text-xs text-white/50">
              By joining, you'll receive updates about new products, services, offers, and booth events from ForgeRealm.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3 font-semibold uppercase tracking-wider text-white shadow-md transition hover:from-blue-400 hover:to-indigo-500 hover:shadow-[0_0_20px_rgba(96,165,250,0.5)] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Subscribe"}
            </button>
          </form>
          {status === "success" && (
            <div className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              Thank you for your interest. You’ll receive an email from ForgeRealm shortly.
            </div>
          )}
          {status === "error" && (
            <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              Something went wrong. Please try again.
            </div>
          )}

          <div className="mt-6 text-center text-sm text-white/60">
            <Link href="/" className="underline hover:text-blue-300">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

