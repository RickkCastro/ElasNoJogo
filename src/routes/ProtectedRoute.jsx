import { Navigate } from "react-router-dom";
import useUser from "../hooks/useUser";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useUser();

  if (loading) {
    // Pode ser um spinner ou null
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
