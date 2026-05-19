import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, BrainCircuit, Calculator, ShieldCheck } from 'lucide-react';
import { MOROCCAN_CITIES, PROPERTY_TYPES, DISTRICTS_BY_CITY, formatCurrency } from '../lib/utils';
import { usePricePrediction } from '../hooks/usePrediction';

const inputClass = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100';

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
  const [floor, setFloor] = useState(1);
  const [age, setAge] = useState(5);
  const [formError, setFormError] = useState<string | null>(null);

  const { predict, isPredicting, result: predictionResult, error } = usePricePrediction();

  const localValidation = useMemo(() => {
    if (!city.trim()) return 'City is required.';
    if (!district.trim()) return 'District is required.';
    if (!type.trim()) return 'Property type is required.';
    if (surface <= 10 || surface >= 2000) return 'Surface must be greater than 10 and less than 2000 m2.';
    if (rooms < 0 || rooms > 20) return 'Bedrooms must be between 0 and 20.';
    if (bathrooms < 0 || bathrooms > 20) return 'Bathrooms must be between 0 and 20.';
    if (floor < -2 || floor > 100) return 'Floor must be between -2 and 100.';
    if (age < 0 || age > 150) return 'Property age must be between 0 and 150 years.';
    return null;
  }, [age, bathrooms, city, district, floor, rooms, surface, type]);

  const handlePredict = () => {
    setFormError(localValidation);
    if (localValidation) return;
    predict({
      city,
      district,
      property_type: type,
      surface_m2: surface,
      bedrooms: rooms,
      bathrooms,
      floor,
      property_age: age,
      parking: false,
      furnished: false,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
      <div className="lg:col-span-7 rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Price Prediction</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Regression Inference</h3>
            <p className="mt-1 text-sm text-slate-500">Validated property inputs are sent to the exported sklearn pipeline.</p>
          </div>
          <div className="rounded-lg bg-slate-100 p-3 text-slate-700">
            <BrainCircuit size={24} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">City</span>
            <select
              value={city}
              onChange={(event) => {
                const newCity = event.target.value;
                setCity(newCity);
                const districts = DISTRICTS_BY_CITY[newCity] || [];
                setDistrict(districts.length > 0 ? districts[0] : '');
              }}
              className={inputClass}
            >
              {MOROCCAN_CITIES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">District</span>
            <select value={district} onChange={(event) => setDistrict(event.target.value)} className={inputClass}>
              {(DISTRICTS_BY_CITY[city] || []).map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Property Type</span>
            <select value={type} onChange={(event) => setType(event.target.value)} className={inputClass}>
              {PROPERTY_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Surface Area (m2)</span>
            <input type="number" min={11} max={1999} value={surface} onChange={(event) => setSurface(Number(event.target.value))} className={inputClass} />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bedrooms</span>
            <input type="number" min={0} max={20} value={rooms} onChange={(event) => setRooms(Number(event.target.value))} className={inputClass} />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bathrooms</span>
            <input type="number" min={0} max={20} value={bathrooms} onChange={(event) => setBathrooms(Number(event.target.value))} className={inputClass} />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Floor</span>
            <input type="number" min={-2} max={100} value={floor} onChange={(event) => setFloor(Number(event.target.value))} className={inputClass} />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Property Age</span>
            <input type="number" min={0} max={150} value={age} onChange={(event) => setAge(Number(event.target.value))} className={inputClass} />
          </label>
        </div>

        <button
          onClick={handlePredict}
          disabled={isPredicting}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <BrainCircuit size={18} />
          {isPredicting ? 'Running inference...' : 'Predict Price'}
        </button>

        {(formError || error) && (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {formError || error}
          </div>
        )}
      </div>

      <div className="lg:col-span-5">
        <AnimatePresence mode="wait">
          {!predictionResult && !isPredicting ? (
            <motion.div
              key="initial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-h-[420px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm"
            >
              <Calculator size={34} className="mb-4 text-slate-400" />
              <h4 className="text-lg font-semibold text-slate-800">Ready for Regression</h4>
              <p className="mt-2 max-w-sm text-sm text-slate-500">The result includes the model artifact name, RMSE-derived estimated range, and distribution warnings.</p>
            </motion.div>
          ) : isPredicting ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-[420px] flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="mb-6 h-12 w-12 rounded-full border-4 border-slate-100 border-t-slate-700 animate-spin" />
              <h4 className="text-lg font-semibold text-slate-800">Model Inference</h4>
              <p className="mt-2 text-sm text-slate-500">Preprocessing, encoding, scaling, and prediction are running on the backend.</p>
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <ShieldCheck size={13} /> Exported model
                </span>
                <span className="text-xs font-medium text-slate-500">{predictionResult.model_name}</span>
              </div>

              <div className="mt-8">
                <p className="text-sm font-medium text-slate-500">Predicted market value</p>
                <h4 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">{formatCurrency(predictionResult.predicted_price)}</h4>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estimated range from validation RMSE</p>
                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {predictionResult.estimated_range.lower != null && predictionResult.estimated_range.upper != null
                      ? `${formatCurrency(predictionResult.estimated_range.lower)} - ${formatCurrency(predictionResult.estimated_range.upper)}`
                      : 'Unavailable'}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Model reliability indicator</p>
                  <p className="mt-2 text-sm font-semibold capitalize text-slate-800">{predictionResult.model_reliability_indicator.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{predictionResult.model_reliability_indicator.basis}</p>
                </div>
              </div>

              {predictionResult.warnings.length > 0 && (
                <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-800">
                    <AlertTriangle size={16} /> Interpretation warning
                  </div>
                  <ul className="space-y-1 text-xs text-amber-800">
                    {predictionResult.warnings.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
