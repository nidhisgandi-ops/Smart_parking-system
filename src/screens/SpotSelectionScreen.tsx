import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SpotLayoutGrid } from '../components/SpotLayoutGrid';
import { ParkingFacility, ParkingSpot, VehicleType } from '../types';
import {
  Car,
  Zap,
  ArrowLeft,
  Clock,
  Calendar,
  ShieldAlert,
  CheckCircle2,
  ChevronRight,
  Flame,
} from 'lucide-react';

interface SpotSelectionScreenProps {
  facility: ParkingFacility;
  onBack: () => void;
  onProceedToCheckout: (bookingDetails: {
    facility: ParkingFacility;
    spot: ParkingSpot;
    vehicleType: VehicleType;
    date: string;
    startTime: string;
    durationHours: number;
  }) => void;
}

export const SpotSelectionScreen: React.FC<SpotSelectionScreenProps> = ({
  facility,
  onBack,
  onProceedToCheckout,
}) => {
  const {
    spots,
    selectedVehicle,
    setSelectedVehicle,
    user,
    holdSpotForBooking,
    heldSpot,
    heldTimeRemainingSeconds,
    releaseHeldSpot,
    checkLocationNoParking,
    setIsNoParkingModalOpen,
    cctvRunning,
  } = useApp();

  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleType>(
    selectedVehicle?.type || 'sedan'
  );
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<string>('11:00');
  const [durationHours, setDurationHours] = useState<number>(2);
  const [errorMessage, setErrorMessage] = useState('');

  const facilitySpots = spots.filter((s) => s.facilityId === facility.id);

  const vehicleOptions: { type: VehicleType; label: string; icon: string }[] = [
    { type: 'ev', label: 'EV', icon: '⚡' },
    { type: 'sedan', label: 'Sedan', icon: '🚙' },
    { type: 'suv', label: 'SUV', icon: '🚙' },
    { type: 'hatchback', label: 'Hatch', icon: '🚗' },
    { type: 'bike', label: 'Bike', icon: '🏍️' },
  ];

  const handleSelectSpot = (spot: ParkingSpot) => {
    setErrorMessage('');
    if (spot.status === 'no_parking') {
      checkLocationNoParking(facility.lat, facility.lng);
      return;
    }

    if (spot.status !== 'vacant') {
      setErrorMessage(`Spot ${spot.spotNumber} is currently occupied.`);
      return;
    }

    const success = holdSpotForBooking(spot);
    if (!success) {
      setErrorMessage('Unable to hold spot. It may have just been reserved.');
    }
  };

  const handleNoParkingClick = (spot: ParkingSpot) => {
    // Trigger No Parking Inspector for this spot
    checkLocationNoParking(facility.lat, facility.lng);
  };

  const handleProceed = () => {
    if (!heldSpot) {
      setErrorMessage('Please tap a green vacant spot in the layout to reserve.');
      return;
    }

    onProceedToCheckout({
      facility,
      spot: heldSpot,
      vehicleType: selectedVehicleType,
      date,
      startTime,
      durationHours,
    });
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="text-center">
          <h2 className="text-base font-black text-slate-900 dark:text-white truncate max-w-[220px]">
            {facility.name}
          </h2>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            Live CCTV Spot Allocation
          </span>
        </div>
        <div className="w-9" />
      </div>

      {/* 10-MINUTE HOLD ALERT BANNER (Screen 5 Requirement) */}
      {heldSpot && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-3.5 rounded-2xl text-white shadow-lg shadow-amber-500/25 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black text-sm">
              <Clock size={16} />
            </div>
            <div>
              <div className="text-xs font-black">
                Spot {heldSpot.spotNumber} (Floor {heldSpot.floor}) Locked!
              </div>
              <span className="text-[10px] text-white/90">
                Hold expires in: <strong className="font-mono">{formatTimer(heldTimeRemainingSeconds)}</strong>
              </span>
            </div>
          </div>
          <button
            onClick={releaseHeldSpot}
            className="text-[10px] font-bold bg-black/20 hover:bg-black/30 px-2 py-1 rounded-lg"
          >
            Change
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* VEHICLE TYPE SELECTOR (Screen 5: Only show compatible spots) */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
          <span>Select Vehicle Type</span>
          <span className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold">
            Filters Bay Dimensions
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {vehicleOptions.map((opt) => (
            <button
              key={opt.type}
              onClick={() => setSelectedVehicleType(opt.type)}
              className={`py-2 px-1 rounded-2xl text-center transition-all ${
                selectedVehicleType === opt.type
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-extrabold scale-102'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold'
              }`}
            >
              <span className="text-base block">{opt.icon}</span>
              <span className="text-[10px] block mt-0.5">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* FLOOR SWITCHER */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-500 pl-2">Select Garage Level:</span>
        <div className="flex gap-1">
          {facility.floors.map((fl) => (
            <button
              key={fl}
              onClick={() => setSelectedFloor(fl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors ${
                selectedFloor === fl
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Floor {fl}
            </button>
          ))}
        </div>
      </div>

      {/* 2D SPOT LAYOUT GRID WITH LIVE CCTV FEED (Screens 3 & 4) */}
      <SpotLayoutGrid
        spots={facilitySpots}
        selectedFloor={selectedFloor}
        selectedVehicleType={selectedVehicleType}
        onSelectSpot={handleSelectSpot}
        onNoParkingClick={handleNoParkingClick}
        heldSpotId={heldSpot?.id}
        isCCTVLive={cctvRunning}
      />

      {/* DATE, TIME & DURATION SELECTION */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
        <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          Schedule & Duration
        </h4>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Duration: <span className="text-brand-600 dark:text-brand-400 font-black">{durationHours} hours</span> (₹{facility.hourlyRate * durationHours})
          </label>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 6, 8].map((hrs) => (
              <button
                key={hrs}
                onClick={() => setDurationHours(hrs)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  durationHours === hrs
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {hrs}h
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PROCEED TO CHECKOUT BUTTON */}
      <button
        onClick={handleProceed}
        disabled={!heldSpot}
        className="w-full py-4 px-4 rounded-2xl font-black text-sm bg-brand-600 hover:bg-brand-700 text-white shadow-xl shadow-brand-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
      >
        <span>
          {heldSpot
            ? `Lock Spot ${heldSpot.spotNumber} • Proceed to Pay (₹${facility.hourlyRate * durationHours})`
            : 'Select a Vacant Spot to Continue'}
        </span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
};
