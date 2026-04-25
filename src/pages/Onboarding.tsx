import { useState, useEffect } from "react";
import { Box, Button, Container, Paper, Stack, TextField, Typography, CircularProgress, Alert } from "@mui/material";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { PersonAdd as PersonAddIcon } from "@mui/icons-material";

export default function Onboarding() {
    const nav = useNavigate();
    const [fullName, setFullName] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            if (data.session?.user) {

                supabase.from("profiles")
                    .select("user_id")
                    .eq("user_id", data.session.user.id)
                    .single()
                    .then(({ data: profile }) => {
                        if (profile) {
                            nav("/dashboard", { replace: true });
                        } else {
                            setChecking(false);

                            const metaName = data.session.user.user_metadata?.full_name;
                            if (metaName) setFullName(metaName);
                        }
                    });
            } else {
                nav("/login", { replace: true });
            }
        });
    }, [nav]);

    const createProfile = async () => {
        if (!fullName.trim()) {
            setError("Please enter your full name.");
            return;
        }

        setBusy(true);
        setError(null);

        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData.session?.user;

        if (!user) {
            setBusy(false);
            return setError("You are not logged in. Please sign in again.");
        }

        const role = user.user_metadata?.role || "INSTITUTION";

        const { error: insertError } = await supabase.from("profiles").insert({
            user_id: user.id,
            role: role,
            full_name: fullName.trim(),
            institution_id: null,
        });

        if (insertError) {
            setBusy(false);
            return setError(insertError.message);
        }

        // Add a slight delay for smooth UX
        setTimeout(() => {
            nav("/dashboard", { replace: true });
        }, 500);
    };

    if (checking) {
        return (
            <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#F8FAFC" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#f8fafc",
            py: 4,
        }}>
            <Container maxWidth="sm">
                <Paper sx={{
                    p: { xs: 4, md: 6 },
                    borderRadius: 4,
                    boxShadow: "0 24px 64px -12px rgba(0,0,0,0.5)",
                    textAlign: "center"
                }}>
                    <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                        <Box sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            bgcolor: '#EFF6FF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#2563EB'
                        }}>
                            <PersonAddIcon fontSize="large" />
                        </Box>
                    </Box>

                    <Typography variant="h4" fontWeight={900} color="#0F172A" sx={{ fontFamily: 'Outfit', mb: 1 }}>
                        Complete Your Setup
                    </Typography>
                    <Typography variant="body1" color="#64748B" sx={{ mb: 4 }}>
                        Welcome to IMS. Please provide your full name to set up your account profile.
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2, textAlign: "left" }}>
                            {error}
                        </Alert>
                    )}

                    <Stack spacing={3}>
                        <TextField
                            label="Full Name"
                            variant="outlined"
                            fullWidth
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="e.g. Alisher Ospanov"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') createProfile();
                            }}
                            autoFocus
                        />

                        <Button
                            variant="contained"
                            onClick={createProfile}
                            disabled={busy || !fullName.trim()}
                            fullWidth
                            size="large"
                            sx={{
                                py: 1.8,
                                borderRadius: 3,
                                fontWeight: 800,
                                fontSize: "1.1rem",
                                textTransform: "none",
                                boxShadow: "0 8px 24px rgba(37,99,235,0.25)"
                            }}
                        >
                            {busy ? <CircularProgress size={24} color="inherit" /> : "Continue to Dashboard"}
                        </Button>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}