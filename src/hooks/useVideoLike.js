import { useState, useEffect } from "react";
import {
  isVideoLiked,
  likeVideo,
  unlikeVideo,
  getVideoLikesCount,
} from "../lib/videoService";
import useUser from "./useUser";

export default function useVideoLike(videoId) {
  const { user } = useUser();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && videoId) {
      isVideoLiked(videoId, user.id).then(setLiked);
      getVideoLikesCount(videoId).then(setLikesCount);
    }
  }, [user, videoId]);

  const toggleLike = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (liked) {
        await unlikeVideo(videoId, user.id);
        setLiked(false);
        setLikesCount((c) => c - 1);
      } else {
        await likeVideo(videoId, user.id);
        setLiked(true);
        setLikesCount((c) => c + 1);
      }
    } finally {
      setLoading(false);
    }
  };

  return { liked, likesCount, loading, toggleLike };
}
