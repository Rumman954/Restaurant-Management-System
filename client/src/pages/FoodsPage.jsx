import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../lib/api";

export default function FoodsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expandedFood, setExpandedFood] = useState(null);
  const [orderNotice, setOrderNotice] = useState("");
  const [showLoginWarning, setShowLoginWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const fallbackFoods = [
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
    description: "This is a popular Food of Bangladesh. Order Now to Grab a bite of it!",
    details: "Freshly prepared and tasty food item from this category.",
  }));

  const fallbackCategories = [
    { _id: "italian", name: "Italian" },
    { _id: "chinese", name: "Chinese" },
    { _id: "snacks", name: "Snacks" },
    { _id: "bangladeshi", name: "Bangladeshi" },
    { _id: "thai", name: "Thai" },
  ];

  useEffect(() => {
    Promise.all([api.get("/foods"), api.get("/categories")])
      .then(([foodsRes, categoriesRes]) => {
        setFoods(foodsRes.data);
        setCategories(categoriesRes.data);
        setLoadError("");
      })
      .catch(() => {
        setFoods([]);
        setCategories([]);
        setLoadError("Could not load foods from server. Showing fallback menu.");
      })
      .finally(() => setIsLoading(false));
  }, []);
  const selectedCategory = searchParams.get("category") || "all";

  const displayedFoods = foods.length > 0 ? foods : fallbackFoods;
  const displayedCategories = categories.length > 0 ? categories : fallbackCategories;
  const visibleFoods =
    selectedCategory === "all"
      ? displayedFoods
      : displayedFoods.filter((food) => {
          if (!food.categoryId) return false;
          if (typeof food.categoryId === "string") return food.categoryId === selectedCategory;
          return food.categoryId?._id === selectedCategory;
        });

  const handleLoginWarningOk = () => {
    setShowLoginWarning(false);
    window.dispatchEvent(new Event("open-login-modal"));
  };

  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
        {orderNotice && (
          <p className="mb-8 rounded border border-zinc-700 bg-[#ee2c72] px-4 py-3 text-center text-sm font-semibold text-white">
            {orderNotice}
          </p>
        )}
        {loadError && <p className="mb-5 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">{loadError}</p>}
        <h2 className="mb-8 text-center text-4xl font-medium text-zinc-800 sm:text-5xl">Foods Area!</h2>
        <div className="mb-7 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              selectedCategory === "all" ? "bg-[#ee6e73] text-white" : "bg-white text-zinc-700 hover:bg-zinc-100"
            }`}
            onClick={() => setSearchParams({})}
          >
            All Foods
          </button>
          {displayedCategories.map((category) => (
            <button
              key={category._id}
              type="button"
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                selectedCategory === category._id
                  ? "bg-[#ee6e73] text-white"
                  : "bg-white text-zinc-700 hover:bg-zinc-100"
              }`}
              onClick={() => setSearchParams({ category: category._id })}
            >
              {category.name}
            </button>
          ))}
        </div>
        {isLoading && (
          <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={`food-skeleton-${index}`} className="h-[320px] animate-pulse rounded border border-zinc-200 bg-zinc-100" />
            ))}
          </div>
        )}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleFoods.map((food) => {
            const id = food._id ?? food.fname;
            const summary = food.description ?? "This is a popular Food of Bangladesh. Order Now to Grab a bite of it!";
            const details = food.details ?? summary;
            const image = food.image ?? "/images/Snacks.jpg";
            const isExpanded = expandedFood === id;

            return (
              <div key={id} className="h-[320px] [perspective:1000px]">
                <div
                  className="relative h-full w-full rounded border border-zinc-200 transition-transform duration-700 [transform-style:preserve-3d]"
                  style={{ transform: isExpanded ? "rotateY(180deg)" : "rotateY(0deg)" }}
                >
                  <article className="absolute inset-0 overflow-hidden rounded bg-white shadow-sm [backface-visibility:hidden]">
                    <img src={image} alt={food.fname} className="h-32 w-full object-cover sm:h-36" />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-2xl font-normal sm:text-3xl">{food.fname}</h3>
                        <button
                          type="button"
                          className="text-xl leading-none text-zinc-700 transition hover:text-zinc-900"
                          onClick={() => setExpandedFood(id)}
                          aria-label={`Show ${food.fname} details`}
                        >
                          ⋮
                        </button>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-zinc-600">{summary}</p>
                      <button
                        type="button"
                        className="mt-4 w-full rounded-sm bg-[#ee6e73] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white transition hover:bg-[#e35f66]"
                        onClick={async () => {
                          const orderName = food.fname || "Food order";
                          const authToken = sessionStorage.getItem("authToken");
                          const authUser = sessionStorage.getItem("authUser");
                          if (!authToken || !authUser) {
                            setShowLoginWarning(true);
                            return;
                          }

                          try {
                            const res = await api.post(
                              "/orders",
                              { foodName: orderName },
                              { headers: { Authorization: `Bearer ${authToken}` } }
                            );
                            const placedOrderId = res?.data?.order?.orderId;
                            setOrderNotice(`Order Placed! Your Order ID is : ${placedOrderId}`);
                          } catch (error) {
                            const message = error?.response?.data?.msg || "Order failed. Please try again.";
                            setOrderNotice(message);
                          }
                        }}
                      >
                        Order Now!
                      </button>
                    </div>
                  </article>

                  <article className="absolute inset-0 rounded bg-white p-4 shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-2xl font-normal">{food.fname}</h3>
                      <button
                        type="button"
                        className="text-lg text-zinc-600 transition hover:text-zinc-900"
                        onClick={() => setExpandedFood(null)}
                        aria-label={`Close ${food.fname} details`}
                      >
                        ×
                      </button>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-zinc-600">{details}</p>
                  </article>
                </div>
              </div>
            );
          })}
        </div>
        {visibleFoods.length === 0 && (
          <p className="mt-8 text-center text-sm text-zinc-600">No foods found for this category.</p>
        )}
      </section>

      {showLoginWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-md rounded bg-white p-6 shadow-xl">
            <p className="text-center text-base text-zinc-800">For place order please login your account</p>
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                className="rounded-sm bg-[#ee6e73] px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#e35f66]"
                onClick={handleLoginWarningOk}
              >
                Ok
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
