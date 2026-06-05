'use client';

import { useAdmin } from '@/context/AdminContext';

export default function HeroSection() {
  const { siteSettings } = useAdmin();
  const hotline = siteSettings?.hotline || '0905 123 456';

  const handlePhoneClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const confirmCall = window.confirm(`Bạn có muốn gọi đến số ${hotline} không?`);
    if (confirmCall) {
      window.location.href = `tel:${hotline.replace(/\D/g, '')}`;
    }
  };

  return (
    <section id="home" className="hero">

      {/* Ảnh hero responsive */}
      <picture className="hero-picture">
        <source media="(max-width: 768px)" srcSet="/images/hero/mobile.png" />
        <img
          src="/images/hero/hero.png"
          alt="Xe ghép cao cấp Huế – Đà Nẵng – Hội An | Bảo Châu Car"
          className="hero-img"
          loading="eager"
          fetchPriority="high"
        />
      </picture>

      {/* CTA Strip bên dưới hero */}
      <div className="hero-cta-strip">
        <div className="hero-cta-strip-inner">
          <div className="hero-cta-info">
            <span className="hero-cta-badge" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
              </svg>
              Đặt xe ngay hôm nay
            </span>
            <span className="hero-cta-desc">
              Xác nhận trong 5 phút · Đón tận nơi · Không cần cọc trước
            </span>
          </div>
          <div className="hero-cta-actions">
            <a href="#booking-section" className="hero-cta-btn">
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                  <line x1="13" y1="5" x2="13" y2="7" />
                  <line x1="13" y1="17" x2="13" y2="19" />
                  <line x1="13" y1="11" x2="13" y2="13" />
                </svg>
                Đặt vé ngay
              </span>
              <span>→</span>
            </a>
            <a
              href={`tel:${hotline.replace(/\D/g, '')}`}
              onClick={handlePhoneClick}
              className="hero-cta-btn hero-phone-btn"
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.7 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {hotline}
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}