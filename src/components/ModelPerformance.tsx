import React, { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { MLService } from '../services/api';
import { ClassificationReport, RegressionReport } from '../types/ml';
import { cn } from '../lib/utils';

const formatNumber = (value?: number | null, digits = 2) =>
  typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: digits }) : 'N/A';

export function ModelPerformance() {
  const [regression, setRegression] = useState<RegressionReport | null>(null);
  const [classification, setClassification] = useState<ClassificationReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([MLService.getRegressionReport(), MLService.getClassificationReport()])
      .then(([regressionReport, classificationReport]) => {
        if (!mounted) return;
        setRegression(regressionReport);
        setClassification(classificationReport);
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err.message : 'Unable to load model metrics.');
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const regressionChart = useMemo(
    () => regression?.model_comparison?.map((model) => ({ name: model.name, rmse: model.rmse ?? 0 })) ?? [],
    [regression],
  );
  const classificationChart = useMemo(
    () => classification?.model_comparison?.map((model) => ({ name: model.name, f1: model.f1_macro ?? 0, accuracy: model.accuracy ?? 0 })) ?? [],
    [classification],
  );

  if (isLoading) return <div className="rounded-lg border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">Loading model reports...</div>;
  if (error || !regression || !classification) return <div className="rounded-lg border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700">{error ?? 'Model reports unavailable.'}</div>;

  return (
    <div className="space-y-8 mb-12">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Model Metrics</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Evaluation Reports</h3>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <h4 className="text-lg font-semibold text-slate-900">Regression</h4>
          <p className="mt-1 text-sm text-slate-500">Best model: {regression.best_model.name}</p>
          <div className="mt-6 grid grid-cols-2 gap-4">
            {[
              ['MAE', regression.best_model.mae],
              ['MSE', regression.best_model.mse],
              ['RMSE', regression.best_model.rmse],
              ['R2', regression.best_model.r2_score],
              ['CV RMSE Mean', regression.best_model.cv_rmse_mean],
              ['CV Std', regression.best_model.cv_rmse_std],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{formatNumber(value as number | null, label === 'R2' ? 3 : 0)}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regressionChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} interval={0} angle={-20} height={70} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => formatNumber(Number(value), 0)} />
                <Bar dataKey="rmse" fill="#334155" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <h4 className="text-lg font-semibold text-slate-900">Classification</h4>
          <p className="mt-1 text-sm text-slate-500">Best model: {classification.best_model.name}</p>
          <div className="mt-6 grid grid-cols-2 gap-4">
            {[
              ['Accuracy', classification.best_model.accuracy],
              ['Precision Macro', classification.best_model.precision_macro],
              ['Recall Macro', classification.best_model.recall_macro],
              ['F1 Macro', classification.best_model.f1_macro],
              ['ROC-AUC Macro', classification.best_model.roc_auc_macro],
              ['CV F1 Std', classification.best_model.cv_score_std],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{formatNumber(value as number | null, 3)}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classificationChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} interval={0} angle={-20} height={70} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} domain={[0, 1]} />
                <Tooltip formatter={(value) => Number(value).toFixed(3)} />
                <Bar dataKey="f1" fill="#475569" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h4 className="text-lg font-semibold text-slate-900">Confusion Matrix</h4>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-[480px] text-center text-sm">
            <thead>
              <tr>
                <th className="p-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Actual / Predicted</th>
                {classification.labels.map((label) => <th key={label} className="p-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</th>)}
              </tr>
            </thead>
            <tbody>
              {classification.confusion_matrix.map((row, rowIndex) => (
                <tr key={classification.labels[rowIndex]}>
                  <th className="p-2 text-left text-sm font-semibold text-slate-700">{classification.labels[rowIndex]}</th>
                  {row.map((value, colIndex) => (
                    <td key={`${rowIndex}-${colIndex}`} className={cn('p-3 font-semibold', rowIndex === colIndex ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-600')}>
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
