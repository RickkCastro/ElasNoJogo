import { Link } from "react-router-dom";
import { formatViews, formatDuration } from "../lib/videoConfig";
import { useRef } from "react";
import { incrementVideoViews } from "../lib/videoService";
import useVideoLike from "../hooks/useVideoLike";
import { FaHeart } from "react-icons/fa";

export default function VideoFeedItem({
  video,
  index,
  portraitMap,
  onLoadedMetadata,
  videoRef,
}) {
  const hasCounted = useRef(false);

  function onTimeUpdate(e) {
    const el = e.currentTarget;
    // Evita divisão por zero quando metadados ainda não carregaram
    const duration = el.duration || 0;
    const current = el.currentTime || 0;
    const watchedRatio = duration > 0 ? current / duration : 0;
    if (!hasCounted.current && watchedRatio > 0.8 && video && video.id) {
      incrementVideoViews(video.id);
      hasCounted.current = true;
    }
  }

  function onEnded() {
    hasCounted.current = false;
  }

  const {
    liked,
    likesCount,
    loading: likeLoading,
    toggleLike,
  } = useVideoLike(video.id);

  return (
    <section
      data-feed-item
      data-index={index}
      className="relative w-full snap-start flex items-center justify-center bg-black h-screen md:h-[calc(100vh-64px)]"
    >
      <div className="relative h-full w-full mx-auto max-w-none md:max-w-[640px] lg:max-w-[720px]">
        {/* Avatar do usuário e botão de like (itens laterais) */}
        <div className="absolute z-30 flex flex-col items-center gap-4 right-4 bottom-30 md:right-6 md:bottom-24 lg:right-8 pointer-events-auto">
          <Link
            to={`/perfil/${video.user.id}`}
            className="group relative rounded-full w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-black/40 backdrop-blur-sm border border-white/20 hover:bg-black/60 active:scale-95 transition-all duration-300 hover:border-white/40"
            title="Ver perfil"
          >
            {video.user?.avatar_url ? (
              <img
                src={video.user.avatar_url}
                alt="Avatar do usuário"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white text-sm md:text-base font-semibold">
                {video.user?.full_name?.charAt(0) ||
                  video.user?.email?.charAt(0) ||
                  "U"}
              </span>
            )}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent to-white/10 group-hover:to-white/20 transition-all duration-300" />
          </Link>

          <button
            className={`relative rounded-full w-12 h-12 md:w-14 md:h-14 backdrop-blur-sm flex flex-col items-center justify-center group active:scale-95 transition-all duration-300 ${
              liked
                ? "bg-red-500/90 border border-red-400/50 hover:bg-red-600/90"
                : "bg-black/40 border border-white/20 hover:bg-black/60 hover:border-white/40"
            }`}
            onClick={toggleLike}
            disabled={likeLoading}
            title={liked ? "Descurtir" : "Curtir"}
          >
            <FaHeart
              size={20}
              className={`transition-all duration-300 group-hover:scale-110 ${
                liked ? "text-white" : "text-white"
              }`}
            />
            <span className="absolute -bottom-6 text-white text-xs font-medium bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/20">
              {likesCount}
            </span>
            {likeLoading && (
              <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
            )}
          </button>
        </div>

        {/* Elemento de vídeo */}
        <video
          ref={videoRef}
          src={video.video_url}
          poster={video.thumbnail_url || undefined}
          className={`w-full h-full ${
            portraitMap[index]
              ? "object-cover md:object-contain"
              : "object-contain"
          }`}
          playsInline
          muted
          autoPlay={index === 0}
          loop
          preload={index <= 1 ? "auto" : "metadata"}
          onLoadedMetadata={(e) => onLoadedMetadata(index, e.currentTarget)}
          onTimeUpdate={onTimeUpdate}
          onEnded={onEnded}
        />

        {/* Gradiente escuro para legibilidade do texto */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 md:h-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Overlay de informações do vídeo */}
        <div className="absolute left-0 right-16 md:right-20 lg:right-24 px-4 text-left bottom-20 md:bottom-6">
          <p className="text-white/80 font-semibold mb-1 text-sm">
            @{video.user.username}
          </p>
          <h3 className="text-white text-base md:text-lg font-bold line-clamp-2 mb-2">
            {video.title || "Sem título"}
          </h3>
          <p className="text-white/70 text-sm line-clamp-5 mb-2">
            {video.description || ""}
          </p>
          <div className="text-white/60 text-xs flex items-center gap-3">
            <span className="flex items-center gap-1">
              ⏱️ {formatDuration(video.duration || 0)}
            </span>
            <span className="flex items-center gap-1">
              👁️ {formatViews(video.views_count || 0)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
