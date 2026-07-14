import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useTheme } from "../context/ThemeContext";
import { MENU_FOODS, categoryLabel } from "../data/menuCatalog";

function MetricCard({ label, value, iconBg, icon }) {
  return (
    <div className="rounded-2xl border border-[color:var(--a-border)] bg-[var(--a-card)] p-5 shadow-lg">
      <div className={`mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}>{icon}</div>
      <p className="text-3xl font-semibold text-[var(--a-heading)]">{value}</p>
      <p className="mt-1 text-sm text-[var(--a-muted)]">{label}</p>
    </div>
  );
}

function OverviewPie({ users, orders, revenue, items }) {
  const revenueUnits = Math.max(Math.round(Number(revenue) / 250), revenue > 0 ? 1 : 0);
  const total = Math.max(users + orders + revenueUnits, 1);
  const usersPct = (users / total) * 100;
  const ordersPct = (orders / total) * 100;
  const revenuePct = (revenueUnits / total) * 100;
  const gradient = `conic-gradient(#38bdf8 0 ${usersPct}%, #ee6e73 ${usersPct}% ${usersPct + ordersPct}%, #22c55e ${usersPct + ordersPct}% 100%)`;

  return (
    <div className="rounded-2xl border border-[color:var(--a-border)] bg-[var(--a-card)] p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-[var(--a-heading)]">Restaurant Overview</h3>
      <div className="mt-8 flex flex-col items-center gap-8 lg:flex-row lg:justify-center">
        <div className="relative h-56 w-56 rounded-full" style={{ background: gradient }}>
          <div className="absolute inset-8 flex items-center justify-center rounded-full bg-[var(--a-card)]">
            <div className="text-center">
              <p className="text-2xl font-semibold text-sky-500">{items}</p>
              <p className="text-xs text-[var(--a-muted)]">Items Available</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-[var(--a-text)]">
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-sky-400" /> Users: {users} ({Math.round(usersPct)}%)
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#ee6e73]" /> Orders: {orders} ({Math.round(ordersPct)}%)
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500" /> Revenue: ${Number(revenue).toFixed(2)} ({Math.round(revenuePct)}%)
          </span>
        </div>
      </div>
    </div>
  );
}

const BAR_COLORS = ["#ee6e73", "#f59e0b", "#0ea5e9", "#22c55e"];

function FoodActionMenu({ onEdit, onUpdate, onDelete }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const close = () => setOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [open]);

  return (
    <div className="relative inline-flex justify-end">
      <button
        type="button"
        className="rounded-md px-2 py-1 text-lg leading-none text-[var(--a-muted)] transition hover:bg-[var(--a-nav-hover)] hover:text-[var(--a-heading)]"
        aria-label="Food actions"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        ⋮
      </button>
      {open && (
        <div
          className="absolute right-0 z-20 mt-8 min-w-[128px] overflow-hidden rounded-lg border border-[color:var(--a-border)] bg-[var(--a-card)] py-1 shadow-xl"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="block w-full px-3 py-2 text-left text-sm text-[var(--a-text)] transition hover:bg-[var(--a-nav-hover)]"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
          >
            Edit
          </button>
          <button
            type="button"
            className="block w-full px-3 py-2 text-left text-sm text-[var(--a-text)] transition hover:bg-[var(--a-nav-hover)]"
            onClick={() => {
              setOpen(false);
              onUpdate();
            }}
          >
            Update
          </button>
          <button
            type="button"
            className="block w-full px-3 py-2 text-left text-sm text-rose-500 transition hover:bg-[var(--a-nav-hover)]"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function OverviewBarChart({ orders, pending, progress, delivered, isDark }) {
  const bars = [
    { label: "Orders", value: orders },
    { label: "Pending", value: pending },
    { label: "Progress", value: progress },
    { label: "Delivered", value: delivered },
  ];

  const max = Math.max(...bars.map((b) => b.value), 1);

  return (
    <div className="rounded-2xl border border-[color:var(--a-border)] bg-[var(--a-card)] p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-[var(--a-heading)]">Order Status</h3>
      <div
        className={`mt-6 rounded-xl px-4 pb-3 pt-6 sm:px-6 ${
          isDark ? "border border-white/10 bg-[#0b0e14]" : "border border-zinc-200 bg-zinc-50"
        }`}
      >
        <div className="relative h-48">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`absolute left-0 right-0 border-t ${isDark ? "border-white/10" : "border-zinc-200"}`}
              style={{ top: `${(i / 3) * 100}%` }}
            />
          ))}
          <div className="absolute inset-0 flex items-end justify-around gap-2 px-1 sm:gap-4">
            {bars.map((bar, index) => (
              <div key={bar.label} className="flex h-full w-full max-w-[52px] flex-col items-center justify-end">
                <span
                  className={`mb-1 text-[11px] font-semibold tabular-nums ${
                    isDark ? "text-zinc-300" : "text-zinc-600"
                  }`}
                >
                  {bar.value}
                </span>
                <div
                  className="w-full rounded-t-sm transition-all duration-500"
                  style={{
                    height: `${Math.max((bar.value / max) * 85, bar.value > 0 ? 6 : 2)}%`,
                    backgroundColor: BAR_COLORS[index],
                  }}
                  title={`${bar.label}: ${bar.value}`}
                />
              </div>
            ))}
          </div>
        </div>
        <div
          className={`mt-2 flex justify-around gap-2 border-t pt-2 sm:gap-4 ${
            isDark ? "border-white/10" : "border-zinc-200"
          }`}
        >
          {bars.map((bar) => (
            <span
              key={bar.label}
              className={`w-full max-w-[52px] text-center text-[10px] font-medium ${
                isDark ? "text-zinc-400" : "text-zinc-600"
              }`}
            >
              {bar.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

const darkVars = {
  "--a-bg": "#0b0e14",
  "--a-sidebar": "#421f37",
  "--a-header": "#421f37",
  "--a-card": "#151a24",
  "--a-inset": "#0b0e14",
  "--a-border": "rgba(255,255,255,0.08)",
  "--a-text": "#e4e4e7",
  "--a-muted": "#a1a1aa",
  "--a-heading": "#ffffff",
  "--a-nav-hover": "rgba(255,255,255,0.1)",
  "--a-chrome-text": "#ffffff",
  "--a-chrome-muted": "rgba(255,255,255,0.75)",
  "--a-accent": "#421f37",
  "--a-accent-hover": "#5a2a4a",
};

const lightVars = {
  "--a-bg": "#f4f4f5",
  "--a-sidebar": "#ee6e73",
  "--a-header": "#ee6e73",
  "--a-card": "#ffffff",
  "--a-inset": "#f4f4f5",
  "--a-border": "rgba(0,0,0,0.08)",
  "--a-text": "#3f3f46",
  "--a-muted": "#71717a",
  "--a-heading": "#18181b",
  "--a-nav-hover": "rgba(255,255,255,0.15)",
  "--a-chrome-text": "#ffffff",
  "--a-chrome-muted": "rgba(255,255,255,0.85)",
  "--a-accent": "#ee6e73",
  "--a-accent-hover": "#e35f66",
};

export default function AdminPage() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [overview, setOverview] = useState({ stats: null, users: [], foods: [], categories: [], orders: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  const [actionStatus, setActionStatus] = useState({ type: "", message: "" });
  const [showLoginBanner, setShowLoginBanner] = useState(true);
  const [foodModal, setFoodModal] = useState({ open: false, mode: "add", foodId: null, menuId: null });
  const [foodForm, setFoodForm] = useState({ fname: "", description: "", categoryId: "", image: "" });
  const [foodSaving, setFoodSaving] = useState(false);
  const [hiddenMenuIds, setHiddenMenuIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("adminHiddenMenuFoods") || "[]");
    } catch {
      return [];
    }
  });
  const [imageOverrides, setImageOverrides] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("adminFoodImageOverrides") || "{}");
    } catch {
      return {};
    }
  });

  const authUser = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("authUser") || "null");
    } catch {
      return null;
    }
  })();
  const token = sessionStorage.getItem("authToken");
  const isAdmin = authUser?.role === "admin";

  const loadOverview = async () => {
    if (!token || !isAdmin) return;
    try {
      setLoading(true);
      const res = await api.get("/admin/overview", { headers: { Authorization: `Bearer ${token}` } });
      setOverview({
        stats: res.data.stats,
        users: res.data.users || [],
        foods: res.data.foods || [],
        categories: res.data.categories || [],
        orders: res.data.orders || [],
      });
      setError("");
    } catch (e) {
      setError(e?.response?.data?.msg || "Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, [token, isAdmin]);

  useEffect(() => {
    if (!showLoginBanner) return undefined;
    const timer = setTimeout(() => setShowLoginBanner(false), 3500);
    return () => clearTimeout(timer);
  }, [showLoginBanner]);

  const pendingOrders = overview.orders.filter((order) => order.status === "pending");
  const progressOrders = overview.orders.filter((order) => order.status === "progress");
  const deliveredOrders = overview.orders.filter((order) => order.status === "delivered");

  const totalUsers = overview.stats?.totalUsers || 0;
  const totalFoods = overview.stats?.totalFoods || 0;
  const totalOrders = overview.stats?.totalOrders || 0;
  const totalRevenue =
    overview.stats?.totalRevenue ??
    overview.orders.reduce((sum, order) => {
      if (order.status !== "delivered") return sum;
      return sum + (Number(order.price) > 0 ? Number(order.price) : 250);
    }, 0);

  const adminFoodRows = useMemo(() => {
    const dbByName = new Map(
      (overview.foods || []).map((food) => [String(food.fname || "").trim().toLowerCase(), food])
    );
    const menuNames = new Set(MENU_FOODS.map((food) => food.fname.trim().toLowerCase()));

    const fromMenu = MENU_FOODS.filter((food) => !hiddenMenuIds.includes(food._id)).map((food) => {
      const db = dbByName.get(food.fname.trim().toLowerCase());
      const overrideImage = imageOverrides[food._id] || "";
      return {
        key: food._id,
        menuId: food._id,
        dbId: db?._id || null,
        fname: db?.fname || food.fname,
        description: db?.description || food.description,
        categoryName: db?.categoryId?.name || categoryLabel(food.categoryId),
        categoryId: db?.categoryId?._id || db?.categoryId || "",
        image: overrideImage || db?.image || food.image || "",
      };
    });

    const fromDbOnly = (overview.foods || [])
      .filter((food) => !menuNames.has(String(food.fname || "").trim().toLowerCase()))
      .map((food) => ({
        key: food._id,
        menuId: null,
        dbId: food._id,
        fname: food.fname,
        description: food.description || "",
        categoryName: food.categoryId?.name || "—",
        categoryId: food.categoryId?._id || food.categoryId || "",
        image: imageOverrides[food._id] || food.image || "",
      }));

    return [...fromMenu, ...fromDbOnly];
  }, [overview.foods, hiddenMenuIds, imageOverrides]);

  const handleConfirmOrder = async (orderMongoId) => {
    try {
      const res = await api.put(
        `/admin/orders/${orderMongoId}/confirm`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActionStatus({ type: "success", message: res?.data?.msg || "Order moved to progress." });
      await loadOverview();
    } catch (e) {
      setActionStatus({ type: "error", message: e?.response?.data?.msg || "Could not update order status." });
    }
  };

  const handleDeliverOrder = async (orderMongoId) => {
    try {
      const res = await api.put(
        `/admin/orders/${orderMongoId}/deliver`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActionStatus({ type: "success", message: res?.data?.msg || "Order moved to delivered." });
      await loadOverview();
    } catch (e) {
      setActionStatus({ type: "error", message: e?.response?.data?.msg || "Could not move order to delivered." });
    }
  };

  const openAddFoodModal = () => {
    setFoodForm({ fname: "", description: "", categoryId: "", image: "" });
    setFoodModal({ open: true, mode: "add", foodId: null, menuId: null });
  };

  const openEditFoodModal = (food) => {
    const matchedCategory =
      food.categoryId ||
      overview.categories?.find((c) => c.name?.toLowerCase() === food.categoryName?.toLowerCase())?._id ||
      "";
    setFoodForm({
      fname: food.fname || "",
      description: food.description || "",
      categoryId: matchedCategory,
      image: food.image || "",
    });
    setFoodModal({ open: true, mode: "edit", foodId: food.dbId, menuId: food.menuId });
  };

  const closeFoodModal = () => {
    setFoodModal({ open: false, mode: "add", foodId: null, menuId: null });
    setFoodForm({ fname: "", description: "", categoryId: "", image: "" });
  };

  const handleFoodImageFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setActionStatus({ type: "error", message: "Please choose an image file." });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setActionStatus({ type: "error", message: "Image must be under 2MB." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFoodForm((prev) => ({ ...prev, image: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  };

  const persistImageOverride = (key, image) => {
    if (!key) return;
    const next = { ...imageOverrides, [key]: image };
    if (!image) delete next[key];
    setImageOverrides(next);
    localStorage.setItem("adminFoodImageOverrides", JSON.stringify(next));
  };

  const handleSaveFood = async (event) => {
    event.preventDefault();
    if (!foodForm.fname.trim()) {
      setActionStatus({ type: "error", message: "Food name is required." });
      return;
    }
    if (!foodForm.categoryId) {
      setActionStatus({ type: "error", message: "Please select a category." });
      return;
    }

    const payload = {
      fname: foodForm.fname.trim(),
      description: foodForm.description.trim(),
      categoryId: foodForm.categoryId,
      image: foodForm.image.trim(),
    };

    try {
      setFoodSaving(true);
      if (foodModal.mode === "add" || !foodModal.foodId) {
        const res = await api.post("/admin/foods", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const savedId = res?.data?.food?._id;
        if (foodModal.menuId) persistImageOverride(foodModal.menuId, payload.image);
        else if (savedId) persistImageOverride(savedId, payload.image);
        setActionStatus({ type: "success", message: res?.data?.msg || "Food saved." });
      } else {
        const res = await api.put(`/admin/foods/${foodModal.foodId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        persistImageOverride(foodModal.menuId || foodModal.foodId, payload.image);
        setActionStatus({ type: "success", message: res?.data?.msg || "Food updated." });
      }
      closeFoodModal();
      await loadOverview();
    } catch (e) {
      setActionStatus({ type: "error", message: e?.response?.data?.msg || "Could not save food." });
    } finally {
      setFoodSaving(false);
    }
  };

  const handleDeleteFood = async (food) => {
    const confirmed = window.confirm(`Delete "${food.fname}"?`);
    if (!confirmed) return;

    try {
      if (food.dbId) {
        const res = await api.delete(`/admin/foods/${food.dbId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setActionStatus({ type: "success", message: res?.data?.msg || "Food deleted." });
        await loadOverview();
      }

      if (food.menuId) {
        const nextHidden = [...new Set([...hiddenMenuIds, food.menuId])];
        setHiddenMenuIds(nextHidden);
        localStorage.setItem("adminHiddenMenuFoods", JSON.stringify(nextHidden));
        if (!food.dbId) {
          setActionStatus({ type: "success", message: "Food removed from listing." });
        }
      }
    } catch (e) {
      setActionStatus({ type: "error", message: e?.response?.data?.msg || "Could not delete food." });
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("authUser");
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    navigate("/");
  };

  const sidebarItems = useMemo(
    () => [
      { id: "overview", label: "Overview", icon: "▦" },
      { id: "foods", label: "Foods", icon: "🍽" },
      { id: "categories", label: "Category", icon: "◼" },
      { id: "orders", label: "Orders", icon: "$" },
      { id: "about", label: "About", icon: "ℹ" },
    ],
    []
  );

  if (!token || !authUser) return <Navigate to="/" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const panelClass = "rounded-2xl border border-[color:var(--a-border)] bg-[var(--a-card)] p-5 shadow-lg";
  const tableHeadClass = "border-b border-[color:var(--a-border)] text-[var(--a-muted)]";
  const tableRowClass = "border-b border-[color:var(--a-border)] text-[var(--a-text)]";
  const chromeLink = "text-[var(--a-chrome-muted)] transition hover:text-[var(--a-chrome-text)]";

  return (
    <div
      className="flex min-h-screen bg-[var(--a-bg)] text-[var(--a-text)] transition-colors duration-300"
      style={isDark ? darkVars : lightVars}
    >
      <aside className="flex w-60 shrink-0 flex-col border-r border-white/15 bg-[var(--a-sidebar)] text-[var(--a-chrome-text)] sm:w-64">
        <div className="px-5 pt-5">
          <div className="mb-5 flex h-8 w-8 items-center justify-center rounded-md bg-white/20 text-sm font-bold text-white">R</div>
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-3 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/25 text-sm font-semibold text-white">AD</div>
            <div>
              <p className="text-sm font-semibold text-white">Admin</p>
              <p className="text-xs text-white/75">Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                activeSection === item.id
                  ? "border border-white/30 bg-white/20 text-white"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="w-5 text-center text-xs opacity-80">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-white/15 px-4 py-4">
          <Link to="/" className={`inline-flex items-center gap-2 text-sm ${chromeLink}`}>
            ⌂ Site
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-end gap-4 border-b border-white/15 bg-[var(--a-header)] px-5 py-3 text-sm text-[var(--a-chrome-muted)] sm:gap-5 sm:px-8">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/25"
            onClick={() => toggleTheme()}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              <>
                <span aria-hidden>☀</span> Light
              </>
            ) : (
              <>
                <span aria-hidden>☾</span> Dark
              </>
            )}
          </button>
          <Link to="/" className={chromeLink}>
            Home
          </Link>
          <Link to="/" className={chromeLink}>
            Main Site!
          </Link>
          <button type="button" className={chromeLink} onClick={() => setActiveSection("about")}>
            About
          </button>
          <button type="button" className={chromeLink} onClick={handleLogout}>
            Logout!
          </button>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
          {showLoginBanner && (
            <p
              className={`mb-5 rounded-xl border px-4 py-2 text-center text-sm ${
                isDark
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-emerald-300 bg-emerald-50 text-emerald-700"
              }`}
            >
              You have successfully Logged In!
            </p>
          )}

          {error && (
            <p
              className={`mb-4 rounded-xl border px-3 py-2 text-sm ${
                isDark ? "border-rose-500/30 bg-rose-500/10 text-rose-300" : "border-rose-300 bg-rose-50 text-rose-700"
              }`}
            >
              {error}
            </p>
          )}
          {actionStatus.message && (
            <p
              className={`mb-4 rounded-xl border px-3 py-2 text-sm ${
                actionStatus.type === "error"
                  ? isDark
                    ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                    : "border-rose-300 bg-rose-50 text-rose-700"
                  : isDark
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-emerald-300 bg-emerald-50 text-emerald-700"
              }`}
            >
              {actionStatus.message}
            </p>
          )}

          {loading ? (
            <p className="text-sm text-[var(--a-muted)]">Loading dashboard...</p>
          ) : activeSection === "overview" ? (
            <section>
              <h1 className="text-3xl font-semibold text-[var(--a-heading)] sm:text-4xl">
                Admin <span className="text-[#ee6e73] dark:text-[#f0a8ad]">Dashboard</span>
              </h1>
              <p className="mt-2 text-sm text-[var(--a-muted)]">Restaurant overview and key metrics</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <MetricCard
                  label="Total Users"
                  value={totalUsers}
                  iconBg={isDark ? "bg-[#421F37] text-rose-200" : "bg-[#ee6e73]/15 text-[#c94d55]"}
                  icon={<span className="text-sm">👤</span>}
                />
                <MetricCard
                  label="Total Foods"
                  value={totalFoods}
                  iconBg={isDark ? "bg-sky-600/20 text-sky-300" : "bg-sky-100 text-sky-700"}
                  icon={<span className="text-sm">🍽</span>}
                />
                <MetricCard
                  label="Total Orders"
                  value={totalOrders}
                  iconBg={isDark ? "bg-[#421F37] text-rose-200" : "bg-[#ee6e73]/15 text-[#c94d55]"}
                  icon={<span className="text-sm">🧾</span>}
                />
                <MetricCard
                  label="Pending Orders"
                  value={pendingOrders.length}
                  iconBg={isDark ? "bg-amber-600/20 text-amber-300" : "bg-amber-100 text-amber-700"}
                  icon={<span className="text-sm">⏳</span>}
                />
                <MetricCard
                  label="Total Revenue"
                  value={`$${Number(totalRevenue).toFixed(2)}`}
                  iconBg={isDark ? "bg-emerald-600/20 text-emerald-300" : "bg-emerald-100 text-emerald-700"}
                  icon={<span className="text-sm">$</span>}
                />
              </div>

              <div className="mt-6 space-y-6">
                <OverviewPie users={totalUsers} orders={totalOrders} revenue={totalRevenue} items={totalFoods} />
                <OverviewBarChart
                  orders={totalOrders}
                  pending={pendingOrders.length}
                  progress={progressOrders.length}
                  delivered={deliveredOrders.length}
                  isDark={isDark}
                />
              </div>
            </section>
          ) : activeSection === "foods" ? (
            <section className={panelClass}>
              <h2 className="text-center text-3xl font-semibold text-[var(--a-heading)]">Foods</h2>
              <div className="mt-5 flex items-center justify-between gap-3">
                <p className="text-sm text-[var(--a-muted)]">{adminFoodRows.length} items from Foods area</p>
                <button
                  type="button"
                  className="rounded-lg bg-[#ee6e73] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[#e35f66] dark:bg-[#421F37] dark:hover:bg-[#5a2a4a]"
                  onClick={openAddFoodModal}
                >
                  Add New
                </button>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className={tableHeadClass}>
                      <th className="py-3 pr-4 font-semibold">Name</th>
                      <th className="py-3 pr-4 font-semibold">Description</th>
                      <th className="py-3 pr-4 font-semibold">Category</th>
                      <th className="py-3 pr-2 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminFoodRows.map((food) => (
                      <tr key={food.key} className={tableRowClass}>
                        <td className="py-3 pr-4 align-top">
                          <div className="flex items-center gap-3">
                            <img
                              src={food.image || "/images/Snacks.jpg"}
                              alt={food.fname}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                            <span className="font-medium text-[var(--a-heading)]">{food.fname}</span>
                          </div>
                        </td>
                        <td className="max-w-md py-3 pr-4 align-top text-xs leading-5 text-[var(--a-muted)]">
                          {food.description || "—"}
                        </td>
                        <td className="py-3 pr-4 align-top">{food.categoryName || "—"}</td>
                        <td className="py-3 pr-2 align-top text-right">
                          <FoodActionMenu
                            onEdit={() => openEditFoodModal(food)}
                            onUpdate={() => openEditFoodModal(food)}
                            onDelete={() => handleDeleteFood(food)}
                          />
                        </td>
                      </tr>
                    ))}
                    {adminFoodRows.length === 0 && (
                      <tr>
                        <td className="py-6 text-center text-[var(--a-muted)]" colSpan={4}>
                          No foods found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          ) : activeSection === "categories" ? (
            <section className={panelClass}>
              <h2 className="text-2xl font-semibold text-[var(--a-heading)]">Categories</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {["Italian", "Chinese", "Snacks", "Bangladeshi", "Thai"].map((name) => (
                  <div
                    key={name}
                    className="rounded-xl border border-[color:var(--a-border)] bg-[var(--a-inset)] px-4 py-5 text-center text-lg font-medium text-[var(--a-text)]"
                  >
                    {name}
                  </div>
                ))}
              </div>
            </section>
          ) : activeSection === "orders" ? (
            <section className={`space-y-6 ${panelClass}`}>
              <div>
                <h2 className="text-2xl font-semibold text-[var(--a-heading)]">Pending Orders</h2>
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className={tableHeadClass}>
                        <th className="py-2 pr-4">Order ID</th>
                        <th className="py-2 pr-4">Food</th>
                        <th className="py-2 pr-4">Customer</th>
                        <th className="py-2 pr-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingOrders.map((order) => (
                        <tr key={order._id} className={tableRowClass}>
                          <td className="py-2 pr-4">{order.orderId}</td>
                          <td className="py-2 pr-4">{order.foodName}</td>
                          <td className="py-2 pr-4">{order.userId?.name || "-"}</td>
                          <td className="py-2 pr-4">
                            <button
                              type="button"
                              className="rounded bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                              onClick={() => handleConfirmOrder(order._id)}
                            >
                              Confirm
                            </button>
                          </td>
                        </tr>
                      ))}
                      {pendingOrders.length === 0 && (
                        <tr>
                          <td className="py-3 text-[var(--a-muted)]" colSpan={4}>
                            No pending orders.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-[var(--a-heading)]">In Progress</h2>
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className={tableHeadClass}>
                        <th className="py-2 pr-4">Order ID</th>
                        <th className="py-2 pr-4">Food</th>
                        <th className="py-2 pr-4">Customer</th>
                        <th className="py-2 pr-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {progressOrders.map((order) => (
                        <tr key={order._id} className={tableRowClass}>
                          <td className="py-2 pr-4">{order.orderId}</td>
                          <td className="py-2 pr-4">{order.foodName}</td>
                          <td className="py-2 pr-4">{order.userId?.name || "-"}</td>
                          <td className="py-2 pr-4">
                            <button
                              type="button"
                              className="rounded bg-sky-600 px-3 py-1 text-xs font-semibold text-white hover:bg-sky-700"
                              onClick={() => handleDeliverOrder(order._id)}
                            >
                              Delivered
                            </button>
                          </td>
                        </tr>
                      ))}
                      {progressOrders.length === 0 && (
                        <tr>
                          <td className="py-3 text-[var(--a-muted)]" colSpan={4}>
                            No in-progress orders.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-[var(--a-heading)]">Delivered</h2>
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className={tableHeadClass}>
                        <th className="py-2 pr-4">Order ID</th>
                        <th className="py-2 pr-4">Food</th>
                        <th className="py-2 pr-4">Customer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deliveredOrders.map((order) => (
                        <tr key={order._id} className={tableRowClass}>
                          <td className="py-2 pr-4">{order.orderId}</td>
                          <td className="py-2 pr-4">{order.foodName}</td>
                          <td className="py-2 pr-4">{order.userId?.name || "-"}</td>
                        </tr>
                      ))}
                      {deliveredOrders.length === 0 && (
                        <tr>
                          <td className="py-3 text-[var(--a-muted)]" colSpan={3}>
                            No delivered orders yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          ) : (
            <section className={`${panelClass} p-6`}>
              <h2 className="text-2xl font-semibold text-[var(--a-heading)]">About Admin Panel</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--a-muted)]">
                Use Overview for restaurant metrics, then manage Foods, Categories, and Orders from the sidebar.
              </p>
            </section>
          )}
        </main>
      </div>

      {foodModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[color:var(--a-border)] bg-[var(--a-card)] p-6 text-[var(--a-text)] shadow-2xl">
            <h3 className="text-xl font-semibold text-[var(--a-heading)]">
              {foodModal.mode === "add" ? "Add New Food" : "Update Food"}
            </h3>
            <form className="mt-5 space-y-4" onSubmit={handleSaveFood}>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--a-muted)]">Picture</label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="h-28 w-28 overflow-hidden rounded-xl border border-[color:var(--a-border)] bg-[var(--a-inset)]">
                    {foodForm.image ? (
                      <img src={foodForm.image} alt="Food preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center px-2 text-center text-[10px] text-[var(--a-muted)]">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <input
                      type="text"
                      value={foodForm.image.startsWith("data:") ? "" : foodForm.image}
                      onChange={(event) => setFoodForm((prev) => ({ ...prev, image: event.target.value }))}
                      className="w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-inset)] px-3 py-2 text-sm text-[var(--a-heading)] outline-none placeholder:text-[var(--a-muted)] focus:border-[#ee6e73] dark:focus:border-[#f0a8ad]"
                      placeholder="e.g. /images/Chinese/Chowmin(Chinese).jpg"
                    />
                    <label className="inline-flex cursor-pointer items-center rounded-lg border border-[color:var(--a-border)] bg-[var(--a-inset)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--a-heading)] transition hover:bg-[var(--a-nav-hover)]">
                      Choose Image
                      <input type="file" accept="image/*" className="hidden" onChange={handleFoodImageFile} />
                    </label>
                    {foodForm.image && (
                      <button
                        type="button"
                        className="ml-2 text-xs font-semibold text-rose-500"
                        onClick={() => setFoodForm((prev) => ({ ...prev, image: "" }))}
                      >
                        Remove
                      </button>
                    )}
                    <p className="text-[11px] text-[var(--a-muted)]">
                      Example: <span className="font-medium text-[var(--a-text)]">/images/Italian/Carbonara (Italian).jpg</span>
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--a-muted)]">Name</label>
                <input
                  type="text"
                  value={foodForm.fname}
                  onChange={(event) => setFoodForm((prev) => ({ ...prev, fname: event.target.value }))}
                  className="w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-inset)] px-3 py-2 text-sm text-[var(--a-heading)] outline-none focus:border-[#ee6e73] dark:focus:border-[#f0a8ad]"
                  placeholder="Food name"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--a-muted)]">Description</label>
                <textarea
                  value={foodForm.description}
                  onChange={(event) => setFoodForm((prev) => ({ ...prev, description: event.target.value }))}
                  className="min-h-[90px] w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-inset)] px-3 py-2 text-sm text-[var(--a-heading)] outline-none focus:border-[#ee6e73] dark:focus:border-[#f0a8ad]"
                  placeholder="Short description"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--a-muted)]">Category</label>
                <select
                  value={foodForm.categoryId}
                  onChange={(event) => setFoodForm((prev) => ({ ...prev, categoryId: event.target.value }))}
                  className="w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-inset)] px-3 py-2 text-sm text-[var(--a-heading)] outline-none focus:border-[#ee6e73] dark:focus:border-[#f0a8ad]"
                  required
                >
                  <option value="">Select category</option>
                  {(overview.categories || []).map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {(overview.categories || []).length === 0 && (
                  <p className="mt-1 text-xs text-amber-500">No categories found. Seed categories first.</p>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--a-muted)] transition hover:bg-[var(--a-nav-hover)]"
                  onClick={closeFoodModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={foodSaving}
                  className="rounded-lg bg-[#ee6e73] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[#e35f66] disabled:opacity-60 dark:bg-[#421F37] dark:hover:bg-[#5a2a4a]"
                >
                  {foodSaving ? "Saving..." : foodModal.mode === "add" ? "Add Food" : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
