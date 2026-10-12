export type CustomerThemeId = 'terracotta-dum';

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
  // ── 7. OBSIDIAN GOLD & WARM STONE (Ultra Luxury Michelin Fine Dining) ─
  {
    id: 'terracotta-dum',
    name: 'Obsidian Gold Sanctuary',
    archetype: 'Michelin Fine Dining',
    subtitle: 'Brushed Gold • Obsidian Slate',
    badge: 'LUXURY SANCTUARY',
    dotColor1: '#D97706',
    dotColor2: '#1C1917',
    colors: {
      bgApp: '#0F0E0C',
      bgSurface: '#181614',
      bgElevated: '#24211D',
      border: 'rgba(217, 119, 6, 0.25)',
      borderLight: 'rgba(217, 119, 6, 0.15)',

      // Button: Sculpted Amber Gold
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

      // Pill: Frosted Dark Slate with Glowing Gold Border
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
