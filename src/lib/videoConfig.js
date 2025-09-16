export const VIDEO_CONFIG = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_DURATION: 60, // 60 segundos
  ALLOWED_TYPES: [
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo", // .avi
  ],
  QUALITY_SETTINGS: {
    mobile: {
      width: 720,
      height: 1280,
      bitrate: "1000k",
    },
    desktop: {
      width: 1080,
      height: 1920,
      bitrate: "2000k",
    },
  },
  THUMBNAIL: {
    WIDTH: 720,
    HEIGHT: 1280,
    QUALITY: 0.8,
    FORMAT: "image/jpeg",
  },
  FEED: {
    ITEMS_PER_PAGE: 10,
    PRELOAD_COUNT: 2, // pré-carregamento
    INTERSECTION_THRESHOLD: 0.5, // visibilidade
  },
  STORAGE: {
    VIDEO_BUCKET: "videos",
    THUMBNAIL_BUCKET: "thumbnails",
  },
};

export const VIDEO_ERRORS = {
  FILE_TOO_LARGE: `Arquivo muito grande. Tamanho máximo: ${
    VIDEO_CONFIG.MAX_FILE_SIZE / 1024 / 1024
  }MB`,
  INVALID_TYPE: "Tipo de arquivo não suportado. Use MP4, WebM ou QuickTime",
  TOO_LONG: `Vídeo muito longo. Duração máxima: ${VIDEO_CONFIG.MAX_DURATION} segundos`,
  UPLOAD_FAILED: "Falha no upload. Tente novamente",
  NETWORK_ERROR: "Erro de conexão. Verifique sua internet",
  AUTH_REQUIRED: "Você precisa estar logado para fazer upload de vídeos",
  THUMBNAIL_FAILED: "Falha ao gerar thumbnail do vídeo",
};

// Formata duração em mm:ss
export const formatDuration = (seconds) => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

// Formata visualizações
export const formatViews = (count) => {
  if (count < 1000) return count.toString();
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
  return `${(count / 1000000).toFixed(1)}M`;
};

// Formata likes
export const formatLikes = (count) => {
  if (count < 1000) return count.toString();
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
  return `${(count / 1000000).toFixed(1)}M`;
};

// Retorna orientação do vídeo
export const getVideoOrientation = (width, height) => {
  const ratio = width / height;
  if (ratio > 1.2) return "landscape";
  if (ratio < 0.8) return "portrait";
  return "square";
};

// Valida arquivo de vídeo
export const validateVideoFile = (file) => {
  const errors = [];
  if (!file) {
    errors.push("Arquivo é obrigatório");
    return { isValid: false, errors };
  }
  if (file.size > VIDEO_CONFIG.MAX_FILE_SIZE) {
    errors.push(VIDEO_ERRORS.FILE_TOO_LARGE);
  }
  if (!VIDEO_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    errors.push(VIDEO_ERRORS.INVALID_TYPE);
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
};
