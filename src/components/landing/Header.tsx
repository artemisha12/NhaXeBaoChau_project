"use client";

import Link from "next/link";
import { MouseEvent, useState, useEffect } from "react";

const navLinks = [
  { href: "/#home", label: "Trang chủ" },
  { href: "/#vehicles", label: "Xe & dịch vụ" },
  { href: "/#prices", label: "Bảng giá" },
  { href: "/#footer", label: "Liên hệ" },
];

interface HeaderProps {
  heroOverlay?: boolean;
}

export default function Header({ heroOverlay = false }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll-state để chuyển header từ transparent → frosted glass
  useEffect(() => {
    if (!heroOverlay) return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [heroOverlay]);

  function handleNavigate(e: MouseEvent<HTMLAnchorElement>, href: string) {
    const hash = href.split("#")[1];
    if (!hash) return;
    const target = document.querySelector(`#${hash}`);
    if (target) {
      e.preventDefault();
      setMenuOpen(false);
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setMenuOpen(false);
  }

  const isTransparent = heroOverlay && !scrolled;

  return (
    <>
      <header
        className={[
          "bc-header",
          heroOverlay ? "bc-header--overlay" : "",
          scrolled ? "bc-header--scrolled" : "",
          menuOpen ? "bc-header--menu-open" : "",
        ].filter(Boolean).join(" ")}
      >
        <div className="bc-header__inner">

          {/* ── Logo ── */}
          <Link href="/" className="bc-logo" aria-label="Bảo Châu Car">
            <div className={`bc-logo__img-wrap${isTransparent ? " bc-logo__img-wrap--dark" : ""}`}>
              <img
                src="/images/hero/logo.png"
                alt="Logo Bảo Châu Car"
                className="bc-logo__img"
              />
            </div>
            <div className="bc-logo__text">
              <span className="bc-logo__name">Bảo Châu Car</span>
              <span className="bc-logo__sub">Xe ghép cao cấp</span>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="bc-nav" aria-label="Menu chính">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavigate(e, link.href)}
                className={`bc-nav__link ${link.href.includes("prices") ? "bc-nav__link--accent" : ""}`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* ── Hotline pill (desktop only) ── */}
          <a
            href="tel:0900000000"
            className="bc-header__hotline"
            aria-label="Gọi hotline"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.7 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>090.000.0000</span>
          </a>

          {/* ── Hamburger (mobile) ── */}
          <button
            type="button"
            className={`bc-menu-btn${menuOpen ? " is-open" : ""}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Mở menu"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* Mobile overlay backdrop */}
      <div
        className={`bc-mobile-overlay${menuOpen ? " is-open" : ""}`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Mobile slide-in menu */}
      <nav className={`bc-mobile-menu${menuOpen ? " is-open" : ""}`}>
        <div className="bc-mobile-menu__top">
          <Link href="/" className="bc-logo" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="bc-logo__img-wrap" style={{ height: "54px", padding: "2px" }}>
              <img
                src="/images/hero/logo.png"
                alt="Logo Bảo Châu Car"
                className="bc-logo__img"
                style={{ height: "48px", width: "auto", objectFit: "contain" }}
              />
            </div>
            <div className="bc-logo__text">
              <span className="bc-logo__name" style={{ color: 'var(--primary-900)' }}>Bảo Châu Car</span>
              <span className="bc-logo__sub" style={{ color: 'var(--accent-600)' }}>Xe ghép cao cấp</span>
            </div>
          </Link>
          <button
            type="button"
            className="bc-mobile-menu__close"
            onClick={() => setMenuOpen(false)}
            aria-label="Đóng menu"
          >
            ×
          </button>
        </div>

        <div className="bc-mobile-menu__links">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavigate(e, link.href)}
              className="bc-mobile-menu__link"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="bc-mobile-menu__footer">
          <a href="tel:0900000000" className="bc-mobile-menu__cta" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.7 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>Gọi ngay: 090.000.0000</span>
          </a>
        </div>
      </nav>
    </>
  );
}