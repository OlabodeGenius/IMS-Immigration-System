import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import type { Database } from "../types/database.types";
import { useAuth } from "../auth/AuthProvider";

type VisaApplication = Database['public']['Tables']['visa_applications']['Row'];

// ===================================
// Fetch Hooks
// ===================================

export function useVisaApplications(
    status?: string,
    institutionId?: string
) {
    const { profile } = useAuth();

    return useQuery({
        queryKey: ["visa_applications", status, institutionId],
        queryFn: async () => {
            let query = supabase
                .from("visa_applications")
                .select(`
                    *,
                    student:students(*),
                    institution:institutions(name)
                `)
                .order("created_at", { ascending: false });

            if (status && status !== 'ALL') {
                query = query.eq("status", status);
            }

            // Auto-filter for universities
            if (profile?.role === 'INSTITUTION' && profile.institution_id) {
                query = query.eq("institution_id", profile.institution_id);
            } else if (institutionId) {
                // Allows immigration officers to filter by specific institution
                query = query.eq("institution_id", institutionId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as any[];
        },
    });
}

// ===================================
// Mutation Hooks
// ===================================

export function useCreateVisaApplication() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: Omit<VisaApplication, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'reviewed_by' | 'reviewed_at'>) => {
            const { data: user } = await supabase.auth.getUser();

            const { data, error } = await supabase
                .from("visa_applications")
                .insert({
                    ...payload,
                    created_by: user.user?.id
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["visa_applications"] });
        },
    });
}

export function useReviewVisaApplication() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            status,
            officer_notes,
            student_id,
            requested_start_date,
            requested_end_date
        }: {
            id: string,
            status: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED',
            officer_notes?: string,
            student_id: string,
            requested_start_date: string,
            requested_end_date: string,
            application_type: 'NEW' | 'RENEWAL'
        }) => {
            const { data: user } = await supabase.auth.getUser();

            // 1. Update Application Status
            const { data, error } = await supabase
                .from("visa_applications")
                .update({
                    status,
                    officer_notes,
                    reviewed_by: user.user?.id,
                    reviewed_at: new Date().toISOString()
                })
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;

            // 2. If APPROVED, Automatically generate/extend the Visa record!
            if (status === 'APPROVED') {
                // If this is a RENEWAL, we might want to update the latest visa, or just create a new one.
                // For simplicity and audit trails, IMS creates a new visa record linked to the student for every renewal.
                const { error: visaError } = await supabase
                    .from("visas")
                    .insert({
                        student_id,
                        visa_type: 'NATIONAL', // Default
                        status: 'ACTIVE',
                        issue_date: requested_start_date,
                        expiry_date: requested_end_date
                    });

                if (visaError) {
                    console.error("Failed to auto-issue visa after approval", visaError);
                    throw new Error("Application approved but failed to auto-issue the Visa. Please manually issue the visa.");
                }
            }

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["visa_applications"] });
            queryClient.invalidateQueries({ queryKey: ["visas"] }); // Refresh visas
        },
    });
}
