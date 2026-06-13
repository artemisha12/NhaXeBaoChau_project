'use client';

import { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';

const FAQ_ITEMS = [
  {
    q: 'Làm thế nào để đặt vé xe Bảo Châu?',
    a: 'Bạn có thể đặt vé trực tiếp trên website bằng cách điền form đặt vé. Sau khi gửi yêu cầu, nhân viên sẽ gọi xác nhận trong vòng 5 phút. Ngoài ra bạn có thể gọi hotline hoặc nhắn Zalo để được hỗ trợ ngay.',
  },
  {
    q: 'Xe đón tận nhà không, hay phải ra điểm tập kết?',
    a: 'Bảo Châu đón và trả khách tận địa chỉ bạn cung cấp — không cần ra điểm tập kết. Chỉ cần cung cấp địa chỉ cụ thể khi đặt vé, tài xế sẽ đến đúng nơi.',
  },
  {
    q: 'Giá vé xe ghép và bao xe khác nhau như thế nào?',
    a: 'Xe ghép: bạn chia sẻ xe với hành khách khác cùng chiều, giá tính theo đầu người (tiết kiệm hơn). Bao xe: bạn thuê nguyên chiếc xe cho nhóm, giá tính theo chuyến — phù hợp gia đình hoặc nhóm đông người.',
  },
  {
    q: 'Phải đặt cọc trước không?',
    a: 'Không cần đặt cọc trước. Bạn chỉ thanh toán khi lên xe, bằng tiền mặt hoặc chuyển khoản. Hoàn toàn không phát sinh phí ẩn hay phụ thu.',
  },
  {
    q: 'Nếu huỷ chuyến thì có mất phí không?',
    a: 'Bạn được huỷ miễn phí trước 2 tiếng khởi hành. Sau thời gian này, tùy trường hợp có thể áp dụng phí huỷ nhỏ. Liên hệ hotline để được hỗ trợ cụ thể.',
  },
  {
    q: 'Nếu bay trễ, tài xế có chờ không?',
    a: 'Đối với chặng sân bay, tài xế theo dõi lịch bay thực tế và sẽ chờ dù bay delay (tối đa 2 tiếng). Ngoài thời gian đó, vui lòng liên hệ để sắp xếp lịch mới.',
  },
  {
    q: 'Xe Bảo Châu có an toàn không?',
    a: 'Tất cả xe đều được bảo dưỡng định kỳ, đăng kiểm đầy đủ và có bảo hiểm chuyến đi. Tài xế được chọn lọc kỹ, có kinh nghiệm và lái xe điềm đạm, an toàn.',
  },
  {
    q: 'Tôi mang nhiều hành lý có được không?',
    a: 'Hoàn toàn được! Bạn có thể ghi chú về hành lý khi đặt vé để nhà xe sắp xếp phù hợp. Với nhóm đông hoặc nhiều đồ, chúng tôi sẽ tư vấn loại xe phù hợp nhất.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const { siteSettings } = useAdmin();
  const hotline   = (siteSettings?.hotline   || '0905123456').replace(/\s+/g, '');
  const zaloPhone = (siteSettings?.zaloPhone || '0905123456').replace(/\s+/g, '');

  return (
    <section className="section faq-section" id="faq">
      <div className="container">
        <div className="section-header animate-fade-up">
          <span className="section-label">Câu hỏi thường gặp</span>
          <h2 className="section-title">Giải đáp thắc mắc</h2>
          <p className="section-subtitle">
            Những câu hỏi phổ biến nhất từ khách hàng. Không tìm thấy câu trả lời?
            Gọi hotline để được hỗ trợ ngay.
          </p>
        </div>

        <div className="faq-list animate-fade-up delay-100">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className={`faq-item${open === i ? ' open' : ''}`}>
              <button
                className="faq-question"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span>{item.q}</span>
                <span className="faq-icon">{open === i ? '−' : '+'}</span>
              </button>
              {open === i && (
                <div className="faq-answer">{item.a}</div>
              )}
            </div>
          ))}
        </div>

        {/* CTA dưới FAQ */}
        <div style={{ textAlign: 'center', marginTop: '44px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '16px' }}>
            Vẫn còn thắc mắc? Liên hệ trực tiếp với chúng tôi
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={`tel:${hotline}`}
              className="btn btn-accent btn-lg"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.7 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Gọi Hotline
            </a>
            <a
              href={`https://zalo.me/${zaloPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-lg"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Nhắn Zalo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
