import { useState } from "react";
import { Box, Button, Container, Paper, Stack, TextField, Typography } from "@mui/material";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onLogin = async () => {
        setBusy(true);
        setError(null);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setBusy(false);
        if (error) return setError(error.message);
        nav("/dashboard");
    };

    return (
        <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
            <Container maxWidth="sm">
                <Paper sx={{ p: 4 }}>
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                        Login
                    </Typography>

                    <Stack spacing={2}>
                        <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <TextField
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {error && (
                            <Typography color="error" variant="body2">
                                {error}
                            </Typography>
                        )}
                        <Button variant="contained" onClick={onLogin} disabled={busy || !email || !password}>
                            {busy ? "Signing in..." : "Sign in"}
                        </Button>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}