import { useEffect, useRef, useState } from "react";
import { useFollowingVideos } from "../hooks/useFollowingVideos";
import { VIDEO_CONFIG } from "../lib/videoConfig";
import VideoFeedItem from "./VideoFeedItem";
import Loading from "./Loading";

export default function FollowingVideoFeed({
  className = "",
  containerClassName = "h-screen md:h-[calc(100vh-64px)] overflow-y-scroll snap-y snap-mandatory scroll-smooth",
}) {
  // Hook customizado para buscar vídeos dos usuários seguidos
  const { videos, loading, error, hasMore, loadVideos } = useFollowingVideos();
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
    <div className={`relative min-h-screen bg-background ${className}`}>
      <div ref={containerRef} className={containerClassName}>
        {/* Mensagens de erro e carregamento */}
        {error && (
          <div className="h-screen flex items-center justify-center text-red-500">
            Erro: {error}
          </div>
        )}
        {!error && videos.length === 0 && (
          <Loading
            fullScreen={false}
            preencher={true}
            text={
              loading
                ? "Carregando vídeos..."
                : "Siga alguns usuários para ver vídeos aqui"
            }
          ></Loading>
        )}

        {/* Lista de vídeos do feed */}
        {videos.map((video, idx) => (
          <VideoFeedItem
            key={`${video.id || idx}-${idx}`}
            video={video}
            index={idx}
            portraitMap={portraitMap}
            onLoadedMetadata={handleLoadedMetadata}
            videoRef={(el) => (videoRefs.current[idx] = el)}
          />
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
