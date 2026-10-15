import { MenuItem } from "../types/customer";

/** Canonical 22-dish menu catalogue for Thoogudeepa Donne Biryani Mane */
export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // ── Sunday Specials / Breakfast ─────────────────────────────────────
  {
    id: "dish-1",
    name: "Kaalu Soup",
    price: 120,
    category: "Sunday Specials",
    badge: "Chef Special",
    description:
      "Traditional military hotel mutton trotter soup slow-simmered with crushed black pepper, bone marrow, and fresh coriander.",
    imagePlaceholder: "KAALU SOUP",
    image: "/images/dishes/kaalu-soup.webp",
    prepMode: "Slow Deg Simmer",
    optionsGroup1: {
      title: "Spice Level",
      choices: ["Traditional Pepper Hot", "Mild Warm Spice"],
    },
    optionsGroup2: {
      title: "Accompaniments",
      addOns: [
        { name: "Extra Soup Bowl", extraPrice: 60 },
        { name: "Lemon & Pepper Spritz", extraPrice: 10 },
      ],
    },
  },
  {
    id: "dish-2",
    name: "Plain Soup",
    price: 25,
    category: "Sunday Specials",
    description:
      "Aromatic clear mutton bone broth spiced with peppercorns, garlic, and fresh herbs without trotter cuts.",
    imagePlaceholder: "PLAIN SOUP",
    image: "/images/dishes/plain-soup.webp",
    prepMode: "Aromatic Infusion",
    optionsGroup1: {
      title: "Spice Level",
      choices: ["Piping Hot", "Warm"],
    },
    optionsGroup2: {
      title: "Add-Ons",
      addOns: [{ name: "Extra Peppercorn Dust", extraPrice: 5 }],
    },
  },
  {
    id: "dish-3",
    name: "Idli (2pcs)",
    price: 50,
    category: "Sunday Specials",
    description:
      "Ultra-soft, steamed rice cakes served hot on banana leaf, ideal pairing with mutton curries and kaalu soup.",
    imagePlaceholder: "IDLI (2PCS)",
    image: "/images/dishes/idli-2pcs.webp",
    prepMode: "Steamed Pot",
    optionsGroup1: {
      title: "Serving Style",
      choices: ["With Non-Veg Gravy", "With Chutney & Sambar"],
    },
    optionsGroup2: {
      title: "Add-Ons",
      addOns: [{ name: "Extra Idli (1 Pc)", extraPrice: 25 }],
    },
  },
  {
    id: "dish-4",
    name: "Dosa (2pcs)",
    price: 50,
    category: "Sunday Specials",
    description:
      "Soft, golden spongy set dosas cooked to perfection on an iron tawa, served hot.",
    imagePlaceholder: "DOSA (2PCS)",
    image: "/images/dishes/dosa-2pcs.webp",
    prepMode: "Tawa Roasted",
    optionsGroup1: {
      title: "Spice Level",
      choices: ["Soft Spongy Set", "Crisp Edge Roast"],
    },
    optionsGroup2: {
      title: "Add-Ons",
      addOns: [{ name: "Pure Ghee Topping", extraPrice: 20 }],
    },
  },
  {
    id: "dish-5",
    name: "Booti Gojju",
    price: 180,
    category: "Sunday Specials",
    badge: "Popular",
    description:
      "Tender diced mutton tripe simmered in a dark, rich, highly spiced military hotel onion-coconut masala gravy.",
    imagePlaceholder: "BOOTI GOJJU",
    image: "/images/dishes/booti-gojju.webp",
    prepMode: "Kadhai Masala Simmer",
    optionsGroup1: {
      title: "Spice Level",
      choices: ["Traditional Hot", "Extra Spicy Guntur"],
    },
    optionsGroup2: {
      title: "Add-Ons",
      addOns: [{ name: "Extra Gravy Portion", extraPrice: 40 }],
    },
  },
  {
    id: "dish-6",
    name: "Keema Gojju",
    price: 180,
    category: "Sunday Specials",
    badge: "Bestseller",
    description:
      "Fine minced mutton simmered into a deeply flavored rustic gravy with ground spices and fresh mint.",
    imagePlaceholder: "KEEMA GOJJU",
    image: "/images/dishes/keema-gojju.webp",
    prepMode: "Handi Dum Stew",
    optionsGroup1: {
      title: "Spice Level",
      choices: ["Traditional Medium Spicy", "Military Hotel Hot"],
    },
    optionsGroup2: {
      title: "Add-Ons",
      addOns: [{ name: "Boiled Egg (1 Pc)", extraPrice: 20 }],
    },
  },

  // ── Starters ────────────────────────────────────────────────────────
  {
    id: "dish-7",
    name: "Mutton Fry",
    price: 260,
    category: "Starters",
    badge: "Chef Special",
    description:
      "Tender chunks of fresh country mutton pan-tossed with shallots, crushed spices, and curry leaves.",
    imagePlaceholder: "MUTTON FRY",
    image: "/images/dishes/mutton-fry.webp",
    prepMode: "Tawa Shallow Fry",
    optionsGroup1: {
      title: "Spice Level",
      choices: ["Semi-Gravy Roast", "Dry Masala Fry"],
    },
    optionsGroup2: {
      title: "Add-Ons",
      addOns: [{ name: "Lemon & Sliced Onions Platter", extraPrice: 15 }],
    },
  },
  {
    id: "dish-8",
    name: "Mutton Dry",
    price: 260,
    category: "Starters",
    description:
      "Succulent mutton cuts slow-roasted with black pepper, roasted coriander, and caramelized onions.",
    imagePlaceholder: "MUTTON DRY",
    image: "/images/dishes/mutton-dry.webp",
    prepMode: "Slow Tawa Roast",
    optionsGroup1: {
      title: "Pepper Intensity",
      choices: ["Extra Black Pepper", "Medium Peppery"],
    },
    optionsGroup2: {
      title: "Add-Ons",
      addOns: [{ name: "Fried Green Chillies", extraPrice: 15 }],
    },
  },
  {
    id: "dish-9",
    name: "Mutton Chops",
    price: 260,
    category: "Starters",
    badge: "Bestseller",
    description:
      "Juicy rib chops marinated in authentic military green masala and braised to tender perfection.",
    imagePlaceholder: "MUTTON CHOPS",
    image: "/images/dishes/mutton-chops.webp",
    prepMode: "Handi Braised",
    optionsGroup1: {
      title: "Portion Style",
      choices: ["Juicy Bone-In Chops", "Tender Soft Cut"],
    },
    optionsGroup2: {
      title: "Add-Ons",
      addOns: [{ name: "Extra Green Masala Dip", extraPrice: 25 }],
    },
  },
  {
    id: "dish-10",
    name: "Mutton Liver",
    price: 240,
    category: "Starters",
    description:
      "Fresh mutton liver pieces pan-roasted with black peppercorns, browned onions, and curry leaves.",
    imagePlaceholder: "MUTTON LIVER",
    image: "/images/dishes/mutton-liver.webp",
    prepMode: "Pan Saute",
    optionsGroup1: {
      title: "Preparation",
      choices: ["Pan Roast Pepper", "Masala Tossed"],
    },
    optionsGroup2: {
      title: "Add-Ons",
      addOns: [{ name: "Lemon Wedge & Onion Rings", extraPrice: 15 }],
    },
  },
  {
    id: "dish-11",
    name: "Botti Gujju",
    price: 180,
    category: "Starters",
    description:
      "Classic Bangalore military hotel goat tripe curry prepared in thick aromatic spice reduction.",
    imagePlaceholder: "BOTTI GUJJU",
    image: "/images/dishes/booti-gojju.webp",
    prepMode: "Kadhai Simmer",
    optionsGroup1: {
      title: "Spice Style",
      choices: ["Traditional Karnataka Masala", "Extra Hot Pepper"],
    },
    optionsGroup2: {
      title: "Add-Ons",
      addOns: [{ name: "Curry Leaf Garnish", extraPrice: 10 }],
    },
  },
  {
    id: "dish-12",
    name: "Keema Ball",
    price: 180,
    category: "Starters",
    badge: "Popular",
    description:
      "Crispy deep-fried seasoned minced mutton meatballs with aromatic herbs and crunch exterior.",
    imagePlaceholder: "KEEMA BALL",
    image: "/images/dishes/keema-ball.webp",
    prepMode: "Deep Fry",
    optionsGroup1: {
      title: "Serving",
      choices: ["Hot Crispy Toss", "With Mint Chutney"],
    },
    optionsGroup2: {
      title: "Add-Ons",
      addOns: [{ name: "Extra Chutney Bowl", extraPrice: 20 }],
    },
  },
  {
    id: "dish-13",
    name: "Chicken Fry",
    price: 160,
    category: "Starters",
    badge: "Bestseller",
    description:
      "Boneless and tender chicken chunks marinated in native spice blend, shallow fried to a golden crisp.",
    imagePlaceholder: "CHICKEN FRY",
    image: "/images/dishes/chicken-fry.webp",
    prepMode: "Tawa Shallow Fry",
    optionsGroup1: {
      title: "Style",
      choices: ["Crispy Dry", "Semi-Roast"],
    },
    optionsGroup2: {
      title: "Add-Ons",
      addOns: [{ name: "Extra Onion & Lemon", extraPrice: 15 }],
    },
  },
  {
    id: "dish-14",
    name: "Chicken Pepper Dry",
    price: 160,
    category: "Starters",
    description:
      "Tender chicken pieces tossed with freshly cracked black pepper, caramelized garlic, and shallots.",
    imagePlaceholder: "CHICKEN PEPPER DRY",
    image: "/images/dishes/chicken-pepper-dry.webp",
    prepMode: "Wok Tossed",
    optionsGroup1: {
      title: "Pepper Heat",
      choices: ["High Pepper Heat", "Balanced Pepper"],
    },
    optionsGroup2: {
      title: "Add-Ons",
      addOns: [{ name: "Garlic Flakes Topping", extraPrice: 15 }],
    },
  },
  {
    id: "dish-15",
    name: "Chicken Leg Piece (2pcs)",
    price: 160,
    category: "Starters",
    badge: "Popular",
    description:
      "Two succulent whole chicken drumsticks marinated in aromatic spices and roasted to tenderness.",
    imagePlaceholder: "CHICKEN LEG PIECE (2PCS)",
    image: "/images/dishes/chicken-leg-piece-2pcs.webp",
    prepMode: "Tandoori Roast",
    optionsGroup1: {
      title: "Preparation",
      choices: ["Masala Roasted", "Crispy Tawa Fry"],
    },
    optionsGroup2: {
      title: "Add-Ons",
      addOns: [{ name: "Mint Chutney & Lime Dip", extraPrice: 20 }],
    },
  },
  {
    id: "dish-16",
    name: "Chicken Leg Piece (1pc)",
    price: 80,
    category: "Starters",
    description:
      "Single tender whole chicken drumstick seasoned and roasted in traditional military masala.",
    imagePlaceholder: "CHICKEN LEG PIECE (1PC)",
    image: "/images/dishes/chicken-leg-piece-1pc.webp",
    prepMode: "Tandoori Roast",
    optionsGroup1: {
      title: "Preparation",
      choices: ["Masala Roasted", "Crispy Tawa Fry"],
    },
    optionsGroup2: {
      title: "Add-Ons",
      addOns: [{ name: "Lime & Sliced Onions", extraPrice: 10 }],
    },
  },
  {
    id: "dish-17",
    name: "Chilli Chicken",
    price: 160,
    category: "Starters",
    description:
      "Bite-sized chicken chunks tossed with fiery green chillies, curry leaves, and native seasoning.",
    imagePlaceholder: "CHILLI CHICKEN",
    image: "/images/dishes/chilli-chicken.webp",
    prepMode: "Wok Fry",
    optionsGroup1: {
      title: "Chilli Heat",
      choices: ["Fiery Andhra Style", "Medium Spicy"],
    },
    optionsGroup2: {
      title: "Add-Ons",
      addOns: [{ name: "Fried Green Chillies", extraPrice: 15 }],
    },
  },
  {
    id: "dish-18",
    name: "Chicken Kabab",
    price: 160,
    category: "Starters",
    badge: "Bestseller",
    description:
      "Crispy deep-fried chicken cubes coated with curd, ginger-garlic paste, and vibrant Indian spices.",
    imagePlaceholder: "CHICKEN KABAB",
    image: "/images/dishes/chicken-kabab.webp",
    prepMode: "Deep Fry",
    optionsGroup1: {
      title: "Cut Preference",
      choices: ["Boneless Cuts", "Traditional Bone-In"],
    },
    optionsGroup2: {
      title: "Add-Ons",
      addOns: [
        { name: "Onion Salad Plate", extraPrice: 15 },
        { name: "Mint Dip", extraPrice: 20 },
      ],
    },
  },
  {
    id: "dish-19",
    name: "Chicken Chops",
    price: 160,
    category: "Starters",
    description:
      "Tender chicken cuts slow-simmered in an intensely fragrant green herb and mint-coriander gravy.",
    imagePlaceholder: "CHICKEN CHOPS",
    image: "/images/dishes/chicken-chops.webp",
    prepMode: "Handi Braised",
    optionsGroup1: {
      title: "Gravy Consistency",
      choices: ["Thick Semi-Gravy", "Rich Curry Base"],
    },
    optionsGroup2: {
      title: "Add-Ons",
      addOns: [{ name: "Extra Mint Leaves Garnish", extraPrice: 10 }],
    },
  },

  // ── Rice & Biryani ──────────────────────────────────────────────────
  {
    id: "dish-20",
    name: "Chicken Biryani",
    price: 170,
    category: "Rice & Biryani",
    badge: "Bestseller",
    description:
      "Fragrant Seeraga Samba short-grain rice cooked with tender chicken cuts, fresh mint, coriander, and native green masala, served hot in authentic leaf donne.",
    imagePlaceholder: "CHICKEN BIRYANI",
    image: "/images/dishes/chicken-biryani.webp",
    prepMode: "Military Dum Handi",
    optionsGroup1: {
      title: "Spice Level",
      choices: ["Medium Spicy (Traditional)", "Extra Hot Guntur Chilli"],
    },
    optionsGroup2: {
      title: "Add-Ons",
      addOns: [
        { name: "Extra Boiled Egg (1 Pc)", extraPrice: 20 },
        { name: "Kushka Rice Portion", extraPrice: 90 },
      ],
    },
  },
  {
    id: "dish-21",
    name: "Biryani Rice",
    price: 90,
    category: "Rice & Biryani",
    description:
      "Aromatic Seeraga Samba kushka rice cooked in rich meat stock and fragrant whole spices without meat pieces.",
    imagePlaceholder: "BIRYANI RICE",
    image: "/images/dishes/biryani-rice.webp",
    prepMode: "Dum Deg",
    optionsGroup1: {
      title: "Accompaniment Style",
      choices: ["With Raita & Salan", "Salan Only"],
    },
    optionsGroup2: {
      title: "Add-Ons",
      addOns: [
        { name: "Extra Salan Bowl", extraPrice: 25 },
        { name: "Boiled Egg (1 Pc)", extraPrice: 20 },
      ],
    },
  },
  {
    id: "dish-22",
    name: "Mutton Biryani",
    price: 280,
    category: "Rice & Biryani",
    badge: "Signature",
    description:
      "Tender country mutton slow-cooked with military hotel spices, fragrant jeera samba rice, and rich bone marrow gravy, served in traditional leaf donne.",
    imagePlaceholder: "MUTTON BIRYANI",
    image: "/images/dishes/mutton-biryani.webp",
    prepMode: "Slow Dum Deg",
    optionsGroup1: {
      title: "Preparation Choice",
      choices: ["Traditional Bone-In Cut", "Tender Boneless Cut"],
    },
    optionsGroup2: {
      title: "Add-Ons",
      addOns: [
        { name: "Extra Pepper Gravy Bowl", extraPrice: 35 },
        { name: "Boiled Egg (2 Pcs)", extraPrice: 35 },
      ],
    },
  },
  {
    id: "dish-23",
    name: "Special Chicken Donne Biryani",
    price: 290,
    category: "Rice & Biryani",
    badge: "Bestseller",
    description:
      "Signature Donne Biryani loaded with extra succulent chicken cuts, cooked in fragrant Seeraga Samba rice with pure ghee and fresh mint.",
    imagePlaceholder: "SPECIAL CHICKEN BIRYANI",
    image: "/images/dishes/chicken-biryani.webp",
    prepMode: "Military Dum Handi",
    optionsGroup1: {
      title: "Spice Level",
      choices: ["Medium Spicy (Traditional)", "Extra Hot Guntur Chilli"],
    },
    optionsGroup2: {
      title: "Add-Ons",
      addOns: [
        { name: "Extra Boiled Egg (1 Pc)", extraPrice: 20 },
        { name: "Kushka Rice Portion", extraPrice: 90 },
      ],
    },
  },
  {
    id: "dish-24",
    name: "Egg Biryani",
    price: 160,
    category: "Rice & Biryani",
    badge: "Popular",
    description:
      "Fragrant Donne Biryani rice cooked in spiced meat stock, served with two golden fried boiled eggs and raita.",
    imagePlaceholder: "EGG BIRYANI",
    image: "/images/dishes/biryani-rice.webp",
    prepMode: "Military Dum Handi",
    optionsGroup1: {
      title: "Preparation",
      choices: ["Standard Spiced", "Mild Spiced"],
    },
    optionsGroup2: {
      title: "Add-Ons",
      addOns: [{ name: "Extra Boiled Egg (1 Pc)", extraPrice: 20 }],
    },
  },
  {
    id: "dish-25",
    name: "Guntur Chicken Wings",
    price: 260,
    category: "Starters",
    badge: "Popular",
    description:
      "Fiery chicken wings pan-roasted with crushed Guntur red chillies, curry leaves, and country garlic.",
    imagePlaceholder: "GUNTUR CHICKEN WINGS",
    image: "/images/dishes/chicken-fry.webp",
    prepMode: "Tandoori Roast",
    optionsGroup1: {
      title: "Spice Level",
      choices: ["Fiery Guntur Hot", "Medium Hot"],
    },
    optionsGroup2: {
      title: "Add-Ons",
      addOns: [{ name: "Lemon Wedge Platter", extraPrice: 10 }],
    },
  },
  {
    id: "dish-26",
    name: "Mutton Liver Fry",
    price: 240,
    category: "Starters",
    badge: "Chef Special",
    description:
      "Fresh tender mutton liver pan-sauteed with freshly cracked pepper, caramelized shallots, and herbs.",
    imagePlaceholder: "MUTTON LIVER FRY",
    image: "/images/dishes/mutton-liver.webp",
    prepMode: "Pan Saute",
    optionsGroup1: {
      title: "Preparation",
      choices: ["Pepper Dry Toss", "Semi Gravy Roast"],
    },
    optionsGroup2: {
      title: "Add-Ons",
      addOns: [{ name: "Onion & Lime", extraPrice: 15 }],
    },
  },

  // ── Sides & Desserts ────────────────────────────────────────────────
  {
    id: "dish-27",
    name: "Malabar Parotta (2pcs)",
    price: 50,
    category: "Sides & Desserts",
    description:
      "Crisp, flaky layered parottas served fresh and hot, perfect pairing with rich gravies and fry dishes.",
    imagePlaceholder: "MALABAR PAROTTA",
    image: "/images/dishes/dosa-2pcs.webp",
    prepMode: "Tawa Roasted",
    optionsGroup1: {
      title: "Preparation",
      choices: ["Crispy Flaky", "Soft Layered"],
    },
    optionsGroup2: {
      title: "Add-Ons",
      addOns: [{ name: "Extra Parotta (1 Pc)", extraPrice: 25 }],
    },
  },
  {
    id: "dish-28",
    name: "Donne Gulab Jamun (2 Pcs)",
    price: 60,
    category: "Sides & Desserts",
    badge: "Popular",
    description:
      "Warm, melt-in-mouth khoya gulab jamuns soaked in aromatic green cardamom and saffron syrup.",
    imagePlaceholder: "GULAB JAMUN",
    image: "/images/dishes/gulab-jamun.webp",
    prepMode: "Hot Sugar Syrup",
    optionsGroup1: {
      title: "Serving Style",
      choices: ["Warm with Syrup", "With Ice Cream"],
    },
    optionsGroup2: {
      title: "Add-Ons",
      addOns: [{ name: "Extra Scoop Vanilla Ice Cream", extraPrice: 35 }],
    },
  },

  // ── Beverages ───────────────────────────────────────────────────────
  {
    id: "dish-29",
    name: "Special Filter Coffee",
    price: 40,
    category: "Beverages",
    badge: "Popular",
    description:
      "Traditional South Indian filter coffee brewed with rich freshly pressed chicory decoction and hot frothy milk.",
    imagePlaceholder: "FILTER COFFEE",
    image: "/images/dishes/coffee.webp",
    prepMode: "Brass Decoction",
    optionsGroup1: {
      title: "Sweetness",
      choices: ["Regular Sweet", "Less Sweet", "No Sugar"],
    },
    optionsGroup2: {
      title: "Add-Ons",
      addOns: [{ name: "Extra Strong Decoction", extraPrice: 10 }],
    },
  },
  {
    id: "dish-30",
    name: "Fresh Lime Soda",
    price: 45,
    category: "Beverages",
    description:
      "Freshly squeezed lemon juice topped with sparkling chilled soda.",
    imagePlaceholder: "LIME SODA",
    image: "/images/dishes/soda.webp",
    prepMode: "Chilled Spritz",
    optionsGroup1: {
      title: "Preparation",
      choices: ["Sweet", "Salted", "Mixed Sweet & Salt"],
    },
    optionsGroup2: {
      title: "Add-Ons",
      addOns: [{ name: "Mint Leaves Spritz", extraPrice: 10 }],
    },
  },
  {
    id: "dish-31",
    name: "Mineral Water",
    price: 25,
    category: "Beverages",
    description:
      "1 Litre sealed packaged natural drinking water bottle.",
    imagePlaceholder: "MINERAL WATER",
    image: "/images/dishes/water.webp",
    prepMode: "Chilled Bottle",
    optionsGroup1: {
      title: "Temperature",
      choices: ["Chilled", "Room Temperature"],
    },
    optionsGroup2: {
      title: "Serving",
      addOns: [{ name: "Extra Paper Glasses", extraPrice: 0 }],
    },
  },
];
