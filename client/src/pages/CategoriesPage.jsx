import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data)).catch(() => setCategories([]));
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-8 text-center text-4xl font-bold">Categories</h1>
      {categories.length === 0 ? (
        <p className="rounded border border-zinc-300 bg-white p-4 text-center">
          Sorry no categories to display.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div key={category._id} className="rounded-xl border bg-white p-5 shadow-sm">
              <h3 className="text-xl font-semibold">{category.name}</h3>
              <p className="mt-2 text-sm text-zinc-600">
                This is a popular category of Bangladesh. Explore the Foods of this category!
              </p>
              <p className="mt-3 text-sm text-zinc-500">{category.longDesc}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
