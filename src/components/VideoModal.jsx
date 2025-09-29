import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    IoClose,
    IoHeart,
    IoEye,
    IoCalendar,
    IoPencil,
    IoTrash,
} from "react-icons/io5";
import { formatViews, formatDuration } from "../lib/videoConfig";
import { useVideoDelete } from "../hooks/useVideo";
import useUser from "../hooks/useUser";
import Button from "./Button";
import DialogComponents from "./DialogComponents";
import { incrementVideoViews } from "../lib/videoService";
import { CiLocationOn } from "react-icons/ci";

export default function VideoModal({ video, isOpen, onClose }) {
    const videoRef = useRef(null);
    const modalRef = useRef(null);
    const navigate = useNavigate();

    const { user } = useUser();
    const { deleting, deleteVideo } = useVideoDelete();

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const hasCountedView = useRef(false);

    // Conta visualização ao assistir 80% do vídeo
    function handleTimeUpdate(e) {
        const el = e.currentTarget;
        const duration = el.duration || 0;
        const current = el.currentTime || 0;
        const watchedRatio = duration > 0 ? current / duration : 0;
        if (
            !hasCountedView.current &&
            watchedRatio > 0.8 &&
            video &&
            video.id
        ) {
            incrementVideoViews(video.id);
            hasCountedView.current = true;
        }
    }

    useEffect(() => {
        if (!isOpen) {
            hasCountedView.current = false;
        }
    }, [isOpen]);

    // Verifica se o usuário é o proprietário do vídeo
    const isOwner =
        user &&
        video &&
        (user.id === video.user_id || user.id === video.user?.id);

    // Navega para tela de edição
    const handleEdit = () => {
        onClose();
        navigate("/editar-video", { state: { video } });
    };

    // Mostra dialog de confirmação para deletar
    const handleDeleteClick = () => {
        setShowDeleteDialog(true);
    };

    // Confirma a exclusão do vídeo
    const handleDeleteConfirm = async () => {
        const result = await deleteVideo(
            video.id,
            video.video_url,
            video.thumbnail_url
        );
        if (result.success) {
            setShowDeleteDialog(false);
            onClose();
            // Recarrega a página para atualizar a lista de vídeos
            window.location.reload();
        }
    };

    // Cancela a exclusão
    const handleDeleteCancel = () => {
        setShowDeleteDialog(false);
    };

    // Fecha o modal ao pressionar ESC
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    // Controla o vídeo baseado no estado do modal
    useEffect(() => {
        if (videoRef.current) {
            if (isOpen) {
                videoRef.current.play().catch(() => {
                    // Ignore autoplay errors
                });
            } else {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
            }
        }
    }, [isOpen]);

    // Fecha o modal ao clicar fora dele
    const handleBackdropClick = (e) => {
        if (e.target === modalRef.current) {
            onClose();
        }
    };

    // Formata a data de criação
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    if (!isOpen || !video) return null;

    console.log("Rendering VideoModal for video ID:", video);
    return (
        <div
            ref={modalRef}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
            onClick={handleBackdropClick}
        >
            <div className="bg-background rounded-xl max-w-6xl w-full h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 zoom-in-95 duration-300 flex flex-col">
                {/* Header com botão de fechar */}
                <div className="flex items-center justify-between p-4 border-b border-primary-500/20">
                    <h2 className="text-lg font-semibold text-foreground truncate pr-4">
                        {video.title || "Vídeo"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors"
                    >
                        <IoClose size={24} className="text-foreground-muted" />
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                    {/* Área do vídeo */}
                    <div className="flex-1 bg-black flex items-center justify-center relative min-h-[200px] lg:min-h-[400px]">
                        <video
                            ref={videoRef}
                            src={video.video_url}
                            poster={video.thumbnail_url}
                            className="w-auto h-auto max-w-full max-h-full object-contain"
                            style={{
                                maxHeight: "100%",
                                maxWidth: "100%",
                            }}
                            controls
                            playsInline
                            muted={false}
                            loop
                            onTimeUpdate={handleTimeUpdate}
                        />
                    </div>

                    {/* Informações do vídeo */}
                    <div className="w-full lg:w-80 lg:min-w-[320px] p-4 space-y-4 overflow-y-auto flex-shrink-0 max-h-[40vh] lg:max-h-full">
                        {/* Perfil do usuário */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center overflow-hidden">
                                {video.user?.avatar_url ? (
                                    <img
                                        src={video.user.avatar_url}
                                        alt={video.user.full_name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-white text-sm font-bold">
                                        {video.user?.full_name?.charAt(0) ||
                                            video.user?.username?.charAt(0) ||
                                            "U"}
                                    </span>
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-foreground">
                                    {video.user?.full_name || "Usuário"}
                                </p>
                                <p className="text-sm text-foreground-muted">
                                    @{video.user?.username || "username"}
                                </p>
                            </div>
                        </div>

                        {/* Título */}
                        <div>
                            <h3 className="font-semibold text-foreground mb-2">
                                {video.title || "Sem título"}
                            </h3>
                        </div>

                        {/* Descrição */}
                        {video.description && (
                            <div>
                                <p className="text-sm text-foreground-muted leading-relaxed">
                                    {video.description}
                                </p>
                            </div>
                        )}

                        {/* Descrição */}
                        {video.location && (
                            <div className="flex gap-1">
                                <CiLocationOn className="min-h-3 min-w-3 mt-0.5" />
                                <p className="text-sm text-foreground-muted leading-relaxed">
                                    {video.location}
                                </p>
                            </div>
                        )}

                        {/* Estatísticas */}
                        <div className="space-y-3 pt-4 border-t border-primary-500/20">
                            <div className="flex items-center gap-2 text-foreground-muted">
                                <IoEye size={16} />
                                <span className="text-sm">
                                    {formatViews(video.views_count || 0)}{" "}
                                    visualizações
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-foreground-muted">
                                <IoHeart size={16} />
                                <span className="text-sm">
                                    {formatViews(video.likes_count || 0)}{" "}
                                    curtidas
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-foreground-muted">
                                <IoCalendar size={16} />
                                <span className="text-sm">
                                    {formatDate(video.created_at)}
                                </span>
                            </div>

                            {video.duration && (
                                <div className="flex items-center gap-2 text-foreground-muted">
                                    <svg
                                        className="w-4 h-4"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                    </svg>
                                    <span className="text-sm">
                                        {formatDuration(video.duration)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Botões de ação */}
                        <div className="pt-4 border-t border-primary-500/20">
                            {isOwner ? (
                                <div className="space-y-3">
                                    <Button
                                        variant="principal"
                                        size="medium"
                                        onClick={handleEdit}
                                        className="w-full"
                                    >
                                        <IoPencil size={16} />
                                        Editar
                                    </Button>
                                    <Button
                                        variant="cancelar"
                                        size="medium"
                                        onClick={handleDeleteClick}
                                        disabled={deleting}
                                        className="w-full bg-red-500 text-white border-red-500/30 hover:border-red-800 hover:bg-red-800"
                                    >
                                        <IoTrash size={16} />
                                        Excluir
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    variant="principal"
                                    size="medium"
                                    className="w-full"
                                >
                                    <IoHeart size={16} />
                                    Curtir
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Dialog de confirmação para deletar */}
            <DialogComponents
                isOpen={showDeleteDialog}
                onClose={handleDeleteCancel}
                title="Confirmar Exclusão"
                description="Tem certeza que deseja excluir este vídeo? Esta ação não pode ser desfeita."
                btText1="Cancelar"
                btAction01={handleDeleteCancel}
                btText2="Excluir"
                btAction02={handleDeleteConfirm}
                loading={deleting}
            />
        </div>
    );
}
