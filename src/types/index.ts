export type VehicleType = 'bike' | 'hatchback' | 'sedan' | 'suv' | 'ev';

export interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  make: string;
  type: VehicleType;
  color: string;
  isDefault: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  savedVehicles: Vehicle[];
  avatarUrl: string;
  role: 'user' | 'valet' | 'admin';
}

export type SpotStatus = 'vacant' | 'occupied' | 'no_parking';

export interface ParkingSpot {
  id: string;
  facilityId: string;
  spotNumber: string;
  floor: number;
  type: VehicleType;
  status: SpotStatus;
  hasEvCharger: boolean;
  confidenceScore: number; // 0 to 1 (e.g. 0.96 CCTV AI detection confidence)
  lastDetectedAt: string;
  cctvCameraId: string;
  occupiedByVehiclePlate?: string;
  heldUntil?: string; // 10 minute hold expiration timestamp
  heldByUserId?: string;
}

export interface ParkingFacility {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  totalSpots: number;
  hourlyRate: number;
  amenities: string[];
  floors: number[];
  openHours: string;
  rating: number;
  imageUrl: string;
  distanceKm?: number;
}

export interface NoParkingZone {
  id: string;
  name: string;
  fineAmount: number;
  currency: string;
  description: string;
  reason: string;
  legalAlternative: string;
  coordinates: [number, number][]; // Polygon vertices [lat, lng]
}

export type BookingStatus = 'held' | 'confirmed' | 'active' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  userId: string;
  facilityId: string;
  facilityName: string;
  facilityAddress: string;
  spotId: string;
  spotNumber: string;
  floor: number;
  vehicle: Vehicle;
  date: string;
  startTime: string; // HH:mm
  durationHours: number;
  endTime: string;
  status: BookingStatus;
  heldUntil?: string;
  pricing: {
    baseFee: number;
    platformFee: number;
    taxes: number;
    valetFee: number;
    discount: number;
    total: number;
  };
  promoCode?: string;
  qrCodeDataUrl?: string;
  valetRequested: boolean;
  valetMode?: 'destination' | 'on_the_way';
  valetJobId?: string;
  createdAt: string;
  cancelledAt?: string;
  cancellationReason?: string;
  refundAmount?: number;
  refundPercentage?: number;
}

export type ValetStatus =
  | 'requested'
  | 'assigned'
  | 'arriving'
  | 'otp_verified'
  | 'vehicle_received'
  | 'driving_to_facility'
  | 'parked'
  | 'ready_for_return'
  | 'completed'
  | 'cancelled';

export interface ValetJob {
  id: string;
  bookingId: string;
  userId: string;
  userName: string;
  userPhone: string;
  facilityId: string;
  facilityName: string;
  vehiclePlate: string;
  vehicleModel: string;
  mode: 'destination' | 'on_the_way';
  status: ValetStatus;
  valetId?: string;
  valetName?: string;
  valetPhone?: string;
  valetRating?: number;
  valetVehicle?: string;
  valetAvatar?: string;
  pickupLocation: {
    lat: number;
    lng: number;
    address: string;
    isSafePoint: boolean;
    safeSpotDescription?: string;
  };
  currentValetLocation: {
    lat: number;
    lng: number;
  };
  destinationLocation: {
    lat: number;
    lng: number;
  };
  etaMinutes: number;
  otp: string; // 4-digit verification OTP
  pricing: {
    baseFee: number;
    distanceFee: number;
    rushSurcharge: number;
    total: number;
  };
  pickupPhotos: {
    front?: string;
    back?: string;
    leftSide?: string;
    rightSide?: string;
    dashboard?: string;
  };
  pickupConfirmedByUser: boolean;
  parkedPhoto?: string;
  parkedConfirmedByUser: boolean;
  requestedAt: string;
  updatedAt: string;
  cancellationFee?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'valet' | 'assistant' | 'system';
  text: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  timestamp: string;
  read: boolean;
}
