import React from 'react';

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

export default function WhyUs() {
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
      </div>
    </section>
  );
}
