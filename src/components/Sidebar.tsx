import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { SIDEBAR_ITEMS } from '../lib/data';

export function Sidebar({ activeTab, onTabChange }: { activeTab: string, onTabChange: (id: string) => void }) {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col p-4">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center text-white font-bold text-xl shadow-lg">
          A
        </div>
        <h1 className="font-display font-bold text-lg tracking-tight text-slate-800">ArchiMind AI</h1>
      </div>
      
      <nav className="space-y-1 flex-1">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-brand-blue/10 text-brand-blue font-semibold scale-[1.02]" 
                  : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-800"
              )}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-sm">{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="active-indicator"
                  className="ml-auto w-1 h-4 bg-brand-blue rounded-full"
                />
              )}
            </button>
          );
        })}
      </nav>
      
      <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-brand-blue/5 to-brand-purple/5 border border-brand-blue/10">
        <p className="text-xs font-semibold text-brand-blue uppercase tracking-wider mb-1">Enterprise Plan</p>
        <p className="text-xs text-slate-500 mb-3">Professional analytics and team collaboration active.</p>
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div className="bg-brand-blue h-full w-3/4 rounded-full" />
        </div>
      </div>
    </aside>
  );
}
