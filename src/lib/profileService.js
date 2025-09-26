import supabase from "./supabaseClient";

export async function createProfile(profileData) {
    const { error } = await supabase.from("profiles").insert(profileData);
    if (error) throw error;
}
