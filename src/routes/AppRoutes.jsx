import { Routes, Route } from "react-router-dom";
import Home from "../pages/home/Home.jsx";
import NotFound from "../pages/notFound/NoutFound.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* Outras rotas protegidas */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
