import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import CategoriesPage from "./pages/CategoriesPage";
import FoodsPage from "./pages/FoodsPage";
import CartPage from "./pages/CartPage";
import AdminPage from "./pages/AdminPage";
import EmployeePage from "./pages/EmployeePage";

function App() {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith("/admin") || location.pathname.startsWith("/employee");

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f4f5] text-zinc-700 transition-colors duration-300 dark:bg-[#0b0e14] dark:text-zinc-300">
      {!isDashboardRoute && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/food-categories" element={<CategoriesPage />} />
          <Route path="/foods" element={<FoodsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/employee" element={<EmployeePage />} />
          <Route path="/Foods" element={<Navigate to="/foods" replace />} />
          <Route path="/Food-categories" element={<Navigate to="/food-categories" replace />} />
        </Routes>
      </main>
      {!isDashboardRoute && <Footer />}
    </div>
  );
}

export default App;
