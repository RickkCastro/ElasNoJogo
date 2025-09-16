import { useState, useEffect, useCallback } from "react";
import supabase from "../lib/supabaseClient";

// Hook para gerenciar seguidores de um usuário específico
export function useFollowers(userId) {
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchFollowData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Busca seguidores (quem segue este usuário)
      const { data: followersData, error: followersError } = await supabase
        .from("followers")
        .select(
          `
          id,
          follower_id,
          profiles!followers_follower_id_profiles_fkey (
            id,
            full_name,
            username,
            avatar_url
          )
        `
        )
        .eq("following_id", userId);

      if (followersError) throw followersError;

      // Busca quem este usuário está seguindo
      const { data: followingData, error: followingError } = await supabase
        .from("followers")
        .select(
          `
          id,
          following_id,
          profiles!followers_following_id_profiles_fkey (
            id,
            full_name,
            username,
            avatar_url
          )
        `
        )
        .eq("follower_id", userId);

      if (followingError) throw followingError;

      setFollowers(followersData || []);
      setFollowing(followingData || []);
      setFollowersCount(followersData?.length || 0);
      setFollowingCount(followingData?.length || 0);
    } catch (error) {
      console.error("Erro ao buscar dados de seguidores:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchFollowData();
  }, [fetchFollowData]);

  return {
    followers,
    following,
    followersCount,
    followingCount,
    loading,
    refetch: fetchFollowData,
  };
}

// Hook para verificar se o usuário atual está seguindo outro usuário
export function useIsFollowing(currentUserId, targetUserId, onFollowChange) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkIsFollowing = useCallback(async () => {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("followers")
        .select("id")
        .eq("follower_id", currentUserId)
        .eq("following_id", targetUserId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      setIsFollowing(!!data);
    } catch (error) {
      console.error("Erro ao verificar se está seguindo:", error);
      setIsFollowing(false);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, targetUserId]);

  useEffect(() => {
    checkIsFollowing();
  }, [checkIsFollowing]);

  const toggleFollow = async () => {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
      return;
    }

    try {
      setLoading(true);
      
      if (isFollowing) {
        // Deixar de seguir
        const { error } = await supabase
          .from("followers")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", targetUserId);

        if (error) throw error;
        setIsFollowing(false);
      } else {
        // Seguir
        const { error } = await supabase.from("followers").insert({
          follower_id: currentUserId,
          following_id: targetUserId,
        });

        if (error) throw error;
        setIsFollowing(true);
      }

      // Notifica sobre a mudança para atualizar os contadores
      if (onFollowChange) {
        onFollowChange();
      }
    } catch (error) {
      console.error("Erro ao alterar status de seguir:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    isFollowing,
    loading,
    toggleFollow,
    refetch: checkIsFollowing,
  };
}
