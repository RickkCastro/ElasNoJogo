export default function ProfileStats({
    followingCount,
    followersCount,
    videosCount,
    followersLoading,
    onFollowingClick,
    onFollowersClick
}) {
    return (
        <div className="flex justify-center items-center gap-8 mb-6">
            <button
                className="text-center hover:opacity-70 transition-opacity"
                onClick={onFollowingClick}
                disabled={followersLoading}
            >
                <span className="font-bold text-lg text-foreground block">
                    {followersLoading ? "..." : followingCount}
                </span>
                <p className="text-sm text-foreground-muted">
                    Seguindo
                </p>
            </button>
            <button
                className="text-center hover:opacity-70 transition-opacity"
                onClick={onFollowersClick}
                disabled={followersLoading}
            >
                <span className="font-bold text-lg text-foreground block">
                    {followersLoading ? "..." : followersCount}
                </span>
                <p className="text-sm text-foreground-muted">
                    Seguidores
                </p>
            </button>
            <div className="text-center">
                <span className="font-bold text-lg text-foreground">
                    {videosCount}
                </span>
                <p className="text-sm text-foreground-muted">Vídeos</p>
            </div>
        </div>
    );
}