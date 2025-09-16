import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";

export default function useProfileById(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()
      .then(({ data, error }) => {
        setProfile(data || null);
        setError(error);
        setLoading(false);
      });
  }, [userId]);

  return { profile, loading, error };
}
