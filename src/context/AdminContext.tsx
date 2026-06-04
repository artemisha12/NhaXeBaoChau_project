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

  // Load from localStorage on mount & verify session from server
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedBookings = localStorage.getItem('bc_bookings');
      if (storedBookings) {
        const parsed = JSON.parse(storedBookings);
        let hasMigration = false;
        const migrated = parsed.map((b: Booking) => {
          if (!b.travelTime) {
            hasMigration = true;
            // Generate a time based on ID
            const hour = 7 + (b.id % 10);
            const minute = (b.id * 15) % 60;
            return {
              ...b,
              travelTime: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
            };
          }
          return b;
        });
        setBookings(migrated);
        if (hasMigration) {
          localStorage.setItem('bc_bookings', JSON.stringify(migrated));
        }
      }

      // Load vehicles từ Supabase
      getVehicles().then((dbVehicles) => {
        if (dbVehicles.length > 0) setVehicles(dbVehicles);
      }).catch(() => {});

      // Load bookings từ Supabase (100 mới nhất cho dashboard)
      getBookings().then((dbBookings) => {
        if (dbBookings.length > 0) setBookings(dbBookings);
      }).catch(() => {});

      // Load routes từ Supabase (thay localStorage)
      getRoutes().then((dbRoutes) => {
        if (dbRoutes.length > 0) setRoutes(dbRoutes);
      }).catch(() => {/* giữ mock-data nếu DB lỗi */});

      // Load packages từ Supabase
      getPackages().then((dbPackages) => {
        if (dbPackages.length > 0) setPackages(dbPackages);
      }).catch(() => {});

      const storedSettings = localStorage.getItem('bc_site_settings');
      if (storedSettings) setSiteSettings(JSON.parse(storedSettings));

      const storedHistory = localStorage.getItem('bc_booking_history');
      if (storedHistory) setBookingHistory(JSON.parse(storedHistory));

      // Load settings từ Supabase (chạy trên mọi trang — cả admin lẫn public)
      getSiteSettings().then((dbSettings) => {
        if (dbSettings) setSiteSettings(dbSettings);
      }).catch(() => {/* giữ default nếu DB lỗi */});

      // Xác minh JWT session từ cookie httpOnly
      const checkSession = async () => {
        try {
          const authRes = await getAdminInfoAction();
          if (authRes.success && authRes.admin) {
            setIsLoggedIn(true);
            setAdminUser(authRes.admin.fullName);
          } else {
            setIsLoggedIn(false);
            setAdminUser(null);
          }
        } catch (err) {
          setIsLoggedIn(false);
          setAdminUser(null);
        } finally {
          setIsMounted(true);
        }
      };
      checkSession();
    }
  }, []);

  // Sync data from localStorage when another tab writes to it (e.g. landing page booking)
  // Also sync when the admin tab regains focus (visibilitychange)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncFromStorage = () => {
      const storedBookings = localStorage.getItem('bc_bookings');
      if (storedBookings) {
        try { setBookings(JSON.parse(storedBookings)); } catch {}
      }
      const storedHistory = localStorage.getItem('bc_booking_history');
      if (storedHistory) {
        try { setBookingHistory(JSON.parse(storedHistory)); } catch {}
      }
    };

    // Listen for changes from other tabs
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'bc_bookings' || e.key === 'bc_booking_history') {
        syncFromStorage();
      }
    };

    // Also sync when tab becomes visible again (covers same-tab navigation)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

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

  // Bookings CRUD (Quản lý localStorage mock-data)
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

  const updateBookingStatus = async (bookingId: number, status: BookingStatus, note: string) => {
    // Optimistic update
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
    const result = await updateBookingStatusAction(bookingId, status, note);
    if (!result.success) {
      // Rollback: reload từ DB
      getBookings().then(db => setBookings(db)).catch(() => {});
    } else {
      // Thêm history entry locally
      const historyItem: BookingHistoryItem = {
        id: Date.now(),
        bookingId,
        oldStatus: bookings.find(b => b.id === bookingId)?.status || 'new',
        newStatus: status,
        note: note || '',
        changedAt: new Date().toISOString(),
        changedBy: adminUser || 'Nhân viên',
      };
      setBookingHistory(prev => [historyItem, ...prev]);
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
