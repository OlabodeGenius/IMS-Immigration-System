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
    alpha,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ShieldIcon from "@mui/icons-material/Shield";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import { supabase } from "../lib/supabaseClient";

type VerifyResult =
    | {
          valid: true;
          integrity_ok: boolean;
          blockchain_tx_id: string;
          institution: string | null;
          institution_type: string | null;
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

const REASON_LABELS: Record<string, string> = {
    missing_token:            "No verification token provided.",
    invalid_or_expired_token: "This QR code has expired or is invalid.",
    token_version_mismatch:   "This QR code has been superseded — please scan the latest card.",
    card_not_found:           "Card record not found in the system.",
    card_not_active:          "This card is no longer active (revoked or expired).",
    integrity_check_failed:   "Blockchain integrity check failed — this card may have been tampered with.",
    client_error:             "Network error while contacting the verification server.",
    server_error:             "Internal server error. Please try again.",
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

                // ── Call the Edge Function via fetch (not supabase.functions.invoke)
                // invoke() doesn't support query-string params — fetch does.
                const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-card?t=${encodeURIComponent(token)}`;

                const res = await fetch(fnUrl, {
                    method: "GET",
                    headers: {
                        "apikey":        import.meta.env.VITE_SUPABASE_ANON_KEY,
                        "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                    },
                });

                const data: VerifyResult = await res.json();

                // Supabase may forward auth errors as non-200 even when data is present
                if (!res.ok && !("valid" in data)) {
                    throw new Error(`HTTP ${res.status}`);
                }

                setResult(data);
            } catch (e: any) {
                setResult({ valid: false, reason: "client_error", error: String(e) });
            } finally {
                setLoading(false);
            }
        })();
    }, [token]);

    const isValid = result && "valid" in result && result.valid;

    // ── Helpers ───────────────────────────────────────────────────────────────
    const reasonLabel = (reason: string) => REASON_LABELS[reason] ?? reason;
    const visaColor = (status: string) => status === "ACTIVE" ? "success" : "error";

    return (
        <Box
            sx={{
                minHeight: "100vh",
                background: "linear-gradient(160deg, #F0F4FF 0%, #F8FAFC 60%, #FFFFFF 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 6,
            }}
        >
            {/* Branding strip */}
            <Stack direction="row" alignItems="center" spacing={1.5} mb={4}>
                <ShieldIcon sx={{ fontSize: 28, color: "primary.main" }} />
                <Typography fontWeight={900} fontSize="1.1rem" color="text.primary" letterSpacing="-0.3px">
                    Kazakhstan IMS — Secure Verification
                </Typography>
            </Stack>

            <Container maxWidth="sm">
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, sm: 5 },
                        borderRadius: 4,
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 24px 48px -12px rgba(0,0,0,0.08)",
                    }}
                >
                    {/* ── Loading ─────────────────────────────────────────── */}
                    {loading ? (
                        <Stack spacing={3} alignItems="center" py={6}>
                            <CircularProgress size={52} thickness={4} />
                            <Typography color="text.secondary" fontWeight={600}>
                                Verifying card integrity…
                            </Typography>
                            <Typography variant="caption" color="text.disabled" textAlign="center">
                                Checking blockchain ledger and token validity
                            </Typography>
                        </Stack>

                    /* ── VERIFIED ──────────────────────────────────────────── */
                    ) : isValid && result ? (
                        <Stack spacing={4}>
                            {/* Status hero */}
                            <Stack spacing={1} alignItems="center">
                                <Box
                                    sx={{
                                        width: 96, height: 96, borderRadius: "50%",
                                        bgcolor: alpha("#22c55e", 0.1),
                                        display: "grid", placeItems: "center",
                                        border: "3px solid #22c55e",
                                    }}
                                >
                                    <CheckCircleIcon sx={{ fontSize: 52, color: "#22c55e" }} />
                                </Box>
                                <Typography variant="h3" fontWeight={900} color="#22c55e" letterSpacing="-1px" mt={1}>
                                    VERIFIED
                                </Typography>
                                <Typography color="text.secondary" fontWeight={500}>
                                    Digital Identity Authenticated
                                </Typography>
                                <Chip
                                    label={result.integrity_ok ? "🔒 Blockchain Tamper-Proof" : "⚠ Integrity Warning"}
                                    size="small"
                                    sx={{
                                        mt: 0.5,
                                        fontWeight: 800,
                                        fontSize: "0.7rem",
                                        bgcolor: result.integrity_ok ? alpha("#22c55e", 0.1) : alpha("#ef4444", 0.1),
                                        color: result.integrity_ok ? "#15803d" : "#b91c1c",
                                        border: `1px solid ${result.integrity_ok ? "#86efac" : "#fca5a5"}`,
                                    }}
                                />
                            </Stack>

                            {/* Blockchain proof */}
                            <Box sx={{ bgcolor: "#F8FAFC", p: 3, borderRadius: 3, border: "1px solid #E2E8F0" }}>
                                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                    <FingerprintIcon sx={{ fontSize: 16, color: "#64748B" }} />
                                    <Typography variant="subtitle2" color="#64748B" fontWeight={800} textTransform="uppercase" fontSize="0.7rem">
                                        Blockchain Proof
                                    </Typography>
                                </Stack>
                                <Typography
                                    sx={{
                                        fontFamily: "monospace",
                                        fontSize: "0.72rem",
                                        wordBreak: "break-all",
                                        bgcolor: "white",
                                        p: 1.5,
                                        borderRadius: 1.5,
                                        border: "1px solid #CBD5E1",
                                        color: "#334155",
                                        lineHeight: 1.6,
                                    }}
                                >
                                    {result.blockchain_tx_id || "—"}
                                </Typography>
                            </Box>

                            {/* Student details grid */}
                            <Box>
                                <Typography
                                    variant="subtitle2"
                                    color="#64748B"
                                    fontWeight={800}
                                    textTransform="uppercase"
                                    fontSize="0.7rem"
                                    mb={2}
                                >
                                    Student Details
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid size={6}>
                                        <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={0.3}>
                                            STUDENT ID
                                        </Typography>
                                        <Typography fontWeight={700} fontSize="1rem">
                                            {result.student_id_number || "—"}
                                        </Typography>
                                    </Grid>
                                    <Grid size={6}>
                                        <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={0.3}>
                                            NATIONALITY
                                        </Typography>
                                        <Typography fontWeight={700} fontSize="1rem">
                                            {result.student_nationality || "—"}
                                        </Typography>
                                    </Grid>
                                    <Grid size={12}>
                                        <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={0.3}>
                                            INSTITUTION
                                        </Typography>
                                        <Typography fontWeight={700} fontSize="1rem">
                                            {result.institution || "—"}
                                        </Typography>
                                    </Grid>
                                    <Grid size={6}>
                                        <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={0.3}>
                                            VISA STATUS
                                        </Typography>
                                        <Chip
                                            label={result.visa_status}
                                            size="small"
                                            color={visaColor(result.visa_status)}
                                            sx={{ fontWeight: 800, borderRadius: 1.5 }}
                                        />
                                    </Grid>
                                    <Grid size={6}>
                                        <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={0.3}>
                                            VISA EXPIRY
                                        </Typography>
                                        <Typography fontWeight={700} fontSize="1rem" color={result.visa_status === "ACTIVE" ? "text.primary" : "error.main"}>
                                            {result.visa_end_date
                                                ? new Date(result.visa_end_date).toLocaleDateString("en-GB")
                                                : "N/A"}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Box>

                            <Typography variant="caption" color="text.disabled" align="center" sx={{ fontStyle: "italic", mt: -1 }}>
                                Privacy-preserving view — sensitive personal data is withheld.
                            </Typography>
                        </Stack>

                    /* ── FAILED ────────────────────────────────────────────── */
                    ) : (
                        <Stack spacing={3} alignItems="center" py={4}>
                            <Box
                                sx={{
                                    width: 96, height: 96, borderRadius: "50%",
                                    bgcolor: alpha("#ef4444", 0.08),
                                    display: "grid", placeItems: "center",
                                    border: "3px solid #ef4444",
                                }}
                            >
                                <CancelIcon sx={{ fontSize: 52, color: "#ef4444" }} />
                            </Box>
                            <Typography variant="h3" fontWeight={900} color="error.main" letterSpacing="-1px">
                                INVALID
                            </Typography>
                            <Typography color="text.secondary" align="center" maxWidth={320}>
                                {reasonLabel((result as any)?.reason ?? "unknown")}
                            </Typography>
                            {(result as any)?.error && (
                                <Typography
                                    variant="caption"
                                    color="text.disabled"
                                    fontFamily="monospace"
                                    textAlign="center"
                                    sx={{ wordBreak: "break-all", px: 2 }}
                                >
                                    {(result as any).error}
                                </Typography>
                            )}
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => window.location.reload()}
                                sx={{ borderRadius: 2, mt: 1, fontWeight: 700 }}
                            >
                                Try Again
                            </Button>
                        </Stack>
                    )}
                </Paper>

                <Typography variant="caption" color="text.disabled" align="center" display="block" mt={3}>
                    Powered by Kazakhstan Immigration Management System (IMS)
                </Typography>
            </Container>
        </Box>
    );
}