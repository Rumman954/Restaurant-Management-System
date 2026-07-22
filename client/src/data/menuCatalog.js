export const MENU_CATEGORIES = [
  {
    _id: "italian",
    name: "Italian",
    shortDesc: "Pasta, pizza, and classic Italian comfort food",
    longDesc: "Enjoy Italian favourites like pasta, pizza, risotto, and desserts — perfect for a hearty meal.",
  },
  {
    _id: "chinese",
    name: "Chinese",
    shortDesc: "Noodles, dumplings, and wok-style dishes",
    longDesc: "From noodles and dumplings to stir-fried specials, explore bold Chinese flavours made to order.",
  },
  {
    _id: "snacks",
    name: "Snacks",
    shortDesc: "Quick bites, drinks, and evening treats",
    longDesc: "Light snacks, tea, coffee, fries, rolls, and street-style bites for any time of day.",
  },
  {
    _id: "bangladeshi",
    name: "Bangladeshi",
    shortDesc: "Home-style Bengali meals and classics",
    longDesc: "Traditional Bangladeshi dishes — biryani, bhuna, bhorta, fish curry, and sweets prepared with care.",
  },
  {
    _id: "thai",
    name: "Thai",
    shortDesc: "Curries, noodles, and Thai street food",
    longDesc: "Taste Thai classics like Pad Thai, green curry, Tom Yum, and fresh salads with aromatic spices.",
  },
];

const CATEGORY_IMAGE_FALLBACKS = {
  italian: "/images/Italian.jpg",
  chinese: "/images/Chinese.jpg",
  snacks: "/images/Snacks.jpg",
  bangladeshi: "/images/Bangldeshi.jpg",
  thai: "/images/Thai.jpg",
};

export function categoryImageFor(name, image = "") {
  if (image) return image;
  const key = String(name || "")
    .trim()
    .toLowerCase();
  return CATEGORY_IMAGE_FALLBACKS[key] || "/images/Snacks.jpg";
}

/** Merge DB categories with static menu categories so new admin categories appear publicly. */
export function mergeMenuCategories(apiCategories = []) {
  const slugByName = Object.fromEntries(MENU_CATEGORIES.map((c) => [c.name.toLowerCase(), c._id]));
  const defaultsByName = Object.fromEntries(MENU_CATEGORIES.map((c) => [c.name.toLowerCase(), c]));
  const byName = new Map();

  for (const cat of apiCategories) {
    const nameKey = String(cat.name || "")
      .trim()
      .toLowerCase();
    if (!nameKey) continue;
    const slug = slugByName[nameKey];
    const fallback = defaultsByName[nameKey];
    byName.set(nameKey, {
      _id: cat._id,
      name: cat.name,
      shortDesc: cat.shortDesc || fallback?.shortDesc || "",
      longDesc:
        cat.longDesc ||
        fallback?.longDesc ||
        "Browse delicious foods in this category and add your favourites to the cart.",
      image: categoryImageFor(cat.name, cat.image),
      filterId: slug || String(cat._id),
    });
  }

  for (const cat of MENU_CATEGORIES) {
    const nameKey = cat.name.toLowerCase();
    if (byName.has(nameKey)) continue;
    byName.set(nameKey, {
      _id: cat._id,
      name: cat.name,
      shortDesc: cat.shortDesc,
      longDesc: cat.longDesc,
      image: categoryImageFor(cat.name),
      filterId: cat._id,
    });
  }

  return Array.from(byName.values());
}

export const MENU_FOODS = [
  {
    _id: "bd-chicken-roast",
    categoryId: "bangladeshi",
    fname: "Chicken Roast",
    image: "/images/Bangladeshi/Chicken RoastBangladeshi Chicken Roast (Bangladeshi ).jpg",
    description: "Tender roasted chicken with rich Bengali spices and a golden finish.",
    details: "Slow-roasted for juicy meat and deep flavour — perfect with polao or plain rice.",
  },
  {
    _id: "bd-morog-polao",
    categoryId: "bangladeshi",
    fname: "Morog Polao",
    image: "/images/Bangladeshi/Morog Polao(Bangladeshi).jpg",
    description: "Fragrant rice cooked with chicken and aromatic whole spices.",
    details: "A festive classic — soft rice, flavourful chicken, and warm ghee notes in every bite.",
  },
  {
    _id: "bd-roshmalai",
    categoryId: "bangladeshi",
    fname: "Roshmalai",
    image: "/images/Bangladeshi/Roshmalai(Bangladeshi).jpg",
    description: "Soft cottage-cheese balls soaked in sweet, creamy milk syrup.",
    details: "Chilled and lightly sweet — a beloved Bengali dessert to end your meal.",
  },
  {
    _id: "bd-beef-kala-bhuna",
    categoryId: "bangladeshi",
    fname: "Beef Kala Bhuna",
    image: "/images/Bangladeshi/Beef Kala Bhuna (Bangladeshi).jpg",
    description: "Dark, slow-cooked beef bhuna with bold spices and caramelised onions.",
    details: "Rich and intense — best enjoyed with hot rice or soft roti.",
  },
  {
    _id: "bd-chicken-kosha",
    categoryId: "bangladeshi",
    fname: "Chicken Kosha",
    image: "/images/Bangladeshi/Chicken Kosha(Bangladeshi).jpg",
    description: "Thick, spicy chicken curry cooked down for deep homemade flavour.",
    details: "Kosha-style gravy clings to every piece — ideal with rice or paratha.",
  },
  {
    _id: "bd-chingri-malai-curry",
    categoryId: "bangladeshi",
    fname: "Chingri Malai Curry",
    image: "/images/Bangladeshi/Chingri Malai Curry (Bangladeshi).jpg",
    description: "Prawns simmered in a creamy coconut-milk curry.",
    details: "Mild, rich, and aromatic — a coastal Bengali favourite with steamed rice.",
  },
  {
    _id: "bd-mixed-vegetables",
    categoryId: "bangladeshi",
    fname: "Mixed Vegetables",
    image: "/images/Bangladeshi/Mixed Vegitables(Bangladeshi).jpg",
    description: "Seasonal vegetables lightly spiced for a fresh, healthy side.",
    details: "Colourful and comforting — pairs well with rice, dal, or any curry.",
  },
  {
    _id: "bd-bhorta",
    categoryId: "bangladeshi",
    fname: "Bhorta",
    image: "/images/Bangladeshi/Bhorta(BAngladeshi).jpg",
    description: "Mashed vegetable mash with mustard oil, onion, and green chilli.",
    details: "Simple, fiery, and full of home-style flavour — a true Bengali comfort dish.",
  },
  {
    _id: "bd-sadha-bhat",
    categoryId: "bangladeshi",
    fname: "Sada Bhat",
    image: "/images/Bangladeshi/sadhabhat(Bangladeshi).webp",
    description: "Steamed plain rice — soft, fluffy, and ready for any curry.",
    details: "The everyday base of Bengali meals — serve with bhuna, bhorta, or dal.",
  },
  {
    _id: "bd-achari-chicken-khichuri",
    categoryId: "bangladeshi",
    fname: "Achari Chicken Khichuri",
    image: "/images/Bangladeshi/achari-chicken-vhuna-khichuri (Bangladeshi).jpg",
    description: "Comforting khichuri served with tangy achari chicken.",
    details: "Rainy-day favourite — soft lentils and rice with spicy pickled-style chicken.",
  },
  {
    _id: "bd-shorshe-ilish",
    categoryId: "bangladeshi",
    fname: "Shorshe Ilish",
    image: "/images/Bangladeshi/Shorshe Ilish (bangladeshi).jpg",
    description: "Hilsa fish cooked in classic mustard-seed gravy.",
    details: "Bold mustard aroma and delicate fish — a signature Bengali celebration dish.",
  },
  {
    _id: "bd-mishti-doi",
    categoryId: "bangladeshi",
    fname: "Mishti Doi",
    image: "/images/Bangladeshi/Mishti Doi(Bangladeshi).jpg",
    description: "Sweet caramelised yogurt with a smooth, creamy texture.",
    details: "Served chilled — a traditional dessert that balances spicy main courses.",
  },
  {
    _id: "bd-baingan-bhaja",
    categoryId: "bangladeshi",
    fname: "Baingan Bhaja",
    image: "/images/Bangladeshi/Baingan Bhaja(BAngladeshi).webp",
    description: "Crispy pan-fried eggplant slices with light seasoning.",
    details: "Golden and soft inside — delicious with dal-bhat or as a crunchy side.",
  },

  {
    _id: "ch-biangbiang-noodles",
    categoryId: "chinese",
    fname: "Biangbiang Noodles",
    image: "/images/Chinese/Biangbiang Noodles (Chinese).jpg",
    description: "Hand-pulled wide noodles tossed in spicy chilli oil.",
    details: "Chewy, bold, and satisfying — topped with aromatic garlic and spices.",
  },
  {
    _id: "ch-cold-noodles",
    categoryId: "chinese",
    fname: "Cold Noodles",
    image: "/images/Chinese/Cold Noodles (Chinese).jpg",
    description: "Chilled noodles with a light, refreshing sesame-style dressing.",
    details: "Cool and flavourful — a great choice for a lighter Chinese meal.",
  },
  {
    _id: "ch-beef-suimai",
    categoryId: "chinese",
    fname: "Beef Suimai",
    image: "/images/Chinese/Beef Suimai(chinese).jpg",
    description: "Steamed dumplings filled with seasoned minced beef.",
    details: "Soft wrappers and juicy filling — perfect as a starter or snack plate.",
  },
  {
    _id: "ch-hand-eaten-lamb",
    categoryId: "chinese",
    fname: "Hand-Eaten Lamb",
    image: "/images/Chinese/Hand-Eaten Lamb (Chinese).jpeg",
    description: "Tender lamb pieces served for sharing with rich spices.",
    details: "Hearty and aromatic — enjoy by hand with flatbread or noodles.",
  },
  {
    _id: "ch-big-plate-chicken",
    categoryId: "chinese",
    fname: "Big Plate Chicken",
    image: "/images/Chinese/Big Plate Chicken (Chinese).jpg",
    description: "Chicken and potatoes in a spicy, shareable one-plate stew.",
    details: "Bold Xinjiang-style flavours — best shared with friends over noodles.",
  },
  {
    _id: "ch-roujiamo",
    categoryId: "chinese",
    fname: "Roujiamo",
    image: "/images/Chinese/Roujiamo (Chinese).webp",
    description: "Chinese-style meat sandwich in crisp, warm bread.",
    details: "Savoury shredded meat tucked into freshly baked bun — great on the go.",
  },
  {
    _id: "ch-chowmin",
    categoryId: "chinese",
    fname: "Chowmin",
    image: "/images/Chinese/Chowmin(Chinese).jpg",
    description: "Stir-fried noodles with vegetables and savoury soy seasoning.",
    details: "Fast, tasty, and filling — a popular Chinese comfort classic.",
  },
  {
    _id: "ch-lanzhou-beef-noodles",
    categoryId: "chinese",
    fname: "Lanzhou Beef Noodles",
    image: "/images/Chinese/Lanzhou Beef Noodles (Chinese).jpg",
    description: "Clear beef broth noodles with tender slices of beef.",
    details: "Light yet rich soup, springy noodles, and comforting warmth in every bowl.",
  },

  {
    _id: "it-lasagna-bolognese",
    categoryId: "italian",
    fname: "Lasagna Bolognese",
    image: "/images/Italian/rich Lasagna Bolognese (Italian).jpg",
    description: "Layered pasta with rich meat sauce and melted cheese.",
    details: "Oven-baked comfort food — hearty, creamy, and full of Italian flavour.",
  },
  {
    _id: "it-arancini",
    categoryId: "italian",
    fname: "Arancini",
    image: "/images/Italian/Arancini (Italian).jpg",
    description: "Crispy fried risotto balls with a soft, savoury centre.",
    details: "Golden outside and creamy inside — a perfect Italian starter bite.",
  },
  {
    _id: "it-osso-buco",
    categoryId: "italian",
    fname: "Osso Buco",
    image: "/images/Italian/Osso Buco (Italian).jpeg",
    description: "Slow-braised veal shank in a deep, elegant Italian sauce.",
    details: "Tender meat that falls from the bone — a premium classic main course.",
  },
  {
    _id: "it-bruschetta",
    categoryId: "italian",
    fname: "Bruschetta",
    image: "/images/Italian/Bruschetta (Italian).webp",
    description: "Toasted bread topped with fresh tomato, garlic, and herbs.",
    details: "Light, fresh, and aromatic — ideal as an appetizer before pasta.",
  },
  {
    _id: "it-carbonara",
    categoryId: "italian",
    fname: "Carbonara",
    image: "/images/Italian/Carbonara (Italian).jpg",
    description: "Creamy pasta with egg, cheese, and classic carbonara richness.",
    details: "Silky sauce coats every strand — simple Italian cooking at its best.",
  },
  {
    _id: "it-shrimp-risotto",
    categoryId: "italian",
    fname: "Creamy Shrimp Risotto",
    image: "/images/Italian/creamy-shrimp-risotto-with-mascarpone (Italian).webp",
    description: "Creamy risotto finished with shrimp and soft cheese.",
    details: "Smooth, luxurious rice with seafood sweetness in every spoonful.",
  },
  {
    _id: "it-gnocchi",
    categoryId: "italian",
    fname: "Gnocchi",
    image: "/images/Italian/Gnocchi (Italian).jpg",
    description: "Soft potato dumplings served with a flavourful Italian sauce.",
    details: "Pillowy and comforting — a warm alternative to classic pasta.",
  },

  {
    _id: "sn-egg-roll",
    categoryId: "snacks",
    fname: "Egg Roll",
    image: "/images/Snacks/Egg roll(Snacks).JPG",
    description: "Crispy rolled snack filled with egg and savoury seasoning.",
    details: "Hot and crunchy — great with tea or as a quick evening bite.",
  },
  {
    _id: "sn-green-tea",
    categoryId: "snacks",
    fname: "Green Tea",
    image: "/images/Snacks/Green Tea (Snacks).jpg",
    description: "Light, refreshing green tea served hot.",
    details: "A clean, calming drink to enjoy with snacks or after a meal.",
  },
  {
    _id: "sn-chotpoti",
    categoryId: "snacks",
    fname: "Chotpoti",
    image: "/images/Snacks/Chotpoti (Snacks).jpg",
    description: "Tangy chickpea street snack with spicy tamarind flavours.",
    details: "Zesty, crunchy, and full of desi chaat-style excitement.",
  },
  {
    _id: "sn-black-tea",
    categoryId: "snacks",
    fname: "Black Tea",
    image: "/images/Snacks/Black tea (Snacks).webp",
    description: "Strong black tea brewed for a bold everyday cup.",
    details: "Classic adda companion — perfect with fries, rolls, or biscuits.",
  },
  {
    _id: "sn-coffee",
    categoryId: "snacks",
    fname: "Coffee",
    image: "/images/Snacks/Coffee (Snacks).jpg",
    description: "Freshly prepared coffee with a smooth, aromatic taste.",
    details: "Warm and energising — ideal for breaks, study time, or dessert moments.",
  },
  {
    _id: "sn-french-fries",
    categoryId: "snacks",
    fname: "French Fries",
    image: "/images/Snacks/French Fries(Snacks).jpg",
    description: "Crispy golden fries seasoned and served hot.",
    details: "Crunchy outside, soft inside — a forever favourite side or snack.",
  },
  {
    _id: "sn-milk-tea",
    categoryId: "snacks",
    fname: "Milk Tea",
    image: "/images/Snacks/Milk Tea (Snacks).jpg",
    description: "Creamy milk tea with a sweet, comforting finish.",
    details: "Smooth and soothing — pairs beautifully with evening snacks.",
  },

  {
    _id: "th-tom-kha-gai",
    categoryId: "thai",
    fname: "Tom Kha Gai",
    image: "/images/Thai/Tom Kha Gai(Thai).jpg",
    description: "Creamy coconut chicken soup with lemongrass and galangal.",
    details: "Mildly spicy and fragrant — a comforting Thai soup classic.",
  },
  {
    _id: "th-tom-yum-goong",
    categoryId: "thai",
    fname: "Tom Yum Goong",
    image: "/images/Thai/Tom Yum Goong(Thai).jpg",
    description: "Hot-and-sour prawn soup with bold Thai herbs.",
    details: "Bright, spicy, and aromatic — one of Thailand’s most famous bowls.",
  },
  {
    _id: "th-som-tam",
    categoryId: "thai",
    fname: "Som Tam",
    image: "/images/Thai/Som Tam(Thai).webp",
    description: "Fresh green papaya salad with chilli, lime, and nuts.",
    details: "Crunchy, tangy, and spicy — a refreshing Thai street-food favourite.",
  },
  {
    _id: "th-momos",
    categoryId: "thai",
    fname: "Momos",
    image: "/images/Thai/Momos(Thai).jpeg",
    description: "Steamed dumplings filled with savoury seasoned stuffing.",
    details: "Soft wrappers with juicy filling — great with spicy dipping sauce.",
  },
  {
    _id: "th-khao-niew-mamuang",
    categoryId: "thai",
    fname: "Khao Niew Mamuang",
    image: "/images/Thai/Khao Niew Mamuang (Thai).webp",
    description: "Sweet sticky rice served with ripe mango and coconut milk.",
    details: "A famous Thai dessert — creamy, fruity, and lightly sweet.",
  },
  {
    _id: "th-massaman-curry",
    categoryId: "thai",
    fname: "Massaman Curry",
    image: "/images/Thai/Massaman Curry(Thai).webp",
    description: "Mild Thai curry with warm spices, coconut, and tender meat.",
    details: "Rich and gently spiced — perfect with steamed jasmine rice.",
  },
];

export function categoryLabel(slug) {
  return MENU_CATEGORIES.find((c) => c._id === slug)?.name || slug;
}
