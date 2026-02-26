import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../auth/AuthProvider";

export interface StudentDocument {
    id: string;
    student_id: string;
    name: string;
    file_path: string;
    file_type: string;
    size: number;
    uploaded_by: string;
    created_at: string;
}

export function useDocuments(studentId: string | null) {
    return useQuery({
        queryKey: ["documents", studentId],
        queryFn: async () => {
            if (!studentId) return [];

            const { data, error } = await supabase
                .from("student_documents")
                .select("*")
                .eq("student_id", studentId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as StudentDocument[];
        },
        enabled: !!studentId,
    });
}

export function useUploadDocument() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async ({ studentId, file, name }: { studentId: string; file: File; name: string }) => {
            if (!user) throw new Error("Authentication required");

            const fileExt = file.name.split('.').pop();
            const fileName = `${studentId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `student-docs/${fileName}`;

            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from("documents")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Save metadata to DB
            const { data, error: dbError } = await supabase
                .from("student_documents")
                .insert({
                    student_id: studentId,
                    name: name || file.name,
                    file_path: filePath,
                    file_type: file.type,
                    size: file.size,
                    uploaded_by: user.id
                })
                .select()
                .single();

            if (dbError) {
                // Cleanup storage if DB fails
                await supabase.storage.from("documents").remove([filePath]);
                throw dbError;
            }

            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["documents", variables.studentId] });
        },
    });
}

export function useDeleteDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, filePath }: { id: string; studentId: string; filePath: string }) => {
            // 1. Delete from Storage
            const { error: storageError } = await supabase.storage
                .from("documents")
                .remove([filePath]);

            if (storageError) throw storageError;

            // 2. Delete from DB
            const { error: dbError } = await supabase
                .from("student_documents")
                .delete()
                .eq("id", id);

            if (dbError) throw dbError;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["documents", variables.studentId] });
        },
    });
}

export function useDownloadDocument() {
    return useMutation({
        mutationFn: async (filePath: string) => {
            const { data, error } = await supabase.storage
                .from("documents")
                .download(filePath);

            if (error) throw error;

            // Create a download link
            const url = window.URL.createObjectURL(data);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filePath.split('/').pop() || 'document');
            document.body.appendChild(link);
            link.click();
            link.remove();
        }
    });
}
