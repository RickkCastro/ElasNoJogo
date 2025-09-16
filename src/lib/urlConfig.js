// Configurações de URL para diferentes ambientes

export const getBaseURL = () => {
  // Em produção (Vercel)
  if (import.meta.env.PROD) {
    // Usa a variável de ambiente se disponível, senão usa o padrão
    return (
      import.meta.env.VITE_PRODUCTION_URL || "https://elas-no-jogo.vercel.app"
    );
  }

  // Em desenvolvimento (localhost)
  return "http://localhost:5173";
};

export const getRedirectURL = (path = "") => {
  const baseURL = getBaseURL();
  return path ? `${baseURL}${path}` : baseURL;
};

// URLs específicas para diferentes fluxos
export const REDIRECT_URLS = {
  LOGIN_SUCCESS: getRedirectURL("/"),
  LOGIN_ERROR: getRedirectURL("/login"),
  LOGOUT: getRedirectURL("/login"),
};
