'use client';
import { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';

const PRICES = [
  // shared (Đi ghép)
  {
    id: 's-hue-danang-limo',
    type: 'shared',
    category: 'limousine',
    route: 'Huế ⇄ Đà Nẵng',
    vehicleName: 'Xe Limousine VIP',
    vehicleSub: 'Limousine (9 chỗ)',
    info: '100 km • ~2 giờ 30 phút',
    price: 200000,
    unit: '/ghế',
  },
  {
    id: 's-hue-hoian-limo',
    type: 'shared',
    category: 'limousine',
    route: 'Huế ⇄ Hội An',
    vehicleName: 'Xe Limousine VIP',
    vehicleSub: 'Limousine (9 chỗ)',
    info: '130 km • ~3 giờ',
    price: 250000,
    unit: '/ghế',
  },
  {
    id: 's-danang-hoian-sedan',
    type: 'shared',
    category: 'sedan',
    route: 'Đà Nẵng ⇄ Hội An',
    vehicleName: 'Xe Sedan Tiêu chuẩn',
    vehicleSub: 'Sedan (4 chỗ)',
    info: '30 km • ~45 phút',
    price: 150000,
    unit: '/ghế',
  },
  {
    id: 's-hue-airport-sedan',
    type: 'shared',
    category: 'sedan',
    route: 'Sân bay Phú Bài ⇄ Đà Nẵng',
    vehicleName: 'Xe Sedan Tiêu chuẩn',
    vehicleSub: 'Sedan (4 chỗ)',
    info: '90 km • ~1 giờ 45 phút',
    price: 250000,
    unit: '/ghế',
  },

  // charter (Bao xe)
  {
    id: 'c-hue-danang-sedan',
    type: 'charter',
    category: 'sedan',
    route: 'Huế ⇄ Đà Nẵng',
    vehicleName: 'Bao xe Sedan 4 chỗ',
    vehicleSub: 'Toyota Camry / VF7',
    info: '100 km • ~2 giờ',
    price: 800000,
    unit: '/chuyến',
  },
  {
    id: 'c-hue-danang-carnival',
    type: 'charter',
    category: 'carnival',
    route: 'Huế ⇄ Đà Nẵng',
    vehicleName: 'Bao xe MPV 7 chỗ',
    vehicleSub: 'Kia Carnival Royal',
    info: '100 km • ~2 giờ',
    price: 1200000,
    unit: '/chuyến',
  },
  {
    id: 'c-hue-danang-transit',
    type: 'charter',
    category: 'transit',
    route: 'Huế ⇄ Đà Nẵng',
    vehicleName: 'Bao xe Minibus 16 chỗ',
    vehicleSub: 'Ford Transit',
    info: '100 km • ~2 giờ',
    price: 2000000,
    unit: '/chuyến',
  },
  {
    id: 'c-hue-hoian-sedan',
    type: 'charter',
    category: 'sedan',
    route: 'Huế ⇄ Hội An',
    vehicleName: 'Bao xe Sedan 4 chỗ',
    vehicleSub: 'Toyota Camry / VF7',
    info: '130 km • ~3 giờ',
    price: 1300000,
    unit: '/chuyến',
  },
  {
    id: 'c-hue-hoian-carnival',
    type: 'charter',
    category: 'carnival',
    route: 'Huế ⇄ Hội An',
    vehicleName: 'Bao xe MPV 7 chỗ',
    vehicleSub: 'Kia Carnival Royal',
    info: '130 km • ~3 giờ',
    price: 1800000,
    unit: '/chuyến',
  },
  {
    id: 'c-danang-hoian-sedan',
    type: 'charter',
    category: 'sedan',
    route: 'Đà Nẵng ⇄ Hội An',
    vehicleName: 'Bao xe Sedan 4 chỗ',
    vehicleSub: 'Toyota Camry / VF7',
    info: '30 km • ~45 phút',
    price: 400000,
    unit: '/chuyến',
  },
  {
    id: 'c-danang-hoian-carnival',
    type: 'charter',
    category: 'carnival',
    route: 'Đà Nẵng ⇄ Hội An',
    vehicleName: 'Bao xe MPV 7 chỗ',
    vehicleSub: 'Kia Carnival Royal',
    info: '30 km • ~45 phút',
    price: 600000,
    unit: '/chuyến',
  },
];

const sharedFilters = [
  { value: 'all', label: 'Tất cả dòng xe' },
  { value: 'sedan', label: 'Xe 4 chỗ (Sedan)' },
  { value: 'limousine', label: 'Limousine 9 chỗ' },
];

const charterFilters = [
  { value: 'all', label: 'Tất cả dòng xe' },
  { value: 'sedan', label: 'Xe 4 chỗ (Sedan)' },
  { value: 'carnival', label: 'Limousine 7 chỗ' },
  { value: 'transit', label: 'Minibus 16 chỗ' },
];

function formatMoney(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
}

export default function PriceList() {
  const { packages } = useAdmin();
  const [tab, setTab] = useState<'shared' | 'charter'>('shared');
  const [carFilter, setCarFilter] = useState<string>('all');

  const activePackages = packages.filter(pkg => pkg.status === 'active');
  const dynamicPrices = activePackages.map(pkg => {
    const isShared = pkg.type === 'shared-seat';
    let category = 'sedan';
    let vehicleSub = '';
    const vName = pkg.vehicleName.toLowerCase();
    
    if (vName.includes('limousine') || vName.includes('9 chỗ') || vName.includes('vip')) {
      category = 'limousine';
      vehicleSub = 'Limousine (9 chỗ)';
    } else if (vName.includes('carnival') || vName.includes('7 chỗ')) {
      category = 'carnival';
      vehicleSub = 'Limousine (7 chỗ)';
    } else if (vName.includes('transit') || vName.includes('16 chỗ') || vName.includes('minivan')) {
      category = 'transit';
      vehicleSub = 'Minibus (16 chỗ)';
    } else {
      category = 'sedan';
      vehicleSub = 'Sedan (4 chỗ)';
    }

    return {
      id: `pkg-${pkg.id}`,
      type: isShared ? 'shared' : 'charter',
      category,
      route: pkg.routeName.replace('→', '⇄'),
      vehicleName: pkg.vehicleName,
      vehicleSub,
      info: pkg.description || 'Xe đời mới • Đón trả tận nơi',
      price: pkg.price,
      unit: isShared ? '/ghế' : '/chuyến',
    };
  });

  const displayPrices = dynamicPrices.length > 0 ? dynamicPrices : PRICES;

  const handleTabChange = (newTab: 'shared' | 'charter') => {
    setTab(newTab);
    setCarFilter('all');
  };

  useEffect(() => {
    const handleSelectTab = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab: 'shared' | 'charter' }>;
      if (customEvent.detail && customEvent.detail.tab) {
        setTab(customEvent.detail.tab);
        setCarFilter('all');
      }
    };
    window.addEventListener('select-price-tab', handleSelectTab);
    return () => {
      window.removeEventListener('select-price-tab', handleSelectTab);
    };
  }, []);

  const filteredPrices = displayPrices.filter(
    (p) => p.type === tab && (carFilter === 'all' || p.category === carFilter)
  );

  const currentFilters = tab === 'shared' ? sharedFilters : charterFilters;

  return (
    <section id="prices" className="section section-blue-soft">
      <div className="container">
        <div className="section-header animate-fade-up">
          <span className="section-label">Bảng giá dịch vụ</span>
          <h2 className="section-title">Chi phí minh bạch — Không phụ thu ẩn</h2>
          <p className="section-subtitle">
            Giá cố định, không tăng giờ cao điểm. Chọn gói phù hợp với nhu cầu và ngân sách của bạn.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="price-tabs-container animate-fade-up delay-100">
          <div className="price-tabs-toggle">
            <button
              className={`price-tab-btn${tab === 'shared' ? ' active' : ''}`}
              onClick={() => handleTabChange('shared')}
            >
              Đi ghép
            </button>
            <button
              className={`price-tab-btn${tab === 'charter' ? ' active' : ''}`}
              onClick={() => handleTabChange('charter')}
            >
              Bao xe (Riêng tư)
            </button>
          </div>
        </div>

        {/* Sub Filters */}
        <div className="price-filters-container animate-fade-up delay-150">
          {currentFilters.map((f) => (
            <button
              key={f.value}
              className={`price-filter-btn${carFilter === f.value ? ' active' : ''}`}
              onClick={() => setCarFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="price-table-wrap price-table-desktop animate-fade-up delay-200">
          <table className="price-table">
            <thead>
              <tr>
                <th>Tuyến đường</th>
                <th>Loại xe</th>
                <th>Thông tin chặng</th>
                <th>Giá dịch vụ</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrices.map((item) => (
                <tr key={item.id}>
                  <td className="col-route">
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: "var(--accent-600)" }}>
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {item.route}
                    </span>
                  </td>
                  <td className="col-car">
                    {item.vehicleName}
                    <span className="col-car-sub">{item.vehicleSub}</span>
                  </td>
                  <td className="col-info">{item.info}</td>
                  <td className="col-price">
                    {formatMoney(item.price)}
                    <span className="col-price-unit">{item.unit}</span>
                  </td>
                  <td>
                    <button
                      className="price-book-btn"
                      onClick={() =>
                        document
                          .getElementById('booking-section')
                          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                    >
                      Đặt xe ngay
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPrices.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                    Không tìm thấy thông tin tuyến đường phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile List View */}
        <div className="price-list-mobile price-table-mobile animate-fade-up delay-200">
          {filteredPrices.map((item) => (
            <div key={item.id} className="price-mobile-card">
              <div className="price-mob-row-top">
                <span className="price-mob-route" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: "var(--accent-600)" }}>
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {item.route}
                </span>
                <span className="price-mob-val">
                  {formatMoney(item.price)}
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500, marginLeft: '2px' }}>
                    {item.unit}
                  </span>
                </span>
              </div>
              <div className="price-mob-row-mid">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span className="price-mob-car">{item.vehicleName}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{item.vehicleSub}</span>
                </div>
                <span className="price-mob-info">{item.info}</span>
              </div>
              <button
                className="price-mob-btn"
                onClick={() =>
                  document
                    .getElementById('booking-section')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              >
                Đặt xe ngay
              </button>
            </div>
          ))}
          {filteredPrices.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
              Không tìm thấy thông tin tuyến đường phù hợp.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
