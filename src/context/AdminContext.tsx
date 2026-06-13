'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Booking, BookingStatus, PricePackage, RouteItem, Vehicle } from '@/lib/types';
import {
  bookings as initialBookings,
  vehicles as initialVehicles,
  routes as initialRoutes,
  pricePackages as initialPricePackages,
} from '@/lib/constants/mock-data';

import {
  loginAdminAction,
  logoutAdminAction,
  getAdminInfoAction,
} from '@/app/actions/auth/actions';

import {
  getSiteSettings,
  updateSiteSettingsAction,
} from '@/app/actions/settings/actions';

import {
  getVehicles,
  addVehicleAction,
  updateVehicleAction,
  toggleVehicleStatusAction,
  deleteVehicleAction,
} from '@/app/actions/vehicles/actions';

import {
  getPackages,
  addPackageAction,
  updatePackageAction,
  togglePackageStatusAction,
} from '@/app/actions/packages/actions';

import {
  getRoutes,
  addRouteAction,
  updateRouteAction,
  toggleRouteStatusAction,
} from '@/app/actions/routes/actions';

import {
  getBookings,
  getBookingHistory,
  updateBookingStatusAction,
  updateBookingInternalNoteAction,
  updateBookingTravelTimeAction,
} from '@/app/actions/bookings/actions';

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
  hotline: '0767 375 375',
  zaloPhone: '0767 375 375',
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
  
  // Auth Functions (Dùng Server Actions và JWT)
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  getFailedLoginAttempts: () => number;
  incrementFailedLoginAttempts: () => number;
  resetFailedLoginAttempts: () => void;
  getLockoutTime: () => string | null;
  setLockout: () => void;
  
  // Bookings CRUD (Dùng localStorage mock-data theo yêu cầu)
  addBooking: (booking: Omit<Booking, 'id' | 'code' | 'status'>) => Booking;
  updateBookingStatus: (bookingId: number, status: BookingStatus, note: string) => void;
  updateBookingInternalNote: (bookingId: number, note: string) => void;
  updateBookingTravelTime: (bookingId: number, travelTime: string) => void;

  // Vehicles CRUD
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'status'>) => Promise<{ success: boolean; error?: string }>;
  updateVehicle: (id: number, vehicle: Omit<Vehicle, 'id'>) => Promise<{ success: boolean; error?: string }>;
  toggleVehicleStatus: (id: number) => Promise<{ success: boolean; error?: string }>;
  deleteVehicle: (id: number) => Promise<{ success: boolean; error?: string }>;

  // Routes CRUD
  addRoute: (route: Omit<RouteItem, 'id' | 'status'>) => Promise<{ success: boolean; error?: string }>;
  updateRoute: (id: number, route: Omit<RouteItem, 'id'>) => Promise<{ success: boolean; error?: string }>;
  toggleRouteStatus: (id: number) => Promise<{ success: boolean; error?: string }>;

  // Packages CRUD
  addPackage: (pkg: Omit<PricePackage, 'id' | 'status'>) => Promise<{ success: boolean; error?: string }>;
  updatePackage: (id: number, pkg: Omit<PricePackage, 'id'>) => Promise<{ success: boolean; error?: string }>;
  togglePackageStatus: (id: number) => Promise<{ success: boolean; error?: string }>;

  // Settings
  updateSiteSettings: (settings: Partial<SiteSettings>) => Promise<{ success: boolean; error?: string }>;
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

  // Mount: load public data + verify session
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Public data (không cần auth) — load song song
    Promise.all([
      getVehicles(),
      getRoutes(),
      getPackages(),
      getSiteSettings(),
    ]).then(([dbVehicles, dbRoutes, dbPackages, dbSettings]) => {
      if (dbVehicles.length > 0) setVehicles(dbVehicles);
      if (dbRoutes.length > 0)   setRoutes(dbRoutes);
      if (dbPackages.length > 0) setPackages(dbPackages);
      if (dbSettings)            setSiteSettings(dbSettings);
    }).catch(() => {});

    // Admin-only data — load SAU khi xác thực session
    const checkSession = async () => {
      try {
        const authRes = await getAdminInfoAction();
        if (authRes.success && authRes.admin) {
          setIsLoggedIn(true);
          setAdminUser(authRes.admin.fullName);

          // Load bookings + history từ DB (chỉ khi là admin)
          const [dbBookings, dbHistory] = await Promise.all([
            getBookings(),
            getBookingHistory(),
          ]);
          setBookings(dbBookings);
          setBookingHistory(dbHistory.map((h: any) => ({
            id: h.id,
            bookingId: h.bookingId,
            oldStatus: h.oldStatus,
            newStatus: h.newStatus,
            note: h.note,
            changedAt: h.changedAt,
            changedBy: h.changedBy,
          })));
        } else {
          setIsLoggedIn(false);
          setAdminUser(null);
        }
      } catch {
        setIsLoggedIn(false);
        setAdminUser(null);
      } finally {
        setIsMounted(true);
      }
    };
    checkSession();
  }, []);

  // Refresh bookings từ DB khi tab được focus lại (admin panel)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isLoggedIn) {
        getBookings().then(db => setBookings(db)).catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isLoggedIn]);

  // Save helpers
  const saveToLocal = (key: string, data: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  };

  // Auth Functions (Đồng bộ với Server-side JWT)
  const login = async (username: string, password: string) => {
    const res = await loginAdminAction(username, password);
    if (res.success) {
      setIsLoggedIn(true);
      const authRes = await getAdminInfoAction();
      if (authRes.success && authRes.admin) {
        setAdminUser(authRes.admin.fullName);
      } else {
        setAdminUser('Bảo Châu Admin');
      }
      // Load dữ liệu thật ngay sau khi login thành công
      const [dbBookings, dbHistory] = await Promise.all([
        getBookings(),
        getBookingHistory(),
      ]);
      setBookings(dbBookings);
      setBookingHistory(dbHistory);
    }
    return res;
  };

  const logout = async () => {
    const res = await logoutAdminAction();
    if (res.success) {
      setIsLoggedIn(false);
      setAdminUser(null);
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

  // addBooking — forms giờ dùng addBookingAction trực tiếp, hàm này chỉ reload
  const addBooking = (_bookingData: Omit<Booking, 'id' | 'code' | 'status'>): Booking => {
    getBookings().then(db => setBookings(db)).catch(() => {});
    // Trả dummy để không break type, form thật dùng addBookingAction
    return { id: 0, code: '', customerName: '', phone: '', routeName: '',
      travelDate: '', pickupAddress: '', dropoffAddress: '',
      passengerCount: 1, totalPrice: 0, status: 'new' };
  };

  const updateBookingStatus = async (bookingId: number, status: BookingStatus, note: string) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
    const result = await updateBookingStatusAction(bookingId, status, note);
    if (!result.success) {
      getBookings().then(db => setBookings(db)).catch(() => {});
    } else {
      // Reload history từ DB sau khi cập nhật thành công
      getBookingHistory().then(h => setBookingHistory(h)).catch(() => {});
    }
  };

  const updateBookingInternalNote = async (bookingId: number, note: string) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, internalNote: note } : b));
    await updateBookingInternalNoteAction(bookingId, note);
  };

  const updateBookingTravelTime = async (bookingId: number, travelTime: string) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, travelTime } : b));
    await updateBookingTravelTimeAction(bookingId, travelTime);
  };

  const reloadVehicles = async () => { const fresh = await getVehicles(); setVehicles(fresh); };
  const reloadPackages = async () => { const fresh = await getPackages(); setPackages(fresh); };

  // Vehicles CRUD
  const addVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'status'>): Promise<{ success: boolean; error?: string }> => {
    const result = await addVehicleAction(vehicleData);
    if (result.success) await reloadVehicles();
    return result;
  };

  const updateVehicle = async (id: number, vehicleData: Omit<Vehicle, 'id'>): Promise<{ success: boolean; error?: string }> => {
    const result = await updateVehicleAction(id, vehicleData);
    if (result.success) await reloadVehicles();
    return result;
  };

  const toggleVehicleStatus = async (id: number): Promise<{ success: boolean; error?: string }> => {
    const result = await toggleVehicleStatusAction(id);
    if (result.success) await reloadVehicles();
    return result;
  };

  const deleteVehicle = async (id: number): Promise<{ success: boolean; error?: string }> => {
    const result = await deleteVehicleAction(id);
    if (result.success) {
      await reloadVehicles();
      // Reload packages vì packages của xe này cũng bị soft-delete
      const freshPkgs = await getPackages();
      setPackages(freshPkgs);
    }
    return result;
  };

  const reloadRoutes = async () => {
    const fresh = await getRoutes();
    setRoutes(fresh);
  };

  // Routes CRUD — persist to Supabase
  const addRoute = async (routeData: Omit<RouteItem, 'id' | 'status'>): Promise<{ success: boolean; error?: string }> => {
    const result = await addRouteAction(routeData);
    if (result.success) await reloadRoutes();
    return result;
  };

  const updateRoute = async (id: number, routeData: Omit<RouteItem, 'id'>): Promise<{ success: boolean; error?: string }> => {
    const result = await updateRouteAction(id, routeData);
    if (result.success) await reloadRoutes();
    return result;
  };

  const toggleRouteStatus = async (id: number): Promise<{ success: boolean; error?: string }> => {
    const result = await toggleRouteStatusAction(id);
    if (result.success) await reloadRoutes();
    return result;
  };

  // Packages CRUD
  const addPackage = async (packageData: Omit<PricePackage, 'id' | 'status'>): Promise<{ success: boolean; error?: string }> => {
    const result = await addPackageAction(packageData);
    if (result.success) await reloadPackages();
    return result;
  };

  const updatePackage = async (id: number, packageData: Omit<PricePackage, 'id'>): Promise<{ success: boolean; error?: string }> => {
    const result = await updatePackageAction(id, packageData);
    if (result.success) await reloadPackages();
    return result;
  };

  const togglePackageStatus = async (id: number): Promise<{ success: boolean; error?: string }> => {
    const result = await togglePackageStatusAction(id);
    if (result.success) await reloadPackages();
    return result;
  };

  // Settings — persist to Supabase, optimistic update
  const updateSiteSettings = async (settingsData: Partial<SiteSettings>): Promise<{ success: boolean; error?: string }> => {
    const prev = siteSettings;
    const updated = { ...siteSettings, ...settingsData };
    setSiteSettings(updated); // optimistic
    const result = await updateSiteSettingsAction(settingsData);
    if (!result.success) setSiteSettings(prev); // rollback on error
    return result;
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
        updateBookingTravelTime,

        addVehicle,
        updateVehicle,
        toggleVehicleStatus,
        deleteVehicle,

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
