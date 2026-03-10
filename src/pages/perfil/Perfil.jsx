import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import useUser from "../../hooks/useUser";
import Loading from "../../components/Loading.jsx";
import Button from "../../components/Button.jsx";
import VideoModal from "../../components/VideoModal.jsx";
import useProfileById from "../../hooks/useProfileById.js";
import { useUserVideos } from "../../hooks/useVideo.js";
import { useFollowers, useIsFollowing } from "../../hooks/useFollowers.js";
import { getProfileContacts } from "../../lib/contactService.js";
import { calcularIdade } from "../../utils/date.js";

// Components
import ProfileHeader from "./components/ProfileHeader.jsx";
import ContactBar from "./components/ContactBar.jsx";
import ProfileStats from "./components/ProfileStats.jsx";
import VideoGrid from "./components/VideoGrid.jsx";

export default function ProfileScreen() {
    const { user, profile, logout, contacts } = useUser();
    const navigate = useNavigate();
    const { id } = useParams();

    const isOwnProfile = !id || (user && id === user.id);

    const { profile: otherProfile, loading: otherProfileLoading } =
        useProfileById(!isOwnProfile && id ? id : null);

    const displayProfile = isOwnProfile ? profile : otherProfile;
    const profileLoading = isOwnProfile
        ? !user || !profile
        : otherProfileLoading;

    const targetUserId = isOwnProfile ? user?.id : id;
    const { videos, loading: videosLoading } = useUserVideos(targetUserId);

    const {
        followersCount,
        followingCount,
        loading: followersLoading,
        refetch: refetchFollowers,
    } = useFollowers(targetUserId);

    const {
        isFollowing,
        loading: followLoading,
        toggleFollow,
    } = useIsFollowing(user?.id, !isOwnProfile ? id : null, refetchFollowers);

    const [selectedVideo, setSelectedVideo] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Contatos do outro usuário (se visualizando perfil alheio)
    const [externalContacts, setExternalContacts] = useState([]);
    useEffect(() => {
        async function fetchExternalContacts() {
            if (isOwnProfile || !id) return;
            const data = await getProfileContacts(id);
            setExternalContacts(data);
        }
        fetchExternalContacts();
    }, [id, isOwnProfile]);

    const displayContacts = isOwnProfile ? contacts : externalContacts;

    const handleOpenVideo = (video) => {
        setSelectedVideo(video);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedVideo(null);
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
        }
    };

    if (profileLoading) {
        return <Loading />;
    }

    if (id && !isOwnProfile && !displayProfile) {
        return (
            <div className="relative min-h-screen bg-background">
                <div className="h-screen md:h-[calc(100vh-64px)] flex items-center justify-center">
                    <p className="text-foreground-muted">
                        Usuário não encontrado
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-background flex flex-col">
            <ProfileHeader
                isOwnProfile={isOwnProfile}
                displayProfile={displayProfile}
                user={user}
                onBack={() => navigate("/")}
                onLogout={handleLogout}
            />

            <div className="flex-1 flex flex-col items-center justify-start px-4 pt-8 pb-8">
                <div className="w-28 h-28 rounded-full bg-primary-500/80 border-2 border-primary/30 flex items-center justify-center mb-4">
                    {displayProfile?.avatar_url ? (
                        <img
                            src={displayProfile.avatar_url}
                            alt={
                                displayProfile.full_name ||
                                (isOwnProfile ? user.email : "Usuário")
                            }
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        <span className="text-foreground text-2xl font-bold">
                            {displayProfile?.full_name?.charAt(0) ||
                                (isOwnProfile ? user?.email?.charAt(0) : "U") ||
                                "U"}
                        </span>
                    )}
                </div>
                <h2 className="font-semibold text-lg text-foreground mb-1">
                    {displayProfile?.full_name ||
                        (isOwnProfile ? user.email : "Usuário")}
                </h2>
                <p className="text-foreground-muted text-base mb-2">
                    @{displayProfile?.username || "username"}
                </p>
                <div className="flex flex-col items-center gap-1 mb-2 w-full max-w-xs">
                    {displayProfile?.localizacao && (
                        <span className="text-foreground-muted text-sm text-center w-full">
                            {displayProfile.localizacao}
                        </span>
                    )}
                    {displayProfile?.data_nascimento &&
                        calcularIdade(displayProfile.data_nascimento) !==
                            null && (
                            <span className="text-foreground-muted text-sm text-center">
                                {calcularIdade(displayProfile.data_nascimento)}{" "}
                                anos
                            </span>
                        )}
                    {displayProfile?.posicao && (
                        <span className="text-foreground-muted text-sm text-center truncate w-full">
                            {displayProfile.posicao}
                        </span>
                    )}
                </div>
                {displayProfile?.bio && (
                    <p className="text-foreground-muted text-sm leading-relaxed text-center max-w-xs mb-4">
                        {displayProfile.bio}
                    </p>
                )}

                <ContactBar contacts={displayContacts} />

                <div className="flex gap-3 w-full max-w-xs mb-6">
                    {isOwnProfile ? (
                        <Button
                            variant="principal"
                            size="medium"
                            className="flex-1"
                            onClick={() => navigate("/editar-perfil")}
                        >
                            Editar perfil
                        </Button>
                    ) : (
                        <Button
                            variant={isFollowing ? "secundario" : "principal"}
                            size="medium"
                            className="flex-1"
                            onClick={toggleFollow}
                            disabled={followLoading}
                        >
                            {followLoading
                                ? "..."
                                : isFollowing
                                ? "Seguindo"
                                : "Seguir"}
                        </Button>
                    )}
                </div>

                <ProfileStats
                    followingCount={followingCount}
                    followersCount={followersCount}
                    videosCount={videos.length}
                    followersLoading={followersLoading}
                    onFollowingClick={() =>
                        navigate(
                            `/perfil/${targetUserId}/followers?tab=following`
                        )
                    }
                    onFollowersClick={() =>
                        navigate(
                            `/perfil/${targetUserId}/followers?tab=followers`
                        )
                    }
                />

                <VideoGrid
                    videos={videos}
                    loading={videosLoading}
                    isOwnProfile={isOwnProfile}
                    onOpenVideo={handleOpenVideo}
                    displayProfile={displayProfile}
                />
            </div>

            <VideoModal
                video={selectedVideo}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </div>
    );
}