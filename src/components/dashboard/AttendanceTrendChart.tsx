import { useState, useEffect } from "react";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { Box, Typography, CircularProgress, alpha, useTheme } from '@mui/material';

interface AttendanceTrendChartProps {
    data: { date: string; rate: number }[];
    isLoading: boolean;
    title?: string;
    height?: number;
}

export function AttendanceTrendChart({ data, isLoading, title = "Student Presence Trend", height = 300 }: AttendanceTrendChartProps) {
    const theme = useTheme();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // Delay mounting the chart until the layout has settled
        const timer = setTimeout(() => setIsMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading || !isMounted) {
        return (
            <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.primary.main, 0.02), borderRadius: 2 }}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.primary.main, 0.02), borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">No attendance data available for the period</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', height, position: 'relative', display: 'flex', flexDirection: 'column' }}>
            {title && (
                <Typography variant="subtitle2" fontWeight={700} mb={2} color="text.secondary" sx={{ flexShrink: 0 }}>
                    {title}
                </Typography>
            )}
            <Box sx={{ width: '100%' }}>
                <ResponsiveContainer width="100%" height={height - 60}>
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.1} />
                                <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#64748B' }}
                            dy={10}
                        />
                        <YAxis
                            domain={[0, 100]}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#64748B' }}
                            tickFormatter={(val) => `${val}%`}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '8px',
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                fontSize: '12px'
                            }}
                            formatter={(value: number | string | undefined) => [`${value ?? 0}%`, 'Presence Rate']}
                        />
                        <Area
                            type="monotone"
                            dataKey="rate"
                            stroke={theme.palette.primary.main}
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRate)"
                            dot={{ r: 4, fill: theme.palette.primary.main, strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </Box>
        </Box>
    );
}
