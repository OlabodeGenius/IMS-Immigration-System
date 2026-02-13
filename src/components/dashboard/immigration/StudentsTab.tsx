import { useState, useMemo } from "react";
import { Box, Typography, Button, Stack, Chip, CircularProgress } from "@mui/material";
import { useStudents } from "../../../hooks/useStudents";
import { useInstitution } from "../../../hooks/useInstitutions";
import { DataTable } from "../../DataTable";
import { StudentProfileDialog } from "../StudentProfileDialog";
import type { Student } from "../../../types/database.types";
import { useLocation, useNavigate } from "react-router-dom";
import { Close as ClearIcon } from "@mui/icons-material";

export function StudentsTab() {
    const location = useLocation();
    const navigate = useNavigate();

    // Extract institutionId from query params
    const queryParams = new URLSearchParams(location.search);
    const filterInstitutionId = queryParams.get('institutionId');

    const { data: students = [], isLoading } = useStudents(filterInstitutionId || undefined);
    const { data: institution } = useInstitution(filterInstitutionId || '');

    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

    const columns = [
        { id: "full_name", label: "Full Name" },
        { id: "student_id_number", label: "Student ID" },
        { id: "nationality", label: "Nationality" },
        {
            id: "institution",
            label: "Institution",
            render: (row: Student) => row.institution?.name || "N/A"
        },
        { id: "passport_number", label: "Passport" },
        {
            id: "verification",
            label: "Status",
            render: (row: Student) => {
                const status = (row.metadata as any)?.verification_status || 'PENDING';
                let color: "warning" | "success" | "error" | "default" = "warning";
                if (status === 'VERIFIED') color = "success";
                if (status === 'REJECTED') color = "error";
                return <Chip label={status} size="small" color={color} variant="outlined" sx={{ fontWeight: 700 }} />;
            }
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

            <DataTable
                columns={columns}
                data={students}
                isLoading={isLoading}
                searchPlaceholder="Search students..."
                onRowClick={(row) => setSelectedStudentId(row.id)}
            />

            <StudentProfileDialog
                open={!!selectedStudentId}
                studentId={selectedStudentId}
                onClose={() => setSelectedStudentId(null)}
            />
        </Box>
    );
}
