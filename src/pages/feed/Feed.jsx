import GenericVideoFeed from "../../components/GenericVideoFeed";
import Menu from "../../components/Menu";
import { useVideos } from "../../hooks/useVideo";

export default function Feed() {
    return (
        <div className="relative min-h-screen bg-background">
            <Menu />
            <GenericVideoFeed
                useVideosHook={useVideos}
                emptyStateText="Nenhum vídeo disponível"
                loadingText="Carregando vídeos..."
            />
        </div>
    );
}
