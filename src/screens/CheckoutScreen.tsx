import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ParkingFacility, ParkingSpot, VehicleType, Booking } from '../types';
import { StripePaymentModal } from '../components/StripePaymentModal';
import { ETicketModal } from '../components/ETicketModal';
import {
  ArrowLeft,
  Car,
  MapPin,
  Clock,
  Calendar,
  Tag,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface CheckoutScreenProps {
  bookingDetails: {
    facility: ParkingFacility;
    spot: ParkingSpot;
    vehicleType: VehicleType;
    date: string;
    startTime: string;
    durationHours: number;
  };
  onBack: () => void;
  onBookingCompleted: (booking: Booking) => void;
}

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
  bookingDetails,
  onBack,
  onBookingCompleted,
}) => {
  const { user, selectedVehicle, createBooking, setActiveTab } = useApp();
  const { facility, spot, date, startTime, durationHours } = bookingDetails;

  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [valetModeAToggled, setValetModeAToggled] = useState(false); // Mode A: Valet at Destination
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Price calculations
  const baseParkingFee = facility.hourlyRate * durationHours;
  const platformFee = 15;
  const valetFee = valetModeAToggled ? 99 : 0;
  const subtotal = baseParkingFee + platformFee + valetFee;
  const discountAmount = promoApplied ? promoDiscount : 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxes = Math.round(taxableAmount * 0.18); // 18% GST
  const grandTotal = taxableAmount + taxes;

  // Compute end time
  const [startHour, startMin] = startTime.split(':').map(Number);
  const endHour = (startHour + durationHours) % 24;
  const endTime = `${String(endHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const code = promoCode.trim().toUpperCase();

    if (code === 'PARK20') {
      setPromoApplied(true);
      setPromoDiscount(Math.round(baseParkingFee * 0.2));
    } else if (code === 'SMARTVALET') {
      setPromoApplied(true);
      setPromoDiscount(99);
    } else if (code === 'FIRSTFREE') {
      setPromoApplied(true);
      setPromoDiscount(50);
    } else {
      setPromoError('Invalid promo code. Try "PARK20" or "SMARTVALET"');
    }
  };

  const handleStripeSuccess = (paymentDetails: { paymentIntentId: string; last4: string }) => {
    setIsStripeModalOpen(false);

    const newBooking: Booking = {
      id: `SP-BKG-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: user.id,
      facilityId: facility.id,
      facilityName: facility.name,
      facilityAddress: facility.address,
      spotId: spot.id,
      spotNumber: spot.spotNumber,
      floor: spot.floor,
      vehicle: selectedVehicle || user.savedVehicles[0],
      date,
      startTime,
      durationHours,
      endTime,
      status: 'confirmed',
      pricing: {
        baseFee: baseParkingFee,
        platformFee,
        taxes,
        valetFee,
        discount: discountAmount,
        total: grandTotal,
      },
      promoCode: promoApplied ? promoCode.toUpperCase() : undefined,
      valetRequested: valetModeAToggled,
      valetMode: valetModeAToggled ? 'destination' : undefined,
      createdAt: new Date().toISOString(),
    };

    createBooking(newBooking);
    setCompletedBooking(newBooking);
    setIsTicketModalOpen(true);
    onBookingCompleted(newBooking);
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
        <h2 className="text-base font-black text-slate-900 dark:text-white">
          Review & Pay
        </h2>
        <div className="w-9" />
      </div>

      {/* Booking Summary Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">
            FACILITY & BAY
          </span>
          <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
            {facility.name}
          </h3>
          <p className="text-xs text-slate-500 truncate mt-0.5">{facility.address}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Spot</span>
            <div className="text-lg font-black text-brand-600 dark:text-brand-400">
              {spot.spotNumber} (Floor {spot.floor})
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Vehicle</span>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mt-1">
              {selectedVehicle?.plateNumber || 'KA-01-MJ-4029'}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs py-1 border-t border-b border-slate-100 dark:border-slate-800">
          <span className="text-slate-500">Date & Window</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {date} • {startTime} - {endTime} ({durationHours} hrs)
          </span>
        </div>
      </div>

      {/* MODE A: VALET AT DESTINATION TOGGLE (Screen 8 requirement) */}
      <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/30 dark:to-purple-950/30 p-4 rounded-3xl border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-between">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 mt-0.5">
            🛵
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                Valet at Destination (Mode A)
              </h4>
              <span className="text-[10px] font-bold bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-1.5 py-0.2 rounded">
                +₹99
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
              When within 200m of the gate, request a valet to take over your car right at the porch.
            </p>
          </div>
        </div>

        <button
          onClick={() => setValetModeAToggled(!valetModeAToggled)}
          className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
            valetModeAToggled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform absolute top-0.5 ${
              valetModeAToggled ? 'right-0.5' : 'left-0.5'
            }`}
          />
        </button>
      </div>

      {/* PROMO CODE FIELD */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
          <span>Apply Promo Code</span>
          <span className="text-[10px] text-brand-600 dark:text-brand-400">Try "PARK20"</span>
        </div>

        <form onSubmit={handleApplyPromo} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="e.g. PARK20"
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold uppercase outline-none focus:ring-1 focus:ring-brand-500"
            />
            <Tag size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold transition-all"
          >
            Apply
          </button>
        </form>

        {promoApplied && (
          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <Sparkles size={12} />
            <span>Code applied! You saved ₹{promoDiscount}.</span>
          </div>
        )}

        {promoError && (
          <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
            {promoError}
          </div>
        )}
      </div>

      {/* ITEMIZED PRICE BREAKDOWN */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
        <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
          Price Breakdown
        </h4>

        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span>Parking Fee ({durationHours} hrs @ ₹{facility.hourlyRate}/hr)</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">₹{baseParkingFee}</span>
        </div>

        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span>Platform & CCTV Monitoring Fee</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">₹{platformFee}</span>
        </div>

        {valetModeAToggled && (
          <div className="flex justify-between text-indigo-600 dark:text-indigo-400 font-semibold">
            <span>Valet Service (Mode A)</span>
            <span>+₹{valetFee}</span>
          </div>
        )}

        {promoApplied && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
            <span>Promo Discount ({promoCode.toUpperCase()})</span>
            <span>-₹{discountAmount}</span>
          </div>
        )}

        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span>GST & Municipal Surcharges (18%)</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">₹{taxes}</span>
        </div>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
          <span className="font-extrabold text-sm text-slate-900 dark:text-white">Total Amount</span>
          <div className="text-xl font-black text-brand-600 dark:text-brand-400">₹{grandTotal}</div>
        </div>
      </div>

      {/* CHECKOUT BUTTON */}
      <button
        onClick={() => setIsStripeModalOpen(true)}
        className="w-full py-4 px-4 rounded-2xl font-black text-sm bg-brand-600 hover:bg-brand-700 text-white shadow-xl shadow-brand-600/30 transition-all flex items-center justify-center gap-2"
      >
        <span>Pay ₹{grandTotal} via Stripe Test</span>
      </button>

      {/* Stripe Test Modal */}
      <StripePaymentModal
        isOpen={isStripeModalOpen}
        onClose={() => setIsStripeModalOpen(false)}
        bookingSummary={{
          facilityName: facility.name,
          spotNumber: spot.spotNumber,
          vehiclePlate: selectedVehicle?.plateNumber || 'KA-01-MJ-4029',
          vehicleModel: selectedVehicle?.model || 'Tesla Model 3',
          durationHours,
          baseFee: baseParkingFee,
          platformFee,
          taxes,
          valetFee,
          discount: discountAmount,
          total: grandTotal,
        }}
        onPaymentSuccess={handleStripeSuccess}
      />

      {/* E-Ticket Display Modal */}
      <ETicketModal
        isOpen={isTicketModalOpen}
        onClose={() => {
          setIsTicketModalOpen(false);
          setActiveTab('bookings');
        }}
        booking={completedBooking}
        onViewAllBookings={() => {
          setIsTicketModalOpen(false);
          setActiveTab('bookings');
        }}
      />
    </div>
  );
};
