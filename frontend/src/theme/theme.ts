import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';

import type { CardTheme } from '@/types';

const brandIndigo = '#4338CA';
const brandIndigoDark = '#818CF8';

export const paperLightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: brandIndigo,
    secondary: '#7C3AED',
    background: '#F8F9FC',
    surface: '#FFFFFF',
    surfaceVariant: '#EEF0F9',
    error: '#DC2626',
  },
};

export const paperDarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: brandIndigoDark,
    secondary: '#A78BFA',
    background: '#0B0D17',
    surface: '#151827',
    surfaceVariant: '#1F2337',
    error: '#F87171',
  },
};

/**
 * Visual palettes for the digital business card itself, independent of the
 * app's light/dark mode. These are user-selectable per card (like choosing
 * a color for a physical card stock).
 */
export const cardThemePalettes: Record<
  CardTheme,
  { gradientStart: string; gradientEnd: string; textColor: string; accent: string }
> = {
  classic: { gradientStart: '#4338CA', gradientEnd: '#312E81', textColor: '#FFFFFF', accent: '#A5B4FC' },
  midnight: { gradientStart: '#0F172A', gradientEnd: '#1E293B', textColor: '#F1F5F9', accent: '#38BDF8' },
  sunrise: { gradientStart: '#F97316', gradientEnd: '#DB2777', textColor: '#FFFFFF', accent: '#FDE68A' },
  forest: { gradientStart: '#065F46', gradientEnd: '#064E3B', textColor: '#ECFDF5', accent: '#6EE7B7' },
  graphite: { gradientStart: '#374151', gradientEnd: '#111827', textColor: '#F9FAFB', accent: '#D1D5DB' },
};

export const cardThemeOptions: { key: CardTheme; label: string }[] = [
  { key: 'classic', label: 'Classic' },
  { key: 'midnight', label: 'Midnight' },
  { key: 'sunrise', label: 'Sunrise' },
  { key: 'forest', label: 'Forest' },
  { key: 'graphite', label: 'Graphite' },
];
