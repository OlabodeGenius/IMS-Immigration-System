import React, { useState, useRef, useEffect } from "react";
import {
    Box,
    Paper,
    Typography,
    Stack,
    TextField,
    IconButton,
    List,
    ListItemButton,
    ListItemAvatar,
    Avatar,
    ListItemText,
    CircularProgress,
    Divider,
} from "@mui/material";
import {
    Send as SendIcon,
    Person as PersonIcon,
} from "@mui/icons-material";
import { useAuth } from "../../../auth/AuthProvider";
import {
    useConversations,
    useConversationMessages,
    useSendMessage,
    useMessagesRealtime,
} from "../../../hooks/useMessages";
import type { Conversation } from "../../../hooks/useMessages";
import { format } from "date-fns";

export function MessagesTab() {
    const { user } = useAuth();
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [draft, setDraft] = useState("");
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    const { data: conversations, isLoading: loadingConvos } = useConversations();
    const { data: messages, isLoading: loadingMessages } = useConversationMessages(activeConversationId);
    useMessagesRealtime(activeConversationId);
    
    const sendMessage = useSendMessage();

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!draft.trim() || !activeConversationId) return;
        sendMessage.mutate({ conversationId: activeConversationId, content: draft.trim() });
        setDraft("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (loadingConvos) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" p={10}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Paper elevation={0} sx={{ display: "flex", height: "calc(100vh - 200px)", minHeight: 500, borderRadius: 3, border: "1px solid #E2E8F0", overflow: "hidden" }}>
            {/* LEFT PANE: Conversations List */}
            <Box sx={{ width: 300, borderRight: "1px solid #E2E8F0", bgcolor: "#f8fafc", display: "flex", flexDirection: "column" }}>
                <Box p={2} borderBottom="1px solid #E2E8F0" bgcolor="white">
                    <Typography variant="h6" fontWeight={800}>Messages</Typography>
                </Box>
                <List sx={{ flexGrow: 1, overflowY: "auto", p: 0 }}>
                    {!conversations || conversations.length === 0 ? (
                        <Box p={3} textAlign="center">
                            <Typography variant="body2" color="text.secondary">No conversations yet.</Typography>
                        </Box>
                    ) : (
                        conversations.map((conv: Conversation) => {
                            const isStudent = conv.student_id === user?.id;
                            const otherPartyName = isStudent ? (conv.officer?.full_name || "Immigration Officer") : (conv.student?.full_name || "Student");
                            const avatarUrl = isStudent ? conv.officer?.avatar_url : conv.student?.avatar_url;

                            return (
                                <React.Fragment key={conv.id}>
                                    <ListItemButton
                                        selected={activeConversationId === conv.id}
                                        onClick={() => setActiveConversationId(conv.id)}
                                        sx={{
                                            "&.Mui-selected": { bgcolor: "primary.50" },
                                            "&:hover": { bgcolor: "action.hover" }
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar src={avatarUrl || ""} sx={{ bgcolor: "primary.main" }}>
                                                {!avatarUrl && <PersonIcon />}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={<Typography fontWeight={600} variant="body2">{otherPartyName}</Typography>}
                                            secondary={<Typography variant="caption" color="text.secondary">{format(new Date(conv.updated_at), "MMM d, HH:mm")}</Typography>}
                                        />
                                    </ListItemButton>
                                    <Divider />
                                </React.Fragment>
                            );
                        })
                    )}
                </List>
            </Box>

            {/* RIGHT PANE: Active Chat */}
            <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", bgcolor: "white" }}>
                {activeConversationId ? (
                    <>
                        <Box sx={{ flexGrow: 1, p: 3, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
                            {loadingMessages ? (
                                <Box display="flex" justifyContent="center" mt={5}><CircularProgress size={30} /></Box>
                            ) : (
                                messages?.map((msg) => {
                                    const isMe = msg.sender_id === user?.id;
                                    return (
                                        <Box key={msg.id} sx={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                                            <Box
                                                sx={{
                                                    maxWidth: "70%",
                                                    p: 2,
                                                    borderRadius: 3,
                                                    borderBottomRightRadius: isMe ? 4 : 24,
                                                    borderBottomLeftRadius: !isMe ? 4 : 24,
                                                    bgcolor: isMe ? "primary.main" : "#f1f5f9",
                                                    color: isMe ? "white" : "text.primary",
                                                    boxShadow: isMe ? "0 2px 8px rgba(37,99,235,0.2)" : "none",
                                                }}
                                            >
                                                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                                                    {msg.content}
                                                </Typography>
                                                <Typography variant="caption" sx={{ display: "block", mt: 0.5, opacity: 0.7, textAlign: isMe ? "right" : "left" }}>
                                                    {format(new Date(msg.created_at), "HH:mm")}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    );
                                })
                            )}
                            <div ref={endOfMessagesRef} />
                        </Box>
                        <Box sx={{ p: 2, borderTop: "1px solid #E2E8F0", bgcolor: "#f8fafc" }}>
                            <Stack direction="row" spacing={1}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Type your message..."
                                    value={draft}
                                    onChange={(e) => setDraft(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    multiline
                                    maxRows={4}
                                    sx={{ bgcolor: "white", borderRadius: 2, "& fieldset": { borderRadius: 2 } }}
                                />
                                <IconButton
                                    color="primary"
                                    onClick={handleSend}
                                    disabled={!draft.trim() || sendMessage.isPending}
                                    sx={{ bgcolor: "primary.main", color: "white", "&:hover": { bgcolor: "primary.dark" }, borderRadius: 2, width: 40, height: 40, alignSelf: "flex-end" }}
                                >
                                    {sendMessage.isPending ? <CircularProgress size={20} color="inherit" /> : <SendIcon fontSize="small" />}
                                </IconButton>
                            </Stack>
                        </Box>
                    </>
                ) : (
                    <Box display="flex" flexGrow={1} justifyContent="center" alignItems="center">
                        <Stack alignItems="center" spacing={2} sx={{ opacity: 0.5 }}>
                            <PersonIcon sx={{ fontSize: 64, color: "text.secondary" }} />
                            <Typography variant="h6" color="text.secondary">Select a conversation to start messaging</Typography>
                        </Stack>
                    </Box>
                )}
            </Box>
        </Paper>
    );
}
