import {
    FaWhatsapp,
    FaGlobe,
    FaInstagram,
    FaXTwitter,
    FaTiktok,
    FaYoutube,
} from "react-icons/fa6";
import { FaTwitter, FaPhoneAlt } from "react-icons/fa";
import Button from "./Button";
import { useCallback } from "react";

const ICON_MAP = {
    whatsapp: FaWhatsapp,
    telefone: FaPhoneAlt,
    website: FaGlobe,
    instagram: FaInstagram,
    x: FaXTwitter || FaTwitter,
    tiktok: FaTiktok,
    youtube: FaYoutube,
};

const CONTACT_TYPES = [
    { value: "whatsapp", label: "WhatsApp", placeholder: "+55 11 99999-9999" },
    { value: "telefone", label: "Telefone", placeholder: "+55 11 99999-9999" },
    { value: "website", label: "Website", placeholder: "https://seusite.com" },
    {
        value: "instagram",
        label: "Instagram",
        placeholder: "https://instagram.com/usuario",
    },
    { value: "x", label: "X (Twitter)", placeholder: "https://x.com/usuario" },
    {
        value: "tiktok",
        label: "TikTok",
        placeholder: "https://tiktok.com/@usuario",
    },
    {
        value: "youtube",
        label: "YouTube",
        placeholder: "https://youtube.com/@canal",
    },
];

function buildUrl(type, raw) {
    const value = raw?.trim?.() || "";
    if (!value) return "";
    switch (type) {
        case "whatsapp": {
            const digits = value.replace(/\D/g, "");
            if (!digits) return "";
            return `https://wa.me/${digits}`;
        }
        case "telefone": {
            const digits = value.replace(/\D/g, "");
            return digits ? `tel:+${digits}` : "";
        }
        case "website":
            return value.startsWith("http://") || value.startsWith("https://")
                ? value
                : `https://${value}`;
        default:
            return value;
    }
}

export default function ContactsEditor({ value = [], onChange, max = 3 }) {
    const items = value.slice(0, max);

    const updateItem = useCallback(
        (idx, patch) => {
            const next = items.map((c, i) =>
                i === idx ? { ...c, ...patch } : c
            );
            onChange(next);
        },
        [items, onChange]
    );

    const addItem = () => {
        if (items.length >= max) return;
        onChange([
            ...items,
            { type: "", title: "", url: "", icon_name: "", raw: "" },
        ]);
    };

    const removeItem = (idx) => {
        const next = items.filter((_, i) => i !== idx);
        onChange(next);
    };

    const usedTypes = new Set(items.map((i) => i.type).filter(Boolean));

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">
                    Contatos
                </h4>
                <span className="text-xs text-foreground-muted">
                    {items.length}/{max}
                </span>
            </div>
            {items.length === 0 && (
                <p className="text-xs text-foreground-muted">
                    Adicione links para que outras pessoas entrem em contato.
                </p>
            )}
            <div className="space-y-6">
                {items.map((item, idx) => {
                    const Icon =
                        ICON_MAP[item.icon_name || item.type] || FaGlobe;
                    const typeMeta = CONTACT_TYPES.find(
                        (t) => t.value === item.type
                    );
                    return (
                        <div
                            key={idx}
                            className="relative border border-primary-500/30 rounded-xl p-4 space-y-4 bg-background"
                        >
                            {/* Linha ícone + select */}
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 shrink-0 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500">
                                    <Icon size={22} />
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <label className="text-xs text-foreground mb-1">
                                        Tipo
                                    </label>
                                    <select
                                        className="bg-background-light border border-primary-500/30 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
                                        value={item.type}
                                        onChange={(e) => {
                                            const newType = e.target.value;
                                            updateItem(idx, {
                                                type: newType,
                                                icon_name: newType,
                                                url: "",
                                                raw: "",
                                            });
                                        }}
                                    >
                                        <option value="">Selecionar</option>
                                        {CONTACT_TYPES.map((t) => (
                                            <option
                                                key={t.value}
                                                value={t.value}
                                                disabled={
                                                    t.value !== item.type &&
                                                    usedTypes.has(t.value)
                                                }
                                            >
                                                {t.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {/* Campo título */}
                            <div className="flex flex-col">
                                <label className="text-xs text-foreground mb-1">
                                    Título
                                </label>
                                <input
                                    type="text"
                                    maxLength={50}
                                    className="bg-background-light border border-primary-500/30 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    value={item.title}
                                    onChange={(e) =>
                                        updateItem(idx, {
                                            title: e.target.value,
                                        })
                                    }
                                    placeholder={typeMeta?.label || "Título"}
                                />
                            </div>
                            {/* Campo link/valor */}
                            <div className="flex flex-col">
                                <label className="text-xs text-foreground mb-1">
                                    Link / Valor
                                </label>
                                <input
                                    type="text"
                                    className="bg-background-light border border-primary-500/30 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    value={item.raw}
                                    onChange={(e) => {
                                        const raw = e.target.value;
                                        const finalUrl = buildUrl(
                                            item.type,
                                            raw
                                        );
                                        updateItem(idx, {
                                            raw,
                                            url: finalUrl,
                                        });
                                    }}
                                    placeholder={typeMeta?.placeholder || "URL"}
                                />
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button
                                    variant="cancelar"
                                    size="small"
                                    type="button"
                                    onClick={() => removeItem(idx)}
                                    className="!text-xs"
                                >
                                    Remover
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
            {items.length < max && (
                <Button
                    type="button"
                    variant="secundario"
                    size="small"
                    onClick={addItem}
                >
                    Adicionar contato
                </Button>
            )}
        </div>
    );
}
