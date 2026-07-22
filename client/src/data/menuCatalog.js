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

const DEFAULT_DESCRIPTION = "Freshly prepared menu item — add to cart and order now.";
const DEFAULT_DETAILS = "Prepared fresh in our kitchen and ready for pickup or delivery.";

export const MENU_FOODS = [
  { _id: "bd-chicken-roast", categoryId: "bangladeshi", fname: "Chicken Roast", image: "/images/Bangladeshi/Chicken RoastBangladeshi Chicken Roast (Bangladeshi ).jpg" },
  { _id: "bd-morog-polao", categoryId: "bangladeshi", fname: "Morog Polao", image: "/images/Bangladeshi/Morog Polao(Bangladeshi).jpg" },
  { _id: "bd-roshmalai", categoryId: "bangladeshi", fname: "Roshmalai", image: "/images/Bangladeshi/Roshmalai(Bangladeshi).jpg" },
  { _id: "bd-beef-kala-bhuna", categoryId: "bangladeshi", fname: "Beef Kala Bhuna", image: "/images/Bangladeshi/Beef Kala Bhuna (Bangladeshi).jpg" },
  { _id: "bd-chicken-kosha", categoryId: "bangladeshi", fname: "Chicken Kosha", image: "/images/Bangladeshi/Chicken Kosha(Bangladeshi).jpg" },
  { _id: "bd-chingri-malai-curry", categoryId: "bangladeshi", fname: "Chingri Malai Curry", image: "/images/Bangladeshi/Chingri Malai Curry (Bangladeshi).jpg" },
  { _id: "bd-mixed-vegetables", categoryId: "bangladeshi", fname: "Mixed Vegetables", image: "/images/Bangladeshi/Mixed Vegitables(Bangladeshi).jpg" },
  { _id: "bd-bhorta", categoryId: "bangladeshi", fname: "Bhorta", image: "/images/Bangladeshi/Bhorta(BAngladeshi).jpg" },
  { _id: "bd-sadha-bhat", categoryId: "bangladeshi", fname: "Sada Bhat", image: "/images/Bangladeshi/sadhabhat(Bangladeshi).webp" },
  { _id: "bd-achari-chicken-khichuri", categoryId: "bangladeshi", fname: "Achari Chicken Khichuri", image: "/images/Bangladeshi/achari-chicken-vhuna-khichuri (Bangladeshi).jpg" },
  { _id: "bd-shorshe-ilish", categoryId: "bangladeshi", fname: "Shorshe Ilish", image: "/images/Bangladeshi/Shorshe Ilish (bangladeshi).jpg" },
  { _id: "bd-mishti-doi", categoryId: "bangladeshi", fname: "Mishti Doi", image: "/images/Bangladeshi/Mishti Doi(Bangladeshi).jpg" },
  { _id: "bd-baingan-bhaja", categoryId: "bangladeshi", fname: "Baingan Bhaja", image: "/images/Bangladeshi/Baingan Bhaja(BAngladeshi).webp" },

  { _id: "ch-biangbiang-noodles", categoryId: "chinese", fname: "Biangbiang Noodles", image: "/images/Chinese/Biangbiang Noodles (Chinese).jpg" },
  { _id: "ch-cold-noodles", categoryId: "chinese", fname: "Cold Noodles", image: "/images/Chinese/Cold Noodles (Chinese).jpg" },
  { _id: "ch-beef-suimai", categoryId: "chinese", fname: "Beef Suimai", image: "/images/Chinese/Beef Suimai(chinese).jpg" },
  { _id: "ch-hand-eaten-lamb", categoryId: "chinese", fname: "Hand-Eaten Lamb", image: "/images/Chinese/Hand-Eaten Lamb (Chinese).jpeg" },
  { _id: "ch-big-plate-chicken", categoryId: "chinese", fname: "Big Plate Chicken", image: "/images/Chinese/Big Plate Chicken (Chinese).jpg" },
  { _id: "ch-roujiamo", categoryId: "chinese", fname: "Roujiamo", image: "/images/Chinese/Roujiamo (Chinese).webp" },
  { _id: "ch-chowmin", categoryId: "chinese", fname: "Chowmin", image: "/images/Chinese/Chowmin(Chinese).jpg" },
  { _id: "ch-lanzhou-beef-noodles", categoryId: "chinese", fname: "Lanzhou Beef Noodles", image: "/images/Chinese/Lanzhou Beef Noodles (Chinese).jpg" },

  { _id: "it-lasagna-bolognese", categoryId: "italian", fname: "Lasagna Bolognese", image: "/images/Italian/rich Lasagna Bolognese (Italian).jpg" },
  { _id: "it-arancini", categoryId: "italian", fname: "Arancini", image: "/images/Italian/Arancini (Italian).jpg" },
  { _id: "it-osso-buco", categoryId: "italian", fname: "Osso Buco", image: "/images/Italian/Osso Buco (Italian).jpeg" },
  { _id: "it-bruschetta", categoryId: "italian", fname: "Bruschetta", image: "/images/Italian/Bruschetta (Italian).webp" },
  { _id: "it-carbonara", categoryId: "italian", fname: "Carbonara", image: "/images/Italian/Carbonara (Italian).jpg" },
  { _id: "it-shrimp-risotto", categoryId: "italian", fname: "Creamy Shrimp Risotto", image: "/images/Italian/creamy-shrimp-risotto-with-mascarpone (Italian).webp" },
  { _id: "it-gnocchi", categoryId: "italian", fname: "Gnocchi", image: "/images/Italian/Gnocchi (Italian).jpg" },

  { _id: "sn-egg-roll", categoryId: "snacks", fname: "Egg Roll", image: "/images/Snacks/Egg roll(Snacks).JPG" },
  { _id: "sn-green-tea", categoryId: "snacks", fname: "Green Tea", image: "/images/Snacks/Green Tea (Snacks).jpg" },
  { _id: "sn-chotpoti", categoryId: "snacks", fname: "Chotpoti", image: "/images/Snacks/Chotpoti (Snacks).jpg" },
  { _id: "sn-black-tea", categoryId: "snacks", fname: "Black Tea", image: "/images/Snacks/Black tea (Snacks).webp" },
  { _id: "sn-coffee", categoryId: "snacks", fname: "Coffee", image: "/images/Snacks/Coffee (Snacks).jpg" },
  { _id: "sn-french-fries", categoryId: "snacks", fname: "French Fries", image: "/images/Snacks/French Fries(Snacks).jpg" },
  { _id: "sn-milk-tea", categoryId: "snacks", fname: "Milk Tea", image: "/images/Snacks/Milk Tea (Snacks).jpg" },

  { _id: "th-tom-kha-gai", categoryId: "thai", fname: "Tom Kha Gai", image: "/images/Thai/Tom Kha Gai(Thai).jpg" },
  { _id: "th-tom-yum-goong", categoryId: "thai", fname: "Tom Yum Goong", image: "/images/Thai/Tom Yum Goong(Thai).jpg" },
  { _id: "th-som-tam", categoryId: "thai", fname: "Som Tam", image: "/images/Thai/Som Tam(Thai).webp" },
  { _id: "th-momos", categoryId: "thai", fname: "Momos", image: "/images/Thai/Momos(Thai).jpeg" },
  { _id: "th-khao-niew-mamuang", categoryId: "thai", fname: "Khao Niew Mamuang", image: "/images/Thai/Khao Niew Mamuang (Thai).webp" },
  { _id: "th-massaman-curry", categoryId: "thai", fname: "Massaman Curry", image: "/images/Thai/Massaman Curry(Thai).webp" },
].map((food) => ({
  ...food,
  description: DEFAULT_DESCRIPTION,
  details: DEFAULT_DETAILS,
}));

export function categoryLabel(slug) {
  return MENU_CATEGORIES.find((c) => c._id === slug)?.name || slug;
}
