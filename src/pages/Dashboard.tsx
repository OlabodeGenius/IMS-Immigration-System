import { Container, Paper, Typography, Button, Box, Alert } from "@mui/material";
import { useAuth } from "../auth/AuthProvider";
import { useProfile } from "../profile/useProfile";
import ImmigrationDashboard from "./ImmigrationDashboard";
import InstitutionDashboard from "./InstitutionDashboard";
import StudentDashboard from "./StudentDashboard";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { DashboardShell } from "../components/DashboardShell";
import StudentProfilePage from "./StudentProfilePage";

export default function Dashboard() {
    const { user, signOut } = useAuth();
    const { data: profile, isLoading, error } = useProfile();
    const nav = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // If user exists but no profile row yet → onboarding
        if (!isLoading && user && !profile) {
            nav("/onboarding", { replace: true });
        }
    }, [isLoading, user, profile, nav]);

    if (isLoading) return <div style={{ padding: 24 }}>Loading dashboard...</div>;

    if (error) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                        Dashboard Error
                    </Typography>
                    <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                        {(error as any)?.message ?? "Failed to load profile"}
                    </Typography>
                    <Button variant="outlined" onClick={signOut}>Sign out</Button>
                </Paper>
            </Container>
        );
    }

    // Profile missing -> Onboarding route will handle it
    if (!profile) return null;

    if (profile.role === "STUDENT") {
        const queryParams = new URLSearchParams(location.search);
        const tab = queryParams.get("tab") || "overview";

        return (
            <DashboardShell title={tab === "profile" ? "" : "Student Portal"}>
                {tab === "profile" ? (
                    <StudentProfilePage />
                ) : tab === "visa" ? (
                    <Box>
                        <Typography variant="h5" fontWeight={900}>Visa Status</Typography>
                        <Alert severity="info" sx={{ mt: 2, borderRadius: 3 }}>
                            Detailed visa history and document tracking is coming soon.
                            Use the Dashboard tab to view your current status.
                        </Alert>
                    </Box>
                ) : tab === "documents" ? (
                    <Box>
                        <Typography variant="h5" fontWeight={900}>Documents Hub</Typography>
                        <Alert severity="info" sx={{ mt: 2, borderRadius: 3 }}>
                            Your secure document vault is being initialized.
                        </Alert>
                    </Box>
                ) : (
                    <StudentDashboard />
                )}
            </DashboardShell>
        );
    }

    return (
        <>
            {profile.role === "IMMIGRATION" ? (
                <ImmigrationDashboard />
            ) : (
                <InstitutionDashboard />
            )}
        </>
    );
}