import React from 'react';
import { motion } from 'motion/react';
import { 
  Database, 
  Settings2, 
  Binary, 
  Workflow, 
  Gauge, 
  CloudDownload, 
  CheckCircle2, 
  ChevronRight,
  ArrowRight
} from 'lucide-react';

const steps = [
  { id: 'extraction', label: 'OBT Extraction', icon: Database, color: 'blue' },
  { id: 'engineering', label: 'Feature Engineering', icon: Settings2, color: 'purple' },
  { id: 'encoding', label: 'Encoding & Scaling', icon: Binary, color: 'emerald' },
  { id: 'split', label: 'Train/Test Split', icon: Workflow, color: 'blue' },
  { id: 'regression', label: 'Regression Training', icon: Gauge, color: 'purple' },
  { id: 'classification', label: 'Classification Training', icon: LayersIcon, color: 'emerald' },
  { id: 'evaluation', label: 'Model Evaluation', icon: CheckCircle2, color: 'blue' },
  { id: 'export', label: 'Model Export', icon: CloudDownload, color: 'emerald' },
];

function LayersIcon({ size }: { size: number }) {
  return <Binary size={size} />;
}

export function PipelineVisualizer() {
  return (
    <div className="glass-card p-10 mb-12 overflow-hidden relative">
       <div className="absolute top-0 right-0 p-8 text-slate-100 -mr-20 -mt-20 opacity-10">
        <Workflow size={300} />
      </div>
      
      <div className="mb-10 text-center">
        <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue text-[10px] font-bold rounded-full uppercase tracking-[0.2em] mb-4 inline-block">
          Pipeline Orchestration
        </span>
        <h3 className="text-3xl font-display font-bold text-slate-900">ML Lifecycle Automation</h3>
        <p className="text-slate-500 mt-2 max-w-2xl mx-auto">The end-to-end proprietary infrastructure for Moroccan regional real estate valuation.</p>
      </div>

      <div className="relative flex items-center justify-between max-w-6xl mx-auto py-10">
        {/* Connection Line Background */}
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-100 -translate-y-1/2" />
        
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center group">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.1, type: 'spring' }}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg shadow-sm border border-white
                  ${step.color === 'blue' ? 'bg-blue-600 text-white' : 
                    step.color === 'purple' ? 'bg-purple-600 text-white' : 
                    'bg-emerald-600 text-white'}`}
              >
                <Icon size={24} />
              </motion.div>
              
              <div className="absolute top-20 w-32 text-center pointer-events-none">
                <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider mb-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                   Step {idx + 1}
                </p>
                <p className="text-[11px] font-semibold text-slate-600 line-clamp-1">{step.label}</p>
              </div>

              {idx < steps.length - 1 && (
                <div className="absolute left-[60px] top-[26px] hidden xl:block">
                   <ChevronRight size={14} className="text-slate-300" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-20 flex justify-center">
        <div className="bg-slate-50 rounded-2xl px-6 py-4 border border-slate-100 flex items-center gap-8 shadow-sm">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-700">Worker.CASA_1 Active</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-700">ETL Process: 98%</span>
           </div>
           <div className="h-4 w-[1px] bg-slate-200" />
           <button className="text-[10px] font-bold text-brand-blue uppercase tracking-widest flex items-center gap-1 hover:underline">
              View Logs <ArrowRight size={10} />
           </button>
        </div>
      </div>
    </div>
  );
}
