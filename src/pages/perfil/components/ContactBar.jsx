import {
    FaWhatsapp,
    FaGlobe,
    FaInstagram,
    FaXTwitter,
    FaTiktok,
    FaYoutube,
} from "react-icons/fa6";
import { FaTwitter, FaPhoneAlt } from "react-icons/fa";

export const CONTACT_ICON_MAP = {
    whatsapp: FaWhatsapp,
    telefone: FaPhoneAlt,
    website: FaGlobe,
    instagram: FaInstagram,
    x: FaXTwitter || FaTwitter,
    tiktok: FaTiktok,
    youtube: FaYoutube,
};

export default function ContactBar({ contacts }) {
    if (!contacts || contacts.length === 0) return null;

    return (
        <div className="flex flex-wrap justify-center gap-3 mb-6 max-w-xs">
            {contacts.map((c) => {
                const Icon = CONTACT_ICON_MAP[c.icon_name || c.type] || FaGlobe;
                return (
                    <a
                        key={c.id}
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={c.title}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background-light border border-primary-500/20 hover:border-primary-500/50 transition-colors text-sm text-foreground group"
                    >
                        <Icon className="text-primary-500 group-hover:scale-110 transition-transform" />
                        <span className="truncate max-w-[120px]">
                            {c.title}
                        </span>
                    </a>
                );
            })}
        </div>
    );
}