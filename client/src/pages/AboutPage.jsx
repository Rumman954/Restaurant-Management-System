export default function AboutPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="text-center">
        <h1 className="mb-4 text-5xl font-medium text-zinc-800 dark:text-zinc-300">ABOUT US</h1>
        <p className="mx-auto max-w-5xl text-sm leading-7 text-zinc-700 dark:text-zinc-300">
          Welcome to Resturant, where great food, warm hospitality, and convenient online ordering come together.
          Established in 2022, our restaurant began with a simple dream — to serve freshly prepared meals that bring
          comfort, flavour, and joy to every table, whether for family dinners, friendly gatherings, or a quiet meal at
          home. From the beginning, we focused on quality ingredients, careful cooking, and a welcoming guest
          experience. Today, Resturant offers a rich mix of cuisines, including authentic Bangladeshi classics,
          aromatic Chinese favourites, beloved Italian dishes, flavourful Thai specialties, and light snacks for any
          time of day. Guests can explore our menu online, choose their favourite dishes, add items to the cart, and
          place orders for home delivery or restaurant pickup. After an order is placed, our kitchen team prepares each
          meal with care, and our service team confirms, prepares, and completes delivery or pickup so food arrives
          hot, fresh, and on time. We support easy payment options such as Cash on Delivery and secure online payment,
          making ordering simple and reliable. Resturant funds its daily operations through customer food orders and
          meal sales. The income from every order helps cover fresh ingredients, kitchen supplies, staff service, and
          continuous improvement of our menu and guest experience. As a student-powered restaurant, we also reinvest
          part of our earnings into better hospitality service, cleaner kitchen standards, and creating practical
          learning opportunities for young team members. We believe good food should taste excellent and feel
          trustworthy — from the first browse of our menu to the moment your order reaches your door. Come hungry, stay
          happy, and let us make your next meal memorable.
        </p>
      </section>

      <section className="pt-16">
        <h2 className="old-h2 mb-10 px-5 text-center text-zinc-800 dark:text-zinc-300">
          Resturant Powered By Students
        </h2>
        <div className="grid items-end gap-8 md:grid-cols-[1.7fr_1fr]">
          <p className="mx-auto max-w-[700px] text-center text-[14px] leading-7 text-zinc-600 dark:text-zinc-400 md:text-left">
            Resturant is proudly powered by students who love food, creativity, and better hospitality experiences.
            With fresh ideas and strong dedication, our team works to bring traditional flavours and modern ordering
            together so every guest can enjoy quality meals with ease. We carefully organise our menu into popular
            categories such as Bangladeshi, Chinese, Italian, Thai, and Snacks, making it simple to discover dishes for
            family dinners, quick bites, celebrations, or everyday cravings. From the kitchen to delivery and pickup,
            we focus on taste, cleanliness, friendly service, and timely preparation. Our student-driven spirit means
            we listen, improve, and care about each order — because great food should feel welcoming, reliable, and
            memorable. We value honest ingredients, careful cooking, and a warm guest experience that feels personal
            every time. At Resturant, we believe hospitality grows when passion meets purpose, and every meal we serve
            is a chance to make someone smile and come back again.
          </p>
          <img
            src="/images/cooking-6668437_1280.png"
            alt="Cooking illustration"
            className="food-illustration mx-auto h-[300px] w-[329px] object-contain md:mr-8"
          />
        </div>
      </section>

      <section className="pt-16 text-center">
        <h2 className="mb-6 text-3xl font-semibold text-zinc-800 dark:text-zinc-300 sm:text-4xl">Our Services</h2>
        <p className="mx-auto mb-8 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
          From online menu browsing and easy cart checkout to home delivery, restaurant pickup, and secure payment
          options, Resturant offers complete dining services designed for comfort, speed, and great taste. Guests can
          explore food categories, view dishes with clear prices, place orders in minutes, and enjoy freshly prepared
          meals without long waiting. Our kitchen and service team handle every order carefully — from confirmation to
          preparation and final delivery or pickup — so your food arrives hot, accurate, and satisfying. Whether you
          want a quick snack, a family dinner, or a special weekend meal, our services are built to make ordering
          simple and dining enjoyable every time.
        </p>
        <img
          src="/images/Our services.jpg"
          alt="Our Services"
          className="mx-auto h-auto max-h-[420px] w-full max-w-3xl rounded-xl object-cover shadow-md"
        />
      </section>

      <section className="grid items-center gap-8 pt-16 md:grid-cols-2 md:gap-10">
        <div className="text-center md:text-left">
          <h2 className="mb-4 text-3xl font-semibold text-zinc-800 dark:text-zinc-300">Our Kitchen Promise</h2>
          <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-400">
            Our promise is to serve fresh and tasty food. Every dish on our menu is prepared with quality ingredients,
            balanced spices, and careful attention to presentation. We take pride in offering a wide selection — from
            comforting Bangladeshi meals to Chinese, Italian, and Thai favourites, plus snacks and drinks for lighter
            moments. Our team focuses on taste, hygiene, and timely service so you can enjoy restaurant-quality food at
            home or collect your order with ease. At Resturant, good food is not just a meal — it is an experience we
            prepare for you every day.
          </p>
        </div>
        <img
          src="/images/Mission.webp"
          alt="Our Kitchen Promise"
          className="mx-auto h-auto max-h-[360px] w-full max-w-md rounded-xl object-cover shadow-md md:ml-auto"
        />
      </section>

      <section className="grid items-center gap-8 pt-16 md:grid-cols-2 md:gap-10">
        <img
          src="/images/Vision.jpg"
          alt="Our Dining Dream"
          className="mx-auto h-auto max-h-[360px] w-full max-w-md rounded-xl object-cover shadow-md md:order-1 md:mr-auto"
        />
        <div className="text-center md:order-2 md:text-left">
          <h2 className="mb-4 text-3xl font-semibold text-zinc-800 dark:text-zinc-300">Our Dining Dream</h2>
          <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-400">
            Our dream is to become a trusted restaurant where every guest enjoys delicious food with comfort and care.
            We aim to bring people together through a wide variety of dishes — from Bangladeshi favourites to Chinese,
            Italian, Thai, and snacks — with fair prices, simple online ordering, and timely delivery or pickup. Every
            day, we work to make dining convenient, satisfying, and memorable for every guest.
          </p>
        </div>
      </section>
    </main>
  );
}
