import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../auth/AuthProvider";

export interface Conversation {
    id: string;
    student_id: string;
    officer_id: string;
    created_at: string;
    updated_at: string;
    // Expanded profile data
    student?: {
        full_name: string;
        avatar_url: string;
    };
    officer?: {
        full_name: string;
        avatar_url: string;
    };
}

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    read_at: string | null;
    created_at: string;
}

// ── QUERIES ────────────────────────────────────────────────────────

/** Fetch all conversations for the current authenticated user */
export function useConversations() {
    const { user } = useAuth();
    
    return useQuery({
        queryKey: ["conversations", user?.id],
        queryFn: async (): Promise<Conversation[]> => {
            if (!user) return [];

            const { data, error } = await supabase
                .from("conversations")
                .select(`
                    *,
                    student:student_id(full_name, avatar_url),
                    officer:officer_id(full_name, avatar_url)
                `)
                .or(`student_id.eq.${user.id},officer_id.eq.${user.id}`)
                .order("updated_at", { ascending: false });

            if (error) throw error;
            return data as any as Conversation[];
        },
        enabled: !!user,
    });
}

/** Fetch messages for a specific conversation */
export function useConversationMessages(conversationId: string | null) {
    return useQuery({
        queryKey: ["messages", conversationId],
        queryFn: async (): Promise<Message[]> => {
            if (!conversationId) return [];

            const { data, error } = await supabase
                .from("messages")
                .select("*")
                .eq("conversation_id", conversationId)
                .order("created_at", { ascending: true });

            if (error) throw error;
            return data as Message[];
        },
        enabled: !!conversationId,
    });
}

// ── MUTATIONS ──────────────────────────────────────────────────────

/** Send a new message */
export function useSendMessage() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async ({ conversationId, content }: { conversationId: string, content: string }) => {
            if (!user) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from("messages")
                .insert([{
                    conversation_id: conversationId,
                    sender_id: user.id,
                    content
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (newMessage) => {
            // Optimistically update the message list
            queryClient.setQueryData(["messages", newMessage.conversation_id], (old: Message[] | undefined) => {
                if (!old) return [newMessage];
                return [...old, newMessage];
            });
            // Invalidate conversations to bump 'updated_at'
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
    });
}

/** Create a new conversation or return existing */
export function useStartConversation() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async ({ studentId, officerId }: { studentId: string, officerId: string }) => {
            if (!user) throw new Error("Not authenticated");

            // Attempt to insert, handle unique constraint safely via upsert or just insert and catch
            // For simplicity, we assume the frontend checked if it exists, or we just insert and ignore conflicts
            const { data: existing } = await supabase
                .from("conversations")
                .select("*")
                .eq("student_id", studentId)
                .eq("officer_id", officerId)
                .maybeSingle();
                
            if (existing) return existing as Conversation;

            const { data, error } = await supabase
                .from("conversations")
                .insert([{ student_id: studentId, officer_id: officerId }])
                .select()
                .single();

            if (error) throw error;
            return data as Conversation;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
    });
}

// ── REALTIME SUBSCRIPTION HOOK ────────────────────────────────────

/**
 * Subscribes to realtime updates on the messages table for a specific conversation.
 * Automatically appends new messages to the React Query cache.
 */
export function useMessagesRealtime(conversationId: string | null) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!conversationId) return;

        const channel = supabase
            .channel(`public:messages:conversation_id=eq.${conversationId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `conversation_id=eq.${conversationId}`,
                },
                (payload) => {
                    const newMessage = payload.new as Message;
                    queryClient.setQueryData(["messages", conversationId], (old: Message[] | undefined) => {
                        if (!old) return [newMessage];
                        // Prevent duplicates if mutation already optimistically added it
                        if (old.some(m => m.id === newMessage.id)) return old;
                        return [...old, newMessage];
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId, queryClient]);
}
