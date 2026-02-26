import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import type { Student } from "../types";

// ===================================
// Fetch Hooks
// ===================================

export function useStudents(institutionId?: string) {
    return useQuery({
        queryKey: ["students", institutionId],
        queryFn: async () => {
            let query = supabase
                .from("students")
                .select("*, visa:visas(*), institution:institutions(name)")
                .order("created_at", { ascending: false });

            if (institutionId) {
                query = query.eq("institution_id", institutionId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as Student[];
        },
    });
}

export function useStudent(id: string) {
    return useQuery({
        queryKey: ["student", id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("students")
                .select("*, visa:visas(*), institution:institutions(*), attendance:attendance_records(*)")
                .eq("id", id)
                .single();

            if (error) throw error;
            return data as Student;
        },
        enabled: !!id,
    });
}

export function useMyStudentProfile() {
    return useQuery({
        queryKey: ["my_student_profile"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from("students")
                .select("*, visa:visas(*), institution:institutions(*), attendance:attendance_records(*)")
                .eq("user_id", user.id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // Not found
                throw error;
            }
            return data as any;
        },
    });
}

// ===================================
// Mutation Hooks
// ===================================

export function useCreateStudent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: { student: any; visa: any; institution_id: string }) => {
            // 1. Create Student
            const { data: studentData, error: studentError } = await supabase
                .from("students")
                .insert({
                    ...payload.student,
                    institution_id: payload.institution_id,
                })
                .select()
                .single();

            if (studentError) throw studentError;

            // 2. Create Visa
            const { error: visaError } = await supabase
                .from("visas")
                .insert({
                    student_id: studentData.id,
                    ...payload.visa,
                });

            if (visaError) throw visaError;

            // 3. Log Audit (Optional explicitly here, or via triggers/backend)
            await supabase.from("audit_logs").insert({
                action: "CREATE",
                table_name: "students",
                record_id: studentData.id,
                changes: payload,
                user_id: (await supabase.auth.getUser()).data.user?.id
            });

            return studentData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["students"] });
        },
    });
}

export function useUpdateStudent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...updates }: { id: string } & Partial<Student>) => {
            const { data, error } = await supabase
                .from("students")
                .update(updates)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["student", variables.id] });
            queryClient.invalidateQueries({ queryKey: ["students"] });
            queryClient.invalidateQueries({ queryKey: ["student_card"] });
        },
    });
}
