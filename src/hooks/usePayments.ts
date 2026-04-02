import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

export interface Payment {
    id: string;
    student_id: string;
    amount: number;
    currency: string | null;
    payment_type: string;
    payment_date: string | null;
    status: string;
    created_at: string | null;
}

export function usePayments(studentId: string | null) {
    return useQuery({
        queryKey: ["payments", studentId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("payments")
                .select("*")
                .eq("student_id", studentId!)
                .order("payment_date", { ascending: false });

            if (error) throw error;
            return data as Payment[];
        },
        enabled: !!studentId,
    });
}
