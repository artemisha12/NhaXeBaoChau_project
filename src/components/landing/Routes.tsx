'use client';

import { useState } from 'react';

const ROUTES_DATA = [
  { from: 'Huế', to: 'Đà Nẵng', note: '~2 giờ · 100 km', key: 'hue-danang' },
  { from: 'Huế', to: 'Hội An', note: '~3 giờ · 130 km', key: 'hue-hoian' },
  { from: 'Đà Nẵng', to: 'Hội An', note: '~45 phút · 30 km', key: 'danang-hoian' },
  { from: 'Sân bay Phú Bài', to: 'Đà Nẵng', note: '~1.5 giờ · 90 km', key: 'phuochai-danang' },
];

const HOURS = Array.from({ length: 17 }, (_, i) => `${String(i + 5).padStart(2, '0')}:00`);

export default function Routes() {
  const [open, setOpen] = useState(false);
  const [routeLabel, setRouteLabel] = useState('');
  const [tripType, setTripType] = useState<'shared' | 'private'>('shared');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('07:00');
  const [pax, setPax] = useState('1');
  const [sent, setSent] = useState(false);

  function openModal(label: string) {
    setRouteLabel(label);
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setOpen(false); setSent(false);
      setName(''); setPhone(''); setPickup(''); setDropoff('');
      setDate(''); setTime('07:00'); setPax('1');
    }, 2200);
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <section className="section routes-section" id="routes">
      <div className="container">
        {/* Section header */}
        <div className="section-header animate-fade-up">
          <span className="section-label">Tuyến đường</span>
          <h2 className="section-title">Lộ trình phổ biến</h2>
          <p className="section-subtitle">
            Kết nối Huế – Đà Nẵng – Hội An và các điểm lân cận, đưa đón tận địa chỉ.
          </p>
        </div>

        <div className="routes-top-row">
          {/* LEFT — Info */}
          <div className="routes-info-col animate-fade-left">
            <div className="routes-headline">
              <span className="routes-headline-line">Huế</span>
              <span className="routes-headline-sep">—</span>
              <span className="routes-headline-line">Đà Nẵng</span>
              <span className="routes-headline-sep">—</span>
              <span className="routes-headline-line routes-headline-accent">Hội An</span>
            </div>
            <p className="routes-tagline">Lộ trình nhanh chóng · An toàn · Tiện lợi</p>

            <p className="routes-popular-label">Tuyến phổ biến</p>

            <ul className="routes-list">
              {ROUTES_DATA.map((r) => (
                <li
                  key={r.key}
                  className="routes-list-item"
                  onClick={() => openModal(`${r.from} → ${r.to}`)}
                >
                  <div className="routes-list-route">
                    <span className="routes-list-from">{r.from}</span>
                    <span className="routes-list-arrows">⇄</span>
                    <span className="routes-list-to">{r.to}</span>
                  </div>
                  <span className="routes-list-note">{r.note}</span>
                  <span className="routes-list-chevron">›</span>
                </li>
              ))}
            </ul>

            <div className="routes-actions">
              <button className="routes-cta" onClick={() => setOpen(true)}>
                Đặt vé nhanh →
              </button>
              <span className="routes-trust-badge" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Không cần cọc trước
              </span>
            </div>

            {/* Stats */}
            <div className="routes-stats-row">
              <div className="routes-stat-item">
                <span className="routes-stat-val">500+</span>
                <span className="routes-stat-lbl">chuyến / tháng</span>
              </div>
              <div className="routes-stat-divider" />
              <div className="routes-stat-item">
                <span className="routes-stat-val">2–3h</span>
                <span className="routes-stat-lbl">thời gian</span>
              </div>
              <div className="routes-stat-divider" />
              <div className="routes-stat-item">
                <span className="routes-stat-val">100%</span>
                <span className="routes-stat-lbl">an toàn</span>
              </div>
            </div>
          </div>

          {/* RIGHT — SVG Map */}
          <div className="routes-map-col animate-fade-right">
            <div className="svg-map-container">
              <svg
                viewBox="0 0 500 420"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: '100%', height: '100%', padding: '20px' }}
              >
                {/* Background */}
                <rect width="500" height="420" fill="url(#mapGrad)" rx="16" />
                <defs>
                  <linearGradient id="mapGrad" x1="0" y1="0" x2="500" y2="420" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#edf4f7" />
                    <stop offset="100%" stopColor="#eafafa" />
                  </linearGradient>
                  <linearGradient id="routeLine" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e5aa35" />
                    <stop offset="100%" stopColor="#0c7f8d" />
                  </linearGradient>
                </defs>

                {/* Route path */}
                <path
                  d="M 160 80 Q 200 200 250 260 Q 290 310 330 360"
                  stroke="url(#routeLine)"
                  strokeWidth="3"
                  strokeDasharray="8 5"
                  strokeLinecap="round"
                />

                {/* Hue dot */}
                <circle cx="160" cy="80" r="14" fill="#e5aa35" opacity="0.2" />
                <circle cx="160" cy="80" r="8" fill="#c88925" />
                <circle cx="160" cy="80" r="4" fill="#fff" />
                <text x="178" y="76" fill="#04101b" fontSize="14" fontWeight="800" fontFamily="Be Vietnam Pro, sans-serif">Huế</text>
                <text x="178" y="92" fill="#726b63" fontSize="11" fontFamily="Be Vietnam Pro, sans-serif">Cố đô trầm mặc</text>

                {/* Da Nang dot */}
                <circle cx="250" cy="260" r="14" fill="#c88925" opacity="0.2" />
                <circle cx="250" cy="260" r="8" fill="#e5aa35" />
                <circle cx="250" cy="260" r="4" fill="#fff" />
                <text x="268" y="256" fill="#04101b" fontSize="14" fontWeight="800" fontFamily="Be Vietnam Pro, sans-serif">Đà Nẵng</text>
                <text x="268" y="272" fill="#726b63" fontSize="11" fontFamily="Be Vietnam Pro, sans-serif">Thành phố đáng sống</text>

                {/* Hoi An dot */}
                <circle cx="330" cy="360" r="14" fill="#0c7f8d" opacity="0.2" />
                <circle cx="330" cy="360" r="8" fill="#0c7f8d" />
                <circle cx="330" cy="360" r="4" fill="#fff" />
                <text x="348" y="356" fill="#04101b" fontSize="14" fontWeight="800" fontFamily="Be Vietnam Pro, sans-serif">Hội An</text>
                <text x="348" y="372" fill="#726b63" fontSize="11" fontFamily="Be Vietnam Pro, sans-serif">Phố cổ yên bình</text>

                {/* Distance labels */}
                <rect x="60" y="155" width="72" height="22" rx="11" fill="rgba(200,137,37,0.12)" />
                <text x="96" y="170" fill="#a86e19" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="Be Vietnam Pro, sans-serif">~2 giờ</text>

                <rect x="285" y="295" width="72" height="22" rx="11" fill="rgba(12,127,141,0.12)" />
                <text x="321" y="310" fill="#096674" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="Be Vietnam Pro, sans-serif">~45 phút</text>

                {/* Car icon */}
                <g transform="translate(182, 166)">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#e5aa35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                    <circle cx="7" cy="17" r="2" />
                    <path d="M9 17h6" />
                    <circle cx="17" cy="17" r="2" />
                  </svg>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick booking modal */}
      {open && (
        <div className="routes-modal-overlay" onClick={() => setOpen(false)}>
          <div className="rmt-modal" onClick={(e) => e.stopPropagation()}>
            <button className="rmt-close" onClick={() => setOpen(false)}>×</button>

            {sent ? (
              <div className="rmt-success">
                <div className="rmt-success-check" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 style={{ color: 'var(--primary-900)', fontWeight: 800, marginBottom: 8 }}>
                  Đã nhận yêu cầu!
                </h3>
                <p className="rmt-success-msg">
                  Nhân viên Bảo Châu sẽ gọi xác nhận trong vòng 5 phút. Vui lòng để máy.
                </p>
              </div>
            ) : (
              <div className="rmt-ticket">
                {/* LEFT */}
                <div className="rmt-left">
                  <p className="rmt-section-lbl">Loại chuyến</p>
                  <div className="rmt-type-row" style={{ marginBottom: 18 }}>
                    <button
                      type="button"
                      className={`rmt-type-btn${tripType === 'shared' ? ' active' : ''}`}
                      onClick={() => setTripType('shared')}
                    >
                      <span>Xe ghép</span>
                      <small>Giá tốt hơn</small>
                    </button>
                    <button
                      type="button"
                      className={`rmt-type-btn${tripType === 'private' ? ' active' : ''}`}
                      onClick={() => setTripType('private')}
                    >
                      <span>Bao xe</span>
                      <small>Chỉ nhóm bạn</small>
                    </button>
                  </div>

                  <p className="rmt-section-lbl">Tuyến đường</p>
                  <div className="rmt-field">
                    <select
                      className="bk-select"
                      value={routeLabel}
                      onChange={(e) => setRouteLabel(e.target.value)}
                    >
                      <option value="">— Chọn tuyến —</option>
                      {ROUTES_DATA.map((r) => (
                        <option key={r.key} value={`${r.from} → ${r.to}`}>
                          {r.from} → {r.to}
                        </option>
                      ))}
                    </select>
                  </div>

                  <p className="rmt-section-lbl" style={{ marginTop: 16 }}>Thông tin chuyến</p>
                  <div className="rmt-row">
                    <div className="rmt-field">
                      <label>Ngày đi <span>*</span></label>
                      <input
                        type="date"
                        value={date}
                        min={today}
                        onChange={(e) => setDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="rmt-field">
                      <label>Giờ đi</label>
                      <select value={time} onChange={(e) => setTime(e.target.value)}>
                        {HOURS.map((h) => <option key={h}>{h}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="rmt-field">
                    <label>Số hành khách</label>
                    <select value={pax} onChange={(e) => setPax(e.target.value)}>
                      {[1,2,3,4,5,6,7,8].map((n) => (
                        <option key={n} value={n}>{n} người</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Notch divider */}
                <div className="rmt-notch" />

                {/* RIGHT */}
                <form className="rmt-right" onSubmit={handleSubmit}>
                  <p className="rmt-section-lbl">Thông tin hành khách</p>
                  <div className="rmt-field">
                    <label>Họ và tên <span>*</span></label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </div>
                  <div className="rmt-field">
                    <label>Số điện thoại <span>*</span></label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="090 000 0000"
                      required
                    />
                  </div>
                  <div className="rmt-field">
                    <label>Địa chỉ đón <span>*</span></label>
                    <input
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                      placeholder="Số nhà, đường..."
                      required
                    />
                  </div>
                  <div className="rmt-field">
                    <label>Địa chỉ trả <span>*</span></label>
                    <input
                      value={dropoff}
                      onChange={(e) => setDropoff(e.target.value)}
                      placeholder="Số nhà, đường..."
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="rmt-submit"
                    disabled={!routeLabel || !name || !phone || !date}
                  >
                    {!routeLabel ? 'Chọn tuyến đường trước ←' : 'Xác nhận đặt vé →'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
