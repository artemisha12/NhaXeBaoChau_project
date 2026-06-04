'use client';

import { useState, useEffect, useRef } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { addBookingAction } from '@/app/actions/bookings/actions';

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

export default function BookingForm() {
  const { packages, routes, vehicles } = useAdmin();
  const [submitError, setSubmitError] = useState('');
  const activeRoutes = routes.filter(r => r.status === 'active');
  const [submitting, setSubmitting] = useState(false);
  const [bookingCode, setBookingCode] = useState('');

  // Controlled form states
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [travelTime, setTravelTime] = useState('');
  const [passengerCount, setPassengerCount] = useState(1);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerNote, setCustomerNote] = useState('');

  // New States for split booking flow
  const [tripType, setTripType] = useState<'shared-seat' | 'private-trip'>('shared-seat');
  const [selectedRoute, setSelectedRoute] = useState('');
  const [selectedPkgId, setSelectedPkgId] = useState('');

  // Route Custom Dropdown States
  const [routeDropdownOpen, setRouteDropdownOpen] = useState(false);
  const routeDropdownRef = useRef<HTMLDivElement>(null);

  // Close route dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (routeDropdownRef.current && !routeDropdownRef.current.contains(event.target as Node)) {
        setRouteDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Chỉ hiển thị packages của xe đang active
  const activeVehicleNames = new Set(
    vehicles.filter(v => v.status === 'active').map(v => v.name)
  );
  const activePackages = packages.filter(
    p => p.status === 'active' && activeVehicleNames.has(p.vehicleName)
  );
  const filteredPackages = activePackages.filter(p => p.type === tripType);
  // Dùng routes từ DB thay vì derive từ packages — hiển thị đầy đủ tuyến đường
  const availableRouteNames = activeRoutes.map(r => `${r.from} → ${r.to}`);

  // Sync selectedRoute when tripType / routes change
  useEffect(() => {
    if (availableRouteNames.length > 0) {
      if (!availableRouteNames.includes(selectedRoute)) {
        setSelectedRoute(availableRouteNames[0]);
      }
    } else {
      setSelectedRoute('');
    }
  }, [tripType, routes]);

  // Sync selectedPkgId when selectedRoute / tripType change
  const packagesForRouteAndType = filteredPackages.filter(p => p.routeName === selectedRoute);

  useEffect(() => {
    if (packagesForRouteAndType.length > 0) {
      const exists = packagesForRouteAndType.some(p => String(p.id) === selectedPkgId);
      if (!exists) {
        setSelectedPkgId(String(packagesForRouteAndType[0].id));
      }
    } else {
      setSelectedPkgId('');
    }
  }, [selectedRoute, tripType, packages]);

  const getSeatsForPkg = (pkg: typeof activePackages[0]) => {
    const vehicle = vehicles.find(v => v.name === pkg.vehicleName);
    if (vehicle) return vehicle.seats;
    const match = pkg.vehicleName.match(/\d+/);
    return match ? Number(match[0]) : 7;
  };

  // Passenger count limit matching selected vehicle seats
  const selectedPkg = activePackages.find(p => String(p.id) === selectedPkgId);
  const maxSeats = selectedPkg ? getSeatsForPkg(selectedPkg) : 16;

  useEffect(() => {
    if (passengerCount > maxSeats) {
      setPassengerCount(maxSeats);
    }
  }, [selectedPkgId, maxSeats]);

  const decreasePassengers = () => {
    if (passengerCount > 1) {
      setPassengerCount(prev => prev - 1);
    }
  };

  const increasePassengers = () => {
    if (passengerCount < maxSeats) {
      setPassengerCount(prev => prev + 1);
    }
  };

  // Listen to select-booking-pkg custom event from other components (like PriceList)
  useEffect(() => {
    const handleSelectPkg = (e: Event) => {
      const customEvent = e as CustomEvent<{
        pkgId: string;
        tripType: 'shared-seat' | 'private-trip';
        routeName: string;
      }>;
      if (customEvent.detail) {
        const { pkgId, tripType: newType, routeName: newRoute } = customEvent.detail;
        if (newType) setTripType(newType);
        if (newRoute) setSelectedRoute(newRoute);
        if (pkgId) setSelectedPkgId(pkgId);
      }
    };
    window.addEventListener('select-booking-pkg', handleSelectPkg);
    return () => {
      window.removeEventListener('select-booking-pkg', handleSelectPkg);
    };
  }, []);

  // Form Validation logic (strips non-digits for validation check)
  const isPhoneValid = !!phone.replace(/\D/g, '').match(/^(0[3|5|7|8|9])[0-9]{8}$/);
  const isFormValid = !!(
    selectedRoute &&
    selectedPkgId &&
    customerName.trim() &&
    isPhoneValid &&
    pickupAddress.trim() &&
    dropoffAddress.trim() &&
    travelDate &&
    travelTime
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitError('');

    if (!selectedRoute) { alert('Vui lòng chọn Tuyến đường.'); return; }
    if (!selectedPkgId) { alert('Vui lòng chọn Gói xe ở bên trái.'); return; }
    if (!customerName.trim()) { alert('Vui lòng nhập Họ và tên.'); return; }
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone.match(/^(0[3|5|7|8|9])[0-9]{8}$/)) {
      alert('Vui lòng nhập Số điện thoại hợp lệ (10 số, ví dụ: 0905123456).'); return;
    }
    if (!pickupAddress.trim()) { alert('Vui lòng nhập Địa chỉ đón.'); return; }
    if (!dropoffAddress.trim()) { alert('Vui lòng nhập Địa chỉ trả.'); return; }
    if (!travelDate) { alert('Vui lòng chọn Ngày đi.'); return; }
    if (!travelTime) { alert('Vui lòng chọn Giờ đi.'); return; }

    const selectedPkg = activePackages.find(p => p.id === Number(selectedPkgId));
    if (!selectedPkg) return;

    setSubmitting(true);

    const unitPrice = selectedPkg.price;
    const isShared = selectedPkg.type === 'shared-seat';
    const totalPrice = isShared ? unitPrice * passengerCount : unitPrice;

    const result = await addBookingAction({
      customerName,
      phone: cleanPhone,
      routeName: selectedPkg.routeName,
      packageId: selectedPkg.id,
      travelDate,
      travelTime,
      pickupAddress,
      dropoffAddress,
      passengerCount: isShared ? passengerCount : 1,
      totalPrice,
      priceAtBooking: unitPrice,
      customerEmail,
      customerNote,
    });

    setSubmitting(false);

    if (!result.success) {
      setSubmitError(result.error || 'Đặt vé thất bại. Vui lòng thử lại.');
      return;
    }

    setBookingCode(result.data?.code || 'BC-???');

    // Reset form
    setCustomerName('');
    setPhone('');
    setSelectedPkgId('');
    setPickupAddress('');
    setDropoffAddress('');
    setTravelDate('');
    setTravelTime('');
    setPassengerCount(1);
    setCustomerEmail('');
    setCustomerNote('');
  };

  return (
    <section id="booking-section" className="section section-soft font-sans">
      <div className="container">
        {/* Title area matching mockup */}
        <div style={{ textAlign: 'left', marginBottom: '28px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--primary-900)', margin: 0 }}>Đặt vé tại đây</h2>
          <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', marginTop: '6px', margin: 0 }}>Điền thông tin bên dưới, nhà xe xác nhận trong 15 phút</p>
        </div>

        {bookingCode ? (
          <div className="booking-wrapper" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="booking-success show">
              <div className="booking-success-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', background: 'var(--success-50)', border: '1.5px solid var(--success-200)', color: 'var(--success-700)', width: '64px', height: '64px', borderRadius: '50%' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p style={{ color: 'var(--success-700)', fontWeight: 700 }}>Đã nhận yêu cầu đặt vé!</p>
              <div className="booking-success-code">{bookingCode}</div>
              <p className="booking-success-msg">
                Nhân viên Nhà Xe Bảo Châu sẽ liên hệ qua điện thoại để xác nhận thông tin đón trong vòng 5 phút.<br />
                Cảm ơn quý khách đã tin tưởng!
              </p>
              <button
                onClick={() => setBookingCode('')}
                className="btn btn-ghost btn-sm"
                style={{ marginTop: '20px' }}
              >
                Đặt vé khác
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="booking-split-wrapper">
              
              {/* LEFT COLUMN: Route and Package selectors */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Trip Type Selector */}
                <div className="form-group">
                  <label className="booking-section-label">LOẠI CHUYẾN</label>
                  <div className="trip-type-grid">
                    <div 
                      className={`trip-type-card ${tripType === 'shared-seat' ? 'active' : ''}`}
                      onClick={() => {
                        setTripType('shared-seat');
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: tripType === 'shared-seat' ? 'var(--teal-600)' : 'var(--text-secondary)' }}>
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        <span className="trip-type-card-title">Xe ghép</span>
                      </div>
                      <span className="trip-type-card-desc">Giá tốt hơn</span>
                    </div>
                    
                    <div 
                      className={`trip-type-card ${tripType === 'private-trip' ? 'active' : ''}`}
                      onClick={() => {
                        setTripType('private-trip');
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: tripType === 'private-trip' ? 'var(--teal-600)' : 'var(--text-secondary)' }}>
                          <rect x="3" y="11" width="18" height="10" rx="2" />
                          <path d="M12 2v9" />
                          <path d="M8 5h8" />
                        </svg>
                        <span className="trip-type-card-title">Bao xe</span>
                      </div>
                      <span className="trip-type-card-desc">Chỉ nhóm bạn</span>
                    </div>
                  </div>
                </div>

                {/* Route Selector */}
                <div className="form-group">
                  <label className="booking-section-label">TUYẾN ĐƯỜNG</label>
                  <div className="custom-select-container" ref={routeDropdownRef}>
                    <div 
                      className={`custom-select-trigger ${routeDropdownOpen ? 'active' : ''}`}
                      onClick={() => setRouteDropdownOpen(!routeDropdownOpen)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--teal-600)' }}>
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="16" />
                          <line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                        <span>{selectedRoute || 'Chọn hành trình'}</span>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.2s', transform: routeDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                    {routeDropdownOpen && (
                      <div className="custom-select-options">
                        {availableRouteNames.length > 0 ? (
                          availableRouteNames.map(route => (
                            <div 
                              key={route} 
                              className={`custom-select-option ${selectedRoute === route ? 'selected' : ''}`}
                              onClick={() => {
                                setSelectedRoute(route);
                                setRouteDropdownOpen(false);
                              }}
                            >
                              <span>{route}</span>
                              {selectedRoute === route && (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </div>
                          ))
                        ) : (
                          <div style={{ padding: '12px', fontSize: '13.5px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            Không tìm thấy tuyến đường tương ứng
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Package selector cards */}
                {selectedRoute && packagesForRouteAndType.length > 0 && (
                  <div className="form-group animate-slide-down">
                    <label className="booking-section-label">GÓI XE</label>
                    <div className="pkg-selector-list">
                      {packagesForRouteAndType.map(pkg => {
                        const isSelected = String(pkg.id) === selectedPkgId;
                        const seats = getSeatsForPkg(pkg);
                        const priceText = formatMoney(pkg.price);
                        const unitText = pkg.type === 'shared-seat' ? 'người' : 'chuyến';
                        return (
                          <div
                            key={pkg.id}
                            className={`pkg-selector-card ${isSelected ? 'active' : ''}`}
                            onClick={() => {
                              setSelectedPkgId(String(pkg.id));
                            }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                              <span className="pkg-selector-left">{pkg.vehicleName}</span>
                              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                {pkg.description || `${seats} ghế thoải mái`}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span className="pkg-selector-center">{seats} chỗ</span>
                              <span className="pkg-selector-right">{priceText}/{unitText}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* VERTICAL ORNAMENT DIVIDER */}
              <div className="booking-vertical-divider"></div>

              {/* RIGHT COLUMN: Customer contact inputs */}
              <div className="booking-grid">
                {/* Họ và tên */}
                <div className="form-group">
                  <label className="booking-section-label" style={{ color: 'var(--primary-900)' }}>
                    HỌ VÀ TÊN <span style={{ color: 'var(--danger-500)' }}>*</span>
                  </label>
                  <div className="input-icon-wrapper">
                    <input 
                      type="text" 
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="form-input" 
                      placeholder="Nguyễn Văn A" 
                      required 
                    />
                    <div className="input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Số điện thoại */}
                <div className="form-group">
                  <label className="booking-section-label" style={{ color: 'var(--primary-900)' }}>
                    SỐ ĐIỆN THOẠI <span style={{ color: 'var(--danger-500)' }}>*</span>
                  </label>
                  <div className="input-icon-wrapper">
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="form-input" 
                      placeholder="09x xxx xxxx" 
                      pattern="(0[3|5|7|8|9])[0-9]{8}"
                      title="Vui lòng nhập đúng định dạng số điện thoại Việt Nam (10 số, bắt đầu bằng 03, 05, 07, 08, 09)"
                      required 
                    />
                    <div className="input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Địa chỉ đón */}
                <div className="form-group">
                  <label className="booking-section-label" style={{ color: 'var(--primary-900)' }}>
                    ĐỊA CHỈ ĐÓN <span style={{ color: 'var(--danger-500)' }}>*</span>
                  </label>
                  <div className="input-icon-wrapper">
                    <input 
                      type="text" 
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      className="form-input" 
                      placeholder="Số nhà, tên khách sạn, đón tận nơi..." 
                      required 
                    />
                    <div className="input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Địa chỉ trả */}
                <div className="form-group">
                  <label className="booking-section-label" style={{ color: 'var(--primary-900)' }}>
                    ĐỊA CHỈ TRẢ <span style={{ color: 'var(--danger-500)' }}>*</span>
                  </label>
                  <div className="input-icon-wrapper">
                    <input 
                      type="text" 
                      value={dropoffAddress}
                      onChange={(e) => setDropoffAddress(e.target.value)}
                      className="form-input" 
                      placeholder="Số nhà, tên đường, trả tận nơi..." 
                      required 
                    />
                    <div className="input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Ngày đi */}
                <div className="form-group">
                  <label className="booking-section-label">NGÀY ĐI <span style={{ color: 'var(--danger-500)' }}>*</span></label>
                  <div className="input-icon-wrapper">
                    <input
                      type="date"
                      value={travelDate}
                      onChange={(e) => {
                        setTravelDate(e.target.value);
                      }}
                      className="form-input"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                    <div className="input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Giờ đi */}
                <div className="form-group">
                  <label className="booking-section-label">GIỜ ĐI <span style={{ color: 'var(--danger-500)' }}>*</span></label>
                  <div className="input-icon-wrapper">
                    <input 
                      type="time" 
                      value={travelTime}
                      onChange={(e) => setTravelTime(e.target.value)}
                      className="form-input" 
                      required
                    />
                    <div className="input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Số khách */}
                <div className="form-group booking-full">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ textAlign: 'left' }}>
                      <label className="booking-section-label" style={{ marginBottom: '2px' }}>HÀNH KHÁCH <span style={{ color: 'var(--danger-500)' }}>*</span></label>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Tối đa {maxSeats} ghế cho dòng xe này</span>
                    </div>
                    
                    <div className="quantity-selector">
                      <button 
                        type="button" 
                        className="quantity-btn"
                        onClick={decreasePassengers}
                        disabled={passengerCount <= 1}
                      >
                        −
                      </button>
                      <div className="quantity-value">{passengerCount}</div>
                      <button 
                        type="button" 
                        className="quantity-btn"
                        onClick={increasePassengers}
                        disabled={passengerCount >= maxSeats}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Ghi chú thêm */}
                <div className="form-group booking-full">
                  <label className="booking-section-label" style={{ color: 'var(--primary-900)' }}>
                    GHI CHÚ
                  </label>
                  <textarea
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    className="form-textarea"
                    placeholder="Trẻ nhỏ, hành lý cồng kềnh, yêu cầu đặc biệt..."
                    rows={2}
                  />
                </div>

                {/* Booking Price Summary */}
                {selectedPkg && (
                  <div className="form-group booking-full animate-slide-down">
                    <div style={{
                      background: 'var(--teal-50, #f0fdfa)',
                      border: '1.5px solid var(--teal-200, #99f6e4)',
                      borderRadius: '16px',
                      padding: '16px',
                      color: 'var(--teal-950, #042f2e)',
                      fontSize: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      textAlign: 'left'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(13,148,136,0.2)', paddingBottom: '8px' }}>
                        <span style={{ fontWeight: 700 }}>Tóm tắt đơn hàng:</span>
                        <span style={{ fontWeight: 800, color: 'var(--teal-700, #0f766e)' }}>
                          {selectedPkg.type === 'shared-seat' ? 'Xe ghép (Giá theo người)' : 'Bao xe (Nguyên chuyến)'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span>Hành trình:</span>
                        <span style={{ fontWeight: 700 }}>{selectedPkg.routeName}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span>Dòng xe:</span>
                        <span style={{ fontWeight: 700 }}>{selectedPkg.vehicleName}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span>Đơn giá:</span>
                        <span style={{ fontWeight: 700 }}>
                          {formatMoney(selectedPkg.price)}/{selectedPkg.type === 'shared-seat' ? 'người' : 'chuyến'}
                        </span>
                      </div>
                      {selectedPkg.type === 'shared-seat' && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                          <span>Số lượng:</span>
                          <span style={{ fontWeight: 700 }}>{passengerCount} người</span>
                        </div>
                      )}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '1px solid rgba(13,148,136,0.2)',
                        paddingTop: '10px',
                        marginTop: '4px'
                      }}>
                        <span style={{ fontWeight: 700, fontSize: '14px' }}>Tổng tiền thanh toán:</span>
                        <span style={{
                          fontWeight: 900,
                          fontSize: '20px',
                          color: '#c88925', // matching theme color
                        }}>
                          {formatMoney(selectedPkg.type === 'shared-seat' ? selectedPkg.price * passengerCount : selectedPkg.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <div className="booking-full" style={{ marginTop: '8px' }}>
                  <button
                    type="submit"
                    className={`btn-teal-booking ${isFormValid ? 'active' : ''}`}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                          <line x1="12" y1="2" x2="12" y2="6" />
                          <line x1="12" y1="18" x2="12" y2="22" />
                          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                          <line x1="2" y1="12" x2="6" y2="12" />
                          <line x1="18" y1="12" x2="22" y2="12" />
                          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                          <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
                        </svg>
                        Đang gửi đơn...
                      </>
                    ) : (
                      <>
                        Xác nhận đặt vé →
                      </>
                    )}
                  </button>

                  {submitError && (
                    <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '13px', color: '#e53e3e', fontWeight: 600 }}>
                      ⚠ {submitError}
                    </p>
                  )}

                  {/* Caption advice when button is inactive */}
                  <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {!selectedPkgId ? (
                      <>
                        <span className="desktop-only">← Vui lòng chọn gói xe bên trái</span>
                        <span className="mobile-only">↑ Vui lòng chọn dòng xe ở trên</span>
                      </>
                    ) : !isFormValid ? (
                      "Vui lòng điền đủ các trường bắt buộc (*) để kích hoạt nút đặt vé"
                    ) : (
                      <span style={{ color: 'var(--success-700)', fontWeight: 700 }}>✓ Thông tin đã đầy đủ, sẵn sàng gửi yêu cầu!</span>
                    )}
                  </p>
                </div>
              </div>

            </div>
          </form>
        )}
      </div>
    </section>
  );
}
