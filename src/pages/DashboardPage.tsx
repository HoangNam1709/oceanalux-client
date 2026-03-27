import React, { useState } from "react";
import { User, Anchor, Settings, LogOut, ChevronRight, MapPin, Calendar as CalIcon, Clock, Ship, CheckCircle2 } from "lucide-react";
import { mockCruises } from "./data/mockData";
import { motion } from "motion/react";

export function DashboardPage() {
  const [activeTab, setActiveTab] = useState("bookings");

  const pastBooking = mockCruises[2]; // Caribbean Pearl
  const upcomingBooking = mockCruises[0]; // Stellar Seas

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="bg-slate-900 rounded-3xl p-8 md:p-12 mb-8 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-slate-900 text-3xl font-bold font-serif shadow-inner border-4 border-slate-800">
              JD
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-serif font-bold text-white mb-2">Welcome Back, John</h1>
              <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1"><Ship className="w-4 h-4 text-amber-500" /> OceanaLux Gold Member</span>
                <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                <span>Member since 2023</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Nav */}
          <div className="w-full lg:w-64 shrink-0">
            <nav className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-2 sticky top-28">
              {[
                { id: 'bookings', icon: Anchor, label: 'My Voyages' },
                { id: 'profile', icon: User, label: 'Profile Details' },
                { id: 'settings', icon: Settings, label: 'Preferences' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    activeTab === item.id 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <item.icon className="w-5 h-5" /> {item.label}
                </button>
              ))}
              <div className="pt-4 mt-4 border-t border-slate-100">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut className="w-5 h-5" /> Sign Out
                </button>
              </div>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {activeTab === 'bookings' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                
                {/* Upcoming Booking */}
                <section>
                  <h2 className="text-xl font-serif font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <CalIcon className="w-5 h-5 text-amber-500" /> Upcoming Voyage
                  </h2>
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
                    <div className="w-full md:w-2/5 h-48 md:h-auto relative">
                      <img src={upcomingBooking.images[0]} alt="Upcoming" className="w-full h-full object-cover" />
                      <div className="absolute top-4 left-4 bg-amber-500 text-slate-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                        In 45 Days
                      </div>
                    </div>
                    <div className="p-6 md:p-8 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {upcomingBooking.destination}
                          </div>
                          <h3 className="text-2xl font-bold font-serif text-slate-900">{upcomingBooking.name}</h3>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Booking Ref</span>
                          <span className="font-mono font-bold text-slate-900">OCL-892471</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <span className="text-xs text-slate-500 uppercase font-semibold block mb-1">Departure</span>
                          <span className="font-medium text-slate-900">Oct 15, 2026</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <span className="text-xs text-slate-500 uppercase font-semibold block mb-1">Duration</span>
                          <span className="font-medium text-slate-900">{upcomingBooking.durationDays} Days</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <span className="text-xs text-slate-500 uppercase font-semibold block mb-1">Cabin</span>
                          <span className="font-medium text-slate-900">Azure Ocean Suite</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <span className="text-xs text-slate-500 uppercase font-semibold block mb-1">Status</span>
                          <span className="font-medium text-green-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Confirmed</span>
                        </div>
                      </div>

                      <div className="mt-auto flex gap-3">
                        <button className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-amber-500 hover:text-slate-900 transition-colors shadow-sm">
                          Manage Booking
                        </button>
                        <button className="flex-1 bg-white border-2 border-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm hover:border-slate-900 hover:text-slate-900 transition-colors">
                          View Itinerary
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Past Bookings */}
                <section>
                  <h2 className="text-xl font-serif font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-slate-400" /> Past Voyages
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row items-center gap-6 group hover:shadow-md transition-shadow">
                      <img src={pastBooking.images[0]} alt="Past" className="w-24 h-24 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 text-center md:text-left">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{pastBooking.destination}</div>
                        <h3 className="text-lg font-bold font-serif text-slate-900 mb-1">{pastBooking.name}</h3>
                        <p className="text-sm text-slate-600">Sailed on May 12, 2024 • {pastBooking.durationDays} Days</p>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                        <button className="text-sm font-semibold text-amber-600 bg-amber-50 px-4 py-2 rounded-lg hover:bg-amber-100 transition-colors">
                          Write Review
                        </button>
                        <button className="text-sm font-semibold text-slate-600 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                          View Receipt
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">Personal Information</h2>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                      <input type="text" defaultValue="John" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                      <input type="text" defaultValue="Doe" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                      <input type="email" defaultValue="john.doe@example.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                      <input type="tel" defaultValue="+1 (555) 123-4567" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
                    </div>
                  </div>
                  <div className="pt-6">
                    <button type="button" className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-amber-500 hover:text-slate-900 transition-colors shadow-md">
                      Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                 <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">Preferences</h2>
                 <div className="space-y-6">
                   <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                     <div>
                       <h4 className="font-bold text-slate-900">Marketing Emails</h4>
                       <p className="text-sm text-slate-500">Receive special offers and newsletter updates.</p>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                   </div>
                   <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                     <div>
                       <h4 className="font-bold text-slate-900">SMS Notifications</h4>
                       <p className="text-sm text-slate-500">Get important voyage updates via text message.</p>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                   </div>
                 </div>
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
