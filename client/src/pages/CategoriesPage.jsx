import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);

  const fallbackCategories = [
    {
      _id: "italian",
      name: "Italian",
      image: "/images/Italian.jpg",
      longDesc: "This is a popular category of Bangladesh. Explore the Foods of this category!",
    },
    {
      _id: "chinese",
      name: "Chinese",
      image: "/images/Chinese.jpg",
      longDesc: "This is a popular category of Bangladesh. Explore the Foods of this category!",
    },
    {
      _id: "snacks",
      name: "Snacks",
      image: "/images/Snacks.jpg",
      longDesc: "This is a popular category of Bangladesh. Explore the Foods of this category!",
    },
    {
      _id: "bangladeshi",
      name: "Bangladeshi",
      image: "/images/Bangldeshi.jpg",
      longDesc: "This is a popular category of Bangladesh. Explore the Foods of this category!",
    },
    {
      _id: "thai",
      name: "Thai",
      image: "/images/Thai.jpg",
      longDesc: "This is a popular category of Bangladesh. Explore the Foods of this category!",
    },
  ];

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data)).catch(() => setCategories([]));
  }, []);

  const displayedCategories = categories.length > 0 ? categories : fallbackCategories;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
      <h1 className="mb-8 text-center text-4xl font-medium text-zinc-800 sm:text-5xl">Categories</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {displayedCategories.map((category) => {
          const id = category._id ?? category.name;
          const summary = category.longDesc ?? "This is a popular category of Bangladesh. Explore the Foods of this category!";
          const image = category.image ?? "/images/Snacks.jpg";
          const isExpanded = expandedCategory === id;

          return (
            <article key={id} className="overflow-hidden rounded border border-zinc-200 bg-white shadow-sm">
              {isExpanded ? (
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-2xl font-normal sm:text-3xl">{category.name}</h3>
                    <button
                      type="button"
                      className="text-lg text-zinc-600 transition hover:text-zinc-900"
                      onClick={() => setExpandedCategory(null)}
                      aria-label={`Close ${category.name} details`}
                    >
                      ×
                    </button>
                  </div>
                  <p className="mt-3 text-sm text-zinc-600">{summary}</p>
                </div>
              ) : (
                <>
                  <img src={image} alt={category.name} className="h-32 w-full object-cover sm:h-36" />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-2xl font-normal sm:text-3xl">{category.name}</h3>
                      <button
                        type="button"
                        className="text-xl leading-none text-zinc-700 transition hover:text-zinc-900"
                        onClick={() => setExpandedCategory(id)}
                        aria-label={`Show ${category.name} details`}
                      >
                        ⋮
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-zinc-600">{summary}</p>
                  </div>
                </>
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
}
