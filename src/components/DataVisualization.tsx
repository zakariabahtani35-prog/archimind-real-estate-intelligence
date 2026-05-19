import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
} from 'recharts';
import { MLService } from '../services/api';
import { AnalyticsData } from '../types/ml';

export function DataVisualization() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    MLService.getAnalytics()
      .then((data) => {
        if (mounted) setAnalytics(data);
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err.message : 'Unable to load analytics.');
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return <div className="glass-card p-8 mb-12 text-sm text-slate-500">Loading market analytics...</div>;
  }

  if (error || !analytics) {
    return <div className="glass-card p-8 mb-12 text-sm text-rose-700">{error ?? 'No analytics available.'}</div>;
  }

  return (
    <div className="space-y-8 mb-12">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-display font-semibold">Market Analytics Intelligence</h3>
          <p className="text-sm text-slate-500">Aggregated from the backend OBT service.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="glass-card p-6 min-h-[350px] flex flex-col">
          <h4 className="text-sm font-bold text-slate-800 mb-6 flex items-center justify-between">Price Distribution (MAD)</h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.price_distribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="price" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(10, 132, 255, 0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {analytics.price_distribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 3 ? '#0A84FF' : '#E2E8F0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 min-h-[350px] flex flex-col">
          <h4 className="text-sm font-bold text-slate-800 mb-6">Feature Importance</h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={analytics.feature_importance} margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" hide />
                <YAxis dataKey="feature" type="category" fontSize={10} axisLine={false} tickLine={false} width={90} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="score" fill="#9B51E0" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 min-h-[350px] flex flex-col">
          <h4 className="text-sm font-bold text-slate-800 mb-6">Monthly Price Index</h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.market_trends}>
                <defs>
                  <linearGradient id="area-blue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0A84FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0A84FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="price" stroke="#0A84FF" strokeWidth={3} fillOpacity={1} fill="url(#area-blue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
