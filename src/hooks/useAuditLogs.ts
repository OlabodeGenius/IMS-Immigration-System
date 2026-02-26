import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

export interface AuditLogEntry {
    id: string;
    user_id: string;
    action: 'INSERT' | 'UPDATE' | 'DELETE';
    table_name: string;
    record_id: string;
    changes: Record<string, any> | null;
    created_at: string;
    user?: {
        full_name: string | null;
        role: string;
        institution?: {
            name: string;
        } | null;
    } | null;
}

export function useAuditLogs() {
    return useQuery({
        queryKey: ["audit_logs"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("audit_logs")
                .select(`
                    id, user_id, action, table_name, record_id, changes, created_at,
                    user:profiles!audit_logs_user_id_fkey_profile(
                        full_name,
                        role,
                        institution:institutions(name)
                    )
                `)
                .order("created_at", { ascending: false })
                .limit(100);

            if (error) {
                console.error("Error fetching audit logs:", error);
                throw error;
            }

            return data as unknown as AuditLogEntry[];
        },
        refetchInterval: 10000,
    });
}
