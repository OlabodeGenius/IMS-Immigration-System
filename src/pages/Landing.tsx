import {
    Box,
    Button,
    Chip,
    Container,
    Paper,
    Stack,
    Typography,
    Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid";

import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import QrCode2OutlinedIcon from "@mui/icons-material/QrCode2Outlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import { Link as RouterLink } from "react-router-dom";

function FeatureCard({
    icon,
    title,
    desc,
}: {
    icon: React.ReactNode;
    title: string;
    desc: string;
}) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                height: "100%",
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                    borderColor: "primary.main",
                },
            }}
        >
            <Stack spacing={1.25}>
                <Box
                    sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        display: "grid",
                        placeItems: "center",
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "primary.50",
                        color: "primary.main",
                    }}
                >
                    {icon}
                </Box>

                <Typography variant="h6" fontWeight={700}>
                    {title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {desc}
                </Typography>
            </Stack>
        </Paper>
    );
}

export default function Landing() {
    return (
        <Box
            sx={{
                minHeight: "100vh",
                background:
                    "radial-gradient(1200px 600px at 10% 10%, rgba(25,118,210,0.18), transparent 55%), radial-gradient(1000px 600px at 90% 20%, rgba(46,125,50,0.14), transparent 60%), linear-gradient(180deg, #f7f9fc 0%, #ffffff 70%)",
                py: { xs: 6, md: 9 },
            }}
        >
            <Container maxWidth="lg">
                {/* Top Bar */}
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 4 }}
                >
                    <Typography variant="h6" fontWeight={800} letterSpacing={0.3}>
                        IMS-IS Platform
                    </Typography>

                    <Stack direction="row" spacing={1.5}>
                        <Button
                            component={RouterLink}
                            to="/login"
                            variant="outlined"
                            sx={{ textTransform: "none" }}
                        >
                            Login
                        </Button>
                        <Button
                            component={RouterLink}
                            to="/register"
                            variant="contained"
                            sx={{ textTransform: "none" }}
                        >
                            Register / Sign Up
                        </Button>
                    </Stack>
                </Stack>

                {/* Hero Section */}
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, md: 5 },
                        borderRadius: 4,
                        border: "1px solid",
                        borderColor: "divider",
                        background: "rgba(255,255,255,0.9)",
                        backdropFilter: "blur(12px)",
                        mb: 5,
                    }}
                >
                    <Grid container spacing={4} alignItems="center">
                        <Grid size={{ xs: 12, md: 7 }}>
                            <Typography
                                variant="h3"
                                fontWeight={900}
                                sx={{
                                    lineHeight: 1.15,
                                    mb: 2,
                                    fontSize: { xs: "2rem", md: "3rem" }
                                }}
                            >
                                Immigration Management System for International Students
                            </Typography>

                            <Typography
                                variant="h6"
                                color="text.secondary"
                                sx={{
                                    mb: 3,
                                    lineHeight: 1.6,
                                    fontSize: { xs: "1rem", md: "1.25rem" }
                                }}
                            >
                                A centralized digital platform for immigration authorities and educational
                                institutions to manage student registration, visa lifecycle, attendance
                                monitoring, and secure QR-based identity verification.
                            </Typography>

                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                                <Button
                                    component={RouterLink}
                                    to="/dashboard"
                                    size="large"
                                    variant="contained"
                                    sx={{ textTransform: "none", fontWeight: 600 }}
                                >
                                    Access System
                                </Button>
                                <Button
                                    component={RouterLink}
                                    to="/register"
                                    size="large"
                                    variant="outlined"
                                    sx={{ textTransform: "none", fontWeight: 600 }}
                                >
                                    Institution Registration
                                </Button>
                            </Stack>

                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{ mt: 3, flexWrap: "wrap", gap: 1 }}
                            >
                                <Chip
                                    icon={<ApartmentOutlinedIcon />}
                                    label="Immigration Authority"
                                    variant="outlined"
                                />
                                <Chip
                                    icon={<SchoolOutlinedIcon />}
                                    label="Universities & Schools"
                                    variant="outlined"
                                />
                                <Chip
                                    icon={<VerifiedUserOutlinedIcon />}
                                    label="Authorized Verification Bodies"
                                    variant="outlined"
                                />
                            </Stack>
                        </Grid>

                        <Grid size={{ xs: 12, md: 5 }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    border: "1px solid",
                                    borderColor: "primary.light",
                                    bgcolor: "primary.50",
                                }}
                            >
                                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>
                                    System Capabilities
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Stack spacing={1.25}>
                                    {[
                                        "Digital Student Identity Issuance",
                                        "Visa Status Monitoring & Renewal Tracking",
                                        "Attendance and Institutional Compliance Monitoring",
                                        "Secure QR-Based Legitimacy Verification",
                                        "Tamper-Evident Records with Blockchain Hashing"
                                    ].map((capability, idx) => (
                                        <Box key={idx} sx={{ display: "flex", alignItems: "flex-start" }}>
                                            <Box
                                                sx={{
                                                    width: 6,
                                                    height: 6,
                                                    borderRadius: "50%",
                                                    bgcolor: "primary.main",
                                                    mt: 0.75,
                                                    mr: 1.5,
                                                    flexShrink: 0,
                                                }}
                                            />
                                            <Typography variant="body2">{capability}</Typography>
                                        </Box>
                                    ))}
                                </Stack>
                            </Paper>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Features Section */}
                <Box sx={{ mt: 5 }}>
                    <Typography variant="h5" fontWeight={900} sx={{ mb: 3, textAlign: "center" }}>
                        Core System Features
                    </Typography>

                    <Grid container spacing={2.5}>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <FeatureCard
                                icon={<QrCode2OutlinedIcon />}
                                title="QR Code Verification"
                                desc="Instant identity validation through secure QR scanning with minimal data exposure."
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <FeatureCard
                                icon={<SecurityOutlinedIcon />}
                                title="Blockchain Integrity Layer"
                                desc="Immutable hash records ensuring tamper-proof digital identity and visa data."
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <FeatureCard
                                icon={<InsightsOutlinedIcon />}
                                title="Smart Analytics Module"
                                desc="Machine learning–driven insights for visa expiry prediction and compliance risk detection."
                            />
                        </Grid>
                    </Grid>
                </Box>

                {/* Footer */}
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={1}
                    sx={{ mt: 6, pt: 3, borderTop: "1px solid", borderColor: "divider" }}
                >
                    <Typography variant="caption" color="text.secondary">
                        Immigration Management System for International Students (IMS-IS)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Secure • Transparent • Scalable Digital Identity Infrastructure
                    </Typography>
                </Stack>
            </Container>
        </Box>
    );
}