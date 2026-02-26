import { useParams, useNavigate } from "react-router-dom";
import {
    Container,
    Paper,
    Stack,
    Typography,
    Button,
    Chip,
    Grid,
    Alert,
    Box,
} from "@mui/material";
import { DataTable } from "../components/DataTable";
import { useStudent } from "../hooks/useStudents";
import { useStudentCard } from "../hooks/useStudentCards";
import { DashboardShell } from "../components/DashboardShell";
import { StudentCardDialog } from "../components/dashboard/StudentCardDialog";
import { useState } from "react";

export default function StudentDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const nav = useNavigate();
    const [cardOpen, setCardOpen] = useState(false);

    const { data: student, isLoading: studentLoading, error } = useStudent(id || "");
    const { data: card, isLoading: cardLoading } = useStudentCard(id || "");

    const isLoading = studentLoading || cardLoading;

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">
                    Failed to load student: {(error as any)?.message ?? String(error)}
                </Alert>
                <Button sx={{ mt: 2 }} onClick={() => nav("/students")} variant="outlined">
                    Back to Students
                </Button>
            </Container>
        );
    }

    return (
        <DashboardShell title="Student Profile">
            <Container maxWidth="xl" sx={{ py: 0 }}>
                <Paper sx={{ p: 4, borderRadius: 4, mb: 4, border: '1px solid #E2E8F0', bgcolor: 'white' }} elevation={0}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={3} alignItems="center">
                            <Box sx={{ width: 80, height: 80, borderRadius: 4, overflow: 'hidden', bgcolor: '#F1F5F9', border: '1px solid #E2E8F0' }}>
                                <img
                                    src={student?.photo_url || `https://ui-avatars.com/api/?name=${student?.full_name}&background=random`}
                                    alt=""
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </Box>
                            <div>
                                <Typography variant="h4" fontWeight={900} color="#1E293B" letterSpacing="-0.5px">
                                    {student?.full_name || "Student Profile"}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    ID: {student?.student_id_number || "—"} • {student?.nationality || "—"}
                                </Typography>
                            </div>
                        </Stack>

                        <Stack direction="row" spacing={2}>
                            <Button variant="outlined" onClick={() => nav("/dashboard?tab=students")} sx={{ borderRadius: 2.5, fontWeight: 700 }}>
                                Back to Registry
                            </Button>

                            {card ? (
                                <Button
                                    variant="contained"
                                    onClick={() => setCardOpen(true)}
                                    color="success"
                                    sx={{ borderRadius: 2.5, fontWeight: 800, px: 3 }}
                                >
                                    View Digital Card
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    onClick={() => nav(`/students/${id}/issue-card`)}
                                    disabled={!student}
                                    sx={{ borderRadius: 2.5, fontWeight: 800, px: 3 }}
                                >
                                    Issue Digital Card
                                </Button>
                            )}
                        </Stack>
                    </Stack>
                </Paper>

                <StudentCardDialog
                    open={cardOpen}
                    studentId={id || null}
                    onClose={() => setCardOpen(false)}
                />

                <Grid container spacing={4}>
                    {/* Left: Basic Info & Record Status */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 4, borderRadius: 4, mb: 4, border: '1px solid #E2E8F0', bgcolor: 'white' }} elevation={0}>
                            <Typography variant="subtitle2" fontWeight={800} color="#64748B" mb={3} textTransform="uppercase" letterSpacing="0.5px">
                                Basic Information
                            </Typography>

                            <Stack spacing={3}>
                                <Box>
                                    <Typography color="text.secondary" variant="caption" fontWeight={700}>PASSPORT NUMBER</Typography>
                                    <Typography fontWeight={700} color="#1E293B">{student?.passport_number ?? "—"}</Typography>
                                </Box>
                                <Box>
                                    <Typography color="text.secondary" variant="caption" fontWeight={700}>SEX</Typography>
                                    <Typography fontWeight={700} color="#1E293B">{student?.sex ?? "—"}</Typography>
                                </Box>
                                <Box>
                                    <Typography color="text.secondary" variant="caption" fontWeight={700}>DATE OF BIRTH</Typography>
                                    <Typography fontWeight={700} color="#1E293B">{student?.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : "—"}</Typography>
                                </Box>
                                <Box>
                                    <Typography color="text.secondary" variant="caption" fontWeight={700}>CONTACT DETAILS</Typography>
                                    <Typography fontWeight={700} color="#1E293B">{student?.email ?? "—"}</Typography>
                                    <Typography variant="body2" color="#64748B">{student?.phone ?? "—"}</Typography>
                                </Box>
                                <Box>
                                    <Typography color="text.secondary" variant="caption" fontWeight={700}>INSTITUTION</Typography>
                                    <Typography fontWeight={700} color="#1E293B">{student?.institution?.name ?? "—"}</Typography>
                                </Box>
                                <Box>
                                    <Typography color="text.secondary" variant="caption" fontWeight={700}>RECORD STATUS</Typography>
                                    <Box mt={0.5}>
                                        <Chip
                                            size="small"
                                            label={(student as any)?.status ?? "ACTIVE"}
                                            color="success"
                                            sx={{ fontWeight: 700, borderRadius: 1.5 }}
                                        />
                                    </Box>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>

                    {/* Right: Visa & Attendance */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        {/* Visa Records */}
                        <Paper sx={{ p: 4, borderRadius: 4, mb: 4, border: '1px solid #E2E8F0', bgcolor: 'white' }} elevation={0}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" fontWeight={800} color="#64748B" textTransform="uppercase" letterSpacing="0.5px">
                                    Visa Lifecycle Records
                                </Typography>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => nav(`/students/${id}/add-visa`)}
                                    disabled={!student}
                                    sx={{ borderRadius: 2, fontWeight: 700 }}
                                >
                                    Update Visa
                                </Button>
                            </Stack>

                            <DataTable
                                data={(student as any)?.visa ?? []}
                                isLoading={isLoading}
                                searchable={false}
                                columns={[
                                    { id: "visa_type", label: "Type" },
                                    { id: "visa_number", label: "Visa No." },
                                    {
                                        id: "start_date",
                                        label: "Start Date",
                                        render: (row: any) => row.start_date ? new Date(row.start_date).toLocaleDateString() : "—"
                                    },
                                    {
                                        id: "end_date",
                                        label: "End Date",
                                        render: (row: any) => row.end_date ? new Date(row.end_date).toLocaleDateString() : "—"
                                    },
                                    {
                                        id: "status",
                                        label: "Status",
                                        render: (row: any) => (
                                            <Chip
                                                size="small"
                                                label={row.status}
                                                color={row.status === 'ACTIVE' ? 'success' : 'error'}
                                                sx={{ fontWeight: 700, borderRadius: 1.5 }}
                                            />
                                        ),
                                    },
                                ]}
                            />
                        </Paper>

                        {/* Recent Attendance */}
                        <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: 'white' }} elevation={0}>
                            <Typography variant="subtitle2" fontWeight={800} color="#64748B" mb={3} textTransform="uppercase" letterSpacing="0.5px">
                                Recent Attendance & Compliance
                            </Typography>

                            <DataTable
                                data={(student as any)?.attendance ?? []}
                                isLoading={isLoading}
                                searchable={false}
                                columns={[
                                    {
                                        id: "attendance_date",
                                        label: "Date",
                                        render: (row: any) => row.attendance_date ? new Date(row.attendance_date).toLocaleDateString() : "—"
                                    },
                                    {
                                        id: "status",
                                        label: "Status",
                                        render: (row: any) => (
                                            <Chip
                                                size="small"
                                                label={row.status}
                                                color={row.status === 'PRESENT' ? 'success' : 'error'}
                                                sx={{ fontWeight: 700, borderRadius: 1.5 }}
                                            />
                                        )
                                    },
                                    { id: "notes", label: "Notes" },
                                ]}
                            />
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </DashboardShell>
    );
}