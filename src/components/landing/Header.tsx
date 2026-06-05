'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, Fragment } from 'react';
import { useAdmin } from '@/context/AdminContext';

const NAV_LINKS = [
  { href: '/#home',           label: 'Trang chủ',    id: 'home'    },
  { href: '/#vehicles',       label: 'Xe & dịch vụ', id: 'vehicles'},
  { href: '/#prices',         label: 'Bảng giá',     id: 'prices'  },
  { href: '/#footer',         label: 'Liên hệ',      id: 'footer'  },
] as const;

export default function Header() {
  const { siteSettings } = useAdmin();
  const hotline = siteSettings?.hotline || '0767 375 375';

  const [isVisible,  setIsVisible]  = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const lastScrollY = useRef(0);

  // Auto-hide on scroll down, show on scroll up
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (mobileOpen) {
        setIsVisible(true);
      } else if (y > lastScrollY.current && y > 100) {
        setIsVisible(false);   // scroll xuống → ẩn
      } else {
        setIsVisible(true);    // scroll lên → hiện
      }
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [mobileOpen]);

  // IntersectionObserver detect active section
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    NAV_LINKS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  function handleNavigate(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      setMobileOpen(false);
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      setMobileOpen(false);
    }
  }

  const headerClass = [
    'bc-header',
    !isVisible ? 'bc-header--hidden' : '',
    mobileOpen ? 'bc-header--mobile-open' : '',
  ].filter(Boolean).join(' ');

  return (
    <Fragment>
      <header className={headerClass}>
        <div className="bc-header__inner">

          {/* Logo */}
          <Link href="/" className="bc-logo" aria-label="Bảo Châu Car">
            <div className="bc-logo__img-wrap">
              <img
                src="/images/hero/logo_navbar_nobg.png"
                alt="Logo Bảo Châu Car"
                className="bc-logo__img"
              />
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="bc-nav" aria-label="Menu chính">
            {NAV_LINKS.map(({ href, label, id }) => (
              <a
                key={href}
                href={href}
                onClick={(e) => handleNavigate(e, id)}
                className={`bc-nav__link${activeSection === id ? ' bc-nav__link--active' : ''}`}
              >
                {label}
              </a>
            ))}
            <a
              href="/#booking-section"
              onClick={(e) => handleNavigate(e, 'booking-section')}
              className="bc-nav__book-btn"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Đặt xe
            </a>
          </nav>

          {/* Hotline */}
          <a href={`tel:${hotline.replace(/\s+/g, '')}`} className="bc-header__hotline" aria-label="Gọi hotline">
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

          {/* Hamburger */}
          <button
            type="button"
            className={`bc-menu-btn${mobileOpen ? ' is-open' : ''}`}
            onClick={() => setMobileOpen(v => !v)}
            aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={mobileOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      {/* Overlay backdrop */}
      <div
        className={`bc-mobile-overlay${mobileOpen ? ' is-open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile sidebar — từ bên phải */}
      <nav className={`bc-mobile-menu${mobileOpen ? ' is-open' : ''}`} aria-label="Menu mobile">
        <div className="bc-mobile-menu__top">
          <Link href="/" className="bc-mobile-brand" onClick={() => setMobileOpen(false)}>
            <img src="/images/hero/logo_navbar_nobg.png" alt="Logo Bảo Châu Car" className="bc-mobile-brand__logo" />
          </Link>
          <button
            type="button"
            className="bc-mobile-menu__close"
            onClick={() => setMobileOpen(false)}
            aria-label="Đóng menu"
          >
            ×
          </button>
        </div>

        <div className="bc-mobile-menu__links">
          {NAV_LINKS.map(({ href, label, id }) => (
            <a
              key={href}
              href={href}
              onClick={(e) => handleNavigate(e, id)}
              className={`bc-mobile-menu__link${activeSection === id ? ' bc-mobile-menu__link--active' : ''}`}
            >
              {label}
            </a>
          ))}
          <a
            href="/#booking-section"
            onClick={(e) => handleNavigate(e, 'booking-section')}
            className="bc-mobile-menu__link bc-mobile-menu__link--book"
          >
            Đặt xe
          </a>
        </div>

        <div className="bc-mobile-menu__footer">
          <a href={`tel:${hotline.replace(/\s+/g, '')}`} className="bc-mobile-menu__cta">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.7 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Gọi ngay: {hotline}
          </a>
        </div>
      </nav>
    </Fragment>
  );
}
