import { IoLogOutOutline, IoChevronBack } from "react-icons/io5";
import Button from "../../../components/Button.jsx";

export default function ProfileHeader({
    isOwnProfile,
    displayProfile,
    user,
    onBack,
    onLogout
}) {
    return (
        <header className="flex items-center justify-between px-4 py-4 mb-4 w-full max-w-lg mx-auto">
            <Button
                variant="transparente"
                size="small"
                onClick={onBack}
                className="p-2"
            >
                <IoChevronBack size={22} />
            </Button>
            <div className="flex-1 flex justify-center">
                <span className="text-2xl font-bold text-foreground tracking-tight select-none">
                    {isOwnProfile
                        ? "Perfil"
                        : displayProfile?.full_name || "Perfil"}
                </span>
            </div>
            {isOwnProfile ? (
                <Button
                    variant="transparente"
                    size="small"
                    onClick={onLogout}
                    className="p-2 text-red-500 hover:bg-red-500/10"
                >
                    <IoLogOutOutline size={22} />
                </Button>
            ) : (
                <div className="w-10 h-10" />
            )}
        </header>
    );
}