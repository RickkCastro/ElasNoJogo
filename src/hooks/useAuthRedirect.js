import useUser from "./useUser";

export default function useAuthRedirect() {
  const { user, profile, loading, error } = useUser();

  if (error) console.error(error);

  // Retorna o status de autenticação de forma padronizada
  if (loading || error) return { status: "loading" };
  if (!user) return { status: "unauthenticated" };
  if (user && !profile) return { status: "incomplete" };
  return { status: "authenticated" };
}
