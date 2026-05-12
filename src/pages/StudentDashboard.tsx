import { useState, useMemo, useEffect } from 'react';
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
    TableRow,
    Tooltip,
} from '@mui/material';
import {
    Logout as LogoutIcon,
    NotificationsActive as AlertIcon,
    CheckCircleOutline as SuccessIcon,
    Description as DocIcon,
    AccountBalanceWallet as WalletIcon,
    ArrowForward as ArrowIcon,
    OpenInNew as OpenInNewIcon,
    ErrorOutline as PendingIcon,
    FaceRetouchingNatural as FaceRetouchingNaturalIcon,
    Verified as VerifiedIcon
} from '@mui/icons-material';
import { useAuth } from '../auth/AuthProvider';
import { useMyStudentProfile } from '../hooks/useStudents';
import { useDocuments } from '../hooks/useDocuments';
import { usePayments } from '../hooks/usePayments';
import { StudentCardFront, StudentCardBack } from '../components/DigitalStudentCard';
import QRCode from 'qrcode';
import LivenessCheckModal from '../components/LivenessCheckModal';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';
import { format, differenceInDays, parseISO } from 'date-fns';
import { VisaRenewalWizard } from '../components/dashboard/immigration/VisaRenewalWizard';
import { useThemeMode } from '../theme/ThemeContext';
import { usePushSubscription } from '../hooks/usePushSubscription';
import AttendanceDetailModal from '../components/dashboard/student/AttendanceDetailModal';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';


export default function StudentDashboard() {
    const { signOut } = useAuth();
    const { data: student, isLoading } = useMyStudentProfile();
    const { mode, toggleMode } = useThemeMode();
    const { isSupported: pushSupported, isSubscribed: pushSubscribed, isLoading: pushLoading, subscribe: subscribePush, unsubscribe: unsubscribePush } = usePushSubscription();
    const [renewalOpen, setRenewalOpen] = useState(false);
    const [livenessOpen, setLivenessOpen] = useState(false);
    const [livenessStatus, setLivenessStatus] = useState<'pending' | 'scanning' | 'verified'>('pending');
    const [isFlipped, setIsFlipped] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [isExportingPdf, setIsExportingPdf] = useState(false);
    const [attendanceOpen, setAttendanceOpen] = useState(false);

    const { data: documents = [] } = useDocuments(student?.id ?? null);
    const { data: payments = [] } = usePayments(student?.id ?? null);

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
            iin: (student as any).iin || student.passport_number || "—",
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
            qrData: undefined,
        };
    }, [student]);

    // ── Generate QR for card back ─────────────────────────────────────────────
    useEffect(() => {
        if (!student?.student_id_number) return;
        QRCode.toDataURL(
            `${window.location.origin}/verify?card=${student.student_id_number}`,
            { width: 431, margin: 1, errorCorrectionLevel: 'H', color: { dark: '#000000', light: '#ffffff' } }
        ).then(setQrCodeUrl).catch(console.error);
    }, [student?.student_id_number]);

    // ── PDF Download — captures both card faces ───────────────────────────────
    const downloadIdPdf = async () => {
        setIsExportingPdf(true);
        try {
            const frontEl = document.getElementById('student-card-front');
            const backEl  = document.getElementById('student-card-back');
            if (!frontEl || !backEl) return;
            const opts = { quality: 1, pixelRatio: 3, backgroundColor: '#ffffff', fetchRequestInit: { cache: 'no-cache' as RequestCache } };
            const [frontUrl, backUrl] = await Promise.all([toPng(frontEl, opts), toPng(backEl, opts)]);
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [85.6, 54] });
            pdf.addImage(frontUrl, 'PNG', 0, 0, 85.6, 54);
            pdf.addPage([85.6, 54], 'landscape');
            pdf.addImage(backUrl, 'PNG', 0, 0, 85.6, 54);
            pdf.save(`student-id-${student?.student_id_number || 'card'}.pdf`);
        } catch (e) { console.error('PDF export failed', e); }
        finally { setIsExportingPdf(false); }
    };

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
                            {/* Dark mode toggle */}
                            <Tooltip title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                                <IconButton onClick={toggleMode} sx={{ bgcolor: 'action.hover' }}>
                                    {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                                </IconButton>
                            </Tooltip>
                            {/* Push notification subscribe */}
                            {pushSupported && (
                                <Tooltip title={pushSubscribed ? 'Disable Push Notifications' : 'Enable Push Notifications'}>
                                    <IconButton
                                        onClick={pushSubscribed ? unsubscribePush : subscribePush}
                                        disabled={pushLoading}
                                        sx={{ bgcolor: 'action.hover' }}
                                    >
                                        {pushSubscribed ? <NotificationsOffIcon /> : <NotificationsIcon />}
                                    </IconButton>
                                </Tooltip>
                            )}
                            {/* Sign out */}
                            <IconButton onClick={signOut} sx={{ bgcolor: 'action.hover' }}>
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
                        onClick={() => {
                            setLivenessStatus('pending');
                            setLivenessOpen(true);
                        }}
                    >
                        Start Verification
                    </Button>
                </Paper>

                <Grid container spacing={4}>
                    {/* Left Column - Main Details */}
                    <Grid size={{ xs: 12, lg: 8 }}>
                        <Stack spacing={4}>
                            {/* ── My Digital Card Preview (3D flip on click) ── */}
                            <Paper sx={{ p: 4, borderRadius: 5, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                                    <Typography variant="h6" fontWeight={900}>My Digital Identification</Typography>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Chip label="OFFICIAL" size="small" sx={{ fontWeight: 800, bgcolor: '#F1F5F9', color: '#64748B' }} />
                                        <Chip
                                            label={isFlipped ? '← Front' : 'Back →'}
                                            size="small"
                                            clickable
                                            onClick={(e) => { e.stopPropagation(); setIsFlipped(f => !f); }}
                                            sx={{
                                                fontWeight: 700,
                                                bgcolor: isFlipped ? '#DBEAFE' : '#F0FDF4',
                                                color: isFlipped ? '#1D4ED8' : '#166534',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                            }}
                                        />
                                    </Stack>
                                </Stack>

                                {cardData && (
                                    <>
                                        {/*
                                         * CSS 3D flip card pattern:
                                         * - Outer box sets the perspective and the clipped display size (63% of 1013×638)
                                         * - Inner box holds BOTH faces; it rotates as a unit
                                         * - Each face is position:absolute at full 1013×638, then scale(0.63) from top-left
                                         * - Back face gets an additional rotateY(180deg) so it starts hidden
                                         * - The back face's marginLeft compensates for the scale+rotation offset
                                         */}
                                        <Box
                                            onClick={() => setIsFlipped(f => !f)}
                                            title={isFlipped ? 'Click to see front' : 'Click to see back'}
                                            sx={{
                                                width:  Math.round(1013 * 0.63),
                                                height: Math.round(638  * 0.63),
                                                mx: 'auto',
                                                perspective: '2000px',
                                                cursor: 'pointer',
                                                userSelect: 'none',
                                            }}
                                        >
                                            {/* Rotating inner container */}
                                            <Box
                                                sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                    position: 'relative',
                                                    transformStyle: 'preserve-3d',
                                                    transition: 'transform 0.65s cubic-bezier(0.4, 0.2, 0.2, 1)',
                                                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                                }}
                                            >
                                                {/* FRONT face */}
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: 1013,
                                                        height: 638,
                                                        transformOrigin: 'top left',
                                                        transform: 'scale(0.63)',
                                                        backfaceVisibility: 'hidden',
                                                        WebkitBackfaceVisibility: 'hidden',
                                                        borderRadius: '18px',
                                                        overflow: 'hidden',
                                                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                                                    }}
                                                >
                                                    <StudentCardFront student={cardData} />
                                                </Box>

                                                {/* BACK face — pre-rotated 180° so it's hidden until flip */}
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: 1013,
                                                        height: 638,
                                                        transformOrigin: 'top left',
                                                        // scale first, then rotate; offset left by full width so it sits in place
                                                        transform: `translateX(${Math.round(1013 * 0.63)}px) scale(0.63) rotateY(180deg)`,
                                                        backfaceVisibility: 'hidden',
                                                        WebkitBackfaceVisibility: 'hidden',
                                                        borderRadius: '18px',
                                                        overflow: 'hidden',
                                                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                                                    }}
                                                >
                                                    <StudentCardBack student={cardData} qrCodeUrl={qrCodeUrl} />
                                                </Box>
                                            </Box>
                                        </Box>

                                        <Typography
                                            variant="caption"
                                            textAlign="center"
                                            display="block"
                                            color="text.secondary"
                                            sx={{ mt: 2, transition: 'opacity 0.3s' }}
                                        >
                                            {isFlipped
                                                ? 'Back of card — scan the QR code to verify this ID online.'
                                                : 'Click the card or tap "Back →" to flip and see the QR code.'}
                                        </Typography>

                                        {/* ── Download My ID button ────── */}
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            disabled={isExportingPdf}
                                            onClick={downloadIdPdf}
                                            sx={{ mt: 1.5, borderRadius: 2, fontWeight: 700, fontSize: '0.78rem', px: 3 }}
                                        >
                                            {isExportingPdf ? 'Generating PDF…' : '⬇ Download My ID (PDF)'}
                                        </Button>
                                    </>
                                )}
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
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                                    <Typography variant="h6" fontWeight={900}>Attendance Goal</Typography>
                                    <Button size="small" onClick={() => setAttendanceOpen(true)} sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                                        View Details
                                    </Button>
                                </Stack>
                                <Box
                                    sx={{ height: 260, width: '100%', position: 'relative', cursor: 'pointer' }}
                                    onClick={() => setAttendanceOpen(true)}
                                    title="Click to view attendance breakdown"
                                >
                                    <ResponsiveContainer width="100%" height={260}>
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

                            {/* Documents Hub - LIVE */}
                            <Paper sx={{ p: 4, borderRadius: 5, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                                    <Typography variant="h6" fontWeight={900}>Recent Documents</Typography>
                                    <DocIcon color="action" />
                                </Stack>
                                {documents.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 3, fontStyle: 'italic' }}>
                                        No documents uploaded yet.
                                    </Typography>
                                ) : (
                                    <Stack spacing={2}>
                                        {documents.slice(0, 4).map((doc) => (
                                            <Stack key={doc.id} direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <Box sx={{ bgcolor: '#F1F5F9', p: 1, borderRadius: 1.5 }}>
                                                        <DocIcon sx={{ fontSize: 18, color: '#64748B' }} />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={800}>{doc.name}</Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {doc.file_type} • {(doc.size / 1024).toFixed(0)} KB • {doc.created_at ? format(new Date(doc.created_at), 'MMM d') : '—'}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                                <IconButton
                                                    size="small"
                                                    onClick={async () => {
                                                        const { data } = await import('../lib/supabaseClient').then(m => m.supabase.storage.from('documents').createSignedUrl(doc.file_path, 60));
                                                        if (data?.signedUrl) window.open(data.signedUrl, '_blank');
                                                    }}
                                                >
                                                    <OpenInNewIcon fontSize="small" />
                                                </IconButton>
                                            </Stack>
                                        ))}
                                    </Stack>
                                )}
                            </Paper>


                            {/* Wallet / Payments – LIVE */}
                            <Paper sx={{ p: 4, borderRadius: 5, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                                    <Typography variant="h6" fontWeight={900}>Payments</Typography>
                                    <WalletIcon color="action" />
                                </Stack>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="caption" fontWeight={800} color="#94A3B8">Total Paid</Typography>
                                    <Typography variant="h4" fontWeight={900} color="primary.main">
                                        {payments.filter(p => p.status === 'PAID').reduce((s, p) => s + p.amount, 0).toLocaleString()} {payments[0]?.currency || '₸'}
                                    </Typography>
                                </Box>
                                <Divider sx={{ mb: 3 }} />
                                {payments.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary" fontStyle="italic">No payment records found.</Typography>
                                ) : (
                                    <Stack spacing={2}>
                                        {payments.slice(0, 4).map((p) => (
                                            <Stack key={p.id} direction="row" justifyContent="space-between" alignItems="center">
                                                <Box>
                                                    <Typography variant="body2" fontWeight={700}>{p.payment_type.replace(/_/g, ' ')}</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {p.payment_date ? format(new Date(p.payment_date), 'MMM d, yyyy') : '—'}
                                                    </Typography>
                                                </Box>
                                                <Chip
                                                    label={`${p.status === 'PAID' ? '-' : ''}${p.amount.toLocaleString()} ${p.currency || '₸'}`}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 800,
                                                        bgcolor: p.status === 'PAID' ? '#FEF2F2' : '#F0FDF4',
                                                        color: p.status === 'PAID' ? '#DC2626' : '#16A34A',
                                                    }}
                                                />
                                            </Stack>
                                        ))}
                                    </Stack>
                                )}
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

            {/* ── Real Biometric Liveness Modal ── */}
            <LivenessCheckModal
                open={livenessOpen}
                onClose={() => setLivenessOpen(false)}
                onSuccess={() => {
                    setLivenessStatus('verified');
                    setLivenessOpen(false);
                }}
            />

            {/* ── Attendance Detail Modal ── */}
            <AttendanceDetailModal
                open={attendanceOpen}
                onClose={() => setAttendanceOpen(false)}
                attendance={student.attendance || []}
                studentName={student.full_name || ''}
            />
        </Box>
    );
}
