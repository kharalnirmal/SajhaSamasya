"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, User, Globe } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

export default function Navbar() {
  const [lang, setLang] = useState("en");
  const [scrolled, setScrolled] = useState(false);
  const [langFlip, setLangFlip] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);
  const pathname = usePathname();
  const { isSignedIn, user } = useUser();
  const dropRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const switchLang = (l) => {
    setLangFlip(true);
    setTimeout(() => { setLang(l); setLangFlip(false); setLangOpen(false); }, 140);
  };

  const isProfile = pathname === "/profile";

  return (
    <>
      <style>{`
        @keyframes ringpop {
          from { transform: scale(0.7); opacity: 0; }
          to   { transform: scale(1.12); opacity: 1; }
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-10px) scale(0.94); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shimmerSlide {
          from { background-position: -220% center; }
          to   { background-position: 220% center; }
        }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50%       { transform: translateY(-2.5px) rotate(-4deg); }
        }
        @keyframes softPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.08); }
        }
        @keyframes rippleOut {
          to { transform: scale(3); opacity: 0; }
        }
        @keyframes ctaEntrance {
          from { opacity: 0; transform: translateY(20px) scale(0.85); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .shimmer-brand {
          background: linear-gradient(110deg, #14532d 0%, #16a34a 38%, #14532d 55%, #15803d 100%);
          background-size: 220% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmerSlide 4.5s linear infinite;
        }
        .lang-drop { animation: dropIn 0.22s cubic-bezier(.34,1.4,.64,1) both; }
        .logo-float { animation: logoFloat 3.2s ease-in-out infinite; }

        /* CTA expand from right */
        .cta-pill {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          height: 54px;
          border-radius: 27px;
          overflow: hidden;
          cursor: pointer;
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 55%, #14532d 100%);
          /* Start collapsed: only the icon width */
          width: 54px;
          transition:
            width 0.45s cubic-bezier(.34,1.3,.64,1),
            box-shadow 0.35s ease,
            transform 0.35s cubic-bezier(.34,1.56,.64,1);
          box-shadow:
            0 6px 20px rgba(26,92,56,0.35),
            inset 0 1px 0 rgba(255,255,255,0.22);
          animation: ctaEntrance 0.6s cubic-bezier(.34,1.4,.64,1) 0.2s both;
        }
        .cta-pill:hover {
          width: 178px;
          box-shadow:
            0 0 0 3px rgba(74,222,128,0.30),
            0 14px 36px rgba(26,92,56,0.42),
            inset 0 1px 0 rgba(255,255,255,0.26);
          transform: translateY(-3px);
        }
        .cta-pill:active {
          transform: translateY(-1px) scale(0.97);
        }

        /* Shine overlay */
        .cta-shine {
          position: absolute;
          inset: 0;
          background: linear-gradient(115deg, rgba(255,255,255,0.20) 0%, transparent 55%);
          pointer-events: none;
          transition: opacity 0.3s;
          opacity: 0.65;
          border-radius: inherit;
        }
        .cta-pill:hover .cta-shine { opacity: 1; }

        /* Label - hidden by default, slides in from right when pill expands */
        .cta-label {
          position: absolute;
          left: 16px;
          white-space: nowrap;
          font-weight: 700;
          font-size: 14px;
          color: white;
          letter-spacing: -0.01em;
          opacity: 0;
          transform: translateX(-8px);
          transition:
            opacity 0.25s ease 0.18s,
            transform 0.3s cubic-bezier(.34,1.4,.64,1) 0.18s;
          pointer-events: none;
        }
        .cta-pill:hover .cta-label {
          opacity: 1;
          transform: translateX(0);
        }

        /* Icon always on the right */
        .cta-icon-wrap {
          position: absolute;
          right: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 10px;
          background: rgba(255,255,255,0.20);
          transition: transform 0.42s cubic-bezier(.34,1.56,.64,1);
          flex-shrink: 0;
        }
        .cta-pill:hover .cta-icon-wrap {
          transform: rotate(90deg) scale(1.1);
        }

        /* Ripple */
        .cta-ripple {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: rgba(255,255,255,0.28);
          transform: scale(0);
          opacity: 1;
          pointer-events: none;
        }
        .cta-ripple.go { animation: rippleOut 0.55s ease forwards; }

        /* Ambient glow behind CTA */
        .cta-glow {
          position: absolute;
          inset: -8px;
          border-radius: 35px;
          background: radial-gradient(circle, rgba(74,222,128,0.28) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.4s ease, transform 0.5s ease;
          transform: scale(0.8);
          pointer-events: none;
        }
        .cta-pill:hover ~ .cta-glow,
        .cta-wrapper:hover .cta-glow {
          opacity: 1;
          transform: scale(1.3);
        }
      `}</style>

      {/* ═══════════════════════════════
          TOP HEADER
      ═══════════════════════════════ */}
      <header
        className={[
          "sticky top-0 z-50 flex items-center justify-between",
          "px-4 sm:px-6 h-14 sm:h-16",
          "transition-all duration-500",
          scrolled
            ? "bg-white/82 backdrop-blur-2xl backdrop-saturate-200 shadow-[0_4px_28px_rgba(26,92,56,0.10)] border-b border-green-900/8"
            : "bg-white/55 backdrop-blur-md border-b border-white/40",
        ].join(" ")}
      >
        {/* ── BRAND ── */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          onMouseEnter={() => setLogoHovered(true)}
          onMouseLeave={() => setLogoHovered(false)}
        >
          <div className="relative flex items-center justify-center w-9 h-9 shrink-0">
            <span style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              border: "2px solid rgba(74,222,128,0)",
              transform: logoHovered ? "scale(1.4)" : "scale(0.8)",
              borderColor: logoHovered ? "rgba(74,222,128,0.55)" : "rgba(74,222,128,0)",
              transition: "transform 0.45s cubic-bezier(.34,1.56,.64,1), border-color 0.35s ease",
            }} />
            <span style={{
              position: "absolute", inset: "-4px", borderRadius: "50%",
              background: "radial-gradient(circle, rgba(134,239,172,0.45) 0%, transparent 70%)",
              opacity: logoHovered ? 1 : 0,
              transform: logoHovered ? "scale(1.5)" : "scale(0.8)",
              filter: "blur(8px)",
              transition: "opacity 0.4s ease, transform 0.5s ease",
            }} />
            <Image
              src="/logo.png"
              alt="SajhaSamasya"
              width={36}
              height={36}
              className={[
                "relative z-10 rounded-full border-2 border-green-100 shadow-sm",
                "transition-transform duration-400 ease-[cubic-bezier(.34,1.56,.64,1)]",
                logoHovered ? "logo-float scale-105" : "",
              ].join(" ")}
            />
          </div>
          <span className={[
            "block font-extrabold text-[15.5px] sm:text-[17px] tracking-tight leading-none",
            "transition-all duration-200",
            langFlip ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0",
          ].join(" ")}>
            <span className="shimmer-brand">
              {lang === "en" ? "SajhaSamasya" : "साझा समस्या"}
            </span>
          </span>
        </Link>

        {/* ── RIGHT CONTROLS ── */}
        <div className="flex items-center gap-1.5 sm:gap-2">

          {/* Language switcher */}
          <div className="relative" ref={dropRef}>
            <button
              onClick={() => setLangOpen((o) => !o)}
              aria-label="Switch language"
              className={[
                "group relative flex items-center gap-1.5 h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-full overflow-hidden",
                "text-[11px] sm:text-[12px] font-semibold",
                "border transition-all duration-300 active:scale-95",
                langOpen
                  ? "bg-green-700 text-white border-green-700 shadow-[0_4px_18px_rgba(26,92,56,0.30)]"
                  : "bg-green-50/90 text-green-800 border-green-200/60 hover:border-green-400/50 hover:shadow-[0_4px_14px_rgba(26,92,56,0.12)] hover:-translate-y-px",
              ].join(" ")}
            >
              {!langOpen && (
                <span className="absolute inset-0 bg-green-700 -translate-x-full group-hover:translate-x-0
                                 transition-transform duration-300 ease-[cubic-bezier(.4,0,.2,1)] rounded-full" />
              )}
              <Globe size={12} className={[
                "relative z-10 transition-all duration-350",
                langOpen ? "text-white rotate-12" : "text-green-600 group-hover:text-white group-hover:rotate-[20deg]",
              ].join(" ")} />
              <span className={[
                "relative z-10 transition-all duration-200 hidden sm:inline",
                langFlip ? "opacity-0 -translate-y-1.5" : "opacity-100 translate-y-0",
                langOpen ? "text-white" : "group-hover:text-white",
              ].join(" ")}>
                {lang === "en" ? "EN" : "NP"}
              </span>
              <svg
                className={["relative z-10 w-2.5 h-2.5 transition-all duration-300",
                  langOpen ? "text-white rotate-180" : "text-green-500 group-hover:text-white"].join(" ")}
                fill="none" viewBox="0 0 10 6" stroke="currentColor" strokeWidth={2.5}
              >
                <path d="M1 1l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {langOpen && (
              <div className="lang-drop absolute right-0 top-[calc(100%+8px)] z-50
                              rounded-2xl overflow-hidden min-w-[136px]
                              bg-white/96 backdrop-blur-xl
                              border border-green-900/10
                              shadow-[0_16px_48px_rgba(26,92,56,0.18),0_2px_8px_rgba(26,92,56,0.08)]">
                {[
                  { code: "en", label: "English", tag: "EN" },
                  { code: "ne", label: "नेपाली",  tag: "NP" },
                ].map((opt) => (
                  <button key={opt.code} onClick={() => switchLang(opt.code)}
                    className={[
                      "w-full flex items-center gap-3 px-3.5 py-2.5 text-left text-[13px] font-medium transition-colors duration-150",
                      lang === opt.code
                        ? "bg-green-50 text-green-800"
                        : "text-gray-600 hover:bg-green-50/80 hover:text-green-800",
                    ].join(" ")}>
                    <span className="text-[9px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-md tracking-wide">
                      {opt.tag}
                    </span>
                    {opt.label}
                    {lang === opt.code && (
                      <svg className="ml-auto w-3.5 h-3.5 text-green-600 shrink-0" fill="none" viewBox="0 0 16 16">
                        <path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="w-px h-5 bg-green-900/10 mx-0.5" />

          {/* Profile */}
          <Link href={isSignedIn ? "/profile" : "/sign-in"} aria-label="Profile"
            className="group relative flex items-center justify-center">
            {isProfile && (
              <span className="absolute rounded-full border-2 border-green-500/60"
                style={{ inset: "-3px", animation: "ringpop 0.35s cubic-bezier(.34,1.56,.64,1) both" }} />
            )}
            <span className="absolute inset-0 rounded-full bg-green-200/0 blur-md
                             group-hover:bg-green-200/50 transition-all duration-400 scale-0 group-hover:scale-150" />
            {isSignedIn && user?.imageUrl ? (
              <Image src={user.imageUrl} alt="Profile" width={34} height={34}
                className={[
                  "relative z-10 rounded-full object-cover border-2",
                  "transition-all duration-350 ease-[cubic-bezier(.34,1.56,.64,1)]",
                  "group-hover:scale-110 group-hover:shadow-[0_4px_16px_rgba(26,92,56,0.24)]",
                  isProfile ? "border-green-500" : "border-green-100",
                ].join(" ")} />
            ) : (
              <span className={[
                "relative z-10 flex items-center justify-center w-9 h-9 rounded-full border-2",
                "transition-all duration-350 ease-[cubic-bezier(.34,1.56,.64,1)]",
                "group-hover:scale-110 group-hover:shadow-[0_4px_16px_rgba(26,92,56,0.20)]",
                isProfile
                  ? "bg-green-100 border-green-500 text-green-800"
                  : "bg-green-50 border-green-200/70 text-green-600",
              ].join(" ")}>
                <User size={17} strokeWidth={isProfile ? 2.4 : 1.8} />
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* ═══════════════════════════════
          BOTTOM-RIGHT EXPANDING CTA
      ═══════════════════════════════ */}
      <div
        className="fixed z-50 pointer-events-none"
        style={{
          bottom: "max(env(safe-area-inset-bottom, 0px) + 20px, 24px)",
          right: "20px",
        }}
      >
        <div className="pointer-events-auto cta-wrapper relative">
          {/* Ambient glow (behind pill) */}
          <span className="cta-glow" />

          {/* The expanding pill */}
          <Link
            href={isSignedIn ? "/create-post" : "/sign-in"}
            aria-label={lang === "en" ? "Report an issue" : "समस्या रिपोर्ट"}
            className="cta-pill"
          >
            {/* Shine */}
            <span className="cta-shine" />

            {/* Label — revealed on expand */}
            <span className="cta-label">
              {lang === "en" ? "Report Issue" : "रिपोर्ट"}
            </span>

            {/* Icon — always visible on right */}
            <span className="cta-icon-wrap">
              <Plus size={20} strokeWidth={2.6} color="white" />
            </span>
          </Link>
        </div>
      </div>
    </>
  );
}