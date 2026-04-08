import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router";
import { Clock, Users, User, Mail, Phone, ChevronRight, Check, AlertCircle } from "lucide-react";
import { mockCruises } from "./data/mockData";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "react-hot-toast";
export function BookingPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const cabinId = searchParams.get("cabin");
  const navigate = useNavigate();

  const cruise = mockCruises.find(c => c.id === id);
  const cabin = cruise?.cabins.find(c => c.id === cabinId);

  // Flow State
  const [step, setStep] = useState(1);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    guests: 2
  });

  useEffect(() => {
    if (!cruise || !cabin) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.error("Your session has expired.");
          navigate(`/cruise/${id}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cruise, cabin, navigate, id]);

  if (!cruise || !cabin) return <div className="p-20 text-center">Invalid booking request.</div>;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) setStep(step + 1);
    else navigate(`/checkout?cruise=${id}&cabin=${cabinId}`);
  };

  const steps = [
    { id: 1, title: "Lead Guest" },
    { id: 2, title: "Additional Info" },
    { id: 3, title: "Review" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Column - Booking Flow */}
        <div className="lg:w-2/3 order-2 lg:order-1">
          {/* Progress Stepper */}
          <div className="mb-12">
            <div className="flex items-center justify-between relative before:absolute before:inset-0 before:top-1/2 before:-translate-y-1/2 before:h-0.5 before:bg-slate-200 before:z-0">
              {steps.map((s, idx) => (
                <div key={s.id} className="relative z-10 flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2 ${
                    step > s.id ? 'bg-amber-500 border-amber-500 text-white' : 
                    step === s.id ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300 text-slate-400'
                  }`}>
                    {step > s.id ? <Check className="w-5 h-5" /> : s.id}
                  </div>
                  <span className={`text-xs font-semibold uppercase tracking-wider mt-2 ${step >= s.id ? 'text-slate-900' : 'text-slate-400'}`}>
                    {s.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <motion.div 
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8"
          >
            <form onSubmit={handleNext}>
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-serif font-bold text-slate-900 border-b border-slate-100 pb-4">Lead Guest Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                      <input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                      <input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                      <input required type="email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                      <input required type="tel" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Number of Guests (including lead)</label>
                    <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all" value={formData.guests} onChange={e => setFormData({...formData, guests: Number(e.target.value)})}>
                      {[...Array(cabin.capacity)].map((_, i) => (
                        <option key={i+1} value={i+1}>{i+1} {i === 0 ? 'Guest' : 'Guests'}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-serif font-bold text-slate-900 border-b border-slate-100 pb-4">Additional Information</h2>
                  <p className="text-slate-600 mb-4">Please provide any special requests or dietary requirements.</p>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Special Requests</label>
                    <textarea rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all resize-none" placeholder="e.g., Anniversary celebration, allergies, accessibility needs..."></textarea>
                  </div>
                  
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex gap-4 mt-6 items-start">
                    <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-amber-900 text-sm">Travel Insurance Recommended</h4>
                      <p className="text-xs text-amber-800 mt-1">We strongly advise purchasing travel insurance for your voyage. You can add this during checkout.</p>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-serif font-bold text-slate-900 border-b border-slate-100 pb-4">Review Your Details</h2>
                  
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 grid gap-4">
                    <div className="grid grid-cols-2 pb-4 border-b border-slate-200">
                      <span className="text-sm font-semibold text-slate-500 uppercase">Lead Guest</span>
                      <span className="text-sm font-bold text-slate-900 text-right">{formData.firstName} {formData.lastName}</span>
                    </div>
                    <div className="grid grid-cols-2 pb-4 border-b border-slate-200">
                      <span className="text-sm font-semibold text-slate-500 uppercase">Contact</span>
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-900 block">{formData.email}</span>
                        <span className="text-sm font-bold text-slate-900 block">{formData.phone}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 pb-4 border-b border-slate-200">
                      <span className="text-sm font-semibold text-slate-500 uppercase">Party Size</span>
                      <span className="text-sm font-bold text-slate-900 text-right">{formData.guests} {formData.guests > 1 ? 'Guests' : 'Guest'}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm font-semibold text-slate-500 uppercase">Cabin Type</span>
                      <span className="text-sm font-bold text-slate-900 text-right">{cabin.name}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-6">
                    <input type="checkbox" required id="terms" className="w-5 h-5 accent-amber-500 cursor-pointer" />
                    <label htmlFor="terms" className="text-sm text-slate-600">I confirm that all details are correct and I agree to the <a href="#" className="text-amber-600 font-bold hover:underline">Terms & Conditions</a>.</label>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                {step > 1 ? (
                  <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-3 text-slate-500 font-bold hover:text-slate-900 transition-colors">
                    Back
                  </button>
                ) : <div></div>}
                
                <button type="submit" className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-amber-500 hover:text-slate-900 transition-all shadow-lg flex items-center gap-2">
                  {step === 3 ? 'Proceed to Payment' : 'Continue'} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Right Column - Reservation Summary & Timer */}
        <div className="lg:w-1/3 order-1 lg:order-2">
          
          {/* Hold Timer */}
          <div className="bg-slate-900 rounded-2xl p-6 mb-6 flex items-center justify-between text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-amber-500 mb-1">Room Held For</h4>
              <div className="text-3xl font-mono font-bold">{formatTime(timeLeft)}</div>
            </div>
            <Clock className="w-10 h-10 text-white/20" />
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden sticky top-28">
            <div className="h-48 relative">
              <img src={cruise.images[0]} alt={cruise.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">{cruise.destination}</div>
                <h3 className="text-xl font-bold font-serif">{cruise.name}</h3>
              </div>
            </div>
            
            <div className="p-6">
              <h4 className="text-lg font-bold text-slate-900 mb-4 pb-4 border-b border-slate-100">Booking Summary</h4>
              
              <div className="space-y-4 mb-6">
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Cabin Selection</span>
                  <div className="font-bold text-slate-900">{cabin.name}</div>
                  <div className="text-sm text-slate-600">{cabin.type}</div>
                </div>
                
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Itinerary</span>
                  <div className="font-bold text-slate-900">{cruise.durationDays} Days / {cruise.durationNights} Nights</div>
                  <div className="text-sm text-slate-600">Departing from {cruise.itinerary[0]?.location.split(',')[0] || 'TBA'}</div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Cabin Price ({formData.guests} guests)</span>
                  <span className="font-bold text-slate-900">${cabin.pricePerNight * cruise.durationNights * formData.guests}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Taxes & Port Fees</span>
                  <span className="font-bold text-slate-900">${250 * formData.guests}</span>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-slate-900 uppercase">Total Estimate</span>
                  <span className="text-2xl font-bold text-amber-600">${(cabin.pricePerNight * cruise.durationNights * formData.guests) + (250 * formData.guests)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
