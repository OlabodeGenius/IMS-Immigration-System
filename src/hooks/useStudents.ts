import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import type { Student } from "../types";

// ===================================
// Fetch Hooks
// ===================================

export function useStudents(institutionId?: string, searchQuery?: string) {
    return useQuery({
        queryKey: ["students", institutionId, searchQuery],
        queryFn: async () => {
            let query = supabase
                .from("students")
                .select("*, visa:visas(*), institution:institutions(name)")
                .order("created_at", { ascending: false });

            if (institutionId) {
                query = query.eq("institution_id", institutionId);
            }

            if (searchQuery) {
                // ilike is case-insensitive. We check against name, passport, student ID, and iin
                const search = `%${searchQuery}%`;
                query = query.or(`full_name.ilike.${search},passport_number.ilike.${search},student_id_number.ilike.${search},iin.ilike.${search}`);
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
            let sessionUser = null;
            try {
                const { data } = await supabase.auth.getUser();
                sessionUser = data.user;
            } catch (err) {
                console.warn("Network error fetching auth user:", err);
            }

            if (!sessionUser) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from("students")
                .select("*, visa:visas(*), institution:institutions(*), attendance:attendance_records(*)")
                .eq("user_id", sessionUser.id)
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

export function useBulkImportStudents() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: { students: any[]; institution_id: string }) => {
            const mappedStudents = payload.students.map((s) => ({
                full_name: `${s.first_name} ${s.last_name || ""}`.trim(),
                email: s.email,
                passport_number: s.passport_number,
                date_of_birth: s.date_of_birth,
                nationality: s.nationality,
                institution_id: payload.institution_id,
                status: 'ENROLLED',
                student_id_number: s.student_id_number || `S${Math.floor(100000 + Math.random() * 900000)}`
            }));

            // Since our system relies on the auth users to login, students created this way won't have an auth login 
            // until we link them, but they will exist in the system and cards can be issued.
            // Wait, we can bulk insert them into `students` table.
            const { data, error } = await supabase
                .from("students")
                .insert(mappedStudents)
                .select();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["students"] });
        },
    });
}

