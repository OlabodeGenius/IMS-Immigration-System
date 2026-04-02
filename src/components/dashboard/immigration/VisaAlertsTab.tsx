import { Box, Typography } from '@mui/material';
import { CriticalAlerts } from './CriticalAlerts';

export function VisaAlertsTab() {
    return (
        <Box>
            <Typography variant="h4" fontWeight={900} mb={1}>System Alerts</Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>
                Real-time critical alerts, including expiring visas and compliance issues.
            </Typography>

            <Box sx={{ maxWidth: 600 }}>
                {/* Reusing the exact same beautifully styled component from the Overview dashboard */}
                <CriticalAlerts />
            </Box>
        </Box>
    );
}
