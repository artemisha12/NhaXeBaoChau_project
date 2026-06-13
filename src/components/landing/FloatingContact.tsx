'use client';

import { useAdmin } from '@/context/AdminContext';

export default function FloatingContact() {
  const { siteSettings } = useAdmin();

  const hotline    = (siteSettings?.hotline    || '0905123456').replace(/\s+/g, '');
  const zaloPhone  = (siteSettings?.zaloPhone  || '0905123456').replace(/\s+/g, '');
  const facebookUrl = siteSettings?.facebookUrl || 'https://facebook.com/nhaxebaochau';

  return (
    <div className="bc-fab-group" aria-label="Liên hệ nhanh">
      {/* Facebook */}
      <a
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bc-fab-btn bc-fab-btn--fb"
        aria-label="Facebook"
      >
        <span className="bc-fab-tooltip">Facebook</span>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
        </svg>
      </a>

      {/* Zalo */}
      <a
        href={`https://zalo.me/${zaloPhone}`}
        target="_blank"
        rel="noopener noreferrer"
        className="bc-fab-btn bc-fab-btn--zalo"
        aria-label="Nhắn Zalo"
      >
        <span className="bc-fab-tooltip">Nhắn Zalo</span>
        <span className="bc-fab-zalo-z" aria-hidden="true">Z</span>
      </a>

      {/* Gọi điện */}
      <a
        href={`tel:${hotline}`}
        className="bc-fab-btn bc-fab-btn--call"
        aria-label="Gọi hotline"
      >
        <span className="bc-fab-tooltip">Gọi ngay</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.7 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
      </a>
    </div>
  );
}
