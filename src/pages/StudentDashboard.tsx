import { useState, useMemo } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Avatar,
    Chip,
    Stack,
    Button,
    IconButton,
    CircularProgress,
    Divider,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow
} from '@mui/material';
import {
    Logout as LogoutIcon,
    CloudUpload as UploadIcon,
    NotificationsActive as AlertIcon,
    CheckCircleOutline as SuccessIcon,
    Description as DocIcon,
    AccountBalanceWallet as WalletIcon,
    ArrowForward as ArrowIcon,
    ErrorOutline as PendingIcon
} from '@mui/icons-material';
import { useAuth } from '../auth/AuthProvider';
import { useMyStudentProfile } from '../hooks/useStudents';
import { StudentCardFront } from '../components/DigitalStudentCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';
import { format, differenceInDays, parseISO } from 'date-fns';
import { VisaRenewalWizard } from '../components/dashboard/immigration/VisaRenewalWizard';

export default function StudentDashboard() {
    const { signOut } = useAuth();
    const { data: student, isLoading } = useMyStudentProfile();
    const [renewalOpen, setRenewalOpen] = useState(false);

    const attendancePercent = useMemo(() => {
        if (!student?.attendance || student.attendance.length === 0) return 85; // Mocking better default for visual
        const presentCount = student.attendance.filter((a: any) => a.status === 'PRESENT').length;
        return Math.round((presentCount / student.attendance.length) * 100);
    }, [student]);

    const visaDaysLeft = useMemo(() => {
        if (!student?.visa?.end_date) return null;
        try {
            return differenceInDays(parseISO(student.visa.end_date), new Date());
        } catch (e) {
            return null;
        }
    }, [student]);

    const cardData = useMemo(() => {
        if (!student) return null;
        return {
            id: student.id,
            schoolId: student.student_id_number || "—",
            iin: student.passport_number || "—",
            fullName: student.full_name || "—",
            dateOfBirth: student.date_of_birth ? format(parseISO(student.date_of_birth), 'dd.MM.yyyy') : "—",
            sex: student.sex || "—",
            nationality: student.nationality || "—",
            photo: student.photo_url,
            schoolName: student.institution?.name || "—",
            schoolAddress: student.institution?.address || "—",
            schoolLogo: student.institution?.logo_url,
            dateOfIssue: student.created_at ? format(parseISO(student.created_at), 'dd.MM.yyyy') : "—",
            dateOfExpiry: student.visa?.end_date ? format(parseISO(student.visa.end_date), 'dd.MM.yyyy') : "—",
            phoneNumber: student.phone || "—",
            cityRegion: student.institution?.city || "Almaty",
            qrData: student.student_id_number
        };
    }, [student]);

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#f8fafc' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!student) {
        return (
            <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">No student record linked to this account.</Typography>
                <Button onClick={signOut} sx={{ mt: 2 }}>Sign Out</Button>
            </Container>
        );
    }

    return (
        <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 8 }}>
            {/* Header / Stats Bar */}
            <Box sx={{ bgcolor: 'white', px: 4, py: 3, borderBottom: '1px solid #E2E8F0', mb: 4 }}>
                <Container maxWidth="xl">
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar
                                src={student.photo_url || ''}
                                sx={{ width: 64, height: 64, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Box>
                                <Typography variant="h5" fontWeight={900} color="#1E293B">Welcome back, {student.full_name?.split(' ')[0]}!</Typography>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <SuccessIcon sx={{ fontSize: 16, color: '#10B981' }} />
                                    <Typography variant="body2" fontWeight={600} color="#64748B">System Status: <span style={{ color: '#10B981' }}>Active</span></Typography>
                                </Stack>
                            </Box>
                        </Stack>

                        <Stack direction="row" spacing={4}>
                            <Box sx={{ textAlign: { xs: 'center', md: 'right' } }}>
                                <Typography variant="caption" fontWeight={800} color="#94A3B8" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Visa Expiry</Typography>
                                <Typography variant="h5" fontWeight={900} color={visaDaysLeft && visaDaysLeft < 30 ? 'error.main' : 'primary.main'}>
                                    {visaDaysLeft ?? '—'} Days
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: { xs: 'center', md: 'right' } }}>
                                <Typography variant="caption" fontWeight={800} color="#94A3B8" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Attendance</Typography>
                                <Typography variant="h5" fontWeight={900} color="#1E293B">{attendancePercent}%</Typography>
                            </Box>
                            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
                            <IconButton onClick={signOut} sx={{ bgcolor: '#F1F5F9', '&:hover': { bgcolor: '#E2E8F0' } }}>
                                <LogoutIcon color="action" />
                            </IconButton>
                        </Stack>
                    </Stack>
                </Container>
            </Box>

            <Container maxWidth="xl">
                {/* Highlight Call to Action */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        mb: 4,
                        bgcolor: '#FEF9C3', // Light yellow
                        border: '1px solid #FEF08A',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ bgcolor: '#FACC15', p: 1, borderRadius: 2 }}>
                            <AlertIcon sx={{ color: '#854D0E' }} />
                        </Box>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={800} color="#854D0E">Liveness Check Required</Typography>
                            <Typography variant="body2" color="#A16207">Please perform your weekly biometrics verification to keep your ID active.</Typography>
                        </Box>
                    </Stack>
                    <Button
                        variant="contained"
                        sx={{
                            bgcolor: '#854D0E',
                            color: 'white',
                            fontWeight: 800,
                            borderRadius: 2,
                            '&:hover': { bgcolor: '#713F12' }
                        }}
                        endIcon={<ArrowIcon />}
                    >
                        Start Verification
                    </Button>
                </Paper>

                <Grid container spacing={4}>
                    {/* Left Column - Main Details */}
                    <Grid size={{ xs: 12, lg: 8 }}>
                        <Stack spacing={4}>
                            {/* My Digital Card Preview */}
                            <Paper sx={{ p: 4, borderRadius: 5, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                                    <Typography variant="h6" fontWeight={900}>My Digital Identification</Typography>
                                    <Chip label="OFFICIAL" size="small" sx={{ fontWeight: 800, bgcolor: '#F1F5F9', color: '#64748B' }} />
                                </Stack>
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                    {cardData && <StudentCardFront student={cardData} />}
                                </Box>
                                <Typography variant="caption" textAlign="center" display="block" color="text.secondary" sx={{ mt: 2 }}>
                                    This is a persistent preview of your legal digital identification in the Republic of Kazakhstan.
                                </Typography>
                            </Paper>

                            {/* Visa Detail Table */}
                            <Paper sx={{ p: 4, borderRadius: 5, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                                <Typography variant="h6" fontWeight={900} mb={3}>Visa Details</Typography>
                                <TableContainer>
                                    <Table>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell sx={{ border: 'none', color: '#64748B', fontWeight: 700 }}>Visa Type</TableCell>
                                                <TableCell sx={{ border: 'none', fontWeight: 800 }}>{student.visa?.visa_type || 'Study (C9)'}</TableCell>
                                                <TableCell sx={{ border: 'none', color: '#64748B', fontWeight: 700 }}>Status</TableCell>
                                                <TableCell sx={{ border: 'none' }}>
                                                    <Chip label={student.visa?.status} size="small" color="success" sx={{ fontWeight: 800 }} />
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ border: 'none', color: '#64748B', fontWeight: 700 }}>Date of Issue</TableCell>
                                                <TableCell sx={{ border: 'none', fontWeight: 800 }}>
                                                    {student.visa?.issued_at ? format(parseISO(student.visa.issued_at), 'MMM dd, yyyy') : '—'}
                                                </TableCell>
                                                <TableCell sx={{ border: 'none', color: '#64748B', fontWeight: 700 }}>Date of Expiry</TableCell>
                                                <TableCell sx={{ border: 'none', fontWeight: 800, color: 'error.main' }}>
                                                    {student.visa?.end_date ? format(parseISO(student.visa.end_date), 'MMM dd, yyyy') : '—'}
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    sx={{ mt: 3, borderRadius: 3, py: 1.5, fontWeight: 800, borderWidth: 2 }}
                                    onClick={() => setRenewalOpen(true)}
                                >
                                    Request Visa Extension
                                </Button>
                            </Paper>

                            {/* Pending Tasks */}
                            <Paper sx={{ p: 4, borderRadius: 5, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                                <Typography variant="h6" fontWeight={900} mb={3}>Pending Tasks</Typography>
                                <Stack spacing={2}>
                                    {[
                                        { title: 'Upload Passport Scan', desc: 'Missing front page scan for visa records.', status: 'pending', color: '#F59E0B' },
                                        { title: 'Confirm Contact Details', desc: 'Please verify your current local address.', status: 'done', color: '#10B981' }
                                    ].map((task, idx) => (
                                        <Box key={idx} sx={{ p: 2, borderRadius: 3, border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Box sx={{ bgcolor: `${task.color}15`, p: 1, borderRadius: 2 }}>
                                                    {task.status === 'pending' ? <PendingIcon sx={{ color: task.color }} /> : <SuccessIcon sx={{ color: task.color }} />}
                                                </Box>
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight={800}>{task.title}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{task.desc}</Typography>
                                                </Box>
                                            </Stack>
                                            <IconButton size="small"><ArrowIcon fontSize="small" /></IconButton>
                                        </Box>
                                    ))}
                                </Stack>
                            </Paper>
                        </Stack>
                    </Grid>

                    {/* Right Column - Secondary Info */}
                    <Grid size={{ xs: 12, lg: 4 }}>
                        <Stack spacing={4}>
                            {/* Attendance Component */}
                            <Paper sx={{ p: 4, borderRadius: 5, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                                <Typography variant="h6" fontWeight={900} mb={3}>Attendance Goal</Typography>
                                <Box sx={{ height: 260, width: '100%', position: 'relative' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Present', value: attendancePercent },
                                                    { name: 'Remaining', value: 100 - attendancePercent }
                                                ]}
                                                innerRadius={70}
                                                outerRadius={100}
                                                startAngle={90}
                                                endAngle={450}
                                                paddingAngle={8}
                                                dataKey="value"
                                                cornerRadius={10}
                                            >
                                                <Cell fill="#3B82F6" />
                                                <Cell fill="#F1F5F9" />
                                                <Label
                                                    content={({ viewBox: { cx, cy } }: any) => (
                                                        <g>
                                                            <text x={cx} y={cy - 10} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '2.5rem', fontWeight: 900, fill: '#1E293B' }}>
                                                                {attendancePercent}%
                                                            </text>
                                                            <text x={cx} y={cy + 25} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '0.9rem', fontWeight: 700, fill: '#94A3B8', textTransform: 'uppercase' }}>
                                                                Overall
                                                            </text>
                                                        </g>
                                                    )}
                                                />
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Box>
                                <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#3B82F6' }} />
                                        <Typography variant="caption" fontWeight={700}>Present</Typography>
                                    </Stack>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#F1F5F9' }} />
                                        <Typography variant="caption" fontWeight={700}>Target (80%)</Typography>
                                    </Stack>
                                </Stack>
                            </Paper>

                            {/* Documents Hub */}
                            <Paper sx={{ p: 4, borderRadius: 5, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                                    <Typography variant="h6" fontWeight={900}>Recent Documents</Typography>
                                    <DocIcon color="action" />
                                </Stack>
                                <Stack spacing={2}>
                                    {[
                                        { name: 'Passport_Copy.pdf', size: '1.2 MB', date: 'Oct 12' },
                                        { name: 'Enrollment_Letter.pdf', size: '840 KB', date: 'Oct 10' }
                                    ].map((doc, idx) => (
                                        <Stack key={idx} direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Box sx={{ bgcolor: '#F1F5F9', p: 1, borderRadius: 1.5 }}>
                                                    <DocIcon sx={{ fontSize: 18, color: '#64748B' }} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={800}>{doc.name}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{doc.size} • {doc.date}</Typography>
                                                </Box>
                                            </Stack>
                                            <IconButton size="small"><UploadIcon fontSize="small" /></IconButton>
                                        </Stack>
                                    ))}
                                </Stack>
                            </Paper>

                            {/* Wallet / Payments */}
                            <Paper sx={{ p: 4, borderRadius: 5, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                                    <Typography variant="h6" fontWeight={900}>Payments</Typography>
                                    <WalletIcon color="action" />
                                </Stack>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="caption" fontWeight={800} color="#94A3B8">Service Credits</Typography>
                                    <Typography variant="h4" fontWeight={900} color="primary.main">12,500 ₸</Typography>
                                </Box>
                                <Divider sx={{ mb: 3 }} />
                                <Stack spacing={2}>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">Visa Processing Fee</Typography>
                                        <Typography variant="body2" fontWeight={800}>- 8,000 ₸</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">Library Deposit</Typography>
                                        <Typography variant="body2" fontWeight={800}>- 4,500 ₸</Typography>
                                    </Stack>
                                </Stack>
                            </Paper>
                        </Stack>
                    </Grid>
                </Grid>
            </Container>

            <VisaRenewalWizard
                open={renewalOpen}
                studentId={student.id}
                institutionId={student.institution_id}
                onClose={() => setRenewalOpen(false)}
            />
        </Box>
    );
}
