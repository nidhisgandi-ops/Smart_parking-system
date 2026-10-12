import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Booking } from '../types';
import { Download, Share2, MapPin, Calendar, Clock, Car, Check, X, Printer } from 'lucide-react';

interface ETicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onViewAllBookings: () => void;
}

export const ETicketModal: React.FC<ETicketModalProps> = ({
  isOpen,
  onClose,
  booking,
  onViewAllBookings,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const ticketRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!booking) return;

    // Generate dynamic QR containing booking verification payload
    const payload = JSON.stringify({
      bkgId: booking.id,
      spot: booking.spotNumber,
      plate: booking.vehicle.plateNumber,
      validUntil: booking.endTime,
      cctvToken: `SEC-TOK-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
    });

    QRCode.toDataURL(payload, {
      width: 200,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating QR:', err));
  }, [booking]);

  if (!isOpen || !booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(booking.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto">
        {/* Ticket Top Banner */}
        <div className="bg-brand-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-white/20">
              <Car size={18} />
            </span>
            <div>
              <h3 className="font-extrabold text-base leading-none">SmartPark Pass</h3>
              <span className="text-[10px] text-white/80">CCTV Verified Access</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-black/20 hover:bg-black/30 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Printable Ticket Pass Container */}
        <div ref={ticketRef} className="p-6 space-y-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 print:p-0">
          {/* Facility Info */}
          <div>
            <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">
              PARKING FACILITY
            </span>
            <h4 className="text-lg font-black tracking-tight mt-0.5">{booking.facilityName}</h4>
            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <MapPin size={13} className="text-slate-400 shrink-0" />
              <span className="truncate">{booking.facilityAddress}</span>
            </div>
          </div>

          {/* Large Bay Badge & Floor */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Assigned Spot</span>
              <div className="text-2xl font-black text-brand-600 dark:text-brand-400">
                {booking.spotNumber}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Level / Floor</span>
              <div className="text-2xl font-black text-slate-800 dark:text-slate-200">
                L{booking.floor}
              </div>
            </div>
          </div>

          {/* Vehicle & Timing Details */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Vehicle</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {booking.vehicle.plateNumber} ({booking.vehicle.model})
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Date</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{booking.date}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Entry - Exit Window</span>
              <span className="font-bold text-brand-600 dark:text-brand-400">
                {booking.startTime} - {booking.endTime} ({booking.durationHours} hrs)
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Booking ID</span>
              <span
                onClick={handleCopyId}
                className="font-mono font-bold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1 hover:text-brand-600"
              >
                {booking.id}
                {copied ? <Check size={12} className="text-emerald-500" /> : null}
              </span>
            </div>
          </div>

          {/* Dashed Perforation Line */}
          <div className="relative py-1">
            <div className="border-b-2 border-dashed border-slate-300 dark:border-slate-700"></div>
            <div className="absolute -left-9 -top-2.5 w-6 h-6 rounded-full bg-slate-900/80"></div>
            <div className="absolute -right-9 -top-2.5 w-6 h-6 rounded-full bg-slate-900/80"></div>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Ticket QR Code"
                className="w-36 h-36 rounded-xl shadow-sm bg-white p-2"
              />
            ) : (
              <div className="w-36 h-36 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
            )}
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-2 text-center">
              Scan at facility boom barrier for automated CCTV gate release
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700/80 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handlePrint}
              className="py-2.5 px-3 rounded-xl font-bold text-xs bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download size={14} />
              <span>Save / Print PDF</span>
            </button>
            <button
              onClick={onViewAllBookings}
              className="py-2.5 px-3 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-brand-600/30"
            >
              <span>My Bookings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
