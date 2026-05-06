import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../lib/api";

export default function AdminPage() {
  const [overview, setOverview] = useState({ stats: null, users: [], foods: [], orders: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("users");
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionStatus, setActionStatus] = useState({ type: "", message: "" });

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

  const pendingOrders = overview.orders.filter((order) => order.status === "pending");
  const progressOrders = overview.orders.filter((order) => order.status === "progress");
  const deliveredOrders = overview.orders.filter((order) => order.status === "delivered");
  const selectedUserOrders = selectedUser
    ? overview.orders.filter((order) => order.userId?._id === selectedUser._id)
    : [];

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

  if (!token || !authUser) return <Navigate to="/" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-10">
      <h2 className="text-3xl font-semibold text-zinc-800 sm:text-4xl">Admin Dashboard</h2>
      <p className="mt-2 text-sm text-zinc-600">Manage users, foods, and placed orders.</p>

      {error && <p className="mt-4 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      {actionStatus.message && (
        <p className={`mt-4 rounded border px-3 py-2 text-sm ${actionStatus.type === "error" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
          {actionStatus.message}
        </p>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-zinc-600">Loading dashboard...</p>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <button
              type="button"
              className={`rounded border p-4 text-left shadow-sm transition ${activeSection === "users" ? "border-rose-300 bg-rose-50" : "border-zinc-200 bg-white hover:border-zinc-300"}`}
              onClick={() => setActiveSection("users")}
            >
              <p className="text-sm text-zinc-500">Total Users</p>
              <p className="mt-1 text-2xl font-semibold text-zinc-800">{overview.stats?.totalUsers || 0}</p>
            </button>
            <button
              type="button"
              className={`rounded border p-4 text-left shadow-sm transition ${activeSection === "foods" ? "border-rose-300 bg-rose-50" : "border-zinc-200 bg-white hover:border-zinc-300"}`}
              onClick={() => setActiveSection("foods")}
            >
              <p className="text-sm text-zinc-500">Total Foods</p>
              <p className="mt-1 text-2xl font-semibold text-zinc-800">{overview.stats?.totalFoods || 0}</p>
            </button>
            <button
              type="button"
              className={`rounded border p-4 text-left shadow-sm transition ${activeSection === "orders" ? "border-rose-300 bg-rose-50" : "border-zinc-200 bg-white hover:border-zinc-300"}`}
              onClick={() => setActiveSection("orders")}
            >
              <p className="text-sm text-zinc-500">Total Orders</p>
              <p className="mt-1 text-2xl font-semibold text-zinc-800">{overview.stats?.totalOrders || 0}</p>
            </button>
          </div>

          {activeSection === "users" && (
            <div className="mt-7 rounded border border-zinc-200 bg-white p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-zinc-800">Users</h3>
              <p className="mt-1 text-sm text-zinc-600">Click any user account to view full details and total orders.</p>
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 text-zinc-600">
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Email</th>
                      <th className="py-2 pr-4">Phone</th>
                      <th className="py-2 pr-4">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.users.map((user) => (
                      <tr
                        key={user._id}
                        className="cursor-pointer border-b border-zinc-100 transition hover:bg-zinc-50"
                        onClick={() => setSelectedUser(user)}
                      >
                        <td className="py-2 pr-4">{user.name}</td>
                        <td className="py-2 pr-4">{user.email}</td>
                        <td className="py-2 pr-4">{user.phone || "-"}</td>
                        <td className="py-2 pr-4 capitalize">{user.role || "customer"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedUser && (
                <div className="mt-5 rounded border border-zinc-200 bg-zinc-50 p-4">
                  <h4 className="text-base font-semibold text-zinc-800">Account Details</h4>
                  <div className="mt-2 grid gap-2 text-sm text-zinc-700 sm:grid-cols-2">
                    <p><span className="font-semibold">Name:</span> {selectedUser.name}</p>
                    <p><span className="font-semibold">Email:</span> {selectedUser.email}</p>
                    <p><span className="font-semibold">Phone:</span> {selectedUser.phone || "-"}</p>
                    <p><span className="font-semibold">Role:</span> {selectedUser.role || "customer"}</p>
                    <p><span className="font-semibold">Total Orders:</span> {selectedUserOrders.length}</p>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-zinc-800">Orders by this user</p>
                    {selectedUserOrders.length === 0 ? (
                      <p className="mt-1 text-sm text-zinc-600">No orders found.</p>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {selectedUserOrders.map((order) => (
                          <div key={order._id} className="rounded border border-zinc-200 bg-white px-3 py-2 text-sm">
                            <p><span className="font-semibold">Order ID:</span> {order.orderId}</p>
                            <p><span className="font-semibold">Food:</span> {order.foodName}</p>
                            <p><span className="font-semibold">Status:</span> {order.status || "pending"}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === "foods" && (
            <div className="mt-7 rounded border border-zinc-200 bg-white p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-zinc-800">Foods</h3>
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 text-zinc-600">
                      <th className="py-2 pr-4">Food</th>
                      <th className="py-2 pr-4">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.foods.map((food) => (
                      <tr key={food._id} className="border-b border-zinc-100">
                        <td className="py-2 pr-4">{food.fname}</td>
                        <td className="py-2 pr-4">{food.categoryId?.name || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === "orders" && (
            <div className="mt-7 rounded border border-zinc-200 bg-white p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-zinc-800">Recent Pending Orders</h3>
              <p className="mt-1 text-sm text-zinc-600">Only pending orders are shown here. Click confirm to move them to progress.</p>
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 text-zinc-600">
                      <th className="py-2 pr-4">Order ID</th>
                      <th className="py-2 pr-4">Food</th>
                      <th className="py-2 pr-4">Customer</th>
                      <th className="py-2 pr-4">Email</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingOrders.map((order) => (
                      <tr key={order._id} className="border-b border-zinc-100">
                        <td className="py-2 pr-4">{order.orderId}</td>
                        <td className="py-2 pr-4">{order.foodName}</td>
                        <td className="py-2 pr-4">{order.userId?.name || "-"}</td>
                        <td className="py-2 pr-4">{order.userId?.email || "-"}</td>
                        <td className="py-2 pr-4 capitalize">{order.status || "pending"}</td>
                        <td className="py-2 pr-4">
                          <button
                            type="button"
                            className="rounded bg-emerald-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-700"
                            onClick={() => handleConfirmOrder(order._id)}
                          >
                            Confirm
                          </button>
                        </td>
                      </tr>
                    ))}
                    {pendingOrders.length === 0 && (
                      <tr>
                        <td className="py-3 text-sm text-zinc-500" colSpan={6}>
                          No pending orders right now.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-zinc-800">In Progress Orders</h3>
                <p className="mt-1 text-sm text-zinc-600">These are confirmed orders currently in progress.</p>
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 text-zinc-600">
                        <th className="py-2 pr-4">Order ID</th>
                        <th className="py-2 pr-4">Food</th>
                        <th className="py-2 pr-4">Customer</th>
                        <th className="py-2 pr-4">Email</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2 pr-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {progressOrders.map((order) => (
                        <tr key={order._id} className="border-b border-zinc-100">
                          <td className="py-2 pr-4">{order.orderId}</td>
                          <td className="py-2 pr-4">{order.foodName}</td>
                          <td className="py-2 pr-4">{order.userId?.name || "-"}</td>
                          <td className="py-2 pr-4">{order.userId?.email || "-"}</td>
                          <td className="py-2 pr-4">
                            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">progress</span>
                          </td>
                          <td className="py-2 pr-4">
                            <button
                              type="button"
                              className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-blue-700"
                              onClick={() => handleDeliverOrder(order._id)}
                            >
                              Delivered
                            </button>
                          </td>
                        </tr>
                      ))}
                      {progressOrders.length === 0 && (
                        <tr>
                          <td className="py-3 text-sm text-zinc-500" colSpan={6}>
                            No in-progress orders yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-zinc-800">Delivered Orders</h3>
                <p className="mt-1 text-sm text-zinc-600">Orders that are fully delivered.</p>
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 text-zinc-600">
                        <th className="py-2 pr-4">Order ID</th>
                        <th className="py-2 pr-4">Food</th>
                        <th className="py-2 pr-4">Customer</th>
                        <th className="py-2 pr-4">Email</th>
                        <th className="py-2 pr-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deliveredOrders.map((order) => (
                        <tr key={order._id} className="border-b border-zinc-100">
                          <td className="py-2 pr-4">{order.orderId}</td>
                          <td className="py-2 pr-4">{order.foodName}</td>
                          <td className="py-2 pr-4">{order.userId?.name || "-"}</td>
                          <td className="py-2 pr-4">{order.userId?.email || "-"}</td>
                          <td className="py-2 pr-4">
                            <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">delivered</span>
                          </td>
                        </tr>
                      ))}
                      {deliveredOrders.length === 0 && (
                        <tr>
                          <td className="py-3 text-sm text-zinc-500" colSpan={5}>
                            No delivered orders yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
