import { useState, useEffect } from "react";
import { UserContext } from "./UserContext";
import supabase from "../../lib/supabaseClient";

export default function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Função utilitária para buscar perfil
    async function fetchProfile(userId) {
      if (!userId) return null;
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      return error ? null : profileData;
    }

    async function fetchUserAndProfile() {
      try {
        setError(null);
        const { data, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        
        setUser(data.user);
        const profileData = await fetchProfile(data.user?.id);
        setProfile(profileData);
      } catch (err) {
        console.error('Error fetching user and profile:', err);
        setError(err.message);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUserAndProfile();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        try {
          setError(null);
          setLoading(true);
          setUser(session?.user ?? null);
          const profileData = await fetchProfile(session?.user?.id);
          setProfile(profileData);
        } catch (err) {
          console.error('Error in auth state change:', err);
          setError(err.message);
          setUser(null);
          setProfile(null);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, profile, loading, error, supabase }}>
      {children}
    </UserContext.Provider>
  );
}
