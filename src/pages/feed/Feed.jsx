import Menu from "../../components/Menu";
import VideoFeed from "../../components/VideoFeed";

export default function Feed() {
  return (
    <div className="relative min-h-screen bg-background">
      <Menu />
      <VideoFeed />
    </div>
  );
}
