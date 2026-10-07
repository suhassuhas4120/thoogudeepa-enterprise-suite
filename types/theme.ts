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
  // ── 7. TERRACOTTA DUM (Authentic Donne Biryani Mane - Clean & Light) ─
  {
    id: 'terracotta-dum',
    name: '7. Terracotta Dum',
    archetype: 'Donne Biryani Mane',
    subtitle: 'Terracotta Button • Warm Sand Pill',
    badge: 'SIGNATURE DUM',
    dotColor1: '#C2410C', // Terracotta button
    dotColor2: '#FFF7ED', // Warm sand pill
    colors: {
      bgApp: '#FAF8F5',
      bgSurface: '#FFFFFF',
      bgElevated: '#F5EFE8',
      border: '#E7E5E4',
      borderLight: '#F3ECE3',

      // Button: Warm Woodfire Terracotta
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

      // Pill: Light Warm Sand with Deep Clay Text (Never Black!)
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
];
