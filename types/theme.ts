export type CustomerThemeId = 'terracotta-dum' | 'obsidian-gold';

export interface CustomerThemeConfig {
  id: CustomerThemeId;
  name: string;
  archetype: string;
  subtitle: string;
  badge: string;
  dotColor1: string; // Button color swatch
  dotColor2: string; // Pill color swatch
  colors: {
    // Canvas & Surfaces
    bgApp: string;
    bgSurface: string;
    bgElevated: string;
    border: string;
    borderLight: string;

    // Unified Button System (Single bold action color)
    buttonBg: string;
    buttonHover: string;
    buttonFg: string;
    buttonShadow: string;
    primary: string;
    primaryHover: string;
    primaryFg: string;
    primaryBorder: string;
    primaryShadow: string;
    buttonText?: string;

    // Unified Pill & Filter System (Dedicated light-tint filter styling)
    pillActiveBg: string;
    pillActiveFg: string;
    pillActiveBorder: string;
    pillInactiveBg: string;
    pillInactiveFg: string;
    pillInactiveBorder: string;
    pillBg: string;

    // Secondary & Accents
    secondaryBg: string;
    secondaryFg: string;
    accent: string;
    accentFg: string;

    // Typography
    textPrimary: string;
    textSecondary: string;
    textMuted: string;

    // Chrome
    headerBg: string;
    headerFg: string;
    bottomBg: string;
    phoneBezel: string;
    statusBarBg: string;
    statusBarFg: string;
    isDark?: boolean;
  };
}

export const CUSTOMER_THEMES: CustomerThemeConfig[] = [
  // ── 1. TERRACOTTA DUM (Classic Heritage Light Theme) ─
  {
    id: 'terracotta-dum',
    name: 'Terracotta Heritage Light',
    archetype: 'Donne Biryani Mane',
    subtitle: 'Classic Warm Daylight Atmosphere',
    badge: 'CLASSIC HERITAGE',
    dotColor1: '#C2410C',
    dotColor2: '#FFF7ED',
    colors: {
      bgApp: '#FAF8F5',
      bgSurface: '#FFFFFF',
      bgElevated: '#F5EFE8',
      border: '#E7E5E4',
      borderLight: '#F3ECE3',

      buttonBg: '#C2410C',
      buttonHover: '#9A3412',
      buttonFg: '#FFFFFF',
      buttonShadow: '0 4px 14px rgba(194, 65, 12, 0.25)',
      primary: '#C2410C',
      primaryHover: '#9A3412',
      primaryFg: '#FFFFFF',
      primaryBorder: '#9A3412',
      primaryShadow: '0 4px 14px rgba(194, 65, 12, 0.25)',
      buttonText: '#FFFFFF',

      pillActiveBg: '#FFF7ED',
      pillActiveFg: '#7C2D12',
      pillActiveBorder: '#EA580C',
      pillInactiveBg: '#FFFFFF',
      pillInactiveFg: '#44403C',
      pillInactiveBorder: '#E7E5E4',
      pillBg: '#FFF7ED',

      secondaryBg: '#FFEDD5',
      secondaryFg: '#7C2D12',
      accent: '#C2410C',
      accentFg: '#FFFFFF',

      textPrimary: '#1C1917',
      textSecondary: '#44403C',
      textMuted: '#78716C',

      headerBg: 'rgba(255, 255, 255, 0.95)',
      headerFg: '#1C1917',
      bottomBg: 'rgba(255, 255, 255, 0.96)',
      phoneBezel: '#292524',
      statusBarBg: '#FFFFFF',
      statusBarFg: '#1C1917',
      isDark: false,
    },
  },

  // ── 2. OBSIDIAN GOLD SANCTUARY (Luxury Dark Theme) ─
  {
    id: 'obsidian-gold',
    name: 'Obsidian Gold Sanctuary',
    archetype: 'Michelin Fine Dining',
    subtitle: 'Warm Stone • Brushed Gold Sanctuary',
    badge: 'LUXURY SANCTUARY',
    dotColor1: '#D97706',
    dotColor2: '#1C1917',
    colors: {
      bgApp: '#0F0E0C',
      bgSurface: '#181614',
      bgElevated: '#24211D',
      border: 'rgba(217, 119, 6, 0.25)',
      borderLight: 'rgba(217, 119, 6, 0.15)',

      buttonBg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)',
      buttonHover: '#B45309',
      buttonFg: '#FFFFFF',
      buttonShadow: '0 12px 30px -4px rgba(217, 119, 6, 0.45)',
      primary: '#D97706',
      primaryHover: '#B45309',
      primaryFg: '#FFFFFF',
      primaryBorder: '#F59E0B',
      primaryShadow: '0 12px 30px -4px rgba(217, 119, 6, 0.45)',
      buttonText: '#FFFFFF',

      pillActiveBg: 'rgba(217, 119, 6, 0.18)',
      pillActiveFg: '#FDE68A',
      pillActiveBorder: '#F59E0B',
      pillInactiveBg: 'rgba(255, 255, 255, 0.04)',
      pillInactiveFg: '#D6D3D1',
      pillInactiveBorder: 'rgba(255, 255, 255, 0.08)',
      pillBg: 'rgba(217, 119, 6, 0.15)',

      secondaryBg: 'rgba(217, 119, 6, 0.12)',
      secondaryFg: '#FDE68A',
      accent: '#F59E0B',
      accentFg: '#0F0E0C',

      textPrimary: '#FAF7F2',
      textSecondary: '#D6D3D1',
      textMuted: '#A8A29E',

      headerBg: 'rgba(15, 14, 12, 0.88)',
      headerFg: '#FAF7F2',
      bottomBg: 'rgba(15, 14, 12, 0.92)',
      phoneBezel: '#0C0A09',
      statusBarBg: '#0F0E0C',
      statusBarFg: '#FAF7F2',
      isDark: true,
    },
  },
];
