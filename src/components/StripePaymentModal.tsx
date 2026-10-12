import React, { useState } from 'react';
import { Booking } from '../types';
import { CreditCard, Lock, CheckCircle2, ShieldCheck, AlertCircle, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StripePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingSummary: {
    facilityName: string;
    spotNumber: string;
    vehiclePlate: string;
    vehicleModel: string;
    durationHours: number;
    baseFee: number;
    platformFee: number;
    taxes: number;
    valetFee: number;
    discount: number;
    total: number;
  };
  onPaymentSuccess: (paymentDetails: { paymentIntentId: string; last4: string }) => void;
}

export const StripePaymentModal: React.FC<StripePaymentModalProps> = ({
  isOpen,
  onClose,
  bookingSummary,
  onPaymentSuccess,
}) => {
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('123');
  const [cardHolder, setCardHolder] = useState('Alex Morgan');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'card_input' | '3ds_simulation' | 'success'>('card_input');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleFillTestCard = (type: 'success' | 'auth_required' | 'fail') => {
    if (type === 'success') {
      setCardNumber('4242 4242 4242 4242');
      setExpiry('12/28');
      setCvc('123');
      setErrorMessage('');
    } else if (type === 'auth_required') {
      setCardNumber('4000 0000 0000 3220');
      setExpiry('08/27');
      setCvc('999');
      setErrorMessage('');
    } else {
      setCardNumber('4000 0000 0000 0002');
      setExpiry('01/25');
      setCvc('000');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (cardNumber.endsWith('0002')) {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setErrorMessage('Your test card was declined. Please use standard 4242 test card.');
      }, 1000);
      return;
    }

    setIsProcessing(true);

    // Simulate 3DS challenge if card ends with 3220
    if (cardNumber.includes('3220')) {
      setTimeout(() => {
        setIsProcessing(false);
        setStep('3ds_simulation');
      }, 1200);
      return;
    }

    // Direct success
    setTimeout(() => {
      completeSuccess();
    }, 1500);
  };

  const completeSuccess = () => {
    setIsProcessing(false);
    setStep('success');
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      onPaymentSuccess({
        paymentIntentId: `pi_test_${Date.now().toString(36)}`,
        last4: cardNumber.replace(/\s+/g, '').slice(-4),
      });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Stripe Header */}
        <div className="bg-slate-950 p-5 text-white border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                <span className="bg-indigo-600 text-white px-2 py-0.5 rounded text-sm font-black">stripe</span>
                <span>Checkout</span>
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono font-bold px-2 py-0.5 rounded-full border border-amber-500/40">
                TEST MODE
              </span>
            </div>
            <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white">
              <X size={18} />
            </button>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-xs text-slate-400">Total Due</span>
              <div className="text-2xl font-black text-white">₹{bookingSummary.total}</div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Spot {bookingSummary.spotNumber}</span>
              <div className="text-xs font-semibold text-brand-400 truncate max-w-[160px]">
                {bookingSummary.facilityName}
              </div>
            </div>
          </div>
        </div>

        {/* Step: Card Input */}
        {step === 'card_input' && (
          <div className="p-6 space-y-4">
            {/* Quick Test Card Fillers */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Quick Test Credentials:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleFillTestCard('success')}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 hover:bg-emerald-100 transition-colors"
                >
                  ✓ 4242 (Auto-Pass)
                </button>
                <button
                  type="button"
                  onClick={() => handleFillTestCard('auth_required')}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-300 hover:bg-indigo-100 transition-colors"
                >
                  🛡️ 3DS Secure Auth
                </button>
                <button
                  type="button"
                  onClick={() => handleFillTestCard('fail')}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 hover:bg-rose-100 transition-colors"
                >
                  ✕ Decline Test
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="4242 4242 4242 4242"
                  />
                  <CreditCard
                    size={18}
                    className="absolute left-3 top-3 text-slate-400 dark:text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expires (MM/YY)
                  </label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="12/28"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    CVC / CVV
                  </label>
                  <input
                    type="text"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="123"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="Full Name"
                />
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <Lock size={12} />
                <span>Encrypted 256-bit TLS simulated Stripe transaction</span>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-sm bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <span>Pay ₹{bookingSummary.total} Now</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Step: 3D Secure Simulation */}
        {step === '3ds_simulation' && (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck size={30} />
            </div>
            <h4 className="font-bold text-lg text-slate-900 dark:text-white">
              Stripe 3D-Secure 2.0 Challenge
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your test issuer bank is requesting biometric or OTP authentication.
            </p>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-mono">
              Test OTP: <strong>882910</strong> (Auto-verified)
            </div>
            <button
              onClick={completeSuccess}
              className="w-full py-3 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white transition-all"
            >
              Authorize & Complete Checkout
            </button>
          </div>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Payment Confirmed!
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generating your CCTV E-Ticket with QR code...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
