import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapComponent } from '../components/MapComponent';
import { ValetTrackingModal } from '../components/ValetTrackingModal';
import { ValetDriverInterface } from '../components/ValetDriverInterface';
import {
  ShieldCheck,
  MapPin,
  Clock,
  Car,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Phone,
  MessageSquare,
  Camera,
  Navigation,
} from 'lucide-react';

export const ValetScreen: React.FC = () => {
  const {
    user,
    switchRole,
    activeValetJob,
    activeBooking,
    requestValetOnTheWay,
    updateValetJobStatus,
    facilities,
    noParkingZones,
    userLocation,
    checkLocationNoParking,
    isDarkMode,
    getVacantSpotsCount,
  } = useApp();

  // Mode B request wizard states
  const [step, setStep] = useState<'request_wizard' | 'tracking'>('tracking');
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number }>({
    lat: userLocation.lat,
    lng: userLocation.lng,
  });
  const [pickupAddress, setPickupAddress] = useState(
    'Near Indian Oil Fuel Station, MG Road Corner'
  );
  const [safeStoppingPointType, setSafeStoppingPointType] = useState<
    'petrol_pump' | 'side_bay' | 'hotel_porch'
  >('petrol_pump');

  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  // If user role is 'valet', show Valet Driver Interface
  if (user.role === 'valet') {
    return (
      <div className="max-w-md mx-auto p-4 pb-28">
        <ValetDriverInterface
          activeJob={activeValetJob}
          onUpdateJobStatus={updateValetJobStatus}
          onExitValetMode={() => switchRole('user')}
        />
      </div>
    );
  }

  // Handle Dragging pickup location pin and test against No Parking Zones
  const handlePickupDrag = (coords: { lat: number; lng: number }) => {
    setPickupCoords(coords);
    const noParkCheck = checkLocationNoParking(coords.lat, coords.lng);
    if (noParkCheck.isViolation) {
      setPickupAddress(`⚠️ Violation Warning: Inside ${noParkCheck.zone?.name || 'No-Parking Area'}`);
    } else {
      setPickupAddress('Safe Lay-by Point (GPS Calibrated)');
    }
  };

  const handleConfirmSendValet = () => {
    // Check if pickup is in no parking zone
    const check = checkLocationNoParking(pickupCoords.lat, pickupCoords.lng);
    if (check.isViolation) {
      alert('Pickup point is inside a no-parking zone! Please move the pin to a legal safe stopping area.');
      return;
    }

    const bkgId = activeBooking?.id || 'SP-BKG-88412';
    const safeDesc =
      safeStoppingPointType === 'petrol_pump'
        ? 'Petrol Pump Service Bay (Legal Stop)'
        : safeStoppingPointType === 'side_bay'
        ? 'Designated Service Road Bay'
        : 'Hotel Porch Lay-by';

    requestValetOnTheWay(bkgId, {
      lat: pickupCoords.lat,
      lng: pickupCoords.lng,
      address: pickupAddress,
      isSafePoint: true,
      safeSpotDescription: safeDesc,
    });

    setStep('tracking');
    setIsTrackingModalOpen(true);
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            SmartPark Valet Service
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Doorstep vehicle pickup in traffic & destination handover
          </p>
        </div>

        {/* Switch to Valet Driver view shortcut */}
        <button
          onClick={() => switchRole('valet')}
          className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:bg-slate-200"
          title="Switch to Valet Driver Mode"
        >
          🛵 Driver Mode
        </button>
      </div>

      {/* If Active Valet Job Exists */}
      {activeValetJob && activeValetJob.status !== 'completed' && activeValetJob.status !== 'cancelled' ? (
        <div className="space-y-4">
          {/* Valet Status Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300">
                {activeValetJob.status.replace(/_/g, ' ')}
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">
                #{activeValetJob.id}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={activeValetJob.valetAvatar}
                alt={activeValetJob.valetName}
                className="w-13 h-13 rounded-full object-cover border-2 border-brand-500"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                  {activeValetJob.valetName}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {activeValetJob.valetVehicle}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[11px] font-bold text-amber-500">
                  <span>★ {activeValetJob.valetRating}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-brand-600 dark:text-brand-400">
                    {activeValetJob.etaMinutes} mins ETA
                  </span>
                </div>
              </div>
            </div>

            {/* Handover OTP Box */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase block">
                  HANDOVER OTP (SHOW TO VALET)
                </span>
                <span className="text-xl font-mono font-black text-slate-900 dark:text-white tracking-widest">
                  {activeValetJob.otp}
                </span>
              </div>
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 text-right max-w-[120px]">
                Required for custody transfer
              </span>
            </div>

            {/* Action buttons */}
            <button
              onClick={() => setIsTrackingModalOpen(true)}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-brand-600/25 flex items-center justify-center gap-1.5 transition-all"
            >
              <span>View Live Map Tracking & Vehicle Photos</span>
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Interactive Live Map of Valet Movement */}
          <div className="rounded-3xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800">
            <MapComponent
              facilities={facilities}
              selectedFacility={null}
              onSelectFacility={() => {}}
              noParkingZones={noParkingZones}
              userLocation={userLocation}
              valetLocation={activeValetJob.currentValetLocation}
              pickupLocation={activeValetJob.pickupLocation}
              getVacantSpotsCount={getVacantSpotsCount}
              className="h-72 w-full"
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      ) : (
        /* If No Active Valet Job: Dispatch Setup Form (Mode B Wizard) */
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                ON-DEMAND VALET DISPATCH
              </span>
              <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                Valet on the Way (Stuck in Traffic)
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                Running late? Hand over your keys anywhere within 3 km of your destination. Our vetted valet parks your car in your reserved bay.
              </p>
            </div>

            {/* Map with Draggable Pickup Pin */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Drag Pin to Set Pickup Point:
              </label>
              <div className="rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700">
                <MapComponent
                  facilities={facilities}
                  selectedFacility={null}
                  onSelectFacility={() => {}}
                  noParkingZones={noParkingZones}
                  userLocation={userLocation}
                  pickupLocation={pickupCoords}
                  isDraggablePickup={true}
                  onPickupDrag={handlePickupDrag}
                  getVacantSpotsCount={getVacantSpotsCount}
                  className="h-56 w-full"
                  isDarkMode={isDarkMode}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Pin Location: {pickupAddress}
              </p>
            </div>

            {/* SAFE STOPPING POINT SELECTION & NO-PARKING WARNING (Screen 8 requirement) */}
            <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/80 rounded-2xl space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                <AlertTriangle size={15} />
                <span>SAFE HANDOVER MANDATE</span>
              </div>
              <p className="text-[11px] text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
                Do not stop in a no-parking or moving traffic lane. Choose a safe stopping bay before the valet arrives.
              </p>

              <div className="grid grid-cols-3 gap-1.5 pt-1 text-[11px]">
                {[
                  { key: 'petrol_pump', label: '⛽ Petrol Pump Bay' },
                  { key: 'side_bay', label: '🅿️ Side Service Bay' },
                  { key: 'hotel_porch', label: '🏨 Hotel Porch' },
                ].map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setSafeStoppingPointType(s.key as any)}
                    className={`p-2 rounded-xl text-center font-bold transition-all ${
                      safeStoppingPointType === s.key
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Price Breakdown for Valet (Screen 8: base + distance + surcharge) */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Base Valet Service Fee</span>
                <span>₹99</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Valet Distance Fee (1.2 km scooter dispatch)</span>
                <span>₹35</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Rush-Hour Traffic Surcharge</span>
                <span>₹20</span>
              </div>
              <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700 flex justify-between font-black text-sm text-slate-900 dark:text-white">
                <span>Total Valet Fee</span>
                <span className="text-brand-600 dark:text-brand-400">₹154</span>
              </div>
              <div className="text-[10px] text-slate-500 pt-0.5">
                Estimated Valet Arrival: <strong>6 minutes</strong>
              </div>
            </div>

            {/* Confirm Send Valet Button */}
            <button
              onClick={handleConfirmSendValet}
              className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-brand-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <span>Confirm & Dispatch Valet (₹154)</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Valet Live Tracking & Verification Modal */}
      {activeValetJob && (
        <ValetTrackingModal
          job={activeValetJob}
          onUpdateStatus={(status, extra) => updateValetJobStatus(activeValetJob.id, status, extra)}
          onCancelJob={(fee) => {
            updateValetJobStatus(activeValetJob.id, 'cancelled', { cancellationFee: fee });
            setIsTrackingModalOpen(false);
          }}
          onRequestCarReturn={() => {
            updateValetJobStatus(activeValetJob.id, 'ready_for_return');
            alert('Car return requested! Valet will drive your car to the ground floor exit gate.');
          }}
          isOpen={isTrackingModalOpen}
          onClose={() => setIsTrackingModalOpen(false)}
        />
      )}
    </div>
  );
};
