import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { formatPrice, formatAmount } from "../lib/formatPrice";
import { useTheme } from "../context/ThemeContext";
import { MENU_FOODS, categoryImageFor, categoryLabel } from "../data/menuCatalog";

const ORDER_STATUS_OPTIONS = [
  { value: "pending", label: "Confirm" },
  { value: "progress", label: "Pending" },
  { value: "delivered", label: "Delivered" },
];

function orderStatusLabel(status) {
  return ORDER_STATUS_OPTIONS.find((option) => option.value === status)?.label || status;
}

function orderAmount(order) {
  const total = Number(order?.total);
  if (Number.isFinite(total) && total > 0) return total;
  const price = Number(order?.price);
  return Number.isFinite(price) && price > 0 ? price : 0;
}

function paymentMethodLabel(method) {
  if (method === "online") return "Online";
  if (method === "cod") return "Cash on Delivery";
  if (method === "pickup") return "Pickup";
  return method || "—";
}

function paymentStatusBadge(order) {
  const paid = order.paymentStatus === "paid" || order.paymentMethod === "online";
  if (paid) {
    return (
      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
        Paid
      </span>
    );
  }
  return (
    <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-amber-700 dark:bg-amber-950 dark:text-amber-300">
      Unpaid
    </span>
  );
}

function OrderStatusSelect({ value, onChange, disabled = false }) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-lg border border-[color:var(--a-border)] bg-[var(--a-bg)] px-2 py-1.5 text-xs font-medium text-[var(--a-heading)] outline-none focus:ring-2 focus:ring-[#ee6e73]/30 dark:focus:ring-[#421F37]/40"
    >
      {ORDER_STATUS_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

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
            <span className="h-3 w-3 rounded-full bg-emerald-500" /> Revenue: {formatPrice(revenue) || "৳0"} ({Math.round(revenuePct)}%)
          </span>
        </div>
      </div>
    </div>
  );
}

const BAR_COLORS = ["#ee6e73", "#f59e0b", "#0ea5e9", "#22c55e"];

let exclusiveMenuClose = null;

function closeExclusiveMenu() {
  if (typeof exclusiveMenuClose === "function") {
    exclusiveMenuClose();
    exclusiveMenuClose = null;
  }
}

function getMenuPlacement(triggerEl, menuHeight = 130) {
  if (!triggerEl) return "below";
  const rect = triggerEl.getBoundingClientRect();
  const viewportH = window.innerHeight || 800;
  const spaceAbove = rect.top;
  const spaceBelow = viewportH - rect.bottom;
  const centerRatio = (rect.top + rect.height / 2) / viewportH;

  // Lower side of screen → open upward
  if (centerRatio > 0.66 || (spaceBelow < menuHeight && spaceAbove > spaceBelow)) {
    return "above";
  }
  // Upper side → open downward
  if (centerRatio < 0.34 || spaceAbove < menuHeight) {
    return "below";
  }
  // Middle → align to middle of the trigger
  return "middle";
}

function menuPlacementClass(placement) {
  if (placement === "above") return "bottom-full mb-1";
  if (placement === "middle") return "top-1/2 -translate-y-1/2";
  return "top-full mt-1";
}

function useExclusiveActionMenu(menuHeight = 130) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState("below");
  const triggerRef = useRef(null);
  const openRef = useRef(false);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const closeMenu = () => {
    setOpen(false);
    if (exclusiveMenuClose === closeMenu) exclusiveMenuClose = null;
  };

  const toggleMenu = (event) => {
    event.stopPropagation();
    if (openRef.current) {
      closeMenu();
      return;
    }
    closeExclusiveMenu();
    setPlacement(getMenuPlacement(triggerRef.current, menuHeight));
    setOpen(true);
    exclusiveMenuClose = closeMenu;
  };

  useEffect(() => {
    if (!open) return undefined;
    setPlacement(getMenuPlacement(triggerRef.current, menuHeight));
    const onOutsideClick = () => closeMenu();
    const reposition = () => setPlacement(getMenuPlacement(triggerRef.current, menuHeight));
    window.addEventListener("click", onOutsideClick);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      window.removeEventListener("click", onOutsideClick);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open, menuHeight]);

  useEffect(() => () => {
    if (exclusiveMenuClose === closeMenu) exclusiveMenuClose = null;
  }, []);

  return { open, closeMenu, toggleMenu, placement, triggerRef };
}

function FoodActionMenu({ onEdit, onUpdate, onDelete }) {
  const { open, closeMenu, toggleMenu, placement, triggerRef } = useExclusiveActionMenu(130);

  return (
    <div className="relative inline-flex justify-end" ref={triggerRef}>
      <button
        type="button"
        className="rounded-md px-2 py-1 text-lg leading-none text-[var(--a-muted)] transition hover:bg-[var(--a-nav-hover)] hover:text-[var(--a-heading)]"
        aria-label="Food actions"
        onClick={toggleMenu}
      >
        ⋮
      </button>
      {open && (
        <div
          className={`absolute right-0 z-30 min-w-[128px] overflow-hidden rounded-lg border border-[color:var(--a-border)] bg-[var(--a-card)] py-1 shadow-xl ${menuPlacementClass(placement)}`}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="block w-full px-3 py-2 text-left text-sm text-[var(--a-text)] transition hover:bg-[var(--a-nav-hover)]"
            onClick={() => {
              closeMenu();
              onEdit();
            }}
          >
            Edit
          </button>
          <button
            type="button"
            className="block w-full px-3 py-2 text-left text-sm text-[var(--a-text)] transition hover:bg-[var(--a-nav-hover)]"
            onClick={() => {
              closeMenu();
              onUpdate();
            }}
          >
            Update
          </button>
          <button
            type="button"
            className="block w-full px-3 py-2 text-left text-sm text-rose-500 transition hover:bg-[var(--a-nav-hover)]"
            onClick={() => {
              closeMenu();
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

function CategoryActionMenu({ onEdit, onDelete }) {
  const { open, closeMenu, toggleMenu, placement, triggerRef } = useExclusiveActionMenu(96);

  return (
    <div className="relative z-30 inline-flex shrink-0 justify-end" ref={triggerRef}>
      <button
        type="button"
        className="rounded-md px-2 py-1 text-lg leading-none text-[var(--a-muted)] transition hover:bg-[var(--a-nav-hover)] hover:text-[var(--a-heading)]"
        aria-label="Category actions"
        onClick={toggleMenu}
      >
        ⋮
      </button>
      {open && (
        <div
          className={`absolute right-0 z-40 min-w-[128px] overflow-hidden rounded-lg border border-[color:var(--a-border)] bg-[var(--a-card)] py-1 shadow-xl ${menuPlacementClass(placement)}`}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="block w-full px-3 py-2 text-left text-sm text-[var(--a-text)] transition hover:bg-[var(--a-nav-hover)]"
            onClick={() => {
              closeMenu();
              onEdit();
            }}
          >
            Edit
          </button>
          <button
            type="button"
            className="block w-full px-3 py-2 text-left text-sm text-rose-500 transition hover:bg-[var(--a-nav-hover)]"
            onClick={() => {
              closeMenu();
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

function roleLabel(role) {
  if (role === "admin") return "Admin";
  if (role === "employee") return "Employee";
  return "Customer";
}

function UserActionMenu({ user, onView, onMakeEmployee, onMakeAdmin, onRemoveEmployee, onToggleBlock }) {
  const { open, closeMenu, toggleMenu, placement, triggerRef } = useExclusiveActionMenu(180);
  const role = user.role || "customer";

  return (
    <div className="relative inline-flex justify-end" ref={triggerRef}>
      <button
        type="button"
        className="rounded-md px-2 py-1 text-lg leading-none text-[var(--a-muted)] transition hover:bg-[var(--a-nav-hover)] hover:text-[var(--a-heading)]"
        aria-label="User actions"
        onClick={toggleMenu}
      >
        ⋮
      </button>
      {open && (
        <div
          className={`absolute right-0 z-30 min-w-[160px] overflow-hidden rounded-lg border border-[color:var(--a-border)] bg-[var(--a-card)] py-1 shadow-xl ${menuPlacementClass(placement)}`}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="block w-full px-3 py-2 text-left text-sm text-[var(--a-text)] transition hover:bg-[var(--a-nav-hover)]"
            onClick={() => {
              closeMenu();
              onView();
            }}
          >
            View Details
          </button>
          {role !== "employee" && (
            <button
              type="button"
              className="block w-full px-3 py-2 text-left text-sm text-[var(--a-text)] transition hover:bg-[var(--a-nav-hover)]"
              onClick={() => {
                closeMenu();
                onMakeEmployee();
              }}
            >
              Make Employee
            </button>
          )}
          {role !== "admin" && (
            <button
              type="button"
              className="block w-full px-3 py-2 text-left text-sm text-[var(--a-text)] transition hover:bg-[var(--a-nav-hover)]"
              onClick={() => {
                closeMenu();
                onMakeAdmin();
              }}
            >
              Make Admin
            </button>
          )}
          {role === "employee" && (
            <button
              type="button"
              className="block w-full px-3 py-2 text-left text-sm text-[var(--a-text)] transition hover:bg-[var(--a-nav-hover)]"
              onClick={() => {
                closeMenu();
                onRemoveEmployee();
              }}
            >
              Remove Employee
            </button>
          )}
          {role !== "admin" && (
            <button
              type="button"
              className={`block w-full px-3 py-2 text-left text-sm transition hover:bg-[var(--a-nav-hover)] ${
                user.blocked ? "text-emerald-500" : "text-rose-500"
              }`}
              onClick={() => {
                closeMenu();
                onToggleBlock();
              }}
            >
              {user.blocked ? "Unblock" : "Block"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function OverviewBarChart({ orders, pending, progress, delivered, isDark }) {
  const bars = [
    { label: "Orders", value: orders },
    { label: "New Orders", value: pending },
    { label: "Pending", value: progress },
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
  const [alertPopup, setAlertPopup] = useState({ open: false, type: "success", message: "" });
  const [showLoginBanner, setShowLoginBanner] = useState(true);
  const [foodModal, setFoodModal] = useState({ open: false, mode: "add", foodId: null, menuId: null });
  const [foodForm, setFoodForm] = useState({ fname: "", description: "", categoryId: "", image: "", price: "" });
  const [foodSaving, setFoodSaving] = useState(false);
  const [foodsPage, setFoodsPage] = useState(1);
  const [foodsSearch, setFoodsSearch] = useState("");
  const FOODS_PER_PAGE = 8;
  const [categoryModal, setCategoryModal] = useState({ open: false, mode: "add", categoryId: null });
  const [categoryForm, setCategoryForm] = useState({ name: "", shortDesc: "", longDesc: "", image: "" });
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoriesSearch, setCategoriesSearch] = useState("");
  const [categoriesPage, setCategoriesPage] = useState(1);
  const [selectedAdminCategory, setSelectedAdminCategory] = useState(null);
  const [categoryFoodsPage, setCategoryFoodsPage] = useState(1);
  const [selectedAdminUser, setSelectedAdminUser] = useState(null);
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [revealedUserPassword, setRevealedUserPassword] = useState("");
  const [passwordRevealLoading, setPasswordRevealLoading] = useState(false);
  const [adminSetPassword, setAdminSetPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [usersSearch, setUsersSearch] = useState("");
  const [usersPage, setUsersPage] = useState(1);
  const CATEGORIES_PER_PAGE = 8;
  const CATEGORY_FOODS_PER_PAGE = 8;
  const USERS_PER_PAGE = 10;
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
        price: Number(db?.price) > 0 ? Number(db.price) : 0,
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
        price: Number(food.price) > 0 ? Number(food.price) : 0,
        categoryName: food.categoryId?.name || "—",
        categoryId: food.categoryId?._id || food.categoryId || "",
        image: imageOverrides[food._id] || food.image || "",
      }));

    return [...fromMenu, ...fromDbOnly];
  }, [overview.foods, hiddenMenuIds, imageOverrides]);

  const filteredFoodRows = useMemo(() => {
    const q = foodsSearch.trim().toLowerCase();
    if (!q) return adminFoodRows;
    return adminFoodRows.filter((food) => {
      const haystack = [food.fname, food.description, food.categoryName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [adminFoodRows, foodsSearch]);

  const foodsTotalPages = Math.max(1, Math.ceil(filteredFoodRows.length / FOODS_PER_PAGE));
  const safeFoodsPage = Math.min(foodsPage, foodsTotalPages);
  const paginatedFoodRows = useMemo(() => {
    const start = (safeFoodsPage - 1) * FOODS_PER_PAGE;
    return filteredFoodRows.slice(start, start + FOODS_PER_PAGE);
  }, [filteredFoodRows, safeFoodsPage]);

  useEffect(() => {
    if (foodsPage > foodsTotalPages) setFoodsPage(foodsTotalPages);
  }, [foodsPage, foodsTotalPages]);

  useEffect(() => {
    setFoodsPage(1);
  }, [foodsSearch]);

  useEffect(() => {
    if (activeSection === "foods") {
      setFoodsPage(1);
      setFoodsSearch("");
    }
    if (activeSection === "categories") {
      setCategoriesPage(1);
      setCategoriesSearch("");
      setSelectedAdminCategory(null);
      setCategoryFoodsPage(1);
    }
    if (activeSection === "users") {
      setUsersPage(1);
      setUsersSearch("");
      setSelectedAdminUser(null);
      setShowUserPassword(false);
      setRevealedUserPassword("");
      setAdminSetPassword("");
    }
  }, [activeSection]);

  const adminUserRows = overview.users || [];
  const filteredUserRows = useMemo(() => {
    const q = usersSearch.trim().toLowerCase();
    if (!q) return adminUserRows;
    return adminUserRows.filter((user) => {
      const haystack = [user.name, user.email, roleLabel(user.role), user._id]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [adminUserRows, usersSearch]);

  const usersTotalPages = Math.max(1, Math.ceil(filteredUserRows.length / USERS_PER_PAGE));
  const safeUsersPage = Math.min(usersPage, usersTotalPages);
  const paginatedUserRows = useMemo(() => {
    const start = (safeUsersPage - 1) * USERS_PER_PAGE;
    return filteredUserRows.slice(start, start + USERS_PER_PAGE);
  }, [filteredUserRows, safeUsersPage]);

  useEffect(() => {
    if (usersPage > usersTotalPages) setUsersPage(usersTotalPages);
  }, [usersPage, usersTotalPages]);

  useEffect(() => {
    setUsersPage(1);
  }, [usersSearch]);

  useEffect(() => {
    if (!selectedAdminUser) return;
    const latest = adminUserRows.find((user) => String(user._id) === String(selectedAdminUser._id));
    if (latest) setSelectedAdminUser(latest);
  }, [adminUserRows, selectedAdminUser?._id]);

  const adminCategoryRows = overview.categories || [];
  const filteredCategoryRows = useMemo(() => {
    const q = categoriesSearch.trim().toLowerCase();
    if (!q) return adminCategoryRows;
    return adminCategoryRows.filter((category) => {
      const haystack = [category.name, category.shortDesc, category.longDesc]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [adminCategoryRows, categoriesSearch]);

  const categoriesTotalPages = Math.max(1, Math.ceil(filteredCategoryRows.length / CATEGORIES_PER_PAGE));
  const safeCategoriesPage = Math.min(categoriesPage, categoriesTotalPages);
  const paginatedCategoryRows = useMemo(() => {
    const start = (safeCategoriesPage - 1) * CATEGORIES_PER_PAGE;
    return filteredCategoryRows.slice(start, start + CATEGORIES_PER_PAGE);
  }, [filteredCategoryRows, safeCategoriesPage]);

  const categoryFoodRows = useMemo(() => {
    if (!selectedAdminCategory) return [];
    const categoryId = String(selectedAdminCategory._id || "");
    const categoryName = String(selectedAdminCategory.name || "")
      .trim()
      .toLowerCase();
    return adminFoodRows.filter((food) => {
      if (food.categoryId && String(food.categoryId) === categoryId) return true;
      return String(food.categoryName || "").trim().toLowerCase() === categoryName;
    });
  }, [adminFoodRows, selectedAdminCategory]);

  const categoryFoodsTotalPages = Math.max(1, Math.ceil(categoryFoodRows.length / CATEGORY_FOODS_PER_PAGE));
  const safeCategoryFoodsPage = Math.min(categoryFoodsPage, categoryFoodsTotalPages);
  const paginatedCategoryFoodRows = useMemo(() => {
    const start = (safeCategoryFoodsPage - 1) * CATEGORY_FOODS_PER_PAGE;
    return categoryFoodRows.slice(start, start + CATEGORY_FOODS_PER_PAGE);
  }, [categoryFoodRows, safeCategoryFoodsPage]);

  useEffect(() => {
    if (categoriesPage > categoriesTotalPages) setCategoriesPage(categoriesTotalPages);
  }, [categoriesPage, categoriesTotalPages]);

  useEffect(() => {
    setCategoriesPage(1);
  }, [categoriesSearch]);

  useEffect(() => {
    if (categoryFoodsPage > categoryFoodsTotalPages) setCategoryFoodsPage(categoryFoodsTotalPages);
  }, [categoryFoodsPage, categoryFoodsTotalPages]);

  useEffect(() => {
    setCategoryFoodsPage(1);
  }, [selectedAdminCategory]);

  const handleConfirmOrder = async (orderMongoId) => {
    try {
      const res = await api.put(
        `/admin/orders/${orderMongoId}/confirm`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActionStatus({ type: "success", message: res?.data?.msg || "Order confirmed and moved to pending." });
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
      setActionStatus({ type: "success", message: res?.data?.msg || "Order marked as delivered." });
      await loadOverview();
    } catch (e) {
      setActionStatus({ type: "error", message: e?.response?.data?.msg || "Could not move order to delivered." });
    }
  };

  const handleDeleteOrder = async (order) => {
    if (!window.confirm(`Delete order "${order.orderId}"?`)) return;
    try {
      const res = await api.delete(`/admin/orders/${order._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActionStatus({ type: "success", message: res?.data?.msg || "Order deleted." });
      await loadOverview();
    } catch (e) {
      setActionStatus({ type: "error", message: e?.response?.data?.msg || "Could not delete order." });
    }
  };

  const handleUpdateOrderStatus = async (orderMongoId, status) => {
    try {
      const res = await api.put(
        `/admin/orders/${orderMongoId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActionStatus({
        type: "success",
        message: res?.data?.msg || `Order status changed to ${orderStatusLabel(status)}.`,
      });
      await loadOverview();
    } catch (e) {
      setActionStatus({ type: "error", message: e?.response?.data?.msg || "Could not update order status." });
    }
  };

  const openAddFoodModal = () => {
    setFoodForm({ fname: "", description: "", categoryId: "", image: "", price: "" });
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
      price: Number(food.price) > 0 ? String(food.price) : "",
    });
    setFoodModal({ open: true, mode: "edit", foodId: food.dbId, menuId: food.menuId });
  };

  const closeFoodModal = () => {
    setFoodModal({ open: false, mode: "add", foodId: null, menuId: null });
    setFoodForm({ fname: "", description: "", categoryId: "", image: "", price: "" });
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

    const parsedPrice = Number(foodForm.price);
    if (foodForm.price !== "" && (Number.isNaN(parsedPrice) || parsedPrice < 0)) {
      setActionStatus({ type: "error", message: "Price must be a valid number (0 or greater)." });
      return;
    }

    const payload = {
      fname: foodForm.fname.trim(),
      description: foodForm.description.trim(),
      categoryId: foodForm.categoryId,
      image: foodForm.image.trim(),
      price: foodForm.price === "" ? 0 : parsedPrice,
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
        const message = res?.data?.msg || `"${payload.fname}" added successfully.`;
        setActionStatus({ type: "success", message });
        closeFoodModal();
        setAlertPopup({ open: true, type: "success", message });
      } else {
        const res = await api.put(`/admin/foods/${foodModal.foodId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        persistImageOverride(foodModal.menuId || foodModal.foodId, payload.image);
        const message = res?.data?.msg || `"${payload.fname}" updated successfully.`;
        setActionStatus({ type: "success", message });
        closeFoodModal();
        setAlertPopup({ open: true, type: "success", message });
      }
      await loadOverview();
    } catch (e) {
      let message = e?.response?.data?.msg || e?.message || "Could not save food.";
      if (!e?.response) {
        message = "Server is not reachable. Please start the backend and try again.";
      } else if (e.response.status === 413) {
        message = "Image is too large. Please use a smaller image (under 2MB).";
      }
      setActionStatus({ type: "error", message });
      setAlertPopup({ open: true, type: "error", message });
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

  const openAddCategoryModal = () => {
    setCategoryForm({ name: "", shortDesc: "", longDesc: "", image: "" });
    setCategoryModal({ open: true, mode: "add", categoryId: null });
  };

  const openCategoryItems = (category) => {
    setSelectedAdminCategory(category);
    setCategoryFoodsPage(1);
  };

  const openAddFoodForSelectedCategory = () => {
    setFoodForm({
      fname: "",
      description: "",
      categoryId: selectedAdminCategory?._id || "",
      image: "",
      price: "",
    });
    setFoodModal({ open: true, mode: "add", foodId: null, menuId: null });
  };

  const openEditCategoryModal = (category) => {
    setCategoryForm({
      name: category.name || "",
      shortDesc: category.shortDesc || "",
      longDesc: category.longDesc || "",
      image: categoryImageFor(category.name, category.image),
    });
    setCategoryModal({ open: true, mode: "edit", categoryId: category._id });
  };

  const closeCategoryModal = () => {
    setCategoryModal({ open: false, mode: "add", categoryId: null });
    setCategoryForm({ name: "", shortDesc: "", longDesc: "", image: "" });
  };

  const handleCategoryImageFile = (event) => {
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
      setCategoryForm((prev) => ({ ...prev, image: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCategory = async (event) => {
    event.preventDefault();
    if (!categoryForm.name.trim()) {
      setActionStatus({ type: "error", message: "Category name is required." });
      return;
    }

    const payload = {
      name: categoryForm.name.trim(),
      shortDesc: categoryForm.shortDesc.trim(),
      longDesc: categoryForm.longDesc.trim(),
      image: categoryForm.image.trim(),
    };

    try {
      setCategorySaving(true);
      if (categoryModal.mode === "add" || !categoryModal.categoryId) {
        const res = await api.post("/admin/categories", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setActionStatus({ type: "success", message: res?.data?.msg || "Category added." });
      } else {
        const res = await api.put(`/admin/categories/${categoryModal.categoryId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setActionStatus({ type: "success", message: res?.data?.msg || "Category updated." });
      }
      closeCategoryModal();
      await loadOverview();
    } catch (e) {
      setActionStatus({ type: "error", message: e?.response?.data?.msg || "Could not save category." });
    } finally {
      setCategorySaving(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    if (!window.confirm(`Delete category "${category.name}"?`)) return;
    try {
      const res = await api.delete(`/admin/categories/${category._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActionStatus({ type: "success", message: res?.data?.msg || "Category deleted." });
      await loadOverview();
    } catch (e) {
      setActionStatus({ type: "error", message: e?.response?.data?.msg || "Could not delete category." });
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("authUser");
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    navigate("/");
  };

  const handleSetUserRole = async (user, role) => {
    try {
      const res = await api.put(
        `/admin/users/${user._id}/role`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActionStatus({ type: "success", message: res?.data?.msg || "User role updated." });
      setAlertPopup({ open: true, type: "success", message: res?.data?.msg || "User role updated." });
      await loadOverview();
    } catch (e) {
      const message = e?.response?.data?.msg || "Could not update user role.";
      setActionStatus({ type: "error", message });
      setAlertPopup({ open: true, type: "error", message });
    }
  };

  const openUserDetails = (user) => {
    setSelectedAdminUser(user);
    setShowUserPassword(false);
    setRevealedUserPassword("");
    setAdminSetPassword("");
  };

  const handleToggleShowUserPassword = async () => {
    if (showUserPassword) {
      setShowUserPassword(false);
      return;
    }
    if (revealedUserPassword) {
      setShowUserPassword(true);
      return;
    }
    if (!selectedAdminUser?._id) return;
    try {
      setPasswordRevealLoading(true);
      const res = await api.get(`/admin/users/${selectedAdminUser._id}/password`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const password = res?.data?.password || "";
      if (!password) {
        setAlertPopup({
          open: true,
          type: "error",
          message: res?.data?.msg || "Password not available. Set a new password below.",
        });
        return;
      }
      setRevealedUserPassword(password);
      setShowUserPassword(true);
    } catch (e) {
      const message = e?.response?.data?.msg || "Could not load password.";
      setActionStatus({ type: "error", message });
      setAlertPopup({ open: true, type: "error", message });
    } finally {
      setPasswordRevealLoading(false);
    }
  };

  const handleAdminSetPassword = async (event) => {
    event.preventDefault();
    if (!selectedAdminUser?._id) return;
    if (!adminSetPassword.trim() || adminSetPassword.trim().length < 4) {
      setAlertPopup({ open: true, type: "error", message: "Password must be at least 4 characters." });
      return;
    }
    try {
      setPasswordSaving(true);
      const res = await api.put(
        `/admin/users/${selectedAdminUser._id}/password`,
        { password: adminSetPassword.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const password = res?.data?.password || adminSetPassword.trim();
      setRevealedUserPassword(password);
      setShowUserPassword(true);
      setAdminSetPassword("");
      setAlertPopup({ open: true, type: "success", message: res?.data?.msg || "Password updated." });
    } catch (e) {
      const message = e?.response?.data?.msg || "Could not set password.";
      setAlertPopup({ open: true, type: "error", message });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleUserPhotoFile = (event) => {
    const file = event.target.files?.[0];
    if (!file || !selectedAdminUser?._id) return;
    if (!file.type.startsWith("image/")) {
      setActionStatus({ type: "error", message: "Please choose an image file." });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setActionStatus({ type: "error", message: "Image must be under 2MB." });
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const image = String(reader.result || "");
      try {
        const res = await api.put(
          `/admin/users/${selectedAdminUser._id}/image`,
          { image },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setActionStatus({ type: "success", message: res?.data?.msg || "Photo updated." });
        await loadOverview();
      } catch (e) {
        const message = e?.response?.data?.msg || "Could not update photo.";
        setActionStatus({ type: "error", message });
        setAlertPopup({ open: true, type: "error", message });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleToggleUserBlock = async (user) => {
    const nextBlocked = !user.blocked;
    const confirmed = window.confirm(
      nextBlocked ? `Block "${user.name}"? They will not be able to login.` : `Unblock "${user.name}"?`
    );
    if (!confirmed) return;
    try {
      const res = await api.put(
        `/admin/users/${user._id}/block`,
        { blocked: nextBlocked },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActionStatus({ type: "success", message: res?.data?.msg || "User updated." });
      setAlertPopup({ open: true, type: "success", message: res?.data?.msg || "User updated." });
      await loadOverview();
    } catch (e) {
      const message = e?.response?.data?.msg || "Could not update user.";
      setActionStatus({ type: "error", message });
      setAlertPopup({ open: true, type: "error", message });
    }
  };

  const sidebarItems = useMemo(
    () => [
      { id: "overview", label: "Overview", icon: "▦" },
      { id: "foods", label: "Foods", icon: "🍽" },
      { id: "categories", label: "Category", icon: "◼" },
      { id: "orders", label: "Orders", icon: "📦" },
      { id: "users", label: "Users", icon: "👤" },
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
          <button type="button" className={chromeLink} onClick={() => setActiveSection("users")}>
            Users
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
                  label="New Orders"
                  value={pendingOrders.length}
                  iconBg={isDark ? "bg-amber-600/20 text-amber-300" : "bg-amber-100 text-amber-700"}
                  icon={<span className="text-sm">⏳</span>}
                />
                <MetricCard
                  label="Total Revenue"
                  value={formatPrice(totalRevenue) || "৳0"}
                  iconBg={isDark ? "bg-emerald-600/20 text-emerald-300" : "bg-emerald-100 text-emerald-700"}
                  icon={<span className="text-sm">৳</span>}
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
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full max-w-md">
                  <input
                    type="search"
                    value={foodsSearch}
                    onChange={(e) => setFoodsSearch(e.target.value)}
                    placeholder="Search by name, description, or category..."
                    className="w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-bg)] px-3 py-2 text-sm text-[var(--a-heading)] outline-none ring-[#ee6e73]/40 placeholder:text-[var(--a-muted)] focus:ring-2 dark:ring-[#421F37]/60"
                    aria-label="Search foods"
                  />
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-lg bg-[#ee6e73] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[#e35f66] dark:bg-[#421F37] dark:hover:bg-[#5a2a4a]"
                  onClick={openAddFoodModal}
                >
                  Add New
                </button>
              </div>
              <p className="mt-3 text-sm text-[var(--a-muted)]">
                Showing {(safeFoodsPage - 1) * FOODS_PER_PAGE + (filteredFoodRows.length ? 1 : 0)}–
                {Math.min(safeFoodsPage * FOODS_PER_PAGE, filteredFoodRows.length)} of {filteredFoodRows.length}
                {foodsSearch.trim() ? ` (filtered from ${adminFoodRows.length})` : ""} items
              </p>

              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className={tableHeadClass}>
                      <th className="py-3 pr-4 font-semibold">Name</th>
                      <th className="py-3 pr-4 font-semibold">Description</th>
                      <th className="py-3 pr-4 font-semibold">Category</th>
                      <th className="py-3 pr-4 font-semibold">Price</th>
                      <th className="py-3 pr-2 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedFoodRows.map((food) => (
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
                        <td className="py-3 pr-4 align-top font-medium text-[var(--a-heading)]">
                          {formatPrice(food.price) || "—"}
                        </td>
                        <td className="py-3 pr-2 align-top text-right">
                          <FoodActionMenu
                            onEdit={() => openEditFoodModal(food)}
                            onUpdate={() => openEditFoodModal(food)}
                            onDelete={() => handleDeleteFood(food)}
                          />
                        </td>
                      </tr>
                    ))}
                    {filteredFoodRows.length === 0 && (
                      <tr>
                        <td className="py-6 text-center text-[var(--a-muted)]" colSpan={5}>
                          {foodsSearch.trim() ? "No foods match your search." : "No foods found."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {filteredFoodRows.length > 0 && (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--a-border)] pt-4">
                  <p className="text-xs text-[var(--a-muted)]">
                    Page {safeFoodsPage} of {foodsTotalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={safeFoodsPage <= 1}
                      onClick={() => setFoodsPage((p) => Math.max(1, p - 1))}
                      className="rounded-lg border border-[color:var(--a-border)] px-3 py-1.5 text-xs font-medium text-[var(--a-heading)] transition hover:bg-[var(--a-soft)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>
                    {Array.from({ length: foodsTotalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setFoodsPage(page)}
                        className={`min-w-8 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                          page === safeFoodsPage
                            ? "bg-[#ee6e73] text-white dark:bg-[#421F37]"
                            : "border border-[color:var(--a-border)] text-[var(--a-heading)] hover:bg-[var(--a-soft)]"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={safeFoodsPage >= foodsTotalPages}
                      onClick={() => setFoodsPage((p) => Math.min(foodsTotalPages, p + 1))}
                      className="rounded-lg border border-[color:var(--a-border)] px-3 py-1.5 text-xs font-medium text-[var(--a-heading)] transition hover:bg-[var(--a-soft)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </section>
          ) : activeSection === "categories" ? (
            <section className={panelClass}>
              {selectedAdminCategory ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedAdminCategory(null)}
                      className="rounded-lg border border-[color:var(--a-border)] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--a-heading)] transition hover:bg-[var(--a-soft)]"
                    >
                      ← Back to Categories
                    </button>
                    <button
                      type="button"
                      className="rounded-lg bg-[#ee6e73] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[#e35f66] dark:bg-[#421F37] dark:hover:bg-[#5a2a4a]"
                      onClick={openAddFoodForSelectedCategory}
                    >
                      Add Food
                    </button>
                  </div>
                  <h2 className="mt-4 text-center text-3xl font-semibold text-[var(--a-heading)]">
                    {selectedAdminCategory.name}
                  </h2>
                  <p className="mt-2 text-center text-sm text-[var(--a-muted)]">
                    {categoryFoodRows.length} food item{categoryFoodRows.length === 1 ? "" : "s"} in this category
                  </p>

                  <div className="mt-5 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className={tableHeadClass}>
                          <th className="py-3 pr-4 font-semibold">Name</th>
                          <th className="py-3 pr-4 font-semibold">Description</th>
                          <th className="py-3 pr-4 font-semibold">Price</th>
                          <th className="py-3 pr-2 text-right font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedCategoryFoodRows.map((food) => (
                          <tr key={food.key} className={tableRowClass}>
                            <td className="py-3 pr-4 align-top">
                              <div className="flex items-center gap-3">
                                <img
                                  src={food.image || categoryImageFor(selectedAdminCategory.name) || "/images/Snacks.jpg"}
                                  alt={food.fname}
                                  className="h-10 w-10 rounded-md object-cover"
                                />
                                <span className="font-medium text-[var(--a-heading)]">{food.fname}</span>
                              </div>
                            </td>
                            <td className="max-w-md py-3 pr-4 align-top text-xs leading-5 text-[var(--a-muted)]">
                              {food.description || "—"}
                            </td>
                            <td className="py-3 pr-4 align-top font-medium text-[var(--a-heading)]">
                              {formatPrice(food.price) || "—"}
                            </td>
                            <td className="py-3 pr-2 align-top text-right">
                              <FoodActionMenu
                                onEdit={() => openEditFoodModal(food)}
                                onUpdate={() => openEditFoodModal(food)}
                                onDelete={() => handleDeleteFood(food)}
                              />
                            </td>
                          </tr>
                        ))}
                        {categoryFoodRows.length === 0 && (
                          <tr>
                            <td className="py-6 text-center text-[var(--a-muted)]" colSpan={4}>
                              No foods in this category yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {categoryFoodRows.length > 0 && (
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--a-border)] pt-4">
                      <p className="text-xs text-[var(--a-muted)]">
                        Page {safeCategoryFoodsPage} of {categoryFoodsTotalPages}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={safeCategoryFoodsPage <= 1}
                          onClick={() => setCategoryFoodsPage((p) => Math.max(1, p - 1))}
                          className="rounded-lg border border-[color:var(--a-border)] px-3 py-1.5 text-xs font-medium text-[var(--a-heading)] transition hover:bg-[var(--a-soft)] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Previous
                        </button>
                        <button
                          type="button"
                          disabled={safeCategoryFoodsPage >= categoryFoodsTotalPages}
                          onClick={() => setCategoryFoodsPage((p) => Math.min(categoryFoodsTotalPages, p + 1))}
                          className="rounded-lg border border-[color:var(--a-border)] px-3 py-1.5 text-xs font-medium text-[var(--a-heading)] transition hover:bg-[var(--a-soft)] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h2 className="text-center text-3xl font-semibold text-[var(--a-heading)]">Categories</h2>
                  <p className="mt-2 text-center text-sm text-[var(--a-muted)]">
                    Click a category to view its foods. Changes also appear on the public{" "}
                    <Link to="/food-categories" className="font-medium text-[#ee6e73] underline-offset-2 hover:underline dark:text-[#f0a8ad]">
                      Categories page
                    </Link>
                    .
                  </p>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full max-w-md">
                      <input
                        type="search"
                        value={categoriesSearch}
                        onChange={(e) => setCategoriesSearch(e.target.value)}
                        placeholder="Search categories..."
                        className="w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-bg)] px-3 py-2 text-sm text-[var(--a-heading)] outline-none ring-[#ee6e73]/40 placeholder:text-[var(--a-muted)] focus:ring-2 dark:ring-[#421F37]/60"
                        aria-label="Search categories"
                      />
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <Link
                        to="/food-categories"
                        className="rounded-lg border border-[color:var(--a-border)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--a-heading)] transition hover:bg-[var(--a-soft)]"
                      >
                        View Page
                      </Link>
                      <button
                        type="button"
                        className="rounded-lg bg-[#ee6e73] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[#e35f66] dark:bg-[#421F37] dark:hover:bg-[#5a2a4a]"
                        onClick={openAddCategoryModal}
                      >
                        Add New
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-[var(--a-muted)]">
                    Showing {(safeCategoriesPage - 1) * CATEGORIES_PER_PAGE + (filteredCategoryRows.length ? 1 : 0)}–
                    {Math.min(safeCategoriesPage * CATEGORIES_PER_PAGE, filteredCategoryRows.length)} of{" "}
                    {filteredCategoryRows.length}
                    {categoriesSearch.trim() ? ` (filtered from ${adminCategoryRows.length})` : ""} categories
                  </p>

                  <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {paginatedCategoryRows.map((category) => {
                      const imageSrc = categoryImageFor(category.name, category.image);
                      const summary =
                        category.longDesc ||
                        category.shortDesc ||
                        "Explore the Foods of this category!";
                      return (
                        <div
                          key={category._id}
                          role="button"
                          tabIndex={0}
                          onClick={() => openCategoryItems(category)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              openCategoryItems(category);
                            }
                          }}
                          className="relative cursor-pointer rounded-xl border border-[color:var(--a-border)] bg-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-[var(--a-inset)]"
                        >
                          <div className="food-media-frame h-40 overflow-hidden rounded-t-xl">
                            <img src={imageSrc} alt={category.name} className="food-media" />
                          </div>
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-xl font-semibold text-[var(--a-heading)]">{category.name}</h3>
                              <CategoryActionMenu
                                onEdit={() => openEditCategoryModal(category)}
                                onDelete={() => handleDeleteCategory(category)}
                              />
                            </div>
                            <p className="mt-2 text-sm leading-6 text-[var(--a-muted)]">{summary}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {filteredCategoryRows.length === 0 && (
                    <p className="mt-6 text-center text-sm text-[var(--a-muted)]">
                      {categoriesSearch.trim() ? "No categories match your search." : "No categories found."}
                    </p>
                  )}

                  {filteredCategoryRows.length > 0 && (
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--a-border)] pt-4">
                      <p className="text-xs text-[var(--a-muted)]">
                        Page {safeCategoriesPage} of {categoriesTotalPages}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={safeCategoriesPage <= 1}
                          onClick={() => setCategoriesPage((p) => Math.max(1, p - 1))}
                          className="rounded-lg border border-[color:var(--a-border)] px-3 py-1.5 text-xs font-medium text-[var(--a-heading)] transition hover:bg-[var(--a-soft)] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Previous
                        </button>
                        {Array.from({ length: categoriesTotalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            type="button"
                            onClick={() => setCategoriesPage(page)}
                            className={`min-w-8 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                              page === safeCategoriesPage
                                ? "bg-[#ee6e73] text-white dark:bg-[#421F37]"
                                : "border border-[color:var(--a-border)] text-[var(--a-heading)] hover:bg-[var(--a-soft)]"
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          type="button"
                          disabled={safeCategoriesPage >= categoriesTotalPages}
                          onClick={() => setCategoriesPage((p) => Math.min(categoriesTotalPages, p + 1))}
                          className="rounded-lg border border-[color:var(--a-border)] px-3 py-1.5 text-xs font-medium text-[var(--a-heading)] transition hover:bg-[var(--a-soft)] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>
          ) : activeSection === "orders" ? (
            <section className={`space-y-6 ${panelClass}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold text-[var(--a-heading)]">Orders</h2>
                  <p className="mt-1 text-sm text-[var(--a-muted)]">
                    New paid/online orders appear under <span className="font-semibold">New Orders</span>. Click Confirm to move them to Pending.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadOverview}
                  className="rounded-lg border border-[color:var(--a-border)] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--a-heading)] transition hover:bg-[var(--a-soft)]"
                >
                  Refresh
                </button>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-[var(--a-heading)]">
                  New Orders{" "}
                  <span className="text-base font-medium text-[var(--a-muted)]">({pendingOrders.length})</span>
                </h2>
                <p className="mt-1 text-sm text-[var(--a-muted)]">
                  Includes Cash on Delivery and Online paid orders waiting for admin confirm.
                </p>
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className={tableHeadClass}>
                        <th className="py-2 pr-4">Order ID</th>
                        <th className="py-2 pr-4">Food</th>
                        <th className="py-2 pr-4">Customer</th>
                        <th className="py-2 pr-4">Total</th>
                        <th className="py-2 pr-4">Payment</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2 pr-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingOrders.map((order) => (
                        <tr key={order._id} className={tableRowClass}>
                          <td className="py-2 pr-4 font-medium">{order.orderId}</td>
                          <td className="max-w-xs py-2 pr-4">
                            <p>{order.foodName}</p>
                            {order.deliveryType === "delivery" && (
                              <p className="mt-0.5 text-[11px] text-[var(--a-muted)]">Home delivery</p>
                            )}
                          </td>
                          <td className="py-2 pr-4">{order.userId?.name || "-"}</td>
                          <td className="py-2 pr-4 font-semibold text-[var(--a-heading)]">{formatAmount(orderAmount(order))}</td>
                          <td className="py-2 pr-4">
                            <div className="flex flex-col items-start gap-1">
                              <span>{paymentMethodLabel(order.paymentMethod)}</span>
                              {paymentStatusBadge(order)}
                            </div>
                          </td>
                          <td className="py-2 pr-4">
                            <OrderStatusSelect
                              value={order.status}
                              onChange={(status) => handleUpdateOrderStatus(order._id, status)}
                            />
                          </td>
                          <td className="py-2 pr-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                className="rounded bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                                onClick={() => handleConfirmOrder(order._id)}
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                className="rounded bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700"
                                onClick={() => handleDeleteOrder(order)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {pendingOrders.length === 0 && (
                        <tr>
                          <td className="py-3 text-[var(--a-muted)]" colSpan={7}>
                            No new orders.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-[var(--a-heading)]">
                  Pending{" "}
                  <span className="text-base font-medium text-[var(--a-muted)]">({progressOrders.length})</span>
                </h2>
                <p className="mt-1 text-sm text-[var(--a-muted)]">Confirmed orders — mark as Delivered when complete.</p>
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className={tableHeadClass}>
                        <th className="py-2 pr-4">Order ID</th>
                        <th className="py-2 pr-4">Food</th>
                        <th className="py-2 pr-4">Customer</th>
                        <th className="py-2 pr-4">Total</th>
                        <th className="py-2 pr-4">Payment</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2 pr-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {progressOrders.map((order) => (
                        <tr key={order._id} className={tableRowClass}>
                          <td className="py-2 pr-4 font-medium">{order.orderId}</td>
                          <td className="max-w-xs py-2 pr-4">{order.foodName}</td>
                          <td className="py-2 pr-4">{order.userId?.name || "-"}</td>
                          <td className="py-2 pr-4 font-semibold text-[var(--a-heading)]">{formatAmount(orderAmount(order))}</td>
                          <td className="py-2 pr-4">
                            <div className="flex flex-col items-start gap-1">
                              <span>{paymentMethodLabel(order.paymentMethod)}</span>
                              {paymentStatusBadge(order)}
                            </div>
                          </td>
                          <td className="py-2 pr-4">
                            <OrderStatusSelect
                              value={order.status}
                              onChange={(status) => handleUpdateOrderStatus(order._id, status)}
                            />
                          </td>
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
                          <td className="py-3 text-[var(--a-muted)]" colSpan={7}>
                            No pending orders.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-[var(--a-heading)]">
                  Delivered{" "}
                  <span className="text-base font-medium text-[var(--a-muted)]">({deliveredOrders.length})</span>
                </h2>
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className={tableHeadClass}>
                        <th className="py-2 pr-4">Order ID</th>
                        <th className="py-2 pr-4">Food</th>
                        <th className="py-2 pr-4">Customer</th>
                        <th className="py-2 pr-4">Total</th>
                        <th className="py-2 pr-4">Payment</th>
                        <th className="py-2 pr-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deliveredOrders.map((order) => (
                        <tr key={order._id} className={tableRowClass}>
                          <td className="py-2 pr-4 font-medium">{order.orderId}</td>
                          <td className="max-w-xs py-2 pr-4">{order.foodName}</td>
                          <td className="py-2 pr-4">{order.userId?.name || "-"}</td>
                          <td className="py-2 pr-4 font-semibold text-[var(--a-heading)]">{formatAmount(orderAmount(order))}</td>
                          <td className="py-2 pr-4">
                            <div className="flex flex-col items-start gap-1">
                              <span>{paymentMethodLabel(order.paymentMethod)}</span>
                              {paymentStatusBadge(order)}
                            </div>
                          </td>
                          <td className="py-2 pr-4">
                            <OrderStatusSelect
                              value={order.status}
                              onChange={(status) => handleUpdateOrderStatus(order._id, status)}
                            />
                          </td>
                        </tr>
                      ))}
                      {deliveredOrders.length === 0 && (
                        <tr>
                          <td className="py-3 text-[var(--a-muted)]" colSpan={6}>
                            No delivered orders yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          ) : activeSection === "users" ? (
            <section className={panelClass}>
              {selectedAdminUser ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAdminUser(null);
                      setShowUserPassword(false);
                      setRevealedUserPassword("");
                    }}
                    className="rounded-lg border border-[color:var(--a-border)] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--a-heading)] transition hover:bg-[var(--a-soft)]"
                  >
                    ← Back to Users
                  </button>
                  <h2 className="mt-4 text-center text-3xl font-semibold text-[var(--a-heading)]">User Details</h2>
                  <div className="mx-auto mt-6 max-w-xl space-y-3 rounded-xl border border-[color:var(--a-border)] bg-[var(--a-inset)] p-5">
                    <div className="flex flex-col items-center gap-3 pb-2">
                      <div className="h-24 w-24 overflow-hidden rounded-full border border-[color:var(--a-border)] bg-[var(--a-card)]">
                        {selectedAdminUser.image ? (
                          <img src={selectedAdminUser.image} alt={selectedAdminUser.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-[var(--a-heading)]">
                            {String(selectedAdminUser.name || "U")
                              .trim()
                              .slice(0, 1)
                              .toUpperCase()}
                          </div>
                        )}
                      </div>
                      <label className="inline-flex cursor-pointer items-center rounded-lg border border-[color:var(--a-border)] bg-[var(--a-card)] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--a-heading)] transition hover:bg-[var(--a-nav-hover)]">
                        Change Photo
                        <input type="file" accept="image/*" className="hidden" onChange={handleUserPhotoFile} />
                      </label>
                    </div>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-[var(--a-muted)]">User ID</span>
                      <span className="break-all text-right font-medium text-[var(--a-heading)]">{selectedAdminUser._id}</span>
                    </div>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-[var(--a-muted)]">Name</span>
                      <span className="font-medium text-[var(--a-heading)]">{selectedAdminUser.name}</span>
                    </div>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-[var(--a-muted)]">Mail</span>
                      <span className="break-all text-right font-medium text-[var(--a-heading)]">{selectedAdminUser.email}</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[var(--a-muted)]">Password</span>
                        <div className="flex items-center gap-2">
                          <span className="max-w-[180px] break-all font-medium text-[var(--a-heading)]">
                            {showUserPassword
                              ? revealedUserPassword || "Not available"
                              : selectedAdminUser.passwordDisplay || "••••••••"}
                          </span>
                          <button
                            type="button"
                            className="rounded-md border border-[color:var(--a-border)] px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--a-heading)] transition hover:bg-[var(--a-card)]"
                            onClick={handleToggleShowUserPassword}
                            disabled={passwordRevealLoading}
                          >
                            {passwordRevealLoading ? "..." : showUserPassword ? "Hide" : "Show"}
                          </button>
                        </div>
                      </div>
                      <form className="flex flex-col gap-2 sm:flex-row sm:items-center" onSubmit={handleAdminSetPassword}>
                        <input
                          type="text"
                          value={adminSetPassword}
                          onChange={(e) => setAdminSetPassword(e.target.value)}
                          placeholder="Set new password"
                          className="w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-card)] px-3 py-2 text-sm text-[var(--a-heading)] outline-none focus:border-[#ee6e73]"
                        />
                        <button
                          type="submit"
                          disabled={passwordSaving}
                          className="shrink-0 rounded-lg bg-[#ee6e73] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[#e35f66] disabled:opacity-60 dark:bg-[#421F37]"
                        >
                          {passwordSaving ? "Saving..." : "Save"}
                        </button>
                      </form>
                    </div>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-[var(--a-muted)]">Category</span>
                      <span className="font-medium text-[var(--a-heading)]">{roleLabel(selectedAdminUser.role)}</span>
                    </div>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-[var(--a-muted)]">Orders purchased</span>
                      <span className="font-medium text-[var(--a-heading)]">{selectedAdminUser.orderCount || 0}</span>
                    </div>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-[var(--a-muted)]">Status</span>
                      <span className={`font-medium ${selectedAdminUser.blocked ? "text-rose-500" : "text-emerald-500"}`}>
                        {selectedAdminUser.blocked ? "Blocked" : "Active"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                    {selectedAdminUser.role !== "employee" && (
                      <button
                        type="button"
                        className="rounded-lg border border-[color:var(--a-border)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--a-heading)] transition hover:bg-[var(--a-soft)]"
                        onClick={() => handleSetUserRole(selectedAdminUser, "employee")}
                      >
                        Make Employee
                      </button>
                    )}
                    {selectedAdminUser.role !== "admin" && (
                      <button
                        type="button"
                        className="rounded-lg border border-[color:var(--a-border)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--a-heading)] transition hover:bg-[var(--a-soft)]"
                        onClick={() => handleSetUserRole(selectedAdminUser, "admin")}
                      >
                        Make Admin
                      </button>
                    )}
                    {selectedAdminUser.role === "employee" && (
                      <button
                        type="button"
                        className="rounded-lg border border-[color:var(--a-border)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--a-heading)] transition hover:bg-[var(--a-soft)]"
                        onClick={() => handleSetUserRole(selectedAdminUser, "customer")}
                      >
                        Remove Employee
                      </button>
                    )}
                    {selectedAdminUser.role !== "admin" && (
                      <button
                        type="button"
                        className={`rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white transition ${
                          selectedAdminUser.blocked
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : "bg-rose-600 hover:bg-rose-700"
                        }`}
                        onClick={() => handleToggleUserBlock(selectedAdminUser)}
                      >
                        {selectedAdminUser.blocked ? "Unblock" : "Block"}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-center text-3xl font-semibold text-[var(--a-heading)]">Users</h2>
                  <p className="mt-2 text-center text-sm text-[var(--a-muted)]">
                    Click a user to view details. Use ⋮ to manage role or block status.
                  </p>
                  <div className="mt-5 max-w-md">
                    <input
                      type="search"
                      value={usersSearch}
                      onChange={(e) => setUsersSearch(e.target.value)}
                      placeholder="Search users..."
                      className="w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-bg)] px-3 py-2 text-sm text-[var(--a-heading)] outline-none ring-[#ee6e73]/40 placeholder:text-[var(--a-muted)] focus:ring-2 dark:ring-[#421F37]/60"
                      aria-label="Search users"
                    />
                  </div>
                  <p className="mt-3 text-sm text-[var(--a-muted)]">
                    Showing {(safeUsersPage - 1) * USERS_PER_PAGE + (filteredUserRows.length ? 1 : 0)}–
                    {Math.min(safeUsersPage * USERS_PER_PAGE, filteredUserRows.length)} of {filteredUserRows.length} users
                  </p>
                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className={tableHeadClass}>
                          <th className="py-3 pr-4 font-semibold">Name</th>
                          <th className="py-3 pr-4 font-semibold">Category</th>
                          <th className="py-3 pr-2 text-right font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedUserRows.map((user) => (
                          <tr
                            key={user._id}
                            className={`${tableRowClass} cursor-pointer transition hover:bg-[var(--a-soft)]`}
                            onClick={() => openUserDetails(user)}
                          >
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[color:var(--a-border)] bg-[var(--a-inset)]">
                                  {user.image ? (
                                    <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[var(--a-heading)]">
                                      {String(user.name || "U")
                                        .trim()
                                        .slice(0, 1)
                                        .toUpperCase()}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium text-[var(--a-heading)]">{user.name}</div>
                                  <div className="text-xs text-[var(--a-muted)]">{user.email}</div>
                                  {user.blocked && <div className="mt-0.5 text-xs font-semibold text-rose-500">Blocked</div>}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 pr-4 text-[var(--a-heading)]">{roleLabel(user.role)}</td>
                            <td className="py-3 pr-2 text-right" onClick={(event) => event.stopPropagation()}>
                              <UserActionMenu
                                user={user}
                                onView={() => openUserDetails(user)}
                                onMakeEmployee={() => handleSetUserRole(user, "employee")}
                                onMakeAdmin={() => handleSetUserRole(user, "admin")}
                                onRemoveEmployee={() => handleSetUserRole(user, "customer")}
                                onToggleBlock={() => handleToggleUserBlock(user)}
                              />
                            </td>
                          </tr>
                        ))}
                        {filteredUserRows.length === 0 && (
                          <tr>
                            <td className="py-6 text-center text-[var(--a-muted)]" colSpan={3}>
                              {usersSearch.trim() ? "No users match your search." : "No users found."}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {filteredUserRows.length > 0 && (
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--a-border)] pt-4">
                      <p className="text-xs text-[var(--a-muted)]">
                        Page {safeUsersPage} of {usersTotalPages}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={safeUsersPage <= 1}
                          onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
                          className="rounded-lg border border-[color:var(--a-border)] px-3 py-1.5 text-xs font-medium text-[var(--a-heading)] transition hover:bg-[var(--a-soft)] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Previous
                        </button>
                        <button
                          type="button"
                          disabled={safeUsersPage >= usersTotalPages}
                          onClick={() => setUsersPage((p) => Math.min(usersTotalPages, p + 1))}
                          className="rounded-lg border border-[color:var(--a-border)] px-3 py-1.5 text-xs font-medium text-[var(--a-heading)] transition hover:bg-[var(--a-soft)] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>
          ) : null}
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
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--a-muted)]">Price (BDT)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={foodForm.price}
                  onChange={(event) => setFoodForm((prev) => ({ ...prev, price: event.target.value }))}
                  className="w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-inset)] px-3 py-2 text-sm text-[var(--a-heading)] outline-none focus:border-[#ee6e73] dark:focus:border-[#f0a8ad]"
                  placeholder="e.g. 250"
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
                  <p className="mt-1 text-xs text-amber-500">No categories found. Add a category first.</p>
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

      {categoryModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[color:var(--a-border)] bg-[var(--a-card)] p-5 shadow-2xl">
            <h3 className="text-xl font-semibold text-[var(--a-heading)]">
              {categoryModal.mode === "add" ? "Add New Category" : "Update Category"}
            </h3>
            <form className="mt-4 space-y-4" onSubmit={handleSaveCategory}>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--a-muted)]">Image</label>
                <div className="flex flex-wrap items-start gap-3">
                  <div className="h-16 w-16 overflow-hidden rounded-lg border border-[color:var(--a-border)] bg-[var(--a-inset)]">
                    {categoryForm.image ? (
                      <img src={categoryForm.image} alt="Category preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-[var(--a-muted)]">No image</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <input
                      type="text"
                      value={categoryForm.image.startsWith("data:") ? "" : categoryForm.image}
                      onChange={(event) => setCategoryForm((prev) => ({ ...prev, image: event.target.value }))}
                      className="w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-inset)] px-3 py-2 text-sm text-[var(--a-heading)] outline-none placeholder:text-[var(--a-muted)] focus:border-[#ee6e73] dark:focus:border-[#f0a8ad]"
                      placeholder="e.g. /images/Italian.jpg"
                    />
                    <label className="inline-flex cursor-pointer items-center rounded-lg border border-[color:var(--a-border)] bg-[var(--a-inset)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--a-heading)] transition hover:bg-[var(--a-nav-hover)]">
                      Choose Image
                      <input type="file" accept="image/*" className="hidden" onChange={handleCategoryImageFile} />
                    </label>
                    {categoryForm.image && (
                      <button
                        type="button"
                        className="ml-2 text-xs font-semibold text-rose-500"
                        onClick={() => setCategoryForm((prev) => ({ ...prev, image: "" }))}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--a-muted)]">Name</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(event) => setCategoryForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-inset)] px-3 py-2 text-sm text-[var(--a-heading)] outline-none focus:border-[#ee6e73] dark:focus:border-[#f0a8ad]"
                  placeholder="Category name"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--a-muted)]">
                  Short Description
                </label>
                <input
                  type="text"
                  value={categoryForm.shortDesc}
                  onChange={(event) => setCategoryForm((prev) => ({ ...prev, shortDesc: event.target.value }))}
                  className="w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-inset)] px-3 py-2 text-sm text-[var(--a-heading)] outline-none focus:border-[#ee6e73] dark:focus:border-[#f0a8ad]"
                  placeholder="Short description"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--a-muted)]">
                  Long Description
                </label>
                <textarea
                  value={categoryForm.longDesc}
                  onChange={(event) => setCategoryForm((prev) => ({ ...prev, longDesc: event.target.value }))}
                  className="min-h-[90px] w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-inset)] px-3 py-2 text-sm text-[var(--a-heading)] outline-none focus:border-[#ee6e73] dark:focus:border-[#f0a8ad]"
                  placeholder="Longer description for the category page"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--a-muted)] transition hover:bg-[var(--a-nav-hover)]"
                  onClick={closeCategoryModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={categorySaving}
                  className="rounded-lg bg-[#ee6e73] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[#e35f66] disabled:opacity-60 dark:bg-[#421F37] dark:hover:bg-[#5a2a4a]"
                >
                  {categorySaving ? "Saving..." : categoryModal.mode === "add" ? "Add Category" : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {alertPopup.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[color:var(--a-border)] bg-[var(--a-card)] p-6 shadow-2xl">
            <p
              className={`text-center text-base font-medium ${
                alertPopup.type === "error" ? "text-rose-500" : "text-[var(--a-heading)]"
              }`}
            >
              {alertPopup.message}
            </p>
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                className="rounded-lg bg-[#ee6e73] px-6 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[#e35f66] dark:bg-[#421F37] dark:hover:bg-[#5a2a4a]"
                onClick={() => setAlertPopup({ open: false, type: "success", message: "" })}
              >
                Ok
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
