const MIXED_TESTIMONIALS = [
  { name: 'Nguyễn Thanh Hà', location: 'Huế', flag: '🇻🇳', text: 'Đặt xe buổi tối, 15 phút sau có xác nhận. Sáng hôm sau tài xế đến đúng giờ, xe sạch sẽ. Đi từ Huế vào Đà Nẵng rất thoải mái, sẽ dùng lại!' },
  { name: 'Sarah Jenkins', location: 'USA', flag: '🇺🇸', text: 'Excellent service! The car was clean and extremely comfortable. The driver helped with my heavy bags and was very punctual. Highly recommended!' },
  { name: '佐藤 健太', location: 'Japan', flag: '🇯🇵', text: 'フエからダナンまで利用しました。時間通りに迎えに来てくれて、運転も非常に丁寧でした。車内も清潔で快適でした。' },
  { name: '김민지', location: 'Korea', flag: '🇰🇷', text: '다낭에서 호이안 갈 때 이용했는데 완전 대만족입니다! 차도 깨끗하고 기사님도 친절하셨어요. 또 이용할 예정!' },
  { name: 'Trần Minh Khoa', location: 'Đà Nẵng', flag: '🇻🇳', text: 'Đã dùng dịch vụ 4 lần, lần nào cũng đúng giờ. Giá đúng như báo, không phụ thu gì cả. Rất uy tín!' },
  { name: 'David Miller', location: 'Australia', flag: '🇦🇺', text: 'Very reliable intercity car service. No stress, straight door-to-door drop off. Much better than taking the public bus.' },
  { name: 'Lê Thị Bích Ngọc', location: 'Hội An', flag: '🇻🇳', text: 'Ra sân bay Đà Nẵng lúc 5 giờ sáng, tài xế vẫn đến đúng giờ và còn sớm hơn 5 phút. Rất chu đáo và chuyên nghiệp!' },
  { name: 'Elena Rostova', location: 'Russia', flag: '🇷🇺', text: 'Friendly booking staff, fast reply. The private car was clean and spacious. Great value for money. I will use Bao Chau again.' },
  { name: 'Phạm Hoàng Nam', location: 'Đà Nẵng', flag: '🇻🇳', text: 'Xe đi cực êm, tài xế nói chuyện lịch sự, chạy xe điềm đạm không phóng nhanh. Rất hài lòng và an tâm.' },
  { name: '中村 拓海', location: 'Japan', flag: '🇯🇵', text: '急な予定変更にも親切に対応していただき、本当に助かりました。またベトナムに来た際は必ず利用します。' },
  { name: 'Hoàng Thu Thảo', location: 'Huế', flag: '🇻🇳', text: 'Nhà xe phục vụ rất chuyên nghiệp. Tôi đi thường xuyên chặng Huế – Đà Nẵng và luôn chọn Bảo Châu. Rất an tâm.' },
  { name: '박준우', location: 'Korea', flag: '🇰🇷', text: '차량이 정말 편안하고 깨끗했습니다. 기사님도 안전하게 운전해주셔서 매우 만족스러운 여행이었습니다.' },
  { name: 'Vũ Quang Minh', location: 'Hà Nội', flag: '🇻🇳', text: 'Vào Đà Nẵng du lịch, book xe Bảo Châu đi Hội An. Đúng giờ, tài xế thân thiện, xe mới. Sẽ giới thiệu cho bạn bè.' },
  { name: 'Nathalie Dupont', location: 'France', flag: '🇫🇷', text: 'Service parfait! Le chauffeur était ponctuel, la voiture très propre. Trajet Hue-Hoi An très agréable. Je recommande!' },
];

export default function Testimonials() {
  const row1 = MIXED_TESTIMONIALS.slice(0, 7);
  const row2 = MIXED_TESTIMONIALS.slice(7, 14);

  return (
    <section className="section testimonials-section" id="testimonials">
      <div className="container">
        <div className="section-header animate-fade-up" style={{ marginBottom: 48 }}>
          <span className="section-label">Khách hàng nói gì</span>
          <h2 className="section-title">Hàng nghìn khách hàng tin tưởng</h2>
          <p className="section-subtitle">
            Từ du khách trong nước đến quốc tế, mọi người đều hài lòng với chất lượng dịch vụ của Bảo Châu.
          </p>
        </div>
      </div>

      <div className="testimonials-marquee-container">
        {/* Row 1 — cuộn trái */}
        <div className="marquee-wrapper">
          <div className="marquee-content marquee-left">
            <div className="marquee-track">
              {row1.map((r, i) => (
                <div key={i} className="testimonial-card">
                  <p className="testimonial-text">"{r.text}"</p>
                  <div className="testimonial-author">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>{r.flag}</span>
                      <span className="testimonial-name">{r.name}</span>
                    </div>
                    <span className="testimonial-location">{r.location}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Duplicate for seamless loop */}
            <div className="marquee-track" aria-hidden="true">
              {row1.map((r, i) => (
                <div key={`dup1-${i}`} className="testimonial-card">
                  <p className="testimonial-text">"{r.text}"</p>
                  <div className="testimonial-author">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>{r.flag}</span>
                      <span className="testimonial-name">{r.name}</span>
                    </div>
                    <span className="testimonial-location">{r.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2 — cuộn phải */}
        <div className="marquee-wrapper" style={{ marginTop: '20px' }}>
          <div className="marquee-content marquee-right">
            <div className="marquee-track">
              {row2.map((r, i) => (
                <div key={i} className="testimonial-card">
                  <p className="testimonial-text">"{r.text}"</p>
                  <div className="testimonial-author">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>{r.flag}</span>
                      <span className="testimonial-name">{r.name}</span>
                    </div>
                    <span className="testimonial-location">{r.location}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="marquee-track" aria-hidden="true">
              {row2.map((r, i) => (
                <div key={`dup2-${i}`} className="testimonial-card">
                  <p className="testimonial-text">"{r.text}"</p>
                  <div className="testimonial-author">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>{r.flag}</span>
                      <span className="testimonial-name">{r.name}</span>
                    </div>
                    <span className="testimonial-location">{r.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
