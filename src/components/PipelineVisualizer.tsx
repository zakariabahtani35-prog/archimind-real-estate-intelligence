import React from 'react';
import { motion } from 'motion/react';
import { Binary, CheckCircle2, CloudDownload, Database, Gauge, GitBranch, SearchCheck, Settings2, SplitSquareHorizontal, Workflow } from 'lucide-react';

const steps = [
  { id: 'obt', label: 'OBT Extraction', detail: 'Read ml_schema.ml_property_features', icon: Database },
  { id: 'split', label: 'Train/Test Split', detail: 'Hold-out set before model fitting', icon: SplitSquareHorizontal },
  { id: 'features', label: 'Feature Engineering', detail: 'Rooms, density, age buckets, market indices', icon: Settings2 },
  { id: 'preprocess', label: 'Preprocessing', detail: 'Imputation, scaling, one-hot encoding', icon: Binary },
  { id: 'compare', label: 'Model Comparison', detail: 'Linear, forests, boosting, optional XGBoost', icon: GitBranch },
  { id: 'tune', label: 'Hyperparameter Tuning', detail: 'GridSearchCV for the best tree candidate', icon: SearchCheck },
  { id: 'evaluate', label: 'Evaluation', detail: 'Metrics, CV, residuals, confusion matrix', icon: Gauge },
  { id: 'export', label: 'Export', detail: 'Models and JSON reports in artifacts', icon: CloudDownload },
];

export function PipelineVisualizer() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">ML Pipeline</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Reproducible Training Flow</h3>
        <p className="mt-2 max-w-3xl text-sm text-slate-500">
          The platform reads the PostgreSQL OBT, splits the data, learns preprocessing and supervised encodings on the training fold, evaluates candidates, then exports model artifacts and report JSON.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="rounded-lg border border-slate-200 bg-slate-50 p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm">
                  <Icon size={19} />
                </div>
                <span className="text-xs font-semibold text-slate-400">{String(index + 1).padStart(2, '0')}</span>
              </div>
              <h4 className="mt-4 text-sm font-semibold text-slate-900">{step.label}</h4>
              <p className="mt-2 text-sm leading-5 text-slate-500">{step.detail}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center gap-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        <CheckCircle2 size={18} />
        Reports exported: regression, classification, error analysis, and feature importance.
      </div>
    </div>
  );
}
