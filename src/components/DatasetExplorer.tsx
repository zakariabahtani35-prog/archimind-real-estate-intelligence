import React, { useEffect, useMemo, useState } from 'react';
import { Search, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { MLService } from '../services/api';
import { DatasetSummary, PropertyRecord } from '../types/ml';
import { formatCurrency, cn } from '../lib/utils';

export function DatasetExplorer() {
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [query, setQuery] = useState('');
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([MLService.getProperties(), MLService.getDatasetSummary()])
      .then(([propertyData, summaryData]) => {
        if (!mounted) return;
        setProperties(propertyData);
        setSummary(summaryData);
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err.message : 'Unable to load property data.');
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filteredProperties = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return properties;
    return properties.filter((property) =>
      [property.city, property.district, property.property_type].some((value) => value.toLowerCase().includes(normalized)),
    );
  }, [properties, query]);

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-display font-semibold">Moroccan Real Estate Dataset</h3>
          <p className="text-sm text-slate-500">
            {summary
              ? `${summary.source_table}: ${summary.row_count.toLocaleString()} rows, ${summary.column_count} columns`
              : 'Records served by the backend OBT loader.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search data..."
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all w-full md:w-64"
            />
          </div>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 gap-4 border-b border-slate-100 p-6 md:grid-cols-4">
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rows</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">{summary.row_count.toLocaleString()}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Columns</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">{summary.column_count}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Numeric</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">{summary.numeric_columns.length}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Categorical</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">{summary.categorical_columns.length}</p>
          </div>
        </div>
      )}

      {error && <div className="m-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
      {isLoading ? (
        <div className="py-16 text-center text-sm text-slate-500">Loading property records...</div>
      ) : (
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
              {filteredProperties.map((prop) => (
                <tr key={prop.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="py-4 px-6">
                    <span className="text-[10px] font-mono font-bold text-slate-400">#RES-{prop.id}</span>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm font-semibold text-slate-800">{prop.city}</p>
                    <p className="text-xs text-slate-400">{prop.district}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">{prop.property_type}</span>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-xs text-slate-600">
                      {prop.surface_m2}m2 - {prop.bedrooms} bed - {prop.bathrooms} bath
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm font-bold text-slate-800">{formatCurrency(prop.price)}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className={cn('text-[10px] font-bold', prop.status === 'Predicted' ? 'text-brand-purple' : 'text-emerald-600')}>
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
      )}

      <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
        <p className="text-xs text-slate-500 font-medium">
          Showing {filteredProperties.length} of {properties.length} properties
        </p>
        <div className="flex items-center gap-2">
          <button className="p-1 border border-slate-200 rounded-md text-slate-400 hover:bg-white transition-all disabled:opacity-50" disabled>
            <ChevronLeft size={16} />
          </button>
          <button className="w-8 h-8 rounded-md text-xs font-bold transition-all bg-brand-blue text-white shadow-md shadow-brand-blue/20">1</button>
          <button className="p-1 border border-slate-200 rounded-md text-slate-400 hover:bg-white transition-all" disabled>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 gap-6 border-t border-slate-100 p-6 lg:grid-cols-2">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Missing Values</h4>
            <div className="mt-3 max-h-64 overflow-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-sm">
                <tbody>
                  {summary.missing_values.slice(0, 12).map((row) => (
                    <tr key={row.column} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-3 py-2 font-mono text-xs text-slate-600">{row.column}</td>
                      <td className="px-3 py-2 text-right text-slate-700">{row.missing_count}</td>
                      <td className="px-3 py-2 text-right text-slate-500">{(row.missing_ratio * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Column Types</h4>
            <div className="mt-3 rounded-lg border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Numeric Columns</p>
              <p className="mt-2 text-sm text-slate-700">{summary.numeric_columns.join(', ') || 'None'}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Categorical Columns</p>
              <p className="mt-2 text-sm text-slate-700">{summary.categorical_columns.join(', ') || 'None'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
