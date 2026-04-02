import { useState } from "react";
import {
    Box,
    Typography,
    Paper,
    Chip,
    Stack,
    Button,
    Grid,
    Alert,
    CircularProgress,
    Divider,
    LinearProgress,
} from "@mui/material";
import {
    FlightTakeoff as FlightIcon,
    CalendarMonth as CalendarIcon,
    Timer as TimerIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useMyStudentProfile } from "../../../hooks/useStudents";
import { useVisaApplications } from "../../../hooks/useVisaApplications";

function getStatusColor(status: string) {
    switch (status?.toUpperCase()) {
        case "ACTIVE": return "#10B981";
        case "EXPIRED": return "#EF4444";
        case "PENDING": return "#F59E0B";
        case "REVOKED": return "#6B7280";
        default: return "#94A3B8";
    }
}

function getStatusIcon(status: string) {
    switch (status?.toUpperCase()) {
        case "ACTIVE": return <CheckCircleIcon sx={{ color: "#10B981" }} />;
        case "EXPIRED": return <ErrorIcon sx={{ color: "#EF4444" }} />;
        case "PENDING": return <WarningIcon sx={{ color: "#F59E0B" }} />;
        default: return <TimerIcon sx={{ color: "#94A3B8" }} />;
    }
}

function getDaysUntil(dateStr: string) {
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export default function StudentVisaStatusTab() {
    const { data: student, isLoading, refetch } = useMyStudentProfile();
    const { data: applications = [] } = useVisaApplications();

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!student) {
        return (
            <Alert severity="warning" sx={{ borderRadius: 3 }}>
                Unable to load your student profile. Please try again later.
            </Alert>
        );
    }

    // Normalize visa data — Supabase may return a single object, an array, or null
    const rawVisa = student.visa;
    const visaArray = Array.isArray(rawVisa) ? rawVisa : rawVisa ? [rawVisa] : [];
    const visas = visaArray.sort(
        (a: any, b: any) => new Date(b.expiry_date || b.end_date).getTime() - new Date(a.expiry_date || a.end_date).getTime()
    );
    const currentVisa = visas[0];
    const pastVisas = visas.slice(1);
    const myApps = applications.filter((a: any) => a.student_id === student.id);

    const expiryDate = currentVisa?.expiry_date || currentVisa?.end_date;
    const issueDate = currentVisa?.issue_date || currentVisa?.start_date;
    const daysLeft = expiryDate ? getDaysUntil(expiryDate) : null;
    const isExpired = daysLeft !== null && daysLeft < 0;
    const isExpiringSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 30;

    // Calculate visa progress (how much of the visa period has elapsed)
    let progressPercent = 0;
    if (issueDate && expiryDate) {
        const total = new Date(expiryDate).getTime() - new Date(issueDate).getTime();
        const elapsed = Date.now() - new Date(issueDate).getTime();
        progressPercent = Math.min(100, Math.max(0, (elapsed / total) * 100));
    }

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight={900} color="#1E293B" sx={{ fontFamily: "Outfit" }}>
                    Visa Status
                </Typography>
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={() => refetch()}
                    sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
                >
                    Refresh
                </Button>
            </Stack>

            {/* Expiry Warning Banner */}
            {isExpired && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 3, fontWeight: 700 }}>
                    Your visa has expired {Math.abs(daysLeft!)} days ago. Please contact your institution immediately to initiate a renewal.
                </Alert>
            )}
            {isExpiringSoon && (
                <Alert severity="warning" sx={{ mb: 3, borderRadius: 3, fontWeight: 700 }}>
                    Your visa expires in {daysLeft} day{daysLeft !== 1 ? "s" : ""}. Consider starting a renewal application.
                </Alert>
            )}

            {!currentVisa ? (
                <Paper sx={{ p: 5, borderRadius: 4, textAlign: "center", border: "1px solid #F1F5F9" }} elevation={0}>
                    <FlightIcon sx={{ fontSize: 56, color: "#CBD5E1", mb: 2 }} />
                    <Typography variant="h6" fontWeight={800} color="#64748B">No Visa Record Found</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Your institution hasn't registered a visa for your account yet. Please contact your university's international office.
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {/* Current Visa Card */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                borderRadius: 4,
                                border: "1px solid #E2E8F0",
                                background: "linear-gradient(135deg, #ffffff 0%, #F8FAFC 100%)",
                            }}
                        >
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    {getStatusIcon(currentVisa.status)}
                                    <Typography variant="h6" fontWeight={900} color="#1E293B">
                                        Current Visa
                                    </Typography>
                                </Stack>
                                <Chip
                                    label={currentVisa.status || "ACTIVE"}
                                    size="small"
                                    sx={{
                                        bgcolor: getStatusColor(currentVisa.status) + "18",
                                        color: getStatusColor(currentVisa.status),
                                        fontWeight: 800,
                                        fontSize: "0.75rem",
                                        border: `1px solid ${getStatusColor(currentVisa.status)}40`,
                                    }}
                                />
                            </Stack>

                            <Grid container spacing={3}>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <Typography variant="caption" fontWeight={700} color="#94A3B8" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                                        Visa Type
                                    </Typography>
                                    <Typography variant="body1" fontWeight={800} color="#1E293B" sx={{ mt: 0.5 }}>
                                        {currentVisa.visa_type || "National"}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <Typography variant="caption" fontWeight={700} color="#94A3B8" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                                        Issue Date
                                    </Typography>
                                    <Typography variant="body1" fontWeight={800} color="#1E293B" sx={{ mt: 0.5 }}>
                                        {formatDate(issueDate)}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <Typography variant="caption" fontWeight={700} color="#94A3B8" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                                        Expiry Date
                                    </Typography>
                                    <Typography variant="body1" fontWeight={800} color={isExpired ? "#EF4444" : "#1E293B"} sx={{ mt: 0.5 }}>
                                        {formatDate(expiryDate)}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <Typography variant="caption" fontWeight={700} color="#94A3B8" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                                        Days Left
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        fontWeight={800}
                                        color={isExpired ? "#EF4444" : isExpiringSoon ? "#F59E0B" : "#10B981"}
                                        sx={{ mt: 0.5 }}
                                    >
                                        {isExpired ? `Expired` : `${daysLeft} days`}
                                    </Typography>
                                </Grid>
                            </Grid>

                            {/* Visa Period Progress Bar */}
                            <Box sx={{ mt: 3 }}>
                                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                                    <Typography variant="caption" fontWeight={700} color="#94A3B8">
                                        Visa Period Progress
                                    </Typography>
                                    <Typography variant="caption" fontWeight={700} color="#64748B">
                                        {progressPercent.toFixed(0)}%
                                    </Typography>
                                </Stack>
                                <LinearProgress
                                    variant="determinate"
                                    value={progressPercent}
                                    sx={{
                                        height: 8,
                                        borderRadius: 4,
                                        bgcolor: "#F1F5F9",
                                        "& .MuiLinearProgress-bar": {
                                            borderRadius: 4,
                                            bgcolor: isExpired ? "#EF4444" : isExpiringSoon ? "#F59E0B" : "#3B82F6",
                                        },
                                    }}
                                />
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Countdown Card */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                borderRadius: 4,
                                border: "1px solid #E2E8F0",
                                background: isExpired
                                    ? "linear-gradient(135deg, #FEF2F2, #FEE2E2)"
                                    : isExpiringSoon
                                        ? "linear-gradient(135deg, #FFFBEB, #FEF3C7)"
                                        : "linear-gradient(135deg, #EFF6FF, #DBEAFE)",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                textAlign: "center",
                                height: "100%",
                            }}
                        >
                            <CalendarIcon sx={{ fontSize: 40, color: isExpired ? "#EF4444" : isExpiringSoon ? "#F59E0B" : "#3B82F6", mb: 1 }} />
                            <Typography
                                variant="h2"
                                fontWeight={900}
                                color={isExpired ? "#EF4444" : isExpiringSoon ? "#F59E0B" : "#3B82F6"}
                                sx={{ fontFamily: "Outfit", lineHeight: 1 }}
                            >
                                {isExpired ? "0" : daysLeft ?? "—"}
                            </Typography>
                            <Typography variant="body2" fontWeight={700} color="#64748B" sx={{ mt: 1 }}>
                                {isExpired ? "Days Overdue" : "Days Remaining"}
                            </Typography>
                        </Paper>
                    </Grid>

                    {/* Renewal Applications */}
                    {myApps.length > 0 && (
                        <Grid size={{ xs: 12 }}>
                            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px solid #E2E8F0" }}>
                                <Typography variant="h6" fontWeight={900} color="#1E293B" sx={{ mb: 3 }}>
                                    Renewal Applications
                                </Typography>
                                <Stack spacing={2}>
                                    {myApps.map((app: any) => (
                                        <Paper
                                            key={app.id}
                                            elevation={0}
                                            sx={{
                                                p: 3,
                                                borderRadius: 3,
                                                bgcolor: "#F8FAFC",
                                                border: "1px solid #F1F5F9",
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Box>
                                                <Typography variant="body1" fontWeight={800} color="#1E293B">
                                                    {app.application_type === "RENEWAL" ? "Visa Renewal" : "New Visa"} Application
                                                </Typography>
                                                <Typography variant="caption" color="#64748B">
                                                    Submitted {formatDate(app.created_at)} • {formatDate(app.requested_start_date)} → {formatDate(app.requested_end_date)}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={app.status}
                                                size="small"
                                                sx={{
                                                    fontWeight: 800,
                                                    bgcolor:
                                                        app.status === "APPROVED"
                                                            ? "#D1FAE5"
                                                            : app.status === "REJECTED"
                                                                ? "#FEE2E2"
                                                                : app.status === "PENDING"
                                                                    ? "#FEF3C7"
                                                                    : "#F1F5F9",
                                                    color:
                                                        app.status === "APPROVED"
                                                            ? "#059669"
                                                            : app.status === "REJECTED"
                                                                ? "#DC2626"
                                                                : app.status === "PENDING"
                                                                    ? "#D97706"
                                                                    : "#64748B",
                                                }}
                                            />
                                        </Paper>
                                    ))}
                                </Stack>
                            </Paper>
                        </Grid>
                    )}

                    {/* Visa History */}
                    <Grid size={{ xs: 12 }}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px solid #E2E8F0" }}>
                            <Typography variant="h6" fontWeight={900} color="#1E293B" sx={{ mb: 3 }}>
                                Visa History
                            </Typography>
                            {pastVisas.length > 0 ? (
                                <Stack spacing={0} divider={<Divider />}>
                                    {pastVisas.map((v: any, i: number) => (
                                        <Stack
                                            key={i}
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="center"
                                            sx={{ py: 2 }}
                                        >
                                            <Box>
                                                <Typography variant="body2" fontWeight={700} color="#1E293B">
                                                    {v.visa_type || "National"} Visa
                                                </Typography>
                                                <Typography variant="caption" color="#94A3B8">
                                                    {formatDate(v.issue_date || v.start_date)} — {formatDate(v.expiry_date || v.end_date)}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={v.status || "EXPIRED"}
                                                size="small"
                                                sx={{
                                                    fontWeight: 800,
                                                    bgcolor: getStatusColor(v.status) + "18",
                                                    color: getStatusColor(v.status),
                                                }}
                                            />
                                        </Stack>
                                    ))}
                                </Stack>
                            ) : (
                                <Typography variant="body2" color="#64748B" textAlign="center" sx={{ py: 3, fontStyle: 'italic' }}>
                                    No previous visa history found.
                                </Typography>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
}
