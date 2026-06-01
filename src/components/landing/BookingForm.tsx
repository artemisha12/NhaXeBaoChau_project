'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

export default function BookingForm() {
  const { packages, vehicles, addBooking } = useAdmin();
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

  // Group active packages
  const activePackages = packages.filter(p => p.status === 'active');
  const filteredPackages = activePackages.filter(p => p.type === tripType);
  const availableRoutes = Array.from(new Set(filteredPackages.map(p => p.routeName)));

  // Sync selectedRoute when tripType / packages change
  useEffect(() => {
    const routeList = Array.from(new Set(activePackages.filter(p => p.type === tripType).map(p => p.routeName)));
    if (routeList.length > 0) {
      if (!routeList.includes(selectedRoute)) {
        setSelectedRoute(routeList[0]);
      }
    } else {
      setSelectedRoute('');
    }
  }, [tripType, packages]);

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


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPkgId) {
      alert('Vui lòng chọn tuyến đường và gói cước.');
      return;
    }

    const selectedPkg = activePackages.find(p => p.id === Number(selectedPkgId));
    if (!selectedPkg) return;

    setSubmitting(true);

    // Calculate total price
    const unitPrice = selectedPkg.price;
    const isShared = selectedPkg.type === 'shared-seat';
    const totalPrice = isShared ? unitPrice * passengerCount : unitPrice;

    // Simulate network submission delay
    setTimeout(() => {
      const newBooking = addBooking({
        customerName,
        phone,
        routeName: selectedPkg.routeName,
        travelDate,
        pickupAddress,
        dropoffAddress,
        passengerCount,
        totalPrice,
        priceAtBooking: unitPrice,
        customerEmail,
        customerNote,
      });

      setBookingCode(newBooking.code);
      setSubmitting(false);

      // Reset form fields
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
    }, 1000);
  };

  return (
    <section id="booking-section" className="section section-soft font-sans">
      <div className="container">
        <div className="booking-layout">
          {/* Left intro */}
          <div className="animate-fade-left">
            <span className="section-label">Bắt đầu hành trình</span>
            <h2 className="booking-intro-title" style={{ marginTop: '10px' }}>
              Đặt Vé<br />Trực Tuyến
            </h2>
            <div className="booking-feature">
              <div className="booking-feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <div className="booking-feature-text">
                <strong>Xác nhận trong 5 phút</strong>
                <span>Tổng đài gọi lại ngay sau khi nhận yêu cầu</span>
              </div>
            </div>
            <div className="booking-feature">
              <div className="booking-feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className="booking-feature-text">
                <strong>Đón tận địa chỉ</strong>
                <span>Nhà xe đến tận nơi bạn cung cấp, không ra điểm tập kết</span>
              </div>
            </div>
            <div className="booking-feature">
              <div className="booking-feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <div className="booking-feature-text">
                <strong>Không cần cọc trước</strong>
                <span>Thanh toán khi lên xe, tiền mặt hoặc chuyển khoản</span>
              </div>
            </div>
            <div className="booking-feature">
              <div className="booking-feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 4v6h-6" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
              </div>
              <div className="booking-feature-text">
                <strong>Huỷ linh hoạt</strong>
                <span>Huỷ miễn phí trước 2 tiếng khởi hành</span>
              </div>
            </div>
          </div>

          {/* Right form */}
          <div className="animate-fade-right delay-100">
            {bookingCode ? (
              <div className="booking-wrapper">
                <div className="booking-success show">
                  <div className="booking-success-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', background: 'var(--success-50)', border: '1.5px solid var(--success-200)', color: 'var(--success-700)', width: '64px', height: '64px', borderRadius: '50%' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <p style={{ color: 'var(--success-700)', fontWeight: 700 }}>Đã nhận yêu cầu!</p>
                  <div className="booking-success-code">{bookingCode}</div>
                  <p className="booking-success-msg">
                    Nhân viên Bảo Châu sẽ gọi điện xác nhận lịch trình trong vòng 5 phút.<br />
                    Vui lòng để máy.
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
              <div className="booking-wrapper">
                <form onSubmit={handleSubmit}>
                  <div className="booking-grid">
                    {/* 1. LOẠI CHUYẾN (Trip Type Card Selector) */}
                    <div className="form-group booking-full">
                      <label className="booking-section-label">LOẠI CHUYẾN</label>
                      <div className="trip-type-grid">
                        <div 
                          className={`trip-type-card ${tripType === 'shared-seat' ? 'active' : ''}`}
                          onClick={() => setTripType('shared-seat')}
                        >
                          <span className="trip-type-card-title">Xe ghép</span>
                          <span className="trip-type-card-desc">Giá tốt hơn</span>
                        </div>
                        <div 
                          className={`trip-type-card ${tripType === 'private-trip' ? 'active' : ''}`}
                          onClick={() => setTripType('private-trip')}
                        >
                          <span className="trip-type-card-title">Bao xe</span>
                          <span className="trip-type-card-desc">Chỉ nhóm bạn</span>
                        </div>
                      </div>
                    </div>

                    {/* 2. TUYẾN ĐƯỜNG (Route Selector) */}
                    <div className="form-group booking-full">
                      <label className="booking-section-label">TUYẾN ĐƯỜNG</label>
                      <select 
                        className="form-select" 
                        value={selectedRoute}
                        onChange={(e) => setSelectedRoute(e.target.value)}
                        required
                      >
                        <option value="">-- Chọn tuyến đường --</option>
                        {availableRoutes.map(route => (
                          <option key={route} value={route}>
                            {route}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 3. GÓI XE (Vehicle Package Cards) */}
                    {selectedRoute && packagesForRouteAndType.length > 0 && (
                      <div className="form-group booking-full">
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
                                onClick={() => setSelectedPkgId(String(pkg.id))}
                              >
                                <span className="pkg-selector-left">{pkg.vehicleName}</span>
                                <span className="pkg-selector-center">{seats} chỗ</span>
                                <span className="pkg-selector-right">{priceText}/{unitText}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 4. SUMMARY CARD */}
                    {selectedRoute && selectedPkgId && (
                      (() => {
                        const selectedPkg = packagesForRouteAndType.find(p => String(p.id) === selectedPkgId);
                        if (!selectedPkg) return null;
                        const priceText = formatMoney(selectedPkg.price);
                        const unitText = selectedPkg.type === 'shared-seat' ? 'người' : 'chuyến';
                        return (
                          <div className="booking-full animate-scale-in">
                            <div className="booking-summary-card">
                              <div className="booking-summary-info">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--teal-600)' }}>
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                {selectedPkg.vehicleName} · {selectedPkg.routeName}
                              </div>
                              <div className="booking-summary-price">
                                {priceText}/{unitText}
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    )}

                    {/* 5. Họ và tên */}
                    <div className="form-group">
                      <label className="booking-section-label" style={{ color: 'var(--primary-900)' }}>
                        HỌ VÀ TÊN <span className="req">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="form-input" 
                        placeholder="Nguyễn Văn A" 
                        required 
                      />
                    </div>

                    {/* 6. Số điện thoại */}
                    <div className="form-group">
                      <label className="booking-section-label" style={{ color: 'var(--primary-900)' }}>
                        SỐ ĐIỆN THOẠI <span className="req">*</span>
                      </label>
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="form-input" 
                        placeholder="09x xxx xxxx" 
                        pattern="[0-9]{10}" 
                        required 
                      />
                    </div>

                    {/* 7. Địa chỉ đón */}
                    <div className="form-group">
                      <label className="booking-section-label" style={{ color: 'var(--primary-900)' }}>
                        ĐỊA CHỈ ĐÓN <span className="req">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={pickupAddress}
                        onChange={(e) => setPickupAddress(e.target.value)}
                        className="form-input" 
                        placeholder="Số nhà, tên đường, phường..." 
                        required 
                      />
                    </div>

                    {/* 8. Địa chỉ trả */}
                    <div className="form-group">
                      <label className="booking-section-label" style={{ color: 'var(--primary-900)' }}>
                        ĐỊA CHỈ TRẢ <span className="req">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={dropoffAddress}
                        onChange={(e) => setDropoffAddress(e.target.value)}
                        className="form-input" 
                        placeholder="Số nhà, tên đường, phường..." 
                        required 
                      />
                    </div>

                    {/* 9. Ngày đi */}
                    <div className="form-group">
                      <label className="booking-section-label" style={{ color: 'var(--primary-900)' }}>
                        NGÀY ĐI <span className="req">*</span>
                      </label>
                      <input
                        type="date"
                        value={travelDate}
                        onChange={(e) => setTravelDate(e.target.value)}
                        className="form-input"
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>

                    {/* 10. Giờ đi (dự kiến) */}
                    <div className="form-group">
                      <label className="booking-section-label" style={{ color: 'var(--primary-900)' }}>
                        GIỜ ĐI (DỰ KIẾN)
                      </label>
                      <input 
                        type="time" 
                        value={travelTime}
                        onChange={(e) => setTravelTime(e.target.value)}
                        className="form-input" 
                      />
                    </div>

                    {/* 11. Số hành khách */}
                    <div className="form-group">
                      <label className="booking-section-label" style={{ color: 'var(--primary-900)' }}>
                        SỐ HÀNH KHÁCH <span className="req">*</span>
                      </label>
                      <input 
                        type="number" 
                        value={passengerCount}
                        onChange={(e) => setPassengerCount(Number(e.target.value))}
                        className="form-input" 
                        min="1" 
                        max="16" 
                        required 
                      />
                    </div>

                    {/* 12. Email */}
                    <div className="form-group">
                      <label className="booking-section-label" style={{ color: 'var(--primary-900)' }}>
                        EMAIL (NHẬN XÁC NHẬN)
                      </label>
                      <input 
                        type="email" 
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="form-input" 
                        placeholder="email@gmail.com" 
                      />
                    </div>

                    {/* 13. Ghi chú thêm */}
                    <div className="form-group booking-full">
                      <label className="booking-section-label" style={{ color: 'var(--primary-900)' }}>
                        GHI CHÚ THÊM
                      </label>
                      <textarea
                        value={customerNote}
                        onChange={(e) => setCustomerNote(e.target.value)}
                        className="form-textarea"
                        placeholder="Ví dụ: có trẻ em, mang nhiều hành lý, cần xe sớm 5:30..."
                      />
                    </div>


                    <div className="booking-full" style={{ marginTop: '4px' }}>
                      <button
                        type="submit"
                        className="btn btn-accent btn-lg btn-block"
                        disabled={submitting}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        {submitting ? (
                          <>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" style={{ marginRight: '6px' }}>
                              <line x1="12" y1="2" x2="12" y2="6" />
                              <line x1="12" y1="18" x2="12" y2="22" />
                              <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                              <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                              <line x1="2" y1="12" x2="6" y2="12" />
                              <line x1="18" y1="12" x2="22" y2="12" />
                              <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                              <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
                            </svg>
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                              <line x1="13" y1="5" x2="13" y2="7" />
                              <line x1="13" y1="17" x2="13" y2="19" />
                              <line x1="13" y1="11" x2="13" y2="13" />
                            </svg>
                            Gửi yêu cầu đặt vé
                          </>
                        )}
                      </button>
                      <p style={{ textAlign:'center', marginTop:'12px', fontSize:'13px', color:'var(--text-muted)' }}>
                        Không cần cọc · Nhân viên gọi xác nhận trong 5 phút
                      </p>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
