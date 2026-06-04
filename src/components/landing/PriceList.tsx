'use client';
import { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';

function formatMoney(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
}

function getVehicleCategory(vehicleName: string, description: string) {
  const text = (vehicleName + ' ' + (description || '')).toLowerCase();
  if (text.includes('16 chỗ') || text.includes('transit') || text.includes('minibus')) return 'transit';
  if (text.includes('9 chỗ') || text.includes('limousine') || text.includes('vip')) return 'limousine';
  if (text.includes('7 chỗ') || text.includes('carnival') || text.includes('7 cho')) return 'carnival';
  if (text.includes('4 chỗ') || text.includes('4 cho')) return 'sedan';
  return 'other';
}

function getCategoryLabel(cat: string) {
  const map: Record<string, string> = {
    sedan: 'Xe 4 chỗ (Sedan)',
    limousine: 'Limousine 9 chỗ',
    carnival: 'SUV / MPV 7 chỗ',
    transit: 'Minibus 16 chỗ',
    other: 'Xe khác',
  };
  return map[cat] || cat;
}

export default function PriceList() {
  const { packages, vehicles } = useAdmin();
  const [tab, setTab] = useState<'shared' | 'charter'>('shared');
  const [routeFilter, setRouteFilter] = useState('all');
  const [carFilter, setCarFilter] = useState('all');

  // Chỉ lấy packages của xe đang active
  const activeVehicleNames = new Set(
    vehicles.filter(v => v.status === 'active').map(v => v.name)
  );
  const activePackages = packages.filter(
    p => p.status === 'active' && activeVehicleNames.has(p.vehicleName)
  );

  // Map sang display items từ DB
  const allItems = activePackages.map(pkg => {
    const isShared = pkg.type === 'shared-seat';
    const cat = getVehicleCategory(pkg.vehicleName, pkg.description || '');
    return {
      id: `pkg-${pkg.id}`,
      rawId: pkg.id,
      routeName: pkg.routeName,
      route: pkg.routeName.replace('→', '⇄'),
      type: isShared ? 'shared' : 'charter',
      category: cat,
      vehicleName: pkg.vehicleName,
      vehicleSub: getCategoryLabel(cat),
      info: pkg.description || 'Xe đời mới • Đón trả tận nơi',
      price: pkg.price,
      unit: isShared ? '/ghế' : '/chuyến',
    };
  });

  // Routes động theo tab
  const tabItems = allItems.filter(i => i.type === tab);
  const availableRoutes = Array.from(new Set(tabItems.map(i => i.routeName)));

  // Tên xe thật đang hiện trong DB, theo tab + route
  const routeItems = tabItems.filter(i => routeFilter === 'all' || i.routeName === routeFilter);
  const availableVehicles = Array.from(new Set(routeItems.map(i => i.vehicleName)));

  // Kết quả lọc cuối cùng — filter theo vehicleName thay vì category
  const filteredItems = routeItems.filter(i => carFilter === 'all' || i.vehicleName === carFilter);

  const handleTabChange = (newTab: 'shared' | 'charter') => {
    setTab(newTab);
    setRouteFilter('all');
    setCarFilter('all');
  };

  const handleRouteChange = (r: string) => {
    setRouteFilter(r);
    setCarFilter('all');
  };

  useEffect(() => {
    const handleSelectTab = (e: Event) => {
      const ce = e as CustomEvent<{ tab: 'shared' | 'charter' }>;
      if (ce.detail?.tab) {
        setTab(ce.detail.tab);
        setRouteFilter('all');
        setCarFilter('all');
      }
    };
    window.addEventListener('select-price-tab', handleSelectTab);
    return () => window.removeEventListener('select-price-tab', handleSelectTab);
  }, []);

  const handleBookNow = (item: typeof filteredItems[0]) => {
    window.dispatchEvent(new CustomEvent('select-booking-pkg', {
      detail: {
        pkgId: String(item.rawId),
        tripType: item.type === 'shared' ? 'shared-seat' : 'private-trip',
        routeName: item.routeName,
      },
    }));
    document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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

        {/* Tab: Đi ghép / Bao xe */}
        <div className="price-tabs-container animate-fade-up delay-100">
          <div className="price-tabs-toggle">
            <button className={`price-tab-btn${tab === 'shared' ? ' active' : ''}`} onClick={() => handleTabChange('shared')}>
              Đi ghép
            </button>
            <button className={`price-tab-btn${tab === 'charter' ? ' active' : ''}`} onClick={() => handleTabChange('charter')}>
              Bao xe (Riêng tư)
            </button>
          </div>
        </div>

        {/* Lọc theo tuyến đường — động từ DB */}
        <div className="price-filters-container animate-fade-up delay-120">
          <button
            className={`price-filter-btn${routeFilter === 'all' ? ' active' : ''}`}
            onClick={() => handleRouteChange('all')}
          >
            Tất cả tuyến
          </button>
          {availableRoutes.map(r => (
            <button
              key={r}
              className={`price-filter-btn${routeFilter === r ? ' active' : ''}`}
              onClick={() => handleRouteChange(r)}
            >
              {r.replace('→', '⇄')}
            </button>
          ))}
        </div>

        {/* Lọc theo tên xe thật từ DB — chỉ hiện nếu có > 1 xe */}
        {availableVehicles.length > 1 && (
          <div className="price-filters-container animate-fade-up delay-150">
            <button
              className={`price-filter-btn${carFilter === 'all' ? ' active' : ''}`}
              onClick={() => setCarFilter('all')}
            >
              Tất cả dòng xe
            </button>
            {availableVehicles.map(name => (
              <button
                key={name}
                className={`price-filter-btn${carFilter === name ? ' active' : ''}`}
                onClick={() => setCarFilter(name)}
              >
                {name}
              </button>
            ))}
          </div>
        )}

        {/* Desktop — Bảng giá */}
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
              {filteredItems.map(item => (
                <tr key={item.id}>
                  <td className="col-route">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: 'var(--accent-600)' }}>
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
                    <button className="price-book-btn" onClick={() => handleBookNow(item)}>
                      Đặt xe ngay
                    </button>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                    Không tìm thấy gói xe phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile — Card list */}
        <div className="price-list-mobile price-table-mobile animate-fade-up delay-200">
          {filteredItems.map(item => (
            <div key={item.id} className="price-mobile-card">
              <div className="price-mob-row-top">
                <span className="price-mob-route" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: 'var(--accent-600)' }}>
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
              <button className="price-mob-btn" onClick={() => handleBookNow(item)}>
                Đặt xe ngay
              </button>
            </div>
          ))}
          {filteredItems.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
              Không tìm thấy gói xe phù hợp.
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
