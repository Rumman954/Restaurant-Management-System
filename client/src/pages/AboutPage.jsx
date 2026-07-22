export default function AboutPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="text-center">
        <h1 className="mb-4 text-5xl font-medium text-zinc-800 dark:text-zinc-300">ABOUT US</h1>
        <p className="mx-auto max-w-5xl text-sm leading-7 text-zinc-700 dark:text-zinc-300">
          Welcome to Resturant — a complete online restaurant management platform built for customers and kitchen
          staff. Browse popular food categories like Bangladeshi, Chinese, Italian, Thai, and Snacks, add your
          favourite dishes to the cart, and place orders for home delivery or pickup. Customers can pay with Cash on
          Delivery or secure online payment, while admins and employees manage menu items, track new orders, update
          availability, and keep every order moving from confirmation to delivery. Our goal is simple: make ordering
          food easy for guests and make restaurant operations clear for the team.
        </p>
      </section>

      <section className="pt-16">
        <h2 className="old-h2 mb-10 px-5 text-center text-zinc-800 dark:text-zinc-300">Resturant Powered By Students</h2>
        <div className="grid items-end gap-8 md:grid-cols-[1.7fr_1fr]">
          <p className="mx-auto max-w-[700px] text-center text-[14px] leading-7 text-zinc-600 dark:text-zinc-400 md:text-left">
            This project was developed as a full MERN stack restaurant system — MongoDB, Express, React, and Node.js.
            It connects a customer-facing food menu with staff dashboards so orders, foods, categories, and users can
            be managed in one place. From fresh biryani and noodles to pizza, snacks, and Thai favourites, every item
            is organised by category so guests can explore quickly and staff can keep the kitchen running smoothly.
          </p>
          <img
            src="/images/cooking-6668437_1280.png"
            alt="Cooking illustration"
            className="food-illustration mx-auto h-[300px] w-[329px] object-contain md:mr-8"
          />
        </div>
      </section>
    </main>
  );
}
