import supabase from "./supabaseClient";

// Obtém contatos de um perfil
export async function getProfileContacts(profileId) {
    if (!profileId) return [];
    const { data, error } = await supabase
        .from("profile_contacts")
        .select("id, type, title, url, icon_name, order_index")
        .eq("profile_id", profileId)
        .order("order_index", { ascending: true });
    if (error) {
        console.warn("Erro ao buscar contatos:", error);
        return [];
    }
    return data || [];
}

// Substitui todos os contatos de um perfil (máx 3). Estratégia: delete + insert.
export async function replaceProfileContacts(profileId, contacts) {
    if (!profileId) throw new Error("profileId é obrigatório");
    const safeContacts = Array.isArray(contacts) ? contacts.slice(0, 3) : [];

    // Normaliza e valida tipos
    const allowed = new Set([
        "whatsapp",
        "telefone",
        "website",
        "instagram",
        "x",
        "tiktok",
        "youtube",
    ]);
    const rows = safeContacts
        .map((c, idx) => ({
            type: c.type?.trim().toLowerCase(),
            title: (c.title || "").trim(),
            url: (c.url || "").trim(),
            icon_name: (c.icon_name || c.type || "").trim().toLowerCase(),
            order_index: idx,
        }))
        .filter(
            (c) =>
                c.type && allowed.has(c.type) && c.title && c.url && c.icon_name
        );

    // Remove duplicados por tipo mantendo primeiro
    const seen = new Set();
    const dedup = [];
    for (const r of rows) {
        if (!seen.has(r.type)) {
            seen.add(r.type);
            dedup.push(r);
        }
    }

    // Delete existente
    const { error: delError } = await supabase
        .from("profile_contacts")
        .delete()
        .eq("profile_id", profileId);
    if (delError) throw delError;

    if (dedup.length === 0) return [];

    // Insere novos
    const insertRows = dedup.map((r) => ({ ...r, profile_id: profileId }));
    const { data, error: insError } = await supabase
        .from("profile_contacts")
        .insert(insertRows)
        .select();
    if (insError) throw insError;
    return data || [];
}
