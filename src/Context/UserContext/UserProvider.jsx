import { useState, useEffect, useCallback } from "react";
import { UserContext } from "./UserContext";
import supabase from "../../lib/supabaseClient";
import { getProfileContacts } from "../../lib/contactService";

export default function UserProvider({ children }) {
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [contacts, setContacts] = useState([]); // novos contatos
    const [loading, setLoading] = useState(true);
    const [error] = useState(null);

    // Busca perfil do usuário logado
    const fetchProfile = useCallback(async (userId) => {
        if (!userId) return null;
        const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();
        return profileData;
    }, []);

    const updateProfileAndContacts = useCallback(
        async (currentSession) => {
            if (currentSession?.user) {
                const profileData = await fetchProfile(currentSession.user.id);
                setProfile(profileData);
                const contactsData = await getProfileContacts(
                    currentSession.user.id
                );
                setContacts(contactsData);
            } else {
                setProfile(null);
                setContacts([]);
            }
            setLoading(false);
        },
        [fetchProfile]
    );

    // Permite refresh manual externo
    const refreshContacts = useCallback(async () => {
        if (session?.user) {
            const contactsData = await getProfileContacts(session.user.id);
            setContacts(contactsData);
        }
    }, [session]);

    useEffect(() => {
        // Inicializa: busca sessão atual
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            updateProfileAndContacts(session);
        });

        // Listener de mudanças de autenticação
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            updateProfileAndContacts(session);
        });

        return () => subscription.unsubscribe();
    }, [updateProfileAndContacts]);

    // Logout do usuário
    const logout = async () => {
        await supabase.auth.signOut();
    };

    // Extrai user da session para compatibilidade
    const user = session?.user || null;

    return (
        <UserContext.Provider
            value={{
                user,
                profile,
                contacts,
                loading,
                error,
                logout,
                setProfile,
                setContacts,
                refreshContacts,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}
