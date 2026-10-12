import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Booking } from '../types';
import { ETicketModal } from '../components/ETicketModal';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Car,
  QrCode,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';

export const MyBookingsScreen: React.FC = () => {
  const { bookings, cancelBooking, setActiveTab, activeValetJob } = useApp();
  const [selectedBookingForTicket, setSelectedBookingForTicket] = useState<Booking | null>(null);
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('Change of plans');
  const [cancellationResult, setCancellationResult] = useState<{
    refundAmount: number;
    refundPercent: number;
    message: string;
  } | null>(null);

  // Compute preview refund for modal
  const getRefundPreview = (booking: Booking) => {
    const now = new Date();
    const [hours, mins] = booking.startTime.split(':').map(Number);
    const bookingStartTime = new Date(booking.date);
    bookingStartTime.setHours(hours, mins, 0, 0);

    const diffMinutes = (bookingStartTime.getTime() - now.getTime()) / (1000 * 60);

    let percent = 0;
    if (diffMinutes > 60) {
      percent = 100;
    } else if (diffMinutes > 0 && diffMinutes <= 60) {
      percent = 50;
    } else {
      percent = 0;
    }

    const refundAmount = Math.round((booking.pricing.total * percent) / 100);
    return { percent, refundAmount, diffMinutes };
  };

  const handleConfirmCancel = () => {
    if (!cancelModalBooking) return;
    const res = cancelBooking(cancelModalBooking.id, cancelReason);
    const preview = getRefundPreview(cancelModalBooking);
    setCancellationResult({
      refundAmount: res.refundAmount,
      refundPercent: preview.percent,
      message: res.message,
    });
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 pb-28">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
          My Parking Bookings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Access active digital e-tickets, CCTV gate passes, and cancel reservations.
        </p>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <Ticket size={40} className="mx-auto text-slate-300 dark:text-slate-600" />
          <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
            No Bookings Found
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            Explore nearby parking facilities on the map and book your bay in 2 taps.
          </p>
          <button
            onClick={() => setActiveTab('home')}
            className="py-2.5 px-5 bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-brand-700 transition-all"
          >
            Find Parking Spots
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {bookings.map((booking) => {
            const isActive = booking.status === 'confirmed' || booking.status === 'active';
            const isCancelled = booking.status === 'cancelled';

            return (
              <div
                key={booking.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border transition-all shadow-sm space-y-3.5 ${
                  isActive
                    ? 'border-brand-200 dark:border-brand-900/60 ring-1 ring-brand-500/20'
                    : 'border-slate-200 dark:border-slate-800 opacity-90'
                }`}
              >
                {/* Status Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : isCancelled
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {booking.status}
                    </span>
                    <span className="font-mono text-xs text-slate-400 font-bold">
                      #{booking.id}
                    </span>
                  </div>

                  <div className="text-xs font-black text-slate-900 dark:text-white">
                    ₹{booking.pricing.total}
                  </div>
                </div>

                {/* Facility & Spot Info */}
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {booking.facilityName}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    <MapPin size={12} className="shrink-0" />
                    <span className="truncate">{booking.facilityAddress}</span>
                  </div>
                </div>

                {/* Bay & Timing Badges */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Spot</span>
                    <div className="font-extrabold text-brand-600 dark:text-brand-400 text-sm">
                      {booking.spotNumber} (Floor {booking.floor})
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Schedule</span>
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-xs mt-0.5">
                      {booking.startTime} - {booking.endTime}
                    </div>
                  </div>
                </div>

                {/* Vehicle Plate */}
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-0.5">
                  <span className="flex items-center gap-1.5">
                    <Car size={14} />
                    <span>{booking.vehicle.plateNumber}</span>
                  </span>
                  <span>{booking.date}</span>
                </div>

                {/* If Valet Add-On active */}
                {booking.valetRequested && (
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-between text-xs text-indigo-700 dark:text-indigo-300">
                    <span className="flex items-center gap-1 font-bold">
                      <span>🛵</span> Valet Service Attached
                    </span>
                    <button
                      onClick={() => setActiveTab('valet')}
                      className="text-[11px] font-extrabold underline"
                    >
                      Track Valet →
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setSelectedBookingForTicket(booking)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-brand-600/25 transition-all"
                  >
                    <QrCode size={14} />
                    <span>View E-Ticket</span>
                  </button>

                  {isActive && (
                    <button
                      onClick={() => {
                        setCancelModalBooking(booking);
                        setCancellationResult(null);
                      }}
                      className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/60 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* E-TICKET QR MODAL */}
      <ETicketModal
        isOpen={Boolean(selectedBookingForTicket)}
        onClose={() => setSelectedBookingForTicket(null)}
        booking={selectedBookingForTicket}
        onViewAllBookings={() => setSelectedBookingForTicket(null)}
      />

      {/* CANCELLATION & REFUND POLICY MODAL (Screen 9 Requirement) */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Cancel Reservation
            </h3>

            {!cancellationResult ? (
              <>
                {/* Transparent Refund Policy Preview (Screen 9) */}
                {(() => {
                  const preview = getRefundPreview(cancelModalBooking);
                  return (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        REFUND ESTIMATION (POLICY)
                      </span>
                      <div className="flex items-baseline justify-between">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          Applicable Refund:
                        </span>
                        <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                          ₹{preview.refundAmount}{' '}
                          <span className="text-xs font-semibold">({preview.percent}%)</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-200 dark:border-slate-700 pt-2">
                        • Over 1 hour before start: 100% full refund
                        <br />
                        • Within 1 hour of start: 50% partial refund
                        <br />
                        • After check-in start time: 0% refund
                      </p>
                    </div>
                  );
                })()}

                {/* Reason Selector */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Reason for Cancellation
                  </label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none"
                  >
                    <option value="Change of plans">Change of plans</option>
                    <option value="Found alternative spot">Found alternative spot</option>
                    <option value="Traffic congestion">Traffic congestion / Delayed</option>
                    <option value="Booked wrong facility">Booked wrong facility</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setCancelModalBooking(null)}
                    className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Keep Booking
                  </button>
                  <button
                    onClick={handleConfirmCancel}
                    className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    Confirm Cancel
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center space-y-3 py-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Booking Cancelled
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {cancellationResult.message}
                </p>
                <button
                  onClick={() => setCancelModalBooking(null)}
                  className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-xs mt-2"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
