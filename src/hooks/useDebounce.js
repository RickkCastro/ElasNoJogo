import { useEffect, useState } from "react";

// Hook simples de debounce para evitar muitas requisições enquanto o usuário digita
export default function useDebounce(value, delay = 450) {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);

    return debounced;
}
