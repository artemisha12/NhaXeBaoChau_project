export type BookingStatus = "new" | "confirmed" | "completed" | "cancelled";
export type PackageType = "shared-seat" | "private-trip";

export type Vehicle = {
  id: number;
  name: string;
  type: string;
  seats: number;
  plateNumber: string;
  description: string;
  status: "active" | "hidden";
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
  internalNote?: string;
};
