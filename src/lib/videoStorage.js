import supabase from "./supabaseClient.js";
import {
  VIDEO_CONFIG,
  VIDEO_ERRORS,
  validateVideoFile,
} from "./videoConfig.js";

// Gera nome único para cada arquivo enviado
export const generateFileName = (originalName, userId) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const extension = originalName.split(".").pop();
  return `${userId}/${timestamp}_${random}.${extension}`;
};

// Extrai metadados do vídeo (duração, dimensões, tamanho)
export const getVideoMetadata = (file) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      const metadata = {
        duration: Math.round(video.duration),
        width: video.videoWidth,
        height: video.videoHeight,
        size: file.size,
      };
      URL.revokeObjectURL(url);
      resolve(metadata);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Erro ao carregar metadados do vídeo"));
    };

    video.src = url;
  });
};

// Gera thumbnail automática do vídeo
export const generateThumbnail = (videoFile) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    video.onloadeddata = () => {
      video.currentTime = 1; // Pega frame do segundo 1
    };

    video.onseeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(video.src);
          resolve(blob);
        },
        VIDEO_CONFIG.THUMBNAIL.FORMAT,
        VIDEO_CONFIG.THUMBNAIL.QUALITY
      );
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error("Erro ao gerar thumbnail"));
    };

    video.src = URL.createObjectURL(videoFile);
  });
};

// Faz upload do vídeo para o Supabase Storage
export const uploadVideo = async (file, userId) => {
  try {
    const validation = validateVideoFile(file);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(", "));
    }
    const fileName = generateFileName(file.name, userId);
    const { data, error } = await supabase.storage
      .from(VIDEO_CONFIG.STORAGE.VIDEO_BUCKET)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });
    if (error) throw error;
    const { data: urlData } = supabase.storage
      .from(VIDEO_CONFIG.STORAGE.VIDEO_BUCKET)
      .getPublicUrl(fileName);
    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error("Erro no upload:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Faz upload da thumbnail do vídeo
export const uploadThumbnail = async (thumbnailBlob, userId, videoId) => {
  try {
    const fileName = `${userId}/${videoId}_thumb.jpg`;
    const { error } = await supabase.storage
      .from(VIDEO_CONFIG.STORAGE.THUMBNAIL_BUCKET)
      .upload(fileName, thumbnailBlob, {
        cacheControl: "3600",
        upsert: false,
        contentType: "image/jpeg",
      });
    if (error) throw error;
    const { data: urlData } = supabase.storage
      .from(VIDEO_CONFIG.STORAGE.THUMBNAIL_BUCKET)
      .getPublicUrl(fileName);
    return {
      success: true,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error("Erro no upload da thumbnail:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
