import supabase from "./supabaseClient.js";
import { VIDEO_CONFIG } from "./videoConfig.js";

// Cria um novo vídeo no banco de dados
export const createVideo = async ({
  id,
  title,
  description,
  video_url,
  thumbnail_url,
  duration,
  user_id,
}) => {
  try {
    const { data, error } = await supabase
      .from("videos")
      .insert([
        {
          id,
          title,
          description,
          video_url,
          thumbnail_url,
          duration,
          user_id,
          views_count: 0,
          likes_count: 0,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Erro ao criar vídeo:", error);
    return { success: false, error: error.message };
  }
};

// Busca vídeos paginados, incluindo id e avatar_url do perfil do usuário
export const getVideos = async (
  page = 0,
  limit = VIDEO_CONFIG.FEED.ITEMS_PER_PAGE
) => {
  try {
    const { data, error } = await supabase.rpc("get_videos_with_profiles", {
      page_offset: page * limit,
      page_limit: limit,
    });

    if (error) throw error;

    // Transforma os dados para o formato esperado pelo front-end
    const videos = (data || []).map((video) => ({
      ...video,
      user: {
        id: video.profile_id,
        avatar_url: video.avatar_url,
        full_name: video.full_name,
        username: video.username,
      },
    }));

    return {
      success: true,
      data: videos,
      hasMore: data?.length === limit,
    };
  } catch (error) {
    console.error("Erro ao buscar vídeos:", error);
    return { success: false, error: error.message };
  }
};
