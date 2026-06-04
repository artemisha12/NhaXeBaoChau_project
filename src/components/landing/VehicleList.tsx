'use client';

import { useAdmin } from '@/context/AdminContext';

export default function VehicleList() {
  const { vehicles, packages } = useAdmin();

  const activeVehicles = vehicles.filter(v => v.status === 'active');

  function handleBook(vehicleName: string) {
    // Tìm loại gói của xe này để chọn đúng tab
    const vehiclePkgs = packages.filter(p => p.vehicleName === vehicleName && p.status === 'active');
    const hasShared = vehiclePkgs.some(p => p.type === 'shared-seat');
    const tab = hasShared ? 'shared' : 'charter';
    window.dispatchEvent(new CustomEvent('select-price-tab', { detail: { tab } }));
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
          {activeVehicles.map((v, i) => (
            <article key={v.id} className={`fleet-luxury-card animate-fade-up delay-${(i + 1) * 100}`}>
              <div className="fleet-img-wrap">
                {v.imageUrl ? (
                  <img src={v.imageUrl} alt={v.name} className="fleet-car-img" />
                ) : (
                  <div className="fleet-car-img" style={{ background: '#1a2e40', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4a6580" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                      <circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="fleet-card-body">
                <span className="fleet-car-type">{v.type} · {v.seats} CHỖ</span>
                <h3 className="fleet-car-name">{v.name}</h3>
                <p className="fleet-car-info">{v.description || `${v.seats} chỗ · Xe đời mới · Đón tận nơi`}</p>
              </div>
              <button className="fleet-book-btn" onClick={() => handleBook(v.name)}>Đặt xe ngay</button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
