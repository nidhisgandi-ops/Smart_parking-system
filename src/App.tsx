import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { NotificationDrawer } from './components/NotificationDrawer';
import { NoParkingDetectorModal } from './components/NoParkingDetectorModal';
import { HelplineAndAIAssistant } from './components/HelplineAndAIAssistant';
import { HomeScreen } from './screens/HomeScreen';
import { SpotSelectionScreen } from './screens/SpotSelectionScreen';
import { CheckoutScreen } from './screens/CheckoutScreen';
import { MyBookingsScreen } from './screens/MyBookingsScreen';
import { ValetScreen } from './screens/ValetScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './screens/AuthModal';
import { ParkingFacility, ParkingSpot, VehicleType, Booking } from './types';

const MainAppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isNoParkingModalOpen,
    setIsNoParkingModalOpen,
    currentNoParkingResult,
    isAuthModalOpen,
    setIsAuthModalOpen,
    selectedFacility,
    setSelectedFacility,
    user,
  } = useApp();

  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  // Sub-navigation flow states within Home / Booking
  const [activeFacilityForBooking, setActiveFacilityForBooking] = useState<ParkingFacility | null>(null);
  const [checkoutDetails, setCheckoutDetails] = useState<{
    facility: ParkingFacility;
    spot: ParkingSpot;
    vehicleType: VehicleType;
    date: string;
    startTime: string;
    durationHours: number;
  } | null>(null);

  // Handle selecting facility on HomeScreen to open SpotSelectionScreen
  const handleSelectFacilityForBooking = (facility: ParkingFacility) => {
    setActiveFacilityForBooking(facility);
  };

  // Handle proceeding from SpotSelectionScreen to CheckoutScreen
  const handleProceedToCheckout = (details: {
    facility: ParkingFacility;
    spot: ParkingSpot;
    vehicleType: VehicleType;
    date: string;
    startTime: string;
    durationHours: number;
  }) => {
    setCheckoutDetails(details);
  };

  const handleBookingCompleted = (booking: Booking) => {
    setCheckoutDetails(null);
    setActiveFacilityForBooking(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar onOpenNotifications={() => setIsNotificationDrawerOpen(true)} />

      {/* Main Screen Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto">
        {/* Admin Dashboard */}
        {activeTab === 'admin' && <AdminDashboard />}

        {/* Home Flow */}
        {activeTab === 'home' && (
          <>
            {checkoutDetails ? (
              <CheckoutScreen
                bookingDetails={checkoutDetails}
                onBack={() => setCheckoutDetails(null)}
                onBookingCompleted={handleBookingCompleted}
              />
            ) : activeFacilityForBooking ? (
              <SpotSelectionScreen
                facility={activeFacilityForBooking}
                onBack={() => setActiveFacilityForBooking(null)}
                onProceedToCheckout={handleProceedToCheckout}
              />
            ) : (
              <HomeScreen
                onSelectFacilityForBooking={handleSelectFacilityForBooking}
                onRequestValetOnTheWay={() => setActiveTab('valet')}
              />
            )}
          </>
        )}

        {/* My Bookings */}
        {activeTab === 'bookings' && <MyBookingsScreen />}

        {/* Valet Service Screen */}
        {activeTab === 'valet' && <ValetScreen />}

        {/* Help Screen */}
        {activeTab === 'help' && (
          <div className="max-w-md mx-auto p-4 pb-28">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-xl font-black">Help & Parking Assistant</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                SmartPark AI Concierge answers real-time questions about your spot, valet tracking, and municipal parking rules. Tap the floating AI button or review the guides below.
              </p>
            </div>
          </div>
        )}

        {/* Profile Screen */}
        {activeTab === 'profile' && <ProfileScreen />}
      </main>

      {/* Floating AI & Helpline Concierge */}
      <HelplineAndAIAssistant />

      {/* Bottom Navigation Tab Bar */}
      <BottomNav />

      {/* Global No-Parking Violation Radar Modal */}
      <NoParkingDetectorModal
        isOpen={isNoParkingModalOpen}
        onClose={() => setIsNoParkingModalOpen(false)}
        result={currentNoParkingResult}
        onNavigateToAlternative={() => {
          setIsNoParkingModalOpen(false);
          setActiveTab('home');
        }}
      />

      {/* Push Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
      />

      {/* Auth / Profile OTP Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
