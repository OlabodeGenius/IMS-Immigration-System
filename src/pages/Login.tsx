// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Box, Button, Container, TextField, Typography, Paper, Stack, Alert, InputAdornment, IconButton, Link } from "@mui/material";
import { Visibility, VisibilityOff, ArrowBack, LoginOutlined } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../auth/AuthProvider";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
    const navigate = useNavigate();
    const { signIn } = useAuth();
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true);
        setAuthError(null);
        try {
            await signIn(data.email, data.password);
            navigate("/dashboard");
        } catch (error: any) {
            setAuthError(error.message || t('login.defaultError'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f8fafc", py: 4 }}>
            <Container maxWidth="sm">
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Button component={RouterLink} to="/" startIcon={<ArrowBack />} sx={{ color: "text.secondary", textTransform: "none", fontWeight: 600, "&:hover": { color: "primary.main" } }}>
                        {t('login.backToHome')}
                    </Button>
                    <LanguageSwitcher compact />
                </Stack>

                <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                    <Box sx={{ textAlign: "center", mb: 4 }}>
                        <Box sx={{ width: 64, height: 64, borderRadius: 2, bgcolor: "primary.50", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
                            <LoginOutlined sx={{ fontSize: 32, color: "primary.main" }} />
                        </Box>
                        <Typography variant="h4" fontWeight={800} gutterBottom>{t('login.welcomeBack')}</Typography>
                        <Typography variant="body2" color="text.secondary">{t('login.subtitle')}</Typography>
                    </Box>

                    {authError && <Alert severity="error" sx={{ mb: 3 }}>{authError}</Alert>}

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Stack spacing={3}>
                            <TextField
                                {...register("email")}
                                label={t('login.emailLabel')}
                                type="email"
                                fullWidth
                                autoComplete="email"
                                error={!!errors.email}
                                helperText={errors.email?.message}
                                placeholder={t('login.emailPlaceholder')}
                                InputProps={{ sx: { borderRadius: 2 } }}
                            />
                            <TextField
                                {...register("password")}
                                label={t('login.passwordLabel')}
                                type={showPassword ? "text" : "password"}
                                fullWidth
                                autoComplete="current-password"
                                error={!!errors.password}
                                helperText={errors.password?.message}
                                placeholder={t('login.passwordPlaceholder')}
                                InputProps={{
                                    sx: { borderRadius: 2 },
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" aria-label="toggle password visibility">
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Button type="submit" variant="contained" size="large" fullWidth disabled={isLoading} sx={{ py: 1.5, textTransform: "none", fontWeight: 600, fontSize: "1rem", borderRadius: 2 }}>
                                {isLoading ? t('login.signingIn') : t('login.signIn')}
                            </Button>
                        </Stack>
                    </form>

                    <Box sx={{ mt: 4, textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                            {t('login.noAccount')}{" "}
                            <Link component={RouterLink} to="/register" sx={{ color: "primary.main", textDecoration: "none", fontWeight: 600, "&:hover": { textDecoration: "underline" } }}>
                                {t('login.signUp')}
                            </Link>
                        </Typography>
                    </Box>
                </Paper>

                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
                    {t('login.footer')}
                </Typography>
            </Container>
        </Box>
    );
}
