import Header from '@/components/landing/Header';
import Hero from '@/components/landing/HeroSection';
import VehicleList from '@/components/landing/VehicleList';
import PriceList from '@/components/landing/PriceList';
import BookingForm from '@/components/landing/BookingForm';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <main>
      <Header />
      <Hero />
      <VehicleList />
      <PriceList />
      <BookingForm />
      <Footer />
    </main>
  );
}