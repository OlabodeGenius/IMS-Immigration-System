import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

export type UserRole = "IMMIGRATION" | "INSTITUTION";

export type Profile = {
    user_id: string;
    role: UserRole;
    institution_id: string | null;
    full_name: string | null;
};

async function fetchMyProfile(): Promise<Profile | null> {
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    if (sessionErr) throw sessionErr;

    const user = sessionData.session?.user;
    if (!user) return null;

    const { data, error } = await supabase
        .from("profiles")
        .select("user_id, role, institution_id, full_name")
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) throw error;
    return data ?? null;
}

export function useProfile() {
    return useQuery({
        queryKey: ["myProfile"],
        queryFn: fetchMyProfile,
    });
}