import React from 'react';
import { ShieldCheck, TrendingUp, Info } from 'lucide-react';
import { MODEL_METRICS_DATA } from '../lib/data';
import { cn } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const comparisonData = [
  { name: 'XGBoost', accuracy: 94.2, latency: 12 },
  { name: 'RandomForest', accuracy: 91.8, latency: 45 },
  { name: 'LGBM', accuracy: 93.5, latency: 15 },
  { name: 'CatBoost', accuracy: 92.4, latency: 28 },
];

export function ModelPerformance() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-12">
      <div className="xl:col-span-8 glass-card p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-display font-semibold">Model Performance Center</h3>
            <p className="text-sm text-slate-500">Cross-validation results for multi-regional regression models.</p>
          </div>
          <button className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-white transition-all">
            Compare History
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">Model Name</th>
                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">MAE (MAD)</th>
                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">R² Score</th>
                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">RMSE</th>
                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MODEL_METRICS_DATA.map((model) => (
                <tr key={model.name} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <p className="text-sm font-semibold text-slate-800">{model.name}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm font-medium text-slate-600">{model.mae}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm font-bold text-slate-900">{model.r2}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm font-medium text-slate-600">{model.rmse}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-[10px] font-bold",
                      model.status === 'Best' ? "bg-emerald-100 text-emerald-700" :
                      model.status === 'Experimental' ? "bg-amber-100 text-amber-700" :
                      "bg-slate-100 text-slate-600"
                    )}>
                      {model.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="xl:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex-1">
          <h4 className="text-sm font-bold text-slate-800 mb-6 flex items-center justify-between">
            Inference Latency vs Performance
            <Info size={14} className="text-slate-400" />
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="accuracy" fill="#0A84FF" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
             <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Current Production Model</span>
                <span className="text-xs font-bold text-brand-blue">XGBoost v2.4</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
