import { ParkingFacility, ParkingSpot, NoParkingZone, UserProfile, ValetJob, Booking } from '../types';

export const SEED_USER: UserProfile = {
  id: 'usr-9021',
  name: 'Alex Morgan',
  email: 'alex.morgan@smartpark.io',
  phone: '+91 98765 43210',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
  role: 'user',
  savedVehicles: [
    {
      id: 'veh-01',
      plateNumber: 'KA-01-MJ-4029',
      make: 'Tesla',
      model: 'Model 3 Dual Motor',
      type: 'ev',
      color: 'Pearl White',
      isDefault: true,
    },
    {
      id: 'veh-02',
      plateNumber: 'KA-05-NB-8812',
      make: 'Hyundai',
      model: 'Creta Turbo',
      type: 'suv',
      color: 'Titan Grey',
      isDefault: false,
    },
    {
      id: 'veh-03',
      plateNumber: 'KA-03-EX-1090',
      make: 'Honda',
      model: 'City VTEC',
      type: 'sedan',
      color: 'Radiant Red',
      isDefault: false,
    },
    {
      id: 'veh-04',
      plateNumber: 'KA-04-BK-7744',
      make: 'Royal Enfield',
      model: 'Hunter 350',
      type: 'bike',
      color: 'Rebel Blue',
      isDefault: false,
    },
  ],
};

// Facilities centered around a realistic tech hub (e.g. 12.9716, 77.5946 - Bengaluru Tech Hub)
export const SEED_FACILITIES: ParkingFacility[] = [
  {
    id: 'fac-01',
    name: 'Cyber Park Multi-Level Hub',
    address: 'Plot 14, Tech Boulevard, Phase 1',
    lat: 12.9734,
    lng: 77.5982,
    totalSpots: 36,
    hourlyRate: 50,
    amenities: ['CCTV AI Vision', 'Level 2 Fast EV Chargers', 'Valet Available', 'Covered Bay', '24/7 Security'],
    floors: [1, 2],
    openHours: '24 Hours',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=600',
    distanceKm: 0.4,
  },
  {
    id: 'fac-02',
    name: 'Metro Central Station Complex',
    address: 'Station Rd, Near Terminal Gate 3',
    lat: 12.9685,
    lng: 77.5912,
    totalSpots: 30,
    hourlyRate: 40,
    amenities: ['CCTV AI Vision', 'Metro Direct Skywalk', 'Bike Bays', 'Disabled Accessible'],
    floors: [1, 2],
    openHours: '05:00 AM - 11:30 PM',
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&q=80&w=600',
    distanceKm: 0.9,
  },
  {
    id: 'fac-03',
    name: 'Grand Galleria Retail & Mall',
    address: '88 Commercial Ring Road',
    lat: 12.9782,
    lng: 77.6034,
    totalSpots: 28,
    hourlyRate: 60,
    amenities: ['CCTV AI Vision', 'Tesla Superchargers', 'On-Demand Valet', 'Car Wash Bay'],
    floors: [1, 2],
    openHours: '09:00 AM - 11:00 PM',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&q=80&w=600',
    distanceKm: 1.5,
  },
  {
    id: 'fac-04',
    name: 'Downtown Civic Square',
    address: '10 Constitution Ave, District 4',
    lat: 12.9642,
    lng: 77.5855,
    totalSpots: 24,
    hourlyRate: 35,
    amenities: ['CCTV AI Vision', 'Bike Parking', 'CCTV 360 Coverage'],
    floors: [1],
    openHours: '06:00 AM - 10:00 PM',
    rating: 4.3,
    imageUrl: 'https://images.unsplash.com/photo-1621929747188-0b4dc28498d2?auto=format&fit=crop&q=80&w=600',
    distanceKm: 2.1,
  },
];

// Generate realistic parking spots with varied vehicle types, EV chargers, and no-parking designated bays
export const generateSeedSpots = (): ParkingSpot[] => {
  const spots: ParkingSpot[] = [];

  // Facility 1: Cyber Park Multi-Level Hub (36 spots across 2 floors)
  const f1Types: Array<{ type: ParkingSpot['type']; ev: boolean }> = [
    { type: 'ev', ev: true },
    { type: 'ev', ev: true },
    { type: 'ev', ev: true },
    { type: 'sedan', ev: false },
    { type: 'sedan', ev: false },
    { type: 'suv', ev: false },
    { type: 'suv', ev: false },
    { type: 'hatchback', ev: false },
    { type: 'hatchback', ev: false },
    { type: 'bike', ev: false },
    { type: 'bike', ev: false },
    { type: 'bike', ev: false },
    { type: 'sedan', ev: false },
    { type: 'suv', ev: false },
    { type: 'sedan', ev: false },
    { type: 'hatchback', ev: false },
    { type: 'ev', ev: true },
    { type: 'sedan', ev: false },
  ];

  [1, 2].forEach((floor) => {
    f1Types.forEach((cfg, idx) => {
      const spotNum = `${floor === 1 ? 'A' : 'B'}-${String(idx + 1).padStart(2, '0')}`;
      let status: ParkingSpot['status'] = 'vacant';
      // Mark specific spots as no-parking (e.g. fire corridor obstruction or maintenance bay)
      if (idx === 7 || idx === 15) {
        status = 'no_parking';
      } else if (idx % 3 === 0 || idx === 4 || idx === 10) {
        status = 'occupied';
      }

      spots.push({
        id: `spot-f1-${floor}-${idx + 1}`,
        facilityId: 'fac-01',
        spotNumber: spotNum,
        floor,
        type: cfg.type,
        status,
        hasEvCharger: cfg.ev,
        confidenceScore: 0.94 + Math.round((idx % 5) * 0.01 * 100) / 100,
        lastDetectedAt: new Date(Date.now() - (idx * 3 + 2) * 60000).toISOString(),
        cctvCameraId: `CAM-F1-${floor}-0${(idx % 4) + 1}`,
        occupiedByVehiclePlate: status === 'occupied' ? `KA-${(idx * 7) % 50 + 10}-AB-${1000 + idx * 83}` : undefined,
      });
    });
  });

  // Facility 2: Metro Central Station Complex (30 spots)
  [1, 2].forEach((floor) => {
    for (let i = 1; i <= 15; i++) {
      const isEv = i <= 2;
      const type = i <= 3 ? (isEv ? 'ev' : 'sedan') : i <= 6 ? 'bike' : i <= 10 ? 'hatchback' : 'suv';
      let status: ParkingSpot['status'] = i === 5 ? 'no_parking' : i % 2 === 0 ? 'occupied' : 'vacant';

      spots.push({
        id: `spot-f2-${floor}-${i}`,
        facilityId: 'fac-02',
        spotNumber: `${floor === 1 ? 'M' : 'N'}-${String(i).padStart(2, '0')}`,
        floor,
        type,
        status,
        hasEvCharger: isEv,
        confidenceScore: 0.96,
        lastDetectedAt: new Date().toISOString(),
        cctvCameraId: `CAM-METRO-${floor}-0${(i % 3) + 1}`,
        occupiedByVehiclePlate: status === 'occupied' ? `KA-02-ZZ-${2000 + i * 47}` : undefined,
      });
    }
  });

  // Facility 3: Grand Galleria (28 spots)
  [1, 2].forEach((floor) => {
    for (let i = 1; i <= 14; i++) {
      const isEv = i <= 4;
      const type = isEv ? 'ev' : i <= 8 ? 'suv' : i <= 11 ? 'sedan' : 'bike';
      const status: ParkingSpot['status'] = i === 12 ? 'no_parking' : i % 3 === 1 ? 'occupied' : 'vacant';
      spots.push({
        id: `spot-f3-${floor}-${i}`,
        facilityId: 'fac-03',
        spotNumber: `${floor === 1 ? 'G' : 'H'}-${String(i).padStart(2, '0')}`,
        floor,
        type,
        status,
        hasEvCharger: isEv,
        confidenceScore: 0.98,
        lastDetectedAt: new Date().toISOString(),
        cctvCameraId: `CAM-MALL-${floor}-0${(i % 2) + 1}`,
      });
    }
  });

  // Facility 4: Downtown Civic Square (24 spots)
  for (let i = 1; i <= 24; i++) {
    const isEv = i === 1 || i === 2;
    const type = isEv ? 'ev' : i <= 8 ? 'sedan' : i <= 14 ? 'hatchback' : i <= 18 ? 'bike' : 'suv';
    const status: ParkingSpot['status'] = i === 8 || i === 20 ? 'no_parking' : i % 2 === 1 ? 'occupied' : 'vacant';
    spots.push({
      id: `spot-f4-1-${i}`,
      facilityId: 'fac-04',
      spotNumber: `C-${String(i).padStart(2, '0')}`,
      floor: 1,
      type,
      status,
      hasEvCharger: isEv,
      confidenceScore: 0.93,
      lastDetectedAt: new Date().toISOString(),
      cctvCameraId: `CAM-CIVIC-0${(i % 3) + 1}`,
    });
  }

  return spots;
};

// Geofenced No-Parking Zones with strict fine penalties and nearest safe bays
export const SEED_NO_PARKING_ZONES: NoParkingZone[] = [
  {
    id: 'npz-01',
    name: 'Emergency Fire & Ambulance Hydrant Corridor',
    fineAmount: 2000,
    currency: '₹',
    description: 'Strict Towing Zone: Emergency vehicle corridor & high-pressure hydrant access line.',
    reason: 'Zero tolerance fire escape corridor under Section 122 Motor Vehicles Act. Vehicles are impounded immediately.',
    legalAlternative: 'Cyber Park Multi-Level Hub (Bay A-04, 75m West)',
    coordinates: [
      [12.9745, 77.5975],
      [12.9748, 77.5989],
      [12.9740, 77.5991],
      [12.9737, 77.5977],
    ],
  },
  {
    id: 'npz-02',
    name: 'BRTS Rapid Transit Bus Lane & Metro Skywalk',
    fineAmount: 2500,
    currency: '₹',
    description: 'Dedicated public transit bus lane & heavy pedestrian zebra clearance.',
    reason: 'Obstruction of rapid transit lane carries instant ₹2,500 fine and commercial towing levy.',
    legalAlternative: 'Metro Central Station Complex (Bay M-02, 110m South)',
    coordinates: [
      [12.9692, 77.5898],
      [12.9696, 77.5925],
      [12.9688, 77.5926],
      [12.9684, 77.5900],
    ],
  },
  {
    id: 'npz-03',
    name: 'Diplomatic Enclave & Governor VIP Gate',
    fineAmount: 3000,
    currency: '₹',
    description: 'High security convoy turning circle and official gate access.',
    reason: 'Prohibited security zone. Unattended vehicles will be towed and searched by security personnel.',
    legalAlternative: 'Downtown Civic Square (Bay C-05, 140m East)',
    coordinates: [
      [12.9655, 77.5838],
      [12.9662, 77.5862],
      [12.9650, 77.5865],
      [12.9644, 77.5841],
    ],
  },
  {
    id: 'npz-04',
    name: 'Commercial Mall Loading Bay & Tanker Ramp',
    fineAmount: 1800,
    currency: '₹',
    description: 'Heavy logistics entry & fuel refilling dock apron.',
    reason: 'Industrial machinery turning radius. High risk of collision and obstruction.',
    legalAlternative: 'Grand Galleria Retail & Mall (Bay G-03, 50m North)',
    coordinates: [
      [12.9772, 77.6020],
      [12.9776, 77.6042],
      [12.9768, 77.6044],
      [12.9764, 77.6022],
    ],
  },
];

export const SEED_VALET_DRIVERS = [
  {
    id: 'valet-01',
    name: 'Rajesh Kumar',
    phone: '+91 94481 22319',
    rating: 4.94,
    totalTrips: 1420,
    vehicle: 'Honda Activa 6G (KA-05-EV-9021)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
    isOnline: true,
    currentLocation: { lat: 12.9721, lng: 77.5965 },
  },
  {
    id: 'valet-02',
    name: 'Amit Sharma',
    phone: '+91 98860 11482',
    rating: 4.88,
    totalTrips: 980,
    vehicle: 'Ather 450X EV (KA-01-EE-3344)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
    isOnline: true,
    currentLocation: { lat: 12.9698, lng: 77.5932 },
  },
];

export const SEED_BOOKINGS: Booking[] = [
  {
    id: 'SP-BKG-88412',
    userId: 'usr-9021',
    facilityId: 'fac-01',
    facilityName: 'Cyber Park Multi-Level Hub',
    facilityAddress: 'Plot 14, Tech Boulevard, Phase 1',
    spotId: 'spot-f1-1-1',
    spotNumber: 'A-01',
    floor: 1,
    vehicle: SEED_USER.savedVehicles[0],
    date: '2026-10-12',
    startTime: '10:00',
    durationHours: 3,
    endTime: '13:00',
    status: 'active',
    pricing: {
      baseFee: 150,
      platformFee: 15,
      taxes: 27,
      valetFee: 99,
      discount: 0,
      total: 291,
    },
    promoCode: 'WELCOME20',
    valetRequested: true,
    valetMode: 'on_the_way',
    valetJobId: 'val-job-101',
    createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
  },
];

export const SEED_VALET_JOB: ValetJob = {
  id: 'val-job-101',
  bookingId: 'SP-BKG-88412',
  userId: 'usr-9021',
  userName: 'Alex Morgan',
  userPhone: '+91 98765 43210',
  facilityId: 'fac-01',
  facilityName: 'Cyber Park Multi-Level Hub',
  vehiclePlate: 'KA-01-MJ-4029',
  vehicleModel: 'Tesla Model 3 (Pearl White)',
  mode: 'on_the_way',
  status: 'arriving',
  valetId: 'valet-01',
  valetName: 'Rajesh Kumar',
  valetPhone: '+91 94481 22319',
  valetRating: 4.94,
  valetVehicle: 'Honda Activa 6G (KA-05-EV-9021)',
  valetAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
  pickupLocation: {
    lat: 12.9712,
    lng: 77.5948,
    address: 'Near Indian Oil Fuel Station, MG Road Corner',
    isSafePoint: true,
    safeSpotDescription: 'Designated Fuel Station service lay-by (Safe & Legal Stop)',
  },
  currentValetLocation: {
    lat: 12.9724,
    lng: 77.5960,
  },
  destinationLocation: {
    lat: 12.9734,
    lng: 77.5982,
  },
  etaMinutes: 4,
  otp: '6284',
  pricing: {
    baseFee: 99,
    distanceFee: 35,
    rushSurcharge: 20,
    total: 154,
  },
  pickupPhotos: {
    front: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=600',
    back: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=600',
    leftSide: 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&q=80&w=600',
    rightSide: 'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&q=80&w=600',
    dashboard: 'https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&q=80&w=600',
  },
  pickupConfirmedByUser: false,
  parkedPhoto: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=600',
  parkedConfirmedByUser: false,
  requestedAt: new Date(Date.now() - 15 * 60000).toISOString(),
  updatedAt: new Date().toISOString(),
};
