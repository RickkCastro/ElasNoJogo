import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import useUser from "../../hooks/useUser";
import Loading from "../../components/Loading.jsx";
import Button from "../../components/Button.jsx";
import { IoChevronBack } from "react-icons/io5";
import { useFollowers, useIsFollowing } from "../../hooks/useFollowers.js";

export default function FollowersScreen() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // Determina se estamos mostrando seguidores ou seguindo baseado na query string
  const searchParams = new URLSearchParams(location.search);
  const tab = searchParams.get("tab") || "followers"; // 'followers' ou 'following'

  const [activeTab, setActiveTab] = useState(tab);

  // Busca dados de seguidores
  const { followers, following, loading: followersLoading } = useFollowers(id);

  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    navigate(`/perfil/${id}/followers?tab=${newTab}`, { replace: true });
  };

  const currentList = activeTab === "followers" ? followers : following;

  if (followersLoading) {
    return <Loading />;
  }

  return (
    <div className="relative min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 mb-4 w-full max-w-lg mx-auto">
        <Button
          variant="transparente"
          size="small"
          onClick={() => navigate(`/perfil/${id}`)}
          className="p-2"
        >
          <IoChevronBack size={22} />
        </Button>
        <div className="flex-1 flex justify-center">
          <span className="text-2xl font-bold text-foreground tracking-tight select-none">
            {activeTab === "followers" ? "Seguidores" : "Seguindo"}
          </span>
        </div>
        <div className="w-10 h-10" />
      </header>

      {/* Tabs */}
      <div className="flex w-full max-w-lg mx-auto mb-4 px-4">
        <button
          className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
            activeTab === "followers"
              ? "border-primary text-primary"
              : "border-transparent text-foreground-muted hover:text-foreground"
          }`}
          onClick={() => handleTabChange("followers")}
        >
          Seguidores ({followers.length})
        </button>
        <button
          className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
            activeTab === "following"
              ? "border-primary text-primary"
              : "border-transparent text-foreground-muted hover:text-foreground"
          }`}
          onClick={() => handleTabChange("following")}
        >
          Seguindo ({following.length})
        </button>
      </div>

      {/* Lista de usuários */}
      <div className="flex-1 px-4 w-full max-w-lg mx-auto">
        {currentList.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-foreground-muted">
              {activeTab === "followers"
                ? "Nenhum seguidor ainda"
                : "Não está seguindo ninguém ainda"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentList.map((item) => {
              const profile =
                activeTab === "followers" ? item.profiles : item.profiles;

              return (
                <UserItem
                  key={item.id}
                  profile={profile}
                  currentUserId={user?.id}
                  onProfileClick={() => navigate(`/perfil/${profile.id}`)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function UserItem({ profile, currentUserId, onProfileClick }) {
  const isOwnProfile = currentUserId === profile.id;
  const { isFollowing, loading, toggleFollow } = useIsFollowing(
    currentUserId,
    !isOwnProfile ? profile.id : null
  );

  return (
    <div className="flex items-center justify-between p-3 bg-background-light rounded-lg">
      <div
        className="flex items-center gap-3 flex-1"
        onClick={onProfileClick}
        role="button"
      >
        <div className="w-12 h-12 rounded-full bg-primary-500/80 border border-primary/30 flex items-center justify-center">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name || profile.username}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-foreground text-sm font-bold">
              {profile.full_name?.charAt(0) ||
                profile.username?.charAt(0) ||
                "U"}
            </span>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-foreground">
            {profile.full_name || profile.username}
          </h3>
          <p className="text-sm text-foreground-muted">
            @{profile.username || "username"}
          </p>
        </div>
      </div>

      {!isOwnProfile && (
        <Button
          variant={isFollowing ? "secundario" : "principal"}
          size="small"
          onClick={toggleFollow}
          disabled={loading}
          className="min-w-[80px]"
        >
          {loading ? "..." : isFollowing ? "Seguindo" : "Seguir"}
        </Button>
      )}
    </div>
  );
}
