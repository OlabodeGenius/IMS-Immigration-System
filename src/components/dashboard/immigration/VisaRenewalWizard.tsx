import { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Stack, Typography, TextField, Box, CircularProgress,
    IconButton, alpha
} from '@mui/material';
import { Close as CloseIcon, CloudUpload as UploadIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useCreateVisaApplication } from '../../../hooks/useVisaApplications';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../auth/AuthProvider';

interface VisaRenewalWizardProps {
    open: boolean;
    studentId: string;
    institutionId?: string; // Optional: can be passed directly (e.g. from StudentDashboard)
    onClose: () => void;
}

export function VisaRenewalWizard({ open, studentId, institutionId, onClose }: VisaRenewalWizardProps) {
    const { profile } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const createApplication = useCreateVisaApplication();

    // Determine the relevant institution ID
    const activeInstitutionId = institutionId || profile?.institution_id;

    // Form State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [passportFile, setPassportFile] = useState<File | null>(null);
    const [contractFile, setContractFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = async (file: File, folder: string) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${studentId}_${folder}_${Date.now()}.${fileExt}`;
        const filePath = `${studentId}/${fileName}`;

        const { error } = await supabase.storage
            .from('visa_documents')
            .upload(filePath, file);

        if (error) {
            throw error;
        }

        const { data } = supabase.storage
            .from('visa_documents')
            .getPublicUrl(filePath);

        return data.publicUrl;
    };

    const handleSubmit = async () => {
        if (!startDate || !endDate) {
            enqueueSnackbar("Please select both start and end dates", { variant: 'error' });
            return;
        }
        if (!passportFile || !contractFile) {
            enqueueSnackbar("Please upload both Passport and Contract scans", { variant: 'error' });
            return;
        }

        setIsUploading(true);
        try {
            // Upload to Supabase Storage
            const passportUrl = await handleUpload(passportFile, 'passport');
            const contractUrl = await handleUpload(contractFile, 'contract');

            // Insert DB Record
            await createApplication.mutateAsync({
                student_id: studentId,
                institution_id: activeInstitutionId!,
                application_type: 'RENEWAL',
                status: 'PENDING',
                requested_start_date: startDate,
                requested_end_date: endDate,
                passport_scan_url: passportUrl,
                contract_scan_url: contractUrl,
                officer_notes: null
            });

            enqueueSnackbar("Renewal application submitted successfully!", { variant: 'success' });
            onClose();
            // Reset state
            setStartDate('');
            setEndDate('');
            setPassportFile(null);
            setContractFile(null);
        } catch (error: any) {
            console.error("Submission error:", error);
            enqueueSnackbar(error.message || "Failed to submit application", { variant: 'error' });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={open} onClose={!isUploading ? onClose : undefined} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ pb: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={800}>Apply for Visa Renewal</Typography>
                    <IconButton onClick={onClose} disabled={isUploading} size="small"><CloseIcon /></IconButton>
                </Stack>
            </DialogTitle>
            <DialogContent dividers>
                <Typography variant="body2" color="text.secondary" mb={3}>
                    Submit a formal request to the Immigration Authority to extend or issue a new visa for this student.
                </Typography>

                <Stack spacing={3}>
                    <Stack direction="row" spacing={2}>
                        <TextField
                            label="Requested Start Date"
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            disabled={isUploading}
                        />
                        <TextField
                            label="Requested End Date"
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            disabled={isUploading}
                        />
                    </Stack>

                    <Box>
                        <Typography variant="subtitle2" fontWeight={700} mb={1}>Passport / ID Scan</Typography>
                        <Button
                            variant="outlined"
                            component="label"
                            fullWidth
                            startIcon={<UploadIcon />}
                            disabled={isUploading}
                            sx={{
                                py: 2,
                                borderStyle: 'dashed',
                                borderWidth: 2,
                                color: passportFile ? 'success.main' : 'primary.main',
                                borderColor: passportFile ? 'success.main' : 'primary.main',
                                bgcolor: passportFile ? alpha('#10B981', 0.05) : 'transparent'
                            }}
                        >
                            {passportFile ? passportFile.name : 'Upload Passport PDF/Image'}
                            <input type="file" hidden accept="image/*,.pdf" onChange={e => setPassportFile(e.target.files?.[0] || null)} />
                        </Button>
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" fontWeight={700} mb={1}>Offer Letter / Contract</Typography>
                        <Button
                            variant="outlined"
                            component="label"
                            fullWidth
                            startIcon={<UploadIcon />}
                            disabled={isUploading}
                            sx={{
                                py: 2,
                                borderStyle: 'dashed',
                                borderWidth: 2,
                                color: contractFile ? 'success.main' : 'primary.main',
                                borderColor: contractFile ? 'success.main' : 'primary.main',
                                bgcolor: contractFile ? alpha('#10B981', 0.05) : 'transparent'
                            }}
                        >
                            {contractFile ? contractFile.name : 'Upload Contract PDF/Image'}
                            <input type="file" hidden accept="image/*,.pdf" onChange={e => setContractFile(e.target.files?.[0] || null)} />
                        </Button>
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3, bgcolor: '#F8FAFC' }}>
                <Button onClick={onClose} disabled={isUploading} variant="text" sx={{ fontWeight: 700 }}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={isUploading}
                    variant="contained"
                    color="primary"
                    sx={{ borderRadius: 2, fontWeight: 800, px: 4 }}
                >
                    {isUploading ? <CircularProgress size={24} color="inherit" /> : 'Submit Application'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
