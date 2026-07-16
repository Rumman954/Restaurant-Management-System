export default function Footer() {
  return (
    <footer className="brand-footer mt-16">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-2">
        <div>
          <h3 className="mb-2 text-xl font-semibold text-white dark:text-zinc-100">Contact US</h3>
          <p className="text-white/90 dark:text-zinc-400">123, Kuratoli, Kuril, Dhaka</p>
          <p className="text-white/90 dark:text-zinc-400">Phone : +8801783891937</p>
        </div>
        <div className="md:pl-16 lg:pl-56">
          <h3 className="mb-2 text-xl font-semibold text-white dark:text-zinc-100">Social Media</h3>
          <ul className="space-y-1 text-white/90 dark:text-zinc-400">
            <li>
              <a
                href="https://www.facebook.com/mdabutalha.rumman"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white dark:hover:text-zinc-200"
              >
                Facebook
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/rummanmdabutalha/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white dark:hover:text-zinc-200"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href="https://x.com/MdAbuTalhaRumm1"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white dark:hover:text-zinc-200"
              >
                Twitter
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/qr/POWXG6EYKO7WO1"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white dark:hover:text-zinc-200"
              >
                Whatsapp
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/25 px-4 py-3 text-center text-sm dark:border-white/5 md:text-left">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <p className="text-white/85 dark:text-zinc-500">© 2026 Copyright @ Resturant</p>
          <p className="text-white/85 dark:text-zinc-500">Made in Bangladesh with ♥</p>
        </div>
      </div>
    </footer>
  );
}
