import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function FoodsPage() {
  const [foods, setFoods] = useState([]);
  const [expandedFood, setExpandedFood] = useState(null);

  const fallbackFoods = [
    {
      _id: "egg-role",
      fname: "Egg Role",
      image: "/images/Egg roll.JPG",
      description: "This is a popular Food of Bangladesh. Order Now to Grab a bite of it!",
      details:
        "a savory, fried appetizer consisting of a cylindrical casing, typically made from wheat flour, filled with a mixture of ingredients, often including shredded cabbage, chopped meat (such as pork), and other vegetables.",
    },
    {
      _id: "chowmin",
      fname: "Chowmin",
      image: "/images/Chowmin.jpg",
      description: "This is a popular Food of Bangladesh. Order Now to Grab a bite of it!",
      details:
        "Chow mein is a popular Chinese style noodle dish, characterized by stir-fried noodles with vegetables and sometimes meat or tofu.",
    },
    {
      _id: "french-fries",
      fname: "French Fries",
      image: "/images/French Fries.jpg",
      description: "This is a popular Food of Bangladesh. Order Now to Grab a bite of it!",
      details: "This is a Snacks Food. Everybody likes it so damn very much with Tea or Coffee.",
    },
    {
      _id: "momos",
      fname: "Momos",
      image: "/images/Momos.jpeg",
      description: "This is a popular Food of Bangladesh. Order Now to Grab a bite of it!",
      details:
        "Momos are steamed or fried dumplings, originally from Tibet and Nepal popular in the Himalayan region and now enjoyed worldwide.",
    },
  ];

  useEffect(() => {
    api.get("/foods").then((res) => setFoods(res.data)).catch(() => setFoods([]));
  }, []);

  const displayedFoods = foods.length > 0 ? foods : fallbackFoods;

  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
        <h2 className="mb-8 text-center text-4xl font-medium text-zinc-800 sm:text-5xl">Foods Area!</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayedFoods.map((food) => {
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
                      <button className="mt-4 w-full rounded-sm bg-[#ee6e73] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white transition hover:bg-[#e35f66]">
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
      </section>
    </main>
  );
}
