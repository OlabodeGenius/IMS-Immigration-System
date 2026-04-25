import { Box, Typography, Grid, Paper, Stack, Button, CircularProgress } from '@mui/material';
import { Download as DownloadIcon, InsertDriveFile as FileIcon, DataUsage as DataIcon, Security as SecurityIcon } from '@mui/icons-material';
import { useState } from 'react';

export function ReportsTab() {
    const [generating, setGenerating] = useState<string | null>(null);

    const handleDownload = (reportName: string) => {
        setGenerating(reportName);
        setTimeout(() => {
            // Mock a download by creating a simple blob and Object URL
            const mockCsvContent = `Report,Date\n${reportName},${new Date().toISOString()}`;
            const blob = new Blob([mockCsvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${reportName.replace(/\s+/g, '_').toLowerCase()}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            setGenerating(null);
        }, 1200);
    };

    const reports = [
        { title: "National Active Visas", description: "Export a CSV of all active student visas nationwide.", icon: <DataIcon />, color: "#3B82F6" },
        { title: "Expired Visa Overstays", description: "Identify students with expired visas currently residing in the country.", icon: <FileIcon />, color: "#EF4444" },
        { title: "Full Audit Ledger", description: "Export the entire system security and action audit ledger.", icon: <SecurityIcon />, color: "#8B5CF6" },
        { title: "University Compliance", description: "Export compliance scores and metrics across all registered universities.", icon: <FileIcon />, color: "#10B981" },
    ];

    return (
        <Box>
            <Typography variant="h4" fontWeight={900} mb={1}>Reporting Hub</Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>
                Generate and download compliance, audit, and demographic reports.
            </Typography>

            <Grid container spacing={3}>
                {reports.map((report, idx) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                        <Paper 
                            elevation={0} 
                            sx={{ 
                                p: 3, 
                                borderRadius: 3, 
                                border: '1px solid #E2E8F0',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <Box sx={{ 
                                width: 48, 
                                height: 48, 
                                borderRadius: 2, 
                                bgcolor: `${report.color}15`, 
                                color: report.color,
                                display: 'grid',
                                placeItems: 'center',
                                mb: 2
                            }}>
                                {report.icon}
                            </Box>
                            
                            <Typography variant="subtitle1" fontWeight={700} mb={1}>
                                {report.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, mb: 3 }}>
                                {report.description}
                            </Typography>
                            
                            <Button 
                                variant="outlined" 
                                color="inherit"
                                fullWidth 
                                startIcon={generating === report.title ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                                disabled={generating === report.title}
                                onClick={() => handleDownload(report.title)}
                                sx={{ 
                                    borderRadius: '10px', 
                                    textTransform: 'none', 
                                    fontWeight: 600,
                                    borderColor: '#E2E8F0',
                                    '&:hover': {
                                        borderColor: '#CBD5E1',
                                        bgcolor: '#F8FAFC'
                                    }
                                }}
                            >
                                {generating === report.title ? 'Generating...' : 'Download CSV'}
                            </Button>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
