import { Routes, Route } from "react-router-dom";
import Feed from "../pages/feed/Feed.jsx";
import NotFound from "../pages/notFound/NoutFound.jsx";
import Jogos from "../pages/jogos/Jogos.jsx";
import Seguindo from "../pages/seguindo/Seguindo.jsx";
import Perfil from "../pages/perfil/Perfil.jsx";
import Postar from "../pages/postar/Postar.jsx";
import EditarPerfil from "../pages/editarPerfil/EditarPerfil.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Feed />} />
      <Route path="/jogos" element={<Jogos />} />
      <Route path="/seguindo" element={<Seguindo />} />
      <Route path="/perfil" element={<Perfil />} />
      <Route path="/perfil/:id" element={<Perfil />} />
      <Route path="/editar-perfil" element={<EditarPerfil />} />
      <Route path="/postar" element={<Postar />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
