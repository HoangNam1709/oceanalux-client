import React, { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Search, Filter, Star, Clock, MapPin, ChevronRight, SlidersHorizontal, Ship } from "lucide-react";
import { mockCruises } from "./data/mockData";
import { motion } from "motion/react";

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const initialDest = searchParams.get("dest") || "";
  
  const [destination, setDestination] = useState(initialDest);
  const [priceRange, setPriceRange] = useState(3000);
  const [minRating, setMinRating] = useState(4);
  const [duration, setDuration] = useState("any");

  // Basic filtering
  const filteredCruises = mockCruises.filter(c => {
    if (destination && !c.destination.toLowerCase().includes(destination.toLowerCase())) return false;
    if (c.basePrice > priceRange) return false;
    if (c.starRating < minRating) return false;
    if (duration !== "any") {
      if (duration === "short" && c.durationDays > 5) return false;
      if (duration === "medium" && (c.durationDays <= 5 || c.durationDays > 10)) return false;
      if (duration === "long" && c.durationDays <= 10) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">Find Your Voyage</h1>
          <p className="text-slate-600">Discover {filteredCruises.length} luxury cruises matching your preferences.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-80 flex-shrink-0"
          >
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-28">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                <SlidersHorizontal className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold text-slate-900">Filters</h2>
              </div>

              {/* Destination Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Destination</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Mediterranean"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-shadow"
                  />
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <div className="flex justify-between items-end mb-3">
                  <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider">Max Price</label>
                  <span className="text-sm font-bold text-amber-600">${priceRange}</span>
                </div>
                <input 
                  type="range" 
                  min="500" 
                  max="5000" 
                  step="100"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-amber-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
                  <span>$500</span>
                  <span>$5000+</span>
                </div>
              </div>

              {/* Star Rating Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Min Rating</label>
                <div className="flex gap-2">
                  {[3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border text-sm font-medium transition-colors ${minRating === rating ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      {rating} <Star className={`w-4 h-4 ${minRating === rating ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Duration</label>
                <div className="space-y-2">
                  {[
                    { id: 'any', label: 'Any length' },
                    { id: 'short', label: '1-5 Days' },
                    { id: 'medium', label: '6-10 Days' },
                    { id: 'long', label: '11+ Days' },
                  ].map(opt => (
                    <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${duration === opt.id ? 'bg-amber-500 border-amber-500' : 'border-slate-300 group-hover:border-amber-500'}`}>
                        {duration === opt.id && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                      </div>
                      <span className="text-sm text-slate-700 font-medium group-hover:text-slate-900 transition-colors">{opt.label}</span>
                      <input 
                        type="radio" 
                        name="duration" 
                        className="hidden" 
                        checked={duration === opt.id}
                        onChange={() => setDuration(opt.id)}
                      />
                    </label>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={() => {
                  setDestination("");
                  setPriceRange(3000);
                  setMinRating(4);
                  setDuration("any");
                }}
                className="w-full py-3 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Reset Filters
              </button>
            </div>
          </motion.div>

          {/* Results Grid */}
          <div className="flex-1">
            {filteredCruises.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
                <Ship className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No voyages found</h3>
                <p className="text-slate-500">Try adjusting your filters to discover more options.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredCruises.map((cruise, index) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={cruise.id} 
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-lg transition-shadow flex flex-col md:flex-row group"
                  >
                    {/* Image Area */}
                    <div className="relative w-full md:w-72 h-48 md:h-auto flex-shrink-0 overflow-hidden">
                      <img 
                        src={cruise.images[0]} 
                        alt={cruise.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-2 py-1 rounded-md text-xs font-bold text-slate-900 shadow-sm flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        {cruise.starRating}
                      </div>
                      {cruise.featured && (
                        <div className="absolute top-3 right-3 bg-amber-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-sm uppercase tracking-wider">
                          Featured
                        </div>
                      )}
                    </div>

                    {/* Content Area */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">{cruise.destination}</div>
                          <h3 className="text-xl font-bold font-serif text-slate-900 group-hover:text-amber-700 transition-colors"><Link to={`/cruise/${cruise.id}`}>{cruise.name}</Link></h3>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">From</span>
                          <span className="text-2xl font-bold text-slate-900">${cruise.basePrice}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span>{cruise.durationDays} Days</span>
                        </div>
                        <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                        <span>Multiple Departure Ports</span>
                      </div>

                      <p className="text-sm text-slate-600 line-clamp-2 mb-6 flex-1">
                        {cruise.description}
                      </p>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                        <div className="flex gap-2">
                          {cruise.facilities.slice(0, 3).map(fac => (
                            <span key={fac} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                              {fac}
                            </span>
                          ))}
                          {cruise.facilities.length > 3 && (
                            <span className="px-2 py-1 bg-slate-50 text-slate-500 rounded text-xs font-medium">
                              +{cruise.facilities.length - 3}
                            </span>
                          )}
                        </div>
                        <Link 
                          to={`/cruise/${cruise.id}`}
                          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-amber-500 hover:text-slate-900 transition-colors shadow-sm"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
