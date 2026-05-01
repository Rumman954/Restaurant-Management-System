import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const [loginStatus, setLoginStatus] = useState({ type: "", message: "" });
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [registerErrors, setRegisterErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [registerStatus, setRegisterStatus] = useState({ type: "", message: "" });

  const goToHomeTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsMenuOpen(false);
  };

  const openLoginModal = () => {
    setIsLoginOpen(true);
    setFieldErrors({ email: "", password: "" });
    setLoginForm({ email: "", password: "" });
    setLoginStatus({ type: "", message: "" });
  };

  const closeLoginModal = () => {
    setIsLoginOpen(false);
    setFieldErrors({ email: "", password: "" });
    setLoginStatus({ type: "", message: "" });
  };

  const openRegisterModal = () => {
    setIsRegisterOpen(true);
    setRegisterForm({ fullName: "", email: "", password: "", confirmPassword: "" });
    setRegisterErrors({ fullName: "", email: "", password: "", confirmPassword: "" });
    setRegisterStatus({ type: "", message: "" });
  };

  const closeRegisterModal = () => {
    setIsRegisterOpen(false);
    setRegisterErrors({ fullName: "", email: "", password: "", confirmPassword: "" });
    setRegisterStatus({ type: "", message: "" });
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = { email: "", password: "" };
    const trimmedEmail = loginForm.email.trim();

    if (!trimmedEmail) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = "Please enter a valid email.";
    }

    if (!loginForm.password.trim()) {
      nextErrors.password = "Password is required.";
    } else if (loginForm.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    setFieldErrors(nextErrors);

    if (nextErrors.email || nextErrors.password) {
      return;
    }

    try {
      const res = await api.post("/auth/login", {
        email: trimmedEmail,
        password: loginForm.password,
      });

      if (res?.data?.token) {
        localStorage.setItem("authToken", res.data.token);
      }
      if (res?.data?.user) {
        localStorage.setItem("authUser", JSON.stringify(res.data.user));
      }

      setLoginStatus({ type: "success", message: res?.data?.msg || "Login successful." });
      setTimeout(() => {
        closeLoginModal();
      }, 900);
    } catch (error) {
      const message = error?.response?.data?.msg || "Login failed. Please try again.";
      setLoginStatus({ type: "error", message });
    }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = { fullName: "", email: "", password: "", confirmPassword: "" };
    const trimmedEmail = registerForm.email.trim();

    if (!registerForm.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }
    if (!trimmedEmail) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = "Please enter a valid email.";
    }
    if (!registerForm.password.trim()) {
      nextErrors.password = "Password is required.";
    } else if (registerForm.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }
    if (!registerForm.confirmPassword.trim()) {
      nextErrors.confirmPassword = "Confirm password is required.";
    } else if (registerForm.password !== registerForm.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setRegisterErrors(nextErrors);

    if (nextErrors.fullName || nextErrors.email || nextErrors.password || nextErrors.confirmPassword) {
      return;
    }

    try {
      const res = await api.post("/auth/register", {
        name: registerForm.fullName.trim(),
        email: trimmedEmail,
        password: registerForm.password,
      });

      setRegisterStatus({ type: "success", message: res?.data?.msg || "Registration successful." });
      setTimeout(() => {
        closeRegisterModal();
        openLoginModal();
      }, 900);
    } catch (error) {
      const message = error?.response?.data?.msg || "Registration failed. Please try again.";
      setRegisterStatus({ type: "error", message });
    }
  };

  const navItems = [
    { label: "Home", to: "/" },
    { label: "About Us", to: "/about" },
    { label: "Categories", to: "/food-categories" },
    { label: "Foods", to: "/foods" },
    { label: "Contact", to: "#" },
  ];

  const accountItems = [
    { label: "Login", to: "/about" },
    { label: "Register", to: "/about" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-rose-300 bg-[#ee6e73] text-white shadow-sm">
        <nav className="relative mx-auto flex h-16 w-full max-w-7xl items-center justify-center px-4 sm:px-6 lg:justify-between lg:px-8">
        <Link
          to="/"
          className="brand-logo text-4xl leading-none tracking-wide text-white transition hover:text-rose-100 lg:text-3xl"
          onClick={goToHomeTop}
        >
          Restaurant
        </Link>

          <div className="hidden items-center gap-8 text-sm font-medium lg:flex">
          {navItems.map((item) => (
            item.label === "Contact" ? (
              <button
                key={item.label}
                type="button"
                className="rounded-md px-2 py-1 text-white/95 transition-colors duration-200 hover:bg-[#e35f66] hover:text-white active:bg-[#d8565d]"
                onClick={() => setIsContactOpen(true)}
              >
                {item.label}
              </button>
            ) : (
              <Link
                key={item.label}
                to={item.to}
                className="rounded-md px-2 py-1 text-white/95 transition-colors duration-200 hover:bg-[#e35f66] hover:text-white active:bg-[#d8565d]"
                onClick={item.label === "Home" ? goToHomeTop : undefined}
              >
                {item.label}
              </Link>
            )
          ))}
          </div>

        <div className="hidden items-center gap-3 lg:flex">
          {accountItems.map((item) => (
            item.label === "Login" ? (
              <button
                key={item.label}
                type="button"
                className="rounded-full border border-white/80 px-4 py-2 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-white/10"
                onClick={openLoginModal}
              >
                {item.label}
              </button>
            ) : (
              item.label === "Register" ? (
              <button
                key={item.label}
                type="button"
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition duration-200 hover:-translate-y-0.5 hover:bg-rose-50 hover:shadow-sm"
                onClick={openRegisterModal}
              >
                {item.label}
              </button>
              ) : (
                <Link
                  key={item.label}
                  to={item.to}
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition duration-200 hover:-translate-y-0.5 hover:bg-rose-50 hover:shadow-sm"
                >
                  {item.label}
                </Link>
              )
            )
          ))}
        </div>

        <button
          type="button"
          className="absolute left-4 inline-flex items-center rounded-md p-2 text-white transition hover:bg-white/10 lg:hidden"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <span className="text-2xl leading-none">{isMenuOpen ? "×" : "☰"}</span>
        </button>
        </nav>

      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            className="absolute inset-0 bg-black/70"
            onClick={() => setIsMenuOpen(false)}
          />
          <aside className="relative h-full w-[250px] bg-white px-5 py-6 shadow-2xl">
            <div className="flex flex-col gap-2">
              {[...navItems, ...accountItems].map((item) =>
                item.label === "Contact" ? (
                  <button
                    key={item.label}
                    type="button"
                    className="rounded-md px-3 py-2 text-left text-base font-medium text-zinc-700 transition-colors duration-200 hover:bg-rose-50 hover:text-zinc-800 active:bg-rose-200 active:text-rose-800 focus-visible:bg-rose-50 focus-visible:text-zinc-800 [-webkit-tap-highlight-color:transparent]"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsContactOpen(true);
                    }}
                  >
                    {item.label}
                  </button>
                ) : item.label === "Login" ? (
                  <button
                    key={item.label}
                    type="button"
                    className="rounded-md px-3 py-2 text-left text-base font-medium text-zinc-700 transition-colors duration-200 hover:bg-rose-50 hover:text-zinc-800 active:bg-rose-200 active:text-rose-800 focus-visible:bg-rose-50 focus-visible:text-zinc-800 [-webkit-tap-highlight-color:transparent]"
                    onClick={() => {
                      setIsMenuOpen(false);
                      openLoginModal();
                    }}
                  >
                    {item.label}
                  </button>
                ) : item.label === "Register" ? (
                  <button
                    key={item.label}
                    type="button"
                    className="rounded-md px-3 py-2 text-left text-base font-medium text-zinc-700 transition-colors duration-200 hover:bg-rose-50 hover:text-zinc-800 active:bg-rose-200 active:text-rose-800 focus-visible:bg-rose-50 focus-visible:text-zinc-800 [-webkit-tap-highlight-color:transparent]"
                    onClick={() => {
                      setIsMenuOpen(false);
                      openRegisterModal();
                    }}
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="rounded-md px-3 py-2 text-base font-medium text-zinc-700 transition-colors duration-200 hover:bg-rose-50 hover:text-zinc-800 active:bg-rose-200 active:text-rose-800 focus-visible:bg-rose-50 focus-visible:text-zinc-800 [-webkit-tap-highlight-color:transparent]"
                    onClick={item.label === "Home" ? goToHomeTop : () => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </div>
          </aside>
        </div>
      )}

      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 px-4 py-6 sm:py-10">
          <div className="mx-auto w-full max-w-5xl bg-white p-6 shadow-xl sm:p-8">
            <h2 className="text-center text-4xl font-normal text-zinc-800 sm:text-5xl">Register Here!</h2>
            <p className="mt-3 text-center text-lg font-normal text-[#bf3f45] sm:text-xl">Don't leave the fields blank!</p>

            <form className="mt-9" onSubmit={handleRegisterSubmit} noValidate>
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={registerForm.fullName}
                  onChange={(event) => {
                    setRegisterForm((prev) => ({ ...prev, fullName: event.target.value }));
                    setRegisterErrors((prev) => ({ ...prev, fullName: "" }));
                    setRegisterStatus({ type: "", message: "" });
                  }}
                  className={`w-full border-0 border-b px-1 py-2 text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-zinc-500 ${
                    registerErrors.fullName ? "border-rose-500" : "border-zinc-300"
                  }`}
                />
                {registerErrors.fullName && <p className="mt-1 text-xs text-rose-600">{registerErrors.fullName}</p>}
              </div>

              <div className="mt-8">
                <input
                  type="email"
                  placeholder="Email"
                  value={registerForm.email}
                  onChange={(event) => {
                    setRegisterForm((prev) => ({ ...prev, email: event.target.value }));
                    setRegisterErrors((prev) => ({ ...prev, email: "" }));
                    setRegisterStatus({ type: "", message: "" });
                  }}
                  className={`w-full border-0 border-b px-1 py-2 text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-zinc-500 ${
                    registerErrors.email ? "border-rose-500" : "border-zinc-300"
                  }`}
                />
                {registerErrors.email && <p className="mt-1 text-xs text-rose-600">{registerErrors.email}</p>}
              </div>

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={registerForm.password}
                    onChange={(event) => {
                      setRegisterForm((prev) => ({ ...prev, password: event.target.value }));
                      setRegisterErrors((prev) => ({ ...prev, password: "" }));
                      setRegisterStatus({ type: "", message: "" });
                    }}
                    className={`w-full border-0 border-b px-1 py-2 text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-zinc-500 ${
                      registerErrors.password ? "border-rose-500" : "border-zinc-300"
                    }`}
                  />
                  {registerErrors.password && <p className="mt-1 text-xs text-rose-600">{registerErrors.password}</p>}
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={registerForm.confirmPassword}
                    onChange={(event) => {
                      setRegisterForm((prev) => ({ ...prev, confirmPassword: event.target.value }));
                      setRegisterErrors((prev) => ({ ...prev, confirmPassword: "" }));
                      setRegisterStatus({ type: "", message: "" });
                    }}
                    className={`w-full border-0 border-b px-1 py-2 text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-zinc-500 ${
                      registerErrors.confirmPassword ? "border-rose-500" : "border-zinc-300"
                    }`}
                  />
                  {registerErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-rose-600">{registerErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {registerStatus.message && (
                <p className={`mt-6 text-center text-sm ${registerStatus.type === "error" ? "text-rose-600" : "text-emerald-600"}`}>
                  {registerStatus.message}
                </p>
              )}

              <div className="mt-10 flex items-center justify-center gap-3">
                <button
                  type="submit"
                  className="rounded-sm bg-[#ee6e73] px-6 py-2 text-sm font-semibold uppercase tracking-wide text-white transition-colors duration-200 hover:bg-[#e35f66] active:bg-[#d8565d]"
                >
                  Register
                </button>
                <button
                  type="button"
                  className="rounded-sm px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
                  onClick={closeRegisterModal}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoginOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 px-4 py-8 sm:py-12">
          <div className="mx-auto w-full max-w-4xl bg-white p-6 shadow-xl sm:p-8">
            <h2 className="text-center text-4xl font-light text-zinc-800">Good to See You Back!</h2>
            <form className="mt-8" onSubmit={handleLoginSubmit} noValidate>
              <div>
                <label htmlFor="login-email" className="sr-only">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="Email"
                  value={loginForm.email}
                  onChange={(event) => {
                    setLoginForm((prev) => ({ ...prev, email: event.target.value }));
                    setFieldErrors((prev) => ({ ...prev, email: "" }));
                    setLoginStatus({ type: "", message: "" });
                  }}
                  className={`w-full border-0 border-b px-1 py-2 text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-zinc-500 ${
                    fieldErrors.email ? "border-rose-500" : "border-zinc-300"
                  }`}
                />
                {fieldErrors.email && <p className="mt-1 text-xs text-rose-600">{fieldErrors.email}</p>}
              </div>
              <div className="mt-8">
                <label htmlFor="login-password" className="sr-only">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(event) => {
                    setLoginForm((prev) => ({ ...prev, password: event.target.value }));
                    setFieldErrors((prev) => ({ ...prev, password: "" }));
                    setLoginStatus({ type: "", message: "" });
                  }}
                  className={`w-full border-0 border-b px-1 py-2 text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-zinc-500 ${
                    fieldErrors.password ? "border-rose-500" : "border-zinc-300"
                  }`}
                />
                {fieldErrors.password && <p className="mt-1 text-xs text-rose-600">{fieldErrors.password}</p>}
              </div>

              {loginStatus.message && (
                <p className={`mt-5 text-center text-sm ${loginStatus.type === "error" ? "text-rose-600" : "text-emerald-600"}`}>
                  {loginStatus.message}
                </p>
              )}

              <div className="mt-9 flex items-center justify-center gap-3">
                <button
                  type="submit"
                  className="rounded-sm bg-[#ee6e73] px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white transition-colors duration-200 hover:bg-[#e35f66] active:bg-[#d8565d]"
                >
                  Login
                </button>
                <button
                  type="button"
                  className="rounded-sm px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
                  onClick={closeLoginModal}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isContactOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 px-4 py-12">
          <div className="mx-auto w-full max-w-3xl bg-white p-5 shadow-xl sm:p-7">
            <h2 className="text-4xl font-light text-zinc-800">Contact Info</h2>
            <p className="mt-4 text-sm text-zinc-700">
              You can contact us directly by calling to this number +8801605357646. Check the bottom Footer section of
              the website for more info.
            </p>
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                className="rounded-md px-3 py-1.5 text-sm font-medium uppercase text-zinc-700 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-900 active:bg-zinc-200"
                onClick={() => setIsContactOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
