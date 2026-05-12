import React from 'react';
import { Search, Bell, User, Plus } from 'lucide-react';
import { appEnv } from '../config/env';

export function Header() {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-display font-semibold text-slate-800">AI Real Estate Intelligence</h2>
        <div className="h-6 w-[1px] bg-slate-200" />
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search properties, patterns, models..."
            className="pl-10 pr-4 py-2 bg-slate-100/50 hover:bg-slate-100 transition-all rounded-full border-transparent focus:border-brand-blue/30 focus:bg-white focus:ring-4 focus:ring-brand-blue/5 outline-none text-sm w-80"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-5">
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-sm font-medium transition-all shadow-lg active:scale-95">
          <Plus size={16} />
          Run Prediction
        </button>
        
        <div className="flex items-center gap-3">
          <button className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-brand-blue transition-all relative">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
          </button>
          
          <div className="flex items-center gap-3 pl-2 border-l border-slate-200 ml-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800">Dr. Sarah Mansouri</p>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Lead Data Scientist</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
               <img src={appEnv.userAvatarUrl} alt="User" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
