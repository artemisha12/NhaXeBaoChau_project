import type { Booking, PricePackage, RouteItem, Vehicle } from "@/lib/types";

export const vehicles: Vehicle[] = [
  {
    id: 1,
    name: "Limousine 7 chỗ",
    type: "Xe ghép cao cấp",
    seats: 7,
    plateNumber: "75A-12345",
    description: "Ghế rộng, điều hòa mát, đưa đón tận nơi trong nội thành.",
    status: "active",
  },
  {
    id: 2,
    name: "Sedan 4 chỗ",
    type: "Xe riêng / bao chuyến",
    seats: 4,
    plateNumber: "43A-67890",
    description: "Phù hợp gia đình nhỏ, lịch đi linh hoạt, không ghép khách.",
    status: "active",
  },
  {
    id: 3,
    name: "Minivan 16 chỗ",
    type: "Nhóm đông người",
    seats: 16,
    plateNumber: "92B-24680",
    description: "Dành cho đoàn du lịch, công ty, gia đình đông người.",
    status: "active",
  },
];

export const routes: RouteItem[] = [
  { id: 1, from: "Huế", to: "Đà Nẵng", distanceKm: 100, duration: "2 giờ", status: "active" },
  { id: 2, from: "Đà Nẵng", to: "Hội An", distanceKm: 30, duration: "45 phút", status: "active" },
  { id: 3, from: "Huế", to: "Hội An", distanceKm: 130, duration: "2 giờ 45 phút", status: "active" },
];

export const pricePackages: PricePackage[] = [
  {
    id: 1,
    vehicleName: "Limousine 7 chỗ",
    routeName: "Huế → Đà Nẵng",
    type: "shared-seat",
    price: 200000,
    description: "Xe ghép theo chỗ, đưa đón tận nơi.",
    status: "active",
  },
  {
    id: 2,
    vehicleName: "Sedan 4 chỗ",
    routeName: "Huế → Đà Nẵng",
    type: "private-trip",
    price: 1200000,
    description: "Bao nguyên xe, chủ động thời gian.",
    status: "active",
  },
  {
    id: 3,
    vehicleName: "Limousine 7 chỗ",
    routeName: "Đà Nẵng → Hội An",
    type: "shared-seat",
    price: 120000,
    description: "Xe ghép tuyến ngắn, đi hằng ngày.",
    status: "active",
  },
  {
    id: 4,
    vehicleName: "Sedan 4 chỗ",
    routeName: "Huế → Hội An",
    type: "private-trip",
    price: 1600000,
    description: "Bao chuyến Huế - Hội An, phù hợp gia đình.",
    status: "active",
  },
];

export const bookings: Booking[] = [
  {
    id: 1,
    code: "BC-20240615-001",
    customerName: "Nguyễn Minh Anh",
    phone: "0905123456",
    routeName: "Huế → Đà Nẵng",
    travelDate: "2026-06-02",
    pickupAddress: "Trung tâm Huế",
    dropoffAddress: "Sân bay Đà Nẵng",
    passengerCount: 2,
    totalPrice: 400000,
    status: "new",
    internalNote: "Khách cần đón đúng giờ.",
  },
  {
    id: 2,
    code: "BC-20240615-002",
    customerName: "Trần Hoàng Nam",
    phone: "0911888999",
    routeName: "Đà Nẵng → Hội An",
    travelDate: "2026-06-03",
    pickupAddress: "Bến xe Đà Nẵng",
    dropoffAddress: "Phố cổ Hội An",
    passengerCount: 1,
    totalPrice: 120000,
    status: "confirmed",
  },
  {
    id: 3,
    code: "BC-20240615-003",
    customerName: "Lê Thu Hà",
    phone: "0988777666",
    routeName: "Huế → Hội An",
    travelDate: "2026-06-04",
    pickupAddress: "Khách sạn ở Huế",
    dropoffAddress: "Homestay Hội An",
    passengerCount: 4,
    totalPrice: 1600000,
    status: "completed",
  },
];
