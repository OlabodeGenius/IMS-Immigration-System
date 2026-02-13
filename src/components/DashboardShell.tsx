import React from 'react';
import {
    Box,
    Drawer,
    List,
    Typography,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Avatar,
    Stack,
    alpha,
    useTheme,
    Button
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Assessment as AssessmentIcon,
    Logout as LogoutIcon,
    Business as BusinessIcon,
    FactCheck as VerifyIcon,
    PersonAdd as PersonAddIcon,
    Settings as SettingsIcon,
    Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { useInstitution } from '../hooks/useInstitutions';

const drawerWidth = 260;

interface DashboardShellProps {
    children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { profile, signOut } = useAuth();
    const { data: institution } = useInstitution(profile?.institution_id || '');

    const isImmigration = profile?.role === 'IMMIGRATION';

    const menuItems = isImmigration ? [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard?tab=overview' },
        { text: 'Students', icon: <PeopleIcon />, path: '/students' },
        { text: 'Universities', icon: <BusinessIcon />, path: '/dashboard?tab=institutions' },
        { text: 'Reports', icon: <AssessmentIcon />, path: '/dashboard?tab=reports' },
        { text: 'Alerts', icon: <NotificationsIcon />, path: '/dashboard?tab=alerts' },
        { text: 'Settings', icon: <SettingsIcon />, path: '/dashboard?tab=settings' },
    ] : [
        { text: 'Overview', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Students', icon: <PeopleIcon />, path: '/students' },
        { text: 'Register Student', icon: <PersonAddIcon />, path: '/dashboard?tab=register' },
        { text: 'Attendance', icon: <VerifyIcon />, path: '/dashboard?tab=attendance' },
        { text: 'Alerts', icon: <NotificationsIcon />, path: '/dashboard?tab=alerts' },
        { text: 'Settings', icon: <SettingsIcon />, path: '/dashboard?tab=settings' },
    ];

    return (
        <Box sx={{ display: 'flex', bgcolor: '#F8FAFC', minHeight: '100vh', width: '100%' }}>
            {/* Sidebar */}
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        borderRight: '1px solid #E2E8F0',
                        bgcolor: '#FFFFFF',
                        display: 'flex',
                        flexDirection: 'column'
                    },
                }}
            >
                {/* User Profile Section (Mockup Style) */}
                <Box sx={{ p: 4, mb: 1 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                            src={`https://ui-avatars.com/api/?name=${profile?.full_name || 'User'}&background=random`}
                            sx={{ width: 48, height: 48, border: '2px solid #F1F5F9' }}
                        >
                            {(profile?.full_name || 'A').charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle2" fontWeight={800} color="#1E293B" lineHeight={1.2}>
                                {profile?.full_name || "A. Kairatova"}
                            </Typography>
                            <Typography variant="caption" fontWeight={600} color="text.secondary">
                                {isImmigration ? "Immigration Officer" : (institution?.name || "University Admin")}
                            </Typography>
                        </Box>
                    </Stack>
                </Box>

                <List sx={{ px: 2, flexGrow: 1 }}>
                    {menuItems.map((item) => {
                        const searchParams = new URLSearchParams(location.search);
                        const currentTab = searchParams.get('tab') || 'overview';
                        const itemUrl = new URL(item.path, window.location.origin);
                        const itemTab = itemUrl.searchParams.get('tab');

                        const isPathMatch = location.pathname === itemUrl.pathname;
                        const isTabMatch = !itemTab || itemTab === currentTab;
                        const isActive = isPathMatch && isTabMatch;

                        return (
                            <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 0.5 }}>
                                <ListItemButton
                                    onClick={() => navigate(item.path)}
                                    sx={{
                                        minHeight: 48,
                                        px: 2.5,
                                        borderRadius: 2,
                                        bgcolor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                        color: isActive ? theme.palette.primary.main : '#64748B',
                                        position: 'relative',
                                        '&:hover': {
                                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                                        },
                                        ...(isActive && {
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                left: 0,
                                                top: '20%',
                                                bottom: '20%',
                                                width: 4,
                                                bgcolor: 'primary.main',
                                                borderRadius: '0 4px 4px 0'
                                            }
                                        })
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 0,
                                            mr: 2,
                                            justifyContent: 'center',
                                            color: isActive ? theme.palette.primary.main : 'inherit',
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.text}
                                        sx={{
                                            '& .MuiTypography-root': {
                                                fontWeight: isActive ? 800 : 500,
                                                fontSize: '0.95rem'
                                            }
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>

                {/* Bottom Section */}
                <Box sx={{ px: 2, pb: 4 }}>
                    {!isImmigration && (
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            startIcon={<PersonAddIcon />}
                            onClick={() => navigate('/dashboard?tab=register')}
                            sx={{
                                borderRadius: 3,
                                py: 1.5,
                                fontWeight: 800,
                                textTransform: 'none',
                                mb: 3,
                                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
                                fontSize: '0.9rem'
                            }}
                        >
                            New Student Record
                        </Button>
                    )}

                    <List disablePadding>
                        <ListItem disablePadding sx={{ display: 'block', mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => navigate('/dashboard?tab=settings')}
                                sx={{
                                    borderRadius: 2,
                                    px: 2,
                                    color: (new URLSearchParams(location.search).get('tab') === 'settings') ? 'primary.main' : '#64748B',
                                    bgcolor: (new URLSearchParams(location.search).get('tab') === 'settings') ? alpha(theme.palette.primary.main, 0.1) : 'transparent'
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 0, mr: 2, color: 'inherit' }}>
                                    <SettingsIcon sx={{ fontSize: 20 }} />
                                </ListItemIcon>
                                <ListItemText primary="Settings" sx={{ '& .MuiTypography-root': { fontWeight: 500, fontSize: '0.9rem' } }} />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding sx={{ display: 'block', mb: 0.5 }}>
                            <ListItemButton onClick={() => window.open('https://help.ims.kz', '_blank')} sx={{ borderRadius: 2, px: 2, color: '#64748B' }}>
                                <ListItemIcon sx={{ minWidth: 0, mr: 2, color: 'inherit' }}>
                                    <VerifyIcon sx={{ fontSize: 20 }} />
                                </ListItemIcon>
                                <ListItemText primary="Help Center" sx={{ '& .MuiTypography-root': { fontWeight: 500, fontSize: '0.9rem' } }} />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding sx={{ display: 'block' }}>
                            <ListItemButton
                                onClick={signOut}
                                sx={{
                                    borderRadius: 2,
                                    px: 2,
                                    color: 'error.main',
                                    '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.05) }
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 0, mr: 2, color: 'inherit' }}>
                                    <LogoutIcon sx={{ fontSize: 20 }} />
                                </ListItemIcon>
                                <ListItemText primary="Sign Out" sx={{ '& .MuiTypography-root': { fontWeight: 500, fontSize: '0.9rem' } }} />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Box>
            </Drawer>

            {/* Main Content Area */}
            <Box component="main" sx={{ flexGrow: 1, p: 6, width: `calc(100% - ${drawerWidth}px)`, minHeight: '100vh', bgcolor: '#F8FAFC' }}>
                {children}
            </Box>
        </Box>
    );
}
