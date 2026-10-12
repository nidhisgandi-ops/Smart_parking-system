import {
  ParkingFacility,
  ParkingSpot,
  NoParkingZone,
  UserProfile,
  Booking,
  ValetJob,
  NotificationItem,
  SpotStatus,
} from '../types';
import {
  SEED_USER,
  SEED_FACILITIES,
  generateSeedSpots,
  SEED_NO_PARKING_ZONES,
  SEED_BOOKINGS,
  SEED_VALET_JOB,
} from '../data/seedData';

// Geometry helper: Ray-casting algorithm to test if a point is within a polygon
export function isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  const [lat, lng] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersect = yi > lng !== yj > lng && lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// Haversine distance in meters
export function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

// LocalStorage Keys
const KEYS = {
  USER: 'smartpark_user',
  SPOTS: 'smartpark_spots',
  BOOKINGS: 'smartpark_bookings',
  VALET_JOBS: 'smartpark_valet_jobs',
  NOTIFICATIONS: 'smartpark_notifications',
  THEME: 'smartpark_theme',
};

class StorageService {
  private user: UserProfile;
  private facilities: ParkingFacility[];
  private spots: ParkingSpot[];
  private noParkingZones: NoParkingZone[];
  private bookings: Booking[];
  private valetJobs: ValetJob[];
  private notifications: NotificationItem[];

  constructor() {
    this.facilities = SEED_FACILITIES;
    this.noParkingZones = SEED_NO_PARKING_ZONES;

    // Load or initialize user
    const savedUser = localStorage.getItem(KEYS.USER);
    this.user = savedUser ? JSON.parse(savedUser) : SEED_USER;

    // Load or initialize spots
    const savedSpots = localStorage.getItem(KEYS.SPOTS);
    this.spots = savedSpots ? JSON.parse(savedSpots) : generateSeedSpots();

    // Load or initialize bookings
    const savedBookings = localStorage.getItem(KEYS.BOOKINGS);
    this.bookings = savedBookings ? JSON.parse(savedBookings) : SEED_BOOKINGS;

    // Load or initialize valet jobs
    const savedJobs = localStorage.getItem(KEYS.VALET_JOBS);
    this.valetJobs = savedJobs ? JSON.parse(savedJobs) : [SEED_VALET_JOB];

    // Notifications
    const savedNotifs = localStorage.getItem(KEYS.NOTIFICATIONS);
    this.notifications = savedNotifs
      ? JSON.parse(savedNotifs)
      : [
          {
            id: 'notif-1',
            title: 'Welcome to SmartPark!',
            message: 'Real-time CCTV AI detection is active. Book your spot in 2 taps.',
            type: 'info',
            timestamp: new Date().toISOString(),
            read: false,
          },
        ];

    this.persistAll();
  }

  private persistAll() {
    localStorage.setItem(KEYS.USER, JSON.stringify(this.user));
    localStorage.setItem(KEYS.SPOTS, JSON.stringify(this.spots));
    localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(this.bookings));
    localStorage.setItem(KEYS.VALET_JOBS, JSON.stringify(this.valetJobs));
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
  }

  public getUser(): UserProfile {
    return { ...this.user };
  }

  public updateUser(profile: Partial<UserProfile>): UserProfile {
    this.user = { ...this.user, ...profile };
    localStorage.setItem(KEYS.USER, JSON.stringify(this.user));
    return { ...this.user };
  }

  public getFacilities(): ParkingFacility[] {
    return [...this.facilities];
  }

  public getFacilityById(id: string): ParkingFacility | undefined {
    return this.facilities.find((f) => f.id === id);
  }

  public getSpots(): ParkingSpot[] {
    return [...this.spots];
  }

  public getSpotsForFacility(facilityId: string): ParkingSpot[] {
    return this.spots.filter((s) => s.facilityId === facilityId);
  }

  public updateSpotStatus(spotId: string, status: SpotStatus, confidence = 0.95): ParkingSpot | undefined {
    const spot = this.spots.find((s) => s.id === spotId);
    if (spot) {
      spot.status = status;
      spot.confidenceScore = confidence;
      spot.lastDetectedAt = new Date().toISOString();
      if (status === 'vacant') {
        spot.occupiedByVehiclePlate = undefined;
      }
      localStorage.setItem(KEYS.SPOTS, JSON.stringify(this.spots));
      return { ...spot };
    }
    return undefined;
  }

  public holdSpot(spotId: string, userId: string, holdDurationMinutes = 10): boolean {
    const spot = this.spots.find((s) => s.id === spotId);
    if (!spot || spot.status !== 'vacant') return false;

    spot.heldUntil = new Date(Date.now() + holdDurationMinutes * 60000).toISOString();
    spot.heldByUserId = userId;
    localStorage.setItem(KEYS.SPOTS, JSON.stringify(this.spots));
    return true;
  }

  public releaseSpotHold(spotId: string): void {
    const spot = this.spots.find((s) => s.id === spotId);
    if (spot) {
      spot.heldUntil = undefined;
      spot.heldByUserId = undefined;
      localStorage.setItem(KEYS.SPOTS, JSON.stringify(this.spots));
    }
  }

  public getNoParkingZones(): NoParkingZone[] {
    return [...this.noParkingZones];
  }

  /**
   * Check if a GPS coordinate is inside or dangerously close to any No-Parking Zone
   */
  public checkPointNoParking(lat: number, lng: number): {
    isViolation: boolean;
    zone?: NoParkingZone;
    nearestAlternative?: string;
    distanceToZoneMeters?: number;
  } {
    for (const zone of this.noParkingZones) {
      if (isPointInPolygon([lat, lng], zone.coordinates)) {
        return {
          isViolation: true,
          zone,
          nearestAlternative: zone.legalAlternative,
          distanceToZoneMeters: 0,
        };
      }

      // Check boundary proximity (within 35m)
      for (const coord of zone.coordinates) {
        const dist = getDistanceMeters(lat, lng, coord[0], coord[1]);
        if (dist <= 35) {
          return {
            isViolation: true,
            zone,
            nearestAlternative: zone.legalAlternative,
            distanceToZoneMeters: Math.round(dist),
          };
        }
      }
    }

    return { isViolation: false };
  }

  // Bookings
  public getBookings(): Booking[] {
    return [...this.bookings];
  }

  public getBookingById(id: string): Booking | undefined {
    return this.bookings.find((b) => b.id === id);
  }

  public createBooking(booking: Booking): Booking {
    this.bookings.unshift(booking);
    // Mark spot as occupied by this booking
    const spot = this.spots.find((s) => s.id === booking.spotId);
    if (spot) {
      spot.status = 'occupied';
      spot.occupiedByVehiclePlate = booking.vehicle.plateNumber;
      spot.heldUntil = undefined;
      spot.heldByUserId = undefined;
    }
    localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(this.bookings));
    localStorage.setItem(KEYS.SPOTS, JSON.stringify(this.spots));

    this.addNotification({
      title: 'Booking Confirmed!',
      message: `Spot ${booking.spotNumber} at ${booking.facilityName} is locked for your vehicle.`,
      type: 'success',
    });

    return booking;
  }

  public cancelBooking(
    bookingId: string,
    reason: string
  ): { success: boolean; refundAmount: number; refundPercent: number; message: string } {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, refundAmount: 0, refundPercent: 0, message: 'Booking not found' };

    // Calculate refund based on time rules:
    // > 1 hour before start: 100% refund
    // Within 1 hour before start: 50% refund
    // After start time: 0% refund
    const now = new Date();
    const [hours, mins] = booking.startTime.split(':').map(Number);
    const bookingStartTime = new Date(booking.date);
    bookingStartTime.setHours(hours, mins, 0, 0);

    const diffMinutes = (bookingStartTime.getTime() - now.getTime()) / (1000 * 60);

    let refundPercent = 0;
    if (diffMinutes > 60) {
      refundPercent = 100;
    } else if (diffMinutes > 0 && diffMinutes <= 60) {
      refundPercent = 50;
    } else {
      refundPercent = 0;
    }

    const refundAmount = Math.round((booking.pricing.total * refundPercent) / 100);

    booking.status = 'cancelled';
    booking.cancelledAt = new Date().toISOString();
    booking.cancellationReason = reason;
    booking.refundAmount = refundAmount;
    booking.refundPercentage = refundPercent;

    // Free the spot
    const spot = this.spots.find((s) => s.id === booking.spotId);
    if (spot) {
      spot.status = 'vacant';
      spot.occupiedByVehiclePlate = undefined;
    }

    localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(this.bookings));
    localStorage.setItem(KEYS.SPOTS, JSON.stringify(this.spots));

    this.addNotification({
      title: 'Booking Cancelled',
      message: `Booking #${booking.id} cancelled. ${
        refundAmount > 0 ? `₹${refundAmount} (${refundPercent}%) will be credited.` : 'No refund applicable.'
      }`,
      type: 'info',
    });

    return {
      success: true,
      refundAmount,
      refundPercent,
      message: `Refund of ₹${refundAmount} (${refundPercent}%) issued to original payment method.`,
    };
  }

  // Valet Jobs
  public getValetJobs(): ValetJob[] {
    return [...this.valetJobs];
  }

  public getValetJobById(id: string): ValetJob | undefined {
    return this.valetJobs.find((j) => j.id === id);
  }

  public createValetJob(job: ValetJob): ValetJob {
    this.valetJobs.unshift(job);
    localStorage.setItem(KEYS.VALET_JOBS, JSON.stringify(this.valetJobs));

    this.addNotification({
      title: 'Valet Dispatched!',
      message: `${job.valetName || 'A professional valet'} is en route to your vehicle.`,
      type: 'info',
    });

    return job;
  }

  public updateValetJob(id: string, updates: Partial<ValetJob>): ValetJob | undefined {
    const job = this.valetJobs.find((j) => j.id === id);
    if (job) {
      Object.assign(job, updates, { updatedAt: new Date().toISOString() });
      localStorage.setItem(KEYS.VALET_JOBS, JSON.stringify(this.valetJobs));
      return { ...job };
    }
    return undefined;
  }

  // Notifications
  public getNotifications(): NotificationItem[] {
    return [...this.notifications];
  }

  public addNotification(item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>): NotificationItem {
    const notif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      read: false,
      ...item,
    };
    this.notifications.unshift(notif);
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
    return notif;
  }

  public markAllNotificationsAsRead(): void {
    this.notifications.forEach((n) => (n.read = true));
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
  }

  public resetAllToSeed(): void {
    localStorage.clear();
    this.user = SEED_USER;
    this.spots = generateSeedSpots();
    this.bookings = SEED_BOOKINGS;
    this.valetJobs = [SEED_VALET_JOB];
    this.persistAll();
  }
}

export const storage = new StorageService();
