'use client';

// Landing Page — NhaXeBaoChau
// Sections: Hero → WhyUs → Routes → Vehicles → PriceList → Testimonials → BookingForm → FAQ → Footer
import Header       from '@/components/landing/Header';
import HeroSection  from '@/components/landing/HeroSection';
import WhyUs        from '@/components/landing/WhyUs';
import Routes       from '@/components/landing/Routes';
import VehicleList  from '@/components/landing/VehicleList';
import PriceList    from '@/components/landing/PriceList';
import Testimonials from '@/components/landing/Testimonials';
import BookingForm  from '@/components/landing/BookingForm';
import FAQ             from '@/components/landing/FAQ';
import Footer          from '@/components/landing/Footer';
import FloatingContact from '@/components/landing/FloatingContact';
import { AdminProvider } from '@/context/AdminContext';

export default function HomePage() {
  return (
    <AdminProvider>
      {/* Header fixed — tách ra khỏi HeroSection để position: fixed hoạt động đúng */}
      <Header />
      <main>
        <HeroSection />

        {/* Vì sao chọn Bảo Châu */}
        <WhyUs />

        {/* Tuyến đường + SVG Map + Quick booking */}
        <Routes />

        {/* Đội xe */}
        <VehicleList />

        {/* Bảng giá */}
        <PriceList />

        {/* Đánh giá khách hàng */}
        <Testimonials />

        {/* Form đặt vé */}
        <BookingForm />

        {/* FAQ */}
        <FAQ />

        {/* Footer */}
        <Footer />
      </main>

      {/* Floating contact buttons */}
      <FloatingContact />
    </AdminProvider>
  );
}
