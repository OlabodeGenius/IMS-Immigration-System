import { useState, useMemo } from 'react';
import {
    Box,
    Paper,
    Typography,
    Stack,
    Chip,
    TextField,
    InputAdornment,
    CircularProgress,
    Avatar,
    Divider,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Search as SearchIcon,
    Refresh as RefreshIcon,
    AddCircle as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Security as SecurityIcon,
    History as HistoryIcon
} from '@mui/icons-material';
import { useAuditLogs, type AuditLogEntry } from '../../../hooks/useAuditLogs';
import { format, isToday, isYesterday, parseISO } from 'date-fns';

const ActionIcon = ({ action }: { action: string }) => {
    switch (action) {
        case 'INSERT':
            return <Avatar sx={{ bgcolor: 'success.light', width: 32, height: 32 }}><AddIcon fontSize="small" /></Avatar>;
        case 'UPDATE':
            return <Avatar sx={{ bgcolor: 'info.light', width: 32, height: 32 }}><EditIcon fontSize="small" /></Avatar>;
        case 'DELETE':
            return <Avatar sx={{ bgcolor: 'error.light', width: 32, height: 32 }}><DeleteIcon fontSize="small" /></Avatar>;
        default:
            return <Avatar sx={{ bgcolor: 'grey.300', width: 32, height: 32 }}><HistoryIcon fontSize="small" /></Avatar>;
    }
};

const formatEventDate = (dateString: string) => {
    const d = parseISO(dateString);
    if (isToday(d)) return `Today at ${format(d, 'HH:mm')}`;
    if (isYesterday(d)) return `Yesterday at ${format(d, 'HH:mm')}`;
    return format(d, 'MMM d, yyyy HH:mm');
};

const getActionColor = (action: string) => {
    switch (action) {
        case 'INSERT': return 'success';
        case 'UPDATE': return 'info';
        case 'DELETE': return 'error';
        default: return 'default';
    }
};

export default function AuditLedgerTab() {
    const { data: logs, isLoading, isRefetching, refetch } = useAuditLogs();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLogs = useMemo(() => {
        if (!logs) return [];
        return logs.filter(log => {
            const searchStr = searchTerm.toLowerCase();
            const actionMatch = log.action.toLowerCase().includes(searchStr);
            const tableMatch = log.table_name.toLowerCase().includes(searchStr);
            const userMatch = log.user?.full_name?.toLowerCase().includes(searchStr) || false;
            const instMatch = log.user?.institution?.name?.toLowerCase().includes(searchStr) || false;
            return actionMatch || tableMatch || userMatch || instMatch;
        });
    }, [logs, searchTerm]);

    return (
        <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
            {/* Header & Controls */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                    <Typography variant="h6" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SecurityIcon color="primary" /> Security & Compliance Ledger
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Real-time, immutable record of all data modifications across institutions.
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        size="small"
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                        }}
                        sx={{ bgcolor: 'white', borderRadius: 1 }}
                    />
                    <Tooltip title="Refresh Feed">
                        <IconButton
                            onClick={() => refetch()}
                            disabled={isRefetching}
                            sx={{ bgcolor: 'white', border: '1px solid #e2e8f0', p: 1 }}
                        >
                            <RefreshIcon sx={{ animation: isRefetching ? 'spin 1s linear infinite' : 'none' }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Ledger Feed */}
            <Paper sx={{ p: 0, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : filteredLogs.length === 0 ? (
                    <Box sx={{ textAlign: 'center', p: 8 }}>
                        <HistoryIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                        <Typography color="text.secondary">No audit logs found matching your criteria.</Typography>
                    </Box>
                ) : (
                    <Stack divider={<Divider />}>
                        {filteredLogs.map((log: AuditLogEntry) => (
                            <Box
                                key={log.id}
                                sx={{
                                    p: 2.5,
                                    display: 'flex',
                                    gap: 2,
                                    '&:hover': { bgcolor: '#f8fafc' },
                                    transition: 'background-color 0.2s'
                                }}
                            >
                                <Box sx={{ pt: 0.5 }}>
                                    <ActionIcon action={log.action} />
                                </Box>

                                <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                                        <Typography variant="subtitle2" fontWeight={700}>
                                            {log.user?.full_name || 'System / Unknown User'}
                                            <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1, fontWeight: 500 }}>
                                                ({log.user?.institution?.name || log.user?.role || 'SYSTEM'})
                                            </Typography>
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                            {formatEventDate(log.created_at)}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Chip
                                            label={log.action}
                                            size="small"
                                            color={getActionColor(log.action) as any}
                                            sx={{ height: 20, fontSize: '0.7rem', fontWeight: 800 }}
                                        />
                                        <Typography variant="body2" color="text.secondary">
                                            modified record in
                                        </Typography>
                                        <Chip
                                            label={log.table_name}
                                            size="small"
                                            variant="outlined"
                                            sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600, bgcolor: 'white' }}
                                        />
                                        <Typography variant="body2" color="text.secondary">
                                            (ID: {log.record_id.slice(0, 8)}...)
                                        </Typography>
                                    </Box>

                                    {/* Optional: Show Changes Diff Summary */}
                                    {log.changes && Object.keys(log.changes).length > 0 && (
                                        <Box sx={{
                                            mt: 1.5,
                                            p: 1.5,
                                            bgcolor: '#f1f5f9',
                                            borderRadius: 1,
                                            border: '1px solid #e2e8f0',
                                            fontFamily: 'monospace',
                                            fontSize: '0.75rem',
                                            color: '#475569',
                                            whiteSpace: 'pre-wrap',
                                            maxHeight: 100,
                                            overflow: 'auto'
                                        }}>
                                            {JSON.stringify(log.changes, null, 2)}
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        ))}
                    </Stack>
                )}
            </Paper>
        </Box>
    );
}
