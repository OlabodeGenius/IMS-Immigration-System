import { useState } from "react";
import { Box, Typography, Button, Stack, Avatar } from "@mui/material";
import { CloudUpload as CloudUploadIcon, VerifiedUser as VerifiedUserIcon } from "@mui/icons-material";
import { useStudents, useBulkImportStudents } from "../../../hooks/useStudents";
import { useAuth } from "../../../auth/AuthProvider";
import { useIssueStudentCard, useBatchIssueStudentCards, useRevokeStudentCard } from "../../../hooks/useStudentCards";
import { DataTable } from "../../DataTable";
import { StudentProfileDialog } from "../StudentProfileDialog";
import type { Student } from "../../../types/database.types";
import { useSnackbar } from "notistack";
import { StudentCardDialog } from "../StudentCardDialog";
import { BulkImportModal } from "./BulkImportModal";

interface MyStudentsTabProps {
    initialSearch?: string;
}

export function MyStudentsTab({ initialSearch = "" }: MyStudentsTabProps) {
    const { profile } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const issueCard = useIssueStudentCard();
    const bulkImport = useBulkImportStudents();
    const batchIssue = useBatchIssueStudentCards();
    const revokeCard = useRevokeStudentCard();

    const { data: students = [], isLoading } = useStudents(profile?.institution_id || undefined);

    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [cardStudentId, setCardStudentId] = useState<string | null>(null);
    const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
    const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

    const handleBatchIssue = () => {
        if (!selectedRowIds.length) return;
        const selectedStudents = students.filter(s => selectedRowIds.includes(s.id));

        // Notify start
        enqueueSnackbar(`Starting batch issuance for ${selectedStudents.length} students...`, { variant: "info" });

        batchIssue.mutate(selectedStudents, {
            onSuccess: (results) => {
                const successes = results.filter(r => r.status === 'success').length;
                const skipped = results.filter(r => r.status === 'skipped').length;
                const errors = results.filter(r => r.status === 'error').length;

                let msg = `Batch complete: ${successes} issued.`;
                if (skipped > 0) msg += ` ${skipped} already had cards.`;
                if (errors > 0) msg += ` ${errors} failed.`;

                enqueueSnackbar(msg, { variant: errors > 0 ? "warning" : "success" });
                setSelectedRowIds([]);
            },
            onError: (err: any) => {
                enqueueSnackbar(`Batch issue failed: ${err.message}`, { variant: "error" });
            }
        });
    };

    const columns = [
        {
            id: "photo",
            label: "Photo",
            render: (row: Student) => (
                <Avatar
                    src={row.photo_url || undefined}
                    sx={{ width: 32, height: 32, fontSize: '0.8rem' }}
                >
                    {row.full_name?.charAt(0)}
                </Avatar>
            )
        },
        { id: "full_name", label: "Full Name" },
        { id: "student_id_number", label: "Student ID" },
        { id: "nationality", label: "Nationality" },
        { id: "date_of_birth", label: "DOB" },
        { id: "passport_number", label: "Passport" },
        {
            id: "visa_status",
            label: "Visa Status",
            render: (row: Student) => (row as any).visa?.[0]?.status || "N/A"
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
                    >
                        Issue Card
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Are you sure you want to revoke the ID for ${row.full_name}? This action writes to the blockchain and cannot be undone.`)) {
                                revokeCard.mutate(row.id, {
                                    onSuccess: () => enqueueSnackbar(`Card revoked for ${row.full_name}`, { variant: "warning" }),
                                    onError: (err: any) => enqueueSnackbar(err.message || "Failed to revoke card", { variant: "error" })
                                });
                            }
                        }}
                    >
                        Revoke ID
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                            e.stopPropagation();
                            setCardStudentId(row.id);
                        }}
                    >
                        View Card
                    </Button>
                </Stack>
            ),
        }
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Enrolled Students</Typography>
                <Stack direction="row" spacing={2}>
                    {selectedRowIds.length > 0 && (
                        <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<VerifiedUserIcon />}
                            onClick={handleBatchIssue}
                            disabled={batchIssue.isPending}
                        >
                            {batchIssue.isPending ? 'Issuing...' : `Batch Issue Cards (${selectedRowIds.length})`}
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<CloudUploadIcon />}
                        onClick={() => setIsBulkImportOpen(true)}
                    >
                        Bulk Import CSV
                    </Button>
                </Stack>
            </Box>

            <DataTable
                columns={columns}
                data={students}
                isLoading={isLoading}
                searchPlaceholder="Search by name, ID, nationality..."
                onRowClick={(row) => setSelectedStudentId(row.id)}
                initialSearch={initialSearch}
                selectable={true}
                selectedIds={selectedRowIds}
                onSelectionChange={setSelectedRowIds}
            />

            <StudentProfileDialog
                open={!!selectedStudentId}
                studentId={selectedStudentId}
                onClose={() => setSelectedStudentId(null)}
            />

            <StudentCardDialog
                open={!!cardStudentId}
                studentId={cardStudentId}
                onClose={() => setCardStudentId(null)}
            />

            <BulkImportModal
                open={isBulkImportOpen}
                onClose={() => setIsBulkImportOpen(false)}
                onImport={async (parsedData) => {
                    if (!profile?.institution_id) throw new Error("No institution ID found");
                    await bulkImport.mutateAsync({
                        students: parsedData,
                        institution_id: profile.institution_id
                    });
                    enqueueSnackbar(`Successfully imported ${parsedData.length} students!`, { variant: "success" });
                }}
            />
        </Box>
    );
}
