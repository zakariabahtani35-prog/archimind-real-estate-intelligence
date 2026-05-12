import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrainCircuit, Sparkles, Calculator, Info, ShieldCheck, TrendingUp, AlertTriangle } from 'lucide-react';
import { MOROCCAN_CITIES, PROPERTY_TYPES, DISTRICTS_BY_CITY, formatCurrency } from '../lib/utils';
import { usePricePrediction } from '../hooks/usePrediction';

export function PredictionPanel() {
  const [city, setCity] = useState(MOROCCAN_CITIES[0]);
  const [district, setDistrict] = useState(() => {
    const initialDistricts = DISTRICTS_BY_CITY[MOROCCAN_CITIES[0]] || [];
    return initialDistricts.length > 0 ? initialDistricts[0] : '';
  });
  const [type, setType] = useState(PROPERTY_TYPES[0]);
  const [surface, setSurface] = useState(100);
  const [rooms, setRooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);
  const [age, setAge] = useState(5);

  const { predict, isPredicting, result: predictionResult } = usePricePrediction();

  const handlePredict = () => {
    predict({
      city,
      district,
      property_type: type,
      surface_m2: surface,
      bedrooms: rooms,
      bathrooms,
      property_age: age,
      parking: true,
      furnished: false
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
      {/* Prediction Form */}
      <div className="lg:col-span-7 glass-card p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <BrainCircuit size={200} />
        </div>
        
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-brand-blue/10 text-brand-blue">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="text-xl font-display font-semibold">Price Prediction Engine</h3>
            <p className="text-sm text-slate-500">Enter property parameters for high-precision valuation.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">City</label>
            <select 
              value={city}
              onChange={(e) => {
                const newCity = e.target.value;
                setCity(newCity);
                const districts = DISTRICTS_BY_CITY[newCity] || [];
                setDistrict(districts.length > 0 ? districts[0] : '');
              }}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue outline-none transition-all text-sm appearance-none"
            >
              {MOROCCAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">District</label>
            <select 
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue outline-none transition-all text-sm appearance-none"
            >
              {(DISTRICTS_BY_CITY[city] || []).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Property Type</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue outline-none transition-all text-sm appearance-none">
              {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Surface Area (m²)</label>
            <input 
              type="number" 
              value={surface} 
              onChange={(e) => setSurface(Number(e.target.value))}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue outline-none transition-all text-sm" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bedrooms</label>
              <input 
                type="number" 
                value={rooms} 
                onChange={(e) => setRooms(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue outline-none transition-all text-sm" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bathrooms</label>
              <input 
                type="number" 
                value={bathrooms} 
                onChange={(e) => setBathrooms(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue outline-none transition-all text-sm" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Property Age (Years)</label>
            <input 
              type="number" 
              value={age} 
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue outline-none transition-all text-sm" 
            />
          </div>
        </div>

        <button 
          onClick={handlePredict}
          disabled={isPredicting}
          className="w-full mt-10 py-4 bg-gradient-to-r from-brand-blue to-brand-purple text-white rounded-2xl font-bold tracking-tight shadow-xl shadow-brand-blue/20 hover:shadow-brand-blue/40 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isPredicting ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing Market Patterns...</span>
            </div>
          ) : (
            <>
              <BrainCircuit className="group-hover:rotate-12 transition-transform" />
              Predict Property Price
            </>
          )}
        </button>
      </div>

      {/* Result Panel */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <AnimatePresence mode="wait">
          {!predictionResult && !isPredicting ? (
            <motion.div 
              key="initial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 glass-card p-8 flex flex-col items-center justify-center text-center bg-slate-50/50 border-dashed"
            >
              <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 mb-6">
                <Calculator size={32} />
              </div>
              <h4 className="text-lg font-display font-semibold text-slate-700">Ready for Analysis</h4>
              <p className="text-sm text-slate-500 max-w-xs mt-2">The ML model is pre-loaded with Casablanca and Rabat market sets.</p>
            </motion.div>
          ) : isPredicting ? (
             <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 glass-card p-8 flex flex-col items-center justify-center text-center"
            >
              <div className="relative mb-10">
                <div className="w-24 h-24 rounded-full border-4 border-brand-blue/10 border-t-brand-blue animate-spin" />
                <BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-blue animate-pulse" size={32} />
              </div>
              <h4 className="text-lg font-display font-semibold text-slate-700">Deep Learning Inference</h4>
              <p className="text-sm text-slate-500 mt-2">Processing spatial features and historical correlation matrices...</p>
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 glass-card p-8 space-y-6 bg-gradient-to-br from-white to-brand-blue/5 border-brand-blue/20"
            >
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck size={12} /> Verified ML Result
                </span>
                <span className="text-[10px] font-medium text-slate-400">Timestamp: 10:42 AM</span>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Predicted Market Value</p>
                <h4 className="text-4xl font-display font-bold text-slate-900">{formatCurrency(predictionResult.predicted_price)}</h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 text-brand-blue mb-1">
                    <ShieldCheck size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Confidence</span>
                  </div>
                  <p className="text-xl font-display font-bold text-slate-800">{predictionResult.confidence_score}%</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 text-brand-purple mb-1">
                    <TrendingUp size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Investment</span>
                  </div>
                  <p className="text-xl font-display font-bold text-slate-800">{predictionResult.investment_score}/10</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Info size={14} />
                    <span className="text-sm">Market Category</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{predictionResult.market_category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-600">
                    <AlertTriangle size={14} />
                    <span className="text-sm">Volatility Risk</span>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">{predictionResult.risk_level}</span>
                </div>
              </div>

              <div className="mt-8 p-4 bg-slate-900 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-slate-800 transition-colors">
                <span className="text-xs font-semibold text-white">Generate Full ML Report</span>
                <Sparkles size={14} className="text-brand-purple" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
