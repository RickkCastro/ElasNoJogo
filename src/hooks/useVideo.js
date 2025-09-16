import { useState, useCallback } from "react";
import useUser from "./useUser.js";
import {
  uploadVideo,
  uploadThumbnail,
  getVideoMetadata,
  generateThumbnail,
} from "../lib/videoStorage.js";
import { createVideo, getVideos } from "../lib/videoService.js";
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
        if (page === 0) {
          setVideos(fetched);
        } else {
          setVideos((prev) => [...prev, ...fetched]);
        }
        // se retornou menos que o pageSize, não há mais páginas
        setHasMore(fetched.length === VIDEO_CONFIG.FEED.ITEMS_PER_PAGE);
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

  console.log("Current videos:", videos);

  return {
    videos,
    loading,
    error,
    hasMore,
    loadVideos,
  };
};
