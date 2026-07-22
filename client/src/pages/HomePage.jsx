import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { mergeMenuCategories } from "../data/menuCatalog";

export default function HomePage() {
  const navigate = useNavigate();
  const slides = [
    {
      image: "/images/Snacks.jpg",
      title: "Resturant - The Quality Food!",
      subtitle: "We deliver quality. Try us and then buy us!",
    },
    {
      image: "/images/banner1.jpg",
      title: "Quality Food at Your Door!",
      subtitle: "We deliver Quality And We're doing this for years!",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [apiCategories, setApiCategories] = useState([]);
  const touchStartX = useRef(null);

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

  const featuredCategories = useMemo(() => {
    const all = mergeMenuCategories(apiCategories);
    return all.slice(0, 3).map((category) => ({
      id: category.filterId,
      title: category.name,
      image: category.image,
      details: category.longDesc || category.shortDesc || "Browse delicious foods in this category!",
    }));
  }, [apiCategories]);

  const galleryImages = [
    "/images/Italian.jpg",
    "/images/Chinese.jpg",
    "/images/Snacks.jpg",
    "/images/Thai.jpg",
    "/images/Bangldeshi.jpg",
  ];

  const reviews = [
    {
      name: "Ayesha Rahman",
      text: "The Bangladeshi dishes taste just like home cooking. Ordering online was quick and my delivery arrived hot!",
    },
    {
      name: "James Carter",
      text: "Loved the Chinese noodles and clear menu categories. Easy cart checkout and friendly service.",
    },
    {
      name: "Nusrat Jahan",
      text: "Great variety — from snacks to Thai curry. The pickup option saved me time on a busy day.",
    },
    {
      name: "Farhan Ahmed",
      text: "Fresh food, fair prices, and smooth online payment. This is my go-to place for weekend meals.",
    },
    {
      name: "Sara Khan",
      text: "The Italian pasta and desserts were excellent. I appreciate being able to track my order status.",
    },
    {
      name: "Rafiul Islam",
      text: "Snacks and tea are perfect for evening cravings. Adding items to the cart is simple and fast.",
    },
    {
      name: "Maya Chowdhury",
      text: "Clean UI, tasty menu, and reliable delivery. Highly recommended for family orders!",
    },
  ];

  const showNextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const showPrevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      showNextSlide();
    }, 3500);

    return () => clearInterval(timer);
  }, [showNextSlide]);

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) {
      return;
    }

    const touchEndX = event.changedTouches[0].clientX;
    const deltaX = touchStartX.current - touchEndX;
    const minSwipeDistance = 45;

    if (deltaX > minSwipeDistance) {
      showNextSlide();
    } else if (deltaX < -minSwipeDistance) {
      showPrevSlide();
    }

    touchStartX.current = null;
  };

  useEffect(() => {
    const reviewTimer = setInterval(() => {
      setReviewIndex((prev) => (prev + 1) % reviews.length);
    }, 2800);

    return () => clearInterval(reviewTimer);
  }, [reviews.length]);

  useEffect(() => {
    const galleryTimer = setInterval(() => {
      setGalleryIndex((prev) => (prev + 1) % galleryImages.length);
    }, 2500);

    return () => clearInterval(galleryTimer);
  }, [galleryImages.length]);

  return (
    <>
      <section
        className="relative h-[270px] overflow-hidden bg-[#ececec] dark:bg-zinc-900 sm:h-[350px] md:h-[410px]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={showNextSlide}
      >
        {slides.map((slide, index) => (
          <img
            key={slide.image}
            src={slide.image}
            alt={slide.title}
            className={`food-media absolute inset-0 transition-all duration-1000 ${
              index === activeIndex ? "scale-100 opacity-100" : "scale-105 opacity-0"
            }`}
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/50 dark:from-black/60 dark:via-black/40 dark:to-black/70" />

        <div className="absolute inset-x-0 top-[18%] flex justify-center px-4 text-center sm:top-[24%]">
          <div className="w-full max-w-2xl px-3 py-3 text-white drop-shadow-sm sm:px-8 sm:py-5">
          <h1
            key={`title-${activeIndex}`}
            className="old-slider-title mb-1 animate-[fadeIn_0.7s_ease] font-medium leading-tight tracking-tight"
          >
            {slides[activeIndex].title}
          </h1>
          <p
            key={`subtitle-${activeIndex}`}
            className="old-slider-subtitle animate-[fadeIn_0.9s_ease] font-normal leading-snug text-white/95"
          >
            {slides[activeIndex].subtitle}
          </p>
          </div>
        </div>

      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 pt-10 sm:pb-16 sm:pt-12">
        <h2 className="old-h2 mb-10 px-5 pb-[20px] pt-5 text-center text-zinc-800 dark:text-zinc-300">
          Resturant Powered By Students
        </h2>
        <div className="grid items-end gap-6 md:grid-cols-[1.7fr_1fr] md:gap-8">
          <p className="mx-auto max-w-[700px] text-center text-[14px] leading-7 text-zinc-600 dark:text-zinc-400 md:text-left">
            Resturant is an online food ordering and restaurant management system designed for everyday customers and
            kitchen staff. Guests can explore food categories such as Bangladeshi, Chinese, Italian, Thai, and Snacks,
            view item details and prices, and add their favourite dishes to the cart in a few clicks. When checkout is
            ready, customers choose pickup or home delivery, confirm their address if needed, and place the order with
            Cash on Delivery or secure online payment. Behind the scenes, the admin dashboard helps manage foods,
            categories, users, and order flow, while employees confirm new orders, prepare pending meals, and mark
            them delivered. Menu availability can be updated so unavailable items are clearly shown and cannot be
            ordered by mistake. From browsing dishes to receiving food at the door, Resturant keeps ordering simple for
            guests and keeps restaurant operations organised for the team — all in one modern web platform.
          </p>
          <img
            src="/images/cooking-6668437_1280.png"
            alt="Cooking illustration"
            className="food-illustration mx-auto h-[240px] w-[260px] object-contain sm:h-[300px] sm:w-[329px] md:mr-8"
          />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-4 pb-2 sm:px-8 md:grid-cols-3 md:gap-6">
        {featuredCategories.map((item) => (
          <div
            key={item.id}
            className="cursor-pointer px-1 py-6 sm:py-10"
            onClick={() => navigate(`/foods?category=${item.id}`)}
          >
            <div className="group h-[350px] sm:h-[380px] [perspective:1000px]">
              <div
                className="relative h-full w-full rounded-lg transition-transform duration-700 [transform-style:preserve-3d]"
                style={{
                  transform: expandedCategory === item.id ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                <article className="absolute inset-0 overflow-hidden rounded-lg bg-white p-0 shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl [backface-visibility:hidden] dark:bg-zinc-900">
                  <div className="food-media-frame h-48 sm:h-56">
                    <img src={item.image} alt={item.title} className="food-media transition duration-500 group-hover:scale-[1.03]" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-xl font-semibold dark:text-zinc-300">{item.title}</h3>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setExpandedCategory(item.id);
                        }}
                        className="text-xl leading-none text-zinc-700 dark:text-zinc-300 transition hover:text-zinc-900 dark:hover:text-white"
                        aria-label={`Show ${item.title} details`}
                      >
                        ⋮
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                      Discover tasty dishes in this category. Tap to browse the full menu and order your favourites!
                    </p>
                  </div>
                </article>

                <article className="absolute inset-0 flex h-full flex-col rounded-lg bg-white dark:bg-zinc-900 p-4 shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-semibold dark:text-zinc-300">{item.title}</h3>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setExpandedCategory(null);
                      }}
                      className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 transition hover:text-zinc-900 dark:hover:text-white"
                      aria-label={`Close ${item.title} details`}
                    >
                      ×
                    </button>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">{item.details}</p>
                </article>
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="mb-8 mt-2 text-center sm:mt-1">
        <Link
          to="/food-categories"
          className="brand-btn rounded-md px-5 py-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          More Categories »
        </Link>
      </div>

      <section className="mx-auto mb-12 max-w-6xl px-4">
        <div
          className="food-media-frame relative h-56 rounded-xl shadow-md sm:h-72 md:h-80"
          onClick={() => setGalleryIndex((prev) => (prev + 1) % galleryImages.length)}
        >
          {galleryImages.map((image, index) => (
            <img
              key={`${image}-${index}`}
              src={image}
              alt="Food gallery"
              className={`food-media absolute inset-0 transition-all duration-700 ${
                galleryIndex === index ? "scale-100 opacity-100" : "scale-105 opacity-0"
              }`}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 text-center">
        <h2 className="mb-4 text-3xl font-semibold sm:text-4xl">ABOUT US</h2>
        <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-400">
          We bring authentic flavours from Bangladeshi kitchens, Chinese woks, Italian ovens, Thai spices, and everyday
          snacks into one easy ordering experience. Whether you want a quick snack, a family dinner, or a special meal
          delivered to your door, Resturant helps you order online while our team manages the menu and fulfills every
          order with care.
        </p>
        <Link
          to="/about"
          className="brand-btn mt-6 inline-block rounded-md px-5 py-2.5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          Read More »
        </Link>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-10 sm:px-8 sm:py-14 md:grid-cols-3 md:gap-6">
        {[
          {
            icon: "local_dining",
            title: "Variety of Dishes",
            desc: "Bangladeshi, Chinese, Italian, Thai, and snacks in one menu.",
          },
          {
            icon: "local_shipping",
            title: "Fast Delivery",
            desc: "Order for home delivery or pickup — track every step.",
          },
          {
            icon: "mood",
            title: "Quality Food",
            desc: "Freshly prepared meals with clear prices and easy checkout.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-lg bg-white dark:bg-zinc-900 px-8 py-10 text-center shadow-sm sm:px-[50px] sm:py-[50px]">
            <span className="material-icons text-6xl">{item.icon}</span>
            <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{item.desc}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10 pt-4 text-center">
        <h3 className="mb-10 text-4xl font-medium text-zinc-800 dark:text-zinc-300 sm:mb-12 sm:text-5xl">What Our Customers Say</h3>
        <div
          className="relative mx-auto h-[300px] max-w-5xl overflow-hidden"
          onClick={() => setReviewIndex((prev) => (prev + 1) % reviews.length)}
        >
          {reviews.map((review, index) => {
            const rawOffset = index - reviewIndex;
            const wrappedOffset =
              rawOffset > reviews.length / 2
                ? rawOffset - reviews.length
                : rawOffset < -reviews.length / 2
                  ? rawOffset + reviews.length
                  : rawOffset;

            if (Math.abs(wrappedOffset) > 3) {
              return null;
            }

            const isCenter = wrappedOffset === 0;
            const absOffset = Math.abs(wrappedOffset);
            const baseOffset = absOffset === 1 ? 138 : absOffset === 2 ? 215 : 280;
            const xOffset = wrappedOffset === 0 ? 0 : wrappedOffset < 0 ? -baseOffset : baseOffset;
            const scale = isCenter ? 1 : absOffset === 1 ? 0.9 : absOffset === 2 ? 0.82 : 0.75;
            const opacity = isCenter ? 1 : absOffset === 1 ? 0.72 : absOffset === 2 ? 0.45 : 0.18;
            const zIndex = isCenter ? 30 : absOffset === 1 ? 20 : absOffset === 2 ? 14 : 10;

            return (
              <article
                key={`${review.name}-${index}`}
                className="brand-review absolute left-1/2 top-1/2 h-[220px] w-[160px] rounded-sm p-3 shadow-md transition-all duration-700 sm:h-[245px] sm:w-[190px] sm:p-4"
                style={{
                  transform: `translate(-50%, -50%) translateX(${xOffset}px) scale(${scale})`,
                  opacity,
                  zIndex,
                }}
              >
                <p className="text-[11px] font-semibold leading-6 text-white/95 sm:text-[13px] sm:leading-7">"{review.text}"</p>
                <p className={`mt-2 text-sm font-semibold text-white sm:mt-3 sm:text-base ${isCenter ? "opacity-100" : "opacity-90"}`}>{review.name}</p>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
