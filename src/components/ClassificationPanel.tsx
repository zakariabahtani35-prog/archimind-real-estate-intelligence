import React, { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Layers } from 'lucide-react';
import { MLService } from '../services/api';
import { ClassificationResponse } from '../types/ml';
import { DISTRICTS_BY_CITY, MOROCCAN_CITIES, PROPERTY_TYPES } from '../lib/utils';

const inputClass = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100';

export function ClassificationPanel() {
  const [city, setCity] = useState(MOROCCAN_CITIES[0]);
  const [district, setDistrict] = useState(DISTRICTS_BY_CITY[MOROCCAN_CITIES[0]]?.[0] ?? '');
  const [propertyType, setPropertyType] = useState(PROPERTY_TYPES[0]);
  const [surface, setSurface] = useState(100);
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);
  const [floor, setFloor] = useState(1);
  const [age, setAge] = useState(5);
  const [result, setResult] = useState<ClassificationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const probabilityData = useMemo(
    () => Object.entries(result?.class_probabilities ?? {}).map(([label, probability]) => ({ label, probability })),
    [result],
  );

  const runClassification = async () => {
    setError(null);
    setResult(null);
    setIsLoading(true);
    try {
      const data = await MLService.predictType({
        city,
        district,
        property_type: propertyType,
        surface_m2: surface,
        bedrooms,
        bathrooms,
        floor,
        property_age: age,
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Classification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm lg:col-span-5">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Classification</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Price Band Classifier</h3>
          </div>
          <div className="rounded-lg bg-slate-100 p-3 text-slate-700">
            <Layers size={22} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <select
            value={city}
            onChange={(event) => {
              const nextCity = event.target.value;
              setCity(nextCity);
              setDistrict(DISTRICTS_BY_CITY[nextCity]?.[0] ?? '');
            }}
            className={inputClass}
          >
            {MOROCCAN_CITIES.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={district} onChange={(event) => setDistrict(event.target.value)} className={inputClass}>
            {(DISTRICTS_BY_CITY[city] ?? []).map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={propertyType} onChange={(event) => setPropertyType(event.target.value)} className={inputClass}>
            {PROPERTY_TYPES.map((item) => <option key={item}>{item}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input className={inputClass} type="number" min={11} max={1999} value={surface} onChange={(event) => setSurface(Number(event.target.value))} />
            <input className={inputClass} type="number" min={0} max={20} value={bedrooms} onChange={(event) => setBedrooms(Number(event.target.value))} />
            <input className={inputClass} type="number" min={0} max={20} value={bathrooms} onChange={(event) => setBathrooms(Number(event.target.value))} />
            <input className={inputClass} type="number" min={-2} max={100} value={floor} onChange={(event) => setFloor(Number(event.target.value))} />
            <input className={inputClass} type="number" min={0} max={150} value={age} onChange={(event) => setAge(Number(event.target.value))} />
          </div>
        </div>

        <button
          onClick={runClassification}
          disabled={isLoading}
          className="mt-6 w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {isLoading ? 'Classifying...' : 'Classify Price Band'}
        </button>
        {error && <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm lg:col-span-7">
        {!result ? (
          <div className="flex min-h-[360px] flex-col justify-center text-center">
            <h4 className="text-lg font-semibold text-slate-800">Class meaning</h4>
            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
              When no real categorical label is available, the backend derives low, medium, and high classes from price-per-square-meter quantiles in the training data.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium text-slate-500">Predicted class</p>
            <h4 className="mt-2 text-4xl font-semibold capitalize tracking-tight text-slate-950">{result.predicted_label}</h4>
            <p className="mt-2 text-sm text-slate-500">Label source: {result.label_source ?? 'unknown'} · Model: {result.model_name}</p>
            <p className="mt-1 text-sm text-slate-500">Maximum class probability: {(result.confidence_score * 100).toFixed(1)}%</p>

            <div className="mt-8 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={probabilityData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="label" fontSize={12} axisLine={false} tickLine={false} />
                  <YAxis fontSize={12} axisLine={false} tickLine={false} tickFormatter={(value) => `${Number(value) * 100}%`} />
                  <Tooltip formatter={(value) => `${(Number(value) * 100).toFixed(1)}%`} />
                  <Bar dataKey="probability" fill="#334155" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
