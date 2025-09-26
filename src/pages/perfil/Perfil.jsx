// Função para calcular idade a partir da data de nascimento yyyy-mm-dd
function calcularIdade(dataNasc) {
    if (!dataNasc) return null;
    const [ano, mes, dia] = dataNasc.split("-");
    if (!ano || !mes || !dia) return null;
    const hoje = new Date();
    const nascimento = new Date(Number(ano), Number(mes) - 1, Number(dia));
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    return idade;
}
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import useUser from "../../hooks/useUser";
import Loading from "../../components/Loading.jsx";
import Button from "../../components/Button.jsx";
import VideoModal from "../../components/VideoModal.jsx";
import { IoLogOutOutline, IoChevronBack } from "react-icons/io5";
import useProfileById from "../../hooks/useProfileById.js";
import { useUserVideos } from "../../hooks/useVideo.js";
import { useFollowers, useIsFollowing } from "../../hooks/useFollowers.js";

export default function ProfileScreen() {
    const { user, profile, logout } = useUser();
    const navigate = useNavigate();
    const { id } = useParams();

    // Determina se estamos vendo o próprio perfil ou o de outro usuário
    const isOwnProfile = !id || (user && id === user.id);

    // Busca perfil de outro usuário se necessário
    const { profile: otherProfile, loading: otherProfileLoading } =
        useProfileById(!isOwnProfile && id ? id : null);

    // Perfil a ser exibido (próprio perfil ou de outro usuário)
    const displayProfile = isOwnProfile ? profile : otherProfile;
    const profileLoading = isOwnProfile
        ? !user || !profile
        : otherProfileLoading;

    // Busca vídeos do usuário
    const targetUserId = isOwnProfile ? user?.id : id;
    const { videos, loading: videosLoading } = useUserVideos(targetUserId);

    // Hooks para sistema de seguidores
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

    // Estado para controlar o modal de vídeo
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    // Estados de carregamento
    if (profileLoading) {
        return <Loading />;
    }

    // Se não encontrou perfil para ID específico
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
            {/* Header centralizado, não fixo */}
            <header className="flex items-center justify-between px-4 py-4 mb-4 w-full max-w-lg mx-auto">
                <Button
                    variant="transparente"
                    size="small"
                    onClick={() => navigate("/")}
                    className="p-2"
                >
                    <IoChevronBack size={22} />
                </Button>
                <div className="flex-1 flex justify-center">
                    <span className="text-2xl font-bold text-foreground tracking-tight select-none">
                        {isOwnProfile
                            ? "Perfil"
                            : displayProfile?.full_name || "Perfil"}
                    </span>
                </div>
                {isOwnProfile ? (
                    <Button
                        variant="transparente"
                        size="small"
                        onClick={handleLogout}
                        className="p-2 text-red-500 hover:bg-red-500/10"
                    >
                        <IoLogOutOutline size={22} />
                    </Button>
                ) : (
                    <div className="w-10 h-10" />
                )}
            </header>

            {/* Conteúdo do perfil */}
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
                {/* Localização, Idade e Posição */}
                <div className="flex flex-col items-center gap-1 mb-2 w-full max-w-xs">
                    {displayProfile?.localizacao && (
                        <span className="text-foreground-muted text-sm text-center truncate w-full">
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
                {/* Estatísticas */}
                <div className="flex justify-center items-center gap-8 mb-6">
                    <button
                        className="text-center hover:opacity-70 transition-opacity"
                        onClick={() =>
                            navigate(
                                `/perfil/${targetUserId}/followers?tab=following`
                            )
                        }
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
                        onClick={() =>
                            navigate(
                                `/perfil/${targetUserId}/followers?tab=followers`
                            )
                        }
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
                            {videos.length}
                        </span>
                        <p className="text-sm text-foreground-muted">Vídeos</p>
                    </div>
                </div>

                {/* Seção de Vídeos */}
                <div className="w-full max-w-4xl px-4">
                    <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
                        Vídeos ({videos.length})
                    </h3>

                    {videosLoading ? (
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
                                        handleOpenVideo({
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
            </div>

            {/* Modal de Vídeo */}
            <VideoModal
                video={selectedVideo}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </div>
    );
}
