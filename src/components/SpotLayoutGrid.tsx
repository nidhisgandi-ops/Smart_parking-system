import React, { useState } from 'react';
import { ParkingSpot, VehicleType } from '../types';
import { Zap, AlertTriangle, ShieldCheck, Video, Clock } from 'lucide-react';

interface SpotLayoutGridProps {
  spots: ParkingSpot[];
  selectedFloor: number;
  selectedVehicleType: VehicleType;
  onSelectSpot: (spot: ParkingSpot) => void;
  onNoParkingClick: (spot: ParkingSpot) => void;
  heldSpotId?: string;
  isCCTVLive?: boolean;
}

export const SpotLayoutGrid: React.FC<SpotLayoutGridProps> = ({
  spots,
  selectedFloor,
  selectedVehicleType,
  onSelectSpot,
  onNoParkingClick,
  heldSpotId,
  isCCTVLive = true,
}) => {
  const [hoveredSpot, setHoveredSpot] = useState<ParkingSpot | null>(null);

  // Filter spots on current floor
  const floorSpots = spots.filter((s) => s.floor === selectedFloor);

  // Split into left and right aisles for realistic garage drive-through look
  const leftAisle = floorSpots.filter((_, idx) => idx % 2 === 0);
  const rightAisle = floorSpots.filter((_, idx) => idx % 2 === 1);

  // Compatibility checker
  const isCompatible = (spot: ParkingSpot, vehicleType: VehicleType): boolean => {
    if (spot.status === 'no_parking') return false;
    if (vehicleType === 'ev' && !spot.hasEvCharger) return false;
    if (vehicleType === 'bike' && spot.type !== 'bike') return true; // Bike can park in car slot if needed, but bay preferred
    if (spot.type === 'bike' && vehicleType !== 'bike') return false; // Car cannot fit in bike bay
    return true;
  };

  const renderSpotBay = (spot: ParkingSpot) => {
    const isHeld = spot.id === heldSpotId;
    const compatible = isCompatible(spot, selectedVehicleType);
    const isVacant = spot.status === 'vacant';
    const isOccupied = spot.status === 'occupied';
    const isNoParking = spot.status === 'no_parking';

    let bgStyle = 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700';
    let statusText = 'Vacant';

    if (isNoParking) {
      bgStyle = 'bg-red-50/70 dark:bg-red-950/30 border-red-300 dark:border-red-900/60 text-red-600 opacity-90 cursor-not-allowed';
      statusText = 'NO PARKING';
    } else if (isOccupied) {
      bgStyle = 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 dark:border-rose-800 text-rose-700 cursor-not-allowed';
      statusText = 'Occupied';
    } else if (isHeld) {
      bgStyle = 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 dark:border-amber-600 text-amber-700 ring-2 ring-amber-400 animate-pulse';
      statusText = 'Held for you';
    } else if (isVacant && compatible) {
      bgStyle = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 hover:border-emerald-600 dark:border-emerald-500 hover:bg-emerald-100 hover:shadow-md cursor-pointer text-emerald-800 dark:text-emerald-300';
      statusText = 'Vacant';
    } else if (isVacant && !compatible) {
      bgStyle = 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-400 opacity-60 cursor-not-allowed';
      statusText = 'Incompatible';
    }

    return (
      <div
        key={spot.id}
        onClick={() => {
          if (isNoParking) {
            onNoParkingClick(spot);
          } else if (isVacant && compatible) {
            onSelectSpot(spot);
          }
        }}
        onMouseEnter={() => setHoveredSpot(spot)}
        onMouseLeave={() => setHoveredSpot(null)}
        className={`relative flex flex-col items-center justify-between p-2.5 rounded-xl border-2 transition-all duration-150 select-none ${bgStyle} h-28`}
      >
        {/* Top Header: Spot Number & Badges */}
        <div className="w-full flex items-center justify-between">
          <span className="font-extrabold text-xs tracking-tight">{spot.spotNumber}</span>
          <div className="flex items-center gap-1">
            {spot.hasEvCharger && (
              <span className="p-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/70 dark:text-emerald-300" title="EV Fast Charger">
                <Zap size={11} className="fill-emerald-500 text-emerald-500" />
              </span>
            )}
            {spot.type === 'bike' && (
              <span className="text-[10px] font-bold px-1 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                🏍️ Bay
              </span>
            )}
          </div>
        </div>

        {/* Spot Center Representation */}
        <div className="flex flex-col items-center justify-center my-1 text-center">
          {isNoParking ? (
            <div className="flex flex-col items-center">
              <div className="relative w-8 h-8 rounded-full border-2 border-red-500 flex items-center justify-center bg-white dark:bg-slate-900">
                <span className="text-red-500 font-black text-sm">P</span>
                <div className="absolute w-7 h-0.5 bg-red-500 rotate-45"></div>
              </div>
              <span className="text-[9px] font-bold text-red-500 mt-1 uppercase tracking-wider">No Park</span>
            </div>
          ) : isOccupied ? (
            <div className="flex flex-col items-center">
              <span className="text-lg">🚗</span>
              <span className="text-[9px] font-semibold text-rose-600 dark:text-rose-400 mt-0.5">
                {spot.occupiedByVehiclePlate || 'Occupied'}
              </span>
            </div>
          ) : isHeld ? (
            <div className="flex flex-col items-center">
              <Clock size={18} className="text-amber-500 animate-spin" />
              <span className="text-[9px] font-bold text-amber-600 mt-0.5">Reserved</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                ✓
              </div>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 mt-1">TAP TO HOLD</span>
            </div>
          )}
        </div>

        {/* Footer: CCTV Metadata Tag */}
        <div className="w-full flex items-center justify-between text-[8px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700/60 pt-1">
          <span className="truncate max-w-[55px]">{spot.cctvCameraId}</span>
          <span className="font-mono">{(spot.confidenceScore * 100).toFixed(0)}% AI</span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* CCTV HUD Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 mb-3 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono shadow-md border border-slate-800">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isCCTVLive ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
          <span className="font-semibold text-emerald-400 flex items-center gap-1">
            <Video size={13} />
            {isCCTVLive ? 'CCTV VISION ACTIVE' : 'CCTV PAUSED'}
          </span>
          <span className="text-slate-400 hidden sm:inline">• 30 FPS YOLOv8</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-300">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Vacant ({spots.filter(s => s.status === 'vacant').length})
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Occupied ({spots.filter(s => s.status === 'occupied').length})
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-600"></span> No Park ({spots.filter(s => s.status === 'no_parking').length})
          </span>
        </div>
      </div>

      {/* 2D Parking Garage Grid Layout */}
      <div className="bg-slate-200/70 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-300 dark:border-slate-800">
        {/* Driveway lane marker */}
        <div className="text-center font-bold text-[10px] tracking-widest text-slate-400 dark:text-slate-500 mb-2 uppercase flex items-center justify-center gap-2">
          <span>← ENTRY RAMP</span>
          <span className="h-0.5 w-12 bg-slate-400/50"></span>
          <span>DRIVEWAY AISLE</span>
          <span className="h-0.5 w-12 bg-slate-400/50"></span>
          <span>EXIT GATE →</span>
        </div>

        {/* 2 Aisles Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Left Bay Column */}
          <div className="space-y-2.5">
            <div className="text-[10px] font-bold text-slate-500 uppercase px-1">Bay Wing Left</div>
            <div className="grid grid-cols-2 gap-2">
              {leftAisle.map((spot) => renderSpotBay(spot))}
            </div>
          </div>

          {/* Right Bay Column */}
          <div className="space-y-2.5">
            <div className="text-[10px] font-bold text-slate-500 uppercase px-1">Bay Wing Right</div>
            <div className="grid grid-cols-2 gap-2">
              {rightAisle.map((spot) => renderSpotBay(spot))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
