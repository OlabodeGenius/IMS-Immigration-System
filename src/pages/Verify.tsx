import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    Box,
    Container,
    Paper,
    Typography,
    CircularProgress,
    Stack,
    Chip,
    Grid,
    Button,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { supabase } from "../lib/supabaseClient";

type VerifyResult =
    | {
        valid: true;
        integrity_ok: boolean;
        blockchain_tx_id: string;
        institution: string | null;
        visa_status: string;
        visa_end_date: string | null;
        student_nationality: string | null;
        student_id_number: string | null;
    }
    | {
        valid: false;
        reason: string;
        error?: string;
    };

export default function Verify() {
    const [params] = useSearchParams();
    const token = params.get("t");

    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<VerifyResult | null>(null);

    useEffect(() => {
        (async () => {
            try {
                if (!token) {
                    setResult({ valid: false, reason: "missing_token" });
                    return;
                }

                const { data, error } = await supabase.functions.invoke(`verify-card?t=${encodeURIComponent(token)}`, {
                    method: 'GET',
                });

                if (error) throw error;
                setResult(data);
            } catch (e: any) {
                setResult({ valid: false, reason: "client_error", error: String(e) });
            } finally {
                setLoading(false);
            }
        })();
    }, [token]);

    const isValid = result && "valid" in result && result.valid;

    return (
        <Box
            sx={{
                minHeight: "100vh",
                background: "linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)",
                py: 8,
            }}
        >
            <Container maxWidth="sm">
                <Paper sx={{ p: 4, borderRadius: 5, border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }} elevation={0}>
                    {loading ? (
                        <Stack spacing={3} alignItems="center" py={4}>
                            <CircularProgress size={48} thickness={5} />
                            <Typography color="text.secondary" fontWeight={600}>Establishing Secure Connection...</Typography>
                        </Stack>
                    ) : isValid ? (
                        <Stack spacing={4}>
                            <Stack spacing={1} alignItems="center">
                                <CheckCircleIcon sx={{ fontSize: 80, color: "success.main" }} />
                                <Typography variant="h3" fontWeight={900} color="success.main" letterSpacing="-1px">
                                    VERIFIED
                                </Typography>
                                <Typography color="text.secondary" fontWeight={500}>
                                    Digital Identity Authenticated
                                </Typography>
                            </Stack>

                            <Box sx={{ bgcolor: '#F1F5F9', p: 3, borderRadius: 3, border: '1px solid #E2E8F0' }}>
                                <Typography variant="subtitle2" color="#64748B" fontWeight={800} gutterBottom textTransform="uppercase">
                                    Official Record Proof
                                </Typography>
                                <Stack spacing={1.5} sx={{ mt: 2 }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight={700}>BLOCKCHAIN TX ID</Typography>
                                        <Typography sx={{
                                            fontFamily: 'monospace',
                                            fontSize: '0.75rem',
                                            wordBreak: 'break-all',
                                            bgcolor: 'white',
                                            p: 1.5,
                                            borderRadius: 1.5,
                                            mt: 0.5,
                                            border: '1px solid #CBD5E1'
                                        }}>
                                            {result.blockchain_tx_id}
                                        </Typography>
                                    </Box>
                                    <Stack direction="row" spacing={2}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="caption" color="text.secondary" fontWeight={700}>INTEGRITY</Typography>
                                            <Chip
                                                label={result.integrity_ok ? "TAMPER-PROOF" : "INVALID"}
                                                size="small"
                                                color={result.integrity_ok ? "success" : "error"}
                                                sx={{ fontWeight: 800, borderRadius: 1.5, mt: 0.5 }}
                                            />
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="caption" color="text.secondary" fontWeight={700}>VISA STATUS</Typography>
                                            <Chip
                                                label={result.visa_status}
                                                size="small"
                                                color={result.visa_status === 'ACTIVE' ? 'success' : 'error'}
                                                sx={{ fontWeight: 800, borderRadius: 1.5, mt: 0.5 }}
                                            />
                                        </Box>
                                    </Stack>
                                </Stack>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" color="#64748B" fontWeight={800} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box component="span" sx={{ width: 4, height: 4, bgcolor: 'primary.main', borderRadius: '50%' }} />
                                    STUDENT DETAILS
                                </Typography>
                                <Stack spacing={2}>
                                    <Grid container spacing={2}>
                                        <Grid size={6}>
                                            <Typography variant="caption" color="text.secondary" fontWeight={700}>STUDENT ID</Typography>
                                            <Typography fontWeight={700}>{result.student_id_number}</Typography>
                                        </Grid>
                                        <Grid size={6}>
                                            <Typography variant="caption" color="text.secondary" fontWeight={700}>NATIONALITY</Typography>
                                            <Typography fontWeight={700}>{result.student_nationality}</Typography>
                                        </Grid>
                                        <Grid size={12}>
                                            <Typography variant="caption" color="text.secondary" fontWeight={700}>INSTITUTION</Typography>
                                            <Typography fontWeight={700}>{result.institution}</Typography>
                                        </Grid>
                                        <Grid size={12}>
                                            <Typography variant="caption" color="text.secondary" fontWeight={700}>VISA EXPIRY</Typography>
                                            <Typography fontWeight={700} color="error.main">
                                                {result.visa_end_date ? new Date(result.visa_end_date).toLocaleDateString() : "N/A"}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Stack>
                            </Box>

                            <Typography variant="caption" color="text.secondary" align="center" sx={{ fontStyle: 'italic' }}>
                                This is a privacy-preserving verification view. Personal sensitive data is withheld.
                            </Typography>
                        </Stack>
                    ) : (
                        <Stack spacing={3} alignItems="center" py={4}>
                            <CancelIcon sx={{ fontSize: 80, color: "error.main" }} />
                            <Typography variant="h3" fontWeight={900} color="error.main" letterSpacing="-1px">
                                FAILED
                            </Typography>
                            <Typography color="text.secondary" align="center">
                                Error: {(result as any)?.reason ?? "Verification link invalid or expired."}
                            </Typography>
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => window.location.reload()}
                                sx={{ borderRadius: 2, mt: 2 }}
                            >
                                Try Again
                            </Button>
                        </Stack>
                    )}
                </Paper>
            </Container>
        </Box>
    );
}