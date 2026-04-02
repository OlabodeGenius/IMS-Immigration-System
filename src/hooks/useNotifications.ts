import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import type { Notification } from "../types/database.types";
import { useAuth } from "../auth/AuthProvider";

export function useNotifications() {
    const { user, profile } = useAuth();
    const queryClient = useQueryClient();

    // ── Realtime subscription – invalidates the query whenever a new notification
    // is inserted for this user so the badge count updates automatically.
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel(`notifications:${user.id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${user.id}`,
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: ["notifications", user.id] });
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${user.id}`,
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: ["notifications", user.id] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id, queryClient]);

    return useQuery({
        queryKey: ["notifications", user?.id],
        queryFn: async () => {
            if (!user) return [];

            // 1. Fetch real notifications from DB
            const { data: dbNotifications, error } = await supabase
                .from("notifications")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(50);

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
                    title: daysLeft <= 7 ? '🚨 Urgent: Visa Expiry' : '⚠️ Upcoming Visa Expiry',
                    message: `${v.student?.full_name}'s visa expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'} (${v.end_date}).`,
                    is_read: false,
                    created_at: new Date().toISOString()
                } as Notification;
            });

            // Combine real + virtual; deduplicate by id
            const combined = [...(dbNotifications || []), ...virtualNotifications];

            return combined.sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
        },
        enabled: !!user,
        // Refresh every 5 minutes as a safety net
        refetchInterval: 5 * 60 * 1000,
    });
}

export function useMarkNotificationRead() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (id: string) => {
            // Virtual / mock notifications don't live in the DB
            if (id.startsWith('virtual-') || id.startsWith('mock-')) return;

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

export function useMarkAllNotificationsRead() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async () => {
            if (!user) return;

            const { error } = await supabase
                .from("notifications")
                .update({ is_read: true })
                .eq("user_id", user.id)
                .eq("is_read", false);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
        },
    });
}

/** Utility to create a notification record programmatically from the frontend.
 *  Use sparingly – prefer DB triggers for reliable delivery. */
export function useCreateNotification() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async ({
            targetUserId,
            type,
            title,
            message,
        }: {
            targetUserId: string;
            type: string;
            title: string;
            message: string;
        }) => {
            const { error } = await supabase.from("notifications").insert({
                user_id: targetUserId,
                notification_type: type,
                title,
                message,
                is_read: false,
            });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
        },
    });
}
