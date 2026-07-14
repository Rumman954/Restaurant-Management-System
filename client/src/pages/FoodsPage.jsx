import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { MENU_FOODS, mergeMenuCategories } from "../data/menuCatalog";

export default function FoodsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [expandedFood, setExpandedFood] = useState(null);
  const [orderNotice, setOrderNotice] = useState("");
  const [showLoginWarning, setShowLoginWarning] = useState(false);
  const [apiCategories, setApiCategories] = useState([]);
  const [apiFoods, setApiFoods] = useState([]);

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

    const fromMenu = MENU_FOODS.filter((food) => !hidden.includes(food._id)).map((food) => {
      const keys = categoryKeysByName.get(
        String(
          menuCategories.find((c) => c.filterId === food.categoryId)?.name || food.categoryId
        )
          .trim()
          .toLowerCase()
      );
      return {
        ...food,
        image: imageOverrides[food._id] || food.image,
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
          categoryId: matched?.filterId || categoryMongoId,
          categoryKeys: Array.from(keys),
          source: "api",
        };
      });

    return [...fromMenu, ...fromApi];
  }, [apiFoods, categoryKeysByName, menuCategories]);

  const selectedCategory = searchParams.get("category") || "all";

  const visibleFoods =
    selectedCategory === "all"
      ? allFoods
      : allFoods.filter((food) => {
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

  const handleLoginWarningOk = () => {
    setShowLoginWarning(false);
    window.dispatchEvent(new Event("open-login-modal"));
  };

  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
        {orderNotice && (
          <p className="mb-8 rounded border border-zinc-700 bg-[#ee6e73] px-4 py-3 text-center text-sm font-semibold text-white dark:border-[#5a2a4a] dark:bg-[#421F37]">
            {orderNotice}
          </p>
        )}
        <h2 className="mb-8 text-center text-4xl font-medium text-zinc-800 dark:text-zinc-300 sm:text-5xl">Foods Area!</h2>
        <div className="mb-7 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              selectedCategory === "all" ? "brand-chip" : "bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
            onClick={() => setSearchParams({})}
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
                onClick={() => setSearchParams({ category: category.filterId })}
              >
                {category.name}
              </button>
            );
          })}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleFoods.map((food) => {
            const id = food._id ?? food.fname;
            const summary = food.description ?? "This is a popular Food of Bangladesh. Order Now to Grab a bite of it!";
            const details = food.details ?? summary;
            const image = food.image ?? "/images/Snacks.jpg";
            const isExpanded = expandedFood === id;

            return (
              <div key={id} className="h-[340px] [perspective:1000px]">
                <div
                  className="relative h-full w-full rounded border border-zinc-200 dark:border-zinc-700 transition-transform duration-700 [transform-style:preserve-3d]"
                  style={{ transform: isExpanded ? "rotateY(180deg)" : "rotateY(0deg)" }}
                >
                  <article className="absolute inset-0 overflow-hidden rounded bg-white shadow-sm [backface-visibility:hidden] dark:bg-zinc-900">
                    <div className="food-media-frame h-36 sm:h-40">
                      <img src={image} alt={food.fname} className="food-media" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-2xl font-normal sm:text-3xl">{food.fname}</h3>
                        <button
                          type="button"
                          className="text-xl leading-none text-zinc-700 dark:text-zinc-300 transition hover:text-zinc-900 dark:hover:text-white"
                          onClick={() => setExpandedFood(id)}
                          aria-label={`Show ${food.fname} details`}
                        >
                          ⋮
                        </button>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{summary}</p>
                      <button
                        type="button"
                        className="brand-btn mt-4 w-full rounded-sm px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition"
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

                  <article className="absolute inset-0 rounded bg-white dark:bg-zinc-900 p-4 shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-2xl font-normal">{food.fname}</h3>
                      <button
                        type="button"
                        className="text-lg text-zinc-600 dark:text-zinc-400 transition hover:text-zinc-900 dark:hover:text-white"
                        onClick={() => setExpandedFood(null)}
                        aria-label={`Close ${food.fname} details`}
                      >
                        ×
                      </button>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{details}</p>
                  </article>
                </div>
              </div>
            );
          })}
        </div>
        {visibleFoods.length === 0 && (
          <p className="mt-8 text-center text-sm text-zinc-600 dark:text-zinc-400">No foods found for this category.</p>
        )}
      </section>

      {showLoginWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-md rounded bg-white dark:bg-zinc-900 p-6 shadow-xl">
            <p className="text-center text-base text-zinc-800 dark:text-zinc-300">For place order please login your account</p>
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                className="brand-btn rounded-sm px-5 py-2 text-sm font-semibold uppercase tracking-wide transition"
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
