import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import CategoriesPage from "./pages/CategoriesPage";
import FoodsPage from "./pages/FoodsPage";

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/food-categories" element={<CategoriesPage />} />
        <Route path="/foods" element={<FoodsPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
