import useUser from "./useUser";

export default function useAuthRedirect() {
  const { user, profile, loading } = useUser();

  if (loading) return { status: "loading" };
  if (!user) return { status: "unauthenticated" };
  if (user && !profile) return { status: "incomplete" };
  return { status: "authenticated" };
}
