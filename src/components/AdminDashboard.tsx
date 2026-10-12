import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  SlidersHorizontal,
  Video,
  Play,
  Pause,
  Zap,
  RotateCcw,
  ShieldAlert,
  Car,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { SpotStatus } from '../types';

export const AdminDashboard: React.FC = () => {
  const {
    spots,
    facilities,
    bookings,
    valetJobs,
    noParkingZones,
    cctvRunning,
    toggleCCTV,
    cctvInterval,
    setCCTVInterval,
    triggerManualSpotStatus,
    simulateRushHour,
    resetDemoData,
    switchRole,
  } = useApp();

  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(facilities[0]?.id || 'fac-01');
  const [filterStatus, setFilterStatus] = useState<'all' | SpotStatus>('all');

  const facilitySpots = spots.filter((s) => s.facilityId === selectedFacilityId);
  const filteredSpots = facilitySpots.filter((s) =>
    filterStatus === 'all' ? true : s.status === filterStatus
  );

  const vacantCount = facilitySpots.filter((s) => s.status === 'vacant').length;
  const occupiedCount = facilitySpots.filter((s) => s.status === 'occupied').length;
  const noParkingCount = facilitySpots.filter((s) => s.status === 'no_parking').length;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <SlidersHorizontal size={20} />
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              SmartPark Admin & CCTV Hub
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Realtime spot management, CCTV camera status control, and system telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => switchRole('user')}
            className="py-2 px-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all"
          >
            Switch to App View
          </button>
          <button
            onClick={resetDemoData}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5"
            title="Reset All Data to Initial Demo State"
          >
            <RotateCcw size={14} />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* CCTV Simulator Controls Card */}
      <div className="bg-slate-950 text-white p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4 font-mono">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${cctvRunning ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
            <span className="font-bold text-sm text-emerald-400 flex items-center gap-1.5">
              <Video size={16} />
              CCTV AI INFERENCE ENGINE
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={toggleCCTV}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors ${
                cctvRunning
                  ? 'bg-rose-600/90 text-white hover:bg-rose-700'
                  : 'bg-emerald-600/90 text-white hover:bg-emerald-700'
              }`}
            >
              {cctvRunning ? <Pause size={13} /> : <Play size={13} />}
              <span>{cctvRunning ? 'PAUSE SIMULATOR' : 'START SIMULATOR'}</span>
            </button>

            <button
              onClick={simulateRushHour}
              className="px-3 py-1.5 rounded-xl bg-amber-600/90 hover:bg-amber-700 text-white font-bold flex items-center gap-1.5"
            >
              <Zap size={13} />
              <span>TRIGGER RUSH SPIKE</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Inference Frequency:</span>
            <div className="flex gap-1.5">
              {[2000, 4500, 8000].map((ms) => (
                <button
                  key={ms}
                  onClick={() => setCCTVInterval(ms)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    cctvInterval === ms
                      ? 'bg-brand-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {ms / 1000}s
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Architecture:</span>
            <span className="text-brand-400 font-bold">YOLOv8x-Parking Seg</span>
          </div>

          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Total Monitored Bays:</span>
            <span className="text-white font-bold">{spots.length} bays across 4 facilities</span>
          </div>
        </div>
      </div>

      {/* Facility Selector & Live Occupancy Metrics */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Select Facility:
            </label>
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-500"
            >
              {facilities.map((fac) => (
                <option key={fac.id} value={fac.id}>
                  {fac.name} ({fac.totalSpots} spots)
                </option>
              ))}
            </select>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
              🟢 Vacant: {vacantCount}
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold">
              🔴 Occupied: {occupiedCount}
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-red-100 dark:bg-red-950 border border-red-300 dark:border-red-900 text-red-700 dark:text-red-300 text-xs font-bold">
              ⛔ No-Parking: {noParkingCount}
            </div>
          </div>
        </div>

        {/* Filter Filter Tabs */}
        <div className="flex gap-2 text-xs border-b border-slate-200 dark:border-slate-800 pb-3">
          {(['all', 'vacant', 'occupied', 'no_parking'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-xl font-bold uppercase transition-colors ${
                filterStatus === st
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Spot Management Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredSpots.map((spot) => (
            <div
              key={spot.id}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {spot.spotNumber} (L{spot.floor})
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-500">
                  {spot.type}
                </span>
              </div>

              <div className="text-[11px] text-slate-500">
                Cam: <span className="font-mono">{spot.cctvCameraId}</span>
              </div>

              {/* Status Action Buttons */}
              <div className="grid grid-cols-3 gap-1 pt-1">
                <button
                  onClick={() => triggerManualSpotStatus(spot.id, 'vacant')}
                  className={`py-1 rounded-lg text-[10px] font-bold ${
                    spot.status === 'vacant'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                  }`}
                  title="Set Vacant"
                >
                  Vacant
                </button>
                <button
                  onClick={() => triggerManualSpotStatus(spot.id, 'occupied')}
                  className={`py-1 rounded-lg text-[10px] font-bold ${
                    spot.status === 'occupied'
                      ? 'bg-rose-600 text-white'
                      : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                  }`}
                  title="Set Occupied"
                >
                  Occupy
                </button>
                <button
                  onClick={() => triggerManualSpotStatus(spot.id, 'no_parking')}
                  className={`py-1 rounded-lg text-[10px] font-bold ${
                    spot.status === 'no_parking'
                      ? 'bg-red-700 text-white'
                      : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
                  }`}
                  title="Set No Parking"
                >
                  No-Park
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
