import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Avatar,
    Button,
    Grid,
    TextField,
    Stack,
    Chip,
    IconButton,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Tooltip,
    CircularProgress,
    Alert,
    Snackbar
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    InfoOutlined as InfoIcon,
    PhotoCamera as PhotoCameraIcon,
    Save as SaveIcon,
} from '@mui/icons-material';
import { useMyStudentProfile, useUpdateStudent } from '../hooks/useStudents';

export default function StudentProfilePage() {
    const { data: student, isLoading, refetch } = useMyStudentProfile();
    const updateStudent = useUpdateStudent();
    const [formData, setFormData] = useState<any>(null);
    const [successMsg, setSuccessMsg] = useState(false);

    useEffect(() => {
        if (student) {
            setFormData({
                full_name: student.full_name || '',
                full_name_cyrillic: student.full_name_cyrillic || '',
                date_of_birth: student.date_of_birth || '',
                nationality: student.nationality || '',
                iin: student.iin || '',
                passport_number: student.passport_number || '',
                phone: student.phone || '',
                email: student.email || '',
                sex: student.sex || 'Male',
                institution_name: student.institution?.name || ''
            });
        }
    }, [student]);

    if (isLoading || !formData) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            await updateStudent.mutateAsync({
                id: student.id,
                ...formData
            });
            setSuccessMsg(true);
            refetch();
        } catch (err) {
            console.error('Failed to update profile:', err);
        }
    };

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={900} color="#1E293B" sx={{ fontFamily: 'Outfit', letterSpacing: '-0.5px' }}>
                    My Profile
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={updateStudent.isPending}
                    sx={{
                        borderRadius: 3,
                        px: 3,
                        py: 1,
                        fontWeight: 700,
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                        textTransform: 'none'
                    }}
                >
                    {updateStudent.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
            </Stack>

            {/* Profile Header Card */}
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    borderRadius: 4,
                    border: '1px solid #F1F5F9',
                    background: 'white',
                    mb: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                }}
            >
                <Box sx={{ position: 'relative' }}>
                    <Avatar
                        src={student.photo_url || ''}
                        sx={{
                            width: 120,
                            height: 120,
                            border: '4px solid #F8FAFC',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                        }}
                    />
                    <IconButton
                        sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            bgcolor: 'white',
                            border: '1px solid #E2E8F0',
                            '&:hover': { bgcolor: '#F8FAFC' }
                        }}
                        size="small"
                    >
                        <PhotoCameraIcon fontSize="small" color="primary" />
                    </IconButton>
                </Box>

                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" fontWeight={900} color="#1E293B" sx={{ fontFamily: 'Outfit' }}>
                        {student.full_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mt: 0.5 }}>
                        Student ID: {student.student_id_number}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                        <Typography variant="body2" fontWeight={700} color="text.secondary">
                            Visa Status:
                        </Typography>
                        <Chip
                            label={student.visa?.status || 'Active'}
                            size="small"
                            color={student.visa?.status === 'EXPIRED' ? 'error' : 'success'}
                            sx={{ fontWeight: 800, height: 24 }}
                        />
                    </Stack>
                </Box>

                <Button
                    variant="outlined"
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, color: '#64748B', borderColor: '#E2E8F0' }}
                >
                    Upload Photo
                </Button>
            </Paper>

            {/* Form Sections */}
            <Stack spacing={3}>
                {/* Personal Information */}
                <Accordion
                    defaultExpanded
                    elevation={0}
                    sx={{
                        border: '1px solid #F1F5F9',
                        borderRadius: '16px !important',
                        '&:before': { display: 'none' },
                        mb: 2
                    }}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" fontWeight={800} color="#1E293B">Personal Information</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 3, pb: 4 }}>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="caption" fontWeight={700} color="#64748B" sx={{ mb: 1, display: 'block' }}>Full Name (Latin)</Typography>
                                <TextField
                                    fullWidth
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    variant="outlined"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#F8FAFC' } }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="caption" fontWeight={700} color="#64748B" sx={{ mb: 1, display: 'block' }}>Full Name (Cyrillic)</Typography>
                                <TextField
                                    fullWidth
                                    name="full_name_cyrillic"
                                    value={formData.full_name_cyrillic}
                                    onChange={handleChange}
                                    variant="outlined"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#F8FAFC' } }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="caption" fontWeight={700} color="#64748B" sx={{ mb: 1, display: 'block' }}>Date of Birth</Typography>
                                <TextField
                                    fullWidth
                                    type="date"
                                    name="date_of_birth"
                                    value={formData.date_of_birth}
                                    onChange={handleChange}
                                    variant="outlined"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#F8FAFC' } }}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="caption" fontWeight={700} color="#64748B" sx={{ mb: 1, display: 'block' }}>Nationality</Typography>
                                <TextField
                                    fullWidth
                                    name="nationality"
                                    value={formData.nationality}
                                    onChange={handleChange}
                                    variant="outlined"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#F8FAFC' } }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="caption" fontWeight={700} color="#64748B" sx={{ mb: 1, display: 'block' }}>Sex</Typography>
                                <TextField
                                    select
                                    fullWidth
                                    name="sex"
                                    value={formData.sex}
                                    onChange={handleChange}
                                    SelectProps={{ native: true }}
                                    variant="outlined"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#F8FAFC' } }}
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="caption" fontWeight={700} color="#64748B" sx={{ mb: 1, display: 'block' }}>Institution</Typography>
                                <TextField
                                    fullWidth
                                    disabled
                                    value={formData.institution_name}
                                    variant="outlined"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#F1F5F9' } }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
                                    <Typography variant="caption" fontWeight={700} color="#64748B">Individual Identification Number (IIN)</Typography>
                                    <Tooltip title="12-digit identification number in Kazakhstan">
                                        <InfoIcon sx={{ fontSize: 14, color: '#94A3B8', cursor: 'pointer' }} />
                                    </Tooltip>
                                </Stack>
                                <TextField
                                    fullWidth
                                    name="iin"
                                    value={formData.iin}
                                    onChange={handleChange}
                                    placeholder="000000000000"
                                    variant="outlined"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#F8FAFC' } }}
                                />
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>

                {/* Passport Details */}
                <Accordion
                    elevation={0}
                    sx={{
                        border: '1px solid #F1F5F9',
                        borderRadius: '16px !important',
                        '&:before': { display: 'none' }
                    }}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" fontWeight={800} color="#1E293B">Passport Details</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 3, pb: 4 }}>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="caption" fontWeight={700} color="#64748B" sx={{ mb: 1, display: 'block' }}>Passport Number</Typography>
                                <TextField
                                    fullWidth
                                    name="passport_number"
                                    value={formData.passport_number}
                                    onChange={handleChange}
                                    variant="outlined"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#F8FAFC' } }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="caption" fontWeight={700} color="#64748B" sx={{ mb: 1, display: 'block' }}>Expiry Date</Typography>
                                <TextField
                                    fullWidth
                                    type="date"
                                    variant="outlined"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#F8FAFC' } }}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>

                {/* Contact Information */}
                <Accordion
                    elevation={0}
                    sx={{
                        border: '1px solid #F1F5F9',
                        borderRadius: '16px !important',
                        '&:before': { display: 'none' }
                    }}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" fontWeight={800} color="#1E293B">Contact Information</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 3, pb: 4 }}>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="caption" fontWeight={700} color="#64748B" sx={{ mb: 1, display: 'block' }}>Phone Number</Typography>
                                <TextField
                                    fullWidth
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    variant="outlined"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#F8FAFC' } }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="caption" fontWeight={700} color="#64748B" sx={{ mb: 1, display: 'block' }}>Email Address</Typography>
                                <TextField
                                    fullWidth
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    variant="outlined"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#F8FAFC' } }}
                                />
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>

                {/* Security & Consent */}
                <Accordion
                    elevation={0}
                    sx={{
                        border: '1px solid #F1F5F9',
                        borderRadius: '16px !important',
                        '&:before': { display: 'none' }
                    }}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" fontWeight={800} color="#1E293B">Security & Consent</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 3, pb: 4 }}>
                        <Alert severity="info" sx={{ borderRadius: 3 }}>
                            Your data is securely stored and processed in accordance with national regulations.
                        </Alert>
                    </AccordionDetails>
                </Accordion>
            </Stack>

            <Snackbar
                open={successMsg}
                autoHideDuration={4000}
                onClose={() => setSuccessMsg(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity="success" variant="filled" sx={{ borderRadius: 3 }}>
                    Profile updated successfully!
                </Alert>
            </Snackbar>
        </Box>
    );
}
