export type CustomerThemeId =
  | 'royal-saffron'
  | 'electric-indigo'
  | 'royal-emerald'
  | 'ruby-crimson'
  | 'golden-amber'
  | 'ocean-azure'
  | 'terracotta-dum';

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
  // ── 1. ROYAL SAFFRON (Swiggy-inspired Gourmet Warmth) ────────────────
  {
    id: 'royal-saffron',
    name: '1. Royal Saffron',
    archetype: 'Gourmet Warmth',
    subtitle: 'Saffron Button • Honey Cream Pill',
    badge: 'GOURMET WARMTH',
    dotColor1: '#EA580C', // Saffron button
    dotColor2: '#FFF7ED', // Honey cream pill
    colors: {
      bgApp: '#FAFAFA',
      bgSurface: '#FFFFFF',
      bgElevated: '#F8F9FA',
      border: '#E5E7EB',
      borderLight: '#F3F4F6',

      // Button: Gourmet Warm Saffron
      buttonBg: '#EA580C',
      buttonHover: '#C2410C',
      buttonFg: '#FFFFFF',
      buttonShadow: '0 4px 14px rgba(234, 88, 12, 0.25)',
      primary: '#EA580C',
      primaryHover: '#C2410C',
      primaryFg: '#FFFFFF',
      primaryBorder: '#C2410C',
      primaryShadow: '0 4px 14px rgba(234, 88, 12, 0.25)',
      buttonText: '#FFFFFF',

      // Pill: Light Honey Amber with Deep Amber Text (Never Black!)
      pillActiveBg: '#FFF7ED',
      pillActiveFg: '#C2410C',
      pillActiveBorder: '#EA580C',
      pillInactiveBg: '#FFFFFF',
      pillInactiveFg: '#4B5563',
      pillInactiveBorder: '#E5E7EB',
      pillBg: '#FFF7ED',

      secondaryBg: '#FFEDD5',
      secondaryFg: '#9A3412',
      accent: '#EA580C',
      accentFg: '#FFFFFF',

      textPrimary: '#111827',
      textSecondary: '#374151',
      textMuted: '#6B7280',

      headerBg: 'rgba(255, 255, 255, 0.95)',
      headerFg: '#111827',
      bottomBg: 'rgba(255, 255, 255, 0.96)',
      phoneBezel: '#1C1917',
      statusBarBg: '#FFFFFF',
      statusBarFg: '#111827',
      isDark: false,
    },
  },

  // ── 2. ELECTRIC INDIGO (Zepto-inspired Velocity Tech) ─────────────────
  {
    id: 'electric-indigo',
    name: '2. Electric Indigo',
    archetype: 'Zepto Speed',
    subtitle: 'Royal Violet Button • Lavender Mist Pill',
    badge: 'SPEED UX',
    dotColor1: '#4F46E5', // Indigo button
    dotColor2: '#EEF2FF', // Lavender pill
    colors: {
      bgApp: '#F8FAFC',
      bgSurface: '#FFFFFF',
      bgElevated: '#F1F5F9',
      border: '#E2E8F0',
      borderLight: '#F1F5F9',

      // Button: Electric Indigo
      buttonBg: '#4F46E5',
      buttonHover: '#4338CA',
      buttonFg: '#FFFFFF',
      buttonShadow: '0 4px 14px rgba(79, 70, 229, 0.25)',
      primary: '#4F46E5',
      primaryHover: '#4338CA',
      primaryFg: '#FFFFFF',
      primaryBorder: '#4338CA',
      primaryShadow: '0 4px 14px rgba(79, 70, 229, 0.25)',
      buttonText: '#FFFFFF',

      // Pill: Light Cyber Lavender with Crisp Deep Violet Text
      pillActiveBg: '#EEF2FF',
      pillActiveFg: '#3730A3',
      pillActiveBorder: '#6366F1',
      pillInactiveBg: '#FFFFFF',
      pillInactiveFg: '#475569',
      pillInactiveBorder: '#E2E8F0',
      pillBg: '#EEF2FF',

      secondaryBg: '#E0E7FF',
      secondaryFg: '#3730A3',
      accent: '#06B6D4',
      accentFg: '#FFFFFF',

      textPrimary: '#0F172A',
      textSecondary: '#334155',
      textMuted: '#64748B',

      headerBg: 'rgba(255, 255, 255, 0.95)',
      headerFg: '#0F172A',
      bottomBg: 'rgba(255, 255, 255, 0.96)',
      phoneBezel: '#1E1B4B',
      statusBarBg: '#FFFFFF',
      statusBarFg: '#0F172A',
      isDark: false,
    },
  },

  // ── 3. IMPERIAL EMERALD (Botanical Luxury & Garden Dining) ────────────
  {
    id: 'royal-emerald',
    name: '3. Imperial Emerald',
    archetype: 'Botanical Fresh',
    subtitle: 'Forest Green Button • Fresh Mint Pill',
    badge: 'ORGANIC BOTANICAL',
    dotColor1: '#059669', // Emerald button
    dotColor2: '#ECFDF5', // Mint pill
    colors: {
      bgApp: '#F6FAF7',
      bgSurface: '#FFFFFF',
      bgElevated: '#EEF6F0',
      border: '#D1E7DD',
      borderLight: '#E6F4EA',

      // Button: Forest Emerald
      buttonBg: '#059669',
      buttonHover: '#047857',
      buttonFg: '#FFFFFF',
      buttonShadow: '0 4px 14px rgba(5, 150, 105, 0.25)',
      primary: '#059669',
      primaryHover: '#047857',
      primaryFg: '#FFFFFF',
      primaryBorder: '#047857',
      primaryShadow: '0 4px 14px rgba(5, 150, 105, 0.25)',
      buttonText: '#FFFFFF',

      // Pill: Crisp Light Mint with Deep Pine Text
      pillActiveBg: '#ECFDF5',
      pillActiveFg: '#065F46',
      pillActiveBorder: '#10B981',
      pillInactiveBg: '#FFFFFF',
      pillInactiveFg: '#334155',
      pillInactiveBorder: '#D1E7DD',
      pillBg: '#ECFDF5',

      secondaryBg: '#D1FAE5',
      secondaryFg: '#065F46',
      accent: '#10B981',
      accentFg: '#FFFFFF',

      textPrimary: '#0F291E',
      textSecondary: '#1F3A2E',
      textMuted: '#52695E',

      headerBg: 'rgba(255, 255, 255, 0.95)',
      headerFg: '#0F291E',
      bottomBg: 'rgba(255, 255, 255, 0.96)',
      phoneBezel: '#064E3B',
      statusBarBg: '#FFFFFF',
      statusBarFg: '#0F291E',
      isDark: false,
    },
  },

  // ── 4. RUBY CRIMSON (Fresh Zomato Appetite - Clean & Light, No Black) ─
  {
    id: 'ruby-crimson',
    name: '4. Ruby Crimson',
    archetype: 'Appetite Feast',
    subtitle: 'Appetite Red Button • Rose Petal Pill',
    badge: 'HIGH APPETITE',
    dotColor1: '#E11D48', // Ruby red button
    dotColor2: '#FFF1F2', // Soft rose petal pill
    colors: {
      bgApp: '#FAFAFA',
      bgSurface: '#FFFFFF',
      bgElevated: '#F8F9FA',
      border: '#E2E8F0',
      borderLight: '#F1F5F9',

      // Button: Bold Ruby Crimson with White Text
      buttonBg: '#E11D48',
      buttonHover: '#BE123C',
      buttonFg: '#FFFFFF',
      buttonShadow: '0 4px 14px rgba(225, 29, 72, 0.25)',
      primary: '#E11D48',
      primaryHover: '#BE123C',
      primaryFg: '#FFFFFF',
      primaryBorder: '#BE123C',
      primaryShadow: '0 4px 14px rgba(225, 29, 72, 0.25)',
      buttonText: '#FFFFFF',

      // Pill: Light Rose Blush with Deep Ruby Text (Clean & Light, Never Black!)
      pillActiveBg: '#FFF1F2',
      pillActiveFg: '#9F1239',
      pillActiveBorder: '#F43F5E',
      pillInactiveBg: '#FFFFFF',
      pillInactiveFg: '#475569',
      pillInactiveBorder: '#E2E8F0',
      pillBg: '#FFF1F2',

      secondaryBg: '#FFE4E6',
      secondaryFg: '#9F1239',
      accent: '#E11D48',
      accentFg: '#FFFFFF',

      textPrimary: '#0F172A',
      textSecondary: '#334155',
      textMuted: '#64748B',

      headerBg: 'rgba(255, 255, 255, 0.95)',
      headerFg: '#0F172A',
      bottomBg: 'rgba(255, 255, 255, 0.96)',
      phoneBezel: '#0F172A',
      statusBarBg: '#FFFFFF',
      statusBarFg: '#0F172A',
      isDark: false,
    },
  },

  // ── 5. GOLDEN AMBER (Sunlit Luxury Bistro & Saffron Gold) ─────────────
  {
    id: 'golden-amber',
    name: '5. Golden Amber',
    archetype: 'Sunlit Bistro',
    subtitle: 'Warm Amber Button • Buttermilk Cream Pill',
    badge: 'ARTISAN LUXE',
    dotColor1: '#D97706', // Amber gold button
    dotColor2: '#FEF3C7', // Buttermilk cream pill
    colors: {
      bgApp: '#FCFBF9',
      bgSurface: '#FFFFFF',
      bgElevated: '#F8F6F0',
      border: '#E8E4DB',
      borderLight: '#F3EFE7',

      // Button: Warm Amber Gold
      buttonBg: '#D97706',
      buttonHover: '#B45309',
      buttonFg: '#FFFFFF',
      buttonShadow: '0 4px 14px rgba(217, 119, 6, 0.25)',
      primary: '#D97706',
      primaryHover: '#B45309',
      primaryFg: '#FFFFFF',
      primaryBorder: '#B45309',
      primaryShadow: '0 4px 14px rgba(217, 119, 6, 0.25)',
      buttonText: '#FFFFFF',

      // Pill: Light Buttermilk Cream with Deep Roasted Caramel Text
      pillActiveBg: '#FEF3C7',
      pillActiveFg: '#92400E',
      pillActiveBorder: '#D97706',
      pillInactiveBg: '#FFFFFF',
      pillInactiveFg: '#374151',
      pillInactiveBorder: '#E5E7EB',
      pillBg: '#FEF3C7',

      secondaryBg: '#FEF3C7',
      secondaryFg: '#92400E',
      accent: '#D97706',
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

  // ── 6. OCEAN AZURE (Mediterranean Coastal Breeze) ─────────────────────
  {
    id: 'ocean-azure',
    name: '6. Ocean Azure',
    archetype: 'Seaside Breeze',
    subtitle: 'Azure Sky Button • Glacier Ice Pill',
    badge: 'COASTAL FRESH',
    dotColor1: '#0284C7', // Sky azure button
    dotColor2: '#F0F9FF', // Glacier sky pill
    colors: {
      bgApp: '#F8FAFC',
      bgSurface: '#FFFFFF',
      bgElevated: '#F0F7FF',
      border: '#E0E7FF',
      borderLight: '#EDF2F7',

      // Button: Fresh Sky Azure
      buttonBg: '#0284C7',
      buttonHover: '#0369A1',
      buttonFg: '#FFFFFF',
      buttonShadow: '0 4px 14px rgba(2, 132, 199, 0.25)',
      primary: '#0284C7',
      primaryHover: '#0369A1',
      primaryFg: '#FFFFFF',
      primaryBorder: '#0369A1',
      primaryShadow: '0 4px 14px rgba(2, 132, 199, 0.25)',
      buttonText: '#FFFFFF',

      // Pill: Soft Glacier Sky with Deep Marine Text
      pillActiveBg: '#F0F9FF',
      pillActiveFg: '#0369A1',
      pillActiveBorder: '#0EA5E9',
      pillInactiveBg: '#FFFFFF',
      pillInactiveFg: '#334155',
      pillInactiveBorder: '#E0F2FE',
      pillBg: '#F0F9FF',

      secondaryBg: '#E0F2FE',
      secondaryFg: '#0369A1',
      accent: '#0284C7',
      accentFg: '#FFFFFF',

      textPrimary: '#0F172A',
      textSecondary: '#334155',
      textMuted: '#64748B',

      headerBg: 'rgba(255, 255, 255, 0.95)',
      headerFg: '#0F172A',
      bottomBg: 'rgba(255, 255, 255, 0.96)',
      phoneBezel: '#0C2340',
      statusBarBg: '#FFFFFF',
      statusBarFg: '#0F172A',
      isDark: false,
    },
  },

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
