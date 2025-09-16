import { useEffect, useRef, useState } from "react";
import Menu from "../../components/Menu";
import { useVideos } from "../../hooks/useVideo";
import {
  VIDEO_CONFIG,
  formatViews,
  formatDuration,
} from "../../lib/videoConfig";
import { Link } from "react-router-dom";

export default function Feed() {
  // Hook customizado para buscar vídeos paginados
  const { videos, loading, error, hasMore, loadVideos } = useVideos();
  // Índice do vídeo atualmente visível
  const [activeIndex, setActiveIndex] = useState(0);
  // Página atual de vídeos carregados
  const [page, setPage] = useState(0);
  // Mapeia se o vídeo é vertical (portrait) para cada índice
  const [portraitMap, setPortraitMap] = useState({});

  // Referências para o container de rolagem e para os elementos <video>
  const containerRef = useRef(null);
  const videoRefs = useRef([]);
  // Flag para saber se o usuário já interagiu (necessário para liberar som em alguns navegadores)
  const userInteractedRef = useRef(false);

  // Carrega a primeira página de vídeos ao montar o componente
  useEffect(() => {
    loadVideos(0);
    setPage(0);
  }, [loadVideos]);

  // Após a primeira interação do usuário, tenta ativar o som do vídeo atual
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onInteract = () => {
      userInteractedRef.current = true;
      const current = videoRefs.current[activeIndex];
      if (current) {
        (async () => {
          try {
            current.muted = false;
            current.volume = 1;
            await current.play();
          } catch (e) {
            void e;
            // Se autoplay com som for bloqueado, mantém mudo e tenta novamente
            current.muted = true;
            try {
              await current.play();
            } catch (e2) {
              void e2;
            }
          }
        })();
      }
    };
    el.addEventListener("pointerdown", onInteract);
    el.addEventListener("touchstart", onInteract);
    return () => {
      el.removeEventListener("pointerdown", onInteract);
      el.removeEventListener("touchstart", onInteract);
    };
  }, [activeIndex]);

  // Observa quais vídeos estão visíveis para atualizar o activeIndex
  useEffect(() => {
    if (!containerRef.current) return;
    const options = {
      root: containerRef.current,
      threshold: VIDEO_CONFIG.FEED.INTERSECTION_THRESHOLD || 0.5,
    };
    const onIntersect = (entries) => {
      entries.forEach((entry) => {
        const idx = Number(entry.target.dataset.index);
        if (!Number.isNaN(idx) && entry.isIntersecting) setActiveIndex(idx);
      });
    };
    const observer = new IntersectionObserver(onIntersect, options);
    const items = containerRef.current.querySelectorAll("[data-feed-item]");
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [videos]);

  // Garante que apenas o vídeo ativo está desmutado e tocando; os demais ficam pausados e mutados
  useEffect(() => {
    videoRefs.current.forEach((vid, idx) => {
      if (!vid) return;
      if (idx === activeIndex) {
        const playCurrent = async () => {
          try {
            vid.muted = false;
            vid.volume = 1;
            await vid.play();
          } catch (e) {
            void e;
            vid.muted = true;
            try {
              await vid.play();
            } catch (e2) {
              void e2;
            }
          }
        };
        // Garante play ao carregar dados do vídeo
        const onLoadedData = () => {
          if (vid.paused) playCurrent();
        };
        vid.addEventListener("loadeddata", onLoadedData, { once: true });
        playCurrent();
      } else {
        vid.pause();
        vid.muted = true;
      }
    });
  }, [activeIndex]);

  // Precarrega vídeos próximos ao ativo para experiência mais fluida
  useEffect(() => {
    const preloadCount = VIDEO_CONFIG.FEED.PRELOAD_COUNT || 2;
    videoRefs.current.forEach((vid, idx) => {
      if (!vid) return;
      vid.preload =
        idx >= activeIndex && idx <= activeIndex + preloadCount
          ? "auto"
          : "metadata";
    });
  }, [activeIndex]);

  // Busca mais vídeos ao chegar perto do fim; reinicia para o início ao passar da sentinela
  useEffect(() => {
    if (videos.length === 0) return;
    const nearEndThreshold = 2;
    const isNearEnd = activeIndex >= videos.length - 1 - nearEndThreshold;
    if (isNearEnd && hasMore && !loading) {
      const next = page + 1;
      loadVideos(next).then((count) => {
        if (count > 0) setPage(next);
      });
    }
    if (!hasMore && activeIndex === videos.length) {
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
      setActiveIndex(0);
    }
  }, [activeIndex, videos.length, hasMore, loading, page, loadVideos]);

  // Detecta se o vídeo é vertical (portrait) ao carregar metadados
  const handleLoadedMetadata = (idx, el) => {
    if (!el) return;
    const isPortrait =
      el.videoWidth > 0 &&
      el.videoHeight > 0 &&
      el.videoHeight >= el.videoWidth;
    setPortraitMap((prev) => ({ ...prev, [idx]: isPortrait }));
  };

  return (
    <div className="relative min-h-screen bg-background">
      <Menu />
      <div
        ref={containerRef}
        className="h-screen md:h-[calc(100vh-64px)] overflow-y-scroll snap-y snap-mandatory scroll-smooth"
      >
        {/* Mensagens de erro e carregamento */}
        {error && (
          <div className="h-screen flex items-center justify-center text-red-500">
            Erro: {error}
          </div>
        )}
        {!error && videos.length === 0 && (
          <div className="h-screen flex items-center justify-center text-foreground-muted">
            {loading ? "Carregando vídeos..." : "Nenhum vídeo disponível"}
          </div>
        )}
        {/* Lista de vídeos do feed */}
        {videos.map((video, idx) => (
          <section
            key={`${video.id || idx}-${idx}`}
            data-feed-item
            data-index={idx}
            className="relative w-full snap-start flex items-center justify-center bg-black h-screen md:h-[calc(100vh-64px)]"
          >
            <div className="relative h-full w-full mx-auto max-w-none md:max-w-[640px] lg:max-w-[720px]">
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
              <video
                ref={(el) => (videoRefs.current[idx] = el)}
                src={video.video_url}
                poster={video.thumbnail_url || undefined}
                className={`w-full h-full ${
                  portraitMap[idx]
                    ? "object-cover md:object-contain"
                    : "object-contain"
                }`}
                playsInline
                muted
                autoPlay={idx === 0}
                loop
                preload={idx <= 1 ? "auto" : "metadata"}
                onLoadedMetadata={(e) =>
                  handleLoadedMetadata(idx, e.currentTarget)
                }
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
        ))}
        {/* Sentinela: espaço extra após o último vídeo para detectar rolagem além do fim */}
        {videos.length > 0 && (
          <section
            data-feed-item
            data-index={videos.length}
            className="w-full h-screen md:h-[calc(100vh-64px)] snap-start bg-black flex items-center justify-center text-foreground-subtle text-sm"
          >
            {/* Espaço vazio/sentinela */}
          </section>
        )}
      </div>
    </div>
  );
}
