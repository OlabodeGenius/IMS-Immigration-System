import { useState } from 'react';
import { Box, Typography, Button, Stack, Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Grid, TextField } from "@mui/material";
import { useVisaApplications, useReviewVisaApplication } from "../../../hooks/useVisaApplications";
import { DataTable } from "../../DataTable";
import { useSnackbar } from "notistack";
import { Close as CloseIcon, Description as DocIcon, CheckCircle as ApproveIcon, Cancel as RejectIcon } from "@mui/icons-material";
import IconButton from '@mui/material/IconButton';

export function VisaApplicationsTab() {
    const { data: applications = [], isLoading } = useVisaApplications('PENDING');
    const [selectedApplication, setSelectedApplication] = useState<any | null>(null);

    const columns = [
        {
            id: "student",
            label: "Student Name",
            render: (row: any) => row.student?.full_name || "Unknown"
        },
        {
            id: "institution",
            label: "University",
            render: (row: any) => row.institution?.name || "Unknown"
        },
        {
            id: "application_type",
            label: "Type",
            render: (row: any) => (
                <Chip
                    label={row.application_type}
                    size="small"
                    color={row.application_type === 'NEW' ? 'primary' : 'secondary'}
                />
            )
        },
        {
            id: "status",
            label: "Status",
            render: (row: any) => (
                <Chip label={row.status} size="small" color="warning" />
            )
        },
        {
            id: "requested_start_date",
            label: "Requested Start",
            render: (row: any) => new Date(row.requested_start_date).toLocaleDateString()
        },
        {
            id: "requested_end_date",
            label: "Requested End",
            render: (row: any) => new Date(row.requested_end_date).toLocaleDateString()
        },
        {
            id: "created_at",
            label: "Submitted On",
            render: (row: any) => new Date(row.created_at).toLocaleDateString()
        }
    ];

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Pending Visa Applications</Typography>
            </Stack>

            <DataTable
                columns={columns}
                data={applications}
                isLoading={isLoading}
                searchPlaceholder="Search passing applications..."
                onRowClick={(row) => setSelectedApplication(row)}
            />

            {selectedApplication && (
                <ApplicationReviewDialog
                    open={true}
                    application={selectedApplication}
                    onClose={() => setSelectedApplication(null)}
                />
            )}
        </Box>
    );
}

// Inner Component for the Review Dialog
function ApplicationReviewDialog({ open, application, onClose }: { open: boolean, application: any, onClose: () => void }) {
    const { enqueueSnackbar } = useSnackbar();
    const reviewApplication = useReviewVisaApplication();
    const [notes, setNotes] = useState('');

    const handleAction = async (status: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED') => {
        try {
            await reviewApplication.mutateAsync({
                id: application.id,
                status,
                officer_notes: notes,
                student_id: application.student_id,
                requested_start_date: application.requested_start_date,
                requested_end_date: application.requested_end_date,
                application_type: application.application_type as 'NEW' | 'RENEWAL'
            });
            enqueueSnackbar(`Application marked as ${status}`, { variant: status === 'APPROVED' ? 'success' : 'warning' });
            onClose();
        } catch (error: any) {
            enqueueSnackbar(error.message || "Failed to process application", { variant: 'error' });
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="body">
            <DialogTitle sx={{ pb: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={800}>Review Visa Application</Typography>
                    <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
                </Stack>
            </DialogTitle>
            <DialogContent dividers sx={{ bgcolor: '#F8FAFC' }}>
                <Grid container spacing={3}>
                    {/* Details Column */}
                    <Grid size={{ xs: 12, md: 5 }}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', mb: 3 }}>
                            <Typography variant="subtitle2" color="primary" fontWeight={800} mb={2}>APPLICANT INFO</Typography>
                            <InfoRow label="Student" value={application.student?.full_name} />
                            <InfoRow label="University" value={application.institution?.name} />
                            <InfoRow label="Passport #" value={application.student?.passport_number || 'N/A'} />
                            <InfoRow label="Nationality" value={application.student?.nationality} />

                            <Typography variant="subtitle2" color="primary" fontWeight={800} mt={3} mb={2}>REQUEST LOGISTICS</Typography>
                            <InfoRow label="Application Type" value={application.application_type} />
                            <InfoRow label="Start Date" value={application.requested_start_date} />
                            <InfoRow label="End Date" value={application.requested_end_date} />
                        </Paper>

                        <TextField
                            label="Officer Investigation Notes (Internal)"
                            multiline
                            rows={4}
                            fullWidth
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add internal notes about this decision..."
                            variant="outlined"
                            sx={{ bgcolor: 'white' }}
                        />
                    </Grid>

                    {/* Document Preview Column */}
                    <Grid size={{ xs: 12, md: 7 }}>
                        <Typography variant="subtitle2" fontWeight={800} mb={2}>PROVIDED DOCUMENTATION</Typography>
                        <Stack spacing={2}>
                            <DocumentPreview title="Passport / ID Scan" url={application.passport_scan_url} />
                            <DocumentPreview title="Contract / Offer Letter" url={application.contract_scan_url} />
                        </Stack>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, bgcolor: '#FFFFFF', justifyContent: 'space-between' }}>
                <Button onClick={onClose} variant="text" sx={{ fontWeight: 700 }}>
                    Cancel
                </Button>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleAction('REJECTED')}
                        startIcon={<RejectIcon />}
                        disabled={reviewApplication.isPending}
                        sx={{ fontWeight: 800, borderRadius: 2 }}
                    >
                        Reject
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleAction('APPROVED')}
                        startIcon={<ApproveIcon />}
                        disabled={reviewApplication.isPending}
                        sx={{ fontWeight: 800, borderRadius: 2, px: 3 }}
                    >
                        {reviewApplication.isPending ? 'Processing...' : 'Approve & Issue Visa'}
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
}

function InfoRow({ label, value }: { label: string, value: React.ReactNode }) {
    return (
        <Stack direction="row" justifyContent="space-between" mb={1.5}>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            <Typography variant="body2" fontWeight={700}>{value}</Typography>
        </Stack>
    );
}

function DocumentPreview({ title, url }: { title: string, url: string | null }) {
    if (!url) return (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 150 }}>
            <Typography color="text.secondary" variant="body2">No document provided</Typography>
        </Paper>
    );

    // Simple iframe preview for images/pdfs. Works best with public Supabase URLs.
    return (
        <Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}>{title}</Typography>
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', overflow: 'hidden', height: 300, position: 'relative' }}>
                <iframe
                    src={url}
                    title={title}
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                />
                <Button
                    href={url}
                    target="_blank"
                    variant="contained"
                    size="small"
                    startIcon={<DocIcon />}
                    sx={{ position: 'absolute', bottom: 16, right: 16, borderRadius: 2, boxShadow: 2, fontWeight: 700 }}
                >
                    Open Full Size
                </Button>
            </Paper>
        </Box>
    );
}
