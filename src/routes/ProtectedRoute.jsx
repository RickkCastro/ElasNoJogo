import { Navigate, useLocation } from "react-router-dom";
import useUser from "../hooks/useUser";

/**
 * Protege rotas baseando-se no estado de autenticação do usuário.
 * - Usuário não autenticado: redireciona para /login (exceto se já estiver em /login)
 * - Usuário autenticado: impede acesso a /login, redirecionando para /
 */
export default function ProtectedRoute({ children }) {
    const { user, loading } = useUser();
    const location = useLocation();

    if (loading) {
        return <div>Carregando...</div>;
    }

    // Usuário não autenticado
    if (!user) {
        // Permite acesso apenas à página de login
        if (location.pathname !== "/login") {
            return <Navigate to="/login" replace />;
        }
        return children;
    }

    // Usuário autenticado
    if (location.pathname === "/login") {
        // Impede acesso à página de login
        return <Navigate to="/" replace />;
    }

    // Usuário autenticado e em rota permitida
    return children;
}
