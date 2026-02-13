import { useState } from "react";
import { Box, Button, Container, Paper, Stack, TextField, Typography } from "@mui/material";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const nav = useNavigate();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const onRegister = async () => {
        setBusy(true);
        setError(null);
        setSuccess(null);

        // 1) Create auth user
        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (signUpError) {
            setBusy(false);
            return setError(signUpError.message);
        }

        const userId = data.user?.id;
        if (!userId) {
            setBusy(false);
            return setError(
                "Signup succeeded but user ID is missing. If email confirmations are enabled, confirm email then login."
            );
        }

        // 2) Create profile row (INSTITUTION role)
        const { error: profileErr } = await supabase.from("profiles").insert({
            user_id: userId,
            role: "INSTITUTION",
            full_name: fullName || null,
            institution_id: null,
        });

        setBusy(false);

        if (profileErr) return setError(profileErr.message);

        setSuccess("Account created. Please login.");
        setTimeout(() => nav("/login"), 900);
    };

    return (
        <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
            <Container maxWidth="sm">
                <Paper sx={{ p: 4, borderRadius: 3 }}>
                    <Typography variant="h5" fontWeight={900} gutterBottom>
                        Register Institution User
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Create an institution account to register students and manage visa monitoring.
                    </Typography>

                    <Stack spacing={2}>
                        <TextField label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                        <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <TextField
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            helperText="Use a strong password (min 6 characters)."
                        />

                        {error && <Typography color="error">{error}</Typography>}
                        {success && <Typography color="success.main">{success}</Typography>}

                        <Button
                            variant="contained"
                            onClick={onRegister}
                            disabled={busy || !email || password.length < 6}
                        >
                            {busy ? "Creating..." : "Create Account"}
                        </Button>

                        <Button variant="text" onClick={() => nav("/login")}>
                            Already have an account? Login
                        </Button>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}