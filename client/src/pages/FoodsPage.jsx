import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { formatPrice } from "../lib/formatPrice";
import { MENU_FOODS, mergeMenuCategories } from "../data/menuCatalog";
import { useCart } from "../context/CartContext";
import CartFab from "../components/CartFab";

const FOODS_BATCH = 9;

export default function FoodsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [expandedFood, setExpandedFood] = useState(null);
  const [cartNotice, setCartNotice] = useState("");
  const [apiCategories, setApiCategories] = useState([]);
  const { addItem } = useCart();
  const [apiFoods, setApiFoods] = useState([]);
  const [visibleCount, setVisibleCount] = useState(FOODS_BATCH);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const loadMoreSentinelRef = useRef(null);

  useEffect(() => {
    let active = true;
    Promise.all([api.get("/categories"), api.get("/foods")])
      .then(([categoriesRes, foodsRes]) => {
        if (!active) return;
        setApiCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
        setApiFoods(Array.isArray(foodsRes.data) ? foodsRes.data : []);
      })
      .catch(() => {
        if (!active) return;
        setApiCategories([]);
        setApiFoods([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const menuCategories = useMemo(() => mergeMenuCategories(apiCategories), [apiCategories]);

  const categoryKeysByName = useMemo(() => {
    const map = new Map();
    for (const category of menuCategories) {
      const nameKey = String(category.name || "")
        .trim()
        .toLowerCase();
      if (!nameKey) continue;
      map.set(nameKey, new Set([String(category.filterId), String(category._id)]));
    }
    return map;
  }, [menuCategories]);

  const allFoods = useMemo(() => {
    let hidden = [];
    let imageOverrides = {};
    try {
      hidden = JSON.parse(localStorage.getItem("adminHiddenMenuFoods") || "[]");
      imageOverrides = JSON.parse(localStorage.getItem("adminFoodImageOverrides") || "{}");
    } catch {
      hidden = [];
      imageOverrides = {};
    }

    const dbPriceByName = new Map(
      apiFoods.map((food) => [String(food.fname || "").trim().toLowerCase(), Number(food.price) || 0])
    );

    const fromMenu = MENU_FOODS.filter((food) => !hidden.includes(food._id)).map((food) => {
      const keys = categoryKeysByName.get(
        String(
          menuCategories.find((c) => c.filterId === food.categoryId)?.name || food.categoryId
        )
          .trim()
          .toLowerCase()
      );
      const nameKey = String(food.fname || "").trim().toLowerCase();
      return {
        ...food,
        image: imageOverrides[food._id] || food.image,
        price: dbPriceByName.get(nameKey) || 0,
        categoryKeys: keys ? Array.from(keys) : [food.categoryId],
        source: "menu",
      };
    });

    const menuNames = new Set(fromMenu.map((food) => String(food.fname || "").trim().toLowerCase()));

    const fromApi = apiFoods
      .filter((food) => !menuNames.has(String(food.fname || "").trim().toLowerCase()))
      .map((food) => {
        const categoryName = food.categoryId?.name || "";
        const categoryMongoId = String(food.categoryId?._id || food.categoryId || "");
        const nameKey = categoryName.trim().toLowerCase();
        const keys = new Set(categoryKeysByName.get(nameKey) || []);
        if (categoryMongoId) keys.add(categoryMongoId);
        const matched = menuCategories.find((c) => String(c._id) === categoryMongoId || c.name?.toLowerCase() === nameKey);
        if (matched?.filterId) keys.add(String(matched.filterId));

        return {
          _id: food._id,
          fname: food.fname,
          description: food.description || "This is a popular Food of Bangladesh. Order Now to Grab a bite of it!",
          details: food.description || "Freshly prepared and tasty food item from this category.",
          image: imageOverrides[food._id] || food.image || "/images/Snacks.jpg",
          price: Number(food.price) > 0 ? Number(food.price) : 0,
          categoryId: matched?.filterId || categoryMongoId,
          categoryKeys: Array.from(keys),
          source: "api",
        };
      });

    return [...fromMenu, ...fromApi];
  }, [apiFoods, categoryKeysByName, menuCategories]);

  const selectedCategory = searchParams.get("category") || "all";

  const visibleFoods = useMemo(() => {
    if (selectedCategory === "all") return allFoods;
    return allFoods.filter((food) => {
      if (food.categoryId === selectedCategory) return true;
      if (food.categoryKeys?.includes(selectedCategory)) return true;
      const selected = menuCategories.find(
        (c) => c.filterId === selectedCategory || String(c._id) === selectedCategory
      );
      if (!selected) return false;
      return (
        food.categoryId === selected.filterId ||
        food.categoryKeys?.includes(String(selected._id)) ||
        food.categoryKeys?.includes(String(selected.filterId))
      );
    });
  }, [allFoods, menuCategories, selectedCategory]);

  const displayedFoods = useMemo(
    () => visibleFoods.slice(0, visibleCount),
    [visibleFoods, visibleCount]
  );
  const hasMoreFoods = visibleCount < visibleFoods.length;

  useEffect(() => {
    setVisibleCount(FOODS_BATCH);
    setShowLoadMore(false);
    setExpandedFood(null);
  }, [selectedCategory]);

  useEffect(() => {
    const node = loadMoreSentinelRef.current;
    if (!node || !hasMoreFoods) {
      setShowLoadMore(false);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShowLoadMore(true);
      },
      { root: null, rootMargin: "80px", threshold: 0 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMoreFoods, displayedFoods.length]);

  const handleLoadMore = () => {
    setVisibleCount((count) => Math.min(count + FOODS_BATCH, visibleFoods.length));
    setShowLoadMore(false);
  };

  const selectCategory = (categoryFilterId) => {
    const next = new URLSearchParams();
    if (categoryFilterId) next.set("category", categoryFilterId);
    setSearchParams(next);
  };

  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
        {cartNotice && (
          <p className="mb-8 rounded border border-zinc-700 bg-[#ee6e73] px-4 py-3 text-center text-sm font-semibold text-white dark:border-[#5a2a4a] dark:bg-[#421F37]">
            {cartNotice}
          </p>
        )}
        <h2 className="mb-8 text-center text-4xl font-medium text-zinc-800 dark:text-zinc-300 sm:text-5xl">Foods Area!</h2>
        <div className="mb-7 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              selectedCategory === "all" ? "brand-chip" : "bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
            onClick={() => selectCategory(null)}
          >
            All Foods
          </button>
          {menuCategories.map((category) => {
            const isActive =
              selectedCategory === category.filterId || selectedCategory === String(category._id);
            return (
              <button
                key={String(category._id)}
                type="button"
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? "brand-chip"
                    : "bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
                onClick={() => selectCategory(category.filterId)}
              >
                {category.name}
              </button>
            );
          })}
        </div>
        <div className="grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayedFoods.map((food) => {
            const id = food._id ?? food.fname;
            const summary = food.description ?? "This is a popular Food of Bangladesh. Order Now to Grab a bite of it!";
            const details = food.details ?? summary;
            const image = food.image ?? "/images/Snacks.jpg";
            const priceLabel = formatPrice(food.price);
            const isExpanded = expandedFood === id;

            return (
              <div key={id} className="h-full min-h-[380px] [perspective:1000px]">
                <div
                  className="relative h-full min-h-[380px] w-full rounded border border-zinc-200 dark:border-zinc-700 transition-transform duration-700 [transform-style:preserve-3d]"
                  style={{ transform: isExpanded ? "rotateY(180deg)" : "rotateY(0deg)" }}
                >
                  <article className="absolute inset-0 flex flex-col overflow-hidden rounded bg-white shadow-sm [backface-visibility:hidden] dark:bg-zinc-900">
                    <div className="food-media-frame h-36 shrink-0 sm:h-40">
                      <img src={image} alt={food.fname} className="food-media" />
                    </div>
                    <div className="flex min-h-0 flex-1 flex-col p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-xl font-normal leading-tight sm:text-2xl">{food.fname}</h3>
                          {priceLabel && (
                            <p className="mt-1 text-base font-semibold text-[#ee6e73] dark:text-[#f0a8ad]">{priceLabel}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          className="shrink-0 text-xl leading-none text-zinc-700 dark:text-zinc-300 transition hover:text-zinc-900 dark:hover:text-white"
                          onClick={() => setExpandedFood(id)}
                          aria-label={`Show ${food.fname} details`}
                        >
                          ⋮
                        </button>
                      </div>
                      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{summary}</p>
                      <button
                        type="button"
                        className="brand-btn mt-4 w-full shrink-0 rounded-sm px-4 py-2 text-[11px] font-semibold uppercase tracking-wide transition"
                        onClick={() => {
                          addItem(food);
                          setCartNotice(`"${food.fname}" added to cart!`);
                          window.setTimeout(() => setCartNotice(""), 2500);
                        }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </article>

                  <article className="absolute inset-0 flex flex-col rounded bg-white p-4 shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)] dark:bg-zinc-900">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-xl font-normal leading-tight">{food.fname}</h3>
                        {priceLabel && (
                          <p className="mt-1 text-base font-semibold text-[#ee6e73] dark:text-[#f0a8ad]">{priceLabel}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        className="shrink-0 text-lg text-zinc-600 dark:text-zinc-400 transition hover:text-zinc-900 dark:hover:text-white"
                        onClick={() => setExpandedFood(null)}
                        aria-label={`Close ${food.fname} details`}
                      >
                        ×
                      </button>
                    </div>
                    <p className="mt-3 flex-1 overflow-y-auto text-sm leading-6 text-zinc-600 dark:text-zinc-400">{details}</p>
                  </article>
                </div>
              </div>
            );
          })}
        </div>
        {visibleFoods.length === 0 && (
          <p className="mt-8 text-center text-sm text-zinc-600 dark:text-zinc-400">No foods found for this category.</p>
        )}
        {hasMoreFoods && <div ref={loadMoreSentinelRef} className="h-px w-full" aria-hidden="true" />}
        {hasMoreFoods && showLoadMore && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={handleLoadMore}
              className="brand-btn rounded-full px-8 py-3 text-sm font-semibold uppercase tracking-wide transition hover:-translate-y-0.5"
            >
              Load More...
            </button>
          </div>
        )}
      </section>

      <CartFab />
    </main>
  );
}
