import GenericVideoFeed from "../../components/GenericVideoFeed";
import Menu from "../../components/Menu";
import { useFollowingVideos } from "../../hooks/useFollowingVideos";

export default function Seguindo() {
    return (
        <div className="relative min-h-screen bg-background">
            <Menu />
            <GenericVideoFeed
                useVideosHook={useFollowingVideos}
                emptyStateText="Nenhum vídeo disponível"
                loadingText="Carregando vídeos..."
            />
        </div>
    );
}
