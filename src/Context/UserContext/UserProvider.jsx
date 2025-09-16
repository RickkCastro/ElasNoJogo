import { useState, useEffect } from "react";
import { UserContext } from "./UserContext";
import supabase from "../../lib/supabaseClient";

export default function UserProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState(null);

  useEffect(() => {
    // Busca perfil do usuário logado
    async function fetchProfile(userId) {
      if (!userId) return null;
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      return profileData;
    }

    // Atualiza perfil baseado na sessão
    async function updateProfile(currentSession) {
      if (currentSession?.user) {
        const profileData = await fetchProfile(currentSession.user.id);
        setProfile(profileData);
      } else {
        setProfile(null);
      }
      setLoading(false);
    }

    // Inicializa: busca sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      updateProfile(session);
    });

    // Listener de mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      updateProfile(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Logout do usuário
  const logout = async () => {
    await supabase.auth.signOut();
  };

  // Extrai user da session para compatibilidade
  const user = session?.user || null;

  return (
    <UserContext.Provider value={{ user, profile, loading, error, logout }}>
      {children}
    </UserContext.Provider>
  );
}
