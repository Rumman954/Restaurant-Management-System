import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import CategoriesPage from "./pages/CategoriesPage";
import FoodsPage from "./pages/FoodsPage";
import AdminPage from "./pages/AdminPage";

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa] text-zinc-800 transition-colors duration-300 dark:bg-[#0b0e14] dark:text-zinc-300">
      {!isAdminRoute && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/food-categories" element={<CategoriesPage />} />
          <Route path="/foods" element={<FoodsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/Foods" element={<Navigate to="/foods" replace />} />
          <Route path="/Food-categories" element={<Navigate to="/food-categories" replace />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;
