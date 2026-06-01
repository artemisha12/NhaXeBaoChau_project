'use client';
import { useState } from 'react';

export default function BookingForm() {
  const [submitting, setSubmitting] = useState(false);
  const [bookingCode, setBookingCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const seq = String(Math.floor(Math.random() * 900) + 100);
      setBookingCode(`BC-${today}-${seq}`);
      setSubmitting(false);
    }, 900);
  };

  return (
    <section id="booking-section" className="section section-soft">
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
                    <div className="form-group">
                      <label className="form-label">Họ và tên <span className="req">*</span></label>
                      <input type="text" className="form-input" placeholder="Nguyễn Văn A" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Số điện thoại <span className="req">*</span></label>
                      <input type="tel" className="form-input" placeholder="09x xxx xxxx" pattern="[0-9]{10}" required />
                    </div>

                    <div className="form-group booking-full">
                      <label className="form-label">Chọn tuyến &amp; gói <span className="req">*</span></label>
                      <select className="form-select" required>
                        <option value="">-- Chọn tuyến đường --</option>
                        <optgroup label="Xe ghép theo chỗ">
                          <option>Huế → Đà Nẵng (Xe ghép · 200.000đ/người)</option>
                          <option>Đà Nẵng → Huế (Xe ghép · 200.000đ/người)</option>
                          <option>Đà Nẵng → Hội An (Xe ghép · 150.000đ/người)</option>
                          <option>Huế → Hội An (Xe ghép · 300.000đ/người)</option>
                          <option>Sân bay Phú Bài → Đà Nẵng (250.000đ/người)</option>
                        </optgroup>
                        <optgroup label="Bao chuyến nguyên xe">
                          <option>Huế → Đà Nẵng (Bao 7 chỗ · 1.200.000đ)</option>
                          <option>Huế → Đà Nẵng (Bao 16 chỗ · 2.000.000đ)</option>
                          <option>Huế → Hội An (Bao 7 chỗ · 1.800.000đ)</option>
                          <option>Đà Nẵng → Hội An (Bao 7 chỗ · 800.000đ)</option>
                        </optgroup>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Địa chỉ đón <span className="req">*</span></label>
                      <input type="text" className="form-input" placeholder="Số nhà, tên đường, phường..." required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Địa chỉ trả <span className="req">*</span></label>
                      <input type="text" className="form-input" placeholder="Số nhà, tên đường, phường..." required />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Ngày đi <span className="req">*</span></label>
                      <input
                        type="date"
                        className="form-input"
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Giờ đi (dự kiến)</label>
                      <input type="time" className="form-input" />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Số hành khách <span className="req">*</span></label>
                      <input type="number" className="form-input" min="1" max="16" defaultValue="1" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email (nhận xác nhận)</label>
                      <input type="email" className="form-input" placeholder="email@gmail.com" />
                    </div>

                    <div className="form-group booking-full">
                      <label className="form-label">Ghi chú thêm</label>
                      <textarea
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
