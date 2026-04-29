import { Box, Typography, Grid, Paper, Stack, Button, CircularProgress, Chip } from '@mui/material';
import {
    Download as DownloadIcon,
    InsertDriveFile as FileIcon,
    DataUsage as DataIcon,
    Security as SecurityIcon,
    Business as BusinessIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { exportToCsv } from '../../../lib/exportCsv';

// ─── Report definitions ────────────────────────────────────────────────────────
type ReportKey = 'active_visas' | 'overstays' | 'audit_ledger' | 'compliance';

interface ReportDef {
    key: ReportKey;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    badge?: string;
}

const REPORTS: ReportDef[] = [
    {
        key: 'active_visas',
        title: 'National Active Visas',
        description: 'Full list of all active student visas nationwide with student and institution details.',
        icon: <DataIcon />,
        color: '#3B82F6',
    },
    {
        key: 'overstays',
        title: 'Expired Visa Overstays',
        description: 'Students whose visas have already expired but are still marked ACTIVE in the system.',
        icon: <FileIcon />,
        color: '#EF4444',
        badge: 'Critical',
    },
    {
        key: 'audit_ledger',
        title: 'Full Audit Ledger',
        description: 'Complete system action log — who changed what, and when.',
        icon: <SecurityIcon />,
        color: '#8B5CF6',
    },
    {
        key: 'compliance',
        title: 'University Compliance',
        description: 'Per-institution metrics: student count, active vs expiring visas, compliance score.',
        icon: <BusinessIcon />,
        color: '#10B981',
    },
];

// ─── Fetchers ─────────────────────────────────────────────────────────────────
async function fetchActiveVisas() {
    const { data, error } = await supabase
        .from('visas')
        .select(`
            visa_number,
            visa_type,
            status,
            start_date,
            end_date,
            student:students (
                full_name,
                nationality,
                passport_number,
                email,
                institution:institutions ( name )
            )
        `)
        .eq('status', 'ACTIVE')
        .order('end_date', { ascending: true });

    if (error) throw error;

    return (data || []).map((v: any) => ({
        'Student Name': v.student?.full_name ?? '',
        'Nationality': v.student?.nationality ?? '',
        'Passport': v.student?.passport_number ?? '',
        'Email': v.student?.email ?? '',
        'Institution': v.student?.institution?.name ?? '',
        'Visa Number': v.visa_number ?? '',
        'Visa Type': v.visa_type,
        'Status': v.status,
        'Start Date': v.start_date,
        'End Date': v.end_date,
    }));
}

async function fetchOverstays() {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('visas')
        .select(`
            visa_number,
            visa_type,
            end_date,
            student:students (
                full_name,
                nationality,
                passport_number,
                email,
                institution:institutions ( name )
            )
        `)
        .eq('status', 'ACTIVE')
        .lt('end_date', today)
        .order('end_date', { ascending: true });

    if (error) throw error;

    return (data || []).map((v: any) => {
        const expiry = new Date(v.end_date);
        const daysOverdue = Math.floor((Date.now() - expiry.getTime()) / (1000 * 60 * 60 * 24));
        return {
            'Student Name': v.student?.full_name ?? '',
            'Nationality': v.student?.nationality ?? '',
            'Passport': v.student?.passport_number ?? '',
            'Email': v.student?.email ?? '',
            'Institution': v.student?.institution?.name ?? '',
            'Visa Number': v.visa_number ?? '',
            'Visa Type': v.visa_type,
            'Expiry Date': v.end_date,
            'Days Overdue': daysOverdue,
        };
    });
}

async function fetchAuditLedger() {
    const { data, error } = await supabase
        .from('audit_logs')
        .select(`
            action,
            table_name,
            record_id,
            created_at,
            user_id
        `)
        .order('created_at', { ascending: false })
        .limit(5000);

    if (error) throw error;

    return (data || []).map((log: any) => ({
        'Timestamp': new Date(log.created_at).toLocaleString(),
        'Action': log.action,
        'Table': log.table_name,
        'Record ID': log.record_id ?? '',
        'User ID': log.user_id ?? '',
    }));
}

async function fetchCompliance() {
    const today = new Date();
    const in30 = new Date();
    in30.setDate(today.getDate() + 30);

    const { data: institutions, error } = await supabase
        .from('institutions')
        .select(`
            id,
            name,
            institution_type,
            contact_email,
            students ( id )
        `);

    if (error) throw error;

    // For each institution fetch visa expiry counts separately
    const rows = await Promise.all((institutions || []).map(async (inst: any) => {
        const studentIds = (inst.students || []).map((s: any) => s.id);
        const total = studentIds.length;

        if (total === 0) {
            return {
                'Institution': inst.name,
                'Type': inst.institution_type ?? '',
                'Contact': inst.contact_email ?? '',
                'Total Students': 0,
                'Active Visas': 0,
                'Expiring ≤30 Days': 0,
                'Expiring ≤7 Days': 0,
                'Compliance Score': 'N/A',
            };
        }

        const [activeRes, exp30Res, exp7Res] = await Promise.all([
            supabase.from('visas').select('id', { count: 'exact', head: true })
                .in('student_id', studentIds).eq('status', 'ACTIVE'),
            supabase.from('visas').select('id', { count: 'exact', head: true })
                .in('student_id', studentIds).eq('status', 'ACTIVE')
                .lte('end_date', in30.toISOString().split('T')[0])
                .gte('end_date', today.toISOString().split('T')[0]),
            supabase.from('visas').select('id', { count: 'exact', head: true })
                .in('student_id', studentIds).eq('status', 'ACTIVE')
                .lte('end_date', new Date(today.getTime() + 7 * 86400000).toISOString().split('T')[0])
                .gte('end_date', today.toISOString().split('T')[0]),
        ]);

        const active = activeRes.count ?? 0;
        const exp30 = exp30Res.count ?? 0;
        const exp7 = exp7Res.count ?? 0;

        // Score: penalise 5pt per expiring ≤30d, 15pt per ≤7d
        const rawScore = Math.max(0, 100 - exp7 * 15 - exp30 * 5);
        const score = active > 0 ? `${rawScore}%` : 'N/A';

        return {
            'Institution': inst.name,
            'Type': inst.institution_type ?? '',
            'Contact': inst.contact_email ?? '',
            'Total Students': total,
            'Active Visas': active,
            'Expiring ≤30 Days': exp30,
            'Expiring ≤7 Days': exp7,
            'Compliance Score': score,
        };
    }));

    return rows;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function ReportsTab() {
    const [generating, setGenerating] = useState<ReportKey | null>(null);
    const [counts, setCounts] = useState<Partial<Record<ReportKey, number>>>({});
    const [errors, setErrors] = useState<Partial<Record<ReportKey, string>>>({});

    const handleDownload = async (report: ReportDef) => {
        setGenerating(report.key);
        setErrors(prev => ({ ...prev, [report.key]: undefined }));

        try {
            let rows: Record<string, any>[] = [];

            switch (report.key) {
                case 'active_visas': rows = await fetchActiveVisas(); break;
                case 'overstays':    rows = await fetchOverstays();   break;
                case 'audit_ledger': rows = await fetchAuditLedger(); break;
                case 'compliance':   rows = await fetchCompliance();  break;
            }

            setCounts(prev => ({ ...prev, [report.key]: rows.length }));

            if (rows.length === 0) {
                setErrors(prev => ({ ...prev, [report.key]: 'No data found for this report.' }));
                return;
            }

            exportToCsv(report.key, rows);
        } catch (err: any) {
            console.error(`Report "${report.title}" failed:`, err);
            setErrors(prev => ({ ...prev, [report.key]: err.message || 'Query failed' }));
        } finally {
            setGenerating(null);
        }
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight={900} mb={1}>Reporting Hub</Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>
                Generate and download compliance, audit, and demographic reports from live data.
            </Typography>

            <Grid container spacing={3}>
                {REPORTS.map((report) => {
                    const isActive = generating === report.key;
                    const rowCount = counts[report.key];
                    const errMsg = errors[report.key];

                    return (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={report.key}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    border: errMsg
                                        ? '1px solid #FCA5A5'
                                        : '1px solid #E2E8F0',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'box-shadow 0.2s',
                                    '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.06)' },
                                }}
                            >
                                {/* Icon + badge */}
                                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={2}>
                                    <Box sx={{
                                        width: 48, height: 48, borderRadius: 2,
                                        bgcolor: `${report.color}15`,
                                        color: report.color,
                                        display: 'grid', placeItems: 'center',
                                    }}>
                                        {report.icon}
                                    </Box>
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                        {report.badge && (
                                            <Chip
                                                label={report.badge}
                                                size="small"
                                                sx={{ bgcolor: '#FEE2E2', color: '#991B1B', fontWeight: 700, height: 20, fontSize: '0.7rem' }}
                                            />
                                        )}
                                        {rowCount !== undefined && !errMsg && (
                                            <Chip
                                                label={`${rowCount} rows`}
                                                size="small"
                                                sx={{ bgcolor: '#F0FDF4', color: '#166534', fontWeight: 700, height: 20, fontSize: '0.7rem' }}
                                            />
                                        )}
                                    </Stack>
                                </Stack>

                                <Typography variant="subtitle1" fontWeight={700} mb={0.5}>
                                    {report.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, mb: 2, lineHeight: 1.6 }}>
                                    {report.description}
                                </Typography>

                                {errMsg && (
                                    <Typography variant="caption" color="error" sx={{ mb: 1.5, display: 'block', fontWeight: 600 }}>
                                        ⚠ {errMsg}
                                    </Typography>
                                )}

                                <Button
                                    variant="outlined"
                                    color="inherit"
                                    fullWidth
                                    startIcon={isActive
                                        ? <CircularProgress size={16} color="inherit" />
                                        : <DownloadIcon sx={{ color: report.color }} />}
                                    disabled={isActive}
                                    onClick={() => handleDownload(report)}
                                    sx={{
                                        borderRadius: '10px',
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        borderColor: isActive ? '#CBD5E1' : '#E2E8F0',
                                        '&:hover': {
                                            borderColor: report.color,
                                            bgcolor: `${report.color}08`,
                                        },
                                    }}
                                >
                                    {isActive ? 'Generating…' : 'Export CSV'}
                                </Button>
                            </Paper>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
}
