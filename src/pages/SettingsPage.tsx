import { Container, Typography, Paper, Box, Stack, Divider, Switch, List, ListItem, ListItemText, ListItemSecondaryAction, Avatar, Button, ListItemIcon } from "@mui/material";
import { useAuth } from "../auth/AuthProvider";
import {
    Notifications as NotificationsIcon,
    Security as SecurityIcon,
    Language as LanguageIcon,
    Palette as ThemeIcon
} from "@mui/icons-material";

export default function SettingsPage() {
    const { profile } = useAuth();

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box mb={4}>
                <Typography variant="h4" fontWeight={900} color="#1E293B">Account Settings</Typography>
                <Typography variant="body1" color="text.secondary">Manage your preferences and system configurations.</Typography>
            </Box>

            <Stack spacing={3}>
                {/* Profile Section */}
                <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                    <Stack direction="row" spacing={3} alignItems="center">
                        <Avatar
                            src={`https://ui-avatars.com/api/?name=${profile?.full_name || 'User'}&background=random`}
                            sx={{ width: 80, height: 80, border: '4px solid #F1F5F9' }}
                        />
                        <Box flexGrow={1}>
                            <Typography variant="h6" fontWeight={800}>{profile?.full_name || 'Loading...'}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                                {profile?.role?.toLowerCase().replace('_', ' ') || 'User'}
                            </Typography>
                        </Box>
                        <Button variant="outlined" sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}>Edit Profile</Button>
                    </Stack>
                </Paper>

                {/* Settings Groups */}
                <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #E2E8F0', overflow: 'hidden', bgcolor: '#FFFFFF' }}>
                    <List disablePadding>
                        <ListItem sx={{ px: 4, py: 3 }}>
                            <ListItemIcon sx={{ minWidth: 48, color: 'primary.main' }}>
                                <NotificationsIcon />
                            </ListItemIcon>
                            <ListItemText
                                primary={<Typography fontWeight={700}>Email Notifications</Typography>}
                                secondary="Receive alerts about visa expiries and compliance issues."
                            />
                            <ListItemSecondaryAction>
                                <Switch defaultChecked />
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ px: 4, py: 3 }}>
                            <ListItemIcon sx={{ minWidth: 48, color: 'primary.main' }}>
                                <SecurityIcon />
                            </ListItemIcon>
                            <ListItemText
                                primary={<Typography fontWeight={700}>Two-Factor Authentication</Typography>}
                                secondary="Add an extra layer of security to your account."
                            />
                            <ListItemSecondaryAction>
                                <Switch />
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ px: 4, py: 3 }}>
                            <ListItemIcon sx={{ minWidth: 48, color: 'primary.main' }}>
                                <LanguageIcon />
                            </ListItemIcon>
                            <ListItemText
                                primary={<Typography fontWeight={700}>Language</Typography>}
                                secondary="English (US)"
                            />
                            <ListItemSecondaryAction>
                                <Button size="small" sx={{ textTransform: 'none', fontWeight: 700 }}>Change</Button>
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ px: 4, py: 3 }}>
                            <ListItemIcon sx={{ minWidth: 48, color: 'primary.main' }}>
                                <ThemeIcon />
                            </ListItemIcon>
                            <ListItemText
                                primary={<Typography fontWeight={700}>Dark Mode</Typography>}
                                secondary="Switch between light and dark themes."
                            />
                            <ListItemSecondaryAction>
                                <Switch />
                            </ListItemSecondaryAction>
                        </ListItem>
                    </List>
                </Paper>

                <Box display="flex" justifyContent="flex-end">
                    <Button variant="contained" sx={{ px: 4, py: 1.5, borderRadius: 2.5, fontWeight: 800, textTransform: 'none' }}>
                        Save Changes
                    </Button>
                </Box>
            </Stack>
        </Container>
    );
}
