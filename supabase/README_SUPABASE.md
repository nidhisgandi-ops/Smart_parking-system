# 🔄 Supabase Database Restoration Guide for SmartPark

If you accidentally deleted your Supabase tables or database, follow these simple steps to restore all tables, RLS security policies, and seed data in under 1 minute.

---

### Step 1: Open Supabase SQL Editor
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your project.
3. In the left navigation bar, click on **SQL Editor** (the `>_` icon).

---

### Step 2: Run the Restoration Script
1. Click **"New query"**.
2. Copy the entire contents of [`supabase/schema.sql`](./schema.sql).
3. Paste it into the SQL Editor.
4. Click the green **"Run"** button (or press `Ctrl+Enter` / `Cmd+Enter`).

---

### Step 3: What Gets Created & Restored
The script automatically builds:
- ✅ **`profiles` table**: Demo user Alex Morgan with 4 saved vehicles (Tesla EV, Creta SUV, Honda City Sedan, Royal Enfield Bike).
- ✅ **`parking_facilities` table**: 4 tech-park & city-center facilities with GPS coordinates, pricing, and live camera support.
- ✅ **`parking_spots` table**: Pre-populated bay layouts (Floors 1 & 2) with EV chargers and bike bays.
- ✅ **`no_parking_zones` table**: Geofenced tow-away danger polygons with statutory fine data.
- ✅ **`bookings` table**: Active booking record for immediate testing.
- ✅ **`valet_jobs` table**: Active valet dispatch with pickup coordinates and handover OTP.
- ✅ **Row Level Security (RLS)**: Public demo access policies.
- ✅ **Realtime Publications**: Real-time replication enabled on `parking_spots`, `valet_jobs`, and `bookings`.

---

### Step 4: Connecting with SmartPark Frontend
In your project directory, copy `.env.example` to `.env`:

```env
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-public-key>
```
*(You can find both keys in your Supabase Dashboard under **Project Settings -> API**)*.

> **Note**: Even if your Supabase project is empty or disconnected, SmartPark includes built-in reactive local data persistence so all screens (Login, CCTV 2D layout, No-Parking radar, Booking, Stripe checkout, Valet tracking, E-tickets, and AI Concierge) work smoothly on first run.
