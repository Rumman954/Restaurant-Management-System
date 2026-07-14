import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { mergeMenuCategories } from "../data/menuCatalog";

export default function CategoriesPage() {
  const navigate = useNavigate();
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [apiCategories, setApiCategories] = useState([]);

  useEffect(() => {
    let active = true;
    api
      .get("/categories")
      .then((res) => {
        if (active) setApiCategories(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        if (active) setApiCategories([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => mergeMenuCategories(apiCategories), [apiCategories]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
      <h1 className="mb-8 text-center text-4xl font-medium text-zinc-800 dark:text-zinc-300 sm:text-5xl">Categories</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const id = category.filterId;
          const summary = category.longDesc || category.shortDesc;
          const image = category.image;
          const isExpanded = expandedCategory === id;

          return (
            <div
              key={id}
              className="group h-[280px] w-full cursor-pointer perspective-[1000px] transition-transform duration-300 hover:-translate-y-1"
              onClick={() => navigate(`/foods?category=${id}`)}
            >
              <div
                className="relative h-full w-full rounded border border-zinc-200 dark:border-zinc-700 transition-transform duration-700 group-hover:shadow-lg transform-3d"
                style={{ transform: isExpanded ? "rotateY(180deg)" : "rotateY(0deg)" }}
              >
                <article className="absolute inset-0 overflow-hidden rounded bg-white shadow-sm backface-hidden dark:bg-zinc-900">
                  <div className="food-media-frame h-36 sm:h-40">
                    <img
                      src={image}
                      alt={category.name}
                      className="food-media transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-2xl font-normal sm:text-3xl">{category.name}</h3>
                      <button
                        type="button"
                        className="text-xl leading-none text-zinc-700 dark:text-zinc-300 transition hover:text-zinc-900 dark:hover:text-white"
                        onClick={(event) => {
                          event.stopPropagation();
                          setExpandedCategory(id);
                        }}
                        aria-label={`Show ${category.name} details`}
                      >
                        ⋮
                      </button>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{summary}</p>
                  </div>
                </article>

                <article className="absolute inset-0 flex h-full flex-col rounded bg-white dark:bg-zinc-900 p-4 shadow-sm backface-hidden transform-[rotateY(180deg)]">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-2xl font-normal sm:text-3xl">{category.name}</h3>
                    <button
                      type="button"
                      className="text-lg text-zinc-600 dark:text-zinc-400 transition hover:text-zinc-900 dark:hover:text-white"
                      onClick={(event) => {
                        event.stopPropagation();
                        setExpandedCategory(null);
                      }}
                      aria-label={`Close ${category.name} details`}
                    >
                      ×
                    </button>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{summary}</p>
                </article>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
