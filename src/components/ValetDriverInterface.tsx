import React, { useState } from 'react';
import { ValetJob, ValetStatus } from '../types';
import {
  Navigation,
  KeyRound,
  Camera,
  CheckCircle2,
  DollarSign,
  MapPin,
  Car,
  Phone,
  Power,
  Shield,
  Upload,
  AlertCircle,
} from 'lucide-react';

interface ValetDriverInterfaceProps {
  activeJob: ValetJob | null;
  onUpdateJobStatus: (jobId: string, status: ValetStatus, extra?: Partial<ValetJob>) => void;
  onExitValetMode: () => void;
}

export const ValetDriverInterface: React.FC<ValetDriverInterfaceProps> = ({
  activeJob,
  onUpdateJobStatus,
  onExitValetMode,
}) => {
  const [isOnline, setIsOnline] = useState(true);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [photoStage, setPhotoStage] = useState<'pickup' | 'parked'>('pickup');
  const [uploadedPhotos, setUploadedPhotos] = useState<{ [key: string]: boolean }>({
    front: true,
    back: true,
    left: true,
    right: true,
    dashboard: true,
  });

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeJob) return;

    if (enteredOtp.trim() === activeJob.otp) {
      setOtpError('');
      onUpdateJobStatus(activeJob.id, 'otp_verified', {
        pickupConfirmedByUser: true,
      });
    } else {
      setOtpError('Invalid OTP code. Ask customer for their 4-digit app OTP.');
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-900 text-white rounded-3xl p-5 shadow-2xl border border-slate-800 space-y-5">
      {/* Driver Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256"
              alt="Valet Rajesh"
              className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400"
            />
            <span
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                isOnline ? 'bg-emerald-400' : 'bg-rose-500'
              }`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base">Rajesh Kumar</h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">
                DRIVER MODE
              </span>
            </div>
            <p className="text-xs text-slate-400">Honda Activa 6G • ★ 4.95 Rating</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`p-2.5 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all ${
              isOnline ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Power size={14} />
            <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </button>
          <button
            onClick={onExitValetMode}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Exit Mode
          </button>
        </div>
      </div>

      {/* Driver Earnings & Stats Bar */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Today's Payout</span>
          <div className="text-lg font-black text-emerald-400">₹840</div>
        </div>
        <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Trips Done</span>
          <div className="text-lg font-black text-white">6</div>
        </div>
        <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Acceptance</span>
          <div className="text-lg font-black text-brand-400">98%</div>
        </div>
      </div>

      {/* Active Job Dispatch Workflow */}
      {activeJob ? (
        <div className="space-y-4">
          {/* Job Overview Card */}
          <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1">
                <Shield size={14} /> ACTIVE DISPATCH #{activeJob.id}
              </span>
              <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800">
                Fare: ₹{activeJob.pricing.total}
              </span>
            </div>

            <div>
              <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                <Car size={18} className="text-brand-400" />
                <span>{activeJob.vehicleModel}</span>
              </h4>
              <p className="text-xs font-mono text-brand-300 tracking-wide mt-0.5">
                Plate: {activeJob.vehiclePlate} • Customer: {activeJob.userName}
              </p>
            </div>

            {/* Pickup Location details */}
            <div className="p-3 bg-slate-900 rounded-xl space-y-1 text-xs">
              <div className="flex items-start gap-1.5">
                <MapPin size={15} className="text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400">Pickup Location:</span>
                  <p className="font-semibold text-slate-200">{activeJob.pickupLocation.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-1.5 pt-1">
                <Navigation size={15} className="text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400">Target Facility:</span>
                  <p className="font-semibold text-slate-200">{activeJob.facilityName}</p>
                </div>
              </div>
            </div>

            {/* Current Step Controls */}
            {activeJob.status === 'assigned' && (
              <button
                onClick={() => onUpdateJobStatus(activeJob.id, 'arriving')}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
              >
                <Navigation size={15} />
                <span>Start Navigation to Customer (Arriving)</span>
              </button>
            )}

            {activeJob.status === 'arriving' && (
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300">
                  You have arrived at the pickup location. Request the 4-digit OTP shown on the customer's phone.
                </div>

                {otpError && (
                  <div className="p-2.5 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-1.5">
                    <AlertCircle size={14} />
                    <span>{otpError}</span>
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    placeholder="Enter Customer 4-digit OTP"
                    className="flex-1 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm tracking-widest text-center outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
                  >
                    Verify OTP
                  </button>
                </form>
              </div>
            )}

            {activeJob.status === 'otp_verified' && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 size={16} />
                  <span>OTP Verified! Take 5-Angle Condition Inspection Photos</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {['Front', 'Back', 'Left Side', 'Right Side', 'Dashboard Fuel'].map((angle) => (
                    <div
                      key={angle}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-between"
                    >
                      <span>{angle}</span>
                      <span className="text-emerald-400 font-bold">✓ Captured</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onUpdateJobStatus(activeJob.id, 'driving_to_facility')}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
                >
                  <Car size={15} />
                  <span>Drive Vehicle to Facility Hub</span>
                </button>
              </div>
            )}

            {activeJob.status === 'driving_to_facility' && (
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-indigo-950/60 border border-indigo-800 rounded-xl text-xs text-indigo-300">
                  Driving customer vehicle to {activeJob.facilityName}. Live GPS telemetry is being streamed to customer.
                </div>

                <button
                  onClick={() => onUpdateJobStatus(activeJob.id, 'parked')}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  <CheckCircle2 size={16} />
                  <span>Vehicle Parked in Bay (Upload Parked Photo)</span>
                </button>
              </div>
            )}

            {activeJob.status === 'parked' && (
              <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-xl text-center space-y-2">
                <CheckCircle2 size={32} className="text-emerald-400 mx-auto" />
                <h5 className="font-extrabold text-sm text-white">Vehicle Safely Parked</h5>
                <p className="text-xs text-slate-300">
                  Parked in bay. Waiting for customer return request.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-slate-400 space-y-3">
          <Car size={40} className="mx-auto text-slate-600" />
          <h4 className="text-base font-bold text-white">No Active Valet Request</h4>
          <p className="text-xs max-w-xs mx-auto">
            You are online and ready to receive dispatch calls within 3 km of Cyber Park.
          </p>
        </div>
      )}
    </div>
  );
};
