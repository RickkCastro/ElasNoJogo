import { useVideos } from "../hooks/useVideo";
import GenericVideoFeed from "./GenericVideoFeed";

export default function VideoFeed({ className = "", containerClassName }) {
  return (
    <GenericVideoFeed
      className={className}
      containerClassName={containerClassName}
      useVideosHook={useVideos}
      emptyStateText="Nenhum vídeo disponível"
      loadingText="Carregando vídeos..."
    />
  );
}
