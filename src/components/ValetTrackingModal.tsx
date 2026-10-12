import React, { useState } from 'react';
import { ValetJob, ValetStatus } from '../types';
import {
  Phone,
  MessageSquare,
  ShieldCheck,
  Camera,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Car,
  ChevronRight,
  Send,
  X,
  UserCheck,
  KeyRound,
  RotateCcw,
} from 'lucide-react';

interface ValetTrackingModalProps {
  job: ValetJob;
  onUpdateStatus: (status: ValetStatus, extra?: Partial<ValetJob>) => void;
  onCancelJob: (fee: number) => void;
  onRequestCarReturn: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const TIMELINE_STEPS: { key: ValetStatus; label: string }[] = [
  { key: 'requested', label: 'Requested' },
  { key: 'assigned', label: 'Valet Assigned' },
  { key: 'arriving', label: 'Valet Arriving' },
  { key: 'otp_verified', label: 'OTP Verified' },
  { key: 'vehicle_received', label: 'Vehicle Received' },
  { key: 'driving_to_facility', label: 'Driving to Hub' },
  { key: 'parked', label: 'Safely Parked' },
  { key: 'ready_for_return', label: 'Ready for Return' },
];

export const ValetTrackingModal: React.FC<ValetTrackingModalProps> = ({
  job,
  onUpdateStatus,
  onCancelJob,
  onRequestCarReturn,
  isOpen,
  onClose,
}) => {
  const [activeSubView, setActiveSubView] = useState<'main' | 'chat' | 'call' | 'photos' | 'cancel'>('main');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'valet'; text: string; time: string }>>([
    {
      sender: 'valet',
      text: `Hello ${job.userName}! I'm Rajesh, your assigned SmartPark valet. I'm riding on my scooter towards your pickup point.`,
      time: 'Just now',
    },
  ]);
  const [inputChat, setInputChat] = useState('');
  const [callDuration, setCallDuration] = useState(12);

  if (!isOpen) return null;

  const currentStepIndex = TIMELINE_STEPS.findIndex((s) => s.key === job.status);

  // Cancellation fee calculation
  const getCancellationFee = (): number => {
    if (job.status === 'requested') return 0;
    if (job.status === 'assigned') return 30;
    if (job.status === 'arriving') return 55;
    if (job.status === 'otp_verified' || job.status === 'vehicle_received') return job.pricing.total;
    return 0;
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputChat.trim()) return;

    const newMsg = {
      sender: 'user' as const,
      text: inputChat.trim(),
      time: 'Just now',
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setInputChat('');

    // Auto reply from valet
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'valet',
          text: 'Got it! I see your hazard lights blinking. Pulling up beside you now.',
          time: 'Just now',
        },
      ]);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-500/20 text-brand-400">
              🛵
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm">
                  {job.mode === 'on_the_way' ? 'Valet On The Way' : 'Valet at Destination'}
                </h3>
                <span className="text-[10px] bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded-full font-mono uppercase">
                  {job.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[260px]">
                {job.facilityName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Content View Switcher */}
        {activeSubView === 'main' && (
          <div className="p-5 space-y-4 overflow-y-auto flex-1">
            {/* Valet Driver Profile Card */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={job.valetAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256'}
                      alt={job.valetName}
                      className="w-13 h-13 rounded-full object-cover border-2 border-brand-500 shadow-sm"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full border border-white dark:border-slate-900" title="ID Verified">
                      <ShieldCheck size={12} />
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{job.valetName}</h4>
                      <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 px-1.5 py-0.2 rounded">
                        ★ {job.valetRating}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{job.valetVehicle}</p>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                      <UserCheck size={11} /> SmartPark Certified Valet
                    </span>
                  </div>
                </div>

                {/* Call & Chat Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveSubView('call')}
                    className="p-2.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 transition-colors"
                    title="Call Valet"
                  >
                    <Phone size={17} />
                  </button>
                  <button
                    onClick={() => setActiveSubView('chat')}
                    className="p-2.5 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 transition-colors"
                    title="Chat with Valet"
                  >
                    <MessageSquare size={17} />
                  </button>
                </div>
              </div>

              {/* ETA Bar */}
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock size={14} className="text-brand-500" />
                  Estimated Time of Arrival:
                </span>
                <span className="font-black text-brand-600 dark:text-brand-400 text-sm">
                  {job.status === 'parked' || job.status === 'ready_for_return' ? 'Parked at Bay' : `${job.etaMinutes} minutes`}
                </span>
              </div>
            </div>

            {/* HANDOVER OTP BOX (Critical Step 7) */}
            <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/10 border-2 border-amber-400 dark:border-amber-500/50 rounded-2xl p-4 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center justify-center gap-1">
                <KeyRound size={13} /> Secure Handover OTP
              </span>
              <div className="font-mono text-3xl font-black tracking-widest text-slate-900 dark:text-white my-1">
                {job.otp}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 max-w-xs mx-auto">
                Show this 4-digit code to the valet at pickup. Custody cannot be transferred without this verification OTP.
              </p>
            </div>

            {/* Safe Stopping Point Reminder */}
            {job.pickupLocation && (
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/70 text-xs">
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Confirmed Pickup Point:
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">{job.pickupLocation.address}</p>
                    {job.pickupLocation.safeSpotDescription && (
                      <span className="inline-block mt-1 text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-semibold">
                        ✓ {job.pickupLocation.safeSpotDescription}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Vehicle Photos Review Button (Steps 8 & 10) */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setActiveSubView('photos')}
                className="p-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Camera size={14} className="text-brand-500" />
                  <span>Pickup Photos</span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                  {job.pickupConfirmedByUser ? '✓ 5 Angles Verified' : 'Review 5 condition photos'}
                </span>
              </button>

              <button
                onClick={() => setActiveSubView('photos')}
                className="p-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Car size={14} className="text-indigo-500" />
                  <span>Parked Spot Photo</span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                  {job.parkedConfirmedByUser ? '✓ Bay Verified' : 'View parked bay photo'}
                </span>
              </button>
            </div>

            {/* Status Timeline Stepper */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">
                LIVE STATUS PROGRESS
              </span>
              <div className="space-y-2.5">
                {TIMELINE_STEPS.map((step, idx) => {
                  const isDone = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;

                  return (
                    <div key={step.key} className="flex items-center gap-2.5 text-xs">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] transition-colors ${
                          isDone
                            ? 'bg-brand-500 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                        } ${isCurrent ? 'ring-2 ring-brand-400 ring-offset-1' : ''}`}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <span
                        className={`font-semibold ${
                          isCurrent
                            ? 'text-brand-600 dark:text-brand-400 font-extrabold'
                            : isDone
                            ? 'text-slate-800 dark:text-slate-200'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Next Action Prompts depending on status */}
            <div className="space-y-2 pt-2">
              {job.status === 'parked' && (
                <button
                  onClick={onRequestCarReturn}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30 transition-all"
                >
                  <RotateCcw size={16} />
                  <span>Ready to Leave? Request My Car</span>
                </button>
              )}

              {/* Simulated progression buttons for quick demo testing */}
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                  Valet Simulator Controls:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => onUpdateStatus('arriving')}
                    className="px-2 py-1 text-[11px] rounded bg-white dark:bg-slate-700 font-medium hover:bg-brand-50 hover:text-brand-600"
                  >
                    Simulate: Arrived
                  </button>
                  <button
                    onClick={() => onUpdateStatus('otp_verified')}
                    className="px-2 py-1 text-[11px] rounded bg-white dark:bg-slate-700 font-medium hover:bg-brand-50 hover:text-brand-600"
                  >
                    Simulate: Verify OTP
                  </button>
                  <button
                    onClick={() => onUpdateStatus('driving_to_facility')}
                    className="px-2 py-1 text-[11px] rounded bg-white dark:bg-slate-700 font-medium hover:bg-brand-50 hover:text-brand-600"
                  >
                    Simulate: Drive to Hub
                  </button>
                  <button
                    onClick={() => onUpdateStatus('parked')}
                    className="px-2 py-1 text-[11px] rounded bg-white dark:bg-slate-700 font-medium hover:bg-brand-50 hover:text-brand-600"
                  >
                    Simulate: Car Parked
                  </button>
                </div>
              </div>

              {/* Cancellation policy link */}
              <button
                onClick={() => setActiveSubView('cancel')}
                className="w-full py-2.5 text-xs text-rose-600 dark:text-rose-400 hover:underline text-center"
              >
                Cancel Valet Service (Policy Applied)
              </button>
            </div>
          </div>
        )}

        {/* Sub-view: Chat */}
        {activeSubView === 'chat' && (
          <div className="flex flex-col flex-1 h-[480px]">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Chat with {job.valetName}
              </span>
              <button
                onClick={() => setActiveSubView('main')}
                className="text-xs text-brand-600 dark:text-brand-400 font-semibold"
              >
                ← Back
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-xs ${
                      msg.sender === 'user'
                        ? 'bg-brand-600 text-white rounded-br-none'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-0.5 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Quick chips */}
            <div className="p-2 border-t border-slate-200 dark:border-slate-700 flex gap-1.5 overflow-x-auto text-[11px]">
              <button
                onClick={() => setInputChat("I'm waiting near the fuel pump")}
                className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0"
              >
                Near fuel pump
              </button>
              <button
                onClick={() => setInputChat('White Tesla with hazard lights')}
                className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0"
              >
                Hazard lights on
              </button>
              <button
                onClick={() => setInputChat('Please hurry, stuck in traffic')}
                className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0"
              >
                Stuck in traffic
              </button>
            </div>

            <form onSubmit={handleSendChat} className="p-3 border-t border-slate-200 dark:border-slate-700 flex gap-2">
              <input
                type="text"
                value={inputChat}
                onChange={(e) => setInputChat(e.target.value)}
                placeholder="Message valet..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-brand-500"
              />
              <button
                type="submit"
                className="p-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-colors"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        )}

        {/* Sub-view: In-App Call */}
        {activeSubView === 'call' && (
          <div className="flex-1 p-8 text-center flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <img
                src={job.valetAvatar}
                alt={job.valetName}
                className="w-24 h-24 rounded-full object-cover border-4 border-brand-500 shadow-xl"
              />
              <div className="absolute inset-0 rounded-full border-4 border-emerald-400 animate-ping opacity-40"></div>
            </div>
            <div>
              <h4 className="text-xl font-black text-slate-900 dark:text-white">{job.valetName}</h4>
              <p className="text-xs text-slate-500 mt-1">{job.valetPhone}</p>
              <span className="inline-block mt-2 font-mono text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                Connected 00:{callDuration < 10 ? `0${callDuration}` : callDuration}
              </span>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button
                onClick={() => setActiveSubView('main')}
                className="w-14 h-14 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 hover:bg-rose-700 transition-all"
              >
                <Phone size={22} className="rotate-[135deg]" />
              </button>
            </div>
          </div>
        )}

        {/* Sub-view: Photos Inspection (Steps 8 & 10) */}
        {activeSubView === 'photos' && (
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Vehicle Condition Photos
              </h4>
              <button
                onClick={() => setActiveSubView('main')}
                className="text-xs text-brand-600 font-semibold"
              >
                ← Back
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Photos uploaded by the valet at pickup and parking. Tap to inspect any pre-existing scratches or fuel level.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  1. Front Angle
                </span>
                <img
                  src={job.pickupPhotos.front || 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=400'}
                  alt="Front"
                  className="w-full h-24 object-cover rounded-xl border border-slate-300 dark:border-slate-700"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  2. Rear Angle
                </span>
                <img
                  src={job.pickupPhotos.back || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=400'}
                  alt="Rear"
                  className="w-full h-24 object-cover rounded-xl border border-slate-300 dark:border-slate-700"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  3. Side Bodywork
                </span>
                <img
                  src={job.pickupPhotos.leftSide || 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&q=80&w=400'}
                  alt="Side"
                  className="w-full h-24 object-cover rounded-xl border border-slate-300 dark:border-slate-700"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  4. Dashboard / Fuel
                </span>
                <img
                  src={job.pickupPhotos.dashboard || 'https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&q=80&w=400'}
                  alt="Dashboard"
                  className="w-full h-24 object-cover rounded-xl border border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>

            {/* Parked Photo */}
            <div className="pt-2">
              <span className="text-[10px] font-bold text-indigo-500 uppercase block mb-1">
                5. Parked in Bay Photo
              </span>
              <img
                src={job.parkedPhoto || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=600'}
                alt="Parked in Bay"
                className="w-full h-32 object-cover rounded-xl border border-indigo-300 dark:border-indigo-800"
              />
            </div>

            <div className="pt-2 flex flex-col gap-2">
              {!job.pickupConfirmedByUser && (
                <button
                  onClick={() => {
                    onUpdateStatus(job.status, { pickupConfirmedByUser: true });
                    setActiveSubView('main');
                  }}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs shadow-md"
                >
                  ✓ Confirm Pickup Vehicle Condition
                </button>
              )}
              {job.status === 'parked' && !job.parkedConfirmedByUser && (
                <button
                  onClick={() => {
                    onUpdateStatus('parked', { parkedConfirmedByUser: true });
                    setActiveSubView('main');
                  }}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md"
                >
                  ✓ Confirm Vehicle Parked in Bay
                </button>
              )}
            </div>
          </div>
        )}

        {/* Sub-view: Cancellation confirmation */}
        {activeSubView === 'cancel' && (
          <div className="flex-1 p-6 space-y-4">
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
              Cancel Valet Request
            </h4>
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl text-xs space-y-2">
              <span className="font-bold text-rose-800 dark:text-rose-300 uppercase">
                Valet Cancellation Policy:
              </span>
              <p className="text-slate-700 dark:text-slate-300">
                • Free cancellation before a valet is assigned.
                <br />
                • After assignment, a graduated cancellation fee applies depending on valet distance.
                <br />
                • Once valet has arrived at pickup point, distance fee is non-refundable.
              </p>
              <div className="pt-2 font-bold text-sm text-rose-900 dark:text-rose-200">
                Applicable Cancellation Fee: ₹{getCancellationFee()}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setActiveSubView('main')}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Keep Valet
              </button>
              <button
                onClick={() => {
                  onCancelJob(getCancellationFee());
                  onClose();
                }}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 rounded-xl text-xs font-bold text-white"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
