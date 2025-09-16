import { Link } from "react-router-dom";
import { formatViews, formatDuration } from "../lib/videoConfig";

export default function VideoFeedItem({
  video,
  index,
  portraitMap,
  onLoadedMetadata,
  videoRef,
}) {

  return (
    <section
      data-feed-item
      data-index={index}
      className="relative w-full snap-start flex items-center justify-center bg-black h-screen md:h-[calc(100vh-64px)]"
    >
      <div className="relative h-full w-full mx-auto max-w-none md:max-w-[640px] lg:max-w-[720px]">
        {/* Avatar do usuário */}
        <div className="absolute bottom-50 md:bottom-30 right-4 z-20 flex flex-col items-end">
          <Link
            to={`/perfil/${video.user.id}`}
            className="rounded-full border-2 border-white shadow-lg w-12 h-12 flex items-center justify-center bg-primary-500/80 hover:scale-105 transition-transform"
            title="Ver perfil"
          >
            {video.user?.avatar_url ? (
              <img
                src={video.user.avatar_url}
                alt="Avatar do usuário"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-foreground text-sm font-bold">
                {video.user?.full_name?.charAt(0) ||
                  video.user?.email?.charAt(0) ||
                  "U"}
              </span>
            )}
          </Link>
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
        />

        {/* Gradiente escuro para legibilidade do texto */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-55 bg-gradient-to-t from-black to-transparent" />

        {/* Overlay de informações do vídeo */}
        <div className="absolute left-0 right-0 px-4 text-left bottom-24 md:bottom-6">
          <p className="text-foreground-muted font-semibold mb-1">
            @{video.user.username}
          </p>
          <h3 className="text-foreground text-lg font-bold truncate">
            {video.title || "Sem título"}
          </h3>
          <p className="text-foreground-muted text-sm line-clamp-5">
            {video.description || ""}
          </p>
          <div className="text-foreground-subtle text-xs mt-1">
            ⏱️ {formatDuration(video.duration || 0)} · 👁️{" "}
            {formatViews(video.views_count || 0)}
          </div>
        </div>
      </div>
    </section>
  );
}
