import { useEffect, useRef, useState } from "react";
import useDebounce from "../hooks/useDebounce";

/**
 * Componente de Autocomplete de Localização (estilo Instagram)
 * - Usa Nominatim (OpenStreetMap) apenas para protótipo (limites de uso). Trocar em produção por serviços como Google Places API, Mapbox Geocoding API ou Algolia Places.
 * - Debounce para reduzir chamadas
 * - Navegação por teclado (setas / enter / esc)
 * - Cache simples em memória para mesma query
 */
export default function LocationAutocomplete({
    value,
    onChange,
    placeholder = "Digite para buscar...",
    minLength = 3,
    limit = 6,
    maxSegments = 3, // quantos pedaços (separados por vírgula) exibir
}) {
    const [query, setQuery] = useState(value || "");
    const debounced = useDebounce(query, 600);
    const [results, setResults] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [highlight, setHighlight] = useState(-1);
    const boxRef = useRef(null);

    // Cache em memória (persistente durante vida do componente)
    const cacheRef = useRef(new Map());
    // Flag para saber se o usuário já interagiu (digitou / alterou)
    const userInteractedRef = useRef(false);

    // Sincroniza quando o valor vindo de fora muda (ex: formulário carregado assincronamente).
    useEffect(() => {
        if (typeof value === "string" && value !== query) {
            setQuery(value);
        }
        // não chamamos onChange aqui para evitar loop; apenas sincroniza internamente
    }, [value, query]);

    useEffect(() => {
        // Não dispara busca enquanto usuário não interagir (evita abrir dropdown ao carregar tela com valor preenchido)
        if (!userInteractedRef.current) return;
        if (!debounced || debounced.trim().length < minLength) {
            setResults([]);
            return;
        }

        const key = debounced.trim().toLowerCase();
        if (cacheRef.current.has(key)) {
            setResults(cacheRef.current.get(key));
            setOpen(true);
            setHighlight(-1);
            return;
        }

        const controller = new AbortController();
        (async () => {
            setLoading(true);
            try {
                const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=${limit}&q=${encodeURIComponent(
                    debounced
                )}`;
                const res = await fetch(url, {
                    headers: {
                        "Accept-Language": "pt-BR",
                        "User-Agent": "ElasNoJogo/1.0",
                    },
                    signal: controller.signal,
                });
                if (!res.ok)
                    throw new Error(
                        `Erro geocoding: ${res.status} ${res.statusText}`
                    );
                const data = await res.json();
                const simplify = (full) => {
                    if (!full) return full;
                    const parts = full
                        .split(",")
                        .map((p) => p.trim())
                        .filter(Boolean);
                    if (parts.length <= maxSegments) return parts.join(", ");
                    return parts.slice(0, maxSegments).join(", ");
                };

                const mapped = data.map((d) => {
                    const full = d.display_name;
                    return {
                        id: d.place_id,
                        label: simplify(full),
                        fullLabel: full,
                        lat: d.lat,
                        lon: d.lon,
                    };
                });
                cacheRef.current.set(key, mapped);
                setResults(mapped);
                setOpen(true);
                setHighlight(-1);
            } catch (e) {
                if (e.name !== "AbortError") setResults([]);
            } finally {
                setLoading(false);
            }
        })();
        return () => controller.abort();
    }, [debounced, minLength, limit, maxSegments]);

    useEffect(() => {
        function handleClick(e) {
            if (boxRef.current && !boxRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        window.addEventListener("mousedown", handleClick);
        return () => window.removeEventListener("mousedown", handleClick);
    }, []);

    const selectItem = (item) => {
        // Só passamos o label (texto). Caso deseje armazenar lat/lon no futuro, adapte aqui.
        onChange(item.label);
        setQuery(item.label);
        setOpen(false);
    };

    const handleKeyDown = (e) => {
        if (!open || results.length === 0) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => (h + 1) % results.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => (h - 1 + results.length) % results.length);
        } else if (e.key === "Enter") {
            if (highlight >= 0) {
                e.preventDefault();
                selectItem(results[highlight]);
            }
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    };

    return (
        <div className="relative" ref={boxRef}>
            <input
                type="text"
                value={query}
                onChange={(e) => {
                    userInteractedRef.current = true;
                    setQuery(e.target.value);
                    onChange(e.target.value);
                }}
                onFocus={() => results.length > 0 && setOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full bg-background border border-primary-500/30 text-foreground rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-foreground-subtle transition-colors"
                autoComplete="off"
            />
            {loading && (
                <div
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-foreground-muted flex items-center"
                    role="status"
                    aria-label="Carregando resultados"
                >
                    <svg
                        className="animate-spin h-4 w-4 mr-1 text-primary-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                    </svg>
                    <span className="sr-only">Carregando...</span>
                </div>
            )}
            {open && results.length > 0 && (
                <ul className="absolute z-20 mt-1 w-full max-h-64 overflow-auto bg-background-light border border-primary-500/30 rounded-xl shadow-lg">
                    {results.map((r, idx) => (
                        <li
                            key={r.id}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                selectItem(r);
                            }}
                            onMouseEnter={() => setHighlight(idx)}
                            title={r.fullLabel}
                            className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                                idx === highlight
                                    ? "bg-primary-500/20 text-foreground"
                                    : "hover:bg-primary-500/10"
                            }`}
                        >
                            {r.label}
                        </li>
                    ))}
                </ul>
            )}
            {open &&
                !loading &&
                results.length === 0 &&
                debounced.trim().length >= minLength && (
                    <div className="absolute z-20 mt-1 w-full bg-background-light border border-primary-500/30 rounded-xl shadow-lg p-3 text-xs text-foreground-subtle">
                        Nenhum resultado
                    </div>
                )}
            <p className="mt-1 text-[10px] text-foreground-subtle">
                Digite pelo menos {minLength} letras (cidade, local, estádio...)
            </p>
        </div>
    );
}
