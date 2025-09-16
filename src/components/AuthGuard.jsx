import { Navigate, useLocation } from "react-router-dom";
import useAuthRedirect from "../hooks/useAuthRedirect";
import Loading from "./Loading";

export default function AuthGuard({ children }) {
  const { status } = useAuthRedirect();
  const location = useLocation();

  if (status === "loading") {
    return (
      <Loading
        showText={true}
        fullScreen={true}
        size="xlarge"
        text="Carregando..."
      />
    );
  }

  // Não autenticado: só pode acessar /login
  if (status === "unauthenticated") {
    if (location.pathname !== "/login") {
      return <Navigate to="/login" replace />;
    }
    return children;
  }

  // Autenticado, mas sem perfil: só pode acessar /complete-profile
  if (status === "incomplete") {
    if (location.pathname !== "/complete-profile") {
      return <Navigate to="/complete-profile" replace />;
    }
    return children;
  }

  // Autenticado e com perfil: não pode acessar /login ou /complete-profile
  if (status === "authenticated") {
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
