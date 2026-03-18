"use client";

import { useEffect, useState } from "react";
import { HiOutlineMenu, HiX, HiOutlineMoon, HiOutlineSun } from "react-icons/hi";
import { FaShoppingBag } from "react-icons/fa";
import { FiUser } from "react-icons/fi";

const envBase =
  typeof import.meta !== "undefined" && import.meta.env && typeof import.meta.env.PUBLIC_API_URL === "string"
    ? import.meta.env.PUBLIC_API_URL.trim().replace(/\/$/, "")
    : "";

const envLocal =
  typeof import.meta !== "undefined" && import.meta.env && typeof import.meta.env.PUBLIC_API_URL_LOCAL === "string"
    ? import.meta.env.PUBLIC_API_URL_LOCAL.trim().replace(/\/$/, "")
    : "";

const API_BASE =
  (typeof window !== "undefined" && window.location.origin.startsWith("http://localhost")
    ? envLocal || ""
    : envBase || "");

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [hasAdminToken, setHasAdminToken] = useState(false);

  const isLight = theme === "light";

  const navLinks = [
    ["Services", "#services"],
    ["Work", "#work"],
    ["FAQ", "#faq"],
    ["Contact", "#contact"],
  ];

  useEffect(() => {
    try {
      const saved = localStorage.getItem("fr-theme") as "light" | "dark" | null;
      const initial = saved || "dark";
      setTheme(initial);
      document.documentElement.setAttribute("data-theme", initial);
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateToken = () => {
      const token = localStorage.getItem("forgerealm_admin_token");
      if (!token) {
        setHasAdminToken(false);
        return;
      }
      fetch(`${API_BASE}/api/auth/me`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => setHasAdminToken(res.ok))
        .catch(() => setHasAdminToken(false));
    };

    updateToken();
    window.addEventListener("forgerealm-admin-token-changed", updateToken);

    return () => {
      window.removeEventListener("forgerealm-admin-token-changed", updateToken);
    };
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("fr-theme", next);
    } catch {}
    document.documentElement.setAttribute("data-theme", next);
  };

  const handleLogout = () => {
    if (typeof window === "undefined") return;
    fetch(`${API_BASE}/api/auth/logout`, { method: "POST", credentials: "include" })
      .catch(() => {})
      .finally(() => {
        localStorage.removeItem("forgerealm_admin_token");
        window.dispatchEvent(new Event("forgerealm-admin-token-changed"));
        setHasAdminToken(false);
      });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl w-full px-4 py-4">
        <div className={`navbar-glow hover-shine flex items-center justify-between rounded-full border px-5 py-2 backdrop-blur-2xl shadow-lg transition-all duration-500 ${isLight ? 'border-slate-200/50 bg-white/85 shadow-[0_8px_32px_rgba(15,23,42,0.12)] hover:shadow-[0_16px_56px_rgba(15,23,42,0.18)] hover:bg-white/92' : 'border-white/15 bg-gradient-to-r from-blue-600/80 via-indigo-600/85 to-purple-600/80 shadow-[0_8px_40px_rgba(59,130,246,0.25)] hover:shadow-[0_16px_60px_rgba(99,102,241,0.4)] hover:border-white/25'}`}>
          <a href="#homepage" className="inline-flex items-center gap-2" aria-label="ForgeRealm home">
            <img
              src="/headfrlogorv.png"
              alt="ForgeRealm Logo"
              width={32}
              height={32}
              className={`h-8 w-8 rounded-full ring-1 transition-all duration-300 ${isLight ? 'bg-black p-[2px] ring-slate-300' : 'ring-transparent'}`}
              loading="eager"
            />
            <span className={`font-display font-extrabold tracking-[0.2em] text-xs uppercase drop-shadow-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Forge<span className={isLight ? "text-blue-600" : "text-blue-100"}>REALM</span>
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-12 text-sm font-semibold uppercase tracking-wide">
            {navLinks.map(([label, href]) => (
              <a
                key={label}
                href={href}
                className={`relative transition-all duration-300 px-2 py-1 rounded-md hover:shadow-lg ${isLight ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 hover:shadow-[0_0_15px_rgba(15,23,42,0.1)]' : 'text-white/90 hover:text-white hover:bg-white/10 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]'}`}
              >
                <span className="relative z-10">{label}</span>
                <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-[2px] w-0 transition-all duration-300 hover:w-full ${isLight ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gradient-to-r from-blue-300 to-cyan-300'}`} />
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {hasAdminToken && (
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-wide shadow-lg ${isLight ? 'border-slate-200/50 bg-white/80 text-slate-700 shadow-[0_0_10px_rgba(15,23,42,0.1)]' : 'border-white/20 bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)]'}`}
                title="Logged in"
                aria-label="Logged in"
              >
                <FiUser className={`text-sm ${isLight ? 'text-blue-600' : 'text-blue-200'}`} />
                <span className={isLight ? "text-slate-900" : "text-blue-100"}>Logged in</span>
              </div>
            )}
            <a
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-amber-400 text-slate-900 font-bold text-xs uppercase tracking-wide px-4 py-2 hover:bg-amber-300 transition-all duration-300 shadow-[0_4px_15px_rgba(251,169,58,0.3)] hover:shadow-[0_6px_20px_rgba(251,169,58,0.4)]"
            >
              <FaShoppingBag className="text-blue-600" />
              <span>Shop</span>
            </a>
            <a
              href="/subscribe"
              className={`rounded-full font-bold text-xs uppercase tracking-wide px-4 py-2 transition-all duration-300 ${isLight ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] shadow-[0_4px_15px_rgba(37,99,235,0.3)]' : 'bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:shadow-[0_6px_20px_rgba(59,130,246,0.3)] shadow-[0_4px_15px_rgba(255,255,255,0.2)]'}`}
            >
              Subscribe
            </a>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={theme === "dark" ? "Switch to light" : "Switch to dark"}
              className={`rounded-full px-3 py-2 transition-all duration-300 hover:scale-105 border ${isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-[0_0_20px_rgba(15,23,42,0.2)] border-slate-300/50 hover:border-slate-400/70' : 'bg-white/10 text-white hover:bg-white/20 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] border-white/10 hover:border-blue-300/50'}`}
            >
              {theme === "dark" ? <HiOutlineSun className="text-yellow-500" /> : <HiOutlineMoon className="text-slate-600" />}
            </button>
          </div>

          <button
            onClick={() => setOpen(true)}
            className={`md:hidden text-2xl ${isLight ? 'text-slate-700' : 'text-white'}`}
            aria-label="Open menu"
          >
            <HiOutlineMenu />
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 backdrop-blur transition-opacity ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        } ${isLight ? 'bg-slate-900/40' : 'bg-black/60'}`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      {/* Mobile drawer */}
      <aside
        className={`fixed right-0 top-0 bottom-0 z-50 w-64 backdrop-blur border-l p-6 transform transition-transform ${
          open ? 'translate-x-0' : 'translate-x-full'
        } ${isLight ? 'bg-white/95 border-slate-200/50 shadow-[0_0_50px_rgba(15,23,42,0.2)]' : 'bg-gradient-to-b from-blue-600 to-indigo-700 shadow-[0_0_50px_rgba(59,130,246,0.3)] border-white/10'}`}
        aria-hidden={!open}
        aria-label="Mobile menu"
      >
        <div className="flex items-center justify-between mb-6">
          <span className={`font-semibold tracking-wide uppercase text-xs ${isLight ? 'text-slate-700' : 'text-white'}`}>Menu</span>
          <button onClick={() => setOpen(false)} className={`text-2xl ${isLight ? 'text-slate-700' : 'text-white'}`} aria-label="Close menu">
            <HiX />
          </button>
        </div>

        <nav className="flex flex-col gap-4 text-sm uppercase tracking-wide">
          {hasAdminToken && (
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-wide ${isLight ? 'border-slate-200/50 bg-white/80 text-slate-700' : 'border-white/20 bg-white/10 text-white'}`}>
              <FiUser className="text-sm" />
              Logged in
            </div>
          )}
          {navLinks.map(([label, href]) => (
            <a
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className={`rounded-lg px-3 py-2 transition ${isLight ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80' : 'text-white hover:text-blue-200 hover:bg-white/10'}`}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className={`my-6 border-t ${isLight ? 'border-slate-200/50' : 'border-white/10'}`} />

        <div className="flex flex-col gap-4">
          <a
            href="/shop"
            onClick={() => setOpen(false)}
            className="rounded-full bg-amber-400 px-6 py-3 text-sm font-bold uppercase tracking-wide text-slate-900 hover:bg-amber-300 transition text-center inline-flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(251,169,58,0.3)]"
          >
            <FaShoppingBag className="text-blue-600" /> Shop
          </a>
          <a
            href="/subscribe"
            onClick={() => setOpen(false)}
            className={`rounded-full px-6 py-3 text-sm font-bold uppercase tracking-wide transition text-center shadow-lg ${isLight ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)]' : 'bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:shadow-[0_6px_20px_rgba(59,130,246,0.3)]'}`}
          >
            Subscribe
          </a>
          {hasAdminToken && (
            <button
              type="button"
              onClick={() => {
                handleLogout();
                setOpen(false);
              }}
              className={`rounded-full px-6 py-3 text-sm font-bold uppercase tracking-wide transition text-center shadow-lg border ${isLight ? 'border-slate-300/50 bg-white text-slate-700 hover:bg-slate-50' : 'border-white/20 bg-white/10 text-white hover:bg-white/20'}`}
            >
              Log out
            </button>
          )}
          <button
            onClick={() => {
              toggleTheme();
              setOpen(false);
            }}
            className={`mt-2 rounded-full px-6 py-3 text-sm font-bold uppercase tracking-wide transition text-center shadow-lg ${isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300/50' : 'bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700'}`}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </aside>
    </header>
  );
}
