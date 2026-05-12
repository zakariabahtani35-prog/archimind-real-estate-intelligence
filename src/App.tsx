/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { KpiCards } from './components/KpiCards';
import { PredictionPanel } from './components/PredictionPanel';
import { DataVisualization } from './components/DataVisualization';
import { PipelineVisualizer } from './components/PipelineVisualizer';
import { ModelPerformance } from './components/ModelPerformance';
import { DatasetExplorer } from './components/DatasetExplorer';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex min-h-screen bg-surface-soft">
      {/* Sidebar - Fixed Left */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        
        <main className="flex-1 p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="max-w-[1600px] mx-auto"
            >
              {activeTab === 'dashboard' ? (
                <>
                  <section id="kpis">
                    <KpiCards />
                  </section>
                  
                  <section id="ml-prediction" className="mt-12">
                     <PredictionPanel />
                  </section>
                  
                  <section id="analytics" className="mt-12">
                    <DataVisualization />
                  </section>

                  <section id="pipeline" className="mt-12">
                    <PipelineVisualizer />
                  </section>

                  <section id="performance" className="mt-12">
                    <ModelPerformance />
                  </section>

                  <section id="explorer" className="mt-12">
                    <DatasetExplorer />
                  </section>
                  
                  {/* Footnote */}
                  <footer className="mt-20 pb-12 border-t border-slate-200 pt-8 flex items-center justify-between">
                    <p className="text-xs text-slate-400 font-medium tracking-wide">
                      © 2026 ARCHIMIND ARTIFICIAL INTELLIGENCE SYSTEMS. ALL RIGHTS RESERVED.
                    </p>
                    <div className="flex gap-6">
                      <a href="#" className="text-xs font-bold text-slate-400 hover:text-brand-blue transition-colors">VERSION 2.4.0-STABLE</a>
                      <a href="#" className="text-xs font-bold text-slate-400 hover:text-brand-blue transition-colors">SECURITY AUDIT</a>
                      <a href="#" className="text-xs font-bold text-slate-400 hover:text-brand-blue transition-colors">API DOCS</a>
                    </div>
                  </footer>
                </>
              ) : (
                <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-300 mb-6">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    >
                      {activeTab === 'settings' ? '⚙️' : '🏗️'}
                    </motion.div>
                  </div>
                  <h2 className="text-2xl font-display font-bold text-slate-800 uppercase tracking-tight">Section under construction</h2>
                  <p className="text-slate-500 mt-2 max-w-sm">The full {activeTab} enterprise module is currently being optimized for high-throughput inference.</p>
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className="mt-8 text-sm font-bold text-brand-blue hover:underline"
                  >
                    Return to Mission Control
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

