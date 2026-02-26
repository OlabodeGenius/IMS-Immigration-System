import { Container, Paper, Stack, Typography, Button, Alert, Chip, Box } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { DataTable } from "../components/DataTable";
import { useProfile } from "../profile/useProfile";
import { useStudents } from "../hooks/useStudents";
import { useIssueStudentCard } from "../hooks/useStudentCards";
import { useSnackbar } from "notistack";
import { DashboardShell } from "../components/DashboardShell";

export default function StudentsPage() {
    const nav = useNavigate();
    const location = useLocation();
    const { enqueueSnackbar } = useSnackbar();
    const issueCard = useIssueStudentCard();
    const { data: profile, isLoading: profileLoading } = useProfile();

    const searchParams = new URLSearchParams(location.search);
    const urlQuery = searchParams.get("search") || "";

    const isInstitution = profile?.role === "INSTITUTION";

    // RLS will filter automatically for institution users.
    // Immigration will see all, if their role is IMMIGRATION and RLS allows.
    const { data, isLoading, error } = useStudents();

    return (
        <DashboardShell title="Student Registry">
            <Container maxWidth="xl" sx={{ py: 0 }}>
                <Paper sx={{ p: 4, borderRadius: 4, mb: 4, border: '1px solid #E2E8F0', bgcolor: 'white' }} elevation={0}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <div>
                            <Typography variant="h4" fontWeight={900} color="#1E293B" letterSpacing="-0.5px">
                                Student Registry
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Manage international students and visa lifecycle records.
                            </Typography>
                        </div>

                        {isInstitution && (
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => nav("/dashboard?tab=register")}
                                sx={{ borderRadius: 2.5, fontWeight: 800, px: 3 }}
                            >
                                Register Student
                            </Button>
                        )}
                    </Stack>
                </Paper>

                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                        Failed to load students: {(error as any)?.message ?? String(error)}
                    </Alert>
                )}

                <DataTable
                    data={data ?? []}
                    isLoading={isLoading || profileLoading}
                    searchPlaceholder="Search students by name, ID or passport..."
                    initialSearch={urlQuery}
                    onRowClick={(row) => nav(`/students/${row.id}`)}
                    columns={[
                        {
                            id: "photo",
                            label: "Photo",
                            render: (row: any) => (
                                <Box sx={{ width: 40, height: 40, borderRadius: '8px', overflow: 'hidden', bgcolor: '#F1F5F9' }}>
                                    <img
                                        src={row.photo_url || `https://ui-avatars.com/api/?name=${row.full_name}&background=random`}
                                        alt=""
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </Box>
                            )
                        },
                        { id: "student_id_number", label: "Student ID" },
                        { id: "full_name", label: "Full Name" },
                        { id: "nationality", label: "Nationality" },
                        { id: "passport_number", label: "Passport No." },

                        // Institution column (useful for Immigration)
                        {
                            id: "institution",
                            label: "Institution",
                            render: (row: any) => row.institution?.name ?? "—",
                        },

                        // Visa status + expiry
                        {
                            id: "visa_status",
                            label: "Visa Status",
                            render: (row: any) => {
                                const v = Array.isArray(row.visa) ? row.visa[0] : row.visa;
                                const status = v?.status ?? "—";
                                return (
                                    <Chip
                                        size="small"
                                        label={status}
                                        color={status === 'ACTIVE' ? 'success' : (status === 'EXPIRED' ? 'error' : 'default')}
                                        sx={{ fontWeight: 700, borderRadius: 1.5 }}
                                    />
                                );
                            },
                        },
                        {
                            id: "visa_expiry",
                            label: "Visa Expiry",
                            render: (row: any) => {
                                const v = Array.isArray(row.visa) ? row.visa[0] : row.visa;
                                return v?.end_date ? new Date(v.end_date).toLocaleDateString() : "—";
                            },
                        },
                        {
                            id: "actions",
                            label: "Actions",
                            render: (row: any) => (
                                <Stack direction="row" spacing={1}>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            issueCard.mutate(row.id, {
                                                onSuccess: () => enqueueSnackbar("Digital card issued successfully", { variant: "success" }),
                                                onError: (err: any) => enqueueSnackbar(err.message || "Failed to issue card", { variant: "error" })
                                            });
                                        }}
                                        sx={{ borderRadius: 1.5, fontWeight: 700 }}
                                    >
                                        Issue Card
                                    </Button>
                                </Stack>
                            ),
                        }
                    ]}
                />
            </Container>
        </DashboardShell>
    );
}