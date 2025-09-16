import { Link, useLocation } from "react-router-dom";
import useUser from "../hooks/useUser";
import Button from "./Button";
import { MdOutlineStadium } from "react-icons/md";

export default function Menu() {
  const { user, profile, logout } = useUser();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  const menuItems = [
    {
      name: "Feed",
      path: "/",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z" />
        </svg>
      ),
    },
    {
      name: "Postar",
      path: "/postar",
      icon: (
        <svg
          className="w-4 h-4 text-foreground-muted"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M4 12H20M12 4V20"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>{" "}
        </svg>
      ),
    },
    {
      name: "Seguindo",
      path: "/seguindo",
      icon: (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 256 256"
        >
          <path d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm76.52 147.42H170.9l-9.26-12.76l12.63-36.78l15-4.89l26.24 20.13a87.38 87.38 0 0 1-10.99 34.3Zm-164-34.3L66.71 117l15 4.89l12.63 36.78l-9.24 12.75H51.48a87.38 87.38 0 0 1-11.01-34.3Zm10-50.64l5.51 18.6l-15.32 11.69a87.33 87.33 0 0 1 9.72-30.29ZM109 152l-11.46-33.35L128 97.71l30.46 20.94L147 152Zm91.07-46.92l5.51-18.6a87.33 87.33 0 0 1 9.72 30.29Zm-6.2-35.38l-9.51 32.08l-15.07 4.89L136 83.79V68.21l29.09-20a88.58 88.58 0 0 1 28.77 21.49Zm-47.8-27.83L128 54.29l-18.07-12.42a88.24 88.24 0 0 1 36.14 0Zm-55.16 6.34l29.09 20v15.58l-33.28 22.88l-15.07-4.89l-9.51-32.08a88.58 88.58 0 0 1 28.77-21.49ZM63.15 187.42h20.37l7.17 20.27a88.4 88.4 0 0 1-27.54-20.27ZM110 214.13l-11.88-33.42l9.23-12.71h41.3l9.23 12.71l-11.83 33.42a88 88 0 0 1-36.1 0Zm55.36-6.44l7.17-20.27h20.37a88.4 88.4 0 0 1-27.59 20.27Z" />
        </svg>
      ),
    },
    {
      name: "Jogos",
      path: "/jogos",
      icon: <MdOutlineStadium />,
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Menu Desktop */}
      <nav className="hidden md:flex bg-background-light border-b border-primary-500/20 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 w-full">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Elas No Jogo" className="w-8 h-8" />
              <span className="text-xl font-bold text-primary-500">
                Elas No Jogo
              </span>
            </div>

            {/* Menu Items */}
            <div className="flex items-center gap-8">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                    isActive(item.path)
                      ? "bg-primary-500/20 text-primary-500"
                      : "text-foreground-muted hover:text-foreground hover:bg-primary-500/10"
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <Link
                to="/perfil"
                className="flex items-center gap-3 hover:bg-primary-500/10 rounded-lg px-3 py-2 transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-foreground text-sm font-bold">
                      {profile?.full_name?.charAt(0) ||
                        user?.email?.charAt(0) ||
                        "U"}
                    </span>
                  )}
                </div>
                <span className="text-foreground text-sm font-medium hidden lg:block hover:text-primary-500 transition-colors">
                  {profile?.full_name || user?.email}
                </span>
              </Link>

              <Button
                variant="transparente"
                size="small"
                onClick={handleLogout}
                title="Sair"
                className="!p-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Header Mobile - Apenas logo e perfil */}
      <header className="md:hidden absolute w-full p-4 flex justify-end">
        <Link
          to="/perfil"
          className="hover:bg-primary-500/10 rounded-lg transition-colors duration-200"
        >
          <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center overflow-hidden">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-foreground text-sm font-bold">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
              </span>
            )}
          </div>
        </Link>
      </header>

      {/* Bottom Navigation Mobile - Estilo TikTok */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background-light border-t border-primary-500/20 z-50">
        <div className="flex items-center justify-around px-2 py-2">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors duration-200 min-w-0 flex-1 ${
                isActive(item.path)
                  ? "text-primary-500"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              <div
                className={`mb-1 ${
                  isActive(item.path) ? "scale-110" : ""
                } transition-transform duration-200`}
              >
                {item.icon}
              </div>
              <span className="text-xs font-medium truncate w-full text-center">
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
