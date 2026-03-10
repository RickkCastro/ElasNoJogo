// Função para calcular idade a partir da data de nascimento yyyy-mm-dd
export function calcularIdade(dataNasc) {
    if (!dataNasc) return null;
    const [ano, mes, dia] = dataNasc.split("-");
    if (!ano || !mes || !dia) return null;
    const hoje = new Date();
    const nascimento = new Date(Number(ano), Number(mes) - 1, Number(dia));
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    return idade;
}
