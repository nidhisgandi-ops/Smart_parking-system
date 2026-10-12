import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapComponent } from '../components/MapComponent';
import { ParkingFacility } from '../types';
import {
  Search,
  Crosshair,
  AlertTriangle,
  Zap,
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  Car,
  ChevronRight,
  Radar,
  ArrowRight,
} from 'lucide-react';

interface HomeScreenProps {
  onSelectFacilityForBooking: (facility: ParkingFacility) => void;
  onRequestValetOnTheWay: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectFacilityForBooking,
  onRequestValetOnTheWay,
}) => {
  const {
    facilities,
    selectedFacility,
    setSelectedFacility,
    getVacantSpotsCount,
    noParkingZones,
    userLocation,
    setUserLocation,
    checkLocationNoParking,
    activeBooking,
    activeValetJob,
    isDarkMode,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'ev' | 'valet' | 'available'>('all');
  const [isLocating, setIsLocating] = useState(false);

  // Search autocomplete options
  const searchSuggestions = [
    { name: 'Cyber Park Multi-Level Hub', address: 'Tech Boulevard, Phase 1', facilityId: 'fac-01' },
    { name: 'Metro Central Station Complex', address: 'Terminal Gate 3, Station Rd', facilityId: 'fac-02' },
    { name: 'Grand Galleria Retail & Mall', address: '88 Commercial Ring Road', facilityId: 'fac-03' },
    { name: 'Downtown Civic Square', address: '10 Constitution Ave', facilityId: 'fac-04' },
    { name: 'Indira Gandhi Hospital Corridor (NO PARKING)', address: 'Emergency Lane', isNoPark: true, lat: 12.9745, lng: 77.5975 },
    { name: 'Metro BRTS Bus Transit Way (NO PARKING)', address: 'Transit Priority Lane', isNoPark: true, lat: 12.9692, lng: 77.5898 },
  ];

  const filteredFacilities = facilities.filter((f) => {
    const vacant = getVacantSpotsCount(f.id);
    if (activeFilter === 'available' && vacant === 0) return false;
    if (activeFilter === 'ev' && !f.amenities.some((a) => a.includes('EV'))) return false;
    if (activeFilter === 'valet' && !f.amenities.some((a) => a.includes('Valet'))) return false;
    if (searchQuery) {
      return (
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
        },
        () => {
          // Fallback to simulated Bengaluru tech park GPS
          setIsLocating(false);
          setUserLocation({ lat: 12.9716, lng: 77.5946 });
        },
        { timeout: 4000 }
      );
    } else {
      setIsLocating(false);
      setUserLocation({ lat: 12.9716, lng: 77.5946 });
    }
  };

  const handleSelectSuggestion = (item: any) => {
    setSearchQuery(item.name);
    setShowAutocomplete(false);
    if (item.facilityId) {
      const fac = facilities.find((f) => f.id === item.facilityId);
      if (fac) setSelectedFacility(fac);
    } else if (item.isNoPark && item.lat) {
      checkLocationNoParking(item.lat, item.lng);
    }
  };

  // Condition (a) active booking exists, and (b) user GPS within 3 km of facility
  const showValetOnTheWayButton = Boolean(
    activeBooking &&
    activeBooking.status === 'active' &&
    (!activeValetJob || activeValetJob.status === 'completed' || activeValetJob.status === 'cancelled')
  );

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 pb-28">
      {/* Search Header Bar with Autocomplete & Geolocation */}
      <div className="relative z-30">
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowAutocomplete(true);
              }}
              onFocus={() => setShowAutocomplete(true)}
              placeholder="Search destination, mall, or zone..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            />
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          </div>

          <button
            onClick={handleUseCurrentLocation}
            className={`p-2.5 rounded-xl text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 dark:hover:bg-brand-900/60 transition-colors shrink-0 ${
              isLocating ? 'animate-spin' : ''
            }`}
            title="Use My Current GPS Location"
          >
            <Crosshair size={18} />
          </button>
        </div>

        {/* Autocomplete Dropdown */}
        {showAutocomplete && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-40 max-h-60 overflow-y-auto">
            {searchSuggestions.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectSuggestion(item)}
                className="px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between border-b last:border-0 border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-base shrink-0">{item.isNoPark ? '⛔' : '🏢'}</span>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">{item.address}</p>
                  </div>
                </div>
                {item.isNoPark && (
                  <span className="text-[9px] bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-bold px-1.5 py-0.5 rounded shrink-0">
                    Fine Zone
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODE B VALET BANNER: "Running Late? Send a Valet" (Screen 8 requirement) */}
      {showValetOnTheWayButton && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-4 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden animate-pulse">
          <div className="flex items-start justify-between">
            <div className="space-y-1 max-w-[70%]">
              <span className="inline-block text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                ⚡ STUCK IN TRAFFIC?
              </span>
              <h4 className="text-base font-extrabold leading-tight">
                Running Late? Send a Valet
              </h4>
              <p className="text-[11px] text-white/90">
                You're within 3 km of {activeBooking?.facilityName}. We'll dispatch a scooter valet to your live location.
              </p>
            </div>
            <button
              onClick={onRequestValetOnTheWay}
              className="mt-1 py-2.5 px-3.5 bg-white text-orange-600 font-extrabold text-xs rounded-xl shadow-lg hover:bg-orange-50 transition-all flex items-center gap-1 shrink-0"
            >
              <span>Send Valet</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* FILTER PILLS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { key: 'all', label: 'All Hubs' },
          { key: 'available', label: '🟢 Available' },
          { key: 'ev', label: '⚡ EV Chargers' },
          { key: 'valet', label: '🛵 Valet Ready' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key as any)}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
              activeFilter === f.key
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* INTERACTIVE LEAFLET MAP */}
      <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
        <MapComponent
          facilities={filteredFacilities}
          selectedFacility={selectedFacility}
          onSelectFacility={(fac) => setSelectedFacility(fac)}
          noParkingZones={noParkingZones}
          userLocation={userLocation}
          getVacantSpotsCount={getVacantSpotsCount}
          onMapClick={(lat, lng) => checkLocationNoParking(lat, lng)}
          isDarkMode={isDarkMode}
          className="h-80 w-full"
        />

        {/* Floating "CHECK THIS LOCATION" Radar Button (Key Feature 4) */}
        <div className="absolute top-3 left-3 z-20">
          <button
            onClick={() => checkLocationNoParking(userLocation.lat, userLocation.lng)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950/90 text-white hover:bg-slate-900 text-xs font-bold shadow-xl border border-slate-700/80 backdrop-blur-md transition-all hover:scale-105 active:scale-95"
            title="Scan current GPS point for tow-away zones"
          >
            <Radar size={15} className="text-brand-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Check My Location</span>
          </button>
        </div>

        {/* Map Legend Overlay */}
        <div className="absolute bottom-3 left-3 right-3 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] flex items-center justify-between text-slate-600 dark:text-slate-300 font-semibold shadow-md">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Vacant Pin
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500/80 border border-red-600"></span> No-Parking Zone
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> You
          </span>
        </div>
      </div>

      {/* SELECTED FACILITY CARD (Quick Action) */}
      {selectedFacility && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
          <div className="flex gap-3">
            <img
              src={selectedFacility.imageUrl}
              alt={selectedFacility.name}
              className="w-20 h-20 rounded-2xl object-cover shrink-0 shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                  🟢 {getVacantSpotsCount(selectedFacility.id)} SPOTS VACANT
                </span>
                <span className="text-xs font-bold text-amber-500 flex items-center gap-0.5">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  {selectedFacility.rating}
                </span>
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate mt-0.5">
                {selectedFacility.name}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {selectedFacility.address}
              </p>
              <div className="flex items-center gap-2 mt-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                <span>₹{selectedFacility.hourlyRate}/hr</span>
                <span>•</span>
                <span>{selectedFacility.openHours}</span>
              </div>
            </div>
          </div>

          {/* Action button to proceed to Spot Layout Grid */}
          <button
            onClick={() => onSelectFacilityForBooking(selectedFacility)}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2"
          >
            <span>View Live CCTV Spot Layout</span>
            <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* NEARBY FACILITIES LIST */}
      <div className="space-y-2 pt-1">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Nearby Monitored Hubs ({filteredFacilities.length})
        </h3>
        <div className="space-y-2.5">
          {filteredFacilities.map((facility) => {
            const vacant = getVacantSpotsCount(facility.id);
            const isSelected = selectedFacility?.id === facility.id;

            return (
              <div
                key={facility.id}
                onClick={() => setSelectedFacility(facility)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-brand-50/70 dark:bg-brand-950/40 border-brand-500 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 ${
                      vacant > 5 ? 'bg-emerald-500' : vacant > 0 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                  >
                    {vacant}
                  </div>
                  <div className="min-w-0 truncate">
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                      {facility.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {facility.distanceKm || 0.8} km away • ₹{facility.hourlyRate}/hr
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 pl-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectFacilityForBooking(facility);
                    }}
                    className="py-1.5 px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                  >
                    Book
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
