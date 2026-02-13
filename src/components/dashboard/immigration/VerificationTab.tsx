import { Box, Typography, Chip } from "@mui/material";
import { useVerificationLogs } from "../../../hooks/useVerification";
import { DataTable } from "../../DataTable";
import type { VerificationRequest } from "../../../types/database.types";

export function VerificationTab() {
    const { data: logs = [], isLoading } = useVerificationLogs();

    const columns = [
        {
            id: "student",
            label: "Student",
            render: (row: VerificationRequest) => (row as any).student?.full_name || "Unknown"
        },
        {
            id: "student_id",
            label: "ID Number",
            render: (row: VerificationRequest) => (row as any).student?.student_id_number || "N/A"
        },
        { id: "verification_type", label: "Type" },
        {
            id: "result",
            label: "Result",
            render: (row: VerificationRequest) => {
                const status = row.result?.status || "UNKNOWN";
                return (
                    <Chip
                        label={status}
                        color={status === 'VERIFIED' ? 'success' : 'warning'}
                        size="small"
                    />
                );
            }
        },
        {
            id: "created_at",
            label: "Verified At",
            render: (row: VerificationRequest) => new Date(row.created_at).toLocaleString()
        },
    ];

    return (
        <Box>
            <Typography variant="h6" mb={2}>Verification Request Log</Typography>
            <DataTable
                columns={columns}
                data={logs}
                isLoading={isLoading}
                searchPlaceholder="Search logs..."
            />
        </Box>
    );
}
