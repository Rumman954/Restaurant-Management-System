import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function FoodsPage() {
  const [foods, setFoods] = useState([]);

  useEffect(() => {
    api.get("/foods").then((res) => setFoods(res.data)).catch(() => setFoods([]));
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-8 text-center text-4xl font-bold">Foods Area!</h1>
      {foods.length === 0 ? (
        <p className="rounded border border-zinc-300 bg-white p-4 text-center">
          Sorry no foods to display.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {foods.map((food) => (
            <div key={food._id} className="rounded-xl border bg-white p-5 shadow-sm">
              <h3 className="text-xl font-semibold">{food.fname}</h3>
              <p className="mt-2 text-sm text-zinc-600">{food.description}</p>
              <button className="mt-4 rounded-md bg-[#ee6e73] px-4 py-2 text-sm text-white">
                Order Now
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
