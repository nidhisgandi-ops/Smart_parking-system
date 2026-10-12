import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MessageSquare,
  Phone,
  HelpCircle,
  Bot,
  Send,
  X,
  ChevronDown,
  ShieldAlert,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const HelplineAndAIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'ai' | 'helpline' | 'faq'>('ai');
  const { activeBooking, activeValetJob, user, spots, selectedFacility } = useApp();

  const [inputQuestion, setInputQuestion] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; time: string }>>([
    {
      sender: 'assistant',
      text: `Hello ${user.name.split(' ')[0]}! I'm your SmartPark AI Concierge. I have live access to your active bookings, spot statuses, and valet location. How can I assist you today?`,
      time: 'Just now',
    },
  ]);

  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does real-time CCTV AI detection work?',
      a: 'Our smart parking platform uses edge-AI cameras (YOLOv8 vision models) mounted at facility ceilings. Cameras scan bay markings at 30 FPS to classify spots as vacant or occupied with 96%+ accuracy. Status flips are synchronized in realtime.',
    },
    {
      q: 'What happens if I park in a No-Parking Zone?',
      a: 'Vehicles parked in municipal tow-away zones (fire hydrants, transit lanes) face immediate ₹2,000 fine + commercial towing fees under Section 122 of the Motor Vehicles Act. SmartPark detector warns you and suggests nearest legal facilities.',
    },
    {
      q: 'How does the "Valet on the way" service work?',
      a: 'If you are stuck in traffic within 3 km of your destination, request a valet to your live GPS coordinates. Confirm a safe stopping bay, provide the 4-digit OTP at pickup, review 5 vehicle inspection photos, and your car will be safely driven and parked at the hub.',
    },
    {
      q: 'What is the booking cancellation & refund policy?',
      a: '• More than 1 hour before scheduled start: 100% full refund.\n• Within 1 hour of scheduled start: 50% partial refund.\n• After booking check-in time: 0% non-refundable.',
    },
    {
      q: 'Is my vehicle insured during valet custody?',
      a: 'Yes, every valet trip is backed by SmartPark comprehensive ₹10,00,000 transit & garage keeper liability insurance. Valets undergo rigorous background checks and upload 5-angle inspection photos before moving your car.',
    },
  ];

  // AI Response generator grounded with live user booking data
  const handleAskAI = (queryText: string) => {
    const q = queryText.toLowerCase().trim();
    if (!q) return;

    const userMsg = { sender: 'user' as const, text: queryText, time: 'Just now' };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');

    setTimeout(() => {
      let reply = '';

      if (q.includes('where') && (q.includes('car') || q.includes('spot') || q.includes('park'))) {
        if (activeBooking) {
          reply = `Your ${activeBooking.vehicle.make} ${activeBooking.vehicle.model} (${activeBooking.vehicle.plateNumber}) is reserved at Spot ${activeBooking.spotNumber} (Floor ${activeBooking.floor}) at ${activeBooking.facilityName}. Valid until ${activeBooking.endTime}.`;
        } else {
          reply = "You don't have an active parking booking right now. You can search for nearby spots on the home map and book with 10-minute slot hold!";
        }
      } else if (q.includes('valet') || q.includes('driver')) {
        if (activeValetJob) {
          reply = `Your valet ${activeValetJob.valetName} is currently: ${activeValetJob.status.replace(/_/g, ' ').toUpperCase()}. ETA is ${activeValetJob.etaMinutes} mins. Your handover OTP is ${activeValetJob.otp}. Vehicle: ${activeValetJob.valetVehicle}.`;
        } else {
          reply = 'You currently have no active valet request. If you have an active booking and are within 3 km of the facility, tap "Send a Valet" on the home screen!';
        }
      } else if (q.includes('fine') || q.includes('no-parking') || q.includes('penalty')) {
        reply = 'No-parking fines in metropolitan zones range from ₹1,800 to ₹3,000 plus towing charges. You can use our "Check this location" radar tool anytime to verify if your current GPS point is legally compliant.';
      } else if (q.includes('refund') || q.includes('cancel')) {
        reply = 'SmartPark refund policy:\n• > 1 hour prior: 100% refund\n• < 1 hour prior: 50% refund\n• After scheduled start: 0% refund.\nYou can cancel anytime from the "My Bookings" tab with an instant refund breakdown!';
      } else if (q.includes('ev') || q.includes('charg')) {
        reply = 'All spots marked with the ⚡ lightning bolt feature Level 2 (22kW AC) or Level 3 (60kW DC) fast chargers. EV slots are held exclusively for electric vehicles.';
      } else {
        reply = `I can help you with your active reservation (${activeBooking ? `#${activeBooking.id}` : 'no active booking'}), valet status, no-parking fine rules, and navigation. You can also dial our 24/7 helpline at 1800-762-7872!`;
      }

      setMessages((prev) => [...prev, { sender: 'assistant', text: reply, time: 'Just now' }]);
    }, 900);
  };

  return (
    <>
      {/* Floating Help Button */}
      <div className="fixed bottom-20 right-4 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="relative group p-3.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-xl shadow-brand-600/40 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
          title="AI Assist & 24/7 Helpline"
        >
          <div className="absolute inset-0 rounded-full bg-brand-400 animate-ping opacity-25"></div>
          <Bot size={22} />
          <span className="hidden group-hover:inline-block ml-2 text-xs font-bold pr-1">
            AI Assist
          </span>
        </button>
      </div>

      {/* Main Helpline Modal Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[88vh] flex flex-col">
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-brand-500/20 text-brand-400">
                  <Bot size={18} />
                </span>
                <div>
                  <h3 className="font-extrabold text-sm">SmartPark Assistant & Support</h3>
                  <p className="text-[10px] text-slate-400">AI Concierge • 24/7 Roadside Line</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sub-tab Navigation */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <button
                onClick={() => setActiveSubTab('ai')}
                className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                  activeSubTab === 'ai'
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400 bg-white dark:bg-slate-800'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Sparkles size={13} />
                <span>AI Concierge</span>
              </button>
              <button
                onClick={() => setActiveSubTab('helpline')}
                className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                  activeSubTab === 'helpline'
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400 bg-white dark:bg-slate-800'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Phone size={13} />
                <span>Helpline</span>
              </button>
              <button
                onClick={() => setActiveSubTab('faq')}
                className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                  activeSubTab === 'faq'
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400 bg-white dark:bg-slate-800'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <HelpCircle size={13} />
                <span>FAQ</span>
              </button>
            </div>

            {/* Tab 1: AI Chat Assistant */}
            {activeSubTab === 'ai' && (
              <div className="flex flex-col flex-1 h-[440px]">
                {/* Chat Stream */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl text-xs whitespace-pre-line leading-relaxed ${
                          m.sender === 'user'
                            ? 'bg-brand-600 text-white rounded-br-none shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-700/60'
                        }`}
                      >
                        {m.text}
                      </div>
                      <span className="text-[9px] text-slate-400 mt-0.5 px-1">{m.time}</span>
                    </div>
                  ))}
                </div>

                {/* Query Suggestion Pills */}
                <div className="p-2 border-t border-slate-100 dark:border-slate-800 flex gap-1.5 overflow-x-auto text-[11px] bg-slate-50/50 dark:bg-slate-900/50">
                  <button
                    onClick={() => handleAskAI('Where is my car parked?')}
                    className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0 font-medium hover:bg-brand-50 hover:text-brand-600"
                  >
                    📍 Where is my car?
                  </button>
                  <button
                    onClick={() => handleAskAI('What is my valet status?')}
                    className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0 font-medium hover:bg-brand-50 hover:text-brand-600"
                  >
                    🛵 Valet status & OTP
                  </button>
                  <button
                    onClick={() => handleAskAI('What is the fine for No-Parking?')}
                    className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0 font-medium hover:bg-brand-50 hover:text-brand-600"
                  >
                    ⚠️ No-parking fines
                  </button>
                  <button
                    onClick={() => handleAskAI('How does refund work?')}
                    className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0 font-medium hover:bg-brand-50 hover:text-brand-600"
                  >
                    💰 Refund policy
                  </button>
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAskAI(inputQuestion);
                  }}
                  className="p-3 border-t border-slate-200 dark:border-slate-800 flex gap-2"
                >
                  <input
                    type="text"
                    value={inputQuestion}
                    onChange={(e) => setInputQuestion(e.target.value)}
                    placeholder="Ask about spots, fines, valet, or rules..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-colors shadow-sm"
                  >
                    <Send size={14} />
                  </button>
                </form>
              </div>
            )}

            {/* Tab 2: Helpline Contacts */}
            {activeSubTab === 'helpline' && (
              <div className="p-5 overflow-y-auto space-y-4">
                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                      24/7 TOLL-FREE HELPLINE
                    </span>
                    <h4 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                      1800-SMART-PARK
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Toll-free emergency & booking dispute line
                    </p>
                  </div>
                  <a
                    href="tel:18007627872"
                    className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 transition-all"
                  >
                    <Phone size={18} />
                  </a>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        Facility Security Marshal
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Cyber Park On-Site Gate Guard (+91 80 4012 9900)
                      </p>
                    </div>
                    <a
                      href="tel:+918040129900"
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-600"
                    >
                      <Phone size={15} />
                    </a>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        Traffic Police Towing Cell
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Municipal Vehicle Recovery Helpline (+91 80 2294 2276)
                      </p>
                    </div>
                    <a
                      href="tel:+918022942276"
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-600"
                    >
                      <Phone size={15} />
                    </a>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        Valet Dispatch Supervisor
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Direct Handover Support (+91 94481 00021)
                      </p>
                    </div>
                    <a
                      href="tel:+919448100021"
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-600"
                    >
                      <Phone size={15} />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: FAQ Accordion */}
            {activeSubTab === 'faq' && (
              <div className="p-5 overflow-y-auto space-y-2.5 max-h-[440px]">
                {faqs.map((item, idx) => {
                  const isExpanded = expandedFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedFaqIndex(isExpanded ? null : idx)}
                        className="w-full p-3.5 text-left flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                          {item.q}
                        </span>
                        <ChevronDown
                          size={16}
                          className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {isExpanded && (
                        <div className="p-3.5 text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 whitespace-pre-line leading-relaxed">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
