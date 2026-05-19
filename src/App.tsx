import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { KpiCards } from './components/KpiCards';
import { PredictionPanel } from './components/PredictionPanel';
import { ClassificationPanel } from './components/ClassificationPanel';
import { DataVisualization } from './components/DataVisualization';
import { PipelineVisualizer } from './components/PipelineVisualizer';
import { ModelPerformance } from './components/ModelPerformance';
import { DatasetExplorer } from './components/DatasetExplorer';
import { FeatureImportancePanel } from './components/FeatureImportancePanel';
import { ErrorAnalysisPanel } from './components/ErrorAnalysisPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const showDashboardOverview = activeTab === 'dashboard';
  const showPrediction = showDashboardOverview || activeTab === 'prediction';
  const showClassification = activeTab === 'classification';
  const showAnalytics = showDashboardOverview || activeTab === 'analytics';
  const showPipeline = showDashboardOverview || activeTab === 'pipeline';
  const showPerformance = showDashboardOverview || activeTab === 'metrics';
  const showFeatures = activeTab === 'features';
  const showErrors = activeTab === 'errors';
  const showDataset = showDashboardOverview || activeTab === 'dataset';

  const handleRunPrediction = () => {
    setActiveTab('prediction');
    requestAnimationFrame(() => {
      document.getElementById('ml-prediction')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onRunPrediction={handleRunPrediction} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="mx-auto max-w-[1600px]"
            >
              {showDashboardOverview && (
                <section id="overview">
                  <KpiCards />
                </section>
              )}

              {showPrediction && (
                <section id="ml-prediction" className={showDashboardOverview ? 'mt-10' : ''}>
                  <PredictionPanel />
                </section>
              )}

              {showClassification && (
                <section id="classification">
                  <ClassificationPanel />
                </section>
              )}

              {showAnalytics && (
                <section id="analytics" className={showDashboardOverview ? 'mt-10' : ''}>
                  <DataVisualization />
                </section>
              )}

              {showPipeline && (
                <section id="pipeline" className={showDashboardOverview ? 'mt-10' : ''}>
                  <PipelineVisualizer />
                </section>
              )}

              {showPerformance && (
                <section id="performance" className={showDashboardOverview ? 'mt-10' : ''}>
                  <ModelPerformance />
                </section>
              )}

              {showFeatures && (
                <section id="features">
                  <FeatureImportancePanel />
                </section>
              )}

              {showErrors && (
                <section id="errors">
                  <ErrorAnalysisPanel />
                </section>
              )}

              {showDataset && (
                <section id="explorer" className={showDashboardOverview ? 'mt-10' : ''}>
                  <DatasetExplorer />
                </section>
              )}

              <footer className="mt-16 border-t border-slate-200 pb-8 pt-6">
                <p className="text-xs font-medium text-slate-400">
                  ArchiMind AI · PostgreSQL OBT to reproducible sklearn artifacts.
                </p>
              </footer>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
