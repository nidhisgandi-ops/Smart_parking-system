import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Vehicle, VehicleType } from '../types';
import {
  User,
  Car,
  Phone,
  Mail,
  Plus,
  Trash2,
  Check,
  Star,
  ShieldCheck,
  Moon,
  Sun,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const {
    user,
    updateUserProfile,
    selectedVehicle,
    setSelectedVehicle,
    isDarkMode,
    toggleDarkMode,
    resetDemoData,
    switchRole,
    setIsAuthModalOpen,
  } = useApp();

  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [newPlate, setNewPlate] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newMake, setNewMake] = useState('');
  const [newType, setNewType] = useState<VehicleType>('sedan');
  const [newColor, setNewColor] = useState('Metallic Silver');

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate || !newModel) return;

    const newVeh: Vehicle = {
      id: `veh-${Date.now().toString().slice(-4)}`,
      plateNumber: newPlate.toUpperCase(),
      make: newMake || 'Custom',
      model: newModel,
      type: newType,
      color: newColor,
      isDefault: false,
    };

    const updated = [...user.savedVehicles, newVeh];
    updateUserProfile({ savedVehicles: updated });
    setIsAddVehicleOpen(false);
    setNewPlate('');
    setNewModel('');
    setNewMake('');
  };

  const handleSetDefaultVehicle = (vehicle: Vehicle) => {
    const updated = user.savedVehicles.map((v) => ({
      ...v,
      isDefault: v.id === vehicle.id,
    }));
    updateUserProfile({ savedVehicles: updated });
    setSelectedVehicle(vehicle);
  };

  const handleDeleteVehicle = (id: string) => {
    if (user.savedVehicles.length <= 1) {
      alert('You must have at least one vehicle saved.');
      return;
    }
    const updated = user.savedVehicles.filter((v) => v.id !== id);
    updateUserProfile({ savedVehicles: updated });
    if (selectedVehicle?.id === id) {
      setSelectedVehicle(updated[0]);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 pb-28">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-brand-500 shadow-md"
            />
            <span className="absolute bottom-0 right-0 p-1 bg-emerald-500 text-white rounded-full border-2 border-white dark:border-slate-900">
              <ShieldCheck size={12} />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {user.name}
              </h3>
              <span className="text-[10px] font-bold bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300 px-2 py-0.5 rounded-full">
                Verified
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user.email}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user.phone}</p>
          </div>
        </div>

        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline"
        >
          Edit
        </button>
      </div>

      {/* SAVED VEHICLES SECTION (Screen 1 Requirement) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Saved Vehicles ({user.savedVehicles.length})
            </h4>
            <p className="text-[11px] text-slate-500">
              Select default vehicle for instant slot compatibility filtering.
            </p>
          </div>
          <button
            onClick={() => setIsAddVehicleOpen(true)}
            className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-bold text-xs flex items-center gap-1 hover:bg-brand-100"
          >
            <Plus size={14} />
            <span>Add Vehicle</span>
          </button>
        </div>

        <div className="space-y-2">
          {user.savedVehicles.map((veh) => {
            const isSelected = selectedVehicle?.id === veh.id;

            return (
              <div
                key={veh.id}
                onClick={() => setSelectedVehicle(veh)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg">
                    {veh.type === 'ev' ? '⚡' : veh.type === 'bike' ? '🏍️' : '🚗'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                        {veh.plateNumber}
                      </span>
                      {veh.isDefault && (
                        <span className="text-[9px] bg-slate-200 dark:bg-slate-700 font-bold px-1.5 py-0.2 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {veh.make} {veh.model} • {veh.type.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {!veh.isDefault && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetDefaultVehicle(veh);
                      }}
                      className="text-[10px] text-slate-500 hover:text-brand-600 font-bold px-2 py-1 rounded-lg"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteVehicle(veh.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ADD VEHICLE MODAL */}
      {isAddVehicleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
              Add New Vehicle
            </h4>

            <form onSubmit={handleAddVehicle} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  License Plate Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KA-01-AB-1234"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white uppercase font-mono font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Make (Brand)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hyundai"
                    value={newMake}
                    onChange={(e) => setNewMake(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ioniq 5"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Vehicle Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as VehicleType)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-semibold"
                >
                  <option value="ev">⚡ Electric Vehicle (EV with Charger)</option>
                  <option value="sedan">🚙 Sedan</option>
                  <option value="suv">🚙 SUV / Crossover</option>
                  <option value="hatchback">🚗 Hatchback</option>
                  <option value="bike">🏍️ Two-Wheeler / Bike</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddVehicleOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK SYSTEM SETTINGS */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
          Preferences & Actions
        </h4>

        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
          <span className="text-slate-700 dark:text-slate-300">Theme Appearance</span>
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold"
          >
            {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
          <span className="text-slate-700 dark:text-slate-300">Role Mode</span>
          <div className="flex gap-1.5">
            <button
              onClick={() => switchRole('user')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                user.role === 'user' ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
              }`}
            >
              User
            </button>
            <button
              onClick={() => switchRole('valet')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                user.role === 'valet' ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
              }`}
            >
              Valet
            </button>
            <button
              onClick={() => switchRole('admin')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                user.role === 'admin' ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
              }`}
            >
              Admin
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={resetDemoData}
            className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 text-slate-600 dark:text-slate-400 font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw size={14} />
            <span>Reset Demo Seed Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
