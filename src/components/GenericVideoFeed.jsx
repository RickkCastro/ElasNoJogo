import { useEffect, useRef, useState } from "react";
import { VIDEO_CONFIG } from "../lib/videoConfig";
import VideoFeedItem from "./VideoFeedItem";
import Loading from "./Loading";

export default function GenericVideoFeed({
    className = "",
    containerClassName = "h-[100dvh] md:h-[calc(100vh-64px)] overflow-y-scroll snap-y snap-mandatory scroll-smooth",
    useVideosHook,
    emptyStateText = "Nenhum vídeo disponível",
    loadingText = "Carregando vídeos...",
}) {
    const { videos, loading, error, hasMore, loadVideos } = useVideosHook();
    const [activeIndex, setActiveIndex] = useState(0);
    const [page, setPage] = useState(0);
    const [portraitMap, setPortraitMap] = useState({});

    const containerRef = useRef(null);
    const videoRefs = useRef([]);
    const activeIndexRef = useRef(0);
    const userInteractedRef = useRef(false);

    // Sincroniza a ref com o estado do índice ativo
    useEffect(() => {
        activeIndexRef.current = activeIndex;
    }, [activeIndex]);

    // Carrega os vídeos ao montar
    useEffect(() => {
        loadVideos(0);
        setPage(0);
    }, [loadVideos]);

    // Habilita som após primeira interação do usuário (apenas uma vez)
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const onInteract = () => {
            if (userInteractedRef.current) return;
            userInteractedRef.current = true;
            const current = videoRefs.current[activeIndexRef.current];
            if (!current) return;
            (async () => {
                try {
                    current.muted = false;
                    current.volume = 1;
                    await current.play();
                } catch {
                    // Se autoplay com som for bloqueado, mantém mudo e tenta novamente
                    current.muted = true;
                    try {
                        await current.play();
                    } catch {
                        /* noop */
                    }
                }
            })();
        };

        el.addEventListener("pointerdown", onInteract, { once: true });
        el.addEventListener("touchstart", onInteract, { once: true });
        return () => {
            el.removeEventListener("pointerdown", onInteract);
            el.removeEventListener("touchstart", onInteract);
        };
    }, []);

    // Observa itens visíveis para definir o vídeo ativo
    useEffect(() => {
        if (!containerRef.current) return;
        const options = {
            root: containerRef.current,
            threshold: VIDEO_CONFIG.FEED.INTERSECTION_THRESHOLD || 0.5,
        };
        const onIntersect = (entries) => {
            entries.forEach((entry) => {
                const idx = Number(entry.target.dataset.index);
                if (!Number.isNaN(idx) && entry.isIntersecting) {
                    if (idx >= 0 && idx < videos.length) {
                        setActiveIndex(idx);
                    }
                }
            });
        };
        const observer = new IntersectionObserver(onIntersect, options);
        const items = containerRef.current.querySelectorAll("[data-feed-item]");
        items.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [videos]);

    // Mantém apenas o vídeo ativo tocando; os demais pausados e mutados
    useEffect(() => {
        videoRefs.current.forEach((vid, idx) => {
            if (!vid) return;
            if (idx === activeIndex) {
                const playCurrent = async () => {
                    try {
                        vid.muted = false;
                        vid.volume = 1;
                        await vid.play();
                    } catch {
                        vid.muted = true;
                        try {
                            await vid.play();
                        } catch {
                            /* noop */
                        }
                    }
                };
                const onLoadedData = () => {
                    if (vid.paused) playCurrent();
                };
                vid.addEventListener("loadeddata", onLoadedData, {
                    once: true,
                });
                playCurrent();
            } else {
                vid.pause();
                vid.muted = true;
            }
        });
    }, [activeIndex]);

    // Precarrega próximos vídeos
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

    // Carrega mais vídeos quando próximo do fim
    useEffect(() => {
        if (videos.length === 0) return;

        // Carrega próxima página quando está próximo do fim
        const nearEndThreshold = 3;
        const isNearEnd = activeIndex >= videos.length - nearEndThreshold;

        if (isNearEnd && hasMore && !loading) {
            const nextPage = page + 1;
            loadVideos(nextPage).then((count) => {
                if (count > 0) setPage(nextPage);
            });
        }
    }, [activeIndex, videos.length, hasMore, loading, page, loadVideos]);

    // Atualiza mapa portrait ao carregar metadados
    const handleLoadedMetadata = (idx, el) => {
        if (!el) return;
        const isPortrait =
            el.videoWidth > 0 &&
            el.videoHeight > 0 &&
            el.videoHeight >= el.videoWidth;
        setPortraitMap((prev) => ({ ...prev, [idx]: isPortrait }));
    };

    return (
        <div className={`relative bg-background ${className}`}>
            <div
                ref={containerRef}
                className={`${containerClassName} pb-20 md:pb-0`}
            >
                {error && (
                    <div className="h-screen flex items-center justify-center text-red-500">
                        Erro: {error}
                    </div>
                )}
                {!error && videos.length === 0 && (
                    <Loading
                        fullScreen={false}
                        preencher={true}
                        text={loading ? loadingText : emptyStateText}
                    />
                )}

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

                {/* Fim do feed - Sem mais vídeos disponíveis */}
                {!hasMore && videos.length > 0 && (
                    <section className="px-10 text-center w-full h-[100dvh] md:h-[calc(100vh-65px)] snap-start flex items-center justify-center text-2xl font-bold text-foreground bg-background">
                        UAU! Você chegou ao fim do feed
                    </section>
                )}
            </div>
        </div>
    );
}
