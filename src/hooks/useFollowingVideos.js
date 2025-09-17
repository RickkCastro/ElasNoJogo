import { useState, useCallback } from "react";
import supabase from "../lib/supabaseClient";
import { useFollowers } from "./useFollowers";
import useUser from "./useUser";
import { VIDEO_CONFIG } from "../lib/videoConfig";

/**
 * Hook para buscar vídeos de usuários que o usuário atual está seguindo
 */
export function useFollowingVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const { user } = useUser();
  const { following, loading: followersLoading } = useFollowers(user?.id);

  const loadVideos = useCallback(
    async (page = 0, pageSize = VIDEO_CONFIG.FEED.ITEMS_PER_PAGE) => {
      try {
        setLoading(true);
        setError(null);

        if (!user?.id) {
          throw new Error("Usuário não autenticado");
        }

        const followingIds = following.map((f) => f.following_id);

        if (followingIds.length === 0) {
          setVideos([]);
          setHasMore(false);
          return 0;
        }

        const { data: videosData, error: videosError } = await supabase
          .from("videos")
          .select("*")
          .in("user_id", followingIds)
          .order("created_at", { ascending: false })
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (videosError) throw videosError;

        if (!videosData || videosData.length === 0) {
          if (page === 0) setVideos([]);
          setHasMore(false);
          return 0;
        }

        const userIds = [...new Set(videosData.map((v) => v.user_id))];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, username, avatar_url")
          .in("id", userIds);

        const profilesMap = (profilesData || []).reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {});

        const videosWithUsers = videosData.map((video) => ({
          ...video,
          user: {
            id: video.user_id,
            avatar_url: profilesMap[video.user_id]?.avatar_url,
            full_name: profilesMap[video.user_id]?.full_name,
            username: profilesMap[video.user_id]?.username,
          },
        }));

        if (page === 0) {
          setVideos(videosWithUsers);
        } else {
          // Evita itens duplicados ao concatenar
          setVideos((prev) => {
            const seen = new Set(prev.map((v) => v.id));
            const deduped = videosWithUsers.filter((v) => !seen.has(v.id));
            return [...prev, ...deduped];
          });
        }

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
