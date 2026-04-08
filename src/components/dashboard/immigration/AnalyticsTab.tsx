import { Box, Typography, Grid, Paper, CircularProgress, Stack } from "@mui/material";
import { 
    useGlobalKPIs, 
    useStudentsByNationality, 
    useStudentsByInstitution 
} from "../../../hooks/useAnalytics";
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
    PieChart, Pie, Legend
} from 'recharts';

export function AnalyticsTab() {
    const { data: summary, isLoading: isLoadingSummary } = useGlobalKPIs();
    const { data: nationalityStats, isLoading: isLoadingStats } = useStudentsByNationality();
    const { data: institutionStats, isLoading: isLoadingInstitutions } = useStudentsByInstitution();

    if (isLoadingSummary || isLoadingStats || isLoadingInstitutions) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6'];

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight={900} color="#1E293B" sx={{ fontFamily: 'Outfit' }}>
                    National & Aggregate Analytics
                </Typography>
            </Stack>

            <Grid container spacing={3} mb={4}>
                <Grid size={{ xs: 12, md: 3 }}>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 4, bgcolor: '#EFF6FF' }}>
                        <Typography variant="body2" fontWeight={700} color="#3B82F6" mb={1} textTransform="uppercase">Total Active Students</Typography>
                        <Typography variant="h3" fontWeight={900} color="#1E293B">{summary?.total_students || 0}</Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 4, bgcolor: '#F0FDF4' }}>
                        <Typography variant="body2" fontWeight={700} color="#10B981" mb={1} textTransform="uppercase">Valid Visas</Typography>
                        <Typography variant="h3" fontWeight={900} color="#1E293B">{summary?.active_visas || 0}</Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 4, bgcolor: '#FEF2F2' }}>
                        <Typography variant="body2" fontWeight={700} color="#EF4444" mb={1} textTransform="uppercase">Overdue Visas</Typography>
                        <Typography variant="h3" fontWeight={900} color="#1E293B">{summary?.overdue_notifications || 0}</Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 4, bgcolor: '#FFFBEB' }}>
                        <Typography variant="body2" fontWeight={700} color="#F59E0B" mb={1} textTransform="uppercase">High Risk Profiles</Typography>
                        <Typography variant="h3" fontWeight={900} color="#1E293B">{summary?.high_risk_alerts || 0}</Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Grid container spacing={4}>
                {/* Top Nationalities Chart */}
                <Grid size={{ xs: 12, lg: 6 }}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 5, border: '1px solid #E2E8F0', height: '100%' }}>
                        <Typography variant="h6" fontWeight={900} mb={4} color="#1E293B">
                            Student Demographics (Top Nationalities)
                        </Typography>
                        <Box sx={{ height: 320, width: '100%' }}>
                            <ResponsiveContainer>
                                <BarChart data={nationalityStats} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#64748B', fontWeight: 600, fontSize: 13 }} 
                                        dy={10} 
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#64748B', fontWeight: 600, fontSize: 13 }} 
                                    />
                                    <Tooltip 
                                        cursor={{ fill: '#F1F5F9' }} 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} 
                                    />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
                                        {nationalityStats?.map((_, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                {/* Institution Distribution Chart */}
                <Grid size={{ xs: 12, lg: 6 }}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 5, border: '1px solid #E2E8F0', height: '100%' }}>
                        <Typography variant="h6" fontWeight={900} mb={4} color="#1E293B">
                            Immigrant Distribution by Institution
                        </Typography>
                        <Box sx={{ height: 320, width: '100%', display: 'flex', alignItems: 'center' }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={institutionStats?.slice(0, 5)} // Show top 5
                                        dataKey="students"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                        labelLine={false}
                                    >
                                        {institutionStats?.slice(0, 5).map((_, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
