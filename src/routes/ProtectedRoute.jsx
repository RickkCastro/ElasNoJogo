import { Navigate, useLocation } from "react-router-dom";
import useUser from "../hooks/useUser";

export default function ProtectedRoute({ children }) {
  const { user, profile, loading } = useUser();
  const location = useLocation();

  if (loading) return <div>Carregando...</div>;

  // Não autenticado: só pode acessar /login
  if (!user) {
    if (location.pathname !== "/login") {
      return <Navigate to="/login" replace />;
    }
    return children;
  }

  // Autenticado, mas sem perfil: só pode acessar /complete-profile
  if (user && !profile) {
    if (location.pathname !== "/complete-profile") {
      return <Navigate to="/complete-profile" replace />;
    }
    return children;
  }

  // Autenticado e com perfil: não pode acessar /login ou /complete-profile
  if (user && profile) {
    if (
      location.pathname === "/login" ||
      location.pathname === "/complete-profile"
    ) {
      return <Navigate to="/" replace />;
    }
    return children;
  }

  return null; // fallback de segurança
}
