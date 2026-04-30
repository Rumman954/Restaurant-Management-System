export default function Footer() {
  return (
    <footer className="mt-16 bg-[#ee6e73] text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-2">
        <div>
          <h3 className="mb-2 text-xl font-semibold">Contact Us</h3>
          <p>123, Kuratoli, Kuril, Dhaka</p>
          <p>Phone: +8801769696969</p>
        </div>
        <div>
          <h3 className="mb-2 text-xl font-semibold">Social Links</h3>
          <ul className="space-y-1">
            <li>Facebook</li>
            <li>Instagram</li>
            <li>Twitter</li>
            <li>Whatsapp</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/30 px-4 py-3 text-center text-sm">
        © 2026 Copyright @ Resturant
      </div>
    </footer>
  );
}
