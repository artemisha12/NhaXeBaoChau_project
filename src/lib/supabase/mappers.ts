import type { Vehicle, RouteItem, PricePackage, Booking } from '@/lib/types';

export function mapDbToVehicle(db: any): Vehicle {
  return {
    id: db.vehicle_id,
    name: db.vehicle_name,
    type: db.vehicle_type,
    seats: db.seat_count,
    plateNumber: db.license_plate,
    imageUrl: db.image_url || '',
    description: db.description || '',
    status: db.is_active ? 'active' : 'hidden',
  };
}

export function mapDbToRoute(db: any): RouteItem {
  return {
    id: db.route_id,
    from: db.departure_point,
    to: db.destination_point,
    distanceKm: db.distance_km ? Number(db.distance_km) : 0,
    duration: db.estimated_duration || '',
    status: db.is_active ? 'active' : 'hidden',
  };
}

function normalizePackageType(raw: string): 'shared-seat' | 'private-trip' {
  if (raw === 'shared' || raw === 'shared-seat') return 'shared-seat';
  return 'private-trip';
}

export function mapDbToPackage(db: any): PricePackage {
  const vehicleName = db.vehicles?.vehicle_name || 'Phương tiện';
  const routeName = db.routes
    ? `${db.routes.departure_point} → ${db.routes.destination_point}`
    : 'Tuyến đường';

  return {
    id: db.package_id,
    vehicleName,
    routeName,
    type: normalizePackageType(db.package_type),
    price: db.price ? Number(db.price) : 0,
    description: db.description || '',
    status: db.is_active ? 'active' : 'hidden',
    vehicleId: db.vehicle_id,
    routeId: db.route_id,
  };
}

// Regex parse giờ đi từ prefix [T:HH:mm] trong internal_note
function parseTravelTime(internalNote: string | null): string | undefined {
  if (!internalNote) return undefined;
  const m = internalNote.match(/^\[T:([^\]]+)\]/);
  return m ? m[1] : undefined;
}

function stripTimePrefix(internalNote: string | null): string | undefined {
  if (!internalNote) return undefined;
  const stripped = internalNote.replace(/^\[T:[^\]]*\]/, '').trim();
  return stripped || undefined;
}

export function mapDbToBooking(db: any): Booking {
  let routeName = 'Tuyến đường';
  if (db.packages?.routes) {
    routeName = `${db.packages.routes.departure_point} → ${db.packages.routes.destination_point}`;
  }

  const rawInternalNote = db.internal_note || null;

  return {
    id: db.booking_id,
    code: db.booking_code,
    customerName: db.customer_name,
    phone: db.customer_phone,
    routeName,
    travelDate: db.departure_date,
    pickupAddress: db.pickup_address,
    dropoffAddress: db.dropoff_address,
    passengerCount: db.passenger_count || 1,
    totalPrice: db.total_amount ? Number(db.total_amount) : 0,
    status: db.status,
    customerEmail: db.customer_email || undefined,
    customerNote: db.customer_note || undefined,
    priceAtBooking: db.price_at_booking ? Number(db.price_at_booking) : undefined,
    // internalNote hiển thị không có prefix [T:...]
    internalNote: stripTimePrefix(rawInternalNote),
    createdAt: db.created_at || undefined,
    // Ưu tiên departure_time nếu có (sau khi migration), fallback parse từ internal_note
    travelTime: db.departure_time || parseTravelTime(rawInternalNote) || undefined,
  };
}
