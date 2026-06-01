'use client';

const FLEET_VEHICLES = [
  {
    id: 'vinfast-vf7',
    type: 'SUV ĐIỆN LUXURY · 5 CHỖ',
    name: 'VinFast VF7 Limousine',
    image: '/images/fleet/vf7.png',
    info: '5 chỗ · Xe đời mới · Đón tận nơi',
    targetTab: 'shared' as const,
  },
  {
    id: 'kia-carnival',
    type: 'MPV HẠNG SANG · 7 CHỖ',
    name: 'Kia Carnival Royal',
    image: '/images/fleet/carnival.png',
    info: '7 chỗ · Xe đời mới · Đón tận nơi',
    targetTab: 'shared' as const,
  },
  {
    id: 'ford-transit',
    type: 'MINIBUS CAO CẤP · 16 CHỖ',
    name: 'Ford Transit 2024',
    image: '/images/fleet/transit.png',
    info: '16 chỗ · Xe đời mới · Đón tận nơi',
    targetTab: 'charter' as const,
  },
];

export default function VehicleList() {
  function handleBook(targetTab: 'shared' | 'charter') {
    // 1. Chọn tab tương ứng trên bảng giá
    window.dispatchEvent(new CustomEvent('select-price-tab', { detail: { tab: targetTab } }));
    
    // 2. Cuộn xuống bảng giá
    document.getElementById('prices')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <section id="vehicles" className="section vl-section">
      <div className="container">
        <div className="section-header animate-fade-up">
          <span className="section-label">Đội xe đẳng cấp</span>
          <h2 className="section-title">Dàn xe Bảo Châu</h2>
          <p className="section-subtitle">
            Trải nghiệm di chuyển rộng rãi, tiện nghi, riêng tư trên những dòng xe đời mới nhất —
            được bảo dưỡng định kỳ, luôn sạch sẽ và sẵn sàng.
          </p>
        </div>

        <div className="fleet-luxury-grid">
          {FLEET_VEHICLES.map((v, i) => (
            <article key={v.id} className={`fleet-luxury-card animate-fade-up delay-${(i + 1) * 100}`}>
              <div className="fleet-img-wrap">
                <img src={v.image} alt={v.name} className="fleet-car-img" />
              </div>
              <div className="fleet-card-body">
                <span className="fleet-car-type">{v.type}</span>
                <h3 className="fleet-car-name">{v.name}</h3>
                <p className="fleet-car-info">{v.info}</p>
              </div>
              <button className="fleet-book-btn" onClick={() => handleBook(v.targetTab)}>Đặt xe ngay</button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
