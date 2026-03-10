import Loading from "../../../components/Loading.jsx";

export default function VideoGrid({
    videos,
    loading,
    isOwnProfile,
    onOpenVideo,
    displayProfile
}) {
    return (
        <div className="w-full max-w-4xl px-4">
            <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
                Vídeos ({videos.length})
            </h3>

            {loading ? (
                <div className="flex justify-center py-8">
                    <Loading />
                </div>
            ) : videos.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-foreground-muted">
                        {isOwnProfile
                            ? "Você ainda não publicou nenhum vídeo"
                            : "Este usuário ainda não publicou vídeos"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                    {videos.map((video) => (
                        <div
                            key={video.id}
                            className="aspect-[9/16] bg-background-light rounded-lg overflow-hidden hover:opacity-80 transition-opacity cursor-pointer"
                            onClick={() =>
                                onOpenVideo({
                                    ...video,
                                    user: displayProfile,
                                })
                            }
                        >
                            {video.thumbnail_url ? (
                                <img
                                    src={video.thumbnail_url}
                                    alt={video.title || "Vídeo"}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                    <svg
                                        className="w-8 h-8 text-primary/40"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}