-- =================================================================================
-- MELHORIAS DE SEGURANÇA E PERFORMANCE PARA O SUPABASE (Executar no SQL Editor)
-- =================================================================================

-- 1. Otimização de Performance (Evita Waterfall no Client-side)
-- RPC para buscar vídeos de usuários seguidos já com os dados do perfil em 1 request.
CREATE OR REPLACE FUNCTION get_following_videos_with_profiles(
    p_user_id UUID,
    p_page_offset INT,
    p_page_limit INT
) RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    location TEXT,
    video_url TEXT,
    thumbnail_url TEXT,
    duration INT,
    user_id UUID,
    views_count INT,
    likes_count INT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    profile_id UUID,
    avatar_url TEXT,
    full_name TEXT,
    username TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.id, v.title, v.description, v.location, v.video_url, v.thumbnail_url, 
        v.duration, v.user_id, v.views_count, v.likes_count, v.created_at, v.updated_at,
        p.id AS profile_id, p.avatar_url, p.full_name, p.username
    FROM videos v
    JOIN profiles p ON v.user_id = p.id
    JOIN followers f ON v.user_id = f.following_id
    WHERE f.follower_id = p_user_id
    ORDER BY v.created_at DESC
    OFFSET p_page_offset
    LIMIT p_page_limit;
END;
$$ LANGUAGE plpgsql;

-- 2. Segurança: Storage Policies (Proteção contra arquivos maliciosos via API)
-- OBS: Adapte os nomes dos buckets caso sejam diferentes de 'videos' e 'thumbnails'
-- Permite apenas arquivos MP4 e limita o tamanho a ~50MB para vídeos
CREATE POLICY "Permitir upload de vídeos curtos" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
    bucket_id = 'videos' AND 
    (storage.foldername(name))[1] = auth.uid()::text AND
    (LOWER(storage.extension(name)) = 'mp4' OR LOWER(storage.extension(name)) = 'mov') AND
    length <= 52428800 -- 50 MB
);

-- 3. Integridade de Dados: Remover contatos de perfil com segurança
-- Transação no banco de dados para evitar perda de dados se o client-side falhar
CREATE OR REPLACE FUNCTION replace_user_contacts(
    p_profile_id UUID,
    p_contacts JSONB
) RETURNS VOID AS $$
BEGIN
    -- Verifica se o usuário alterando é o dono do perfil
    IF auth.uid() != p_profile_id THEN
        RAISE EXCEPTION 'Não autorizado';
    END IF;

    -- Remove os antigos
    DELETE FROM profile_contacts WHERE profile_id = p_profile_id;

    -- Insere os novos
    INSERT INTO profile_contacts (profile_id, type, title, url, icon_name, order_index)
    SELECT 
        p_profile_id,
        (contact->>'type')::TEXT,
        (contact->>'title')::TEXT,
        (contact->>'url')::TEXT,
        (contact->>'icon_name')::TEXT,
        (contact->>'order_index')::INT
    FROM jsonb_array_elements(p_contacts) AS contact;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;