export default function Footer() {
  return (
    <footer className="brand-footer mt-16">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-2">
        <div>
          <h3 className="mb-2 text-xl font-semibold">Contact US</h3>
          <p className="text-white/90">123, Kuratoli, Kuril, Dhaka</p>
          <p className="text-white/90">Phone : +8801783891937</p>
        </div>
        <div className="md:pl-16 lg:pl-56">
          <h3 className="mb-2 text-xl font-semibold">Social Media</h3>
          <ul className="space-y-1 text-white/90">
            <li>Facebook</li>
            <li>Instagram</li>
            <li>Twitter</li>
            <li>Whatsapp</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/20 px-4 py-3 text-center text-sm md:text-left">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <p className="text-white/85">© 2026 Copyright @ Resturant</p>
          <p className="text-white/85">Made in Bangladesh with ♥</p>
        </div>
      </div>
    </footer>
  );
}
