import { Box, Typography, Stack, LinearProgress, CircularProgress, Paper, Tooltip } from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';
import { useStudentsByInstitution } from '../../../hooks/useAnalytics';

interface InstitutionStudentsChartProps {
    city: string;
}

export function InstitutionStudentsChart({ city }: InstitutionStudentsChartProps) {
    const { data = [], isLoading } = useStudentsByInstitution(city);

    const maxStudents = data.length > 0 ? Math.max(...data.map(d => d.students)) : 1;

    // Shorten long university names for display
    const shortenName = (name: string) => {
        if (name.length <= 30) return name;
        // Try acronym-style abbreviation first
        const initials = name
            .split(/[\s\-()]+/)
            .filter(w => /^[A-Z]/.test(w))
            .map(w => w[0])
            .join('');
        return initials.length >= 2 ? initials : name.slice(0, 27) + '…';
    };

    return (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', minHeight: 200 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={2.5}>
                <Box sx={{ color: 'primary.main' }}><SchoolIcon fontSize="small" /></Box>
                <Typography variant="subtitle1" fontWeight={700}>
                    Students by Institution{city && city !== 'National' ? ` — ${city}` : ' (National)'}
                </Typography>
            </Stack>

            {isLoading ? (
                <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress size={24} />
                </Box>
            ) : data.length === 0 ? (
                <Box py={3} textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                        No institutions found
                        {city && city !== 'National' ? ` in ${city}` : ''}.
                    </Typography>
                    <Typography variant="caption" color="text.disabled" display="block" mt={0.5}>
                        Run the city migration in Supabase to populate city data.
                    </Typography>
                </Box>
            ) : (
                <Stack spacing={1.5}>
                    {data.map((inst) => (
                        <Tooltip key={inst.name} title={inst.name} placement="top-start">
                            <Box>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                                    <Typography
                                        variant="body2"
                                        fontWeight={600}
                                        noWrap
                                        sx={{ maxWidth: '75%', color: 'text.primary' }}
                                    >
                                        {shortenName(inst.name)}
                                    </Typography>
                                    <Typography variant="body2" fontWeight={700} color="primary.main">
                                        {inst.students.toLocaleString()}
                                    </Typography>
                                </Stack>
                                <LinearProgress
                                    variant="determinate"
                                    value={maxStudents > 0 ? (inst.students / maxStudents) * 100 : 0}
                                    sx={{
                                        height: 10,
                                        borderRadius: 5,
                                        bgcolor: '#F1F5F9',
                                        '& .MuiLinearProgress-bar': {
                                            borderRadius: 5,
                                            background: 'linear-gradient(90deg, #3B82F6, #6366F1)',
                                        }
                                    }}
                                />
                            </Box>
                        </Tooltip>
                    ))}
                </Stack>
            )}
        </Paper>
    );
}
