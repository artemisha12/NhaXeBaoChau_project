'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { addBookingAction } from '@/app/actions/bookings/actions';

const items = [
  {
    number: "01",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6v7z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    title: "An toàn tuyệt đối",
    description:
      "Tài xế kinh nghiệm, xe kiểm tra định kỳ và luôn ưu tiên sự an tâm của khách hàng.",
  },
  {
    number: "02",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: "Đón tận địa chỉ",
    description:
      "Đón và trả khách đúng nơi yêu cầu, phù hợp cho khách du lịch, gia đình và công tác.",
  },
  {
    number: "03",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16.5 12" />
      </svg>
    ),
    title: "Đúng giờ cam kết",
    description:
      "Lịch trình rõ ràng, chủ động liên hệ trước chuyến đi và hạn chế tối đa thời gian chờ.",
  },
  {
    number: "04",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5 5 3Z" />
      </svg>
    ),
    title: "Trải nghiệm cao cấp",
    description:
      "Xe đời mới, không gian sạch sẽ, ghế ngồi thoải mái và phục vụ chỉn chu trên từng chuyến.",
  },
];

const HOURS = Array.from({ length: 17 }, (_, i) => `${String(i + 5).padStart(2, '0')}:00`);

export default function WhyUs() {
  const { routes, packages, vehicles } = useAdmin();
  const activeRoutes = routes.filter(r => r.status === 'active');
  const availableRouteNames = activeRoutes.map(r => `${r.from} → ${r.to}`);

  // Quick search bar states
  const [searchRoute, setSearchRoute] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchTime, setSearchTime] = useState('07:00');
  const [searchTripType, setSearchTripType] = useState<'shared' | 'private'>('shared');
  const [routeOpen, setRouteOpen] = useState(false);
  const routeRef = useRef<HTMLDivElement>(null);

  // Modal states (reuse same pattern as Routes modal)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRouteLabel, setModalRouteLabel] = useState('');
  const [modalTripType, setModalTripType] = useState<'shared' | 'private'>('shared');
  const [modalDate, setModalDate] = useState('');
  const [modalTime, setModalTime] = useState('07:00');
  const [modalPax, setModalPax] = useState('1');
  const [modalPkgId, setModalPkgId] = useState('');
  const [modalName, setModalName] = useState('');
  const [modalPhone, setModalPhone] = useState('');
  const [modalPickup, setModalPickup] = useState('');
  const [modalDropoff, setModalDropoff] = useState('');
  const [modalSent, setModalSent] = useState(false);
  const [modalBookingCode, setModalBookingCode] = useState('');
  const [noTripsFound, setNoTripsFound] = useState(false);

  // Active vehicles and packages
  const activeVehicleNames = new Set(
    vehicles.filter(v => v.status === 'active').map(v => v.name)
  );
  const activePackages = packages.filter(
    p => p.status === 'active' && activeVehicleNames.has(p.vehicleName)
  );

  // Modal packages based on selected route + trip type
  const mappedModalType = modalTripType === 'shared' ? 'shared-seat' : 'private-trip';
  const modalPackages = activePackages.filter(
    p => p.routeName === modalRouteLabel && p.type === mappedModalType
  );

  // Sync modal package selection
  useEffect(() => {
    if (modalPackages.length > 0) {
      const exists = modalPackages.some(p => String(p.id) === modalPkgId);
      if (!exists) setModalPkgId(String(modalPackages[0].id));
    } else {
      setModalPkgId('');
    }
  }, [modalRouteLabel, modalTripType, packages]);

  // Set default route on mount
  useEffect(() => {
    if (availableRouteNames.length > 0 && !searchRoute) {
      setSearchRoute(availableRouteNames[0]);
    }
  }, [availableRouteNames.length]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (routeRef.current && !routeRef.current.contains(e.target as Node)) {
        setRouteOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Handle "Tìm chuyến" — open modal with pre-filled data
  const handleSearch = () => {
    if (!searchRoute) return;

    // Map search trip type
    const mappedType = searchTripType === 'shared' ? 'shared-seat' : 'private-trip';

    // Check if there are matching packages
    const matchingPkgs = activePackages.filter(
      p => p.routeName === searchRoute && p.type === mappedType
    );

    // Pre-fill modal with search data
    setModalRouteLabel(searchRoute);
    setModalTripType(searchTripType);
    setModalDate(searchDate);
    setModalTime(searchTime || '07:00');
    setModalPax('1');
    setModalSent(false);
    setModalBookingCode('');

    if (matchingPkgs.length > 0) {
      setModalPkgId(String(matchingPkgs[0].id));
      setNoTripsFound(false);
    } else {
      setModalPkgId('');
      setNoTripsFound(true);
    }

    setModalOpen(true);
  };

  // Handle submit booking from modal
  async function handleModalSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!modalPkgId) { alert('Vui lòng chọn gói xe.'); return; }
    if (!modalName.trim()) { alert('Vui lòng nhập họ và tên.'); return; }
    if (!modalPhone.trim()) { alert('Vui lòng nhập số điện thoại.'); return; }
    if (!modalPickup.trim()) { alert('Vui lòng nhập địa chỉ đón.'); return; }
    if (!modalDropoff.trim()) { alert('Vui lòng nhập địa chỉ trả.'); return; }
    if (!modalDate) { alert('Vui lòng chọn ngày đi.'); return; }

    const selectedPkg = activePackages.find(p => String(p.id) === modalPkgId);
    if (!selectedPkg) return;

    setModalSent(true);

    const unitPrice = selectedPkg.price;
    const isShared = selectedPkg.type === 'shared-seat';
    const totalPrice = isShared ? unitPrice * Number(modalPax) : unitPrice;

    const result = await addBookingAction({
      customerName: modalName,
      phone: modalPhone,
      routeName: selectedPkg.routeName,
      packageId: Number(modalPkgId),
      travelDate: modalDate,
      travelTime: modalTime,
      pickupAddress: modalPickup,
      dropoffAddress: modalDropoff,
      passengerCount: Number(modalPax),
      totalPrice,
      priceAtBooking: unitPrice,
    });

    if (!result.success) {
      setModalSent(false);
      alert('Đặt vé thất bại: ' + (result.error || 'Vui lòng thử lại.'));
      return;
    }

    setModalBookingCode(result.data?.code || 'BC-???');
  }

  // Close modal and reset
  function closeModal() {
    setModalOpen(false);
    setNoTripsFound(false);
    if (modalBookingCode) {
      // Reset form after successful booking
      setModalName(''); setModalPhone('');
      setModalPickup(''); setModalDropoff('');
      setModalDate(''); setModalTime('07:00');
      setModalPax('1'); setModalPkgId('');
      setModalSent(false); setModalBookingCode('');
    }
  }

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <section id="services" className="luxury-why">
      <div className="container">
        <div className="luxury-why-head animate-fade-up">
          <h2 className="luxury-title">
            Vì sao chọn Bảo Châu?
          </h2>

          <p className="luxury-desc" style={{ fontWeight: 600, color: 'var(--accent-600)', marginTop: '12px' }}>
            Đón tận nơi · Đúng giờ cam kết · Trải nghiệm 5 sao
          </p>
        </div>

        <div className="luxury-why-grid">
          {items.map((item, i) => (
            <article className={`luxury-why-card animate-fade-up delay-${(i + 1) * 100}`} key={item.title}>
              <div className="luxury-card-top">
                <span className="luxury-number">{item.number}</span>
                <div className="luxury-icon">
                  {item.icon}
                </div>
              </div>

              <div className="luxury-line" />

              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>

        {/* ── Quick Search Bar ── */}
        <div className="quick-search-wrapper animate-fade-up delay-400">
          {/* Decorative divider */}
          <div className="quick-search-divider">
            <span className="quick-search-divider-text">Tìm chuyến nhanh</span>
          </div>

          <div className="quick-search-bar">
            {/* Route Dropdown */}
            <div className="quick-search-field quick-search-field--route" ref={routeRef}>
              <label className="quick-search-label">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Tuyến đường
              </label>
              <div
                className={`quick-search-select ${routeOpen ? 'active' : ''}`}
                onClick={() => setRouteOpen(!routeOpen)}
              >
                <span>{searchRoute || 'Chọn tuyến'}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.2s', transform: routeOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
              {routeOpen && (
                <div className="quick-search-dropdown">
                  {availableRouteNames.map(route => (
                    <div
                      key={route}
                      className={`quick-search-dropdown-item ${searchRoute === route ? 'selected' : ''}`}
                      onClick={() => {
                        setSearchRoute(route);
                        setRouteOpen(false);
                      }}
                    >
                      <span>{route}</span>
                      {searchRoute === route && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Date Input */}
            <div className="quick-search-field">
              <label className="quick-search-label">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Ngày đi
              </label>
              <input
                type="date"
                className="quick-search-input"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                min={todayStr}
              />
            </div>

            {/* Time Input */}
            <div className="quick-search-field">
              <label className="quick-search-label">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Giờ đi
              </label>
              <select
                className="quick-search-input"
                value={searchTime}
                onChange={(e) => setSearchTime(e.target.value)}
              >
                {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            {/* Trip Type Toggle */}
            <div className="quick-search-field">
              <label className="quick-search-label">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                  <circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" />
                </svg>
                Loại chuyến
              </label>
              <div className="quick-search-toggle">
                <button
                  type="button"
                  className={`quick-search-toggle-btn ${searchTripType === 'shared' ? 'active' : ''}`}
                  onClick={() => setSearchTripType('shared')}
                >
                  Xe ghép
                </button>
                <button
                  type="button"
                  className={`quick-search-toggle-btn ${searchTripType === 'private' ? 'active' : ''}`}
                  onClick={() => setSearchTripType('private')}
                >
                  Bao xe
                </button>
              </div>
            </div>

            {/* Search Button */}
            <div className="quick-search-field quick-search-field--btn">
              <button
                type="button"
                className="quick-search-btn"
                onClick={handleSearch}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Tìm chuyến
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Booking Modal (same design as Routes) ── */}
      {modalOpen && (
        <div className="routes-modal-overlay" onClick={closeModal}>
          <div className="rmt-modal" onClick={(e) => e.stopPropagation()}>
            <button className="rmt-close" onClick={closeModal}>×</button>

            {modalBookingCode ? (
              /* Success state */
              <div className="rmt-success">
                <div className="rmt-success-check" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 style={{ color: 'var(--primary-900)', fontWeight: 800, marginBottom: 8 }}>
                  Đã nhận yêu cầu!
                </h3>
                <div className="booking-success-code">{modalBookingCode}</div>
                <p className="rmt-success-msg">
                  Nhân viên Bảo Châu sẽ gọi xác nhận trong vòng 5 phút. Vui lòng để máy.
                </p>
              </div>
            ) : noTripsFound ? (
              /* No trips found state */
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'var(--warning-50)', border: '1.5px solid rgba(245, 158, 11, 0.2)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20, color: 'var(--warning-600)',
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary-900)', margin: '0 0 10px' }}>
                  Không tìm thấy chuyến nào
                </h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 24px' }}>
                  Hiện chưa có gói xe <strong>{searchTripType === 'shared' ? 'xe ghép' : 'bao xe'}</strong> cho tuyến <strong>{modalRouteLabel}</strong>.<br />
                  Vui lòng thử loại chuyến khác hoặc liên hệ hotline để được hỗ trợ.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      // Switch trip type and retry
                      const newType = modalTripType === 'shared' ? 'private' : 'shared';
                      setModalTripType(newType as 'shared' | 'private');
                      setNoTripsFound(false);
                      const mapped = newType === 'shared' ? 'shared-seat' : 'private-trip';
                      const pkgs = activePackages.filter(p => p.routeName === modalRouteLabel && p.type === mapped);
                      if (pkgs.length > 0) {
                        setModalPkgId(String(pkgs[0].id));
                      } else {
                        setNoTripsFound(true);
                      }
                    }}
                  >
                    Thử {modalTripType === 'shared' ? 'Bao xe' : 'Xe ghép'}
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={closeModal}>
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              /* Normal booking form */
              <div className="rmt-ticket">
                {/* LEFT — Trip details */}
                <div className="rmt-left">
                  <p className="rmt-section-lbl">Loại chuyến</p>
                  <div className="rmt-type-row" style={{ marginBottom: 18 }}>
                    <button
                      type="button"
                      className={`rmt-type-btn${modalTripType === 'shared' ? ' active' : ''}`}
                      onClick={() => setModalTripType('shared')}
                    >
                      <span>Xe ghép</span>
                      <small>Giá tốt hơn</small>
                    </button>
                    <button
                      type="button"
                      className={`rmt-type-btn${modalTripType === 'private' ? ' active' : ''}`}
                      onClick={() => setModalTripType('private')}
                    >
                      <span>Bao xe</span>
                      <small>Chỉ nhóm bạn</small>
                    </button>
                  </div>

                  <p className="rmt-section-lbl">Tuyến đường</p>
                  <div className="rmt-field">
                    <select
                      className="bk-select"
                      value={modalRouteLabel}
                      onChange={(e) => setModalRouteLabel(e.target.value)}
                      required
                    >
                      <option value="">— Chọn tuyến —</option>
                      {activeRoutes.map(r => (
                        <option key={r.id} value={`${r.from} → ${r.to}`}>
                          {r.from} → {r.to}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Package selector */}
                  {modalRouteLabel && modalPackages.length > 0 && (
                    <div style={{ marginBottom: 18 }}>
                      <p className="rmt-section-lbl">Chọn xe &amp; Gói cước *</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {modalPackages.map(pkg => {
                          const isSelected = String(pkg.id) === modalPkgId;
                          const priceText = new Intl.NumberFormat("vi-VN").format(pkg.price) + "đ";
                          const unitText = pkg.type === 'shared-seat' ? 'người' : 'xe';
                          return (
                            <div
                              key={pkg.id}
                              onClick={() => setModalPkgId(String(pkg.id))}
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

                  {/* No packages for this route+type */}
                  {modalRouteLabel && modalPackages.length === 0 && (
                    <div style={{ marginBottom: 18, padding: '14px', background: 'var(--warning-50)', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.15)' }}>
                      <p style={{ fontSize: '13px', color: 'var(--warning-700)', fontWeight: 600, margin: 0 }}>
                        Chưa có gói {mappedModalType === 'shared-seat' ? 'xe ghép' : 'bao xe'} cho tuyến này.
                      </p>
                    </div>
                  )}

                  <p className="rmt-section-lbl" style={{ marginTop: 16 }}>Thông tin chuyến</p>
                  <div className="rmt-row">
                    <div className="rmt-field">
                      <label>Ngày đi <span>*</span></label>
                      <input
                        type="date"
                        value={modalDate}
                        min={todayStr}
                        onChange={(e) => setModalDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="rmt-field">
                      <label>Giờ đi</label>
                      <select value={modalTime} onChange={(e) => setModalTime(e.target.value)}>
                        {HOURS.map(h => <option key={h}>{h}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="rmt-field">
                    <label>Số hành khách</label>
                    <select value={modalPax} onChange={(e) => setModalPax(e.target.value)}>
                      {[1,2,3,4,5,6,7,8].map(n => (
                        <option key={n} value={n}>{n} người</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Notch divider */}
                <div className="rmt-notch" />

                {/* RIGHT — Customer info */}
                <form className="rmt-right" onSubmit={handleModalSubmit}>
                  <p className="rmt-section-lbl">Thông tin hành khách</p>
                  <div className="rmt-field">
                    <label>Họ và tên <span>*</span></label>
                    <input
                      value={modalName}
                      onChange={(e) => setModalName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </div>
                  <div className="rmt-field">
                    <label>Số điện thoại <span>*</span></label>
                    <input
                      type="tel"
                      value={modalPhone}
                      onChange={(e) => setModalPhone(e.target.value)}
                      placeholder="090 000 0000"
                      required
                    />
                  </div>
                  <div className="rmt-field">
                    <label>Địa chỉ đón <span>*</span></label>
                    <input
                      value={modalPickup}
                      onChange={(e) => setModalPickup(e.target.value)}
                      placeholder="Số nhà, đường..."
                      required
                    />
                  </div>
                  <div className="rmt-field">
                    <label>Địa chỉ trả <span>*</span></label>
                    <input
                      value={modalDropoff}
                      onChange={(e) => setModalDropoff(e.target.value)}
                      placeholder="Số nhà, đường..."
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="rmt-submit"
                    disabled={modalSent || !modalPkgId}
                    style={{
                      background: (!modalPkgId) ? 'var(--gray-300)' : 'linear-gradient(135deg, var(--accent-500), var(--accent-600))',
                      color: (!modalPkgId) ? 'var(--gray-600)' : '#fff',
                      boxShadow: (!modalPkgId) ? 'none' : '0 4px 14px rgba(200, 137, 37, 0.2)',
                      cursor: (!modalPkgId) ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {modalSent ? 'Đang gửi...' : !modalPkgId ? 'Chọn gói xe trước ←' : 'Xác nhận đặt vé →'}
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
