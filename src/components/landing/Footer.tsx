import { useAdmin } from "@/context/AdminContext";

export default function Footer() {
  const { siteSettings } = useAdmin();
  const year = new Date().getFullYear();
  
  const hotline = siteSettings?.hotline || "0905 123 456";
  const zaloPhone = siteSettings?.zaloPhone || "0905 123 456";
  const officeAddress = siteSettings?.officeAddress || "Huế - Đà Nẵng - Hội An";
  const workingHours = siteSettings?.workingHours || "06:00 - 22:00";
  const facebookUrl = siteSettings?.facebookUrl || "https://facebook.com/nhaxebaochau";
  const zaloOaUrl = siteSettings?.zaloOaUrl || "https://zalo.me/nhaxebaochau";

  return (
    <footer id="footer" className="landing-footer">
      <div className="container">
        <div className="footer-main">

          {/* ── LEFT: Brand ── */}
          <div className="footer-brand">
            <div className="footer-logo-wrap">
              {/* Logo text fallback */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px',
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '16px',
                  background: 'linear-gradient(135deg, #f8c95c, #c88925)',
                  display: 'grid', placeItems: 'center',
                  fontWeight: 900, color: '#04101b', fontSize: '15px',
                  boxShadow: '0 8px 20px rgba(200,137,37,0.3)',
                }}>BC</div>
                <div>
                  <div style={{ color: '#f8c95c', fontSize: '20px', fontWeight: 850, lineHeight: 1.1 }}>
                    Nhà xe Bảo Châu
                  </div>
                  <div style={{ color: 'rgba(248,201,92,0.65)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '3px' }}>
                    Xe ghép cao cấp
                  </div>
                </div>
              </div>
            </div>
            <p className="footer-tagline">
              Dịch vụ xe ghép liên tỉnh uy tín tuyến<br />
              Huế – Đà Nẵng – Hội An.<br />
              Đón tận nhà, đúng giờ, giá rõ ràng.
            </p>
            <div className="footer-social-row">
              <a
                href={facebookUrl}
                className="footer-social-btn footer-social-btn--fb"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
                Facebook
              </a>
              <a
                href={zaloOaUrl}
                className="footer-social-btn footer-social-btn--zalo"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Zalo
              </a>
            </div>
          </div>

          {/* ── RIGHT: Info + Story ── */}
          <div className="footer-right">
            {/* Top: Contact + Links */}
            <div className="footer-info-row">
              {/* Contact */}
              <div>
                <h4 className="footer-col-title">Liên hệ</h4>
                <ul className="footer-contact-list">
                  <li className="footer-contact-item">
                    <span className="footer-contact-key">Hotline</span>
                    <a href={`tel:${hotline.replace(/\s+/g, '')}`} className="footer-contact-val footer-contact-link">
                      {hotline}
                    </a>
                  </li>
                  <li className="footer-contact-item">
                    <span className="footer-contact-key">Zalo</span>
                    <a
                      href={`https://zalo.me/${zaloPhone.replace(/\s+/g, '')}`}
                      className="footer-contact-val footer-contact-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {zaloPhone}
                    </a>
                  </li>
                  <li className="footer-contact-item">
                    <span className="footer-contact-key">Địa chỉ</span>
                    <span className="footer-contact-val">{officeAddress}</span>
                  </li>
                  <li className="footer-contact-item">
                    <span className="footer-contact-key">Giờ mở cửa</span>
                    <span className="footer-contact-val">{workingHours}</span>
                  </li>
                </ul>
              </div>

              {/* Links */}
              <div className="footer-links-row">
                <div>
                  <h4 className="footer-col-title">Tuyến đường</h4>
                  <ul className="footer-link-list">
                    {['Huế → Đà Nẵng', 'Huế → Hội An', 'Đà Nẵng → Hội An', 'Sân bay Phú Bài'].map((r) => (
                      <li key={r}>
                        <a href="#routes" className="footer-link">{r}</a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="footer-col-title">Dịch vụ</h4>
                  <ul className="footer-link-list">
                    {['Xe ghép liên tỉnh', 'Bao xe nguyên chuyến', 'Đón sân bay', 'Du lịch nhóm'].map((s) => (
                      <li key={s}>
                        <a href="#booking-section" className="footer-link">{s}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Story */}
            <div className="footer-story">
              <p className="footer-story-text">
                Bảo Châu bắt đầu từ một chiếc xe và niềm đam mê kết nối mọi người trên những
                hành trình. Chúng tôi hiểu rằng mỗi chuyến đi là một câu chuyện — và chúng tôi
                muốn được là người đồng hành đáng tin cậy trên mọi hành trình đó.
              </p>
              <p className="footer-story-text">
                Với đội xe đời mới, tài xế tận tâm và cam kết đúng giờ,{' '}
                <strong>Bảo Châu không chỉ đưa bạn đến nơi — mà đưa bạn đến nơi một cách
                an toàn và thoải mái nhất.</strong>
              </p>
              <p className="footer-story-sig">
                Cảm ơn bạn đã tin tưởng Bảo Châu. Hẹn gặp bạn trên chuyến xe tiếp theo.
              </p>
            </div>
          </div>
        </div>

        {/* ── Bottom ── */}
        <div className="footer-bottom">
          <span>© {year} Nhà xe Bảo Châu. Đã đăng ký bản quyền.</span>
          <span className="footer-bottom-right">An toàn · Uy tín · Chất lượng</span>
        </div>
      </div>
    </footer>
  );
}
