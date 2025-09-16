import { useState, useCallback } from "react";
import supabase from "../lib/supabaseClient";
import { useFollowers } from "./useFollowers";
import useUser from "./useUser";

/**
 * Hook para buscar vídeos de usuários que o usuário atual está seguindo
 */
export function useFollowingVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Usa o UserProvider para obter o usuário atual
  const { user } = useUser();

  // Usa o hook useFollowers para obter a lista de usuários seguidos
  const { following, loading: followersLoading } = useFollowers(user?.id);

  const loadVideos = useCallback(
    async (page = 0, pageSize = 10) => {
      try {
        setLoading(true);
        setError(null);

        if (!user?.id) {
          throw new Error("Usuário não autenticado");
        }

        // Extrai os IDs dos usuários seguidos
        const followingIds = following.map((f) => f.following_id);

        // Se não está seguindo ninguém, retorna array vazio
        if (followingIds.length === 0) {
          setVideos([]);
          setHasMore(false);
          return 0;
        }

        // Busca vídeos dos usuários seguidos
        const { data: videosData, error: videosError } = await supabase
          .from("videos")
          .select("*")
          .in("user_id", followingIds)
          .order("created_at", { ascending: false })
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (videosError) throw videosError;

        // Se não há vídeos, define estado vazio
        if (!videosData || videosData.length === 0) {
          if (page === 0) setVideos([]);
          setHasMore(false);
          return 0;
        }

        // Busca profiles dos usuários dos vídeos para adicionar dados do usuário
        const userIds = [...new Set(videosData.map((v) => v.user_id))];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, username, avatar_url")
          .in("id", userIds);

        // Cria um mapa de profiles para lookup rápido
        const profilesMap = (profilesData || []).reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {});

        // Combina vídeos com dados dos usuários
        const videosWithUsers = videosData.map((video) => ({
          ...video,
          user: {
            id: video.user_id,
            avatar_url: profilesMap[video.user_id]?.avatar_url,
            full_name: profilesMap[video.user_id]?.full_name,
            username: profilesMap[video.user_id]?.username,
          },
        }));

        // Se é a primeira página, reseta o estado
        if (page === 0) {
          setVideos(videosWithUsers);
        } else {
          setVideos((prev) => [...prev, ...videosWithUsers]);
        }

        // Atualiza estado de paginação
        setHasMore(videosData.length === pageSize);

        return videosWithUsers.length;
      } catch (err) {
        console.error("Erro ao carregar vídeos dos seguidos:", err);
        setError(err.message);
        return 0;
      } finally {
        setLoading(false);
      }
    },
    [user?.id, following]
  );

  return {
    videos,
    loading: loading || followersLoading,
    error,
    hasMore,
    loadVideos,
  };
}
