import React from 'react';
import { Search, Filter, Download, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { MOCK_PROPERTIES } from '../lib/data';
import { formatCurrency, cn } from '../lib/utils';

export function DatasetExplorer() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-display font-semibold">Moroccan Real Estate Dataset</h3>
          <p className="text-sm text-slate-500">Raw curated data synchronized from multiple listing sources.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search data..."
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all w-full md:w-64"
            />
          </div>
          <button className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-all">
            <Filter size={18} />
          </button>
          <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-slate-600 font-medium text-sm hover:bg-slate-50 transition-all">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID</th>
              <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">City / District</th>
              <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
              <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Specifications</th>
              <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Price</th>
              <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Source</th>
              <th className="py-4 px-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_PROPERTIES.map((prop) => (
              <tr key={prop.id} className="hover:bg-slate-50/50 transition-all group">
                <td className="py-4 px-6">
                  <span className="text-[10px] font-mono font-bold text-slate-400">#RES-{prop.id}</span>
                </td>
                <td className="py-4 px-6">
                  <p className="text-sm font-semibold text-slate-800">{prop.city}</p>
                  <p className="text-xs text-slate-400">{prop.district}</p>
                </td>
                <td className="py-4 px-6">
                  <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                    {prop.type}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <p className="text-xs text-slate-600">{prop.surface}m² • {prop.rooms}BHK • {prop.bathrooms}BA</p>
                </td>
                <td className="py-4 px-6">
                  <p className="text-sm font-bold text-slate-800">{formatCurrency(prop.price)}</p>
                </td>
                <td className="py-4 px-6">
                  <span className={cn(
                    "text-[10px] font-bold",
                    prop.status === 'Predicted' ? "text-brand-purple" : "text-emerald-600"
                  )}>
                    {prop.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <button className="p-2 text-slate-400 hover:text-brand-blue transition-colors">
                    <MoreHorizontal size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
        <p className="text-xs text-slate-500 font-medium">Showing 8 of 42.852 properties</p>
        <div className="flex items-center gap-2">
          <button className="p-1 border border-slate-200 rounded-md text-slate-400 hover:bg-white transition-all disabled:opacity-50">
            <ChevronLeft size={16} />
          </button>
          <div className="flex gap-1">
            {[1, 2, 3, '...', 120].map((page, i) => (
              <button 
                key={i} 
                className={cn(
                  "w-8 h-8 rounded-md text-xs font-bold transition-all",
                  page === 1 ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20" : "text-slate-500 hover:bg-slate-200"
                )}
              >
                {page}
              </button>
            ))}
          </div>
          <button className="p-1 border border-slate-200 rounded-md text-slate-400 hover:bg-white transition-all">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
