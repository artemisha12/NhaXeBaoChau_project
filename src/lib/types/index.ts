export type BookingStatus = "new" | "confirmed" | "completed" | "cancelled";
export type PackageType = "shared-seat" | "private-trip";

export type Vehicle = {
  id: number;
  name: string;           // vehicle_name
  type: string;           // vehicle_type
  seats: number;          // seat_count
  plateNumber: string;    // license_plate
  imageUrl: string;       // image_url
  description: string;    // description
  status: "active" | "hidden"; // is_active
};

export type RouteItem = {
  id: number;
  from: string;
  to: string;
  distanceKm: number;
  duration: string;
  status: "active" | "hidden";
};

export type PricePackage = {
  id: number;
  vehicleName: string;
  routeName: string;
  type: PackageType;
  price: number;
  description: string;
  status: "active" | "hidden";
};

export type Booking = {
  id: number;
  code: string;
  customerName: string;
  phone: string;
  routeName: string;
  travelDate: string;
  pickupAddress: string;
  dropoffAddress: string;
  passengerCount: number;
  totalPrice: number;
  status: BookingStatus;
  customerEmail?: string;
  customerNote?: string;
  priceAtBooking?: number;
  internalNote?: string;
  createdAt?: string;
  travelTime?: string;
};
