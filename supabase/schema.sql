-- ==============================================================================
-- SMARTPARK SUPABASE SCHEMA (PostgreSQL)
-- Includes Tables, RLS Policies, Realtime Publications, and CCTV Indexes
-- ==============================================================================

-- 1. Profiles Table (Extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'valet', 'admin')),
  saved_vehicles JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Parking Facilities
CREATE TABLE IF NOT EXISTS public.parking_facilities (
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Parking Spots (Realtime CCTV Detected Bay Status)
CREATE TABLE IF NOT EXISTS public.parking_spots (
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
  held_by_user_id UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. No-Parking Zones (Geofenced polygons & legal fine info)
CREATE TABLE IF NOT EXISTS public.no_parking_zones (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  fine_amount NUMERIC(10, 2) NOT NULL DEFAULT 2000.00,
  currency TEXT DEFAULT '₹',
  description TEXT,
  reason TEXT,
  legal_alternative TEXT,
  coordinates JSONB NOT NULL, -- Array of [lat, lng]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Bookings
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
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

-- 6. Valet Jobs
CREATE TABLE IF NOT EXISTS public.valet_jobs (
  id TEXT PRIMARY KEY,
  booking_id TEXT REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  valet_id UUID REFERENCES public.profiles(id),
  valet_name TEXT,
  valet_phone TEXT,
  valet_vehicle TEXT,
  mode TEXT NOT NULL CHECK (mode IN ('destination', 'on_the_way')),
  status TEXT NOT NULL DEFAULT 'requested' CHECK (
    status IN ('requested', 'assigned', 'arriving', 'otp_verified', 'vehicle_received', 'driving_to_facility', 'parked', 'ready_for_return', 'completed', 'cancelled')
  ),
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
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.no_parking_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.valet_jobs ENABLE ROW LEVEL SECURITY;

-- Facilities & Spots & No-Parking zones are readable by everyone
CREATE POLICY "Public read facilities" ON public.parking_facilities FOR SELECT USING (true);
CREATE POLICY "Public read spots" ON public.parking_spots FOR SELECT USING (true);
CREATE POLICY "Public read no parking zones" ON public.no_parking_zones FOR SELECT USING (true);

-- User Profiles: users can read and update their own profiles
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Bookings: Users only see their own bookings
CREATE POLICY "Users select own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = user_id);

-- Valet Jobs: User who booked or assigned valet can read and update
CREATE POLICY "Users or valets view job" ON public.valet_jobs FOR SELECT USING (auth.uid() = user_id OR auth.uid() = valet_id);
CREATE POLICY "Users or valets update job" ON public.valet_jobs FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = valet_id);

-- ==============================================================================
-- REALTIME REPLICATION ENABLEMENT
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.parking_spots;
ALTER PUBLICATION supabase_realtime ADD TABLE public.valet_jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
