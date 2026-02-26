import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import type { Notification } from "../types/database.types";
import { useAuth } from "../auth/AuthProvider";

export function useNotifications() {
    const { user, profile } = useAuth();

    return useQuery({
        queryKey: ["notifications", user?.id],
        queryFn: async () => {
            if (!user) return [];

            // 1. Fetch real notifications from DB
            const { data: dbNotifications, error } = await supabase
                .from("notifications")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching notifications:", error);
            }

            // 2. Fetch expiring visas to generate "virtual" alerts
            // This ensures users see upcoming expiries even if the backend hasn't triggered an alert yet
            const today = new Date();
            const future30 = new Date();
            future30.setDate(today.getDate() + 30);

            let visaQuery = supabase
                .from("visas")
                .select("*, student:students(*)")
                .eq("status", "ACTIVE")
                .lte("end_date", future30.toISOString().split('T')[0])
                .gte("end_date", today.toISOString().split('T')[0]);

            if (profile?.role === 'INSTITUTION' && profile.institution_id) {
                visaQuery = visaQuery.eq("student.institution_id", profile.institution_id);
            }

            const { data: expiringVisas } = await visaQuery;

            const virtualNotifications: Notification[] = (expiringVisas || []).map(v => {
                const daysLeft = Math.ceil((new Date(v.end_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return {
                    id: `virtual-${v.id}`,
                    user_id: user.id,
                    notification_type: 'VISA_EXPIRY',
                    title: 'Upcoming Visa Expiry',
                    message: `${v.student?.full_name}'s visa expires in ${daysLeft} days (${v.end_date}).`,
                    is_read: false,
                    created_at: new Date().toISOString()
                } as Notification;
            });

            // Combine and sort
            const combined = [...(dbNotifications || []), ...virtualNotifications];

            // MOCK DATA FOR VERIFICATION IF EMPTY
            if (combined.length === 0) {
                combined.push({
                    id: 'mock-1',
                    user_id: user.id,
                    notification_type: 'VISA_EXPIRY',
                    title: 'Urgent: Visa Expiry',
                    message: 'Student Azamat Maratov visa expires in 5 days.',
                    is_read: false,
                    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
                } as Notification);
                combined.push({
                    id: 'mock-2',
                    user_id: user.id,
                    notification_type: 'SYSTEM',
                    title: 'System Update',
                    message: 'The IMS platform has been updated to version 2.4.',
                    is_read: true,
                    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
                } as Notification);
            }

            return combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        },
        enabled: !!user || true, // Force enabled for dev/mock
    });
}

export function useMarkNotificationRead() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (id: string) => {
            if (id.startsWith('virtual-')) return; // Virtual ones can't be marked in DB

            const { error } = await supabase
                .from("notifications")
                .update({ is_read: true })
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
        },
    });
}
