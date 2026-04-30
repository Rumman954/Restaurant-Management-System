import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
  const slides = [
    {
      image: "/images/banner3.jpg",
      title: "Resturant - The Quality Food!",
      subtitle: "We deliver quality. Try us and then buy us!",
    },
    {
      image: "/images/banner4.jpg",
      title: "Quality Food at Your Door!",
      subtitle: "We deliver quality and we've been doing this for years!",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [reviewIndex, setReviewIndex] = useState(0);

  const featuredCategories = [
    { title: "Italian", image: "/images/banner1.jpg" },
    { title: "Chinese", image: "/images/banner2.jpg" },
    { title: "Snacks", image: "/images/banner4.jpg" },
  ];

  const galleryImages = ["/images/banner4.jpg", "/images/banner3.jpg", "/images/banner2.jpg", "/images/banner1.jpg"];

  const reviews = [
    { name: "John", text: "The food of this resturant is just like heaven for me! I keep coming every weekend." },
    { name: "James", text: "Amazing service and quality. Their delivery and taste are both excellent." },
    { name: "Diana", text: "Very tasty and fresh. This is one of the best places to order from." },
    { name: "Farhan Ahmed", text: "Beautiful presentation, quick delivery, and top-notch flavor." },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    const reviewTimer = setInterval(() => {
      setReviewIndex((prev) => (prev + 1) % reviews.length);
    }, 2800);

    return () => clearInterval(reviewTimer);
  }, [reviews.length]);

  return (
    <>
      <section className="relative h-[360px] overflow-hidden bg-black">
        {slides.map((slide, index) => (
          <img
            key={slide.image}
            src={slide.image}
            alt={slide.title}
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ${
              index === activeIndex ? "scale-100 opacity-100" : "scale-105 opacity-0"
            }`}
          />
        ))}

        <div className="absolute inset-0 bg-black/28" />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white">
          <h1
            key={`title-${activeIndex}`}
            className="mb-3 animate-[fadeIn_0.7s_ease] text-4xl font-bold md:text-5xl"
          >
            {slides[activeIndex].title}
          </h1>
          <p key={`subtitle-${activeIndex}`} className="animate-[fadeIn_0.9s_ease] text-lg md:text-xl">
            {slides[activeIndex].subtitle}
          </p>
        </div>

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((_, index) => (
            <button
              key={`dot-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 w-2.5 rounded-full transition ${
                index === activeIndex ? "bg-[#ee6e73]" : "bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="mb-10 text-center text-5xl font-light text-zinc-800">Resturant Powered By Students</h2>
        <div className="grid items-center gap-10 md:grid-cols-[1.7fr_1fr]">
          <p className="text-center text-sm leading-7 text-zinc-600 md:text-left">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quibusdam ea molestiae, ipsa, tenetur itaque
            dicta libero delectus incidunt fuga repudiandae est rerum expedita quia debitis quam illo vero
            laboriosam numquam eius molestias. Quas reprehenderit voluptatem nemo, fugiat modi atque illo earum ea
            tenetur sed ipsam repellat minus quibusdam doloremque aliquid odio dolorum reiciendis quisquam eum nobis.
            Laboriosam officia aut, laudantium tempora, voluptates doloremque, quia, reiciendis voluptas voluptatum
            recusandae ipsam. Illo aliquid possimus porro reiciendis eveniet consectetur eligendi amet.
          </p>
          <img src="/images/cooking-6668437_1280.png" alt="Cooking illustration" className="mx-auto h-72 object-contain" />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-10 md:grid-cols-3">
        {featuredCategories.map((item) => (
          <article key={item.title} className="overflow-hidden rounded-lg border bg-white shadow-sm">
            <img src={item.image} alt={item.title} className="h-56 w-full object-cover" />
            <div className="p-4">
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-zinc-600">
              Wanna check out the mouth-watering foods of this category? Explore now!
            </p>
            </div>
          </article>
        ))}
      </section>

      <div className="my-10 text-center">
        <Link to="/food-categories" className="rounded-md bg-[#ee6e73] px-5 py-3 text-white shadow-sm">
          More Foods »
        </Link>
      </div>

      <section className="mx-auto mb-12 max-w-6xl px-4">
        <div className="grid gap-5 md:grid-cols-4">
          {galleryImages.map((image) => (
            <img
              key={image}
              src={image}
              alt="Food gallery"
              className="h-44 w-full rounded-md object-cover transition duration-300 hover:scale-[1.02]"
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 text-center">
        <h2 className="mb-4 text-4xl font-semibold">ABOUT US</h2>
        <p className="text-sm leading-7 text-zinc-600">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Laboriosam optio deserunt labore impedit maiores
          non consequuntur fugiat, nostrum animi dolor illum, distinctio veniam dicta, reiciendis voluptatum voluptas
          modi ad sequi assumenda.
        </p>
        <Link to="/about" className="mt-6 inline-block rounded-md bg-[#ee6e73] px-5 py-2.5 text-white">
          Read More »
        </Link>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-14 md:grid-cols-3">
        {[
          { icon: "🍽️", title: "Variety of Dishes" },
          { icon: "🚚", title: "Free Delivery" },
          { icon: "😊", title: "Excellent Quality" },
        ].map((item) => (
          <div key={item.title} className="rounded-lg bg-white p-10 text-center shadow-sm">
            <div className="text-5xl">{item.icon}</div>
            <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-8 text-center">
        <h3 className="mb-8 text-4xl font-semibold">What Our Customers Say</h3>
        <div className="rounded-xl bg-[#ee6e73] p-7 text-white shadow-md">
          <p key={`review-${reviewIndex}`} className="animate-[fadeIn_0.6s_ease] text-lg leading-8">
            "{reviews[reviewIndex].text}"
          </p>
          <p className="mt-3 text-sm font-semibold">- {reviews[reviewIndex].name}</p>
        </div>
        <div className="mt-4 flex justify-center gap-2">
          {reviews.map((_, index) => (
            <button
              key={`review-dot-${index}`}
              type="button"
              onClick={() => setReviewIndex(index)}
              className={`h-2.5 w-2.5 rounded-full ${reviewIndex === index ? "bg-[#ee6e73]" : "bg-zinc-300"}`}
              aria-label={`Go to review ${index + 1}`}
            />
          ))}
        </div>
      </section>
    </>
  );
}
