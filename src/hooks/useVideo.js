import { useState, useCallback, useEffect } from "react";
import useUser from "./useUser.js";
import {
  uploadVideo,
  uploadThumbnail,
  getVideoMetadata,
  generateThumbnail,
} from "../lib/videoStorage.js";
import {
  createVideo,
  getVideos,
  getUserVideos,
  deleteVideo as deleteVideoFromDB,
  updateVideo,
} from "../lib/videoService.js";
import { VIDEO_CONFIG, VIDEO_ERRORS } from "../lib/videoConfig.js";

// Hook para upload de vídeo
export const useVideoUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useUser();

  // Envia vídeo e salva no banco
  const handleUpload = async (videoFile, { title, description }) => {
    if (!user) {
      setError(VIDEO_ERRORS.AUTH_REQUIRED);
      return { success: false };
    }
    setUploading(true);
    setError(null);
    try {
      const metadata = await getVideoMetadata(videoFile);
      if (metadata.duration > VIDEO_CONFIG.MAX_DURATION) {
        throw new Error(VIDEO_ERRORS.TOO_LONG);
      }
      const videoResult = await uploadVideo(videoFile, user.id);
      if (!videoResult.success) {
        throw new Error(videoResult.error);
      }
      const thumbnailBlob = await generateThumbnail(videoFile);
      const videoId = crypto.randomUUID();
      const thumbnailResult = await uploadThumbnail(
        thumbnailBlob,
        user.id,
        videoId
      );
      const dbResult = await createVideo({
        id: videoId,
        title: title || "Sem título",
        description: description || "",
        video_url: videoResult.url,
        thumbnail_url: thumbnailResult.success ? thumbnailResult.url : null,
        duration: metadata.duration,
        user_id: user.id,
      });
      if (!dbResult.success) {
        throw new Error(dbResult.error);
      }
      return {
        success: true,
        video: dbResult.data,
      };
    } catch (err) {
      console.error("Erro no upload:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    error,
    uploadVideo: handleUpload,
  };
};

// Hook para buscar vídeos paginados
export const useVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Busca vídeos do banco
  const loadVideos = useCallback(async (page = 0) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getVideos(page, VIDEO_CONFIG.FEED.ITEMS_PER_PAGE);
      if (result.success) {
        const fetched = result.data || [];
        setHasMore(
          typeof result.hasMore === "boolean"
            ? result.hasMore
            : fetched.length === VIDEO_CONFIG.FEED.ITEMS_PER_PAGE
        );
        if (page === 0) {
          setVideos(fetched);
        } else {
          // Evita itens duplicados ao concatenar
          setVideos((prev) => {
            const seen = new Set(prev.map((v) => v.id));
            const deduped = fetched.filter((v) => !seen.has(v.id));
            return [...prev, ...deduped];
          });
        }
        return fetched.length;
      } else {
        setError(result.error);
        setHasMore(false);
        return 0;
      }
    } catch (err) {
      console.error("Erro ao carregar vídeos:", err);
      setError(err.message);
      setHasMore(false);
      return 0;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    videos,
    loading,
    error,
    hasMore,
    loadVideos,
  };
};

// Hook para buscar vídeos de um usuário específico
export const useUserVideos = (userId) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadUserVideos = useCallback(async () => {
    if (!userId) {
      setVideos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await getUserVideos(userId);
      if (result.success) {
        setVideos(result.data || []);
      } else {
        setError(result.error);
        setVideos([]);
      }
    } catch (err) {
      console.error("Erro ao carregar vídeos do usuário:", err);
      setError(err.message);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Carrega vídeos quando userId muda
  useEffect(() => {
    loadUserVideos();
  }, [loadUserVideos]);

  return {
    videos,
    loading,
    error,
    reloadVideos: loadUserVideos,
  };
};

// Hook para deletar vídeo
export const useVideoDelete = () => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const deleteVideo = async (videoId, videoUrl, thumbnailUrl) => {
    setDeleting(true);
    setError(null);
    try {
      const result = await deleteVideoFromDB(videoId, videoUrl, thumbnailUrl);
      if (!result.success) {
        throw new Error(result.error);
      }
      return { success: true };
    } catch (err) {
      console.error("Erro ao deletar vídeo:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setDeleting(false);
    }
  };

  return {
    deleting,
    error,
    deleteVideo,
  };
};

// Hook para editar vídeo
export const useVideoEdit = () => {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);

  const editVideo = async (videoId, { title, description }) => {
    setEditing(true);
    setError(null);
    try {
      const result = await updateVideo(videoId, { title, description });
      if (!result.success) {
        throw new Error(result.error);
      }
      return { success: true, data: result.data };
    } catch (err) {
      console.error("Erro ao editar vídeo:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setEditing(false);
    }
  };

  return {
    editing,
    error,
    editVideo,
  };
};
