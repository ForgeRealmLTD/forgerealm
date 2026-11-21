"use client";

import {
  FaShoppingCart,
  FaStore,
  FaInstagram,
  FaLinkedin,
  FaLeaf,
} from "react-icons/fa";
import { MdBrush } from "react-icons/md";
import {
  FiBox,
  FiHeadphones,
  FiMapPin,
  FiShare2,
  FiUsers,
} from "react-icons/fi";
import { useReveal } from "../hooks/useReveal";
import MaterialsBook from "./MaterialsBook";

const FEATURES = [
  {
    title: "Eco Friendly",
    detail: "Biodegradable and low-impact materials.",
    icon: <FaLeaf />,
  },
  {
    title: "Material Options",
    detail: "PLA and PETG choices for each build.",
    icon: <FiBox />,
  },
  {
    title: "Local Collection",
    detail: "Leeds pickup options when available.",
    icon: <FiMapPin />,
  },
  {
    title: "Social Drops",
    detail: "New releases and stall dates posted weekly.",
    icon: <FiShare2 />,
  },
  {
    title: "Support First",
    detail: "Real replies from the makers.",
    icon: <FiHeadphones />,
  },
  {
    title: "Workshops Soon",
    detail: "Collaborations and events in the pipeline.",
    icon: <FiUsers />,
  },
];

const SERVICES = [
  {
    icon: <FaShoppingCart />,
    title: "Order Online",
    text: "Browse and buy our 3D-printed products directly from our website, or find us on Etsy, eBay, and Vinted.",
  },
  {
    icon: <MdBrush />,
    title: "Custom & Bespoke Prints",
    text: "Contact us to discuss your ideas or request a personalised print.",
  },
  {
    icon: <FaStore />,
    title: "Leeds Booths & Stalls",
    text: "Find us at local markets, fairs, and events across Leeds. Follow us on social media for updates on where we will be next.",
  },
];

/**
 * Services + Materials. Set like a spec sheet rather than a wall of cards:
 * the six features are a ruled list, the three ways to buy are columns
 * divided by hairlines, and the socials close the block on one row.
 */
export default function Services() {
  const services = useReveal<HTMLElement>();
  const materials = useReveal<HTMLElement>();

  return (
    <div className="fr-ink relative overflow-hidden">
      <section
        id="services"
        ref={services.ref}
        data-observe
        suppressHydrationWarning
        className={`reveal fr-plate relative py-20 sm:py-28 lg:py-32 ${services.isVisible ? "is-visible" : ""}`}
      >
        <div className="fr-wrap relative">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-10">
            <h2 className="fr-h2 lg:col-span-7">
              Our <span className="fr-i">Services</span>
            </h2>
            <p className="fr-body max-w-xl lg:col-span-5">
              ForgeRealm is a UK-based business offering unique, customisable
              3D-printed products. You can order online, contact us for bespoke
              prints, or visit us at our pop-up stalls and booths around Leeds.
            </p>
          </div>

          {/* Feature list: six ruled entries */}
          <dl className="mt-14 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((item) => (
              <div
                key={item.title}
                className="fr-line flex gap-4 border-t py-5"
              >
                <span
                  className="fr-accent-text mt-1.5 text-lg"
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                <div>
                  <dt className="fr-px text-[1.65rem] leading-none">
                    {item.title}
                  </dt>
                  <dd className="fr-fg-2 mt-1.5 text-sm leading-relaxed">
                    {item.detail}
                  </dd>
                </div>
              </div>
            ))}
          </dl>

          {/* The three ways to buy: columns divided by hairlines */}
          <div className="fr-line-2 mt-14 grid border-t lg:grid-cols-3">
            {SERVICES.map((service) => (
              <article
                key={service.title}
                className="fr-line border-b py-8 lg:border-b-0 lg:border-l lg:px-8 lg:py-10 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0"
              >
                <span className="fr-accent-text text-3xl" aria-hidden="true">
                  {service.icon}
                </span>
                <h3 className="fr-h3 mt-7">{service.title}</h3>
                <p className="fr-body mt-3 !text-[0.975rem]">{service.text}</p>
              </article>
            ))}
          </div>

          {/* Follow us */}
          <div className="fr-line flex flex-col gap-6 border-b py-7 sm:flex-row sm:items-center sm:justify-between lg:border-t">
            <p className="fr-body max-w-2xl !text-[0.975rem]">
              Follow us on Instagram and other socials for the latest news,
              stall locations, and new product launches. More services,
              including workshops and collaborations, coming soon!
            </p>

            <div className="flex flex-none items-center gap-3">
              <a
                href="https://www.instagram.com/forgerealmltd/"
                aria-label="Instagram"
                className="fr-line-2 grid h-11 w-11 place-items-center rounded-full border text-lg transition-colors duration-300 hover:border-[color:var(--fg)] hover:bg-[var(--fg)] hover:text-[color:var(--bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffb224]"
              >
                <FaInstagram />
              </a>
              <a
                href="https://www.linkedin.com/company/forgerealm"
                aria-label="LinkedIn"
                className="fr-line-2 grid h-11 w-11 place-items-center rounded-full border text-lg transition-colors duration-300 hover:border-[color:var(--fg)] hover:bg-[var(--fg)] hover:text-[color:var(--bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffb224]"
              >
                <FaLinkedin />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Materials section: no divider; the shared surface unifies it with Services. */}
      <section
        id="materials"
        ref={materials.ref}
        data-observe
        suppressHydrationWarning
        className={`reveal relative py-20 sm:py-28 ${materials.isVisible ? "is-visible" : ""}`}
      >
        <div className="fr-wrap relative">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-10">
            <h2 className="fr-h2 lg:col-span-7">
              Our <span className="fr-i">Materials</span>
            </h2>
            <p className="fr-body max-w-xl lg:col-span-5">
              We offer the following filaments for 3D printing. Flip through to
              see what each one is, where we use it, and the science behind the
              claims.
            </p>
          </div>

          <div className="mt-14 flex justify-center">
            <MaterialsBook />
          </div>
        </div>
      </section>
    </div>
  );
}
