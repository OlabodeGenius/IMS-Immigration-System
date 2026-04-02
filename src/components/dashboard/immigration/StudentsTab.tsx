import { useState } from "react";
import { Box, Typography, Button, Stack, Chip, Paper, alpha } from "@mui/material";
import { useStudents } from "../../../hooks/useStudents";
import { useInstitution } from "../../../hooks/useInstitutions";
import { useBulkApproveStudents } from "../../../hooks/useVerification";
import { DataTable } from "../../DataTable";
import { StudentProfileDialog } from "../StudentProfileDialog";
import { useLocation, useNavigate } from "react-router-dom";
import { Close as ClearIcon } from "@mui/icons-material";
import { useSnackbar } from "notistack";

interface StudentsTabProps {
    initialSearch?: string;
}

export function StudentsTab({ initialSearch = "" }: StudentsTabProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    // Extract institutionId from query params
    const queryParams = new URLSearchParams(location.search);
    const filterInstitutionId = queryParams.get('institutionId');

    const { data: students = [], isLoading } = useStudents(filterInstitutionId || undefined);
    const { data: institution } = useInstitution(filterInstitutionId || '');

    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const { mutate: bulkApproveStudents, isPending: isBulkProcessing } = useBulkApproveStudents();

    const handleBulkAction = async (status: 'VERIFIED' | 'REJECTED') => {
        if (selectedIds.length === 0) return;

        bulkApproveStudents({
            studentIds: selectedIds,
            status,
            notes: `Bulk ${status.toLowerCase()} by officer`
        }, {
            onSuccess: () => {
                enqueueSnackbar(`Successfully ${status.toLowerCase()} ${selectedIds.length} students`, { variant: "success" });
                setSelectedIds([]);
            },
            onError: (err: any) => {
                enqueueSnackbar(err.message || `Failed to ${status.toLowerCase()} students`, { variant: "error" });
            }
        });
    };

    const columns = [
        { id: "full_name", label: "Full Name" },
        { id: "student_id_number", label: "Student ID" },
        { id: "nationality", label: "Nationality" },
        {
            id: "institution",
            label: "Institution",
            render: (row: any) => row.institution?.name || "N/A"
        },
        { id: "passport_number", label: "Passport" },
        {
            id: "verification",
            label: "Status",
            render: (row: any) => {
                const status = (row.metadata as any)?.verification_status || 'PENDING';
                let color: "warning" | "success" | "error" | "default" = "warning";
                if (status === 'VERIFIED') color = "success";
                if (status === 'REJECTED') color = "error";
                return <Chip label={status} size="small" color={color} variant="outlined" sx={{ fontWeight: 700 }} />;
            }
        },
        {
            id: "actions",
            label: "Actions",
            render: (row: any) => (
                <Stack direction="row" spacing={1}>
                    <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={(e) => {
                            e.stopPropagation();
                            enqueueSnackbar(`Formal warning sent to ${row.institution?.name || 'institution'} regarding student ${row.student_id_number}`, { variant: "warning" });
                        }}
                    >
                        Send Warning
                    </Button>
                    <Button
                        size="small"
                        color="error"
                        variant="contained"
                        onClick={(e) => {
                            e.stopPropagation();
                            enqueueSnackbar(`Student record ${row.student_id_number} has been flagged for review.`, { variant: "error" });
                        }}
                    >
                        Flag Record
                    </Button>
                    <Button
                        size="small"
                        color="primary"
                        variant="contained"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/students/${row.id}/issue-card`);
                        }}
                        sx={{ fontWeight: 800 }}
                    >
                        Issue Card
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudentId(row.id);
                        }}
                    >
                        View Profile
                    </Button>
                </Stack>
            ),
        }
    ];

    const clearFilter = () => {
        const params = new URLSearchParams(location.search);
        params.delete('institutionId');
        navigate(`${location.pathname}?${params.toString()}`);
    };

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                    <Typography variant="h6">
                        {filterInstitutionId && institution ? `Students at ${institution.name}` : "All International Students"}
                    </Typography>
                    {filterInstitutionId && (
                        <Typography variant="body2" color="text.secondary">
                            Showing records for selected university
                        </Typography>
                    )}
                </Box>
                <Stack direction="row" spacing={2}>
                    {selectedIds.length > 0 && (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 1,
                                px: 2,
                                borderRadius: 3,
                                border: '1px solid #E2E8F0',
                                bgcolor: alpha('#2563EB', 0.05),
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2
                            }}
                        >
                            <Typography variant="body2" fontWeight={700} color="primary textSecondary">
                                {selectedIds.length} Selected
                            </Typography>
                            <Button
                                size="small"
                                color="success"
                                variant="contained"
                                disabled={isBulkProcessing}
                                onClick={() => handleBulkAction('VERIFIED')}
                                sx={{ borderRadius: 2, fontWeight: 700 }}
                            >
                                Verify All
                            </Button>
                            <Button
                                size="small"
                                color="error"
                                variant="outlined"
                                disabled={isBulkProcessing}
                                onClick={() => handleBulkAction('REJECTED')}
                                sx={{ borderRadius: 2, fontWeight: 700, bgcolor: 'white' }}
                            >
                                Reject All
                            </Button>
                        </Paper>
                    )}
                    {filterInstitutionId && (
                        <Button
                            startIcon={<ClearIcon />}
                            onClick={clearFilter}
                            variant="outlined"
                            size="small"
                            sx={{ borderRadius: 2 }}
                        >
                            Clear Filter
                        </Button>
                    )}
                </Stack>
            </Stack>

            <DataTable
                columns={columns}
                data={students}
                isLoading={isLoading}
                searchPlaceholder="Search students..."
                onRowClick={(row) => setSelectedStudentId(row.id)}
                initialSearch={initialSearch}
                selectable
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
            />

            <StudentProfileDialog
                open={!!selectedStudentId}
                studentId={selectedStudentId}
                onClose={() => setSelectedStudentId(null)}
            />
        </Box>
    );
}
