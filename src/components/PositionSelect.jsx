// Componente reutilizável para seleção de posição em campo
export default function PositionSelect({ value, onChange, name = "posicao" }) {
    const options = [
        "Goleira",
        "Zagueira",
        "Lateral-direita",
        "Lateral-esquerda",
        "Volante",
        "Meio-campista",
        "Meia-atacante",
        "Ponta-direita",
        "Ponta-esquerda",
        "Atacante",
        "Centroavante",
        "Outra",
    ];

    return (
        <select
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-background border border-primary-500/30 text-foreground rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-foreground-subtle transition-colors"
        >
            <option value="">Selecione sua posição</option>
            {options.map((opt) => (
                <option key={opt} value={opt}>
                    {opt}
                </option>
            ))}
        </select>
    );
}
