'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAdmin } from '@/context/AdminContext';
import { addBookingAction } from '@/app/actions/bookings/actions';

const RealMap = dynamic(() => import('./RealMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-50/50" style={{ height: '380px' }}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#c88925] border-t-transparent"></div>
    </div>
  ),
});


const HOURS = Array.from({ length: 17 }, (_, i) => `${String(i + 5).padStart(2, '0')}:00`);

export default function Routes() {
  const { packages, routes, vehicles } = useAdmin();
  const activeRoutes = routes.filter(r => r.status === 'active');

  const [open, setOpen] = useState(false);
  const [routeLabel, setRouteLabel] = useState('');
  const [tripType, setTripType] = useState<'shared' | 'private'>('shared');
  const [selectedPkgId, setSelectedPkgId] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('07:00');
  const [pax, setPax] = useState('1');
  const [sent, setSent] = useState(false);

  // Map client tripType to admin package type
  const mappedType = tripType === 'shared' ? 'shared-seat' : 'private-trip';
  
  // Chỉ hiển thị packages của xe đang active
  const activeVehicleNames = new Set(
    vehicles.filter(v => v.status === 'active').map(v => v.name)
  );
  const activePackages = packages.filter(
    p => p.status === 'active' && activeVehicleNames.has(p.vehicleName)
  );
  const routePackages = activePackages.filter(
    p => p.routeName === routeLabel && p.type === mappedType
  );

  // Sync selectedPkgId when routeLabel, tripType or packages change
  useEffect(() => {
    if (routePackages.length > 0) {
      const exists = routePackages.some(p => String(p.id) === selectedPkgId);
      if (!exists) {
        setSelectedPkgId(String(routePackages[0].id));
      }
    } else {
      setSelectedPkgId('');
    }
  }, [routeLabel, tripType, packages]);

  function openModal(label: string) {
    setRouteLabel(label);
    const mappedT = tripType === 'shared' ? 'shared-seat' : 'private-trip';
    const pkgs = packages.filter(p => p.status === 'active' && p.routeName === label && p.type === mappedT);
    if (pkgs.length > 0) {
      setSelectedPkgId(String(pkgs[0].id));
    } else {
      setSelectedPkgId('');
    }
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPkgId) { alert('Vui lòng chọn tuyến đường và gói xe.'); return; }

    const selectedPkg = activePackages.find(p => String(p.id) === selectedPkgId);
    if (!selectedPkg) return;

    setSent(true);

    const unitPrice = selectedPkg.price;
    const isShared = selectedPkg.type === 'shared-seat';
    const totalPrice = isShared ? unitPrice * Number(pax) : unitPrice;

    const result = await addBookingAction({
      customerName: name,
      phone,
      routeName: selectedPkg.routeName,
      packageId: Number(selectedPkgId),
      travelDate: date,
      travelTime: time,
      pickupAddress: pickup,
      dropoffAddress: dropoff,
      passengerCount: Number(pax),
      totalPrice,
      priceAtBooking: unitPrice,
    });

    setSent(false);

    if (!result.success) {
      alert('Đặt vé thất bại: ' + (result.error || 'Vui lòng thử lại.'));
      return;
    }

    setOpen(false);
    setName(''); setPhone(''); setPickup(''); setDropoff('');
    setDate(''); setTime('07:00'); setPax('1'); setSelectedPkgId('');
    alert(`Đặt vé thành công! Mã đơn: ${result.data?.code || ''}. Nhân viên sẽ liên hệ xác nhận sớm nhất.`);
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
              {activeRoutes.map((r) => (
                <li
                  key={r.id}
                  className="routes-list-item"
                  onClick={() => openModal(`${r.from} → ${r.to}`)}
                >
                  <div className="routes-list-route">
                    <span className="routes-list-from">{r.from}</span>
                    <span className="routes-list-arrows">⇄</span>
                    <span className="routes-list-to">{r.to}</span>
                  </div>
                  <span className="routes-list-note">~{r.duration} · {r.distanceKm} km</span>
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
                      required
                    >
                      <option value="">— Chọn tuyến —</option>
                      {activeRoutes.map((r) => (
                        <option key={r.id} value={`${r.from} → ${r.to}`}>
                          {r.from} → {r.to}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* SELECT VEHICLE PACKAGE LIST */}
                  {routeLabel && routePackages.length > 0 && (
                    <div style={{ marginBottom: 18 }}>
                      <p className="rmt-section-lbl">Chọn xe &amp; Gói cước *</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {routePackages.map((pkg) => {
                          const isSelected = String(pkg.id) === selectedPkgId;
                          const priceText = new Intl.NumberFormat("vi-VN").format(pkg.price) + "đ";
                          const unitText = pkg.type === 'shared-seat' ? 'người' : 'xe';
                          return (
                            <div
                              key={pkg.id}
                              onClick={() => setSelectedPkgId(String(pkg.id))}
                              style={{
                                cursor: 'pointer',
                                borderRadius: '12px',
                                padding: '12px',
                                border: isSelected ? '2px solid var(--accent-500)' : '1px solid rgba(232, 220, 203, 0.5)',
                                background: isSelected ? 'var(--accent-50)' : '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                transition: 'all 0.2s ease',
                              }}
                            >
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                                <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '13px' }}>
                                  {pkg.vehicleName}
                                </span>
                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                  {pkg.description}
                                </span>
                              </div>
                              <span style={{ fontWeight: 950, color: 'var(--success-700)', fontSize: '13.5px', whiteSpace: 'nowrap' }}>
                                {priceText}
                                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                  /{unitText}
                                </span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

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
                    style={{
                      background: 'linear-gradient(135deg, var(--accent-500), var(--accent-600))',
                      color: '#fff',
                      boxShadow: '0 4px 14px rgba(200, 137, 37, 0.2)',
                      cursor: 'pointer',
                    }}
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
