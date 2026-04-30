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
      subtitle: "We deliver Quality And We're doing this for years!",
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
    { name: "John", text: "The food of this resturant is just like heaven for me! Its so delicious and tasty that I can't help going there every weekend!" },
    { name: "James", text: "The food of this resturant is just like heaven for me! Its so delicious and tasty that I can't help going there every weekend!" },
    { name: "Rolex", text: "The food of this resturant is just like heaven for me! Its so delicious and tasty that I can't help going there every weekend!" },
    { name: "Farhan Ahmed", text: "The food of this resturant is just like heaven for me! Its so delicious and tasty that I can't help going there every weekend!" },
    { name: "Bappy Khan", text: "The food of this resturant is just like heaven for me! Its so delicious and tasty that I can't help going there every weekend!" },
    { name: "Diana", text: "The food of this resturant is just like heaven for me! Its so delicious and tasty that I can't help going there every weekend!" },
    { name: "Doe", text: "The food of this resturant is just like heaven for me! Its so delicious and tasty that I can't help going there every weekend!" },
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
      <section className="relative h-[286px] overflow-hidden bg-[#ececec]">
        {slides.map((slide, index) => (
          <img
            key={slide.image}
            src={slide.image}
            alt={slide.title}
            className={`absolute inset-x-0 top-0 h-[248px] w-full object-cover object-center transition-all duration-1000 ${
              index === activeIndex ? "scale-100 opacity-100" : "scale-105 opacity-0"
            }`}
          />
        ))}

        <div className="absolute inset-x-0 top-0 h-[248px] bg-white/30" />

        <div className="absolute inset-x-0 top-0 flex h-[248px] flex-col items-center justify-center px-4 pt-1 text-center text-black">
          <h1
            key={`title-${activeIndex}`}
            className="old-slider-title mb-1 animate-[fadeIn_0.7s_ease] font-bold leading-tight tracking-tight"
          >
            {slides[activeIndex].title}
          </h1>
          <p
            key={`subtitle-${activeIndex}`}
            className="old-slider-subtitle animate-[fadeIn_0.9s_ease] leading-tight"
          >
            {slides[activeIndex].subtitle}
          </p>
        </div>

        <div className="absolute inset-x-0 top-[248px] flex h-[38px] items-center justify-center gap-3 bg-[#e9e9e9]">
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

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-14">
        <h2 className="old-h2 mb-14 px-5 pb-[30px] pt-5 text-center text-zinc-800">
          Resturant Powered By Students
        </h2>
        <div className="grid items-end gap-8 md:grid-cols-[1.7fr_1fr]">
          <p className="mx-auto max-w-[700px] text-center text-[14px] leading-8 text-zinc-600 md:text-left">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quibusdam ea molestiae, ipsa, tenetur itaque
            dicta libero delectus incidunt fuga repudiandae est rerum expedita quia debitis quam illo vero laboriosam
            numquam eius molestias. Quas reprehenderit voluptatem nemo, fugiat modi atque illo earum ea tenetur sed
            ipsam repellat minus quibusdam doloremque aliquid odio.
          </p>
          <img
            src="/images/cooking-6668437_1280.png"
            alt="Cooking illustration"
            className="mx-auto h-[230px] object-contain md:mr-8"
          />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-[50px] pb-10 md:grid-cols-3">
        {featuredCategories.map((item) => (
          <div key={item.title} style={{ padding: "50px 5px" }}>
            <article className="overflow-hidden rounded-lg border bg-white p-0 shadow-sm">
              <img src={item.image} alt={item.title} className="h-56 w-full object-cover" />
              <div className="p-4">
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-zinc-600">Wanna check out the Mouth-Watering Foods of this category ? Explore Now!</p>
              </div>
            </article>
          </div>
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

      <section className="mx-auto grid max-w-6xl gap-6 px-[50px] py-14 md:grid-cols-3">
        {[
          { icon: "local_dining", title: "Variety of Dishes" },
          { icon: "local_shipping", title: "Free Delivery" },
          { icon: "mood", title: "Excellent Quality" },
        ].map((item) => (
          <div key={item.title} className="rounded-lg bg-white text-center shadow-sm" style={{ padding: "50px 50px" }}>
            <span className="material-icons text-6xl">{item.icon}</span>
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
