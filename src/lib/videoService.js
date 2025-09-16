import supabase from "./supabaseClient.js";
import { VIDEO_CONFIG } from "./videoConfig.js";

// Função auxiliar para extrair o path do storage a partir da URL pública
const extractStoragePath = (publicUrl, bucketName) => {
  if (!publicUrl) return null;

  try {
    // URL formato: https://domain.supabase.co/storage/v1/object/public/bucketName/path/file.ext
    const url = new URL(publicUrl);
    const pathParts = url.pathname.split("/");

    // Encontra o índice do bucket name no path
    const bucketIndex = pathParts.findIndex((part) => part === bucketName);

    // Se encontrou o bucket, retorna tudo que vem depois
    if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
      return pathParts.slice(bucketIndex + 1).join("/");
    }

    return null;
  } catch (error) {
    console.warn("Erro ao extrair path do storage:", error);
    return null;
  }
};

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

// Busca vídeos de um usuário específico
export const getUserVideos = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("videos")
      .select(`*`)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error("Erro ao buscar vídeos do usuário:", error);
    return { success: false, error: error.message };
  }
};

// Deleta vídeo do banco e do storage
export const deleteVideo = async (videoId, videoUrl, thumbnailUrl) => {
  try {
    // Primeiro deleta do banco de dados
    const { error: dbError } = await supabase
      .from("videos")
      .delete()
      .eq("id", videoId);

    if (dbError) throw dbError;

    // Depois tenta deletar do storage
    try {
      // Deleta o vídeo do storage
      const videoPath = extractStoragePath(
        videoUrl,
        VIDEO_CONFIG.STORAGE.VIDEO_BUCKET
      );
      if (videoPath) {
        console.log(
          "Deletando vídeo do storage:",
          videoPath,
          "da URL:",
          videoUrl
        );
        const { error: videoError } = await supabase.storage
          .from(VIDEO_CONFIG.STORAGE.VIDEO_BUCKET)
          .remove([videoPath]);

        if (videoError) {
          console.warn("Erro ao deletar vídeo do storage:", videoError);
        } else {
          console.log("Vídeo deletado com sucesso do storage");
        }
      } else {
        console.warn(
          "Não foi possível extrair o path do vídeo da URL:",
          videoUrl
        );
      }

      // Deleta a thumbnail do storage
      const thumbnailPath = extractStoragePath(
        thumbnailUrl,
        VIDEO_CONFIG.STORAGE.THUMBNAIL_BUCKET
      );
      if (thumbnailPath) {
        console.log(
          "Deletando thumbnail do storage:",
          thumbnailPath,
          "da URL:",
          thumbnailUrl
        );
        const { error: thumbError } = await supabase.storage
          .from(VIDEO_CONFIG.STORAGE.THUMBNAIL_BUCKET)
          .remove([thumbnailPath]);

        if (thumbError) {
          console.warn("Erro ao deletar thumbnail do storage:", thumbError);
        } else {
          console.log("Thumbnail deletada com sucesso do storage");
        }
      } else {
        console.warn(
          "Não foi possível extrair o path da thumbnail da URL:",
          thumbnailUrl
        );
      }
    } catch (storageError) {
      // Log do erro mas não falha a operação
      console.warn("Erro ao deletar arquivos do storage:", storageError);
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar vídeo:", error);
    return { success: false, error: error.message };
  }
};

// Atualiza informações do vídeo
export const updateVideo = async (videoId, { title, description }) => {
  try {
    const { data, error } = await supabase
      .from("videos")
      .update({
        title,
        description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", videoId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error("Erro ao atualizar vídeo:", error);
    return { success: false, error: error.message };
  }
};

// Busca vídeos de usuários que o usuário atual está seguindo
export const getFollowingVideos = async (
  userId,
  page = 0,
  limit = VIDEO_CONFIG.FEED.ITEMS_PER_PAGE
) => {
  try {
    // Primeiro busca os IDs dos usuários que o usuário atual está seguindo
    const { data: followingData, error: followingError } = await supabase
      .from("followers")
      .select("following_id")
      .eq("follower_id", userId);

    if (followingError) throw followingError;

    const followingIds = followingData.map((f) => f.following_id);

    // Se não está seguindo ninguém, retorna array vazio
    if (followingIds.length === 0) {
      return {
        success: true,
        data: [],
        hasMore: false,
      };
    }

    // Busca vídeos primeiro
    const { data: videosData, error: videosError } = await supabase
      .from("videos")
      .select("*")
      .in("user_id", followingIds)
      .order("created_at", { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (videosError) throw videosError;

    // Se não há vídeos, retorna array vazio
    if (!videosData || videosData.length === 0) {
      return {
        success: true,
        data: [],
        hasMore: false,
      };
    }

    // Busca profiles dos usuários dos vídeos
    const userIds = [...new Set(videosData.map((v) => v.user_id))];
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, username, avatar_url")
      .in("id", userIds);

    if (profilesError) throw profilesError;

    // Cria um mapa de profiles para lookup rápido
    const profilesMap = (profilesData || []).reduce((acc, profile) => {
      acc[profile.id] = profile;
      return acc;
    }, {});

    // Combina vídeos com profiles
    const videos = videosData.map((video) => ({
      ...video,
      user: {
        id: video.user_id,
        avatar_url: profilesMap[video.user_id]?.avatar_url,
        full_name: profilesMap[video.user_id]?.full_name,
        username: profilesMap[video.user_id]?.username,
      },
    }));

    return {
      success: true,
      data: videos,
      hasMore: videosData?.length === limit,
    };
  } catch (error) {
    console.error("Erro ao buscar vídeos dos seguidos:", error);
    return { success: false, error: error.message };
  }
};
