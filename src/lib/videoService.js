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

// Busca vídeos paginados
export const getVideos = async (
  page = 0,
  limit = VIDEO_CONFIG.FEED.ITEMS_PER_PAGE
) => {
  try {
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);
    if (error) throw error;
    return {
      success: true,
      data: data || [],
      hasMore: data?.length === limit,
    };
  } catch (error) {
    console.error("Erro ao buscar vídeos:", error);
    return { success: false, error: error.message };
  }
};
