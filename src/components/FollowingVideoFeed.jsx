import { useFollowingVideos } from "../hooks/useFollowingVideos";
import GenericVideoFeed from "./GenericVideoFeed";

export default function FollowingVideoFeed({
  className = "",
  containerClassName,
}) {
  return (
    <GenericVideoFeed
      className={className}
      containerClassName={containerClassName}
      useVideosHook={useFollowingVideos}
      emptyStateText="Siga alguns usuários para ver vídeos aqui"
      loadingText="Carregando vídeos..."
    />
  );
}
