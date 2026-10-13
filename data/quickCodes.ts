export interface WaiterQuickCode {
  code: string;
  dishId: string;
  nameEn: string;
  nameKn: string;
  price: number;
  category: string;
  prepStation: 'HANDI' | 'TAWA_FRY' | 'GRAVY_SOUP' | 'TIFFIN';
}

export const WAITER_QUICK_CODES: WaiterQuickCode[] = [
  {
    code: 'CB',
    dishId: 'dish-20',
    nameEn: 'Chicken Biryani',
    nameKn: 'ಚಿಕನ್ ಬಿರಿಯಾನಿ',
    price: 170,
    category: 'Rice & Biryani',
    prepStation: 'HANDI',
  },
  {
    code: 'MB',
    dishId: 'dish-22',
    nameEn: 'Mutton Biryani',
    nameKn: 'ಮಟನ್ ಬಿರಿಯಾನಿ',
    price: 280,
    category: 'Rice & Biryani',
    prepStation: 'HANDI',
  },
  {
    code: 'BR',
    dishId: 'dish-21',
    nameEn: 'Biryani Rice (Kushka)',
    nameKn: 'ಕುಷ್ಕಾ ಅನ್ನ',
    price: 90,
    category: 'Rice & Biryani',
    prepStation: 'HANDI',
  },
  {
    code: 'CK',
    dishId: 'dish-18',
    nameEn: 'Chicken Kabab',
    nameKn: 'ಚಿಕನ್ ಕಬಾಬ್',
    price: 160,
    category: 'Starters',
    prepStation: 'TAWA_FRY',
  },
  {
    code: 'KF',
    dishId: 'dish-13',
    nameEn: 'Chicken Fry',
    nameKn: 'ಚಿಕನ್ ಫ್ರೈ',
    price: 160,
    category: 'Starters',
    prepStation: 'TAWA_FRY',
  },
  {
    code: 'MF',
    dishId: 'dish-7',
    nameEn: 'Mutton Fry',
    nameKn: 'ಮಟನ್ ಫ್ರೈ',
    price: 260,
    category: 'Starters',
    prepStation: 'TAWA_FRY',
  },
  {
    code: 'MD',
    dishId: 'dish-8',
    nameEn: 'Mutton Dry',
    nameKn: 'ಮಟನ್ ಡ್ರೈ',
    price: 260,
    category: 'Starters',
    prepStation: 'TAWA_FRY',
  },
  {
    code: 'MC',
    dishId: 'dish-9',
    nameEn: 'Mutton Chops',
    nameKn: 'ಮಟನ್ ಚಾಪ್ಸ್',
    price: 260,
    category: 'Starters',
    prepStation: 'GRAVY_SOUP',
  },
  {
    code: 'ML',
    dishId: 'dish-10',
    nameEn: 'Mutton Liver',
    nameKn: 'ಮಟನ್ ಲಿವರ್',
    price: 240,
    category: 'Starters',
    prepStation: 'TAWA_FRY',
  },
  {
    code: 'KB',
    dishId: 'dish-12',
    nameEn: 'Keema Ball',
    nameKn: 'ಖೀಮಾ ಉಂಡೆ',
    price: 180,
    category: 'Starters',
    prepStation: 'TAWA_FRY',
  },
  {
    code: 'KS',
    dishId: 'dish-1',
    nameEn: 'Kaalu Soup',
    nameKn: 'ಕಾಲು ಸೂಪ್',
    price: 120,
    category: 'Sunday Specials',
    prepStation: 'GRAVY_SOUP',
  },
  {
    code: 'PS',
    dishId: 'dish-2',
    nameEn: 'Plain Soup',
    nameKn: 'ಪ್ಲೈನ್ ಸೂಪ್',
    price: 25,
    category: 'Sunday Specials',
    prepStation: 'GRAVY_SOUP',
  },
  {
    code: 'BG',
    dishId: 'dish-5',
    nameEn: 'Booti Gojju',
    nameKn: 'ಬೋಟಿ ಗೊಜ್ಜು',
    price: 180,
    category: 'Sunday Specials',
    prepStation: 'GRAVY_SOUP',
  },
  {
    code: 'KG',
    dishId: 'dish-6',
    nameEn: 'Keema Gojju',
    nameKn: 'ಖೀಮಾ ಗೊಜ್ಜು',
    price: 180,
    category: 'Sunday Specials',
    prepStation: 'GRAVY_SOUP',
  },
  {
    code: 'ID',
    dishId: 'dish-3',
    nameEn: 'Idli (2pcs)',
    nameKn: 'ಇಡ್ಲಿ (೨ ಪೀಸ್)',
    price: 50,
    category: 'Sunday Specials',
    prepStation: 'TIFFIN',
  },
  {
    code: 'DS',
    dishId: 'dish-4',
    nameEn: 'Dosa (2pcs)',
    nameKn: 'ದೋಸೆ (೨ ಪೀಸ್)',
    price: 50,
    category: 'Sunday Specials',
    prepStation: 'TIFFIN',
  },
  {
    code: 'LP',
    dishId: 'dish-15',
    nameEn: 'Chicken Leg Piece (2pcs)',
    nameKn: 'ಲೆಗ್ ಪೀಸ್ (೨ ಪೀಸ್)',
    price: 160,
    category: 'Starters',
    prepStation: 'TAWA_FRY',
  },
  {
    code: 'CC',
    dishId: 'dish-17',
    nameEn: 'Chilli Chicken',
    nameKn: 'ಚಿಲ್ಲಿ ಚಿಕನ್',
    price: 160,
    category: 'Starters',
    prepStation: 'TAWA_FRY',
  },
];

export function lookupQuickCode(input: string): WaiterQuickCode | undefined {
  const normalized = input.trim().toUpperCase();
  return WAITER_QUICK_CODES.find((q) => q.code === normalized);
}
