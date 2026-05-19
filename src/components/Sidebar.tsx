import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { SIDEBAR_ITEMS } from '../lib/data';

export function Sidebar({ activeTab, onTabChange }: { activeTab: string; onTabChange: (id: string) => void }) {
  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-4">
      <div className="mb-8 px-2">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-lg font-semibold text-white">A</div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-slate-900">ArchiMind AI</h1>
            <p className="text-xs text-slate-500">ML dashboard</p>
          </div>
        </div>
      </div>

      <nav className="space-y-1">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition',
                isActive ? 'bg-slate-100 font-semibold text-slate-950' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950',
              )}
            >
              <Icon size={18} strokeWidth={isActive ? 2.4 : 2} />
              <span>{item.label}</span>
              {isActive && <motion.div layoutId="active-indicator" className="absolute right-2 h-5 w-1 rounded-full bg-slate-900" />}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Source</p>
        <p className="mt-2 break-words font-mono text-xs text-slate-700">ml_schema.ml_property_features</p>
      </div>
    </aside>
  );
}
