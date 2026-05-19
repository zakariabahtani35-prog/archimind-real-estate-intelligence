import React from 'react';
import { Plus } from 'lucide-react';
import { appEnv } from '../config/env';

export function Header({ onRunPrediction }: { onRunPrediction: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex min-h-20 flex-col gap-4 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur md:px-8 xl:flex-row xl:items-center xl:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{appEnv.appName}</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">Moroccan Real Estate ML Intelligence</h2>
      </div>

      <button
        onClick={onRunPrediction}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99] sm:w-auto"
      >
        <Plus size={16} />
        Run Price Prediction
      </button>
    </header>
  );
}
