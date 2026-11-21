import { useEffect, useState } from "react";
import { FiLogOut, FiUser } from "react-icons/fi";
import { ArrowKnob } from "./landing/ui";

type Link = { label: string; href: string };

const envBase =
  typeof import.meta !== "undefined" &&
  import.meta.env &&
  typeof import.meta.env.PUBLIC_API_URL === "string"
    ? import.meta.env.PUBLIC_API_URL.trim().replace(/\/$/, "")
    : "";

const envLocal =
  typeof import.meta !== "undefined" &&
  import.meta.env &&
  typeof import.meta.env.PUBLIC_API_URL_LOCAL === "string"
    ? import.meta.env.PUBLIC_API_URL_LOCAL.trim().replace(/\/$/, "")
    : "";

const API_BASE =
  typeof window !== "undefined" &&
  window.location.origin.startsWith("http://localhost")
    ? envLocal || ""
    : envBase || "";

const baseLinks: Link[] = [
  { label: "Shop", href: "/shop" },
  { label: "Blog", href: "/blog" },
];

const ShopNavbar = () => {
  const [open, setOpen] = useState(false);
  const [authRole, setAuthRole] = useState<"admin" | "user" | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (open) setOpen(false);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateToken = () => {
      const token = localStorage.getItem("forgerealm_admin_token");
      if (!token) {
        setAuthRole(null);
        return;
      }
      fetch(`${API_BASE}/api/auth/me`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (res) => {
          if (!res.ok) {
            setAuthRole(null);
            return;
          }
          const body = await res.json().catch(() => ({}));
          setAuthRole(body?.user?.role || "user");
        })
        .catch(() => setAuthRole(null));
    };

    updateToken();
    window.addEventListener("forgerealm-admin-token-changed", updateToken);

    return () => {
      window.removeEventListener("forgerealm-admin-token-changed", updateToken);
    };
  }, []);

  const isAuthed = Boolean(authRole);
  const links: (Link & { isLogout?: boolean })[] = isAuthed
    ? [
        { label: "Dashboard", href: "/shop/dashboard" },
        ...baseLinks,
        ...(authRole === "admin"
          ? [{ label: "Users", href: "/shop/users" }]
          : []),
        { label: "Log out", href: "#", isLogout: true },
      ]
    : [...baseLinks, { label: "Sign In", href: "/shop/sign-in" }];

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      })
        .catch(() => {})
        .finally(() => {
          localStorage.removeItem("forgerealm_admin_token");
          window.dispatchEvent(new Event("forgerealm-admin-token-changed"));
          setAuthRole(null);
          window.location.href = "/shop";
        });
    }
  };

  // Same bar as the landing page's Navbar (see Navbar.tsx): transparent at
  // the top, solid ink with a hairline once scrolled, full-screen menu below
  // `lg`. Only the links differ, because they depend on the sign-in state.
  return (
    <header
      className="fr-ink fixed inset-x-0 top-0 z-50"
      style={{ backgroundColor: "transparent" }}
    >
      <div
        className="border-b transition-[background-color,border-color] duration-300"
        style={{
          backgroundColor: scrolled ? "rgba(11, 10, 8, 0.88)" : "transparent",
          borderColor: scrolled ? "var(--line)" : "transparent",
          backdropFilter: scrolled ? "blur(14px)" : undefined,
          WebkitBackdropFilter: scrolled ? "blur(14px)" : undefined,
        }}
      >
        <div className="fr-wrap flex h-16 items-center justify-between gap-6">
          <a
            href="/"
            className="group inline-flex items-center gap-3 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffb224]"
            aria-label="ForgeRealm home"
          >
            <img
              src="/headfrlogorv-128.webp"
              alt=""
              width={34}
              height={34}
              className="h-[34px] w-[34px] rounded-full transition-transform duration-500 group-hover:rotate-[14deg]"
              loading="eager"
            />
            <span className="leading-none">
              <span className="fr-px fr-fg block text-[1.75rem] leading-[0.8]">
                ForgeRealm
              </span>
              <span className="fr-label fr-fg-3 mt-0.5 hidden !text-[13px] sm:block">
                Leeds, UK
              </span>
            </span>
          </a>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
            {isAuthed && (
              <span
                className="fr-label fr-fg-3 inline-flex items-center gap-2"
                title="Logged in"
                aria-label="Logged in"
              >
                <FiUser className="text-sm" />
                Logged in
              </span>
            )}
            {links.map((link) =>
              link.isLogout ? (
                <button
                  key={link.label}
                  onClick={handleLogout}
                  className="fr-nav-link inline-flex items-center gap-2"
                >
                  <FiLogOut className="text-sm" />
                  {link.label}
                </button>
              ) : (
                <a key={link.label} href={link.href} className="fr-nav-link">
                  {link.label}
                </a>
              ),
            )}
          </nav>

          <div className="flex items-center gap-3 sm:gap-5">
            <a
              href="/"
              // "Main Site" is a longer label than the landing page's "Shop", so
              // on narrow phones it would run into the wordmark. It is in the
              // menu there instead.
              className="fr-btn fr-btn--solid fr-btn--sm max-[439px]:hidden"
            >
              Main Site
              <ArrowKnob />
            </a>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="fr-fg fr-line-2 grid h-10 w-10 place-items-center rounded-full border lg:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffb224]"
              aria-label="Open menu"
              aria-expanded={open}
            >
              <span className="relative block h-[9px] w-[18px]" aria-hidden>
                <span className="absolute inset-x-0 top-0 h-px bg-current" />
                <span className="absolute inset-x-0 bottom-0 h-px bg-current" />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Full-screen menu (below lg) */}
      <div
        className={`fr-ink fr-plate fixed inset-0 z-50 flex flex-col transition-all duration-500 lg:hidden ${
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-full opacity-0"
        }`}
        aria-hidden={!open}
        inert={!open}
      >
        <div className="fr-wrap flex h-16 flex-none items-center justify-between">
          <span className="inline-flex items-center gap-3">
            <img
              src="/headfrlogorv-128.webp"
              alt=""
              width={34}
              height={34}
              className="h-[34px] w-[34px] rounded-full"
            />
            <span className="fr-px fr-fg text-[1.75rem] leading-none">
              ForgeRealm
            </span>
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="fr-fg fr-line-2 grid h-10 w-10 place-items-center rounded-full border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffb224]"
            aria-label="Close menu"
          >
            <span className="relative block h-[18px] w-[18px]" aria-hidden>
              <span className="absolute left-0 right-0 top-1/2 h-px rotate-45 bg-current" />
              <span className="absolute left-0 right-0 top-1/2 h-px -rotate-45 bg-current" />
            </span>
          </button>
        </div>

        <nav
          className="fr-wrap flex flex-1 flex-col justify-center overflow-y-auto"
          aria-label="Mobile"
        >
          {isAuthed && (
            <span className="fr-label fr-fg-3 mb-4 inline-flex items-center gap-2">
              <FiUser className="text-sm" />
              Logged in
            </span>
          )}
          {links.map((link) =>
            link.isLogout ? (
              <button
                key={link.label}
                onClick={() => {
                  handleLogout();
                  setOpen(false);
                }}
                className="fr-line group border-b py-3.5 text-left first:border-t"
              >
                <span className="fr-px fr-fg text-[2.9rem] leading-[0.85] transition-colors group-hover:text-[#ffb224]">
                  {link.label}
                </span>
              </button>
            ) : (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="fr-line group border-b py-3.5 first:border-t"
              >
                <span className="fr-px fr-fg text-[2.9rem] leading-[0.85] transition-colors group-hover:text-[#ffb224]">
                  {link.label}
                </span>
              </a>
            ),
          )}
        </nav>

        <div className="fr-wrap flex-none pb-8 pt-6">
          <a
            href="/"
            onClick={() => setOpen(false)}
            className="fr-btn fr-btn--solid w-full"
          >
            Main Site
            <ArrowKnob />
          </a>
        </div>
      </div>
    </header>
  );
};

export default ShopNavbar;
