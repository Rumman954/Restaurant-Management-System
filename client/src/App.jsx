import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import CategoriesPage from "./pages/CategoriesPage";
import FoodsPage from "./pages/FoodsPage";

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/food-categories" element={<CategoriesPage />} />
          <Route path="/foods" element={<FoodsPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
