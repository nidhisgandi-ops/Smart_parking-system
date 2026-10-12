-- ==============================================================================
-- SMARTPARK COMPLETE SUPABASE DATABASE RESTORATION SCRIPT
-- Copy and run this entire script in Supabase SQL Editor.
-- It recreates all tables, RLS policies, Realtime publications, and Seed data.
-- ==============================================================================

-- 1. CLEANUP (Idempotent Drop)
DROP TABLE IF EXISTS public.valet_jobs CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.parking_spots CASCADE;
DROP TABLE IF EXISTS public.parking_facilities CASCADE;
DROP TABLE IF EXISTS public.no_parking_zones CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. CREATE PROFILES TABLE
CREATE TABLE public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'valet', 'admin')),
  saved_vehicles JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE PARKING FACILITIES TABLE
CREATE TABLE public.parking_facilities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  total_spots INT NOT NULL DEFAULT 30,
  hourly_rate NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
  amenities TEXT[] DEFAULT '{}',
  floors INT[] DEFAULT '{1}',
  open_hours TEXT DEFAULT '24 Hours',
  rating NUMERIC(3, 2) DEFAULT 4.8,
  image_url TEXT,
  distance_km NUMERIC(4, 2) DEFAULT 0.8,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CREATE PARKING SPOTS TABLE (CCTV AI Monitored)
CREATE TABLE public.parking_spots (
  id TEXT PRIMARY KEY,
  facility_id TEXT REFERENCES public.parking_facilities(id) ON DELETE CASCADE,
  spot_number TEXT NOT NULL,
  floor INT NOT NULL DEFAULT 1,
  type TEXT NOT NULL CHECK (type IN ('bike', 'hatchback', 'sedan', 'suv', 'ev')),
  status TEXT NOT NULL DEFAULT 'vacant' CHECK (status IN ('vacant', 'occupied', 'no_parking')),
  has_ev_charger BOOLEAN DEFAULT FALSE,
  confidence_score NUMERIC(4, 3) DEFAULT 0.950,
  last_detected_at TIMESTAMPTZ DEFAULT NOW(),
  cctv_camera_id TEXT,
  occupied_by_vehicle_plate TEXT,
  held_until TIMESTAMPTZ,
  held_by_user_id TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CREATE NO-PARKING ZONES TABLE
CREATE TABLE public.no_parking_zones (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  fine_amount NUMERIC(10, 2) NOT NULL DEFAULT 2000.00,
  currency TEXT DEFAULT '₹',
  description TEXT,
  reason TEXT,
  legal_alternative TEXT,
  coordinates JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CREATE BOOKINGS TABLE
CREATE TABLE public.bookings (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  facility_id TEXT REFERENCES public.parking_facilities(id),
  spot_id TEXT REFERENCES public.parking_spots(id),
  spot_number TEXT NOT NULL,
  floor INT NOT NULL DEFAULT 1,
  vehicle_plate TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TEXT NOT NULL,
  duration_hours INT NOT NULL,
  end_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('held', 'confirmed', 'active', 'completed', 'cancelled')),
  base_fee NUMERIC(10, 2) NOT NULL,
  platform_fee NUMERIC(10, 2) NOT NULL,
  taxes NUMERIC(10, 2) NOT NULL,
  valet_fee NUMERIC(10, 2) DEFAULT 0.00,
  discount NUMERIC(10, 2) DEFAULT 0.00,
  total NUMERIC(10, 2) NOT NULL,
  promo_code TEXT,
  qr_code_token TEXT,
  valet_requested BOOLEAN DEFAULT FALSE,
  valet_mode TEXT CHECK (valet_mode IN ('destination', 'on_the_way')),
  valet_job_id TEXT,
  cancellation_reason TEXT,
  refund_amount NUMERIC(10, 2),
  refund_percentage NUMERIC(5, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CREATE VALET JOBS TABLE
CREATE TABLE public.valet_jobs (
  id TEXT PRIMARY KEY,
  booking_id TEXT,
  user_id TEXT,
  user_name TEXT,
  user_phone TEXT,
  facility_id TEXT,
  facility_name TEXT,
  vehicle_plate TEXT,
  vehicle_model TEXT,
  mode TEXT NOT NULL CHECK (mode IN ('destination', 'on_the_way')),
  status TEXT NOT NULL DEFAULT 'requested' CHECK (
    status IN ('requested', 'assigned', 'arriving', 'otp_verified', 'vehicle_received', 'driving_to_facility', 'parked', 'ready_for_return', 'completed', 'cancelled')
  ),
  valet_id TEXT,
  valet_name TEXT,
  valet_phone TEXT,
  valet_vehicle TEXT,
  valet_avatar TEXT,
  pickup_lat DOUBLE PRECISION NOT NULL,
  pickup_lng DOUBLE PRECISION NOT NULL,
  pickup_address TEXT NOT NULL,
  is_safe_point BOOLEAN DEFAULT TRUE,
  safe_spot_description TEXT,
  valet_lat DOUBLE PRECISION,
  valet_lng DOUBLE PRECISION,
  eta_minutes INT DEFAULT 5,
  otp TEXT NOT NULL,
  base_fee NUMERIC(10, 2) DEFAULT 99.00,
  distance_fee NUMERIC(10, 2) DEFAULT 0.00,
  rush_surcharge NUMERIC(10, 2) DEFAULT 0.00,
  total NUMERIC(10, 2) NOT NULL,
  pickup_photos JSONB DEFAULT '{}'::jsonb,
  pickup_confirmed_by_user BOOLEAN DEFAULT FALSE,
  parked_photo TEXT,
  parked_confirmed_by_user BOOLEAN DEFAULT FALSE,
  cancellation_fee NUMERIC(10, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.no_parking_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.valet_jobs ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for seamless app demo & testing
CREATE POLICY "Public full access facilities" ON public.parking_facilities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access spots" ON public.parking_spots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access no_parking_zones" ON public.no_parking_zones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access bookings" ON public.bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access valet_jobs" ON public.valet_jobs FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- SAFE REALTIME REPLICATION CONFIGURATION
-- ==============================================================================
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.parking_spots;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.valet_jobs;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- ==============================================================================
-- SEED DATA INSERTION
-- ==============================================================================

-- 1. Seed Demo User Profile
INSERT INTO public.profiles (id, name, email, phone, avatar_url, role, saved_vehicles)
VALUES (
  'usr-9021',
  'Alex Morgan',
  'alex.morgan@smartpark.io',
  '+91 98765 43210',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
  'user',
  '[
    {"id":"veh-01","plateNumber":"KA-01-MJ-4029","make":"Tesla","model":"Model 3","type":"ev","color":"Pearl White","isDefault":true},
    {"id":"veh-02","plateNumber":"KA-05-NB-8812","make":"Hyundai","model":"Creta Turbo","type":"suv","color":"Titan Grey","isDefault":false},
    {"id":"veh-03","plateNumber":"KA-03-EX-1090","make":"Honda","model":"City VTEC","type":"sedan","color":"Radiant Red","isDefault":false},
    {"id":"veh-04","plateNumber":"KA-04-BK-7744","make":"Royal Enfield","model":"Hunter 350","type":"bike","color":"Rebel Blue","isDefault":false}
  ]'::jsonb
);

-- 2. Seed Facilities
INSERT INTO public.parking_facilities (id, name, address, lat, lng, total_spots, hourly_rate, amenities, floors, open_hours, rating, image_url, distance_km)
VALUES
('fac-01', 'Cyber Park Multi-Level Hub', 'Plot 14, Tech Boulevard, Phase 1', 12.9734, 77.5982, 36, 50.00, ARRAY['CCTV AI Vision', 'Level 2 Fast EV Chargers', 'Valet Available', 'Covered Bay', '24/7 Security'], ARRAY[1, 2], '24 Hours', 4.8, 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=600', 0.4),
('fac-02', 'Metro Central Station Complex', 'Station Rd, Near Terminal Gate 3', 12.9685, 77.5912, 30, 40.00, ARRAY['CCTV AI Vision', 'Metro Direct Skywalk', 'Bike Bays', 'Disabled Accessible'], ARRAY[1, 2], '05:00 AM - 11:30 PM', 4.6, 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&q=80&w=600', 0.9),
('fac-03', 'Grand Galleria Retail & Mall', '88 Commercial Ring Road', 12.9782, 77.6034, 28, 60.00, ARRAY['CCTV AI Vision', 'Tesla Superchargers', 'On-Demand Valet', 'Car Wash Bay'], ARRAY[1, 2], '09:00 AM - 11:00 PM', 4.9, 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&q=80&w=600', 1.5),
('fac-04', 'Downtown Civic Square', '10 Constitution Ave, District 4', 12.9642, 77.5855, 24, 35.00, ARRAY['CCTV AI Vision', 'Bike Parking', 'CCTV 360 Coverage'], ARRAY[1], '06:00 AM - 10:00 PM', 4.3, 'https://images.unsplash.com/photo-1621929747188-0b4dc28498d2?auto=format&fit=crop&q=80&w=600', 2.1);

-- 3. Seed No-Parking Zones
INSERT INTO public.no_parking_zones (id, name, fine_amount, currency, description, reason, legal_alternative, coordinates)
VALUES
('npz-01', 'Emergency Fire & Ambulance Hydrant Corridor', 2000.00, '₹', 'Strict Towing Zone: Emergency vehicle corridor & high-pressure hydrant line.', 'Zero tolerance fire escape corridor under Section 122 Motor Vehicles Act. Vehicles impounded immediately.', 'Cyber Park Multi-Level Hub (Bay A-04, 75m West)', '[[12.9745, 77.5975], [12.9748, 77.5989], [12.9740, 77.5991], [12.9737, 77.5977]]'::jsonb),
('npz-02', 'BRTS Rapid Transit Bus Lane & Metro Skywalk', 2500.00, '₹', 'Dedicated public transit bus lane & heavy pedestrian clearance.', 'Obstruction of rapid transit lane carries instant ₹2,500 fine and commercial towing levy.', 'Metro Central Station Complex (Bay M-02, 110m South)', '[[12.9692, 77.5898], [12.9696, 77.5925], [12.9688, 77.5926], [12.9684, 77.5900]]'::jsonb),
('npz-03', 'Diplomatic Enclave & Governor VIP Gate', 3000.00, '₹', 'High security convoy turning circle and official gate access.', 'Prohibited security zone. Unattended vehicles will be towed immediately by police.', 'Downtown Civic Square (Bay C-05, 140m East)', '[[12.9655, 77.5838], [12.9662, 77.5862], [12.9650, 77.5865], [12.9644, 77.5841]]'::jsonb),
('npz-04', 'Commercial Mall Loading Bay & Tanker Ramp', 1800.00, '₹', 'Heavy logistics entry & fuel refilling dock apron.', 'Industrial machinery turning radius. High risk of collision and obstruction.', 'Grand Galleria Retail & Mall (Bay G-03, 50m North)', '[[12.9772, 77.6020], [12.9776, 77.6042], [12.9768, 77.6044], [12.9764, 77.6022]]'::jsonb);

-- 4. Seed Parking Spots (Cyber Park Hub Floor 1 & 2)
INSERT INTO public.parking_spots (id, facility_id, spot_number, floor, type, status, has_ev_charger, confidence_score, cctv_camera_id, occupied_by_vehicle_plate)
VALUES
('spot-f1-1-1', 'fac-01', 'A-01', 1, 'ev', 'occupied', true, 0.98, 'CAM-F1-1-01', 'KA-01-MJ-4029'),
('spot-f1-1-2', 'fac-01', 'A-02', 1, 'ev', 'vacant', true, 0.96, 'CAM-F1-1-02', NULL),
('spot-f1-1-3', 'fac-01', 'A-03', 1, 'ev', 'vacant', true, 0.95, 'CAM-F1-1-03', NULL),
('spot-f1-1-4', 'fac-01', 'A-04', 1, 'sedan', 'occupied', false, 0.94, 'CAM-F1-1-04', 'KA-02-MH-3199'),
('spot-f1-1-5', 'fac-01', 'A-05', 1, 'sedan', 'vacant', false, 0.97, 'CAM-F1-1-01', NULL),
('spot-f1-1-6', 'fac-01', 'A-06', 1, 'suv', 'vacant', false, 0.95, 'CAM-F1-1-02', NULL),
('spot-f1-1-7', 'fac-01', 'A-07', 1, 'suv', 'occupied', false, 0.99, 'CAM-F1-1-03', 'KA-05-EX-4412'),
('spot-f1-1-8', 'fac-01', 'A-08', 1, 'hatchback', 'no_parking', false, 0.99, 'CAM-F1-1-04', NULL),
('spot-f1-1-9', 'fac-01', 'A-09', 1, 'hatchback', 'vacant', false, 0.96, 'CAM-F1-1-01', NULL),
('spot-f1-1-10', 'fac-01', 'A-10', 1, 'bike', 'occupied', false, 0.93, 'CAM-F1-1-02', 'KA-04-BK-7744'),
('spot-f1-1-11', 'fac-01', 'A-11', 1, 'bike', 'vacant', false, 0.95, 'CAM-F1-1-03', NULL),
('spot-f1-1-12', 'fac-01', 'A-12', 1, 'bike', 'vacant', false, 0.96, 'CAM-F1-1-04', NULL),
('spot-f1-1-13', 'fac-01', 'A-13', 1, 'sedan', 'vacant', false, 0.94, 'CAM-F1-1-01', NULL),
('spot-f1-1-14', 'fac-01', 'A-14', 1, 'suv', 'vacant', false, 0.97, 'CAM-F1-1-02', NULL),
('spot-f1-1-15', 'fac-01', 'A-15', 1, 'sedan', 'vacant', false, 0.98, 'CAM-F1-1-03', NULL),
('spot-f1-1-16', 'fac-01', 'A-16', 1, 'hatchback', 'no_parking', false, 0.99, 'CAM-F1-1-04', NULL),
('spot-f1-1-17', 'fac-01', 'A-17', 1, 'ev', 'vacant', true, 0.96, 'CAM-F1-1-01', NULL),
('spot-f1-1-18', 'fac-01', 'A-18', 1, 'sedan', 'occupied', false, 0.95, 'CAM-F1-1-02', 'KA-03-ZZ-1100'),
('spot-f1-2-1', 'fac-01', 'B-01', 2, 'ev', 'vacant', true, 0.97, 'CAM-F1-2-01', NULL),
('spot-f1-2-2', 'fac-01', 'B-02', 2, 'ev', 'occupied', true, 0.98, 'CAM-F1-2-02', 'KA-01-EE-9090'),
('spot-f1-2-3', 'fac-01', 'B-03', 2, 'sedan', 'vacant', false, 0.96, 'CAM-F1-2-03', NULL),
('spot-f1-2-4', 'fac-01', 'B-04', 2, 'suv', 'vacant', false, 0.94, 'CAM-F1-2-04', NULL),
('spot-f1-2-5', 'fac-01', 'B-05', 2, 'hatchback', 'vacant', false, 0.95, 'CAM-F1-2-01', NULL),
('spot-f1-2-6', 'fac-01', 'B-06', 2, 'bike', 'vacant', false, 0.97, 'CAM-F1-2-02', NULL);

-- 5. Seed Demo Active Booking
INSERT INTO public.bookings (id, user_id, facility_id, spot_id, spot_number, floor, vehicle_plate, vehicle_model, vehicle_type, date, start_time, duration_hours, end_time, status, base_fee, platform_fee, taxes, valet_fee, discount, total, promo_code, valet_requested, valet_mode, valet_job_id)
VALUES (
  'SP-BKG-88412',
  'usr-9021',
  'fac-01',
  'spot-f1-1-1',
  'A-01',
  1,
  'KA-01-MJ-4029',
  'Tesla Model 3',
  'ev',
  CURRENT_DATE,
  '10:00',
  3,
  '13:00',
  'active',
  150.00,
  15.00,
  27.00,
  99.00,
  0.00,
  291.00,
  'WELCOME20',
  true,
  'on_the_way',
  'val-job-101'
);

-- 6. Seed Demo Valet Job
INSERT INTO public.valet_jobs (id, booking_id, user_id, user_name, user_phone, facility_id, facility_name, vehicle_plate, vehicle_model, mode, status, valet_id, valet_name, valet_phone, valet_vehicle, valet_avatar, pickup_lat, pickup_lng, pickup_address, is_safe_point, safe_spot_description, valet_lat, valet_lng, eta_minutes, otp, base_fee, distance_fee, rush_surcharge, total)
VALUES (
  'val-job-101',
  'SP-BKG-88412',
  'usr-9021',
  'Alex Morgan',
  '+91 98765 43210',
  'fac-01',
  'Cyber Park Multi-Level Hub',
  'KA-01-MJ-4029',
  'Tesla Model 3 (Pearl White)',
  'on_the_way',
  'arriving',
  'valet-01',
  'Rajesh Kumar',
  '+91 94481 22319',
  'Honda Activa 6G (KA-05-EV-9021)',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
  12.9712,
  77.5948,
  'Near Indian Oil Fuel Station, MG Road Corner',
  true,
  'Designated Fuel Station service lay-by (Safe & Legal Stop)',
  12.9724,
  77.5960,
  4,
  '6284',
  99.00,
  35.00,
  20.00,
  154.00
);
