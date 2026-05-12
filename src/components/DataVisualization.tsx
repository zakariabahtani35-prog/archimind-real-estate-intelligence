import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { PRICE_DISTRIBUTION, PROPERTY_TYPE_DIST, FEATURE_IMPORTANCE, MARKET_TRENDS } from '../lib/data';

const COLORS = ['#0A84FF', '#9B51E0', '#10B981', '#F59E0B', '#EF4444'];

export function DataVisualization() {
  return (
    <div className="space-y-8 mb-12">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-display font-semibold">Market Analytics Intelligence</h3>
          <p className="text-sm text-slate-500">Real-time data stream from Moroccan regional listing APIs.</p>
        </div>
        <div className="flex gap-2">
          {['24h', '7d', '30d', '1y'].map(range => (
            <button key={range} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-500 hover:border-brand-blue hover:text-brand-blue transition-all">
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Price Distribution */}
        <div className="glass-card p-6 min-h-[350px] flex flex-col">
          <h4 className="text-sm font-bold text-slate-800 mb-6 flex items-center justify-between">
            Price Distribution (MAD)
            <span className="text-[10px] text-slate-400 font-normal">N = 42,852</span>
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PRICE_DISTRIBUTION}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="price" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(10, 132, 255, 0.05)' }} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {PRICE_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 3 ? '#0A84FF' : '#E2E8F0'} className="hover:fill-brand-blue transition-all duration-300" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature Importance */}
        <div className="glass-card p-6 min-h-[350px] flex flex-col">
          <h4 className="text-sm font-bold text-slate-800 mb-6">SHAP Feature Importance</h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={FEATURE_IMPORTANCE} margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" hide />
                <YAxis dataKey="feature" type="category" fontSize={10} axisLine={false} tickLine={false} width={80} />
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="score" fill="url(#gradient-purple)" radius={[0, 4, 4, 0]}>
                  <defs>
                    <linearGradient id="gradient-purple" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#9B51E0" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#9B51E0" />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Market Trends Area Chart */}
        <div className="glass-card p-6 min-h-[350px] flex flex-col">
          <h4 className="text-sm font-bold text-slate-800 mb-6">Monthly Price Index (Casablanca)</h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MARKET_TRENDS}>
                <defs>
                  <linearGradient id="area-blue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0A84FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0A84FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="price" stroke="#0A84FF" strokeWidth={3} fillOpacity={1} fill="url(#area-blue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
