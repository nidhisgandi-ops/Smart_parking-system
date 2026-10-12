import React from 'react';
import { NoParkingZone } from '../types';
import { AlertOctagon, CheckCircle2, ShieldAlert, ArrowRight, X, MapPin } from 'lucide-react';

interface NoParkingDetectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: {
    isViolation: boolean;
    zone?: NoParkingZone;
    nearestAlternative?: string;
    distanceToZoneMeters?: number;
    spotNumber?: string;
  } | null;
  onNavigateToAlternative?: () => void;
}

export const NoParkingDetectorModal: React.FC<NoParkingDetectorModalProps> = ({
  isOpen,
  onClose,
  result,
  onNavigateToAlternative,
}) => {
  if (!isOpen || !result) return null;

  const { isViolation, zone, nearestAlternative, spotNumber } = result;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all">
        {/* Header Ribbon */}
        <div
          className={`p-6 text-white ${
            isViolation ? 'bg-gradient-to-r from-red-600 to-rose-700' : 'bg-gradient-to-r from-emerald-600 to-teal-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-white/20">
              {isViolation ? (
                <>
                  <AlertOctagon size={14} />
                  NO PARKING VIOLATION
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  LEGAL PARKING PERMITTED
                </>
              )}
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-full bg-black/20 hover:bg-black/30 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <h3 className="text-xl font-extrabold tracking-tight">
            {isViolation
              ? spotNumber
                ? `Spot ${spotNumber} is a No-Parking Bay`
                : 'Warning: Active No-Parking Zone'
              : 'Safe & Legal Parking Zone'}
          </h3>
          <p className="text-xs text-white/80 mt-1">
            {isViolation
              ? 'Parking or stopping here carries penalties and immediate vehicle towing.'
              : 'Your GPS location is verified clear of tow-away zones.'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {isViolation ? (
            <>
              {/* Fine Card */}
              <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-300">
                    <ShieldAlert size={22} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide">
                      Statutory Penalty
                    </div>
                    <div className="text-xl font-black text-red-900 dark:text-red-100 mt-0.5">
                      {zone?.currency || '₹'}{zone?.fineAmount || 2000} Fine + Towing
                    </div>
                    <p className="text-xs text-red-700/80 dark:text-red-300/80 mt-1">
                      Enforced under Section 122 of Motor Vehicles Act & Municipal Traffic Police By-Laws.
                    </p>
                  </div>
                </div>
              </div>

              {/* Zone Details */}
              {zone && (
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                      Zone Name:
                    </span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{zone.name}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                      Enforcement Reason:
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{zone.reason}</p>
                  </div>
                </div>
              )}

              {/* Booking Block Notice */}
              {spotNumber && (
                <div className="text-xs font-medium bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-slate-700 dark:text-slate-300">
                  🚫 <strong>Booking is blocked:</strong> SmartPark system prohibits reserving spots inside municipal or emergency no-parking corridors.
                </div>
              )}

              {/* Nearest Legal Alternative */}
              {(nearestAlternative || zone?.legalAlternative) && (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                    <MapPin size={14} /> Nearest Legal Alternative
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                    {nearestAlternative || zone?.legalAlternative}
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                    Covered garage, CCTV monitored, legally authorized bays available.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="py-4 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto text-2xl">
                ✓
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                All Clear! No Violations Found
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
                No active municipal tow-away orders, fire corridors, or transit bus priority lanes detected at this location.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col gap-2">
            {isViolation && (
              <button
                onClick={() => {
                  onClose();
                  if (onNavigateToAlternative) onNavigateToAlternative();
                }}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30 transition-all"
              >
                <span>Navigate to Legal Alternative</span>
                <ArrowRight size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              {isViolation ? 'Dismiss Warning' : 'Got It'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
