import React, { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { MLService } from '../services/api';
import { FeatureImportanceReport } from '../types/ml';

export function FeatureImportancePanel() {
  const [report, setReport] = useState<FeatureImportanceReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    MLService.getFeatureImportance()
      .then((data) => {
        if (mounted) setReport(data);
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err.message : 'Unable to load feature importance.');
      });
    return () => {
      mounted = false;
    };
  }, []);

  const data = useMemo(
    () => report?.regression?.top_features?.map((row) => ({ feature: row.feature, importance: row.importance })).slice(0, 20) ?? [],
    [report],
  );

  if (error) return <div className="rounded-lg border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700">{error}</div>;
  if (!report) return <div className="rounded-lg border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">Loading feature importance...</div>;

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
      <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm xl:col-span-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Feature Importance</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Top Regression Drivers</h3>
        <p className="mt-1 text-sm text-slate-500">Model: {report.regression?.model_name ?? 'Unavailable'} · Method: {report.regression?.method ?? 'Unavailable'}</p>
        <div className="mt-8 h-[520px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 120, right: 24 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
              <XAxis type="number" fontSize={11} axisLine={false} tickLine={false} />
              <YAxis dataKey="feature" type="category" fontSize={11} width={170} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => Number(value).toFixed(4)} />
              <Bar dataKey="importance" fill="#334155" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm xl:col-span-4">
        <h4 className="text-lg font-semibold text-slate-900">Which variables influence prices most?</h4>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          The chart is extracted from the exported model after preprocessing. When one-hot encoding is available, categorical levels appear as separate model inputs. Importance values describe model usage, not causal effects.
        </p>
        <div className="mt-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          Small datasets and scraped listing noise can make importances unstable. Treat this as model interpretation, not a market law.
        </div>
      </div>
    </div>
  );
}
