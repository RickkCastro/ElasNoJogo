import useUser from "../../hooks/useUser";
import Menu from "../../components/Menu";
import {
  VideoListExample,
  VideoUploadExample,
} from "../../examples/videoExamples";
import { VideoTestPage } from "../../examples/videoExamples";

export default function Feed() {
  const { user, profile } = useUser();

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Menu />

      <VideoTestPage />
    </div>
  );
}
