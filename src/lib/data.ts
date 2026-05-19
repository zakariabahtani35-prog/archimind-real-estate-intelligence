import {
  Activity,
  AlertTriangle,
  BarChart3,
  BrainCircuit,
  Database,
  Layers,
  LayoutDashboard,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';

export const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'prediction', label: 'Price Prediction', icon: BrainCircuit },
  { id: 'classification', label: 'Classification', icon: Layers },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'pipeline', label: 'ML Pipeline', icon: Activity },
  { id: 'metrics', label: 'Model Metrics', icon: ShieldCheck },
  { id: 'features', label: 'Feature Importance', icon: SlidersHorizontal },
  { id: 'errors', label: 'Error Analysis', icon: AlertTriangle },
  { id: 'dataset', label: 'Dataset Explorer', icon: Database },
];
