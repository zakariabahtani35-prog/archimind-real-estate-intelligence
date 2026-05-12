import React from 'react';
import { motion } from 'motion/react';
import { KPI_DATA } from '../lib/data';
import { cn } from '../lib/utils';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const dummyChartData = [
  { val: 400 }, { val: 300 }, { val: 600 }, { val: 800 }, { val: 500 }, { val: 900 }, { val: 1100 }
];

export function KpiCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      {KPI_DATA.map((kpi, idx) => {
        const Icon = kpi.icon;
        const isPositive = kpi.trend.startsWith('+');
        
        return (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="glass-card p-4 hover:shadow-active transition-all group overflow-hidden relative"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300",
                kpi.color === 'blue' ? "bg-blue-50 text-blue-600" : 
                kpi.color === 'purple' ? "bg-purple-50 text-purple-600" :
                "bg-emerald-50 text-emerald-600"
              )}>
                <Icon size={20} />
              </div>
              <span className={cn(
                "text-[10px] font-bold px-2 py-1 rounded-full",
                isPositive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
              )}>
                {kpi.trend}
              </span>
            </div>
            
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1">{kpi.title}</p>
              <p className="text-lg font-display font-bold text-slate-800">{kpi.value}</p>
            </div>
            
            <div className="h-16 -mx-4 mt-2 -mb-4 opacity-30 group-hover:opacity-50 transition-opacity">
               <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dummyChartData}>
                  <Area 
                    type="monotone" 
                    dataKey="val" 
                    stroke={kpi.color === 'blue' ? '#3B82F6' : kpi.color === 'purple' ? '#8B5CF6' : '#10B981'} 
                    fill={kpi.color === 'blue' ? '#3B82F6' : kpi.color === 'purple' ? '#8B5CF6' : '#10B981'} 
                    strokeWidth={2}
                  />
                </AreaChart>
               </ResponsiveContainer>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
