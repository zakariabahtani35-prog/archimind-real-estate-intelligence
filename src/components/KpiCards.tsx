import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Activity, BrainCircuit, Database, Layers, ShieldCheck, Table2 } from 'lucide-react';
import { MLService } from '../services/api';
import { ClassificationReport, DatasetSummary, DbHealthStatus, HealthStatus, ModelStatus, RegressionReport } from '../types/ml';
import { cn } from '../lib/utils';

type KpiColor = 'blue' | 'slate' | 'green' | 'amber';

const formatCompact = (value?: number | null) =>
  typeof value === 'number'
    ? new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(value)
    : 'N/A';

const formatDate = (value?: string | null) => {
  if (!value) return 'Not trained';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
};

export function KpiCards() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [dbHealth, setDbHealth] = useState<DbHealthStatus | null>(null);
  const [models, setModels] = useState<ModelStatus | null>(null);
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [regression, setRegression] = useState<RegressionReport | null>(null);
  const [classification, setClassification] = useState<ClassificationReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.allSettled([
      MLService.getHealth(),
      MLService.getDbHealth(),
      MLService.getModelStatus(),
      MLService.getDatasetSummary(),
      MLService.getRegressionReport(),
      MLService.getClassificationReport(),
    ]).then((results) => {
      if (!mounted) return;
      const [healthResult, dbResult, modelResult, summaryResult, regressionResult, classificationResult] = results;
      if (healthResult.status === 'fulfilled') setHealth(healthResult.value);
      if (dbResult.status === 'fulfilled') setDbHealth(dbResult.value);
      if (modelResult.status === 'fulfilled') setModels(modelResult.value);
      if (summaryResult.status === 'fulfilled') setSummary(summaryResult.value);
      if (regressionResult.status === 'fulfilled') setRegression(regressionResult.value);
      if (classificationResult.status === 'fulfilled') setClassification(classificationResult.value);

      const firstRejected = results.find((result) => result.status === 'rejected');
      if (firstRejected?.status === 'rejected') {
        setError(firstRejected.reason instanceof Error ? firstRejected.reason.message : 'Some ML status data is unavailable.');
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const cards = useMemo(
    () => [
      {
        title: 'Backend Health',
        value: health?.status === 'ok' ? 'Online' : 'Offline',
        detail: health?.version ?? 'FastAPI',
        icon: Activity,
        color: health?.status === 'ok' ? ('green' as KpiColor) : ('amber' as KpiColor),
      },
      {
        title: 'Database',
        value: dbHealth?.status === 'ok' ? 'Ready' : 'Check',
        detail: dbHealth?.database ?? 'avito_db',
        icon: Database,
        color: dbHealth?.status === 'ok' ? ('green' as KpiColor) : ('amber' as KpiColor),
      },
      {
        title: 'Dataset Rows',
        value: formatCompact(summary?.row_count),
        detail: `${summary?.column_count ?? 0} columns`,
        icon: Table2,
        color: 'blue' as KpiColor,
      },
      {
        title: 'Models',
        value: models?.price_model_ready && models?.classification_model_ready ? 'Ready' : 'Incomplete',
        detail: models?.latest_training_timestamp ? formatDate(models.latest_training_timestamp) : 'No timestamp',
        icon: BrainCircuit,
        color: models?.price_model_ready && models?.classification_model_ready ? ('green' as KpiColor) : ('amber' as KpiColor),
      },
      {
        title: 'Regression RMSE',
        value: formatCompact(regression?.best_model?.rmse),
        detail: regression?.best_model?.name ?? 'Not trained',
        icon: ShieldCheck,
        color: 'slate' as KpiColor,
      },
      {
        title: 'Classification F1',
        value: classification?.best_model?.f1_macro != null ? classification.best_model.f1_macro.toFixed(3) : 'N/A',
        detail: classification?.best_model?.name ?? 'Not trained',
        icon: Layers,
        color: 'slate' as KpiColor,
      },
    ],
    [classification, dbHealth, health, models, regression, summary],
  );

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {cards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{kpi.title}</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{kpi.value}</p>
                </div>
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg',
                    kpi.color === 'green' ? 'bg-emerald-50 text-emerald-700'
                      : kpi.color === 'amber' ? 'bg-amber-50 text-amber-700'
                        : kpi.color === 'blue' ? 'bg-blue-50 text-blue-700'
                          : 'bg-slate-100 text-slate-700',
                  )}
                >
                  <Icon size={19} />
                </div>
              </div>
              <p className="mt-4 truncate text-xs text-slate-500">{kpi.detail}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
