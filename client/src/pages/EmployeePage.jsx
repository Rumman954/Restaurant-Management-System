import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { formatAmount, formatPrice } from "../lib/formatPrice";
import { useTheme } from "../context/ThemeContext";
import { categoryImageFor } from "../data/menuCatalog";

const FOODS_PER_PAGE = 8;
const CATEGORIES_PER_PAGE = 8;
const CATEGORY_FOODS_PER_PAGE = 8;
const USERS_PER_PAGE = 10;

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

function roleLabel(role) {
  if (role === "admin") return "Admin";
  if (role === "employee") return "Employee";
  return "Customer";
}

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
  if (centerRatio > 0.66 || (spaceBelow < menuHeight && spaceAbove > spaceBelow)) return "above";
  if (centerRatio < 0.34 || spaceAbove < menuHeight) return "below";
  return "middle";
}

function menuPlacementClass(placement) {
  if (placement === "above") return "bottom-full translate-y-2";
  if (placement === "middle") return "top-1/2 -translate-y-1/2";
  return "top-full mt-1";
}

function useExclusiveActionMenu(menuHeight = 130, preferAbove = false) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState("below");
  const triggerRef = useRef(null);
  const openRef = useRef(false);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const resolvePlacement = () => {
    if (preferAbove) return "above";
    return getMenuPlacement(triggerRef.current, menuHeight);
  };

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
    setPlacement(resolvePlacement());
    setOpen(true);
    exclusiveMenuClose = closeMenu;
  };

  useEffect(() => {
    if (!open) return undefined;
    setPlacement(resolvePlacement());
    const onOutsideClick = () => closeMenu();
    const reposition = () => setPlacement(resolvePlacement());
    window.addEventListener("click", onOutsideClick);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      window.removeEventListener("click", onOutsideClick);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open, menuHeight, preferAbove]);

  useEffect(
    () => () => {
      if (exclusiveMenuClose === closeMenu) exclusiveMenuClose = null;
    },
    []
  );

  return { open, closeMenu, toggleMenu, placement, triggerRef };
}

function FoodAvailabilityCell({ food, onToggle }) {
  const isAvailable = food.available !== false;
  return (
    <div className="flex flex-col items-start gap-2">
      {isAvailable ? (
        <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          Available
        </span>
      ) : (
        <span className="rounded bg-rose-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-rose-700 dark:bg-rose-950 dark:text-rose-300">
          Unavailable
        </span>
      )}
      <button
        type="button"
        onClick={() => onToggle(food)}
        className="rounded border border-[color:var(--a-border)] px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--a-heading)] transition hover:bg-[var(--a-soft)]"
      >
        {isAvailable ? "Mark Unavailable" : "Mark Available"}
      </button>
    </div>
  );
}

function FoodActionMenu({ onEdit }) {
  const { open, closeMenu, toggleMenu, placement, triggerRef } = useExclusiveActionMenu(96);

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
        </div>
      )}
    </div>
  );
}

function EmployeeUserActionMenu({ user, onView, onToggleBlock, openAbove = false }) {
  const { open, closeMenu, toggleMenu, placement, triggerRef } = useExclusiveActionMenu(96, openAbove);
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
          {role === "customer" && (
            <button
              type="button"
              className="block w-full px-3 py-2 text-left text-sm text-[var(--a-text)] transition hover:bg-[var(--a-nav-hover)]"
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

function StatCard({ label, value, iconBg, icon }) {
  return (
    <div className="rounded-2xl border border-[color:var(--a-border)] bg-[var(--a-card)] p-5 shadow-lg">
      <div className={`mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}>{icon}</div>
      <p className="text-3xl font-semibold text-[var(--a-heading)]">{value}</p>
      <p className="mt-1 text-sm text-[var(--a-muted)]">{label}</p>
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
  "--a-soft": "rgba(255,255,255,0.06)",
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
  "--a-soft": "rgba(0,0,0,0.04)",
};

export default function EmployeePage() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [dashboard, setDashboard] = useState({ stats: null, foods: [], categories: [], orders: [], users: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  const [actionStatus, setActionStatus] = useState({ type: "", message: "" });
  const [showLoginBanner, setShowLoginBanner] = useState(true);
  const [categoriesSearch, setCategoriesSearch] = useState("");
  const [foodsSearch, setFoodsSearch] = useState("");
  const [usersSearch, setUsersSearch] = useState("");
  const [foodsPage, setFoodsPage] = useState(1);
  const [categoriesPage, setCategoriesPage] = useState(1);
  const [categoryFoodsPage, setCategoryFoodsPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [selectedEmployeeCategory, setSelectedEmployeeCategory] = useState(null);
  const [selectedEmployeeUser, setSelectedEmployeeUser] = useState(null);
  const [foodModal, setFoodModal] = useState({ open: false, foodId: null });
  const [foodForm, setFoodForm] = useState({ fname: "", description: "", price: "", available: true });
  const [foodSaving, setFoodSaving] = useState(false);

  const authUser = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("authUser") || "null");
    } catch {
      return null;
    }
  })();
  const token = sessionStorage.getItem("authToken");
  const isEmployee = authUser?.role === "employee";

  const loadDashboard = async () => {
    if (!token || !isEmployee) return;
    try {
      setLoading(true);
      const res = await api.get("/employee/dashboard", { headers: { Authorization: `Bearer ${token}` } });
      setDashboard({
        stats: res.data.stats || null,
        foods: res.data.foods || [],
        categories: res.data.categories || [],
        orders: res.data.orders || [],
        users: res.data.users || [],
      });
      setError("");
    } catch (e) {
      setError(e?.response?.data?.msg || "Failed to load employee dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [token, isEmployee]);

  useEffect(() => {
    if (!showLoginBanner) return undefined;
    const timer = setTimeout(() => setShowLoginBanner(false), 3500);
    return () => clearTimeout(timer);
  }, [showLoginBanner]);

  const newOrders = useMemo(
    () => dashboard.orders.filter((order) => order.status === "pending"),
    [dashboard.orders]
  );
  const pendingOrders = useMemo(
    () => dashboard.orders.filter((order) => order.status === "progress"),
    [dashboard.orders]
  );
  const deliveredOrders = useMemo(
    () => dashboard.orders.filter((order) => order.status === "delivered"),
    [dashboard.orders]
  );

  const newOrderCount = dashboard.stats?.newOrders ?? newOrders.length;
  const pendingCount = dashboard.stats?.pendingOrders ?? pendingOrders.length;
  const deliveredCount = dashboard.stats?.deliveredOrders ?? deliveredOrders.length;
  const menuItemCount = dashboard.stats?.totalFoods ?? dashboard.foods.length;
  const totalUserCount = dashboard.stats?.totalUsers ?? dashboard.users.length;

  const foodRows = useMemo(
    () =>
      (dashboard.foods || []).map((food) => ({
        key: food._id,
        _id: food._id,
        dbId: food._id,
        fname: food.fname || "—",
        description: food.description || "",
        categoryName: food.categoryId?.name || "—",
        categoryId: food.categoryId?._id || food.categoryId || "",
        price: Number(food.price) > 0 ? Number(food.price) : 0,
        image: food.image || "",
        available: food.available !== false,
      })),
    [dashboard.foods]
  );

  const filteredFoodRows = useMemo(() => {
    const q = foodsSearch.trim().toLowerCase();
    if (!q) return foodRows;
    return foodRows.filter((food) => {
      const haystack = [food.fname, food.description, food.categoryName].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [foodRows, foodsSearch]);

  const foodsTotalPages = Math.max(1, Math.ceil(filteredFoodRows.length / FOODS_PER_PAGE));
  const safeFoodsPage = Math.min(foodsPage, foodsTotalPages);
  const paginatedFoodRows = useMemo(() => {
    const start = (safeFoodsPage - 1) * FOODS_PER_PAGE;
    return filteredFoodRows.slice(start, start + FOODS_PER_PAGE);
  }, [filteredFoodRows, safeFoodsPage]);

  const filteredUsers = useMemo(() => {
    const q = usersSearch.trim().toLowerCase();
    const users = dashboard.users || [];
    if (!q) return users;
    return users.filter((user) => {
      const haystack = [user.name, user.email, user.phone, roleLabel(user.role), user._id]
        .map((value) => String(value || "").toLowerCase())
        .join(" ");
      return haystack.includes(q);
    });
  }, [dashboard.users, usersSearch]);

  const usersTotalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const safeUsersPage = Math.min(usersPage, usersTotalPages);
  const paginatedUsers = useMemo(() => {
    const start = (safeUsersPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(start, start + USERS_PER_PAGE);
  }, [filteredUsers, safeUsersPage]);

  const employeeCategoryRows = dashboard.categories || [];
  const filteredCategoryRows = useMemo(() => {
    const q = categoriesSearch.trim().toLowerCase();
    if (!q) return employeeCategoryRows;
    return employeeCategoryRows.filter((category) => {
      const haystack = [category.name, category.shortDesc, category.longDesc].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [employeeCategoryRows, categoriesSearch]);

  const categoriesTotalPages = Math.max(1, Math.ceil(filteredCategoryRows.length / CATEGORIES_PER_PAGE));
  const safeCategoriesPage = Math.min(categoriesPage, categoriesTotalPages);
  const paginatedCategoryRows = useMemo(() => {
    const start = (safeCategoriesPage - 1) * CATEGORIES_PER_PAGE;
    return filteredCategoryRows.slice(start, start + CATEGORIES_PER_PAGE);
  }, [filteredCategoryRows, safeCategoriesPage]);

  const categoryFoodRows = useMemo(() => {
    if (!selectedEmployeeCategory) return [];
    const categoryId = String(selectedEmployeeCategory._id || "");
    const categoryName = String(selectedEmployeeCategory.name || "")
      .trim()
      .toLowerCase();
    return foodRows.filter((food) => {
      if (food.categoryId && String(food.categoryId) === categoryId) return true;
      return String(food.categoryName || "").trim().toLowerCase() === categoryName;
    });
  }, [foodRows, selectedEmployeeCategory]);

  const categoryFoodsTotalPages = Math.max(1, Math.ceil(categoryFoodRows.length / CATEGORY_FOODS_PER_PAGE));
  const safeCategoryFoodsPage = Math.min(categoryFoodsPage, categoryFoodsTotalPages);
  const paginatedCategoryFoodRows = useMemo(() => {
    const start = (safeCategoryFoodsPage - 1) * CATEGORY_FOODS_PER_PAGE;
    return categoryFoodRows.slice(start, start + CATEGORY_FOODS_PER_PAGE);
  }, [categoryFoodRows, safeCategoryFoodsPage]);

  useEffect(() => {
    if (foodsPage > foodsTotalPages) setFoodsPage(foodsTotalPages);
  }, [foodsPage, foodsTotalPages]);

  useEffect(() => {
    setFoodsPage(1);
  }, [foodsSearch]);

  useEffect(() => {
    if (usersPage > usersTotalPages) setUsersPage(usersTotalPages);
  }, [usersPage, usersTotalPages]);

  useEffect(() => {
    setUsersPage(1);
  }, [usersSearch]);

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
  }, [selectedEmployeeCategory]);

  useEffect(() => {
    if (!selectedEmployeeUser) return;
    const latest = (dashboard.users || []).find((user) => String(user._id) === String(selectedEmployeeUser._id));
    if (latest) setSelectedEmployeeUser(latest);
  }, [dashboard.users, selectedEmployeeUser?._id]);

  useEffect(() => {
    if (activeSection === "foods") {
      setFoodsPage(1);
      setFoodsSearch("");
    }
    if (activeSection === "categories") {
      setCategoriesPage(1);
      setCategoriesSearch("");
      setSelectedEmployeeCategory(null);
      setCategoryFoodsPage(1);
    }
    if (activeSection === "users") {
      setUsersPage(1);
      setUsersSearch("");
      setSelectedEmployeeUser(null);
    }
  }, [activeSection]);

  const employeeInitials = useMemo(() => {
    const name = String(authUser?.name || "Employee").trim();
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }, [authUser?.name]);

  const handleConfirmOrder = async (orderMongoId) => {
    try {
      const res = await api.put(
        `/employee/orders/${orderMongoId}/confirm`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActionStatus({ type: "success", message: res?.data?.msg || "Order confirmed and moved to pending." });
      await loadDashboard();
    } catch (e) {
      setActionStatus({ type: "error", message: e?.response?.data?.msg || "Could not confirm order." });
    }
  };

  const handleDeliverOrder = async (orderMongoId) => {
    try {
      const res = await api.put(
        `/employee/orders/${orderMongoId}/deliver`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActionStatus({ type: "success", message: res?.data?.msg || "Order marked as delivered." });
      await loadDashboard();
    } catch (e) {
      setActionStatus({ type: "error", message: e?.response?.data?.msg || "Could not mark order as delivered." });
    }
  };

  const handleUpdateOrderStatus = async (orderMongoId, status) => {
    try {
      const res = await api.put(
        `/employee/orders/${orderMongoId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActionStatus({
        type: "success",
        message: res?.data?.msg || `Order status changed to ${orderStatusLabel(status)}.`,
      });
      await loadDashboard();
    } catch (e) {
      setActionStatus({ type: "error", message: e?.response?.data?.msg || "Could not update order status." });
    }
  };

  const openEditFoodModal = (food) => {
    setFoodForm({
      fname: food.fname === "—" ? "" : food.fname || "",
      description: food.description || "",
      price: Number(food.price) > 0 ? String(food.price) : "",
      available: food.available !== false,
    });
    setFoodModal({ open: true, foodId: food._id || food.key });
  };

  const closeFoodModal = () => {
    setFoodModal({ open: false, foodId: null });
    setFoodForm({ fname: "", description: "", price: "", available: true });
  };

  const handleSaveFood = async (event) => {
    event.preventDefault();
    if (!foodForm.fname.trim()) {
      setActionStatus({ type: "error", message: "Food name is required." });
      return;
    }
    const parsedPrice = Number(foodForm.price);
    if (foodForm.price !== "" && (Number.isNaN(parsedPrice) || parsedPrice < 0)) {
      setActionStatus({ type: "error", message: "Price must be a valid number (0 or greater)." });
      return;
    }
    try {
      setFoodSaving(true);
      const payload = {
        fname: foodForm.fname.trim(),
        description: foodForm.description.trim(),
        price: parsedPrice > 0 ? parsedPrice : 0,
        available: Boolean(foodForm.available),
      };
      const res = await api.put(`/employee/foods/${foodModal.foodId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActionStatus({ type: "success", message: res?.data?.msg || "Food updated." });
      closeFoodModal();
      await loadDashboard();
    } catch (e) {
      setActionStatus({ type: "error", message: e?.response?.data?.msg || "Could not update food." });
    } finally {
      setFoodSaving(false);
    }
  };

  const handleToggleFoodAvailability = async (food) => {
    const foodId = food._id || food.key;
    const nextAvailable = food.available === false;
    try {
      const res = await api.put(
        `/employee/foods/${foodId}`,
        { available: nextAvailable },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActionStatus({
        type: "success",
        message: res?.data?.msg || `Item marked as ${nextAvailable ? "available" : "unavailable"}.`,
      });
      await loadDashboard();
    } catch (e) {
      setActionStatus({ type: "error", message: e?.response?.data?.msg || "Could not update availability." });
    }
  };

  const handleToggleUserBlock = async (user) => {
    if (user.role !== "customer") return;
    const nextBlocked = !user.blocked;
    const confirmed = window.confirm(
      nextBlocked ? `Block customer "${user.name}"? They will not be able to login.` : `Unblock customer "${user.name}"?`
    );
    if (!confirmed) return;
    try {
      const res = await api.put(
        `/employee/users/${user._id}/block`,
        { blocked: nextBlocked },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActionStatus({ type: "success", message: res?.data?.msg || "User updated." });
      await loadDashboard();
    } catch (e) {
      setActionStatus({ type: "error", message: e?.response?.data?.msg || "Could not update user." });
    }
  };

  const openUserDetails = (user) => {
    setSelectedEmployeeUser(user);
  };

  const openCategoryItems = (category) => {
    setSelectedEmployeeCategory(category);
    setCategoryFoodsPage(1);
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
      { id: "orders", label: "Orders", icon: "📦" },
      { id: "users", label: "Users", icon: "👤" },
    ],
    []
  );

  if (!token || !authUser) return <Navigate to="/" replace />;
  if (!isEmployee) return <Navigate to="/" replace />;

  const panelClass = "rounded-2xl border border-[color:var(--a-border)] bg-[var(--a-card)] p-5 shadow-lg";
  const tableHeadClass = "border-b border-[color:var(--a-border)] text-[var(--a-muted)]";
  const tableRowClass = "border-b border-[color:var(--a-border)] text-[var(--a-text)]";
  const chromeLink = "text-[var(--a-chrome-muted)] transition hover:text-[var(--a-chrome-text)]";

  const paginationControls = (safePage, totalPages, setPage) =>
    totalPages > 1 ? (
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--a-border)] pt-4">
        <p className="text-xs text-[var(--a-muted)]">
          Page {safePage} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-[color:var(--a-border)] px-3 py-1.5 text-xs font-medium text-[var(--a-heading)] transition hover:bg-[var(--a-soft)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setPage(page)}
              className={`min-w-8 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                page === safePage
                  ? "bg-[#ee6e73] text-white dark:bg-[#421F37]"
                  : "border border-[color:var(--a-border)] text-[var(--a-heading)] hover:bg-[var(--a-soft)]"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-lg border border-[color:var(--a-border)] px-3 py-1.5 text-xs font-medium text-[var(--a-heading)] transition hover:bg-[var(--a-soft)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    ) : null;

  return (
    <div
      className="flex min-h-screen bg-[var(--a-bg)] text-[var(--a-text)] transition-colors duration-300"
      style={isDark ? darkVars : lightVars}
    >
      <aside className="flex w-60 shrink-0 flex-col border-r border-white/15 bg-[var(--a-sidebar)] text-[var(--a-chrome-text)] sm:w-64">
        <div className="px-5 pt-5">
          <div className="mb-5 flex h-8 w-8 items-center justify-center rounded-md bg-white/20 text-sm font-bold text-white">
            R
          </div>
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-3 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/25 text-sm font-semibold text-white">
              {employeeInitials}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{authUser.name || "Employee"}</p>
              <p className="text-xs text-white/75">Employee</p>
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
              You have successfully logged in!
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
                Employee <span className="text-[#ee6e73] dark:text-[#f0a8ad]">Dashboard</span>
              </h1>
              <p className="mt-2 text-sm text-[var(--a-muted)]">Daily operations overview for restaurant staff</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <StatCard
                  label="New Orders"
                  value={newOrderCount}
                  iconBg={isDark ? "bg-[#421F37] text-rose-200" : "bg-[#ee6e73]/15 text-[#c94d55]"}
                  icon={<span className="text-sm">🆕</span>}
                />
                <StatCard
                  label="Pending"
                  value={pendingCount}
                  iconBg={isDark ? "bg-[#421F37] text-rose-200" : "bg-[#ee6e73]/15 text-[#c94d55]"}
                  icon={<span className="text-sm">⏳</span>}
                />
                <StatCard
                  label="Delivered"
                  value={deliveredCount}
                  iconBg={isDark ? "bg-[#421F37] text-rose-200" : "bg-[#ee6e73]/15 text-[#c94d55]"}
                  icon={<span className="text-sm">✓</span>}
                />
                <StatCard
                  label="Menu Items"
                  value={menuItemCount}
                  iconBg={isDark ? "bg-[#421F37] text-rose-200" : "bg-[#ee6e73]/15 text-[#c94d55]"}
                  icon={<span className="text-sm">🍽</span>}
                />
                <StatCard
                  label="Total Users"
                  value={totalUserCount}
                  iconBg={isDark ? "bg-[#421F37] text-rose-200" : "bg-[#ee6e73]/15 text-[#c94d55]"}
                  icon={<span className="text-sm">👤</span>}
                />
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className={panelClass}>
                  <h2 className="text-lg font-semibold text-[var(--a-heading)]">Work Instructions</h2>
                  <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-6 text-[var(--a-text)]">
                    <li>
                      Check <span className="font-semibold text-[var(--a-heading)]">New Orders</span> and click{" "}
                      <span className="font-semibold text-[var(--a-heading)]">Confirm</span> to move them into Pending.
                      Review item details, customer info, and delivery address in each order row.
                    </li>
                    <li>
                      Prepare food for orders in <span className="font-semibold text-[var(--a-heading)]">Pending</span>{" "}
                      and mark them <span className="font-semibold text-[var(--a-heading)]">Delivered</span> when
                      complete.
                    </li>
                    <li>
                      Use <span className="font-semibold text-[var(--a-heading)]">Foods</span> to edit item
                      names, descriptions, prices, and set Available / Unavailable.
                    </li>
                    <li>
                      Open <span className="font-semibold text-[var(--a-heading)]">Category</span> to view category
                      groups and food counts.
                    </li>
                    <li>
                      Open the <span className="font-semibold text-[var(--a-heading)]">Users</span> section to view
                      customers and block or unblock accounts.
                    </li>
                    <li>Refresh the dashboard after updates to keep order counts accurate.</li>
                  </ol>
                </div>

                <div className={panelClass}>
                  <h2 className="text-lg font-semibold text-[var(--a-heading)]">Quick Actions</h2>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveSection("orders")}
                      className="rounded-lg bg-[var(--a-accent)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[var(--a-accent-hover)]"
                    >
                      View New Orders ({newOrderCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection("orders")}
                      className="rounded-lg border border-[color:var(--a-border)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--a-heading)] transition hover:bg-[var(--a-soft)]"
                    >
                      Check Pending ({pendingCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection("foods")}
                      className="rounded-lg border border-[color:var(--a-border)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--a-heading)] transition hover:bg-[var(--a-soft)]"
                    >
                      Manage Foods
                    </button>
                    <button
                      type="button"
                      onClick={loadDashboard}
                      className="rounded-lg border border-[color:var(--a-border)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--a-heading)] transition hover:bg-[var(--a-soft)]"
                    >
                      Refresh Dashboard
                    </button>
                  </div>
                </div>
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
              </div>
              <p className="mt-3 text-sm text-[var(--a-muted)]">
                Showing {(safeFoodsPage - 1) * FOODS_PER_PAGE + (filteredFoodRows.length ? 1 : 0)}–
                {Math.min(safeFoodsPage * FOODS_PER_PAGE, filteredFoodRows.length)} of {filteredFoodRows.length}
                {foodsSearch.trim() ? ` (filtered from ${foodRows.length})` : ""} items
              </p>

              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className={tableHeadClass}>
                      <th className="py-3 pr-4 font-semibold">Name</th>
                      <th className="py-3 pr-4 font-semibold">Description</th>
                      <th className="py-3 pr-4 font-semibold">Category</th>
                      <th className="py-3 pr-4 font-semibold">Price</th>
                      <th className="py-3 pr-4 font-semibold">Status</th>
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
                        <td className="py-3 pr-4 align-top">
                          <FoodAvailabilityCell food={food} onToggle={handleToggleFoodAvailability} />
                        </td>
                        <td className="py-3 pr-2 align-top text-right">
                          <FoodActionMenu onEdit={() => openEditFoodModal(food)} />
                        </td>
                      </tr>
                    ))}
                    {filteredFoodRows.length === 0 && (
                      <tr>
                        <td className="py-6 text-center text-[var(--a-muted)]" colSpan={6}>
                          {foodsSearch.trim() ? "No foods match your search." : "No foods found."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {filteredFoodRows.length > 0 && paginationControls(safeFoodsPage, foodsTotalPages, setFoodsPage)}
            </section>
          ) : activeSection === "categories" ? (
            <section className={panelClass}>
              {selectedEmployeeCategory ? (
                <>
                  <button
                    type="button"
                    onClick={() => setSelectedEmployeeCategory(null)}
                    className="rounded-lg border border-[color:var(--a-border)] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--a-heading)] transition hover:bg-[var(--a-soft)]"
                  >
                    ← Back to Categories
                  </button>
                  <h2 className="mt-4 text-center text-3xl font-semibold text-[var(--a-heading)]">
                    {selectedEmployeeCategory.name}
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
                          <th className="py-3 pr-4 font-semibold">Status</th>
                          <th className="py-3 pr-2 text-right font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedCategoryFoodRows.map((food) => (
                          <tr key={food.key} className={tableRowClass}>
                            <td className="py-3 pr-4 align-top">
                              <div className="flex items-center gap-3">
                                <img
                                  src={
                                    food.image ||
                                    categoryImageFor(selectedEmployeeCategory.name) ||
                                    "/images/Snacks.jpg"
                                  }
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
                            <td className="py-3 pr-4 align-top">
                              <FoodAvailabilityCell food={food} onToggle={handleToggleFoodAvailability} />
                            </td>
                            <td className="py-3 pr-2 align-top text-right">
                              <FoodActionMenu onEdit={() => openEditFoodModal(food)} />
                            </td>
                          </tr>
                        ))}
                        {categoryFoodRows.length === 0 && (
                          <tr>
                            <td className="py-6 text-center text-[var(--a-muted)]" colSpan={5}>
                              No foods in this category.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {categoryFoodRows.length > 0 &&
                    paginationControls(safeCategoryFoodsPage, categoryFoodsTotalPages, setCategoryFoodsPage)}
                </>
              ) : (
                <>
                  <h2 className="text-center text-3xl font-semibold text-[var(--a-heading)]">Categories</h2>
                  <p className="mt-2 text-center text-sm text-[var(--a-muted)]">
                    Click a category to view its foods. Changes also appear on the public{" "}
                    <Link
                      to="/food-categories"
                      className="font-medium text-[#ee6e73] underline-offset-2 hover:underline dark:text-[#f0a8ad]"
                    >
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
                    <Link
                      to="/food-categories"
                      className="shrink-0 rounded-lg border border-[color:var(--a-border)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--a-heading)] transition hover:bg-[var(--a-soft)]"
                    >
                      View Page
                    </Link>
                  </div>
                  <p className="mt-3 text-sm text-[var(--a-muted)]">
                    Showing {(safeCategoriesPage - 1) * CATEGORIES_PER_PAGE + (filteredCategoryRows.length ? 1 : 0)}–
                    {Math.min(safeCategoriesPage * CATEGORIES_PER_PAGE, filteredCategoryRows.length)} of{" "}
                    {filteredCategoryRows.length}
                    {categoriesSearch.trim() ? ` (filtered from ${employeeCategoryRows.length})` : ""} categories
                  </p>

                  <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {paginatedCategoryRows.map((category) => {
                      const imageSrc = categoryImageFor(category.name, category.image);
                      const summary =
                        category.longDesc || category.shortDesc || "Explore the Foods of this category!";
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
                          className="cursor-pointer rounded-xl border border-[color:var(--a-border)] bg-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-[var(--a-inset)]"
                        >
                          <div className="food-media-frame h-40 overflow-hidden rounded-t-xl">
                            <img src={imageSrc} alt={category.name} className="food-media" />
                          </div>
                          <div className="p-4">
                            <h3 className="text-xl font-semibold text-[var(--a-heading)]">{category.name}</h3>
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

                  {filteredCategoryRows.length > 0 &&
                    paginationControls(safeCategoriesPage, categoriesTotalPages, setCategoriesPage)}
                </>
              )}
            </section>
          ) : activeSection === "orders" ? (
            <section className={`space-y-6 ${panelClass}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold text-[var(--a-heading)]">Orders</h2>
                  <p className="mt-1 text-sm text-[var(--a-muted)]">
                    New paid/online orders appear under <span className="font-semibold">New Orders</span>. Click Confirm
                    to move them to Pending.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadDashboard}
                  className="rounded-lg border border-[color:var(--a-border)] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--a-heading)] transition hover:bg-[var(--a-soft)]"
                >
                  Refresh
                </button>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-[var(--a-heading)]">
                  New Orders <span className="text-base font-medium text-[var(--a-muted)]">({newOrders.length})</span>
                </h2>
                <p className="mt-1 text-sm text-[var(--a-muted)]">
                  Includes Cash on Delivery and Online paid orders waiting for confirm.
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
                      {newOrders.map((order) => (
                        <tr key={order._id} className={tableRowClass}>
                          <td className="py-2 pr-4 font-medium">{order.orderId}</td>
                          <td className="max-w-xs py-2 pr-4">
                            <p>{order.foodName}</p>
                            {order.deliveryType === "delivery" && (
                              <p className="mt-0.5 text-[11px] text-[var(--a-muted)]">Home delivery</p>
                            )}
                          </td>
                          <td className="py-2 pr-4">{order.userId?.name || "-"}</td>
                          <td className="py-2 pr-4 font-semibold text-[var(--a-heading)]">
                            {formatAmount(orderAmount(order))}
                          </td>
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
                              className="rounded bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                              onClick={() => handleConfirmOrder(order._id)}
                            >
                              Confirm
                            </button>
                          </td>
                        </tr>
                      ))}
                      {newOrders.length === 0 && (
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
                  Pending <span className="text-base font-medium text-[var(--a-muted)]">({pendingOrders.length})</span>
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
                      {pendingOrders.map((order) => (
                        <tr key={order._id} className={tableRowClass}>
                          <td className="py-2 pr-4 font-medium">{order.orderId}</td>
                          <td className="max-w-xs py-2 pr-4">{order.foodName}</td>
                          <td className="py-2 pr-4">{order.userId?.name || "-"}</td>
                          <td className="py-2 pr-4 font-semibold text-[var(--a-heading)]">
                            {formatAmount(orderAmount(order))}
                          </td>
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
                      {pendingOrders.length === 0 && (
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
                          <td className="py-2 pr-4 font-semibold text-[var(--a-heading)]">
                            {formatAmount(orderAmount(order))}
                          </td>
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
              {selectedEmployeeUser ? (
                <>
                  <button
                    type="button"
                    onClick={() => setSelectedEmployeeUser(null)}
                    className="rounded-lg border border-[color:var(--a-border)] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--a-heading)] transition hover:bg-[var(--a-soft)]"
                  >
                    ← Back to Users
                  </button>
                  <h2 className="mt-4 text-center text-3xl font-semibold text-[var(--a-heading)]">User Details</h2>
                  <div className="mx-auto mt-6 max-w-xl space-y-3 rounded-xl border border-[color:var(--a-border)] bg-[var(--a-inset)] p-5">
                    <div className="flex flex-col items-center gap-3 pb-2">
                      <div className="h-24 w-24 overflow-hidden rounded-full border border-[color:var(--a-border)] bg-[var(--a-card)]">
                        {selectedEmployeeUser.image ? (
                          <img
                            src={selectedEmployeeUser.image}
                            alt={selectedEmployeeUser.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-[var(--a-heading)]">
                            {String(selectedEmployeeUser.name || "U")
                              .trim()
                              .slice(0, 1)
                              .toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-[var(--a-muted)]">Name</span>
                      <span className="font-medium text-[var(--a-heading)]">{selectedEmployeeUser.name}</span>
                    </div>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-[var(--a-muted)]">Mail</span>
                      <span className="break-all text-right font-medium text-[var(--a-heading)]">
                        {selectedEmployeeUser.email}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-[var(--a-muted)]">Phone</span>
                      <span className="font-medium text-[var(--a-heading)]">{selectedEmployeeUser.phone || "—"}</span>
                    </div>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-[var(--a-muted)]">Category</span>
                      <span className="font-medium text-[var(--a-heading)]">{roleLabel(selectedEmployeeUser.role)}</span>
                    </div>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-[var(--a-muted)]">Orders purchased</span>
                      <span className="font-medium text-[var(--a-heading)]">{selectedEmployeeUser.orderCount || 0}</span>
                    </div>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-[var(--a-muted)]">Status</span>
                      <span
                        className={`font-medium ${selectedEmployeeUser.blocked ? "text-rose-500" : "text-emerald-500"}`}
                      >
                        {selectedEmployeeUser.blocked ? "Blocked" : "Active"}
                      </span>
                    </div>
                  </div>
                  {selectedEmployeeUser.role === "customer" && (
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        className={`rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white transition ${
                          selectedEmployeeUser.blocked
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : "bg-rose-600 hover:bg-rose-700"
                        }`}
                        onClick={() => handleToggleUserBlock(selectedEmployeeUser)}
                      >
                        {selectedEmployeeUser.blocked ? "Unblock" : "Block"}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h2 className="text-center text-3xl font-semibold text-[var(--a-heading)]">Users</h2>
                  <p className="mt-2 text-center text-sm text-[var(--a-muted)]">
                    Click a user to view details. Use ⋮ to block or unblock customers.
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
                    Showing {(safeUsersPage - 1) * USERS_PER_PAGE + (filteredUsers.length ? 1 : 0)}–
                    {Math.min(safeUsersPage * USERS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
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
                        {paginatedUsers.map((user, index) => (
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
                                  {user.blocked && (
                                    <div className="mt-0.5 text-xs font-semibold text-rose-500">Blocked</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 pr-4 text-[var(--a-heading)]">{roleLabel(user.role)}</td>
                            <td className="py-3 pr-2 text-right" onClick={(event) => event.stopPropagation()}>
                              <EmployeeUserActionMenu
                                user={user}
                                openAbove={index === paginatedUsers.length - 1 && paginatedUsers.length > 1}
                                onView={() => openUserDetails(user)}
                                onToggleBlock={() => handleToggleUserBlock(user)}
                              />
                            </td>
                          </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                          <tr>
                            <td className="py-6 text-center text-[var(--a-muted)]" colSpan={3}>
                              {usersSearch.trim() ? "No users match your search." : "No users found."}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {filteredUsers.length > 0 && paginationControls(safeUsersPage, usersTotalPages, setUsersPage)}
                </>
              )}
            </section>
          ) : null}
        </main>
      </div>

      {foodModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[color:var(--a-border)] bg-[var(--a-card)] p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-[var(--a-heading)]">Edit Food</h3>
            <form className="mt-5 space-y-4" onSubmit={handleSaveFood}>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--a-muted)]" htmlFor="food-fname">
                  Name
                </label>
                <input
                  id="food-fname"
                  type="text"
                  value={foodForm.fname}
                  onChange={(event) => setFoodForm((prev) => ({ ...prev, fname: event.target.value }))}
                  className="w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-bg)] px-3 py-2 text-sm text-[var(--a-heading)] outline-none focus:ring-2 focus:ring-[#ee6e73]/30 dark:focus:ring-[#421F37]/40"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--a-muted)]" htmlFor="food-description">
                  Description
                </label>
                <textarea
                  id="food-description"
                  value={foodForm.description}
                  onChange={(event) => setFoodForm((prev) => ({ ...prev, description: event.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-bg)] px-3 py-2 text-sm text-[var(--a-heading)] outline-none focus:ring-2 focus:ring-[#ee6e73]/30 dark:focus:ring-[#421F37]/40"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--a-muted)]" htmlFor="food-price">
                  Price
                </label>
                <input
                  id="food-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={foodForm.price}
                  onChange={(event) => setFoodForm((prev) => ({ ...prev, price: event.target.value }))}
                  className="w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-bg)] px-3 py-2 text-sm text-[var(--a-heading)] outline-none focus:ring-2 focus:ring-[#ee6e73]/30 dark:focus:ring-[#421F37]/40"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-[var(--a-text)]">
                <input
                  type="checkbox"
                  checked={foodForm.available}
                  onChange={(event) => setFoodForm((prev) => ({ ...prev, available: event.target.checked }))}
                  className="rounded border-[color:var(--a-border)]"
                />
                Available for ordering
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeFoodModal}
                  className="rounded-lg border border-[color:var(--a-border)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--a-heading)] transition hover:bg-[var(--a-soft)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={foodSaving}
                  className="rounded-lg bg-[var(--a-accent)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[var(--a-accent-hover)] disabled:opacity-60"
                >
                  {foodSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
