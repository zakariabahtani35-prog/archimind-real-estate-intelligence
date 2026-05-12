import { 
  Building2, 
  Layers, 
  MapPin, 
  TrendingUp, 
  BrainCircuit, 
  ShieldCheck, 
  Activity, 
  Database, 
  Settings,
  LayoutDashboard,
  BarChart3,
  Search,
  Bell,
  User,
  Plus
} from 'lucide-react';

export const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'prediction', label: 'Price Prediction', icon: BrainCircuit },
  { id: 'classification', label: 'Classification', icon: Layers },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'pipeline', label: 'ML Pipeline', icon: Activity },
  { id: 'metrics', label: 'Model Metrics', icon: ShieldCheck },
  { id: 'dataset', label: 'Dataset Explorer', icon: Database },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const KPI_DATA = [
  { title: 'Total Properties', value: '42,852', trend: '+12.5%', icon: Building2, color: 'blue' },
  { title: 'Avg. Property Price', value: '2.4M MAD', trend: '+4.2%', icon: TrendingUp, color: 'purple' },
  { title: 'Best Model Accuracy', value: '94.8%', trend: '+0.4%', icon: ShieldCheck, color: 'green' },
  { title: 'Prediction Success', value: '98.2%', trend: '+1.1%', icon: BrainCircuit, color: 'blue' },
  { title: 'Cities Covered', value: '18', trend: 'Global', icon: MapPin, color: 'green' },
  { title: 'Active ML Models', value: '12', trend: 'Live', icon: Layers, color: 'purple' },
];

export const PRICE_DISTRIBUTION = [
  { price: '0-500k', count: 1200 },
  { price: '500k-1M', count: 2400 },
  { price: '1M-2M', count: 3800 },
  { price: '2M-4M', count: 4500 },
  { price: '4M-8M', count: 3200 },
  { price: '8M+', count: 1500 },
];

export const PROPERTY_TYPE_DIST = [
  { name: 'Apartment', value: 45 },
  { name: 'Villa', value: 25 },
  { name: 'House', value: 15 },
  { name: 'Land', value: 10 },
  { name: 'Studio', value: 5 },
];

export const FEATURE_IMPORTANCE = [
  { feature: 'Surface', score: 0.85 },
  { feature: 'Location', score: 0.72 },
  { feature: 'Bathrooms', score: 0.54 },
  { feature: 'Bedrooms', score: 0.48 },
  { feature: 'Property Age', score: 0.35 },
  { feature: 'Parking', score: 0.28 },
];

export const MARKET_TRENDS = [
  { month: 'Jan', price: 1.8 },
  { month: 'Feb', price: 1.85 },
  { month: 'Mar', price: 1.92 },
  { month: 'Apr', price: 1.98 },
  { month: 'May', price: 2.05 },
  { month: 'Jun', price: 2.12 },
  { month: 'Jul', price: 2.2 },
];

export const MOCK_PROPERTIES = [
  { id: '1', city: 'Casablanca', district: 'Maarif', type: 'Apartment', surface: 85, rooms: 2, bathrooms: 1, price: 1450000, status: 'Predicted' },
  { id: '2', city: 'Rabat', district: 'Agdal', type: 'Apartment', surface: 105, rooms: 3, bathrooms: 2, price: 2100000, status: 'Actual' },
  { id: '3', city: 'Marrakech', district: 'Gueliz', type: 'Villa', surface: 350, rooms: 4, bathrooms: 3, price: 4200000, status: 'Predicted' },
  { id: '4', city: 'Tangier', district: 'Malabata', type: 'Apartment', surface: 95, rooms: 2, bathrooms: 2, price: 1850000, status: 'Actual' },
  { id: '5', city: 'Casablanca', district: 'Anfa', type: 'Villa', surface: 500, rooms: 5, bathrooms: 4, price: 12000000, status: 'Actual' },
  { id: '6', city: 'Rabat', district: 'Hay Riad', type: 'Apartment', surface: 120, rooms: 3, bathrooms: 2, price: 2800000, status: 'Predicted' },
  { id: '7', city: 'Agadir', district: 'Cité Suisse', type: 'House', surface: 220, rooms: 4, bathrooms: 2, price: 3500000, status: 'Actual' },
  { id: '8', city: 'Fes', district: 'Narjiss', type: 'Apartment', surface: 75, rooms: 2, bathrooms: 1, price: 850000, status: 'Predicted' },
];

export const MODEL_METRICS_DATA = [
  { name: 'Regressor v2.4 (XGBoost)', mae: '124,500', r2: '0.942', rmse: '156,000', status: 'Best' },
  { name: 'PriceNet (Deep Learning)', mae: '138,200', r2: '0.915', rmse: '172,400', status: 'Experimental' },
  { name: 'ArchiProphet v1.0 (LGBM)', mae: '142,000', r2: '0.898', rmse: '185,500', status: 'Legacy' },
];
