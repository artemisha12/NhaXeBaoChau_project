'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const RealMap = dynamic(() => import('./RealMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-50/50" style={{ height: '380px' }}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#c88925] border-t-transparent"></div>
    </div>
  ),
});

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
              <RealMap />
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
