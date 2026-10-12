# SmartPark 🚗⚡
### Real-Time CCTV Parking Platform, No-Parking Detector & On-Demand Valet Service

SmartPark is a modern, mobile-first web application built with **React, Vite, TypeScript, and Tailwind CSS**. It features simulated CCTV AI computer-vision spot detection, geofenced No-Parking zone enforcement with statutory fine alerts, an on-demand scooter valet service for drivers stuck in traffic, Stripe test payments, dynamic QR-code e-tickets, and an AI parking concierge.

---

## 🌟 Key Features & User Flow

### 1. CCTV AI Vision Spot Detection (Simulated & Extensible)
- **Computer-Vision Architecture**: Clean `ICCTVDetector` interface in `src/services/cctvSimulator.ts` ready to connect real RTSP/YOLOv8 camera streams.
- **Real-Time Flips**: Background engine randomly flips bay statuses between `vacant` and `occupied` every few seconds with AI confidence scores (e.g. 96.4%) and camera IDs (`CAM-ZONE1-E4`).
- **Garage Layout Grid**: Realistic 2D multi-level parking garage visualizer (Floors 1 & 2, Driveway Aisles, EV Fast Charger bays, Two-Wheeler bays).

### 2. No-Parking Detector (Flagship Safety Feature)
- **Geofenced Danger Polygons**: High-risk zones (Emergency Fire Hydrant corridors, BRTS transit lanes, VIP convoy gates) highlighted with red dashed overlays on Leaflet maps.
- **Violation Alert Modal**: Shows exact statutory penalty (**₹2,000 / $150 Fine + Commercial Towing** under Sec 122 MVA), violation rationale, and **"Navigate to Nearest Legal Alternative"** button.
- **Booking Guard**: Hard-blocks booking of any spot inside or near an emergency no-parking corridor.
- **"Check This Location" Radar**: One-tap GPS scanner that tests the user's live coordinates against municipal tow-away geofences.

### 3. Vehicle Sizing & 10-Minute Slot Hold
- **Compatible Spot Filter**: Select between **EV ⚡, Sedan 🚙, SUV 🚙, Hatchback 🚗, and Two-Wheeler 🏍️**. Incompatible bays are automatically filtered or disabled.
- **10-Minute Hold Lock**: Tapping a vacant spot locks the bay with a live countdown timer (`09:59`) preventing other drivers from grabbing it while checking out.

### 4. Stripe Test Checkout & Dynamic E-Tickets
- **Stripe Payments**: Test cards quick-filler (`4242...`, 3D-Secure challenge simulation, test decline triggers).
- **Promo Codes**: Instant discounts using codes like `PARK20` (20% off) or `SMARTVALET` (Free Valet).
- **Digital Pass with QR Code**: Generates dynamic QR pass using the `qrcode` library with gate tokens, spot number, license plate, and print/PDF export.

### 5. On-Demand Valet Service (Two Modes)
- **Mode A (Valet at Destination)**: Toggle on checkout to meet a valet at the facility porch upon arrival (within 200m).
- **Mode B (Valet on the Way - "Running Late?")**:
  - Activates when user has an active booking and their GPS is within 3 km of the facility.
  - Draggable pickup pin with **Safe Handover Point validation** (Petrol pump bay, service road, hotel porch) and no-parking warning.
  - Live animated scooter tracking on Leaflet map.
  - In-app calling and chat with quick message chips.
  - **4-Digit Handover OTP**: Valet cannot accept custody without customer entering the OTP.
  - **5-Angle Condition Inspection Photos**: Front, Rear, Left, Right, Dashboard odometer/fuel.
  - **Parked in Bay Photo**: Verified photo uploaded once vehicle is parked.
  - **"Request My Car"** return delivery button.
- **Dedicated Valet Driver Interface**: Role switcher to view incoming dispatches, accept jobs, verify OTPs, and capture vehicle photos.

### 6. Cancellation & Transparent Refund Policy
- **> 1 hour before scheduled start**: 100% full refund.
- **Within 1 hour of scheduled start**: 50% partial refund.
- **After check-in time**: 0% non-refundable.
- Instant refund calculation preview modal before confirming cancellation.

### 7. AI Parking Concierge & 24/7 Helpline
- Floating action assistant with real-time context on active bookings, spot numbers, and valet status.
- Toll-free emergency road assistance and on-site facility security dialers.
- Searchable parking FAQ accordion.

### 8. Admin Dashboard
- Live facility telemetry, manual spot status override (Vacant, Occupied, No-Parking), CCTV speed controls, and rush-hour occupancy spike generator.

---

## 🛠️ Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Maps**: Leaflet + OpenStreetMap (No API keys required)
- **Database & Realtime**: Supabase client (`@supabase/supabase-js`) + local reactive state sync fallback
- **Payments**: Stripe Test Simulation
- **QR Codes**: `qrcode` library
- **Icons**: Lucide React
- **Celebrations**: `canvas-confetti`

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Build for production
npm run build
```

The application will be running at `http://localhost:5173/`.

---

## 🗄️ Supabase Database Schema
To connect your live Supabase project, execute the SQL script in `supabase/schema.sql` in your Supabase SQL Editor and add your keys to `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
Even without setting up cloud credentials, SmartPark runs 100% locally out-of-the-box with realistic mock data, persistent localStorage, and CCTV simulation!
