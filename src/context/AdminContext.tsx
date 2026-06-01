'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Booking, BookingStatus, PricePackage, RouteItem, Vehicle } from '@/lib/types';
import {
  bookings as initialBookings,
  vehicles as initialVehicles,
  routes as initialRoutes,
  pricePackages as initialPricePackages,
} from '@/lib/constants/mock-data';

export type SiteSettings = {
  hotline: string;
  zaloPhone: string;
  officeAddress: string;
  workingHours: string;
  bannerSlogan: string;
  facebookUrl: string;
  zaloOaUrl: string;
};

const defaultSettings: SiteSettings = {
  hotline: '0905 123 456',
  zaloPhone: '0905 123 456',
  officeAddress: 'Huế - Đà Nẵng - Hội An',
  workingHours: '06:00 - 22:00',
  bannerSlogan: 'An toàn - Tiện lợi - Đúng giờ trên mọi hành trình.',
  facebookUrl: 'https://facebook.com/nhaxebaochau',
  zaloOaUrl: 'https://zalo.me/nhaxebaochau',
};

type BookingHistoryItem = {
  id: number;
  bookingId: number;
  oldStatus: BookingStatus | 'created';
  newStatus: BookingStatus;
  note: string;
  changedAt: string;
  changedBy: string;
};

type AdminContextType = {
  // States
  isMounted: boolean;
  isLoggedIn: boolean;
  adminUser: string | null;
  bookings: Booking[];
  vehicles: Vehicle[];
  routes: RouteItem[];
  packages: PricePackage[];
  siteSettings: SiteSettings;
  bookingHistory: BookingHistoryItem[];
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  
  // Auth Functions
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  getFailedLoginAttempts: () => number;
  incrementFailedLoginAttempts: () => number;
  resetFailedLoginAttempts: () => void;
  getLockoutTime: () => string | null;
  setLockout: () => void;
  
  // Bookings CRUD
  addBooking: (booking: Omit<Booking, 'id' | 'code' | 'status'>) => Booking;
  updateBookingStatus: (bookingId: number, status: BookingStatus, note: string) => void;
  updateBookingInternalNote: (bookingId: number, note: string) => void;
  
  // Vehicles CRUD
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'status'>) => void;
  updateVehicle: (id: number, vehicle: Omit<Vehicle, 'id'>) => void;
  toggleVehicleStatus: (id: number) => void;
  
  // Routes CRUD
  addRoute: (route: Omit<RouteItem, 'id' | 'status'>) => void;
  updateRoute: (id: number, route: Omit<RouteItem, 'id'>) => void;
  toggleRouteStatus: (id: number) => void;
  
  // Packages CRUD
  addPackage: (pkg: Omit<PricePackage, 'id' | 'status'>) => void;
  updatePackage: (id: number, pkg: Omit<PricePackage, 'id'>) => void;
  togglePackageStatus: (id: number) => void;
  
  // Settings
  updateSiteSettings: (settings: Partial<SiteSettings>) => void;
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [routes, setRoutes] = useState<RouteItem[]>(initialRoutes);
  const [packages, setPackages] = useState<PricePackage[]>(initialPricePackages);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSettings);
  const [bookingHistory, setBookingHistory] = useState<BookingHistoryItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAuth = localStorage.getItem('bc_admin_auth');
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        setIsLoggedIn(true);
        setAdminUser(authData.username);
      }

      const storedBookings = localStorage.getItem('bc_bookings');
      if (storedBookings) setBookings(JSON.parse(storedBookings));

      const storedVehicles = localStorage.getItem('bc_vehicles');
      if (storedVehicles) setVehicles(JSON.parse(storedVehicles));

      const storedRoutes = localStorage.getItem('bc_routes');
      if (storedRoutes) setRoutes(JSON.parse(storedRoutes));

      const storedPackages = localStorage.getItem('bc_packages');
      if (storedPackages) setPackages(JSON.parse(storedPackages));

      const storedSettings = localStorage.getItem('bc_site_settings');
      if (storedSettings) setSiteSettings(JSON.parse(storedSettings));

      const storedHistory = localStorage.getItem('bc_booking_history');
      if (storedHistory) setBookingHistory(JSON.parse(storedHistory));

      setIsMounted(true);
    }
  }, []);

  // Save helpers
  const saveToLocal = (key: string, data: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  };

  // Auth Functions
  const login = (username: string, password: string) => {
    // Check locked out status first
    const lockedUntil = localStorage.getItem('bc_admin_locked_until');
    if (lockedUntil) {
      const lockTime = new Date(lockedUntil);
      if (new Date() < lockTime) {
        const minutesLeft = Math.ceil((lockTime.getTime() - new Date().getTime()) / 60000);
        return { success: false, error: `Tài khoản tạm khóa. Vui lòng thử lại sau ${minutesLeft} phút.` };
      } else {
        localStorage.removeItem('bc_admin_locked_until');
        resetFailedLoginAttempts();
      }
    }

    if (username === 'admin' && password === 'BaoChau@2026') {
      setIsLoggedIn(true);
      setAdminUser('Bảo Châu Admin');
      saveToLocal('bc_admin_auth', { loggedIn: true, username: 'Bảo Châu Admin' });
      resetFailedLoginAttempts();
      return { success: true };
    } else {
      const attempts = incrementFailedLoginAttempts();
      if (attempts >= 5) {
        setLockout();
        return { success: false, error: 'Đăng nhập sai 5 lần liên tiếp. Tài khoản đã bị khóa 15 phút.' };
      }
      return { success: false, error: `Sai tên đăng nhập hoặc mật khẩu. Bạn còn ${5 - attempts} lần thử.` };
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setAdminUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bc_admin_auth');
    }
  };

  const getFailedLoginAttempts = (): number => {
    if (typeof window !== 'undefined') {
      return Number(localStorage.getItem('bc_failed_attempts') || '0');
    }
    return 0;
  };

  const incrementFailedLoginAttempts = (): number => {
    const attempts = getFailedLoginAttempts() + 1;
    saveToLocal('bc_failed_attempts', attempts);
    return attempts;
  };

  const resetFailedLoginAttempts = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bc_failed_attempts');
    }
  };

  const getLockoutTime = (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bc_admin_locked_until');
    }
    return null;
  };

  const setLockout = () => {
    const lockTime = new Date(new Date().getTime() + 15 * 60000); // 15 mins lock
    if (typeof window !== 'undefined') {
      localStorage.setItem('bc_admin_locked_until', lockTime.toISOString());
    }
  };

  // Bookings CRUD
  const addBooking = (bookingData: Omit<Booking, 'id' | 'code' | 'status'>) => {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randNum = Math.floor(100 + Math.random() * 900);
    const newCode = `BC-${todayStr}-${randNum}`;
    const newId = bookings.length > 0 ? Math.max(...bookings.map((b) => b.id)) + 1 : 1;
    
    const newBooking: Booking = {
      ...bookingData,
      id: newId,
      code: newCode,
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    const updatedBookings = [newBooking, ...bookings];
    setBookings(updatedBookings);
    saveToLocal('bc_bookings', updatedBookings);

    // Write history
    const historyItem: BookingHistoryItem = {
      id: Date.now(),
      bookingId: newId,
      oldStatus: 'created',
      newStatus: 'new',
      note: 'Khách hàng gửi yêu cầu đặt vé trực tuyến.',
      changedAt: new Date().toISOString(),
      changedBy: 'Khách hàng',
    };
    const updatedHistory = [historyItem, ...bookingHistory];
    setBookingHistory(updatedHistory);
    saveToLocal('bc_booking_history', updatedHistory);

    return newBooking;
  };

  const updateBookingStatus = (bookingId: number, status: BookingStatus, note: string) => {
    const targetBooking = bookings.find((b) => b.id === bookingId);
    if (!targetBooking) return;
    
    const oldStatus = targetBooking.status;
    
    const updatedBookings = bookings.map((b) => 
      b.id === bookingId ? { ...b, status } : b
    );
    setBookings(updatedBookings);
    saveToLocal('bc_bookings', updatedBookings);

    // Record history
    const historyItem: BookingHistoryItem = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      bookingId,
      oldStatus,
      newStatus: status,
      note: note || `Đổi trạng thái đơn sang: ${status === 'confirmed' ? 'Đã xác nhận' : status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}.`,
      changedAt: new Date().toISOString(),
      changedBy: adminUser || 'Nhân viên',
    };
    const updatedHistory = [historyItem, ...bookingHistory];
    setBookingHistory(updatedHistory);
    saveToLocal('bc_booking_history', updatedHistory);
  };

  const updateBookingInternalNote = (bookingId: number, note: string) => {
    const updatedBookings = bookings.map((b) => 
      b.id === bookingId ? { ...b, internalNote: note } : b
    );
    setBookings(updatedBookings);
    saveToLocal('bc_bookings', updatedBookings);
  };

  // Vehicles CRUD
  const addVehicle = (vehicleData: Omit<Vehicle, 'id' | 'status'>) => {
    const newId = vehicles.length > 0 ? Math.max(...vehicles.map((v) => v.id)) + 1 : 1;
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: newId,
      status: 'active',
    };
    const updatedVehicles = [...vehicles, newVehicle];
    setVehicles(updatedVehicles);
    saveToLocal('bc_vehicles', updatedVehicles);
  };

  const updateVehicle = (id: number, vehicleData: Omit<Vehicle, 'id'>) => {
    const updatedVehicles = vehicles.map((v) => 
      v.id === id ? { ...v, ...vehicleData } : v
    );
    setVehicles(updatedVehicles);
    saveToLocal('bc_vehicles', updatedVehicles);
  };

  const toggleVehicleStatus = (id: number) => {
    const updatedVehicles = vehicles.map((v) => 
      v.id === id ? ({ ...v, status: v.status === 'active' ? 'hidden' : 'active' } as Vehicle) : v
    );
    setVehicles(updatedVehicles);
    saveToLocal('bc_vehicles', updatedVehicles);
  };

  // Routes CRUD
  const addRoute = (routeData: Omit<RouteItem, 'id' | 'status'>) => {
    const newId = routes.length > 0 ? Math.max(...routes.map((r) => r.id)) + 1 : 1;
    const newRoute: RouteItem = {
      ...routeData,
      id: newId,
      status: 'active',
    };
    const updatedRoutes = [...routes, newRoute];
    setRoutes(updatedRoutes);
    saveToLocal('bc_routes', updatedRoutes);
  };

  const updateRoute = (id: number, routeData: Omit<RouteItem, 'id'>) => {
    const updatedRoutes = routes.map((r) => 
      r.id === id ? { ...r, ...routeData } : r
    );
    setRoutes(updatedRoutes);
    saveToLocal('bc_routes', updatedRoutes);
  };

  const toggleRouteStatus = (id: number) => {
    const updatedRoutes = routes.map((r) => 
      r.id === id ? ({ ...r, status: r.status === 'active' ? 'hidden' : 'active' } as RouteItem) : r
    );
    setRoutes(updatedRoutes);
    saveToLocal('bc_routes', updatedRoutes);
  };

  // Packages CRUD
  const addPackage = (packageData: Omit<PricePackage, 'id' | 'status'>) => {
    const newId = packages.length > 0 ? Math.max(...packages.map((p) => p.id)) + 1 : 1;
    const newPackage: PricePackage = {
      ...packageData,
      id: newId,
      status: 'active',
    };
    const updatedPackages = [...packages, newPackage];
    setPackages(updatedPackages);
    saveToLocal('bc_packages', updatedPackages);
  };

  const updatePackage = (id: number, packageData: Omit<PricePackage, 'id'>) => {
    const updatedPackages = packages.map((p) => 
      p.id === id ? { ...p, ...packageData } : p
    );
    setPackages(updatedPackages);
    saveToLocal('bc_packages', updatedPackages);
  };

  const togglePackageStatus = (id: number) => {
    const updatedPackages = packages.map((p) => 
      p.id === id ? ({ ...p, status: p.status === 'active' ? 'hidden' : 'active' } as PricePackage) : p
    );
    setPackages(updatedPackages);
    saveToLocal('bc_packages', updatedPackages);
  };

  // Settings
  const updateSiteSettings = (settingsData: Partial<SiteSettings>) => {
    const updatedSettings = { ...siteSettings, ...settingsData };
    setSiteSettings(updatedSettings);
    saveToLocal('bc_site_settings', updatedSettings);
  };

  return (
    <AdminContext.Provider
      value={{
        isMounted,
        isLoggedIn,
        adminUser,
        bookings,
        vehicles,
        routes,
        packages,
        siteSettings,
        bookingHistory,
        mobileSidebarOpen,
        setMobileSidebarOpen,
        
        login,
        logout,
        getFailedLoginAttempts,
        incrementFailedLoginAttempts,
        resetFailedLoginAttempts,
        getLockoutTime,
        setLockout,
        
        addBooking,
        updateBookingStatus,
        updateBookingInternalNote,
        
        addVehicle,
        updateVehicle,
        toggleVehicleStatus,
        
        addRoute,
        updateRoute,
        toggleRouteStatus,
        
        addPackage,
        updatePackage,
        togglePackageStatus,
        
        updateSiteSettings,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
