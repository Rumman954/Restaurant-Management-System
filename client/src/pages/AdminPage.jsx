import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../lib/api";

export default function AdminPage() {
  const [overview, setOverview] = useState({ stats: null, users: [], foods: [], orders: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const authUser = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("authUser") || "null");
    } catch {
      return null;
    }
  })();
  const token = sessionStorage.getItem("authToken");
  const isAdmin = authUser?.role === "admin";

  useEffect(() => {
    if (!token || !isAdmin) return;

    api
      .get("/admin/overview", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setOverview(res.data);
        setError("");
      })
      .catch((e) => {
        setError(e?.response?.data?.msg || "Failed to load admin data.");
      })
      .finally(() => setLoading(false));
  }, [token, isAdmin]);

  if (!token || !authUser) return <Navigate to="/" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-10">
      <h2 className="text-3xl font-semibold text-zinc-800 sm:text-4xl">Admin Dashboard</h2>
      <p className="mt-2 text-sm text-zinc-600">Manage users, foods, and placed orders.</p>

      {error && <p className="mt-4 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      {loading ? (
        <p className="mt-6 text-sm text-zinc-600">Loading dashboard...</p>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded border border-zinc-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-zinc-500">Total Users</p>
              <p className="mt-1 text-2xl font-semibold text-zinc-800">{overview.stats?.totalUsers || 0}</p>
            </div>
            <div className="rounded border border-zinc-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-zinc-500">Total Foods</p>
              <p className="mt-1 text-2xl font-semibold text-zinc-800">{overview.stats?.totalFoods || 0}</p>
            </div>
            <div className="rounded border border-zinc-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-zinc-500">Total Orders</p>
              <p className="mt-1 text-2xl font-semibold text-zinc-800">{overview.stats?.totalOrders || 0}</p>
            </div>
          </div>

          <div className="mt-7 rounded border border-zinc-200 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-zinc-800">Users</h3>
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
                    <tr key={user._id} className="border-b border-zinc-100">
                      <td className="py-2 pr-4">{user.name}</td>
                      <td className="py-2 pr-4">{user.email}</td>
                      <td className="py-2 pr-4">{user.phone || "-"}</td>
                      <td className="py-2 pr-4 capitalize">{user.role || "customer"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

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

          <div className="mt-7 rounded border border-zinc-200 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-zinc-800">Orders</h3>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-600">
                    <th className="py-2 pr-4">Order ID</th>
                    <th className="py-2 pr-4">Food</th>
                    <th className="py-2 pr-4">Customer</th>
                    <th className="py-2 pr-4">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.orders.map((order) => (
                    <tr key={order._id} className="border-b border-zinc-100">
                      <td className="py-2 pr-4">{order.orderId}</td>
                      <td className="py-2 pr-4">{order.foodName}</td>
                      <td className="py-2 pr-4">{order.userId?.name || "-"}</td>
                      <td className="py-2 pr-4">{order.userId?.email || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
