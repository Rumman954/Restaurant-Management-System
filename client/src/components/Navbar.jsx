import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const getStoredUser = () => {
    try {
      const stored = sessionStorage.getItem("authUser");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const getSurname = (name) => {
    if (!name || typeof name !== "string") return "";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return parts.length ? parts[parts.length - 1] : "";
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const [loginStatus, setLoginStatus] = useState({ type: "", message: "" });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
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
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [authUser, setAuthUser] = useState(getStoredUser);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [profileStatus, setProfileStatus] = useState({ type: "", message: "" });
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [orderHistory, setOrderHistory] = useState([]);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const goToHomeTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsMenuOpen(false);
  };

  const openLoginModal = () => {
    setIsLoginOpen(true);
    setFieldErrors({ email: "", password: "" });
    setLoginForm({ email: "", password: "" });
    setLoginStatus({ type: "", message: "" });
    setShowLoginPassword(false);
  };

  useEffect(() => {
    const handleOpenLoginModal = () => {
      openLoginModal();
    };

    window.addEventListener("open-login-modal", handleOpenLoginModal);
    return () => {
      window.removeEventListener("open-login-modal", handleOpenLoginModal);
    };
  }, []);

  const closeLoginModal = () => {
    setIsLoginOpen(false);
    setFieldErrors({ email: "", password: "" });
    setLoginStatus({ type: "", message: "" });
  };

  const openRegisterModal = () => {
    setIsRegisterOpen(true);
    setRegisterForm({ fullName: "", email: "", phone: "", address: "", password: "", confirmPassword: "" });
    setRegisterErrors({ fullName: "", email: "", password: "", confirmPassword: "" });
    setRegisterStatus({ type: "", message: "" });
    setShowRegisterPassword(false);
    setShowRegisterConfirmPassword(false);
  };

  const switchToRegisterFromLogin = () => {
    closeLoginModal();
    setTimeout(() => {
      openRegisterModal();
    }, 120);
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
        sessionStorage.setItem("authToken", res.data.token);
      }
      if (res?.data?.user) {
        sessionStorage.setItem("authUser", JSON.stringify(res.data.user));
        setAuthUser(res.data.user);
        if (res.data.user.role === "admin") {
          navigate("/admin");
        }
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
        phone: registerForm.phone.trim(),
        address: registerForm.address.trim(),
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
  const navItemsWithAdmin = authUser?.role === "admin" ? [...navItems, { label: "Admin", to: "/admin" }] : navItems;

  const accountItems = authUser
    ? [{ label: "Logout", to: "#" }]
    : [
        { label: "Login", to: "/about" },
        { label: "Register", to: "/about" },
      ];

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("authUser");
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setAuthUser(null);
    setIsProfileOpen(false);
    setIsProfileEditing(false);
    setOrderHistory([]);
    setIsMenuOpen(false);
  };

  const openProfileModal = () => {
    if (!authUser) return;
    setProfileForm({
      name: authUser.name || "",
      email: authUser.email || "",
      phone: authUser.phone || "",
      address: authUser.address || "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    const token = sessionStorage.getItem("authToken");
    if (token) {
      api
        .get("/orders/my", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          setOrderHistory(Array.isArray(res.data) ? res.data : []);
        })
        .catch(() => {
          setOrderHistory([]);
        });
    } else {
      setOrderHistory([]);
    }
    setProfileStatus({ type: "", message: "" });
    setIsProfileEditing(false);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
    setIsProfileOpen(true);
    setIsMenuOpen(false);
  };

  const closeProfileModal = () => {
    setIsProfileOpen(false);
    setIsProfileEditing(false);
    setProfileStatus({ type: "", message: "" });
  };

  const handleProfileSave = async () => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      setProfileStatus({ type: "error", message: "Please login again." });
      return;
    }
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      setProfileStatus({ type: "error", message: "Name and email are required." });
      return;
    }
    if (profileForm.newPassword && profileForm.newPassword.length < 6) {
      setProfileStatus({ type: "error", message: "New password must be at least 6 characters." });
      return;
    }
    if (profileForm.newPassword && !profileForm.currentPassword) {
      setProfileStatus({ type: "error", message: "Please enter current password." });
      return;
    }
    if (profileForm.newPassword !== profileForm.confirmNewPassword) {
      setProfileStatus({ type: "error", message: "New passwords do not match." });
      return;
    }

    try {
      const res = await api.put(
        "/auth/profile",
        {
          name: profileForm.name.trim(),
          email: profileForm.email.trim(),
          phone: profileForm.phone.trim(),
          address: profileForm.address.trim(),
          currentPassword: profileForm.currentPassword,
          newPassword: profileForm.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res?.data?.user) {
        setAuthUser(res.data.user);
        sessionStorage.setItem("authUser", JSON.stringify(res.data.user));
      }
      setProfileStatus({ type: "success", message: res?.data?.msg || "Profile updated." });
      setProfileForm((prev) => ({ ...prev, currentPassword: "", newPassword: "", confirmNewPassword: "" }));
      setIsProfileEditing(false);
    } catch (error) {
      const message = error?.response?.data?.msg || "Profile update failed.";
      setProfileStatus({ type: "error", message });
    }
  };

  const surname = getSurname(authUser?.name);

  return (
    <>
      <header className="brand-bar sticky top-0 z-40 border-b shadow-sm">
        <nav className="relative mx-auto flex h-16 w-full max-w-7xl items-center justify-center px-4 sm:px-6 lg:justify-between lg:px-8">
        <Link
          to="/"
          className="brand-logo text-4xl leading-none tracking-wide text-white transition hover:text-rose-100 dark:text-rose-300 dark:hover:text-rose-200 lg:text-3xl"
          onClick={goToHomeTop}
        >
          Restaurant
        </Link>

          <div className="hidden items-center gap-8 text-sm font-medium lg:flex">
          {navItemsWithAdmin.map((item) => (
            item.label === "Contact" ? (
              <button
                key={item.label}
                type="button"
                className="brand-bar-link rounded-md px-2 py-1 transition-colors duration-200"
                onClick={() => setIsContactOpen(true)}
              >
                {item.label}
              </button>
            ) : (
              <Link
                key={item.label}
                to={item.to}
                className="brand-bar-link rounded-md px-2 py-1 transition-colors duration-200"
                onClick={item.label === "Home" ? goToHomeTop : undefined}
              >
                {item.label}
              </Link>
            )
          ))}
          </div>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            type="button"
            className="rounded-full border border-white/70 px-3 py-2 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-white/10 dark:border-white/15 dark:text-zinc-200 dark:hover:bg-white/5"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? "☀ Light" : "☾ Dark"}
          </button>
          {authUser && (
            <button
              type="button"
              className="text-sm font-semibold text-white transition hover:text-rose-100 dark:text-zinc-200 dark:hover:text-rose-300"
              onClick={openProfileModal}
            >
              Hi, {surname || authUser.name}
            </button>
          )}
          {accountItems.map((item) => (
            item.label === "Login" ? (
              <button
                key={item.label}
                type="button"
                className="rounded-full border border-white/70 px-4 py-2 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-white/10 dark:border-white/15 dark:text-zinc-200 dark:hover:bg-white/5"
                onClick={openLoginModal}
              >
                {item.label}
              </button>
            ) : (
              item.label === "Register" ? (
              <button
                key={item.label}
                type="button"
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition duration-200 hover:-translate-y-0.5 hover:bg-rose-50 hover:shadow-sm dark:bg-[#421F37] dark:text-white dark:hover:bg-[#5a2a4a]"
                onClick={openRegisterModal}
              >
                {item.label}
              </button>
              ) : item.label === "Logout" ? (
                <button
                  key={item.label}
                  type="button"
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition duration-200 hover:-translate-y-0.5 hover:bg-rose-50 hover:shadow-sm dark:bg-[#421F37] dark:text-white dark:hover:bg-[#5a2a4a]"
                  onClick={handleLogout}
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.label}
                  to={item.to}
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition duration-200 hover:-translate-y-0.5 hover:bg-rose-50 hover:shadow-sm dark:bg-[#421F37] dark:text-white dark:hover:bg-[#5a2a4a]"
                >
                  {item.label}
                </Link>
              )
            )
          ))}
        </div>

        <button
          type="button"
          className="absolute left-4 inline-flex items-center rounded-md p-2 text-white transition hover:bg-white/10 dark:text-zinc-200 dark:hover:bg-white/5 lg:hidden"
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
          <aside className="relative h-full w-[250px] bg-white px-5 py-6 shadow-2xl dark:bg-zinc-900">
            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="rounded-md px-3 py-2 text-left text-base font-semibold text-zinc-700 transition hover:bg-rose-50 dark:text-zinc-400 dark:hover:bg-rose-950/40"
                onClick={() => {
                  toggleTheme();
                  setIsMenuOpen(false);
                }}
              >
                {isDark ? "☀ Light Mode" : "☾ Dark Mode"}
              </button>
              {authUser && (
                <button
                  type="button"
                  className="rounded-md px-3 py-2 text-left text-base font-semibold text-zinc-700 dark:text-zinc-300 transition hover:bg-rose-50"
                  onClick={openProfileModal}
                >
                  Hi, {surname || authUser.name}
                </button>
              )}
              {[...navItemsWithAdmin, ...accountItems].map((item) =>
                item.label === "Contact" ? (
                  <button
                    key={item.label}
                    type="button"
                    className="rounded-md px-3 py-2 text-left text-base font-medium text-zinc-700 dark:text-zinc-300 transition-colors duration-200 hover:bg-rose-50 hover:text-zinc-800 dark:text-zinc-300 active:bg-rose-200 active:text-rose-900 focus-visible:bg-rose-50 focus-visible:text-zinc-800 dark:text-zinc-300 [-webkit-tap-highlight-color:transparent]"
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
                    className="rounded-md px-3 py-2 text-left text-base font-medium text-zinc-700 dark:text-zinc-300 transition-colors duration-200 hover:bg-rose-50 hover:text-zinc-800 dark:text-zinc-300 active:bg-rose-200 active:text-rose-900 focus-visible:bg-rose-50 focus-visible:text-zinc-800 dark:text-zinc-300 [-webkit-tap-highlight-color:transparent]"
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
                    className="rounded-md px-3 py-2 text-left text-base font-medium text-zinc-700 dark:text-zinc-300 transition-colors duration-200 hover:bg-rose-50 hover:text-zinc-800 dark:text-zinc-300 active:bg-rose-200 active:text-rose-900 focus-visible:bg-rose-50 focus-visible:text-zinc-800 dark:text-zinc-300 [-webkit-tap-highlight-color:transparent]"
                    onClick={() => {
                      setIsMenuOpen(false);
                      openRegisterModal();
                    }}
                  >
                    {item.label}
                  </button>
                ) : item.label === "Logout" ? (
                  <button
                    key={item.label}
                    type="button"
                    className="rounded-md px-3 py-2 text-left text-base font-medium text-zinc-700 dark:text-zinc-300 transition-colors duration-200 hover:bg-rose-50 hover:text-zinc-800 dark:text-zinc-300 active:bg-rose-200 active:text-rose-900 focus-visible:bg-rose-50 focus-visible:text-zinc-800 dark:text-zinc-300 [-webkit-tap-highlight-color:transparent]"
                    onClick={handleLogout}
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="rounded-md px-3 py-2 text-base font-medium text-zinc-700 dark:text-zinc-300 transition-colors duration-200 hover:bg-rose-50 hover:text-zinc-800 dark:text-zinc-300 active:bg-rose-200 active:text-rose-900 focus-visible:bg-rose-50 focus-visible:text-zinc-800 dark:text-zinc-300 [-webkit-tap-highlight-color:transparent]"
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
          <div className="mx-auto w-full max-w-5xl bg-white dark:bg-zinc-900 p-6 shadow-xl sm:p-8">
            <h2 className="text-center text-4xl font-normal text-zinc-800 dark:text-zinc-300 sm:text-5xl">Register Here!</h2>
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
                  className={`w-full border-0 border-b px-1 py-2 text-zinc-800 dark:text-zinc-300 outline-none placeholder:text-zinc-400 focus:border-zinc-500 ${
                    registerErrors.fullName ? "border-rose-500" : "border-zinc-300 dark:border-zinc-600"
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
                  className={`w-full border-0 border-b px-1 py-2 text-zinc-800 dark:text-zinc-300 outline-none placeholder:text-zinc-400 focus:border-zinc-500 ${
                    registerErrors.email ? "border-rose-500" : "border-zinc-300 dark:border-zinc-600"
                  }`}
                />
                {registerErrors.email && <p className="mt-1 text-xs text-rose-600">{registerErrors.email}</p>}
              </div>

              <div className="mt-8">
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={registerForm.phone}
                  onChange={(event) => {
                    setRegisterForm((prev) => ({ ...prev, phone: event.target.value }));
                    setRegisterStatus({ type: "", message: "" });
                  }}
                  className="w-full border-0 border-b border-zinc-300 dark:border-zinc-600 px-1 py-2 text-zinc-800 dark:text-zinc-300 outline-none placeholder:text-zinc-400 focus:border-zinc-500"
                />
              </div>

              <div className="mt-8">
                <input
                  type="text"
                  placeholder="Address"
                  value={registerForm.address}
                  onChange={(event) => {
                    setRegisterForm((prev) => ({ ...prev, address: event.target.value }));
                    setRegisterStatus({ type: "", message: "" });
                  }}
                  className="w-full border-0 border-b border-zinc-300 dark:border-zinc-600 px-1 py-2 text-zinc-800 dark:text-zinc-300 outline-none placeholder:text-zinc-400 focus:border-zinc-500"
                />
              </div>

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <div>
                  <div className="relative">
                    <input
                      type={showRegisterPassword ? "text" : "password"}
                      placeholder="Password"
                      value={registerForm.password}
                      onChange={(event) => {
                        setRegisterForm((prev) => ({ ...prev, password: event.target.value }));
                        setRegisterErrors((prev) => ({ ...prev, password: "" }));
                        setRegisterStatus({ type: "", message: "" });
                      }}
                      className={`w-full border-0 border-b px-1 py-2 pr-9 text-zinc-800 dark:text-zinc-300 outline-none placeholder:text-zinc-400 focus:border-zinc-500 ${
                        registerErrors.password ? "border-rose-500" : "border-zinc-300 dark:border-zinc-600"
                      }`}
                    />
                    <button
                      type="button"
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 transition hover:text-zinc-700 dark:text-zinc-300"
                      onClick={() => setShowRegisterPassword((prev) => !prev)}
                      aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden="true">
                        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
                        <circle cx="12" cy="12" r="3" />
                        {showRegisterPassword && <path d="M4 4 20 20" />}
                      </svg>
                    </button>
                  </div>
                  {registerErrors.password && <p className="mt-1 text-xs text-rose-600">{registerErrors.password}</p>}
                </div>
                <div>
                  <div className="relative">
                    <input
                      type={showRegisterConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      value={registerForm.confirmPassword}
                      onChange={(event) => {
                        setRegisterForm((prev) => ({ ...prev, confirmPassword: event.target.value }));
                        setRegisterErrors((prev) => ({ ...prev, confirmPassword: "" }));
                        setRegisterStatus({ type: "", message: "" });
                      }}
                      className={`w-full border-0 border-b px-1 py-2 pr-9 text-zinc-800 dark:text-zinc-300 outline-none placeholder:text-zinc-400 focus:border-zinc-500 ${
                        registerErrors.confirmPassword ? "border-rose-500" : "border-zinc-300 dark:border-zinc-600"
                      }`}
                    />
                    <button
                      type="button"
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 transition hover:text-zinc-700 dark:text-zinc-300"
                      onClick={() => setShowRegisterConfirmPassword((prev) => !prev)}
                      aria-label={showRegisterConfirmPassword ? "Hide password" : "Show password"}
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden="true">
                        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
                        <circle cx="12" cy="12" r="3" />
                        {showRegisterConfirmPassword && <path d="M4 4 20 20" />}
                      </svg>
                    </button>
                  </div>
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
                  className="brand-btn rounded-sm px-6 py-2 text-sm font-semibold uppercase tracking-wide transition-colors duration-200"
                >
                  Register
                </button>
                <button
                  type="button"
                  className="rounded-sm px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 transition hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
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
        <div className="fixed inset-0 z-50 bg-black/60 px-4 py-8 sm:py-12">
          <div className="mx-auto w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-2xl sm:p-8">
            <h2 className="text-center text-3xl font-semibold text-zinc-800 dark:text-zinc-300">Welcome Back</h2>
            <p className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">Login to continue ordering your favorite food.</p>

            <form className="mt-7" onSubmit={handleLoginSubmit} noValidate>
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
                  className={`w-full rounded-lg border px-3 py-2.5 text-zinc-800 dark:text-zinc-300 outline-none placeholder:text-zinc-400 focus:ring-2 ${
                    fieldErrors.email ? "border-rose-500 focus:ring-rose-100" : "border-zinc-300 dark:border-zinc-600 focus:border-[#ee6e73] dark:focus:border-[#421F37] focus:ring-rose-100"
                  }`}
                />
                {fieldErrors.email && <p className="mt-1 text-xs text-rose-600">{fieldErrors.email}</p>}
              </div>
              <div className="mt-4">
                <label htmlFor="login-password" className="sr-only">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="Password"
                    value={loginForm.password}
                    onChange={(event) => {
                      setLoginForm((prev) => ({ ...prev, password: event.target.value }));
                      setFieldErrors((prev) => ({ ...prev, password: "" }));
                      setLoginStatus({ type: "", message: "" });
                    }}
                    className={`w-full rounded-lg border px-3 py-2.5 pr-10 text-zinc-800 dark:text-zinc-300 outline-none placeholder:text-zinc-400 focus:ring-2 ${
                      fieldErrors.password ? "border-rose-500 focus:ring-rose-100" : "border-zinc-300 dark:border-zinc-600 focus:border-[#ee6e73] dark:focus:border-[#421F37] focus:ring-rose-100"
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 transition hover:text-zinc-700 dark:text-zinc-300"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                    aria-label={showLoginPassword ? "Hide password" : "Show password"}
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden="true">
                      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
                      <circle cx="12" cy="12" r="3" />
                      {showLoginPassword && <path d="M4 4 20 20" />}
                    </svg>
                  </button>
                </div>
                {fieldErrors.password && <p className="mt-1 text-xs text-rose-600">{fieldErrors.password}</p>}
              </div>

              {loginStatus.message && (
                <p className={`mt-5 text-center text-sm ${loginStatus.type === "error" ? "text-rose-600" : "text-emerald-600"}`}>
                  {loginStatus.message}
                </p>
              )}

              <div className="mt-7 flex items-center justify-center gap-3">
                <button
                  type="submit"
                  className="brand-btn rounded-md px-6 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors duration-200"
                >
                  Login
                </button>
                <button
                  type="button"
                  className="rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 transition hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
                  onClick={closeLoginModal}
                >
                  Close
                </button>
              </div>
            </form>

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-zinc-200" />
              <span className="text-xs uppercase tracking-wide text-zinc-400">or</span>
              <span className="h-px flex-1 bg-zinc-200" />
            </div>

            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              onClick={() => setLoginStatus({ type: "error", message: "Google login is coming soon." })}
            >
              <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.35 0 6.35 1.15 8.72 3.41l6.49-6.49C35.17 2.67 29.96.5 24 .5 14.71.5 6.72 5.84 2.84 13.62l7.53 5.85C12.18 13.64 17.6 9.5 24 9.5Z"
                />
                <path
                  fill="#4285F4"
                  d="M46.5 24.5c0-1.57-.14-3.07-.4-4.5H24v9h12.69c-.55 2.96-2.23 5.47-4.75 7.16l7.3 5.66C43.81 37.6 46.5 31.64 46.5 24.5Z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.37 28.53A14.44 14.44 0 0 1 9.5 24c0-1.58.3-3.09.87-4.53l-7.53-5.85A23.44 23.44 0 0 0 .5 24c0 3.78.9 7.36 2.34 10.38l7.53-5.85Z"
                />
                <path
                  fill="#34A853"
                  d="M24 47.5c5.96 0 10.97-1.97 14.63-5.37l-7.3-5.66c-2.03 1.37-4.64 2.18-7.33 2.18-6.4 0-11.82-4.14-13.63-9.97l-7.53 5.85C6.72 42.16 14.71 47.5 24 47.5Z"
                />
              </svg>
              Continue with Google
            </button>

            <p className="mt-5 text-center text-sm text-zinc-600 dark:text-zinc-400">
              If you don&apos;t have account{" "}
              <button
                type="button"
                className="font-semibold text-rose-600 transition hover:text-rose-700 dark:text-rose-300 dark:hover:text-rose-200"
                onClick={switchToRegisterFromLogin}
              >
                Register
              </button>
            </p>
          </div>
        </div>
      )}

      {isProfileOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 px-4 py-8 sm:py-12">
          <div className="mx-auto w-full max-w-3xl rounded bg-white dark:bg-zinc-900 p-6 shadow-xl sm:p-8">
            <h2 className="text-center text-3xl font-semibold text-zinc-800 dark:text-zinc-300">Customer Details</h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Name</p>
                {isProfileEditing ? (
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(event) => setProfileForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="mt-1 w-full rounded border border-zinc-300 dark:border-zinc-600 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-300 outline-none focus:border-zinc-500"
                  />
                ) : (
                  <p className="mt-1 text-sm text-zinc-800 dark:text-zinc-300">{authUser?.name || "-"}</p>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Email</p>
                {isProfileEditing ? (
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(event) => setProfileForm((prev) => ({ ...prev, email: event.target.value }))}
                    className="mt-1 w-full rounded border border-zinc-300 dark:border-zinc-600 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-300 outline-none focus:border-zinc-500"
                  />
                ) : (
                  <p className="mt-1 text-sm text-zinc-800 dark:text-zinc-300">{authUser?.email || "-"}</p>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Phone Number</p>
                {isProfileEditing ? (
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(event) => setProfileForm((prev) => ({ ...prev, phone: event.target.value }))}
                    className="mt-1 w-full rounded border border-zinc-300 dark:border-zinc-600 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-300 outline-none focus:border-zinc-500"
                  />
                ) : (
                  <p className="mt-1 text-sm text-zinc-800 dark:text-zinc-300">{authUser?.phone || "-"}</p>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Address</p>
                {isProfileEditing ? (
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(event) => setProfileForm((prev) => ({ ...prev, address: event.target.value }))}
                    className="mt-1 w-full rounded border border-zinc-300 dark:border-zinc-600 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-300 outline-none focus:border-zinc-500"
                  />
                ) : (
                  <p className="mt-1 text-sm text-zinc-800 dark:text-zinc-300">{authUser?.address || "-"}</p>
                )}
              </div>

              {isProfileEditing && (
                <>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Current Password</p>
                    <div className="relative mt-1">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={profileForm.currentPassword}
                        onChange={(event) => setProfileForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
                        className="w-full rounded border border-zinc-300 dark:border-zinc-600 px-3 py-2 pr-10 text-sm text-zinc-800 dark:text-zinc-300 outline-none focus:border-zinc-500"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 transition hover:text-zinc-700 dark:text-zinc-300"
                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                        aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden="true">
                          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
                          <circle cx="12" cy="12" r="3" />
                          {showCurrentPassword && <path d="M4 4 20 20" />}
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">New Password</p>
                    <div className="relative mt-1">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={profileForm.newPassword}
                        onChange={(event) => setProfileForm((prev) => ({ ...prev, newPassword: event.target.value }))}
                        className="w-full rounded border border-zinc-300 dark:border-zinc-600 px-3 py-2 pr-10 text-sm text-zinc-800 dark:text-zinc-300 outline-none focus:border-zinc-500"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 transition hover:text-zinc-700 dark:text-zinc-300"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden="true">
                          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
                          <circle cx="12" cy="12" r="3" />
                          {showNewPassword && <path d="M4 4 20 20" />}
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Confirm New Password</p>
                    <div className="relative mt-1">
                      <input
                        type={showConfirmNewPassword ? "text" : "password"}
                        value={profileForm.confirmNewPassword}
                        onChange={(event) => setProfileForm((prev) => ({ ...prev, confirmNewPassword: event.target.value }))}
                        className="w-full rounded border border-zinc-300 dark:border-zinc-600 px-3 py-2 pr-10 text-sm text-zinc-800 dark:text-zinc-300 outline-none focus:border-zinc-500"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 transition hover:text-zinc-700 dark:text-zinc-300"
                        onClick={() => setShowConfirmNewPassword((prev) => !prev)}
                        aria-label={showConfirmNewPassword ? "Hide password" : "Show password"}
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden="true">
                          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
                          <circle cx="12" cy="12" r="3" />
                          {showConfirmNewPassword && <path d="M4 4 20 20" />}
                        </svg>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {profileStatus.message && (
              <p className={`mt-4 text-sm ${profileStatus.type === "error" ? "text-rose-600" : "text-emerald-600"}`}>
                {profileStatus.message}
              </p>
            )}

            <div className="mt-7">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-300">Placed Orders</h3>
              {orderHistory.length === 0 ? (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">No orders found yet.</p>
              ) : (
                <div className="mt-3 max-h-52 space-y-2 overflow-y-auto rounded border border-zinc-200 dark:border-zinc-700 p-3">
                  {orderHistory.map((order) => (
                    <div key={order._id || order.orderId} className="rounded border border-zinc-200 dark:border-zinc-700 px-3 py-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-300">{order.foodName || "Food order"}</p>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">Order ID: {order.orderId}</p>
                        </div>
                        <span
                          className={`rounded px-2 py-0.5 text-[11px] font-semibold uppercase ${
                            order.status === "delivered"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-rose-300"
                              : order.status === "progress"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                                : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:text-zinc-300"
                          }`}
                        >
                          {order.status === "delivered" ? "Delivered" : order.status === "progress" ? "Confirmed" : "Pending"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
              {isProfileEditing ? (
                <button
                  type="button"
                  className="brand-btn rounded-sm px-5 py-2 text-xs font-semibold uppercase tracking-wide transition"
                  onClick={handleProfileSave}
                >
                  Save
                </button>
              ) : (
                <button
                  type="button"
                  className="brand-btn rounded-sm px-5 py-2 text-xs font-semibold uppercase tracking-wide transition"
                  onClick={() => setIsProfileEditing(true)}
                >
                  Edit
                </button>
              )}
              <button
                type="button"
                className="rounded-sm px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 transition hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
                onClick={closeProfileModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isContactOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 px-4 py-12">
          <div className="mx-auto w-full max-w-3xl bg-white dark:bg-zinc-900 p-5 shadow-xl sm:p-7">
            <h2 className="text-4xl font-light text-zinc-800 dark:text-zinc-300">Contact Info</h2>
            <p className="mt-4 text-sm text-zinc-700 dark:text-zinc-300">
              You can contact us directly by calling to this number +8801605357646. Check the bottom Footer section of
              the website for more info.
            </p>
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                className="rounded-md px-3 py-1.5 text-sm font-medium uppercase text-zinc-700 dark:text-zinc-300 transition-colors duration-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white active:bg-zinc-200 dark:active:bg-zinc-700"
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
