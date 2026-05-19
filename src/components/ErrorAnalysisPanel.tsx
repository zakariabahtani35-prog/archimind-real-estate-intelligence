import React, { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { MLService } from '../services/api';
import { ErrorAnalysisReport } from '../types/ml';
import { formatCurrency } from '../lib/utils';

const formatNumber = (value?: number) =>
  typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 0 }) : 'N/A';

export function ErrorAnalysisPanel() {
  const [report, setReport] = useState<ErrorAnalysisReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    MLService.getErrorAnalysis()
      .then((data) => {
        if (mounted) setReport(data);
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err.message : 'Unable to load error analysis.');
      });
    return () => {
      mounted = false;
    };
  }, []);

  const cityData = useMemo(() => report?.regression?.mae_by_city?.slice(0, 10) ?? [], [report]);
  const residual = report?.regression?.residual_summary;

  if (error) return <div className="rounded-lg border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700">{error}</div>;
  if (!report) return <div className="rounded-lg border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">Loading error analysis...</div>;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Error Analysis</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Residuals and Failure Modes</h3>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        The current table is modest in size after valid surface filtering. Segment-level errors should be read as diagnostics, not final market benchmarks.
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ['MAE', residual?.mae],
          ['RMSE', residual?.rmse],
          ['Mean Residual', residual?.mean_residual],
          ['Test Rows', residual?.test_rows],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">{formatNumber(value as number | undefined)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <h4 className="text-lg font-semibold text-slate-900">MAE by City</h4>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="group" fontSize={10} axisLine={false} tickLine={false} interval={0} angle={-20} height={70} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="mae" fill="#334155" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <h4 className="text-lg font-semibold text-slate-900">Worst Classification Class</h4>
          {report.classification?.worst_performing_class ? (
            <div className="mt-6 rounded-lg bg-slate-50 p-5">
              <p className="text-2xl font-semibold capitalize text-slate-900">{report.classification.worst_performing_class.class}</p>
              <p className="mt-2 text-sm text-slate-500">
                F1 {report.classification.worst_performing_class.f1.toFixed(3)} · Precision {report.classification.worst_performing_class.precision.toFixed(3)} · Recall {report.classification.worst_performing_class.recall.toFixed(3)}
              </p>
            </div>
          ) : (
            <p className="mt-6 text-sm text-slate-500">Classification diagnostics unavailable.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {[
          ['Top Over-Predicted', report.regression?.top_over_predicted_samples ?? []],
          ['Top Under-Predicted', report.regression?.top_under_predicted_samples ?? []],
        ].map(([title, rows]) => (
          <div key={title as string} className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
            <h4 className="text-lg font-semibold text-slate-900">{title as string}</h4>
            <div className="mt-4 space-y-3">
              {(rows as Array<Record<string, unknown>>).slice(0, 5).map((row, index) => (
                <div key={index} className="rounded-lg bg-slate-50 p-4 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-slate-800">{String(row.city ?? 'Unknown')} · {String(row.district ?? 'Unknown')}</span>
                    <span className="font-mono text-xs text-slate-500">{formatNumber(Number(row.residual ?? 0))}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Actual {formatCurrency(Number(row.actual_price ?? 0))} · Predicted {formatCurrency(Number(row.predicted_price ?? 0))}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
