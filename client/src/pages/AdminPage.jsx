import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useTheme } from "../context/ThemeContext";

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
  const gradient = `conic-gradient(#38bdf8 0 ${usersPct}%, #a855f7 ${usersPct}% ${usersPct + ordersPct}%, #22c55e ${usersPct + ordersPct}% 100%)`;

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
            <span className="h-3 w-3 rounded-full bg-violet-500" /> Orders: {orders} ({Math.round(ordersPct)}%)
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500" /> Revenue: ${Number(revenue).toFixed(2)} ({Math.round(revenuePct)}%)
          </span>
        </div>
      </div>
    </div>
  );
}

const BAR_COLORS = ["#7c3aed", "#0ea5e9", "#14b8a6", "#f59e0b", "#22c55e"];

function OverviewBarChart({ pending, progress, delivered, foods, categories, isDark }) {
  const bars = [
    { label: "Pending", value: pending },
    { label: "Progress", value: progress },
    { label: "Delivered", value: delivered },
    { label: "Foods", value: foods },
    { label: "Categories", value: categories },
  ].sort((a, b) => b.value - a.value);

  const max = Math.max(...bars.map((b) => b.value), 1);

  return (
    <div className="rounded-2xl border border-[color:var(--a-border)] bg-[var(--a-card)] p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-[var(--a-heading)]">Status & Catalog</h3>
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
                <div
                  className="w-full rounded-t-sm transition-all duration-500"
                  style={{
                    height: `${Math.max((bar.value / max) * 100, bar.value > 0 ? 6 : 2)}%`,
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
  "--a-sidebar": "#10141c",
  "--a-card": "#151a24",
  "--a-inset": "#0b0e14",
  "--a-border": "rgba(255,255,255,0.05)",
  "--a-text": "#e4e4e7",
  "--a-muted": "#a1a1aa",
  "--a-heading": "#ffffff",
  "--a-nav-hover": "rgba(255,255,255,0.05)",
};

const lightVars = {
  "--a-bg": "#f4f4f5",
  "--a-sidebar": "#ffffff",
  "--a-card": "#ffffff",
  "--a-inset": "#f4f4f5",
  "--a-border": "rgba(0,0,0,0.08)",
  "--a-text": "#3f3f46",
  "--a-muted": "#71717a",
  "--a-heading": "#18181b",
  "--a-nav-hover": "rgba(0,0,0,0.04)",
};

export default function AdminPage() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [overview, setOverview] = useState({ stats: null, users: [], foods: [], orders: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  const [actionStatus, setActionStatus] = useState({ type: "", message: "" });
  const [showLoginBanner, setShowLoginBanner] = useState(true);

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
      setOverview(res.data);
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
  const totalCategories = useMemo(() => {
    const names = new Set(
      overview.foods.map((food) => food.categoryId?.name || food.categoryId).filter(Boolean)
    );
    return names.size;
  }, [overview.foods]);

  const totalUsers = overview.stats?.totalUsers || 0;
  const totalFoods = overview.stats?.totalFoods || 0;
  const totalOrders = overview.stats?.totalOrders || 0;
  const totalRevenue =
    overview.stats?.totalRevenue ??
    overview.orders.reduce((sum, order) => {
      if (order.status !== "delivered") return sum;
      return sum + (Number(order.price) > 0 ? Number(order.price) : 250);
    }, 0);

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
  const linkHover = "transition hover:text-[var(--a-heading)]";

  return (
    <div
      className="flex min-h-screen bg-[var(--a-bg)] text-[var(--a-text)] transition-colors duration-300"
      style={isDark ? darkVars : lightVars}
    >
      <aside className="flex w-60 shrink-0 flex-col border-r border-[color:var(--a-border)] bg-[var(--a-sidebar)] sm:w-64">
        <div className="px-5 pt-5">
          <div className="mb-5 flex h-8 w-8 items-center justify-center rounded-md bg-orange-500 text-sm font-bold text-white">R</div>
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-[color:var(--a-border)] bg-[var(--a-card)] px-3 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-sm font-semibold text-white">AD</div>
            <div>
              <p className="text-sm font-semibold text-[var(--a-heading)]">Admin</p>
              <p className="text-xs text-[var(--a-muted)]">Admin</p>
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
                  ? isDark
                    ? "border border-violet-500/40 bg-violet-600/20 text-violet-200"
                    : "border border-violet-300 bg-violet-50 text-violet-700"
                  : "text-[var(--a-muted)] hover:bg-[var(--a-nav-hover)] hover:text-[var(--a-heading)]"
              }`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="w-5 text-center text-xs opacity-80">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-[color:var(--a-border)] px-4 py-4">
          <Link to="/" className={`inline-flex items-center gap-2 text-sm text-[var(--a-muted)] ${linkHover}`}>
            ⌂ Site
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-end gap-4 border-b border-[color:var(--a-border)] px-5 py-3 text-sm text-[var(--a-muted)] sm:gap-5 sm:px-8">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--a-border)] bg-[var(--a-card)] px-3 py-1.5 text-xs font-semibold text-[var(--a-heading)] transition hover:opacity-90"
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
          <Link to="/" className={linkHover}>
            Home
          </Link>
          <Link to="/" className={linkHover}>
            Main Site!
          </Link>
          <button type="button" className={linkHover} onClick={() => setActiveSection("about")}>
            About
          </button>
          <button type="button" className={linkHover} onClick={handleLogout}>
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
                Admin <span className="text-violet-500">Dashboard</span>
              </h1>
              <p className="mt-2 text-sm text-[var(--a-muted)]">Restaurant overview and key metrics</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <MetricCard
                  label="Total Users"
                  value={totalUsers}
                  iconBg={isDark ? "bg-violet-600/20 text-violet-300" : "bg-violet-100 text-violet-700"}
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
                  iconBg={isDark ? "bg-violet-600/20 text-violet-300" : "bg-violet-100 text-violet-700"}
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
                  pending={pendingOrders.length}
                  progress={progressOrders.length}
                  delivered={deliveredOrders.length}
                  foods={totalFoods}
                  categories={totalCategories}
                  isDark={isDark}
                />
              </div>
            </section>
          ) : activeSection === "foods" ? (
            <section className={panelClass}>
              <h2 className="text-2xl font-semibold text-[var(--a-heading)]">Foods</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className={tableHeadClass}>
                      <th className="py-2 pr-4">Food</th>
                      <th className="py-2 pr-4">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.foods.map((food) => (
                      <tr key={food._id} className={tableRowClass}>
                        <td className="py-2 pr-4">{food.fname}</td>
                        <td className="py-2 pr-4">{food.categoryId?.name || "-"}</td>
                      </tr>
                    ))}
                    {overview.foods.length === 0 && (
                      <tr>
                        <td className="py-3 text-[var(--a-muted)]" colSpan={2}>
                          No foods in database yet.
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
    </div>
  );
}
