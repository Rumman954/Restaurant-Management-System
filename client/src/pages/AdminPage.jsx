import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function AdminPage() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState({ stats: null, users: [], foods: [], orders: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("dashboard");
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
    const timer = setTimeout(() => setShowLoginBanner(false), 4000);
    return () => clearTimeout(timer);
  }, [showLoginBanner]);

  const pendingOrders = overview.orders.filter((order) => order.status === "pending");
  const progressOrders = overview.orders.filter((order) => order.status === "progress");
  const deliveredOrders = overview.orders.filter((order) => order.status === "delivered");

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

  if (!token || !authUser) return <Navigate to="/" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "foods", label: "Foods" },
    { id: "categories", label: "Category" },
    { id: "orders", label: "Orders" },
    { id: "about", label: "About" },
  ];

  return (
    <div className="flex min-h-screen bg-[#ee8a84] text-white">
      <aside className="flex w-56 shrink-0 flex-col bg-[#c0392b] sm:w-64">
        <div className="px-5 py-6">
          <button type="button" className="text-left text-3xl font-semibold tracking-wide" onClick={() => setActiveSection("dashboard")}>
            Resturant
          </button>
        </div>
        <nav className="mt-2 flex flex-col gap-3 px-3">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`rounded-sm bg-black px-4 py-3 text-left text-lg font-medium transition hover:bg-zinc-900 ${
                activeSection === item.id ? "ring-1 ring-white/80" : ""
              }`}
              onClick={() => setActiveSection(item.id)}
            >
              {item.label}
              {activeSection === item.id && <span className="mt-2 block h-px w-full bg-white/90" />}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-end gap-5 border-b border-black/20 px-5 py-3 text-sm font-medium sm:gap-8 sm:px-8">
          <Link to="/" className="transition hover:text-white/80">
            Home
          </Link>
          <Link to="/" className="transition hover:text-white/80">
            Main Site!
          </Link>
          <button type="button" className="transition hover:text-white/80" onClick={() => setActiveSection("about")}>
            About
          </button>
          <button type="button" className="transition hover:text-white/80" onClick={handleLogout}>
            Logout!
          </button>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
          {showLoginBanner && (
            <p className="mb-5 bg-black/45 px-4 py-2 text-center text-sm font-medium text-white">
              You have successfully Logged In!
            </p>
          )}

          {error && <p className="mb-4 rounded bg-black/40 px-3 py-2 text-sm">{error}</p>}
          {actionStatus.message && (
            <p className={`mb-4 rounded px-3 py-2 text-sm ${actionStatus.type === "error" ? "bg-black/50" : "bg-emerald-700/70"}`}>
              {actionStatus.message}
            </p>
          )}

          {loading ? (
            <p className="text-sm text-white/90">Loading dashboard...</p>
          ) : activeSection === "dashboard" ? (
            <div className="mx-auto mt-6 flex max-w-4xl flex-col items-center rounded-2xl bg-[#8b1a1a]/55 px-6 py-12 shadow-lg sm:px-10 sm:py-16">
              <h1 className="mb-10 text-4xl font-semibold tracking-wide sm:text-5xl">Dashboard</h1>
              <div className="flex w-full flex-col items-stretch justify-center gap-4 sm:flex-row sm:gap-5">
                {[
                  { id: "foods", label: "Foods" },
                  { id: "categories", label: "Categories" },
                  { id: "orders", label: "Orders" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="min-w-[140px] rounded-xl border border-white bg-linear-to-b from-[#e35d5b] to-[#c0392b] px-8 py-4 text-lg font-semibold shadow-md transition hover:-translate-y-0.5 hover:brightness-110"
                    onClick={() => setActiveSection(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="mt-10 grid w-full gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-black/25 px-4 py-3 text-center">
                  <p className="text-xs uppercase tracking-wide text-white/70">Users</p>
                  <p className="mt-1 text-2xl font-semibold">{overview.stats?.totalUsers || 0}</p>
                </div>
                <div className="rounded-lg bg-black/25 px-4 py-3 text-center">
                  <p className="text-xs uppercase tracking-wide text-white/70">Foods</p>
                  <p className="mt-1 text-2xl font-semibold">{overview.stats?.totalFoods || 0}</p>
                </div>
                <div className="rounded-lg bg-black/25 px-4 py-3 text-center">
                  <p className="text-xs uppercase tracking-wide text-white/70">Orders</p>
                  <p className="mt-1 text-2xl font-semibold">{overview.stats?.totalOrders || 0}</p>
                </div>
              </div>
            </div>
          ) : activeSection === "foods" ? (
            <section className="rounded-xl bg-[#8b1a1a]/45 p-5 shadow-md">
              <h2 className="text-2xl font-semibold">Foods</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/30">
                      <th className="py-2 pr-4">Food</th>
                      <th className="py-2 pr-4">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.foods.map((food) => (
                      <tr key={food._id} className="border-b border-white/15">
                        <td className="py-2 pr-4">{food.fname}</td>
                        <td className="py-2 pr-4">{food.categoryId?.name || "-"}</td>
                      </tr>
                    ))}
                    {overview.foods.length === 0 && (
                      <tr>
                        <td className="py-3 text-white/80" colSpan={2}>
                          No foods in database yet. Customers still see the local menu images.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          ) : activeSection === "categories" ? (
            <section className="rounded-xl bg-[#8b1a1a]/45 p-5 shadow-md">
              <h2 className="text-2xl font-semibold">Categories</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {["Italian", "Chinese", "Snacks", "Bangladeshi", "Thai"].map((name) => (
                  <div key={name} className="rounded-lg border border-white/30 bg-black/20 px-4 py-5 text-center text-lg font-medium">
                    {name}
                  </div>
                ))}
              </div>
            </section>
          ) : activeSection === "orders" ? (
            <section className="space-y-6 rounded-xl bg-[#8b1a1a]/45 p-5 shadow-md">
              <div>
                <h2 className="text-2xl font-semibold">Pending Orders</h2>
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/30">
                        <th className="py-2 pr-4">Order ID</th>
                        <th className="py-2 pr-4">Food</th>
                        <th className="py-2 pr-4">Customer</th>
                        <th className="py-2 pr-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingOrders.map((order) => (
                        <tr key={order._id} className="border-b border-white/15">
                          <td className="py-2 pr-4">{order.orderId}</td>
                          <td className="py-2 pr-4">{order.foodName}</td>
                          <td className="py-2 pr-4">{order.userId?.name || "-"}</td>
                          <td className="py-2 pr-4">
                            <button
                              type="button"
                              className="rounded bg-emerald-600 px-3 py-1 text-xs font-semibold hover:bg-emerald-700"
                              onClick={() => handleConfirmOrder(order._id)}
                            >
                              Confirm
                            </button>
                          </td>
                        </tr>
                      ))}
                      {pendingOrders.length === 0 && (
                        <tr>
                          <td className="py-3 text-white/80" colSpan={4}>
                            No pending orders.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold">In Progress</h2>
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/30">
                        <th className="py-2 pr-4">Order ID</th>
                        <th className="py-2 pr-4">Food</th>
                        <th className="py-2 pr-4">Customer</th>
                        <th className="py-2 pr-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {progressOrders.map((order) => (
                        <tr key={order._id} className="border-b border-white/15">
                          <td className="py-2 pr-4">{order.orderId}</td>
                          <td className="py-2 pr-4">{order.foodName}</td>
                          <td className="py-2 pr-4">{order.userId?.name || "-"}</td>
                          <td className="py-2 pr-4">
                            <button
                              type="button"
                              className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold hover:bg-blue-700"
                              onClick={() => handleDeliverOrder(order._id)}
                            >
                              Delivered
                            </button>
                          </td>
                        </tr>
                      ))}
                      {progressOrders.length === 0 && (
                        <tr>
                          <td className="py-3 text-white/80" colSpan={4}>
                            No in-progress orders.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold">Delivered</h2>
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/30">
                        <th className="py-2 pr-4">Order ID</th>
                        <th className="py-2 pr-4">Food</th>
                        <th className="py-2 pr-4">Customer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deliveredOrders.map((order) => (
                        <tr key={order._id} className="border-b border-white/15">
                          <td className="py-2 pr-4">{order.orderId}</td>
                          <td className="py-2 pr-4">{order.foodName}</td>
                          <td className="py-2 pr-4">{order.userId?.name || "-"}</td>
                        </tr>
                      ))}
                      {deliveredOrders.length === 0 && (
                        <tr>
                          <td className="py-3 text-white/80" colSpan={3}>
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
            <section className="rounded-xl bg-[#8b1a1a]/45 p-6 shadow-md">
              <h2 className="text-2xl font-semibold">About Admin Panel</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/90">
                Manage restaurant foods, categories, and customer orders from this dashboard. Use the sidebar or the
                dashboard buttons to switch sections. Click <strong>Main Site!</strong> to return to the public website.
              </p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
