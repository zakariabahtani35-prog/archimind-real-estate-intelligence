import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for merging tailwind classes with support for conditional classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Common formatting for currency
 */
export function formatCurrency(value: number) {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Mock Moroccan City data
 */
export const MOROCCAN_CITIES = [
  'Casablanca',
  'Rabat',
  'Marrakech',
  'Tangier',
  'Agadir',
  'Fes',
  'Meknes',
  'Oujda',
  'Kenitra',
  'Tetouan',
];

/**
 * Mock Property Types
 */
export const PROPERTY_TYPES = [
  'Apartment',
  'Villa',
  'House',
  'Studio',
  'Commercial Space',
  'Land',
];

/**
 * Mock Districts by City (Casablanca example)
 */
export const DISTRICTS_BY_CITY: Record<string, string[]> = {
  'Casablanca': ['Maarif', 'Gauthier', 'Bourgogne', 'Anfa', 'Oasis', 'Sidi Maârouf', 'Ain Diab'],
  'Rabat': ['Agdal', 'Hay Riad', 'Souissi', 'Hassan', 'Ocean'],
  'Marrakech': ['Gueliz', 'Hivernage', 'Medina', 'Palmeraison', 'Targa'],
  'Tangier': ['Malabata', 'California', 'Casabarata', 'Iberia'],
  'Agadir': ['Founty', 'Hay Dakhla', 'Talborjt', 'Anza'],
  'Fes': ['Narjiss', 'Atlas', 'Route Imouzzer', 'Wadi Fes'],
  'Meknes': ['Hamria', 'Mansour', 'Zitoune', 'Riad'],
  'Oujda': ['Lazaret', 'Al Qods', 'Dragage'],
  'Kenitra': ['Ville Haute', 'Mehdia', 'Bir Rami'],
  'Tetouan': ['Mhannech', 'Wilaya', 'Ensanche'],
};
