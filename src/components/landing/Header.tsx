"use client";

import Link from "next/link";
import { MouseEvent, useState, useEffect } from "react";
import { useAdmin } from "@/context/AdminContext";

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
  const { siteSettings } = useAdmin();
  const hotline = siteSettings?.hotline || "0905 123 456";
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

          {/* ── Logo (bên trái, chỉ hình) ── */}
          <Link href="/" className="bc-logo" aria-label="Bảo Châu Car">
            <div className={`bc-logo__img-wrap${isTransparent ? " bc-logo__img-wrap--dark" : ""}`}>
              <img
                src="/images/hero/logo.png"
                alt="Logo Bảo Châu Car"
                className="bc-logo__img"
              />
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
            {/* Nút Đặt xe nổi bật trong nav */}
            <a
              href="/#booking-section"
              onClick={(e) => handleNavigate(e, "/#booking-section")}
              className="bc-nav__book-btn"
              aria-label="Đặt xe ngay"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Đặt xe
            </a>
          </nav>

          {/* ── Hotline pill nổi bật (desktop only) ── */}
          <a
            href={`tel:${hotline.replace(/\s+/g, '')}`}
            className="bc-header__hotline"
            aria-label="Gọi hotline"
          >
            <span className="bc-header__hotline-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.7 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </span>
            <span className="bc-header__hotline-text">
              <span className="bc-header__hotline-label">Hotline</span>
              <span className="bc-header__hotline-number">{hotline}</span>
            </span>
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
        {/* Header: Logo to + tên thương hiệu */}
        <div className="bc-mobile-menu__top">
          <Link href="/" className="bc-mobile-brand" onClick={() => setMenuOpen(false)}>
            <img
              src="/images/hero/logo.png"
              alt="Logo Bảo Châu Car"
              className="bc-mobile-brand__logo"
            />
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

        {/* Nav links */}
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
          <a
            href="/#booking-section"
            onClick={(e) => handleNavigate(e, "/#booking-section")}
            className="bc-mobile-menu__link bc-mobile-menu__link--book"
          >
            Đặt Xe
          </a>
        </div>

        <div className="bc-mobile-menu__footer">
          <a href={`tel:${hotline.replace(/\s+/g, '')}`} className="bc-mobile-menu__cta" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.7 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>Gọi ngay: {hotline}</span>
          </a>
        </div>
      </nav>

    </>
  );
}