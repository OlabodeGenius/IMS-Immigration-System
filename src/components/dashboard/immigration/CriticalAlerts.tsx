import { Paper, Typography, Box, Stack, alpha, Skeleton, Button } from '@mui/material';
import {
    GppBad as FraudIcon,
    EventBusy as OverdueIcon,
    ErrorOutline as AlertIcon
} from '@mui/icons-material';
import { useSystemCriticalAlerts } from '../../../hooks/useAnalytics';
import { useNavigate } from 'react-router-dom';

export function CriticalAlerts() {
    const { data: alerts = [], isLoading } = useSystemCriticalAlerts();
    const navigate = useNavigate();

    const getIcon = (type: string) => {
        switch (type) {
            case 'VISA_ALERT': return <OverdueIcon sx={{ color: '#EF4444' }} />;
            case 'FRAUD': return <FraudIcon sx={{ color: '#EF4444' }} />;
            default: return <AlertIcon sx={{ color: '#F59E0B' }} />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'VISA_ALERT':
            case 'FRAUD': return '#FEF2F2';
            default: return '#FFFBEB';
        }
    };

    return (
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', height: '100%' }}>
            <Typography variant="h6" fontWeight={800} color="text.primary" mb={4}>
                Critical Alerts
            </Typography>

            {isLoading ? (
                <Stack spacing={2}>
                    {[1, 2, 3].map((i) => (
                        <Box
                            key={i}
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                border: '1px solid #E2E8F0',
                                bgcolor: '#F8FAFC',
                                display: 'flex',
                                gap: 2
                            }}
                        >
                            <Skeleton variant="circular" width={48} height={48} sx={{ flexShrink: 0 }} />
                            <Box sx={{ flexGrow: 1 }}>
                                <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
                                <Skeleton variant="text" width="40%" height={16} />
                                <Skeleton variant="text" width="70%" height={16} />
                            </Box>
                        </Box>
                    ))}
                </Stack>
            ) : alerts.length === 0 ? (
                <Typography variant="body2" color="text.secondary" align="center" py={4}>
                    No critical alerts at this time.
                </Typography>
            ) : (
                <Stack spacing={2}>
                    {alerts.map((alert) => (
                        <Box
                            key={alert.id}
                            onClick={() => navigate(`/dashboard?tab=students&search=${alert.studentId}`)}
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                border: `1px solid ${alpha(getIcon(alert.type).props.sx.color, 0.1)}`,
                                bgcolor: getBgColor(alert.type),
                                display: 'flex',
                                gap: 2,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                }
                            }}
                        >
                            <Box sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                bgcolor: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}>
                                {getIcon(alert.type)}
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="subtitle2" fontWeight={800} color="#1E293B" lineHeight={1.2} mb={0.5}>
                                    {alert.title}
                                </Typography>
                                <Typography variant="caption" fontWeight={700} color="#EF4444" display="block">
                                    Student ID: {alert.studentId}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                    {alert.time} - {alert.location}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Button size="small" variant="text" color="inherit" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                                    Review
                                </Button>
                            </Box>
                        </Box>
                    ))}
                </Stack>
            )}
        </Paper>
    );
}
