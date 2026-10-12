import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  UserProfile,
  Vehicle,
  ParkingFacility,
  ParkingSpot,
  NoParkingZone,
  Booking,
  ValetJob,
  NotificationItem,
  SpotStatus,
  ValetStatus,
} from '../types';
import { storage } from '../services/storage';
import { SimulatedCCTVDetector, ICCTVDetector, SpotDetectionEvent } from '../services/cctvSimulator';

interface AppContextType {
  // User & Profile
  user: UserProfile;
  selectedVehicle: Vehicle;
  setSelectedVehicle: (vehicle: Vehicle) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  switchRole: (role: 'user' | 'valet' | 'admin') => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // Navigation
  activeTab: 'home' | 'bookings' | 'valet' | 'help' | 'profile' | 'admin';
  setActiveTab: (tab: 'home' | 'bookings' | 'valet' | 'help' | 'profile' | 'admin') => void;

  // Facilities & Spots
  facilities: ParkingFacility[];
  selectedFacility: ParkingFacility | null;
  setSelectedFacility: (facility: ParkingFacility | null) => void;
  spots: ParkingSpot[];
  getSpotsForFacility: (facilityId: string) => ParkingSpot[];
  getVacantSpotsCount: (facilityId: string) => number;

  // CCTV Simulator
  cctvDetector: ICCTVDetector;
  cctvRunning: boolean;
  cctvInterval: number;
  lastCCTVEvent: SpotDetectionEvent | null;
  toggleCCTV: () => void;
  setCCTVInterval: (ms: number) => void;
  triggerManualSpotStatus: (spotId: string, status: SpotStatus) => void;
  simulateRushHour: () => void;

  // No-Parking Detector
  noParkingZones: NoParkingZone[];
  isNoParkingModalOpen: boolean;
  setIsNoParkingModalOpen: (open: boolean) => void;
  currentNoParkingResult: {
    isViolation: boolean;
    zone?: NoParkingZone;
    nearestAlternative?: string;
    distanceToZoneMeters?: number;
  } | null;
  checkLocationNoParking: (lat: number, lng: number) => {
    isViolation: boolean;
    zone?: NoParkingZone;
    nearestAlternative?: string;
  };

  // Booking Flow
  bookings: Booking[];
  activeBooking: Booking | null;
  heldSpot: ParkingSpot | null;
  heldTimeRemainingSeconds: number;
  holdSpotForBooking: (spot: ParkingSpot) => boolean;
  releaseHeldSpot: () => void;
  createBooking: (booking: Booking) => void;
  cancelBooking: (bookingId: string, reason: string) => { success: boolean; refundAmount: number; message: string };

  // Valet Service
  valetJobs: ValetJob[];
  activeValetJob: ValetJob | null;
  requestValetOnTheWay: (
    bookingId: string,
    pickupLocation: { lat: number; lng: number; address: string; isSafePoint: boolean; safeSpotDescription?: string }
  ) => ValetJob;
  updateValetJobStatus: (jobId: string, status: ValetStatus, extra?: Partial<ValetJob>) => void;

  // GPS & Location
  userLocation: { lat: number; lng: number };
  setUserLocation: (loc: { lat: number; lng: number }) => void;
  getDistanceToFacility: (facility: ParkingFacility) => number;

  // Notifications
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  markNotificationsAsRead: () => void;
  addNotification: (title: string, message: string, type?: NotificationItem['type']) => void;

  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Reset
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => storage.getUser());
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle>(() => {
    const saved = user.savedVehicles.find((v) => v.isDefault) || user.savedVehicles[0];
    return saved;
  });

  const [activeTab, setActiveTab] = useState<'home' | 'bookings' | 'valet' | 'help' | 'profile' | 'admin'>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [facilities, setFacilities] = useState<ParkingFacility[]>(() => storage.getFacilities());
  const [selectedFacility, setSelectedFacility] = useState<ParkingFacility | null>(facilities[0] || null);
  const [spots, setSpots] = useState<ParkingSpot[]>(() => storage.getSpots());
  const [noParkingZones] = useState<NoParkingZone[]>(() => storage.getNoParkingZones());

  // User simulated GPS Location (Default: Near Cyber Park Hub in Bengaluru)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 12.9716,
    lng: 77.5946,
  });

  // CCTV Detector setup
  const [cctvRunning, setCctvRunning] = useState(true);
  const [cctvInterval, setCctvIntervalState] = useState(4500);
  const [lastCCTVEvent, setLastCCTVEvent] = useState<SpotDetectionEvent | null>(null);

  // Spot Hold State (10 minute hold)
  const [heldSpot, setHeldSpot] = useState<ParkingSpot | null>(null);
  const [heldTimeRemainingSeconds, setHeldTimeRemainingSeconds] = useState(0);

  // Bookings & Valet
  const [bookings, setBookings] = useState<Booking[]>(() => storage.getBookings());
  const [valetJobs, setValetJobs] = useState<ValetJob[]>(() => storage.getValetJobs());

  // No-Parking Detector Modal
  const [isNoParkingModalOpen, setIsNoParkingModalOpen] = useState(false);
  const [currentNoParkingResult, setCurrentNoParkingResult] = useState<{
    isViolation: boolean;
    zone?: NoParkingZone;
    nearestAlternative?: string;
    distanceToZoneMeters?: number;
  } | null>(null);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => storage.getNotifications());

  // Dark Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('smartpark_theme') === 'dark';
  });

  // Active Booking
  const activeBooking = useMemo(() => {
    return bookings.find((b) => b.status === 'active' || b.status === 'confirmed') || null;
  }, [bookings]);

  // Active Valet Job
  const activeValetJob = useMemo(() => {
    return (
      valetJobs.find(
        (j) =>
          j.status !== 'completed' &&
          j.status !== 'cancelled' &&
          (!activeBooking || j.bookingId === activeBooking.id)
      ) ||
      valetJobs[0] ||
      null
    );
  }, [valetJobs, activeBooking]);

  // ICCTVDetector instantiation with getter
  const spotsAccessor = useCallback(() => spots, [spots]);
  const cctvDetector = useMemo(() => new SimulatedCCTVDetector(spotsAccessor), [spotsAccessor]);

  // Sync reserved spots to CCTV simulator so it never flips a held/booked spot
  useEffect(() => {
    const reserved = spots
      .filter((s) => s.status === 'no_parking' || s.heldUntil || s.occupiedByVehiclePlate)
      .map((s) => s.id);
    if (heldSpot) reserved.push(heldSpot.id);
    cctvDetector.setReservedSpots(reserved);
  }, [spots, heldSpot, cctvDetector]);

  // CCTV Subscription
  useEffect(() => {
    const unsubscribe = cctvDetector.subscribe((event) => {
      setLastCCTVEvent(event);
      // Update spot in storage and state
      setSpots((prev) => {
        const next = prev.map((s) =>
          s.id === event.spotId
            ? {
                ...s,
                status: event.newStatus,
                confidenceScore: event.confidenceScore,
                lastDetectedAt: event.timestamp,
              }
            : s
        );
        return next;
      });
      storage.updateSpotStatus(event.spotId, event.newStatus, event.confidenceScore);
    });

    cctvDetector.setIntervalMs(cctvInterval);
    cctvDetector.start();
    setCctvRunning(true);

    return () => {
      unsubscribe();
      cctvDetector.stop();
    };
  }, [cctvDetector, cctvInterval]);

  // Held Spot Countdown timer
  useEffect(() => {
    if (!heldSpot || heldTimeRemainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setHeldTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          // Time expired
          clearInterval(timer);
          releaseHeldSpot();
          addNotification('Hold Expired', `Spot ${heldSpot.spotNumber} hold time has elapsed.`, 'warning');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [heldSpot, heldTimeRemainingSeconds]);

  // Dark Mode class toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('smartpark_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('smartpark_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const getSpotsForFacility = useCallback(
    (facilityId: string) => {
      return spots.filter((s) => s.facilityId === facilityId);
    },
    [spots]
  );

  const getVacantSpotsCount = useCallback(
    (facilityId: string) => {
      return spots.filter((s) => s.facilityId === facilityId && s.status === 'vacant').length;
    },
    [spots]
  );

  const toggleCCTV = useCallback(() => {
    if (cctvRunning) {
      cctvDetector.stop();
      setCctvRunning(false);
    } else {
      cctvDetector.start();
      setCctvRunning(true);
    }
  }, [cctvRunning, cctvDetector]);

  const setCCTVInterval = useCallback(
    (ms: number) => {
      setCctvIntervalState(ms);
      cctvDetector.setIntervalMs(ms);
    },
    [cctvDetector]
  );

  const triggerManualSpotStatus = useCallback(
    (spotId: string, status: SpotStatus) => {
      cctvDetector.triggerManualFlip(spotId, status);
      setSpots((prev) =>
        prev.map((s) =>
          s.id === spotId ? { ...s, status, lastDetectedAt: new Date().toISOString(), confidenceScore: 0.99 } : s
        )
      );
      storage.updateSpotStatus(spotId, status, 0.99);
    },
    [cctvDetector]
  );

  const simulateRushHour = useCallback(() => {
    cctvDetector.simulateRushHour(spots);
    setSpots((prev) => {
      return prev.map((s) => {
        if (s.status === 'vacant' && !s.heldUntil) {
          return { ...s, status: 'occupied', lastDetectedAt: new Date().toISOString() };
        }
        return s;
      });
    });
    addNotification('Rush Hour Surge', 'CCTV detected 70% occupancy spike across all parking hubs.', 'warning');
  }, [cctvDetector, spots]);

  const checkLocationNoParking = useCallback(
    (lat: number, lng: number) => {
      const result = storage.checkPointNoParking(lat, lng);
      setCurrentNoParkingResult(result);
      setIsNoParkingModalOpen(true);
      return result;
    },
    []
  );

  const holdSpotForBooking = useCallback(
    (spot: ParkingSpot): boolean => {
      if (spot.status !== 'vacant') return false;
      const success = storage.holdSpot(spot.id, user.id, 10);
      if (success) {
        setHeldSpot(spot);
        setHeldTimeRemainingSeconds(10 * 60); // 10 minutes (600 seconds)
        setSpots((prev) =>
          prev.map((s) => (s.id === spot.id ? { ...s, heldUntil: new Date(Date.now() + 600000).toISOString() } : s))
        );
      }
      return success;
    },
    [user.id]
  );

  const releaseHeldSpot = useCallback(() => {
    if (heldSpot) {
      storage.releaseSpotHold(heldSpot.id);
      setSpots((prev) => prev.map((s) => (s.id === heldSpot.id ? { ...s, heldUntil: undefined } : s)));
      setHeldSpot(null);
      setHeldTimeRemainingSeconds(0);
    }
  }, [heldSpot]);

  const createBooking = useCallback(
    (newBooking: Booking) => {
      const created = storage.createBooking(newBooking);
      setBookings((prev) => [created, ...prev]);
      setSpots(storage.getSpots());
      setHeldSpot(null);
      setHeldTimeRemainingSeconds(0);
      setActiveTab('bookings');
    },
    []
  );

  const cancelBooking = useCallback((bookingId: string, reason: string) => {
    const res = storage.cancelBooking(bookingId, reason);
    if (res.success) {
      setBookings(storage.getBookings());
      setSpots(storage.getSpots());
    }
    return res;
  }, []);

  const requestValetOnTheWay = useCallback(
    (
      bookingId: string,
      pickupLocation: { lat: number; lng: number; address: string; isSafePoint: boolean; safeSpotDescription?: string }
    ): ValetJob => {
      const bkg = bookings.find((b) => b.id === bookingId) || bookings[0];
      const newJob: ValetJob = {
        id: `val-job-${Date.now().toString().slice(-4)}`,
        bookingId: bkg.id,
        userId: user.id,
        userName: user.name,
        userPhone: user.phone,
        facilityId: bkg.facilityId,
        facilityName: bkg.facilityName,
        vehiclePlate: bkg.vehicle.plateNumber,
        vehicleModel: `${bkg.vehicle.make} ${bkg.vehicle.model}`,
        mode: 'on_the_way',
        status: 'assigned',
        valetId: 'valet-01',
        valetName: 'Rajesh Kumar',
        valetPhone: '+91 94481 22319',
        valetRating: 4.95,
        valetVehicle: 'Honda Activa 6G (KA-05-EV-9021)',
        valetAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
        pickupLocation,
        currentValetLocation: {
          lat: pickupLocation.lat + 0.0035,
          lng: pickupLocation.lng - 0.0028,
        },
        destinationLocation: {
          lat: 12.9734,
          lng: 77.5982,
        },
        etaMinutes: 6,
        otp: Math.floor(1000 + Math.random() * 9000).toString(),
        pricing: {
          baseFee: 99,
          distanceFee: 35,
          rushSurcharge: 20,
          total: 154,
        },
        pickupPhotos: {},
        pickupConfirmedByUser: false,
        parkedConfirmedByUser: false,
        requestedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      storage.createValetJob(newJob);
      setValetJobs((prev) => [newJob, ...prev]);
      setActiveTab('valet');
      return newJob;
    },
    [bookings, user]
  );

  const updateValetJobStatus = useCallback(
    (jobId: string, status: ValetStatus, extra?: Partial<ValetJob>) => {
      const updated = storage.updateValetJob(jobId, { status, ...extra });
      if (updated) {
        setValetJobs(storage.getValetJobs());

        // Add contextual notification
        if (status === 'arriving') {
          addNotification('Valet Arriving Soon', `${updated.valetName} is 2 minutes away from your pickup point.`, 'info');
        } else if (status === 'otp_verified') {
          addNotification('Handover OTP Verified', `Vehicle custody safely transferred to ${updated.valetName}.`, 'success');
        } else if (status === 'parked') {
          addNotification('Vehicle Parked', `Your car is safely parked at ${updated.facilityName}. View parked photo.`, 'success');
        }
      }
    },
    []
  );

  const addNotification = useCallback((title: string, message: string, type: NotificationItem['type'] = 'info') => {
    const item = storage.addNotification({ title, message, type });
    setNotifications((prev) => [item, ...prev]);
  }, []);

  const markNotificationsAsRead = useCallback(() => {
    storage.markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const updateUserProfile = useCallback((profile: Partial<UserProfile>) => {
    const updated = storage.updateUser(profile);
    setUser(updated);
  }, []);

  const switchRole = useCallback((role: 'user' | 'valet' | 'admin') => {
    const updated = storage.updateUser({ role });
    setUser(updated);
    if (role === 'admin') setActiveTab('admin');
    else if (role === 'valet') setActiveTab('valet');
    else setActiveTab('home');
  }, []);

  const resetDemoData = useCallback(() => {
    storage.resetAllToSeed();
    setUser(storage.getUser());
    setSpots(storage.getSpots());
    setBookings(storage.getBookings());
    setValetJobs(storage.getValetJobs());
    setNotifications(storage.getNotifications());
    setHeldSpot(null);
    setHeldTimeRemainingSeconds(0);
    setActiveTab('home');
  }, []);

  const getDistanceToFacility = useCallback(
    (facility: ParkingFacility) => {
      return (
        facility.distanceKm ||
        Math.round(
          storage['facilities'] ? 0.8 : 0.8 // fallback
        )
      );
    },
    []
  );

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  return (
    <AppContext.Provider
      value={{
        user,
        selectedVehicle,
        setSelectedVehicle,
        updateUserProfile,
        switchRole,
        isAuthModalOpen,
        setIsAuthModalOpen,
        activeTab,
        setActiveTab,
        facilities,
        selectedFacility,
        setSelectedFacility,
        spots,
        getSpotsForFacility,
        getVacantSpotsCount,
        cctvDetector,
        cctvRunning,
        cctvInterval,
        lastCCTVEvent,
        toggleCCTV,
        setCCTVInterval,
        triggerManualSpotStatus,
        simulateRushHour,
        noParkingZones,
        isNoParkingModalOpen,
        setIsNoParkingModalOpen,
        currentNoParkingResult,
        checkLocationNoParking,
        bookings,
        activeBooking,
        heldSpot,
        heldTimeRemainingSeconds,
        holdSpotForBooking,
        releaseHeldSpot,
        createBooking,
        cancelBooking,
        valetJobs,
        activeValetJob,
        requestValetOnTheWay,
        updateValetJobStatus,
        userLocation,
        setUserLocation,
        getDistanceToFacility,
        notifications,
        unreadNotificationsCount,
        markNotificationsAsRead,
        addNotification,
        isDarkMode,
        toggleDarkMode,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
